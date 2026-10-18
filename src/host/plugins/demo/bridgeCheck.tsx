/**
 * A5 桥接层自检页（task-10 验收用）。
 *
 * 在浏览器里直接跑 HostBridge 的核心路由逻辑，不依赖真实 iframe：
 * - 同一插件两个实例：句柄共存、焦点/工具只落到第一个就绪实例；
 * - 注销第一个实例后第二个接管；未就绪实例被跳过；
 * - tool-result 能唤醒 callTool；
 * - 后台 iframe（pluginId:background）能注册并兜住工具调用（todo / sedentary 场景）；
 * - 两个实例的 plugin:call reply 不串。
 *
 * 打开：/src/host/plugins/demo/bridge-check.html，截图即回归证据。
 */

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Badge,
  Button,
  FluentProvider,
  Spinner,
  Text,
  Title2,
  Title3,
  makeStyles,
  tokens,
  webDarkTheme,
} from '@fluentui/react-components';

import {
  HostBridge,
  defaultBridgeServices,
  type PluginFrameHandle,
} from '../../bridge';
import type { PluginReadyMessage } from '../../bridge/types';
import { PluginBackgroundFrames } from '../index';

interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

interface ToolCallRecord {
  id: string;
  name: string;
  args: unknown;
}

interface MockFrame {
  handle: PluginFrameHandle;
  toolCalls: ToolCallRecord[];
  focusCount: number;
  setReady(value: boolean): void;
}

function createMockFrame(uid: string): MockFrame {
  let ready = true;
  const frame: MockFrame = {
    toolCalls: [],
    focusCount: 0,
    setReady(value: boolean) {
      ready = value;
    },
    handle: {
      uid,
      isReady: () => ready,
      reply: () => undefined,
      focusPlugin: () => {
        frame.focusCount += 1;
      },
      toolCall: (id, name, args) => {
        frame.toolCalls.push({ id, name, args });
      },
    },
  };
  return frame;
}

function readyMessage(pluginId: string, toolNames: string[]): PluginReadyMessage {
  return {
    type: 'plugin:ready',
    payload: {
      pluginId,
      widgetId: '',
      tools: toolNames.map((name) => ({ name, description: '' })),
    },
  };
}

