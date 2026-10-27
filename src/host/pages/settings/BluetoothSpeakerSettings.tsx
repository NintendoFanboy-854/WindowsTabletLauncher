/**
 * 蓝牙音箱设置分组（A2DP Sink，宿主系统能力）。
 *
 * 形态（D-39 / D-43 收敛后）：**设置页「常规 → 设备」里的一个分组**，不新增页面/路由/图标/搜索项。
 * 日常连接、断连、音量/亮度这些即时操作在桌面状态栏的快速设置面板里（`QuickSettingsPanel`）；
 * 这里只保留「需要看清状态再改」的长期项：蓝牙开关、自动连接、首选设备、错误详情与系统兜底入口。
 * 因而 **不重复** 面板里的设备列表点击连接 / 断开按钮——两处只保留一处可编辑（D-43）。
 *
 * 状态全部来自宿主快照（轮询），不写说明书、不造 hero、不引新视觉语言。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Dropdown,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Option,
  Spinner,
  Switch,
  tokens,
  makeStyles,
} from '@fluentui/react-components';
import { Star20Filled } from '@fluentui/react-icons';

import { TOUCH_TARGET_CSS } from '../../design/metrics';
import { isTauriRuntime } from '../../plugins/tauri';
import {
  AUTO_CONNECT_STATE_TEXT,
  btAudioOpenSettings,
  btAudioRefresh,
  btAudioResumeAuto,
  btAudioSetAutoConnect,
  btAudioSetBluetooth,
  btAudioSetPreferred,
  btAudioSnapshot,
  orderedDevices,
  type BtAudioSnapshot,
  type BtDeviceInfo,
} from '../../system/bluetoothAudio';
import { SettingsGroup, SettingsRow } from './SettingsBlocks';

/** 设置页分组轮询间隔：只在挂载期间跑；命令进行中跳过，避免旧快照覆盖 */
const POLL_INTERVAL_MS = 1500;

type BusyAction = 'bluetooth' | 'autoConnect' | 'preferred' | 'resume' | 'refresh';

interface FriendlyError {
  title: string;
  detail: string;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** `lastError` 前缀归一成两行用户文案；不透传 HRESULT。 */
function friendlyError(message: string | null): FriendlyError | null {
  if (!message) return null;
  if (/^(创建音频连接失败|启用音频接收失败|建立音频连接失败|读取连接状态失败)/.test(message)) {
    return { title: '连接失败', detail: '手机上确认在范围内再试一次' };
  }
  if (/^(枚举音频设备失败|蓝牙音频不可用)/.test(message)) {
    return { title: '读取设备失败', detail: '到系统蓝牙设置里检查' };
  }
  if (
    /^(系统不允许切换蓝牙开关|没有找到蓝牙无线电|切换蓝牙失败|读取蓝牙状态失败)/.test(message)
  ) {
    return { title: '打开蓝牙失败', detail: '系统没有允许蓝牙操作' };
  }
  if (/自动连接|尝试连接|回连/.test(message)) {
    return { title: '自动连接失败', detail: '稍后会自动重试，也可以现在手动连接' };
  }
  return { title: '蓝牙操作失败', detail: '重试一次' };
}

function deviceName(device: BtDeviceInfo | null | undefined): string {
  return device?.name ?? '蓝牙设备';
}

const useStyles = makeStyles({
  touch: {
    minHeight: TOUCH_TARGET_CSS,
  },
  select: {
    minWidth: `calc(${tokens.spacingHorizontalXXXL} * 5)`,
  },
  control: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  errorBody: {
    color: tokens.colorNeutralForeground2,
  },
  optionText: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  star: {
    color: tokens.colorBrandForeground1,
  },
});

export function BluetoothSpeakerSettings() {
  const styles = useStyles();
  const tauri = isTauriRuntime();

  const [snapshot, setSnapshot] = useState<BtAudioSnapshot | null>(null);
  const [loading, setLoading] = useState(tauri);
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  /** 最近一次失败动作的重试入口：错误条「重试」优先重放它，而不是只刷新状态。 */
  const retryRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!tauri) return;
    retryRef.current = () => {
      void load();
    };
    try {
      const next = await btAudioRefresh();
      if (!mountedRef.current) return;
      setSnapshot(next);
      setPageError(null);
      retryRef.current = null;
    } catch (error) {
      if (!mountedRef.current) return;
      console.warn('[bt-audio] 读取状态失败', error);
      setPageError(errorText(error));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [tauri]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!tauri) return undefined;
    const timer = window.setInterval(() => {
      if (busyRef.current || !mountedRef.current) return;
      void btAudioSnapshot()
        .then((next) => {
          if (mountedRef.current) setSnapshot(next);
        })
        .catch(() => {
          /* 轮询失败不覆盖已有画面；下一次 tick 再试 */
        });
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [tauri]);

  const run = useCallback(
    async (action: BusyAction, task: () => Promise<BtAudioSnapshot>) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(action);
      setPageError(null);
      retryRef.current = () => {
        void run(action, task);
      };
      try {
        const next = await task();
        if (!mountedRef.current) return;
        setSnapshot(next);
        if (next.lastError) {
          setPageError(next.lastError);
        } else {
          retryRef.current = null;
        }
      } catch (error) {
        if (mountedRef.current) {
          console.warn('[bt-audio] 操作失败', error);
          setPageError(errorText(error));
        }
      } finally {
        busyRef.current = false;
        if (mountedRef.current) setBusy(null);
      }
    },
    [],
  );

