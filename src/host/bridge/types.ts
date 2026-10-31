/**
 * 宿主 ↔ 插件 的 postMessage 协议。
 *
 * 约定：
 * - 所有消息都有 `type`；请求/响应配对用 `id`。
 * - 宿主只发 `host:*`，插件只发 `plugin:*`。
 * - 插件可以脱离宿主单独打开（开发时），此时 SDK 有自己的兜底行为。
 */

/**
 * 2：新增 `host:config`（宿主写配置后主动推送增量）。
 * 3：新增通用受管浏览器窗口 / SMTC 媒体会话 API（openBrowserWindow / browserWindow* /
 *    mediaSessions / mediaCommand / mediaArtwork / mediaKey）。
 *
 * 另有 `browserWindowDebugTargets`（受管窗口的 CDP 调试目标透传）后续追加进 v3，不单独升版本：
 * 协议版本只在宿主需要按版本分支时才起作用，这类「只新增、旧插件不调用」的能力与 v3 同代。
 *
 * 版本只增不改：旧插件不认识新增 API，也不会调用；宿主不依赖插件回包。
 */
export const PROTOCOL_VERSION = 3;

/** 宿主注入给插件的主题：直接给 Fluent token 的最终颜色值 */
export interface ThemePayload {
  colorScheme: 'dark' | 'light';
  /** 身份色（manifest.identityHue → shared palette 同档 L/C 的具体颜色） */
  wtslIdentity?: string;
  /** 身份色 BorderActive：仅保留给 2px 状态强调，插件默认不用 */
  wtslIdentityBorder?: string;
  /** 身份色 Background2：仅保留给淡底场景，插件默认不用 */
  wtslIdentitySurface?: string;
  /** 当前 hue 名，仅诊断用；插件不应据此分支 */
  wtslIdentityHue?: string;
  [token: string]: string | undefined;
}

export interface AgentToolDecl {
  name: string;
  description: string;
  /** JSON Schema，可省略 */
  parameters?: unknown;
  /**
   * 用户整句与其中一条完全一致时，宿主直接执行这个工具（不交给模型决定）。
   * 用于「我站起来了」「我坐下了」这类必须立即生效的状态报告。
   */
  phrases?: string[];
}

// ---------- 宿主 → 插件 ----------

export interface HostInitMessage {
  v: number;
  type: 'host:init';
  payload: {
    pluginId: string;
    widgetId: string;
    /** 当前尺寸（列跨 × 行跨），插件据此决定显示内容 */
    size: [number, number];
    theme: ThemePayload;
    /** 该插件的持久化配置快照 */
    config: Record<string, unknown>;
  };
}

export interface HostReplyMessage {
  type: 'host:reply';
  id: string;
  ok: boolean;
  result?: unknown;
  error?: string;
}

export interface HostResizeMessage {
  type: 'host:resize';
  payload: { size: [number, number] };
}

export interface HostThemeMessage {
  type: 'host:theme';
  payload: { theme: ThemePayload };
}

export interface HostFocusMessage {
  type: 'host:focus';
}

/**
 * 插件配置被写入后的增量推送。
 *
 * 不能靠 localStorage 的 `storage` 事件：Tauri 运行时宿主页是
 * `http://tauri.localhost`、插件 iframe 是 `http://wtsl.localhost`（不同 origin，
 * 见 `src-tauri/src/protocol.rs`），`HostBridge.setConfig` 写的宿主存储区不会
 * 向插件文档派发 storage 事件。宿主写入后必须主动把新值发给该插件的每个 iframe
 * （卡片 / 详情浮层 / 后台），插件用 `plugin.onConfig` / `useStoredConfig` 消费。
 */
export interface HostConfigMessage {
  v: number;
  type: 'host:config';
  payload: {
    /** 配置键（不含 `plugin.<pluginId>.` 前缀） */
    key: string;
    /** 新值（与 `getConfig` 读到的 JSON 值同形） */
    value: unknown;
  };
}

/** 宿主替 Agent 调用插件的工具 */
export interface HostToolCallMessage {
  type: 'host:tool-call';
  id: string;
  name: string;
  args: unknown;
}

export type HostToPluginMessage =
  | HostInitMessage
  | HostReplyMessage
  | HostResizeMessage
  | HostThemeMessage
  | HostFocusMessage
  | HostConfigMessage
  | HostToolCallMessage;

// ---------- 插件 → 宿主 ----------

/** 插件加载完成，上报自己的 Agent 工具 */
export interface PluginReadyMessage {
  type: 'plugin:ready';
  payload: {
    pluginId: string;
    widgetId: string;
    tools: AgentToolDecl[];
  };
}

