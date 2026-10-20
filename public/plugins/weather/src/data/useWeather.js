/**
 * 天气视图状态（卡片与详情共用）：
 *
 * - 配置：settings（schema 字段）、places（内容键）、cache（按城市）、location（定位结果）；
 * - 数据：当前城市的缓存立即显示，随后按 refreshMin 后台刷新；失败保留缓存；
 * - 城市：添加 / 删除 / 设为当前，全部写宿主配置，另一个 iframe 通过 storage 事件同步；
 * - 自动定位：D-16 链路只在 autoLocate 打开且有 Key 时跑，定位成功即加入/切换当前城市，
 *   mock 模式用 mock 城市演示。
 *
 * 卡片和详情各自挂一份 hook；它们通过 `plugin.weather.*` 的 localStorage 副本同步。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { plugin } from '/plugin-sdk.js';
import { useStoredConfig } from '../../../_shared/host.js';
import {
  CACHE_KEY,
  DEFAULT_SETTINGS,
  LOCATION_KEY,
  PLACES_KEY,
  SETTINGS_KEY,
  addPlaceToList,
  applyLocatedPlace,
  currentPlaceOf,
  migrateLegacyPlaces,
  normalizeCache,
  normalizeLocation,
  normalizePlaces,
  normalizeSettings,
  removePlaceFromList,
  withCurrentPlace,
} from './store.js';
import { canLocate, isLocationFresh, locatePlace } from './locate.js';
import { hasKeyOrMock, loadDetailSection, loadWeather } from './service.js';
import { MOCK_PLACES } from './mock.js';

function initialStatus() {
  return {
    loading: true,
    refreshing: false,
    offline: false,
    error: '',
    noKey: false,
    failures: [],
  };
}

function watchSignature(settings, places, place) {
  return JSON.stringify([
    place?.id || '',
    Boolean(settings.mock),
    settings.apiKey,
    settings.apiHost,
    settings.showAir,
    settings.showWarnings,
    settings.showMinutely,
    settings.refreshMin,
    places.map((item) => `${item.id}:${item.isCurrent ? 1 : 0}`).join(','),
  ]);
}

export function useWeather({ mock = false } = {}) {
  const [storedSettings, setSettings, settingsLoaded] = useStoredConfig(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
    normalizeSettings,
  );
  const [storedPlaces, setPlaces, placesLoaded] = useStoredConfig(PLACES_KEY, [], normalizePlaces);
  const [cache, setCache, cacheLoaded] = useStoredConfig(CACHE_KEY, {}, normalizeCache);
  const [location, setLocation] = useStoredConfig(LOCATION_KEY, null, normalizeLocation);

  const settings = useMemo(
    () => (mock ? { ...storedSettings, mock: true } : storedSettings),
    [storedSettings, mock],
  );
  const places = storedPlaces;
  const place = currentPlaceOf(places);
  const data = place ? cache[place.id] || null : null;

  const [status, setStatus] = useState(initialStatus);
  const [locating, setLocating] = useState(false);
  const [sectionState, setSectionState] = useState({});

  const settingsRef = useRef(settings);
  const placesRef = useRef(places);
  const cacheRef = useRef(cache);
  const locationRef = useRef(location);
  const sectionStateRef = useRef(sectionState);
  const requestSeq = useRef(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    placesRef.current = places;
  }, [places]);
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);
  useEffect(() => {
    sectionStateRef.current = sectionState;
  }, [sectionState]);

  const putCache = useCallback(
    (placeId, entry) => {
      const next = { ...cacheRef.current, [placeId]: entry };
      cacheRef.current = next;
      setCache(next);
    },
    [setCache],
  );

  const updatePlaces = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(placesRef.current) : next;
      placesRef.current = resolved;
      setPlaces(resolved);
    },
    [setPlaces],
  );

  // 旧版把 places 写在 settings 里：搬到 places 键并清洗 settings（只做一次）
  useEffect(() => {
    if (!placesLoaded) return undefined;
    let alive = true;
    migrateLegacyPlaces(plugin)
      .then((legacy) => {
        if (!alive || !legacy || legacy.length === 0) return;
        setPlaces((previous) => (previous.length > 0 ? previous : legacy));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [placesLoaded, setPlaces]);

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      const cfg = settingsRef.current;
      const activePlace = currentPlaceOf(placesRef.current);
      if (!activePlace) {
        setStatus((prev) => ({
          ...prev,
          loading: false,
          refreshing: false,
          noKey: !hasKeyOrMock(cfg),
        }));
        return null;
      }
      if (!hasKeyOrMock(cfg)) {
        setStatus((prev) => ({
          ...prev,
          loading: false,
          refreshing: false,
          noKey: true,
          error: '',
        }));
        return null;
      }

      const requestId = ++requestSeq.current;
      const previous = cacheRef.current[activePlace.id] || null;
      setStatus((prev) => ({
        ...prev,
        loading: !silent || !previous,
        refreshing: true,
        noKey: false,
        error: '',
      }));

      try {
        const result = await loadWeather(cfg, activePlace, previous);
        if (requestId !== requestSeq.current) return null;
        const merged = { ...result.data, placeId: activePlace.id };
        putCache(activePlace.id, merged);
        setStatus({
          loading: false,
          refreshing: false,
          offline: result.offline,
          error: '',
          noKey: false,
          failures: result.failures || [],
        });
        return merged;
      } catch (error) {
        if (requestId !== requestSeq.current) return null;
        if ((error?.code || '') === 'NO_KEY') {
          setStatus((prev) => ({ ...prev, loading: false, refreshing: false, noKey: true, error: '' }));
        } else {
          setStatus((prev) => ({
            ...prev,
            loading: false,
            refreshing: false,
            offline: Boolean(previous),
            error: error?.message || '天气数据加载失败',
          }));
        }
        return null;
      }
    },
    [putCache],
  );

  // mock 演示：没有城市时用内置城市，保证卡片/详情的每个尺寸都有内容
  useEffect(() => {
    if (!mock || !placesLoaded) return;
    if (placesRef.current.length > 0) return;
    updatePlaces([{ ...MOCK_PLACES[0], isCurrent: true }]);
  }, [mock, placesLoaded, updatePlaces]);

  // mock 演示的「当前位置」直接用内置城市，不请求系统定位 / ip.cn
  useEffect(() => {
    if (!mock || !placesLoaded) return;
    if (locationRef.current?.place?.id === MOCK_PLACES[0].id) return;
    const value = { place: { ...MOCK_PLACES[0] }, source: 'mock', at: Date.now() };
    locationRef.current = value;
    setLocation(value);
  }, [mock, placesLoaded, setLocation]);

  // 自动定位（D-16）：只在 autoLocate 打开且有 Key 时跑；8s 封顶，不阻塞 UI。
  // - 已有 30 分钟内的定位结果（location TTL）：直接应用，不重复请求；
  // - 否则请求一次定位，成功后立即把定位城市加入列表并设为当前。
  useEffect(() => {
    if (mock || !settingsLoaded || !placesLoaded) return undefined;
    if (!settings.autoLocate || !canLocate(settings)) return undefined;

    // 定位成功即应用（D-16 新语义）：城市不存在则加入，已存在则切换为当前。
    // 用 placesRef.current 的最新列表；已是当前时不重复写 places。
    const applyLocated = (place) => {
      const next = applyLocatedPlace(placesRef.current, place);
      if (next !== placesRef.current) updatePlaces(next);
    };

    const cached = locationRef.current;
    if (isLocationFresh(cached) && cached.place) {
      // 升级迁移：旧版可能已存了 fresh 定位结果但没应用（旧语义只做候选），
      // 这里只迁移「未应用过」的结果；已应用过的不再覆盖用户手动选择的城市
      // （详情 iframe 每次打开都会重新挂载本 effect）。不重复请求定位。
      if (cached.applied !== true) {
        applyLocated(cached.place);
        const marked = { ...cached, applied: true };
        locationRef.current = marked;
        setLocation(marked);
      }
      return undefined;
    }

    let cancelled = false;
    setLocating(true);
    locatePlace(settings)
      .then((result) => {
        if (cancelled || !result?.place) return;
        const value = {
          place: result.place,
          source: result.source,
          at: Date.now(),
          applied: true,
        };
        locationRef.current = value;
        setLocation(value);
        applyLocated(result.place);
      })
      .finally(() => {
        if (!cancelled) setLocating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    mock,
    settings.autoLocate,
    settings.apiKey,
    settings.apiHost,
    settings.mock,
    settingsLoaded,
    placesLoaded,
    setLocation,
    updatePlaces,
  ]);

  const watchKey = useMemo(
    () => watchSignature(settings, places, place),
    [settings, places, place],
  );

  // 城市 / Key / 显示项变化 → 先显示缓存，再刷新
  useEffect(() => {
    if (!settingsLoaded || !placesLoaded || !cacheLoaded) return;
    if (!place) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
        noKey: !hasKeyOrMock(settingsRef.current),
      }));
      return;
    }
    setStatus((prev) => ({ ...prev, loading: !cacheRef.current[place.id] }));
    refresh();
  }, [watchKey, settingsLoaded, placesLoaded, cacheLoaded, place, refresh]);

  // 按 refreshMin 轮询；隐藏时暂停，回到前台补一拍
  useEffect(() => {
    const interval = Math.max(1, Number(settings.refreshMin) || 30) * 60 * 1000;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') refresh({ silent: true });
    }, interval);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [settings.refreshMin, refresh]);

  /** 详情 Tab 的按需段落（空气 / 生活指数 / 预警 / 分钟级降水） */
  const ensureSection = useCallback(
    async (section, { force = false } = {}) => {
      const cfg = settingsRef.current;
      const activePlace = currentPlaceOf(placesRef.current);
      if (!section || !activePlace || !hasKeyOrMock(cfg)) return null;

      const state = sectionStateRef.current[section];
      if (!force && state?.loading) return null;
      if (!force && state?.error) return null;

      const cached = cacheRef.current[activePlace.id]?.[section];
      if (!force && cached !== undefined && cached !== null) return cached;

      setSectionState((prev) => ({ ...prev, [section]: { loading: true, error: '' } }));
      try {
        const value = await loadDetailSection(cfg, activePlace, section);
        const entry = {
          ...(cacheRef.current[activePlace.id] || {}),
          [section]: value,
          placeId: activePlace.id,
        };
        putCache(activePlace.id, entry);
        setSectionState((prev) => ({ ...prev, [section]: { loading: false, error: '' } }));
        return value;
      } catch (error) {
        setSectionState((prev) => ({
          ...prev,
          [section]: { loading: false, error: error?.message || '请求失败' },
        }));
        return null;
      }
    },
    [putCache],
  );

  const selectPlace = useCallback(
    (id) => updatePlaces(withCurrentPlace(placesRef.current, id)),
    [updatePlaces],
  );
  const addPlace = useCallback(
    (next) => updatePlaces(addPlaceToList(placesRef.current, next)),
    [updatePlaces],
  );
  const removePlace = useCallback(
    (id) => updatePlaces(removePlaceFromList(placesRef.current, id)),
    [updatePlaces],
  );

  return {
    mock,
    settings,
    setSettings,
    settingsLoaded,
    places,
    place,
    data,
    status,
    sectionState,
    located: location?.place || null,
    locatedSource: location?.source || '',
    locating,
    refresh,
    ensureSection,
    updatePlaces,
    selectPlace,
    addPlace,
    removePlace,
    settingsRef,
    placesRef,
    cacheRef,
    putCache,
    setLocation,
    cacheLoaded,
    placesLoaded,
    configured: hasKeyOrMock(settings),
  };
}
