/**
 * 插件身份色（Equal Except Hue）。
 *
 * 插件只在 manifest 里选一个 hue，不能提交 hex / rgb / 任意饱和色。
 * 宿主把 hue 映射到 Fluent shared palette 的同一档
 * （Foreground2 / BorderActive / Background2），因此所有插件的身份色拥有同一
 * L* 与 C*，只有色相不同。
 *
 * 传输方式：身份色随 ThemePayload 下发（`wtslIdentity`），插件把它写成
 * `--wtsl-identity` CSS 变量；插件代码不得再引用具体的 palette token 名。
 */

import type { ThemePayload } from '../bridge/types';

/** 白名单：顺序即错误提示里的展示顺序 */
export const IDENTITY_HUES = ['blue', 'pink', 'orange', 'green', 'purple', 'teal'] as const;

export type IdentityHue = (typeof IDENTITY_HUES)[number];

/**
 * Fluent shared palette 的同一档亮度/彩度；插件不能选档，只能选 hue。
 * 每个 hue 固定取三档：Foreground2（图标/文字）、BorderActive（2px 状态强调）、
 * Background2（仅在明确需要淡底时；默认不用）。三档同源，保证只有色相开口。
 */
export const IDENTITY_PALETTE: Record<
  IdentityHue,
  { foreground: string; border: string; background: string }
> = {
  blue: {
    foreground: 'colorPaletteBlueForeground2',
    border: 'colorPaletteBlueBorderActive',
    background: 'colorPaletteBlueBackground2',
  },
  pink: {
    foreground: 'colorPalettePinkForeground2',
    border: 'colorPalettePinkBorderActive',
    background: 'colorPalettePinkBackground2',
  },
  // Fluent v9 的 shared palette 没有 `colorPaletteOrangeForeground2`，橙色档位叫 DarkOrange
  orange: {
    foreground: 'colorPaletteDarkOrangeForeground2',
    border: 'colorPaletteDarkOrangeBorderActive',
    background: 'colorPaletteDarkOrangeBackground2',
  },
  green: {
    foreground: 'colorPaletteGreenForeground2',
    border: 'colorPaletteGreenBorderActive',
    background: 'colorPaletteGreenBackground2',
  },
  purple: {
    foreground: 'colorPalettePurpleForeground2',
    border: 'colorPalettePurpleBorderActive',
    background: 'colorPalettePurpleBackground2',
  },
  teal: {
    foreground: 'colorPaletteTealForeground2',
    border: 'colorPaletteTealBorderActive',
    background: 'colorPaletteTealBackground2',
  },
};

/** 宿主从 FluentProvider 实际解析出的三档身份色 */
export interface IdentityThemeValues {
  foreground: string;
  border: string;
  background: string;
}

export type IdentityThemePalette = Partial<Record<IdentityHue, IdentityThemeValues>>;

/**
 * 身份色源只保存在宿主内存里（WeakMap），不进入 ThemePayload。
 * 这样下发给插件的主题里只会有当前 hue 的三档值，插件看不到其它 hue 的 palette token。
 */
const IDENTITY_SOURCE = new WeakMap<ThemePayload, IdentityThemePalette>();

/** theme.ts 读取完 Fluent CSS 变量后登记当前主题可用的身份色三档 */
export function registerIdentityPalette(theme: ThemePayload, palette: IdentityThemePalette): void {
  IDENTITY_SOURCE.set(theme, palette);
}

export function isIdentityHue(value: unknown): value is IdentityHue {
  return typeof value === 'string' && (IDENTITY_HUES as readonly string[]).includes(value);
}

/** 供 manifest 校验报错使用：把声明值安全地展示出来（不执行、不拼接 HTML） */
export function describeIdentityHue(value: unknown): string {
  if (value === undefined) return '未声明';
  if (typeof value === 'string') return `"${value}"`;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

/**
 * 把 hue 写进下发给插件的主题载荷。
 *
 * 这里使用 `getComputedStyle` 已解析出的具体颜色值，而不是 `var(--...)`：
 * 宿主 provider 与插件 iframe 是两个文档，CSS 变量引用不能跨文档继承。
 * 颜色本身仍来自 Fluent shared palette 的三档值。
 *
 * 失败策略：非法 hue 或三档 token 缺失都直接抛错，不再回退到
 * `colorNeutralForeground3`。静默回退会让六插件身份色失效且无人察觉，
 * 与 manifest.ts 的白名单校验（非法 identityHue 拒绝加载）保持一致。
 */
export function withIdentityTheme(
  theme: ThemePayload | undefined,
  hue: IdentityHue,
): ThemePayload | undefined {
  if (!theme) return theme;
  if (!isIdentityHue(hue)) {
    throw new Error(
      `非法 identityHue：${describeIdentityHue(hue)}。只允许 ${IDENTITY_HUES.join(' / ')}。`,
    );
  }

  const palette = IDENTITY_PALETTE[hue];
  const values = IDENTITY_SOURCE.get(theme)?.[hue];
  const missing: string[] = [];
  if (!values?.foreground) missing.push(palette.foreground);
  if (!values?.border) missing.push(palette.border);
  if (!values?.background) missing.push(palette.background);
  if (!values?.foreground || !values.border || !values.background) {
    throw new Error(
      `身份色 ${hue} 的 Fluent token 未解析到：${missing.join(' / ')}。` +
        `宿主不会回退成中性色；请检查 FluentProvider 主题是否缺少 shared palette。`,
    );
  }

  return {
    ...theme,
    wtslIdentityHue: hue,
    wtslIdentity: values.foreground,
    wtslIdentityBorder: values.border,
    wtslIdentitySurface: values.background,
  };
}
