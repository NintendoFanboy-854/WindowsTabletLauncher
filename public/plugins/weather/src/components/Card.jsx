/**
 * 天气卡片（L0）：纯展示，点卡 = 打开 L1 详情。
 *
 * 逐档字段集合（`wtsl-density-clock-weather.md` §3.6，**换尺寸换字段，不换字号**）：
 * - 1×1：内容图标 24 + 温度 hero；identity 行只保留 24 高空行（不放身份图标——它会与内容
 *   天气图标重复，且 teal 晴天会在雨天说谎，§3.9 W-2 / §5-1）；
 * - 2×1：identity 行 + 城市 12 → 图标 32 + 温度 + 12 → 现象 16 · 高低温 14，**单轴左对齐**，
 *   不再用 space-between 制造 120–130px 中间空洞（§3.9 W-3 / §5-3）；
 * - 1×2：当前块（图标 24 + 温度 + 现象 14 · 高低温 14 单行）+ 逐时竖排 4 行；
 * - 2×2：当前块 + 今日指标 3 行（体感 / 降水概率 / 风）+ 逐时 4 列；
 * - 3×2：当前块（图标 48，现象 14 fg2）+ 今日指标 3 行 + 逐时 6 列（含降水概率）；
 * - 3×3：3×2 全部内容（指标块追加空气质量一行）+ 未来 7 天 7 列。
 *
 * 对齐：hero 温度左对齐到内容轴；图标垂直居中（layout.md:91「对象居中、文字左对齐」）；
 * 现象与高低温与温度同 baseline。
 *
 * ## 卡片内部列网格（自内容轴起算，两层，全部由容器宽度派生、不含字面量像素）
 *
 * 内容轴 = 卡片外框 22（宿主 6 + `CardRoot` 16，唯一常量 `CARD_CONTENT_INSET`）。
 * 设内容宽 W，列间距统一 `spacingHorizontalS` = 8：
 *
 * 1. **上层：上带两列** `5fr : 7fr` → 当前簇 `[0, 5(W−8)/12]`，
 *    指标块 `[5(W−8)/12 + 8, W]`（本文件 `topBand`）。
 * 2. **指标区两轨**（`todayMetrics.jsx`，指标块宽 M）：标签列 `[0, 0.4M]`、
 *    数值列 `[0.4M + 8, M]`，数值右缘贴 W。
 * 3. **横向列条**（`forecast.jsx`）：`repeat(N, minmax(0,1fr))` 铺满 `[0, W]`，
 *    列宽 `(W − (N−1)×8)/N`，N = 6（逐时）/ 4（2×2）/ 7（7 天）。
 *
 * 三条列线共同约束：标签左缘、数值右缘、逐时列两端——这就是「左右对齐」的可量化定义。
 * 3×2 上带两簇用 grid（`5fr 7fr`）而不是 `space-between`；指标块整块占满剩余宽度、
 * 右缘贴内容右缘。逐时/7 天列条两端同样贴内容轴。
 *
 * 空态（无 Key / 无城市 / 请求失败）：**水平左对齐、垂直居中**——与有内容态共用同一条内容轴，
 * 避免换卡时文字左边缘跳动，也避免「空的东西最亮」（§2.7 / §3.7）。
 * 等待分档：<1s 不显示任何指示；>1s 才出现 Spinner + 12 fg3「正在获取天气…」（wait-ux:38）。
 *
 * 卡片上没有城市菜单、刷新、设置、长按、右键：手势与主操作由共享 CardRoot 接管。
 */

