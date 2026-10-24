/**
 * 网格占位运算：找空位、初始化摆放、列数变化降级重排、移动/换格/改尺寸。
 *
 * 所有函数都是纯函数，输入输出都是逻辑坐标（page/col/row/size），不碰 DOM 和像素。
 */
import type { CellRect, WidgetInstance, WidgetSize } from './types';

const cellKey = (col: number, row: number): string => `${col}:${row}`;

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/** 把尺寸夹取到当前网格能放下的范围（列跨不超过列数，行跨不超过行数） */
export function normalizeSize(size: WidgetSize, columns: number, rows: number): WidgetSize {
  const w = Math.max(1, Math.min(columns, Math.floor(Number(size?.[0]) || 1)));
  const h = Math.max(1, Math.min(rows, Math.floor(Number(size?.[1]) || 1)));
  return [w, h];
}

export function rectOf(widget: WidgetInstance): CellRect {
  return { col: widget.col, row: widget.row, w: widget.size[0], h: widget.size[1] };
}

/** 两个矩形是否重叠（半开区间） */
export function rectsOverlap(a: CellRect, b: CellRect): boolean {
  return a.col < b.col + b.w && b.col < a.col + a.w && a.row < b.row + b.h && b.row < a.row + a.h;
}

/** 矩形是否完全落在网格内 */
export function rectFitsInGrid(rect: CellRect, columns: number, rows: number): boolean {
  return (
    isNonNegativeInt(rect.col) &&
    isNonNegativeInt(rect.row) &&
    rect.col + rect.w <= columns &&
    rect.row + rect.h <= rows
  );
}

/** 按“从左到右、从上到下”的阅读顺序排序（同一页内），用于降级重排 */
export function compareReadingOrder(a: WidgetInstance, b: WidgetInstance): number {
  if (a.page !== b.page) return a.page - b.page;
  if (a.row !== b.row) return a.row - b.row;
  return a.col - b.col;
}

/** 某一页上已被占用的格子集合 */
export function occupancyOf(
  widgets: WidgetInstance[],
  page: number,
  excludeUid?: string,
): Set<string> {
  const occupied = new Set<string>();
  for (const widget of widgets) {
    if (widget.page !== page) continue;
    if (excludeUid && widget.uid === excludeUid) continue;
    for (let c = widget.col; c < widget.col + widget.size[0]; c++) {
      for (let r = widget.row; r < widget.row + widget.size[1]; r++) {
        occupied.add(cellKey(c, r));
      }
    }
  }
  return occupied;
}

function canPlace(occupied: ReadonlySet<string>, rect: CellRect): boolean {
  for (let c = rect.col; c < rect.col + rect.w; c++) {
    for (let r = rect.row; r < rect.row + rect.h; r++) {
      if (occupied.has(cellKey(c, r))) return false;
    }
  }
  return true;
}

function occupy(occupied: Set<string>, rect: CellRect): void {
  for (let c = rect.col; c < rect.col + rect.w; c++) {
    for (let r = rect.row; r < rect.row + rect.h; r++) {
      occupied.add(cellKey(c, r));
    }
  }
}

/**
 * 右下角保留格：网格最后一列 × 最后一行的 1×1 格。
 *
 * **它服务的是展开后的面板，不是收起态的入口**：收起态的 orb 已经挪到网格**之外**的
 * 底部条右端（见 `agent/ui/entryGeometry` 与 `breakpoints.layoutFrame`），
 * 与网格内放什么卡片无关。保留格留的是「展开面板落点周围的视觉安全区」：
 * 对话面板是 3 列宽、从网格上缘铺到底部条下缘的 `position: fixed` 浮层，
 * 它盖住网格右下角时，这一格空着才不会出现“卡片正好被面板右缘切掉一角”的观感。
 *
 * 行为保持不变（不因入口迁出网格而删除保留格）：删掉它会改动所有放置/移动/重排路径，
 * 收益只是多出一格可用位置，不值得在本次几何调整里连带改动。
 *
 * 保留格不参与居中计算：网格四边留白由 `breakpoints.layoutFrame` 决定，
 * 这一格只是「面板展开时的落脚位」，8×5 下恒为 (col 7, row 4)。
 *
 * 命名说明：函数名 `fabReservedCell` / `overlapsFabReserved` 沿用历史命名（改函数名会
 * 波及全部放置/移动/改尺寸/重排调用点，收益不值），但它服务的是 **Agent 面板**，
 * 用户可见与文档层一律称「Agent 入口」。
 */
