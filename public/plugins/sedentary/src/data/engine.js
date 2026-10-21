/**
 * 久坐提醒数据层（纯 JS，不依赖 React）。
 *
 * - `background: true` 的隐藏 iframe 里跑 `SedentaryEngine`，每 10 秒轮询
 *   一次 tick 计时/提醒，是 `sedentary.runtime` / `sedentary.days` 的唯一写者；
 *   隐藏 iframe 的定时器可能被浏览器节流到约 60 秒，计数据 tick 时间戳增量
 *   累加，不依赖 tick 间隔，因此不受影响；
 * - 计时模型：**连续计时**。`sittingSince` 是本轮久坐的起点，只由「我起来了」
 *   （卡片/详情/强提醒/Agent 工具）或长时间 tick 空档（休眠/退出）截断；
 *   不再按「键鼠空闲」判定起身——桌面摆件场景下用户经常只是看着不摸屏，
 *   旧逻辑会把这种坐着判成离开，导致按「起来了」后一直停在 0；
 * - 卡片与 L1 详情只读这两个 key 并订阅 storage 事件（跨 iframe 同步），
 *   「我起来了 / 稍后 5 分钟」通过 `sedentary.command` 交给引擎执行；
 * - 每个引擎 tick、命令与工具写操作都套 `navigator.locks`（`wtsl.sedentary.engine`），
 *   锁不可用时退回单实例执行；提醒另记 `lastRemindMinute` 做分钟级去重，
 *   避免后台帧与兜底实例各弹一次；
 * - 设置只来自宿主配置 `plugin.sedentary.settings`（manifest settings schema），
 *   引擎每轮重新读取，改完即时生效。
 *
 * 存储键与结构沿用 docs/components/sedentary.md：
 *   sedentary.days    { [YYYY-MM-DD]: { date, sittingMinutes, longestStreakMin, breaks } }
 *   sedentary.runtime { sittingSince, lastRemindAt, lastRemindMinute,
 *                       snoozedUntil, lastTickAt, lastBreakAt, quietSkip, commandId }
 *   sedentary.command { id, type: 'break'|'snooze', at, minutes? }
 */

import { plugin } from '/plugin-sdk.js';

export const SETTINGS_KEY = 'settings';
export const DAYS_KEY = 'sedentary.days';
export const RUNTIME_KEY = 'sedentary.runtime';
export const COMMAND_KEY = 'sedentary.command';

/** 规格：后台每 10 秒轮询一次 */
const ENGINE_TICK_MS = 10000;
/** 启动后先补一拍，避免刚打开桌面时状态是空的 */
const FIRST_TICK_MS = 500;
/** 强提醒的「稍后 5 分钟」 */
export const SNOOZE_MINUTES = 5;
/** 单次 tick 间隔超过该分钟数，按休眠唤醒 / 系统时钟突变 / 应用退出处理：空档不计入 */
const CLOCK_JUMP_MINUTES = 5;
/** 日统计保留一年，避免 localStorage 无限增长 */
const DAY_KEEP_DAYS = 400;
/** 最近 7 天记录窗口 */
const RECENT_DAYS = 7;
/** 跨 iframe / 标签页串行化引擎读改写 */
const ENGINE_LOCK = 'wtsl.sedentary.engine';
const COMMAND_EVENT = 'sedentary:command';

export const DEFAULT_QUIET_HOURS = Object.freeze({ start: '22:00', end: '08:00' });

/** manifest.settings 的默认值；schema 的 default 必须与此保持一致 */
export const DEFAULT_SETTINGS = Object.freeze({
  enabled: true,
  thresholdMin: 45,
  remindEveryMin: 10,
  strongReminder: true,
  quietHours: DEFAULT_QUIET_HOURS,
});

const NUMBER_LIMITS = {
  thresholdMin: [5, 120],
  remindEveryMin: [1, 60],
};

const STATUS_LABELS = {
  success: '正常',
  warning: '接近阈值',
  danger: '已超阈值',
  quiet: '免打扰',
  off: '已关闭',
};

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/* ------------------------------------------------------------------ */
/* 基础工具                                                            */
/* ------------------------------------------------------------------ */

const pad2 = (value) => String(value).padStart(2, '0');

function dateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** 分钟级去重键：同一分钟内只允许一条提醒 */
function minuteKey(date) {
  return `${dateKey(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function formatClock(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—';
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
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
    /* 隐私模式 / 配额满：保持内存态，不打断计时 */
  }
}

function clampInt(value, [min, max], fallback) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function nonNegative(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function isTimeValue(value) {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

/**
 * quietHours 归一化：
 * - 缺失 / 坏结构 → schema 默认 22:00–08:00；
 * - 两端空字符串 → null（关闭免打扰）；
 * - 两端合法 HH:MM → 原样保留。
 */
function normalizeQuietHours(value) {
  if (value === null) return null;
  if (value === undefined) return { ...DEFAULT_QUIET_HOURS };
  if (typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULT_QUIET_HOURS };
  const { start, end } = value;
  if (start === '' && end === '') return null;
  if (isTimeValue(start) && isTimeValue(end)) return { start, end };
  return { ...DEFAULT_QUIET_HOURS };
}

/* ------------------------------------------------------------------ */
/* 设置                                                                */
/* ------------------------------------------------------------------ */

export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    enabled: typeof source.enabled === 'boolean' ? source.enabled : DEFAULT_SETTINGS.enabled,
    thresholdMin: clampInt(
      source.thresholdMin ?? DEFAULT_SETTINGS.thresholdMin,
      NUMBER_LIMITS.thresholdMin,
      DEFAULT_SETTINGS.thresholdMin,
    ),
    remindEveryMin: clampInt(
      source.remindEveryMin ?? DEFAULT_SETTINGS.remindEveryMin,
      NUMBER_LIMITS.remindEveryMin,
      DEFAULT_SETTINGS.remindEveryMin,
    ),
    strongReminder:
      typeof source.strongReminder === 'boolean'
        ? source.strongReminder
        : DEFAULT_SETTINGS.strongReminder,
    quietHours: normalizeQuietHours(source.quietHours),
  };
}

/** 读一次宿主配置（`plugin.<id>.settings`）。失败按默认值兜底。 */
export async function readSettings() {
  let raw = null;
  try {
    raw = await plugin.getConfig(SETTINGS_KEY);
  } catch {
    raw = null;
  }
  return normalizeSettings(raw);
}

/** 工具用：只接受已知字段与正确类型，其余字段忽略 */
function pickSettingsPatch(patch) {
  const source = patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {};
  const next = {};
  if (typeof source.enabled === 'boolean') next.enabled = source.enabled;
  if (typeof source.strongReminder === 'boolean') next.strongReminder = source.strongReminder;
  for (const key of Object.keys(NUMBER_LIMITS)) {
    if (typeof source[key] === 'number' && Number.isFinite(source[key])) next[key] = source[key];
  }
  if (source.quietHours === null) {
    next.quietHours = null;
  } else if (source.quietHours && typeof source.quietHours === 'object') {
    const { start, end } = source.quietHours;
    if (typeof start === 'string' && typeof end === 'string') next.quietHours = { start, end };
  }
  return next;
}

/**
 * 宿主 timeRange 用空字符串两端表示“关闭”，与内部的 quietHours:null 互转。
 * 写配置时统一存 `{ start: '', end: '' }`，设置页才会显示空输入框而不是 schema 默认值。
 */
export function storedSettings(settings) {
  return {
    ...settings,
    quietHours: settings.quietHours
      ? { start: settings.quietHours.start, end: settings.quietHours.end }
      : { start: '', end: '' },
  };
}

/**
 * 旧配置迁移：把 `quietHours: null` / 越界数字等收敛成 schema 可渲染的值，
 * 同时保留 schema 之外的未知字段。只在确实有差异时写回。
 */
export async function migrateSettings() {
  let raw = null;
  try {
    raw = await plugin.getConfig(SETTINGS_KEY);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const next = { ...raw, ...storedSettings(normalizeSettings(raw)) };
  if (JSON.stringify(next) === JSON.stringify(raw)) return next;
  try {
    await plugin.setConfig(SETTINGS_KEY, next);
  } catch {
    return next;
  }
  return next;
}

/** Agent / 设置页共用：合并当前配置 → normalize 兜底 → 写回宿主 */
export async function updateSettings(patch) {
  let raw = null;
  try {
    raw = await plugin.getConfig(SETTINGS_KEY);
  } catch {
    raw = null;
  }
  const current = normalizeSettings(raw);
  const merged = normalizeSettings({ ...current, ...pickSettingsPatch(patch) });
  const stored = {
    ...(raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}),
    ...storedSettings(merged),
  };
  try {
    await plugin.setConfig(SETTINGS_KEY, stored);
  } catch {
    /* 宿主不可用时保持返回值，调用方拿到的仍是规范化后的设置 */
  }
  return storedSettings(merged);
}

/* ------------------------------------------------------------------ */
/* 日统计 / runtime 读写                                                */
/* ------------------------------------------------------------------ */

function normalizeDay(key, value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    date: key,
    sittingMinutes: nonNegative(source.sittingMinutes),
    longestStreakMin: nonNegative(source.longestStreakMin),
    breaks: Math.round(nonNegative(source.breaks)),
  };
}

function emptyDay(key) {
  return { date: key, sittingMinutes: 0, longestStreakMin: 0, breaks: 0 };
}

/**
 * 读取日统计。兼容旧结构：除了对象映射，也接受 `[{ date, ... }]` 数组
 * （早期导出/迁移遗留），统一收敛成 `{ [date]: DayStats }`。
 */
export function readDays() {
  const stored = readJson(DAYS_KEY, null);
  const source = Array.isArray(stored)
    ? stored.reduce((result, entry) => {
        const key = entry && typeof entry.date === 'string' ? entry.date : null;
        if (key) result[key] = entry;
        return result;
      }, {})
    : stored && typeof stored === 'object'
      ? stored
      : {};
  const days = {};
  for (const [key, value] of Object.entries(source)) {
    if (!DATE_KEY_PATTERN.test(key)) continue;
    days[key] = normalizeDay(key, value);
  }
  return days;
}

function writeDays(days) {
  writeJson(DAYS_KEY, days);
}

export function readRuntime() {
  const stored = readJson(RUNTIME_KEY, null);
  const runtime = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  return {
    sittingSince: typeof runtime.sittingSince === 'string' ? runtime.sittingSince : null,
    lastInputAt: typeof runtime.lastInputAt === 'string' ? runtime.lastInputAt : null,
    lastRemindAt: typeof runtime.lastRemindAt === 'string' ? runtime.lastRemindAt : null,
    lastRemindMinute:
      typeof runtime.lastRemindMinute === 'string' ? runtime.lastRemindMinute : null,
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

function trimDays(days) {
  const keys = Object.keys(days).sort();
  if (keys.length <= DAY_KEEP_DAYS) return days;
  const keep = new Set(keys.slice(-DAY_KEEP_DAYS));
  const next = {};
  for (const key of keys) if (keep.has(key)) next[key] = days[key];
  return next;
}

export function todayStats(now = new Date()) {
  const key = dateKey(now);
  return readDays()[key] ?? emptyDay(key);
}

export function currentStreakMin(runtime, nowMs = Date.now()) {
  const since = safeDate(runtime.sittingSince);
  if (!since) return 0;
  return Math.max(0, (nowMs - since.getTime()) / 60000);
}

export function isQuiet(now, quietHours) {
  if (!quietHours) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = quietHours.start.split(':').map(Number);
  const [endHour, endMinute] = quietHours.end.split(':').map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  if (start === end) return false;
  if (start < end) return minutes >= start && minutes < end;
  // 22:00–08:00 这类跨零点时段
  return minutes >= start || minutes < end;
}

export function statusOf(settings, runtime, now = new Date()) {
  if (!settings.enabled) return 'off';
  if (isQuiet(now, settings.quietHours)) return 'quiet';
  const streak = currentStreakMin(runtime, now.getTime());
  if (streak >= settings.thresholdMin) return 'danger';
  if (streak >= settings.thresholdMin * 0.6) return 'warning';
  return 'success';
}

export function statusLabelOf(status) {
  return STATUS_LABELS[status] ?? STATUS_LABELS.success;
}

/**
 * 卡片/详情副文案（V-12）：不重复主数值，只讲下一步或状态。
 * 正常/接近阈值给“距提醒还有”，到阈值给动作提示，免打扰与稍后各自说明。
 */
export function hintOf(settings, runtime, now = new Date()) {
  const status = statusOf(settings, runtime, now);
  if (status === 'off') return '久坐提醒已关闭';
  if (status === 'quiet') return '免打扰时段，仍在计时';
  const snoozed = safeDate(runtime.snoozedUntil);
  if (snoozed && snoozed > now) return `提醒已推迟到 ${formatClock(snoozed)}`;
  if (!runtime.sittingSince) return '计时准备中';
  const remaining = settings.thresholdMin - currentStreakMin(runtime, now.getTime());
  if (remaining <= 0) return '已超过提醒阈值';
  return `距提醒还有 ${Math.max(1, Math.ceil(remaining))} 分钟`;
}

/** 「稍后 5 分钟」只在到阈值、未免打扰、没在稍后的状态出现 */
export function canSnooze(settings, runtime, now = new Date()) {
  if (!settings.enabled || !runtime.sittingSince) return false;
  if (isQuiet(now, settings.quietHours)) return false;
  const snoozed = safeDate(runtime.snoozedUntil);
  if (snoozed && snoozed > now) return false;
  return currentStreakMin(runtime, now.getTime()) >= settings.thresholdMin;
}

function dayLabel(date, offset) {
  if (offset === 0) return '今天';
  if (offset === 1) return '昨天';
  const week = '日一二三四五六'[date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日 周${week}`;
}

