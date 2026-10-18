/**
 * 监听桌面视口尺寸并推导网格几何。
 * 用 ResizeObserver 而不是 window.resize：窗口化/分屏/DPI 改变都能覆盖。
 */
import { useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import { computeGridMetrics, gridOrigin } from '../layout';
import type { GridMetrics } from '../layout';

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ViewportMetrics {
  viewport: ViewportSize;
  metrics: GridMetrics;
  /** 网格居中时左上角的像素偏移 */
  origin: { x: number; y: number };
}

function readWindowSize(): ViewportSize {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

export function useViewportMetrics(ref: RefObject<HTMLElement | null>): ViewportMetrics {
  const [viewport, setViewport] = useState<ViewportSize>(readWindowSize);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (width === 0 || height === 0) return;
      setViewport((previous) =>
        previous.width === width && previous.height === height ? previous : { width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref]);

  const metrics = useMemo(
    () => computeGridMetrics(viewport.width, viewport.height),
    [viewport.width, viewport.height],
  );
  const origin = useMemo(
    () => gridOrigin(metrics, viewport.width, viewport.height),
    [metrics, viewport.width, viewport.height],
  );

  return { viewport, metrics, origin };
}