export function fabReservedCell(columns: number, rows: number): CellRect {
  return { col: Math.max(0, columns - 1), row: Math.max(0, rows - 1), w: 1, h: 1 };
}

/** 矩形是否命中 Agent 入口（右下保留格） */
export function overlapsFabReserved(rect: CellRect, columns: number, rows: number): boolean {
  return rectsOverlap(rect, fabReservedCell(columns, rows));
}

/** 在已占用集合里补上 Agent 入口（右下保留格）（所有页都保留：入口在每一页都可见） */
function withFabReserved(
  occupied: ReadonlySet<string>,
  columns: number,
  rows: number,
): Set<string> {
  const next = new Set(occupied);
  occupy(next, fabReservedCell(columns, rows));
  return next;
}

/** 在指定页里按“从左到右、从上到下”找第一个放得下 w×h 的空位 */
export function findFirstFit(
  occupied: ReadonlySet<string>,
  w: number,
  h: number,
  columns: number,
  rows: number,
  startRow = 0,
  startCol = 0,
): { col: number; row: number } | null {
  for (let row = Math.max(0, startRow); row + h <= rows; row++) {
    const colStart = row === startRow ? Math.max(0, startCol) : 0;
    for (let col = colStart; col + w <= columns; col++) {
      const rect: CellRect = { col, row, w, h };
      if (canPlace(occupied, rect)) return { col, row };
    }
  }
  return null;
}

/** 页数 = 最大页号 + 1（至少 1 页） */
export function pagesUsed(widgets: WidgetInstance[], minPages = 1): number {
  let pages = minPages;
  for (const widget of widgets) pages = Math.max(pages, widget.page + 1);
  return pages;
}

/**
 * 初始化摆放：尊重 manifest 声明的 cell，占不到就找该页第一个空位；
 * 该页放不下就依次找后面的页，最后才新开一页。返回的坐标保证不重叠。
 */
export function autoPlace(
  widgets: WidgetInstance[],
  columns: number,
  rows: number,
): WidgetInstance[] {
  const occupied = withFabReserved(new Set<string>(), columns, rows);
  const declaredPages = pagesUsed(widgets, 1);
  let maxPage = declaredPages - 1;
  const placed: WidgetInstance[] = [];

  for (const widget of [...widgets].sort(compareReadingOrder)) {
    const size = normalizeSize(widget.size, columns, rows);
    const rect: CellRect = { col: widget.col, row: widget.row, w: size[0], h: size[1] };
    const preferredPage = Math.max(0, Math.floor(Number(widget.page) || 0));

    let page = preferredPage;
    let position: { col: number; row: number } | null = null;

    // 1) manifest 里声明的格子，若空闲且放得下就用它
    if (rectFitsInGrid(rect, columns, rows) && canPlace(occupied, rect)) {
      position = { col: rect.col, row: rect.row };
    }

    // 2) 从声明页开始，按页找第一个空位
    if (!position) {
      for (let candidate = preferredPage; candidate <= maxPage; candidate++) {
        const found = findFirstFit(occupied, size[0], size[1], columns, rows);
        if (found) {
          page = candidate;
          position = found;
          break;
        }
      }
    }

    // 3) 后面的页也满了，新开一页
    if (!position) {
      page = maxPage + 1;
      maxPage = page;
      // 新页也要避开右下角保留格；极端窄网格放不下时退回 (0,0)，由调用方决定是否接受。
      position =
        findFirstFit(withFabReserved(new Set<string>(), columns, rows), size[0], size[1], columns, rows) ??
        { col: 0, row: 0 };
    }

    occupy(occupied, { ...position, w: size[0], h: size[1] });
    placed.push({ ...widget, page, col: position.col, row: position.row, size });
  }

  return placed.sort(compareReadingOrder);
}

/**
 * 往桌面添加一个组件（编辑模式「添加组件」/ 插件页「添加到桌面」共用）。
 *
 * 放置顺序：当前页第一个空位 → 后续页的第一空位 → 都放不下就新开一页。
 * 不回头用前面的页：用户明确在当前页附近加东西，跨到已翻过的页反而找不到。
 * 纯函数，调用方负责持久化与把 activePage 切到落点页。
 */
