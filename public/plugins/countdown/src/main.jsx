/**
 * 倒数日入口：卡片视图 / 设置视图（?view=settings）/ 编辑视图（?view=edit）。
 * 宿主把设置/编辑都装在全窗口 Fluent Dialog 里（DECISIONS D-02b），
 * 卡片 iframe 里不弹 Dialog，避免被卡片边界裁切。
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { plugin } from '/plugin-sdk.js';
import {
  getHostInit,
  getOverlayView,
  startHostCapture,
  useHostTheme,
} from '../../_shared/host.js';
import CountdownApp from './CountdownApp.jsx';
import CountdownSettings from './CountdownSettings.jsx';
import CountdownEditor from './CountdownEditor.jsx';
import { devSizeKey } from './sizes.js';
import { seedDemoData } from './data/items.js';

// 必须在 React 挂载前注册：host:init 可能早于组件树渲染到达
startHostCapture();

const query = new URLSearchParams(location.search);
const overlayView = getOverlayView();
const fallbackSizeKey = devSizeKey();

function waitForHostInit(timeoutMs = 2500) {
  if (!plugin.inHost || getHostInit()) return Promise.resolve();
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (getHostInit() || Date.now() - started > timeoutMs) {
        window.clearInterval(timer);
        resolve();
      }
    }, 30);
  });
}

function Root() {
  const { theme } = useHostTheme();
  // 宿主里卡片材质由宿主绘制（透明）；独立打开/截图时用 Fluent 背景色兜底
  const background = plugin.inHost ? 'transparent' : theme.colorNeutralBackground1;
  return (
    <FluentProvider
      theme={theme}
      style={{ width: '100%', height: '100%', background, colorScheme: 'normal' }}
    >
      {overlayView === 'settings' ? (
        <CountdownSettings />
      ) : overlayView === 'edit' ? (
        <CountdownEditor />
      ) : (
        <CountdownApp fallbackSizeKey={fallbackSizeKey} />
      )}
    </FluentProvider>
  );
}

async function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  await waitForHostInit();
  if (query.get('demo') === '1') {
    await seedDemoData();
  }
  createRoot(rootElement).render(<Root />);
}

bootstrap();
