/**
 * 卡片内的「今日指标」定义列表（体感 / 降水概率 / 风，3×3 追加空气质量）。
 *
 * ## 内部列网格（唯一一套，本文件是定义点）
 *
 * 指标块是**两条轨道的网格**，列宽由容器宽度派生（`minmax(0, 40%)` + `minmax(0, 1fr)`），
 * 不写任何字面量像素：
 *
 *   | 轨道 | 宽度（相对指标块宽度 M） | 对齐 | 落点 |
 *   |---|---|---|---|
 *   | 标签列 | 40% | 左对齐 | 三个标签左缘共用这一条列线 |
 *   | 列间距 | `spacingHorizontalS`(8) | — | 三行同一空隙，不再「风那行几乎顶到左边」 |
 *   | 数值列 | 剩余 1fr | 右对齐 | 三个数值右缘 = 指标块右缘 = 卡片内容轴右缘 |
 *
 * 三行共用**同一个** `grid-template-columns`（`METRIC_COLUMNS`），而不是旧实现的
 * `display:flex + justify-content:space-between`：flex 只有一条弹性空隙，
 * 空隙宽 = 行宽 − 标签宽 − 数值宽，于是每行一个值（「风」这行数值最长，空隙被压到最小，
 * 视觉上标签像顶到了左边，W2）；哪一行结构稍有不同，就会自成一套左右对齐（W1）。
 * 换成两条固定轨道后，标签左缘 / 数值右缘 / 列间距都由网格决定，与文本长短无关。
 *
 * 指标块本身从上带第二列开始（起点 = 内容轴的 5/12，见 `Card.jsx` 的 `topBand`），
 * 因此标签左缘落在**内部列线**而不是内容轴左缘；内容轴左缘由当前簇（图标 / 温度）独占，
 * 但右缘（数值列）与逐时/7 天列块两端都严格贴内容轴。
 *
 * 尺寸：label 12/16 fg3，value 14/20 semibold fg1；行高 36、行间 4 —— 36 由
 * `spacingVerticalXXXL(32) + spacingVerticalXS(4)` 推导，不写字面量像素。
 *
 * 字段集按档位固定，**不随窗口宽度变化**：旧实现的 `@media (max-width: 480px)`
 * 会在 1024 断点偷偷删掉「降水概率」这一行（密度规格 §3.9 W-4 / §5-2），已删除。
 * 整组按 1 个 Secondary 区块计（`data-secondary-block`）。
 */

import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { aqiCategoryZh, fmtPopPercent, fmtTemp, fmtWind } from '../data/format.js';

/**
 * 指标区唯一一套列定义：标签列 40% + 数值列 1fr（相对指标块宽度）。
 *
 * 只在这一处声明，`row` 用它；标签列宽随卡片宽度变化（百分比），永不写死像素。
 * 40% 的余量：窄档（2×2，指标块 168 宽）下标签列 67.2，最宽标签「降水概率」
 * 12px × 4 字 = 48 < 67.2，不会挤压。
 */
const METRIC_COLUMNS = 'minmax(0, 40%) minmax(0, 1fr)';

const useStyles = makeStyles({
  list: {
    display: 'grid',
    gridAutoFlow: 'row',
    rowGap: tokens.spacingVerticalXS,
    width: '100%',
    minWidth: 0,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: METRIC_COLUMNS,
    // 三行同一空隙；等于标签列 → 数值列的净距（token，不写字面量）
    columnGap: tokens.spacingHorizontalS,
    alignItems: 'center',
    // 36 = 32 + 4：DENSITY 要求 32–36，且两个值都在 spacing ramp 上
    minHeight: `calc(${tokens.spacingVerticalXXXL} + ${tokens.spacingVerticalXS})`,
    minWidth: 0,
  },
  label: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  value: {
    color: tokens.colorNeutralForeground1,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    justifySelf: 'stretch',
    minWidth: 0,
  },
});

/**
 * 今日指标的数据取值（纯函数）：体感 / 下一小时降水概率 / 风 / 空气质量。
 * 缺数据返回空串，调用方据此隐藏单项。
 */
export function todayMetricValues(current, hourly, unit, air = null) {
  const feelsLike = current?.feelsLike != null ? fmtTemp(current.feelsLike, unit) : '';
  const pop = fmtPopPercent(hourly?.[0]?.pop);
  const wind = current ? fmtWind(current.windDir, current.windScale) : '';
  const airValue =
    air && air.aqi != null
      ? `${aqiCategoryZh(air.category, air.level)} ${Math.round(Number(air.aqi))}`
      : '';
  return {
    feelsLike,
    pop,
    wind: wind === '—' ? '' : wind,
    air: airValue,
  };
}

/**
 * 今日指标块。无任何可用数据时返回 null（整组隐藏）。
 *
 * @param {object} props
 * @param {object|null} props.current useWeather 归一化实时天气
 * @param {object[]} [props.hourly] 逐时数组（取第 1 小时 pop）
 * @param {'c'|'f'} props.unit 温度单位
 * @param {object|null} [props.air] 空气质量（仅 3×3 传；AQI 是 P2，只在最大档出现）
 * @param {string} [props.className]
 */
export function TodayMetrics({ current, hourly, unit, air = null, className }) {
  const styles = useStyles();
  const values = todayMetricValues(current, hourly, unit, air);
  const items = [];
  if (values.feelsLike) items.push({ key: 'feelsLike', label: '体感', value: values.feelsLike });
  if (values.pop) items.push({ key: 'pop', label: '降水概率', value: values.pop });
  if (values.wind) items.push({ key: 'wind', label: '风', value: values.wind });
  if (values.air) items.push({ key: 'air', label: '空气质量', value: values.air });
  if (items.length === 0) return null;

  return (
    <div
      className={mergeClasses(styles.list, className)}
      data-content-block="metrics"
      data-secondary-block="metrics"
      data-metric-columns={METRIC_COLUMNS}
    >
      {items.map((item) => (
        <div key={item.key} className={styles.row} data-metric-item={item.key}>
          <Text size={200} className={styles.label} data-metric-label="true">
            {item.label}
          </Text>
          <Text
            size={300}
            weight="semibold"
            className={styles.value}
            data-metric-value="true"
          >
            {item.value}
          </Text>
        </div>
      ))}
    </div>
  );
}
