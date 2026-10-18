/**
 * 桌面小组件的 iframe 适配层（A5 集成）：
 * - 内部直接用插件管理器提供的 `PluginWidgetFrame`（协议收发、init/resize/theme 都在那里）；
 * - 把它接到宿主桥接层 `HostBridge`：注册 iframe 句柄（reply / focusPlugin / toolCall），
 *   插件 API 调用走 `bridge.handleApiCall`，`host:init` 的 config 用 `bridge.configSnapshot`；
 * - 对外只暴露桌面层需要的 `focusPlugin()`（宿主按 Enter 进入组件时用）。
 *
 * 旧原型插件的 `wtsl:notify` 也在这里兜住（老插件升级前仍能弹通知）。
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { getHostBridge } from '../bridge';
import type { HostBridge, PluginFrameHandle } from '../bridge';
import type { PluginCallMessage, PluginToHostMessage, ThemePayload, WidgetSize } from '../bridge/types';
import { PluginWidgetFrame } from '../plugins';
import type { PluginWidgetFrameHandle } from '../plugins';
import { useStyles } from './desktop.styles';

export interface WidgetFrameHandle {
  /** 把键盘焦点交给插件（含 iframe 的 DOM 焦点） */
  focusPlugin(): void;
}

interface WidgetFrameProps {
  bridge?: HostBridge;
  pluginId: string;
  widgetId: string;
  /** 桌面实例唯一 id（WidgetCard 传 widget.uid）；桥接层用它区分同一插件的多个实例 */
  instanceUid?: string;
  src: string;
  size: WidgetSize;
  /** FluentProvider 现读的主题 token；不传 PluginWidgetFrame 会自己从 body 读（可能读不到 provider 变量） */
  theme?: ThemePayload;
  notify(text: string): void;
}

export const WidgetFrame = forwardRef<WidgetFrameHandle, WidgetFrameProps>(function WidgetFrame(
  { bridge: bridgeProp, pluginId, widgetId, instanceUid, src, size, theme, notify },
  ref,
) {
  const styles = useStyles();
  const bridge = bridgeProp ?? getHostBridge();
  const frameRef = useRef<PluginWidgetFrameHandle>(null);
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  // host:init 的配置快照来自桥接层（持久化命名空间 plugin.<id>.<key>）
  const config = bridge.configSnapshot(pluginId);

  // 桥接层需要 iframe 句柄：回复插件请求、把焦点交给插件、替 Agent 调插件工具。
  // uid 用桌面实例 uid，同一插件的多个组件实例在 HostBridge 里不会互相覆盖；
  // isReady 让 callTool 只挑已经收到 plugin:ready 的实例。
  useEffect(() => {
    const handle: PluginFrameHandle = {
      uid: instanceUid ?? `${pluginId}:${widgetId}`,
      isReady: () => frameRef.current?.isReady() ?? false,
      reply: (id, ok, result, error) => frameRef.current?.reply(id, ok, result, error),
      focusPlugin: () => frameRef.current?.focusPlugin(),
      toolCall: (id, name, args) => frameRef.current?.toolCall(id, name, args),
    };
    return bridge.registerFrame(pluginId, handle);
  }, [bridge, pluginId, instanceUid, widgetId]);

  const handleApiCall = useCallback(
    (message: PluginCallMessage, reply: (ok: boolean, result?: unknown, error?: string) => void) => {
      void bridge.handleApiCall(pluginId, message, reply);
    },
    [bridge, pluginId],
  );

  const handleMessage = useCallback(
    (message: PluginToHostMessage) => {
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
        default: {
          const legacy = message as unknown as { type?: string; text?: unknown };
          if (legacy.type === 'wtsl:notify' && typeof legacy.text === 'string' && legacy.text) {
            notifyRef.current(legacy.text);
          }
          break;
        }
      }
    },
    [bridge],
  );

  useImperativeHandle(
    ref,
    () => ({
      focusPlugin() {
        const frame = frameRef.current;
        if (!frame) return;
        frame.contentWindow?.focus();
        frame.focusPlugin();
      },
    }),
    [],
  );

  return (
    <PluginWidgetFrame
      ref={frameRef}
      className={styles.frame}
      src={src}
      pluginId={pluginId}
      widgetId={widgetId}
      size={size}
      theme={theme}
      config={config}
      title={`${pluginId} / ${widgetId}`}
      onApiCall={handleApiCall}
      onMessage={handleMessage}
    />
  );
});
