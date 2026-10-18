/**
 * 自适应网格几何：窗口尺寸 → 列数 / 单元格 / 行数。
 *
 * 规则来自 docs/DESIGN.md §1.1（并按 AUDIT V-22 补窄屏降列）：
 * - 列数：宽 ≥1280 → 8，900–1279 → 6，480–899 → 4，360–479 → 3，<360 → 2
 * - 单元格是正方形，96px ≤ cell ≤ 220px
 * - 行数 = floor(可用高度 / 单元格)，最少 4 行；页内不滚动
 *
 * 窄屏（<480）必须降列：320px 宽时 4 列 × 96px + 3 × 12px = 420px 必然横向溢出，
 * 降到 2 列后 2 × 96px + 12px = 204px < 280px 可用宽，网格能完整放进屏幕。
 *
 * 间距和留白取 Fluent 间距 token 的数值（token 在运行时是 CSS 变量，这里用其定义值，
 * 见 node_modules/@fluentui/tokens 的 spacings 定义），避免拍脑袋的魔法数字。
 */
import type { GridMetrics } from './types';

/** Fluent spacingHorizontalM = 12px：卡片间距 */
export const GRID_GAP = 12;
/** Fluent spacingHorizontalXL = 20px：桌面四周留白 */
export const GRID_PADDING = 20;

/** DESIGN.md 约束：单元格边长上下限 */
export const CELL_MIN = 96;
export const CELL_MAX = 220;
/** DESIGN.md 约束：一页最少 4 行 */
export const MIN_ROWS = 4;

/** 宽度断点 → 列数。顺序敏感：先匹配宽的那条 */
export const COLUMN_BREAKPOINTS: readonly { minWidth: number; columns: number }[] = [
  { minWidth: 1280, columns: 8 },
  { minWidth: 900, columns: 6 },
  { minWidth: 480, columns: 4 },
  { minWidth: 360, columns: 3 },
  { minWidth: 0, columns: 2 },
];

/** 窗口宽度（CSS px）→ 列数 */
export function columnsForWidth(viewportWidth: number): number {
  for (const breakpoint of COLUMN_BREAKPOINTS) {
    if (viewportWidth >= breakpoint.minWidth) return breakpoint.columns;
  }
  return COLUMN_BREAKPOINTS[COLUMN_BREAKPOINTS.length - 1].columns;
}

/**
 * 窗口尺寸 → 网格几何。
 *
 * 单元格先按可用宽度均分（再受 96–220 夹取），行数由可用高度除以单元格推导；
 * 高度装不下 4 行时反推缩小单元格，保证“最少 4 行”和“页内不滚动”同时成立。
 */
export function computeGridMetrics(viewportWidth: number, viewportHeight: number): GridMetrics {
  const columns = columnsForWidth(viewportWidth);
  const gap = GRID_GAP;
  const padding = GRID_PADDING;

  const availableWidth = Math.max(0, viewportWidth - padding * 2);
  const availableHeight = Math.max(0, viewportHeight - padding * 2);

  // 正方形单元格：宽度方向均分后夹取到 DESIGN.md 的区间
  let cell = Math.floor((availableWidth - (columns - 1) * gap) / columns);
  cell = Math.min(CELL_MAX, Math.max(CELL_MIN, cell));

  let rows = Math.max(MIN_ROWS, Math.floor((availableHeight + gap) / (cell + gap)));

  if (rows === MIN_ROWS) {
    // 可用高度不足 4 行：反推 cell 让 4 行能放下（仍不低于 96）
    const cellToFitFourRows = Math.floor((availableHeight - (MIN_ROWS - 1) * gap) / MIN_ROWS);
    if (cellToFitFourRows > 0 && cellToFitFourRows < cell) {
      cell = Math.max(CELL_MIN, cellToFitFourRows);
    }
  }

  rows = Math.max(MIN_ROWS, Math.floor((availableHeight + gap) / (cell + gap)));

  return {
    columns,
    rows,
    cell,
    gap,
    padding,
    width: columns * cell + (columns - 1) * gap,
    height: rows * cell + (rows - 1) * gap,
  };
}

/** 网格在窗口里居中时的左上角偏移（桌面层用它把逻辑坐标换成像素位置） */
export function gridOrigin(
  metrics: GridMetrics,
  viewportWidth: number,
  viewportHeight: number,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.round((viewportWidth - metrics.width) / 2)),
    y: Math.max(0, Math.round((viewportHeight - metrics.height) / 2)),
  };
}
