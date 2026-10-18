/**
 * 插件启用/禁用偏好（B4）。
 *
 * 只存一份本地偏好，不改变插件目录：禁用 = 宿主不再把它的组件摆上桌面。
 * 桌面层 / 插件管理器接线时用 `isPluginEnabled(plugin.id)` 过滤；页面里改完会
 * 同步发出变更事件，宿主已经挂载的订阅方（usePluginPreferences）会立即刷新。
 */

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'wtsl.plugins.preferences';
const CHANGE_EVENT = 'wtsl:plugin-preferences';

export interface PluginPreferences {
  disabled: readonly string[];
}

let cached: PluginPreferences | null = null;

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function readPluginPreferences(): PluginPreferences {
  const store = storage();
  if (!store) return { disabled: [] };
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return { disabled: [] };
    const parsed = JSON.parse(raw) as { disabled?: unknown };
    const disabled = Array.isArray(parsed.disabled)
      ? parsed.disabled.filter((id): id is string => typeof id === 'string')
      : [];
    return { disabled };
  } catch {
    return { disabled: [] };
  }
}

function snapshot(): PluginPreferences {
  cached ??= readPluginPreferences();
  return cached;
}

function write(next: PluginPreferences): void {
  const store = storage();
  store?.setItem(STORAGE_KEY, JSON.stringify({ disabled: [...next.disabled] }));
  cached = { disabled: [...next.disabled] };
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function isPluginEnabled(pluginId: string): boolean {
  return !snapshot().disabled.includes(pluginId);
}

export function setPluginEnabled(pluginId: string, enabled: boolean): void {
  const current = snapshot().disabled.filter((id) => id !== pluginId);
  write({ disabled: enabled ? current : [...current, pluginId] });
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = () => {
    cached = null;
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

/** 宿主接线时用来过滤桌面实例；页面内改开关也会实时刷新 */
export function usePluginPreferences(): PluginPreferences {
  return useSyncExternalStore(subscribe, snapshot, () => ({ disabled: [] }));
}
