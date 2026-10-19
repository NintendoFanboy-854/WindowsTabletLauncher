/**
 * 待办数据层与 React 的连接（DECISIONS D-02b）：
 * - 复用 js/* 纯 JS 模块（store / demo / reminders / tools / config）；
 * - 提供 React 订阅 hook、Agent 工具处理、宿主详情浮层入口。
 *
 * 提醒单写者：宿主里只有后台常驻 iframe（manifest `background: true`）跑提醒循环；
 * 卡片/详情/清单管理视图只读数据，不启动提醒，避免同一提醒被多个实例重复弹出。
 */

import { useSyncExternalStore } from 'react';
import { requestHostSettings, requestOverlay } from '../../_shared/host.js';
import { store } from '../js/store.js';
import { shouldSeedDemo, seedDemo } from '../js/demo.js';
import { startReminderLoop } from '../js/reminders.js';
import { TOOL_DECLS, runTool } from '../js/tools.js';

let booted = false;
let storeVersion = 0;

store.subscribe(() => {
  storeVersion += 1;
});

/**
 * 数据层启动：加载 localStorage、演示数据、跨 iframe 同步、提醒定时器。
 * @param {{startReminders?: boolean}} [options]
 */
export function startTodoData({ startReminders = true } = {}) {
  if (booted) return store;
  booted = true;
  store.load();
  try {
    if (shouldSeedDemo()) seedDemo();
  } catch (error) {
    console.warn('[todo] 演示数据注入失败', error);
  }
  store.bindStorageSync();
  if (startReminders) startReminderLoop();
  return store;
}

/** 订阅 store 变更（单例版本号），返回 store 便于组件选择数据 */
export function useTodoStore() {
  useSyncExternalStore(
    (callback) => store.subscribe(callback),
    () => storeVersion,
    () => storeVersion,
  );
  return store;
}

/* ------------------------------------------------------------------ */
/* 宿主浮层（全窗口 Dialog，避免卡片 iframe 裁切）                       */
/* ------------------------------------------------------------------ */

/** 打开 L1 详情（卡片主体点击 / 键盘 Enter/Space 的唯一主操作） */
export function openTodoDetail() {
  requestOverlay('detail', '待办详情');
}

/** 设置入口：只发 `plugin:request-host-settings`，导航与关浮层由宿主负责（契约 §5） */
export function openHostSettings() {
  requestHostSettings();
}

/* ------------------------------------------------------------------ */
/* Agent 工具                                                          */
/* ------------------------------------------------------------------ */

/** 工具名 → 处理函数（useAgentTools 的 handlers 形状：返回 Promise / 抛错） */
export function buildToolHandlers() {
  const handlers = {};
  for (const declaration of TOOL_DECLS) {
    handlers[declaration.name] = async (args) => {
      const { ok, result, error } = await runTool(declaration.name, args);
      if (!ok) throw new Error(error);
      return result;
    };
  }
  return handlers;
}

export { TOOL_DECLS };
