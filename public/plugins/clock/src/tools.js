/**
 * 时钟 Agent 工具：声明与处理函数（UI 路径 ↔ 工具见 docs/components/clock.md）。
 *
 * 工具只在卡片视图用 useAgentTools 注册一次；处理函数通过 ref 读取最新设置/数据，
 * 因此设置改动或世界时钟列表变化后，下一次工具调用立即生效。
 *
 * 读写都复用与 UI 相同的数据层：
 * - `clock.settings.*` → useStoredConfig / 宿主 getConfig/setConfig
 * - `clock.world.*`    → src/world.js 的 localStorage 数据层
 */

import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  applySettingsPatch,
  describeNow,
  systemTimeZone,
} from './settings.js';
import { describeWorldPlace, worldListPayload } from './world.js';

const NO_ARGS = Object.freeze({
  type: 'object',
  properties: {},
  additionalProperties: false,
});

const PLACE_TARGET_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', description: '城市 id，如搜索结果里的 osm:node:123 / tz:Asia/Tokyo' },
    name: { type: 'string', description: '城市名，如 大阪 / Osaka' },
    tz: { type: 'string', description: 'IANA 时区，如 Asia/Tokyo' },
  },
  additionalProperties: false,
};

/** `plugin.ready` 的完整工具声明；顺序不影响调用。 */
export const CLOCK_TOOLS = Object.freeze([
  {
    name: 'clock.now',
    description: '读取系统当前时间、日期、星期、时区与本周/年内天数（只读）。',
    parameters: NO_ARGS,
  },
  {
    name: 'clock.settings.get',
    description: '读取时钟设置：hour12、showSeconds、dateFormat 及默认值（只读）。',
    parameters: NO_ARGS,
  },
  {
    name: 'clock.settings.set',
    description: '修改时钟设置（12/24 小时制、显示秒、日期格式），可只传需要改的字段。',
    parameters: {
      type: 'object',
      properties: {
        hour12: { type: 'boolean', description: 'true = 12 小时制，false = 24 小时制' },
        showSeconds: { type: 'boolean', description: '是否在卡片与详情显示秒' },
        dateFormat: {
          type: 'string',
          enum: ['zh', 'iso', 'en'],
          description: '日期格式：zh=10月18日 星期日，iso=2026-10-18，en=10/18 Sun',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'clock.world.list',
    description: '列出已添加的世界时钟城市、当地时间、今天/明天/昨天与时差（只读）。',
    parameters: NO_ARGS,
  },
  {
    name: 'clock.world.add',
    description: '添加一个世界时钟城市；必须提供 tz（IANA 时区），name/country 可选，最多 8 个。',
    parameters: PLACE_TARGET_SCHEMA,
  },
  {
    name: 'clock.world.remove',
    description: '删除一个世界时钟城市；用 id、name 或 tz 指定，匹配第一条。',
    parameters: PLACE_TARGET_SCHEMA,
  },
]);

/**
 * 生成处理函数。调用方把返回值直接交给 useAgentTools；handlers 会随每次渲染更新。
 * 预期内的失败抛 Error，useAgentTools 会转成 toolResult(ok=false)。
 */
export function createClockToolHandlers({ settings, setSettings, world }) {
  const list = (places, now) => worldListPayload(places, now, settings);

  return {
    'clock.now': () => describeNow(new Date(), settings),

    'clock.settings.get': () => ({
      settings: { ...settings },
      defaults: { ...DEFAULT_SETTINGS },
      schemaKey: SETTINGS_KEY,
      dateFormatOptions: ['zh', 'iso', 'en'],
      timeZone: systemTimeZone(),
    }),

    'clock.settings.set': (args) => {
      const result = applySettingsPatch(settings, args);
      if (result.error) throw new Error(result.error);
      setSettings(result.settings);
      return { ok: true, settings: result.settings, defaults: { ...DEFAULT_SETTINGS } };
    },

    'clock.world.list': () => {
      const now = new Date();
      return list(world.places, now);
    },

    'clock.world.add': (args) => {
      const result = world.add(args);
      if (!result.ok) throw new Error(result.error);
      const now = new Date();
      return {
        ok: true,
        added: describeWorldPlace(result.place, now, settings),
        ...list(result.places, now),
      };
    },

    'clock.world.remove': (args) => {
      const result = world.remove(args);
      if (!result.ok) throw new Error(result.error);
      const now = new Date();
      return {
        ok: true,
        removed: describeWorldPlace(result.removed, now, settings),
        ...list(result.places, now),
      };
    },
  };
}
