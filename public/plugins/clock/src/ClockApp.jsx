/**
 * 时钟卡片（L0）：纯展示，主体点击 / Enter / Space 打开宿主详情浮层。
 *
 * 规格来源：`wtsl-density-clock-weather.md` §2（逐档字段集合见 `sizes.js` 的 `SIZE_FIELDS`）。
 *
 * - hero 恒 `fontSizeHero900` / `lineHeightHero900`（40/52），六档一律不放大；
 * - 全局左对齐到内容轴：hero 不做居中（跨卡扫视时 6 个 hero 的左起点必须同轴）；
 * - 1×1：20px 身份图标 + `HH:MM`，时间块在剩余空间垂直居中；不渲染秒与日期；
 * - 2×1：+ 秒（16，fg3）+ 日期（14，identity 行尾）；秒与 hero 基线对齐；
 * - 3×2：+ 日期/星期（16）+ 世界时钟 3 行（城市 14 左 / 当地时间 24 右，行高 44）；
 * - 卡片上没有常驻按钮、没有加载态：时间是设备事实，秒在走本身就是"活着"的信号。
 *   唯一的空态是 3×2 档世界时钟未配置时：中性地球图标 +「没有世界时钟」（6 字）+
 *   「添加城市」（`Add20Regular`）——不写说明句，可添加由加号按钮承担，
 *   「点卡进详情」由 identity 行尾 chevron（`disclosure`）承担（PLUGIN-CONTRACT §4.4.3）。
 *
 * 长按 / 右键 / hover 由 CardRoot 内部的 useHostCardGesture 交给宿主；插件不写任何
 * 长按计时器、不提供设置入口、不在卡片上做 12/24h 切换（设置统一在宿主设置页）。
 */

import { useMemo } from 'react';
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { Add20Regular, Clock20Regular, Globe24Regular } from '@fluentui/react-icons';

import { requestOverlay, useAgentTools, useHostSize, useStoredConfig } from '../../_shared/host.js';
import { TABULAR_NUMS } from '../../_shared/typography.js';
import {
  ActionButton,
  CardIdentity,
  CardRoot,
  EmptyState,
  HeroText,
  ListRow,
  ListStack,
  useNow,
} from '../../_shared/ui.jsx';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  formatDate,
  formatTime,
  normalizeSettings,
} from './settings.js';
import { CLOCK_TOOLS, createClockToolHandlers } from './tools.js';
import { describeWorldPlace, useWorldClocks } from './world.js';
import { DEFAULT_SIZE_KEY, fieldsForSize, sizeKeyOf } from './sizes.js';

/**
 * 刷新频率跟随点：显示秒时一秒一拍，不显示秒时一分钟一拍。
 * 1×1 与 `showSeconds=false` 时每秒重渲染是零视觉收益（规格 §2.9 C-2）。
 */
const TICK_SECONDS_MS = 1000;
const TICK_MINUTES_MS = 60000;

const useStyles = makeStyles({
  root: {
    textAlign: 'left',
    userSelect: 'none',
    cursor: 'pointer',
  },
  /**
   * identity 行铺满内容宽度：图标与组件名在左轴成组，日期（2×1 的唯一 trailing）贴行尾。
   * 这里**不写 `justifyContent: 'space-between'`**：3×2 的 identity 行没有 trailing
   * （日期走 `date === 'block'`，在世界时钟上方），两个子元素被 space-between 撑成
   * 「图标最左 / 标签最右」，标题就跑到卡片右上角；行尾对齐由 `CardIdentity` 内部
   * trailing 的 `margin-inline-start: auto` 承担（ui.jsx CardIdentity › trailing），
   * 与待办卡（完全不传 className）同构。
   */
  identityRow: {
    alignSelf: 'stretch',
    minWidth: 0,
  },
  /** 单个数据块的剩余空间：**垂直居中、水平左轴**（1×1 / 2×1 的时间块）。 */
  centeredBlock: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 0,
    minWidth: 0,
  },
  /**
   * 1×1 空带均分（DENSITY §1.1-2）：identity 行固定 24 后，主内容上下留白相等。
   * 下方补 8（spacingVerticalS）抵消 CardRoot 组距 8，实测 22 / 22。
   */
  centeredBlockCompact: {
    paddingBlockEnd: tokens.spacingVerticalS,
  },
  /**
   * 2×1 空带 ≤22%：内容下移 2（spacingVerticalXXS）把底缘从 118 推到 119，
   * 单块空带 34 → 33（22.4% → 21.7%）。
   */
  centeredBlockRow: {
    paddingBlockStart: tokens.spacingVerticalXXS,
  },
  timeRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  seconds: {
    ...TABULAR_NUMS,
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground3,
  },
  meridiem: {
    color: tokens.colorNeutralForeground2,
  },
  /** 3×2 的日期 / 星期：hero 的注解，挂同一条左轴。 */
  dateLine: {
    color: tokens.colorNeutralForeground2,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  /** 世界时钟：城市左、当地时间右（定义列表两轴）。 */
  worldStack: {
    flexShrink: 0,
    minWidth: 0,
    /**
     * 3×2 内容带 ≥78%（DENSITY §2.1-10 的更严口径）：日期行与世界时钟之间补 4
     * （spacingVerticalXS），实测内容带 77.4% → 78.7%，行 pith 48 不变。
     */
    paddingBlockStart: tokens.spacingVerticalXS,
  },
  worldTime: {
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
  },
  worldMeridiem: {
    color: tokens.colorNeutralForeground3,
  },
  /** 世界时钟未配置时的提示：与内容共用左轴、在剩余空间垂直居中。 */
  emptyBlock: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 0,
    minWidth: 0,
  },
});

