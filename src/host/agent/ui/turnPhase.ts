/**
 * 一轮回复的「实时阶段」判定：半高状态行（PendingLine）与全高时间线（TurnTimeline）共用。
 *
 * 数据来源只有 `TurnStatus` 与那一条 assistant 消息本身（`blocks`，老消息退回
 * `content` / `toolCalls`），不新增字段、不改协议：
 * - `status === 'tools'`：取最后一个 `running` 的工具（优先从块里取），`clock__now` 还原成 `clock.now`；
 * - 还没有 `text` 块 = 思考阶段；有 `text` 块 = 生成阶段。
 *
 * 文案规则（FLUENT2 §11 / content-design.md:22-24）：短句、现在时、无句号、动词开头，
 * 用 `…` 表示仍在进行；不使用 `-ing`（中文无此形态），不写「正在转写/识别」这类
 * 被验收脚本禁用词表覆盖的词。
 */
import type { TurnStatus } from '../hooks/useAgentSession';
import { messageBlocks, type Message, type ToolCallRecord } from '../types';

export type TurnPhaseKind = 'thinking' | 'tool' | 'streaming';

export interface TurnPhase {
  kind: TurnPhaseKind;
  /** 状态行 / 时间线摘要用的中文短句 */
  label: string;
  /** `kind === 'tool'` 时的工具名（取不到为 undefined） */
  toolName?: string;
}

/** 模型看到的 `clock__now` 还原成人类可读的 `clock.now` */
export function toolDisplayName(name: string): string {
  return name.replace(/__/g, '.');
}

/** 这一轮是否已经有可读的正文（只认 `text` 块；老消息退回 `content`） */
export function hasVisibleText(message?: Message): boolean {
  if (!message) return false;
  if (message.blocks && message.blocks.length > 0) {
    return message.blocks.some((block) => block.kind === 'text' && block.text.trim().length > 0);
  }
  return message.content.trim().length > 0;
}

/** 半高 peek 的正文：只拼 `text` 块（thinking / tool / notice 不进 peek 文本） */
export function peekTextOf(message: Message): string {
  if (message.blocks && message.blocks.length > 0) {
    const text = message.blocks
      .filter((block) => block.kind === 'text')
      .map((block) => block.text)
      .join('\n\n')
      .trim();
    if (text) return text;
  }
  return message.content;
}

/** 最后一个还在跑的工具：块是唯一真相源，老消息退回 `toolCalls` */
function runningTool(message?: Message): ToolCallRecord | undefined {
  if (!message) return undefined;
  if (message.blocks && message.blocks.length > 0) {
    for (let index = message.blocks.length - 1; index >= 0; index -= 1) {
      const block = message.blocks[index];
      if (block.kind === 'tool' && block.call.status === 'running') return block.call;
    }
    return undefined;
  }
  return message.toolCalls?.find((record) => record.status === 'running');
}

export function turnPhase(status: TurnStatus, message?: Message): TurnPhase {
  if (status === 'tools') {
    const running = runningTool(message);
    if (!running) return { kind: 'tool', label: '正在调用工具' };
    const name = toolDisplayName(running.name);
    return { kind: 'tool', label: `正在调用工具：${name}`, toolName: name };
  }
  if (hasVisibleText(message)) {
    return { kind: 'streaming', label: '正在生成…' };
  }
  return { kind: 'thinking', label: '正在思考…' };
}

/**
 * 计时起点：assistant 消息的 `createdAt`（发送时创建，正是“发出”那一刻）。
 * 时间戳无效时退回当前时刻——宁可显示 0 秒，也不显示负数或 NaN。
 */
export function turnStartedAt(message?: Message): number {
  const parsed = message ? Date.parse(message.createdAt) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

/** 已用秒数（向下取整，不从负值起步）；纯函数，便于在 node 里直接验证 */
export function elapsedSeconds(startedAt: number, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

/**
 * 「这一轮没有任何可显示的内容，只有失败」——即失败轮该不该渲染气泡壳。
 *
 * 判据只看那条 Message 自己（正文 / 思考 / 工具步骤 / 来源 / 语音转写都为空），
 * 不看 `session.error`：气泡壳是否为空是消息的属性，错误文案由调用方决定要不要内联。
 * 只有 `notice` 块的轮次仍算「空」：告知内联在失败轮里，不该因此给一个空气泡壳。
 * 全高对话用它决定「不画空气泡、把 MessageBar 内联在轮次里」；输入区用它决定
 * 「不要再重复一遍同一条错误」。
 */
export function isEmptyAssistantMessage(message: Message): boolean {
  if (message.role !== 'assistant') return false;
  const blocks = messageBlocks(message);
  if (blocks.some((block) => block.kind !== 'notice')) return false;
  if (message.content.trim().length > 0) return false;
  if ((message.reasoning ?? '').trim().length > 0) return false;
  if ((message.toolCalls ?? []).length > 0) return false;
  if ((message.sources ?? []).length > 0) return false;
  if (message.transcriptStatus === 'pending' || message.transcriptStatus === 'failed') return false;
  return true;
}
