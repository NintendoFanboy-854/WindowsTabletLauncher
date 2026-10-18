/**
 * Agent 面板演示 / 截图页（vite dev 下访问 `/src/host/agent/demo.html`）。
 *
 * 参数：
 * - `?scenario=overlay`（默认）浮层态，带工具卡片与来源
 * - `?scenario=voice` 全屏语音态（Mock 数据，波形在朗读）
 * - `?scenario=sidebar` 常驻侧栏态
 * - `?scenario=fullscreen` 全屏文字对话
 * - `?scenario=settings` 浮层 + 设置对话框（人脸不可用时显示原因）
 *
 * 页面用 MockTransport 驱动，不依赖任何 API Key。背景只画了几个“假小组件”示意桌面。
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Card,
  FluentProvider,
  Text,
  Title2,
  makeStyles,
  tokens,
  webDarkTheme,
} from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  ClockRegular,
  TimerRegular,
  WeatherMoonRegular,
} from '@fluentui/react-icons';

import { AgentSurface } from '../index';
import { MockTransport } from '../transport/mock';
import { updateSettings } from '../settings';
import { CONVERSATIONS_STORAGE_KEY, ACTIVE_CONVERSATION_STORAGE_KEY, createMessage } from '../storage';
import type { AgentSeed } from '../hooks/useAgentSession';
import type { Message, PanelMode } from '../types';

import '../../../styles.css';

const scenario = new URLSearchParams(window.location.search).get('scenario') ?? 'overlay';

// 每次进入演示页都从干净的会话开始，截图结果可复现
localStorage.removeItem(CONVERSATIONS_STORAGE_KEY);
localStorage.removeItem(ACTIVE_CONVERSATION_STORAGE_KEY);
updateSettings(
  scenario === 'voice'
    ? { mock: true, panelMode: 'fullscreen', tts: { continuous: true } }
    : scenario === 'sidebar'
      ? { mock: true, panelMode: 'sidebar', tts: { continuous: false } }
      : scenario === 'fullscreen'
        ? { mock: true, panelMode: 'fullscreen', tts: { continuous: false } }
        : { mock: true, panelMode: 'overlay', tts: { continuous: false } },
);

function message(
  role: Message['role'],
  content: string,
  extra: Partial<Message> = {},
): Message {
  return createMessage(role, content, { status: 'done', ...extra });
}

const SEARCH_RESULTS = [
  {
    title: 'MiMo V2.6 系列模型更新：1M 上下文、128K 输出',
    url: 'https://mimo.mi.com/docs/zh-CN/updates/model',
    content: 'MiMo V2.6 系列支持文本生成、全模态理解、深度思考、流式输出、函数调用、结构化输出和联网搜索。',
  },
  {
    title: 'OpenAI Chat Completions API 兼容',
    url: 'https://mimo.mi.com/docs/zh-CN/api/chat/openai-api',
    content: '请求地址 https://api.xiaomimimo.com/v1/chat/completions，SSE 流式返回。',
  },
];

const OVERLAY_MESSAGES: Message[] = [
  message('user', '搜一下 MiMo V2.6 的最新消息，顺便把番茄钟设为 25 分钟。'),
  message(
    'assistant',
    'MiMo V2.6 三个型号都支持 **1M 上下文** 和 **128K 输出**，深度思考、函数调用、流式输出、联网搜索都已支持。\n\n番茄钟已设为 25 分钟，结束我会提醒你。\n\n来源：\n1. [MiMo V2.6 系列模型更新](https://mimo.mi.com/docs/zh-CN/updates/model)\n2. [OpenAI Chat Completions API 兼容](https://mimo.mi.com/docs/zh-CN/api/chat/openai-api)',
    {
      toolCalls: [
        {
          id: 'demo-search',
          name: 'web__search',
          args: { query: 'MiMo V2.6 最新消息' },
          status: 'success',
          result: { query: 'MiMo V2.6 最新消息', results: SEARCH_RESULTS },
        },
        {
          id: 'demo-fetch',
          name: 'web__fetch',
          args: { url: 'https://mimo.mi.com/docs/zh-CN/updates/model' },
          status: 'error',
          error: '抓取网页失败：HTTP 403；备用 Reader：连接超时',
        },
        {
          id: 'demo-pomodoro',
          name: 'pomodoro__start',
          args: { minutes: 25 },
          status: 'success',
          result: { started: true, minutes: 25 },
        },
      ],
      sources: SEARCH_RESULTS.map((item) => ({ title: item.title, url: item.url })),
    },
  ),
];

const VOICE_MESSAGES: Message[] = [
  message('user', '我需要把周三评审的材料整理成三页。'),
  message(
    'assistant',
    '好，我梳理一下：第一页放结论和关键指标，第二页放对比数据与截图，第三页放风险和下一步。需要我现在把待办里那条「整理周三评审材料」标成进行中吗？',
    { reasoning: '用户要的是结构建议，不需要调用工具。' },
  ),
];

interface ScenarioConfig {
  mode: PanelMode;
  open: boolean;
  seed: AgentSeed;
  settingsOpen?: boolean;
}

const SCENARIOS: Record<string, ScenarioConfig> = {
  overlay: { mode: 'overlay', open: true, seed: { messages: OVERLAY_MESSAGES } },
  voice: {
    mode: 'fullscreen',
    open: true,
    seed: {
      messages: VOICE_MESSAGES,
      voice: { active: true, stage: 'speaking' },
    },
  },
  sidebar: { mode: 'sidebar', open: true, seed: { messages: OVERLAY_MESSAGES } },
  fullscreen: { mode: 'fullscreen', open: true, seed: { messages: OVERLAY_MESSAGES } },
  settings: {
    mode: 'overlay',
    open: true,
    seed: { messages: OVERLAY_MESSAGES },
    settingsOpen: true,
  },
  // 空会话，页面加载后自动点一个建议，用来验证“真实发送 → Mock 流式 → 工具卡片”链路
  interact: { mode: 'overlay', open: true, seed: { messages: [] } },
};

const config = SCENARIOS[scenario] ?? SCENARIOS.overlay;
const mockTransport = new MockTransport();

const useStyles = makeStyles({
  desktop: {
    height: '100%',
    padding: tokens.spacingHorizontalXXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    background:
      'radial-gradient(1200px 800px at 15% -10%, rgba(90, 120, 200, 0.35), transparent 60%), radial-gradient(900px 700px at 110% 110%, rgba(150, 90, 200, 0.25), transparent 55%), #0e0f13',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalL,
    maxWidth: '1100px',
  },
  widget: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    backdropFilter: 'blur(24px)',
    color: tokens.colorNeutralForeground1,
    minHeight: '128px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    justifyContent: 'center',
  },
  widgetTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
  },
  big: {
    fontSize: tokens.fontSizeHero700,
    lineHeight: tokens.lineHeightHero700,
    fontWeight: tokens.fontWeightSemibold,
  },
  caption: {
    position: 'fixed',
    insetBlockEnd: tokens.spacingVerticalS,
    insetInlineStart: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground4,
  },
});

function DemoDesktop() {
  const styles = useStyles();
  return (
    <div className={styles.desktop}>
      <div className={styles.header}>
        <Title2>Windows 平板桌面</Title2>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          Agent 模块演示（Mock 数据） · scenario={scenario}
        </Text>
      </div>
      <div className={styles.grid}>
        <Card className={styles.widget}>
          <div className={styles.widgetTitle}>
            <ClockRegular />
            <Text size={200}>时钟</Text>
          </div>
          <Text className={styles.big}>09:41</Text>
          <Text size={200}>10 月 18 日 · 周六</Text>
        </Card>
        <Card className={styles.widget}>
          <div className={styles.widgetTitle}>
            <CheckmarkCircleRegular />
            <Text size={200}>今日待办</Text>
          </div>
          <Text size={400} weight="semibold">
            给客户回邮件
          </Text>
          <Text size={400} weight="semibold">
            整理周三评审材料
          </Text>
        </Card>
        <Card className={styles.widget}>
          <div className={styles.widgetTitle}>
            <WeatherMoonRegular />
            <Text size={200}>上海天气</Text>
          </div>
          <Text className={styles.big}>23°</Text>
          <Text size={200}>多云转晴 · 18–24°C</Text>
        </Card>
        <Card className={styles.widget}>
          <div className={styles.widgetTitle}>
            <TimerRegular />
            <Text size={200}>番茄钟</Text>
          </div>
          <Text className={styles.big}>25:00</Text>
          <Text size={200}>专注中</Text>
        </Card>
      </div>
      <Text className={styles.caption} size={100}>
        src/host/agent/demo.html
      </Text>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluentProvider theme={webDarkTheme} style={{ height: '100%' }}>
      <DemoDesktop />
      <AgentSurface
        transport={mockTransport}
        seed={config.seed}
        open={config.open}
        mode={config.mode}
        hideFab
        defaultSettingsOpen={config.settingsOpen}
      />
    </FluentProvider>
  </StrictMode>,
);

// ?scenario=interact：自动点第一条建议，跑通“发送 → 流式回复 → 工具卡片”
if (scenario === 'interact') {
  window.setTimeout(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const suggestion = buttons.find((button) =>
      button.textContent?.includes('今天还有什么待办'),
    );
    suggestion?.click();
  }, 800);
}

// TEMP 诊断：打印麦克风按钮的计算样式
if (scenario === 'voice') {
  const probe = document.createElement('div');
  probe.id = 'agent-style-probe';
  probe.style.cssText = 'position:fixed;left:8px;top:64px;color:#fff;font:12px monospace;z-index:99999;background:#000a;padding:6px;white-space:pre';
  document.body.appendChild(probe);
  window.setTimeout(() => {
    const el = document.querySelector('[aria-label="开始录音"]') as HTMLElement | null;
    if (!el) { probe.textContent = 'mic not found'; return; }
    const cs = getComputedStyle(el);
    probe.textContent = [
      'rect ' + JSON.stringify(el.getBoundingClientRect()),
      'styleAttr ' + el.getAttribute('style'),
      'computed width=' + cs.width + ' height=' + cs.height + ' minW=' + cs.minWidth + ' flex=' + cs.flex,
      'class ' + el.className,
    ].join('\n');
  }, 1200);
}