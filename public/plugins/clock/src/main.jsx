/**
 * 时钟插件入口。
 *
 * - startHostCapture 必须在 React 挂载前执行；
 * - 设置只声明在 manifest.json，由宿主设置页通用渲染，这里不再有设置视图；
 * - 普通地址渲染卡片，`?view=detail` 渲染 L1/L2 详情浮层。
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';

import { getOverlayView, startHostCapture, useHostTheme } from '../../_shared/host.js';
import ClockApp from './ClockApp.jsx';
import ClockDetail from './ClockDetail.jsx';
import { migrateLegacySettings } from './settings.js';

startHostCapture();
// 旧设置迁移：独立预览时同步写本地键（首帧即可读）；宿主内异步写宿主配置，
// 写后由宿主 host:config 推给所有 iframe（打包版不能用 localStorage 当宿主配置）。
migrateLegacySettings();

function Root() {
  const { theme } = useHostTheme();
  const overlayView = getOverlayView();
  return (
    <FluentProvider
      theme={theme}
      style={{ width: '100%', height: '100%', background: 'transparent', colorScheme: 'normal' }}
    >
      {overlayView === 'detail' ? <ClockDetail /> : <ClockApp />}
    </FluentProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<Root />);
}
