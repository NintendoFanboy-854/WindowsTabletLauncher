/**
 * 待办数据层：多清单 / 任务 / 子任务 / 优先级 / 截止 / 提醒 / 重复 / 标签。
 * 纯逻辑，不碰 DOM，方便在 Node 里直接跑 Agent 工具的验收脚本。
 * 持久化：localStorage（键 todo.lists / todo.tasks / todo.tags / todo.settings）。
 */
import {
  dayKey,
  addDays,
  startOfDay,
  isSameDay,
  parseDateInput,
  nextOccurrence,
  toDate,
  RECURRENCES,
} from './date.js';

export const KEYS = {
  lists: 'todo.lists',
  tasks: 'todo.tasks',
  tags: 'todo.tags',
  settings: 'todo.settings',
};

/**
 * 清单不再携带颜色。
 *
 * Equal Except Hue：色相的唯一来源是 `manifest.identityHue`，由宿主解析成
 * `--wtsl-identity` 三档下发；插件数据层不得保存 `colorPalette*` 色名，也不得
 * 让清单各自选色。清单之间用图标 + 名称 + 顺序区分（DENSITY §2 层级手段）。
 */

export const SORTS = [
  { value: 'manual', label: '手动' },
  { value: 'due', label: '截止' },
  { value: 'priority', label: '优先级' },
  { value: 'created', label: '创建时间' },
];

export const DEFAULT_SETTINGS = {
  defaultListId: null,
  showCompleted: true,
  defaultSort: 'manual',
  weekStart: 1,
  /** 内部状态：{ [taskId]: 已触发提醒的 remindAt ISO } —— 保证“只补一次” */
  reminders: {},
};

function storage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

function readJson(key, fallback) {
  const ls = storage();
  if (!ls) return fallback;
  try {
    const raw = ls.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  const ls = storage();
  if (!ls) return;
  try {
    ls.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('[todo] 保存失败', key, error);
  }
}

/** 读取 localStorage 里最新的提醒标记（跨 iframe 抢锁/去重用） */
function readStoredReminders() {
  const settings = readJson(KEYS.settings, null);
  if (!settings || typeof settings !== 'object') return {};
  const reminders = settings.reminders;
  return reminders && typeof reminders === 'object' && !Array.isArray(reminders) ? { ...reminders } : {};
}

/**
 * 提醒事件的“身份”按分钟归一化：
 * 详情表单只保留到分钟（combineDateTime 会把秒归零），同一个提醒被保存一次后
 * 字面量会变；按分钟比较才能把“同一分钟内的同一个提醒”认成同一事件。
 */
export function reminderMinuteOf(value) {
  const date = toDate(value);
  return date ? Math.floor(date.getTime() / 60000) : null;
}

function sameReminderMinute(a, b) {
  const left = reminderMinuteOf(a);
  return left !== null && left === reminderMinuteOf(b);
}

export function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

function isPriority(value) {
  return Number.isInteger(value) && value >= 0 && value <= 3;
}

function normalizeTask(raw, fallbackListId) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.title !== 'string') return null;
  const createdAt = toDate(raw.createdAt)?.toISOString() || nowIso();
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : uid(),
    listId: typeof raw.listId === 'string' && raw.listId ? raw.listId : fallbackListId,
    title: raw.title,
    note: typeof raw.note === 'string' && raw.note ? raw.note : undefined,
    done: Boolean(raw.done),
    doneAt: toDate(raw.doneAt)?.toISOString() || undefined,
    createdAt,
    updatedAt: toDate(raw.updatedAt)?.toISOString() || createdAt,
    order: Number.isFinite(raw.order) ? raw.order : 0,
    priority: isPriority(raw.priority) ? raw.priority : 0,
    dueAt: toDate(raw.dueAt)?.toISOString() || undefined,
    remindAt: toDate(raw.remindAt)?.toISOString() || undefined,
    recurrence: RECURRENCES.some((item) => item.value === raw.recurrence) ? raw.recurrence : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim()) : [],
    subtasks: Array.isArray(raw.subtasks)
      ? raw.subtasks
          .filter((sub) => sub && typeof sub.title === 'string')
          .map((sub, index) => ({
            id: typeof sub.id === 'string' && sub.id ? sub.id : uid(),
            title: sub.title,
            done: Boolean(sub.done),
            order: Number.isFinite(sub.order) ? sub.order : index,
          }))
      : [],
  };
}

