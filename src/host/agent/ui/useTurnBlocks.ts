/**
 * 过程块的展开状态：**全局开关（底色） + 每块手动覆盖（覆盖层） + 手风琴排他**。
 *
 * 三条规则（设计 §5.4 / §5.5）：
 * 1. 全局「显示全部过程细节」默认关：关着的时候所有过程块折叠成一行摘要；
 * 2. 每个块可以单独展开/收起，手动选择覆盖全局开关（开着也能单独收起一块）；
 * 3. 全局关着时按手风琴走：同一轮里同时最多展开一块，点第二块时第一块自动收起。
 *
 * 逐块状态**不持久化**（组件内 state，重新打开 = 回到默认折叠）：用户的诉求是「默认全部折叠」，
 * 记住逐块状态会让默认态漂移。全局开关持久化。
 *
 * 为什么不放进 `settings.ts`：那份文件的字段白名单在 `normalizeSettings` 里，
 * `settings.ts` 不在本轮改动范围；这里用独立键 + 同一套 CustomEvent/storage 双通道同步，
 * 跨窗口行为与设置对话框一致。
 */
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';

export const EXPAND_ALL_STORAGE_KEY = 'agent.timeline.expandAll';

const EXPAND_ALL_EVENT = 'agent:timeline-expand-all';

/** 快照缓存：`useSyncExternalStore` 要求同一状态返回同一值 */
let expandAllSnapshot: boolean | null = null;

const listeners = new Set<() => void>();

const canUseStorage = typeof localStorage !== 'undefined';

function readStoredExpandAll(): boolean {
  if (!canUseStorage) return false;
  try {
    return localStorage.getItem(EXPAND_ALL_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/** 全局开关的当前值（组件外也能读；首帧只读一次 localStorage） */
export function readExpandAll(): boolean {
  if (expandAllSnapshot === null) expandAllSnapshot = readStoredExpandAll();
  return expandAllSnapshot;
}

/** 写全局开关：落盘 + 通知同页订阅者（跨窗口由 `storage` 事件补） */
export function setExpandProcessAll(next: boolean): void {
  expandAllSnapshot = next;
  try {
    localStorage.setItem(EXPAND_ALL_STORAGE_KEY, next ? 'true' : 'false');
  } catch {
    // 存储被禁用时静默：本次会话内仍然生效（内存里的快照已更新）
  }
  for (const listener of listeners) listener();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EXPAND_ALL_EVENT));
  }
}

function subscribeExpandAll(onChange: () => void): () => void {
  listeners.add(onChange);
  if (typeof window === 'undefined') return () => listeners.delete(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== EXPAND_ALL_STORAGE_KEY) return;
    expandAllSnapshot = readStoredExpandAll();
    onChange();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** 订阅全局开关（设置对话框与所有时间线共用一份状态） */
export function useExpandProcessAll(): boolean {
  return useSyncExternalStore(subscribeExpandAll, readExpandAll, () => false);
}

export interface TurnBlocksExpansion {
  expandAll: boolean;
  /** 这一块现在是否展开（只有 thinking / tool 会问） */
  isOpen: (blockId: string) => boolean;
  /** 点这一行：展开 ⇄ 收起；全局关着时按手风琴排他 */
  toggle: (blockId: string, siblingIds: readonly string[]) => void;
}

export function useTurnBlocks(): TurnBlocksExpansion {
  const expandAll = useExpandProcessAll();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  /** 回调里读最新的全局开关：手风琴判定不能依赖闭包里的旧值 */
  const expandAllRef = useRef(expandAll);
  expandAllRef.current = expandAll;

  const isOpen = useCallback(
    (blockId: string) => overrides[blockId] ?? expandAll,
    [overrides, expandAll],
  );

  const toggle = useCallback((blockId: string, siblingIds: readonly string[]) => {
    setOverrides((previous) => {
      const current = previous[blockId] ?? expandAllRef.current;
      const next = !current;
      // 展开时全局关着 → 手风琴：同轮其它块全部收起
      if (next && !expandAllRef.current) {
        const cleared: Record<string, boolean> = {};
        for (const sibling of siblingIds) cleared[sibling] = false;
        cleared[blockId] = true;
        return cleared;
      }
      return { ...previous, [blockId]: next };
    });
  }, []);

  return useMemo(() => ({ expandAll, isOpen, toggle }), [expandAll, isOpen, toggle]);
}