import { useEffect, useState } from 'react';
import { Spinner, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import {
  Add20Regular,
  ChevronRight20Regular,
  Key24Regular,
  Location24Regular,
  Settings20Regular,
  WeatherCloudy24Regular,
  WeatherSunny20Regular,
} from '@fluentui/react-icons';
import { requestHostSettings } from '../../../_shared/host.js';
import {
  CardIdentity,
  CardRoot,
  EmptyState,
  HeroText,
  TouchButton,
} from '../../../_shared/ui.jsx';
import { Condition, HiLo, WarningBadge, WeatherIcon } from './atoms.jsx';
import { DailyColumns, HourlyBand, HourlyRows, HourlyStrip, isNight } from './forecast.jsx';
import { TodayMetrics } from './todayMetrics.jsx';
import { conditionText } from '../data/icons.js';
import { fmtTemp } from '../data/format.js';

/** 等待 <1s 不给指示（FLUENT2 §12 / wait-ux 阈值表）；超过 1s 才显示 Spinner。 */
const WAIT_INDICATOR_DELAY_MS = 1000;

const useStyles = makeStyles({
  // padding / gap 由 CardRoot 唯一决定（16 / 8），插件不按尺寸漂移
  /**
   * identity 行：图标 + 组件名在左轴，元信息（城市 / 预警 / 离线）贴行尾，chevron 在最右。
   *
   * 这里**不写 `justifyContent: 'space-between'`**（与时钟 3×2 同一颗雷）：行尾对齐由
   * `CardIdentity` trailing 的 `margin-inline-start: auto` 承担；一旦某个状态下 trailing
   * 变 null，space-between 会把标签顶到行尾，标题就跑到卡片右上角。
   */
  identityRow: {
    alignSelf: 'stretch',
    minWidth: 0,
  },
  /** 1×1：保留 24 高 identity 空行（跨卡基线），但不放身份图标与标签。 */
  identitySpacer: {
    flexShrink: 0,
    minHeight: tokens.spacingVerticalXXL,
  },
  /**
   * identity 图标盒的校验钩子（**不改变布局**）。
   *
   * 身份行本身由共享 `CardIdentity` 负责：行高 24（`spacingVerticalXXL`）、
   * `align-items:center`、图标盒宽度 = 图标档位 20、标题左缘 = 盒右缘 + `spacingHorizontalS`(8)。
   * 天气卡这一层不写任何 padding/margin，图标盒因此严格落在内容轴上。
   *
   * 这里只包一层 `data-weather-identity-icon` 的 inline-flex 盒子，让 lead 能用 CDP
   * 直接量到「图标盒左缘 vs 内容轴」与「盒中心 vs 24 行中心」，不必去猜 svg 的
   * 基线盒；盒宽仍由 20px 图标决定，盒子自身不贡献尺寸。
   */
  identityIconBox: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  },

  /** 内容块：多块卡片共用的纵向容器。 */
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minHeight: 0,
    minWidth: 0,
  },
  /** 单块卡片（1×1 / 2×1）：内容在剩余空间**垂直居中、水平左轴**。 */
  centerBlock: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: tokens.spacingHorizontalS,
    minHeight: 0,
    minWidth: 0,
  },
  /** 1×1 空带均分：identity 24 后主内容上下留白相等（补 8 抵消 CardRoot 组距） */
  centerBlockCompact: {
    paddingBlockEnd: tokens.spacingVerticalS,
  },
  /** 2×1 空带 ≤22%：内容下移 2，单块空带 34 → 33（22.4% → 21.7%） */
  centerBlockRow: {
    paddingBlockStart: tokens.spacingVerticalXXS,
  },

  /** 当前簇：图标与温度同排（图标垂直居中），现象 / 高低温在下方同 baseline。 */
  currentBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  /**
   * 图标与 hero 数字按「行盒顶对齐 + 各自居中」处理，不做基线对齐（R3 / S2）。
   * 旧写法 `alignItems:'baseline'` 让数字走行基线，同时 `heroIcon: alignSelf:'center'`
   * 又单独把 48 图标居中——同一行里有两套垂直基准。现在容器统一 `center`，
   * 图标盒在数字行盒（52）内居中，不再单独 `alignSelf`。
   */
  heroRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  heroIcon: {
    flexShrink: 0,
    display: 'inline-flex',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  /** 3×2 / 3×3 的现象文字用次级前景（fg2），高低温仍是 fg3。 */
  condition32: {
    color: tokens.colorNeutralForeground2,
  },

  /** 2×1：图标 → 温度（8）→ 12 → 现象 · 高低温；全部左起，右端留白。 */
  row21: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  cluster21: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },

  /**
   * 上带：当前簇按内容取宽，指标块占满剩余宽度（组间 8，禁止推到两端）。
   *
   * 上带两列是**天气卡内部列网格的第 1 层**（第 2 层见 `todayMetrics.jsx` /
   * `forecast.jsx`）：`5fr : 7fr`，列宽由内容轴宽度派生，不写死像素。因此指标块的
   * 左缘 = 内容轴左缘 + 5/12 ×（内容宽 − 8）——是一条**常量列线**，不随当天温度文本
   * 长短漂移（旧实现用 `max-content`，温度从「8°」变「-12°」时整块指标会左右跳）。
   *
   * `minmax(min-content, 5fr)` 的下限只兜极端情况：华氏三位数（`100°`，40px hero
   * 约 79 宽 + 32/48 图标）在第一列里放不下时，让第一列按内容撑开，宁可让指标块
   * 整体右移，也不让 hero 数字压到指标块的标签列上。
   */
  topBand: {
    display: 'grid',
    gridTemplateColumns: 'minmax(min-content, 5fr) minmax(0, 7fr)',
    columnGap: tokens.spacingHorizontalS,
    alignItems: 'flex-start',
    minHeight: 0,
    minWidth: 0,
  },
  metricsSlot: {
    minWidth: 0,
  },
  /** 逐时 / 7 天：占满剩余高度并把列块垂直居中（空带被拆到上下两半，单块不超过 22%）。 */
  stretchSlot: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    minHeight: 0,
    minWidth: 0,
  },
  /** 3×3 的逐时：高度由内容决定，剩余空间留给 7 天块。 */
  fixedSlot: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    minHeight: 0,
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

  /** 空态 / 等待态：水平左轴、垂直居中。 */
  stateBlock: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 0,
    minWidth: 0,
  },
  busyInline: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
  },
});

