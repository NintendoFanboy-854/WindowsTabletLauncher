/**
 * 世界时钟数据层：内置常用城市、localStorage 持久化、跨 iframe 同步与 Intl 时区计算。
 *
 * 存储键按 docs/components/clock.md：`clock.places`。旧版本键
 * `plugin.clock.places` / `clock.worldClocks` / `clock.world` 只在主键不存在时导入，
 * 不覆盖已有数据；数据统一 normalize 后最多保留 8 条。
 *
 * 这个文件不依赖 React；`useWorldClocks` 是给卡片与 L1 共用的轻量订阅 hook。
 */

import { useCallback, useEffect, useState } from 'react';

import { systemTimeZone } from './settings.js';

/** 世界时钟上限（docs/components/clock.md）。 */
export const WORLD_LIMIT = 8;

/** 主存储键。 */
export const WORLD_KEY = 'clock.places';

/** 只用于一次性导入的旧键；主键存在（哪怕是空数组）时一律以主键为准。 */
const LEGACY_WORLD_KEYS = ['plugin.clock.places', 'clock.worldClocks', 'clock.world'];

/** 同文档内多组件同步用的自定义事件（storage 事件只发给其它 window）。 */
const WORLD_CHANGED_EVENT = 'clock:places-changed';

/**
 * 内置常用城市（约 45 个，中英文名 + IANA 时区）。
 * 不引入外部数据依赖；国家/行政区只用于 L2 结果行的 12px 辅助信息。
 */
