/**
 * Apple Music 插件入口。
 *
 * - `?view=detail` → 宿主 large 浮层里的播放详情；
 * - 无 view → 桌面卡片；
 * - `startHostCapture()` 必须在 React 挂载前调用（host:init 可能更早到达）。
 */

import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';

import { getOverlayView, startHostCapture, useHostTheme } from '../../_shared/host.js';
import AppleMusicApp from './AppleMusicApp.jsx';
import Detail from './Detail.jsx';

startHostCapture();

function Root() {
  const { theme, scheme } = useHostTheme();
  const overlayView = getOverlayView();
  return (
    <FluentProvider
      theme={theme}
      /*
       * `colorScheme` 必须跟随主题注入的亮暗，不能写死 `normal`：
       * 写死等于告诉浏览器「这个子树永远是浅色」，深色面板里的原生滚动条
       * （详情滚动区、L2 内容区）会渲染成刺眼的白条。这里传 'dark' / 'light'
       * 让滚动条、原生控件与 Fluent surface 同侧。
       */
      style={{ width: '100%', height: '100%', background: 'transparent', colorScheme: scheme }}
    >
      {overlayView === 'detail' ? <Detail /> : <AppleMusicApp />}
    </FluentProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<Root />);
}
