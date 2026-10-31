/**
 * 插件共享 UI 基元（React + Fluent UI React v9）。
 *
 * 六个插件的卡片、L1 详情、L2 子页都从这里拼，不各画一套；具体业务布局仍由插件写。
 * 这层只做：外壳/骨架/触控尺寸/无障碍行为，颜色与字号全部走 Fluent token。
 *
 * 常用入口：
 *   <CardRoot onActivate={...} ariaLabel="...">卡片内容</CardRoot>
 *   <CardHeader title="今日 · 3" trailing={<Badge .../>} />
 *   <CardIdentity icon={<Clock20Regular />} label="时钟" />
 *   <CardIdentity placeholder />                       // 本档不放 identity：只保留 24 高行
 *   <HeroText>14:05</HeroText>
 *   <Metric value="42" unit="分钟" label="连续久坐" />
 *   <DataRow label="体感" value="24°" />               // 只读数据行：label 左 / 值右
 *   <ListStack><ListRow leading={<Checkbox ... />} title="任务标题" subtitle="今天 18:00" /></ListStack>
 *   <StatusLine tone="warning">距提醒还有 12 分钟</StatusLine>
 *   <TrailingCount total={12} shown={5} />
 *   <MiniBars values={[...]} labels={[...]} ariaLabel="最近 7 天久坐" />
 *   <HeroProgress value={0.42} active={running} label="本轮进度" />
 *   <Artwork src={artworkDataUrl} alt="曲目封面" size={ARTWORK_SIZE.XL} />
 *   <EmptyState align="start" icon={<CalendarLtr24Regular />} title="还没有倒数日" action={<ActionButton appearance="secondary" icon={<Add20Regular />}>添加事件</ActionButton>} />
 *   <EmptyState compact icon={<Key24Regular />} title="未配置 Key" action={<ActionButton icon={<Settings20Regular />}>打开设置</ActionButton>} />
 *   <DetailPage><DetailHeader trailing={...}>...</DetailHeader><DetailScroll>...</DetailScroll></DetailPage>
 *   <Subpage title="编辑任务" onClosed={...}>...</Subpage>
 *
 * 图标尺寸只取 `ICON_SIZE`（16/20/24/32/48）；identity 用 `IDENTITY_ICON_SIZE`(20)，
 * 空态用 `EMPTY_STATE_ICON_SIZE`(24)，不要在调用点写字面量。空态在 3×3 档会自动升到
 * 40 档位（`EMPTY_STATE_ICON_SIZE_LARGE`，DENSITY §1.2 结构性例外），插件无需传参。
 *
 * 空态不接收说明文字（PLUGIN-CONTRACT §4.4.3）：可做的事由图标 + 一个次操作按钮承担，
 * 卡片的「可展开」由 `CardIdentity disclosure` 的行尾 chevron 承担。
 *
 * `Artwork` 是 P3b 新增的封面原语：尺寸只取白名单档（48/96/160/240/320），
 * 圆角/占位/无阴影由共享层强制；alt 必填，style 只接受定位属性。
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
  webLightTheme,
} from '@fluentui/react-components';
import { ArrowLeft24Regular, ChevronRight16Regular, MusicNote220Regular } from '@fluentui/react-icons';
import { useHostCardGesture, useHostSize } from './host.js';
import { sizeKeyOf } from './sizes.js';
import { SlidePage, useReducedMotion } from './motion.js';
import { DISPLAY_WEIGHT, HERO_TEXT, TABULAR_NUMS } from './typography.js';

/** 尺寸档位字段表（纯数据、无 React 依赖）与 UI 原语同一入口导出，插件只记一个 import。 */
export { SIZE_KEYS, sizeKeyOf, defineSizeFields } from './sizes.js';

/**
 * 平板触控目标（Fluent `layout.md:57`：iOS & Web 最小 44×44；同时满足 HIG §6 的 44）。
 *
 * Fluent spacing/typography 档位里没有 44 这一档（spacing 最大 32），这是无障碍
 * 下限而非设计 token，因此只在这里定义一次，插件引用这个常量，不写裸 44。
 */
export const TOUCH_TARGET = 44;
/** 列表行高（DENSITY §2.1：≥44，与触控目标同值） */
export const LIST_ROW_HEIGHT = 44;
/** 列表行间距（DENSITY §2.1 第 7 条） */
export const LIST_ROW_GAP = 4;
/** 列表 pitch：行高 + 行距（插件反推行数时用这个唯一常量） */
export const LIST_ROW_PITCH = LIST_ROW_HEIGHT + LIST_ROW_GAP;

/**
 * 数值镜像：插件在 JS 里按 iframe 高度反推行数时需要数字（CSS 变量读不到）。
 *
 * `tokens.*` 在运行时是 `var(--spacingVerticalL)` 这种 CSS 变量引用，parseFloat 会得到 NaN；
 * Fluent 的 theme 对象里才是 token 的原始值（`'16px'`）。间距/字阶与亮暗主题无关，
 * 所以固定取 webLightTheme 的原始值，插件里不写死像素。
 */
const tokenPx = (value) => Number.parseFloat(value);
export const CARD_PADDING_PX = tokenPx(webLightTheme.spacingVerticalL);
export const CARD_GAP_PX = tokenPx(webLightTheme.spacingVerticalS);
export const HERO_LINE_HEIGHT_PX = tokenPx(webLightTheme.lineHeightHero900);
/** identity 行高（24 = spacingVerticalXXL），插件跑行预算公式时直接用这个，不再各解析一次 */
export const CARD_IDENTITY_HEIGHT_PX = tokenPx(webLightTheme.spacingVerticalXXL);

/**
 * 卡片内容轴（卡片外框 → 内容盒四边）= 22 = 宿主 6 + 共享层 16。
 *
 * 两段分别在两个盒模型里真实生效，**不能合并写到一处**：
 * - 宿主 6：`src/host/desktop/desktop.styles.ts` 的 `gestureArea.padding`
 *   （`spacingHorizontalSNudge`），给 hover 1.015 缩放留内衬；
 * - 共享层 16：本文件 `CardRoot` 的四边 padding（`spacingHorizontalL` / `spacingVerticalL`）。
 *
 * 因此这里导出的 22 只用于验收、自检标记与宿主侧引用
 * （`data-card-content-inset-total`）；插件不得把 22 再写进 padding，
 * 否则会变成 6 + 22 = 28。六张卡片（weather / clock / todo / pomodoro /
 * countdown / sedentary）全部通过 `CardRoot` 继承同一条轴，插件源码里
 * 没有任何一处横向 padding（PLUGIN-CONTRACT §4.2）。
 */
