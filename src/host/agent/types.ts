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

// ---------- 轮次块：时间线的唯一真相源 ----------

/**
 * 一块的类型。渲染层**只按 kind 分支**，绝不按工具名分支：
 * - `thinking`：模型的深度思考（`reasoning_content`）；
 * - `tool`：一次工具调用（记录与 `ToolCallRecord` 同构）；
 * - `text`：回答正文；
 * - `notice`：就地告知（停止 / 听不清 / 轮次上限 / 请求失败），文案由会话层给。
 */
export type BlockKind = 'thinking' | 'tool' | 'text' | 'notice';

export type NoticeLevel = 'error' | 'warning' | 'info';

export type NoticeCode =
  /** 工具失败（通常并进 ToolBlock 自身的失败态，保留给跨工具的汇总告知） */
  | 'tool_failed'
  /** 本轮被用户停止 */
  | 'turn_aborted'
  /** 语音没听清（模型拿到的是占位文字） */
  | 'transcript_failed'
  /** 工具轮次上限 */
  | 'round_limit'
  /** 流中断 / 请求失败 */
  | 'stream_error';

interface BlockBase {
  /** 稳定 id：React key 与「原地追加」的唯一依据；创建时固定，永不改变 */
  id: string;
  /** 一轮内单调递增，等于到达顺序；持久化后用于保持顺序 */
  seq: number;
  /** 这块还在增长（流式中）。只影响渲染的「进行中」表达，不影响排序 */
  open: boolean;
  createdAt: string;
}

export interface ThinkingBlock extends BlockBase {
  kind: 'thinking';
  text: string;
}

export interface TextBlock extends BlockBase {
  kind: 'text';
  text: string;
}

export interface ToolBlock extends BlockBase {
  kind: 'tool';
  /** 与现有 ToolCallRecord 完全同构，不新增字段语义 */
  call: ToolCallRecord;
}

export interface NoticeBlock extends BlockBase {
  kind: 'notice';
  level: NoticeLevel;
  code: NoticeCode;
  /** 已经成文的一句话：渲染层不再拼接文案 */
  text: string;
  /** 可选操作入口（如「去控制台开通插件」） */
  action?: AgentErrorAction;
}

export type TurnBlock = ThinkingBlock | TextBlock | ToolBlock | NoticeBlock;

/** 过程块：默认折叠成一行摘要的那两类（`text` / `notice` 永不折叠） */
export type ProcessBlock = ThinkingBlock | ToolBlock;

export function isProcessBlock(block: TurnBlock): block is ProcessBlock {
  return block.kind === 'thinking' || block.kind === 'tool';
}

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
  /**
   * 本轮按**发生顺序**排列的块（唯一真相源）。
   * `content` / `reasoning` / `toolCalls` 是它的派生投影（喂模型请求、TTS、标题、peek），
   * 不再喂给眼睛；老数据没有 `blocks` 时由 `blocksFromLegacy` 合成一份降级顺序。
   */
  blocks?: TurnBlock[];
}

export interface Conversation {
  id: string;
  /** 首条用户消息截断 */
  title: string;
  messages: Message[];
  updatedAt: string;
}

// ---------- 块的构造与投影（纯函数，数据层与渲染层共用） ----------

/** 多个 `text`（或 `thinking`）块拼成投影时的分隔符 */
export const BLOCK_TEXT_JOINER = '\n\n';

let blockCounter = 0;

function createBlockId(kind: BlockKind): string {
  blockCounter += 1;
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `blk-${kind}-${random}-${blockCounter.toString(36)}`;
}

function blockCreatedAt(): string {
  return new Date().toISOString();
}

/** 下一个 seq：数组最大值 + 1（删除/插入后仍然单调） */
export function nextBlockSeq(blocks: TurnBlock[]): number {
  let max = -1;
  for (const block of blocks) {
    if (block.seq > max) max = block.seq;
  }
  return max + 1;
}

/** 收尾：把还标着「增长中」的块全部关掉（轮次结束 / 停止 / 失败时调用） */
export function closeBlocks(blocks: TurnBlock[]): TurnBlock[] {
  if (blocks.length === 0) return blocks;
  let changed = false;
  const closed = blocks.map((block) => {
    if (!block.open) return block;
    changed = true;
    return { ...block, open: false };
  });
  return changed ? closed : blocks;
}

/**
 * 追加一段流式增量。
 *
 * 规则只有两条（对应参考实现的 `EnsureBlock`）：
 * 1. 最后一个块存在、kind 相同、且还在增长 → 原地追加（id / seq / 位置都不变）；
 * 2. 否则关掉上一个块，新建一块（新 id、seq 递增、open=true）。
 * 空增量不产生任何块（空块会被丢弃，不会留一行空白折叠行）。
 */
