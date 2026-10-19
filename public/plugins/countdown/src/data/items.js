/**
 * 倒数日数据层（纯 JS，不依赖 React）。
 *
 * - 事件模型、日期换算（每年重复 / 今天 / 已过）、排序、校验、增删改；
 * - 持久化沿用宿主配置键 `items` / `settings`（宿主写 `plugin.countdown.*`），
 *   卡片、详情与 Agent 工具共用同一份数据；
 * - `normalizeItems` 只做读取侧迁移（补默认字段、过滤坏记录），不在加载时回写，
 *   已经保存的事件内容保持原样；
 * - Agent 工具与 UI 操作调用同一组 `addItem / updateItem / removeItem`。
 */

import { plugin } from '/plugin-sdk.js';

export const ITEMS_KEY = 'items';
export const SETTINGS_KEY = 'settings';
/** docs/components/countdown.md：数量上限沿用现有实现（50 条时 add 返回错误） */
export const MAX_ITEMS = 50;

export const DEFAULT_SETTINGS = Object.freeze({
  showPast: true,
  highlightSoon: true,
});

/** 颜色只存 Fluent token 名；渲染时用 tokens[tokenName] 取实际颜色 */
export const COLOR_OPTIONS = Object.freeze([
  { id: 'accent', label: '主题色', token: 'colorBrandForeground1' },
  { id: 'blue', label: '蓝色', token: 'colorPaletteBlueForeground2' },
  { id: 'green', label: '绿色', token: 'colorPaletteGreenForeground1' },
  { id: 'orange', label: '橙色', token: 'colorPaletteDarkOrangeForeground2' },
  { id: 'red', label: '红色', token: 'colorPaletteRedForeground1' },
  { id: 'purple', label: '紫色', token: 'colorPalettePurpleForeground2' },
  { id: 'teal', label: '青色', token: 'colorPaletteTealForeground2' },
]);

const COLOR_BY_ID = new Map(COLOR_OPTIONS.map((color) => [color.id, color]));
const DEFAULT_COLOR = COLOR_OPTIONS[0];

export function normalizeColor(color) {
  return COLOR_BY_ID.has(color) ? color : DEFAULT_COLOR.id;
}

export function colorTokenOf(colorId) {
  return (COLOR_BY_ID.get(colorId) ?? DEFAULT_COLOR).token;
}

export function colorLabelOf(colorId) {
  return (COLOR_BY_ID.get(colorId) ?? DEFAULT_COLOR).label;
}

const pad2 = (n) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* normalize                                                           */
/* ------------------------------------------------------------------ */

export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    showPast:
      typeof source.showPast === 'boolean' ? source.showPast : DEFAULT_SETTINGS.showPast,
    highlightSoon:
      typeof source.highlightSoon === 'boolean'
        ? source.highlightSoon
        : DEFAULT_SETTINGS.highlightSoon,
  };
}

/**
 * 读取侧迁移：未知颜色回落到主题色，缺失的布尔/创建时间补默认值。
 * 合法事件的 title / targetDate 不改写；加载时不回写宿主配置。
 */
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
      color: normalizeColor(item.color),
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
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
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
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

const monthDayFormatter = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
});
const weekdayFormatter = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' });

function formatMonthDay(date) {
  return monthDayFormatter.format(date);
}

function formatWeekday(date) {
  return weekdayFormatter.format(date);
}

/* ------------------------------------------------------------------ */
/* 展示数据                                                            */
/* ------------------------------------------------------------------ */

/**
 * 把一条记录换算成“今天视角”的展示数据：
 * days > 0 未来、0 今天、< 0 已过去；每年重复换算到下一个周年日。
 */
export function decorate(item, today = new Date()) {
  const base = parseDateString(item.targetDate);
  if (!base) return null;

  const todayStart = startOfDay(today);
  let target = base;
  if (item.repeatYearly) {
    const thisYear = anniversaryInYear(base, todayStart.getFullYear());
    target =
      thisYear >= todayStart
        ? thisYear
        : anniversaryInYear(base, todayStart.getFullYear() + 1);
  }

  const days = daysBetween(todayStart, target);
  let status = 'future';
  if (days === 0) status = 'today';
  else if (days < 0) status = 'past';

  const color = COLOR_BY_ID.get(item.color) ?? DEFAULT_COLOR;
  const dateLabel = formatMonthDay(target);
  const weekdayLabel = formatWeekday(target);
  const subtitle = item.repeatYearly
    ? `每年 ${dateLabel} · ${weekdayLabel}`
    : `${dateLabel} · ${weekdayLabel}`;

  return {
    item,
    target,
    targetDate: toDateString(target),
    days,
    status,
    color,
    colorToken: color.token,
    dateLabel,
    weekdayLabel,
    subtitle,
  };
}

