/**
 * 插件管理页（B4 + F5 信息密度复核）：列表 / 启用禁用 / 删除 / 重载 / zip 安装入口。
 *
 * D-18 修订后的可见性语义：
 * - 启用/禁用 = 持久偏好，禁用不删布局条目（重新启用回原位）；
 * - 编辑模式删除 = 持久移除，reload 不复活；
 * - 状态列因此要区分「已启用」「已启用 · 未上桌」「已启用 · 桌面 n/m」，
 *   未上桌的组件在操作列提供「添加到桌面」（presence 订阅，添加后状态即时刷新）。
 *
 * 密度约定（docs/DENSITY.md §4/§5）：
 * - 一屏一个主任务：管理插件；页头只有一个次要操作（重新扫描）；
 * - 宽屏表格只留 插件 / 状态 / 操作 三列；名称是 Primary，id / 版本 / 尺寸清单
 *   收进 base200 + foreground3 的次要行；
 * - 窄屏折叠成卡片时只保留 名称 / 状态 / 操作，其余全部下沉为次要行；
 * - 分组靠留白，不用卡片边框/分割线。
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
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
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add20Regular } from '@fluentui/react-icons';

import { getPluginManager, isTauriRuntime, usePlugins, type NormalizedPlugin, type PluginManager } from '../../plugins';
import { requestAddWidget, useDesktopPresence, widgetKey } from '../../layout';
import { PageScaffold } from '../shared/PageScaffold';
import { EmptyState } from '../shared/EmptyState';
import { useMediaQuery, WIDE_PAGE_QUERY } from '../shared/useMediaQuery';
import { setPluginEnabled, usePluginPreferences } from './preferences';

export interface PluginsPageProps {
  /** 默认用全局单例，测试或预览可注入 */
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
  secondary: {
    color: tokens.colorNeutralForeground2,
  },
  tertiary: {
    color: tokens.colorNeutralForeground3,
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    backgroundColor: 'transparent',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  pluginCard: {
    display: 'grid',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalL,
    borderRadius: 'var(--wtsl-card-radius)',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  rowActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  statusOn: {
    color: tokens.colorNeutralForeground2,
  },
  statusOff: {
    color: tokens.colorNeutralForeground3,
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
});

function metaSummary(plugin: NormalizedPlugin): string {
  const parts = [plugin.id, `v${plugin.version}`];
  if (plugin.widgets.length === 0) {
    parts.unshift('纯后台插件');
  } else {
    parts.push(
      plugin.widgets
        .map((widget) => widget.sizes.map((size) => size.join('×')).join(' / '))
        .join('，'),
    );
  }
  return parts.join(' · ');
}

/**
 * 启用/禁用开关（V-21：让它成为“操作”列里的有效动作，而不是和状态文字重复）。
 * 状态列只显示文字，开关放到操作列；标签由 aria-label 提供，避免表格里出现第二份状态文案。
 */
function Toggle({
  plugin,
  enabled,
  onChange,
}: {
  plugin: NormalizedPlugin;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <Switch
      checked={enabled}
      onChange={(_event, data) => onChange(data.checked)}
      aria-label={enabled ? `禁用「${plugin.name}」` : `启用「${plugin.name}」`}
    />
  );
}

export function PluginsPage({ manager, onBack, notify }: PluginsPageProps) {
  const styles = useStyles();
  const pluginManager = manager ?? getPluginManager();
  const { plugins, loading, error, reload } = usePlugins(pluginManager);
  const wide = useMediaQuery(WIDE_PAGE_QUERY);
  const tauri = isTauriRuntime();
  const preferences = usePluginPreferences();
  const disabledIds = useMemo(() => new Set(preferences.disabled), [preferences.disabled]);
  const isEnabled = (plugin: NormalizedPlugin) => !disabledIds.has(plugin.id);

  /** 当前桌面上的组件键集合；桌面层每次保存布局后派发事件，这里即时刷新 */
  const presence = useDesktopPresence();
  const widgetOnDesktop = (plugin: NormalizedPlugin, widgetId: string) =>
    presence.has(widgetKey(plugin.id, widgetId));
  const presentCount = (plugin: NormalizedPlugin) =>
    plugin.widgets.filter((widget) => widgetOnDesktop(plugin, widget.id)).length;
  const missingWidgets = (plugin: NormalizedPlugin) =>
    plugin.widgets.filter((widget) => !widgetOnDesktop(plugin, widget.id));

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

  const sourceLabel = useMemo(() => {
    const runtime = tauri ? 'Tauri 运行时' : '浏览器预览';
    return `${runtime} · ${pluginManager.sourceKind ?? '探测中'} 源`;
  }, [tauri, pluginManager]);

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

  const removeButton = (plugin: NormalizedPlugin) => {
    // 浏览器预览没有可执行的删除动作：整列不渲染禁用按钮（V-21）
    if (!tauri) return null;
    return (
      <Button
        appearance="subtle"
        size="large"
        onClick={() => setConfirmTarget(plugin)}
        disabled={busy === plugin.id}
        title="删除插件目录"
      >
        删除
      </Button>
    );
  };

  /**
   * 已启用但没上桌的小组件 → 操作列「添加到桌面」。
   * 一个小组件一个按钮（manifest 允许一个插件多个组件）；点击后由常驻桌面层插入，
   * presence 事件把状态列刷成「桌面 n/m」。
   */
  const addToDesktopButtons = (plugin: NormalizedPlugin) => {
    if (!isEnabled(plugin)) return null;
    const missing = missingWidgets(plugin);
    if (missing.length === 0) return null;
    return missing.map((widget) => (
      <Button
        key={widget.id}
        appearance="secondary"
        size="large"
        icon={<Add20Regular />}
        aria-label={`添加「${widget.title}」到桌面`}
        onClick={() => requestAddWidget(plugin.id, widget.id)}
      >
        添加到桌面
      </Button>
    ));
  };

  const renderStatus = (plugin: NormalizedPlugin) => {
    // 已禁用 → 只说禁用；纯后台插件没有“上桌”概念；有组件则报上桌数量。
    let text = '已启用';
    if (!isEnabled(plugin)) text = '已禁用';
    else if (plugin.widgets.length > 0) {
      const present = presentCount(plugin);
      text =
        present === 0
          ? '已启用 · 未上桌'
          : `已启用 · 桌面 ${present}/${plugin.widgets.length}`;
    }
    return (
      <Text size={200} className={isEnabled(plugin) ? styles.statusOn : styles.statusOff}>
        {text}
      </Text>
    );
  };

  return (
    <PageScaffold
      title="插件管理"
      subtitle={`管理已安装插件 · ${sourceLabel}`}
      onBack={onBack}
      actions={
        <div className={styles.toolbar}>
          <Button appearance="secondary" size="large" onClick={() => void refresh()} disabled={loading}>
            重新扫描
          </Button>
        </div>
      }
      maxContentWidth="1180px"
    >
      <div className={styles.stack}>
        {tauri ? (
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
              size="large"
              onClick={() => void installFromPath()}
              disabled={busy === 'install'}
            >
              {busy === 'install' ? '安装中…' : '安装 zip'}
            </Button>
            <Text size={200} className={styles.hint}>
              也可以直接把 .zip 拖进窗口
            </Text>
          </div>
        ) : (
          <Text size={200} className={styles.hint}>
            浏览器预览只能查看：安装 / 删除 / 拖放需要在 Tauri 运行时里用。
          </Text>
        )}

        {loading && <Spinner label="扫描插件目录…" />}

        {!loading && error && (
          <MessageBar intent="error">
            <MessageBarBody>扫描插件失败：{error.message}</MessageBarBody>
          </MessageBar>
        )}

        {!loading && !error && plugins.length === 0 && (
          <EmptyState title="还没有插件" description="安装插件后这里会列出它们，也可以拖入插件压缩包安装。" />
        )}

        {!loading && !error && plugins.length > 0 && (
          <>
            {wide ? (
              <div className={styles.tableWrap}>
                <Table aria-label="已安装插件" size="small" className={styles.table}>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>插件</TableHeaderCell>
                      <TableHeaderCell>状态</TableHeaderCell>
                      <TableHeaderCell>操作</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plugins.map((plugin) => (
                      <TableRow key={plugin.id}>
                        <TableCell>
                          <div className={styles.pluginCell}>
                            <Text size={400}>{plugin.name}</Text>
                            <Text size={200} className={styles.tertiary}>
                              {metaSummary(plugin)}
                            </Text>
                          </div>
                        </TableCell>
                        <TableCell>{renderStatus(plugin)}</TableCell>
                        <TableCell>
                          <div className={styles.rowActions}>
                            <Toggle
                              plugin={plugin}
                              enabled={isEnabled(plugin)}
                              onChange={(enabled) => toggleEnabled(plugin, enabled)}
                            />
                            {addToDesktopButtons(plugin)}
                            {removeButton(plugin)}
                          </div>
                        </TableCell>
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
                      <Text size={400}>{plugin.name}</Text>
                      {renderStatus(plugin)}
                    </div>
                    <Text size={200} className={styles.tertiary}>
                      {metaSummary(plugin)}
                    </Text>
                    <div className={styles.cardActions}>
                      <Toggle
                        plugin={plugin}
                        enabled={isEnabled(plugin)}
                        onChange={(enabled) => toggleEnabled(plugin, enabled)}
                      />
                      {addToDesktopButtons(plugin)}
                      {removeButton(plugin)}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <Text size={200} className={styles.hint}>
              启用/禁用是持久偏好，禁用不会删掉桌面上的卡片；「已启用 · 未上桌」表示小组件已从桌面移除，可用「添加到桌面」放回。
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
              将删除「{confirmTarget?.name}」的插件文件，不可撤销。
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" size="large" onClick={() => setConfirmTarget(null)}>
                取消
              </Button>
              <Button
                appearance="primary"
                size="large"
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
          <Text size={500} weight="semibold">
            松开安装插件 zip
          </Text>
        </div>
      )}
    </PageScaffold>
  );
}