export type HostApiMethod =
  | 'getConfig'
  | 'setConfig'
  | 'notify'
  | 'setKeepAwake'
  | 'getIdleSeconds'
  | 'showReminder'
  | 'getLocation'
  | 'ipLocate'
  | 'openBrowserWindow'
  | 'browserWindowControl'
  | 'browserWindowState'
  | 'browserWindowDebugTargets'
  | 'mediaSessions'
  | 'mediaCommand'
  | 'mediaArtwork'
  | 'mediaKey';

/** 插件调用宿主 API */
export interface PluginCallMessage {
  type: 'plugin:call';
  id: string;
  method: HostApiMethod;
  params?: unknown;
}

/** 插件返回工具执行结果 */
export interface PluginToolResultMessage {
  type: 'plugin:tool-result';
  id: string;
  ok: boolean;
  result?: unknown;
  error?: string;
}

/** 插件里按了 Esc，把键盘焦点交还宿主 */
export interface PluginFocusExitMessage {
  type: 'plugin:focus-exit';
}

/** 插件请求打开宿主设置页里的本插件分区（契约 §5） */
export interface PluginRequestHostSettingsMessage {
  type: 'plugin:request-host-settings';
}

/** 卡片手势的指针阶段（契约 §3.2；hover 只对 mouse/pen 发） */
export type CardPointerPhase = 'down' | 'up' | 'cancel' | 'hover-enter' | 'hover-leave';

/** 指针类型原样转发；触控没有 hover，press/长按三种都生效 */
export type CardPointerType = 'touch' | 'pen' | 'mouse';

/**
 * SDK 把卡片 iframe 内的指针状态转发给宿主（契约 §3.2）。
 * 只在卡片实例的 iframe 里发；浮层视图（?view=...）与后台 iframe 不发。
 */
export interface PluginCardPointerMessage {
  type: 'plugin:card-pointer';
  phase: CardPointerPhase;
  pointerType: CardPointerType;
}

/**
 * 插件侧 SDK 检测到 500ms 长按（契约 §3.2）。
 * 长按计时器只在 SDK 跑一份，宿主收到后只负责进编辑模式并聚焦该卡。
 */
export interface PluginRequestEditModeMessage {
  type: 'plugin:request-edit-mode';
}

export type PluginToHostMessage =
  | PluginReadyMessage
  | PluginCallMessage
  | PluginToolResultMessage
  | PluginFocusExitMessage
  | PluginRequestHostSettingsMessage
  | PluginCardPointerMessage
  | PluginRequestEditModeMessage;

// ---------- API 参数/返回值 ----------

export interface ShowReminderParams {
  title: string;
  message?: string;
  actions?: { id: string; text: string; kind?: 'primary' | 'secondary' }[];
  autoDismissSec?: number;
}

export interface ReminderResult {
  /** 用户点了哪个 action；超时/关闭为 undefined */
  actionId?: string;
}

export interface GeoLocation {
  lat: number;
  lon: number;
  city?: string;
}

/** ip.cn 网络归属地（D-16）：只有行政区/运营商，不含坐标 */
export interface IpLocation {
  ip?: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  isp?: string;
}

// ---------- 通用受管浏览器窗口 / 媒体会话（P3b，宿主不认插件） ----------

export type BrowserWindowAction = 'show' | 'hide' | 'minimize' | 'close';

/**
 * 受管浏览器窗口状态。Rust 的 `Option<String>` 序列化为 null，因此 `url` 未运行时为 null。
 */
export interface BrowserWindowState {
  running: boolean;
  visible: boolean;
  minimized: boolean;
  url: string | null;
}

/**
 * 受管窗口的一条 CDP 调试目标：四个字段原样来自 `GET /json/list`。
 *
 * 宿主不判断、不过滤（没有类型白名单、没有 URL 匹配）：挑哪个目标、要不要连
 * WebSocket 都是调用方（插件）的事。
 */
export interface BrowserDebugTarget {
  /** CDP 目标类型（`page` / `iframe` / `service_worker` …） */
  type: string;
  url: string;
  title: string;
  /** CDP WebSocket 调试地址；调用方自己连 */
  webSocketDebuggerUrl: string;
}

/** 受管窗口的调试目标快照：DevTools 端口 + 目标列表。 */
export interface BrowserDebugTargets {
  port: number;
  targets: BrowserDebugTarget[];
}

export type MediaPlaybackCommand = 'play' | 'pause' | 'toggle' | 'next' | 'previous';

/**
 * 一个 SMTC 会话的只读快照。
 * `Option` 字段统一序列化为 null（不是 undefined），前端按 `null` 判断“未知/拿不到”。
 */
