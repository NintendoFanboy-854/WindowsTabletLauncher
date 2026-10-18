/**
 * 番茄钟卡片视图。
 *
 * 正常模式：大号剩余时间（Primary）+ 阶段 + 当前任务（1 行）+ 主按钮（开始/暂停）；
 * 跳过 / 重置 / 沉浸 / 详情 / 设置在 ⋯ Menu 或详情/设置浮层里（D-02b / DENSITY）。
 * 1×1、2×1 也有可用的主操作：1×1 点击卡片切换，2×1 额外给 40px 主按钮。
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  Badge,
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  ProgressBar,
  Text,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowNext20Regular,
  ArrowReset20Regular,
  Dismiss20Regular,
  FullScreenMaximize20Regular,
  MoreHorizontal20Regular,
  Pause20Filled,
  Play20Filled,
  Stop20Filled,
} from '@fluentui/react-icons';
import {
  requestOverlay,
  requestSettings,
  useAgentTools,
  useHostSize,
  useSettingsRequest,
  useStoredConfig,
} from '../../_shared/host.js';
import { DEFAULT_SIZE_KEY, sizeKeyOf } from './sizes.js';
import {
  DEFAULT_SETTINGS,
  PHASES,
  SETTINGS_KEY,
  getEngine,
  normalizeSettings,
} from './data/timer.js';

const LONG_PRESS_MS = 500;

const PHASE_COLOR = {
  focus: tokens.colorBrandForeground1,
  shortBreak: tokens.colorStatusSuccessForeground1,
  longBreak: tokens.colorStatusInfoForeground1,
};

const useStyles = makeStyles({
  root: {
    position: 'relative',
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
    gap: tokens.spacingVerticalXXS,
    cursor: 'pointer',
  },
  rootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalM,
  },
  rootWide: {
    padding: tokens.spacingHorizontalL,
    gap: tokens.spacingVerticalS,
  },
  time: {
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  phase: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  task: {
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flex: '0 0 auto',
  },
  wide: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXL,
    rowGap: tokens.spacingVerticalS,
  },
  wideMain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  wideSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  progress: {
    width: '100%',
  },
  immersive: {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground1,
    textAlign: 'center',
  },
  immersiveTime: {
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  immersiveActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  immersiveClose: {
    position: 'absolute',
    top: tokens.spacingVerticalS,
    right: tokens.spacingHorizontalS,
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
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8) clear();
    },
    [clear],
  );
  return { onPointerDown, onPointerMove, onPointerUp: clear, onPointerCancel: clear, onPointerLeave: clear };
}

export default function PomodoroApp({ fallbackSizeKey }) {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, fallbackSizeKey || DEFAULT_SIZE_KEY);
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const engine = getEngine();
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  const [immersive, setImmersive] = useState(
    () => new URLSearchParams(location.search).get('immersive') === '1',
  );
  const engineRef = useRef(engine);
  engineRef.current = engine;

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

  useSettingsRequest(() => requestSettings('番茄钟设置'));

  const toggle = useCallback(() => engine.toggle(), [engine]);
  const openDetail = useCallback(() => requestOverlay('detail', '专注详情'), []);
  const openSettings = useCallback(() => requestSettings('番茄钟设置'), []);
  const press = useLongPress(openSettings);

  useAgentTools(
    [
      {
        name: 'pomodoro.start',
        description: '开始或继续一轮专注',
        parameters: {
          type: 'object',
          properties: {
            minutes: { type: 'number', description: '本轮专注分钟数，省略用设置里的 focusMin' },
            taskId: { type: 'string', description: '关联的待办任务 id' },
            taskTitle: { type: 'string', description: '关联任务标题（仅展示用）' },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'pomodoro.pause',
        description: '暂停当前一轮',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
      {
        name: 'pomodoro.resume',
        description: '继续当前一轮',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
      {
        name: 'pomodoro.stop',
        description: '停止当前一轮并落库本次记录',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
      {
        name: 'pomodoro.skip',
        description: '跳过当前阶段',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
      {
        name: 'pomodoro.status',
        description: '读取阶段、剩余秒数、任务与今日统计',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
      {
        name: 'pomodoro.stats',
        description: '读取完成数、专注分钟与连续天数',
        parameters: {
          type: 'object',
          properties: {
            range: { type: 'string', enum: ['today', 'week', 'month'], description: '统计范围，默认 today' },
          },
          additionalProperties: false,
        },
      },
    ],
    {
      'pomodoro.start': (args) => engineRef.current.start(args),
      'pomodoro.pause': () => {
        engineRef.current.pause();
        return engineRef.current.status();
      },
      'pomodoro.resume': () => engineRef.current.start(),
      'pomodoro.stop': () => ({ session: engineRef.current.stop(), status: engineRef.current.status() }),
      'pomodoro.skip': () => {
        engineRef.current.skip();
        return engineRef.current.status();
      },
      'pomodoro.status': () => engineRef.current.status(),
      'pomodoro.stats': (args) => engineRef.current.stats(args?.range),
    },
  );

  const toggleLabel = snapshot.running ? '暂停' : snapshot.phase !== 'focus' || snapshot.progress > 0 ? '继续' : '开始';

  const toggleButton = (withLabel) => (
    <Tooltip content={snapshot.running ? '暂停' : '开始 / 继续'} relationship="label">
      <Button
        appearance="primary"
        size="large"
        icon={snapshot.running ? <Pause20Filled /> : <Play20Filled />}
        onClick={toggle}
        aria-label={snapshot.running ? '暂停' : '开始'}
      >
        {withLabel ? toggleLabel : null}
      </Button>
    </Tooltip>
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
          <MenuItem icon={<FullScreenMaximize20Regular />} onClick={() => setImmersive(true)}>
            沉浸模式
          </MenuItem>
          <MenuItem onClick={openDetail}>详情与统计</MenuItem>
          <MenuItem icon={<ArrowNext20Regular />} onClick={() => engine.skip()}>
            跳过本轮
          </MenuItem>
          <MenuItem icon={<ArrowReset20Regular />} onClick={() => engine.reset()}>
            重置
          </MenuItem>
          <MenuItem onClick={openSettings}>设置</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );

  const phaseBadge = (
    <Badge
      appearance="tint"
      size="large"
      style={{ color: PHASE_COLOR[snapshot.phase] }}
    >
      {snapshot.phaseLabel}
    </Badge>
  );

  const immersiveLayer = immersive && (
    <div className={styles.immersive} role="dialog" aria-modal="true" aria-label="沉浸模式">
      <Button
        className={styles.immersiveClose}
        appearance="subtle"
        size="large"
        icon={<Dismiss20Regular />}
        aria-label="退出沉浸模式"
        onClick={() => setImmersive(false)}
      />
      <Text size={400} style={{ color: PHASE_COLOR[snapshot.phase] }} weight="semibold">
        {snapshot.phaseLabel}
      </Text>
      <Text className={styles.immersiveTime} size={1000} weight="semibold">
        {snapshot.remainingText}
      </Text>
      {snapshot.taskTitle && (
        <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
          {snapshot.taskTitle}
        </Text>
      )}
      <div className={styles.immersiveActions}>
        <Button
          appearance="primary"
          size="large"
          icon={snapshot.running ? <Pause20Filled /> : <Play20Filled />}
          onClick={toggle}
        >
          {snapshot.running ? '暂停' : '继续'}
        </Button>
        <Button
          size="large"
          icon={<Stop20Filled />}
          onClick={() => {
            engine.stop();
            setImmersive(false);
          }}
        >
          结束本轮
        </Button>
      </div>
      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
        今日 {snapshot.today.completed} 个 · {snapshot.today.focusMinutes} 分钟
      </Text>
    </div>
  );

  const progressBar = (
    <ProgressBar
      className={styles.progress}
      value={snapshot.progress}
      max={1}
      thickness="medium"
      aria-label="本轮进度"
    />
  );

  if (wide) {
    return (
      <div
        className={mergeClasses(styles.root, styles.rootWide)}
        onPointerDown={press.onPointerDown}
        onPointerMove={press.onPointerMove}
        onPointerUp={press.onPointerUp}
        onPointerCancel={press.onPointerCancel}
        onPointerLeave={press.onPointerLeave}
        onContextMenu={(event) => {
          event.preventDefault();
          openSettings();
        }}
      >
        {progressBar}
        <div className={styles.wide}>
          <div className={styles.wideMain}>
            <div className={styles.timeRow}>
              {phaseBadge}
              <Text className={styles.time} size={1000} weight="semibold">
                {snapshot.remainingText}
              </Text>
            </div>
          </div>
          <div className={styles.wideSide}>
            <Text className={styles.task} size={300}>
              {snapshot.taskTitle ?? '未关联任务'}
            </Text>
            <div className={styles.actions}>
              {toggleButton(true)}
              {menu}
            </div>
          </div>
        </div>
        {immersiveLayer}
      </div>
    );
  }

  if (row) {
    return (
      <div
        className={mergeClasses(styles.root, styles.rootRow)}
        role="button"
        tabIndex={0}
        aria-label={`${snapshot.phaseLabel} ${snapshot.remainingText}，点击开始或暂停`}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        }}
        onPointerDown={press.onPointerDown}
        onPointerMove={press.onPointerMove}
        onPointerUp={press.onPointerUp}
        onPointerCancel={press.onPointerCancel}
        onPointerLeave={press.onPointerLeave}
        onContextMenu={(event) => {
          event.preventDefault();
          openSettings();
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: tokens.spacingVerticalXXS, minWidth: 0 }}>
          {phaseBadge}
          <Text className={styles.time} size={1000} weight="semibold">
            {snapshot.remainingText}
          </Text>
        </div>
        <div className={styles.actions} onClick={(event) => event.stopPropagation()}>
          {toggleButton(false)}
        </div>
        {immersiveLayer}
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={mergeClasses(styles.root, styles.rootCompact)}
        role="button"
        tabIndex={0}
        aria-label={`${snapshot.phaseLabel} ${snapshot.remainingText}，点击开始或暂停`}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        }}
        onPointerDown={press.onPointerDown}
        onPointerMove={press.onPointerMove}
        onPointerUp={press.onPointerUp}
        onPointerCancel={press.onPointerCancel}
        onPointerLeave={press.onPointerLeave}
        onContextMenu={(event) => {
          event.preventDefault();
          openSettings();
        }}
      >
        {progressBar}
        {phaseBadge}
        <Text className={styles.time} size={900} weight="semibold">
          {snapshot.remainingText}
        </Text>
        {immersiveLayer}
      </div>
    );
  }

  return (
    <div
      className={styles.root}
      onPointerDown={press.onPointerDown}
      onPointerMove={press.onPointerMove}
      onPointerUp={press.onPointerUp}
      onPointerCancel={press.onPointerCancel}
      onPointerLeave={press.onPointerLeave}
      onContextMenu={(event) => {
        event.preventDefault();
        openSettings();
      }}
    >
      {progressBar}
      <div className={styles.timeRow}>
        {phaseBadge}
        <Text className={styles.time} size={1000} weight="semibold">
          {snapshot.remainingText}
        </Text>
      </div>
      <Text className={styles.task} size={300}>
        {snapshot.taskTitle ?? '未关联任务'}
      </Text>
      <div className={styles.actions}>{toggleButton(true)}</div>
      {immersiveLayer}
    </div>
  );
}
