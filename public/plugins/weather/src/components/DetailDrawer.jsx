/** 天气详情：Fluent OverlayDrawer + TabList（逐小时 / 7 天 / 空气 / 生活指数 / 预警）。 */

import {
  Badge,
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Spinner,
  Tab,
  TabList,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowClockwise20Regular,
  Dismiss24Regular,
  Location20Regular,
  Settings20Regular,
  WeatherSunny24Regular,
  Warning16Filled,
} from '@fluentui/react-icons';
import { DemoBadge, HiLo, StatusLine, WeatherIcon } from './atoms.jsx';
import { isNight } from './forecast.jsx';
import {
  dayLabel,
  fmtHumidity,
  fmtPop,
  fmtPrecip,
  fmtPressure,
  fmtTemp,
  fmtUv,
  fmtVisibility,
  fmtWind,
  hourLabel,
  monthDayLabel,
} from '../data/format.js';
import { placeMenuLabel } from '../data/store.js';

const useStyles = makeStyles({
  drawer: {
    width: 'min(100%, 540px)',
    maxWidth: '100%',
  },
  header: { gap: '4px' },
  headerTitle: { fontSize: 'clamp(15px, 2.6vh, 20px)' },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    padding: '0 4px 4px',
  },
  headerMetaSpacer: { flex: 1 },
  headline: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(8px, 2vmin, 16px)',
    padding: '4px clamp(2px, 1vmin, 6px) 8px',
    minWidth: 0,
  },
  headlineTemp: { fontSize: 'clamp(30px, 6vmin, 44px)' },
  headlineMeta: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  headlineCondition: { fontSize: tokens.fontSizeBase400, color: tokens.colorNeutralForeground1 },
  headlineSub: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 },
  tabs: { padding: '0 clamp(0px, 1vmin, 8px)' },
  body: { display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px' },
  sectionTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    marginTop: '4px',
  },
  muted: { color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200 },
  row: {
    display: 'grid',
    gridTemplateColumns: '68px 36px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 2px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    minWidth: 0,
  },
  rowTime: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2, fontVariantNumeric: 'tabular-nums' },
  rowText: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rowSub: { fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  rowRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '1px',
    fontVariantNumeric: 'tabular-nums',
  },
  rowTemp: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  dailyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
    gap: '8px',
  },
  dailyCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '8px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: 0,
  },
  dailyTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' },
  dailyDay: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 },
  dailyText: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  dailyTemps: { fontSize: tokens.fontSizeBase300, fontVariantNumeric: 'tabular-nums' },
  minutelyBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '10px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  minutelyBars: { display: 'flex', alignItems: 'flex-end', gap: '2px', height: '44px' },
  minutelyBar: { flex: 1, minWidth: '2px', borderRadius: '2px', backgroundColor: tokens.colorBrandBackground, minHeight: '2px' },
  airHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  airValue: { fontSize: 'clamp(34px, 6vmin, 52px)', fontWeight: tokens.fontWeightSemibold, lineHeight: 1 },
  airMeta: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  airCategory: { fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightSemibold },
  pollutantGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))',
    gap: '8px',
  },
  pollutant: {
    padding: '8px 10px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  pollutantName: { fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 },
  pollutantValue: { fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightSemibold, fontVariantNumeric: 'tabular-nums' },
  advice: {
    display: 'grid',
    gap: '8px',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.5,
  },
  adviceBlock: {
    padding: '8px 10px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  adviceLabel: { display: 'block', color: tokens.colorNeutralForeground3, marginBottom: '2px' },
  indexGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' },
  indexCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '10px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: 0,
  },
  indexTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' },
  indexName: { fontSize: tokens.fontSizeBase300, fontWeight: tokens.fontWeightSemibold },
  indexCategory: { fontSize: tokens.fontSizeBase200, color: tokens.colorBrandForeground1 },
  indexText: { fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3, lineHeight: 1.45 },
  warningCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '10px 12px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    borderLeft: '4px solid transparent',
  },
  warningTitle: { fontSize: tokens.fontSizeBase300, fontWeight: tokens.fontWeightSemibold, display: 'flex', alignItems: 'center', gap: '6px' },
  warningMeta: { fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 },
  warningText: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2, lineHeight: 1.55, whiteSpace: 'pre-wrap' },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '40px 16px',
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
  sectionLoading: { display: 'flex', alignItems: 'center', gap: '8px', color: tokens.colorNeutralForeground3, padding: '12px 4px' },
  errorText: { color: tokens.colorStatusDangerForeground1, fontSize: tokens.fontSizeBase200, padding: '8px 4px' },
});

