/**
 * 麦克风授权链路：应用内同意 + 真实探测 + 失败归类 + 打开系统设置。
 *
 * 为什么需要这一层（`wtsl-touch-voice-design.md` §1.3 / §4.6）：
 * WebView2 没有内建授权 UI，0.4.4 里 `getUserMedia` 直接 `NotAllowedError`。
 * Rust 侧 `Builder::on_permission_request` 把 `PermissionKind::Microphone` 应答为 Allow，
 * 但**只在没有持久化决定时**才会被问到：0.4.4 那次拒绝已经被 WebView2 按 origin 写进了 profile
 * （`media_stream_mic` = Block），之后 `PermissionRequested` 根本不再触发。
 * 所以「WebView2 站点权限」这一层由 `ensureMicSitePermission()` 主动覆盖，用户不需要操作；
 * 剩下两层仍必须可见地处理：
 * ① 应用内同意（本文件 `consent`，独立 localStorage 键）
 * ③ Windows 系统隐私开关（应用内无法解除，只能把用户导到 `ms-settings:privacy-microphone`）
 * ④ 设备本身（没有麦 / 被独占）
 *
 * 探测只用 `getUserMedia` 一次并在同一帧释放音轨：它既是「设置页检查」的实现，
 * 也是失败归类的唯一可靠手段（`voice.error` 只带了 message，没有 `err.name`）。
 */

import { useSyncExternalStore } from 'react';
import { invokeCommand, isTauriRuntime } from '../../plugins/tauri';

/**
 * WebView2「站点权限」层：把本站 origin 的麦克风状态写成 Allow（幂等，一次会话只发一次）。
 *
 * 0.4.4 把一次拒绝按 origin 持久化进了 profile，之后 `PermissionRequested` 不再触发，
 * `on_permission_request` 的 Allow 永远等不到机会。这里用 Rust 侧的
 * `ICoreWebView2Profile4::SetPermissionState` 覆盖那份旧记录 —— 这是唯一不依赖用户手动删 profile 的路。
 * 失败不阻塞录音：下一次探测/重试会再来一遍。
 */
let sitePermission: Promise<void> | null = null;

export function ensureMicSitePermission(): Promise<void> {
  if (!isTauriRuntime()) return Promise.resolve();
  if (!sitePermission) {
    sitePermission = invokeCommand<void>('ensure_mic_permission').catch((error: unknown) => {
      sitePermission = null;
      console.warn('[mic] 写入 WebView2 麦克风权限失败', error);
    });
  }
  return sitePermission;
}

// 启动即修一次：老用户升级后不需要手动清 profile 就能录音
void ensureMicSitePermission();

export type MicConsent = 'unset' | 'granted' | 'declined';

/** 失败归类：必须与用户看到的文案、下一步动作一一对应，不能都写「权限被拒」 */
export type MicFailureKind = 'denied' | 'system' | 'nodevice' | 'busy' | 'unsupported' | 'unknown';

export const MIC_CONSENT_STORAGE_KEY = 'agent.micConsent';

/** 打开系统设置/探测的最长等待：超过就按「没有响应」处理，不让界面卡住 */
const PROBE_TIMEOUT_MS = 5_000;

export interface MicProbeOk {
  ok: true;
  deviceLabel: string;
}

export interface MicProbeFail {
  ok: false;
  kind: MicFailureKind;
  /** 面向用户的短句（不含 Chromium 英文原文） */
  message: string;
  /** 原始错误名，进交付报告/排障用，不上屏 */
  errorName: string;
}

export type MicProbeResult = MicProbeOk | MicProbeFail;

export interface MicState {
  consent: MicConsent;
  /** unchecked = 还没探测过；ok = 最近一次探测成功 */
  status: 'unchecked' | 'ok' | MicFailureKind;
  message: string;
  checking: boolean;
}

function readConsent(): MicConsent {
  if (typeof localStorage === 'undefined') return 'unset';
  const raw = localStorage.getItem(MIC_CONSENT_STORAGE_KEY);
  return raw === 'granted' || raw === 'declined' ? raw : 'unset';
}

let state: MicState = { consent: readConsent(), status: 'unchecked', message: '', checking: false };
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function update(patch: Partial<MicState>): void {
  state = { ...state, ...patch };
  emit();
}

export function subscribeMic(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== MIC_CONSENT_STORAGE_KEY) return;
    update({ consent: readConsent() });
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function getMicState(): MicState {
  return state;
}

export function useMicState(): MicState {
  return useSyncExternalStore(subscribeMic, getMicState, getMicState);
}

/** 应用内同意（第一次点麦克风时的授权卡「允许」） */
export function grantMicConsent(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MIC_CONSENT_STORAGE_KEY, 'granted');
  }
  update({ consent: 'granted' });
}

