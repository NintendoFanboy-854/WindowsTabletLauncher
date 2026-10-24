/**
 * L2 任务编辑（push 在详情浮层内，不是第二个 Dialog）：
 *
 * - header 56：← 返回 +「编辑任务 / 新建任务」16 semibold（Subpage 提供）；
 * - 表单 max-width 720：标题 / 备注 / 清单 / 优先级 / 截止 / 提醒 / 重复 / 标签 / 子任务；
 * - footer 固定：编辑时左侧 danger「删除」（行内确认）+ 右侧「取消」「保存」；
 * - 保存 = 提交并 pop 回 L1；取消/返回 = 丢弃草稿并 pop；X/Esc/遮罩 = 关闭整个浮层（宿主）。
 *
 * 所有字段先写草稿 state，只有「保存」才写 store；这样取消/返回天然不写入。
 */

import { useState } from 'react';
import {
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
import { Add20Regular, Delete20Regular, Dismiss16Regular } from '@fluentui/react-icons';
import { ActionButton, LIST_ROW_HEIGHT, Subpage, TOUCH_TARGET } from '../../_shared/ui.jsx';
import {
  RECURRENCES,
  combineDateTime,
  toLocalInput,
  priorityMeta,
} from '../js/date.js';
import { store } from '../js/store.js';
import { EllipsisText } from './parts.jsx';

const PRIORITY_OPTIONS = [0, 1, 2, 3].map((value) => ({ value, label: priorityMeta(value).label }));
const RECURRENCE_OPTIONS = [{ value: '', label: '不重复' }, ...RECURRENCES];

const useStyles = makeStyles({
  form: {
    width: '100%',
    maxWidth: '720px',
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    minWidth: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    minHeight: `${TOUCH_TARGET}px`,
  },
  dateInput: { flex: 1, minWidth: '160px' },
  timeInput: { width: '120px' },
  grow: { flex: 1, minWidth: 0 },
  chips: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
  },
  subtaskRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: `${LIST_ROW_HEIGHT}px`,
    minWidth: 0,
  },
  subtaskTitle: { flex: 1, minWidth: 0, color: tokens.colorNeutralForeground2 },
  subtaskDone: {
    color: tokens.colorNeutralForeground3,
  },
  iconButton: { minWidth: `${TOUCH_TARGET}px`, minHeight: `${TOUCH_TARGET}px` },
  muted: { color: tokens.colorNeutralForeground3 },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    width: '100%',
    minWidth: 0,
    flexWrap: 'wrap',
  },
  footerGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  danger: { color: tokens.colorStatusDangerForeground1 },
  confirmText: { color: tokens.colorNeutralForeground3 },
  progress: { marginBottom: tokens.spacingVerticalXS },
});

function splitLocal(iso, { dateOnly = false } = {}) {
  const local = toLocalInput(iso) || '';
  const [date, time] = local.split('T');
  return {
    date: date || '',
    time: dateOnly && time === '23:59' ? '' : time || '',
  };
}

function applySubtaskDiff(taskId, draft) {
  const task = store.taskById(taskId);
  if (!task) return;
  const draftById = new Map(draft.filter((sub) => sub.id).map((sub) => [sub.id, sub]));
  for (const sub of [...task.subtasks]) {
    if (!draftById.has(sub.id)) store.removeSubtask(taskId, sub.id);
  }
  for (const sub of draft) {
    if (!sub.id) {
      store.addSubtask(taskId, sub.title);
      continue;
    }
    const current = store.taskById(taskId)?.subtasks.find((item) => item.id === sub.id);
    if (current && current.done !== sub.done) store.completeSubtask(taskId, sub.id, sub.done);
  }
}

