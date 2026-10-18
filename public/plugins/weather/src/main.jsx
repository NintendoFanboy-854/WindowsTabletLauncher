/** 天气插件入口：读设置/缓存 → 挂载 React 应用；同时兼容脱离宿主的独立开发。 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { plugin } from '/plugin-sdk.js';
import WeatherApp from './WeatherApp.jsx';
import { normalizeSettings } from './data/store.js';
import { legacyThemePayload } from './theme.js';
import { parseSizeParam, sizeKeyOf } from './utils.js';

const params = new URLSearchParams(location.search);
const query = Object.fromEntries(params.entries());

// 宿主在 iframe onLoad 时就会发 host:init（见 PluginWidgetFrame），可能早于 React 挂载。
// 这里在模块执行的第一时间注册监听并缓存，bootstrap 时作为初始 size/theme 使用。
let capturedHostInit = null;
let capturedLegacyTheme = null;
plugin.onInit((payload) => {
  if (!capturedHostInit) capturedHostInit = payload;
});
window.addEventListener('message', (event) => {
  const data = event.data;
  if (data?.type === 'wtsl:init' && data.theme && !capturedLegacyTheme) capturedLegacyTheme = data.theme;
});

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  const [rawSettings, rawCache] = await Promise.all([
    withTimeout(plugin.getConfig('settings'), 1500, null),
    withTimeout(plugin.getConfig('cache'), 1500, {}),
  ]);

  let settings = normalizeSettings(rawSettings);
  if (query.mock === '1') settings = { ...settings, mock: true };

  const cache = rawCache && typeof rawCache === 'object' && !Array.isArray(rawCache) ? rawCache : {};
  const hostSize = Array.isArray(capturedHostInit?.size) ? capturedHostInit.size : null;
  const sizeParam = parseSizeParam(query.size);
  const hostTheme = capturedHostInit?.theme || null;
  const legacyTheme = capturedLegacyTheme ? legacyThemePayload(capturedLegacyTheme) : null;
  const themePayload = hostTheme || legacyTheme || { colorScheme: query.theme === 'light' ? 'light' : 'dark' };
  const sizeKey = hostSize ? sizeKeyOf(hostSize) : sizeParam ? sizeKeyOf(sizeParam) : '3x2';

  createRoot(rootElement).render(
    <WeatherApp plugin={plugin} initial={{ settings, cache, sizeKey, themePayload, query }} />,
  );
}

bootstrap();