function tabItems(warnings) {
  return [
    { value: 'hourly', label: '逐小时' },
    { value: 'daily', label: '7 天' },
    { value: 'air', label: '空气' },
    { value: 'indices', label: '生活指数' },
    { value: 'warning', label: `预警${warnings?.length ? ` (${warnings.length})` : ''}` },
  ];
}

function HourlyPanel({ data, settings, scheme, minutelyLoading }) {
  const styles = useStyles();
  const today = data.daily?.[0];
  const minutely = data.minutely;
  return (
    <div className={styles.body}>
      {settings.showMinutely && (
        <div className={styles.minutelyBox}>
          <span className={styles.sectionTitle}>分钟级降水</span>
          {minutely && minutely.summary ? (
            <>
              <span className={styles.muted}>{minutely.summary}</span>
              <div className={styles.minutelyBars} aria-hidden="true">
                {minutely.items.slice(0, 24).map((item, index) => {
                  const max = Math.max(...minutely.items.map((entry) => entry.precip), 0.1);
                  return (
                    <span
                      key={item.time || index}
                      className={styles.minutelyBar}
                      style={{ height: `${Math.max(4, (item.precip / max) * 100)}%` }}
                      title={`${hourLabel(item.time)} ${item.precip}mm`}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <span className={styles.muted}>{minutelyLoading ? '正在获取分钟级降水…' : '当前没有分钟级降水数据'}</span>
          )}
        </div>
      )}
      <span className={styles.sectionTitle}>未来 24 小时</span>
      {(data.hourly || []).map((item, index) => (
        <div className={styles.row} key={item.fxTime || index}>
          <span className={styles.rowTime}>{index === 0 ? '现在' : hourLabel(item.fxTime)}</span>
          <WeatherIcon
            code={item.icon}
            night={isNight(item.fxTime, today?.sunrise, today?.sunset)}
            scheme={scheme}
            size="clamp(24px, 3.6vh, 32px)"
            title={item.text}
          />
          <span className={styles.rowText}>
            {item.text}
            {item.pop > 0 && <span className={styles.rowSub}> · {fmtPop(item.pop)}</span>}
          </span>
          <div className={styles.rowRight}>
            <span className={styles.rowTemp}>{fmtTemp(item.temp, settings.unit)}</span>
            <span className={styles.rowSub}>{fmtWind(item.windDir, item.windScale)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DailyPanel({ data, settings, scheme }) {
  const styles = useStyles();
  return (
    <div className={styles.body}>
      <div className={styles.dailyGrid}>
        {(data.daily || []).slice(0, 7).map((item, index) => (
          <div className={styles.dailyCard} key={item.fxDate || index}>
            <div className={styles.dailyTop}>
              <span className={styles.dailyDay}>{dayLabel(item.fxDate, index)}</span>
              <WeatherIcon code={item.icon} scheme={scheme} size="clamp(24px, 3.6vh, 32px)" title={item.text} />
            </div>
            <span className={styles.dailyText}>{item.text}</span>
            <span className={styles.dailyTemps}>
              {fmtTemp(item.tempMax, settings.unit)} / {fmtTemp(item.tempMin, settings.unit)}
            </span>
            <span className={styles.dailyText}>
              {monthDayLabel(item.fxDate)} · {fmtHumidity(item.humidity)}
            </span>
          </div>
        ))}
      </div>
      <span className={styles.sectionTitle}>逐日明细</span>
      {(data.daily || []).slice(0, 7).map((item, index) => (
        <div className={styles.row} key={`row-${item.fxDate || index}`}>
          <span className={styles.rowTime}>{dayLabel(item.fxDate, index)}</span>
          <WeatherIcon code={item.icon} scheme={scheme} size="clamp(24px, 3.6vh, 32px)" title={item.text} />
          <span className={styles.rowText}>
            {item.text} / {item.textNight || item.text}
            <span className={styles.rowSub}> · {fmtWind(item.windDir, item.windScale)}</span>
          </span>
          <div className={styles.rowRight}>
            <HiLo max={item.tempMax} min={item.tempMin} unit={settings.unit} className={styles.rowTemp} />
            <span className={styles.rowSub}>
              {item.pop > 0 ? fmtPop(item.pop) : `紫外线 ${fmtUv(item.uvIndex)}`}
            </span>
          </div>
        </div>
      ))}
      <div className={styles.row} style={{ borderBottom: 'none', gridTemplateColumns: '68px 36px minmax(0, 1fr) auto' }}>
        <span className={styles.rowTime}>今日</span>
        <WeatherSunny24Regular style={{ color: tokens.colorNeutralForeground3 }} />
        <span className={styles.rowText}>
          日出 {hourLabel(data.daily?.[0]?.sunrise)} · 日落 {hourLabel(data.daily?.[0]?.sunset)}
        </span>
        <span className={styles.rowSub}>湿度 {fmtHumidity(data.daily?.[0]?.humidity)}</span>
      </div>
    </div>
  );
}

function AirPanel({ data, loading, error, requestSection }) {
  const styles = useStyles();
  const air = data.air;
  if (loading && !air) {
    return (
      <div className={styles.sectionLoading}>
        <Spinner size="tiny" /> 正在获取空气质量…
      </div>
    );
  }
  if (error && !air) return <span className={styles.errorText}>{error}</span>;
  if (!air) {
    return (
      <div className={styles.empty}>
        <span>当前没有空气质量数据</span>
        <Button size="small" onClick={() => requestSection('air')}>
          重新获取
        </Button>
      </div>
    );
  }
  const pollutants = Object.entries(air.pollutants || {});
  return (
    <div className={styles.body}>
      <div className={styles.airHero}>
        <span className={styles.airValue} style={{ color: air.color }}>
          {air.aqiDisplay || air.aqi}
        </span>
        <div className={styles.airMeta}>
          <span className={styles.airCategory} style={{ color: air.color }}>
            {air.category || '—'}
          </span>
          <span className={styles.muted}>
            {air.aqiStandard === 'cn-mee' ? '中国 AQI 标准' : 'AQI'} · 首要污染物 {air.primary || '—'}
          </span>
          {air.health?.effect && <span className={styles.muted}>{air.health.effect}</span>}
        </div>
      </div>
      <span className={styles.sectionTitle}>污染物浓度</span>
      <div className={styles.pollutantGrid}>
        {pollutants.map(([code, item]) => (
          <div className={styles.pollutant} key={code}>
            <span className={styles.pollutantName}>{item.name || code}</span>
            <span className={styles.pollutantValue}>
              {item.value == null ? '—' : Math.round(item.value * 10) / 10}
              <span className={styles.pollutantName}> {item.unit}</span>
            </span>
          </div>
        ))}
      </div>
      {(air.health?.general || air.health?.sensitive) && (
        <>
          <span className={styles.sectionTitle}>健康建议</span>
          <div className={styles.advice}>
            {air.health.general && (
              <div className={styles.adviceBlock}>
                <span className={styles.adviceLabel}>一般人群</span>
                {air.health.general}
              </div>
            )}
            {air.health.sensitive && (
              <div className={styles.adviceBlock}>
                <span className={styles.adviceLabel}>敏感人群</span>
                {air.health.sensitive}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function IndicesPanel({ data, loading, error, requestSection }) {
  const styles = useStyles();
  const indices = data.indices;
  if (loading && !indices) {
    return (
      <div className={styles.sectionLoading}>
        <Spinner size="tiny" /> 正在获取生活指数…
      </div>
    );
  }
  if (error && !indices) return <span className={styles.errorText}>{error}</span>;
  if (!indices || indices.length === 0) {
    return (
      <div className={styles.empty}>
        <span>当前城市暂无生活指数</span>
        <Button size="small" onClick={() => requestSection('indices')}>
          重新获取
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.body}>
      <span className={styles.sectionTitle}>今日生活指数</span>
      <div className={styles.indexGrid}>
        {indices.map((item) => (
          <div className={styles.indexCard} key={`${item.type}-${item.date}`}>
            <div className={styles.indexTop}>
              <span className={styles.indexName}>{item.name}</span>
              <span className={styles.indexCategory}>{item.category}</span>
            </div>
            <span className={styles.indexText}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarningPanel({ data, loading, error, requestSection }) {
  const styles = useStyles();
  const warnings = data.warnings;
  if (loading && !warnings) {
    return (
      <div className={styles.sectionLoading}>
        <Spinner size="tiny" /> 正在获取天气预警…
      </div>
    );
  }
  if (error && !warnings) return <span className={styles.errorText}>{error}</span>;
  if (!warnings || warnings.length === 0) {
    return (
      <div className={styles.empty}>
        <WeatherSunny24Regular />
        <span>当前没有生效的天气预警</span>
        <Button size="small" onClick={() => requestSection('warnings')}>
          重新获取
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.body}>
      <span className={styles.sectionTitle}>正在生效的预警</span>
      {warnings.map((item) => (
        <div className={styles.warningCard} key={item.id} style={{ borderLeftColor: item.color }}>
          <span className={styles.warningTitle} style={{ color: item.color }}>
            <Warning16Filled />
            {item.title}
          </span>
          <span className={styles.warningMeta}>
            {[item.typeName, item.severityText, item.sender].filter(Boolean).join(' · ')}
          </span>
          <span className={styles.warningMeta}>
            {item.startTime && `生效 ${new Date(item.startTime).toLocaleString('zh-CN', { hour12: false })}`}
            {item.endTime && ` → ${new Date(item.endTime).toLocaleString('zh-CN', { hour12: false })}`}
          </span>
          <span className={styles.warningText}>{item.text}</span>
          {item.guide && <span className={styles.warningText}>{item.guide}</span>}
        </div>
      ))}
    </div>
  );
}

export default function DetailDrawer({
  open,
  tab,
  onTabChange,
  onClose,
  onRefresh,
  onOpenSettings,
  settings,
  place,
  data,
  status,
  scheme,
  now,
  sections,
  onRequestSection,
  mock,
}) {
  const styles = useStyles();
  const warnings = data?.warnings;
  const tabs = tabItems(warnings);
  const current = data?.current;
  const today = data?.daily?.[0];
  const currentNight = current
    ? isNight(current.obsTime || new Date().toISOString(), today?.sunrise, today?.sunset)
    : false;
  const sectionState = (section) => sections?.[section] || { loading: false, error: '' };
  const requestSection = (section) => {
    onRequestSection?.(section);
    return sectionState(section).loading;
  };

  return (
    <OverlayDrawer
      open={open}
      onOpenChange={(_, detail) => {
        if (!detail.open) onClose();
      }}
      position="end"
      size="small"
      className={styles.drawer}
      aria-label="天气详情"
    >
      <DrawerHeader className={styles.header}>
        <DrawerHeaderTitle
          className={styles.headerTitle}
          action={
            <Button
              appearance="subtle"
              aria-label="关闭详情"
              icon={<Dismiss24Regular />}
              onClick={onClose}
            />
          }
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Location20Regular />
            {place ? placeMenuLabel(place) : '天气详情'}
          </span>
        </DrawerHeaderTitle>
      </DrawerHeader>

      <div className={styles.headerMeta}>
        {mock && <DemoBadge />}
        <StatusLine offline={status?.offline} fetchedAt={data?.fetchedAt} refreshMin={settings.refreshMin} now={now} />
        <span className={styles.headerMetaSpacer} />
        <Button
          appearance="subtle"
          size="small"
          icon={<ArrowClockwise20Regular />}
          onClick={onRefresh}
          aria-label="刷新天气"
        >
          刷新
        </Button>
        <Button appearance="subtle" size="small" icon={<Settings20Regular />} onClick={onOpenSettings}>
          设置
        </Button>
      </div>

      {data && current && (
        <div className={styles.headline}>
          <WeatherIcon
            code={current.icon}
            night={currentNight}
            scheme={scheme}
            size="clamp(38px, 7vmin, 56px)"
            title={current.text}
          />
          <span className={styles.headlineTemp}>{fmtTemp(current.temp, settings.unit)}</span>
          <div className={styles.headlineMeta}>
            <span className={styles.headlineCondition}>{current.text}</span>
            <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} className={styles.muted} />
            <span className={styles.muted}>
              体感 {fmtTemp(current.feelsLike, settings.unit)} · 湿度 {fmtHumidity(current.humidity)} · 风{' '}
              {fmtWind(current.windDir, current.windScale)}
            </span>
            <span className={styles.muted}>
              气压 {fmtPressure(current.pressure)} · 能见度 {fmtVisibility(current.vis)}
              {fmtPrecip(current.precip) ? ` · 降水 ${fmtPrecip(current.precip)}` : ''} · 紫外线 {fmtUv(current.uvIndex)}
            </span>
          </div>
        </div>
      )}

      <TabList
        className={styles.tabs}
        selectedValue={tab}
        onTabSelect={(_, detail) => onTabChange(detail.value)}
        size="small"
      >
        {tabs.map((item) => (
          <Tab key={item.value} value={item.value}>
            {item.value === 'warning' && warnings?.length ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {item.label}
                <Badge appearance="filled" color="danger" size="small">
                  {warnings.length}
                </Badge>
              </span>
            ) : (
              item.label
            )}
          </Tab>
        ))}
      </TabList>

      <DrawerBody>
        {!data ? (
          <div className={styles.sectionLoading}>
            <Spinner size="tiny" /> 正在加载天气数据…
          </div>
        ) : tab === 'hourly' ? (
          <HourlyPanel
            data={data}
            settings={settings}
            scheme={scheme}
            minutelyLoading={sectionState('minutely').loading}
          />
        ) : tab === 'daily' ? (
          <DailyPanel data={data} settings={settings} scheme={scheme} />
        ) : tab === 'air' ? (
          <AirPanel data={data} loading={sectionState('air').loading} error={sectionState('air').error} requestSection={requestSection} />
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
      </DrawerBody>
    </OverlayDrawer>
  );
}
