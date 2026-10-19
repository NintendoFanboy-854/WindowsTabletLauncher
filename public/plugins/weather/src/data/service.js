/**
 * 天气数据编排：请求 → 归一化 → 按城市缓存 → 失败时回退缓存。
 * mock 模式（无 Key 开发/截图）走 mock.js，不联网。
 */

import * as api from './api.js';
import { mockGeoLookup, mockReverseLookup, mockWeatherData, mockPlaceById } from './mock.js';
import { hasApiKey, WeatherApiError } from './api.js';

export { WeatherApiError };

const REQUIRED_SECTIONS = ['current', 'hourly', 'daily'];

export function isMock(settings) {
  return Boolean(settings?.mock);
}

/**
 * 工具处理器从宿主配置读到的 settings 不含 `mock`（它不是 schema 字段）；
 * 视图内把 URL 演示开关作为运行时标志注回去，保证工具与 UI 走同一份数据源。
 */
export function applyMock(settings, mock) {
  return mock ? { ...settings, mock: true } : settings;
}

export function hasKeyOrMock(settings) {
  return isMock(settings) || hasApiKey(settings);
}

/** 城市搜索（城市名 / 经纬度 / LocationID） */
export async function searchPlaces(settings, query) {
  const text = String(query || '').trim();
  if (!text) return [];
  if (isMock(settings)) return mockGeoLookup(text);
  return api.geoLookup(settings, text);
}

/** 系统定位结果（经纬度）→ 最近城市 */
export async function reverseLookup(settings, lat, lon) {
  if (lat == null || lon == null) return null;
  if (isMock(settings)) return mockReverseLookup(lon, lat);
  const results = await api.geoReverse(settings, lat, lon);
  return results[0] || null;
}

function sectionPlan(settings) {
  const plan = {
    current: (place) => api.fetchCurrent(settings, place),
    hourly: (place) => api.fetchHourly(settings, place),
    daily: (place) => api.fetchDaily(settings, place),
  };
  if (settings.showAir) plan.air = (place) => api.fetchAir(settings, place);
  if (settings.showWarnings) plan.warnings = (place) => api.fetchWarnings(settings, place);
  return plan;
}

/**
 * 拉取一个城市的天气。
 * @returns {{ data: object, offline: boolean, failures: {section: string, message: string}[], fetchedAt: number }}
 */
export async function loadWeather(settings, place, previous) {
  if (!place) throw new WeatherApiError('还没有选择城市', { code: 'NO_PLACE' });
  if (isMock(settings)) {
    const data = mockWeatherData(place);
    return { data, offline: false, failures: [], fetchedAt: data.fetchedAt };
  }
  if (!hasApiKey(settings)) {
    throw new WeatherApiError('未配置和风天气 API Key：请在宿主「设置 → 插件 → 天气」填写 API Key 与 API Host', {
      status: 401,
      code: 'NO_KEY',
    });
  }

  const plan = sectionPlan(settings);
  const sections = Object.keys(plan);
  const settled = await Promise.allSettled(sections.map((section) => plan[section](place)));

  const data = { ...(previous || {}) };
  const failures = [];
  let updatedCount = 0;
  settled.forEach((result, index) => {
    const section = sections[index];
    if (result.status === 'fulfilled') {
      data[section] = result.value;
      updatedCount += 1;
    } else {
      const error = result.reason;
      failures.push({
        section,
        message: error?.message || '请求失败',
        status: error?.status || 0,
        code: error?.code || '',
      });
    }
  });

  const criticalFailed = failures.some((failure) => REQUIRED_SECTIONS.includes(failure.section));
  const hasAnyData = data.current && data.hourly && data.daily;
  if (updatedCount > 0) data.fetchedAt = Date.now();
  const offline = criticalFailed || !hasAnyData;

  if (offline && !previous) {
    // 没有任何缓存可用：抛出第一个必需段落的错误，让 UI 显示错误态
    const first = failures.find((failure) => REQUIRED_SECTIONS.includes(failure.section)) || failures[0];
    throw new WeatherApiError(first?.message || '天气数据加载失败', { status: first?.status || 0, code: first?.code || '' });
  }

  return {
    data,
    offline,
    failures,
    fetchedAt: data.fetchedAt,
    fromCache: criticalFailed,
  };
}

/** 打开详情时按需补齐的段落（空气质量 / 预警 / 生活指数 / 分钟级降水） */
export async function loadDetailSection(settings, place, section) {
  if (!place) throw new WeatherApiError('还没有选择城市', { code: 'NO_PLACE' });
  if (isMock(settings)) {
    const data = mockWeatherData(place);
    return data[section] ?? null;
  }
  if (!hasApiKey(settings)) {
    throw new WeatherApiError('未配置和风天气 API Key', { status: 401, code: 'NO_KEY' });
  }
  switch (section) {
    case 'air':
      return api.fetchAir(settings, place);
    case 'warnings':
      return api.fetchWarnings(settings, place);
    case 'indices':
      return api.fetchIndices(settings, place);
    case 'minutely':
      return api.fetchMinutely(settings, place);
    default:
      return null;
  }
}

/** mock 城市（Agent addPlace 在 mock 模式下只接受内置城市） */
export function mockPlace(queryOrId) {
  return mockPlaceById(queryOrId);
}
