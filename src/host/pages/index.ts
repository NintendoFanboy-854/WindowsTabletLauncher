/** 宿主页面（B 阶段）：设置 / 复盘 / 插件管理。 */

export { SettingsPage, type SettingsPageProps, type SettingsSection } from './settings/SettingsPage';
export {
  ReviewPage,
  type ReviewPageProps,
  loadReviewSnapshot,
  emptySnapshot,
  isStatsTool,
  type ReviewBridge,
  type ReviewSnapshot,
} from './review';
export {
  PluginsPage,
  type PluginsPageProps,
  isPluginEnabled,
  setPluginEnabled,
  readPluginPreferences,
  usePluginPreferences,
  type PluginPreferences,
} from './plugins';
export { PageScaffold, EmptyState, useMediaQuery, WIDE_PAGE_QUERY } from './shared';
