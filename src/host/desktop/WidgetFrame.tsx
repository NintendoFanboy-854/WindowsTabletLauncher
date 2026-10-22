/**
 * 桌面小组件的 iframe 适配层（A5 集成）：
 * - 内部直接用插件管理器提供的 `PluginWidgetFrame`（协议收发、init/resize/theme 都在那里）；
 * - 把它接到宿主桥接层 `HostBridge`：注册 iframe 句柄（reply / focusPlugin / toolCall），
 *   插件 API 调用走 `bridge.handleApiCall`，`host:init` 的 config 用 `bridge.configSnapshot`；
 * - 对外暴露桌面层需要的能力：focusPlugin()（Enter 进组件）。
 *
 * 旧原型插件的 `wtsl:notify` 也在这里兜住（老插件升级前仍能弹通知）。
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { getHostBridge } from '../bridge';
import type { HostBridge, PluginFrameHandle } from '../bridge';
import type {
  CardPointerPhase,
  CardPointerType,
  PluginCallMessage,
  PluginToHostMessage,
  ThemePayload,
  WidgetSize,
} from '../bridge/types';
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
  /** 实例标题（组件标题，用于 iframe/设置浮层标题） */
  title?: string;
  /** 桌面实例唯一 id（WidgetCard 传 widget.uid）；桥接层用它区分同一插件的多个实例 */
  instanceUid?: string;
  src: string;
  size: WidgetSize;
  /** FluentProvider 现读的主题 token；不传 PluginWidgetFrame 会自己从 body 读（可能读不到 provider 变量） */
  theme?: ThemePayload;
  notify(text: string): void;
  /** 插件请求打开宿主设置页的本插件分区（plugin:request-host-settings） */
  onRequestHostSettings?: () => void;
  /** iframe 内转发出来的卡片按压/hover 状态（plugin:card-pointer，契约 §3.2） */
  onCardPointer?: (phase: CardPointerPhase, pointerType: CardPointerType) => void;
  /** SDK 检测到卡片长按（plugin:request-edit-mode），宿主进编辑并聚焦 */
  onRequestEditMode?: () => void;
}

export const WidgetFrame = forwardRef<WidgetFrameHandle, WidgetFrameProps>(function WidgetFrame(
  {
    bridge: bridgeProp,
    pluginId,
    widgetId,
    title,
    instanceUid,
    src,
    size,
    theme,
    notify,
    onRequestHostSettings,
    onCardPointer,
    onRequestEditMode,
  },
  ref,
) {
  const styles = useStyles();
  const bridge = bridgeProp ?? getHostBridge();
  const frameRef = useRef<PluginWidgetFrameHandle>(null);
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  // host:init 的配置快照来自桥接层（持久化命名空间 plugin.<id>.<key>）。
  // configSnapshot 供后挂载的浮层 iframe 现取最新快照；config 保留给首帧渲染。
  const config = bridge.configSnapshot(pluginId);
  const readConfig = useCallback(() => bridge.configSnapshot(pluginId), [bridge, pluginId]);

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
      configSnapshot={readConfig}
      title={title ?? `${pluginId} / ${widgetId}`}
      onApiCall={handleApiCall}
      onMessage={handleMessage}
      onRequestHostSettings={onRequestHostSettings}
      onCardPointer={onCardPointer}
      onRequestEditMode={onRequestEditMode}
    />
  );
});
