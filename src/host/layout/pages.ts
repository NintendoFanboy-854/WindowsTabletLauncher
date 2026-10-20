/**
 * 多页操作：增页 / 删页 / 调顺序 / 切页 / 页面指示器。
 *
 * 页面在数据里没有独立实体，只用 WidgetInstance.page 的序号表达；
 * 所以调顺序 = 重映射 page 序号，删页 = 把该页组件顺延到剩下的页。
 */
import { autoPlace, pagesUsed } from './grid';
import { widgetKey } from './types';
import type { LayoutState, PageIndicator, WidgetInstance } from './types';

/** DESIGN.md §1.3：页数超过 7 时指示点折叠成“当前页/总页数”胶囊 */
export const PAGE_INDICATOR_COLLAPSE_AT = 7;

export function clampPage(page: number, pages: number): number {
  return Math.max(0, Math.min(Math.max(1, pages) - 1, Math.floor(page) || 0));
}

/** 页面指示点模型 */
export function pageIndicator(totalPages: number, activePage: number): PageIndicator {
  const total = Math.max(1, totalPages);
  const active = clampPage(activePage, total);
  if (total > PAGE_INDICATOR_COLLAPSE_AT) return { kind: 'capsule', total, active };
  return { kind: 'dots', total, active };
}

export function pageWidgets(widgets: WidgetInstance[], page: number): WidgetInstance[] {
  return widgets.filter((widget) => widget.page === page);
}

export function setActivePage(state: LayoutState, page: number): LayoutState {
  const activePage = clampPage(page, state.pages);
  if (activePage === state.activePage) return state;
  return { ...state, activePage };
}

/** 在末尾加一页并切过去；已有页内容不动 */
export function addPage(state: LayoutState): LayoutState {
  return { ...state, pages: state.pages + 1, activePage: state.pages };
}

/**
 * 删除一页：
 * - 桌面至少保留 1 页；
 * - 该页上的组件先顺延到相邻页，再按第一个空位摆放，放不下才继续往后开页；
 * - 删除当前页之后的页时，当前页号保持不变。
 */
export function removePage(
  state: LayoutState,
  page: number,
  columns: number,
  rows: number,
): LayoutState {
  if (state.pages <= 1) return state;
  const target = clampPage(page, state.pages);

  const survivors: WidgetInstance[] = [];
  const orphans: WidgetInstance[] = [];
  for (const widget of state.widgets) {
    if (widget.page === target) orphans.push(widget);
    else survivors.push({ ...widget, page: widget.page > target ? widget.page - 1 : widget.page });
  }

  const pagesAfter = state.pages - 1;
  const landingPage = Math.min(target, pagesAfter - 1);
  const placedOrphans = autoPlace(
    orphans.map((widget) => ({ ...widget, page: landingPage })),
    columns,
    rows,
  );
  const widgets = [...survivors, ...placedOrphans];
  const pages = Math.max(pagesAfter, pagesUsed(widgets, 1));
  const activePage =
    state.activePage > target
      ? state.activePage - 1
      : Math.min(state.activePage, pages - 1);

  return { ...state, widgets, pages, activePage: clampPage(activePage, pages) };
}

/** 页面调顺序：from/to 都是页序号，组件跟着页走 */
export function reorderPage(state: LayoutState, from: number, to: number): LayoutState {
  const total = state.pages;
  const source = clampPage(from, total);
  const destination = clampPage(to, total);
  if (source === destination) return state;

  const order = Array.from({ length: total }, (_, index) => index);
  const [moved] = order.splice(source, 1);
  order.splice(destination, 0, moved);
  const pageMap = new Map<number, number>();
  order.forEach((oldPage, newPage) => pageMap.set(oldPage, newPage));

  return {
    ...state,
    widgets: state.widgets.map((widget) => ({
      ...widget,
      page: pageMap.get(widget.page) ?? widget.page,
    })),
    pages: total,
    activePage: pageMap.get(state.activePage) ?? state.activePage,
  };
}

/**
 * 从桌面删除组件（D-18 修订：持久删除）。
 *
 * - 从 widgets 移除实例；
 * - 把 `pluginId:widgetId` 写进 removed，reload 后 reconcileLayout 不会自动摆回；
 * - 页数不回收，避免用户手动加的空白页被顺手删掉。
 */
export function removeWidgetFromLayout(state: LayoutState, uid: string): LayoutState {
  const target = state.widgets.find((widget) => widget.uid === uid);
  if (!target) return state;
  const widgets = state.widgets.filter((widget) => widget.uid !== uid);
  const key = widgetKey(target.pluginId, target.widgetId);
  const removed = state.removed.includes(key) ? state.removed : [...state.removed, key];
  return { ...state, widgets, removed, pages: Math.max(state.pages, pagesUsed(widgets, 1)) };
}
