/**
 * 久坐提醒卡片视图（UI 重写 v2，docs/UI-REWRITE-SPEC.md §3.4）。
 *
 * 主数字随尺寸单调不减：
 * - 1×1：分钟 XL-48 + 单位 16 T + Badge 14
 * - 2×1：分钟 68（Hero1000）+ 单位 16 + hint 14 T + 40px「我起来了」按钮
 * - 2×2：分钟 XL-80 + 2 统计（值 20 / 标签 12）+ 40px 按钮 + Badge 14
 * - 3×2：分钟 XL-96 + hint 16 + 3 统计（值 24 / 标签 12）+ 40px 按钮（三栏）
 *
 * 数字走 _shared/typography.js 的 displayXl()；文本只走 Fluent Text size；删除 lineHeight:1。
 * 详情/设置仍走 ?view=detail|settings 宿主全窗口浮层；background 引擎与 Agent 工具不变。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { Checkmark20Regular, MoreHorizontal20Regular } from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import {
  requestOverlay,
  requestSettings,
  useHostSize,
  useSettingsRequest,
  useStoredConfig,
} from '../../_shared/host.js';
import { displayXl, TABULAR_NUMS } from '../../_shared/typography.js';
import { DEFAULT_SIZE_KEY, sizeKeyOf } from './sizes.js';
import {
  DAYS_KEY,
  DEFAULT_SETTINGS,
  RUNTIME_KEY,
  SETTINGS_KEY,
  describeState,
  getEngine,
  normalizeSettings,
  sendBreakCommand,
} from './data/engine.js';

const LONG_PRESS_MS = 500; // 交互阈值（不是动效时长，DESIGN.md）
const LONG_PRESS_MOVE_TOLERANCE = 8;

const BADGE_COLOR = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  quiet: 'informative',
  off: 'subtle',
};

const XL_48 = displayXl(48);
const XL_80 = displayXl(80);
const XL_96 = displayXl(96);

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    userSelect: 'none',
  },
  root1: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalS,
    cursor: 'pointer',
  },
  root21: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  },
  root22: {
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalM,
    justifyContent: 'space-between',
  },
  root32: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr) auto',
    alignItems: 'stretch',
    columnGap: tokens.spacingHorizontalXL,
    rowGap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
  },
  /* ---- 数字主信息（D-07 Display XL / Hero1000） ---- */
  number48: {
    ...XL_48,
    ...TABULAR_NUMS,
    fontWeight: tokens.fontWeightSemibold,
  },
  number80: {
    ...XL_80,
    ...TABULAR_NUMS,
    fontWeight: tokens.fontWeightSemibold,
  },
  number96: {
    ...XL_96,
    ...TABULAR_NUMS,
    fontWeight: tokens.fontWeightSemibold,
  },
  number: {
    ...TABULAR_NUMS,
    fontWeight: tokens.fontWeightSemibold,
    whiteSpace: 'nowrap',
  },
  headline: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
    whiteSpace: 'nowrap',
  },
  unit: {
    color: tokens.colorNeutralForeground3,
  },
  /* ---- 状态 / 提示 / 统计 ---- */
  badge: {
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    alignSelf: 'flex-start',
  },
  hint: {
    maxWidth: '100%',
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  mainBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  mainBlockCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  statsRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXL,
    minWidth: 0,
  },
  statsColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  statLabel: {
    color: tokens.colorNeutralForeground3,
  },
  statValue: {
    color: tokens.colorNeutralForeground2,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flex: '0 0 auto',
  },
  actionsColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    flex: '0 0 auto',
  },
  rowMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
    flex: '1 1 auto',
  },
});

