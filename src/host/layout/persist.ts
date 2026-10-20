/**
 * 布局持久化：localStorage 键 `wtsl.layout`（DESIGN.md §5）。
 *
 * 存的是逻辑坐标（页、列、行、尺寸档位），不存像素；窗口尺寸变了由布局引擎重排。
 * 旧原型存在 `wtsl.layout.v1` 的数组会迁移过来。
 *
 * v3（D-18 修订）起额外保存 `removed`：用户主动删掉的组件键，reload 后不再被
 * reconcileLayout 自动摆回。读取兼容 v2（视为 removed: []）。
 */
import { layoutNeedsReflow, normalizeSize, pagesUsed, reflowLayout } from './grid';
import { widgetKey } from './types';
import type { LayoutState, LayoutStorage, PersistedLayout, WidgetInstance, WidgetSize } from './types';

export const LAYOUT_STORAGE_KEY = 'wtsl.layout';
export const LEGACY_LAYOUT_STORAGE_KEY = 'wtsl.layout.v1';
export const LAYOUT_STORAGE_VERSION = 3;
/** 上一个公开的存档版本：没有 removed 字段，读取时补空数组 */
const LAYOUT_STORAGE_VERSION_V2 = 2;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : null;
}

function toNonNegativeInt(value: unknown): number | null {
  const parsed = toInt(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
}

function toNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function parseSize(value: unknown): WidgetSize | null {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const w = toInt(value[0]);
  const h = toInt(value[1]);
  if (w === null || h === null || w < 1 || h < 1) return null;
  return [w, h];
}

function parseSizes(value: unknown, fallback: WidgetSize): WidgetSize[] {
  if (!Array.isArray(value)) return [fallback];
  const sizes: WidgetSize[] = [];
  for (const entry of value) {
    const size = parseSize(entry);
    if (size) sizes.push(size);
  }
  return sizes.length > 0 ? sizes : [fallback];
}

/** 已移除组件键：非空字符串，去重；不做格式猜测（插件 id / 组件 id 都允许带冒号） */
function parseRemoved(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const removed: string[] = [];
  for (const entry of value) {
    const key = toNonEmptyString(entry);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    removed.push(key);
  }
  return removed;
}

function parseWidget(value: unknown): WidgetInstance | null {
  if (!isRecord(value)) return null;
  const uid = toNonEmptyString(value.uid);
  const pluginId = toNonEmptyString(value.pluginId);
  const widgetId = toNonEmptyString(value.widgetId);
  const size = parseSize(value.size);
  const page = toNonNegativeInt(value.page);
  const col = toInt(value.col);
  const row = toInt(value.row);
  if (!uid || !pluginId || !widgetId || !size || page === null || col === null || row === null) {
    return null;
  }
  const title = toNonEmptyString(value.title) ?? widgetId;
  return {
    uid,
    pluginId,
    widgetId,
    title,
    page,
    col: Math.max(0, col),
    row: Math.max(0, row),
    size,
    sizes: parseSizes(value.sizes, size),
  };
}

/** 读旧原型（`wtsl.layout.v1`，固定 8×5 那版）的数组格式并转成新结构 */
export function migrateLegacyLayout(raw: unknown): LayoutState | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const widgets: WidgetInstance[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    const uid = toNonEmptyString(entry.uid) ?? toNonEmptyString(entry.id);
    const pluginId = toNonEmptyString(entry.pluginId);
    const widgetId = toNonEmptyString(entry.widgetId);
    const col = toNonNegativeInt(entry.col);
    const row = toNonNegativeInt(entry.row);
    const w = toNonNegativeInt(entry.w) ?? toNonNegativeInt((entry.size as unknown[] | undefined)?.[0]);
    const h = toNonNegativeInt(entry.h) ?? toNonNegativeInt((entry.size as unknown[] | undefined)?.[1]);
    if (!uid || !pluginId || !widgetId || col === null || row === null || !w || !h || w < 1 || h < 1) {
      continue;
    }
    if (seen.has(uid)) continue;
    seen.add(uid);
    widgets.push({
      uid,
      pluginId,
      widgetId,
      title: toNonEmptyString(entry.title) ?? widgetId,
      page: toNonNegativeInt(entry.page) ?? 0,
      col,
      row,
      size: [w, h],
      sizes: [[w, h]],
    });
  }
  if (widgets.length === 0) return null;
  return { widgets, pages: pagesUsed(widgets, 1), activePage: 0, removed: [] };
}

