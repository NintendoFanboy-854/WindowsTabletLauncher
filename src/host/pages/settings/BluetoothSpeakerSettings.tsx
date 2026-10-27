/**
 * 蓝牙音箱设置分组（A2DP Sink）。
 *
 * 形态：宿主系统能力（`src-tauri/src/bluetooth_audio.rs`）+ **设置页「常规 → 设备」里的一个分组**。
 * 不新增宿主页面 / 路由 / 图标 / 搜索项：蓝牙是设备设置与一次性任务，现有设置框架足以承载。
 * 入口只有：设置页（`Ctrl+,` / 右键 → 设置 / 编辑工具栏 → 设置）；Agent 通过 4 个内置工具操作。
 *
 * 状态全部来自宿主快照（轮询），页面只负责把 `connected / streaming / devices` 映射成
 * 一行描述 + 一个动作；不写说明书、不造 hero、不引新视觉语言。
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
  makeStyles,
  tokens,
} from '@fluentui/react-components';

import { TOUCH_TARGET_CSS } from '../../design/metrics';
import { isTauriRuntime } from '../../plugins/tauri';
import {
  btAudioConnect,
  btAudioDisconnect,
  btAudioOpenSettings,
  btAudioRefresh,
  btAudioSetBluetooth,
  btAudioSnapshot,
  type BtAudioSnapshot,
  type BtDeviceInfo,
} from '../../system/bluetoothAudio';
import { SettingsGroup, SettingsRow } from './SettingsBlocks';

/** 状态轮询间隔：只在设置页挂载期间跑；连接/断开命令进行中跳过，避免旧快照覆盖。 */
const POLL_INTERVAL_MS = 1500;

type BusyAction = 'connect' | 'disconnect' | 'bluetooth' | 'refresh';

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
});

export function BluetoothSpeakerSettings() {
  const styles = useStyles();
  const tauri = isTauriRuntime();

  const [snapshot, setSnapshot] = useState<BtAudioSnapshot | null>(null);
  const [loading, setLoading] = useState(tauri);
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    if (!tauri) return;
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

  // 选中项跟随设备列表：当前连接设备优先，否则第一台；设备消失时回落到第一台。
  useEffect(() => {
    if (!snapshot) return;
    const ids = snapshot.devices.map((device) => device.id);
    if (selectedId && ids.includes(selectedId)) return;
    setSelectedId(snapshot.activeDeviceId ?? snapshot.devices[0]?.id ?? null);
  }, [snapshot, selectedId]);

  const run = useCallback(
    async (action: BusyAction, task: () => Promise<BtAudioSnapshot>) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(action);
      setPageError(null);
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

  const connect = useCallback(
    (deviceId: string) => {
      retryRef.current = () => {
        void run('connect', () => btAudioConnect(deviceId));
      };
      void run('connect', () => btAudioConnect(deviceId));
    },
    [run],
  );

  const disconnect = useCallback(() => {
    retryRef.current = () => {
      void run('disconnect', () => btAudioDisconnect());
    };
    void run('disconnect', () => btAudioDisconnect());
  }, [run]);

  const toggleBluetooth = useCallback(
    (on: boolean) => {
      retryRef.current = () => {
        void run('bluetooth', () => btAudioSetBluetooth(on));
      };
      void run('bluetooth', () => btAudioSetBluetooth(on));
    },
    [run],
  );

  const openSettings = useCallback(async () => {
    try {
      await btAudioOpenSettings();
    } catch (error) {
      setPageError(errorText(error));
      retryRef.current = () => {
        void openSettings();
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

  const connectionLookup = snapshot?.activeDeviceId
    ? snapshot.devices.find((device) => device.id === snapshot.activeDeviceId) ?? null
    : null;
  const streaming = snapshot?.streaming === true;
  const connected = snapshot?.connected === true;
  const disconnected = Boolean(snapshot?.activeDeviceId) && snapshot?.connected === false;
  const bluetoothOff = snapshot?.bluetoothOn === false;
  const unavailable = !loading && snapshot !== null && !snapshot.available;
  const loadFailed = pageError !== null && snapshot === null;
  const devices = snapshot?.devices ?? [];
  const activeDevice = connectionLookup;
  const error = friendlyError(pageError ?? snapshot?.lastError ?? null);
  const selectedDevice = devices.find((device) => device.id === selectedId) ?? null;
  const showDevicePicker = !unavailable && !bluetoothOff && devices.length > 0 && !connected && !disconnected;
  const actionDisabled = busy !== null || loading;

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
            : disconnected
              ? `与「${deviceName(activeDevice)}」的连接已断开`
              : devices.length === 0
                ? '还没有配对的手机'
                : '选一台设备开始';

  return (
    <SettingsGroup
      title="设备"
      hint="蓝牙音箱把平板当手机外放；先在手机或 Windows 蓝牙里配对，设备会出现在这里。"
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
        <div className={styles.control}>
          {loading ? (
            <Spinner size="tiny" />
          ) : loadFailed ? null : unavailable ? (
            <Button
              appearance="secondary"
              size="large"
              className={styles.touch}
              onClick={() => void openSettings()}
            >
              蓝牙设置
            </Button>
          ) : bluetoothOff ? (
            <Button
              appearance="secondary"
              size="large"
              className={styles.touch}
              onClick={() => void openSettings()}
            >
              蓝牙设置
            </Button>
          ) : connected ? (
            <>
              <Badge appearance="filled" color={streaming ? 'success' : 'informative'}>
                {streaming ? '正在接收' : '已连接'}
              </Badge>
              <Button
                appearance="secondary"
                size="large"
                className={styles.touch}
                disabled={actionDisabled}
                onClick={disconnect}
              >
                断开
              </Button>
            </>
          ) : disconnected && activeDevice ? (
            <>
              <Button
                appearance="primary"
                size="large"
                className={styles.touch}
                disabled={actionDisabled}
                onClick={() => connect(activeDevice.id)}
              >
                重连
              </Button>
              <Button
                appearance="subtle"
                size="large"
                className={styles.touch}
                onClick={() => void openSettings()}
              >
                蓝牙设置
              </Button>
            </>
          ) : showDevicePicker ? (
            <>
              <Dropdown
                size="large"
                className={`${styles.touch} ${styles.select}`}
                aria-label="选择蓝牙设备"
                value={selectedDevice?.name ?? ''}
                selectedOptions={selectedId ? [selectedId] : []}
                onOptionSelect={(_event, data) => {
                  if (data.optionValue) setSelectedId(data.optionValue);
                }}
              >
                {devices.map((device) => (
                  <Option key={device.id} value={device.id} text={device.name}>
                    {device.name}
                  </Option>
                ))}
              </Dropdown>
              <Button
                appearance="primary"
                size="large"
                className={styles.touch}
                disabled={actionDisabled || !selectedId}
                onClick={() => selectedId && connect(selectedId)}
              >
                {busy === 'connect' ? '连接中…' : '连接'}
              </Button>
            </>
          ) : (
            <Button
              appearance="secondary"
              size="large"
              className={styles.touch}
              onClick={() => void openSettings()}
            >
              蓝牙设置
            </Button>
          )}
        </div>
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
                  if (activeDevice) {
                    connect(activeDevice.id);
                  } else {
                    void load();
                  }
                }}
                disabled={actionDisabled}
              >
                重试
              </Button>
            }
          >
            <Button
              appearance="subtle"
              size="large"
              className={styles.touch}
              onClick={() => void openSettings()}
            >
              蓝牙设置
            </Button>
          </MessageBarActions>
        </MessageBar>
      )}
    </SettingsGroup>
  );
}
