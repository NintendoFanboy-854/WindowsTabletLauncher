/**
 * 久坐提醒数据层（纯 JS，不依赖 React）。
 *
 * 状态机：`sitting`（久坐计时）↔ `standing`（起身休息），全部手动切换：
 * - 坐着时点「我站起来了」：结算本轮久坐（breaks +1、更新最长连续），进入站立；
 * - 站立时点「我坐下了」：结算站立时长，回到坐着并开新一轮久坐；
 * - 没有自动判定（不碰键鼠空闲、不碰摄像头）；站立多久由用户自己按。
 *
 * - `background: true` 的隐藏 iframe 里跑 `SedentaryEngine`，每 10 秒 tick 一次，
 *   是 `sedentary.runtime` / `sedentary.days` 的唯一写者；隐藏 iframe 的定时器可能被
 *   浏览器节流到约 60 秒，时长按 tick 时间戳增量累加，不依赖 tick 间隔。
 * - 久坐只累计 `sitting` 的时间，站立时长单独累计到 `standingMinutes`。
 * - 卡片与 L1 详情只读这两个 key 并订阅 storage 事件（跨 iframe 同步），
 *   「我站起来了 / 我坐下了 / 稍后 5 分钟」通过 `sedentary.command` 交给引擎执行。
 * - 每个引擎 tick、命令与工具写操作都套 `navigator.locks`（`wtsl.sedentary.engine`），
 *   锁不可用时退回单实例执行；提醒另记 `lastRemindMinute` 做分钟级去重。
 * - 设置只来自宿主配置 `plugin.sedentary.settings`（manifest settings schema）。
 *
 * 存储键与结构沿用 docs/components/sedentary.md：
 *   sedentary.days    { [YYYY-MM-DD]: { date, sittingMinutes, standingMinutes,
 *                                       longestStreakMin, breaks } }
 *   sedentary.runtime { posture: 'sitting'|'standing'|null, postureSince,
 *                       lastRemindAt, lastRemindMinute, snoozedUntil,
 *                       lastTickAt, lastBreakAt, commandId }
 *   sedentary.command { id, type: 'stand'|'sit'|'snooze', at, minutes? }
 */

import { plugin } from '/plugin-sdk.js';

export const SETTINGS_KEY = 'settings';
export const DAYS_KEY = 'sedentary.days';
export const RUNTIME_KEY = 'sedentary.runtime';
export const COMMAND_KEY = 'sedentary.command';

/** 后台每 10 秒轮询一次 */
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

/** manifest.settings 的默认值；schema 的 default 必须与此保持一致 */
export const DEFAULT_SETTINGS = Object.freeze({
  enabled: true,
  thresholdMin: 45,
  remindEveryMin: 10,
  strongReminder: true,
});

const NUMBER_LIMITS = {
  thresholdMin: [5, 120],
  remindEveryMin: [1, 60],
};

const STATUS_LABELS = {
  success: '正常',
  warning: '接近阈值',
  danger: '已超阈值',
  resting: '站立休息',
  off: '已关闭',
};

export const POSTURE_LABELS = {
  sitting: '坐着',
  standing: '站立',
};

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

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
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

function roundMinutes(value) {
  return Math.round(value * 10) / 10;
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
  return next;
}

/** 去掉旧配置里已经废弃的字段（免打扰时段），其余未知字段保留 */
function stripLegacySettings(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const next = { ...raw };
  delete next.quietHours;
  return next;
}

/**
 * 旧配置迁移：收敛越界数字，删掉已废弃的 quietHours，同时保留 schema 之外的未知字段。
 * 只在确实有差异时写回。
 */
export async function migrateSettings() {
  let raw = null;
  try {
    raw = await plugin.getConfig(SETTINGS_KEY);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const next = { ...stripLegacySettings(raw), ...normalizeSettings(raw) };
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
  const stored = { ...stripLegacySettings(raw), ...merged };
  try {
    await plugin.setConfig(SETTINGS_KEY, stored);
  } catch {
    /* 宿主不可用时保持返回值，调用方拿到的仍是规范化后的设置 */
  }
  return merged;
}

/* ------------------------------------------------------------------ */
/* 日统计 / runtime 读写                                                */
/* ------------------------------------------------------------------ */

function normalizeDay(key, value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    date: key,
    sittingMinutes: nonNegative(source.sittingMinutes),
    standingMinutes: nonNegative(source.standingMinutes),
    longestStreakMin: nonNegative(source.longestStreakMin),
    breaks: Math.round(nonNegative(source.breaks)),
  };
}

