/**
 * 久坐提醒卡片（L0，docs/components/sedentary.md）。
 *
 * 密度契约（wtsl-density-pomodoro-sedentary §2 T1–T11、§4）：
 * - hero 是**正计时**（已坐/已站分钟，40/52），卡上永远只有一个主数字（避免「谁是主」）；
 *   倒计时**不写句子**：下一次提醒 = 状态点色 + 计时/警示图标 + 剩余分钟数据（`ReminderChip`）。
 * - 每档恰 1 个 44px 主按钮（1×1 无按钮，整卡命中）；姿态切换只改标签、不改位置、不改尺寸。
 * - 状态色只在异常态出现：8×8 `StatusDot`（warning / danger），**success 态不画任何颜色**；
 *   本插件**永不使用 `colorBrand*`**（品牌蓝属于「正在运行的计时器」，见规格 §5.1）。
 * - 功能色：Badge（subtle / warning / danger / informative）+ StatusDot（warning / danger）；
 *   hero / 统计 / 剩余分钟一律中性。
 *
 * 尺寸档位：
 * - 1×1：identity(20px 图标 + Badge) + hero；无 hint、无状态点、无按钮（84/120）
 * - 2×1：identity(图标 +「久坐」+ trailing〔点+剩余分钟〕) + hero + 40 按钮；空带 21.9%
 * - 2×2：identity(Badge + 剩余分钟) + Metric(label「连续久坐」) + 3 列统计 + 7 天迷你条 + 按钮；空带 11.2%
 * - 3×2：三带（主行 / 7 天条 / 按钮）；空带 13.5%（原 43.5%）
 * - 提醒关闭 / 未开始：EmptyState（中性 24 图标 + 标题 + 一个次操作），不写说明句。
 *
 * CardRoot 负责卡片手势、键盘 Enter/Space 与内部控件过滤；快捷按钮再显式 stopPropagation。
 */

import { useCallback, useEffect } from 'react';
import { Badge, Text, Tooltip, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import {
  Alert16Regular,
  ArrowDownRegular,
  ArrowUpRegular,
  PersonWalking20Regular,
  PersonWalking24Regular,
  Settings20Regular,
  Timer16Regular,
} from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import {
  requestHostSettings,
  requestOverlay,
  useHostSize,
  useStoredConfig,
} from '../../_shared/host.js';
import {
  CardIdentity,
  CardRoot,
  EmptyState,
  Metric,
  StatusDot,
  TOUCH_TARGET,
  TouchButton,
} from '../../_shared/ui.jsx';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  getEngine,
  normalizeSettings,
  sendSitCommand,
  sendStandCommand,
} from './data/engine.js';
import { useSedentaryState } from './useSedentaryState.js';
import { DEFAULT_SIZE_KEY, sizeKeyOf } from './sizes.js';

/**
 * Badge 语义：success（安全区）与 off 走 `subtle` 中性块——绿在本卡只在异常时出现；
 * resting 走 `informative`（Fluent 的 tint-informative = colorNeutralBackground4 + fg3，中性蓝灰，不是 brand）。
 */
const BADGE_COLOR = {
  success: 'subtle',
  warning: 'warning',
  danger: 'danger',
  resting: 'informative',
  off: 'subtle',
};

/** 状态点只在「接近提醒 / 该起身了」出现；success 与 resting 不画点（压力解除本身是最强信号） */
function dotToneOf(status) {
  if (status === 'warning') return 'warning';
  if (status === 'danger') return 'danger';
  return null;
}

