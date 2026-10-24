/**
 * 插件管理器：扫描 / 归一化 / 热重载 / 安装 / iframe URL。
 *
 * 这一层不碰 DOM、不碰 React，宿主（桌面层、插件管理页、桥接层）都通过它拿数据：
 *
 * ```ts
 * const manager = getPluginManager();
 * const plugins = await manager.init();
 * const instances = manager.createInstances({ cols: 8, rows: 5 }); // WidgetInstance[]
 * const src = manager.widgetFrameSrc(instances[0]);                // iframe src
 * const off = manager.subscribe(() => { ... });                    // 热重载通知
 * await manager.attachZipDrop({ onInstalled: (plugin) => {} });    // 拖 zip 安装
 * ```
 *
 * 注意：默认摆放与持久化是两件事。`createInstances` 只给“第一次摆上去”的结果，
 * 布局存档与重排由 layout 引擎（A3）负责。
 */

import type { WidgetInstance } from '../bridge/types';
import { toError } from './errors';
import { createDefaultInstances, normalizeManifest } from './manifest';
import type { DefaultInstancesOptions } from './manifest';
import { createPluginSource } from './source';
import type { PluginSource } from './source';
import type { NormalizedPlugin } from './types';

export type PluginManagerListener = (plugins: NormalizedPlugin[]) => void;

export interface PluginManagerOptions {
  /** 覆盖插件源（测试 / 特殊环境用），默认自动探测 */
  source?: PluginSource;
  /** 扫描或安装出错时的回调；不传就只打 console */
  onError?: (error: Error) => void;
}

export interface ZipDropCallbacks {
  /** 拖入 zip 并安装成功（已重扫） */
  onInstalled?: (plugin: NormalizedPlugin) => void;
  onError?: (error: Error) => void;
  /** 文件拖入 / 拖出窗口（做拖拽提示用） */
  onDragStateChange?: (dragging: boolean) => void;
}

export class PluginManager {
  #source: PluginSource | null;
  #plugins: NormalizedPlugin[] = [];
  #listeners = new Set<PluginManagerListener>();
  #byId = new Map<string, NormalizedPlugin>();
  #byDir = new Map<string, NormalizedPlugin>();
  #initPromise: Promise<NormalizedPlugin[]> | null = null;
  #disposers: Array<() => void> = [];
  #options: PluginManagerOptions;
  /** 最近一次扫描中被拒绝的插件（identityHue 等契约错误），供插件页展示 */
  #problems: string[] = [];

  constructor(options: PluginManagerOptions = {}) {
    this.#options = options;
    this.#source = options.source ?? null;
  }

  /** 当前插件源类型；init 之后才有值 */
  get sourceKind(): 'http' | 'tauri' | null {
    return this.#source?.kind ?? null;
  }

  /** iframe URL 根；init 之后才有值 */
  get frameBase(): string | null {
    return this.#source?.frameBase ?? null;
  }

  get plugins(): NormalizedPlugin[] {
    return this.#plugins;
  }

  /** 最近一次扫描的拒绝原因（不静默吞掉非法 manifest） */
  get problems(): readonly string[] {
    return this.#problems;
  }

  /** 初始化（幂等）：首次扫描插件目录 */
  init(): Promise<NormalizedPlugin[]> {
    this.#initPromise ??= this.#scan();
    return this.#initPromise;
  }

  /** 热重载：重新扫描（编辑器里改 manifest / 手动放目录 / 安装 zip 之后用） */
  async reload(): Promise<NormalizedPlugin[]> {
    this.#initPromise = null;
    return this.init();
  }

