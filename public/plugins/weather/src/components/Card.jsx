/**
 * 天气卡片：五档尺寸，按 UI-REWRITE-SPEC §3.6 重排。
 *
 * 字号只走 Fluent 字阶：温度用 D-07 Display XL（1×1/2×1/2×2 = 48）或
 * fontSizeHero1000（3×2/4×2 = 68）；文本全部 `<Text size>`；无 clamp、无 lineHeight 覆盖。
 * 正常模式无 chrome；预警 MessageBar 只在有预警时出现；AQI 环 88px 不裁切。
 */

import { useCallback, useRef } from 'react';
import { Button, Spinner, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { ArrowClockwise20Regular, Key20Regular } from '@fluentui/react-icons';
import { displayXl } from '../../../_shared/typography.js';
import { AirRing, DailyColumns, HourlyStrip, isNight } from './forecast.jsx';
import { Condition, HiLo, WarningStrip, WeatherIcon } from './atoms.jsx';
import { fmtTemp } from '../data/format.js';

const useStyles = makeStyles({
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    // 卡片材质由宿主 WidgetCard 提供，插件根节点保持透明（D-02b）
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
    userSelect: 'none',
    cursor: 'pointer',
    ':hover': { backgroundColor: tokens.colorSubtleBackgroundHover },
    ':active': { backgroundColor: tokens.colorSubtleBackgroundPressed },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: '-2px',
    },
  },
  gapXS: { gap: tokens.spacingVerticalXS },
  gapS: { gap: tokens.spacingVerticalS },

  // 间距按 UI-REWRITE-SPEC §2：1×1=8；2×1=8v/12h；2×2=12；3×2/4×2=12v/16h
  pad1: { padding: tokens.spacingHorizontalS },
  pad2: { padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}` },
  pad22: { padding: tokens.spacingVerticalM },
  padLarge: { padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}` },

  offlineDot: {
    position: 'absolute',
    top: tokens.spacingVerticalS,
    right: tokens.spacingHorizontalS,
    width: tokens.spacingHorizontalS,
    height: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorStatusWarningForeground1,
  },
  body: { flex: 1, minHeight: 0, minWidth: 0, display: 'flex' },
  city: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  // 数字主信息：1×1/2×1/2×2 = XL-48；3×2/4×2 = Display 68（Hero1000）
  temp48: {
    ...displayXl(48),
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
  },
  temp68: {
    fontSize: tokens.fontSizeHero1000,
    lineHeight: tokens.lineHeightHero1000,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
  },

  // 1×1：图标 + 温度水平居中，padding 8，gap 8
  body1: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalS,
  },

  // 2×1：左图标+温度，右现象+高低温；删城市
  body2: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalM,
  },
  left2: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM, minWidth: 0 },
  right2: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
    flexShrink: 0,
  },

  // 2×2：上块 0–55%（当前），下块 55–100%（6 列逐时）
  body22: { flexDirection: 'column', gap: tokens.spacingVerticalS, minHeight: 0 },
  top22: {
    flexBasis: '55%',
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minHeight: 0,
    minWidth: 0,
  },
  top22Row: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
    flex: 1,
    minHeight: 0,
  },
  meta22: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    flex: 1,
  },
  hourly22: { flexBasis: '45%', flexGrow: 1, flexShrink: 1, minHeight: 0 },

  // 3×2：左 42% 当前 / 右 58% 7 天；列间距 16；padding 12v/16h
  body32: { flexDirection: 'row', gap: tokens.spacingHorizontalL, minHeight: 0 },
  current32: {
    flex: '42 1 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  currentRow: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM, minWidth: 0 },
  meta32: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS, minWidth: 0 },
  daily32: { flex: '58 1 0', minWidth: 0, minHeight: 0 },

  // 4×2：左 55% 当前 / 中 30% AQI / 底 96px 7 天通栏；padding 12v/16h
  body42: { flexDirection: 'column', gap: tokens.spacingVerticalS, minHeight: 0 },
  top42: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: tokens.spacingHorizontalL,
    minHeight: 0,
    minWidth: 0,
  },
  current42: {
    flexBasis: '55%',
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  aqi42: {
    flexBasis: '30%',
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    minHeight: 0,
  },
  daily42: { flex: '0 0 96px', minHeight: 0 },

  // 状态
  stateBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    textAlign: 'center',
    padding: tokens.spacingVerticalL,
    minHeight: 0,
  },
  stateText: { color: tokens.colorNeutralForeground2, maxWidth: '46ch' },
  stateButtons: { display: 'flex', gap: tokens.spacingHorizontalS, flexWrap: 'wrap', justifyContent: 'center' },
  keyIcon: { color: tokens.colorNeutralForeground3 },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground2,
  },
});

