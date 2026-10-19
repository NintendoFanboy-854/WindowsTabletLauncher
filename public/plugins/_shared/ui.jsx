/**
 * 插件共享 UI 基元（React + Fluent UI React v9）。
 *
 * 六个插件的卡片、L1 详情、L2 子页都从这里拼，不各画一套；具体业务布局仍由插件写。
 * 这层只做：外壳/骨架/触控尺寸/无障碍行为，颜色与字号全部走 Fluent token。
 *
 * 常用入口：
 *   <CardRoot onActivate={...} ariaLabel="...">卡片内容</CardRoot>
 *   <CardHeader title="今日 · 3" trailing={<Badge .../>} />
 *   <Metric value="42" unit="分钟" label="连续久坐" size={68} />
 *   <ListRow leading={<Checkbox ... />} title="任务标题" subtitle="今天 18:00" />
 *   <EmptyState title="还没有内容" description="从详情里添加" action={<ActionButton>添加</ActionButton>} />
 *   <DetailPage><DetailHeader trailing={...}>...</DetailHeader><DetailScroll>...</DetailScroll></DetailPage>
 *   <Subpage title="编辑任务" onClosed={...}>...</Subpage>
 *
 * 注意：不要用本文件的组件再画设置表单；设置统一走 manifest.settings + 宿主设置页。
 */

import {
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Badge,
  Button,
  Tab,
  TabList,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import { useHostCardGesture } from './host.js';
import { SlidePage } from './motion.js';
import { DISPLAY_WEIGHT, TABULAR_NUMS, displayXl } from './typography.js';

/** 平板触控目标（DESIGN §1.2 / AUDIT V-06）：所有可点击元素不小于 40×40 */
const TOUCH_TARGET = 40;
/** 列表行高（DENSITY §2.1：≥44，同时满足触控 40） */
const LIST_ROW_HEIGHT = 44;
/** L1 固定骨架高度（PLUGIN-CONTRACT §4.1） */
const DETAIL_HEADER_HEIGHT = 56;
const DETAIL_TOOLBAR_HEIGHT = 48;
const DETAIL_TABS_HEIGHT = 40;
/** L2 header 高度（PLUGIN-CONTRACT §4.1：56） */
const SUBPAGE_HEADER_HEIGHT = 56;

const TOUCH_TARGET_STYLE = { minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET };

/** 卡片根节点内不触发主操作的显式控件（与 host.js 的卡片手势过滤保持一致） */
const CARD_CONTROL_SELECTOR = [
  'button',
  'input',
  'textarea',
  'select',
  'a',
  '[role="button"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="slider"]',
  '[contenteditable]',
].join(',');

function isCardControlTarget(root, target) {
  if (!(target instanceof Element)) return false;
  const control = target.closest(CARD_CONTROL_SELECTOR);
  return Boolean(control && control !== root && root.contains(control));
}

/* ------------------------------------------------------------------ */
/* CardRoot                                                            */
/* ------------------------------------------------------------------ */

const useCardRootStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
  },
});

/**
 * 卡片视图根容器：挂载 SDK 卡片手势、主操作与键盘可达性。
 *
 * 用法：
 *   <CardRoot onActivate={() => requestOverlay('detail', '时钟详情')} ariaLabel="当前时间 14:05，打开详情">
 *     ...
 *   </CardRoot>
 *
 * - `ref` 由 `useHostCardGesture()` 提供，不要再自己建一个根 ref；
 * - 内部 `button/input/[role=button]` 等控件点击不会触发 `onActivate`，控件自己处理；
 * - 卡片主体点击 / 根节点聚焦后 Enter、Space 触发 `onActivate`；
 * - className/style 用于插件自己的 padding/gap 布局。
 *
 * @param {object} props
 * @param {(event: Event) => void} [props.onActivate] 卡片主体主操作
 * @param {string} props.ariaLabel 读屏描述（内容 + 操作）
 * @param {string} [props.className]
 * @param {object} [props.style]
 * @param {React.ReactNode} props.children
 */
