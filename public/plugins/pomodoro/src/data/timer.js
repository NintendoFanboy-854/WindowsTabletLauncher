/**
 * 番茄钟数据层（纯 JS，不依赖 React）：
 * - 阶段状态机（专注 / 短休 / 长休）、计时、暂停/跳过/重置/停止
 * - Session 落库（localStorage: pomodoro.sessions / pomodoro.runtime，崩溃恢复）
 * - 今日/周/月统计、连续天数
 * - 白噪音、阶段提示音、keepAwake、阶段结束通知
 * - Agent 工具（status / stats / start ...）共用这里的函数
 *
 * 设置走宿主配置（plugin.getConfig/setConfig），设置浮层改完由卡片同步给引擎。
 */

import { plugin } from '/plugin-sdk.js';
import {
  NOISE_KINDS,
  playChime,
  setWhiteNoiseVolume,
  startWhiteNoise,
  stopWhiteNoise,
  unlockAudio,
} from './audio.js';

export const SETTINGS_KEY = 'settings';
export const SESSIONS_KEY = 'pomodoro.sessions';
export const RUNTIME_KEY = 'pomodoro.runtime';

const TICK_MS = 250;
const PERSIST_EVERY_MS = 5000;

export const PHASES = {
  focus: { label: '专注', minutesKey: 'focusMin' },
  shortBreak: { label: '短休', minutesKey: 'shortBreakMin' },
  longBreak: { label: '长休', minutesKey: 'longBreakMin' },
};

export const DEFAULT_SETTINGS = {
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

const NOISE_BY_ID = new Map(NOISE_KINDS.map((kind) => [kind.id, kind]));

const pad2 = (n) => String(n).padStart(2, '0');

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function normalizeMinutes(value, fallback) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return number;
}

export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const settings = { ...DEFAULT_SETTINGS, ...source };
  for (const key of ['focusMin', 'shortBreakMin', 'longBreakMin', 'roundsBeforeLongBreak']) {
    settings[key] = normalizeMinutes(settings[key], DEFAULT_SETTINGS[key]);
  }
  settings.autoStartNext = Boolean(settings.autoStartNext);
  settings.sound = Boolean(settings.sound);
  settings.keepAwake = Boolean(settings.keepAwake);
  settings.whiteNoiseVolume = Math.min(
    100,
    Math.max(0, Math.round(Number(settings.whiteNoiseVolume) || DEFAULT_SETTINGS.whiteNoiseVolume)),
  );
  if (!NOISE_BY_ID.has(settings.whiteNoise)) settings.whiteNoise = 'none';
  return settings;
}

