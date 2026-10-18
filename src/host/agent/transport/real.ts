/**
 * MiMo V2.6 传输层（OpenAI 兼容 `/chat/completions`）。
 *
 * - 对话：SSE 流式，支持 `tool_calls` 与 `reasoning_content`；开启思考时按 MiMo 文档回传
 *   `thinking: { type: 'enabled' | 'disabled' }`。
 * - 语音识别：同一个 `/chat/completions`，model = `mimo-v2.5-asr`，音频以 data URL 传入。
 * - 语音合成：同一个 endpoint，model = `mimo-v2.5-tts`，`audio.format = pcm16`，SSE 里读
 *   `choices[0].delta.audio.data`（base64，PCM16LE 24kHz）。
 * - 搜索：Tavily（宿主实现，不依赖模型厂商的联网能力）。
 * - 插件工具：走 HostBridge.callTool。
 */

import { getHostBridge } from '../../bridge';
import type {
  AgentSettings,
  AgentToolDecl,
  AgentTransport,
  ChatRequestMessage,
  ChatToolCall,
  ChatTurnRequest,
  ModelStreamEvent,
  OpenAIToolCall,
  ToolRunOptions,
  WebPage,
  WebSearchResult,
} from '../types';
import { buildSystemPrompt } from './prompt';
import { fetchPageText, tavilySearch } from '../tools/web';
import { readErrorBody, readSse } from './sse';

const CHAT_ENDPOINT = '/chat/completions';
const ASR_MODEL = 'mimo-v2.5-asr';
const TTS_MODEL = 'mimo-v2.5-tts';

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
    };
    finish_reason?: string | null;
  }>;
}

interface ChatCompletionPayload {
  choices?: Array<{ message?: { content?: string | null } }>;
}

function headersFor(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
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

    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages,
      stream: true,
      // MiMo 文档：thinking.type 控制深度思考；默认开启，这里显式传
      thinking: { type: request.thinking ? 'enabled' : 'disabled' },
    };
    if (request.tools.length > 0) {
      body.tools = request.tools;
      body.tool_choice = 'auto';
    }

    const response = await fetch(`${this.baseUrl()}${CHAT_ENDPOINT}`, {
      method: 'POST',
      headers: headersFor(apiKey),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await readErrorBody(response);
      throw new Error(
        `MiMo 请求失败（HTTP ${response.status}）${detail ? `：${detail}` : ''}`,
      );
    }
    if (!response.body) throw new Error('MiMo 响应没有可读的流');

    const pending = new Map<number, { id: string; name: string; rawArguments: string }>();
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
      if (!choice) continue;

      const reasoning = choice.delta?.reasoning_content;
      if (typeof reasoning === 'string' && reasoning) {
        onEvent({ type: 'reasoning', text: reasoning });
      }
      const content = choice.delta?.content;
      if (typeof content === 'string' && content) {
        onEvent({ type: 'content', text: content });
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

  // ---------- 搜索 / 网页 ----------

  searchWeb(query: string, options: ToolRunOptions): Promise<WebSearchResult[]> {
    return tavilySearch(this.settings().search.apiKey, query, options.signal);
  }

  fetchPage(url: string, options: ToolRunOptions): Promise<WebPage> {
    return fetchPageText(url, options.signal);
  }

  // ---------- 插件工具 ----------

  listPluginTools(): AgentToolDecl[] {
    return getHostBridge().listTools();
  }

  callPluginTool(name: string, args: unknown, options: ToolRunOptions): Promise<unknown> {
    return getHostBridge().callTool(name, args, { signal: options.signal });
  }
}

/** 给会话层组 system prompt 用 */
export function buildMimoSystemPrompt(
  bindings: Parameters<typeof buildSystemPrompt>[0]['bindings'],
  settings: AgentSettings,
): string {
  return buildSystemPrompt({
    bindings,
    now: new Date(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '本地时区',
    searchConfigured: Boolean(settings.search.apiKey.trim()),
  });
}

export type { ChatRequestMessage, OpenAIToolCall };
