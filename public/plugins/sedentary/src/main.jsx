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
  readDays,
  readSettings,
  seedDemoData,
  statsForRange,
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
      '读取久坐状态：当前是坐着还是站立、当前状态持续分钟、今日久坐/站立分钟、起身次数、提醒阈值与距提醒时间',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.today',
    description: '读取今日久坐/站立分钟、最长连续、起身次数与最近 7 天记录',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.standUp',
    description: '记录一次起身：坐着→站立，结算本轮久坐并暂停久坐计时（UI：坐着时的「我站起来了」）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.sitDown',
    description: '记录坐下：站立→坐着，结算站立时长并开始新一轮久坐（UI：站立时的「我坐下了」）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.snooze',
    description: '把已到阈值的久坐提醒推迟 5 分钟（仅坐着时可用；UI：详情「稍后 5 分钟」）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.stats',
    description: '复盘用：按区间汇总久坐分钟、站立分钟、起身次数、最长连续坐与按天起身次数',
    parameters: {
      type: 'object',
      properties: {
        range: {
          type: 'string',
          enum: ['today', 'week', 'month'],
          description: '统计范围，默认 today',
        },
        from: { type: 'string', description: '自定义开始时间（ISO），可选' },
        to: { type: 'string', description: '自定义结束时间（ISO），可选' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'sedentary.settings.get',
    description: '读取久坐提醒设置（与宿主设置页同一份配置）',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'sedentary.settings.set',
    description:
      '修改久坐提醒设置（只改传入的字段）：enabled、strongReminder、thresholdMin、remindEveryMin',
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
    // 旧配置（越界数字 / 已删除的免打扰字段）先收敛成设置页可渲染的形状
    void migrateSettings();
    return () => engine.stop();
  }, []);

  useAgentTools(AGENT_TOOLS, {
    'sedentary.status': async () => toolStatus(await readSettings()),
    'sedentary.today': () => toolToday(),
    'sedentary.standUp': async () => {
      const settings = await readSettings();
      if (!settings.enabled) throw new Error('久坐提醒已关闭');
      const outcome = await getEngine().standUp('agent');
      if (!outcome.changed) throw new Error('当前已经是站立状态');
      return { posture: 'standing', today: outcome.day, status: toolStatus(settings) };
    },
    'sedentary.sitDown': async () => {
      const settings = await readSettings();
      if (!settings.enabled) throw new Error('久坐提醒已关闭');
      const outcome = await getEngine().sitDown('agent');
      if (!outcome.changed) throw new Error('当前已经是坐着状态');
      return { posture: 'sitting', today: outcome.day, status: toolStatus(settings) };
    },
    'sedentary.snooze': async () => {
      const settings = await readSettings();
      if (!settings.enabled) throw new Error('久坐提醒已关闭');
      if (!describeState(settings).snoozable) throw new Error('当前没有可推迟的提醒');
      const outcome = await getEngine().snooze();
      if (!outcome) throw new Error('当前不在久坐计时中');
      return { snoozedUntil: outcome.snoozedUntil, status: toolStatus(settings) };
    },
    'sedentary.stats': async (args = {}) => statsForRange(readDays(), args.range, new Date(), args.from, args.to),
    'sedentary.settings.get': async () => ({ settings: await readSettings() }),
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
