/**
 * 工作量热力图（B3）。
 *
 * Fluent 没有热力图组件，这属于数据可视化内容：格子颜色只用 Fluent 状态色 token，
 * 尺寸/间距/圆角用 token，不在图上写死颜色。悬停用 Fluent Tooltip。
 */

import { Text, Tooltip, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';

import { HEATMAP_WEEKS, type HeatmapDay } from './stats';

export interface HeatmapProps {
  days: HeatmapDay[];
  max: number;
  total: number;
}

const DAYS_PER_WEEK = 7;
/** 格子边长：用 Fluent 的间距 token 当尺寸，避免手写像素 */
const CELL_SIZE = tokens.spacingHorizontalXXL;
const CELL_GAP = tokens.spacingHorizontalXS;

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
  },
  grid: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateRows: `repeat(${DAYS_PER_WEEK}, ${CELL_SIZE})`,
    gridAutoColumns: CELL_SIZE,
    gap: CELL_GAP,
    overflowX: 'auto',
    paddingBottom: tokens.spacingVerticalXS,
    justifySelf: 'start',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground4,
  },
  level1: { backgroundColor: tokens.colorStatusSuccessBackground1 },
  level2: { backgroundColor: tokens.colorStatusSuccessBackground2 },
  level3: { backgroundColor: tokens.colorStatusSuccessBackground3 },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
  },
});

function levelFor(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio <= 1 / 3) return 1;
  if (ratio <= 2 / 3) return 2;
  return 3;
}

export function Heatmap({ days, max, total }: HeatmapProps) {
  const styles = useStyles();
  const levelClasses = [styles.cell, styles.level1, styles.level2, styles.level3];

  return (
    <div className={styles.root}>
      <div
        className={styles.grid}
        role="img"
        aria-label={`近 ${HEATMAP_WEEKS} 周工作量热力图，共 ${total} 条完成记录`}
      >
        {days.map((day) => {
          const level = levelFor(day.count, max);
          return (
            <Tooltip
              key={day.date}
              content={`${day.date} · ${day.count} 条`}
              relationship="description"
              withArrow
            >
              <div className={mergeClasses(styles.cell, level > 0 ? levelClasses[level] : undefined)} />
            </Tooltip>
          );
        })}
      </div>
      <div className={styles.legend}>
        <Text size={200}>少</Text>
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            className={mergeClasses(styles.cell, level > 0 ? levelClasses[level] : undefined)}
          />
        ))}
        <Text size={200}>多</Text>
        <Text size={200}>· 近 {HEATMAP_WEEKS} 周</Text>
      </div>
    </div>
  );
}
