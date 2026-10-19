/**
 * manifest settings schema 的归一化与取值校验（契约 §2.1）。
 *
 * 三件事：
 * 1. `normalizeSettingsSchema`：把 manifest 里任意 JSON 收敛成宿主能安全渲染的结构。
 *    未知类型 / 坏 options / 重复 key 一律跳过并进 `unsupported`，由设置页提示。
 * 2. `mergeSettingsValues`：把已存配置与 schema 合并；不合法值按默认值显示并记入
 *    `invalidKeys`，schema 未声明的字段留在 `unknownKeys`（设置页原样保留）。
 * 3. `validateSettingValue`：控件提交前校验；不通过就不写 localStorage。
 *
 * 归一化不抛错：插件作者写坏 schema 只影响它自己的分区。
 */

import type { SettingOption, TimeRangeValue } from '../bridge/types';
import type {
  NormalizedEnumSetting,
  NormalizedSettingField,
  NormalizedSettingsSchema,
  NormalizedSettingGroup,
  NormalizedTextSetting,
  NormalizedTimeRangeSetting,
} from './types';

export type SettingsValues = Record<string, unknown>;

export interface SettingsMergeResult {
  /** schema 声明的字段 → 当前应显示的值（已合并默认值） */
  values: SettingsValues;
  /** 已存值不合法、当前按默认值显示的字段 key */
  invalidKeys: string[];
  /** 配置里有、schema 没声明的字段 key（保留原值，不会被设置页写坏） */
  unknownKeys: string[];
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readFinite(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** `HH:MM`（24 小时制） */
export function isTimeValue(value: unknown): value is string {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

/**
 * timeRange 值：两端都为空（未启用）或两端都是合法 HH:MM。
 * 只有一端填写视为不完整，不写入配置。
 */
export function isTimeRangeValue(value: unknown): value is TimeRangeValue {
  if (!isRecord(value)) return false;
  const { start, end } = value;
  if (typeof start !== 'string' || typeof end !== 'string') return false;
  if (start === '' && end === '') return true;
  return isTimeValue(start) && isTimeValue(end);
}

function normalizeOptions(raw: unknown): SettingOption[] {
  if (!Array.isArray(raw)) return [];
  const options: SettingOption[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    const { value } = entry;
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    if (typeof value === 'number' && !Number.isFinite(value)) continue;
    const key = String(value);
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({ value, label: readText(entry.label) ?? key });
  }
  return options;
}

function normalizeNumberField(
  record: Record<string, unknown>,
  base: { key: string; label: string; description?: string },
): NormalizedSettingField {
  let min = readFinite(record.min);
  let max = readFinite(record.max);
  // min > max 属于坏声明：丢掉范围约束，仍渲染字段（至少不会把默认值夹成 NaN）
  if (min !== undefined && max !== undefined && min > max) {
    min = undefined;
    max = undefined;
  }
  const rawStep = readFinite(record.step);
  const step = rawStep !== undefined && rawStep > 0 ? rawStep : 1;

  let defaultValue = readFinite(record.default) ?? min ?? 0;
  if (min !== undefined) defaultValue = Math.max(min, defaultValue);
  if (max !== undefined) defaultValue = Math.min(max, defaultValue);

  return {
    ...base,
    type: 'number',
    default: defaultValue,
    min,
    max,
    step,
    unit: readText(record.unit),
  };
}

function normalizeTextField(
  record: Record<string, unknown>,
  base: { key: string; label: string; description?: string },
): NormalizedTextSetting {
  const rawMaxLength = readFinite(record.maxLength);
  const maxLength =
    rawMaxLength !== undefined && Number.isInteger(rawMaxLength) && rawMaxLength > 0
      ? rawMaxLength
      : undefined;
  let defaultValue = typeof record.default === 'string' ? record.default : '';
  if (maxLength !== undefined && defaultValue.length > maxLength) {
    defaultValue = defaultValue.slice(0, maxLength);
  }
  return {
    ...base,
    type: 'text',
    default: defaultValue,
    placeholder: readText(record.placeholder),
    secret: record.secret === true,
    maxLength,
  };
}

function normalizeTimeRangeField(
  record: Record<string, unknown>,
  base: { key: string; label: string; description?: string },
): NormalizedTimeRangeSetting {
  const rawDefault = record.default;
  return {
    ...base,
    type: 'timeRange',
    default: isTimeRangeValue(rawDefault)
      ? { start: rawDefault.start, end: rawDefault.end }
      : { start: '', end: '' },
  };
}

/** 单个字段；返回 null 表示跳过（未知类型 / 缺 key / 重复 key / enum 没有合法选项） */
function normalizeSettingField(
  raw: unknown,
  seenKeys: Set<string>,
): NormalizedSettingField | null {
  if (!isRecord(raw)) return null;
  const key = readText(raw.key);
  if (!key || seenKeys.has(key)) return null;
  const type = readText(raw.type);
  const label = readText(raw.label) ?? key;
  const description = readText(raw.description);
  const base = { key, label, description };

  switch (type) {
    case 'boolean':
      return {
        ...base,
        type: 'boolean',
        default: typeof raw.default === 'boolean' ? raw.default : false,
      };
    case 'number':
      return normalizeNumberField(raw, base);
    case 'enum': {
      const options = normalizeOptions(raw.options);
      if (options.length === 0) return null;
      const declared = raw.default;
      const matched = options.find((option) => option.value === declared) ?? options[0];
      const field: NormalizedEnumSetting = {
        ...base,
        type: 'enum',
        default: matched.value,
        options,
      };
      return field;
    }
    case 'text':
      return normalizeTextField(raw, base);
    case 'timeRange':
      return normalizeTimeRangeField(raw, base);
    default:
      return null;
  }
}

/**
 * manifest.settings → 归一化 schema。
 * `raw` 不是对象时返回 undefined（= 插件没有声明设置）。
 */
export function normalizeSettingsSchema(raw: unknown): NormalizedSettingsSchema | undefined {
  if (!isRecord(raw)) return undefined;

  const groups: NormalizedSettingGroup[] = [];
  const unsupported: { key: string; type: string }[] = [];
  const seenKeys = new Set<string>();
  const seenGroupIds = new Set<string>();
  const rawGroups = Array.isArray(raw.groups) ? raw.groups : [];

  const recordUnsupported = (entry: unknown, index: number) => {
    const source = isRecord(entry) ? entry : {};
    unsupported.push({
      key: readText(source.key) ?? `field-${index}`,
      type: readText(source.type) ?? 'unknown',
    });
  };

  for (const [groupIndex, rawGroup] of rawGroups.entries()) {
    if (!isRecord(rawGroup)) continue;
    const rawFields = Array.isArray(rawGroup.fields) ? rawGroup.fields : [];
    const fields: NormalizedSettingField[] = [];
    for (const [fieldIndex, rawField] of rawFields.entries()) {
      const field = normalizeSettingField(rawField, seenKeys);
      if (!field) {
        recordUnsupported(rawField, fieldIndex + 1);
        continue;
      }
      seenKeys.add(field.key);
      fields.push(field);
    }
    if (fields.length === 0) continue;

    let id = readText(rawGroup.id) ?? `group-${groupIndex + 1}`;
    let suffix = 2;
    while (seenGroupIds.has(id)) {
      id = `${readText(rawGroup.id) ?? `group-${groupIndex + 1}`}-${suffix}`;
      suffix += 1;
    }
    seenGroupIds.add(id);
    groups.push({
      id,
      title: readText(rawGroup.title) ?? `分组 ${groupIndex + 1}`,
      hint: readText(rawGroup.hint),
      fields,
    });
  }

  const versionRaw = raw.version;
  const version =
    typeof versionRaw === 'number' && Number.isInteger(versionRaw) && versionRaw > 0
      ? versionRaw
      : 1;

  return {
    key: readText(raw.key) ?? 'settings',
    version,
    groups,
    unsupported,
  };
}

/** schema 声明的全部字段（跨分组） */
export function settingsFields(schema: NormalizedSettingsSchema): NormalizedSettingField[] {
  return schema.groups.flatMap((group) => group.fields);
}

/** 设置项总数（导航/摘要用） */
export function settingsFieldCount(schema: NormalizedSettingsSchema): number {
  return schema.groups.reduce((total, group) => total + group.fields.length, 0);
}

export function cloneSettingDefault(field: NormalizedSettingField): unknown {
  return field.type === 'timeRange' ? { ...field.default } : field.default;
}

/** 全部字段的 schema 默认值（「恢复默认」用） */
export function defaultSettingsValues(schema: NormalizedSettingsSchema): SettingsValues {
  const values: SettingsValues = {};
  for (const field of settingsFields(schema)) values[field.key] = cloneSettingDefault(field);
  return values;
}

function cloneStoredValue(field: NormalizedSettingField, value: unknown): unknown {
  return field.type === 'timeRange' && isTimeRangeValue(value)
    ? { start: value.start, end: value.end }
    : value;
}

/**
 * 已存配置 + schema → 渲染值。
 * - 缺字段用默认值；
 * - 坏值用默认值显示并记入 invalidKeys（不清洗 localStorage，只有用户改这项时才写）；
 * - 未知字段只记录，原对象保持不变（写配置时由调用方 spread 保留）。
 */
export function mergeSettingsValues(
  schema: NormalizedSettingsSchema,
  rawStored: unknown,
): SettingsMergeResult {
  const source = isRecord(rawStored) ? rawStored : {};
  const values: SettingsValues = {};
  const invalidKeys: string[] = [];
  const knownKeys = new Set<string>();

  for (const field of settingsFields(schema)) {
    knownKeys.add(field.key);
    if (!(field.key in source)) {
      values[field.key] = cloneSettingDefault(field);
      continue;
    }
    const stored = source[field.key];
    if (validateSettingValue(field, stored)) {
      values[field.key] = cloneSettingDefault(field);
      invalidKeys.push(field.key);
      continue;
    }
    values[field.key] = cloneStoredValue(field, stored);
  }

  return {
    values,
    invalidKeys,
    unknownKeys: Object.keys(source).filter((key) => !knownKeys.has(key)),
  };
}

/** 控件提交前校验；返回中文错误说明，null 表示可以写入 */
export function validateSettingValue(
  field: NormalizedSettingField,
  value: unknown,
): string | null {
  switch (field.type) {
    case 'boolean':
      return typeof value === 'boolean' ? null : '需要是开或关';
    case 'number': {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '需要是数字';
      if (field.min !== undefined && value < field.min) return `不能小于 ${field.min}`;
      if (field.max !== undefined && value > field.max) return `不能大于 ${field.max}`;
      return null;
    }
    case 'enum':
      return field.options.some((option) => option.value === value)
        ? null
        : '不是允许的选项';
    case 'text': {
      if (typeof value !== 'string') return '需要是文本';
      if (field.maxLength !== undefined && value.length > field.maxLength) {
        return `不能超过 ${field.maxLength} 个字符`;
      }
      return null;
    }
    case 'timeRange':
      return isTimeRangeValue(value) ? null : '需要完整的起止时间（HH:MM）';
    default:
      return '未知的设置类型';
  }
}
