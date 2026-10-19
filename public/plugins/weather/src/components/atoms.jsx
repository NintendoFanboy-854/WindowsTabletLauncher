/**
 * 卡片与详情共用的小展示件。
 *
 * 字号/行高只走 Fluent 字阶：文本用 `<Text size weight>`，数字主值由调用方
 * 用 `Display XL`（D-07）或 `fontSizeHero1000` 提供；这里不写任何字号。
 */

import { MessageBar, MessageBarBody, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { conditionText, weatherIconUrl } from '../data/icons.js';
import { fetchedMinutesAgo, fmtTemp } from '../data/format.js';
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
  },
});

/** 和风天气图标（内容图形，尺寸由调用方按档位给固定 px） */
export function WeatherIcon({ code, night = false, scheme = 'dark', size = 48, title }) {
  const styles = useStyles();
  const px = typeof size === 'number' ? `${size}px` : size;
  return (
    <img
      className={styles.icon}
      style={{ width: px, height: px }}
      src={weatherIconUrl(code, { night, scheme })}
      alt={title || conditionText(code)}
      draggable={false}
    />
  );
}

/** 温度数字（字号由调用方 className 提供：XL-48 / Hero1000） */
export function Temp({ value, unit, className }) {
  const styles = useStyles();
  return <span className={mergeClasses(styles.temp, className)}>{fmtTemp(value, unit)}</span>;
}

export function Condition({ code, text, className }) {
  const styles = useStyles();
  return (
    <Text size={400} className={mergeClasses(styles.condition, className)}>
      {conditionText(code, text)}
    </Text>
  );
}

/** 今日高低温；3×2/4×2 用 size 400，2×1/2×2 用 300 */
export function HiLo({ max, min, unit, className, size = 300 }) {
  const styles = useStyles();
  return (
    <Text size={size} className={mergeClasses(styles.hilo, className)}>
      {fmtTemp(max, unit)} / {fmtTemp(min, unit)}
    </Text>
  );
}

/** 离线 · N 分钟前更新 [· 数据可能过期] */
export function StatusLine({ offline, fetchedAt, refreshMin, className, now = Date.now() }) {
  const styles = useStyles();
  if (!fetchedAt) return null;
  const minutes = fetchedMinutesAgo(fetchedAt, now);
  const stale = isStaleCache(fetchedAt, refreshMin, now);
  const text = `${offline ? '离线 · ' : ''}${minutes <= 0 ? '刚刚更新' : `${minutes} 分钟前更新`}${stale ? ' · 数据可能过期' : ''}`;
  return (
    <Text size={200} className={mergeClasses(styles.status, offline && styles.offline, className)}>
      {text}
    </Text>
  );
}

export function DemoBadge({ className }) {
  const styles = useStyles();
  return (
    <Text size={200} className={mergeClasses(styles.demoBadge, className)}>
      演示
    </Text>
  );
}

/** 预警条：Fluent MessageBar（intent warning），只显示第一条标题；多条在详情里展开 */
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
