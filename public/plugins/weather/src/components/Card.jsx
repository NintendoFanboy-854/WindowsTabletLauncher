/** 天气卡片：五种尺寸 × 加载 / 无 Key / 错误 / 离线状态。 */

import { useCallback, useRef } from 'react';
import { Button, Spinner, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { ArrowClockwise20Regular, Key20Regular } from '@fluentui/react-icons';
import { CityMenu } from './CityMenu.jsx';
import { AirRing, DailyColumns, HourlyStrip, isNight } from './forecast.jsx';
import {
  Condition,
  DemoBadge,
  HiLo,
  StatusLine,
  WarningBadge,
  WarningStrip,
  WeatherIcon,
} from './atoms.jsx';
import { fmtHumidity, fmtTemp, fmtWind } from '../data/format.js';

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
  pad2: { padding: 'clamp(6px, 1.6vmin, 12px) clamp(8px, 2vmin, 16px) clamp(8px, 2vmin, 14px)' },
  pad22: { padding: 'clamp(6px, 1.6vmin, 12px) clamp(8px, 2vmin, 16px) clamp(6px, 1.6vmin, 12px)' },
  padLarge: { padding: 'clamp(8px, 1.8vmin, 14px) clamp(10px, 2.2vmin, 18px) clamp(8px, 1.8vmin, 14px)' },
  header: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, minWidth: 0 },
  headerSpacer: { flex: 1, minWidth: 0 },
  status: { fontSize: 'clamp(9px, 1.8vh, 12px)', flexShrink: 0, maxWidth: '52%' },
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
  temp1: { fontSize: 'clamp(18px, 16vmin, 52px)', lineHeight: 1, fontWeight: tokens.fontWeightSemibold, fontVariantNumeric: 'tabular-nums' },

  // 2×1
  body2: { flexDirection: 'row', alignItems: 'center', gap: 'clamp(6px, 2vmin, 16px)' },
  tempBlock: { display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, flex: 1, gap: '2px' },
  temp2: { fontSize: 'clamp(28px, 12.5vmin, 60px)' },
  metaBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '2px',
    minWidth: 0,
    flexShrink: 0,
  },

  // 2×2
  body22: { flexDirection: 'column', gap: 'clamp(2px, 1vh, 8px)' },
  currentRow: { display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.8vmin, 14px)', flexShrink: 0 },
  temp22: { fontSize: 'clamp(24px, 8.5vmin, 48px)' },
  conditions: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 },
  conditionText: { fontSize: 'clamp(11px, 2.4vh, 16px)' },
  subMeta: { fontSize: 'clamp(10px, 2.1vh, 14px)', color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  fill: { flex: 1, minHeight: 0, minWidth: 0 },

  // 3×2 / 4×2
  body32: { flexDirection: 'column', gap: 'clamp(2px, 1vh, 8px)' },
  heroGrow: { flex: 1 },
  currentHero: { display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2.4vmin, 18px)', flexShrink: 0, minWidth: 0 },
  tempHero: { fontSize: 'clamp(30px, 10vmin, 64px)' },
  heroMeta: { display: 'flex', flexDirection: 'column', gap: 'clamp(1px, 0.5vh, 3px)', minWidth: 0, flex: 1, alignItems: 'flex-start' },
  heroRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 'clamp(1px, 0.5vh, 3px)',
    flexShrink: 0,
    color: tokens.colorNeutralForeground2,
    fontSize: 'clamp(10px, 2.1vh, 14px)',
    whiteSpace: 'nowrap',
  },
  divider: { width: '1px', alignSelf: 'stretch', backgroundColor: tokens.colorNeutralStroke2, flexShrink: 0 },
  body42: { flexDirection: 'row', gap: 'clamp(8px, 2vmin, 18px)', alignItems: 'stretch' },
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
  stateTitle: { fontSize: 'clamp(12px, 2.6vh, 16px)', fontWeight: tokens.fontWeightSemibold },
  stateText: { fontSize: 'clamp(10px, 2.1vh, 13px)', color: tokens.colorNeutralForeground2, maxWidth: '46ch', lineHeight: 1.35 },
  stateButtons: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' },
  keyIcon: { color: tokens.colorNeutralForeground3 },
  tinyHint: { fontSize: 'clamp(10px, 2.2vh, 13px)', color: tokens.colorNeutralForeground2 },
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
const ICON_2 = 'clamp(36px, 26vmin, 96px)';
const ICON_22 = 'clamp(34px, 20vmin, 78px)';
const ICON_HERO = 'clamp(40px, 17vmin, 88px)';
const ICON_42 = 'clamp(34px, 13vmin, 72px)';

