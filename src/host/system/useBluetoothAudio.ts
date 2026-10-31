/**
 * 蓝牙快照的模块级单例 store（P2，D-51）：状态栏 pill、快速设置面板、设置页分组共用同一份
 * 快照与同一套 action；组件里不再有本地 `btBusy` / `pendingDeviceId` / `pendingDisconnect`，
 * 也不再各自起 interval（单一数据源，跨入口一致）。
 *
 * 轮询节奏：空闲 2s；`operation != null` 或 linkPhase 处于 connecting / disconnecting 时 500ms。
 * 第一个订阅者出现时先读一次快照点亮 UI，再做一次慢枚举（设备列表；与旧状态栏首刷一致）后
 * 进入轮询；没有订阅者就停。浏览器演示态不轮询：StatusBar 的 `?statusDemo` 假数据仍在组件里，
 * 组件自行兜底。
 *
 * 约束：action 不把错误抛给 UI 组件——失败只把 `error` 置 true（快照保留上一帧）。
 */

import { useSyncExternalStore } from 'react';

import { isTauriRuntime } from '../plugins/tauri';
import {
  btAudioConnect,
  btAudioDisconnect,
  btAudioOpenSettings,
  btAudioRefresh,
  btAudioRestoreOutput,
  btAudioResumeAuto,
  btAudioSetAutoConnect,
  btAudioSetBluetooth,
  btAudioSetEnabled,
  btAudioSetPreferred,
  btAudioSnapshot,
  type BtAudioSnapshot,
} from './bluetoothAudio';

export interface BluetoothAudioState {
  snapshot: BtAudioSnapshot | null;
  /** 最近一次读取 / 命令失败（组件只显示归一文案，不透传原始错误） */
  error: boolean;
  /** 是否至少拿到过一次快照（设置页用它区分「正在读取」与「读取失败」） */
  loaded: boolean;
}

const IDLE_INTERVAL_MS = 2000;
const BUSY_INTERVAL_MS = 500;

const INITIAL_STATE: BluetoothAudioState = { snapshot: null, error: false, loaded: false };

let state: BluetoothAudioState = INITIAL_STATE;
const listeners = new Set<() => void>();

let timer: number | null = null;
/** 是否有订阅者驱动的轮询循环（无订阅者即停） */
let started = false;
/** 是否有在途请求（轮询或首次预热）：避免 StrictMode 二次订阅叠加慢枚举 */
let inFlight = false;

function setState(patch: Partial<BluetoothAudioState>): void {
  state = { ...state, ...patch };
  for (const listener of [...listeners]) listener();
}

/**
 * 写入快照：`lastTransitionAtMs` 更旧的响应不会覆盖更新的状态。
 *
 * 非阻塞命令的响应是「已入队的快照」，可能比轮询拿到的新快照旧；不加这个比较，
 * 面板会在操作结束后被旧的 queued 快照短暂盖回去。
 */
function applySnapshot(next: BtAudioSnapshot): void {
  const current = state.snapshot;
  if (current && (current.lastTransitionAtMs ?? 0) > (next.lastTransitionAtMs ?? 0)) return;
  setState({ snapshot: next, error: false, loaded: true });
}

function getSnapshot(): BluetoothAudioState {
  return state;
}

function getServerSnapshot(): BluetoothAudioState {
  return INITIAL_STATE;
}

function nextDelay(): number {
  const snapshot = state.snapshot;
  const transitioning =
    Boolean(snapshot?.operation) ||
    snapshot?.linkPhase === 'connecting' ||
    snapshot?.linkPhase === 'disconnecting';
  return transitioning ? BUSY_INTERVAL_MS : IDLE_INTERVAL_MS;
}

function schedule(delay: number): void {
  if (typeof window === 'undefined') return;
  if (timer !== null) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    void tick();
  }, delay);
}

async function tick(): Promise<void> {
  timer = null;
  if (!started || listeners.size === 0 || inFlight) return;
  inFlight = true;
  try {
    const next = await btAudioSnapshot();
    if (!started) return;
    applySnapshot(next);
  } catch {
    if (started) setState({ error: true, loaded: true });
  } finally {
    inFlight = false;
  }
  if (started && listeners.size > 0) schedule(nextDelay());
}

