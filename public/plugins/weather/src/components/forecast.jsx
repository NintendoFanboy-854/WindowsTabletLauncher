/**
 * 卡片内的逐时 / 未来 7 天可视件。
 *
 * 逐档字段集合（`wtsl-density-clock-weather.md` §3.6）——**换尺寸换字段/列数，不换字号**：
 * - 1×2  `HourlyRows`：竖排 4 行，时间 12 / 图标 20 / 温度 14，行高 32（非交互数据行，
 *   不套 LIST_ROW_HEIGHT=44 的触控下限）；
 * - 2×2  `HourlyStrip`：4 列，时间 12 / 图标 20 / 温度 14（296 宽放不下 6 列）；
 * - 3×2  `HourlyBand`：6 列，时间 12 / 图标 24 / 温度 16 / 降水概率 12（列宽 72 才装得下「降水 30%」）；
 * - 3×3  沿用 6 列（同一字段集的列宽必须与 3×2 一致：8 列会把列宽压到 52，
 *   「降水 30%」约 52–60 宽，会触发裁切）+ `DailyColumns` 未来 7 天 7 列。
 *
 * 列间距只有一套：`spacingHorizontalS`(8)。旧实现里 2×2 用 4、3×2 用 8（§3.9 W-8），已统一。
 * 列内水平居中（layout.md:57「列表左对齐文字、居中图标」的反向场景：并列比较对象居中）。
 *
 * ## 内部列网格（本文件是横向列条的定义点）
 *
 * 每条横向列条是**显式等分网格**：`grid-template-columns: repeat(N, minmax(0, 1fr))`，
 * N = 该档声明的列数（1×2 = 1 列 × 4 行；2×2 = 4；3×2 / 3×3 = 6；3×3 7 天 = 7）。
 * 网格盒 `width: 100%` 铺满卡片内容轴，因此：
 * - 第一列左缘 = 内容轴左缘，最后一列右缘 = 内容轴右缘（两端严格贴轴，W3）；
 * - 列宽 =（内容宽 − (N−1)×8）/ N，由容器宽度派生，不写死像素；
 * - 列数由 `count` 决定而不是由数据条数决定：数据不足时网格仍是 N 等分列，
 *   只在多出的轨道上留空——列线不随数据条数漂移（旧实现用
 *   `gridAutoColumns: minmax(0, 1fr)` + 隐式列，列宽会跟着条数变，6 条与 3 条是两套列线）。
 */

import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { WeatherIcon, statusToneColor } from './atoms.jsx';
import { fmtPop, fmtTemp, hourLabel, weekdayLabel } from '../data/format.js';

/**
 * 横向列条的列模板：`repeat(N, minmax(0, 1fr))`。
 *
 * 只产出「列数 + 等分」这一个事实，任何像素都不出现在这里；实际列宽由网格盒宽度
 * （= 卡片内容轴宽度）派生。
 */
const equalColumns = (count) => `repeat(${count}, minmax(0, 1fr))`;

