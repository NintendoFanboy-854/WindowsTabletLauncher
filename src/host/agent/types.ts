/**
 * Agent 模块的数据契约。
 *
 * 与 docs/AGENT-SURFACE-CONTRACT.md §8 / §9 对齐：
 * - Message 的 `input` / `voicePeaks` / `voiceDurationSec` / `transcriptStatus` 只给 UI，
 *   不进入模型请求，也不含任何音频数据；
 * - Settings 不再有 panelMode / face / tts.autoPlay / tts.continuous；
 * - 模型请求里只有“本轮语音”那一条 user 消息的 content 是 content parts 数组
 *   （`input_audio` + `text`），其余历史全部是纯文字。
 */

import type { AgentToolDecl } from '../bridge/types';

export type { AgentToolDecl };

// ---------- 消息 ----------

export type MessageRole = 'user' | 'assistant' | 'tool';

export type ToolCallStatus = 'running' | 'success' | 'error';

/** 面板里可见的一次工具调用 */
export interface ToolCallRecord {
  id: string;
  /** 原始工具名，如 `clock.now` */
  name: string;
  args: unknown;
  result?: unknown;
  error?: string;
  status: ToolCallStatus;
}

/** 回答里引用的来源（web.search 的结果） */
/**
 * 回答里引用的来源：来自 MiMo 原生 web_search 的
 * `message.annotations` / `delta.annotations`（type=url_citation）。
 */
export interface SourceRef {
  url: string;
  title: string;
  siteName?: string;
  summary?: string;
  publishTime?: string;
  logoUrl?: string;
}

/** 请求失败时可附带的操作入口（如「去控制台开通插件」） */
export interface AgentErrorAction {
  label: string;
  url: string;
}

export type MessageStatus = 'streaming' | 'done' | 'error' | 'aborted';

/** 这条用户消息来自语音还是键盘（只给 UI，不发模型） */
export type MessageInput = 'voice' | 'text';

/** 语音转写状态（只给 UI；入库的 content 是 ASR 文字） */
export type TranscriptStatus = 'pending' | 'ready' | 'failed';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCallRecord[];
  createdAt: string;
  /** 深度思考内容（MiMo `reasoning_content`），关闭思考时不落库 */
  reasoning?: string;
  /** 联网搜索来源（MiMo annotations），渲染为来源 chips */
  sources?: SourceRef[];
  /** MiMo 原生 web_search 用量（可选，不占卡片主信息） */
  webSearchUsage?: { toolUsage: number; pageUsage: number };
  status?: MessageStatus;
  /** 只给 UI：语音消息的声纹装饰（12–24 个 0..1 桶，纯数字，不含音频） */
  input?: MessageInput;
  voicePeaks?: number[];
  voiceDurationSec?: number;
  /** 只给 UI：ASR 回填进度；音频 Blob 永不进 Message */
  transcriptStatus?: TranscriptStatus;
}

export interface Conversation {
  id: string;
  /** 首条用户消息截断 */
  title: string;
  messages: Message[];
  updatedAt: string;
}

// ---------- 设置 ----------

export type MimoModel = 'mimo-v2.6-flash' | 'mimo-v2.6-pro' | 'mimo-v2.6-pro-ultraspeed';

export interface MimoModelOption {
  value: MimoModel;
  label: string;
  hint: string;
}

export const MIMO_MODELS: readonly MimoModelOption[] = [
  { value: 'mimo-v2.6-flash', label: 'MiMo V2.6 Flash', hint: '默认：快、便宜，日常使用' },
  { value: 'mimo-v2.6-pro', label: 'MiMo V2.6 Pro', hint: '复杂任务、长链推理' },
  {
    value: 'mimo-v2.6-pro-ultraspeed',
    label: 'MiMo V2.6 Pro UltraSpeed',
    hint: '低延迟，强实时交互',
  },
];

export interface TtsVoiceOption {
  value: string;
  label: string;
}

/** MiMo TTS 预置音色（docs：语音合成 v2.5） */
export const TTS_VOICES: readonly TtsVoiceOption[] = [
  { value: 'mimo_default', label: 'MiMo 默认' },
  { value: '冰糖', label: '冰糖（中文女声）' },
  { value: '茉莉', label: '茉莉（中文女声）' },
  { value: '苏打', label: '苏打（中文男声）' },
  { value: '白桦', label: '白桦（中文男声）' },
  { value: 'Mia', label: 'Mia（英文女声）' },
  { value: 'Chloe', label: 'Chloe（英文女声）' },
  { value: 'Milo', label: 'Milo（英文男声）' },
  { value: 'Dean', label: 'Dean（英文男声）' },
];

