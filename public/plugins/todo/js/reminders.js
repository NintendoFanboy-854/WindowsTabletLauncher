/**
 * 提醒调度：所有 iframe（界面实例 + background 常驻实例）都跑这份逻辑，
 * 通过 localStorage 的 todo.settings.reminders 抢锁，保证一条提醒只弹一次；
 * 启动时对已经过期且没触发过的提醒立即补发（文档「边界与异常」）。
 */
import { plugin } from '/plugin-sdk.js';
import { store } from './store.js';
import { fmtDue } from './date.js';

const TICK_MS = 5000;

export function startReminderLoop() {
  let stopped = false;

  const tick = async () => {
    if (stopped) return;
    let due = [];
    try {
      due = store.claimDueReminders(new Date());
    } catch (error) {
      console.error('[todo] 提醒检查失败', error);
      return;
    }
    for (const task of due) {
      try {
        await fire(task);
      } catch (error) {
        console.error('[todo] 提醒弹出失败', error);
      }
    }
  };

  const onVisible = () => {
    if (!document.hidden) tick();
  };

  tick();
  const timer = setInterval(tick, TICK_MS);
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onVisible);

  return () => {
    stopped = true;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', onVisible);
  };
}

async function fire(task) {
  const list = store.listById(task.listId);
  const title = list ? `待办提醒 · ${list.name}` : '待办提醒';
  const message = `${task.title}${task.dueAt ? `（${fmtDue(task.dueAt)}）` : ''}`;
  const result = await plugin.showReminder({
    title,
    message,
    actions: [
      { id: 'done', text: '标记完成', kind: 'primary' },
      { id: 'later', text: '10 分钟后再提醒' },
    ],
    autoDismissSec: 30,
  });
  // 脱离宿主时 SDK 的兜底会直接返回第一个 action，不做真实操作
  if (!plugin.inHost) return;
  const actionId = result && typeof result === 'object' ? result.actionId : undefined;
  if (actionId === 'done') store.setDone(task.id, true);
  else if (actionId === 'later') store.snoozeReminder(task.id, 10 * 60 * 1000);
}
