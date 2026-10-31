/**
 * 桌面底部状态栏（宿主 chrome）+ 快速设置面板入口（P2，D-40/D-43）。
 *
 * 位置：右缘 = Agent 入口左侧一个 gutter，下缘 = `layoutFrame().pill.bottom`（与说明条同一条线）。
 * 高度实测后上报 `reportFooterStatusBarHeight`，`H_p = max(说明条, 状态栏)`；**展开面板不参与
 * 布局**（浮层，H_p 恒为收起态 26），与说明条展开卡同一口径（D-42）。
 *
 * 交互：整条 pill 是按钮（44×44 命中区由 ::after 外扩、不改视觉高度），点击经同一 surface
 * 宽高/圆角/阴影 morph 长出 QuickSettingsPanel（250ms decelerate / 150ms accelerate，内容淡入）；
 * 展开态底部保留状态栏行 + chevron，折叠时 chevron 一起隐藏；点外部 / Esc 折叠、焦点回状态栏。
 *
 * 数据：系统状态在本组件内 2s 轮询；蓝牙快照来自 `useBluetoothAudio` 单例 store（P2，D-51），
 * 组件不再自己起蓝牙 interval，也不再有本地 btBusy/pending* 状态。
 * 视觉：与说明条/卡片同一套 72% 中性面 + blur 24 + stroke2 + shadow4；hover 1.02 / pressed 0.98
 * 数值来自 design/metrics，时长曲线只用 motionTokens。图标：内联信息 16、按钮 20。
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import {
  Text,
  makeStyles,
  mergeClasses,
  motionTokens,
  tokens,
} from '@fluentui/react-components';
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
  Bluetooth16Regular,
  ChevronDown20Regular,
  Speaker216Regular,
  SpeakerMute16Regular,
} from '@fluentui/react-icons';

import {
  SURFACE_HOVER_SCALE,
  SURFACE_PRESS_SCALE,
  TOUCH_TARGET_CSS,
} from '../design/metrics';
import {
  FOOTER_PILL_ESTIMATE,
  computeGridMetrics,
  layoutFrame,
  reportFooterStatusBarHeight,
  useFooterPillHeight,
} from '../layout';
import { isTauriRuntime } from '../plugins/tauri';
import { btOperationText, type BtAudioSnapshot } from '../system/bluetoothAudio';
import {
  systemSetAutoBrightness,
  systemSetBrightness,
  systemSetMuted,
  systemSetVolume,
  systemStatusSnapshot,
  type SystemStatusSnapshot,
} from '../system/systemStatus';
import { useBluetoothAudio } from '../system/useBluetoothAudio';
import { QuickSettingsPanel } from './QuickSettingsPanel';

const POLL_INTERVAL_MS = 2000;

/** 面板宽度：`spacingHorizontalXXXL(32) × 11 + spacingHorizontalS(8)` = 360（P0 定稿） */
const QUICK_SETTINGS_WIDTH = `calc(${tokens.spacingHorizontalXXXL} * 11 + ${tokens.spacingHorizontalS})`;

const PANEL_ID = 'wtsl-quick-settings';

/** 浏览器预览（`?statusDemo=1`）用的假数据，只为检查布局；不参与产品逻辑 */
const DEMO_STATUS: SystemStatusSnapshot = {
  batteryPercent: 76,
  charging: true,
  volumePercent: 42,
  muted: false,
  brightnessPercent: 100,
  autoBrightnessSupported: true,
  autoBrightnessEnabled: true,
};

const DEMO_BT: BtAudioSnapshot = {
  available: true,
  bluetoothSupported: true,
  bluetoothOn: true,
  devices: [
    { id: 'demo-phone', name: 'Lemon 的 iPhone SE' },
    { id: 'demo-phone-2', name: '另一台手机' },
  ],
  activeDeviceId: 'demo-phone',
  connected: true,
  streaming: true,
  connectionState: 'opened',
  lastError: null,
  autoConnectEnabled: true,
  autoConnectState: 'waiting',
  attemptDeviceId: null,
  lastAttemptError: null,
  preferredDeviceId: 'demo-phone',
  order: ['demo-phone', 'demo-phone-2'],
  linkPhase: 'streaming',
  radioPhase: 'on',
  operation: null,
  lastTransitionAtMs: 0,
  unverifiedDisconnect: false,
  outputSuppressed: false,
  suppressReason: null,
};

