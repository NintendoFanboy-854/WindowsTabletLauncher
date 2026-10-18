/**
 * 天气卡片：一眼看懂的五档尺寸。
 *
 * 信息密度规则（docs/DENSITY.md）：每张卡片只有一个 Primary（当前温度），
 * 正常模式不带任何 chrome（无刷新按钮/更新时间/齿轮），预警条只在有预警时出现。
 * 城市、现象、今日高低温是仅有的 Secondary；更细的信息全部进详情 Drawer。
 */

import { useCallback, useRef } from 'react';
import { Button, Spinner, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { ArrowClockwise20Regular, Key20Regular } from '@fluentui/react-icons';
import { AirRing, DailyColumns, HourlyStrip, isNight } from './forecast.jsx';
import {
  Condition,
  HiLo,
  WarningBadge,
  WarningStrip,
  WeatherIcon,
} from './atoms.jsx';
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
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
    userSelect: 'none',
    cursor: 'pointer',
    gap: 'clamp(2px, 1vh, 8px)',
    ':hover': { backgroundColor: tokens.colorNeutralBackground1Hover },
    ':active': { backgroundColor: tokens.colorNeutralBackground1Pressed },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: '-2px',
    },
  },
  pad1: { padding: '4px' },
  pad2: { padding: 'clamp(6px, 1.4vmin, 10px) clamp(8px, 2vmin, 16px) clamp(8px, 2vmin, 14px)' },
  pad22: { padding: 'clamp(6px, 1.6vmin, 12px) clamp(8px, 2vmin, 16px) clamp(6px, 1.6vmin, 12px)' },
  padLarge: { padding: 'clamp(7px, 1.6vmin, 12px) clamp(10px, 2.2vmin, 18px) clamp(8px, 1.8vmin, 14px)' },
  cityLine: {
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    color: tokens.colorNeutralForeground3,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 0,
    maxWidth: '100%',
  },
  offlineDot: {
    position: 'absolute',
    top: '9%',
    right: '9%',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: tokens.colorStatusWarningForeground1,
  },
  body: { flex: 1, minHeight: 0, minWidth: 0, display: 'flex' },

  // 1×1
  body1: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '2px',
    position: 'relative',
    paddingBottom: '2vh',
  },
  temp1: {
    fontSize: 'clamp(18px, 16vmin, 52px)',
    lineHeight: 1,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
  },

  // 2×1
  body2: { flexDirection: 'column', justifyContent: 'center', gap: 'clamp(1px, 0.6vh, 5px)' },
  row2: { display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vmin, 16px)', minWidth: 0 },
  temp2: { fontSize: 'clamp(28px, 12vmin, 56px)' },
  condition2: { fontSize: tokens.fontSizeBase300 },
  side2: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 'clamp(1px, 0.5vh, 3px)',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  subMeta: {
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },

  // 2×2
  body22: { flexDirection: 'column', gap: 'clamp(3px, 1.2vh, 10px)' },
  currentRow: { display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.8vmin, 14px)', flexShrink: 0 },
  temp22: { fontSize: 'clamp(24px, 8.5vmin, 48px)' },
  conditions: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 },
  conditionText: { fontSize: tokens.fontSizeBase300 },
  fill: { flex: 1, minHeight: 0, minWidth: 0 },

  // 3×2 / 4×2
  body32: { flexDirection: 'column', gap: 'clamp(3px, 1.2vh, 10px)' },
  currentHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(8px, 2.4vmin, 18px)',
    flexShrink: 0,
    minWidth: 0,
  },
  tempHero: { fontSize: 'clamp(30px, 10vmin, 64px)' },
  heroMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(1px, 0.5vh, 4px)',
    minWidth: 0,
    flex: 1,
    alignItems: 'flex-start',
  },
  body42: { flexDirection: 'column', gap: 'clamp(4px, 1.4vh, 12px)' },
  row42: { display: 'flex', gap: 'clamp(12px, 2.6vmin, 24px)', alignItems: 'stretch', minHeight: 0, flex: 1 },
  col42Current: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
    flex: '1.05 1 0',
    gap: 'clamp(2px, 0.8vh, 6px)',
  },
  currentIconRow: { display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.6vmin, 14px)' },
  temp42: { fontSize: 'clamp(24px, 7.8vmin, 52px)' },
  col42Daily: { flex: '1.7 1 0', minWidth: 0, display: 'flex', alignItems: 'stretch' },
  dailyFull: { height: '100%' },
  col42Air: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    width: 'clamp(70px, 20vmin, 140px)',
  },

  // 状态
  stateBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(4px, 1.4vh, 12px)',
    textAlign: 'center',
    padding: 'clamp(6px, 2vmin, 16px)',
    minHeight: 0,
  },
  stateTitle: { fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightSemibold },
  stateText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    maxWidth: '46ch',
    lineHeight: tokens.lineHeightBase200,
  },
  stateButtons: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' },
  keyIcon: { color: tokens.colorNeutralForeground3 },
  tinyHint: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: tokens.colorNeutralForeground2 },
});

