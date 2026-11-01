/**
 * 一个小组件 = 一个 iframe。
 *
 * 宿主这一侧只做三件事：
 * 1. iframe 加载完成后发 `host:init`（协议、尺寸、主题、配置）；
 * 2. 尺寸 / 主题变化时发 `host:resize` / `host:theme`；
 * 3. 配置写入后发 `host:config`（跨 origin 里 storage 事件到不了插件 iframe），
 *    并把插件发来的消息按协议分发给宿主（桥接层 / 桌面层）。
 *
 * 宿主 API 的 `host:reply` 由桥接层（A5）通过 `onApiCall` 注入；没注入时
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

import {
  SkeletonItem,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';

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

/** 插件浮层尺寸（P3b）：非法输入一律按 default 处理，插件不能传任意几何 */
export type OverlaySize = 'default' | 'large';

function normalizeOverlaySize(value: unknown): OverlaySize {
  return value === 'large' ? 'large' : 'default';
}

/**
 * 加载占位的出现阈值（FLUENT2 §12：<1s 不显示任何加载动画；1–3s 才需要状态提示）。
 * 它不是超时：插件 `plugin:ready` 之前占位一直保留，只是前 1s 不显示，避免闪一下。
 */
const LOADING_PLACEHOLDER_DELAY_MS = 1000;

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

/**
 * 后台 iframe（`background:true`，1×1、离屏、opacity 0）。
 *
 * `visibility: hidden` 不是纯装饰：`tabindex=-1` 只把元素移出 Tab 序，但桌面从
 * body 起按第一下 Tab 时 Chromium 仍会进入第一个 iframe（P1-6 复现：焦点落进
 * 离屏 1×1 后“消失”一次）。visibility:hidden 让 iframe 内容不可聚焦，第一下 Tab
 * 直接落到第一张卡片；它只影响绘制/命中，不影响插件定时器（提醒/计时仍照常跑）。
 */
