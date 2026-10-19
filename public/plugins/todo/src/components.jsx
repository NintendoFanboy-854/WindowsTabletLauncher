/** 待办卡片 / 视图共用的 Fluent 组件（任务行、空态、月历格、热力图）。 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  Text,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  Checkmark20Regular,
  DataHistogram20Regular,
  Flag20Filled,
  ReOrderDotsVertical20Regular,
  TaskListLtr20Regular,
} from '@fluentui/react-icons';
import {
  DAY,
  PRIORITIES,
  dayKey,
  fmtDate,
  fmtTime,
  isSameDay,
  priorityMeta,
  toDate,
  weekdayLabels,
} from '../js/date.js';
import { store } from '../js/store.js';

const LONG_PRESS_MS = 500; // 交互阈值（DESIGN.md §1.2），不是动效时长
export const ROW_HEIGHT = 44;
export const ROW_GAP = 4;
export const ROW_PITCH = ROW_HEIGHT + ROW_GAP;

export const useTodoStyles = makeStyles({
  fill: {
    width: '100%',
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
    minHeight: '40px',
  },
  spacer: { flex: 1, minWidth: 0 },
  iconButton: { minWidth: '40px', minHeight: '40px' },
  tabs: { minWidth: 0, flex: 1 },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
    paddingTop: tokens.spacingVerticalXS,
  },
  search: { flex: 1 },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  scrollViewport: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollInner: {
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  scrollFade: {
    position: 'absolute',
    left: tokens.spacingHorizontalNone,
    right: tokens.spacingHorizontalNone,
    bottom: tokens.spacingVerticalNone,
    height: '32px',
    pointerEvents: 'none',
    backgroundImage: `linear-gradient(to bottom, transparent, ${tokens.colorNeutralBackground1})`,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  groupHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalXS,
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
  groupLabel: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
  },
  count: { color: tokens.colorNeutralForeground4, fontVariantNumeric: 'tabular-nums' },
  more: {
    alignSelf: 'center',
    flexShrink: 0,
    marginTop: tokens.spacingVerticalXS,
    minHeight: '40px',
  },
  row: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '44px',
    paddingInline: tokens.spacingHorizontalXS,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    outline: 'none',
    flexShrink: 0,
    ':hover': { backgroundColor: tokens.colorSubtleBackgroundHover },
    ':active': { backgroundColor: tokens.colorSubtleBackgroundPressed },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: `-${tokens.strokeWidthThick}`,
    },
  },
  rowDone: { color: tokens.colorNeutralForeground3 },
  rowDragging: { opacity: 0.5, backgroundColor: tokens.colorNeutralBackground3 },
  rowDropTarget: {
    boxShadow: `inset 0 ${tokens.strokeWidthThick} 0 ${tokens.colorBrandBackground}`,
  },
  handle: {
    minWidth: '40px',
    minHeight: '40px',
    color: tokens.colorNeutralForeground4,
    flexShrink: 0,
    touchAction: 'none',
  },
  title: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  titleDone: { textDecorationLine: 'line-through' },
  meta: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  metaAlert: { color: tokens.colorPaletteRedForeground2 },
  priorityIcon: { flexShrink: 0 },
  priorityHigh: { color: tokens.colorPaletteRedForeground1 },
  priorityMedium: { color: tokens.colorPaletteMarigoldForeground1 },
  priorityLow: { color: tokens.colorPaletteBlueForeground2 },
  empty: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalL,
    textAlign: 'center',
  },
  emptyIcon: { color: tokens.colorNeutralForeground4 },
  emptyTitle: { color: tokens.colorNeutralForeground2 },
  emptyAction: { minHeight: '40px' },
  completedToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minHeight: '40px',
    marginTop: tokens.spacingVerticalXS,
    flexShrink: 0,
  },
  completedList: { flexShrink: 0 },

  /* 月历 */
  calHead: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
    minHeight: '40px',
  },
  calTitle: { flex: 1, minWidth: 0 },
  calGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalXXS,
    flexShrink: 0,
  },
  calWeekday: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground4,
    paddingBlock: tokens.spacingVerticalXXS,
  },
  calCell: {
    minHeight: '40px',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalXXS,
    borderRadius: tokens.borderRadiusMedium,
  },
  calCellOther: { color: tokens.colorNeutralForeground4 },
  calCellToday: {
    boxShadow: `inset 0 0 0 ${tokens.strokeWidthThin} ${tokens.colorBrandStroke1}`,
  },
  calDots: { display: 'flex', gap: tokens.spacingHorizontalXXS, alignItems: 'center', height: '4px' },
  dot: {
    width: '4px',
    height: '4px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralForeground4,
  },
  dotHigh: { backgroundColor: tokens.colorPaletteRedForeground1 },
  dotMedium: { backgroundColor: tokens.colorPaletteMarigoldForeground1 },
  dotLow: { backgroundColor: tokens.colorPaletteBlueForeground2 },
  dayPanel: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    paddingTop: tokens.spacingVerticalXS,
  },

  /* 周 / 月视图 */
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalXXS,
    flex: 1,
    minHeight: 0,
  },
  weekCol: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    overflow: 'hidden',
  },
  weekColToday: { backgroundColor: tokens.colorBrandBackground2 },
  weekHead: { minHeight: '40px', flexShrink: 0 },
  weekTasks: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalXXS,
  },
  weekTask: {
    minHeight: '40px',
    justifyContent: 'flex-start',
    fontSize: tokens.fontSizeBase200,
    overflow: 'hidden',
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gridTemplateRows: 'auto repeat(6, minmax(40px, 1fr))',
    gap: tokens.spacingHorizontalXXS,
    flex: 1,
    minHeight: 0,
  },
  monthCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: tokens.spacingVerticalXXS,
    minHeight: '40px',
    padding: tokens.spacingVerticalXXS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground2,
    overflow: 'hidden',
  },
  monthCellOther: { opacity: 0.5 },
  monthCellToday: {
    boxShadow: `inset 0 0 0 ${tokens.strokeWidthThin} ${tokens.colorBrandStroke1}`,
  },
  monthTask: {
    minHeight: '20px',
    paddingInline: tokens.spacingHorizontalXXS,
    justifyContent: 'flex-start',
    fontSize: tokens.fontSizeBase100,
    overflow: 'hidden',
  },

  /* 热力图 */
  heatmap: {
    flexShrink: 0,
    paddingTop: tokens.spacingVerticalS,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  heatHead: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minHeight: '32px',
  },
  heatGrid: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
    gridAutoColumns: 'minmax(0, 1fr)',
    gap: tokens.spacingHorizontalXXS,
    height: '68px',
  },
  heat0: { backgroundColor: tokens.colorNeutralBackground4, borderRadius: tokens.borderRadiusSmall },
  heat1: { backgroundColor: tokens.colorPaletteGreenBackground1, borderRadius: tokens.borderRadiusSmall },
  heat2: { backgroundColor: tokens.colorPaletteGreenBackground2, borderRadius: tokens.borderRadiusSmall },
  heat3: { backgroundColor: tokens.colorPaletteGreenBackground3, borderRadius: tokens.borderRadiusSmall },
  heat4: { backgroundColor: tokens.colorPaletteGreenForeground1, borderRadius: tokens.borderRadiusSmall },
});

