/**
 * 插件设置表单（E1）：按 manifest.settings schema 渲染，宿主不认识任何具体插件。
 *
 * 版式沿用设置页 token（DESIGN §8 / 契约 §2.1）：
 * - 内容 max-width 720 居中；section 标题 20 semibold、说明 12 fg3；
 * - 行高 48、控件 40（Input/Button/Radio 都用 size="large"）；
 * - 即时保存：控件变更/失焦即写 `plugin.<pluginId>.<schema.key>`；
 * - 底部「恢复默认」在左、「保存」在右（保存是羡余：再写一次并 Toast，不跳转）；
 * - 未知字段/坏数据只提示，不写坏配置。
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Dropdown,
  Input,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Option,
  Radio,
  RadioGroup,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Eye20Regular, EyeOff20Regular } from '@fluentui/react-icons';

import type { HostBridge } from '../../bridge';
import type {
  NormalizedBooleanSetting,
  NormalizedEnumSetting,
  NormalizedNumberSetting,
  NormalizedPlugin,
  NormalizedSettingField,
  NormalizedSettingsSchema,
  NormalizedTextSetting,
  NormalizedTimeRangeSetting,
  SettingOption,
  TimeRangeValue,
} from '../../plugins';
import {
  defaultSettingsValues,
  isTimeRangeValue,
  mergeSettingsValues,
  settingsFieldCount,
  validateSettingValue,
} from '../../plugins';
import type { SettingsValues } from '../../plugins';

export interface PluginSettingsProps {
  plugin: NormalizedPlugin;
  bridge: HostBridge;
  notify: (text: string) => void;
}

type CommitHandler = (field: NormalizedSettingField, value: unknown) => boolean;

const useStyles = makeStyles({
  root: {
    width: '100%',
    maxWidth: '720px',
    marginInline: 'auto',
    display: 'grid',
    gap: tokens.spacingVerticalXXL,
    paddingTop: tokens.spacingVerticalXS,
  },
  notices: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
  },
  group: {
    display: 'grid',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
  },
  groupHead: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  error: {
    color: tokens.colorStatusDangerForeground1,
  },
  rows: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalL,
    minHeight: '48px',
  },
  rowText: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    flex: '1 1 200px',
    minWidth: '160px',
  },
  rowControl: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    minHeight: '40px',
    maxWidth: '100%',
  },
  input: {
    minWidth: '180px',
  },
  numberControl: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  numberInput: {
    minWidth: '120px',
    maxWidth: '160px',
  },
  unit: {
    color: tokens.colorNeutralForeground3,
  },
  timeRange: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  timeInput: {
    minWidth: '132px',
  },
  radio: {
    minHeight: '40px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    paddingTop: tokens.spacingVerticalS,
  },
  empty: {
    width: '100%',
    maxWidth: '720px',
    marginInline: 'auto',
    display: 'grid',
    gap: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalL,
  },
});

function readStoredSettings(
  bridge: HostBridge,
  pluginId: string,
  schemaKey: string,
): SettingsValues {
  const stored = bridge.getConfig<unknown>(pluginId, schemaKey);
  return stored && typeof stored === 'object' && !Array.isArray(stored)
    ? (stored as SettingsValues)
    : {};
}

export function PluginSettings({ plugin, bridge, notify }: PluginSettingsProps) {
  const schema = plugin.settings;
  if (!schema) return <NoSettings />;
  if (schema.groups.length === 0) return <NoSettings schema={schema} />;
  return (
    <PluginSettingsForm plugin={plugin} schema={schema} bridge={bridge} notify={notify} />
  );
}

function NoSettings({ schema }: { schema?: NormalizedSettingsSchema }) {
  const styles = useStyles();
  return (
    <div className={styles.empty} data-plugin-settings-empty="true">
      <Text size={400}>该插件没有可配置项</Text>
      <Text size={200} className={styles.hint}>
        插件在 manifest.json 的 settings 里声明分组和字段后，这里会自动生成表单。
      </Text>
      {schema && schema.unsupported.length > 0 && <UnsupportedNotice schema={schema} />}
    </div>
  );
}

function UnsupportedNotice({ schema }: { schema: NormalizedSettingsSchema }) {
  const fields = schema.unsupported
    .slice(0, 6)
    .map(({ key, type }) => `${key}（${type}）`)
    .join('、');
  const extra = schema.unsupported.length > 6 ? ` 等 ${schema.unsupported.length} 项` : '';
  return (
    <MessageBar intent="warning">
      <MessageBarBody>
        {`有设置项暂不支持，已跳过：${fields}${extra}。原配置保持不变。`}
      </MessageBarBody>
    </MessageBar>
  );
}

interface PluginSettingsFormProps {
  plugin: NormalizedPlugin;
  schema: NormalizedSettingsSchema;
  bridge: HostBridge;
  notify: (text: string) => void;
}

function PluginSettingsForm({ plugin, schema, bridge, notify }: PluginSettingsFormProps) {
  const styles = useStyles();
  const [raw, setRaw] = useState<SettingsValues>(() =>
    readStoredSettings(bridge, plugin.id, schema.key),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmReset, setConfirmReset] = useState(false);
  /** 保存/恢复默认后强制控件重新按配置值挂载，清掉未提交的非法草稿 */
  const [formVersion, setFormVersion] = useState(0);

  const merged = useMemo(() => mergeSettingsValues(schema, raw), [schema, raw]);

  // 插件自己写了设置（例如卡片上的快捷操作）时同步到宿主表单：
  // storage 事件只在其它文档改动时触发，宿主自己写不会回环。
  useEffect(() => {
    const storageKey = `plugin.${plugin.id}.${schema.key}`;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== storageKey) return;
      setRaw(readStoredSettings(bridge, plugin.id, schema.key));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [bridge, plugin.id, schema.key]);

  const persist = (next: SettingsValues) => {
    bridge.setConfig(plugin.id, schema.key, next);
    setRaw(next);
  };

  const commit: CommitHandler = (field, value) => {
    const error = validateSettingValue(field, value);
    if (error) {
      setFieldErrors((previous) => ({ ...previous, [field.key]: error }));
      return false;
    }
    persist({ ...raw, [field.key]: value });
    setFieldErrors((previous) => {
      if (!(field.key in previous)) return previous;
      const next = { ...previous };
      delete next[field.key];
      return next;
    });
    return true;
  };

  const save = () => {
    // 羡余提交：把当前 schema 值整体再写一次（未知字段保留），不关闭页面
    persist({ ...raw, ...merged.values });
    setFieldErrors({});
    setFormVersion((version) => version + 1);
    notify('已保存');
  };

  const resetDefaults = () => {
    persist({ ...raw, ...defaultSettingsValues(schema) });
    setFieldErrors({});
    setFormVersion((version) => version + 1);
    setConfirmReset(false);
    notify('已恢复默认设置');
  };

  return (
    <div className={styles.root} data-plugin-settings={plugin.id}>
      {(schema.unsupported.length > 0 ||
        merged.invalidKeys.length > 0 ||
        merged.unknownKeys.length > 0) && (
        <div className={styles.notices}>
          {schema.unsupported.length > 0 && <UnsupportedNotice schema={schema} />}
          {merged.invalidKeys.length > 0 && (
            <MessageBar intent="warning">
              <MessageBarBody>
                {`已存配置里有 ${merged.invalidKeys.length} 项不合法（${merged.invalidKeys.join('、')}），当前按默认值显示；修改后会写入合法值。`}
              </MessageBarBody>
            </MessageBar>
          )}
          {merged.unknownKeys.length > 0 && (
            <MessageBar intent="info">
              <MessageBarBody>
                {`配置里还有 ${merged.unknownKeys.length} 个未在 schema 中声明的字段（${merged.unknownKeys.join('、')}），已原样保留，不会被改写。`}
              </MessageBarBody>
            </MessageBar>
          )}
        </div>
      )}

      {schema.groups.map((group) => (
        <section key={group.id} className={styles.group} aria-label={group.title}>
          <header className={styles.groupHead}>
            <Text size={500} weight="semibold">
              {group.title}
            </Text>
            {group.hint && (
              <Text size={200} className={styles.hint}>
                {group.hint}
              </Text>
            )}
          </header>
          <div className={styles.rows}>
            {group.fields.map((field) => (
              <SettingRow
                key={`${field.key}:${formVersion}`}
                field={field}
                value={merged.values[field.key]}
                error={fieldErrors[field.key]}
                onCommit={commit}
              />
            ))}
          </div>
        </section>
      ))}

      {confirmReset && (
        <MessageBar intent="warning">
          <MessageBarBody>
            {`将把「${plugin.name}」的 ${settingsFieldCount(schema)} 个设置项恢复为 schema 默认值；未声明的字段会保留。`}
          </MessageBarBody>
          <MessageBarActions>
            <Button appearance="secondary" size="large" onClick={() => setConfirmReset(false)}>
              取消
            </Button>
            <Button appearance="primary" size="large" onClick={resetDefaults}>
              确认恢复
            </Button>
          </MessageBarActions>
        </MessageBar>
      )}

      <div className={styles.footer}>
        <Button
          appearance="secondary"
          size="large"
          onClick={() => setConfirmReset(true)}
          disabled={settingsFieldCount(schema) === 0}
        >
          恢复默认
        </Button>
        <Button appearance="primary" size="large" onClick={save}>
          保存
        </Button>
      </div>
    </div>
  );
}