function LoadingState({ compact }) {
  const styles = useStyles();
  return (
    <div className={styles.stateBody}>
      <div className={styles.loading}>
        <Spinner size={compact ? 'tiny' : 'medium'} />
        {!compact && <span className={styles.stateText}>正在获取天气…</span>}
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
        <span className={styles.tinyHint}>配置 Key</span>
      </div>
    );
  }
  return (
    <div className={styles.stateBody}>
      <Key20Regular className={styles.keyIcon} />
      <span className={styles.stateTitle}>未配置和风天气 API Key</span>
      <span className={styles.stateText}>
        在设置里填入 API Key 与 API Host 后即可显示实时天气。没有 Key 时也可以先用内置演示数据预览。
      </span>
      <span className={styles.stateButtons}>
        <Button
          appearance="primary"
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            onOpenSettings();
          }}
        >
          去设置填 Key
        </Button>
        <Button
          appearance="secondary"
          size="small"
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
      <span className={styles.stateTitle}>天气数据加载失败</span>
      <span className={styles.stateText}>{error || '请检查网络、API Key 与 API Host。'}</span>
      <Button
        appearance="primary"
        size="small"
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

const ICON_1 = 'min(46vmin, 52%)';
const ICON_2 = 'clamp(34px, 24vmin, 88px)';
const ICON_22 = 'clamp(32px, 19vmin, 74px)';
const ICON_HERO = 'clamp(38px, 16vmin, 84px)';
const ICON_42 = 'clamp(32px, 12.5vmin, 68px)';

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
        size === '1x1' && styles.pad1,
        size === '2x1' && styles.pad2,
        size === '2x2' && styles.pad22,
        (size === '3x2' || size === '4x2') && styles.padLarge,
      )}
      role="button"
      tabIndex={0}
      data-weather-card
      aria-label={`天气卡片${place ? `：${place.name}` : ''}，按回车打开详情，长按打开设置`}
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
                size={ICON_1}
                title={current.text}
              />
              <span className={styles.temp1}>{fmtTemp(current.temp, settings.unit)}</span>
            </div>
          )}

          {size === '2x1' && (
            <div className={mergeClasses(styles.body, styles.body2)}>
              <span className={styles.cityLine}>{place?.name}</span>
              <div className={styles.row2}>
                <WeatherIcon
                  code={current.icon}
                  night={currentNight}
                  scheme={scheme}
                  size={ICON_2}
                  title={current.text}
                />
                <span className={mergeClasses(styles.temp1, styles.temp2)}>
                  {fmtTemp(current.temp, settings.unit)}
                </span>
                <div className={styles.side2}>
                  <Condition code={current.icon} text={current.text} className={styles.condition2} />
                  <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} className={styles.subMeta} />
                </div>
              </div>
            </div>
          )}

          {size === '2x2' && (
            <div className={mergeClasses(styles.body, styles.body22)}>
              <span className={styles.cityLine}>{place?.name}</span>
              <div className={styles.currentRow}>
                <WeatherIcon
                  code={current.icon}
                  night={currentNight}
                  scheme={scheme}
                  size={ICON_22}
                  title={current.text}
                />
                <div className={styles.conditions}>
                  <span className={mergeClasses(styles.temp1, styles.temp22)}>
                    {fmtTemp(current.temp, settings.unit)}
                  </span>
                  <Condition code={current.icon} text={current.text} className={styles.conditionText} />
                </div>
                <div className={styles.side2}>
                  <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} className={styles.subMeta} />
                </div>
              </div>
              <div className={styles.fill}>
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
              <span className={styles.cityLine}>{place?.name}</span>
              <div className={styles.currentHero}>
                <WeatherIcon
                  code={current.icon}
                  night={currentNight}
                  scheme={scheme}
                  size={ICON_HERO}
                  title={current.text}
                />
                <span className={mergeClasses(styles.temp1, styles.tempHero)}>
                  {fmtTemp(current.temp, settings.unit)}
                </span>
                <div className={styles.heroMeta}>
                  <Condition code={current.icon} text={current.text} className={styles.conditionText} />
                  <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} className={styles.subMeta} />
                </div>
              </div>
              <DailyColumns items={data.daily} unit={settings.unit} scheme={scheme} className={styles.fill} showLow={false} />
            </div>
          )}

          {size === '4x2' && (
            <div className={mergeClasses(styles.body, styles.body42)}>
              <span className={styles.cityLine}>{place?.name}</span>
              <div className={styles.row42}>
                <div className={styles.col42Current}>
                  <div className={styles.currentIconRow}>
                    <WeatherIcon
                      code={current.icon}
                      night={currentNight}
                      scheme={scheme}
                      size={ICON_42}
                      title={current.text}
                    />
                    <span className={mergeClasses(styles.temp1, styles.temp42)}>
                      {fmtTemp(current.temp, settings.unit)}
                    </span>
                  </div>
                  <Condition code={current.icon} text={current.text} className={styles.conditionText} />
                  <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} className={styles.subMeta} />
                </div>
                <div className={styles.col42Daily}>
                  <DailyColumns
                    items={data.daily}
                    unit={settings.unit}
                    scheme={scheme}
                    className={styles.dailyFull}
                  />
                </div>
                {air && (
                  <div className={styles.col42Air}>
                    <AirRing air={air} size="clamp(64px, 22vmin, 132px)" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {warnings && warnings.length > 0 && size === '1x1' && <WarningBadge warnings={warnings} />}
      {showOfflineDot && <span className={styles.offlineDot} title="离线数据" />}
    </div>
  );
}
