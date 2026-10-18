/**
 * 久坐提醒插件
 *
 * 规格：docs/components/sedentary.md
 * - manifest `"background": true`：不可见常驻 iframe 每 10 秒轮询 plugin.getIdleSeconds 负责计时；
 *   桌面卡片只读 localStorage 里的状态负责显示与「我起来了」打卡（写命令给引擎）。
 * - 默认 45 分钟阈值 / 10 分钟再催 / 5 分钟空闲算起身；强提醒走 plugin.showReminder。
 * - 免打扰时段内不提醒但继续计时，时段结束立刻补一次；跨零点按当天时段处理。
 * - 今日统计写 sedentary.days；Agent 工具：status / today / takeBreak。
 *
 * 独立打开（开发/截图）：
 *   index.html?size=2x2&demo=1            卡片显示层（独立时自动跑引擎）
 *   index.html?background=1&demo=1        后台引擎仪表盘（宿主里是隐藏 iframe）
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

const SETTINGS_KEY = 'sedentary.settings';
const DAYS_KEY = 'sedentary.days';
const RUNTIME_KEY = 'sedentary.runtime';
const COMMAND_KEY = 'sedentary.command';

const ENGINE_TICK_MS = 10000; // 规格：每 10 秒轮询一次
const ACTIVE_IDLE_SECONDS = 60; // 规格：idle < 60 秒算有输入
const SNOOZE_MINUTES = 5; // 强提醒的「稍后 5 分钟」
const LONG_PRESS_MS = 500; // DESIGN.md 长按阈值

const DEFAULT_SETTINGS = {
  enabled: true,
  thresholdMin: 45,
  remindEveryMin: 10,
  idleResetMin: 5,
  strongReminder: true,
  quietHours: null,
};

const DEFAULT_QUIET = { start: '22:00', end: '08:00' };

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
  app: $('app'),
  statusDot: $('status-dot'),
  streakNum: $('streak-num'),
  statusText: $('status-text'),
  statToday: $('stat-today'),
  statBreaks: $('stat-breaks'),
  breakBtn: $('break-btn'),
  engineView: $('engine-view'),
  engineState: $('engine-state'),
  engineStatus: $('engine-status'),
  engineThreshold: $('engine-threshold'),
  engineToday: $('engine-today'),
  engineBreaks: $('engine-breaks'),
  engineQuiet: $('engine-quiet'),
  engineLastremind: $('engine-lastremind'),
  engineLog: $('engine-log'),
  scrim: $('scrim'),
  detailSheet: $('detail-sheet'),
  detailClose: $('detail-close'),
  detailToday: $('detail-today'),
  detailLongest: $('detail-longest'),
  detailBreaks: $('detail-breaks'),
  detailCurrent: $('detail-current'),
  detailNext: $('detail-next'),
  detailLastbreak: $('detail-lastbreak'),
  detailConfig: $('detail-config'),
  detailBreak: $('detail-break'),
  detailSettings: $('detail-settings'),
  settingsSheet: $('settings-sheet'),
  settingsClose: $('settings-close'),
  setEnabled: $('set-enabled'),
  setThreshold: $('set-threshold'),
  setRemind: $('set-remind'),
  setIdle: $('set-idle'),
  setStrong: $('set-strong'),
  setQuiet: $('set-quiet'),
  setQuietStart: $('set-quiet-start'),
  setQuietEnd: $('set-quiet-end'),
  quietTimes: $('quiet-times'),
};

/* ------------------------------------------------------------------ */
/* 状态                                                                */
/* ------------------------------------------------------------------ */

const params = new URLSearchParams(location.search);
const state = {
  size: resolveSize(),
  sizeFromUrl: sizeFromUrl(),
  mode: detectMode(),
  engineActive: false,
  panel: null,
  log: [],
  lastPressTimer: 0,
  suppressClick: false,
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
    /* 内存态继续 */
  }
}

const pad2 = (n) => String(n).padStart(2, '0');