/** 世界时钟一行：城市 14（fg1）左 / 当地时间 24 semibold（tabular）右，行高由 ListRow 固定 44。 */
function WorldClockRow({ place, now, settings }) {
  const styles = useStyles();
  const entry = describeWorldPlace(place, now, settings);
  return (
    <ListRow
      data-clock-world="true"
      data-clock-world-place={place.id}
      title={entry.name}
      trailing={
        <>
          <Text size={600} weight="semibold" className={styles.worldTime}>
            {entry.localTime}
          </Text>
          {entry.meridiem ? (
            <Text size={200} className={styles.worldMeridiem}>
              {entry.meridiem}
            </Text>
          ) : null}
        </>
      }
    />
  );
}

export default function ClockApp() {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, DEFAULT_SIZE_KEY);
  const [settings, setSettings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const world = useWorldClocks();

  const fields = fieldsForSize(sizeKey);
  const showSeconds = Boolean(fields.seconds && settings.showSeconds);
  const now = useNow(showSeconds ? TICK_SECONDS_MS : TICK_MINUTES_MS);

  const dateNow = new Date(now);
  const time = formatTime(dateNow, settings);
  const date = formatDate(dateNow, settings);
  const worldPlaces = fields.worldClocks > 0 ? world.places.slice(0, fields.worldClocks) : [];

  const ariaLabel = useMemo(() => {
    const spoken = settings.hour12 ? `${time.main} ${time.meridiem}` : time.main;
    const seconds = showSeconds ? ` ${time.seconds} 秒` : '';
    const dateText = fields.date === 'none' ? '' : `，${date.inline}`;
    const worldText = worldPlaces.length > 0 ? `，${worldPlaces.length} 个世界时钟城市` : '';
    return `当前时间 ${spoken}${seconds}${dateText}${worldText}，点击打开时钟详情`;
  }, [
    date.inline,
    fields.date,
    settings.hour12,
    showSeconds,
    time.main,
    time.meridiem,
    time.seconds,
    worldPlaces.length,
  ]);

  // Agent 对等：卡片 iframe 常驻桌面，工具只在这里注册一次；UI 与工具共用同一数据层。
  useAgentTools(
    CLOCK_TOOLS,
    createClockToolHandlers({ settings, setSettings, world }),
  );

  /**
   * 时间块：hero + 可选秒 + 可选 AM/PM，三者同一 baseline（秒不许悬浮）。
   * 2×1 / 1×1 把它放进 `centeredBlock` 做垂直居中；3×2 直接跟在 identity 行下（顶部对齐）。
   * 1×1 与 2×1 的空带修正分别由 centeredBlockCompact / centeredBlockRow 承担。
   */
  const timeBlock = (
    <div className={styles.timeRow}>
      <HeroText data-clock-time="true">{time.main}</HeroText>
      {showSeconds ? (
        <Text
          data-clock-seconds="true"
          size={400}
          className={styles.seconds}
        >
          {time.seconds}
        </Text>
      ) : null}
      {settings.hour12 ? (
        <Text
          data-clock-meridiem="true"
          size={fields.identity === 'compact' ? 200 : 300}
          className={styles.meridiem}
        >
          {time.meridiem}
        </Text>
      ) : null}
    </div>
  );

  return (
    <CardRoot
      ariaLabel={ariaLabel}
      onActivate={() => requestOverlay('detail', '时钟详情')}
      className={styles.root}
      data-clock-root="true"
      data-clock-size={sizeKey}
    >
      <CardIdentity
        icon={<Clock20Regular />}
        label="时钟"
        compact={fields.identity === 'compact'}
        className={styles.identityRow}
        disclosure={fields.identity !== 'compact'}
        trailing={
          fields.date === 'trailing' ? (
            <Text size={300} data-clock-date="true">
              {date.date}
            </Text>
          ) : null
        }
      />
      {fields.worldClocks > 0 ? (
        timeBlock
      ) : (
        <div
          className={mergeClasses(
            styles.centeredBlock,
            sizeKey === '1x1' ? styles.centeredBlockCompact : styles.centeredBlockRow,
          )}
        >
          {timeBlock}
        </div>
      )}
      {fields.date === 'block' ? (
        <Text data-clock-date="true" data-clock-weekday="true" size={400} className={styles.dateLine}>
          {`${date.date} ${date.weekday}`}
        </Text>
      ) : null}
      {fields.worldClocks > 0 ? (
        worldPlaces.length > 0 ? (
          <ListStack className={styles.worldStack} data-clock-world-list="true">
            {worldPlaces.map((place) => (
              <WorldClockRow key={place.id} place={place} now={dateNow} settings={settings} />
            ))}
          </ListStack>
        ) : (
          <div className={styles.emptyBlock} data-clock-world-empty="true">
            <EmptyState
              align="start"
              icon={<Globe24Regular />}
              title="没有世界时钟"
              action={
                <ActionButton
                  appearance="secondary"
                  icon={<Add20Regular />}
                  onClick={(event) => {
                    event.stopPropagation();
                    requestOverlay('detail', '时钟详情');
                  }}
                >
                  添加城市
                </ActionButton>
              }
            />
          </div>
        )
      ) : null}
    </CardRoot>
  );
}
