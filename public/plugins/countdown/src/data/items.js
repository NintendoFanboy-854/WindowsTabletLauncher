/**
 * 倒数日数据层（纯 JS，不依赖 React）：
 * - 事件模型、日期换算（每年重复 / 今天 / 已过）、排序、校验
 * - 持久化走宿主配置（plugin.getConfig/setConfig，宿主写 plugin.<id>.<key>），
 *   卡片视图与设置/编辑浮层视图通过 storage 事件自动同步
 * - 到日提醒由卡片视图的 useDueReminder 触发（plugin.notify）
 */

import { plugin } from '/plugin-sdk.js';

export const ITEMS_KEY = 'items';
export const SETTINGS_KEY = 'settings';
export const EDITING_KEY = 'countdown.editing';
export const MAX_ITEMS = 50; // docs/components/countdown.md：数量达 50 时 add 返回错误

export const DEFAULT_SETTINGS = {
  showPast: true,
  highlightSoon: true,
};

/** 颜色只存 Fluent token 名；渲染时用 tokens[tokenName] 取实际颜色 */
export const COLOR_OPTIONS = [
  { id: 'accent', label: '主题色', token: 'colorBrandForeground1' },
  { id: 'blue', label: '蓝色', token: 'colorPaletteBlueForeground2' },
  { id: 'green', label: '绿色', token: 'colorPaletteGreenForeground1' },
  { id: 'orange', label: '橙色', token: 'colorPaletteOrangeForeground2' },
  { id: 'red', label: '红色', token: 'colorPaletteRedForeground1' },
  { id: 'purple', label: '紫色', token: 'colorPalettePurpleForeground2' },
  { id: 'teal', label: '青色', token: 'colorPaletteTealForeground2' },
];

const COLOR_BY_ID = new Map(COLOR_OPTIONS.map((color) => [color.id, color]));

export function colorTokenOf(colorId) {
  return (COLOR_BY_ID.get(colorId) ?? COLOR_OPTIONS[0]).token;
}

const pad2 = (n) => String(n).padStart(2, '0');

export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    showPast: typeof source.showPast === 'boolean' ? source.showPast : DEFAULT_SETTINGS.showPast,
    highlightSoon:
      typeof source.highlightSoon === 'boolean' ? source.highlightSoon : DEFAULT_SETTINGS.highlightSoon,
  };
}

export function normalizeItems(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.targetDate === 'string',
    )
    .map((item) => ({
      id: item.id,
      title: item.title,
      targetDate: item.targetDate,
      repeatYearly: Boolean(item.repeatYearly),
      color: COLOR_BY_ID.has(item.color) ? item.color : 'accent',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    }));
}