/** 电量分级图标（Fluent 只提供 20 档分级；16 档仅满电，见实现说明） */
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

/**
 * 收起态 pill 的一句话蓝牙文案（短、动词/状态开头，不带句号）：
 * 操作阶段优先 → FIFO 本地静音（被本机音乐压住）→ 链路/无线电状态。
 */
function bluetoothLabel(bt: BtAudioSnapshot | null): string {
  if (!bt) return '状态未知';
  const operationText = btOperationText(bt.operation);
  if (operationText) return operationText;
  if (bt.outputSuppressed === true) return '已静音';
  if (!bt.available) return '蓝牙不可用';
  if (bt.bluetoothOn === false) return '蓝牙已关';
  if (bt.streaming) return '接收中';
  if (bt.connected) return '已连接';
  if (bt.unverifiedDisconnect) return '可能仍连接';
  return '未连接';
}

type PanelPhase = 'closed' | 'opening' | 'open' | 'closing';

const useStyles = makeStyles({
  dock: {
    position: 'absolute',
    /*
     * 层级：App 把 Desktop 包在 `PageTransition` 里，而 PageTransition 的 frame 自带
     * `--wtsl-layer-page`(20)；状态栏是本层内更晚的兄弟节点，取同一个 z 才能在「同 z、
     * 后者在上」的规则下盖过 Desktop 的整屏手势层并收到点击（v0.8.0 面板可点性的前提）。
     * 它仍在 `.host-desktop-layer`(z=10) 这个外层 stacking context 内，所以设置页/复盘页
     * 与 Agent 浮层（host-root 下的 20/30 层）依旧在状态栏之上。
     */
    zIndex: 'var(--wtsl-layer-page)',
    display: 'flex',
    alignItems: 'flex-end',
    pointerEvents: 'none',
  },
  dockHidden: {
    visibility: 'hidden',
  },
  surface: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 72%, transparent)`,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow4,
    borderRadius: tokens.borderRadiusCircular,
    transformOrigin: 'right bottom',
    overflow: 'visible',
    pointerEvents: 'auto',
    whiteSpace: 'nowrap',
    transitionProperty: 'width, height, border-radius, box-shadow, border-color, background-color, transform',
    transitionDuration: `${motionTokens.durationFast}ms`,
    transitionTimingFunction: motionTokens.curveAccelerateMin,
    ':hover': {
      boxShadow: tokens.shadow8,
      border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
      transform: `scale(${SURFACE_HOVER_SCALE})`,
      transitionDuration: `${motionTokens.durationFaster}ms`,
      transitionTimingFunction: motionTokens.curveDecelerateMin,
    },
    ':active': {
      transform: `scale(${SURFACE_PRESS_SCALE})`,
      transitionDuration: `${motionTokens.durationUltraFast}ms`,
      transitionTimingFunction: motionTokens.curveAccelerateMin,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionProperty: 'background-color, border-color, box-shadow',
      ':hover': { transform: 'none' },
      ':active': { transform: 'none' },
    },
  },
  surfaceOpen: {
    borderRadius: tokens.borderRadius2XLarge,
    boxShadow: tokens.shadow16,
    overflow: 'hidden',
    transitionDuration: `${motionTokens.durationGentle}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
    ':hover': {
      boxShadow: tokens.shadow16,
      border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
      transform: 'none',
    },
    ':active': { transform: 'none' },
  },
  /** 底部状态栏行：收起态就是整条 pill；展开态贴面板底部（marginTop:auto + 面板显式高度） */
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 'auto',
    minWidth: 0,
  },
  barButton: {
    appearance: 'none',
    position: 'relative',
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    // P0 定稿的 bar gap 20 = spacingHorizontalXL（spacingHorizontalL 是 16，不取）
    gap: tokens.spacingHorizontalXL,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    margin: 0,
    border: 0,
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground2,
    fontFamily: tokens.fontFamilyBase,
    cursor: 'pointer',
    // 44×44 命中区：视觉高 24（16 图标 + 上下 4），命中区纵向外扩到 TOUCH_TARGET，不改视觉高度
    '::after': {
      content: "''",
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      height: TOUCH_TARGET_CSS,
      transform: 'translateY(-50%)',
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
      borderRadius: tokens.borderRadiusCircular,
    },
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
    color: 'inherit',
    lineHeight: tokens.lineHeightBase200,
  },
  itemInfo: {
    color: tokens.colorNeutralForeground2,
  },
  itemConnected: {
    color: tokens.colorBrandForeground1,
  },
  itemStreaming: {
    color: tokens.colorStatusSuccessForeground1,
  },
  /** FIFO 本地静音：文字已说「已静音」，图标同时退回中性色，不用 success 冒充正在出声 */
  itemMuted: {
    color: tokens.colorNeutralForeground3,
  },
  icon: {
    flexShrink: 0,
  },
  /**
   * 电量图标槽：Fluent 电量分级只有 20 档（16 档仅 Battery10），图标本身 20，
   * 但状态行高度必须与说明条共用 26（16 文本行 + 上下 4 + 描边），所以槽固定为 16 行高，
   * 图标在槽内居中溢出到 padding 里（不改行高、不缩放图标）。
   */
  iconSlot: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: tokens.lineHeightBase200,
  },
  chevron: {
    appearance: 'none',
    position: 'relative',
    flexShrink: 0,
    width: TOUCH_TARGET_CSS,
    height: `${tokens.spacingVerticalXXL}px`,
    display: 'grid',
    placeItems: 'center',
    padding: 0,
    margin: 0,
    border: 0,
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    borderRadius: tokens.borderRadiusMedium,
    ':hover': { color: tokens.colorNeutralForeground1 },
    // 展开态底部行的 44×44 命中区：向上外扩，不撑高状态行
    '::after': {
      content: "''",
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: TOUCH_TARGET_CSS,
      height: TOUCH_TARGET_CSS,
      transform: 'translate(-50%, -50%)',
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
    },
  },
  /** 面板内容层：绝对定位在状态栏行上方，宽度随 surface；morph 期间由 surface 圆角裁切 */
  panelLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: `${motionTokens.durationFaster}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: `${motionTokens.durationUltraFast}ms`,
    },
  },
  panelLayerVisible: {
    opacity: 1,
  },
});

export interface StatusBarProps {
  hidden?: boolean;
  /**
   * 兼容 App 接线（v0.7.0 状态栏的唯一交互项是「打开设置页」）。
   * v0.8.0 起点击状态栏打开快速设置面板，面板自带「打开 Windows 蓝牙设置」，
   * 宿主设置页入口改由设置快捷键/右键菜单承担，因此这里不再使用。
   */
  onOpenSettings?: () => void;
}

export function StatusBar({ hidden = false }: StatusBarProps) {
  const styles = useStyles();
  const tauri = isTauriRuntime();
  const demo = !tauri && new URLSearchParams(window.location.search).has('statusDemo');
  const visible = tauri || demo;

  const [status, setStatus] = useState<SystemStatusSnapshot | null>(demo ? DEMO_STATUS : null);

  // 蓝牙快照统一来自模块级 store（P2，D-51）：组件里不再有本地 bt / btBusy / pending* 与轮询 interval。
  const bluetooth = useBluetoothAudio();
  const {
    refreshNow: refreshBluetooth,
    connect: connectBluetooth,
    disconnect: disconnectBluetooth,
    setEnabled: setBluetoothEnabled,
    setPreferred: setBluetoothPreferred,
    restoreOutput: restoreBluetoothOutputAction,
    openSettings: openBluetoothSettings,
  } = bluetooth;
  /** 浏览器演示态（`?statusDemo`）的假数据：只在组件内变化，不参与产品逻辑 */
  const [demoBt, setDemoBt] = useState<BtAudioSnapshot | null>(demo ? DEMO_BT : null);
  const bt = demo ? demoBt : bluetooth.snapshot;
  const btError = demo ? false : bluetooth.error;

  const [phase, setPhase] = useState<PanelPhase>('closed');
  const [contentShown, setContentShown] = useState(false);
  const [pillHeight, setPillHeight] = useState(FOOTER_PILL_ESTIMATE);
  const [statusRowHeight, setStatusRowHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const dockRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const barButtonRef = useRef<HTMLButtonElement | null>(null);
  const statusRowRef = useRef<HTMLDivElement | null>(null);
  const panelContentRef = useRef<HTMLDivElement | null>(null);
  const closedSizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: FOOTER_PILL_ESTIMATE,
  });
  const lockedSizeRef = useRef<{ width: number; height: number } | null>(null);

  const footerPillHeight = useFooterPillHeight();
  const viewport = useViewportSize();
  const metrics = useMemo(
    () => computeGridMetrics(viewport.width, viewport.height),
    [viewport.width, viewport.height],
  );
  const frame = useMemo(
    () => layoutFrame(metrics, viewport.width, viewport.height, footerPillHeight),
    [metrics, viewport.width, viewport.height, footerPillHeight],
  );

  // ---------- 系统状态轮询（蓝牙由 useBluetoothAudio 按自己的节奏轮询，互不阻塞） ----------

  const readSystemStatus = useCallback(async () => {
    const next = await systemStatusSnapshot().catch(() => null);
    if (next) setStatus(next);
  }, []);

  useEffect(() => {
    if (!tauri) return undefined;
    let alive = true;
    void readSystemStatus();
    const systemTimer = window.setInterval(() => {
      if (!alive) return;
      void readSystemStatus();
    }, POLL_INTERVAL_MS);
    return () => {
      alive = false;
      window.clearInterval(systemTimer);
    };
  }, [tauri, readSystemStatus]);

  // ---------- 蓝牙命令（store actions；手动操作与 Agent 同一语义：disconnect 由后端置 paused） ----------

  const connectDevice = useCallback(
    (deviceId: string) => {
      if (!tauri) {
        setDemoBt((previous) =>
          previous
            ? {
                ...previous,
                activeDeviceId: deviceId,
                connected: true,
                streaming: false,
                connectionState: 'enabled',
                linkPhase: 'connected',
                autoConnectState: 'waiting',
                lastError: null,
              }
            : previous,
        );
        return;
      }
      void connectBluetooth(deviceId);
    },
    [tauri, connectBluetooth],
  );

  const disconnectDevice = useCallback(() => {
    if (!tauri) {
      setDemoBt((previous) =>
        previous
          ? {
              ...previous,
              activeDeviceId: null,
              connected: false,
              streaming: false,
              connectionState: 'idle',
              linkPhase: 'idle',
              unverifiedDisconnect: false,
              autoConnectState: 'paused',
            }
          : previous,
      );
      return;
    }
    void disconnectBluetooth();
  }, [tauri, disconnectBluetooth]);

  /**
   * 面板顶部的「蓝牙音箱」总开关（不是自动连接偏好）：一个动作联动后端
   * 「开蓝牙 / 开始寻找 / 自动连接」或「断开 / 停止寻找」（命令 bt_audio_set_enabled）。
   * 非阻塞：调用立即返回，过渡态来自快照的 `operation`（不假装瞬间完成）。
   */
  const setBluetoothSpeakerEnabled = useCallback(
    (enabled: boolean) => {
      if (!tauri) {
        setDemoBt((previous) =>
          previous
            ? {
                ...previous,
                enabled,
                bluetoothOn: enabled ? true : previous.bluetoothOn,
                radioPhase: enabled ? 'on' : previous.radioPhase,
                autoConnectEnabled: enabled,
                autoConnectState: enabled ? 'waiting' : 'off',
                activeDeviceId: enabled ? previous.activeDeviceId : null,
                connected: enabled ? previous.connected : false,
                streaming: enabled ? previous.streaming : false,
                connectionState: enabled ? previous.connectionState : 'idle',
                linkPhase: enabled ? previous.linkPhase : 'idle',
              }
            : previous,
        );
        return;
      }
      void setBluetoothEnabled(enabled);
    },
    [tauri, setBluetoothEnabled],
  );

  const setPreferred = useCallback(
    (deviceId: string | null) => {
      if (!tauri) {
        setDemoBt((previous) => (previous ? { ...previous, preferredDeviceId: deviceId } : previous));
        return;
      }
      void setBluetoothPreferred(deviceId);
    },
    [tauri, setBluetoothPreferred],
  );

  const openWindowsBluetooth = useCallback(() => {
    if (!tauri) return;
    void openBluetoothSettings();
  }, [tauri, openBluetoothSettings]);

  /**
   * FIFO 手动恢复（P3c）：解除「被本机音乐压住」的蓝牙本地静音。
   * 只恢复平板本地输出：不断连接、不操控手机端（手机照旧推流，只是重新出声）。
   */
  const restoreBluetoothOutput = useCallback(() => {
    if (!tauri) {
      setDemoBt((previous) =>
        previous ? { ...previous, outputSuppressed: false, suppressReason: null } : previous,
      );
      return;
    }
    void restoreBluetoothOutputAction();
  }, [tauri, restoreBluetoothOutputAction]);

  // ---------- 系统控制（滑杆/开关）：先本地乐观，再写 Rust；失败由下一次轮询纠正 ----------

  const setVolume = useCallback(
    (percent: number) => {
      setStatus((previous) =>
        previous ? { ...previous, volumePercent: percent, muted: false } : previous,
      );
      if (tauri) void systemSetVolume(percent).catch(() => {});
    },
    [tauri],
  );

  const toggleMute = useCallback(() => {
    const nextMuted = status?.muted !== true;
    setStatus((previous) => (previous ? { ...previous, muted: nextMuted } : previous));
    if (tauri) void systemSetMuted(nextMuted).catch(() => {});
  }, [tauri, status?.muted]);

  const setBrightness = useCallback(
    (percent: number) => {
      setStatus((previous) =>
        previous ? { ...previous, brightnessPercent: percent } : previous,
      );
      if (tauri) void systemSetBrightness(percent).catch(() => {});
    },
    [tauri],
  );

  const setAutoBrightness = useCallback(
    (enabled: boolean) => {
      setStatus((previous) =>
        previous ? { ...previous, autoBrightnessEnabled: enabled } : previous,
      );
      if (tauri) void systemSetAutoBrightness(enabled).catch(() => {});
    },
    [tauri],
  );

  const retry = useCallback(() => {
    if (!tauri) return;
    void readSystemStatus();
    void refreshBluetooth();
  }, [tauri, readSystemStatus, refreshBluetooth]);

  // ---------- 展开 / 折叠 ----------

  const expand = useCallback(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const width = Math.round(surface.offsetWidth);
    const height = Math.round(surface.offsetHeight);
    if (width <= 0 || height <= 0) return;
    closedSizeRef.current = { width, height };
    lockedSizeRef.current = { width, height };
    setPhase('opening');
  }, []);

  const collapse = useCallback((restoreFocus: boolean) => {
    setPhase((previous) => (previous === 'closed' ? previous : 'closing'));
    if (restoreFocus) barButtonRef.current?.focus({ preventScroll: true });
  }, []);

  const togglePanel = useCallback(() => {
    if (phase === 'closed') expand();
    else if (phase === 'opening' || phase === 'open') collapse(true);
  }, [phase, expand, collapse]);

  // opening 只停一帧：把当前真实尺寸先落成显式像素，下一帧再切到展开尺寸，width/height 才可过渡
  useEffect(() => {
    if (phase !== 'opening') return undefined;
    const frameId = window.requestAnimationFrame(() => setPhase('open'));
    return () => window.cancelAnimationFrame(frameId);
  }, [phase]);

  // 内容淡入：挂载后下一帧再置 opacity=1（同帧挂载直接给终值不会触发 transition）
  useEffect(() => {
    if (phase !== 'open') {
      setContentShown(false);
      return undefined;
    }
    const frameId = window.requestAnimationFrame(() => setContentShown(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [phase]);

  // 收起过渡结束后回到 auto 尺寸（文字变化时收起态仍自适应宽度）
  useEffect(() => {
    if (phase !== 'closing') return undefined;
    const timer = window.setTimeout(() => {
      setPhase('closed');
      setContentHeight(0);
    }, motionTokens.durationFast);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // 实测收起态尺寸（只在 closed 阶段量；展开态高度由内容驱动，不参与 H_p）
  useLayoutEffect(() => {
    if (!visible || phase !== 'closed') return;
    const surface = surfaceRef.current;
    const row = statusRowRef.current;
    if (!surface || !row) return;
    const height = Math.round(surface.offsetHeight);
    if (height > 0) setPillHeight(height);
    const rowHeight = Math.round(row.offsetHeight);
    if (rowHeight > 0) setStatusRowHeight(rowHeight);
  }, [visible, phase]);

  // 面板内容高度（决定展开态 surface 高度）
  useLayoutEffect(() => {
    if (phase !== 'open') return undefined;
    const element = panelContentRef.current;
    if (!element) return undefined;
    const measure = () => setContentHeight(Math.round(element.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [phase]);

  // 展开时焦点进面板第一个可操作项；折叠时（chevron/Esc/点外部）由 collapse(true) 把焦点送回状态栏
  useEffect(() => {
    if (phase !== 'open') return undefined;
    const id = window.setTimeout(() => {
      const first = panelContentRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [role="switch"], [role="slider"]',
      );
      first?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(id);
  }, [phase]);

  // 点外部 / Esc 折叠（capture 阶段拦住 App 的全局 Esc；注意 iframe 内的点击收不到，属已知限制）
  useEffect(() => {
    if (phase !== 'open') return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const surface = surfaceRef.current;
      if (surface && event.target instanceof Node && surface.contains(event.target)) return;
      collapse(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      collapse(true);
    };
    const onBlur = () => collapse(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('blur', onBlur);
    };
  }, [phase, collapse]);

  // 欣赏壁纸 / 编辑模式隐藏时折叠（App 只传 hidden，不能改 App 接线）
  useEffect(() => {
    if (hidden) setPhase('closed');
  }, [hidden]);

  // 底部带高度：始终上报收起态高度（展开面板是浮层，不参与布局）
  useEffect(() => {
    if (!visible) return;
    reportFooterStatusBarHeight(pillHeight);
  }, [visible, pillHeight]);
  useEffect(() => () => reportFooterStatusBarHeight(0), []);

  if (!visible) return null;

  const right = viewport.width - (frame.entry.x - metrics.gap);
  const bottom = viewport.height - frame.pill.bottom;
  const dockStyle: CSSProperties = { right, bottom };

  const label = bluetoothLabel(bt);
  const btConnected = bt?.connected === true;
  const btStreaming = bt?.streaming === true;
  const btSuppressed = bt?.outputSuppressed === true;
  const bluetoothOff = bt?.bluetoothOn === false || bt?.available === false;

  const surfaceStyle: CSSProperties =
    phase === 'closed'
      ? {}
      : phase === 'opening' && lockedSizeRef.current
        ? {
            width: `${lockedSizeRef.current.width}px`,
            height: `${lockedSizeRef.current.height}px`,
          }
        : phase === 'closing'
          ? {
              width: `${closedSizeRef.current.width}px`,
              height: `${closedSizeRef.current.height}px`,
            }
          : {
              width: QUICK_SETTINGS_WIDTH,
              height: `${closedSizeRef.current.height + contentHeight}px`,
            };

  /** 读屏用的动作词跟着展开态走：同一颗按钮不同时承诺“打开”和“收起” */
  const panelAction = phase === 'open' ? '收起快速设置' : '打开快速设置';
  const accessibleLabel = [
    `蓝牙音箱：${btSuppressed ? '已被本机音乐静音' : label}`,
    status?.volumePercent != null
      ? status.muted === true
        ? '音量已静音'
        : `音量 ${status.volumePercent}%`
      : null,
    status?.batteryPercent != null
      ? status.charging === true
        ? `电量 ${status.batteryPercent}%，正在充电`
        : `电量 ${status.batteryPercent}%`
      : null,
    panelAction,
  ]
    .filter((part): part is string => Boolean(part))
    .join('；');

  return (
    <div
      ref={dockRef}
      className={mergeClasses(styles.dock, hidden && styles.dockHidden)}
      style={dockStyle}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      <div
        ref={surfaceRef}
        className={mergeClasses(styles.surface, phase === 'open' && styles.surfaceOpen)}
        style={surfaceStyle}
        data-wtsl-statusbar="true"
        data-open={phase === 'open' ? 'true' : undefined}
      >
        {phase === 'open' ? (
          <div
            className={mergeClasses(styles.panelLayer, contentShown && styles.panelLayerVisible)}
            id={PANEL_ID}
            role="dialog"
            aria-label="快速设置"
            aria-modal="false"
            style={{ bottom: statusRowHeight }}
          >
            <QuickSettingsPanel
              status={status}
              bt={bt}
              btError={btError}
              onRetry={retry}
              onConnect={connectDevice}
              onDisconnect={disconnectDevice}
              onSetEnabled={setBluetoothSpeakerEnabled}
              onSetPreferred={setPreferred}
              onSetVolume={setVolume}
              onToggleMute={toggleMute}
              onSetBrightness={setBrightness}
              onSetAutoBrightness={setAutoBrightness}
              onOpenWindowsBluetooth={openWindowsBluetooth}
              onRestoreOutput={restoreBluetoothOutput}
              contentRef={panelContentRef}
            />
          </div>
        ) : null}

        <div className={styles.statusRow} ref={statusRowRef}>
          <button
            ref={barButtonRef}
            type="button"
            className={styles.barButton}
            aria-label={accessibleLabel}
            aria-expanded={phase === 'open'}
            aria-controls={PANEL_ID}
            onClick={togglePanel}
          >
            <span aria-hidden="true" className={styles.item}>
              <Bluetooth16Regular
                aria-hidden="true"
                className={mergeClasses(
                  styles.icon,
                  btSuppressed
                    ? styles.itemMuted
                    : btStreaming
                      ? styles.itemStreaming
                      : btConnected
                        ? styles.itemConnected
                        : bluetoothOff
                          ? undefined
                          : styles.itemInfo,
                )}
              />
              <Text size={200} style={{ color: 'inherit' }}>
                {label}
              </Text>
            </span>

            {status?.volumePercent != null ? (
              <span aria-hidden="true" className={mergeClasses(styles.item, styles.itemInfo)}>
                {status.muted === true ? (
                  <SpeakerMute16Regular aria-hidden="true" className={styles.icon} />
                ) : (
                  <Speaker216Regular aria-hidden="true" className={styles.icon} />
                )}
                <Text size={200} style={{ color: 'inherit' }}>
                  {status.muted === true ? '静音' : `${status.volumePercent}%`}
                </Text>
              </span>
            ) : null}

            {status?.batteryPercent != null ? (
              <span aria-hidden="true" className={mergeClasses(styles.item, styles.itemInfo)}>
                <span className={styles.iconSlot}>
                  {batteryIcon(status.batteryPercent, status.charging === true)}
                </span>
                <Text size={200} style={{ color: 'inherit' }}>
                  {status.batteryPercent}%
                </Text>
              </span>
            ) : null}
          </button>

          {phase === 'open' ? (
            <button
              type="button"
              className={styles.chevron}
              aria-label="收起快速设置"
              aria-expanded={true}
              onClick={() => collapse(true)}
            >
              <ChevronDown20Regular aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
