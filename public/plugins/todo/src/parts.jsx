/** 待办 L1/L2 共用的小组件：任务行、分组标题、优先级旗标、元信息、清单颜色点。 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
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
import {
  Delete20Regular,
  Edit20Regular,
  Flag16Filled,
  MoreHorizontal20Regular,
} from '@fluentui/react-icons';
import { ListRow, TouchButton } from '../../_shared/ui.jsx';
import { useMotionTransition } from '../../_shared/motion.js';
import { fmtDate, fmtDue, priorityMeta, startOfDay, toDate } from '../js/date.js';
import { textSizeFor } from '../js/config.js';

/** 平板触控目标（DESIGN §1.2）：勾选/图标按钮至少 40×40 */
const TOUCH_TARGET = 40;

const useStyles = makeStyles({
  ellipsis: {
    display: 'block',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  groupHead: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: tokens.lineHeightBase300,
    paddingBlock: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  groupLabel: {
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
  },
  groupCount: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
  },
  spacer: { flex: 1, minWidth: 0 },
  groupActions: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  row: {
    minWidth: 0,
  },
  leading: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  checkCell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: `${TOUCH_TARGET}px`,
    minHeight: `${TOUCH_TARGET}px`,
  },
  flag: {
    flexShrink: 0,
  },
  flagHigh: { color: tokens.colorPaletteRedForeground1 },
  flagMedium: { color: tokens.colorPaletteMarigoldForeground1 },
  flagLow: { color: tokens.colorPaletteBlueForeground2 },
  meta: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  metaAlert: { color: tokens.colorPaletteRedForeground2 },
  rowTrailing: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  iconButton: {
    minWidth: `${TOUCH_TARGET}px`,
    minHeight: `${TOUCH_TARGET}px`,
  },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: tokens.spacingVerticalXXXL,
    paddingBlock: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  confirmText: {
    flex: 1,
    minWidth: 0,
    color: tokens.colorNeutralForeground2,
  },
  miniRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    minHeight: '44px',
    minWidth: 0,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    ':hover': { backgroundColor: tokens.colorNeutralBackground1Hover },
  },
  miniTitle: {
    flex: 1,
    minWidth: 0,
    color: tokens.colorNeutralForeground1,
  },
  dot: {
    width: tokens.spacingHorizontalM,
    height: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
  },
});

/** 清单颜色：store 存 Fluent palette token 名，直接映射到 CSS 变量（不写 hex） */
export function listColorVar(color) {
  return `var(--${color || 'colorPaletteBlueForeground2'})`;
}

/**
 * 单行省略文本。
 *
 * 为什么不用 Fluent `Text truncate`：当前 v9 版本里 `truncate` 与默认 `wrap`
 * 同时命中 white-space/overflow，合并后只剩 `white-space: normal`，中文标题会换行
 * 把 44 行撑高。这里用一层显式 ellipsis span 保证单行（字号仍继承外层 Text）。
 */
export function EllipsisText({ children }) {
  const styles = useStyles();
  return <span className={styles.ellipsis}>{children}</span>;
}

/** 优先级旗标 16：只在 priority > 0 时出现（docs/components/todo.md 卡片/行规格） */
export function PriorityFlag({ priority, className }) {
  const styles = useStyles();
  if (!priority) return null;
  const meta = priorityMeta(priority);
  const colorClass =
    priority >= 3 ? styles.flagHigh : priority === 2 ? styles.flagMedium : styles.flagLow;
  return (
    <Flag16Filled
      aria-label={`优先级：${meta.label}`}
      className={mergeClasses(styles.flag, colorClass, className)}
    />
  );
}

/** 行内单个元信息：截止时间 / 逾期（12 fg3，逾期 danger；不做多枚 chip） */
export function TaskMeta({ task, now, className }) {
  const styles = useStyles();
  const due = toDate(task.dueAt);
  if (!due) return null;
  const overdue = due < startOfDay(now);
  const text = overdue ? `已逾期 · ${fmtDate(due, now)}` : fmtDue(due, now);
  return (
    <Text
      size={200}
      truncate
      className={mergeClasses(styles.meta, overdue && styles.metaAlert, className)}
    >
      {text}
    </Text>
  );
}

