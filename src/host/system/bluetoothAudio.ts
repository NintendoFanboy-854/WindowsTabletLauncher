/**
 * 蓝牙音箱（A2DP Sink）前端调用面。
 *
 * 系统能力在宿主 Rust 侧（`src-tauri/src/bluetooth_audio.rs`），这里只做类型与 invoke 封装：
 * 该功能是宿主系统服务，不是插件；UI 在设置页「常规 → 设备」分组 + 桌面状态栏快速设置面板。
 *
 * v0.8.0（D-44）起快照多了后台自动连接状态机字段：autoConnectEnabled / autoConnectState /
 * attemptDeviceId / lastAttemptError / preferredDeviceId / order。旧后端（v0.7.0）不会返回这些
 * 字段，读取侧一律按缺省值兜底（`?? []` / `?? false`），避免升级过程中崩溃。
 */

import { invokeCommand } from '../plugins/tauri';

/** 连接状态：idle 未启用 / enabled 已声明接收但尚未真正建立 / opened 已建立 / closed 已断开 */
export type BtConnectionState = 'idle' | 'enabled' | 'opened' | 'closed';

/** 后台自动连接状态机（D-44）：off 关闭 / waiting 空闲 / trying 尝试中 / listening 等事件 / backoff 退避 / paused 用户手动断开 / unavailable 不支持 */
export type BtAutoConnectState =
  | 'off'
  | 'waiting'
  | 'trying'
  | 'listening'
  | 'backoff'
  | 'paused'
  | 'unavailable';

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
  /** 后台自动连接总开关（D-44） */
  autoConnectEnabled: boolean;
  /** 自动连接状态机（D-44） */
  autoConnectState: BtAutoConnectState;
  /** 自动连接正在尝试的设备 id */
  attemptDeviceId: string | null;
  /** 自动连接最近一次失败原因 */
  lastAttemptError: string | null;
  /** 首选设备 id（面板/设置页的实心星标） */
  preferredDeviceId: string | null;
  /** 自动连接顺序：首选优先，其余按最近连接时间倒序 */
  order: string[];
}

/** 自动连接状态的中文短语义（设置页描述、Agent 摘要共用） */
export const AUTO_CONNECT_STATE_TEXT: Record<BtAutoConnectState, string> = {
  off: '已关闭',
  waiting: '等待设备',
  trying: '正在尝试连接',
  listening: '正在等待手机连接',
  backoff: '上次尝试失败，稍后重试',
  paused: '手动断开后已暂停',
  unavailable: '系统不支持自动连接',
};

export const btAudioSnapshot = () => invokeCommand<BtAudioSnapshot>('bt_audio_snapshot');

/** 按后端给的自动连接顺序（首选 → MRU）排列设备；order 为空时保留发现顺序 */
export function orderedDevices(snapshot: BtAudioSnapshot): BtDeviceInfo[] {
  const order = Array.isArray(snapshot.order) ? snapshot.order : [];
  if (order.length === 0) return [...snapshot.devices];
  const rank = new Map(order.map((id, index) => [id, index]));
  const preferred = snapshot.preferredDeviceId;
  return [...snapshot.devices].sort((left, right) => {
    if (left.id === preferred) return -1;
    if (right.id === preferred) return 1;
    const leftRank = rank.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = rank.get(right.id) ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });
}

/** 重新枚举设备与蓝牙状态（较慢，页面进入/手动刷新时调用） */
export const btAudioRefresh = () => invokeCommand<BtAudioSnapshot>('bt_audio_refresh');

export const btAudioConnect = (deviceId: string) =>
  invokeCommand<BtAudioSnapshot>('bt_audio_connect', { deviceId });

export const btAudioDisconnect = () => invokeCommand<BtAudioSnapshot>('bt_audio_disconnect');

export const btAudioSetBluetooth = (on: boolean) =>
  invokeCommand<BtAudioSnapshot>('bt_audio_set_bluetooth', { on });

/** 打开 Windows 蓝牙设置（配对/系统开关的兜底入口） */
export const btAudioOpenSettings = () => invokeCommand<void>('bt_audio_open_settings');

// ---------- 自动连接 / 首选（D-44） ----------

export const btAudioSetAutoConnect = (enabled: boolean) =>
  invokeCommand<BtAudioSnapshot>('bt_audio_set_auto_connect', { enabled });

/** `deviceId = null` 表示清空首选 */
export const btAudioSetPreferred = (deviceId: string | null) =>
  invokeCommand<BtAudioSnapshot>('bt_audio_set_preferred', { deviceId });

/** 解除「手动断开」造成的 paused，重新开始自动寻找 */
export const btAudioResumeAuto = () => invokeCommand<BtAudioSnapshot>('bt_audio_resume_auto');

/**
 * `lastError` / `lastAttemptError` 前缀归一成一句用户可读文案（不透传 HRESULT）。
 *
 * 面板只用这一行短文案；设置页另有带标题/动作的 MessageBar 版本。
 */
export function btErrorText(message: string | null | undefined): string | null {
  if (!message) return null;
  if (/^(创建音频连接失败|启用音频接收失败|建立音频连接失败|读取连接状态失败)/.test(message)) {
    return '连接失败，重试一次';
  }
  if (/^(枚举音频设备失败|蓝牙音频不可用)/.test(message)) {
    return '读取设备失败，到系统蓝牙设置里检查';
  }
  if (/^(系统不允许切换蓝牙开关|没有找到蓝牙无线电|切换蓝牙失败|读取蓝牙状态失败)/.test(message)) {
    return '蓝牙开关失败，系统没有允许';
  }
  if (/自动连接|尝试连接|回连/.test(message)) {
    return '自动连接失败，稍后重试';
  }
  return '蓝牙操作失败，重试一次';
}
