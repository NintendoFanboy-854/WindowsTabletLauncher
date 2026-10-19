/**
 * 页内内容切换动效（MOTION §5）：设置页的插件分区切换 = 内容 150ms 淡入 + 4px 上移，
 * 不做横向滑动；`prefers-reduced-motion: reduce` 下只保留 100ms 淡入（MOTION §7）。
 *
 * 为什么不用 `createMotionComponent`：那个工厂在**挂载时**就播一次动画，设置页本身
 * 已经由 `PageTransition` 做页面级淡入，内层再播一次会变成“页中页”的双层淡入。
 * 这里改成“切换 key 时才播”：首次挂载直接显示，viewKey 变化时先落到起始态
 * （布局阶段同步落，避免新内容先满血显示一帧），下一帧再过渡到终态。
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { motionTokens } from '@fluentui/react-components';

import { useMediaQuery } from '../pages/shared/useMediaQuery';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** 内容进入位移（MOTION §5：4px 上移，比页面级 6px 更轻） */
const CONTENT_OFFSET = '4px';

export interface ContentTransitionProps {
  /** 内容标识：变化时重放一次淡入（同一值不重播） */
  viewKey: string;
  className?: string;
  children: ReactNode;
}

export function ContentTransition({ viewKey, className, children }: ContentTransitionProps) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [shown, setShown] = useState(true);
  const lastKeyRef = useRef(viewKey);

  useLayoutEffect(() => {
    if (lastKeyRef.current === viewKey) return undefined;
    lastKeyRef.current = viewKey;
    // 布局阶段就落回起始态：新内容的第一帧必须是透明的，不能先满血闪一帧
    setShown(false);
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => setShown(true));
    });
    return () => {
      window.cancelAnimationFrame(outer);
      if (inner) window.cancelAnimationFrame(inner);
    };
  }, [viewKey]);

  // 兜底：切换被打断（连点分区）时不留一个永远透明的容器
  useEffect(() => {
    if (shown) return undefined;
    const timer = window.setTimeout(() => setShown(true), motionTokens.durationNormal);
    return () => window.clearTimeout(timer);
  }, [shown]);

  const style: CSSProperties = reducedMotion
    ? {
        opacity: shown ? 1 : 0,
        transitionProperty: 'opacity',
        transitionDuration: `${motionTokens.durationFaster}ms`,
        transitionTimingFunction: motionTokens.curveDecelerateMid,
      }
    : {
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${CONTENT_OFFSET})`,
        transitionProperty: 'opacity, transform',
        transitionDuration: `${motionTokens.durationFast}ms`,
        transitionTimingFunction: motionTokens.curveDecelerateMid,
      };

  return (
    <div className={className} style={style} data-content-transition={viewKey}>
      {children}
    </div>
  );
}
