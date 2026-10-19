/**
 * 详情浮层的完整 container transform（MOTION §4 / E4）。
 *
 * 宿主在插件发 `plugin:request-overlay` 时记下被点卡片的 rect（`captureOverlaySource`），
 * 浮层挂载后由这个 hook 驱动 surface 的展开 / 收回：
 *
 * 打开（`durationGentle` + `curveDecelerateMid`）
 *   1. 首帧可见性隐藏，量出 surface 的**自然**最终 rect（尺寸由 CSS 决定，不写死）；
 *   2. 把 surface 固定到该 rect，用 `translate + scale` 把它摆回卡片 rect
 *      （位置/尺寸全在合成层完成，不逐帧改布局）；圆角反算回卡片半径、阴影取 `shadow4`；
 *   3. 下一帧过渡到 `scale(1)`；变形到约 60% 时内容 opacity 0→1（`durationFast` 减速），
 *      scrim 同步淡入（`durationNormal` 减速）。
 *
 * 关闭（内容 100ms 加速淡出 → surface 150ms `curveAccelerateMid` 收回 → scrim 150ms 加速淡出）
 *   关闭动画结束后由父组件卸载浮层并把焦点还给来源卡片。
 *
 * 兜底（来源 rect 无效：卡片已删 / 不在当前页 / 窗口尺寸变化）
 *   居中 `scale(0.96)→1` + 淡入（200ms 进 / 150ms 出）。
 *
 * reduced-motion（MOTION §7）
 *   不做位移与缩放，只保留 100ms 淡入淡出，内容直接可见。
 *
 * 时长/曲线全部来自 `motionTokens`；没有自定义毫秒数或 cubic-bezier。
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { motionTokens, tokens } from '@fluentui/react-components';

import { useMediaQuery } from '../pages/shared/useMediaQuery';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** 请求浮层时与打开时卡片 rect 允许的漂移（px）；超过即认为布局已变，来源 rect 失效 */
const ANCHOR_TOLERANCE = 2;

/** 内容开始淡入的进度点（MOTION §4：变形到约 60% 时内容 opacity 0→1） */
const CONTENT_REVEAL_RATIO = 0.6;

/** 兜底路径的居中缩放起点（MOTION §4 兜底：scale 0.96→1） */
const FALLBACK_SCALE = 0.96;

/** 读不到卡片圆角时的回退值（Fluent borderRadiusXLarge = 8px） */
const FALLBACK_RADIUS = Number.parseFloat(tokens.borderRadiusXLarge) || 8;

/** 浮层分几段：量尺 → 起始位 → 过渡中 → 稳定 → 内容淡出 → 收回 */
type Phase = 'measure' | 'start' | 'run' | 'open' | 'exit' | 'retract';

export interface OverlaySourceRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** 请求浮层那一刻捕获的来源卡片快照（由 PluginWidgetFrame 记录，随 overlay 状态保存） */
export interface OverlaySource {
  /** 触发浮层的卡片节点（`[data-widget-card]`）；卡片被删 / 换页时用它判定失效 */
  element: HTMLElement | null;
  /** 请求那一刻的卡片 rect */
  rect: OverlaySourceRect | null;
  /** 请求那一刻的窗口尺寸；窗口变过就说明卡片已被重排，rect 不能再当锚点 */
  viewport: { width: number; height: number } | null;
}

export type OverlayMotionMode = 'container' | 'fallback' | 'fade';

interface Anchor {
  rect: OverlaySourceRect;
  /** 卡片圆角（从卡片自身 computed style 读，不写死） */
  radius: number;
}

interface Geometry {
  /** surface 的最终 rect（container transform 期间 surface 固定在这里） */
  target: OverlaySourceRect;
  /** 起始位移：把 surface 从 target 平移到卡片 rect */
  dx: number;
  dy: number;
  /** 起始缩放：把 surface 从 target 缩到卡片 rect */
  scaleX: number;
  scaleY: number;
  /** 起始圆角（本地像素）：乘上缩放后视觉上等于卡片圆角 */
  startRadiusX: number;
  startRadiusY: number;
  /** 最终圆角（surface 自身的 computed style） */
  endRadius: number;
  /** 最终阴影（surface 自身的 computed style，默认 shadow64） */
  endShadow: string;
}