export interface MediaSessionInfo {
  id: string;
  appId: string;
  title: string;
  artist: string;
  album: string;
  playing: boolean;
  positionMs: number | null;
  durationMs: number | null;
  canPlayPause: boolean | null;
  canNext: boolean | null;
  canPrevious: boolean | null;
  artworkKey: string | null;
}

export interface MediaSessionSnapshot {
  sessions: MediaSessionInfo[];
}

export interface HostApiMap {
  getConfig: { params: { key: string }; result: unknown };
  setConfig: { params: { key: string; value: unknown }; result: void };
  notify: { params: { text: string }; result: void };
  setKeepAwake: { params: { on: boolean }; result: void };
  getIdleSeconds: { params: never; result: number };
  showReminder: { params: ShowReminderParams; result: ReminderResult };
  getLocation: { params: never; result: GeoLocation | null };
  ipLocate: { params: never; result: IpLocation | null };
  openBrowserWindow: { params: { url: string }; result: BrowserWindowState };
  browserWindowControl: {
    params: { action: BrowserWindowAction };
    result: BrowserWindowState;
  };
  browserWindowState: { params: never; result: BrowserWindowState };
  browserWindowDebugTargets: { params: never; result: BrowserDebugTargets };
  mediaSessions: { params: never; result: MediaSessionSnapshot };
  mediaCommand: {
    params: { sessionId: string; command: MediaPlaybackCommand };
    result: MediaSessionSnapshot;
  };
  mediaArtwork: { params: { sessionId: string }; result: string };
  mediaKey: { params: { command: MediaPlaybackCommand }; result: void };
}

// ---------- manifest ----------

export type WidgetSize = [number, number];

export interface WidgetManifest {
  id: string;
  title: string;
  /** 该组件支持的尺寸档位 */
  sizes: WidgetSize[];
  defaultSize: WidgetSize;
  /** 默认摆放在哪一格，可省略 */
  cell?: WidgetSize;
}

// ---------- manifest settings schema（契约 §2.1） ----------

/** v1 支持的设置字段类型；宿主不认识其它类型 */
export type SettingFieldType = 'boolean' | 'number' | 'enum' | 'text' | 'timeRange';

/**
 * enum 选项值允许数字：如「一周起始日」用 0/1、「刷新间隔」用 15/30/60。
 * 宿主写配置时按原类型写回，不把数字转成字符串。
 */
export type SettingOptionValue = string | number;

export interface SettingOption {
  value: SettingOptionValue;
  label: string;
}

export interface TimeRangeValue {
  start: string;
  end: string;
}

export type SettingValue = boolean | number | string | TimeRangeValue;

/** manifest.json 里声明的设置字段（未归一化：default/options 可能缺失或不合法） */
export interface SettingFieldManifest {
  key: string;
  type: SettingFieldType;
  label: string;
  /** 行内次要说明（12 fg3） */
  description?: string;
  default?: SettingValue;
  /** number：取值范围与步长 */
  min?: number;
  max?: number;
  step?: number;
  /** number：显示在后缀的单位，如「分钟」 */
  unit?: string;
  /** enum：≤4 用横向 Radio，>4 用 Dropdown */
  options?: SettingOption[];
  /** text：占位符 / 密码态 / 最大长度 */
  placeholder?: string;
  secret?: boolean;
  maxLength?: number;
}

export interface SettingGroupManifest {
  id?: string;
  title: string;
  hint?: string;
  fields: SettingFieldManifest[];
}

export interface PluginSettingsManifest {
  /** 配置存储键：plugin.<pluginId>.<key>；缺省 settings */
  key?: string;
  version?: number;
  groups: SettingGroupManifest[];
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  /**
   * 插件身份色。只能从白名单取（blue/pink/orange/green/purple/teal）；
   * 宿主把它映射成 `--wtsl-identity`，插件不能提交任意 hex。
   */
  identityHue: string;
  /** 没有组件、只后台运行的插件 */
  background?: boolean;
  /**
   * 新插件是否允许自动上桌（P3c）。
   *
   * 缺省 true：插件目录里的组件在首次布局 / 热重载合并时自动摆到空位。
   * 显式 false：不参与自动摆放（首次没有存档时也不放），只能由用户在编辑模式「添加组件」
   * 或插件管理页「添加到桌面」手动添加；已经保存过的布局条目不受影响。
   */
  autoPlace?: boolean;
  widgets: WidgetManifest[];
  /** 声明式设置：宿主设置页据此渲染通用表单（插件不提供设置界面） */
  settings?: PluginSettingsManifest;
}

/** 布局里保存的组件实例 */
export interface WidgetInstance {
  uid: string;
  pluginId: string;
  widgetId: string;
  title: string;
  page: number;
  col: number;
  row: number;
  size: WidgetSize;
  /** 支持的尺寸，用于编辑模式切换 */
  sizes: WidgetSize[];
}
