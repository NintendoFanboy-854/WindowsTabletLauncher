/**
 * 蓝牙音箱的 Agent 侧适配（内置工具实现）。
 *
 * 工具在 registry.ts 里只有声明与分发；真正的解析/调用集中在这里，方便
 * 「按名称/首选找设备」这类逻辑复用。UI 在设置页分组 + 桌面快速设置面板，
 * Agent 不负责打开页面（没有可开的页面，D-39）。
 *
 * v0.8.0（D-44）：快照新增自动连接状态机与首选设备；status/devices 原样透传这些字段，
 * connect 省略参数时优先连首选，disconnect 的「暂停自动连接」语义由后端状态机处理。
 */

import {
  AUTO_CONNECT_STATE_TEXT,
  btAudioConnect,
  btAudioDisconnect,
  btAudioRefresh,
  btAudioSnapshot,
  orderedDevices,
  type BtAudioSnapshot,
  type BtDeviceInfo,
} from './bluetoothAudio';

function deviceLabel(device: BtDeviceInfo | undefined): string {
  return device?.name ?? '蓝牙设备';
}

/** 给模型的一句可读状态（不要只回 {ok:true}）；带首选与自动连接状态机信息 */
export function describeSnapshot(snapshot: BtAudioSnapshot): string {
  if (!snapshot.available) return '蓝牙音频不可用';
  if (snapshot.bluetoothOn === false) return '蓝牙已关闭';
  const active = snapshot.devices.find((device) => device.id === snapshot.activeDeviceId);
  const autoState = snapshot.autoConnectState;
  const autoSuffix =
    autoState === 'paused'
      ? '，自动连接已暂停'
      : autoState === 'backoff'
        ? '，自动连接稍后重试'
        : '';
  const preferred = snapshot.preferredDeviceId
    ? snapshot.devices.find((device) => device.id === snapshot.preferredDeviceId)
    : undefined;
  const preferredSuffix = preferred ? `，首选「${deviceLabel(preferred)}」` : '';

  if (snapshot.streaming) {
    return `正在接收音频，来自「${deviceLabel(active)}」${autoSuffix}`;
  }
  if (snapshot.connected) {
    return `已连接「${deviceLabel(active)}」，等待手机播放${autoSuffix}`;
  }
  if (snapshot.activeDeviceId) {
    return `与「${deviceLabel(active)}」的连接已断开${autoSuffix}`;
  }
  if (snapshot.lastError) return `蓝牙操作失败：${snapshot.lastError}`;
  return `未连接，自动连接${
    snapshot.autoConnectEnabled ? AUTO_CONNECT_STATE_TEXT[autoState] : '已关闭'
  }${preferredSuffix}`;
}

export interface BtStatusToolResult {
  ok: boolean;
  message: string;
  snapshot: BtAudioSnapshot;
}

export async function btStatusTool(): Promise<BtStatusToolResult> {
  const snapshot = await btAudioSnapshot();
  return { ok: true, message: describeSnapshot(snapshot), snapshot };
}

export interface BtDevicesToolResult {
  ok: boolean;
  message: string;
  devices: BtDeviceInfo[];
  preferredDeviceId: string | null;
  activeDeviceId: string | null;
  autoConnectEnabled: boolean;
  autoConnectState: BtAudioSnapshot['autoConnectState'];
  order: string[];
}

export async function btDevicesTool(): Promise<BtDevicesToolResult> {
  const snapshot = await btAudioRefresh();
  const devices = orderedDevices(snapshot);
  const names = devices.map((device) => {
    if (device.id === snapshot.preferredDeviceId) return `${device.name}（首选）`;
    if (device.id === snapshot.activeDeviceId) return `${device.name}（当前连接）`;
    return device.name;
  });
  return {
    ok: true,
    message: names.length ? `可用设备：${names.join('、')}` : '还没有已配对的设备',
    devices,
    preferredDeviceId: snapshot.preferredDeviceId,
    activeDeviceId: snapshot.activeDeviceId,
    autoConnectEnabled: snapshot.autoConnectEnabled,
    autoConnectState: snapshot.autoConnectState,
    order: snapshot.order,
  };
}

export interface BtConnectToolArgs {
  deviceId?: unknown;
  deviceName?: unknown;
}

export interface BtConnectToolResult {
  ok: boolean;
  message: string;
  snapshot?: BtAudioSnapshot;
  devices?: BtDeviceInfo[];
}

function stringArg(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

export async function btConnectTool(args: BtConnectToolArgs): Promise<BtConnectToolResult> {
  const deviceId = stringArg(args.deviceId);
  const deviceName = stringArg(args.deviceName);

  let targetId = deviceId ?? null;
  let latest: BtAudioSnapshot | null = null;

  if (!targetId) {
    latest = await btAudioRefresh();
    if (deviceName) {
      const exact = latest.devices.filter((device) => device.name === deviceName);
      const fuzzy = latest.devices.filter((device) =>
        device.name.toLocaleLowerCase().includes(deviceName.toLocaleLowerCase()),
      );
      const candidates = exact.length > 0 ? exact : fuzzy;
      if (candidates.length === 0) {
        return {
          ok: false,
          message: `未找到匹配设备「${deviceName}」，请从 devices 列表中选一台并用 deviceId 重新调用`,
          devices: orderedDevices(latest),
        };
      }
      if (candidates.length > 1) {
        return {
          ok: false,
          message: `有 ${candidates.length} 台设备名称接近，请用 deviceId 指定`,
          devices: candidates,
        };
      }
      targetId = candidates[0].id;
    } else if (latest.preferredDeviceId) {
      // 省略参数 = 连首选设备（与后台自动连接的第一顺位一致）
      targetId = latest.preferredDeviceId;
    } else if (latest.devices.length === 1) {
      targetId = latest.devices[0].id;
    } else {
      return {
        ok: false,
        message: '请指定设备名或 deviceId；可用设备见 devices 列表',
        devices: orderedDevices(latest),
      };
    }
  }

  const connected = await btAudioConnect(targetId);
  const device = connected.devices.find((item) => item.id === targetId);
  return {
    ok: !connected.lastError && (connected.connected || connected.streaming),
    message: connected.lastError
      ? `连接「${deviceLabel(device)}」失败`
      : `已连接「${deviceLabel(device)}」，等待手机播放`,
    snapshot: connected,
    devices: orderedDevices(connected),
  };
}

export interface BtSimpleToolResult {
  ok: boolean;
  message: string;
  snapshot?: BtAudioSnapshot;
}

export async function btDisconnectTool(): Promise<BtSimpleToolResult> {
  const snapshot = await btAudioDisconnect();
  const paused = snapshot.autoConnectState === 'paused';
  return {
    ok: !snapshot.lastError,
    message: snapshot.lastError
      ? '断开失败，请重试'
      : paused
        ? '已断开蓝牙音箱，自动连接已暂停（手动连接可恢复）'
        : '已断开蓝牙音箱',
    snapshot,
  };
}
