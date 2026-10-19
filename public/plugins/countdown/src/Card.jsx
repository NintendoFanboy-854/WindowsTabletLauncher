/**
 * 倒数日卡片（L0）。
 *
 * 纯展示：不提供快捷写操作、设置、加号或行级入口；点击卡片任意位置打开 L1，
 * 长按 / hover / 右键一律交给宿主的 CardRoot 手势。
 *
 * 尺寸档位（docs/components/countdown.md）：
 * - 1×1：最近一条事件的天数 + 标题；
 * - 2×1：一条事件的标题、日期与天数；
 * - 2×2：未来优先的列表（按行预算）；
 * - 3×2：同列表，多 1 行并显示事件总数。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { plugin } from '/plugin-sdk.js';
import { requestOverlay, useAgentTools, useHostSize } from '../../_shared/host.js';
import { CardRoot, ListRow, Metric, useNow } from '../../_shared/ui.jsx';
import { TABULAR_NUMS } from '../../_shared/typography.js';
import { DEFAULT_SIZE_KEY, sizeKeyOf } from './sizes.js';
import { usePluginConfig } from './data/config.js';
import {
  COLOR_OPTIONS,
  DEFAULT_SETTINGS,
  ITEMS_KEY,
  SETTINGS_KEY,
  displayText,
  normalizeItems,
  normalizeSettings,
  toDateString,
  toolAdd,
  toolList,
  toolRemove,
  toolSettingsGet,
  toolSettingsSet,
  toolUpdate,
  visibleEntries,
} from './data/items.js';

const AGENT_TOOLS = [
  {
    name: 'countdown.list',
    description: '列出倒数日事件（含剩余天数、目标日期与状态）',
    parameters: {
      type: 'object',
      properties: {
        includePast: { type: 'boolean', description: '是否包含已过去的事件，默认 true' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'countdown.add',
    description: '新增一条倒数日',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '事件标题' },
        targetDate: { type: 'string', description: '目标日期 YYYY-MM-DD' },
        repeatYearly: { type: 'boolean', description: '是否每年重复（生日/纪念日）' },
        color: {
          type: 'string',
          description: '事件状态色：accent / blue / green / orange / red / purple / teal',
          enum: COLOR_OPTIONS.map((color) => color.id),
        },
      },
      required: ['title', 'targetDate'],
      additionalProperties: false,
    },
  },
  {
    name: 'countdown.update',
    description: '修改一条倒数日的标题、日期、重复或颜色',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '倒数日 id' },
        title: { type: 'string', description: '新标题' },
        targetDate: { type: 'string', description: '新的目标日期 YYYY-MM-DD' },
        repeatYearly: { type: 'boolean', description: '是否每年重复' },
        color: {
          type: 'string',
          description: '事件状态色：accent / blue / green / orange / red / purple / teal',
          enum: COLOR_OPTIONS.map((color) => color.id),
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'countdown.remove',
    description: '按 id 删除一条倒数日',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string', description: '倒数日 id' } },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'countdown.settings.get',
    description: '读取倒数日的显示设置',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'countdown.settings.set',
    description: '修改倒数日的显示设置（至少提供 showPast 或 highlightSoon）',
    parameters: {
      type: 'object',
      properties: {
        showPast: { type: 'boolean', description: '是否显示已过去的事件' },
        highlightSoon: { type: 'boolean', description: '是否强调 7 天内的事件' },
      },
      additionalProperties: false,
    },
  },
];

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    color: tokens.colorNeutralForeground1,
  },
  /* 尺寸档 padding / gap 按 DENSITY §2.1 的映射 */
  pad1: {
    padding: tokens.spacingVerticalS,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    textAlign: 'center',
  },
  pad21: {
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalM,
    gap: tokens.spacingVerticalXS,
    justifyContent: 'center',
  },
  pad22: {
    padding: tokens.spacingVerticalM,
    gap: tokens.spacingVerticalS,
  },
  pad32: {
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
    gap: tokens.spacingVerticalS,
  },
  singleContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
    maxWidth: '100%',
  },
  singleTitle: {
    maxWidth: '100%',
    color: tokens.colorNeutralForeground2,
  },
  row21: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    width: '100%',
    minWidth: 0,
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    flex: '1 1 auto',
  },
  titleText: {
    color: tokens.colorNeutralForeground1,
  },
  subText: {
    minWidth: 0,
    color: tokens.colorNeutralForeground3,
  },
  metricRight: {
    flex: '0 0 auto',
    alignItems: 'flex-end',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minHeight: 0,
    overflow: 'hidden',
    flex: '0 1 auto',
  },
  daysRow: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXXS,
    whiteSpace: 'nowrap',
  },
  daysValue: {
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground1,
  },
  daysMuted: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  listFooter: {
    flexShrink: 0,
    textAlign: 'right',
    color: tokens.colorNeutralForeground3,
  },
  emptyText: {
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

/** iframe 视口 = 卡片本身，用它把高度换算成行预算 */
function useViewportHeight() {
  const [height, setHeight] = useState(() =>
    typeof window === 'undefined' ? 0 : window.innerHeight,
  );
  useEffect(() => {
    const update = () => setHeight(window.innerHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return height;
}

function primaryTextOf(entry) {
  if (entry.status === 'today') return '今天';
  return String(Math.abs(entry.days));
}

function primaryUnitOf(entry) {
  if (entry.status === 'today') return '';
  return entry.status === 'past' ? '天前' : '天';
}

/** 卡片列表行尾的天数：未来「还有 N 天」、今天「今天」、过去「已过 N 天」 */
function CardDays({ entry, large }) {
  const styles = useStyles();
  const size = large ? 500 : 400;
  if (entry.status === 'past') {
    return (
      <Text size={300} className={styles.daysMuted}>
        已过 {Math.abs(entry.days)} 天
      </Text>
    );
  }
  if (entry.status === 'today') {
    return (
      <Text size={size} weight="semibold">
        今天
      </Text>
    );
  }
  return (
    <span className={styles.daysRow}>
      <Text size={200} className={styles.daysMuted}>
        还有
      </Text>
      <Text size={size} weight="semibold" className={styles.daysValue}>
        {entry.days}
      </Text>
      <Text size={200} className={styles.daysMuted}>
        天
      </Text>
    </span>
  );
}

export default function CountdownCard({ fallbackSizeKey }) {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, fallbackSizeKey || DEFAULT_SIZE_KEY);
  const viewportHeight = useViewportHeight();
  const now = useNow(60000);
  const today = useMemo(() => new Date(now), [now]);

  const [items, setItems, itemsLoaded] = usePluginConfig(ITEMS_KEY, [], normalizeItems);
  const [settings, setSettings] = usePluginConfig(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
    normalizeSettings,
  );

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const writeItems = useCallback(
    (next) => {
      itemsRef.current = next;
      setItems(next);
    },
    [setItems],
  );
  const writeSettings = useCallback(
    (next) => {
      settingsRef.current = next;
      setSettings(next);
    },
    [setSettings],
  );

  const allEntries = useMemo(
    () => visibleEntries(items, settings, today),
    [items, settings, today],
  );

  // Agent 工具与 UI 共用同一组数据操作；工具声明只在卡片视图注册一次。
  useAgentTools(AGENT_TOOLS, {
    'countdown.list': (args) => toolList(itemsRef.current, args),
    'countdown.add': (args) => {
      const { nextItems, result } = toolAdd(itemsRef.current, args);
      writeItems(nextItems);
      return result;
    },
    'countdown.update': (args) => {
      const { nextItems, result } = toolUpdate(itemsRef.current, args);
      writeItems(nextItems);
      return result;
    },
    'countdown.remove': (args) => {
      const { nextItems, result } = toolRemove(itemsRef.current, args);
      writeItems(nextItems);
      return result;
    },
    'countdown.settings.get': () => toolSettingsGet(settingsRef.current),
    'countdown.settings.set': (args) => {
      const { nextSettings, result } = toolSettingsSet(settingsRef.current, args);
      writeSettings(nextSettings);
      return result;
    },
  });

  // 到日提醒：当天有事件时提醒一次（每个事件每个本地日期最多一次，DECISIONS D-12）
  useEffect(() => {
    if (!itemsLoaded) return;
    const todayKey = toDateString(new Date(now));
    for (const entry of allEntries) {
      if (entry.status !== 'today') continue;
      const remindKey = `countdown.reminded:${entry.item.id}:${todayKey}`;
      try {
        if (localStorage.getItem(remindKey)) continue;
        localStorage.setItem(remindKey, '1');
      } catch {
        /* localStorage 不可写时仍然发一次通知 */
      }
      plugin.notify(`今天是「${entry.item.title}」`);
    }
  }, [allEntries, itemsLoaded, now]);

  const openDetail = useCallback(() => requestOverlay('detail', '全部事件'), []);
  const near = allEntries[0];
  const compact = sizeKey === '1x1';
  const row = sizeKey === '2x1';
  const wide = sizeKey === '3x2';

  const rootClass = mergeClasses(
    styles.root,
    compact
      ? styles.pad1
      : row
        ? styles.pad21
        : wide
          ? styles.pad32
          : styles.pad22,
  );

  if (!itemsLoaded) {
    return <CardRoot ariaLabel="倒数日，正在加载" onActivate={openDetail} className={rootClass} />;
  }

  if (!allEntries.length) {
    return (
      <CardRoot
        ariaLabel="倒数日：还没有倒数日，点击打开详情添加"
        onActivate={openDetail}
        className={rootClass}
      >
        <Text size={300} className={styles.emptyText}>
          还没有倒数日
        </Text>
      </CardRoot>
    );
  }

  const ariaLabel =
    compact || row
      ? `倒数日：${near.item.title}，${displayText(near)}；点击打开详情`
      : `倒数日：共 ${allEntries.length} 项，最近 ${near.item.title}，${displayText(near)}；点击打开详情`;

  if (compact) {
    return (
      <CardRoot ariaLabel={ariaLabel} onActivate={openDetail} className={rootClass}>
        <div className={styles.singleContent}>
          <Metric
            value={primaryTextOf(near)}
            unit={primaryUnitOf(near)}
            size={48}
          />
          <Text size={300} truncate className={styles.singleTitle}>
            {near.item.title}
          </Text>
        </div>
      </CardRoot>
    );
  }

  if (row) {
    return (
      <CardRoot ariaLabel={ariaLabel} onActivate={openDetail} className={rootClass}>
        <div className={styles.row21}>
          <div className={styles.titleBlock}>
            <Text size={400} weight="semibold" truncate className={styles.titleText}>
              {near.item.title}
            </Text>
            <Text size={200} truncate className={styles.subText}>
              {near.subtitle}
            </Text>
          </div>
          <Metric
            className={styles.metricRight}
            value={primaryTextOf(near)}
            unit={primaryUnitOf(near)}
            size={48}
          />
        </div>
      </CardRoot>
    );
  }

  // 2×2 / 3×2：按 iframe 高度计算能完整放下的行数，避免静默裁切。
  const verticalPadding = 12;
  // 底部统计/剩余提示放在列表内部，和行共用 4px gap；这里预留 16px 文本高度。
  const footerHeight = 16;
  const available = Math.max(44, viewportHeight - verticalPadding * 2);
  const maxRows = wide ? 6 : 5;
  const rowCount = Math.max(
    1,
    Math.min(maxRows, Math.floor((available - footerHeight) / 48)),
  );
  const visibleRows = allEntries.slice(0, rowCount);
  const hiddenCount = allEntries.length - visibleRows.length;
  const footerText = wide
    ? hiddenCount > 0
      ? `共 ${allEntries.length} 项 · 还有 ${hiddenCount} 项`
      : `共 ${allEntries.length} 项`
    : hiddenCount > 0
      ? `还有 ${hiddenCount} 项`
      : '';

  return (
    <CardRoot ariaLabel={ariaLabel} onActivate={openDetail} className={rootClass}>
      <div className={styles.list}>
        {visibleRows.map((entry) => (
          <ListRow
            key={entry.item.id}
            title={entry.item.title}
            titleSize={wide ? 400 : 300}
            trailing={<CardDays entry={entry} large={wide} />}
          />
        ))}
        {footerText ? (
          <Text size={200} className={styles.listFooter}>
            {footerText}
          </Text>
        ) : null}
      </div>
    </CardRoot>
  );
}
