/**
 * 插件 SDK（浏览器原生 ES Module，插件页面直接引用）：
 *
 *   <script type="module">
 *     import { plugin } from '/plugin-sdk.js';
 *     plugin.onInit(({ size, theme, config }) => { ... });
 *     plugin.ready([{ name: 'clock.now', description: '返回当前时间' }]);
 *   </script>
 *
 * 脱离宿主单独打开时（开发/截图）也能工作：配置走 localStorage，notify 走 console。
 */

const isInHost = window.parent !== window;
const PLUGIN_ID = new URLSearchParams(location.search).get('plugin') || location.pathname.split('/')[2] || 'unknown';
const pending = new Map();
let seq = 0;
const handlers = { init: [], theme: [], resize: [], focus: [], tool: [] };

function post(message) {
  if (isInHost) window.parent.postMessage(message, '*');
}

function call(method, params) {
  if (!isInHost) return Promise.resolve(fallback(method, params));
  const id = `c${++seq}`;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    post({ type: 'plugin:call', id, method, params });
  });
}

/** 没有宿主时的兜底，让插件可以独立开发 */
function fallback(method, params) {
  switch (method) {
    case 'getConfig': {
      const raw = localStorage.getItem(`plugin.${PLUGIN_ID}.${params?.key}`);
      return raw ? JSON.parse(raw) : null;
    }
    case 'setConfig':
      localStorage.setItem(`plugin.${PLUGIN_ID}.${params?.key}`, JSON.stringify(params?.value));
      return undefined;
    case 'notify':
      console.info('[notify]', params?.text);
      return undefined;
    case 'setKeepAwake':
      return undefined;
    case 'getIdleSeconds':
      return 0;
    case 'showReminder':
      return { actionId: params?.actions?.[0]?.id };
    case 'getLocation':
      return null;
    default:
      return null;
  }
}

/**
 * 最近一次 init / theme / resize。
 *
 * 宿主在 iframe onLoad 后立刻发 host:init，主题变化也可能早于 React 的
 * useEffect 注册监听；如果只把消息转发给“当前已注册的 handler”，后注册的
 * 插件会永远拿不到这次更新（实测会出现插件停在深色、宿主已切亮色）。
 * 所以 SDK 记忆最后一次值，并在注册监听时立即补发一次。
 */
const last = { init: null, theme: null, resize: null };

window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  const data = event.data;
  if (!data || typeof data.type !== 'string') return;

  switch (data.type) {
    case 'host:init':
      last.init = data.payload;
      handlers.init.forEach((fn) => fn(data.payload));
      break;
    case 'host:reply': {
      const resolve = pending.get(data.id);
      if (resolve) {
        pending.delete(data.id);
        resolve(data.ok ? data.result : undefined);
      }
      break;
    }
    case 'host:theme':
      last.theme = data.payload.theme;
      handlers.theme.forEach((fn) => fn(data.payload.theme));
      break;
    case 'host:resize':
      last.resize = data.payload.size;
      handlers.resize.forEach((fn) => fn(data.payload.size));
      break;
    case 'host:focus':
      handlers.focus.forEach((fn) => fn());
      break;
    case 'host:tool-call':
      handlers.tool.forEach((fn) => fn(data));
      break;
  }
});

function on(list, fn) {
  list.push(fn);
  return () => {
    const i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  };
}

/** 注册时立即补发一次最近的值（插件挂载晚于消息到达的情况） */
function onWithReplay(list, fn, lastValue) {
  const off = on(list, fn);
  if (lastValue !== null && lastValue !== undefined) fn(lastValue);
  return off;
}

export const plugin = {
  /** 宿主初始化完成，拿到尺寸/主题/配置 */
  onInit: (fn) => onWithReplay(handlers.init, fn, last.init),
  onTheme: (fn) => onWithReplay(handlers.theme, fn, last.theme),
  onResize: (fn) => onWithReplay(handlers.resize, fn, last.resize),
  /** 宿主把键盘焦点交进来了 */
  onFocus: (fn) => on(handlers.focus, fn),
  /** Agent 调用本插件的工具 */
  onToolCall: (fn) => on(handlers.tool, fn),

  /** 注册自己的 Agent 工具并通知宿主就绪 */
  ready(tools = []) {
    post({ type: 'plugin:ready', payload: { pluginId: PLUGIN_ID, widgetId: '', tools } });
  },

  /** 插件内按 Esc：把焦点交还宿主 */
  exitFocus() {
    post({ type: 'plugin:focus-exit' });
  },

  /** 回传工具执行结果（配合 onToolCall） */
  toolResult(id, ok, resultOrError) {
    post(
      ok
        ? { type: 'plugin:tool-result', id, ok: true, result: resultOrError }
        : { type: 'plugin:tool-result', id, ok: false, error: String(resultOrError) },
    );
  },

  getConfig: (key) => call('getConfig', { key }),
  setConfig: (key, value) => call('setConfig', { key, value }),
  notify: (text) => call('notify', { text }),
  setKeepAwake: (on) => call('setKeepAwake', { on }),
  getIdleSeconds: () => call('getIdleSeconds', {}),
  showReminder: (params) => call('showReminder', params),
  getLocation: () => call('getLocation', {}),

  get inHost() {
    return isInHost;
  },
  pluginId: PLUGIN_ID,
};
