/**
 * 时钟卡片视图（正常模式没有任何操作 chrome，DECISIONS D-02b / DENSITY 规则）。
 *
 * - 1×1：只显示 HH:MM，Display XL 48（D-07），秒/日期按规格砍掉
 * - 2×1：时间 Fluent Display 68 + 秒 16 + 日期 16
 * - 3×2：墙钟 hero：时间 Display XL 112 + 秒 16 + 日期/星期 20
 * - 点击卡片切换 12 / 24 小时制；长按 / 右键菜单打开设置（宿主全窗口浮层）
 *
 * 文本字号用 Fluent Text 的 size/weight；数字主信息用项目 Display XL（D-07，
 * `_shared/typography.js`），不在组件里裸写任意 px。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { plugin } from '/plugin-sdk.js';
import {
  requestSettings,
  useAgentTools,
  useHostSize,
  useSettingsRequest,
  useStoredConfig,
} from '../../_shared/host.js';
import { displayXl, TABULAR_NUMS } from '../../_shared/typography.js';
import { sizeKeyOf } from './sizes.js';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  describeTime,
  formatDate,
  formatTime,
  normalizeSettings,
} from './settings.js';

const LONG_PRESS_MS = 500; // 交互阈值（不是动效时长，DESIGN.md §1.2）
const LONG_PRESS_MOVE_TOLERANCE = 8;
const TAP_TOGGLE_HINT = '点击切换 12 / 24 小时制，长按打开设置';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
    overflow: 'hidden',
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: `-${tokens.strokeWidthThick}`,
    },
  },
  /** 1×1：padding 8（DENSITY §2.1 尺寸档） */
  rootCompact: {
    padding: tokens.spacingHorizontalS,
    gap: tokens.spacingVerticalXXS,
  },
  /** 2×1：8 纵 / 12 横 */
  rootRow: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    gap: tokens.spacingVerticalXS,
  },
  /** 3×2：12 纵 / 16 横，时间与日期之间 12 */
  rootLarge: {
    gap: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
  },
  timeRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXXS,
    lineHeight: 0,
  },
  numeric: {
    ...TABULAR_NUMS,
  },
  /** 1×1 数字主信息：Display XL 48（D-07） */
  timeXl48: {
    ...displayXl(48),
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  /** 3×2 数字主信息：Display XL 112（D-07） */
  timeXl112: {
    ...displayXl(112),
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  /** 2×1 用 Fluent Display 68，行高用 token（不再 lineHeight:1） */
  time68: {
    fontSize: tokens.fontSizeHero1000,
    lineHeight: tokens.lineHeightHero1000,
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  seconds: {
    color: tokens.colorNeutralForeground3,
  },
  meridiem: {
    color: tokens.colorNeutralForeground2,
  },
  meta: {
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
});

export default function ClockApp() {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, '2x1');
  const [settings, setSettings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const [now, setNow] = useState(() => new Date());
  const rootRef = useRef(null);

  const compact = sizeKey === '1x1';
  const large = sizeKey === '3x2';

  /* 秒级刷新：对齐到整秒，避免累积漂移 */
  useEffect(() => {
    let timer = 0;
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 10);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);

  /* 宿主把键盘焦点交进来时，落到卡片根上 */
  useEffect(() => plugin.onFocus(() => rootRef.current?.focus({ preventScroll: true })), []);

  /* 编辑模式点「设置」：宿主发 host:open-settings，改成请求全窗口设置浮层 */
  useSettingsRequest(() => requestSettings());

  const time = formatTime(now, settings);
  const date = formatDate(now, settings);
  const showSeconds = settings.showSeconds && !compact;

  const ariaLabel = useMemo(() => {
    const spoken = settings.hour12 ? `${time.main} ${time.meridiem}` : time.main;
    return `当前时间 ${spoken}，${date.inline}，${TAP_TOGGLE_HINT}`;
  }, [date.inline, settings.hour12, time.main, time.meridiem]);

  const toggleHour12 = useCallback(() => {
    setSettings((previous) => ({ ...previous, hour12: !previous.hour12 }));
  }, [setSettings]);

  /* 长按打开设置 / 轻点切换小时制（与旧版交互一致） */
  const pressRef = useRef({ timer: 0, origin: null, suppressClick: false });
  const clearPress = useCallback(() => {
    window.clearTimeout(pressRef.current.timer);
    pressRef.current.timer = 0;
    pressRef.current.origin = null;
  }, []);
  useEffect(() => clearPress, [clearPress]);

  const onPointerDown = useCallback((event) => {
    if (event.button !== 0) return;
    pressRef.current.origin = { x: event.clientX, y: event.clientY };
    pressRef.current.timer = window.setTimeout(() => {
      pressRef.current.suppressClick = true;
      requestSettings();
    }, LONG_PRESS_MS);
  }, []);
  const onPointerMove = useCallback(
    (event) => {
      const origin = pressRef.current.origin;
      if (!origin) return;
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > LONG_PRESS_MOVE_TOLERANCE) {
        clearPress();
      }
    },
    [clearPress],
  );
  const onClick = useCallback(() => {
    if (pressRef.current.suppressClick) {
      pressRef.current.suppressClick = false;
      return;
    }
    toggleHour12();
  }, [toggleHour12]);
  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleHour12();
      } else if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
        event.preventDefault();
        requestSettings();
      }
    },
    [toggleHour12],
  );

  /* Agent 工具：clock.now（只读） */
  useAgentTools(
    [
      {
        name: 'clock.now',
        description: '读取系统当前时间与日期（只读，不修改任何配置）',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
    ],
    { 'clock.now': () => describeTime(new Date(), settings, sizeKey) },
  );

  return (
    <div
      ref={rootRef}
      className={mergeClasses(
        styles.root,
        compact && styles.rootCompact,
        sizeKey === '2x1' && styles.rootRow,
        large && styles.rootLarge,
      )}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onPointerLeave={clearPress}
      onContextMenu={(event) => {
        event.preventDefault();
        requestSettings();
      }}
    >
      <div className={styles.timeRow}>
        {compact && (
          <span className={mergeClasses(styles.numeric, styles.timeXl48)}>{time.main}</span>
        )}
        {large && (
          <span className={mergeClasses(styles.numeric, styles.timeXl112)}>{time.main}</span>
        )}
        {!compact && !large && <span className={mergeClasses(styles.numeric, styles.time68)}>{time.main}</span>}
        {showSeconds && (
          <Text className={mergeClasses(styles.numeric, styles.seconds)} size={400}>
            {time.seconds}
          </Text>
        )}
        {settings.hour12 && (
          <Text className={styles.meridiem} size={400}>
            {time.meridiem}
          </Text>
        )}
      </div>
      {!compact && (
        <Text className={styles.meta} size={large ? 500 : 400}>
          {large ? `${date.date} · ${date.weekday}` : date.inline}
        </Text>
      )}
    </div>
  );
}
