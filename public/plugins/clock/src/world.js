/**
 * 世界时钟数据层：城市搜索（Nominatim + timeapi.io）、搜索缓存、localStorage
 * 持久化、跨 iframe 同步与 Intl 时区计算。
 *
 * 不内置城市表：能搜到什么完全取决于 API；搜过的关键词缓存在 `clock.searchCache`，
 * 之后同一关键词直接读缓存。
 *
 * Agent 侧（`clock.world.search` / `clock.world.add`）的城市与时区必须来自真实搜索
 * 结果：先查缓存，缓存没有就现场联网抓，抓不到直接报错，绝不接受调用方自带的
 * name ↔ tz 组合——那是模型编造时区的入口。
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

/* ------------------------------------------------------------------ */
/* Agent 侧检索：clock.world.search                                     */
/* ------------------------------------------------------------------ */

/**
 * 城市名归一化：去括注（`比什凯克（吉尔吉斯斯坦）` → `比什凯克`）、去空格与
 * 分隔符、转小写。只用于在搜索缓存里判断「是不是同一个地方」，不写进存档。
 */
function normalizePlaceName(value) {
  return String(value ?? '')
    .replace(/[（(][^）)]*[）)]/g, ' ')
    .toLowerCase()
    .replace(/[\s·・,，、/]+/g, '')
    .trim();
}

/** 搜索缓存里这个关键词的候选（已 normalize）；未命中返回 null。 */
function readCachedCitySearch(query) {
  const text = String(query ?? '').trim().toLowerCase();
  if (text.length < 2) return null;
  const cache = readSearchCache();
  if (!Array.isArray(cache[text])) return null;
  return cache[text].map((entry) => resolveWorldPlace(entry)).filter(Boolean);
}

/**
 * `clock.world.search` 的数据层：命中缓存直接返回，未命中联网抓（写缓存由
 * `searchCitiesOnline` 完成）。
 *
 * 返回 `{ ok:true, source:'cache'|'network', places }`，或
 * `{ ok:false, code:'invalid'|'offline', error }`。联网失败不向外抛异常，避免
 * 模型只看到一行不可读的 `TypeError: fetch failed`。
 */
export async function searchCitiesForAgent(query, { signal, limit } = {}) {
  const text = String(query ?? '').trim();
  if (text.length < 2) {
    return { ok: false, code: 'invalid', error: '搜索词至少 2 个字符，例如 大阪 / Osaka' };
  }
  const cached = readCachedCitySearch(text);
  if (cached) return { ok: true, source: 'cache', places: cached };

  try {
    const places = await searchCitiesOnline(text, { signal, limit });
    return { ok: true, source: 'network', places };
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    return { ok: false, code: 'offline', error: '联网搜索失败，请检查网络后重试' };
  }
}

/**
 * 在搜索缓存里找与入参同 id / 同名的候选。
 *
 * **绝不按 tz 匹配**：按 tz 匹配等于承认「任意城市名 + 任何同偏移时区」，
 * 正是「乌鲁木齐 → 比什凯克」这类编造能落库的原因。
 */
function findCachedCity({ id, name, country }) {
  const wantedId = String(id ?? '').trim().toLowerCase();
  const wantedName = normalizePlaceName(name);
  if (!wantedId && !wantedName) return null;

  const wantedCountry = normalizePlaceName(country);
  const cache = readSearchCache();
  let nameHit = null;
  let firstMatch = null;

  for (const key of Object.keys(cache)) {
    const entries = Array.isArray(cache[key]) ? cache[key] : [];
    for (const entry of entries) {
      const place = resolveWorldPlace(entry);
      if (!place) continue;
      if (wantedId && place.id.toLowerCase() === wantedId) return place;
      if (wantedName && normalizePlaceName(place.name) === wantedName) {
        if (!firstMatch) firstMatch = place;
        if (!nameHit && wantedCountry && normalizePlaceName(place.country) === wantedCountry) {
          nameHit = place;
        }
      }
    }
  }
  return nameHit || firstMatch;
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
      error: `世界时钟已达 ${WORLD_LIMIT} 个城市上限`,
      places: current,
    };
  }
  const next = [...current, place];
  if (!writeWorldClocks(next)) {
    return { ok: false, error: '无法保存世界时钟数据（本机存储不可写）' };
  }
  return { ok: true, place, places: next };
}

/**
 * Agent 落库：按 **tz** 去重（UI 的 `addWorldPlace` 仍按 id 去重，行为不变）。
 * 同一时区只能有一条：否则模型换个 id 就能塞进同一时区的重复城市。
 * 上限文案与 `addWorldPlace` 保持一致。
 */
function insertWorldPlaceByTimeZone(place, extra) {
  const current = readWorldClocks();
  const sameZone = current.find((entry) => entry.tz.toLowerCase() === place.tz.toLowerCase());
  if (sameZone) {
    return {
      ok: false,
      code: 'duplicate',
      error: `${sameZone.name} 已经在世界时钟里（时区 ${sameZone.tz}）`,
      place: sameZone,
      places: current,
    };
  }
  if (current.some((entry) => entry.id === place.id)) {
    return { ok: false, code: 'duplicate', error: `${place.name} 已在世界时钟里`, places: current };
  }
  if (current.length >= WORLD_LIMIT) {
    return {
      ok: false,
      code: 'limit',
      error: `世界时钟已达 ${WORLD_LIMIT} 个城市上限`,
      places: current,
    };
  }
  const next = [...current, place];
  if (!writeWorldClocks(next)) {
    return { ok: false, error: '无法保存世界时钟数据（本机存储不可写）' };
  }
  return { ok: true, place, places: next, ...extra };
}

