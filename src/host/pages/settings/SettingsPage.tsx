/**
 * 设置页（B1）：主题 / 开机自启 / 快捷键 / 插件入口 / Agent 入口 / 退出。
 *
 * 宽屏两栏（左侧导航 + 右侧内容），窄屏单栏（导航变成横向 Tab）。
 * 所有颜色/间距/圆角走 Fluent token；不自造控件（Switch/TabList/RadioGroup 都是 Fluent）。
 */

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import {
  Badge,
  Button,
  Divider,
  MessageBar,
  MessageBarBody,
  Radio,
  RadioGroup,
  Spinner,
  Switch,
  Tab,
  TabList,
  Text,
  Title3,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';

import { getPluginManager, usePlugins } from '../../plugins';
import {
  autostartIsEnabled,
  autostartSetEnabled,
  isTauriRuntime,
} from '../../plugins/tauri';
import type { HostPage } from '../../shell/routes';
import { quitApplication } from '../../shell/useGlobalShortcuts';
import { PageScaffold } from '../shared/PageScaffold';
import { useMediaQuery, WIDE_PAGE_QUERY } from '../shared/useMediaQuery';

export type SettingsSection =
  | 'general'
  | 'appearance'
  | 'shortcuts'
  | 'plugins'
  | 'agent'
  | 'about';

export interface SettingsPageProps {
  onBack: () => void;
  onNavigate: (page: HostPage) => void;
  notify: (text: string) => void;
  /** 当前主题；不传表示 App 层还没接管主题 */
  themeMode?: 'dark' | 'light';
  onThemeModeChange?: (mode: 'dark' | 'light') => void;
  /** Agent 面板入口；不传则显示“D 阶段接入” */
  onOpenAgent?: () => void;
}

type AutostartState = 'loading' | 'enabled' | 'disabled' | 'unsupported' | 'error';

const SHORTCUTS: { keys: string; action: string; scope: string }[] = [
  { keys: 'Ctrl + Shift + H', action: '隐藏 / 显示桌面层', scope: '全局' },
  { keys: 'Ctrl + Q', action: '退出应用', scope: '全局' },
  { keys: 'Esc', action: '退出编辑模式 / 返回桌面', scope: '桌面 / 页面' },
  { keys: 'Tab', action: '在小组件之间移动焦点', scope: '桌面' },
  { keys: '长按 500ms', action: '进入编辑模式', scope: '桌面' },
  { keys: '方向键 + Delete', action: '编辑模式下移动 / 删除小组件', scope: '桌面' },
];

const SECTION_TITLES: Record<SettingsSection, string> = {
  general: '常规',
  appearance: '外观',
  shortcuts: '快捷键',
  plugins: '插件',
  agent: 'Agent',
  about: '关于',
};

const useStyles = makeStyles({
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(180px, 240px) minmax(0, 1fr)',
    gap: tokens.spacingHorizontalXXL,
    alignItems: 'start',
    paddingTop: tokens.spacingVerticalL,
  },
  layoutNarrow: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: tokens.spacingVerticalL,
  },
  nav: {
    position: 'sticky',
    top: tokens.spacingVerticalM,
  },
  content: {
    display: 'grid',
    gap: tokens.spacingVerticalL,
    minWidth: 0,
  },
  section: {
    display: 'grid',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  sectionHead: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
  },
  sectionHint: {
    color: tokens.colorNeutralForeground3,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  rowText: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  rowDescription: {
    color: tokens.colorNeutralForeground3,
  },
  rowControl: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  shortcutRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  shortcutKeys: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
  },
  shortcutScope: {
    color: tokens.colorNeutralForeground3,
  },
  dangerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  valueBadge: {
    fontVariantNumeric: 'tabular-nums',
  },
});

