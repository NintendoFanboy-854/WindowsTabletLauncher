/**
 * 天气详情各面板（按 OVERLAY-REWRITE-SPEC §3.1 重排）。
 *
 * 统计用两列 statCard（≥160×88、colorNeutralBackground2、圆角 8、padding 12，
 * 值 24–32 semibold、标签 12 fg3）；逐时/7 天/预警用列表，行高 ≥44，正文 ≥12。
 */

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Spinner,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { Warning16Filled, WeatherSunny24Regular } from '@fluentui/react-icons';
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
} from '../data/format.js';

const useStyles = makeStyles({
  panel: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM, minWidth: 0 },
  sectionTitle: { color: tokens.colorNeutralForeground1, display: 'block' },

  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
    width: '100%',
  },
  statCard: {
    minWidth: '160px',
    minHeight: '88px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusXLarge,
    padding: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXXS,
    boxSizing: 'border-box',
  },
  statValueLg: {
    fontSize: tokens.fontSizeHero800,
    lineHeight: tokens.lineHeightHero800,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statValueMd: {
    fontSize: tokens.fontSizeBase600,
    lineHeight: tokens.lineHeightBase600,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statUnit: {
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    fontWeight: tokens.fontWeightRegular,
    color: tokens.colorNeutralForeground3,
    marginLeft: tokens.spacingHorizontalXS,
  },
  statLabel: { color: tokens.colorNeutralForeground3 },

  list: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  row: {
    display: 'grid',
    gridTemplateColumns: '56px 28px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minHeight: '44px',
    minWidth: 0,
  },
  rowTime: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  rowText: {
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  rowSub: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  rowRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXXS,
    whiteSpace: 'nowrap',
  },
  rowTemp: { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },

  dailyRow: {
    display: 'grid',
    gridTemplateColumns: '64px 24px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minHeight: '44px',
    minWidth: 0,
  },
  dailyTemps: { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  dailyLow: { color: tokens.colorNeutralForeground3, fontVariantNumeric: 'tabular-nums' },

  minutelyBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusXLarge,
    padding: tokens.spacingVerticalM,
    minWidth: 0,
  },
  minutelyBars: { display: 'flex', alignItems: 'flex-end', gap: tokens.spacingHorizontalXXS, height: '48px', minWidth: 0 },
  minutelyBar: {
    flex: 1,
    minWidth: '2px',
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorBrandBackground,
  },

  adviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  adviceCard: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusXLarge,
    padding: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  adviceText: { color: tokens.colorNeutralForeground2, whiteSpace: 'pre-wrap' },

  indexGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  indexCard: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusXLarge,
    padding: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  indexTop: { display: 'flex', alignItems: 'baseline', gap: tokens.spacingHorizontalS, minWidth: 0 },
  indexName: { color: tokens.colorNeutralForeground1 },
  indexCategory: { color: tokens.colorNeutralForeground2 },
  indexText: { color: tokens.colorNeutralForeground3, whiteSpace: 'pre-wrap' },

  warningHeader: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, minWidth: 0, flexWrap: 'wrap' },
  warningTitle: { color: tokens.colorNeutralForeground1 },
  warningMeta: { color: tokens.colorNeutralForeground3 },
  warningBody: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS, paddingBottom: tokens.spacingVerticalM },
  warningText: { color: tokens.colorNeutralForeground2, whiteSpace: 'pre-wrap' },
  accordionHeader: { minHeight: '44px' },

  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
  sectionLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
    padding: tokens.spacingVerticalS,
  },
  errorText: { color: tokens.colorStatusDangerForeground1, padding: tokens.spacingVerticalS },
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

/** 统计卡：值 24/32 semibold，标签 12 fg3；可选副行（类别）14 semibold */
export function StatCard({ label, value, unit, sub, subColor, valueSize = 'lg', className }) {
  const styles = useStyles();
  return (
    <div className={mergeClasses(styles.statCard, className)} data-stat-card>
      <span className={valueSize === 'lg' ? styles.statValueLg : styles.statValueMd}>
        {value}
        {unit ? <span className={styles.statUnit}>{unit}</span> : null}
      </span>
      <Text size={200} className={styles.statLabel}>
        {label}
      </Text>
      {sub ? (
        <Text size={300} weight="semibold" style={subColor ? { color: subColor } : undefined}>
          {sub}
        </Text>
      ) : null}
    </div>
  );
}

