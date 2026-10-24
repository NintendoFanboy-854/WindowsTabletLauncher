/**
 * 折叠态语音手势状态机（混合手势 / 空格等价 / 自动展开 / 静音断句）。
 *
 * 规格：`wtsl-touch-voice-design.md` §4.1–§4.5。一次手势同时满足两种意图：
 *
 * ```text
 * pointerdown → 立刻 startRecording()（0 延迟，不展开面板）
 * pointerup   → 按住 <300ms  = 点按：继续录（锁定），再点一下结束
 *               按住 ≥300ms  = 按住说话：松手即结束 → 转写 → 转写回来才展开
 * ```
 *
 * 状态与出口（每个状态都对应下面的一段代码）：
 * | 状态 | 触发 | 界面 | 代码 |
 * |---|---|---|---|
 * | `starting` | pointerdown / 空格 / 授权卡「允许」 | orb 按下态，无面板 | `begin()` + `starting` |
 * | `recording` | getUserMedia resolve | 录音胶囊 | `pill='recording'` |
 * | `locked` | pointerup 且 <300ms | 胶囊写「点一下结束」 | `lockedRef` / `onEntryPointerUp` |
 * | `transcribing` | 手动结束 / 静音断句 / 超时 | 胶囊写「转写中」 | `finish()` + `revealPending` |
 * | 展开 | 转写回来 / 回合已开始 | 半高语音窗 | `reveal` effect |
 * | 取消 | ✕ / Esc / 窗口失焦 / pointercancel / <400ms | 回 orb | `cancel()` / `finish()` 的短录音分支 |
 *
 * 鼠标形态（`resolveModality` 得到 `precise`）不走这套：保持 0.4.4 的「点一下先展开再录」，
 * 桌面手感不变（设计报告 §4.2 的结论）。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { AgentSession } from '../hooks/useAgentSession';
import type { Message } from '../types';
import {
  getInputMode,
  resolveModality,
  usesHybridGesture,
} from './inputModality';
import {
  checkMicrophone,
  declineMicConsent,
  getMicState,
  grantMicConsent,
  noteRecordingFailure,
  openMicPrivacySettings,
} from './micPermission';

/** 点按 / 按住的时长分界：与空格路径的「<300ms 视为误触」同一口径，不引入第二套时间语义 */
export const TAP_LOCK_MS = 300;
/** 最短有效录音：不足则丢弃并提示，不展开空面板 */
export const MIN_VOICE_MS = 400;
/** 单次录音上限：到点自动结束（防忘记），走正常转写与展开 */
export const MAX_VOICE_MS = 120_000;
/** 静音自动断句：连续 2.5s 低于 SILENCE_LEVEL，且已录 ≥3s、本段出现过 ≥SPEECH_LEVEL 的峰值 */
export const SILENCE_STOP_MS = 2_500;
export const SILENCE_LEVEL = 0.02;
export const SPEECH_LEVEL = 0.15;
const SILENCE_MIN_RECORDED_MS = 3_000;
/** 启动看门狗：getUserMedia 5s 未决视为失败（不能永远停在「按下态」） */
const START_TIMEOUT_MS = 5_000;
/** 启动中松手：等录音真正起来后再结束，保证有一段可发送的音频 */
const PENDING_STOP_DELAY_MS = MIN_VOICE_MS + 100;

export type MicCardMode = 'none' | 'consent' | 'failure';