/** 首次预热：先快照点亮 UI，再显式枚举一次设备（慢，但只在第一个订阅者出现时做）。 */
async function warmup(): Promise<void> {
  inFlight = true;
  try {
    try {
      const first = await btAudioSnapshot();
      if (started) applySnapshot(first);
    } catch {
      if (started) setState({ error: true, loaded: true });
    }
    try {
      const scanned = await btAudioRefresh();
      if (started) applySnapshot(scanned);
    } catch {
      if (started) setState({ error: true, loaded: true });
    }
  } finally {
    inFlight = false;
  }
  if (started && listeners.size > 0) schedule(nextDelay());
}

function start(): void {
  if (started) return;
  started = true;
  if (!isTauriRuntime()) return;
  if (inFlight) return;
  void warmup();
}

function stop(): void {
  started = false;
  if (timer !== null && typeof window !== 'undefined') {
    window.clearTimeout(timer);
    timer = null;
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

/** 命令入队后立刻把轮询切到快速节奏（非阻塞命令的 operation 会马上出现在快照里） */
function kick(): void {
  if (!started || inFlight || listeners.size === 0) return;
  schedule(nextDelay());
}

async function refreshNow(): Promise<BtAudioSnapshot | null> {
  if (!isTauriRuntime()) return state.snapshot;
  try {
    const next = await btAudioRefresh();
    applySnapshot(next);
    return next;
  } catch {
    setState({ error: true, loaded: true });
    return null;
  }
}

async function runCommand(
  command: () => Promise<BtAudioSnapshot>,
): Promise<BtAudioSnapshot | null> {
  if (!isTauriRuntime()) return state.snapshot;
  kick();
  try {
    const next = await command();
    applySnapshot(next);
    kick();
    return next;
  } catch {
    setState({ error: true, loaded: true });
    return null;
  }
}

const connect = (deviceId: string) => runCommand(() => btAudioConnect(deviceId));

const disconnect = () => runCommand(btAudioDisconnect);

const setEnabled = (enabled: boolean) => runCommand(() => btAudioSetEnabled(enabled));

const setBluetooth = (on: boolean) => runCommand(() => btAudioSetBluetooth(on));

const setPreferred = (deviceId: string | null) => runCommand(() => btAudioSetPreferred(deviceId));

const resumeAuto = () => runCommand(btAudioResumeAuto);

async function setAutoConnect(enabled: boolean): Promise<BtAudioSnapshot | null> {
  const next = await runCommand(() => btAudioSetAutoConnect(enabled));
  // 重新打开自动连接时顺带解除「手动断开」造成的 paused（D-44 用户意图）
  if (enabled && next?.autoConnectState === 'paused') {
    return runCommand(btAudioResumeAuto);
  }
  return next;
}

async function openSettings(): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await btAudioOpenSettings();
  } catch {
    setState({ error: true });
  }
}

/**
 * 解除双音源冲突造成的蓝牙音乐本地静音（P3c）。
 *
 * 静音旗标在蓝牙快照上、命令走音频焦点（`audio_focus_restore_suppressed`）。命令返回时
 * worker 已经写好旗标，所以这里读一份**纯内存**快照立刻更新面板/状态栏（不触发一次耗时的
 * 设备枚举；需要重扫设备时用户仍可点面板的「重试」走 refreshNow）。失败只置 `error`。
 */
async function restoreOutput(): Promise<BtAudioSnapshot | null> {
  if (!isTauriRuntime()) return state.snapshot;
  try {
    await btAudioRestoreOutput();
    const next = await btAudioSnapshot();
    applySnapshot(next);
    return next;
  } catch {
    setState({ error: true, loaded: true });
    return null;
  }
}

/** 稳定引用：组件可以把这些函数放进 useCallback / useEffect 依赖 */
export const bluetoothAudioActions = {
  refreshNow,
  connect,
  disconnect,
  setEnabled,
  setBluetooth,
  setPreferred,
  setAutoConnect,
  resumeAuto,
  restoreOutput,
  openSettings,
};

export type BluetoothAudioStore = BluetoothAudioState & typeof bluetoothAudioActions;

/** 订阅 + 取 action；action 失败只落到 `error`，不向组件抛错 */
export function useBluetoothAudio(): BluetoothAudioStore {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...current, ...bluetoothAudioActions };
}