export default function Card({
  sizeKey,
  scheme,
  settings,
  place,
  data,
  status,
  now,
  locatedPlace,
  onOpenDetail,
  onOpenSettings,
  onSelectPlace,
  onManageCities,
  onRefresh,
  onUseMock,
  mock,
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
  const showHeader = size !== '1x1';
  const currentNight = current
    ? isNight(current.obsTime || new Date().toISOString(), today?.sunrise, today?.sunset)
    : false;
  const loading = status.loading && !data;
  const error = status.error && !data;
  const air = settings.showAir ? data?.air : null;

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
      {showHeader && (
        <div className={styles.header}>
          <CityMenu
            settings={settings}
            locatedPlace={locatedPlace}
            onSelectPlace={onSelectPlace}
            onManageCities={onManageCities}
            onOpenSettings={onOpenSettings}
            onRefresh={onRefresh}
            warningCount={warnings?.length || 0}
          />
          <span className={styles.headerSpacer} />
          {mock && <DemoBadge />}
          {data && !loading && (
            <StatusLine
              offline={status.offline}
              fetchedAt={data.fetchedAt}
              refreshMin={settings.refreshMin}
              now={now}
              className={styles.status}
            />
          )}
        </div>
      )}

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
              <WeatherIcon
                code={current.icon}
                night={currentNight}
                scheme={scheme}
                size={ICON_2}
                title={current.text}
              />
              <div className={styles.tempBlock}>
                <span className={mergeClasses(styles.temp1, styles.temp2)}>{fmtTemp(current.temp, settings.unit)}</span>
                <Condition code={current.icon} text={current.text} className={styles.conditionText} />
              </div>
              <div className={styles.metaBlock}>
                <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} className={styles.subMeta} />
                <span className={styles.subMeta}>{fmtWind(current.windDir, current.windScale)}</span>
              </div>
            </div>
          )}

          {size === '2x2' && (
            <div className={mergeClasses(styles.body, styles.body22)}>
              <div className={styles.currentRow}>
                <WeatherIcon
                  code={current.icon}
                  night={currentNight}
                  scheme={scheme}
                  size={ICON_22}
                  title={current.text}
                />
                <div className={styles.conditions}>
                  <span className={mergeClasses(styles.temp1, styles.temp22)}>{fmtTemp(current.temp, settings.unit)}</span>
                  <Condition code={current.icon} text={current.text} className={styles.conditionText} />
                </div>
                <div className={styles.metaBlock}>
                  <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} className={styles.subMeta} />
                  <span className={styles.subMeta}>{fmtHumidity(current.humidity)}</span>
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
              <div className={styles.currentHero}>
                <WeatherIcon
                  code={current.icon}
                  night={currentNight}
                  scheme={scheme}
                  size={ICON_HERO}
                  title={current.text}
                />
                <span className={mergeClasses(styles.temp1, styles.tempHero)}>{fmtTemp(current.temp, settings.unit)}</span>
                <div className={styles.heroMeta}>
                  <Condition code={current.icon} text={current.text} className={styles.conditionText} />
                  <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} className={styles.subMeta} />
                  <span className={styles.subMeta}>体感 {fmtTemp(current.feelsLike, settings.unit)}</span>
                </div>
                <div className={styles.heroRight}>
                  <span>{fmtWind(current.windDir, current.windScale)}</span>
                  <span>湿度 {fmtHumidity(current.humidity)}</span>
                </div>
              </div>
              <DailyColumns items={data.daily} unit={settings.unit} scheme={scheme} className={styles.fill} />
            </div>
          )}

          {size === '4x2' && (
            <div className={mergeClasses(styles.body, styles.body42)}>
              <div className={styles.col42Current}>
                <div className={styles.currentIconRow}>
                  <WeatherIcon
                    code={current.icon}
                    night={currentNight}
                    scheme={scheme}
                    size={ICON_42}
                    title={current.text}
                  />
                  <span className={mergeClasses(styles.temp1, styles.temp42)}>{fmtTemp(current.temp, settings.unit)}</span>
                </div>
                <Condition code={current.icon} text={current.text} className={styles.conditionText} />
                <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} className={styles.subMeta} />
                <span className={styles.subMeta}>体感 {fmtTemp(current.feelsLike, settings.unit)}</span>
                <span className={styles.subMeta}>
                  {fmtWind(current.windDir, current.windScale)} · 湿度 {fmtHumidity(current.humidity)}
                </span>
              </div>
              <div className={styles.divider} />
              <div className={styles.col42Daily}>
                <DailyColumns items={data.daily} unit={settings.unit} scheme={scheme} className={styles.dailyFull} showText />
              </div>
              {air && (
                <>
                  <div className={styles.divider} />
                  <div className={styles.col42Air}>
                    <AirRing air={air} size="clamp(70px, 24vmin, 140px)" />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {warnings && warnings.length > 0 && size === '1x1' && <WarningBadge warnings={warnings} />}
      {size === '1x1' && mock && (
        <span style={{ position: 'absolute', bottom: '4%', right: '6%' }}>
          <DemoBadge />
        </span>
      )}
    </div>
  );
}