export class TodoStore {
  constructor() {
    this.state = {
      lists: [],
      tasks: [],
      tags: [],
      settings: { ...DEFAULT_SETTINGS, reminders: {} },
    };
    this.listeners = new Set();
    this.storageBound = false;
  }

  // ---------------------------------------------------------------- 生命周期

  load() {
    const storedLists = readJson(KEYS.lists, null);
    const lists = Array.isArray(storedLists) && storedLists.length
      ? storedLists
          .filter((list) => list && typeof list.name === 'string')
          .map((list, index) => ({
            id: typeof list.id === 'string' && list.id ? list.id : uid(),
            name: list.name,
            order: Number.isFinite(list.order) ? list.order : index,
          }))
          .sort((a, b) => a.order - b.order)
      : [];

    if (!lists.length) {
      lists.push({ id: uid(), name: '我的待办', order: 0 });
    }

    const listIds = new Set(lists.map((list) => list.id));
    const fallbackListId = lists[0].id;
    const storedTasks = readJson(KEYS.tasks, []);
    const tasks = (Array.isArray(storedTasks) ? storedTasks : [])
      .map((task) => normalizeTask(task, fallbackListId))
      .filter(Boolean)
      .map((task) => (listIds.has(task.listId) ? task : { ...task, listId: fallbackListId }));

    const storedTags = readJson(KEYS.tags, []);
    const tags = Array.isArray(storedTags) ? storedTags.filter((tag) => typeof tag === 'string') : [];

    const storedSettings = readJson(KEYS.settings, {});
    const settings = { ...DEFAULT_SETTINGS, ...(storedSettings && typeof storedSettings === 'object' ? storedSettings : {}) };
    if (!settings.reminders || typeof settings.reminders !== 'object') settings.reminders = {};
    if (!SORTS.some((sort) => sort.value === settings.defaultSort)) settings.defaultSort = 'manual';
    if (settings.weekStart !== 0 && settings.weekStart !== 1) settings.weekStart = 1;
    if (!lists.some((list) => list.id === settings.defaultListId)) settings.defaultListId = fallbackListId;

    this.state = { lists, tasks, tags, settings };
    this.persistAll();
    return this.state;
  }

  /** 监听其它 iframe（后台/多实例）对 localStorage 的写，保持界面同步 */
  bindStorageSync() {
    if (this.storageBound || typeof window === 'undefined') return;
    this.storageBound = true;
    window.addEventListener('storage', (event) => {
      if (!event.key || !Object.values(KEYS).includes(event.key)) return;
      this.load();
      this.emit();
    });
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    for (const fn of [...this.listeners]) {
      try {
        fn(this.state);
      } catch (error) {
        console.error('[todo] listener error', error);
      }
    }
  }

  persistAll() {
    // 整表落盘时保留其它 iframe 已写入的提醒标记（例如设置浮层删清单时，
    // 它的 settings 快照可能早于后台 iframe 刚写入的标记）。
    this.state.settings.reminders = {
      ...readStoredReminders(),
      ...(this.state.settings.reminders || {}),
    };
    writeJson(KEYS.lists, this.state.lists);
    writeJson(KEYS.tasks, this.state.tasks);
    writeJson(KEYS.tags, this.state.tags);
    writeJson(KEYS.settings, this.state.settings);
  }

  persistTasks() {
    writeJson(KEYS.tasks, this.state.tasks);
  }

  persistLists() {
    writeJson(KEYS.lists, this.state.lists);
  }

  persistTags() {
    writeJson(KEYS.tags, this.state.tags);
  }

  persistSettings() {
    writeJson(KEYS.settings, this.state.settings);
  }

  // ---------------------------------------------------------------- 选择器

  get lists() {
    return [...this.state.lists].sort((a, b) => a.order - b.order);
  }

  get tasks() {
    return this.state.tasks;
  }

