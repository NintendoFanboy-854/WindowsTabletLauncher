/**
 * 桌面状态栏 / 快速设置面板的系统状态调用面。
 *
 * 系统能力在宿主 Rust（`src-tauri/src/system_status.rs`）：电量 / 充电 / 主音量 / 静音，
 * v0.8.0（D-43）起加入亮度 / 自动亮度能力检测，并新增 4 个写入命令。
 * 状态栏按固定节奏轮询只读快照；写入命令只在用户拖滑杆/点开关时调用。
 */

import { invokeCommand } from '../plugins/tauri';

export interface SystemStatusSnapshot {
  /** 电量 0–100；未知/无电池为 null */
  batteryPercent: number | null;
  /** 是否接通电源；未知为 null */
  charging: boolean | null;
  /** 主音量 0–100；拿不到为 null */
  volumePercent: number | null;
  /** 是否静音；拿不到为 null */
  muted: boolean | null;
  /** 内置屏亮度 0–100；WMI 不可用/无内置屏为 null（D-43） */
  brightnessPercent: number | null;
  /** 是否存在环境光传感器 + 系统自适应亮度能力；false 时面板整行不渲染 */
  autoBrightnessSupported: boolean;
  /** 系统自适应亮度是否开启；读不到为 null */
  autoBrightnessEnabled: boolean | null;
}

export const systemStatusSnapshot = () =>
  invokeCommand<SystemStatusSnapshot>('system_status_snapshot');

// ---------- 系统控制（D-43 写入命令；返回值不是渲染依赖，失败由调用方吃掉） ----------

export const systemSetVolume = (percent: number) =>
  invokeCommand<unknown>('system_set_volume', { percent });

export const systemSetMuted = (muted: boolean) =>
  invokeCommand<unknown>('system_set_muted', { muted });

export const systemSetBrightness = (percent: number) =>
  invokeCommand<unknown>('system_set_brightness', { percent });

export const systemSetAutoBrightness = (enabled: boolean) =>
  invokeCommand<unknown>('system_set_auto_brightness', { enabled });
