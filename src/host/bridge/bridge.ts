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
  private frames = new Map<string, PluginFrameHandle>();
  private toolOwners = new Map<string, string>();
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

  registerFrame(pluginId: string, handle: PluginFrameHandle): () => void {
    this.frames.set(pluginId, handle);
    return () => {
      if (this.frames.get(pluginId) === handle) this.frames.delete(pluginId);
    };
  }

  private frame(pluginId: string): PluginFrameHandle | undefined {
    return this.frames.get(pluginId);
  }

  /** 把键盘焦点交给某个插件的 iframe */
  focusPlugin(pluginId: string): void {
    this.frame(pluginId)?.focusPlugin();
  }

  onFocusExit(handler: () => void): () => void {
    this.focusExitHandlers.add(handler);
    return () => this.focusExitHandlers.delete(handler);
  }

  // ---------- 插件消息分流 ----------

  /** 处理 plugin:ready：记录该插件提供的 Agent 工具 */
  handleReady(message: PluginReadyMessage): void {
    const pluginId = message.payload.pluginId;
    for (const tool of message.payload.tools ?? []) {
      this.toolOwners.set(tool.name, pluginId);
    }
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

  listTools(): AgentToolDecl[] {
    return [...this.toolOwners.keys()].map((name) => ({ name, description: '' }));
  }

  /** 更新工具描述（插件 ready 时带过来了） */
  registerToolDecl(decl: AgentToolDecl, pluginId: string): void {
    this.toolOwners.set(decl.name, pluginId);
  }

  hasTool(name: string): boolean {
    return this.toolOwners.has(name);
  }

  /**
   * 替 Agent 调用插件工具。
   * 插件未注册 / iframe 不在 → reject；结果由 plugin:tool-result 唤醒。
   */
  callTool(name: string, args: unknown, options: ToolCallOptions = {}): Promise<unknown> {
    const pluginId = this.toolOwners.get(name);
    if (!pluginId) return Promise.reject(new Error(`没有插件提供工具: ${name}`));
    const handle = this.frame(pluginId);
    if (!handle) return Promise.reject(new Error(`插件 ${pluginId} 当前不在桌面`));

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
