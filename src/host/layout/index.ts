/**
 * 布局引擎（A3）对外入口。
 *
 * 纯数据层：窗口尺寸 → 网格几何；布局状态 → 增删页/移动/改尺寸/降级重排/持久化。
 * 桌面层（src/host/desktop）只负责把这里的逻辑坐标渲染成 DOM 与手势。
 */
export * from './types';
export {
  CELL_MAX,
  CELL_MIN,
  COLUMN_BREAKPOINTS,
  FOOTER_HEIGHT,
  FOOTER_PILL_ESTIMATE,
  GRID_GAP,
  GRID_PADDING,
  MIN_ROWS,
  PANEL_COLUMNS,
  PANEL_ROWS,
  columnsForWidth,
  computeGridMetrics,
  gridBounds,
  gridInsets,
  gridOrigin,
  layoutFrame,
} from './breakpoints';
export type { FrameRect, LayoutFrame } from './breakpoints';
export {
  readFooterPillHeight,
  reportFooterPillHeight,
  reportFooterStatusBarHeight,
  resetFooterPillHeight,
  subscribeFooterPillHeight,
  useFooterPillHeight,
} from './footer';
export {
  autoPlace,
  compareReadingOrder,
  fabReservedCell,
  findFirstFit,
  layoutNeedsReflow,
  moveWidgetToPage,
  normalizeSize,
  occupancyOf,
  overlapsFabReserved,
  pagesUsed,
  placeWidget,
  rectFitsInGrid,
  rectOf,
  rectsOverlap,
  reflowLayout,
  removeWidget,
  resizeWidget,
  tryMoveWidget,
} from './grid';
export {
  PAGE_INDICATOR_COLLAPSE_AT,
  addPage,
  clampPage,
  pageIndicator,
  pageWidgets,
  removePage,
  removeWidgetFromLayout,
  reorderPage,
  setActivePage,
} from './pages';
export {
  LAYOUT_STORAGE_KEY,
  LAYOUT_STORAGE_VERSION,
  LEGACY_LAYOUT_STORAGE_KEY,
  clearLayout,
  loadLayout,
  migrateLegacyLayout,
  sanitizeLayout,
  saveLayout,
} from './persist';
export {
  notifyDesktopPresenceChanged,
  onAddWidgetRequest,
  requestAddWidget,
  useDesktopPresence,
} from './presence';
export type { AddWidgetRequest } from './presence';
