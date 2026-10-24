/**
 * 折叠行摘要：块 → 一句人话。纯函数（不碰 React、不查表匹配具体工具名），便于直接单测。
 *
 * 生成式（设计 §6.2，命中即停）：
 *   1. `verb + object + quantum`（主语从 `name` 的动作段取语义词素，宾语从 `args` 取第一个
 *      有意义的标量，量词从 `result` 的形状推断）；
 *   2. 拿不到宾语 → `调用 <工具显示名>`；
 *   3. 连名字都没有 → `调用了工具`。
 *
 * 三条硬约束：
 * - **只映射语义词素，不映射具体工具名**：新增插件工具、改工具参数结构，这里零改动；
 * - 失败**不写进摘要**：摘要会被省略号截断，失败必须在行尾固定的状态标记里（BlockRow 负责）；
 * - 拿不到结构化结果时按降级阶梯降级，不编造内容。
 */
import type { NoticeBlock, ThinkingBlock, ToolBlock } from '../types';
import { toolDisplayName } from './turnPhase';

/** 宾语值最多占几个显示单位（全角算 2），超出加省略号 */
const OBJECT_MAX_UNITS = 24;

/** 键名词典：只影响文案可读性，缺词时直接显示裸键名/裸值 */
const KEY_LABELS: Record<string, string> = {
  path: '路径',
  file: '文件',
  filename: '文件',
  name: '名称',
  title: '标题',
  query: '关键词',
  keyword: '关键词',
  keywords: '关键词',
  id: '编号',
  city: '城市',
  place: '地点',
  text: '内容',
  content: '内容',
  task: '任务',
  item: '条目',
  url: '链接',
  minutes: '分钟',
  count: '数量',
};

/** 宾语优先键（按「含该词」匹配，不是精确键名） */
const OBJECT_KEY_HINTS = [
  'path',
  'file',
  'name',
  'title',
  'query',
  'keyword',
  'id',
  'city',
  'place',
  'text',
];

interface VerbForms {
  /** 过去时（完成/失败）：「读取了」 */
  done: string;
  /** 进行时（不含「了」）：「正在读取」 */
  doing: string;
}

/**
 * 动作段 → 动词。动作段取工具名最后一段（`plugin.action` / `plugin__action`）。
 * 只认语义词素；未知动作有宾语时退回「查询」（「调用了 北京」不成句），无宾语才退回「调用」。
 */
export function verbOf(name: string): VerbForms {
  const display = toolDisplayName(name);
  const segments = display.split(/[._]/).filter(Boolean);
  const action = (segments[segments.length - 1] ?? '').toLowerCase();
  if (/^(read|list|get|load|fetch)/.test(action)) {
    return { done: '读取了', doing: '读取' };
  }
  if (/^(query|lookup|resolve)/.test(action)) {
    return { done: '查询了', doing: '查询' };
  }
  if (/^(search|find|filter)/.test(action)) {
    return { done: '搜索了', doing: '搜索' };
  }
  if (/^(create|add|append|insert|write|set|update|save|put)/.test(action)) {
    return { done: '添加了', doing: '添加' };
  }
  if (/^(delete|remove|clear|drop|del)/.test(action)) {
    return { done: '删除了', doing: '删除' };
  }
  if (/^(open|start|begin|toggle|enable|run|launch)/.test(action)) {
    return { done: '启动了', doing: '启动' };
  }
  return { done: '查询了', doing: '查询' };
}

/** 全角字符记 2 个显示单位（与半高截断同一口径） */
const FULL_WIDTH = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;

function charWidth(char: string): number {
  return FULL_WIDTH.test(char) ? 2 : 1;
}

function displayUnits(text: string): number {
  let total = 0;
  for (const char of text) total += charWidth(char);
  return total;
}

function truncateUnits(text: string, max: number): string {
  if (displayUnits(text) <= max) return text;
  let used = 0;
  let out = '';
  for (const char of text) {
    const width = charWidth(char);
    // 末尾要留一个「…」的位置
    if (used + width > max - 2) break;
    out += char;
    used += width;
  }
  return `${out}…`;
}