/** 卡片与工具用的口语化天数 */
export function displayText(entry) {
  if (entry.days === 0) return '就是今天';
  if (entry.days > 0) return `还有 ${entry.days} 天`;
  return `已过 ${Math.abs(entry.days)} 天`;
}

/**
 * 按展示顺序排序：未来升序在前（今天算未来段），过去按最近的在前后置；
 * 同一天多条按创建时间升序（countdown.md「同一天多条」）。
 */
export function sortEntries(entries) {
  entries.sort((a, b) => {
    const aPast = a.days < 0;
    const bPast = b.days < 0;
    if (aPast !== bPast) return aPast ? 1 : -1;
    if (a.days !== b.days) return aPast ? b.days - a.days : a.days - b.days;
    const aCreated = a.item.createdAt || '';
    const bCreated = b.item.createdAt || '';
    if (aCreated !== bCreated) return aCreated < bCreated ? -1 : 1;
    return 0;
  });
  return entries;
}

/** 不过滤显示设置的全部可见记录（详情分组用） */
export function listEntries(items, today = new Date()) {
  const entries = [];
  for (const item of items) {
    const entry = decorate(item, today);
    if (entry) entries.push(entry);
  }
  return sortEntries(entries);
}

/** 应用 `showPast` 设置后的记录（卡片用） */
export function visibleEntries(items, settings, today = new Date()) {
  const entries = listEntries(items, today);
  return settings.showPast ? entries : entries.filter((entry) => entry.days >= 0);
}

/* ------------------------------------------------------------------ */
/* 写操作：UI 与 Agent 工具共用                                         */
/* ------------------------------------------------------------------ */

