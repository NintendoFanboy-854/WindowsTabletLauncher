/**
 * Agent 入口（底部条右端）的**三态几何**：从桌面栅格推导，不写死像素。
 *
 * 三态是同一物件（Agent 对话入口）的连续变化，因此共用**一个锚点**：底部条
 * `footer` 的右缘与下缘交点——入口的右缘/下缘与底部条右缘/下缘**在同一条线上**。
 * 收起态、语音窗、对话面板的右缘/下缘都落在这一点上，展开与收起只改宽高
 * （HIG §9 连续性 / Fluent motion「container transform」）。
 *
 * 入口不再贴网格右下角：网格下方那一条归说明条（pill 行，上缘 = 网格下缘 + g），
 * 入口改贴**说明条行的右下角**（`layoutFrame().pill` 的右缘/下缘），于是它与栅格里的
 * 卡片位置无关（保留格的作用见 `layout/grid.ts` 的 `fabReservedCell`）。
 * 注意入口 56 比「g + H_p」高，上缘会向上越过网格下缘、与卡片区在垂直方向重叠一段——
 * 这是「与说明条下缘共线」的必然结果，那一格由保留格保证不放卡片。
 *
 * 尺寸全部是栅格的整数组合（cell + gutter），入口直径与 `FOOTER_HEIGHT` 同源：
 * - 收起态（orb）：56 = `spacingHorizontalXXXL`(32) + `spacingHorizontalXXL`(24)；
 * - 语音窗：3 列宽 × 2 行高（窄屏按实际列数/行数收敛）；
 * - 对话面板：与语音窗同宽 × 从网格上缘到 pill 下缘的高度（高度 = 网格高 + gutter + H_p）。
 *
 * 「自动对齐右下角 chat」的口径：入口的**下缘 = 说明条 pill 的下缘**，两者都取
 * `layoutFrame().pill.bottom` 这一个值（不是中轴对齐，也不是各自算一套）；
 * 右缘 = 网格右缘（水平留白与卡片列同一条线）。
 *
 * 1440×960 / cell 164 / gutter 12 / 网格 (22,27)-(1418,895) / H_p=26 下的实算（全部来自
 * `layoutFrame`，这里只做展示）：
 * ```text
 * 锚点       = (footer.right, footer.bottom) = (1418, 933)
 * insetRight = 1440 − 1418 = 22；insetBottom = 960 − 933 = 27  （= 上净空，整块居中）
 * orb        = 56 × 56        → (1362, 877)–(1418, 933)    [下缘 = pill.bottom = 933]
 * 语音窗      = 516 × 340      → (902, 593)–(1418, 933)     [3×164+2×12 = 516；2×164+12 = 340]
 * 对话面板    = 516 × 906      → (902, 27)–(1418, 933)      [顶边 27 = 网格上缘；
 *                                                            906 = 868 + 12 + 26]
 * ```
 * 展开态是 `position: fixed` 的浮层（z-index 30，见 agent.css），**盖在 widget 之上**，
 * 不参与网格布局、不挤压卡片：面板长高只改自己的宽高，网格与卡片位置一律不变。
 */
import { useEffect, useMemo, useState } from 'react';
import {
  FOOTER_HEIGHT,
  computeGridMetrics,
  layoutFrame,
  useFooterPillHeight,
} from '../../layout';

/**
 * 入口外框 56 = spacingHorizontalXXXL(32) + spacingHorizontalXXL(24)。
 *
 * 与 `FOOTER_HEIGHT` 是同一个常量：入口是一个 56 的圆，**下缘**与说明条下缘共线
 * （= `layoutFrame().pill.bottom`），上缘则向上越过网格下缘（56 > gutter 12 + H_p 26）。
 * 保留这个导出名是为了不波及调用方与文档里的既有称谓。
 */
export const AGENT_ENTRY_SIZE = FOOTER_HEIGHT;

