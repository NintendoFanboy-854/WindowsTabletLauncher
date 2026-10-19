/**
 * 倒数日配置读写 hook。
 *
 * 为什么不用 `_shared/host.js` 的 `useStoredConfig`：宿主把卡片 iframe 的
 * `configSnapshot` 转交给浮层 iframe 时，快照可能落后于 localStorage（浮层 iframe
 * 第一次收到 host:init 后，`useStoredConfig` 会认为“已经有值”而不再向宿主重读）。
 * 倒数日 L1 每次打开都要看到最新事件，因此这里在 mount 与每次 storage 事件后
 * 都向宿主 `getConfig` 重读一次；键名、normalize 与写入行为保持不变。
 *
 * 卡片与浮层是不同文档，宿主写 `plugin.countdown.<key>` 后两边都会收到 storage
 * 事件，所以设置页/Agent 工具的修改能即时同步。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { plugin } from '/plugin-sdk.js';
import { initialConfigValue } from '../../../_shared/host.js';

/**
 * @param {string} key 宿主配置键（items / settings）
 * @param {unknown} fallback 读取失败/为空时的兜底值
 * @param {(value: unknown) => unknown} normalize 读取侧归一化
 * @returns [value, setValue, loaded]
 */
export function usePluginConfig(key, fallback, normalize) {
  const normalizeRef = useRef(normalize);
  normalizeRef.current = normalize;
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const initial = initialConfigValue(key);
  const [value, setValueState] = useState(() =>
    normalizeRef.current ? normalizeRef.current(initial) : initial ?? fallback,
  );
  const [loaded, setLoaded] = useState(initial !== undefined);
  const aliveRef = useRef(true);
  /** 读取序号：用户写入会让仍在途的旧读取失效，避免晚到的快照覆盖新值 */
  const readSeqRef = useRef(0);

  useEffect(
    () => () => {
      aliveRef.current = false;
    },
    [],
  );

  const read = useCallback(async () => {
    const seq = ++readSeqRef.current;
    let stored = null;
    try {
      stored = await plugin.getConfig(key);
    } catch {
      stored = null;
    }
    if (!aliveRef.current || seq !== readSeqRef.current) return;
    setValueState(
      normalizeRef.current ? normalizeRef.current(stored) : stored ?? fallbackRef.current,
    );
    setLoaded(true);
  }, [key]);

  // mount 时一定向宿主重读：浮层的 init 快照可能落后于 localStorage。
  useEffect(() => {
    void read();
  }, [read]);

  useEffect(() => {
    const storageKey = `plugin.${plugin.pluginId}.${key}`;
    const onStorage = (event) => {
      if (event.key !== null && event.key !== storageKey) return;
      void read();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, read]);

  const setValue = useCallback(
    (next) => {
      // 让在途读取作废，避免慢返回的旧值覆盖刚写入的新值
      readSeqRef.current += 1;
      setValueState((previous) => {
        const resolved = typeof next === 'function' ? next(previous) : next;
        plugin.setConfig(key, resolved).catch(() => {});
        return resolved;
      });
    },
    [key],
  );

  return [value, setValue, loaded];
}
