/**
 * 尺寸档位字段表（system-owned 的「哪一档显示哪些字段」）。
 *
 * 插件不再为每个尺寸档各写一套 `if (compact) ... else if (large) ...`，
 * 而是把字段表声明成数据、渲染时查表：
 *
 *   import { defineSizeFields } from '../../_shared/sizes.js';
 *
 *   const CARD_FIELDS = defineSizeFields(
 *     {
 *       '1x1': { identity: 'compact', seconds: false, worldClocks: 0 },
 *       '2x1': { identity: 'full', seconds: true, worldClocks: 0 },
 *       '3x2': { identity: 'full', seconds: true, worldClocks: 3 },
 *     },
 *     { defaultSizeKey: '2x1' },
 *   );
 *
 *   const fields = CARD_FIELDS.fieldsFor(sizeKey);   // 未知档 → 默认档
 *   fields.seconds;                                  // 布尔/枚举/计数都由插件定义
 *
 * 约束（DENSITY §2.1-4）：相邻档的字段项数必须递增。用 `countFor(size)` 自检，
 * 不要在组件里散落 `size === '3x2'` 判断。
 */

/** 宿主网格允许的档位 key：宽 1–4 × 高 1–3（与 manifest.sizes 同一坐标系） */
export const SIZE_KEYS = Object.freeze(['1x1', '2x1', '1x2', '2x2', '3x2', '3x3', '4x2']);

const SIZE_KEY_PATTERN = /^[1-4]x[1-3]$/;

/**
 * 宿主尺寸 → 档位 key。
 *
 * 接受 `'2x2'`、`[2, 2]`（host size 数组）、`{ columns, rows }` / `{ width, height }` /
 * `{ w, h }`（布局对象）。不是合法档位时返回 fallback，不抛错（宿主尺寸是外部输入）。
 *
 * @param {string|number[]|{columns?:number,rows?:number,width?:number,height?:number,w?:number,h?:number}} size
 * @param {string} [fallback='2x1']
 * @returns {string}
 */
export function sizeKeyOf(size, fallback = '2x1') {
  if (typeof size === 'string') {
    const key = size.trim().toLowerCase().replace('×', 'x');
    return SIZE_KEY_PATTERN.test(key) ? key : fallback;
  }

  let width;
  let height;
  if (Array.isArray(size)) {
    [width, height] = size;
  } else if (size && typeof size === 'object') {
    width = size.columns ?? size.cols ?? size.width ?? size.w;
    height = size.rows ?? size.row ?? size.height ?? size.h;
  }

  const w = Number(width);
  const h = Number(height);
  if (!Number.isInteger(w) || !Number.isInteger(h)) return fallback;
  const key = `${w}x${h}`;
  return SIZE_KEY_PATTERN.test(key) ? key : fallback;
}

/**
 * 声明一张尺寸档位字段表，返回带查询方法的只读对象。
 *
 * - key 必须是宿主网格里存在的档位（`SIZE_KEYS`），否则抛 `RangeError`：
 *   拼错档位会让整档退回默认字段集，属于静默降级，不允许。
 * - `defaultSizeKey` 不在表里同样抛错；缺省优先 `2x1`，否则取第一个 key。
 * - 表与每档字段集都 `Object.freeze`，插件运行时改不动共享事实。
 *
 * 返回对象：
 * - `keys`：按声明顺序的档位数组；
 * - `table`：冻结后的字段表；
 * - `defaultSizeKey`；
 * - `has(key)`：是否声明了该档；
 * - `fieldsFor(sizeOrKey)`：查表；非法/未声明的尺寸按默认档；
 * - `countFor(sizeOrKey)`：该档字段项数（自检相邻档递增用）。
 *
 * @param {Record<string, Record<string, unknown>>} table
 * @param {{defaultSizeKey?: string}} [options]
 */
export function defineSizeFields(table, options = {}) {
  if (!table || typeof table !== 'object' || Array.isArray(table)) {
    throw new TypeError('[sizes] defineSizeFields 需要对象表：{ "1x1": {...}, ... }');
  }

  const keys = Object.keys(table);
  if (keys.length === 0) {
    throw new TypeError('[sizes] defineSizeFields 的字段表为空');
  }

  for (const key of keys) {
    if (!SIZE_KEYS.includes(key)) {
      throw new RangeError(`[sizes] 非法尺寸档 key：「${key}」。只允许 ${SIZE_KEYS.join(' / ')}。`);
    }
    const fields = table[key];
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
      throw new TypeError(`[sizes] 档位「${key}」的字段集必须是对象`);
    }
  }

  const defaultSizeKey =
    options.defaultSizeKey ?? (keys.includes('2x1') ? '2x1' : keys[0]);
  if (!keys.includes(defaultSizeKey)) {
    throw new RangeError(
      `[sizes] defaultSizeKey「${defaultSizeKey}」不在字段表里（${keys.join(' / ')}）`,
    );
  }

  const frozenTable = {};
  for (const key of keys) {
    frozenTable[key] = Object.freeze({ ...table[key] });
  }
  Object.freeze(frozenTable);

  const has = (key) => Object.prototype.hasOwnProperty.call(frozenTable, key);
  const fieldsFor = (sizeOrKey) => {
    const key =
      typeof sizeOrKey === 'string' && has(sizeOrKey)
        ? sizeOrKey
        : sizeKeyOf(sizeOrKey, defaultSizeKey);
    return frozenTable[key] ?? frozenTable[defaultSizeKey];
  };

  return Object.freeze({
    keys: Object.freeze([...keys]),
    table: frozenTable,
    defaultSizeKey,
    has,
    fieldsFor,
    countFor: (sizeOrKey) => Object.keys(fieldsFor(sizeOrKey)).length,
  });
}