export const CITIES = Object.freeze([
  { id: 'beijing', name: '北京', nameEn: 'Beijing', country: '中国', tz: 'Asia/Shanghai' },
  { id: 'shanghai', name: '上海', nameEn: 'Shanghai', country: '中国', tz: 'Asia/Shanghai' },
  { id: 'guangzhou', name: '广州', nameEn: 'Guangzhou', country: '中国', tz: 'Asia/Shanghai' },
  { id: 'shenzhen', name: '深圳', nameEn: 'Shenzhen', country: '中国', tz: 'Asia/Shanghai' },
  { id: 'chengdu', name: '成都', nameEn: 'Chengdu', country: '中国', tz: 'Asia/Shanghai' },
  { id: 'hangzhou', name: '杭州', nameEn: 'Hangzhou', country: '中国', tz: 'Asia/Shanghai' },
  { id: 'hongkong', name: '香港', nameEn: 'Hong Kong', country: '中国香港', tz: 'Asia/Hong_Kong' },
  { id: 'taipei', name: '台北', nameEn: 'Taipei', country: '中国台湾', tz: 'Asia/Taipei' },
  { id: 'tokyo', name: '东京', nameEn: 'Tokyo', country: '日本', tz: 'Asia/Tokyo' },
  { id: 'seoul', name: '首尔', nameEn: 'Seoul', country: '韩国', tz: 'Asia/Seoul' },
  { id: 'singapore', name: '新加坡', nameEn: 'Singapore', country: '新加坡', tz: 'Asia/Singapore' },
  { id: 'bangkok', name: '曼谷', nameEn: 'Bangkok', country: '泰国', tz: 'Asia/Bangkok' },
  { id: 'kualalumpur', name: '吉隆坡', nameEn: 'Kuala Lumpur', country: '马来西亚', tz: 'Asia/Kuala_Lumpur' },
  { id: 'jakarta', name: '雅加达', nameEn: 'Jakarta', country: '印度尼西亚', tz: 'Asia/Jakarta' },
  { id: 'manila', name: '马尼拉', nameEn: 'Manila', country: '菲律宾', tz: 'Asia/Manila' },
  { id: 'hanoi', name: '河内', nameEn: 'Hanoi', country: '越南', tz: 'Asia/Ho_Chi_Minh' },
  { id: 'newdelhi', name: '新德里', nameEn: 'New Delhi', country: '印度', tz: 'Asia/Kolkata' },
  { id: 'dubai', name: '迪拜', nameEn: 'Dubai', country: '阿联酋', tz: 'Asia/Dubai' },
  { id: 'istanbul', name: '伊斯坦布尔', nameEn: 'Istanbul', country: '土耳其', tz: 'Europe/Istanbul' },
  { id: 'moscow', name: '莫斯科', nameEn: 'Moscow', country: '俄罗斯', tz: 'Europe/Moscow' },
  { id: 'berlin', name: '柏林', nameEn: 'Berlin', country: '德国', tz: 'Europe/Berlin' },
  { id: 'paris', name: '巴黎', nameEn: 'Paris', country: '法国', tz: 'Europe/Paris' },
  { id: 'london', name: '伦敦', nameEn: 'London', country: '英国', tz: 'Europe/London' },
  { id: 'rome', name: '罗马', nameEn: 'Rome', country: '意大利', tz: 'Europe/Rome' },
  { id: 'madrid', name: '马德里', nameEn: 'Madrid', country: '西班牙', tz: 'Europe/Madrid' },
  { id: 'amsterdam', name: '阿姆斯特丹', nameEn: 'Amsterdam', country: '荷兰', tz: 'Europe/Amsterdam' },
  { id: 'zurich', name: '苏黎世', nameEn: 'Zurich', country: '瑞士', tz: 'Europe/Zurich' },
  { id: 'stockholm', name: '斯德哥尔摩', nameEn: 'Stockholm', country: '瑞典', tz: 'Europe/Stockholm' },
  { id: 'reykjavik', name: '雷克雅未克', nameEn: 'Reykjavik', country: '冰岛', tz: 'Atlantic/Reykjavik' },
  { id: 'cairo', name: '开罗', nameEn: 'Cairo', country: '埃及', tz: 'Africa/Cairo' },
  { id: 'johannesburg', name: '约翰内斯堡', nameEn: 'Johannesburg', country: '南非', tz: 'Africa/Johannesburg' },
  { id: 'nairobi', name: '内罗毕', nameEn: 'Nairobi', country: '肯尼亚', tz: 'Africa/Nairobi' },
  { id: 'newyork', name: '纽约', nameEn: 'New York', country: '美国', tz: 'America/New_York' },
  { id: 'losangeles', name: '洛杉矶', nameEn: 'Los Angeles', country: '美国', tz: 'America/Los_Angeles' },
  { id: 'chicago', name: '芝加哥', nameEn: 'Chicago', country: '美国', tz: 'America/Chicago' },
  { id: 'seattle', name: '西雅图', nameEn: 'Seattle', country: '美国', tz: 'America/Los_Angeles' },
  { id: 'sanfrancisco', name: '旧金山', nameEn: 'San Francisco', country: '美国', tz: 'America/Los_Angeles' },
  { id: 'honolulu', name: '檀香山', nameEn: 'Honolulu', country: '美国', tz: 'Pacific/Honolulu' },
  { id: 'anchorage', name: '安克雷奇', nameEn: 'Anchorage', country: '美国', tz: 'America/Anchorage' },
  { id: 'toronto', name: '多伦多', nameEn: 'Toronto', country: '加拿大', tz: 'America/Toronto' },
  { id: 'vancouver', name: '温哥华', nameEn: 'Vancouver', country: '加拿大', tz: 'America/Vancouver' },
  { id: 'mexicocity', name: '墨西哥城', nameEn: 'Mexico City', country: '墨西哥', tz: 'America/Mexico_City' },
  { id: 'saopaulo', name: '圣保罗', nameEn: 'Sao Paulo', country: '巴西', tz: 'America/Sao_Paulo' },
  { id: 'buenosaires', name: '布宜诺斯艾利斯', nameEn: 'Buenos Aires', country: '阿根廷', tz: 'America/Argentina/Buenos_Aires' },
  { id: 'sydney', name: '悉尼', nameEn: 'Sydney', country: '澳大利亚', tz: 'Australia/Sydney' },
  { id: 'melbourne', name: '墨尔本', nameEn: 'Melbourne', country: '澳大利亚', tz: 'Australia/Melbourne' },
  { id: 'auckland', name: '奥克兰', nameEn: 'Auckland', country: '新西兰', tz: 'Pacific/Auckland' },
]);