export function appendDeltaBlock(
  blocks: TurnBlock[],
  kind: 'thinking' | 'text',
  delta: string,
): TurnBlock[] {
  if (!delta) return blocks;
  const last = blocks[blocks.length - 1];
  if (last && last.kind === kind && last.open) {
    const merged = { ...last, text: last.text + delta } as ThinkingBlock | TextBlock;
    return [...blocks.slice(0, -1), merged];
  }
  const closed = closeBlocks(blocks);
  const block: ThinkingBlock | TextBlock =
    kind === 'thinking'
      ? {
          id: createBlockId('thinking'),
          kind: 'thinking',
          seq: nextBlockSeq(closed),
          open: true,
          createdAt: blockCreatedAt(),
          text: delta,
        }
      : {
          id: createBlockId('text'),
          kind: 'text',
          seq: nextBlockSeq(closed),
          open: true,
          createdAt: blockCreatedAt(),
          text: delta,
        };
  return [...closed, block];
}

/**
 * 追加一个工具块：`tool_call` 事件到达时就建块（不等这一轮结束才批量写），
 * 这样「工具正在跑」的位置就是它真实的位置；执行完用 `updateToolBlock` 原地改状态。
 */
export function pushToolRecord(
  blocks: TurnBlock[],
  record: ToolCallRecord,
  options: { open?: boolean } = {},
): TurnBlock[] {
  const closed = closeBlocks(blocks);
  return [
    ...closed,
    {
      id: createBlockId('tool'),
      kind: 'tool',
      seq: nextBlockSeq(closed),
      open: options.open ?? record.status === 'running',
      createdAt: blockCreatedAt(),
      call: record,
    },
  ];
}

/** 模型刚发出的一次工具调用 → 一个 `running` 的工具块 */
export function pushToolBlock(
  blocks: TurnBlock[],
  call: { id: string; name: string; args: unknown },
): TurnBlock[] {
  return pushToolRecord(blocks, {
    id: call.id,
    name: call.name,
    args: call.args,
    status: 'running',
  });
}

/** 工具结果 / 失败：原地改那一块，不动顺序 */
export function updateToolBlock(
  blocks: TurnBlock[],
  callId: string,
  patch: Partial<ToolCallRecord>,
): TurnBlock[] {
  let changed = false;
  const next = blocks.map((block) => {
    if (block.kind !== 'tool' || block.call.id !== callId) return block;
    changed = true;
    const call = { ...block.call, ...patch };
    return {
      ...block,
      call,
      open: call.status === 'running' && block.open,
    } satisfies ToolBlock;
  });
  return changed ? next : blocks;
}

/** 就地告知：落在它发生的位置，不汇总到末尾 */
export function appendNoticeBlock(
  blocks: TurnBlock[],
  notice: {
    level: NoticeLevel;
    code: NoticeCode;
    text: string;
    action?: AgentErrorAction;
  },
): TurnBlock[] {
  if (blocks.some((block) => block.kind === 'notice' && block.code === notice.code)) {
    return blocks;
  }
  const closed = closeBlocks(blocks);
  return [
    ...closed,
    {
      id: createBlockId('notice'),
      kind: 'notice',
      seq: nextBlockSeq(closed),
      open: false,
      createdAt: blockCreatedAt(),
      ...notice,
    },
  ];
}

/** 轮的起点告知（如「没听清，可以重说一次」）：插到最前面，seq 保持单调 */
export function prependNoticeBlock(
  blocks: TurnBlock[],
  notice: {
    level: NoticeLevel;
    code: NoticeCode;
    text: string;
    action?: AgentErrorAction;
  },
): TurnBlock[] {
  if (blocks.some((block) => block.kind === 'notice' && block.code === notice.code)) {
    return blocks;
  }
  const firstSeq = blocks.length > 0 ? Math.min(...blocks.map((block) => block.seq)) : 1;
  const block: NoticeBlock = {
    id: createBlockId('notice'),
    kind: 'notice',
    seq: firstSeq - 1,
    open: false,
    createdAt: blockCreatedAt(),
    ...notice,
  };
  return [block, ...blocks];
}

/**
 * 块 → 旧三字段的投影。
 *
 * 保留这三个字段的意义：模型请求（`transport/history.ts`）、TTS 播报、标题、半高 peek、
 * `isEmptyAssistantMessage` 全部继续读它们，所以请求形状零改动。
 */