async function runChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const check = (name: string, pass: boolean, detail = '') => {
    results.push({ name, pass, detail });
  };

  // ---------- 1. 同插件多实例 ----------
  const bridge = new HostBridge(defaultBridgeServices);
  const listFrame = createMockFrame('todo:todo-list');
  const compactFrame = createMockFrame('todo:todo-compact');
  const unregisterList = bridge.registerFrame('todo', listFrame.handle);
  bridge.registerFrame('todo', compactFrame.handle);

  check(
    '同插件两个实例句柄共存（不再互相覆盖）',
    bridge.frame('todo:todo-list') === listFrame.handle &&
      bridge.frame('todo:todo-compact') === compactFrame.handle,
    '分别按 uid 取到各自的 handle',
  );
  check('按 pluginId 取第一个实例', bridge.frame('todo') === listFrame.handle);

  bridge.focusPlugin('todo');
  check(
    '焦点交给第一个实例',
    listFrame.focusCount === 1 && compactFrame.focusCount === 0,
    `focus: list=${listFrame.focusCount}, compact=${compactFrame.focusCount}`,
  );

  // ---------- 2. 工具路由 + tool-result ----------
  bridge.handleReady(readyMessage('todo', ['todo.stats']));
  const firstToolPromise = bridge.callTool('todo.stats', { from: '2026-10-01' });
  check(
    'callTool 路由到第一个就绪实例',
    listFrame.toolCalls.length === 1 && compactFrame.toolCalls.length === 0,
    `toolCalls: list=${listFrame.toolCalls.length}, compact=${compactFrame.toolCalls.length}`,
  );
  const firstCall = listFrame.toolCalls[0];
  bridge.handleToolResult({
    type: 'plugin:tool-result',
    id: firstCall.id,
    ok: true,
    result: { completed: 7 },
  });
  const firstResult = (await firstToolPromise) as { completed?: number };
  check(
    'plugin:tool-result 唤醒 callTool',
    firstResult.completed === 7,
    `result.completed=${firstResult.completed}`,
  );

  // ---------- 3. 注销首个实例 → 第二个接管 ----------
  unregisterList();
  check(
    '注销后实例从注册表移除',
    bridge.frame('todo:todo-list') === undefined && bridge.frame('todo') === compactFrame.handle,
  );
  const secondToolPromise = bridge.callTool('todo.stats', {});
  check(
    '第二个实例接管工具调用',
    compactFrame.toolCalls.length === 1,
    `compact toolCalls=${compactFrame.toolCalls.length}`,
  );
  bridge.handleToolResult({
    type: 'plugin:tool-result',
    id: compactFrame.toolCalls[0].id,
    ok: true,
    result: { completed: 3 },
  });
  const secondResult = (await secondToolPromise) as { completed?: number };
  check('结果回到第二个实例的调用', secondResult.completed === 3);

  // ---------- 4. 未就绪实例被跳过 / 全未就绪明确报错 ----------
  const readyBridge = new HostBridge(defaultBridgeServices);
  const coldFrame = createMockFrame('pomodoro:cold');
  coldFrame.setReady(false);
  const warmFrame = createMockFrame('pomodoro:warm');
  readyBridge.registerFrame('pomodoro', coldFrame.handle);
  readyBridge.registerFrame('pomodoro', warmFrame.handle);
  readyBridge.handleReady(readyMessage('pomodoro', ['pomodoro.stats']));
  const warmPromise = readyBridge.callTool('pomodoro.stats', {});
  check(
    '跳过未就绪实例，路由到第一个就绪实例',
    coldFrame.toolCalls.length === 0 && warmFrame.toolCalls.length === 1,
    `cold=${coldFrame.toolCalls.length}, warm=${warmFrame.toolCalls.length}`,
  );
  readyBridge.handleToolResult({
    type: 'plugin:tool-result',
    id: warmFrame.toolCalls[0].id,
    ok: true,
    result: { completed: 1 },
  });
  await warmPromise;

  const coldBridge = new HostBridge(defaultBridgeServices);
  const onlyCold = createMockFrame('sedentary:background');
  onlyCold.setReady(false);
  coldBridge.registerFrame('sedentary', onlyCold.handle);
  coldBridge.handleReady(readyMessage('sedentary', ['sedentary.status']));
  let notReadyError = '';
  try {
    await coldBridge.callTool('sedentary.status', {});
  } catch (error) {
    notReadyError = error instanceof Error ? error.message : String(error);
  }
  check('全部实例未就绪时给出明确错误（不再误报“不在桌面”）', notReadyError.includes('还没就绪'), notReadyError);

  // ---------- 5. 后台 iframe 兜住工具调用（sedentary） ----------
  const backgroundBridge = new HostBridge(defaultBridgeServices);
  const sedentaryBackground = createMockFrame('sedentary:background');
  backgroundBridge.registerFrame('sedentary', sedentaryBackground.handle);
  backgroundBridge.handleReady(readyMessage('sedentary', ['sedentary.status']));
  const statusPromise = backgroundBridge.callTool('sedentary.status', {});
  check(
    'background:true 插件可被工具路由（sedentary.status）',
    sedentaryBackground.toolCalls.length === 1,
    `toolCalls=${sedentaryBackground.toolCalls.length}`,
  );
  backgroundBridge.handleToolResult({
    type: 'plugin:tool-result',
    id: sedentaryBackground.toolCalls[0].id,
    ok: true,
    result: { sittingMinutes: 42 },
  });
  const statusResult = (await statusPromise) as { sittingMinutes?: number };
  check(
    '后台插件 tool-result 能收到',
    statusResult.sittingMinutes === 42,
    `sittingMinutes=${statusResult.sittingMinutes}`,
  );

  // ---------- 6. 组件实例与后台实例共存（todo） ----------
  const todoBridge = new HostBridge(defaultBridgeServices);
  const todoWidget = createMockFrame('todo:todo-list');
  const todoBackground = createMockFrame('todo:background');
  const unregisterTodoWidget = todoBridge.registerFrame('todo', todoWidget.handle);
  todoBridge.registerFrame('todo', todoBackground.handle);
  check(
    '组件实例与后台实例共存',
    todoBridge.frame('todo:todo-list') === todoWidget.handle &&
      todoBridge.frame('todo:background') === todoBackground.handle,
  );
  todoBridge.handleReady(readyMessage('todo', ['todo.stats']));
  const todoPromise = todoBridge.callTool('todo.stats', {});
  check(
    '桌面上有组件实例时优先组件实例',
    todoWidget.toolCalls.length === 1 && todoBackground.toolCalls.length === 0,
    `widget=${todoWidget.toolCalls.length}, background=${todoBackground.toolCalls.length}`,
  );
  todoBridge.handleToolResult({
    type: 'plugin:tool-result',
    id: todoWidget.toolCalls[0].id,
    ok: true,
    result: { completed: 5 },
  });
  await todoPromise;

  unregisterTodoWidget();
  const todoBackgroundPromise = todoBridge.callTool('todo.stats', {});
  check(
    '组件卸载后后台 iframe 接管（todo.stats）',
    todoBackground.toolCalls.length === 1,
    `background toolCalls=${todoBackground.toolCalls.length}`,
  );
  todoBridge.handleToolResult({
    type: 'plugin:tool-result',
    id: todoBackground.toolCalls[0].id,
    ok: true,
    result: { completed: 5 },
  });
  await todoBackgroundPromise;

  // ---------- 7. 两个实例的 plugin:call reply 不串 ----------
  const repliesA: string[] = [];
  const repliesB: string[] = [];
  await bridge.handleApiCall(
    'todo',
    { type: 'plugin:call', id: 'c1', method: 'notify', params: { text: 'from A' } },
    (ok) => repliesA.push(`c1:${ok}`),
  );
  await bridge.handleApiCall(
    'todo',
    { type: 'plugin:call', id: 'c2', method: 'notify', params: { text: 'from B' } },
    (ok) => repliesB.push(`c2:${ok}`),
  );
  check(
    '两个实例的 plugin:call reply 不串',
    repliesA.length === 1 &&
      repliesB.length === 1 &&
      repliesA[0] === 'c1:true' &&
      repliesB[0] === 'c2:true',
    `A=[${repliesA.join(',')}] B=[${repliesB.join(',')}]`,
  );

  // ---------- 8. listTools 保留完整声明 / 同名覆盖 ----------
  const declBridge = new HostBridge(defaultBridgeServices);
  declBridge.handleReady({
    type: 'plugin:ready',
    payload: {
      pluginId: 'alpha',
      widgetId: '',
      tools: [
        {
          name: 'alpha.stats',
          description: 'alpha 的统计工具',
          parameters: { type: 'object', properties: { range: { type: 'string' } } },
        },
      ],
    },
  });
  const alphaTool = declBridge.listTools().find((tool) => tool.name === 'alpha.stats');
  check(
    'listTools 返回完整声明（description / parameters 不丢）',
    alphaTool?.description === 'alpha 的统计工具' && !!alphaTool.parameters,
    JSON.stringify(alphaTool ?? null),
  );

  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map((arg) => String(arg)).join(' '));
  };
  try {
    declBridge.handleReady({
      type: 'plugin:ready',
      payload: {
        pluginId: 'beta',
        widgetId: '',
        tools: [{ name: 'alpha.stats', description: 'beta 覆盖后的统计工具' }],
      },
    });
  } finally {
    console.warn = originalWarn;
  }
  const betaFrame = createMockFrame('beta:widget');
  declBridge.registerFrame('beta', betaFrame.handle);
  const overriddenTool = declBridge.listTools().find((tool) => tool.name === 'alpha.stats');
  check(
    '同名工具后注册覆盖且保留 warning 日志',
    overriddenTool?.description === 'beta 覆盖后的统计工具' &&
      warnings.some((line) => line.includes('alpha.stats')),
    `warnings=${warnings.length}`,
  );
  const overridePromise = declBridge.callTool('alpha.stats', {});
  check(
    '覆盖后 callTool 路由到新归属插件',
    betaFrame.toolCalls.length === 1,
    `beta toolCalls=${betaFrame.toolCalls.length}`,
  );
  declBridge.handleToolResult({
    type: 'plugin:tool-result',
    id: betaFrame.toolCalls[0]?.id ?? 'missing',
    ok: true,
    result: { owner: 'beta' },
  });
  await overridePromise;

  return results;
}

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gap: tokens.spacingVerticalL,
    boxSizing: 'border-box',
    height: '100vh',
    overflowY: 'auto',
    padding: tokens.spacingHorizontalXXL,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  headerText: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  list: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '80px minmax(0, 1fr)',
    gap: tokens.spacingHorizontalS,
    alignItems: 'baseline',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  rowBody: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  detail: {
    color: tokens.colorNeutralForeground3,
    fontFamily: tokens.fontFamilyMonospace,
    overflowWrap: 'anywhere',
  },
  loading: {
    display: 'grid',
    placeItems: 'center',
    padding: tokens.spacingVerticalXXXL,
  },
});

