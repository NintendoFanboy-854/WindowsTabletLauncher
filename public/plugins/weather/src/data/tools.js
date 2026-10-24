/**
 * Agent 工具：声明 + 执行（契约 §6，UI 路径 ↔ 工具一一对应）。
 *
 * 工具名严格按 docs/components/weather.md：
 *   weather.current / hourly / daily / air / warning / queryPlace
 *   weather.places / addPlace / removePlace / setCurrentPlace
 *   weather.refresh / locate / settings.get / settings.set
 *
 * `place` 参数接受城市名、和风 LocationID 或 "current"（默认当前城市）。
 * 工具从宿主配置读最新状态，与卡片/详情 UI 共用同一份数据层。
 */

import {
  CACHE_KEY,
  PLACES_KEY,
  SETTINGS_KEY,
  addPlaceToList,
  applyLocatedPlace,
  currentPlaceOf,
  findPlace,
  normalizeCache,
  normalizePlaces,
  normalizeSettings,
  removePlaceFromList,
  withCurrentPlace,
} from './store.js';
import { plugin } from '/plugin-sdk.js';
import {
  applyMock,
  hasKeyOrMock,
  loadDetailSection,
  loadWeather,
  searchPlaces,
} from './service.js';
import { WeatherApiError } from './api.js';
import { canLocate, locatePlace } from './locate.js';
import { fmtUpdatedAgo, WIND_COMPASS_ZH } from './format.js';

const placeSchema = {
  type: 'string',
  description: '城市名、和风 LocationID 或 "current"（默认当前城市）',
};

const SETTING_KEYS = [
  'unit',
  'refreshMin',
  'autoLocate',
  'showAir',
  'showWarnings',
  'showMinutely',
  'apiKey',
  'apiHost',
];

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
    description: '获取指定城市的实时空气质量（AQI、等级、首要污染物、PM2.5 等浓度）。',
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
  {
    name: 'weather.setCurrentPlace',
    description: '把城市列表里已有的某个城市设为当前显示城市（不改变列表）。',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string', description: '和风 LocationID' } },
      required: ['id'],
    },
  },
  {
    name: 'weather.refresh',
    description: '立即刷新天气数据（默认当前城市），忽略缓存。',
    parameters: { type: 'object', properties: { place: placeSchema } },
  },
  {
    name: 'weather.locate',
    description:
      '自动定位并应用定位城市：系统定位优先，失败用 ip.cn 网络归属地兜底，再由和风 GeoAPI 换成坐标。定位成功后自动加入城市列表并设为当前城市（已存在则切换；已是当前时不重复写入）。',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'weather.settings.get',
    description: '读取天气插件设置（温度单位、刷新间隔、显示项、自动定位、API Key 是否已配置）。',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'weather.settings.set',
    description:
      '修改天气插件设置。只传要改的字段：unit(c/f)、refreshMin(15/30/60)、autoLocate、showAir、showWarnings、showMinutely、apiKey、apiHost。',
    parameters: {
      type: 'object',
      properties: {
        unit: { type: 'string', enum: ['c', 'f'], description: '温度单位' },
        refreshMin: { type: 'number', enum: [15, 30, 60], description: '刷新间隔（分钟）' },
        autoLocate: { type: 'boolean', description: '自动定位' },
        showAir: { type: 'boolean', description: '显示空气质量' },
        showWarnings: { type: 'boolean', description: '显示天气预警' },
        showMinutely: { type: 'boolean', description: '显示分钟级降水' },
        apiKey: { type: 'string', description: '和风天气 API Key' },
        apiHost: { type: 'string', description: '和风天气 API Host' },
      },
    },
  },
];

const FETCH_TTL_MS = 5 * 60 * 1000;

