/**
 * 蓝牙音箱（A2DP Sink）前端调用面。
 *
 * 系统能力在宿主 Rust 侧（`src-tauri/src/bluetooth_audio.rs`），这里只做类型与 invoke 封装：
 * 该功能是宿主系统服务，不是插件；UI 在设置页「常规 → 设备」分组 + 桌面状态栏快速设置面板。
 *
 * v0.8.0（D-44）起快照多了后台自动连接状态机字段：autoConnectEnabled / autoConnectState /
 * attemptDeviceId / lastAttemptError / preferredDeviceId / order。旧后端（v0.7.0）不会返回这些
 * 字段，读取侧一律按缺省值兜底（`?? []` / `?? false`），避免升级过程中崩溃。
 *
 * P2（D-51）起快照多了物理层与操作层：radioPhase / linkPhase / operation / lastTransitionAtMs，
 * 以及 unverifiedDisconnect（Close 后无法确认 ACL 断开）与 outputSuppressed / suppressReason
 * （P3c FIFO 本地静音，由音频焦点仲裁写入）。四个命令（connect / disconnect / set_enabled /
 * set_bluetooth）改为**非阻塞**：调用后立即返回带 `operation` 的快照，worker 完成后清空；
 * 需要「等结果」的调用方用 `waitForBluetoothSettled()` 轮询终态。
 */

import { invokeCommand } from '../plugins/tauri';
import { restoreSuppressedAudioFocus, type AudioFocusSnapshot } from './audioFocus';

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

/** A2DP 链路物理阶段（P2，D-51）：idle 无连接 / connecting 尝试中 / connected 持有连接未见 Opened /
 * streaming 手机推流中 / disconnecting Close 后观察 ACL / closed 无法确认断开（配合 unverifiedDisconnect） */
export type LinkPhase = 'idle' | 'connecting' | 'connected' | 'streaming' | 'disconnecting' | 'closed';

/** 蓝牙无线电阶段（P2）：退出不碰无线电 */
export type RadioPhase = 'unavailable' | 'off' | 'turningOn' | 'on' | 'turningOff';

/** 显式操作种类（P2）；`stage` 是后端给的简短英文阶段串，中文文案在本文件映射 */
export type BtOperationKind =
  | 'connect'
  | 'disconnect'
  | 'enable'
  | 'disable'
  | 'bluetoothOn'
  | 'bluetoothOff'
  | 'refresh';

export interface BtOperation {
  id: string;
  kind: BtOperationKind;
  /** 连接类操作的目标设备；非连接类通常为 null */
  deviceId: string | null;
  /** queued / connecting / closing / verifying-link / stopping-watcher / starting-watcher / ... */
  stage: string;
  startedAtMs: number;
}

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
  /** 是否已建立连接（手机尚未开始推流时也为 true；disconnecting 期间仍为 true） */
  connected: boolean;
  /** 手机是否正在推流 */
  streaming: boolean;
  /** idle | enabled | opened | closed（诊断用；由 linkPhase 映射，UI 以 linkPhase 为准） */
  connectionState: BtConnectionState;
  /** 最近一次失败原因 */
  lastError: string | null;
  /**
   * 蓝牙音箱总开关（v0.8.1）：关 = 断开并停止寻找，开 = 打开蓝牙并恢复寻找。
   * 旧后端没有该字段时按 `autoConnectEnabled && autoConnectState !== 'paused'` 推断。
   */
  enabled?: boolean;
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

  // ---------- P2（D-51）：物理层 / 操作层 ----------
  /** A2DP 链路阶段；旧后端没有该字段时用 connected/streaming 推断（见 linkPhaseOf） */
  linkPhase?: LinkPhase;
  /** 蓝牙无线电阶段；旧后端没有该字段 */
  radioPhase?: RadioPhase;
  /** 正在进行的显式操作；null = 空闲（旧后端没有该字段） */
  operation?: BtOperation | null;
  /** 最近一次链路/操作状态跃迁（unix 毫秒） */
  lastTransitionAtMs?: number;
  /** Close 后观察窗口内未能确认 ACL 断开：UI 文案「可能仍连接」 */
  unverifiedDisconnect?: boolean;
  /** FIFO 本地静音（P3c）：手机仍在推流，只是平板本地输出被本机音乐压住 */
  outputSuppressed?: boolean;
  /** 静音原因（P3c；后端给通用英文串，如 local-media-playing） */
  suppressReason?: string | null;
}

/** 自动连接状态的中文短语义（设置页描述、Agent 摘要共用） */
export const AUTO_CONNECT_STATE_TEXT: Record<BtAutoConnectState, string> = {
  off: '已关闭',
  waiting: '等待设备',
  trying: '正在尝试连接',
  listening: '正在等待手机连接',
  backoff: '上次尝试失败',
  paused: '手动断开后已暂停',
  unavailable: '系统不支持自动连接',
};

export const btAudioSnapshot = () => invokeCommand<BtAudioSnapshot>('bt_audio_snapshot');

