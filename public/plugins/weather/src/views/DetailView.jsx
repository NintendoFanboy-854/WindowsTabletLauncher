/**
 * 天气详情视图（宿主整窗 Fluent Dialog 加载 `?view=detail`）。
 *
 * 原来卡片 iframe 里的 OverlayDrawer 会被卡片边界裁切；现在整页渲染：
 * 顶部城市/状态/操作，下面 TabList + 各面板，内容区独立滚动。
 * 详情里的「设置」同样请求宿主的设置浮层（requestSettings）。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Tab,
  TabList,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ArrowClockwise20Regular, Settings20Regular } from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import { requestSettings, useStoredConfig } from '../../../_shared/host.js';
import { CityMenu } from '../components/CityMenu.jsx';
import { DemoBadge, HiLo, StatusLine, WeatherIcon } from '../components/atoms.jsx';
import { isNight } from '../components/forecast.jsx';
import {
  AirPanel,
  DailyPanel,
  HourlyPanel,
  IndicesPanel,
  WarningPanel,
  tabItems,
} from './panels.jsx';
import {
  DEFAULT_SETTINGS,
  addPlaceToSettings,
  currentPlace,
  normalizeSettings,
} from '../data/store.js';
import { urlMockOverride } from '../utils.js';
import {
  hasKeyOrMock,
  isMock,
  loadDetailSection,
  loadWeather,
  reverseLookup,
} from '../data/service.js';
import {
  fmtHumidity,
  fmtPrecip,
  fmtPressure,
  fmtTemp,
  fmtUv,
  fmtVisibility,
  fmtWind,
} from '../data/format.js';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    overflow: 'hidden',
    color: tokens.colorNeutralForeground1,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, flexShrink: 0, minWidth: 0 },
  spacer: { flex: 1, minWidth: 0 },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    flexShrink: 0,
  },
  headline: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    flexShrink: 0,
    minWidth: 0,
    marginTop: tokens.spacingVerticalXS,
  },
  headlineTemp: {
    fontSize: tokens.fontSizeHero700,
    lineHeight: tokens.lineHeightHero700,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
  },
  headlineMeta: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS, minWidth: 0 },
  headlineCondition: { fontSize: tokens.fontSizeBase400, color: tokens.colorNeutralForeground1 },
  headlineSub: {
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    color: tokens.colorNeutralForeground3,
  },
  tabs: { flexShrink: 0 },
  content: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingRight: tokens.spacingHorizontalXS,
    paddingBottom: tokens.spacingVerticalM,
  },
  empty: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
  },
  emptyText: { fontSize: tokens.fontSizeBase300, lineHeight: tokens.lineHeightBase300, maxWidth: '48ch' },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
    height: '100%',
    color: tokens.colorNeutralForeground3,
  },
});

export default function DetailView({ scheme }) {
  const styles = useStyles();

  const [storedSettings, setSettings] = useStoredConfig('settings', DEFAULT_SETTINGS, normalizeSettings);
  const forceMock = urlMockOverride();
  const settings = useMemo(
    () => (forceMock ? { ...storedSettings, mock: true } : storedSettings),
    [storedSettings, forceMock],
  );
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(() => new URLSearchParams(location.search).get('tab') || 'hourly');
  const [sections, setSections] = useState({});
  const [locatedPlace, setLocatedPlace] = useState(null);
  const tabTouched = useRef(Boolean(new URLSearchParams(location.search).get('tab')));
  const cacheRef = useRef({});
  const requestSeq = useRef(0);

  const place = currentPlace(settings);
  const mock = isMock(settings);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

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

  const refresh = useCallback(async () => {
    const cfg = settingsRef.current;
    const activePlace = currentPlace(cfg);
    if (!activePlace || !hasKeyOrMock(cfg)) {
      setLoading(false);
      return;
    }
    const seq = ++requestSeq.current;
    setLoading(true);
    setError('');
    try {
      const result = await loadWeather(cfg, activePlace, cacheRef.current[activePlace.id] || null);
      if (seq !== requestSeq.current) return;
      const merged = { ...result.data, placeId: activePlace.id };
      cacheRef.current = { ...cacheRef.current, [activePlace.id]: merged };
      setData(merged);
      plugin.setConfig('cache', cacheRef.current).catch?.(() => {});
      if (!tabTouched.current) {
        tabTouched.current = true;
        setTab(result.data.warnings?.length ? 'warning' : 'hourly');
      }
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError(err?.message || '天气数据加载失败');
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  const watchKey = useMemo(
    () =>
      JSON.stringify([
        place?.id || '',
        settings.mock,
        settings.apiKey,
        settings.apiHost,
        settings.showAir,
        settings.showWarnings,
        settings.showMinutely,
        settings.refreshMin,
        settings.places.map((item) => `${item.id}:${item.isCurrent ? 1 : 0}`).join(','),
      ]),
    [place?.id, settings],
  );

  useEffect(() => {
    if (!cacheLoaded) return;
    setSections({});
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchKey, cacheLoaded]);

  // 自动定位只标记「当前位置」，不自动切换城市
  useEffect(() => {
    if (!settings.autoLocate || !hasKeyOrMock(settings)) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const location = await Promise.race([
          Promise.resolve(plugin.getLocation()).catch(() => null),
          new Promise((resolve) => setTimeout(() => resolve(null), 4000)),
        ]);
        if (!location || location.lat == null || location.lon == null || cancelled) return;
        const matched = await reverseLookup(settingsRef.current, location.lat, location.lon);
        if (!cancelled && matched) setLocatedPlace(matched);
      } catch {
        /* 定位失败就保持上次城市 */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.autoLocate, settings.places.length, settings.apiKey, settings.apiHost, settings.mock]);

  const ensureSection = useCallback(
    async (section, { force = false } = {}) => {
      const cfg = settingsRef.current;
      const activePlace = currentPlace(cfg);
      if (!activePlace || !section || !hasKeyOrMock(cfg)) return;
      const cached = data?.[section];
      if (!force && cached) return;
      setSections((prev) => ({ ...prev, [section]: { loading: true, error: '' } }));
      try {
        const value = await loadDetailSection(cfg, activePlace, section);
        setData((prev) => (prev ? { ...prev, [section]: value } : prev));
        setSections((prev) => ({ ...prev, [section]: { loading: false, error: '' } }));
      } catch (err) {
        setSections((prev) => ({
          ...prev,
          [section]: { loading: false, error: err?.message || '请求失败' },
        }));
      }
    },
    [data],
  );

  const requestSection = useCallback(
    (section) => {
      ensureSection(section, { force: true });
    },
    [ensureSection],
  );

  const handleTab = useCallback(
    (value) => {
      tabTouched.current = true;
      setTab(value);
      if (value === 'air') ensureSection('air');
      else if (value === 'indices') ensureSection('indices');
      else if (value === 'warning') ensureSection('warnings');
      else if (value === 'hourly' && settingsRef.current.showMinutely) ensureSection('minutely');
    },
    [ensureSection],
  );

  const handleSelectPlace = useCallback(
    (id, options = {}) => {
      const cfg = settingsRef.current;
      if (options.addIfMissing) {
        const next = addPlaceToSettings(cfg, { id, name: id, lat: 0, lon: 0, isCurrent: true });
        setSettings(next);
        return;
      }
      setSettings({ ...cfg, places: cfg.places.map((item) => ({ ...item, isCurrent: item.id === id })) });
    },
    [setSettings],
  );

  const openSettings = useCallback(() => requestSettings('天气设置'), []);

  const today = data?.daily?.[0];
  const current = data?.current;
  const tabList = tabItems();
  const sectionState = (section) => sections?.[section] || { loading: false, error: '' };

  if (!place) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyText}>天气卡片还没有城市，先添加一个城市。</span>
        <Button appearance="primary" size="large" onClick={openSettings}>
          添加城市
        </Button>
      </div>
    );
  }

  if (!hasKeyOrMock(settings)) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyText}>还没有配置天气数据源，先到设置里填写 API Key 与数据地址。</span>
        <Button appearance="primary" size="large" onClick={openSettings}>
          打开天气设置
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.root} data-weather-detail>
      <div className={styles.header}>
        <CityMenu
          settings={settings}
          locatedPlace={locatedPlace}
          onSelectPlace={handleSelectPlace}
          onManageCities={openSettings}
          onOpenSettings={openSettings}
          onRefresh={refresh}
        />
        <span className={styles.spacer} />
        {mock && <DemoBadge />}
        <StatusLine
          offline={false}
          fetchedAt={data?.fetchedAt}
          refreshMin={settings.refreshMin}
          now={Date.now()}
        />
        <Tooltip content="刷新天气" relationship="label">
          <Button
            appearance="subtle"
            size="large"
            icon={<ArrowClockwise20Regular />}
            aria-label="刷新天气"
            onClick={refresh}
          />
        </Tooltip>
        <Tooltip content="天气设置" relationship="label">
          <Button
            appearance="subtle"
            size="large"
            icon={<Settings20Regular />}
            aria-label="天气设置"
            onClick={openSettings}
          />
        </Tooltip>
      </div>

      {loading && !data ? (
        <div className={styles.loading}>正在加载天气数据…</div>
      ) : error && !data ? (
        <div className={styles.empty}>
          <span className={styles.emptyText}>{error}</span>
          <Button appearance="primary" size="large" onClick={refresh}>
            重试
          </Button>
        </div>
      ) : data && current ? (
        <>
          <div className={styles.headline}>
            <WeatherIcon
              code={current.icon}
              night={isNight(current.obsTime || new Date().toISOString(), today?.sunrise, today?.sunset)}
              scheme={scheme}
              size="56px"
              title={current.text}
            />
            <span className={styles.headlineTemp}>{fmtTemp(current.temp, settings.unit)}</span>
            <div className={styles.headlineMeta}>
              <span className={styles.headlineCondition}>{current.text}</span>
              <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} className={styles.headlineSub} />
              <span className={styles.headlineSub}>
                体感 {fmtTemp(current.feelsLike, settings.unit)} · 湿度 {fmtHumidity(current.humidity)} ·{' '}
                {fmtWind(current.windDir, current.windScale)}
              </span>
              <span className={styles.headlineSub}>
                气压 {fmtPressure(current.pressure)} · 能见度 {fmtVisibility(current.vis)}
                {fmtPrecip(current.precip) ? ` · 降水 ${fmtPrecip(current.precip)}` : ''} · 紫外线{' '}
                {fmtUv(current.uvIndex)}
              </span>
            </div>
          </div>

          <TabList className={styles.tabs} selectedValue={tab} onTabSelect={(_, detail) => handleTab(detail.value)}>
            {tabList.map((item) => (
              <Tab key={item.value} value={item.value}>
                {item.value === 'warning' && data.warnings?.length ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacingHorizontalXS }}>
                    {item.label}
                    <Badge appearance="filled" color="danger" size="small">
                      {data.warnings.length}
                    </Badge>
                  </span>
                ) : (
                  item.label
                )}
              </Tab>
            ))}
          </TabList>

          <div className={styles.content}>
            {tab === 'hourly' ? (
              <HourlyPanel
                data={data}
                settings={settings}
                scheme={scheme}
                minutelyLoading={sectionState('minutely').loading}
              />
            ) : tab === 'daily' ? (
              <DailyPanel data={data} settings={settings} scheme={scheme} />
            ) : tab === 'air' ? (
              <AirPanel
                data={data}
                loading={sectionState('air').loading}
                error={sectionState('air').error}
                requestSection={requestSection}
              />
            ) : tab === 'indices' ? (
              <IndicesPanel
                data={data}
                loading={sectionState('indices').loading}
                error={sectionState('indices').error}
                requestSection={requestSection}
              />
            ) : (
              <WarningPanel
                data={data}
                loading={sectionState('warnings').loading}
                error={sectionState('warnings').error}
                requestSection={requestSection}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

