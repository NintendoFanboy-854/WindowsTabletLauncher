/**
 * 插件主题解析（共享脚手架，DECISIONS.md D-02b）。
 *
 * 宿主通过 `host:init` / `host:theme` 注入 Fluent token 的最终颜色值
 * （载荷形如 { colorScheme: 'dark', colorNeutralBackground1: '#...', ... }）。
 * 这里把它合进 Fluent 的 webDarkTheme / webLightTheme，得到插件用的 Theme。
 *
 * 注意：插件一律用 FluentProvider 包根节点，组件内不手写颜色；只有需要
 * 把主题值传给 canvas / SVG / 内联样式的极少数场景才用 themeColor()。
 */

import { webDarkTheme, webLightTheme } from '@fluentui/react-components';

/** 旧骨架宿主（wtsl:init）只给四个别名，映射到 Fluent token 名 */
const LEGACY_TOKEN_MAP = {
  background: 'colorNeutralBackground1',
  foreground: 'colorNeutralForeground1',
  muted: 'colorNeutralForeground2',
  accent: 'colorBrandBackground',
};

function preferredScheme() {
  const media = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)');
  return media?.matches ? 'light' : 'dark';
}

/** 主题载荷 → { theme, scheme } */
export function resolveTheme(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  const scheme =
    source.colorScheme === 'light' ? 'light' : source.colorScheme === 'dark' ? 'dark' : preferredScheme();
  const base = scheme === 'light' ? webLightTheme : webDarkTheme;
  const overrides = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value !== 'string' || !value) continue;
    if (key === 'colorScheme') continue;
    const mapped = LEGACY_TOKEN_MAP[key];
    if (mapped) {
      overrides[mapped] = value;
      continue;
    }
    // 宿主直接给 Fluent token 名时照单接收；未知键忽略，避免污染主题
    if (Object.prototype.hasOwnProperty.call(base, key)) overrides[key] = value;
  }
  const theme = Object.keys(overrides).length > 0 ? { ...base, ...overrides } : base;
  return { theme, scheme };
}

/** 从主题里取一个 token 值（canvas / 内联色等个别场景） */
export function themeColor(theme, token) {
  return theme?.[token] ?? '';
}

/** 旧骨架宿主的 wtsl:init 主题载荷 → 本插件能用的 theme payload */
export function legacyThemePayload(themeData) {
  if (!themeData || typeof themeData !== 'object') return null;
  const background = String(themeData.background || '');
  const luminance = (() => {
    const rgba = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(background);
    if (rgba) return (Number(rgba[1]) + Number(rgba[2]) + Number(rgba[3])) / 3 / 255;
    const hex = /#([0-9a-f]{6})/i.exec(background);
    if (hex) {
      const r = parseInt(hex[1].slice(0, 2), 16);
      const g = parseInt(hex[1].slice(2, 4), 16);
      const b = parseInt(hex[1].slice(4, 6), 16);
      return (r + g + b) / 3 / 255;
    }
    return 0;
  })();
  return {
    colorScheme: luminance > 0.5 ? 'light' : 'dark',
    background: themeData.background,
    foreground: themeData.foreground,
    muted: themeData.muted,
    accent: themeData.accent,
  };
}
