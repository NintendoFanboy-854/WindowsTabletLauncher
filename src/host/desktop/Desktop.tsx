/**
 * 桌面层（A4 + A5）：自适应网格渲染 + 多页切换 + 编辑模式（长按/拖拽/改尺寸/删除）+ 键盘焦点。
 *
 * 数据流：
 *   窗口尺寸 → computeGridMetrics → 逻辑坐标换算成像素位置
 *   PluginManager（扫描/热重载/manifest 归一化）→ createInstances → 与 localStorage 布局合并
 *   HostBridge（8 个宿主 API + iframe 句柄 + Agent 工具路由）→ 每个 iframe 的 init/reply
 *
 * 手势边界：iframe 内部的指针事件不会冒泡给宿主（iframe 隔离的代价），所以
 * - 左右滑动切页、长按进编辑模式只在桌面空白区和卡片外侧的材质边框上生效；
 * - 编辑模式下整个卡片由宿主浮层接管，拖拽/点击都可用。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from 'react';
import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MessageBar,
  MessageBarBody,
  Spinner,
  Text,
  mergeClasses,
  motionTokens,
  useThemeClassName,
} from '@fluentui/react-components';
import {
  ChatSparkleRegular,
  EditRegular,
  SettingsRegular,
} from '@fluentui/react-icons';
import { getHostBridge } from '../bridge';
import type { BridgeServices, HostBridge } from '../bridge';
import type { ShowReminderParams, ThemePayload, WidgetInstance, WidgetSize } from '../bridge/types';
import {
  addPage,
  autoPlace,
  clampPage,
  clearLayout,
  compareReadingOrder,
  layoutFrame,
  layoutNeedsReflow,
  moveWidgetToPage,
  notifyDesktopPresenceChanged,
  onAddWidgetRequest,
  pagesUsed,
  placeWidget,
  removePage,
  removeWidgetFromLayout,
  reorderPage,
  resizeWidget,
  reflowLayout,
  sanitizeLayout,
  saveLayout,
  loadLayout,
  setActivePage,
  tryMoveWidget,
  useFooterPillHeight,
  widgetKey,
} from '../layout';
import type { LayoutState } from '../layout';
import type { ColorScheme } from '../shell/themeMode';
import { useReducedMotion } from '../agent/ui/useReducedMotion';
import { usePluginPreferences } from '../pages/plugins/preferences';
import { getPluginManager, readFluentThemePayload, usePlugins } from '../plugins';
import type { NormalizedPlugin, NormalizedWidget, PluginManager } from '../plugins';
import { AddWidgetDialog } from './AddWidgetDialog';
import type { AddWidgetCandidate } from './AddWidgetDialog';
import { BackgroundFrames } from './BackgroundFrames';
import { EditToolbar } from './EditToolbar';
import { PageIndicator } from './PageIndicator';
import { WidgetCard } from './WidgetCard';
import { useViewportMetrics } from './useViewportMetrics';
import {
  DRAG_START_DISTANCE,
  EDGE_PAGE_TURN_MS,
  LONG_PRESS_MOVE_TOLERANCE,
  LONG_PRESS_MS,
  PAGE_SWIPE_RATIO,
  SWIPE_RUBBER_BAND,
  WHEEL_PAGE_RATIO,
  WHEEL_RESET_MS,
} from './interaction';
import type { WidgetFrameHandle } from './WidgetFrame';
import { useStyles } from './desktop.styles';
import './desktop.css';

export interface DesktopProps {
  /** 宿主通知（App 层注入 Fluent Toaster；缺省静默） */
  notify?: (text: string) => void;
  /** 插件管理器；不传用全局单例（App 可以只渲染 <Desktop />） */
  manager?: PluginManager;
  /** 宿主桥接层；不传用全局单例 */
  bridge?: HostBridge;
  /**
   * 桌面是否处于前台。App 在非桌面页仍保持桌面挂载（插件 iframe / 后台运行时
   * 是工具调用接收方），传 false 时结束编辑模式并取消进行中的手势，等价于
   * 旧行为里的“离开桌面 = 重挂载桌面”。
   */
  active?: boolean;
  /**
   * 欣赏壁纸模式（App 持有，不持久化）。为真时卡片只做 opacity + translateY 淡出，
   * 网格几何不变；桌面手势全部停用，点空白处不会退出。
   */
  gallery?: boolean;
  /** App 层「编辑桌面布局」请求（自增 token）：active 时进入编辑模式 */
  editModeRequest?: number;
  /** App 层「重置布局」请求（自增 token）：清除 wtsl.layout 后按 manifest 默认摆放重算 */
  layoutResetRequest?: number;
  /** 编辑模式变化：App 层据此隐藏 Agent 入口（编辑模式只允许编辑 chrome） */
  onEditModeChange?: (editing: boolean) => void;
  /** 编辑模式「设置」/ Enter：交给 App 导航到设置页对应插件分区 */
  onOpenPluginSettings?: (pluginId: string) => void;
  /** 编辑模式「设置」按钮：交给 App 打开设置页（v0.3.0 桌面 dock 删除后的触控入口） */
  onOpenSettings?: () => void;
  /** 桌面右键菜单「打开 Agent」：交给 App 打开浮空 Agent 对话 */
  onOpenAgent?: () => void;
  /**
   * 当前生效的亮暗模式（App 解析后的 colorScheme）。FluentProvider 换主题时只更新
   * CSS 变量、provider 的 className 不变，桌面层必须靠这个值重新读取 token 并下发给
   * 插件 iframe（P2：同会话切换配色后卡片不跟随，reload 才一致）。
   */
  colorScheme?: ColorScheme;
}

interface SwipeSession {
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
  longPressTimer: number | null;
  longPressed: boolean;
}

interface DragSession {
  pointerId: number;
  widget: WidgetInstance;
  startX: number;
  startY: number;
  grabX: number;
  grabY: number;
  active: boolean;
  targetCol: number;
  targetRow: number;
  edgeSide: 'left' | 'right' | null;
  edgeTimer: number | null;
  edgeFired: boolean;
}

interface DragView {
  uid: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetCol: number;
  targetRow: number;
  page: number;
}

/** 插件管理器当前提供的“可上桌组件”目录，key = pluginId:widgetId */
interface CatalogEntry {
  plugin: NormalizedPlugin;
  widget: NormalizedWidget;
}
type Catalog = Map<string, CatalogEntry>;

const noop = () => undefined;

function sameSizes(left: WidgetSize[], right: WidgetSize[]): boolean {
  if (left.length !== right.length) return false;
  return left.every(
    (size, index) => size[0] === right[index][0] && size[1] === right[index][1],
  );
}

