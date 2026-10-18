/**
 * background:true 插件的常驻隐藏 iframe 挂载（A5 集成）。
 *
 * 用插件管理器的 `PluginBackgroundFrames` 每个插件挂一个实例：它的 onApiCall 回调
 * 不携带 pluginId，所以按插件拆成多个实例，才能把调用路由到正确的
 * `HostBridge.handleApiCall(pluginId, ...)`（配置命名空间是按插件隔离的）。
 */
import type { HostBridge } from '../bridge';
import type { PluginCallMessage, PluginToHostMessage, ThemePayload } from '../bridge/types';
import { PluginBackgroundFrames } from '../plugins';
import type { NormalizedPlugin, PluginManager } from '../plugins';

interface BackgroundFramesProps {
  plugins: NormalizedPlugin[];
  manager: PluginManager;
  bridge: HostBridge;
  theme?: ThemePayload;
}

export function BackgroundFrames({ plugins, manager, bridge, theme }: BackgroundFramesProps) {
  if (plugins.length === 0) return null;

  return (
    <>
      {plugins.map((plugin) => {
        let src: string;
        try {
          src = manager.backgroundFrameSrc(plugin.id);
        } catch {
          return null;
        }
        const onApiCall = (
          message: PluginCallMessage,
          reply: (ok: boolean, result?: unknown, error?: string) => void,
        ) => {
          void bridge.handleApiCall(plugin.id, message, reply);
        };
        const onMessage = (message: PluginToHostMessage) => {
          switch (message.type) {
            case 'plugin:ready':
              bridge.handleReady(message);
              break;
            case 'plugin:tool-result':
              bridge.handleToolResult(message);
              break;
            case 'plugin:focus-exit':
              bridge.handleFocusExit(message);
              break;
            default:
              break;
          }
        };
        return (
          <PluginBackgroundFrames
            key={plugin.id}
            frames={[{ pluginId: plugin.id, src }]}
            theme={theme}
            bridge={bridge}
            onApiCall={onApiCall}
            onMessage={onMessage}
          />
        );
      })}
    </>
  );
}
