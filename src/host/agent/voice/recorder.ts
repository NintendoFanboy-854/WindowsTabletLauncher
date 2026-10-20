/**
 * 录音：MediaRecorder 采集 → 解码 → 重采样到 16kHz 单声道 → WAV。
 *
 * 产出 `{ wav, durationSec, peaks }`：
 * - `wav` 同时用于 MiMo 原生音频对话（input_audio）与 MiMo ASR；
 * - `peaks` 是 12–24 桶的 0..1 音量包络，只给 UI 画声纹（纯数字，可持久化）。
 *
 * 音频 Blob 由会话层用完即弃：不写 localStorage、不进 Message。
 */

export interface RecordedAudio {
  /** 16kHz 单声道 PCM16 WAV，可直接送 ASR / input_audio */
  wav: Blob;
  durationSec: number;
  /** 12–24 个 0..1 桶的包络（契约 §6：供用户语音气泡的声纹装饰） */
  peaks: number[];
}

const TARGET_SAMPLE_RATE = 16_000;
/** 声纹桶数：契约要求 12–24，取 24 让窄气泡也够细腻 */
const PEAK_BUCKETS = 24;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * 从 16kHz PCM 采样算 0..1 包络：每桶取 RMS，再按整段最大 RMS 归一。
 * 静音返回全 0；用平方根压缩让轻声也能看见（纯视觉数据，不影响音频本身）。
 */
export function computePeaks(samples: Float32Array, buckets = PEAK_BUCKETS): number[] {
  const count = Math.max(12, Math.min(24, Math.round(buckets)));
  const peaks = new Array<number>(count).fill(0);
  if (samples.length === 0) return peaks;

  const bucketSize = Math.max(1, Math.ceil(samples.length / count));
  let maxRms = 0;
  for (let bucket = 0; bucket < count; bucket += 1) {
    const start = bucket * bucketSize;
    const end = Math.min(samples.length, start + bucketSize);
    if (start >= end) continue;
    let sum = 0;
    for (let index = start; index < end; index += 1) {
      const value = samples[index];
      sum += value * value;
    }
    const rms = Math.sqrt(sum / (end - start));
    peaks[bucket] = rms;
    if (rms > maxRms) maxRms = rms;
  }

  if (maxRms <= 1e-6) return peaks.fill(0);
  for (let bucket = 0; bucket < count; bucket += 1) {
    const relative = Math.min(1, Math.max(0, peaks[bucket] / maxRms));
    peaks[bucket] = Math.round(Math.sqrt(relative) * 100) / 100;
  }
  return peaks;
}

async function toWav16k(recorded: Blob): Promise<Omit<RecordedAudio, 'peaks'>> {
  const arrayBuffer = await recorded.arrayBuffer();
  const decodeContext = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await decodeContext.decodeAudioData(arrayBuffer);
  } finally {
    void decodeContext.close();
  }

  const frames = Math.max(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, frames, TARGET_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  const samples = rendered.getChannelData(0);
  return {
    wav: encodeWav(samples, TARGET_SAMPLE_RATE),
    durationSec: rendered.duration,
  };
}

export class VoiceRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stopped: Promise<void> | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private levelData: Uint8Array<ArrayBuffer> | null = null;

  get isRecording(): boolean {
    return this.recorder?.state === 'recording';
  }

  async start(): Promise<void> {
    if (this.isRecording) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('当前环境不支持麦克风录音');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    this.stream = stream;

    // 录音电平：只接 analyser，不接扬声器，避免回授
    try {
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      this.audioContext = context;
      this.analyser = analyser;
      this.levelData = new Uint8Array(analyser.fftSize);
      if (context.state === 'suspended') void context.resume();
    } catch {
      // 电平可视化失败不影响录音
      this.audioContext = null;
      this.analyser = null;
    }

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    this.chunks = [];
    this.stopped = new Promise<void>((resolve) => {
      recorder.addEventListener('stop', () => resolve(), { once: true });
    });
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    });
    recorder.start();
    this.recorder = recorder;
  }

  /** 0–1 的录音电平 */
  readLevel(): number {
    if (!this.analyser || !this.levelData) return 0;
    this.analyser.getByteTimeDomainData(this.levelData);
    let sum = 0;
    for (let index = 0; index < this.levelData.length; index += 1) {
      const value = (this.levelData[index] - 128) / 128;
      sum += value * value;
    }
    return Math.min(1, Math.sqrt(sum / this.levelData.length) * 3.2);
  }

  async stop(): Promise<RecordedAudio> {
    const recorder = this.recorder;
    if (!recorder) throw new Error('没有正在进行的录音');
    if (recorder.state !== 'inactive') recorder.stop();
    await this.stopped;
    this.recorder = null;
    this.releaseAudioGraph();

    const blob = new Blob(this.chunks, { type: this.chunks[0]?.type || 'audio/webm' });
    this.chunks = [];
    this.stopStream();
    if (blob.size === 0) throw new Error('没有录到音频');
    const audio = await toWav16k(blob);
    const samples = await audio.wav.arrayBuffer();
    // 直接从 WAV 的 PCM 数据算包络：与送往 MiMo 的音频完全同源
    const pcm = new Int16Array(samples, 44);
    const floats = new Float32Array(pcm.length);
    for (let index = 0; index < pcm.length; index += 1) floats[index] = pcm[index] / 0x8000;
    return { ...audio, peaks: computePeaks(floats) };
  }

  cancel(): void {
    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        this.recorder.stop();
      } catch {
        // ignore
      }
    }
    this.recorder = null;
    this.chunks = [];
    this.releaseAudioGraph();
    this.stopStream();
  }

  private releaseAudioGraph(): void {
    this.analyser = null;
    this.levelData = null;
    if (this.audioContext) {
      void this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  private stopStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}
