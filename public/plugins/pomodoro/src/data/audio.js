/**
 * 白噪音 / 阶段提示音（WebAudio 实时合成，不联网）。
 * 纯 JS 模块，不依赖 React；AudioContext 在首次用户手势后创建/恢复。
 */

const FADE_IN_SEC = 0.3;
const FADE_OUT_SEC = 0.25;

const NOISE_KINDS = [
  { id: 'none', label: '无' },
  { id: 'rain', label: '雨声' },
  { id: 'cafe', label: '咖啡厅' },
  { id: 'fan', label: '风扇' },
];

export { NOISE_KINDS };

const state = {
  ctx: null,
  gain: null,
  nodes: [],
  kind: 'none',
};

function ensureContext() {
  try {
    if (!state.ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      state.ctx = new Ctor();
    }
    if (state.ctx.state === 'suspended') state.ctx.resume().catch(() => {});
    return state.ctx;
  } catch {
    return null;
  }
}

/** 用户手势里调用，解锁 AudioContext（自动开始下一阶段时也尽量可用） */
export function unlockAudio() {
  ensureContext();
}

function buildNoiseBuffer(ctx, kind) {
  const length = Math.floor(ctx.sampleRate * 2);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === 'cafe') {
      last = (last + 0.02 * white) / 1.02;
      data[index] = last * 3.5;
    } else if (kind === 'fan') {
      last = (last + 0.08 * white) / 1.08;
      data[index] = last * 2.5;
    } else {
      data[index] = white;
    }
  }
  return buffer;
}

function stopNodes(immediate = false) {
  if (!state.gain || !state.ctx) return;
  const ctx = state.ctx;
  const gain = state.gain;
  const nodes = state.nodes;
  const fade = immediate ? 0.02 : FADE_OUT_SEC;
  try {
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
    gain.gain.linearRampToValueAtTime(0.0001, now + fade);
  } catch {
    /* ignore */
  }
  state.gain = null;
  state.nodes = [];
  state.kind = 'none';
  window.setTimeout(
    () => {
      for (const node of nodes) {
        try {
          node.stop?.();
          node.disconnect?.();
        } catch {
          /* ignore */
        }
      }
    },
    immediate ? 60 : FADE_OUT_SEC * 1000 + 80,
  );
}

export function startWhiteNoise(kind, volume) {
  if (kind === 'none') return;
  const ctx = ensureContext();
  if (!ctx) return;
  stopNodes(true);
  try {
    const source = ctx.createBufferSource();
    source.buffer = buildNoiseBuffer(ctx, kind);
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    let tail = source;
    if (kind === 'rain') {
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 900;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 7200;
      source.connect(highpass);
      highpass.connect(lowpass);
      tail = lowpass;
    } else if (kind === 'cafe') {
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 520;
      band.Q.value = 0.6;
      source.connect(band);
      tail = band;
    } else if (kind === 'fan') {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 520;
      source.connect(lowpass);
      tail = lowpass;
    }
    tail.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime((volume / 100) * 0.25, now + FADE_IN_SEC);
    source.start();
    state.nodes = [source];
    state.gain = gain;
    state.kind = kind;
  } catch {
    stopNodes(true);
  }
}

export function stopWhiteNoise() {
  stopNodes(false);
}

export function setWhiteNoiseVolume(volume) {
  if (!state.gain || !state.ctx) return;
  try {
    const now = state.ctx.currentTime;
    state.gain.gain.cancelScheduledValues(now);
    state.gain.gain.setTargetAtTime((volume / 100) * 0.25, now, 0.12);
  } catch {
    /* ignore */
  }
}

/** 阶段结束提示音：两个短音（默认开） */
export function playChime() {
  const ctx = ensureContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const notes = [
      { frequency: 880, offset: 0 },
      { frequency: 1174.66, offset: 0.16 },
    ];
    for (const note of notes) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = note.frequency;
      const start = now + note.offset;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.55);
    }
  } catch {
    /* ignore */
  }
}