export function CardRoot({ onActivate, ariaLabel, className, style, children, ...rest }) {
  const styles = useCardRootStyles();
  const gesture = useHostCardGesture();

  const handleClick = useCallback(
    (event) => {
      if (isCardControlTarget(event.currentTarget, event.target)) return;
      onActivate?.(event);
    },
    [onActivate],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (isCardControlTarget(event.currentTarget, event.target)) return;
      // Space 默认会滚动页面；卡片主操作要自己接管
      event.preventDefault();
      onActivate?.(event);
    },
    [onActivate],
  );

  return (
    <div
      {...rest}
      ref={gesture.ref}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={mergeClasses(styles.root, className)}
      style={style}
      data-card-root="true"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CardHeader                                                          */
/* ------------------------------------------------------------------ */

const useCardHeaderStyles = makeStyles({
  header: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    minHeight: tokens.lineHeightBase200,
    color: tokens.colorNeutralForeground3,
  },
  title: {
    minWidth: 0,
    color: tokens.colorNeutralForeground3,
  },
  trailing: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
});

/**
 * 卡片顶部小标题行（12 / 16，fg3），普通流式，占 16px 内容高度，不占卡高预算之外的 chrome。
 * DENSITY 的“今日 · N”“共 N 条”这类计数/分组标题放这里；不要放设置/齿轮。
 *
 * @param {object} props
 * @param {React.ReactNode} [props.title]
 * @param {React.ReactNode} [props.trailing] 行尾辅助信息（Badge / 计数）
 */
