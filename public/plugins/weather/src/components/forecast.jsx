/** 卡片内的逐时 / 7 天 / AQI 可视件。 */

import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { WeatherIcon, HiLo } from './atoms.jsx';
import { dayLabel, fmtTemp, hourLabel } from '../data/format.js';
import { aqiCategoryZh } from '../data/format.js';

const useStyles = makeStyles({
  hourly: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(0, 1fr)',
    gridAutoRows: '1fr',
    gap: 'clamp(2px, 1vw, 8px)',
    minHeight: 0,
    height: '100%',
    alignItems: 'stretch',
  },
  hourItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(1px, 0.8vh, 4px)',
    minWidth: 0,
    borderRadius: tokens.borderRadiusMedium,
    padding: 'clamp(2px, 1vh, 6px) 0',
  },
  hourLabel: {
    fontSize: 'clamp(9px, 1.9vh, 12px)',
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  hourTemp: {
    fontSize: 'clamp(11px, 2.4vh, 16px)',
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
  },
  hoursIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyColumns: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(0, 1fr)',
    gridAutoRows: '1fr',
    gap: 'clamp(2px, 0.8vw, 6px)',
    minHeight: 0,
    height: '100%',
  },
  dayColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(1px, 0.8vh, 6px)',
    minWidth: 0,
    padding: 'clamp(2px, 1vh, 8px) 0',
    borderRadius: tokens.borderRadiusMedium,
  },
  dayLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  dayHiLo: {
    fontSize: tokens.fontSizeBase300,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    lineHeight: 1.15,
    textAlign: 'center',
  },
  daySingleTemp: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
  hi: { color: tokens.colorNeutralForeground1 },
  lo: { color: tokens.colorNeutralForeground3 },
  ring: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(2px, 0.8vh, 6px)',
    minWidth: 0,
    height: '100%',
  },
  ringGraphic: {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    aspectRatio: '1 / 1',
    maxHeight: '100%',
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
    lineHeight: 1.05,
  },
  aqiValue: {
    fontSize: 'clamp(16px, 4.4vh, 32px)',
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
  },
  aqiLabel: {
    fontSize: 'clamp(9px, 1.8vh, 12px)',
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  aqiCategory: {
    fontSize: 'clamp(10px, 2vh, 13px)',
    whiteSpace: 'nowrap',
    fontWeight: tokens.fontWeightSemibold,
  },
});

/** 卡片用逐时条：现在 + 随后 N 小时 */
export function HourlyStrip({ items, nowIso, unit, scheme, sunrise, sunset, count = 6, className }) {
  const styles = useStyles();
  const list = (items || []).slice(0, count);
  return (
    <div className={mergeClasses(styles.hourly, className)}>
      {list.map((item, index) => {
        const night = isNight(item.fxTime, sunrise, sunset);
        return (
          <div key={item.fxTime || index} className={styles.hourItem}>
            <span className={styles.hourLabel}>{index === 0 ? '现在' : hourLabel(item.fxTime)}</span>
            <span className={styles.hoursIcon}>
              <WeatherIcon
                code={item.icon}
                night={night}
                scheme={scheme}
                size="clamp(20px, 5vh, 38px)"
                title={item.text}
              />
            </span>
            <span className={styles.hourTemp}>{fmtTemp(item.temp, unit)}</span>
          </div>
        );
      })}
    </div>
  );
}

/** 卡片用 7 天列：星期、图标、高温（低温按需弱化/省略） */
export function DailyColumns({ items, unit, scheme, className, showLow = true }) {
  const styles = useStyles();
  const list = (items || []).slice(0, 7);
  return (
    <div className={mergeClasses(styles.dailyColumns, className)}>
      {list.map((item, index) => (
        <div key={item.fxDate || index} className={styles.dayColumn}>
          <span className={styles.dayLabel}>{dayLabel(item.fxDate, index)}</span>
          <WeatherIcon code={item.icon} scheme={scheme} size="clamp(16px, 4vh, 32px)" title={item.text} />
          <span className={mergeClasses(styles.dayHiLo, styles.hi, !showLow && styles.daySingleTemp)}>
            {fmtTemp(item.tempMax, unit)}
          </span>
          {showLow && (
            <span className={mergeClasses(styles.dayHiLo, styles.lo)}>{fmtTemp(item.tempMin, unit)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** AQI 环。value 为 null 时不渲染。 */
export function AirRing({ air, size = 'clamp(64px, 22vh, 132px)', className }) {
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
      <div className={styles.ringGraphic} style={{ width: size, height: size }}>
        <svg className={styles.ringSvg} viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(128,128,128,0.25)" strokeWidth="8" />
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
          <span className={styles.aqiValue}>{air.aqiDisplay || aqi}</span>
          <span className={styles.aqiLabel}>AQI</span>
        </div>
      </div>
      <span className={styles.aqiCategory} style={{ color }}>
        {air.category || aqiCategoryZh(null, air.level)}
      </span>
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