const useStyles = makeStyles({
  root: {
    minWidth: 0,
    minHeight: 0,
    color: tokens.colorNeutralForeground1,
    userSelect: 'none',
  },
  /* padding / gap 由 CardRoot 唯一决定（16 / 8），插件只表达分栏与对齐 */
  rootStart: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  identityStart: {
    alignSelf: 'flex-start',
  },
  rootStack: {
    alignItems: 'stretch',
  },
  rowBody: {
    display: 'flex',
    flex: '1 1 auto',
    // hero 与 identity 行紧接；行盒 52 内居中 → 40 按钮中轴对 hero cap 中轴（残差 0.6px）
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    minHeight: 0,
  },
  /**
   * identity 行尾「下一次提醒」：点（色）+ 计时图标（形）+ 剩余分钟（数据）。
   * 不写「距提醒还有 N 分钟」这类句子——完整语义在读屏 aria-label 与 hover tooltip 里。
   */
  reminder: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  reminderValue: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  /** Metric 的 label/caption 两行：hint 为空时（休息中）保留行高，姿态切换不产生位移 */
  metricBlock: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: `calc(${tokens.lineHeightHero900} + ${tokens.spacingVerticalXXS} + ${tokens.lineHeightBase300} + ${tokens.spacingVerticalXXS} + ${tokens.lineHeightBase200})`,
  },
  statsRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  statBlock: {
    display: 'flex',
    flex: '1 1 0',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  statLabel: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  statValue: {
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  /** 3×2 带1：hero 左 / 统计右；统计块 cap 顶与 hero cap 顶对齐（行盒顶 + SNudge 6） */
  wideRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
    columnGap: tokens.spacingHorizontalL,
    alignItems: 'flex-start',
    minWidth: 0,
  },
  wideStats: {
    paddingBlockStart: tokens.spacingVerticalSNudge,
    minWidth: 0,
  },
  /** 3×2 带2：7 天条（全宽） */
  weekBand: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  weekLabel: {
    color: tokens.colorNeutralForeground3,
  },
  week: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    columnGap: tokens.spacingHorizontalXS,
    alignItems: 'end',
    width: '100%',
    minWidth: 0,
  },
  weekCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  /** 迷你条口径：轨道高度走 spacing token，条高按当天数据百分比（数据驱动的百分比不是设计值） */
  weekTrack: {
    display: 'flex',
    alignItems: 'flex-end',
    width: '100%',
    maxWidth: tokens.spacingVerticalXXXL,
    height: tokens.spacingVerticalXXL,
    marginInline: 'auto',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
    overflow: 'hidden',
  },
  weekTrackTall: {
    height: tokens.spacingVerticalXXXL,
  },
  weekFill: {
    width: '100%',
    backgroundColor: tokens.colorNeutralForeground3,
    borderRadius: tokens.borderRadiusSmall,
  },
  weekFillToday: {
    backgroundColor: tokens.colorNeutralForeground1,
  },
  weekDate: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: tokens.spacingHorizontalS,
    minHeight: `${TOUCH_TARGET}px`,
    flex: '0 0 auto',
  },
  /** 空态块：占满 identity 行以下的剩余空间，内部垂直居中（与其余五卡同构） */
  emptyBlock: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    minHeight: 0,
    minWidth: 0,
  },
});

/**
 * identity 行尾的「下一次提醒」。
 *
 * 状态不靠一句话描述：warning / danger 用 `StatusDot` 的语义色 + 计时/警示图标区分形状，
 * 剩余分钟作为数据（12px、tabular）贴着走；完整语义由 `aria-label` 与 `Tooltip` 承担
 * （读屏可读、鼠标可发现）。危险态不重复写「该起身了」——Badge 已经写着。
 */
function ReminderChip({ status, minutes, className }) {
  const styles = useStyles();
  const tone = dotToneOf(status);
  const upcoming = Number(minutes) > 0;
  const label = upcoming ? `距提醒还有 ${minutes} 分钟` : '该起身了';
  return (
    <Tooltip content={label} relationship="description">
      <span
        className={mergeClasses(styles.reminder, className)}
        role="img"
        aria-label={label}
        data-sedentary-reminder="true"
      >
        {tone ? <StatusDot tone={tone} /> : null}
        {upcoming ? <Timer16Regular aria-hidden="true" /> : <Alert16Regular aria-hidden="true" />}
        {upcoming ? (
          <Text size={200} className={styles.reminderValue}>
            {minutes} 分钟
          </Text>
        ) : null}
      </span>
    </Tooltip>
  );
}

