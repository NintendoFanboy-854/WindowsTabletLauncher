/**
 * 「欣赏壁纸」说明卡：一次性的、不进入日常对话的模型调用。
 *
 * 复用现有设施，不复制粘贴：
 * - 模型固定 `mimo-v2.6-pro`（看图 + 深度思考）；API Key / baseUrl 来自 `../settings` 的
 *   `readSettings()`（只读，不写设置）；
 * - 请求与 SSE 解析走 `../transport/real` 的 `MimoTransport`（内含 `readSse`、工具声明、
 *   `annotations` 来源解析、`web_search_usage` 统计），本文件只做「拼提示词 → 收文本 → 判失败」。
 *
 * 硬性边界（契约）：
 * - 不碰 `useAgentSession`、不写 `agent.conversations` / `agent.activeConversation`、
 *   不产生消息气泡、不接 TTS、不暴露输入接口；
 * - 必须联网搜索：请求里声明 MiMo 原生 `web_search` 且强制触发；模型没搜就直接输出
 *   视为失败（不落库）并返回 `null`；
 * - 输出必须是简体中文且不含来源旁白：`detectNoteViolation` 命中即视为失败（不落库）；
 * - 失败静默：没 key / 没网 / 模型报错 / 没搜索 / 文本不合格都不抛给 UI、不打 `console.error`。
 *
 * 缓存策略见 `cache.ts`；提示词见 `prompt.ts`；文本降级见 `sanitize.ts`。
 */

import { readSettings } from '../settings';
import { MimoTransport, MimoWebSearchDisabledError } from '../transport/real';
import type { AgentSettings, ChatTurnRequest, MimoModel } from '../types';
import {
  cacheKeyFor,
  isSuppressed,
  noteFromRecord,
  readNoteRecord,
  saveNoteRecord,
  type NoteRecord,
} from './cache';
import { buildMessages } from './prompt';
import { detectNoteViolation, normalizeNoteText } from './sanitize';
import type { WallpaperNote, WallpaperNoteInput } from './types';

/** 说明卡固定用 pro：要直接看图（多模态）+ 深度思考，不受设置页日常对话模型影响 */
const NOTE_MODEL: MimoModel = 'mimo-v2.6-pro';

/** 单次请求的兜底上限：深度思考 + 看图 + 联网搜索会明显变慢，给足余量（与 transport 的 120s 帧超时同档） */
const REQUEST_TIMEOUT_MS = 120_000;

/**
 * 同键并发去重：模块级 Map，key = 缓存键。
 * 两个调用方同时要同一张图的说明时，只有一个请求出去，避免重复计费。
 * 手动 `force` 也复用同键在途请求：正在跑的那次请求本身就是新数据，
 * 再发一次只会重复计费（缓存命中仍会被 force 跳过）。
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

/**
 * 记一次失败。
 *
 * 手动「重新生成」（force）失败时，如果这一行原本是**可用的成功记录**，保留旧行不覆盖：
 * 旧说明仍然可读，覆盖成失败行会让说明卡立刻消失、还要等 24h 冷静期。
 * 首次失败（旧行不存在 / 本来就是失败行）照旧写冷静期。
 */
async function recordFailure(
  cacheKey: string,
  model: string,
  previous: NoteRecord | null,
): Promise<void> {
  if (previous && previous.text.trim()) return;
  const now = Date.now();
  const record: NoteRecord = {
    key: cacheKey,
    text: '',
    model,
    createdAt: now,
    tries: (previous?.tries ?? 0) + 1,
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
  previous: NoteRecord | null,
): Promise<WallpaperNote | null> {
  const settings = readSettings();
  if (!settings.mimo.apiKey.trim()) return null;

  const model = NOTE_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const request: ChatTurnRequest = {
    model,
    messages: buildMessages(input),
    // 只有 MiMo 原生 web_search（由 transport 按上面的 forced 快照附加），没有函数工具
    tools: [],
    // 说明卡开深度思考：先看图 + 检索 + 推理，再写说明
    thinking: true,
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
    if (!isConfigError(error)) await recordFailure(cacheKey, model, previous);
    return null;
  } finally {
    clearTimeout(timer);
  }

  // 模型没调用检索工具就直接写 → 内容无法核实，按失败处理，不落库
  if (!searched) {
    await recordFailure(cacheKey, model, previous);
    return null;
  }

  const cleaned = normalizeNoteText(text);
  if (!cleaned) {
    await recordFailure(cacheKey, model, previous);
    return null;
  }

  // 语言与来源硬校验：模型偶尔整段用英文回答，或写成「根据搜索结果……」的来源旁白。
  // 这类输出对说明卡不可用，按既有失败路径处理（不落库、不向 UI 抛错）。
  if (detectNoteViolation(cleaned)) {
    await recordFailure(cacheKey, model, previous);
    return null;
  }

  const record: NoteRecord = {
    key: cacheKey,
    text: cleaned,
    model,
    createdAt: Date.now(),
    tries: (previous?.tries ?? 0) + 1,
    lastFailureAt: 0,
  };
  await saveNoteRecord(record);

  return { key: record.key, text: record.text, model: record.model, createdAt: record.createdAt };
}

/** `describeWallpaper` 的可选参数 */
export interface DescribeWallpaperOptions {
  /** 调用方 abort 只解除等待，不切断共享请求（请求跑完仍会写库） */
  signal?: AbortSignal;
  /** 手动「重新生成」：跳过缓存成功命中与 24 小时冷静期，立即重新请求并覆盖写库 */
  force?: boolean;
}

/**
 * 取这张图的说明。
 *
 * 默认行为：命中缓存零网络返回；未命中才发一次请求；同一键并发只发一次；
 * 失败后 24 小时内不再尝试。
 *
 * `force: true` 只给手动「重新生成」用：跳过缓存成功命中与失败冷静期，
 * 立刻重新请求并覆盖写库；搜索校验、语言校验、超时与失败记录全部照旧。
 */
export async function describeWallpaper(
  input: WallpaperNoteInput,
  opts: DescribeWallpaperOptions = {},
): Promise<WallpaperNote | null> {
  const cacheKey = cacheKeyFor(input);
  if (!cacheKey) return null;

  const record = await readNoteRecord(cacheKey);
  // force 不看缓存结论，但仍要把 record 传给生成器：失败计数要连续，
  // 且手动刷新失败时要判断「这一行原本是不是可用说明」来决定保留还是写失败行。
  if (!opts.force) {
    const cached = noteFromRecord(record);
    if (cached) return cached;
    if (isSuppressed(record)) return null;
  }

  let pending = inFlight.get(cacheKey);
  if (!pending) {
    pending = generateNote(input, cacheKey, record).finally(() => {
      inFlight.delete(cacheKey);
    });
    inFlight.set(cacheKey, pending);
  }

  return opts.signal ? waitOrAbort(pending, opts.signal) : pending;
}
