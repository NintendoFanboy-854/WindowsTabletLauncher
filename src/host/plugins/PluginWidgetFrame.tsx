/**
 * 一个小组件 = 一个 iframe。
 *
 * 宿主这一侧只做三件事：
 * 1. iframe 加载完成后发 `host:init`（协议、尺寸、主题、配置）；
 * 2. 尺寸 / 主题变化时发 `host:resize` / `host:theme`；
 * 3. 配置写入后发 `host:config`（跨 origin 里 storage 事件到不了插件 iframe），
 *    并把插件发来的消息按协议分发给宿主（桥接层 / 桌面层）。
 *
 * 8 个宿主 API 的 `host:reply` 由桥接层（A5）通过 `onApiCall` 注入；没注入时
 * 直接回 `ok:false`，免得插件 await 一个永远不来的响应。
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import { makeStyles } from '@fluentui/react-components';

import { PROTOCOL_VERSION } from '../bridge/types';
import type {
  CardPointerPhase,
  CardPointerType,
  HostToPluginMessage,
  PluginCallMessage,
  PluginToHostMessage,
  ThemePayload,
  WidgetSize,
} from '../bridge/types';
import { onPluginConfigChange } from '../bridge/configBus';
import { readFluentThemePayload } from './theme';
import { captureOverlaySource } from './overlayMotion';
import type { OverlaySource } from './overlayMotion';
import { PluginOverlay } from './PluginOverlay';

export type HostApiReply = (ok: boolean, result?: unknown, error?: string) => void;

export interface PluginWidgetFrameProps {
  /** iframe 地址（用 PluginManager.widgetFrameSrc / backgroundFrameSrc 生成） */
  src: string;
  pluginId: string;
  /** 后台 iframe 没有组件 id，传空字符串 */
  widgetId: string;
  /**
   * 实例 uid：同一插件多个组件实例时用来区分 iframe 句柄。
   * 不传默认 `pluginId:widgetId`（后台 iframe 为 `pluginId:background`）；
   * 桌面层建议传 `WidgetInstance.uid`。
   */
  instanceUid?: string;
  /** 当前尺寸（列跨 × 行跨），插件据此决定显示内容 */
  size: WidgetSize;
  /** 不传就读当前 FluentProvider 生效的 token */
  theme?: ThemePayload;
  /** 该插件的配置快照（桥接层负责持久化） */
  config?: Record<string, unknown>;
  /**
   * 配置快照的"现取"函数（可选）。`host:init` 只用一次，浮层 iframe 是后挂载的：
   * 如果只传 `config` prop，打开浮层时可能拿到父组件上次渲染的旧快照。
   * 传了这个函数就每次 init 时现取（桌面层传 `bridge.configSnapshot`）。
   */
  configSnapshot?: () => Record<string, unknown>;
  /** iframe 的 accessible name */
  title?: string;
  className?: string;
  style?: CSSProperties;
  /** 全部插件消息（ready / tool-result / focus-exit / call 都会先经过这里） */
  onMessage?: (message: PluginToHostMessage) => void;
  /** 插件调用宿主 API；最后一个参数是把结果写回去的 reply */
  onApiCall?: (message: PluginCallMessage, reply: HostApiReply) => void;
  /** 浮层视图 iframe 里按 Esc 时回调（由外层实例关闭浮层）；卡片实例不传 */
  onOverlayClose?: () => void;
  /**
   * 插件请求打开宿主设置页里的本插件分区（`plugin:request-host-settings`，契约 §5）。
   * 由桌面层接线到 App 导航；浮层视图里同样生效。
   */
  onRequestHostSettings?: () => void;
  /**
   * 卡片 iframe 内由 SDK 转发的指针状态（`plugin:card-pointer`，契约 §3.2）。
   * 只有桌面卡片实例需要视觉反馈；浮层视图不会发这类消息。
   */
  onCardPointer?: (phase: CardPointerPhase, pointerType: CardPointerType) => void;
  /**
   * 插件 SDK 检测到长按（`plugin:request-edit-mode`，契约 §3.2）。
   * 宿主只负责进编辑模式并聚焦该卡，不重复跑长按计时器。
   */
  onRequestEditMode?: () => void;
  /** 不可见的常驻 iframe（后台插件用） */
  hidden?: boolean;
}

