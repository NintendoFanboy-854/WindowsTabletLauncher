/**
 * 卡片内的逐时 / 7 天 / AQI 可视件。
 *
 * 字号全部走 Fluent 字阶（Text size / token），不再手写 fontSize/clamp/lineHeight；
 * 尺寸/间距按 UI-REWRITE-SPEC §3.6：逐时 标签14/图标28/温度16；7 天 标签14/图标24/
 * 高温20/低温14；AQI 环 88、值24、标签12、类别14。
 */

import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { WeatherIcon } from './atoms.jsx';
import { dayLabel, fmtTemp, hourLabel } from '../data/format.js';

const useStyles = makeStyles({
  hourly: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(0, 1fr)',
    height: '100%',
    alignItems: 'stretch',
    gap: tokens.spacingHorizontalXS,
  },
  hourItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingVerticalXS,
    padding: `${tokens.spacingVerticalS} 0`,
    minWidth: 0,
  },
  hourLabel: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  hourTemp: { color: tokens.colorNeutralForeground1, whiteSpace: 'nowrap' },

  dailyColumns: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(0, 1fr)',
    height: '100%',
    minHeight: 0,
  },
  dayColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 0,
  },
  dayColumnPanel: {
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} 0`,
  },
  dayColumnRow: {
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
  },
  dayLabel: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  dayHigh: {
    color: tokens.colorNeutralForeground1,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  dayLow: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },

  ring: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    height: '100%',
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
  aqiValue: {
    color: tokens.colorNeutralForeground1,
    fontVariantNumeric: 'tabular-nums',
  },
  aqiLabel: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  aqiCategory: { fontWeight: tokens.fontWeightSemibold, whiteSpace: 'nowrap' },
});

/** 卡片用逐时条：现在 + 随后 N 小时 */
export function HourlyStrip({ items, unit, scheme, sunrise, sunset, count = 6 }) {
  const styles = useStyles();
  const list = (items || []).slice(0, count);
  return (
    <div className={styles.hourly}>
      {list.map((item, index) => (
        <div key={item.fxTime || index} className={styles.hourItem}>
          <Text size={300} className={styles.hourLabel}>
            {index === 0 ? '现在' : hourLabel(item.fxTime)}
          </Text>
          <WeatherIcon
            code={item.icon}
            night={isNight(item.fxTime, sunrise, sunset)}
            scheme={scheme}
            size={28}
            title={item.text}
          />
          <Text size={400} weight="semibold" className={styles.hourTemp}>
            {fmtTemp(item.temp, unit)}
          </Text>
        </div>
      ))}
    </div>
  );
}

/**
 * 卡片用 7 天列：星期、图标、高温（低温按需）。
 * variant="panel"（3×2 右栏）上下 space-between；variant="row"（4×2 底栏 96px）紧凑居中。
 */
export function DailyColumns({ items, unit, scheme, showLow = true, variant = 'panel' }) {
  const styles = useStyles();
  const list = (items || []).slice(0, 7);
  const isRow = variant === 'row';
  return (
    <div className={styles.dailyColumns}>
      {list.map((item, index) => (
        <div
          key={item.fxDate || index}
          className={mergeClasses(styles.dayColumn, isRow ? styles.dayColumnRow : styles.dayColumnPanel)}
        >
          <Text size={300} className={styles.dayLabel}>
            {dayLabel(item.fxDate, index)}
          </Text>
          <WeatherIcon code={item.icon} scheme={scheme} size={isRow ? 20 : 24} title={item.text} />
          <Text size={500} weight="semibold" className={styles.dayHigh}>
            {fmtTemp(item.tempMax, unit)}
          </Text>
          {showLow && (
            <Text size={300} className={styles.dayLow}>
              {fmtTemp(item.tempMin, unit)}
            </Text>
          )}
        </div>
      ))}
    </div>
  );
}

/** AQI 环：4×2 固定 88px；值 24 / 标签 12 / 类别 14（UI-REWRITE-SPEC §3.6） */
export function AirRing({ air, size = 88, className }) {
  const styles = useStyles();
  if (!air || air.aqi == null) return null;
  const aqi = Number(air.aqi);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0.02, Math.min(1, aqi / 300));
  const dash = circumference * ratio;
  const color = air.color || 'currentColor';
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
