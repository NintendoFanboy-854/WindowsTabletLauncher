import { useEffect, useState } from 'react';
import { readSettings, subscribeSettings } from '../settings';
import type { AgentSettings } from '../types';

/** 订阅 `agent.settings`（同页事件 + 跨窗口 storage 事件） */
export function useSettings(): AgentSettings {
  const [settings, setSettings] = useState<AgentSettings>(() => readSettings());
  useEffect(
    () =>
      subscribeSettings(() => {
        setSettings(readSettings());
      }),
    [],
  );
  return settings;
}
