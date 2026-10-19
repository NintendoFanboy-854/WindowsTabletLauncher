/**
 * 倒数日卡片视图（UI 重写 v2，docs/UI-REWRITE-SPEC.md §3.2）。
 *
 * 字号层级（1440×960 iframe 实测尺寸）：
 * - 1×1：最近事件天数/「今天」XL-48（数字 fg1；事件色只做 4px 圆点）；标题 14 S；单位 16 T
 * - 2×1：天数 68（Hero1000）；标题 16 S + 重复/日期 14 T；左右结构
 * - 2×2：hero 天数 XL-48；下面 3 行（标题 14 + 天数 16，行高 44）
 * - 3×2：header 计数 12 + ⋯ 菜单；hero 天数 XL-48；4 行（标题 16 + 天数 20，行高 44）
 *
 * 数字主信息走 _shared/typography.js 的 displayXl()；文本只走 Fluent Text size。
 * 操作仍走长按 / ⋯ 菜单 / ?view=edit|settings 全窗口浮层（D-02b）。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  CalendarLtr20Regular,
  MoreHorizontal20Regular,
  Settings20Regular,
} from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import {
  requestOverlay,
  requestSettings,
  useAgentTools,
  useHostSize,
  useSettingsRequest,
  useStoredConfig,
} from '../../_shared/host.js';
import { displayXl, TABULAR_NUMS } from '../../_shared/typography.js';
import { DEFAULT_SIZE_KEY, sizeKeyOf } from './sizes.js';
import {
  DEFAULT_SETTINGS,
  ITEMS_KEY,
  SETTINGS_KEY,
  colorTokenOf,
  displayText,
  normalizeItems,
  normalizeSettings,
  setEditingTarget,
  toolAdd,
  toolList,
  toolRemove,
  visibleEntries,
} from './data/items.js';

const LONG_PRESS_MS = 500; // 交互阈值（不是动效时长，DESIGN.md）
const LONG_PRESS_MOVE_TOLERANCE = 8;

const XL_48 = displayXl(48);

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

function daysText(entry) {
  if (entry.status === 'today') return '今天';
  if (entry.status === 'past') return `已过 ${Math.abs(entry.days)} 天`;
  return `还有 ${entry.days} 天`;
}

/** 数字型主信息：今天显示「今天」，其余显示天数绝对值 */
function primaryTextOf(entry) {
  if (entry.status === 'today') return '今天';
  return String(Math.abs(entry.days));
}

/** 主信息单位：今天无单位；过去用「天前」，未来用「天」 */
function unitOf(entry) {
  if (entry.status === 'today') return '';
  return entry.status === 'past' ? '天前' : '天';
}

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    userSelect: 'none',
    outline: 'none',
  },
  root1: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: tokens.spacingVerticalS,
    gap: tokens.spacingVerticalXS,
  },
  root21: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    gap: tokens.spacingVerticalXS,
  },
  root22: {
    padding: tokens.spacingVerticalM,
    gap: tokens.spacingVerticalS,
    justifyContent: 'space-evenly',
  },
  root32: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    gap: tokens.spacingVerticalS,
    justifyContent: 'flex-start',
  },
  /* ---- 数字主信息（D-07 Display XL） ---- */
  primary48: {
    ...XL_48,
    ...TABULAR_NUMS,
    fontWeight: tokens.fontWeightSemibold,
  },
  primary68: {
    ...TABULAR_NUMS,
    fontWeight: tokens.fontWeightSemibold,
    whiteSpace: 'nowrap',
  },
  primaryRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  unit: {
    color: tokens.colorNeutralForeground3,
  },
  /* ---- 1×1 ---- */
  single: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minHeight: 0,
    textAlign: 'center',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
    maxWidth: '100%',
    minWidth: 0,
  },
  dot: {
    width: tokens.spacingHorizontalXS,
    height: tokens.spacingHorizontalXS,
    borderRadius: tokens.borderRadiusCircular,
    flex: '0 0 auto',
  },
  singleTitle: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground2,
  },
  /* ---- 2×1 ---- */
  rowLayout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    flex: '1 1 auto',
  },
  title16: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground2,
  },
  sub14: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground3,
  },
  /* ---- 列表（2×2 / 3×2） ---- */
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    minHeight: '40px',
    flex: '0 0 auto',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  count: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  heroRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
    flex: '0 0 auto',
  },
  heroTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
    overflow: 'hidden',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minHeight: 0,
    overflow: 'hidden',
    flex: '0 0 auto',
  },
  row: {
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    padding: `0 ${tokens.spacingHorizontalS} !important`,
    borderRadius: tokens.borderRadiusMedium,
    textAlign: 'left',
  },
  rowToday: {
    backgroundColor: tokens.colorBrandBackground2,
  },
  rowTitle: {
    minWidth: 0,
    flex: '1 1 auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground2,
  },
  rowDays: {
    flex: '0 0 auto',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    color: tokens.colorNeutralForeground1,
  },
  /* ---- 空态 ---- */
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    textAlign: 'center',
    minHeight: 0,
    color: tokens.colorNeutralForeground3,
  },
  emptyIcon: {
    color: tokens.colorNeutralForeground4,
    display: 'flex',
  },
});

