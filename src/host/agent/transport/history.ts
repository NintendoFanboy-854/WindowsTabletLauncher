/**
 * 上下文管理：
 * - 把面板消息还原成 OpenAI Chat Completions 的消息序列（含工具调用/工具结果）
 * - 按模型上下文窗口裁剪历史（保留系统提示 + 最近若干轮）
 * - 工具结果过长时截断
 *
 * 数字依据：
 * - 上下文窗口 / 最大输出：MiMo 模型列表文档（V2.6 系列均为 1M 上下文、128K 最大输出）。
 * - 工具结果上限：取上下文窗口的 1%（1M → 10K tokens），避免单条工具结果挤掉整段对话。
 */

import type {
  ChatRequestMessage,
  Message,
  MimoModel,
  OpenAIToolCall,
  ToolCallRecord,
} from '../types';

/** MiMo 模型上下文窗口（token），来源：docs 模型列表 */
export const MODEL_CONTEXT_WINDOWS: Record<MimoModel, number> = {
  'mimo-v2.6-flash': 1_000_000,
  'mimo-v2.6-pro': 1_000_000,
  'mimo-v2.6-pro-ultraspeed': 1_000_000,
};

/** 模型最大输出（token），来源：docs 模型列表 */
export const MODEL_MAX_OUTPUT_TOKENS = 128_000;

/** 估算误差的安全余量（token） */
const SAFETY_MARGIN_TOKENS = 4_096;

/** 单个工具结果的 token 上限 = 上下文窗口的 1% */
export function toolResultTokenCap(model: MimoModel): number {
  return Math.floor(MODEL_CONTEXT_WINDOWS[model] / 100);
}

/**
 * 粗略 token 估算：CJK/全角字符按 1 token，其余按 4 字符 1 token。
 * 没有引入 tokenizer，估算偏保守（宁多勿少），用于裁剪判断足够。
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  let tokens = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    tokens += code > 0x2e7f ? 1 : 0.25;
  }
  return Math.ceil(tokens);
}

function estimateMessageTokens(message: ChatRequestMessage): number {
  switch (message.role) {
    case 'system':
    case 'user':
      return estimateTokens(message.content) + 4;
    case 'assistant': {
      let tokens = estimateTokens(message.content ?? '') + 4;
      if (message.tool_calls) {
        for (const call of message.tool_calls) {
          tokens += estimateTokens(call.function.name) + estimateTokens(call.function.arguments) + 8;
        }
      }
      if (message.reasoning_content) tokens += estimateTokens(message.reasoning_content);
      return tokens;
    }
    case 'tool':
      return estimateTokens(message.content) + 6;
    default:
      return 4;
  }
}

function stringifyToolResult(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === undefined) return '（无返回内容）';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function toOpenAIToolCall(call: ToolCallRecord): OpenAIToolCall {
  return {
    id: call.id,
    type: 'function',
    function: {
      name: call.name,
      arguments: (() => {
        try {
          return JSON.stringify(call.args ?? {});
        } catch {
          return '{}';
        }
      })(),
    },
  };
}

/** 工具结果 → 回给模型的文本 */
export function toolResultToText(value: unknown): string {
  return stringifyToolResult(value);
}

/**
 * 面板消息 → 模型消息。
 *
 * 一条 assistant 消息可能同时含“工具调用”和“最终回答”，按 API 要求拆成：
 * assistant(tool_calls) → tool(结果) → assistant(最终文本)。
 */
export function messagesToHistory(messages: Message[], options: { thinking: boolean }): ChatRequestMessage[] {
  const history: ChatRequestMessage[] = [];

  for (const message of messages) {
    if (message.role === 'user') {
      history.push({ role: 'user', content: message.content });
      continue;
    }
    if (message.role === 'tool') {
      // 当前 UI 把工具结果挂在 assistant.toolCalls 上，独立的 tool 消息只用于兼容旧数据
      continue;
    }

    const calls = message.toolCalls ?? [];
    if (calls.length === 0) {
      history.push({
        role: 'assistant',
        content: message.content || null,
      });
      continue;
    }

    const completed = calls.filter((call) => call.status === 'success' || call.status === 'error');
    if (completed.length === 0) continue;

    history.push({
      role: 'assistant',
      content: null,
      tool_calls: completed.map(toOpenAIToolCall),
      // MiMo 文档：开启深度思考的多轮里，带工具调用的 assistant 必须回传 reasoning_content
      reasoning_content: options.thinking && message.reasoning ? message.reasoning : undefined,
    });
    for (const call of completed) {
      history.push({
        role: 'tool',
        tool_call_id: call.id,
        content: call.status === 'error' ? `错误：${call.error ?? '工具执行失败'}` : stringifyToolResult(call.result),
      });
    }
    if (message.content.trim()) {
      history.push({ role: 'assistant', content: message.content });
    }
  }

  return history;
}

/**
 * 按模型窗口裁剪：系统提示固定保留，其余从最新一轮往前收，
 * 永远保留最后一轮（即使用户这一条特别长）。
 */
export function trimHistory(
  messages: ChatRequestMessage[],
  model: MimoModel,
): ChatRequestMessage[] {
  const system = messages.find((message) => message.role === 'system');
  const rest = messages.filter((message) => message.role !== 'system');

  const budget =
    MODEL_CONTEXT_WINDOWS[model] -
    MODEL_MAX_OUTPUT_TOKENS -
    SAFETY_MARGIN_TOKENS -
    (system ? estimateMessageTokens(system) : 0);
  const tokenBudget = Math.max(0, budget);

  // 以“用户消息”为轮次边界分组，保证工具调用和它的结果不被拆开
  const turns: ChatRequestMessage[][] = [];
  for (const message of rest) {
    if (message.role === 'user' || turns.length === 0) turns.push([message]);
    else turns[turns.length - 1].push(message);
  }

  const kept: ChatRequestMessage[][] = [];
  let used = 0;
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];
    const cost = turn.reduce((sum, message) => sum + estimateMessageTokens(message), 0);
    if (kept.length > 0 && used + cost > tokenBudget) break;
    kept.unshift(turn);
    used += cost;
  }

  const trimmed = kept.flat();
  return system ? [system, ...trimmed] : trimmed;
}

/** 工具结果截断（按 token 预算，而不是字符数） */
export function truncateToolResult(text: string, model: MimoModel): string {
  const cap = toolResultTokenCap(model);
  if (estimateTokens(text) <= cap) return text;

  // 二分找满足 token 上限的最大字符数
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (estimateTokens(text.slice(0, mid)) <= cap) low = mid;
    else high = mid - 1;
  }
  const removed = text.length - low;
  return `${text.slice(0, low)}\n…（工具结果过长，已截断 ${removed} 字符）`;
}
