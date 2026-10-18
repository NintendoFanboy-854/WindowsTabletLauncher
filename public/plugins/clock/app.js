/**
 * 时钟插件
 *
 * 规格：docs/components/clock.md
 * - 1×1 只显示 HH:MM；2×1 时间 + 日期；3×2 超大时间 + 日期 + 星期
 * - 点击卡片切换 12 / 24 小时制（即时生效并持久化）
 * - 显示秒默认开（1×1 按规格不显示秒与日期）
 * - 字体/颜色/动效全部走 Fluent token，尺寸用 iframe 视口单位自适应
 * - Agent 工具：clock.now（只读）
 *
 * 与宿主通信全部走 /plugin-sdk.js；脱离宿主单独打开时用本地兜底。
 */
import { plugin } from '/plugin-sdk.js';

/* ------------------------------------------------------------------ */
/* 常量                                                                */
/* ------------------------------------------------------------------ */

const SUPPORTED_SIZES = [
  [1, 1],
  [2, 1],
  [3, 2],
];
const DEFAULT_SIZE = [2, 1];
const SETTINGS_KEY = 'clock.settings';

const DEFAULT_SETTINGS = {
  hour12: false,
  showSeconds: true,
  dateFormat: 'zh', // 'zh' | 'iso' | 'en'
};

const WEEKDAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* 宿主注入的旧版主题别名（prototype 桥只给这四个键） */
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
  clock: $('clock'),
  timeMain: $('time-main'),
  timeSec: $('time-sec'),
  meridiem: $('time-meridiem'),
  date: $('date'),
  weekday: $('weekday'),
  settingsBtn: $('settings-btn'),
  scrim: $('scrim'),
  sheet: $('sheet'),
  closeSettings: $('close-settings'),
  toggle24h: $('set-24h'),
  toggleSeconds: $('set-seconds'),
  toast: $('toast'),
};

/* ------------------------------------------------------------------ */
/* 状态                                                                */
/* ------------------------------------------------------------------ */

const state = {
  settings: loadSettings(),
  size: resolveSize(),
  sizeFromUrl: sizeFromUrl(),
  inited: false,
  settingsTouched: false,
  sheetOpen: false,
  toastTimer: 0,
};

/* ------------------------------------------------------------------ */
/* 本地存储 / 配置                                                     */
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

function loadSettings() {
  const stored = readJSON(SETTINGS_KEY, null);
  return { ...DEFAULT_SETTINGS, ...(stored && typeof stored === 'object' ? stored : {}) };
}

/** 从 init(theme) 的 config 快照里取设置（宿主可能给扁平对象或按 key 包一层） */
function settingsFromConfig(config) {
  if (!config || typeof config !== 'object') return null;
  const direct = config[SETTINGS_KEY] ?? config.settings ?? config;
  if (!direct || typeof direct !== 'object') return null;
  const patch = {};
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (direct[key] !== undefined) patch[key] = direct[key];
  }
  return Object.keys(patch).length ? patch : null;
}

function saveSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  state.settingsTouched = true;
  writeJSON(SETTINGS_KEY, state.settings);
  plugin.setConfig(SETTINGS_KEY, state.settings);
  syncSettingsControls();
  render();
}

/* ------------------------------------------------------------------ */
/* 主题                                                                */
/* ------------------------------------------------------------------ */

function applyTheme(theme) {
  if (!theme || typeof theme !== 'object') return;
  const root = document.documentElement;
  if (theme.colorScheme === 'light' || theme.colorScheme === 'dark') {
    root.dataset.scheme = theme.colorScheme;
  }
  for (const [key, value] of Object.entries(theme)) {
    if (typeof value !== 'string') continue;
    let target = THEME_ALIASES[key];
    if (!target && /^(color|font|borderRadius|spacing|shadow|duration|curve|strokeWidth)/.test(key)) {
      target = `--${key}`;
    }
    if (target) root.style.setProperty(target, value);
  }
}

/* ------------------------------------------------------------------ */
/* 尺寸解析                                                            */
/* ------------------------------------------------------------------ */

function sizeFromUrl() {
  const raw = new URLSearchParams(location.search).get('size');
  const match = /^(\d+)x(\d+)$/.exec(raw || '');
  if (!match) return null;
  const size = [Number(match[1]), Number(match[2])];
  return isSupported(size) ? size : pickSize(size[0], size[1]);
}

function isSupported(size) {
  return SUPPORTED_SIZES.some(([w, h]) => w === size[0] && h === size[1]);
}

/** 非声明尺寸（宿主动态/独立打开）就近吸附到声明的档位 */
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

