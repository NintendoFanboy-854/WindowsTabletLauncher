/**
 * MiMo V2.6 传输层（OpenAI 兼容 `/chat/completions`）。
 *
 * - 对话：SSE 流式，支持函数 `tool_calls`、`reasoning_content` 与 MiMo 原生 `web_search`；
 *   开启思考时按 MiMo 文档回传 `thinking: { type: 'enabled' | 'disabled' }`。
 * - 联网搜索：请求 `tools` 里附加 `{ type: 'web_search', max_keyword, force_search, limit }`，
 *   来源从响应 `annotations`（`url_citation`）读取，流式首个数据包就会带来源。
 * - 未开通 Web Search Plugin 时接口返回 400（`webSearchEnabled is false`），
 *   这里映射成带控制台入口的可读错误。
 * - 语音识别：同一个 `/chat/completions`，model = `mimo-v2.5-asr`，音频以 data URL 传入。
 * - 语音合成：同一个 endpoint，model = `mimo-v2.5-tts`，`audio.format = pcm16`，SSE 里读
 *   `choices[0].delta.audio.data`（base64，PCM16LE 24kHz）。
 * - 插件工具：走 HostBridge.callTool。
 */

import { getHostBridge } from '../../bridge';
import { MIMO_PLUGIN_CONSOLE_URL } from '../types';
import type {
  AgentErrorAction,
  AgentToolDecl,
  AgentTransport,
  AgentSettings,
  ChatToolCall,
  ChatTurnRequest,
  ModelStreamEvent,
  SourceRef,
  ToolRunOptions,
} from '../types';
import { readErrorBody, readSse } from './sse';

const CHAT_ENDPOINT = '/chat/completions';
const ASR_MODEL = 'mimo-v2.5-asr';
const TTS_MODEL = 'mimo-v2.5-tts';

/** 每次 web_search 返回的结果组数：1 组足够回答，需要更多由模型自行再检索 */
const NATIVE_WEB_SEARCH_LIMIT = 1;

/** SSE 两帧之间的最长等待：深度思考可能长时间无输出，给足余量；超过按网络异常处理 */
const STREAM_IDLE_TIMEOUT_MS = 120_000;

interface DeltaToolCall {
  index?: number;
  id?: string;
  type?: string;
  function?: { name?: string; arguments?: string };
}

interface ChatCompletionChunk {
  choices?: Array<{
    delta?: {
      content?: string | null;
      reasoning_content?: string | null;
      tool_calls?: DeltaToolCall[];
      annotations?: unknown[] | null;
    };
    message?: { annotations?: unknown[] | null };
    finish_reason?: string | null;
  }>;
  /** 带 stream_options.include_usage 时，末尾会有一个 choices=[] 的 usage 包 */
  usage?: {
    web_search_usage?: { tool_usage?: number; page_usage?: number };
  } | null;
}

interface ChatCompletionPayload {
  choices?: Array<{ message?: { content?: string | null } }>;
}

interface MimoErrorPayload {
  error?: {
    code?: string;
    message?: string;
    param?: string;
    type?: string;
  };
}

/** API Key 没开通 Web Search Plugin 时的可读错误（附控制台入口） */
export class MimoWebSearchDisabledError extends Error {
  readonly action: AgentErrorAction = {
    label: '打开 MiMo 控制台 · 插件管理',
    url: MIMO_PLUGIN_CONSOLE_URL,
  };

  constructor() {
    super(
      'MiMo 联网搜索未开通：这个 API Key 还没有开通联网搜索功能。请到 MiMo 控制台 → 插件管理开通后重试，或在设置里关闭联网搜索。',
    );
    this.name = 'MimoWebSearchDisabledError';
  }
}

