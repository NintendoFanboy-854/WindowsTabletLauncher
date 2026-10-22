/**
 * 倒数日配置读写 hook。
 *
 * 为什么不用 `_shared/host.js` 的 `useStoredConfig`：倒数日条目是高频内容数据，
 * 这里保留更直接的「mount 必重读 + 序号作废旧响应」策略（早期版本担心浮层 iframe 的
 * host:init 快照落后于 localStorage）。键名、normalize 与写入行为与 `useStoredConfig` 一致。
 *
 * 同步通道：宿主 `plugin.onConfig` 推送 + mount 重读。注意不能依赖 storage 事件：
 * Tauri 打包版宿主页（tauri.localhost）与插件 iframe（wtsl.localhost）不同 origin，
 * storage 事件不会派发到插件文档；storage 监听只作 dev 同源模式兜底。
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

  // 宿主推配置增量（Tauri 跨 origin 的正确通道）：作废在途读取后直接应用。
  useEffect(() => {
    const off = plugin.onConfig?.((changedKey, next) => {
      if (changedKey !== key) return;
      readSeqRef.current += 1;
      setValueState(
        normalizeRef.current ? normalizeRef.current(next) : next ?? fallbackRef.current,
      );
      setLoaded(true);
    });
    return () => {
      off?.();
    };
  }, [key]);

  // dev 同源模式 / 外部直接写 localStorage 的兜底（Tauri 跨 origin 下不会触发）
  useEffect(() => {
    const storageKey = `plugin.${plugin.pluginId}.${key}`;
    const onStorage = (event) => {
      if (event.key !== null && event.key !== storageKey) return;
      void read();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, read]);

  /** 最新值的同步镜像：setValue 的 updater 形式读它，避免把写配置塞进 React 状态 updater */
  const valueRef = useRef(value);
  valueRef.current = value;

  const setValue = useCallback(
    (next) => {
      // 让在途读取作废，避免慢返回的旧值覆盖刚写入的新值
      readSeqRef.current += 1;
      const resolved = typeof next === 'function' ? next(valueRef.current) : next;
      valueRef.current = resolved;
      setValueState(resolved);
      plugin.setConfig(key, resolved).catch(() => {});
    },
    [key],
  );

  return [value, setValue, loaded];
}
