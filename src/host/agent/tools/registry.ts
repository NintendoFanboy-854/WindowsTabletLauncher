/**
 * 工具注册表：把「宿主内置工具 + 插件通过 HostBridge 上报的工具」统一成模型能调用的函数定义。
 *
 * 注意：OpenAI 函数名规则不允许点号，而插件工具名是 `<插件id>.<动作>`（如 `clock.now`），
 * 所以这里对外暴露的名字会转义成 `clock__now`，执行时再映射回原始名。
 */

import type { AgentToolDecl, AgentTransport, AgentSettings, SourceRef } from '../types';
import { fetchPageText, readSystemTime, tavilySearch } from './web';

export const BUILTIN_TOOL_NAMES = ['web.search', 'web.fetch', 'system.time'] as const;

export interface ToolBinding {
  /** 模型看到的函数名（已转义） */
  exposedName: string;
  /** 原始工具名 */
  originalName: string;
  description: string;
  parameters: unknown;
  kind: 'builtin' | 'plugin';
}

interface BuiltinToolSpec {
  name: string;
  description: string;
  parameters: unknown;
}

const BUILTIN_TOOLS: BuiltinToolSpec[] = [
  {
    name: 'web.search',
    description:
      '联网搜索实时信息（新闻、价格、赛事、最新消息等）。返回标题、链接和摘要。简单常识问题不要调用。',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '搜索关键词，尽量具体' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'web.fetch',
    description:
      '抓取指定网页并转成纯文本（去掉导航/广告），用于深读某条搜索结果。只接受 http/https 链接。',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: '要抓取的网页地址' },
      },
      required: ['url'],
      additionalProperties: false,
    },
  },
  {
    name: 'system.time',
    description: '获取当前日期、时间、星期和时区。',
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
    });
  }

  return bindings;
}

export function findBindingByName(bindings: ToolBinding[], name: string): ToolBinding | undefined {
  return bindings.find((binding) => binding.exposedName === name);
}

export interface ToolExecutionContext {
  transport: AgentTransport;
  settings: AgentSettings;
  signal: AbortSignal;
}

export interface ToolExecutionOutcome {
  result: unknown;
  sources?: SourceRef[];
}

function readStringArg(args: unknown, key: string): string {
  if (typeof args === 'object' && args !== null) {
    const value = (args as Record<string, unknown>)[key];
    if (typeof value === 'string') return value;
  }
  return '';
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
    case 'web.search': {
      const query = readStringArg(rawArgs, 'query').trim();
      if (!query) throw new Error('web.search 缺少 query 参数');
      if (!context.settings.search.apiKey.trim()) {
        throw new Error('未配置搜索服务：请在设置 → 联网搜索里填 Tavily API Key');
      }
      const results = await context.transport.searchWeb(query, { signal: context.signal });
      return {
        result: { query, results },
        sources: results.map((item) => ({ title: item.title, url: item.url })),
      };
    }
    case 'web.fetch': {
      const url = readStringArg(rawArgs, 'url').trim();
      if (!url) throw new Error('web.fetch 缺少 url 参数');
      return { result: await context.transport.fetchPage(url, { signal: context.signal }) };
    }
    case 'system.time':
      return { result: readSystemTime() };
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
