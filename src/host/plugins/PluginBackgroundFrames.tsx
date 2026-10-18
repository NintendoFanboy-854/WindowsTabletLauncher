/**
 * 后台插件（manifest.background === true）的常驻隐藏 iframe。
 *
 * 位置固定、1×1、opacity 0 而不是 `display:none`：display:none 的 iframe
 * 在 Chromium 里会被当成不可见内容做定时器节流，提醒/计时会漂；1px 的
 * “可见但看不见” iframe 才能让插件的定时器按正常节奏跑。
 */

import type { PluginCallMessage, PluginToHostMessage, ThemePayload } from '../bridge/types';
import type { HostApiReply } from './PluginWidgetFrame';
import { PluginWidgetFrame } from './PluginWidgetFrame';

export interface BackgroundFrame {
  pluginId: string;
  /** 用 PluginManager.backgroundFrameSrc(pluginId) 生成 */
  src: string;
}

export interface PluginBackgroundFramesProps {
  frames: BackgroundFrame[];
  theme?: ThemePayload;
  onMessage?: (message: PluginToHostMessage) => void;
  onApiCall?: (message: PluginCallMessage, reply: HostApiReply) => void;
}

export function PluginBackgroundFrames({
  frames,
  theme,
  onMessage,
  onApiCall,
}: PluginBackgroundFramesProps) {
  return (
    <>
      {frames.map((frame) => (
        <PluginWidgetFrame
          key={frame.pluginId}
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
      ))}
    </>
  );
}
