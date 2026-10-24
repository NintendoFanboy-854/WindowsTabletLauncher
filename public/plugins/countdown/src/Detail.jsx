/**
 * 倒数日详情（L1 = ?view=detail）与子页（L2）。
 *
 * L1：header 56（事件总数 + 设置… / 添加倒数日）、即将到来 / 已过去两组；
 *     行 48、标题 16、天数 20、日期 12、行尾 ⋯ 编辑/删除（删除走行内确认）。
 * L2：Subpage push，表单标题/日期/每年重复；保存 = 提交并 pop，
 *     取消 / ← 返回 = 放弃并 pop，X / Esc / 遮罩由宿主关闭整个浮层。
 * 设置只由 manifest.settings 声明；这里的「设置…」只发 requestHostSettings()。
 */

import { useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Field,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  CalendarLtr24Regular,
  ChevronDown20Regular,
  ChevronUp20Regular,
  Delete20Regular,
  Edit20Regular,
  MoreHorizontal20Regular,
} from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import { requestHostSettings } from '../../_shared/host.js';
import { Collapse, FadeSlide } from '../../_shared/motion.js';
import {
  ActionButton,
  DetailHeader,
  DetailPage,
  DetailScroll,
  EmptyState,
  ListRow,
  Subpage,
  TOUCH_TARGET,
  useNow,
} from '../../_shared/ui.jsx';
import { usePluginConfig } from './data/config.js';
import {
  DEFAULT_SETTINGS,
  ITEMS_KEY,
  SETTINGS_KEY,
  addItem,
  listEntries,
  normalizeItems,
  normalizeSettings,
  removeItem,
  toDateString,
  updateItem,
  validateDraft,
} from './data/items.js';

const useStyles = makeStyles({
  headerCount: {
    color: tokens.colorNeutralForeground3,
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  pastHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minHeight: `${TOUCH_TARGET}px`,
  },
  pastToggleButton: {
    width: `${TOUCH_TARGET}px`,
    height: `${TOUCH_TARGET}px`,
    minWidth: `${TOUCH_TARGET}px`,
    minHeight: `${TOUCH_TARGET}px`,
    padding: 0,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  rowWrap: {
    minWidth: 0,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  trailing: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  badges: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  days: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXXS,
    whiteSpace: 'nowrap',
  },
  daysValue: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  daysMuted: {
    color: tokens.colorNeutralForeground3,
  },
  pastDays: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  menuButton: {
    width: `${TOUCH_TARGET}px`,
    height: `${TOUCH_TARGET}px`,
    minWidth: `${TOUCH_TARGET}px`,
    minHeight: `${TOUCH_TARGET}px`,
    padding: 0,
  },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    minHeight: `calc(${tokens.spacingVerticalXXXL} + ${tokens.spacingVerticalL})`,
    minWidth: 0,
  },
  confirmText: {
    flex: '1 1 auto',
    minWidth: 0,
  },
  confirmActions: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: tokens.spacingHorizontalS,
  },
  danger: {
    color: tokens.colorStatusDangerForeground1,
  },
  formWrap: {
    width: '100%',
    maxWidth: '720px',
    marginInline: 'auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    minWidth: 0,
  },
  repeatRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    minHeight: `calc(${tokens.spacingVerticalXXXL} + ${tokens.spacingVerticalL})`,
  },
  repeatText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    width: '100%',
    minWidth: 0,
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    width: '100%',
  },
  footerActions: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
});

function RowMenu({ title, onEdit, onDelete }) {
  const styles = useStyles();
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          size="large"
          className={styles.menuButton}
          icon={<MoreHorizontal20Regular />}
          aria-label={`编辑或删除 ${title}`}
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem icon={<Edit20Regular />} onClick={onEdit}>
            编辑
          </MenuItem>
          <MenuItem icon={<Delete20Regular />} onClick={onDelete}>
            删除
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}

function DetailDays({ entry }) {
  const styles = useStyles();
  if (entry.status === 'past') {
    return (
      <Text size={300} className={styles.pastDays}>
        已过 {Math.abs(entry.days)} 天
      </Text>
    );
  }
  if (entry.status === 'today') {
    return (
      <span className={styles.days}>
        <Text size={500} weight="semibold" className={styles.daysValue}>
          0
        </Text>
        <Text size={200} className={styles.daysMuted}>
          天
        </Text>
      </span>
    );
  }
  return (
    <span className={styles.days}>
      <Text size={200} className={styles.daysMuted}>
        还有
      </Text>
      <Text size={500} weight="semibold" className={styles.daysValue}>
        {entry.days}
      </Text>
      <Text size={200} className={styles.daysMuted}>
        天
      </Text>
    </span>
  );
}