/**
 * 三态右/下缘相对底部条右缘、下缘的安全距 = **0**。
 *
 * 旧值 20（spacingHorizontalXL）让 orb 的右缘/下缘比卡片各缩进 20，正是「chat 没跟
 * 右边卡片对齐」的成因；现在入口贴底部条右缘/下缘，与左侧说明条**底边共线**（都是
 * `footer.bottom`；说明条按 `align-items:flex-end` 贴底，不是中轴对齐）。
 * 保留这个导出名是为了不波及调用方与文档里的既有称谓。
 */
export const AGENT_GRID_SAFETY = 0;

export interface AgentStageBox {
  width: number;
  height: number;
}

export interface AgentSurfaceGeometry {
  /** 距视口右缘 / 下缘的 CSS 偏移（= 视口尺寸 − 锚点） */
  insetRight: number;
  insetBottom: number;
  /** 三态共用的锚点（视口逻辑坐标）：右缘 x、下缘 y */
  anchor: { x: number; y: number };
  collapsed: AgentStageBox;
  voice: AgentStageBox;
  chat: AgentStageBox;
  grid: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    cell: number;
    gap: number;
    columns: number;
    rows: number;
  };
}

/**
 * 视口尺寸 + 说明条实测高度 → 三态几何（纯函数，供测试与报告里的算式复核）。
 *
 * 所有数字都取自 `layoutFrame`：入口位置取 `footer`，三态尺寸取 `entry` / `panel`，
 * 这里不再自己算留白、行高或面板宽高，改口径只需改 `layoutFrame` 一处。
 * `pillHeight` 是说明条实测高度（`layout/footer` 的 store），它决定 grid 的 insetY 与
 * pill/entry 的下缘——即「chat 入口自动对齐说明条」的唯一输入。
 */
export function agentSurfaceGeometry(
  viewportWidth: number,
  viewportHeight: number,
  pillHeight: number,
): AgentSurfaceGeometry {
  const metrics = computeGridMetrics(viewportWidth, viewportHeight);
  const frame = layoutFrame(metrics, viewportWidth, viewportHeight, pillHeight);
  const anchor = {
    x: frame.footer.right - AGENT_GRID_SAFETY,
    y: frame.footer.bottom - AGENT_GRID_SAFETY,
  };

  return {
    insetRight: Math.max(0, viewportWidth - anchor.x),
    insetBottom: Math.max(0, viewportHeight - anchor.y),
    anchor,
    collapsed: { width: frame.entry.size, height: frame.entry.size },
    voice: { width: frame.panel.voice.width, height: frame.panel.voice.height },
    chat: { width: frame.panel.chat.width, height: frame.panel.chat.height },
    grid: {
      left: frame.grid.left,
      top: frame.grid.top,
      right: frame.grid.right,
      bottom: frame.grid.bottom,
      cell: frame.cell,
      gap: frame.gap,
      columns: frame.columns,
      rows: frame.rows,
    },
  };
}

function readViewport(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  const root = document.documentElement;
  return {
    width: root.clientWidth || window.innerWidth,
    height: root.clientHeight || window.innerHeight,
  };
}

/**
 * 监听视口 + 说明条实测高度，返回三态几何。
 *
 * 用 window resize + 文档根尺寸，与 `desktop/useViewportMetrics` 的取值口径一致
 * （桌面层用宿主容器的 clientWidth/Height；宿主根是满屏且 `overflow:hidden`，
 * 两者在目标设备上同为 1440×960）。
 *
 * `H_p` 走 `useFooterPillHeight`（`layout/footer` 的 store，由 `WallpaperCredit` 的
 * ResizeObserver 上报）：说明条高度一变，这里就重算，入口下缘自动跟上 pill 下缘。
 * `AgentSurface` 因此不需要知道说明条的存在，也不用改签名。
 */
export function useAgentSurfaceGeometry(): AgentSurfaceGeometry {
  const [viewport, setViewport] = useState(readViewport);
  const pillHeight = useFooterPillHeight();

  useEffect(() => {
    const measure = () => {
      const next = readViewport();
      setViewport((previous) =>
        previous.width === next.width && previous.height === next.height ? previous : next,
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return useMemo(
    () => agentSurfaceGeometry(viewport.width, viewport.height, pillHeight),
    [viewport.width, viewport.height, pillHeight],
  );
}
