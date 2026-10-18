/**
 * 番茄钟插件
 *
 * 规格：docs/components/pomodoro.md
 * - 四种尺寸：1×1 环形进度 / 2×1 时间 + 按钮 / 2×2 + 任务 + 白噪音 / 3×2 + 今日统计 + 设置
 * - 开始 / 暂停 / 继续 / 跳过 / 重置；阶段自动流转（长休前 N 轮可配）
 * - 25 / 5 / 15 分钟与全部 Settings 可配；白噪音使用 WebAudio 实时合成（不联网）
 * - 沉浸模式；plugin.setKeepAwake 专注时阻止息屏；阶段结束 notify + 提示音
 * - Session 写 pomodoro.sessions，今日统计与 Agent 工具共用同一份数据
 */
import { plugin } from '/plugin-sdk.js';

/* ------------------------------------------------------------------ */
/* 常量                                                                */
/* ------------------------------------------------------------------ */

const SUPPORTED_SIZES = [
  [1, 1],
  [2, 1],
  [2, 2],
  [3, 2],
];
const DEFAULT_SIZE = [2, 1];

const SETTINGS_KEY = 'pomodoro.settings';
const SESSIONS_KEY = 'pomodoro.sessions';
const RUNTIME_KEY = 'pomodoro.runtime';

const PHASES = {
  focus: { label: '专注', minutesKey: 'focusMin' },
  shortBreak: { label: '短休', minutesKey: 'shortBreakMin' },
  longBreak: { label: '长休', minutesKey: 'longBreakMin' },
};

const DEFAULT_SETTINGS = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  roundsBeforeLongBreak: 4,
  autoStartNext: false,
  sound: true,
  keepAwake: true,
  whiteNoise: 'none',
  whiteNoiseVolume: 40,
};

const NOISE_KINDS = [
  { id: 'none', label: '无' },
  { id: 'rain', label: '雨声' },
  { id: 'cafe', label: '咖啡厅' },
  { id: 'fan', label: '风扇' },
];
const NOISE_BY_ID = new Map(NOISE_KINDS.map((kind) => [kind.id, kind]));

const ICON_PLAY =
  'M17.22 8.69a1.5 1.5 0 0 1 0 2.62l-10 5.5A1.5 1.5 0 0 1 5 15.5v-11A1.5 1.5 0 0 1 7.22 3.2zm-.48 1.75a.5.5 0 0 0 0-.88l-10-5.5A.5.5 0 0 0 6 4.5v11c0 .38.4.62.74.44z';
const ICON_PAUSE =
  'M5 2a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM4 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm9-2a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z';

const RING_CIRCUMFERENCE = 2 * Math.PI * 45;
const TICK_MS = 250;
const PERSIST_TICK_MS = 5000;

const THEME_ALIASES = {
  background: '--colorNeutralBackground1',
  foreground: '--colorNeutralForeground1',
  muted: '--colorNeutralForeground3',
  accent: '--colorBrandForeground1',
};

/* ------------------------------------------------------------------ */
/* DOM                                                                 */
/* ------------------------------------------------------------------ */

const $ = (id) => document.getElementById(id);
const els = {
  phaseLabel: $('phase-label'),
  timeMain: $('time-main'),
  timePlain: $('time-plain'),
  phaseChip: $('phase-chip'),
  phaseLine: $('phase-line'),
  taskLine: $('task-line'),
  stats: $('stats'),
  rounds: $('rounds'),
  ringProgress: $('ring-progress'),
  toggleBtn: $('toggle-btn'),
  toggleIcon: $('toggle-icon'),
  skipBtn: $('skip-btn'),
  resetBtn: $('reset-btn'),
  visual: $('visual'),
  plain: document.querySelector('.plain'),
  noiseBtn: $('noise-btn'),
  noiseLabel: $('noise-label'),
  volumeSlider: $('volume-slider'),
  settingsBtn: $('settings-btn'),
  immersive: $('immersive'),
  immersivePhase: $('immersive-phase'),
  immersiveTime: $('immersive-time'),
  immersiveTask: $('immersive-task'),
  immersiveToggle: $('immersive-toggle'),
  immersiveStop: $('immersive-stop'),
  immersiveClose: $('immersive-close'),
  immersiveStats: $('immersive-stats'),
  scrim: $('scrim'),
  settingsSheet: $('settings-sheet'),
  settingsClose: $('settings-close'),
  setFocus: $('set-focus'),
  setShort: $('set-short'),
  setLong: $('set-long'),
  setRounds: $('set-rounds'),
  setAuto: $('set-auto'),
  setSound: $('set-sound'),
  setKeepAwake: $('set-keepawake'),
  noiseOptions: $('noise-options'),
  volumeValue: $('volume-value'),
  setVolume: $('set-volume'),
};

/* ------------------------------------------------------------------ */
/* 基础工具                                                            */
/* ------------------------------------------------------------------ */

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 存储不可用时保持内存态 */
  }
}

const pad2 = (n) => String(n).padStart(2, '0');

function motionMs(name, fallback = 200) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^([\d.]+)ms$/.exec(raw);
  return match ? Number(match[1]) : fallback;
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/* ------------------------------------------------------------------ */
/* 数据加载                                                            */
/* ------------------------------------------------------------------ */

