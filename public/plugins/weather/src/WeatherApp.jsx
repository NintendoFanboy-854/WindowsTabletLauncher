/**
 * 天气卡片视图（D-02b / DENSITY）：
 * 单个 Primary（当前温度）+ 极简 Secondary；没有任何常驻 chrome。
 *
 * 设置/详情不在卡片 iframe 里弹 Dialog/Drawer（会被卡片边界裁切），
 * 改为请求宿主打开整窗浮层视图：`?view=settings` / `?view=detail`。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, makeStyles, tokens } from '@fluentui/react-components';
import { Add20Regular } from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import {
  requestOverlay,
  requestSettings,
  useAgentTools,
  useHostSize,
  useSettingsRequest,
  useStoredConfig,
} from '../../_shared/host.js';
import Card from './components/Card.jsx';
import { parseSizeParam, sizeKeyOf } from './utils.js';
import {
  DEFAULT_SETTINGS,
  currentPlace,
  normalizeSettings,
} from './data/store.js';
import { hasKeyOrMock, loadWeather } from './data/service.js';
import { AGENT_TOOLS, runTool } from './data/tools.js';

const useStyles = makeStyles({
  root: { width: '100%', height: '100%', overflow: 'hidden' },
  empty: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    textAlign: 'center',
  },
  emptyText: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
  },
});

function initialStatus() {
  return { loading: true, offline: false, error: '', failures: [], noKey: false, hasCache: false };
}

export default function WeatherApp({ scheme }) {
  const styles = useStyles();
  const query = useMemo(() => new URLSearchParams(location.search), []);
  const mockOverride = query.get('mock') === '1';
  const defaultSize = parseSizeParam(query.get('size'));

  const [storedSettings, setStoredSettings, settingsLoaded] = useStoredConfig(
    'settings',
    DEFAULT_SETTINGS,
    normalizeSettings,
  );
  const settings = useMemo(
    () => (mockOverride ? { ...storedSettings, mock: true } : storedSettings),
    [storedSettings, mockOverride],
  );
  const sizeKey = useHostSize(sizeKeyOf, defaultSize ? sizeKeyOf(defaultSize) : '3x2');

  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(initialStatus);

  const cacheRef = useRef({});
  const settingsRef = useRef(settings);
  const requestSeq = useRef(0);
  const persistTimer = useRef(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const place = currentPlace(settings);

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
    persistTimer.current = window.setTimeout(() => {
      plugin.setConfig('cache', cacheRef.current).catch?.(() => {});
    }, 600);
  }, []);

  // 读一次按城市缓存的天气，首屏先显示旧数据，再刷新
  useEffect(() => {
    let alive = true;
    plugin
      .getConfig('cache')
      .then((raw) => {
        if (!alive) return;
        cacheRef.current = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setCacheLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

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
        persistCache();
      } catch (error) {
        if (seq !== requestSeq.current) return;
        if ((error?.code || '') === 'NO_KEY') {
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

  // 城市 / 单位 / 显示项变化（含设置浮层保存后写回的配置）→ 刷新
  useEffect(() => {
    if (!settingsLoaded || !cacheLoaded) return;
    const activePlace = currentPlace(settingsRef.current);
    if (!activePlace) {
      setData(null);
      setStatus((prev) => ({ ...prev, loading: false, noKey: !hasKeyOrMock(settingsRef.current) }));
      return;
    }
    setData(cacheRef.current[activePlace.id] || null);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchKey, settingsLoaded, cacheLoaded]);

  // 可见时按 refreshMin 轮询；隐藏时暂停
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

  // 键盘焦点交接
  useEffect(() => {
    const off = plugin.onFocus?.(() => {
      document.querySelector('[data-weather-card]')?.focus();
    });
    return () => off?.();
  }, []);

  // 编辑模式里宿主点「设置」：走整窗设置浮层
  useSettingsRequest(() => requestSettings('天气设置'));

  const updateSettings = useCallback(
    (next) => {
      const saved = normalizeSettings(next);
      setStoredSettings(saved);
      return saved;
    },
    [setStoredSettings],
  );

  // Agent 工具（声明 + 调用都由共享脚手架接管）
  const agentContext = useMemo(
    () => ({ getSettings: () => settingsRef.current, updateSettings }),
    [updateSettings],
  );
  const toolHandlers = useMemo(
    () => Object.fromEntries(AGENT_TOOLS.map((tool) => [tool.name, (args) => runTool(tool.name, args, agentContext)])),
    [agentContext],
  );
  useAgentTools(AGENT_TOOLS, toolHandlers);

  // Esc 把焦点交还宿主（本视图里没有自绘浮层）
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') plugin.exitFocus?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openSettings = useCallback(() => requestSettings('天气设置'), []);
  const openDetail = useCallback(() => requestOverlay('detail', '天气详情'), []);

  if (!place) {
    return (
      <div className={styles.empty}>
        <Add20Regular />
        <span className={styles.emptyText}>天气卡片还没有城市，先添加一个城市。</span>
        <Button appearance="primary" icon={<Add20Regular />} onClick={openSettings}>
          添加城市
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.root} data-weather-card-root>
      <Card
        sizeKey={sizeKey}
        scheme={scheme}
        settings={settings}
        place={place}
        data={data}
        status={status}
        onOpenDetail={openDetail}
        onOpenSettings={openSettings}
        onRefresh={() => refresh()}
        onUseMock={() => updateSettings({ ...settingsRef.current, mock: true })}
      />
    </div>
  );
}


