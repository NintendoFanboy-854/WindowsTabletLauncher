/**
 * 设置与缓存的读取/写入。存储走宿主 API（plugin.getConfig/setConfig），
 * 脱离宿主时 SDK 会兜底到 localStorage。键名按组件文档：
 * - weather.settings
 * - weather.cache
 */

export const DEFAULT_PLACES = [];

export const DEFAULT_SETTINGS = {
  apiKey: '',
  apiHost: '',
  places: [],
  unit: 'c',
  refreshMin: 30,
  autoLocate: true,
  showAir: true,
  showWarnings: true,
  showMinutely: false,
  mock: false,
};

const REFRESH_OPTIONS = [15, 30, 60];

const FALLBACK_PLACE = {
  id: '101010100',
  name: '北京',
  adm1: '北京市',
  adm2: '北京',
  lat: 39.92,
  lon: 116.41,
  country: '中国',
  tz: 'Asia/Shanghai',
  isCurrent: true,
};

function normalizePlace(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id || '').trim();
  const name = String(raw.name || '').trim();
  if (!id || !name) return null;
  const lat = Number(raw.lat);
  const lon = Number(raw.lon);
  return {
    id,
    name,
    lat: Number.isFinite(lat) ? lat : 0,
    lon: Number.isFinite(lon) ? lon : 0,
    adm1: raw.adm1 || '',
    adm2: raw.adm2 || '',
    country: raw.country || '',
    tz: raw.tz || 'Asia/Shanghai',
    isCurrent: Boolean(raw.isCurrent),
  };
}

export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const settings = {
    ...DEFAULT_SETTINGS,
    ...source,
    apiKey: typeof source.apiKey === 'string' ? source.apiKey.trim() : '',
    apiHost: typeof source.apiHost === 'string' ? source.apiHost.trim() : '',
    places: Array.isArray(source.places) ? source.places.map(normalizePlace).filter(Boolean) : [],
    unit: source.unit === 'f' ? 'f' : 'c',
    refreshMin: REFRESH_OPTIONS.includes(Number(source.refreshMin)) ? Number(source.refreshMin) : 30,
    autoLocate: source.autoLocate !== false,
    showAir: source.showAir !== false,
    showWarnings: source.showWarnings !== false,
    showMinutely: source.showMinutely === true,
    mock: source.mock === true,
  };
  // 有且只有一个当前城市；城市列表为空时给一个默认城市，避免首屏空转
  if (settings.places.length === 0) {
    settings.places = [{ ...FALLBACK_PLACE }];
  }
  if (!settings.places.some((place) => place.isCurrent)) {
    settings.places[0].isCurrent = true;
  }
  let seenCurrent = false;
  for (const place of settings.places) {
    if (place.isCurrent && !seenCurrent) seenCurrent = true;
    else if (place.isCurrent) place.isCurrent = false;
  }
  return settings;
}

export function currentPlace(settings) {
  if (!settings || !Array.isArray(settings.places) || settings.places.length === 0) return null;
  return settings.places.find((place) => place.isCurrent) || settings.places[0];
}

export function findPlace(settings, id) {
  return settings?.places?.find((place) => place.id === id) || null;
}

export function placeLabel(place) {
  if (!place) return '';
  if (place.adm1 && place.adm1 !== place.name) return `${place.name} · ${place.adm1.replace(/市$/, '')}`;
  return place.name;
}

export function placeMenuLabel(place) {
  if (!place) return '';
  const strip = (value) => String(value || '').replace(/省$|市$|自治区$|特别行政区$/, '');
  const name = strip(place.name) || place.name;
  const candidates = [strip(place.adm2), strip(place.adm1)].filter((value) => value && value !== name && !name.includes(value));
  return candidates.length > 0 ? `${place.name} ${candidates[0]}` : place.name;
}

export async function loadSettings(plugin) {
  const raw = await plugin.getConfig('settings');
  return normalizeSettings(raw);
}

export async function saveSettings(plugin, settings) {
  const normalized = normalizeSettings(settings);
  await plugin.setConfig('settings', normalized);
  return normalized;
}

export function emptyCache() {
  return {};
}

export async function loadCache(plugin) {
  const raw = await plugin.getConfig('cache');
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
}

export function saveCache(plugin, cache) {
  return plugin.setConfig('cache', cache);
}

/** 切换当前城市 */
export function setCurrentPlace(settings, id) {
  return {
    ...settings,
    places: settings.places.map((place) => ({ ...place, isCurrent: place.id === id })),
  };
}

/** 添加城市（已存在则直接设为当前） */
export function addPlaceToSettings(settings, place) {
  const existing = findPlace(settings, place.id);
  if (existing) return setCurrentPlace(settings, existing.id);
  return {
    ...settings,
    places: [...settings.places.map((item) => ({ ...item, isCurrent: false })), { ...normalizePlace(place), isCurrent: true }],
  };
}

/** 删除城市；删掉当前城市时把第一个城市设为当前 */
export function removePlaceFromSettings(settings, id) {
  const remaining = settings.places.filter((place) => place.id !== id);
  if (remaining.length > 0 && !remaining.some((place) => place.isCurrent)) {
    remaining[0] = { ...remaining[0], isCurrent: true };
  }
  return { ...settings, places: remaining };
}

export { FALLBACK_PLACE, REFRESH_OPTIONS };
