/**
 * 模板插件入口。
 *
 * - startHostCapture 必须在 React 挂载前执行；
 * - FluentProvider 使用宿主注入的主题（独立打开时跟随系统）；
 * - 宿主用 `?view=detail` 加载 L1 详情，普通地址渲染卡片。
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { getOverlayView, startHostCapture, useHostTheme } from './shared/host.js';
import Card from './Card.jsx';
import Detail from './Detail.jsx';

startHostCapture();

function Root() {
  const { theme } = useHostTheme();
  const overlayView = getOverlayView();

  return (
    <FluentProvider
      theme={theme}
      style={{ width: '100%', height: '100%', background: 'transparent', colorScheme: 'normal' }}
    >
      {overlayView === 'detail' ? <Detail /> : <Card />}
    </FluentProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<Root />);
}
