/** 卡片与详情共用的小展示件。 */

import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { Warning16Filled } from '@fluentui/react-icons';
import { conditionText, weatherIconUrl } from '../data/icons.js';
import { fetchedMinutesAgo, fmtTemp, isNightTime } from '../data/format.js';
import { contrastTextColor, isStaleCache } from '../utils.js';

const useStyles = makeStyles({
  icon: {
    display: 'block',
    objectFit: 'contain',
    flexShrink: 0,
    userSelect: 'none',
    pointerEvents: 'none',
  },
  temp: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  condition: {
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  hilo: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  status: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  offline: {
    color: tokens.colorStatusWarningForeground1,
  },
  demoBadge: {
    color: tokens.colorNeutralForeground3,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusCircular,
    padding: '0 6px',
    lineHeight: '16px',
    fontSize: '10px',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  warningStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusMedium,
    padding: 'clamp(3px, 1.2vh, 6px) clamp(6px, 2vw, 10px)',
    fontSize: 'clamp(10px, 2.2vh, 13px)',
    lineHeight: 1.2,
    flexShrink: 0,
  },
  warningText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  warningCount: {
    flexShrink: 0,
    opacity: 0.85,
    whiteSpace: 'nowrap',
  },
  warningIcon: {
    flexShrink: 0,
  },
  warningDot: {
    position: 'absolute',
    top: '8%',
    right: '8%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    minWidth: '18px',
    height: '18px',
    padding: '0 4px',
    borderRadius: tokens.borderRadiusCircular,
    fontSize: '11px',
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: '18px',
  },
});

export function WeatherIcon({ code, night = false, scheme = 'dark', size = '100%', title }) {
  const styles = useStyles();
  return (
    <img
      className={styles.icon}
      style={{ width: size, height: size }}
      src={weatherIconUrl(code, { night, scheme })}
      alt={title || conditionText(code)}
      draggable={false}
    />
  );
}

export function Temp({ value, unit, className, size }) {
  const styles = useStyles();
  return (
    <span className={mergeClasses(styles.temp, className)} style={size ? { fontSize: size } : undefined}>
      {fmtTemp(value, unit)}
    </span>
  );
}

export function Condition({ code, text, className }) {
  const styles = useStyles();
  return <span className={mergeClasses(styles.condition, className)}>{conditionText(code, text)}</span>;
}

export function HiLo({ max, min, unit, className }) {
  const styles = useStyles();
  return (
    <span className={mergeClasses(styles.hilo, className)}>
      {fmtTemp(max, unit)} / {fmtTemp(min, unit)}
    </span>
  );
}

/** 离线 · N 分钟前更新 [· 数据可能过期] */
export function StatusLine({ offline, fetchedAt, refreshMin, className, now = Date.now() }) {
  const styles = useStyles();
  if (!fetchedAt) return null;
  const minutes = fetchedMinutesAgo(fetchedAt, now);
  const stale = isStaleCache(fetchedAt, refreshMin, now);
  const text = `${offline ? '离线 · ' : ''}${minutes <= 0 ? '刚刚更新' : `${minutes} 分钟前更新`}${stale ? ' · 数据可能过期' : ''}`;
  return <span className={mergeClasses(styles.status, offline && styles.offline, className)}>{text}</span>;
}

export function DemoBadge({ className }) {
  const styles = useStyles();
  return <span className={mergeClasses(styles.demoBadge, className)}>演示</span>;
}

/** 预警条：卡片顶部；只有一条核心信息（标题），多条时在详情里展开 */
export function WarningStrip({ warnings }) {
  const styles = useStyles();
  if (!warnings || warnings.length === 0) return null;
  const primary = warnings[0];
  return (
    <div className={styles.warningStrip} style={{ backgroundColor: primary.color, color: contrastTextColor(primary.color) }}>
      <Warning16Filled className={styles.warningIcon} />
      <span className={styles.warningText}>{primary.title}</span>
    </div>
  );
}

/** 1×1 尺寸下的预警小角标（有预警才出现） */
export function WarningBadge({ warnings }) {
  const styles = useStyles();
  if (!warnings || warnings.length === 0) return null;
  return (
    <span className={styles.warningDot} style={{ backgroundColor: warnings[0].color, color: contrastTextColor(warnings[0].color) }}>
      <Warning16Filled />
    </span>
  );
}

export function todayNight(current, today) {
  return isNightTime(current?.obsTime || undefined, today?.sunrise, today?.sunset);
}
