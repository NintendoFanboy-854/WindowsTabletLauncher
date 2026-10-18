/**
 * 全局通知（B2）：Fluent Toaster + 强提醒遮罩，实现桥接层的 `BridgeServices`。
 *
 * 用法（App 接线）：
 * ```tsx
 * const bridge = getHostBridge();
 * <NotificationsProvider bridge={bridge}>
 *   <AppShell />
 * </NotificationsProvider>
 * ```
 * Provider 挂载后会把 `notify` / `showReminder` 注册进 HostBridge；插件调
 * `notify`、`showReminder` 时就走这里。`useHostNotifications()` 给宿主自己的界面用。
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Toast,
  ToastTitle,
  Toaster,
  useToastController,
} from '@fluentui/react-components';

import type { HostBridge, BridgeServices } from '../bridge';
import type { ReminderResult, ShowReminderParams } from '../bridge/types';
import { ReminderDialog, type PendingReminder } from './ReminderDialog';

export const HOST_TOASTER_ID = 'wtsl-host';

export type HostNotifications = BridgeServices;

const NotificationsContext = createContext<HostNotifications | null>(null);

export interface NotificationsProviderProps {
  /** 传入后会接管通知/强提醒；不传只对子树生效（演示页用） */
  bridge?: HostBridge;
  children: ReactNode;
}

export function NotificationsProvider({ bridge, children }: NotificationsProviderProps) {
  const { dispatchToast } = useToastController(HOST_TOASTER_ID);
  const [reminder, setReminder] = useState<PendingReminder | null>(null);
  const pendingRef = useRef<PendingReminder | null>(null);
  const seqRef = useRef(0);

  const notify = useCallback(
    (text: string) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{text}</ToastTitle>
        </Toast>,
        { intent: 'info' },
      );
    },
    [dispatchToast],
  );

  const finishReminder = useCallback((result: ReminderResult) => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    setReminder(null);
    pending.resolve(result);
  }, []);

  const showReminder = useCallback((params: ShowReminderParams) => {
    return new Promise<ReminderResult>((resolve) => {
      // 同时只留一条：旧提醒按“关闭”结算
      const previous = pendingRef.current;
      if (previous) {
        pendingRef.current = null;
        previous.resolve({});
      }
      seqRef.current += 1;
      const request: PendingReminder = { id: seqRef.current, params, resolve };
      pendingRef.current = request;
      setReminder(request);
    });
  }, []);

  const services = useMemo<HostNotifications>(
    () => ({ notify, showReminder }),
    [notify, showReminder],
  );

  useEffect(() => {
    if (!bridge) return;
    bridge.setServices(services);
    return () => {
      // Provider 卸载后回到默认（console 兜底），避免桥接层拿着失效的 setState
      bridge.setServices({
        notify: (text) => console.info('[notify]', text),
        showReminder: async () => ({}),
      });
    };
  }, [bridge, services]);

  return (
    <NotificationsContext.Provider value={services}>
      <Toaster toasterId={HOST_TOASTER_ID} position="bottom-end" />
      {children}
      <ReminderDialog reminder={reminder} onResolve={finishReminder} />
    </NotificationsContext.Provider>
  );
}

export function useHostNotifications(): HostNotifications {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useHostNotifications 必须在 <NotificationsProvider> 里使用');
  }
  return context;
}
