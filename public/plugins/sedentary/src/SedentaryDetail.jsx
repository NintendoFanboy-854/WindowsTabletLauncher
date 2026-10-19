/**
 * 久坐详情视图（宿主全窗口 Fluent Dialog，?view=detail 加载）。
 * 浮层重排 v1（docs/OVERLAY-REWRITE-SPEC.md §1/§3.2）：
 * - 头部：状态一句 16 semibold + 辅助说明 12 fg3
 * - 统计区：两列 statCard（值 24–32 / 标签 12），卡片高 ≥88、背景 colorNeutralBackground2、圆角 8
 * - 操作「我起来了」固定在页脚（40px）；空态给说明 + 主操作
 */

import { useEffect, useState } from 'react';
import {
  Button,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Checkmark20Regular } from '@fluentui/react-icons';
import { useStoredConfig } from '../../_shared/host.js';
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
    gap: tokens.spacingVerticalXXS,
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
  footer: {
    flex: '0 0 auto',
    padding: '12px 0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },
  footerHint: {
    color: tokens.colorNeutralForeground3,
    minWidth: 0,
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
        {unit && (
          <Text size={300} className={styles.cardUnit}>
            {unit}
          </Text>
        )}
      </div>
      <Text size={200} className={styles.cardLabel}>
        {label}
      </Text>
    </div>
  );
}

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

  const hasData =
    snapshot.currentMin > 0 ||
    snapshot.today.sittingMinutes > 0 ||
    snapshot.today.breaks > 0 ||
    snapshot.lastBreakText !== '—';

  const breakNow = () => {
    if (!settings.enabled) return;
    sendBreakCommand();
  };

  const statusText = settings.enabled ? snapshot.statusLabel : '久坐提醒已关闭';

  return (
    <div className={styles.root}>
      <div className={styles.scrollArea}>
        <div className={styles.content}>
          <div className={styles.header}>
            <Text size={400} weight="semibold">
              {statusText}
            </Text>
            <Text className={styles.hint} size={200}>
              {settings.enabled ? snapshot.hint : '在设置里重新启用后，后台会继续计时与提醒'}
            </Text>
          </div>

          {!hasData ? (
            <section className={styles.empty} aria-label="空态">
              <Text size={400} weight="semibold">
                今天还没有久坐记录
              </Text>
              <Text className={styles.hint} size={300}>
                记录会在有输入后自动开始计时；现在可以手动记一次起身，或直接回到桌面查看卡片状态。
              </Text>
              <Button
                appearance="primary"
                size="large"
                icon={<Checkmark20Regular />}
                onClick={breakNow}
                disabled={!settings.enabled}
              >
                我起来了
              </Button>
            </section>
          ) : (
            <section className={styles.section} aria-label="统计">
              <Text size={500} weight="semibold">
                今日统计
              </Text>
              <div className={styles.grid}>
                <StatCard
                  label="今日累计久坐"
                  number={Math.round(snapshot.today.sittingMinutes)}
                  unit="分钟"
                />
                <StatCard label="起身次数" number={snapshot.today.breaks} unit="次" />
                <StatCard
                  label="最长连续"
                  number={Math.round(snapshot.today.longestStreakMin)}
                  unit="分钟"
                />
                <StatCard label="距上次起身" number={snapshot.lastBreakText} />
              </div>
              <Text className={styles.hint} size={300}>
                当前连续 {snapshot.currentMin} 分钟 · {snapshot.nextText}
              </Text>
            </section>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <Text className={styles.footerHint} size={200}>
          记录一次起身会结束当前连续久坐计时。
        </Text>
        <Button
          appearance="primary"
          size="large"
          icon={<Checkmark20Regular />}
          onClick={breakNow}
          disabled={!settings.enabled}
        >
          我起来了
        </Button>
      </div>
    </div>
  );
}
