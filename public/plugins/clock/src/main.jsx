/** 时钟插件入口：卡片视图 / 设置视图（?settings=1，宿主全窗口浮层加载）。 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { getOverlayView, startHostCapture, useHostTheme } from '../../_shared/host.js';
import ClockApp from './ClockApp.jsx';
import ClockSettings from './ClockSettings.jsx';

// 必须在 React 挂载前注册：host:init 可能早于组件树渲染到达
startHostCapture();

function Root() {
  const { theme } = useHostTheme();
  const overlayView = getOverlayView();
  return (
    <FluentProvider
      theme={theme}
      style={{ width: '100%', height: '100%', background: 'transparent', colorScheme: 'normal' }}
    >
      {overlayView === 'settings' ? <ClockSettings /> : <ClockApp />}
    </FluentProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<Root />);
}
