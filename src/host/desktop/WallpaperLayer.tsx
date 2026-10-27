/**
 * 桌面壁纸层（v0.6.0）：必应每日壁纸 / 本机图片 + 壁纸说明 + 欣赏壁纸模式入口。
 *
 * 数据来自 `shell/wallpaper.ts` 的 `useWallpaper()`：
 * - auto / pinned 用 `state.current`（`imageUrl`、`title`、`copyright`）；
 * - local 用 `state.local`（`url`、`name`、`caption`）。
 *
 * 说明条是「欣赏壁纸」模式的唯一入口：按钮自身保持 26 高的视觉尺寸（这个高度会
 * 通过 `reportFooterPillHeight` 反向驱动桌面网格，不能改），44×44 的命中区由
 * `::after` 绝对定位外扩，不占布局、不改 padding。按下反馈只加
 * `transform: scale(0.98)`（transform 不改变 border-box，H_p 仍为 26），高度测量
 * 因此改用 `offsetHeight`，不量会受 transform 影响的 `getBoundingClientRect()`。
 *
 * A2（v0.8.0）：非欣赏态说明条只有一个按钮（无 chevron）；进入欣赏壁纸后出现 chevron
 * 并默认展开详情（日期/来源 + AI 说明，正文两端对齐；标题/版权只在底部 pill 行出现，
 * 不重复）。展开卡是浮层，不参与布局测量，H_p 仍为 26。说明刷新在设置页，不在这里。
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { makeStyles, mergeClasses, motionTokens, Spinner, tokens } from '@fluentui/react-components';
import { ChevronDown20Regular, ChevronUp20Regular } from '@fluentui/react-icons';

import { useWallpaperNote } from '../agent/oneshot/describeWallpaper';
import { MessageContent } from '../agent/ui/MessageContent';
import { useReducedMotion } from '../agent/ui/useReducedMotion';
import { SURFACE_HOVER_SCALE, SURFACE_PRESS_SCALE, TOUCH_TARGET, TOUCH_TARGET_CSS } from '../design/metrics';
import {
  FOOTER_PILL_ESTIMATE,
  computeGridMetrics,
  layoutFrame,
  reportFooterPillHeight,
  useFooterPillHeight,
} from '../layout';
import type { WallpaperEntry, WallpaperState } from '../shell/wallpaper';
import type { ColorScheme } from '../shell/themeMode';

/**
 * 说明条视觉高度（首帧估计）= 26，命中区目标 44。
 *
 * 绝对定位伪元素的包含块是按钮的 padding box，而按钮有 1px 描边；
 * 因此从 26 的 border-box 外扩到 44，除 `(44 - 26) / 2 = 9` 外还要再减一条描边，
 * 实际 inset 为 calc(-9px - strokeWidthThin) ≈ -10px。式子保留 9 的来源，
 * 不写死 `-10px`。
 */
const CREDIT_HIT_INSET = `calc(-${(TOUCH_TARGET - FOOTER_PILL_ESTIMATE) / 2}px - ${tokens.strokeWidthThin})`;

/**
 * 说明行里解释文本的宽度上限：12×XXXL=384，窄屏再用网格两侧留白夹住，
 * 并给右侧 44×44「重新生成说明」按钮与一个间距留位。
 * 1440 宽下先命中 384 上限，解释文本视觉宽度与旧实现一致（按钮不吃文本宽度）。
 */
const NOTE_MAX_WIDTH = `min(calc(${tokens.spacingHorizontalXXXL} * 12), calc(100vw - ${tokens.spacingHorizontalXL} * 2 - ${TOUCH_TARGET_CSS} - ${tokens.spacingHorizontalS}))`;

/** 手动重新生成说明的入口：图标按钮没有可见文字，名称只从 aria-label 来 */
const REGENERATE_NOTE_LABEL = '重新生成说明';