export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function loadSessions() {
  const stored = readJson(SESSIONS_KEY, []);
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

function saveSessions(sessions) {
  writeJson(SESSIONS_KEY, sessions);
}

function newSession(phase, minutes) {
  return {
    id: `ps-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    startedAt: new Date().toISOString(),
    phase,
    durationMin: minutes,
    actualMs: 0,
    taskId: null,
    taskTitle: null,
  };
}

function idleRuntime(settings) {
  return {
    phase: 'focus',
    running: false,
    totalMs: settings.focusMin * 60000,
    remainingMs: settings.focusMin * 60000,
    endsAt: 0,
    segmentStartedAt: 0,
    focusRound: 0,
    session: null,
  };
}

export function statsForRange(sessions, range = 'today') {
  const now = new Date();
  const todayStart = startOfLocalDay(now);
  let start = todayStart;
  if (range === 'week') start = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() - 6);
  else if (range === 'month') start = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const focus = sessions.filter((session) => {
    if (session.phase !== 'focus' || !session.endedAt) return false;
    const endedAt = new Date(session.endedAt);
    return !Number.isNaN(endedAt.getTime()) && endedAt >= start;
  });
  return {
    range,
    completed: focus.filter((session) => session.completed).length,
    focusMinutes: focus.reduce((sum, session) => sum + (Number(session.actualMin) || 0), 0),
  };
}

export function streakDays(sessions) {
  const days = new Set(
    sessions
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
/* 引擎                                                                */
/* ------------------------------------------------------------------ */

class PomodoroEngine {
  constructor() {
    this.settings = normalizeSettings(null);
    this.sessions = loadSessions();
    this.runtime = this.#restoreRuntime();
    this.listeners = new Set();
    this.snapshot = null;
    this.ticker = 0;
    this.started = false;
    this.lastPersistAt = 0;
    this.lastKeepAwake = null;
    this.ticking = false;
    this.#refreshSnapshot();
  }

  /* ---------- 订阅（React useSyncExternalStore） ---------- */
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  startEngine() {
    if (this.started) return;
    this.started = true;
    this.ticker = window.setInterval(() => this.#tick(), TICK_MS);
    this.#emit();
  }

  stopEngine() {
    this.started = false;
    window.clearInterval(this.ticker);
    this.ticker = 0;
    this.#syncKeepAwake(false);
  }

  setSettings(next) {
    const settings = normalizeSettings(next);
    const previous = this.settings;
    this.settings = settings;
    const runtime = this.runtime;
    if (!runtime.running && !runtime.session) {
      const minutes = settings[PHASES[runtime.phase].minutesKey];
      runtime.totalMs = minutes * 60000;
      runtime.remainingMs = runtime.totalMs;
    }
    if (runtime.running && previous.whiteNoise !== settings.whiteNoise) {
      if (settings.whiteNoise === 'none') stopWhiteNoise();
      else startWhiteNoise(settings.whiteNoise, settings.whiteNoiseVolume);
    }
    if (previous.whiteNoiseVolume !== settings.whiteNoiseVolume) {
      setWhiteNoiseVolume(settings.whiteNoiseVolume);
    }
    this.#syncKeepAwake();
    this.#emit();
  }

  /* ---------- 查询 ---------- */
  remainingMs() {
    const runtime = this.runtime;
    if (runtime.running) return Math.max(0, runtime.endsAt - Date.now());
    return Math.max(0, runtime.remainingMs);
  }

  status() {
    const runtime = this.runtime;
    const today = statsForRange(this.sessions, 'today');
    return {
      phase: runtime.phase,
      phaseLabel: PHASES[runtime.phase].label,
      running: runtime.running,
      remainingSec: Math.ceil(this.remainingMs() / 1000),
      totalSec: Math.round(runtime.totalMs / 1000),
      roundsDone: runtime.focusRound,
      roundsBeforeLongBreak: this.settings.roundsBeforeLongBreak,
      taskId: runtime.session?.taskId ?? null,
      taskTitle: runtime.session?.taskTitle ?? null,
      whiteNoise: this.settings.whiteNoise,
      today,
    };
  }

  stats(range = 'today') {
    const stats = statsForRange(this.sessions, range);
    return { ...stats, streakDays: streakDays(this.sessions) };
  }

  /* ---------- 操作 ---------- */
  toggle() {
    unlockAudio();
    if (this.runtime.running) this.pause();
    else if (this.remainingMs() <= 0) this.#completePhase();
    else this.#begin();
  }

  start(options = {}) {
    unlockAudio();
    const runtime = this.runtime;
    if (runtime.running) return this.status();
    if (!runtime.session && runtime.phase === 'focus' && options.minutes) {
      const minutes = normalizeMinutes(options.minutes, this.settings.focusMin);
      runtime.totalMs = minutes * 60000;
      runtime.remainingMs = runtime.totalMs;
    }
    if (!runtime.session) {
      runtime.session = newSession(runtime.phase, Math.round(runtime.totalMs / 60000));
      runtime.session.taskId = options.taskId ?? null;
      runtime.session.taskTitle = options.taskTitle ?? null;
    }
    this.#begin();
    return this.status();
  }

  pause() {
    const runtime = this.runtime;
    if (!runtime.running) return;
    const now = Date.now();
    runtime.remainingMs = Math.max(0, runtime.endsAt - now);
    if (runtime.session && runtime.segmentStartedAt) {
      runtime.session.actualMs += Math.max(0, now - runtime.segmentStartedAt);
    }
    runtime.running = false;
    runtime.endsAt = 0;
    runtime.segmentStartedAt = 0;
    stopWhiteNoise();
    this.#syncKeepAwake();
    this.#persist();
    this.#emit();
  }

  skip() {
    const runtime = this.runtime;
    const phase = runtime.phase;
    stopWhiteNoise();
    this.#finalizeCurrent(false);
    let next = 'focus';
    if (phase === 'focus') {
      next = 'shortBreak';
      this.#notify('已跳过专注，进入短休');
    } else {
      next = 'focus';
      if (phase === 'longBreak') runtime.focusRound = 0;
      this.#notify('已跳过休息，回到专注');
    }
    this.#setPhaseReady(next, this.settings.autoStartNext);
  }

  reset() {
    stopWhiteNoise();
    this.#finalizeCurrent(false);
    this.runtime.focusRound = 0;
    this.#notify('已重置番茄钟');
    this.#setPhaseReady('focus', false);
  }

  stop() {
    stopWhiteNoise();
    const record = this.#finalizeCurrent(false);
    const phase = this.runtime.phase;
    this.#notify('已停止本轮');
    this.#setPhaseReady(phase, false);
    return record;
  }

  /* ---------- 内部 ---------- */
  #tick() {
    if (!this.runtime.running || this.ticking) return;
    this.ticking = true;
    try {
      const now = Date.now();
      if (this.runtime.endsAt > 0 && now >= this.runtime.endsAt) {
        this.#completePhase();
        return;
      }
      if (now - this.lastPersistAt >= PERSIST_EVERY_MS) this.#persist();
      this.#emit();
    } finally {
      this.ticking = false;
    }
  }

  #begin() {
    const runtime = this.runtime;
    if (!runtime.session) {
      runtime.session = newSession(runtime.phase, Math.round(runtime.totalMs / 60000));
    }
    const now = Date.now();
    runtime.running = true;
    runtime.segmentStartedAt = now;
    runtime.endsAt = now + Math.max(0, runtime.remainingMs);
    if (this.settings.whiteNoise !== 'none') {
      startWhiteNoise(this.settings.whiteNoise, this.settings.whiteNoiseVolume);
    }
    this.#syncKeepAwake();
    this.#persist();
    this.#emit();
  }

  #setPhaseReady(phase, autoStart) {
    const runtime = this.runtime;
    const minutes = this.settings[PHASES[phase].minutesKey];
    runtime.phase = phase;
    runtime.totalMs = minutes * 60000;
    runtime.remainingMs = runtime.totalMs;
    runtime.running = false;
    runtime.endsAt = 0;
    runtime.segmentStartedAt = 0;
    runtime.session = null;
    stopWhiteNoise();
    this.#syncKeepAwake();
    this.#persist();
    this.#emit();
    if (autoStart) this.#begin();
  }

  #completePhase() {
    const runtime = this.runtime;
    const phase = runtime.phase;
    stopWhiteNoise();
    this.#finalizeCurrent(true, true);
    let next = 'focus';
    if (phase === 'focus') {
      runtime.focusRound += 1;
      if (runtime.focusRound >= this.settings.roundsBeforeLongBreak) {
        next = 'longBreak';
        runtime.focusRound = 0;
      } else {
        next = 'shortBreak';
      }
    } else {
      if (phase === 'longBreak') runtime.focusRound = 0;
      next = 'focus';
    }
    const nextMinutes = this.settings[PHASES[next].minutesKey];
    this.#notify(
      phase === 'focus'
        ? `专注完成，${PHASES[next].label} ${nextMinutes} 分钟`
        : `${PHASES[phase].label}结束，开始专注 ${nextMinutes} 分钟`,
    );
    if (this.settings.sound) playChime();
    this.#setPhaseReady(next, this.settings.autoStartNext);
  }

  #finalizeCurrent(completed, record = true) {
    const runtime = this.runtime;
    const session = runtime.session;
    if (!session) return null;
    const now = Date.now();
    const segment =
      runtime.running && runtime.segmentStartedAt ? Math.max(0, now - runtime.segmentStartedAt) : 0;
    const actualMs = session.actualMs + segment;
    runtime.session = null;
    runtime.segmentStartedAt = 0;
    if (!record || session.phase !== 'focus' || actualMs < 1000) return null;
    const entry = {
      id: session.id,
      startedAt: session.startedAt,
      endedAt: new Date().toISOString(),
      phase: 'focus',
      durationMin: session.durationMin,
      actualMin: Math.max(0, Math.round(actualMs / 60000)),
      completed: Boolean(completed),
      taskId: session.taskId ?? undefined,
    };
    this.sessions.push(entry);
    saveSessions(this.sessions);
    return entry;
  }

  #restoreRuntime() {
    const stored = readJson(RUNTIME_KEY, null);
    if (!stored || !PHASES[stored.phase]) return idleRuntime(this.settings);
    const phase = stored.phase;
    const totalMs =
      Number(stored.totalMs) > 0
        ? Number(stored.totalMs)
        : this.settings[PHASES[phase].minutesKey] * 60000;
    const session = stored.session && typeof stored.session === 'object' ? stored.session : null;
    const runtime = {
      phase,
      running: Boolean(stored.running),
      totalMs,
      remainingMs: Number(stored.remainingMs) > 0 ? Number(stored.remainingMs) : totalMs,
      endsAt: Number(stored.endsAt) || 0,
      segmentStartedAt: Number(stored.segmentStartedAt) || 0,
      focusRound: Number(stored.focusRound) || 0,
      session: session ? { ...session, actualMs: Number(session.actualMs) || 0 } : null,
    };
    if (!runtime.session) return runtime;
    if (runtime.running) {
      const now = Date.now();
      if (runtime.endsAt > 0 && runtime.endsAt <= now) {
        const elapsed = Math.max(0, runtime.endsAt - runtime.segmentStartedAt);
        runtime.session.actualMs += elapsed;
        runtime.running = false;
        runtime.segmentStartedAt = 0;
        runtime.remainingMs = 0;
        this.runtime = runtime;
        this.#finalizeCurrent(true, true);
        const next = 'shortBreak';
        this.#setPhaseReady(next, false);
        return this.runtime;
      }
      const segmentElapsed = runtime.segmentStartedAt
        ? Math.max(0, now - runtime.segmentStartedAt)
        : 0;
      runtime.session.actualMs += segmentElapsed;
      runtime.segmentStartedAt = now;
      runtime.remainingMs = Math.max(0, runtime.endsAt - now);
    }
    return runtime;
  }

  #persist() {
    this.lastPersistAt = Date.now();
    const runtime = this.runtime;
    writeJson(RUNTIME_KEY, {
      phase: runtime.phase,
      running: runtime.running,
      totalMs: runtime.totalMs,
      remainingMs: runtime.remainingMs,
      endsAt: runtime.endsAt,
      segmentStartedAt: runtime.segmentStartedAt,
      focusRound: runtime.focusRound,
      session: runtime.session,
    });
  }

  #syncKeepAwake(force) {
    const runtime = this.runtime;
    const wanted =
      force === undefined
        ? Boolean(this.settings.keepAwake && runtime.running && runtime.phase === 'focus')
        : Boolean(force);
    if (wanted === this.lastKeepAwake) return;
    this.lastKeepAwake = wanted;
    Promise.resolve(plugin.setKeepAwake(wanted)).catch(() => {});
  }

  #notify(text) {
    if (!text) return;
    plugin.notify(text);
  }

  #refreshSnapshot() {
    const runtime = this.runtime;
    const remaining = this.remainingMs();
    const today = statsForRange(this.sessions, 'today');
    const session = runtime.session;
    this.snapshot = {
      phase: runtime.phase,
      phaseLabel: PHASES[runtime.phase].label,
      running: runtime.running,
      remainingMs: remaining,
      remainingText: formatDuration(remaining),
      totalMs: runtime.totalMs,
      progress: runtime.totalMs > 0 ? 1 - Math.min(1, remaining / runtime.totalMs) : 0,
      taskTitle: session?.taskTitle ?? (session?.taskId ? `任务 ${session.taskId}` : null),
      focusRound: runtime.focusRound,
      roundsBeforeLongBreak: this.settings.roundsBeforeLongBreak,
      whiteNoise: this.settings.whiteNoise,
      whiteNoiseVolume: this.settings.whiteNoiseVolume,
      sound: this.settings.sound,
      keepAwake: this.settings.keepAwake,
      today,
    };
  }

  #emit() {
    this.#refreshSnapshot();
    for (const listener of this.listeners) listener();
  }
}

let sharedEngine = null;
export function getEngine() {
  sharedEngine ??= new PomodoroEngine();
  return sharedEngine;
}

/* ------------------------------------------------------------------ */
/* 独立开发 / 截图：?demo=1 注入演示数据                                 */
/* ------------------------------------------------------------------ */

export async function seedDemoData() {
  const existing = readJson(SESSIONS_KEY, null);
  if (Array.isArray(existing) && existing.length) return;
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
  saveSessions(sessions);
  const segmentStartedAt = Date.now() - 12 * 60000;
  writeJson(RUNTIME_KEY, {
    phase: 'focus',
    running: true,
    totalMs: 25 * 60000,
    remainingMs: 13 * 60000,
    endsAt: segmentStartedAt + 25 * 60000,
    segmentStartedAt,
    focusRound: 1,
    session: {
      id: 'demo-session-current',
      startedAt: new Date(segmentStartedAt).toISOString(),
      phase: 'focus',
      durationMin: 25,
      actualMs: 0,
      taskId: null,
      taskTitle: '写周报',
    },
  });
}