const HIDDEN_FRAME_STYLE: CSSProperties = {
  position: 'fixed',
  left: -10000,
  top: 0,
  width: 1,
  height: 1,
  opacity: 0,
  visibility: 'hidden',
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

/**
 * 可见 iframe 的宿主壳：只为加载占位提供定位上下文，宽高都交给 iframe 原本的 100% 语义
 * （卡片的 contentLayer 与浮层的 DialogContent 都是 100% 高）。后台 iframe 不进这层。
 */
const useFrameStyles = makeStyles({
  frameHost: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
  },
  /**
   * 加载占位（P0-1）：卡片材质已由宿主 Card 画好，这里只补骨架，不画底色、不挡指针。
   * 用 Skeleton 而不是 Spinner：桌面同时加载多张卡时会出现多个 spinner（FLUENT2 §12 禁止）。
   */
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    pointerEvents: 'none',
  },
  loadingSkeleton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    /** 条宽的百分比要相对卡片宽度算，这里必须是整宽而不是 shrink-to-fit */
    width: '100%',
  },
  /** 尺寸由外层给：SkeletonItem 的 size 档放不下任意宽度，这里用 100% 填满 */
  loadingBarWide: {
    width: 'min(160px, 56%)',
    height: tokens.spacingVerticalL,
  },
  loadingBarNarrow: {
    width: 'min(96px, 34%)',
    height: tokens.spacingVerticalM,
  },
  loadingLabel: {
    color: tokens.colorNeutralForeground3,
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
    const frameStyles = useFrameStyles();
    const frameRef = useRef<HTMLIFrameElement>(null);
    const [loadedAt, setLoadedAt] = useState(0);
    /**
     * 插件请求的全窗口浮层视图：`{ view, title, size, source }`。
     * `source` 是请求那一刻的卡片快照（rect + 节点 + 窗口尺寸），container transform
     * 的起点和“关闭后焦点回哪张卡片”都用它（MOTION §4）。
     */
    const [overlay, setOverlay] = useState(
      null as null | {
        view: string;
        title: string;
        size: OverlaySize;
        source: OverlaySource;
      },
    );
    const readyRef = useRef(false);
    /** 是否收到过 `plugin:ready`（iframe load ≠ 插件初始化完成） */
    const [ready, setReady] = useState(false);
    /** 超过阈值仍未就绪才显示骨架；后台 iframe 永不显示 */
    const [loadingVisible, setLoadingVisible] = useState(false);
    /**
     * 真实文档是否已可显示：`load` 完成或插件已 `ready`（ready 先到也先显示，
     * 不让图片等子资源把 `load` 拖住）。在此之前 iframe 的初始 about:blank 是白底，必须遮住。
     */
    const frameVisible = loadedAt > 0 || ready;
    const lastSize = useRef<WidgetSize | null>(null);
    const lastTheme = useRef<ThemePayload | undefined>(theme);
    /** 浮层关闭后把焦点还给来源卡片（卸载后再聚焦，见下面的 effect） */
    const overlaySourceRef = useRef<OverlaySource | null>(null);
    const hadOverlayRef = useRef(false);

    const openOverlay = useCallback(
      (view?: unknown, overlayTitle?: unknown, overlaySize?: unknown) => {
        const viewName = typeof view === 'string' && view.trim() ? view.trim() : 'settings';
        // 卡片 rect 在“请求浮层”这一刻量：此时卡片一定还在原位，动画起点才准
        const source = captureOverlaySource(frameRef.current);
        overlaySourceRef.current = source;
        setOverlay({
          view: viewName,
          title:
            typeof overlayTitle === 'string' && overlayTitle.trim()
              ? overlayTitle.trim()
              : '设置',
          // payload 里的 size 是外部输入：只认 large，其余（含拼错/missing）都按 default。
          size: normalizeOverlaySize(overlaySize),
          source,
        });
      },
      [],
    );

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

    /**
     * 加载骨架：1s 阈值后才显示（FLUENT2 §12），文档 load / 插件 ready 一到立即撤掉。
     * `loadedAt` 进依赖：重新 load 后计时重来；保持“不闪烁”的 <1s 静默。
     */
    useEffect(() => {
      if (hidden || frameVisible) {
        setLoadingVisible(false);
        return;
      }
      const timer = window.setTimeout(() => setLoadingVisible(true), LOADING_PLACEHOLDER_DELAY_MS);
      return () => window.clearTimeout(timer);
    }, [hidden, frameVisible, loadedAt]);

    /**
     * 换 src = 换了一个文档，重新进入未就绪态。
     * 不在 iframe onLoad 里重置：`plugin:ready` 可能先于 load 到达，按 load 重置会误判未就绪。
     */
    const prevSrcRef = useRef(src);
    useEffect(() => {
      if (prevSrcRef.current === src) return;
      prevSrcRef.current = src;
      readyRef.current = false;
      setReady(false);
    }, [src]);

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
          const payload = (
            data as unknown as {
              payload?: { view?: unknown; title?: unknown; size?: unknown };
            }
          ).payload;
          openOverlay(payload?.view, payload?.title, payload?.size);
          return;
        }
        // 兼容旧协议：只请求设置浮层
        if (rawType === 'plugin:request-settings') {
          openOverlay('settings', '设置');
          return;
        }

        if (data.type === 'plugin:ready') {
          readyRef.current = true;
          setReady(true);
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
          // 手动重载 = 换了个文档：先回到未就绪态，加载骨架的 1s 阈值重新计
          readyRef.current = false;
          setReady(false);
          const frame = frameRef.current;
          if (frame) frame.src = frame.src;
        },
        get contentWindow() {
          return frameRef.current?.contentWindow ?? null;
        },
      }),
      [post, frameUid, openOverlay],
    );

    const frameNode = (
      <iframe
        ref={frameRef}
        src={src}
        // 用 aria-label 提供可访问名称；不要用 title，否则 WebView 会在指针停留时
        // 弹出覆盖卡片内容的原生 tooltip（实机被误读成第二个 tab）。
        aria-label={title ?? `${pluginId}/${widgetId}`}
        className={className}
        allow="autoplay; clipboard-write; fullscreen"
        tabIndex={hidden ? -1 : undefined}
        aria-hidden={hidden || undefined}
        style={{
          ...(hidden ? HIDDEN_FRAME_STYLE : VISIBLE_FRAME_STYLE),
          // 首帧遮罩（P0-1）：真实文档提交前，iframe 的初始 about:blank 是白底；
          // 先 opacity 0 挡住，等 load / ready 再显示，白闪在整个启动路径上消失。
          ...(hidden || frameVisible ? {} : { opacity: 0, pointerEvents: 'none' as const }),
          ...style,
        }}
        onLoad={() => {
          lastSize.current = null;
          setLoadedAt((value) => value + 1);
        }}
      />
    );

    return (
      <>
        {/* 后台 iframe 保持原样（1×1、离屏、无占位）；可见 iframe 加一层定位壳放加载骨架 */}
        {hidden ? (
          frameNode
        ) : (
          <div
            className={frameStyles.frameHost}
            data-plugin-frame-host="true"
            data-plugin-frame-ready={ready ? 'true' : 'false'}
          >
            {frameNode}
            {loadingVisible ? (
              <div
                className={frameStyles.loadingOverlay}
                data-plugin-frame-loading="true"
                aria-hidden="true"
              >
                <div className={frameStyles.loadingSkeleton}>
                  <div className={frameStyles.loadingBarWide}>
                    <SkeletonItem
                      shape="rectangle"
                      appearance="translucent"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: tokens.borderRadiusMedium,
                      }}
                    />
                  </div>
                  <div className={frameStyles.loadingBarNarrow}>
                    <SkeletonItem
                      shape="rectangle"
                      appearance="translucent"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: tokens.borderRadiusMedium,
                      }}
                    />
                  </div>
                </div>
                <Text size={200} className={frameStyles.loadingLabel}>
                  正在加载…
                </Text>
              </div>
            ) : null}
          </div>
        )}
        {overlay && overlaySrc && (
          <PluginOverlay
            key={`${overlay.view}:${overlay.size}`}
            source={overlay.source}
            ariaLabel={`${title ?? pluginId} ${overlay.title}`}
            title={title ? `${title} · ${overlay.title}` : overlay.title}
            size={overlay.size}
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