/** 链路阶段：新快照直读 linkPhase，旧后端按 connected/streaming 推断（升级兼容） */
export function linkPhaseOf(snapshot: BtAudioSnapshot | null | undefined): LinkPhase {
  if (!snapshot) return 'idle';
  if (snapshot.linkPhase) return snapshot.linkPhase;
  if (snapshot.streaming) return 'streaming';
  if (snapshot.connected) return 'connected';
  return 'idle';
}

/**
 * 操作阶段的中文过渡文案（P2，D-51）。
 *
 * Rust 只给英文 stage，映射集中在这里：状态栏 pill、快速设置面板、设置页、Agent 摘要共用，
 * 避免各入口文案不一致。文案必须真实（不假装瞬间完成）。
 */
export function btOperationText(operation: BtOperation | null | undefined): string | null {
  if (!operation) return null;
  switch (operation.kind) {
    case 'connect':
      return '连接中…';
    case 'disconnect':
      return '断开中…';
    case 'enable':
      if (operation.stage === 'turning-on-radio') return '打开蓝牙中…';
      if (operation.stage === 'starting-watcher') return '正在寻找设备…';
      return '打开中…';
    case 'disable':
      if (operation.stage === 'stopping-watcher') return '正在停止寻找…';
      if (operation.stage === 'queued') return '关闭中…';
      return '断开中…';
    case 'bluetoothOn':
      return '打开蓝牙中…';
    case 'bluetoothOff':
      return '关闭中…';
    case 'refresh':
      return '正在刷新…';
    default:
      return null;
  }
}

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

/** 重新枚举设备与蓝牙状态（较慢，页面进入/手动刷新时调用；仍是阻塞命令） */
export const btAudioRefresh = () => invokeCommand<BtAudioSnapshot>('bt_audio_refresh');

export const btAudioConnect = (deviceId: string) =>
  invokeCommand<BtAudioSnapshot>('bt_audio_connect', { deviceId });

export const btAudioDisconnect = () => invokeCommand<BtAudioSnapshot>('bt_audio_disconnect');

/** 蓝牙音箱总开关：开 = 开蓝牙 + 恢复寻找；关 = 断开 + 停止寻找。 */
export const btAudioSetEnabled = (enabled: boolean) =>
  invokeCommand<BtAudioSnapshot>('bt_audio_set_enabled', { enabled });

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

// ---------- 等待终态（P2，D-51） ----------

/** 轮询间隔：Agent 工具与需要「等结果」的 UI 共用；不是性能指标 */
const SETTLE_POLL_INTERVAL_MS = 250;
/** 默认等待上限：一次连接尝试可能排队在多台设备之后；超时返回最后快照，不假装成功 */
const SETTLE_DEFAULT_TIMEOUT_MS = 12_000;

/**
 * 轮询快照直到 `operation === null`，返回最后一次快照（含超时后的进行中快照）。
 *
 * 非阻塞命令（connect / disconnect / set_enabled / set_bluetooth）只保证「已入队」；
 * Agent 工具与「等结果」的调用方必须用这个 helper 看到真实的终态（linkPhase / lastError），
 * 而不是把「已发起」当成「已完成」。
 */
export async function waitForBluetoothSettled(
  timeoutMs: number = SETTLE_DEFAULT_TIMEOUT_MS,
): Promise<BtAudioSnapshot> {
  let latest = await btAudioSnapshot();
  const deadline = Date.now() + Math.max(0, timeoutMs);
  while ((latest.operation ?? null) !== null && Date.now() < deadline) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, SETTLE_POLL_INTERVAL_MS);
    });
    latest = await btAudioSnapshot();
  }
  return latest;
}

/**
 * P3c：解除 FIFO 本地静音。
 *
 * 真正的命令是音频焦点的 `audio_focus_restore_suppressed`（本地静音状态由 FIFO 仲裁写入蓝牙
 * 快照），这里只做蓝牙侧的别名：只解除平板本地输出的静音，不断连接、不操控手机端。
 * 异常不吞：调用方（store / Agent 工具）决定如何显示失败。
 */
export const btAudioRestoreOutput = (): Promise<AudioFocusSnapshot> =>
  restoreSuppressedAudioFocus();

/**
 * `lastError` / `lastAttemptError` 前缀归一成一句用户可读文案（不透传 HRESULT）。
 *
 * 只陈述发生了什么，不写「重试一次 / 到系统蓝牙设置里检查」这类教程式后缀：
 * 重试由按钮承担（面板/设置页都有「重试」），文案保持一行、可扫读。
 */
export function btErrorText(message: string | null | undefined): string | null {
  if (!message) return null;
  if (/^(创建音频连接失败|启用音频接收失败|建立音频连接失败|读取连接状态失败)/.test(message)) {
    return '连接失败';
  }
  if (/^(枚举音频设备失败|蓝牙音频不可用)/.test(message)) {
    return '读取设备失败';
  }
  if (/^(系统不允许切换蓝牙开关|没有找到蓝牙无线电|切换蓝牙失败|读取蓝牙状态失败)/.test(message)) {
    return '系统未允许蓝牙操作';
  }
  if (/自动连接|尝试连接|回连/.test(message)) {
    return '自动连接失败';
  }
  return '蓝牙操作失败';
}
