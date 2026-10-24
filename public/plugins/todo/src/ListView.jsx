/**
 * L1「列表」视图（docs/components/todo.md「详情 L1 · 列表」）：
 *
 * - 分组：逾期 / 今天 / 明天 / 以后 / 无日期 / 已完成（折叠）；
 * - 组头 14 semibold + 计数 12 fg3；行 44，行尾 ⋯ 提供编辑/删除（删除行内二次确认）；
 * - 已完成组默认折叠，「展开」「清空」都在组头；清空行内确认；
 * - 搜索态不分组，直接列出命中任务；无结果给一句话 + 清除搜索。
 */

import { useState } from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import {
  Add20Regular,
  Dismiss20Regular,
  Search24Regular,
  TaskListSquareLtr24Regular,
} from '@fluentui/react-icons';
import { Collapse, FadeSlide } from '../../_shared/motion.js';
import { EmptyState, ActionButton } from '../../_shared/ui.jsx';
import { addDays, isSameDay, startOfDay, toDate } from '../js/date.js';
import { store } from '../js/store.js';
import { GroupHead, TaskRow, useNewIds } from './parts.jsx';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    minWidth: 0,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  rowWrap: {
    minWidth: 0,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
    paddingBlock: tokens.spacingVerticalS,
  },
  clearConfirm: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  confirmText: { color: tokens.colorNeutralForeground3 },
});

function sortBySettings(tasks, settings) {
  return store.sortTasks(tasks, settings.defaultSort);
}

function GroupRows({
  tasks,
  settings,
  now,
  newIds,
  removingId,
  onOpen,
  onToggle,
  onRequestRemove,
  onRemoved,
}) {
  const styles = useStyles();
  return tasks.map((task) => (
    <FadeSlide
      key={task.id}
      visible={removingId !== task.id}
      appear={newIds.has(task.id)}
      unmountOnExit
      onMotionFinish={(_event, data) => {
        if (data?.direction !== 'exit') return;
        if (removingId !== task.id) return;
        store.removeTask(task.id);
        onRemoved();
      }}
    >
      <div
        className={styles.rowWrap}
        data-task-id={task.id}
        data-removing={removingId === task.id ? 'true' : 'false'}
      >
        <TaskRow
          task={task}
          now={now}
          settings={settings}
          onOpen={onOpen}
          onToggle={onToggle}
          onRemove={onRequestRemove}
        />
      </div>
    </FadeSlide>
  ));
}

