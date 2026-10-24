/**
 * 倒数日卡片（L0）。
 *
 * 纯展示：不提供快捷写操作、设置、加号或行级入口；点击卡片任意位置打开 L1，
 * 长按 / hover / 右键一律交给宿主的 CardRoot 手势。
 *
 * 密度规则（wtsl-density-countdown-todo.md）：
 * - identity 行恒 24，hero 只出现在 featured 块（40/52），不再占 identity 行；
 * - 行高 44、行距 4，行数由可用高度唯一决定：
 *   A = Hc − 24 − 8 − (52 + 8)，N = min(cap, floor((A + 4) / 48))；
 * - 2×2 与 3×2 的 iframe 同为 328 高，所以行数同为 4；
 *   3×2 / 3×3 用多出的宽度在每行显示日期（不增行数）；
 * - 溢出不在卡内滚动：identity 行尾恒写 TrailingCount「共 X · 显示 Y」。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, makeStyles, tokens, webLightTheme } from '@fluentui/react-components';
import {
  Add20Regular,
  CalendarLtr20Regular,
  CalendarLtr24Regular,
  ChevronRight20Regular,
} from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import { requestOverlay, useAgentTools, useHostSize } from '../../_shared/host.js';
import {
  CardIdentity,
  CardRoot,
  CARD_GAP_PX,
  CARD_PADDING_PX,
  EmptyState,
  HERO_LINE_HEIGHT_PX,
  HeroText,
  ListRow,
  ListStack,
  LIST_ROW_GAP,
  LIST_ROW_PITCH,
  TouchButton,
  TrailingCount,
  useNow,
} from '../../_shared/ui.jsx';
import { TABULAR_NUMS } from '../../_shared/typography.js';
import { DEFAULT_SIZE_KEY, sizeKeyOf } from './sizes.js';
import { usePluginConfig } from './data/config.js';
import {
  DEFAULT_SETTINGS,
  ITEMS_KEY,
  SETTINGS_KEY,
  displayText,
  listEntries,
  normalizeItems,
  normalizeSettings,
  toDateString,
  toolAdd,
  toolList,
  toolRemove,
  toolSettingsGet,
  toolSettingsSet,
  toolUpdate,
} from './data/items.js';

/** Fluent spacingVerticalXXL(24)：identity 行高，JS 侧反推行数时使用 */
const IDENTITY_HEIGHT_PX = Number.parseFloat(webLightTheme.spacingVerticalXXL);

