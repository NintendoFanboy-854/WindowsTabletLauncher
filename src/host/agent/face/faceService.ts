/**
 * 人脸注册与唤醒（@vladmandic/face-api / WASM+WebGL）。
 *
 * 模型权重从 npm 包里取（`tiny_face_detector` + `face_landmark_68_tiny` + `face_recognition`，
 * 共约 6.7MB），通过 Vite `?url` 引入，dev 与打包后都能加载；不请求 CDN。
 *
 * 识别策略（防误唤醒）：
 * - 低频率抽帧：每 500ms 检测一次（2fps）；
 * - 连续 2 帧与注册样本的最小欧氏距离都小于阈值才触发（约 1 秒内持续命中）；
 * - 触发后冷却 10 秒，避免讲话时反复唤醒。
 */

import tinyFaceDetectorUrl from '../models/tiny_face_detector_model.bin?url';
import faceLandmark68TinyUrl from '../models/face_landmark_68_tiny_model.bin?url';
import faceRecognitionUrl from '../models/face_recognition_model.bin?url';

type FaceApi = typeof import('@vladmandic/face-api');

export type FaceStatus = 'off' | 'loading' | 'ready' | 'error';

export interface FaceServiceState {
  status: FaceStatus;
  /** 状态说明 / 错误原因 */
  detail: string;
  watching: boolean;
}

export interface FaceWatchOptions {
  samples: number[][];
  threshold: number;
  onMatch: (distance: number) => void;
  signal: AbortSignal;
}

/** 抽帧间隔：2fps（低频率，兼顾响应与功耗） */
const DETECT_INTERVAL_MS = 500;
/** 连续命中帧数：2 帧 */
const CONSECUTIVE_HITS = 2;
/** 触发后的冷却时间 */
const COOLDOWN_MS = 10_000;
/** 检脸输入尺寸，face-api 默认 416；平板上前置摄像头用 224 足够且更快 */
const DETECT_INPUT_SIZE = 224;

function abortError(): DOMException {
  return new DOMException('已停止', 'AbortError');
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

async function loadWeights(url: string): Promise<Float32Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`人脸模型加载失败（HTTP ${response.status}）`);
  return new Float32Array(await response.arrayBuffer());
}

class FaceService {
  private state: FaceServiceState = { status: 'off', detail: '', watching: false };
  private listeners = new Set<(state: FaceServiceState) => void>();
  private api: FaceApi | null = null;
  private apiPromise: Promise<FaceApi> | null = null;
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private previewTarget: HTMLVideoElement | null = null;
  private watchToken = 0;

  getState(): FaceServiceState {
    return this.state;
  }

  subscribe(listener: (state: FaceServiceState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private setState(patch: Partial<FaceServiceState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener(this.state);
  }

  private async loadApi(): Promise<FaceApi> {
    if (this.api) return this.api;
    if (!this.apiPromise) {
      this.apiPromise = (async () => {
        this.setState({ status: 'loading', detail: '正在加载人脸模型（约 6.7MB）…' });
        const faceapi = await import('@vladmandic/face-api');
        const [detector, landmark, recognition] = await Promise.all([
          loadWeights(tinyFaceDetectorUrl),
          loadWeights(faceLandmark68TinyUrl),
          loadWeights(faceRecognitionUrl),
        ]);
        await faceapi.nets.tinyFaceDetector.load(detector);
        await faceapi.nets.faceLandmark68TinyNet.load(landmark);
        await faceapi.nets.faceRecognitionNet.load(recognition);
        this.api = faceapi;
        this.setState({ status: 'ready', detail: '' });
        return faceapi;
      })().catch((error: unknown) => {
        this.apiPromise = null;
        const message = error instanceof Error ? error.message : String(error);
        this.setState({ status: 'error', detail: `人脸模型加载失败：${message}` });
        throw error;
      });
    }
    return this.apiPromise;
  }

  private async ensureCamera(): Promise<HTMLVideoElement> {
    if (this.video && this.stream) return this.video;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('当前环境没有摄像头能力');
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    });
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.style.cssText =
      'position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none';
    video.srcObject = stream;
    document.body.appendChild(video);
    await video.play();
    this.stream = stream;
    this.video = video;
    this.setState({ detail: '' });
    return video;
  }

