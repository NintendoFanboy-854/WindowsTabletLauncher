/** 待办设置模型（纯 JS，不依赖 React）。持久化走宿主配置（plugin.getConfig/setConfig）。 */

import { SORTS } from '../js/store.js';

export const CONFIG_KEY = 'settings';

export const DEFAULT_CONFIG = {
  defaultListId: null,
  showCompleted: true,
  defaultSort: 'manual',
  fontSize: 'default', // 'default' | 'large'
  weekStart: 1, // 1 = 周一，0 = 周日
};

export const FONT_SIZE_OPTIONS = [
  { value: 'default', label: '默认' },
  { value: 'large', label: '大' },
];

export const WEEK_START_OPTIONS = [
  { value: 1, label: '周一' },
  { value: 0, label: '周日' },
];

export const SORT_OPTIONS = SORTS.map((sort) => ({ value: sort.value, label: sort.label }));

/** 宿主配置可能是旧数据/部分字段：收敛成完整设置，非法值回落默认 */
export function normalizeConfig(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    defaultListId: typeof source.defaultListId === 'string' && source.defaultListId ? source.defaultListId : null,
    showCompleted: typeof source.showCompleted === 'boolean' ? source.showCompleted : DEFAULT_CONFIG.showCompleted,
    defaultSort: SORTS.some((sort) => sort.value === source.defaultSort) ? source.defaultSort : DEFAULT_CONFIG.defaultSort,
    fontSize: source.fontSize === 'large' ? 'large' : 'default',
    weekStart: source.weekStart === 0 ? 0 : 1,
  };
}

/** 字号设置：只切换 Fluent type ramp 档位（100 的整数倍），不做连续缩放 */
export function textSizeFor(config, baseSize) {
  const bump = config?.fontSize === 'large' ? 100 : 0;
  return Math.min(1000, baseSize + bump);
}
