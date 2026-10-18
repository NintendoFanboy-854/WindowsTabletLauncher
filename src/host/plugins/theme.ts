/**
 * 主题注入：把 FluentProvider 实际生效的 CSS 变量读成 token 颜色，发给插件。
 *
 * 插件契约（DESIGN.md §3）：宿主通过 `init(theme)` 传 Fluent token 的最终颜色，
 * 插件把值写进自己的 CSS 变量。这里不手写颜色，全部来自 Fluent 的 CSS 变量。
 */

import type { ThemePayload } from '../bridge/types';

/**
 * 插件可能用到的 Fluent 颜色 token。多给一些是为了插件换尺寸/换状态时不用回来加协议；
 * 只列出确实存在于当前 Fluent 主题里的（读不到就跳过）。
 */
const COLOR_TOKENS = [
  // 中性背景
  'colorNeutralBackground1',
  'colorNeutralBackground1Hover',
  'colorNeutralBackground1Pressed',
  'colorNeutralBackground1Selected',
  'colorNeutralBackground2',
  'colorNeutralBackground2Hover',
  'colorNeutralBackground2Pressed',
  'colorNeutralBackground3',
  'colorNeutralBackground3Hover',
  'colorNeutralBackground3Pressed',
  'colorNeutralBackground4',
  'colorNeutralBackground5',
  'colorNeutralBackground6',
  'colorNeutralBackgroundInverted',
  'colorNeutralBackgroundStatic',
  // 中性前景
  'colorNeutralForeground1',
  'colorNeutralForeground1Hover',
  'colorNeutralForeground1Pressed',
  'colorNeutralForeground1Selected',
  'colorNeutralForeground2',
  'colorNeutralForeground2Hover',
  'colorNeutralForeground2Pressed',
  'colorNeutralForeground2BrandHover',
  'colorNeutralForeground3',
  'colorNeutralForeground4',
  'colorNeutralForegroundDisabled',
  'colorNeutralForegroundInverted',
  'colorNeutralForegroundInverted2',
  'colorNeutralForegroundInvertedLink',
  'colorNeutralForegroundInvertedLinkHover',
  'colorNeutralForegroundInvertedLinkPressed',
  'colorNeutralForegroundOnBrand',
  // 中性描边
  'colorNeutralStroke1',
  'colorNeutralStroke1Hover',
  'colorNeutralStroke1Pressed',
  'colorNeutralStroke2',
  'colorNeutralStroke3',
  'colorNeutralStrokeAccessible',
  'colorNeutralStrokeAccessibleHover',
  'colorNeutralStrokeDisabled',
  'colorNeutralStrokeFocus1',
  'colorNeutralStrokeFocus2',
  // 品牌色
  'colorBrandBackground',
  'colorBrandBackgroundHover',
  'colorBrandBackgroundPressed',
  'colorBrandBackgroundSelected',
  'colorBrandBackground2',
  'colorBrandBackground3',
  'colorBrandBackgroundStatic',
  'colorBrandForeground1',
  'colorBrandForeground2',
  'colorBrandForeground2Hover',
  'colorBrandForeground2Pressed',
  'colorBrandForegroundLink',
  'colorBrandForegroundLinkHover',
  'colorBrandForegroundLinkPressed',
  'colorBrandStroke1',
  'colorBrandStroke2',
  'colorCompoundBrandBackground',
  'colorCompoundBrandBackgroundHover',
  'colorCompoundBrandBackgroundPressed',
  'colorCompoundBrandStroke',
  'colorCompoundBrandStrokeHover',
  'colorCompoundBrandStrokePressed',
  // subtle / 透明
  'colorSubtleBackground',
  'colorSubtleBackgroundHover',
  'colorSubtleBackgroundPressed',
  'colorSubtleBackgroundSelected',
  'colorTransparentBackground',
  'colorTransparentStroke',
  // 状态色（提醒 / 错误 / 成功）
  'colorPaletteRedForeground1',
  'colorPaletteRedForeground2',
  'colorPaletteRedBackground1',
  'colorPaletteRedBackground2',
  'colorPaletteRedBackground3',
  'colorPaletteRedBorder1',
  'colorPaletteRedBorder2',
  'colorStatusDangerBackground1',
  'colorStatusDangerBackground2',
  'colorStatusDangerBackground3',
  'colorStatusDangerForeground1',
  'colorStatusDangerBorder1',
  'colorStatusSuccessBackground1',
  'colorStatusSuccessBackground2',
  'colorStatusSuccessBackground3',
  'colorStatusSuccessForeground1',
  'colorStatusSuccessBorder1',
  'colorStatusWarningBackground1',
  'colorStatusWarningBackground2',
  'colorStatusWarningBackground3',
  'colorStatusWarningForeground1',
  'colorStatusWarningBorder1',
  'colorStatusInfoBackground1',
  'colorStatusInfoBackground2',
  'colorStatusInfoBackground3',
  'colorStatusInfoForeground1',
  'colorStatusInfoBorder1',
  // 调色板（插件图标 / 热力图 / 分类色）
  'colorPaletteBlueBackground2',
  'colorPaletteBlueForeground2',
  'colorPaletteBlueBorderActive',
  'colorPaletteGreenBackground2',
  'colorPaletteGreenForeground2',
  'colorPaletteGreenBorderActive',
  'colorPaletteYellowBackground2',
  'colorPaletteYellowForeground2',
  'colorPaletteYellowBorderActive',
  'colorPaletteOrangeBackground2',
  'colorPaletteOrangeForeground2',
  'colorPaletteOrangeBorderActive',
  'colorPaletteLightGreenBackground2',
  'colorPaletteLightGreenForeground2',
  'colorPaletteLightGreenBorderActive',
  'colorPaletteMarigoldBackground2',
  'colorPaletteMarigoldForeground2',
  'colorPaletteMarigoldBorderActive',
  'colorPalettePurpleBackground2',
  'colorPalettePurpleForeground2',
  'colorPalettePurpleBorderActive',
  'colorPalettePinkBackground2',
  'colorPalettePinkForeground2',
  'colorPalettePinkBorderActive',
  'colorPaletteTealBackground2',
  'colorPaletteTealForeground2',
  'colorPaletteTealBorderActive',
  // 阴影（少数插件会用在浮层上）
  'shadow2',
  'shadow4',
  'shadow8',
  'shadow16',
] as const;

