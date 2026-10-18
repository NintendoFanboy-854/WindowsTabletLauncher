/**
 * 待办设置浮层视图（宿主全窗口 Fluent Dialog 里以 ?view=settings 加载）。
 * 设置即时生效并持久化到宿主配置；卡片视图通过 storage 事件同步。
 * 清单管理（新建 / 重命名 / 删除）也在这里，避免在卡片 iframe 里弹 Dialog。
 */

import { useState } from 'react';
import {
  Button,
  Divider,
  Dropdown,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Option,
  Radio,
  RadioGroup,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add20Regular, Delete20Regular } from '@fluentui/react-icons';
import { useStoredConfig } from '../../_shared/host.js';
import {
  CONFIG_KEY,
  DEFAULT_CONFIG,
  FONT_SIZE_OPTIONS,
  normalizeConfig,
  SORT_OPTIONS,
  WEEK_START_OPTIONS,
} from './config.js';
import { store } from '../js/store.js';
import { useTodoStore } from './todoData.js';

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
  section: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    minHeight: '40px',
  },
  rowText: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS, minWidth: 0 },
  subtle: { color: tokens.colorNeutralForeground3 },
  radios: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  listRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '40px',
  },
  listName: { flex: 1, minWidth: 0 },
  addRow: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, minHeight: '40px' },
  addInput: { flex: 1 },
  footer: { marginTop: 'auto', paddingTop: tokens.spacingVerticalM },
});

