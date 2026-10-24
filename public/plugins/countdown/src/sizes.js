/** 倒数日插件支持的尺寸档位（与 manifest.json 一致）。 */

export const SUPPORTED_SIZES = {
  '1x1': [1, 1],
  '2x1': [2, 1],
  '2x2': [2, 2],
  '3x2': [3, 2],
  '3x3': [3, 3],
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

/** 就近吸附：宿主给了未声明的档位时取最接近的宽高比档位 */
export function pickSizeKey(width, height) {
  const aspect = width / height;
  let best = DEFAULT_SIZE_KEY;
  let bestDelta = Infinity;
  for (const [key, [w, h]] of Object.entries(SUPPORTED_SIZES)) {
    const delta = Math.abs(w / h - aspect);
    if (delta < bestDelta) {
      best = key;
      bestDelta = delta;
    }
  }
  return best;
}
