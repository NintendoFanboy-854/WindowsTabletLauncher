/**
 * 开机自启联动（B5）。
 *
 * 用户开过自启后，注册表里存的是“当时的 exe 路径”。应用被移动、重命名、
 * 或者开发/打包切换后，这个值就指向一个不存在的文件，开机静默失效且没有提示。
 * 启动时自愈一次：只要开关还是开的，就把值刷成当前 exe。
 */

import { autostartIsEnabled, autostartSetEnabled, isTauriRuntime } from '../plugins/tauri';

export type AutostartSyncResult = 'disabled' | 'refreshed' | 'unsupported' | 'error';

export async function syncAutostartOnStartup(): Promise<AutostartSyncResult> {
  if (!isTauriRuntime()) return 'unsupported';
  try {
    const enabled = await autostartIsEnabled();
    if (!enabled) return 'disabled';
    await autostartSetEnabled(true);
    return 'refreshed';
  } catch (error) {
    console.warn('[shell] 开机自启联动失败', error);
    return 'error';
  }
}
