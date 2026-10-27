/**
 * 桌面快速设置面板（P2，D-43；P0 定稿视觉 `shots/p0-surface/v4-panel-detail.png`）。
 *
 * 由状态栏 pill 经同一套 surface morph 长出来（morph 容器在 `StatusBar.tsx`），这里只负责
 * 面板内容本身：蓝牙设备/首选/自动连接、音量/静音、亮度、自动亮度、系统蓝牙设置。
 *
 * 约束：
 * - 只用 Fluent 原生控件（Switch / Slider / Button）与 `@fluentui/react-icons`，图标 20；
 * - 行高 44（`TOUCH_TARGET_CSS`），滑杆拖动本地乐观 + 100ms 节流提交；
 * - 暗色下 Switch / Slider 的填充色取 Fluent brand ramp brand 90（#2886de，用户 P0 定稿）；
 *   亮色沿用主题 `colorCompoundBrandBackground`，不覆盖。
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, ReactNode, Ref } from 'react';
import {
  Button,
  Slider,
  Switch,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  Phone20Regular,
  Speaker220Regular,
  SpeakerMute20Regular,
  Star20Filled,
  Star20Regular,
  WeatherSunny20Regular,
} from '@fluentui/react-icons';

import { TOUCH_TARGET_CSS } from '../design/metrics';
import {
  AUTO_CONNECT_STATE_TEXT,
  btErrorText,
  orderedDevices,
  type BtAudioSnapshot,
  type BtDeviceInfo,
} from '../system/bluetoothAudio';
import type { SystemStatusSnapshot } from '../system/systemStatus';

/**
 * 暗色面板填充：Fluent 官方 brand ramp brand 90（`#2886de`，见 D-43 / SPEC §4.1）。
 *
 * 主题 token 里没有这个档（`webDarkTheme.colorBrandBackground` = brand 70 偏暗，brand 100 偏浅），
 * 用户 P0 定稿取 brand 90；全文件只允许这一处字面色值。Switch / Slider 读的是
 * `--colorCompoundBrandBackground` CSS 变量，在面板子树内覆盖即可，不改全局主题。
 */
const DARK_BRAND_FILL = '#2886de';
const DARK_BRAND_STYLE = { '--colorCompoundBrandBackground': DARK_BRAND_FILL } as CSSProperties;

/** 拖动滑杆时的提交节流：80–120ms 档（D-43），取 100ms */
const SLIDER_COMMIT_DELAY_MS = 100;

/** 深色/浅色：读 `applyColorSchemeToDocument` 写到 html 上的 `data-theme`（跟随 App 解析后的主题，不用 OS 偏好） */
function useDarkScheme(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    if (typeof document === 'undefined') return () => {};
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  const getSnapshot = useCallback(
    () => (typeof document === 'undefined' ? true : document.documentElement.dataset.theme !== 'light'),
    [],
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}

/** 首选设备永远排第一（与后端队列口径一致） */
function sortDevices(bt: BtAudioSnapshot): BtDeviceInfo[] {
  const ordered = orderedDevices(bt);
  const preferred = bt.preferredDeviceId;
  if (!preferred) return ordered;
  return [...ordered].sort((left, right) => {
    if (left.id === preferred) return -1;
    if (right.id === preferred) return 1;
    return 0;
  });
}

const useStyles = makeStyles({
  root: {
    display: 'grid',
    alignContent: 'start',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    color: tokens.colorNeutralForeground1,
    minWidth: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: TOUCH_TARGET_CSS,
    minWidth: 0,
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  hint: {
    flex: 1,
    minWidth: 0,
    color: tokens.colorNeutralForeground3,
  },
  danger: {
    flex: 1,
    minWidth: 0,
    color: tokens.colorStatusDangerForeground1,
  },
  success: {
    color: tokens.colorStatusSuccessForeground1,
  },
  rowIcon: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground2,
  },
  /** 设备行：主按钮（连接）+ 独立 star 按钮；两个 44 命中区不嵌套 */
  deviceMain: {
    appearance: 'none',
    flex: 1,
    minWidth: 0,
    minHeight: TOUCH_TARGET_CSS,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: 0,
    border: 0,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: 'transparent',
    color: 'inherit',
    fontFamily: tokens.fontFamilyBase,
    textAlign: 'left',
    cursor: 'pointer',
    ':hover': { backgroundColor: tokens.colorSubtleBackgroundHover },
    ':active': { backgroundColor: tokens.colorSubtleBackgroundPressed },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
    },
    ':disabled': { cursor: 'default', backgroundColor: 'transparent' },
  },
  deviceName: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  },
  starButton: {
    appearance: 'none',
    flexShrink: 0,
    minWidth: TOUCH_TARGET_CSS,
    minHeight: TOUCH_TARGET_CSS,
    display: 'grid',
    placeItems: 'center',
    padding: 0,
    border: 0,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: tokens.colorNeutralForeground2,
    ':hover': { backgroundColor: tokens.colorSubtleBackgroundHover },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
    },
  },
  starOn: { color: tokens.colorBrandForeground1 },
  iconButton: {
    flexShrink: 0,
    minWidth: TOUCH_TARGET_CSS,
    minHeight: TOUCH_TARGET_CSS,
  },
  slider: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    flexShrink: 0,
    minWidth: `calc(${tokens.spacingHorizontalXXL} * 2)`,
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
    color: tokens.colorNeutralForeground2,
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    minHeight: TOUCH_TARGET_CSS,
  },
  textButton: {
    minHeight: TOUCH_TARGET_CSS,
    paddingInline: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    color: tokens.colorNeutralForeground2,
  },
  linkButton: {
    minHeight: TOUCH_TARGET_CSS,
    paddingInline: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    color: tokens.colorBrandForeground1,
  },
  spacer: { flex: 1 },
});

