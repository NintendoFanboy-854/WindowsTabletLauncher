/**
 * L1 详情各 Tab 的内容（平级内容，用 DetailTabs + CrossFade 切换）。
 *
 * 行高与字号按 docs/components/weather.md：
 * - 逐时：行 44，时间 14 fg2 / 图标 24 / 温度 16 semibold / 现象 14 / 风 12 fg3 / 降水 12 fg3；
 * - 7 天：行 44，星期 14 + 日期 12 fg3 / 图标 24 / 现象 14 / 高温 20 semibold + 低温 14 fg3 / 风 12；
 * - 空气：AQI 环 88 + 类别 14 + 首要污染物 12；污染物行 44（名称 14 / 值 16 semibold 右对齐 / 单位 12 fg3）；
 * - 生活指数：行 48–64，名称 14 / 类别 14 fg2 / 建议 14 fg2；
 * - 预警：Accordion，标题 14 semibold / 正文 14 fg2 / 时间 12 fg3，不裁切。
 */

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Spinner,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { ArrowClockwise20Regular, Settings20Regular, Water20Regular, WeatherSunny24Regular } from '@fluentui/react-icons';
import { ActionButton, EmptyState, LIST_ROW_HEIGHT } from '../../../_shared/ui.jsx';
import { requestHostSettings } from '../../../_shared/host.js';
import { WeatherIcon, statusToneColor } from '../components/atoms.jsx';
import { AirRing, isNight } from '../components/forecast.jsx';
import {
  fmtPop,
  fmtTemp,
  fmtWind,
  hourLabel,
  shortDate,
  weekdayLabel,
} from '../data/format.js';

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    minWidth: 0,
  },
  list: { display: 'flex', flexDirection: 'column', minWidth: 0 },

  hourlyRow: {
    display: 'grid',
    gridTemplateColumns: '56px 24px 56px minmax(0, 1fr) 104px 80px',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minHeight: `${LIST_ROW_HEIGHT}px`,
    minWidth: 0,
  },
  dailyRow: {
    display: 'grid',
    gridTemplateColumns: '104px 24px minmax(0, 1fr) 112px 96px',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minHeight: `${LIST_ROW_HEIGHT}px`,
    minWidth: 0,
  },
  dayCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  time: { color: tokens.colorNeutralForeground2, whiteSpace: 'nowrap' },
  muted: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  text: {
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  right: { justifySelf: 'end', whiteSpace: 'nowrap' },
  temp: { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  high: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  low: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  temps: {
    display: 'inline-flex',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },

  minutely: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusXLarge,
    padding: tokens.spacingVerticalM,
    minWidth: 0,
  },
  minutelyHead: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground2,
  },
  minutelyBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: tokens.spacingHorizontalXXS,
    height: `calc(${tokens.spacingVerticalXXXL} + ${tokens.spacingVerticalL})`,
    minWidth: 0,
  },
  minutelyBar: {
    flex: 1,
    minWidth: tokens.spacingHorizontalXXS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralForeground3,
  },

  airTop: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXL,
    minWidth: 0,
    flexWrap: 'wrap',
  },
  airMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  airMetric: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto 72px',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minHeight: `${LIST_ROW_HEIGHT}px`,
    minWidth: 0,
  },
  airValue: { justifySelf: 'end', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  airUnit: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },

  indexRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minHeight: `calc(${tokens.spacingVerticalXXXL} + ${tokens.spacingVerticalL})`,
    paddingBlock: tokens.spacingVerticalS,
    minWidth: 0,
  },
  indexHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  indexAdvice: { color: tokens.colorNeutralForeground2, whiteSpace: 'pre-wrap' },

  warningHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    width: '100%',
    minWidth: 0,
    minHeight: `${LIST_ROW_HEIGHT}px`,
  },
  warningDot: {
    width: tokens.spacingHorizontalMNudge,
    height: tokens.spacingHorizontalMNudge,
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
  },
  warningTitle: { color: tokens.colorNeutralForeground1, minWidth: 0, flex: '1 1 auto' },
  warningMeta: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap', flexShrink: 0 },
  warningBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalM,
    minWidth: 0,
  },
  warningText: { color: tokens.colorNeutralForeground2, whiteSpace: 'pre-wrap' },
  warningTime: { color: tokens.colorNeutralForeground3 },

  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
    paddingBlock: tokens.spacingVerticalM,
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalS,
    color: tokens.colorStatusDangerForeground1,
    paddingBlock: tokens.spacingVerticalS,
  },
});

