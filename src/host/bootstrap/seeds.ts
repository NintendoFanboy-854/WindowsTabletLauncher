/**
 * 本地密钥注入：从 `public/secrets.json`（已 gitignore，不进仓库）把 API Key 写进 localStorage。
 *
 * - 只在 localStorage 里对应字段为空时写入，不覆盖用户在设置页填过的值；
 * - 天气插件与 Agent 都从 localStorage 读配置，所以这里写的是它们各自的存储键；
 * - 启动时先应用种子再渲染界面，避免插件 iframe 用空配置初始化。
 */

// 插件配置走宿主桥接层，键名是 `plugin.<插件 id>.<key>`；天气插件读写的是 `settings`。
const WEATHER_KEY = 'plugin.weather.settings';
const AGENT_KEY = 'agent.settings';

interface Seeds {
  weather?: { apiHost?: string; apiKey?: string };
  mimo?: { apiKey?: string; baseUrl?: string };
  search?: { provider?: string; apiKey?: string };
}

type Json = Record<string, unknown>;

function isJson(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readJson(key: string): Json {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '{}');
    return isJson(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeJson(key: string, value: Json): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 隐私模式 / 存储被禁用时忽略 */
  }
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function applySeeds(): Promise<void> {
  let seeds: Seeds;
  try {
    const response = await fetch('/secrets.json', { cache: 'no-store' });
    if (!response.ok) return;
    const parsed: unknown = await response.json();
    if (!isJson(parsed)) return;
    seeds = parsed as Seeds;
  } catch {
    return;
  }

  if (seeds.weather) {
    const current = readJson(WEATHER_KEY);
    const next: Json = { ...current };
    if (!nonEmpty(current.apiHost) && nonEmpty(seeds.weather.apiHost)) next.apiHost = seeds.weather.apiHost;
    if (!nonEmpty(current.apiKey) && nonEmpty(seeds.weather.apiKey)) next.apiKey = seeds.weather.apiKey;
    if (JSON.stringify(next) !== JSON.stringify(current)) writeJson(WEATHER_KEY, next);
  }

  if (seeds.mimo || seeds.search) {
    const current = readJson(AGENT_KEY);
    const next: Json = { ...current };

    if (seeds.mimo) {
      const mimo = isJson(current.mimo) ? { ...current.mimo } : {};
      if (!nonEmpty(mimo.apiKey) && nonEmpty(seeds.mimo.apiKey)) mimo.apiKey = seeds.mimo.apiKey;
      if (!nonEmpty(mimo.baseUrl) && nonEmpty(seeds.mimo.baseUrl)) mimo.baseUrl = seeds.mimo.baseUrl;
      next.mimo = mimo;
    }

    if (seeds.search && nonEmpty(seeds.search.apiKey)) {
      const search = isJson(current.search) ? { ...current.search } : {};
      if (!nonEmpty(search.apiKey)) {
        search.apiKey = seeds.search.apiKey;
        if (nonEmpty(seeds.search.provider)) search.provider = seeds.search.provider;
      }
      next.search = search;
    }

    if (JSON.stringify(next) !== JSON.stringify(current)) writeJson(AGENT_KEY, next);
  }
}