/** 是否从截图/调试 URL 直接进编辑模式（?edit=1） */
function readInitialEditMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('edit') === '1';
}

/**
 * 用插件管理器的最新数据修正已保存布局：
 * - 插件被删/组件被删 → 对应实例丢弃；
 * - 标题 / 支持尺寸档位 → 用 manifest 最新声明刷新；
 * - removed 不动（由 reconcileLayout 按目录过滤）。
 */
function refreshWidgets(state: LayoutState, catalog: Catalog): LayoutState {
  let changed = false;
  const widgets: WidgetInstance[] = [];
  for (const widget of state.widgets) {
    const entry = catalog.get(widgetKey(widget.pluginId, widget.widgetId));
    if (!entry) {
      changed = true;
      continue;
    }
    const sizes = entry.widget.sizes.map((size) => [size[0], size[1]] as WidgetSize);
    if (widget.title !== entry.widget.title || !sameSizes(widget.sizes, sizes)) {
      widgets.push({ ...widget, title: entry.widget.title, sizes });
      changed = true;
    } else {
      widgets.push(widget);
    }
  }
  return changed ? { ...state, widgets } : state;
}

/** 已移除键只保留插件目录里仍存在的：插件卸载后清掉，避免 removed 无限增长 */
function filterRemoved(state: LayoutState, catalog: Catalog): LayoutState {
  const removed = state.removed.filter((key) => catalog.has(key));
  return removed.length === state.removed.length ? state : { ...state, removed };
}

/** 插件目录条目 → 还没落到网格上的实例（uid = pluginId:widgetId） */
function instanceFromEntry({ plugin, widget }: CatalogEntry): WidgetInstance {
  return {
    uid: widgetKey(plugin.id, widget.id),
    pluginId: plugin.id,
    widgetId: widget.id,
    title: widget.title,
    page: 0,
    col: widget.cell?.[0] ?? -1,
    row: widget.cell?.[1] ?? -1,
    size: [widget.defaultSize[0], widget.defaultSize[1]],
    sizes: widget.sizes.map((size) => [size[0], size[1]] as WidgetSize),
  };
}

/**
 * 把插件目录展开成默认实例（每个 manifest widget 一个，page 由调用方给）。
 *
 * 不用 `PluginManager.createInstances`：它只在单页里找位置，放不下就跳过，
 * 小窗口下会把组件悄悄丢掉。这里交给布局引擎 autoPlace——单页放不下就顺延到下一页。
 */
function instancesFromCatalog(catalog: Catalog, page: number): WidgetInstance[] {
  const instances: WidgetInstance[] = [];
  for (const entry of catalog.values()) {
    instances.push({ ...instanceFromEntry(entry), page });
  }
  return instances;
}

/**
 * 布局与插件目录合并（首次初始化 / 热重载 / zip 安装后都会走这里）：
 * - 有存档 → 校验并丢弃已不存在的实例；
 * - 没有任何可用实例 → 按插件目录摆全部组件（autoPlace 负责分页）；
 * - 有新插件/新组件 → 追加到当前页的空位（autoPlace 保证不重叠）；
 * - removed 里记录的是用户主动删除（D-18 修订后持久），不再自动补位。
 */
function reconcileLayout(
  previous: LayoutState | null,
  catalog: Catalog,
  columns: number,
  rows: number,
): LayoutState | null {
  // 插件目录还没就绪（加载中/扫描结果为空）时保持现状：可能是 null，等目录就绪再 loadLayout。
  // 这里绝不能返回空布局——否则会被持久化 effect 写进 wtsl.layout，整页 reload 后
  // 用户的卡片尺寸/摆放会被 manifest 默认值覆盖（E4 发现的 P1）。
  if (catalog.size === 0) {
    return previous;
  }

  let state = previous;
  if (!state) {
    const saved = loadLayout();
    if (saved) {
      const refreshed = filterRemoved(
        refreshWidgets(sanitizeLayout(saved, columns, rows), catalog),
        catalog,
      );
      // “全部删光”也是有效存档：widgets 为空但 removed 非空时不能退回默认布局。
      if (refreshed.widgets.length > 0 || refreshed.removed.length > 0) state = refreshed;
    }
  }

  if (!state) {
    const placed = autoPlace(instancesFromCatalog(catalog, 0), columns, rows);
    return { widgets: placed, pages: pagesUsed(placed, 1), activePage: 0, removed: [] };
  }

  // 旧布局可能把卡片放在右下角 Agent 入口（右下保留格）（上一轮入口在右上，历史存档无此约束）。
  // 首次加载时 metrics 已经就绪，reflow effect 不一定再触发，所以在合并目录时补一次。
  let refreshed = filterRemoved(refreshWidgets(state, catalog), catalog);
  if (layoutNeedsReflow(refreshed.widgets, columns, rows)) {
    const reflowed = reflowLayout(refreshed.widgets, columns, rows, refreshed.pages);
    const pages = Math.max(refreshed.pages, reflowed.pages);
    refreshed = {
      widgets: reflowed.widgets,
      pages,
      activePage: clampPage(refreshed.activePage, pages),
      removed: refreshed.removed,
    };
  }
  const present = new Set(
    refreshed.widgets.map((widget) => widgetKey(widget.pluginId, widget.widgetId)),
  );
  const removed = new Set(refreshed.removed);
  const additions = instancesFromCatalog(catalog, refreshed.activePage).filter((instance) => {
    const key = widgetKey(instance.pluginId, instance.widgetId);
    return !present.has(key) && !removed.has(key);
  });

  if (additions.length === 0) return refreshed;

  const placed = autoPlace(additions, columns, rows);
  const widgets = [...refreshed.widgets, ...placed];
  const pages = Math.max(refreshed.pages, pagesUsed(widgets, 1), refreshed.activePage + 1);
  return {
    widgets,
    pages,
    activePage: clampPage(refreshed.activePage, pages),
    removed: refreshed.removed,
  };
}