interface SettingRowProps {
  field: NormalizedSettingField;
  value: unknown;
  error?: string;
  onCommit: CommitHandler;
}

function SettingRow({ field, value, error, onCommit }: SettingRowProps) {
  const styles = useStyles();
  return (
    <div className={styles.row} data-setting-key={field.key} data-setting-type={field.type}>
      <div className={styles.rowText}>
        <Text size={400}>{field.label}</Text>
        {field.description && (
          <Text size={200} className={styles.hint}>
            {field.description}
          </Text>
        )}
        {error && (
          <Text size={200} className={styles.error}>
            {error}
          </Text>
        )}
      </div>
      <div className={styles.rowControl}>{renderControl(field, value, onCommit, styles)}</div>
    </div>
  );
}

function renderControl(
  field: NormalizedSettingField,
  value: unknown,
  onCommit: CommitHandler,
  styles: ReturnType<typeof useStyles>,
) {
  switch (field.type) {
    case 'boolean':
      return (
        <BooleanControl
          field={field}
          value={typeof value === 'boolean' ? value : field.default}
          onCommit={onCommit}
        />
      );
    case 'number':
      return (
        <NumberControl
          field={field}
          value={typeof value === 'number' && Number.isFinite(value) ? value : field.default}
          onCommit={onCommit}
        />
      );
    case 'enum':
      return (
        <EnumControl
          field={field}
          value={
            field.options.some((option) => option.value === value)
              ? (value as SettingOption['value'])
              : field.default
          }
          onCommit={onCommit}
        />
      );
    case 'text':
      return (
        <TextControl
          field={field}
          value={typeof value === 'string' ? value : field.default}
          onCommit={onCommit}
        />
      );
    case 'timeRange':
      return (
        <TimeRangeControl
          field={field}
          value={isTimeRangeValue(value) ? value : field.default}
          onCommit={onCommit}
        />
      );
    default:
      return null;
  }
}

