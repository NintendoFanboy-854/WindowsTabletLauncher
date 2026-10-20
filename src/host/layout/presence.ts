/**
 * 桌面存在性（presence）与「添加到桌面」请求通道。
 *
 * 为什么单独一份：插件管理页需要知道“某个小组件现在是不是在桌面上”，但它不持有
 * 桌面层的 layout state；桌面层又常驻挂载在另一个 React 子树。这里用
 * `loadLayout()` + `useSyncExternalStore` 做一个轻量共享订阅：
 * - 桌面层每次持久化布局后调用 `notifyDesktopPresenceChanged()`；
 * - 插件管理页用 `useDesktopPresence()` 拿 `Set<pluginId:widgetId>`，状态即时刷新；
 * - 也监听 `storage`，同一浏览器的其他标签页改布局时同样能刷新。
 *
 * 添加组件请求同理走 window 自定义事件：插件管理页 `requestAddWidget(...)`，
 * 常驻的桌面层 `onAddWidgetRequest(...)` 收到后按布局纯函数插入并持久化。
 */
import { useSyncExternalStore } from 'react';
import { loadLayout } from './persist';
import { widgetKey } from './types';

/** 布局已持久化（存在性可能变化）时派发 */
const PRESENCE_EVENT = 'wtsl:desktop-presence';
/** 请求桌面层添加一个组件 */
const ADD_REQUEST_EVENT = 'wtsl:add-widget';

const EMPTY_PRESENCE: ReadonlySet<string> = new Set<string>();

let cachedPresence: ReadonlySet<string> | null = null;

/** 从持久化布局读出“当前在桌面上的组件键”；读不到（无存档 / 隐私模式）视为空 */
function readPresence(): ReadonlySet<string> {
  const layout = loadLayout();
  if (!layout || layout.widgets.length === 0) return EMPTY_PRESENCE;
  const keys = new Set<string>();
  for (const widget of layout.widgets) keys.add(widgetKey(widget.pluginId, widget.widgetId));
  return keys;
}

function presenceSnapshot(): ReadonlySet<string> {
  cachedPresence ??= readPresence();
  return cachedPresence;
}

function subscribePresence(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = () => {
    cachedPresence = null;
    onChange();
  };
  window.addEventListener(PRESENCE_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(PRESENCE_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

/**
 * 桌面层保存布局后调用（删除 / 添加 / 改尺寸 / 重置 / 插件目录变化都会触发）。
 * 必须在 saveLayout 之后调用，订阅方才能读到新存档。
 */
export function notifyDesktopPresenceChanged(): void {
  cachedPresence = null;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PRESENCE_EVENT));
}

/** 订阅桌面存在性；元素是稳定的 Set，比较用 `has()` / `size` 即可 */
export function useDesktopPresence(): ReadonlySet<string> {
  return useSyncExternalStore(subscribePresence, presenceSnapshot, () => EMPTY_PRESENCE);
}

export interface AddWidgetRequest {
  pluginId: string;
  widgetId: string;
}

/** 请求把某个小组件添加到桌面（插件管理页 → 常驻桌面层） */
export function requestAddWidget(pluginId: string, widgetId: string): void {
  if (typeof window === 'undefined') return;
  if (!pluginId || !widgetId) return;
  window.dispatchEvent(
    new CustomEvent<AddWidgetRequest>(ADD_REQUEST_EVENT, {
      detail: { pluginId, widgetId },
    }),
  );
}

/** 桌面层订阅添加请求；返回取消订阅函数（放进 useEffect 清理） */
export function onAddWidgetRequest(
  listener: (request: AddWidgetRequest) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<unknown>).detail;
    if (!detail || typeof detail !== 'object') return;
    const { pluginId, widgetId } = detail as Partial<AddWidgetRequest>;
    if (typeof pluginId !== 'string' || typeof widgetId !== 'string') return;
    if (!pluginId || !widgetId) return;
    listener({ pluginId, widgetId });
  };
  window.addEventListener(ADD_REQUEST_EVENT, handler);
  return () => window.removeEventListener(ADD_REQUEST_EVENT, handler);
}