export interface PluginWidgetFrameHandle {
  /** 实例 uid（`pluginId:widgetId` / `pluginId:background`），桥接层按它登记句柄 */
  readonly uid: string;
  /** 是否收到过插件的 plugin:ready（iframe 加载完成不等于插件初始化完成） */
  isReady(): boolean;
  /** 直接发一条协议消息 */
  send(message: HostToPluginMessage): void;
  resize(size: WidgetSize): void;
  updateTheme(theme: ThemePayload): void;
  /** 把键盘焦点交给插件（A5 焦点交接用） */
  focusPlugin(): void;
  /** 宿主替 Agent 调插件工具 */
  toolCall(id: string, name: string, args: unknown): void;
  /** 打开本插件的设置浮层（全窗口 Fluent Dialog，用 ?settings=1 加载同一插件页面） */
  openSettings(): void;
  /** 回插件请求（桥接层用） */
  reply(id: string, ok: boolean, result?: unknown, error?: string): void;
  /** 重载 iframe（热重载 / 崩溃兜底） */
  reload(): void;
  readonly contentWindow: Window | null;
}

const HIDDEN_FRAME_STYLE: CSSProperties = {
  position: 'fixed',
  left: -10000,
  top: 0,
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: 'none',
  border: 0,
};

const VISIBLE_FRAME_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  border: 0,
  background: 'transparent',
};

/**
 * 插件浮层视图：插件设置/详情是独立视图，宿主用 `?view=<name>` 把同一插件页面
 * 装进全窗口 Fluent Dialog。这样浮层不会被小卡片的 iframe 边界裁切
 * （DECISIONS.md D-02b；docs/PLUGIN-REACT.md「浮层视图」）。
 */
const useSettingsStyles = makeStyles({
  frame: {
    display: 'block',
    width: '100%',
    height: '100%',
    border: 0,
    background: 'transparent',
  },
});

function sameSize(a: WidgetSize, b: WidgetSize): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

const CARD_POINTER_PHASES: readonly string[] = [
  'down',
  'up',
  'cancel',
  'hover-enter',
  'hover-leave',
];
const CARD_POINTER_TYPES: readonly string[] = ['touch', 'pen', 'mouse'];

function isCardPointerPhase(value: unknown): value is CardPointerPhase {
  return typeof value === 'string' && CARD_POINTER_PHASES.includes(value);
}

function isCardPointerType(value: unknown): value is CardPointerType {
  return typeof value === 'string' && CARD_POINTER_TYPES.includes(value);
}

