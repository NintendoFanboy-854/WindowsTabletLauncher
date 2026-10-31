/**
 * Tauri 命令的前端调用面（A1 的 Rust command 一一对应）。
 *
 * 所有 `@tauri-apps/api` 都是动态 import：浏览器运行时这些模块不会被求值，
 * 也不影响 vite 打包。命令名与 `src-tauri/src/lib.rs` 的 `invoke_handler` 对应。
 */

import type { GeoLocation, PluginEnv, PluginRecord } from './types';
import type {
  BrowserDebugTargets,
  BrowserWindowAction,
  BrowserWindowState,
  IpLocation,
  MediaPlaybackCommand,
  MediaSessionSnapshot,
} from '../bridge/types';

export type { GeoLocation } from './types';
export type { IpLocation } from '../bridge/types';

type InvokeArgs = Record<string, unknown>;

/** 是否跑在 Tauri WebView 里（浏览器 / headless 截图时为 false） */
export function isTauriRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  const internals = (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  return typeof internals === 'object' && internals !== null;
}

export async function invokeCommand<T>(command: string, args?: InvokeArgs): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

// ---------- 插件目录（A2） ----------

export const pluginEnv = () => invokeCommand<PluginEnv>('plugin_env');

export const pluginList = () => invokeCommand<PluginRecord[]>('plugin_list');

export const pluginReadManifest = (pluginId: string) =>
  invokeCommand<string>('plugin_read_manifest', { pluginId });

export const pluginReadText = (pluginId: string, relPath: string) =>
  invokeCommand<string>('plugin_read_text', { pluginId, relPath });

export const pluginWriteText = (pluginId: string, relPath: string, contents: string) =>
  invokeCommand<void>('plugin_write_text', { pluginId, relPath, contents });

export const pluginRemove = (pluginId: string) =>
  invokeCommand<void>('plugin_remove', { pluginId });

/** 解压 zip 到 plugins/<id>/，返回新插件的记录 */
export const pluginInstallZip = (zipPath: string) =>
  invokeCommand<PluginRecord>('plugin_install_zip', { zipPath });

// ---------- 窗口 / 应用（A1） ----------

export const windowSetFullscreen = (enabled: boolean) =>
  invokeCommand<void>('window_set_fullscreen', { enabled });

export const windowToggleFullscreen = () => invokeCommand<boolean>('window_toggle_fullscreen');

export const windowIsFullscreen = () => invokeCommand<boolean>('window_is_fullscreen');

/**
 * 切换主窗口可见性，返回切换后是否可见。
 * Rust 侧注册的全局热键 Ctrl+Shift+H 调的是同一个命令，隐藏状态下也能恢复。
 */
export const windowToggleVisible = () => invokeCommand<boolean>('window_toggle_visible');

export const appExit = () => invokeCommand<void>('app_exit');

// ---------- 开机自启（A1） ----------

export const autostartIsEnabled = () => invokeCommand<boolean>('autostart_is_enabled');

export const autostartSetEnabled = (enabled: boolean) =>
  invokeCommand<boolean>('autostart_set_enabled', { enabled });

// ---------- 系统状态（A1，桥接层用） ----------

/** 系统级空闲秒数 */
export const getIdleSeconds = () => invokeCommand<number>('get_idle_seconds');

/** 阻止息屏 */
export const setKeepAwake = (on: boolean) => invokeCommand<void>('set_keep_awake', { on });

/** 系统定位，失败/未授权返回 null */
export const getLocation = () => invokeCommand<GeoLocation | null>('get_location');

/** ip.cn 网络归属地（D-16），失败/非 Tauri 返回 null */
export const ipLocate = () => invokeCommand<IpLocation | null>('ip_locate');

// ---------- 通用受管浏览器窗口 / SMTC（P3b，宿主不认插件） ----------

/** 打开/显示受管浏览器窗口；Rust 只接受 https URL */
export const browserWindowOpen = (url: string) =>
  invokeCommand<BrowserWindowState>('browser_window_open', { url });

/** 受管窗口控制：show / hide / minimize / close */
export const browserWindowControl = (action: BrowserWindowAction) =>
  invokeCommand<BrowserWindowState>('browser_window_control', { action });

/** 受管窗口运行状态 */
export const browserWindowState = () =>
  invokeCommand<BrowserWindowState>('browser_window_state');

/**
 * 受管窗口的 CDP 调试目标（`GET /json/list` 原样透传，宿主不过滤）。
 * 窗口未运行 / 调试端口没起来时命令返回 Err，由调用方降级。
 */
export const browserWindowDebugTargets = () =>
  invokeCommand<BrowserDebugTargets>('browser_window_debug_targets');

/** 当前 SMTC 媒体会话列表（宿主只透传，不挑会话） */
export const mediaSessions = () =>
  invokeCommand<MediaSessionSnapshot>('media_session_list');

/** 按会话 id 发传输命令，返回命令后的新快照 */
export const mediaCommand = (sessionId: string, command: MediaPlaybackCommand) =>
  invokeCommand<MediaSessionSnapshot>('media_session_command', { sessionId, command });

/** 按会话 id 取封面 data URL；拿不到返回空串 */
export const mediaArtwork = (sessionId: string) =>
  invokeCommand<string>('media_session_artwork', { sessionId });

/** 媒体键兜底（通用能力；不经过具体会话） */
export const mediaKey = (command: MediaPlaybackCommand) =>
  invokeCommand<void>('media_key', { command });
