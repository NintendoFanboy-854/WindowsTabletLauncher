/**
 * 久坐提醒卡片视图。
 *
 * 正常模式：状态 Badge + 当前连续分钟（Primary）+ 一句阈值提示（V-12 不重复数值）；
 * 2×2/3×2 再补 今日累计 / 起身次数 两项统计 +「我起来了」主操作；
 * 详情 / 设置走宿主全窗口浮层视图（requestOverlay/requestSettings），卡片内不弹 Dialog。
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

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    userSelect: 'none',
  },
  rootCompact: {
    alignItems: 'center',
    padding: tokens.spacingHorizontalS,
    cursor: 'pointer',
  },
  rootWide: {
    padding: tokens.spacingHorizontalL,
  },
  headline: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
    whiteSpace: 'nowrap',
  },
  number: {
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  unit: {
    color: tokens.colorNeutralForeground3,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  stats: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXL,
    minWidth: 0,
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalNone,
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
  wide: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalL,
    rowGap: tokens.spacingVerticalXS,
  },
  wideMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
});

function useLongPress(onLongPress) {
  const ref = useRef({ timer: 0, origin: null });
  const clear = useCallback(() => {
    window.clearTimeout(ref.current.timer);
    ref.current.timer = 0;
    ref.current.origin = null;
  }, []);
  useEffect(() => clear, [clear]);
  const onPointerDown = useCallback(
    (event) => {
      if (event.button !== 0) return;
      ref.current.origin = { x: event.clientX, y: event.clientY };
      ref.current.timer = window.setTimeout(() => onLongPress(), LONG_PRESS_MS);
    },
    [onLongPress],
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
  return { onPointerDown, onPointerMove, onPointerUp: clear, onPointerCancel: clear, onPointerLeave: clear };
}

export default function SedentaryApp({ fallbackSizeKey }) {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, fallbackSizeKey || DEFAULT_SIZE_KEY);
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const [snapshot, setSnapshot] = useState(() => describeState(DEFAULT_SETTINGS));
  const compact = sizeKey === '1x1';
  const wide = sizeKey === '3x2';
  const showStats = sizeKey === '2x2' || wide;
  const showButton = sizeKey !== '1x1' && sizeKey !== '2x1';

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

  const main = (
    <div className={styles.headline}>
      <Text className={styles.number} size={compact ? 900 : wide ? 800 : 700} weight="semibold">
        {snapshot.currentMin}
      </Text>
      <Text className={styles.unit} size={compact ? 300 : 200}>
        分钟
      </Text>
    </div>
  );

  const badge = (
    <Badge
      appearance="tint"
      color={BADGE_COLOR[snapshot.status] ?? 'informative'}
      size="large"
      aria-label={`状态：${snapshot.statusLabel}`}
    >
      {snapshot.statusLabel}
    </Badge>
  );

  const stats = showStats && (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <Text className={styles.statLabel} size={200}>
          今日久坐
        </Text>
        <Text className={styles.statValue} size={300} weight="semibold">
          {Math.round(snapshot.today.sittingMinutes)} 分钟
        </Text>
      </div>
      <div className={styles.stat}>
        <Text className={styles.statLabel} size={200}>
          起身次数
        </Text>
        <Text className={styles.statValue} size={300} weight="semibold">
          {snapshot.today.breaks} 次
        </Text>
      </div>
    </div>
  );

  const actions = showButton && (
    <div className={styles.actions}>
      {settings.enabled ? (
        <Button
          appearance="primary"
          size="large"
          icon={<Checkmark20Regular />}
          onClick={breakNow}
        >
          我起来了
        </Button>
      ) : (
        <Button appearance="primary" size="large" onClick={() => requestSettings('久坐提醒设置')}>
          启用久坐提醒
        </Button>
      )}
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
    </div>
  );

  if (wide) {
    return (
      <div
        className={mergeClasses(styles.root, styles.rootWide)}
        role="group"
        aria-label="久坐提醒"
        onPointerDown={press.onPointerDown}
        onPointerMove={press.onPointerMove}
        onPointerUp={press.onPointerUp}
        onPointerCancel={press.onPointerCancel}
        onPointerLeave={press.onPointerLeave}
        onContextMenu={(event) => {
          event.preventDefault();
          requestSettings('久坐提醒设置');
        }}
      >
        <div className={styles.wide}>
          <div className={styles.wideMain}>
            <div style={{ display: 'flex', gap: tokens.spacingHorizontalS, alignItems: 'center' }}>
              {badge}
              {main}
            </div>
            <Text className={styles.hint} size={300}>
              {snapshot.hint}
            </Text>
          </div>
          {stats}
          {actions}
        </div>
      </div>
    );
  }

  if (showStats) {
    return (
      <div
        className={styles.root}
        role="group"
        aria-label="久坐提醒"
        onPointerDown={press.onPointerDown}
        onPointerMove={press.onPointerMove}
        onPointerUp={press.onPointerUp}
        onPointerCancel={press.onPointerCancel}
        onPointerLeave={press.onPointerLeave}
        onContextMenu={(event) => {
          event.preventDefault();
          requestSettings('久坐提醒设置');
        }}
      >
        <div style={{ display: 'flex', gap: tokens.spacingHorizontalS, alignItems: 'center' }}>
          {badge}
          {main}
        </div>
        <Text className={styles.hint} size={300}>
          {snapshot.hint}
        </Text>
        {stats}
        {actions}
      </div>
    );
  }

  return (
    <div
      className={mergeClasses(styles.root, styles.rootCompact)}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={() => {
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
      onPointerDown={press.onPointerDown}
      onPointerMove={press.onPointerMove}
      onPointerUp={press.onPointerUp}
      onPointerCancel={press.onPointerCancel}
      onPointerLeave={press.onPointerLeave}
      onContextMenu={(event) => {
        event.preventDefault();
        requestSettings('久坐提醒设置');
      }}
    >
      {badge}
      {main}
      {!compact && (
        <Text className={styles.hint} size={200}>
          {snapshot.hint}
        </Text>
      )}
    </div>
  );
}
