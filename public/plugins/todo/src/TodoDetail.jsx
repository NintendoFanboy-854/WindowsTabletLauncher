/**
 * L1 待办详情（宿主 `?view=detail` 全窗口浮层）：
 *
 * - header 56：清单 Dropdown 140（筛选 +「管理清单…」）+ 搜索 Input（flex）+「添加任务」40；
 * - toolbar 48：当前筛选/未完成计数 +「设置…」（只发 requestHostSettings，契约 §5）；
 * - Tabs 40 常显：列表 / 日历 / 周视图 / 月视图 / 热力图；
 * - L2 子页：任务编辑（新建/编辑）与清单管理，push 在同一浮层内，不出现第二个 Dialog。
 *
 * 本组件自己不做关闭按钮：X / Esc / 遮罩属于宿主。
 */

import { useEffect, useState } from 'react';
import {
  Dropdown,
  Input,
  Option,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  Dismiss20Regular,
  Search20Regular,
  Settings20Regular,
} from '@fluentui/react-icons';
import { useStoredConfig } from '../../_shared/host.js';
import { CrossFade } from '../../_shared/motion.js';
import {
  ActionButton,
  DetailHeader,
  DetailPage,
  DetailScroll,
  DetailTabs,
  DetailToolbar,
  TOUCH_TARGET,
} from '../../_shared/ui.jsx';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  normalizeSettings,
} from '../js/config.js';
import { store } from '../js/store.js';
import { openHostSettings, useTodoStore } from './todoData.js';
import { ListView } from './ListView.jsx';
import { CalendarView, HeatmapView, MonthView, WeekView } from './TimeViews.jsx';
import { TaskEditor } from './TaskEditor.jsx';
import { ListManager } from './ListManager.jsx';

const TAB_ITEMS = [
  { value: 'list', label: '列表' },
  { value: 'calendar', label: '日历' },
  { value: 'week', label: '周视图' },
  { value: 'month', label: '月视图' },
  { value: 'heatmap', label: '热力图' },
];

const MANAGE_LISTS = '__manage-lists';

const useStyles = makeStyles({
  listDropdown: {
    minWidth: '140px',
    maxWidth: '180px',
    minHeight: `${TOUCH_TARGET}px`,
    flexShrink: 0,
  },
  search: {
    flex: 1,
    minWidth: 0,
  },
  scopeHint: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  spacer: { flex: 1, minWidth: 0 },
});

function initialFilter() {
  const id = store.settings.defaultListId;
  return id && store.listById(id) ? id : 'all';
}

