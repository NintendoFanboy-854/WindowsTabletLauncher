/**
 * 任务详情浮层视图（宿主 ?view=detail 全窗口 Fluent Dialog 里加载）。
 *
 * 排版遵循 docs/OVERLAY-REWRITE-SPEC.md §3.3：
 * - 不画页面标题/关闭按钮（宿主 Dialog 提供）；
 * - 表单 max-width 720 居中，Field 上下布局（label 14 / 控件 40 / 间距 16）；
 * - 子任务/标签行高 44，40 图标操作；新增行 input 40 + 按钮 40；
 * - 底部固定操作条：删除 danger（左）+ 取消/保存 40（右）。
 */

import { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Dropdown,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Option,
  ProgressBar,
  Radio,
  RadioGroup,
  Text,
  Textarea,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add20Regular, Delete20Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { combineDateTime, RECURRENCES, toLocalInput } from '../js/date.js';
import { store } from '../js/store.js';
import { readOverlayPayload, useTodoStore } from './todoData.js';

const PRIORITY_LABELS = ['无', '低', '中', '高'];
const RECURRENCE_OPTIONS = [{ value: '', label: '不重复' }, ...RECURRENCES];

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
    paddingBottom: tokens.spacingVerticalM,
  },
  form: {
    width: '100%',
    maxWidth: '720px',
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    minWidth: 0,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    minHeight: '40px',
  },
  dateInput: { flex: 1, minWidth: '160px' },
  timeInput: { width: '120px' },
  grow: { flex: 1, minWidth: 0 },
  tagRow: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS, flexWrap: 'wrap' },
  subRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '44px',
    minWidth: 0,
  },
  subTitle: { flex: 1, minWidth: 0, color: tokens.colorNeutralForeground2 },
  subDone: { textDecorationLine: 'line-through', color: tokens.colorNeutralForeground3 },
  iconButton: { minWidth: '40px', minHeight: '40px' },
  subtle: { color: tokens.colorNeutralForeground3 },
  spacer: { flex: 1 },
  footer: {
    width: '100%',
    maxWidth: '720px',
    marginInline: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalM} 0 ${tokens.spacingVerticalL}`,
    flexShrink: 0,
  },
  dangerButton: { color: tokens.colorPaletteRedForeground1 },
  progress: { marginBottom: tokens.spacingVerticalXS },
});

function splitLocal(iso, dateOnly = false) {
  const local = toLocalInput(iso) || '';
  const [date, time] = local.split('T');
  return { date: date || '', time: dateOnly && time === '23:59' ? '' : time || '' };
}

function closeOverlay() {
  window.parent.postMessage({ type: 'plugin:request-overlay-close' }, '*');
}

export default function TodoDetail() {
  const styles = useStyles();
  useTodoStore();
  const payload = useMemo(() => readOverlayPayload() || {}, []);
  const isNew = payload?.mode === 'new';
  // 独立预览（没有浮层载荷）时回落到第一条未完成任务，便于截图/联调
  const taskId = payload?.taskId || (isNew ? null : store.state.tasks.find((item) => !item.done)?.id || null);
  const task = taskId ? store.taskById(taskId) : null;

  const [title, setTitle] = useState(() => task?.title || '');
  const [note, setNote] = useState(() => task?.note || '');
  const [priority, setPriority] = useState(String(task?.priority ?? 0));
  const [listId, setListId] = useState(() => task?.listId || payload?.listId || store.lists[0]?.id);
  const [due, setDue] = useState(() => splitLocal(task?.dueAt, true));
  const [remind, setRemind] = useState(() => splitLocal(task?.remindAt));
  const [recurrence, setRecurrence] = useState(() => task?.recurrence || '');
  const [tags, setTags] = useState(() => [...(task?.tags || [])]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState(() =>
    (task?.subtasks || []).slice().sort((a, b) => a.order - b.order).map((sub) => ({ ...sub })),
  );
  const [subInput, setSubInput] = useState('');
  const [message, setMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const list = store.listById(listId) || store.lists[0];
  const doneCount = subtasks.filter((sub) => sub.done).length;
  const progress = subtasks.length ? doneCount / subtasks.length : 0;

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    setTags((previous) => (previous.includes(value) ? previous : [...previous, value]));
    setTagInput('');
  };

  const removeTag = (tag) => setTags((previous) => previous.filter((item) => item !== tag));

  const addSubtask = () => {
    const value = subInput.trim();
    if (!value) return;
    setSubtasks((previous) => [...previous, { id: null, title: value, done: false }]);
    setSubInput('');
  };

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setMessage({ intent: 'error', text: '标题不能为空' });
      return;
    }
    const dueAt = due.date ? combineDateTime(due.date, due.time || null) : null;
    const remindAt = remind.date ? combineDateTime(remind.date, remind.time || '09:00') : null;
    const base = {
      title: trimmed,
      note: note.trim() || undefined,
      priority: Number(priority),
      dueAt,
      remindAt,
      recurrence: recurrence || null,
      tags,
      listId,
    };
    try {
      if (isNew || !task) {
        const created = store.addTask({
          ...base,
          subtasks: subtasks.map((sub) => sub.title),
        });
        setMessage({ intent: 'success', text: `已创建「${created.title}」` });
        closeOverlay();
      } else {
        const updated = store.updateTask(task.id, base);
        applySubtaskDiff(updated.id, subtasks);
        setMessage({ intent: 'success', text: '已保存' });
      }
    } catch (error) {
      setMessage({ intent: 'error', text: error instanceof Error ? error.message : String(error) });
    }
  };

  const removeTask = () => {
    try {
      store.removeTask(task.id);
      setConfirmDelete(false);
      closeOverlay();
    } catch (error) {
      setMessage({ intent: 'error', text: error instanceof Error ? error.message : String(error) });
    }
  };

  if (!isNew && taskId && !task) {
    return (
      <div className={styles.root}>
        <div className={styles.scroll}>
          <div className={styles.form}>
            <MessageBar intent="error">
              <MessageBarBody>任务不存在或已被删除</MessageBarBody>
            </MessageBar>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <div className={styles.form}>
          {message ? (
            <MessageBar intent={message.intent} onDismiss={() => setMessage(null)}>
              <MessageBarBody>{message.text}</MessageBarBody>
            </MessageBar>
          ) : null}

          <Field label="标题" required>
            <Input size="large" value={title} onChange={(_, data) => setTitle(data.value)} placeholder="要做什么" />
          </Field>

          <Field label="备注" hint="可留空">
            <Textarea value={note} onChange={(_, data) => setNote(data.value)} rows={3} resize="vertical" />
          </Field>

          <Field label="清单">
            <Dropdown
              size="large"
              value={list?.name || ''}
              selectedOptions={listId ? [listId] : []}
              onOptionSelect={(_, data) => setListId(data.optionValue)}
            >
              {store.lists.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Dropdown>
          </Field>

          <Field label="优先级">
            <RadioGroup layout="horizontal" value={priority} onChange={(_, data) => setPriority(data.value)}>
              {PRIORITY_LABELS.map((label, value) => (
                <Radio key={value} value={String(value)} label={label} />
              ))}
            </RadioGroup>
          </Field>

          <Field label="截止时间" hint="只选日期时按当天 23:59 到期">
            <div className={styles.inputRow}>
              <Input
                type="date"
                size="large"
                className={styles.dateInput}
                value={due.date}
                onChange={(_, data) => setDue((previous) => ({ ...previous, date: data.value }))}
              />
              <Input
                type="time"
                size="large"
                className={styles.timeInput}
                value={due.time}
                onChange={(_, data) => setDue((previous) => ({ ...previous, time: data.value }))}
              />
              <Button size="large" appearance="secondary" onClick={() => setDue({ date: '', time: '' })}>
                清除
              </Button>
            </div>
          </Field>

          <Field label="提醒" hint="到点后在桌面提示">
            <div className={styles.inputRow}>
              <Input
                type="date"
                size="large"
                className={styles.dateInput}
                value={remind.date}
                onChange={(_, data) => setRemind((previous) => ({ ...previous, date: data.value }))}
              />
              <Input
                type="time"
                size="large"
                className={styles.timeInput}
                value={remind.time}
                onChange={(_, data) => setRemind((previous) => ({ ...previous, time: data.value }))}
              />
              <Button size="large" appearance="secondary" onClick={() => setRemind({ date: '', time: '' })}>
                清除
              </Button>
            </div>
          </Field>

          <Field label="重复">
            <Dropdown
              size="large"
              value={RECURRENCE_OPTIONS.find((option) => option.value === recurrence)?.label || '不重复'}
              selectedOptions={[recurrence]}
              onOptionSelect={(_, data) => setRecurrence(data.optionValue)}
            >
              {RECURRENCE_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Dropdown>
          </Field>

          <Field label="标签">
            <div className={styles.tagRow}>
              {tags.map((tag) => (
                <Button
                  key={tag}
                  size="large"
                  appearance="outline"
                  icon={<Dismiss20Regular />}
                  iconPosition="after"
                  aria-label={`移除标签 ${tag}`}
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
            <div className={styles.inputRow}>
              <Input
                className={styles.grow}
                size="large"
                value={tagInput}
                placeholder="输入标签后回车"
                onChange={(_, data) => setTagInput(data.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button size="large" appearance="secondary" icon={<Add20Regular />} onClick={addTag}>
                添加标签
              </Button>
            </div>
          </Field>

          <Field label={`子任务${subtasks.length ? `（${doneCount}/${subtasks.length}）` : ''}`}>
            {subtasks.length > 0 ? (
              <ProgressBar className={styles.progress} value={progress} aria-label="子任务完成度" />
            ) : null}
            {subtasks.map((sub, index) => (
              <div key={`${sub.id || 'new'}-${index}`} className={styles.subRow}>
                <Checkbox
                  checked={sub.done}
                  aria-label={sub.title}
                  onChange={() =>
                    setSubtasks((previous) =>
                      previous.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, done: !item.done } : item,
                      ),
                    )
                  }
                />
                <Text
                  size={400}
                  className={sub.done ? `${styles.subTitle} ${styles.subDone}` : styles.subTitle}
                  truncate
                  title={sub.title}
                >
                  {sub.title}
                </Text>
                <Button
                  size="large"
                  appearance="subtle"
                  className={styles.iconButton}
                  icon={<Delete20Regular />}
                  aria-label={`删除子任务 ${sub.title}`}
                  onClick={() => setSubtasks((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
                />
              </div>
            ))}
            <div className={styles.inputRow}>
              <Input
                className={styles.grow}
                size="large"
                value={subInput}
                placeholder="输入子任务后回车"
                onChange={(_, data) => setSubInput(data.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addSubtask();
                  }
                }}
              />
              <Button size="large" appearance="secondary" icon={<Add20Regular />} onClick={addSubtask}>
                添加子任务
              </Button>
            </div>
          </Field>

          {confirmDelete ? (
            <MessageBar intent="warning">
              <MessageBarBody>删除后不可恢复，确定删除这个任务？</MessageBarBody>
              <Button size="large" appearance="primary" className={styles.dangerButton} onClick={removeTask}>
                确认删除
              </Button>
              <Button size="large" appearance="secondary" onClick={() => setConfirmDelete(false)}>
                取消
              </Button>
            </MessageBar>
          ) : null}
        </div>
      </div>

      <div className={styles.footer}>
        {!isNew && task ? (
          <Button
            size="large"
            appearance="subtle"
            icon={<Delete20Regular />}
            className={styles.dangerButton}
            onClick={() => setConfirmDelete(true)}
            disabled={confirmDelete}
          >
            删除
          </Button>
        ) : null}
        <span className={styles.spacer} />
        <Text size={200} className={styles.subtle}>
          Esc 关闭
        </Text>
        <Button size="large" appearance="secondary" onClick={closeOverlay}>
          取消
        </Button>
        <Button size="large" appearance="primary" onClick={save}>
          {isNew ? '创建任务' : '保存'}
        </Button>
      </div>
    </div>
  );
}

/** 把编辑面板里的子任务草稿同步到 store（新增 / 勾选 / 删除） */
function applySubtaskDiff(taskId, draftSubtasks) {
  const task = store.taskById(taskId);
  if (!task) return;
  const draftIds = new Set(draftSubtasks.filter((sub) => sub.id).map((sub) => sub.id));
  for (const sub of [...task.subtasks]) {
    if (!draftIds.has(sub.id)) store.removeSubtask(taskId, sub.id);
  }
  for (const sub of draftSubtasks) {
    if (!sub.id) {
      store.addSubtask(taskId, sub.title);
      continue;
    }
    const current = store.taskById(taskId)?.subtasks.find((item) => item.id === sub.id);
    if (current && current.done !== sub.done) store.completeSubtask(taskId, sub.id, sub.done);
  }
}
