/**
 * 设置页（B1 + E1）：主题 / 开机自启 / 快捷键 / 桌面布局 / 插件 schema 设置 / Agent / 退出。
 *
 * 密度约定（docs/DENSITY.md §4）：
 * - 一屏一个主任务：本页只做「改设置」，页头只有一个主操作；
 * - 分组靠留白与字号层级，不用卡片边框/分割线（§2 层级表达手段）；
 * - 每行最多 1 个主标签 + 1 句次要说明（foreground3 / base200）+ 1 个控件。
 *
 * 宽屏两栏（左侧导航 + 右侧内容），窄屏单栏（导航变成横向 Tab）。
 * 「插件」条目与每个插件的设置分区都从 PluginManager / manifest 动态生成，
 * 宿主不写死任何插件 id、名称或设置字段。
 */

import { useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import {
  Button,
  MessageBar,
  MessageBarActions,
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

import { getHostBridge } from '../../bridge';
import {
  getPluginManager,
  settingsFieldCount,
  usePlugins,
  type NormalizedPlugin,
} from '../../plugins';
import {
  autostartIsEnabled,
  autostartSetEnabled,
  isTauriRuntime,
} from '../../plugins/tauri';
import type { HostPage } from '../../shell/routes';
import type { ThemeMode } from '../../shell/themeMode';
import { ContentTransition } from '../../shell/ContentTransition';
import { quitApplication } from '../../shell/useGlobalShortcuts';
import { PageScaffold } from '../shared/PageScaffold';
import { useMediaQuery, WIDE_PAGE_QUERY } from '../shared/useMediaQuery';
import { PluginSettings } from './PluginSettings';

/** 平板触控目标 ≥40（DESIGN §1.2 / AUDIT V-06）：Fluent Tab 默认 38px，这里统一抬到 40 */
const TAB_TOUCH_TARGET = { minHeight: '40px' };

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
  /** 当前主题偏好（跟随系统 / 深色 / 亮色）；不传表示 App 层还没接管主题 */
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
  /** Agent 面板入口；不传则显示“D 阶段接入” */
  onOpenAgent?: () => void;
  /** 插件请求设置时直接选中的插件分区（plugin:request-host-settings） */
  initialPluginId?: string | null;
  /** 每次请求自增；同一插件重复请求时也能重新选中 */
  settingsRequestToken?: number;
  /** App 层接线：回到桌面并进入编辑模式（DESIGN §8 外观分组） */
  onEditDesktopLayout?: () => void;
  /** App 层接线：恢复默认卡片摆放（DESKTOP 布局持久化由桌面层处理） */
  onResetLayout?: () => void;
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

/** 当前选中的是固定分区，还是某个插件的 settings schema */
type SettingsView =
  | { kind: 'section'; section: SettingsSection }
  | { kind: 'plugin'; pluginId: string };

function pluginFieldCount(plugin: NormalizedPlugin): number {
  return plugin.settings ? settingsFieldCount(plugin.settings) : 0;
}

function pluginDescription(plugin: NormalizedPlugin): string {
  const fieldCount = pluginFieldCount(plugin);
  if (fieldCount > 0) return `${fieldCount} 个设置项 · 修改即时生效`;
  if (plugin.settings) return 'settings schema 里没有可渲染的字段';
  return '该插件没有声明 settings schema';
}

const useStyles = makeStyles({
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(160px, 200px) minmax(0, 1fr)',
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
    display: 'grid',
    gap: tokens.spacingVerticalL,
    alignContent: 'start',
  },
  navNarrow: {
    display: 'grid',
    gap: tokens.spacingVerticalM,
  },
  pluginNav: {
    display: 'grid',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  pluginNavTitle: {
    color: tokens.colorNeutralForeground3,
    paddingInline: tokens.spacingHorizontalS,
  },
  content: {
    display: 'grid',
    gap: tokens.spacingVerticalXXL,
    minWidth: 0,
    paddingTop: tokens.spacingVerticalXS,
  },
  group: {
    display: 'grid',
    gap: tokens.spacingVerticalL,
    minWidth: 0,
  },
  groupHead: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
  },
  groupHint: {
    color: tokens.colorNeutralForeground3,
  },
  groupBody: {
    display: 'grid',
    gap: tokens.spacingVerticalL,
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
  rowControl: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  description: {
    color: tokens.colorNeutralForeground3,
  },
  shortcutRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  shortcutMain: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  keys: {
    color: tokens.colorNeutralForeground2,
  },
  scope: {
    color: tokens.colorNeutralForeground3,
  },
});

interface SettingsGroupProps {
  title: string;
  hint?: string;
  children: ReactNode;
}

function SettingsGroup({ title, hint, children }: SettingsGroupProps) {
  const styles = useStyles();
  return (
    <section className={styles.group} aria-label={title}>
      <header className={styles.groupHead}>
        <Title3>{title}</Title3>
        {hint && (
          <Text size={200} className={styles.groupHint}>
            {hint}
          </Text>
        )}
      </header>
      <div className={styles.groupBody}>{children}</div>
    </section>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  children?: ReactNode;
}

function SettingsRow({ label, description, children }: SettingsRowProps) {
  const styles = useStyles();
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <Text size={400}>{label}</Text>
        {description && (
          <Text size={200} className={styles.description}>
            {description}
          </Text>
        )}
      </div>
      {children && <div className={styles.rowControl}>{children}</div>}
    </div>
  );
}

export function SettingsPage({
  onBack,
  onNavigate,
  notify,
  themeMode,
  onThemeModeChange,
  onOpenAgent,
  initialPluginId,
  settingsRequestToken,
  onEditDesktopLayout,
  onResetLayout,
}: SettingsPageProps) {
  const styles = useStyles();
  const wide = useMediaQuery(WIDE_PAGE_QUERY);
  const [view, setView] = useState<SettingsView>(() =>
    initialPluginId
      ? { kind: 'plugin', pluginId: initialPluginId }
      : { kind: 'section', section: 'general' },
  );
  const [confirmResetLayout, setConfirmResetLayout] = useState(false);
  const [autostart, setAutostart] = useState<AutostartState>('loading');
  const [autostartBusy, setAutostartBusy] = useState(false);
  const { plugins, loading: pluginsLoading, reload: reloadPlugins } = usePlugins();
  const manager = getPluginManager();

  // 插件 → 宿主：`plugin:request-host-settings`；App 每次请求都会递增 token，
  // 同一插件重复请求、或用户已切到别处时都能重新选中。
  useEffect(() => {
    if (!initialPluginId) return;
    setView({ kind: 'plugin', pluginId: initialPluginId });
  }, [initialPluginId, settingsRequestToken]);

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

  const themeValue = themeMode ?? 'system';
  const themeEditable = typeof onThemeModeChange === 'function';

  const autostartDescription =
    autostart === 'unsupported'
      ? '浏览器演示模式不可用，Tauri 运行时生效'
      : autostart === 'error'
        ? '读取失败，可能注册表权限受限'
        : '写入当前用户的注册表启动项，开机直接进入桌面';

  const pluginSummary = useMemo(() => {
    if (pluginsLoading) return '扫描中…';
    if (plugins.length === 0) return '还没有插件';
    return `${plugins.length} 个插件 · ${plugins.reduce((sum, plugin) => sum + plugin.widgets.length, 0)} 个组件 · ${manager.sourceKind ?? '未知'} 源`;
  }, [plugins, pluginsLoading, manager]);

  const renderGeneral = () => (
    <>
      <SettingsGroup title="启动" hint="启动器是全屏无边框窗口，正常启动即铺满整屏。">
        <SettingsRow label="开机自启" description={autostartDescription}>
          {autostart === 'loading' && <Spinner size="tiny" />}
          <Switch
            checked={autostart === 'enabled'}
            disabled={
              autostart === 'loading' ||
              autostart === 'unsupported' ||
              autostart === 'error' ||
              autostartBusy
            }
            onChange={(_event, data) => {
              void onAutostartChange(data.checked);
            }}
            label={autostart === 'enabled' ? '已开启' : '已关闭'}
          />
        </SettingsRow>
        <SettingsRow label="启动时全屏" description="窗口创建即全屏，不显示标题栏和边框" />
      </SettingsGroup>

      <SettingsGroup title="退出" hint="Esc 只返回桌面，不退出应用；退出走这里或 Ctrl + Q。">
        <SettingsRow label="退出启动器" description="插件 iframe 随应用关闭，缓存数据由各插件自己保存">
          <Button appearance="secondary" size="large" onClick={() => void quitApplication(notify)}>
            退出应用
          </Button>
        </SettingsRow>
      </SettingsGroup>
    </>
  );

  const renderAppearance = () => (
    <>
      <SettingsGroup
        title="主题"
        hint={
          themeEditable
            ? '默认跟随 Windows 的亮暗模式自动切换；也可以固定为深色或亮色。颜色全部来自 Fluent token。'
            : '主题由 App 层的 FluentProvider 控制，接线传入回调后可切换。'
        }
      >
        <SettingsRow label="配色模式">
          <RadioGroup
            value={themeValue}
            layout="horizontal"
            disabled={!themeEditable}
            onChange={(_event, data) => {
              if (data.value === 'dark' || data.value === 'light' || data.value === 'system') {
                onThemeModeChange?.(data.value);
              }
            }}
          >
            <Radio value="system" label="跟随系统（默认）" />
            <Radio value="dark" label="深色" />
            <Radio value="light" label="亮色" />
          </RadioGroup>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup
        title="桌面布局"
        hint="触控长按桌面空白或卡片也能进入编辑模式；这里的按钮是鼠标/键盘的兜底入口。"
      >
        <SettingsRow
          label="编辑桌面布局"
          description="回到桌面并进入编辑模式，可拖动卡片、改尺寸、删除"
        >
          <Button
            appearance="secondary"
            size="large"
            disabled={!onEditDesktopLayout || pluginsLoading}
            onClick={onEditDesktopLayout}
          >
            编辑桌面布局
          </Button>
        </SettingsRow>
        <SettingsRow
          label="重置布局"
          description="恢复默认卡片摆放与页数；当前摆放会丢失"
        >
          <Button
            appearance="secondary"
            size="large"
            disabled={!onResetLayout || pluginsLoading}
            onClick={() => setConfirmResetLayout(true)}
          >
            重置布局
          </Button>
        </SettingsRow>
        {confirmResetLayout && (
          <MessageBar intent="warning">
            <MessageBarBody>
              将恢复默认卡片摆放，当前每页的卡片位置会丢失。插件与卡片数据不受影响。
            </MessageBarBody>
            <MessageBarActions>
              <Button
                appearance="secondary"
                size="large"
                onClick={() => setConfirmResetLayout(false)}
              >
                取消
              </Button>
              <Button
                appearance="primary"
                size="large"
                onClick={() => {
                  onResetLayout?.();
                  setConfirmResetLayout(false);
                  notify('已恢复默认布局');
                }}
              >
                确认重置
              </Button>
            </MessageBarActions>
          </MessageBar>
        )}
      </SettingsGroup>
    </>
  );

  const renderShortcuts = () => (
    <SettingsGroup title="快捷键" hint="全局快捷键在任意页面生效；桌面相关按键由桌面层处理。">
      {SHORTCUTS.map((shortcut) => (
        <div key={shortcut.keys} className={styles.shortcutRow}>
          <div className={styles.shortcutMain}>
            <Text size={200} className={styles.keys}>
              {shortcut.keys}
            </Text>
            <Text size={300}>{shortcut.action}</Text>
          </div>
          <Text size={200} className={styles.scope}>
            {shortcut.scope}
          </Text>
        </div>
      ))}
    </SettingsGroup>
  );

  const selectPlugin = (pluginId: string) => {
    setView({ kind: 'plugin', pluginId });
  };

  const renderPlugins = () => (
    <>
      <SettingsGroup title="插件" hint="插件决定桌面上有什么；安装后自动扫描，无需重启。">
        <SettingsRow label="已安装" description={pluginSummary}>
          <Button
            appearance="secondary"
            size="large"
            onClick={() => {
              void reloadPlugins();
              notify('已重新扫描插件目录');
            }}
          >
            重新扫描
          </Button>
          <Button appearance="primary" size="large" onClick={() => onNavigate('plugins')}>
            插件管理
          </Button>
        </SettingsRow>
        <SettingsRow label="安装插件" description="把插件 zip 拖进窗口即解压到 plugins/<id>/">
          <Button appearance="secondary" size="large" onClick={() => onNavigate('plugins')}>
            去安装
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup
        title="可配置项"
        hint="设置由插件的 manifest.json 声明；修改即时保存。列表从已安装插件动态生成。"
      >
        {pluginsLoading && <Spinner size="tiny" label="扫描插件目录…" />}
        {!pluginsLoading && plugins.length === 0 && (
          <Text size={200} className={styles.description}>
            还没有插件。安装后这里会出现它们的设置分区。
          </Text>
        )}
        {!pluginsLoading &&
          plugins.map((plugin) => (
            <SettingsRow
              key={plugin.id}
              label={plugin.name}
              description={pluginDescription(plugin)}
            >
              {pluginFieldCount(plugin) > 0 ? (
                <Button
                  appearance="secondary"
                  size="large"
                  onClick={() => selectPlugin(plugin.id)}
                >
                  配置
                </Button>
              ) : (
                <Text size={200} className={styles.description}>
                  无可配置项
                </Text>
              )}
            </SettingsRow>
          ))}
      </SettingsGroup>
    </>
  );

  const renderAgent = () => (
    <SettingsGroup title="Agent" hint="模型、语音与工具调度在 Agent 模块里配置（D 阶段）。">
      <SettingsRow
        label="Agent 面板"
        description={onOpenAgent ? '对话与工具调用入口' : 'D 阶段接入，接线后可从桌面或这里打开'}
      >
        <Button appearance="primary" size="large" disabled={!onOpenAgent} onClick={onOpenAgent}>
          打开 Agent
        </Button>
      </SettingsRow>
    </SettingsGroup>
  );

  const renderAbout = () => (
    <SettingsGroup title="Windows Tablet Launcher" hint="给 Windows 平板用的全屏小组件桌面，能力全部来自插件。">
      <SettingsRow label="宿主外壳" description="Fluent 2 · Tauri 2 · React 19" />
      <SettingsRow label="数据保存" description="配置与统计都保存在本机，不上传第三方。" />
    </SettingsGroup>
  );

  const renderPluginSettings = (pluginId: string): ReactElement => {
    const plugin = plugins.find((candidate) => candidate.id === pluginId) ?? null;
    if (pluginsLoading && !plugin) return <Spinner label="扫描插件目录…" />;
    if (!plugin) {
      return (
        <MessageBar intent="warning">
          <MessageBarBody>{`找不到插件「${pluginId}」，它可能已被卸载。`}</MessageBarBody>
        </MessageBar>
      );
    }
    // key 必须按插件隔离：PluginSettings 内部持有已读配置的 state，
    // 复用一个实例切换分区会把上个插件的 raw 写进当前插件（B5 数据覆盖）。
    return <PluginSettings key={plugin.id} plugin={plugin} bridge={getHostBridge()} notify={notify} />;
  };

  const sections: Record<SettingsSection, () => ReactElement> = {
    general: renderGeneral,
    appearance: renderAppearance,
    shortcuts: renderShortcuts,
    plugins: renderPlugins,
    agent: renderAgent,
    about: renderAbout,
  };

  const selectedSection = view.kind === 'section' ? view.section : undefined;
  const selectedPluginId = view.kind === 'plugin' ? view.pluginId : undefined;
  /** 分区切换的内容键：变化时内容 150ms 淡入 + 4px 上移（MOTION §5） */
  const contentKey = view.kind === 'section' ? `section:${view.section}` : `plugin:${view.pluginId}`;

  return (
    <PageScaffold
      title="设置"
      subtitle="启动行为、外观、快捷键与插件设置"
      onBack={onBack}
      actions={
        <Button appearance="secondary" size="large" onClick={() => onNavigate('review')}>
          复盘
        </Button>
      }
      maxContentWidth="1040px"
    >
      <div className={wide ? styles.layout : mergeClasses(styles.layout, styles.layoutNarrow)}>
        <nav className={wide ? styles.nav : styles.navNarrow} aria-label="设置导航">
          <TabList
            vertical={wide}
            size="large"
            selectedValue={selectedSection ?? ''}
            onTabSelect={(_event, data) => {
              if (typeof data.value === 'string') {
                setView({ kind: 'section', section: data.value as SettingsSection });
              }
            }}
            aria-label="设置分区"
          >
            {(Object.keys(SECTION_TITLES) as SettingsSection[]).map((key) => (
              <Tab key={key} value={key} style={TAB_TOUCH_TARGET}>
                {SECTION_TITLES[key]}
              </Tab>
            ))}
          </TabList>

          {plugins.length > 0 && (
            <div className={styles.pluginNav}>
              <Text size={200} weight="semibold" className={styles.pluginNavTitle}>
                插件设置
              </Text>
              <TabList
                vertical
                size="small"
                selectedValue={selectedPluginId ?? ''}
                onTabSelect={(_event, data) => {
                  if (typeof data.value === 'string') selectPlugin(data.value);
                }}
                aria-label="插件设置分区"
              >
                {plugins.map((plugin) => (
                  <Tab key={plugin.id} value={plugin.id} style={TAB_TOUCH_TARGET}>
                    {plugin.name}
                  </Tab>
                ))}
              </TabList>
            </div>
          )}
        </nav>

        <ContentTransition className={styles.content} viewKey={contentKey}>
          {view.kind === 'section' ? sections[view.section]() : renderPluginSettings(view.pluginId)}
        </ContentTransition>
      </div>
    </PageScaffold>
  );
}
