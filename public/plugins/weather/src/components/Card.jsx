/**
 * 天气卡片（L0）：纯展示，点卡 = 打开 L1 详情。
 *
 * 五档尺寸（docs/components/weather.md）：
 * - 1×1 图标 + 温度 48；
 * - 2×1 图标 + 温度 48 + 现象 16 + 今日高低温 14；
 * - 2×2 上当前天气、下逐时 6 列（时间 12 / 图标 20 / 温度 14）；
 * - 3×2 三带式（v0.3.0）：上带当前簇（城市 12 / 图标 56 / 温度 68 / 现象 14 / 高低温 14）
 *   + 今日指标（体感 / 降水概率 / 风），组间 16；下带全宽逐时 6 列（时间 12 / 图标 24 /
 *   温度 16 / 降水概率 12）；AQI 与 7 天只在 4×2；
 * - 4×2 上当前 + 空气质量（AQI 环 72），下未来 7 天等宽 7 列。
 *
 * 卡片上没有城市菜单、刷新、设置、长按、右键：手势与主操作由共享 CardRoot 接管。
 */

import { Spinner, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { Key20Regular, Location20Regular } from '@fluentui/react-icons';
import { CardRoot, Metric } from '../../../_shared/ui.jsx';
import { Condition, HiLo, WarningBadge, WeatherIcon } from './atoms.jsx';
import { AirRing, DailyColumns, HourlyBand, HourlyStrip, isNight } from './forecast.jsx';
import { TodayMetrics } from './todayMetrics.jsx';
import { conditionText } from '../data/icons.js';
import { fmtTemp } from '../data/format.js';

const useStyles = makeStyles({
  // 内边距：1×1=8；2×1=8 纵 / 12 横；2×2=12；3×2 / 4×2=12 纵 / 16 横
  pad1: { padding: tokens.spacingHorizontalS },
  pad21: { padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}` },
  pad22: { padding: tokens.spacingVerticalM },
  padLarge: { padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}` },

  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
  },

  // 1×1：图标在上、温度在下，避免 −10° 这类宽值在 152px 卡里被裁切
  body1: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minHeight: 0,
    minWidth: 0,
  },

  // 2×1：左图标 + 温度，右现象 + 高低温
  body21: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    minHeight: 0,
    minWidth: 0,
  },
  left21: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  right21: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
    flexShrink: 0,
  },

  // 2×2：上 55% 当前天气、下逐时 6 列；组间距 8（DENSITY 2×2 映射）
  body22: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minHeight: 0,
    minWidth: 0,
  },
  top22: {
    flexBasis: '55%',
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minHeight: 0,
    minWidth: 0,
  },
  top22Row: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: 0,
    minWidth: 0,
  },
  meta22: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
    flexShrink: 1,
  },
  hourly22: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    paddingTop: tokens.spacingVerticalXS,
  },

  // 3×2（v0.3.0 三带式）：上带当前簇 + 今日指标（组间 16），下带全宽逐时 6 列（约 102 高）
  body32: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacingVerticalL,
    minHeight: 0,
    minWidth: 0,
  },
  top32: {
    display: 'grid',
    // 当前簇按内容取宽，今日指标占满剩余宽度：两簇之间只有固定 16 的组间距，
    // 不出现 space-between 推到两端造成的大块中间空洞。
    gridTemplateColumns: 'max-content minmax(0, 1fr)',
    columnGap: tokens.spacingHorizontalL,
    alignItems: 'center',
    minHeight: 0,
    minWidth: 0,
    // 1024（6 列网格）下 3×2 iframe 约 474px：组间距收窄
    '@media (max-width: 480px)': {
      columnGap: tokens.spacingHorizontalM,
    },
  },
  current32: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
    minHeight: 0,
  },
  current32Main: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  current32Meta: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  // 3×2 的现象文字用次级前景（fg2），高低温仍走 HiLo 的 fg3
  condition32: {
    color: tokens.colorNeutralForeground2,
  },
  metrics32: {
    // 占满 top32 的第二列（minmax(0, 1fr)），不再缩成右侧小岛
    minWidth: 0,
  },
  hourly32: {
    flex: '0 0 102px',
    minHeight: 0,
    minWidth: 0,
  },

  // 4×2：上当前 + AQI，下 7 天 96 高
  body42: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    minHeight: 0,
    minWidth: 0,
  },
  top42: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    minHeight: 0,
    minWidth: 0,
  },
  current42: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
    minHeight: 0,
  },
  current42Row: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  meta42: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  air42: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  daily42: {
    flex: '0 0 96px',
    minHeight: 0,
    minWidth: 0,
  },

  cityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  cityName: {
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  offline: {
    color: tokens.colorStatusWarningForeground1,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  // 状态（加载 / 空 / 无 Key / 错误）：居中、只用排版，不加卡片级按钮
  state: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    textAlign: 'center',
    minHeight: 0,
    minWidth: 0,
  },
  stateText: {
    color: tokens.colorNeutralForeground3,
    maxWidth: '30ch',
  },
  stateTitle: { color: tokens.colorNeutralForeground2 },
  stateIcon: { color: tokens.colorNeutralForeground3 },
  stateInline: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
  },
});