/** 列表行（2×2 / 3×2）：点击/长按都进编辑浮层 */
function EntryRow({ entry, sizeKey, onOpen }) {
  const styles = useStyles();
  const press = useLongPress(() => onOpen(entry.item.id));
  const wide = sizeKey === '3x2';
  return (
    <Button
      appearance="subtle"
      size="large"
      role="listitem"
      className={mergeClasses(styles.row, entry.status === 'today' && styles.rowToday)}
      onClick={() => {
        if (press.consumeSuppressedClick()) return;
        onOpen(entry.item.id);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onOpen(entry.item.id);
      }}
      onPointerDown={press.onPointerDown}
      onPointerMove={press.onPointerMove}
      onPointerUp={press.onPointerUp}
      onPointerCancel={press.onPointerCancel}
      onPointerLeave={press.onPointerLeave}
      aria-label={`${entry.item.title}，${displayText(entry)}，长按编辑`}
    >
      <Text className={styles.rowTitle} size={wide ? 400 : 300}>
        {entry.item.title}
      </Text>
      <Text className={styles.rowDays} size={wide ? 500 : 400} weight="semibold">
        {daysText(entry)}
      </Text>
    </Button>
  );
}

export default function CountdownApp({ fallbackSizeKey }) {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, fallbackSizeKey || DEFAULT_SIZE_KEY);
  const [items, setItems, itemsLoaded] = useStoredConfig(ITEMS_KEY, [], normalizeItems);
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const [now, setNow] = useState(() => new Date());
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const compact = sizeKey === '1x1';
  const row = sizeKey === '2x1';
  const list = sizeKey === '2x2' || sizeKey === '3x2';
  const wide = sizeKey === '3x2';
  const heroLimit = wide ? 5 : 4; // hero + 4 行（3×2）/ hero + 3 行（2×2）

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const allEntries = useMemo(() => {
    if (!itemsLoaded) return [];
    return visibleEntries(items, settings, now);
  }, [items, itemsLoaded, now, settings]);
  const entries = allEntries.slice(0, list ? heroLimit : 1);

  const openEditor = useCallback((id) => {
    setEditingTarget(id ?? null);
    requestOverlay('edit', id ? '编辑倒数日' : '新增倒数日');
  }, []);

  useSettingsRequest(() => requestSettings('倒数日设置'));

  /* 到日提醒：当天有事件时提醒一次（每个事件每天最多一次） */
  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    for (const entry of allEntries) {
      if (entry.status !== 'today') continue;
      const remindKey = `countdown.reminded:${entry.item.id}:${todayKey}`;
      try {
        if (localStorage.getItem(remindKey)) continue;
        localStorage.setItem(remindKey, '1');
      } catch {
        /* ignore */
      }
      plugin.notify(`今天是「${entry.item.title}」`);
    }
  }, [allEntries]);

  /* Agent 工具：countdown.list / add / remove */
  useAgentTools(
    [
      {
        name: 'countdown.list',
        description: '列出倒数日事件（含剩余天数）',
        parameters: {
          type: 'object',
          properties: { includePast: { type: 'boolean', description: '是否包含已过去的事件，默认 true' } },
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
              description: '颜色 token：accent / blue / green / orange / red / purple / teal',
            },
          },
          required: ['title', 'targetDate'],
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
    ],
    {
      'countdown.list': (args) => toolList(itemsRef.current, args),
      'countdown.add': (args) => toolAdd(itemsRef.current, args),
      'countdown.remove': (args) => toolRemove(itemsRef.current, args),
    },
  );

  /* 长按空白 = 设置（事件行有自己的长按 → 编辑浮层） */
  const rootPress = useLongPress(() => requestSettings('倒数日设置'));

  const dotOf = (entry) => (
    <span
      className={styles.dot}
      style={{ backgroundColor: tokens[colorTokenOf(entry.item.color)] }}
      aria-hidden="true"
    />
  );

  if (!itemsLoaded) {
    return <div className={styles.root} />;
  }

  if (!allEntries.length) {
    return (
      <div className={mergeClasses(styles.root, compact ? styles.root1 : row ? styles.root21 : wide ? styles.root32 : styles.root22)} role="group" aria-label="倒数日">
        <div className={styles.empty}>
          {!compact && <CalendarLtr20Regular className={styles.emptyIcon} aria-hidden="true" />}
          <Text size={300}>还没有倒数日</Text>
          <Button
            appearance="primary"
            size="large"
            icon={<Add20Regular />}
            onClick={() => openEditor(null)}
          >
            添加倒数日
          </Button>
        </div>
      </div>
    );
  }

  const near = entries[0];

  /* ---- 1×1：天数/今天 XL-48 + 标题 14 + 单位 16 ---- */
  if (compact) {
    return (
      <div
        className={mergeClasses(styles.root, styles.root1)}
        role="button"
        tabIndex={0}
        aria-label={`${near.item.title}，${displayText(near)}`}
        onClick={() => {
          if (rootPress.consumeSuppressedClick()) return;
          openEditor(near.item.id);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openEditor(near.item.id);
          }
        }}
        onPointerDown={rootPress.onPointerDown}
        onPointerMove={rootPress.onPointerMove}
        onPointerUp={rootPress.onPointerUp}
        onPointerCancel={rootPress.onPointerCancel}
        onPointerLeave={rootPress.onPointerLeave}
        onContextMenu={(event) => {
          event.preventDefault();
          requestSettings('倒数日设置');
        }}
      >
        <div className={styles.primaryRow}>
          <Text className={styles.primary48}>{primaryTextOf(near)}</Text>
          {unitOf(near) && <Text size={400} className={styles.unit}>{unitOf(near)}</Text>}
        </div>
        <div className={styles.titleRow}>
          {dotOf(near)}
          <Text className={styles.singleTitle} size={300}>
            {near.item.title}
          </Text>
        </div>
      </div>
    );
  }

  /* ---- 2×1：左标题/日期，右天数 68 ---- */
  if (row) {
    return (
      <div
        className={mergeClasses(styles.root, styles.root21)}
        role="button"
        tabIndex={0}
        aria-label={`${near.item.title}，${displayText(near)}`}
        onClick={() => {
          if (rootPress.consumeSuppressedClick()) return;
          openEditor(near.item.id);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openEditor(near.item.id);
          }
        }}
        onPointerDown={rootPress.onPointerDown}
        onPointerMove={rootPress.onPointerMove}
        onPointerUp={rootPress.onPointerUp}
        onPointerCancel={rootPress.onPointerCancel}
        onPointerLeave={rootPress.onPointerLeave}
        onContextMenu={(event) => {
          event.preventDefault();
          requestSettings('倒数日设置');
        }}
      >
        <div className={styles.rowLayout}>
          <div className={styles.titleBlock}>
            <div className={styles.titleRow}>
              {dotOf(near)}
              <Text className={styles.title16} size={400} weight="semibold">
                {near.item.title}
              </Text>
            </div>
            <Text className={styles.sub14} size={300}>
              {near.sub}
            </Text>
          </div>
          <div className={styles.primaryRow}>
            <Text className={styles.primary68} size={1000} weight="semibold">
              {primaryTextOf(near)}
            </Text>
            {unitOf(near) && <Text size={400} className={styles.unit}>{unitOf(near)}</Text>}
          </div>
        </div>
      </div>
    );
  }

  /* ---- 2×2 / 3×2：hero + 列表 ---- */
  const listEntries = entries.slice(1);

  return (
    <div
      className={mergeClasses(styles.root, wide ? styles.root32 : styles.root22)}
      role="group"
      aria-label="倒数日"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) rootPress.onPointerDown(event);
      }}
      onPointerMove={rootPress.onPointerMove}
      onPointerUp={rootPress.onPointerUp}
      onPointerCancel={rootPress.onPointerCancel}
      onPointerLeave={rootPress.onPointerLeave}
      onContextMenu={(event) => {
        event.preventDefault();
        requestSettings('倒数日设置');
      }}
    >
      {wide && (
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Text size={400} weight="semibold" className={styles.title16}>
              倒数日
            </Text>
            <Text size={200} className={styles.count}>
              {allEntries.length} 项
            </Text>
          </div>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                appearance="subtle"
                size="large"
                icon={<MoreHorizontal20Regular />}
                aria-label="倒数日操作"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<Add20Regular />} onClick={() => openEditor(null)}>
                  新增倒数日
                </MenuItem>
                <MenuItem icon={<Settings20Regular />} onClick={() => requestSettings('倒数日设置')}>
                  设置
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      )}

      <div className={styles.heroRow}>
        <div className={styles.heroTitleRow}>
          {dotOf(near)}
          <Text className={styles.title16} size={wide ? 400 : 400} weight={wide ? 'semibold' : 'regular'}>
            {near.item.title}
          </Text>
        </div>
        <div className={styles.primaryRow}>
          <Text className={styles.primary48}>{primaryTextOf(near)}</Text>
          {unitOf(near) && <Text size={400} className={styles.unit}>{unitOf(near)}</Text>}
        </div>
      </div>

      <div className={styles.list} role="list">
        {listEntries.map((entry) => (
          <EntryRow key={entry.item.id} entry={entry} sizeKey={sizeKey} onOpen={openEditor} />
        ))}
      </div>
    </div>
  );
}
