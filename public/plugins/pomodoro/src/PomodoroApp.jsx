/**
 * 番茄钟卡片（L0）。
 *
 * 信息预算（docs/components/pomodoro.md）：
 * - 1×1：identity chip（compact）+ 剩余时间 48 + 阶段 14 + 2px 进度；不放按钮，点卡体进详情
 * - 2×1：identity 行（chip +「番茄钟」+ trailing 阶段）+ 时间 68 + 两个 40 按钮
 * - 2×2：identity 行 + 时间 80 + 阶段 + 当前任务 + 今日统计一行 + 两个 40 按钮
 * - 3×2：identity 行（trailing 轮次）+ 进度 + 时间 96 + 任务 + 两条今日统计 + 两个 40 按钮
 *
 * 卡片主体点击 = 打开 L1；快捷按钮 stopPropagation，不打开详情。
 * 长按/右键/hover 全部交给 CardRoot（useHostCardGesture），这里不处理。
 */

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  ProgressBar,
  Text,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowReset20Regular,
  Pause20Filled,
  Play20Filled,
  Timer16Regular,
} from '@fluentui/react-icons';
import { requestOverlay, useAgentTools, useHostSize, useStoredConfig } from '../../_shared/host.js';
import { useMotionTransition } from '../../_shared/motion.js';
import { DISPLAY_WEIGHT, TABULAR_NUMS, displayXl } from '../../_shared/typography.js';
import { CardIdentity, CardRoot, TouchButton } from '../../_shared/ui.jsx';
import { DEFAULT_SIZE_KEY, sizeKeyOf } from './sizes.js';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  TOOL_DECLS,
  buildToolHandlers,
  getEngine,
  normalizeSettings,
} from './data/timer.js';

const useStyles = makeStyles({
  root: {
    userSelect: 'none',
    cursor: 'pointer',
  },
  root1: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalS,
  },
  identityTop: {
    alignSelf: 'flex-start',
  },
  root21: {
    gap: tokens.spacingVerticalS,
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalM,
  },
  row21Body: {
    display: 'flex',
    flex: '1 1 auto',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    minHeight: 0,
  },
  root22: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalM,
    textAlign: 'center',
  },
  root32: {
    gap: tokens.spacingVerticalS,
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
  },
  wide: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
    alignItems: 'stretch',
    columnGap: tokens.spacingHorizontalXL,
    rowGap: tokens.spacingVerticalS,
    flex: '1 1 auto',
    minHeight: 0,
  },
  wideMain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  wideSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  time: {
    ...TABULAR_NUMS,
    fontWeight: DISPLAY_WEIGHT,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
  },
  time48: displayXl(48),
  time68: {
    fontSize: tokens.fontSizeHero1000,
    lineHeight: tokens.lineHeightHero1000,
  },
  time80: displayXl(80),
  time96: displayXl(96),
  phase: {
    minWidth: 0,
  },
  task: {
    maxWidth: '100%',
    minWidth: 0,
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statLine: {
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
  },
  round: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flex: '0 0 auto',
  },
  actionsCenter: {
    justifyContent: 'center',
  },
  progressTop: {
    width: '100%',
    flex: '0 0 auto',
  },
  progressBottom: {
    width: '72%',
  },
});

function phaseColor(phase) {
  return phase === 'focus' ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground2;
}

function toggleTextOf(snapshot) {
  if (snapshot.running) return '暂停';
  if (snapshot.progress > 0) return '继续';
  return '开始';
}

function CardActions({ styles, snapshot, onToggle, onReset, centered = false }) {
  const toggleText = toggleTextOf(snapshot);
  return (
    <div className={mergeClasses(styles.actions, centered && styles.actionsCenter)}>
      <Tooltip content={toggleText} relationship="label">
        <TouchButton
          appearance="primary"
          icon={snapshot.running ? <Pause20Filled /> : <Play20Filled />}
          aria-label={toggleText}
          data-pomodoro-action="toggle"
          onClick={onToggle}
        />
      </Tooltip>
      <Tooltip content="重置本轮" relationship="label">
        <TouchButton
          icon={<ArrowReset20Regular />}
          aria-label="重置本轮"
          data-pomodoro-action="reset"
          onClick={onReset}
        />
      </Tooltip>
    </div>
  );
}

