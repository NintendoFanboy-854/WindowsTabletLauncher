/**
 * 宿主入口：主题 → 通知服务 → 页面路由（桌面 / 设置 / 复盘 / 插件）。
 *
 * 接线约定（B 阶段产物）：
 * - 主题模式由 App 持有，传给 FluentProvider 与设置页；
 * - 通知/强提醒由 NotificationsProvider 接管，替换 fallback services；
 * - `?page=` 路由与全局快捷键来自 src/host/shell；
 * - 桌面层自己从全局单例拿 PluginManager / HostBridge。
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';

import { getHostBridge } from './bridge';
import type { HostBridge } from './bridge';
import { AgentSurface } from './agent';
import { applySeeds } from './bootstrap/seeds';
import Desktop from './desktop/Desktop';
import { NotificationsProvider, useHostNotifications } from './notifications';
import { PluginsPage } from './pages/plugins/PluginsPage';
import { ReviewPage } from './pages/review/ReviewPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import {
  PageTransition,
  applyColorSchemeToDocument,
  onSystemColorSchemeChange,
  readThemeMode,
  resolveThemeMode,
  syncAutostartOnStartup,
  useGlobalShortcuts,
  useHostPage,
  writeThemeMode,
} from './shell';
import type { ColorScheme, HostPage, ThemeMode } from './shell';

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
  /** 跟随系统时 systemScheme 变化 → 重新渲染；固定模式忽略 */
  const [systemScheme, setSystemScheme] = useState<ColorScheme>(() => resolveThemeMode('system'));
  const [seeded, setSeeded] = useState(false);
  const bridge = useMemo(() => getHostBridge(), []);

  // 跟随系统：订阅 Windows 亮暗模式变化
  useEffect(() => onSystemColorSchemeChange(setSystemScheme), []);

  const colorScheme: ColorScheme = themeMode === 'system' ? systemScheme : themeMode;

  // 壁纸 / 滚动条 / 原生控件跟随当前生效的亮暗（CSP 下的内联样式不受限）
  useEffect(() => {
    applyColorSchemeToDocument(colorScheme);
  }, [colorScheme]);

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
    writeThemeMode(mode);
  }, []);

  return (
    <FluentProvider
      theme={colorScheme === 'light' ? webLightTheme : webDarkTheme}
      style={{ height: '100%' }}
    >
      {seeded && (
        <NotificationsProvider bridge={bridge}>
          <HostShell
            bridge={bridge}
            themeMode={themeMode}
            colorScheme={colorScheme}
            onThemeModeChange={changeTheme}
          />
        </NotificationsProvider>
      )}
    </FluentProvider>
  );
}

interface HostShellProps {
  bridge: HostBridge;
  themeMode: ThemeMode;
  /** 解析后的亮暗（system 模式下跟随系统），桌面层据此重新读 token 下发给插件 */
  colorScheme: ColorScheme;
  onThemeModeChange: (mode: ThemeMode) => void;
}