function emptyDay(key) {
  return { date: key, sittingMinutes: 0, standingMinutes: 0, longestStreakMin: 0, breaks: 0 };
}

function ensureDay(days, key) {
  if (!days[key]) days[key] = emptyDay(key);
  return days[key];
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
  // 旧版本只有 sittingSince：迁移成「坐着」状态，历史时间不丢。
  const legacySince = typeof runtime.sittingSince === 'string' ? runtime.sittingSince : null;
  const posture =
    runtime.posture === 'sitting' || runtime.posture === 'standing'
      ? runtime.posture
      : legacySince
        ? 'sitting'
        : null;
  const postureSince =
    typeof runtime.postureSince === 'string'
      ? runtime.postureSince
      : posture === 'sitting'
        ? legacySince
        : null;
  return {
    posture,
    postureSince: safeDate(postureSince) ? postureSince : null,
    lastRemindAt: typeof runtime.lastRemindAt === 'string' ? runtime.lastRemindAt : null,
    lastRemindMinute:
      typeof runtime.lastRemindMinute === 'string' ? runtime.lastRemindMinute : null,
    snoozedUntil: typeof runtime.snoozedUntil === 'string' ? runtime.snoozedUntil : null,
    lastTickAt: typeof runtime.lastTickAt === 'string' ? runtime.lastTickAt : null,
    lastBreakAt: typeof runtime.lastBreakAt === 'string' ? runtime.lastBreakAt : null,
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

/* ------------------------------------------------------------------ */
/* 时长累计                                                            */
/* ------------------------------------------------------------------ */

/** 把 [start, end) 按当前姿态累计到日统计；跨零点会拆到两天。 */
function accrue(days, start, end, posture) {
  if (!(start instanceof Date) || !(end instanceof Date)) return;
  if (end.getTime() <= start.getTime()) return;
  let cursor = start;
  while (cursor.getTime() < end.getTime()) {
    const key = dateKey(cursor);
    const midnight = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    const segmentEnd = midnight.getTime() < end.getTime() ? midnight : end;
    const minutes = (segmentEnd.getTime() - cursor.getTime()) / 60000;
    if (minutes > 0) {
      const day = ensureDay(days, key);
      if (posture === 'sitting') day.sittingMinutes += minutes;
      else if (posture === 'standing') day.standingMinutes += minutes;
    }
    cursor = segmentEnd;
  }
}

/** 坐着时更新当天最长连续坐姿（按本轮起点计算）。 */
function bumpLongestStreak(days, posture, since, now) {
  if (posture !== 'sitting' || !(since instanceof Date)) return;
  const minutes = Math.max(0, (now.getTime() - since.getTime()) / 60000);
  if (minutes <= 0) return;
  const day = ensureDay(days, dateKey(now));
  if (minutes > day.longestStreakMin) day.longestStreakMin = Math.round(minutes);
}

/** 当前姿态已持续的分钟数 */
export function currentPostureMinutes(runtime, nowMs = Date.now()) {
  const since = safeDate(runtime.postureSince);
  if (!since || !runtime.posture) return 0;
  return Math.max(0, (nowMs - since.getTime()) / 60000);
}

/** 本轮连续久坐分钟数；站立时为 0 */
export function currentStreakMin(runtime, nowMs = Date.now()) {
  return runtime.posture === 'sitting' ? currentPostureMinutes(runtime, nowMs) : 0;
}

export function todayStats(now = new Date()) {
  const key = dateKey(now);
  return readDays()[key] ?? emptyDay(key);
}

/* ------------------------------------------------------------------ */
/* 状态 / 文案                                                          */
/* ------------------------------------------------------------------ */

export function statusOf(settings, runtime, now = new Date()) {
  if (!settings.enabled) return 'off';
  if (runtime.posture === 'standing') return 'resting';
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
 */
export function hintOf(settings, runtime, now = new Date()) {
  const status = statusOf(settings, runtime, now);
  if (status === 'off') return '久坐提醒已关闭';
  if (status === 'resting') return '休息中，坐下后开始新一轮';
  const snoozed = safeDate(runtime.snoozedUntil);
  if (snoozed && snoozed > now) return `提醒已推迟到 ${formatClock(snoozed)}`;
  if (!runtime.posture) return '计时准备中';
  const remaining = settings.thresholdMin - currentStreakMin(runtime, now.getTime());
  if (remaining <= 0) return '已超过提醒阈值';
  return `距提醒还有 ${Math.max(1, Math.ceil(remaining))} 分钟`;
}

/** 「稍后 5 分钟」只在坐着、到阈值、没在稍后的状态出现 */
export function canSnooze(settings, runtime, now = new Date()) {
  if (!settings.enabled || runtime.posture !== 'sitting') return false;
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
  if (currentPostureMinutes(runtime, now.getTime()) > 0) return true;
  if (today.sittingMinutes > 0 || today.standingMinutes > 0 || today.breaks > 0) return true;
  return Boolean(safeDate(runtime.lastBreakAt));
}

/** 卡片 / L1 一次读取所需的全部状态 */
export function describeState(settings, now = new Date()) {
  const runtime = readRuntime();
  const days = readDays();
  const today = days[dateKey(now)] ?? emptyDay(dateKey(now));
  const status = statusOf(settings, runtime, now);
  const posture = settings.enabled ? runtime.posture : null;
  const stateMinutes = posture ? currentPostureMinutes(runtime, now.getTime()) : 0;
  const lastBreak = safeDate(runtime.lastBreakAt);
  return {
    runtime,
    today,
    posture,
    postureLabel: posture ? POSTURE_LABELS[posture] : '',
    status,
    statusLabel: statusLabelOf(status),
    currentMin: Math.floor(stateMinutes),
    stateMinutes,
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
  const today = todayStats(now);
  const posture = settings.enabled ? runtime.posture : null;
  const stateMinutes = posture ? currentPostureMinutes(runtime, now.getTime()) : 0;
  const streak = currentStreakMin(runtime, now.getTime());
  return {
    enabled: settings.enabled,
    posture,
    postureLabel: posture ? POSTURE_LABELS[posture] : '未开始',
    status: statusOf(settings, runtime, now),
    statusLabel: statusLabelOf(statusOf(settings, runtime, now)),
    currentStateMin: Math.round(stateMinutes),
    currentStreakMin: Math.round(streak),
    sittingMinutesToday: roundMinutes(today.sittingMinutes),
    standingMinutesToday: roundMinutes(today.standingMinutes),
    breaksToday: today.breaks,
    thresholdMin: settings.thresholdMin,
    nextReminderMin:
      settings.enabled && posture === 'sitting'
        ? Math.max(0, settings.thresholdMin - Math.round(streak))
        : null,
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
    sittingMinutes: roundMinutes(today.sittingMinutes),
    standingMinutes: roundMinutes(today.standingMinutes),
    lastBreakAt: runtime.lastBreakAt,
    recentDays: recentDays(days, now),
  };
}

/** 复盘用：按区间汇总久坐/站立/起身与按天起身次数 */
export function statsForRange(days = readDays(), range = 'today', now = new Date(), from, to) {
  const end = safeDate(to) ?? now;
  let start = safeDate(from);
  if (!start) {
    if (range === 'week') {
      const day = startOfDay(now);
      const offset = (day.getDay() + 6) % 7;
      day.setDate(day.getDate() - offset);
      start = day;
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = startOfDay(now);
    }
  }
  const fromKey = dateKey(start);
  const toKey = dateKey(end);
  let sitting = 0;
  let standing = 0;
  let breaks = 0;
  let longest = 0;
  const byDay = {};
  for (const [key, raw] of Object.entries(days)) {
    if (key < fromKey || key > toKey) continue;
    const day = normalizeDay(key, raw);
    sitting += day.sittingMinutes;
    standing += day.standingMinutes;
    breaks += day.breaks;
    if (day.longestStreakMin > longest) longest = day.longestStreakMin;
    if (day.breaks > 0) byDay[key] = day.breaks;
  }
  return {
    range,
    from: start.toISOString(),
    to: end.toISOString(),
    completed: breaks,
    breaks,
    sittingMinutes: roundMinutes(sitting),
    standingMinutes: roundMinutes(standing),
    longestStreakMin: Math.round(longest),
    byDay,
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

export function sendStandCommand() {
  return sendCommand('stand');
}

export function sendSitCommand() {
  return sendCommand('sit');
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

/** 用户动作（站/坐/稍后）排队执行，不丢操作 */
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
    if (!command) return;
    const type = command.type === 'break' ? 'stand' : command.type;
    if (type !== 'stand' && type !== 'sit' && type !== 'snooze') return;
    try {
      const notice = await runExclusive(() => this.#applyCommand({ ...command, type }));
      if (notice) plugin.notify(notice);
    } catch (error) {
      // 单次命令失败不能打断后台定时器；warn 不计入 console error 验收
      console.warn('[sedentary] 命令执行失败', error);
    }
  }

  #applyCommand(command) {
    const runtime = readRuntime();
    if (runtime.commandId === command.id) return null;
    // 只记 commandId 做去重；不要改 lastTickAt——姿态切换要按上一次 tick 的
    // 时间戳把过渡期的时长补记进去，提前改写会把这段时间丢掉。
    runtime.commandId = command.id;
    writeRuntime(runtime);

    if (command.type === 'snooze') {
      const outcome = this.#applySnooze(command.minutes);
      return outcome ? `${outcome.minutes} 分钟后再提醒你` : null;
    }
    if (command.type === 'sit') {
      const outcome = this.#sit('manual');
      return outcome.changed ? '已坐下，开始新一轮久坐' : '现在已经是坐着了';
    }
    const outcome = this.#stand('manual');
    return outcome.changed ? `已记录起身，今日共 ${outcome.day.breaks} 次` : '现在已经是站立休息';
  }

  /** 用户动作 / 工具共用：锁内切换姿态，锁外发通知 */
  async standUp(source = 'manual') {
    const outcome = await runExclusive(() => this.#stand(source));
    if (outcome.changed) plugin.notify(`已记录起身，今日共 ${outcome.day.breaks} 次`);
    return outcome;
  }

  async sitDown(source = 'manual') {
    const outcome = await runExclusive(() => this.#sit(source));
    if (outcome.changed) plugin.notify('已坐下，开始新一轮久坐');
    return outcome;
  }

  async snooze(minutes = SNOOZE_MINUTES) {
    const outcome = await runExclusive(() => this.#applySnooze(minutes));
    if (outcome) plugin.notify(`${outcome.minutes} 分钟后再提醒你`);
    return outcome;
  }

  /** 锁内实现：只推迟，不通知；仅坐着时有效 */
  #applySnooze(minutes) {
    const value = clampInt(minutes, [1, 60], SNOOZE_MINUTES);
    const runtime = readRuntime();
    if (runtime.posture !== 'sitting') return null;
    runtime.snoozedUntil = new Date(Date.now() + value * 60000).toISOString();
    runtime.lastRemindAt = null;
    runtime.lastRemindMinute = null;
    writeRuntime(runtime);
    return { minutes: value, snoozedUntil: runtime.snoozedUntil };
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
    const runtime = readRuntime();
    const days = readDays();

    return readSettings().then((settings) => {
      if (!settings.enabled) {
        runtime.posture = null;
        runtime.postureSince = null;
        runtime.lastRemindAt = null;
        runtime.lastRemindMinute = null;
        runtime.snoozedUntil = null;
        runtime.lastTickAt = now.toISOString();
        writeRuntime(runtime);
        writeDays(trimDays(days));
        return null;
      }

      const lastTick = safeDate(runtime.lastTickAt);
      const deltaMin = lastTick ? Math.max(0, (now - lastTick) / 60000) : 0;

      if (lastTick && deltaMin > CLOCK_JUMP_MINUTES) {
        // 休眠 / 应用退出 / 系统时钟突变：空档不计入，把当前姿态起点顺延同样的时长
        const since = safeDate(runtime.postureSince);
        if (since) {
          runtime.postureSince = new Date(since.getTime() + (now.getTime() - lastTick.getTime()))
            .toISOString();
        }
        runtime.lastTickAt = now.toISOString();
        writeRuntime(runtime);
        writeDays(trimDays(days));
        return null;
      }

      // 首次运行 / 关闭后重开：默认坐着，开始新一轮
      if (!runtime.posture) {
        runtime.posture = 'sitting';
        runtime.postureSince = now.toISOString();
      }

      const postureSince = safeDate(runtime.postureSince);
      const start = lastTick ?? postureSince ?? now;
      accrue(days, start, now, runtime.posture);
      bumpLongestStreak(days, runtime.posture, postureSince, now);
      runtime.lastTickAt = now.toISOString();

      let plan = null;
      if (runtime.posture === 'sitting') {
        const streak = currentStreakMin(runtime, now.getTime());
        plan = this.#claimReminder(now, streak, settings, runtime);
      }

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
    if (streakMin < settings.thresholdMin) return null;
    const snoozed = safeDate(runtime.snoozedUntil);
    if (snoozed && snoozed > now) return null;

    const minute = minuteKey(now);
    if (runtime.lastRemindMinute === minute) return null;

    const lastRemind = safeDate(runtime.lastRemindAt);
    const everyMs = Math.max(1, settings.remindEveryMin) * 60000;
    const due = !lastRemind || now.getTime() - lastRemind.getTime() >= everyMs;
    if (!due) return null;

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
          { id: 'stand', text: '我站起来了', kind: 'primary' },
          { id: 'snooze', text: '稍后 5 分钟' },
        ],
        autoDismissSec: 30,
      });
    } catch {
      result = null;
    }
    const actionId = result && typeof result === 'object' ? result.actionId : undefined;
    if (actionId === 'stand') {
      await this.standUp('reminder');
    } else if (actionId === 'snooze') {
      await this.snooze(SNOOZE_MINUTES);
    }
  }

  /** 坐着 → 站立：结算本轮久坐，记一次起身，开始记录站立时长 */
  #stand(source) {
    const now = new Date();
    const key = dateKey(now);
    const days = readDays();
    const runtime = readRuntime();
    const day = ensureDay(days, key);

    if (runtime.posture !== 'sitting') {
      writeDays(trimDays(days));
      return { changed: false, day, source };
    }

    const since = safeDate(runtime.postureSince);
    const lastTick = safeDate(runtime.lastTickAt);
    const start = lastTick && since && lastTick > since ? lastTick : (since ?? lastTick ?? now);
    accrue(days, start, now, 'sitting');
    bumpLongestStreak(days, 'sitting', since, now);

    day.breaks += 1;
    runtime.posture = 'standing';
    runtime.postureSince = now.toISOString();
    runtime.lastRemindAt = null;
    runtime.lastRemindMinute = null;
    runtime.snoozedUntil = null;
    runtime.lastBreakAt = now.toISOString();
    runtime.lastTickAt = now.toISOString();
    writeRuntime(runtime);
    writeDays(trimDays(days));
    return { changed: true, day, source };
  }

  /** 站立 → 坐着：结算站立时长，开始新一轮久坐计时 */
  #sit(source) {
    const now = new Date();
    const key = dateKey(now);
    const days = readDays();
    const runtime = readRuntime();
    const day = ensureDay(days, key);

    if (runtime.posture !== 'standing') {
      writeDays(trimDays(days));
      return { changed: false, day, source };
    }

    const since = safeDate(runtime.postureSince);
    const lastTick = safeDate(runtime.lastTickAt);
    const start = lastTick && since && lastTick > since ? lastTick : (since ?? lastTick ?? now);
    accrue(days, start, now, 'standing');

    runtime.posture = 'sitting';
    runtime.postureSince = now.toISOString();
    runtime.lastRemindAt = null;
    runtime.lastRemindMinute = null;
    runtime.snoozedUntil = null;
    runtime.lastTickAt = now.toISOString();
    writeRuntime(runtime);
    writeDays(trimDays(days));
    return { changed: true, day, source };
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
      [dateKey(now)]: {
        date: dateKey(now),
        sittingMinutes: 187,
        standingMinutes: 24,
        longestStreakMin: 52,
        breaks: 3,
      },
      [dateKey(yesterday)]: {
        date: dateKey(yesterday),
        sittingMinutes: 312,
        standingMinutes: 41,
        longestStreakMin: 96,
        breaks: 5,
      },
    });
  }
  // 每次 demo 打开都重置当前轮：截图 / 独立尺寸验证拿到稳定的“距提醒还有”
  writeRuntime({
    posture: 'sitting',
    postureSince: new Date(now.getTime() - 12 * 60000).toISOString(),
    lastRemindAt: null,
    lastRemindMinute: null,
    snoozedUntil: null,
    lastTickAt: now.toISOString(),
    lastBreakAt: new Date(now.getTime() - 96 * 60000).toISOString(),
    commandId: null,
  });
  const settingsKey = `plugin.${plugin.pluginId}.${SETTINGS_KEY}`;
  if (readJson(settingsKey, null) == null) {
    writeJson(settingsKey, { ...DEFAULT_SETTINGS });
  }
}

/** 引擎单例：隐藏的后台 iframe 里启动；独立开发时卡片视图也复用同一个 */
let sharedEngine = null;
export function getEngine() {
  sharedEngine ??= new SedentaryEngine();
  return sharedEngine;
}
