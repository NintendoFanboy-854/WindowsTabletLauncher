/**
 * 模板插件的演示配置与 Agent 工具声明。
 *
 * 复制模板后先改这里的 key / 工具名与文案，再改 manifest.json 的 id/name/widget。
 * 设置 schema 只在 manifest.json 声明；本文件只做默认值与读配置后的 normalize 兜底。
 */

export const SETTINGS_KEY = 'settings';

/** manifest.settings 的默认值；schema 的 default 也要同步改。 */
export const DEFAULT_SETTINGS = Object.freeze({
  showHint: true,
  unit: '项',
  step: 1,
});

/** 与 manifest 的 enum options 保持一致。 */
const UNIT_VALUES = ['项', '次', '条'];

export function normalizeSettings(value) {
  const source = value && typeof value === 'object' ? value : {};
  const step = Number(source.step);
  return {
    showHint: typeof source.showHint === 'boolean' ? source.showHint : DEFAULT_SETTINGS.showHint,
    unit: UNIT_VALUES.includes(source.unit) ? source.unit : DEFAULT_SETTINGS.unit,
    step: Number.isFinite(step)
      ? Math.min(5, Math.max(1, Math.round(step)))
      : DEFAULT_SETTINGS.step,
  };
}

/** 宿主用 `[列, 行]` 帧尺寸映射成档位字符串。 */
export function sizeKeyOf(size) {
  return `${size[0]}x${size[1]}`;
}

/**
 * 最小 Agent 对等示例：只读摘要。
 *
 * 模板刻意只注册这一条工具，用来演示 plugin.ready 声明 + useAgentTools 路由。
 * 复制模板后，给每一个用户可执行操作补同名动词工具（尤其是写操作），
 * 并在 README 的「UI 路径 ↔ 工具」表里逐条列出。
 */
export const SUMMARY_TOOL = Object.freeze({
  name: 'template.summary',
  description: '读取模板卡片当前摘要（只读，不修改任何配置或数据）',
  parameters: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
});

export function describeSummary(count, settings) {
  return {
    count,
    unit: settings.unit,
    step: settings.step,
    showHint: settings.showHint,
    summary: `模板示例已完成 ${count} ${settings.unit}；快捷按钮每次增加 ${settings.step} ${settings.unit}`,
  };
}
