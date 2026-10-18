/**
 * 宿主入口：主题 → 通知服务 → 页面路由（桌面 / 设置 / 复盘 / 插件）。
 *
 * 接线约定（B 阶段产物）：
 * - 主题模式由 App 持有，传给 FluentProvider 与设置页；
 * - 通知/强提醒由 NotificationsProvider 接管，替换 fallback services；
 * - `?page=` 路由与全局快捷键来自 src/host/shell；
 * - 桌面层自己从全局单例拿 PluginManager / HostBridge。
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';

import { getHostBridge } from './bridge';
import type { HostBridge } from './bridge';
import { AgentSurface } from './agent';
import { applySeeds } from './bootstrap/seeds';
import Desktop from './desktop/Desktop';
import { NotificationsProvider, useHostNotifications } from './notifications';
import { PluginsPage } from './pages/plugins/PluginsPage';
import { ReviewPage } from './pages/review/ReviewPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { PageTransition, syncAutostartOnStartup, useGlobalShortcuts, useHostPage } from './shell';
import type { HostPage } from './shell';

const THEME_KEY = 'wtsl.themeMode';
type ThemeMode = 'dark' | 'light';

function readThemeMode(): ThemeMode {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** 截图/调试用：`?agent=1` 直接打开 Agent 面板 */
function readAgentParam(): boolean {
  try {
    return new URLSearchParams(location.search).has('agent');
  } catch {
    return false;
  }
}

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(readThemeMode);
  const [seeded, setSeeded] = useState(false);
  const bridge = useMemo(() => getHostBridge(), []);

  // 先把 public/secrets.json 里的本地密钥写进 localStorage，再渲染界面，
  // 避免插件 iframe 用空配置初始化。
  useEffect(() => {
    let alive = true;
    void applySeeds().finally(() => {
      if (alive) setSeeded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const changeTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* 隐私模式忽略 */
    }
  }, []);

  return (
    <FluentProvider
      theme={themeMode === 'light' ? webLightTheme : webDarkTheme}
      style={{ height: '100%' }}
    >
      {seeded && (
        <NotificationsProvider bridge={bridge}>
          <HostShell bridge={bridge} themeMode={themeMode} onThemeModeChange={changeTheme} />
        </NotificationsProvider>
      )}
    </FluentProvider>
  );
}

interface HostShellProps {
  bridge: HostBridge;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
}

function HostShell({ bridge, themeMode, onThemeModeChange }: HostShellProps) {
  const { notify } = useHostNotifications();
  const [page, navigate] = useHostPage();

  useEffect(() => {
    void syncAutostartOnStartup();
  }, []);

  useGlobalShortcuts({
    notify,
    onEscape: () => {
      if (page !== 'desktop') navigate('desktop');
    },
  });

  const back = useCallback(() => navigate('desktop'), [navigate]);
  const [agentOpen, setAgentOpen] = useState<boolean>(readAgentParam);
  const openAgent = useCallback(() => setAgentOpen(true), []);

  let content;
  switch (page) {
    case 'settings':
      content = (
        <SettingsPage
          onBack={back}
          onNavigate={navigate}
          notify={notify}
          themeMode={themeMode}
          onThemeModeChange={onThemeModeChange}
          onOpenAgent={openAgent}
        />
      );
      break;
    case 'review':
      content = <ReviewPage bridge={bridge} onBack={back} onOpenAgent={openAgent} />;
      break;
    case 'plugins':
      content = <PluginsPage onBack={back} notify={notify} />;
      break;
    default:
      content = <Desktop bridge={bridge} notify={notify} />;
  }

  return (
    <div className="host-root">
      <PageTransition key={page}>{content}</PageTransition>
      {page === 'desktop' && <DesktopDock navigate={navigate} onOpenAgent={openAgent} />}
      <AgentSurface open={agentOpen} onOpenChange={setAgentOpen} hideFab />
    </div>
  );
}

interface DesktopDockProps {
  navigate: (page: HostPage) => void;
  onOpenAgent: () => void;
}

/** 桌面右下入口：设置 / 复盘 / 插件 / Agent */
function DesktopDock({ navigate, onOpenAgent }: DesktopDockProps) {
  return (
    <div className="desktop-dock" role="toolbar" aria-label="桌面入口">
      <Button size="small" appearance="subtle" onClick={onOpenAgent}>
        Agent
      </Button>
      <Button size="small" appearance="subtle" onClick={() => navigate('review')}>
        复盘
      </Button>
      <Button size="small" appearance="subtle" onClick={() => navigate('plugins')}>
        插件
      </Button>
      <Button size="small" appearance="subtle" onClick={() => navigate('settings')}>
        设置
      </Button>
    </div>
  );
}