/** L2 搜索：中英文城市名、行政区、IANA 时区都可匹配。 */
export function searchCities(query) {
  const needle = String(query ?? '').trim().toLowerCase();
  if (!needle) return CITIES;
  return CITIES.filter((city) =>
    [city.name, city.nameEn, city.country, city.tz].some((value) =>
      value.toLowerCase().includes(needle),
    ),
  );
}

const WEEKDAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const pad2 = (value) => String(value).padStart(2, '0');

const timeFormatterCache = new Map();
const dateFormatterCache = new Map();
const offsetFormatterCache = new Map();
const validTimeZones = new Map();

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function hasTimeZoneApi(timeZone) {
  if (validTimeZones.has(timeZone)) return validTimeZones.get(timeZone);
  let valid = false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date(0));
    valid = true;
  } catch {
    valid = false;
  }
  validTimeZones.set(timeZone, valid);
  return valid;
}

function findCityById(id) {
  if (!id) return null;
  const needle = String(id).toLowerCase();
  return CITIES.find((city) => city.id.toLowerCase() === needle) ?? null;
}

function findCityByName(name) {
  if (!name) return null;
  const needle = String(name).trim().toLowerCase();
  return (
    CITIES.find(
      (city) =>
        city.name.toLowerCase() === needle ||
        city.nameEn.toLowerCase() === needle,
    ) ?? null
  );
}

function findCityByTimeZone(timeZone) {
  if (!timeZone) return null;
  return CITIES.find((city) => city.tz === timeZone) ?? null;
}

/** IANA 时区兜底名：`America/New_York` → `New York`。 */
function fallbackNameForTimeZone(timeZone) {
  const segment = String(timeZone).split('/').pop() || timeZone;
  return segment.replace(/_/g, ' ');
}

/** 单条旧数据/工具入参 → 完整 WorldClock；无法识别返回 null。 */
function resolveWorldPlace(input) {
  if (typeof input === 'string') {
    const text = input.trim();
    if (!text) return null;
    const byId = findCityById(text);
    if (byId) return { ...byId };
    const byName = findCityByName(text);
    if (byName) return { ...byName };
    if (!hasTimeZoneApi(text)) return null;
    const byZone = findCityByTimeZone(text);
    if (byZone) return { ...byZone };
    return { id: `tz:${text}`, name: fallbackNameForTimeZone(text), country: '', tz: text };
  }

  if (!isRecord(input)) return null;

  const byId = findCityById(firstString(input.id));
  if (byId) return { ...byId };

  const byName = findCityByName(firstString(input.name, input.city));
  if (byName) return { ...byName };

  const timeZone = firstString(input.tz, input.timezone, input.timeZone, input.zone);
  if (!timeZone || !hasTimeZoneApi(timeZone)) return null;

  const byZone = findCityByTimeZone(timeZone);
  if (byZone && !firstString(input.name, input.city, input.country)) return { ...byZone };

  const id = firstString(input.id) || byZone?.id || `tz:${timeZone}`;
  const name = firstString(input.name, input.city) || byZone?.name || fallbackNameForTimeZone(timeZone);
  const country = firstString(input.country, input.region) || byZone?.country || '';
  return { id, name, country, tz: timeZone };
}

/** 数组 / {places} / 单条对象 → 去重后的 WorldClock[]，最多 8 条。 */
export function normalizeWorldClocks(raw) {
  let list = [];
  if (Array.isArray(raw)) list = raw;
  else if (isRecord(raw)) {
    if (Array.isArray(raw.places)) list = raw.places;
    else if (Array.isArray(raw.clocks)) list = raw.clocks;
    else if (Array.isArray(raw.cities)) list = raw.cities;
    else list = [raw];
  }

  const seen = new Set();
  const result = [];
  for (const entry of list) {
    const place = resolveWorldPlace(entry);
    if (!place || seen.has(place.id)) continue;
    seen.add(place.id);
    result.push(place);
    if (result.length >= WORLD_LIMIT) break;
  }
  return result;
}

function parseStoredWorldKey(key) {
  let raw;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return null;
  }
  if (raw === null) return null;
  try {
    return normalizeWorldClocks(JSON.parse(raw));
  } catch {
    return [];
  }
}

function emitWorldChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(WORLD_CHANGED_EVENT));
}