function LoadingState({ compact }) {
  const styles = useStyles();
  return (
    <div className={styles.stateBody}>
      <div className={styles.loading}>
        <Spinner size={compact ? 'tiny' : 'medium'} />
        {!compact && (
          <Text size={300} className={styles.stateText}>
            正在获取天气…
          </Text>
        )}
      </div>
    </div>
  );
}

function NoKeyState({ compact, onOpenSettings, onUseMock }) {
  const styles = useStyles();
  if (compact) {
    return (
      <div className={styles.stateBody}>
        <Key20Regular className={styles.keyIcon} />
        <Text size={300} className={styles.stateText}>
          配置 Key
        </Text>
      </div>
    );
  }
  return (
    <div className={styles.stateBody}>
      <Key20Regular className={styles.keyIcon} />
      <Text size={400} weight="semibold">
        未配置和风天气 API Key
      </Text>
      <Text size={300} className={styles.stateText}>
        在设置里填入 API Key 与数据地址后即可显示实时天气。没有 Key 时也可以先用内置演示数据预览。
      </Text>
      <span className={styles.stateButtons}>
        <Button
          appearance="primary"
          size="large"
          onClick={(event) => {
            event.stopPropagation();
            onOpenSettings();
          }}
        >
          去设置填 Key
        </Button>
        <Button
          appearance="secondary"
          size="large"
          onClick={(event) => {
            event.stopPropagation();
            onUseMock();
          }}
        >
          使用演示数据
        </Button>
      </span>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  const styles = useStyles();
  return (
    <div className={styles.stateBody}>
      <Text size={400} weight="semibold">
        天气数据加载失败
      </Text>
      <Text size={300} className={styles.stateText}>
        {error || '请检查网络、API Key 与数据地址。'}
      </Text>
      <Button
        appearance="primary"
        size="large"
        icon={<ArrowClockwise20Regular />}
        onClick={(event) => {
          event.stopPropagation();
          onRetry();
        }}
      >
        重试
      </Button>
    </div>
  );
}

export default function Card({
  sizeKey,
  scheme,
  settings,
  place,
  data,
  status,
  onOpenDetail,
  onOpenSettings,
  onRefresh,
  onUseMock,
}) {
  const styles = useStyles();
  const size = sizeKey || '3x2';
  const longPress = useRef({ timer: null, fired: false });

  const clearTimer = () => {
    if (longPress.current.timer) {
      clearTimeout(longPress.current.timer);
      longPress.current.timer = null;
    }
  };

  const openPrimary = useCallback(
    (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (status.noKey) onOpenSettings();
      else onOpenDetail();
    },
    [status.noKey, onOpenDetail, onOpenSettings],
  );

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    longPress.current.fired = false;
    clearTimer();
    longPress.current.timer = setTimeout(() => {
      longPress.current.fired = true;
      onOpenSettings();
    }, 500);
  };

  const handleClick = (event) => {
    clearTimer();
    if (longPress.current.fired) {
      longPress.current.fired = false;
      return;
    }
    openPrimary(event);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPrimary(event);
    } else if (event.key === 'F10' || (event.shiftKey && event.key === 'F10')) {
      event.preventDefault();
      event.stopPropagation();
      onOpenSettings();
    }
  };

  const warnings = settings.showWarnings ? data?.warnings : [];
  const current = data?.current;
  const today = data?.daily?.[0];
  const currentNight = current
    ? isNight(current.obsTime || new Date().toISOString(), today?.sunrise, today?.sunset)
    : false;
  const loading = status.loading && !data;
  const error = status.error && !data;
  const air = settings.showAir ? data?.air : null;
  const showOfflineDot = Boolean(status.offline && data);

  return (
    <div
      className={mergeClasses(
        styles.card,
        size === '1x1' && mergeClasses(styles.pad1, styles.gapXS),
        size === '2x1' && mergeClasses(styles.pad2, styles.gapXS),
        size === '2x2' && mergeClasses(styles.pad22, styles.gapS),
        (size === '3x2' || size === '4x2') && mergeClasses(styles.padLarge, styles.gapS),
      )}
      role="button"
      tabIndex={0}
      data-weather-card
      aria-label={`天气卡片${place ? `：${place.name}` : ''}${
        warnings?.length ? `，有 ${warnings.length} 条天气预警` : ''
      }，按回车打开详情，长按打开设置`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={clearTimer}
      onPointerLeave={clearTimer}
      onPointerCancel={clearTimer}
      onContextMenu={(event) => {
        event.preventDefault();
        onOpenSettings();
      }}
      onKeyDown={handleKeyDown}
    >
      {warnings && warnings.length > 0 && size !== '1x1' && <WarningStrip warnings={warnings} />}

      {status.noKey ? (
        <NoKeyState compact={size === '1x1'} onOpenSettings={onOpenSettings} onUseMock={onUseMock} />
      ) : loading ? (
        <LoadingState compact={size === '1x1'} />
      ) : error ? (
        <ErrorState error={status.error} onRetry={onRefresh} />
      ) : !data ? (
        <LoadingState compact={size === '1x1'} />
      ) : (
        <div className={styles.body}>
          {size === '1x1' && (
            <div className={mergeClasses(styles.body, styles.body1)}>
              <WeatherIcon
                code={current.icon}
                night={currentNight}
                scheme={scheme}
                size={44}
                title={current.text}
              />
              <span className={styles.temp48}>{fmtTemp(current.temp, settings.unit)}</span>
            </div>
          )}

          {size === '2x1' && (
            <div className={mergeClasses(styles.body, styles.body2)}>
              <div className={styles.left2}>
                <WeatherIcon
                  code={current.icon}
                  night={currentNight}
                  scheme={scheme}
                  size={48}
                  title={current.text}
                />
                <span className={styles.temp48}>{fmtTemp(current.temp, settings.unit)}</span>
              </div>
              <div className={styles.right2}>
                <Condition code={current.icon} text={current.text} />
                <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
              </div>
            </div>
          )}

          {size === '2x2' && (
            <div className={mergeClasses(styles.body, styles.body22)}>
              <div className={styles.top22}>
                <Text size={200} className={styles.city}>
                  {place?.name}
                </Text>
                <div className={styles.top22Row}>
                  <WeatherIcon
                    code={current.icon}
                    night={currentNight}
                    scheme={scheme}
                    size={56}
                    title={current.text}
                  />
                  <span className={styles.temp48}>{fmtTemp(current.temp, settings.unit)}</span>
                  <div className={styles.meta22}>
                    <Condition code={current.icon} text={current.text} />
                    <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
                  </div>
                </div>
              </div>
              <div className={styles.hourly22}>
                <HourlyStrip
                  items={data.hourly}
                  unit={settings.unit}
                  scheme={scheme}
                  sunrise={today?.sunrise}
                  sunset={today?.sunset}
                  count={6}
                />
              </div>
            </div>
          )}

          {size === '3x2' && (
            <div className={mergeClasses(styles.body, styles.body32)}>
              <div className={styles.current32}>
                <Text size={300} className={styles.city}>
                  {place?.name}
                </Text>
                <div className={styles.currentRow}>
                  <WeatherIcon
                    code={current.icon}
                    night={currentNight}
                    scheme={scheme}
                    size={64}
                    title={current.text}
                  />
                  <span className={styles.temp68}>{fmtTemp(current.temp, settings.unit)}</span>
                </div>
                <div className={styles.meta32}>
                  <Condition code={current.icon} text={current.text} />
                  <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={400} />
                </div>
              </div>
              <div className={styles.daily32}>
                <DailyColumns items={data.daily} unit={settings.unit} scheme={scheme} variant="panel" />
              </div>
            </div>
          )}

          {size === '4x2' && (
            <div className={mergeClasses(styles.body, styles.body42)}>
              <div className={styles.top42}>
                <div className={styles.current42}>
                  <Text size={300} className={styles.city}>
                    {place?.name}
                  </Text>
                  <div className={styles.currentRow}>
                    <WeatherIcon
                      code={current.icon}
                      night={currentNight}
                      scheme={scheme}
                      size={72}
                      title={current.text}
                    />
                    <span className={styles.temp68}>{fmtTemp(current.temp, settings.unit)}</span>
                  </div>
                  <div className={styles.meta32}>
                    <Condition code={current.icon} text={current.text} />
                    <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={400} />
                  </div>
                </div>
                {air && (
                  <div className={styles.aqi42}>
                    <AirRing air={air} size={88} />
                  </div>
                )}
              </div>
              <div className={styles.daily42}>
                <DailyColumns items={data.daily} unit={settings.unit} scheme={scheme} variant="row" />
              </div>
            </div>
          )}
        </div>
      )}

      {showOfflineDot && <span className={styles.offlineDot} title="离线数据" />}
    </div>
  );
}
