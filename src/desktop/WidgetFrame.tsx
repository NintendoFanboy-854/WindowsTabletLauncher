import { useEffect, useRef } from 'react';

interface Props {
  pluginId: string;
  widgetId: string;
  onNotify: (text: string) => void;
}

/** 小组件的内容：一个 iframe，宿主只负责初始化和收消息 */
export default function WidgetFrame({ pluginId, widgetId, onNotify }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== ref.current?.contentWindow) return;
      const data = event.data as { type?: string; text?: string };
      if (data?.type === 'wtsl:notify' && typeof data.text === 'string') {
        onNotify(data.text);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onNotify]);

  const sendInit = () => {
    ref.current?.contentWindow?.postMessage(
      {
        type: 'wtsl:init',
        pluginId,
        widgetId,
        theme: {
          background: 'rgba(28, 28, 30, 0.55)',
          foreground: '#f3f3f3',
          muted: 'rgba(243, 243, 243, 0.6)',
          accent: '#7cb3ff',
        },
      },
      '*',
    );
  };

  return (
    <iframe
      ref={ref}
      className="widget-frame"
      title={`${pluginId} / ${widgetId}`}
      src={`/plugins/${pluginId}/index.html?widget=${encodeURIComponent(widgetId)}`}
      onLoad={sendInit}
    />
  );
}
