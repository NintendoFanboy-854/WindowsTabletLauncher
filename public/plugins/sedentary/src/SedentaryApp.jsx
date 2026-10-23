/**
 * 久坐提醒卡片（L0，docs/components/sedentary.md）。
 *
 * 状态机：坐着（sitting）↔ 站立（standing），手动切换（D-27）。
 *
 * 尺寸档位：
 * - 1×1：identity chip（compact）+ 状态 Badge + 当前状态分钟（48）；无按钮，点卡体开详情；
 * - 2×1：identity 行（chip +「久坐」+ trailing 状态点/提示）+ 分钟 68 + 状态按钮 40；
 * - 2×2：identity 行（trailing 状态 Badge）+ 分钟 80 + 两项统计（今日久坐/今日站立）+ 状态按钮；
 * - 3×2：identity 行 + 分钟 96 + 三项统计（今日久坐/今日站立/起身次数）+ 状态按钮；
 * - 提醒关闭：EmptyState（green identity 色）+ 单个主操作「打开设置」。
 *
 * CardRoot 负责卡片手势、键盘 Enter/Space 与内部控件过滤；快捷按钮再显式
 * stopPropagation，确保只记录状态、不打开详情。长按 / hover / 右键全部交给宿主，
 * 插件不再自建菜单或设置入口。
 */

import { useCallback, useEffect } from 'react';
import {
  Badge,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowDownRegular,
  ArrowUpRegular,
  PersonWalking16Regular,
  PersonWalking24Regular,
} from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import {
  requestHostSettings,
  requestOverlay,
  useHostSize,
  useStoredConfig,
} from '../../_shared/host.js';
import { useMotionTransition } from '../../_shared/motion.js';
import {
  CardIdentity,
  CardRoot,
  EmptyState,
  Metric,
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

const BADGE_COLOR = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  resting: 'informative',
  off: 'subtle',
};

/** 2×1 空间放不下 Badge 时用状态点 + 文案双通道（颜色来自 status token） */
const STATUS_DOT_COLOR = {
  success: tokens.colorStatusSuccessForeground1,
  warning: tokens.colorStatusWarningForeground1,
  danger: tokens.colorStatusDangerForeground1,
  resting: tokens.colorBrandForeground1,
  off: tokens.colorNeutralForeground4,
};

const useStyles = makeStyles({
  root: {
    minWidth: 0,
    minHeight: 0,
    color: tokens.colorNeutralForeground1,
    userSelect: 'none',
  },
  /* DENSITY §2.1 尺寸档 padding / 组间距 */
  rootCompact: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalS,
  },
  identityStart: {
    alignSelf: 'flex-start',
  },
  rootRow: {
    gap: tokens.spacingVerticalS,
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalM,
  },
  rowBody: {
    display: 'flex',
    flex: '1 1 auto',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    minHeight: 0,
  },
  rootMedium: {
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalM,
  },
  rootWide: {
    gap: tokens.spacingVerticalS,
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
  },
  wideBody: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr) auto',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXL,
    rowGap: tokens.spacingVerticalS,
    flex: '1 1 auto',
    minHeight: 0,
  },
  wideMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  wideStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
  },
  wideActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  trailingHint: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  statusDot: {
    flexShrink: 0,
    width: tokens.spacingHorizontalM,
    height: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusCircular,
  },
  statsRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalXL,
    minWidth: 0,
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
    whiteSpace: 'nowrap',
  },
  statLabel: {
    color: tokens.colorNeutralForeground3,
  },
  hint: {
    minWidth: 0,
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    marginTop: 'auto',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalL,
  },
  emptyCardCompact: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalS,
  },
});

