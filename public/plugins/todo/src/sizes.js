/** 待办插件尺寸档位（与 manifest.json 一致）。 */

export const SUPPORTED_SIZES = {
  '1x1': [1, 1],
  '2x2': [2, 2],
  '3x2': [3, 2],
  '3x3': [3, 3],
  '4x2': [4, 2],
};

export const DEFAULT_SIZE_KEY = '3x3';

/** 档位分类：决定布局与信息预算 */
export function layoutKind(sizeKey) {
  switch (sizeKey) {
    case '1x1':
      return 'summary';
    case '2x2':
      return 'mini';
    case '3x2':
      return 'medium';
    case '4x2':
      return 'wide';
    case '3x3':
    default:
      return 'full';
  }
}

/** D-04 / DENSITY：内容列表行数上限 */
export function rowBudget(kind) {
  switch (kind) {
    case 'mini':
      return 4;
    case 'medium':
      return 6;
    case 'full':
      return 10;
    default:
      return null;
  }
}

export function parseSizeParam(raw) {
  if (!raw) return null;
  const match = /^(\d+)\s*[x×,]\s*(\d+)$/i.exec(String(raw).trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

/** 宿主尺寸 → 档位 key；未声明的尺寸按最接近的档位降级 */
export function sizeKeyOf(size) {
  if (!Array.isArray(size) || size.length < 2) return DEFAULT_SIZE_KEY;
  const key = `${Number(size[0])}x${Number(size[1])}`;
  if (SUPPORTED_SIZES[key]) return key;
  const width = Number(size[0]);
  const height = Number(size[1]);
  if (width <= 1 && height <= 1) return '1x1';
  if (height >= 3) return '3x3';
  if (width >= 4) return '4x2';
  if (width >= 3) return '3x2';
  return '2x2';
}

/** 独立开发/截图：180px 基准单元格（与审计口径一致） */
export function buildCardSize(sizeKey) {
  const size = SUPPORTED_SIZES[sizeKey] || SUPPORTED_SIZES[DEFAULT_SIZE_KEY];
  return { width: size[0] * 180, height: size[1] * 180 };
}
