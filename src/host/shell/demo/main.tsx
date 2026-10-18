/**
 * B 阶段（宿主外壳）最小演示页：验证设置页 / 复盘页 / 插件管理页 / 通知 / 强提醒 /
 * 页面路由，以及全局快捷键接线。
 *
 * 打开方式（vite dev）：
 *   /src/host/shell/demo.html?page=settings
 *   /src/host/shell/demo.html?page=review
 *   /src/host/shell/demo.html?page=plugins
 *   /src/host/shell/demo.html?reminder=1   // 弹一条演示强提醒
 *   /src/host/shell/demo.html?theme=light  // 亮色
 *
 * 正式接线在 App.tsx（Lead 负责）：这个文件只负责把页面拼起来展示。
 */

import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Badge,
  Button,
  FluentProvider,
  Tab,
  TabList,
  Text,
  Title2,
  makeStyles,
  tokens,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';

import { getHostBridge } from '../../bridge';
import { NotificationsProvider, useHostNotifications } from '../../notifications';
import { PluginsPage, ReviewPage, SettingsPage } from '../../pages';
import {
  HOST_PAGES,
  PAGE_TITLES,
  PageTransition,
  useGlobalShortcuts,
  useHostPage,
  type HostPage,
} from '../index';
import { createMockReviewBridge } from './mockReviewBridge';

const bridge = getHostBridge();
const mockReviewBridge = createMockReviewBridge();

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalXXL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    '@media (max-width: 760px)': {
      padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    },
  },
  brand: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
  },
  brandHint: {
    color: tokens.colorNeutralForeground3,
  },
  spacer: { flex: 1 },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  content: {
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',
  },
  desktop: {
    display: 'grid',
    placeItems: 'center',
    height: '100%',
    padding: tokens.spacingHorizontalXXL,
  },
  desktopInner: {
    display: 'grid',
    justifyItems: 'center',
    textAlign: 'center',
    gap: tokens.spacingVerticalL,
    maxWidth: '560px',
  },
  desktopActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
});

function readThemeParam(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return new URLSearchParams(window.location.search).get('theme') === 'light' ? 'light' : 'dark';
}

interface DemoAppProps {
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
}

function DesktopPlaceholder({ onNavigate }: { onNavigate: (page: HostPage) => void }) {
  const styles = useStyles();
  return (
    <div className={styles.desktop}>
      <div className={styles.desktopInner}>
        <Title2>桌面层</Title2>
        <Text>
          桌面由 <code>src/host/desktop</code>（A3/A4）提供。这个演示页只负责 B 外壳：
          设置、复盘、插件管理、通知与强提醒、全局快捷键。
        </Text>
        <div className={styles.desktopActions}>
          <Button appearance="primary" onClick={() => onNavigate('settings')}>
            打开设置
          </Button>
          <Button appearance="secondary" onClick={() => onNavigate('review')}>
            打开复盘
          </Button>
          <Button appearance="secondary" onClick={() => onNavigate('plugins')}>
            插件管理
          </Button>
        </div>
        <Text size={200} className={styles.hint}>
          Ctrl + Shift + H 隐藏/显示（Tauri 运行时）、Ctrl + Q 退出、Esc 返回桌面
        </Text>
      </div>
    </div>
  );
}

function DemoApp({ themeMode, onToggleTheme }: DemoAppProps) {
  const styles = useStyles();
  const [page, navigate] = useHostPage();
  const { notify, showReminder } = useHostNotifications();
  const reminderShown = useRef(false);

  useGlobalShortcuts({
    notify,
    onEscape: () => {
      if (page !== 'desktop') navigate('desktop');
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reminder') !== '1' || reminderShown.current) return;
    reminderShown.current = true;
    void showReminder({
      title: '该起来动一动了',
      message: '已经连续坐了 50 分钟。站起来走两步，接杯水再回来。',
      actions: [
        { id: 'ok', text: '知道了', kind: 'primary' },
        { id: 'snooze', text: '5 分钟后提醒', kind: 'secondary' },
      ],
      autoDismissSec: 120,
    }).then((result) => {
      notify(result.actionId ? `强提醒：选择了 ${result.actionId}` : '强提醒已关闭');
    });
  }, [showReminder, notify]);

  const renderPage = () => {
    switch (page) {
      case 'settings':
        return (
          <SettingsPage
            onBack={() => navigate('desktop')}
            onNavigate={navigate}
            notify={notify}
            themeMode={themeMode}
            onThemeModeChange={() => onToggleTheme()}
            onOpenAgent={() => notify('Agent 面板：D 阶段接入')}
          />
        );
      case 'review':
        return (
          <ReviewPage
            bridge={mockReviewBridge}
            onBack={() => navigate('desktop')}
            onOpenAgent={() => notify('Agent 面板：D 阶段接入')}
            sourceLabel="演示数据（mock bridge）"
          />
        );
      case 'plugins':
        return <PluginsPage onBack={() => navigate('desktop')} notify={notify} />;
      case 'desktop':
      default:
        return <DesktopPlaceholder onNavigate={navigate} />;
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Text weight="semibold">Windows Tablet Launcher</Text>
          <Text size={200} className={styles.brandHint}>
            宿主外壳 · B 阶段演示
          </Text>
        </div>
        <Badge appearance="tint" color="brand">
          {PAGE_TITLES[page]}
        </Badge>
        <TabList
          selectedValue={page}
          onTabSelect={(_event, data) => {
            if (typeof data.value === 'string') navigate(data.value as HostPage);
          }}
          aria-label="页面导航"
        >
          {HOST_PAGES.map((hostPage) => (
            <Tab key={hostPage} value={hostPage}>
              {PAGE_TITLES[hostPage]}
            </Tab>
          ))}
        </TabList>
        <div className={styles.spacer} />
        <div className={styles.headerActions}>
          <Button appearance="secondary" onClick={() => notify('这是一条宿主通知（BridgeServices.notify）')}>
            测试通知
          </Button>
          <Button
            appearance="secondary"
            onClick={() => {
              void showReminder({
                title: '强提醒演示',
                message: '这条提示覆盖全屏，带 action 按钮；点按钮会 resolve actionId。',
                actions: [
                  { id: 'ok', text: '知道了', kind: 'primary' },
                  { id: 'later', text: '稍后', kind: 'secondary' },
                ],
              }).then((result) => notify(result.actionId ? `你点了 ${result.actionId}` : '提醒已关闭'));
            }}
          >
            测试强提醒
          </Button>
          <Button appearance="subtle" onClick={onToggleTheme}>
            {themeMode === 'dark' ? '亮色' : '深色'}
          </Button>
        </div>
      </header>
      <div className={styles.content}>
        <PageTransition key={page}>{renderPage()}</PageTransition>
      </div>
    </div>
  );
}

function Root() {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(readThemeParam);
  return (
    <FluentProvider theme={themeMode === 'dark' ? webDarkTheme : webLightTheme} style={{ height: '100%' }}>
      <NotificationsProvider bridge={bridge}>
        <DemoApp
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((mode) => (mode === 'dark' ? 'light' : 'dark'))}
        />
      </NotificationsProvider>
    </FluentProvider>
  );
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
}
