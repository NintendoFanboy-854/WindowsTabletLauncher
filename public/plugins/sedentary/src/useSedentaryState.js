/**
 * 卡片 / L1 共享的久坐状态订阅。
 *
 * 数据来自 `sedentary.runtime` / `sedentary.days`（后台引擎写），
 * 所以这里只做两件事：
 * - 用共享 `useNow` 每秒重算（页面隐藏时暂停，回前台补一拍）；
 * - 监听 storage 事件，其他 iframe（后台引擎 / 设置页）写入后立即刷新。
 */

import { useEffect, useMemo, useReducer } from 'react';
import { useNow } from '../../_shared/ui.jsx';
import { DAYS_KEY, RUNTIME_KEY, describeState } from './data/engine.js';

export function useSedentaryState(settings) {
  const nowMs = useNow(1000);
  const [, bump] = useReducer((value) => value + 1, 0);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === null || event.key === DAYS_KEY || event.key === RUNTIME_KEY) bump();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return useMemo(() => describeState(settings, new Date(nowMs)), [settings, nowMs]);
}