export interface VoiceGesture {
  /** 折叠态胶囊：录音中 / 转写中 / 不显示 */
  pill: 'hidden' | 'recording' | 'transcribing';
  /** 点按锁定（胶囊上写「点一下结束」） */
  locked: boolean;
  /** getUserMedia 还没决（orb 按下态，不展开） */
  starting: boolean;
  /** 一次性的短提示（太短了 / 麦克风没响应），由 AgentSurface 渲染后自动消失 */
  notice: string | null;
  dismissNotice: () => void;
  micCard: MicCardMode;
  /** 打开系统设置/探测失败的原因（必须上屏） */
  micError: string | null;
  dismissMicCard: () => void;
  allowMic: () => void;
  declineMic: () => void;
  retryMic: () => Promise<void>;
  openSystemMicSettings: () => void;
  /** 胶囊 ■ */
  stop: () => void;
  /** 胶囊 ✕ */
  cancel: () => void;
  /** 转写中收起胶囊（结果仍保存在会话里，不再自动展开） */
  dismissTranscribing: () => void;
  /** 用户在录音/转写中主动关闭面板：抑制随后的自动展开 */
  suppressReveal: () => void;
  /** 入口 orb 的指针手势（触控/笔）；鼠标走 onEntryClick */
  onEntryPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onEntryPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onEntryPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onEntryLostPointerCapture: (event: ReactPointerEvent<HTMLElement>) => void;
  onEntryClick: (event: ReactMouseEvent<HTMLElement>) => void;
  /** 空格 keydown：开始录音（不展开面板） */
  startFromKeyboard: () => Promise<void>;
  /** 空格 keyup ≥300ms：结束并走「转写回来再展开」 */
  stopFromKeyboard: () => void;
  /** 半高窗「点击说话」/ 失败后的「再说一次」：就地开始录音（不换形态） */
  startHere: () => Promise<void>;
}

export interface UseVoiceGestureOptions {
  session: AgentSession;
  /** 当前是否折叠态：只有折叠态才有胶囊与「录完才展开」 */
  collapsed: boolean;
  /** 录音结束、转写回来 → 展开半高语音窗（不是全高） */
  onReveal: () => void;
  /** 失败时「改用键盘」的出口 → 打开全高对话面板 */
  onOpenChat: () => void;
  /** 「去设置」→ 打开 Agent 设置 */
  onOpenSettings: () => void;
}

