/**
 * 工具注册表：把「宿主内置工具 + 插件通过 HostBridge 上报的工具」统一成模型能调用的函数定义。
 *
 * 注意：
 * - OpenAI 函数名规则不允许点号，而插件工具名是 `<插件id>.<动作>`（如 `clock.now`），
 *   所以这里对外暴露的名字会转义成 `clock__now`，执行时再映射回原始名。
 * - 联网搜索是 MiMo 原生 `web_search`，不是函数工具，不在这里注册（见 transport/real.ts）。
 */

import type { AgentToolDecl, AgentTransport } from '../types';
import {
  btConnectTool,
  btDevicesTool,
  btDisconnectTool,
  btStatusTool,
} from '../../system/bluetoothTools';

export const BUILTIN_TOOL_NAMES = [
  'system.time',
  'btAudio.status',
  'btAudio.devices',
  'btAudio.connect',
  'btAudio.disconnect',
] as const;

export interface ToolBinding {
  /** 模型看到的函数名（已转义） */
  exposedName: string;
  /** 原始工具名 */
  originalName: string;
  description: string;
  parameters: unknown;
  kind: 'builtin' | 'plugin';
  /**
   * 用户整句命中其中一条时，宿主直接执行该工具。
   * 只认整句（忽略空白与标点），避免把「我坐下了之后怎么算？」误判成动作。
   */
  phrases: string[];
}

interface BuiltinToolSpec {
  name: string;
  description: string;
  parameters: unknown;
}

