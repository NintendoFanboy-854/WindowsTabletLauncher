/**
 * 番茄钟插件支持的尺寸档位（与 manifest.json 一致）。
 *
 * 明确不支持：
 * - `1x2`（120 宽）：hero `25:00` 已占 99/120，单位/阶段/按钮只能各占整行，且计时器必须就地开始/暂停。
 * - `3x3`：番茄钟的真实统计只有 4 项 + 1 个任务，再填只能造「平均单轮时长」这类复盘字段。
 * 两者都不在下面的表里，`sizeKeyOf` 会回退到默认档，宿主也不会提供这两个尺寸。
 */

export const SUPPORTED_SIZES = {
  '1x1': [1, 1],
  '2x1': [2, 1],
  '2x2': [2, 2],
  '3x2': [3, 2],
};

export const DEFAULT_SIZE_KEY = '2x1';

export function sizeKeyOf(size) {
  if (!Array.isArray(size) || size.length < 2) return DEFAULT_SIZE_KEY;
  const key = `${Number(size[0])}x${Number(size[1])}`;
  return SUPPORTED_SIZES[key] ? key : DEFAULT_SIZE_KEY;
}

/** 独立开发 / 截图：?size=2x1 覆盖宿主尺寸 */
export function devSizeKey() {
  const raw = new URLSearchParams(location.search).get('size');
  const match = /^(\d+)x(\d+)$/.exec(raw || '');
  if (!match) return null;
  const key = `${Number(match[1])}x${Number(match[2])}`;
  return SUPPORTED_SIZES[key] ? key : null;
}
