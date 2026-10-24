/**
 * 自适应网格几何：窗口尺寸 → 列数 / 单元格 / 行数。
 *
 * 规则来自 docs/DESIGN.md §1.1 与 wtsl-density-host.md §3.1：
 * - 列数：宽 ≥1280 → 8，900–1279 → 6，480–899 → 4，360–479 → 3，<360 → 2
 * - 单元格是正方形，96px ≤ cell ≤ 220px
 * - 行数 = floor((可用高度 + gutter) / (cell + gutter))，最少 4 行；页内不滚动
 *
 * 参考设备 1440×960：gap = 12、最小留白 20，cell = floor((1400 − 7×12) / 8) = 164，
 * rows = floor((920 + 12) / 176) = 5；网格 1396×868。
 *
 * 底部条（左说明条 pill + 右 chat 入口）与网格的关系由**一个 gutter** 决定，不再是一条
 * 等高带子：说明条实测高度 `H_p` 参与推导，整块「网格 + g + pill」在屏幕内垂直居中，
 * chat 入口的下缘**取 pill 的下缘**（同一个值，不是两套规则）。1440×960 / H_p=26：
 *
 * ```text
 * Hg     = rows*cell + (rows-1)*g                    5×164 + 4×12 = 868
 * unionH = Hg + g + H_p                              868 + 12 + 26 = 906
 * insetY = (vh - unionH) / 2                         (960-906)/2 = 27
 * grid   = (22, 27)-(1418, 895)
 * pill   = top = grid.bottom + g = 907，height = H_p = 26    → 底 933
 * entry  = 56×56 → (1362, 877)-(1418, 933)            [下缘 = pill.bottom]
 * ```
 * 于是上净空 = 下净空 = 27（下净空 = vh − pill.bottom），说明条上缘到网格下缘 = 12 =
 * widget 之间的 gutter。所有数由 `layoutFrame` 算出，代码里不写死。
 *
 * 窄屏（<480）必须降列：320px 宽时 4 列 × 96px + 3 × 12px = 420px 必然横向溢出，
 * 降到 2 列后 2 × 96px + 12px = 204px < 280px 可用宽，网格能完整放进屏幕。
 *
 * 间距和留白取 Fluent 间距 token 的数值（token 在运行时是 CSS 变量，这里用其定义值，
 * 见 node_modules/@fluentui/tokens 的 spacings 定义），避免拍脑袋的魔法数字。
 */
import { webLightTheme } from '@fluentui/react-components';
import type { GridMetrics } from './types';

/** 从 Fluent theme 的原始值取像素数；`tokens.*` 是 CSS 变量引用，parseFloat 会得到 NaN。 */
const tokenPx = (value: string) => Number.parseFloat(value);

/** Fluent spacingHorizontalM = 12：全站唯一卡片 gutter；值从 token 解析，不手写 */
export const GRID_GAP = tokenPx(webLightTheme.spacingHorizontalM);
/**
 * Fluent spacingHorizontalXL = 20：推导 cell / row 时的**最小**留白。
 * 它不是最终四边留白——最终留白由 `layoutFrame` 的「网格 + g + 说明条整块居中」决定
 * （1440×960 / H_p=26 下水平 22 / 上 27 / 网格下净空 65），浮层对齐请用 `layoutFrame`。
 */
export const GRID_PADDING = tokenPx(webLightTheme.spacingHorizontalXL);

/**
 * Agent 入口（收起态 orb）直径 = `spacingHorizontalXXXL`(32) + `spacingHorizontalXXL`(24) = 56。
 *
 * 它**不再等于底部条的高度**：底部条现在是「pill 行 + 上方一个 gutter」，高度由实测的
 * 说明条高度 `H_p` 参与推导（见 `layoutFrame`）。入口仍是一个 56 的圆，它的**下缘**与
 * 说明条下缘共线（= `pill.bottom`），上缘则向上越过网格下缘与 gutter 区（56 > 12 + 26）——
 * 这是「两件东西底边对齐、各自尺寸独立」的必然结果，不是算错。
 * 取 Fluent spacing 档位而不是写死 56，与 `entryGeometry.AGENT_ENTRY_SIZE` 同源
 * （后者直接复用这个常量，两边不会再漂移）。
 */
export const FOOTER_HEIGHT =
  tokenPx(webLightTheme.spacingHorizontalXXXL) + tokenPx(webLightTheme.spacingHorizontalXXL);