export default function PomodoroApp({ fallbackSizeKey }) {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, fallbackSizeKey || DEFAULT_SIZE_KEY);
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const engine = getEngine();
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  const phaseTransition = useMotionTransition('exit');

  const compact = sizeKey === '1x1';
  const row = sizeKey === '2x1';
  const medium = sizeKey === '2x2';
  const wide = sizeKey === '3x2';

  useEffect(() => {
    engine.startEngine();
    return () => engine.stopEngine();
  }, [engine]);

  useEffect(() => {
    engine.setSettings(settings);
  }, [engine, settings]);

  const handlers = useMemo(() => buildToolHandlers(engine), [engine]);
  useAgentTools(TOOL_DECLS, handlers);

  const toggle = useCallback(
    (event) => {
      event.stopPropagation();
      engine.toggle();
    },
    [engine],
  );
  const reset = useCallback(
    (event) => {
      event.stopPropagation();
      engine.reset();
    },
    [engine],
  );
  const openDetail = useCallback(() => requestOverlay('detail', '专注详情'), []);

  const phaseStyle = {
    color: phaseColor(snapshot.phase),
    transitionProperty: 'color',
    ...phaseTransition,
  };
  const phaseText = (
    <Text
      size={300}
      weight="semibold"
      className={styles.phase}
      style={phaseStyle}
      data-pomodoro-phase-label
    >
      {snapshot.phaseLabel}
    </Text>
  );
  const roundText = `第 ${snapshot.roundInCycle} / ${snapshot.roundsBeforeLongBreak} 轮`;
  const taskTitle = snapshot.taskTitle || '未关联任务';
  const toggleText = toggleTextOf(snapshot);
  const cardLabel = `${snapshot.phaseLabel} ${snapshot.remainingText}，${
    snapshot.running ? '计时中' : '已暂停'
  }；点击卡片打开详情${compact ? '' : `，卡内可${toggleText}或重置`}`;

  const actions = <CardActions styles={styles} snapshot={snapshot} onToggle={toggle} onReset={reset} />;

  /* ---- 1×1：identity chip + 时间 48 + 阶段 + 2px 进度；无按钮 ---- */
  if (compact) {
    return (
      <CardRoot
        ariaLabel={cardLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.root1)}
        data-pomodoro-size={sizeKey}
        data-pomodoro-phase={snapshot.phase}
        data-pomodoro-running={snapshot.running ? 'true' : 'false'}
      >
        <CardIdentity
          className={styles.identityTop}
          icon={<Timer16Regular />}
          accent="orange"
          compact
        />
        <span className={mergeClasses(styles.time, styles.time48)} data-pomodoro-time>
          {snapshot.remainingText}
        </span>
        {phaseText}
        <ProgressBar
          className={styles.progressBottom}
          value={snapshot.progress}
          max={1}
          aria-label="本轮进度"
        />
      </CardRoot>
    );
  }

  /* ---- 2×1：identity 行（trailing 阶段）+ 时间 68 + 两个 40 按钮 ---- */
  if (row) {
    return (
      <CardRoot
        ariaLabel={cardLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.root21)}
        data-pomodoro-size={sizeKey}
        data-pomodoro-phase={snapshot.phase}
        data-pomodoro-running={snapshot.running ? 'true' : 'false'}
      >
        <CardIdentity
          icon={<Timer16Regular />}
          label="番茄钟"
          accent="orange"
          trailing={phaseText}
        />
        <div className={styles.row21Body}>
          <span className={mergeClasses(styles.time, styles.time68)} data-pomodoro-time>
            {snapshot.remainingText}
          </span>
          {actions}
        </div>
      </CardRoot>
    );
  }

  /* ---- 3×2：identity 行（trailing 轮次）+ 进度 + 时间 96 + 任务 + 两条统计 + 按钮 ---- */
  if (wide) {
    return (
      <CardRoot
        ariaLabel={cardLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.root32)}
        data-pomodoro-size={sizeKey}
        data-pomodoro-phase={snapshot.phase}
        data-pomodoro-running={snapshot.running ? 'true' : 'false'}
      >
        <CardIdentity
          icon={<Timer16Regular />}
          label="番茄钟"
          accent="orange"
          trailing={
            <Text size={200} className={styles.round}>
              {roundText}
            </Text>
          }
        />
        <ProgressBar
          className={styles.progressTop}
          value={snapshot.progress}
          max={1}
          aria-label="本轮进度"
        />
        <div className={styles.wide}>
          <div className={styles.wideMain}>
            <span className={mergeClasses(styles.time, styles.time96)} data-pomodoro-time>
              {snapshot.remainingText}
            </span>
            {phaseText}
          </div>
          <div className={styles.wideSide}>
            <Text size={400} className={styles.task} title={taskTitle}>
              {taskTitle}
            </Text>
            <div className={styles.stats}>
              <Text size={300} className={styles.statLine}>
                今日完成 {snapshot.today.completed} 个
              </Text>
              <Text size={300} className={styles.statLine}>
                专注 {snapshot.today.focusMinutes} 分钟
              </Text>
            </div>
            {actions}
          </div>
        </div>
      </CardRoot>
    );
  }

  /* ---- 2×2：identity 行 + 时间 80 + 阶段 + 任务 + 今日统计一行 + 按钮 ---- */
  return (
    <CardRoot
      ariaLabel={cardLabel}
      onActivate={openDetail}
      className={mergeClasses(styles.root, styles.root22)}
      data-pomodoro-size={sizeKey}
      data-pomodoro-phase={snapshot.phase}
      data-pomodoro-running={snapshot.running ? 'true' : 'false'}
    >
      <CardIdentity icon={<Timer16Regular />} label="番茄钟" accent="orange" />
      <span className={mergeClasses(styles.time, styles.time80)} data-pomodoro-time>
        {snapshot.remainingText}
      </span>
      {phaseText}
      <Text size={400} className={styles.task} title={taskTitle}>
        {taskTitle}
      </Text>
      <Text size={300} className={styles.statLine}>
        今日 {snapshot.today.completed} 个 · 专注 {snapshot.today.focusMinutes} 分钟
      </Text>
      <CardActions
        styles={styles}
        snapshot={snapshot}
        onToggle={toggle}
        onReset={reset}
        centered
      />
    </CardRoot>
  );
}
