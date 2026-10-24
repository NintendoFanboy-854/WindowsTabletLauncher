/**
 * 主题偏好：跟随系统 / 深色 / 亮色（Fluent 2 + Windows 桌面设备习惯）。
 *
 * - 默认 `system`：随 Windows 的亮暗模式自动切换，主 host 与所有插件（iframe）一起变；
 * - `dark` / `light`：用户显式固定；
 * - 偏好存 localStorage（`wtsl.themeMode`），旧值 `dark` / `light` 继续兼容。
 *
 * 真正的颜色仍然全部来自 FluentProvider 的 Fluent token；这里只负责“用哪套”。
 */

export type ThemeMode = 'system' | 'dark' | 'light';
export type ColorScheme = 'dark' | 'light';

export const THEME_KEY = 'wtsl.themeMode';
const LIGHT_QUERY = '(prefers-color-scheme: light)';

/** 读持久化的主题偏好（损坏/缺失回退到跟随系统） */
export function readThemeMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'system';
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    /* 隐私模式忽略 */
  }
  return 'system';
}

export function writeThemeMode(mode: ThemeMode): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* 隐私模式忽略 */
  }
}

/** 当前系统亮暗（没有 matchMedia 时按深色，产品默认是深色主题） */
export function systemColorScheme(): ColorScheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';
}

/** 主题偏好 → 实际生效的亮暗 */
export function resolveThemeMode(mode: ThemeMode): ColorScheme {
  return mode === 'system' ? systemColorScheme() : mode;
}

/**
 * 订阅系统亮暗变化（`prefers-color-scheme`）。
 * 只在需要重算渲染的组件里用；写 DOM 属性的地方用 systemColorScheme() 就行。
 */
export function onSystemColorSchemeChange(handler: (scheme: ColorScheme) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const media = window.matchMedia(LIGHT_QUERY);
  const listener = () => handler(media.matches ? 'light' : 'dark');
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }
  media.addListener(listener);
  return () => media.removeListener(listener);
}

/** 把当前生效的亮暗写到 documentElement（壁纸/滚动条/原生控件跟随） */
export function applyColorSchemeToDocument(scheme: ColorScheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = scheme;
  root.style.colorScheme = scheme;
  if (document.body) document.body.style.colorScheme = scheme;
  /*
   * 画布底色兜底（v0.4.1）：`html` 此前没有 background，只有 `body` 有——
   * 靠的是 CSS「html 无背景时 body 背景向画布传播」这条规则。规则本身没错，
   * 但它把「窗口底色」寄托在 body 确实铺满视口上：body 一旦高度不占满
   * （早期首帧、以后的布局重构、打印/尺寸极端），画布就回落到浏览器默认的
   * 纯白，在深色壁纸上就是一条白边。
   * 这里把同一个项目 token 也写到 `html` 上，画布永远不是 UA 默认色。
   * 只引用 styles.css 里已有的 `--wtsl-desktop-backdrop`（DESIGN §6 允许的
   * 壁纸 token），不新增颜色、不写字面色值。
   */
  root.style.setProperty('background', 'var(--wtsl-desktop-backdrop)');
}