/**
 * `clock.world.add` 的完整校验。城市名与时区必须来自真实搜索结果：
 * 1. 只给合法 IANA 时区、没给城市名 → 「手工时区」通道，直接添加（刻意保留）；
 * 2. 命中 `clock.searchCache` → 用缓存里的 name/country/tz 落库，忽略调用方给的 tz；
 * 3. 缓存没有 → 用城市名现场联网抓；按「候选里同名 tz 优先，否则第一条」选，
 *    落库用解析出来的 name/country/tz/id；
 * 4. 联网失败 / 搜不到 → 返回 `code:'offline'|'not_found'` 的结构化错误，不写库。
 *
 * 给了 name 就等于要求校验：模型给的 tz 一律不直接落库，这正是防住
 * 「乌鲁木齐 → 比什凯克（Asia/Bishkek）」的关口。
 *
 * 返回 `{ ok:true, place, places, source, note, requestedTz?, tzAdjusted? }` 或
 * `{ ok:false, code, error, places? }`。
 */
export async function addWorldPlaceFromAgent(input, { signal } = {}) {
  const record = isRecord(input) ? input : {};
  const rawId = firstString(record.id);
  const rawName = firstString(record.name, record.city);
  const rawCountry = firstString(record.country, record.region);
  const rawTz = firstString(record.tz, record.timezone, record.timeZone, record.zone);

  const zoneFromId =
    rawId.toLowerCase().startsWith('tz:') && hasTimeZoneApi(rawId.slice(3)) ? rawId.slice(3) : '';
  const zoneFromName = rawName && hasTimeZoneApi(rawName) ? rawName : '';
  const zoneForManual = hasTimeZoneApi(rawTz) ? rawTz : zoneFromId;

  // 手工时区通道：没有城市名（或名字本身就是时区名）时，只认合法 IANA 时区。
  if (zoneFromName) {
    return insertWorldPlaceByTimeZone(timeZoneCandidate(zoneFromName), { source: 'manual' });
  }
  if (!rawName && zoneForManual) {
    return insertWorldPlaceByTimeZone(timeZoneCandidate(zoneForManual), { source: 'manual' });
  }

  const queryText = rawName || rawTz;
  if (!queryText) {
    // 只给了缓存里的 id（如 osm:node:123）也能落库，同样以缓存为准。
    const cachedById = findCachedCity({ id: rawId, country: rawCountry });
    if (cachedById) {
      return insertWorldPlaceByTimeZone(cachedById, { source: 'cache', note: '已采用搜索结果' });
    }
    return {
      ok: false,
      code: 'not_found',
      error:
        '无法识别的城市：请给出城市名，或只给合法 IANA 时区（如 Asia/Shanghai）；' +
        '加城市前先调用 clock.world.search',
    };
  }

  // 1. 搜索缓存命中：城市名、国家、时区全部取缓存那条。
  const cached = findCachedCity({ id: rawId, name: queryText, country: rawCountry });
  if (cached) {
    return insertWorldPlaceByTimeZone(cached, {
      source: 'cache',
      note: '已采用搜索结果',
      requestedTz: rawTz || undefined,
      tzAdjusted: Boolean(rawTz) && rawTz.toLowerCase() !== cached.tz.toLowerCase(),
    });
  }

  // 2. 缓存没有 → 现场联网抓。抓不到就报错，不拿模型给的 name/tz 组合兜底。
  let places;
  try {
    places = await searchCitiesOnline(queryText, { signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    return {
      ok: false,
      code: 'offline',
      error: `联网搜索失败，无法确认「${queryText}」的时区；请先调用 clock.world.search 或检查网络`,
    };
  }
  if (!Array.isArray(places) || places.length === 0) {
    return {
      ok: false,
      code: 'not_found',
      error: `没有搜到「${queryText}」，无法确认它的时区；请先调用 clock.world.search 换个关键词，或只传 IANA 时区（如 Asia/Shanghai）`,
    };
  }

  // 3. 选候选：调用方给的 tz 与某条候选一致就选它，否则第一条。
  const requestedTz = rawTz.toLowerCase();
  const picked =
    (requestedTz && places.find((place) => place.tz.toLowerCase() === requestedTz)) || places[0];
  const tzAdjusted = Boolean(rawTz) && rawTz.toLowerCase() !== picked.tz.toLowerCase();
  // timeapi.io 对中国城市一律返回 Asia/Shanghai（例如乌鲁木齐坐标 → Asia/Shanghai），
  // 这是数据源事实：联网解析值与调用方给的时区不一致时，如实说明以解析值为准。
  const note = tzAdjusted
    ? `已联网解析并采用搜索结果的名称与时区（数据源给出 ${picked.tz}，与调用方给的 ${rawTz} 不同）`
    : '已联网解析并采用搜索结果的名称与时区';

  return insertWorldPlaceByTimeZone(
    { id: picked.id, name: picked.name, country: picked.country, tz: picked.tz },
    { source: 'network', note, requestedTz: rawTz || undefined, tzAdjusted },
  );
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

  /**
   * Agent 的加城市入口：先搜索/缓存校验城市与时区是否一致再落库。
   * 与 `add` 共用同一份 localStorage 数据与同步事件。
   */
  const addVerified = useCallback(async (input) => {
    const result = await addWorldPlaceFromAgent(input);
    if (result.ok) setPlaces(result.places);
    return result;
  }, []);

  const remove = useCallback((selector) => {
    const result = removeWorldPlace(selector);
    if (result.ok) setPlaces(result.places);
    return result;
  }, []);

  return { places, add, addVerified, remove };
}
