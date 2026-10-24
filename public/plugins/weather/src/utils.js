/** 少量通用小工具（尺寸档位、演示开关、缓存时效）。 */

/**
 * 卡片尺寸档（与 manifest.json 的 sizes 一致）。
 *
 * 逐档字段集合见 `wtsl-density-clock-weather.md` §3.6：换尺寸换字段，不换字号
 * （hero 恒 fontSizeHero900 / lineHeightHero900）。`4x2` 已删除：它的全部字段
 * （AQI 环 / 未来 7 天）已由 `3x3` 承担，再保留一档只会让同一字段集在两个宽高比里各排一遍。
 */
export const SUPPORTED_SIZES = {
  '1x1': [1, 1],
  '2x1': [2, 1],
  '1x2': [1, 2],
  '2x2': [2, 2],
  '3x2': [3, 2],
  '3x3': [3, 3],
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

/** 相对当前时间的毫秒差，用于判断缓存是否“可能过期” */
export function isStaleCache(fetchedAt, refreshMin, now = Date.now()) {
  if (!fetchedAt) return false;
  const maxAge = Math.max(2, Number(refreshMin) || 30) * 2 * 60 * 1000;
  return now - fetchedAt > maxAge;
}

/**
 * 独立开发/截图：`?mock=1` 或宿主验收脚本的 `?demo=1` 打开内置演示数据。
 * 宿主卡片/浮层地址不会带这两个参数，线上行为不受影响。
 */
export function urlMockEnabled() {
  const params = new URLSearchParams(location.search);
  return params.get('mock') === '1' || params.get('demo') === '1';
}

/** 独立开发/截图：当前会话的尺寸档位参数（宿主内由 host:init / host:resize 覆盖） */
export function urlSizeParam() {
  return parseSizeParam(new URLSearchParams(location.search).get('size'));
}
