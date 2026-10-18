/**
 * 插件管理页（B4）：列表 / 启用禁用 / 删除 / 重载 / zip 安装入口。
 *
 * 数据来自 A2 的 PluginManager：扫描 / 热重载 / 删除 / zip 安装 / 拖放监听。
 * 宽屏用 Fluent Table，窄屏折叠成卡片（DESIGN.md §8）。
 * 启用/禁用只是宿主偏好（不删目录），桌面层接线时按 `isPluginEnabled` 过滤。
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Divider,
  Input,
  MessageBar,
  MessageBarBody,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Title3,
  makeStyles,
  tokens,
} from '@fluentui/react-components';

import {
  getPluginManager,
  isTauriRuntime,
  usePlugins,
  type NormalizedPlugin,
  type PluginManager,
} from '../../plugins';
import { PageScaffold } from '../shared/PageScaffold';
import { EmptyState } from '../shared/EmptyState';
import { useMediaQuery, WIDE_PAGE_QUERY } from '../shared/useMediaQuery';
import { setPluginEnabled, usePluginPreferences } from './preferences';

export interface PluginsPageProps {
  /** 默认用全局单例，测试/演示可注入 */
  manager?: PluginManager;
  onBack: () => void;
  notify: (text: string) => void;
}

const useStyles = makeStyles({
  stack: {
    display: 'grid',
    gap: tokens.spacingVerticalL,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  installCard: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  installRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  installInput: {
    flex: '1 1 320px',
    minWidth: '240px',
  },
  pluginCell: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
  },
  tableWrap: {
    overflowX: 'auto',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  pluginCard: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  cardHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    backgroundColor: tokens.colorBackgroundOverlay,
    border: `2px dashed ${tokens.colorBrandStroke1}`,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  dragText: {
    color: tokens.colorNeutralForeground1,
  },
});

function widgetChips(plugin: NormalizedPlugin) {
  if (plugin.widgets.length === 0) {
    return <Text size={200}>纯后台插件</Text>;
  }
  return (
    <>
      {plugin.widgets.map((widget) => (
        <Badge key={widget.id} appearance="outline" color="brand" size="small">
          {widget.title} · {widget.sizes.map((size) => size.join('×')).join(' / ')}
        </Badge>
      ))}
    </>
  );
}

function PluginIdentity({ plugin }: { plugin: NormalizedPlugin }) {
  const styles = useStyles();
  return (
    <div className={styles.pluginCell}>
      <Text weight="semibold">{plugin.name}</Text>
      <div className={styles.chips}>
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
    </div>
  );
}

export function PluginsPage({ manager, onBack, notify }: PluginsPageProps) {
  const styles = useStyles();
  const pluginManager = manager ?? getPluginManager();
  const { plugins, loading, error, reload } = usePlugins(pluginManager);
  const preferences = usePluginPreferences();
  const disabledIds = useMemo(() => new Set(preferences.disabled), [preferences.disabled]);
  const wide = useMediaQuery(WIDE_PAGE_QUERY);
  const tauri = isTauriRuntime();

  const [confirmTarget, setConfirmTarget] = useState<NormalizedPlugin | null>(null);
  const [zipPath, setZipPath] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    void pluginManager
      .attachZipDrop({
        onDragStateChange: setDragActive,
        onInstalled: (plugin) => notifyRef.current(`已安装插件「${plugin.name}」（${plugin.id}）`),
        onError: (reason) => notifyRef.current(`安装失败：${reason.message}`),
      })
      .then((disposeListener) => {
        if (cancelled) disposeListener();
        else dispose = disposeListener;
      });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [pluginManager]);

  const refresh = async () => {
    await reload();
    notify('已重新扫描插件目录');
  };

  const installFromPath = async () => {
    const path = zipPath.trim();
    if (!path) {
      notify('先填 zip 的完整路径');
      return;
    }
    setBusy('install');
    try {
      const plugin = await pluginManager.installZip(path);
      setZipPath('');
      notify(`已安装插件「${plugin.name}」（${plugin.id}）`);
    } catch (reason) {
      notify(`安装失败：${reason instanceof Error ? reason.message : String(reason)}`);
    } finally {
      setBusy(null);
    }
  };

  const removePlugin = async (plugin: NormalizedPlugin) => {
    setConfirmTarget(null);
    setBusy(plugin.id);
    try {
      await pluginManager.removePlugin(plugin.id);
      notify(`已删除插件「${plugin.name}」`);
    } catch (reason) {
      notify(`删除失败：${reason instanceof Error ? reason.message : String(reason)}`);
    } finally {
      setBusy(null);
    }
  };

  const toggleEnabled = (plugin: NormalizedPlugin, enabled: boolean) => {
    setPluginEnabled(plugin.id, enabled);
    notify(
      enabled
        ? `已启用「${plugin.name}」`
        : `已禁用「${plugin.name}」（桌面下次扫描后不再显示）`,
    );
  };

  const renderStatus = (plugin: NormalizedPlugin) => (
    <Switch
      checked={!disabledIds.has(plugin.id)}
      onChange={(_event, data) => toggleEnabled(plugin, data.checked)}
      label={disabledIds.has(plugin.id) ? '已禁用' : '已启用'}
    />
  );

  const renderActions = (plugin: NormalizedPlugin) => (
    <div className={styles.toolbar}>
      <Button
        appearance="subtle"
        onClick={() => setConfirmTarget(plugin)}
        disabled={!tauri || busy === plugin.id}
        title={tauri ? '删除插件目录' : '浏览器演示模式不支持删除插件'}
      >
        删除
      </Button>
    </div>
  );

  const renderPluginCell = (plugin: NormalizedPlugin) => <PluginIdentity plugin={plugin} />;

  return (
    <PageScaffold
      title="插件管理"
      subtitle="扫描、安装、删除、启用/禁用 —— 改完即时热重载，不用重启启动器"
      onBack={onBack}
      actions={
        <div className={styles.toolbar}>
          <Badge appearance="outline">数据源：{pluginManager.sourceKind ?? '探测中'}</Badge>
          <Badge appearance="outline">{tauri ? 'Tauri 运行时' : '浏览器演示模式'}</Badge>
          <Button appearance="secondary" onClick={() => void refresh()} disabled={loading}>
            重新扫描
          </Button>
        </div>
      }
      maxContentWidth="1180px"
    >
      <div className={styles.stack}>
        <section className={styles.installCard} aria-label="安装插件">
          <div className={styles.cardHead}>
            <Title3>安装插件</Title3>
            <Text size={200} className={styles.hint}>
              解压到 plugins/&lt;id&gt;/ 并自动重扫
            </Text>
          </div>
          {tauri ? (
            <>
              <div className={styles.installRow}>
                <Input
                  className={styles.installInput}
                  value={zipPath}
                  placeholder="zip 完整路径，例如 C:\Users\me\Downloads\clock.zip"
                  aria-label="插件 zip 路径"
                  onChange={(_event, data) => setZipPath(data.value)}
                />
                <Button
                  appearance="primary"
                  onClick={() => void installFromPath()}
                  disabled={busy === 'install'}
                >
                  {busy === 'install' ? '安装中…' : '从路径安装'}
                </Button>
              </div>
              <Text size={200} className={styles.hint}>
                也可以直接把 .zip 拖进窗口：Rust 解压后写回 index.json，随后自动重扫。
              </Text>
            </>
          ) : (
            <MessageBar intent="info">
              <MessageBarBody>
                浏览器演示模式只能查看插件列表；安装 / 删除 / 拖放要在 Tauri 运行时里用。
              </MessageBarBody>
            </MessageBar>
          )}
        </section>

        {loading && <Spinner label="扫描插件目录…" />}

        {!loading && error && (
          <MessageBar intent="error">
            <MessageBarBody>扫描插件失败：{error.message}</MessageBarBody>
          </MessageBar>
        )}

        {!loading && !error && plugins.length === 0 && (
          <EmptyState
            title="还没有插件"
            description="检查 plugins/index.json 和 plugins/<id>/manifest.json；或者装一个插件 zip。"
          />
        )}

        {!loading && !error && plugins.length > 0 && (
          <>
            {wide ? (
              <div className={styles.tableWrap}>
                <Table aria-label="已安装插件" size="small">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>插件</TableHeaderCell>
                      <TableHeaderCell>组件</TableHeaderCell>
                      <TableHeaderCell>状态</TableHeaderCell>
                      <TableHeaderCell>操作</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plugins.map((plugin) => (
                      <TableRow key={plugin.id}>
                        <TableCell>{renderPluginCell(plugin)}</TableCell>
                        <TableCell>
                          <div className={styles.chips}>{widgetChips(plugin)}</div>
                        </TableCell>
                        <TableCell>{renderStatus(plugin)}</TableCell>
                        <TableCell>{renderActions(plugin)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className={styles.cardGrid}>
                {plugins.map((plugin) => (
                  <article key={plugin.id} className={styles.pluginCard}>
                    <div className={styles.cardHead}>
                      <PluginIdentity plugin={plugin} />
                    </div>
                    <div className={styles.chips}>{widgetChips(plugin)}</div>
                    <Divider />
                    <div className={styles.cardActions}>
                      {renderStatus(plugin)}
                      {renderActions(plugin)}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <Text size={200} className={styles.hint}>
              启用/禁用是宿主本地偏好（wtsl.plugins.preferences）；宿主接线时用
              isPluginEnabled 过滤桌面实例即可生效。
            </Text>
          </>
        )}
      </div>

      <Dialog
        open={confirmTarget !== null}
        onOpenChange={(_event, data) => {
          if (!data.open) setConfirmTarget(null);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>删除插件？</DialogTitle>
            <DialogContent>
              将从 plugins/ 目录删除「{confirmTarget?.name}」（{confirmTarget?.id}
              ），并把 id 从 index.json 移除。此操作不可撤销。
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setConfirmTarget(null)}>
                取消
              </Button>
              <Button
                appearance="primary"
                onClick={() => confirmTarget && void removePlugin(confirmTarget)}
              >
                删除
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {dragActive && (
        <div className={styles.overlay}>
          <Text size={500} weight="semibold" className={styles.dragText}>
            松开安装插件 zip
          </Text>
        </div>
      )}
    </PageScaffold>
  );
}
