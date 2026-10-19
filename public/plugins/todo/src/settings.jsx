/**
 * 待办设置浮层视图（宿主全窗口 Fluent Dialog 里以 ?view=settings 加载）。
 *
 * 排版遵循 docs/OVERLAY-REWRITE-SPEC.md：
 * - 不画页面标题/关闭按钮（宿主 Dialog 提供）；
 * - 单列 max-width 720 居中；行式设置项 label 14 + 描述 12 fg3 + 控件 40，行高 48；
 * - 分组用 24px 留白，不用 Divider；清单管理行高 44 + 40 图标操作；即时保存。
 */

import { useState } from 'react';
import {
  Button,
  Dropdown,
  Input,
  MessageBar,
  MessageBarBody,
  Option,
  Radio,
  RadioGroup,
  Switch,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add20Regular, Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
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
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: tokens.colorNeutralForeground1,
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL} 0`,
    '& .fui-Input__input': { minHeight: '40px' },
    '& .fui-Dropdown__button': { minHeight: '40px' },
    '@media (max-width: 700px)': {
      padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL} 0`,
    },
  },
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingBottom: tokens.spacingVerticalXL,
  },
  content: {
    width: '100%',
    maxWidth: '720px',
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
  },
  sectionHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  sectionHint: { color: tokens.colorNeutralForeground3 },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalXL,
    minHeight: '48px',
    minWidth: 0,
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  rowControl: { flexShrink: 0 },
  rowControlWide: { flexShrink: 0, minWidth: '180px' },
  desc: { color: tokens.colorNeutralForeground3 },
  listRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '44px',
    minWidth: 0,
  },
  listText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  iconButton: { minWidth: '40px', minHeight: '40px' },
  addRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '44px',
    paddingTop: tokens.spacingVerticalXS,
  },
  addInput: { flex: 1 },
  danger: { color: tokens.colorPaletteRedForeground1 },
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
  const defaultListId =
    config.defaultListId && storeState.listById(config.defaultListId) ? config.defaultListId : lists[0]?.id;
  const defaultListName = storeState.listById(defaultListId)?.name || '';
  const sortLabel = SORT_OPTIONS.find((option) => option.value === config.defaultSort)?.label || '手动';

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
      <div className={styles.scroll}>
        <div className={styles.content}>
          {message ? (
            <MessageBar intent={message.intent} onDismiss={() => setMessage(null)}>
              <MessageBarBody>{message.text}</MessageBarBody>
            </MessageBar>
          ) : null}

          <section className={styles.section} aria-label="显示">
            <div className={styles.sectionHead}>
              <Text size={500} weight="semibold">
                显示
              </Text>
            </div>
            <div className={styles.row}>
              <div className={styles.rowText}>
                <Text size={300}>默认清单</Text>
                <Text size={200} className={styles.desc}>
                  卡片默认显示与快速添加所用清单
                </Text>
              </div>
              <Dropdown
                aria-label="默认清单"
                className={styles.rowControlWide}
                size="large"
                value={defaultListName}
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
                <Text size={200} className={styles.desc}>
                  在列表底部折叠显示已完成任务
                </Text>
              </div>
              <div className={styles.rowControl}>
                <Switch
                  checked={config.showCompleted}
                  aria-label="显示已完成"
                  disabled={!loaded}
                  onChange={(_, data) => update({ showCompleted: data.checked })}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.rowText}>
                <Text size={300}>字号</Text>
                <Text size={200} className={styles.desc}>
                  调整卡片内任务文字的大小
                </Text>
              </div>
              <div className={styles.rowControl}>
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
            </div>
          </section>

          <section className={styles.section} aria-label="列表行为">
            <div className={styles.sectionHead}>
              <Text size={500} weight="semibold">
                列表行为
              </Text>
            </div>
            <div className={styles.row}>
              <div className={styles.rowText}>
                <Text size={300}>默认排序</Text>
                <Text size={200} className={styles.desc}>
                  卡片列表的初始排序方式
                </Text>
              </div>
              <Dropdown
                aria-label="默认排序"
                className={styles.rowControlWide}
                size="large"
                value={sortLabel}
                selectedOptions={[config.defaultSort]}
                onOptionSelect={(_, data) => update({ defaultSort: data.optionValue })}
              >
                {SORT_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Dropdown>
            </div>
            <div className={styles.row}>
              <div className={styles.rowText}>
                <Text size={300}>一周起始日</Text>
                <Text size={200} className={styles.desc}>
                  影响日历与周视图的列顺序
                </Text>
              </div>
              <div className={styles.rowControl}>
                <RadioGroup
                  layout="horizontal"
                  value={String(config.weekStart)}
                  onChange={(_, data) => update({ weekStart: Number(data.value) })}
                >
                  {WEEK_START_OPTIONS.map((option) => (
                    <Radio key={option.value} value={String(option.value)} label={option.label} />
                  ))}
                </RadioGroup>
              </div>
            </div>
          </section>

          <section className={styles.section} aria-label="清单管理">
            <div className={styles.sectionHead}>
              <Text size={500} weight="semibold">
                清单管理
              </Text>
              <Text size={200} className={styles.sectionHint}>
                删除清单会同时删除其中的任务。
              </Text>
            </div>
            {lists.map((list) => (
              <div key={list.id} className={styles.listRow}>
                {renaming?.id === list.id ? (
                  <>
                    <Input
                      className={styles.addInput}
                      size="large"
                      value={renaming.name}
                      aria-label="清单名称"
                      onChange={(_, data) => setRenaming({ ...renaming, name: data.value })}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') renameList();
                      }}
                    />
                    <Button size="large" appearance="primary" onClick={renameList}>
                      保存
                    </Button>
                    <Button size="large" appearance="secondary" onClick={() => setRenaming(null)}>
                      取消
                    </Button>
                  </>
                ) : confirmDelete === list.id ? (
                  <>
                    <Text size={300} className={styles.listText}>
                      确定删除「{list.name}」？
                    </Text>
                    <Button size="large" appearance="primary" onClick={() => deleteList(list)}>
                      确认删除
                    </Button>
                    <Button size="large" appearance="secondary" onClick={() => setConfirmDelete(null)}>
                      取消
                    </Button>
                  </>
                ) : (
                  <>
                    <div className={styles.listText}>
                      <Text size={300} title={list.name} truncate>
                        {list.name}
                      </Text>
                      <Text size={200} className={styles.desc}>
                        {storeState.tasks.filter((task) => task.listId === list.id && !task.done).length} 项未完成
                      </Text>
                    </div>
                    <Tooltip content="重命名" relationship="label">
                      <Button
                        size="large"
                        appearance="subtle"
                        className={styles.iconButton}
                        icon={<Edit20Regular />}
                        aria-label={`重命名清单 ${list.name}`}
                        onClick={() => setRenaming({ id: list.id, name: list.name })}
                      />
                    </Tooltip>
                    <Tooltip content="删除" relationship="label">
                      <Button
                        size="large"
                        appearance="subtle"
                        className={styles.iconButton}
                        icon={<Delete20Regular />}
                        aria-label={`删除清单 ${list.name}`}
                        disabled={lists.length <= 1}
                        onClick={() => setConfirmDelete(list.id)}
                      />
                    </Tooltip>
                  </>
                )}
              </div>
            ))}
            <div className={styles.addRow}>
              <Input
                className={styles.addInput}
                size="large"
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

          <section className={styles.section} aria-label="数据">
            <div className={styles.sectionHead}>
              <Text size={500} weight="semibold">
                数据
              </Text>
            </div>
            <div className={styles.row}>
              <div className={styles.rowText}>
                <Text size={300}>清空已完成任务</Text>
                <Text size={200} className={styles.desc}>
                  删除所有清单里的已完成任务，不可恢复
                </Text>
              </div>
              <Button size="large" appearance="secondary" className={styles.danger} onClick={clearCompleted}>
                清空已完成
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
