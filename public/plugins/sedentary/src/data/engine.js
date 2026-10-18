/**
 * 久坐提醒数据层（纯 JS，不依赖 React）。
 *
 * - background iframe 的 `SedentaryEngine` 每 10 秒轮询 plugin.getIdleSeconds 计时/提醒；
 * - 卡片与详情视图只读 localStorage 里的 sedentary.runtime / sedentary.days 并订阅
 *   storage 事件（跨 iframe 同步），打卡写 sedentary.command 交给引擎立刻执行；
 * - 设置走宿主配置（plugin.getConfig/setConfig），引擎每轮读取，改完即时生效。
 *
 * 存储键（docs/components/sedentary.md）：sedentary.days / sedentary.runtime。
 */

import { plugin } from '/plugin-sdk.js';

export const SETTINGS_KEY = 'settings';
export const DAYS_KEY = 'sedentary.days';
export const RUNTIME_KEY = 'sedentary.runtime';
export const COMMAND_KEY = 'sedentary.command';

const ENGINE_TICK_MS = 10000; // 规格：每 10 秒轮询一次
const ACTIVE_IDLE_SECONDS = 60; // 规格：idle < 60 秒算有输入
const SNOOZE_MINUTES = 5; // 强提醒的「稍后 5 分钟」
const COMMAND_EVENT = 'sedentary:command';
const DAY_KEEP_DAYS = 400; // 日统计保留一年，避免 localStorage 无限增长

export const DEFAULT_SETTINGS = {
  enabled: true,
  thresholdMin: 45,
  remindEveryMin: 10,
  idleResetMin: 5,
  strongReminder: true,
  quietHours: null,
};

const DEFAULT_QUIET = { start: '22:00', end: '08:00' };
export const DEFAULT_QUIET_HOURS = DEFAULT_QUIET;

const STATUS_LABELS = {
  success: '正常',
  warning: '接近阈值',
  danger: '已超阈值',
  quiet: '免打扰',
  off: '已关闭',
};

/* ------------------------------------------------------------------ */
/* 基础工具                                                            */
/* ------------------------------------------------------------------ */

const pad2 = (n) => String(n).padStart(2, '0');

export function formatClock(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—';
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function safeDate(value) {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

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

function normalizePositiveInt(value, fallback) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return number;
}

function normalizeQuiet(value) {
  if (!value || typeof value !== 'object') return null;
  if (!/^\d{2}:\d{2}$/.test(value.start) || !/^\d{2}:\d{2}$/.test(value.end)) return null;
  return { start: value.start, end: value.end };
}

/* ------------------------------------------------------------------ */
/* 设置 / 状态读写                                                     */
/* ------------------------------------------------------------------ */

export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    enabled: typeof source.enabled === 'boolean' ? source.enabled : DEFAULT_SETTINGS.enabled,
    thresholdMin: normalizePositiveInt(source.thresholdMin, DEFAULT_SETTINGS.thresholdMin),
    remindEveryMin: normalizePositiveInt(source.remindEveryMin, DEFAULT_SETTINGS.remindEveryMin),
    idleResetMin: normalizePositiveInt(source.idleResetMin, DEFAULT_SETTINGS.idleResetMin),
    strongReminder:
      typeof source.strongReminder === 'boolean'
        ? source.strongReminder
        : DEFAULT_SETTINGS.strongReminder,
    quietHours: normalizeQuiet(source.quietHours),
  };
}

export function readRuntime() {
  const stored = readJson(RUNTIME_KEY, null);
  const runtime = stored && typeof stored === 'object' ? stored : {};
  return {
    sittingSince: typeof runtime.sittingSince === 'string' ? runtime.sittingSince : null,
    lastInputAt: typeof runtime.lastInputAt === 'string' ? runtime.lastInputAt : null,
    lastRemindAt: typeof runtime.lastRemindAt === 'string' ? runtime.lastRemindAt : null,
    snoozedUntil: typeof runtime.snoozedUntil === 'string' ? runtime.snoozedUntil : null,
    lastTickAt: typeof runtime.lastTickAt === 'string' ? runtime.lastTickAt : null,
    lastBreakAt: typeof runtime.lastBreakAt === 'string' ? runtime.lastBreakAt : null,
    quietSkip: Boolean(runtime.quietSkip),
    commandId: typeof runtime.commandId === 'string' ? runtime.commandId : null,
  };
}

function writeRuntime(runtime) {
  writeJson(RUNTIME_KEY, runtime);
}

export function readDays() {
  const stored = readJson(DAYS_KEY, null);
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
}

function writeDays(days) {
  writeJson(DAYS_KEY, days);
}

function emptyDay(key) {
  return { date: key, sittingMinutes: 0, longestStreakMin: 0, breaks: 0 };
}