export interface AgentSettings {
  /** 默认 flash（规格） */
  model: MimoModel;
  /** 深度思考开关，默认关（规格） */
  thinking: boolean;
  tts: {
    /** 自动朗读总开关：关掉后语音/文字回答都只显示文字（手动点单条朗读仍可用）。默认 true */
    autoRead: boolean;
    /** 文字提问的回复也朗读；语音提问的回答在 autoRead 开启时朗读。默认 false */
    readTextReplies: boolean;
    voice: string;
    /** 0.5–2.0，默认 1.0 */
    rate: number;
  };
  search: {
    /** 默认开：是否在请求里携带 MiMo 原生 web_search 工具 */
    enabled: boolean;
    /** 每次检索提取的关键词数量，默认 3 */
    maxKeyword: number;
    /** 默认关：交给模型判断是否必搜 */
    forceSearch: boolean;
  };
  /**
   * MiMo 接入。规格要求“API Key 在设置里填，本地存”，但数据模型里漏了字段，
   * 这里补上（baseUrl 可换 Token Plan 的专属地址）。
   */
  mimo: {
    apiKey: string;
    baseUrl: string;
  };
}

export const MIMO_BASE_URL = 'https://api.xiaomimimo.com/v1';

/** MiMo 控制台 → 插件管理（开通 Web Search Plugin） */
export const MIMO_PLUGIN_CONSOLE_URL = 'https://platform.xiaomimimo.com/#/console/plugin';

export const DEFAULT_SETTINGS: AgentSettings = {
  model: 'mimo-v2.6-flash',
  thinking: false,
  tts: {
    autoRead: true,
    readTextReplies: false,
    voice: 'mimo_default',
    rate: 1,
  },
  search: {
    enabled: true,
    maxKeyword: 3,
    forceSearch: false,
  },
  mimo: {
    apiKey: '',
    baseUrl: MIMO_BASE_URL,
  },
};

// ---------- 模型请求 / 流式事件 ----------

export interface ChatToolCall {
  id: string;
  /** 模型看到的工具名（已按 OpenAI 函数名规则转义，如 `clock__now`） */
  name: string;
  /** 已解析的参数；解析失败时为原始字符串加 `parseError` 标记 */
  args: unknown;
  rawArguments?: string;
  parseError?: string;
}

export interface ToolFunctionDefinition {
  name: string;
  description: string;
  parameters: unknown;
}

export interface ToolDefinition {
  type: 'function';
  function: ToolFunctionDefinition;
}

export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

/**
 * 本轮语音的音频输入（MiMo 原生音频理解，见官方文档：mimo-v2.6-flash/pro 支持）。
 * `data` 是 `data:audio/wav;base64,…` 形式的 data URL。
 */
export interface ChatInputAudioPart {
  type: 'input_audio';
  input_audio: { data: string };
}

export interface ChatTextPart {
  type: 'text';
  text: string;
}

export type ChatContentPart = ChatInputAudioPart | ChatTextPart;

/**
 * 模型消息。只有“本轮语音”的那一条 user 消息允许 content 为 content parts 数组；
 * 历史消息（含 retry / 切会话 / 重启）一律 string，绝不重传音频。
 */
export type ChatRequestMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string | ChatContentPart[] }
  | {
      role: 'assistant';
      content: string | null;
      tool_calls?: OpenAIToolCall[];
      /** 深度思考 + 工具调用时，多轮必须回传（MiMo 文档要求） */
      reasoning_content?: string;
    }
  | { role: 'tool'; tool_call_id: string; content: string };

export type ModelStreamEvent =
  | { type: 'content'; text: string }
  | { type: 'reasoning'; text: string }
  | { type: 'tool_call'; call: ChatToolCall }
  /** MiMo 原生 web_search 返回的来源（annotations / url_citation） */
  | { type: 'sources'; sources: SourceRef[] }
  /** MiMo 原生 web_search 用量（usage.web_search_usage） */
  | { type: 'usage'; webSearchUsage: { toolUsage: number; pageUsage: number } }
  | { type: 'finish'; reason: string };

export interface ChatTurnRequest {
  model: MimoModel;
  messages: ChatRequestMessage[];
  tools: ToolDefinition[];
  thinking: boolean;
  signal: AbortSignal;
}

export interface ToolRunOptions {
  signal: AbortSignal;
}

/**
 * Agent 的模型/工具/语音/搜索传输层。
 * 真实实现走 MiMo（含原生音频输入、原生 web_search）；`MockTransport` 提供离线示例数据。
 */
export interface AgentTransport {
  readonly kind: 'mimo' | 'mock';
  /** 是否具备真实调用条件（有 MiMo Key） */
  isConfigured(): boolean;
  streamChat(
    request: ChatTurnRequest,
    onEvent: (event: ModelStreamEvent) => void,
  ): Promise<void>;
  transcribe(wav: Blob, options: ToolRunOptions): Promise<string>;
  /** 流式合成；产出 PCM16 单声道 24kHz 采样 */
  synthesize(
    text: string,
    options: ToolRunOptions & { voice: string; rate: number },
  ): AsyncIterable<Int16Array>;
  listPluginTools(): AgentToolDecl[];
  callPluginTool(name: string, args: unknown, options: ToolRunOptions): Promise<unknown>;
}