export const CARD_CONTENT_INSET = `calc(${tokens.spacingHorizontalSNudge} + ${tokens.spacingHorizontalL})`;
export const CARD_CONTENT_INSET_PX =
  tokenPx(webLightTheme.spacingHorizontalSNudge) + tokenPx(webLightTheme.spacingHorizontalL);

/**
 * Fluent System Icon 尺寸阶梯（16 / 20 / 24 / 32 / 48）。
 *
 * 图标不缩放：需要多大就取哪一档，插件里不得再出现 `size={28}` 这类中间值，
 * 也不得把 32 的图标塞进 20 的槽位再由 CSS 缩放。语义档位：
 * - `S`(20) = identity 行图标；
 * - `M`(24) = 卡片空态 / 1×1 空态槽位；
 * - `L`(32) = 详情页空态、内容图形；
 * - `XL`(48) = 天气等唯一允许的内容图形档（FLUENT2 §9）。
 */
export const ICON_SIZE = Object.freeze({
  XS: 16,
  S: 20,
  M: 24,
  L: 32,
  XL: 48,
});

/** identity 图标档位（DENSITY §1-4：20px 单色、唯一允许出现身份色的落点） */
export const IDENTITY_ICON_SIZE = ICON_SIZE.S;
/** 空态图标档位（24；详情空态可用 ICON_SIZE.L） */
export const EMPTY_STATE_ICON_SIZE = ICON_SIZE.M;
/**
 * 空态主图标大档 40（voice 空态圆内图标）。
 *
 * 它不在 16/20/24/32/48 图标阶梯内，是「空态主图标」单独一档：32 在 96 圆内偏小、
 * 48 会撑破内环。常量出口只在这里定义一次，调用点不得再写裸 40。
 */
export const EMPTY_STATE_ICON_SIZE_LARGE = 40;

/**
 * HeroProgress 的厚度：4 = `strokeWidthThickest`。
 *
 * `strokeWidthThicker` 在 @fluentui/tokens 的 Web 档是 **3px**（Fluent shapes.md：
 * Thicker 在 Web 为 3、在 Mobile 为 4），用它会把规格要求的 4px 进度带做成 3px；
 * 这里取同族最大的 `strokeWidthThickest`（4px），仍是 stroke token、不写裸像素。
 */
export const HERO_PROGRESS_THICKNESS_PX = tokenPx(webLightTheme.strokeWidthThickest);

/**
 * 封面固定尺寸档（P3b `Artwork` 白名单，插件不得再传其它数值）。
 *
 * 320 是大面板规格的主档；其余为同一 8px 基线的派生档（48/96/160/240），
 * 供卡片/缩略图使用。这里集中定义，避免共享原语和调用点各写一套裸数字。
 */
export const ARTWORK_SIZE = Object.freeze({
  XS: 48,
  S: 96,
  M: 160,
  L: 240,
  XL: 320,
});
const ARTWORK_SIZE_VALUES = Object.freeze(Object.values(ARTWORK_SIZE));
const ARTWORK_DEFAULT_SIZE = ARTWORK_SIZE.XL;
/** L1 固定骨架高度（PLUGIN-CONTRACT §4.1） */
const DETAIL_HEADER_HEIGHT = 56;
const DETAIL_TOOLBAR_HEIGHT = 48;
const DETAIL_TABS_HEIGHT = 44;
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
    // 唯一卡片内容栅格：所有尺寸档同 padding / 同 gap，值全部来自 Fluent spacing ramp
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    gap: tokens.spacingVerticalS,
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
 * - className/style 只用于非系统属性（如对齐、子布局）；padding/gap 由系统强制为
 *   16 / 8，插件传 style 也会被这里的系统值覆盖。
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

  /**
   * 系统内衬是宿主 6 + 本组件 16 = 22（`CARD_CONTENT_INSET`）。这里只声明本组件
   * 负责的那一段 16；宿主那 6 由 `desktop.styles.ts` 的 `gestureArea` 提供，
   * 不能把 22 整个写进 padding（会变成 28）。inline style 放在最后，
   * 任何插件 className/style 里的 padding/gap 都无法改掉内容轴。
   */
  const systemInset = {
    ...style,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    gap: tokens.spacingVerticalS,
  };

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
      style={systemInset}
      data-card-root="true"
      data-card-content-inset={String(CARD_PADDING_PX)}
      data-card-content-inset-total={String(CARD_CONTENT_INSET_PX)}
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
    // 行高对齐 12px 标签的 Fluent 行高（Base200），不再写死像素
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
/* CardIdentity                                                        */
/* ------------------------------------------------------------------ */

const useCardIdentityStyles = makeStyles({
  root: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
    minHeight: tokens.spacingVerticalXXL,
  },
  icon: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    // 尺寸由传入的 20px Fluent System Icon 决定，这里不再写死像素
    // 身份色唯一落点：20px 单色图标；没有色块、没有背景 tint
    color: 'var(--wtsl-identity, currentColor)',
  },
  /**
   * 无图标占位：宽度 = identity 图标档位（20 = spacingHorizontalXL），
   * 只占位、不渲染图标；缺少图标的卡片标题因此不会左移 28（20 + 8 组距）。
   */
  iconPlaceholder: {
    display: 'inline-block',
    flexShrink: 0,
    width: tokens.spacingHorizontalXL,
    height: tokens.spacingVerticalXL,
  },
  label: {
    minWidth: 0,
    color: tokens.colorNeutralForeground3,
  },
  trailing: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginInlineStart: 'auto',
    maxHeight: tokens.spacingVerticalXXL,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground3,
  },
  /**
   * 无 trailing 时 chevron 自己吃掉剩余空间（`marginInlineStart: auto`）；
   * 有 trailing 时不能再给 auto，否则两颗 auto 会平分空档、把 trailing 顶到行中。
   */
  disclosure: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    color: tokens.colorNeutralForeground3,
  },
});