function round(value, digits = 0) {
  if (value == null || Number.isNaN(Number(value))) return null;
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function fmtPlace(place) {
  return {
    id: place.id,
    name: place.name,
    region: [place.adm2, place.adm1].filter(Boolean).join(' · ') || place.adm1 || '',
    lat: place.lat,
    lon: place.lon,
  };
}

function publicSettings(settings) {
  return {
    unit: settings.unit,
    refreshMin: settings.refreshMin,
    autoLocate: settings.autoLocate,
    showAir: settings.showAir,
    showWarnings: settings.showWarnings,
    showMinutely: settings.showMinutely,
    apiHost: settings.apiHost,
    hasApiKey: Boolean(settings.apiKey),
  };
}

function fmtWind(dir, scale, speed) {
  const name = dir || WIND_COMPASS_ZH.none;
  if (scale != null) return `${name}${scale}级`;
  if (speed != null) return `${name}${Math.round(Number(speed) * 3.6)}km/h`;
  return name;
}

function currentResult(place, data) {
  const current = data.current || {};
  return {
    place: fmtPlace(place),
    updated: fmtUpdatedAgo(data.fetchedAt),
    current: {
      text: current.text || '',
      temperatureC: round(current.temp, 1),
      feelsLikeC: round(current.feelsLike, 1),
      humidityPercent: current.humidity,
      wind: fmtWind(current.windDir, current.windScale, current.windSpeed),
      pressureHpa: round(current.pressure),
      visibilityKm: current.vis == null ? null : round(current.vis / 1000, 1),
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

function requireConfigured(settings) {
  if (!hasKeyOrMock(settings)) {
    throw new WeatherApiError(
      '天气插件未配置和风天气 API Key',
      { status: 401, code: 'NO_KEY' },
    );
  }
}

async function loadState(context) {
  const [rawSettings, rawPlaces, rawCache] = await Promise.all([
    plugin.getConfig(SETTINGS_KEY).catch(() => null),
    plugin.getConfig(PLACES_KEY).catch(() => null),
    plugin.getConfig(CACHE_KEY).catch(() => null),
  ]);
  const settings = applyMock(normalizeSettings(rawSettings), context.mock);
  let places = normalizePlaces(rawPlaces);
  // 迁移尚未跑完时的兜底：旧版把 places 写在 settings 里
  if (places.length === 0 && rawSettings && typeof rawSettings === 'object') {
    places = normalizePlaces(rawSettings.places);
  }
  return { settings, places, cache: normalizeCache(rawCache) };
}

async function resolvePlace(state, placeArg) {
  const text = typeof placeArg === 'string' ? placeArg.trim() : '';
  if (!text || text === 'current' || text === '当前' || text === '当前城市') {
    const place = currentPlaceOf(state.places);
    if (!place) throw new WeatherApiError('天气插件还没有任何城市', { code: 'NO_PLACE' });
    return place;
  }
  const byId = findPlace(state.places, text);
  if (byId) return byId;
  const byName = state.places.find((place) => place.name === text || place.name.includes(text));
  if (byName) return byName;
  const results = await searchPlaces(state.settings, text);
  if (results.length === 0) throw new WeatherApiError(`没有找到城市“${text}”`, { code: 'NO_LOCATION' });
  return results[0];
}

/** 同一个城市 5 分钟内复用缓存，避免 Agent 连续调用重复打接口；refresh 工具强制重取 */
async function weatherFor(context, place, { force = false } = {}) {
  const state = await loadState(context);
  const previous = state.cache[place.id] || null;
  if (!force && previous && previous.fetchedAt && Date.now() - previous.fetchedAt < FETCH_TTL_MS) {
    return previous;
  }
  const result = await loadWeather(state.settings, place, previous);
  const merged = { ...result.data, placeId: place.id };
  context.weather.putCache(place.id, merged);
  return merged;
}

function ensurePlaceInList(state, id) {
  const place = findPlace(state.places, id);
  if (!place) throw new WeatherApiError(`城市列表里没有 id 为 ${id} 的城市`, { code: 'NO_PLACE' });
  return place;
}

function locatedMessage({ added, switched, name }) {
  if (added) return `定位城市 ${name} 已加入并设为当前`;
  if (switched) return `已切换当前城市为 ${name}`;
  return `当前城市已是 ${name}`;
}

/** 注册到 useAgentTools 的处理器表；context 由卡片视图提供 */
export function createToolHandlers(context) {
  return {
    'weather.current': async (args = {}) => {
      const state = await loadState(context);
      const place = await resolvePlace(state, args.place);
      const data = await weatherFor(context, place);
      return currentResult(place, data);
    },

    'weather.hourly': async (args = {}) => {
      const state = await loadState(context);
      const place = await resolvePlace(state, args.place);
      const data = await weatherFor(context, place);
      const hours = Math.min(24, Math.max(1, Number(args.hours) || 12));
      return {
        place: fmtPlace(place),
        hours: (data.hourly || []).slice(0, hours).map((item) => ({
          time: item.fxTime,
          text: item.text,
          temperatureC: round(item.temp, 1),
          precipitationProbabilityPercent: item.pop,
          wind: fmtWind(item.windDir, item.windScale, item.windSpeed),
          humidityPercent: item.humidity,
          uvIndex: item.uvIndex,
        })),
      };
    },

    'weather.daily': async (args = {}) => {
      const state = await loadState(context);
      const place = await resolvePlace(state, args.place);
      const data = await weatherFor(context, place);
      const days = Math.min(7, Math.max(1, Number(args.days) || 7));
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
          wind: fmtWind(item.windDir, item.windScale),
        })),
      };
    },

    'weather.air': async (args = {}) => {
      const state = await loadState(context);
      const place = await resolvePlace(state, args.place);
      const data = await weatherFor(context, place);
      const air = data.air || (await loadDetailSection(state.settings, place, 'air'));
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
        updated: fmtUpdatedAgo(data.fetchedAt),
      };
    },

    'weather.warning': async (args = {}) => {
      const state = await loadState(context);
      const place = await resolvePlace(state, args.place);
      const data = await weatherFor(context, place);
      const warnings = data.warnings || (await loadDetailSection(state.settings, place, 'warnings')) || [];
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
    },

    'weather.queryPlace': async (args = {}) => {
      const city = String(args.city || '').trim();
      if (!city) throw new WeatherApiError('queryPlace 需要 city 参数');
      const state = await loadState(context);
      requireConfigured(state.settings);
      const results = await searchPlaces(state.settings, city);
      if (results.length === 0) throw new WeatherApiError(`没有找到城市“${city}”`);
      const place = results[0];
      const data = await weatherFor(context, place);
      return {
        ...currentResult(place, data),
        matchedLocation: {
          id: place.id,
          name: place.name,
          adm1: place.adm1,
          adm2: place.adm2,
          country: place.country,
        },
      };
    },

    'weather.places': async () => {
      const state = await loadState(context);
      return {
        currentPlaceId: currentPlaceOf(state.places)?.id || null,
        places: state.places.map((place) => ({
          id: place.id,
          name: place.name,
          region: [place.adm2, place.adm1].filter(Boolean).join(' · '),
          isCurrent: Boolean(place.isCurrent),
        })),
      };
    },

    'weather.addPlace': async (args = {}) => {
      const city = String(args.city || '').trim();
      if (!city) throw new WeatherApiError('addPlace 需要 city 参数');
      const state = await loadState(context);
      requireConfigured(state.settings);
      const results = await searchPlaces(state.settings, city);
      if (results.length === 0) throw new WeatherApiError(`没有找到城市“${city}”`);
      const place = results[0];
      const next = addPlaceToList(state.places, place);
      context.weather.updatePlaces(next);
      return {
        added: fmtPlace(place),
        currentPlaceId: place.id,
        places: next.map((item) => ({ id: item.id, name: item.name, isCurrent: item.isCurrent })),
      };
    },

    'weather.removePlace': async (args = {}) => {
      const id = String(args.id || '').trim();
      if (!id) throw new WeatherApiError('removePlace 需要 id 参数');
      const state = await loadState(context);
      ensurePlaceInList(state, id);
      const next = removePlaceFromList(state.places, id);
      context.weather.updatePlaces(next);
      return {
        removed: id,
        currentPlaceId: currentPlaceOf(next)?.id || null,
        places: next.map((item) => ({ id: item.id, name: item.name, isCurrent: item.isCurrent })),
      };
    },

    'weather.setCurrentPlace': async (args = {}) => {
      const id = String(args.id || '').trim();
      if (!id) throw new WeatherApiError('setCurrentPlace 需要 id 参数');
      const state = await loadState(context);
      ensurePlaceInList(state, id);
      const next = withCurrentPlace(state.places, id);
      context.weather.updatePlaces(next);
      return {
        currentPlaceId: id,
        current: fmtPlace(findPlace(next, id)),
      };
    },

    'weather.refresh': async (args = {}) => {
      const state = await loadState(context);
      requireConfigured(state.settings);
      const place = await resolvePlace(state, args.place);
      const active = currentPlaceOf(state.places);
      if (active && active.id === place.id) {
        const merged = await context.weather.refresh();
        if (!merged) throw new WeatherApiError('刷新失败，暂时保留已缓存的数据');
        return currentResult(place, merged);
      }
      const data = await weatherFor(context, place, { force: true });
      return currentResult(place, data);
    },

    'weather.locate': async () => {
      const state = await loadState(context);
      requireConfigured(state.settings);
      if (!state.settings.autoLocate) {
        throw new WeatherApiError('自动定位已关闭', { code: 'LOCATE_OFF' });
      }
      const result = await locatePlace(state.settings);
      if (!result?.place) {
        throw new WeatherApiError('定位失败：系统定位与 ip.cn 网络归属地都没有返回可用城市', {
          code: 'LOCATE_FAILED',
        });
      }
      const located = { ...result.place };
      const locationValue = {
        place: located,
        source: result.source,
        at: Date.now(),
        applied: true,
      };
      context.weather.setLocation(locationValue);

      // 定位成功即应用：不存在则加入，已存在则切换为当前；已是当前城市则跳过写配置
      const existing = findPlace(state.places, located.id);
      const next = applyLocatedPlace(state.places, located);
      const added = !existing;
      const switched = next !== state.places;
      if (switched) context.weather.updatePlaces(next);
      return {
        located: fmtPlace(located),
        source: result.source,
        added,
        switched,
        alreadyCurrent: Boolean(existing?.isCurrent),
        currentPlaceId: currentPlaceOf(next)?.id || null,
        message: locatedMessage({ added, switched, name: located.name }),
      };
    },

    'weather.settings.get': async () => {
      const state = await loadState(context);
      return {
        settings: publicSettings(state.settings),
        placesCount: state.places.length,
        currentPlaceId: currentPlaceOf(state.places)?.id || null,
      };
    },

    'weather.settings.set': async (args = {}) => {
      const state = await loadState(context);
      const patch = {};

      if ('unit' in args) {
        if (args.unit !== 'c' && args.unit !== 'f') throw new WeatherApiError('unit 只能是 c 或 f');
        patch.unit = args.unit;
      }
      if ('refreshMin' in args) {
        const value = Number(args.refreshMin);
        if (![15, 30, 60].includes(value)) throw new WeatherApiError('refreshMin 只能是 15 / 30 / 60');
        patch.refreshMin = value;
      }
      for (const key of ['autoLocate', 'showAir', 'showWarnings', 'showMinutely']) {
        if (!(key in args)) continue;
        if (typeof args[key] !== 'boolean') throw new WeatherApiError(`${key} 需要是布尔值`);
        patch[key] = args[key];
      }
      for (const key of ['apiKey', 'apiHost']) {
        if (!(key in args)) continue;
        patch[key] = String(args[key] ?? '');
      }
      if (Object.keys(patch).length === 0) {
        throw new WeatherApiError(`settings.set 至少需要一个字段：${SETTING_KEYS.join(' / ')}`);
      }

      const next = normalizeSettings({ ...state.settings, ...patch });
      context.weather.setSettings(next);
      return {
        settings: publicSettings(next),
        changed: Object.keys(patch),
      };
    },
  };
}

export { loadState };
