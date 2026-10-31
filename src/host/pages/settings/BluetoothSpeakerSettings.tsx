/**
 * 蓝牙音箱设置分组（A2DP Sink，宿主系统能力）。
 *
 * 形态（D-39 / D-43 收敛后）：**设置页「常规 → 设备」里的一个分组**，不新增页面/路由/图标/搜索项。
 * 日常连接、断连、音量/亮度这些即时操作在桌面状态栏的快速设置面板里（`QuickSettingsPanel`）；
 * 这里只保留「需要看清状态再改」的长期项：蓝牙开关、自动连接、首选设备、错误详情与系统兜底入口。
 * 因而 **不重复** 面板里的设备列表点击连接 / 断开按钮——两处只保留一处可编辑（D-43）。
 *
 * P2（D-51）：快照改由 `useBluetoothAudio` 单例 store 提供（不再有自己的 interval/state）；
 * 蓝牙开关/自动连接/首选都走同一套 store action，非阻塞命令的阶段文案来自快照 `operation`。
 */

import { useCallback, useRef, useState } from 'react';
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
  btOperationText,
  orderedDevices,
  type BtDeviceInfo,
} from '../../system/bluetoothAudio';
import { useBluetoothAudio } from '../../system/useBluetoothAudio';
import { SettingsGroup, SettingsRow } from './SettingsBlocks';

/** `lastError` 前缀归一成一句事实文案；不透传 HRESULT，也不写教程式后缀。 */
function friendlyError(message: string | null): string | null {
  if (!message) return null;
  if (/^(创建音频连接失败|启用音频接收失败|建立音频连接失败|读取连接状态失败)/.test(message)) {
    return '连接失败';
  }
  if (/^(枚举音频设备失败|蓝牙音频不可用)/.test(message)) {
    return '读取设备失败';
  }
  if (
    /^(系统不允许切换蓝牙开关|没有找到蓝牙无线电|切换蓝牙失败|读取蓝牙状态失败)/.test(message)
  ) {
    return '系统未允许蓝牙操作';
  }
  if (/自动连接|尝试连接|回连/.test(message)) {
    return '自动连接失败';
  }
  return '蓝牙操作失败';
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
  const store = useBluetoothAudio();
  const {
    refreshNow,
    setBluetooth,
    setAutoConnect,
    setPreferred,
    resumeAuto,
    openSettings: openSystemBluetooth,
  } = store;

  const [busy, setBusy] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const run = useCallback(async (task: () => Promise<unknown>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setPageError(null);
    try {
      const result = await task();
      // store action 失败返回 null（并把 error 置 true）；这里只补一条可重试的文案。
      if (result === null) setPageError('蓝牙操作失败');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  const toggleBluetooth = useCallback(
    (on: boolean) => {
      void run(() => setBluetooth(on));
    },
    [run, setBluetooth],
  );

  const changeAutoConnect = useCallback(
    (enabled: boolean) => {
      // store 的 setAutoConnect 在重新打开时会顺带解除「手动断开」造成的 paused（D-44）
      void run(() => setAutoConnect(enabled));
    },
    [run, setAutoConnect],
  );

  const resumeAutoConnect = useCallback(() => {
    void run(resumeAuto);
  }, [run, resumeAuto]);

  const changePreferred = useCallback(
    (deviceId: string | null) => {
      void run(() => setPreferred(deviceId));
    },
    [run, setPreferred],
  );

  if (!tauri) {
    return (
      <SettingsGroup title="设备" hint="蓝牙音箱把平板当手机外放">
        <SettingsRow label="蓝牙音箱" description="浏览器预览不支持系统蓝牙，桌面应用内可用" />
      </SettingsGroup>
    );
  }

  const snapshot = store.snapshot;
  const loading = !store.loaded;
  const actionDisabled = busy || loading;
  const operation = snapshot?.operation ?? null;
  const operationText = btOperationText(operation);
  const radioOperationText =
    operation?.kind === 'bluetoothOn' || operation?.kind === 'bluetoothOff'
      ? operationText
      : null;
  const disconnecting =
    snapshot?.linkPhase === 'disconnecting' ||
    operation?.kind === 'disconnect' ||
    operation?.kind === 'disable';

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
  const loadFailed = snapshot === null && (store.error || pageError !== null);

  const error = friendlyError(
    pageError ??
      (store.error ? '蓝牙操作失败' : null) ??
      snapshot?.lastError ??
      (snapshot?.autoConnectState === 'backoff' ? snapshot.lastAttemptError : null),
  );

  const statusText = loading
    ? '正在读取蓝牙状态…'
    : loadFailed
      ? '读取蓝牙状态失败'
      : operationText
        ? operationText
        : unavailable
          ? '没有找到可用的蓝牙适配器'
          : bluetoothOff
            ? '蓝牙已关闭'
            : snapshot?.unverifiedDisconnect
              ? '可能仍连接'
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
  const preferredValue = preferredDevice?.name ?? '不设首选';

  return (
    <SettingsGroup
      title="设备"
      hint="蓝牙音箱把平板当手机外放，日常连接在桌面状态栏"
    >
      <SettingsRow
        label="蓝牙"
        description={
          snapshot?.bluetoothSupported === false
            ? '这台设备没有蓝牙无线电'
            : radioOperationText
              ? radioOperationText
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
          disabled={
            actionDisabled ||
            snapshot?.bluetoothSupported !== true ||
            radioOperationText !== null
          }
          onChange={(_event, data) => {
            toggleBluetooth(data.checked);
          }}
          aria-label="蓝牙开关"
        />
      </SettingsRow>

      <SettingsRow label="蓝牙音箱" description={statusText}>
        {loading ? (
          <Spinner size="tiny" />
        ) : disconnecting ? (
          <Spinner size="tiny" />
        ) : connected ? (
          <Badge appearance="tint" color={streaming ? 'success' : 'informative'}>
            {streaming ? '接收中' : '已连接'}
          </Badge>
        ) : null}
      </SettingsRow>

      <SettingsRow label="自动连接" description={autoConnectDescription}>
        <div className={styles.control}>
          <Switch
            className={styles.touch}
            checked={snapshot?.autoConnectEnabled === true}
            disabled={
              actionDisabled || snapshot === null || snapshot.autoConnectState === 'unavailable'
            }
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
              aria-label="恢复自动连接"
              disabled={actionDisabled}
              onClick={resumeAutoConnect}
            >
              恢复
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
          aria-label="打开系统蓝牙设置"
          onClick={() => void openSystemBluetooth()}
        >
          打开
        </Button>
      </SettingsRow>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="secondary"
                size="large"
                className={styles.touch}
                aria-label="重新读取蓝牙状态"
                onClick={() => {
                  void refreshNow();
                }}
                disabled={actionDisabled}
              >
                刷新
              </Button>
            }
          />
        </MessageBar>
      )}
    </SettingsGroup>
  );
}