export default function TodoDetail() {
  const styles = useStyles();
  useTodoStore();
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const [tab, setTab] = useState('list');
  const [listFilter, setListFilter] = useState(initialFilter);
  const [query, setQuery] = useState('');
  const [subpage, setSubpage] = useState(null);
  const now = new Date();

  // 清单在 L2 被删除后，L1 的筛选不能停留在一个不存在的 id 上。
  useEffect(() => {
    if (listFilter !== 'all' && !store.listById(listFilter)) {
      const fallback = store.settings.defaultListId;
      setListFilter(fallback && store.listById(fallback) ? fallback : 'all');
    }
  }, [listFilter, store.state.lists]);

  const filterLabel =
    listFilter === 'all' ? '全部清单' : store.listById(listFilter)?.name || '全部清单';
  const scopedTasks =
    listFilter === 'all'
      ? store.state.tasks
      : store.state.tasks.filter((task) => task.listId === listFilter);
  const undoneCount = scopedTasks.filter((task) => !task.done).length;

  const openTask = (taskId) => setSubpage({ kind: 'task', taskId });
  const toggleTask = (taskId) => {
    const task = store.taskById(taskId);
    if (task) store.setDone(taskId, !task.done);
  };
  const newTaskListId = listFilter === 'all' ? undefined : listFilter;
  const openNewTask = (dueDate) =>
    setSubpage({ kind: 'new', listId: newTaskListId, dueDate: dueDate || null });
  const closeSubpage = () => setSubpage(null);

  const editing =
    subpage && (subpage.kind === 'task' || subpage.kind === 'new') ? subpage : null;

  return (
    <DetailPage>
      <DetailHeader
        trailing={
          <ActionButton
            appearance="secondary"
            icon={<Add20Regular />}
            onClick={() => openNewTask(null)}
          >
            添加任务
          </ActionButton>
        }
      >
        <Dropdown
          size="large"
          className={styles.listDropdown}
          style={{ minHeight: `${TOUCH_TARGET}px` }}
          value={filterLabel}
          selectedOptions={[listFilter]}
          aria-label="筛选清单"
          onOptionSelect={(_event, data) => {
            const value = data.optionValue;
            if (value === MANAGE_LISTS) {
              setSubpage({ kind: 'lists' });
              return;
            }
            setListFilter(value);
          }}
        >
          <Option value="all">全部清单</Option>
          {store.lists.map((list) => (
            <Option key={list.id} value={list.id}>
              {list.name}
            </Option>
          ))}
          <Option value={MANAGE_LISTS}>管理清单…</Option>
        </Dropdown>

        <Input
          size="large"
          className={styles.search}
          style={{ minHeight: `${TOUCH_TARGET}px` }}
          appearance="outline"
          contentBefore={<Search20Regular />}
          contentAfter={
            query ? (
              <ActionButton
                appearance="transparent"
                icon={<Dismiss20Regular />}
                aria-label="清除搜索"
                onClick={() => setQuery('')}
              />
            ) : undefined
          }
          placeholder="搜索标题、备注、标签、子任务"
          aria-label="搜索任务"
          value={query}
          onChange={(_event, data) => setQuery(data.value)}
        />
      </DetailHeader>

      <DetailToolbar>
        <Text size={200} className={styles.scopeHint}>
          {filterLabel} · {undoneCount} 项未完成
        </Text>
        <span className={styles.spacer} />
        <ActionButton
          appearance="subtle"
          icon={<Settings20Regular />}
          onClick={openHostSettings}
        >
          设置…
        </ActionButton>
      </DetailToolbar>

      <DetailTabs items={TAB_ITEMS} value={tab} onChange={setTab} ariaLabel="待办视图" />

      <DetailScroll>
        <CrossFade value={tab}>
          {tab === 'list' ? (
            <ListView
              tasks={scopedTasks}
              query={query}
              settings={settings}
              now={now}
              listId={listFilter}
              onOpenTask={openTask}
              onToggleTask={toggleTask}
              onAddTask={() => openNewTask(null)}
              onClearSearch={() => setQuery('')}
            />
          ) : tab === 'calendar' ? (
            <CalendarView
              tasks={scopedTasks}
              now={now}
              settings={settings}
              onOpenTask={openTask}
              onToggleTask={toggleTask}
              onAddDay={openNewTask}
            />
          ) : tab === 'week' ? (
            <WeekView
              tasks={scopedTasks}
              now={now}
              settings={settings}
              onOpenTask={openTask}
              onToggleTask={toggleTask}
            />
          ) : tab === 'month' ? (
            <MonthView
              tasks={scopedTasks}
              now={now}
              settings={settings}
              onOpenTask={openTask}
              onToggleTask={toggleTask}
              onAddDay={openNewTask}
            />
          ) : (
            <HeatmapView now={now} settings={settings} />
          )}
        </CrossFade>
      </DetailScroll>

      {editing ? (
        <TaskEditor
          key={editing.kind === 'task' ? editing.taskId : `new-${editing.dueDate || 'none'}`}
          mode={editing.kind === 'task' ? 'edit' : 'new'}
          taskId={editing.taskId}
          initialListId={editing.listId}
          initialDueDate={editing.dueDate}
          settings={settings}
          onClosed={closeSubpage}
        />
      ) : null}

      {subpage?.kind === 'lists' ? <ListManager onClosed={closeSubpage} /> : null}
    </DetailPage>
  );
}
