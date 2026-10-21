/**
 * 世界时钟数据层：城市搜索（Nominatim + timeapi.io）、搜索缓存、localStorage
 * 持久化、跨 iframe 同步与 Intl 时区计算。
 *
 * 不内置城市表：能搜到什么完全取决于 API；搜过的关键词缓存在 `clock.searchCache`，
 * 之后同一关键词直接读缓存。
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

/** 搜索缓存键：{ [关键词]: WorldClock[] }。 */
const SEARCH_CACHE_KEY = 'clock.searchCache';

/** 缓存最多保留多少个关键词，超出丢最早写入的。 */
const SEARCH_CACHE_LIMIT = 30;

/* ------------------------------------------------------------------ */
/* 联网城市搜索（公开 API）                                             */
/* ------------------------------------------------------------------ */

/**
 * 城市搜索全部走公开接口（没有内置表）：
 * - 城市搜索：Nominatim（OpenStreetMap，免 key、CORS 开放）；
 * - 坐标 → IANA 时区：timeapi.io（免 key、CORS 开放）。
 * 时差/夏令时仍由 `Intl` 计算，接口挂了不影响已添加的行。
 */
const GEO_SEARCH_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const GEO_TIMEZONE_ENDPOINT = 'https://timeapi.io/api/TimeZone/coordinate';

/** 单次联网搜索最多几条（每条还要换一次时区）。 */
const ONLINE_LIMIT = 6;

/** Nominatim 的中文名可能带多语言并列：`纽约;紐約` / `东京都/東京都` → 取第一个。 */
function cleanCityName(name, displayName) {
  const source = firstString(name, displayName);
  const head = source.split(',')[0];
  return head.split(';')[0].split('/')[0].trim();
}

