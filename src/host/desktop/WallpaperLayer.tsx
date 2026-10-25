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
 * `transform: scale(0.985)`（transform 不改变 border-box，H_p 仍为 26），高度测量
 * 因此改用 `offsetHeight`，不量会受 transform 影响的 `getBoundingClientRect()`。
 *
 * 解释文本只在欣赏壁纸模式下出现，位置在说明条上方；文本右侧的「重新生成说明」
 * 按钮也挂在这条绝对定位的说明行里，两者都不参与布局测量，因此不会改变说明条
 * 高度或网格几何。文本走 Agent 现有 Markdown 渲染器。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { makeStyles, mergeClasses, motionTokens, tokens } from '@fluentui/react-components';
import { ArrowClockwise20Regular } from '@fluentui/react-icons';

import { useWallpaperNote } from '../agent/oneshot/describeWallpaper';
import { MessageContent } from '../agent/ui/MessageContent';
import { useReducedMotion } from '../agent/ui/useReducedMotion';
import { TOUCH_TARGET, TOUCH_TARGET_CSS } from '../design/metrics';
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
      transform: 'scale(0.985)',
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
   * 解释文本：由 noteRow 绝对定位在说明条上方，自身不参与 pill 高度测量。
   *
   * 材质与说明条同一套（半透明中性面 + 单一 blur token + 大圆角），否则 14px 文字
   * 直接压在必应照片上，亮天/雪景下的对比度会低于 FLUENT2 §10 的 4.5:1。
   * 动效按 MOTION §1「常规进出」：`durationNormal`(200) + `curveDecelerateMid`，
   * **不设延迟**（§8「禁止为动画延迟内容渲染」，120ms 曾是自造时长）。
   * 宽度仍按内容收缩（max-content），上限见 NOTE_MAX_WIDTH（已给右侧按钮留位）。
   */
  note: {
    width: 'max-content',
    maxWidth: NOTE_MAX_WIDTH,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 78%, transparent)`,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow4,
    color: tokens.colorNeutralForeground1,
    opacity: 0,
    transform: `translateY(${tokens.spacingVerticalSNudge})`,
    pointerEvents: 'none',
    transitionProperty: 'opacity, transform',
    transitionDuration: `${motionTokens.durationNormal}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
  },
  /**
   * 说明行：解释文本 + 手动「重新生成说明」按钮的定位壳。
   *
   * 绝对定位在说明条上方（left/bottom 与旧 note 相同），宽度 = 文本宽度：
   * 不占 creditStack 的布局，因此不进 H_p 测量、也不改 pill 几何。
   * 按钮在本壳内再绝对定位到文本右侧，所以按钮存在与否都不改变文本宽度。
   */
  noteRow: {
    position: 'absolute',
    left: 0,
    bottom: `calc(100% + ${tokens.spacingVerticalS})`,
    width: 'max-content',
    maxWidth: NOTE_MAX_WIDTH,
    pointerEvents: 'none',
  },
  noteVisible: {
    opacity: 1,
    transform: 'none',
  },
  /** 减少动效：100ms 纯 opacity，无位移（MOTION §7「≤100ms 淡入」） */
  noteReduced: {
    transform: 'none',
    transitionProperty: 'opacity',
    transitionDuration: `${motionTokens.durationFaster}ms`,
  },
  /**
   * 手动「重新生成说明」按钮（仅欣赏壁纸模式、有说明文本 / 加载中时出现）。
   *
   * 绝对定位在说明文本右侧（**自身** position:absolute），不参与 H_p 测量、
   * 不改 pill 几何；命中区 44×44 直接取 `TOUCH_TARGET_CSS`，不写裸 44。
   * 材质复用 note 的同一条表达式（78% 中性面 + 单一 blur token + shadow4），
   * 圆角/描边/前景色全部来自 tokens。按压只做颜色反馈（与说明条同一档 hover/active
   * 混合比例），不引入第二套缩放；时长用 motionTokens(durationFaster)。
   */
  regenerate: {
    position: 'absolute',
    // 贴在文本右缘外一个间距处，底边与文本行底边对齐
    left: `calc(100% + ${tokens.spacingHorizontalS})`,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: TOUCH_TARGET_CSS,
    height: TOUCH_TARGET_CSS,
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    appearance: 'none',
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 78%, transparent)`,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow4,
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    pointerEvents: 'auto',
    transitionProperty: 'background-color, border-color',
    transitionDuration: `${motionTokens.durationFaster}ms`,
    transitionTimingFunction: motionTokens.curveAccelerateMin,
    ':hover': {
      backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 88%, transparent)`,
      transitionTimingFunction: motionTokens.curveDecelerateMin,
    },
    ':active': {
      backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 72%, transparent)`,
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
    },
    ':disabled': {
      color: tokens.colorNeutralForegroundDisabled,
      cursor: 'default',
    },
  },
  /**
   * 加载中图标旋转：时长取 motionTokens 里最长的一档 `durationUltraSlow`(500) +
   * `curveLinear`，不新增裸毫秒数。reduced-motion 下不合并这个类——静态图标 + 禁用
   * 态颜色已是可见反馈，MOTION §7 不再加装饰动画。
   */
  regenerateSpin: {
    animationName: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    animationDuration: `${motionTokens.durationUltraSlow}ms`,
    animationTimingFunction: motionTokens.curveLinear,
    animationIterationCount: 'infinite',
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
 * 壁纸说明（左下角）：点击进入 / 退出「欣赏壁纸」模式。
 *
 * `captionHidden` 为真时整条不渲染（本机图片没有说明文字时同理，由 `credit === null` 体现）。
 * 这两种「没有说明条」的情形都必须上报 `H_p = 0`：`0` 在 `layout/footer` 里是**合法值**，
 * 语义是「没有说明条」，`layoutFrame` 据此不再预留 pill 行与 gutter，网格自己在视口内
 * 上下居中（1440×960 下上/下各 46）、入口下缘贴网格下缘。
 * 跳过上报会让布局停在最后一次实测的 26 上，出现上 27 / 下 65 的不对称。
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
  const pillRef = useRef<HTMLButtonElement | null>(null);
  const [noteVisible, setNoteVisible] = useState(false);
  /**
   * 最近一次成功取到的说明 + 它所属的图片 key。
   *
   * 手动刷新时 `useWallpaperNote` 会先把 `text` 置空并进入 loading；若此时按空文本渲染，
   * 说明行宽度会先塌成左右 padding、再随新文本恢复，右侧「重新生成」按钮会左右各跳一次。
   * 因此加载 / 失败期间继续显示**同一张图**的上一份说明：宽度和按钮位置都不动，也不涉及
   * H_p。用 key 同步判断，换图时旧文本不会串到新图上（不依赖 effect 的下一帧）。
   */
  const [lastNote, setLastNote] = useState<{ key: string; text: string } | null>(null);

  /**
   * 一次性说明只在欣赏壁纸模式、且当前是必应图时请求；本机图片没有模型可搜的元数据。
   */
  const noteInput = useMemo(() => {
    if (!gallery || !credit || captionHidden) return null;
    if (wallpaper.mode === 'local') return null;
    const entry = wallpaper.current;
    if (!entry) return null;
    return {
      key: entry.key,
      market: entry.market,
      title: entry.title,
      copyright: entry.copyright,
      date: entry.date,
      // 把今日壁纸本身一起发给模型（pro 多模态看图）
      imageUrl: entry.imageUrl,
    };
  }, [captionHidden, credit, gallery, wallpaper.current, wallpaper.mode]);

  const { text: noteText, status: noteStatus, refresh: refreshNote } = useWallpaperNote(noteInput);
  const noteKey = noteInput?.key ?? '';
  const hasCredit = Boolean(credit);
  /** 手动重新生成进行中：按钮禁用 + 图标旋转，给出可见但不新增长时的反馈 */
  const noteLoading = noteStatus === 'loading';
  /** 实际渲染的文本：新文本优先；加载/失败时回落到同一张图的上一份（避免按钮横向跳动） */
  const shownNoteText = noteText ?? (lastNote?.key === noteKey ? lastNote.text : null);
  /**
   * 手动入口只在欣赏壁纸模式、且已有说明文本或正在加载时显示。
   * 首轮就失败（没有任何可显示的文本）时不显示：入口只服务「重新生成」而不是「首次失败重试」。
   */
  const showRegenerate = gallery && (Boolean(shownNoteText) || noteLoading);

  // 换图（或退出再进入）时先回到隐藏态：同一张图会复用 lastNote 再淡入，换图则等新文本。
  useEffect(() => {
    setNoteVisible(false);
  }, [noteKey]);

  // 记录成功返回的文本，供加载 / 失败期间回退显示（key 一起存，换图后旧文本自动失效）。
  useEffect(() => {
    if (!noteText) return;
    setLastNote({ key: noteKey, text: noteText });
  }, [noteKey, noteText]);

  // 只观测 pill 自身：offsetHeight 是**布局 border-box**（padding + 描边 + 行高），
  // 不受按下时 `transform: scale(0.985)` 影响；不用 getBoundingClientRect().height——
  // 那量到的是缩放后的视觉高度（26×0.985≈25.6），经 reportFooterPillHeight 会把整个
  // 网格在按下/松手时抖动一次。H_p 的语义仍是 border-box=26。
  // 没有说明条时上报 0（= 无底部条，见组件文档），这样隐藏前后网格都对称。
  // hasCredit 入依赖：首帧壁纸还没到时组件返回 null，图片就绪后要重新挂观察器。
  useEffect(() => {
    if (captionHidden || !hasCredit) {
      reportFooterPillHeight(0);
      return undefined;
    }
    const element = pillRef.current;
    if (!element) return undefined;
    const measure = () => reportFooterPillHeight(element.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [captionHidden, hasCredit]);

  /**
   * 文本就绪后再切到可见态：元素先在 DOM 里以 opacity 0 挂一帧，
   * 下一帧加类名才会触发过渡（不做骨架屏 / spinner）。
   */
  useEffect(() => {
    if (!gallery || !shownNoteText) {
      setNoteVisible(false);
      return undefined;
    }
    if (noteVisible) return undefined;
    const frame = window.requestAnimationFrame(() => setNoteVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [gallery, shownNoteText, noteVisible]);

  const frame = useMemo(
    () =>
      layoutFrame(
        computeGridMetrics(viewport.width, viewport.height),
        viewport.width,
        viewport.height,
        pillHeight,
      ),
    [viewport.width, viewport.height, pillHeight],
  );
  const { pill } = frame;

  if (captionHidden || !credit) return null;

  const label = credit.full ? `壁纸：${credit.title}。${credit.full}` : `壁纸：${credit.title}`;
  const noteClassName = mergeClasses(
    styles.note,
    noteVisible && styles.noteVisible,
    reducedMotion && styles.noteReduced,
  );
  // 按下形变类只在允许动效时合并：reduced-motion 下按钮完全没有 transform（MOTION §7）
  const creditClassName = mergeClasses(
    styles.credit,
    !reducedMotion && styles.creditPressable,
    reducedMotion && styles.creditReduced,
  );

  return (
    <div
      className={styles.creditDock}
      style={{ left: pill.left, top: pill.top, width: pill.width, height: pill.height }}
    >
      <div className={styles.creditStack}>
        {gallery ? (
          <div className={styles.noteRow} data-wallpaper-note-row="true">
            <div
              className={noteClassName}
              data-wallpaper-note="true"
              aria-live="polite"
            >
              {shownNoteText ? <MessageContent text={shownNoteText} /> : null}
            </div>
            {showRegenerate ? (
              <button
                type="button"
                className={styles.regenerate}
                data-wallpaper-regen="true"
                data-wallpaper-regen-state={noteLoading ? 'loading' : 'ready'}
                aria-label={REGENERATE_NOTE_LABEL}
                aria-busy={noteLoading ? true : undefined}
                disabled={noteLoading}
                onClick={() => refreshNote()}
              >
                <ArrowClockwise20Regular
                  aria-hidden="true"
                  className={
                    noteLoading && !reducedMotion ? styles.regenerateSpin : undefined
                  }
                />
              </button>
            ) : null}
          </div>
        ) : null}
        <button
          ref={pillRef}
          type="button"
          className={creditClassName}
          data-wallpaper-credit="true"
          data-gallery={gallery ? 'true' : undefined}
          aria-pressed={gallery}
          aria-label={label}
          title={credit.full || undefined}
          onClick={(event) => {
            // 把焦点收回宿主文档，确保 iframe 里的旧焦点不会吞掉 Esc
            event.currentTarget.focus({ preventScroll: true });
            onToggleGallery();
          }}
        >
          <span className={styles.creditContent}>
            <span className={mergeClasses(styles.creditLine, styles.creditTitle)}>{credit.title}</span>
            {credit.location ? (
              <>
                <span className={styles.creditDivider} aria-hidden="true">
                  ·
                </span>
                <span className={mergeClasses(styles.creditLine, styles.creditMeta)}>
                  {credit.location}
                </span>
              </>
            ) : null}
          </span>
        </button>
      </div>
    </div>
  );
}