export const PluginWidgetFrame = forwardRef<PluginWidgetFrameHandle, PluginWidgetFrameProps>(
  function PluginWidgetFrame(props, ref) {
    const {
      src,
      pluginId,
      widgetId,
      instanceUid,
      size,
      theme,
      config,
      configSnapshot,
      title,
      className,
      style,
      onMessage,
      onApiCall,
      onOverlayClose,
      onRequestHostSettings,
      onCardPointer,
      onRequestEditMode,
      hidden = false,
    } = props;

    /** 实例句柄的 key：同一插件多实例靠它区分（后台 iframe 用 pluginId:background） */
    const frameUid =
      instanceUid?.trim() || (widgetId ? `${pluginId}:${widgetId}` : `${pluginId}:background`);

    const settingsStyles = useSettingsStyles();
    const frameRef = useRef<HTMLIFrameElement>(null);
    const [loadedAt, setLoadedAt] = useState(0);
    /**
     * 插件请求的全窗口浮层视图：`{ view, title, source }`。
     * `source` 是请求那一刻的卡片快照（rect + 节点 + 窗口尺寸），container transform
     * 的起点和“关闭后焦点回哪张卡片”都用它（MOTION §4）。
     */
    const [overlay, setOverlay] = useState(
      null as null | { view: string; title: string; source: OverlaySource },
    );
    const readyRef = useRef(false);
    const lastSize = useRef<WidgetSize | null>(null);
    const lastTheme = useRef<ThemePayload | undefined>(theme);
    /** 浮层关闭后把焦点还给来源卡片（卸载后再聚焦，见下面的 effect） */
    const overlaySourceRef = useRef<OverlaySource | null>(null);
    const hadOverlayRef = useRef(false);

    const openOverlay = useCallback((view?: unknown, overlayTitle?: unknown) => {
      const viewName = typeof view === 'string' && view.trim() ? view.trim() : 'settings';
      // 卡片 rect 在“请求浮层”这一刻量：此时卡片一定还在原位，动画起点才准
      const source = captureOverlaySource(frameRef.current);
      overlaySourceRef.current = source;
      setOverlay({
        view: viewName,
        title: typeof overlayTitle === 'string' && overlayTitle.trim() ? overlayTitle.trim() : '设置',
        source,
      });
    }, []);

    /** 浮层卸载：清状态 + 焦点还给来源卡片（MOTION §4「关闭后焦点回到原卡片」） */
    const handleOverlayClosed = useCallback(() => {
      setOverlay(null);
    }, []);

    useEffect(() => {
      if (overlay) {
        hadOverlayRef.current = true;
        return;
      }
      if (!hadOverlayRef.current) return;
      hadOverlayRef.current = false;
      const element = overlaySourceRef.current?.element ?? null;
      overlaySourceRef.current = null;
      // 等浮层 DOM 真正卸载后再聚焦：聚焦会触发卡片的 onFocus，桌面层据此更新 focusedUid
      if (element?.isConnected) element.focus({ preventScroll: true });
    }, [overlay]);

    // 浮层视图的地址：同一插件页面加 `?view=<view>`（D-02b）
    const overlaySrc = useMemo(() => {
      if (!overlay) return null;
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}view=${encodeURIComponent(overlay.view)}`;
    }, [overlay, src]);

    // init 要拿“加载那一刻”的最新 props，用 ref 避免把 init 绑死到首次渲染
    const latest = useRef({ pluginId, widgetId, size, theme, config, configSnapshot });
    latest.current = { pluginId, widgetId, size, theme, config, configSnapshot };

    const post = useCallback((message: HostToPluginMessage) => {
      frameRef.current?.contentWindow?.postMessage(message, '*');
    }, []);

    // 每次 iframe 加载完都重新 init（热重载 / 换 src 后同样需要）。
    // 插件 React 可能先于 init 挂载（iframe 的 load 事件晚于其脚本执行），首帧只能拿
    // 默认尺寸/主题；所以 init 后紧跟一条权威 resize/theme，SDK 会在插件注册监听时
    // 重放，保证 reload 后插件收敛到用户保存的尺寸档位与当前主题（P1 回归）。
    useEffect(() => {
      if (!loadedAt) return;
      const current = latest.current;
      const nextTheme = current.theme ?? readFluentThemePayload();
      const nextSize: WidgetSize = [current.size[0], current.size[1]];
      post({
        v: PROTOCOL_VERSION,
        type: 'host:init',
        payload: {
          pluginId: current.pluginId,
          widgetId: current.widgetId,
          size: current.size,
          theme: nextTheme,
          // 现取快照：浮层 iframe 后挂载时不能读到父组件渲染时缓存下来的旧配置
          config: current.configSnapshot?.() ?? current.config ?? {},
        },
      });
      lastSize.current = nextSize;
      lastTheme.current = nextTheme;
      post({ type: 'host:resize', payload: { size: nextSize } });
      post({ type: 'host:theme', payload: { theme: nextTheme } });
      // 只依赖 loadedAt：尺寸/主题的后续变化走 resize / theme 消息
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadedAt, post]);

    // 尺寸变化：init 已带当前尺寸，首帧之后的变化才补 host:resize
    useEffect(() => {
      if (!loadedAt) return;
      const previous = lastSize.current;
      if (previous && sameSize(previous, size)) return;
      lastSize.current = [size[0], size[1]];
      if (!previous) return;
      post({ type: 'host:resize', payload: { size: [size[0], size[1]] } });
    }, [loadedAt, size, post]);

    // 主题变化
    useEffect(() => {
      if (!loadedAt || !theme) return;
      if (lastTheme.current === theme) return;
      lastTheme.current = theme;
      post({ type: 'host:theme', payload: { theme } });
    }, [loadedAt, theme, post]);

    // 配置写入 → 推给本 iframe。
    // 不能依赖 storage 事件：Tauri 里宿主页（tauri.localhost）与插件 iframe
    // （wtsl.localhost）不同 origin，宿主写 localStorage 不会向 iframe 派发事件。
    // 每个实例（卡片 / 详情浮层 / 后台）各订阅一份，各自转给自己的 contentWindow；
    // iframe 尚未加载完成时消息会丢，加载后的 host:init 快照会补上最新值。
    useEffect(() => {
      return onPluginConfigChange((changedPluginId, key, value) => {
        if (changedPluginId !== pluginId) return;
        post({ v: PROTOCOL_VERSION, type: 'host:config', payload: { key, value } });
      });
    }, [pluginId, post]);

    // 插件 → 宿主
    useEffect(() => {
      const onWindowMessage = (event: MessageEvent) => {
        if (event.source !== frameRef.current?.contentWindow) return;
        const data = event.data as PluginToHostMessage | null | undefined;
        if (!data || typeof data !== 'object' || typeof data.type !== 'string') return;
        const rawType = (data as { type: string }).type;

        // 浮层视图 iframe 里按 Esc：交回外层实例关闭浮层（焦点在 iframe 内时宿主收不到 Esc）
        if (rawType === 'plugin:request-overlay-close') {
          onOverlayClose?.();
          return;
        }
        // 插件 → 宿主设置：任意视图都能请求，由 App 选中本插件分区（契约 §5）。
        // 若消息来自浮层视图，必须先收起浮层再导航：契约 §4.1 的「设置…」是跨页导航，
        // Fluent Dialog 的 modal Portal 挂在桌面层外面，不关会一直挡住设置页。
        if (rawType === 'plugin:request-host-settings') {
          onOverlayClose?.();
          onRequestHostSettings?.();
          return;
        }
        // 卡片手势：SDK 只在卡片视图转发（契约 §3.2）。浮层实例不会收到这类消息，
        // 这里只把合法状态交给桌面层的卡片视觉/编辑入口。
        if (rawType === 'plugin:card-pointer') {
          const { phase, pointerType } = data as unknown as {
            phase?: unknown;
            pointerType?: unknown;
          };
          if (isCardPointerPhase(phase) && isCardPointerType(pointerType)) {
            onCardPointer?.(phase, pointerType);
          }
          return;
        }
        // 长按检测在 SDK；宿主只负责进编辑/聚焦，不重复跑计时器。
        if (rawType === 'plugin:request-edit-mode') {
          onRequestEditMode?.();
          return;
        }
        // 插件请求全窗口浮层视图（D-02b：设置/详情是独立视图，宿主用 ?view=... 加载）
        if (rawType === 'plugin:request-overlay') {
          const payload = (data as unknown as { payload?: { view?: unknown; title?: unknown } }).payload;
          openOverlay(payload?.view, payload?.title);
          return;
        }
        // 兼容旧协议：只请求设置浮层
        if (rawType === 'plugin:request-settings') {
          openOverlay('settings', '设置');
          return;
        }

        if (data.type === 'plugin:ready') {
          readyRef.current = true;
          // 插件可能比主题状态更晚完成初始化：就绪时补发一次当前主题，避免停在回退主题
          const currentTheme = latest.current.theme;
          if (currentTheme) post({ type: 'host:theme', payload: { theme: currentTheme } });
        }
        onMessage?.(data);
        if (data.type !== 'plugin:call') return;

        const reply: HostApiReply = (ok, result, error) => {
          post({ type: 'host:reply', id: data.id, ok, result, error });
        };
        if (onApiCall) {
          try {
            onApiCall(data, reply);
          } catch (error) {
            reply(false, undefined, error instanceof Error ? error.message : String(error));
          }
        } else {
          reply(false, undefined, '宿主桥接层尚未接入');
        }
      };
      window.addEventListener('message', onWindowMessage);
      return () => window.removeEventListener('message', onWindowMessage);
    }, [
      onMessage,
      onApiCall,
      onOverlayClose,
      onRequestHostSettings,
      onCardPointer,
      onRequestEditMode,
      openOverlay,
      post,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        uid: frameUid,
        isReady: () => readyRef.current,
        send: post,
        resize: (nextSize) => post({ type: 'host:resize', payload: { size: nextSize } }),
        updateTheme: (nextTheme) => post({ type: 'host:theme', payload: { theme: nextTheme } }),
        focusPlugin: () => post({ type: 'host:focus' }),
        toolCall: (id, name, args) => post({ type: 'host:tool-call', id, name, args }),
        openSettings: () => openOverlay('settings', '设置'),
        reply: (id, ok, result, error) => post({ type: 'host:reply', id, ok, result, error }),
        reload: () => {
          const frame = frameRef.current;
          if (frame) frame.src = frame.src;
        },
        get contentWindow() {
          return frameRef.current?.contentWindow ?? null;
        },
      }),
      [post, frameUid, openOverlay],
    );

    return (
      <>
        <iframe
          ref={frameRef}
          src={src}
          title={title ?? `${pluginId}/${widgetId}`}
          className={className}
          style={{ ...(hidden ? HIDDEN_FRAME_STYLE : VISIBLE_FRAME_STYLE), ...style }}
          allow="autoplay; clipboard-write; fullscreen"
          tabIndex={hidden ? -1 : undefined}
          aria-hidden={hidden || undefined}
          onLoad={() => {
            lastSize.current = null;
            readyRef.current = false;
            setLoadedAt((value) => value + 1);
          }}
        />
        {overlay && overlaySrc && (
          <PluginOverlay
            key={overlay.view}
            source={overlay.source}
            ariaLabel={`${title ?? pluginId} ${overlay.title}`}
            title={title ? `${title} · ${overlay.title}` : overlay.title}
            onClosed={handleOverlayClosed}
          >
            {(close) => (
              /* 浮层视图不会发卡片手势（SDK 在 ?view=... 下不挂 hook），
                 不接 onCardPointer / onRequestEditMode，避免浮层误把宿主带进编辑模式 */
              <PluginWidgetFrameRecursive
                src={overlaySrc}
                pluginId={pluginId}
                widgetId={widgetId}
                instanceUid={`${frameUid}:overlay:${overlay.view}`}
                size={size}
                theme={theme}
                config={config}
                configSnapshot={configSnapshot}
                title={`${title ?? pluginId} ${overlay.title}`}
                className={settingsStyles.frame}
                onApiCall={onApiCall}
                onOverlayClose={close}
                onRequestHostSettings={() => {
                  // 浮层内「设置…」= 跨页导航：先收起浮层（走同一套收回动画）再跳设置页
                  close();
                  onRequestHostSettings?.();
                }}
              />
            )}
          </PluginOverlay>
        )}
      </>
    );
  },
);

/**
 * 自引用别名：浮层视图里要再渲染一个本组件（?view=... 的同一插件页面）。
 * 放在组件定义之后，运行时已初始化，避免循环引用问题。
 */
const PluginWidgetFrameRecursive = PluginWidgetFrame;