  const toggleBluetooth = useCallback(
    (on: boolean) => {
      void run('bluetooth', () => btAudioSetBluetooth(on));
    },
    [run],
  );

  const changeAutoConnect = useCallback(
    (enabled: boolean) => {
      void run('autoConnect', async () => {
        const next = await btAudioSetAutoConnect(enabled);
        // 重新打开自动连接时顺带解除「手动断开」造成的 paused（D-44 用户意图）
        if (enabled && next.autoConnectState === 'paused') {
          return btAudioResumeAuto();
        }
        return next;
      });
    },
    [run],
  );

  const resumeAuto = useCallback(() => {
    void run('resume', () => btAudioResumeAuto());
  }, [run]);

  const changePreferred = useCallback(
    (deviceId: string | null) => {
      void run('preferred', () => btAudioSetPreferred(deviceId));
    },
    [run],
  );

  const openSystemBluetooth = useCallback(async () => {
    try {
      await btAudioOpenSettings();
    } catch (error) {
      setPageError(errorText(error));
      retryRef.current = () => {
        void openSystemBluetooth();
      };
    }
  }, []);

  if (!tauri) {
    return (
      <SettingsGroup title="设备" hint="蓝牙音箱把平板当手机外放。">
        <SettingsRow label="蓝牙音箱" description="浏览器预览不支持系统蓝牙，桌面应用内可用" />
      </SettingsGroup>
    );
  }

  const devices = snapshot ? orderedDevices(snapshot) : [];
  const activeDevice = snapshot?.activeDeviceId
    ? devices.find((device) => device.id === snapshot.activeDeviceId) ?? null
    : null;
  const preferredDevice = snapshot?.preferredDeviceId
    ? devices.find((device) => device.id === snapshot.preferredDeviceId) ?? null
    : null;
  const streaming = snapshot?.streaming === true;
  const connected = snapshot?.connected === true;
  const paused = snapshot?.autoConnectState === 'paused';
  const bluetoothOff = snapshot?.bluetoothOn === false;
  const unavailable = !loading && snapshot !== null && !snapshot.available;
  const loadFailed = pageError !== null && snapshot === null;
  const actionDisabled = busy !== null || loading;

  const error = friendlyError(
    pageError ??
      snapshot?.lastError ??
      (snapshot?.autoConnectState === 'backoff' ? snapshot.lastAttemptError : null),
  );

  const statusText = loading
    ? '正在读取蓝牙状态…'
    : loadFailed
      ? '读取蓝牙状态失败'
      : unavailable
        ? '没有找到可用的蓝牙适配器'
        : bluetoothOff
          ? '蓝牙已关闭'
          : streaming
            ? `正在接收「${deviceName(activeDevice)}」的音频`
            : connected
              ? `已连接「${deviceName(activeDevice)}」`
              : activeDevice
                ? `与「${deviceName(activeDevice)}」的连接已断开`
                : devices.length === 0
                  ? '还没有配对的手机'
                  : '未连接';