/** 1s 之后才把「正在加载」变成可见指示（wait-ux：<1s 不闪）。 */
function useDelayedVisible(active, delayMs = WAIT_INDICATOR_DELAY_MS) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!active) {
      setVisible(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [active, delayMs]);
  return visible;
}

/** identity 行尾：城市 + 至多一个状态标记（DENSITY §5-3：一行 ≤2 个同级元信息）。 */
function CityTrailing({ place, offline, warnings, showWarningBadge }) {
  const styles = useStyles();
  if (!place) return null;
  // 3×2 / 3×3 才给预警 Badge（§3.4）；预警与离线同时成立时预警优先，
  // 不把 3 个同级元信息塞进同一行（§3.9 W-5）。离线时的数据时效在详情里可读。
  const showBadge = showWarningBadge && warnings.length > 0;
  return (
    <>
      <Text size={200} className={styles.cityName} title={place.name}>
        {place.name}
      </Text>
      {showBadge ? <WarningBadge count={warnings.length} /> : null}
      {!showBadge && offline ? (
        <Text size={200} className={styles.offline}>
          离线
        </Text>
      ) : null}
    </>
  );
}

/** 当前天气：图标 + 温度 hero（图标垂直居中、温度左轴）。 */
function CurrentHero({ current, night, scheme, iconSize, unit }) {
  const styles = useStyles();
  return (
    <div className={styles.heroRow}>
      <span className={styles.heroIcon}>
        <WeatherIcon
          code={current.icon}
          night={night}
          scheme={scheme}
          size={iconSize}
          title={current.text}
        />
      </span>
      <HeroText data-weather-temp="true">{fmtTemp(current.temp, unit)}</HeroText>
    </div>
  );
}

/**
 * 空态：中性图标 + 一句标题 + 一个次操作，**不写说明句**（PLUGIN-CONTRACT §4.4.3）。
 *
 * 三种空态的语义各由一个动作按钮承担：未配置 Key → 齿轮「去设置」；无城市 → 加号
 * 「添加城市」；请求失败 → chevron「打开详情」（重试在详情里）。图标统一 24 中性单色。
 */
