/**
 * 和风天气（QWeather）数据源。
 *
 * 两种 API 形态：
 * - 自定义 API Host（形如 xxxx.qweatherapi.com）：/weather/v1、/airquality/v1、
 *   /weatheralert/v1、/geo/v2 —— 当前官方推荐；
 * - 旧公共域名（devapi / api / geoapi.qweather.com）：/v7 城市天气接口 —— 旧凭据兼容。
 *
 * 身份认证：JWT（Authorization: Bearer）或 API KEY（X-QW-Api-Key），按 Key 形态自动选择。
 */

import {
  dateOnly,
  windDirZh,
  aqiCategoryZh,
  aqiFallbackColor,
  rgbaToCss,
  SEVERITY_ZH,
  POLLUTANT_LABELS,
} from './format.js';

const LEGACY_HOSTS = new Set(['devapi.qweather.com', 'api.qweather.com', 'geoapi.qweather.com']);
const TIMEOUT_MS = 12000;

export class WeatherApiError extends Error {
  constructor(message, { status = 0, code = '' } = {}) {
    super(message);
    this.name = 'WeatherApiError';
    this.status = status;
    this.code = code;
  }
}

export function hasApiKey(settings) {
  return Boolean(settings && String(settings.apiKey || '').trim());
}

/** 解析用户填写的 API Host（允许带 https:// 与末尾斜杠） */
export function resolveHost(settings) {
  const raw = String(settings?.apiHost || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
  const host = raw || 'devapi.qweather.com';
  const legacy = LEGACY_HOSTS.has(host.toLowerCase());
  return {
    host,
    configured: Boolean(raw),
    legacy,
    baseUrl: `https://${host}`,
    geoBaseUrl: legacy ? 'https://geoapi.qweather.com' : `https://${host}`,
    geoPath: legacy ? '/v2/city/lookup' : '/geo/v2/city/lookup',
  };
}

function isJwt(key) {
  return /^eyJ[\w-]*\.[\w-]+\.[\w-]+$/.test(key);
}

function authHeaders(settings) {
  const key = String(settings?.apiKey || '').trim();
  if (!key) throw new WeatherApiError('未配置和风天气 API Key', { status: 401, code: 'NO_KEY' });
  if (isJwt(key)) return { Authorization: `Bearer ${key}` };
  return { 'X-QW-Api-Key': key };
}

const LEGACY_CODE_MESSAGE = {
  204: '请求成功，但该地区没有数据',
  400: '请求参数错误',
  401: '身份认证失败，请检查 API Key',
  402: '超过每日请求限额，请稍后再试',
  403: '没有访问权限或帐号额度不足',
  404: '请求的资源不存在',
  429: '请求过于频繁（429），请稍后重试',
  500: '和风天气服务暂时不可用',
};

function messageForStatus(status, detail) {
  switch (status) {
    case 400:
      return detail ? `请求参数错误：${detail}` : '请求参数错误';
    case 401:
      return '身份认证失败，请检查 API Key / JWT 与 API Host';
    case 403:
      return '没有访问权限：请检查 API Host、凭据限制或帐号额度';
    case 404:
      return '接口不存在：请确认 API Host 与接口路径匹配';
    case 429:
      return '请求过于频繁（429），将使用缓存数据';
    default:
      return status >= 500 ? '和风天气服务暂时不可用' : `请求失败（HTTP ${status}）`;
  }
}

function buildUrl(base, path, query) {
  const url = new URL(path, base);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/** 发一个 GET 请求，把 HTTP/业务错误统一抛成 WeatherApiError */
async function request(settings, base, path, query) {
  const headers = authHeaders(settings);
  if (!resolveHost(settings).configured) {
    throw new WeatherApiError(
      '未配置和风天气 API Host：请在设置里填写控制台 → 设置中的专属 API Host（形如 abcd1234.qweatherapi.com）',
      { status: 401, code: 'NO_HOST' },
    );
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(buildUrl(base, path, query), {
      method: 'GET',
      headers: { Accept: 'application/json', ...headers },
      signal: controller.signal,
      cache: 'no-store',
    });
  } catch (error) {
    clearTimeout(timer);
    if (error?.name === 'AbortError') throw new WeatherApiError('请求超时，将使用缓存数据', { status: 0, code: 'TIMEOUT' });
    throw new WeatherApiError('网络请求失败（无网络或被 CORS 拦截），将使用缓存数据', { status: 0, code: 'NETWORK' });
  }
  clearTimeout(timer);

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    // 新接口错误体：{ error: { status, type, title, detail } }
    const type = body?.error?.type || '';
    const detail = body?.error?.detail || body?.error?.title || '';
    let message = messageForStatus(response.status, detail);
    if (type.includes('invalid-host')) {
      message = 'API Host 无效：请在设置里填写和风控制台 → 设置中的专属 API Host（公共域名已停用）';
    } else if (type.includes('unauthorized')) {
      message = '身份认证失败，请检查 API Key / JWT 是否正确';
    } else if (type.includes('no-credit') || type.includes('overdue')) {
      message = '和风帐号额度不足或账单逾期，请在控制台检查';
    }
    throw new WeatherApiError(message, { status: response.status, code: type || String(response.status) });
  }
  // 旧 v7 接口用 code 字段表达业务错误
  if (body && typeof body.code === 'string' && body.code !== '200') {
    const status = Number(body.code) || 0;
    throw new WeatherApiError(LEGACY_CODE_MESSAGE[body.code] || `和风天气返回错误码 ${body.code}`, {
      status,
      code: body.code,
    });
  }
  return body;
}

// ---------- GeoAPI ----------

export function normalizeGeoLocations(raw) {
  return (raw?.location || []).map((item) => ({
    id: String(item.id),
    name: item.name || '',
    lat: Number(item.lat),
    lon: Number(item.lon),
    adm1: item.adm1 || '',
    adm2: item.adm2 || '',
    country: item.country || '',
    tz: item.tz || 'Asia/Shanghai',
  }));
}

/** 城市搜索 / 经纬度反查；query 可以是城市名、LocationID 或 "经度,纬度" */
export async function geoLookup(settings, query) {
  const { geoBaseUrl, geoPath } = resolveHost(settings);
  const raw = await request(settings, geoBaseUrl, geoPath, { location: query, number: 10, lang: 'zh' });
  const locations = normalizeGeoLocations(raw);
  if (locations.length === 0) throw new WeatherApiError(`没有找到“${query}”对应的城市`, { code: 'NO_LOCATION' });
  return locations;
}

/** 经纬度反查最近的城市（系统定位后使用） */
export async function geoReverse(settings, lat, lon) {
  return geoLookup(settings, `${Number(lon).toFixed(2)},${Number(lat).toFixed(2)}`);
}

// ---------- 实时天气 ----------

const compassZh = (compass) => windDirZh(compass).replace(/风$/, '');

export function normalizeCurrentV1(raw) {
  return {
    obsTime: null,
    temp: raw?.temperature?.value ?? null,
    feelsLike: raw?.feelsLike?.value ?? null,
    icon: raw?.condition?.code ?? '999',
    text: raw?.condition?.text ?? '',
    humidity: raw?.humidity != null ? Math.round(raw.humidity * 100) : null,
    windDir: compassZh(raw?.wind?.direction?.compass) || '',
    windScale: raw?.wind?.scale ?? null,
    windSpeed: raw?.wind?.speed?.value ?? null,
    precip: raw?.precipitation?.amount?.value ?? 0,
    pressure: raw?.pressure?.value ?? null,
    vis: raw?.visibility?.value ?? null,
    cloud: raw?.cloudCover != null ? Math.round(raw.cloudCover * 100) : null,
    dew: raw?.dewPoint?.value ?? null,
    uvIndex: raw?.uvIndex ?? null,
  };
}

export function normalizeNowV7(raw) {
  const now = raw?.now || {};
  return {
    obsTime: now.obsTime || null,
    temp: Number(now.temp),
    feelsLike: Number(now.feelsLike),
    icon: now.icon || '999',
    text: now.text || '',
    humidity: Number(now.humidity),
    windDir: now.windDir || '',
    windScale: now.windScale != null ? Number(now.windScale) : null,
    windSpeed: now.windSpeed != null ? Number(now.windSpeed) : null,
    precip: Number(now.precip || 0),
    pressure: Number(now.pressure),
    vis: Number(now.vis),
    cloud: now.cloud != null ? Number(now.cloud) : null,
    dew: now.dew != null ? Number(now.dew) : null,
    uvIndex: now.uvIndex != null ? Number(now.uvIndex) : null,
  };
}

// ---------- 逐时 ----------

export function normalizeHourlyV1(raw) {
  return (raw?.hours || []).map((item) => ({
    fxTime: item.forecastTime,
    temp: item.temperature?.value ?? null,
    icon: item.condition?.code ?? '999',
    text: item.condition?.text ?? '',
    pop: item.precipitation?.probability != null ? Math.round(item.precipitation.probability * 100) : null,
    precip: item.precipitation?.amount?.value ?? 0,
    humidity: item.humidity != null ? Math.round(item.humidity * 100) : null,
    windDir: compassZh(item.wind?.direction?.compass) || '',
    windScale: item.wind?.scale ?? null,
    windSpeed: item.wind?.speed?.value ?? null,
    pressure: item.pressure?.value ?? null,
    uvIndex: item.uvIndex ?? null,
    cloud: item.cloudCover != null ? Math.round(item.cloudCover * 100) : null,
  }));
}

export function normalizeHourlyV7(raw) {
  return (raw?.hourly || []).map((item) => ({
    fxTime: item.fxTime,
    temp: Number(item.temp),
    icon: item.icon || '999',
    text: item.text || '',
    pop: item.pop != null ? Number(item.pop) : null,
    precip: Number(item.precip || 0),
    humidity: item.humidity != null ? Number(item.humidity) : null,
    windDir: item.windDir || '',
    windScale: item.windScale != null ? Number(item.windScale) : null,
    windSpeed: item.windSpeed != null ? Number(item.windSpeed) : null,
    pressure: item.pressure != null ? Number(item.pressure) : null,
    uvIndex: item.uvIndex != null ? Number(item.uvIndex) : null,
    cloud: item.cloud != null ? Number(item.cloud) : null,
  }));
}

// ---------- 逐日 ----------

export function normalizeDailyV1(raw) {
  return (raw?.days || []).map((item) => ({
    fxDate: dateOnly(item.forecastStartTime),
    icon: item.daytime?.condition?.code ?? '999',
    text: item.daytime?.condition?.text ?? '',
    iconNight: item.nighttime?.condition?.code ?? null,
    textNight: item.nighttime?.condition?.text ?? '',
    tempMax: item.temperatureMax?.value ?? null,
    tempMin: item.temperatureMin?.value ?? null,
    sunrise: item.astro?.sunrise ?? null,
    sunset: item.astro?.sunset ?? null,
    windDir: compassZh(item.daytime?.wind?.direction?.compass) || '',
    windScale: item.daytime?.wind?.scale ?? null,
    pop: item.daytime?.precipitation?.probability != null ? Math.round(item.daytime.precipitation.probability * 100) : null,
    uvIndex: item.uvIndexMax ?? null,
    humidity: item.daytime?.humidity != null ? Math.round(item.daytime.humidity * 100) : null,
    precip: item.daytime?.precipitation?.amount?.value ?? 0,
    pressure: null,
  }));
}

export function normalizeDailyV7(raw) {
  return (raw?.daily || []).map((item) => ({
    fxDate: dateOnly(item.fxDate),
    icon: item.iconDay || '999',
    text: item.textDay || '',
    iconNight: item.iconNight || null,
    textNight: item.textNight || '',
    tempMax: Number(item.tempMax),
    tempMin: Number(item.tempMin),
    sunrise: item.sunrise || null,
    sunset: item.sunset || null,
    windDir: (item.windDirDay || '').replace(/风$/, ''),
    windScale: item.windScaleDay != null ? Number(item.windScaleDay) : null,
    pop: item.pop != null ? Number(item.pop) : null,
    uvIndex: item.uvIndex != null ? Number(item.uvIndex) : null,
    humidity: item.humidity != null ? Number(item.humidity) : null,
    precip: item.precip != null ? Number(item.precip) : 0,
    pressure: item.pressure != null ? Number(item.pressure) : null,
  }));
}

// ---------- 空气质量 ----------

function normalizeIndexEntry(item) {
  return {
    code: item?.code || '',
    name: item?.name || '',
    aqi: item?.aqi ?? null,
    aqiDisplay: item?.aqiDisplay ?? (item?.aqi != null ? String(item.aqi) : '—'),
    level: item?.level || '',
    category: aqiCategoryZh(item?.category, item?.level),
    color: rgbaToCss(item?.color) || aqiFallbackColor(item?.aqi),
    primary: item?.primaryPollutant?.name || '',
  };
}

export function normalizeAirV1(raw) {
  const indexes = (raw?.indexes || []).map(normalizeIndexEntry);
  if (indexes.length === 0) throw new WeatherApiError('该地区暂无空气质量数据', { code: 'NO_DATA' });
  // 国内优先看中国标准，其次 US EPA
  const primary =
    indexes.find((item) => item.code === 'cn-mee') ||
    indexes.find((item) => item.code === 'us-epa') ||
    indexes[0];
  const pollutantMap = {};
  for (const item of raw?.pollutants || []) {
    pollutantMap[item.code] = {
      value: item?.concentration?.value ?? null,
      unit: item?.concentration?.unit || 'μg/m³',
      name: POLLUTANT_LABELS[item.code] || item.name || item.code,
    };
  }
  const health = primaryHealth(raw, indexes, primary);
  const index = raw?.indexes?.find((item) => item.code === primary.code) || raw?.indexes?.[0];
  return {
    aqi: primary.aqi,
    aqiDisplay: primary.aqiDisplay,
    level: primary.level,
    category: primary.category,
    color: primary.color,
    primary: primary.primary,
    pollutants: pollutantMap,
    pm2p5: pollutantMap.pm2p5?.value ?? null,
    pm10: pollutantMap.pm10?.value ?? null,
    no2: pollutantMap.no2?.value ?? null,
    so2: pollutantMap.so2?.value ?? null,
    co: pollutantMap.co?.value ?? null,
    o3: pollutantMap.o3?.value ?? null,
    health,
    indexes,
    aqiStandard: primary.code,
    rawIndex: index,
  };
}

function primaryHealth(raw, indexes, primary) {
  const index = raw?.indexes?.find((item) => item.code === primary.code);
  const advice = index?.health?.advice || {};
  return {
    effect: index?.health?.effect || '',
    general: advice.generalPopulation || '',
    sensitive: advice.sensitivePopulation || '',
  };
}

export function normalizeAirV7(raw) {
  const now = raw?.now || {};
  const aqi = now.aqi != null ? Number(now.aqi) : null;
  const color = aqiFallbackColor(aqi);
  return {
    aqi,
    aqiDisplay: aqi == null ? '—' : String(aqi),
    level: now.level || '',
    category: now.category || '',
    color,
    primary: now.primary || '',
    pollutants: {
      pm2p5: { value: now.pm2p5 != null ? Number(now.pm2p5) : null, unit: 'μg/m³', name: 'PM2.5' },
      pm10: { value: now.pm10 != null ? Number(now.pm10) : null, unit: 'μg/m³', name: 'PM10' },
      no2: { value: now.no2 != null ? Number(now.no2) : null, unit: 'μg/m³', name: 'NO₂' },
      so2: { value: now.so2 != null ? Number(now.so2) : null, unit: 'μg/m³', name: 'SO₂' },
      co: { value: now.co != null ? Number(now.co) : null, unit: 'mg/m³', name: 'CO' },
      o3: { value: now.o3 != null ? Number(now.o3) : null, unit: 'μg/m³', name: 'O₃' },
    },
    pm2p5: now.pm2p5 != null ? Number(now.pm2p5) : null,
    pm10: now.pm10 != null ? Number(now.pm10) : null,
    no2: now.no2 != null ? Number(now.no2) : null,
    so2: now.so2 != null ? Number(now.so2) : null,
    co: now.co != null ? Number(now.co) : null,
    o3: now.o3 != null ? Number(now.o3) : null,
    health: null,
    indexes: [],
    aqiStandard: 'cn-mee',
    pubTime: now.pubTime || null,
  };
}

// ---------- 预警 ----------

const WARNING_COLOR_RGB = {
  white: 'rgb(240, 240, 240)',
  gray: 'rgb(120, 120, 120)',
  green: 'rgb(0, 150, 90)',
  blue: 'rgb(30, 80, 200)',
  yellow: 'rgb(230, 180, 0)',
  amber: 'rgb(230, 150, 0)',
  orange: 'rgb(230, 100, 20)',
  red: 'rgb(200, 40, 40)',
  purple: 'rgb(140, 60, 160)',
  black: 'rgb(30, 30, 30)',
};

export function normalizeWarningsV1(raw) {
  return (raw?.alerts || []).map((item) => ({
    id: item.id || `${item.issuedTime}:${item.headline}`,
    title: item.headline || item.description || '天气预警',
    typeName: item.eventType?.name || '',
    severity: item.severity || 'unknown',
    severityText: SEVERITY_ZH[item.severity] || item.severity || '未知',
    colorCode: item.color?.code || '',
    color: rgbaToCss(item.color) || WARNING_COLOR_RGB[item.color?.code] || 'rgb(200, 140, 0)',
    startTime: item.effectiveTime || item.onsetTime || item.issuedTime || null,
    endTime: item.expireTime || null,
    issuedTime: item.issuedTime || null,
    sender: item.senderName || '',
    text: item.description || item.criteria || '',
    guide: item.instruction || '',
  }));
}

const LEVEL_COLOR_RGB = {
  白色: 'rgb(240, 240, 240)',
  蓝色: 'rgb(30, 80, 200)',
  黄色: 'rgb(230, 180, 0)',
  橙色: 'rgb(230, 100, 20)',
  红色: 'rgb(200, 40, 40)',
  黑色: 'rgb(30, 30, 30)',
};

export function normalizeWarningsV7(raw) {
  return (raw?.warning || []).map((item) => ({
    id: item.id || `${item.pubTime}:${item.title}`,
    title: item.title || item.typeName || '天气预警',
    typeName: item.typeName || item.type || '',
    severity: String(item.severity || '').toLowerCase(),
    severityText: item.level || SEVERITY_ZH[String(item.severity || '').toLowerCase()] || '未知',
    colorCode: item.severityColor || '',
    color: LEVEL_COLOR_RGB[item.level] || 'rgb(200, 140, 0)',
    startTime: item.startTime || null,
    endTime: item.endTime || null,
    issuedTime: item.pubTime || null,
    sender: item.sender || '',
    text: item.text || '',
    guide: '',
  }));
}

// ---------- 生活指数 ----------

export function normalizeIndicesV7(raw) {
  return (raw?.daily || []).map((item) => ({
    date: dateOnly(item.date),
    type: item.type,
    name: item.name || `指数 ${item.type}`,
    level: item.level || '',
    category: item.category || '',
    text: item.text || '',
  }));
}

// ---------- 分钟级降水 ----------

export function normalizeMinutelyV7(raw) {
  const items = (raw?.minutely || []).map((item) => ({
    time: item.fxTime,
    precip: Number(item.precip || 0),
    type: item.type || 'rain',
  }));
  if (items.length === 0 && !raw?.summary) return null;
  return { summary: raw?.summary || '', items };
}

// ---------- 对外请求函数 ----------

function placeLocation(place) {
  if (place?.id) return place.id;
  return `${Number(place.lon).toFixed(2)},${Number(place.lat).toFixed(2)}`;
}

function placePathCoords(place) {
  return `${Number(place.lat).toFixed(2)}/${Number(place.lon).toFixed(2)}`;
}

export async function fetchCurrent(settings, place) {
  const host = resolveHost(settings);
  if (host.legacy) {
    const raw = await request(settings, host.baseUrl, '/v7/weather/now', { location: placeLocation(place), lang: 'zh' });
    return normalizeNowV7(raw);
  }
  const raw = await request(settings, host.baseUrl, `/weather/v1/current/${placePathCoords(place)}`, { localTime: 'true', lang: 'zh' });
  return normalizeCurrentV1(raw);
}

export async function fetchHourly(settings, place, hours = 24) {
  const host = resolveHost(settings);
  if (host.legacy) {
    const raw = await request(settings, host.baseUrl, '/v7/weather/24h', { location: placeLocation(place), lang: 'zh' });
    return normalizeHourlyV7(raw);
  }
  const raw = await request(settings, host.baseUrl, `/weather/v1/hourly/${placePathCoords(place)}`, {
    hours,
    localTime: 'true',
    lang: 'zh',
  });
  return normalizeHourlyV1(raw);
}

export async function fetchDaily(settings, place, days = 7) {
  const host = resolveHost(settings);
  if (host.legacy) {
    const raw = await request(settings, host.baseUrl, '/v7/weather/7d', { location: placeLocation(place), lang: 'zh' });
    return normalizeDailyV7(raw);
  }
  const raw = await request(settings, host.baseUrl, `/weather/v1/daily/${placePathCoords(place)}`, {
    days,
    localTime: 'true',
    lang: 'zh',
  });
  return normalizeDailyV1(raw);
}

export async function fetchAir(settings, place) {
  const host = resolveHost(settings);
  if (!host.legacy) {
    try {
      const raw = await request(settings, host.baseUrl, `/airquality/v1/current/${placePathCoords(place)}`, { lang: 'zh' });
      return normalizeAirV1(raw);
    } catch (error) {
      // 自定义 Host 但空气接口不可用时，退回旧接口
      if (!(error instanceof WeatherApiError) || error.status === 401 || error.status === 429) throw error;
    }
  }
  const raw = await request(settings, host.baseUrl, '/v7/air/now', { location: placeLocation(place), lang: 'zh' });
  return normalizeAirV7(raw);
}

export async function fetchWarnings(settings, place) {
  const host = resolveHost(settings);
  if (!host.legacy) {
    try {
      const raw = await request(settings, host.baseUrl, `/weatheralert/v1/current/${placePathCoords(place)}`, {
        localTime: 'true',
        lang: 'zh',
      });
      return normalizeWarningsV1(raw);
    } catch (error) {
      if (!(error instanceof WeatherApiError) || error.status === 401 || error.status === 429) throw error;
    }
  }
  const raw = await request(settings, host.baseUrl, '/v7/warning/now', { location: placeLocation(place), lang: 'zh' });
  return normalizeWarningsV7(raw);
}

export async function fetchIndices(settings, place) {
  const host = resolveHost(settings);
  const raw = await request(settings, host.baseUrl, '/v7/indices/1d', { type: '0', location: placeLocation(place), lang: 'zh' });
  return normalizeIndicesV7(raw);
}

export async function fetchMinutely(settings, place) {
  const host = resolveHost(settings);
  const raw = await request(settings, host.baseUrl, '/v7/minutely/5m', {
    location: `${Number(place.lon).toFixed(2)},${Number(place.lat).toFixed(2)}`,
    lang: 'zh',
  });
  return normalizeMinutelyV7(raw);
}

export { buildUrl, isJwt };
