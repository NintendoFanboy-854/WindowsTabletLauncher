/**
 * 天气插件入口（D-02b 浮层视图架构）：
 * - `?view=settings` → 宿主全窗口浮层里的设置视图
 * - `?view=detail`   → 详情视图
 * - 无 view          → 桌面卡片视图
 *
 * 浮层视图由宿主用整窗 Fluent Dialog 加载同一插件页面并追加 `?view=<name>`，
 * 这样设置/详情不会被卡片 iframe 的边界裁切（docs/PLUGIN-REACT.md）。
 */

import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { getOverlayView, startHostCapture, useHostTheme } from '../../_shared/host.js';
import WeatherApp from './WeatherApp.jsx';
import DetailView from './views/DetailView.jsx';
import SettingsView from './views/SettingsView.jsx';

// 必须在 React 挂载前注册：host:init 可能早于组件树渲染到达
startHostCapture();

function Root() {
  const { theme, scheme } = useHostTheme();
  const overlayView = getOverlayView();
  return (
    <FluentProvider theme={theme} style={{ width: '100%', height: '100%', background: 'transparent' }}>
      {overlayView === 'settings' ? (
        <SettingsView />
      ) : overlayView === 'detail' ? (
        <DetailView scheme={scheme} />
      ) : (
        <WeatherApp scheme={scheme} />
      )}
    </FluentProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<Root />);
}