export default function SedentaryApp({ fallbackSizeKey }) {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, fallbackSizeKey || DEFAULT_SIZE_KEY);
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const snapshot = useSedentaryState(settings);
  const motionStyle = useMotionTransition('normal');
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

  const standing = snapshot.posture === 'standing';
  const togglePosture = useCallback(
    (event) => {
      event.stopPropagation();
      if (!settings.enabled) return;
      if (standing) sendSitCommand();
      else sendStandCommand();
    },
    [settings.enabled, standing],
  );

  const postureText = snapshot.postureLabel || '久坐提醒';
  const ariaLabel = settings.enabled
    ? `${snapshot.statusLabel}，${postureText} ${snapshot.currentMin} 分钟；点击打开详情`
    : '久坐提醒已关闭；点击打开详情';

  const statusBadge = (
    <Badge
      appearance="tint"
      color={BADGE_COLOR[snapshot.status] ?? 'informative'}
      size="large"
      aria-label={`状态：${snapshot.statusLabel}`}
    >
      {snapshot.statusLabel}
    </Badge>
  );

  const stats = [
    { key: 'sitting', label: '今日久坐', value: Math.round(snapshot.today.sittingMinutes), unit: '分钟' },
    {
      key: 'standing',
      label: '今日站立',
      value: Math.round(snapshot.today.standingMinutes),
      unit: '分钟',
    },
    { key: 'breaks', label: '起身次数', value: snapshot.today.breaks, unit: '次' },
  ];

  const renderStat = (item) => (
    <div key={item.key} className={styles.stat}>
      <Text size={200} className={styles.statLabel}>
        {item.label}
      </Text>
      <div className={styles.statValueRow}>
        <Text size={500} weight="semibold" className={styles.statValue}>
          {item.value}
        </Text>
        <Text size={200} className={styles.statLabel}>
          {item.unit}
        </Text>
      </div>
    </div>
  );

  const standButton = (
    <TouchButton
      appearance="primary"
      icon={standing ? <ArrowDownRegular /> : <ArrowUpRegular />}
      onClick={togglePosture}
      disabled={!settings.enabled}
      aria-label={standing ? '我坐下了' : '我站起来了'}
    >
      {standing ? '我坐下了' : '我站起来了'}
    </TouchButton>
  );

  /** 2×1 没有 Badge，用一句最短状态文案补位；坐着时显示提醒距离 */
  const rowHint = standing ? '休息中' : snapshot.hint;

  /* 提醒关闭：空态（identity 色由 EmptyState 的 accent 图标承担，避免两个绿 chip） */
  if (!settings.enabled) {
    const emptyAction = (
      <TouchButton
        appearance="primary"
        onClick={(event) => {
          event.stopPropagation();
          requestHostSettings();
        }}
      >
        打开设置
      </TouchButton>
    );
    if (compact || row) {
      return (
        <CardRoot
          ariaLabel={ariaLabel}
          onActivate={openDetail}
          className={mergeClasses(styles.root, styles.emptyCardCompact)}
        >
          <EmptyState
            icon={<PersonWalking24Regular />}
            iconAccent="green"
            title="提醒已关闭"
            action={emptyAction}
            style={{ padding: 0, gap: tokens.spacingVerticalXS }}
          />
        </CardRoot>
      );
    }
    return (
      <CardRoot
        ariaLabel={ariaLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.emptyCard)}
      >
        <EmptyState
          icon={<PersonWalking24Regular />}
          iconAccent="green"
          title="提醒已关闭"
          description="开启后按久坐时长提醒起身"
          action={emptyAction}
        />
      </CardRoot>
    );
  }

  if (compact) {
    return (
      <CardRoot
        ariaLabel={ariaLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.rootCompact)}
      >
        <CardIdentity
          className={styles.identityStart}
          icon={<PersonWalking16Regular />}
          accent="green"
          compact
        />
        {statusBadge}
        <Metric value={snapshot.currentMin} unit="分钟" size={48} />
      </CardRoot>
    );
  }

  if (row) {
    return (
      <CardRoot
        ariaLabel={ariaLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.rootRow)}
      >
        <CardIdentity
          icon={<PersonWalking16Regular />}
          label="久坐"
          accent="green"
          trailing={
            <span className={styles.trailingHint}>
              <span
                className={styles.statusDot}
                style={{ backgroundColor: STATUS_DOT_COLOR[snapshot.status] }}
                aria-hidden="true"
              />
              {rowHint ? (
                <Text size={300} className={styles.hint} style={motionStyle}>
                  {rowHint}
                </Text>
              ) : null}
            </span>
          }
        />
        <div className={styles.rowBody}>
          <Metric value={snapshot.currentMin} unit="分钟" size={68} />
          {standButton}
        </div>
      </CardRoot>
    );
  }

  if (wide) {
    return (
      <CardRoot
        ariaLabel={ariaLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.rootWide)}
      >
        <CardIdentity
          icon={<PersonWalking16Regular />}
          label="久坐"
          accent="green"
          trailing={statusBadge}
        />
        <div className={styles.wideBody}>
          <div className={styles.wideMain}>
            <Metric value={snapshot.currentMin} unit="分钟" size={96} />
            {snapshot.hint ? (
              <Text size={300} className={styles.hint} style={motionStyle}>
                {snapshot.hint}
              </Text>
            ) : null}
          </div>
          <div className={styles.wideStats}>{stats.map(renderStat)}</div>
          <div className={styles.wideActions}>{standButton}</div>
        </div>
      </CardRoot>
    );
  }

  return (
    <CardRoot
      ariaLabel={ariaLabel}
      onActivate={openDetail}
      className={mergeClasses(styles.root, styles.rootMedium)}
    >
      <CardIdentity
        icon={<PersonWalking16Regular />}
        label="久坐"
        accent="green"
        trailing={statusBadge}
      />
      <Metric value={snapshot.currentMin} unit="分钟" size={80} />
      {snapshot.hint ? (
        <Text size={300} className={styles.hint} style={motionStyle}>
          {snapshot.hint}
        </Text>
      ) : null}
      <div className={styles.statsRow}>{stats.slice(0, 2).map(renderStat)}</div>
      <div className={styles.actions}>{standButton}</div>
    </CardRoot>
  );
}
