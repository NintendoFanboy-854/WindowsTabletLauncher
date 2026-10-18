/**
 * 倒数日编辑视图（宿主全窗口 Fluent Dialog，?view=edit 加载）。
 * 新增与编辑共用：卡片长按 / 点击 / 「添加」按钮都会先写 editing target，再请求该视图。
 * 保存 / 删除后写宿主配置；卡片视图通过 storage 事件同步。
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Divider,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Radio,
  RadioGroup,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Delete20Regular, Save20Regular } from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import { useStoredConfig } from '../../_shared/host.js';
import {
  COLOR_OPTIONS,
  ITEMS_KEY,
  MAX_ITEMS,
  normalizeItems,
  nextId,
  readEditingTarget,
  setEditingTarget,
  toDateString,
  validateDraft,
} from './data/items.js';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    overflowY: 'auto',
    color: tokens.colorNeutralForeground1,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    minHeight: '40px',
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  subtle: {
    color: tokens.colorNeutralForeground3,
  },
  colorGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  colorRadio: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  swatch: {
    width: tokens.spacingHorizontalL,
    height: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusCircular,
    flex: '0 0 auto',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: 'auto',
  },
  spacer: {
    flex: '1 1 auto',
  },
});

export default function CountdownEditor() {
  const styles = useStyles();
  const [items, setItems, loaded] = useStoredConfig(ITEMS_KEY, [], normalizeItems);
  const [editingId, setEditingId] = useState(() => readEditingTarget().id);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(() => toDateString(new Date()));
  const [repeatYearly, setRepeatYearly] = useState(false);
  const [color, setColor] = useState('accent');
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const editingItem = useMemo(
    () => (editingId ? items.find((item) => item.id === editingId) : null),
    [editingId, items],
  );

  useEffect(() => {
    if (!loaded || initialized) return;
    if (editingItem) {
      setTitle(editingItem.title);
      setTargetDate(editingItem.targetDate);
      setRepeatYearly(editingItem.repeatYearly);
      setColor(editingItem.color);
    }
    setInitialized(true);
  }, [editingItem, initialized, loaded]);

  const save = () => {
    const validation = validateDraft({ title, targetDate });
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError('');
    if (editingItem) {
      setItems((previous) =>
        previous.map((item) =>
          item.id === editingItem.id
            ? { ...item, title: validation.title, targetDate, repeatYearly, color }
            : item,
        ),
      );
      plugin.notify(`已更新「${validation.title}」`);
    } else {
      if (items.length >= MAX_ITEMS) {
        setError(`最多 ${MAX_ITEMS} 条倒数日`);
        return;
      }
      const item = {
        id: nextId(),
        title: validation.title,
        targetDate,
        repeatYearly,
        color,
        createdAt: new Date().toISOString(),
      };
      setItems((previous) => [...previous, item]);
      setEditingTarget(item.id);
      setEditingId(item.id);
      plugin.notify(`已添加「${validation.title}」`);
    }
    setSavedMessage('已保存；关闭此窗口后卡片会同步更新。');
  };

  const remove = () => {
    if (!editingItem) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setItems((previous) => previous.filter((item) => item.id !== editingItem.id));
    plugin.notify(`已删除「${editingItem.title}」`);
    setSavedMessage('已删除；关闭此窗口后卡片会同步更新。');
    setEditingId(null);
    setConfirmDelete(false);
    setTitle('');
    setTargetDate(toDateString(new Date()));
    setRepeatYearly(false);
    setColor('accent');
  };

  return (
    <div className={styles.root} data-countdown-editor>
      <div className={styles.section} aria-label="事件信息">
        <Text size={400} weight="semibold">
          {editingItem ? '编辑倒数日' : '新增倒数日'}
        </Text>
        <Field label="标题" required>
          <Input
            value={title}
            placeholder="例如：期末考试"
            autoFocus
            onChange={(_, detail) => setTitle(detail.value)}
          />
        </Field>
        <Field label="日期" required hint="生日 / 纪念日选「每年重复」后按「月-日」循环">
          <Input type="date" value={targetDate} onChange={(_, detail) => setTargetDate(detail.value)} />
        </Field>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>每年重复</Text>
            <Text className={styles.subtle} size={200}>
              生日、纪念日等每年循环的事件
            </Text>
          </div>
          <Switch
            checked={repeatYearly}
            aria-label="每年重复"
            onChange={(_, detail) => setRepeatYearly(detail.checked)}
          />
        </div>
      </div>

      <Divider />

      <div className={styles.section} aria-label="颜色">
        <Text size={300} weight="semibold">
          颜色
        </Text>
        <RadioGroup
          value={color}
          layout="horizontal"
          className={styles.colorGrid}
          onChange={(_, detail) => setColor(detail.value)}
        >
          {COLOR_OPTIONS.map((option) => (
            <Radio
              key={option.id}
              value={option.id}
              label={{
                children: (
                  <span className={styles.colorRadio}>
                    <span
                      className={styles.swatch}
                      style={{ backgroundColor: tokens[option.token] }}
                      aria-hidden="true"
                    />
                    {option.label}
                  </span>
                ),
              }}
            />
          ))}
        </RadioGroup>
      </div>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}
      {savedMessage && !error && (
        <MessageBar intent="success">
          <MessageBarBody>{savedMessage}</MessageBarBody>
        </MessageBar>
      )}
      {confirmDelete && (
        <MessageBar intent="warning">
          <MessageBarBody>再次点击「删除」确认删除这条倒数日。</MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.actions}>
        {editingItem && (
          <Button
            appearance="subtle"
            size="large"
            icon={<Delete20Regular />}
            onClick={remove}
          >
            {confirmDelete ? '确认删除' : '删除'}
          </Button>
        )}
        <span className={styles.spacer} />
        <Button appearance="primary" size="large" icon={<Save20Regular />} onClick={save}>
          保存
        </Button>
      </div>
    </div>
  );
}
