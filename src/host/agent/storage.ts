/**
 * 会话持久化：`agent.conversations`（数组）+ `agent.activeConversation`（当前会话 id）。
 */

import type { Conversation, Message } from './types';

export const CONVERSATIONS_STORAGE_KEY = 'agent.conversations';
export const ACTIVE_CONVERSATION_STORAGE_KEY = 'agent.activeConversation';

const TITLE_MAX_CHARS = 24;

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

function normalizeMessage(raw: unknown): Message | null {
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
  if (value.status === 'streaming' || value.status === 'done' || value.status === 'error' || value.status === 'aborted') {
    // 上次异常退出留下的 streaming 状态不算数，统一当作已完成
    message.status = value.status === 'streaming' ? 'done' : value.status;
  }
  return message;
}

export function normalizeConversation(raw: unknown): Conversation | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Record<string, unknown>;
  const id = typeof value.id === 'string' ? value.id : uid('conv');
  const messages = Array.isArray(value.messages)
    ? value.messages.map(normalizeMessage).filter((item): item is Message => item !== null)
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
    return parsed.map(normalizeConversation).filter((item): item is Conversation => item !== null);
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
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