export function todayStats(now = new Date()) {
  const days = readDays();
  return days[dateKey(now)] ?? emptyDay(dateKey(now));
}

export function currentStreakMin(runtime, now = Date.now()) {
  const since = safeDate(runtime.sittingSince);
  if (!since) return 0;
  return Math.max(0, (now - since.getTime()) / 60000);
}

export function isQuiet(now, quietHours) {
  if (!quietHours) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = quietHours.start.split(':').map(Number);
  const [endH, endM] = quietHours.end.split(':').map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  if (start === end) return false;
  if (start < end) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end; // 22:00–08:00 这类跨零点时段
}

export function statusOf(settings, runtime, now = new Date()) {
  if (!settings.enabled) return 'off';
  if (isQuiet(now, settings.quietHours)) return 'quiet';
  const streak = currentStreakMin(runtime, now.getTime());
  if (streak >= settings.thresholdMin) return 'danger';
  if (streak >= settings.thresholdMin * 0.6) return 'warning';
  return 'success';
}

/**
 * 副文案（V-12）：不重复主数值，只讲阈值/下一步/状态。
 * 主数值由界面单独渲染，这里返回一句 8–18 字的补充。
 */
export function hintOf(settings, runtime, now = new Date()) {
  const status = statusOf(settings, runtime, now);
  if (status === 'off') return '久坐提醒已关闭';
  if (status === 'quiet') return '免打扰时段，仍在计时';
  const snoozed = safeDate(runtime.snoozedUntil);
  if (snoozed && snoozed > now) return '提醒已推迟，稍后再说';
  if (!runtime.sittingSince) return '刚起身，久坐计时还没开始';
  const streak = currentStreakMin(runtime, now.getTime());
  const remaining = settings.thresholdMin - streak;
  if (status === 'danger') return '已超过提醒阈值，起来活动一下';
  if (status === 'warning') return `距提醒还有 ${Math.max(1, Math.ceil(remaining))} 分钟，准备起身`;
  return `距提醒还有 ${Math.max(1, Math.ceil(remaining))} 分钟`;
}

export function statusLabelOf(status) {
  return STATUS_LABELS[status] ?? '正常';
}

export function nextReminderText(settings, runtime, now = new Date()) {
  if (!settings.enabled) return '—';
  if (isQuiet(now, settings.quietHours)) return '免打扰中';
  const snoozed = safeDate(runtime.snoozedUntil);
  if (snoozed && snoozed > now) {
    return `稍后 ${Math.ceil((snoozed.getTime() - now.getTime()) / 60000)} 分钟`;
  }
  if (!runtime.sittingSince) return '—';
  const streak = currentStreakMin(runtime, now.getTime());
  const remaining = settings.thresholdMin - streak;
  if (remaining <= 0) return '已到提醒点';
  return `约 ${Math.max(1, Math.ceil(remaining))} 分钟`;
}

/** 一次读取界面需要的全部状态（卡片 / 详情共用） */
export function describeState(settings, now = new Date()) {
  const runtime = readRuntime();
  const days = readDays();
  const today = days[dateKey(now)] ?? emptyDay(dateKey(now));
  const status = statusOf(settings, runtime, now);
  const streak = Math.floor(currentStreakMin(runtime, now.getTime()));
  const lastBreak = safeDate(runtime.lastBreakAt);
  return {
    runtime,
    today,
    status,
    statusLabel: statusLabelOf(status),
    currentMin: streak,
    hint: hintOf(settings, runtime, now),
    nextText: nextReminderText(settings, runtime, now),
    lastBreakText: lastBreak ? formatClock(lastBreak) : '—',
  };
}

/* ------------------------------------------------------------------ */
/* 打卡命令（卡片 → 引擎）                                              */
/* ------------------------------------------------------------------ */

