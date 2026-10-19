/** 天气详情各 Tab 的内容组件（设置/详情浮层视图共用，不依赖浮层容器）。 */

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { WeatherSunny24Regular, Warning16Filled } from '@fluentui/react-icons';
import { WeatherIcon } from '../components/atoms.jsx';
import { isNight } from '../components/forecast.jsx';
import {
  dayLabel,
  fmtHumidity,
  fmtPop,
  fmtTemp,
  fmtUv,
  fmtWind,
  hourLabel,
  monthDayLabel,
} from '../data/format.js';

const useStyles = makeStyles({
  body: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  sectionTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    marginTop: tokens.spacingVerticalXS,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '72px 32px minmax(0, 1fr) auto',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalXS}`,
    minWidth: 0,
  },
  rowTime: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
  },
  rowText: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rowSub: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  rowRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: tokens.spacingVerticalXXS,
    fontVariantNumeric: 'tabular-nums',
  },
  rowTemp: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  dailyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
    gap: tokens.spacingHorizontalS,
  },
  dailyCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: 0,
  },
  dailyTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacingHorizontalXS },
  dailyDay: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 },
  dailyText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dailyTemps: { fontSize: tokens.fontSizeBase300, fontVariantNumeric: 'tabular-nums' },
  minutelyBox: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  minutelyBars: { display: 'flex', alignItems: 'flex-end', gap: '2px', height: '36px' },
  minutelyBar: {
    flex: 1,
    minWidth: '2px',
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorBrandBackground,
    minHeight: '2px',
  },
  airHero: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalL, padding: `${tokens.spacingVerticalXS} 0` },
  airValue: {
    fontSize: tokens.fontSizeHero800,
    lineHeight: tokens.lineHeightHero800,
    fontWeight: tokens.fontWeightSemibold,
  },
  airMeta: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS, minWidth: 0 },
  airCategory: { fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightSemibold },
  pollutantGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  pollutant: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS },
  pollutantName: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 },
  pollutantValue: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
  },
  advice: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase300,
  },
  adviceLabel: {
    display: 'block',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    marginBottom: tokens.spacingVerticalXXS,
  },
  indexGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXL}`,
  },
  indexItem: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS, minWidth: 0 },
  indexTop: { display: 'flex', alignItems: 'baseline', gap: tokens.spacingHorizontalS },
  indexName: { fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground1 },
  indexCategory: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 },
  indexText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    lineHeight: tokens.lineHeightBase200,
  },
  warningHeader: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, minWidth: 0, width: '100%' },
  warningTitle: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  },
  warningMeta: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  warningBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
  },
  warningText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase300,
    whiteSpace: 'pre-wrap',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    fontSize: tokens.fontSizeBase200,
  },
  sectionLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    padding: tokens.spacingVerticalS,
  },
  errorText: { color: tokens.colorStatusDangerForeground1, fontSize: tokens.fontSizeBase200, padding: tokens.spacingVerticalS },
});

export function tabItems() {
  return [
    { value: 'hourly', label: '逐小时' },
    { value: 'daily', label: '7 天' },
    { value: 'air', label: '空气' },
    { value: 'indices', label: '生活指数' },
    { value: 'warning', label: '预警' },
  ];
}

export function HourlyPanel({ data, settings, scheme, minutelyLoading }) {
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
            size="26px"
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

export function DailyPanel({ data, settings, scheme }) {
  const styles = useStyles();
  const today = data.daily?.[0];
  return (
    <div className={styles.body}>
      <div className={styles.dailyGrid}>
        {(data.daily || []).slice(0, 7).map((item, index) => (
          <div className={styles.dailyCard} key={item.fxDate || index}>
            <div className={styles.dailyTop}>
              <span className={styles.dailyDay}>{dayLabel(item.fxDate, index)}</span>
              <WeatherIcon code={item.icon} scheme={scheme} size="26px" title={item.text} />
            </div>
            <span className={styles.dailyText}>{monthDayLabel(item.fxDate)}</span>
            <span className={styles.dailyText}>{item.text}</span>
            <span className={styles.dailyTemps}>
              {fmtTemp(item.tempMax, settings.unit)} / {fmtTemp(item.tempMin, settings.unit)}
            </span>
            <span className={styles.dailyText}>
              {item.pop > 0 ? fmtPop(item.pop) : `紫外线 ${fmtUv(item.uvIndex)}`}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.row} style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
        <span className={styles.muted}>
          日出 {hourLabel(today?.sunrise)} · 日落 {hourLabel(today?.sunset)} · 湿度 {fmtHumidity(today?.humidity)}
        </span>
        <span className={styles.rowSub}>{fmtWind(today?.windDir, today?.windScale)}</span>
      </div>
    </div>
  );
}

export function AirPanel({ data, loading, error, requestSection }) {
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
        <Button size="large" onClick={() => requestSection('air')}>
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
              <div>
                <span className={styles.adviceLabel}>一般人群</span>
                {air.health.general}
              </div>
            )}
            {air.health.sensitive && (
              <div>
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

export function IndicesPanel({ data, loading, error, requestSection }) {
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
        <Button size="large" onClick={() => requestSection('indices')}>
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
          <div className={styles.indexItem} key={`${item.type}-${item.date}`}>
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

export function WarningPanel({ data, loading, error, requestSection }) {
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
        <Button size="large" onClick={() => requestSection('warnings')}>
          重新获取
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.body}>
      <span className={styles.sectionTitle}>正在生效的预警（点开查看详情）</span>
      <Accordion multiple collapsible>
        {warnings.map((item) => (
          <AccordionItem value={item.id} key={item.id}>
            <AccordionHeader expandIconPosition="end">
              <span className={styles.warningHeader}>
                <Warning16Filled style={{ color: item.color, flexShrink: 0 }} />
                <span className={styles.warningTitle}>{item.title}</span>
                <span className={styles.warningMeta}>
                  {[item.typeName, item.severityText].filter(Boolean).join(' · ')}
                </span>
              </span>
            </AccordionHeader>
            <AccordionPanel>
              <div className={styles.warningBody}>
                <span className={styles.muted}>
                  {item.startTime && `生效 ${new Date(item.startTime).toLocaleString('zh-CN', { hour12: false })}`}
                  {item.endTime && ` → ${new Date(item.endTime).toLocaleString('zh-CN', { hour12: false })}`}
                </span>
                <span className={styles.warningText}>{item.text}</span>
                {item.guide && <span className={styles.warningText}>{item.guide}</span>}
              </div>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