function useLongPress(onLongPress) {
  const ref = useRef({ timer: 0, origin: null, suppressClick: false });
  const clear = useCallback(() => {
    window.clearTimeout(ref.current.timer);
    ref.current.timer = 0;
    ref.current.origin = null;
  }, []);
  useEffect(() => clear, [clear]);
  const onPointerDown = useCallback(
    (event) => {
      if (event.button !== 0) return;
      clear();
      ref.current.origin = { x: event.clientX, y: event.clientY };
      ref.current.timer = window.setTimeout(() => {
        ref.current.suppressClick = true;
        onLongPress();
      }, LONG_PRESS_MS);
    },
    [clear, onLongPress],
  );
  const onPointerMove = useCallback(
    (event) => {
      const origin = ref.current.origin;
      if (!origin) return;
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > LONG_PRESS_MOVE_TOLERANCE) {
        clear();
      }
    },
    [clear],
  );
  const consumeSuppressedClick = useCallback(() => {
    if (!ref.current.suppressClick) return false;
    ref.current.suppressClick = false;
    return true;
  }, []);
  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: clear,
    consumeSuppressedClick,
  };
}

export default function SedentaryApp({ fallbackSizeKey }) {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, fallbackSizeKey || DEFAULT_SIZE_KEY);
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const [snapshot, setSnapshot] = useState(() => describeState(DEFAULT_SETTINGS));
  const compact = sizeKey === '1x1';
  const row = sizeKey === '2x1';
  const wide = sizeKey === '3x2';
  const showStats = sizeKey === '2x2' || wide;
  const showButton = sizeKey !== '1x1';

  /* 独立开发：卡片视图自身也启动引擎，方便点击打卡后立刻看到反馈 */
  useEffect(() => {
    if (plugin.inHost) return undefined;
    const engine = getEngine();
    engine.start();
    return () => engine.stop();
  }, []);

  /* 状态来自 localStorage（后台引擎写入），storage 事件跨 iframe 同步 */
  useEffect(() => {
    const refresh = () => setSnapshot(describeState(settings));
    refresh();
    const timer = window.setInterval(refresh, 1000);
    const onStorage = (event) => {
      if (event.key === DAYS_KEY || event.key === RUNTIME_KEY || event.key === null) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', onStorage);
    };
  }, [settings]);

  useSettingsRequest(() => requestSettings('久坐提醒设置'));

  const openDetail = useCallback(() => requestOverlay('detail', '久坐详情'), []);
  const press = useLongPress(openDetail);

  const breakNow = useCallback(() => {
    if (!settings.enabled) return;
    sendBreakCommand();
  }, [settings.enabled]);

  const ariaLabel = `${snapshot.hint}，点击记录我起来了`;

  /* 卡片里的短提示（V-12：不重复主数值；过长会在 2×1/3×2 被裁切） */
  const hintText =
    snapshot.status === 'danger'
      ? '该起来动一动了'
      : snapshot.status === 'warning'
        ? '准备起身活动'
        : snapshot.hint;

  const badge = (
    <Badge
      appearance="tint"
      color={BADGE_COLOR[snapshot.status] ?? 'informative'}
      size="large"
      className={styles.badge}
      aria-label={`状态：${snapshot.statusLabel}`}
    >
      {snapshot.statusLabel}
    </Badge>
  );

  const statItems = [
    { key: 'sit', label: '今日久坐', value: `${Math.round(snapshot.today.sittingMinutes)} 分钟` },
    { key: 'break', label: '起身次数', value: `${snapshot.today.breaks} 次` },
    { key: 'longest', label: '最长连续', value: `${Math.round(snapshot.today.longestStreakMin)} 分钟` },
  ];

  const stat = (item, valueSize) => (
    <div key={item.key} className={styles.stat}>
      <Text className={styles.statLabel} size={200}>
        {item.label}
      </Text>
      <Text className={styles.statValue} size={valueSize} weight="semibold">
        {item.value}
      </Text>
    </div>
  );

  const breakButton = settings.enabled ? (
    <Button appearance="primary" size="large" icon={<Checkmark20Regular />} onClick={breakNow}>
      我起来了
    </Button>
  ) : (
    <Button appearance="primary" size="large" onClick={() => requestSettings('久坐提醒设置')}>
      启用久坐提醒
    </Button>
  );

  const menu = (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Tooltip content="更多操作" relationship="label">
          <Button
            appearance="subtle"
            size="large"
            icon={<MoreHorizontal20Regular />}
            aria-label="更多操作"
          />
        </Tooltip>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem onClick={openDetail}>详情与统计</MenuItem>
          <MenuItem onClick={() => requestSettings('久坐提醒设置')}>设置</MenuItem>
          {settings.enabled && <MenuItem onClick={breakNow}>我起来了</MenuItem>}
        </MenuList>
      </MenuPopover>
    </Menu>
  );

  const rootPressProps = {
    onPointerDown: press.onPointerDown,
    onPointerMove: press.onPointerMove,
    onPointerUp: press.onPointerUp,
    onPointerCancel: press.onPointerCancel,
    onPointerLeave: press.onPointerLeave,
    onContextMenu: (event) => {
      event.preventDefault();
      requestSettings('久坐提醒设置');
    },
  };

  /* ---- 3×2：左主区 1.2fr（Badge+分钟 96+单位 20+hint 16）/ 中统计 1fr（3 项）/ 右按钮 ---- */
  if (wide) {
    return (
      <div
        className={mergeClasses(styles.root, styles.root32)}
        role="group"
        aria-label="久坐提醒"
        {...rootPressProps}
      >
        <div className={styles.mainBlock}>
          {badge}
          <div className={styles.headline}>
            <Text className={styles.number96}>{snapshot.currentMin}</Text>
            <Text className={styles.unit} size={500}>
              分钟
            </Text>
          </div>
          <Text className={styles.hint} size={400}>
            {hintText}
          </Text>
        </div>
        <div className={styles.statsColumn}>{statItems.map((item) => stat(item, 600))}</div>
        <div className={styles.actionsColumn}>
          {breakButton}
          {menu}
        </div>
      </div>
    );
  }

  /* ---- 2×2：Badge+分钟 80；中 2 统计横排；下按钮 ---- */
  if (showStats) {
    return (
      <div
        className={mergeClasses(styles.root, styles.root22)}
        role="group"
        aria-label="久坐提醒"
        {...rootPressProps}
      >
        <div className={styles.mainBlockCenter}>
          {badge}
          <div className={styles.headline}>
            <Text className={styles.number80}>{snapshot.currentMin}</Text>
            <Text className={styles.unit} size={400}>
              分钟
            </Text>
          </div>
        </div>
        <div className={styles.statsRow}>{statItems.slice(0, 2).map((item) => stat(item, 500))}</div>
        <div className={styles.actions}>
          {breakButton}
          {menu}
        </div>
      </div>
    );
  }

  /* ---- 2×1：左主区（分钟 68+单位 16+hint 14），右 40px 打卡按钮 ---- */
  if (row) {
    return (
      <div
        className={mergeClasses(styles.root, styles.root21)}
        role="group"
        aria-label="久坐提醒"
        {...rootPressProps}
      >
        <div className={styles.rowMain}>
          <div className={styles.headline}>
            <Text className={styles.number} size={1000} weight="semibold">
              {snapshot.currentMin}
            </Text>
            <Text className={styles.unit} size={400}>
              分钟
            </Text>
          </div>
          <Text className={styles.hint} size={300}>
            {hintText}
          </Text>
        </div>
        <div className={styles.actions}>{breakButton}</div>
      </div>
    );
  }

  /* ---- 1×1：Badge 14 + 分钟 XL-48 + 单位 16，居中；点击打卡 ---- */
  return (
    <div
      className={mergeClasses(styles.root, styles.root1)}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={() => {
        if (press.consumeSuppressedClick()) return;
        if (settings.enabled) breakNow();
        else requestSettings('久坐提醒设置');
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (settings.enabled) breakNow();
          else requestSettings('久坐提醒设置');
        }
      }}
      {...rootPressProps}
    >
      {badge}
      <div className={styles.headline}>
        <Text className={styles.number48}>{snapshot.currentMin}</Text>
        <Text className={styles.unit} size={400}>
          分钟
        </Text>
      </div>
    </div>
  );
}