function scalarText(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const flat = value.replace(/\s+/g, ' ').trim();
    return flat || undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? '是' : '否';
  return undefined;
}

/** 数字/布尔值单独出现时含义不清，补一个中文键名；字符串值本身已经足够 */
function labelled(key: string, raw: unknown, text: string): string {
  if (typeof raw !== 'string') {
    const label = KEY_LABELS[key.toLowerCase()];
    if (label) return `${label} ${text}`;
  }
  return text;
}

/** 参数 → 宾语：优先键名命中，其次第一个标量；值得不到就返回 undefined（走降级） */
export function objectOf(args: unknown): string | undefined {
  if (args === null || args === undefined) return undefined;
  if (typeof args === 'string') {
    const text = args.replace(/\s+/g, ' ').trim();
    return text ? truncateUnits(text, OBJECT_MAX_UNITS) : undefined;
  }
  if (typeof args !== 'object' || Array.isArray(args)) return undefined;

  const entries = Object.entries(args as Record<string, unknown>).filter(
    ([, value]) => scalarText(value) !== undefined,
  );
  if (entries.length === 0) return undefined;
  const preferred = entries.find(([key]) =>
    OBJECT_KEY_HINTS.some((hint) => key.toLowerCase().includes(hint)),
  );
  const [key, value] = preferred ?? entries[0];
  return truncateUnits(labelled(key, value, scalarText(value) as string), OBJECT_MAX_UNITS);
}

/**
 * 结果 → 量词/指纹。只做**形状推断**：
 * 数组 → N 项；唯一数组字段 → N 项；字符串 → N 字；数字 → 数值本身；布尔/`{ok:true}` → 空。
 */
export function quantumOf(result: unknown): string | undefined {
  if (result === undefined || result === null) return undefined;
  if (Array.isArray(result)) return `${result.length} 项`;
  if (typeof result === 'string') {
    const flat = result.replace(/\s+/g, ' ').trim();
    return flat ? `${flat.length} 字` : undefined;
  }
  if (typeof result === 'number') return Number.isFinite(result) ? String(result) : undefined;
  if (typeof result !== 'object') return undefined;
  const arrays = Object.values(result as Record<string, unknown>).filter((value) =>
    Array.isArray(value),
  );
  if (arrays.length === 1) return `${(arrays[0] as unknown[]).length} 项`;
  return undefined;
}

/** 思考块的一行摘要：进行中说「正在…」，完成后报字数（不写内容） */
export function summarizeThinking(block: ThinkingBlock): string {
  if (block.open) return '正在深度思考…';
  const length = block.text.trim().length;
  if (length === 0) return '已深度思考';
  const count = length >= 1000 ? `${(length / 1000).toFixed(1)}k` : String(length);
  return `已深度思考（${count} 字）`;
}

/** 工具块的一行摘要（失败文案不在这里：失败由行尾固定标记表达，不会被省略号吃掉） */
export function summarizeToolBlock(block: ToolBlock): string {
  const { call } = block;
  const name = toolDisplayName(call.name) || '工具';
  const verb = verbOf(call.name);
  const object = objectOf(call.args);

  if (call.status === 'running') {
    return object ? `正在${verb.doing} ${object}…` : `正在调用 ${name}…`;
  }
  const quantum = quantumOf(call.result);
  if (!object) {
    if (call.status === 'error') return `调用 ${name}`;
    if (quantum) return `调用了 ${name}，${quantum}`;
    return call.result === undefined || call.result === '' ? `调用了 ${name}（无返回内容）` : `调用了 ${name}`;
  }
  if (call.status === 'error') return `${verb.done} ${object}`;
  if (call.result === undefined || call.result === '') return `${verb.done} ${object}（无返回内容）`;
  return quantum ? `${verb.done} ${object}，${quantum}` : `${verb.done} ${object}`;
}

/** 告知块的一行文字：文案由会话层给，这里只透传（渲染层不拼句子） */
export function summarizeNotice(block: NoticeBlock): string {
  return block.text;
}

/** 展开区的 JSON：字符串直出、undefined 显式说明，其余 pretty-print */
export function prettyJson(value: unknown): string {
  if (value === undefined) return '（无返回内容）';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
