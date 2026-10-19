/**
 * 卡片与详情共用的小展示件。
 *
 * 字号/行高只走 Fluent 字阶：文本用 `<Text size weight>`，温度主值由调用方用
 * 共享 `Metric`（Display XL / Fluent Display）渲染；这里不写任何字号。
 */

import { Badge, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
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
  condition: {
    color: tokens.colorNeutralForeground1,
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
  warningBadge: {
    flexShrink: 0,
  },
});

/**
 * 和风天气图标（内容图形，尺寸由调用方按档位给固定 px）。
 * `scheme` 决定用 icons/dark 还是 icons/light；night 只对晴/多云做夜间映射。
 */
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

/** 天气现象文字；size 默认 16（400），卡片 3×2/4×2 用 14（300） */
export function Condition({ code, text, size = 400, className }) {
  const styles = useStyles();
  return (
    <Text size={size} className={mergeClasses(styles.condition, className)}>
      {conditionText(code, text)}
    </Text>
  );
}

/** 今日高低温：`26° / 18°`（14 或 16） */
export function HiLo({ max, min, unit, className, size = 300 }) {
  const styles = useStyles();
  return (
    <Text size={size} className={mergeClasses(styles.hilo, className)}>
      {fmtTemp(max, unit)} / {fmtTemp(min, unit)}
    </Text>
  );
}

/** 更新状态：`N 分钟前更新` / `离线 · N 分钟前更新 · 数据可能过期`（12 fg3） */
export function StatusLine({ offline, fetchedAt, refreshMin, className, now = Date.now() }) {
  const styles = useStyles();
  if (!fetchedAt) return null;
  const minutes = fetchedMinutesAgo(fetchedAt, now);
  const stale = isStaleCache(fetchedAt, refreshMin, now);
  const text = `${offline ? '离线 · ' : ''}${
    minutes <= 0 ? '刚刚更新' : `${minutes} 分钟前更新`
  }${stale ? ' · 数据可能过期' : ''}`;
  return (
    <Text size={200} className={mergeClasses(styles.status, offline && styles.offline, className)}>
      {text}
    </Text>
  );
}

/** 卡片 3×2 / 4×2 城市行的紧凑预警徽标（12 号字，完整内容在详情预警 Tab） */
export function WarningBadge({ count, className }) {
  const styles = useStyles();
  if (!count) return null;
  return (
    <Badge
      appearance="tint"
      color="danger"
      size="medium"
      className={mergeClasses(styles.warningBadge, className)}
      aria-label={`${count} 条天气预警`}
      title={`${count} 条天气预警`}
    >
      {count}
    </Badge>
  );
}
