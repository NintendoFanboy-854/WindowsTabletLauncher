/** 少量通用小工具。 */

export const SUPPORTED_SIZES = {
  '1x1': [1, 1],
  '2x1': [2, 1],
  '2x2': [2, 2],
  '3x2': [3, 2],
  '4x2': [4, 2],
};

export const DEFAULT_SIZE_KEY = '3x2';

export function sizeKeyOf(size) {
  if (!Array.isArray(size) || size.length < 2) return DEFAULT_SIZE_KEY;
  const key = `${Number(size[0])}x${Number(size[1])}`;
  return SUPPORTED_SIZES[key] ? key : DEFAULT_SIZE_KEY;
}

export function parseSizeParam(value) {
  if (!value) return null;
  const match = /^(\d+)\s*[x×]\s*(\d+)$/i.exec(String(value).trim());
  if (!match) return null;
  const key = `${Number(match[1])}x${Number(match[2])}`;
  return SUPPORTED_SIZES[key] ? SUPPORTED_SIZES[key] : null;
}

/** 解析 "rgb(r, g, b)" / "rgba(...)" / "#rrggbb" 的亮度，决定叠在上面的文字用黑还是白 */
export function contrastTextColor(color) {
  if (!color || typeof color !== 'string') return '#ffffff';
  let r = 0;
  let g = 0;
  let b = 0;
  const rgb = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(color);
  if (rgb) {
    r = Number(rgb[1]);
    g = Number(rgb[2]);
    b = Number(rgb[3]);
  } else {
    const hex = /#([0-9a-f]{3}|[0-9a-f]{6})/i.exec(color);
    if (hex) {
      const value = hex[1].length === 3 ? hex[1].split('').map((c) => c + c).join('') : hex[1];
      r = parseInt(value.slice(0, 2), 16);
      g = parseInt(value.slice(2, 4), 16);
      b = parseInt(value.slice(4, 6), 16);
    } else {
      return '#ffffff';
    }
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#1a1a1a' : '#ffffff';
}

export function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

export function isVisibleDocument() {
  return typeof document === 'undefined' || document.visibilityState !== 'hidden';
}

/** 相对当前时间的毫秒差，用于判断缓存是否“可能过期” */
export function isStaleCache(fetchedAt, refreshMin, now = Date.now()) {
  if (!fetchedAt) return false;
  const maxAge = Math.max(2, Number(refreshMin) || 30) * 2 * 60 * 1000;
  return now - fetchedAt > maxAge;
}

/** 独立开发/截图：`?mock=1` 让当前会话强制使用演示数据 */
export function urlMockOverride() {
  return new URLSearchParams(location.search).get('mock') === '1';
}

/** 独立开发/截图：当前会话的尺寸档位参数（宿主内由 host:init 覆盖） */
export function urlSizeParam() {
  return parseSizeParam(new URLSearchParams(location.search).get('size'));
}
