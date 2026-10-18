/**
 * Agent 工具：文档 docs/components/todo.md「Agent 工具」一节的全部 10 个工具 + todo.stats（复盘数据）。
 * 只依赖 store，不碰 DOM；宿主通过 host:tool-call 调过来，结果用 plugin.toolResult 回传。
 */
import { store } from './store.js';
import { PRIORITIES, RECURRENCES } from './date.js';

const taskSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    listId: { type: 'string' },
    title: { type: 'string' },
    note: { type: 'string' },
    done: { type: 'boolean' },
    doneAt: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    order: { type: 'number' },
    priority: { type: 'number', enum: [0, 1, 2, 3] },
    dueAt: { type: 'string' },
    remindAt: { type: 'string' },
    recurrence: { type: 'string', enum: RECURRENCES.map((item) => item.value) },
    tags: { type: 'array', items: { type: 'string' } },
    subtasks: { type: 'array' },
  },
};

function dateOrNull(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return String(value);
}

function listSummary(list) {
  const tasks = store.state.tasks.filter((task) => task.listId === list.id);
  const done = tasks.filter((task) => task.done).length;
  return { ...list, total: tasks.length, undone: tasks.length - done, done };
}

export const TOOL_DECLS = [
  {
    name: 'todo.lists',
    description: '列出所有待办清单（含未完成/已完成数量）',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'todo.list',
    description: '查询任务；默认只返回未完成任务。可用 listId / done / dueBefore / tag / query 过滤。',
    parameters: {
      type: 'object',
      properties: {
        listId: { type: 'string', description: '只看某个清单' },
        done: { type: 'boolean', description: 'true 只看已完成，false 只看未完成，不传默认未完成' },
        dueBefore: { type: 'string', description: 'ISO 时间或 YYYY-MM-DD，只看该时间前到期的任务' },
        tag: { type: 'string' },
        query: { type: 'string' },
      },
    },
  },
  {
    name: 'todo.add',
    description: '新建任务。title 必填；可带 listId / priority(0-3) / dueAt / remindAt / recurrence / tags / subtasks。',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        listId: { type: 'string' },
        priority: { type: 'number', enum: [0, 1, 2, 3] },
        dueAt: { type: 'string', description: 'ISO 时间；只有日期时按当天 23:59 到期' },
        note: { type: 'string' },
        remindAt: { type: 'string' },
        recurrence: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'] },
        tags: { type: 'array', items: { type: 'string' } },
        subtasks: { type: 'array', items: { oneOf: [{ type: 'string' }, { type: 'object' }] } },
      },
      required: ['title'],
    },
  },
  {
    name: 'todo.addList',
    description: '新建清单',
    parameters: {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    },
  },
  {
    name: 'todo.complete',
    description: '勾选 / 取消勾选任务（done 默认 true）。重复任务完成时会自动生成下一次。',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' }, done: { type: 'boolean' } },
      required: ['id'],
    },
  },
  {
    name: 'todo.update',
    description: '更新任务字段：标题、备注、优先级、截止、提醒、重复、标签、移动清单。',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        note: { type: 'string' },
        priority: { type: 'number', enum: [0, 1, 2, 3] },
        dueAt: { type: ['string', 'null'] },
        remindAt: { type: ['string', 'null'] },
        recurrence: { type: ['string', 'null'], enum: ['daily', 'weekly', 'monthly', 'yearly', null] },
        tags: { type: 'array', items: { type: 'string' } },
        listId: { type: 'string' },
      },
      required: ['id'],
    },
  },
  {
    name: 'todo.remove',
    description: '删除任务',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'todo.addSubtask',
    description: '给任务加子任务',
    parameters: {
      type: 'object',
      properties: { taskId: { type: 'string' }, title: { type: 'string' } },
      required: ['taskId', 'title'],
    },
  },
  {
    name: 'todo.completeSubtask',
    description: '勾选 / 取消勾选子任务（done 默认 true）',
    parameters: {
      type: 'object',
      properties: { taskId: { type: 'string' }, subtaskId: { type: 'string' }, done: { type: 'boolean' } },
      required: ['taskId', 'subtaskId'],
    },
  },
  {
    name: 'todo.search',
    description: '在标题、备注、标签、子任务标题里搜索任务',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
  {
    name: 'todo.stats',
    description: '任务的完成统计（按天/清单/优先级），用于复盘页与热力图；from/to 省略时默认近 30 天。',
    parameters: {
      type: 'object',
      properties: {
        from: { type: 'string' },
        to: { type: 'string' },
      },
    },
  },
];

