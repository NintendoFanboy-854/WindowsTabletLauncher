/**
 * 番茄钟入口：卡片视图 / 详情视图（?view=detail）/ 设置视图（?view=settings）。
 * 详情与设置都装进宿主全窗口 Fluent Dialog；卡片里不做 Dialog/Drawer（D-02b）。
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
import PomodoroApp from './PomodoroApp.jsx';
import PomodoroDetail from './PomodoroDetail.jsx';
import PomodoroSettings from './PomodoroSettings.jsx';
import { devSizeKey } from './sizes.js';
import { seedDemoData } from './data/timer.js';

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
  const background = plugin.inHost ? 'transparent' : theme.colorNeutralBackground1;
  return (
    <FluentProvider
      theme={theme}
      style={{ width: '100%', height: '100%', background, colorScheme: 'normal' }}
    >
      {overlayView === 'settings' ? (
        <PomodoroSettings />
      ) : overlayView === 'detail' ? (
        <PomodoroDetail />
      ) : (
        <PomodoroApp fallbackSizeKey={fallbackSizeKey} />
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
