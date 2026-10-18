/**
 * 后台插件（manifest.background === true）的常驻隐藏 iframe。
 *
 * 位置固定、1×1、opacity 0 而不是 `display:none`：display:none 的 iframe
 * 在 Chromium 里会被当成不可见内容做定时器节流，提醒/计时会漂；1px 的
 * “可见但看不见” iframe 才能让插件的定时器按正常节奏跑。
 *
 * 句柄：每个后台 iframe 的 `PluginWidgetFrameHandle`（reply / toolCall /
 * focusPlugin / uid / isReady）通过 `onFrameHandle` 向外暴露、forwardRef 也能取；
 * 传了 `bridge` 就自动注册进 HostBridge（uid = `pluginId:background`），这样
 * Agent 调后台插件（todo.stats / sedentary.status）时 tool-result 有地方接收。
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

import type { HostBridge } from '../bridge';
import type { PluginCallMessage, PluginToHostMessage, ThemePayload } from '../bridge/types';
import type { HostApiReply, PluginWidgetFrameHandle } from './PluginWidgetFrame';
import { PluginWidgetFrame } from './PluginWidgetFrame';

export interface BackgroundFrame {
  pluginId: string;
  /** 用 PluginManager.backgroundFrameSrc(pluginId) 生成 */
  src: string;
}

/** 后台 iframe 句柄集合（按插件 id 取） */
export interface PluginBackgroundFramesHandle {
  getHandle(pluginId: string): PluginWidgetFrameHandle | null;
  listHandles(): Map<string, PluginWidgetFrameHandle>;
}

export interface PluginBackgroundFramesProps {
  frames: BackgroundFrame[];
  theme?: ThemePayload;
  onMessage?: (message: PluginToHostMessage) => void;
  onApiCall?: (message: PluginCallMessage, reply: HostApiReply) => void;
  /**
   * 传了就把每个后台 iframe 的句柄注册进桥接层。
   * Desktop 的 BackgroundFrames 传自己的 bridge 实例即可（App 里是全局单例）。
   */
  bridge?: HostBridge;
  /** 宿主也可以自己接收句柄做注册（不想让组件持有 HostBridge 时用） */
  onFrameHandle?: (pluginId: string, handle: PluginWidgetFrameHandle | null) => void;
}

interface BackgroundFrameItemProps {
  frame: BackgroundFrame;
  theme?: ThemePayload;
  onMessage?: (message: PluginToHostMessage) => void;
  onApiCall?: (message: PluginCallMessage, reply: HostApiReply) => void;
  bridge?: HostBridge;
  onFrameHandle?: (pluginId: string, handle: PluginWidgetFrameHandle | null) => void;
  onHandle: (pluginId: string, handle: PluginWidgetFrameHandle | null) => void;
}

function BackgroundFrameItem({
  frame,
  theme,
  onMessage,
  onApiCall,
  bridge,
  onFrameHandle,
  onHandle,
}: BackgroundFrameItemProps) {
  const frameRef = useRef<PluginWidgetFrameHandle>(null);
  const onFrameHandleRef = useRef(onFrameHandle);
  onFrameHandleRef.current = onFrameHandle;

  useEffect(() => {
    const handle = frameRef.current;
    if (!handle) return;
    onHandle(frame.pluginId, handle);
    // 后台 iframe 的 uid 是 `pluginId:background`，与组件实例的句柄共存不覆盖
    const unregister = bridge?.registerFrame(frame.pluginId, handle);
    onFrameHandleRef.current?.(frame.pluginId, handle);
    return () => {
      unregister?.();
      onFrameHandleRef.current?.(frame.pluginId, null);
      onHandle(frame.pluginId, null);
    };
  }, [bridge, frame.pluginId, onHandle]);

  return (
    <PluginWidgetFrame
      ref={frameRef}
      src={frame.src}
      pluginId={frame.pluginId}
      widgetId=""
      size={[1, 1]}
      theme={theme}
      hidden
      title={`${frame.pluginId} (background)`}
      onMessage={onMessage}
      onApiCall={onApiCall}
    />
  );
}

export const PluginBackgroundFrames = forwardRef<
  PluginBackgroundFramesHandle,
  PluginBackgroundFramesProps
>(function PluginBackgroundFrames({ frames, theme, onMessage, onApiCall, bridge, onFrameHandle }, ref) {
  const handlesRef = useRef(new Map<string, PluginWidgetFrameHandle>());

  const onHandle = useCallback((pluginId: string, handle: PluginWidgetFrameHandle | null) => {
    if (handle) handlesRef.current.set(pluginId, handle);
    else handlesRef.current.delete(pluginId);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getHandle: (pluginId: string) => handlesRef.current.get(pluginId) ?? null,
      listHandles: () => new Map(handlesRef.current),
    }),
    [],
  );

  return (
    <>
      {frames.map((frame) => (
        <BackgroundFrameItem
          key={frame.pluginId}
          frame={frame}
          theme={theme}
          onMessage={onMessage}
          onApiCall={onApiCall}
          bridge={bridge}
          onFrameHandle={onFrameHandle}
          onHandle={onHandle}
        />
      ))}
    </>
  );
});
