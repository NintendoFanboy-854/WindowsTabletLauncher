/**
 * 待办设置模型（纯 JS，不依赖 React）。
 *
 * 设置项全部声明在 manifest.json 的 settings schema 里，由宿主设置页通用渲染并
 * 即时写入 `plugin.todo.settings`；插件只保留默认值与 normalize 兜底
 * （PLUGIN-CONTRACT §2.1 / docs/components/todo.md「设置 schema」）。
 *
 * 动态数据（清单、默认清单）不进 schema：默认清单放在 `todo.settings.defaultListId`，
 * 由详情·清单管理维护（docs/components/todo.md）。
 */

import { plugin } from '/plugin-sdk.js';
import { SORTS } from './store.js';

/** 宿主配置键（manifest.settings.key 必须一致） */
export const SETTINGS_KEY = 'settings';

/** schema 默认值；宿主写入缺字段/坏值时按这里兜底 */
export const DEFAULT_SETTINGS = {
  showCompleted: true,
  defaultSort: 'manual',
  fontSize: 'default',
  weekStart: 1,
};

export const SORT_OPTIONS = SORTS.map((sort) => ({ value: sort.value, label: sort.label }));

export const FONT_SIZE_OPTIONS = [
  { value: 'default', label: '默认' },
  { value: 'large', label: '大' },
];

export const WEEK_START_OPTIONS = [
  { value: 1, label: '周一' },
  { value: 0, label: '周日' },
];

const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value));

/** 宿主配置可能是旧数据/部分字段：收敛成完整设置，非法值回落默认 */
export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    showCompleted:
      typeof source.showCompleted === 'boolean' ? source.showCompleted : DEFAULT_SETTINGS.showCompleted,
    defaultSort: SORT_VALUES.has(source.defaultSort) ? source.defaultSort : DEFAULT_SETTINGS.defaultSort,
    fontSize: source.fontSize === 'large' ? 'large' : 'default',
    weekStart: source.weekStart === 0 ? 0 : 1,
  };
}

/**
 * 单字段校验（与 host 的 validateSettingValue 同口径）；返回中文错误或 null。
 * Agent 工具 `todo.settings.set` 用它先校验再写，避免把坏值写进宿主配置。
 */
export function validateSetting(key, value) {
  switch (key) {
    case 'showCompleted':
      return typeof value === 'boolean' ? null : 'showCompleted 需要是布尔值';
    case 'defaultSort':
      return SORT_VALUES.has(value) ? null : `defaultSort 只能是 ${[...SORT_VALUES].join(' / ')}`;
    case 'fontSize':
      return value === 'default' || value === 'large' ? null : 'fontSize 只能是 default / large';
    case 'weekStart':
      return value === 0 || value === 1 ? null : 'weekStart 只能是 0（周日）或 1（周一）';
    default:
      return `未知设置项 ${key}`;
  }
}

/** 字号设置：只切换 Fluent type ramp 档位（+100），不做连续缩放 */
export function textSizeFor(settings, baseSize) {
  const bump = settings?.fontSize === 'large' ? 100 : 0;
  return Math.min(600, baseSize + bump);
}

/** 读取宿主配置（independent iframe 下 SDK 用 localStorage 兜底） */
export async function readHostSettings() {
  let stored;
  try {
    stored = await plugin.getConfig(SETTINGS_KEY);
  } catch {
    stored = undefined;
  }
  return normalizeSettings(stored);
}

/**
 * 写宿主配置：先读当前值合并，保证只改目标字段、不覆盖未知字段。
 * @param {Record<string, unknown>} patch
 */
export async function writeHostSettings(patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    throw new Error('settings.set 需要对象参数');
  }
  const keys = Object.keys(patch);
  if (keys.length === 0) throw new Error('没有要修改的设置项');
  for (const key of keys) {
    const error = validateSetting(key, patch[key]);
    if (error) throw new Error(error);
  }
  let current = {};
  try {
    const stored = await plugin.getConfig(SETTINGS_KEY);
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) current = stored;
  } catch {
    current = {};
  }
  const next = { ...current, ...patch };
  await plugin.setConfig(SETTINGS_KEY, next);
  return normalizeSettings(next);
}