const BUILTIN_TOOLS: BuiltinToolSpec[] = [
  {
    name: 'system.time',
    description: '获取当前日期、时间、星期和时区。',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'btAudio.status',
    description:
      '读取蓝牙音箱状态：蓝牙是否可用、当前连接或串流中的设备、自动连接状态（是否暂停/退避）、首选设备与最近错误。',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'btAudio.devices',
    description:
      '列出已配对、可用作音频接收的蓝牙设备，按自动连接顺序排列，并给出首选设备 preferredDeviceId 与自动连接状态。',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'btAudio.connect',
    description:
      '把平板连接到蓝牙设备并开始接收手机音频。可用 deviceName 精确匹配，或直接给 deviceId；都不给时连接首选设备。手动连接不会修改首选设备。',
    parameters: {
      type: 'object',
      properties: {
        deviceId: { type: 'string', description: '设备 id（优先于 deviceName）' },
        deviceName: { type: 'string', description: '设备名称，精确匹配' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'btAudio.disconnect',
    description:
      '断开当前蓝牙音频接收连接。手动断开后自动连接会暂停，直到再次手动连接或恢复自动连接。',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
];

/** OpenAI 函数名只允许字母、数字、下划线和短横线 */
export function sanitizeToolName(name: string): string {
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, '__');
  return safe.length > 64 ? safe.slice(0, 64) : safe;
}

export function buildToolBindings(pluginTools: AgentToolDecl[]): ToolBinding[] {
  const bindings: ToolBinding[] = [];
  const used = new Set<string>();

  const uniqueName = (originalName: string): string => {
    const base = sanitizeToolName(originalName) || 'tool';
    let candidate = base;
    let index = 2;
    while (used.has(candidate)) {
      const suffix = `__${index}`;
      candidate = `${base.slice(0, 64 - suffix.length)}${suffix}`;
      index += 1;
    }
    used.add(candidate);
    return candidate;
  };

  for (const builtin of BUILTIN_TOOLS) {
    bindings.push({
      exposedName: uniqueName(builtin.name),
      originalName: builtin.name,
      description: builtin.description,
      parameters: builtin.parameters,
      kind: 'builtin',
      phrases: [],
    });
  }

  for (const tool of pluginTools) {
    if (!tool.name || BUILTIN_TOOL_NAMES.includes(tool.name as (typeof BUILTIN_TOOL_NAMES)[number])) {
      continue;
    }
    bindings.push({
      exposedName: uniqueName(tool.name),
      originalName: tool.name,
      // HostBridge 当前只保留工具名；描述缺失时给模型一个可用的兜底
      description: tool.description?.trim() || `插件工具 ${tool.name}（具体能力由插件提供）`,
      parameters: (tool.parameters as unknown) ?? {
        type: 'object',
        properties: {},
        additionalProperties: true,
      },
      kind: 'plugin',
      phrases: Array.isArray(tool.phrases)
        ? tool.phrases.filter((phrase): phrase is string => typeof phrase === 'string' && phrase.trim() !== '')
        : [],
    });
  }

  return bindings;
}

/** 整句比较用：去掉空白与标点，大小写归一 */
export function normalizeUtterance(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '')
    .replace(/[，。！？、；：,.!?;:'"“”‘’（）()【】[\]…—–_~-]/g, '');
}

/**
 * 找到「用户整句 == 工具短语」的绑定。
 * 只在整句完全一致时命中：状态报告要确定，但带助词/疑问的长句仍交给模型判断。
 */
export function matchPhraseTool(bindings: ToolBinding[], text: string): ToolBinding | undefined {
  const normalized = normalizeUtterance(text);
  if (!normalized) return undefined;
  let matched: ToolBinding | undefined;
  let matchedLength = 0;
  for (const binding of bindings) {
    if (binding.kind !== 'plugin') continue;
    for (const phrase of binding.phrases) {
      if (normalizeUtterance(phrase) !== normalized) continue;
      if (phrase.length > matchedLength) {
        matched = binding;
        matchedLength = phrase.length;
      }
    }
  }
  return matched;
}

export function findBindingByName(bindings: ToolBinding[], name: string): ToolBinding | undefined {
  return bindings.find((binding) => binding.exposedName === name);
}

export interface ToolExecutionContext {
  transport: AgentTransport;
  signal: AbortSignal;
}

export interface ToolExecutionOutcome {
  result: unknown;
}

/** 执行一次工具调用；失败直接 throw，由会话层把错误文本回给模型 */
export async function executeTool(
  binding: ToolBinding | undefined,
  exposedName: string,
  rawArgs: unknown,
  context: ToolExecutionContext,
): Promise<ToolExecutionOutcome> {
  if (!binding) throw new Error(`没有名为 ${exposedName} 的工具（可能是插件未加载）`);

  if (binding.kind === 'plugin') {
    return {
      result: await context.transport.callPluginTool(binding.originalName, rawArgs, {
        signal: context.signal,
      }),
    };
  }

  switch (binding.originalName) {
    case 'system.time':
      return { result: readSystemTime() };
    case 'btAudio.status':
      return { result: await btStatusTool() };
    case 'btAudio.devices':
      return { result: await btDevicesTool() };
    case 'btAudio.connect': {
      const args =
        rawArgs && typeof rawArgs === 'object' ? (rawArgs as Record<string, unknown>) : {};
      return { result: await btConnectTool(args) };
    }
    case 'btAudio.disconnect':
      return { result: await btDisconnectTool() };
    default:
      throw new Error(`未知内置工具：${binding.originalName}`);
  }
}

/** 工具参数摘要，给面板卡片显示 */
export function summarizeToolArgs(args: unknown): string {
  if (args === null || args === undefined) return '无参数';
  if (typeof args === 'string') return args.length > 80 ? `${args.slice(0, 80)}…` : args;
  try {
    const text = JSON.stringify(args);
    return text.length > 80 ? `${text.slice(0, 80)}…` : text;
  } catch {
    return String(args);
  }
}

/** 工具结果摘要，给面板卡片显示 */
export function summarizeToolResult(result: unknown): string {
  if (result === undefined || result === null) return '（无返回内容）';
  if (typeof result === 'string') return result;
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return String(result);
  }
}

/** system.time 的返回值 */
export function readSystemTime(): {
  iso: string;
  local: string;
  date: string;
  weekday: string;
  timeZone: string;
} {
  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '本地时区';
  return {
    iso: now.toISOString(),
    local: now.toLocaleString('zh-CN', { hour12: false }),
    date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    weekday: now.toLocaleDateString('zh-CN', { weekday: 'long' }),
    timeZone,
  };
}
