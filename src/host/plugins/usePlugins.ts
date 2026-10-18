/**
 * React 侧取插件列表的小 hook：初始化 + 订阅热重载。
 *
 * 桌面层只需要 `const { plugins, loading, error, reload } = usePlugins();`
 * 实例与 iframe 地址仍走 PluginManager（createInstances / widgetFrameSrc）。
 */

import { useCallback, useEffect, useState } from 'react';

import { toError } from './errors';
import { getPluginManager, type PluginManager } from './manager';
import type { NormalizedPlugin } from './types';

export interface UsePluginsResult {
  plugins: NormalizedPlugin[];
  loading: boolean;
  error: Error | null;
  /** 手动热重载（重新扫描插件目录） */
  reload: () => Promise<void>;
}

export function usePlugins(manager: PluginManager = getPluginManager()): UsePluginsResult {
  const [plugins, setPlugins] = useState<NormalizedPlugin[]>(manager.plugins);
  const [loading, setLoading] = useState(manager.plugins.length === 0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = manager.subscribe((next) => {
      if (!active) return;
      setPlugins(next);
      setLoading(false);
    });
    manager
      .init()
      .catch((reason) => {
        if (active) setError(toError(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [manager]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await manager.reload();
    } catch (reason) {
      setError(toError(reason));
    } finally {
      setLoading(false);
    }
  }, [manager]);

  return { plugins, loading, error, reload };
}
