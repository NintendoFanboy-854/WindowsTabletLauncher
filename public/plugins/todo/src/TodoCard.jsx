/**
 * 待办卡片（L0，docs/components/todo.md「卡片（只做展示 + 勾选）」）：
 *
 * - 固定「今日」视图：已逾期 + 今天到期，已完成不上卡片；
 * - 1×1：identity compact + 今日未完成数 40 +「今日待办」14 +（有逾期）「逾期 N」12 danger；
 * - 列表档：identity 24 + 行 44 / 行距 4；行数由 iframe 高度代入唯一公式决定，
 *   2×2 与 3×2 同为 5 行，3×2 / 4×2 每行多清单名，3×3 再多子任务进度；
 * - 溢出不在卡内滚动：identity 行尾恒写 TrailingCount「共 X · 显示 Y」；
 * - 空态：EmptyState（中性单色图标）+ 单个次操作；有任务但今日为空时文案与操作分开；
 * - 行内只有 checkbox 40 + 优先级旗标 16（形状二态）+ 标题 16 + 一个元信息 12；
 * - 点卡体或行 = 打开 L1；勾选框 stopPropagation，不打开详情。
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  Text,
  makeStyles,
  tokens,
  webLightTheme,
} from '@fluentui/react-components';
import {
  Add20Regular,
  ChevronRight20Regular,
  TaskListSquareLtr20Regular,
  TaskListSquareLtr24Regular,
} from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import {
  exitFocus,
  useAgentTools,
  useHostSize,
  useStoredConfig,
} from '../../_shared/host.js';
import {
  CardIdentity,
  CardRoot,
  CARD_GAP_PX,
  CARD_PADDING_PX,
  EmptyState,
  HeroText,
  ListRow,
  ListStack,
  LIST_ROW_GAP,
  LIST_ROW_PITCH,
  TOUCH_TARGET,
  TouchButton,
  TrailingCount,
} from '../../_shared/ui.jsx';
import { addDays, isSameDay, startOfDay, toDate } from '../js/date.js';
import { DEFAULT_SETTINGS, SETTINGS_KEY, normalizeSettings } from '../js/config.js';
import { store } from '../js/store.js';
import { layoutKind, rowCapFor, sizeKeyOf } from './sizes.js';
import { buildToolHandlers, openTodoDetail, useTodoStore, TOOL_DECLS } from './todoData.js';
import { PriorityFlag, TaskMeta, EllipsisText } from './parts.jsx';

/** Fluent spacingVerticalXXL(24)：identity 行高，JS 侧反推行数时使用 */
const IDENTITY_HEIGHT_PX = Number.parseFloat(webLightTheme.spacingVerticalXXL);

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    color: tokens.colorNeutralForeground1,
  },
  /** 1×1：Hero 52 + 2 + 标签行 20，与 identity 24 + CardRoot gap 8 合计 106 */
  summaryContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  summaryLabels: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    width: '100%',
    minWidth: 0,
    minHeight: tokens.lineHeightBase300,
  },
  summaryLabel: {
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
  },
  danger: {
    color: tokens.colorStatusDangerForeground1,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  rowTrailing: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  rowSecondary: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  rows: {
    minWidth: 0,
    minHeight: 0,
  },
  emptyFill: {
    flex: 1,
    minHeight: 0,
  },
  emptyCompact: {
    flex: 1,
    minHeight: 0,
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
  row: {
    minWidth: 0,
  },
});

function todayTasks(now) {
  const today = startOfDay(now);
  // 仅「逾期 + 今天到期」，明天/以后/无日期都不上卡片（docs/components/todo.md）
  const endOfToday = addDays(today, 1);
  return store.state.tasks.filter((task) => {
    if (task.done || !task.dueAt) return false;
    const due = toDate(task.dueAt);
    if (!due) return false;
    return due < endOfToday || isSameDay(due, now);
  });
}

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
 * 唯一行数公式：A = Hc − 24 − 8，N = min(cap, floor((A + 4) / 48))。
 * `Hc` 为 iframe 高减 CardRoot 上下 16；todo 没有 featured 块。
 */
function rowBudgetFor(viewportHeight, cap) {
  const contentHeight = Math.max(0, viewportHeight - CARD_PADDING_PX * 2);
  const available = Math.max(0, contentHeight - IDENTITY_HEIGHT_PX - CARD_GAP_PX);
  return Math.max(
    0,
    Math.min(cap, Math.floor((available + LIST_ROW_GAP) / LIST_ROW_PITCH)),
  );
}

