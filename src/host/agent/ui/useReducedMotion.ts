/**
 * 读取 `prefers-reduced-motion: reduce`。
 *
 * Agent 浮空的几何 morph / 阴影 / 位移动画在减少动态效果下必须完全关闭，
 * 只保留 opacity 淡入淡出（契约 §3）；用 JS 读取是为了不在 TS 内联的
 * transition 里硬编码两套值，也不依赖组件库。
 */
import { useCallback, useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const canMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

function subscribe(onChange: () => void): () => void {
  if (!canMatchMedia) return () => {};
  const list = window.matchMedia(REDUCED_MOTION_QUERY);
  list.addEventListener('change', onChange);
  return () => list.removeEventListener('change', onChange);
}

const getSnapshot = (): boolean =>
  canMatchMedia ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false;

export function useReducedMotion(): boolean {
  const subscribeToQuery = useCallback(() => subscribe(getSnapshot), []);
  return useSyncExternalStore(subscribeToQuery, getSnapshot, () => false);
}
