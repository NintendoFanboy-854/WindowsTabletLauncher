/**
 * 倒数日卡片视图（正常模式：每行只留 天数 + 标题；无常驻 chrome）。
 *
 * 尺寸信息预算（docs/DENSITY.md）：
 * - 1×1：最近一条的天数（Primary）+ 标题（Secondary）
 * - 2×1：最近一条的标题 + 天数；空态直接给「添加倒数日」
 * - 2×2：列表最多 4 行
 * - 3×2：列表最多 5 行 + 新增按钮 + 设置入口（唯一 Tertiary）
 *
 * 操作走长按 / 右键 / 浮层视图：长按事件行 → 编辑浮层（内含删除）；
 * 长按空白 / 右键 / 设置按钮 → requestSettings()（宿主全窗口 Fluent Dialog）。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Text,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  CalendarLtr20Regular,
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
    outline: 'none',
  },
  rootCompact: {
    padding: tokens.spacingHorizontalS,
    gap: tokens.spacingVerticalNone,
  },
  rootLarge: {
    justifyContent: 'flex-start',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalL,
  },
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
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flex: '0 0 auto',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalNone,
    minHeight: 0,
    overflow: 'hidden',
  },
  row: {
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS} !important`,
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
  },
  rowDays: {
    flex: '0 0 auto',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  single: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXXS,
    textAlign: 'center',
    minHeight: 0,
  },
  singleLabel: {
    color: tokens.colorNeutralForeground3,
  },
  singleDays: {
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  singleUnit: {
    color: tokens.colorNeutralForeground3,
  },
  singleTitle: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground2,
  },
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
      <Text
        className={styles.rowDays}
        size={wide ? 500 : 400}
        weight="semibold"
        style={{ color: tokens[colorTokenOf(entry.item.color)] }}
      >
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
  const wide = sizeKey === '3x2';
  const list = sizeKey === '2x2' || wide;
  const rowLimit = wide ? 5 : 4;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const allEntries = useMemo(() => {
    if (!itemsLoaded) return [];
    return visibleEntries(items, settings, now);
  }, [items, itemsLoaded, now, settings]);
  const entries = allEntries.slice(0, list ? rowLimit : 1);

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

  if (!itemsLoaded) {
    return <div className={styles.root} />;
  }

  if (!allEntries.length) {
    return (
      <div className={styles.root} role="group" aria-label="倒数日">
        <div className={styles.empty}>
          {!compact && <CalendarLtr20Regular className={styles.emptyIcon} aria-hidden="true" />}
          <Text size={compact ? 200 : 300}>还没有倒数日</Text>
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

  return (
    <div
      className={mergeClasses(styles.root, compact && styles.rootCompact, wide && styles.rootLarge)}
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
            <Text size={500} weight="semibold">
              倒数日
            </Text>
            <Text size={200} className={styles.count}>
              {allEntries.length} 项
            </Text>
          </div>
          <div className={styles.actions}>
            <Tooltip content="新增倒数日" relationship="label">
              <Button
                appearance="subtle"
                size="large"
                icon={<Add20Regular />}
                aria-label="新增倒数日"
                onClick={() => openEditor(null)}
              />
            </Tooltip>
            <Tooltip content="倒数日设置" relationship="label">
              <Button
                appearance="subtle"
                size="large"
                icon={<Settings20Regular />}
                aria-label="倒数日设置"
                onClick={() => requestSettings('倒数日设置')}
              />
            </Tooltip>
          </div>
        </div>
      )}

      {list ? (
        <div className={styles.list} role="list">
          {entries.map((entry) => (
            <EntryRow key={entry.item.id} entry={entry} sizeKey={sizeKey} onOpen={openEditor} />
          ))}
        </div>
      ) : compact ? (
        <div className={styles.single} role="button" tabIndex={0} aria-label={`${near.item.title}，${displayText(near)}`}>
          <Text className={styles.singleLabel} size={200}>
            {near.status === 'today' ? '就是今天' : near.status === 'past' ? '已过' : '还有'}
          </Text>
          {near.status !== 'today' && (
            <Text
              className={styles.singleDays}
              size={900}
              weight="semibold"
              style={{ color: tokens[colorTokenOf(near.item.color)] }}
            >
              {Math.abs(near.days)}
            </Text>
          )}
          {near.status !== 'today' && (
            <Text className={styles.singleUnit} size={200}>
              天
            </Text>
          )}
          <Text className={styles.singleTitle} size={200}>
            {near.item.title}
          </Text>
        </div>
      ) : (
        <Button
          appearance="subtle"
          size="large"
          className={mergeClasses(styles.row, near.status === 'today' && styles.rowToday)}
          onClick={() => openEditor(near.item.id)}
          onContextMenu={(event) => {
            event.preventDefault();
            openEditor(near.item.id);
          }}
          aria-label={`${near.item.title}，${displayText(near)}，点击编辑`}
        >
          <Text className={styles.rowTitle} size={400}>
            {near.item.title}
          </Text>
          <Text
            className={styles.rowDays}
            size={800}
            weight="semibold"
            style={{ color: tokens[colorTokenOf(near.item.color)] }}
          >
            {daysText(near)}
          </Text>
        </Button>
      )}
    </div>
  );
}
