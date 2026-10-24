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
import { describeWorldPlace, searchCitiesForAgent, worldListPayload } from './world.js';

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
    name: 'clock.world.search',
    description:
      '搜索城市，返回候选（id / name / country / tz）。加城市前必须先搜索拿到 id。' +
      '命中本地搜索缓存直接返回（source=cache），否则联网抓并写缓存（source=network）。' +
      '联网失败返回 { ok:false, code:"offline" }，不要自己猜时区。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '城市名，至少 2 个字符，例如 大阪 / Urumqi / 乌鲁木齐',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'clock.world.add',
    description:
      '添加一个世界时钟城市（最多 8 个，同一时区只能一条）。' +
      '必须先用 clock.world.search 拿到候选，再把候选里的 name 和 tz 一起传进来；' +
      '服务端会用搜索缓存或联网结果校验城市与时区是否同一地，以搜索结果为准，' +
      '不接受自己编的城市↔时区搭配。' +
      '只传合法 IANA 时区（不传 name，如 {"tz":"Asia/Shanghai"}）时才按时区直接添加。',
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
 *
 * 失败约定：
 * - `clock.world.search` / `clock.world.add` 的**预期失败**（离线、搜不到、重复、
 *   超上限）返回 `{ ok:false, code, error }` 而非抛错：useAgentTools 只在抛错时
 *   把消息压成一行文本，`code` 会丢；返回结构化体才能让模型看到 code 并自我纠正。
 * - 其它工具（如 settings.set / world.remove 的既有行为）仍抛 Error。
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

    'clock.world.search': async (args) => {
      const query = typeof args?.query === 'string' ? args.query.trim() : '';
      const result = await searchCitiesForAgent(query);
      if (!result.ok) return { ok: false, code: result.code, error: result.error, query };
      return {
        ok: true,
        source: result.source,
        query,
        count: result.places.length,
        candidates: result.places.map((place) => ({
          id: place.id,
          name: place.name,
          country: place.country,
          tz: place.tz,
        })),
        hint:
          result.places.length > 0
            ? '把候选里的 name 和 tz 一起传给 clock.world.add（或直接传该候选的 id）'
            : '没有找到匹配的城市；换个关键词再搜，或只传 IANA 时区给 clock.world.add',
      };
    },

    'clock.world.add': async (args) => {
      const result = await world.addVerified(args);
      if (!result.ok) {
        // 结构化失败：保留 code 供模型自我纠正（抛错会被 useAgentTools 压成一行文本）。
        return {
          ok: false,
          code: result.code ?? 'invalid',
          error: result.error,
          count: result.places ? result.places.length : undefined,
        };
      }
      const now = new Date();
      return {
        ok: true,
        source: result.source,
        added: describeWorldPlace(result.place, now, settings),
        note: result.note,
        requestedTz: result.requestedTz,
        tzAdjusted: result.tzAdjusted,
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