/** 写主键；返回是否成功。失败时不改内存状态，由调用方报错。 */
function writeWorldClocks(places, { silent = false } = {}) {
  try {
    localStorage.setItem(WORLD_KEY, JSON.stringify(places));
  } catch {
    return false;
  }
  if (!silent) emitWorldChanged();
  return true;
}

/**
 * 读世界时钟：主键存在就以主键为准；只有主键缺失时才从旧键导入。
 * 旧键保留不删，避免迁移写失败时丢失数据。
 */
export function readWorldClocks() {
  const primary = parseStoredWorldKey(WORLD_KEY);
  if (primary !== null) return primary;

  for (const key of LEGACY_WORLD_KEYS) {
    const legacy = parseStoredWorldKey(key);
    if (legacy && legacy.length > 0) {
      writeWorldClocks(legacy, { silent: true });
      return legacy;
    }
  }
  return [];
}

/** 添加一条（UI 与 Agent 工具共用）；重复 / 超上限 / 存储失败返回 { ok:false, error }。 */
export function addWorldPlace(input) {
  const place = resolveWorldPlace(input);
  if (!place) {
    return { ok: false, error: '无法识别的城市或 IANA 时区' };
  }
  const current = readWorldClocks();
  const existing = current.find((entry) => entry.id === place.id);
  if (existing) {
    return { ok: false, code: 'duplicate', error: `${place.name} 已在世界时钟里`, place: existing };
  }
  if (current.length >= WORLD_LIMIT) {
    return {
      ok: false,
      code: 'limit',
      error: `世界时钟最多 ${WORLD_LIMIT} 个城市，请先删除一个`,
      places: current,
    };
  }
  const next = [...current, place];
  if (!writeWorldClocks(next)) {
    return { ok: false, error: '无法保存世界时钟数据（本机存储不可写）' };
  }
  return { ok: true, place, places: next };
}

function matchesSelector(place, selector) {
  const city = findCityById(place.id);
  if (typeof selector === 'string') {
    const needle = selector.trim().toLowerCase();
    if (!needle) return false;
    return (
      place.id.toLowerCase() === needle ||
      place.tz.toLowerCase() === needle ||
      place.name.toLowerCase() === needle ||
      city?.nameEn.toLowerCase() === needle
    );
  }
  if (!isRecord(selector)) return false;
  const id = firstString(selector.id);
  if (id) return place.id.toLowerCase() === id.toLowerCase();
  const timeZone = firstString(selector.tz, selector.timezone, selector.timeZone, selector.zone);
  if (timeZone) return place.tz.toLowerCase() === timeZone.toLowerCase();
  const name = firstString(selector.name, selector.city);
  if (!name) return false;
  const needle = name.toLowerCase();
  return place.name.toLowerCase() === needle || city?.nameEn.toLowerCase() === needle;
}

/** 删除一条（UI 与 Agent 工具共用）；找不到返回 { ok:false, error }。 */
export function removeWorldPlace(selector) {
  const current = readWorldClocks();
  if (current.length === 0) return { ok: false, error: '世界时钟里还没有城市' };
  const index = current.findIndex((place) => matchesSelector(place, selector));
  if (index < 0) return { ok: false, error: '没有找到要删除的城市' };
  const removed = current[index];
  const next = current.filter((_, position) => position !== index);
  if (!writeWorldClocks(next)) {
    return { ok: false, error: '无法保存世界时钟数据（本机存储不可写）' };
  }
  return { ok: true, removed, places: next };
}

/* ------------------------------------------------------------------ */
/* Intl 时区计算                                                        */
/* ------------------------------------------------------------------ */

function timeFormatter(timeZone, hour12) {
  const key = `${timeZone}|${hour12 ? 'h12' : 'h23'}`;
  let formatter = timeFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12,
      hourCycle: hour12 ? 'h12' : 'h23',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    timeFormatterCache.set(key, formatter);
  }
  return formatter;
}

function dateFormatter(timeZone) {
  let formatter = dateFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    dateFormatterCache.set(timeZone, formatter);
  }
  return formatter;
}

function offsetFormatter(timeZone) {
  let formatter = offsetFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    offsetFormatterCache.set(timeZone, formatter);
  }
  return formatter;
}

