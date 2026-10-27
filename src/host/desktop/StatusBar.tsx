/**
 * 桌面底部状态栏（宿主 chrome）。
 *
 * 位置与说明条 / Agent 入口同一条底部带：**下缘**对齐 `layoutFrame().pill.bottom`，
 * 右缘落在 Agent 入口左侧一个 gutter。状态栏自身高度实测后上报 `reportFooterStatusBarHeight`，
 * 与说明条取 max 作为 `H_p`：说明条隐藏时状态栏仍把底部带撑住，网格不会被压住。
 *
 * 内容只用系统事实（不新造实体）：蓝牙音箱状态、主音量/静音、电量/充电。
 * 每项是「图标 + 12px 文本」的冗余编码（不只靠颜色）；唯一可交互项是蓝牙音箱，
 * 点击回设置页「常规 → 设备」。视觉材质与说明条同一套 token。
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import { Text, makeStyles, mergeClasses, motionTokens, tokens } from '@fluentui/react-components';
import {
  Battery020Regular,
  Battery120Regular,
  Battery220Regular,
  Battery320Regular,
  Battery420Regular,
  Battery520Regular,
  Battery620Regular,
  Battery720Regular,
  Battery820Regular,
  Battery920Regular,
  Battery1020Regular,
  BatteryCharge20Regular,
  Bluetooth20Regular,
  BluetoothConnected20Regular,
  BluetoothDisabled20Regular,
  Speaker220Regular,
  SpeakerMute20Regular,
} from '@fluentui/react-icons';

import { TOUCH_TARGET, TOUCH_TARGET_CSS } from '../design/metrics';
import {
  FOOTER_PILL_ESTIMATE,
  computeGridMetrics,
  layoutFrame,
  reportFooterStatusBarHeight,
  useFooterPillHeight,
} from '../layout';
import { isTauriRuntime } from '../plugins/tauri';
import { btAudioRefresh, btAudioSnapshot, type BtAudioSnapshot } from '../system/bluetoothAudio';
import { systemStatusSnapshot, type SystemStatusSnapshot } from '../system/systemStatus';

const POLL_INTERVAL_MS = 2000;

/** 交互项 44×44 命中区：由 TOUCH_TARGET 与视觉高度推导，不写裸数字 */
const HIT_INSET = `calc(${(TOUCH_TARGET - FOOTER_PILL_ESTIMATE) / -2}px - ${tokens.strokeWidthThin})`;

const BATTERY_ICON_LEVELS = [
  Battery020Regular,
  Battery120Regular,
  Battery220Regular,
  Battery320Regular,
  Battery420Regular,
  Battery520Regular,
  Battery620Regular,
  Battery720Regular,
  Battery820Regular,
  Battery920Regular,
  Battery1020Regular,
] as const;

function batteryIcon(percent: number, charging: boolean): ReactElement {
  if (charging) return <BatteryCharge20Regular aria-hidden="true" />;
  const level = Math.max(0, Math.min(10, Math.round(percent / 10)));
  const Icon = BATTERY_ICON_LEVELS[level];
  return <Icon aria-hidden="true" />;
}

/** 浏览器预览（`?statusDemo=1`）用的假数据，只为检查状态栏布局，不参与产品逻辑 */
const DEMO_STATUS: SystemStatusSnapshot = {
  batteryPercent: 76,
  charging: true,
  volumePercent: 42,
  muted: false,
};

const DEMO_BT: BtAudioSnapshot = {
  available: true,
  bluetoothSupported: true,
  bluetoothOn: true,
  devices: [{ id: 'demo-phone', name: 'Huan 的手机' }],
  activeDeviceId: 'demo-phone',
  connected: true,
  streaming: true,
  connectionState: 'opened',
  lastError: null,
};

function readViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function useViewportSize(): { width: number; height: number } {
  const [size, setSize] = useState(readViewportSize);
  useEffect(() => {
    const measure = () => {
      const next = readViewportSize();
      setSize((previous) =>
        previous.width === next.width && previous.height === next.height ? previous : next,
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  return size;
}

function bluetoothLabel(bt: BtAudioSnapshot | null): string {
  if (!bt) return '蓝牙音箱状态未知';
  if (!bt.available) return '蓝牙音箱不可用';
  if (bt.bluetoothOn === false) return '蓝牙已关闭';
  const active = bt.devices.find((device) => device.id === bt.activeDeviceId);
  if (bt.streaming) return `正在接收「${active?.name ?? '蓝牙设备'}」的音频`;
  if (bt.connected) return `已连接「${active?.name ?? '蓝牙设备'}」`;
  if (bt.activeDeviceId) return `与「${active?.name ?? '蓝牙设备'}」已断开`;
  return '蓝牙音箱未连接';
}

const useStyles = makeStyles({
  dock: {
    position: 'absolute',
    zIndex: 'var(--wtsl-layer-desktop)',
    display: 'flex',
    alignItems: 'flex-end',
    pointerEvents: 'none',
  },
  dockHidden: {
    visibility: 'hidden',
  },
  barHidden: {
    pointerEvents: 'none',
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    boxSizing: 'border-box',
    // 高度 = 20 图标 + 2×spacingVerticalXXS(2) + 2×strokeWidthThin(1) = 26，
    // 与 FOOTER_PILL_ESTIMATE 同源；因此状态栏与说明条可以共用同一条底部带。
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusCircular,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 78%, transparent)`,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow4,
    pointerEvents: 'auto',
    whiteSpace: 'nowrap',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase200,
  },
  itemInfo: {
    color: tokens.colorNeutralForeground3,
  },
  icon: {
    flexShrink: 0,
  },
  itemButton: {
    appearance: 'none',
    position: 'relative',
    border: 0,
    padding: 0,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground2,
    backgroundColor: 'transparent',
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    pointerEvents: 'auto',
    transitionProperty: 'color, background-color',
    transitionDuration: `${motionTokens.durationFaster}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMin,
    // 视觉高 26；命中区 44×44 由 ::after 外扩（横向沿用 26→44 的差值，纵向居中取 44）
    '::after': {
      content: "''",
      position: 'absolute',
      left: HIT_INSET,
      right: HIT_INSET,
      top: '50%',
      height: TOUCH_TARGET_CSS,
      transform: 'translateY(-50%)',
    },
    ':hover': {
      color: tokens.colorNeutralForeground1,
      backgroundColor: tokens.colorSubtleBackgroundHover,
    },
    ':active': {
      backgroundColor: tokens.colorSubtleBackgroundPressed,
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
    },
  },
  itemButtonConnected: {
    color: tokens.colorBrandForeground1,
  },
  itemButtonStreaming: {
    color: tokens.colorStatusSuccessForeground1,
  },
});

export interface StatusBarProps {
  hidden?: boolean;
  /** 点击蓝牙音箱状态：回到设置页「常规 → 设备」 */
  onOpenSettings?: () => void;
}

export function StatusBar({ hidden = false, onOpenSettings }: StatusBarProps) {
  const styles = useStyles();
  const tauri = isTauriRuntime();
  const demo = !tauri && new URLSearchParams(window.location.search).has('statusDemo');
  const visible = tauri || demo;

  const [status, setStatus] = useState<SystemStatusSnapshot | null>(demo ? DEMO_STATUS : null);
  const [bt, setBt] = useState<BtAudioSnapshot | null>(demo ? DEMO_BT : null);

  const pillRef = useRef<HTMLDivElement | null>(null);
  const footerHeight = useFooterPillHeight();
  const viewport = useViewportSize();
  const metrics = useMemo(
    () => computeGridMetrics(viewport.width, viewport.height),
    [viewport.width, viewport.height],
  );
  const frame = useMemo(
    () => layoutFrame(metrics, viewport.width, viewport.height, footerHeight),
    [metrics, viewport.width, viewport.height, footerHeight],
  );

  // 轮询系统状态 + 蓝牙状态；只在 Tauri 下跑，demo 用静态数据。
  // 蓝牙首次要 refresh 才能拿到设备/无线电（BtAudioManager 初始 available=false），
  // 但 refresh 可能比系统状态慢一个数量级：两条线拆开跑，电量/音量不被蓝牙枚举阻塞。
  useEffect(() => {
    if (!tauri) return;
    let alive = true;
    let btReady = false;

    void (async () => {
      try {
        const next = await btAudioRefresh();
        if (alive) {
          setBt(next);
          btReady = true;
        }
      } catch {
        btReady = true;
      }
    })();

    const poll = async () => {
      const nextStatus = await systemStatusSnapshot().catch(() => null);
      if (!alive) return;
      if (nextStatus) setStatus(nextStatus);
      if (!btReady) return;
      const nextBt = await btAudioSnapshot().catch(() => null);
      if (!alive || !nextBt) return;
      setBt(nextBt);
    };
    void poll();
    const timer = window.setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [tauri]);

  // 实测高度上报给底部带：说明条与状态栏共用 H_p = max(两者)。
  useEffect(() => {
    const element = pillRef.current;
    if (!element || !visible) return;
    const report = () => reportFooterStatusBarHeight(element.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(element);
    return () => {
      observer.disconnect();
      reportFooterStatusBarHeight(0);
    };
  }, [visible]);

  if (!visible) return null;

  const right = viewport.width - (frame.entry.x - metrics.gap);
  const bottom = viewport.height - frame.pill.bottom;
  const dockStyle: CSSProperties = { right, bottom };
  const btLabel = bluetoothLabel(bt);
  const btConnected = bt?.connected === true;
  const btStreaming = bt?.streaming === true;
  const btOff = bt?.bluetoothOn === false || bt?.available === false;

  const bluetoothClassName = mergeClasses(
    styles.itemButton,
    btStreaming ? styles.itemButtonStreaming : btConnected ? styles.itemButtonConnected : undefined,
  );
  const BluetoothIcon = btOff
    ? BluetoothDisabled20Regular
    : btConnected
      ? BluetoothConnected20Regular
      : Bluetooth20Regular;
  const bluetoothText = btStreaming
    ? '接收中'
    : btConnected
      ? '已连接'
      : bt === null
        ? '状态未知'
        : bt.available === false
          ? '不可用'
          : bt.bluetoothOn === false
            ? '蓝牙关'
            : bt.activeDeviceId
              ? '已断开'
              : '音箱';

  return (
    <div
      className={mergeClasses(styles.dock, hidden && styles.dockHidden)}
      style={dockStyle}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      <div
        ref={pillRef}
        className={mergeClasses(styles.bar, hidden && styles.barHidden)}
        role="group"
        aria-label="系统状态"
      >
        <button
          type="button"
          className={bluetoothClassName}
          onClick={onOpenSettings}
          aria-label={`蓝牙音箱：${btLabel}；打开设置`}
        >
          <BluetoothIcon aria-hidden="true" className={styles.icon} />
          <Text size={200} style={{ color: 'inherit' }}>
            {bluetoothText}
          </Text>
        </button>

        {status?.volumePercent != null && (
          <span
            className={mergeClasses(styles.item, styles.itemInfo)}
            role="img"
            aria-label={status.muted ? '音量已静音' : `音量 ${status.volumePercent}%`}
          >
            {status.muted ? (
              <SpeakerMute20Regular aria-hidden="true" className={styles.icon} />
            ) : (
              <Speaker220Regular aria-hidden="true" className={styles.icon} />
            )}
            <Text size={200} style={{ color: 'inherit' }}>
              {status.muted ? '静音' : `${status.volumePercent}%`}
            </Text>
          </span>
        )}

        {status?.batteryPercent != null && (
          <span
            className={mergeClasses(styles.item, styles.itemInfo)}
            role="img"
            aria-label={
              status.charging
                ? `电量 ${status.batteryPercent}%，正在充电`
                : `电量 ${status.batteryPercent}%`
            }
          >
            {batteryIcon(status.batteryPercent, status.charging === true)}
            <Text size={200} style={{ color: 'inherit' }}>
              {status.batteryPercent}%
            </Text>
          </span>
        )}
      </div>
    </div>
  );
}
