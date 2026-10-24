/**
 * 番茄钟卡片（L0）。
 *
 * 密度契约（wtsl-density-pomodoro-sedentary §2 T1–T11、§3）：
 * - hero 全档统一 40/52（`HeroText` → `fontSizeHero900` / `lineHeightHero900`），单位/阶段走 Base200/300
 * - 1×1：identity(20px 图标) + hero + 阶段；**无进度条、无按钮**（垂直 24+8+52+8+16 = 108 ≤ 120）
 * - 2×1：identity(trailing 阶段) + hero + 主按钮/重置；按钮中轴对 hero cap 中轴
 * - 2×2：identity + hero + 阶段 + 第 N/M 轮 + 关联任务(有才渲染) + 今日统计两块 + 按钮行
 * - 3×2：identity + 左栏(hero/阶段/轮次/进度) + 右栏(今日统计三块) + 按钮行（三带，空带 15.9%）
 * - 1×2 / 3×3 明确不支持（见 sizes.js）
 *
 * accent 唯一归属：running 态主按钮填充（`appearance="primary"`）+ 3×2 的 4px 进度带（仅 running 可见）。
 * 阶段 / 任务 / 统计一律中性色；本插件不使用 `colorStatus*`（绿归久坐，跨插件不复用语义）。
 * 卡片主体点击 = 打开 L1；快捷按钮 stopPropagation，不打开详情。
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
  Timer20Regular,
} from '@fluentui/react-icons';
import { requestOverlay, useAgentTools, useHostSize, useStoredConfig } from '../../_shared/host.js';
import { CardIdentity, CardRoot, DataRow, HeroText, TOUCH_TARGET, TouchButton } from '../../_shared/ui.jsx';
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
    minWidth: 0,
  },
  /* padding / gap 由 CardRoot 唯一决定（16 / 8），插件只表达分栏与对齐 */
  rootStart: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  rootStack: {
    alignItems: 'stretch',
  },
  identityStart: {
    alignSelf: 'flex-start',
  },
  /**
   * 2×1：hero 左、按钮组右；行盒 52，两者同心 → 按钮中轴对 hero cap 中轴（残差 0.6px）。
   *
   * 例外 E1（保留）：按钮组是右锚定（`space-between`），不落在内容左轴上。
   * hero 读数与按钮组是两类同级操作，左轴只给读数；按钮贴内容右缘才能保证
   * 44×44 命中区不被挤压。右缘仍严格贴内容盒右缘（与 chevron 同一族）。
   */
  rowBody: {
    display: 'flex',
    flex: '1 1 auto',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    minHeight: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: tokens.spacingHorizontalS,
    minHeight: `${TOUCH_TARGET}px`,
    flex: '0 0 auto',
  },
  /** 2×2 底部余量 72（22.0%）贴门禁：按钮行下移 2（XXS），余量 70 = 21.3% */
  actions2x2: {
    marginBlockStart: tokens.spacingVerticalXXS,
  },
  phase: {
    minWidth: 0,
    color: tokens.colorNeutralForeground2,
  },
  meta: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  task: {
    maxWidth: '100%',
    minWidth: 0,
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  /**
   * 统计块统一走共享 `DataRow`（label 左 / 值右 / 28 行高）。
   * 3×2 因此重排为单列：identity → hero → 阶段·轮次 → 三行统计 → 进度带 → 按钮。
   */
  stats: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    width: '100%',
    minWidth: 0,
  },
  /** 阶段 + 轮次同一行：2×2 / 3×2 都用一行 16 承载，避免两行占高 */
  subline: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  progress: {
    width: '100%',
    flex: '0 0 auto',
  },
  /**
   * 例外 E6（保留）：非 running 时保留占位（不重排），但不出画——accent 像素只在
   * running 存在。进度带几何按 100% 内容宽（内容左 → 内容右），idle 下无像素可测。
   */
  progressIdle: {
    visibility: 'hidden',
  },
});

/** 主按钮文案只换词，不换字段：专注期「开始/继续/暂停」，休息期「开始休息/继续休息/暂停休息」 */
function toggleTextOf(snapshot) {
  const breaking = snapshot.phase !== 'focus';
  if (snapshot.running) return breaking ? '暂停休息' : '暂停';
  if (snapshot.progress > 0) return breaking ? '继续休息' : '继续';
  return breaking ? '开始休息' : '开始';
}