export default function TodoSettings() {
  const styles = useStyles();
  const [config, setConfig, loaded] = useStoredConfig(CONFIG_KEY, DEFAULT_CONFIG, normalizeConfig);
  const storeState = useTodoStore();
  const [newListName, setNewListName] = useState('');
  const [renaming, setRenaming] = useState(null); // { id, name }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [message, setMessage] = useState(null);

  const lists = storeState.lists;
  const defaultListId = config.defaultListId && storeState.listById(config.defaultListId) ? config.defaultListId : lists[0]?.id;

  const update = (patch) => setConfig((previous) => ({ ...previous, ...patch }));

  const createList = () => {
    const name = newListName.trim();
    if (!name) return;
    try {
      const list = store.addList(name);
      update({ defaultListId: list.id });
      setNewListName('');
      setMessage({ intent: 'success', text: `已新建清单「${list.name}」` });
    } catch (error) {
      setMessage({ intent: 'error', text: error instanceof Error ? error.message : String(error) });
    }
  };

  const renameList = () => {
    if (!renaming) return;
    const name = renaming.name.trim();
    if (!name) return;
    try {
      store.updateList(renaming.id, { name });
      setRenaming(null);
      setMessage({ intent: 'success', text: `已重命名为「${name}」` });
    } catch (error) {
      setMessage({ intent: 'error', text: error instanceof Error ? error.message : String(error) });
    }
  };

  const deleteList = (list) => {
    try {
      store.removeList(list.id);
      if (config.defaultListId === list.id) update({ defaultListId: store.lists[0]?.id || null });
      setConfirmDelete(null);
      setMessage({ intent: 'success', text: `已删除清单「${list.name}」及其任务` });
    } catch (error) {
      setMessage({ intent: 'error', text: error instanceof Error ? error.message : String(error) });
    }
  };

  const clearCompleted = () => {
    const removed = store.clearCompleted({});
    setMessage({ intent: 'success', text: removed ? `已清空 ${removed} 条已完成任务` : '没有已完成任务' });
  };

  return (
    <div className={styles.root}>
      <Text size={500} weight="semibold">
        待办设置
      </Text>
      {message ? (
        <MessageBar intent={message.intent} onDismiss={() => setMessage(null)}>
          <MessageBarBody>{message.text}</MessageBarBody>
        </MessageBar>
      ) : null}

      <section className={styles.section} aria-label="显示">
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>默认清单</Text>
            <Text size={200} className={styles.subtle}>
              卡片默认显示与快速添加所用清单
            </Text>
          </div>
          <Dropdown
            aria-label="默认清单"
            value={storeState.listById(defaultListId)?.name || ''}
            selectedOptions={defaultListId ? [defaultListId] : []}
            onOptionSelect={(_, data) => update({ defaultListId: data.optionValue })}
            disabled={!loaded}
          >
            {lists.map((list) => (
              <Option key={list.id} value={list.id}>
                {list.name}
              </Option>
            ))}
          </Dropdown>
        </div>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>显示已完成</Text>
            <Text size={200} className={styles.subtle}>
              在列表底部折叠显示已完成任务
            </Text>
          </div>
          <Switch
            checked={config.showCompleted}
            aria-label="显示已完成"
            disabled={!loaded}
            onChange={(_, data) => update({ showCompleted: data.checked })}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>字号</Text>
            <Text size={200} className={styles.subtle}>
              按 Fluent type ramp 切档，不做连续缩放
            </Text>
          </div>
          <RadioGroup
            layout="horizontal"
            value={config.fontSize}
            onChange={(_, data) => update({ fontSize: data.value })}
          >
            {FONT_SIZE_OPTIONS.map((option) => (
              <Radio key={option.value} value={option.value} label={option.label} />
            ))}
          </RadioGroup>
        </div>
      </section>

      <Divider />

      <section className={styles.section} aria-label="列表排序">
        <Text size={400} weight="semibold">
          列表行为
        </Text>
        <Field label="默认排序">
          <RadioGroup
            value={config.defaultSort}
            onChange={(_, data) => update({ defaultSort: data.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <Radio key={option.value} value={option.value} label={option.label} />
            ))}
          </RadioGroup>
        </Field>
        <Field label="一周起始日">
          <RadioGroup
            layout="horizontal"
            value={String(config.weekStart)}
            onChange={(_, data) => update({ weekStart: Number(data.value) })}
          >
            {WEEK_START_OPTIONS.map((option) => (
              <Radio key={option.value} value={String(option.value)} label={option.label} />
            ))}
          </RadioGroup>
        </Field>
      </section>

      <Divider />

      <section className={styles.section} aria-label="清单管理">
        <Text size={400} weight="semibold">
          清单管理
        </Text>
        {lists.map((list) => (
          <div key={list.id} className={styles.listRow}>
            {renaming?.id === list.id ? (
              <>
                <Input
                  className={styles.listName}
                  value={renaming.name}
                  aria-label="清单名称"
                  onChange={(_, data) => setRenaming({ ...renaming, name: data.value })}
                />
                <Button size="large" appearance="primary" onClick={renameList}>
                  保存
                </Button>
                <Button size="large" appearance="subtle" onClick={() => setRenaming(null)}>
                  取消
                </Button>
              </>
            ) : (
              <>
                <Text size={300} className={styles.listName}>
                  {list.name}
                </Text>
                <Button size="large" appearance="subtle" onClick={() => setRenaming({ id: list.id, name: list.name })}>
                  重命名
                </Button>
                {confirmDelete === list.id ? (
                  <>
                    <Button size="large" appearance="primary" onClick={() => deleteList(list)}>
                      确认删除
                    </Button>
                    <Button size="large" appearance="subtle" onClick={() => setConfirmDelete(null)}>
                      取消
                    </Button>
                  </>
                ) : (
                  <Button
                    appearance="subtle"
                    icon={<Delete20Regular />}
                    aria-label={`删除清单 ${list.name}`}
                    disabled={lists.length <= 1}
                    onClick={() => setConfirmDelete(list.id)}
                  />
                )}
              </>
            )}
          </div>
        ))}
        <div className={styles.addRow}>
          <Input
            className={styles.addInput}
            placeholder="新清单名称"
            aria-label="新清单名称"
            value={newListName}
            onChange={(_, data) => setNewListName(data.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') createList();
            }}
          />
          <Button size="large" appearance="primary" icon={<Add20Regular />} onClick={createList}>
            新建清单
          </Button>
        </div>
      </section>

      <Divider />

      <div className={styles.footer}>
        <Button size="large" appearance="subtle" onClick={clearCompleted}>
          清空已完成任务
        </Button>
        <Text size={200} className={styles.subtle}>
          设置即时保存；任务详情同样在独立浮层里编辑，不会挤占卡片。
        </Text>
      </div>
    </div>
  );
}
