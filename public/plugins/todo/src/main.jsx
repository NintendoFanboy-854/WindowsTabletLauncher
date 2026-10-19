/**
 * 待办插件入口（DECISIONS D-02b）：
 * - 卡片视图 / 设置浮层（?view=settings）/ 任务详情浮层（?view=detail）/ 全部任务（?view=all）
 *   都由 React + Fluent UI React 渲染；
 * - 后台 iframe（?background=1）不渲染界面，只跑提醒定时器与 Agent 工具；
 * - 独立开发时用 180px 基准单元格模拟卡片（与宿主 iframe 视口一致）。
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  FluentProvider,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { plugin } from '/plugin-sdk.js';
import { getOverlayView, startHostCapture, useHostTheme } from '../../_shared/host.js';
import {
  buildToolHandlers,
  openSettingsView,
  startTodoData,
  TOOL_DECLS,
} from './todoData.js';
import { buildCardSize, parseSizeParam, sizeKeyOf } from './sizes.js';
import TodoApp from './TodoApp.jsx';
import TodoSettings from './settings.jsx';
import TodoDetail from './detail.jsx';
import TodoAllTasks from './allTasks.jsx';

startHostCapture();

const params = new URLSearchParams(location.search);
const isBackground =
  params.get('background') === '1' ||
  params.get('mode') === 'background' ||
  /background\.html$/.test(location.pathname);

const usePreviewStyles = makeStyles({
  page: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: 'hidden',
  },
  pageOverlay: {
    width: '100%',
    height: '100%',
    padding: tokens.spacingVerticalXL,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground2,
    overflow: 'hidden',
  },
  card: {
    overflow: 'hidden',
    borderRadius: tokens.borderRadius2XLarge,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
  },
  dialog: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
  },
});

function PreviewShell({ overlayView, defaultSizeKey, children }) {
  const styles = usePreviewStyles();
  if (overlayView) {
    return (
      <div className={styles.pageOverlay}>
        <div className={styles.dialog}>{children}</div>
      </div>
    );
  }
  const size = buildCardSize(defaultSizeKey);
  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ width: size.width, height: size.height }}>
        {children}
      </div>
    </div>
  );
}

/** 渲染错误态用 Fluent MessageBar（DESIGN §1.2），不整页白屏 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: tokens.spacingVerticalL }}>
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>待办加载出错</MessageBarTitle>
            {String(this.state.error?.message || this.state.error)}
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }
}

function Root() {
  const { theme } = useHostTheme();
  const overlayView = getOverlayView();
  const querySize = parseSizeParam(params.get('size'));
  const defaultSizeKey = querySize ? sizeKeyOf(querySize) : '3x3';
  const standalone = !plugin.inHost;
  // ?raw=1：跳过独立预览外壳，走宿主同款满视口布局（供机器测量/按 iframe 尺寸截图）
  // verify-widgets.mjs 以 ?plugin=&widget=&size= 加载 standalone 页：按宿主 iframe 满视口渲染
  const raw = params.get('raw') === '1' || (params.has('plugin') && params.has('widget'));

  let content = <TodoApp defaultSizeKey={defaultSizeKey} />;
  if (overlayView === 'settings') content = <TodoSettings />;
  else if (overlayView === 'detail') content = <TodoDetail />;
  else if (overlayView === 'all') content = <TodoAllTasks />;

  return (
    <FluentProvider
      theme={theme}
      style={{ width: '100%', height: '100%', background: 'transparent', colorScheme: 'normal' }}
    >
      <ErrorBoundary>
        {standalone && !raw ? (
          <PreviewShell overlayView={overlayView} defaultSizeKey={defaultSizeKey}>
            {content}
          </PreviewShell>
        ) : (
          content
        )}
      </ErrorBoundary>
    </FluentProvider>
  );
}

if (isBackground) {
  // 后台常驻 iframe：没有界面，只保证提醒定时器与 Agent 工具在跑
  // （宿主里提醒的唯一调度者；卡片/浮层实例不启动提醒循环）
  startTodoData();
  const handlers = buildToolHandlers();
  plugin.ready(TOOL_DECLS);
  plugin.onToolCall(async (message) => {
    if (!message || typeof message.name !== 'string') return;
    const handler = handlers[message.name];
    try {
      if (!handler) {
        plugin.toolResult(message.id, false, `未知工具：${message.name}`);
        return;
      }
      plugin.toolResult(message.id, true, await handler(message.args));
    } catch (error) {
      plugin.toolResult(message.id, false, error instanceof Error ? error.message : String(error));
    }
  });
  // 宿主编辑模式点「设置」：后台帧没有界面，交给宿主可用入口
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return;
    if (event.data?.type === 'host:open-settings') openSettingsView();
  });
} else {
  // 宿主里的卡片 / 设置 / 详情 / 全部任务视图只读数据，不跑提醒循环
  // （后台 iframe 负责）；独立打开（无宿主）时由当前实例兜底，提醒照常工作。
  startTodoData({ startReminders: !plugin.inHost });
  const rootElement = document.getElementById('root');
  if (rootElement) createRoot(rootElement).render(<Root />);
}
