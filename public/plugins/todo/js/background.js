/**
 * 后台常驻 iframe 入口（manifest.background=true）：
 * 不渲染界面，只负责提醒定时器 + Agent 工具注册，保证没有待办组件挂载时提醒仍然生效。
 */
import { plugin } from '/plugin-sdk.js';
import { store } from './store.js';
import { TOOL_DECLS, runTool } from './tools.js';
import { startReminderLoop } from './reminders.js';

store.load();
store.bindStorageSync();
startReminderLoop();
plugin.ready(TOOL_DECLS);

plugin.onToolCall((data) => {
  const { ok, result, error } = runTool(data.name, data.args);
  plugin.toolResult(data.id, ok, ok ? result : error);
});

plugin.onInit((payload) => {
  const config = payload?.config;
  if (!config || typeof config !== 'object') return;
  const incoming = config.settings && typeof config.settings === 'object' ? config.settings : config;
  const patch = {};
  for (const key of ['defaultListId', 'showCompleted', 'defaultSort', 'fontSize', 'weekStart']) {
    if (key in incoming) patch[key] = incoming[key];
  }
  if (Object.keys(patch).length) store.updateSettings(patch);
});
