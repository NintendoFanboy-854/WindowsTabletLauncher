/**
 * 天气 3×2 上带右端的「今日指标」（v0.3.0 三带式）。
 *
 * 结构：3 行「label 左 / value 右对齐」的定义列表，整块占满 top32 第二列的剩余宽度
 * （`grid-template-columns: max-content minmax(0, 1fr)`），不做成贴在右端的小岛。
 *
 * - 行：体感 / 降水概率 / 风；label 12/16 fg3 左对齐，value 14/20 semibold fg1 右对齐；
 *   行高 36（DENSITY 要求 32–36），行间 4。
 * - 无数据整组隐藏；单项缺数据只隐藏该项。
 * - 1024 断点（卡片 iframe 宽度 <480px）：降为 2 项（体感 / 风，降水概率收进详情），
 *   仍占满剩余宽度、不裁切（docs/components/weather.md「3×2 三带式规格」）。
 * - 整组按 1 个 Secondary 区块计（docs/DENSITY.md §2.1），
 *   `data-secondary-block` 供 `scripts/verify-widgets.mjs` 做 3×2 相对 2×2 的 +1 结构断言。
 */

import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { fmtPopPercent, fmtTemp, fmtWind } from '../data/format.js';

const useStyles = makeStyles({
  list: {
    display: 'grid',
    gridAutoFlow: 'row',
    rowGap: tokens.spacingVerticalXS,
    width: '100%',
    minWidth: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: tokens.spacingHorizontalM,
    minHeight: '36px',
    minWidth: 0,
  },
  label: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  value: {
    color: tokens.colorNeutralForeground1,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // 窄卡只保留体感 / 风两项（任务定稿：1024 降级为 2 项），整块仍占满剩余宽度。
  // visibility 同时兜底：无论 display:none 的媒体规则与基础 display:flex 的层叠顺序如何，
  // 该项都不会被渲染/测量到。
  popRow: {
    '@media (max-width: 480px)': {
      display: 'none',
      visibility: 'hidden',
    },
  },
});

/**
 * 今日指标的数据取值（纯函数）：体感 / 下一小时降水概率 / 风。
 * 缺数据返回空串，调用方据此隐藏单项或整组。
 */
export function todayMetricValues(current, hourly, unit) {
  const feelsLike = current?.feelsLike != null ? fmtTemp(current.feelsLike, unit) : '';
  const pop = fmtPopPercent(hourly?.[0]?.pop);
  const wind = current ? fmtWind(current.windDir, current.windScale) : '';
  return { feelsLike, pop, wind: wind === '—' ? '' : wind };
}

/**
 * 3×2 上带右端今日指标。无任何可用数据时返回 null（整组隐藏）。
 *
 * @param {object} props
 * @param {object|null} props.current useWeather 归一化实时天气
 * @param {object[]} [props.hourly] 逐时数组（取第 1 小时 pop）
 * @param {'c'|'f'} props.unit 温度单位
 * @param {string} [props.className]
 */
export function TodayMetrics({ current, hourly, unit, className }) {
  const styles = useStyles();
  const values = todayMetricValues(current, hourly, unit);
  const items = [];
  if (values.feelsLike) items.push({ key: 'feelsLike', label: '体感', value: values.feelsLike });
  if (values.pop) items.push({ key: 'pop', label: '降水概率', value: values.pop });
  if (values.wind) items.push({ key: 'wind', label: '风', value: values.wind });
  if (items.length === 0) return null;

  return (
    <div
      className={mergeClasses(styles.list, className)}
      data-content-block="metrics"
      data-secondary-block="metrics"
    >
      {items.map((item) => (
        <div key={item.key} className={mergeClasses(styles.row, item.key === 'pop' && styles.popRow)}>
          <Text size={200} className={styles.label}>
            {item.label}
          </Text>
          <Text size={300} weight="semibold" className={styles.value}>
            {item.value}
          </Text>
        </div>
      ))}
    </div>
  );
}