/** 拖动滑杆：本地乐观 + 节流提交，避免每像素一次 invoke */
function useThrottledSlider(
  remoteValue: number | null,
  commit: (value: number) => void,
): [number | null, (value: number) => void] {
  const [draft, setDraft] = useState<number | null>(remoteValue);
  const pendingRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const commitRef = useRef(commit);
  commitRef.current = commit;

  useEffect(() => {
    if (pendingRef.current === null) setDraft(remoteValue);
  }, [remoteValue]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const schedule = useCallback((value: number) => {
    setDraft(value);
    pendingRef.current = value;
    if (timerRef.current !== null) return;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending !== null) commitRef.current(pending);
    }, SLIDER_COMMIT_DELAY_MS);
  }, []);

  return [draft, schedule];
}

export interface QuickSettingsPanelProps {
  status: SystemStatusSnapshot | null;
  bt: BtAudioSnapshot | null;
  /** 快照读取失败（无 snapshot 可显示） */
  btError: boolean;
  /** 蓝牙命令进行中：全部蓝牙控件禁用 */
  btBusy: boolean;
  /** 正在手动连接的设备 id（行内显示「连接中…」） */
  pendingDeviceId: string | null;
  onRetry: () => void;
  onConnect: (deviceId: string) => void;
  onDisconnect: () => void;
  onSetAutoConnect: (enabled: boolean) => void;
  onResumeAuto: () => void;
  onSetPreferred: (deviceId: string | null) => void;
  onSetVolume: (percent: number) => void;
  onToggleMute: () => void;
  onSetBrightness: (percent: number) => void;
  onSetAutoBrightness: (enabled: boolean) => void;
  onOpenWindowsBluetooth: () => void;
  /** StatusBar 用它量面板内容高度来驱动 surface morph */
  contentRef?: Ref<HTMLDivElement>;
}

