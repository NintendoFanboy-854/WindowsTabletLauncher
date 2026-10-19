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
import type { CSSProperties, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import { Button, MessageBar, MessageBarBody, Spinner, Text, mergeClasses, useThemeClassName } from '@fluentui/react-components';
import { getHostBridge } from '../bridge';
import type { BridgeServices, HostBridge } from '../bridge';
import type { ShowReminderParams, ThemePayload, WidgetInstance, WidgetSize } from '../bridge/types';
import {
  addPage,
  autoPlace,
  clampPage,
  compareReadingOrder,
  layoutNeedsReflow,
  moveWidgetToPage,
  pagesUsed,
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
} from '../layout';
import type { LayoutState } from '../layout';
import { getPluginManager, readFluentThemePayload, usePlugins } from '../plugins';
import type { NormalizedPlugin, NormalizedWidget, PluginManager } from '../plugins';
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

function widgetKey(pluginId: string, widgetId: string): string {
  return `${pluginId}:${widgetId}`;
}

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
 * - 标题 / 支持尺寸档位 → 用 manifest 最新声明刷新。
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

/**
 * 把插件目录展开成默认实例（每个 manifest widget 一个，page 由调用方给）。
 *
 * 不用 `PluginManager.createInstances`：它只在单页里找位置，放不下就跳过，
 * 小窗口下会把组件悄悄丢掉。这里交给布局引擎 autoPlace——单页放不下就顺延到下一页。
 */
function instancesFromCatalog(catalog: Catalog, page: number): WidgetInstance[] {
  const instances: WidgetInstance[] = [];
  for (const { plugin, widget } of catalog.values()) {
    instances.push({
      uid: widgetKey(plugin.id, widget.id),
      pluginId: plugin.id,
      widgetId: widget.id,
      title: widget.title,
      page,
      col: widget.cell?.[0] ?? -1,
      row: widget.cell?.[1] ?? -1,
      size: [widget.defaultSize[0], widget.defaultSize[1]],
      sizes: widget.sizes.map((size) => [size[0], size[1]] as WidgetSize),
    });
  }
  return instances;
}

/**
 * 布局与插件目录合并（首次初始化 / 热重载 / zip 安装后都会走这里）：
 * - 有存档 → 校验并丢弃已不存在的实例；
 * - 没有任何可用实例 → 按插件目录摆全部组件（autoPlace 负责分页）；
 * - 有新插件/新组件 → 追加到当前页的空位（autoPlace 保证不重叠）。
 */
function reconcileLayout(
  previous: LayoutState | null,
  catalog: Catalog,
  columns: number,
  rows: number,
): LayoutState {
  if (catalog.size === 0) {
    return previous ?? { widgets: [], pages: 1, activePage: 0 };
  }

  let state = previous;
  if (!state) {
    const saved = loadLayout();
    if (saved) {
      const refreshed = refreshWidgets(sanitizeLayout(saved, columns, rows), catalog);
      if (refreshed.widgets.length > 0) state = refreshed;
    }
  }

  if (!state) {
    const placed = autoPlace(instancesFromCatalog(catalog, 0), columns, rows);
    return { widgets: placed, pages: pagesUsed(placed, 1), activePage: 0 };
  }

  const refreshed = refreshWidgets(state, catalog);
  const present = new Set(
    refreshed.widgets.map((widget) => widgetKey(widget.pluginId, widget.widgetId)),
  );
  const additions = instancesFromCatalog(catalog, refreshed.activePage).filter(
    (instance) => !present.has(widgetKey(instance.pluginId, instance.widgetId)),
  );

  if (additions.length === 0) return refreshed;

  const placed = autoPlace(additions, columns, rows);
  const widgets = [...refreshed.widgets, ...placed];
  const pages = Math.max(refreshed.pages, pagesUsed(widgets, 1), refreshed.activePage + 1);
  return { widgets, pages, activePage: clampPage(refreshed.activePage, pages) };
}

export default function Desktop({
  notify: notifyProp,
  manager: managerProp,
  bridge: bridgeProp,
  active = true,
}: DesktopProps) {
  const styles = useStyles();
  const manager = managerProp ?? getPluginManager();
  const bridge = bridgeProp ?? getHostBridge();
  const notifyRef = useRef(notifyProp ?? noop);
  notifyRef.current = notifyProp ?? noop;
  const notify = useCallback((text: string) => notifyRef.current(text), []);

  // 插件列表：manager.init() + 热重载订阅（zip 安装 / 手动放目录都会触发）
  const { plugins, loading: pluginsLoading, error: pluginsError, reload: reloadPlugins } = usePlugins(manager);

  const rootRef = useRef<HTMLDivElement>(null);
  const { viewport, metrics, origin } = useViewportMetrics(rootRef);

  // 主题注入：从 FluentProvider 实际生效的 CSS 变量读 token，发给每个插件 iframe
  // （必须读 provider 内部的元素；读 body 拿不到 provider 上定义的变量。
  //  useThemeClassName 随主题切换换值，effect 重新读一次。）
  const themeClassName = useThemeClassName();
  const [theme, setTheme] = useState<ThemePayload | undefined>(undefined);
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    setTheme(readFluentThemePayload(element));
  }, [themeClassName]);

  const [layout, setLayout] = useState<LayoutState | null>(null);
  const [editMode, setEditMode] = useState(readInitialEditMode);
  const [focusedUid, setFocusedUid] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number | null>(null);
  const [dragView, setDragView] = useState<DragView | null>(null);

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
  const focusedUidRef = useRef(focusedUid);
  focusedUidRef.current = focusedUid;
  const cardNodesRef = useRef(new Map<string, HTMLDivElement>());
  const frameHandlesRef = useRef(new Map<string, WidgetFrameHandle>());
  const swipeRef = useRef<SwipeSession | null>(null);
  const dragRef = useRef<DragSession | null>(null);
  const wheelRef = useRef({ delta: 0, at: 0 });
  const initialEditAppliedRef = useRef(false);

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

  useEffect(() => {
    if (pluginsLoading) return;
    setLayout((previous) =>
      reconcileLayout(previous, catalog, metricsRef.current.columns, metricsRef.current.rows),
    );
  }, [catalog, pluginsLoading, manager]);

  // 布局变化即持久化（存的是逻辑坐标，窗口尺寸变了由布局引擎重排）
  useEffect(() => {
    if (layout) saveLayout(layout);
  }, [layout]);

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
      };
    });
  }, [metrics.columns, metrics.rows]);

  // ---------- 焦点：自动落到当前页第一个组件 ----------

  useEffect(() => {
    if (!layout) return;
    const current = focusedUid ? layout.widgets.find((widget) => widget.uid === focusedUid) : null;
    if (current && current.page === layout.activePage) return;
    const onPage = [...layout.widgets]
      .sort(compareReadingOrder)
      .find((widget) => widget.page === layout.activePage);
    if (onPage) {
      if (onPage.uid !== focusedUid) setFocusedUid(onPage.uid);
    } else if (focusedUid) {
      setFocusedUid(null);
    }
  }, [layout, focusedUid]);

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
        [...state.widgets].sort(compareReadingOrder).find((item) => item.page === state.activePage);
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
  }, []);

  // 非桌面页保持挂载但退到后台：结束编辑模式、取消进行中的拖拽/滑动，
  // 保持旧行为（离开桌面再回来是普通模式），也不让长按/指针计时器残留。
  useEffect(() => {
    if (active) return;
    setEditMode(false);
    setDragView(null);
    dragRef.current = null;
    const swipe = swipeRef.current;
    if (swipe?.longPressTimer != null) window.clearTimeout(swipe.longPressTimer);
    swipeRef.current = null;
    setSwipeOffset(null);
  }, [active]);

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
      setLayout((previous) => (previous ? removeWidgetFromLayout(previous, widget.uid) : previous));
      notify(`已删除「${widget.title}」`);
    },
    [notify],
  );

  const changeWidgetSize = useCallback(
    (widget: WidgetInstance, size: WidgetSize) => {
      const state = layoutRef.current;
      if (!state) return;
      const next = resizeWidget(
        state.widgets,
        widget.uid,
        size,
        metricsRef.current.columns,
        metricsRef.current.rows,
      );
      if (!next) {
        notify('当前页面没有空间放这个尺寸');
        return;
      }
      setLayout({ ...state, widgets: next });
    },
    [notify],
  );

  /**
   * 编辑模式的「设置」/ Enter：不弹宿主占位 Dialog，直接把 host:open-settings 转发给插件，
   * 由插件打开它自己的设置面板（clock 抽屉 / pomodoro 对话框等）。
   */
  const openPluginSettings = useCallback((widget: WidgetInstance) => {
    setFocusedUid(widget.uid);
    const handle = frameHandlesRef.current.get(widget.uid);
    if (!handle) return;
    handle.openSettings();
    // 焦点交给插件，让设置面板里的键盘操作（含插件自己的 Esc 关闭）生效
    handle.focusPlugin();
  }, []);

  // ---------- 焦点移动 ----------

  const moveFocus = useCallback(
    (delta: number) => {
      const state = layoutRef.current;
      if (!state || state.widgets.length === 0) return;
      const ordered = [...state.widgets].sort(compareReadingOrder);
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

  const handleCardTap = useCallback(
    (widget: WidgetInstance) => {
      setFocusedUid(widget.uid);
      focusCardNode(widget.uid);
    },
    [focusCardNode],
  );

  const handleCardLongPress = useCallback(
    (widget: WidgetInstance) => {
      enterEditMode(widget);
    },
    [enterEditMode],
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

  // 触控板双指 / 鼠标滚轮翻页：累计一个单元格的滚动距离算一次翻页
  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (editModeRef.current) return;
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
    const state = layoutRef.current;
    if (!state) return;
    const ordered = [...state.widgets].sort(compareReadingOrder);
    if (ordered.length === 0) return;
    const focusedWidget = focusedUidRef.current
      ? state.widgets.find((widget) => widget.uid === focusedUidRef.current) ?? null
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
  const widgets = layout?.widgets ?? [];
  const draggedWidget = dragView ? widgets.find((widget) => widget.uid === dragView.uid) : null;
  const backgroundPlugins = useMemo(
    () => plugins.filter((plugin) => plugin.background),
    [plugins],
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
      onContextMenu={(event) => event.preventDefault()}
    >
      <BackgroundFrames
        plugins={backgroundPlugins}
        manager={manager}
        bridge={bridge}
        theme={theme}
      />

      <div className={styles.pagesViewport}>
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
                      editMode={editMode}
                      focused={focusedUid === widget.uid}
                      dragging={dragView?.uid === widget.uid}
                      src={src}
                      bridge={bridge}
                      theme={theme}
                      notify={notify}
                      onLongPress={handleCardLongPress}
                      onTap={handleCardTap}
                      onFocus={handleCardFocus}
                      onDelete={deleteWidget}
                      onOpenSettings={openPluginSettings}
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
          visible={editMode}
          pages={layout.pages}
          activePage={layout.activePage}
          onAddPage={handleAddPage}
          onRemovePage={handleRemovePage}
          onMovePage={handleMovePage}
          onDone={exitEditMode}
        />
      )}

      {layout && <PageIndicator total={layout.pages} active={layout.activePage} />}

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

      {showLoading && (
        <div className={styles.centerHint}>
          <Spinner label="正在加载桌面…" />
        </div>
      )}

      {!showLoading && showPluginError && (
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