/** 校验 + 归位：坏数据丢弃，越界/重叠的布局触发降级重排；removed 去重并剔除已在桌面的键 */
export function sanitizeLayout(
  layout: LayoutState,
  columns: number,
  rows: number,
): LayoutState {
  const seen = new Set<string>();
  const present = new Set<string>();
  const widgets: WidgetInstance[] = [];
  for (const raw of layout.widgets) {
    const widget = parseWidget(raw);
    if (!widget || seen.has(widget.uid)) continue;
    seen.add(widget.uid);
    present.add(widgetKey(widget.pluginId, widget.widgetId));
    widgets.push({
      ...widget,
      page: Math.max(0, Math.min(Math.max(1, layout.pages) - 1, widget.page)),
      size: normalizeSize(widget.size, columns, rows),
      sizes: widget.sizes,
    });
  }
  // 不变量：一个组件不可能同时“在桌面上”和“已被移除”。
  const removed = parseRemoved(layout.removed).filter((key) => !present.has(key));

  let pages = Math.max(1, Math.floor(layout.pages) || 1, pagesUsed(widgets, 1));
  let activePage = Math.max(0, Math.min(pages - 1, Math.floor(layout.activePage) || 0));

  if (layoutNeedsReflow(widgets, columns, rows)) {
    const reflowed = reflowLayout(widgets, columns, rows, pages);
    return {
      widgets: reflowed.widgets,
      pages: Math.max(pages, reflowed.pages),
      activePage,
      removed,
    };
  }

  return { widgets, pages, activePage, removed };
}

function defaultStorage(): LayoutStorage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

function readJson(storage: LayoutStorage, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function parsePersisted(raw: unknown): LayoutState | null {
  if (!isRecord(raw)) return null;
  const version = toInt(raw.version);
  // v2（无 removed）继续读；写入统一升到 v3。
  if (version !== LAYOUT_STORAGE_VERSION && version !== LAYOUT_STORAGE_VERSION_V2) return null;
  const removed = version === LAYOUT_STORAGE_VERSION ? parseRemoved(raw.removed) : [];
  const widgets: WidgetInstance[] = [];
  if (Array.isArray(raw.widgets)) {
    const seen = new Set<string>();
    for (const entry of raw.widgets) {
      const widget = parseWidget(entry);
      if (!widget || seen.has(widget.uid)) continue;
      seen.add(widget.uid);
      widgets.push(widget);
    }
  }
  // 允许“桌面为空但移除记录非空”（用户删光所有小组件）持久化；
  // 两者都空说明没有有效存档，退回默认布局。
  if (widgets.length === 0 && removed.length === 0) return null;
  const pages = Math.max(1, toNonNegativeInt(raw.pages) ?? pagesUsed(widgets, 1), pagesUsed(widgets, 1));
  const activePage = Math.max(0, Math.min(pages - 1, toNonNegativeInt(raw.activePage) ?? 0));
  return { widgets, pages, activePage, removed };
}

/** 从 localStorage 读布局；新键没有就尝试迁移旧键。坏数据返回 null */
export function loadLayout(storage: LayoutStorage | null = defaultStorage()): LayoutState | null {
  if (!storage) return null;
  const current = parsePersisted(readJson(storage, LAYOUT_STORAGE_KEY));
  if (current) return current;
  const legacy = migrateLegacyLayout(readJson(storage, LEGACY_LAYOUT_STORAGE_KEY));
  if (legacy) return legacy;
  return null;
}

export function saveLayout(state: LayoutState, storage: LayoutStorage | null = defaultStorage()): void {
  if (!storage) return;
  const payload: PersistedLayout = {
    version: LAYOUT_STORAGE_VERSION,
    pages: state.pages,
    activePage: state.activePage,
    widgets: state.widgets,
    removed: state.removed,
    savedAt: Date.now(),
  };
  try {
    storage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // 隐私模式/配额满时静默失败：布局退化为本次会话有效
  }
}

export function clearLayout(storage: LayoutStorage | null = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(LAYOUT_STORAGE_KEY);
    storage.removeItem(LEGACY_LAYOUT_STORAGE_KEY);
  } catch {
    // 同上，读不到就当没存过
  }
}