export function SettingsPage({
  onBack,
  onNavigate,
  notify,
  themeMode,
  onThemeModeChange,
  onOpenAgent,
}: SettingsPageProps) {
  const styles = useStyles();
  const wide = useMediaQuery(WIDE_PAGE_QUERY);
  const [section, setSection] = useState<SettingsSection>('general');
  const [autostart, setAutostart] = useState<AutostartState>('loading');
  const [autostartBusy, setAutostartBusy] = useState(false);
  const { plugins, loading: pluginsLoading, reload: reloadPlugins } = usePlugins();
  const manager = getPluginManager();

  useEffect(() => {
    let active = true;
    if (!isTauriRuntime()) {
      setAutostart('unsupported');
      return;
    }
    autostartIsEnabled()
      .then((enabled) => {
        if (active) setAutostart(enabled ? 'enabled' : 'disabled');
      })
      .catch(() => {
        if (active) setAutostart('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const onAutostartChange = async (enabled: boolean) => {
    setAutostartBusy(true);
    setAutostart(enabled ? 'enabled' : 'disabled');
    try {
      await autostartSetEnabled(enabled);
      notify(enabled ? '已开启开机自启' : '已关闭开机自启');
    } catch (error) {
      setAutostart((current) => (current === 'enabled' ? 'disabled' : 'enabled'));
      notify(`开机自启设置失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setAutostartBusy(false);
    }
  };

  const themeValue = themeMode ?? 'dark';
  const themeEditable = typeof onThemeModeChange === 'function';

  const pluginSummary = useMemo(() => {
    if (pluginsLoading) return '扫描中…';
    if (plugins.length === 0) return '还没有插件';
    return `${plugins.length} 个插件 · ${plugins.reduce((sum, plugin) => sum + plugin.widgets.length, 0)} 个组件`;
  }, [plugins, pluginsLoading]);

  const renderGeneral = () => (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <Title3>启动</Title3>
          <Text size={200} className={styles.sectionHint}>
            启动器是全屏无边框窗口，正常启动即铺满整块屏幕。
          </Text>
        </div>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text weight="semibold">开机自启</Text>
            <Text size={200} className={styles.rowDescription}>
              写入当前用户的注册表启动项，开机后直接进入桌面。
            </Text>
          </div>
          <div className={styles.rowControl}>
            {autostart === 'loading' && <Spinner size="tiny" />}
            <Switch
              checked={autostart === 'enabled'}
              disabled={autostart === 'loading' || autostart === 'unsupported' || autostart === 'error' || autostartBusy}
              onChange={(_event, data) => {
                void onAutostartChange(data.checked);
              }}
              label={autostart === 'enabled' ? '已开启' : '已关闭'}
            />
          </div>
        </div>
        {autostart === 'unsupported' && (
          <MessageBar intent="info">
            <MessageBarBody>浏览器演示模式：开机自启只在 Tauri 运行时可用。</MessageBarBody>
          </MessageBar>
        )}
        {autostart === 'error' && (
          <MessageBar intent="warning">
            <MessageBarBody>读取开机自启状态失败，可能是注册表权限受限。</MessageBarBody>
          </MessageBar>
        )}
        <Divider />
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text weight="semibold">启动时全屏</Text>
            <Text size={200} className={styles.rowDescription}>
              窗口创建时即全屏，不显示标题栏和边框。
            </Text>
          </div>
          <Badge appearance="tint" color="success">
            已启用
          </Badge>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <Title3>退出</Title3>
          <Text size={200} className={styles.sectionHint}>
            Esc 不会退出应用；退出只走这里或全局快捷键 Ctrl + Q。
          </Text>
        </div>
        <div className={styles.dangerRow}>
          <div className={styles.rowText}>
            <Text weight="semibold">退出启动器</Text>
            <Text size={200} className={styles.rowDescription}>
              插件 iframe 会随应用一起关闭，缓存数据由各插件自己保存。
            </Text>
          </div>
          <Button appearance="secondary" onClick={() => void quitApplication(notify)}>
            退出应用
          </Button>
        </div>
      </div>
    </>
  );

  const renderAppearance = () => (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <Title3>主题</Title3>
        <Text size={200} className={styles.sectionHint}>
          所有组件使用 Fluent 2 的深色 / 亮色主题，颜色取自 token，不写死色值。
        </Text>
      </div>
      <RadioGroup
        value={themeValue}
        layout="horizontal"
        disabled={!themeEditable}
        onChange={(_event, data) => {
          if (data.value === 'dark' || data.value === 'light') onThemeModeChange?.(data.value);
        }}
      >
        <Radio value="dark" label="深色（默认）" />
        <Radio value="light" label="亮色" />
      </RadioGroup>
      {!themeEditable && (
        <MessageBar intent="info">
          <MessageBarBody>
            主题由 App 层的 FluentProvider 控制；接线传入 onThemeModeChange 后这里可切换。
          </MessageBarBody>
        </MessageBar>
      )}
      <Divider />
      <div className={styles.row}>
        <div className={styles.rowText}>
          <Text weight="semibold">卡片材质</Text>
          <Text size={200} className={styles.rowDescription}>
            半透明 Fluent 背景色 + 统一模糊（项目 token --wtsl-material-blur）。
          </Text>
        </div>
        <Badge appearance="outline">Fluent 2</Badge>
      </div>
    </div>
  );

  const renderShortcuts = () => (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <Title3>全局与桌面快捷键</Title3>
        <Text size={200} className={styles.sectionHint}>
          全局快捷键在任意页面生效；桌面相关的按键由桌面层在自身状态里处理。
        </Text>
      </div>
      {SHORTCUTS.map((shortcut) => (
        <div key={shortcut.keys} className={styles.shortcutRow}>
          <div className={styles.shortcutKeys}>
            <Badge appearance="tint" color="informative" className={styles.valueBadge}>
              {shortcut.keys}
            </Badge>
            <Text size={300}>{shortcut.action}</Text>
          </div>
          <Text size={200} className={styles.shortcutScope}>
            {shortcut.scope}
          </Text>
        </div>
      ))}
    </div>
  );

  const renderPlugins = () => (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <Title3>插件</Title3>
        <Text size={200} className={styles.sectionHint}>
          插件决定桌面上有什么。安装后自动扫描，无需重启。
        </Text>
      </div>
      <div className={styles.row}>
        <div className={styles.rowText}>
          <Text weight="semibold">已安装</Text>
          <Text size={200} className={styles.rowDescription}>
            {pluginSummary} · 数据源：{manager.sourceKind ?? '探测中'}
          </Text>
        </div>
        <div className={styles.rowControl}>
          <Button
            appearance="secondary"
            onClick={() => {
              void reloadPlugins();
              notify('已重新扫描插件目录');
            }}
          >
            重新扫描
          </Button>
          <Button appearance="primary" onClick={() => onNavigate('plugins')}>
            打开插件管理
          </Button>
        </div>
      </div>
      <Divider />
      <div className={styles.row}>
        <div className={styles.rowText}>
          <Text weight="semibold">安装插件</Text>
          <Text size={200} className={styles.rowDescription}>
            把插件 zip 拖进窗口即可解压安装到 plugins/&lt;id&gt;/（Tauri 运行时）。
          </Text>
        </div>
        <Button appearance="secondary" onClick={() => onNavigate('plugins')}>
          去安装
        </Button>
      </div>
    </div>
  );

  const renderAgent = () => (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <Title3>Agent</Title3>
        <Text size={200} className={styles.sectionHint}>
          内置 Agent 面板；复盘页可以从这里直接进入 Agent 对话。
        </Text>
      </div>
      <div className={styles.row}>
        <div className={styles.rowText}>
          <Text weight="semibold">Agent 面板</Text>
          <Text size={200} className={styles.rowDescription}>
            {onOpenAgent ? '打开对话面板（浮层 / 侧栏形态由 Agent 层决定）。' : 'D 阶段接入，接线后这里可打开面板。'}
          </Text>
        </div>
        <Button appearance="primary" disabled={!onOpenAgent} onClick={onOpenAgent}>
          打开 Agent
        </Button>
      </div>
      <Divider />
      <div className={styles.row}>
        <div className={styles.rowText}>
          <Text weight="semibold">模型与语音</Text>
          <Text size={200} className={styles.rowDescription}>
            MiMo 模型 Key、语音、人脸唤醒在 Agent 模块里配置。
          </Text>
        </div>
        <Badge appearance="outline">D 阶段</Badge>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <Title3>Windows Tablet Launcher</Title3>
        <Text size={200} className={styles.sectionHint}>
          给 Windows 平板用的全屏小组件桌面，所有功能来自插件。
        </Text>
      </div>
      <div className={styles.row}>
        <Text size={200} className={styles.muted}>
          宿主外壳
        </Text>
        <Text size={200}>Fluent 2 · Tauri 2 · React 19</Text>
      </div>
      <Divider />
      <div className={styles.row}>
        <Text size={200} className={styles.muted}>
          路由
        </Text>
        <Text size={200}>?page=settings / review / plugins</Text>
      </div>
    </div>
  );

  const sections: Record<SettingsSection, () => ReactElement> = {
    general: renderGeneral,
    appearance: renderAppearance,
    shortcuts: renderShortcuts,
    plugins: renderPlugins,
    agent: renderAgent,
    about: renderAbout,
  };

  return (
    <PageScaffold
      title="设置"
      subtitle="外观、启动行为、快捷键与插件入口"
      onBack={onBack}
      actions={
        <Button appearance="secondary" onClick={() => onNavigate('review')}>
          复盘
        </Button>
      }
      maxContentWidth="1080px"
    >
      <div className={wide ? styles.layout : mergeClasses(styles.layout, styles.layoutNarrow)}>
        <TabList
          vertical={wide}
          selectedValue={section}
          className={wide ? styles.nav : undefined}
          onTabSelect={(_event, data) => {
            if (typeof data.value === 'string') setSection(data.value as SettingsSection);
          }}
          aria-label="设置分区"
        >
          {(Object.keys(SECTION_TITLES) as SettingsSection[]).map((key) => (
            <Tab key={key} value={key}>
              {SECTION_TITLES[key]}
            </Tab>
          ))}
        </TabList>
        <div className={styles.content}>{sections[section]()}</div>
      </div>
    </PageScaffold>
  );
}
