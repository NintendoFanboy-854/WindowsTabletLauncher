/**
 * 蓝牙音箱（A2DP Sink）前端调用面。
 *
 * 系统能力在宿主 Rust 侧（`src-tauri/src/bluetooth_audio.rs`），这里只做类型与 invoke 封装：
 * 该功能是宿主系统服务，不是插件；页面是宿主全屏页（`?page=bluetooth`）。
 */

import { invokeCommand } from '../plugins/tauri';

/** 连接状态：idle 未启用 / enabled 已声明接收但尚未真正建立 / opened 已建立 / closed 已断开 */
export type BtConnectionState = 'idle' | 'enabled' | 'opened' | 'closed';

export interface BtDeviceInfo {
  id: string;
  name: string;
}

export interface BtAudioSnapshot {
  /** 本机是否具备蓝牙音频接收能力 */
  available: boolean;
  /** 系统是否有蓝牙无线电 */
  bluetoothSupported: boolean;
  /** 蓝牙开关；未知为 null */
  bluetoothOn: boolean | null;
  /** 已配对、可推送音频的设备 */
  devices: BtDeviceInfo[];
  /** 当前连接/启用的设备 id */
  activeDeviceId: string | null;
  /** 是否已建立连接（手机尚未开始推流时也为 true） */
  connected: boolean;
  /** 手机是否正在推流 */
  streaming: boolean;
  /** idle | enabled | opened | closed（诊断用；UI 以 connected/streaming 为准） */
  connectionState: BtConnectionState;
  /** 最近一次失败原因 */
  lastError: string | null;
}

export const btAudioSnapshot = () => invokeCommand<BtAudioSnapshot>('bt_audio_snapshot');

/** 重新枚举设备与蓝牙状态（较慢，页面进入/手动刷新时调用） */
export const btAudioRefresh = () => invokeCommand<BtAudioSnapshot>('bt_audio_refresh');

export const btAudioConnect = (deviceId: string) =>
  invokeCommand<BtAudioSnapshot>('bt_audio_connect', { deviceId });

export const btAudioDisconnect = () => invokeCommand<BtAudioSnapshot>('bt_audio_disconnect');

export const btAudioSetBluetooth = (on: boolean) =>
  invokeCommand<BtAudioSnapshot>('bt_audio_set_bluetooth', { on });

/** 打开 Windows 蓝牙设置（配对/系统开关的兜底入口） */
export const btAudioOpenSettings = () => invokeCommand<void>('bt_audio_open_settings');
