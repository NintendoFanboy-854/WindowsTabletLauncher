/**
 * 插件配置变更的宿主内事件总线（不依赖 React、不依赖 DOM）。
 *
 * 为什么需要它：Tauri 打包版里宿主页和插件 iframe 是**两个 origin**
 * （宿主 `http://tauri.localhost`，插件 `http://wtsl.localhost`，见
 * `src-tauri/src/protocol.rs`）。`HostBridge.setConfig` 写的是宿主文档的
 * localStorage，`storage` 事件只派发给同一存储区里的**其它同源文档**，
 * 插件 iframe 永远收不到 —— 实测后果是 `host:init` 之后任何配置变更
 * （天气自动定位结果 / 城市列表 / 设置项…）都同步不到已挂载的 widget，
 * 必须重启（iframe 重载后重新吃 init 快照）才恢复。
 *
 * 因此配置写入必须由宿主主动 push：`HostBridge.setConfig` 写完 localStorage 后
 * `emitPluginConfigChange()`；每个 `PluginWidgetFrame` 按 pluginId 订阅，收到后
 * 向自己的 iframe 发 `host:config`（卡片 / 详情浮层 / 后台 iframe 各自一份实例，
 * 都能收到）。
 *
 * dev 浏览器模式（HTTP 插件源）下宿主与 iframe 同源，旧的 `storage` 事件仍然会
 * 派发；插件侧的 `useStoredConfig` 保留 storage 监听作为兼容兜底，但正确性不再
 * 依赖它。
 */

/** 订阅者：`(pluginId, key, value)` */
export type PluginConfigListener = (pluginId: string, key: string, value: unknown) => void;

const listeners = new Set<PluginConfigListener>();

/** 订阅配置变更；返回取消订阅函数 */
export function onPluginConfigChange(listener: PluginConfigListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 广播一次配置写入（由 HostBridge.setConfig 调用） */
export function emitPluginConfigChange(pluginId: string, key: string, value: unknown): void {
  if (!pluginId || !key) return;
  for (const listener of [...listeners]) {
    try {
      listener(pluginId, key, value);
    } catch (error) {
      console.warn('[plugins] 配置变更监听器失败', error);
    }
  }
}