/**
 * 说明条 pill 的**首帧估计高度**（真实高度由内容决定，运行时实测后覆盖，见 `./footer`）。
 *
 * 由说明条自己的 CSS 换算而来，不写死数值：`Text size={200}` 的行高 + 上下 padding +
 * 上下描边 = `lineHeightBase200`(16) + 2×`spacingVerticalXS`(4) + 2×`strokeWidthThin`(1) = 26。
 * 它只在「还没测到」时使用；实测值与之相等时不会产生任何重排。
 */
export const FOOTER_PILL_ESTIMATE =
  tokenPx(webLightTheme.lineHeightBase200) +
  2 * tokenPx(webLightTheme.spacingVerticalXS) +
  2 * tokenPx(webLightTheme.strokeWidthThin);

/** 展开面板横向占的列数上限：3 列（对话面板仍是最窄的可读浮层），窄屏按实际列数收敛 */
export const PANEL_COLUMNS = 3;
/** 语音窗纵向占的行数上限：2 行（“半高”的栅格化定义），矮屏按实际行数收敛 */
export const PANEL_ROWS = 2;

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

/** 页面坐标系里的矩形（px）：right/bottom 是**外缘坐标**，不是右/下内边距 */
export interface FrameRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * 屏幕布局的**唯一事实来源**：网格 + 底部条（左说明条 / 右 chat 入口）+ 展开面板。
 *
 * 下游（桌面卡片、壁纸说明条、Agent 入口与展开面板）一律从这里取数，不许各自再算一遍；
 * 想改留白就改这里，各处的口径不会分叉。
 */
export interface LayoutFrame {
  /** 网格左缘 = 右缘留白（水平居中后左右相等） */
  insetX: number;
  /** 网格上缘 = 顶部净空；底部净空（vh − pill.bottom）与之相等，整块居中 */
  insetY: number;
  /** 卡片网格：`(insetX, insetY)-(vw-insetX, insetY+Hg)`，1440×960 / H_p=26 下 (22,27)-(1418,895) */
  grid: FrameRect;
  /**
   * 说明条 pill 所在的一整行（左缘/宽度与网格齐平，供 dock 定位）：
   * `top = grid.bottom + gap`、`height = pillHeight`；1440×960 / H_p=26 下 (22,907)-(1418,933)。
   */
  pill: FrameRect;
  /** 说明条实测高度（调用方传入的 `H_p`，回显出来免得下游再量一遍） */
  pillHeight: number;
  /**
   * chat 入口所在的带子：左右与网格齐平，`bottom = pill.bottom`、
   * `height = FOOTER_HEIGHT`。它**不从 grid.bottom 起算**：入口比 pill 高，
   * 上缘会越过网格下缘（1440×960 下 footer.top 877 < grid.bottom 895）。
   */
  footer: FrameRect;
  /**
   * chat 入口圆心 y = footer 的垂直中心（= pill.bottom − FOOTER_HEIGHT/2）。
   *
   * 只用来定位**铺满该带子的入口圆**。说明条不用这个值：它与入口按**下缘**共线
   * （`align-items:flex-end`，下缘 = pill.bottom = footer.bottom），
   * 若按中轴对齐，26 高的 pill 与 56 高的入口底边会差 15，肉眼看就是没对齐。
   */
  axis: number;
  /** 收起态 chat 入口：直径 = `FOOTER_HEIGHT`，右缘 = 网格右缘、下缘 = pill 下缘 */
  entry: { size: number; x: number; y: number };
  /** 展开态浮层：右缘/下缘贴 footer，是 `position: fixed` 的覆盖层，不占网格、不改变布局 */
  panel: { chat: FrameRect; voice: FrameRect };
  /** 栅格原始量（面板宽高要用整数个 cell + gutter 表达，消费者不必再算一遍） */
  cell: number;
  gap: number;
  columns: number;
  rows: number;
}

