/**
 * 主题注入：把 FluentProvider 实际生效的 CSS 变量读成 token 颜色，发给插件。
 *
 * 插件契约（DESIGN.md §3）：宿主通过 `init(theme)` 传 Fluent token 的最终颜色，
 * 插件把值写进自己的 CSS 变量。这里不手写颜色，全部来自 Fluent 的 CSS 变量。
 */

import type { ThemePayload } from '../bridge/types';
import {
  IDENTITY_HUES,
  IDENTITY_PALETTE,
  registerIdentityPalette,
  type IdentityThemePalette,
} from './identity';

/**
 * 下发给插件的 Fluent token 白名单（收窄后的唯一清单）。
 *
 * 分组：neutral 前景/表面/描边 + brand 交互色 + 状态三组（danger/success/warning）。
 * 不再下发：21 组 palette、全量 status、shadow*。身份色不在这张表里——它由
 * `withIdentityTheme` 只交付当前 hue 的 3 档，插件拿不到其它色相。
 */
const COLOR_TOKENS = [
  // 中性表面
  'colorNeutralBackground1',
  'colorNeutralBackground1Hover',
  'colorNeutralBackground1Pressed',
  'colorNeutralBackground1Selected',
  'colorNeutralBackground2',
  'colorNeutralBackground2Hover',
  'colorNeutralBackground3',
  'colorNeutralBackground4',
  // 中性前景
  'colorNeutralForeground1',
  'colorNeutralForeground2',
  'colorNeutralForeground3',
  'colorNeutralForeground4',
  'colorNeutralForegroundDisabled',
  // 中性描边 / 焦点
  'colorNeutralStroke1',
  'colorNeutralStroke2',
  'colorNeutralStroke3',
  'colorStrokeFocus1',
  'colorStrokeFocus2',
  'colorTransparentStroke',
  // 品牌交互色（只给插件内 Fluent 控件复用宿主品牌色）
  'colorBrandBackground',
  'colorBrandBackgroundHover',
  'colorBrandBackgroundPressed',
  'colorBrandBackgroundSelected',
  'colorBrandBackground2',
  'colorBrandForeground1',
  'colorBrandForeground2',
  'colorBrandStroke1',
  'colorBrandStroke2',
  // 状态三组：danger / success / warning（不做装饰，只表反馈）
  'colorStatusDangerBackground1',
  'colorStatusDangerBackground3',
  'colorStatusDangerForeground1',
  'colorStatusDangerBorder1',
  'colorStatusSuccessBackground1',
  'colorStatusSuccessBackground3',
  'colorStatusSuccessForeground1',
  'colorStatusSuccessBorder1',
  'colorStatusWarningBackground1',
  'colorStatusWarningBackground3',
  'colorStatusWarningForeground1',
  'colorStatusWarningBorder1',
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

  // 身份色三档：只在宿主内存里登记，不进入 ThemePayload；withIdentityTheme 会按
  // manifest.identityHue 只挑当前 hue 的三档交付。缺任一档会在那里显式抛错。
  const identityPalette: IdentityThemePalette = {};
  for (const hue of IDENTITY_HUES) {
    const tokens = IDENTITY_PALETTE[hue];
    const foreground = styles.getPropertyValue(`--${tokens.foreground}`).trim();
    const border = styles.getPropertyValue(`--${tokens.border}`).trim();
    const background = styles.getPropertyValue(`--${tokens.background}`).trim();
    if (foreground && border && background) {
      identityPalette[hue] = { foreground, border, background };
    }
  }
  registerIdentityPalette(theme, identityPalette);

  theme.colorScheme = detectColorScheme(theme.colorNeutralBackground1);
  return theme;
}
