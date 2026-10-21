/**
 * 久坐提醒卡片（L0，docs/components/sedentary.md）。
 *
 * 状态机：坐着（sitting）↔ 站立（standing），手动切换（D-27）。
 *
 * 尺寸档位：
 * - 1×1：状态 Badge + 当前状态分钟（48）；无按钮，点卡体开详情；
 * - 2×1：分钟 68 + 状态点 + 提示文案 + 状态按钮 40；
 * - 2×2：分钟 80 + 两项统计（今日久坐/今日站立）+ 状态按钮；
 * - 3×2：分钟 96 + 三项统计（今日久坐/今日站立/起身次数）+ 状态按钮。
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
import { ArrowDownRegular, ArrowUpRegular } from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import { requestOverlay, useHostSize, useStoredConfig } from '../../_shared/host.js';
import { useMotionTransition } from '../../_shared/motion.js';
import {
  CardHeader,
  CardRoot,
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
  rootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  },
  rootMedium: {
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalM,
  },
  rootWide: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr) auto',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXL,
    rowGap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
  },
  rowMain: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  rowHead: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  hintRow: {
    display: 'flex',
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

  const postureText = standing ? '已站立' : '已连续久坐';
  const ariaLabel = settings.enabled
    ? `${snapshot.statusLabel}，${postureText} ${snapshot.currentMin} 分钟，${snapshot.hint}；点击打开详情${
        compact ? '' : standing ? '，也可以点“我坐下了”' : '，也可以点“我站起来了”'
      }`
    : '久坐提醒已关闭，点击打开详情';

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
      aria-label={standing ? '我坐下了，开始新一轮久坐' : '我站起来了，记录一次起身'}
    >
      {standing ? '我坐下了' : '我站起来了'}
    </TouchButton>
  );

  if (compact) {
    return (
      <CardRoot
        ariaLabel={ariaLabel}
        onActivate={openDetail}
        className={mergeClasses(styles.root, styles.rootCompact)}
      >
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
        <div className={styles.rowMain}>
          <div className={styles.rowHead}>
            <Metric value={snapshot.currentMin} unit="分钟" size={68} />
          </div>
          <div className={styles.hintRow}>
            <span
              className={styles.statusDot}
              style={{ backgroundColor: STATUS_DOT_COLOR[snapshot.status] }}
              aria-hidden="true"
            />
            <Text size={300} className={styles.hint} style={motionStyle}>
              {snapshot.hint}
            </Text>
          </div>
        </div>
        {standButton}
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
        <div className={styles.wideMain}>
          <CardHeader title={standing ? '站立休息' : '连续久坐'} trailing={statusBadge} />
          <Metric value={snapshot.currentMin} unit="分钟" size={96} />
          <Text size={300} className={styles.hint} style={motionStyle}>
            {snapshot.hint}
          </Text>
        </div>
        <div className={styles.wideStats}>{stats.map(renderStat)}</div>
        <div className={styles.wideActions}>{standButton}</div>
      </CardRoot>
    );
  }

  return (
    <CardRoot
      ariaLabel={ariaLabel}
      onActivate={openDetail}
      className={mergeClasses(styles.root, styles.rootMedium)}
    >
      <CardHeader title={standing ? '站立休息' : '连续久坐'} trailing={statusBadge} />
      <Metric value={snapshot.currentMin} unit="分钟" size={80} />
      <Text size={300} className={styles.hint} style={motionStyle}>
        {snapshot.hint}
      </Text>
      <div className={styles.statsRow}>{stats.slice(0, 2).map(renderStat)}</div>
      <div className={styles.actions}>{standButton}</div>
    </CardRoot>
  );
}
