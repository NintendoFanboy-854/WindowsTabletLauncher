/**
 * 蓝牙音箱的 Agent 侧适配（内置工具实现）。
 *
 * 工具在 registry.ts 里只有声明与分发；真正的解析/调用集中在这里，方便
 * 「按名称找设备」这类逻辑复用。UI 只在设置页里，Agent 不负责打开页面。
 */

import {
  btAudioConnect,
  btAudioDisconnect,
  btAudioRefresh,
  btAudioSnapshot,
  type BtAudioSnapshot,
  type BtDeviceInfo,
} from './bluetoothAudio';

function deviceLabel(device: BtDeviceInfo | undefined): string {
  return device?.name ?? '蓝牙设备';
}

/** 给模型的一句可读状态（不要只回 {ok:true}） */
export function describeSnapshot(snapshot: BtAudioSnapshot): string {
  if (!snapshot.available) return '蓝牙音频不可用';
  if (snapshot.bluetoothOn === false) return '蓝牙已关闭';
  const active = snapshot.devices.find((device) => device.id === snapshot.activeDeviceId);
  if (snapshot.streaming) return `正在接收音频，来自「${deviceLabel(active)}」`;
  if (snapshot.connected) return `已连接「${deviceLabel(active)}」，等待手机播放`;
  if (snapshot.activeDeviceId) return `与「${deviceLabel(active)}」的连接已断开`;
  if (snapshot.lastError) return '蓝牙操作失败';
  return '未连接';
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
}

export async function btDevicesTool(): Promise<BtDevicesToolResult> {
  const snapshot = await btAudioRefresh();
  const names = snapshot.devices.map((device) => device.name);
  return {
    ok: true,
    message: names.length ? `可用设备：${names.join('、')}` : '还没有已配对的设备',
    devices: snapshot.devices,
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
          devices: latest.devices,
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
    } else {
      return {
        ok: false,
        message: '请指定设备名或 deviceId；可用设备见 devices 列表',
        devices: latest.devices,
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
    devices: connected.devices,
  };
}

export interface BtSimpleToolResult {
  ok: boolean;
  message: string;
}

export async function btDisconnectTool(): Promise<BtSimpleToolResult> {
  const snapshot = await btAudioDisconnect();
  return {
    ok: !snapshot.lastError,
    message: snapshot.lastError ? '断开失败，请在设置页重试' : '已断开蓝牙音箱',
  };
}