/**
 * 行尾 chevron：卡片「点开有更多内容」的唯一视觉信号（不写「详情」二字）。
 *
 * 它是纯装饰：语义由 `CardRoot` 的 `aria-label`（「…，点击打开详情」）承担，
 * 因此 `aria-hidden="true"`，不进 Tab 序列、不抢命中区（点它等于点卡片）。
 * 16（`ICON_SIZE.XS`）比 identity 图标小一档：它是方向提示，不是身份。
 *
 * 用法（直接放进自定义行，或交给 `CardIdentity disclosure`）：
 *   <CardDisclosure />
 *
 * @param {object} props
 * @param {string} [props.className]
 * @param {object} [props.style] 只用于定位（例如无 trailing 时的 `marginInlineStart: 'auto'`）
 */
export function CardDisclosure({ className, style }) {
  const styles = useCardIdentityStyles();
  return (
    <span
      className={mergeClasses(styles.disclosure, className)}
      style={style}
      aria-hidden="true"
      data-card-disclosure="true"
    >
      <ChevronRight16Regular />
    </span>
  );
}

/**
 * 卡片静态 identity 行：24px 高，20px 身份色图标 + 12px 半粗标签 + 可选 trailing。
 *
 * 它**不是** chrome：没有可交互控件、不常驻操作、不占点击热区。
 * 色相只出现在 20px 图标上；hue 由 manifest.identityHue 决定，插件不再传 accent。
 * 1×1 卡用 `compact`（只留图标）；2×1 起用图标 + 标签 + 可选 trailing。
 *
 * 三种图标状态：
 * - `icon` 给了 → 正常渲染；
 * - `icon` 缺省但仍有 label → 渲染 20px **空占位**，标题不会因为缺图标而左移；
 * - `placeholder` → 整行只保留 24 高与 20px 空图标位，不渲染图标/标签
 *   （天气 1×1 这类「本档不放 identity」的卡用它，避免插件自建空行）。
 *
 * 用法：
 *   <CardIdentity icon={<Clock20Regular />} label="时钟" disclosure />
 *   <CardIdentity icon={<WeatherSunny20Regular />} label="天气" trailing={<Text size={200}>澳门</Text>} disclosure />
 *   <CardIdentity placeholder />
 *
 * @param {object} props
 * @param {React.ReactNode} [props.icon] 20px Fluent System Icon
 * @param {string} [props.label] 组件名（≤4 字）
 * @param {React.ReactNode} [props.trailing] 行尾辅助（城市、计数……）
 * @param {boolean} [props.compact] 只显示图标（1×1 卡）
 * @param {boolean} [props.placeholder] 只占 24 高行 + 20px 图标位，不渲染图标与标签
 * @param {boolean} [props.disclosure=false] 行尾加 `CardDisclosure`（整卡可点开详情）
 */
