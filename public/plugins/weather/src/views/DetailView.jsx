/**
 * 天气详情（L1，`?view=detail`，宿主整窗 Fluent Dialog 加载）。
 *
 * 结构按 docs/components/weather.md：
 *   header 56（城市按钮 + 更新时间 + 刷新 + 设置…）
 *   摘要 96（图标 56 / 温度 48 / 现象 16 / 高低温 14 / 最右 AQI Badge）
 *   环境信息 44（六项单行等宽，<700px 两行三列）
 *   Tabs 40 常显（逐时 / 7 天 / 空气 / 生活指数 / 预警；有预警默认预警）
 *   内容滚动（CrossFade 切换）；L2 = 管理城市 Subpage。
 *
 * 设置只发 `requestHostSettings()`（宿主关闭浮层并导航到设置页天气分区）。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Spinner,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  ArrowClockwise20Regular,
  Key24Regular,
  Location24Regular,
  Settings20Regular,
} from '@fluentui/react-icons';
import { requestHostSettings, useHostTheme } from '../../../_shared/host.js';
import {
  ActionButton,
  DetailHeader,
  DetailPage,
  DetailScroll,
  DetailTabs,
  EmptyState,
  LIST_ROW_HEIGHT,
  Metric,
  Subpage,
  TouchButton,
  useNow,
} from '../../../_shared/ui.jsx';
import { CrossFade } from '../../../_shared/motion.js';
import { CityMenu } from '../components/CityMenu.jsx';
import { HiLo, StatusLine, WeatherIcon, statusToneColor } from '../components/atoms.jsx';
import { isNight } from '../components/forecast.jsx';
import { AirPanel, DailyPanel, HourlyPanel, IndicesPanel, WarningPanel } from './panels.jsx';
import { ManageCities } from './ManageCities.jsx';
import { useWeather } from '../data/useWeather.js';
import { urlMockEnabled } from '../utils.js';
import {
  fmtHumidity,
  fmtPressure,
  fmtTemp,
  fmtUv,
  fmtVisibility,
  fmtWind,
} from '../data/format.js';

const useStyles = makeStyles({
  headerLeading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 0,
  },
  statusText: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },

  summary: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    minHeight: '96px',
    paddingInline: tokens.spacingHorizontalXXL,
    boxSizing: 'border-box',
    minWidth: 0,
  },
  summaryMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  summarySpacer: { flex: 1, minWidth: 0 },
  aqiBadge: { flexShrink: 0 },
  aqiContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  aqiDot: {
    width: tokens.spacingHorizontalS,
    height: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
  },

  env: {
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalL,
    minHeight: `${LIST_ROW_HEIGHT}px`,
    alignItems: 'center',
    paddingInline: tokens.spacingHorizontalXXL,
    boxSizing: 'border-box',
    minWidth: 0,
    '@media (max-width: 700px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      rowGap: tokens.spacingVerticalS,
      paddingBlock: tokens.spacingVerticalS,
    },
  },
  envItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  envLabel: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  envValue: {
    color: tokens.colorNeutralForeground1,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  contentEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    minHeight: '240px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
  notice: { maxWidth: '640px' },
});

/** FLUENT2 §12：<1s 不显示加载；1s 后才出现 Spinner */
function useDelayedFlag(flag, delay = 1000) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!flag) {
      setVisible(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [flag, delay]);
  return visible;
}

function AirBadge({ air }) {
  const styles = useStyles();
  if (!air || air.aqi == null) return null;
  return (
    <div className={styles.aqiBadge}>
      <Badge appearance="tint" color="informative" size="large">
        <span className={styles.aqiContent}>
          <span className={styles.aqiDot} style={{ backgroundColor: statusToneColor(air.tone) }} />
          <Text size={400} weight="semibold">
            {air.aqiDisplay || air.aqi}
          </Text>
          <Text size={300}>{air.category || '—'}</Text>
        </span>
      </Badge>
    </div>
  );
}

