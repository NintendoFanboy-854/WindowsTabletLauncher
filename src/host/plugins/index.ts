/**
 * 插件管理器的公共 API（宿主唯一应该 import 的入口）。
 *
 * - 数据：getPluginManager / usePlugins / normalizeManifest
 * - 摆桌面：manager.createInstances（首次默认摆放，持久化归 layout）
 * - 挂 iframe：PluginWidgetFrame / PluginBackgroundFrames
 * - 安装：manager.installZip / manager.attachZipDrop（Tauri 运行时）
 * - 主题：readFluentThemePayload
 * - Tauri 命令：./tauri（A1 的全部后端能力）
 */

export * from './types';
export type {
  HostToPluginMessage,
  PluginCallMessage,
  PluginToHostMessage,
  ThemePayload,
} from '../bridge/types';
export { toError } from './errors';
export { normalizeManifest, createDefaultInstances } from './manifest';
export type { DefaultInstancesOptions } from './manifest';
export {
  cloneSettingDefault,
  defaultSettingsValues,
  isTimeRangeValue,
  isTimeValue,
  mergeSettingsValues,
  normalizeSettingsSchema,
  settingsFieldCount,
  settingsFields,
  validateSettingValue,
  type SettingsMergeResult,
  type SettingsValues,
} from './settings';
export {
  PluginManager,
  getPluginManager,
  type PluginManagerListener,
  type PluginManagerOptions,
  type ZipDropCallbacks,
} from './manager';
export { createPluginSource, type PluginSource } from './source';
export { PluginWidgetFrame, type PluginWidgetFrameHandle, type PluginWidgetFrameProps, type HostApiReply } from './PluginWidgetFrame';
export {
  PluginBackgroundFrames,
  type BackgroundFrame,
  type PluginBackgroundFramesHandle,
  type PluginBackgroundFramesProps,
} from './PluginBackgroundFrames';
export { readFluentThemePayload } from './theme';
export { usePlugins, type UsePluginsResult } from './usePlugins';
export {
  appExit,
  autostartIsEnabled,
  autostartSetEnabled,
  getLocation,
  getIdleSeconds,
  invokeCommand,
  ipLocate,
  isTauriRuntime,
  pluginEnv,
  pluginInstallZip,
  pluginList,
  pluginReadManifest,
  pluginReadText,
  pluginRemove,
  pluginWriteText,
  setKeepAwake,
  windowIsFullscreen,
  windowSetFullscreen,
  windowToggleFullscreen,
  windowToggleVisible,
} from './tauri';