  subscribe(listener: PluginManagerListener): () => void {
    this.#listeners.add(listener);
    // 立即推一次当前快照，订阅方不用自己处理“订阅前已有数据”的时序
    listener(this.#plugins);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  /** 按 manifest.id 或目录名找插件 */
  findPlugin(pluginId: string): NormalizedPlugin | null {
    return this.#byId.get(pluginId) ?? this.#byDir.get(pluginId) ?? null;
  }

  /** 首次摆桌面的默认实例（页面/layout 由调用方决定） */
  createInstances(options: DefaultInstancesOptions): WidgetInstance[] {
    return createDefaultInstances(this.#plugins, options);
  }

  /** 某个组件实例的 iframe 地址 */
  widgetFrameSrc(instance: Pick<WidgetInstance, 'pluginId' | 'widgetId'>): string {
    return this.frameSrc(instance.pluginId, instance.widgetId);
  }

  /**
   * 拼插件页面地址。`?plugin=` 是必须的：自定义协议下插件路径是
   * `/<dir>/index.html`，SDK 仅靠 pathname 猜不出插件 id。
   */
  frameSrc(pluginId: string, widgetId?: string): string {
    const source = this.#source;
    if (!source) throw new Error('插件管理器尚未初始化，先 await manager.init()');
    const plugin = this.findPlugin(pluginId);
    if (!plugin) throw new Error(`找不到插件: ${pluginId}`);

    const base = source.frameBase.replace(/\/+$/, '');
    const query = new URLSearchParams({ plugin: plugin.id });
    if (widgetId) query.set('widget', widgetId);
    return `${base}/${encodeURIComponent(plugin.dir)}/index.html?${query.toString()}`;
  }

  /** 需要常驻隐藏 iframe 的插件（manifest.background === true） */
  backgroundPlugins(): NormalizedPlugin[] {
    return this.#plugins.filter((plugin) => plugin.background);
  }

  /** 后台 iframe 地址（带 background=1，插件据此区分定时/轮询上下文） */
  backgroundFrameSrc(pluginId: string): string {
    const src = this.frameSrc(pluginId);
    return `${src}&background=1`;
  }

  /** 安装 zip（Tauri 运行时），成功后自动重扫 */
  async installZip(zipPath: string): Promise<NormalizedPlugin> {
    const source = await this.#ensureSource();
    const record = await source.installZip(zipPath);
    await this.reload();
    const installed = this.#byDir.get(record.id);
    if (!installed) {
      throw new Error(record.error ?? `插件「${record.id}」安装后无法加载（manifest 有问题？）`);
    }
    return installed;
  }

  /** 删除插件（Tauri 运行时），成功后自动重扫 */
  async removePlugin(pluginId: string): Promise<void> {
    const plugin = this.findPlugin(pluginId);
    if (!plugin) throw new Error(`找不到插件: ${pluginId}`);
    const source = await this.#ensureSource();
    await source.remove(plugin.id, plugin.dir);
    await this.reload();
  }

  /**
   * 监听窗口文件拖放：拖入 .zip 就解压安装并重扫。
   * 浏览器模式返回空操作（安装只在 Tauri 里有意义）。
   */
  async attachZipDrop(callbacks: ZipDropCallbacks = {}): Promise<() => void> {
    const source = await this.#ensureSource().catch((error) => {
      this.#report(toError(error));
      return null;
    });
    if (!source || source.kind !== 'tauri') return () => {};

    let unlisten: (() => void) | null = null;
    try {
      const { getCurrentWebview } = await import('@tauri-apps/api/webview');
      unlisten = await getCurrentWebview().onDragDropEvent((event) => {
        const payload = event.payload;
        switch (payload.type) {
          case 'enter':
            callbacks.onDragStateChange?.(true);
            break;
          case 'leave':
            callbacks.onDragStateChange?.(false);
            break;
          case 'drop': {
            callbacks.onDragStateChange?.(false);
            const zips = payload.paths.filter((path) => path.toLowerCase().endsWith('.zip'));
            if (zips.length === 0) {
              callbacks.onError?.(new Error('拖入的文件里没有 .zip 插件包'));
              return;
            }
            void (async () => {
              for (const zipPath of zips) {
                try {
                  callbacks.onInstalled?.(await this.installZip(zipPath));
                } catch (error) {
                  const wrapped = toError(error);
                  this.#report(wrapped);
                  callbacks.onError?.(wrapped);
                }
              }
            })();
            break;
          }
          default:
            break;
        }
      });
    } catch (error) {
      this.#report(toError(error));
      return () => {};
    }

    const dispose = () => {
      unlisten?.();
      unlisten = null;
    };
    this.#disposers.push(dispose);
    return dispose;
  }

  dispose(): void {
    for (const dispose of this.#disposers.splice(0)) dispose();
    this.#listeners.clear();
    this.#initPromise = null;
  }

  async #scan(): Promise<NormalizedPlugin[]> {
    const source = await this.#ensureSource();
    let records;
    try {
      records = await source.list();
    } catch (error) {
      throw new Error(`扫描插件目录失败: ${toError(error).message}`);
    }

    const plugins: NormalizedPlugin[] = [];
    const problems: string[] = [];
    const seenIds = new Set<string>();
    const seenDirs = new Set<string>();
    for (const record of records) {
      if (record.error) {
        console.warn(`[plugins] ${record.id}: ${record.error}`);
        problems.push(`${record.id}: ${record.error}`);
      }
      if (!record.manifest || seenDirs.has(record.id)) continue;
      let plugin: NormalizedPlugin | null = null;
      try {
        plugin = normalizeManifest(record.manifest, record.id);
      } catch (error) {
        // identityHue 等契约字段非法：拒绝加载并给出可定位的报错，不静默回退
        const message = `${record.id}: ${toError(error).message}`;
        console.error(`[plugins] 拒绝加载插件 ${message}`);
        problems.push(`拒绝加载插件 ${message}`);
        this.#report(new Error(`拒绝加载插件 ${message}`));
        continue;
      }
      if (!plugin) {
        console.warn(`[plugins] 跳过无法解析的 manifest: ${record.id}`);
        continue;
      }
      if (seenIds.has(plugin.id)) {
        console.warn(`[plugins] 插件 id 重复，跳过: ${plugin.id} (${record.id})`);
        continue;
      }
      seenIds.add(plugin.id);
      seenDirs.add(record.id);
      plugins.push(plugin);
    }

    this.#plugins = plugins;
    this.#problems = problems;
    this.#byId = new Map(plugins.map((plugin) => [plugin.id, plugin]));
    this.#byDir = new Map(plugins.map((plugin) => [plugin.dir, plugin]));
    this.#emit();
    return plugins;
  }

  async #ensureSource(): Promise<PluginSource> {
    if (!this.#source) {
      this.#source = await createPluginSource();
    }
    return this.#source;
  }

  #emit(): void {
    for (const listener of [...this.#listeners]) {
      try {
        listener(this.#plugins);
      } catch (error) {
        this.#report(toError(error));
      }
    }
  }

  #report(error: Error): void {
    if (this.#options.onError) {
      this.#options.onError(error);
      return;
    }
    console.warn('[plugins]', error);
  }
}

let sharedManager: PluginManager | null = null;

/** 全局单例；宿主内所有地方共用同一份扫描结果与 iframe URL 规则 */
export function getPluginManager(options?: PluginManagerOptions): PluginManager {
  sharedManager ??= new PluginManager(options);
  return sharedManager;
}
