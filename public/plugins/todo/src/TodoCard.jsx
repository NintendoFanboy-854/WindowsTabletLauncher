/**
 * 待办卡片（L0，docs/components/todo.md「卡片（只做展示 + 勾选）」）：
 *
 * - 固定「今日」视图：已逾期 + 今天到期，已完成不上卡片；
 * - 1×1：今日未完成数 48 +「今日待办」14 +（有逾期）「已逾期 N」12 danger；
 * - 2×2 / 3×2 / 3×3 / 4×2：头部「今日 · N」+ 行（预算 4/5/8/5），4×2 仍是单列宽行；
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
import { plugin } from '/plugin-sdk.js';
import {
  exitFocus,
  useAgentTools,
  useHostSize,
  useStoredConfig,
} from '../../_shared/host.js';
import { CardHeader, CardRoot, ListRow, Metric } from '../../_shared/ui.jsx';
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
  empty: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: tokens.spacingVerticalS,
  },
  emptyText: {
    color: tokens.colorNeutralForeground3,
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

  if (kind === 'summary') {
    return (
      <CardRoot ariaLabel={ariaLabel} onActivate={openTodoDetail} className={styles.summary}>
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

  return (
    <CardRoot ariaLabel={ariaLabel} onActivate={openTodoDetail} className={layoutClass}>
      <CardHeader title={`今日 · ${tasks.length}`} />
      {visible.length === 0 ? (
        <div className={styles.empty}>
          <Text size={300} className={styles.emptyText}>
            今日没有待办
          </Text>
        </div>
      ) : (
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
      )}
    </CardRoot>
  );
}
