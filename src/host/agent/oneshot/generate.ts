/**
 * 「欣赏壁纸」说明卡：一次性的、不进入日常对话的模型调用。
 *
 * 复用现有设施，不复制粘贴：
 * - 模型名 / API Key / baseUrl 来自 `../settings` 的 `readSettings()`（只读，不写设置）；
 * - 请求与 SSE 解析走 `../transport/real` 的 `MimoTransport`（内含 `readSse`、工具声明、
 *   `annotations` 来源解析、`web_search_usage` 统计），本文件只做「拼提示词 → 收文本 → 判失败」。
 *
 * 硬性边界（契约）：
 * - 不碰 `useAgentSession`、不写 `agent.conversations` / `agent.activeConversation`、
 *   不产生消息气泡、不接 TTS、不暴露输入接口；
 * - 必须联网搜索：请求里声明 MiMo 原生 `web_search` 且强制触发；模型没搜就直接输出
 *   视为失败（不落库）并返回 `null`；
 * - 失败静默：没 key / 没网 / 模型报错 / 没搜索都不抛给 UI、不打 `console.error`。
 *
 * 缓存策略见 `cache.ts`；提示词见 `prompt.ts`；文本降级见 `sanitize.ts`。
 */

import { readSettings } from '../settings';
import { MimoTransport, MimoWebSearchDisabledError } from '../transport/real';
import type { AgentSettings, ChatTurnRequest } from '../types';
import {
  cacheKeyFor,
  isSuppressed,
  noteFromRecord,
  readNoteRecord,
  saveNoteRecord,
  type NoteRecord,
} from './cache';
import { buildMessages } from './prompt';
import { normalizeNoteText } from './sanitize';
import type { WallpaperNote, WallpaperNoteInput } from './types';

/** 单次请求的兜底上限：网络挂起时不至于让 UI 一直 loading（也顺带限制计费时长） */
const REQUEST_TIMEOUT_MS = 45_000;

/**
 * 同键并发去重：模块级 Map，key = 缓存键。
 * 两个调用方同时要同一张图的说明时，只有一个请求出去，避免重复计费。
 */
const inFlight = new Map<string, Promise<WallpaperNote | null>>();

/**
 * 让 `MimoTransport` 无论如何都带上 `web_search`：这个模式的意义就是「先搜再写」，
 * 不受设置页「联网搜索」开关影响（只在本次请求的 settings 快照上覆盖，不写回设置）。
 */
function withForcedSearch(settings: AgentSettings): AgentSettings {
  return {
    ...settings,
    search: { ...settings.search, enabled: true, forceSearch: true },
  };
}

/** 配置类失败不写冷静期：用户补上 key / 开通插件后应当立刻能重试 */
function isConfigError(error: unknown): boolean {
  return error instanceof MimoWebSearchDisabledError;
}

async function recordFailure(cacheKey: string, model: string, previousTries: number): Promise<void> {
  const now = Date.now();
  const record: NoteRecord = {
    key: cacheKey,
    text: '',
    model,
    createdAt: now,
    tries: previousTries + 1,
    lastFailureAt: now,
  };
  await saveNoteRecord(record);
}

/** 调用方 abort 只解除等待，不切断共享请求：请求会跑完并写库，下次直接命中 */
function waitOrAbort(
  pending: Promise<WallpaperNote | null>,
  signal: AbortSignal,
): Promise<WallpaperNote | null> {
  if (signal.aborted) return Promise.resolve(null);
  return new Promise<WallpaperNote | null>((resolve) => {
    const finish = (value: WallpaperNote | null): void => {
      signal.removeEventListener('abort', onAbort);
      resolve(value);
    };
    const onAbort = (): void => finish(null);
    signal.addEventListener('abort', onAbort, { once: true });
    void pending.then(finish, () => finish(null));
  });
}

/**
 * 真正发一次请求。
 *
 * 返回 null 的所有分支都不向 UI 抛异常：没 key、网络失败、HTTP 报错、模型没搜索、
 * 输出被降级成空串，一律 `null`（状态由 `useWallpaperNote` 折成 `failed`）。
 */
async function generateNote(
  input: WallpaperNoteInput,
  cacheKey: string,
  previousTries: number,
): Promise<WallpaperNote | null> {
  const settings = readSettings();
  if (!settings.mimo.apiKey.trim()) return null;

  const model = settings.model;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const request: ChatTurnRequest = {
    model,
    messages: buildMessages(input),
    // 只有 MiMo 原生 web_search（由 transport 按上面的 forced 快照附加），没有函数工具
    tools: [],
    // 说明卡不需要深度思考：省时间也省钱，思考段本来也不会进 text
    thinking: false,
    signal: controller.signal,
  };

  let text = '';
  let searched = false;

  try {
    const transport = new MimoTransport(() => withForcedSearch(settings));
    await transport.streamChat(request, (event) => {
      if (event.type === 'content') {
        text += event.text;
        return;
      }
      if (event.type === 'sources') {
        searched = true;
        return;
      }
      if (event.type === 'usage' && event.webSearchUsage.toolUsage > 0) {
        searched = true;
      }
    });
  } catch (error) {
    if (!isConfigError(error)) await recordFailure(cacheKey, model, previousTries);
    return null;
  } finally {
    clearTimeout(timer);
  }

  // 模型没调用检索工具就直接写 → 内容无法核实，按失败处理，不落库
  if (!searched) {
    await recordFailure(cacheKey, model, previousTries);
    return null;
  }

  const cleaned = normalizeNoteText(text);
  if (!cleaned) {
    await recordFailure(cacheKey, model, previousTries);
    return null;
  }

  const record: NoteRecord = {
    key: cacheKey,
    text: cleaned,
    model,
    createdAt: Date.now(),
    tries: previousTries + 1,
    lastFailureAt: 0,
  };
  await saveNoteRecord(record);

  return { key: record.key, text: record.text, model: record.model, createdAt: record.createdAt };
}

/**
 * 取这张图的说明：命中缓存零网络返回；未命中才发一次请求；
 * 同一键并发只发一次；失败后 24 小时内不再尝试。
 */
export async function describeWallpaper(
  input: WallpaperNoteInput,
  opts: { signal?: AbortSignal } = {},
): Promise<WallpaperNote | null> {
  const cacheKey = cacheKeyFor(input);
  if (!cacheKey) return null;

  const record = await readNoteRecord(cacheKey);
  const cached = noteFromRecord(record);
  if (cached) return cached;
  if (isSuppressed(record)) return null;

  let pending = inFlight.get(cacheKey);
  if (!pending) {
    const tries = record?.tries ?? 0;
    pending = generateNote(input, cacheKey, tries).finally(() => {
      inFlight.delete(cacheKey);
    });
    inFlight.set(cacheKey, pending);
  }

  return opts.signal ? waitOrAbort(pending, opts.signal) : pending;
}
