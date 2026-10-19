/**
 * 复盘页的数据层（B3）。
 *
 * 数据来自各插件注册的 `*.stats` Agent 工具（A5 桥接层 listTools / callTool）。
 * 各插件约定的统计参数/返回不完全一致，所以这里做两件事：
 * 1. 用“最大公约数”参数调用：`{ range, from, to }` —— 支持 range 的插件（pomodoro.stats）
 *    用 range，支持 from/to 的插件（todo.stats）用时间范围；
 * 2. 把返回统一收口成数字字段，插件没给的就留空（页面显示“—”而不是编数据）。
 *
 * 没有插件提供 `*.stats` 时返回空快照，页面显示空状态。
 */

import type { AgentToolDecl } from '../../bridge/types';

export type ReviewRange = 'yesterday' | 'week' | 'month';

/** 复盘页只需要桥接层的两个能力，方便测试或预览时替换数据源 */
export interface ReviewBridge {
  listTools(): AgentToolDecl[];
  callTool(name: string, args: unknown, options?: { signal?: AbortSignal }): Promise<unknown>;
  /** 工具声明变化（插件 ready 陆续到达）；不传时只做一次静默等待 */
  onToolsChange?(handler: () => void): () => void;
}

export interface ProviderRangeStats {
  tool: string;
  /** 插件 id（工具名前缀，如 todo） */
  provider: string;
  range: ReviewRange;
  ok: boolean;
  error?: string;
  completed?: number;
  created?: number;
  focusMinutes?: number;
  streakDays?: number;
}

export interface ProviderDailyStats {
  provider: string;
  byDay: Record<string, number>;
}

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface ReviewSnapshot {
  tools: string[];
  ranges: Record<ReviewRange, ProviderRangeStats[]>;
  daily: ProviderDailyStats[];
  heatmap: { days: HeatmapDay[]; max: number; total: number };
  yesterday: Record<string, number>;
  fetchedAt: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** 热力图窗口：16 周（取整周，避免半截列） */
export const HEATMAP_WEEKS = 16;

/**
 * 插件 iframe 与宿主页面同时挂载时（深链直达 `?page=review`），插件的工具声明是
 * 陆续到达的：todo 后台 iframe 往往比 pomodoro 组件 iframe 先 ready。若在第一份
 * 声明到达时就取数，复盘页会漏掉后到的插件。这里等工具列表静默一小段时间，
 * 有上限，不阻塞没有插件的场景。
 */
const TOOLS_SETTLE_TIMEOUT_MS = 3000;
const TOOLS_SETTLE_QUIET_MS = 250;
const TOOLS_POLL_MS = 100;

function statsToolNames(bridge: ReviewBridge): string {
  return bridge
    .listTools()
    .filter(isStatsTool)
    .map((tool) => tool.name)
    .sort()
    .join('|');
}

async function waitForStatsTools(
  bridge: ReviewBridge,
  signal?: AbortSignal,
): Promise<AgentToolDecl[]> {
  const deadline = Date.now() + TOOLS_SETTLE_TIMEOUT_MS;
  let lastNames = statsToolNames(bridge);
  let lastChangeAt = Date.now();
  for (;;) {
    const names = statsToolNames(bridge);
    if (names !== lastNames) {
      lastNames = names;
      lastChangeAt = Date.now();
    }
    const settled = lastNames !== '' && Date.now() - lastChangeAt >= TOOLS_SETTLE_QUIET_MS;
    if (settled || Date.now() >= deadline || signal?.aborted) {
      return bridge.listTools().filter(isStatsTool);
    }
    await new Promise((resolve) => setTimeout(resolve, TOOLS_POLL_MS));
  }
}

/**
 * 宿主不认识具体插件：展示名从 manifest.name 取。
 * 插件名单由 ReviewPage 通过 PluginManager/usePlugins 传入（深链时也会随扫描结果更新）。
 */
export function providerLabel(provider: string, pluginNames?: Record<string, string>): string {
  return pluginNames?.[provider] ?? provider;
}

/**
 * 统计主值的量词。manifest 目前没有声明字段，这是纯展示口径（不参与插件识别）；
 * 未知插件回落「条」。插件名不在这里，统一走 providerLabel（manifest.name）。
 */
const PROVIDER_UNITS: Record<string, string> = {
  todo: '项任务',
  pomodoro: '轮专注',
  sedentary: '次',
  countdown: '个事件',
};

export function completedUnit(provider: string): string {
  return PROVIDER_UNITS[provider] ?? '条';
}

// ---------- 日期工具（本地时区） ----------

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  const offset = (day.getDay() + 6) % 7; // 周一为一周开始
  return addDays(day, -offset);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

function readByDay(record: Record<string, unknown>): Record<string, number> | null {
  const raw = asRecord(record.byDay);
  if (!raw) return null;
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'number' && Number.isFinite(value)) result[key] = value;
  }
  return result;
}

function providerOf(toolName: string): string {
  const prefix = toolName.split('.')[0];
  return prefix || toolName;
}