export function placeWidget(
  widgets: WidgetInstance[],
  pages: number,
  activePage: number,
  instance: WidgetInstance,
  columns: number,
  rows: number,
): { widgets: WidgetInstance[]; pages: number; page: number } {
  const size = normalizeSize(instance.size, columns, rows);
  const totalPages = Math.max(1, Math.floor(pages) || 1);
  const startPage = Math.max(0, Math.min(totalPages - 1, Math.floor(activePage) || 0));

  for (let page = startPage; page < totalPages; page++) {
    const occupied = withFabReserved(occupancyOf(widgets, page), columns, rows);
    const found = findFirstFit(occupied, size[0], size[1], columns, rows);
    if (found) {
      return {
        widgets: [
          ...widgets,
          { ...instance, page, col: found.col, row: found.row, size },
        ],
        pages: totalPages,
        page,
      };
    }
  }

  const page = totalPages;
  const empty = withFabReserved(new Set<string>(), columns, rows);
  const fallback =
    findFirstFit(empty, size[0], size[1], columns, rows) ?? { col: 0, row: 0 };
  return {
    widgets: [...widgets, { ...instance, page, col: fallback.col, row: fallback.row, size }],
    pages: page + 1,
    page,
  };
}

/**
 * 列数/行数变化后的降级重排（DESIGN.md §1.1）：
 * - 尺寸先降级：w = min(w, 列数)，h = min(h, 行数)
 * - 整页按“从左到右、从上到下”重排到第一个放得下的空位
 * - 当前页放不下的组件顺延到下一页，空页保留（用户手动加的页不能丢）
 */
export function reflowLayout(
  widgets: WidgetInstance[],
  columns: number,
  rows: number,
  minPages = 1,
): { widgets: WidgetInstance[]; pages: number } {
  const sorted = [...widgets].sort(compareReadingOrder);
  const inputPages = pagesUsed(sorted, minPages);
  const spill = new Map<number, WidgetInstance[]>();
  const output: WidgetInstance[] = [];
  let lastUsedPage = 0;
  let pageCursor = 0;

  const placeOnPage = (page: number, list: WidgetInstance[]): void => {
    const occupied = withFabReserved(occupancyOf(output, page), columns, rows);
    for (const widget of list) {
      const size = normalizeSize(widget.size, columns, rows);
      const found = findFirstFit(occupied, size[0], size[1], columns, rows);
      if (!found) {
        const queue = spill.get(page + 1) ?? [];
        queue.push(widget);
        spill.set(page + 1, queue);
        continue;
      }
      occupy(occupied, { ...found, w: size[0], h: size[1] });
      output.push({ ...widget, page, col: found.col, row: found.row, size });
      lastUsedPage = Math.max(lastUsedPage, page);
    }
  };

  for (let page = 0; page < inputPages; page++) {
    const carry = spill.get(page) ?? [];
    const own = sorted.filter((widget) => widget.page === page);
    placeOnPage(page, [...carry, ...own]);
  }

  // 顺延出来的组件可能继续往后溢，逐页消化直到清空
  while (spill.size > 0) {
    const nextPage = Math.max(...spill.keys());
    const pending = spill.get(nextPage) ?? [];
    spill.delete(nextPage);
    pageCursor = Math.max(pageCursor, nextPage);
    placeOnPage(pageCursor, pending);
  }

  return {
    widgets: output.sort(compareReadingOrder),
    pages: Math.max(1, minPages, inputPages, lastUsedPage + 1),
  };
}

/** 布局是否需要一次降级重排（越界或重叠） */
export function layoutNeedsReflow(widgets: WidgetInstance[], columns: number, rows: number): boolean {
  const pages = pagesUsed(widgets, 1);
  for (const widget of widgets) {
    const rect = rectOf(widget);
    if (!rectFitsInGrid(rect, columns, rows)) return true;
    if (overlapsFabReserved(rect, columns, rows)) return true;
    if (widget.page < 0 || widget.page >= pages) return true;
  }
  for (let page = 0; page < pages; page++) {
    const onPage = widgets.filter((widget) => widget.page === page);
    for (let i = 0; i < onPage.length; i++) {
      for (let j = i + 1; j < onPage.length; j++) {
        if (rectsOverlap(rectOf(onPage[i]), rectOf(onPage[j]))) return true;
      }
    }
  }
  return false;
}

function replaceWidget(
  widgets: WidgetInstance[],
  uid: string,
  patch: Partial<WidgetInstance> | ((widget: WidgetInstance) => WidgetInstance),
): WidgetInstance[] {
  return widgets.map((widget) => {
    if (widget.uid !== uid) return widget;
    return typeof patch === 'function' ? patch(widget) : { ...widget, ...patch };
  });
}

/**
 * 拖拽松手时提交移动：
 * - 目标格空闲 → 移动；
 * - 只和一个同尺寸组件重叠 → 两者交换位置；
 * - 其它情况返回 null，表示不移动（原位吸附回去）。
 */
