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
 *
 * v0.4.x 新增：`panel.idleCollapseSeconds`（面板空闲自动收回档位，0 = 关闭，默认 10）。
 * 老存档没有这个字段，归一化时补默认值；取值只认 `IDLE_COLLAPSE_PRESETS`，不用第二个 storage 键。
 */

import {
  DEFAULT_SETTINGS,
  IDLE_COLLAPSE_DEFAULT_SECONDS,
  IDLE_COLLAPSE_PRESETS,
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

/**
 * 空闲自动收回档位：只接受 `IDLE_COLLAPSE_PRESETS` 里的值（0/5/10/30/60）。
 * 老存档没有该字段、被手改成越界值或不是数字时，一律回落到默认档（10 秒）——
 * 不做「就近取档」，避免一次手改让行为悄悄变成另一个秒数。
 *
 * 只认「数字」或「非空数字字符串」：`Number(null)` / `Number('')` / `Number(false)`
 * 都是 0，若直接转数字，一个坏值会被静默解释成「关闭自动收回」。
 */
function pickIdleCollapseSeconds(raw: unknown): number {
  const value =
    typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() ? Number(raw) : Number.NaN;
  return (IDLE_COLLAPSE_PRESETS as readonly number[]).includes(value)
    ? value
    : IDLE_COLLAPSE_DEFAULT_SECONDS;
}

/** 把任意来源的 JSON 归一化成完整设置（旧字段在这里迁移/丢弃） */
export function normalizeSettings(raw: unknown): AgentSettings {
  const source = isRecord(raw) ? raw : {};
  const tts = isRecord(source.tts) ? source.tts : {};
  const search = isRecord(source.search) ? source.search : {};
  const mimo = isRecord(source.mimo) ? source.mimo : {};
  const panel = isRecord(source.panel) ? source.panel : {};

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
      // 自动朗读总开关：旧版本默认有自动朗读行为，迁移时保持开启；用户可在头部/设置里静音
      autoRead:
        typeof tts.autoRead === 'boolean' ? tts.autoRead : DEFAULT_SETTINGS.tts.autoRead,
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
    panel: {
      // 向后兼容：老存档没有 panel.idleCollapseSeconds → 默认 10 秒
      idleCollapseSeconds: pickIdleCollapseSeconds(panel.idleCollapseSeconds),
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
    panel: { ...current.panel, ...patch.panel },
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