/** 工具名过滤：约定统计工具以 `.stats` 结尾（todo.stats / pomodoro.stats） */
export function isStatsTool(tool: AgentToolDecl): boolean {
  return /\.stats$/i.test(tool.name);
}

interface RangeArgs {
  range: 'today' | 'week' | 'month';
  from: string;
  to: string;
}

function rangeArgs(range: ReviewRange, now: Date): RangeArgs {
  const to = now.toISOString();
  switch (range) {
    case 'week':
      return { range: 'week', from: startOfWeek(now).toISOString(), to };
    case 'month':
      return { range: 'month', from: startOfMonth(now).toISOString(), to };
    case 'yesterday':
    default:
      return { range: 'today', from: startOfDay(now).toISOString(), to };
  }
}

function dailyArgs(now: Date): RangeArgs {
  const end = startOfDay(now);
  const start = addDays(startOfWeek(end), -(HEATMAP_WEEKS - 1) * 7);
  return { range: 'month', from: start.toISOString(), to: now.toISOString() };
}

function heatmapWindow(now: Date): { start: Date; end: Date; days: HeatmapDay[] } {
  const end = startOfDay(now);
  const start = addDays(startOfWeek(end), -(HEATMAP_WEEKS - 1) * 7);
  const days: HeatmapDay[] = [];
  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    days.push({ date: dayKey(cursor), count: 0 });
  }
  return { start, end, days };
}

export function emptySnapshot(): ReviewSnapshot {
  return {
    tools: [],
    ranges: { yesterday: [], week: [], month: [] },
    daily: [],
    heatmap: { days: [], max: 0, total: 0 },
    yesterday: {},
    fetchedAt: Date.now(),
  };
}

/** 拉取并聚合复盘数据；单个插件的工具失败只影响它自己的那一格 */
export async function loadReviewSnapshot(
  bridge: ReviewBridge,
  options: { signal?: AbortSignal; now?: Date } = {},
): Promise<ReviewSnapshot> {
  const now = options.now ?? new Date();
  const tools = await waitForStatsTools(bridge, options.signal);
  if (tools.length === 0) return emptySnapshot();

  const rangeKeys: ReviewRange[] = ['week', 'month'];
  const window = heatmapWindow(now);

  const call = async (toolName: string, args: RangeArgs) => {
    try {
      const result = await bridge.callTool(toolName, args, options.signal ? { signal: options.signal } : undefined);
      return { ok: true as const, result };
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const [rangeResults, dailyResults] = await Promise.all([
    Promise.all(
      rangeKeys.map(async (range) => {
        const args = rangeArgs(range, now);
        const settled = await Promise.all(tools.map((tool) => call(tool.name, args)));
        return { range, settled };
      }),
    ),
    Promise.all(tools.map((tool) => call(tool.name, dailyArgs(now)))),
  ]);

  const ranges: ReviewSnapshot['ranges'] = { yesterday: [], week: [], month: [] };
  for (const { range, settled } of rangeResults) {
    ranges[range] = settled.map((outcome, index): ProviderRangeStats => {
      const tool = tools[index];
      const provider = providerOf(tool.name);
      const base: ProviderRangeStats = {
        tool: tool.name,
        provider,
        range,
        ok: outcome.ok,
      };
      if (!outcome.ok) return { ...base, error: outcome.error };
      const record = asRecord(outcome.result);
      if (!record) return { ...base, ok: false, error: '统计工具返回了非对象结果' };
      return {
        ...base,
        completed: readNumber(record, ['completed', 'done', 'finished']),
        created: readNumber(record, ['created', 'added']),
        focusMinutes: readNumber(record, ['focusMinutes', 'focusMinutesTotal', 'minutes']),
        streakDays: readNumber(record, ['streakDays', 'streak']),
      };
    });
  }

  const daily: ProviderDailyStats[] = [];
  const yesterday: Record<string, number> = {};
  const merged: Record<string, number> = {};
  dailyResults.forEach((outcome, index) => {
    const tool = tools[index];
    const provider = providerOf(tool.name);
    if (!outcome.ok) return;
    const record = asRecord(outcome.result);
    if (!record) return;
    const byDay = readByDay(record);
    if (!byDay || Object.keys(byDay).length === 0) return;
    daily.push({ provider, byDay });
    for (const [date, count] of Object.entries(byDay)) {
      merged[date] = (merged[date] ?? 0) + count;
    }
  });

  for (const day of window.days) {
    day.count = merged[day.date] ?? 0;
  }
  // 昨日：优先用按天数据；插件没给 byDay 的，页面显示“无按日数据”
  const yesterdayDate = dayKey(addDays(startOfDay(now), -1));
  for (const entry of daily) {
    const count = entry.byDay[yesterdayDate];
    if (typeof count === 'number') yesterday[entry.provider] = count;
  }

  const max = window.days.reduce((current, day) => Math.max(current, day.count), 0);
  const total = window.days.reduce((current, day) => current + day.count, 0);

  return {
    tools: tools.map((tool) => tool.name),
    ranges,
    daily,
    heatmap: { days: window.days, max, total },
    yesterday,
    fetchedAt: Date.now(),
  };
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
