/**
 * 插件管理器的数据模型。
 *
 * 协议类型（manifest、WidgetInstance、postMessage 消息）全部来自
 * `src/host/bridge/types.ts`，这里只做“扫描结果归一化”和“宿主侧多出来的运行时信息”。
 */

import type { PluginManifest, WidgetManifest, WidgetSize } from '../bridge/types';

export type {
  GeoLocation,
  PluginManifest,
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

/** 归一化后的插件：旧格式（单 size）和新格式（多尺寸）都收口到这里 */
export interface NormalizedPlugin extends PluginManifest {
  /** manifest 的 background 声明（含组件级 background），决定是否挂常驻隐藏 iframe */
  background: boolean;
  /** 插件目录名（iframe URL 用它）；manifest.id 与目录名不一致时以目录名为准 */
  dir: string;
  widgets: NormalizedWidget[];
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
