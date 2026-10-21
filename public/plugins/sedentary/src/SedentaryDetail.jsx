/**
 * 久坐详情（L1，宿主 ?view=detail 浮层，docs/components/sedentary.md）。
 *
 * - 状态机：坐着 ↔ 站立，全部手动切换（D-27）；
 * - header：当前状态 + 辅助说明，右侧「设置…」；
 * - 操作：坐着时「我站起来了」primary / 站立时「我坐下了」primary；
 *   到阈值且未稍后时出现「稍后 5 分钟」（仅坐着）；
 * - 今日统计：今日久坐 / 今日站立 / 起身次数 / 最长连续坐；
 * - 最近 7 天：久坐分钟 + 站立分钟 + 起身次数；
 * - 空态：还没有今天的记录 + primary 状态按钮。
 *
 * 该插件没有 L2 子页：没有需要编辑的内容条目，设置统一在宿主设置页。
 */

import { useCallback } from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { ArrowDownRegular, ArrowUpRegular, Timer20Regular } from '@fluentui/react-icons';
import { requestHostSettings, useStoredConfig } from '../../_shared/host.js';
import { CrossFade } from '../../_shared/motion.js';
import {
  ActionButton,
  DetailHeader,
  DetailPage,
  DetailScroll,
  DetailToolbar,
  EmptyState,
  ListRow,
} from '../../_shared/ui.jsx';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  normalizeSettings,
  sendSitCommand,
  sendSnoozeCommand,
  sendStandCommand,
} from './data/engine.js';
import { useSedentaryState } from './useSedentaryState.js';

const useStyles = makeStyles({
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
    minWidth: 0,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalL,
    '@media (max-width: 699px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  statValue: {
    fontVariantNumeric: 'tabular-nums',
    color: tokens.colorNeutralForeground1,
  },
  days: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  dayLabel: {
    color: tokens.colorNeutralForeground2,
  },
  emptyWrap: {
    minWidth: 0,
  },
});

function Stat({ label, value, unit }) {
  const styles = useStyles();
  return (
    <div className={styles.stat}>
      <Text size={200} className={styles.muted}>
        {label}
      </Text>
      <div className={styles.statValueRow}>
        <Text size={600} weight="semibold" className={styles.statValue}>
          {value}
        </Text>
        {unit ? (
          <Text size={200} className={styles.muted}>
            {unit}
          </Text>
        ) : null}
      </div>
    </div>
  );
}

export default function SedentaryDetail() {
  const styles = useStyles();
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const snapshot = useSedentaryState(settings);

  const standing = snapshot.posture === 'standing';
  const sitting = snapshot.posture === 'sitting';

  const togglePosture = useCallback(
    (event) => {
      event?.stopPropagation?.();
      if (!settings.enabled) return;
      if (standing) sendSitCommand();
      else sendStandCommand();
    },
    [settings.enabled, standing],
  );

  const snooze = useCallback(
    (event) => {
      event?.stopPropagation?.();
      sendSnoozeCommand();
    },
    [],
  );

  const snoozedUntil = snapshot.runtime.snoozedUntil
    ? new Date(snapshot.runtime.snoozedUntil)
    : null;
  const snoozed = Boolean(snoozedUntil && snoozedUntil.getTime() > Date.now());
  const title = !settings.enabled
    ? '久坐提醒已关闭'
    : sitting
      ? `已连续久坐 ${snapshot.currentMin} 分钟`
      : standing
        ? `站立休息中 ${snapshot.currentMin} 分钟`
        : '久坐计时未开始';

  let hint = snapshot.hint;
  if (!settings.enabled) hint = '在设置里重新启用后，后台会继续计时与提醒';
  else if (!sitting && !standing) hint = '后台会自动开始计时；也可以手动记录状态';
  else if (standing) hint = '休息中，坐下后开始新一轮久坐';
  else if (snapshot.status === 'danger' && !snoozed) {
    hint = `已超过提醒阈值 ${settings.thresholdMin} 分钟，起身活动一下`;
  }

  const postureButton = (
    <ActionButton
      appearance="primary"
      icon={standing ? <ArrowDownRegular /> : <ArrowUpRegular />}
      onClick={togglePosture}
      disabled={!settings.enabled}
      aria-label={standing ? '我坐下了，开始新一轮久坐' : '我站起来了，记录一次起身'}
    >
      {standing ? '我坐下了' : '我站起来了'}
    </ActionButton>
  );

  return (
    <DetailPage>
      <DetailHeader
        trailing={
          <ActionButton onClick={() => requestHostSettings()} aria-label="打开久坐设置">
            设置…
          </ActionButton>
        }
      >
        <div className={styles.headerText}>
          <Text size={400} weight="semibold">
            {title}
          </Text>
          <Text size={200} className={styles.muted}>
            {hint}
          </Text>
        </div>
      </DetailHeader>

      {snapshot.hasData ? (
        <DetailToolbar>
          {postureButton}
          {snapshot.snoozable ? <ActionButton onClick={snooze}>稍后 5 分钟</ActionButton> : null}
        </DetailToolbar>
      ) : null}

      <DetailScroll>
        <CrossFade value={snapshot.hasData ? 'data' : 'empty'}>
          {snapshot.hasData ? (
            <div className={styles.content}>
              <section className={styles.section} aria-label="今日统计">
                <Text size={400} weight="semibold">
                  今日统计
                </Text>
                <div className={styles.statGrid}>
                  <Stat
                    label="今日累计久坐"
                    value={Math.round(snapshot.today.sittingMinutes)}
                    unit="分钟"
                  />
                  <Stat
                    label="今日站立"
                    value={Math.round(snapshot.today.standingMinutes)}
                    unit="分钟"
                  />
                  <Stat label="起身次数" value={snapshot.today.breaks} unit="次" />
                  <Stat
                    label="最长连续坐"
                    value={Math.round(snapshot.today.longestStreakMin)}
                    unit="分钟"
                  />
                </div>
              </section>

              <section className={styles.section} aria-label="最近 7 天">
                <Text size={400} weight="semibold">
                  最近 7 天
                </Text>
                <div className={styles.days}>
                  {snapshot.recentDays.map((day) => (
                    <ListRow
                      key={day.date}
                      title={<span className={styles.dayLabel}>{day.label}</span>}
                      subtitle={`站立 ${Math.round(day.standingMinutes)} 分钟 · 起身 ${day.breaks} 次`}
                      trailing={
                        <Text size={400} weight="semibold" className={styles.statValue}>
                          {Math.round(day.sittingMinutes)} 分钟
                        </Text>
                      }
                      aria-label={`${day.label}：久坐 ${Math.round(day.sittingMinutes)} 分钟，站立 ${Math.round(day.standingMinutes)} 分钟，起身 ${day.breaks} 次`}
                    />
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className={styles.emptyWrap}>
              <EmptyState
                icon={<Timer20Regular />}
                title="还没有今天的记录"
                description="后台会自动开始计时；也可以现在记录一次状态"
                action={postureButton}
              />
            </div>
          )}
        </CrossFade>
      </DetailScroll>
    </DetailPage>
  );
}
