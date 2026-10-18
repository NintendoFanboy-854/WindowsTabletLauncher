/**
 * 插件源：两套实现，行为一致。
 *
 * - `HttpPluginSource`：开发 / 浏览器 / 截图模式，走 vite 的 `/plugins/`；
 * - `TauriPluginSource`：应用运行时，扫描/读写/安装都走 Rust 命令，
 *   iframe 走 `wtsl://` 自定义协议（这样用户数据目录里的插件也能加载）。
 *
 * 自动选择顺序：Tauri 且自定义协议探活通过 → Tauri；否则 HTTP。
 */

import { toError } from './errors';
import * as tauri from './tauri';
import type { PluginRecord, PluginSourceKind } from './types';

export interface PluginSource {
  readonly kind: PluginSourceKind;
  /** 拼 iframe URL 的根（http 为 `/plugins`，tauri 为 `http://wtsl.localhost`） */
  readonly frameBase: string;
  /** 列出全部插件（manifest 为原始 JSON） */
  list(): Promise<PluginRecord[]>;
  /** 安装 zip，返回新插件记录 */
  installZip(zipPath: string): Promise<PluginRecord>;
  /** 删除插件目录 */
  remove(pluginId: string, dir: string): Promise<void>;
}

const HTTP_BASE = '/plugins';
/** 探活超时：等 2s 还连不上就退回 HTTP，不让启动卡死（这是交互等待预算） */
const PROBE_TIMEOUT_MS = 2000;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function probeFrameBase(frameBase: string): Promise<boolean> {
  if (!frameBase) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const response = await fetch(`${frameBase}/plugin-sdk.js`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** 开发 / 浏览器模式：`/plugins/index.json` 是名单 */
class HttpPluginSource implements PluginSource {
  readonly kind = 'http' as const;
  readonly frameBase = HTTP_BASE;

  async list(): Promise<PluginRecord[]> {
    const ids = await fetchJson<unknown>(`${HTTP_BASE}/index.json`);
    if (!Array.isArray(ids)) return [];
    const records: PluginRecord[] = [];
    for (const id of ids) {
      if (typeof id !== 'string' || !id.trim()) continue;
      const manifest = await fetchJson<unknown>(
        `${HTTP_BASE}/${encodeURIComponent(id)}/manifest.json`,
      );
      records.push({
        id,
        dir: `${HTTP_BASE}/${encodeURIComponent(id)}`,
        manifest,
        error: manifest === null ? 'manifest.json 读取失败' : undefined,
      });
    }
    return records;
  }

  async installZip(): Promise<PluginRecord> {
    throw new Error('浏览器模式不支持安装插件：请在 Tauri 应用窗口里拖入 zip');
  }

  async remove(): Promise<void> {
    throw new Error('浏览器模式不支持删除插件：请在 Tauri 应用里操作');
  }
}

/** Tauri 运行时：Rust 扫描插件目录，自定义协议喂 iframe */
class TauriPluginSource implements PluginSource {
  readonly kind = 'tauri' as const;

  constructor(readonly frameBase: string) {}

  list(): Promise<PluginRecord[]> {
    return tauri.pluginList();
  }

  installZip(zipPath: string): Promise<PluginRecord> {
    return tauri.pluginInstallZip(zipPath);
  }

  async remove(pluginId: string, dir: string): Promise<void> {
    // Rust 以目录名为准；dir 在 Tauri 下是绝对路径，命令只要 pluginId
    void dir;
    await tauri.pluginRemove(pluginId);
  }
}

/**
 * 探测当前环境该用哪个插件源。
 * 浏览器 / 截图模式返回 HTTP 源；Tauri 里探活失败时也退回 HTTP（开发期兜底）。
 */
export async function createPluginSource(): Promise<PluginSource> {
  if (tauri.isTauriRuntime()) {
    try {
      const env = await tauri.pluginEnv();
      if (await probeFrameBase(env.frameBase)) {
        return new TauriPluginSource(env.frameBase);
      }
      console.warn('[plugins] 自定义协议探活失败，退回 HTTP 插件源');
    } catch (error) {
      console.warn('[plugins] Tauri 插件源初始化失败，退回 HTTP 插件源', toError(error));
    }
  }
  return new HttpPluginSource();
}
