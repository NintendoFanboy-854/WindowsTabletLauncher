/**
 * 待办 L1 的四个时间视图（docs/components/todo.md「详情 L1」）：
 * 日历 / 周视图 / 月视图 / 热力图。
 *
 * 全部视图共用 24 内容边距（DetailScroll）、44 行高、12/14/16 字号与 Fluent token，
 * 不用分割线；点击任务行 push L2 任务编辑，勾选就地完成。
 */

import { useState } from 'react';
import { Button, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import {
  Add20Regular,
  CalendarLtr20Regular,
  CalendarLtr24Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from '@fluentui/react-icons';
import { ActionButton, EmptyState, LIST_ROW_HEIGHT } from '../../_shared/ui.jsx';
import {
  addDays,
  dayKey,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDate,
  weekdayLabels,
} from '../js/date.js';
import { store } from '../js/store.js';
import { GroupHead, MiniTaskRow, TaskRow } from './parts.jsx';

const useStyles = makeStyles({
  view: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minHeight: tokens.spacingVerticalXXXL,
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
  },
  spacer: { flex: 1, minWidth: 0 },
  weekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalXXS,
  },
  weekday: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    paddingBlock: tokens.spacingVerticalXXS,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalXXS,
  },
  dayCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    minHeight: `${LIST_ROW_HEIGHT}px`,
    padding: 0,
    borderRadius: tokens.borderRadiusMedium,
  },
  daySelected: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
  /** 今日格不占 accent：中性描边 + 半粗文字（时间性语义降级） */
  dayToday: {
    boxShadow: `inset 0 0 0 ${tokens.strokeWidthThin} ${tokens.colorNeutralStroke1}`,
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  dayOther: { color: tokens.colorNeutralForeground3 },
  dayCount: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
  },
  dots: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    height: tokens.spacingHorizontalSNudge,
  },
  dot: {
    width: tokens.spacingHorizontalSNudge,
    height: tokens.spacingHorizontalSNudge,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralForeground3,
  },

  dayHead: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: tokens.spacingVerticalXXXL,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  muted: { color: tokens.colorNeutralForeground3 },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalS,
    alignItems: 'start',
    minWidth: 0,
  },
  weekCol: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: `${LIST_ROW_HEIGHT}px`,
  },
  weekHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalXS,
    paddingBlock: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground3,
  },
  weekTasks: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gridTemplateRows: `repeat(6, minmax(${LIST_ROW_HEIGHT}px, auto))`,
    gap: tokens.spacingHorizontalXXS,
  },
  heatStats: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
    minHeight: tokens.spacingVerticalXXXL,
  },
  heatValue: {
    color: tokens.colorNeutralForeground1,
    fontVariantNumeric: 'tabular-nums',
  },
  heatLabel: { color: tokens.colorNeutralForeground3 },
  heatGrid: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateRows: `repeat(7, ${tokens.spacingHorizontalXXXL})`,
    gridAutoColumns: tokens.spacingHorizontalXXXL,
    justifyContent: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  heatCell: {
    width: tokens.spacingHorizontalXXXL,
    height: tokens.spacingHorizontalXXXL,
    borderRadius: tokens.borderRadiusSmall,
  },
  /**
   * 热力强度用中性阶梯（DENSITY §2 层级手段：不拿 semantic 色做装饰）。
   * 0 档贴近卡面，4 档最重；亮暗主题都由 Fluent neutral 档自动适配。
   */
  heat0: { backgroundColor: tokens.colorNeutralBackground2 },
  heat1: { backgroundColor: tokens.colorNeutralBackground4 },
  heat2: { backgroundColor: tokens.colorNeutralForeground4 },
  heat3: { backgroundColor: tokens.colorNeutralForeground3 },
  heat4: { backgroundColor: tokens.colorNeutralForeground2 },
  legend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
  },
  legendSwatch: {
    width: tokens.spacingHorizontalM,
    height: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusSmall,
  },
});