function resolveSize() {
  const fromUrl = sizeFromUrl();
  if (fromUrl) return fromUrl;
  const rect = document.documentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return pickSize(rect.width, rect.height);
  }
  return DEFAULT_SIZE;
}

function applySize(size) {
  state.size = size;
  document.documentElement.dataset.size = size[0] + 'x' + size[1];
}

/* ------------------------------------------------------------------ */
/* 渲染                                                                */
/* ------------------------------------------------------------------ */

const pad2 = (n) => String(n).padStart(2, '0');

function dateParts(now) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdayZh = WEEKDAYS_ZH[now.getDay()];
  const weekdayEn = WEEKDAYS_EN[now.getDay()];
  switch (state.settings.dateFormat) {
    case 'iso':
      return { date: `${year}-${pad2(month)}-${pad2(day)}`, weekday: weekdayZh, includesWeekday: false };
    case 'en':
      return { date: `${month}/${day}`, weekday: weekdayEn, includesWeekday: true };
    case 'zh':
    default:
      return { date: `${month}月${day}日`, weekday: weekdayZh, includesWeekday: true };
  }
}

function render() {
  const now = new Date();
  const settings = state.settings;
  const sizeId = state.size[0] + 'x' + state.size[1];

  let hours = now.getHours();
  let meridiem = '';
  if (settings.hour12) {
    meridiem = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }
  const mainText = `${settings.hour12 ? hours : pad2(hours)}:${pad2(now.getMinutes())}`;
  els.timeMain.textContent = mainText;

  // 1×1 只保留 HH:MM，秒与日期按规格砍掉（CSS 隐藏，这里同步不写内容以免读屏读出）
  const showSeconds = settings.showSeconds && sizeId !== '1x1';
  els.timeSec.textContent = showSeconds ? `:${pad2(now.getSeconds())}` : '';

  const isTwelve = settings.hour12;
  els.meridiem.textContent = isTwelve ? meridiem : '';
  els.meridiem.hidden = !isTwelve;

  const parts = dateParts(now);
  if (sizeId === '3x2') {
    els.date.textContent = parts.date;
    els.weekday.textContent = parts.weekday;
  } else {
    els.date.textContent = parts.includesWeekday ? `${parts.date} ${parts.weekday}` : parts.date;
    els.weekday.textContent = '';
  }

  const timeForLabel = isTwelve ? `${mainText} ${meridiem}` : mainText;
  els.clock.setAttribute('aria-label', `当前时间 ${timeForLabel}，点击切换 12 / 24 小时制`);
}

/* ------------------------------------------------------------------ */
/* 秒级刷新：对齐到整秒，避免累积漂移                                    */
/* ------------------------------------------------------------------ */

let tickTimer = 0;

function scheduleTick() {
  window.clearTimeout(tickTimer);
  render();
  const delay = 1000 - (Date.now() % 1000) + 10;
  tickTimer = window.setTimeout(scheduleTick, delay);
}

/* ------------------------------------------------------------------ */
/* 设置面板                                                            */
/* ------------------------------------------------------------------ */

function motionMs(name, fallback = 200) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^([\d.]+)ms$/.exec(raw);
  return match ? Number(match[1]) : fallback;
}

function syncSettingsControls() {
  const s = state.settings;
  els.toggle24h.checked = !s.hour12;
  els.toggleSeconds.checked = s.showSeconds;
  for (const radio of document.querySelectorAll('input[name="date-format"]')) {
    radio.checked = radio.value === s.dateFormat;
  }
}

function openSheet() {
  if (state.sheetOpen) return;
  state.sheetOpen = true;
  document.body.classList.add('sheet-open');
  els.scrim.hidden = false;
  els.sheet.hidden = false;
  syncSettingsControls();
  // 下一帧再加 is-open，让 Fluent 的减速曲线真正跑起来
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.scrim.classList.add('is-open');
      els.sheet.classList.add('is-open');
    });
  });
  els.closeSettings.focus({ preventScroll: true });
}

function closeSheet() {
  if (!state.sheetOpen) return;
  state.sheetOpen = false;
  document.body.classList.remove('sheet-open');
  els.scrim.classList.remove('is-open');
  els.sheet.classList.remove('is-open');
  const done = () => {
    if (state.sheetOpen) return;
    els.scrim.hidden = true;
    els.sheet.hidden = true;
  };
  window.setTimeout(done, motionMs('--durationNormal') + 20);
  els.settingsBtn.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ */
/* 轻提示                                                              */
/* ------------------------------------------------------------------ */

function announce(text) {
  els.toast.textContent = text;
  els.toast.classList.add('is-visible');
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    els.toast.classList.remove('is-visible');
  }, 1600);
}