function headersFor(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

/**
 * 解析 `message.annotations` / `delta.annotations`。
 * MiMo 的 url_citation 形如：
 * `{ type: 'url_citation', url_citation: { url, title, site_name, summary, publish_time, logo_url } }`，
 * 也兼容把字段直接平铺在数组项上的写法。
 */
export function parseAnnotations(raw: unknown): SourceRef[] {
  if (!Array.isArray(raw)) return [];
  const sources: SourceRef[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;
    const citation =
      typeof record.url_citation === 'object' && record.url_citation !== null
        ? (record.url_citation as Record<string, unknown>)
        : record;
    const url = asNonEmptyString(citation.url);
    if (!url) continue;
    sources.push({
      url,
      title: asNonEmptyString(citation.title) ?? url,
      siteName: asNonEmptyString(citation.site_name),
      summary: asNonEmptyString(citation.summary),
      publishTime: asNonEmptyString(citation.publish_time),
      logoUrl: asNonEmptyString(citation.logo_url),
    });
  }
  return sources;
}

function parseToolArguments(raw: string): { args: unknown; parseError?: string } {
  if (!raw.trim()) return { args: {} };
  try {
    return { args: JSON.parse(raw) as unknown };
  } catch (error) {
    return {
      args: {},
      parseError: `工具参数不是合法 JSON：${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const step = 0x8000;
  for (let index = 0; index < bytes.length; index += step) {
    binary += String.fromCharCode(...bytes.subarray(index, index + step));
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/** 去掉 Markdown 语法，让 TTS 读起来自然 */
export function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' 代码块略过。 ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/^\s*[-+*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** HTTP 错误统一映射；识别「Web Search Plugin 未开通」的 400 */
async function throwForHttpError(response: Response): Promise<never> {
  const text = await response.text().catch(() => '');
  let payload: MimoErrorPayload | null = null;
  try {
    payload = JSON.parse(text) as MimoErrorPayload;
  } catch {
    payload = null;
  }

  const flag = [payload?.error?.param, payload?.error?.message, payload?.error?.type, payload?.error?.code]
    .filter((item): item is string => typeof item === 'string')
    .join(' ')
    .toLowerCase();
  if (flag.includes('websearchenabled') || flag.includes('web search tool')) {
    throw new MimoWebSearchDisabledError();
  }

  const detail = payload?.error?.message?.trim() || text.trim().slice(0, 400);
  const param = payload?.error?.param?.trim();
  throw new Error(
    `MiMo 请求失败（HTTP ${response.status}）${detail ? `：${detail}${param ? `（${param}）` : ''}` : ''}`,
  );
}

export class MimoTransport implements AgentTransport {
  readonly kind = 'mimo' as const;

  constructor(private readonly getSettings: () => AgentSettings) {}

  private settings(): AgentSettings {
    return this.getSettings();
  }

  private apiKey(): string {
    return this.settings().mimo.apiKey.trim();
  }

  private baseUrl(): string {
    return this.settings().mimo.baseUrl.trim().replace(/\/+$/, '');
  }

  isConfigured(): boolean {
    return this.apiKey().length > 0;
  }

  // ---------- 对话 ----------

  async streamChat(
    request: ChatTurnRequest,
    onEvent: (event: ModelStreamEvent) => void,
  ): Promise<void> {
    const apiKey = this.apiKey();
    if (!apiKey) throw new Error('未配置 MiMo API Key：请到设置 → 模型 里填写');

    const search = this.settings().search;
    const tools: unknown[] = request.tools.map((tool) => tool);
    if (search.enabled) {
      // MiMo 原生 web_search：与函数工具共存，是否真的检索由模型判断（force_search 默认关）
      tools.push({
        type: 'web_search',
        max_keyword: search.maxKeyword,
        force_search: search.forceSearch,
        limit: NATIVE_WEB_SEARCH_LIMIT,
      });
    }

    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages,
      stream: true,
      // 末尾的 usage 包（含 web_search_usage），用于来源区的小字统计
      stream_options: { include_usage: true },
      // MiMo 文档：thinking.type 控制深度思考；默认开启，这里显式传
      thinking: { type: request.thinking ? 'enabled' : 'disabled' },
    };
    if (tools.length > 0) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    const response = await fetch(`${this.baseUrl()}${CHAT_ENDPOINT}`, {
      method: 'POST',
      headers: headersFor(apiKey),
      body: JSON.stringify(body),
    });

    if (!response.ok) await throwForHttpError(response);
    if (!response.body) throw new Error('MiMo 响应没有可读的流');

    const pending = new Map<number, { id: string; name: string; rawArguments: string }>();
    const emittedSourceUrls = new Set<string>();
    let finishReason = 'stop';

    for await (const event of readSse(response.body, request.signal, {
      idleTimeoutMs: STREAM_IDLE_TIMEOUT_MS,
    })) {
      if (event.data === '[DONE]') break;
      let chunk: ChatCompletionChunk;
      try {
        chunk = JSON.parse(event.data) as ChatCompletionChunk;
      } catch {
        continue;
      }
      const choice = chunk.choices?.[0];

      const webSearchUsage = chunk.usage?.web_search_usage;
      if (webSearchUsage) {
        onEvent({
          type: 'usage',
          webSearchUsage: {
            toolUsage: webSearchUsage.tool_usage ?? 0,
            pageUsage: webSearchUsage.page_usage ?? 0,
          },
        });
      }

      if (!choice) continue;

      const reasoning = choice.delta?.reasoning_content;
      if (typeof reasoning === 'string' && reasoning) {
        onEvent({ type: 'reasoning', text: reasoning });
      }
      const content = choice.delta?.content;
      if (typeof content === 'string' && content) {
        onEvent({ type: 'content', text: content });
      }

      // 来源：MiMo 在流式首个数据包就带 annotations
      const annotations = parseAnnotations(
        choice.delta?.annotations ?? choice.message?.annotations,
      );
      if (annotations.length) {
        const fresh = annotations.filter((source) => {
          if (emittedSourceUrls.has(source.url)) return false;
          emittedSourceUrls.add(source.url);
          return true;
        });
        if (fresh.length) onEvent({ type: 'sources', sources: fresh });
      }

      for (const deltaCall of choice.delta?.tool_calls ?? []) {
        const index = deltaCall.index ?? 0;
        const current = pending.get(index) ?? { id: '', name: '', rawArguments: '' };
        if (deltaCall.id) current.id = deltaCall.id;
        if (deltaCall.function?.name) current.name += deltaCall.function.name;
        if (deltaCall.function?.arguments) current.rawArguments += deltaCall.function.arguments;
        pending.set(index, current);
      }

      if (choice.finish_reason) finishReason = choice.finish_reason;
    }

    if (pending.size > 0) {
      const indices = [...pending.keys()].sort((a, b) => a - b);
      for (const index of indices) {
        const raw = pending.get(index);
        if (!raw || !raw.name) continue;
        const { args, parseError } = parseToolArguments(raw.rawArguments);
        const call: ChatToolCall = {
          id: raw.id || `call_${index}`,
          name: raw.name,
          args,
          rawArguments: raw.rawArguments,
          parseError,
        };
        onEvent({ type: 'tool_call', call });
      }
      if (finishReason === 'stop') finishReason = 'tool_calls';
    }

    onEvent({ type: 'finish', reason: finishReason });
  }

  // ---------- 语音识别 ----------

  async transcribe(wav: Blob, options: ToolRunOptions): Promise<string> {
    const apiKey = this.apiKey();
    if (!apiKey) throw new Error('未配置 MiMo API Key：语音识别需要 MiMo Key');

    const bytes = new Uint8Array(await wav.arrayBuffer());
    const dataUrl = `data:audio/wav;base64,${bytesToBase64(bytes)}`;

    const response = await fetch(`${this.baseUrl()}${CHAT_ENDPOINT}`, {
      method: 'POST',
      headers: headersFor(apiKey),
      body: JSON.stringify({
        model: ASR_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'input_audio',
                input_audio: { data: dataUrl },
              },
            ],
          },
        ],
        asr_options: { language: 'zh' },
      }),
      signal: options.signal,
    });

    if (!response.ok) {
      const detail = await readErrorBody(response);
      throw new Error(`语音识别失败（HTTP ${response.status}）${detail ? `：${detail}` : ''}`);
    }

    const payload = (await response.json()) as ChatCompletionPayload;
    const text = payload.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) throw new Error('语音识别没有返回文本');
    return text;
  }

  // ---------- 语音合成（流式） ----------

  async *synthesize(
    text: string,
    options: ToolRunOptions & { voice: string; rate: number },
  ): AsyncIterable<Int16Array> {
    const apiKey = this.apiKey();
    if (!apiKey) throw new Error('未配置 MiMo API Key：语音合成需要 MiMo Key');

    const spoken = stripMarkdownForSpeech(text);
    if (!spoken) return;

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (Math.abs(options.rate - 1) > 0.01) {
      messages.push({
        role: 'user',
        content: `请用大约 ${options.rate.toFixed(1)} 倍语速，自然清晰地朗读下面的内容。`,
      });
    }
    messages.push({ role: 'assistant', content: spoken });

    const response = await fetch(`${this.baseUrl()}${CHAT_ENDPOINT}`, {
      method: 'POST',
      headers: headersFor(apiKey),
      body: JSON.stringify({
        model: TTS_MODEL,
        messages,
        audio: { format: 'pcm16', voice: options.voice || 'mimo_default' },
        stream: true,
      }),
      signal: options.signal,
    });

    if (!response.ok) {
      const detail = await readErrorBody(response);
      throw new Error(`语音合成失败（HTTP ${response.status}）${detail ? `：${detail}` : ''}`);
    }
    if (!response.body) throw new Error('语音合成响应没有可读的流');

    let carry = new Uint8Array(0);
    for await (const event of readSse(response.body, options.signal, {
      idleTimeoutMs: STREAM_IDLE_TIMEOUT_MS,
    })) {
      if (event.data === '[DONE]') break;
      let chunk: {
        choices?: Array<{ delta?: { audio?: { data?: string } } }>;
      };
      try {
        chunk = JSON.parse(event.data) as typeof chunk;
      } catch {
        continue;
      }
      const encoded = chunk.choices?.[0]?.delta?.audio?.data;
      if (!encoded) continue;

      const bytes = base64ToBytes(encoded);
      if (!bytes.length) continue;

      const merged = new Uint8Array(carry.length + bytes.length);
      merged.set(carry, 0);
      merged.set(bytes, carry.length);
      const usable = merged.length - (merged.length % 2);
      carry = merged.slice(usable);
      if (usable === 0) continue;

      const view = new DataView(merged.buffer, merged.byteOffset, usable);
      const samples = new Int16Array(usable / 2);
      for (let index = 0; index < samples.length; index += 1) {
        samples[index] = view.getInt16(index * 2, true);
      }
      yield samples;
    }
  }

  // ---------- 插件工具 ----------

  listPluginTools(): AgentToolDecl[] {
    return getHostBridge().listTools();
  }

  callPluginTool(name: string, args: unknown, options: ToolRunOptions): Promise<unknown> {
    return getHostBridge().callTool(name, args, { signal: options.signal });
  }
}
