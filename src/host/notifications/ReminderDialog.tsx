/**
 * 强提醒遮罩（B2）：全屏模态 + Fluent Dialog。
 *
 * 契约（bridge/types.ts）：resolve 用户点击的 `actionId`；点关闭 / Esc / 点背景 /
 * 超时都 resolve `{}`。同时只显示一条提醒，新的提醒进来会先把旧的 resolve 成 `{}`。
 */

import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';

import type { ReminderResult, ShowReminderParams } from '../bridge/types';

export interface PendingReminder {
  id: number;
  params: ShowReminderParams;
  resolve: (result: ReminderResult) => void;
}

export interface ReminderDialogProps {
  /** 当前要显示的提醒；null 表示关闭 */
  reminder: PendingReminder | null;
  onResolve: (result: ReminderResult) => void;
}

const useStyles = makeStyles({
  surface: {
    maxWidth: 'min(560px, 92vw)',
    width: 'min(560px, 92vw)',
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow64,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  body: {
    display: 'grid',
    gap: tokens.spacingVerticalM,
  },
  title: {
    margin: 0,
  },
  message: {
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'pre-wrap',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
  },
});

export function ReminderDialog({ reminder, onResolve }: ReminderDialogProps) {
  const styles = useStyles();
  // 关闭动画期间还要渲染上一次的内容，避免弹窗先变空再消失
  const [shown, setShown] = useState<ShowReminderParams | null>(null);
  const open = reminder !== null;

  useEffect(() => {
    if (reminder) setShown(reminder.params);
  }, [reminder]);

  const autoDismissSec = reminder?.params.autoDismissSec;
  useEffect(() => {
    if (!reminder || typeof autoDismissSec !== 'number' || autoDismissSec <= 0) return;
    const timer = window.setTimeout(() => onResolve({}), autoDismissSec * 1000);
    return () => window.clearTimeout(timer);
  }, [reminder, autoDismissSec, onResolve]);

  const actions = shown?.actions ?? [];

  return (
    <Dialog
      open={open}
      modalType="modal"
      onOpenChange={(_event, data) => {
        if (!data.open) onResolve({});
      }}
    >
      <DialogSurface className={styles.surface} aria-label={shown?.title ?? '提醒'}>
        <DialogBody className={styles.body}>
          <DialogTitle className={styles.title}>{shown?.title ?? '提醒'}</DialogTitle>
          {shown?.message && (
            <DialogContent>
              <Text className={styles.message} size={400}>
                {shown.message}
              </Text>
            </DialogContent>
          )}
          <DialogActions className={styles.actions}>
            {actions.length === 0 ? (
              <Button appearance="primary" onClick={() => onResolve({})}>
                知道了
              </Button>
            ) : (
              actions.map((action) => (
                <Button
                  key={action.id}
                  appearance={action.kind === 'primary' ? 'primary' : 'secondary'}
                  onClick={() => onResolve({ actionId: action.id })}
                >
                  {action.text}
                </Button>
              ))
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