  /** 设置页里的人脸预览：复用同一个摄像头流 */
  async attachPreview(target: HTMLVideoElement): Promise<void> {
    try {
      const video = await this.ensureCamera();
      this.previewTarget = target;
      target.muted = true;
      target.playsInline = true;
      target.autoplay = true;
      target.srcObject = this.stream;
      await target.play().catch(() => {});
      await this.loadApi();
      this.setState({ status: 'ready', detail: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.previewTarget = null;
      this.setState({
        status: 'error',
        detail: `摄像头不可用：${message}`,
      });
      throw error;
    }
  }

  detachPreview(): void {
    if (this.previewTarget) {
      this.previewTarget.srcObject = null;
      this.previewTarget = null;
    }
    if (!this.state.watching) this.stopCamera();
  }

  /** 拍一张样本：返回 128 维特征向量（只存本地） */
  async captureDescriptor(): Promise<number[]> {
    const faceapi = await this.loadApi();
    const video = await this.ensureCamera();
    if (video.readyState < 2) {
      await new Promise<void>((resolve) => {
        const onReady = () => {
          video.removeEventListener('loadeddata', onReady);
          resolve();
        };
        video.addEventListener('loadeddata', onReady, { once: true });
      });
    }

    const result = await faceapi
      .detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: DETECT_INPUT_SIZE,
          scoreThreshold: 0.5,
        }),
      )
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!result) {
      throw new Error('没有检测到人脸：请正对摄像头、保持光线充足后再拍一次');
    }
    return Array.from(result.descriptor);
  }

  /** 抽帧识别循环；命中连续帧后回调 onMatch */
  async startWatch(options: FaceWatchOptions): Promise<void> {
    const token = ++this.watchToken;
    if (!options.samples.length) return;

    this.setState({ watching: true, detail: '正在准备摄像头…' });
    try {
      const faceapi = await this.loadApi();
      const video = await this.ensureCamera();
      if (token !== this.watchToken) return;
      this.setState({ watching: true, detail: '摄像头识别中' });
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: DETECT_INPUT_SIZE,
        scoreThreshold: 0.5,
      });

      let streak = 0;
      let cooldownUntil = 0;

      while (!options.signal.aborted && token === this.watchToken) {
        try {
          if (video.readyState >= 2) {
            const result = await faceapi
              .detectSingleFace(video, detectionOptions)
              .withFaceLandmarks(true)
              .withFaceDescriptor();
            if (result) {
              let best = Number.POSITIVE_INFINITY;
              for (const sample of options.samples) {
                best = Math.min(best, faceapi.euclideanDistance(result.descriptor, sample));
              }
              if (best < options.threshold) {
                streak += 1;
                if (streak >= CONSECUTIVE_HITS) {
                  streak = 0;
                  if (Date.now() > cooldownUntil) {
                    cooldownUntil = Date.now() + COOLDOWN_MS;
                    options.onMatch(best);
                  }
                }
              } else {
                streak = 0;
              }
            } else {
              streak = 0;
            }
          }
        } catch {
          // 单帧失败（人脸姿态、光线、模型预热）忽略，下一帧继续
        }
        await sleep(DETECT_INTERVAL_MS, options.signal);
      }
    } catch (error) {
      if (token !== this.watchToken) return;
      const message = error instanceof Error ? error.message : String(error);
      this.setState({
        status: 'error',
        detail: `人脸唤醒不可用：${message}`,
        watching: false,
      });
      return;
    } finally {
      if (token === this.watchToken) {
        this.setState({ watching: false });
        if (!this.previewTarget) this.stopCamera();
      }
    }
  }

  stopWatch(): void {
    this.watchToken += 1;
    if (this.state.watching) this.setState({ watching: false });
    if (!this.previewTarget) this.stopCamera();
  }

  stopCamera(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (this.video) {
      this.video.srcObject = null;
      this.video.remove();
      this.video = null;
    }
  }

  stopAll(): void {
    this.stopWatch();
    if (this.previewTarget) this.previewTarget.srcObject = null;
    this.previewTarget = null;
    this.stopCamera();
    this.setState({ watching: false });
  }
}

export const faceService = new FaceService();