/** 会话里最后一条语音提问（转写状态从它读：pending / ready / failed） */
function lastVoiceMessage(session: AgentSession): Message | undefined {
  const messages = session.conversation?.messages ?? [];
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === 'user' && message.input === 'voice') return message;
  }
  return undefined;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useVoiceGesture(options: UseVoiceGestureOptions): VoiceGesture {
  const { session, collapsed } = options;
  const sessionRef = useRef(session);
  const optionsRef = useRef(options);
  sessionRef.current = session;
  optionsRef.current = options;

  /** 本次 `pointerdown` 的起点（只在触控/笔路径上存在） */
  const pointerRef = useRef<{ at: number; id: number } | null>(null);
  /** 最近一次指针类型：click 事件里读不到稳定的 pointerType 时用它兜底 */
  const lastPointerTypeRef = useRef<string | undefined>(undefined);
  const lockedRef = useRef(false);
  /** getUserMedia 还没决时用户就松手：起来后立刻分流 */
  const pendingLockRef = useRef(false);
  const pendingStopRef = useRef(false);
  /** `startRecording()` 在途（错误归类与看门狗都用它） */
  const startAttemptRef = useRef(false);
  const startWatchdogRef = useRef<number | null>(null);
  /** 录音真正开始的时刻：`durationSec` 每 120ms 才刷新，短录音用它兜底 */
  const recordedAtRef = useRef<number | null>(null);
  /** 静音断句：本段出现过的最大电平（判断「用户确实说过话」）+ 静音起点 */
  const peakRef = useRef(0);
  const silenceSinceRef = useRef<number | null>(null);
  /** 结束录音后等转写回来再展开 */
  const suppressRevealRef = useRef(false);

  const [starting, setStarting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [revealPending, setRevealPending] = useState(false);
  const [micCard, setMicCard] = useState<MicCardMode>('none');

  const clearTimer = useCallback(() => {
    if (startWatchdogRef.current !== null) {
      window.clearTimeout(startWatchdogRef.current);
      startWatchdogRef.current = null;
    }
  }, []);

  /** 丢一个一次性提示（4s 后自己消失，不阻塞操作） */
  const raiseNotice = useCallback((text: string) => {
    setNotice(text);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4_000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  /** 结束当前录音：短录音丢弃，其余走转写 → 转写回来再展开 */
  const finish = useCallback(() => {
    const current = sessionRef.current;
    if (current.voice.stage !== 'recording') return;
    lockedRef.current = false;
    setLocked(false);
    const ownMs = recordedAtRef.current ? Date.now() - recordedAtRef.current : 0;
    const durationMs = Math.max(current.voice.durationSec * 1000, ownMs);
    if (durationMs < MIN_VOICE_MS) {
      current.cancelRecording();
      raiseNotice('太短了，再说一次');
      return;
    }
    if (optionsRef.current.collapsed) setRevealPending(true);
    void current.stopRecording();
  }, [raiseNotice]);
  const finishRef = useRef(finish);
  finishRef.current = finish;

  // 录音真正开始：收口启动态、应用「启动中按下的意图」、记录起点（短录音的时长兜底）
  useEffect(() => {
    if (session.voice.stage === 'recording') {
      recordedAtRef.current = Date.now();
      startAttemptRef.current = false;
      setStarting(false);
      setMicCard('none');
      if (pendingStopRef.current) {
        pendingStopRef.current = false;
        window.setTimeout(() => finishRef.current(), PENDING_STOP_DELAY_MS);
      } else if (pendingLockRef.current) {
        pendingLockRef.current = false;
        lockedRef.current = true;
        setLocked(true);
      }
      return;
    }
    if (session.voice.stage === 'idle') {
      recordedAtRef.current = null;
      peakRef.current = 0;
      silenceSinceRef.current = null;
    }
  }, [session.voice.stage]);

  /**
   * 启动录音（统一入口）：所有路径都过同一道麦克风门。
   * - 配置缺失：展开面板，让 AgentAlerts 里的配置错误可见（折叠态看不到面板内提示）
   * - 应用内还没同意：浮出授权卡，不偷偷开麦
   */
  const begin = useCallback(async (): Promise<void> => {
    if (startAttemptRef.current) return;
    const current = sessionRef.current;
    if (current.voice.stage !== 'idle' || current.status !== 'idle') return;
    if (!current.isMock && !current.configured) {
      optionsRef.current.onReveal();
      return;
    }
    if (getMicState().consent !== 'granted') {
      setMicCard('consent');
      return;
    }
    setNotice(null);
    setMicCard('none');
    setStarting(true);
    pendingLockRef.current = false;
    pendingStopRef.current = false;
    peakRef.current = 0;
    silenceSinceRef.current = null;
    suppressRevealRef.current = false;
    startAttemptRef.current = true;
    clearTimer();
    startWatchdogRef.current = window.setTimeout(() => {
      if (!startAttemptRef.current) return;
      startAttemptRef.current = false;
      setStarting(false);
      sessionRef.current.cancelRecording();
      raiseNotice('麦克风没有响应，可以再试一次');
    }, START_TIMEOUT_MS);

    await current.startRecording();
    clearTimer();
    // 启动失败 / 启动中被取消：等 React 提交后收口（stage 变更的 effect 也会兜一次）
    window.setTimeout(() => {
      if (!startAttemptRef.current) return;
      const latest = sessionRef.current;
      if (latest.voice.stage === 'recording') return;
      startAttemptRef.current = false;
      setStarting(false);
      if (latest.voice.error?.kind === 'mic') {
        setMicCard('failure');
        void noteRecordingFailure(latest.voice.error.message);
      }
    }, 0);
  }, [clearTimer, raiseNotice]);

  /**
   * 转写回来才展开：等 `voice.stage` 离开 transcribing，再看最后一条语音消息的
   * `transcriptStatus`。转写失败 → 仍然展开（错误必须可见，不能只有一个红三角）；
   * 用户主动收起过 → 不展开（关闭就是关闭）。
   */
  const lastVoice = lastVoiceMessage(session);
  const lastVoiceKey = lastVoice ? `${lastVoice.id}:${lastVoice.transcriptStatus ?? 'none'}` : 'none';
  useEffect(() => {
    if (!revealPending) return;
    if (!collapsed) {
      setRevealPending(false);
      return;
    }
    const current = sessionRef.current;
    if (current.voice.stage === 'recording') return;
    // 转写中且回合还没开始：继续保持「转写中」胶囊，不展开空面板。
    // 转写慢于 8s 预等待时回合已经开跑（有内容可看）→ 允许展开。
    if (current.voice.stage === 'transcribing' && current.status === 'idle') return;
    const message = lastVoiceMessage(current);
    if (message?.transcriptStatus === 'pending' && current.status === 'idle') return;
    setRevealPending(false);
    if (suppressRevealRef.current) return;
    optionsRef.current.onReveal();
  }, [revealPending, collapsed, lastVoiceKey, session.voice.stage, session.status, options.onReveal]);

  // 静音自动断句 + 单次录音上限（两者都走正常结束路径：转写 → 展开）
  useEffect(() => {
    if (session.voice.stage !== 'recording') return;
    const level = session.voice.level;
    const durationMs = session.voice.durationSec * 1000;
    if (level >= SPEECH_LEVEL) {
      peakRef.current = Math.max(peakRef.current, level);
      silenceSinceRef.current = null;
    } else if (level < SILENCE_LEVEL) {
      if (peakRef.current >= SPEECH_LEVEL && durationMs >= SILENCE_MIN_RECORDED_MS) {
        if (silenceSinceRef.current === null) silenceSinceRef.current = Date.now();
        if (Date.now() - silenceSinceRef.current >= SILENCE_STOP_MS) {
          finishRef.current();
          return;
        }
      }
    } else {
      silenceSinceRef.current = null;
    }
    if (durationMs >= MAX_VOICE_MS) finishRef.current();
  }, [session.voice.stage, session.voice.level, session.voice.durationSec]);

  const cancel = useCallback(() => {
    pointerRef.current = null;
    lockedRef.current = false;
    setLocked(false);
    pendingLockRef.current = false;
    pendingStopRef.current = false;
    sessionRef.current.cancelRecording();
  }, []);

  const startHere = useCallback(async () => {
    await begin();
  }, [begin]);

  const suppressReveal = useCallback(() => {
    suppressRevealRef.current = true;
    setRevealPending(false);
  }, []);

  // ---------- 授权卡动作 ----------

  const allowMic = useCallback(() => {
    grantMicConsent();
    setMicCard('none');
    // 点「允许」就是「我要说」：直接开录，不再要求第二次点击
    void begin();
  }, [begin]);

  const declineMic = useCallback(() => {
    declineMicConsent();
    setMicCard('none');
  }, []);

  const [micError, setMicError] = useState<string | null>(null);

  const retryMic = useCallback(async () => {
    setMicError(null);
    const result = await checkMicrophone();
    if (result.ok) {
      setMicCard('none');
      await begin();
      return;
    }
    setMicCard('failure');
  }, [begin]);

  const openSystemMicSettings = useCallback(() => {
    setMicError(null);
    void openMicPrivacySettings().catch((error: unknown) => {
      setMicError(`打开 Windows 设置失败：${errorText(error)}`);
    });
  }, []);

  // ---------- 指针手势 ----------

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      lastPointerTypeRef.current = event.pointerType;
      const modality = resolveModality(getInputMode(), event.pointerType);
      if (!usesHybridGesture(modality)) return;

      // 触控/笔：按下即录；阻止兼容鼠标事件与长按选中（orb 另有 touch-action: none）
      event.preventDefault();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // 指针已经被释放（极快点按）：手势仍按 pointerup 处理
      }

      const current = sessionRef.current;
      if (current.voice.stage === 'transcribing') return;
      if (current.voice.stage === 'recording') {
        // 锁定录音中的第二下：结束（不再新开一段）
        if (lockedRef.current) finishRef.current();
        return;
      }
      pointerRef.current = { at: performance.now(), id: event.pointerId };
      void begin();
    },
    [begin],
  );

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const modality = resolveModality(
      getInputMode(),
      event.pointerType || lastPointerTypeRef.current,
    );
    if (!usesHybridGesture(modality)) return;
    const pointer = pointerRef.current;
    pointerRef.current = null;
    const elapsed = pointer ? performance.now() - pointer.at : 0;
    const current = sessionRef.current;

    if (current.voice.stage === 'recording') {
      if (!pointer) return; // 已由第二下点按 / 取消处理
      if (elapsed < TAP_LOCK_MS) {
        lockedRef.current = true;
        setLocked(true);
        return;
      }
      finishRef.current();
      return;
    }
    // 启动中（getUserMedia 还没决）就松手：记住意图，录音起来后立刻分流
    if (startAttemptRef.current) {
      if (elapsed < TAP_LOCK_MS) pendingLockRef.current = true;
      else pendingStopRef.current = true;
    }
  }, []);

  const handlePointerCancel = useCallback(() => {
    const wasStarting = startAttemptRef.current;
    const recording = sessionRef.current.voice.stage === 'recording';
    cancel();
    if (wasStarting || recording) raiseNotice('录音已取消');
  }, [cancel, raiseNotice]);

  const handleLostPointerCapture = useCallback(() => {
    // pointerup 会先到；还留着 pointer 说明捕获意外丢失（手指滑出/系统接管）→ 取消
    if (!pointerRef.current) return;
    cancel();
  }, [cancel]);

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      // 键盘 Enter/空格激活按钮：detail === 0 —— 与「按住空格」同一语义（就地录音，不展开）；
      // 录音中再按一次 = 结束（键盘没有「松手」，得给一个成对的出口）
      if (event.detail === 0) {
        const folding = sessionRef.current;
        if (folding.voice.stage === 'recording') {
          finishRef.current();
        } else if (folding.voice.stage === 'idle' && folding.status === 'idle') {
          void begin();
        }
        return;
      }
      const native = event.nativeEvent as PointerEvent;
      const pointerType = native.pointerType || lastPointerTypeRef.current;
      const modality = resolveModality(getInputMode(), pointerType);
      // 触控/笔产生的合成 click 已经由 pointer 手势处理完，吞掉，避免双开
      if (usesHybridGesture(modality)) return;

      const current = sessionRef.current;
      if (current.voice.stage !== 'idle' || current.status !== 'idle') {
        if (optionsRef.current.collapsed) optionsRef.current.onReveal();
        return;
      }
      if (!current.isMock && !current.configured) {
        optionsRef.current.onReveal();
        return;
      }
      if (getMicState().consent !== 'granted') {
        setMicCard('consent');
        return;
      }
      // 鼠标：保持原来的手感（先展开半高窗，再立即录音）
      optionsRef.current.onReveal();
      void begin();
    },
    [begin],
  );

  const pill: VoiceGesture['pill'] = !collapsed
    ? 'hidden'
    : session.voice.stage === 'recording'
      ? 'recording'
      : session.voice.stage === 'transcribing' && revealPending
        ? 'transcribing'
        : 'hidden';

  return {
    pill,
    locked,
    starting,
    notice,
    dismissNotice: () => setNotice(null),
    micCard,
    micError,
    dismissMicCard: () => {
      setMicCard('none');
      setMicError(null);
    },
    allowMic,
    declineMic,
    retryMic,
    openSystemMicSettings,
    stop: finish,
    cancel,
    dismissTranscribing: suppressReveal,
    suppressReveal,
    onEntryPointerDown: handlePointerDown,
    onEntryPointerUp: handlePointerUp,
    onEntryPointerCancel: handlePointerCancel,
    onEntryLostPointerCapture: handleLostPointerCapture,
    onEntryClick: handleClick,
    startFromKeyboard: begin,
    stopFromKeyboard: finish,
    startHere,
  };
}
