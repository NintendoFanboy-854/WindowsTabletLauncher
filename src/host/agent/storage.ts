/**
 * 会话持久化：`agent.conversations`（数组）+ `agent.activeConversation`（当前会话 id）。
 *
 * 持久化只允许纯文本：音频 Blob / base64 永不写进 Message（契约 §7）。
 * `normalizeMessage` 用显式白名单重建对象，未知字段（包括任何音频字段）一律丢弃；
 * UI-only 的 `input` / `voicePeaks` / `voiceDurationSec` / `transcriptStatus` 允许落库（纯数字/枚举）。
 */

import type { Conversation, Message } from './types';

export const CONVERSATIONS_STORAGE_KEY = 'agent.conversations';
export const ACTIVE_CONVERSATION_STORAGE_KEY = 'agent.activeConversation';

const TITLE_MAX_CHARS = 24;
const MAX_VOICE_PEAKS = 24;

export function uid(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function createMessage(
  role: Message['role'],
  content: string,
  extra: Partial<Message> = {},
): Message {
  return {
    id: uid('msg'),
    role,
    content,
    createdAt: nowIso(),
    ...extra,
  };
}

/** 首条用户消息截断成标题 */
export function deriveConversationTitle(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (!flat) return '新对话';
  return flat.length > TITLE_MAX_CHARS ? `${flat.slice(0, TITLE_MAX_CHARS)}…` : flat;
}

export function createConversation(title = '新对话'): Conversation {
  const timestamp = nowIso();
  return {
    id: uid('conv'),
    title,
    messages: [],
    updatedAt: timestamp,
  };
}

function normalizePeaks(raw: unknown): number[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const peaks = raw
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
    .slice(0, MAX_VOICE_PEAKS)
    .map((value) => Math.min(1, Math.max(0, value)));
  return peaks.length >= 12 ? peaks : undefined;
}

interface NormalizeOptions {
  /** true = 从 localStorage 恢复（stale streaming→done、pending→failed）；false = 写盘前清洗 */
  restoring: boolean;
}

function normalizeWebSearchUsage(raw: unknown): Message['webSearchUsage'] | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const value = raw as Record<string, unknown>;
  const toolUsage = typeof value.toolUsage === 'number' ? value.toolUsage : null;
  const pageUsage = typeof value.pageUsage === 'number' ? value.pageUsage : null;
  if (toolUsage === null || pageUsage === null) return undefined;
  if (!Number.isFinite(toolUsage) || !Number.isFinite(pageUsage)) return undefined;
  return { toolUsage, pageUsage };
}

function normalizeMessage(raw: unknown, options: NormalizeOptions): Message | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Record<string, unknown>;
  const role = value.role;
  if (role !== 'user' && role !== 'assistant' && role !== 'tool') return null;
  if (typeof value.content !== 'string') return null;
  const message: Message = {
    id: typeof value.id === 'string' ? value.id : uid('msg'),
    role,
    content: value.content,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : nowIso(),
  };
  if (typeof value.reasoning === 'string') message.reasoning = value.reasoning;
  if (Array.isArray(value.toolCalls)) message.toolCalls = value.toolCalls as Message['toolCalls'];
  if (Array.isArray(value.sources)) message.sources = value.sources as Message['sources'];
  const webSearchUsage = normalizeWebSearchUsage(value.webSearchUsage);
  if (webSearchUsage) message.webSearchUsage = webSearchUsage;
  if (value.status === 'streaming' || value.status === 'done' || value.status === 'error' || value.status === 'aborted') {
    // 上次异常退出留下的 streaming 状态不算数，统一当作已完成（只在恢复时归一）
    message.status =
      options.restoring && value.status === 'streaming' ? 'done' : value.status;
  }

  // ---- UI-only 语音字段（纯数字/枚举；旧存档没有这些字段也合法） ----
  if (value.input === 'voice' || value.input === 'text') {
    message.input = value.input;
  }
  if (message.input === 'voice') {
    const peaks = normalizePeaks(value.voicePeaks);
    if (peaks) message.voicePeaks = peaks;
    if (
      typeof value.voiceDurationSec === 'number' &&
      Number.isFinite(value.voiceDurationSec) &&
      value.voiceDurationSec >= 0
    ) {
      message.voiceDurationSec = Math.min(600, value.voiceDurationSec);
    }
    if (value.transcriptStatus === 'ready') {
      // 有文字才算 ready；空内容的 ready 视为失败
      message.transcriptStatus = message.content.trim() ? 'ready' : 'failed';
    } else if (value.transcriptStatus === 'failed') {
      message.transcriptStatus = 'failed';
    } else if (value.transcriptStatus === 'pending' && !options.restoring) {
      // 写盘时保留进行中的状态；恢复时 pending 不会再等到 ASR 结果
      message.transcriptStatus = 'pending';
    } else {
      message.transcriptStatus = 'failed';
    }
  }
  return message;
}

export function normalizeConversation(
  raw: unknown,
  options: NormalizeOptions = { restoring: true },
): Conversation | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Record<string, unknown>;
  const id = typeof value.id === 'string' ? value.id : uid('conv');
  const messages = Array.isArray(value.messages)
    ? value.messages
        .map((item) => normalizeMessage(item, options))
        .filter((item): item is Message => item !== null)
    : [];
  return {
    id,
    title: typeof value.title === 'string' && value.title.trim() ? value.title : '新对话',
    messages,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : nowIso(),
  };
}

export function loadConversations(): Conversation[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeConversation(item, { restoring: true }))
      .filter((item): item is Conversation => item !== null);
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    // 写盘前再按白名单归一化一次：任何未知/音频字段都不可能进入 localStorage（契约 §7）
    const safe = conversations
      .map((conversation) => normalizeConversation(conversation, { restoring: false }))
      .filter((conversation): conversation is Conversation => conversation !== null);
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // 存储满/被禁用时静默：会话仍保留在内存里
  }
}

export function loadActiveConversationId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(ACTIVE_CONVERSATION_STORAGE_KEY);
}

export function saveActiveConversationId(id: string | null): void {
  if (typeof localStorage === 'undefined') return;
  if (id) localStorage.setItem(ACTIVE_CONVERSATION_STORAGE_KEY, id);
  else localStorage.removeItem(ACTIVE_CONVERSATION_STORAGE_KEY);
}
