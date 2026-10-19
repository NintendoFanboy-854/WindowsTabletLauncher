/**
 * 宿主 ↔ 插件 的 postMessage 协议。
 *
 * 约定：
 * - 所有消息都有 `type`；请求/响应配对用 `id`。
 * - 宿主只发 `host:*`，插件只发 `plugin:*`。
 * - 插件可以脱离宿主单独打开（开发时），此时 SDK 有自己的兜底行为。
 */

export const PROTOCOL_VERSION = 1;

/** 宿主注入给插件的主题：直接给 Fluent token 的最终颜色值 */
export interface ThemePayload {
  colorScheme: 'dark' | 'light';
  [token: string]: string;
}

export interface AgentToolDecl {
  name: string;
  description: string;
  /** JSON Schema，可省略 */
  parameters?: unknown;
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
  | 'getLocation';

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

export type PluginToHostMessage =
  | PluginReadyMessage
  | PluginCallMessage
  | PluginToolResultMessage
  | PluginFocusExitMessage
  | PluginRequestHostSettingsMessage;

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

export interface HostApiMap {
  getConfig: { params: { key: string }; result: unknown };
  setConfig: { params: { key: string; value: unknown }; result: void };
  notify: { params: { text: string }; result: void };
  setKeepAwake: { params: { on: boolean }; result: void };
  getIdleSeconds: { params: never; result: number };
  showReminder: { params: ShowReminderParams; result: ReminderResult };
  getLocation: { params: never; result: GeoLocation | null };
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
  /** 没有组件、只后台运行的插件 */
  background?: boolean;
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
