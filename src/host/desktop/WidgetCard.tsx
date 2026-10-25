/**
 * 桌面上的一个小组件卡片。
 *
 * 正常模式：**无任何宿主 chrome**——卡片就是圆角 + 材质 + iframe 内容；
 * 只在悬停时于卡片顶部淡入一个极轻的拖拽提示（overlay，不占布局高度）。
 * 编辑模式：浮层才出现标题 + 删除 / 改尺寸 / 设置，并用 Fluent motionTokens 做进出过渡
 * （浮层常驻 DOM，靠 opacity/transform 过渡，避免退出时瞬间消失）。
 *
 * 卡片手势（E2 / MOTION §2）：
 * - iframe 内的指针事件由插件 SDK `useHostCardGesture` 转发成 `plugin:card-pointer`；
 * - 长按 500ms 由 SDK 检测并发 `plugin:request-edit-mode`，宿主这里只做视觉与进编辑，
 *   不再跑第二份长按计时器；
 * - 卡片状态机（hover / press / 长按 / 编辑模式）的 scale 全部作用在 Fluent Card 本体
 *   （宿主外层），iframe 及其内层内容不参与缩放（MOTION §2 / §10：卡片层动画在宿主外层完成）；
 *   缩放值、时长、曲线全部来自 MOTION §2 与 motionTokens。
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import {
  Button,
  Card,
  Menu,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  Tooltip,
  mergeClasses,
  motionTokens,
  tokens,
} from '@fluentui/react-components';
import {
  Delete20Regular,
  ReOrderDotsHorizontal20Regular,
  Resize20Regular,
  Settings20Regular,
} from '@fluentui/react-icons';
import type { HostBridge } from '../bridge';
import type {
  CardPointerPhase,
  CardPointerType,
  ThemePayload,
  WidgetInstance,
  WidgetSize,
} from '../bridge/types';
import type { GridMetrics } from '../layout';
import { useMediaQuery } from '../pages/shared/useMediaQuery';
import { withIdentityTheme } from '../plugins';
import type { IdentityHue } from '../plugins';
import { CARD_MATERIAL, CARD_RADIUS, useStyles } from './desktop.styles';
import { EDIT_CARD_SCALE, EDIT_TOUCH_TARGET } from './interaction';
import { WidgetFrame } from './WidgetFrame';
import type { WidgetFrameHandle } from './WidgetFrame';

/**
 * D-05 / FLUENT2 §9：可点元素不小于 44×44 CSS px。
 * 编辑模式卡片有 0.96 缩放，按钮布局尺寸要反算（EDIT_TOUCH_TARGET = ceil(44 / 0.96) = 46），
 * 屏幕上实测才不会低于 44。
 */
const TOUCH_TARGET: CSSProperties = {
  minWidth: EDIT_TOUCH_TARGET,
  minHeight: EDIT_TOUCH_TARGET,
};

/** MOTION §2 卡片状态机：hover 放大 1.5%，按下 0.985，长按线性下沉到 0.97 */
const HOVER_SCALE = 1.015;
const PRESS_SCALE = 0.985;
const LONG_PRESS_SCALE = 0.97;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** 按下 → holding 只需一个 50ms 的视觉阶段切换；长按 500ms 检测不在这里跑 */
type PressPhase = 'down' | 'holding';

