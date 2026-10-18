/**
 * 番茄钟详情视图（宿主全窗口 Fluent Dialog，?view=detail 加载）。
 * 只读展示统计；计时操作留在卡片（避免两个 iframe 同时驱动状态机）。
 */

import { useEffect, useState } from 'react';
import {
  Divider,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { getEngine } from './data/timer.js';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    overflowY: 'auto',
    color: tokens.colorNeutralForeground1,
  },
  heading: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  row: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    minHeight: '40px',
  },
  label: {
    color: tokens.colorNeutralForeground3,
  },
  value: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
});

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

  const rows = [
    ['阶段', status.phaseLabel],
    ['剩余', `${Math.floor(status.remainingSec / 60)} 分 ${String(status.remainingSec % 60).padStart(2, '0')} 秒`],
    ['本轮进度', `${status.roundsDone} / ${status.roundsBeforeLongBreak}`],
    ['当前任务', status.taskTitle ?? '未关联任务'],
    ['今日完成', `${stats.completed} 个`],
    ['今日专注', `${stats.focusMinutes} 分钟`],
    ['本周完成', `${weekStats.completed} 个 · ${weekStats.focusMinutes} 分钟`],
    ['连续天数', `${stats.streakDays} 天`],
    ['白噪音', status.whiteNoise === 'none' ? '关' : status.whiteNoise],
  ];

  return (
    <div className={styles.root}>
      <div className={styles.heading}>
        <Text size={400} weight="semibold">
          专注详情
        </Text>
        <Text className={styles.hint} size={200}>
          {status.running ? '进行中' : '已暂停 / 待开始'}
        </Text>
      </div>
      <div className={styles.grid}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.row}>
            <Text className={styles.label} size={300}>
              {label}
            </Text>
            <Text className={styles.value} size={300} weight="semibold">
              {value}
            </Text>
          </div>
        ))}
      </div>
      <Divider />
      <Text className={styles.hint} size={200}>
        计时、跳过、重置与沉浸模式都在卡片上的 ⋯ 菜单里；每次专注都会被记录，并汇总到复盘。
      </Text>
    </div>
  );
}
