/**
 * manifest 归一化 + 默认摆放。
 *
 * 兼容两种 manifest：
 * - 新格式（DESIGN.md）：widget 有 `sizes` + `defaultSize`，一个组件多档；
 * - 旧原型格式：widget 只有一个 `size`，自动升级成单档。
 *
 * 归一化不抛错：坏插件返回 null 或降级，由管理器打日志跳过，避免一个坏 manifest
 * 把整个桌面拖垮。
 */

import type { WidgetInstance, WidgetSize } from '../bridge/types';
import { fabReservedCell, rectsOverlap } from '../layout/grid';
import {
  IDENTITY_HUES,
  describeIdentityHue,
  isIdentityHue,
  type IdentityHue,
} from './identity';
import { normalizeSettingsSchema } from './settings';
import type { NormalizedPlugin, NormalizedWidget } from './types';

const ID_PATTERN = /^[A-Za-z0-9._-]+$/;
/** 没有声明任何尺寸时的兜底档位：最小可用，不假设插件能力 */
const FALLBACK_SIZE: WidgetSize = [1, 1];

function asWidgetSize(value: unknown): WidgetSize | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const [width, height] = value;
  if (!Number.isInteger(width) || !Number.isInteger(height)) return null;
  if ((width as number) < 1 || (height as number) < 1) return null;
  return [width as number, height as number];
}

/**
 * manifest 里的 `cell` 是**网格坐标**（列, 行），允许 0（左上角）；
 * 不能复用 `asWidgetSize`（它要求尺寸 ≥1），否则第一列/第一行的声明坐标会被静默丢掉，
 * 默认布局退化成“首个空位”装箱（v0.4.0 发现：weather/clock/todo 的 (0,0)/(4,0)/(0,2) 全部失效）。
 */
function asGridCell(value: unknown): WidgetSize | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const [col, row] = value;
  if (!Number.isInteger(col) || !Number.isInteger(row)) return null;
  if ((col as number) < 0 || (row as number) < 0) return null;
  return [col as number, row as number];
}

function sameSize(a: WidgetSize, b: WidgetSize): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function normalizeSizes(raw: unknown, legacySize: WidgetSize | null): WidgetSize[] {
  const sizes: WidgetSize[] = [];
  if (Array.isArray(raw)) {
    for (const candidate of raw) {
      const size = asWidgetSize(candidate);
      if (size && !sizes.some((existing) => sameSize(existing, size))) sizes.push(size);
    }
  }
  if (sizes.length === 0 && legacySize) sizes.push(legacySize);
  if (sizes.length === 0) sizes.push([...FALLBACK_SIZE]);
  return sizes;
}

function normalizeWidget(raw: unknown, index: number): NormalizedWidget | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const widgetId =
    typeof record.id === 'string' && record.id.trim() ? record.id.trim() : `widget-${index}`;
  const title =
    typeof record.title === 'string' && record.title.trim() ? record.title.trim() : widgetId;

  const sizes = normalizeSizes(record.sizes, asWidgetSize(record.size));
  const declaredDefault = asWidgetSize(record.defaultSize);
  const defaultSize =
    declaredDefault && sizes.some((size) => sameSize(size, declaredDefault))
      ? declaredDefault
      : sizes[0];
  const cell = asGridCell(record.cell) ?? undefined;

  return { id: widgetId, title, sizes, defaultSize, cell };
}

/**
 * 把 manifest.json 的原始 JSON 归一化。
 *
 * 身份色是设计契约的硬门槛：缺失或不在白名单时抛错，由 Manager 记录并跳过该插件。
 * 这里不做默认 hue 回退——静默回退会让“六个插件一套色相”的保证失效。
 *
 * @param raw manifest.json 的内容
 * @param dir 插件目录名（iframe 路径以它为准）
 * @throws Error identityHue 缺失/非法时，message 包含插件目录与合法值白名单
 */