  const autoConnectDescription = snapshot
    ? AUTO_CONNECT_STATE_TEXT[snapshot.autoConnectState] ?? '状态未知'
    : '状态未知';
  const autoConnectHint = paused
    ? '手动断开后已暂停，点「恢复自动连接」继续'
    : snapshot?.autoConnectEnabled === false
      ? '关闭后不会再自动回连首选设备'
      : '首选设备优先，失败按顺序尝试下一台';

  const preferredValue = preferredDevice?.name ?? '不设首选';

  return (
    <SettingsGroup
      title="设备"
      hint="蓝牙音箱把平板当手机外放；日常连接在桌面状态栏点开快速设置即可。"
    >
      <SettingsRow
        label="蓝牙"
        description={
          snapshot?.bluetoothSupported === false
            ? '这台设备没有蓝牙无线电'
            : snapshot?.bluetoothOn === true
              ? '已开启'
              : snapshot?.bluetoothOn === false
                ? '已关闭'
                : '状态未知'
        }
      >
        <Switch
          className={styles.touch}
          checked={snapshot?.bluetoothOn === true}
          disabled={actionDisabled || snapshot?.bluetoothSupported !== true}
          onChange={(_event, data) => {
            toggleBluetooth(data.checked);
          }}
          aria-label="蓝牙开关"
        />
      </SettingsRow>

      <SettingsRow label="蓝牙音箱" description={statusText}>
        {loading ? (
          <Spinner size="tiny" />
        ) : connected ? (
          <Badge appearance="filled" color={streaming ? 'success' : 'informative'}>
            {streaming ? '正在接收' : '已连接'}
          </Badge>
        ) : null}
      </SettingsRow>

      <SettingsRow label="自动连接" description={`${autoConnectDescription}。${autoConnectHint}`}>
        <div className={styles.control}>
          <Switch
            className={styles.touch}
            checked={snapshot?.autoConnectEnabled === true}
            disabled={actionDisabled || snapshot === null || snapshot.autoConnectState === 'unavailable'}
            onChange={(_event, data) => {
              changeAutoConnect(data.checked);
            }}
            aria-label="自动连接"
          />
          {paused ? (
            <Button
              appearance="secondary"
              size="large"
              className={styles.touch}
              disabled={actionDisabled}
              onClick={resumeAuto}
            >
              恢复自动连接
            </Button>
          ) : null}
        </div>
      </SettingsRow>

      <SettingsRow
        label="首选设备"
        description={preferredDevice ? `自动连接优先「${preferredDevice.name}」` : '未设置首选设备'}
      >
        <Dropdown
          size="large"
          className={`${styles.touch} ${styles.select}`}
          aria-label="首选设备"
          value={preferredValue}
          selectedOptions={preferredDevice ? [preferredDevice.id] : []}
          disabled={actionDisabled || devices.length === 0 || unavailable || bluetoothOff}
          onOptionSelect={(_event, data) => {
            if (!data.optionValue) return;
            changePreferred(data.optionValue === '__none__' ? null : data.optionValue);
          }}
        >
          <Option value="__none__" text="不设首选">
            不设首选
          </Option>
          {devices.map((device) => (
            <Option key={device.id} value={device.id} text={device.name}>
              <span className={styles.optionText}>
                {device.id === snapshot?.preferredDeviceId ? (
                  <Star20Filled aria-hidden="true" className={styles.star} />
                ) : null}
                {device.name}
              </span>
            </Option>
          ))}
        </Dropdown>
      </SettingsRow>

      <SettingsRow label="系统蓝牙设置" description="配对手机、开关蓝牙、排查连接问题">
        <Button
          appearance="secondary"
          size="large"
          className={styles.touch}
          onClick={() => void openSystemBluetooth()}
        >
          打开
        </Button>
      </SettingsRow>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>
            {error.title}
            <span className={styles.errorBody}> {error.detail}</span>
          </MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="secondary"
                size="large"
                className={styles.touch}
                onClick={() => {
                  const retry = retryRef.current;
                  if (retry) {
                    retry();
                    return;
                  }
                  void load();
                }}
                disabled={actionDisabled}
              >
                重试
              </Button>
            }
          />
        </MessageBar>
      )}
    </SettingsGroup>
  );
}