/** 最近 7 天（含今天），新→旧；没有记录的日期补 0，保证表格稳定 */
export function recentDays(days = readDays(), now = new Date()) {
  const list = [];
  for (let offset = 0; offset < RECENT_DAYS; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = dateKey(date);
    const day = days[key] ?? emptyDay(key);
    list.push({ ...day, label: dayLabel(date, offset) });
  }
  return list;
}

export function hasAnyData(runtime, today, now = new Date()) {
  if (currentStreakMin(runtime, now.getTime()) > 0) return true;
  if (today.sittingMinutes > 0 || today.breaks > 0) return true;
  return Boolean(safeDate(runtime.lastBreakAt));
}

/** 卡片 / L1 一次读取所需的全部状态 */
export function describeState(settings, now = new Date()) {
  const runtime = readRuntime();
  const days = readDays();
  const today = days[dateKey(now)] ?? emptyDay(dateKey(now));
  const status = statusOf(settings, runtime, now);
  const streak = settings.enabled ? Math.floor(currentStreakMin(runtime, now.getTime())) : 0;
  const lastBreak = safeDate(runtime.lastBreakAt);
  return {
    runtime,
    today,
    status,
    statusLabel: statusLabelOf(status),
    currentMin: streak,
    hint: hintOf(settings, runtime, now),
    lastBreakText: lastBreak ? formatClock(lastBreak) : '—',
    snoozable: canSnooze(settings, runtime, now),
    hasData: hasAnyData(runtime, today, now),
    recentDays: recentDays(days, now),
  };
}