function KeyState({ compact }) {
  const styles = useStyles();
  return (
    <div className={styles.state}>
      <Key20Regular className={styles.stateIcon} />
      {compact ? (
        <Text size={200} className={styles.stateText}>
          配置 Key
        </Text>
      ) : (
        <>
          <Text size={400} weight="semibold" className={styles.stateTitle}>
            未配置和风天气 API Key
          </Text>
          <Text size={200} className={styles.stateText}>
            在设置 → 插件 → 天气里填写 API Key 与 API Host
          </Text>
        </>
      )}
    </div>
  );
}

function CityEmptyState({ compact, locating }) {
  const styles = useStyles();
  if (locating) {
    return (
      <div className={styles.state}>
        <div className={styles.stateInline}>
          <Spinner size="tiny" />
          <Text size={200}>正在定位…</Text>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.state}>
      <Location20Regular className={styles.stateIcon} />
      <Text size={compact ? 200 : 400} weight="semibold" className={styles.stateTitle}>
        {compact ? '添加城市' : '还没有城市'}
      </Text>
      {compact ? null : (
        <Text size={200} className={styles.stateText}>
          打开详情搜索并添加城市
        </Text>
      )}
    </div>
  );
}

function LoadingState({ compact }) {
  const styles = useStyles();
  return (
    <div className={styles.state}>
      <div className={styles.stateInline}>
        <Spinner size="tiny" />
        <Text size={200}>{compact ? '加载中' : '正在获取天气…'}</Text>
      </div>
    </div>
  );
}

function ErrorState({ compact }) {
  const styles = useStyles();
  return (
    <div className={styles.state}>
      <Text size={compact ? 200 : 400} weight="semibold" className={styles.stateTitle}>
        {compact ? '暂无数据' : '天气数据暂不可用'}
      </Text>
      {compact ? null : (
        <Text size={200} className={styles.stateText}>
          打开详情可重试；已缓存的数据会继续显示
        </Text>
      )}
    </div>
  );
}

