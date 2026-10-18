/**
 * 插件管理器最小演示页（A2 验收用）。
 *
 * 打开方式：vite dev 下访问 `/src/host/plugins/demo.html`。
 * 它只演示插件管理器本身：扫描结果、每个组件挂 iframe、background 常驻 iframe、
 * 热重载、zip 拖入安装（Tauri 运行时）。宿主页面（桌面 / 设置 / 插件管理页）由
 * 各自的模块接入，不从这里长出来。
 *
 * 注意：这里的 8 个宿主 API 只是演示页的最小兜底实现；正式实现属于桥接层（A5）。
 * 桌面层 / 桥接层接入 `PluginWidgetFrame` 的 `onApiCall` 时不要再抄这份。
 */

import { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Badge,
  Button,
  FluentProvider,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Text,
  Title2,
  makeStyles,
  tokens,
  webDarkTheme,
} from '@fluentui/react-components';

import {
  PluginBackgroundFrames,
  PluginWidgetFrame,
  getLocation,
  getIdleSeconds,
  getPluginManager,
  isTauriRuntime,
  readFluentThemePayload,
  setKeepAwake,
  usePlugins,
  type HostApiReply,
  type PluginCallMessage,
  type ThemePayload,
  type WidgetInstance,
} from '../index';

const manager = getPluginManager();
const isTauri = isTauriRuntime();

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
    height: '100vh',
    boxSizing: 'border-box',
    padding: tokens.spacingHorizontalXXL,
    gap: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  headerText: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
  },
  headerSpacer: { flex: 1 },
  headerBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)',
    gap: tokens.spacingHorizontalL,
    minHeight: 0,
    '@media (max-width: 960px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
  column: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: tokens.spacingVerticalM,
    minHeight: 0,
  },
  columnLeft: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    gap: tokens.spacingVerticalM,
    minHeight: 0,
  },
  installCard: {
    display: 'grid',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px dashed ${tokens.colorNeutralStroke1}`,
  },
  columnTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  summaryList: {
    display: 'grid',
    gap: tokens.spacingVerticalM,
    alignContent: 'start',
    overflowY: 'auto',
    paddingRight: tokens.spacingHorizontalXS,
  },
  summaryCard: {
    display: 'grid',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  summaryHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    alignItems: 'center',
  },
  mono: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    overflowWrap: 'anywhere',
  },
  frameGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalM,
    alignContent: 'start',
    overflowY: 'auto',
    paddingRight: tokens.spacingHorizontalXS,
  },
  frameCard: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    minHeight: tokens.spacingVerticalXXXL,
  },
  frameHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
  },
  frameBody: {
    position: 'relative',
    minHeight: '120px',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  empty: {
    display: 'grid',
    placeItems: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXXL,
    color: tokens.colorNeutralForeground3,
  },
  footer: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  dragOverlay: {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    backgroundColor: tokens.colorBackgroundOverlay,
    border: `2px dashed ${tokens.colorBrandStroke1}`,
    zIndex: 1000,
    pointerEvents: 'none',
  },
});

function readJson(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function configKey(pluginId: string, key: string): string {
  return `wtsl.demo.plugin.${pluginId}.${key}`;
}

function frameSrcFor(instance: WidgetInstance): string {
  try {
    return manager.widgetFrameSrc(instance);
  } catch {
    return 'about:blank';
  }
}

function App() {
  const styles = useStyles();
  const { plugins, loading, error, reload } = usePlugins(manager);
  const [theme, setTheme] = useState<ThemePayload | undefined>(undefined);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    setTheme(readFluentThemePayload());
    return () => {
      if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    };
  }, []);

  const showNotice = useCallback((text: string) => {
    setNotice(text);
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 4000);
  }, []);

  // zip 拖入安装（仅 Tauri 运行时真正挂监听）
  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    void manager
      .attachZipDrop({
        onDragStateChange: setDragging,
        onInstalled: (plugin) => showNotice(`已安装插件「${plugin.name}」（${plugin.id}）`),
        onError: (reason) => showNotice(`安装失败：${reason.message}`),
      })
      .then((disposeListener) => {
        if (cancelled) disposeListener();
        else dispose = disposeListener;
      });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [showNotice]);

  const instances = useMemo(
    () => (loading ? [] : manager.createInstances({ cols: 8, rows: 5 })),
    // plugins 变化（重扫/安装）后重新摆一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plugins, loading],
  );

  const backgroundFrames = useMemo(() => {
    if (loading) return [];
    return manager.backgroundPlugins().map((plugin) => ({
      pluginId: plugin.id,
      src: manager.backgroundFrameSrc(plugin.id),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plugins, loading]);

  // 演示页自带的最小 API 兜底，正式实现是 A5 桥接层
  const handleApiCall = useCallback(
    (pluginId: string) => (message: PluginCallMessage, reply: HostApiReply) => {
      const params = (message.params ?? {}) as Record<string, unknown>;
      const run = async () => {
        switch (message.method) {
          case 'getConfig': {
            const key = String(params.key ?? '');
            reply(true, readJson(localStorage.getItem(configKey(pluginId, key))));
            return;
          }
          case 'setConfig': {
            const key = String(params.key ?? '');
            localStorage.setItem(configKey(pluginId, key), JSON.stringify(params.value ?? null));
            reply(true, undefined);
            return;
          }
          case 'notify':
            showNotice(String(params.text ?? ''));
            reply(true, undefined);
            return;
          case 'setKeepAwake':
            if (isTauri) await setKeepAwake(Boolean(params.on));
            reply(true, undefined);
            return;
          case 'getIdleSeconds':
            reply(true, isTauri ? await getIdleSeconds() : 0);
            return;
          case 'getLocation':
            reply(true, isTauri ? await getLocation() : null);
            return;
          case 'showReminder': {
            const actions = Array.isArray(params.actions)
              ? (params.actions as { id?: string }[])
              : [];
            showNotice(`提醒：${String(params.title ?? '')}（演示页自动关闭）`);
            reply(true, { actionId: actions[0]?.id });
            return;
          }
          default:
            reply(false, undefined, `演示页未实现 API: ${message.method}`);
        }
      };
      void run().catch((reason: unknown) => {
        reply(false, undefined, reason instanceof Error ? reason.message : String(reason));
      });
    },
    [showNotice],
  );

  const apiHandlers = useMemo(() => {
    const handlers = new Map<string, (message: PluginCallMessage, reply: HostApiReply) => void>();
    for (const plugin of plugins) handlers.set(plugin.id, handleApiCall(plugin.id));
    return handlers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plugins, handleApiCall]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Title2>插件管理器</Title2>
          <Text size={200}>
            A2 最小演示：扫描 plugins/ · 多尺寸 manifest · 每个组件一个 iframe · background 常驻 iframe · 热重载 · zip 拖入安装
          </Text>
        </div>
        <div className={styles.headerSpacer} />
        <div className={styles.headerBadges}>
          <Badge appearance="tint" color="brand">
            {plugins.length} 个插件
          </Badge>
          <Badge appearance="outline" color="informative">
            数据源：{manager.sourceKind ?? '探测中'}
          </Badge>
          <Badge appearance="outline" color="subtle">
            {isTauri ? 'Tauri 运行时' : '浏览器（HTTP /plugins）'}
          </Badge>
        </div>
        <Button
          appearance="primary"
          onClick={() => {
            void reload();
            showNotice('已重新扫描插件目录');
          }}
        >
          重新扫描
        </Button>
      </header>

      {notice && (
        <MessageBar intent="info">
          <MessageBarBody>{notice}</MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button appearance="transparent" onClick={() => setNotice(null)}>
                关闭
              </Button>
            }
          />
        </MessageBar>
      )}
      {error && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>插件扫描失败</MessageBarTitle>
            {error.message}
          </MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.columns}>
        <section className={styles.columnLeft} aria-label="插件列表">
          <div className={styles.columnTitle}>
            <Text weight="semibold">插件（{plugins.length}）</Text>
            {backgroundFrames.length > 0 && (
              <Text size={200} className={styles.mono}>
                后台 iframe × {backgroundFrames.length}
              </Text>
            )}
          </div>
          <div className={styles.summaryList}>
            {loading && <Spinner size="small" label="扫描插件目录…" />}
            {!loading && plugins.length === 0 && (
              <MessageBar intent="warning">
                <MessageBarBody>
                  <MessageBarTitle>没有插件</MessageBarTitle>
                  检查 plugins/index.json 与 plugins/&lt;id&gt;/manifest.json（当前数据源：{manager.sourceKind ?? '未知'}）
                </MessageBarBody>
              </MessageBar>
            )}
            {plugins.map((plugin) => (
              <article key={plugin.id} className={styles.summaryCard}>
                <div className={styles.summaryHead}>
                  <Text weight="semibold">{plugin.name}</Text>
                  <Badge appearance="outline" size="small">
                    {plugin.id}
                  </Badge>
                  <Badge appearance="tint" color="subtle" size="small">
                    v{plugin.version}
                  </Badge>
                  {plugin.background && (
                    <Badge appearance="tint" color="warning" size="small">
                      background
                    </Badge>
                  )}
                </div>
                <div className={styles.chipRow}>
                  {plugin.widgets.length === 0 && <Text size={200}>没有组件（纯后台插件）</Text>}
                  {plugin.widgets.map((widget) => (
                    <Badge key={widget.id} appearance="outline" color="brand" size="small">
                      {widget.title} · {widget.sizes.map((size) => size.join('×')).join(' / ')}
                    </Badge>
                  ))}
                </div>
                <Text className={styles.mono}>{plugin.dir}</Text>
              </article>
            ))}
          </div>
          <aside className={styles.installCard} aria-label="安装与热重载">
            <Text weight="semibold" size={200}>
              zip 安装 / 热重载
            </Text>
            <Text size={200}>
              把插件 zip 拖进窗口 → Rust 解压到 plugins/&lt;id&gt; → 自动重扫。浏览器演示模式用「重新扫描」。
            </Text>
            <Text size={200} className={styles.mono}>
              {isTauri ? 'Tauri 运行时：拖放监听已开启' : '浏览器演示模式：安装不可用'}
              {manager.frameBase ? ` · frameBase=${manager.frameBase}` : ''}
            </Text>
          </aside>
        </section>

        <section className={styles.column} aria-label="小组件预览">
          <div className={styles.columnTitle}>
            <Text weight="semibold">小组件预览（{instances.length}）</Text>
            <Text size={200} className={styles.mono}>
              iframe 地址由 PluginManager.widgetFrameSrc 生成
            </Text>
          </div>
          <div className={styles.frameGrid}>
            {loading && <Spinner size="small" label="加载组件…" />}
            {!loading && instances.length === 0 && (
              <div className={styles.empty}>
                <Text>没有可摆放的小组件</Text>
                <Text size={200}>插件 manifest 里没有 widgets，或者 8×5 网格放不下</Text>
              </div>
            )}
            {instances.map((instance) => (
              <article key={instance.uid} className={styles.frameCard}>
                <div className={styles.frameHead}>
                  <Text weight="semibold" size={200}>
                    {instance.title}
                  </Text>
                  <Text size={100} className={styles.mono}>
                    {instance.size[0]}×{instance.size[1]}
                  </Text>
                </div>
                <div
                  className={styles.frameBody}
                  style={{ aspectRatio: `${instance.size[0]} / ${instance.size[1]}` }}
                >
                  <PluginWidgetFrame
                    src={frameSrcFor(instance)}
                    pluginId={instance.pluginId}
                    widgetId={instance.widgetId}
                    size={instance.size}
                    theme={theme}
                    title={`${instance.title}（${instance.uid}）`}
                    onApiCall={apiHandlers.get(instance.pluginId)}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* background:true 的插件挂常驻隐藏 iframe，与组件 iframe 互不影响 */}
      <PluginBackgroundFrames frames={backgroundFrames} theme={theme} onApiCall={undefined} />

      <footer className={styles.footer}>
        演示页自带的 8 个宿主 API 只是兜底（A5 桥接层正式实现）；zip 安装只在 Tauri 运行时可用
        {isTauri ? '：把插件 zip 直接拖进窗口即可。' : '。'}
      </footer>

      {dragging && (
        <div className={styles.dragOverlay}>
          <Text size={500} weight="semibold">
            松开安装插件 zip
          </Text>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <FluentProvider theme={webDarkTheme} style={{ height: '100%' }}>
        <App />
      </FluentProvider>
    </StrictMode>,
  );
}

export default App;
