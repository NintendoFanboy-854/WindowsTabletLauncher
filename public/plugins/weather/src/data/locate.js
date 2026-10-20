/**
 * 自动定位链路（DECISIONS D-16）：
 *
 *   1. 系统定位 `plugin.getLocation()`（Windows Geolocator，有坐标）
 *      → 和风 GeoAPI 反查最近城市；
 *   2. 失败/无坐标 → `plugin.ipLocate()`（ip.cn 网络归属地，只有省/市，没有坐标）
 *      → 和风 GeoAPI 按城市名换 id/经纬度；
 *   3. 全失败返回 null：保留上次城市，由 UI 提示手动搜索。
 *
 * 整条链路 8 秒封顶（ip.cn 后端自己也有 8 秒超时）；不阻塞首屏——卡片/详情先显示
 * 缓存或加载态，定位成功后由调用方（useWeather 自动应用 / weather.locate 工具）把
 * 定位城市加入列表并设为当前城市，卡片/详情随配置变化刷新。
 * 浏览器 dev 没有 Tauri 后端：getLocation / ipLocate 都返回 null，这里静默跳过。
 *
 * 无 API Key 时自动定位直接跳过（GeoAPI 换坐标需要 Key）；mock 模式用 mock 城市演示。
 */

import { plugin } from '/plugin-sdk.js';
import { geoLookup, geoReverse, hasApiKey } from './api.js';
import { MOCK_PLACES } from './mock.js';

/** 定位结果可复用的时长：30 分钟内不重复请求系统定位 / ip.cn */
export const LOCATION_TTL_MS = 30 * 60 * 1000;

/** 整条链路总预算（D-16：8s 级超时） */
const TOTAL_BUDGET_MS = 8000;
/** 系统定位预算（Windows 定位授权弹窗/超时都在这段时间内结束） */
const SYSTEM_BUDGET_MS = 2500;
/** ip.cn 预算（后端总超时 8s，这里给前端链路留余量） */
const IP_BUDGET_MS = 4000;
/** GeoAPI 换城市预算 */
const GEO_BUDGET_MS = 2500;

/** 定位可用的前提：mock 演示，或配置了和风 API Key */
export function canLocate(settings) {
  return Boolean(settings?.mock) || hasApiKey(settings);
}

export function isLocationFresh(location, now = Date.now()) {
  if (!location || !location.at) return false;
  return now - location.at < LOCATION_TTL_MS;
}

/**
 * 给任意 promise 加超时：超时或异常都收敛成 null，调用方只判断“拿到没拿到”。
 * 计时器在 promise 落地后清理，避免 8s 内挂一堆定时器。
 */
async function withTimeout(task, ms) {
  let timer = 0;
  try {
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => resolve(null), Math.max(0, ms));
    });
    const work = Promise.resolve()
      .then(task)
      .catch(() => null);
    return await Promise.race([work, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** 网络定位结果里的城市名：优先 city，退到 province */
export function ipCityName(ip) {
  if (!ip || typeof ip !== 'object') return '';
  for (const value of [ip.city, ip.district, ip.province]) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

/**
 * 执行一次定位，返回 `{ place, source }` 或 null。
 * `source`: 'system'（Windows 定位） / 'ip'（ip.cn 网络归属地） / 'mock'（演示）。
 *
 * 只取回候选城市，不写配置、不切城市：成功即由调用方应用（加入列表并设为当前），
 * 失败返回 null 时保留上次城市。
 */
export async function locatePlace(settings, { budgetMs = TOTAL_BUDGET_MS } = {}) {
  if (!canLocate(settings)) return null;
  if (settings.mock) return { place: { ...MOCK_PLACES[0] }, source: 'mock' };

  const deadline = Date.now() + Math.max(1000, budgetMs);
  const remaining = (cap) => Math.min(cap, Math.max(0, deadline - Date.now()));

  // 1. 系统定位（坐标）→ GeoAPI 反查
  const location = await withTimeout(() => plugin.getLocation(), remaining(SYSTEM_BUDGET_MS));
  if (location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lon))) {
    const matches = await withTimeout(
      () => geoReverse(settings, location.lat, location.lon),
      remaining(GEO_BUDGET_MS),
    );
    if (matches && matches[0]) {
      return { place: matches[0], source: 'system' };
    }
  }

  if (remaining(1) <= 0) return null;

  // 2. ip.cn 网络归属地（只有城市名）→ GeoAPI 换 id/经纬度
  const ip = await withTimeout(() => plugin.ipLocate(), remaining(IP_BUDGET_MS));
  const city = ipCityName(ip);
  if (!city) return null;

  const matches = await withTimeout(
    () => geoLookup(settings, city),
    remaining(GEO_BUDGET_MS),
  );
  if (matches && matches[0]) {
    return { place: matches[0], source: 'ip' };
  }
  return null;
}
