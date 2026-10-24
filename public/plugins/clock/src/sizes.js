/** 时钟插件支持的尺寸档位与逐档字段集合（与 manifest.json 的 sizes 一致）。 */

export const SUPPORTED_SIZES = {
  '1x1': [1, 1],
  '2x1': [2, 1],
  '3x2': [3, 2],
};

export const DEFAULT_SIZE_KEY = '2x1';

/**
 * 每一档的字段集合：**换尺寸换字段，不换字号**（hero 恒 `fontSizeHero900` / `lineHeightHero900`）。
 *
 * - `identity`：`'compact'` = 只有 20px 身份色图标；`'full'` = 图标 + 组件名。
 * - `seconds`：是否允许显示秒（另受设置 `showSeconds` 控制）。1×1 内容宽 120，
 *   `08:27` + 秒 + AM/PM 放不下（§2.6 宽度算术），所以该档恒不显示秒。
 * - `date`：`'none'` | `'trailing'`（identity 行尾 14）| `'block'`（时间块下方 16，带星期）。
 * - `worldClocks`：世界时钟最多渲染几行（0 = 该档不出现世界时钟）。
 *
 * 3×2 存在的前提是世界时钟 3 城（密度规格 §2.6 方案 1）；若哪天世界时钟从卡片上撤掉，
 * 这一档必须同时从本表与 manifest.sizes 删除，不能退回 2×1 的内容（会净增 0 项且空带超标）。
 */
export const SIZE_FIELDS = {
  '1x1': { identity: 'compact', seconds: false, date: 'none', worldClocks: 0 },
  '2x1': { identity: 'full', seconds: true, date: 'trailing', worldClocks: 0 },
  '3x2': { identity: 'full', seconds: true, date: 'block', worldClocks: 3 },
};

/** 未知尺寸一律按默认档的字段集渲染（不静默放大字号）。 */
export function fieldsForSize(sizeKey) {
  return SIZE_FIELDS[sizeKey] || SIZE_FIELDS[DEFAULT_SIZE_KEY];
}

export function sizeKeyOf(size) {
  if (!Array.isArray(size) || size.length < 2) return DEFAULT_SIZE_KEY;
  const key = `${Number(size[0])}x${Number(size[1])}`;
  return SUPPORTED_SIZES[key] ? key : DEFAULT_SIZE_KEY;
}