/** 由四边拼出矩形（width/height 一并算好，避免调用方各自减一遍） */
function frameRect(left: number, top: number, right: number, bottom: number): FrameRect {
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

/**
 * 初始偏移 = 「网格 + 一个 gutter + 说明条」整块在视口内居中：x 左右等分，
 * y 把 `g + H_p` 算进总高，于是上净空 = 下净空（1440×960 / H_p=26 下都是 27）。
 *
 * 只有整块比视口还大（极窄/极矮窗口里 cell 被 96 下限顶住）时才夹到 0：那时网格贴
 * 屏幕左上，说明条可能落到视口下缘之外——这是有意的降级，与旧实现同样的取舍。
 */
function frameInset(
  metrics: GridMetrics,
  viewportWidth: number,
  viewportHeight: number,
  pillHeight: number,
): { x: number; y: number } {
  const unionHeight = metrics.height + metrics.gap + pillHeight;
  return {
    x: Math.max(0, (viewportWidth - metrics.width) / 2),
    y: Math.max(0, (viewportHeight - unionHeight) / 2),
  };
}

/**
 * 视口 → 网格 / 说明条行 / chat 入口 / 展开面板的完整几何（纯函数，无 DOM）。
 *
 * `pillHeight` 是说明条**实测**高度（`layout/footer` 的 store，首帧用
 * `FOOTER_PILL_ESTIMATE`），它是布局的输入而不是被塞进某个写死的带子里。
 * 1440×960 / cell 164 / gutter 12 / 8 列 / 5 行 / H_p=26 代入：
 * ```text
 * Hg     = 5×164 + 4×12 = 868                       （行数由 computeGridMetrics 派生）
 * unionH = Hg + g + H_p = 868 + 12 + 26 = 906
 * insetX = (1440 − 1396)/2 = 22                     （1396 = 8×164 + 7×12）
 * insetY = (960 − 906)/2 = 27                       （上净空 = 下净空）
 * grid   = (22, 27)–(1418, 895)
 * pill   = (22, 907)–(1418, 933)                     [top = grid.bottom + g；bottom = 933]
 * footer = (22, 877)–(1418, 933)                     [高 = FOOTER_HEIGHT = 56]
 * axis   = (877 + 933)/2 = 905                       ← 入口圆圆心；说明条按底边 933 对齐
 * entry  = 56×56 → (1362, 877)                       [右缘 1418、下缘 933 = pill.bottom]
 * 面板   宽 = 3×164 + 2×12 = 516
 * panel.chat = 906 高 → (902, 27)–(1418, 933)         [顶边 = grid.top；906 = 868 + 12 + 26]
 * panel.voice = 340 高 → (902, 593)–(1418, 933)       [340 = 2×164 + 12]
 * ```
 * 说明条自身高度由文字内容决定，这里只消费调用方量到的 `H_p`，不量、不猜：
 * 它的上下缘来自 `pill`，与 chat 入口的**下缘**共线（`pill.bottom`），
 * 与网格的间距恰好是一个 widget gutter（`metrics.gap`）。
 */
export function layoutFrame(
  metrics: GridMetrics,
  viewportWidth: number,
  viewportHeight: number,
  pillHeight: number,
): LayoutFrame {
  // 非法输入（NaN / 0 / 负数，例如容器未布局时的测量值）退回首帧估计，不让几何变成 NaN
  const pillH =
    Number.isFinite(pillHeight) && pillHeight > 0 ? pillHeight : FOOTER_PILL_ESTIMATE;
  const inset = frameInset(metrics, viewportWidth, viewportHeight, pillH);
  const grid = frameRect(
    inset.x,
    inset.y,
    inset.x + metrics.width,
    inset.y + metrics.height,
  );
  // 说明条与网格之间只隔一个 widget gutter（g = metrics.gap = spacingHorizontalM）
  const pill = frameRect(
    grid.left,
    grid.bottom + metrics.gap,
    grid.right,
    grid.bottom + metrics.gap + pillH,
  );
  // chat 入口下缘 = 说明条下缘（同一个值，不是两套规则）；右缘 = 网格右缘
  const entryTop = pill.bottom - FOOTER_HEIGHT;
  const footer = frameRect(grid.left, entryTop, grid.right, pill.bottom);
  const axis = entryTop + FOOTER_HEIGHT / 2;

  // 窄屏降列 / 矮屏降行时面板跟着收敛，宽度始终是「整数个 cell + 整数个 gutter」
  const panelColumns = Math.max(1, Math.min(PANEL_COLUMNS, metrics.columns));
  const voiceRows = Math.max(1, Math.min(PANEL_ROWS, metrics.rows));
  const panelWidth = panelColumns * metrics.cell + (panelColumns - 1) * metrics.gap;
  const voiceHeight = voiceRows * metrics.cell + (voiceRows - 1) * metrics.gap;

  return {
    insetX: inset.x,
    insetY: inset.y,
    grid,
    pill,
    pillHeight: pillH,
    footer,
    axis,
    entry: {
      size: FOOTER_HEIGHT,
      x: footer.right - FOOTER_HEIGHT,
      y: entryTop,
    },
    panel: {
      // 对话面板顶边落在网格上缘、下缘落在 pill 下缘：高度 = Hg + g + H_p（= unionH）
      chat: frameRect(
        footer.right - panelWidth,
        grid.top,
        footer.right,
        footer.bottom,
      ),
      voice: frameRect(
        footer.right - panelWidth,
        footer.bottom - voiceHeight,
        footer.right,
        footer.bottom,
      ),
    },
    cell: metrics.cell,
    gap: metrics.gap,
    columns: metrics.columns,
    rows: metrics.rows,
  };
}

/**
 * 网格在窗口里的左上角偏移（桌面层用它把逻辑坐标换成像素位置）。
 *
 * **严格居中，但整块居中而不是网格单独居中**：横向 (vw − 网格宽)/2，纵向把
 * 「gutter + 说明条实测高度」算进总高：(vh − 网格高 − g − H_p)/2（1440×960 / H_p=26
 * 下 = 22 / 27）。不做 4px 吸附——吸附会把 22 压成 20、把 27 压成 24，整块偏左 2、偏上 3。
 *
 * `pillHeight` 缺省取 `FOOTER_PILL_ESTIMATE`（首帧估计）：这是为了兼容仍以 3 参调用的
 * 旧调用方（`desktop/useViewportMetrics`），它们拿不到实测值。需要与说明条实测高度
 * 严格一致时请直接用 `layoutFrame(metrics, vw, vh, H_p).grid`（桌面层已这么做）。
 *
 * 代价（有意接受）：8 列 + 7 条 12 gutter 时网格宽恒为 `8c + 84`，故水平留白必然
 * ≡ 2 (mod 4)（1440×960 下 22），卡片边不再落在 4 的倍数上；想要 4px 基线就只能放弃
 * 严格居中，两者不可兼得（wtsl-layout-audit.md §9）。
 *
 * 视口与整块尺寸之差为奇数时会得到 .5px 偏移——那是真实居中，不取整吸附。
 * 只有整块比视口还大时才夹到 0（见 `frameInset`）。
 */
export function gridOrigin(
  metrics: GridMetrics,
  viewportWidth: number,
  viewportHeight: number,
  pillHeight: number = FOOTER_PILL_ESTIMATE,
): { x: number; y: number } {
  return frameInset(metrics, viewportWidth, viewportHeight, pillHeight);
}

/** 网格在页面坐标系里的四边（用于验收与 Agent 入口「右下保留格」的几何说明） */
export function gridBounds(
  metrics: GridMetrics,
  viewportWidth: number,
  viewportHeight: number,
  pillHeight: number = FOOTER_PILL_ESTIMATE,
): { left: number; top: number; right: number; bottom: number } {
  const origin = gridOrigin(metrics, viewportWidth, viewportHeight, pillHeight);
  return {
    left: origin.x,
    top: origin.y,
    right: origin.x + metrics.width,
    bottom: origin.y + metrics.height,
  };
}

/**
 * 网格四周的净空（1440×960 / H_p=26 下 = 左 22 / 右 22 / 上 27 / 下 65）。
 *
 * 下缘净空含说明条那一块：`vh − grid.bottom = insetY + g + H_p`（27 + 12 + 26 = 65），
 * 所以上下净空不相等——「网格 + g + pill 整块居中」的必然结果，不是算错。
 * 与下净空配对的是 **pill 的下缘**（vh − pill.bottom = 27 = 上净空）；
 * 需要说明条/入口自己的矩形请直接用 `layoutFrame().pill` / `.footer`。
 *
 * 由 `gridOrigin` 派生，**不在别处重复写 22 / 27**，避免再出现「某处按 20、某处按 22」
 * 的第二套口径。
 */
export function gridInsets(
  metrics: GridMetrics,
  viewportWidth: number,
  viewportHeight: number,
  pillHeight: number = FOOTER_PILL_ESTIMATE,
): { left: number; right: number; top: number; bottom: number } {
  const bounds = gridBounds(metrics, viewportWidth, viewportHeight, pillHeight);
  return {
    left: bounds.left,
    right: viewportWidth - bounds.right,
    top: bounds.top,
    bottom: viewportHeight - bounds.bottom,
  };
}
