/** 宿主外壳（B）：页面路由、全局快捷键、开机自启联动、页面切换动效。 */

export {
  HOST_PAGES,
  PAGE_TITLES,
  PAGE_PARAM,
  isHostPage,
  parseHostPage,
  readHostPage,
  writeHostPage,
  useHostPage,
  type HostPage,
} from './routes';
export {
  useGlobalShortcuts,
  toggleWindowVisibility,
  quitApplication,
  type GlobalShortcutHandlers,
  type SwitchVisibilityResult,
} from './useGlobalShortcuts';
export { syncAutostartOnStartup, type AutostartSyncResult } from './autostart';
export { PageTransition } from './PageTransition';
export { reconcileWindowGeometry, type WindowGeometryResult } from './windowGeometry';
export { ContentTransition, type ContentTransitionProps } from './ContentTransition';
export {
  THEME_KEY,
  applyColorSchemeToDocument,
  onSystemColorSchemeChange,
  readThemeMode,
  resolveThemeMode,
  systemColorScheme,
  writeThemeMode,
  type ColorScheme,
  type ThemeMode,
} from './themeMode';
export {
  fetchBingWallpaper,
  readCachedWallpaper,
  useBingWallpaper,
  wallpaperCredit,
  type BingWallpaper,
  type WallpaperCredit,
  type WallpaperSource,
} from './wallpaper';
