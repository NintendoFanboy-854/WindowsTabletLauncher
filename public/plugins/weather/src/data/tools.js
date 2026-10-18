/**
 * Agent 工具：声明 + 执行。
 *
 * 工具名严格按 docs/components/weather.md：weather.current/hourly/daily/air/warning/
 * queryPlace/places/addPlace/removePlace。place 参数接受城市名、LocationID 或 "current"。
 */

import {
  currentPlace,
  findPlace,
  addPlaceToSettings,
  removePlaceFromSettings,
  placeMenuLabel,
} from './store.js';
import { loadWeather, loadDetailSection, searchPlaces, isMock } from './service.js';
import { hasApiKey, WeatherApiError } from './api.js';
import { fmtUpdatedAgo, WIND_COMPASS_ZH } from './format.js';

const placeSchema = {
  type: 'string',
  description: '城市名、和风 LocationID 或 "current"（默认当前城市）',
};

export const AGENT_TOOLS = [
  {
    name: 'weather.current',
    description: '获取指定城市的实时天气（温度、体感、天气现象、湿度、风、气压、能见度等）。不传 place 时用当前城市。',
    parameters: { type: 'object', properties: { place: placeSchema } },
  },
  {
    name: 'weather.hourly',
    description: '获取指定城市未来逐小时天气预报，默认 12 小时，最多 24 小时。',
    parameters: {
      type: 'object',
      properties: {
        place: placeSchema,
        hours: { type: 'number', description: '返回多少小时，默认 12，范围 1-24' },
      },
    },
  },
  {
    name: 'weather.daily',
    description: '获取指定城市未来逐日天气预报，默认 7 天，最多 7 天。',
    parameters: {
      type: 'object',
      properties: {
        place: placeSchema,
        days: { type: 'number', description: '返回多少天，默认 7，范围 1-7' },
      },
    },
  },
  {
    name: 'weather.air',
    description: '获取指定城市的实时空气质量（AQI、等级、首要污染物、PM2.5 等浓度与健康建议）。',
    parameters: { type: 'object', properties: { place: placeSchema } },
  },
  {
    name: 'weather.warning',
    description: '获取指定城市当前生效的天气预警列表（标题、类型、严重程度、生效时间、防御指南）。',
    parameters: { type: 'object', properties: { place: placeSchema } },
  },
  {
    name: 'weather.queryPlace',
    description: '查询任意地方（不必在用户城市列表里）的天气：先用 GeoAPI 按城市名搜索，再返回实时天气与今日最高/最低温。',
    parameters: {
      type: 'object',
      properties: { city: { type: 'string', description: '要查询的城市名，例如“杭州”或“Tokyo”' } },
      required: ['city'],
    },
  },
  {
    name: 'weather.places',
    description: '列出用户天气卡片里保存的城市及当前城市。',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'weather.addPlace',
    description: '按城市名搜索并添加城市到天气卡片，添加后自动设为当前城市。',
    parameters: {
      type: 'object',
      properties: { city: { type: 'string', description: '城市名，例如“上海”' } },
      required: ['city'],
    },
  },
  {
    name: 'weather.removePlace',
    description: '从天气卡片删除一个城市，参数是 LocationID。',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string', description: '和风 LocationID，例如 101010100' } },
      required: ['id'],
    },
  },
];

const FETCH_TTL_MS = 5 * 60 * 1000;
/** 工具自己的短缓存，避免 Agent 连续调用时重复打接口 */
const toolCache = new Map();

function cacheKey(settings, placeId) {
  return `${isMock(settings) ? 'mock' : 'live'}:${settings.apiHost || 'devapi'}:${placeId}`;
}

async function weatherFor(settings, place, { force = false } = {}) {
  const key = cacheKey(settings, place.id);
  const cached = toolCache.get(key);
  if (!force && cached && Date.now() - cached.fetchedAt < FETCH_TTL_MS) return cached.data;
  const { data, fetchedAt } = await loadWeather(settings, place, cached?.data);
  toolCache.set(key, { data, fetchedAt: fetchedAt || Date.now() });
  return data;
}