function fmtMonthDay(value) {
  const date = toDate(value);
  if (!date) return '';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function fmtMonthTitle(value) {
  const date = toDate(value) || new Date();
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function monthDays(cursor, weekStart) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const offset = (first.getDay() - weekStart + 7) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function dayTasks(tasks, key) {
  return tasks.filter((task) => task.dueAt && dayKey(task.dueAt) === key);
}

function DayPanel({ tasks, now, settings, onOpenTask, onToggleTask, onAddDay }) {
  const styles = useStyles();
  const sorted = store.sortTasks(tasks, 'due');
  return sorted.length === 0 ? (
    <EmptyState
      icon={<CalendarLtr24Regular />}
      title="这天没有任务"
      action={
        <ActionButton icon={<Add20Regular />} onClick={onAddDay}>
          添加任务
        </ActionButton>
      }
    />
  ) : (
    <div className={styles.rows}>
      {sorted.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          now={now}
          settings={settings}
          onOpen={onOpenTask}
          onToggle={onToggleTask}
          onRemove={(id) => store.removeTask(id)}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- 日历 */

export function CalendarView({
  tasks,
  now,
  settings,
  onOpenTask,
  onToggleTask,
  onAddDay,
}) {
  const styles = useStyles();
  const [cursor, setCursor] = useState(() => startOfMonth(now));
  const [selected, setSelected] = useState(() => dayKey(now));
  const weekStart = settings.weekStart;
  const labels = weekdayLabels(weekStart);
  const days = monthDays(cursor, weekStart);
  const selectedDate = new Date(`${selected}T00:00:00`);
  const selectedTasks = dayTasks(tasks, selected);
  const undone = selectedTasks.filter((task) => !task.done).length;

  return (
    <div className={styles.view}>
      <div className={styles.toolbar}>
        <Button
          appearance="subtle"
          size="large"
          icon={<ChevronLeft20Regular />}
          aria-label="上个月"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
        />
        <Text size={300} weight="semibold" className={styles.toolbarTitle} aria-live="polite">
          {fmtMonthTitle(cursor)}
        </Text>
        <Button
          appearance="subtle"
          size="large"
          icon={<ChevronRight20Regular />}
          aria-label="下个月"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
        />
        <span className={styles.spacer} />
        <ActionButton
          appearance="subtle"
          icon={<CalendarLtr20Regular />}
          onClick={() => {
            setCursor(startOfMonth(now));
            setSelected(dayKey(now));
          }}
        >
          今天
        </ActionButton>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {labels.map((label) => (
          <Text key={label} size={200} className={styles.weekday}>
            {label}
          </Text>
        ))}
      </div>

      <div className={styles.grid} role="grid" aria-label="日历">
        {days.map((date) => {
          const key = dayKey(date);
          const count = tasks.filter((task) => !task.done && task.dueAt && dayKey(task.dueAt) === key).length;
          const other = date.getMonth() !== cursor.getMonth();
          const isToday = isSameDay(date, now);
          const isSelected = key === selected;
          return (
            <Button
              key={key}
              appearance="transparent"
              className={mergeClasses(
                styles.dayCell,
                isSelected && styles.daySelected,
                isToday && styles.dayToday,
                other && styles.dayOther,
              )}
              aria-label={`${date.getMonth() + 1}月${date.getDate()}日，${count} 项未完成`}
              aria-pressed={isSelected}
              onClick={() => setSelected(key)}
            >
              <Text size={300}>{date.getDate()}</Text>
              {count > 0 ? (
                <Text size={200} className={styles.dayCount}>
                  {count}
                </Text>
              ) : null}
            </Button>
          );
        })}
      </div>

      <div className={styles.dayHead}>
        <Text size={300} weight="semibold">
          {fmtMonthDay(selectedDate)} · {undone} 项
        </Text>
      </div>
      <DayPanel
        tasks={selectedTasks}
        now={now}
        settings={settings}
        onOpenTask={onOpenTask}
        onToggleTask={onToggleTask}
        onAddDay={() => onAddDay(selected)}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- 周视图 */

export function WeekView({ tasks, now, settings, onOpenTask, onToggleTask }) {
  const styles = useStyles();
  const weekStart = settings.weekStart;
  const [cursor, setCursor] = useState(() => startOfWeek(now, weekStart));
  const labels = weekdayLabels(weekStart);
  const days = Array.from({ length: 7 }, (_, index) => addDays(cursor, index));
  const total = days.reduce((sum, date) => sum + dayTasks(tasks, dayKey(date)).length, 0);

  return (
    <div className={styles.view}>
      <div className={styles.toolbar}>
        <Button
          appearance="subtle"
          size="large"
          icon={<ChevronLeft20Regular />}
          aria-label="上一周"
          onClick={() => setCursor(addDays(cursor, -7))}
        />
        <Text size={300} weight="semibold" className={styles.toolbarTitle} aria-live="polite">
          {fmtMonthDay(days[0])} – {fmtMonthDay(days[6])}
        </Text>
        <Button
          appearance="subtle"
          size="large"
          icon={<ChevronRight20Regular />}
          aria-label="下一周"
          onClick={() => setCursor(addDays(cursor, 7))}
        />
        <span className={styles.spacer} />
        <ActionButton
          appearance="subtle"
          icon={<CalendarLtr20Regular />}
          onClick={() => setCursor(startOfWeek(now, weekStart))}
        >
          今天
        </ActionButton>
      </div>

      <div className={styles.weekGrid}>
        {days.map((date, index) => {
          const key = dayKey(date);
          const dayItems = dayTasks(tasks, key).sort(
            (a, b) => Number(a.done) - Number(b.done) || (toDate(a.dueAt)?.getTime() || 0) - (toDate(b.dueAt)?.getTime() || 0),
          );
          return (
            <div key={key} className={styles.weekCol}>
              <div className={mergeClasses(styles.weekHead, isSameDay(date, now) && styles.dayToday)}>
                <Text size={200}>{labels[index]}</Text>
                <Text size={300} weight={isSameDay(date, now) ? 'semibold' : 'regular'}>
                  {date.getDate()}
                </Text>
              </div>
              <div className={styles.weekTasks}>
                {dayItems.map((task) => (
                  <MiniTaskRow key={task.id} task={task} onOpen={onOpenTask} onToggle={onToggleTask} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {total === 0 ? (
        <Text size={300} className={styles.muted}>
          这一周还没有任务
        </Text>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- 月视图 */

export function MonthView({ tasks, now, settings, onOpenTask, onToggleTask, onAddDay }) {
  const styles = useStyles();
  const weekStart = settings.weekStart;
  const [cursor, setCursor] = useState(() => startOfMonth(now));
  const [selected, setSelected] = useState(() => dayKey(now));
  const labels = weekdayLabels(weekStart);
  const days = monthDays(cursor, weekStart);
  const selectedTasks = dayTasks(tasks, selected);
  const undone = selectedTasks.filter((task) => !task.done).length;

  return (
    <div className={styles.view}>
      <div className={styles.toolbar}>
        <Button
          appearance="subtle"
          size="large"
          icon={<ChevronLeft20Regular />}
          aria-label="上个月"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
        />
        <Text size={300} weight="semibold" className={styles.toolbarTitle} aria-live="polite">
          {fmtMonthTitle(cursor)}
        </Text>
        <Button
          appearance="subtle"
          size="large"
          icon={<ChevronRight20Regular />}
          aria-label="下个月"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
        />
        <span className={styles.spacer} />
        <ActionButton
          appearance="subtle"
          icon={<CalendarLtr20Regular />}
          onClick={() => {
            setCursor(startOfMonth(now));
            setSelected(dayKey(now));
          }}
        >
          今天
        </ActionButton>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {labels.map((label) => (
          <Text key={label} size={200} className={styles.weekday}>
            {label}
          </Text>
        ))}
      </div>

      <div className={styles.monthGrid} role="grid" aria-label="月视图">
        {days.map((date) => {
          const key = dayKey(date);
          const items = tasks
            .filter((task) => !task.done && task.dueAt && dayKey(task.dueAt) === key)
            .slice(0, 2);
          const other = date.getMonth() !== cursor.getMonth();
          const isSelected = key === selected;
          return (
            <Button
              key={key}
              appearance="transparent"
              className={mergeClasses(
                styles.dayCell,
                isSelected && styles.daySelected,
                isSameDay(date, now) && styles.dayToday,
                other && styles.dayOther,
              )}
              aria-label={`${date.getMonth() + 1}月${date.getDate()}日`}
              aria-pressed={isSelected}
              onClick={() => setSelected(key)}
            >
              <Text size={300}>{date.getDate()}</Text>
              {items.length > 0 ? (
                <span className={styles.dots} aria-hidden="true">
                  {items.map((task) => (
                    <span key={task.id} className={styles.dot} />
                  ))}
                </span>
              ) : null}
            </Button>
          );
        })}
      </div>

      <div className={styles.dayHead}>
        <Text size={300} weight="semibold">
          {fmtMonthDay(new Date(`${selected}T00:00:00`))} · {undone} 项
        </Text>
      </div>
      <DayPanel
        tasks={selectedTasks}
        now={now}
        settings={settings}
        onOpenTask={onOpenTask}
        onToggleTask={onToggleTask}
        onAddDay={() => onAddDay(selected)}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- 热力图 */

export function HeatmapView({ now, settings }) {
  const styles = useStyles();
  const weekStart = settings.weekStart;
  const today = startOfDay(now);
  const first = addDays(startOfWeek(today, weekStart), -7 * 15);
  const days = Array.from({ length: 112 }, (_, index) => dayKey(addDays(first, index)));
  const counts = new Map(days.map((key) => [key, 0]));
  const tasks = store.state.tasks;
  for (const task of tasks) {
    if (!task.done || !task.doneAt) continue;
    const key = dayKey(task.doneAt);
    if (counts.has(key)) counts.set(key, counts.get(key) + 1);
  }
  const values = days.map((key) => counts.get(key));
  const total = values.reduce((sum, value) => sum + value, 0);
  let max = 1;
  for (const value of values) max = Math.max(max, value);
  const levelOf = (value) => (value <= 0 ? 0 : Math.min(4, Math.ceil((value / max) * 4)));

  let streak = 0;
  let cursor = counts.get(dayKey(today)) > 0 ? today : addDays(today, -1);
  while (counts.has(dayKey(cursor)) && counts.get(dayKey(cursor)) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  const labels = weekdayLabels(weekStart);
  return (
    <div className={styles.view}>
      <div className={styles.heatStats}>
        <Text size={500} weight="semibold" className={styles.heatValue}>
          {total}
        </Text>
        <Text size={300} className={styles.heatLabel}>
          项完成 · 近 16 周
        </Text>
        <Text size={500} weight="semibold" className={styles.heatValue}>
          {streak}
        </Text>
        <Text size={300} className={styles.heatLabel}>
          天连续完成
        </Text>
      </div>

      <div className={styles.heatGrid} role="img" aria-label="近 16 周每日完成量">
        {days.map((key, index) => {
          const date = new Date(`${key}T00:00:00`);
          const value = counts.get(key);
          const level = levelOf(value);
          return (
            <span
              key={key}
              className={mergeClasses(styles.heatCell, styles[`heat${level}`])}
              title={`${date.getMonth() + 1}月${date.getDate()}日 ${labels[index % 7]}：完成 ${value} 项`}
            />
          );
        })}
      </div>

      <div className={styles.legend}>
        <Text size={200}>少</Text>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={mergeClasses(styles.legendSwatch, styles[`heat${level}`])} aria-hidden="true" />
        ))}
        <Text size={200}>多</Text>
      </div>
    </div>
  );
}