function CardActions({ styles, snapshot, onToggle, onReset }) {
  const toggleText = toggleTextOf(snapshot);
  return (
    <div className={styles.actions}>
      <Tooltip content={toggleText} relationship="label">
        <TouchButton
          // 开始/继续是次要动作；只有「正在运行」这个状态才升为 accent
          appearance={snapshot.running ? 'primary' : 'secondary'}
          icon={snapshot.running ? <Pause20Filled /> : <Play20Filled />}
          aria-label={toggleText}
          data-pomodoro-action="toggle"
          onClick={onToggle}
        />
      </Tooltip>
      <Tooltip content="重置本轮" relationship="label">
        <TouchButton
          appearance="subtle"
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

  const compact = sizeKey === '1x1';
  const row = sizeKey === '2x1';
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

  /** 阶段是 hero 的下位属性：永远 fg2，不随 phase 染色（accent 判定输入只有 running） */
  const phaseText = (
    <Text
      size={200}
      weight="semibold"
      className={styles.phase}
      data-pomodoro-phase-label
    >
      {snapshot.phaseLabel}
    </Text>
  );
  const roundText = `第 ${snapshot.roundInCycle} / ${snapshot.roundsBeforeLongBreak} 轮`;
  const roundLine = (
    <Text size={200} className={styles.meta} data-pomodoro-round>
      {roundText}
    </Text>
  );
  const taskTitle = snapshot.taskTitle;
  const totalMin = Math.max(1, Math.round(snapshot.totalMs / 60000));
  const toggleText = toggleTextOf(snapshot);
  const cardLabel = `${snapshot.phaseLabel} ${snapshot.remainingText}，${
    snapshot.running ? '计时中' : '已暂停'
  }；${roundText}；点击卡片打开详情${compact ? '' : `，卡内可${toggleText}或重置`}`;

  const actions = <CardActions styles={styles} snapshot={snapshot} onToggle={toggle} onReset={reset} />;
  const cardRootProps = {
    ariaLabel: cardLabel,
    onActivate: openDetail,
    'data-pomodoro-size': sizeKey,
    'data-pomodoro-phase': snapshot.phase,
    'data-pomodoro-running': snapshot.running ? 'true' : 'false',
  };

  /* ---- 1×1：identity + hero + 阶段；进度条与按钮都不进这档（预算 108/120） ---- */
  if (compact) {
    return (
      <CardRoot
        {...cardRootProps}
        className={mergeClasses(styles.root, styles.rootStart)}
      >
        <CardIdentity className={styles.identityStart} icon={<Timer20Regular />} compact />
        <HeroText data-pomodoro-time="true">{snapshot.remainingText}</HeroText>
        {phaseText}
      </CardRoot>
    );
  }

  /* ---- 2×1：identity(trailing 阶段) + hero + 40×40 按钮组（右缘贴内容右缘） ---- */
  if (row) {
    return (
      <CardRoot {...cardRootProps} className={mergeClasses(styles.root, styles.rootStack)}>
        <CardIdentity icon={<Timer20Regular />} label="番茄钟" disclosure trailing={phaseText} />
        <div className={styles.rowBody}>
          <HeroText data-pomodoro-time="true">{snapshot.remainingText}</HeroText>
          {actions}
        </div>
      </CardRoot>
    );
  }

  /* ---- 3×2：单列重排（DataRow 统计块）。identity → hero → 阶段·轮次·任务 → 三行统计 → 进度 → 按钮 ---- */
  if (wide) {
    return (
      <CardRoot {...cardRootProps} className={mergeClasses(styles.root, styles.rootStack)}>
        <CardIdentity icon={<Timer20Regular />} label="番茄钟" disclosure />
        <HeroText data-pomodoro-time="true">{snapshot.remainingText}</HeroText>
        <div className={styles.subline}>
          {phaseText}
          {roundLine}
          {taskTitle ? (
            <Text size={400} className={styles.task} title={taskTitle}>
              {taskTitle}
            </Text>
          ) : null}
        </div>
        <div className={styles.stats} data-pomodoro-stats="true">
          <DataRow label="今日完成" value={snapshot.today.completed} unit="个" />
          <DataRow label="专注" value={snapshot.today.focusMinutes} unit="分钟" />
          <DataRow label="本轮时长" value={totalMin} unit="分钟" />
        </div>
        <ProgressBar
          className={mergeClasses(styles.progress, !snapshot.running && styles.progressIdle)}
          value={snapshot.progress}
          max={1}
          thickness="large"
          aria-label="本轮进度"
          aria-hidden={!snapshot.running}
          data-pomodoro-progress="true"
        />
        {actions}
      </CardRoot>
    );
  }

  /* ---- 2×2：identity + hero + 阶段 + 轮次 + 关联任务(有才渲染) + 今日统计两块 + 按钮行 ---- */
  return (
    <CardRoot {...cardRootProps} className={mergeClasses(styles.root, styles.rootStack)}>
      <CardIdentity icon={<Timer20Regular />} label="番茄钟" disclosure />
      <HeroText data-pomodoro-time="true">{snapshot.remainingText}</HeroText>
      {phaseText}
      {roundLine}
      {taskTitle ? (
        <Text size={400} className={styles.task} title={taskTitle}>
          {taskTitle}
        </Text>
      ) : null}
      <div className={styles.stats} data-pomodoro-stats="true">
        <DataRow label="今日完成" value={snapshot.today.completed} unit="个" />
        <DataRow label="专注" value={snapshot.today.focusMinutes} unit="分钟" />
      </div>
      <div className={styles.actions2x2}>{actions}</div>
    </CardRoot>
  );
}
