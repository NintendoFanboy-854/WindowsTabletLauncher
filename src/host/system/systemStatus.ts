/**
 * 桌面底部状态栏的系统状态调用面（只读）。
 *
 * 系统能力在宿主 Rust（`src-tauri/src/system_status.rs`）：电量 / 充电 / 主音量 / 静音。
 * 状态栏按固定节奏轮询；命令失败时各项降级为 null，不影响其它项。
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
}

export const systemStatusSnapshot = () =>
  invokeCommand<SystemStatusSnapshot>('system_status_snapshot');