/** `display_name` 末段 → 国家/地区（`美国;美國` → 美国，`韩国 / 南韓` → 韩国）。 */
function countryFromDisplayName(displayName) {
  const parts = String(displayName || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const tail = parts.length > 0 ? parts[parts.length - 1] : '';
  return tail.split('/')[0].split(';')[0].trim();
}

/** 经纬度 → IANA 时区（timeapi.io）；失败返回空串。 */
export async function timeZoneForCoordinates(latitude, longitude, signal) {
  const url = `${GEO_TIMEZONE_ENDPOINT}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`;
  const response = await fetch(url, { signal });
  if (!response.ok) return '';
  const data = await response.json();
  const timeZone = firstString(data?.timeZone);
  return timeZone && hasTimeZoneApi(timeZone) ? timeZone : '';
}

/**
 * 联网搜索城市：Nominatim 找到城市（带经纬度），再换 IANA 时区。
 * 返回 `{ id: 'osm:node:123', name, country, tz }`；同一关键词命中缓存直接返回，
 * 不再发请求。解析不出时区的条目丢弃。
 */
export async function searchCitiesOnline(query, { signal, limit = ONLINE_LIMIT } = {}) {
  const text = String(query ?? '').trim();
  const cacheKey = text.toLowerCase();
  if (cacheKey.length < 2) return [];

  const cache = readSearchCache();
  if (Array.isArray(cache[cacheKey])) return cache[cacheKey];

  const url =
    `${GEO_SEARCH_ENDPOINT}?format=jsonv2&q=${encodeURIComponent(text)}` +
    `&limit=${limit}&featureType=settlement&accept-language=zh-CN`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`联网搜索失败（HTTP ${response.status}）`);
  const rows = await response.json();

  const candidates = [];
  const seen = new Set();
  for (const row of Array.isArray(rows) ? rows : []) {
    const name = cleanCityName(row?.name, row?.display_name);
    const latitude = Number(row?.lat);
    const longitude = Number(row?.lon);
    if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    const country = countryFromDisplayName(row?.display_name);
    const key = `${name}|${country}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const id =
      row?.osm_type && row?.osm_id
        ? `osm:${row.osm_type}:${row.osm_id}`
        : `osm:${name}:${latitude.toFixed(2)}:${longitude.toFixed(2)}`;
    candidates.push({ id, name, country, latitude, longitude });
    if (candidates.length >= limit) break;
  }

  const resolved = await Promise.all(
    candidates.map(async (candidate) => {
      const tz = await timeZoneForCoordinates(candidate.latitude, candidate.longitude, signal);
      return tz ? { id: candidate.id, name: candidate.name, country: candidate.country, tz } : null;
    }),
  );
  const results = resolved.filter(Boolean);
  if (results.length > 0) writeSearchCache(cacheKey, results);
  return results;
}

/** 强制刷新的请求间隔：Nominatim 上限 1 次/秒。 */
const REFRESH_INTERVAL_MS = 1100;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 搜索缓存：{ [关键词]: WorldClock[] }，只存「下载过的」。 */
function readSearchCache() {
  try {
    const raw = localStorage.getItem(SEARCH_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeSearchCache(cacheKey, results) {
  try {
    const cache = readSearchCache();
    const keys = Object.keys(cache);
    if (!cache[cacheKey] && keys.length >= SEARCH_CACHE_LIMIT) delete cache[keys[0]];
    cache[cacheKey] = results;
    localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* 缓存写不了就下次重新搜 */
  }
}

/** 一条世界时钟 → API 时区（Nominatim 找城市 → timeapi.io 换 IANA）。 */
async function resolveTimeZoneFromApi(place, signal) {
  const url =
    `${GEO_SEARCH_ENDPOINT}?format=jsonv2&q=${encodeURIComponent(place.name)}` +
    `&limit=1&featureType=settlement&accept-language=zh-CN`;
  const response = await fetch(url, { signal });
  if (!response.ok) return '';
  const rows = await response.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  const latitude = Number(row?.lat);
  const longitude = Number(row?.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return '';
  return timeZoneForCoordinates(latitude, longitude, signal);
}

/**
 * 强制刷新：已添加的城市逐条从 API 重新解析时区并写回；解析失败保留原值。
 */
export async function refreshWorldClocksFromApi({ signal } = {}) {
  const current = readWorldClocks();
  if (current.length === 0) return { total: 0, resolved: 0, updated: 0 };

  const next = [];
  let resolved = 0;
  let updated = 0;
  for (let index = 0; index < current.length; index += 1) {
    const place = current[index];
    if (index > 0) await sleep(REFRESH_INTERVAL_MS);
    let tz = '';
    try {
      tz = await resolveTimeZoneFromApi(place, signal);
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      tz = '';
    }
    if (tz) {
      resolved += 1;
      if (tz !== place.tz) updated += 1;
      next.push({ ...place, tz });
    } else {
      next.push(place);
    }
  }
  if (updated > 0) writeWorldClocks(next);
  return { total: current.length, resolved, updated };
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

/** IANA 时区兜底名：`America/New_York` → `New York`。 */
function fallbackNameForTimeZone(timeZone) {
  const segment = String(timeZone).split('/').pop() || timeZone;
  return segment.replace(/_/g, ' ');
}

/** L2 直接输入 IANA 时区时的候选（如 `Asia/Tokyo`）；不是合法时区返回 null。 */
export function timeZoneCandidate(query) {
  const text = String(query ?? '').trim();
  if (!hasTimeZoneApi(text)) return null;
  return { id: `tz:${text}`, name: fallbackNameForTimeZone(text), country: '', tz: text };
}

/** 单条存档/工具入参 → 完整 WorldClock；无法识别返回 null。 */
function resolveWorldPlace(input) {
  if (typeof input === 'string') {
    const text = input.trim();
    if (!hasTimeZoneApi(text)) return null;
    return { id: `tz:${text}`, name: fallbackNameForTimeZone(text), country: '', tz: text };
  }

  if (!isRecord(input)) return null;

  const timeZone = firstString(input.tz, input.timezone, input.timeZone, input.zone);
  if (!timeZone || !hasTimeZoneApi(timeZone)) return null;

  return {
    id: firstString(input.id) || `tz:${timeZone}`,
    name: firstString(input.name, input.city) || fallbackNameForTimeZone(timeZone),
    country: firstString(input.country, input.region),
    tz: timeZone,
  };
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
  if (typeof selector === 'string') {
    const needle = selector.trim().toLowerCase();
    if (!needle) return false;
    return (
      place.id.toLowerCase() === needle ||
      place.tz.toLowerCase() === needle ||
      place.name.toLowerCase() === needle
    );
  }
  if (!isRecord(selector)) return false;
  const id = firstString(selector.id);
  if (id) return place.id.toLowerCase() === id.toLowerCase();
  const timeZone = firstString(selector.tz, selector.timezone, selector.timeZone, selector.zone);
  if (timeZone) return place.tz.toLowerCase() === timeZone.toLowerCase();
  const name = firstString(selector.name, selector.city);
  if (!name) return false;
  return place.name.toLowerCase() === name.toLowerCase();
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