function CardEmptyState({ variant, size, onOpenDetail }) {
  const styles = useStyles();
  const shortCard = size === '1x1' || size === '2x1';
  const preset =
    variant === 'key'
      ? {
          icon: <Key24Regular />,
          title: '未配置 Key',
          action: (
            <TouchButton
              appearance="secondary"
              icon={<Settings20Regular />}
              onClick={() => requestHostSettings()}
            >
              去设置
            </TouchButton>
          ),
        }
      : variant === 'city'
        ? {
            icon: <Location24Regular />,
            title: '还没有城市',
            action: (
              <TouchButton
                appearance="secondary"
                icon={<Add20Regular />}
                onClick={onOpenDetail}
              >
                添加城市
              </TouchButton>
            ),
          }
        : {
            icon: <WeatherCloudy24Regular />,
            title: '天气不可用',
            action: (
              <TouchButton
                appearance="secondary"
                icon={<ChevronRight20Regular />}
                onClick={onOpenDetail}
              >
                打开详情
              </TouchButton>
            ),
          };
  return (
    <div className={styles.stateBlock}>
      <EmptyState
        align="start"
        compact={shortCard}
        icon={preset.icon}
        title={preset.title}
        action={preset.action}
      />
    </div>
  );
}

/** 等待态：>1s 才显示 Spinner + 动词进行时文案；<1s 什么都不显示。 */
function CardBusyState({ label = '正在获取天气…' }) {
  const styles = useStyles();
  const visible = useDelayedVisible(true);
  return (
    <div className={styles.stateBlock}>
      {visible ? (
        <div className={styles.busyInline}>
          <Spinner size="tiny" />
          <Text size={200}>{label}</Text>
        </div>
      ) : null}
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
  locating,
  onOpenDetail,
}) {
  const styles = useStyles();
  const size = sizeKey || '3x2';
  const compact = size === '1x1';
  const shortCard = compact || size === '2x1';

  const current = data?.current || null;
  const today = data?.daily?.[0] || null;
  const currentNight = current
    ? isNight(current.obsTime || new Date().toISOString(), today?.sunrise, today?.sunset)
    : false;
  const warnings = settings.showWarnings ? data?.warnings || [] : [];
  const air = settings.showAir ? data?.air : null;
  const offline = Boolean(status.offline && data);

  // 显式状态机（§3.9 W-10）：key → city/locating → loading → filled | error
  let state = 'filled';
  if (!settings.apiKey && !settings.mock) state = 'key';
  else if (!place) state = locating ? 'locating' : 'city';
  else if (!current) state = status.error ? 'error' : 'loading';

  const isEmpty = state === 'key' || state === 'city' || state === 'error';
  const isBusy = state === 'loading' || state === 'locating';
  // 短卡空态/等待态不再保留 identity 行：120 / 152 高里再挤 24 会裁到 CTA
  const showIdentity = !((isEmpty || isBusy) && shortCard);

  const cityTrailing = (
    <CityTrailing
      place={place}
      offline={offline}
      warnings={warnings}
      showWarningBadge={size === '3x2' || size === '3x3'}
    />
  );

  let content = null;
  if (isEmpty) {
    content = <CardEmptyState variant={state} size={size} onOpenDetail={onOpenDetail} />;
  } else if (isBusy) {
    content = <CardBusyState label={state === 'locating' ? '正在定位…' : '正在获取天气…'} />;
  } else if (size === '1x1') {
    content = (
      <div className={mergeClasses(styles.centerBlock, styles.centerBlockCompact)}>
        <WeatherIcon
          code={current.icon}
          night={currentNight}
          scheme={scheme}
          size={24}
          title={current.text}
        />
        <HeroText data-weather-temp="true">{fmtTemp(current.temp, settings.unit)}</HeroText>
      </div>
    );
  } else if (size === '2x1') {
    content = (
      <div className={mergeClasses(styles.centerBlock, styles.centerBlockRow)}>
        <div className={styles.row21}>
          <span className={styles.heroIcon}>
            <WeatherIcon
              code={current.icon}
              night={currentNight}
              scheme={scheme}
              size={32}
              title={current.text}
            />
          </span>
          <div className={styles.cluster21}>
            <HeroText data-weather-temp="true">{fmtTemp(current.temp, settings.unit)}</HeroText>
            <div className={styles.metaRow}>
              <Condition code={current.icon} text={current.text} size={400} />
              <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
            </div>
          </div>
        </div>
      </div>
    );
  } else if (size === '1x2') {
    content = (
      <div className={styles.body}>
        <div className={styles.currentBlock} data-content-block="current">
          <CurrentHero
            current={current}
            night={currentNight}
            scheme={scheme}
            iconSize={24}
            unit={settings.unit}
          />
          <div className={styles.metaRow}>
            <Condition code={current.icon} text={current.text} size={300} />
            <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
          </div>
        </div>
        <div className={styles.fixedSlot} data-content-band="hourly" data-secondary-block="hourly">
          <HourlyRows
            items={data.hourly}
            unit={settings.unit}
            scheme={scheme}
            sunrise={today?.sunrise}
            sunset={today?.sunset}
            count={4}
          />
        </div>
      </div>
    );
  } else if (size === '2x2') {
    content = (
      <div className={styles.body} data-weather-layout="2x2">
        <div className={styles.topBand} data-content-band="top" data-topband-columns="5fr-7fr">
          <div className={styles.currentBlock} data-content-block="current">
            <CurrentHero
              current={current}
              night={currentNight}
              scheme={scheme}
              iconSize={32}
              unit={settings.unit}
            />
            <div className={styles.metaRow}>
              <Condition code={current.icon} text={current.text} size={400} />
              <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
            </div>
          </div>
          <div className={styles.metricsSlot}>
            <TodayMetrics current={current} hourly={data.hourly} unit={settings.unit} />
          </div>
        </div>
        <div
          className={styles.stretchSlot}
          data-content-band="hourly"
          data-content-block="hourly"
          data-secondary-block="hourly"
        >
          <HourlyStrip
            items={data.hourly}
            unit={settings.unit}
            scheme={scheme}
            sunrise={today?.sunrise}
            sunset={today?.sunset}
            count={4}
          />
        </div>
      </div>
    );
  } else if (size === '3x2') {
    content = (
      <div className={styles.body} data-weather-layout="3x2">
        <div className={styles.topBand} data-content-band="top" data-topband-columns="5fr-7fr">
          <div className={styles.currentBlock} data-content-block="current">
            <CurrentHero
              current={current}
              night={currentNight}
              scheme={scheme}
              iconSize={48}
              unit={settings.unit}
            />
            <div className={styles.metaRow}>
              <Condition
                code={current.icon}
                text={current.text}
                size={300}
                className={styles.condition32}
              />
              <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
            </div>
          </div>
          <div className={styles.metricsSlot}>
            <TodayMetrics current={current} hourly={data.hourly} unit={settings.unit} />
          </div>
        </div>
        <div
          className={styles.stretchSlot}
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
    );
  } else {
    // 3×3：3×2 全部内容（指标块追加空气质量）+ 未来 7 天
    content = (
      <div className={styles.body} data-weather-layout="3x3">
        <div className={styles.topBand} data-content-band="top" data-topband-columns="5fr-7fr">
          <div className={styles.currentBlock} data-content-block="current">
            <CurrentHero
              current={current}
              night={currentNight}
              scheme={scheme}
              iconSize={48}
              unit={settings.unit}
            />
            <div className={styles.metaRow}>
              <Condition
                code={current.icon}
                text={current.text}
                size={300}
                className={styles.condition32}
              />
              <HiLo max={today?.tempMax} min={today?.tempMin} unit={settings.unit} size={300} />
            </div>
          </div>
          <div className={styles.metricsSlot}>
            <TodayMetrics current={current} hourly={data.hourly} unit={settings.unit} air={air} />
          </div>
        </div>
        <div
          className={styles.fixedSlot}
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
        <div
          className={styles.stretchSlot}
          data-content-band="daily"
          data-secondary-block="daily"
        >
          <DailyColumns items={data.daily} unit={settings.unit} scheme={scheme} />
        </div>
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
    <CardRoot ariaLabel={ariaLabel} onActivate={onOpenDetail} data-size={size}>
      {showIdentity ? (
        compact ? (
          <div className={styles.identitySpacer} data-card-identity="true" data-card-identity-empty="true" />
        ) : (
          <CardIdentity
            icon={
              <span className={styles.identityIconBox} data-weather-identity-icon="true">
                <WeatherSunny20Regular />
              </span>
            }
            label="天气"
            className={styles.identityRow}
            disclosure
            trailing={size === '1x2' ? null : cityTrailing}
          />
        )
      ) : null}
      {content}
    </CardRoot>
  );
}