  get settings() {
    return this.state.settings;
  }

  listById(listId) {
    return this.state.lists.find((list) => list.id === listId) || null;
  }

  taskById(taskId) {
    return this.state.tasks.find((task) => task.id === taskId) || null;
  }

  nextOrder(listId) {
    const tasks = this.state.tasks.filter((task) => task.listId === listId);
    if (!tasks.length) return 0;
    return Math.max(...tasks.map((task) => (Number.isFinite(task.order) ? task.order : 0))) + 1;
  }

  nextListOrder() {
    if (!this.state.lists.length) return 0;
    return Math.max(...this.state.lists.map((list) => list.order)) + 1;
  }

  allTags() {
    const set = new Set(this.state.tags);
    for (const task of this.state.tasks) for (const tag of task.tags) set.add(tag);
    return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }

  sortTasks(tasks, sort = this.settings.defaultSort) {
    const sorted = [...tasks];
    const byDue = (a, b) => {
      const da = toDate(a.dueAt);
      const db = toDate(b.dueAt);
      if (da && db) return da.getTime() - db.getTime();
      if (da) return -1;
      if (db) return 1;
      return a.order - b.order;
    };
    switch (sort) {
      case 'due':
        return sorted.sort(byDue);
      case 'priority':
        return sorted.sort((a, b) => b.priority - a.priority || byDue(a, b));
      case 'created':
        return sorted.sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
      case 'manual':
      default:
        return sorted.sort((a, b) => a.order - b.order || (toDate(a.createdAt)?.getTime() || 0) - (toDate(b.createdAt)?.getTime() || 0));
    }
  }

  listTasks(listId, { done = false, sort } = {}) {
    return this.sortTasks(
      this.state.tasks.filter((task) => task.listId === listId && task.done === done),
      sort,
    );
  }

  undoneTasks() {
    return this.state.tasks.filter((task) => !task.done);
  }

  doneTasks() {
    return this.state.tasks.filter((task) => task.done);
  }

  /** 按 dueAt 落在某一天分组（未完成） */
  tasksDueOn(day, { includeOverdue = false } = {}) {
    const target = toDate(day) || new Date();
    return this.state.tasks.filter((task) => {
      if (task.done || !task.dueAt) return false;
      const due = toDate(task.dueAt);
      if (isSameDay(due, target)) return true;
      return includeOverdue && due < startOfDay(target);
    });
  }

  /** 日历格子用：某天未完成任务数 */
  dueCountOn(day) {
    return this.tasksDueOn(day).length;
  }