export function normalizeManifest(raw: unknown, dir: string): NormalizedPlugin | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;

  const rawId = typeof record.id === 'string' ? record.id.trim() : '';
  const id = ID_PATTERN.test(rawId) ? rawId : ID_PATTERN.test(dir) ? dir : null;
  if (!id) return null;

  if (!isIdentityHue(record.identityHue)) {
    throw new Error(
      `插件「${id}」的 manifest.identityHue 非法：${describeIdentityHue(record.identityHue)}。` +
        `只允许 ${IDENTITY_HUES.join(' / ')}（Fluent shared palette 同一档 L*/C*）。`,
    );
  }
  const identityHue: IdentityHue = record.identityHue;

  const widgetsRaw = Array.isArray(record.widgets) ? record.widgets : [];
  const widgets: NormalizedWidget[] = [];
  const seenWidgetIds = new Set<string>();
  for (const [index, rawWidget] of widgetsRaw.entries()) {
    const widget = normalizeWidget(rawWidget, index);
    if (!widget) continue;
    if (seenWidgetIds.has(widget.id)) continue;
    seenWidgetIds.add(widget.id);
    widgets.push(widget);
  }

  const background =
    record.background === true ||
    widgetsRaw.some(
      (widget) =>
        !!widget && typeof widget === 'object' && (widget as Record<string, unknown>).background === true,
    );

  // 只有显式 false 才禁止自动上桌；缺省 / 任何非 false 值都按 true（默认行为不变）。
  const autoPlace = record.autoPlace !== false;

  // 设置 schema 与组件无关；坏字段在 normalizeSettingsSchema 里跳过并记录，
  // 让设置页显示「暂不支持」而不是把整份配置写坏。
  const settings = normalizeSettingsSchema(record.settings);

  return {
    id,
    identityHue,
    name: typeof record.name === 'string' && record.name.trim() ? record.name.trim() : id,
    version: typeof record.version === 'string' ? record.version : '0.0.0',
    background,
    autoPlace,
    dir,
    widgets,
    ...(settings ? { settings } : {}),
  };
}

export interface DefaultInstancesOptions {
  /** 当前布局列数 */
  cols: number;
  /** 当前布局行数 */
  rows: number;
  /** 摆到第几页，默认 0 */
  page?: number;
}

interface Rect {
  col: number;
  row: number;
  w: number;
  h: number;
}

function clampSize(size: WidgetSize, cols: number, rows: number): WidgetSize {
  return [
    Math.max(1, Math.min(size[0], Math.max(1, cols))),
    Math.max(1, Math.min(size[1], Math.max(1, rows))),
  ];
}

/**
 * 把插件声明的组件摆成默认 `WidgetInstance[]`。
 *
 * 只负责“第一次摆上去”：优先用 manifest 的 cell，被占用/放不下就按
 * 从左到右、从上到下找第一个空位；实在放不下就跳过（等编辑模式或翻页再加）。
 * 持久化与重排属于 layout 引擎（A3），这里不碰 localStorage。
 */
export function createDefaultInstances(
  plugins: NormalizedPlugin[],
  options: DefaultInstancesOptions,
): WidgetInstance[] {
  const { cols, rows, page = 0 } = options;
  if (cols < 1 || rows < 1) return [];

  const occupied = new Set<string>();
  const reserved = fabReservedCell(cols, rows);
  const mark = (cell: string) => occupied.add(cell);
  const isFree = (rect: Rect): boolean => {
    if (rect.col < 0 || rect.row < 0) return false;
    if (rect.col + rect.w > cols || rect.row + rect.h > rows) return false;
    if (rectsOverlap(rect, reserved)) return false;
    for (let col = rect.col; col < rect.col + rect.w; col += 1) {
      for (let row = rect.row; row < rect.row + rect.h; row += 1) {
        if (occupied.has(`${col}:${row}`)) return false;
      }
    }
    return true;
  };
  const occupy = (rect: Rect) => {
    for (let col = rect.col; col < rect.col + rect.w; col += 1) {
      for (let row = rect.row; row < rect.row + rect.h; row += 1) mark(`${col}:${row}`);
    }
  };
  const findFirstFree = (size: WidgetSize): { col: number; row: number } | null => {
    for (let row = 0; row + size[1] <= rows; row += 1) {
      for (let col = 0; col + size[0] <= cols; col += 1) {
        if (isFree({ col, row, w: size[0], h: size[1] })) return { col, row };
      }
    }
    return null;
  };

  const instances: WidgetInstance[] = [];
  const usedUids = new Set<string>();
  for (const plugin of plugins) {
    for (const widget of plugin.widgets) {
      const size = clampSize(widget.defaultSize, cols, rows);
      let placement: { col: number; row: number } | null = null;

      if (widget.cell) {
        const candidate = {
          col: widget.cell[0],
          row: widget.cell[1],
          w: size[0],
          h: size[1],
        };
        if (isFree(candidate)) placement = { col: candidate.col, row: candidate.row };
      }
      placement ??= findFirstFree(size);
      if (!placement) continue;

      occupy({ col: placement.col, row: placement.row, w: size[0], h: size[1] });

      let uid = `${plugin.id}:${widget.id}`;
      let suffix = 2;
      while (usedUids.has(uid)) {
        uid = `${plugin.id}:${widget.id}:${suffix}`;
        suffix += 1;
      }
      usedUids.add(uid);

      instances.push({
        uid,
        pluginId: plugin.id,
        widgetId: widget.id,
        title: widget.title,
        page,
        col: placement.col,
        row: placement.row,
        size,
        sizes: widget.sizes.map((entry) => [...entry] as WidgetSize),
      });
    }
  }
  return instances;
}