/* ---------------------------------------------------------------- 空态 */

export function EmptyState({ title, actionLabel, onAction, size = 400 }) {
  const styles = useTodoStyles();
  return (
    <div className={styles.empty}>
      <TaskListLtr20Regular className={styles.emptyIcon} aria-hidden="true" />
      <Text className={styles.emptyTitle} size={size} weight="semibold">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Button appearance="primary" size="large" className={styles.emptyAction} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- 分组标题 */

export function GroupHead({ label, count }) {
  const styles = useTodoStyles();
  return (
    <div className={styles.groupHead}>
      <Text className={styles.groupLabel} size={300} weight="semibold">
        {label}
      </Text>
      {typeof count === 'number' ? (
        <Text className={styles.count} size={200}>
          {count}
        </Text>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- 任务行 */

function RowMeta({ task, now }) {
  const styles = useTodoStyles();
  if (task.done) return null;
  const due = toDate(task.dueAt);
  if (due && due < now) {
    return (
      <Text className={mergeClasses(styles.meta, styles.metaAlert)} size={200}>
        已逾期
      </Text>
    );
  }
  if (due && isSameDay(due, now)) {
    const hasTime = !(due.getHours() === 23 && due.getMinutes() === 59);
    if (hasTime) {
      return (
        <Text className={styles.meta} size={200}>
          {fmtTime(due)}
        </Text>
      );
    }
  }
  if (task.priority > 0) {
    const meta = priorityMeta(task.priority);
    const className =
      task.priority >= 3
        ? styles.priorityHigh
        : task.priority === 2
          ? styles.priorityMedium
          : styles.priorityLow;
    return (
      <Tooltip content={`优先级：${meta.label}`} relationship="label">
        <Flag20Filled className={mergeClasses(styles.priorityIcon, className)} aria-label={`优先级：${meta.label}`} />
      </Tooltip>
    );
  }
  return null;
}

/**
 * 任务行：勾选 + 标题 + 最多 1 个主元信息（DENSITY）。
 * 点击 = 完成/取消；长按 = 打开宿主全窗口详情浮层；拖拽手柄 = 手动排序。
 */
export function TaskRows({ tasks, manualSort = false, onToggle, onOpenDetail, onReorder }) {
  const styles = useTodoStyles();
  const containerRef = useRef(null);
  const pressRef = useRef({ timer: 0, suppress: false, origin: null });
  const dragRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const now = new Date();

  useEffect(
    () => () => {
      window.clearTimeout(pressRef.current.timer);
    },
    [],
  );

  const clearPress = useCallback(() => {
    window.clearTimeout(pressRef.current.timer);
    pressRef.current.timer = 0;
    pressRef.current.origin = null;
  }, []);

  const onPointerDown = useCallback(
    (event, task) => {
      if (event.button !== 0) return;
      if (event.target.closest('input, button, [data-drag-handle]')) return;
      pressRef.current.origin = { x: event.clientX, y: event.clientY, id: task.id };
      pressRef.current.timer = window.setTimeout(() => {
        pressRef.current.suppress = true;
        onOpenDetail(task.id);
      }, LONG_PRESS_MS);
    },
    [onOpenDetail],
  );

  const onPointerMove = useCallback(
    (event) => {
      const origin = pressRef.current.origin;
      if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8) clearPress();
      const current = dragRef.current;
      if (!current) return;
      const rows = [...(containerRef.current?.querySelectorAll('[data-task-row]') || [])];
      let over = null;
      rows.forEach((row, index) => {
        const rect = row.getBoundingClientRect();
        if (event.clientY >= rect.top && event.clientY <= rect.bottom) over = index;
      });
      if (over !== null && over !== current.over) setDrag({ id: current.id, over });
    },
    [clearPress],
  );

  const onPointerUp = useCallback(
    (event, task) => {
      clearPress();
      if (pressRef.current.suppress) {
        pressRef.current.suppress = false;
        return;
      }
      const current = dragRef.current;
      if (current) {
        dragRef.current = null;
        const over = drag?.over;
        setDrag(null);
        if (over !== null && over !== undefined && tasks[over] && tasks[over].id !== current.id) {
          const target = tasks[over];
          const listTasks = store.sortTasks(
            store.state.tasks.filter((item) => item.listId === task.listId),
            'manual',
          );
          const ids = listTasks.map((item) => item.id).filter((id) => id !== current.id);
          let index = ids.indexOf(target.id);
          if (index < 0) index = ids.length;
          ids.splice(index, 0, current.id);
          onReorder(task.listId, ids);
        }
        return;
      }
      if (event.target.closest('input, button, [data-drag-handle]')) return;
      onToggle(task.id);
    },
    [clearPress, drag, onReorder, onToggle, tasks],
  );

  const startDrag = useCallback(
    (event, task) => {
      if (!manualSort || task.done) return;
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      dragRef.current = { id: task.id, over: tasks.findIndex((item) => item.id === task.id) };
      setDrag({ id: task.id, over: dragRef.current.over });
    },
    [manualSort, tasks],
  );

  return (
    <div ref={containerRef} className={styles.rows}>
      {tasks.map((task, index) => {
        const dragging = drag?.id === task.id;
        const dropTarget = drag && drag.over === index && drag.id !== task.id;
        return (
          <div
            key={task.id}
            data-task-row
            role="checkbox"
            aria-checked={task.done}
            aria-label={`${task.title}${task.done ? '（已完成）' : ''}`}
            tabIndex={0}
            className={mergeClasses(
              styles.row,
              task.done && styles.rowDone,
              dragging && styles.rowDragging,
              dropTarget && styles.rowDropTarget,
            )}
            onMouseEnter={() => setActiveRow(task.id)}
            onMouseLeave={() => setActiveRow((value) => (value === task.id ? null : value))}
            onFocus={() => setActiveRow(task.id)}
            onBlur={() => setActiveRow((value) => (value === task.id ? null : value))}
            onPointerDown={(event) => onPointerDown(event, task)}
            onPointerMove={onPointerMove}
            onPointerUp={(event) => onPointerUp(event, task)}
            onPointerCancel={clearPress}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onToggle(task.id);
              } else if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
                event.preventDefault();
                onOpenDetail(task.id);
              }
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              onOpenDetail(task.id);
            }}
          >
            {manualSort && !task.done && (activeRow === task.id || drag?.id === task.id) ? (
              <Button
                appearance="transparent"
                size="small"
                data-drag-handle
                className={styles.handle}
                aria-label={`拖动排序：${task.title}`}
                icon={<ReOrderDotsVertical20Regular />}
                onPointerDown={(event) => startDrag(event, task)}
              />
            ) : null}
            <Checkbox
              checked={task.done}
              aria-label={task.done ? `取消完成：${task.title}` : `完成：${task.title}`}
              onChange={() => onToggle(task.id)}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            />
            <Text
              className={mergeClasses(styles.title, task.done && styles.titleDone)}
              size={400}
              truncate
              title={task.title}
            >
              {task.title}
            </Text>
            <RowMeta task={task} now={now} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- 月历格 */

export function MonthGrid({ monthCursor, selectedDay, tasksByDay, weekStart, onSelectDay, onAddDay, compact = false }) {
  const styles = useTodoStyles();
  const labels = weekdayLabels(weekStart);
  const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const startOffset = (first.getDay() - weekStart + 7) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - startOffset);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
  const now = new Date();

  return (
    <>
      <div className={styles.calGrid} role="grid" aria-label="月历">
        {labels.map((label) => (
          <Text key={label} className={styles.calWeekday} size={200}>
            {label}
          </Text>
        ))}
        {days.map((date) => {
          const key = dayKey(date);
          const tasks = tasksByDay.get(key) || [];
          const other = date.getMonth() !== monthCursor.getMonth();
          const selected = key === selectedDay;
          return (
            <Button
              key={key}
              appearance={selected ? 'primary' : 'subtle'}
              className={mergeClasses(styles.calCell, other && styles.calCellOther, isSameDay(date, now) && styles.calCellToday)}
              aria-label={`${date.getMonth() + 1}月${date.getDate()}日，${tasks.length} 项任务`}
              onClick={() => onSelectDay(key)}
              onDoubleClick={() => onAddDay(key)}
            >
              <Text size={300}>{date.getDate()}</Text>
              {tasks.length > 0 && !compact ? (
                <span className={styles.calDots} aria-hidden="true">
                  {tasks.slice(0, 3).map((task) => (
                    <span
                      key={task.id}
                      className={mergeClasses(
                        styles.dot,
                        task.priority >= 3 ? styles.dotHigh : task.priority === 2 ? styles.dotMedium : styles.dotLow,
                      )}
                    />
                  ))}
                </span>
              ) : null}
            </Button>
          );
        })}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- 热力图 */

export function Heatmap({ weighted, onToggleWeight, onOpenSettings }) {
  const styles = useTodoStyles();
  const stats = store.completionStats(112, { weighted });
  const values = [...stats.byDay.values()].map((bucket) => (weighted ? bucket.weight : bucket.count));
  const max = Math.max(1, ...values);
  const levelOf = (value) => (value <= 0 ? 0 : Math.min(4, Math.ceil((value / max) * 4)));
  const days = [...stats.byDay.keys()];
  const weekStart = store.settings.weekStart;
  const labels = weekdayLabels(weekStart);
  const firstDate = new Date(`${days[0]}T00:00:00`);
  const pad = (firstDate.getDay() - weekStart + 7) % 7;
  const cells = [];
  for (let index = 0; index < pad; index += 1) cells.push(<span key={`pad-${index}`} aria-hidden="true" />);
  for (const key of days) {
    const bucket = stats.byDay.get(key);
    const value = weighted ? bucket.weight : bucket.count;
    const level = levelOf(value);
    const date = new Date(`${key}T00:00:00`);
    cells.push(
      <span
        key={key}
        className={styles[`heat${level}`]}
        title={`${date.getMonth() + 1}月${date.getDate()}日 ${labels[(date.getDay() - weekStart + 7) % 7]}：完成 ${bucket.count} 项${weighted ? `（权重 ${bucket.weight}）` : ''}`}
      />,
    );
  }
  return (
    <section className={styles.heatmap} aria-label="工作量热力图">
      <div className={styles.heatHead}>
        <DataHistogram20Regular aria-hidden="true" />
        <Text size={200} weight="semibold">
          近 16 周完成 {stats.total} 项{stats.streak ? ` · 连续 ${stats.streak} 天` : ''}
        </Text>
        <span className={styles.spacer} />
        <Button appearance="subtle" size="small" className={styles.iconButton} onClick={onToggleWeight}>
          {weighted ? '按权重' : '按完成数'}
        </Button>
      </div>
      <div className={styles.heatGrid} role="img" aria-label="近 16 周每日完成量">
        {cells}
      </div>
    </section>
  );
}

export { Add20Regular, Checkmark20Regular };

/** 列表可视行数 = min(maxRows, floor(可用高度 / 行距))（DENSITY §2.1 / §6.4-8） */
export function useFitRows(ref, maxRows = 10) {
  const [rows, setRows] = useState(() => Math.max(1, maxRows));
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = () => {
      const height = element.clientHeight;
      if (!height) return;
      const fit = Math.floor((height + ROW_GAP) / ROW_PITCH);
      setRows(Math.max(1, Math.min(maxRows, fit)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, maxRows]);
  return rows;
}

/** 内容是否溢出（用于滚动渐隐提示，禁止静默裁切） */
export function useOverflow(ref) {
  const [overflow, setOverflow] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const update = () => setOverflow(element.scrollHeight > element.clientHeight + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, [ref]);
  return overflow;
}

/** 滚动容器 + 底部渐隐提示（列表超出可视高度时） */
export function ScrollArea({ children }) {
  const styles = useTodoStyles();
  const ref = useRef(null);
  const overflow = useOverflow(ref);
  return (
    <div className={styles.scrollViewport}>
      <div className={styles.scrollInner} ref={ref}>
        {children}
      </div>
      {overflow ? <div className={styles.scrollFade} aria-hidden="true" /> : null}
    </div>
  );
}
