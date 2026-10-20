/**
 * 设置持久化：`agent.settings`。
 *
 * 读取时做一次归一化（老数据缺字段、模型名失效、数值越界都收拢到合法值），
 * 写入后通过 CustomEvent 通知同页订阅者，跨窗口靠 storage 事件。
 *
 * v0.3.0 迁移（契约 §9）：
 * - `tts.readTextReplies` 取代旧的 `tts.autoPlay` / `tts.continuous`：
 *   `readTextReplies = old.tts.autoPlay === true`（continuous 是旧语音模式强制写的，不迁移）；
 * - `panelMode` 与 `face` 整块丢弃（浮空形态只有一套，人脸能力删除）。
 */

import {
  DEFAULT_SETTINGS,
  MIMO_BASE_URL,
  MIMO_MODELS,
  type AgentSettings,
  type MimoModel,
} from './types';

export const SETTINGS_STORAGE_KEY = 'agent.settings';
export const SETTINGS_EVENT = 'agent:settings-changed';

export type SettingsPatch = {
  [K in keyof AgentSettings]?: AgentSettings[K] extends object
    ? Partial<AgentSettings[K]>
    : AgentSettings[K];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pickModel(raw: unknown): MimoModel {
  return MIMO_MODELS.some((item) => item.value === raw)
    ? (raw as MimoModel)
    : DEFAULT_SETTINGS.model;
}

function clampNumber(raw: unknown, min: number, max: number, fallback: number): number {
  const value = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/** 把任意来源的 JSON 归一化成完整设置（旧字段在这里迁移/丢弃） */
export function normalizeSettings(raw: unknown): AgentSettings {
  const source = isRecord(raw) ? raw : {};
  const tts = isRecord(source.tts) ? source.tts : {};
  const search = isRecord(source.search) ? source.search : {};
  const mimo = isRecord(source.mimo) ? source.mimo : {};

  // 迁移：旧 tts.autoPlay → tts.readTextReplies；旧 continuous 不迁移（语音模式专用）
  const readTextReplies =
    typeof tts.readTextReplies === 'boolean'
      ? tts.readTextReplies
      : typeof tts.autoPlay === 'boolean'
        ? tts.autoPlay
        : DEFAULT_SETTINGS.tts.readTextReplies;

  return {
    model: pickModel(source.model),
    thinking: typeof source.thinking === 'boolean' ? source.thinking : DEFAULT_SETTINGS.thinking,
    tts: {
      readTextReplies,
      voice:
        typeof tts.voice === 'string' && tts.voice.trim()
          ? tts.voice
          : DEFAULT_SETTINGS.tts.voice,
      // 规格：0.5–2.0
      rate: clampNumber(tts.rate, 0.5, 2, DEFAULT_SETTINGS.tts.rate),
    },
    search: {
      enabled: typeof search.enabled === 'boolean' ? search.enabled : DEFAULT_SETTINGS.search.enabled,
      // max_keyword 是检索关键词数量：1-10 足以覆盖常见检索需要
      maxKeyword: Math.round(
        clampNumber(search.maxKeyword, 1, 10, DEFAULT_SETTINGS.search.maxKeyword),
      ),
      forceSearch:
        typeof search.forceSearch === 'boolean'
          ? search.forceSearch
          : DEFAULT_SETTINGS.search.forceSearch,
    },
    mimo: {
      apiKey: typeof mimo.apiKey === 'string' ? mimo.apiKey : '',
      baseUrl:
        typeof mimo.baseUrl === 'string' && mimo.baseUrl.trim()
          ? mimo.baseUrl.trim().replace(/\/+$/, '')
          : MIMO_BASE_URL,
    },
  };
}

function mergeSettings(current: AgentSettings, patch: SettingsPatch): AgentSettings {
  return normalizeSettings({
    ...current,
    ...patch,
    tts: { ...current.tts, ...patch.tts },
    search: { ...current.search, ...patch.search },
    mimo: { ...current.mimo, ...patch.mimo },
  });
}

export function readSettings(): AgentSettings {
  if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: AgentSettings): AgentSettings {
  const normalized = normalizeSettings(settings);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
  }
  return normalized;
}

/** 局部更新：深合并到已存设置并广播 */
export function updateSettings(patch: SettingsPatch): AgentSettings {
  return writeSettings(mergeSettings(readSettings(), patch));
}

export function subscribeSettings(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onCustom = () => listener();
  const onStorage = (event: StorageEvent) => {
    if (event.key === SETTINGS_STORAGE_KEY) listener();
  };
  window.addEventListener(SETTINGS_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(SETTINGS_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

/** dev-only：`?mock=1` 使用示例数据（不写进设置，产品 UI 不提供入口） */
export function isMockRequestedByUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('mock') === '1' || params.get('mock') === 'true';
}
