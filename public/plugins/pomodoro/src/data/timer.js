/**
 * 番茄钟数据层（纯 JS，不依赖 React）。
 *
 * 单写者约定：计时状态机只在「卡片 iframe」里跑一份（桌面层常驻，切到设置/复盘
 * 时卡片 iframe 仍然挂载）。详情浮层（?view=detail）与卡片通过 localStorage
 * 同步：
 *   - pomodoro.runtime   运行时状态（阶段、endAt、剩余、当前任务、轮次）
 *   - pomodoro.sessions  已结束的专注记录
 *   - pomodoro.command   详情/工具发给引擎的一次性命令（start/pause/reset/...）
 * 详情只读 runtime/sessions 并写命令，不启动第二个计时器。
 *
 * 存储键与旧版一致（pomodoro.sessions / pomodoro.runtime），normalize 负责迁移。
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
export const COMMAND_KEY = 'pomodoro.command';
export const COMMAND_EVENT = 'pomodoro:command';

/** 计时刷新间隔：250ms 只用于界面秒数平滑，不写 localStorage */
const TICK_MS = 250;
/** 运行中每 5 秒把 runtime 落一次盘（崩溃恢复用；状态切换时立即落盘） */
const PERSIST_EVERY_MS = 5000;
/** 命令在 runtime.commandId 里去重，避免 storage 重放 */
const MAX_MINUTES = { focus: 180, break: 60, rounds: 12 };

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