/**
 * 记录来源卡片快照（宿主在插件请求浮层时调用）。
 * 传卡片 iframe 或卡片节点都可以：会向上找 `[data-widget-card]`。
 */
export function captureOverlaySource(frame: Element | null): OverlaySource {
  const element =
    frame instanceof Element ? (frame.closest('[data-widget-card]') as HTMLElement | null) : null;
  const rect = element?.getBoundingClientRect() ?? null;
  return {
    element,
    rect: rect
      ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      : null,
    viewport:
      typeof window === 'undefined'
        ? null
        : { width: window.innerWidth, height: window.innerHeight },
  };
}

/**
 * 判定来源 rect 是否还能当锚点（MOTION §4 兜底条件）：
 * 卡片已删除 / 不在当前页（桌面层隐藏或卡片被平移到视口外）/ 窗口尺寸变化。
 */
function resolveAnchor(source: OverlaySource | null): Anchor | null {
  if (!source?.rect || !source.element || !source.viewport) return null;
  if (typeof window === 'undefined') return null;
  const { rect, element, viewport } = source;
  if (rect.width < 2 || rect.height < 2) return null;
  if (
    Math.abs(window.innerWidth - viewport.width) > 1 ||
    Math.abs(window.innerHeight - viewport.height) > 1
  ) {
    return null;
  }
  if (!element.isConnected) return null;
  const live = element.getBoundingClientRect();
  if (live.width < 2 || live.height < 2) return null;
  if (
    Math.abs(live.left - rect.left) > ANCHOR_TOLERANCE ||
    Math.abs(live.top - rect.top) > ANCHOR_TOLERANCE ||
    Math.abs(live.width - rect.width) > ANCHOR_TOLERANCE ||
    Math.abs(live.height - rect.height) > ANCHOR_TOLERANCE
  ) {
    return null;
  }
  // 不在当前页：轨道把卡片平移出视口，或桌面层 visibility:hidden
  if (
    rect.left < -1 ||
    rect.top < -1 ||
    rect.left + rect.width > window.innerWidth + 1 ||
    rect.top + rect.height > window.innerHeight + 1
  ) {
    return null;
  }
  const style = window.getComputedStyle(element);
  if (style.visibility === 'hidden' || style.display === 'none') return null;
  const radius = Number.parseFloat(style.borderTopLeftRadius);
  return { rect, radius: Number.isFinite(radius) ? radius : FALLBACK_RADIUS };
}

/** CSS transition 简写列表（属性、时长、曲线都是 token） */
function transitions(properties: string[], duration: number, easing: string): string {
  return properties.map((property) => `${property} ${duration}ms ${easing}`).join(', ');
}

/**
 * 关掉 Fluent DialogSurface 自带的进场动效（`Scale` 0.85→1 + 淡入，250ms）。
 *
 * 这版 Fluent 会给 surface 挂 WAAPI 动画，而且它优先级高于内联样式：
 * - 不取消的话，量到的 rect 是动画中途的 0.85 缩放值，container transform 的终点会算错；
 * - 视觉上也会出现“默认缩放 + container transform”两套动画叠加。
 * 取消后 surface 立即回到自然尺寸/不透明，position/size/transform 全由本 hook 接管。
 */
function cancelIntrinsicMotion(surface: HTMLElement | null) {
  if (!surface || typeof surface.getAnimations !== 'function') return;
  for (const animation of surface.getAnimations()) {
    try {
      animation.cancel();
    } catch {
      // 已被浏览器回收：忽略
    }
  }
}

export interface UseOverlayTransformOptions {
  /** request-overlay 时捕获的来源快照 */
  source: OverlaySource | null;
  /** 浮层 surface（Fluent DialogSurface 的根 div） */
  surfaceRef: RefObject<HTMLElement | null>;
  /** 关闭动画结束：父组件在这里卸载浮层，并把焦点还给来源卡片 */
  onClosed: () => void;
}