/** 7 天迷你条：旧→新，最后一列是今天；柱高按当天久坐分钟数归一化 */
function WeekBars({ styles, days, showDates = false, tall = false }) {
  const recent = days.slice().reverse();
  const max = Math.max(1, ...recent.map((day) => Math.round(day.sittingMinutes)));
  const today = recent[recent.length - 1];
  return (
    <div
      className={styles.week}
      data-sedentary-week="7"
      role="img"
      aria-label={`最近 7 天久坐，今天 ${Math.round(today?.sittingMinutes ?? 0)} 分钟`}
    >
      {recent.map((day, index) => {
        const minutes = Math.round(day.sittingMinutes);
        const isToday = index === recent.length - 1;
        const height = minutes > 0 ? Math.max(10, Math.round((minutes / max) * 100)) : 0;
        return (
          <div key={day.date} className={styles.weekCol} data-sedentary-day={day.date}>
            <div className={mergeClasses(styles.weekTrack, tall && styles.weekTrackTall)}>
              <span
                className={mergeClasses(styles.weekFill, isToday && styles.weekFillToday)}
                style={{ height: `${height}%` }}
                aria-hidden="true"
              />
            </div>
            {showDates ? (
              <Text size={200} className={styles.weekDate}>
                {day.date.slice(8)}
              </Text>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function SedentaryApp({ fallbackSizeKey }) {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, fallbackSizeKey || DEFAULT_SIZE_KEY);
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const snapshot = useSedentaryState(settings);
  const compact = sizeKey === '1x1';
  const row = sizeKey === '2x1';
  const wide = sizeKey === '3x2';

  /* 独立开发（无宿主）：卡片视图兜底启动引擎；宿主里只由 background iframe 跑 */
  useEffect(() => {
    if (plugin.inHost) return undefined;
    const engine = getEngine();
    engine.start();
    return () => engine.stop();
  }, []);

  const openDetail = useCallback(() => requestOverlay('detail', '久坐详情'), []);
  const openSettings = useCallback((event) => {
    event.stopPropagation();
    requestHostSettings();
  }, []);

  const standing = snapshot.posture === 'standing';
  const started = snapshot.posture !== null;
  /* 姿态切换只改标签，位置/尺寸/层级不变（HIG §6：主次用样式不用尺寸） */
  const togglePosture = useCallback(
    (event) => {
      event.stopPropagation();
      if (!settings.enabled) return;
      if (standing) sendSitCommand();
      else sendStandCommand();
    },
    [settings.enabled, standing],
  );
  const sitDown = useCallback(
    (event) => {
      event.stopPropagation();
      if (!settings.enabled) return;
      sendSitCommand();
    },
    [settings.enabled],
  );

  const postureText = snapshot.postureLabel || '久坐提醒';
  const ariaLabel = settings.enabled
    ? started
      ? `${snapshot.statusLabel}，${postureText} ${snapshot.currentMin} 分钟；点击打开详情`
      : `还没开始计时；点击打开详情`
    : '久坐提醒已关闭；点击打开详情';

  const statusBadge = (
    <Badge
      appearance="tint"
      color={BADGE_COLOR[snapshot.status] ?? 'subtle'}
      size="large"
      aria-label={`状态：${snapshot.statusLabel}`}
    >
      {snapshot.statusLabel}
    </Badge>
  );

  const stats = [
    { key: 'sitting', label: '今日久坐', value: Math.round(snapshot.today.sittingMinutes), unit: '分钟' },
    { key: 'standing', label: '今日站立', value: Math.round(snapshot.today.standingMinutes), unit: '分钟' },
    { key: 'breaks', label: '起身次数', value: snapshot.today.breaks, unit: '次' },
  ];

  const renderStat = (item) => (
    <div key={item.key} className={styles.statBlock} data-sedentary-stat={item.label}>
      <Text size={200} className={styles.statLabel}>
        {item.label}
      </Text>
      <span className={styles.statValueRow}>
        <Text size={500} weight="semibold" className={styles.statValue}>
          {item.value}
        </Text>
        <Text size={200} className={styles.statLabel}>
          {item.unit}
        </Text>
      </span>
    </div>
  );

  const standaloneButton = (
    <div className={styles.actions}>
      <TouchButton
        appearance="secondary"
        icon={standing ? <ArrowDownRegular /> : <ArrowUpRegular />}
        onClick={togglePosture}
        disabled={!settings.enabled}
        aria-label={standing ? '我坐下了' : '我站起来了'}
        data-sedentary-action="posture"
      >
        {standing ? '我坐下了' : '我站起来了'}
      </TouchButton>
    </div>
  );

  /** hero 的含义由 label 锚定（数字本身不解释自己是坐还是站）；姿态切换只改这两个字，不改行高 */
  const metric = (withMeta) => (
    <Metric
      value={snapshot.currentMin}
      unit="分钟"
      label={withMeta ? (standing ? '连续站立' : '连续久坐') : undefined}
      reserveCaption={false}
    />
  );

  /**
   * 下一次提醒只在「坐着且在计时」时有意义（站立/未开始由 Badge 表达）。
   * 数据来自数据层 `nextReminderMin`，渲染成点+图标+分钟，不拼句子。
   */
  const reminder =
    started && !standing && snapshot.nextReminderMin != null ? (
      <ReminderChip status={snapshot.status} minutes={snapshot.nextReminderMin} />
    ) : null;

  /* ---- 空态：提醒关闭 ---- */
  if (!settings.enabled) {
    return (
      <CardRoot
        ariaLabel={ariaLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.rootStack)}
      >
        {compact || row ? null : (
          <CardIdentity
            icon={<PersonWalking20Regular />}
            label="久坐"
            disclosure
          />
        )}
        <div className={styles.emptyBlock}>
          <EmptyState
            icon={<PersonWalking24Regular />}
            title="提醒已关闭"
            compact={compact || row}
            action={
              <TouchButton
                appearance="secondary"
                icon={<Settings20Regular />}
                onClick={openSettings}
              >
                打开设置
              </TouchButton>
            }
            align="start"
          />
        </div>
      </CardRoot>
    );
  }

  /* ---- 空态：还没记录过姿态（posture=null）：hero 会显示 0 分钟但没有含义 ---- */
  if (!started) {
    return (
      <CardRoot
        ariaLabel={ariaLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.rootStack)}
      >
        {compact || row ? null : (
          <CardIdentity
            icon={<PersonWalking20Regular />}
            label="久坐"
            disclosure
          />
        )}
        <div className={styles.emptyBlock}>
          <EmptyState
            icon={<PersonWalking24Regular />}
            title="还没开始计时"
            compact={compact || row}
            action={
              <TouchButton
                appearance="secondary"
                icon={<ArrowDownRegular />}
                onClick={sitDown}
                data-sedentary-action="sitStart"
              >
                我坐下了
              </TouchButton>
            }
            align="start"
          />
        </div>
      </CardRoot>
    );
  }

  /* ---- 1×1：identity(图标 + Badge) + hero；不加 hint / 状态点 / 按钮（84/120） ---- */
  if (compact) {
    return (
      <CardRoot
        ariaLabel={ariaLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.rootStart)}
        data-sedentary-size={sizeKey}
      >
        <CardIdentity
          className={styles.identityStart}
          icon={<PersonWalking20Regular />}
          compact
          trailing={statusBadge}
        />
        {metric(false)}
      </CardRoot>
    );
  }

  /* ---- 2×1：identity + hero + 40 按钮；下一次提醒只在 warning/danger 出现 ---- */
  if (row) {
    return (
      <CardRoot
        ariaLabel={ariaLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.rootStack)}
        data-sedentary-size={sizeKey}
      >
        <CardIdentity
          icon={<PersonWalking20Regular />}
          label="久坐"
          disclosure
          trailing={reminder}
        />
        <div className={styles.rowBody}>
          {metric(false)}
          <TouchButton
            appearance="secondary"
            icon={standing ? <ArrowDownRegular /> : <ArrowUpRegular />}
            onClick={togglePosture}
            aria-label={standing ? '我坐下了' : '我站起来了'}
            data-sedentary-action="posture"
          >
            {standing ? '我坐下了' : '我站起来了'}
          </TouchButton>
        </div>
      </CardRoot>
    );
  }

  /* ---- 3×2：三带（主行 hero 左 / 统计右；7 天条全宽；按钮左缘） ---- */
  if (wide) {
    return (
      <CardRoot
        ariaLabel={ariaLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.rootStack)}
        data-sedentary-size={sizeKey}
      >
        <CardIdentity
          icon={<PersonWalking20Regular />}
          label="久坐"
          disclosure
          trailing={
            <>
              {statusBadge}
              {reminder}
            </>
          }
        />
        <div className={styles.wideRow} data-content-band="main">
          <div className={styles.metricBlock}>{metric(true)}</div>
          <div className={mergeClasses(styles.statsRow, styles.wideStats)}>{stats.map(renderStat)}</div>
        </div>
        <div className={styles.weekBand} data-content-band="week">
          <Text size={200} className={styles.weekLabel}>
            最近 7 天
          </Text>
          <WeekBars styles={styles} days={snapshot.recentDays} showDates tall />
        </div>
        {standaloneButton}
      </CardRoot>
    );
  }

  /* ---- 2×2：identity(Badge + 下一次提醒) + Metric + 3 列统计 + 7 天迷你条 + 按钮 ---- */
  return (
    <CardRoot
      ariaLabel={ariaLabel}
      onActivate={openDetail}
      className={mergeClasses(styles.root, styles.rootStack)}
      data-sedentary-size={sizeKey}
    >
      <CardIdentity
        icon={<PersonWalking20Regular />}
        label="久坐"
        disclosure
        trailing={
          <>
            {statusBadge}
            {reminder}
          </>
        }
      />
      <div className={styles.metricBlock}>{metric(true)}</div>
      <div className={styles.statsRow}>{stats.map(renderStat)}</div>
      <WeekBars styles={styles} days={snapshot.recentDays} />
      {standaloneButton}
    </CardRoot>
  );
}
