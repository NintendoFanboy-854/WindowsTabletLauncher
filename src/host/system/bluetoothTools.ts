/**
 * 蓝牙音箱的 Agent 侧适配（内置工具实现）。
 *
 * 工具在 registry.ts 里只有声明与分发；真正的解析/调用集中在这里，方便
 * 「按名称/首选找设备」这类逻辑复用。UI 在设置页分组 + 桌面快速设置面板，
 * Agent 不负责打开页面（没有可开的页面，D-39）。
 *
 * v0.8.0（D-44）：快照新增自动连接状态机与首选设备；status/devices 原样透传这些字段。
 * P2（D-51）：connect/disconnect 改为「发起后 `waitForBluetoothSettled()` 等终态」，
 * 返回 `{ ok, linkPhase, operation, lastError }`，不把「已发起」当成「已完成」。
 * P3c：新增 `btAudio.restoreOutput`（解除双音源冲突的本地静音，与面板「恢复」对等）。
 */

import {
  AUTO_CONNECT_STATE_TEXT,
  btAudioConnect,
  btAudioDisconnect,
  btAudioRefresh,
  btAudioRestoreOutput,
  btAudioSnapshot,
  btOperationText,
  linkPhaseOf,
  orderedDevices,
  waitForBluetoothSettled,
  type BtAudioSnapshot,
  type BtDeviceInfo,
  type BtOperation,
  type LinkPhase,
} from './bluetoothAudio';

function deviceLabel(device: BtDeviceInfo | undefined): string {
  return device?.name ?? '蓝牙设备';
}

/** 给模型的一句可读状态（不要只回 {ok:true}）；带首选与自动连接状态机信息 */
export function describeSnapshot(snapshot: BtAudioSnapshot): string {
  if (!snapshot.available) return '蓝牙音频不可用';
  if (snapshot.bluetoothOn === false) return '蓝牙已关闭';
  const operationText = btOperationText(snapshot.operation);
  if (operationText) return `蓝牙操作进行中：${operationText}`;
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
    const mutedSuffix =
      snapshot.outputSuppressed === true
        ? '，但本地输出已被本机音乐静音（可用 btAudio.restoreOutput 恢复）'
        : '';
    return `正在接收音频，来自「${deviceLabel(active)}」${mutedSuffix}${autoSuffix}`;
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
  /** 等待终态后的链路阶段（P2；前端/模型都看这个，不看「已发起」） */
  linkPhase: LinkPhase;
  /** 超时仍未结束时仍会带上进行中的操作，便于模型/用户判断 */
  operation: BtOperation | null;
  lastError: string | null;
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
          linkPhase: linkPhaseOf(latest),
          operation: latest.operation ?? null,
          lastError: latest.lastAttemptError ?? latest.lastError ?? null,
          devices: orderedDevices(latest),
        };
      }
      if (candidates.length > 1) {
        return {
          ok: false,
          message: `有 ${candidates.length} 台设备名称接近，请用 deviceId 指定`,
          linkPhase: linkPhaseOf(latest),
          operation: latest.operation ?? null,
          lastError: null,
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
        linkPhase: linkPhaseOf(latest),
        operation: latest.operation ?? null,
        lastError: null,
        devices: orderedDevices(latest),
      };
    }
  }

  // 非阻塞命令：先发起，再等 worker 把 operation 清空（超时返回进行中快照，不假装成功）。
  await btAudioConnect(targetId);
  const settled = await waitForBluetoothSettled();
  const linkPhase = linkPhaseOf(settled);
  const device = settled.devices.find((item) => item.id === targetId);
  const lastError = settled.lastAttemptError ?? settled.lastError ?? null;
  const active = settled.activeDeviceId === targetId;
  const ok =
    active &&
    !settled.operation &&
    (linkPhase === 'streaming' || linkPhase === 'connected');
  const message = ok
    ? linkPhase === 'streaming'
      ? `正在接收「${deviceLabel(device)}」的音频`
      : `已连接「${deviceLabel(device)}」，等待手机播放`
    : settled.operation
      ? `连接「${deviceLabel(device)}」仍在进行中，可稍后用 btAudio.status 查看`
      : `连接「${deviceLabel(device)}」失败`;
  return {
    ok,
    message,
    linkPhase,
    operation: settled.operation ?? null,
    lastError,
    snapshot: settled,
    devices: orderedDevices(settled),
  };
}

export interface BtSimpleToolResult {
  ok: boolean;
  message: string;
  linkPhase: LinkPhase;
  operation: BtOperation | null;
  lastError: string | null;
  /** Close 后系统未确认 ACL 断开（手机可能仍显示已连接） */
  unverifiedDisconnect: boolean;
  snapshot?: BtAudioSnapshot;
}

export async function btDisconnectTool(): Promise<BtSimpleToolResult> {
  await btAudioDisconnect();
  const settled = await waitForBluetoothSettled();
  const linkPhase = linkPhaseOf(settled);
  const paused = settled.autoConnectState === 'paused';
  const unverified = settled.unverifiedDisconnect === true || linkPhase === 'closed';
  // 「已释放连接但无法确认 ACL 断开」不算成功：如实返回 ok=false + 可能仍连接。
  const ok = !unverified && !settled.connected && !settled.operation;
  const message = unverified
    ? '已释放蓝牙音频连接，但系统未能确认断开（手机可能仍显示已连接）'
    : !ok
      ? '断开仍在进行中或未完成'
      : paused
        ? '已断开蓝牙音箱，自动连接已暂停（手动连接可恢复）'
        : '已断开蓝牙音箱';
  return {
    ok,
    message,
    linkPhase,
    operation: settled.operation ?? null,
    lastError: settled.lastError ?? null,
    unverifiedDisconnect: unverified,
    snapshot: settled,
  };
}

export interface BtRestoreOutputToolResult {
  ok: boolean;
  message: string;
  /** 恢复后的蓝牙快照里本地静音是否已解除（旗标在蓝牙快照上，不在返回值里） */
  outputSuppressed: boolean;
  suppressReason: string | null;
  linkPhase: LinkPhase;
  snapshot?: BtAudioSnapshot;
}

/**
 * `btAudio.restoreOutput`：解除双音源冲突造成的蓝牙音乐本地静音（P3c）。
 *
 * 与快速设置面板的「恢复」按钮对等（同一个宿主命令）：只恢复平板本地输出，
 * **不断开连接、不碰蓝牙无线电、不操控手机**；手机继续推流，只是重新出声。
 * 命令成功后静音旗标由音频焦点写入蓝牙快照，所以再读一份快照确认结果并给模型可读结论。
 */
export async function btRestoreOutputTool(): Promise<BtRestoreOutputToolResult> {
  await btAudioRestoreOutput();
  const snapshot = await btAudioSnapshot();
  const suppressed = snapshot.outputSuppressed === true;
  const linkPhase = linkPhaseOf(snapshot);
  const message = suppressed
    ? '已请求恢复蓝牙音乐输出，但本地静音仍生效'
    : linkPhase === 'streaming'
      ? '已解除蓝牙音乐的本地静音，手机推流继续'
      : '当前没有因双音源冲突造成的蓝牙本地静音';
  return {
    ok: !suppressed,
    message,
    outputSuppressed: suppressed,
    suppressReason: snapshot.suppressReason ?? null,
    linkPhase,
    snapshot,
  };
}