function CardCheck({ task, onToggle }) {
  const styles = useStyles();
  return (
    <span className={styles.checkCell}>
      <Checkbox
        checked={task.done}
        aria-label={`完成：${task.title}`}
        onChange={() => onToggle(task.id)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      />
    </span>
  );
}

/** 行内第二个字段（横向，放在数值之前）：3×2/4×2 清单名；3×3 再加子任务进度。 */
function TaskSecondary({ task, kind }) {
  const styles = useStyles();
  const parts = [];
  if (kind === 'medium' || kind === 'wide' || kind === 'full') {
    const list = store.listById(task.listId);
    if (list?.name) parts.push(list.name);
  }
  if (kind === 'full' && task.subtasks?.length) {
    const done = task.subtasks.filter((subtask) => subtask.done).length;
    parts.push(`子任务 ${done}/${task.subtasks.length}`);
  }
  if (!parts.length) return null;
  return (
    <Text size={200} className={styles.rowSecondary}>
      {parts.join(' · ')}
    </Text>
  );
}

/** 卡片首行：identity chip +「待办」+ 行尾「共 X · 显示 Y」+ chevron（整卡可点开详情） */
function TodoIdentityRow({ total, shown }) {
  return (
    <CardIdentity
      icon={<TaskListSquareLtr20Regular />}
      label="待办"
      disclosure
      trailing={<TrailingCount total={total} shown={shown} />}
    />
  );
}

export default function TodoCard({ defaultSizeKey = '3x3' }) {
  const styles = useStyles();
  useTodoStore();
  const sizeKey = useHostSize(sizeKeyOf, defaultSizeKey);
  const kind = layoutKind(sizeKey);
  const viewportHeight = useViewportHeight();
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const now = new Date();
  const tasks = store.sortTasks(todayTasks(now), settings.defaultSort);
  const overdue = tasks.filter((task) => toDate(task.dueAt) < startOfDay(now)).length;
  const hasAnyTasks = store.state.tasks.length > 0;
  const budget = rowBudgetFor(viewportHeight, rowCapFor(sizeKey));
  const visible = budget > 0 ? tasks.slice(0, budget) : [];

  // Agent 与 UI 共用数据层：卡片在桌面常驻期间工具可用；后台 iframe 也会注册一份。
  useAgentTools(TOOL_DECLS, useMemo(() => buildToolHandlers(), []));

  // 宿主键盘 roving focus 进入本卡时，把焦点交给第一个可操作控件；Esc 交还宿主。
  useEffect(
    () =>
      plugin.onFocus(() => {
        const root = document.querySelector('[data-card-root]');
        const target = root?.querySelector('input[type="checkbox"], button');
        (target || root)?.focus?.();
      }),
    [],
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      exitFocus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggle = (taskId) => {
    const task = store.taskById(taskId);
    if (task) store.setDone(taskId, !task.done);
  };

  const ariaLabel = `今日待办 ${tasks.length} 项${
    overdue ? `，已逾期 ${overdue} 项` : ''
  }，显示 ${visible.length} 项，点击打开详情`;

  if (kind === 'summary') {
    if (tasks.length === 0) {
      // 1×1 只有 152 高：图标 24 + 标题 + 次操作，不写说明（PLUGIN-CONTRACT §4.4.3）。
      return (
        <CardRoot
          ariaLabel={`${hasAnyTasks ? '今日没有待办' : '还没有待办'}，点击打开详情`}
          onActivate={openTodoDetail}
          className={styles.root}
        >
          <EmptyState
            className={styles.emptyCompact}
            align="center"
            compact
            icon={<TaskListSquareLtr24Regular />}
            title={hasAnyTasks ? '今日没有待办' : '还没有待办'}
            action={
              <TouchButton
                appearance="secondary"
                icon={hasAnyTasks ? <ChevronRight20Regular /> : <Add20Regular />}
                onClick={openTodoDetail}
              >
                {hasAnyTasks ? '查看全部' : '添加待办'}
              </TouchButton>
            }
          />
        </CardRoot>
      );
    }
    return (
      <CardRoot ariaLabel={ariaLabel} onActivate={openTodoDetail} className={styles.root}>
        <CardIdentity icon={<TaskListSquareLtr20Regular />} compact />
        <div className={styles.summaryContent}>
          <HeroText>{tasks.length}</HeroText>
          <div className={styles.summaryLabels}>
            <Text size={300} className={styles.summaryLabel}>
              今日待办
            </Text>
            {overdue > 0 ? (
              <Text size={200} className={styles.danger}>
                逾期 {overdue}
              </Text>
            ) : null}
          </div>
        </div>
      </CardRoot>
    );
  }

  if (visible.length === 0) {
    return (
      <CardRoot ariaLabel={ariaLabel} onActivate={openTodoDetail} className={styles.root}>
        <TodoIdentityRow total={tasks.length} shown={0} />
        <EmptyState
          className={styles.emptyFill}
          align="start"
          icon={<TaskListSquareLtr24Regular />}
          title={hasAnyTasks ? '今日没有待办' : '还没有待办'}
          action={
            <TouchButton
              appearance="secondary"
              icon={hasAnyTasks ? <ChevronRight20Regular /> : <Add20Regular />}
              onClick={openTodoDetail}
            >
              {hasAnyTasks ? '查看全部' : '添加待办'}
            </TouchButton>
          }
        />
      </CardRoot>
    );
  }

  return (
    <CardRoot ariaLabel={ariaLabel} onActivate={openTodoDetail} className={styles.root}>
      <TodoIdentityRow total={tasks.length} shown={visible.length} />
      <ListStack className={styles.rows}>
        {visible.map((task) => (
          <ListRow
            key={task.id}
            className={styles.row}
            leading={
              <span className={styles.leading}>
                <CardCheck task={task} onToggle={toggle} />
                <PriorityFlag priority={task.priority} />
              </span>
            }
            title={<EllipsisText>{task.title}</EllipsisText>}
            titleSize={400}
            trailing={
              <span className={styles.rowTrailing}>
                <TaskSecondary task={task} kind={kind} />
                <TaskMeta task={task} now={now} />
              </span>
            }
          />
        ))}
      </ListStack>
    </CardRoot>
  );
}
