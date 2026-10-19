/**
 * L2「选择任务」的数据来源。
 *
 * 待办任务的唯一来源是待办插件的 localStorage（todo.tasks）。宿主目前没有
 * “插件之间查询数据”的公开 API（契约说共享数据要经过宿主），这里做只读兼容：
 * 解析失败、没有待办插件时按“没有未完成任务”处理，绝不写入 todo.*。
 */

export const TODO_TASKS_KEY = 'todo.tasks';
const TODO_STORAGE_KEYS = new Set([TODO_TASKS_KEY, null]);

function safeDate(value) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + 1);
  return new Date(next.getTime() - 1);
}

/** 读取待办里未完成的顶层任务；字段做最小化 normalize。 */
export function readTodoTasks() {
  let raw;
  try {
    raw = localStorage.getItem(TODO_TASKS_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const tasks = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    if (typeof item.title !== 'string' || !item.title.trim()) continue;
    if (item.done) continue;
    const dueAt = safeDate(item.dueAt);
    tasks.push({
      id: typeof item.id === 'string' && item.id ? item.id : `todo-${tasks.length}`,
      title: item.title.trim(),
      priority: Number.isFinite(item.priority) ? item.priority : 0,
      dueAt,
      order: Number.isFinite(item.order) ? item.order : 0,
    });
  }
  tasks.sort((left, right) => {
    if (left.dueAt && right.dueAt) return left.dueAt - right.dueAt;
    if (left.dueAt) return -1;
    if (right.dueAt) return 1;
    return left.order - right.order;
  });
  return tasks;
}

/** 按「今日 / 以后」分组；逾期任务归入今日，方便今天处理。 */
export function groupTasksForPicker(tasks, now = new Date()) {
  const todayEnd = endOfDay(now);
  const today = [];
  const later = [];
  for (const task of tasks) {
    if (task.dueAt && task.dueAt <= todayEnd) today.push(task);
    else later.push(task);
  }
  return { today, later };
}

/** 任务行的副标题：今天 / 已逾期 / 日期。 */
export function taskDueLabel(task, now = new Date()) {
  if (!task.dueAt) return '没有截止日期';
  const todayStart = startOfDay(now);
  const dueStart = startOfDay(task.dueAt);
  const dayMs = 24 * 60 * 60 * 1000;
  const dayDiff = Math.round((dueStart - todayStart) / dayMs);
  const time = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(
    task.dueAt,
  );
  if (dayDiff < 0) {
    const date = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(
      task.dueAt,
    );
    return `已逾期 · ${date}`;
  }
  if (dayDiff === 0) return `今天 ${time}`;
  if (dayDiff === 1) return `明天 ${time}`;
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(task.dueAt);
}

export function subscribeTodoTasks(handler) {
  const onStorage = (event) => {
    if (!TODO_STORAGE_KEYS.has(event.key)) return;
    handler();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