function BooleanControl({
  field,
  value,
  onCommit,
}: {
  field: NormalizedBooleanSetting;
  value: boolean;
  onCommit: CommitHandler;
}) {
  return (
    <Switch
      checked={value}
      aria-label={field.label}
      onChange={(_event, data) => onCommit(field, data.checked)}
    />
  );
}

function NumberControl({
  field,
  value,
  onCommit,
}: {
  field: NormalizedNumberSetting;
  value: number;
  onCommit: CommitHandler;
}) {
  const styles = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(String(value));

  // 输入过程中提交会触发父组件重渲染；光标还在输入框里时不要用旧值覆盖草稿
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setDraft(String(value));
  }, [value]);

  const commitDraft = (): boolean => {
    const text = draft.trim();
    if (!text) return false;
    const parsed = Number(text);
    if (!Number.isFinite(parsed)) return false;
    return onCommit(field, parsed);
  };

  return (
    <div className={styles.numberControl}>
      <Input
        ref={inputRef}
        size="large"
        type="number"
        value={draft}
        min={field.min}
        max={field.max}
        step={field.step}
        aria-label={field.label}
        className={styles.numberInput}
        onChange={(_event, data) => {
          setDraft(data.value);
          const parsed = Number(data.value);
          if (data.value.trim() && Number.isFinite(parsed)) onCommit(field, parsed);
        }}
        onBlur={() => {
          if (!draft.trim()) setDraft(String(value));
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          commitDraft();
          event.currentTarget.blur();
        }}
      />
      {field.unit && (
        <Text size={300} className={styles.unit}>
          {field.unit}
        </Text>
      )}
    </div>
  );
}

