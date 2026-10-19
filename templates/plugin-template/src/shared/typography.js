/**
 * 项目 Display XL 字阶（DECISIONS.md D-07）。
 *
 * 背景：Fluent 2 官方字阶最大角色是 Display 68px / 92px，Fluent UI React v9 的
 * 最大 token 是 fontSizeHero1000 = 68px。桌面平板当"台面电子设备"用时，墙钟/
 * 计时器/温度这类**纯数字主信息**在 1–1.5m 之外需要更大的字，官方 ramp 不提供。
 * 因此定义这组项目级例外：只允许用于「数字型主信息」，不得用于标题、正文、标签。
 *
 * 使用方式：makeStyles 里 `...displayXl(96)` 展开得到 fontSize/lineHeight。
 * 文本层级仍必须用 Fluent `Text` 的 size/weight / fontSizeBase* / fontSizeHero*。
 */

/** 子集：数字主信息可用的 XL 档位（px → { fontSize, lineHeight }） */
export const DISPLAY_XL = {
  48: { fontSize: '48px', lineHeight: '56px' },
  80: { fontSize: '80px', lineHeight: '88px' },
  96: { fontSize: '96px', lineHeight: '104px' },
  112: { fontSize: '112px', lineHeight: '124px' },
};

/**
 * @param {48 | 80 | 96 | 112} size
 * @returns {{ fontSize: string, lineHeight: string }}
 */
export function displayXl(size) {
  const spec = DISPLAY_XL[size];
  if (!spec) {
    throw new Error(`Display XL 只定义了 48/80/96/112，收到 ${String(size)}`);
  }
  return spec;
}

/** 数字主信息推荐的字重（Fluent 语义：Display/Large Title 用 Semibold） */
export const DISPLAY_WEIGHT = '600';

/** 数字等宽，避免秒/分钟跳动时布局抖动 */
export const TABULAR_NUMS = { fontVariantNumeric: 'tabular-nums' };

/** 项目语义层 → Fluent 字阶（纯文档用途，供组件实现对齐；不要当 CSS 变量用） */
export const PROJECT_TYPE_SCALE = {
  display: { fluent: 'fontSizeHero1000', px: 68, lineHeight: 92, usage: '大卡的数字主信息' },
  'display-xl-112': { px: 112, lineHeight: 124, usage: '墙钟/计时器 hero（D-07 例外）' },
  'display-xl-96': { px: 96, lineHeight: 104, usage: '3×2 数字主信息（D-07 例外）' },
  'display-xl-80': { px: 80, lineHeight: 88, usage: '2×2 数字主信息（D-07 例外）' },
  'display-xl-48': { px: 48, lineHeight: 56, usage: '1×1 / 2×1 数字主信息（D-07 例外）' },
  'large-title': { fluent: 'fontSizeHero900', px: 40, lineHeight: 52, usage: '次要数值、分区标题' },
  bodyLarge: { fluent: 'fontSizeBase400', px: 16, lineHeight: 22, usage: '任务标题、正文强调' },
  body: { fluent: 'fontSizeBase300', px: 14, lineHeight: 20, usage: '正文/标签' },
  caption: { fluent: 'fontSizeBase200', px: 12, lineHeight: 16, usage: '微标签（非内容正文，最低档）' },
};
