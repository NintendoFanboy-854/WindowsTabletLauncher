/**
 * 会话持久化：`agent.conversations`（数组）+ `agent.activeConversation`（当前会话 id）。
 *
 * 持久化只允许纯文本：音频 Blob / base64 永不写进 Message（契约 §7）。
 * `normalizeMessage` 用显式白名单重建对象，未知字段（包括任何音频字段）一律丢弃；
 * UI-only 的 `input` / `voicePeaks` / `voiceDurationSec` / `transcriptStatus` 允许落库（纯数字/枚举）。
 */

import {
  blocksFromLegacy,
  closeBlocks,
  type AgentErrorAction,
  type Conversation,
  type Message,
  type NoticeCode,
  type ToolCallRecord,
  type TurnBlock,
} from './types';

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

// ---------- 轮次块的白名单校验 ----------

const NOTICE_CODES: readonly NoticeCode[] = [
  'tool_failed',
  'turn_aborted',
  'transcript_failed',
  'round_limit',
  'stream_error',
];

const TOOL_STATUSES: readonly ToolCallRecord['status'][] = ['running', 'success', 'error'];

function normalizeNoticeAction(raw: unknown): AgentErrorAction | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const value = raw as Record<string, unknown>;
  if (typeof value.label !== 'string' || typeof value.url !== 'string') return undefined;
  if (!value.label.trim() || !value.url.trim()) return undefined;
  return { label: value.label, url: value.url };
}

/** 工具记录：只保留契约字段，`result` 原样（它本来就是要回给模型的任意 JSON） */
function normalizeToolRecord(raw: unknown): ToolCallRecord | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.id !== 'string' || !value.id) return null;
  if (typeof value.name !== 'string' || !value.name) return null;
  const status = TOOL_STATUSES.find((candidate) => candidate === value.status);
  if (!status) return null;
  const record: ToolCallRecord = { id: value.id, name: value.name, args: value.args, status };
  if ('result' in value) record.result = value.result;
  if (typeof value.error === 'string') record.error = value.error;
  return record;
}

/**
 * 单个块的校验：公共字段（`id/seq/open/createdAt`）+ kind 专属字段。
 * 任何一项不合法 → 丢弃该块（宁可少一块，不可让整条会话读不出来）。
 * 空的 `thinking` / `text` 块直接丢掉：它们只会渲染成一行没有内容的折叠条。
 */
function normalizeBlock(raw: unknown): TurnBlock | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Record<string, unknown>;
  const id = typeof value.id === 'string' && value.id ? value.id : null;
  const seq = typeof value.seq === 'number' && Number.isFinite(value.seq) ? value.seq : null;
  if (!id || seq === null) return null;
  const base = {
    id,
    seq: Math.max(0, Math.round(seq)),
    open: value.open === true,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : nowIso(),
  };

  if (value.kind === 'thinking' || value.kind === 'text') {
    if (typeof value.text !== 'string' || !value.text.trim()) return null;
    return { ...base, kind: value.kind, text: value.text };
  }

  if (value.kind === 'tool') {
    const call = normalizeToolRecord(value.call);
    return call ? { ...base, kind: 'tool', call } : null;
  }

  if (value.kind === 'notice') {
    if (typeof value.text !== 'string' || !value.text.trim()) return null;
    const level = value.level;
    if (level !== 'error' && level !== 'warning' && level !== 'info') return null;
    const code = NOTICE_CODES.find((candidate) => candidate === value.code);
    if (!code) return null;
    const action = normalizeNoticeAction(value.action);
    return { ...base, kind: 'notice', level, code, text: value.text, ...(action ? { action } : {}) };
  }

  return null;
}

/**
 * 块列表的读取：
 * - 按 `seq` 排序（数组顺序即到达顺序，排序只是防御乱序写盘）；
 * - 恢复时把所有「增长中」的块收尾（上次崩溃留下的 `open=true` 不算数）。
 */
function normalizeBlocks(raw: unknown, options: NormalizeOptions): TurnBlock[] {
  if (!Array.isArray(raw)) return [];
  const blocks = raw
    .map((item) => normalizeBlock(item))
    .filter((item): item is TurnBlock => item !== null)
    .sort((left, right) => left.seq - right.seq);
  return options.restoring ? closeBlocks(blocks) : blocks;
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

  // ---- 轮次块（唯一真相源） ----
  // 老存档只有 content/reasoning/toolCalls：合成一份降级块，历史会话照常可读，不清空任何数据。
  const blocks = normalizeBlocks(value.blocks, options);
  if (blocks.length > 0) {
    message.blocks = blocks;
  } else if (role === 'assistant') {
    const legacy = blocksFromLegacy(message);
    if (legacy.length > 0) message.blocks = legacy;
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
