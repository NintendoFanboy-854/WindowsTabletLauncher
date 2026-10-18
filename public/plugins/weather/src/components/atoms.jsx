/** 卡片与详情共用的小展示件。 */

import { MessageBar, MessageBarBody, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { conditionText, weatherIconUrl } from '../data/icons.js';
import { fetchedMinutesAgo, fmtTemp, isNightTime } from '../data/format.js';
import { isStaleCache } from '../utils.js';

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
    padding: `0 ${tokens.spacingHorizontalS}`,
    lineHeight: tokens.lineHeightBase100,
    fontSize: tokens.fontSizeBase100,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  warningBar: {
    flexShrink: 0,
    minWidth: 0,
  },
  warningBarText: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
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

/** 预警条：Fluent MessageBar（intent warning），只有一条核心信息（标题）；多条在详情里展开 */
export function WarningStrip({ warnings }) {
  const styles = useStyles();
  if (!warnings || warnings.length === 0) return null;
  const primary = warnings[0];
  return (
    <MessageBar
      intent="warning"
      className={styles.warningBar}
      style={{ paddingTop: tokens.spacingVerticalXXS, paddingBottom: tokens.spacingVerticalXXS }}
    >
      <MessageBarBody className={styles.warningBarText}>{primary.title}</MessageBarBody>
    </MessageBar>
  );
}

export function todayNight(current, today) {
  return isNightTime(current?.obsTime || undefined, today?.sunrise, today?.sunset);
}
