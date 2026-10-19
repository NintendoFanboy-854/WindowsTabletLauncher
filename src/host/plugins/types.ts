/**
 * 插件管理器的数据模型。
 *
 * 协议类型（manifest、WidgetInstance、postMessage 消息）全部来自
 * `src/host/bridge/types.ts`，这里只做“扫描结果归一化”和“宿主侧多出来的运行时信息”。
 */

import type {
  PluginManifest,
  SettingOption,
  TimeRangeValue,
  WidgetManifest,
  WidgetSize,
} from '../bridge/types';

export type {
  GeoLocation,
  PluginManifest,
  PluginSettingsManifest,
  SettingFieldManifest,
  SettingOption,
  SettingValue,
  TimeRangeValue,
  WidgetInstance,
  WidgetManifest,
  WidgetSize,
} from '../bridge/types';

/** 归一化后的组件声明：尺寸档位一定有值 */
export interface NormalizedWidget extends WidgetManifest {
  /** 支持的尺寸档位，至少一档 */
  sizes: WidgetSize[];
  /** 默认尺寸，必属于 sizes */
  defaultSize: WidgetSize;
}

// ---------- 归一化后的 settings schema（坏数据在这里被丢弃/兜底） ----------

export interface NormalizedSettingBase {
  key: string;
  label: string;
  /** 行内次要说明（12 fg3），可省略 */
  description?: string;
}

export interface NormalizedBooleanSetting extends NormalizedSettingBase {
  type: 'boolean';
  default: boolean;
}

export interface NormalizedNumberSetting extends NormalizedSettingBase {
  type: 'number';
  default: number;
  /** 范围两端可省略；min > max 的坏声明会被丢掉 */
  min?: number;
  max?: number;
  /** 始终有值，默认 1 */
  step: number;
  unit?: string;
}

export interface NormalizedEnumSetting extends NormalizedSettingBase {
  type: 'enum';
  default: SettingOption['value'];
  /** 至少一项；value 可能是数字 */
  options: SettingOption[];
}

export interface NormalizedTextSetting extends NormalizedSettingBase {
  type: 'text';
  default: string;
  placeholder?: string;
  secret: boolean;
  maxLength?: number;
}

export interface NormalizedTimeRangeSetting extends NormalizedSettingBase {
  type: 'timeRange';
  default: TimeRangeValue;
}

export type NormalizedSettingField =
  | NormalizedBooleanSetting
  | NormalizedNumberSetting
  | NormalizedEnumSetting
  | NormalizedTextSetting
  | NormalizedTimeRangeSetting;

export interface NormalizedSettingGroup {
  id: string;
  title: string;
  hint?: string;
  fields: NormalizedSettingField[];
}

export interface NormalizedSettingsSchema {
  /** 配置存储键：plugin.<pluginId>.<key> */
  key: string;
  version: number;
  groups: NormalizedSettingGroup[];
  /** 无法渲染的字段（未知类型 / 数据不合法）；设置页提示但绝不写配置 */
  unsupported: { key: string; type: string }[];
}

/** 归一化后的插件：旧格式（单 size）和新格式（多尺寸）都收口到这里 */
export interface NormalizedPlugin extends Omit<PluginManifest, 'settings'> {
  /** manifest 的 background 声明（含组件级 background），决定是否挂常驻隐藏 iframe */
  background: boolean;
  /** 插件目录名（iframe URL 用它）；manifest.id 与目录名不一致时以目录名为准 */
  dir: string;
  widgets: NormalizedWidget[];
  /** 归一化后的设置 schema；manifest 没声明时为 undefined */
  settings?: NormalizedSettingsSchema;
}

/** Rust `plugin_list` 返回的一条记录（manifest 原样透传，归一化在 TS 侧做） */
export interface PluginRecord {
  /** 目录名 */
  id: string;
  /** 绝对路径（仅诊断用；iframe 用 id） */
  dir: string;
  /** manifest.json 的原始 JSON；读取失败为 null */
  manifest: unknown;
  error?: string;
}

/** Rust `plugin_env` 返回的运行时环境 */
export interface PluginEnv {
  pluginsDir: string;
  /** 插件 iframe 的自定义协议根，如 http://wtsl.localhost */
  frameBase: string;
  writable: boolean;
  runtime: string;
}

export type PluginSourceKind = 'http' | 'tauri';
