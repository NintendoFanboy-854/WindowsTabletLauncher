/**
 * 久坐详情视图（宿主全窗口 Fluent Dialog，?view=detail 加载）。
 * 统计与阈值信息都放这里；卡片正常模式不再平铺。
 */

import { useEffect, useState } from 'react';
import {
  Button,
  Divider,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Checkmark20Regular } from '@fluentui/react-icons';
import {
  useStoredConfig,
} from '../../_shared/host.js';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  describeState,
  normalizeSettings,
  sendBreakCommand,
} from './data/engine.js';

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
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: 'auto',
  },
});

export default function SedentaryDetail() {
  const styles = useStyles();
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const [snapshot, setSnapshot] = useState(() => describeState(DEFAULT_SETTINGS));

  useEffect(() => {
    const refresh = () => setSnapshot(describeState(settings));
    refresh();
    const timer = window.setInterval(refresh, 1000);
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', onStorage);
    };
  }, [settings]);

  const breakNow = () => {
    if (!settings.enabled) return;
    sendBreakCommand();
  };

  const rows = [
    ['今日累计久坐', `${Math.round(snapshot.today.sittingMinutes)} 分钟`],
    ['最长连续', `${Math.round(snapshot.today.longestStreakMin)} 分钟`],
    ['起身次数', `${snapshot.today.breaks} 次`],
    ['当前连续', `${snapshot.currentMin} 分钟`],
    ['距离提醒', snapshot.nextText],
    ['最近起身', snapshot.lastBreakText],
  ];

  return (
    <div className={styles.root}>
      <div className={styles.heading}>
        <Text size={400} weight="semibold">
          久坐状态
        </Text>
        <Text className={styles.hint} size={200}>
          {snapshot.statusLabel}
        </Text>
      </div>
      <Text className={styles.hint} size={300}>
        {snapshot.hint}
      </Text>

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

      <div className={styles.actions}>
        <Button
          appearance="primary"
          size="large"
          icon={<Checkmark20Regular />}
          onClick={breakNow}
          disabled={!settings.enabled}
        >
          我起来了
        </Button>
        <Text className={styles.hint} size={200}>
          记录一次起身会结束当前连续久坐计时。
        </Text>
      </div>
    </div>
  );
}