function EnumControl({
  field,
  value,
  onCommit,
}: {
  field: NormalizedEnumSetting;
  value: SettingOption['value'];
  onCommit: CommitHandler;
}) {
  const styles = useStyles();

  if (field.options.length <= 4) {
    return (
      <RadioGroup
        layout="horizontal"
        value={String(value)}
        aria-label={field.label}
        onChange={(_event, data) => {
          const option = field.options.find(
            (candidate) => String(candidate.value) === data.value,
          );
          if (option) onCommit(field, option.value);
        }}
      >
        {field.options.map((option) => (
          <Radio
            key={String(option.value)}
            className={styles.radio}
            value={String(option.value)}
            label={option.label}
          />
        ))}
      </RadioGroup>
    );
  }

  const selected =
    field.options.find((option) => option.value === value) ?? field.options[0];
  return (
    <Dropdown
      size="large"
      aria-label={field.label}
      value={selected.label}
      selectedOptions={[String(selected.value)]}
      onOptionSelect={(_event, data) => {
        const option = field.options.find(
          (candidate) => String(candidate.value) === data.optionValue,
        );
        if (option) onCommit(field, option.value);
      }}
    >
      {field.options.map((option) => (
        <Option key={String(option.value)} value={String(option.value)}>
          {option.label}
        </Option>
      ))}
    </Dropdown>
  );
}

function TextControl({
  field,
  value,
  onCommit,
}: {
  field: NormalizedTextSetting;
  value: string;
  onCommit: CommitHandler;
}) {
  const styles = useStyles();
  const [draft, setDraft] = useState(value);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => setDraft(value), [value]);

  const commitDraft = () => {
    if (draft === value) return;
    if (!onCommit(field, draft)) setDraft(value);
  };

  return (
    <Input
      size="large"
      type={field.secret && !revealed ? 'password' : 'text'}
      value={draft}
      placeholder={field.placeholder}
      maxLength={field.maxLength}
      aria-label={field.label}
      className={styles.input}
      onChange={(_event, data) => setDraft(data.value)}
      onBlur={commitDraft}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        commitDraft();
        event.currentTarget.blur();
      }}
      contentAfter={
        field.secret ? (
          <Button
            appearance="transparent"
            size="small"
            icon={revealed ? <EyeOff20Regular /> : <Eye20Regular />}
            aria-label={revealed ? `隐藏 ${field.label}` : `显示 ${field.label}`}
            onClick={() => setRevealed((current) => !current)}
          />
        ) : undefined
      }
    />
  );
}

function TimeRangeControl({
  field,
  value,
  onCommit,
}: {
  field: NormalizedTimeRangeSetting;
  value: TimeRangeValue;
  onCommit: CommitHandler;
}) {
  const styles = useStyles();
  const [start, setStart] = useState(value.start);
  const [end, setEnd] = useState(value.end);

  useEffect(() => {
    setStart(value.start);
    setEnd(value.end);
  }, [value.start, value.end]);

  const change = (nextStart: string, nextEnd: string) => {
    setStart(nextStart);
    setEnd(nextEnd);
    // 只有两端都空或都是合法 HH:MM 时才会通过校验并写入；不完整时行内报错
    onCommit(field, { start: nextStart, end: nextEnd });
  };

  return (
    <div className={styles.timeRange}>
      <Input
        size="large"
        type="time"
        className={styles.timeInput}
        value={start}
        aria-label={`${field.label}开始时间`}
        onChange={(_event, data) => change(data.value, end)}
      />
      <Text size={300}>至</Text>
      <Input
        size="large"
        type="time"
        className={styles.timeInput}
        value={end}
        aria-label={`${field.label}结束时间`}
        onChange={(_event, data) => change(start, data.value)}
      />
    </div>
  );
}
