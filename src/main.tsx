import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './host/App';
import { applyColorSchemeToDocument, readThemeMode, resolveThemeMode } from './host/shell/themeMode';
import './styles.css';

// 在 React 挂载前把亮暗写到 <html>：首帧壁纸/滚动条就正确，避免浅色系统上闪一下深色。
applyColorSchemeToDocument(resolveThemeMode(readThemeMode()));

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
