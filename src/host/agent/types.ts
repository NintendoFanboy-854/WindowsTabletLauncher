/**
 * Agent 模块的数据契约。
 *
 * 与 docs/components/agent.md 的 `Message` / `Conversation` / `Settings` 对齐；
 * 规格没写、但实现必须有的字段（MiMo Key、Mock 开关、reasoning、来源）都标了注释，
 * 它们只增加可选能力，不改变既有字段语义。
 */

import type { AgentToolDecl } from '../bridge/types';

export type { AgentToolDecl };

// ---------- 面板 ----------

/** 浮层 / 常驻侧栏 / 全屏 */
export type PanelMode = 'overlay' | 'sidebar' | 'fullscreen';

/** 浮层与侧栏宽度（规格：min(420px, 92vw)） */
export const AGENT_PANEL_WIDTH = 'min(420px, 92vw)';

/** 常驻侧栏的最小窗口宽度（DESIGN.md §8） */
export const SIDEBAR_MIN_WIDTH = 1280;

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
  /** 默认浮层（规格） */
  panelMode: PanelMode;
  /** 深度思考开关，默认关（规格） */
  thinking: boolean;
  tts: {
    /** 默认 false：只显示文字，点喇叭才读 */
    autoPlay: boolean;
    /** 连续朗读的持久状态：点过一次喇叭后保持 */
    continuous: boolean;
    voice: string;
    /** 0.5–2.0，默认 1.0 */
    rate: number;
  };
  face: {
    enabled: boolean;
    /** 注册的人脸特征样本（只存本地） */
    descriptors: number[][];
    /** 欧氏距离阈值，默认 0.5 */
    threshold: number;
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
  panelMode: 'overlay',
  thinking: false,
  tts: {
    autoPlay: false,
    continuous: false,
    voice: 'mimo_default',
    rate: 1,
  },
  face: {
    enabled: true,
    descriptors: [],
    threshold: 0.5,
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

export type ChatRequestMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
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
 * 真实实现走 MiMo（含原生 web_search）；`MockTransport` 提供离线示例数据。
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
