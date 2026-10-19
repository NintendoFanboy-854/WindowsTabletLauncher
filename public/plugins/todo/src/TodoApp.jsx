/**
 * 待办卡片视图（R3 / docs/UI-REWRITE-SPEC.md §3.5）。
 *
 * 字号层级（Fluent type ramp，数字主信息按 D-07 Display XL）：
 * - 1×1：未完成计数 XL-48（48/56）+ 标签 14；删掉首条任务
 * - 2×2：计数 Hero700（28/36）+ 4 行（标题 Base400 16 / 元信息 Base200 12，行高 44）
 * - 3×2：计数 28 + 行预算 ≤6 + 输入/添加 40
 * - 3×3：计数 28 + 行数 = min(10, floor(可用高度/44))，超出滚动 + 底部渐隐
 * - 4×2：两栏列头计数 Base600（24）+ 行 16/12
 *
 * 间距按尺寸档：1×1=8；2×2=12；3×2/4×2=12 纵/16 横；3×3=16；列表行距 4（spacingVerticalXS）。
 * 所有可点目标 ≥40×40；设置/详情/全部任务走宿主 ?view= 浮层。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Input,
  Menu,
  MenuGroup,
  MenuGroupHeader,
  MenuItem,
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
  CalendarLtr20Regular,
  Checkmark20Regular,
  Clock20Regular,
  DataHistogram20Regular,
  Dismiss20Regular,
  Folder20Regular,
  MoreHorizontal20Regular,
  Search20Regular,
  Settings20Regular,
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
import { addDays, dayKey, fmtDate, isSameDay, startOfMonth, startOfWeek } from '../js/date.js';
import { CONFIG_KEY, DEFAULT_CONFIG, normalizeConfig, SORT_OPTIONS } from './config.js';
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
import {
  DISPLAY_WEIGHT,
  TABULAR_NUMS,
  displayXl,
} from '../../_shared/typography.js';
import {
  EmptyState,
  ScrollArea,
  TaskRows,
  useFitRows,
  useTodoStyles,
} from './components.jsx';
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
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    outline: 'none',
  },
  /* 间距按尺寸档（UI-REWRITE-SPEC §2 / §3.5） */
  padSummary: { padding: tokens.spacingVerticalS, gap: tokens.spacingVerticalXS },
  padMini: { padding: tokens.spacingVerticalM, gap: tokens.spacingVerticalS },
  padMedium: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    gap: tokens.spacingVerticalS,
  },
  padFull: { padding: tokens.spacingVerticalL, gap: tokens.spacingVerticalXS },
  padWide: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    gap: tokens.spacingVerticalS,
  },
  summaryMain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
  },
  summaryCount: {
    ...displayXl(48),
    fontWeight: DISPLAY_WEIGHT,
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground1,
  },
  summaryLabel: { color: tokens.colorNeutralForeground2 },
  tabular: { fontVariantNumeric: 'tabular-nums', lineHeight: tokens.lineHeightHero700 },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  headerName: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
    minHeight: '40px',
  },
  countGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  spacer: { flex: 1, minWidth: 0 },
  listViewport: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  composer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  composerInput: { flex: 1 },
  inputLarge: { fontSize: tokens.fontSizeBase400 },
  buttonLarge: { minHeight: '40px', fontSize: tokens.fontSizeBase400 },
  moreRow: {
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0,
  },
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
    gap: tokens.spacingVerticalXS,
  },
  wideColHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  completeHint: { color: tokens.colorNeutralForeground3 },
  menuItem: { minHeight: '40px' },
});

/** 计数主层（列表卡 header ≥28px：DENSITY §2.1 断言 1） */
function CountHeader({ count, name, size = 700 }) {
  const styles = useStyles();
  return (
    <div className={styles.header}>
      <Text className={styles.tabular} size={size} weight="semibold">
        {count}
      </Text>
      <Text size={200} className={styles.headerName}>
        {name}
      </Text>
    </div>
  );
}

/**
 * 列表：可视行数 = min(budget, floor(可用高度/行距))；
 * 放不下的行进入滚动区，底部有渐隐提示；超出预算时给「查看全部」入口，禁止静默裁切。
 */
