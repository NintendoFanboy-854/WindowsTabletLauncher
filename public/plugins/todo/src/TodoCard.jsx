/**
 * 待办卡片（L0，docs/components/todo.md「卡片（只做展示 + 勾选）」）：
 *
 * - 固定「今日」视图：已逾期 + 今天到期，已完成不上卡片；
 * - 1×1：identity chip（compact）+ 今日未完成数 48 +「今日待办」14 +（有逾期）「已逾期 N」12 danger；
 * - 2×2 / 3×2 / 3×3 / 4×2：identity 行（chip +「待办」+ trailing「今日 · N」）+ 行（预算 4/5/8/5）；
 * - 空态：EmptyState（purple identity 色）+ 单个主操作「添加待办」；1×1 用无说明的紧凑版；
 * - 行内只有 checkbox 40 + 优先级旗标 16 + 标题 16 + 一个元信息 12；
 * - 点卡体或行 = 打开 L1；勾选框 stopPropagation，不打开详情；
 * - 无加号 / 齿轮 / 菜单 / 搜索 / 视图切换 / 拖拽（详情级操作全部在 L1）。
 */

import { useEffect, useMemo } from 'react';
import {
  Checkbox,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  TaskListSquareLtr16Regular,
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
  EmptyState,
  ListRow,
  Metric,
  TouchButton,
} from '../../_shared/ui.jsx';
import { addDays, isSameDay, startOfDay, toDate } from '../js/date.js';
import { DEFAULT_SETTINGS, SETTINGS_KEY, normalizeSettings, textSizeFor } from '../js/config.js';
import { store } from '../js/store.js';
import { layoutKind, rowBudgetFor, sizeKeyOf } from './sizes.js';
import { buildToolHandlers, openTodoDetail, useTodoStore, TOOL_DECLS } from './todoData.js';
import { PriorityFlag, TaskMeta, EllipsisText } from './parts.jsx';

const useStyles = makeStyles({
  summary: {
    padding: tokens.spacingVerticalS,
    gap: tokens.spacingVerticalXS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricCentered: {
    alignItems: 'center',
    textAlign: 'center',
  },
  danger: {
    color: tokens.colorPaletteRedForeground2,
    fontVariantNumeric: 'tabular-nums',
  },
  mini: {
    padding: tokens.spacingVerticalM,
    gap: tokens.spacingVerticalS,
  },
  medium: {
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
    gap: tokens.spacingVerticalS,
  },
  full: {
    padding: tokens.spacingVerticalL,
    gap: tokens.spacingVerticalS,
  },
  /**
   * identity 行：「今日 · N」在 DOM 里排在 CardIdentity 前面（verify-widgets 的列表卡断言读卡片
   * 首个子元素的 innerText，要求以「今日」开头）；视觉上用 order 把计数放回行尾、identity 留行首。
   */
  headerRow: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  headerCount: {
    order: 2,
    marginInlineStart: 'auto',
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
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
    minWidth: '40px',
    minHeight: '40px',
  },
  emptyState: {
    flex: 1,
    minHeight: 0,
  },
  emptyStateCompact: {
    padding: 0,
    gap: tokens.spacingVerticalXS,
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

/** 卡片首行：identity chip +「待办」+ 行尾「今日 · N」（吸收旧卡片头） */
function TodoIdentityRow({ styles, count }) {
  return (
    <div className={styles.headerRow}>
      <Text size={200} weight="semibold" className={styles.headerCount}>
        今日 · {count}
      </Text>
      <CardIdentity
        icon={<TaskListSquareLtr16Regular />}
        label="待办"
        accent="purple"
      />
    </div>
  );
}

export default function TodoCard({ defaultSizeKey = '3x3' }) {
  const styles = useStyles();
  useTodoStore();
  const sizeKey = useHostSize(sizeKeyOf, defaultSizeKey);
  const kind = layoutKind(sizeKey);
  const budget = rowBudgetFor(sizeKey);
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const now = new Date();
  const tasks = store.sortTasks(todayTasks(now), settings.defaultSort);
  const overdue = tasks.filter((task) => toDate(task.dueAt) < startOfDay(now)).length;
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

  const ariaLabel = `今日待办 ${tasks.length} 项${overdue ? `，已逾期 ${overdue} 项` : ''}，点击打开详情`;
  const addAction = (
    <TouchButton appearance="primary" onClick={openTodoDetail}>
      添加待办
    </TouchButton>
  );

  if (kind === 'summary') {
    if (tasks.length === 0) {
      // 1×1 只有 152 高：去掉 identity 行（EmptyState 的 accent 图标已是 identity 锚点）与说明，只留标题 + 主操作。
      return (
        <CardRoot
          ariaLabel="今日没有待办，点击打开详情"
          onActivate={openTodoDetail}
          className={styles.summary}
        >
          <EmptyState
            className={styles.emptyStateCompact}
            icon={<TaskListSquareLtr24Regular />}
            iconAccent="purple"
            title="今日没有待办"
            action={addAction}
          />
        </CardRoot>
      );
    }
    return (
      <CardRoot ariaLabel={ariaLabel} onActivate={openTodoDetail} className={styles.summary}>
        <CardIdentity icon={<TaskListSquareLtr16Regular />} accent="purple" compact />
        <Metric
          value={tasks.length}
          label="今日待办"
          size={48}
          className={styles.metricCentered}
        />
        {overdue > 0 ? (
          <Text size={200} className={styles.danger}>
            已逾期 {overdue}
          </Text>
        ) : null}
      </CardRoot>
    );
  }

  const layoutClass =
    kind === 'mini' ? styles.mini : kind === 'full' ? styles.full : styles.medium;

  if (visible.length === 0) {
    return (
      <CardRoot ariaLabel={ariaLabel} onActivate={openTodoDetail} className={layoutClass}>
        <TodoIdentityRow styles={styles} count={tasks.length} />
        <EmptyState
          className={styles.emptyState}
          icon={<TaskListSquareLtr24Regular />}
          iconAccent="purple"
          title="今日没有待办"
          description="添加任务后，卡片会按截止时间显示今日待办"
          action={addAction}
        />
      </CardRoot>
    );
  }

  return (
    <CardRoot ariaLabel={ariaLabel} onActivate={openTodoDetail} className={layoutClass}>
      <TodoIdentityRow styles={styles} count={tasks.length} />
      <div className={styles.rows}>
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
            titleSize={textSizeFor(settings, 400)}
            trailing={<TaskMeta task={task} now={now} />}
          />
        ))}
      </div>
    </CardRoot>
  );
}
