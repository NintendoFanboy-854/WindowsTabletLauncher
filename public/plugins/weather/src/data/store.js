/**
 * 天气配置与缓存的归一化、迁移、增删。
 *
 * 存储键（host 配置命名空间 `plugin.weather.*`）：
 * - `settings`：manifest.settings schema 声明的 8 个长期偏好；
 * - `places`：城市列表（内容管理放详情，不进设置 schema，避免宿主设置页
 *   把城市当成“未声明字段”提示）；
 * - `cache`：按 LocationID 缓存的一整套天气数据；
 * - `location`：最近一次自动定位结果（系统坐标 / ip.cn 网络归属地），
 *   供卡片与详情共享，30 分钟内不重复请求 D-16 的链路。
 *
 * 旧版把 `places` / `mock` 写在 `settings` 里；`migrateLegacyPlaces` 一次性搬到
 * `places` 键并把 settings 清洗成 schema 字段，之后两份视图都不会再把它们写回去。
 */

export const SETTINGS_KEY = 'settings';
export const PLACES_KEY = 'places';
export const CACHE_KEY = 'cache';
export const LOCATION_KEY = 'location';

/** 设置默认值，必须与 manifest.json 的 settings schema default 一致 */
export const DEFAULT_SETTINGS = {
  unit: 'c',
  refreshMin: 30,
  autoLocate: false,
  showAir: true,
  showWarnings: true,
  showMinutely: false,
  apiKey: '',
  apiHost: '',
};

export const REFRESH_OPTIONS = [15, 30, 60];

const DEFAULT_TZ = 'Asia/Shanghai';

export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const refresh = Number(source.refreshMin);
  return {
    unit: source.unit === 'f' ? 'f' : 'c',
    refreshMin: REFRESH_OPTIONS.includes(refresh) ? refresh : DEFAULT_SETTINGS.refreshMin,
    autoLocate: source.autoLocate === true,
    showAir: source.showAir !== false,
    showWarnings: source.showWarnings !== false,
    showMinutely: source.showMinutely === true,
    apiKey: typeof source.apiKey === 'string' ? source.apiKey.trim() : '',
    apiHost: typeof source.apiHost === 'string' ? source.apiHost.trim() : '',
  };
}

export function normalizePlace(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id || '').trim();
  const name = String(raw.name || '').trim();
  if (!id || !name) return null;
  const lat = Number(raw.lat);
  const lon = Number(raw.lon);
  return {
    id,
    name,
    adm1: raw.adm1 || '',
    adm2: raw.adm2 || '',
    country: raw.country || '',
    tz: raw.tz || DEFAULT_TZ,
    lat: Number.isFinite(lat) ? lat : 0,
    lon: Number.isFinite(lon) ? lon : 0,
    isCurrent: raw.isCurrent === true,
  };
}

export function normalizePlaces(raw) {
  if (!Array.isArray(raw)) return [];
  const list = raw.map(normalizePlace).filter(Boolean);
  let seenCurrent = false;
  for (const place of list) {
    if (place.isCurrent && !seenCurrent) seenCurrent = true;
    else if (place.isCurrent) place.isCurrent = false;
  }
  if (list.length > 0 && !seenCurrent) list[0].isCurrent = true;
  return list;
}

export function normalizeCache(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const cache = {};
  for (const [placeId, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    cache[placeId] = entry;
  }
  return cache;
}

export function normalizeLocation(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const place = normalizePlace(raw.place);
  if (!place) return null;
  const at = Number(raw.at);
  return {
    place,
    source: typeof raw.source === 'string' ? raw.source : '',
    at: Number.isFinite(at) ? at : 0,
  };
}

export function currentPlaceOf(places) {
  if (!Array.isArray(places) || places.length === 0) return null;
  return places.find((place) => place.isCurrent) || places[0];
}

export function findPlace(places, id) {
  if (!Array.isArray(places) || !id) return null;
  return places.find((place) => place.id === String(id)) || null;
}

const stripRegionSuffix = (value) => String(value || '').replace(/省$|市$|自治区$|特别行政区$/, '');

/** 菜单/工具里显示的城市名：城市 + 上一级行政区（不重复） */
export function placeMenuLabel(place) {
  if (!place) return '';
  const name = stripRegionSuffix(place.name) || place.name;
  const candidates = [stripRegionSuffix(place.adm2), stripRegionSuffix(place.adm1)].filter(
    (value) => value && value !== name && !name.includes(value),
  );
  return candidates.length > 0 ? `${place.name} ${candidates[0]}` : place.name;
}

/** 切换当前城市（有且只有一个 isCurrent） */
export function withCurrentPlace(places, id) {
  const target = String(id || '');
  return (places || []).map((place) => ({ ...place, isCurrent: place.id === target }));
}

/** 添加城市并设为当前；已存在则直接切换 */
export function addPlaceToList(places, place) {
  const normalized = normalizePlace(place);
  if (!normalized) return places || [];
  const existing = findPlace(places, normalized.id);
  if (existing) return withCurrentPlace(places, existing.id);
  return [
    ...(places || []).map((item) => ({ ...item, isCurrent: false })),
    { ...normalized, isCurrent: true },
  ];
}

/** 删除城市；删掉当前城市时把第一个城市设为当前 */
export function removePlaceFromList(places, id) {
  const target = String(id || '');
  const remaining = (places || []).filter((place) => place.id !== target);
  if (remaining.length > 0 && !remaining.some((place) => place.isCurrent)) {
    remaining[0] = { ...remaining[0], isCurrent: true };
  }
  return remaining;
}

/**
 * 旧版 settings.places → places 键的一次性迁移。
 *
 * 只在 `places` 还没有内容时执行；同时把 settings 里 schema 未声明的旧字段
 * （places / mock）清掉，避免宿主设置页出现“未声明字段”提示。
 * 返回迁移出的城市列表（没有可迁移内容时返回 null）。
 */
export async function migrateLegacyPlaces(plugin) {
  const stored = await plugin.getConfig(PLACES_KEY).catch(() => null);
  if (Array.isArray(stored) && stored.length > 0) return null;

  const rawSettings = await plugin.getConfig(SETTINGS_KEY).catch(() => null);
  if (!rawSettings || typeof rawSettings !== 'object' || Array.isArray(rawSettings)) return null;

  const legacy = normalizePlaces(rawSettings.places);
  const dirty = 'places' in rawSettings || 'mock' in rawSettings;

  if (legacy.length > 0) {
    await plugin.setConfig(PLACES_KEY, legacy).catch(() => {});
    if (dirty) await plugin.setConfig(SETTINGS_KEY, normalizeSettings(rawSettings)).catch(() => {});
    return legacy;
  }
  if (dirty) await plugin.setConfig(SETTINGS_KEY, normalizeSettings(rawSettings)).catch(() => {});
  return null;
}
