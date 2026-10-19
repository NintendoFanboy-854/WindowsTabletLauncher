/**
 * 倒数日编辑视图（宿主全窗口 Fluent Dialog，?view=edit 加载）。
 * 浮层重排 v1（docs/OVERLAY-REWRITE-SPEC.md §1/§3.3）：
 * - 表单 max-width 720 居中；Field 上下布局，控件 40；Field 间距 16
 * - 底部固定操作条：左「删除」（danger）+ 右「取消」「保存」（40）
 * - 保存/删除行为不变；不用 Divider 分组
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Option,
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
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 24px 0',
    overflow: 'hidden',
    color: tokens.colorNeutralForeground1,
    '@media (max-width: 699px)': { padding: '16px 16px 0' },
  },
  scrollArea: {
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: tokens.spacingVerticalXL,
  },
  content: {
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  formStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    minHeight: '48px',
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
  switchControl: {
    flex: '0 0 auto',
    minHeight: '40px',
  },
  footer: {
    flex: '0 0 auto',
    padding: '12px 0 16px',
  },
  footerInner: {
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  control: {
    minHeight: '42px',
  },
  dangerButton: {
    color: tokens.colorPaletteRedForeground1,
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

  const colorLabel = useMemo(
    () => (COLOR_OPTIONS.find((option) => option.id === color) ?? COLOR_OPTIONS[0]).label,
    [color],
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

  const resetForm = () => {
    if (editingItem) {
      setTitle(editingItem.title);
      setTargetDate(editingItem.targetDate);
      setRepeatYearly(editingItem.repeatYearly);
      setColor(editingItem.color);
    } else {
      setTitle('');
      setTargetDate(toDateString(new Date()));
      setRepeatYearly(false);
      setColor('accent');
    }
    setError('');
    setSavedMessage('');
    setConfirmDelete(false);
  };

  const save = () => {
    const validation = validateDraft({ title, targetDate });
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError('');
    setConfirmDelete(false);
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
      <div className={styles.scrollArea}>
        <div className={styles.content}>
          <section className={styles.section} aria-label="事件信息">
            <Text size={500} weight="semibold">
              {editingItem ? '编辑倒数日' : '新增倒数日'}
            </Text>
            <div className={styles.formStack}>
              <Field label="标题" required>
                <Input
                  className={styles.control}
                  size="large"
                  value={title}
                  placeholder="例如：期末考试"
                  autoFocus
                  onChange={(_, detail) => setTitle(detail.value)}
                />
              </Field>
              <Field label="日期" required hint="生日 / 纪念日选「每年重复」后按「月-日」循环">
                <Input
                  className={styles.control}
                  size="large"
                  type="date"
                  value={targetDate}
                  onChange={(_, detail) => setTargetDate(detail.value)}
                />
              </Field>
              <Field label="颜色" hint="事件颜色只用于卡片上的状态圆点">
                <Dropdown
                  className={styles.control}
                  size="large"
                  value={colorLabel}
                  selectedOptions={[color]}
                  onOptionSelect={(_, detail) =>
                    setColor(detail.optionValue ?? COLOR_OPTIONS[0].id)
                  }
                >
                  {COLOR_OPTIONS.map((option) => (
                    <Option key={option.id} value={option.id}>
                      {option.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
              <div className={styles.row}>
                <div className={styles.rowText}>
                  <Text size={300}>每年重复</Text>
                  <Text className={styles.subtle} size={200}>
                    生日、纪念日等每年循环的事件
                  </Text>
                </div>
                <Switch
                  className={styles.switchControl}
                  checked={repeatYearly}
                  aria-label="每年重复"
                  onChange={(_, detail) => setRepeatYearly(detail.checked)}
                />
              </div>
            </div>
          </section>

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
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerInner}>
          {editingItem ? (
            <Button
              className={styles.dangerButton}
              appearance="subtle"
              size="large"
              icon={<Delete20Regular />}
              onClick={remove}
            >
              {confirmDelete ? '确认删除' : '删除'}
            </Button>
          ) : (
            <span />
          )}
          <div className={styles.footerRight}>
            <Button appearance="secondary" size="large" onClick={resetForm}>
              取消
            </Button>
            <Button appearance="primary" size="large" icon={<Save20Regular />} onClick={save}>
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


