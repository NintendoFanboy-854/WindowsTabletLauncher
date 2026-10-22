/**
 * 时钟设置模型、时间/日期格式化与本地日历信息（纯 JS，不依赖 React）。
 *
 * settings schema 只声明在 manifest.json；本文件负责默认值、读配置后的 normalize
 * 兜底，以及旧版本本地存储的一次性迁移。配置读写仍走宿主的 getConfig/setConfig
 * （组件里用 useStoredConfig）。
 */

import { plugin } from '/plugin-sdk.js';

/** 宿主配置键：宿主最终存为 `plugin.clock.settings`（与 manifest settings.key 一致）。 */
export const SETTINGS_KEY = 'settings';

/** manifest.settings 的默认值，必须与 schema 的 default 保持一致。 */
export const DEFAULT_SETTINGS = Object.freeze({
  hour12: false,
  showSeconds: true,
  dateFormat: 'zh',
});

/**
 * 日期格式枚举。E1 已落地的口径是 zh/iso/en；docs/components/clock.md 早期写的是
 * cn/iso/en，旧数据里可能存在 'cn'，读取时归一为 'zh'，不丢用户选择。
 */
export const DATE_FORMAT_VALUES = Object.freeze(['zh', 'iso', 'en']);

const DATE_FORMAT_ALIASES = Object.freeze({ cn: 'zh' });

const WEEKDAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** 旧版本（React 迁移前）把设置写在 localStorage 的 `clock.settings`；
 *  中间版本还出现过 `plugin.clock.clock.settings` 这个带 widget 的键。 */
const LEGACY_SETTINGS_KEYS = ['clock.settings', 'plugin.clock.clock.settings'];
const HOST_SETTINGS_STORAGE_KEY = 'plugin.clock.settings';

const pad2 = (value) => String(value).padStart(2, '0');

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeDateFormat(value) {
  if (typeof value !== 'string') return null;
  const canonical = DATE_FORMAT_ALIASES[value] ?? value;
  return DATE_FORMAT_VALUES.includes(canonical) ? canonical : null;
}

/** 宿主配置可能是旧数据 / 部分字段；统一收敛成完整设置（非法字段回落默认值）。 */
export function normalizeSettings(raw) {
  const source = asRecord(raw);
  return {
    hour12: typeof source.hour12 === 'boolean' ? source.hour12 : DEFAULT_SETTINGS.hour12,
    showSeconds:
      typeof source.showSeconds === 'boolean' ? source.showSeconds : DEFAULT_SETTINGS.showSeconds,
    dateFormat: normalizeDateFormat(source.dateFormat) ?? DEFAULT_SETTINGS.dateFormat,
  };
}

/**
 * 旧版本设置迁移：只在宿主里还没有 `plugin.clock.settings` 时导入旧数据。
 *
 * 旧数据可能在三处（按权威性从低到高）：
 * - 本插件 origin 的 localStorage：`clock.settings`（React 之前）、
 *   `plugin.clock.clock.settings`（中间版本误带的 widget 前缀）；
 * - 宿主配置里的旧键 `plugin.clock.clock.settings`（可用 `getConfig('clock.settings')` 读到）。
 *
 * 打包版宿主页（tauri.localhost）与插件 iframe（wtsl.localhost）不同 origin，
 * 直接 `localStorage.setItem('plugin.clock.settings')` 只写进插件自己的存储区，
 * 宿主读不到；所以宿主内迁移必须走 `plugin.setConfig` 写宿主配置（写后宿主会
 * `host:config` 推回来）。独立预览（无宿主）仍以本地键为配置源。
 *
 * @returns {boolean} 是否发现并开始了迁移
 */
export function migrateLegacySettings() {
  const localLegacy = readLocalLegacySettings();
  if (!plugin.inHost) {
    // 独立预览 / 截图：SDK getConfig 兜底读的是本插件 origin 的 localStorage 键
    if (!localLegacy) return false;
    try {
      if (localStorage.getItem(HOST_SETTINGS_STORAGE_KEY) === null) {
        localStorage.setItem(HOST_SETTINGS_STORAGE_KEY, JSON.stringify(localLegacy));
      }
    } catch {
      // 隐私模式 / 存储不可写：保持默认值，不阻塞插件启动
    }
    return true;
  }

  // 宿主内：以宿主配置为准，异步迁移（写后 host:config 会推给所有 iframe）
  void migrateHostSettings(localLegacy);
  return Boolean(localLegacy);
}

/** 读本插件 origin 里的旧设置键（归一化后）；没有返回 null */
function readLocalLegacySettings() {
  try {
    for (const key of LEGACY_SETTINGS_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }
      return normalizeSettings(parsed);
    }
  } catch {
    // 存储不可用时按“没有旧数据”处理
  }
  return null;
}

/**
 * 宿主内的迁移：宿主已有 `settings` 就什么都不做；否则优先迁中间版本写在宿主里的
 * `plugin.clock.clock.settings`，再退到本插件 origin 的旧键。
 */
