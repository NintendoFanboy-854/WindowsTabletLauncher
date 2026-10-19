/**
 * 「查看全部」浮层视图（宿主 ?view=all 全窗口 Fluent Dialog 里加载）。
 *
 * 排版遵循 docs/OVERLAY-REWRITE-SPEC.md §3.4：
 * - 顶部工具行：搜索 input 40 + 筛选/排序 40；
 * - 列表行高 44（标题 16 / 元信息 12），分组头 14 semibold；
 * - iframe ≥760 两列，否则单列；纵向滚动、无横向溢出。
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Dropdown,
  Input,
  Option,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Search20Regular } from '@fluentui/react-icons';
import { addDays, isSameDay, startOfDay, toDate } from '../js/date.js';
import { store } from '../js/store.js';
import { EmptyState, TaskRows } from './components.jsx';
import { openTaskDetail, readOverlayPayload, useTodoStore } from './todoData.js';

const FILTER_OPTIONS = [
  { value: 'todo', label: '未完成' },
  { value: 'done', label: '已完成' },
  { value: 'all', label: '全部' },
];

const SORT_OPTIONS = [
  { value: 'due', label: '按截止时间' },
  { value: 'priority', label: '按优先级' },
  { value: 'created', label: '按创建时间' },
];

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: tokens.colorNeutralForeground1,
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL} 0`,
    '& .fui-Input__input': { minHeight: '40px' },
    '& .fui-Dropdown__button': { minHeight: '40px' },
    '@media (max-width: 700px)': {
      padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL} 0`,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    flexShrink: 0,
    paddingBottom: tokens.spacingVerticalM,
  },
  search: { flex: 1, minWidth: '220px' },
  toolbarHint: { color: tokens.colorNeutralForeground3 },
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: tokens.spacingVerticalXL,
  },
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    minWidth: 0,
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    alignItems: 'start',
    gap: tokens.spacingHorizontalXXL,
    minWidth: 0,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    minWidth: 0,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  groupHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    minHeight: '24px',
  },
  groupTitle: { color: tokens.colorNeutralForeground2 },
  groupCount: { color: tokens.colorNeutralForeground3, fontVariantNumeric: 'tabular-nums' },
});

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth || 0);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth || 0);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

function matchesQuery(task, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [task.title, task.note || '', ...(task.tags || []), ...(task.subtasks || []).map((sub) => sub.title)]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

function groupTasks(tasks, filter) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const buckets = [
    { key: 'overdue', label: '已逾期', tasks: [] },
    { key: 'today', label: '今天', tasks: [] },
    { key: 'tomorrow', label: '明天', tasks: [] },
    { key: 'later', label: '以后', tasks: [] },
    { key: 'none', label: '无日期', tasks: [] },
    { key: 'done', label: '已完成', tasks: [] },
  ];
  const map = Object.fromEntries(buckets.map((bucket) => [bucket.key, bucket]));
  for (const task of tasks) {
    if (task.done) {
      map.done.tasks.push(task);
      continue;
    }
    const due = toDate(task.dueAt);
    if (!due) map.none.tasks.push(task);
    else if (due < today) map.overdue.tasks.push(task);
    else if (isSameDay(due, today)) map.today.tasks.push(task);
    else if (isSameDay(due, tomorrow)) map.tomorrow.tasks.push(task);
    else map.later.tasks.push(task);
  }
  if (filter === 'done') return [map.done];
  if (filter === 'todo') return buckets.filter((bucket) => bucket.key !== 'done');
  return buckets;
}

export default function TodoAllTasks() {
  const styles = useStyles();
  useTodoStore();
  const width = useViewportWidth();
  const payload = useMemo(() => readOverlayPayload() || {}, []);
  const initialFilter = payload.done === true ? 'done' : 'todo';
  const [filter, setFilter] = useState(initialFilter);
  const [sort, setSort] = useState('due');
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState(0);

  const list = payload.listId
    ? store.listById(payload.listId)
    : payload.scope && payload.scope !== 'all'
      ? store.listById(payload.scope)
      : null;
  const listId = list?.id || (payload.scope && payload.scope !== 'all' ? payload.scope : null);

  const tasks = useMemo(() => {
    const scoped = store.state.tasks.filter((task) => !listId || task.listId === listId);
    const filtered = scoped.filter((task) => {
      if (filter === 'todo' && task.done) return false;
      if (filter === 'done' && !task.done) return false;
      return matchesQuery(task, query);
    });
    const sorted = store.sortTasks(filtered, sort);
    return filter === 'done' ? sorted.reverse() : sorted;
    // version 让 store 变更后重新计算
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, filter, sort, query, version, store.state.tasks]);

  const groups = groupTasks(tasks, filter).filter((group) => group.tasks.length > 0);
  const wide = width >= 760;

  // 两列时按「时间顺序」切成前后两段放进左右列（左列读到底再接右列），
  // 只在分组边界处切，避免同一组被拆开、也避免列内顺序错乱。
  let columns = [groups];
  if (wide && groups.length > 1) {
    const total = groups.reduce((sum, group) => sum + group.tasks.length, 0);
    let split = 1;
    let accumulated = 0;
    for (let index = 0; index < groups.length - 1; index += 1) {
      accumulated += groups[index].tasks.length;
      split = index + 1;
      if (accumulated >= total / 2) break;
    }
    columns = [groups.slice(0, split), groups.slice(split)];
  }

  const filterLabel = FILTER_OPTIONS.find((option) => option.value === filter)?.label || '未完成';
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label || '按截止时间';

  const renderGroup = (group) => (
    <section key={group.key} className={styles.group} aria-label={`${group.label}（${group.tasks.length}）`}>
      <div className={styles.groupHead}>
        <Text size={300} weight="semibold" className={styles.groupTitle}>
          {group.label}
        </Text>
        <Text size={200} className={styles.groupCount}>
          {group.tasks.length}
        </Text>
      </div>
      <TaskRows
        tasks={group.tasks}
        onToggle={(taskId) => {
          const task = store.taskById(taskId);
          if (task) {
            store.setDone(task.id, !task.done);
            setVersion((value) => value + 1);
          }
        }}
        onOpenDetail={openTaskDetail}
        onReorder={(targetListId, ids) => store.reorderTasks(targetListId, ids)}
      />
    </section>
  );

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <Input
          className={styles.search}
          size="large"
          appearance="outline"
          contentBefore={<Search20Regular />}
          placeholder="搜索任务、标签、备注"
          aria-label="搜索任务"
          value={query}
          onChange={(_, data) => setQuery(data.value)}
        />
        <Dropdown
          size="large"
          aria-label="筛选"
          value={filterLabel}
          selectedOptions={[filter]}
          onOptionSelect={(_, data) => setFilter(data.optionValue)}
        >
          {FILTER_OPTIONS.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Dropdown>
        <Dropdown
          size="large"
          aria-label="排序"
          value={sortLabel}
          selectedOptions={[sort]}
          onOptionSelect={(_, data) => setSort(data.optionValue)}
        >
          {SORT_OPTIONS.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Dropdown>
        <Text size={200} className={styles.toolbarHint}>
          {list ? `${list.name} · ` : ''}
          共 {tasks.length} 条
        </Text>
      </div>

      <div className={styles.scroll}>
        {tasks.length === 0 ? (
          <EmptyState title={filter === 'done' ? '还没有已完成任务' : '没有匹配的任务'} />
        ) : wide ? (
          <div className={styles.columns}>
            {columns.map((columnGroups, index) => (
              <div key={`column-${index}`} className={styles.column}>
                {columnGroups.map(renderGroup)}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.content}>{groups.map(renderGroup)}</div>
        )}
      </div>
    </div>
  );
}