export function sendBreakCommand() {
  const command = {
    id: `cmd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'break',
    at: new Date().toISOString(),
  };
  writeJson(COMMAND_KEY, command);
  window.dispatchEvent(new CustomEvent(COMMAND_EVENT, { detail: command }));
  return command;
}

export function onLocalCommand(handler) {
  const listener = (event) => handler(event.detail);
  window.addEventListener(COMMAND_EVENT, listener);
  return () => window.removeEventListener(COMMAND_EVENT, listener);
}

/* ------------------------------------------------------------------ */
/* 后台引擎                                                            */
/* ------------------------------------------------------------------ */

export class SedentaryEngine {
  constructor() {
    this.running = false;
    this.timer = 0;
    this.firstTimer = 0;
    this.disposers = [];
    this.logs = [];
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.disposers.push(this.#listen());
    this.firstTimer = window.setTimeout(() => void this.tick(), 500);
    this.timer = window.setInterval(() => void this.tick(), ENGINE_TICK_MS);
    this.#log('后台引擎启动（每 10 秒轮询 getIdleSeconds）');
  }

  stop() {
    this.running = false;
    window.clearTimeout(this.firstTimer);
    window.clearInterval(this.timer);
    for (const dispose of this.disposers.splice(0)) dispose();
  }

  getLogs() {
    return [...this.logs];
  }

  #log(line) {
    this.logs.push(`${formatClock(new Date())}  ${line}`);
    if (this.logs.length > 30) this.logs.shift();
  }

  #listen() {
    const onStorage = (event) => {
      if (event.key === COMMAND_KEY) {
        const command = readJson(COMMAND_KEY, null);
        if (command) this.handleCommand(command);
      }
    };
    window.addEventListener('storage', onStorage);
    const offLocal = onLocalCommand((command) => this.handleCommand(command));
    return () => {
      window.removeEventListener('storage', onStorage);
      offLocal();
    };
  }

  handleCommand(command) {
    if (!command || command.type !== 'break') return;
    const runtime = readRuntime();
    if (runtime.commandId === command.id) return;
    runtime.commandId = command.id;
    writeRuntime(runtime);
    this.takeBreak('manual');
  }

  async tick() {
    if (!this.running) return;
    const now = new Date();
    const settings = normalizeSettings(await plugin.getConfig(SETTINGS_KEY).catch(() => null));
    const days = readDays();
    const key = dateKey(now);
    const day = days[key] ?? emptyDay(key);
    days[key] = day;
    const runtime = readRuntime();

    if (!settings.enabled) {
      runtime.sittingSince = null;
      runtime.lastRemindAt = null;
      runtime.snoozedUntil = null;
      runtime.lastTickAt = now.toISOString();
      writeRuntime(runtime);
      writeDays(this.#trimDays(days));
      return;
    }

    let idleSeconds = 0;
    try {
      idleSeconds = Number(await plugin.getIdleSeconds()) || 0;
    } catch {
      idleSeconds = 0;
    }

    const active = idleSeconds < ACTIVE_IDLE_SECONDS;
    const idleResetSeconds = Math.max(1, settings.idleResetMin) * 60;
    const lastTick = safeDate(runtime.lastTickAt);
    const deltaMin = lastTick ? Math.max(0, (now - lastTick) / 60000) : 0;

    if (active) {
      if (!runtime.sittingSince) {
        runtime.sittingSince = now.toISOString();
        this.#log('开始新一轮久坐计时');
      }
      day.sittingMinutes += deltaMin;
      const streak = currentStreakMin(runtime, now.getTime());
      if (streak > day.longestStreakMin) day.longestStreakMin = Math.round(streak);
      runtime.lastInputAt = now.toISOString();
      runtime.lastTickAt = now.toISOString();
      writeRuntime(runtime);
      writeDays(this.#trimDays(days));
      await this.#maybeRemind(now, streak, settings);
    } else if (idleSeconds >= idleResetSeconds) {
      if (runtime.sittingSince) {
        const streak = currentStreakMin(runtime, now.getTime());
        if (streak > day.longestStreakMin) day.longestStreakMin = Math.round(streak);
        day.breaks += 1;
        runtime.lastBreakAt = now.toISOString();
        runtime.sittingSince = null;
        runtime.lastRemindAt = null;
        runtime.snoozedUntil = null;
        runtime.quietSkip = false;
        this.#log(`检测到起身（空闲 ${Math.round(idleSeconds / 60)} 分钟），今日第 ${day.breaks} 次`);
      }
      runtime.lastTickAt = now.toISOString();
      writeRuntime(runtime);
      writeDays(this.#trimDays(days));
    } else {
      runtime.lastTickAt = now.toISOString();
      writeRuntime(runtime);
    }
  }

  #trimDays(days) {
    const keys = Object.keys(days).sort();
    if (keys.length <= DAY_KEEP_DAYS) return days;
    const keep = new Set(keys.slice(-DAY_KEEP_DAYS));
    const next = {};
    for (const key of keys) if (keep.has(key)) next[key] = days[key];
    return next;
  }

  async #maybeRemind(now, streakMin, settings) {
    if (streakMin < settings.thresholdMin) {
      const runtime = readRuntime();
      if (runtime.quietSkip) {
        runtime.quietSkip = false;
        writeRuntime(runtime);
      }
      return;
    }
    const runtime = readRuntime();
    if (isQuiet(now, settings.quietHours)) {
      if (!runtime.quietSkip) {
        runtime.quietSkip = true;
        writeRuntime(runtime);
      }
      return;
    }
    const snoozed = safeDate(runtime.snoozedUntil);
    if (snoozed && snoozed > now) return;
    const lastRemind = safeDate(runtime.lastRemindAt);
    const due =
      !lastRemind ||
      now.getTime() - lastRemind.getTime() >= Math.max(1, settings.remindEveryMin) * 60000 ||
      runtime.quietSkip;
    if (!due) return;

    runtime.quietSkip = false;
    runtime.lastRemindAt = now.toISOString();
    runtime.snoozedUntil = null;
    writeRuntime(runtime);
    await this.#remind(Math.round(streakMin), settings);
  }

  async #remind(minutes, settings) {
    this.#log(`触发提醒（已连续 ${minutes} 分钟）`);
    if (!settings.strongReminder) {
      plugin.notify(`该起来动一动了：已连续坐 ${minutes} 分钟`);
      return;
    }
    let result = null;
    try {
      result = await plugin.showReminder({
        title: '该起来动一动了',
        message: `已连续坐了 ${minutes} 分钟，站起来走动 1～2 分钟吧。`,
        actions: [
          { id: 'stand', text: '起来了', kind: 'primary' },
          { id: 'snooze', text: '稍后 5 分钟' },
        ],
        autoDismissSec: 30,
      });
    } catch {
      result = null;
    }
    if (result?.actionId === 'stand') {
      this.takeBreak('reminder');
    } else if (result?.actionId === 'snooze') {
      const runtime = readRuntime();
      runtime.snoozedUntil = new Date(Date.now() + SNOOZE_MINUTES * 60000).toISOString();
      writeRuntime(runtime);
      this.#log(`${SNOOZE_MINUTES} 分钟后再提醒`);
    } else {
      this.#log('提醒 30 秒无操作，自动收起');
    }
  }

  /** 结算本轮、记一次起身；返回今日统计 */
  takeBreak(source = 'manual') {    const now = new Date();
    const days = readDays();
    const key = dateKey(now);
    const day = days[key] ?? emptyDay(key);
    days[key] = day;
    const runtime = readRuntime();
    if (runtime.sittingSince) {
      const streak = currentStreakMin(runtime, now.getTime());
      if (streak > day.longestStreakMin) day.longestStreakMin = Math.round(streak);
      day.breaks += 1;
      this.#log(`记录起身（${source}，本轮已坐 ${Math.round(streak)} 分钟）`);
    } else {
      this.#log(`记录起身（${source}）`);
    }
    runtime.sittingSince = null;
    runtime.lastRemindAt = null;
    runtime.snoozedUntil = null;
    runtime.quietSkip = false;
    runtime.lastBreakAt = now.toISOString();
    runtime.lastTickAt = now.toISOString();
    writeRuntime(runtime);
    writeDays(this.#trimDays(days));
    plugin.notify(`已记录起身，今日共 ${day.breaks} 次`);
    return day;
  }
}

/* ------------------------------------------------------------------ */
/* Agent 工具                                                          */
/* ------------------------------------------------------------------ */

export function toolStatus(settings) {
  const now = new Date();
  const runtime = readRuntime();
  const streak = Math.round(currentStreakMin(runtime, now.getTime()));
  return {
    enabled: settings.enabled,
    sitting: Boolean(runtime.sittingSince),
    currentStreakMin: streak,
    thresholdMin: settings.thresholdMin,
    nextReminderMin: runtime.sittingSince ? Math.max(0, settings.thresholdMin - streak) : null,
    quiet: isQuiet(now, settings.quietHours),
    snoozedUntil: runtime.snoozedUntil,
    status: statusOf(settings, runtime, now),
  };
}

export function toolToday() {
  return todayStats(new Date());
}

/* ------------------------------------------------------------------ */
/* 独立开发 / 截图：?demo=1 注入演示数据                                 */
/* ------------------------------------------------------------------ */

export async function seedDemoData() {
  const storedDays = readJson(DAYS_KEY, null);
  if (storedDays && Object.keys(storedDays).length) return;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  writeDays({
    [dateKey(now)]: { date: dateKey(now), sittingMinutes: 187, longestStreakMin: 52, breaks: 3 },
    [dateKey(yesterday)]: { date: dateKey(yesterday), sittingMinutes: 312, longestStreakMin: 96, breaks: 5 },
  });
  writeRuntime({
    sittingSince: new Date(now.getTime() - 52 * 60000).toISOString(),
    lastInputAt: now.toISOString(),
    lastRemindAt: now.toISOString(), // 演示里刚提醒过，避免截图时弹强提醒
    snoozedUntil: null,
    lastTickAt: now.toISOString(),
    lastBreakAt: new Date(now.getTime() - 96 * 60000).toISOString(),
    quietSkip: false,
    commandId: null,
  });
}

/** 引擎单例：隐藏的后台 iframe 里启动；独立开发时卡片视图也复用同一个 */
let sharedEngine = null;
export function getEngine() {
  sharedEngine ??= new SedentaryEngine();
  return sharedEngine;
}

