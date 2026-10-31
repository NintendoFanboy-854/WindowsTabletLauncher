/**
 * 音频焦点前端调用面（P1，需求 1）。
 *
 * 系统能力在宿主 Rust 侧（`src-tauri/src/audio_focus.rs`）：录音 / TTS 开始时把平板本地
 * 其他应用的音频会话压低，结束后恢复。这里只做类型、invoke 封装与一层轻量幂等：
 * - 同一 reason 已 acquire 就不重复发 IPC；
 * - 只有 acquire 过的 reason 才 release（React 重复渲染 / 异常路径不会刷 IPC）；
 * - acquire/release 串行提交：快速点按（acquire 还没回来就松手）时顺序仍然正确，
 *   Rust 侧不会先收到 release 再收到 acquire。
 *
 * 函数本身照常抛错（浏览器运行时没有 Rust 侧），由调用方决定是否忽略；
 * 录音 / TTS 这种主流程统一用 `void ...catch()` 吞掉。
 */

import { invokeCommand } from '../plugins/tauri';

export type AudioFocusReason = 'voiceInput' | 'speechOutput';

export type AudioSourceKindHint = 'local-media' | 'external-media' | 'other';

/** FIFO 冲突的两方：`external` = 蓝牙推流，`local` = 本机 SMTC 媒体会话（P3c）。 */
export type AudioFocusChannel = 'external' | 'local';

/**
 * 双音源 FIFO 状态（P3c，SPEC §3.6）。
 *
 * - `winner`：冲突赢家（后开始播放的一方）；只有一方在播时就是那一方；都不在播为 null；
 * - `suppressed`：被压制的一方——`external` 只把平板本地输出静音（手机仍在推流），
 *   `local` 是淡出后 SMTC pause。没有压制为 null。
 *
 * 压制不会自动恢复：只有手动恢复命令、或输家自己停止播放时才清除。
 */
export interface AudioFocusFifoState {
  winner: AudioFocusChannel | null;
  suppressed: AudioFocusChannel | null;
}

export interface AudioFocusSource {
  /** local-media | external-media | other（P1 按进程名粗略给） */
  kindHint: AudioSourceKindHint;
  /** 会话所属进程 id */
  pid: number;
  /** 进程 exe 名；拿不到为空串 */
  process: string;
  /** active | inactive | expired */
  state: string;
  /** 首次接管时的原始音量 0..1 */
  originalVolume: number;
  /** 当前已写入的音量 0..1 */
  appliedVolume: number;
  /** 当前是否静音 */
  muted: boolean;
  /** 当前目标增益 0..1 */
  gain: number;
}

export interface AudioFocusSnapshot {
  active: AudioFocusReason[];
  /** 双音源 FIFO 冲突处理是否启用（设置页「两个音源同时播放」；false = 只保存、不处理） */
  fifoEnabled: boolean;
  /** 双音源 FIFO 状态（P3c）；没有冲突时 winner 是唯一在播的一方、suppressed 为 null */
  fifo: AudioFocusFifoState;
  /** 正在被管理的音频会话（诊断 + UI） */
  sources: AudioFocusSource[];
}

/** 本地幂等层：已 acquire 的 reason（模块级，UI 卸载后由调用方显式 release）。 */
const acquiredReasons = new Set<AudioFocusReason>();
/** 每次 acquire 的序号：快速 acquire→release→acquire 时，旧请求失败不能清掉新请求的标记。 */
const acquireTokens = new Map<AudioFocusReason, number>();
let nextAcquireToken = 0;

/** 串行提交同一批 acquire/release，保证 Rust 侧看到的顺序与调用顺序一致。 */
let ipcChain: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = ipcChain.then(task, task);
  ipcChain = run.catch(() => undefined);
  return run;
}

/** 把设置里的 0–100 百分比收成整数；坏值按默认 20（不能误落成静音）。 */
function normalizeGainPercent(gainPercent: number): number {
  if (!Number.isFinite(gainPercent)) return 20;
  return Math.min(100, Math.max(0, Math.round(gainPercent)));
}

/**
 * 申请音频焦点。同一 reason 已申请时直接返回 null（不重复 IPC）。
 * gainPercent 0 = 静音、100 = 不压低。
 */
export function acquireAudioFocus(
  reason: AudioFocusReason,
  gainPercent: number,
): Promise<AudioFocusSnapshot | null> {
  if (acquiredReasons.has(reason)) return Promise.resolve(null);
  acquiredReasons.add(reason);
  const token = nextAcquireToken;
  nextAcquireToken += 1;
  acquireTokens.set(reason, token);
  const gain = normalizeGainPercent(gainPercent);
  return enqueue(() =>
    invokeCommand<AudioFocusSnapshot>('audio_focus_acquire', { reason, gain }),
  ).catch((error: unknown) => {
    // 申请失败就不算持有，下一次 acquire 仍会重试；只清自己这次，避免误伤后来的 acquire。
    if (acquireTokens.get(reason) === token) {
      acquireTokens.delete(reason);
      acquiredReasons.delete(reason);
    }
    throw error;
  });
}

/**
 * 释放音频焦点。没有 acquire 过时直接返回 null（异常路径 / 重复渲染不刷 IPC）。
 * 实际下发顺序由串行链保证：release 一定排在它之前那次 acquire 后面。
 */
export function releaseAudioFocus(
  reason: AudioFocusReason,
): Promise<AudioFocusSnapshot | null> {
  if (!acquiredReasons.has(reason)) return Promise.resolve(null);
  acquiredReasons.delete(reason);
  acquireTokens.delete(reason);
  return enqueue(() => invokeCommand<AudioFocusSnapshot>('audio_focus_release', { reason }));
}

/** 只读快照：诊断 / 设置页用（纯内存，不阻塞）。 */
export const audioFocusSnapshot = () =>
  invokeCommand<AudioFocusSnapshot>('audio_focus_snapshot');

/**
 * 手动恢复被 FIFO 压制的音源（P3c，宿主命令 `audio_focus_restore_suppressed`）。
 *
 * - 被压制的是蓝牙音乐：解除本地静音、恢复会话音量（连接与手机推流原样保留）；
 * - 被压制的是本机媒体：只恢复会话音量，**不自动播放**（用户自己去点播放）。
 *
 * 恢复后宿主进入「手动覆盖」：直到下一次任一方新的播放开始前不会再自动压制。
 * 一次性命令，不参与本模块的 reason 幂等层（不要放进 acquire/release 串行链）。
 */
export const restoreSuppressedAudioFocus = () =>
  invokeCommand<AudioFocusSnapshot>('audio_focus_restore_suppressed');

/**
 * 设置页开关：是否启用双音源 FIFO 冲突处理（关闭后只保留语音/TTS 压低）。
 *
 * 一次性命令；App 启动时会按持久化设置同步一次，设置页切换时立即同步。
 */
export function setAudioFifoEnabled(enabled: boolean): Promise<AudioFocusSnapshot> {
  return invokeCommand<AudioFocusSnapshot>('audio_focus_set_fifo', { enabled });
}

/** 退出兜底：立即恢复所有被压低的会话（本地幂等层一并清空）。 */
export function restoreAllAudioFocus(): Promise<void> {
  acquiredReasons.clear();
  acquireTokens.clear();
  return enqueue(() => invokeCommand<void>('audio_focus_restore_all'));
}