export function CardIdentity({
  icon,
  label,
  trailing,
  compact = false,
  placeholder = false,
  disclosure = false,
  className,
  style,
  ...rest
}) {
  const styles = useCardIdentityStyles();
  const showIcon = !placeholder && Boolean(icon);
  return (
    <div
      {...rest}
      className={mergeClasses(styles.root, className)}
      style={style}
      data-card-identity="true"
      data-card-identity-empty={showIcon ? undefined : 'true'}
    >
      {showIcon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : (
        <span className={styles.iconPlaceholder} aria-hidden="true" />
      )}
      {!placeholder && !compact && label ? (
        <Text size={200} weight="semibold" truncate wrap={false} className={styles.label}>
          {label}
        </Text>
      ) : null}
      {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
      {disclosure ? (
        <CardDisclosure style={trailing ? undefined : { marginInlineStart: 'auto' }} />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Artwork（封面）                                                      */
/* ------------------------------------------------------------------ */

/** style 只允许“摆在哪里”，不允许改“长什么样”（尺寸/圆角/颜色/阴影由共享层强制）。 */
const ARTWORK_POSITION_STYLE_KEYS = new Set([
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'insetBlock',
  'insetBlockStart',
  'insetBlockEnd',
  'insetInline',
  'insetInlineStart',
  'insetInlineEnd',
  'margin',
  'marginBlock',
  'marginBlockStart',
  'marginBlockEnd',
  'marginInline',
  'marginInlineStart',
  'marginInlineEnd',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'alignSelf',
  'justifySelf',
  'order',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'gridArea',
  'gridColumn',
  'gridColumnStart',
  'gridColumnEnd',
  'gridRow',
  'gridRowStart',
  'gridRowEnd',
  'zIndex',
]);

function pickArtworkPositionStyle(style) {
  if (!style || typeof style !== 'object') return undefined;
  const picked = {};
  for (const [key, value] of Object.entries(style)) {
    if (ARTWORK_POSITION_STYLE_KEYS.has(key)) picked[key] = value;
  }
  return Object.keys(picked).length > 0 ? picked : undefined;
}

function pickArtworkA11yProps(rest) {
  const picked = {};
  for (const [key, value] of Object.entries(rest)) {
    // 只透传 data-* / aria-*；className、尺寸、颜色、事件处理器等一律不接收。
    if (key.startsWith('data-') || key.startsWith('aria-')) picked[key] = value;
  }
  return picked;
}

const useArtworkStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box',
    // 与浮层 surface 同一圆角档（12）；封面无阴影，不参与 elevation。
    borderRadius: tokens.borderRadius2XLarge,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    borderRadius: tokens.borderRadius2XLarge,
  },
  /** 无图 / 加载失败：中性底 + 20px 音符，禁止彩色块。 */
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
  },
});

/**
 * 封面图（P3b 通用原语，契约 §4.4）。
 *
 * 契约表（与 PLUGIN-CONTRACT §4.4 的 `Artwork` 行对应）：
 *
 * | props | 约束 |
 * |---|---|
 * | `src?` | data URL / 图片地址；空串或加载失败时渲染中性音符占位 |
 * | `alt` | **必填**；封面内容的可读名称（不能写“图片”“封面图”） |
 * | `size` | 只接受 `ARTWORK_SIZE` 白名单 48 / 96 / 160 / 240 / 320；默认 320 |
 * | `style` | 仅定位（margin / inset / grid / flex / alignSelf 等）；尺寸、圆角、颜色会被丢弃 |
 * | `...rest` | 只透传 `data-*` / `aria-*`，不接收 className |
 *
 * 外观固定：`borderRadius2XLarge`（与浮层 surface 同值）、无阴影、`object-fit: cover`；
 * 占位底 `colorNeutralBackground3` + 20px `MusicNote220Regular`（Fluent 当前 20 档音符），
 * 不做彩色块。`MusicNote220Regular` 是图标本身尺寸，不缩放。
 *
 * 用法：
 *   <Artwork src={artwork} alt="《晴天》封面" size={ARTWORK_SIZE.XL} />
 *   <Artwork src={artwork} alt="当前曲目封面" size={ARTWORK_SIZE.M} style={{ alignSelf: 'center' }} />
 *
 * 尺寸表集中在 `ARTWORK_SIZE`，调用点不要写 320/160 等裸数字。
 *
 * @param {object} props
 * @param {string} [props.src] 封面地址；空/失败显示占位
 * @param {string} props.alt 必填的封面替代文本
 * @param {number} [props.size=ARTWORK_SIZE.XL] 固定档位（48/96/160/240/320）
 * @param {object} [props.style] 仅定位属性
 */
export function Artwork({ src, alt, size = ARTWORK_DEFAULT_SIZE, style, ...rest }) {
  const styles = useArtworkStyles();
  const [failedSrc, setFailedSrc] = useState(null);
  const requestedSizeValid = ARTWORK_SIZE_VALUES.includes(size);
  const resolvedSize = requestedSizeValid ? size : ARTWORK_DEFAULT_SIZE;
  const normalizedAlt = typeof alt === 'string' ? alt.trim() : '';

  useEffect(() => {
    if (!requestedSizeValid) {
      console.warn(
        `[Artwork] 非法 size=${String(size)}；只允许 ${ARTWORK_SIZE_VALUES.join(' / ')}，已回落到 ${ARTWORK_DEFAULT_SIZE}。`,
      );
    }
    if (!normalizedAlt) console.warn('[Artwork] alt 为必填项，请传入封面内容的可读名称。');
  }, [normalizedAlt, requestedSizeValid, size]);

  const showImage = Boolean(src) && failedSrc !== src;
  const positionStyle = pickArtworkPositionStyle(style);
  const a11yProps = pickArtworkA11yProps(rest);

  return (
    <div
      {...a11yProps}
      className={styles.root}
      style={{ width: `${resolvedSize}px`, height: `${resolvedSize}px`, ...positionStyle }}
      data-artwork="true"
      data-artwork-size={resolvedSize}
      data-artwork-state={showImage ? 'image' : 'placeholder'}
    >
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt={normalizedAlt}
          draggable={false}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span
          className={styles.placeholder}
          role={normalizedAlt ? 'img' : undefined}
          aria-label={normalizedAlt || undefined}
          data-artwork-placeholder="true"
        >
          <MusicNote220Regular aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HeroText                                                            */
/* ------------------------------------------------------------------ */

const useHeroTextStyles = makeStyles({
  /**
   * 全站唯一主数字样式。插件不得再自己写 fontSize/lineHeight；
   * 需要主数字时只渲染这个组件，尺寸/行高/字重/等宽全部来自 Fluent token。
   *
   * 例外 E4（保留）：数字 ink 比盒左缘再内缩 1.5–4 px（"1"/"7" 左侧留白 + tabular 等宽），
   * 这是字形 bearing，不是容器错位；禁止用负 margin 抵消。
   */
  hero: {
    ...TABULAR_NUMS,
    ...HERO_TEXT,
    fontWeight: DISPLAY_WEIGHT,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
  },
});

/**
 * 主数字（hero）文本：唯一入口。
 *
 * 它固定使用 Fluent v9 的 `fontSizeHero900` / `lineHeightHero900`（40/52），
 * 不接收 size 参数，也不按卡片尺寸放大。时钟、番茄钟、久坐、天气、倒数日
 * 的主数值都必须经过这里（或经过同样使用它的 `Metric`）。
 *
 * 用法：
 *   <HeroText data-clock-time>{time.main}</HeroText>
 *   <Metric value="25:00" unit="分钟" />
 *
 * @param {object} props
 * @param {React.ReactNode} props.children 主数值文本
 * @param {string} [props.className]
 */
export function HeroText({ children, className, ...rest }) {
  const styles = useHeroTextStyles();
  return (
    <span
      {...rest}
      className={mergeClasses(styles.hero, className)}
      data-wtsl-hero="true"
    >
      {children}
    </span>
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
  unit: {
    color: tokens.colorNeutralForeground2,
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  /**
   * label 行 + caption 行的固定两行高度（20 + 2 + 16 = 38）。
   * 不给 minHeight 时，caption 从有到无会抽掉 18（2 + 16），下方按钮整体上移；
   * 姿态/状态切换的卡（久坐的「休息中」）会看到 18px 跳动。系统在这里兜住，
   * 插件不再各写一份 calc。
   */
  metaReserved: {
    minHeight: `calc(${tokens.lineHeightBase300} + ${tokens.spacingVerticalXXS} + ${tokens.lineHeightBase200})`,
  },
  label: {
    color: tokens.colorNeutralForeground2,
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
});

/**
 * 数字主信息：值 + 可选单位/标签/说明。
 *
 * 字号不再由调用方选择：统一取 `HERO_TEXT`（`tokens.fontSizeHero900` / `lineHeightHero900`）。
 * 次级标签走 Text 200/300（caption 1 / body 1），单位走 body 1。
 * `size` 参数保留只为兼容旧插件调用，已不参与渲染。
 *
 * caption 为空时的高度：只要给了 label，meta 固定占 label + caption 两行（38），
 * 因此「有 caption / 无 caption」两态总高都是 92（52 + 2 + 38），不再塌陷 18px。
 * 确实需要紧凑的调用方传 `reserveCaption={false}`（恢复旧行为：74）。
 *
 * 用法：
 *   <Metric value="25:00" unit="分钟" label="专注剩余" caption="第 2 轮" />
 *
 * @param {object} props
 * @param {string|number} props.value
 * @param {string} [props.unit]
 * @param {string} [props.label]
 * @param {string} [props.caption]
 * @param {boolean} [props.reserveCaption=true] label 存在时是否保留 caption 行高
 * @param {number} [props.size] 已废弃：hero 字号由 HERO_TEXT（fontSizeHero900）唯一决定
 */
export function Metric({
  value,
  unit,
  label,
  caption,
  reserveCaption = true,
  className,
  style,
  ...rest
}) {
  const styles = useMetricStyles();
  const hasMeta = Boolean(label || caption);
  const reserveMetaLine = reserveCaption && Boolean(label);
  return (
    <div
      {...rest}
      className={mergeClasses(styles.root, className)}
      style={style}
      data-metric="true"
      data-metric-reserve-caption={reserveMetaLine ? 'true' : undefined}
    >
      <div className={styles.valueRow}>
        <HeroText>{value}</HeroText>
        {unit ? (
          <Text size={300} className={styles.unit}>
            {unit}
          </Text>
        ) : null}
      </div>
      {hasMeta ? (
        <div className={mergeClasses(styles.meta, reserveMetaLine && styles.metaReserved)}>
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
/* DataRow（只读数据行）                                                */
/* ------------------------------------------------------------------ */

const useDataRowStyles = makeStyles({
  row: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    width: '100%',
    minWidth: 0,
  },
  label: {
    minWidth: 0,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  /** 值组贴行尾：同一容器里的每一行右缘对齐，形成唯一的值轴 */
  valueGroup: {
    display: 'inline-flex',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalXXS,
    flexShrink: 0,
    marginInlineStart: 'auto',
    textAlign: 'end',
  },
  value: {
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
  },
  unit: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
});

/**
 * 只读数据行：label（12/16 fg3，左）+ 值（20/28 fg1，右）+ 可选单位（12/16 fg3）。
 *
 * 它是「定义列表」的系统实现：值列靠 `margin-inline-start:auto` 贴到容器右缘，
 * 同一个容器里多行天然共用一条值轴，不需要每个插件自己写 space-between。
 * DENSITY §2.1-9 的「定义列表例外」就指这个结构：行内留白不算横向空洞，
 * 但整块必须占满可用宽度（本组件 `width:100%`）。
 *
 * 行高不写死：由 `lineHeightBase500`（28）决定；需要 36 行节奏的块
 * （weather 今日指标）由外层容器给 `rowGap` + `minHeight`，不在这里改行高。
 *
 * 用法：
 *   <DataRow label="体感" value="24°" />
 *   <DataRow label="专注" value="25" unit="分钟" />
 *
 * @param {object} props
 * @param {React.ReactNode} props.label
 * @param {React.ReactNode} props.value
 * @param {React.ReactNode} [props.unit]
 */
export function DataRow({ label, value, unit, className, style, ...rest }) {
  const styles = useDataRowStyles();
  return (
    <div
      {...rest}
      className={mergeClasses(styles.row, className)}
      style={style}
      data-data-row="true"
      data-data-row-label={typeof label === 'string' ? label : undefined}
    >
      <Text size={200} className={styles.label} title={typeof label === 'string' ? label : undefined}>
        {label}
      </Text>
      <span className={styles.valueGroup}>
        <Text size={500} className={styles.value}>
          {value}
        </Text>
        {unit ? (
          <Text size={200} className={styles.unit}>
            {unit}
          </Text>
        ) : null}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ListStack                                                           */
/* ------------------------------------------------------------------ */

const useListStackStyles = makeStyles({
  root: {
    display: 'grid',
    gap: tokens.spacingVerticalXS,
    minHeight: 0,
    alignContent: 'start',
  },
  /**
   * 无 CardRoot 的 L1/L2 页面用 inset 补首末行留白（16）；
   * 卡片内默认 false —— 首末行留白已由 CardRoot 的 16 提供，不重复叠加。
   */
  inset: {
    paddingBlock: tokens.spacingVerticalL,
  },
});

/**
 * 列表容器：固定行距 4、零行内 padding，首末行留白由调用方决定。
 *
 * 用法（卡片内）：
 *   <ListStack>{items.map(...<ListRow/>)}</ListStack>
 * 用法（详情页）：
 *   <ListStack inset>{...}</ListStack>
 *
 * 行高由 ListRow 固定为 LIST_ROW_HEIGHT(44)；两者共同构成 48 pitch，
 * 插件不要再用 space-between / 自定义行距拉伸出第二套节奏。
 *
 * @param {object} props
 * @param {boolean} [props.inset=false] 是否加首末行 16 留白（卡片内保持 false）
 */
export function ListStack({ inset = false, className, style, children, ...rest }) {
  const styles = useListStackStyles();
  return (
    <div
      {...rest}
      className={mergeClasses(styles.root, inset && styles.inset, className)}
      style={style}
      data-list-stack="true"
    >
      {children}
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
    /** 44 = 触控 40 + 上下各 2 的按压余量；用 token 表达，避免裸像素 */
    minHeight: `calc(${tokens.spacingVerticalXL} * 2 + ${tokens.spacingVerticalXS})`,
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

/**
 * 空态图标盒尺寸表：**盒宽 = 图标档位**（16 / 20 / 24 / 32 / 40 / 48）。
 *
 * 审计 M1/M3 的根因就在槽宽与图标宽不匹配：32 槽放 24 图标，盒被
 * `justify-content:center` 推到内容轴 +4；32 槽放 20 图标推到 +6。
 * 盒与图标同宽后，盒左边缘天然落在内容轴上，字形 ink 再内缩 2–5 是
 * Fluent 图标自带安全边（R4：不修、不用负 margin 抵消）。
 *
 * 值全部来自 spacing ramp：16=L / 20=XL / 24=XXL / 32=XXXL；
 * 40 不在 ramp 内，用 `XXXL + S` 表达（与 `EMPTY_STATE_ICON_SIZE_LARGE` 同源），
 * 48 用 `XXXL + L`（= XL 图标档）。
 */
const EMPTY_STATE_ICON_BOX = Object.freeze({
  [ICON_SIZE.XS]: { width: tokens.spacingHorizontalL, height: tokens.spacingVerticalL },
  [ICON_SIZE.S]: { width: tokens.spacingHorizontalXL, height: tokens.spacingVerticalXL },
  [EMPTY_STATE_ICON_SIZE]: {
    width: tokens.spacingHorizontalXXL,
    height: tokens.spacingVerticalXXL,
  },
  [ICON_SIZE.L]: { width: tokens.spacingHorizontalXXXL, height: tokens.spacingVerticalXXXL },
  [EMPTY_STATE_ICON_SIZE_LARGE]: {
    width: `calc(${tokens.spacingHorizontalXXXL} + ${tokens.spacingHorizontalS})`,
    height: `calc(${tokens.spacingVerticalXXXL} + ${tokens.spacingVerticalS})`,
  },
  [ICON_SIZE.XL]: {
    width: `calc(${tokens.spacingHorizontalXXXL} + ${tokens.spacingHorizontalL})`,
    height: `calc(${tokens.spacingVerticalXXXL} + ${tokens.spacingVerticalL})`,
  },
});

const useEmptyStateStyles = makeStyles({
  /**
   * 空态唯一结构：图标盒 24 + 标题 + 一个次操作，组距 24（`spacingVerticalXXL`）。
   *
   * 组距从 8 抬到 24 不是审美，是几何：三件套 24 + 22 + 44 = 90 高，
   * 加两段 24 组距后块高 138；3×2 卡（iframe 328，identity 行外剩余 264）居中后
   * 单块空带 = (264 − 138)/2 + 8 = 71 → 21.6%，仍在 DENSITY §1.1-2 的 22% 门禁内
   * （+8 是 identity 行与空态块之间的系统组距）。六张卡共用这一个值，插件不得覆盖 gap。
   */
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXXL,
    padding: 0,
    textAlign: 'center',
  },
  /** 卡片空态：水平左对齐到内容轴，垂直仍居中；详情页可再配合顶部对齐容器 */
  start: {
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  /**
   * 1×1 / 2×1 短卡档：只收紧组距到 4。
   * 图标盒不再单独缩档——盒宽恒等于图标档位（见 `EMPTY_STATE_ICON_BOX`），
   * 120 高内容框里 24 盒 + 4 组距 + 44 按钮放得下。
   */
  compact: {
    gap: tokens.spacingVerticalXS,
  },
  /**
   * 图标盒：宽高由 `EMPTY_STATE_ICON_BOX` 按档位注入（盒 = 图标档位，R4）。
   * 盒内居中；`align="start"` 时盒左边缘 = 内容盒左边缘，不再有 32 槽的 +4/+6 缩进。
   */
  icon: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground3,
  },
  /**
   * 3×3 空态：盒与字形都抬到 40 档位（`EMPTY_STATE_ICON_SIZE_LARGE`）。
   * 这是「空带超标但不加文字」的结构性例外里唯一的视觉杠杆（DENSITY §1.2）：
   * 3×3 档靠**更大的中性图标 + 垂直居中**撑住观感，而不是补一行说明文字，
   * 也不把身份色扩散到图标上。
   *
   * 插件传进来的是 24 变体的 Fluent 图标（显式 width/height=24，不吃 font-size），
   * 所以这里用后代选择器把它撑到 40 档位。盒宽由尺寸表注入为 40，盒左边缘仍在内容轴；
   * 40 档图标内建边 5 px 是字形 bearing（E3），**不加负 margin 做光学补偿**：
   * 那会让盒越出内容轴，几何对齐优先（R4 的可选项，本项目不采用）。
   */
  iconLarge: {
    '& svg': {
      width: `${EMPTY_STATE_ICON_SIZE_LARGE}px`,
      height: `${EMPTY_STATE_ICON_SIZE_LARGE}px`,
    },
  },
  title: {
    color: tokens.colorNeutralForeground1,
  },
  action: {
    marginTop: 0,
  },
});

/**
 * 空态：中性单色图标 + 一句标题（≤6 汉字）+ 一个次操作按钮。**不接收说明文字。**
 *
 * 文案规则见 PLUGIN-CONTRACT §4.4.3：空态不写「在……里」「卡片会……」「你可以……」这类
 * 说明书句式——可做的事由 affordance 表达：动作按钮带 `AddRegular` 图标、
 * 整卡可展开由 `CardIdentity disclosure` 的行尾 chevron 表达。
 *
 * Equal Except Hue：空态不占身份色，不做彩色色块，不让“空的东西最亮”。
 * 图标固定 24（`EMPTY_STATE_ICON_SIZE`），且图标盒**同宽 24**（`EMPTY_STATE_ICON_BOX`）；
 * 动作按钮由调用方给 `secondary`（空态不得用实心 accent）。
 *
 * 1×1 用 `compact`：图标盒 24、组距 4。120 宽的卡里大图标 + 两行文字 + 44 按钮必然溢出，
 * 所以紧凑档只收紧垂直节奏，不缩小图标盒（盒一变小，图标盒就不在内容轴上了）。
 *
 * `...rest` 透传给根节点（`data-*` / `aria-*`），验收脚本与插件都靠它定位空态；
 * 注意 `data-empty-state` / `data-align` / `data-compact` 由组件自身写入。
 *
 * 用法：
 *   <EmptyState
 *     align="start"
 *     icon={<CalendarLtr24Regular />}
 *     title="还没有倒数日"
 *     action={<ActionButton appearance="secondary" icon={<Add20Regular />}>添加事件</ActionButton>}
 *   />
 *   <EmptyState compact icon={<Key24Regular />} title="未配置 Key" action={<ActionButton icon={<Settings20Regular />}>打开设置</ActionButton>} />
 *
 * @param {object} props
 * @param {React.ReactNode} [props.icon] 空态图标（默认 24，即 `EMPTY_STATE_ICON_SIZE`；3×3 档自动用 40 档位）
 * @param {React.ReactNode} [props.title] 标题（≤6 汉字）
 * @param {React.ReactNode} [props.action] 唯一的次操作
 * @param {'center'|'start'} [props.align='center'] 卡片空态用 start，1×1 方块可用 center
 * @param {boolean} [props.compact=false] 1×1 紧凑档：组距 4（图标盒仍 = 图标档位）
 * @param {number} [props.iconSize=EMPTY_STATE_ICON_SIZE] 传入图标的档位（16/20/24/32/48）；
 *   图标盒宽高恒等于它，**不要**让槽比图标大（那会把盒推离内容轴）。3×3 档忽略此值、固定 40
 */
export function EmptyState({
  icon,
  title,
  action,
  align = 'center',
  compact = false,
  iconSize = EMPTY_STATE_ICON_SIZE,
  className,
  style,
  ...rest
}) {
  const styles = useEmptyStateStyles();
  /**
   * 3×3 档的图标档位由共享层自己判断，插件调用点不再多传参数：
   * `useHostSize` 读宿主下发的 `[列, 行]`，非卡片场景（详情/浮层）拿不到合法档位，
   * `sizeKeyOf` 会回落到默认档，因此不会误放大。
   */
  const sizeKey = useHostSize(sizeKeyOf, '2x1');
  const emphasized = !compact && sizeKey === '3x3';
  const slotSize = emphasized ? EMPTY_STATE_ICON_SIZE_LARGE : iconSize;
  const iconBox = EMPTY_STATE_ICON_BOX[slotSize] || EMPTY_STATE_ICON_BOX[EMPTY_STATE_ICON_SIZE];
  return (
    <div
      {...rest}
      className={mergeClasses(
        styles.root,
        align === 'start' && styles.start,
        compact && styles.compact,
        className,
      )}
      style={style}
      data-empty-state="true"
      data-align={align}
      data-compact={compact ? 'true' : undefined}
      data-emphasized={emphasized ? 'true' : undefined}
    >
      {icon ? (
        <div
          className={mergeClasses(styles.icon, emphasized && styles.iconLarge)}
          style={iconBox}
          data-empty-state-icon-slot={slotSize}
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      {title ? (
        <Text size={400} weight="semibold" className={styles.title}>
          {title}
        </Text>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 状态点 / 状态线 / trailing 计数                                      */
/* ------------------------------------------------------------------ */

const useStatusStyles = makeStyles({
  dot: {
    display: 'inline-block',
    flexShrink: 0,
    width: tokens.spacingHorizontalS,
    height: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusCircular,
  },
  success: { backgroundColor: tokens.colorStatusSuccessForeground1 },
  warning: { backgroundColor: tokens.colorStatusWarningForeground1 },
  danger: { backgroundColor: tokens.colorStatusDangerForeground1 },
  info: { backgroundColor: tokens.colorStatusInfoForeground1 },
  neutral: { backgroundColor: tokens.colorNeutralForeground3 },
  line: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
    color: tokens.colorNeutralForeground3,
  },
});

/**
 * 状态点：8×8 圆形，只有 semantic 三态 + info / neutral。
 * 取代旧实现里的 2×16 竖条；success 不常亮、只在有状态时由插件决定是否渲染。
 *
 * 用法：
 *   <StatusDot tone="warning" />
 *   <StatusLine tone="danger">该起身了</StatusLine>
 *
 * @param {object} props
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} [props.tone='neutral']
 * @param {string} [props.label] 需要读屏时给；纯装饰可省略
 */
export function StatusDot({ tone = 'neutral', label, className, style, ...rest }) {
  const styles = useStatusStyles();
  const toneStyle =
    tone === 'success'
      ? styles.success
      : tone === 'warning'
        ? styles.warning
        : tone === 'danger'
          ? styles.danger
          : tone === 'info'
            ? styles.info
            : styles.neutral;
  return (
    <span
      {...rest}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      className={mergeClasses(styles.dot, toneStyle, className)}
      style={style}
      data-status-dot={tone}
    />
  );
}

/**
 * 状态行：8×8 点 + 12px caption 文案，点与文字 cap 中轴对齐。
 * 只用于就地状态（warning / danger / info），不用于装饰性分类。
 *
 * @param {object} props
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} [props.tone='neutral']
 * @param {React.ReactNode} props.children 状态文案（一句，≤2 行）
 */
export function StatusLine({ tone = 'neutral', children, className, style, ...rest }) {
  const styles = useStatusStyles();
  return (
    <span {...rest} className={mergeClasses(styles.line, className)} style={style} data-status-line={tone}>
      <StatusDot tone={tone} />
      <Text size={200} truncate wrap={false}>
        {children}
      </Text>
    </span>
  );
}

const useTrailingCountStyles = makeStyles({
  count: {
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
});

/**
 * trailing 计数：固定「共 X · 显示 Y」口径，12px fg3、tabular-nums。
 * 总数不超过首屏时只写「共 X」；用于 identity 行尾或空态说明，不占独立行。
 *
 * 用法：
 *   <CardIdentity ... trailing={<TrailingCount total={all.length} shown={visible.length} />} />
 *
 * @param {object} props
 * @param {number} props.total 全部条目数
 * @param {number} [props.shown] 当前可见条目数；小于 total 时显示「显示 Y」
 */
export function TrailingCount({ total, shown, className, style, ...rest }) {
  const styles = useTrailingCountStyles();
  const hasHidden = typeof shown === 'number' && shown < total;
  const text = hasHidden ? `共 ${total} · 显示 ${shown}` : `共 ${total}`;
  return (
    <Text
      {...rest}
      size={200}
      className={mergeClasses(styles.count, className)}
      style={style}
      aria-label={hasHidden ? `共 ${total} 项，显示 ${shown} 项` : `共 ${total} 项`}
      data-trailing-count="true"
    >
      {text}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* MiniBars（迷你条带）                                                 */
/* ------------------------------------------------------------------ */

/** 数据可视化的最小可见百分比：0 值不画，非 0 至少露出 10%（不是设计尺寸） */
const MINI_BAR_VISIBLE_PERCENT = 10;

const useMiniBarsStyles = makeStyles({
  root: {
    display: 'grid',
    columnGap: tokens.spacingHorizontalXS,
    alignItems: 'end',
    width: '100%',
    minWidth: 0,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  /** 轨道：默认 24 高（spacingVerticalXXL），tall 为 32 高（XXXL）；条宽上限 32 */
  track: {
    display: 'flex',
    alignItems: 'flex-end',
    width: '100%',
    maxWidth: tokens.spacingHorizontalXXXL,
    height: tokens.spacingVerticalXXL,
    marginInline: 'auto',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
    overflow: 'hidden',
  },
  trackTall: {
    height: tokens.spacingVerticalXXXL,
  },
  /** 条色只有中性两档：今天 fg1，其余 fg3；高度按数据百分比（数据驱动，不是设计值） */
  fill: {
    display: 'block',
    width: '100%',
    backgroundColor: tokens.colorNeutralForeground3,
    borderRadius: tokens.borderRadiusSmall,
  },
  fillToday: {
    backgroundColor: tokens.colorNeutralForeground1,
  },
  label: {
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground3,
  },
});

/**
 * 迷你条带：N 列（默认数据长度，久坐 7 天 / 天气 7 天都用 7），每列一根竖条。
 *
 * 条宽由列宽与上限（32）决定，列间距 4，轨道 24 或 32 高；颜色只有中性两档，
 * 今天（`todayIndex`，默认最后一列）用 fg1，其余 fg3。组件自带 `role="img"` 与
 * `aria-label`，不给 ariaLabel 时用「最近 N 项数据，最高 X」兜底。
 *
 * 高度百分比是**数据**归一化结果（value / max），不是设计值；0 值不画条。
 *
 * 用法：
 *   <MiniBars values={[12, 40, 30, 0, 55, 48, 61]} labels={['18','19','20','21','22','23','今天']} ariaLabel="最近 7 天久坐" />
 *
 * @param {object} props
 * @param {number[]} props.values 每列数值（长度 = 列数）
 * @param {React.ReactNode[]} [props.labels] 每列底部标签（给就渲染，Base200 fg3）
 * @param {number} [props.max] 归一化上限；缺省取 values 最大值（至少 1）
 * @param {number|null} [props.todayIndex] 高亮列（默认最后一列；传 null 不高亮）
 * @param {'default'|'tall'} [props.size='default'] 轨道 24 / 32
 * @param {string} [props.ariaLabel]
 */
export function MiniBars({
  values = [],
  labels,
  max,
  todayIndex,
  size = 'default',
  ariaLabel,
  className,
  style,
  ...rest
}) {
  const styles = useMiniBarsStyles();
  const items = Array.isArray(values) ? values.map((value) => Number(value) || 0) : [];
  if (items.length === 0) return null;

  const declaredMax = Number(max);
  const peak = Math.max(1, declaredMax > 0 ? declaredMax : Math.max(...items));
  const lastIndex = items.length - 1;
  const highlightIndex = todayIndex === undefined ? lastIndex : todayIndex;
  const tall = size === 'tall';

  return (
    <div
      {...rest}
      role="img"
      aria-label={ariaLabel || `最近 ${items.length} 项数据，最高 ${Math.round(peak)}`}
      className={mergeClasses(styles.root, className)}
      style={{ ...style, gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      data-mini-bars={items.length}
    >
      {items.map((value, index) => {
        const isToday = index === highlightIndex;
        const percent =
          value > 0 ? Math.max(MINI_BAR_VISIBLE_PERCENT, Math.round((value / peak) * 100)) : 0;
        const label = Array.isArray(labels) ? labels[index] : undefined;
        return (
          <div
            key={index}
            className={styles.column}
            data-mini-bar={index}
            data-mini-bar-today={isToday ? 'true' : undefined}
          >
            <div className={mergeClasses(styles.track, tall && styles.trackTall)}>
              <span
                className={mergeClasses(styles.fill, isToday && styles.fillToday)}
                style={{ height: `${percent}%` }}
                aria-hidden="true"
              />
            </div>
            {label !== undefined && label !== null ? (
              <Text size={200} className={styles.label}>
                {label}
              </Text>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HeroProgress（4px 进度带）                                           */
/* ------------------------------------------------------------------ */

const useHeroProgressStyles = makeStyles({
  root: {
    position: 'relative',
    flexShrink: 0,
    width: '100%',
    // 4 = strokeWidthThickest（见 HERO_PROGRESS_THICKNESS_PX 的说明）
    height: tokens.strokeWidthThickest,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground3,
    overflow: 'hidden',
  },
  fill: {
    display: 'block',
    height: '100%',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground,
  },
});

/**
 * 卡片内的 4px 进度带：只有 `active`（计时器 running）时出画。
 *
 * 非 active 时整个组件保留原来的盒子（`visibility:hidden`），因此暂停/继续
 * 不产生高度重排，也不产生任何 brand 像素。绘制颜色固定 `colorBrandBackground`，
 * 不接收颜色参数——accent 的判定输入只有「是否运行中」。
 *
 * 值域按 0–1 归一化（与 pomodoro 的 `snapshot.progress` 一致），宽度用百分比。
 * 宽度过渡 100ms（durationFaster）+ curveEasyEase；reduced-motion 下不做过场。
 *
 * 用法：
 *   <HeroProgress value={snapshot.progress} active={snapshot.running} label="本轮进度" />
 *
 * @param {object} props
 * @param {number} [props.value=0] 0–1 的进度
 * @param {boolean} [props.active=true] false = 保占位不出画（visibility:hidden）
 * @param {string} [props.label='进度'] 读屏文案
 */
export function HeroProgress({
  value = 0,
  active = true,
  label = '进度',
  className,
  style,
  ...rest
}) {
  const styles = useHeroProgressStyles();
  const reduced = useReducedMotion();
  const numeric = Number(value);
  const ratio = Number.isFinite(numeric) ? Math.min(1, Math.max(0, numeric)) : 0;
  const percent = Math.round(ratio * 100);
  const fillMotion = reduced
    ? null
    : {
        transitionProperty: 'width',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,
      };

  return (
    <div
      {...rest}
      role={active ? 'progressbar' : undefined}
      aria-label={active ? label : undefined}
      aria-valuemin={active ? 0 : undefined}
      aria-valuemax={active ? 100 : undefined}
      aria-valuenow={active ? percent : undefined}
      aria-hidden={active ? undefined : 'true'}
      className={mergeClasses(styles.root, className)}
      style={{ ...style, ...(active ? null : { visibility: 'hidden' }) }}
      data-hero-progress={active ? 'active' : 'idle'}
    >
      <span
        className={styles.fill}
        style={{ width: `${percent}%`, ...fillMotion }}
        data-hero-progress-fill="true"
      />
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
 * 统一 44px 触控目标的 Fluent Button。高频快捷操作（开始/暂停、我起来了、添加…）用它。
 * 其他 Fluent Button 属性原样透传；仍由 Fluent 处理 hover/pressed/focus/disabled。
 *
 * 用法：
 *   <TouchButton appearance="secondary" icon={<Play20Regular />} onClick={start}>开始</TouchButton>
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
    // 宿主 DialogContent 已给 16，插件骨架横向归零，避免叠出第二条内容轴
    paddingInline: 0,
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
    paddingInline: 0,
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
    paddingInline: 0,
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
    paddingInline: 0,
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
    paddingInline: 0,
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
    paddingInline: 0,
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
    paddingInline: 0,
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
 *       <ActionButton appearance="secondary" onClick={() => { save(); close(); }}>保存</ActionButton>
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
