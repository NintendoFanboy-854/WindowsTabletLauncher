/**
 * 桌面壁纸层（v0.6.0）：必应每日壁纸 / 本机图片 + 壁纸说明 + 欣赏壁纸模式入口。
 *
 * 数据来自 `shell/wallpaper.ts` 的 `useWallpaper()`：
 * - auto / pinned 用 `state.current`（`imageUrl`、`title`、`copyright`）；
 * - local 用 `state.local`（`url`、`name`、`caption`）。
 *
 * A2（v0.8.0）：非欣赏态说明条只有一个按钮（无 chevron）；进入欣赏壁纸后出现 chevron
 * 并默认展开详情（日期/来源 + AI 说明，正文两端对齐；标题/版权只在底部 pill 行出现，
 * 不重复）。展开卡是浮层，不参与布局测量，H_p 仍为 26。
 *
 * v0.8.1 修正（真机回归）：
 * - 宽度不再靠「测量非欣赏态宽度 + 28」硬算：旧实现每次进出欣赏都会把过渡中的旧宽度
 *   测成新的基准，宽度逐轮 +28（越展开越长）。现在宽度完全由内容决定：
 *   非欣赏 = 文字 + 左右 padding；欣赏 = 同一内容 + gap 8 + chevron 20 + 行尾呼吸位 8，
 *   只向右 +36（右 8 是 chevron 图标与圆角边之间的呼吸位，否则图标贴边很难看）。
 * - 说明条的 hover/pressed 缩放移到**背景伪元素**上：缩放在布局盒之外发生，不移动按钮的
 *   命中区（旧实现按下时整壳缩到 0.98，chevron 从指针下移开，release 落在按钮外 →
 *   click 落到父级，展开按钮失效），文字也不再跟着放大发虚。
 * - 展开/收起改为「高度用 grid-template-rows 补间 + 内容淡入」：不再测量 detail 高度，
 *   也不做 width/height 的 layout 过渡（那是文字逐帧重排的拉伸感来源）；宽度随内容一次到位。
 * - 非欣赏态去掉行尾预留的 8px（只有欣赏态需要 chevron 右侧的呼吸位），左右 padding 对称。
 *
 * 说明条是「欣赏壁纸」模式的唯一入口：底部 pill 行视觉高度 26（这个高度会通过
 * `reportFooterPillHeight` 反向驱动桌面网格，不能改），44×44 的命中区由 chevron 的
 * `::after` 外扩，不占布局、不改 padding。说明刷新在设置页，不在这里。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { makeStyles, mergeClasses, motionTokens, Spinner, tokens } from '@fluentui/react-components';
import { ChevronDown20Regular, ChevronUp20Regular } from '@fluentui/react-icons';

import { useWallpaperNote } from '../agent/oneshot/describeWallpaper';
import { MessageContent } from '../agent/ui/MessageContent';
import { useReducedMotion } from '../agent/ui/useReducedMotion';
import { SURFACE_HOVER_SCALE, TOUCH_TARGET_CSS } from '../design/metrics';
import {
  FOOTER_PILL_ESTIMATE,
  computeGridMetrics,
  layoutFrame,
  reportFooterPillHeight,
  useFooterPillHeight,
} from '../layout';
import type { WallpaperEntry, WallpaperState } from '../shell/wallpaper';
import type { ColorScheme } from '../shell/themeMode';

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
  /** 说明条与其上方详情的定位上下文；自身高度只由内容决定 */
  creditStack: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    minWidth: 0,
    maxWidth: '100%',
  },
  /**
   * 壁纸说明（A2）：一个表面容器承载「非欣赏 pill / 欣赏态展开卡」。
   *
   * 材质与 widget 卡片同源（72% 中性面 + blur 24 + stroke2 + shadow4），但材质画在
   * `::before` 上、hover/pressed 的缩放也只作用于这一层：
   * - 缩放在布局盒之外发生，按钮（文字行 / chevron）的命中区不随按下缩小、不移位；
   * - 文字不参与缩放，1440×960 下不会因为 2% 放大发虚。
   * 背景色 / 描边 / 阴影状态与卡片一致（hover shadow8 + stroke1、pressed 0.98）。
   *
   * 宽度完全由内容决定（不写 width / 不测量）：
   * - 非欣赏：noteRow = 一个「标题 · 地点」按钮，左右 padding 对称（16 / 16）；
   * - 欣赏：同一按钮 + 8 gap + 20 chevron = 只增加 28，没有多余留白；
   * 展开/收起时宽度会随内容一次到位，高度才做补间（见 noteDetailWrap）。
   */
  noteShell: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    // creditDock 是整层 pointer-events:none（壁纸说明不是桌面手势区）；表面本身必须显式恢复
    // auto，否则整条说明条不可点（旧 credit 按钮样式里有这条，A2 重写时遗漏）。
    pointerEvents: 'auto',
    borderRadius: tokens.borderRadiusCircular,
    // hover 用**整壳**缩放（内容跟着放大，与 widget 卡 / 状态栏同一套表面状态机）；
    // pressed 不再缩放：按下时几何收缩会让 chevron 从指针下移开、click 丢目标
    // （v0.8.1 真机回归：pointerdown 命中 svg、click 落到祖先），按压反馈改用背景加深。
    transformOrigin: 'left bottom',
    transitionProperty: 'transform',
    transitionDuration: `${motionTokens.durationFaster}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMin,
    '::before': {
      content: "''",
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      borderRadius: 'inherit',
      backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 72%, transparent)`,
      backdropFilter: 'blur(var(--wtsl-material-blur))',
      border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
      boxShadow: tokens.shadow4,
      // 材质变化单独过渡，不跟整壳缩放混在一起
      transitionProperty: 'box-shadow, border, background-color',
      transitionDuration: `${motionTokens.durationFast}ms`,
      transitionTimingFunction: motionTokens.curveAccelerateMin,
      pointerEvents: 'none',
    },
    ':hover': {
      transform: `scale(${SURFACE_HOVER_SCALE})`,
      '::before': {
        boxShadow: tokens.shadow8,
        border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
        transitionDuration: `${motionTokens.durationFaster}ms`,
        transitionTimingFunction: motionTokens.curveDecelerateMin,
      },
    },
    ':active': {
      '::before': {
        backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 84%, transparent)`,
      },
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionProperty: 'background-color',
      ':hover': { transform: 'none' },
    },
  },
  /** 欣赏态：更大的圆角与阴影；展开卡不做 hover 缩放（大表面呼吸感） */
  noteShellExpanded: {
    borderRadius: tokens.borderRadius2XLarge,
    '::before': {
      boxShadow: tokens.shadow16,
      transitionDuration: `${motionTokens.durationGentle}ms`,
      transitionTimingFunction: motionTokens.curveDecelerateMid,
    },
    ':hover': {
      transform: 'none',
      '::before': {
        boxShadow: tokens.shadow16,
      },
    },
  },
  /**
   * 详情区外层：高度用 `grid-template-rows: 0fr → 1fr` 补间（grid 行可动画），
   * 内层 `min-height: 0 + overflow: hidden` 保证收起时高度归零、内容不溢出。
   * 不再测量 detail 高度（旧实现量到的是压缩后的错误高度，正文被裁）。
   */
  noteDetailWrap: {
    // 与 noteRow 一样抬到材质伪元素（z-index: 0 的定位层）之上：
    // 否则 backdrop-filter 的半透明面会盖住正常流里的说明文字（实测：内容在，视觉空白）。
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateRows: '0fr',
    opacity: 0,
    // 宽度不参与 shell 的 max-content 计算：否则说明正文（长段落、不换行的 max-content）
    // 会把展开卡撑到接近全屏宽（v0.8.1 真机回归截图）。宽 0 + min-width 100% 让详情
    // 始终等于底部 pill 行的宽度，正文在该宽度内换行。
    width: 0,
    minWidth: '100%',
    transitionProperty: 'grid-template-rows, opacity',
    transitionDuration: `${motionTokens.durationGentle}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0ms',
    },
  },
  noteDetailWrapOpen: {
    gridTemplateRows: '1fr',
    opacity: 1,
  },
  noteDetailInner: {
    minHeight: 0,
    overflow: 'hidden',
  },
  noteDetail: {
    display: 'flex',
    flexDirection: 'column',
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
  /** 底部 pill 行：非欣赏态只有一个撑满的按钮；欣赏态 = 文字按钮 + chevron（间距 8） */
  noteRow: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  /**
   * 欣赏态行尾呼吸位：chevron 图标 20 右侧留 8（与文字-图标间距同档），
   * 否则图标会贴着圆角右缘（视觉上像被裁掉）。非欣赏态没有 chevron，不加这个 padding，
   * 保证说明条左右 padding 对称。
   */
  noteRowGallery: {
    paddingRight: tokens.spacingHorizontalS,
  },
  noteMain: {
    appearance: 'none',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
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
    zIndex: 1,
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
    // 44×44 命中区由伪元素外扩，不占布局宽度（宽度只承担 20 的图标）
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
 * 壁纸说明（左下角，A2）。
 *
 * - 非欣赏态：整条 pill 是一个按钮（点击进入欣赏壁纸），无 chevron、无省略号；
 * - 欣赏态：出现 chevron，默认展开详情（日期/来源 + AI 说明；标题/版权不重复，
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

  const [expanded, setExpanded] = useState(false);
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
  const shellStyle: CSSProperties = {
    maxWidth: Math.max(0, frame.entry.x - metrics.gap - pill.left - metrics.gap),
  };
  const dateLabel =
    wallpaper.mode === 'local'
      ? ''
      : `${wallpaper.current?.date ?? ''}${wallpaper.current?.date ? ' · ' : ''}必应每日壁纸`;
  const noteClassName = mergeClasses(styles.noteShell, expanded && styles.noteShellExpanded);
  const detailWrapClassName = mergeClasses(
    styles.noteDetailWrap,
    expanded && styles.noteDetailWrapOpen,
  );

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
          {/*
            详情区始终挂载、用 grid 行高补间：展开时高度从 0fr 长到内容高，收起时缩回 0，
            不测量、不写死高度。收起态 aria-hidden + inert，内容不可聚焦/不可点。
          */}
          <div
            className={detailWrapClassName}
            aria-hidden={!expanded}
            inert={!expanded}
            data-wallpaper-note-detail="true"
          >
            <div className={styles.noteDetailInner}>
              <div className={styles.noteDetail} data-wallpaper-note="true" aria-live="polite">
                {dateLabel ? <div className={styles.noteDate}>{dateLabel}</div> : null}
                {body}
              </div>
            </div>
          </div>
          <div className={mergeClasses(styles.noteRow, gallery && styles.noteRowGallery)}>
            <button
              ref={mainRef}
              type="button"
              className={styles.noteMain}
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
            {gallery ? (
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