const useStyles = makeStyles({
  /** 所有横向列条共用一套列间距与居中规则（Equal Except Hue：同一可视件只允许一套间距）。 */
  columns: {
    display: 'grid',
    // 显式列模板由 `equalColumns(count)` 以内联样式给出；显式列存在时必须用 row 流向，
    // 否则 column 流向会把 N 个项排成 N 行隐式轨道。
    gridAutoFlow: 'row',
    columnGap: tokens.spacingHorizontalS,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    minWidth: 0,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // 列内四段之间 8（spec §3.6 的 3×2 下带 102 高 = 16+24+22+16 + 3×8）
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  /** 1×2 竖排行：三段基线对齐、左起。 */
  rows: {
    display: 'grid',
    gridAutoFlow: 'row',
    rowGap: tokens.spacingVerticalXS,
    width: '100%',
    minWidth: 0,
  },
  hourRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    columnGap: tokens.spacingHorizontalS,
    // 32 = spacingVerticalXXXL：1×2 竖排行高（规格 §3.6）
    minHeight: tokens.spacingVerticalXXXL,
    minWidth: 0,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  temp: {
    color: tokens.colorNeutralForeground1,
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
  aqiCategory: {
    whiteSpace: 'nowrap',
    // 类别文字走中性层级；AQI 的数据色只用于圆环/圆点。
    color: tokens.colorNeutralForeground2,
  },
});

/** 1×2：竖排 4 行（时间 / 图标 / 温度），三段基线对齐。 */
export function HourlyRows({ items, unit, scheme, sunrise, sunset, count = 4 }) {
  const styles = useStyles();
  const list = (items || []).slice(0, count);
  return (
    <div
      className={styles.rows}
      data-hourly-strip="true"
      data-hourly-layout="rows"
      data-hourly-columns={list.length}
      data-hourly-fields="3"
    >
      {list.map((item, index) => (
        <div key={item.fxTime || index} className={styles.hourRow}>
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

/** 2×2：4 列（时间 12 / 图标 20 / 温度 14），296 宽放不下 6 列。 */
export function HourlyStrip({ items, unit, scheme, sunrise, sunset, count = 4 }) {
  const styles = useStyles();
  const list = (items || []).slice(0, count);
  return (
    <div
      className={styles.columns}
      style={{ gridTemplateColumns: equalColumns(count) }}
      data-hourly-strip="true"
      data-hourly-layout="columns"
      data-hourly-columns={list.length}
      data-hourly-grid-columns={count}
      data-hourly-fields="3"
    >
      {list.map((item, index) => (
        <div key={item.fxTime || index} className={styles.column}>
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

/**
 * 3×2 / 3×3：6 列（时间 12 / 图标 24 / 温度 16 / 降水概率 12）。
 * 每列竖排、列内居中，等宽（`minmax(0, 1fr)`）；降水缺数据时留空行占位，保证 6 列基线一致。
 */
export function HourlyBand({ items, unit, scheme, sunrise, sunset, count = 6 }) {
  const styles = useStyles();
  const list = (items || []).slice(0, count);
  return (
    <div
      className={styles.columns}
      style={{ gridTemplateColumns: equalColumns(count) }}
      data-hourly-strip="true"
      data-hourly-layout="columns"
      data-hourly-columns={list.length}
      data-hourly-grid-columns={count}
      data-hourly-fields="4"
    >
      {list.map((item, index) => (
        <div key={item.fxTime || index} className={styles.column}>
          <Text size={200} className={styles.muted}>
            {index === 0 ? '现在' : hourLabel(item.fxTime)}
          </Text>
          <WeatherIcon
            code={item.icon}
            night={isNight(item.fxTime, sunrise, sunset)}
            scheme={scheme}
            size={24}
            title={item.text}
          />
          <Text size={400} weight="semibold" className={styles.temp}>
            {fmtTemp(item.temp, unit)}
          </Text>
          <Text size={200} className={styles.muted}>
            {fmtPop(item.pop)}
          </Text>
        </div>
      ))}
    </div>
  );
}

/** 3×3：未来 7 天 7 列（星期 12 / 图标 20 / 高温 16 semibold / 低温 12），列内居中。 */
export function DailyColumns({ items, unit, scheme, count = 7 }) {
  const styles = useStyles();
  const list = (items || []).slice(0, count);
  return (
    <div
      className={styles.columns}
      style={{ gridTemplateColumns: equalColumns(count) }}
      data-daily-columns="true"
      data-daily-columns-count={list.length}
      data-daily-grid-columns={count}
    >
      {list.map((item, index) => (
        <div key={item.fxDate || index} className={styles.column}>
          <Text size={200} className={styles.muted}>
            {weekdayLabel(item.fxDate, index)}
          </Text>
          <WeatherIcon code={item.icon} scheme={scheme} size={20} title={item.text} />
          <Text size={400} weight="semibold" className={styles.temp}>
            {fmtTemp(item.tempMax, unit)}
          </Text>
          <Text size={200} className={styles.muted}>
            {fmtTemp(item.tempMin, unit)}
          </Text>
        </div>
      ))}
    </div>
  );
}

/** 详情（空气 Tab）的 AQI 环：值 24 / AQI 12 / 类别 14。卡片上不再出现该环。 */
export function AirRing({ air, size = 88, className }) {
  const styles = useStyles();
  if (!air || air.aqi == null) return null;
  const aqi = Number(air.aqi);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0.02, Math.min(1, aqi / 300));
  const dash = circumference * ratio;
  const color = statusToneColor(air.tone);
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
      <Text size={300} weight="semibold" className={styles.aqiCategory}>
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