export function CardHeader({ title, trailing, className, style }) {
  const styles = useCardHeaderStyles();
  return (
    <div className={mergeClasses(styles.header, className)} style={style}>
      {typeof title === 'string' || typeof title === 'number' ? (
        <Text size={200} weight="semibold" truncate wrap={false} className={styles.title}>
          {title}
        </Text>
      ) : (
        title
      )}
      {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Metric                                                              */
/* ------------------------------------------------------------------ */

const useMetricStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  value: {
    ...TABULAR_NUMS,
    fontWeight: DISPLAY_WEIGHT,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
  },
  size48: displayXl(48),
  // 68px 是 Fluent 官方 Display（Hero1000）；项目 Display XL 只有 48/80/96/112（D-07）
  size68: {
    fontSize: tokens.fontSizeHero1000,
    lineHeight: tokens.lineHeightHero1000,
  },
  size80: displayXl(80),
  size96: displayXl(96),
  size112: displayXl(112),
  unit: {
    color: tokens.colorNeutralForeground2,
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  label: {
    color: tokens.colorNeutralForeground2,
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
});

const METRIC_SIZE_CLASS = {
  48: 'size48',
  68: 'size68',
  80: 'size80',
  96: 'size96',
  112: 'size112',
};

/**
 * 数字主信息：值 + 可选单位/标签/说明。
 *
 * 字号只允许 48 / 68 / 80 / 96 / 112：
 * - 48/80/96/112 来自项目 Display XL（`_shared/typography.js`，D-07，只给数字主信息）；
 * - 68 来自 Fluent 官方 Display（fontSizeHero1000 = 68/92）。
 * 文本/标签不得用这些字号，标签用 Fluent Text Base200/300。
 *
 * 用法：
 *   <Metric value="25:00" unit="分钟" label="专注剩余" caption="第 2 轮" size={68} />
 *
 * @param {object} props
 * @param {string|number} props.value
 * @param {string} [props.unit]
 * @param {string} [props.label]
 * @param {string} [props.caption]
 * @param {48|68|80|96|112} [props.size=48]
 */
export function Metric({ value, unit, label, caption, size = 48, className, style }) {
  const styles = useMetricStyles();
  const sizeClass = styles[METRIC_SIZE_CLASS[size] ?? 'size48'];
  return (
    <div className={mergeClasses(styles.root, className)} style={style}>
      <div className={styles.valueRow}>
        <span className={mergeClasses(styles.value, sizeClass)}>{value}</span>
        {unit ? (
          <Text size={300} className={styles.unit}>
            {unit}
          </Text>
        ) : null}
      </div>
      {label || caption ? (
        <div className={styles.meta}>
          {label ? (
            <Text size={300} className={styles.label}>
              {label}
            </Text>
          ) : null}
          {caption ? (
            <Text size={200} className={styles.caption}>
              {caption}
            </Text>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ListRow                                                             */
/* ------------------------------------------------------------------ */

const useListRowStyles = makeStyles({
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    width: '100%',
    minHeight: `${LIST_ROW_HEIGHT}px`,
    boxSizing: 'border-box',
    paddingInline: 0,
    border: 'none',
    background: 'transparent',
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
    textAlign: 'left',
    borderRadius: tokens.borderRadiusMedium,
  },
  interactive: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    ':active': {
      backgroundColor: tokens.colorNeutralBackground1Pressed,
    },
  },
  selected: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
  leading: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  title: {
    minWidth: 0,
    color: tokens.colorNeutralForeground1,
  },
  subtitle: {
    minWidth: 0,
    color: tokens.colorNeutralForeground3,
  },
  trailing: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
});

/**
 * 列表行：44 高，leading / title / subtitle / trailing 四段，可选点击与选中态。
 *
 * 用法：
 *   <ListRow leading={<Checkbox ... />} title="写周报" subtitle="今天 18:00" />
 *   <ListRow title="北京" subtitle="Asia/Shanghai" onClick={...} selected />
 *
 * 无 `onClick` 时是纯展示行：点击会冒泡到 CardRoot，打开详情；
 * 有 `onClick` 时行本身是 `role="button"`，不会触发卡片主操作。
 * 内部控件（Checkbox / Button）自己 stopPropagation 或由 CardRoot 过滤。
 *
 * @param {object} props
 * @param {React.ReactNode} [props.leading]
 * @param {React.ReactNode} [props.title]
 * @param {React.ReactNode} [props.subtitle]
 * @param {React.ReactNode} [props.trailing]
 * @param {(event: Event) => void} [props.onClick]
 * @param {boolean} [props.selected]
 * @param {300|400} [props.titleSize=300] 行标题字号：14（300）/ 16（400）
 */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  selected = false,
  titleSize = 300,
  className,
  style,
  ...rest
}) {
  const styles = useListRowStyles();

  const handleKeyDown = (event) => {
    if (!onClick) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    onClick(event);
  };

  return (
    <div
      {...rest}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-current={selected ? 'true' : undefined}
      aria-pressed={onClick ? Boolean(selected) : undefined}
      className={mergeClasses(
        styles.row,
        onClick && styles.interactive,
        selected && styles.selected,
        className,
      )}
      style={style}
      data-list-row="true"
      data-selected={selected ? 'true' : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {leading ? <div className={styles.leading}>{leading}</div> : null}
      <div className={styles.main}>
        {title ? (
          <Text size={titleSize} truncate wrap={false} className={styles.title}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text size={200} truncate wrap={false} className={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </div>
      {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EmptyState                                                          */
/* ------------------------------------------------------------------ */

const useEmptyStateStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
  },
  icon: {
    display: 'inline-flex',
    color: tokens.colorNeutralForeground3,
  },
  title: {
    color: tokens.colorNeutralForeground1,
  },
  description: {
    maxWidth: '42ch',
    color: tokens.colorNeutralForeground3,
  },
  action: {
    marginTop: tokens.spacingVerticalS,
  },
});

/**
 * 空态：图标 + 标题 + 说明 + 一个主操作（DENSITY / FLUENT2 §13）。
 * 说明控制在两行内，主操作只给一个。
 *
 * 用法：
 *   <EmptyState
 *     icon={<CalendarLtr24Regular />}
 *     title="还没有倒数日"
 *     description="添加一个重要的日子，卡片会显示剩余天数"
 *     action={<ActionButton appearance="primary">添加倒数日</ActionButton>}
 *   />
 *
 * @param {object} props
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} [props.title]
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} [props.action]
 */
export function EmptyState({ icon, title, description, action, className, style }) {
  const styles = useEmptyStateStyles();
  return (
    <div className={mergeClasses(styles.root, className)} style={style} data-empty-state="true">
      {icon ? <div className={styles.icon}>{icon}</div> : null}
      {title ? (
        <Text size={400} weight="semibold" className={styles.title}>
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text size={300} className={styles.description}>
          {description}
        </Text>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 触控按钮                                                            */
/* ------------------------------------------------------------------ */

const useTouchButtonStyles = makeStyles({
  button: {
    minWidth: `${TOUCH_TARGET}px`,
    minHeight: `${TOUCH_TARGET}px`,
  },
});

/**
 * 统一 40px 触控目标的 Fluent Button。高频快捷操作（开始/暂停、我起来了、添加…）用它。
 * 其他 Fluent Button 属性原样透传；仍由 Fluent 处理 hover/pressed/focus/disabled。
 *
 * 用法：
 *   <TouchButton appearance="primary" icon={<Play20Regular />} onClick={start}>开始</TouchButton>
 *
 * @param {object} props Fluent Button props
 */
export const TouchButton = forwardRef(function TouchButton(
  { appearance = 'secondary', className, style, children, ...rest },
  ref,
) {
  const styles = useTouchButtonStyles();
  return (
    <Button
      {...rest}
      ref={ref}
      type="button"
      appearance={appearance}
      size="large"
      className={mergeClasses(styles.button, className)}
      style={style}
    >
      {children}
    </Button>
  );
});

/** 同 TouchButton；命名用于“卡片快捷操作”语义。 */
export const ActionButton = TouchButton;

/* ------------------------------------------------------------------ */
/* L1 详情骨架                                                          */
/* ------------------------------------------------------------------ */

const useDetailPageStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
    // 宿主 DialogSurface 已是 colorNeutralBackground1，L1 保持透明才能透出宿主表面；
    // L2 Subpage 才用不透明底色覆盖 L1。
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
  },
});

/**
 * L1 详情页根容器：flex column、100% 高、透明背景（宿主 DialogSurface 提供表面）。
 * 子节点按固定顺序：DetailHeader / DetailToolbar / DetailTabs / DetailScroll / footer / Subpage。
 *
 * 用法：
 *   <DetailPage>
 *     <DetailHeader trailing={<ActionButton>刷新</ActionButton>}>...</DetailHeader>
 *     <DetailScroll>...</DetailScroll>
 *   </DetailPage>
 */
export function DetailPage({ children, className, style }) {
  const styles = useDetailPageStyles();
  return (
    <div className={mergeClasses(styles.root, className)} style={style} data-detail-page="true">
      {children}
    </div>
  );
}

const useDetailHeaderStyles = makeStyles({
  header: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    minHeight: `${DETAIL_HEADER_HEIGHT}px`,
    paddingInline: tokens.spacingHorizontalXXL,
    boxSizing: 'border-box',
  },
  leading: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  trailing: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
});

/**
 * L1 header（56）：左侧内容 + 右侧页面动作。L1 不放返回箭头/关闭按钮（宿主 Dialog 提供）。
 *
 * 用法：
 *   <DetailHeader trailing={<ActionButton>添加城市</ActionButton>}>
 *     <Text size={400} weight="semibold">世界时钟</Text>
 *   </DetailHeader>
 *
 * @param {object} props
 * @param {React.ReactNode} [props.children] 左侧内容
 * @param {React.ReactNode} [props.trailing] 右侧页面动作
 */
export function DetailHeader({ children, trailing, className, style }) {
  const styles = useDetailHeaderStyles();
  return (
    <div className={mergeClasses(styles.header, className)} style={style} data-detail-header="true">
      <div className={styles.leading}>{children}</div>
      {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
    </div>
  );
}

const useDetailToolbarStyles = makeStyles({
  toolbar: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: `${DETAIL_TOOLBAR_HEIGHT}px`,
    paddingInline: tokens.spacingHorizontalXXL,
    boxSizing: 'border-box',
  },
});

/**
 * 可选工具栏（48）：操作条 / 筛选 / 搜索。没有操作时不要占位。
 *
 * 用法：
 *   <DetailToolbar><ActionButton>开始</ActionButton><ActionButton>重置</ActionButton></DetailToolbar>
 */
export function DetailToolbar({ children, className, style }) {
  const styles = useDetailToolbarStyles();
  return (
    <div className={mergeClasses(styles.toolbar, className)} style={style} data-detail-toolbar="true">
      {children}
    </div>
  );
}

const useDetailTabsStyles = makeStyles({
  tabs: {
    flexShrink: 0,
    height: `${DETAIL_TABS_HEIGHT}px`,
    minHeight: `${DETAIL_TABS_HEIGHT}px`,
    paddingInline: tokens.spacingHorizontalXXL,
    boxSizing: 'border-box',
    overflowX: 'auto',
  },
  tab: {
    height: `${DETAIL_TABS_HEIGHT}px`,
    minHeight: `${DETAIL_TABS_HEIGHT}px`,
    paddingBlock: 0,
  },
  badge: {
    marginInlineStart: tokens.spacingHorizontalXS,
  },
});

/**
 * L1 的平级内容 Tabs（40，常显）。只用于平级视图；禁止用隐藏菜单做形态切换。
 *
 * 用法：
 *   <DetailTabs
 *     items={[{ value: 'hourly', label: '逐时' }, { value: 'warning', label: '预警', badge: 2 }]}
 *     value={tab}
 *     onChange={setTab}
 *   />
 *
 * @param {object} props
 * @param {{value: string, label: React.ReactNode, badge?: React.ReactNode|number|string}[]} props.items
 * @param {string} props.value 受控值
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.ariaLabel]
 */
export function DetailTabs({ items, value, onChange, ariaLabel, className, style }) {
  const styles = useDetailTabsStyles();
  if (!items || items.length === 0) return null;
  return (
    <TabList
      size="medium"
      selectedValue={value}
      onTabSelect={(_, data) => onChange?.(data.value)}
      aria-label={ariaLabel}
      className={mergeClasses(styles.tabs, className)}
      style={style}
      data-detail-tabs="true"
    >
      {items.map((item) => (
        <Tab key={item.value} value={item.value} className={styles.tab}>
          {item.label}
          {item.badge ? (
            <span className={styles.badge}>
              {isValidElement(item.badge) ? (
                item.badge
              ) : (
                <Badge appearance="tint" size="medium">
                  {item.badge}
                </Badge>
              )}
            </span>
          ) : null}
        </Tab>
      ))}
    </TabList>
  );
}

const useDetailScrollStyles = makeStyles({
  wrap: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBlock: tokens.spacingVerticalXXL,
    paddingInline: tokens.spacingHorizontalXXL,
    boxSizing: 'border-box',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
  },
  /**
   * 滚动渐隐：内容超过视口时只在底部压一层与宿主 DialogSurface 同色的渐变，
   * 明确提示「下面还有内容」，避免列表行被静默裁切（DENSITY §2.1 第 7 条）。
   * 不参与命中（pointerEvents: none），滚到底后自动隐藏。
   */
  scrollShadow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: tokens.spacingVerticalXXL,
    pointerEvents: 'none',
    background: `linear-gradient(to top, ${tokens.colorNeutralBackground1} 0%, color-mix(in srgb, ${tokens.colorNeutralBackground1} 72%, transparent) 55%, transparent 100%)`,
    opacity: 0,
  },
  scrollShadowVisible: {
    opacity: 1,
  },
});

/**
 * 滚动容器是否还有未显示的内容。
 * 只维护视觉状态（渐隐是否显示），不改变滚动/焦点/点击语义。
 *
 * @param {import('react').RefObject<HTMLElement | null>} ref
 * @returns {boolean}
 */
function useMoreBelow(ref) {
  const [moreBelow, setMoreBelow] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const next = node.scrollHeight - node.scrollTop - node.clientHeight > 2;
        setMoreBelow((previous) => (previous === next ? previous : next));
      });
    };

    update();
    node.addEventListener('scroll', update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(node);
    // React 切换 Tab / 展开行后内容高度变化，MutationObserver 保证渐隐状态同步。
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(node, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      node.removeEventListener('scroll', update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref]);

  return moreBelow;
}

/**
 * L1 内容滚动区：flex:1、内部滚动、24 边距。header/toolbar/tabs 固定，不跟着滚。
 * 内容超出视口时在底部显示同色渐隐；滚到底自动消失。
 *
 * 用法：
 *   <DetailScroll><ListRow ... /></DetailScroll>
 */
export function DetailScroll({ children, className, style }) {
  const styles = useDetailScrollStyles();
  const scrollRef = useRef(null);
  const moreBelow = useMoreBelow(scrollRef);

  return (
    <div className={styles.wrap} data-scroll-more={moreBelow ? 'true' : 'false'}>
      <div
        ref={scrollRef}
        className={mergeClasses(styles.scroll, className)}
        style={style}
        data-detail-scroll="true"
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        data-scroll-shadow={moreBelow ? 'visible' : 'hidden'}
        className={mergeClasses(styles.scrollShadow, moreBelow && styles.scrollShadowVisible)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* L2 子页                                                             */
/* ------------------------------------------------------------------ */

const SubpageCloseContext = createContext(null);

/**
 * 只能在 Subpage 的 children 内部（或被渲染在 children 里的组件）调用。
 * 返回 `requestClose()`：触发 pop 动画，动画结束后 Subpage 才调 onClosed / 卸载。
 *
 * 用法：
 *   function SaveFooter() {
 *     const close = useSubpageClose();
 *     return <ActionButton onClick={() => { save(); close(); }}>保存</ActionButton>;
 *   }
 *
 * @returns {(() => void) | null}
 */
export function useSubpageClose() {
  return useContext(SubpageCloseContext);
}

const useSubpageStyles = makeStyles({
  root: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
    // 与宿主 DialogSurface 一致：Fluent v9 DialogSurface 的 background-color 是
    // var(--colorNeutralBackground1)（见 node_modules/@fluentui/react-dialog 的
    // useDialogSurfaceStyles: background-color: var(--colorNeutralBackground1)）。
    // 覆盖 L1 时必须用同一个 token，否则 L2 与宿主内容区会有色差。
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
  },
  header: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: `${SUBPAGE_HEADER_HEIGHT}px`,
    paddingInline: tokens.spacingHorizontalXXL,
    boxSizing: 'border-box',
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: tokens.colorNeutralForeground1,
  },
  trailing: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  contentWrap: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBlock: tokens.spacingVerticalXXL,
    paddingInline: tokens.spacingHorizontalXXL,
    boxSizing: 'border-box',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
  },
  scrollShadow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: tokens.spacingVerticalXXL,
    pointerEvents: 'none',
    background: `linear-gradient(to top, ${tokens.colorNeutralBackground1} 0%, color-mix(in srgb, ${tokens.colorNeutralBackground1} 72%, transparent) 55%, transparent 100%)`,
    opacity: 0,
  },
  scrollShadowVisible: {
    opacity: 1,
  },
  footer: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalXXL,
    boxSizing: 'border-box',
  },
});

/**
 * L2 子页骨架：绝对覆盖 L1，header 56（← 返回 + 标题 + trailing）+ 滚动内容 + 可选 footer。
 * 进入用 SlidePage forward（250ms 减速），返回/取消用 back（200ms 加速）；reduced-motion 只淡入淡出。
 *
 * 用法（Subpage 自己管理进出；父组件在 onClosed 时把它卸载）：
 *   {editing && (
 *     <Subpage title="编辑任务" onClosed={() => setEditing(false)}>
 *       内容
 *     </Subpage>
 *   )}
 *
 * footer 可以是节点，也可以是 `(close) => node`；保存/取消用 close() 触发 pop：
 *   footer={(close) => (
 *     <>
 *       <ActionButton onClick={close}>取消</ActionButton>
 *       <ActionButton appearance="primary" onClick={() => { save(); close(); }}>保存</ActionButton>
 *     </>
 *   )}
 *
 * 注意：L2 内不得再嵌套 L3/Dialog/Sheet；X / Esc / 遮罩由宿主关闭整个浮层。
 *
 * @param {object} props
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.trailing] header 右侧动作
 * @param {React.ReactNode|((close: () => void) => React.ReactNode)} [props.footer]
 * @param {() => void} [props.onClosed] 退出动画结束后调用（父组件在这里卸载 Subpage）
 * @param {string} [props.backLabel='返回'] 返回按钮 aria-label
 */
export function Subpage({
  title,
  trailing,
  footer,
  children,
  onClosed,
  backLabel = '返回',
  className,
  style,
}) {
  const styles = useSubpageStyles();
  const contentRef = useRef(null);
  const moreContent = useMoreBelow(contentRef);
  const [visible, setVisible] = useState(true);
  const [direction, setDirection] = useState('forward');
  const [mounted, setMounted] = useState(true);
  const closingRef = useRef(false);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    // direction 与 visible 必须同一次 render 生效，否则 exit 会先用错方向。
    setDirection('back');
    setVisible(false);
  }, []);

  const handleMotionFinish = useCallback(
    (_, data) => {
      if (data?.direction !== 'exit') return;
      setMounted(false);
      onClosed?.();
    },
    [onClosed],
  );

  if (!mounted) return null;

  const footerContent = typeof footer === 'function' ? footer(requestClose) : footer;

  return (
    <SubpageCloseContext.Provider value={requestClose}>
      <SlidePage
        visible={visible}
        appear
        direction={direction}
        unmountOnExit
        onMotionFinish={handleMotionFinish}
      >
        <div className={mergeClasses(styles.root, className)} style={style} data-subpage="true">
          <div className={styles.header} data-subpage-header="true">
            <Button
              appearance="subtle"
              size="large"
              icon={<ArrowLeft24Regular />}
              aria-label={backLabel}
              title={backLabel}
              onClick={requestClose}
              style={TOUCH_TARGET_STYLE}
            />
            <Text size={400} weight="semibold" truncate wrap={false} className={styles.title}>
              {title}
            </Text>
            {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
          </div>
          <div className={styles.contentWrap} data-subpage-scroll-more={moreContent ? 'true' : 'false'}>
            <div ref={contentRef} className={styles.content}>{children}</div>
            <div
              aria-hidden="true"
              data-subpage-scroll-shadow={moreContent ? 'visible' : 'hidden'}
              className={mergeClasses(styles.scrollShadow, moreContent && styles.scrollShadowVisible)}
            />
          </div>
          {footerContent ? <div className={styles.footer}>{footerContent}</div> : null}
        </div>
      </SlidePage>
    </SubpageCloseContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* 时钟                                                                */
/* ------------------------------------------------------------------ */

/**
 * 可见性感知的时钟：页面隐藏时暂停 interval，回到前台立即补一次当前时间。
 * 返回 `Date.now()` 毫秒值；格式化交给 `Intl.DateTimeFormat`（时区/12/24h 都用它）。
 *
 * 用法：
 *   const now = useNow(1000);
 *   const text = useMemo(() => new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(now), [now]);
 *
 * @param {number} [intervalMs=1000]
 * @returns {number}
 */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  const [visible, setVisible] = useState(() => {
    if (typeof document === 'undefined') return true;
    return !document.hidden;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    // 页面重新可见时先补一拍，避免显示暂停前的旧时间
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), Math.max(1, intervalMs));
    return () => window.clearInterval(timer);
  }, [intervalMs, visible]);

  return now;
}