function requireConfigured(settings) {
  if (!isMock(settings) && !hasApiKey(settings)) {
    throw new WeatherApiError('天气插件还没配置和风天气 API Key：请长按天气卡片打开设置填写 API Key 与 API Host。', {
      status: 401,
      code: 'NO_KEY',
    });
  }
}

function ensureSection(settings, data, section) {
  if (data && data[section]) return data[section];
  return null;
}

async function resolvePlace(settings, placeArg) {
  requireConfigured(settings);
  const text = typeof placeArg === 'string' ? placeArg.trim() : '';
  if (!text || text === 'current' || text === '当前' || text === '当前城市') {
    const place = currentPlace(settings);
    if (!place) throw new WeatherApiError('天气插件还没有任何城市', { code: 'NO_PLACE' });
    return place;
  }
  const byId = findPlace(settings, text);
  if (byId) return byId;
  const byName = settings.places.find((place) => place.name === text || place.name.includes(text));
  if (byName) return byName;
  // 不在列表里就按城市名搜索
  const results = await searchPlaces(settings, text);
  if (results.length === 0) throw new WeatherApiError(`没有找到城市“${text}”`, { code: 'NO_LOCATION' });
  return results[0];
}

function round(value, digits = 0) {
  if (value == null || Number.isNaN(Number(value))) return null;
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function fmtPlace(place) {
  return { id: place.id, name: place.name, region: placeMenuLabel(place), lat: place.lat, lon: place.lon };
}

function currentResult(place, data) {
  const current = data.current;
  return {
    place: fmtPlace(place),
    updated: fmtUpdatedAgo(data.fetchedAt),
    current: {
      text: current.text,
      temperatureC: round(current.temp, 1),
      feelsLikeC: round(current.feelsLike, 1),
      humidityPercent: current.humidity,
      wind: `${current.windDir || WIND_COMPASS_ZH.none}${current.windScale != null ? `${current.windScale}级` : ''}`,
      pressureHpa: round(current.pressure),
      visibilityKm: round(current.vis / 1000, 1),
      precipitationMm: round(current.precip, 1),
      uvIndex: current.uvIndex,
      observedAt: current.obsTime,
    },
    today: data.daily?.[0]
      ? {
          text: data.daily[0].text,
          highC: round(data.daily[0].tempMax, 1),
          lowC: round(data.daily[0].tempMin, 1),
          precipitationProbabilityPercent: data.daily[0].pop,
          sunrise: data.daily[0].sunrise,
          sunset: data.daily[0].sunset,
        }
      : null,
  };
}

export async function runTool(name, args, context) {
  const settings = context.getSettings();
  requireConfigured(settings);
  const argMap = args && typeof args === 'object' ? args : {};

  switch (name) {
    case 'weather.current': {
      const place = await resolvePlace(settings, argMap.place);
      const data = await weatherFor(settings, place);
      return currentResult(place, data);
    }
    case 'weather.hourly': {
      const place = await resolvePlace(settings, argMap.place);
      const data = await weatherFor(settings, place);
      const hours = Math.min(24, Math.max(1, Number(argMap.hours) || 12));
      return {
        place: fmtPlace(place),
        hours: (data.hourly || []).slice(0, hours).map((item) => ({
          time: item.fxTime,
          text: item.text,
          temperatureC: round(item.temp, 1),
          precipitationProbabilityPercent: item.pop,
          wind: `${item.windDir || ''}${item.windScale != null ? `${item.windScale}级` : ''}`,
          humidityPercent: item.humidity,
          uvIndex: item.uvIndex,
        })),
      };
    }
    case 'weather.daily': {
      const place = await resolvePlace(settings, argMap.place);
      const data = await weatherFor(settings, place);
      const days = Math.min(7, Math.max(1, Number(argMap.days) || 7));
      return {
        place: fmtPlace(place),
        days: (data.daily || []).slice(0, days).map((item) => ({
          date: item.fxDate,
          text: item.text,
          textNight: item.textNight,
          highC: round(item.tempMax, 1),
          lowC: round(item.tempMin, 1),
          precipitationProbabilityPercent: item.pop,
          uvIndex: item.uvIndex,
          sunrise: item.sunrise,
          sunset: item.sunset,
          wind: `${item.windDir || ''}${item.windScale != null ? `${item.windScale}级` : ''}`,
        })),
      };
    }
    case 'weather.air': {
      const place = await resolvePlace(settings, argMap.place);
      let data = await weatherFor(settings, place);
      let air = ensureSection(settings, data, 'air');
      if (!air) {
        air = await loadDetailSection(settings, place, 'air');
        data = { ...data, air };
      }
      return {
        place: fmtPlace(place),
        aqi: air.aqi,
        category: air.category,
        level: air.level,
        standard: air.aqiStandard,
        primaryPollutant: air.primary,
        pollutants: {
          pm2p5: air.pm2p5,
          pm10: air.pm10,
          no2: air.no2,
          so2: air.so2,
          co: air.co,
          o3: air.o3,
        },
        health: air.health,
      };
    }
    case 'weather.warning': {
      const place = await resolvePlace(settings, argMap.place);
      const data = await weatherFor(settings, place);
      let warnings = ensureSection(settings, data, 'warnings');
      if (!warnings) {
        warnings = (await loadDetailSection(settings, place, 'warnings')) || [];
      }
      return {
        place: fmtPlace(place),
        count: warnings.length,
        warnings: warnings.map((item) => ({
          title: item.title,
          type: item.typeName,
          severity: item.severityText,
          color: item.colorCode,
          effectiveTime: item.startTime,
          expireTime: item.endTime,
          description: item.text,
          instruction: item.guide,
        })),
      };
    }
    case 'weather.queryPlace': {
      const city = String(argMap.city || '').trim();
      if (!city) throw new WeatherApiError('queryPlace 需要 city 参数');
      const results = await searchPlaces(settings, city);
      if (results.length === 0) throw new WeatherApiError(`没有找到城市“${city}”`);
      const place = results[0];
      const { data } = await loadWeather(settings, place);
      return {
        ...currentResult(place, data),
        matchedLocation: { id: place.id, name: place.name, adm1: place.adm1, adm2: place.adm2, country: place.country },
      };
    }
    case 'weather.places': {
      return {
        currentPlaceId: currentPlace(settings)?.id || null,
        places: settings.places.map((place) => ({
          id: place.id,
          name: place.name,
          region: placeMenuLabel(place),
          isCurrent: Boolean(place.isCurrent),
        })),
      };
    }
    case 'weather.addPlace': {
      const city = String(argMap.city || '').trim();
      if (!city) throw new WeatherApiError('addPlace 需要 city 参数');
      const results = await searchPlaces(settings, city);
      if (results.length === 0) throw new WeatherApiError(`没有找到城市“${city}”`);
      const place = results[0];
      const next = addPlaceToSettings(settings, place);
      await context.updateSettings(next);
      return { added: fmtPlace(place), currentPlaceId: place.id, places: next.places.map((item) => ({ id: item.id, name: item.name })) };
    }
    case 'weather.removePlace': {
      const id = String(argMap.id || '').trim();
      if (!id) throw new WeatherApiError('removePlace 需要 id 参数');
      if (!findPlace(settings, id)) throw new WeatherApiError(`城市列表里没有 id 为 ${id} 的城市`);
      const next = removePlaceFromSettings(settings, id);
      await context.updateSettings(next);
      return { removed: id, currentPlaceId: currentPlace(next)?.id || null, places: next.places.map((item) => ({ id: item.id, name: item.name })) };
    }
    default:
      throw new WeatherApiError(`未知的天气工具：${name}`, { code: 'UNKNOWN_TOOL' });
  }
}

export { loadWeather };
