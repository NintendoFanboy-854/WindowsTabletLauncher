/** 待办五种视图（今日 / 最近 / 分类清单 / 日历+任务 / 周视图·月视图）。 */

import { useMemo } from 'react';
import {
  Button,
  Checkbox,
  Tab,
  TabList,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  CalendarLtr20Regular,
  ChevronDown20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from '@fluentui/react-icons';
import {
  addDays,
  dayKey,
  fmtDate,
  fmtTime,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDate,
  weekdayLabels,
} from '../js/date.js';
import { GroupHead, EmptyState, TaskRows, MonthGrid, Heatmap, useTodoStyles } from './components.jsx';

const useStyles = makeStyles({
  grow: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
  section: { display: 'flex', flexDirection: 'column' },
  calWrap: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  calPanel: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    paddingTop: tokens.spacingVerticalXS,
    overflowY: 'auto',
  },
  dayHead: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minHeight: '40px',
    flexShrink: 0,
  },
  weekHeadCell: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  weekDate: { color: tokens.colorNeutralForeground3 },
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
    overflow: 'hidden',
    fontSize: tokens.fontSizeBase200,
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gridTemplateRows: 'auto repeat(6, minmax(40px, 1fr))',
    gap: tokens.spacingHorizontalXXS,
    flex: 1,
    minHeight: 0,
  },
  monthWeekday: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground4,
    paddingBlock: tokens.spacingVerticalXXS,
  },
  monthCell: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '40px',
    minWidth: 0,
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalXXS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground2,
    overflow: 'hidden',
  },
  monthCellOther: { opacity: 0.5 },
  monthCellToday: { boxShadow: `inset 0 0 0 ${tokens.strokeWidthThin} ${tokens.colorBrandStroke1}` },
  monthTask: {
    minHeight: '28px',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  numeric: { fontVariantNumeric: 'tabular-nums' },
  completedHead: { display: 'flex', alignItems: 'center', minHeight: '40px', marginTop: tokens.spacingVerticalXS },
});

/* ---------------------------------------------------------------- 工具 */

function scopeTasks(store, listScope) {
  if (!listScope || listScope === 'all') return store.state.tasks;
  return store.state.tasks.filter((task) => task.listId === listScope);
}

function currentList(store, listId) {
  return store.listById(listId) || store.lists[0];
}

function take(rows, remaining) {
  return remaining === null || remaining === undefined ? rows : rows.slice(0, Math.max(0, remaining));
}

/* ---------------------------------------------------------------- 今日 */

