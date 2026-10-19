/**
 * L2 清单管理（push 在详情浮层内）：
 *
 * - header 56：← 返回 +「清单管理」16 semibold；右侧新清单 Input 40 +「新建」40；
 * - 行 44：颜色点 + 名称 14 + 任务数 12 fg3 + 设为默认星标 40 + 重命名 40 + 删除 40；
 * - 重命名 / 删除行内确认；删除提示“同时删除其中的 N 个任务”；
 * - 默认清单只决定详情初始筛选，不影响卡片；返回 list 保留当前 Tab/筛选（L1 不卸载）。
 */

import { useState } from 'react';
import {
  Input,
  MessageBar,
  MessageBarBody,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  Delete20Regular,
  Edit20Regular,
  Star16Filled,
  Star16Regular,
} from '@fluentui/react-icons';
import { ActionButton, Subpage } from '../../_shared/ui.jsx';
import { store } from '../js/store.js';
import { useTodoStore } from './todoData.js';
import { ListColorDot, EllipsisText } from './parts.jsx';

const useStyles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '44px',
    minWidth: 0,
  },
  main: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  name: {
    color: tokens.colorNeutralForeground1,
    minWidth: 0,
  },
  count: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
  },
  actions: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    flexShrink: 0,
  },
  iconButton: { minWidth: '40px', minHeight: '40px' },
  star: { color: tokens.colorBrandForeground1 },
  starIdle: { color: tokens.colorNeutralForeground3 },
  danger: { color: tokens.colorPaletteRedForeground1 },
  confirm: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flex: 1,
    minWidth: 0,
  },
  confirmText: {
    flex: 1,
    minWidth: 0,
    color: tokens.colorNeutralForeground3,
  },
  renameInput: { flex: 1, minWidth: 0 },
  addRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  addInput: { minWidth: '140px' },
  muted: { color: tokens.colorNeutralForeground3 },
  empty: {
    color: tokens.colorNeutralForeground3,
    paddingBlock: tokens.spacingVerticalM,
  },
});

export function ListManager({ onClosed }) {
  const styles = useStyles();
  const storeState = useTodoStore();
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState(null);

  const lists = storeState.lists;
  const defaultListId = storeState.settings.defaultListId;
  const taskCount = (listId) => storeState.state.tasks.filter((task) => task.listId === listId).length;

  const createList = () => {
    const name = newName.trim();
    if (!name) return;
    try {
      store.addList(name);
      setNewName('');
      setError(null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : String(createError));
    }
  };

  const saveRename = () => {
    if (!renaming) return;
    const name = renaming.name.trim();
    if (!name) return;
    try {
      store.updateList(renaming.id, { name });
      setRenaming(null);
      setError(null);
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : String(renameError));
    }
  };

  const removeList = (list) => {
    try {
      store.removeList(list.id);
      setConfirmDelete(null);
      setError(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    }
  };

  return (
    <Subpage
      title="清单管理"
      trailing={
        <div className={styles.addRow}>
          <Input
            size="large"
            className={styles.addInput}
            value={newName}
            placeholder="新清单名称"
            aria-label="新清单名称"
            onChange={(_event, data) => setNewName(data.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              createList();
            }}
          />
          <ActionButton appearance="primary" icon={<Add20Regular />} onClick={createList}>
            新建
          </ActionButton>
        </div>
      }
      onClosed={onClosed}
    >
      <div className={styles.list}>
        {error ? (
          <MessageBar intent="error" onDismiss={() => setError(null)}>
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        ) : null}

        {lists.length === 0 ? <Text size={300} className={styles.empty}>还没有清单</Text> : null}

        {lists.map((list) => {
          const total = taskCount(list.id);
          const isDefault = list.id === defaultListId;
          if (renaming?.id === list.id) {
            return (
              <div key={list.id} className={styles.row}>
                <Input
                  size="large"
                  className={styles.renameInput}
                  value={renaming.name}
                  aria-label="清单名称"
                  autoFocus
                  onChange={(_event, data) => setRenaming({ ...renaming, name: data.value })}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    saveRename();
                  }}
                />
                <ActionButton appearance="primary" onClick={saveRename}>
                  保存
                </ActionButton>
                <ActionButton appearance="secondary" onClick={() => setRenaming(null)}>
                  取消
                </ActionButton>
              </div>
            );
          }
          if (confirmDelete === list.id) {
            return (
              <div key={list.id} className={styles.row}>
                <div className={styles.confirm}>
                  <Text size={200} className={styles.confirmText}>
                    <EllipsisText>
                      删除「{list.name}」？同时删除其中的 {total} 个任务
                    </EllipsisText>
                  </Text>
                </div>
                <ActionButton appearance="primary" onClick={() => removeList(list)}>
                  确认删除
                </ActionButton>
                <ActionButton appearance="secondary" onClick={() => setConfirmDelete(null)}>
                  取消
                </ActionButton>
              </div>
            );
          }
          return (
            <div key={list.id} className={styles.row}>
              <ListColorDot color={list.color} />
              <div className={styles.main}>
                <Text size={300} className={styles.name} title={list.name}>
                  <EllipsisText>{list.name}</EllipsisText>
                </Text>
                <Text size={200} className={styles.count}>
                  {total} 个任务{isDefault ? ' · 默认清单' : ''}
                </Text>
              </div>
              <div className={styles.actions}>
                <ActionButton
                  appearance="subtle"
                  className={styles.iconButton}
                  icon={isDefault ? <Star16Filled /> : <Star16Regular />}
                  aria-label={isDefault ? `默认清单 ${list.name}` : `设为默认清单 ${list.name}`}
                  title={isDefault ? '默认清单' : '设为默认'}
                  disabled={isDefault}
                  onClick={() => store.updateSettings({ defaultListId: list.id })}
                />
                <ActionButton
                  appearance="subtle"
                  className={styles.iconButton}
                  icon={<Edit20Regular />}
                  aria-label={`重命名清单 ${list.name}`}
                  title="重命名"
                  onClick={() => setRenaming({ id: list.id, name: list.name })}
                />
                <ActionButton
                  appearance="subtle"
                  className={styles.iconButton}
                  icon={<Delete20Regular />}
                  aria-label={`删除清单 ${list.name}`}
                  title="删除"
                  disabled={lists.length <= 1}
                  onClick={() => setConfirmDelete(list.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Subpage>
  );
}