export default function Card({ sizeKey, scheme, settings, place, data, status, locating, onOpenDetail }) {
  const styles = useStyles();
  const size = sizeKey || '3x2';
  const compact = size === '1x1';
  const large = size === '3x2' || size === '4x2';
  const current = data?.current || null;
  const today = data?.daily?.[0] || null;
  const currentNight = current
    ? isNight(current.obsTime || new Date().toISOString(), today?.sunrise, today?.sunset)
    : false;
  const warnings = settings.showWarnings ? data?.warnings || [] : [];
  const air = settings.showAir ? data?.air : null;
  const offline = Boolean(status.offline && data);

  let content = null;
  if (!settings.apiKey && !settings.mock) {
    content = <KeyState compact={compact} />;
  } else if (!place) {
    content = <CityEmptyState compact={compact} locating={locating} />;
  } else if (!current) {
    content =
      status.loading || !status.error ? <LoadingState compact={compact} /> : <ErrorState compact={compact} />;
  } else {
    content = (
      <div className={mergeClasses(styles.body)}>
        {size === '1x1' ? (
          <div className={styles.body1}>
            <WeatherIcon code={current.icon} night={currentNight} scheme={scheme} size={40} title={current.text} />
            <Metric value={fmtTemp(current.temp, settings.unit)} size={48} />
          </div>
        ) : null}

        {size === '2x1' ? (
          <div className={styles.body21}>
            <div className={styles.left21}>
              <WeatherIcon code={current.icon} night={currentNight} scheme={scheme} size={48} title={current.text} />
              <Metric value={fmtTemp(current.temp, settings.unit)} size={48} />
            </div>
            <div className={styles.right21}>
              <Condition code={current.icon} text={current.text} />
              <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
            </div>
          </div>
        ) : null}

        {size === '2x2' ? (
          <div className={styles.body22}>
            <div className={styles.top22}>
              <Text size={200} className={styles.cityName}>
                {place.name}
              </Text>
              <div className={styles.top22Row}>
                <WeatherIcon code={current.icon} night={currentNight} scheme={scheme} size={48} title={current.text} />
                <Metric value={fmtTemp(current.temp, settings.unit)} size={48} />
                <div className={styles.meta22}>
                  <Condition code={current.icon} text={current.text} />
                  <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
                </div>
              </div>
            </div>
            <div className={styles.hourly22} data-secondary-block="hourly">
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
        ) : null}

        {size === '3x2' ? (
          <div className={styles.body32} data-weather-layout="3x2">
            <div className={styles.top32} data-content-band="top">
              <div className={styles.current32} data-content-block="current">
                <div className={styles.cityRow}>
                  <Text size={200} className={styles.cityName}>
                    {place.name}
                  </Text>
                  <WarningBadge count={warnings.length} />
                  {offline ? (
                    <Text size={200} className={styles.offline}>
                      离线
                    </Text>
                  ) : null}
                </div>
                <div className={styles.current32Main}>
                  <WeatherIcon
                    code={current.icon}
                    night={currentNight}
                    scheme={scheme}
                    size={56}
                    title={current.text}
                  />
                  <Metric value={fmtTemp(current.temp, settings.unit)} size={68} />
                </div>
                <div className={styles.current32Meta}>
                  <Condition code={current.icon} text={current.text} size={300} className={styles.condition32} />
                  <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
                </div>
              </div>
              <div className={styles.metrics32}>
                <TodayMetrics current={current} hourly={data.hourly} unit={settings.unit} />
              </div>
            </div>
            <div
              className={styles.hourly32}
              data-content-band="hourly"
              data-content-block="hourly"
              data-secondary-block="hourly"
            >
              <HourlyBand
                items={data.hourly}
                unit={settings.unit}
                scheme={scheme}
                sunrise={today?.sunrise}
                sunset={today?.sunset}
                count={6}
              />
            </div>
          </div>
        ) : null}

        {size === '4x2' ? (
          <div className={styles.body42}>
            <div className={styles.top42}>
              <div className={styles.current42}>
                <div className={styles.cityRow}>
                  <Text size={200} className={styles.cityName}>
                    {place.name}
                  </Text>
                  <WarningBadge count={warnings.length} />
                  {offline ? (
                    <Text size={200} className={styles.offline}>
                      离线
                    </Text>
                  ) : null}
                </div>
                <div className={styles.current42Row}>
                  <WeatherIcon code={current.icon} night={currentNight} scheme={scheme} size={56} title={current.text} />
                  <Metric value={fmtTemp(current.temp, settings.unit)} size={68} />
                </div>
                <div className={styles.meta42}>
                  <Condition code={current.icon} text={current.text} size={300} />
                  <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
                </div>
              </div>
              {air && air.aqi != null ? (
                <div className={styles.air42}>
                  <AirRing air={air} size={72} />
                </div>
              ) : null}
            </div>
            <div className={styles.daily42}>
              <DailyColumns items={data.daily} unit={settings.unit} scheme={scheme} />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  const ariaLabel = !settings.apiKey && !settings.mock
    ? '天气：尚未配置和风天气 API Key，点击打开详情'
    : !place
      ? `天气：还没有城市${locating ? '，正在定位' : ''}，点击打开详情`
      : current
        ? `天气：${place.name}，${fmtTemp(current.temp, settings.unit)}，${conditionText(
            current.icon,
            current.text,
          )}${warnings.length > 0 ? `，${warnings.length} 条天气预警` : ''}，点击打开详情`
        : '天气：正在加载，点击打开详情';

  return (
    <CardRoot
      ariaLabel={ariaLabel}
      onActivate={onOpenDetail}
      data-size={size}
      className={mergeClasses(
        compact && styles.pad1,
        size === '2x1' && styles.pad21,
        size === '2x2' && styles.pad22,
        large && styles.padLarge,
      )}
    >
      {content}
    </CardRoot>
  );
}
