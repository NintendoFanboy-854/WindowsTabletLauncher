/**
 * 录音：MediaRecorder 采集 → 解码 → 重采样到 16kHz 单声道 → WAV（MiMo ASR 只收 wav/mp3）。
 */

export interface RecordedAudio {
  /** 16kHz 单声道 PCM16 WAV，可直接送 ASR */
  wav: Blob;
  durationSec: number;
}

const TARGET_SAMPLE_RATE = 16_000;

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

async function toWav16k(recorded: Blob): Promise<RecordedAudio> {
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
  return {
    wav: encodeWav(rendered.getChannelData(0), TARGET_SAMPLE_RATE),
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
    return toWav16k(blob);
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