export function tryMoveWidget(
  widgets: WidgetInstance[],
  uid: string,
  target: { page: number; col: number; row: number },
  columns: number,
  rows: number,
): WidgetInstance[] | null {
  const moved = widgets.find((widget) => widget.uid === uid);
  if (!moved) return null;

  const size = normalizeSize(moved.size, columns, rows);
  const page = Math.max(0, Math.floor(target.page));
  const col = Math.max(0, Math.min(columns - size[0], Math.floor(target.col)));
  const row = Math.max(0, Math.min(rows - size[1], Math.floor(target.row)));

  if (page === moved.page && col === moved.col && row === moved.row) return null;

  const targetRect: CellRect = { col, row, w: size[0], h: size[1] };
  if (overlapsFabReserved(targetRect, columns, rows)) return null;
  const others = widgets.filter((widget) => widget.uid !== uid && widget.page === page);
  const collisions = others.filter((widget) => rectsOverlap(targetRect, rectOf(widget)));

  if (collisions.length === 0) {
    return replaceWidget(widgets, uid, { page, col, row });
  }

  // 换格：只在同一页、尺寸相同、且只碰到一个组件时做
  if (page !== moved.page || collisions.length > 1) return null;
  const other = collisions[0];
  if (other.size[0] !== size[0] || other.size[1] !== size[1]) return null;

  const oldRect: CellRect = { col: moved.col, row: moved.row, w: size[0], h: size[1] };
  const otherOldRect = rectOf(other);
  const uninvolved = others.filter((widget) => widget.uid !== other.uid);
  if (uninvolved.some((widget) => rectsOverlap(oldRect, rectOf(widget)))) return null;
  if (uninvolved.some((widget) => rectsOverlap(otherOldRect, rectOf(widget)))) return null;

  return widgets.map((widget) => {
    if (widget.uid === uid) return { ...widget, col: other.col, row: other.row };
    if (widget.uid === other.uid) return { ...widget, col: moved.col, row: moved.row };
    return widget;
  });
}

/** 编辑模式改尺寸：优先原地放大/缩小，原地放不下就找同页第一个空位；返回 null 表示改不了 */
export function resizeWidget(
  widgets: WidgetInstance[],
  uid: string,
  size: WidgetSize,
  columns: number,
  rows: number,
): WidgetInstance[] | null {
  const target = widgets.find((widget) => widget.uid === uid);
  if (!target) return null;

  const next = normalizeSize(size, columns, rows);
  if (next[0] === target.size[0] && next[1] === target.size[1]) return null;

  const occupied = withFabReserved(occupancyOf(widgets, target.page, uid), columns, rows);
  const sameRect: CellRect = { col: target.col, row: target.row, w: next[0], h: next[1] };
  if (rectFitsInGrid(sameRect, columns, rows) && canPlace(occupied, sameRect)) {
    return replaceWidget(widgets, uid, { size: next });
  }

  const found = findFirstFit(occupied, next[0], next[1], columns, rows);
  if (!found) return null;
  return replaceWidget(widgets, uid, { size: next, col: found.col, row: found.row });
}

/** 从桌面删除组件 */
export function removeWidget(widgets: WidgetInstance[], uid: string): WidgetInstance[] {
  return widgets.filter((widget) => widget.uid !== uid);
}

/** 跨页拖动：目标页找空位落下（允许落到空页）；返回 null 表示目标页放不下 */
export function moveWidgetToPage(
  widgets: WidgetInstance[],
  uid: string,
  page: number,
  target: { col: number; row: number } | null,
  columns: number,
  rows: number,
): WidgetInstance[] | null {
  const moved = widgets.find((widget) => widget.uid === uid);
  if (!moved) return null;
  const size = normalizeSize(moved.size, columns, rows);
  const targetPage = Math.max(0, Math.floor(page));
  const occupied = withFabReserved(occupancyOf(widgets, targetPage, uid), columns, rows);

  let position: { col: number; row: number } | null = null;
  if (target) {
    const rect: CellRect = {
      col: Math.max(0, Math.min(columns - size[0], Math.floor(target.col))),
      row: Math.max(0, Math.min(rows - size[1], Math.floor(target.row))),
      w: size[0],
      h: size[1],
    };
    if (rectFitsInGrid(rect, columns, rows) && canPlace(occupied, rect)) {
      position = { col: rect.col, row: rect.row };
    }
  }
  if (!position) position = findFirstFit(occupied, size[0], size[1], columns, rows);
  if (!position) return null;

  return replaceWidget(widgets, uid, { page: targetPage, col: position.col, row: position.row });
}
