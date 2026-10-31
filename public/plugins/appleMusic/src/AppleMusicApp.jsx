/**
 * Apple Music 插件卡片入口与 Agent 工具注册。
 *
 * 工具只在卡片 iframe 注册一次（桌面常驻）；详情浮层是同一个插件页面的另一个
 * iframe，只走 UI，不重复声明工具。所有业务规则 / 文案 / URL 都在本插件目录内。
 */

import { useEffect, useMemo } from 'react';
import { plugin } from '/plugin-sdk.js';

import { useAgentTools } from '../../_shared/host.js';
import Card from './Card.jsx';
import { APPLE_MUSIC_TOOLS, createAppleMusicToolHandlers } from './tools.js';
import { usePlayer } from './player.js';

export default function AppleMusicApp() {
  const player = usePlayer();
  const handlers = useMemo(() => createAppleMusicToolHandlers(), []);
  useAgentTools(APPLE_MUSIC_TOOLS, handlers);

  // 键盘焦点交接：宿主把焦点交给插件时，落到卡片根节点。
  useEffect(() => {
    const off = plugin.onFocus?.(() => {
      document.querySelector('[data-card-root]')?.focus();
    });
    return () => off?.();
  }, []);

  // 卡片视图没有自绘浮层：Esc 把焦点交还宿主。
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') plugin.exitFocus?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return <Card player={player} />;
}
