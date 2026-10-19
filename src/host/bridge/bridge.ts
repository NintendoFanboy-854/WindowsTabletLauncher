/**
 * 宿主桥接层（A5）：
 * - 实现插件调用的 8 个宿主 API（`plugin:call` → `host:reply`）
 * - 维护 iframe 句柄注册表（reply / focus / toolCall）
 * - 汇总插件上报的 Agent 工具（`plugin:ready`），替 Agent 路由工具调用（`host:tool-call`）
 * - 键盘焦点交接（host:focus / plugin:focus-exit）
 *
 * 与 React 无关；UI 相关的通知、强提醒通过 services 注入。
 */

import {
  getIdleSeconds as tauriGetIdleSeconds,
  getLocation as tauriGetLocation,
  ipLocate as tauriIpLocate,
  isTauriRuntime,
  setKeepAwake as tauriSetKeepAwake,
} from '../plugins/tauri';
import type {
  AgentToolDecl,
  HostApiMethod,
  PluginCallMessage,
  PluginFocusExitMessage,
  PluginReadyMessage,
  PluginToolResultMessage,
  ReminderResult,
  ShowReminderParams,
} from './types';

/** 桌面层 / PluginWidgetFrame 需要暴露给桥接层的能力 */
export interface PluginFrameHandle {
  /**
   * 帧实例唯一 id（约定 `pluginId:widgetId`，后台 iframe 用 `pluginId:background`）。
   * 不传时桥接层用 `pluginId@<自增序号>` 兜底，多个实例仍然不会互相覆盖。
   */
  readonly uid?: string;
  /** iframe / 插件是否已经就绪（收到过 `plugin:ready`）；不传视为就绪 */
  isReady?(): boolean;
  reply(id: string, ok: boolean, result?: unknown, error?: string): void;
  focusPlugin(): void;
  toolCall(id: string, name: string, args: unknown): void;
}

/** 通知 / 强提醒由 UI 层提供（B2） */
export interface BridgeServices {
  notify(text: string): void;
  showReminder(params: ShowReminderParams): Promise<ReminderResult>;
}

export interface ToolCallOptions {
  /** 不传就一直等；Agent 层可自行加中止逻辑 */
  signal?: AbortSignal;
}

const CONFIG_PREFIX = 'plugin.';

export class HostBridge {
  /**
   * 帧句柄表：key = 实例 uid（`pluginId:widgetId` / `pluginId:background`）。
   * 同一个插件的多个组件实例各自一个句柄，不再互相覆盖。
   */
  private frames = new Map<string, PluginFrameHandle>();
  /** 插件 id → 该插件的实例 uid 列表（按注册顺序，工具路由取第一个可用的） */
  private pluginFrames = new Map<string, string[]>();
  private frameSeq = 0;
  /** Agent 工具声明 + 归属插件：模型需要 description/parameters 才知道怎么调 */
  private toolDecls = new Map<string, { decl: AgentToolDecl; pluginId: string }>();
  /** 工具声明变化（插件 ready 陆续到达）；复盘页深链时用它补取数据 */
  private toolListeners = new Set<() => void>();
  private pendingTools = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();
  private toolSeq = 0;
  private focusExitHandlers = new Set<() => void>();
  private services: BridgeServices;

  constructor(services: BridgeServices) {
    this.services = services;
  }

  /** 替换通知 / 强提醒实现（UI 就绪后调用） */
  setServices(services: BridgeServices): void {
    this.services = services;
  }

  // ---------- iframe 注册 ----------

  /**
   * 注册一个实例 iframe 句柄。
   *
   * key 用实例 uid（`handle.uid`；没有就用 `pluginId@序号` 兜底），同一个插件的
   * 多个组件实例可以同时挂载；工具归属仍按 pluginId 记录，`callTool` 按插件挑
   * “第一个已就绪的实例句柄”。返回注销函数（实例卸载时调用）。
   */
  registerFrame(pluginId: string, handle: PluginFrameHandle): () => void {
    const uid = handle.uid?.trim() || `${pluginId}@${++this.frameSeq}`;
    this.frames.set(uid, handle);
    const uids = this.pluginFrames.get(pluginId) ?? [];
    if (!uids.includes(uid)) uids.push(uid);
    this.pluginFrames.set(pluginId, uids);
    return () => {
      if (this.frames.get(uid) === handle) this.frames.delete(uid);
      const remaining = (this.pluginFrames.get(pluginId) ?? []).filter((entry) => entry !== uid);
      if (remaining.length > 0) this.pluginFrames.set(pluginId, remaining);
      else this.pluginFrames.delete(pluginId);
    };
  }