export default function DetailView() {
  const styles = useStyles();
  const { scheme } = useHostTheme();
  const now = useNow(30000);
  const mock = useMemo(() => urlMockEnabled(), []);
  const weather = useWeather({ mock });
  const {
    settings,
    places,
    place,
    data,
    status,
    sectionState,
    located,
    locatedSource,
    locating,
    refresh,
    ensureSection,
    addPlace,
    removePlace,
    selectPlace,
    configured,
  } = weather;

  const [tab, setTab] = useState(null);
  const [managing, setManaging] = useState(false);
  const initializedRef = useRef(false);
  const showSpinner = useDelayedFlag(!data && status.loading, 1000);

  const warnings = settings.showWarnings ? data?.warnings || [] : [];
  const tabs = useMemo(() => {
    const items = [
      { value: 'hourly', label: '逐时' },
      { value: 'daily', label: '7 天' },
    ];
    if (settings.showAir) items.push({ value: 'air', label: '空气' });
    items.push({ value: 'indices', label: '生活指数' });
    if (settings.showWarnings) {
      items.push({
        value: 'warning',
        label: '预警',
        badge:
          warnings.length > 0 ? (
            <Badge appearance="tint" color="danger" size="medium">
              {warnings.length}
            </Badge>
          ) : undefined,
      });
    }
    return items;
  }, [settings.showAir, settings.showWarnings, warnings.length]);

  // 有预警默认进预警 Tab（只决定一次，用户之后自己切）
  useEffect(() => {
    if (initializedRef.current || !data) return;
    initializedRef.current = true;
    setTab(settings.showWarnings && data.warnings?.length ? 'warning' : 'hourly');
  }, [data, settings.showWarnings]);

  const activeTab = tabs.some((item) => item.value === tab) ? tab : 'hourly';

  const handleTab = useCallback((value) => setTab(value), []);

  // 平级内容按需补齐：空气 / 生活指数 / 预警 / 分钟级降水
  useEffect(() => {
    if (!data) return;
    if (activeTab === 'air' && data.air === undefined) ensureSection('air');
    else if (activeTab === 'indices' && data.indices === undefined) ensureSection('indices');
    else if (activeTab === 'warning' && data.warnings === undefined) ensureSection('warnings');
    else if (activeTab === 'hourly' && settings.showMinutely && data.minutely === undefined) {
      ensureSection('minutely');
    }
  }, [activeTab, data, settings.showMinutely, ensureSection]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const openSettings = useCallback(() => requestHostSettings(), []);
  const current = data?.current || null;
  const today = data?.daily?.[0] || null;
  const currentNight = current
    ? isNight(current.obsTime || new Date().toISOString(), today?.sunrise, today?.sunset)
    : false;

  const statusLabel = data?.fetchedAt
    ? null
    : status.loading
      ? '正在加载…'
      : status.error
        ? '加载失败'
        : configured
          ? '尚未更新'
          : '未配置数据源';

  const header = (
    <DetailHeader
      trailing={
        <div className={styles.actions}>
          <Tooltip content="刷新天气" relationship="label">
            <TouchButton
              appearance="subtle"
              size="large"
              aria-label="刷新天气"
              icon={status.refreshing ? <Spinner size="tiny" /> : <ArrowClockwise20Regular />}
              disabled={status.refreshing || !place}
              onClick={handleRefresh}
            />
          </Tooltip>
          <ActionButton icon={<Settings20Regular />} onClick={openSettings}>
            设置…
          </ActionButton>
        </div>
      }
    >
      <div className={styles.headerLeading}>
        <CityMenu
          places={places}
          currentPlace={place}
          located={located}
          onSelectPlace={selectPlace}
          onAddPlace={addPlace}
          onManageCities={() => setManaging(true)}
        />
        {data?.fetchedAt ? (
          <StatusLine offline={status.offline} fetchedAt={data.fetchedAt} refreshMin={settings.refreshMin} now={now} />
        ) : (
          <Text size={200} className={styles.statusText}>
            {statusLabel}
          </Text>
        )}
      </div>
    </DetailHeader>
  );

  const subpage = managing ? (
    <Subpage title="管理城市" onClosed={() => setManaging(false)}>
      <ManageCities
        settings={settings}
        places={places}
        currentPlace={place}
        located={located}
        locatedSource={locatedSource}
        configured={configured}
        onAdd={addPlace}
        onRemove={removePlace}
        onSelect={selectPlace}
      />
    </Subpage>
  ) : null;

  if (!configured) {
    return (
      <DetailPage>
        {header}
        <DetailScroll>
          <EmptyState
            icon={<Key24Regular />}
            title="未配置 Key"
            action={
              <ActionButton
                appearance="secondary"
                icon={<Settings20Regular />}
                onClick={openSettings}
              >
                打开设置
              </ActionButton>
            }
          />
        </DetailScroll>
        {subpage}
      </DetailPage>
    );
  }

  if (!place) {
    return (
      <DetailPage>
        {header}
        <DetailScroll>
          {locating ? (
            <div className={styles.contentEmpty}>
              <Spinner size="small" />
              <Text size={300}>正在定位…</Text>
            </div>
          ) : (
            <EmptyState
              icon={<Location24Regular />}
              title="还没有城市"
              action={
                <ActionButton
                  appearance="secondary"
                  icon={<Add20Regular />}
                  onClick={() => setManaging(true)}
                >
                  管理城市
                </ActionButton>
              }
            />
          )}
        </DetailScroll>
        {subpage}
      </DetailPage>
    );
  }

  return (
    <DetailPage>
      {header}

      {current ? (
        <section className={styles.summary} aria-label="当前天气" data-weather-summary>
          <WeatherIcon
            code={current.icon}
            night={currentNight}
            scheme={scheme}
            size={56}
            title={current.text}
          />
          <Metric value={fmtTemp(current.temp, settings.unit)} />
          <div className={styles.summaryMeta}>
            <Text size={400}>{current.text}</Text>
            <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
          </div>
          <div className={styles.summarySpacer} />
          {settings.showAir ? <AirBadge air={data.air} /> : null}
        </section>
      ) : null}

      {current ? (
        <section className={styles.env} aria-label="环境信息" data-weather-env>
          <div className={styles.envItem}>
            <Text size={200} className={styles.envLabel}>
              体感
            </Text>
            <Text size={300} className={styles.envValue}>
              {fmtTemp(current.feelsLike, settings.unit)}
            </Text>
          </div>
          <div className={styles.envItem}>
            <Text size={200} className={styles.envLabel}>
              湿度
            </Text>
            <Text size={300} className={styles.envValue}>
              {fmtHumidity(current.humidity)}
            </Text>
          </div>
          <div className={styles.envItem}>
            <Text size={200} className={styles.envLabel}>
              风
            </Text>
            <Text size={300} className={styles.envValue}>
              {fmtWind(current.windDir, current.windScale)}
            </Text>
          </div>
          <div className={styles.envItem}>
            <Text size={200} className={styles.envLabel}>
              气压
            </Text>
            <Text size={300} className={styles.envValue}>
              {fmtPressure(current.pressure)}
            </Text>
          </div>
          <div className={styles.envItem}>
            <Text size={200} className={styles.envLabel}>
              能见度
            </Text>
            <Text size={300} className={styles.envValue}>
              {fmtVisibility(current.vis)}
            </Text>
          </div>
          <div className={styles.envItem}>
            <Text size={200} className={styles.envLabel}>
              紫外线
            </Text>
            <Text size={300} className={styles.envValue}>
              {fmtUv(current.uvIndex)}
            </Text>
          </div>
        </section>
      ) : null}

      <DetailTabs items={tabs} value={activeTab} onChange={handleTab} ariaLabel="天气详情内容" />

      <DetailScroll>
        {!data ? (
          status.error ? (
            <MessageBar intent="error" className={styles.notice}>
              <MessageBarBody>{status.error}</MessageBarBody>
              <MessageBarActions>
                <ActionButton onClick={handleRefresh}>重试</ActionButton>
              </MessageBarActions>
            </MessageBar>
          ) : showSpinner ? (
            <div className={styles.contentEmpty}>
              <Spinner size="small" />
              <Text size={300}>正在加载天气数据…</Text>
            </div>
          ) : (
            <div className={styles.contentEmpty} />
          )
        ) : (
          <CrossFade value={activeTab}>
            {activeTab === 'hourly' ? (
              <HourlyPanel
                data={data}
                settings={settings}
                scheme={scheme}
                minutelyState={sectionState.minutely}
                onRetry={() => ensureSection('minutely', { force: true })}
              />
            ) : activeTab === 'daily' ? (
              <DailyPanel data={data} settings={settings} scheme={scheme} />
            ) : activeTab === 'air' ? (
              <AirPanel
                data={data}
                state={sectionState.air}
                showAir={settings.showAir}
                onRetry={() => ensureSection('air', { force: true })}
              />
            ) : activeTab === 'indices' ? (
              <IndicesPanel
                data={data}
                state={sectionState.indices}
                onRetry={() => ensureSection('indices', { force: true })}
              />
            ) : (
              <WarningPanel
                data={data}
                state={sectionState.warnings}
                onRetry={() => ensureSection('warnings', { force: true })}
              />
            )}
          </CrossFade>
        )}
      </DetailScroll>

      {subpage}
    </DetailPage>
  );
}
