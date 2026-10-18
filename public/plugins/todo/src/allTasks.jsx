/**
 * 「查看全部」浮层视图（宿主 ?view=all 全窗口 Fluent Dialog 里加载）。
 * 2×2 / 3×2 / 3×3 超出信息预算时，其余任务在这里完整查看与勾选。
 */

import { useMemo } from 'react';
import { Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Dismiss20Regular } from '@fluentui/react-icons';
import { store } from '../js/store.js';
import { EmptyState, TaskRows, useTodoStyles } from './components.jsx';
import { openTaskDetail, readOverlayPayload, useTodoStore } from './todoData.js';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: tokens.colorNeutralForeground1,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL} ${tokens.spacingVerticalS}`,
  },
  grow: { flex: 1, minWidth: 0 },
  body: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: `0 ${tokens.spacingHorizontalL} ${tokens.spacingVerticalL}`,
  },
  subtle: { color: tokens.colorNeutralForeground3 },
});

export default function TodoAllTasks() {
  const styles = useStyles();
  const todoStyles = useTodoStyles();
  useTodoStore();
  const payload = useMemo(() => readOverlayPayload() || {}, []);
  const done = payload.done === true;
  const list = payload.listId ? store.listById(payload.listId) : payload.scope && payload.scope !== 'all' ? store.listById(payload.scope) : null;
  const listId = list?.id || (payload.scope && payload.scope !== 'all' ? payload.scope : null);

  const tasks = store.sortTasks(
    store.state.tasks.filter((task) => {
      if (listId && task.listId !== listId) return false;
      return done ? task.done : !task.done;
    }),
    done ? 'created' : 'due',
  );
  if (done) tasks.reverse();

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <Text size={500} weight="semibold">
          {done ? '已完成任务' : '全部任务'}
          {list ? ` · ${list.name}` : ''}
        </Text>
        <Text size={200} className={styles.subtle}>
          共 {tasks.length} 条
        </Text>
        <span className={styles.grow} />
        <Button size="large" appearance="subtle" icon={<Dismiss20Regular />} aria-label="关闭" disabled>
          Esc 关闭
        </Button>
      </div>
      <div className={styles.body}>
        {tasks.length === 0 ? (
          <EmptyState title={done ? '还没有已完成任务' : '没有待办'} />
        ) : (
          <TaskRows
            tasks={tasks}
            onToggle={(taskId) => {
              const task = store.taskById(taskId);
              if (task) store.setDone(task.id, !task.done);
            }}
            onOpenDetail={openTaskDetail}
            onReorder={(targetListId, ids) => store.reorderTasks(targetListId, ids)}
          />
        )}
      </div>
      <div style={{ padding: `0 ${tokens.spacingHorizontalL} ${tokens.spacingVerticalL}` }}>
        <Text size={200} className={styles.subtle}>
          提示：点击任务可完成 / 取消；长按打开任务详情。
        </Text>
      </div>
    </div>
  );
}