export default function Desktop({
  notify: notifyProp,
  manager: managerProp,
  bridge: bridgeProp,
  active = true,
  gallery = false,
  editModeRequest,
  layoutResetRequest,
  onEditModeChange,
  onOpenPluginSettings,
  onOpenSettings,
  onOpenAgent,
  colorScheme,
}: DesktopProps) {
  const styles = useStyles();
  const reducedMotion = useReducedMotion();
  const manager = managerProp ?? getPluginManager();
  const bridge = bridgeProp ?? getHostBridge();
  const notifyRef = useRef(notifyProp ?? noop);
  notifyRef.current = notifyProp ?? noop;
  const notify = useCallback((text: string) => notifyRef.current(text), []);

  // 插件列表：manager.init() + 热重载订阅（zip 安装 / 手动放目录都会触发）
  const { plugins, loading: pluginsLoading, error: pluginsError, reload: reloadPlugins } = usePlugins(manager);
  /**
   * 插件管理页的启用/禁用偏好（B4）。此前只写 localStorage、桌面层没有读取，
   * 开关无实际效果（E7 回归发现）。这里按偏好过滤渲染，但**不删布局条目**：
   * 重新启用后卡片回到原来的位置与尺寸。
   */
  const preferences = usePluginPreferences();
  const disabledPlugins = useMemo(() => new Set(preferences.disabled), [preferences.disabled]);
  const disabledPluginsRef = useRef(disabledPlugins);
  disabledPluginsRef.current = disabledPlugins;

  const rootRef = useRef<HTMLDivElement>(null);
  const { viewport, metrics } = useViewportMetrics(rootRef);
  /**
   * 网格原点一律由 `layoutFrame` 给出：它把说明条实测高度 `H_p` 算进「网格 + gutter +
   * 说明条」整块居中，所以网格上缘会随说明条内容高度变化（1440×960 / H_p=26 下 y = 27）。
   * 不用 `useViewportMetrics` 的 `origin`：那条路径只有首帧估计值、没有实测值，
   * 说明条内容一变高就会偏出几像素。
   */
  const pillHeight = useFooterPillHeight();
  const origin = useMemo(() => {
    const grid = layoutFrame(metrics, viewport.width, viewport.height, pillHeight).grid;
    return { x: grid.left, y: grid.top };
  }, [metrics, viewport.width, viewport.height, pillHeight]);

  // 主题注入：从 FluentProvider 实际生效的 CSS 变量读 token，发给每个插件 iframe
  // （必须读 provider 内部的元素；读 body 拿不到 provider 上定义的变量。
  //  换主题时 provider 只改 CSS 变量、className 不变，所以还要把 colorScheme 当依赖。）
  const themeClassName = useThemeClassName();
  const [theme, setTheme] = useState<ThemePayload | undefined>(undefined);
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    setTheme(readFluentThemePayload(element));
  }, [themeClassName, colorScheme]);

  const [layout, setLayout] = useState<LayoutState | null>(null);
  const [editMode, setEditMode] = useState(readInitialEditMode);
  const editModeChangeRef = useRef(onEditModeChange);
  editModeChangeRef.current = onEditModeChange;
  useEffect(() => {
    editModeChangeRef.current?.(editMode);
  }, [editMode]);
  const [focusedUid, setFocusedUid] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number | null>(null);
  const [dragView, setDragView] = useState<DragView | null>(null);
  /** 编辑模式「添加组件」Dialog 是否打开 */
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  /** 桌面空白处右键菜单的位置（鼠标用户的设置入口；触控仍走长按编辑栏） */
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;
  const originRef = useRef(origin);
  originRef.current = origin;
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const editModeRef = useRef(editMode);
  editModeRef.current = editMode;
  const galleryRef = useRef(gallery);
  galleryRef.current = gallery;
  const focusedUidRef = useRef(focusedUid);
  focusedUidRef.current = focusedUid;
  const cardNodesRef = useRef(new Map<string, HTMLDivElement>());
  const frameHandlesRef = useRef(new Map<string, WidgetFrameHandle>());
  const swipeRef = useRef<SwipeSession | null>(null);
  /** 最近一次 pointerdown 的指针类型：右键菜单只对鼠标生效，触控长按仍进编辑模式 */
  const lastPointerTypeRef = useRef('mouse');
  const dragRef = useRef<DragSession | null>(null);
  const wheelRef = useRef({ delta: 0, at: 0 });
  const initialEditAppliedRef = useRef(false);
  /** 新添加的卡片渲染完后要聚焦的 uid（布局更新是异步的，DOM 还没挂上） */
  const pendingFocusUidRef = useRef<string | null>(null);

  const registerNode = useCallback((uid: string, node: HTMLDivElement | null) => {
    if (node) cardNodesRef.current.set(uid, node);
    else cardNodesRef.current.delete(uid);
  }, []);

  const registerFrameHandle = useCallback((uid: string, handle: WidgetFrameHandle | null) => {
    if (handle) frameHandlesRef.current.set(uid, handle);
    else frameHandlesRef.current.delete(uid);
  }, []);

  const focusCardNode = useCallback((uid: string) => {
    cardNodesRef.current.get(uid)?.focus({ preventScroll: true });
  }, []);

  const focusWidgetFrame = useCallback(
    (widget: WidgetInstance) => {
      const handle = frameHandlesRef.current.get(widget.uid);
      if (handle) handle.focusPlugin();
      else focusCardNode(widget.uid);
    },
    [focusCardNode],
  );

  // ---------- 桥接层注入：通知 / 强提醒 / 插件按 Esc 把焦点交还桌面 ----------

  // 桥接层 services：外壳（NotificationsProvider）会通过 App 注入 bridge 并注册
  // notify / showReminder，此时不要覆盖；只有单独挂 <Desktop />（无外壳）时才用本地兜底
  useEffect(() => {
    if (bridgeProp) return;
    const services: BridgeServices = {
      notify: (text) => notify(text),
      showReminder: (params: ShowReminderParams) => {
        const text = params.message ? `${params.title}：${params.message}` : params.title;
        notify(text);
        return Promise.resolve({});
      },
    };
    bridge.setServices(services);
  }, [bridge, bridgeProp, notify]);

  useEffect(
    () =>
      bridge.onFocusExit(() => {
        const uid = focusedUidRef.current;
        if (uid) focusCardNode(uid);
      }),
    [bridge, focusCardNode],
  );

  // ---------- 插件目录 → 布局（首次 / 热重载 / zip 安装） ----------

  const catalog = useMemo<Catalog>(() => {
    const map: Catalog = new Map();
    for (const plugin of plugins) {
      for (const widget of plugin.widgets) {
        map.set(widgetKey(plugin.id, widget.id), { plugin, widget });
      }
    }
    return map;
  }, [plugins]);
  const catalogRef = useRef(catalog);
  catalogRef.current = catalog;
  /** 身份色按插件下发；manifest 校验保证值一定在白名单内 */
  const pluginById = useMemo(
    () => new Map(plugins.map((plugin) => [plugin.id, plugin])),
    [plugins],
  );

  useEffect(() => {
    if (pluginsLoading) return;
    setLayout((previous) =>
      reconcileLayout(previous, catalog, metricsRef.current.columns, metricsRef.current.rows),
    );
  }, [catalog, pluginsLoading, manager]);

  // 布局变化即持久化（存的是逻辑坐标，窗口尺寸变了由布局引擎重排）。
  // 插件目录未就绪/为空时不写：避免把“加载中”的空布局覆盖掉用户已保存的布局（P1）。
  useEffect(() => {
    if (!layout) return;
    if (pluginsLoading || catalog.size === 0) return;
    saveLayout(layout);
    // 先写存档再通知：插件管理页的存在性 hook 会立即重新 loadLayout。
    notifyDesktopPresenceChanged();
  }, [layout, pluginsLoading, catalog]);

  /**
   * 添加组件（编辑模式 Dialog 与插件管理页「添加到桌面」共用）：
   * 经过目录 / 禁用偏好 / 是否已在桌面三道校验，再交给布局纯函数 placeWidget。
   * 返回 true 表示已插入（Dialog 据此关闭）。
   */
  const addWidget = useCallback(
    (pluginId: string, widgetId: string): boolean => {
      const key = widgetKey(pluginId, widgetId);
      const entry = catalogRef.current.get(key);
      if (!entry) {
        notify('找不到这个小组件，插件可能已被卸载');
        return false;
      }
      const state = layoutRef.current;
      if (!state) return false;
      if (state.widgets.some((widget) => widgetKey(widget.pluginId, widget.widgetId) === key)) {
        notify(`「${entry.widget.title}」已经在桌面上了`);
        return false;
      }
      if (disabledPluginsRef.current.has(pluginId)) {
        notify(`「${entry.plugin.name}」已禁用，先在插件管理里启用`);
        return false;
      }
      const instance = instanceFromEntry(entry);
      const placed = placeWidget(
        state.widgets,
        state.pages,
        state.activePage,
        instance,
        metricsRef.current.columns,
        metricsRef.current.rows,
      );
      setLayout({
        widgets: placed.widgets,
        pages: Math.max(state.pages, placed.pages),
        activePage: placed.page,
        removed: state.removed.filter((removedKey) => removedKey !== key),
      });
      pendingFocusUidRef.current = instance.uid;
      setFocusedUid(instance.uid);
      notify(`已添加「${entry.widget.title}」`);
      return true;
    },
    [notify],
  );

  // 插件管理页「添加到桌面」：桌面层常驻挂载，所以插件页发请求、这里插入并持久化。
  useEffect(
    () =>
      onAddWidgetRequest((request) => {
        addWidget(request.pluginId, request.widgetId);
      }),
    [addWidget],
  );

  // 新卡片渲染完成后聚焦（添加请求可能来自别的页面，此时桌面层隐藏）
  useEffect(() => {
    const uid = pendingFocusUidRef.current;
    if (!uid) return;
    if (!layout || !layout.widgets.some((widget) => widget.uid === uid)) return;
    pendingFocusUidRef.current = null;
    focusCardNode(uid);
  }, [layout, focusCardNode]);

  /** 「添加组件」候选：已启用、但当前不在桌面上的小组件（按插件目录顺序） */
  const presentKeys = useMemo(
    () =>
      new Set(
        (layout?.widgets ?? []).map((widget) => widgetKey(widget.pluginId, widget.widgetId)),
      ),
    [layout],
  );
  const addCandidates = useMemo<AddWidgetCandidate[]>(() => {
    if (!editMode) return [];
    const candidates: AddWidgetCandidate[] = [];
    for (const { plugin, widget } of catalog.values()) {
      if (disabledPlugins.has(plugin.id)) continue;
      const key = widgetKey(plugin.id, widget.id);
      if (presentKeys.has(key)) continue;
      candidates.push({
        key,
        pluginId: plugin.id,
        widgetId: widget.id,
        title: widget.title,
        pluginName: plugin.name,
        sizes: widget.sizes,
      });
    }
    return candidates;
  }, [catalog, disabledPlugins, editMode, presentKeys]);
  /** 空态提示用：有小组件但被禁用的插件名 */
  const disabledWidgetPluginNames = useMemo(
    () =>
      plugins
        .filter((plugin) => disabledPlugins.has(plugin.id) && plugin.widgets.length > 0)
        .map((plugin) => plugin.name),
    [plugins, disabledPlugins],
  );

  // ---------- 列数变化：降级重排（DESIGN.md §1.1） ----------

  const previousColumnsRef = useRef<number | null>(null);
  useEffect(() => {
    const previousColumns = previousColumnsRef.current;
    previousColumnsRef.current = metrics.columns;
    setLayout((previous) => {
      if (!previous) return previous;
      const columnsChanged = previousColumns !== null && previousColumns !== metrics.columns;
      if (!columnsChanged && !layoutNeedsReflow(previous.widgets, metrics.columns, metrics.rows)) {
        return previous;
      }
      const reflowed = reflowLayout(previous.widgets, metrics.columns, metrics.rows, previous.pages);
      const pages = Math.max(previous.pages, reflowed.pages);
      return {
        widgets: reflowed.widgets,
        pages,
        activePage: clampPage(previous.activePage, pages),
        removed: previous.removed,
      };
    });
  }, [metrics.columns, metrics.rows]);

  // ---------- 焦点：自动落到当前页第一个组件 ----------

  useEffect(() => {
    if (!layout) return;
    const current = focusedUid ? layout.widgets.find((widget) => widget.uid === focusedUid) : null;
    if (current && current.page === layout.activePage && !disabledPlugins.has(current.pluginId)) return;
    const onPage = layout.widgets
      .filter((widget) => !disabledPlugins.has(widget.pluginId))
      .sort(compareReadingOrder)
      .find((widget) => widget.page === layout.activePage);
    if (onPage) {
      if (onPage.uid !== focusedUid) setFocusedUid(onPage.uid);
    } else if (focusedUid) {
      setFocusedUid(null);
    }
  }, [layout, focusedUid, disabledPlugins]);

  // 截图回归入口：?edit=1 在布局加载完后直接进编辑模式
  useEffect(() => {
    if (!layout || initialEditAppliedRef.current) return;
    initialEditAppliedRef.current = true;
    if (readInitialEditMode()) {
      setEditMode(true);
      const first = [...layout.widgets].sort(compareReadingOrder).find(
        (widget) => widget.page === layout.activePage,
      );
      if (first) {
        setFocusedUid(first.uid);
        focusCardNode(first.uid);
      }
    }
  }, [layout, focusCardNode]);

  // ---------- 编辑模式 / 页操作 ----------

  const enterEditMode = useCallback(
    (widget?: WidgetInstance) => {
      setEditMode(true);
      const state = layoutRef.current;
      if (!state) return;
      const target =
        widget ??
        state.widgets
          .filter((item) => !disabledPluginsRef.current.has(item.pluginId))
          .sort(compareReadingOrder)
          .find((item) => item.page === state.activePage);
      if (target) {
        setFocusedUid(target.uid);
        focusCardNode(target.uid);
      }
    },
    [focusCardNode],
  );

  const exitEditMode = useCallback(() => {
    setEditMode(false);
    setDragView(null);
    setAddWidgetOpen(false);
  }, []);

  // 非桌面页保持挂载但退到后台：结束编辑模式、取消进行中的拖拽/滑动，
  // 保持旧行为（离开桌面再回来是普通模式），也不让长按/指针计时器残留。
  useEffect(() => {
    if (active) return;
    setEditMode(false);
    setDragView(null);
    setAddWidgetOpen(false);
    dragRef.current = null;
    const swipe = swipeRef.current;
    if (swipe?.longPressTimer != null) window.clearTimeout(swipe.longPressTimer);
    swipeRef.current = null;
    setSwipeOffset(null);
  }, [active]);

  // 进入欣赏壁纸：退出编辑与所有浮层/手势，只保留壁纸与说明条。
  useEffect(() => {
    if (!gallery) return;
    exitEditMode();
    setContextMenu(null);
    dragRef.current = null;
    const swipe = swipeRef.current;
    if (swipe?.longPressTimer != null) window.clearTimeout(swipe.longPressTimer);
    swipeRef.current = null;
    setSwipeOffset(null);
  }, [exitEditMode, gallery]);

  // App「外观 → 编辑桌面布局」：回到桌面后进入编辑模式（token 只在请求时变化）
  const handledEditRequestRef = useRef(editModeRequest ?? 0);
  useEffect(() => {
    if (!active || editModeRequest === undefined) return;
    if (editModeRequest === handledEditRequestRef.current) return;
    handledEditRequestRef.current = editModeRequest;
    enterEditMode();
  }, [active, editModeRequest, enterEditMode]);

  // App「外观 → 重置布局」：清掉持久化，按当前插件目录重新生成默认摆放。
  // 桌面在非桌面页也保持挂载，所以设置页里点重置会立刻生效（无需切换页面）。
  const handledResetRequestRef = useRef(layoutResetRequest ?? 0);
  useEffect(() => {
    if (layoutResetRequest === undefined) return;
    if (layoutResetRequest === handledResetRequestRef.current) return;
    handledResetRequestRef.current = layoutResetRequest;
    if (catalogRef.current.size === 0) return;
    clearLayout();
    setDragView(null);
    setEditMode(false);
    setAddWidgetOpen(false);
    setFocusedUid(null);
    setLayout(
      reconcileLayout(
        null,
        catalogRef.current,
        metricsRef.current.columns,
        metricsRef.current.rows,
      ),
    );  }, [layoutResetRequest]);

  const changePage = useCallback((delta: number) => {
    setLayout((previous) =>
      previous ? setActivePage(previous, previous.activePage + delta) : previous,
    );
  }, []);

  const handleAddPage = useCallback(() => {
    setLayout((previous) => (previous ? addPage(previous) : previous));
  }, []);

  const handleRemovePage = useCallback(() => {
    setLayout((previous) =>
      previous
        ? removePage(previous, previous.activePage, metricsRef.current.columns, metricsRef.current.rows)
        : previous,
    );
  }, []);

  const handleMovePage = useCallback((from: number, to: number) => {
    setLayout((previous) => (previous ? reorderPage(previous, from, to) : previous));
  }, []);

  const deleteWidget = useCallback(
    (widget: WidgetInstance) => {
      // 持久删除：removeWidgetFromLayout 会把 key 写进 layout.removed，reload 不会复活
      setLayout((previous) => (previous ? removeWidgetFromLayout(previous, widget.uid) : previous));
      notify(`已删除「${widget.title}」，可在编辑模式「添加组件」里恢复`);
    },
    [notify],
  );

  const changeWidgetSize = useCallback(
    (widget: WidgetInstance, size: WidgetSize) => {
      const state = layoutRef.current;
      if (!state) return;
      // 点当前已勾选的尺寸：Menu 会关闭，不提示“放不下”
      if (size[0] === widget.size[0] && size[1] === widget.size[1]) return;
      const next = resizeWidget(
        state.widgets,
        widget.uid,
        size,
        metricsRef.current.columns,
        metricsRef.current.rows,
      );
      if (!next) {
        notify(`当前页面没有空间放 ${size[0]} × ${size[1]}，尺寸保持不变`);
        return;
      }
      setLayout({ ...state, widgets: next });
    },
    [notify],
  );

  /**
   * 编辑模式「设置」/ Enter：导航到宿主设置页对应插件分区（契约 §5）。
   * 不再向插件转发 host:open-settings：插件设置统一在宿主渲染。
   */
  const openPluginSettings = useCallback(
    (widget: WidgetInstance) => {
      setFocusedUid(widget.uid);
      if (onOpenPluginSettings) {
        onOpenPluginSettings(widget.pluginId);
        return;
      }
      notify('宿主设置页未接入，无法打开插件设置');
    },
    [notify, onOpenPluginSettings],
  );

  /** 插件 iframe 的 `plugin:request-host-settings`（卡片或浮层任意视图）→ 同一入口 */
  const handleHostSettingsRequest = useCallback(
    (widget: WidgetInstance) => {
      onOpenPluginSettings?.(widget.pluginId);
    },
    [onOpenPluginSettings],
  );

  // ---------- 焦点移动 ----------

  const moveFocus = useCallback(
    (delta: number) => {
      const state = layoutRef.current;
      if (!state || state.widgets.length === 0) return;
      const ordered = state.widgets
        .filter((widget) => !disabledPluginsRef.current.has(widget.pluginId))
        .sort(compareReadingOrder);
      const fromUid = focusedUidRef.current;
      const index = fromUid ? ordered.findIndex((widget) => widget.uid === fromUid) : -1;
      const next = ordered[(index + delta + ordered.length) % ordered.length];
      setFocusedUid(next.uid);
      if (next.page !== state.activePage) {
        setLayout((previous) => (previous ? setActivePage(previous, next.page) : previous));
      }
      focusCardNode(next.uid);
    },
    [focusCardNode],
  );

  const moveWidgetByArrow = useCallback((widget: WidgetInstance, key: string) => {
    const state = layoutRef.current;
    if (!state) return;
    const delta =
      key === 'ArrowLeft'
        ? { col: -1, row: 0 }
        : key === 'ArrowRight'
          ? { col: 1, row: 0 }
          : key === 'ArrowUp'
            ? { col: 0, row: -1 }
            : { col: 0, row: 1 };
    const next = tryMoveWidget(
      state.widgets,
      widget.uid,
      { page: state.activePage, col: widget.col + delta.col, row: widget.row + delta.row },
      metricsRef.current.columns,
      metricsRef.current.rows,
    );
    if (next) setLayout({ ...state, widgets: next });
  }, []);

  // ---------- 卡片交互 ----------

  /**
   * 插件 SDK 检测到卡片长按（`plugin:request-edit-mode`，契约 §3.2）。
   * 宿主不重复跑长按计时器：已在编辑模式则只选中/聚焦该卡，否则复用 enterEditMode。
   */
  const handleCardRequestEditMode = useCallback(
    (widget: WidgetInstance) => {
      if (editModeRef.current) {
        setFocusedUid(widget.uid);
        focusCardNode(widget.uid);
        return;
      }
      enterEditMode(widget);
    },
    [enterEditMode, focusCardNode],
  );

  // ---------- 编辑模式拖拽（浮层 → 吸附 / 交换 / 边缘翻页） ----------

  const clearEdgeTimer = (session: DragSession) => {
    if (session.edgeTimer !== null) {
      window.clearTimeout(session.edgeTimer);
      session.edgeTimer = null;
    }
  };

  const handleDragMove = useCallback((event: PointerEvent) => {
    const session = dragRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY);
    if (!session.active) {
      if (distance < DRAG_START_DISTANCE) return;
      session.active = true;
    }
    const state = layoutRef.current;
    if (!state) return;
    const currentMetrics = metricsRef.current;
    const currentOrigin = originRef.current;
    const [widthCells, heightCells] = session.widget.size;

    const ghostX = event.clientX - session.grabX;
    const ghostY = event.clientY - session.grabY;
    const step = currentMetrics.cell + currentMetrics.gap;
    const targetCol = Math.max(
      0,
      Math.min(currentMetrics.columns - widthCells, Math.round((ghostX - currentOrigin.x) / step)),
    );
    const targetRow = Math.max(
      0,
      Math.min(currentMetrics.rows - heightCells, Math.round((ghostY - currentOrigin.y) / step)),
    );
    session.targetCol = targetCol;
    session.targetRow = targetRow;

    setDragView({
      uid: session.widget.uid,
      title: session.widget.title,
      x: ghostX,
      y: ghostY,
      width: widthCells * currentMetrics.cell + (widthCells - 1) * currentMetrics.gap,
      height: heightCells * currentMetrics.cell + (heightCells - 1) * currentMetrics.gap,
      targetCol,
      targetRow,
      page: state.activePage,
    });

    // 屏幕边缘停 0.6s 翻页；触发带宽度 = 一个单元格
    const edgeWidth = currentMetrics.cell;
    const side: 'left' | 'right' | null =
      event.clientX <= edgeWidth
        ? 'left'
        : event.clientX >= viewportRef.current.width - edgeWidth
          ? 'right'
          : null;
    const canTurn =
      side === 'left'
        ? state.activePage > 0
        : side === 'right'
          ? state.activePage < state.pages - 1
          : false;
    if (side !== session.edgeSide) {
      clearEdgeTimer(session);
      session.edgeSide = side;
      session.edgeFired = false;
      if (side && canTurn) {
        session.edgeTimer = window.setTimeout(() => {
          const current = dragRef.current;
          if (!current || current.edgeSide !== side || current.edgeFired) return;
          current.edgeTimer = null;
          current.edgeFired = true;
          setLayout((previous) => {
            if (!previous) return previous;
            return setActivePage(
              previous,
              side === 'left' ? previous.activePage - 1 : previous.activePage + 1,
            );
          });
        }, EDGE_PAGE_TURN_MS);
      }
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: PointerEvent) => {
      const session = dragRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      clearEdgeTimer(session);
      dragRef.current = null;
      setDragView(null);
      if (!session.active) {
        // 没有拖动：只聚焦这张卡片
        setFocusedUid(session.widget.uid);
        focusCardNode(session.widget.uid);
        return;
      }
      const state = layoutRef.current;
      if (!state) return;
      const currentMetrics = metricsRef.current;
      const widget = state.widgets.find((item) => item.uid === session.widget.uid);
      if (!widget) return;
      const targetPage = state.activePage;
      const next =
        targetPage === widget.page
          ? tryMoveWidget(
              state.widgets,
              widget.uid,
              { page: targetPage, col: session.targetCol, row: session.targetRow },
              currentMetrics.columns,
              currentMetrics.rows,
            )
          : moveWidgetToPage(
              state.widgets,
              widget.uid,
              targetPage,
              { col: session.targetCol, row: session.targetRow },
              currentMetrics.columns,
              currentMetrics.rows,
            );
      if (!next) return;
      setLayout({ ...state, widgets: next, pages: Math.max(state.pages, pagesUsed(next, 1)) });
    },
    [focusCardNode],
  );

  const beginEditDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, widget: WidgetInstance) => {
      if (!editModeRef.current) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      // 同上：Portal 里的事件不参与卡片拖拽，避免抢指针后吞掉浮层内点击。
      if (!event.currentTarget.contains(event.target as Node)) return;
      const card = cardNodesRef.current.get(widget.uid);
      const rect = card?.getBoundingClientRect();
      const grabX = rect ? Math.min(Math.max(0, event.clientX - rect.left), rect.width) : 0;
      const grabY = rect ? Math.min(Math.max(0, event.clientY - rect.top), rect.height) : 0;
      const session: DragSession = {
        pointerId: event.pointerId,
        widget,
        startX: event.clientX,
        startY: event.clientY,
        grabX,
        grabY,
        active: false,
        targetCol: widget.col,
        targetRow: widget.row,
        edgeSide: null,
        edgeTimer: null,
        edgeFired: false,
      };
      dragRef.current = session;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [],
  );

  // 拖拽的全局指针监听（指针捕获后事件仍会冒泡到 window）
  useEffect(() => {
    const onMove = (event: PointerEvent) => handleDragMove(event);
    const onUp = (event: PointerEvent) => handleDragEnd(event);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [handleDragMove, handleDragEnd]);

  // ---------- 空白区手势：滑动切页 / 长按进编辑 / 点空白退出编辑 ----------

  const handleRootPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    lastPointerTypeRef.current = event.pointerType;
    // 欣赏壁纸模式：点壁纸空白处不退出，也不启动滑动/长按/编辑
    if (galleryRef.current) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // Portal 内容（Fluent Dialog/Menu/Toast）的 pointerdown 会沿 React 树冒泡到桌面根节点，
    // 但 DOM 上不在根节点内；这里抢指针会把浮层按钮的 click 重定向到桌面，必须放行。
    if (!event.currentTarget.contains(event.target as Node)) return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('[data-widget-card],[data-no-desktop-gesture]')
    ) {
      return;
    }
    const session: SwipeSession = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      longPressTimer: null,
      longPressed: false,
    };
    if (!editModeRef.current) {
      session.longPressTimer = window.setTimeout(() => {
        const current = swipeRef.current;
        if (!current || current.pointerId !== session.pointerId || current.moved) return;
        current.longPressed = true;
        enterEditMode();
      }, LONG_PRESS_MS);
    }
    swipeRef.current = session;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleRootPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = swipeRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const dx = event.clientX - session.startX;
    const dy = event.clientY - session.startY;
    if (!session.moved && Math.hypot(dx, dy) > LONG_PRESS_MOVE_TOLERANCE) {
      session.moved = true;
      if (session.longPressTimer !== null) {
        window.clearTimeout(session.longPressTimer);
        session.longPressTimer = null;
      }
    }
    const state = layoutRef.current;
    if (!state || session.longPressed || editModeRef.current || !session.moved) return;
    const atFirst = state.activePage <= 0;
    const atLast = state.activePage >= state.pages - 1;
    const rubber = (dx > 0 && atFirst) || (dx < 0 && atLast) ? dx * SWIPE_RUBBER_BAND : dx;
    setSwipeOffset(rubber);
  };

  const handleRootPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = swipeRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    swipeRef.current = null;
    if (session.longPressTimer !== null) window.clearTimeout(session.longPressTimer);
    const dx = event.clientX - session.startX;
    setSwipeOffset(null);
    if (session.longPressed) return;
    if (editModeRef.current) {
      if (!session.moved) exitEditMode();
      return;
    }
    if (!session.moved) return;
    const threshold = viewportRef.current.width * PAGE_SWIPE_RATIO;
    if (dx <= -threshold) changePage(1);
    else if (dx >= threshold) changePage(-1);
  };

  const handleRootPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = swipeRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    if (session.longPressTimer !== null) window.clearTimeout(session.longPressTimer);
    swipeRef.current = null;
    setSwipeOffset(null);
  };

  /**
   * 桌面空白处右键 = Windows 桌面惯例的上下文菜单。
   * 这是鼠标用户的正文入口（设置 / 编辑桌面 / 打开 Agent），不把宿主设置塞进 Agent。
   * 触控长按仍进入编辑模式；只有鼠标 pointerType 才弹菜单。
   */
  const handleRootContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (galleryRef.current) return;
    if (lastPointerTypeRef.current !== 'mouse') return;
    if (editModeRef.current) return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('[data-widget-card],[data-no-desktop-gesture]')
    ) {
      return;
    }
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  // 触控板双指 / 鼠标滚轮翻页：累计一个单元格的滚动距离算一次翻页
  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (galleryRef.current || editModeRef.current) return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('[data-widget-card],[data-no-desktop-gesture]')
    ) {
      return;
    }
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 1) return;
    const now = performance.now();
    const previous = wheelRef.current;
    const accumulated = now - previous.at > WHEEL_RESET_MS ? delta : previous.delta + delta;
    const threshold = metrics.cell * WHEEL_PAGE_RATIO;
    if (Math.abs(accumulated) >= threshold) {
      changePage(accumulated > 0 ? 1 : -1);
      wheelRef.current = { delta: 0, at: now };
    } else {
      wheelRef.current = { delta: accumulated, at: now };
    }
  };

  // ---------- 键盘：Tab/方向键 roving focus，Enter 进组件/设置，Delete 删除，Esc 退出 ----------

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // 只处理焦点确实在桌面 DOM 内（或焦点还在 body、准备用 Tab 进入桌面）的事件。
    // Fluent Dialog/Menu 通过 Portal 挂到 body，React 合成事件仍会沿组件树冒泡到这里；
    // 若不拦，对话框里的 Tab/方向键/Enter/Delete 会被桌面 roving focus / 删除快捷键抢走。
    const keyTarget = event.target as Node;
    if (keyTarget !== document.body && !event.currentTarget.contains(keyTarget)) return;
    // 欣赏壁纸模式：卡片已 inert，桌面不参与 Tab/方向键/Enter/Delete
    if (galleryRef.current) return;
    const state = layoutRef.current;
    if (!state) return;
    const ordered = state.widgets
      .filter((widget) => !disabledPluginsRef.current.has(widget.pluginId))
      .sort(compareReadingOrder);
    if (ordered.length === 0) return;
    const focusedWidget = focusedUidRef.current
      ? ordered.find((widget) => widget.uid === focusedUidRef.current) ?? null
      : null;

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        moveFocus(event.shiftKey ? -1 : 1);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        if (!focusedWidget) {
          moveFocus(1);
        } else if (editModeRef.current) {
          moveWidgetByArrow(focusedWidget, event.key);
        } else {
          moveFocus(event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1);
        }
        break;
      case 'Enter':
        if (!focusedWidget) break;
        event.preventDefault();
        if (editModeRef.current) openPluginSettings(focusedWidget);
        else focusWidgetFrame(focusedWidget);
        break;
      case 'Delete':
      case 'Backspace':
        if (!editModeRef.current || !focusedWidget) break;
        event.preventDefault();
        deleteWidget(focusedWidget);
        break;
      case 'Escape':
        if (!editModeRef.current) break;
        event.preventDefault();
        exitEditMode();
        break;
      default:
        break;
    }
  };

  const handleCardFocus = useCallback((widget: WidgetInstance) => {
    setFocusedUid(widget.uid);
  }, []);

  // ---------- 渲染 ----------

  const pages = layout?.pages ?? 1;
  const activePage = layout?.activePage ?? 0;
  const trackStyle: CSSProperties = {
    width: `${pages * 100}%`,
    transform: `translateX(calc(${(-activePage * 100) / pages}% + ${swipeOffset ?? 0}px))`,
  };
  const widgets = (layout?.widgets ?? []).filter(
    (widget) => !disabledPlugins.has(widget.pluginId),
  );
  const draggedWidget = dragView ? widgets.find((widget) => widget.uid === dragView.uid) : null;
  const backgroundPlugins = useMemo(
    () =>
      plugins.filter((plugin) => plugin.background && !disabledPlugins.has(plugin.id)),
    [plugins, disabledPlugins],
  );
  const showLoading = pluginsLoading || (!layout && !pluginsError);
  const showPluginError = Boolean(pluginsError) || (!pluginsLoading && plugins.length === 0);

  /** 插件管理器生成 iframe 地址；插件突然消失时先不渲染这张卡片（等订阅重扫） */
  const frameSrcOf = (widget: WidgetInstance): string | null => {
    try {
      return manager.widgetFrameSrc(widget);
    } catch {
      return null;
    }
  };

  return (
    <div
      ref={rootRef}
      className={styles.root}
      aria-label="桌面"
      onPointerDown={handleRootPointerDown}
      onPointerMove={handleRootPointerMove}
      onPointerUp={handleRootPointerUp}
      onPointerCancel={handleRootPointerCancel}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onContextMenu={handleRootContextMenu}
    >
      <BackgroundFrames
        plugins={backgroundPlugins}
        manager={manager}
        bridge={bridge}
        theme={theme}
      />

      {/* 编辑模式：桌面衬底轻微压暗（MOTION §3，200ms 减速进入 / 150ms 加速退出） */}
      <div
        className={mergeClasses(styles.editBackdrop, editMode && styles.editBackdropVisible)}
        data-edit-backdrop="true"
        aria-hidden="true"
      />

      <div className={styles.pagesViewport} inert={gallery}>
        <div
          className={mergeClasses(styles.track, swipeOffset !== null && styles.trackDragging)}
          style={trackStyle}
        >
          {Array.from({ length: pages }, (_, pageIndex) => (
            <div
              key={pageIndex}
              className={styles.page}
              style={{ width: `${100 / pages}%` }}
              data-page-index={pageIndex}
            >
              {widgets
                .filter((widget) => widget.page === pageIndex)
                .map((widget) => {
                  const src = frameSrcOf(widget);
                  if (!src) return null;
                  return (
                    <WidgetCard
                      key={widget.uid}
                      widget={widget}
                      metrics={metrics}
                      origin={origin}
                      editMode={editMode && !gallery}
                      gallery={gallery}
                      focused={focusedUid === widget.uid}
                      dragging={dragView?.uid === widget.uid}
                      src={src}
                      bridge={bridge}
                      theme={theme}
                      identityHue={pluginById.get(widget.pluginId)?.identityHue}
                      notify={notify}
                      onRequestEditMode={handleCardRequestEditMode}
                      onFocus={handleCardFocus}
                      onDelete={deleteWidget}
                      onOpenSettings={openPluginSettings}
                      onRequestHostSettings={handleHostSettingsRequest}
                      onChangeSize={changeWidgetSize}
                      onEditPointerDown={beginEditDrag}
                      registerFrameHandle={registerFrameHandle}
                      registerNode={registerNode}
                    />
                  );
                })}
              {dragView && dragView.page === pageIndex && (
                <div
                  className={styles.placeholder}
                  style={{
                    transform: `translate(${origin.x + dragView.targetCol * (metrics.cell + metrics.gap)}px, ${
                      origin.y + dragView.targetRow * (metrics.cell + metrics.gap)
                    }px)`,
                    width: dragView.width,
                    height: dragView.height,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {layout && (
        <EditToolbar
          visible={editMode && !gallery}
          pages={layout.pages}
          activePage={layout.activePage}
          onAddPage={handleAddPage}
          onRemovePage={handleRemovePage}
          onMovePage={handleMovePage}
          onAddWidget={() => setAddWidgetOpen(true)}
          onOpenSettings={onOpenSettings ?? noop}
          onDone={exitEditMode}
        />
      )}

      {layout && (
        <AddWidgetDialog
          open={addWidgetOpen && !gallery}
          candidates={addCandidates}
          disabledPluginNames={disabledWidgetPluginNames}
          onAdd={(candidate) => addWidget(candidate.pluginId, candidate.widgetId)}
          onOpenChange={setAddWidgetOpen}
        />
      )}

      {layout && (
        <div
          className={mergeClasses(styles.galleryChrome, gallery && styles.galleryChromeHidden)}
          style={{
            transitionDuration: reducedMotion ? `${motionTokens.durationFaster}ms` : undefined,
          }}
          aria-hidden={gallery}
          inert={gallery}
        >
          <PageIndicator total={layout.pages} active={layout.activePage} />
        </div>
      )}

      {/* 鼠标右键菜单：浮层挂 Portal，位置用虚拟 target 取自光标点 */}
      {contextMenu && (
        <Menu
          open
          onOpenChange={(_, data) => {
            if (!data.open) setContextMenu(null);
          }}
          positioning={{
            target: {
              getBoundingClientRect: () => ({
                x: contextMenu.x,
                y: contextMenu.y,
                top: contextMenu.y,
                bottom: contextMenu.y,
                left: contextMenu.x,
                right: contextMenu.x,
                width: 0,
                height: 0,
              }),
            },
          }}
        >
          <MenuPopover>
            <MenuList>
              <MenuItem
                icon={<ChatSparkleRegular />}
                onClick={() => {
                  setContextMenu(null);
                  onOpenAgent?.();
                }}
              >
                打开 Agent
              </MenuItem>
              <MenuItem
                icon={<EditRegular />}
                onClick={() => {
                  setContextMenu(null);
                  enterEditMode();
                }}
              >
                编辑桌面
              </MenuItem>
              <MenuDivider />
              <MenuItem
                icon={<SettingsRegular />}
                onClick={() => {
                  setContextMenu(null);
                  onOpenSettings?.();
                }}
              >
                设置
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      )}

      {dragView && (
        <div
          className={styles.dragGhost}
          aria-hidden="true"
          style={{
            transform: `translate(${dragView.x}px, ${dragView.y}px) scale(1.03)`,
            width: dragView.width,
            height: dragView.height,
          }}
        >
          <Text weight="semibold" size={300}>
            {draggedWidget?.title ?? dragView.title}
          </Text>
        </div>
      )}

      {!gallery && showLoading && (
        <div className={styles.centerHint}>
          <Spinner label="正在加载桌面…" />
        </div>
      )}

      {!gallery && !showLoading && showPluginError && (
        <div className={styles.centerHint} data-no-desktop-gesture="true">
          <div className={styles.centerHintCard}>
            <MessageBar intent="warning">
              <MessageBarBody>
                {pluginsError
                  ? `插件加载失败：${pluginsError.message}`
                  : '没有找到可用的插件，请检查插件是否安装完整，或在插件管理里重新扫描。'}
              </MessageBarBody>
            </MessageBar>
            <Button
              appearance="primary"
              onClick={() => {
                void reloadPlugins();
              }}
            >
              重新扫描
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