export function TaskEditor({ mode, taskId, initialListId, initialDueDate, settings, onClosed }) {
  const styles = useStyles();
  const editing = mode === 'edit';
  const task = editing ? store.taskById(taskId) : null;
  const fallbackListId =
    initialListId && store.listById(initialListId)
      ? initialListId
      : store.settings.defaultListId && store.listById(store.settings.defaultListId)
        ? store.settings.defaultListId
        : store.lists[0]?.id;

  const [title, setTitle] = useState(() => task?.title || '');
  const [note, setNote] = useState(() => task?.note || '');
  const [listId, setListId] = useState(() => task?.listId || fallbackListId);
  const [priority, setPriority] = useState(() => String(task?.priority ?? 0));
  const [due, setDue] = useState(() =>
    task
      ? splitLocal(task.dueAt, { dateOnly: true })
      : { date: initialDueDate || '', time: '' },
  );
  const [remind, setRemind] = useState(() => (task ? splitLocal(task.remindAt) : { date: '', time: '' }));
  const [recurrence, setRecurrence] = useState(() => task?.recurrence || '');
  const [tags, setTags] = useState(() => [...(task?.tags || [])]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState(() =>
    (task?.subtasks || []).slice().sort((a, b) => a.order - b.order).map((sub) => ({ ...sub })),
  );
  const [subInput, setSubInput] = useState('');
  const [error, setError] = useState(null);
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

  const addSubtask = () => {
    const value = subInput.trim();
    if (!value) return;
    setSubtasks((previous) => [
      ...previous,
      { id: null, title: value, done: false, order: previous.length },
    ]);
    setSubInput('');
  };

  const save = (close) => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('标题不能为空');
      return;
    }
    const dueAt = due.date ? combineDateTime(due.date, due.time || null) : null;
    const remindAt = remind.date ? combineDateTime(remind.date, remind.time || '09:00') : null;
    const base = {
      title: trimmed,
      note: note.trim(),
      priority: Number(priority),
      dueAt,
      remindAt,
      recurrence: recurrence || null,
      tags,
      listId,
    };
    try {
      if (editing) {
        if (!task) throw new Error('任务不存在或已被删除');
        store.updateTask(task.id, base);
        applySubtaskDiff(task.id, subtasks);
      } else {
        store.addTask({
          ...base,
          subtasks: subtasks.map((sub) => ({ title: sub.title, done: sub.done })),
        });
      }
      close();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    }
  };

  const removeTask = (close) => {
    try {
      if (!task) throw new Error('任务不存在或已被删除');
      store.removeTask(task.id);
      close();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : String(removeError));
    }
  };

  const footer = (close) => (
    <div className={styles.footer}>
      <div className={styles.footerGroup}>
        {editing && task && !confirmDelete ? (
          <ActionButton
            appearance="subtle"
            className={styles.danger}
            icon={<Delete20Regular />}
            onClick={() => setConfirmDelete(true)}
          >
            删除
          </ActionButton>
        ) : null}
        {confirmDelete ? (
          <>
            <Text size={200} className={styles.confirmText}>
              删除后不可恢复
            </Text>
            <ActionButton appearance="secondary" onClick={() => removeTask(close)}>
              确认删除
            </ActionButton>
            <ActionButton onClick={() => setConfirmDelete(false)}>取消</ActionButton>
          </>
        ) : null}
      </div>
      {confirmDelete ? null : (
        <div className={styles.footerGroup}>
          <ActionButton onClick={close}>取消</ActionButton>
          <ActionButton appearance="secondary" onClick={() => save(close)}>
            保存
          </ActionButton>
        </div>
      )}
    </div>
  );

  return (
    <Subpage title={editing ? '编辑任务' : '新建任务'} footer={footer} onClosed={onClosed}>
      <div className={styles.form}>
        {error ? (
          <MessageBar intent="error" onDismiss={() => setError(null)}>
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        ) : null}

        <Field label="标题" required>
          <Input
            size="large"
            value={title}
            placeholder="要做什么"
            aria-label="任务标题"
            onChange={(_event, data) => setTitle(data.value)}
          />
        </Field>

        <Field label="备注" hint="可留空">
          <Textarea
            value={note}
            rows={3}
            resize="vertical"
            aria-label="任务备注"
            onChange={(_event, data) => setNote(data.value)}
          />
        </Field>

        <Field label="清单">
          <Dropdown
            size="large"
            value={list?.name || ''}
            selectedOptions={listId ? [listId] : []}
            aria-label="任务清单"
            onOptionSelect={(_event, data) => setListId(data.optionValue)}
          >
            {store.lists.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Dropdown>
        </Field>

        <Field label="优先级">
          <RadioGroup
            layout="horizontal"
            value={priority}
            aria-label="优先级"
            onChange={(_event, data) => setPriority(data.value)}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <Radio key={option.value} value={String(option.value)} label={option.label} />
            ))}
          </RadioGroup>
        </Field>

        <Field label="截止时间" hint="只选日期时按当天 23:59 到期">
          <div className={styles.row}>
            <Input
              type="date"
              size="large"
              className={styles.dateInput}
              value={due.date}
              aria-label="截止日期"
              onChange={(_event, data) => setDue((previous) => ({ ...previous, date: data.value }))}
            />
            <Input
              type="time"
              size="large"
              className={styles.timeInput}
              value={due.time}
              aria-label="截止时间"
              onChange={(_event, data) => setDue((previous) => ({ ...previous, time: data.value }))}
            />
            <ActionButton
              appearance="secondary"
              onClick={() => setDue({ date: '', time: '' })}
              aria-label="清除截止时间"
            >
              清除
            </ActionButton>
          </div>
        </Field>

        <Field label="提醒" hint="到点后在桌面提示">
          <div className={styles.row}>
            <Input
              type="date"
              size="large"
              className={styles.dateInput}
              value={remind.date}
              aria-label="提醒日期"
              onChange={(_event, data) => setRemind((previous) => ({ ...previous, date: data.value }))}
            />
            <Input
              type="time"
              size="large"
              className={styles.timeInput}
              value={remind.time}
              aria-label="提醒时间"
              onChange={(_event, data) => setRemind((previous) => ({ ...previous, time: data.value }))}
            />
            <ActionButton
              appearance="secondary"
              onClick={() => setRemind({ date: '', time: '' })}
              aria-label="清除提醒"
            >
              清除
            </ActionButton>
          </div>
        </Field>

        <Field label="重复">
          <Dropdown
            size="large"
            value={RECURRENCE_OPTIONS.find((option) => option.value === recurrence)?.label || '不重复'}
            selectedOptions={recurrence ? [recurrence] : []}
            aria-label="重复规则"
            onOptionSelect={(_event, data) => setRecurrence(data.optionValue)}
          >
            {RECURRENCE_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Dropdown>
        </Field>

        <Field label="标签">
          {tags.length > 0 ? (
            <div className={styles.chips}>
              {tags.map((tag) => (
                <ActionButton
                  key={tag}
                  appearance="outline"
                  icon={<Dismiss16Regular />}
                  iconPosition="after"
                  aria-label={`移除标签 ${tag}`}
                  onClick={() => setTags((previous) => previous.filter((item) => item !== tag))}
                >
                  {tag}
                </ActionButton>
              ))}
            </div>
          ) : null}
          <div className={styles.row}>
            <Input
              className={styles.grow}
              size="large"
              value={tagInput}
              placeholder="输入标签后回车"
              aria-label="新标签"
              onChange={(_event, data) => setTagInput(data.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                addTag();
              }}
            />
            <ActionButton appearance="secondary" icon={<Add20Regular />} onClick={addTag}>
              添加标签
            </ActionButton>
          </div>
        </Field>

        <Field label={subtasks.length ? `子任务（${doneCount}/${subtasks.length}）` : '子任务'}>
          {subtasks.length > 0 ? (
            <ProgressBar className={styles.progress} value={progress} aria-label="子任务完成度" />
          ) : null}
          {subtasks.map((sub, index) => (
            <div key={`${sub.id || 'new'}-${index}`} className={styles.subtaskRow}>
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
                className={
                  sub.done ? `${styles.subtaskTitle} ${styles.subtaskDone}` : styles.subtaskTitle
                }
              >
                <EllipsisText>{sub.title}</EllipsisText>
              </Text>
              <ActionButton
                appearance="subtle"
                className={styles.iconButton}
                icon={<Delete20Regular />}
                aria-label={`删除子任务 ${sub.title}`}
                onClick={() =>
                  setSubtasks((previous) => previous.filter((_item, itemIndex) => itemIndex !== index))
                }
              />
            </div>
          ))}
          <div className={styles.row}>
            <Input
              className={styles.grow}
              size="large"
              value={subInput}
              placeholder="输入子任务后回车"
              aria-label="新子任务"
              onChange={(_event, data) => setSubInput(data.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                addSubtask();
              }}
            />
            <ActionButton appearance="secondary" icon={<Add20Regular />} onClick={addSubtask}>
              添加子任务
            </ActionButton>
          </div>
        </Field>

        {editing ? (
          <Text size={200} className={styles.muted}>
            保存只更新这条任务；X / Esc / 点遮罩会关闭整个详情浮层。
          </Text>
        ) : null}
      </div>
    </Subpage>
  );
}