  matchesQuery(task, query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return true;
    if (task.title.toLowerCase().includes(q)) return true;
    if (task.note && task.note.toLowerCase().includes(q)) return true;
    if (task.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
    if (task.subtasks.some((sub) => sub.title.toLowerCase().includes(q))) return true;
    return false;
  }

  searchTasks(query, { done } = {}) {
    const q = String(query || '').trim();
    if (!q) return [];
    const hits = this.state.tasks.filter((task) => this.matchesQuery(task, q));
    const filtered = done === undefined ? hits : hits.filter((task) => task.done === done);
    return this.sortTasks(filtered, 'due');
  }

  /** 近 N 天按完成量统计（热力图） */
  completionStats(days = 84, { weighted = false } = {}) {
    const today = startOfDay(new Date());
    const from = addDays(today, -(days - 1));
    /** @type {Map<string, {count:number, weight:number}>} */
    const byDay = new Map();
    for (let i = 0; i < days; i++) byDay.set(dayKey(addDays(from, i)), { count: 0, weight: 0 });
    let total = 0;
    let weightedTotal = 0;
    for (const task of this.state.tasks) {
      if (!task.done || !task.doneAt) continue;
      const done = toDate(task.doneAt);
      if (!done || done < from) continue;
      const bucket = byDay.get(dayKey(done));
      if (!bucket) continue;
      bucket.count += 1;
      bucket.weight += task.priority === 3 ? 3 : task.priority === 2 ? 2 : 1;
      total += 1;
      weightedTotal += task.priority === 3 ? 3 : task.priority === 2 ? 2 : 1;
    }
    const streak = (() => {
      let cursor = today;
      // 今天还没完成不算断，从昨天开始数连续记录
      if ((byDay.get(dayKey(today))?.count || 0) === 0) cursor = addDays(today, -1);
      let value = 0;
      while (byDay.has(dayKey(cursor)) && (byDay.get(dayKey(cursor))?.count || 0) > 0) {
        value += 1;
        cursor = addDays(cursor, -1);
      }
      return value;
    })();
    return { byDay, from, to: today, total, weightedTotal, streak, weighted, days };
  }

  // ---------------------------------------------------------------- 变更

  touch(task) {
    task.updatedAt = nowIso();
  }

  addTask(input = {}) {
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    if (!title) throw new Error('title 不能为空');
    if (typeof input.listId !== 'undefined' && input.listId !== null) {
      // Agent / 表单给了清单就必须存在；静默落到默认清单会让调用方以为写进了目标清单。
      if (!this.state.lists.some((list) => list.id === input.listId)) {
        throw new Error(`找不到清单 ${input.listId}`);
      }
    }
    const listId = input.listId || this.settings.defaultListId || this.state.lists[0].id;
    if (typeof input.priority !== 'undefined' && input.priority !== null && !isPriority(input.priority)) {
      throw new Error('priority 必须是 0–3');
    }
    const recurrence = input.recurrence ?? undefined;
    if (recurrence && !RECURRENCES.some((item) => item.value === recurrence)) {
      throw new Error('recurrence 必须是 daily / weekly / monthly / yearly');
    }
    const createdAt = nowIso();
    const task = {
      id: uid(),
      listId,
      title,
      note: typeof input.note === 'string' && input.note.trim() ? input.note.trim() : undefined,
      done: false,
      createdAt,
      updatedAt: createdAt,
      order: this.nextOrder(listId),
      priority: isPriority(input.priority) ? input.priority : 0,
      dueAt: parseDateInput(input.dueAt) || undefined,
      remindAt: parseDateInput(input.remindAt) || undefined,
      recurrence: recurrence || undefined,
      tags: Array.isArray(input.tags) ? input.tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim()) : [],
      subtasks: Array.isArray(input.subtasks)
        ? input.subtasks
            .filter((sub) => sub && typeof (sub.title ?? sub) === 'string' && String(sub.title ?? sub).trim())
            .map((sub, index) => ({ id: uid(), title: String(sub.title ?? sub).trim(), done: Boolean(sub.done), order: index }))
        : [],
    };
    this.state.tasks.push(task);
    this.rememberTags(task.tags);
    this.persistTasks();
    this.emit();
    return task;
  }

  updateTask(taskId, patch = {}) {
    const task = this.taskById(taskId);
    if (!task) throw new Error(`找不到任务 ${taskId}`);
    const changes = { ...patch };

    if (typeof changes.title !== 'undefined') {
      const title = String(changes.title ?? '').trim();
      if (!title) throw new Error('title 不能为空');
      task.title = title;
    }
    if (typeof changes.note !== 'undefined') {
      const note = typeof changes.note === 'string' ? changes.note.trim() : '';
      task.note = note || undefined;
    }
    if (typeof changes.priority !== 'undefined') {
      if (!isPriority(changes.priority)) throw new Error('priority 必须是 0–3');
      task.priority = changes.priority;
    }
    if (typeof changes.dueAt !== 'undefined') task.dueAt = parseDateInput(changes.dueAt) || undefined;
    if (typeof changes.remindAt !== 'undefined') {
      const previousRemindAt = task.remindAt;
      const nextRemindAt = parseDateInput(changes.remindAt) || undefined;
      task.remindAt = nextRemindAt;
      // 只有提醒时间真的变了才重新武装；详情表单保存会把秒归一化，
      // 同一分钟内保存标题/备注不能把已经弹过的提醒再弹一次。
      if (!sameReminderMinute(previousRemindAt, nextRemindAt)) this.clearFiredReminder(task);
    }
    if (typeof changes.recurrence !== 'undefined') {
      if (changes.recurrence && !RECURRENCES.some((item) => item.value === changes.recurrence)) {
        throw new Error('recurrence 必须是 daily / weekly / monthly / yearly');
      }
      task.recurrence = changes.recurrence || undefined;
    }
    if (typeof changes.tags !== 'undefined') {
      if (!Array.isArray(changes.tags)) throw new Error('tags 必须是字符串数组');
      task.tags = [...new Set(changes.tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim()))];
      this.rememberTags(task.tags);
    }
    if (typeof changes.listId !== 'undefined') {
      if (!this.state.lists.some((list) => list.id === changes.listId)) throw new Error(`找不到清单 ${changes.listId}`);
      if (task.listId !== changes.listId) {
        task.listId = changes.listId;
        task.order = this.nextOrder(changes.listId);
      }
    }
    if (typeof changes.done !== 'undefined') {
      this.setDoneInternal(task, Boolean(changes.done));
    }
    if (typeof changes.order !== 'undefined' && Number.isFinite(changes.order)) task.order = changes.order;

