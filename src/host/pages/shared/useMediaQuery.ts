/** matchMedia 的 React 封装：页面自适应靠它切换“宽屏两栏 / 窄屏单栏”。 */
import { useCallback, useSyncExternalStore } from 'react';

const canMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

function subscribe(query: string, onChange: () => void): () => void {
  if (!canMatchMedia) return () => {};
  const list = window.matchMedia(query);
  list.addEventListener('change', onChange);
  return () => list.removeEventListener('change', onChange);
}

export function useMediaQuery(query: string): boolean {
  const onStoreChange = useCallback(
    (listener: () => void) => subscribe(query, listener),
    [query],
  );
  const getSnapshot = useCallback(
    () => (canMatchMedia ? window.matchMedia(query).matches : false),
    [query],
  );
  return useSyncExternalStore(onStoreChange, getSnapshot, () => false);
}

/** 宽屏断点：与 DESIGN.md 的 8/6/4 列断点不冲突，页面外壳按 900px 收起左栏 */
export const WIDE_PAGE_QUERY = '(min-width: 900px)';
