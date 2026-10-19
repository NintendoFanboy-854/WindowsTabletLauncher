/**
 * 番茄钟详情视图（宿主全窗口 Fluent Dialog，?view=detail 加载）。
 * 浮层重排 v1（docs/OVERLAY-REWRITE-SPEC.md §1/§3.2）：
 * - 头部：一句状态 16 semibold + 辅助说明 12 fg3
 * - 统计区：两列 statCard（值 24–32 / 标签 12），卡片高 ≥88、背景 colorNeutralBackground2、圆角 8
 * - 空态给一条说明 + 一个主操作；计时操作仍留在卡片（避免双 iframe 同时驱动状态机）
 */

import { useEffect, useState } from 'react';
import {
  Button,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Play20Filled } from '@fluentui/react-icons';
import { exitFocus } from '../../_shared/host.js';
import { getEngine } from './data/timer.js';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 24px 0',
    overflow: 'hidden',
    color: tokens.colorNeutralForeground1,
    '@media (max-width: 699px)': { padding: '16px 16px 0' },
  },
  scrollArea: {
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: tokens.spacingVerticalXXL,
  },
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 699px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  card: {
    minHeight: '88px',
    minWidth: '160px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusXLarge,
  },
  cardValue: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    fontVariantNumeric: 'tabular-nums',
  },
  cardNumber: {
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase600,
  },
  cardUnit: {
    color: tokens.colorNeutralForeground3,
  },
  cardLabel: {
    color: tokens.colorNeutralForeground3,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusXLarge,
  },
});

function StatCard({ label, number, unit }) {
  const styles = useStyles();
  return (
    <div className={styles.card}>
      <div className={styles.cardValue}>
        <Text size={600} className={styles.cardNumber}>
          {number}
        </Text>
        <Text size={300} className={styles.cardUnit}>
          {unit}
        </Text>
      </div>
      <Text size={200} className={styles.cardLabel}>
        {label}
      </Text>
    </div>
  );
}

export default function PomodoroDetail() {
  const styles = useStyles();
  const engine = getEngine();
  const [status, setStatus] = useState(() => engine.status());
  const [stats, setStats] = useState(() => engine.stats('today'));
  const [weekStats, setWeekStats] = useState(() => engine.stats('week'));

  useEffect(() => {
    const refresh = () => {
      setStatus(engine.status());
      setStats(engine.stats('today'));
      setWeekStats(engine.stats('week'));
    };
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, [engine]);

  const hasHistory =
    stats.completed > 0 || stats.focusMinutes > 0 || weekStats.completed > 0 || stats.streakDays > 0;

  const remainingText = `${Math.floor(status.remainingSec / 60)} 分 ${String(
    status.remainingSec % 60,
  ).padStart(2, '0')} 秒`;
  const stateText = status.running
    ? `${status.phaseLabel}进行中`
    : status.phase === 'focus' && status.remainingSec === status.totalSec
      ? '准备好开始专注'
      : `${status.phaseLabel} · 已暂停`;
  const subText = status.running
    ? `剩余 ${remainingText} · 第 ${Math.min(status.roundsBeforeLongBreak, status.roundsDone + 1)} / ${status.roundsBeforeLongBreak} 轮`
    : `下一阶段可用卡片上的按钮开始 · 本轮 ${status.roundsDone} / ${status.roundsBeforeLongBreak} 轮`;

  return (
    <div className={styles.root}>
      <div className={styles.scrollArea}>
        <div className={styles.content}>
          <section className={styles.section} aria-label="当前状态">
            <div className={styles.header}>
              <div className={styles.headerText}>
                <Text size={400} weight="semibold">
                  {stateText}
                </Text>
                <Text className={styles.hint} size={200}>
                  {subText}
                </Text>
              </div>
            </div>
          </section>

          {!hasHistory ? (
            <section className={styles.empty} aria-label="空态">
              <Text size={400} weight="semibold">
                今天还没有专注记录
              </Text>
              <Text className={styles.hint} size={300}>
                回到桌面卡片点一次「开始」，完成的第一轮会出现在这里；统计也会汇总到复盘页。
              </Text>
              <Button
                appearance="primary"
                size="large"
                icon={<Play20Filled />}
                onClick={() => exitFocus()}
              >
                回到卡片开始专注
              </Button>
            </section>
          ) : (
            <section className={styles.section} aria-label="统计">
              <Text size={500} weight="semibold">
                今日与趋势
              </Text>
              <div className={styles.grid}>
                <StatCard label="今日完成" number={stats.completed} unit="个" />
                <StatCard label="今日专注" number={stats.focusMinutes} unit="分钟" />
                <StatCard label="本周完成" number={weekStats.completed} unit="个" />
                <StatCard label="连续天数" number={stats.streakDays} unit="天" />
              </div>
              <Text className={styles.hint} size={300}>
                {status.taskTitle ? `当前任务：${status.taskTitle}` : '当前任务：未关联任务'}
                {status.whiteNoise !== 'none' ? ` · 白噪音：${status.whiteNoise}` : ' · 白噪音：关'}
              </Text>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
