/**
 * 设置持久化：`agent.settings`。
 *
 * 读取时做一次归一化（老数据缺字段、模型名失效、数值越界都收拢到合法值），
 * 写入后通过 CustomEvent 通知同页订阅者，跨窗口靠 storage 事件。
 */

import {
  DEFAULT_SETTINGS,
  MIMO_BASE_URL,
  MIMO_MODELS,
  type AgentSettings,
  type MimoModel,
  type PanelMode,
} from './types';

export const SETTINGS_STORAGE_KEY = 'agent.settings';
export const SETTINGS_EVENT = 'agent:settings-changed';

export type SettingsPatch = {
  [K in keyof AgentSettings]?: AgentSettings[K] extends object
    ? Partial<AgentSettings[K]>
    : AgentSettings[K];
};

const PANEL_MODES: PanelMode[] = ['overlay', 'sidebar', 'fullscreen'];

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

function normalizeDescriptors(raw: unknown): number[][] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is number[] => Array.isArray(item) && item.length > 0)
    .map((item) => item.map((value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)))
    .filter((item) => item.length >= 32); // face-api 的 128 维描述子；短于此的样本不可用
}

/** 把任意来源的 JSON 归一化成完整设置 */
export function normalizeSettings(raw: unknown): AgentSettings {
  const source = isRecord(raw) ? raw : {};
  const tts = isRecord(source.tts) ? source.tts : {};
  const face = isRecord(source.face) ? source.face : {};
  const search = isRecord(source.search) ? source.search : {};
  const mimo = isRecord(source.mimo) ? source.mimo : {};

  const panelMode =
    PANEL_MODES.find((mode) => mode === source.panelMode) ?? DEFAULT_SETTINGS.panelMode;

  return {
    model: pickModel(source.model),
    panelMode,
    thinking: typeof source.thinking === 'boolean' ? source.thinking : DEFAULT_SETTINGS.thinking,
    tts: {
      autoPlay: typeof tts.autoPlay === 'boolean' ? tts.autoPlay : DEFAULT_SETTINGS.tts.autoPlay,
      continuous:
        typeof tts.continuous === 'boolean' ? tts.continuous : DEFAULT_SETTINGS.tts.continuous,
      voice:
        typeof tts.voice === 'string' && tts.voice.trim()
          ? tts.voice
          : DEFAULT_SETTINGS.tts.voice,
      // 规格：0.5–2.0
      rate: clampNumber(tts.rate, 0.5, 2, DEFAULT_SETTINGS.tts.rate),
    },
    face: {
      enabled: typeof face.enabled === 'boolean' ? face.enabled : DEFAULT_SETTINGS.face.enabled,
      descriptors: normalizeDescriptors(face.descriptors),
      // face-api 的欧氏距离在 0–1 区间，默认 0.5（规格）
      threshold: clampNumber(face.threshold, 0.05, 1, DEFAULT_SETTINGS.face.threshold),
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
    face: { ...current.face, ...patch.face },
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