/** 勾选单元：命中区 40×40；内部事件不冒泡到行/卡片（契约 §3.4） */
export function TaskCheck({ task, onToggle }) {
  const styles = useStyles();
  return (
    <span className={styles.checkCell}>
      <Checkbox
        checked={task.done}
        aria-label={task.done ? `取消完成：${task.title}` : `完成：${task.title}`}
        onChange={() => onToggle(task.id)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      />
    </span>
  );
}

/** 分组标题：14 semibold + 计数 12 fg3，高 28；右侧可放组动作 */
export function GroupHead({ label, count, trailing }) {
  const styles = useStyles();
  return (
    <div className={styles.groupHead}>
      <Text size={300} weight="semibold" className={styles.groupLabel}>
        {label}
      </Text>
      {typeof count === 'number' ? (
        <Text size={200} className={styles.groupCount}>
          {count}
        </Text>
      ) : null}
      <span className={styles.spacer} />
      {trailing ? <div className={styles.groupActions}>{trailing}</div> : null}
    </div>
  );
}

/**
 * L1 任务行：44 高（ListRow）+ checkbox 40 + 旗标 16 + 标题 16 + 元信息 12 + 行尾 ⋯ 40。
 * 点行 → push L2 任务编辑；勾选就地完成；⋯ → 编辑/删除；删除在行内二次确认。
 */
export function TaskRow({ task, now, settings, onOpen, onToggle, onRemove }) {
  const styles = useStyles();
  const [confirming, setConfirming] = useState(false);
  const motionStyle = useMotionTransition('normal');
  const doneOpacity = task.done ? 0.55 : 1;

  if (confirming) {
    return (
      <div className={styles.confirmRow} role="group" aria-label={`确认删除任务 ${task.title}`}>
        <Text size={300} className={styles.confirmText}>
          <EllipsisText>删除「{task.title}」？删除后不可恢复</EllipsisText>
        </Text>
        <TouchButton appearance="secondary" onClick={() => setConfirming(false)}>
          取消
        </TouchButton>
        <TouchButton
          appearance="primary"
          onClick={() => {
            setConfirming(false);
            onRemove?.(task.id);
          }}
        >
          删除
        </TouchButton>
      </div>
    );
  }

  return (
    <ListRow
      className={styles.row}
      leading={
        <span className={styles.leading}>
          <TaskCheck task={task} onToggle={onToggle} />
          <PriorityFlag priority={task.priority} />
        </span>
      }
      title={
        <EllipsisText>
          {task.title}
        </EllipsisText>
      }
      titleSize={textSizeFor(settings, 400)}
      trailing={
        <span className={styles.rowTrailing}>
          <TaskMeta task={task} now={now} />
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Tooltip content="任务操作" relationship="label">
                <Button
                  appearance="subtle"
                  size="large"
                  className={styles.iconButton}
                  icon={<MoreHorizontal20Regular />}
                  aria-label={`任务操作：${task.title}`}
                  onClick={(event) => event.stopPropagation()}
                />
              </Tooltip>
            </MenuTrigger>
            <MenuPopover>
              <div onClick={(event) => event.stopPropagation()}>
                <MenuList>
                  <MenuItem icon={<Edit20Regular />} onClick={() => onOpen?.(task.id)}>
                    编辑
                  </MenuItem>
                  <MenuItem icon={<Delete20Regular />} onClick={() => setConfirming(true)}>
                    删除
                  </MenuItem>
                </MenuList>
              </div>
            </MenuPopover>
          </Menu>
        </span>
      }
      onClick={() => onOpen?.(task.id)}
      style={{ opacity: doneOpacity, transitionProperty: 'opacity', ...motionStyle }}
    />
  );
}

/** 周视图列内任务行：44 高，勾选 + 单行标题；点标题打开 L2 编辑 */
export function MiniTaskRow({ task, onOpen, onToggle }) {
  const styles = useStyles();
  return (
    <div
      className={styles.miniRow}
      role="button"
      tabIndex={0}
      aria-label={`${task.title}${task.done ? '（已完成）' : ''}`}
      onClick={() => onOpen?.(task.id)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onOpen?.(task.id);
      }}
    >
      <TaskCheck task={task} onToggle={onToggle} />
      <Text size={200} className={styles.miniTitle}>
        <EllipsisText>{task.title}</EllipsisText>
      </Text>
    </div>
  );
}

/** 清单颜色点（12 / tokens.spacingHorizontalM） */
export function ListColorDot({ color }) {
  const styles = useStyles();
  return <span className={styles.dot} style={{ backgroundColor: listColorVar(color) }} aria-hidden="true" />;
}

/**
 * 只把“本次渲染中新出现的 id”标出来，用于列表新增的 FadeSlide 入场；
 * 首次渲染不返回任何 id（避免整页列表在打开时全部动一次）。
 */
export function useNewIds(ids) {
  const seenRef = useRef(null);
  const key = ids.join('|');
  const fresh = useMemo(() => {
    if (seenRef.current === null) return new Set();
    const seen = seenRef.current;
    return new Set(ids.filter((id) => !seen.has(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    seenRef.current = new Set(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return fresh;
}