export interface OverlayTransformState {
  mode: OverlayMotionMode;
  /** 当前阶段（同时写到 surface 的 data-overlay-phase，验收脚本据此判断首帧/收回） */
  phase: Phase;
  /** 打到 DialogSurface 上：定位 / 尺寸 / 位移 / 圆角 / 阴影 */
  surfaceStyle: CSSProperties;
  /** 打到 backdrop（自定义 scrim）上：透明度 */
  scrimStyle: CSSProperties;
  /** 打到内容层（DialogBody）上：内容交叉淡入 */
  contentStyle: CSSProperties;
  closing: boolean;
  requestClose(): void;
}

/**
 * 驱动浮层 surface 的 container transform。
 * 只能挂在“浮层已经挂载”的组件里：卸载即结束，重开走新的实例。
 */
export function useOverlayTransform({
  source,
  surfaceRef,
  onClosed,
}: UseOverlayTransformOptions): OverlayTransformState {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  // 模式与锚点只在挂载时定一次：动画中途改窗口尺寸/改 reduced-motion 不重算，避免半程跳变
  const initialRef = useRef<{ mode: OverlayMotionMode; anchor: Anchor | null } | null>(null);
  if (initialRef.current === null) {
    const anchor = resolveAnchor(source);
    initialRef.current = {
      mode: reducedMotion ? 'fade' : anchor ? 'container' : 'fallback',
      anchor: reducedMotion ? null : anchor,
    };
  }
  const anchor = initialRef.current.anchor;

  const [mode, setMode] = useState<OverlayMotionMode>(initialRef.current.mode);
  const [phase, setPhase] = useState<Phase>(() =>
    initialRef.current?.mode === 'container' ? 'measure' : 'start',
  );
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [contentVisible, setContentVisible] = useState(false);
  const [scrimVisible, setScrimVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const timersRef = useRef<number[]>([]);
  const rafsRef = useRef<number[]>([]);
  const closedRef = useRef(false);
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;

  const clearAsync = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
    for (const id of rafsRef.current) window.cancelAnimationFrame(id);
    rafsRef.current = [];
  }, []);

  const later = useCallback((run: () => void, delay: number) => {
    const id = window.setTimeout(run, delay);
    timersRef.current.push(id);
  }, []);

  // 卸载时清掉所有计时器/rAF（关闭动画被父组件提前打断也不会留下回调）
  useEffect(() => clearAsync, [clearAsync]);

  // ---- 1. 量出 surface 的最终 rect（尺寸由 CSS 决定，不硬编码 880×680） ----
  useLayoutEffect(() => {
    if (mode !== 'container' || phase !== 'measure') return;
    const surface = surfaceRef.current;
    // 先摘掉 Fluent 自带的 surface 进场动画，否则量到的是 0.85 缩放后的 rect
    cancelIntrinsicMotion(surface);
    const rect = surface?.getBoundingClientRect() ?? null;
    if (!surface || !rect || rect.width < 2 || rect.height < 2 || !anchor) {
      // 量不到 surface：降级成居中淡入，不能把浮层留在不可见状态
      setMode('fallback');
      setPhase('start');
      return;
    }
    const style = window.getComputedStyle(surface);
    const endRadius = Number.parseFloat(style.borderTopLeftRadius);
    const target: OverlaySourceRect = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
    const scaleX = anchor.rect.width / target.width;
    const scaleY = anchor.rect.height / target.height;
    setGeometry({
      target,
      dx: anchor.rect.left - target.left,
      dy: anchor.rect.top - target.top,
      scaleX,
      scaleY,
      startRadiusX: anchor.radius / scaleX,
      startRadiusY: anchor.radius / scaleY,
      endRadius: Number.isFinite(endRadius) ? endRadius : FALLBACK_RADIUS,
      endShadow:
        style.boxShadow && style.boxShadow !== 'none' ? style.boxShadow : tokens.shadow64,
    });
    setPhase('start');
  }, [anchor, mode, phase, surfaceRef]);

  // 量尺卡住时的兜底（surface 还没进 DOM 等异常路径）：按居中淡入继续，不阻塞关闭
  useEffect(() => {
    if (mode !== 'container' || phase !== 'measure') return undefined;
    const id = window.setTimeout(() => {
      setMode('fallback');
      setPhase('start');
    }, motionTokens.durationSlow);
    return () => window.clearTimeout(id);
  }, [mode, phase]);

  // ---- 2. 起始样式提交后再切目标样式，才会产生过渡（双 rAF） ----
  useEffect(() => {
    if (phase !== 'start') return undefined;
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => {
        // 再摘一次：Fluent 的 surface 动效可能晚一帧才挂上（被动 effect 里创建）
        cancelIntrinsicMotion(surfaceRef.current);
        setPhase('run');
      });
      rafsRef.current.push(inner);
    });
    rafsRef.current.push(outer);
    return () => {
      window.cancelAnimationFrame(outer);
      if (inner) window.cancelAnimationFrame(inner);
    };
  }, [phase, surfaceRef]);

  // ---- 3. 变形过程中/结束后揭示内容与 scrim ----
  useEffect(() => {
    if (phase !== 'run') return;
    if (mode === 'container') {
      // 250ms × 60% = 150ms 处内容开始淡入（150ms 减速），scrim 同步淡入（200ms 减速）
      later(() => {
        setContentVisible(true);
        setScrimVisible(true);
      }, motionTokens.durationGentle * CONTENT_REVEAL_RATIO);
      later(() => setPhase('open'), motionTokens.durationGentle);
      return;
    }
    // 兜底 / reduced-motion：surface 与内容一起淡入，内容直接可见
    setScrimVisible(true);
    later(
      () => setPhase('open'),
      mode === 'fade' ? motionTokens.durationFaster : motionTokens.durationNormal,
    );
  }, [later, mode, phase]);

  // ---- 4. 关闭：内容淡出 → surface 收回 → scrim 淡出 → 卸载 ----
  const requestClose = useCallback(() => {
    if (closedRef.current) return;
    clearAsync();
    setClosing(true);
    setPhase('exit');
    if (mode === 'container') {
      setContentVisible(false);
      later(() => {
        setPhase('retract');
        setScrimVisible(false);
      }, motionTokens.durationFaster);
      later(() => {
        if (closedRef.current) return;
        closedRef.current = true;
        onClosedRef.current();
      }, motionTokens.durationFaster + motionTokens.durationFast);
      return;
    }
    setScrimVisible(false);
    later(
      () => {
        if (closedRef.current) return;
        closedRef.current = true;
        onClosedRef.current();
      },
      mode === 'fade' ? motionTokens.durationFaster : motionTokens.durationFast,
    );
  }, [clearAsync, later, mode]);

  // ---- 5. 内联样式 ----
  const surfaceStyle: CSSProperties = {};
  const scrimStyle: CSSProperties = {};
  const contentStyle: CSSProperties = {};

  if (mode === 'container') {
    if (geometry) {
      const { target, dx, dy, scaleX, scaleY, startRadiusX, startRadiusY } = geometry;
      // surface 固定在自己的最终 rect 上，位移/缩放全走 transform（不逐帧改布局）
      Object.assign(surfaceStyle, {
        position: 'fixed',
        left: `${target.left}px`,
        top: `${target.top}px`,
        right: 'auto',
        bottom: 'auto',
        margin: '0',
        width: `${target.width}px`,
        height: `${target.height}px`,
        maxWidth: 'none',
        maxHeight: 'none',
        transformOrigin: '0 0',
        visibility: 'visible',
      } satisfies CSSProperties);

      if (phase === 'start' || phase === 'retract') {
        Object.assign(surfaceStyle, {
          transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`,
          borderRadius: `${startRadiusX}px / ${startRadiusY}px`,
          boxShadow: tokens.shadow4,
          transition: 'none',
          willChange: 'transform',
        } satisfies CSSProperties);
        if (phase === 'retract') {
          surfaceStyle.transition = transitions(
            ['transform', 'border-radius', 'box-shadow'],
            motionTokens.durationFast,
            motionTokens.curveAccelerateMid,
          );
        }
      } else {
        Object.assign(surfaceStyle, {
          transform: 'translate(0px, 0px) scale(1, 1)',
          borderRadius: `${geometry.endRadius}px / ${geometry.endRadius}px`,
          boxShadow: geometry.endShadow,
          transition:
            phase === 'open'
              ? 'none'
              : transitions(
                  ['transform', 'border-radius', 'box-shadow'],
                  motionTokens.durationGentle,
                  motionTokens.curveDecelerateMid,
                ),
          willChange: phase === 'open' ? 'auto' : 'transform',
        } satisfies CSSProperties);
      }
    } else {
      // 还没量到 rect：整体透明（不用 visibility:hidden —— 那会让 Fluent 的
      // “聚焦浮层内第一个可聚焦元素”失败，焦点掉到 body 上）
      surfaceStyle.opacity = 0;
    }

    if (phase === 'start') {
      contentStyle.opacity = 0;
      contentStyle.transition = 'none';
    } else if (phase === 'retract') {
      contentStyle.opacity = 0;
      contentStyle.transition = 'none';
    } else if (phase === 'exit') {
      contentStyle.opacity = 0;
      contentStyle.transition = transitions(
        ['opacity'],
        motionTokens.durationFaster,
        motionTokens.curveAccelerateMin,
      );
    } else if (contentVisible) {
      contentStyle.opacity = 1;
      contentStyle.transition = transitions(
        ['opacity'],
        motionTokens.durationFast,
        motionTokens.curveDecelerateMin,
      );
    } else {
      contentStyle.opacity = 0;
      contentStyle.transition = 'none';
    }

    if (phase === 'start') {
      scrimStyle.opacity = 0;
      scrimStyle.transition = 'none';
    } else if (scrimVisible) {
      scrimStyle.opacity = 1;
      scrimStyle.transition = transitions(
        ['opacity'],
        motionTokens.durationNormal,
        motionTokens.curveDecelerateMid,
      );
    } else {
      scrimStyle.opacity = 0;
      scrimStyle.transition =
        phase === 'exit' || phase === 'retract'
          ? transitions(['opacity'], motionTokens.durationFast, motionTokens.curveAccelerateMid)
          : 'none';
    }
  } else {
    // 兜底 / reduced-motion：居中，不做 container transform
    const fadeInDuration =
      mode === 'fade' ? motionTokens.durationFaster : motionTokens.durationNormal;
    const fadeOutDuration =
      mode === 'fade' ? motionTokens.durationFaster : motionTokens.durationFast;
    const scale = mode === 'fade' ? 'none' : `scale(${FALLBACK_SCALE})`;
    const transformProperties = mode === 'fade' ? [] : ['transform'];

    if (phase === 'start') {
      Object.assign(surfaceStyle, {
        opacity: 0,
        transform: scale,
        transformOrigin: 'center center',
        transition: 'none',
      } satisfies CSSProperties);
    } else if (phase === 'exit' || phase === 'retract') {
      Object.assign(surfaceStyle, {
        opacity: 0,
        transform: scale,
        transformOrigin: 'center center',
        transition: transitions(
          ['opacity', ...transformProperties],
          fadeOutDuration,
          motionTokens.curveAccelerateMid,
        ),
      } satisfies CSSProperties);
    } else {
      Object.assign(surfaceStyle, {
        opacity: 1,
        transform: 'none',
        transformOrigin: 'center center',
        transition:
          phase === 'open'
            ? 'none'
            : transitions(
                ['opacity', ...transformProperties],
                fadeInDuration,
                motionTokens.curveDecelerateMid,
              ),
      } satisfies CSSProperties);
    }

    if (phase === 'start') {
      scrimStyle.opacity = 0;
      scrimStyle.transition = 'none';
    } else if (scrimVisible) {
      scrimStyle.opacity = 1;
      scrimStyle.transition = transitions(
        ['opacity'],
        fadeInDuration,
        motionTokens.curveDecelerateMid,
      );
    } else {
      scrimStyle.opacity = 0;
      scrimStyle.transition = transitions(
        ['opacity'],
        fadeOutDuration,
        motionTokens.curveAccelerateMid,
      );
    }
  }

  return { mode, phase, surfaceStyle, scrimStyle, contentStyle, closing, requestClose };
}
