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

/** 桌面的完整状态：组件实例 + 页数 + 当前页 */
export interface LayoutState {
  widgets: WidgetInstance[];
  pages: number;
  activePage: number;
}

/** 页面指示器模型：页数超过阈值折叠成“当前页/总页数”胶囊 */
export type PageIndicator =
  | { kind: 'dots'; total: number; active: number }
  | { kind: 'capsule'; total: number; active: number };

/** localStorage 里保存的结构（version 用于将来迁移） */
export interface PersistedLayout {
  version: 2;
  pages: number;
  activePage: number;
  widgets: WidgetInstance[];
  savedAt: number;
}

/** 便于测试替换的 localStorage 最小接口 */
export interface LayoutStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
