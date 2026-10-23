/**
 * 录音停止 / 取消的局部忙态。
 *
 * `stopRecording()` 在 hook 里是 async：转写完成前按钮仍可点。半高语音窗与
 * 全高输入区各有一份录音 UI，共用这个 hook 保证同一个停止按钮不会被连点两次，
 * 同时保留 `busy` 给 VoiceCapture 显示 spinner / 禁用主操作。
 */

import { useState } from 'react';
import type { AgentSession } from '../hooks/useAgentSession';

export interface VoiceControls {
  /** 正在结束录音（等 ASR / 发送中） */
  busy: boolean;
  /** 结束并发送当前录音 */
  stop: () => void;
  /** 取消当前录音（不发送、不留消息） */
  cancel: () => void;
}

export function useVoiceControls(session: AgentSession): VoiceControls {
  const [busy, setBusy] = useState(false);

  const stop = () => {
    if (busy || session.voice.stage !== 'recording') return;
    setBusy(true);
    void session.stopRecording().finally(() => setBusy(false));
  };

  const cancel = () => {
    if (busy) return;
    session.cancelRecording();
  };

  return { busy, stop, cancel };
}