export interface WidgetCardProps {
  widget: WidgetInstance;
  metrics: GridMetrics;
  origin: { x: number; y: number };
  editMode: boolean;
  /** 欣赏壁纸模式：只淡出 + 轻微下移，不改卡片几何 */
  gallery: boolean;
  focused: boolean;
  dragging: boolean;
  /** 插件管理器生成的 iframe 地址（PluginManager.widgetFrameSrc） */
  src: string;
  /** 宿主桥接层（iframe 的 API 调用、焦点交接都经过它） */
  bridge: HostBridge;
  /** FluentProvider 现读的主题 token（插件 init 用） */
  theme?: ThemePayload;
  /** manifest 声明的身份 hue；宿主映射成 shared palette 同档颜色再下发 */
  identityHue?: IdentityHue;
  notify(text: string): void;
  /** 插件 SDK 长按（plugin:request-edit-mode）→ 宿主进编辑模式并选中该卡 */
  onRequestEditMode(widget: WidgetInstance): void;
  onFocus(widget: WidgetInstance): void;
  onDelete(widget: WidgetInstance): void;
  onOpenSettings(widget: WidgetInstance): void;
  /** 插件 iframe 请求打开宿主设置页的本插件分区（契约 §5） */
  onRequestHostSettings(widget: WidgetInstance): void;
  onChangeSize(widget: WidgetInstance, size: WidgetSize): void;
  onEditPointerDown(event: ReactPointerEvent<HTMLDivElement>, widget: WidgetInstance): void;
  /** 把 iframe 句柄登记给桌面层（Enter 进入组件时用 FocusPlugin） */
  registerFrameHandle(uid: string, handle: WidgetFrameHandle | null): void;
  registerNode(uid: string, node: HTMLDivElement | null): void;
}

