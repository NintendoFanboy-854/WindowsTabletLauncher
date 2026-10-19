/**
 * 天气插件入口（D-02b 浮层视图架构）。
 *
 * - `?view=detail` → 宿主整窗 Fluent Dialog 里的详情（L1 / L2）；
 * - 无 view → 桌面卡片视图；
 * - 设置不再由插件渲染：全部在 manifest.json 的 settings schema 里，
 *   由宿主设置页通用渲染（`requestHostSettings()` 导航过去）。
 *
 * `startHostCapture()` 必须在 React 挂载前调用：host:init 可能更早到达。
 */

import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { getOverlayView, startHostCapture, useHostTheme } from '../../_shared/host.js';
import WeatherApp from './WeatherApp.jsx';
import DetailView from './views/DetailView.jsx';

startHostCapture();

function Root() {
  const { theme } = useHostTheme();
  const overlayView = getOverlayView();
  return (
    <FluentProvider
      theme={theme}
      style={{ width: '100%', height: '100%', background: 'transparent', colorScheme: 'normal' }}
    >
      {overlayView === 'detail' ? <DetailView /> : <WeatherApp />}
    </FluentProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<Root />);
}
