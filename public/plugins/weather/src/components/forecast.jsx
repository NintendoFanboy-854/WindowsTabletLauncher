/**
 * 卡片内的逐时 / 7 天 / AQI 可视件。
 *
 * 尺寸与字号按 docs/components/weather.md：
 * - 2×2 逐时 6 列：时间 12 / 图标 20 / 温度 14；
 * - 3×2 逐时 6 行：行高 40 / 时间 12 / 图标 20 / 温度 16 右对齐；
 * - 4×2 未来 7 天等宽 7 列：星期 12 / 图标 20 / 高温 16 semibold / 低温 12；
 * - AQI 环：4×2 72、详情 88；值 24 / AQI 标签 12 / 类别 14。
 */

import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { WeatherIcon } from './atoms.jsx';
import { fmtTemp, hourLabel, weekdayLabel } from '../data/format.js';

const useStyles = makeStyles({
  hourlyStrip: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(0, 1fr)',
    height: '100%',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  hourColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },

  hourlyRows: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    height: '100%',
    minWidth: 0,
  },
  hourRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '40px',
    minWidth: 0,
  },
  hourSpacer: { flex: 1, minWidth: 0 },
  hourRowTime: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },

  dailyColumns: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(0, 1fr)',
    gap: tokens.spacingHorizontalS,
    height: '100%',
    alignItems: 'center',
    minWidth: 0,
  },
  dayColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  muted: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  temp: {
    color: tokens.colorNeutralForeground1,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  high: {
    color: tokens.colorNeutralForeground1,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  low: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },

  ring: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  ringGraphic: {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  ringSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  ringCenter: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aqiValue: { color: tokens.colorNeutralForeground1, fontVariantNumeric: 'tabular-nums' },
  aqiLabel: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  aqiCategory: { whiteSpace: 'nowrap' },
});

/** 2×2 底部的逐时 6 列：现在 + 随后 5 小时 */
export function HourlyStrip({ items, unit, scheme, sunrise, sunset, count = 6 }) {
  const styles = useStyles();
  const list = (items || []).slice(0, count);
  return (
    <div className={styles.hourlyStrip}>
      {list.map((item, index) => (
        <div key={item.fxTime || index} className={styles.hourColumn}>
          <Text size={200} className={styles.muted}>
            {index === 0 ? '现在' : hourLabel(item.fxTime)}
          </Text>
          <WeatherIcon
            code={item.icon}
            night={isNight(item.fxTime, sunrise, sunset)}
            scheme={scheme}
            size={20}
            title={item.text}
          />
          <Text size={300} weight="semibold" className={styles.temp}>
            {fmtTemp(item.temp, unit)}
          </Text>
        </div>
      ))}
    </div>
  );
}

/** 3×2 右侧的逐时 6 行（行高 40） */
export function HourlyRows({ items, unit, scheme, sunrise, sunset, count = 6 }) {
  const styles = useStyles();
  const list = (items || []).slice(0, count);
  return (
    <div className={styles.hourlyRows}>
      {list.map((item, index) => (
        <div key={item.fxTime || index} className={styles.hourRow}>
          <Text size={200} className={styles.hourRowTime}>
            {index === 0 ? '现在' : hourLabel(item.fxTime)}
          </Text>
          <WeatherIcon
            code={item.icon}
            night={isNight(item.fxTime, sunrise, sunset)}
            scheme={scheme}
            size={20}
            title={item.text}
          />
          <span className={styles.hourSpacer} />
          <Text size={400} weight="semibold" className={styles.temp}>
            {fmtTemp(item.temp, unit)}
          </Text>
        </div>
      ))}
    </div>
  );
}

/** 4×2 底部的未来 7 天等宽 7 列（列 gap 8、内容居中） */
export function DailyColumns({ items, unit, scheme }) {
  const styles = useStyles();
  const list = (items || []).slice(0, 7);
  return (
    <div className={styles.dailyColumns}>
      {list.map((item, index) => (
        <div key={item.fxDate || index} className={styles.dayColumn}>
          <Text size={200} className={styles.muted}>
            {weekdayLabel(item.fxDate, index)}
          </Text>
          <WeatherIcon code={item.icon} scheme={scheme} size={20} title={item.text} />
          <Text size={400} weight="semibold" className={styles.high}>
            {fmtTemp(item.tempMax, unit)}
          </Text>
          <Text size={200} className={styles.low}>
            {fmtTemp(item.tempMin, unit)}
          </Text>
        </div>
      ))}
    </div>
  );
}

/** 4×2 / 详情空气 Tab 的 AQI 环：值 24 / AQI 12 / 类别 14 */
export function AirRing({ air, size = 88, className }) {
  const styles = useStyles();
  if (!air || air.aqi == null) return null;
  const aqi = Number(air.aqi);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0.02, Math.min(1, aqi / 300));
  const dash = circumference * ratio;
  const color = air.color || tokens.colorBrandForeground1;
  return (
    <div className={mergeClasses(styles.ring, className)}>
      <div className={styles.ringGraphic} style={{ width: `${size}px`, height: `${size}px` }}>
        <svg className={styles.ringSvg} viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} fill="none" stroke={tokens.colorNeutralStroke2} strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <div className={styles.ringCenter}>
          <Text size={600} weight="semibold" className={styles.aqiValue}>
            {air.aqiDisplay || aqi}
          </Text>
          <Text size={200} className={styles.aqiLabel}>
            AQI
          </Text>
        </div>
      </div>
      <Text size={300} weight="semibold" className={styles.aqiCategory} style={{ color }}>
        {air.category || '—'}
      </Text>
    </div>
  );
}

/** 逐时是否夜间：有日出日落用真实时间，否则 19:00–06:00 */
export function isNight(fxTime, sunrise, sunset) {
  if (!fxTime) return false;
  if (sunrise && sunset) {
    const time = new Date(fxTime).getTime();
    const rise = new Date(sunrise).getTime();
    const set = new Date(sunset).getTime();
    if (Number.isFinite(time) && Number.isFinite(rise) && Number.isFinite(set)) return time < rise || time >= set;
  }
  const date = new Date(fxTime);
  if (Number.isNaN(date.getTime())) return false;
  const hour = date.getHours();
  return hour < 6 || hour >= 19;
}