async function migrateHostSettings(localLegacy) {
  try {
    const current = await plugin.getConfig(SETTINGS_KEY);
    if (current !== null && current !== undefined) return;

    const midEra = await plugin.getConfig('clock.settings'); // 宿主键 plugin.clock.clock.settings
    if (midEra && typeof midEra === 'object' && !Array.isArray(midEra)) {
      await plugin.setConfig(SETTINGS_KEY, normalizeSettings(midEra));
      return;
    }
    if (localLegacy) await plugin.setConfig(SETTINGS_KEY, localLegacy);
  } catch {
    // 迁移失败不影响启动；旧键原样保留
  }
}

/** 本地时间 → { main, seconds, meridiem, time24 }（秒是否显示由调用方按设置裁剪）。 */
export function formatTime(date, settings) {
  let hours = date.getHours();
  let meridiem = '';
  if (settings.hour12) {
    meridiem = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }
  const minute = pad2(date.getMinutes());
  const second = pad2(date.getSeconds());
  return {
    main: `${settings.hour12 ? hours : pad2(hours)}:${minute}`,
    seconds: second,
    meridiem,
    time24: `${pad2(date.getHours())}:${minute}:${second}`,
  };
}

/** 本地日期 → { date, weekday, inline }，date 不带星期，inline 供读屏/详情日期使用。 */
export function formatDate(date, settings) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdayZh = WEEKDAYS_ZH[date.getDay()];
  const weekdayEn = WEEKDAYS_EN[date.getDay()];
  switch (settings.dateFormat) {
    case 'iso': {
      const text = `${year}-${pad2(month)}-${pad2(day)}`;
      return { date: text, weekday: weekdayZh, inline: `${text} ${weekdayZh}` };
    }
    case 'en': {
      const text = `${month}/${day}`;
      return { date: text, weekday: weekdayEn, inline: `${text} ${weekdayEn}` };
    }
    case 'zh':
    default: {
      const text = `${month}月${day}日`;
      return { date: text, weekday: weekdayZh, inline: `${text} ${weekdayZh}` };
    }
  }
}

export function systemTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '本地时区';
  } catch {
    return '本地时区';
  }
}

/** ISO 周数（周一开始）；用于详情「本周第 N 周」。 */
function isoWeekNumber(date) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  return Math.ceil(((day.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** 年内第几天（本地日期）；用于详情「今年第 N 天」。 */
function dayOfYear(date) {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((current - start) / 86400000) + 1;
}

/** 详情「日期信息」三列：周数 / 年内天数 / 系统时区。 */
export function readCalendarInfo(date) {
  return {
    weekNumber: isoWeekNumber(date),
    dayOfYear: dayOfYear(date),
    timeZone: systemTimeZone(),
  };
}

/** Agent `clock.now` 的结构化结果（时间/日期格式跟随当前设置）。 */
export function describeNow(date, settings) {
  const time = formatTime(date, settings);
  const dateParts = formatDate(date, settings);
  const calendar = readCalendarInfo(date);
  return {
    iso: date.toISOString(),
    epochMs: date.getTime(),
    timeZone: calendar.timeZone,
    time: time.time24,
    display: `${time.main}${settings.showSeconds ? `:${time.seconds}` : ''}${
      settings.hour12 ? ` ${time.meridiem}` : ''
    }`,
    hour12: settings.hour12,
    showSeconds: settings.showSeconds,
    date: dateParts.date,
    weekday: dateParts.weekday,
    formattedDate: dateParts.inline,
    dateFormat: settings.dateFormat,
    weekNumber: calendar.weekNumber,
    dayOfYear: calendar.dayOfYear,
  };
}

/**
 * 校验并合并 Agent `clock.settings.set` 的补丁；返回 `{ settings }` 或 `{ error }`。
 * 未知字段、类型错误、非法枚举一律拒绝，不写坏配置。
 */
export function applySettingsPatch(current, rawPatch) {
  if (!rawPatch || typeof rawPatch !== 'object' || Array.isArray(rawPatch)) {
    return { error: '参数必须是对象，例如 { "hour12": true }' };
  }
  const keys = Object.keys(rawPatch);
  if (keys.length === 0) {
    return { error: '至少提供 hour12、showSeconds、dateFormat 中的一个' };
  }
  const unknown = keys.filter(
    (key) => key !== 'hour12' && key !== 'showSeconds' && key !== 'dateFormat',
  );
  if (unknown.length > 0) {
    return { error: `未知设置字段：${unknown.join('、')}` };
  }

  const next = { ...normalizeSettings(current) };
  if ('hour12' in rawPatch) {
    if (typeof rawPatch.hour12 !== 'boolean') return { error: 'hour12 需要是布尔值' };
    next.hour12 = rawPatch.hour12;
  }
  if ('showSeconds' in rawPatch) {
    if (typeof rawPatch.showSeconds !== 'boolean') return { error: 'showSeconds 需要是布尔值' };
    next.showSeconds = rawPatch.showSeconds;
  }
  if ('dateFormat' in rawPatch) {
    const dateFormat = normalizeDateFormat(rawPatch.dateFormat);
    if (!dateFormat) return { error: 'dateFormat 只支持 zh、iso、en' };
    next.dateFormat = dateFormat;
  }
  return { settings: next };
}
