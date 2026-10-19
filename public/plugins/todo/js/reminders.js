/**
 * 提醒调度：宿主里只有后台常驻 iframe 跑这份逻辑（单写者）；
 * 独立预览 / 无宿主时由卡片实例兜底。抢锁用 navigator.locks 做原子化，
 * localStorage 里的标记仍负责“同一条提醒只弹一次”（含跨标签页）。
 * 启动时对已经过期且没触发过的提醒立即补发（文档「边界与异常」）。
 */
import { plugin } from '/plugin-sdk.js';
import { store, reminderMinuteOf } from './store.js';
import { fmtDue } from './date.js';

const TICK_MS = 5000;
/** 跨 iframe / 标签页串行化“读取到期列表 + 写标记”的临界区 */
const CLAIM_LOCK = 'wtsl.todo.reminders.claim';

/** 本帧正在弹的提醒（事件 key），防止同一事件在本帧内被并发 tick 重入 */
const firing = new Set();

function eventKey(task) {
  return `${task.id}@${reminderMinuteOf(task.remindAt)}`;
}

/** 抢到锁才 claim；锁被别的实例占用时本轮跳过，下个 tick 再试 */
async function claimWithLock() {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : null;
  if (!locks || typeof locks.request !== 'function') {
    return store.claimDueReminders(new Date());
  }
  try {
    const due = await locks.request(CLAIM_LOCK, { ifAvailable: true }, async (lock) => {
      if (!lock) return null;
      return store.claimDueReminders(new Date());
    });
    return due ?? [];
  } catch (error) {
    // 锁 API 在个别 WebView/权限下不可用：退回单帧 claim（标记仍然去重）
    console.warn('[todo] 提醒锁不可用，回退到 localStorage 标记', error);
    return store.claimDueReminders(new Date());
  }
}

export function startReminderLoop() {
  let stopped = false;
  let ticking = false;

  const runTick = async () => {
    let due = [];
    try {
      due = await claimWithLock();
    } catch (error) {
      console.error('[todo] 提醒检查失败', error);
      return;
    }
    for (const task of due) {
      const key = eventKey(task);
      if (firing.has(key)) continue;
      firing.add(key);
      try {
        await fire(task);
      } catch (error) {
        console.error('[todo] 提醒弹出失败', error);
      } finally {
        firing.delete(key);
      }
    }
  };

  const tick = async () => {
    if (stopped || ticking) return;
    ticking = true;
    try {
      await runTick();
    } finally {
      ticking = false;
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
