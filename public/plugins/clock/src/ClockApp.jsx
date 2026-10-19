/**
 * 时钟卡片（L0）：纯展示，主体点击 / Enter / Space 打开宿主详情浮层。
 *
 * 信息预算（docs/components/clock.md）：
 * - 1×1：只显示 HH:MM，Display XL 48（D-07）；
 * - 2×1：时间 68 + 秒 16 + 日期 16；
 * - 3×2：时间 112 + 秒 16 + 日期/星期 20。
 *
 * 长按 / 右键 / hover 由 CardRoot 内部的 useHostCardGesture 交给宿主；插件不写任何
 * 长按计时器、不提供设置入口、不在卡片上做 12/24h 切换（设置统一在宿主设置页）。
 */

import { useMemo } from 'react';
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';

import { requestOverlay, useAgentTools, useHostSize, useStoredConfig } from '../../_shared/host.js';
import { DISPLAY_WEIGHT, TABULAR_NUMS, displayXl } from '../../_shared/typography.js';
import { CardRoot, useNow } from '../../_shared/ui.jsx';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  formatDate,
  formatTime,
  normalizeSettings,
} from './settings.js';
import { CLOCK_TOOLS, createClockToolHandlers } from './tools.js';
import { useWorldClocks } from './world.js';
import { sizeKeyOf } from './sizes.js';

/** 秒级刷新；时间格式由设置决定，刷新频率保持一秒以便切到显示秒时立即对齐。 */
const TICK_INTERVAL = 1000;

const useStyles = makeStyles({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground1,
    textAlign: 'center',
    userSelect: 'none',
    cursor: 'pointer',
  },
  /** 1×1：padding 8（DENSITY §2.1） */
  rootCompact: {
    padding: tokens.spacingHorizontalS,
    gap: tokens.spacingVerticalXXS,
  },
  /** 2×1：8 纵 / 12 横 */
  rootRow: {
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalM,
    gap: tokens.spacingVerticalXS,
  },
  /** 3×2：12 纵 / 16 横，组间距 8 */
  rootLarge: {
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
    gap: tokens.spacingVerticalS,
  },
  timeRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  numeric: {
    ...TABULAR_NUMS,
    whiteSpace: 'nowrap',
  },
  time48: {
    ...displayXl(48),
    fontWeight: DISPLAY_WEIGHT,
    color: tokens.colorNeutralForeground1,
  },
  time68: {
    fontSize: tokens.fontSizeHero1000,
    lineHeight: tokens.lineHeightHero1000,
    fontWeight: DISPLAY_WEIGHT,
    color: tokens.colorNeutralForeground1,
  },
  time112: {
    ...displayXl(112),
    fontWeight: DISPLAY_WEIGHT,
    color: tokens.colorNeutralForeground1,
  },
  seconds: {
    color: tokens.colorNeutralForeground3,
  },
  meridiem: {
    color: tokens.colorNeutralForeground2,
  },
  date: {
    color: tokens.colorNeutralForeground2,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export default function ClockApp() {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, '2x1');
  const [settings, setSettings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const world = useWorldClocks();
  const now = useNow(TICK_INTERVAL);

  const compact = sizeKey === '1x1';
  const large = sizeKey === '3x2';

  const dateNow = new Date(now);
  const time = formatTime(dateNow, settings);
  const date = formatDate(dateNow, settings);
  const showSeconds = settings.showSeconds && !compact;

  const ariaLabel = useMemo(() => {
    const spoken = settings.hour12 ? `${time.main} ${time.meridiem}` : time.main;
    const seconds = showSeconds ? ` ${time.seconds} 秒` : '';
    const dateText = compact ? '' : `，${date.inline}`;
    return `当前时间 ${spoken}${seconds}${dateText}，点击打开时钟详情`;
  }, [compact, date.inline, settings.hour12, showSeconds, time.main, time.meridiem, time.seconds]);

  // Agent 对等：卡片 iframe 常驻桌面，工具只在这里注册一次；UI 与工具共用同一数据层。
  useAgentTools(
    CLOCK_TOOLS,
    createClockToolHandlers({ settings, setSettings, world }),
  );

  return (
    <CardRoot
      ariaLabel={ariaLabel}
      onActivate={() => requestOverlay('detail', '时钟详情')}
      className={mergeClasses(
        styles.root,
        compact && styles.rootCompact,
        !compact && !large && styles.rootRow,
        large && styles.rootLarge,
      )}
      data-clock-root="true"
      data-clock-size={sizeKey}
    >
      <div className={styles.timeRow}>
        <span
          data-clock-time="true"
          className={mergeClasses(
            styles.numeric,
            compact ? styles.time48 : large ? styles.time112 : styles.time68,
          )}
        >
          {time.main}
        </span>
        {showSeconds ? (
          <Text
            data-clock-seconds="true"
            size={400}
            className={mergeClasses(styles.numeric, styles.seconds)}
          >
            {time.seconds}
          </Text>
        ) : null}
        {settings.hour12 ? (
          <Text
            data-clock-meridiem="true"
            size={compact ? 200 : 300}
            className={styles.meridiem}
          >
            {time.meridiem}
          </Text>
        ) : null}
      </div>
      {!compact ? (
        <Text
          data-clock-date="true"
          size={large ? 500 : 400}
          className={styles.date}
        >
          {large ? `${date.date} ${date.weekday}` : date.date}
        </Text>
      ) : null}
    </CardRoot>
  );
}