export function DayTodoView({ ctx }) {
  const styles = useTodoStyles();
  const local = useStyles();
  const { store, ui } = ctx;
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const tasks = scopeTasks(store, ui.listScope).filter((task) => !task.done);
  const overdue = tasks.filter((task) => {
    const due = toDate(task.dueAt);
    return due && due < today;
  });
  const todayTasks = tasks.filter((task) => task.dueAt && isSameDay(task.dueAt, today));
  const tomorrowTasks = tasks.filter((task) => task.dueAt && isSameDay(task.dueAt, tomorrow));
  const todayAll = store.sortTasks([...overdue, ...todayTasks], ui.sort);
  const tomorrowAll = store.sortTasks(tomorrowTasks, ui.sort);
  const total = todayAll.length + tomorrowAll.length;
  const budget = ctx.actions.rowBudget;

  if (total === 0) {
    return <EmptyState title="今天没有到期的任务" actionLabel={ctx.actions.emptyAction} onAction={ctx.actions.onEmptyAction} />;
  }
  let remaining = budget;
  const todayVisible = take(todayAll, remaining);
  remaining = remaining === null ? null : remaining - todayVisible.length;
  const tomorrowVisible = take(tomorrowAll, remaining);
  const hidden = total - todayVisible.length - tomorrowVisible.length;

  const rows = (list) => (
    <TaskRows
      tasks={list}
      manualSort={ui.sort === 'manual'}
      onToggle={ctx.actions.onToggle}
      onOpenDetail={ctx.actions.onOpenDetail}
      onReorder={ctx.actions.onReorder}
    />
  );

  return (
    <div className={local.grow}>
      {todayVisible.length > 0 ? (
        <section className={local.section}>
          <GroupHead label={`今天 · ${now.getMonth() + 1}月${now.getDate()}日`} count={todayAll.length} />
          {rows(todayVisible)}
        </section>
      ) : null}
      {tomorrowVisible.length > 0 ? (
        <section className={local.section}>
          <GroupHead label="明天" count={tomorrowAll.length} />
          {rows(tomorrowVisible)}
        </section>
      ) : null}
      {hidden > 0 ? (
        <Button appearance="subtle" className={styles.more} onClick={() => ctx.actions.onOpenAll({ scope: ui.listScope })}>
          查看全部（{total}）
        </Button>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- 最近 */

export function RecentView({ ctx }) {
  const styles = useTodoStyles();
  const local = useStyles();
  const { store, ui } = ctx;
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const tasks = store.sortTasks(scopeTasks(store, ui.listScope).filter((task) => !task.done), ui.sort);
  const groups = [
    { key: 'today', label: '今天', tasks: [] },
    { key: 'tomorrow', label: '明天', tasks: [] },
    { key: 'later', label: '以后', tasks: [] },
    { key: 'none', label: '无日期', tasks: [] },
  ];
  const map = Object.fromEntries(groups.map((group) => [group.key, group]));
  for (const task of tasks) {
    const due = toDate(task.dueAt);
    if (!due) map.none.tasks.push(task);
    else if (dayKey(due) <= dayKey(today)) map.today.tasks.push(task);
    else if (isSameDay(due, tomorrow)) map.tomorrow.tasks.push(task);
    else map.later.tasks.push(task);
  }
  const nonEmpty = groups.filter((group) => group.tasks.length > 0);
  const done = store.sortTasks(scopeTasks(store, ui.listScope).filter((task) => task.done), 'created').reverse();
  const budget = ctx.actions.rowBudget;
  let remaining = budget;
  const visible = nonEmpty.map((group) => {
    const rows = take(group.tasks, remaining);
    if (remaining !== null) remaining -= rows.length;
    return { ...group, visible: rows };
  });
  const total = nonEmpty.reduce((sum, group) => sum + group.tasks.length, 0);
  const shown = visible.reduce((sum, group) => sum + group.visible.length, 0);
  const hidden = total - shown;
  const doneVisible = ui.completedOpen ? done.slice(0, 5) : [];

  return (
    <div className={local.grow}>
      {nonEmpty.length === 0 ? (
        <EmptyState title="还没有待办" actionLabel={ctx.actions.emptyAction} onAction={ctx.actions.onEmptyAction} />
      ) : (
        visible.map(
          (group) =>
            group.visible.length > 0 && (
              <section key={group.key} className={local.section}>
                <GroupHead label={group.label} count={group.tasks.length} />
                <TaskRows
                  tasks={group.visible}
                  manualSort={ui.sort === 'manual'}
                  onToggle={ctx.actions.onToggle}
                  onOpenDetail={ctx.actions.onOpenDetail}
                  onReorder={ctx.actions.onReorder}
                />
              </section>
            ),
        )
      )}
      {hidden > 0 ? (
        <Button appearance="subtle" className={styles.more} onClick={() => ctx.actions.onOpenAll({ scope: ui.listScope })}>
          查看全部（{total}）
        </Button>
      ) : null}
      {ctx.config.showCompleted && done.length > 0 ? (
        <>
          <div className={local.completedHead}>
            <Button
              appearance="subtle"
              icon={ui.completedOpen ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
              onClick={ctx.actions.onToggleCompleted}
              aria-expanded={ui.completedOpen}
            >
              已完成 {done.length}
            </Button>
            <span className={styles.spacer} />
            <Button appearance="subtle" onClick={() => ctx.actions.onOpenAll({ done: true })}>
              查看全部
            </Button>
          </div>
          {ui.completedOpen ? (
            <TaskRows
              tasks={doneVisible}
              onToggle={ctx.actions.onToggle}
              onOpenDetail={ctx.actions.onOpenDetail}
            />
          ) : null}
        </>
      ) : null}
      {ui.heatmapOn ? (
        <Heatmap
          weighted={ui.heatWeighted}
          onToggleWeight={ctx.actions.onToggleHeatWeight}
          onOpenSettings={ctx.actions.onOpenSettings}
        />
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- 分类清单 */

export function CategoryView({ ctx }) {
  const local = useStyles();
  const { store, ui } = ctx;
  const budget = ctx.actions.rowBudget;
  let remaining = budget;
  return (
    <div className={local.grow}>
      {store.lists.map((list) => {
        const tasks = store.sortTasks(
          store.state.tasks.filter((task) => task.listId === list.id && !task.done),
          ui.sort,
        );
        const visible = take(tasks, remaining);
        if (remaining !== null) remaining -= visible.length;
        return (
          <section key={list.id} className={local.section}>
            <GroupHead label={list.name} count={tasks.length} />
            {tasks.length === 0 ? (
              <Text size={200} style={{ color: tokens.colorNeutralForeground4, paddingBlock: tokens.spacingVerticalXS }}>
                这个清单是空的
              </Text>
            ) : (
              <TaskRows
                tasks={visible}
                manualSort={ui.sort === 'manual'}
                onToggle={ctx.actions.onToggle}
                onOpenDetail={ctx.actions.onOpenDetail}
                onReorder={ctx.actions.onReorder}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- 日历 + 任务 */

export function CalendarView({ ctx }) {
  const local = useStyles();
  const iconStyles = useTodoStyles();
  const { store, ui } = ctx;
  const month = ui.calCursor;
  const byDay = new Map();
  for (const task of store.state.tasks) {
    if (task.done || !task.dueAt) continue;
    if (ui.listScope !== 'all' && task.listId !== ui.listScope) continue;
    const key = dayKey(task.dueAt);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(task);
  }
  const selected = ui.selectedDay;
  const dayTasks = store.state.tasks.filter((task) => {
    if (!task.dueAt) return false;
    if (dayKey(task.dueAt) !== selected) return false;
    return ui.listScope === 'all' || task.listId === ui.listScope;
  });
  const sorted = store.sortTasks(dayTasks, ui.sort);
  const undone = sorted.filter((task) => !task.done);
  const done = sorted.filter((task) => task.done);
  const [year, monthNumber] = [month.getFullYear(), month.getMonth() + 1];

  return (
    <div className={local.calWrap}>
      <div className={local.dayHead}>
        <Button
          appearance="subtle"
          className={iconStyles.iconButton}
          icon={<ChevronLeft20Regular />}
          aria-label="上个月"
          onClick={ctx.actions.onCalPrev}
        />
        <Text size={300} weight="semibold" aria-live="polite">
          {year}年{monthNumber}月
        </Text>
        <Button
          appearance="subtle"
          className={iconStyles.iconButton}
          icon={<ChevronRight20Regular />}
          aria-label="下个月"
          onClick={ctx.actions.onCalNext}
        />
        <span style={{ flex: 1 }} />
        <Button appearance="subtle" icon={<CalendarLtr20Regular />} onClick={ctx.actions.onCalToday}>
          今天
        </Button>
      </div>
      <MonthGrid
        monthCursor={month}
        selectedDay={selected}
        tasksByDay={byDay}
        weekStart={ctx.config.weekStart}
        onSelectDay={ctx.actions.onSelectDay}
        onAddDay={ctx.actions.onAddDay}
        compact
      />
      <div className={local.dayHead}>
        <Text size={300} weight="semibold">
          {fmtDate(new Date(`${selected}T00:00:00`))} · {undone.length} 项
        </Text>
        <span style={{ flex: 1 }} />
        <Button appearance="subtle" onClick={() => ctx.actions.onAddDay(selected)}>
          添加任务
        </Button>
      </div>
      <div className={local.calPanel}>
        {sorted.length === 0 ? (
          <EmptyState
            title="这天没有安排"
            actionLabel="添加任务"
            onAction={() => ctx.actions.onAddDay(selected)}
          />
        ) : (
          <TaskRows
            tasks={[...undone, ...done]}
            manualSort={false}
            onToggle={ctx.actions.onToggle}
            onOpenDetail={ctx.actions.onOpenDetail}
            onReorder={ctx.actions.onReorder}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 周 / 月视图 */

export function WeekMonthView({ ctx }) {
  const local = useStyles();
  const iconStyles = useTodoStyles();
  const { store, ui } = ctx;
  const byDay = new Map();
  for (const task of store.state.tasks) {
    if (task.done || !task.dueAt) continue;
    if (ui.listScope !== 'all' && task.listId !== ui.listScope) continue;
    const key = dayKey(task.dueAt);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(task);
  }
  const weekStart = ctx.config.weekStart;
  const isWeek = ui.calMode === 'week';
  const weekStartDay = startOfWeek(ui.weekCursor, weekStart);
  const month = ui.calCursor;
  const monthFirst = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthStartOffset = (monthFirst.getDay() - weekStart + 7) % 7;
  const monthStart = addDays(monthFirst, -monthStartOffset);
  const labels = weekdayLabels(weekStart);
  const today = new Date();
  const title = isWeek
    ? `${fmtDate(weekStartDay)} – ${fmtDate(addDays(weekStartDay, 6))}`
    : `${month.getFullYear()}年${month.getMonth() + 1}月`;

  return (
    <div className={local.calWrap}>
      <div className={local.dayHead}>
        <Text size={300} weight="semibold">
          {title}
        </Text>
        <span style={{ flex: 1 }} />
        <TabList
          selectedValue={ui.calMode}
          onTabSelect={(_, data) => ctx.actions.onSetCalMode(data.value)}
          aria-label="周/月视图"
        >
          <Tab value="week">周</Tab>
          <Tab value="month">月</Tab>
        </TabList>
        <Button
          appearance="subtle"
          className={iconStyles.iconButton}
          icon={<ChevronLeft20Regular />}
          aria-label={isWeek ? '上一周' : '上个月'}
          onClick={isWeek ? ctx.actions.onWeekPrev : ctx.actions.onCalPrev}
        />
        <Button
          appearance="subtle"
          className={iconStyles.iconButton}
          icon={<ChevronRight20Regular />}
          aria-label={isWeek ? '下一周' : '下个月'}
          onClick={isWeek ? ctx.actions.onWeekNext : ctx.actions.onCalNext}
        />
        <Button appearance="subtle" onClick={ctx.actions.onCalToday}>
          今天
        </Button>
      </div>
      {isWeek ? (
        <div className={local.weekGrid}>
          {Array.from({ length: 7 }, (_, index) => addDays(weekStartDay, index)).map((date, index) => {
            const key = dayKey(date);
            const tasks = byDay.get(key) || [];
            return (
              <div
                key={key}
                className={mergeClasses(local.weekCol, isSameDay(date, today) && local.weekColToday)}
              >
                <Button appearance="subtle" className={local.weekHeadCell} onClick={() => ctx.actions.onAddDay(key)}>
                  <Text size={200}>{labels[index]}</Text>
                  <Text size={200} weight="semibold" className={local.weekDate}>
                    {date.getDate()}
                  </Text>
                </Button>
                <div className={local.weekTasks}>
                  {tasks.map((task) => (
                    <Button
                      key={task.id}
                      appearance="subtle"
                      className={local.weekTask}
                      title={`${task.title}${task.dueAt ? ` · ${fmtTime(task.dueAt)}` : ''}`}
                      onClick={() => ctx.actions.onOpenDetail(task.id)}
                    >
                      <Text size={200} truncate>
                        {task.title}
                      </Text>
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={local.monthGrid}>
          {labels.map((label) => (
            <Text key={label} className={local.monthWeekday} size={200}>
              {label}
            </Text>
          ))}
          {Array.from({ length: 42 }, (_, index) => addDays(monthStart, index)).map((date) => {
            const key = dayKey(date);
            const tasks = byDay.get(key) || [];
            const other = date.getMonth() !== month.getMonth();
            return (
              <div
                key={key}
                className={mergeClasses(
                  local.monthCell,
                  other && local.monthCellOther,
                  isSameDay(date, today) && local.monthCellToday,
                )}
              >
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={() => ctx.actions.onAddDay(key)}
                  aria-label={`${date.getMonth() + 1}月${date.getDate()}日，新建任务`}
                  style={{ minHeight: '40px', justifyContent: 'flex-start' }}
                >
                  <Text size={200}>{date.getDate()}</Text>
                </Button>
                {tasks.slice(0, 3).map((task) => (
                  <Text
                    key={task.id}
                    size={200}
                    truncate
                    title={task.title}
                    className={local.monthTask}
                    style={{ color: tokens.colorNeutralForeground2 }}
                  >
                    {task.title}
                  </Text>
                ))}
                {tasks.length > 3 ? (
                  <Text size={200} style={{ color: tokens.colorNeutralForeground4 }}>
                    +{tasks.length - 3}
                  </Text>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export { scopeTasks, currentList };