  /** 某个插件当前注册的全部实例句柄（按注册顺序） */
  private framesForPlugin(pluginId: string): PluginFrameHandle[] {
    return (this.pluginFrames.get(pluginId) ?? [])
      .map((uid) => this.frames.get(uid))
      .filter((handle): handle is PluginFrameHandle => !!handle);
  }

  /** 第一个已就绪的实例句柄；没有 isReady 的句柄视为就绪 */
  private readyFrameForPlugin(pluginId: string): PluginFrameHandle | undefined {
    return this.framesForPlugin(pluginId).find(
      (handle) => !handle.isReady || handle.isReady(),
    );
  }

  /** 按实例 uid（或 pluginId，返回该插件第一个实例）取句柄，主要用于焦点交接/调试 */
  frame(key: string): PluginFrameHandle | undefined {
    const direct = this.frames.get(key);
    if (direct) return direct;
    return this.framesForPlugin(key)[0];
  }

  /** 把键盘焦点交给某个插件的 iframe（优先第一个就绪实例） */
  focusPlugin(pluginId: string): void {
    const handle = this.readyFrameForPlugin(pluginId) ?? this.framesForPlugin(pluginId)[0];
    handle?.focusPlugin();
  }

  onFocusExit(handler: () => void): () => void {
    this.focusExitHandlers.add(handler);
    return () => this.focusExitHandlers.delete(handler);
  }

  // ---------- 插件消息分流 ----------

  /** 处理 plugin:ready：记录该插件提供的 Agent 工具（完整声明） */
  handleReady(message: PluginReadyMessage): void {
    const pluginId = message.payload.pluginId;
    for (const tool of message.payload.tools ?? []) {
      this.ownTool(tool, pluginId);
    }
    if ((message.payload.tools?.length ?? 0) > 0) this.notifyToolsChanged();
  }

  /** 处理 plugin:focus-exit：插件把焦点交还宿主 */
  handleFocusExit(_message: PluginFocusExitMessage): void {
    for (const handler of this.focusExitHandlers) handler();
  }

  /** 处理 plugin:tool-result：唤醒等待中的 toolCall */
  handleToolResult(message: PluginToolResultMessage): void {
    const pending = this.pendingTools.get(message.id);
    if (!pending) return;
    this.pendingTools.delete(message.id);
    if (message.ok) pending.resolve(message.result);
    else pending.reject(new Error(message.error ?? '插件工具执行失败'));
  }

  /** 处理 plugin:call：执行宿主 API 并把结果写回 */
  async handleApiCall(pluginId: string, message: PluginCallMessage, reply: (ok: boolean, result?: unknown, error?: string) => void): Promise<void> {
    try {
      const result = await this.runApi(pluginId, message.method, message.params);
      reply(true, result);
    } catch (error) {
      reply(false, undefined, error instanceof Error ? error.message : String(error));
    }
  }

  // ---------- 8 个宿主 API ----------

  private async runApi(pluginId: string, method: HostApiMethod, params: unknown): Promise<unknown> {
    switch (method) {
      case 'getConfig': {
        const { key } = params as { key: string };
        return this.getConfig(pluginId, key);
      }
      case 'setConfig': {
        const { key, value } = params as { key: string; value: unknown };
        this.setConfig(pluginId, key, value);
        return undefined;
      }
      case 'notify': {
        const { text } = params as { text: string };
        this.services.notify(text);
        return undefined;
      }
      case 'setKeepAwake': {
        const { on } = params as { on: boolean };
        if (isTauriRuntime()) await tauriSetKeepAwake(on);
        return undefined;
      }
      case 'getIdleSeconds': {
        if (isTauriRuntime()) return tauriGetIdleSeconds();
        return 0;
      }
      case 'showReminder':
        return this.services.showReminder(params as ShowReminderParams);
      case 'getLocation': {
        if (isTauriRuntime()) return tauriGetLocation();
        return null;
      }
      case 'ipLocate': {
        // 浏览器 dev 没有 Rust 后端；命令失败也按“拿不到”处理，插件只认 null
        if (!isTauriRuntime()) return null;
        try {
          return await tauriIpLocate();
        } catch (error) {
          console.warn('[bridge] ipLocate 失败', error);
          return null;
        }
      }
      default:
        throw new Error(`未知宿主 API: ${String(method)}`);
    }
  }

  // ---------- 插件配置（按插件命名空间） ----------

  private storageKey(pluginId: string, key: string): string {
    return `${CONFIG_PREFIX}${pluginId}.${key}`;
  }