export function HourlyPanel({ data, settings, scheme, minutelyLoading }) {
  const styles = useStyles();
  const today = data.daily?.[0];
  const minutely = data.minutely;
  return (
    <div className={styles.panel}>
      {settings.showMinutely && (
        <div className={styles.minutelyBox}>
          <Text size={400} weight="semibold">
            分钟级降水
          </Text>
          {minutely && minutely.summary ? (
            <>
              <Text size={300} className={styles.adviceText}>
                {minutely.summary}
              </Text>
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
            <Text size={300} className={styles.adviceText}>
              {minutelyLoading ? '正在获取分钟级降水…' : '当前没有分钟级降水数据'}
            </Text>
          )}
        </div>
      )}
      <Text size={400} weight="semibold">
        未来 24 小时
      </Text>
      <div className={styles.list}>
        {(data.hourly || []).map((item, index) => (
          <div className={styles.row} key={item.fxTime || index}>
            <Text size={300} className={styles.rowTime}>
              {index === 0 ? '现在' : hourLabel(item.fxTime)}
            </Text>
            <WeatherIcon
              code={item.icon}
              night={isNight(item.fxTime, today?.sunrise, today?.sunset)}
              scheme={scheme}
              size={28}
              title={item.text}
            />
            <Text size={300} className={styles.rowText}>
              {item.text}
              {item.pop > 0 ? ` · ${fmtPop(item.pop)}` : ''}
            </Text>
            <div className={styles.rowRight}>
              <Text size={400} weight="semibold" className={styles.rowTemp}>
                {fmtTemp(item.temp, settings.unit)}
              </Text>
              <Text size={200} className={styles.rowSub}>
                {fmtWind(item.windDir, item.windScale)}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DailyPanel({ data, settings, scheme }) {
  const styles = useStyles();
  const today = data.daily?.[0];
  return (
    <div className={styles.panel}>
      <Text size={400} weight="semibold">
        7 天预报
      </Text>
      <div className={styles.list}>
        {(data.daily || []).slice(0, 7).map((item, index) => (
          <div className={styles.dailyRow} key={item.fxDate || index}>
            <Text size={300}>
              {index === 0 ? '今天' : dayLabel(item.fxDate, index)}
            </Text>
            <WeatherIcon code={item.icon} scheme={scheme} size={24} title={item.text} />
            <Text size={300} className={styles.rowText}>
              {item.text}
            </Text>
            <div className={styles.rowRight}>
              <span className={styles.dailyTemps}>
                <Text size={500} weight="semibold" className={styles.dailyTemps}>
                  {fmtTemp(item.tempMax, settings.unit)}
                </Text>{' '}
                <Text size={300} className={styles.dailyLow}>
                  {fmtTemp(item.tempMin, settings.unit)}
                </Text>
              </span>
              <Text size={200} className={styles.rowSub}>
                {item.pop > 0 ? fmtPop(item.pop) : `紫外线 ${fmtUv(item.uvIndex)}`}
              </Text>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.row} style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
        <Text size={300} className={styles.rowSub}>
          日出 {hourLabel(today?.sunrise)} · 日落 {hourLabel(today?.sunset)} · 湿度 {fmtHumidity(today?.humidity)}
        </Text>
        <Text size={300} className={styles.rowSub}>
          {fmtWind(today?.windDir, today?.windScale)}
        </Text>
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
        <Spinner size="tiny" />
        <Text size={300}>正在获取空气质量…</Text>
      </div>
    );
  }
  if (error && !air) {
    return (
      <Text size={300} className={styles.errorText}>
        {error}
      </Text>
    );
  }
  if (!air) {
    return (
      <div className={styles.empty}>
        <Text size={300}>当前没有空气质量数据</Text>
        <Button size="large" onClick={() => requestSection('air')}>
          重新获取
        </Button>
      </div>
    );
  }
  const pollutants = Object.entries(air.pollutants || {});
  return (
    <div className={styles.panel}>
      <div className={styles.statGrid}>
        <StatCard
          label="空气质量指数"
          value={air.aqiDisplay || air.aqi || '—'}
          sub={air.category || '—'}
          subColor={air.color}
        />
        <StatCard label="首要污染物" value={air.primary || '—'} sub={air.aqiStandard === 'cn-mee' ? '中国 AQI 标准' : 'AQI'} valueSize="md" />
      </div>
      <Text size={400} weight="semibold">
        污染物浓度
      </Text>
      <div className={styles.statGrid}>
        {pollutants.map(([code, item]) => (
          <StatCard
            key={code}
            label={item.name || code}
            value={item.value == null ? '—' : Math.round(item.value * 10) / 10}
            unit={item.unit}
            valueSize="md"
          />
        ))}
      </div>
      {(air.health?.general || air.health?.sensitive) && (
        <>
          <Text size={400} weight="semibold">
            健康建议
          </Text>
          <div className={styles.adviceGrid}>
            {air.health.general && (
              <div className={styles.adviceCard}>
                <Text size={200} className={styles.statLabel}>
                  一般人群
                </Text>
                <Text size={300} className={styles.adviceText}>
                  {air.health.general}
                </Text>
              </div>
            )}
            {air.health.sensitive && (
              <div className={styles.adviceCard}>
                <Text size={200} className={styles.statLabel}>
                  敏感人群
                </Text>
                <Text size={300} className={styles.adviceText}>
                  {air.health.sensitive}
                </Text>
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
        <Spinner size="tiny" />
        <Text size={300}>正在获取生活指数…</Text>
      </div>
    );
  }
  if (error && !indices) {
    return (
      <Text size={300} className={styles.errorText}>
        {error}
      </Text>
    );
  }
  if (!indices || indices.length === 0) {
    return (
      <div className={styles.empty}>
        <Text size={300}>当前城市暂无生活指数</Text>
        <Button size="large" onClick={() => requestSection('indices')}>
          重新获取
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.panel}>
      <Text size={400} weight="semibold">
        今日生活指数
      </Text>
      <div className={styles.indexGrid}>
        {indices.map((item) => (
          <div className={styles.indexCard} key={`${item.type}-${item.date}`}>
            <div className={styles.indexTop}>
              <Text size={300} weight="semibold" className={styles.indexName}>
                {item.name}
              </Text>
              <Text size={200} className={styles.indexCategory}>
                {item.category}
              </Text>
            </div>
            <Text size={200} className={styles.indexText}>
              {item.text}
            </Text>
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
        <Spinner size="tiny" />
        <Text size={300}>正在获取天气预警…</Text>
      </div>
    );
  }
  if (error && !warnings) {
    return (
      <Text size={300} className={styles.errorText}>
        {error}
      </Text>
    );
  }
  if (!warnings || warnings.length === 0) {
    return (
      <div className={styles.empty}>
        <WeatherSunny24Regular />
        <Text size={300}>当前没有生效的天气预警</Text>
        <Button size="large" onClick={() => requestSection('warnings')}>
          重新获取
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.panel}>
      <Text size={400} weight="semibold">
        正在生效的预警（点开查看详情）
      </Text>
      <Accordion multiple collapsible>
        {warnings.map((item) => (
          <AccordionItem value={item.id} key={item.id}>
            <AccordionHeader className={styles.accordionHeader} expandIconPosition="end">
              <span className={styles.warningHeader}>
                <Warning16Filled style={{ color: item.color, flexShrink: 0 }} />
                <Text size={300} weight="semibold" className={styles.warningTitle}>
                  {item.title}
                </Text>
                <Text size={200} className={styles.warningMeta}>
                  {[item.typeName, item.severityText].filter(Boolean).join(' · ')}
                </Text>
              </span>
            </AccordionHeader>
            <AccordionPanel>
              <div className={styles.warningBody}>
                <Text size={200} className={styles.warningMeta}>
                  {item.startTime && `生效 ${new Date(item.startTime).toLocaleString('zh-CN', { hour12: false })}`}
                  {item.endTime && ` → ${new Date(item.endTime).toLocaleString('zh-CN', { hour12: false })}`}
                </Text>
                <Text size={300} className={styles.warningText}>
                  {item.text}
                </Text>
                {item.guide && (
                  <Text size={200} className={styles.warningText}>
                    {item.guide}
                  </Text>
                )}
              </div>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

