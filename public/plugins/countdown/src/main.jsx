/**
 * 倒数日入口。
 *
 * - 卡片视图（L0）默认渲染；
 * - 宿主用 `?view=detail` 加载同一页面的详情（L1 + L2 Subpage）；
 * - `startHostCapture()` 必须在 React 挂载前执行：host:init 可能早于组件树；
 * - 设置不再有插件内视图，统一走 manifest.settings + 宿主设置页。
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
import CountdownCard from './Card.jsx';
import CountdownDetail from './Detail.jsx';
import { devSizeKey } from './sizes.js';
import { seedDemoData } from './data/items.js';

// 必须在 React 挂载前注册：host:init 可能早于组件树渲染到达
startHostCapture();

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
  // 宿主卡片材质由宿主绘制（透明）；独立打开/截图时用 Fluent 背景色兜底
  const background = plugin.inHost ? 'transparent' : theme.colorNeutralBackground1;
  return (
    <FluentProvider
      theme={theme}
      style={{ width: '100%', height: '100%', background, colorScheme: 'normal' }}
    >
      {overlayView === 'detail' ? (
        <CountdownDetail />
      ) : (
        <CountdownCard fallbackSizeKey={fallbackSizeKey} />
      )}
    </FluentProvider>
  );
}

async function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  await waitForHostInit();
  if (new URLSearchParams(location.search).get('demo') === '1') {
    await seedDemoData();
  }
  createRoot(rootElement).render(<Root />);
}

bootstrap();
