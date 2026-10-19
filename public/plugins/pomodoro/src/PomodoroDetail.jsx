/**
 * 番茄钟详情（L1，?view=detail）+ L2「选择任务」。
 *
 * L1 = 更多信息 + 具体操作，不是把卡片放大：
 * - header 56：阶段 Badge + 剩余时间 40 tabular + 轮次提示 +「设置…」40
 * - 操作条 48：开始/暂停、重置、跳过阶段、任务选择（push L2）
 * - 今日与趋势：一行四列统计块
 * - 最近记录：按天分组，行 44，状态 Badge
 * - 清空记录：行内展开确认（清空今日 / 清空全部 / 取消），进行中的一轮不受影响
 *
 * 详情是独立 iframe：只读 pomodoro.runtime / pomodoro.sessions，并把操作写成
 * pomodoro.command 交给卡片里的唯一计时引擎执行（不启动第二个计时器）。
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Checkbox,
  Input,
  MessageBar,
  MessageBarBody,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowNext20Regular,
  ArrowReset20Regular,
  History20Regular,
  Pause20Filled,
  Play20Filled,
  Search20Regular,
  Settings20Regular,
  Timer20Regular,
} from '@fluentui/react-icons';
import { requestHostSettings, useStoredConfig } from '../../_shared/host.js';
import { Collapse, CrossFade } from '../../_shared/motion.js';
import {
  ActionButton,
  DetailHeader,
  DetailPage,
  DetailScroll,
  DetailToolbar,
  EmptyState,
  ListRow,
  Subpage,
  useNow,
  useSubpageClose,
} from '../../_shared/ui.jsx';
import {
  COMMAND_KEY,
  DEFAULT_SETTINGS,
  PHASES,
  RUNTIME_KEY,
  SESSIONS_KEY,
  SETTINGS_KEY,
  describeSnapshot,
  normalizeSettings,
  readSessions,
  sendCommand,
  statsForRange,
  streakDays,
} from './data/timer.js';
import {
  groupTasksForPicker,
  readTodoTasks,
  subscribeTodoTasks,
  taskDueLabel,
} from './data/tasks.js';

const dayHeadingFormatter = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
});
const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
});

const useStyles = makeStyles({
  headerMain: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  phaseBadge: {
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    flex: '0 0 auto',
  },
  headerTime: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground1,
  },
  headerHint: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  toolbar: {
    flexWrap: 'wrap',
    rowGap: tokens.spacingVerticalXS,
  },
  taskButton: {
    maxWidth: '260px',
  },
  taskButtonLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
    maxWidth: '880px',
    marginInline: 'auto',
    width: '100%',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalL,
    '@media (max-width: 640px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  statBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXXS,
    minWidth: 0,
  },
  statValue: {
    fontVariantNumeric: 'tabular-nums',
    color: tokens.colorNeutralForeground1,
  },
  statUnit: {
    color: tokens.colorNeutralForeground3,
  },
  statLabel: {
    color: tokens.colorNeutralForeground3,
  },
  dayGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  dayHeading: {
    display: 'flex',
    alignItems: 'center',
    height: '28px',
    color: tokens.colorNeutralForeground3,
  },
  rowTime: {
    color: tokens.colorNeutralForeground2,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  rowTrailing: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  rowDuration: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  clearRow: {
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  confirm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  confirmHint: {
    color: tokens.colorNeutralForeground3,
  },
  confirmActions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  picker: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    maxWidth: '720px',
    marginInline: 'auto',
    width: '100%',
  },
  pickerHint: {
    color: tokens.colorNeutralForeground3,
  },
  pickerGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  pickerGroupHead: {
    display: 'flex',
    alignItems: 'center',
    height: '28px',
    color: tokens.colorNeutralForeground3,
  },
  checkboxCell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    minHeight: '40px',
  },
});

function localDayKey(iso) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function groupSessionsByDay(sessions) {
  const sorted = sessions
    .filter((session) => session.endedAt)
    .sort((left, right) => new Date(right.endedAt) - new Date(left.endedAt));
  const groups = [];
  let current = null;
  for (const session of sorted) {
    const key = localDayKey(session.endedAt);
    if (!current || current.key !== key) {
      current = { key, date: new Date(session.endedAt), sessions: [] };
      groups.push(current);
    }
    current.sessions.push(session);
  }
  return groups;
}

function dayHeadingOf(date) {
  const now = new Date();
  const today = localDayKey(now.toISOString());
  const key = localDayKey(date.toISOString());
  if (key === today) return '今天';
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (key === localDayKey(yesterday.toISOString())) return '昨天';
  return dayHeadingFormatter.format(date);
}

function timeRangeOf(session) {
  if (!session.endedAt) return '进行中';
  return `${timeFormatter.format(new Date(session.startedAt))}–${timeFormatter.format(
    new Date(session.endedAt),
  )}`;
}

function StatusBadge({ completed }) {
  return completed ? (
    <Badge appearance="tint" color="success" size="medium">
      完成
    </Badge>
  ) : (
    <Badge appearance="outline" color="subtle" size="medium">
      中断
    </Badge>
  );
}

function StatBlock({ statKey, label, value, unit }) {
  const styles = useStyles();
  return (
    <div className={styles.statBlock} data-stat={statKey}>
      <Text size={200} className={styles.statLabel}>
        {label}
      </Text>
      <div className={styles.statValueRow}>
        <Text size={600} weight="semibold" className={styles.statValue}>
          {value}
        </Text>
        <Text size={200} className={styles.statUnit}>
          {unit}
        </Text>
      </div>
    </div>
  );
}

function RecordsList({ sessions }) {
  const styles = useStyles();
  const groups = groupSessionsByDay(sessions);
  return (
    <div className={styles.section}>
      {groups.map((group) => (
        <div key={group.key} className={styles.dayGroup}>
          <div className={styles.dayHeading}>
            <Text size={200}>{dayHeadingOf(group.date)}</Text>
          </div>
          {group.sessions.map((session) => (
            <ListRow
              key={session.id}
              data-session-id={session.id}
              leading={
                <Text size={300} className={styles.rowTime}>
                  {timeRangeOf(session)}
                </Text>
              }
              title={session.taskTitle || PHASES[session.phase]?.label || '专注'}
              trailing={
                <div className={styles.rowTrailing}>
                  <Text size={400} weight="semibold" className={styles.rowDuration}>
                    {session.actualMin} 分钟
                  </Text>
                  <StatusBadge completed={session.completed} />
                </div>
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function TaskPicker({ currentTaskId, onSelect }) {
  const styles = useStyles();
  const close = useSubpageClose();
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState(() => readTodoTasks());

  useEffect(() => {
    const refresh = () => setTasks(readTodoTasks());
    refresh();
    return subscribeTodoTasks(refresh);
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return tasks;
    return tasks.filter((task) => task.title.toLowerCase().includes(keyword));
  }, [tasks, query]);

  const { today, later } = useMemo(() => groupTasksForPicker(filtered, new Date()), [filtered]);

  const select = useCallback(
    (taskId, taskTitle) => {
      onSelect(taskId, taskTitle);
      close();
    },
    [close, onSelect],
  );

  const renderGroup = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div className={styles.pickerGroup}>
        <div className={styles.pickerGroupHead}>
          <Text size={200}>{title}</Text>
        </div>
        {items.map((task) => {
          const selected = currentTaskId === task.id;
          return (
            <ListRow
              key={task.id}
              data-task-id={task.id}
              selected={selected}
              onClick={() => select(task.id, task.title)}
              leading={
                <span className={styles.checkboxCell} onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selected}
                    aria-label={`关联任务 ${task.title}`}
                    onChange={() => select(task.id, task.title)}
                  />
                </span>
              }
              title={task.title}
              subtitle={taskDueLabel(task)}
              trailing={selected ? <Text size={200}>已关联</Text> : null}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.picker}>
      <Input
        size="large"
        value={query}
        placeholder="搜索任务"
        aria-label="搜索待办任务"
        contentBefore={<Search20Regular />}
        onChange={(_event, data) => setQuery(data.value)}
      />
      <ListRow
        selected={!currentTaskId}
        onClick={() => select(null, null)}
        leading={
          <span className={styles.checkboxCell} onClick={(event) => event.stopPropagation()}>
            <Checkbox
              checked={!currentTaskId}
              aria-label="不关联任务"
              onChange={() => select(null, null)}
            />
          </span>
        }
        title="不关联任务"
        subtitle="本轮不关联待办"
        trailing={!currentTaskId ? <Text size={200}>已选择</Text> : null}
      />
      {filtered.length === 0 ? (
        <Text size={300} className={styles.pickerHint}>
          {tasks.length === 0 ? '待办里没有未完成任务' : '没有匹配的任务'}
        </Text>
      ) : (
        <>
          {renderGroup('今天', today)}
          {renderGroup('以后', later)}
        </>
      )}
    </div>
  );
}

export default function PomodoroDetail() {
  const styles = useStyles();
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const now = useNow(500);
  const [revision, setRevision] = useState(0);
  const [sessions, setSessions] = useState(() => readSessions());
  const [pickingTask, setPickingTask] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearedMessage, setClearedMessage] = useState('');

  useEffect(() => {
    const refresh = () => {
      setSessions(readSessions());
      setRevision((value) => value + 1);
    };
    const onStorage = (event) => {
      if (
        event.key === SESSIONS_KEY ||
        event.key === RUNTIME_KEY ||
        event.key === COMMAND_KEY ||
        event.key === null
      ) {
        refresh();
      }
    };
    window.addEventListener('storage', onStorage);
    refresh();
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const snapshot = useMemo(
    () => describeSnapshot(settings, now),
    // now 每 500ms 变一次，remaining 跟着走；revision 让 storage 写入立即重算
    [settings, now, revision],
  );

  const today = useMemo(() => statsForRange(sessions, 'today', new Date(now)), [sessions, now]);
  const week = useMemo(() => statsForRange(sessions, 'week', new Date(now)), [sessions, now]);
  const streak = useMemo(() => streakDays(sessions, new Date(now)), [sessions, now]);

  const hasRecords = sessions.length > 0;
  const toggleText = snapshot.running ? '暂停' : snapshot.progress > 0 ? '继续' : '开始';
  const taskTitle = snapshot.taskTitle || '未关联任务';

  const toggle = useCallback(() => {
    sendCommand(snapshot.running ? 'pause' : 'start');
  }, [snapshot.running]);
  const reset = useCallback(() => sendCommand('reset'), []);
  const skip = useCallback(() => sendCommand('skip'), []);

  const chooseTask = useCallback((taskId, taskTitleValue) => {
    sendCommand('task', { taskId, taskTitle: taskTitleValue });
  }, []);

  const clearRecords = useCallback(
    (scope) => {
      const total =
        scope === 'all'
          ? sessions.length
          : sessions.filter(
              (session) => localDayKey(session.endedAt) === localDayKey(new Date().toISOString()),
            ).length;
      sendCommand('clearStats', { scope });
      setClearedMessage(`已清空 ${total} 条记录`);
      setConfirmClear(false);
    },
    [sessions],
  );

  return (
    <DetailPage>
      <DetailHeader
        trailing={
          <ActionButton
            icon={<Settings20Regular />}
            onClick={() => requestHostSettings()}
            data-detail-action="settings"
          >
            设置…
          </ActionButton>
        }
      >
        <div className={styles.headerMain}>
          <Badge
            appearance="tint"
            color={snapshot.phase === 'focus' ? 'brand' : 'informative'}
            size="large"
            className={styles.phaseBadge}
          >
            {snapshot.phaseLabel}
          </Badge>
          <Text size={900} weight="semibold" className={styles.headerTime} data-detail-time>
            {snapshot.remainingText}
          </Text>
          <Text size={200} className={styles.headerHint}>
            第 {snapshot.roundInCycle} / {snapshot.roundsBeforeLongBreak} 轮
          </Text>
        </div>
      </DetailHeader>

      <DetailToolbar className={styles.toolbar}>
        <ActionButton
          appearance="primary"
          icon={snapshot.running ? <Pause20Filled /> : <Play20Filled />}
          onClick={toggle}
          data-detail-action="toggle"
        >
          {toggleText}
        </ActionButton>
        <ActionButton
          icon={<ArrowReset20Regular />}
          onClick={reset}
          data-detail-action="reset"
        >
          重置
        </ActionButton>
        <ActionButton icon={<ArrowNext20Regular />} onClick={skip} data-detail-action="skip">
          跳过阶段
        </ActionButton>
        <ActionButton
          icon={<Timer20Regular />}
          className={styles.taskButton}
          onClick={() => setPickingTask(true)}
          aria-label={`关联任务：${taskTitle}，打开任务选择`}
          title={`关联任务：${taskTitle}`}
          data-detail-action="task"
        >
          <span className={styles.taskButtonLabel} data-detail-task>
            任务：{taskTitle} ▾
          </span>
        </ActionButton>
      </DetailToolbar>

      <DetailScroll>
        <div className={styles.stack}>
          <section className={styles.section} aria-label="今日与趋势">
            <Text size={400} weight="semibold">
              今日与趋势
            </Text>
            <div className={styles.statGrid}>
              <StatBlock statKey="today-completed" label="今日完成" value={today.completed} unit="轮" />
              <StatBlock statKey="today-minutes" label="今日专注" value={today.focusMinutes} unit="分钟" />
              <StatBlock statKey="week-completed" label="本周完成" value={week.completed} unit="轮" />
              <StatBlock statKey="streak-days" label="连续天数" value={streak} unit="天" />
            </div>
          </section>

          <section className={styles.section} aria-label="最近记录">
            <Text size={400} weight="semibold">
              最近记录
            </Text>
            {clearedMessage ? (
              <MessageBar intent="success">
                <MessageBarBody>{clearedMessage}</MessageBarBody>
              </MessageBar>
            ) : null}
            <CrossFade value={hasRecords ? 'records' : 'empty'}>
              {hasRecords ? (
                <RecordsList sessions={sessions} />
              ) : (
                <EmptyState
                  icon={<History20Regular />}
                  title="还没有专注记录"
                  description="开始一轮专注，完成的番茄会出现在这里"
                  action={
                    <ActionButton
                      appearance="primary"
                      icon={<Play20Filled />}
                      onClick={() => sendCommand('start')}
                      data-detail-action="start-focus"
                    >
                      开始专注
                    </ActionButton>
                  }
                />
              )}
            </CrossFade>
          </section>

          {hasRecords ? (
            <section className={styles.section} aria-label="清空记录">
              <ListRow
                className={styles.clearRow}
                title="清空记录"
                subtitle="删除历史专注记录；进行中的一轮不受影响"
                trailing={
                  <ActionButton
                    onClick={() => setConfirmClear((value) => !value)}
                    aria-expanded={confirmClear}
                    data-detail-action="clear"
                  >
                    清空…
                  </ActionButton>
                }
              />
              <Collapse visible={confirmClear}>
                <div className={styles.confirm}>
                  <Text size={200} className={styles.confirmHint}>
                    进行中的一轮不会删除
                  </Text>
                  <div className={styles.confirmActions}>
                    <ActionButton
                      onClick={() => clearRecords('today')}
                      data-detail-action="clear-today"
                    >
                      清空今日
                    </ActionButton>
                    <ActionButton
                      onClick={() => clearRecords('all')}
                      data-detail-action="clear-all"
                    >
                      清空全部
                    </ActionButton>
                    <ActionButton
                      onClick={() => setConfirmClear(false)}
                      data-detail-action="clear-cancel"
                    >
                      取消
                    </ActionButton>
                  </div>
                </div>
              </Collapse>
            </section>
          ) : null}
        </div>
      </DetailScroll>

      {pickingTask ? (
        <Subpage title="选择任务" onClosed={() => setPickingTask(false)}>
          <TaskPicker currentTaskId={snapshot.taskId} onSelect={chooseTask} />
        </Subpage>
      ) : null}
    </DetailPage>
  );
}
