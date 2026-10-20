/**
 * 布局引擎的数据模型。
 *
 * 约定的核心：布局只存逻辑坐标（页、列、行、尺寸档位），像素尺寸由窗口实时推导。
 * 这样窗口缩放 / 横竖屏切换 / 换 DPI 都不会把布局写坏。
 */
import type { WidgetInstance, WidgetSize } from '../bridge/types';

export type { WidgetInstance, WidgetSize };

/**
 * DESIGN.md §1.1 允许的尺寸档位（列跨 × 行跨）。
 * 插件 manifest 里声明的 sizes 会按这里过滤；不在表里的档位不摆上桌面。
 */
export const SIZE_TIERS: readonly WidgetSize[] = [
  [1, 1],
  [2, 1],
  [1, 2],
  [2, 2],
  [3, 2],
  [4, 2],
  [3, 3],
];

/** 由窗口尺寸推导出来的网格几何（单位 px） */
export interface GridMetrics {
  /** 列数：≥1280 为 8，900–1279 为 6，<900 为 4 */
  columns: number;
  /** 行数：floor(可用高度 / 单元格)，最少 4 行 */
  rows: number;
  /** 正方形单元格边长，约束 96–220 */
  cell: number;
  /** 卡片间距 */
  gap: number;
  /** 桌面四周留白 */
  padding: number;
  /** 网格内容总宽 = 列数 × cell + (列数-1) × gap */
  width: number;
  /** 网格内容总高 = 行数 × cell + (行数-1) × gap */
  height: number;
}

/** 逻辑网格坐标（不存像素） */
export interface CellRect {
  col: number;
  row: number;
  w: number;
  h: number;
}

/**
 * 桌面组件的稳定键：`pluginId:widgetId`。
 * 布局里的 WidgetInstance.uid 也用它，所以 removed 与实例、插件目录能直接互相校验。
 */
export function widgetKey(pluginId: string, widgetId: string): string {
  return `${pluginId}:${widgetId}`;
}

/**
 * 桌面的完整状态：组件实例 + 页数 + 当前页 + 已移除的组件键。
 *
 * `removed` 是用户主动从桌面删掉的组件（D-18 修订：删除改为持久）。它单独存在是因为
 * 布局里只看得到“当前摆了什么”，看不到“用户明确不要什么”；没有这份记录，reload 时
 * reconcileLayout 会把删掉的组件当成新插件组件重新摆回来。插件仍存在时保留，插件
 * 被卸载后由 reconcileLayout 清掉。
 */
export interface LayoutState {
  widgets: WidgetInstance[];
  pages: number;
  activePage: number;
  removed: string[];
}

/** 页面指示器模型：页数超过阈值折叠成“当前页/总页数”胶囊 */
export type PageIndicator =
  | { kind: 'dots'; total: number; active: number }
  | { kind: 'capsule'; total: number; active: number };

/**
 * localStorage 里保存的结构（version 用于迁移）。
 *
 * v3 起带 `removed`；读取仍兼容 v2（v2 没有 removed，按 `[]` 处理）。
 * 允许 widgets 为空但 removed 非空：用户删光所有小组件后 reload 不应自动复活。
 */
export interface PersistedLayout {
  version: 3;
  pages: number;
  activePage: number;
  widgets: WidgetInstance[];
  removed: string[];
  savedAt: number;
}

/** 便于测试替换的 localStorage 最小接口 */
export interface LayoutStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