function readParts(formatter, date) {
  const parts = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }
  return parts;
}

/** `HH:MM`（12 小时制时去前导 0）+ 秒 + AM/PM。 */
function readTimeInZone(date, timeZone, settings) {
  const parts = readParts(timeFormatter(timeZone, settings.hour12), date);
  const hour = settings.hour12 ? String(Number(parts.hour)) : parts.hour;
  return {
    main: `${hour}:${parts.minute}`,
    seconds: parts.second,
    meridiem: settings.hour12 ? (parts.dayPeriod || '').toUpperCase() : '',
  };
}

function readDateInZone(date, timeZone) {
  const parts = readParts(dateFormatter(timeZone), date);
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const weekdayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return {
    year,
    month,
    day,
    weekday: WEEKDAYS_ZH[weekdayIndex],
    dateLabel: `${year}-${pad2(month)}-${pad2(day)}`,
  };
}

/** 目标时区相对 UTC 的分钟偏移（含DST）。 */
function timeZoneOffsetMinutes(date, timeZone) {
  const parts = readParts(offsetFormatter(timeZone), date);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const actual = Math.floor(date.getTime() / 1000) * 1000;
  return Math.round((asUtc - actual) / 60000);
}

function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} 小时 ${minutes} 分钟`;
  if (hours > 0) return `${hours} 小时`;
  return `${minutes} 分钟`;
}

/** 与本地时差：正数表示目标城市时间更快。 */
function formatOffset(offsetMinutes) {
  if (offsetMinutes === 0) return '与本地相同';
  return `比本地${offsetMinutes > 0 ? '快' : '慢'} ${formatDuration(Math.abs(offsetMinutes))}`;
}

function dayLabelFor(targetDate, localDate) {
  const targetUtc = Date.UTC(targetDate.year, targetDate.month - 1, targetDate.day);
  const localUtc = Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
  const diffDays = Math.round((targetUtc - localUtc) / 86400000);
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays === -1) return '昨天';
  return '';
}

/** 一条世界时钟的展示数据（L1 行与 Agent 工具共用）。 */
export function describeWorldPlace(place, now, settings) {
  const time = readTimeInZone(now, place.tz, settings);
  const targetDate = readDateInZone(now, place.tz);
  const localOffset = -now.getTimezoneOffset();
  const offsetMinutes = timeZoneOffsetMinutes(now, place.tz) - localOffset;
  return {
    id: place.id,
    name: place.name,
    country: place.country,
    tz: place.tz,
    localTime: time.main,
    localSeconds: time.seconds,
    meridiem: time.meridiem,
    localDate: targetDate.dateLabel,
    weekday: targetDate.weekday,
    dayLabel: dayLabelFor(targetDate, now),
    offsetMinutes,
    offsetLabel: formatOffset(offsetMinutes),
  };
}

/** L1 列表与 `clock.world.list` 的完整载荷。 */
export function worldListPayload(places, now, settings) {
  return {
    limit: WORLD_LIMIT,
    count: places.length,
    systemTimeZone: systemTimeZone(),
    places: places.map((place) => describeWorldPlace(place, now, settings)),
  };
}

/* ------------------------------------------------------------------ */
/* React hook                                                          */
/* ------------------------------------------------------------------ */

/**
 * 卡片与 L1 共用的世界时钟状态。
 * localStorage 变化来自其它 iframe 时走 storage 事件；同一文档内写完后发自定义事件。
 */
export function useWorldClocks() {
  const [places, setPlaces] = useState(readWorldClocks);

  useEffect(() => {
    const sync = () => setPlaces(readWorldClocks());
    const onStorage = (event) => {
      if (
        event.key === null ||
        event.key === WORLD_KEY ||
        LEGACY_WORLD_KEYS.includes(event.key)
      ) {
        sync();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(WORLD_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(WORLD_CHANGED_EVENT, sync);
    };
  }, []);

  const add = useCallback((input) => {
    const result = addWorldPlace(input);
    if (result.ok) setPlaces(result.places);
    return result;
  }, []);

  const remove = useCallback((selector) => {
    const result = removeWorldPlace(selector);
    if (result.ok) setPlaces(result.places);
    return result;
  }, []);

  return { places, add, remove };
}
