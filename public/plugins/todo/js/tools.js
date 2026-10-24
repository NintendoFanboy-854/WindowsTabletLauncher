/**
 * Agent 工具：与 docs/components/todo.md「Agent 工具（UI 路径 ↔ 工具）」一一对应。
 *
 * 只依赖 store / config，不碰 DOM；宿主通过 host:tool-call 调过来，结果用
 * plugin.toolResult 回传。所有写操作都与 UI 共用同一数据层（store），
 * 因此 UI 与工具不会出现两套状态。
 */
import { readHostSettings, writeHostSettings } from './config.js';
import { store } from './store.js';
import { PRIORITIES, RECURRENCES } from './date.js';

function dateOrNull(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return String(value);
}

function listSummary(list) {
  const tasks = store.state.tasks.filter((task) => task.listId === list.id);
  const done = tasks.filter((task) => task.done).length;
  return {
    ...list,
    isDefault: store.settings.defaultListId === list.id,
    total: tasks.length,
    undone: tasks.length - done,
    done,
  };
}

/** 供 UI 用的“任务 + 清单名”视图对象 */
function enrich(task) {
  if (!task) return null;
  const list = store.listById(task.listId);
  return {
    ...task,
    listName: list?.name,
  };
}

function resolveSettingsPatch(args = {}) {
  if (args.patch && typeof args.patch === 'object' && !Array.isArray(args.patch)) return args.patch;
  const patch = {};
  for (const key of ['showCompleted', 'defaultSort', 'weekStart']) {
    if (Object.prototype.hasOwnProperty.call(args, key)) patch[key] = args[key];
  }
  return patch;
}

export const TOOL_DECLS = [
  {
    name: 'todo.lists',
    description: '列出所有待办清单（含未完成/已完成数量、哪个是默认清单）',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'todo.list',
    description:
      '查询任务；默认只返回未完成任务。可用 listId / done / dueBefore / tag / query 过滤。',
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
    description:
      '新建任务。title 必填；可带 listId / priority(0-3) / dueAt / remindAt / recurrence / tags / subtasks。',
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
    name: 'todo.complete',
    description: '勾选 / 取消勾选任务（done 默认 true）。重复任务完成时会自动生成下一次。',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' }, done: { type: 'boolean' } },
      required: ['id'],
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
    name: 'todo.removeSubtask',
    description: '删除任务下的一个子任务',
    parameters: {
      type: 'object',
      properties: { taskId: { type: 'string' }, subtaskId: { type: 'string' } },
      required: ['taskId', 'subtaskId'],
    },
  },
  {
    name: 'todo.addList',
    description: '新建清单（不再接受颜色：色相只由 manifest.identityHue 决定）',
    parameters: {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    },
  },
  {
    name: 'todo.renameList',
    description: '重命名清单',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' }, name: { type: 'string' } },
      required: ['id', 'name'],
    },
  },
  {
    name: 'todo.removeList',
    description: '删除清单；同时删除其中的任务（至少保留一个清单）',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'todo.setDefaultList',
    description: '设置默认清单（决定详情页初始筛选，不影响卡片）',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'todo.clearCompleted',
    description: '清空已完成任务；传 listId 只清某个清单，不传清全部',
    parameters: {
      type: 'object',
      properties: { listId: { type: 'string' } },
    },
  },
  {
    name: 'todo.stats',
    description:
      '任务的完成统计（按天/清单/优先级），用于复盘页与热力图；from/to 省略时默认近 30 天。',
    parameters: {
      type: 'object',
      properties: {
        from: { type: 'string' },
        to: { type: 'string' },
      },
    },
  },
  {
    name: 'todo.settings.get',
    description: '读取待办设置（显示已完成 / 默认排序 / 一周起始日）',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'todo.settings.set',
    description:
      '修改待办设置。patch 可含 showCompleted(boolean) / defaultSort(manual|due|priority|created) / weekStart(0=周日,1=周一)。',
    parameters: {
      type: 'object',
      properties: {
        patch: {
          type: 'object',
          properties: {
            showCompleted: { type: 'boolean' },
            defaultSort: { type: 'string', enum: ['manual', 'due', 'priority', 'created'] },
            weekStart: { type: 'number', enum: [0, 1] },
          },
        },
      },
      required: ['patch'],
    },
  },
];

async function run(name, args = {}) {
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
    case 'todo.update': {
      const patch = { ...args };
      delete patch.id;
      if ('dueAt' in patch) patch.dueAt = dateOrNull(patch.dueAt);
      if ('remindAt' in patch) patch.remindAt = dateOrNull(patch.remindAt);
      return enrich(store.updateTask(args.id, patch));
    }
    case 'todo.remove':
      return store.removeTask(args.id);
    case 'todo.complete':
      return enrich(store.setDone(args.id, typeof args.done === 'boolean' ? args.done : true));
    case 'todo.search':
      return store.searchTasks(args.query).map(enrich);
    case 'todo.addSubtask':
      return enrich(store.addSubtask(args.taskId, args.title));
    case 'todo.completeSubtask':
      return enrich(
        store.completeSubtask(args.taskId, args.subtaskId, typeof args.done === 'boolean' ? args.done : true),
      );
    case 'todo.removeSubtask':
      return enrich(store.removeSubtask(args.taskId, args.subtaskId));
    case 'todo.addList':
      return listSummary(store.addList(args.name));
    case 'todo.renameList': {
      if (!args.name || !String(args.name).trim()) throw new Error('清单名不能为空');
      return listSummary(store.updateList(args.id, { name: args.name }));
    }
    case 'todo.removeList':
      return store.removeList(args.id);
    case 'todo.setDefaultList': {
      const list = store.listById(args.id);
      if (!list) throw new Error(`找不到清单 ${args.id}`);
      store.updateSettings({ defaultListId: list.id });
      return listSummary(list);
    }
    case 'todo.clearCompleted':
      return { removed: store.clearCompleted({ listId: args.listId }) };
    case 'todo.stats':
      return store.statsRange({ from: args.from, to: args.to });
    case 'todo.settings.get':
      return readHostSettings();
    case 'todo.settings.set': {
      const patch = resolveSettingsPatch(args);
      if (Object.keys(patch).length === 0) throw new Error('没有要修改的设置项');
      return writeHostSettings(patch);
    }
    default:
      throw new Error(`未知工具 ${name}`);
  }
}

/** 执行工具，返回 `{ ok, result }` / `{ ok:false, error }`（异步：settings 走宿主桥） */
export async function runTool(name, args) {
  try {
    return { ok: true, result: await run(name, args || {}) };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
}

/** 校验工具声明与文档一致（自测用） */
export function toolNames() {
  return TOOL_DECLS.map((tool) => tool.name);
}

export { PRIORITIES };