function SectionLoading({ label }) {
  const styles = useStyles();
  return (
    <div className={styles.loading}>
      <Spinner size="tiny" />
      <Text size={300}>{label}</Text>
    </div>
  );
}

function SectionError({ message, onRetry }) {
  const styles = useStyles();
  return (
    <div className={styles.error}>
      <Text size={300}>{message}</Text>
      {onRetry ? <ActionButton onClick={onRetry}>重试</ActionButton> : null}
    </div>
  );
}

export function HourlyPanel({ data, settings, scheme, minutelyState, onRetry }) {
  const styles = useStyles();
  const today = data.daily?.[0];
  const minutely = data.minutely;
  const hourly = data.hourly || [];

  return (
    <div className={styles.stack}>
      {settings.showMinutely && minutely && minutely.items?.length > 0 ? (
        <div className={styles.minutely}>
          <div className={styles.minutelyHead}>
            <Water20Regular />
            <Text size={300} weight="semibold">
              分钟级降水
            </Text>
          </div>
          {minutely.summary ? (
            <Text size={300} className={styles.indexAdvice}>
              {minutely.summary}
            </Text>
          ) : null}
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
        </div>
      ) : null}
      {settings.showMinutely && !minutely && minutelyState?.loading ? (
        <SectionLoading label="正在获取分钟级降水…" />
      ) : null}

      {hourly.length === 0 ? (
        <SectionError message="暂时没有逐时预报" onRetry={onRetry} />
      ) : (
        <div className={styles.list}>
          {hourly.map((item, index) => (
            <div className={styles.hourlyRow} data-hourly-row key={item.fxTime || index}>
              <Text size={300} className={styles.time}>
                {index === 0 ? '现在' : hourLabel(item.fxTime)}
              </Text>
              <WeatherIcon
                code={item.icon}
                night={isNight(item.fxTime, today?.sunrise, today?.sunset)}
                scheme={scheme}
                size={24}
                title={item.text}
              />
              <Text size={400} weight="semibold" className={styles.temp}>
                {fmtTemp(item.temp, settings.unit)}
              </Text>
              <Text size={300} className={styles.text}>
                {item.text}
              </Text>
              <Text size={200} className={mergeClasses(styles.muted, styles.right)}>
                {fmtWind(item.windDir, item.windScale)}
              </Text>
              <Text size={200} className={mergeClasses(styles.muted, styles.right)}>
                {item.pop > 0 ? fmtPop(item.pop) : ''}
              </Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DailyPanel({ data, settings, scheme }) {
  const styles = useStyles();
  const daily = (data.daily || []).slice(0, 7);
  if (daily.length === 0) {
    return <SectionError message="暂时没有 7 天预报" />;
  }
  return (
    <div className={styles.list}>
      {daily.map((item, index) => (
        <div className={styles.dailyRow} data-daily-row key={item.fxDate || index}>
          <div className={styles.dayCell}>
            <Text size={300}>{weekdayLabel(item.fxDate, index)}</Text>
            <Text size={200} className={styles.muted}>
              {shortDate(item.fxDate)}
            </Text>
          </div>
          <WeatherIcon code={item.icon} scheme={scheme} size={24} title={item.text} />
          <Text size={300} className={styles.text}>
            {item.text}
          </Text>
          <div className={styles.temps}>
            <Text size={500} weight="semibold" className={styles.high}>
              {fmtTemp(item.tempMax, settings.unit)}
            </Text>
            <Text size={300} className={styles.low}>
              {fmtTemp(item.tempMin, settings.unit)}
            </Text>
          </div>
          <Text size={200} className={mergeClasses(styles.muted, styles.right)}>
            {fmtWind(item.windDir, item.windScale)}
          </Text>
        </div>
      ))}
    </div>
  );
}

export function AirPanel({ data, state, onRetry, showAir = true }) {
  const styles = useStyles();
  const air = data.air;

  if (!showAir) {
    return (
      <EmptyState
        icon={<WeatherSunny24Regular />}
        title="空气质量已关闭"
        action={
          <ActionButton icon={<Settings20Regular />} onClick={requestHostSettings}>
            去设置
          </ActionButton>
        }
      />
    );
  }
  if (!air && state?.loading) return <SectionLoading label="正在获取空气质量…" />;
  if (!air && state?.error) return <SectionError message={state.error} onRetry={onRetry} />;
  if (!air) {
    return (
      <EmptyState
        icon={<WeatherSunny24Regular />}
        title="暂无空气质量数据"
        action={
          <ActionButton icon={<ArrowClockwise20Regular />} onClick={onRetry}>
            重新获取
          </ActionButton>
        }
      />
    );
  }

  const pollutants = Object.entries(air.pollutants || {}).filter(([, item]) => item && item.value != null);

  return (
    <div className={styles.stack}>
      <div className={styles.airTop}>
        <AirRing air={air} size={88} />
        <div className={styles.airMeta}>
          <Text size={200} className={styles.muted}>
            首要污染物 {air.primary || '—'}
          </Text>
          <Text size={200} className={styles.muted}>
            {air.aqiStandard === 'cn-mee' ? '中国 AQI 标准' : 'AQI'}
          </Text>
        </div>
      </div>

      <div className={styles.list}>
        {pollutants.map(([code, item]) => (
          <div className={styles.airMetric} data-air-row key={code}>
            <Text size={300}>{item.name || code}</Text>
            <Text size={400} weight="semibold" className={styles.airValue}>
              {Math.round(Number(item.value) * 10) / 10}
            </Text>
            <Text size={200} className={styles.airUnit}>
              {item.unit || 'μg/m³'}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IndicesPanel({ data, state, onRetry }) {
  const styles = useStyles();
  const indices = data.indices;

  if (!indices && state?.loading) return <SectionLoading label="正在获取生活指数…" />;
  if (!indices && state?.error) return <SectionError message={state.error} onRetry={onRetry} />;
  if (!indices || indices.length === 0) {
    return (
      <EmptyState
        icon={<WeatherSunny24Regular />}
        title="暂无生活指数"
        action={
          <ActionButton icon={<ArrowClockwise20Regular />} onClick={onRetry}>
            重新获取
          </ActionButton>
        }
      />
    );
  }

  return (
    <div className={styles.list}>
      {indices.map((item) => (
        <div className={styles.indexRow} data-index-row key={`${item.type}-${item.date}`}>
          <div className={styles.indexHead}>
            <Text size={300} weight="semibold">
              {item.name}
            </Text>
            <Text size={300} className={styles.muted}>
              {item.category}
            </Text>
          </div>
          <Text size={300} className={styles.indexAdvice}>
            {item.text}
          </Text>
        </div>
      ))}
    </div>
  );
}

function formatWarningRange(item) {
  const format = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('zh-CN', { hour12: false });
  };
  const start = format(item.startTime);
  const end = format(item.endTime);
  if (start && end) return `生效 ${start} → ${end}`;
  return start || end || '';
}

export function WarningPanel({ data, state, onRetry }) {
  const styles = useStyles();
  const warnings = data.warnings;

  if (!warnings && state?.loading) return <SectionLoading label="正在获取天气预警…" />;
  if (!warnings && state?.error) return <SectionError message={state.error} onRetry={onRetry} />;
  if (!warnings || warnings.length === 0) {
    return (
      <EmptyState
        icon={<WeatherSunny24Regular />}
        title="暂无天气预警"
        action={
          <ActionButton icon={<ArrowClockwise20Regular />} onClick={onRetry}>
            重新获取
          </ActionButton>
        }
      />
    );
  }

  return (
    <Accordion multiple collapsible>
      {warnings.map((item) => (
        <AccordionItem value={item.id} key={item.id}>
          <AccordionHeader expandIconPosition="end">
            <span className={styles.warningHeader} data-warning-head>
              <span className={styles.warningDot} style={{ backgroundColor: statusToneColor(item.tone) }} />
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
              <Text size={200} className={styles.warningTime}>
                {formatWarningRange(item)}
              </Text>
              <Text size={300} className={styles.warningText}>
                {item.text}
              </Text>
              {item.guide ? (
                <Text size={300} className={styles.warningText}>
                  {item.guide}
                </Text>
              ) : null}
            </div>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