function App() {
  const styles = useStyles();
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    void runChecks()
      .then((next) => setResults(next))
      .finally(() => setRunning(false));
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passed = results?.filter((result) => result.pass).length ?? 0;
  const total = results?.length ?? 0;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Title2>A5 桥接自检</Title2>
          <Text size={200} className={styles.hint}>
            task-10 回归：多实例 frame 句柄 · 后台插件工具路由 · tool-result · reply 隔离
          </Text>
        </div>
        <div className={styles.header}>
          {results && (
            <Badge appearance="tint" color={passed === total ? 'success' : 'danger'}>
              {passed}/{total} 通过
            </Badge>
          )}
          <Button appearance="secondary" onClick={run} disabled={running}>
            重新运行
          </Button>
        </div>
      </header>

      {running && !results && (
        <div className={styles.loading}>
          <Spinner label="运行桥接自检…" />
        </div>
      )}

      {results && (
        <>
          <Title3>结果</Title3>
          <div className={styles.list}>
            {results.map((result) => (
              <div key={result.name} className={styles.row}>
                <Badge appearance="tint" color={result.pass ? 'success' : 'danger'}>
                  {result.pass ? 'PASS' : 'FAIL'}
                </Badge>
                <div className={styles.rowBody}>
                  <Text weight="semibold">{result.name}</Text>
                  {result.detail && (
                    <Text size={200} className={styles.detail}>
                      {result.detail}
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Text size={200} className={styles.hint}>
            真实 iframe 挂载由桌面层负责：`PluginWidgetFrame` 暴露 uid/isReady，
            `PluginBackgroundFrames` 传 bridge 后会自动注册 `pluginId:background` 句柄。
          </Text>
          {/* 保证后台组件导出被 typecheck 覆盖（本页不实际挂 iframe） */}
          <span hidden>
            <PluginBackgroundFrames frames={[]} />
          </span>
        </>
      )}
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <FluentProvider theme={webDarkTheme} style={{ height: '100%' }}>
      <App />
    </FluentProvider>,
  );
}
