/**
 * 久坐提醒入口：卡片视图 / L1 详情 + background iframe 的计时引擎与 Agent 工具。
 *
 * - 宿主 manifest 声明 `background: true`，后台 iframe 地址带 `&background=1`；
 *   这个 iframe 只跑 `SedentaryEngine`（不可见、不渲染 UI），是提醒与统计的
 *   唯一写者，并在 `plugin.ready` 里注册全部 Agent 工具；
 * - 卡片 / 详情只读 storage 状态并把动作写成 `sedentary.command`；
 * - 设置视图已删除：设置只来自 manifest `settings` schema，由宿主设置页渲染。
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
} from '../../_shared/host.js';
import SedentaryApp from './SedentaryApp.jsx';
import SedentaryDetail from './SedentaryDetail.jsx';
import { devSizeKey } from './sizes.js';
import {
  describeState,
  getEngine,
  migrateSettings,
  readSettings,
  seedDemoData,
  storedSettings,
  toolStatus,
  toolToday,
  updateSettings,
} from './data/engine.js';

// 必须在 React 挂载前注册：host:init 可能早于组件树渲染到达
startHostCapture();

const query = new URLSearchParams(location.search);
const overlayView = getOverlayView();
const backgroundMode = query.get('background') === '1';
const fallbackSizeKey = devSizeKey();

/** Agent 工具声明：与 UI 路径一一对应（docs/components/sedentary.md） */
const AGENT_TOOLS = [
  {
    name: 'sedentary.status',
    description:
      '读取久坐状态：是否在久坐、当前连续分钟、提醒阈值、距提醒还有多久、是否免打扰或已稍后',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.today',
    description: '读取今日累计久坐、最长连续、起身次数与最近 7 天记录',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.takeBreak',
    description: '结算当前一轮久坐并记一次起身（UI：卡片 / 详情「我起来了」）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.snooze',
    description: '把已到阈值的久坐提醒推迟 5 分钟（UI：详情「稍后 5 分钟」）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.settings.get',
    description: '读取久坐提醒设置（与宿主设置页同一份配置）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.settings.set',
    description:
      '修改久坐提醒设置（只改传入的字段）：enabled、strongReminder、thresholdMin、remindEveryMin、quietHours',
    parameters: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', description: '启用久坐提醒' },
        strongReminder: { type: 'boolean', description: '全屏强提醒；false 时只发通知' },
        thresholdMin: {
          type: 'number',
          minimum: 5,
          maximum: 120,
          description: '连续久坐多少分钟后提醒',
        },
        remindEveryMin: {
          type: 'number',
          minimum: 1,
          maximum: 60,
          description: '提醒后仍未起身的再催间隔',
        },
        quietHours: {
          type: 'object',
          description: '免打扰时段 { start, end }；两端都传空字符串即关闭',
          properties: {
            start: { type: 'string', description: 'HH:MM' },
            end: { type: 'string', description: 'HH:MM' },
          },
          required: ['start', 'end'],
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
];

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
  useEffect(() => {
    const engine = getEngine();
    engine.start();
    // 旧配置（quietHours:null / 越界数字）先收敛成设置页可渲染的形状
    void migrateSettings();
    return () => engine.stop();
  }, []);

  useAgentTools(AGENT_TOOLS, {
    'sedentary.status': async () => toolStatus(await readSettings()),
    'sedentary.today': () => toolToday(),
    'sedentary.takeBreak': async () => {
      const settings = await readSettings();
      if (!settings.enabled) throw new Error('久坐提醒已关闭');
      const today = await getEngine().takeBreak('agent');
      return { recorded: true, today, status: toolStatus(settings) };
    },
    'sedentary.snooze': async () => {
      const settings = await readSettings();
      if (!settings.enabled) throw new Error('久坐提醒已关闭');
      if (!describeState(settings).snoozable) throw new Error('当前没有可推迟的提醒');
      const outcome = await getEngine().snooze();
      if (!outcome) throw new Error('当前没有进行中的久坐计时');
      return { snoozedUntil: outcome.snoozedUntil, status: toolStatus(settings) };
    },
    'sedentary.settings.get': async () => ({ settings: storedSettings(await readSettings()) }),
    'sedentary.settings.set': async (args) => ({ settings: await updateSettings(args) }),
  });

  return null;
}

function Root() {
  const { theme } = useHostTheme();
  const background = plugin.inHost ? 'transparent' : theme.colorNeutralBackground1;
  let content = <SedentaryApp fallbackSizeKey={fallbackSizeKey} />;
  if (backgroundMode) content = <BackgroundRunner />;
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