export function nextId() {
  return `cd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function validateDraft(draft) {
  const title = typeof draft?.title === 'string' ? draft.title.trim() : '';
  if (!title) return { ok: false, error: '请填写标题' };
  if (!parseDateString(draft?.targetDate)) return { ok: false, error: '请选择合法日期' };
  return { ok: true, title };
}

/**
 * 新增一条：返回新的 items 数组与写入后的记录。
 * 数量上限与字段校验失败时抛错（UI 显示在表单里，工具返回 ok=false）。
 */
export function addItem(items, draft) {
  const validation = validateDraft(draft);
  if (!validation.ok) throw new Error(validation.error);
  if (items.length >= MAX_ITEMS) throw new Error(`最多 ${MAX_ITEMS} 条倒数日`);

  const item = {
    id: nextId(),
    title: validation.title,
    targetDate: draft.targetDate,
    repeatYearly: Boolean(draft.repeatYearly),
    color: normalizeColor(draft.color),
    createdAt: new Date().toISOString(),
  };
  return { items: [...items, item], item };
}

/** 更新一条：只改传入的字段，保留 id / createdAt 与未传字段 */
export function updateItem(items, patch) {
  const id = typeof patch?.id === 'string' ? patch.id : '';
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) throw new Error(`找不到 id 为 ${id} 的倒数日`);

  const current = items[index];
  const title =
    patch.title === undefined
      ? current.title
      : typeof patch.title === 'string'
        ? patch.title.trim()
        : '';
  if (!title) throw new Error('请填写标题');

  const targetDate = patch.targetDate === undefined ? current.targetDate : patch.targetDate;
  if (!parseDateString(targetDate)) throw new Error('请选择合法日期');

  const nextItem = {
    ...current,
    title,
    targetDate,
    repeatYearly:
      patch.repeatYearly === undefined ? current.repeatYearly : Boolean(patch.repeatYearly),
    color: patch.color === undefined ? current.color : normalizeColor(patch.color),
  };
  return {
    items: items.map((item) => (item.id === id ? nextItem : item)),
    item: nextItem,
  };
}

export function removeItem(items, id) {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`找不到 id 为 ${id} 的倒数日`);
  return { items: items.filter((candidate) => candidate.id !== id), item };
}

/** 设置 patch：至少提供一个已知字段，值必须是布尔 */
export function applySettingsPatch(settings, patch) {
  const source = patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {};
  const hasShowPast = Object.prototype.hasOwnProperty.call(source, 'showPast');
  const hasHighlightSoon = Object.prototype.hasOwnProperty.call(source, 'highlightSoon');
  if (!hasShowPast && !hasHighlightSoon) {
    throw new Error('至少提供 showPast 或 highlightSoon');
  }
  if (hasShowPast && typeof source.showPast !== 'boolean') {
    throw new Error('showPast 必须是布尔值');
  }
  if (hasHighlightSoon && typeof source.highlightSoon !== 'boolean') {
    throw new Error('highlightSoon 必须是布尔值');
  }
  return normalizeSettings({
    ...settings,
    ...(hasShowPast ? { showPast: source.showPast } : null),
    ...(hasHighlightSoon ? { highlightSoon: source.highlightSoon } : null),
  });
}

/* ------------------------------------------------------------------ */
/* Agent 工具（与 UI 共用同一组写操作）                                 */
/* ------------------------------------------------------------------ */

function itemPayload(item, today = new Date()) {
  const entry = decorate(item, today);
  return {
    id: item.id,
    title: item.title,
    targetDate: entry ? entry.targetDate : item.targetDate,
    repeatYearly: item.repeatYearly,
    color: item.color,
    days: entry ? entry.days : null,
    status: entry ? entry.status : 'future',
    display: entry ? displayText(entry) : '',
  };
}

export function toolList(items, args) {
  const includePast = args?.includePast !== false;
  const today = new Date();
  const entries = listEntries(items, today).filter(
    (entry) => includePast || entry.days >= 0,
  );
  return {
    today: toDateString(today),
    count: entries.length,
    items: entries.map((entry) => itemPayload(entry.item, today)),
  };
}

export function toolAdd(items, args) {
  const { items: nextItems, item } = addItem(items, args);
  return { nextItems, result: itemPayload(item) };
}

export function toolUpdate(items, args) {
  const { items: nextItems, item } = updateItem(items, args);
  return { nextItems, result: itemPayload(item) };
}

export function toolRemove(items, args) {
  const id = typeof args?.id === 'string' ? args.id : '';
  if (!id) throw new Error('id 不能为空');
  const { items: nextItems, item } = removeItem(items, id);
  return {
    nextItems,
    result: { removed: true, id: item.id, title: item.title },
  };
}

export function toolSettingsGet(settings) {
  return { ...normalizeSettings(settings) };
}

export function toolSettingsSet(settings, args) {
  const nextSettings = applySettingsPatch(settings, args);
  return { nextSettings, result: { ...nextSettings } };
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
    {
      id: 'demo-today',
      title: '产品发布',
      targetDate: offset(0),
      repeatYearly: false,
      color: 'teal',
      createdAt: nowIso,
    },
    {
      id: 'demo-1',
      title: '项目截止',
      targetDate: offset(3),
      repeatYearly: false,
      color: 'orange',
      createdAt: nowIso,
    },
    {
      id: 'demo-6',
      title: '体检',
      targetDate: offset(10),
      repeatYearly: false,
      color: 'blue',
      createdAt: nowIso,
    },
    {
      id: 'demo-3',
      title: '期末考试',
      targetDate: offset(45),
      repeatYearly: false,
      color: 'purple',
      createdAt: nowIso,
    },
    {
      id: 'demo-2',
      title: '结婚纪念日',
      targetDate: `${year - 4}-10-19`,
      repeatYearly: true,
      color: 'red',
      createdAt: nowIso,
    },
    {
      id: 'demo-5',
      title: '妈妈生日',
      targetDate: '1968-04-12',
      repeatYearly: true,
      color: 'green',
      createdAt: nowIso,
    },
    {
      id: 'demo-4',
      title: '搬家',
      targetDate: offset(-20),
      repeatYearly: false,
      color: 'blue',
      createdAt: nowIso,
    },
  ];
  await plugin.setConfig(ITEMS_KEY, items).catch(() => {});
}