function motionMs(name, fallback = 200) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^([\d.]+)ms$/.exec(raw);
  return match ? Number(match[1]) : fallback;
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatClock(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function safeDate(value) {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizePositiveInt(value, fallback) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return number;
}

/* ------------------------------------------------------------------ */
/* 数据读写                                                            */
/* ------------------------------------------------------------------ */

function loadSettings() {
  const stored = readJSON(SETTINGS_KEY, null);
  const settings = { ...DEFAULT_SETTINGS, ...(stored && typeof stored === 'object' ? stored : {}) };
  settings.enabled = Boolean(settings.enabled);
  settings.thresholdMin = normalizePositiveInt(settings.thresholdMin, DEFAULT_SETTINGS.thresholdMin);
  settings.remindEveryMin = normalizePositiveInt(settings.remindEveryMin, DEFAULT_SETTINGS.remindEveryMin);
  settings.idleResetMin = normalizePositiveInt(settings.idleResetMin, DEFAULT_SETTINGS.idleResetMin);
  settings.strongReminder = Boolean(settings.strongReminder);
  const quiet = settings.quietHours;
  if (quiet && typeof quiet === 'object' && /^\d{2}:\d{2}$/.test(quiet.start) && /^\d{2}:\d{2}$/.test(quiet.end)) {
    settings.quietHours = { start: quiet.start, end: quiet.end };
  } else {
    settings.quietHours = null;
  }
  return settings;
}

function saveSettings(patch) {
  const settings = { ...loadSettings(), ...patch };
  writeJSON(SETTINGS_KEY, settings);
  plugin.setConfig(SETTINGS_KEY, settings);
  syncSettingsControls();
  render();
  updateEngineView();
}

function loadDays() {
  const stored = readJSON(DAYS_KEY, null);
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
  const days = {};
  for (const [key, value] of Object.entries(stored)) {
    if (!value || typeof value !== 'object') continue;
    days[key] = {
      date: typeof value.date === 'string' ? value.date : key,
      sittingMinutes: Math.max(0, Number(value.sittingMinutes) || 0),
      longestStreakMin: Math.max(0, Number(value.longestStreakMin) || 0),
      breaks: Math.max(0, Math.round(Number(value.breaks) || 0)),
    };
  }
  return days;
}

function saveDays(days) {
  writeJSON(DAYS_KEY, days);
}

function loadRuntime() {
  const stored = readJSON(RUNTIME_KEY, null);
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

function saveRuntime(runtime) {
  writeJSON(RUNTIME_KEY, runtime);
}

function ensureDay(now = new Date()) {
  const days = loadDays();
  const key = dateKey(now);
  if (!days[key]) {
    days[key] = { date: key, sittingMinutes: 0, longestStreakMin: 0, breaks: 0 };
    saveDays(days);
  }
  return days[key];
}

function todayStats(now = new Date()) {
  const days = loadDays();
  return days[dateKey(now)] ?? { date: dateKey(now), sittingMinutes: 0, longestStreakMin: 0, breaks: 0 };
}

/* ------------------------------------------------------------------ */
/* 判定逻辑                                                            */
/* ------------------------------------------------------------------ */

function currentStreakMin(runtime, now = Date.now()) {
  const since = safeDate(runtime.sittingSince);
  if (!since) return 0;
  return Math.max(0, (now - since.getTime()) / 60000);
}

function isQuiet(now, quietHours) {
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

function statusOf(settings, runtime, now = new Date()) {
  if (!settings.enabled) return 'off';
  if (isQuiet(now, settings.quietHours)) return 'quiet';
  const streak = currentStreakMin(runtime, now.getTime());
  if (streak >= settings.thresholdMin) return 'danger';
  if (streak >= settings.thresholdMin * 0.6) return 'warning';
  return 'success';
}

function statusTextOf(settings, runtime, now = new Date()) {
  const status = statusOf(settings, runtime, now);
  const streak = Math.floor(currentStreakMin(runtime, now.getTime()));
  if (status === 'off') return '久坐提醒已关闭';
  if (status === 'quiet') {
    return runtime.sittingSince
      ? `免打扰时段 · 已连续 ${streak} 分钟`
      : '免打扰时段';
  }
  const snoozed = safeDate(runtime.snoozedUntil);
  if (snoozed && snoozed > now) {
    return `提醒已推迟，${Math.ceil((snoozed.getTime() - now.getTime()) / 60000)} 分钟后再说`;
  }
  if (!runtime.sittingSince) return '刚起身，久坐计时还没开始';
  if (status === 'danger') return `已连续坐 ${streak} 分钟，该起来活动了`;
  if (status === 'warning') return `已连续坐 ${streak} 分钟，快到提醒阈值`;
  return `已连续坐 ${streak} 分钟`;
}

function nextReminderText(settings, runtime, now = new Date()) {
  if (!settings.enabled) return '—';
  if (isQuiet(now, settings.quietHours)) return '免打扰中';
  const snoozed = safeDate(runtime.snoozedUntil);
  if (snoozed && snoozed > now) return `稍后 ${Math.ceil((snoozed.getTime() - now.getTime()) / 60000)} 分钟`;
  if (!runtime.sittingSince) return '—';
  const streak = currentStreakMin(runtime, now.getTime());
  const remaining = settings.thresholdMin - streak;
  if (remaining <= 0) return '已到提醒点';
  return `约 ${Math.max(1, Math.ceil(remaining))} 分钟`;
}

/* ------------------------------------------------------------------ */
/* 引擎                                                                */
/* ------------------------------------------------------------------ */

let engineTimer = 0;

function log(line) {
  state.log.push(`${formatClock(new Date())}  ${line}`);
  if (state.log.length > 20) state.log.shift();
  updateEngineLog();
}

function updateEngineLog() {
  if (state.mode !== 'background' || plugin.inHost) return;
  els.engineLog.textContent = '';
  for (const line of state.log.slice(-6)) {
    const item = document.createElement('div');
    item.className = 'log-line';
    item.textContent = line;
    els.engineLog.append(item);
  }
}

function startEngine() {
  if (state.engineActive) return;
  state.engineActive = true;
  log('后台引擎启动（每 10 秒轮询 getIdleSeconds）');
  window.setTimeout(() => void engineTick(), 500);
  engineTimer = window.setInterval(() => void engineTick(), ENGINE_TICK_MS);
  updateEngineView();
}

function stopEngine() {
  if (!state.engineActive) return;
  state.engineActive = false;
  window.clearInterval(engineTimer);
  engineTimer = 0;
}

async function engineTick() {
  if (!state.engineActive) return;
  const now = new Date();
  const settings = loadSettings();
  const days = loadDays();
  const runtime = loadRuntime();
  const day = days[dateKey(now)] ?? { date: dateKey(now), sittingMinutes: 0, longestStreakMin: 0, breaks: 0 };
  days[dateKey(now)] = day;

  if (!settings.enabled) {
    runtime.sittingSince = null;
    runtime.lastRemindAt = null;
    runtime.snoozedUntil = null;
    runtime.lastTickAt = now.toISOString();
    saveRuntime(runtime);
    saveDays(days);
    render();
    updateEngineView();
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
      log('开始新一轮久坐计时');
    }
    day.sittingMinutes += deltaMin;
    const streak = currentStreakMin(runtime, now.getTime());
    if (streak > day.longestStreakMin) day.longestStreakMin = Math.round(streak);
    runtime.lastInputAt = now.toISOString();
    runtime.lastTickAt = now.toISOString();
    saveRuntime(runtime);
    saveDays(days);
    await maybeRemind(now, streak);
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
      log(`检测到起身（空闲 ${Math.round(idleSeconds / 60)} 分钟），今日第 ${day.breaks} 次`);
    }
    runtime.lastTickAt = now.toISOString();
    saveRuntime(runtime);
    saveDays(days);
  } else {
    runtime.lastTickAt = now.toISOString();
    saveRuntime(runtime);
  }

  render();
  updateEngineView();
}

async function maybeRemind(now, streakMin) {
  const settings = loadSettings();
  const runtime = loadRuntime();
  if (streakMin < settings.thresholdMin) {
    runtime.quietSkip = false;
    saveRuntime(runtime);
    return;
  }
  if (isQuiet(now, settings.quietHours)) {
    runtime.quietSkip = true;
    saveRuntime(runtime);
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
  saveRuntime(runtime);
  await remind(Math.round(streakMin), settings);
}

async function remind(minutes, settings) {
  log(`触发提醒（已连续 ${minutes} 分钟）`);
  if (!settings.strongReminder) {
    plugin.notify(`该起来动一动了：已连续坐 ${minutes} 分钟`);
    render();
    updateEngineView();
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
    takeBreak('reminder');
  } else if (result?.actionId === 'snooze') {
    const runtime = loadRuntime();
    runtime.snoozedUntil = new Date(Date.now() + SNOOZE_MINUTES * 60000).toISOString();
    saveRuntime(runtime);
    log(`${SNOOZE_MINUTES} 分钟后再提醒`);
    render();
    updateEngineView();
  } else {
    log('提醒 30 秒无操作，自动收起');
  }
}

function takeBreak(source = 'manual') {
  const now = new Date();
  const days = loadDays();
  const day = days[dateKey(now)] ?? { date: dateKey(now), sittingMinutes: 0, longestStreakMin: 0, breaks: 0 };
  days[dateKey(now)] = day;
  const runtime = loadRuntime();
  if (runtime.sittingSince) {
    const streak = currentStreakMin(runtime, now.getTime());
    if (streak > day.longestStreakMin) day.longestStreakMin = Math.round(streak);
    day.breaks += 1;
    log(`记录起身（${source}，本轮已坐 ${Math.round(streak)} 分钟）`);
  } else {
    log(`记录起身（${source}）`);
  }
  runtime.sittingSince = null;
  runtime.lastRemindAt = null;
  runtime.snoozedUntil = null;
  runtime.quietSkip = false;
  runtime.lastBreakAt = now.toISOString();
  runtime.lastTickAt = now.toISOString();
  saveRuntime(runtime);
  saveDays(days);
  plugin.notify(`已记录起身，今日共 ${day.breaks} 次`);
  render();
  updateEngineView();
  return todayStats(now);
}

/* ------------------------------------------------------------------ */
/* 卡片渲染                                                            */
/* ------------------------------------------------------------------ */

function applySize(size) {
  state.size = size;
  document.documentElement.dataset.size = size[0] + 'x' + size[1];
}

function render() {
  const now = new Date();
  const settings = loadSettings();
  const runtime = loadRuntime();
  const today = todayStats(now);
  const status = statusOf(settings, runtime, now);
  const streak = Math.floor(currentStreakMin(runtime, now.getTime()));

  document.body.dataset.status = status === 'quiet' ? 'off' : status;
  for (const name of ['warning', 'danger', 'off']) els.statusDot.classList.remove(name);
  if (status === 'warning') els.statusDot.classList.add('warning');
  else if (status === 'danger') els.statusDot.classList.add('danger');
  else if (status === 'off' || status === 'quiet') els.statusDot.classList.add('off');

  els.streakNum.textContent = String(streak);
  els.statusText.textContent = statusTextOf(settings, runtime, now);
  els.statToday.textContent = `${Math.round(today.sittingMinutes)} 分钟`;
  els.statBreaks.textContent = `${today.breaks} 次`;

  // 详情里才显示完整统计
  const lastBreak = safeDate(runtime.lastBreakAt);
  els.detailToday.textContent = `${Math.round(today.sittingMinutes)} 分钟`;
  els.detailLongest.textContent = `${Math.round(today.longestStreakMin)} 分钟`;
  els.detailBreaks.textContent = `${today.breaks} 次`;
  els.detailCurrent.textContent = `${streak} 分钟`;
  els.detailNext.textContent = nextReminderText(settings, runtime, now);
  els.detailLastbreak.textContent = lastBreak ? formatClock(lastBreak) : '—';
  els.detailConfig.textContent = `提醒阈值 ${settings.thresholdMin} 分钟 · 免打扰 ${
    settings.quietHours ? `${settings.quietHours.start}–${settings.quietHours.end}` : '关'
  }`;

  const isCompact = (state.size[0] === 1 && state.size[1] === 1) || (state.size[0] === 2 && state.size[1] === 1);
  els.app.setAttribute(
    'aria-label',
    `${statusTextOf(settings, runtime, now)}，${isCompact ? '点击打卡我起来了' : '点击查看久坐详情'}，长按查看详情`,
  );
}

/* ------------------------------------------------------------------ */
/* 后台仪表盘                                                          */
/* ------------------------------------------------------------------ */

const STATUS_LABELS = {
  success: '正常',
  warning: '接近阈值',
  danger: '已超阈值',
  quiet: '免打扰',
  off: '已关闭',
};

function updateEngineView() {
  if (state.mode !== 'background' || plugin.inHost) return;
  const now = new Date();
  const settings = loadSettings();
  const runtime = loadRuntime();
  const today = todayStats(now);
  const streak = Math.floor(currentStreakMin(runtime, now.getTime()));
  const status = statusOf(settings, runtime, now);
  els.engineState.textContent = settings.enabled ? '运行中' : '已暂停';
  els.engineState.classList.toggle('is-off', !settings.enabled);
  els.engineStatus.textContent = !settings.enabled
    ? '已关闭'
    : runtime.sittingSince
      ? `已连续 ${streak} 分钟 · ${STATUS_LABELS[status] ?? status}`
      : '刚起身，未开始新一轮';
  els.engineThreshold.textContent = `${settings.thresholdMin} 分钟`;
  els.engineToday.textContent = `${Math.round(today.sittingMinutes)} 分钟`;
  els.engineBreaks.textContent = `${today.breaks} 次`;
  els.engineQuiet.textContent = settings.quietHours ? `${settings.quietHours.start}–${settings.quietHours.end}` : '关';
  els.engineLastremind.textContent = runtime.lastRemindAt ? formatClock(new Date(runtime.lastRemindAt)) : '—';
  updateEngineLog();
}

/* ------------------------------------------------------------------ */
/* 命令（卡片 → 引擎）                                                  */
/* ------------------------------------------------------------------ */

function sendCommand(type) {
  const command = {
    id: `cmd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    at: new Date().toISOString(),
  };
  writeJSON(COMMAND_KEY, command);
  if (state.engineActive) {
    handleCommand(command);
  }
  render();
}

function handleCommand(command) {
  if (!command || command.type !== 'break') return;
  const runtime = loadRuntime();
  if (runtime.commandId === command.id) return;
  runtime.commandId = command.id;
  saveRuntime(runtime);
  takeBreak('manual');
}

/* ------------------------------------------------------------------ */
/* 设置面板                                                            */
/* ------------------------------------------------------------------ */

function syncSettingsControls() {
  const settings = loadSettings();
  els.setEnabled.checked = settings.enabled;
  els.setThreshold.value = String(settings.thresholdMin);
  els.setRemind.value = String(settings.remindEveryMin);
  els.setIdle.value = String(settings.idleResetMin);
  els.setStrong.checked = settings.strongReminder;
  els.setQuiet.checked = Boolean(settings.quietHours);
  els.setQuietStart.value = settings.quietHours?.start ?? DEFAULT_QUIET.start;
  els.setQuietEnd.value = settings.quietHours?.end ?? DEFAULT_QUIET.end;
  els.quietTimes.classList.toggle('is-disabled', !settings.quietHours);
}

const sheets = { detail: els.detailSheet, settings: els.settingsSheet };

function openPanel(name) {
  if (state.panel === name || !sheets[name]) return;
  if (state.panel) {
    const previous = sheets[state.panel];
    previous.classList.remove('is-open');
    previous.hidden = true;
  }
  state.panel = name;
  const sheet = sheets[name];
  document.body.classList.add('sheet-open');
  if (name === 'settings') syncSettingsControls();
  els.scrim.hidden = false;
  sheet.hidden = false;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.scrim.classList.add('is-open');
      sheet.classList.add('is-open');
    });
  });
  window.setTimeout(() => {
    (name === 'settings' ? els.settingsClose : els.detailClose).focus({ preventScroll: true });
  }, 30);
}

function closePanel() {
  if (!state.panel) return;
  const name = state.panel;
  const sheet = sheets[name];
  state.panel = null;
  document.body.classList.remove('sheet-open');
  els.scrim.classList.remove('is-open');
  sheet.classList.remove('is-open');
  window.setTimeout(() => {
    if (state.panel) return;
    sheet.hidden = true;
    els.scrim.hidden = true;
  }, motionMs('--durationNormal') + 20);
  els.app.focus({ preventScroll: true });
}

function openSettings() {
  openPanel('settings');
}

function closeSettings() {
  closePanel();
}

/* ------------------------------------------------------------------ */
/* 交互                                                               */
/* ------------------------------------------------------------------ */

function wireNumber(input, key) {
  input.addEventListener('change', () => {
    const value = normalizePositiveInt(input.value, loadSettings()[key]);
    input.value = String(value);
    saveSettings({ [key]: value });
  });
}

wireNumber(els.setThreshold, 'thresholdMin');
wireNumber(els.setRemind, 'remindEveryMin');
wireNumber(els.setIdle, 'idleResetMin');

els.setEnabled.addEventListener('change', () => saveSettings({ enabled: els.setEnabled.checked }));
els.setStrong.addEventListener('change', () => saveSettings({ strongReminder: els.setStrong.checked }));
els.setQuiet.addEventListener('change', () => {
  const quietHours = els.setQuiet.checked
    ? { start: els.setQuietStart.value || DEFAULT_QUIET.start, end: els.setQuietEnd.value || DEFAULT_QUIET.end }
    : null;
  saveSettings({ quietHours });
});
els.setQuietStart.addEventListener('change', () => {
  if (!els.setQuiet.checked) return;
  saveSettings({ quietHours: { start: els.setQuietStart.value || DEFAULT_QUIET.start, end: els.setQuietEnd.value || DEFAULT_QUIET.end } });
});
els.setQuietEnd.addEventListener('change', () => {
  if (!els.setQuiet.checked) return;
  saveSettings({ quietHours: { start: els.setQuietStart.value || DEFAULT_QUIET.start, end: els.setQuietEnd.value || DEFAULT_QUIET.end } });
});

function isCompactSize() {
  return (state.size[0] === 1 && state.size[1] === 1) || (state.size[0] === 2 && state.size[1] === 1);
}

function primaryAction() {
  if (isCompactSize()) {
    // 1×1 / 2×1 没有按钮：点击卡片就是主操作（打卡）
    sendCommand('break');
  } else {
    openPanel('detail');
  }
}

els.breakBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  sendCommand('break');
});

els.detailBreak.addEventListener('click', () => {
  sendCommand('break');
  closePanel();
});
els.detailSettings.addEventListener('click', () => openPanel('settings'));
els.detailClose.addEventListener('click', closePanel);
els.settingsClose.addEventListener('click', closeSettings);
els.scrim.addEventListener('click', closePanel);

// 长按 = 详情（统计/设置都在里面），正常模式不出现齿轮
function startPress(event) {
  if (state.panel) return;
  if (event.target.closest?.('.btn, .sheet')) return;
  state.suppressClick = false;
  window.clearTimeout(state.lastPressTimer);
  state.lastPressTimer = window.setTimeout(() => {
    state.suppressClick = true;
    openPanel('detail');
  }, LONG_PRESS_MS);
}

function clearPress() {
  window.clearTimeout(state.lastPressTimer);
  state.lastPressTimer = 0;
}

els.app.addEventListener('pointerdown', startPress);
for (const name of ['pointerup', 'pointercancel', 'pointerleave']) els.app.addEventListener(name, clearPress);

els.app.addEventListener('click', (event) => {
  if (event.target.closest?.('.btn')) return;
  if (state.panel) return;
  if (state.suppressClick) {
    state.suppressClick = false;
    return;
  }
  primaryAction();
});

els.app.addEventListener('keydown', (event) => {
  if (event.target !== els.app) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    primaryAction();
  } else if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
    event.preventDefault();
    openPanel('detail');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (state.panel) {
    event.preventDefault();
    closePanel();
  } else {
    plugin.exitFocus();
  }
});

/* ------------------------------------------------------------------ */
/* Agent 工具                                                          */
/* ------------------------------------------------------------------ */

const TOOLS = [
  {
    name: 'sedentary.status',
    description: '读取久坐状态：是否在久坐、当前连续分钟、阈值、距提醒还有多久',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.today',
    description: '读取今日累计久坐、最长连续与起身次数',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.takeBreak',
    description: '结算本轮久坐并记一次起身，返回今日统计',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
];

function toolStatus() {
  const now = new Date();
  const settings = loadSettings();
  const runtime = loadRuntime();
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

function toolToday() {
  return todayStats(new Date());
}

function toolTakeBreak() {
  if (state.engineActive) {
    return { today: takeBreak('agent'), status: toolStatus() };
  }
  // 卡片层没有引擎：写命令交给后台 iframe 执行
  sendCommand('break');
  return { queued: true, today: todayStats(new Date()), status: toolStatus() };
}

plugin.onToolCall((message) => {
  if (!message || typeof message.name !== 'string') return;
  const { id, name } = message;
  try {
    switch (name) {
      case 'sedentary.status':
        plugin.toolResult(id, true, toolStatus());
        break;
      case 'sedentary.today':
        plugin.toolResult(id, true, toolToday());
        break;
      case 'sedentary.takeBreak':
        plugin.toolResult(id, true, toolTakeBreak());
        break;
      default:
        plugin.toolResult(id, false, `未知工具：${name}`);
    }
  } catch (error) {
    plugin.toolResult(id, false, error instanceof Error ? error.message : String(error));
  }
});

/* ------------------------------------------------------------------ */
/* 尺寸 / 主题 / 模式                                                   */
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
  const raw = params.get('size');
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

function detectMode() {
  const widget = params.get('widget') || '';
  if (params.get('background') === '1' || widget.includes('background')) return 'background';
  return 'tile';
}

function setMode(mode) {
  state.mode = mode;
  if (mode === 'background') {
    els.app.hidden = true;
    if (plugin.inHost) {
      document.body.classList.add('is-hidden');
      els.engineView.hidden = true;
    } else {
      document.body.classList.remove('is-hidden');
      els.engineView.hidden = false;
      updateEngineView();
    }
    startEngine();
  } else {
    els.app.hidden = false;
    els.engineView.hidden = true;
    if (!plugin.inHost) startEngine();
    render();
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
  if (readJSON(DAYS_KEY, null)) return;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  writeJSON(DAYS_KEY, {
    [dateKey(now)]: { date: dateKey(now), sittingMinutes: 187, longestStreakMin: 52, breaks: 3 },
    [dateKey(yesterday)]: { date: dateKey(yesterday), sittingMinutes: 312, longestStreakMin: 96, breaks: 5 },
  });
  writeJSON(RUNTIME_KEY, {
    sittingSince: new Date(now.getTime() - 52 * 60000).toISOString(),
    lastInputAt: now.toISOString(),
    // 默认演示里刚提醒过，避免截图时弹出强提醒；demoRemind=1 时改成 11 分钟前，用于验证提醒链路
    lastRemindAt:
      params.get('demoRemind') === '1'
        ? new Date(now.getTime() - 11 * 60000).toISOString()
        : now.toISOString(),
    snoozedUntil: null,
    lastTickAt: now.toISOString(),
    lastBreakAt: new Date(now.getTime() - 96 * 60000).toISOString(),
    quietSkip: false,
    commandId: null,
  });
}

/* ------------------------------------------------------------------ */
/* 启动 / 生命周期                                                     */
/* ------------------------------------------------------------------ */

let tileTimer = 0;

function boot() {
  applySize(state.size);
  setMode(state.mode);
  syncSettingsControls();
  render();
  if (!plugin.inHost && state.mode === 'tile') {
    window.setInterval(() => render(), 1000);
  }
  updateEngineView();
}

// 其它 iframe（后台引擎 / 卡片）改状态时的跨文档同步
window.addEventListener('storage', (event) => {
  if (event.key === SETTINGS_KEY) {
    syncSettingsControls();
    render();
    updateEngineView();
  } else if (event.key === COMMAND_KEY) {
    const command = readJSON(COMMAND_KEY, null);
    if (command && state.engineActive) handleCommand(command);
  } else if (event.key === RUNTIME_KEY || event.key === DAYS_KEY) {
    render();
    updateEngineView();
  }
});

// ?demo=1 是给开发/截图用的显式开关（宿主不会带这个参数）
if (params.get('demo') === '1') seedDemo();
if (!plugin.inHost) document.body.classList.add('is-standalone');

plugin.ready(TOOLS);

plugin.onInit((payload) => {
  if (payload?.theme) applyTheme(payload.theme);
  const patch = applyInitConfig(payload?.config);
  if (patch) {
    const settings = { ...loadSettings(), ...patch };
    writeJSON(SETTINGS_KEY, settings);
  } else if (plugin.inHost) {
    plugin.getConfig(SETTINGS_KEY).then((stored) => {
      if (stored && typeof stored === 'object') {
        writeJSON(SETTINGS_KEY, { ...loadSettings(), ...stored });
        syncSettingsControls();
        render();
      }
    });
  }
  if (!state.sizeFromUrl && Array.isArray(payload?.size)) {
    applySize(pickSize(Number(payload.size[0]), Number(payload.size[1])));
  }
  if (typeof payload?.widgetId === 'string' && payload.widgetId.includes('background')) {
    setMode('background');
  }
  syncSettingsControls();
  render();
});

plugin.onResize((size) => {
  if (state.sizeFromUrl || !Array.isArray(size)) return;
  applySize(pickSize(Number(size[0]), Number(size[1])));
  render();
});

plugin.onTheme((theme) => applyTheme(theme));

plugin.onFocus(() => {
  els.app.focus({ preventScroll: true });
});

window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  if (event.data?.type === 'host:open-settings') openSettings();
});

// 卡片是可点击区域
els.app.tabIndex = 0;
els.app.setAttribute('role', 'button');

boot();

if (!plugin.inHost) {
  if (state.mode === 'tile' && params.get('settings') === '1') openSettings();
  else if (state.mode === 'tile' && params.get('detail') === '1') openPanel('detail');
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) render();
});
