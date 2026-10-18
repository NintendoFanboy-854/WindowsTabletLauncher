/**
 * MiMo TTS 流式播放器。
 *
 * 传输层产出 PCM16 单声道 24kHz 的增量块，这里按到达顺序排进 WebAudio 时间线连续播放：
 * 每块建一个 AudioBuffer，起点取 max(当前时间, 上一块结束时间)，因此不需要自己拼大文件。
 */

import type { AgentTransport } from '../types';

/** MiMo 流式 TTS 的输出采样率（docs：pcm16，24kHz） */
const PCM_SAMPLE_RATE = 24_000;

export type TtsPlayerState = 'idle' | 'playing';

export interface SpeakOptions {
  transport: AgentTransport;
  text: string;
  voice: string;
  rate: number;
  signal: AbortSignal;
  onState?: (state: TtsPlayerState) => void;
}

function abortError(): DOMException {
  return new DOMException('朗读已停止', 'AbortError');
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const onAbort = () => {
      cleanup();
      reject(abortError());
    };
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export class TtsPlayer {
  private context: AudioContext | null = null;
  private sources: AudioBufferSourceNode[] = [];
  private controller: AbortController | null = null;
  private speaking = false;

  get isSpeaking(): boolean {
    return this.speaking;
  }

  private ensureContext(): AudioContext {
    if (!this.context) this.context = new AudioContext();
    return this.context;
  }

  /**
   * 朗读一段文本，直到播放完 / 被停止 / 出错。
   * 连续朗读的“后续每条自动读”由会话层决定，这里只负责一次播放。
   */
  async speak(options: SpeakOptions): Promise<void> {
    this.stop();

    const context = this.ensureContext();
    if (context.state === 'suspended') await context.resume().catch(() => {});
    const controller = new AbortController();
    this.controller = controller;
    const onAbort = () => controller.abort();
    options.signal.addEventListener('abort', onAbort, { once: true });

    let queueEnd = context.currentTime;
    this.speaking = true;
    options.onState?.('playing');

    try {
      for await (const samples of options.transport.synthesize(options.text, {
        voice: options.voice,
        rate: options.rate,
        signal: controller.signal,
      })) {
        if (controller.signal.aborted) throw abortError();
        if (!samples.length) continue;

        const buffer = context.createBuffer(1, samples.length, PCM_SAMPLE_RATE);
        const channel = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index += 1) {
          channel[index] = samples[index] / 0x8000;
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        const startAt = Math.max(context.currentTime + 0.03, queueEnd);
        source.start(startAt);
        queueEnd = startAt + buffer.duration;
        this.sources.push(source);
        source.addEventListener('ended', () => {
          this.sources = this.sources.filter((item) => item !== source);
        });
      }

      // 等播放队列走完；上下文被自动播放策略挂起时，用“理论时长 + 余量”兜底
      const waitMs = Math.max(0, (queueEnd - context.currentTime) * 1000) + 1_500;
      const deadline = Date.now() + waitMs;
      while (context.currentTime < queueEnd - 0.05) {
        if (controller.signal.aborted) throw abortError();
        if (Date.now() > deadline) break;
        await sleep(60, controller.signal);
      }
    } finally {
      options.signal.removeEventListener('abort', onAbort);
      this.controller = null;
      this.speaking = false;
      options.onState?.('idle');
    }
  }

  stop(): void {
    this.controller?.abort();
    this.controller = null;
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        // 已经结束
      }
      source.disconnect();
    }
    this.sources = [];
    this.speaking = false;
  }

  dispose(): void {
    this.stop();
    if (this.context) {
      void this.context.close().catch(() => {});
      this.context = null;
    }
  }
}
