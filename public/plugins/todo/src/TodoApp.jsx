/**
 * 待办卡片视图（DECISIONS D-02b）。
 *
 * 尺寸档位（DENSITY / D-04）：
 * - 1×1  计数 + 首条任务
 * - 2×2  当前清单列表（≤4 行）+「查看全部」，无输入框
 * - 3×2  清单名 + 列表（≤6 行）+ 常驻输入框
 * - 3×3  工具条（今日 / 最近 + 搜索 + ⋯）+ 视图 + 输入框
 * - 4×2  左未完成 / 右已完成两栏（各自内部滚动 + 计数）
 *
 * 五视图保留：今日 / 最近 / 分类清单 / 日历+任务 / 周视图·月视图；常驻只留今日/最近，其余在 ⋯ 菜单。
 * 所有可点目标 ≥40×40；长按任务行打开宿主全窗口详情浮层。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Menu,
  MenuGroup,
  MenuGroupHeader,
  MenuItem,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tab,
  TabList,
  Text,
  Toaster,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
  useToastController,
} from '@fluentui/react-components';
import {
  Add20Regular,
  ArrowSort20Regular,
  CalendarLtr20Regular,
  Checkmark20Regular,
  ChevronDown20Regular,
  Clock20Regular,
  DataHistogram20Regular,
  Dismiss20Regular,
  Folder20Regular,
  MoreHorizontal20Regular,
  Search20Regular,
  Settings20Regular,
  TaskListLtr20Regular,
} from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import {
  exitFocus,
  useAgentTools,
  useHostSize,
  useSettingsRequest,
  useStoredConfig,
} from '../../_shared/host.js';
import { store as todoStore } from '../js/store.js';
import { addDays, addMonths, dayKey, fmtDate, isSameDay, startOfMonth, startOfWeek, toDate } from '../js/date.js';
import { CONFIG_KEY, DEFAULT_CONFIG, normalizeConfig, SORT_OPTIONS, textSizeFor } from './config.js';
import { layoutKind, rowBudget, sizeKeyOf } from './sizes.js';
import {
  buildToolHandlers,
  openAllTasks,
  openNewTask,
  openSettingsView,
  openTaskDetail,
  TOOL_DECLS,
  useApplyConfig,
  useTodoStore,
} from './todoData.js';
import { EmptyState, GroupHead, TaskRows, useTodoStyles } from './components.jsx';
import { CalendarView, CategoryView, DayTodoView, RecentView, WeekMonthView } from './views.jsx';

const TOASTER_ID = 'todo-toast';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spacingVerticalS,
    gap: tokens.spacingVerticalXXS,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    outline: 'none',
  },
  rootSummary: { justifyContent: 'center', padding: tokens.spacingVerticalM },
  rootMini: { justifyContent: 'center' },
  menuItem: { minHeight: '40px' },
  summaryMain: { display: 'flex', alignItems: 'baseline', gap: tokens.spacingHorizontalS },
  summaryLabel: { color: tokens.colorNeutralForeground3 },
  summaryFirst: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
    marginTop: tokens.spacingVerticalM,
  },
  summaryTitle: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground2,
  },
  listHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
    minHeight: '24px',
  },
  listName: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  listCount: { color: tokens.colorNeutralForeground4, fontVariantNumeric: 'tabular-nums' },
  listScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  completeHint: { color: tokens.colorNeutralForeground4, paddingBlock: tokens.spacingVerticalS },
  composer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
    paddingTop: tokens.spacingVerticalXS,
  },
  composerInput: { flex: 1 },
  dueBadge: { flexShrink: 0 },
  wideCols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalS,
    flex: 1,
    minHeight: 0,
  },
  wideCol: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    padding: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  wideColHead: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
    minHeight: '24px',
  },
  wideColBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
});

function scopeTasks(store, listScope) {
  if (!listScope || listScope === 'all') return store.state.tasks;
  return store.state.tasks.filter((task) => task.listId === listScope);
}

export default function TodoApp({ defaultSizeKey = '3x3' }) {
  const styles = useStyles();
  const todoStyles = useTodoStyles();
  const sizeKey = useHostSize(sizeKeyOf, defaultSizeKey);
  const kind = layoutKind(sizeKey);
  const budget = rowBudget(kind);
  const store = useTodoStore();
  const [config, setConfig, configLoaded] = useStoredConfig(CONFIG_KEY, DEFAULT_CONFIG, normalizeConfig);
  useApplyConfig(config, configLoaded);
  const { dispatchToast } = useToastController(TOASTER_ID);

  const notify = useCallback(
    (text) => {
      dispatchToast(<Text size={200}>{text}</Text>, { timeout: 2200 });
    },
    [dispatchToast],
  );

  const ui = useUiState(kind, config, configLoaded, store);
  const rootRef = useRef(null);
  const composerRef = useRef(null);
  const [composerFocusAt, setComposerFocusAt] = useState(0);

  useEffect(() => {
    if (!composerFocusAt) return;
    composerRef.current?.focus();
  }, [composerFocusAt]);

  useEffect(() => plugin.onFocus(() => rootRef.current?.querySelector('button, [role="checkbox"], input')?.focus() ?? rootRef.current?.focus()), []);

  useSettingsRequest(() => openSettingsView());

  /* Esc：先收搜索，再把焦点交还宿主（浮层由宿主 Dialog 处理 Esc） */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (ui.searchOpen) {
        ui.setSearchOpen(false);
        ui.setQuery('');
        event.preventDefault();
        return;
      }
      exitFocus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ui]);

  const currentListId = store.settings.defaultListId || store.lists[0]?.id;
  const currentList = store.listById(currentListId) || store.lists[0];

  const actions = useMemo(() => {
    const focusComposer = () => {
      ui.setComposerOpen(true);
      setComposerFocusAt((value) => value + 1);
    };
    return {
      rowBudget: budget,
      emptyAction: kind === 'mini' ? '新建任务' : '添加任务',
      onEmptyAction: () => {
        if (kind === 'mini' || kind === 'summary') openNewTask(currentListId);
        else focusComposer();
      },
      onToggle: (taskId) => {
        const task = store.taskById(taskId);
        if (!task) return;
        store.setDone(taskId, !task.done);
      },
      onOpenDetail: openTaskDetail,
      onReorder: (listId, ids) => todoStore.reorderTasks(listId, ids),
      onOpenAll: openAllTasks,
      onSelectDay: (day) => ui.setSelectedDay(day),
      onAddDay: (day) => {
        ui.setComposerDue(day);
        focusComposer();
      },
      onCalPrev: () => ui.setCalCursor(new Date(ui.calCursor.getFullYear(), ui.calCursor.getMonth() - 1, 1)),
      onCalNext: () => ui.setCalCursor(new Date(ui.calCursor.getFullYear(), ui.calCursor.getMonth() + 1, 1)),
      onCalToday: () => {
        const now = new Date();
        ui.setCalCursor(startOfMonth(now));
        ui.setWeekCursor(startOfWeek(now, config.weekStart));
        ui.setSelectedDay(dayKey(now));
      },
      onWeekPrev: () => ui.setWeekCursor(addDays(ui.weekCursor, -7)),
      onWeekNext: () => ui.setWeekCursor(addDays(ui.weekCursor, 7)),
      onToggleCompleted: () => ui.setCompletedOpen((value) => !value),
      onSetCalMode: (mode) => ui.setCalMode(mode),
      onToggleHeatWeight: () => ui.setHeatWeighted((value) => !value),
      onOpenSettings: openSettingsView,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, kind, currentListId, store, config.weekStart, ui.calCursor, ui.weekCursor, ui.setCalCursor, ui.setWeekCursor, ui.setSelectedDay, ui.setComposerDue, ui.setComposerOpen, ui.setCompletedOpen, ui.setHeatWeighted]);

  useAgentTools(TOOL_DECLS, useMemo(() => buildToolHandlers(), []));

  const focusComposer = useCallback(() => {
    ui.setComposerOpen(true);
    setComposerFocusAt((value) => value + 1);
  }, [ui]);

  const submitComposer = useCallback(
    (event) => {
      event.preventDefault();
      const input = composerRef.current;
      const title = input?.value?.trim();
      if (!title) return;
      let listId = currentListId;
      if (kind === 'full') listId = ui.listScope === 'all' ? currentListId : ui.listScope;
      try {
        todoStore.addTask({ title, listId, dueAt: ui.composerDue || undefined });
        if (input) input.value = '';
        ui.setComposerDue(null);
        setComposerFocusAt((value) => value + 1);
        notify('已添加任务');
      } catch (error) {
        notify(error instanceof Error ? error.message : String(error));
      }
    },
    [currentListId, kind, notify, ui],
  );

  const heatmapToggle = (
    <MenuItem className={styles.menuItem}
      icon={ui.heatmapOpen ? <Checkmark20Regular /> : <DataHistogram20Regular />}
      onClick={() => ui.setHeatmapOpen((value) => !value)}
    >
      工作量热力图
    </MenuItem>
  );

  const moreMenu = (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Tooltip content="更多" relationship="label">
          <Button
            appearance="subtle"
            className={todoStyles.iconButton}
            icon={<MoreHorizontal20Regular />}
            aria-label="更多"
          />
        </Tooltip>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuGroup>
            <MenuGroupHeader>视图</MenuGroupHeader>
            {[
              { id: 'category', label: '分类清单', icon: <Folder20Regular /> },
              { id: 'calendar', label: '日历 + 任务', icon: <CalendarLtr20Regular /> },
              { id: 'weekmonth', label: '周视图 / 月视图', icon: <Clock20Regular /> },
            ].map((item) => (
              <MenuItem className={styles.menuItem}
                key={item.id}
                icon={item.icon}
                onClick={() => ui.setView(item.id)}
                secondaryContent={ui.view === item.id ? <Checkmark20Regular /> : null}
              >
                {item.label}
              </MenuItem>
            ))}
          </MenuGroup>
          <MenuGroup>
            <MenuGroupHeader>清单</MenuGroupHeader>
            <MenuItem className={styles.menuItem}
              onClick={() => ui.setListScope('all')}
              secondaryContent={ui.listScope === 'all' ? <Checkmark20Regular /> : null}
            >
              全部清单
            </MenuItem>
            {store.lists.map((list) => (
              <MenuItem className={styles.menuItem}
                key={list.id}
                onClick={() => ui.setListScope(list.id)}
                secondaryContent={ui.listScope === list.id ? <Checkmark20Regular /> : null}
              >
                {list.name}
              </MenuItem>
            ))}
            <MenuItem className={styles.menuItem} icon={<Add20Regular />} onClick={openSettingsView}>
              新建清单…
            </MenuItem>
          </MenuGroup>
          <MenuGroup>
            <MenuGroupHeader>排序</MenuGroupHeader>
            {SORT_OPTIONS.map((option) => (
              <MenuItem className={styles.menuItem}
                key={option.value}
                onClick={() => ui.setSort(option.value)}
                secondaryContent={ui.sort === option.value ? <Checkmark20Regular /> : null}
              >
                排序：{option.label}
              </MenuItem>
            ))}
          </MenuGroup>
          <MenuGroup>{heatmapToggle}</MenuGroup>
          <MenuItem className={styles.menuItem} icon={<Settings20Regular />} onClick={openSettingsView}>
            待办设置…
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );

  const ctx = {
    store,
    config,
    ui: {
      view: ui.view,
      listScope: ui.listScope,
      sort: ui.sort,
      selectedDay: ui.selectedDay,
      calCursor: ui.calCursor,
      weekCursor: ui.weekCursor,
      calMode: ui.calMode,
      completedOpen: ui.completedOpen,
      heatmapOn: ui.heatmapOn,
      heatWeighted: ui.heatWeighted,
    },
    actions,
  };

  const composer = (
    <form className={styles.composer} onSubmit={submitComposer}>
      <Input
        ref={composerRef}
        className={styles.composerInput}
        appearance="outline"
        size="large"
        placeholder={ui.composerDue ? `添加到 ${fmtDate(new Date(`${ui.composerDue}T00:00:00`))}…` : '添加任务，回车提交'}
        aria-label="添加任务"
      />
      {ui.composerDue ? (
        <Tooltip content="清除日期" relationship="label">
          <Button
            appearance="subtle"
            icon={<Dismiss20Regular />}
            onClick={() => ui.setComposerDue(null)}
          >
            {fmtDate(new Date(`${ui.composerDue}T00:00:00`))}
          </Button>
        </Tooltip>
      ) : null}
      <Button appearance="primary" type="submit" size="medium" className={todoStyles.emptyAction}>
        添加
      </Button>
    </form>
  );

  /* ---------------------------------------------------------------- 1×1 */
  if (kind === 'summary') {
    const undone = store.state.tasks.filter((task) => task.listId === currentListId && !task.done);
    const first = store.sortTasks(undone, 'due')[0];
    const today = new Date();
    const dueToday = undone.filter((task) => task.dueAt && isSameDay(task.dueAt, today));
    return (
      <div
        className={mergeClasses(styles.root, styles.rootSummary)}
        ref={rootRef}
        tabIndex={-1}
        onContextMenu={(event) => {
          event.preventDefault();
          openSettingsView();
        }}
        aria-label={`${currentList?.name || '待办'}：${undone.length} 项未完成，${dueToday.length} 项今日到期`}
      >
        <Toaster toasterId={TOASTER_ID} position="bottom-end" />
        <div className={styles.summaryMain}>
          <Text size={textSizeFor(config, 800)} weight="semibold" style={{ lineHeight: 1 }}>
            {undone.length}
          </Text>
          <Text size={200} className={styles.summaryLabel}>
            未完成 · 今日 {dueToday.length}
          </Text>
        </div>
        <div className={styles.summaryFirst}>
          <TaskListLtr20Regular aria-hidden="true" style={{ color: tokens.colorNeutralForeground4 }} />
          <Text size={200} className={styles.summaryTitle} title={first?.title || '没有待办'}>
            {first ? first.title : '没有待办'}
          </Text>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- 2×2 / 3×2 */
  if (kind === 'mini' || kind === 'medium') {
    const list = currentList;
    const tasks = store.sortTasks(store.state.tasks.filter((task) => task.listId === list.id && !task.done), ui.sort);
    const visible = tasks.slice(0, budget);
    const hidden = tasks.length - visible.length;
    return (
      <div className={mergeClasses(styles.root, kind === 'mini' && styles.rootMini)} ref={rootRef} tabIndex={-1} aria-label={`${list.name}：${tasks.length} 项未完成`}>
        <Toaster toasterId={TOASTER_ID} position="bottom-end" />
        <div className={styles.listHead}>
          <Text size={200} className={styles.listName}>
            {list.name}
          </Text>
          <Text size={200} className={styles.listCount}>
            {tasks.length}
          </Text>
        </div>
        <div className={styles.listScroll}>
          {tasks.length === 0 ? (
            <EmptyState
              title="没有待办"
              actionLabel={kind === 'medium' ? '添加任务' : '新建任务'}
              onAction={actions.onEmptyAction}
            />
          ) : (
            <TaskRows
              tasks={visible}
              manualSort={ui.sort === 'manual'}
              onToggle={actions.onToggle}
              onOpenDetail={actions.onOpenDetail}
              onReorder={actions.onReorder}
            />
          )}
          {hidden > 0 ? (
            <Button
              appearance="subtle"
              className={todoStyles.more}
              onClick={() => openAllTasks({ listId: list.id })}
            >
              查看全部（{tasks.length}）
            </Button>
          ) : null}
        </div>
        {kind === 'medium' ? composer : null}
      </div>
    );
  }

  /* ---------------------------------------------------------------- 4×2 */
  if (kind === 'wide') {
    const list = currentList;
    const undone = store.sortTasks(store.state.tasks.filter((task) => task.listId === list.id && !task.done), ui.sort);
    const done = store.sortTasks(store.state.tasks.filter((task) => task.listId === list.id && task.done), 'created').reverse();
    return (
      <div className={styles.root} ref={rootRef} tabIndex={-1} aria-label={`${list.name}：${undone.length} 项未完成`}>
        <Toaster toasterId={TOASTER_ID} position="bottom-end" />
        <div className={styles.listHead}>
          <Text size={200} className={styles.listName}>
            {list.name}
          </Text>
          <Text size={200} className={styles.listCount}>
            {undone.length}
          </Text>
          <span className={todoStyles.spacer} />
          {ui.composerOpen ? null : (
            <Tooltip content="添加任务" relationship="label">
              <Button
                appearance="subtle"
                className={todoStyles.iconButton}
                icon={<Add20Regular />}
                aria-label="添加任务"
                onClick={() => focusComposer()}
              />
            </Tooltip>
          )}
        </div>
        <div className={styles.wideCols}>
          <section className={styles.wideCol} aria-label="未完成">
            <div className={styles.wideColHead}>
              <Text size={200} className={styles.listName}>
                未完成
              </Text>
              <Text size={200} className={styles.listCount}>
                {undone.length}
              </Text>
            </div>
            <div className={styles.wideColBody}>
              {undone.length === 0 ? (
                <Text size={200} className={styles.completeHint}>
                  全部做完了
                </Text>
              ) : (
                <TaskRows
                  tasks={undone}
                  manualSort={ui.sort === 'manual'}
                  onToggle={actions.onToggle}
                  onOpenDetail={actions.onOpenDetail}
                  onReorder={actions.onReorder}
                />
              )}
            </div>
          </section>
          <section className={styles.wideCol} aria-label="已完成">
            <div className={styles.wideColHead}>
              <Text size={200} className={styles.listName}>
                已完成
              </Text>
              <Text size={200} className={styles.listCount}>
                {done.length}
              </Text>
            </div>
            <div className={styles.wideColBody}>
              {done.length === 0 ? (
                <Text size={200} className={styles.completeHint}>
                  暂无已完成
                </Text>
              ) : (
                <TaskRows
                  tasks={done}
                  onToggle={actions.onToggle}
                  onOpenDetail={actions.onOpenDetail}
                  onReorder={actions.onReorder}
                />
              )}
            </div>
          </section>
        </div>
        {ui.composerOpen ? composer : null}
      </div>
    );
  }

  /* ---------------------------------------------------------------- 3×3 */
  const view = ui.view;
  let viewContent = null;
  if (ui.query.trim()) {
    const hits = store.searchTasks(ui.query).filter(
      (task) => ui.listScope === 'all' || task.listId === ui.listScope,
    );
    viewContent = (
      <div className={todoStyles.content}>
        <GroupHead label={`搜索结果 · “${ui.query}”`} count={hits.length} />
        {hits.length === 0 ? (
          <EmptyState title="没有匹配" />
        ) : (
          <TaskRows
            tasks={hits.slice(0, 10)}
            onToggle={actions.onToggle}
            onOpenDetail={actions.onOpenDetail}
            onReorder={actions.onReorder}
          />
        )}
      </div>
    );
  } else if (view === 'daytodo') {
    viewContent = <div className={todoStyles.content}><DayTodoView ctx={ctx} /></div>;
  } else if (view === 'recent') {
    viewContent = <div className={todoStyles.content}><RecentView ctx={ctx} /></div>;
  } else if (view === 'category') {
    viewContent = <div className={todoStyles.content}><CategoryView ctx={ctx} /></div>;
  } else if (view === 'calendar') {
    viewContent = <div className={todoStyles.content}><CalendarView ctx={ctx} /></div>;
  } else {
    viewContent = <div className={todoStyles.content}><WeekMonthView ctx={ctx} /></div>;
  }

  const isPrimaryView = view === 'daytodo' || view === 'recent';

  return (
    <div className={styles.root} ref={rootRef} tabIndex={-1} aria-label="待办清单">
      <Toaster toasterId={TOASTER_ID} position="bottom-end" />
      <div className={todoStyles.toolbar}>
        <TabList
          className={todoStyles.tabs}
          selectedValue={isPrimaryView ? view : undefined}
          onTabSelect={(_, data) => ui.setView(data.value)}
          aria-label="主视图"
        >
          <Tab value="daytodo">今日</Tab>
          <Tab value="recent">最近</Tab>
        </TabList>
        <Tooltip content="搜索" relationship="label">
          <Button
            appearance="subtle"
            className={todoStyles.iconButton}
            icon={<Search20Regular />}
            aria-label="搜索"
            aria-expanded={ui.searchOpen}
            onClick={() => {
              ui.setSearchOpen((value) => !value);
              if (ui.searchOpen) ui.setQuery('');
            }}
          />
        </Tooltip>
        {moreMenu}
      </div>
      {ui.searchOpen ? (
        <div className={todoStyles.searchRow}>
          <Input
            className={todoStyles.search}
            appearance="outline"
            size="large"
            contentBefore={<Search20Regular />}
            placeholder="搜索标题、备注、标签、子任务"
            value={ui.query}
            autoFocus
            onChange={(_, data) => ui.setQuery(data.value)}
            aria-label="搜索任务"
          />
          <Tooltip content="关闭搜索" relationship="label">
            <Button
              appearance="subtle"
              className={todoStyles.iconButton}
              icon={<Dismiss20Regular />}
              aria-label="关闭搜索"
              onClick={() => {
                ui.setSearchOpen(false);
                ui.setQuery('');
              }}
            />
          </Tooltip>
        </div>
      ) : null}
      {viewContent}
      {composer}
    </div>
  );
}

/* ---------------------------------------------------------------- UI 状态 */

function useUiState(kind, config, configLoaded, store) {
  const [view, setView] = useState('daytodo');
  const [listScope, setListScope] = useState(kind === 'full' ? 'all' : store.settings.defaultListId || store.lists[0]?.id);
  const [sort, setSort] = useState(config.defaultSort);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [heatWeighted, setHeatWeighted] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDue, setComposerDue] = useState(null);
  const [selectedDay, setSelectedDay] = useState(() => dayKey(new Date()));
  const [calCursor, setCalCursor] = useState(() => startOfMonth(new Date()));
  const [weekCursor, setWeekCursor] = useState(() => startOfWeek(new Date(), config.weekStart));
  const [calMode, setCalMode] = useState('month');
  const appliedSortRef = useRef(false);

  useEffect(() => {
    if (!configLoaded || appliedSortRef.current) return;
    appliedSortRef.current = true;
    setSort(config.defaultSort);
    if (kind === 'full') setListScope('all');
    else setListScope(config.defaultListId || store.settings.defaultListId || store.lists[0]?.id);
    setWeekCursor(startOfWeek(new Date(), config.weekStart));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configLoaded]);

  return {
    view,
    setView,
    listScope,
    setListScope,
    sort,
    setSort,
    query,
    setQuery,
    searchOpen,
    setSearchOpen,
    completedOpen,
    setCompletedOpen,
    heatmapOn,
    setHeatmapOn,
    heatWeighted,
    setHeatWeighted,
    composerOpen,
    setComposerOpen,
    composerDue,
    setComposerDue,
    selectedDay,
    setSelectedDay,
    calCursor,
    setCalCursor,
    weekCursor,
    setWeekCursor,
    calMode,
    setCalMode,
  };
}