function parseColor(value: string): [number, number, number] | null {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (hex) {
    const raw = hex[1];
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((char) => char + char)
            .join('')
        : raw;
    const int = Number.parseInt(full, 16);
    return [(int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff];
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(value.trim());
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every((part) => Number.isFinite(part))) {
      return [parts[0], parts[1], parts[2]];
    }
  }
  return null;
}

/** 用背景色亮度推断明暗，和 Fluent 主题的 colorScheme 对齐 */
function detectColorScheme(background: string | undefined): 'dark' | 'light' {
  if (!background) return 'dark';
  const rgb = parseColor(background);
  if (!rgb) return 'dark';
  const [red, green, blue] = rgb;
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.5 ? 'light' : 'dark';
}

/**
 * 读取当前 Fluent 主题的 token 颜色。
 * @param element 一般传 FluentProvider 渲染出来的根元素（默认 body）
 */
export function readFluentThemePayload(element?: HTMLElement | null): ThemePayload {
  const target = element ?? (typeof document !== 'undefined' ? document.body : null);
  const theme: ThemePayload = { colorScheme: 'dark' };
  if (!target || typeof getComputedStyle !== 'function') return theme;

  const styles = getComputedStyle(target);
  for (const token of COLOR_TOKENS) {
    const value = styles.getPropertyValue(`--${token}`).trim();
    if (value) theme[token] = value;
  }
  theme.colorScheme = detectColorScheme(theme.colorNeutralBackground1);
  return theme;
}
