/**
 * 声音设置：`wtsl.audio`。
 *
 * 只管「语音输入 / 朗读时压低音乐」这几个行为参数，与 `agent.settings` 分开存：
 * - `voiceGain` / `ttsGain` 是压低后的增益百分比（0–100，0 = 静音），只认档位白名单；
 * - `conflictPolicy` 是双音源 FIFO 冲突处理的开关（`fifo` / `off`）：设置页切换与 App 启动都会同步给宿主（`audio_focus_set_fifo`）；
 * - 写入后派发 `wtsl:audio-settings-changed`，设置页同一页内即时同步。
 *
 * 读取时做一次归一化：坏 JSON、缺字段、越界档位都收拢到合法值；不做 Hook，调用方直接读。
 */

export const AUDIO_SETTINGS_KEY = 'wtsl.audio';
export const AUDIO_SETTINGS_EVENT = 'wtsl:audio-settings-changed';
/** 存储结构版本（后续格式变化时用于迁移）；当前只有 v1。 */
export const AUDIO_SETTINGS_VERSION = 1;

/** 压低档位白名单：0 = 静音。 */
export const AUDIO_GAIN_PRESETS: readonly number[] = [50, 30, 20, 10, 0];

export type ConflictPolicy = 'fifo' | 'off';

export interface AudioSettings {
  /** 语音输入（录音）时压低其他应用的音频 */
  duckVoice: boolean;
  /** 录音时压低到 0–100（默认 20） */
  voiceGain: number;
  /** 朗读（TTS）时压低其他应用的音频 */
  duckTts: boolean;
  /** 朗读时压低到 0–100（默认 20） */
  ttsGain: number;
  /** 双音源同时播放时的处理方式（fifo = 后播优先并压制先播方；off = 不处理） */
  conflictPolicy: ConflictPolicy;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  duckVoice: true,
  voiceGain: 20,
  duckTts: true,
  ttsGain: 20,
  conflictPolicy: 'fifo',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * 压低档位：只接受 `AUDIO_GAIN_PRESETS` 里的值，越界/坏值回默认 20。
 *
 * 只认「数字」或「非空数字字符串」：`Number(null)` / `Number('')` / `Number(false)` 都是 0，
 * 若直接转数字，一个坏值会被静默解释成「静音」。
 */
function pickGain(raw: unknown): number {
  const value =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string' && raw.trim()
        ? Number(raw)
        : Number.NaN;
  return AUDIO_GAIN_PRESETS.includes(value)
    ? value
    : DEFAULT_AUDIO_SETTINGS.voiceGain;
}

function pickBoolean(raw: unknown, fallback: boolean): boolean {
  return typeof raw === 'boolean' ? raw : fallback;
}

function pickConflictPolicy(raw: unknown): ConflictPolicy {
  return raw === 'off' ? 'off' : 'fifo';
}

/** 把任意来源的 JSON 归一化成完整声音设置（老存档 / 手改坏值都收拢到合法值）。 */
function normalizeAudioSettings(raw: unknown): AudioSettings {
  const source = isRecord(raw) ? raw : {};
  return {
    duckVoice: pickBoolean(source.duckVoice, DEFAULT_AUDIO_SETTINGS.duckVoice),
    voiceGain: pickGain(source.voiceGain),
    duckTts: pickBoolean(source.duckTts, DEFAULT_AUDIO_SETTINGS.duckTts),
    ttsGain: pickGain(source.ttsGain),
    conflictPolicy: pickConflictPolicy(source.conflictPolicy),
  };
}

/** 读声音设置；没有存档 / 坏 JSON / localStorage 不可用都回默认值。 */
export function readAudioSettings(): AudioSettings {
  try {
    if (typeof localStorage === 'undefined') {
      return { ...DEFAULT_AUDIO_SETTINGS };
    }
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_AUDIO_SETTINGS };
    return normalizeAudioSettings(JSON.parse(raw));
  } catch {
    // 隐私模式 / 站点存储被禁用时 localStorage 的访问本身就会抛错。
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
}

/**
 * 局部更新声音设置：归一化后写 localStorage 并派发变更事件。
 *
 * 无保存按钮的项目约定：控件 onChange 直接调用这里。存储写失败（隐私模式/配额）时
 * 仍返回归一化结果，让当前页面照常生效，只是刷新后回到旧值。
 */
export function writeAudioSettings(patch: Partial<AudioSettings>): AudioSettings {
  const normalized = normalizeAudioSettings({ ...readAudioSettings(), ...patch });
  // 存储写失败（隐私模式/配额）不影响本次会话内的设置；事件仍然要派发，页面才能即时同步。
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        AUDIO_SETTINGS_KEY,
        JSON.stringify({ version: AUDIO_SETTINGS_VERSION, ...normalized }),
      );
    }
  } catch {
    // 下次刷新回落到旧值。
  }
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUDIO_SETTINGS_EVENT));
    }
  } catch {
    // 没有 window / 事件被禁用时静默忽略。
  }
  return normalized;
}
