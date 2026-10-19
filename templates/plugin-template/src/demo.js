/**
 * 模板插件的演示数据：一个跨卡片 / L1 共享的计数器。
 *
 * 真实插件应把这里换成自己的数据层（localStorage / IndexedDB / 宿主 API），
 * 并让 Agent 工具与 UI 操作共享同一个数据源。复制模板后记得把 storage key
 * `plugin.template.demoCount` 里的 template 换成新插件 id。
 */

import { useCallback, useEffect, useState } from 'react';

export const DEMO_STORAGE_KEY = 'plugin.template.demoCount';
const DEFAULT_DEMO_COUNT = 3;

function readStoredCount() {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw === null) return DEFAULT_DEMO_COUNT;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_DEMO_COUNT;
  } catch {
    return DEFAULT_DEMO_COUNT;
  }
}

function persistCount(count) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, String(count));
  } catch {
    // 独立演示或隐私模式下 localStorage 可能不可写；内存中的 state 仍可工作
  }
}

/** 卡片与详情共享的演示计数；另一个 iframe 文档更新时通过 storage 事件同步。 */
export function useDemoCount() {
  const [count, setCount] = useState(readStoredCount);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== DEMO_STORAGE_KEY && event.key !== null) return;
      setCount(readStoredCount());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((amount = 1) => {
    const delta = Number.isFinite(amount) ? Math.round(amount) : 1;
    setCount((previous) => {
      const next = Math.max(0, previous + delta);
      persistCount(next);
      return next;
    });
  }, []);

  return [count, add];
}
