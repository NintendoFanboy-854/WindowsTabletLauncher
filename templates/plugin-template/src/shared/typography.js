/**
 * 插件排版（Equal Except Hue）。
 *
 * hero 数字不再按插件/尺寸自定义 px，也不定义项目级 CSS 变量：所有主数字直接引用
 * Fluent UI v9 的 `tokens.fontSizeHero900` / `tokens.lineHeightHero900`
 * （40 / 52，官方 type ramp 的 Large Title 档，逻辑 40px = 200% DPI 物理 80px）。
 * 插件样式里不允许再出现 48/68/80/96/112 或任何裸字号。
 */

import { tokens } from '@fluentui/react-components';

/** 唯一 hero 字号：Fluent Large Title（fontSizeHero900 / lineHeightHero900） */
export const HERO_TEXT = {
  fontSize: tokens.fontSizeHero900,
  lineHeight: tokens.lineHeightHero900,
};

/** 数字主信息字重（Fluent 语义：Display/Large Title 用 Semibold） */
export const DISPLAY_WEIGHT = tokens.fontWeightSemibold;

/** 数字等宽，避免秒/分钟跳动时布局抖动 */
export const TABULAR_NUMS = { fontVariantNumeric: 'tabular-nums' };

/** 项目语义层 → Fluent 字阶（纯文档用途，供组件实现对齐；不要当 CSS 变量用） */
export const PROJECT_TYPE_SCALE = {
  hero: {
    fluent: 'fontSizeHero900',
    lineHeightToken: 'lineHeightHero900',
    usage: '所有插件的主数字（卡与详情统一，40 / 52）',
  },
  'large-title': { fluent: 'fontSizeHero900', usage: '分区标题' },
  title3: { fluent: 'fontSizeBase500', usage: '次级数值' },
  bodyLarge: { fluent: 'fontSizeBase400', usage: '任务标题、正文强调' },
  body: { fluent: 'fontSizeBase300', usage: '正文/标签' },
  caption: { fluent: 'fontSizeBase200', usage: '微标签（最低档）' },
};
