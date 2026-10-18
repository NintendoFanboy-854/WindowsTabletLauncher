/** 天气插件根组件：状态、刷新、缓存、宿主通信与详情/设置浮层。 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  FluentProvider,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add20Regular } from '@fluentui/react-icons';
import Card from './components/Card.jsx';
import DetailDrawer from './components/DetailDrawer.jsx';
import SettingsDialog from './components/SettingsDialog.jsx';
import { legacyThemePayload, resolveTheme } from './theme.js';
import { sizeKeyOf } from './utils.js';
import {
  currentPlace,
  findPlace,
  addPlaceToSettings,
  normalizeSettings,
} from './data/store.js';
import {
  hasKeyOrMock,
  isMock,
  loadDetailSection,
  loadWeather,
  reverseLookup,
} from './data/service.js';
import { runTool, AGENT_TOOLS } from './data/tools.js';

const useStyles = makeStyles({
  root: { width: '100%', height: '100%', overflow: 'hidden' },
  empty: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    textAlign: 'center',
  },
  emptyText: { color: tokens.colorNeutralForeground2, fontSize: tokens.fontSizeBase300, lineHeight: 1.5 },
  loading: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground2,
  },
});

const TIMEOUTS = { config: 1200, location: 4000 };

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

function useNowTicker(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

export default function WeatherApp({ plugin, initial }) {
  const styles = useStyles();
  const [settings, setSettings] = useState(initial.settings);
  const [sizeKey, setSizeKey] = useState(initial.sizeKey);
  const [themePayload, setThemePayload] = useState(initial.themePayload);
  const [data, setData] = useState(() => {
    const place = currentPlace(initial.settings);
    return place ? initial.cache[place.id] || null : null;
  });
  const [status, setStatus] = useState(() => {
    const place = currentPlace(initial.settings);
    const cached = place ? initial.cache[place.id] : null;
    return {
      loading: false,
      offline: false,
      error: '',
      failures: [],
      noKey: !hasKeyOrMock(initial.settings),
      hasCache: Boolean(cached),
    };
  });
  const [sections, setSections] = useState({});
  const [drawer, setDrawer] = useState({ open: false, tab: 'hourly' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [locatedPlace, setLocatedPlace] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const now = useNowTicker();

  const settingsRef = useRef(settings);
  const cacheRef = useRef(initial.cache || {});
  const requestSeq = useRef(0);
  const persistTimer = useRef(null);
  const autoOpenedDetail = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const theme = useMemo(() => resolveTheme(themePayload), [themePayload]);
  const place = currentPlace(settings);
  const mock = isMock(settings);

  const watchKey = useMemo(
    () =>
      JSON.stringify([
        place?.id || '',
        settings.mock,
        settings.apiKey,
        settings.apiHost,
        settings.showAir,
        settings.showWarnings,
        settings.refreshMin,
        settings.places.map((item) => `${item.id}:${item.isCurrent ? 1 : 0}`).join(','),
      ]),
    [place?.id, settings],
  );

  const persistCache = useCallback(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      plugin.setConfig('cache', cacheRef.current).catch?.(() => {});
    }, 600);
  }, [plugin]);

  // 保存设置：先更新本地状态，持久化不阻塞 UI / Agent 工具（宿主桥未接通时也不会卡住）
  const applySettings = useCallback(
    async (next) => {
      const saved = normalizeSettings(next);
      setSettings(saved);
      try {
        const result = plugin.setConfig('settings', saved);
        if (result && typeof result.catch === 'function') result.catch(() => {});
      } catch {
        /* 存储失败不影响当前会话 */
      }
      return saved;
    },
    [plugin],
  );

  const updateSettings = applySettings;

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      const cfg = settingsRef.current;
      const activePlace = currentPlace(cfg);
      if (!activePlace) return;
      if (!hasKeyOrMock(cfg)) {
        setStatus((prev) => ({ ...prev, loading: false, noKey: true, error: '' }));
        return;
      }
      const seq = ++requestSeq.current;
      setStatus((prev) => ({ ...prev, loading: !silent || !prev.hasCache, noKey: false, error: '' }));
      const previous = cacheRef.current[activePlace.id] || null;
      try {
        const result = await loadWeather(cfg, activePlace, previous);
        if (seq !== requestSeq.current) return;
        const merged = { ...result.data, placeId: activePlace.id };
        cacheRef.current = { ...cacheRef.current, [activePlace.id]: merged };
        setData(merged);
        setStatus({
          loading: false,
          offline: result.offline,
          error: '',
          failures: result.failures || [],
          noKey: false,
          hasCache: true,
        });
        setSections((prev) => {
          const next = { ...prev };
          for (const key of ['air', 'warnings', 'indices', 'minutely']) {
            if (merged[key]) next[key] = { loading: false, error: '' };
          }
          return next;
        });
        persistCache();
      } catch (error) {
        if (seq !== requestSeq.current) return;
        const code = error?.code || '';
        if (code === 'NO_KEY') {
          setStatus((prev) => ({ ...prev, loading: false, noKey: true, error: '' }));
        } else {
          setStatus((prev) => ({
            ...prev,
            loading: false,
            offline: Boolean(previous),
            error: error?.message || '天气数据加载失败',
          }));
        }
      }
    },
    [persistCache],
  );

  // 城市 / 设置变化 → 先显示缓存，再拉新数据
  useEffect(() => {
    const activePlace = currentPlace(settingsRef.current);
    if (!activePlace) {
      setData(null);
      setStatus((prev) => ({ ...prev, loading: false, noKey: !hasKeyOrMock(settingsRef.current) }));
      return;
    }
    const cached = cacheRef.current[activePlace.id] || null;
    setData(cached);
    setSections({});
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchKey]);

  // 可见时按 refreshMin 轮询；隐藏时暂停
  useEffect(() => {
    const interval = Math.max(1, Number(settings.refreshMin) || 30) * 60 * 1000;
    let timer = setInterval(() => {
      if (document.visibilityState !== 'hidden') refresh({ silent: true });
    }, interval);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [settings.refreshMin, refresh]);

  // 首次自动定位：只标记「当前位置」，不自动切换城市
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cfg = settingsRef.current;
      if (!cfg.autoLocate || !hasKeyOrMock(cfg)) return;
      try {
        const location = await withTimeout(plugin.getLocation(), TIMEOUTS.location, null);
        if (!location || location.lat == null || location.lon == null || cancelled) return;
        const matched = await reverseLookup(cfg, location.lat, location.lon);
        if (!cancelled && matched) setLocatedPlace(matched);
      } catch {
        /* 定位失败就保持上次城市 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plugin]);

  // 宿主初始化 / 尺寸 / 主题 / 焦点（SDK 协议）
  useEffect(() => {
    const offInit = plugin.onInit?.((payload) => {
      if (Array.isArray(payload?.size)) setSizeKey(sizeKeyOf(payload.size));
      if (payload?.theme) setThemePayload(payload.theme);
    });
    const offResize = plugin.onResize?.((size) => setSizeKey(sizeKeyOf(size)));
    const offTheme = plugin.onTheme?.((nextTheme) => setThemePayload(nextTheme || {}));
    const offFocus = plugin.onFocus?.(() => {
      document.querySelector('[data-weather-card]')?.focus();
    });
    return () => {
      offInit?.();
      offResize?.();
      offTheme?.();
      offFocus?.();
    };
  }, [plugin]);

  // 兼容旧骨架宿主的 wtsl:init（新版宿主走 SDK 的 host:init；首次 init 由 main.jsx 兜底捕获）
  useEffect(() => {
    const onMessage = (event) => {
      const payload = event.data;
      if (!payload || payload.type !== 'wtsl:init') return;
      const nextTheme = legacyThemePayload(payload.theme);
      if (nextTheme) setThemePayload(nextTheme);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Agent 工具：宿主通过 host:tool-call 调过来
  useEffect(() => {
    const off = plugin.onToolCall?.(async (message) => {
      try {
        const result = await runTool(message.name, message.args, {
          getSettings: () => settingsRef.current,
          updateSettings: applySettings,
        });
        plugin.toolResult(message.id, true, result);
      } catch (error) {
        plugin.toolResult(message.id, false, error?.message || '天气工具执行失败');
      }
    });
    return () => off?.();
  }, [plugin, applySettings]);

  // 首次把工具声明交给宿主
  useEffect(() => {
    plugin.ready?.(AGENT_TOOLS);
  }, [plugin]);

  const ensureSection = useCallback(
    async (section, { force = false } = {}) => {
      const cfg = settingsRef.current;
      const activePlace = currentPlace(cfg);
      if (!activePlace || !section) return;
      if (!hasKeyOrMock(cfg)) return;
      const cached = cacheRef.current[activePlace.id];
      if (!force && cached?.[section]) return;
      setSections((prev) => ({ ...prev, [section]: { loading: true, error: '' } }));
      try {
        const value = await loadDetailSection(cfg, activePlace, section);
        const existing = cacheRef.current[activePlace.id] || {};
        const merged = { ...existing, [section]: value };
        cacheRef.current = { ...cacheRef.current, [activePlace.id]: merged };
        setData((prev) => (prev && prev.placeId === activePlace.id ? { ...prev, [section]: value } : prev));
        setSections((prev) => ({ ...prev, [section]: { loading: false, error: '' } }));
        persistCache();
      } catch (error) {
        setSections((prev) => ({ ...prev, [section]: { loading: false, error: error?.message || '请求失败' } }));
      }
    },
    [persistCache],
  );

  const ensureForTab = useCallback(
    (tab) => {
      if (tab === 'air') ensureSection('air');
      else if (tab === 'indices') ensureSection('indices');
      else if (tab === 'warning') ensureSection('warnings');
      else if (tab === 'hourly' && settingsRef.current.showMinutely) ensureSection('minutely');
    },
    [ensureSection],
  );

  const openDetail = useCallback(
    (tab) => {
      const cfg = settingsRef.current;
      const hasWarnings = cfg.showWarnings && (data?.warnings?.length || 0) > 0;
      const preferred = tab || (hasWarnings ? 'warning' : 'hourly');
      setDrawer({ open: true, tab: preferred });
      ensureForTab(preferred);
    },
    [data, ensureForTab],
  );

  const changeTab = useCallback(
    (tab) => {
      setDrawer((prev) => ({ ...prev, tab }));
      ensureForTab(tab);
    },
    [ensureForTab],
  );

  // 开发/截图用：?detail=hourly|daily|air|indices|warning 自动打开详情
  useEffect(() => {
    const detail = initial.query?.detail;
    if (!detail || autoOpenedDetail.current) return;
    if (!data) return;
    autoOpenedDetail.current = true;
    if (detail === '1' || detail === 'true') openDetail();
    else openDetail(detail);
  }, [data, initial.query, openDetail]);

  const handleSelectPlace = useCallback(
    (id, options = {}) => {
      const cfg = settingsRef.current;
      if (options.addIfMissing) {
        const located = locatedPlace && locatedPlace.id === id ? locatedPlace : findPlace(cfg, id);
        const next = addPlaceToSettings(cfg, located || { id, name: id, lat: 0, lon: 0, isCurrent: true });
        updateSettings(next);
        return;
      }
      const next = {
        ...cfg,
        places: cfg.places.map((item) => ({ ...item, isCurrent: item.id === id })),
      };
      updateSettings(next);
    },
    [locatedPlace, updateSettings],
  );

  const handleLocate = useCallback(async () => {
    setLocating(true);
    setLocationError('');
    try {
      const location = await withTimeout(plugin.getLocation(), TIMEOUTS.location, null);
      if (!location || location.lat == null || location.lon == null) {
        setLocationError('系统定位不可用，请手动搜索城市');
        return;
      }
      const cfg = settingsRef.current;
      const matched = await reverseLookup(cfg, location.lat, location.lon);
      if (!matched) {
        setLocationError('没有找到定位对应的城市');
        return;
      }
      setLocatedPlace(matched);
      const next = addPlaceToSettings(cfg, matched);
      await updateSettings(next);
    } catch (error) {
      setLocationError(error?.message || '定位失败');
    } finally {
      setLocating(false);
    }
  }, [plugin, updateSettings]);

  const useMock = useCallback(() => {
    updateSettings({ ...settingsRef.current, mock: true });
  }, [updateSettings]);

  // 开发/截图用：?settings=1 自动打开设置
  useEffect(() => {
    if (initial.query?.settings === '1') setSettingsOpen(true);
  }, [initial.query]);

  // 键盘：没有浮层时 Esc 把焦点交还宿主
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (drawer.open || settingsOpen) return;
      plugin.exitFocus?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawer.open, settingsOpen, plugin]);

  const handleSaveSettings = useCallback(
    async (next) => {
      await updateSettings(next);
    },
    [updateSettings],
  );

  if (!place) {
    return (
      <FluentProvider theme={theme.theme} style={{ width: '100%', height: '100%' }}>
        <div className={styles.empty}>
          <Add20Regular />
          <span className={styles.emptyText}>天气卡片还没有城市，先添加一个城市。</span>
          <Button appearance="primary" icon={<Add20Regular />} onClick={() => setSettingsOpen(true)}>
            添加城市
          </Button>
          <SettingsDialog
            open={settingsOpen}
            settings={settings}
            mock={mock}
            onOpenChange={setSettingsOpen}
            onSave={handleSaveSettings}
            onLocate={handleLocate}
            locating={locating}
            locationError={locationError}
          />
        </div>
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={theme.theme} style={{ width: '100%', height: '100%' }}>
      <div className={styles.root} data-weather-card-root>
        <Card
          sizeKey={sizeKey}
          scheme={theme.scheme}
          settings={settings}
          place={place}
          data={data}
          status={status}
          onOpenDetail={() => openDetail()}
          onOpenSettings={() => setSettingsOpen(true)}
          onRefresh={() => refresh()}
          onUseMock={useMock}
        />

        <DetailDrawer
          open={drawer.open}
          tab={drawer.tab}
          onTabChange={changeTab}
          onClose={() => setDrawer((prev) => ({ ...prev, open: false }))}
          onRefresh={() => {
            refresh();
            ensureForTab(drawer.tab);
          }}
          onOpenSettings={() => setSettingsOpen(true)}
          onSelectPlace={handleSelectPlace}
          onManageCities={() => setSettingsOpen(true)}
          locatedPlace={locatedPlace}
          settings={settings}
          place={place}
          data={data}
          status={status}
          scheme={theme.scheme}
          now={now}
          sections={sections}
          onRequestSection={(section) => ensureSection(section, { force: true })}
          mock={mock}
        />

        <SettingsDialog
          open={settingsOpen}
          settings={settings}
          mock={mock}
          onOpenChange={setSettingsOpen}
          onSave={handleSaveSettings}
          onLocate={handleLocate}
          locating={locating}
          locationError={locationError}
        />
      </div>
    </FluentProvider>
  );
}