export function WidgetCard({
  widget,
  metrics,
  origin,
  editMode,
  gallery,
  focused,
  dragging,
  src,
  bridge,
  theme,
  identityHue,
  notify,
  onRequestEditMode,
  onFocus,
  onDelete,
  onOpenSettings,
  onRequestHostSettings,
  onChangeSize,
  onEditPointerDown,
  registerFrameHandle,
  registerNode,
}: WidgetCardProps) {
  const styles = useStyles();
  const frameRef = useRef<WidgetFrameHandle>(null);
  /** Card 本体节点：状态 scale 与 down→holding 的 transitionend 都盯它（缩放已搬到 Card） */
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  /** Card 节点同时交给桌面层登记（焦点用）和本卡状态机（transitionend 用） */
  const setCardNode = useCallback(
    (node: HTMLDivElement | null) => {
      cardRef.current = node;
      registerNode(widget.uid, node);
    },
    [registerNode, widget.uid],
  );

  /**
   * 身份色属于插件实例，不属于全局主题：同一 ThemePayload 按 manifest hue 派生一份，
   * 卡片 iframe 与它打开的详情浮层拿到同一份主题（浮层复用这里的 theme）。
   */
  const frameTheme = useMemo(
    () => (theme && identityHue ? withIdentityTheme(theme, identityHue) : theme),
    [theme, identityHue],
  );

  /** iframe 内 SDK 转发的 hover（鼠标/笔） */
  const [frameHover, setFrameHover] = useState(false);
  /** 宿主自己的卡片边缘（6px 内衬）hover；与 iframe 转发取或 */
  const [hostHover, setHostHover] = useState(false);
  const [pressPhase, setPressPhase] = useState<PressPhase | null>(null);
  /** 松手/取消后 150ms 回弹（到 hover 或 rest），回弹结束前不切回普通过渡 */
  const [releasing, setReleasing] = useState(false);
  /** 刚退出编辑模式：卡片 0.96→1 用 150ms 加速（MOTION §3「退出」），不是回弹的 100ms */
  const [leavingEdit, setLeavingEdit] = useState(false);
  /** 刚退出欣赏壁纸：回场按「常规进出」200ms 减速（MOTION §1），窗口结束后回普通过渡 */
  const [leavingGallery, setLeavingGallery] = useState(false);

  const pressRef = useRef<PressPhase | null>(null);
  const downTimerRef = useRef(0);
  const releaseTimerRef = useRef(0);

  useEffect(() => {
    registerFrameHandle(widget.uid, frameRef.current);
    return () => registerFrameHandle(widget.uid, null);
  }, [registerFrameHandle, widget.uid]);

  const clearDownTimer = useCallback(() => {
    if (!downTimerRef.current) return;
    window.clearTimeout(downTimerRef.current);
    downTimerRef.current = 0;
  }, []);

  const clearReleaseTimer = useCallback(() => {
    if (!releaseTimerRef.current) return;
    window.clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = 0;
  }, []);

  // 卸载时清掉视觉阶段计时器（长按计时器在插件 SDK 里，由 SDK 自己清理）
  useEffect(
    () => () => {
      clearDownTimer();
      clearReleaseTimer();
    },
    [clearDownTimer, clearReleaseTimer],
  );

  const startHolding = useCallback(() => {
    if (pressRef.current !== 'down') return;
    pressRef.current = 'holding';
    setPressPhase('holding');
  }, []);

  const beginPress = useCallback(() => {
    clearDownTimer();
    clearReleaseTimer();
    pressRef.current = 'down';
    setPressPhase('down');
    setReleasing(false);
    // 按下 50ms 落到 0.985，随后交给 500ms 线性长按下沉（MOTION §2）。
    // down → holding 由 transform 的 transitionend 驱动：低帧率/headless 下若从
    // pointerdown 直接跑 50ms 定时器，down 的 transition 可能连一帧都没拿到就被切走。
    // 250ms 只是 transitionend 不触发时的兜底，不是动效时长。
    if (reducedMotion) {
      downTimerRef.current = window.setTimeout(() => {
        downTimerRef.current = 0;
        startHolding();
      }, motionTokens.durationUltraFast);
      return;
    }
    downTimerRef.current = window.setTimeout(() => {
      downTimerRef.current = 0;
      startHolding();
    }, motionTokens.durationGentle);
  }, [clearDownTimer, clearReleaseTimer, reducedMotion, startHolding]);

  /**
   * down 的 0.985 落位完成后切到 holding（MOTION §2）。
   * 缩放已搬到 Card 本体，所以改为监听 Card 节点上的 transform 过渡结束；
   * 用原生 transitionend 而不是再起一个 50ms 定时器：低帧率下定时器会在 transition
   * 真正跑完前触发，down 阶段被整段跳过（React DOM 也没有 transitionstart 合成事件）。
   */
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== node || event.propertyName !== 'transform') return;
      if (pressRef.current !== 'down') return;
      // 只认按下落位（0.985）的结束；hover 进入的 1.015 结束事件不能触发 holding
      const currentScale = new DOMMatrixReadOnly(getComputedStyle(node).transform).a;
      if (Math.abs(currentScale - PRESS_SCALE) > 0.005) return;
      if (downTimerRef.current) {
        window.clearTimeout(downTimerRef.current);
        downTimerRef.current = 0;
      }
      startHolding();
    };
    node.addEventListener('transitionend', onTransitionEnd);
    return () => node.removeEventListener('transitionend', onTransitionEnd);
  }, [startHolding]);

  const finishPress = useCallback(() => {
    if (pressRef.current === null) return;
    clearDownTimer();
    clearReleaseTimer();
    pressRef.current = null;
    setPressPhase(null);
    setReleasing(true);
    releaseTimerRef.current = window.setTimeout(() => {
      releaseTimerRef.current = 0;
      setReleasing(false);
    }, motionTokens.durationFast);
  }, [clearDownTimer, clearReleaseTimer]);

  /** iframe 转发的指针状态（契约 §3.2） */
  const handleCardPointer = useCallback(
    (phase: CardPointerPhase, _pointerType: CardPointerType) => {
      // 编辑模式 / 拖拽中不参与 hover / press，避免和编辑覆盖层抢状态
      if (editMode || dragging) return;
      if (phase === 'hover-enter') {
        // 指针已进入 iframe：宿主边缘 hover 让位给转发状态，避免两路取或后无法清除
        setHostHover(false);
        setFrameHover(true);
        return;
      }
      if (phase === 'hover-leave') {
        setFrameHover(false);
        return;
      }
      if (phase === 'down') beginPress();
      else finishPress();
    },
    [beginPress, dragging, editMode, finishPress],
  );

  /** SDK 检测到长按：清掉按压视觉，交给宿主进编辑（Desktop 负责选中/聚焦） */
  const handleRequestEditMode = useCallback(() => {
    clearDownTimer();
    clearReleaseTimer();
    pressRef.current = null;
    setPressPhase(null);
    setReleasing(false);
    onRequestEditMode(widget);
  }, [clearDownTimer, clearReleaseTimer, onRequestEditMode, widget]);

  // 进入编辑模式：立即结束按压/hover 视觉与计时器（编辑 chrome 由 CSS 接管）
  useEffect(() => {
    if (!editMode) return;
    clearDownTimer();
    clearReleaseTimer();
    pressRef.current = null;
    setPressPhase(null);
    setReleasing(false);
    setHostHover(false);
    setFrameHover(false);
  }, [clearDownTimer, clearReleaseTimer, editMode]);

  // 退出编辑模式：卡片 0.96→1 用 150ms 加速（MOTION §3），窗口结束后回到普通过渡
  const wasEditRef = useRef(editMode);
  useEffect(() => {
    const wasEditing = wasEditRef.current;
    wasEditRef.current = editMode;
    if (!wasEditing || editMode) {
      setLeavingEdit(false);
      return undefined;
    }
    setLeavingEdit(true);
    const timer = window.setTimeout(() => setLeavingEdit(false), motionTokens.durationFast);
    return () => window.clearTimeout(timer);
  }, [editMode]);

  // 进入欣赏壁纸：先清掉 press / hover 视觉，避免卡片容器淡出时内容还在缩放。
  useLayoutEffect(() => {
    if (!gallery) return;
    clearDownTimer();
    clearReleaseTimer();
    pressRef.current = null;
    setPressPhase(null);
    setReleasing(false);
    setHostHover(false);
    setFrameHover(false);
  }, [clearDownTimer, clearReleaseTimer, gallery]);

  // 退出欣赏壁纸：回场是「常规进出」（MOTION §1：200ms 减速），不错峰。
  // layout effect 确保第一帧就用回场曲线，避免先按普通过渡画一帧再改曲线。
  const wasGalleryRef = useRef(gallery);
  useLayoutEffect(() => {
    const wasGallery = wasGalleryRef.current;
    wasGalleryRef.current = gallery;
    if (!wasGallery || gallery) {
      setLeavingGallery(false);
      return undefined;
    }
    setLeavingGallery(true);
    const timer = window.setTimeout(() => setLeavingGallery(false), motionTokens.durationNormal);
    return () => window.clearTimeout(timer);
  }, [gallery]);

  // 兜底：指针在 iframe 外抬起（宿主文档收到 pointerup）时也要回弹，避免按压状态卡死
  useEffect(() => {
    if (pressPhase === null) return undefined;
    const end = () => finishPress();
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [finishPress, pressPhase]);

  const handleHostPointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    // 触控没有 hover（MOTION §0）
    if (event.pointerType === 'touch') return;
    setHostHover(true);
  };

  const handleHostPointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    setHostHover(false);
  };

  const [widthCells, heightCells] = widget.size;
  const x = origin.x + widget.col * (metrics.cell + metrics.gap);
  const y = origin.y + widget.row * (metrics.cell + metrics.gap);
  const width = widthCells * metrics.cell + (widthCells - 1) * metrics.gap;
  const height = heightCells * metrics.cell + (heightCells - 1) * metrics.gap;

  const hoverActive = !editMode && !gallery && !dragging && (hostHover || frameHover);
  const visiblePress = editMode || gallery || dragging ? null : pressPhase;

  // ---- 卡片状态 scale（MOTION §2 状态机；scale 只作用在 Card 本体，iframe 内容不参与） ----
  // 编辑模式 0.96；hover 1.015；按下 0.985；长按线性下沉到 0.97；松手回弹到 hover/rest。
  // reduced-motion 一律 1（编辑模式也不缩放，MOTION §7），只保留颜色/描边变化。
  let cardScale = 1;
  if (!reducedMotion) {
    if (editMode) cardScale = EDIT_CARD_SCALE;
    else if (visiblePress === 'holding') cardScale = LONG_PRESS_SCALE;
    else if (visiblePress === 'down') cardScale = PRESS_SCALE;
    // releasing：hoverActive 为真就回弹到 hover 的 1.015，否则回 rest 的 1
    else if (hoverActive) cardScale = HOVER_SCALE;
  }

  // ---- Card 过渡参数：状态 scale / 阴影 / 尺寸 / 欣赏壁纸（MOTION §2、§3、§1，全部来自 motionTokens） ----
  let cardDuration: number = motionTokens.durationFaster;
  let cardCurve: string = motionTokens.curveAccelerateMin;
  if (editMode) {
    cardDuration = motionTokens.durationNormal;
    cardCurve = motionTokens.curveDecelerateMid;
  } else if (leavingEdit) {
    // 退出编辑模式：0.96→1 用退出类时长（MOTION §1/§3：150ms 加速）
    cardDuration = motionTokens.durationFast;
    cardCurve = motionTokens.curveAccelerateMid;
  } else if (visiblePress === 'down') {
    cardDuration = motionTokens.durationUltraFast;
    cardCurve = motionTokens.curveAccelerateMin;
  } else if (visiblePress === 'holding') {
    cardDuration = motionTokens.durationUltraSlow;
    cardCurve = motionTokens.curveLinear;
  } else if (releasing) {
    cardDuration = motionTokens.durationFast;
    cardCurve = motionTokens.curveDecelerateMid;
  } else if (hoverActive) {
    cardDuration = motionTokens.durationFaster;
    cardCurve = motionTokens.curveDecelerateMin;
  }
  if (reducedMotion) {
    cardDuration = motionTokens.durationFaster;
    cardCurve = motionTokens.curveDecelerateMin;
  }
  if (gallery) {
    // 进入欣赏壁纸 = 退出类（MOTION §1：chrome 淡出 / 浮层收回）：
    // 150ms + curveAccelerateMid，与桌面 chrome 的 galleryChromeHidden 同一组参数。
    cardDuration = reducedMotion ? motionTokens.durationFaster : motionTokens.durationFast;
    cardCurve = motionTokens.curveAccelerateMid;
  } else if (leavingGallery) {
    // 回场 = 常规进出（MOTION §1）：200ms + curveDecelerateMid，与 chrome 回场同参数。
    cardDuration = reducedMotion ? motionTokens.durationFaster : motionTokens.durationNormal;
    cardCurve = motionTokens.curveDecelerateMid;
  }

  /** 欣赏壁纸不做逐项错峰：MOTION §6「明确不做 stagger 逐项入场」，§5.1 的 20ms 只给气泡 */
  const galleryOffset = gallery && !reducedMotion ? tokens.spacingVerticalSNudge : '0';
  const galleryMotion = gallery || leavingGallery;
  /**
   * 卡片状态机 scale（hover/press/长按/编辑）全部叠在这里的 Card 本体上（宿主外层），
   * iframe 及其内层内容不参与缩放（MOTION §2 状态机表 / §10「不做跨 iframe 内容缩放」）。
   * 欣赏壁纸分支保持现状：只保留定位 translate 与退场/回场 translateY，不出现 `scale()`。
   */
  const cardTransform = gallery
    ? `translate(${x}px, ${y}px) translateY(${galleryOffset})`
    : `translate(${x}px, ${y}px) scale(${cardScale})`;

  const cardStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    // 定位 translate 与状态 scale 都在 Card 上（缩放不进入 iframe 内容）；
    // 欣赏壁纸只额外叠 translateY，不碰 width/height，因此不会触发网格重排。
    transform: cardTransform,
    width,
    height,
    borderRadius: CARD_RADIUS,
    ...CARD_MATERIAL,
    opacity: gallery ? 0 : 1,
    pointerEvents: gallery ? 'none' : undefined,
    boxShadow: editMode || (hoverActive && !visiblePress) ? tokens.shadow8 : tokens.shadow4,
    // 欣赏壁纸只动容器 opacity 与 translateY；减少动效时只保留 opacity
    transitionProperty: galleryMotion
      ? reducedMotion
        ? 'opacity'
        : 'transform, opacity'
      : 'transform, width, height, opacity, box-shadow',
    transitionDuration: `${cardDuration}ms`,
    transitionTimingFunction: cardCurve,
  };

  // ---- 描边：静止态中性描边（FLUENT2 §6：卡片用 colorNeutralStroke2 表达边界）；
  //      hover 升级到 stroke1，长按由品牌色 overlay 叠加 ----
  let hoverStrokeDuration: number = motionTokens.durationFaster;
  let hoverStrokeCurve: string = motionTokens.curveAccelerateMin;
  if (hoverActive) {
    hoverStrokeCurve = motionTokens.curveDecelerateMin;
  }
  if (reducedMotion) {
    hoverStrokeDuration = motionTokens.durationFaster;
    hoverStrokeCurve = motionTokens.curveDecelerateMin;
  }
  const hoverStrokeStyle: CSSProperties = {
    borderColor: hoverActive ? tokens.colorNeutralStroke1 : tokens.colorNeutralStroke2,
    opacity: 1,
    transitionDuration: `${hoverStrokeDuration}ms`,
    transitionTimingFunction: hoverStrokeCurve,
  };

  let pressStrokeDuration: number = motionTokens.durationUltraSlow;
  let pressStrokeCurve: string = motionTokens.curveLinear;
  if (visiblePress === null) {
    pressStrokeDuration = motionTokens.durationFast;
    pressStrokeCurve = motionTokens.curveDecelerateMid;
  }
  if (reducedMotion) {
    pressStrokeDuration = motionTokens.durationFaster;
    pressStrokeCurve = motionTokens.curveDecelerateMin;
  }
  const pressStrokeStyle: CSSProperties = {
    borderColor: tokens.colorBrandStroke1,
    opacity: visiblePress ? 0.35 : 0,
    transitionDuration: `${pressStrokeDuration}ms`,
    transitionTimingFunction: pressStrokeCurve,
  };

  const availableSizes = useMemo(() => {
    const seen = new Set<string>();
    const result: WidgetSize[] = [];
    for (const size of widget.sizes) {
      if (size[0] > metrics.columns || size[1] > metrics.rows) continue;
      const key = `${size[0]}x${size[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(size);
    }
    const currentKey = `${widget.size[0]}x${widget.size[1]}`;
    if (!seen.has(currentKey)) result.push([widget.size[0], widget.size[1]]);
    return result;
  }, [widget.sizes, widget.size, metrics.columns, metrics.rows]);

  return (
    <Card
      ref={setCardNode}
      className={styles.card}
      style={cardStyle}
      tabIndex={focused ? 0 : -1}
      aria-label={`${widget.title} 小组件`}
      data-widget-card="true"
      data-widget-uid={widget.uid}
      data-widget-page={widget.page}
      data-gallery={gallery ? 'true' : undefined}
      inert={gallery}
      data-hover={hoverActive ? 'true' : undefined}
      data-press={visiblePress ?? undefined}
      onFocus={() => onFocus(widget)}
    >
      <div
        className={styles.gestureArea}
        data-card-gesture-area="true"
        onPointerEnter={handleHostPointerEnter}
        onPointerLeave={handleHostPointerLeave}
      >
        {/* 内容层不再参与任何缩放/过渡：状态 scale 只在 Card 本体（验收用 data-card-content-layer 定位） */}
        <div className={styles.contentLayer} data-card-content-layer="true">
          <WidgetFrame
            ref={frameRef}
            bridge={bridge}
            theme={frameTheme}
            title={widget.title}
            instanceUid={widget.uid}
            pluginId={widget.pluginId}
            widgetId={widget.widgetId}
            src={src}
            size={widget.size}
            notify={notify}
            onRequestHostSettings={() => onRequestHostSettings(widget)}
            onCardPointer={handleCardPointer}
            onRequestEditMode={handleRequestEditMode}
          />
        </div>
      </div>

      {/* 1px 描边绘制在 iframe 之上：hover 中性描边 + 长按品牌描边（不拦指针） */}
      <div
        className={styles.interactionStroke}
        data-card-hover-stroke="true"
        aria-hidden="true"
        style={hoverStrokeStyle}
      />
      <div
        className={styles.interactionStroke}
        data-card-press-stroke="true"
        aria-hidden="true"
        style={pressStrokeStyle}
      />

      {/* 正常模式唯一允许的轻量提示：悬停时出现，overlay 不占布局高度 */}
      <div
        className={mergeClasses(styles.dragHint, hoverActive && styles.dragHintVisible)}
        data-drag-hint="true"
        aria-hidden="true"
      >
        <ReOrderDotsHorizontal20Regular />
      </div>

      {/* 编辑模式 chrome：顶部渐变压暗遮罩 + 标题 + 删除 / 改尺寸 / 设置。
          常驻 DOM 用 opacity/transform 过渡进出 */}
      <div
        className={mergeClasses(styles.editOverlay, editMode && styles.editOverlayVisible)}
        data-widget-overlay="true"
        data-edit-chrome="true"
        aria-hidden={!editMode}
        inert={!editMode}
        onPointerDown={(event) => {
          if (!editMode) return;
          const target = event.target;
          if (target instanceof HTMLElement && target.closest('[data-card-controls]')) return;
          onEditPointerDown(event, widget);
        }}
      >
        <div className={styles.editScrim} data-edit-scrim="true" aria-hidden="true" />
        <Text className={styles.editTitle} size={200} weight="semibold" truncate>
          {widget.title}
        </Text>
        <div
          className={styles.editControls}
          data-card-controls="true"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Tooltip content="删除" relationship="label">
            <Button
              size="small"
              appearance="subtle"
              style={TOUCH_TARGET}
              icon={<Delete20Regular />}
              aria-label={`删除 ${widget.title}`}
              onClick={() => onDelete(widget)}
            />
          </Tooltip>
          <Menu
            // 受控勾选：唯一事实来源是 widget.size。改尺寸失败时 Menu 内部不会留下
            // “已勾选但没生效”的假状态；成功重渲染后勾选跟随新尺寸（D-18 相关回归）。
            checkedValues={{ 'widget-size': [`${widget.size[0]}x${widget.size[1]}`] }}
            onCheckedValueChange={() => {}}
          >
            <MenuTrigger disableButtonEnhancement>
              <Button
                size="small"
                appearance="subtle"
                style={TOUCH_TARGET}
                icon={<Resize20Regular />}
                aria-label={`改变 ${widget.title} 的尺寸`}
                title="改尺寸"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {availableSizes.map((size) => (
                  <MenuItemRadio
                    key={`${size[0]}x${size[1]}`}
                    name="widget-size"
                    value={`${size[0]}x${size[1]}`}
                    onClick={() => onChangeSize(widget, size)}
                  >
                    {`${size[0]} × ${size[1]}`}
                  </MenuItemRadio>
                ))}
              </MenuList>
            </MenuPopover>
          </Menu>
          <Tooltip content="设置" relationship="label">
            <Button
              size="small"
              appearance="subtle"
              style={TOUCH_TARGET}
              icon={<Settings20Regular />}
              aria-label={`${widget.title} 设置`}
              onClick={() => onOpenSettings(widget)}
            />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}