export function QuickSettingsPanel({
  status,
  bt,
  btError,
  btBusy,
  pendingDeviceId,
  onRetry,
  onConnect,
  onDisconnect,
  onSetAutoConnect,
  onResumeAuto,
  onSetPreferred,
  onSetVolume,
  onToggleMute,
  onSetBrightness,
  onSetAutoBrightness,
  onOpenWindowsBluetooth,
  contentRef,
}: QuickSettingsPanelProps) {
  const styles = useStyles();
  const dark = useDarkScheme();

  const [volume, setVolume] = useThrottledSlider(status?.volumePercent ?? null, onSetVolume);
  const [brightness, setBrightness] = useThrottledSlider(
    status?.brightnessPercent ?? null,
    onSetBrightness,
  );

  const devices = bt ? sortDevices(bt) : [];
  const bluetoothReady = Boolean(bt && bt.available && bt.bluetoothOn !== false);
  const bluetoothBusy = btBusy || !bluetoothReady;
  const muted = status?.muted === true;
  const paused = bt?.autoConnectState === 'paused';
  const connected = bt?.connected === true;
  const errorText = btErrorText(bt?.lastAttemptError ?? bt?.lastError ?? null);

  let body: ReactNode;
  if (!bt) {
    body = (
      <div className={styles.row}>
        <Text size={200} className={btError ? styles.danger : styles.hint}>
          {btError ? '读取蓝牙状态失败' : '正在读取蓝牙状态…'}
        </Text>
        {btError ? (
          <Button appearance="transparent" className={styles.textButton} onClick={onRetry}>
            重试
          </Button>
        ) : null}
      </div>
    );
  } else {
    body = (
      <>
        <div className={styles.row}>
          <Text size={300} weight="semibold" className={styles.title}>
            蓝牙音箱
          </Text>
          <Switch
            aria-label="自动连接"
            checked={bt.autoConnectEnabled === true}
            disabled={bluetoothBusy}
            onChange={(_event, data) => onSetAutoConnect(data.checked)}
          />
        </div>

        {devices.length === 0 ? (
          <div className={styles.row}>
            <Text size={200} className={styles.hint}>
              {!bt.available
                ? '没有找到可用的蓝牙适配器'
                : bt.bluetoothOn === false
                  ? '蓝牙已关闭'
                  : '还没有配对的设备'}
            </Text>
            <Button appearance="transparent" className={styles.textButton} onClick={onOpenWindowsBluetooth}>
              蓝牙设置
            </Button>
          </div>
        ) : (
          devices.map((device) => {
            const active = bt.activeDeviceId === device.id;
            const deviceConnected = active && bt.connected;
            const deviceStreaming = active && bt.streaming;
            const preferred = bt.preferredDeviceId === device.id;
            const connecting = pendingDeviceId === device.id;
            const statusText = active
              ? deviceConnected
                ? deviceStreaming
                  ? '接收中'
                  : '已连接'
                : '已断开'
              : connecting
                ? '连接中…'
                : '未连接';
            return (
              <div className={styles.row} key={device.id}>
                <button
                  type="button"
                  className={styles.deviceMain}
                  disabled={bluetoothBusy || active}
                  onClick={() => onConnect(device.id)}
                >
                  <Phone20Regular aria-hidden="true" className={styles.rowIcon} />
                  <Text size={200} className={styles.deviceName}>
                    {device.name}
                  </Text>
                  <Text
                    size={200}
                    className={mergeClasses(styles.value, deviceConnected ? styles.success : undefined)}
                  >
                    {statusText}
                  </Text>
                </button>
                <button
                  type="button"
                  className={styles.starButton}
                  aria-label={preferred ? `取消首选：${device.name}` : `设为首选：${device.name}`}
                  aria-pressed={preferred}
                  disabled={btBusy}
                  onClick={() => onSetPreferred(preferred ? null : device.id)}
                >
                  {preferred ? (
                    <Star20Filled aria-hidden="true" className={styles.starOn} />
                  ) : (
                    <Star20Regular aria-hidden="true" />
                  )}
                </button>
              </div>
            );
          })
        )}

        {paused ? (
          <div className={styles.row}>
            <Text size={200} className={styles.hint}>
              自动连接已暂停
            </Text>
            <Button appearance="transparent" className={styles.textButton} onClick={onResumeAuto}>
              恢复
            </Button>
          </div>
        ) : null}

        {bt.autoConnectState === 'backoff' ? (
          <div className={styles.row}>
            <Text size={200} className={styles.hint}>
              {AUTO_CONNECT_STATE_TEXT.backoff}
            </Text>
          </div>
        ) : null}

        {errorText ? (
          <div className={styles.row}>
            <Text size={200} className={styles.danger}>
              {errorText}
            </Text>
          </div>
        ) : null}

        {status?.volumePercent != null ? (
          <div className={styles.row}>
            <Button
              appearance="transparent"
              className={styles.iconButton}
              aria-label={muted ? '取消静音' : '静音'}
              icon={muted ? <SpeakerMute20Regular /> : <Speaker220Regular />}
              disabled={bt === null}
              onClick={onToggleMute}
            />
            <Slider
              className={styles.slider}
              min={0}
              max={100}
              value={volume ?? 0}
              aria-label="音量"
              onChange={(_event, data) => setVolume(data.value)}
            />
            <Text size={200} className={styles.value}>
              {muted ? '静音' : `${Math.round(volume ?? 0)}%`}
            </Text>
          </div>
        ) : null}

        {status?.brightnessPercent != null ? (
          <div className={styles.row}>
            <WeatherSunny20Regular aria-hidden="true" className={styles.rowIcon} />
            <Slider
              className={styles.slider}
              min={0}
              max={100}
              value={brightness ?? 0}
              aria-label="亮度"
              onChange={(_event, data) => setBrightness(data.value)}
            />
            <Text size={200} className={styles.value}>
              {Math.round(brightness ?? 0)}%
            </Text>
          </div>
        ) : null}

        {status?.autoBrightnessSupported === true ? (
          <div className={styles.row}>
            <WeatherSunny20Regular aria-hidden="true" className={styles.rowIcon} />
            <Text size={200} className={styles.hint}>
              自动亮度
            </Text>
            <Switch
              aria-label="自动亮度"
              checked={status.autoBrightnessEnabled === true}
              disabled={status.autoBrightnessEnabled === null}
              onChange={(_event, data) => onSetAutoBrightness(data.checked)}
            />
          </div>
        ) : null}

        <div className={styles.linkRow}>
          <Button appearance="transparent" className={styles.linkButton} onClick={onOpenWindowsBluetooth}>
            打开 Windows 蓝牙设置
          </Button>
          <span className={styles.spacer} />
          {connected ? (
            <Button
              appearance="transparent"
              className={styles.textButton}
              disabled={btBusy}
              onClick={onDisconnect}
            >
              断开
            </Button>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <div
      ref={contentRef}
      className={styles.root}
      style={dark ? DARK_BRAND_STYLE : undefined}
      data-quick-settings="true"
    >
      {body}
    </div>
  );
}