const pad2 = (value) => String(value).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* 基础工具                                                            */
/* ------------------------------------------------------------------ */

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
    /* localStorage 不可用时退化为内存状态 */
  }
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function safeDate(value) {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function safeIso(value) {
  const date = safeDate(value);
  return date ? date.toISOString() : null;
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function localDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

/* ------------------------------------------------------------------ */
/* 设置                                                                */
/* ------------------------------------------------------------------ */

/**
 * 设置 normalize：宿主 schema 已校验，这里再做一次兜底；同时接受旧字段别名
 * （longBreakEvery / autoStartFocus / autoStartBreak / notify），旧配置不需要手动迁移。
 */
export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const settings = { ...DEFAULT_SETTINGS, ...source };

  if (source.roundsBeforeLongBreak === undefined && source.longBreakEvery !== undefined) {
    settings.roundsBeforeLongBreak = source.longBreakEvery;
  }
  if (source.autoStartNext === undefined) {
    if (source.autoStartFocus !== undefined) settings.autoStartNext = source.autoStartFocus;
    else if (source.autoStartBreak !== undefined) settings.autoStartNext = source.autoStartBreak;
  }
  if (source.sound === undefined && source.notify !== undefined) settings.sound = source.notify;

  settings.focusMin = clamp(settings.focusMin, 1, MAX_MINUTES.focus, DEFAULT_SETTINGS.focusMin);
  settings.shortBreakMin = clamp(
    settings.shortBreakMin,
    1,
    MAX_MINUTES.break,
    DEFAULT_SETTINGS.shortBreakMin,
  );
  settings.longBreakMin = clamp(
    settings.longBreakMin,
    1,
    MAX_MINUTES.break,
    DEFAULT_SETTINGS.longBreakMin,
  );
  settings.roundsBeforeLongBreak = clamp(
    settings.roundsBeforeLongBreak,
    1,
    MAX_MINUTES.rounds,
    DEFAULT_SETTINGS.roundsBeforeLongBreak,
  );
  settings.whiteNoiseVolume = clamp(
    settings.whiteNoiseVolume,
    0,
    100,
    DEFAULT_SETTINGS.whiteNoiseVolume,
  );
  settings.autoStartNext = Boolean(settings.autoStartNext);
  settings.sound = Boolean(settings.sound);
  settings.keepAwake = Boolean(settings.keepAwake);
  if (!NOISE_BY_ID.has(settings.whiteNoise)) settings.whiteNoise = DEFAULT_SETTINGS.whiteNoise;
  return settings;
}

function phaseMinutes(settings, phase) {
  return settings[PHASES[phase].minutesKey];
}

/* ------------------------------------------------------------------ */
/* Sessions / runtime 读取（详情与工具共用，纯读取）                     */
/* ------------------------------------------------------------------ */

function normalizeSessionList(raw) {
  if (!Array.isArray(raw)) return [];
  const sessions = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    if (!PHASES[item.phase]) continue;
    const startedAt = safeIso(item.startedAt);
    const durationMin = Number(item.durationMin);
    if (!startedAt || !Number.isFinite(durationMin) || durationMin <= 0) continue;
    const endedAt = safeIso(item.endedAt);
    sessions.push({
      id:
        typeof item.id === 'string' && item.id
          ? item.id
          : `ps-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      startedAt,
      ...(endedAt ? { endedAt } : {}),
      phase: item.phase,
      durationMin,
      actualMin: Math.max(0, Math.round(Number(item.actualMin) || 0)),
      completed: Boolean(item.completed),
      ...(typeof item.taskId === 'string' && item.taskId ? { taskId: item.taskId } : {}),
      ...(typeof item.taskTitle === 'string' && item.taskTitle ? { taskTitle: item.taskTitle } : {}),
    });
  }
  return sessions;
}

export function readSessions() {
  return normalizeSessionList(readJson(SESSIONS_KEY, []));
}

function normalizeSession(raw, phase) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id:
      typeof raw.id === 'string' && raw.id
        ? raw.id
        : `ps-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    startedAt: safeIso(raw.startedAt) ?? new Date().toISOString(),
    phase: PHASES[raw.phase] ? raw.phase : phase,
    durationMin: Math.max(1, Math.round(Number(raw.durationMin) || 1)),
    actualMs: Math.max(0, Number(raw.actualMs) || 0),
    taskId: typeof raw.taskId === 'string' && raw.taskId ? raw.taskId : null,
    taskTitle: typeof raw.taskTitle === 'string' && raw.taskTitle ? raw.taskTitle : null,
  };
}

function defaultRuntime(settings) {
  const totalMs = phaseMinutes(settings, 'focus') * 60000;
  return {
    phase: 'focus',
    running: false,
    totalMs,
    remainingMs: totalMs,
    endsAt: 0,
    segmentStartedAt: 0,
    focusRound: 0,
    session: null,
    taskId: null,
    taskTitle: null,
    commandId: null,
    roundsBeforeLongBreak: settings.roundsBeforeLongBreak,
  };
}

/**
 * 只读 runtime（详情 / 工具使用），不推进阶段、不写存储。
 * 旧数据缺字段时按设置与 phase 兜底。
 */
export function readRuntime(settings = DEFAULT_SETTINGS) {
  const stored = readJson(RUNTIME_KEY, null);
  if (!stored || typeof stored !== 'object' || !PHASES[stored.phase]) {
    return defaultRuntime(settings);
  }
  const phase = stored.phase;
  const totalMs =
    Number(stored.totalMs) > 0
      ? Number(stored.totalMs)
      : phaseMinutes(settings, phase) * 60000;
  const session = normalizeSession(stored.session, phase);
  const running = Boolean(stored.running) && Boolean(stored.endsAt) && Boolean(session);
  const rawRemaining = Number(stored.remainingMs);
  let remainingMs = Number.isFinite(rawRemaining) ? Math.max(0, rawRemaining) : totalMs;
  if (running) remainingMs = Math.max(0, Number(stored.endsAt) - Date.now());
  return {
    phase,
    running,
    totalMs,
    remainingMs: Math.min(totalMs, Math.max(0, remainingMs)),
    endsAt: running ? Number(stored.endsAt) : 0,
    segmentStartedAt: Number(stored.segmentStartedAt) || 0,
    focusRound: Math.max(0, Math.round(Number(stored.focusRound) || 0)),
    session,
    taskId:
      typeof stored.taskId === 'string' && stored.taskId
        ? stored.taskId
        : session?.taskId ?? null,
    taskTitle:
      typeof stored.taskTitle === 'string' && stored.taskTitle
        ? stored.taskTitle
        : session?.taskTitle ?? null,
    commandId: typeof stored.commandId === 'string' ? stored.commandId : null,
    roundsBeforeLongBreak:
      Number.isFinite(Number(stored.roundsBeforeLongBreak)) &&
      Number(stored.roundsBeforeLongBreak) > 0
        ? Math.round(Number(stored.roundsBeforeLongBreak))
        : settings.roundsBeforeLongBreak,
  };
}

function remainingMsOf(runtime, now) {
  if (runtime.running && runtime.endsAt > 0) {
    return Math.max(0, runtime.endsAt - now);
  }
  return Math.max(0, runtime.remainingMs);
}

function roundInCycle(runtime, settings) {
  const limit = runtime.roundsBeforeLongBreak ?? settings.roundsBeforeLongBreak;
  if (runtime.phase === 'longBreak') return limit;
  if (runtime.phase === 'shortBreak') return Math.min(limit, Math.max(1, runtime.focusRound));
  return Math.min(limit, runtime.focusRound + 1);
}

/* ------------------------------------------------------------------ */
/* 统计                                                                */
/* ------------------------------------------------------------------ */

function startOfWeek(date) {
  const day = startOfLocalDay(date);
  const offset = (day.getDay() + 6) % 7; // 周一为一周开始
  day.setDate(day.getDate() - offset);
  return day;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function rangeBounds(range, now = new Date()) {
  if (range === 'week') return [startOfWeek(now), now];
  if (range === 'month') return [startOfMonth(now), now];
  return [startOfLocalDay(now), now];
}

function summarizeSessions(sessions, start, end) {
  const byDay = {};
  let completed = 0;
  let focusMinutes = 0;
  for (const session of sessions) {
    if (session.phase !== 'focus') continue;
    const endedAt = safeDate(session.endedAt);
    if (!endedAt || endedAt < start || endedAt > end) continue;
    focusMinutes += Number(session.actualMin) || 0;
    if (!session.completed) continue;
    completed += 1;
    const key = localDateKey(endedAt);
    byDay[key] = (byDay[key] || 0) + 1;
  }
  return { completed, focusMinutes, byDay };
}

export function statsForRange(sessions, range = 'today', now = new Date()) {
  const [start, end] = rangeBounds(range, now);
  const { completed, focusMinutes } = summarizeSessions(sessions, start, end);
  return { range, completed, focusMinutes };
}

export function streakDays(sessions, now = new Date()) {
  const days = new Set(
    sessions
      .filter((session) => session.phase === 'focus' && session.completed && session.endedAt)
      .map((session) => {
        const endedAt = safeDate(session.endedAt);
        return endedAt ? localDateKey(endedAt) : null;
      })
      .filter(Boolean),
  );
  const cursor = startOfLocalDay(now);
  if (!days.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** 详情页只读快照：与引擎 snapshot 同形，但不启动计时器、不写存储 */
export function describeSnapshot(settings = DEFAULT_SETTINGS, now = Date.now()) {
  const runtime = readRuntime(settings);
  const remainingMs = remainingMsOf(runtime, now);
  const today = statsForRange(readSessions(), 'today', new Date(now));
  return {
    phase: runtime.phase,
    phaseLabel: PHASES[runtime.phase].label,
    running: runtime.running,
    remainingMs,
    remainingText: formatDuration(remainingMs),
    totalMs: runtime.totalMs,
    progress:
      runtime.totalMs > 0 ? 1 - Math.min(1, remainingMs / Math.max(1, runtime.totalMs)) : 0,
    taskId: runtime.taskId,
    taskTitle: runtime.taskTitle,
    focusRound: runtime.focusRound,
    roundsBeforeLongBreak: runtime.roundsBeforeLongBreak,
    roundInCycle: roundInCycle(runtime, settings),
    whiteNoise: settings.whiteNoise,
    whiteNoiseVolume: settings.whiteNoiseVolume,
    sound: settings.sound,
    keepAwake: settings.keepAwake,
    today,
  };
}

/* ------------------------------------------------------------------ */
/* 命令（详情 → 卡片引擎）                                              */
/* ------------------------------------------------------------------ */

export function sendCommand(type, args = {}) {
  const command = {
    id: `pc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    args: args && typeof args === 'object' ? args : {},
    at: new Date().toISOString(),
  };
  writeJson(COMMAND_KEY, command);
  try {
    window.dispatchEvent(new CustomEvent(COMMAND_EVENT, { detail: command }));
  } catch {
    /* CustomEvent 不可用时只靠 storage 事件 */
  }
  return command;
}

/* ------------------------------------------------------------------ */
/* 引擎                                                                */
/* ------------------------------------------------------------------ */

function newSession(phase, minutes, taskId, taskTitle) {
  return {
    id: `ps-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    startedAt: new Date().toISOString(),
    phase,
    durationMin: Math.max(1, Math.round(minutes)),
    actualMs: 0,
    taskId: taskId ?? null,
    taskTitle: taskTitle ?? null,
  };
}

class PomodoroEngine {
  constructor() {
    this.listeners = new Set();
    this.snapshot = null;
    this.ticker = 0;
    this.started = false;
    this.lastPersistAt = 0;
    this.lastKeepAwake = null;
    this.ticking = false;
    this.commandDisposer = null;
    this.settings = normalizeSettings(null);
    this.sessions = readSessions();
    this.lastCommandId = null;
    this.runtime = this.#restoreRuntime();
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
    this.commandDisposer = this.#listenCommands();
    this.ticker = window.setInterval(() => this.#tick(), TICK_MS);
    // 引擎停着的时候收到的最后一条命令（例如详情在卡片重载期间发命令）补执行一次
    this.#applyCommand(readJson(COMMAND_KEY, null));
    this.#emit();
  }

  stopEngine() {
    this.started = false;
    window.clearInterval(this.ticker);
    this.ticker = 0;
    this.commandDisposer?.();
    this.commandDisposer = null;
    this.#syncKeepAwake(false);
  }

  setSettings(next) {
    const settings = normalizeSettings(next);
    const previous = this.settings;
    this.settings = settings;
    const runtime = this.runtime;
    if (!runtime.running && !runtime.session) {
      const minutes = phaseMinutes(settings, runtime.phase);
      runtime.totalMs = minutes * 60000;
      runtime.remainingMs = runtime.totalMs;
    }
    runtime.roundsBeforeLongBreak = settings.roundsBeforeLongBreak;
    if (runtime.running) {
      if (previous.whiteNoise !== settings.whiteNoise) {
        if (settings.whiteNoise === 'none') stopWhiteNoise();
        else startWhiteNoise(settings.whiteNoise, settings.whiteNoiseVolume);
      } else if (previous.whiteNoiseVolume !== settings.whiteNoiseVolume) {
        setWhiteNoiseVolume(settings.whiteNoiseVolume);
      }
    }
    this.#syncKeepAwake();
    this.#persist();
    this.#emit();
  }

  /* ---------- 查询 ---------- */
  remainingMs() {
    return remainingMsOf(this.runtime, Date.now());
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
      roundsBeforeLongBreak:
        runtime.roundsBeforeLongBreak ?? this.settings.roundsBeforeLongBreak,
      roundInCycle: roundInCycle(runtime, this.settings),
      taskId: runtime.taskId ?? null,
      taskTitle: runtime.taskTitle ?? null,
      whiteNoise: this.settings.whiteNoise,
      whiteNoiseVolume: this.settings.whiteNoiseVolume,
      startedAt: runtime.session?.startedAt ?? null,
      endsAt:
        runtime.running && runtime.endsAt > 0
          ? new Date(runtime.endsAt).toISOString()
          : null,
      today: {
        date: localDateKey(new Date()),
        completed: today.completed,
        focusMinutes: today.focusMinutes,
      },
    };
  }

  stats(options = {}) {
    const source = options && typeof options === 'object' ? options : {};
    const range =
      source.range === 'week' || source.range === 'month' ? source.range : 'today';
    const from = safeDate(source.from);
    const to = safeDate(source.to);
    let start;
    let end;
    if (from && to && from <= to) {
      start = from;
      end = to;
    } else {
      [start, end] = rangeBounds(range, new Date());
    }
    const summary = summarizeSessions(this.sessions, start, end);
    return {
      range,
      from: start.toISOString(),
      to: end.toISOString(),
      completed: summary.completed,
      focusMinutes: summary.focusMinutes,
      streakDays: streakDays(this.sessions),
      byDay: summary.byDay,
    };
  }

  /* ---------- 用户操作 ---------- */
  toggle() {
    unlockAudio();
    if (this.runtime.running) {
      this.pause();
      return;
    }
    if (this.remainingMs() <= 0) this.#completePhase();
    else this.#begin();
  }

  start(options = {}) {
    unlockAudio();
    const runtime = this.runtime;
    const hasTask =
      Object.prototype.hasOwnProperty.call(options, 'taskId') ||
      Object.prototype.hasOwnProperty.call(options, 'taskTitle');
    if (hasTask) this.#applyTask(options);

    if (runtime.running) {
      if (hasTask) {
        this.#persist();
        this.#emit();
      }
      return this.status();
    }

    if (!runtime.session && runtime.phase === 'focus' && Number(options.minutes) > 0) {
      const minutes = clamp(options.minutes, 1, MAX_MINUTES.focus, this.settings.focusMin);
      runtime.totalMs = minutes * 60000;
      runtime.remainingMs = runtime.totalMs;
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
    const phase = this.runtime.phase;
    stopWhiteNoise();
    this.#finalizeCurrent(false);
    let next = 'focus';
    if (phase === 'focus') {
      next = 'shortBreak';
      this.#notify('已跳过专注，进入短休');
    } else {
      if (phase === 'longBreak') this.runtime.focusRound = 0;
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
    this.#notify('已结束本轮');
    this.#setPhaseReady(phase, false);
    return record;
  }

  associateTask(taskId, taskTitle) {
    this.#applyTask({ taskId, taskTitle });
    this.#persist();
    this.#emit();
    return this.status();
  }

  clearStats(scope = 'today') {
    const normalizedScope = scope === 'all' ? 'all' : 'today';
    const sessions = readSessions();
    const todayKey = localDateKey(new Date());
    const next =
      normalizedScope === 'all'
        ? []
        : sessions.filter((session) => {
            const endedAt = safeDate(session.endedAt);
            return !endedAt || localDateKey(endedAt) !== todayKey;
          });
    const cleared = sessions.length - next.length;
    this.sessions = next;
    writeJson(SESSIONS_KEY, next);
    this.#notify(cleared > 0 ? `已清空 ${cleared} 条专注记录` : '没有可清空的专注记录');
    this.#emit();
    return { scope: normalizedScope, cleared, remaining: next.length };
  }

  async updateSettings(patch) {
    const next = normalizeSettings({ ...this.settings, ...(patch || {}) });
    this.setSettings(next);
    try {
      await plugin.setConfig(SETTINGS_KEY, next);
    } catch {
      /* 宿主不可用时只更新内存 */
    }
    return next;
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
      runtime.session = newSession(
        runtime.phase,
        Math.round(runtime.totalMs / 60000),
        runtime.taskId,
        runtime.taskTitle,
      );
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

  #applyTask(options) {
    const runtime = this.runtime;
    if (Object.prototype.hasOwnProperty.call(options, 'taskId')) {
      runtime.taskId =
        typeof options.taskId === 'string' && options.taskId ? options.taskId : null;
    }
    if (Object.prototype.hasOwnProperty.call(options, 'taskTitle')) {
      runtime.taskTitle =
        typeof options.taskTitle === 'string' && options.taskTitle.trim()
          ? options.taskTitle.trim()
          : null;
    }
    if (runtime.session) {
      runtime.session.taskId = runtime.taskId;
      runtime.session.taskTitle = runtime.taskTitle;
    }
  }

  #setPhaseReady(phase, autoStart) {
    stopWhiteNoise();
    const runtime = this.runtime;
    const minutes = phaseMinutes(this.settings, phase);
    runtime.phase = phase;
    runtime.totalMs = minutes * 60000;
    runtime.remainingMs = runtime.totalMs;
    runtime.running = false;
    runtime.endsAt = 0;
    runtime.segmentStartedAt = 0;
    runtime.session = null;
    this.#syncKeepAwake();
    this.#persist();
    this.#emit();
    if (autoStart) this.#begin();
  }

  #nextPhaseOnComplete(phase) {
    const runtime = this.runtime;
    if (phase === 'focus') {
      runtime.focusRound += 1;
      if (runtime.focusRound >= this.settings.roundsBeforeLongBreak) {
        runtime.focusRound = 0;
        return 'longBreak';
      }
      return 'shortBreak';
    }
    if (phase === 'longBreak') runtime.focusRound = 0;
    return 'focus';
  }

  #completePhase() {
    const phase = this.runtime.phase;
    stopWhiteNoise();
    this.#finalizeCurrent(true, true);
    const next = this.#nextPhaseOnComplete(phase);
    const nextMinutes = phaseMinutes(this.settings, next);
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
      runtime.running && runtime.segmentStartedAt
        ? Math.max(0, now - runtime.segmentStartedAt)
        : 0;
    const actualMs = session.actualMs + segment;
    runtime.session = null;
    runtime.segmentStartedAt = 0;
    runtime.running = false;
    runtime.endsAt = 0;
    // 只为专注轮次留记录；休息阶段不进入专注记录与统计。
    if (!record || session.phase !== 'focus') return null;
    if (!completed && actualMs < 1000) return null;
    const entry = {
      id: session.id,
      startedAt: session.startedAt,
      endedAt: new Date().toISOString(),
      phase: 'focus',
      durationMin: session.durationMin,
      actualMin: Math.max(1, Math.round(actualMs / 60000)),
      completed: Boolean(completed),
      ...(session.taskId ? { taskId: session.taskId } : {}),
      ...(session.taskTitle ? { taskTitle: session.taskTitle } : {}),
    };
    this.sessions.push(entry);
    writeJson(SESSIONS_KEY, this.sessions);
    return entry;
  }

  #restoreRuntime() {
    const stored = readJson(RUNTIME_KEY, null);
    if (!stored || typeof stored !== 'object' || !PHASES[stored.phase]) {
      return defaultRuntime(this.settings);
    }
    const phase = stored.phase;
    const totalMs =
      Number(stored.totalMs) > 0 ? Number(stored.totalMs) : phaseMinutes(this.settings, phase) * 60000;
    const session = normalizeSession(stored.session, phase);
    const runtime = {
      phase,
      running: Boolean(stored.running) && Boolean(stored.endsAt) && Boolean(session),
      totalMs,
      remainingMs: Number.isFinite(Number(stored.remainingMs))
        ? Math.max(0, Number(stored.remainingMs))
        : totalMs,
      endsAt: Number(stored.endsAt) || 0,
      segmentStartedAt: Number(stored.segmentStartedAt) || 0,
      focusRound: Math.max(0, Math.round(Number(stored.focusRound) || 0)),
      session,
      taskId:
        typeof stored.taskId === 'string' && stored.taskId
          ? stored.taskId
          : session?.taskId ?? null,
      taskTitle:
        typeof stored.taskTitle === 'string' && stored.taskTitle
          ? stored.taskTitle
          : session?.taskTitle ?? null,
      commandId: typeof stored.commandId === 'string' ? stored.commandId : null,
      roundsBeforeLongBreak:
        Number.isFinite(Number(stored.roundsBeforeLongBreak)) &&
        Number(stored.roundsBeforeLongBreak) > 0
          ? Math.round(Number(stored.roundsBeforeLongBreak))
          : this.settings.roundsBeforeLongBreak,
    };
    this.lastCommandId = runtime.commandId;

    if (!runtime.running) {
      runtime.remainingMs = Math.min(runtime.totalMs, Math.max(0, runtime.remainingMs));
      runtime.endsAt = 0;
      runtime.segmentStartedAt = 0;
      return runtime;
    }

    const now = Date.now();
    if (runtime.endsAt > now) {
      const elapsed = runtime.segmentStartedAt
        ? Math.max(0, now - runtime.segmentStartedAt)
        : 0;
      if (runtime.session) runtime.session.actualMs += elapsed;
      runtime.segmentStartedAt = now;
      runtime.remainingMs = Math.max(0, runtime.endsAt - now);
      return runtime;
    }

    // 重启时已经过期：按完成落库，并切到下一阶段（不自动开始，避免刚启动就计时）
    if (runtime.session) {
      const segment = runtime.segmentStartedAt
        ? Math.max(0, runtime.endsAt - runtime.segmentStartedAt)
        : 0;
      runtime.session.actualMs += Math.max(0, segment);
    }
    runtime.running = false;
    runtime.segmentStartedAt = 0;
    runtime.remainingMs = 0;
    this.runtime = runtime;
    this.#finalizeCurrent(true, true);
    const next = this.#nextPhaseOnComplete(phase);
    this.#setPhaseReady(next, false);
    return this.runtime;
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
      taskId: runtime.taskId,
      taskTitle: runtime.taskTitle,
      commandId: this.lastCommandId,
      roundsBeforeLongBreak: runtime.roundsBeforeLongBreak,
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
    Promise.resolve(plugin.notify(text)).catch(() => {});
  }

  #listenCommands() {
    const onStorage = (event) => {
      if (event.key !== COMMAND_KEY && event.key !== null) return;
      this.#applyCommand(readJson(COMMAND_KEY, null));
    };
    const onLocal = (event) => this.#applyCommand(event.detail);
    window.addEventListener('storage', onStorage);
    window.addEventListener(COMMAND_EVENT, onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(COMMAND_EVENT, onLocal);
    };
  }

  #applyCommand(command) {
    if (!command || typeof command !== 'object') return;
    if (typeof command.id !== 'string' || !command.id) return;
    if (command.id === this.lastCommandId) return;
    this.lastCommandId = command.id;
    const args = command.args && typeof command.args === 'object' ? command.args : {};
    switch (command.type) {
      case 'start':
        this.start(args);
        break;
      case 'pause':
        this.pause();
        break;
      case 'resume':
        this.start();
        break;
      case 'toggle':
        this.toggle();
        break;
      case 'reset':
        this.reset();
        break;
      case 'skip':
        this.skip();
        break;
      case 'stop':
        this.stop();
        break;
      case 'task':
        this.associateTask(args.taskId, args.taskTitle);
        break;
      case 'clearStats':
        this.clearStats(args.scope);
        break;
      default:
        break;
    }
    this.#persist();
  }

  #refreshSnapshot() {
    const runtime = this.runtime;
    const remaining = this.remainingMs();
    const today = statsForRange(this.sessions, 'today');
    this.snapshot = {
      phase: runtime.phase,
      phaseLabel: PHASES[runtime.phase].label,
      running: runtime.running,
      remainingMs: remaining,
      remainingText: formatDuration(remaining),
      totalMs: runtime.totalMs,
      progress:
        runtime.totalMs > 0 ? 1 - Math.min(1, remaining / Math.max(1, runtime.totalMs)) : 0,
      taskId: runtime.taskId,
      taskTitle: runtime.taskTitle || (runtime.taskId ? runtime.taskId : null),
      focusRound: runtime.focusRound,
      roundsBeforeLongBreak: this.settings.roundsBeforeLongBreak,
      roundInCycle: roundInCycle(runtime, this.settings),
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
/* Agent 工具声明与处理（与 UI 共用同一个引擎）                         */
/* ------------------------------------------------------------------ */

export const TOOL_DECLS = [
  {
    name: 'pomodoro.start',
    description: '开始一轮专注；暂停后调用可继续。可带本轮分钟数、关联待办任务',
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
  {
    name: 'pomodoro.pause',
    description: '暂停当前一轮',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'pomodoro.resume',
    description: '继续当前一轮',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'pomodoro.toggle',
    description: '开始/继续或暂停当前一轮（卡片主按钮的语义）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'pomodoro.reset',
    description: '结束当前一轮并重置到专注阶段第 1 轮',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'pomodoro.skip',
    description: '跳过当前阶段（专注→短休，休息→专注）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'pomodoro.stop',
    description: '结束当前一轮并落库本次记录，停在当前阶段',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'pomodoro.status',
    description: '读取阶段、剩余秒数、当前任务、轮次与今日统计',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'pomodoro.stats',
    description: '读取完成轮数、专注分钟、连续天数与按天完成数',
    parameters: {
      type: 'object',
      properties: {
        range: {
          type: 'string',
          enum: ['today', 'week', 'month'],
          description: '统计范围，默认 today',
        },
        from: { type: 'string', description: '自定义开始时间（ISO），可选' },
        to: { type: 'string', description: '自定义结束时间（ISO），可选' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'pomodoro.clearStats',
    description: '清空专注记录；scope=today 只删今天，scope=all 删除全部历史。进行中的一轮不受影响',
    parameters: {
      type: 'object',
      properties: {
        scope: { type: 'string', enum: ['today', 'all'], description: '清空范围，默认 today' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'pomodoro.settings.get',
    description: '读取番茄钟设置（时长、轮数、自动开始、提示音、保持唤醒、白噪音）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'pomodoro.settings.set',
    description: '修改番茄钟设置，未提供的字段保持原值；即时生效',
    parameters: {
      type: 'object',
      properties: {
        focusMin: { type: 'number', minimum: 1, maximum: 180 },
        shortBreakMin: { type: 'number', minimum: 1, maximum: 60 },
        longBreakMin: { type: 'number', minimum: 1, maximum: 60 },
        roundsBeforeLongBreak: { type: 'number', minimum: 1, maximum: 12 },
        autoStartNext: { type: 'boolean' },
        sound: { type: 'boolean' },
        keepAwake: { type: 'boolean' },
        whiteNoise: { type: 'string', enum: ['none', 'rain', 'cafe', 'fan'] },
        whiteNoiseVolume: { type: 'number', minimum: 0, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
];

export function buildToolHandlers(engine) {
  return {
    'pomodoro.start': (args) => engine.start(args || {}),
    'pomodoro.pause': () => {
      engine.pause();
      return engine.status();
    },
    'pomodoro.resume': () => engine.start(),
    'pomodoro.toggle': () => {
      engine.toggle();
      return engine.status();
    },
    'pomodoro.reset': () => {
      engine.reset();
      return engine.status();
    },
    'pomodoro.skip': () => {
      engine.skip();
      return engine.status();
    },
    'pomodoro.stop': () => ({
      session: engine.stop(),
      status: engine.status(),
    }),
    'pomodoro.status': () => engine.status(),
    'pomodoro.stats': (args) => engine.stats(args || {}),
    'pomodoro.clearStats': (args) => engine.clearStats(args?.scope),
    'pomodoro.settings.get': () => normalizeSettings(engine.settings),
    'pomodoro.settings.set': (args) => engine.updateSettings(args || {}),
  };
}

/* ------------------------------------------------------------------ */
/* 独立开发 / 截图：?demo=1 注入演示数据                                 */
/* ------------------------------------------------------------------ */

function demoDate(now, dayOffset, hour, minute) {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + dayOffset,
    hour,
    minute,
    0,
    0,
  );
}

export async function seedDemoData() {
  const existing = readJson(SESSIONS_KEY, null);
  if (Array.isArray(existing) && existing.length) return;
  const now = new Date();
  const makeSession = (id, dayOffset, startHour, startMinute, actualMin, completed, taskTitle) => {
    const started = demoDate(now, dayOffset, startHour, startMinute);
    const ended = new Date(started.getTime() + actualMin * 60000);
    return {
      id,
      startedAt: started.toISOString(),
      endedAt: ended.toISOString(),
      phase: 'focus',
      durationMin: 25,
      actualMin,
      completed,
      ...(taskTitle ? { taskId: 'demo-task', taskTitle } : {}),
    };
  };
  const sessions = [
    makeSession('demo-session-today-1', 0, 9, 30, 25, true, '写周报'),
    makeSession('demo-session-today-2', 0, 10, 30, 25, true, '写周报'),
    makeSession('demo-session-today-3', 0, 14, 10, 18, false, '读文档'),
    makeSession('demo-session-yesterday-1', -1, 10, 0, 25, true, '整理需求'),
    makeSession('demo-session-yesterday-2', -1, 15, 0, 25, true),
    makeSession('demo-session-week-1', -3, 11, 0, 25, true, '写周报'),
  ];
  writeJson(SESSIONS_KEY, sessions);

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
      taskId: 'demo-task',
      taskTitle: '写周报',
    },
    taskId: 'demo-task',
    taskTitle: '写周报',
    commandId: null,
    roundsBeforeLongBreak: 4,
  });
  try {
    localStorage.removeItem(COMMAND_KEY);
  } catch {
    /* ignore */
  }
}
