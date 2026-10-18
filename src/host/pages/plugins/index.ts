/** 插件管理页（B4）与启用/禁用偏好。 */

export { PluginsPage, type PluginsPageProps } from './PluginsPage';
export {
  isPluginEnabled,
  setPluginEnabled,
  readPluginPreferences,
  usePluginPreferences,
  type PluginPreferences,
} from './preferences';
