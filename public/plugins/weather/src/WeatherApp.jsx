/**
 * 天气卡片视图（L0，桌面 iframe）。
 *
 * - 纯展示：点卡 = `requestOverlay('detail', '天气详情')`；卡片内没有菜单/刷新/设置；
 * - 手势（hover / press / 长按进编辑 / 右键禁用）全部由共享 `CardRoot` 接管；
 * - Agent 工具在这里注册（桌面卡片常驻，L1 浮层打开期间工具仍可用），
 *   工具与 UI 共用 `useWeather` 的同一份数据层。
 */

import { useCallback, useEffect, useMemo } from 'react';
import { plugin } from '/plugin-sdk.js';
import {
  requestOverlay,
  useAgentTools,
  useHostSize,
  useHostTheme,
} from '../../_shared/host.js';
import Card from './components/Card.jsx';
import { useWeather } from './data/useWeather.js';
import { AGENT_TOOLS, createToolHandlers } from './data/tools.js';
import { DEFAULT_SIZE_KEY, sizeKeyOf, urlMockEnabled, urlSizeParam } from './utils.js';

export default function WeatherApp() {
  const { scheme } = useHostTheme();
  const mock = useMemo(() => urlMockEnabled(), []);
  const defaultSize = useMemo(() => urlSizeParam(), []);
  const sizeKey = useHostSize(sizeKeyOf, defaultSize ? sizeKeyOf(defaultSize) : DEFAULT_SIZE_KEY);
  const weather = useWeather({ mock });

  const openDetail = useCallback(() => requestOverlay('detail', '天气详情'), []);

  const toolHandlers = useMemo(
    () => createToolHandlers({ mock, weather }),
    [mock, weather],
  );
  useAgentTools(AGENT_TOOLS, toolHandlers);

  // 键盘焦点交接：宿主把焦点交给插件时，聚焦卡片根节点（CardRoot 的 role=button）
  useEffect(() => {
    const off = plugin.onFocus?.(() => {
      document.querySelector('[data-card-root]')?.focus();
    });
    return () => off?.();
  }, []);

  // 卡片视图没有自绘浮层：Esc 把焦点交还宿主
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') plugin.exitFocus?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <Card
      sizeKey={sizeKey}
      scheme={scheme}
      settings={weather.settings}
      place={weather.place}
      data={weather.data}
      status={weather.status}
      locating={weather.locating}
      onOpenDetail={openDetail}
    />
  );
}