function CountdownRow({
  entry,
  highlightSoon,
  confirming,
  onEdit,
  onDeleteRequest,
  onCancelConfirm,
  onConfirmDelete,
}) {
  const styles = useStyles();
  const showSoon =
    highlightSoon && entry.status === 'future' && entry.days > 0 && entry.days <= 7;

  if (confirming) {
    return (
      <div className={styles.confirmRow} role="group" aria-label="确认删除">
        <Text size={300} truncate className={styles.confirmText}>
          删除「{entry.item.title}」？
        </Text>
        <div className={styles.confirmActions}>
          <ActionButton
            appearance="secondary"
            aria-label="取消删除"
            onClick={onCancelConfirm}
          >
            取消
          </ActionButton>
          <ActionButton
            appearance="secondary"
            className={styles.danger}
            aria-label="确认删除"
            onClick={onConfirmDelete}
          >
            删除
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <ListRow
      style={{ minHeight: `calc(${tokens.spacingVerticalXXXL} + ${tokens.spacingVerticalL})` }}
      title={entry.item.title}
      subtitle={entry.subtitle}
      titleSize={400}
      trailing={
        <div className={styles.trailing}>
          <div className={styles.badges}>
            {entry.status === 'today' ? (
              <Badge size="medium" appearance="tint" color="brand">
                今天
              </Badge>
            ) : null}
            {showSoon ? (
              <Badge size="medium" appearance="tint" color="brand">
                7 天内
              </Badge>
            ) : null}
          </div>
          <DetailDays entry={entry} />
          <RowMenu title={entry.item.title} onEdit={onEdit} onDelete={onDeleteRequest} />
        </div>
      }
    />
  );
}

function CountdownEditor({ item, items, writeItems, onClosed }) {
  const styles = useStyles();
  const isEditing = Boolean(item);
  const [title, setTitle] = useState(item?.title ?? '');
  const [targetDate, setTargetDate] = useState(
    item?.targetDate ?? toDateString(new Date()),
  );
  const [repeatYearly, setRepeatYearly] = useState(Boolean(item?.repeatYearly));
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = (close) => {
    const validation = validateDraft({ title, targetDate });
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError('');
    try {
      const result = isEditing
        ? updateItem(items, {
            id: item.id,
            title: validation.title,
            targetDate,
            repeatYearly,
          })
        : addItem(items, {
            title: validation.title,
            targetDate,
            repeatYearly,
          });
      writeItems(result.items);
      close();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    }
  };

  const remove = (close) => {
    if (!isEditing) return;
    try {
      const result = removeItem(items, item.id);
      writeItems(result.items);
      plugin.notify(`已删除「${result.item.title}」`);
      close();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : String(removeError));
    }
  };

  return (
    <Subpage
      title={isEditing ? '编辑倒数日' : '新增倒数日'}
      onClosed={onClosed}
      footer={(close) => (
        <div className={styles.footer}>
          {confirmDelete ? (
            <MessageBar intent="warning">
              <MessageBarBody>
                将删除「{item?.title ?? ''}」，删除后无法恢复。
              </MessageBarBody>
              <MessageBarActions>
                <ActionButton
                  appearance="secondary"
                  aria-label="取消删除"
                  onClick={() => setConfirmDelete(false)}
                >
                  取消
                </ActionButton>
                <ActionButton
                  appearance="secondary"
                  className={styles.danger}
                  aria-label="确认删除倒数日"
                  onClick={() => remove(close)}
                >
                  确认删除
                </ActionButton>
              </MessageBarActions>
            </MessageBar>
          ) : null}
          <div className={styles.footerRow}>
            {isEditing ? (
              <ActionButton
                appearance="subtle"
                className={styles.danger}
                icon={<Delete20Regular />}
                onClick={() => setConfirmDelete(true)}
              >
                删除
              </ActionButton>
            ) : (
              <span />
            )}
            <div className={styles.footerActions}>
              <ActionButton appearance="secondary" onClick={close}>
                取消
              </ActionButton>
              <ActionButton appearance="secondary" onClick={() => save(close)}>
                保存
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    >
      <div className={styles.formWrap}>
        <div className={styles.form}>
          {error ? (
            <MessageBar intent="error">
              <MessageBarBody>{error}</MessageBarBody>
            </MessageBar>
          ) : null}

          <Field label="标题" required>
            <Input
              size="large"
              value={title}
              placeholder="例如：期末考试"
              aria-label="事件标题"
              autoFocus
              onChange={(_event, data) => {
                setTitle(data.value);
                if (error) setError('');
              }}
            />
          </Field>

          <Field
            label="日期"
            required
            hint="生日 / 纪念日选择「每年重复」后按「月-日」循环"
          >
            <Input
              size="large"
              type="date"
              value={targetDate}
              aria-label="事件日期"
              onChange={(_event, data) => {
                setTargetDate(data.value);
                if (error) setError('');
              }}
            />
          </Field>

          <div className={styles.repeatRow}>
            <div className={styles.repeatText}>
              <Text size={300}>每年重复</Text>
              <Text size={200} className={styles.muted}>
                生日、纪念日等每年循环的事件
              </Text>
            </div>
            <Switch
              checked={repeatYearly}
              aria-label="每年重复"
              onChange={(_event, data) => {
                setRepeatYearly(data.checked);
                if (error) setError('');
              }}
            />
          </div>
        </div>
      </div>
    </Subpage>
  );
}

export default function CountdownDetail() {
  const styles = useStyles();
  const now = useNow(60000);
  const today = useMemo(() => new Date(now), [now]);
  const [items, setItems, itemsLoaded] = usePluginConfig(
    ITEMS_KEY,
    [],
    normalizeItems,
  );
  const [settings] = usePluginConfig(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
    normalizeSettings,
  );
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const [pastOpen, setPastOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  /** { id: string | null }：null = 新建 */
  const [editor, setEditor] = useState(null);

  const writeItems = (next) => {
    itemsRef.current = next;
    setItems(next);
  };

  const entries = useMemo(() => listEntries(items, today), [items, today]);
  const upcoming = entries.filter((entry) => entry.days >= 0);
  // 卡片上的 showPast 只决定卡内列表；详情始终保留「已过去」组，供空态「查看已过去」落地。
  const visiblePast = entries.filter((entry) => entry.days < 0);
  const count = upcoming.length + visiblePast.length;

  const finishRemove = (id) => (_event, data) => {
    if (data?.direction !== 'exit') return;
    setRemovingId(null);
    setConfirmingId(null);
    try {
      const result = removeItem(itemsRef.current, id);
      writeItems(result.items);
    } catch {
      /* 已被另一条路径删除：不重复报错 */
    }
  };

  const renderRow = (entry) => (
    <FadeSlide
      key={entry.item.id}
      visible={removingId !== entry.item.id}
      appear
      unmountOnExit
      onMotionFinish={finishRemove(entry.item.id)}
    >
      <div className={styles.rowWrap}>
        <CountdownRow
          entry={entry}
          highlightSoon={settings.highlightSoon}
          confirming={confirmingId === entry.item.id}
          onEdit={() => setEditor({ id: entry.item.id })}
          onDeleteRequest={() => setConfirmingId(entry.item.id)}
          onCancelConfirm={() => setConfirmingId(null)}
          onConfirmDelete={() => {
            setConfirmingId(null);
            setRemovingId(entry.item.id);
          }}
        />
      </div>
    </FadeSlide>
  );

  if (!itemsLoaded) {
    return <DetailPage />;
  }

  const editorItem = editor?.id
    ? items.find((item) => item.id === editor.id) ?? null
    : null;
  const editorOpen = Boolean(editor) && (!editor.id || Boolean(editorItem));

  return (
    <DetailPage>
      <DetailHeader
        trailing={
          <>
            <ActionButton onClick={requestHostSettings}>设置…</ActionButton>
            <ActionButton
              appearance="secondary"
              icon={<Add20Regular />}
              onClick={() => setEditor({ id: null })}
            >
              添加倒数日
            </ActionButton>
          </>
        }
      >
        <Text size={300} className={styles.headerCount}>
          共 {count} 个事件
        </Text>
      </DetailHeader>

      {count === 0 ? (
        <DetailScroll>
          <EmptyState
            icon={<CalendarLtr24Regular />}
            title="还没有倒数日"
            action={
              <ActionButton
                appearance="secondary"
                icon={<Add20Regular />}
                onClick={() => setEditor({ id: null })}
              >
                添加事件
              </ActionButton>
            }
          />
        </DetailScroll>
      ) : (
        <DetailScroll>
          <div className={styles.sections}>
            <section className={styles.section} aria-label="即将到来">
              <Text size={400} weight="semibold">
                即将到来
              </Text>
              {upcoming.length > 0 ? (
                <div className={styles.rows}>{upcoming.map(renderRow)}</div>
              ) : (
                <Text size={300} className={styles.muted}>
                  没有即将到来的事件
                </Text>
              )}
            </section>

            {visiblePast.length > 0 ? (
              <section className={styles.section} aria-label="已过去">
                <div className={styles.pastHeader}>
                  <Text size={400} weight="semibold">
                    已过去 {visiblePast.length}
                  </Text>
                  <ActionButton
                    appearance="subtle"
                    className={styles.pastToggleButton}
                    icon={
                      pastOpen ? <ChevronUp20Regular /> : <ChevronDown20Regular />
                    }
                    aria-label={pastOpen ? '收起已过去' : '展开已过去'}
                    aria-expanded={pastOpen}
                    onClick={() => setPastOpen((open) => !open)}
                  />
                </div>
                <Collapse visible={pastOpen}>
                  <div className={styles.rows}>{visiblePast.map(renderRow)}</div>
                </Collapse>
              </section>
            ) : null}
          </div>
        </DetailScroll>
      )}

      {editorOpen ? (
        <CountdownEditor
          key={editor.id ?? 'new'}
          item={editorItem}
          items={items}
          writeItems={writeItems}
          onClosed={() => setEditor(null)}
        />
      ) : null}
    </DetailPage>
  );
}