    this.touch(task);
    this.persistTasks();
    this.emit();
    return task;
  }

  setDone(taskId, done = true) {
    const task = this.taskById(taskId);
    if (!task) throw new Error(`找不到任务 ${taskId}`);
    this.setDoneInternal(task, Boolean(done));
    this.touch(task);
    this.persistTasks();
    this.emit();
    return task;
  }

  setDoneInternal(task, done) {
    if (task.done === done) return;
    task.done = done;
    task.doneAt = done ? nowIso() : undefined;
    if (done && task.recurrence) this.spawnNextOccurrence(task);
  }

  /** 重复任务：完成时生成下一次（文档：dueAt 往后推一个周期，原任务保留为已完成） */
  spawnNextOccurrence(task) {
    const base = toDate(task.dueAt) || new Date();
    let next = nextOccurrence(base, task.recurrence);
    if (!next) return null;
    // 逾期很久才完成时，直接推进到下一次未来时间
    const now = new Date();
    let guard = 0;
    while (next <= now && guard < 1000) {
      next = nextOccurrence(next, task.recurrence);
      guard += 1;
    }
    const delta = next.getTime() - base.getTime();
    const createdAt = nowIso();
    const copy = {
      id: uid(),
      listId: task.listId,
      title: task.title,
      note: task.note,
      done: false,
      createdAt,
      updatedAt: createdAt,
      order: this.nextOrder(task.listId),
      priority: task.priority,
      dueAt: next.toISOString(),
      remindAt: task.remindAt ? new Date(toDate(task.remindAt).getTime() + delta).toISOString() : undefined,
      recurrence: task.recurrence,
      tags: [...task.tags],
      subtasks: task.subtasks.map((sub, index) => ({ id: uid(), title: sub.title, done: false, order: index })),
    };
    this.state.tasks.push(copy);
    return copy;
  }

  removeTask(taskId) {
    const index = this.state.tasks.findIndex((task) => task.id === taskId);
    if (index < 0) throw new Error(`找不到任务 ${taskId}`);
    const [removed] = this.state.tasks.splice(index, 1);
    const reminders = { ...readStoredReminders(), ...(this.state.settings.reminders || {}) };
    delete reminders[taskId];
    this.state.settings.reminders = reminders;
    this.persistTasks();
    this.persistSettings();
    this.emit();
    return { ok: true, id: taskId, removed };
  }

  clearCompleted({ listId } = {}) {
    const removedIds = this.state.tasks
      .filter((task) => task.done && (!listId || task.listId === listId))
      .map((task) => task.id);
    if (removedIds.length === 0) return 0;
    this.state.tasks = this.state.tasks.filter((task) => !removedIds.includes(task.id));
    // 任务删除后清掉它的提醒标记，避免 todo.settings.reminders 无限堆积；
    // 合并其他 iframe 的标记，不能把无关任务的已触发状态抹掉。
    const reminders = { ...readStoredReminders(), ...(this.state.settings.reminders || {}) };
    for (const id of removedIds) delete reminders[id];
    this.state.settings.reminders = reminders;
    this.persistTasks();
    this.persistSettings();
    this.emit();
    return removedIds.length;
  }

  /** 手动排序：把任务排到目标顺序（ids 是该清单当前可见任务的完整顺序） */
  reorderTasks(listId, orderedIds) {
    const idSet = new Set(orderedIds);
    const tasks = this.state.tasks.filter((task) => task.listId === listId && idSet.has(task.id));
    orderedIds.forEach((id, index) => {
      const task = tasks.find((item) => item.id === id);
      if (task) task.order = index;
    });
    this.persistTasks();
    this.emit();
  }

  addList(name) {
    const trimmed = String(name ?? '').trim();
    if (!trimmed) throw new Error('清单名不能为空');
    const list = {
      id: uid(),
      name: trimmed,
      order: this.nextListOrder(),
    };
    this.state.lists.push(list);
    this.persistLists();
    this.emit();
    return list;
  }

  updateList(listId, patch = {}) {
    const list = this.listById(listId);
    if (!list) throw new Error(`找不到清单 ${listId}`);
    if (typeof patch.name === 'string' && patch.name.trim()) list.name = patch.name.trim();
    this.persistLists();
    this.emit();
    return list;
  }

  removeList(listId) {
    const list = this.listById(listId);
    if (!list) throw new Error(`找不到清单 ${listId}`);
    if (this.state.lists.length <= 1) throw new Error('至少保留一个清单');
    this.state.lists = this.state.lists.filter((item) => item.id !== listId);
    const removedTaskIds = this.state.tasks
      .filter((task) => task.listId === listId)
      .map((task) => task.id);
    this.state.tasks = this.state.tasks.filter((task) => task.listId !== listId);
    // 清单连同任务一起删除时，同步清掉这些任务的提醒标记（保留其他 iframe 的标记）
    const reminders = { ...readStoredReminders(), ...(this.state.settings.reminders || {}) };
    for (const id of removedTaskIds) delete reminders[id];
    this.state.settings.reminders = reminders;
    if (this.state.settings.defaultListId === listId) {
      this.state.settings.defaultListId = this.state.lists[0].id;
    }
    // 不能走 persistAll：它会按“存储 + 当前”合并提醒标记，把刚删掉的 id 从存储读回来。
    this.persistLists();
    this.persistTasks();
    this.persistSettings();
    this.emit();
    return { ok: true, id: listId, name: list.name, removedTasks: removedTaskIds.length };
  }

  addSubtask(taskId, title) {
    const task = this.taskById(taskId);
    if (!task) throw new Error(`找不到任务 ${taskId}`);
    const trimmed = String(title ?? '').trim();
    if (!trimmed) throw new Error('子任务标题不能为空');
    const order = task.subtasks.length ? Math.max(...task.subtasks.map((sub) => sub.order)) + 1 : 0;
    task.subtasks.push({ id: uid(), title: trimmed, done: false, order });
    this.touch(task);
    this.persistTasks();
    this.emit();
    return task;
  }

  completeSubtask(taskId, subtaskId, done = true) {
    const task = this.taskById(taskId);
    if (!task) throw new Error(`找不到任务 ${taskId}`);
    const subtask = task.subtasks.find((sub) => sub.id === subtaskId);
    if (!subtask) throw new Error(`找不到子任务 ${subtaskId}`);
    subtask.done = Boolean(done);
    this.touch(task);
    this.persistTasks();
    this.emit();
    return task;
  }

  removeSubtask(taskId, subtaskId) {
    const task = this.taskById(taskId);
    if (!task) throw new Error(`找不到任务 ${taskId}`);
    task.subtasks = task.subtasks.filter((sub) => sub.id !== subtaskId);
    this.touch(task);
    this.persistTasks();
    this.emit();
    return task;
  }

  rememberTags(tags) {
    if (!Array.isArray(tags) || !tags.length) return;
    let changed = false;
    for (const tag of tags) {
      if (!this.state.tags.includes(tag)) {
        this.state.tags.push(tag);
        changed = true;
      }
    }
    if (changed) this.persistTags();
  }

  updateSettings(patch = {}) {
    Object.assign(this.state.settings, patch);
    // 配置写入不能覆盖其它 iframe 已记录的提醒标记：卡片启动时可能拿着
    // 抢锁前的旧 settings 快照，直接 persist 会把刚写入的标记抹掉并导致重弹。
    this.state.settings.reminders = {
      ...readStoredReminders(),
      ...(this.state.settings.reminders || {}),
    };
    if (!this.state.lists.some((list) => list.id === this.state.settings.defaultListId)) {
      this.state.settings.defaultListId = this.state.lists[0]?.id ?? null;
    }
    this.persistSettings();
    this.emit();
    return this.state.settings;
  }

  // ---------------------------------------------------------------- 提醒

  /**
   * 找出到期且未触发的提醒并标记。
   *
   * 标记写进 `todo.settings.reminders`，跨 iframe 共享；同一个提醒按
   * “任务 id + 提醒分钟”去重（详情表单会把秒归一化，不能按字面量比较）。
   * 调用方（reminders.js）会用 navigator.locks 把这段读改写包成原子操作，
   * 避免两个 iframe 同时读到未标记状态各弹一次。
   */
  claimDueReminders(now = new Date()) {
    const due = [];
    const fresh = readJson(KEYS.settings, null);
    const freshSettings = fresh && typeof fresh === 'object' ? fresh : {};
    const freshReminders = readStoredReminders();
    for (const task of this.state.tasks) {
      if (task.done || !task.remindAt) continue;
      const remind = toDate(task.remindAt);
      if (!remind || remind > now) continue;
      if (
        freshReminders[task.id] !== undefined &&
        sameReminderMinute(freshReminders[task.id], task.remindAt)
      ) {
        continue;
      }
      freshReminders[task.id] = task.remindAt;
      due.push(task);
    }
    if (due.length) {
      const nextSettings = { ...freshSettings, reminders: freshReminders };
      writeJson(KEYS.settings, nextSettings);
      this.state.settings = { ...this.state.settings, ...nextSettings, reminders: freshReminders };
    }
    return due;
  }

  clearFiredReminder(task) {
    // 只删目标任务的标记；先把其它 iframe 已写入的标记合并进来，避免旧快照
    // 把一个不相关的提醒标记抹掉后导致它重弹。
    const reminders = { ...readStoredReminders(), ...(this.state.settings.reminders || {}) };
    if (!(task.id in reminders)) return;
    delete reminders[task.id];
    this.state.settings.reminders = reminders;
    this.persistSettings();
  }

  /** 稍后提醒：把 remindAt 推后，并允许再次触发 */
  snoozeReminder(taskId, ms = 10 * 60 * 1000) {
    const task = this.taskById(taskId);
    if (!task) return null;
    task.remindAt = new Date(Date.now() + ms).toISOString();
    const reminders = { ...readStoredReminders(), ...(this.state.settings.reminders || {}) };
    delete reminders[task.id];
    this.state.settings.reminders = reminders;
    this.persistSettings();
    this.persistTasks();
    this.emit();
    return task;
  }

  /** 统计（复盘用） */
  statsRange({ from, to } = {}) {
    const fromDate = toDate(from) || addDays(startOfDay(new Date()), -30);
    const toDateValue = toDate(to) || new Date();
    const completed = this.state.tasks.filter((task) => {
      if (!task.done || !task.doneAt) return false;
      const done = toDate(task.doneAt);
      return done >= fromDate && done <= toDateValue;
    });
    const byDay = {};
    const byList = {};
    const byPriority = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (const task of completed) {
      const key = dayKey(task.doneAt);
      byDay[key] = (byDay[key] || 0) + 1;
      byList[task.listId] = (byList[task.listId] || 0) + 1;
      byPriority[task.priority] += 1;
    }
    return {
      from: fromDate.toISOString(),
      to: toDateValue.toISOString(),
      completed: completed.length,
      created: this.state.tasks.filter((task) => {
        const created = toDate(task.createdAt);
        return created && created >= fromDate && created <= toDateValue;
      }).length,
      byDay,
      byList,
      byPriority,
      listNames: Object.fromEntries(this.state.lists.map((list) => [list.id, list.name])),
    };
  }
}

/** 单例：整个页面共用一个 store */
export const store = new TodoStore();