  getConfig<T = unknown>(pluginId: string, key: string): T | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(this.storageKey(pluginId, key));
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setConfig(pluginId: string, key: string, value: unknown): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.storageKey(pluginId, key), JSON.stringify(value));
  }

  /** 给 `host:init` 用的配置快照 */
  configSnapshot(pluginId: string): Record<string, unknown> {
    const snapshot: Record<string, unknown> = {};
    if (typeof localStorage === 'undefined') return snapshot;
    const prefix = `${CONFIG_PREFIX}${pluginId}.`;
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (!fullKey || !fullKey.startsWith(prefix)) continue;
      const key = fullKey.slice(prefix.length);
      const raw = localStorage.getItem(fullKey);
      if (raw === null) continue;
      try {
        snapshot[key] = JSON.parse(raw);
      } catch {
        snapshot[key] = raw;
      }
    }
    return snapshot;
  }

  // ---------- Agent 工具 ----------

  /** 工具声明（带 description / parameters JSON Schema），按注册顺序 */
  listTools(): AgentToolDecl[] {
    return [...this.toolDecls.values()].map((entry) => ({ ...entry.decl }));
  }

  /**
   * 订阅工具声明变化（插件 `plugin:ready` 陆续到达）。
   * 返回取消订阅函数。复盘页深链时插件 iframe 与页面同时挂载，用它补取数据。
   */
  onToolsChange(handler: () => void): () => void {
    this.toolListeners.add(handler);
    return () => this.toolListeners.delete(handler);
  }

  /** 记录工具及其归属插件；同名工具后注册者覆盖，并 warn 一条 */
  private ownTool(decl: AgentToolDecl, pluginId: string): void {
    if (!decl || typeof decl.name !== 'string' || !decl.name) return;
    const existing = this.toolDecls.get(decl.name);
    if (existing && existing.pluginId !== pluginId) {
      console.warn(
        `[bridge] 工具 ${decl.name} 被插件 ${pluginId} 覆盖（之前属于 ${existing.pluginId}）`,
      );
    }
    this.toolDecls.set(decl.name, { decl, pluginId });
  }

  private notifyToolsChanged(): void {
    for (const listener of this.toolListeners) {
      try {
        listener();
      } catch (error) {
        console.warn('[bridge] 工具变化监听器失败', error);
      }
    }
  }

  /** 更新/覆盖单个工具声明（插件 ready 时带过来了） */
  registerToolDecl(decl: AgentToolDecl, pluginId: string): void {
    this.ownTool(decl, pluginId);
    this.notifyToolsChanged();
  }

  hasTool(name: string): boolean {
    return this.toolDecls.has(name);
  }

  /**
   * 替 Agent 调用插件工具。
   *
   * 工具归属按 pluginId 记录（同一插件多个实例只注册一份工具），执行时挑该插件
   * “第一个已就绪的实例句柄”（组件 iframe 与后台 iframe 按注册顺序，谁先就绪谁先用）；
   * 后台 iframe 常驻，组件 iframe 不在桌面时由它兜住（todo.stats / sedentary.status）。
   * 插件未注册 / 没有可用 iframe → reject；结果由 plugin:tool-result 唤醒。
   */
  callTool(name: string, args: unknown, options: ToolCallOptions = {}): Promise<unknown> {
    const owner = this.toolDecls.get(name);
    if (!owner) return Promise.reject(new Error(`没有插件提供工具: ${name}`));
    const pluginId = owner.pluginId;
    const frames = this.framesForPlugin(pluginId);
    if (frames.length === 0) return Promise.reject(new Error(`插件 ${pluginId} 当前不在桌面`));
    const handle = this.readyFrameForPlugin(pluginId);
    if (!handle) {
      return Promise.reject(new Error(`插件 ${pluginId} 的 iframe 还没就绪（没有收到 plugin:ready）`));
    }

    const id = `t${++this.toolSeq}`;
    return new Promise((resolve, reject) => {
      this.pendingTools.set(id, { resolve, reject });
      handle.toolCall(id, name, args);
      options.signal?.addEventListener('abort', () => {
        if (!this.pendingTools.has(id)) return;
        this.pendingTools.delete(id);
        reject(new Error('工具调用已取消'));
      });
    });
  }
}

// ---------- 默认 services（UI 还没接时的兜底） ----------

export const defaultBridgeServices: BridgeServices = {
  notify(text) {
    console.info('[notify]', text);
  },
  async showReminder(params) {
    console.info('[showReminder]', params.title, params.message ?? '');
    return {};
  },
};

let singleton: HostBridge | null = null;

export function getHostBridge(services: BridgeServices = defaultBridgeServices): HostBridge {
  if (!singleton) singleton = new HostBridge(services);
  return singleton;
}
