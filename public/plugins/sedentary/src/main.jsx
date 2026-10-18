/**
 * 久坐提醒入口：卡片视图 / 详情视图 / 设置视图 + background iframe 的计时引擎。
 *
 * - 宿主 manifest 声明 `background: true`，后台 iframe 地址带 `&background=1`；
 *   这个 iframe 只跑 SedentaryEngine（不可见，无 UI），并注册 Agent 工具。
 * - 卡片 / 详情只读引擎写入的状态并在点击时发打卡命令；
 *   设置/详情是宿主全窗口 Fluent Dialog 里的独立视图（D-02b），卡内不弹 Dialog。
 */

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { plugin } from '/plugin-sdk.js';
import {
  getHostInit,
  getOverlayView,
  startHostCapture,
  useAgentTools,
  useHostTheme,
  useStoredConfig,
} from '../../_shared/host.js';
import SedentaryApp from './SedentaryApp.jsx';
import SedentaryDetail from './SedentaryDetail.jsx';
import SedentarySettings from './SedentarySettings.jsx';
import { devSizeKey } from './sizes.js';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  getEngine,
  normalizeSettings,
  seedDemoData,
  todayStats,
  toolStatus,
} from './data/engine.js';

// 必须在 React 挂载前注册：host:init 可能早于组件树渲染到达
startHostCapture();

const query = new URLSearchParams(location.search);
const overlayView = getOverlayView();
const backgroundMode = query.get('background') === '1';
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

/** 后台 iframe：只跑计时引擎 + Agent 工具，不渲染任何 UI */
function BackgroundRunner() {
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  useEffect(() => {
    const engine = getEngine();
    engine.start();
    return () => engine.stop();
  }, []);
  useAgentTools(
    [
      {
        name: 'sedentary.status',
        description: '读取久坐状态：是否在久坐、当前连续分钟、阈值、距提醒还有多久',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
      {
        name: 'sedentary.today',
        description: '读取今日累计久坐、最长连续与起身次数',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
      {
        name: 'sedentary.takeBreak',
        description: '结算本轮久坐并记一次起身，返回今日统计',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
    ],
    {
      'sedentary.status': () => toolStatus(settings),
      'sedentary.today': () => todayStats(new Date()),
      'sedentary.takeBreak': () => ({ today: getEngine().takeBreak('agent'), status: toolStatus(settings) }),
    },
  );
  return null;
}

function Root() {
  const { theme } = useHostTheme();
  const background = plugin.inHost ? 'transparent' : theme.colorNeutralBackground1;
  let content = <SedentaryApp fallbackSizeKey={fallbackSizeKey} />;
  if (backgroundMode) content = <BackgroundRunner />;
  else if (overlayView === 'settings') content = <SedentarySettings />;
  else if (overlayView === 'detail') content = <SedentaryDetail />;
  return (
    <FluentProvider
      theme={theme}
      style={{ width: '100%', height: '100%', background, colorScheme: 'normal' }}
    >
      {content}
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