function FitList({ tasks, maxRows, budget, manualSort, onToggle, onOpenDetail, onReorder, onMore }) {
  const styles = useStyles();
  const viewportRef = useRef(null);
  const rows = useFitRows(viewportRef, maxRows);
  const hardBudget = budget ?? tasks.length;
  const visibleCount = Math.max(1, Math.min(rows, hardBudget));
  const visible = tasks.slice(0, visibleCount);
  const rest = tasks.slice(visibleCount, hardBudget);
  const beyondBudget = tasks.length - hardBudget;
  return (
    <div className={styles.listViewport} ref={viewportRef} data-visible-rows={visibleCount}>
      <ScrollArea>
        <TaskRows
          tasks={visible}
          manualSort={manualSort}
          onToggle={onToggle}
          onOpenDetail={onOpenDetail}
          onReorder={onReorder}
        />
        {rest.length > 0 ? (
          <TaskRows
            tasks={rest}
            manualSort={manualSort}
            onToggle={onToggle}
            onOpenDetail={onOpenDetail}
            onReorder={onReorder}
          />
        ) : null}
        {beyondBudget > 0 ? (
          <div className={styles.moreRow}>
            <Button appearance="subtle" size="large" onClick={onMore}>
              查看全部（{tasks.length}）
            </Button>
          </div>
        ) : null}
      </ScrollArea>
    </div>
  );
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
  const fullViewportRef = useRef(null);
  const [composerFocusAt, setComposerFocusAt] = useState(0);
  const fullRowsFit = useFitRows(fullViewportRef, 8);

  useEffect(() => {
    if (!composerFocusAt) return;
    composerRef.current?.focus();
  }, [composerFocusAt]);

  useEffect(
    () =>
      plugin.onFocus(
        () => rootRef.current?.querySelector('button, [role="checkbox"], input')?.focus() ?? rootRef.current?.focus(),
      ),
    [],
  );

  useSettingsRequest(() => openSettingsView());

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

  const focusComposer = useCallback(() => {
    ui.setComposerOpen(true);
    setComposerFocusAt((value) => value + 1);
  }, [ui]);

  const actions = useMemo(
    () => ({
      /* 3×3 动态行预算：min(10, floor(可用高度/44))，由视图消费 */
      rowBudget: Math.min(8, Math.max(1, fullRowsFit)),
      emptyAction: kind === 'mini' || kind === 'summary' ? '新建任务' : '添加任务',
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, currentListId, fullRowsFit, config.weekStart, ui.calCursor, ui.weekCursor, focusComposer],
  );

  useAgentTools(TOOL_DECLS, useMemo(() => buildToolHandlers(), []));

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
    <MenuItem
      className={styles.menuItem}
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
              <MenuItem
                key={item.id}
                className={styles.menuItem}
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
            <MenuItem
              className={styles.menuItem}
              onClick={() => ui.setListScope('all')}
              secondaryContent={ui.listScope === 'all' ? <Checkmark20Regular /> : null}
            >
              全部清单
            </MenuItem>
            {store.lists.map((list) => (
              <MenuItem
                key={list.id}
                className={styles.menuItem}
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
              <MenuItem
                key={option.value}
                className={styles.menuItem}
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

  const renderComposer = (leading) => (
    <form className={styles.composer} onSubmit={submitComposer}>
      {leading}
      <Input
        ref={composerRef}
        className={mergeClasses(styles.composerInput, styles.inputLarge)}
        appearance="outline"
        size="large"
        placeholder={ui.composerDue ? `添加到 ${fmtDate(new Date(`${ui.composerDue}T00:00:00`))}…` : '添加任务，回车提交'}
        aria-label="添加任务"
      />
      {ui.composerDue ? (
        <Tooltip content="清除日期" relationship="label">
          <Button
            appearance="subtle"
            size="large"
            className={styles.buttonLarge}
            icon={<Dismiss20Regular />}
            onClick={() => ui.setComposerDue(null)}
          >
            {fmtDate(new Date(`${ui.composerDue}T00:00:00`))}
          </Button>
        </Tooltip>
      ) : null}
      <Button appearance="primary" type="submit" size="large" className={styles.buttonLarge}>
        添加
      </Button>
    </form>
  );
  const composer = renderComposer(null);

  const rootProps = (contentKind) => ({
    ref: rootRef,
    role: 'group',
    tabIndex: -1,
    'data-size-key': sizeKey,
    'data-kind': contentKind,
    'data-row-height': 44,
    'data-row-gap': 4,
    'data-max-font': contentKind === 'summary' ? 48 : contentKind === 'wide' ? 24 : 28,
    'data-visible-rows': contentKind === 'full' ? Math.min(8, fullRowsFit) : undefined,
  });

  /* ---------------------------------------------------------------- 1×1：计数 XL-48 + 标签 14（无首条任务） */
  if (kind === 'summary') {
    const undone = store.state.tasks.filter((task) => task.listId === currentListId && !task.done);
    const today = new Date();
    const dueToday = undone.filter((task) => task.dueAt && isSameDay(task.dueAt, today));
    return (
      <div
        {...rootProps('summary')}
        className={mergeClasses(styles.root, styles.padSummary, styles.summaryMain)}
        onContextMenu={(event) => {
          event.preventDefault();
          openSettingsView();
        }}
        aria-label={`${currentList?.name || '待办'}：${undone.length} 项未完成，${dueToday.length} 项今日到期`}
      >
        <Toaster toasterId={TOASTER_ID} position="bottom-end" />
        <span className={styles.summaryCount}>{undone.length}</span>
        <Text size={300} className={styles.summaryLabel}>
          未完成 · 今日 {dueToday.length}
        </Text>
      </div>
    );
  }

  /* ---------------------------------------------------------------- 2×2 / 3×2：计数 28 + 行预算 4/6 + 输入（3×2） */
  if (kind === 'mini' || kind === 'medium') {
    const list = currentList;
    const tasks = store.sortTasks(store.state.tasks.filter((task) => task.listId === list.id && !task.done), ui.sort);
    return (
      <div
        {...rootProps(kind)}
        className={mergeClasses(styles.root, kind === 'mini' ? styles.padMini : styles.padMedium)}
        aria-label={`${list.name}：${tasks.length} 项未完成`}
      >
        <Toaster toasterId={TOASTER_ID} position="bottom-end" />
        {kind === 'mini' ? <CountHeader count={tasks.length} name={list.name} /> : null}
        {tasks.length === 0 ? (
          <EmptyState title="没有待办" actionLabel={actions.emptyAction} onAction={actions.onEmptyAction} />
        ) : (
          <FitList
            tasks={tasks}
            maxRows={budget || 4}
            budget={budget}
            manualSort={ui.sort === 'manual'}
            onToggle={actions.onToggle}
            onOpenDetail={actions.onOpenDetail}
            onReorder={actions.onReorder}
            onMore={() => openAllTasks({ listId: list.id })}
          />
        )}
        {kind === 'medium'
          ? renderComposer(
              <div className={styles.countGroup} aria-label={`${tasks.length} 项未完成`}>
                <Text className={styles.tabular} size={700} weight="semibold">
                  {tasks.length}
                </Text>
                <Text size={200} className={styles.headerName}>
                  未完成
                </Text>
              </div>,
            )
          : null}
      </div>
    );
  }

  /* ---------------------------------------------------------------- 4×2：两栏列头计数 24 + 行 16/12 */
  if (kind === 'wide') {
    const list = currentList;
    const undone = store.sortTasks(store.state.tasks.filter((task) => task.listId === list.id && !task.done), ui.sort);
    const done = store.sortTasks(store.state.tasks.filter((task) => task.listId === list.id && task.done), 'created').reverse();
    return (
      <div {...rootProps('wide')} className={mergeClasses(styles.root, styles.padWide)} aria-label={`${list.name}：${undone.length} 项未完成`}>
        <Toaster toasterId={TOASTER_ID} position="bottom-end" />
        <div className={styles.wideCols}>
          <section className={styles.wideCol} aria-label="未完成">
            <div className={styles.wideColHead}>
              <Text className={styles.tabular} size={700} weight="semibold">
                {undone.length}
              </Text>
              <Text size={200} className={styles.headerName}>
                未完成
              </Text>
              <span className={styles.spacer} />
              <Tooltip content="添加任务" relationship="label">
                <Button
                  appearance="subtle"
                  size="large"
                  className={todoStyles.iconButton}
                  icon={<Add20Regular />}
                  aria-label="添加任务"
                  onClick={() => focusComposer()}
                />
              </Tooltip>
            </div>
            {undone.length === 0 ? (
              <Text size={200} className={styles.completeHint}>
                全部做完了
              </Text>
            ) : (
              <FitList
                tasks={undone}
                maxRows={30}
                manualSort={ui.sort === 'manual'}
                onToggle={actions.onToggle}
                onOpenDetail={actions.onOpenDetail}
                onReorder={actions.onReorder}
                onMore={() => openAllTasks({ listId: list.id })}
              />
            )}
          </section>
          <section className={styles.wideCol} aria-label="已完成">
            <div className={styles.wideColHead}>
              <Text className={styles.tabular} size={700} weight="semibold">
                {done.length}
              </Text>
              <Text size={200} className={styles.headerName}>
                已完成
              </Text>
            </div>
            {done.length === 0 ? (
              <Text size={200} className={styles.completeHint}>
                暂无已完成
              </Text>
            ) : (
              <FitList
                tasks={done}
                maxRows={30}
                onToggle={actions.onToggle}
                onOpenDetail={actions.onOpenDetail}
                onReorder={actions.onReorder}
                onMore={() => openAllTasks({ done: true })}
              />
            )}
          </section>
        </div>
        {ui.composerOpen ? composer : null}
      </div>
    );
  }

  /* ---------------------------------------------------------------- 3×3：工具栏（计数 28 + 今日/最近 + 搜索 + ⋯）+ 动态行 + 输入 */
  const scopeTasks = ui.listScope === 'all' ? store.state.tasks : store.state.tasks.filter((task) => task.listId === ui.listScope);
  const scopeUndone = scopeTasks.filter((task) => !task.done).length;
  const isPrimaryView = ui.view === 'daytodo' || ui.view === 'recent';
  let viewContent = null;
  if (ui.query.trim()) {
    const hits = store.searchTasks(ui.query).filter((task) => ui.listScope === 'all' || task.listId === ui.listScope);
    viewContent = (
      <>
        <Text size={300} weight="semibold" className={styles.headerName}>
          搜索结果 · “{ui.query}”（{hits.length}）
        </Text>
        {hits.length === 0 ? (
          <EmptyState title="没有匹配" />
        ) : (
          <TaskRows
            tasks={hits.slice(0, Math.max(1, Math.min(8, fullRowsFit)))}
            onToggle={actions.onToggle}
            onOpenDetail={actions.onOpenDetail}
            onReorder={actions.onReorder}
          />
        )}
      </>
    );
  } else if (ui.view === 'daytodo') {
    viewContent = <DayTodoView ctx={ctx} />;
  } else if (ui.view === 'recent') {
    viewContent = <RecentView ctx={ctx} />;
  } else if (ui.view === 'category') {
    viewContent = <CategoryView ctx={ctx} />;
  } else if (ui.view === 'calendar') {
    viewContent = <CalendarView ctx={ctx} />;
  } else {
    viewContent = <WeekMonthView ctx={ctx} />;
  }
  const calendarLike = !ui.query.trim() && (ui.view === 'calendar' || ui.view === 'weekmonth');

  return (
    <div {...rootProps('full')} className={mergeClasses(styles.root, styles.padFull)} aria-label="待办清单">
      <Toaster toasterId={TOASTER_ID} position="bottom-end" />
      <div className={styles.toolbarRow}>
        <div className={styles.countGroup}>
          <Text className={styles.tabular} size={700} weight="semibold">
            {scopeUndone}
          </Text>
          <Text size={200} className={styles.headerName}>
            未完成
          </Text>
        </div>
        <span className={styles.spacer} />
        <TabList
          className={todoStyles.tabs}
          selectedValue={isPrimaryView ? ui.view : undefined}
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
            className={mergeClasses(todoStyles.search, styles.inputLarge)}
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
      <div className={styles.listViewport} ref={fullViewportRef}>
        {calendarLike ? (
          viewContent
        ) : (
          <ScrollArea>
            <div className={todoStyles.content}>{viewContent}</div>
          </ScrollArea>
        )}
      </div>
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