function HostShell({ bridge, themeMode, colorScheme, onThemeModeChange }: HostShellProps) {
  const { notify } = useHostNotifications();
  const [page, navigate] = useHostPage();

  useEffect(() => {
    void syncAutostartOnStartup();
  }, []);

  const back = useCallback(() => navigate('desktop'), [navigate]);
  const [agentOpen, setAgentOpen] = useState<boolean>(readAgentParam);
  const openAgent = useCallback(() => setAgentOpen(true), []);

  /**
   * 设置页的目标插件分区。`plugin:request-host-settings` / 编辑模式「设置」都走这里；
   * token 让“同一插件重复请求”也能重新选中（用户可能先手动切到了别的分区）。
   */
  const [settingsTarget, setSettingsTarget] = useState<{
    pluginId: string | null;
    token: number;
  }>({ pluginId: null, token: 0 });
  const openSettings = useCallback(
    (pluginId: string | null = null) => {
      setSettingsTarget((previous) => ({ pluginId, token: previous.token + 1 }));
      navigate('settings');
    },
    [navigate],
  );

  useGlobalShortcuts({
    notify,
    onEscape: () => {
      if (page !== 'desktop') navigate('desktop');
    },
    // Ctrl+,：从任何页面打开设置（v0.3.0 起桌面 dock 已删除，这是设置的主入口之一）
    onOpenSettings: () => openSettings(),
  });

  /** 「外观 → 编辑桌面布局」：回桌面并让桌面层进入编辑模式 */
  const [editModeRequest, setEditModeRequest] = useState(0);
  const editDesktopLayout = useCallback(() => {
    setEditModeRequest((token) => token + 1);
    navigate('desktop');
  }, [navigate]);

  /** 「外观 → 重置布局」：桌面层清掉 wtsl.layout 后按 manifest 默认摆放重算 */
  const [layoutResetRequest, setLayoutResetRequest] = useState(0);
  const resetLayout = useCallback(() => {
    setLayoutResetRequest((token) => token + 1);
  }, []);

  /**
   * 桌面层常驻后，切回桌面时用 replayKey 重放 PageTransition 的淡入。
   * 不能再用 `key={page}`：那会重挂载桌面，插件 iframe（工具调用接收方）跟着
   * 卸载、重建，iframe 数量也会增长。
   */
  const [desktopReplayKey, setDesktopReplayKey] = useState(0);
  const previousPageRef = useRef<HostPage>(page);
  // layout effect：在浏览器绘制前递增并触发重放，避免先闪一帧桌面再淡入
  useLayoutEffect(() => {
    const previous = previousPageRef.current;
    previousPageRef.current = page;
    if (page === 'desktop' && previous !== 'desktop') {
      setDesktopReplayKey((key) => key + 1);
    }
  }, [page]);

  // 非桌面页内容；桌面本体始终挂载在下面的 .host-desktop-layer 里
  let pageContent = null;
  switch (page) {
    case 'settings':
      pageContent = (
        <SettingsPage
          onBack={back}
          onNavigate={navigate}
          notify={notify}
          themeMode={themeMode}
          onThemeModeChange={onThemeModeChange}
          onOpenAgent={openAgent}
          initialPluginId={settingsTarget.pluginId}
          settingsRequestToken={settingsTarget.token}
          onEditDesktopLayout={editDesktopLayout}
          onResetLayout={resetLayout}
        />
      );
      break;
    case 'review':
      pageContent = <ReviewPage bridge={bridge} onBack={back} onOpenAgent={openAgent} />;
      break;
    case 'plugins':
      pageContent = <PluginsPage onBack={back} notify={notify} />;
      break;
    default:
      break;
  }

  return (
    <div className="host-root">
      {/*
        桌面层永远挂载：插件 iframe 与 background 运行时是 HostBridge 工具路由的
        接收方，切到设置/复盘/插件页时整棵卸载会让 todo.stats / pomodoro.stats
        报“插件当前不在桌面”。非桌面页只隐藏（visibility + inert），不卸载。
      */}
      <div
        className="host-desktop-layer"
        data-active={page === 'desktop' ? 'true' : 'false'}
        aria-hidden={page !== 'desktop'}
        inert={page !== 'desktop'}
      >
        <PageTransition replayKey={desktopReplayKey}>
          <Desktop
            bridge={bridge}
            notify={notify}
            active={page === 'desktop'}
            colorScheme={colorScheme}
            editModeRequest={editModeRequest}
            layoutResetRequest={layoutResetRequest}
            onOpenPluginSettings={openSettings}
            onOpenSettings={() => openSettings()}
          />
        </PageTransition>
      </div>

      {page !== 'desktop' && <PageTransition key={page}>{pageContent}</PageTransition>}
      {/* Agent 只有浮空形态：桌面页显示右下角入口按钮，其它页面由设置页「入口」打开 chat */}
      <AgentSurface
        open={agentOpen}
        onOpenChange={setAgentOpen}
        hideEntry={page !== 'desktop'}
      />
    </div>
  );
}