/** 供 UI 用的“任务 + 清单名”视图对象 */
function enrich(task) {
  return {
    ...task,
    listName: store.listById(task.listId)?.name,
    listColor: store.listById(task.listId)?.color,
  };
}

function run(name, args = {}) {
  switch (name) {
    case 'todo.lists':
      return store.lists.map(listSummary);
    case 'todo.list': {
      let tasks = store.state.tasks;
      if (args.listId) {
        if (!store.listById(args.listId)) throw new Error(`找不到清单 ${args.listId}`);
        tasks = tasks.filter((task) => task.listId === args.listId);
      }
      if (typeof args.done === 'boolean') tasks = tasks.filter((task) => task.done === args.done);
      else tasks = tasks.filter((task) => !task.done);
      if (args.dueBefore) {
        const before = new Date(args.dueBefore);
        if (Number.isNaN(before.getTime())) throw new Error('dueBefore 不是合法时间');
        const end = /^\d{4}-\d{2}-\d{2}$/.test(args.dueBefore)
          ? new Date(before.getFullYear(), before.getMonth(), before.getDate(), 23, 59, 59)
          : before;
        tasks = tasks.filter((task) => task.dueAt && new Date(task.dueAt) <= end);
      }
      if (args.tag) tasks = tasks.filter((task) => task.tags.includes(args.tag));
      if (args.query) tasks = tasks.filter((task) => store.matchesQuery(task, args.query));
      return store.sortTasks(tasks, 'due').map(enrich);
    }
    case 'todo.add': {
      if (!args.title || !String(args.title).trim()) throw new Error('title 不能为空');
      const task = store.addTask({
        title: args.title,
        listId: args.listId,
        priority: args.priority,
        dueAt: dateOrNull(args.dueAt),
        note: args.note,
        remindAt: dateOrNull(args.remindAt),
        recurrence: args.recurrence,
        tags: args.tags,
        subtasks: args.subtasks,
      });
      return enrich(task);
    }
    case 'todo.addList':
      return store.addList(args.name);
    case 'todo.complete':
      return enrich(store.setDone(args.id, typeof args.done === 'boolean' ? args.done : true));
    case 'todo.update': {
      const patch = { ...args };
      delete patch.id;
      if ('dueAt' in patch) patch.dueAt = dateOrNull(patch.dueAt);
      if ('remindAt' in patch) patch.remindAt = dateOrNull(patch.remindAt);
      return enrich(store.updateTask(args.id, patch));
    }
    case 'todo.remove':
      return store.removeTask(args.id);
    case 'todo.addSubtask':
      return enrich(store.addSubtask(args.taskId, args.title));
    case 'todo.completeSubtask':
      return enrich(store.completeSubtask(args.taskId, args.subtaskId, typeof args.done === 'boolean' ? args.done : true));
    case 'todo.search':
      return store.searchTasks(args.query).map(enrich);
    case 'todo.stats':
      return store.statsRange({ from: args.from, to: args.to });
    default:
      throw new Error(`未知工具 ${name}`);
  }
}

export function runTool(name, args) {
  try {
    return { ok: true, result: run(name, args || {}) };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
}

/** 校验工具声明与文档一致（自测用） */
export function toolNames() {
  return TOOL_DECLS.map((tool) => tool.name);
}

export { PRIORITIES };
