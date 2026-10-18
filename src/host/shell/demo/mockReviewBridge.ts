/**
 * 演示页用的复盘数据（mock bridge）。
 *
 * 复盘页的真实数据来自桌面插件的 `.stats` 工具；演示页没有挂桌面 iframe，
 * 所以用一个确定性的 mock 数据源把页面填满，方便看排版和截图。
 * 页面本身会打上「演示数据」徽标，不会让人误以为是真实统计。
 */

import type { AgentToolDecl } from '../../bridge/types';
import { dayKey, type ReviewBridge } from '../../pages/review/stats';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 16;

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

function buildTodoByDay(now: Date): Record<string, number> {
  const byDay: Record<string, number> = {};
  const end = startOfDay(now);
  for (let offset = 0; offset < WEEKS * 7; offset += 1) {
    const date = addDays(end, -offset);
    const weekday = date.getDay();
    // 确定性的“伪随机”：周末少、工作日多
    const seed = (date.getDate() * 7 + date.getMonth() * 31 + offset * 13) % 17;
    const count = weekday === 0 || weekday === 6 ? seed % 2 : seed % 4;
    if (count > 0) byDay[dayKey(date)] = count;
  }
  return byDay;
}

function sumRange(byDay: Record<string, number>, fromIso?: unknown, toIso?: unknown): number {
  const from = typeof fromIso === 'string' ? Date.parse(fromIso) : Number.NEGATIVE_INFINITY;
  const to = typeof toIso === 'string' ? Date.parse(toIso) : Number.POSITIVE_INFINITY;
  let sum = 0;
  for (const [date, count] of Object.entries(byDay)) {
    const time = Date.parse(`${date}T12:00:00`);
    if (time >= from && time <= to) sum += count;
  }
  return sum;
}

const MOCK_TOOLS: AgentToolDecl[] = [
  { name: 'todo.stats', description: '（演示 mock）待办完成统计' },
  { name: 'pomodoro.stats', description: '（演示 mock）专注轮次与分钟数' },
];

const POMODORO_BY_RANGE: Record<string, { completed: number; focusMinutes: number; streakDays: number }> = {
  today: { completed: 3, focusMinutes: 75, streakDays: 6 },
  week: { completed: 17, focusMinutes: 425, streakDays: 6 },
  month: { completed: 42, focusMinutes: 1055, streakDays: 6 },
};

export function createMockReviewBridge(now = new Date()): ReviewBridge {
  const todoByDay = buildTodoByDay(now);
  return {
    listTools: () => MOCK_TOOLS,
    async callTool(name: string, args: unknown) {
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      const params = (args ?? {}) as { range?: unknown; from?: unknown; to?: unknown };
      if (name === 'todo.stats') {
        return {
          from: params.from,
          to: params.to,
          completed: sumRange(todoByDay, params.from, params.to),
          created: 6,
          byDay: todoByDay,
          byList: {},
          byPriority: {},
        };
      }
      if (name === 'pomodoro.stats') {
        const range = typeof params.range === 'string' ? params.range : 'today';
        return { range, ...(POMODORO_BY_RANGE[range] ?? POMODORO_BY_RANGE.today) };
      }
      throw new Error(`mock bridge 没有工具 ${name}`);
    },
  };
}