/* ------------------------------------------------------------------ */
/* Agent 工具的数据组装                                                 */
/* ------------------------------------------------------------------ */

export function toolStatus(settings, now = new Date()) {
  const runtime = readRuntime();
  const streak = settings.enabled ? Math.round(currentStreakMin(runtime, now.getTime())) : 0;
  return {
    enabled: settings.enabled,
    status: statusOf(settings, runtime, now),
    statusLabel: statusLabelOf(statusOf(settings, runtime, now)),
    sitting: settings.enabled && Boolean(runtime.sittingSince),
    currentStreakMin: streak,
    thresholdMin: settings.thresholdMin,
    nextReminderMin:
      settings.enabled && runtime.sittingSince
        ? Math.max(0, settings.thresholdMin - Math.round(currentStreakMin(runtime, now.getTime())))
        : null,
    quiet: isQuiet(now, settings.quietHours),
    snoozable: canSnooze(settings, runtime, now),
    snoozedUntil: runtime.snoozedUntil,
    lastBreakAt: runtime.lastBreakAt,
    hint: hintOf(settings, runtime, now),
  };
}

export function toolToday(now = new Date()) {
  const days = readDays();
  const runtime = readRuntime();
  const today = days[dateKey(now)] ?? emptyDay(dateKey(now));
  return {
    ...today,
    lastBreakAt: runtime.lastBreakAt,
    recentDays: recentDays(days, now),
  };
}

