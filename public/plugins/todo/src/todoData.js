/**
 * 待办数据层与 React 的连接（DECISIONS D-02b）：
 * - 复用 public/plugins/todo/js/* 纯 JS 模块（store / demo / reminders / tools）；
 * - 提供 React 订阅 hook、Agent 工具处理、宿主浮层接管（设置 / 任务详情 / 全部任务）。
 */

import { useEffect, useSyncExternalStore } from 'react';
import { requestOverlay, requestSettings } from '../../_shared/host.js';
import { store } from '../js/store.js';
import { shouldSeedDemo, seedDemo } from '../js/demo.js';
import { startReminderLoop } from '../js/reminders.js';
import { TOOL_DECLS, runTool } from '../js/tools.js';

let booted = false;

/** 数据层启动：加载 localStorage、演示数据、跨 iframe 同步、提醒定时器 */
export function startTodoData() {
  if (booted) return store;
  booted = true;
  store.load();
  try {
    if (shouldSeedDemo()) seedDemo();
  } catch (error) {
    console.warn('[todo] 演示数据注入失败', error);
  }
  store.bindStorageSync();
  startReminderLoop();
  return store;
}

/* ------------------------------------------------------------------ */
/* React 订阅                                                          */
/* ------------------------------------------------------------------ */

let storeVersion = 0;
store.subscribe(() => {
  storeVersion += 1;
});

/** 订阅 store 变更（单例版本号），返回 store 便于组件选择数据 */
export function useTodoStore() {
  useSyncExternalStore(
    (callback) => store.subscribe(callback),
    () => storeVersion,
    () => storeVersion,
  );
  return store;
}

/** 把宿主配置（useStoredConfig）同步进数据层的 settings（默认清单/排序/显示已完成等） */
export function useApplyConfig(config, loaded) {
  const signature = JSON.stringify(config);
  useEffect(() => {
    if (!loaded) return;
    store.updateSettings({
      defaultListId: config.defaultListId,
      showCompleted: config.showCompleted,
      defaultSort: config.defaultSort,
      fontSize: config.fontSize,
      weekStart: config.weekStart,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, signature]);
}

/* ------------------------------------------------------------------ */
/* 宿主浮层（全窗口 Dialog，避免卡片 iframe 裁切）                       */
/* ------------------------------------------------------------------ */

const OVERLAY_KEY = 'todo.overlay';

function writeOverlay(payload) {
  try {
    localStorage.setItem(OVERLAY_KEY, JSON.stringify(payload));
  } catch {
    /* localStorage 不可用时浮层退回默认内容 */
  }
}

export function readOverlayPayload() {
  try {
    const raw = localStorage.getItem(OVERLAY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function openTaskDetail(taskId) {
  writeOverlay({ mode: 'detail', taskId });
  requestOverlay('detail', '任务详情');
}

export function openNewTask(listId) {
  writeOverlay({ mode: 'new', listId });
  requestOverlay('detail', '新建任务');
}

export function openAllTasks({ listId, done = false, scope = null } = {}) {
  writeOverlay({ mode: 'all', listId, done, scope });
  requestOverlay('all', done ? '已完成任务' : '全部任务');
}

export function openSettingsView() {
  requestSettings('待办设置');
}

/* ------------------------------------------------------------------ */
/* Agent 工具                                                          */
/* ------------------------------------------------------------------ */

/** 工具名 → 处理函数（useAgentTools 的 handlers 形状：返回结果 / 抛错） */
export function buildToolHandlers() {
  const handlers = {};
  for (const declaration of TOOL_DECLS) {
    handlers[declaration.name] = (args) => {
      const { ok, result, error } = runTool(declaration.name, args);
      if (!ok) throw new Error(error);
      return result;
    };
  }
  return handlers;
}

export { TOOL_DECLS };
