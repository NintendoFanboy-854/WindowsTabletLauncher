/** 时钟插件支持的尺寸档位（与 manifest.json 一致）。 */

export const SUPPORTED_SIZES = {
  '1x1': [1, 1],
  '2x1': [2, 1],
  '3x2': [3, 2],
};

export const DEFAULT_SIZE_KEY = '2x1';

export function sizeKeyOf(size) {
  if (!Array.isArray(size) || size.length < 2) return DEFAULT_SIZE_KEY;
  const key = `${Number(size[0])}x${Number(size[1])}`;
  return SUPPORTED_SIZES[key] ? key : DEFAULT_SIZE_KEY;
}