/** 各列表档的行数上限（D-04；行数本身仍由高度公式决定） */
const LIST_ROW_CAP = {
  '2x2': 4,
  '3x2': 4,
  '3x3': 8,
};

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
      },
      required: ['title', 'targetDate'],
      additionalProperties: false,
    },
  },
  {
    name: 'countdown.update',
    description: '修改一条倒数日的标题、日期或重复设置',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '倒数日 id' },
        title: { type: 'string', description: '新标题' },
        targetDate: { type: 'string', description: '新的目标日期 YYYY-MM-DD' },
        repeatYearly: { type: 'boolean', description: '是否每年重复' },
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
  /* padding / gap 由 CardRoot 唯一决定（16 / 8），插件不再按尺寸漂移 */
  identityRow: {
    alignSelf: 'stretch',
    minWidth: 0,
  },
  singleContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalXXS,
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
    gap: tokens.spacingHorizontalS,
    width: '100%',
    minWidth: 0,
    minHeight: tokens.lineHeightHero900,
  },
  featured: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    width: '100%',
    minWidth: 0,
    minHeight: tokens.lineHeightHero900,
  },
  featuredTitle: {
    flex: '1 1 auto',
    minWidth: 0,
    color: tokens.colorNeutralForeground1,
  },
  featuredDays: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXXS,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  /** 空态容器：水平左对齐；垂直居中由 EmptyState 自身负责。 */
  emptyShort: {
    flex: 1,
    minHeight: 0,
  },
  emptyFill: {
    flex: 1,
    minHeight: 0,
  },
  rowTrailing: {
    display: 'inline-flex',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  rowDate: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  daysRow: {
    display: 'inline-flex',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalXXS,
    whiteSpace: 'nowrap',
  },
  daysValue: {
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground1,
  },
  daysMuted: {
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  /** 「今天」不占 accent：中性前景 + 半粗，与「已过」的 fg3 区分 */
  daysToday: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
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

/**
 * 唯一行数公式：A = Hc − 24 − 8 − (52 + 8)，N = min(cap, floor((A + 4) / 48))。
 * `+4` 是最后一行下方不必再留行距；`Hc` 为 iframe 高减 CardRoot 上下 16。
 */
function rowBudgetFor(viewportHeight, cap) {
  const contentHeight = Math.max(0, viewportHeight - CARD_PADDING_PX * 2);
  const available = Math.max(
    0,
    contentHeight -
      IDENTITY_HEIGHT_PX -
      CARD_GAP_PX -
      (HERO_LINE_HEIGHT_PX + CARD_GAP_PX),
  );
  return Math.max(
    0,
    Math.min(cap, Math.floor((available + LIST_ROW_GAP) / LIST_ROW_PITCH)),
  );
}

/** featured 的主数字：今天用 accent，过去整块降级，未来数字用 fg1。 */
function FeaturedDays({ entry }) {
  const styles = useStyles();
  const isToday = entry.status === 'today';
  const isPast = entry.status === 'past';
  return (
    <span className={styles.featuredDays}>
      {isToday ? null : (
        <Text size={200} className={styles.daysMuted}>
          {isPast ? '已过' : '还有'}
        </Text>
      )}
      <HeroText
        className={isToday ? styles.daysToday : isPast ? styles.daysMuted : undefined}
      >
        {isToday ? '今天' : Math.abs(entry.days)}
      </HeroText>
      {isToday ? null : (
        <Text size={200} className={styles.daysMuted}>
          天
        </Text>
      )}
    </span>
  );
}

/** 列表行尾：前缀 12 fg3 + 数字 20 semibold + 单位 12 fg3，右缘成列。 */
function CardDays({ entry }) {
  const styles = useStyles();
  if (entry.status === 'today') {
    return (
      <Text size={400} weight="semibold" className={styles.daysToday}>
        今天
      </Text>
    );
  }
  const past = entry.status === 'past';
  return (
    <span className={styles.daysRow}>
      <Text size={200} className={styles.daysMuted}>
        {past ? '已过' : '还有'}
      </Text>
      <Text
        size={500}
        weight="semibold"
        className={past ? styles.daysMuted : styles.daysValue}
      >
        {Math.abs(entry.days)}
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

  const allEntries = useMemo(() => listEntries(items, today), [items, today]);
  const visible = useMemo(
    () => (settings.showPast ? allEntries : allEntries.filter((entry) => entry.days >= 0)),
    [allEntries, settings.showPast],
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
    for (const entry of visible) {
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
  }, [visible, itemsLoaded, now]);

  const openDetail = useCallback(() => requestOverlay('detail', '全部事件'), []);
  const near = visible[0];
  const compact = sizeKey === '1x1';
  const row = sizeKey === '2x1';
  const wide = sizeKey === '3x2' || sizeKey === '3x3';

  if (!itemsLoaded) {
    return <CardRoot ariaLabel="倒数日，正在加载" onActivate={openDetail} className={styles.root} />;
  }

  if (!visible.length) {
    const noData = items.length === 0;
    const shortCard = compact || row;
    const title = noData ? '还没有倒数日' : '没有未来事件';
    return (
      <CardRoot
        ariaLabel={`倒数日：${title}，点击打开详情`}
        onActivate={openDetail}
        className={styles.root}
      >
        {shortCard ? null : (
          <CardIdentity
            icon={<CalendarLtr20Regular />}
            label="倒数日"
            className={styles.identityRow}
            disclosure
          />
        )}
        {/*
          例外 E5（保留）：2×1 短卡走居中态（图标 / 标题 / 按钮整组居中），
          不跟内容轴左对齐。120 高里居中比左对齐稳；若左对齐，按钮会顶到右边界。
          三件套共用同一居中轴（E5 只要求中心共线，不要求盒左 = 内容轴）。
        */}
        <EmptyState
          align={shortCard ? 'center' : 'start'}
          compact={shortCard}
          icon={<CalendarLtr24Regular />}
          title={title}
          action={
            <TouchButton
              appearance="secondary"
              icon={noData ? <Add20Regular /> : <ChevronRight20Regular />}
              onClick={openDetail}
            >
              {noData ? '添加事件' : '查看全部'}
            </TouchButton>
          }
          className={shortCard ? styles.emptyShort : styles.emptyFill}
        />
      </CardRoot>
    );
  }

  const ariaLabel = `倒数日：${near.item.title}，${displayText(near)}；点击打开详情`;

  if (compact) {
    return (
      <CardRoot ariaLabel={ariaLabel} onActivate={openDetail} className={styles.root}>
        <CardIdentity
          icon={<CalendarLtr20Regular />}
          label="倒数日"
          compact
          className={styles.identityRow}
        />
        <div className={styles.singleContent}>
          <FeaturedDays entry={near} />
          <Text size={400} truncate className={styles.singleTitle}>
            {near.item.title}
          </Text>
        </div>
      </CardRoot>
    );
  }

  if (row) {
    return (
      <CardRoot ariaLabel={ariaLabel} onActivate={openDetail} className={styles.root}>
        <CardIdentity
          icon={<CalendarLtr20Regular />}
          label="倒数日"
          className={styles.identityRow}
          disclosure
          trailing={
            <Text size={200} truncate>
              {near.subtitle}
            </Text>
          }
        />
        <div className={styles.row21}>
          <Text size={400} weight="semibold" truncate className={styles.featuredTitle}>
            {near.item.title}
          </Text>
          <FeaturedDays entry={near} />
        </div>
      </CardRoot>
    );
  }

  // 2×2 / 3×2 / 3×3：identity 24 + featured 52 + N 行（44 / 4），溢出只写 identity trailing。
  const cap = LIST_ROW_CAP[sizeKey] ?? 4;
  const rowCount = rowBudgetFor(viewportHeight, cap);
  const shown = visible.slice(0, rowCount + 1);
  const rows = shown.slice(1);
  const listAria = `倒数日：共 ${visible.length} 项，显示 ${shown.length} 项，最近 ${near.item.title}，${displayText(near)}；点击打开详情`;

  return (
    <CardRoot ariaLabel={listAria} onActivate={openDetail} className={styles.root}>
      <CardIdentity
        icon={<CalendarLtr20Regular />}
        label="倒数日"
        className={styles.identityRow}
        disclosure
        trailing={<TrailingCount total={visible.length} shown={shown.length} />}
      />
      <div className={styles.featured}>
        <Text size={400} weight="semibold" truncate className={styles.featuredTitle}>
          {near.item.title}
        </Text>
        <FeaturedDays entry={near} />
      </div>
      <ListStack>
        {rows.map((entry) => (
          <ListRow
            key={entry.item.id}
            title={entry.item.title}
            titleSize={400}
            trailing={
              <span className={styles.rowTrailing}>
                {wide ? (
                  <Text size={200} className={styles.rowDate}>
                    {entry.dateLabel} · {entry.weekdayLabel}
                  </Text>
                ) : null}
                <CardDays entry={entry} />
              </span>
            }
          />
        ))}
      </ListStack>
    </CardRoot>
  );
}