/** 「先用文字」：记下这次不同意，下次用户主动点麦克风时再问一次 */
export function declineMicConsent(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MIC_CONSENT_STORAGE_KEY, 'declined');
  }
  update({ consent: 'declined' });
}

function classifyMicError(error: unknown): MicProbeFail {
  const name = error instanceof Error ? error.name : '';
  const fallback = error instanceof Error ? error.message : String(error);
  const consent = getMicState().consent;

  // NotAllowedError 无法 100% 区分「WebView2 站点权限」与「Windows 系统隐私开关」
  // （两者 Chromium 文案相同）。Rust 侧已应答 Allow，所以已同意过仍被拒 = 系统层。
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
    return consent === 'granted'
      ? {
          ok: false,
          kind: 'system',
          message: '系统麦克风没有允许',
          errorName: name || fallback,
        }
      : {
          ok: false,
          kind: 'denied',
          message: '还没有允许使用麦克风',
          errorName: name || fallback,
        };
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
    return { ok: false, kind: 'nodevice', message: '没有找到麦克风', errorName: name };
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return { ok: false, kind: 'busy', message: '麦克风被别的应用占用', errorName: name };
  }
  return {
    ok: false,
    kind: 'unknown',
    message: '无法开启麦克风',
    errorName: name || fallback,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | 'timeout'> {
  return new Promise<T | 'timeout'>((resolve, reject) => {
    const timer = window.setTimeout(() => resolve('timeout'), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

/**
 * 真实探测一次麦克风：拿到流、复核音轨可用、立刻释放。
 * 失败时按 `err.name` 归类（这是唯一能拿到错误名的地方）。
 */
export async function probeMicrophone(): Promise<MicProbeResult> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return {
      ok: false,
      kind: 'unsupported',
      message: '当前环境不支持录音',
      errorName: 'Unsupported',
    };
  }

  let stream: MediaStream | null = null;
  // 探测前再修一次：profile 里的旧 Block 不清掉，这里拿到的一定是 NotAllowedError
  await ensureMicSitePermission();
  const pending = navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  try {
    const raced = await withTimeout(pending, PROBE_TIMEOUT_MS);
    if (raced === 'timeout') {
      // 晚到的流也要关掉，否则麦克风会一直开着
      void pending.then((late) => late.getTracks().forEach((track) => track.stop())).catch(() => {});
      return { ok: false, kind: 'unknown', message: '麦克风没有响应', errorName: 'Timeout' };
    }
    stream = raced;
    const [track] = stream.getAudioTracks();
    const settings = track?.getSettings?.() ?? {};
    if (!track || track.readyState !== 'live' || !settings.deviceId) {
      return { ok: false, kind: 'nodevice', message: '没有找到麦克风', errorName: 'NoLiveTrack' };
    }
    return { ok: true, deviceLabel: track.label || '默认麦克风' };
  } catch (error) {
    return classifyMicError(error);
  } finally {
    stream?.getTracks().forEach((track) => track.stop());
  }
}

/** 设置页「检查」与授权卡「重试」共用的入口：探测一次并把结果写进 store */
export async function checkMicrophone(): Promise<MicProbeResult> {
  if (state.checking) {
    return { ok: false, kind: 'unknown', message: '正在检查', errorName: 'InFlight' };
  }
  update({ checking: true });
  const result = await probeMicrophone();
  update(
    result.ok
      ? { checking: false, status: 'ok', message: result.deviceLabel }
      : { checking: false, status: result.kind, message: result.message },
  );
  return result;
}

/**
 * 用一次失败的录音启动补做归类：`voice.error` 只有一句 message，
 * 归类要靠真实探测。探测成功说明刚才的失败是设备忙碌/瞬时错误。
 */
export async function noteRecordingFailure(fallbackMessage: string): Promise<MicProbeResult> {
  const result = await checkMicrophone();
  if (result.ok) {
    update({ status: 'busy', message: fallbackMessage || '麦克风被别的应用占用' });
    return { ok: false, kind: 'busy', message: fallbackMessage || '麦克风被别的应用占用', errorName: 'ProbeOkStartFailed' };
  }
  return result;
}

export function clearMicStatus(): void {
  update({ status: 'unchecked', message: '' });
}

/** 打开 Windows「隐私和安全性 → 麦克风」（系统层被拒后应用内无法再唤起系统提示） */
export async function openMicPrivacySettings(): Promise<void> {
  if (!isTauriRuntime()) {
    throw new Error('当前是浏览器预览，不能打开 Windows 设置');
  }
  await invokeCommand<void>('open_mic_privacy_settings');
}