export function ListView({
  tasks,
  query,
  settings,
  now,
  listId,
  onOpenTask,
  onToggleTask,
  onAddTask,
  onClearSearch,
}) {
  const styles = useStyles();
  const [removingId, setRemovingId] = useState(null);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const search = query.trim();
  const searchHits = search
    ? store.searchTasks(search).filter((task) => listId === 'all' || task.listId === listId)
    : [];

  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const undone = tasks.filter((task) => !task.done);
  const done = tasks.filter((task) => task.done);

  const buckets = [
    { key: 'overdue', label: '已逾期', tasks: [] },
    { key: 'today', label: '今天', tasks: [] },
    { key: 'tomorrow', label: '明天', tasks: [] },
    { key: 'later', label: '以后', tasks: [] },
    { key: 'nodate', label: '无日期', tasks: [] },
  ];
  const byKey = Object.fromEntries(buckets.map((bucket) => [bucket.key, bucket]));
  for (const task of undone) {
    const due = toDate(task.dueAt);
    if (!due) byKey.nodate.tasks.push(task);
    else if (due < today) byKey.overdue.tasks.push(task);
    else if (isSameDay(due, now)) byKey.today.tasks.push(task);
    else if (isSameDay(due, tomorrow)) byKey.tomorrow.tasks.push(task);
    else byKey.later.tasks.push(task);
  }
  for (const bucket of buckets) bucket.tasks = sortBySettings(bucket.tasks, settings);
  const doneSorted = store
    .sortTasks(done, 'created')
    .slice()
    .sort((a, b) => (toDate(b.doneAt)?.getTime() || 0) - (toDate(a.doneAt)?.getTime() || 0));

  const groups = buckets.filter((bucket) => bucket.tasks.length > 0);
  const visibleIds = search
    ? searchHits.map((task) => task.id)
    : groups
        .flatMap((group) => group.tasks.map((task) => task.id))
        .concat(doneSorted.map((task) => task.id));
  const newIds = useNewIds(visibleIds);

  if (search) {
    return (
      <div className={styles.root}>
        <GroupHead label={`搜索结果 · ${searchHits.length}`} />
        {searchHits.length === 0 ? (
          <EmptyState
            icon={<Search24Regular />}
            title="没有匹配的任务"
            action={
              <ActionButton icon={<Dismiss20Regular />} onClick={onClearSearch}>
                清除搜索
              </ActionButton>
            }
          />
        ) : (
          <div className={styles.rows}>
            <GroupRows
              tasks={searchHits}
              settings={settings}
              now={now}
              newIds={newIds}
              removingId={removingId}
              onOpen={onOpenTask}
              onToggle={onToggleTask}
              onRequestRemove={setRemovingId}
              onRemoved={() => setRemovingId(null)}
            />
          </div>
        )}
      </div>
    );
  }

  if (undone.length === 0 && doneSorted.length === 0) {
    return (
      <EmptyState
        icon={<TaskListSquareLtr24Regular />}
        title="还没有任务"
        action={
          <ActionButton
            appearance="secondary"
            icon={<Add20Regular />}
            onClick={onAddTask}
          >
            添加任务
          </ActionButton>
        }
      />
    );
  }

  const clearCompleted = () => {
    store.clearCompleted({ listId: listId === 'all' ? undefined : listId });
    setClearConfirm(false);
  };

  return (
    <div className={styles.root}>
      {undone.length === 0 ? (
        <Text size={300} className={styles.muted}>
          没有未完成任务
        </Text>
      ) : null}

      {groups.map((group) => (
        <section
          key={group.key}
          className={styles.group}
          aria-label={`${group.label}（${group.tasks.length}）`}
        >
          <GroupHead label={group.label} count={group.tasks.length} />
          <div className={styles.rows}>
            <GroupRows
              tasks={group.tasks}
              settings={settings}
              now={now}
              newIds={newIds}
              removingId={removingId}
              onOpen={onOpenTask}
              onToggle={onToggleTask}
              onRequestRemove={setRemovingId}
              onRemoved={() => setRemovingId(null)}
            />
          </div>
        </section>
      ))}

      {settings.showCompleted && doneSorted.length > 0 ? (
        <section className={styles.group} aria-label={`已完成（${doneSorted.length}）`}>
          <GroupHead
            label="已完成"
            count={doneSorted.length}
            trailing={
              clearConfirm ? (
                <span className={styles.clearConfirm}>
                  <Text size={200} className={styles.confirmText}>
                    清空 {doneSorted.length} 条？
                  </Text>
                  <ActionButton appearance="secondary" onClick={() => setClearConfirm(false)}>
                    取消
                  </ActionButton>
                  <ActionButton appearance="secondary" onClick={clearCompleted}>
                    清空
                  </ActionButton>
                </span>
              ) : (
                <>
                  <ActionButton
                    appearance="subtle"
                    onClick={() => setCompletedOpen((value) => !value)}
                    aria-expanded={completedOpen}
                  >
                    {completedOpen ? '收起' : '展开'}
                  </ActionButton>
                  <ActionButton appearance="subtle" onClick={() => setClearConfirm(true)}>
                    清空
                  </ActionButton>
                </>
              )
            }
          />
          <Collapse visible={completedOpen} unmountOnExit>
            <div className={styles.rows}>
              <GroupRows
                tasks={doneSorted}
                settings={settings}
                now={now}
                newIds={newIds}
                removingId={removingId}
                onOpen={onOpenTask}
                onToggle={onToggleTask}
                onRequestRemove={setRemovingId}
                onRemoved={() => setRemovingId(null)}
              />
            </div>
          </Collapse>
        </section>
      ) : null}
    </div>
  );
}