/* ------------------------------------------------------------------ */
/* 交互                                                                */
/* ------------------------------------------------------------------ */

function toggleHour12() {
  saveSettings({ hour12: !state.settings.hour12 });
  announce(state.settings.hour12 ? '已切换为 12 小时制' : '已切换为 24 小时制');
}

els.clock.addEventListener('click', toggleHour12);
els.clock.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleHour12();
  }
});

els.settingsBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  openSheet();
});
els.closeSettings.addEventListener('click', (event) => {
  event.stopPropagation();
  closeSheet();
});
els.scrim.addEventListener('click', closeSheet);

els.toggle24h.addEventListener('change', () => saveSettings({ hour12: !els.toggle24h.checked }));
els.toggleSeconds.addEventListener('change', () => saveSettings({ showSeconds: els.toggleSeconds.checked }));
for (const radio of document.querySelectorAll('input[name="date-format"]')) {
  radio.addEventListener('change', () => {
    if (radio.checked) saveSettings({ dateFormat: radio.value });
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (state.sheetOpen) {
    event.preventDefault();
    closeSheet();
  } else {
    plugin.exitFocus();
  }
});

/* 3×2 等大档位直接显示齿轮；1×1 不显示（CSS 已处理） */

/* ------------------------------------------------------------------ */
/* Agent 工具                                                          */
/* ------------------------------------------------------------------ */

const TOOLS = [
  {
    name: 'clock.now',
    description: '读取系统当前时间与日期（只读，不修改任何配置）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
];

function clockNow() {
  const now = new Date();
  const parts = dateParts(now);
  return {
    iso: now.toISOString(),
    time: `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`,
    hour12: state.settings.hour12,
    display: els.timeMain.textContent + els.timeSec.textContent + (state.settings.hour12 ? ` ${els.meridiem.textContent}` : ''),
    date: parts.date,
    weekday: parts.weekday,
    dateFormat: state.settings.dateFormat,
    showSeconds: state.settings.showSeconds && state.size[0] + 'x' + state.size[1] !== '1x1',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

plugin.onToolCall((message) => {
  if (!message || typeof message.name !== 'string') return;
  const id = message.id;
  try {
    if (message.name === 'clock.now') {
      plugin.toolResult(id, true, clockNow());
    } else {
      plugin.toolResult(id, false, `未知工具：${message.name}`);
    }
  } catch (error) {
    plugin.toolResult(id, false, error instanceof Error ? error.message : String(error));
  }
});

/* ------------------------------------------------------------------ */
/* 启动                                                                */
/* ------------------------------------------------------------------ */

plugin.ready(TOOLS);

plugin.onInit((payload) => {
  state.inited = true;
  if (payload?.theme) applyTheme(payload.theme);

  const patch = settingsFromConfig(payload?.config);
  if (patch && !state.settingsTouched) {
    state.settings = { ...state.settings, ...patch };
    writeJSON(SETTINGS_KEY, state.settings);
  }
  // 宿主配置可能不在 init 快照里：再按需捞一次
  if (!patch && plugin.inHost) {
    plugin.getConfig(SETTINGS_KEY).then((stored) => {
      if (state.settingsTouched) return;
      if (stored && typeof stored === 'object') {
        state.settings = { ...state.settings, ...stored };
        syncSettingsControls();
        render();
      }
    });
  }

  if (!state.sizeFromUrl) {
    const size = payload?.size;
    if (Array.isArray(size) && size.length === 2) applySize(pickSize(Number(size[0]), Number(size[1])));
  }
  syncSettingsControls();
  scheduleTick();
});

plugin.onResize((size) => {
  if (state.sizeFromUrl || !Array.isArray(size)) return;
  applySize(pickSize(Number(size[0]), Number(size[1])));
  render();
});

plugin.onTheme((theme) => applyTheme(theme));

plugin.onFocus(() => {
  if (state.sheetOpen) els.closeSettings.focus({ preventScroll: true });
  else els.clock.focus({ preventScroll: true });
});

// 宿主将来若要「编辑模式 → 设置」直接打开本插件设置，可用这条消息
window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  if (event.data?.type === 'host:open-settings') openSheet();
});

// 独立打开：套上演示材质、套用 URL 尺寸参数
if (!plugin.inHost) {
  document.body.classList.add('is-standalone');
  if (new URLSearchParams(location.search).get('settings') === '1') {
    openSheet();
  }
}

applySize(state.size);
syncSettingsControls();
scheduleTick();

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) scheduleTick();
});