function loadSettings() {
  const stored = readJSON(SETTINGS_KEY, null);
  const settings = { ...DEFAULT_SETTINGS, ...(stored && typeof stored === 'object' ? stored : {}) };
  for (const key of ['focusMin', 'shortBreakMin', 'longBreakMin', 'roundsBeforeLongBreak']) {
    settings[key] = normalizeMinutes(settings[key], DEFAULT_SETTINGS[key]);
  }
  settings.whiteNoiseVolume = clamp(Math.round(Number(settings.whiteNoiseVolume) || DEFAULT_SETTINGS.whiteNoiseVolume), 0, 100);
  if (!NOISE_BY_ID.has(settings.whiteNoise)) settings.whiteNoise = 'none';
  return settings;
}

function normalizeMinutes(value, fallback) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return number;
}

function loadSessions() {
  const stored = readJSON(SESSIONS_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored.filter(
    (session) =>
      session &&
      typeof session.id === 'string' &&
      PHASES[session.phase] &&
      typeof session.startedAt === 'string' &&
      Number.isFinite(Number(session.durationMin)),
  );
}

function saveSessions() {
  writeJSON(SESSIONS_KEY, state.sessions);
}

const state = {
  settings: loadSettings(),
  sessions: loadSessions(),
  runtime: null,
  size: resolveSize(),
  sizeFromUrl: sizeFromUrl(),
  sheetOpen: false,
  immersiveOpen: false,
  keepAwakeOn: false,
  lastNoiseKind: 'rain',
  lastPersistAt: 0,
};

/* ------------------------------------------------------------------ */
/* 运行时状态                                                          */
/* ------------------------------------------------------------------ */

function minutesFor(phase) {
  const settings = state.settings;
  const key = PHASES[phase]?.minutesKey ?? 'focusMin';
  return normalizeMinutes(settings[key], DEFAULT_SETTINGS[key]);
}

function idleRuntime(phase = 'focus') {
  const minutes = minutesFor(phase);
  return {
    phase,
    running: false,
    totalMs: minutes * 60000,
    remainingMs: minutes * 60000,
    endsAt: 0,
    segmentStartedAt: 0,
    focusRound: 0,
    taskId: null,
    taskTitle: null,
    session: null,
  };
}

function createSession(phase, minutes, task = {}) {
  return {
    id: `ps-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    startedAt: new Date().toISOString(),
    phase,
    durationMin: minutes,
    actualMs: 0,
    taskId: task.taskId ?? null,
    taskTitle: task.taskTitle ?? null,
  };
}

function remainingMs() {
  const runtime = state.runtime;
  if (!runtime) return 0;
  if (runtime.running) return Math.max(0, runtime.endsAt - Date.now());
  return Math.max(0, runtime.remainingMs);
}

function persistRuntime() {
  state.lastPersistAt = Date.now();
  writeJSON(RUNTIME_KEY, state.runtime);
}

/** 启动时从 pomodoro.runtime 恢复；已过期的按“完成”落库（docs 要求） */
function restoreRuntime() {
  const stored = readJSON(RUNTIME_KEY, null);
  if (!stored || !PHASES[stored.phase]) {
    state.runtime = idleRuntime();
    return;
  }
  const phase = stored.phase;
  const totalMs = Number(stored.totalMs) > 0 ? Number(stored.totalMs) : minutesFor(phase) * 60000;
  const session = stored.session && typeof stored.session === 'object' ? stored.session : null;
  state.runtime = {
    phase,
    running: Boolean(stored.running),
    totalMs,
    remainingMs: Number(stored.remainingMs) > 0 ? Number(stored.remainingMs) : totalMs,
    endsAt: Number(stored.endsAt) || 0,
    segmentStartedAt: Number(stored.segmentStartedAt) || 0,
    focusRound: Number(stored.focusRound) || 0,
    taskId: stored.taskId ?? null,
    taskTitle: stored.taskTitle ?? null,
    session: session ? { ...session, actualMs: Number(session.actualMs) || 0 } : null,
  };
  document.documentElement.dataset.phase = phase;

  const runtime = state.runtime;
  if (!runtime.session) return;

  if (runtime.running) {
    const now = Date.now();
    if (runtime.endsAt > 0 && runtime.endsAt <= now) {
      // 离开期间这一轮已经结束：按完成落库，再进入下一阶段（不自动开跑）
      const elapsed = Math.max(0, runtime.endsAt - runtime.segmentStartedAt);
      runtime.session.actualMs += elapsed;
      runtime.running = false;
      runtime.segmentStartedAt = 0;
      runtime.remainingMs = 0;
      completePhase({ skipAutoStart: true, recovered: true });
      return;
    }
    // 仍在进行：把离开期间的 segment 计入 session.actualMs，保持 endsAt 绝对时间
    const segmentElapsed = runtime.segmentStartedAt ? Math.max(0, now - runtime.segmentStartedAt) : 0;
    runtime.session.actualMs += segmentElapsed;
    runtime.segmentStartedAt = now;
    runtime.remainingMs = Math.max(0, runtime.endsAt - now);
  } else if (runtime.remainingMs <= 0) {
    runtime.remainingMs = runtime.totalMs;
  }
}

/* ------------------------------------------------------------------ */
/* 会话统计                                                            */
/* ------------------------------------------------------------------ */

function finalizeSession(session, completed, actualMs) {
  if (session.phase !== 'focus' || actualMs < 1000) return null;
  const record = {
    id: session.id,
    startedAt: session.startedAt,
    endedAt: new Date().toISOString(),
    phase: 'focus',
    durationMin: session.durationMin,
    actualMin: Math.max(0, Math.round(actualMs / 60000)),
    completed: Boolean(completed),
    taskId: session.taskId ?? undefined,
  };
  state.sessions.push(record);
  saveSessions();
  return record;
}

/** 结束当前 session；返回本次落库记录（若有） */
function finalizeCurrent(completed, record = true) {
  const runtime = state.runtime;
  const session = runtime.session;
  if (!session) return null;
  const now = Date.now();
  const segment = runtime.running && runtime.segmentStartedAt ? Math.max(0, now - runtime.segmentStartedAt) : 0;
  const actualMs = session.actualMs + segment;
  runtime.session = null;
  runtime.segmentStartedAt = 0;
  if (!record) return null;
  return finalizeSession(session, completed, actualMs);
}

function sessionsInRange(range) {
  const now = new Date();
  const todayStart = startOfLocalDay(now);
  let start = todayStart;
  if (range === 'week') start = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() - 6);
  else if (range === 'month') start = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  return state.sessions.filter((session) => {
    if (session.phase !== 'focus' || !session.endedAt) return false;
    const endedAt = new Date(session.endedAt);
    return !Number.isNaN(endedAt.getTime()) && endedAt >= start;
  });
}

function statsForRange(range = 'today') {
  const sessions = sessionsInRange(range);
  const completed = sessions.filter((session) => session.completed).length;
  const focusMinutes = sessions.reduce((sum, session) => sum + (Number(session.actualMin) || 0), 0);
  return { range, completed, focusMinutes };
}

function streakDays() {
  const days = new Set(
    state.sessions
      .filter((session) => session.phase === 'focus' && session.completed && session.endedAt)
      .map((session) => dateKey(new Date(session.endedAt)))
      .filter(Boolean),
  );
  const cursor = startOfLocalDay(new Date());
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/* ------------------------------------------------------------------ */
/* 白噪音 / 提示音（WebAudio 合成，不联网）                             */
/* ------------------------------------------------------------------ */

const audio = {
  ctx: null,
  nodes: [],
  gain: null,
  activeKind: 'none',
};

function ensureAudio() {
  try {
    if (!audio.ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      audio.ctx = new Ctor();
    }
    if (audio.ctx.state === 'suspended') audio.ctx.resume().catch(() => {});
    return audio.ctx;
  } catch {
    return null;
  }
}

function buildNoiseBuffer(ctx, kind) {
  const length = Math.floor(ctx.sampleRate * 2);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === 'cafe') {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else if (kind === 'fan') {
      last = (last + 0.08 * white) / 1.08;
      data[i] = last * 2.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

function stopNoiseNodes(immediate = false) {
  if (!audio.gain || !audio.ctx) return;
  const ctx = audio.ctx;
  const fadeSec = motionMs('--durationSlow') / 1000;
  const gain = audio.gain;
  const nodes = audio.nodes;
  try {
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
    gain.gain.linearRampToValueAtTime(0.0001, now + (immediate ? 0.02 : fadeSec));
  } catch {
    /* ignore */
  }
  audio.gain = null;
  audio.nodes = [];
  audio.activeKind = 'none';
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
    immediate ? 50 : fadeSec * 1000 + 80,
  );
}

function startNoise(kind, volume) {
  if (kind === 'none' || !NOISE_BY_ID.has(kind)) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  stopNoiseNodes(true);
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
    const target = (volume / 100) * 0.25;
    const now = ctx.currentTime;
    const fadeSec = motionMs('--durationSlow') / 1000;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(target, now + fadeSec);
    source.start();
    audio.nodes = [source];
    audio.gain = gain;
    audio.activeKind = kind;
  } catch {
    stopNoiseNodes(true);
  }
}

function stopNoise() {
  stopNoiseNodes(false);
}

function setNoiseVolume(volume) {
  if (!audio.gain || !audio.ctx) return;
  try {
    const now = audio.ctx.currentTime;
    audio.gain.gain.cancelScheduledValues(now);
    audio.gain.gain.setTargetAtTime((volume / 100) * 0.25, now, 0.12);
  } catch {
    /* ignore */
  }
}

function playChime() {
  if (!state.settings.sound) return;
  const ctx = ensureAudio();
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

/* ------------------------------------------------------------------ */
/* 状态流转                                                            */
/* ------------------------------------------------------------------ */

function syncKeepAwake() {
  const runtime = state.runtime;
  const wanted = Boolean(state.settings.keepAwake && runtime.running && runtime.phase === 'focus');
  if (wanted === state.keepAwakeOn) return;
  state.keepAwakeOn = wanted;
  plugin.setKeepAwake(wanted);
}

function notifyPhase(text) {
  if (!text) return;
  plugin.notify(text);
}

function beginPhase() {
  const runtime = state.runtime;
  if (!runtime.session) {
    runtime.session = createSession(runtime.phase, Math.round(runtime.totalMs / 60000), {
      taskId: runtime.taskId,
      taskTitle: runtime.taskTitle,
    });
  }
  if (!runtime.running) {
    const now = Date.now();
    runtime.running = true;
    runtime.segmentStartedAt = now;
    runtime.endsAt = now + Math.max(0, runtime.remainingMs);
  }
  if (state.settings.whiteNoise !== 'none') {
    state.lastNoiseKind = state.settings.whiteNoise;
    startNoise(state.settings.whiteNoise, state.settings.whiteNoiseVolume);
  }
  syncKeepAwake();
  persistRuntime();
  render();
}

function pausePhase() {
  const runtime = state.runtime;
  if (!runtime.running) return;
  const now = Date.now();
  runtime.remainingMs = Math.max(0, runtime.endsAt - now);
  if (runtime.session && runtime.segmentStartedAt) {
    runtime.session.actualMs += Math.max(0, now - runtime.segmentStartedAt);
  }
  runtime.running = false;
  runtime.endsAt = 0;
  runtime.segmentStartedAt = 0;
  stopNoise();
  syncKeepAwake();
  persistRuntime();
  render();
}

function toggleTimer() {
  const runtime = state.runtime;
  if (runtime.running) {
    pausePhase();
  } else if (runtime.remainingMs <= 0) {
    completePhase();
  } else {
    beginPhase();
  }
}

function setPhaseReady(phase, options = {}) {
  const runtime = state.runtime;
  const minutes = minutesFor(phase);
  runtime.phase = phase;
  runtime.totalMs = minutes * 60000;
  runtime.remainingMs = runtime.totalMs;
  runtime.running = false;
  runtime.endsAt = 0;
  runtime.segmentStartedAt = 0;
  runtime.session = null;
  runtime.taskId = options.taskId ?? null;
  runtime.taskTitle = options.taskTitle ?? null;
  document.documentElement.dataset.phase = phase;
  stopNoise();
  syncKeepAwake();
  persistRuntime();
  render();
  if (options.autoStart) beginPhase();
}

function completePhase(options = {}) {
  const runtime = state.runtime;
  const phase = runtime.phase;
  stopNoise();
  const record = finalizeCurrent(true, true);

  let next = 'focus';
  if (phase === 'focus') {
    runtime.focusRound += 1;
    if (runtime.focusRound >= state.settings.roundsBeforeLongBreak) {
      next = 'longBreak';
      runtime.focusRound = 0;
    } else {
      next = 'shortBreak';
    }
  } else {
    if (phase === 'longBreak') runtime.focusRound = 0;
    next = 'focus';
  }

  const nextMinutes = minutesFor(next);
  notifyPhase(
    phase === 'focus'
      ? `专注完成，${PHASES[next].label} ${nextMinutes} 分钟`
      : `${PHASES[phase].label}结束，开始专注 ${nextMinutes} 分钟`,
  );
  playChime();
  setPhaseReady(next, { autoStart: !options.skipAutoStart && state.settings.autoStartNext });
  return record;
}

function skipPhase() {
  const runtime = state.runtime;
  const phase = runtime.phase;
  stopNoise();
  finalizeCurrent(false, true);
  let next = 'focus';
  if (phase === 'focus') {
    next = 'shortBreak';
    notifyPhase('已跳过专注，进入短休');
  } else {
    next = 'focus';
    if (phase === 'longBreak') runtime.focusRound = 0;
    notifyPhase('已跳过休息，回到专注');
  }
  setPhaseReady(next, { autoStart: state.settings.autoStartNext });
}

function stopTimer() {
  stopNoise();
  const record = finalizeCurrent(false, true);
  const phase = state.runtime.phase;
  notifyPhase('已停止本轮');
  setPhaseReady(phase);
  return record;
}

function resetTimer() {
  stopNoise();
  finalizeCurrent(false, true);
  state.runtime.focusRound = 0;
  notifyPhase('已重置番茄钟');
  setPhaseReady('focus');
}

/* ------------------------------------------------------------------ */
/* 渲染                                                                */
/* ------------------------------------------------------------------ */

function formatDuration(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

function phaseStatusText() {
  const runtime = state.runtime;
  if (runtime.running) return '进行中';
  if (runtime.session && runtime.remainingMs < runtime.totalMs) return '已暂停';
  return '待开始';
}

function todayLine() {
  const today = statsForRange('today');
  return `今日 ${today.completed} 个 · ${today.focusMinutes} 分钟`;
}

function taskText() {
  const session = state.runtime.session;
  if (!session) return '未关联任务';
  if (session.taskTitle) return session.taskTitle;
  if (session.taskId) return `任务 ${session.taskId}`;
  return '未关联任务';
}

function syncSlider(input, value) {
  if (document.activeElement === input) return;
  const next = String(value);
  if (input.value !== next) input.value = next;
}

function renderRounds() {
  const count = state.settings.roundsBeforeLongBreak;
  const done = state.runtime.focusRound;
  const signature = `${count}:${done}`;
  if (els.rounds.dataset.signature === signature) return;
  els.rounds.dataset.signature = signature;
  els.rounds.textContent = '';
  for (let index = 0; index < count; index += 1) {
    const dot = document.createElement('span');
    dot.className = 'round-dot' + (index < done ? ' is-done' : '');
    els.rounds.append(dot);
  }
}

function render() {
  const runtime = state.runtime;
  if (!runtime) return;
  const phase = runtime.phase;
  document.documentElement.dataset.phase = phase;
  const remaining = remainingMs();
  const text = formatDuration(remaining);

  els.timeMain.textContent = text;
  els.timePlain.textContent = text;
  els.immersiveTime.textContent = text;

  const phaseLabel = PHASES[phase].label;
  els.phaseLabel.textContent = phaseLabel;
  els.phaseChip.textContent = phaseLabel;
  els.immersivePhase.textContent = phaseLabel;
  els.phaseLine.textContent = `${phaseLabel} · ${Math.round(runtime.totalMs / 60000)} 分钟 · ${phaseStatusText()}`;

  const ratio = runtime.totalMs > 0 ? clamp(remaining / runtime.totalMs, 0, 1) : 0;
  els.ringProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE * ratio);
  els.ringProgress.style.opacity = ratio >= 0.999 ? '0' : '1';

  const running = runtime.running;
  els.toggleIcon.innerHTML = `<path fill="currentColor" d="${running ? ICON_PAUSE : ICON_PLAY}"/>`;
  const toggleLabel = running ? '暂停' : runtime.session && runtime.remainingMs < runtime.totalMs ? '继续' : '开始';
  els.toggleBtn.setAttribute('aria-label', toggleLabel);
  els.toggleBtn.title = `${toggleLabel}（点击时间区域进入沉浸模式）`;

  const task = taskText();
  els.taskLine.textContent = task;
  els.immersiveTask.textContent = task;

  const today = todayLine();
  els.stats.textContent = today;
  els.immersiveStats.textContent = today;
  els.immersiveToggle.textContent = running ? '暂停' : '继续';

  renderRounds();

  const noiseKind = state.settings.whiteNoise;
  const noiseLabel = NOISE_BY_ID.get(noiseKind)?.label ?? '无';
  els.noiseBtn.classList.toggle('is-on', noiseKind !== 'none');
  els.noiseLabel.textContent = noiseKind === 'none' ? '白噪音关' : `${noiseLabel} · ${state.settings.whiteNoiseVolume}%`;
  syncSlider(els.volumeSlider, state.settings.whiteNoiseVolume);
  if (state.sheetOpen) syncSlider(els.setVolume, state.settings.whiteNoiseVolume);
  els.immersive.classList.toggle('is-running', running);
}

/* ------------------------------------------------------------------ */
/* 沉浸模式                                                            */
/* ------------------------------------------------------------------ */

function openImmersive() {
  if (state.immersiveOpen) return;
  state.immersiveOpen = true;
  document.body.classList.add('immersive-open');
  els.immersive.hidden = false;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => els.immersive.classList.add('is-open'));
  });
  render();
  els.immersiveClose.focus({ preventScroll: true });
}

function closeImmersive() {
  if (!state.immersiveOpen) return;
  state.immersiveOpen = false;
  document.body.classList.remove('immersive-open');
  els.immersive.classList.remove('is-open');
  window.setTimeout(() => {
    if (!state.immersiveOpen) els.immersive.hidden = true;
  }, motionMs('--durationNormal') + 20);
}

/* ------------------------------------------------------------------ */
/* 设置面板                                                            */
/* ------------------------------------------------------------------ */

function buildNoiseOptions() {
  els.noiseOptions.textContent = '';
  for (const kind of NOISE_KINDS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'seg-btn';
    button.dataset.kind = kind.id;
    button.textContent = kind.label;
    button.setAttribute('aria-pressed', String(state.settings.whiteNoise === kind.id));
    button.addEventListener('click', () => setWhiteNoise(kind.id));
    els.noiseOptions.append(button);
  }
}

function syncSettingsControls() {
  const settings = state.settings;
  els.setFocus.value = String(settings.focusMin);
  els.setShort.value = String(settings.shortBreakMin);
  els.setLong.value = String(settings.longBreakMin);
  els.setRounds.value = String(settings.roundsBeforeLongBreak);
  els.setAuto.checked = settings.autoStartNext;
  els.setSound.checked = settings.sound;
  els.setKeepAwake.checked = settings.keepAwake;
  els.setVolume.value = String(settings.whiteNoiseVolume);
  els.volumeValue.textContent = String(settings.whiteNoiseVolume);
  for (const button of els.noiseOptions.querySelectorAll('.seg-btn')) {
    button.setAttribute('aria-pressed', String(button.dataset.kind === settings.whiteNoise));
  }
}

function saveSettings(patch, options = {}) {
  state.settings = { ...state.settings, ...patch };
  writeJSON(SETTINGS_KEY, state.settings);
  plugin.setConfig(SETTINGS_KEY, state.settings);
  syncSettingsControls();
  if (options.restartNoise && state.runtime.running) {
    if (state.settings.whiteNoise === 'none') stopNoise();
    else startNoise(state.settings.whiteNoise, state.settings.whiteNoiseVolume);
  }
  // 还没开始的阶段：时长改动立即生效；进行中/暂停的一轮不变
  const runtime = state.runtime;
  if (!runtime.running && !runtime.session) {
    const minutes = minutesFor(runtime.phase);
    runtime.totalMs = minutes * 60000;
    runtime.remainingMs = runtime.totalMs;
    persistRuntime();
  }
  render();
}

function setWhiteNoise(kind) {
  if (!NOISE_BY_ID.has(kind)) return;
  if (kind !== 'none') state.lastNoiseKind = kind;
  saveSettings({ whiteNoise: kind }, { restartNoise: true });
}

function openSettings() {
  if (state.sheetOpen) return;
  state.sheetOpen = true;
  document.body.classList.add('sheet-open');
  syncSettingsControls();
  els.scrim.hidden = false;
  els.settingsSheet.hidden = false;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.scrim.classList.add('is-open');
      els.settingsSheet.classList.add('is-open');
    });
  });
  els.settingsClose.focus({ preventScroll: true });
}

function closeSettings() {
  if (!state.sheetOpen) return;
  state.sheetOpen = false;
  document.body.classList.remove('sheet-open');
  els.scrim.classList.remove('is-open');
  els.settingsSheet.classList.remove('is-open');
  window.setTimeout(() => {
    if (state.sheetOpen) return;
    els.scrim.hidden = true;
    els.settingsSheet.hidden = true;
  }, motionMs('--durationNormal') + 20);
  els.settingsBtn.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ */
/* UI 事件                                                             */
/* ------------------------------------------------------------------ */

els.toggleBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  ensureAudio();
  toggleTimer();
});
els.skipBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  skipPhase();
});
els.resetBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  resetTimer();
});

for (const node of [els.visual, els.plain]) {
  node.addEventListener('click', () => openImmersive());
  node.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openImmersive();
    }
  });
}

els.immersiveToggle.addEventListener('click', () => {
  ensureAudio();
  toggleTimer();
});
els.immersiveStop.addEventListener('click', () => {
  stopTimer();
});
els.immersiveClose.addEventListener('click', closeImmersive);

els.noiseBtn.addEventListener('click', () => {
  ensureAudio();
  const next = state.settings.whiteNoise === 'none' ? state.lastNoiseKind : 'none';
  setWhiteNoise(next);
});
els.volumeSlider.addEventListener('input', () => {
  const volume = clamp(Math.round(Number(els.volumeSlider.value)), 0, 100);
  state.settings.whiteNoiseVolume = volume;
  writeJSON(SETTINGS_KEY, state.settings);
  plugin.setConfig(SETTINGS_KEY, state.settings);
  setNoiseVolume(volume);
  render();
});

els.settingsBtn.addEventListener('click', () => openSettings());
els.settingsClose.addEventListener('click', closeSettings);
els.scrim.addEventListener('click', closeSettings);

function wireNumberInput(input, key) {
  input.addEventListener('change', () => {
    const value = normalizeMinutes(input.value, state.settings[key]);
    saveSettings({ [key]: value });
  });
  input.addEventListener('blur', () => {
    const value = normalizeMinutes(input.value, state.settings[key]);
    input.value = String(value);
  });
}

wireNumberInput(els.setFocus, 'focusMin');
wireNumberInput(els.setShort, 'shortBreakMin');
wireNumberInput(els.setLong, 'longBreakMin');
wireNumberInput(els.setRounds, 'roundsBeforeLongBreak');

els.setAuto.addEventListener('change', () => saveSettings({ autoStartNext: els.setAuto.checked }));
els.setSound.addEventListener('change', () => saveSettings({ sound: els.setSound.checked }));
els.setKeepAwake.addEventListener('change', () => saveSettings({ keepAwake: els.setKeepAwake.checked }));
els.setVolume.addEventListener('input', () => {
  const volume = clamp(Math.round(Number(els.setVolume.value)), 0, 100);
  els.volumeValue.textContent = String(volume);
  state.settings.whiteNoiseVolume = volume;
  writeJSON(SETTINGS_KEY, state.settings);
  plugin.setConfig(SETTINGS_KEY, state.settings);
  setNoiseVolume(volume);
  render();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (state.sheetOpen) {
    event.preventDefault();
    closeSettings();
  } else if (state.immersiveOpen) {
    event.preventDefault();
    closeImmersive();
  } else {
    plugin.exitFocus();
  }
});

window.addEventListener('pagehide', () => {
  state.keepAwakeOn = false;
  plugin.setKeepAwake(false);
});

/* ------------------------------------------------------------------ */
/* Agent 工具                                                          */
/* ------------------------------------------------------------------ */

const TOOLS = [
  {
    name: 'pomodoro.start',
    description: '开始或继续一轮专注',
    parameters: {
      type: 'object',
      properties: {
        minutes: { type: 'number', description: '本轮专注分钟数，省略用设置里的 focusMin' },
        taskId: { type: 'string', description: '关联的待办任务 id' },
        taskTitle: { type: 'string', description: '关联任务标题（仅展示用）' },
      },
      additionalProperties: false,
    },
  },
  { name: 'pomodoro.pause', description: '暂停当前一轮', parameters: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'pomodoro.resume', description: '继续当前一轮', parameters: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'pomodoro.stop', description: '停止当前一轮并落库本次记录', parameters: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'pomodoro.skip', description: '跳过当前阶段', parameters: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'pomodoro.status', description: '读取阶段、剩余秒数、任务与今日统计', parameters: { type: 'object', properties: {}, additionalProperties: false } },
  {
    name: 'pomodoro.stats',
    description: '读取完成数、专注分钟与连续天数',
    parameters: {
      type: 'object',
      properties: { range: { type: 'string', enum: ['today', 'week', 'month'], description: '统计范围，默认 today' } },
      additionalProperties: false,
    },
  },
];

function currentStatus() {
  const runtime = state.runtime;
  const today = statsForRange('today');
  return {
    phase: runtime.phase,
    phaseLabel: PHASES[runtime.phase].label,
    running: runtime.running,
    remainingSec: Math.ceil(remainingMs() / 1000),
    totalSec: Math.round(runtime.totalMs / 1000),
    roundsDone: runtime.focusRound,
    roundsBeforeLongBreak: state.settings.roundsBeforeLongBreak,
    taskId: runtime.session?.taskId ?? null,
    taskTitle: runtime.session?.taskTitle ?? null,
    whiteNoise: state.settings.whiteNoise,
    today,
  };
}

function toolStart(args) {
  ensureAudio();
  const runtime = state.runtime;
  if (runtime.running) return currentStatus();
  const minutes = args?.minutes != null ? normalizeMinutes(args.minutes, 0) : 0;
  const taskId = typeof args?.taskId === 'string' ? args.taskId : null;
  const taskTitle = typeof args?.taskTitle === 'string' ? args.taskTitle : null;
  if (!runtime.session && runtime.phase === 'focus' && minutes > 0) {
    runtime.totalMs = minutes * 60000;
    runtime.remainingMs = runtime.totalMs;
  }
  if (!runtime.session) {
    runtime.taskId = taskId ?? runtime.taskId;
    runtime.taskTitle = taskTitle ?? runtime.taskTitle;
  }
  beginPhase();
  return currentStatus();
}

function toolStats(args) {
  const range = ['today', 'week', 'month'].includes(args?.range) ? args.range : 'today';
  const stats = statsForRange(range);
  return { ...stats, streakDays: streakDays() };
}

plugin.onToolCall((message) => {
  if (!message || typeof message.name !== 'string') return;
  const { id, name, args } = message;
  try {
    switch (name) {
      case 'pomodoro.start':
        plugin.toolResult(id, true, toolStart(args));
        break;
      case 'pomodoro.pause':
        pausePhase();
        plugin.toolResult(id, true, currentStatus());
        break;
      case 'pomodoro.resume':
        ensureAudio();
        beginPhase();
        plugin.toolResult(id, true, currentStatus());
        break;
      case 'pomodoro.stop':
        plugin.toolResult(id, true, { session: stopTimer(), status: currentStatus() });
        break;
      case 'pomodoro.skip':
        skipPhase();
        plugin.toolResult(id, true, currentStatus());
        break;
      case 'pomodoro.status':
        plugin.toolResult(id, true, currentStatus());
        break;
      case 'pomodoro.stats':
        plugin.toolResult(id, true, toolStats(args));
        break;
      default:
        plugin.toolResult(id, false, `未知工具：${name}`);
    }
  } catch (error) {
    plugin.toolResult(id, false, error instanceof Error ? error.message : String(error));
  }
});

/* ------------------------------------------------------------------ */
/* 尺寸 / 主题                                                         */
/* ------------------------------------------------------------------ */

function isSupported(size) {
  return SUPPORTED_SIZES.some(([w, h]) => w === size[0] && h === size[1]);
}

function pickSize(w, h) {
  if (isSupported([w, h])) return [w, h];
  const aspect = w / h;
  let best = SUPPORTED_SIZES[0];
  let bestDelta = Infinity;
  for (const candidate of SUPPORTED_SIZES) {
    const delta = Math.abs(candidate[0] / candidate[1] - aspect);
    if (delta < bestDelta) {
      best = candidate;
      bestDelta = delta;
    }
  }
  return best;
}

function sizeFromUrl() {
  const raw = new URLSearchParams(location.search).get('size');
  const match = /^(\d+)x(\d+)$/.exec(raw || '');
  if (!match) return null;
  return pickSize(Number(match[1]), Number(match[2]));
}

function resolveSize() {
  const fromUrl = sizeFromUrl();
  if (fromUrl) return fromUrl;
  const rect = document.documentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) return pickSize(rect.width, rect.height);
  return DEFAULT_SIZE;
}

function applySize(size) {
  state.size = size;
  document.documentElement.dataset.size = size[0] + 'x' + size[1];
}

function applyTheme(theme) {
  if (!theme || typeof theme !== 'object') return;
  const root = document.documentElement;
  if (theme.colorScheme === 'light' || theme.colorScheme === 'dark') root.dataset.scheme = theme.colorScheme;
  for (const [key, value] of Object.entries(theme)) {
    if (typeof value !== 'string') continue;
    let target = THEME_ALIASES[key];
    if (!target && /^(color|font|borderRadius|spacing|shadow|duration|curve|strokeWidth)/.test(key)) {
      target = `--${key}`;
    }
    if (target) root.style.setProperty(target, value);
  }
}

function applyInitConfig(config) {
  if (!config || typeof config !== 'object') return null;
  const direct = config[SETTINGS_KEY] ?? config.settings ?? config;
  if (!direct || typeof direct !== 'object') return null;
  const patch = {};
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (direct[key] !== undefined) patch[key] = direct[key];
  }
  return Object.keys(patch).length ? patch : null;
}

/* ------------------------------------------------------------------ */
/* 演示数据（仅独立打开时用 ?demo=1 注入）                              */
/* ------------------------------------------------------------------ */

function seedDemo() {
  if (readJSON(SESSIONS_KEY, null)) return;
  const now = new Date();
  const sessions = [];
  for (let index = 0; index < 3; index += 1) {
    const ended = new Date(now.getTime() - (index * 45 + 25) * 60000);
    const started = new Date(ended.getTime() - 25 * 60000);
    sessions.push({
      id: `demo-session-${index}`,
      startedAt: started.toISOString(),
      endedAt: ended.toISOString(),
      phase: 'focus',
      durationMin: 25,
      actualMin: 25,
      completed: true,
    });
  }
  state.sessions = sessions;
  saveSessions();

  const minutes = 25;
  const segmentStartedAt = Date.now() - 12 * 60000;
  state.runtime = {
    phase: 'focus',
    running: true,
    totalMs: minutes * 60000,
    remainingMs: 13 * 60000,
    endsAt: segmentStartedAt + minutes * 60000,
    segmentStartedAt,
    focusRound: 1,
    taskId: null,
    taskTitle: '写周报',
    session: {
      id: 'demo-session-current',
      startedAt: new Date(segmentStartedAt).toISOString(),
      phase: 'focus',
      durationMin: minutes,
      actualMs: 0,
      taskId: null,
      taskTitle: '写周报',
    },
  };
  writeJSON(RUNTIME_KEY, state.runtime);
  state.settings = { ...state.settings, whiteNoise: 'rain', whiteNoiseVolume: 40 };
  writeJSON(SETTINGS_KEY, state.settings);
}

/* ------------------------------------------------------------------ */
/* 启动 / 生命周期                                                     */
/* ------------------------------------------------------------------ */

let lastTickAt = 0;

function tick() {
  const runtime = state.runtime;
  if (!runtime?.running) return;
  const now = Date.now();
  if (runtime.endsAt > 0 && now >= runtime.endsAt) {
    completePhase();
    return;
  }
  if (now - lastTickAt >= TICK_MS) {
    lastTickAt = now;
    render();
  }
  if (now - state.lastPersistAt >= PERSIST_TICK_MS) persistRuntime();
}

function boot() {
  applySize(state.size);
  buildNoiseOptions();
  syncSettingsControls();
  document.documentElement.dataset.phase = state.runtime.phase;
  render();
  window.setInterval(tick, TICK_MS);
}

const urlParams = new URLSearchParams(location.search);
// ?demo=1 是给开发/截图用的显式开关（宿主不会带这个参数）
if (urlParams.get('demo') === '1') seedDemo();
restoreRuntime();

plugin.ready(TOOLS);

plugin.onInit((payload) => {
  if (payload?.theme) applyTheme(payload.theme);
  const patch = applyInitConfig(payload?.config);
  if (patch) {
    state.settings = { ...state.settings, ...patch };
    writeJSON(SETTINGS_KEY, state.settings);
    syncSettingsControls();
  }
  if (!patch && plugin.inHost) {
    plugin.getConfig(SETTINGS_KEY).then((stored) => {
      if (stored && typeof stored === 'object') {
        state.settings = { ...state.settings, ...stored };
        syncSettingsControls();
        render();
      }
    });
  }
  if (!state.sizeFromUrl && Array.isArray(payload?.size)) {
    applySize(pickSize(Number(payload.size[0]), Number(payload.size[1])));
  }
  render();
});

plugin.onResize((size) => {
  if (state.sizeFromUrl || !Array.isArray(size)) return;
  applySize(pickSize(Number(size[0]), Number(size[1])));
  render();
});

plugin.onTheme((theme) => applyTheme(theme));

plugin.onFocus(() => {
  const target = state.size[0] === 1 ? els.visual : els.toggleBtn;
  target.focus({ preventScroll: true });
});

window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  if (event.data?.type === 'host:open-settings') openSettings();
});

if (!plugin.inHost) {
  document.body.classList.add('is-standalone');
  boot();
  if (urlParams.get('immersive') === '1') openImmersive();
  else if (urlParams.get('settings') === '1') openSettings();
} else {
  boot();
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    tick();
    render();
  }
});