/* ------------------------------------------------------------------ */
/* 日期工具                                                            */
/* ------------------------------------------------------------------ */

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseDateString(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function toDateString(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** 周年日：2 月 29 日在平年按当月最后一天算 */
function anniversaryInYear(base, year) {
  const daysInMonth = new Date(year, base.getMonth() + 1, 0).getDate();
  return new Date(year, base.getMonth(), Math.min(base.getDate(), daysInMonth));
}

function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

/** 把一条记录换算成“今天视角”的展示数据 */
export function decorate(item, today = new Date()) {
  const base = parseDateString(item.targetDate);
  if (!base) return null;
  const todayStart = startOfDay(today);
  let target = base;
  if (item.repeatYearly) {
    const thisYear = anniversaryInYear(base, todayStart.getFullYear());
    target = thisYear >= todayStart ? thisYear : anniversaryInYear(base, todayStart.getFullYear() + 1);
  }
  const days = daysBetween(todayStart, target);
  const color = COLOR_BY_ID.get(item.color) ?? COLOR_OPTIONS[0];
  const sub = item.repeatYearly
    ? `每年 ${base.getMonth() + 1}月${base.getDate()}日`
    : toDateString(target);
  let status = 'future';
  if (days === 0) status = 'today';
  else if (days < 0) status = 'past';
  return {
    item,
    targetDate: toDateString(target),
    days,
    color,
    colorToken: color.token,
    sub,
    status,
  };
}

export function displayText(entry) {
  if (entry.days === 0) return '就是今天';
  if (entry.days > 0) return `还有 ${entry.days} 天`;
  return `已过 ${Math.abs(entry.days)} 天`;
}

/** 未来升序在前、过去按最近在前；过去事件可被设置过滤 */
export function sortEntries(entries) {
  entries.sort((a, b) => {
    const aPast = a.days < 0;
    const bPast = b.days < 0;
    if (aPast && bPast) return b.days - a.days;
    if (aPast) return 1;
    if (bPast) return -1;
    return a.days - b.days;
  });
  return entries;
}

export function visibleEntries(items, settings, today = new Date()) {
  const entries = [];
  for (const item of items) {
    const entry = decorate(item, today);
    if (!entry) continue;
    if (entry.days < 0 && !settings.showPast) continue;
    entries.push(entry);
  }
  return sortEntries(entries);
}

export function nextId() {
  return `cd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function validateDraft(draft) {
  const title = typeof draft?.title === 'string' ? draft.title.trim() : '';
  if (!title) return { ok: false, error: '请填写标题' };
  if (!parseDateString(draft.targetDate)) return { ok: false, error: '请选择合法日期' };
  return { ok: true, title };
}

/** 写一条“待编辑”信息给浮层视图（宿主 ?view=edit 是不同 iframe 文档） */
export function setEditingTarget(id) {
  try {
    localStorage.setItem(EDITING_KEY, JSON.stringify({ id: id ?? null, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function readEditingTarget() {
  try {
    const raw = localStorage.getItem(EDITING_KEY);
    if (!raw) return { id: null };
    const parsed = JSON.parse(raw);
    return { id: typeof parsed?.id === 'string' ? parsed.id : null };
  } catch {
    return { id: null };
  }
}

/* ------------------------------------------------------------------ */
/* Agent 工具共用（卡片视图与浮层视图都可调用）                          */
/* ------------------------------------------------------------------ */

export function toolList(items, args) {
  const includePast = args?.includePast !== false;
  const today = new Date();
  const entries = [];
  for (const item of items) {
    const entry = decorate(item, today);
    if (!entry) continue;
    if (!includePast && entry.days < 0) continue;
    entries.push(entry);
  }
  sortEntries(entries);
  return {
    today: toDateString(today),
    items: entries.map((entry) => ({
      id: entry.item.id,
      title: entry.item.title,
      targetDate: entry.targetDate,
      repeatYearly: entry.item.repeatYearly,
      color: entry.item.color,
      days: entry.days,
      status: entry.status,
      display: displayText(entry),
    })),
  };
}

export function toolAdd(items, args) {
  const title = typeof args?.title === 'string' ? args.title.trim() : '';
  const targetDate = typeof args?.targetDate === 'string' ? args.targetDate : '';
  if (!title) throw new Error('title 不能为空');
  if (!parseDateString(targetDate)) throw new Error('targetDate 必须是合法的 YYYY-MM-DD');
  if (items.length >= MAX_ITEMS) throw new Error(`最多 ${MAX_ITEMS} 条倒数日`);
  const color = COLOR_BY_ID.has(args?.color) ? args.color : 'accent';
  const item = {
    id: nextId(),
    title,
    targetDate,
    repeatYearly: Boolean(args?.repeatYearly),
    color,
    createdAt: new Date().toISOString(),
  };
  overwriteItems([...items, item]);
  const entry = decorate(item, new Date());
  return {
    id: item.id,
    title: item.title,
    targetDate: item.targetDate,
    repeatYearly: item.repeatYearly,
    color: item.color,
    days: entry ? entry.days : null,
    display: entry ? displayText(entry) : '',
  };
}

export function toolRemove(items, args) {
  const id = typeof args?.id === 'string' ? args.id : '';
  if (!id) throw new Error('id 不能为空');
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`找不到 id 为 ${id} 的倒数日`);
  overwriteItems(items.filter((candidate) => candidate.id !== id));
  return { removed: true, id, title: item.title };
}

/** 工具处理里没有 React state，直接写宿主配置 */
function overwriteItems(next) {
  plugin.setConfig(ITEMS_KEY, next).catch(() => {});
}

/* ------------------------------------------------------------------ */
/* 独立开发 / 截图：?demo=1 注入演示数据                                 */
/* ------------------------------------------------------------------ */

export async function seedDemoData() {
  const existing = await plugin.getConfig(ITEMS_KEY).catch(() => null);
  if (Array.isArray(existing) && existing.length > 0) return;
  const offset = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return toDateString(date);
  };
  const nowIso = new Date().toISOString();
  const year = new Date().getFullYear();
  const items = [
    { id: 'demo-1', title: '项目截止', targetDate: offset(3), repeatYearly: false, color: 'orange', createdAt: nowIso },
    {
      id: 'demo-2',
      title: '结婚纪念日',
      targetDate: `${year - 4}-10-19`,
      repeatYearly: true,
      color: 'red',
      createdAt: nowIso,
    },
    { id: 'demo-3', title: '期末考试', targetDate: offset(45), repeatYearly: false, color: 'purple', createdAt: nowIso },
    { id: 'demo-4', title: '搬家', targetDate: offset(-20), repeatYearly: false, color: 'blue', createdAt: nowIso },
    {
      id: 'demo-5',
      title: '妈妈生日',
      targetDate: '1968-04-12',
      repeatYearly: true,
      color: 'green',
      createdAt: nowIso,
    },
  ];
  await plugin.setConfig(ITEMS_KEY, items).catch(() => {});
}