const useWallpaperStyles = makeStyles({
  root: {
    position: 'fixed',
    inset: 0,
    /*
     * 最底层：壁纸只做背景，不许盖住任何可交互元素。
     * 层级取 `--wtsl-layer-wallpaper`（styles.css 里的层级约定），未定义时回落到 0；
     * 换层级只改变量，不在各处写 z-index 字面量。
     */
    zIndex: 'var(--wtsl-layer-wallpaper, 0)',
    overflow: 'hidden',
    // 图片未到/失败时的 Fluent 中性底色（不写死颜色）
    backgroundColor: tokens.colorNeutralBackground3,
    pointerEvents: 'none',
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    // 用户要求：比例不匹配用填充（cover），不拉伸
    objectFit: 'cover',
    objectPosition: 'center',
    // 图片层自己不拦指针：壁纸是纯背景，点击/拖拽要透到桌面层
    pointerEvents: 'none',
  },
  scrim: {
    position: 'absolute',
    inset: 0,
    // Fluent 语义遮罩色；不同亮暗只调强度，不新增颜色
    backgroundColor: tokens.colorBackgroundOverlay,
    // 遮罩同样不拦指针（根节点已设，这里显式声明，避免以后有人挪动 DOM 时丢掉）
    pointerEvents: 'none',
  },
  /*
   * 说明 pill 的**定位壳**：它就是 `layoutFrame().pill` 那一行——左缘与网格齐平、
   * 上缘 = 网格下缘 + 一个 widget gutter（g）、高度 = pill 实测高度 H_p。
   *
   * 对齐口径：**下缘**。壳高恒等于 H_p，pill 用 `align-items: flex-end` 贴在壳底，
   * 而 chat 入口的下缘同样取这一行的下缘（`layoutFrame().entry` 的 y + size），
   * 所以两者下缘落在同一条线上（= pill.bottom）——由同一个值推导，不是两套规则。
   * 不用 transform 补偿，也不写死像素；pill 自身高度由文字内容决定，壳跟着它走。
   */
  creditDock: {
    position: 'absolute',
    // 与桌面层同一层级（样式层级约定的唯一来源在 styles.css）：
    // 要压在壁纸之上、又要低于 Agent 面板（--wtsl-layer-overlay）
    zIndex: 'var(--wtsl-layer-desktop)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    pointerEvents: 'none',
  },
  /** 说明条与其上方解释文本 / 重新生成按钮的定位上下文；自身高度只由按钮决定 */
  creditStack: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    minWidth: 0,
    maxWidth: '100%',
  },
  /**
   * 说明条按钮。视觉尺寸（padding / border / 行高）与旧 div 完全一致；
   * 只额外加 `::after` 命中区、hover/active 底色、按下形变和键盘焦点环。
   *
   * 按下反馈用 `transform: scale(0.985)`（TOKEN-MAP §11 的 C 值，与卡片 pressed 同档）：
   * transform 只走合成层，**不改变 border-box**，所以 H_p（26）与依赖它的
   * `reportFooterPillHeight` 布局输入完全不变；44×44 命中区仍由 `::after` 外扩，
   * 不靠改 padding / border / 高度换反馈。
   *
   * 时长与曲线只用 motionTokens（MOTION §1）：base = 离开 / 回弹 100ms
   * `curveAccelerateMin`；`:hover` 进入 100ms `curveDecelerateMin`（松手后若仍
   * hover，回弹也落在这一档）；按下 50ms `curveAccelerateMin` 在 `creditPressable`。
   * reduced-motion 不合并 `creditPressable`，只保留 100ms 颜色变化（MOTION §7 / §160）。
   */
  credit: {
    appearance: 'none',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    // 旧 pill 的 420 上限：用 spacing token 组合出同值（13×32 + 4）
    maxWidth: `calc(${tokens.spacingHorizontalXXXL} * 13 + ${tokens.spacingHorizontalXS})`,
    boxSizing: 'border-box',
    margin: 0,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusCircular,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 78%, transparent)`,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow4,
    pointerEvents: 'auto',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    textAlign: 'left',
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    transformOrigin: 'center center',
    // transform 不参与布局：过渡它不触发重排，H_p 不会在按下/松手时抖动
    transitionProperty: 'transform, background-color, border-color',
    // base 档 = hover 离开 / 松手回弹：100ms 加速（MOTION §1「悬停离开」）
    transitionDuration: `${motionTokens.durationFaster}ms`,
    transitionTimingFunction: motionTokens.curveAccelerateMin,
    ':hover': {
      backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 88%, transparent)`,
      // hover 进入 100ms 减速（MOTION §1「悬停进入」）
      transitionDuration: `${motionTokens.durationFaster}ms`,
      transitionTimingFunction: motionTokens.curveDecelerateMin,
    },
    ':active': {
      backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 72%, transparent)`,
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
    },
    /*
     * 44×44 命中区：伪元素绝对定位外扩，不改变按钮 border-box。
     * 这是说明条高度能继续作为布局输入（H_p=26）的前提。
     */
    '::after': {
      content: "''",
      position: 'absolute',
      inset: CREDIT_HIT_INSET,
      borderRadius: tokens.borderRadiusCircular,
      pointerEvents: 'auto',
    },
  },
  /**
   * 按下形变单独成类：reduced-motion 下不合并这个类，transform 就完全不存在。
   * 这样不需要用「后定义的 :active 覆盖前一条」的顺序技巧——那依赖 Griffel 的规则
   * 插入次序，重构样式时容易失效。
   */
  creditPressable: {
    ':active': {
      transform: `scale(${SURFACE_PRESS_SCALE})`,
      // 按下 50ms 加速（MOTION §1「按下」）；松手后由 base / :hover 档回弹
      transitionDuration: `${motionTokens.durationUltraFast}ms`,
      transitionTimingFunction: motionTokens.curveAccelerateMin,
    },
  },
  /** reduced-motion：不做任何 transform，只保留 100ms 颜色变化（MOTION §7 / §160） */
  creditReduced: {
    transitionProperty: 'background-color, border-color',
  },
  /** 文本裁切放在内层：按钮本身必须 overflow:visible，伪元素命中区才不会被裁掉 */
  creditContent: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  creditLine: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  creditDivider: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
  creditTitle: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground2,
    fontWeight: tokens.fontWeightSemibold,
  },
  creditMeta: {
    color: tokens.colorNeutralForeground3,
  },
  /**
   * 壁纸说明（A2）：同一个表面容器承载「非欣赏 pill / 欣赏态展开卡」。
   * 材质与 widget 卡片同源：72% 中性面 + blur 24 + stroke2 + shadow4；
   * hover 1.02 + shadow8 + stroke1、pressed 0.98（数值来自 design/metrics，不在此写字面量）。
   * 非欣赏态没有 chevron；欣赏态默认展开、chevron 只负责折叠。
   */
  noteShell: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    // creditDock 是整层 pointer-events:none（壁纸说明不是桌面手势区）；表面本身必须显式恢复
    // auto，否则整条说明条不可点（旧 credit 按钮样式里有这条，A2 重写时遗漏）。
    pointerEvents: 'auto',
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 72%, transparent)`,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow4,
    borderRadius: tokens.borderRadiusCircular,
    transformOrigin: 'left bottom',
    overflow: 'visible',
    transitionProperty: 'width, height, border-radius, box-shadow, border-color, transform',
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
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionProperty: 'background-color, border-color, box-shadow',
      ':hover': { transform: 'none' },
      ':active': { transform: 'none' },
    },
  },
  noteShellExpanded: {
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
  },
  noteDetail: {
    display: 'flex',
    flexDirection: 'column',
    // 关键：不能被父级 flex 压缩，否则 offsetHeight 量到的是被压扁的高度 → shell 高度跟着变矮，
    // 说明正文被裁进滚动区（实测 v0.8.0 首版只显示日期行 + 滚动条箭头）。
    flex: '0 0 auto',
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalM} ${tokens.spacingVerticalM}`,
    overflowY: 'auto',
    maxHeight: '60vh',
    overscrollBehavior: 'contain',
    // 触控产品不显示经典滚动条（与 Agent 消息列表同口径），滑动仍可滚动
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      width: 0,
      height: 0,
    },
  },
  noteDate: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    textAlign: 'left',
  },
  noteBody: {
    margin: 0,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    // 中文正文两端对齐：左右轴与说明条内容带对齐（最后一行自然左对齐）
    textAlign: 'justify',
    textAlignLast: 'left',
  },
  noteRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    height: `${FOOTER_PILL_ESTIMATE}px`,
    flexShrink: 0,
  },
  noteMain: {
    appearance: 'none',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    flex: '1 1 auto',
    height: `${FOOTER_PILL_ESTIMATE}px`,
    margin: 0,
    border: 0,
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    color: 'inherit',
    paddingBlock: 0,
    paddingInline: tokens.spacingHorizontalM,
    cursor: 'pointer',
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    whiteSpace: 'nowrap',
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
      borderRadius: tokens.borderRadiusCircular,
    },
  },
  noteMainExpanded: {
    flex: '0 0 auto',
    justifyContent: 'flex-start',
    paddingInline: `${tokens.spacingHorizontalM} 0`,
  },
  noteTitle: {
    color: tokens.colorNeutralForeground2,
    fontWeight: tokens.fontWeightSemibold,
  },
  noteMeta: {
    color: tokens.colorNeutralForeground3,
  },
  noteChevron: {
    appearance: 'none',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: `${FOOTER_PILL_ESTIMATE}px`,
    margin: 0,
    border: 0,
    padding: 0,
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    flexShrink: 0,
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    ':hover': { color: tokens.colorNeutralForeground1 },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
      borderRadius: tokens.borderRadiusMedium,
    },
    '::after': {
      content: "''",
      position: 'absolute',
      left: `-${tokens.spacingHorizontalM}`,
      right: `-${tokens.spacingHorizontalM}`,
      top: '50%',
      height: TOUCH_TARGET_CSS,
      transform: 'translateY(-50%)',
    },
  },
  noteLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  noteError: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
});

export interface WallpaperLayerProps {
  wallpaper: WallpaperState;
  colorScheme: ColorScheme;
}

interface WallpaperImage {
  key: string;
  url: string;
  mode: 'local' | 'remote';
}

function resolveImage(wallpaper: WallpaperState): WallpaperImage | null {
  if (wallpaper.mode === 'local') {
    if (!wallpaper.local?.url) return null;
    return { key: wallpaper.local.key, url: wallpaper.local.url, mode: 'local' };
  }
  const entry = wallpaper.current;
  if (!entry) return null;
  return { key: entry.key, url: entry.imageUrl, mode: 'remote' };
}

/** 全屏壁纸层：画在桌面内容下方，不拦指针。 */
export function WallpaperLayer({ wallpaper, colorScheme }: WallpaperLayerProps) {
  const styles = useWallpaperStyles();
  const image = resolveImage(wallpaper);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const handleError = useCallback(() => {
    setFailedKey(image?.key ?? null);
  }, [image?.key]);
  const visible = Boolean(image && failedKey !== image.key);

  return (
    <div className={styles.root} aria-hidden="true" data-wallpaper-layer="true">
      {visible && image ? (
        <img
          className={styles.image}
          src={image.url}
          alt=""
          draggable={false}
          decoding="async"
          onError={handleError}
          data-wallpaper-mode={image.mode}
        />
      ) : null}
      {/* 暗色压暗以保证小组件上的文字可读；亮色只做极轻的压暗 */}
      <div className={styles.scrim} style={{ opacity: colorScheme === 'light' ? 0.06 : 0.24 }} />
    </div>
  );
}

/** 屏幕尺寸（与桌面层同一口径：宿主根满屏无内边距 → window.innerWidth/Height） */
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

interface CreditModel {
  title: string;
  location: string;
  full: string;
}

/** 从版权串提取地点短句（保留旧说明条的两段式展示，不把作者压到脸上） */
function locationOf(copyright: string): string {
  const withoutAuthor = copyright.split(/\s*[（(]/)[0]?.trim() ?? '';
  return withoutAuthor
    .split(/[，,]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join('，');
}

function resolveCredit(wallpaper: WallpaperState): CreditModel | null {
  if (wallpaper.mode === 'local') {
    const local = wallpaper.local;
    if (!local) return null;
    const caption = local.caption.trim();
    const name = local.name.trim();
    if (!caption && !name) return null;
    // 本机图片没有版权串；说明文字本身就是标题，不重复拼进 aria-label。
    return { title: caption || name, location: '', full: '' };
  }

  const entry: WallpaperEntry | null = wallpaper.current;
  if (!entry) return null;
  const title = entry.title.trim() || '必应壁纸';
  return { title, location: locationOf(entry.copyright), full: entry.copyright.trim() };
}

/**
 * 展开宽度的增量：spacing 8 + chevron 图标 20（与 `tokens.spacingHorizontalS` 同值；
 * chevron 的 44×44 命中区由样式外扩，不参与布局宽度）。
 */
const NOTE_CHEVRON_SIZE = 20;
const NOTE_CHEVRON_GAP = 8;
const NOTE_EXPAND_DELTA = NOTE_CHEVRON_SIZE + NOTE_CHEVRON_GAP;

/**
 * 壁纸说明（左下角，A2）。
 *
 * - 非欣赏态：整条 pill 是一个按钮（点击进入欣赏壁纸），无 chevron、无省略号，
 *   宽度跟文字、短标题走 min-width；
 * - 欣赏态：出现 chevron，进入默认展开详情（日期/来源 + AI 说明；标题/版权不重复，
 *   正文两端对齐），底部 pill 行保留：文字区 = 退出欣赏，chevron = 折叠；
 * - 展开卡是浮层：`H_p` 恒 26，网格 / Agent 入口 / 状态栏不动；点外部或 Esc 收起。
 * - 说明刷新在设置页，不在这里；说明走 Agent 现有 Markdown 渲染器。
 */
export interface WallpaperCreditProps {
  wallpaper: WallpaperState;
  gallery: boolean;
  captionHidden: boolean;
  onToggleGallery: () => void;
}

export function WallpaperCredit({
  wallpaper,
  gallery,
  captionHidden,
  onToggleGallery,
}: WallpaperCreditProps) {
  const styles = useWallpaperStyles();
  const credit = useMemo(() => resolveCredit(wallpaper), [wallpaper]);
  const viewport = useViewportSize();
  const pillHeight = useFooterPillHeight();
  const reducedMotion = useReducedMotion();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLButtonElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = useState(false);
  /** 非欣赏态（无 chevron）的 pill 宽度：展开宽度 = 它 + 28 */
  const [baseWidth, setBaseWidth] = useState(0);
  const [detailHeight, setDetailHeight] = useState(0);
  const [showSpinner, setShowSpinner] = useState(false);

  const metrics = useMemo(
    () => computeGridMetrics(viewport.width, viewport.height),
    [viewport.width, viewport.height],
  );
  const frame = useMemo(
    () => layoutFrame(metrics, viewport.width, viewport.height, pillHeight),
    [metrics, viewport.width, viewport.height, pillHeight],
  );
  const { pill } = frame;

  const localCaption = wallpaper.mode === 'local' ? (wallpaper.local?.caption?.trim() ?? '') : '';

  // 只有欣赏态展开时才请求说明（收起/非欣赏态不产生请求）
  const noteInput = useMemo(() => {
    if (!gallery || !expanded || !credit || captionHidden) return null;
    if (wallpaper.mode === 'local') return null;
    const entry = wallpaper.current;
    if (!entry) return null;
    return {
      key: entry.key,
      market: entry.market,
      title: entry.title,
      copyright: entry.copyright,
      date: entry.date,
      imageUrl: entry.imageUrl,
    };
  }, [captionHidden, credit, expanded, gallery, wallpaper.current, wallpaper.mode]);

  const { text: noteText, status: noteStatus } = useWallpaperNote(noteInput);

  // 欣赏模式 = 默认展开；退出 = 收起
  useEffect(() => {
    setExpanded(gallery);
  }, [gallery]);

  // 加载超过 1s 才显示 Spinner（FLUENT2 §12 等待阈值；文案先出现，不闪）
  useEffect(() => {
    if (noteStatus !== 'loading') {
      setShowSpinner(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setShowSpinner(true), 1000);
    return () => window.clearTimeout(timer);
  }, [noteStatus]);

  // 非欣赏态测一次 pill 宽度（欣赏态有 chevron，宽度不同，不在这里测）
  useLayoutEffect(() => {
    if (gallery || expanded) return undefined;
    const element = shellRef.current;
    if (!element) return undefined;
    const measure = () => setBaseWidth(Math.round(element.offsetWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [credit?.title, credit?.location, expanded, gallery]);

  // 展开区高度（说明异步到达/失败都会改高度）
  useLayoutEffect(() => {
    if (!expanded) {
      setDetailHeight(0);
      return undefined;
    }
    const element = detailRef.current;
    if (!element) return undefined;
    const measure = () => setDetailHeight(Math.round(element.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded, noteStatus, noteText, localCaption]);

  // H_p 只测底部 pill 行（26）：展开区是浮层，不能参与布局
  useEffect(() => {
    if (captionHidden || !credit) {
      reportFooterPillHeight(0);
      return undefined;
    }
    const element = mainRef.current;
    if (!element) return undefined;
    const measure = () => reportFooterPillHeight(element.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [captionHidden, credit, gallery]);

  // 展开时点外部 / Esc 收起（回到欣赏态 pill；不退出欣赏）
  useEffect(() => {
    if (!gallery || !expanded) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const shell = shellRef.current;
      if (!shell) return;
      if (event.target instanceof Node && shell.contains(event.target)) return;
      setExpanded(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded, gallery]);

  if (captionHidden || !credit) return null;

  const label = credit.full ? `壁纸：${credit.title}。${credit.full}` : `壁纸：${credit.title}`;
  const hasChevron = gallery;
  const shellWidth = baseWidth > 0 ? (hasChevron ? baseWidth + NOTE_EXPAND_DELTA : baseWidth) : undefined;
  const maxWidth = Math.max(0, frame.entry.x - metrics.gap - pill.left - metrics.gap);
  const shellStyle: CSSProperties = {
    width: shellWidth,
    height: expanded ? detailHeight + FOOTER_PILL_ESTIMATE : undefined,
    maxWidth,
  };
  const dateLabel =
    wallpaper.mode === 'local'
      ? ''
      : `${wallpaper.current?.date ?? ''}${wallpaper.current?.date ? ' · ' : ''}必应每日壁纸`;
  const noteClassName = mergeClasses(styles.noteShell, expanded && styles.noteShellExpanded);

  let body: ReactNode;
  if (wallpaper.mode === 'local') {
    body = (
      <div className={styles.noteBody}>
        {localCaption || '本机图片没有说明文字'}
      </div>
    );
  } else if (noteStatus === 'loading') {
    body = (
      <div className={styles.noteLoading}>
        {showSpinner ? <Spinner size="extra-tiny" /> : null}
        <span>正在生成说明…</span>
      </div>
    );
  } else if (noteStatus === 'failed') {
    body = <div className={styles.noteError}>说明暂时无法生成</div>;
  } else {
    body = <div className={styles.noteBody}><MessageContent text={noteText ?? ''} /></div>;
  }

  return (
    <div
      className={styles.creditDock}
      style={{ left: pill.left, top: pill.top, width: pill.width, height: pill.height }}
    >
      <div className={styles.creditStack}>
        <div
          ref={shellRef}
          className={noteClassName}
          style={shellStyle}
          data-wallpaper-note-shell="true"
          data-expanded={expanded ? 'true' : undefined}
          data-reduced-motion={reducedMotion ? 'true' : undefined}
        >
          {expanded ? (
            <div
              ref={detailRef}
              className={styles.noteDetail}
              data-wallpaper-note="true"
              aria-live="polite"
            >
              {dateLabel ? <div className={styles.noteDate}>{dateLabel}</div> : null}
              {body}
            </div>
          ) : null}
          <div className={styles.noteRow}>
            <button
              ref={mainRef}
              type="button"
              className={mergeClasses(styles.noteMain, expanded && styles.noteMainExpanded)}
              aria-label={label}
              aria-pressed={gallery}
              onClick={(event) => {
                // 把焦点收回宿主文档，确保 iframe 里的旧焦点不会吞掉 Esc
                event.currentTarget.focus({ preventScroll: true });
                onToggleGallery();
              }}
            >
              <span className={styles.noteTitle}>{credit.title}</span>
              {credit.location ? (
                <span className={styles.noteMeta}>&nbsp;·&nbsp;{credit.location}</span>
              ) : null}
            </button>
            {hasChevron ? (
              <button
                type="button"
                className={styles.noteChevron}
                aria-label={expanded ? '收起说明' : '展开说明'}
                aria-expanded={expanded}
                onClick={() => setExpanded((previous) => !previous)}
              >
                {expanded ? (
                  <ChevronDown20Regular aria-hidden="true" />
                ) : (
                  <ChevronUp20Regular aria-hidden="true" />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