/* ------------------------------------------------------------------ */
/* 命令（卡片 / L1 → 引擎，保持单写者）                                 */
/* ------------------------------------------------------------------ */

function sendCommand(type, extra = {}) {
  const command = {
    id: `cmd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    at: new Date().toISOString(),
    ...extra,
  };
  writeJson(COMMAND_KEY, command);
  window.dispatchEvent(new CustomEvent(COMMAND_EVENT, { detail: command }));
  return command;
}

export function sendBreakCommand() {
  return sendCommand('break');
}

export function sendSnoozeCommand(minutes = SNOOZE_MINUTES) {
  return sendCommand('snooze', { minutes });
}

export function onLocalCommand(handler) {
  const listener = (event) => handler(event.detail);
  window.addEventListener(COMMAND_EVENT, listener);
  return () => window.removeEventListener(COMMAND_EVENT, listener);
}

/* ------------------------------------------------------------------ */
/* 引擎锁                                                              */
/* ------------------------------------------------------------------ */

function locksApi() {
  if (typeof navigator === 'undefined') return null;
  const locks = navigator.locks;
  return locks && typeof locks.request === 'function' ? locks : null;
}

/** 抢不到就跳过本次 tick（后台单写者常态；锁被占用说明别的实例正在写） */
async function runIfIdle(task) {
  const locks = locksApi();
  if (!locks) return task();
  let started = false;
  try {
    return await locks.request(ENGINE_LOCK, { ifAvailable: true }, async (lock) => {
      if (!lock) return undefined;
      started = true;
      return task();
    });
  } catch (error) {
    if (started) throw error;
    return task();
  }
}

/** 用户动作（打卡/稍后/工具）排队执行，不丢操作 */
async function runExclusive(task) {
  const locks = locksApi();
  if (!locks) return task();
  let started = false;
  try {
    return await locks.request(ENGINE_LOCK, async () => {
      started = true;
      return task();
    });
  } catch (error) {
    if (started) throw error;
    return task();
  }
}

/* ------------------------------------------------------------------ */
/* 后台引擎                                                            */
/* ------------------------------------------------------------------ */

export class SedentaryEngine {
  constructor() {
    this.running = false;
    this.ticking = false;
    this.timer = 0;
    this.firstTimer = 0;
    this.disposers = [];
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.disposers.push(this.#listen());
    this.firstTimer = window.setTimeout(() => void this.tick(), FIRST_TICK_MS);
    this.timer = window.setInterval(() => void this.tick(), ENGINE_TICK_MS);
  }

  stop() {
    this.running = false;
    window.clearTimeout(this.firstTimer);
    window.clearInterval(this.timer);
    for (const dispose of this.disposers.splice(0)) dispose();
  }

  #listen() {
    const onStorage = (event) => {
      if (event.key !== COMMAND_KEY) return;
      const command = readJson(COMMAND_KEY, null);
      if (command) void this.handleCommand(command);
    };
    window.addEventListener('storage', onStorage);
    const offLocal = onLocalCommand((command) => void this.handleCommand(command));
    return () => {
      window.removeEventListener('storage', onStorage);
      offLocal();
    };
  }

  async handleCommand(command) {
    if (!command || (command.type !== 'break' && command.type !== 'snooze')) return;
    try {
      const notice = await runExclusive(() => this.#applyCommand(command));
      if (notice) plugin.notify(notice);
    } catch (error) {
      // 单次命令失败不能打断后台定时器；warn 不计入 console error 验收
      console.warn('[sedentary] 命令执行失败', error);
    }
  }

  #applyCommand(command) {
    const runtime = readRuntime();
    if (runtime.commandId === command.id) return null;
    runtime.commandId = command.id;
    runtime.lastTickAt = new Date().toISOString();
    writeRuntime(runtime);

    if (command.type === 'snooze') {
      const minutes = clampInt(command.minutes, [1, 60], SNOOZE_MINUTES);
      const next = readRuntime();
      next.snoozedUntil = new Date(Date.now() + minutes * 60000).toISOString();
      next.lastRemindAt = null;
      next.lastRemindMinute = null;
      next.quietSkip = false;
      writeRuntime(next);
      return `${minutes} 分钟后再提醒你`;
    }

    const { day } = this.#takeBreak('manual');
    return `已记录起身，今日共 ${day.breaks} 次`;
  }

  /** 用户动作 / 工具共用：锁内结算一轮，锁外发通知 */
  async takeBreak(source = 'manual') {
    const outcome = await runExclusive(() => this.#takeBreak(source));
    if (outcome) plugin.notify(`已记录起身，今日共 ${outcome.day.breaks} 次`);
    return outcome?.day ?? todayStats(new Date());
  }

  async snooze(minutes = SNOOZE_MINUTES) {
    const value = clampInt(minutes, [1, 60], SNOOZE_MINUTES);
    const outcome = await runExclusive(() => {
      const runtime = readRuntime();
      if (!runtime.sittingSince) return null;
      runtime.snoozedUntil = new Date(Date.now() + value * 60000).toISOString();
      runtime.lastRemindAt = null;
      runtime.lastRemindMinute = null;
      runtime.quietSkip = false;
      writeRuntime(runtime);
      return { minutes: value, snoozedUntil: runtime.snoozedUntil };
    });
    if (outcome) plugin.notify(`${outcome.minutes} 分钟后再提醒你`);
    return outcome;
  }

  async tick() {
    if (!this.running || this.ticking) return;
    this.ticking = true;
    try {
      const plan = await runIfIdle(() => this.#tick());
      if (plan?.remind) await this.#remind(plan.minutes, plan.settings);
    } catch (error) {
      // 单次 tick 失败（宿主 API 异常等）不打断后续定时器
      console.warn('[sedentary] tick 失败', error);
    } finally {
      this.ticking = false;
    }
  }

  #tick() {
    const now = new Date();
    const key = dateKey(now);
    const runtime = readRuntime();
    const days = readDays();
    const day = days[key] ?? emptyDay(key);
    days[key] = day;

    return readSettings().then((settings) => {
      if (!settings.enabled) {
        runtime.sittingSince = null;
        runtime.lastRemindAt = null;
        runtime.lastRemindMinute = null;
        runtime.snoozedUntil = null;
        runtime.quietSkip = false;
        runtime.lastTickAt = now.toISOString();
        writeRuntime(runtime);
        writeDays(trimDays(days));
        return null;
      }

      const lastTick = safeDate(runtime.lastTickAt);
      const deltaMin = lastTick ? Math.max(0, (now - lastTick) / 60000) : 0;

      if (lastTick && deltaMin > CLOCK_JUMP_MINUTES) {
        // 休眠 / 应用退出 / 系统时钟突变：这段空档不计入久坐，也不判起身。
        // 把本轮起点顺延同样的时长，回来后计时仍在原来的进度上继续。
        const since = safeDate(runtime.sittingSince);
        const shiftMs = now.getTime() - lastTick.getTime();
        runtime.sittingSince = since
          ? new Date(since.getTime() + shiftMs).toISOString()
          : now.toISOString();
        runtime.lastTickAt = now.toISOString();
        writeRuntime(runtime);
        writeDays(trimDays(days));
        return null;
      }

      // 连续计时：会话一旦开始就持续累加，直到「我起来了」/ 强提醒确认。
      // 不再依赖键鼠空闲——桌面摆件场景下用户常常只是看着屏幕。
      if (!runtime.sittingSince) runtime.sittingSince = now.toISOString();
      day.sittingMinutes += deltaMin;
      const streak = currentStreakMin(runtime, now.getTime());
      if (streak > day.longestStreakMin) day.longestStreakMin = Math.round(streak);
      runtime.lastTickAt = now.toISOString();
      const plan = this.#claimReminder(now, streak, settings, runtime);
      writeRuntime(runtime);
      writeDays(trimDays(days));
      return plan;
    });
  }

  /**
   * 锁内判定并预占提醒：先写 lastRemindAt / lastRemindMinute 再弹，
   * 弹窗等待用户操作不占锁；其他实例读到的已是“本分钟已提醒”。
   */
  #claimReminder(now, streakMin, settings, runtime) {
    if (streakMin < settings.thresholdMin) {
      runtime.quietSkip = false;
      return null;
    }
    if (isQuiet(now, settings.quietHours)) {
      runtime.quietSkip = true;
      return null;
    }
    const snoozed = safeDate(runtime.snoozedUntil);
    if (snoozed && snoozed > now) return null;

    const minute = minuteKey(now);
    if (runtime.lastRemindMinute === minute) return null;

    const lastRemind = safeDate(runtime.lastRemindAt);
    const everyMs = Math.max(1, settings.remindEveryMin) * 60000;
    const due =
      !lastRemind || now.getTime() - lastRemind.getTime() >= everyMs || runtime.quietSkip;
    if (!due) return null;

    runtime.quietSkip = false;
    runtime.lastRemindAt = now.toISOString();
    runtime.lastRemindMinute = minute;
    runtime.snoozedUntil = null;
    return { remind: true, minutes: Math.round(streakMin), settings };
  }

  async #remind(minutes, settings) {
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
    const actionId = result && typeof result === 'object' ? result.actionId : undefined;
    if (actionId === 'stand') {
      await this.takeBreak('reminder');
    } else if (actionId === 'snooze') {
      await this.snooze(SNOOZE_MINUTES);
    }
  }

  /** 结算本轮、记一次起身；返回今天的 DayStats（调用方负责锁与通知） */
  #takeBreak(source) {
    const now = new Date();
    const key = dateKey(now);
    const days = readDays();
    const day = days[key] ?? emptyDay(key);
    days[key] = day;
    const runtime = readRuntime();
    if (runtime.sittingSince) {
      const streak = currentStreakMin(runtime, now.getTime());
      if (streak > day.longestStreakMin) day.longestStreakMin = Math.round(streak);
    }
    day.breaks += 1;
    // 结算后立刻开始新一轮：按「我起来了」之后计时从 0 继续，
    // 不会出现「刚起身，计时未开始」一直等输入的空窗。
    runtime.sittingSince = now.toISOString();
    runtime.lastRemindAt = null;
    runtime.lastRemindMinute = null;
    runtime.snoozedUntil = null;
    runtime.quietSkip = false;
    runtime.lastBreakAt = now.toISOString();
    runtime.lastTickAt = now.toISOString();
    writeRuntime(runtime);
    writeDays(trimDays(days));
    return { day, source };
  }
}

/* ------------------------------------------------------------------ */
/* 独立开发 / 截图：?demo=1 注入演示数据                                 */
/* ------------------------------------------------------------------ */

export async function seedDemoData() {
  const now = new Date();
  const storedDays = readJson(DAYS_KEY, null);
  if (!storedDays || Object.keys(storedDays).length === 0) {
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    writeDays({
      [dateKey(now)]: { date: dateKey(now), sittingMinutes: 187, longestStreakMin: 52, breaks: 3 },
      [dateKey(yesterday)]: {
        date: dateKey(yesterday),
        sittingMinutes: 312,
        longestStreakMin: 96,
        breaks: 5,
      },
    });
  }
  // 每次 demo 打开都重置当前轮：截图 / 独立尺寸验证拿到稳定的“距提醒还有”
  writeRuntime({
    sittingSince: new Date(now.getTime() - 12 * 60000).toISOString(),
    lastInputAt: now.toISOString(),
    lastRemindAt: null,
    lastRemindMinute: null,
    snoozedUntil: null,
    lastTickAt: now.toISOString(),
    lastBreakAt: new Date(now.getTime() - 96 * 60000).toISOString(),
    quietSkip: false,
    commandId: null,
  });
  // 演示默认关掉免打扰，避免验证时间落在 22:00–08:00 时状态变成“免打扰”
  const settingsKey = `plugin.${plugin.pluginId}.${SETTINGS_KEY}`;
  if (readJson(settingsKey, null) == null) {
    writeJson(settingsKey, { ...DEFAULT_SETTINGS, quietHours: { start: '', end: '' } });
  }
}

/** 引擎单例：隐藏的后台 iframe 里启动；独立开发时卡片视图也复用同一个 */
let sharedEngine = null;
export function getEngine() {
  sharedEngine ??= new SedentaryEngine();
  return sharedEngine;
}