export function projectBlocks(blocks: TurnBlock[]): {
  content: string;
  reasoning?: string;
  toolCalls?: ToolCallRecord[];
} {
  const texts: string[] = [];
  const reasonings: string[] = [];
  const calls: ToolCallRecord[] = [];
  for (const block of blocks) {
    if (block.kind === 'text') texts.push(block.text);
    else if (block.kind === 'thinking') reasonings.push(block.text);
    else if (block.kind === 'tool') calls.push(block.call);
  }
  const content = texts.join(BLOCK_TEXT_JOINER);
  const reasoning = reasonings.join(BLOCK_TEXT_JOINER);
  return {
    content,
    reasoning: reasoning ? reasoning : undefined,
    toolCalls: calls.length > 0 ? calls : undefined,
  };
}

/** 用新的块列表替换消息的块，并同步刷新三个投影字段 */
export function withBlocks(message: Message, blocks: TurnBlock[]): Message {
  const projection = projectBlocks(blocks);
  return {
    ...message,
    blocks,
    content: projection.content,
    reasoning: projection.reasoning,
    toolCalls: projection.toolCalls,
  };
}

/**
 * 老数据（只有 `content` / `reasoning` / `toolCalls`，没有 `blocks`）的降级映射。
 *
 * 顺序是**降级顺序**，不是真实顺序：真实交错在数据层就已经丢了（跨轮拼接），
 * 这里只保证「思考 → 工具 → 正文」这个稳定可解释的次序，让老会话照常可读。
 * id 由消息 id + 序号派生，保证同一份老数据每次渲染得到相同的 React key。
 */
export function blocksFromLegacy(message: Message): TurnBlock[] {
  if (message.blocks && message.blocks.length > 0) return message.blocks;
  const blocks: TurnBlock[] = [];
  const push = (kind: 'thinking' | 'text', text: string) => {
    if (!text.trim()) return;
    blocks.push({
      id: `legacy-${message.id}-${blocks.length}`,
      kind,
      seq: blocks.length,
      open: false,
      createdAt: message.createdAt,
      text,
    });
  };
  push('thinking', message.reasoning ?? '');
  for (const record of message.toolCalls ?? []) {
    blocks.push({
      id: `legacy-${message.id}-${blocks.length}`,
      kind: 'tool',
      seq: blocks.length,
      open: false,
      createdAt: message.createdAt,
      call: record,
    });
  }
  push('text', message.content);
  return blocks;
}

/** 渲染层取块：有 `blocks` 用 `blocks`，老消息退回降级映射（用户消息没有块） */
export function messageBlocks(message: Message): TurnBlock[] {
  if (message.blocks && message.blocks.length > 0) return message.blocks;
  if (message.role !== 'assistant') return [];
  return blocksFromLegacy(message);
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

/**
 * 右下角 Agent 面板「空闲自动收回」的档位表（秒）：`0` = 关闭该行为，`10` 是默认档。
 *
 * 这是唯一的档位出口：设置页的选项、`normalizeSettings` 的合法性判断、AgentSurface 的
 * 计时都从这张表取值，别处不再出现第二套秒数。
 */
export const IDLE_COLLAPSE_PRESETS = [0, 5, 10, 30, 60] as const;

/** 默认档：无操作 10 秒后回到右下角收起态 */
export const IDLE_COLLAPSE_DEFAULT_SECONDS = 10;

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
  /** 右下角面板的行为（与模型/语音无关，只影响浮层形态） */
  panel: {
    /**
     * 无操作多少秒后自动收回（`0` = 关闭）。取值只能是 `IDLE_COLLAPSE_PRESETS` 里的一档；
     * 老存档缺这个字段时按 `IDLE_COLLAPSE_DEFAULT_SECONDS` 处理（见 settings.ts 归一化）。
     */
    idleCollapseSeconds: number;
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
  panel: {
    idleCollapseSeconds: IDLE_COLLAPSE_DEFAULT_SECONDS,
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

/**
 * 图片输入（MiMo 多模态：`image_url` 形式，支持公网 URL 或 data URL）。
 * 目前只用于「欣赏壁纸」一次性说明卡（pro 模型看图）。
 */
export interface ChatImagePart {
  type: 'image_url';
  image_url: { url: string };
}

export type ChatContentPart = ChatInputAudioPart | ChatImagePart | ChatTextPart;

/**
 * 模型消息。只有“本轮语音”/一次性看图的那条 user 消息允许 content 为 content parts 数组；
 * 历史消息（含 retry / 切会话 / 重启）一律 string，绝不重传音频/图片。
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
