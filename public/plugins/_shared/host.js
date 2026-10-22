/**
 * 插件宿主桥接（共享脚手架，DECISIONS.md D-02b）。
 *
 * 所有 React 插件通用：宿主 init 捕获、主题、尺寸、配置读写、"打开插件设置"。
 * 插件页面通过 `import { plugin } from '/plugin-sdk.js'` 与宿主通信；本文件只做
 * 与 React 生命周期贴合的小封装，不改变协议。
 *
 * 用法（main.jsx）：
 *   startHostCapture();                       // 必须在模块顶层、React 挂载前调用
 *   const { theme } = useHostTheme();
 *   const [sizeKey] = useHostSize(sizeKeyOf, '2x1');
 *   const [settings, setSettings] = useStoredConfig('settings', DEFAULT, normalize);
 *
 * 结构约定见 docs/PLUGIN-REACT.md。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { plugin } from '/plugin-sdk.js';
import { legacyThemePayload, resolveTheme } from './theme.js';

/* ------------------------------------------------------------------ */
/* 宿主 init 捕获：host:init 可能在 React 挂载前就到达                   */
/* ------------------------------------------------------------------ */

const captured = {
  init: null,
  legacyTheme: null,
  started: false,
};

/**
 * 注册 init / 旧版 wtsl:init 监听并缓存。必须在模块顶层同步调用一次，
 * 否则会漏掉宿主在 iframe onLoad 时立刻发出的 host:init。
 */
export function startHostCapture() {
  if (captured.started) return;
  captured.started = true;
  plugin.onInit((payload) => {
    if (!captured.init) captured.init = payload;
  });
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.type !== 'wtsl:init' || !data.theme) return;
    if (!captured.legacyTheme) captured.legacyTheme = data.theme;
  });
}

/** 已捕获的 init 载荷（非响应式，供初始化时取一次值） */
export function getHostInit() {
  return captured.init;
}

function initialThemePayload(fallbackScheme) {
  if (captured.init?.theme) return captured.init.theme;
  if (captured.legacyTheme) return legacyThemePayload(captured.legacyTheme) || { colorScheme: fallbackScheme };
  return { colorScheme: fallbackScheme };
}

/** 该插件在宿主里的配置快照（host:init 里的 config，形如 { [key]: value }） */
export function initialConfigValue(key) {
  const config = captured.init?.config;
  if (!config || typeof config !== 'object') return undefined;
  return config[key];
}

/* ------------------------------------------------------------------ */
/* 主题                                                                */
/* ------------------------------------------------------------------ */

const SYSTEM_LIGHT_QUERY = '(prefers-color-scheme: light)';

function systemScheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  return window.matchMedia(SYSTEM_LIGHT_QUERY).matches ? 'light' : 'dark';
}

/**
 * 宿主注入的亮暗 + token 颜色 → Fluent Theme。
 * 插件根节点用 `<FluentProvider theme={theme}>` 包住全部内容。
 *
 * - 在宿主里：颜色/亮暗全部由 `host:init` / `host:theme` 驱动（宿主已跟随系统）；
 * - 独立打开（开发/截图）：跟随 `prefers-color-scheme`，并在系统切换时重渲染；
 * - 同时把 `color-scheme` 写到 html/body，让滚动条、原生控件与插件主题一致。
 */
export function useHostTheme(fallbackScheme = 'dark') {
  const [payload, setPayload] = useState(() => initialThemePayload(fallbackScheme));
  const [standaloneScheme, setStandaloneScheme] = useState(systemScheme);

  useEffect(() => {
    // init 的 theme 与 theme 消息同源：首帧早于 host:init 时只能先落到 fallback，
    // 这里补订阅一次，SDK 会重放 init；否则 reload 后插件会停在回退主题。
    const offInit = plugin.onInit((next) => {
      if (next && typeof next === 'object' && next.theme && typeof next.theme === 'object') {
        setPayload(next.theme);
      }
    });
    const offTheme = plugin.onTheme((next) => {
      if (next && typeof next === 'object') setPayload(next);
    });
    return () => {
      offInit();
      offTheme();
    };
  }, []);

  // 独立开发/截图时跟随系统亮暗（宿主内由宿主负责）
  useEffect(() => {
    if (plugin.inHost || typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia(SYSTEM_LIGHT_QUERY);
    const onChange = () => setStandaloneScheme(media.matches ? 'light' : 'dark');
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  const resolvedPayload = plugin.inHost
    ? payload
    : { ...payload, colorScheme: standaloneScheme };

  const result = useMemo(() => resolveTheme(resolvedPayload), [resolvedPayload]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.colorScheme = result.scheme;
    if (document.body) document.body.style.colorScheme = result.scheme;
  }, [result.scheme]);

  return result;
}

/* ------------------------------------------------------------------ */
/* 尺寸                                                                */
/* ------------------------------------------------------------------ */

/**
 * 当前尺寸档位（由宿主 host:init / host:resize 驱动）。
 * @param sizeKeyOf ([w,h]) => '2x1' 形式的档位字符串
 * @param defaultSizeKey 脱离宿主时的默认档位
 */
export function useHostSize(sizeKeyOf, defaultSizeKey) {
  const keyOfRef = useRef(sizeKeyOf);
  keyOfRef.current = sizeKeyOf;
  const [sizeKey, setSizeKey] = useState(() => {
    const size = captured.init?.size;
    return Array.isArray(size) ? keyOfRef.current(size) : defaultSizeKey;
  });
  useEffect(() => {
    const apply = (size) => {
      if (Array.isArray(size) && size.length === 2) setSizeKey(keyOfRef.current(size));
    };
    // 两个来源缺一不可：init 覆盖“React 首帧早于 host:init”（reload 后 iframe 里
    // init 在 load 事件后才到，首帧只能拿到默认档），resize 覆盖运行中的尺寸变化。
    // SDK 会重放最近一次消息，所以即使这里订阅得晚也能补到真实档位。
    const offInit = plugin.onInit((payload) => apply(payload?.size));
    const offResize = plugin.onResize(apply);
    return () => {
      offInit();
      offResize();
    };
  }, []);
  return sizeKey;
}

/* ------------------------------------------------------------------ */
/* 配置持久化                                                          */
/* ------------------------------------------------------------------ */

/**
 * 两份配置值是否语义相同（用于丢弃“自己写盘后宿主再推回来”的重复推送）。
 * 配置值都是 JSON 数据；序列化失败时保守返回 false（照常应用）。
 */
function sameConfigValue(left, right) {
  if (left === right) return true;
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

/**
 * 插件配置读写：初始化先吃 init 快照（首帧不白屏），随后做三件事：
 *
 * 1. 向宿主 `getConfig` 重读一次最新值——`host:init` 的快照可能是宿主渲染时
 *    缓存的旧值（浮层 iframe 尤其明显），不能因为“init 里有值”就跳过重读；
 * 2. 订阅 `plugin.onConfig` 接收宿主主动推送的增量。**这是 Tauri 打包版里唯一
 *    可靠的配置同步通道**：宿主页（`http://tauri.localhost`）与插件 iframe
 *    （`http://wtsl.localhost`）不同 origin，宿主写 localStorage 不会给插件文档
 *    派发 `storage` 事件；
 * 3. 保留 `storage` 监听作为 dev 同源模式（HTTP 插件源）与外部直接写
 *    localStorage 的兼容兜底。
 *
 * 写入路径不变：本地状态先更新，再回传宿主；宿主写盘后会把同值推回来。
 * 用读取序号丢弃晚到的旧 `getConfig` 响应，避免慢返回的旧快照覆盖新写入。
 *
 * @returns [value, setValue, loaded]
 */
export function useStoredConfig(key, fallback, normalize) {
  const normalizeRef = useRef(normalize);
  normalizeRef.current = normalize;
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const [value, setValueState] = useState(() => {
    const fromInit = initialConfigValue(key);
    return normalizeRef.current ? normalizeRef.current(fromInit) : fromInit ?? fallback;
  });
  const [loaded, setLoaded] = useState(() => initialConfigValue(key) !== undefined);

  /** 最新值的同步镜像：setValue 的 updater 形式读它，onConfig 也用它丢弃同值回推 */
  const valueRef = useRef(value);
  valueRef.current = value;

  /** 读取序号：本地写入 / 宿主推送都会让仍在途的旧 getConfig 失效 */
  const readSeq = useRef(0);
  const aliveRef = useRef(true);
  useEffect(
    () => () => {
      aliveRef.current = false;
    },
    [],
  );

  const applyValue = useCallback((raw) => {
    setValueState(normalizeRef.current ? normalizeRef.current(raw) : raw ?? fallbackRef.current);
  }, []);

  const readFromHost = useCallback(() => {
    const seq = ++readSeq.current;
    plugin
      .getConfig(key)
      .then((stored) => {
        if (!aliveRef.current || seq !== readSeq.current) return;
        applyValue(stored);
        setLoaded(true);
      })
      .catch(() => {
        if (aliveRef.current && seq === readSeq.current) setLoaded(true);
      });
  }, [applyValue, key]);

  useEffect(() => {
    // 即使 init 快照里有值也要重读：init 可能落后于宿主 localStorage 的最新值。
    readFromHost();
  }, [readFromHost]);

  // 宿主推送的配置增量（跨 origin 的正确通道）
  useEffect(() => {
    /**
     * onConfig 注册时 SDK 会把 host:init 的配置快照同步重放一遍。这部分值只是
     * “首帧可能没等到 init”的补位，**权威性低于 mount 时的 getConfig 重读**
     * （init 快照可能落后于宿主 localStorage），所以重放期间不能作废在途读取；
     * 只有注册完成后的真实推送才需要作废旧读，避免慢返回的旧值覆盖新写入。
     */
    let replaying = true;
    const off = plugin.onConfig?.((changedKey, next) => {
      if (changedKey !== key) return;
      if (!replaying) readSeq.current += 1;
      setLoaded(true);
      // 宿主会把新值推给该插件的所有 iframe（含写入者自己）；同值回推直接丢弃，
      // 否则 places / cache 每次写盘都会多触发一轮无意义的状态更新（天气会多一轮请求）。
      if (sameConfigValue(next, valueRef.current)) return;
      applyValue(next);
    });
    replaying = false;
    return () => {
      off?.();
    };
  }, [applyValue, key]);

  // dev 同源模式 / 外部直接写 localStorage 的兜底（Tauri 跨 origin 下不会触发）
  useEffect(() => {
    const storageKey = `plugin.${plugin.pluginId}.${key}`;
    const onStorage = (event) => {
      if (event.key !== null && event.key !== storageKey) return;
      readFromHost();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, readFromHost]);

  const setValue = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(valueRef.current) : next;
      readSeq.current += 1;
      valueRef.current = resolved;
      setValueState(resolved);
      plugin.setConfig(key, resolved).catch(() => {});
    },
    [key],
  );

  return [value, setValue, loaded];
}

/* ------------------------------------------------------------------ */
/* 浮层视图（宿主全窗口 Fluent Dialog 加载 ?view=...）                  */
/* ------------------------------------------------------------------ */

/**
 * 当前 iframe 是宿主打开的哪种浮层视图：
 * `settings`（插件设置）/ `detail`（详情，由插件自定义）/ null（卡片视图）。
 * 宿主在 iframe 地址后加 `?view=<name>`；旧的 `?settings=1` 仍兼容。
 */
export function getOverlayView() {
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (view) return view;
  return params.get('settings') === '1' ? 'settings' : null;
}

/** 当前 iframe 是否是「插件设置」浮层视图 */
export function isSettingsView() {
  return getOverlayView() === 'settings';
}

/**
 * 请求宿主打开本插件的浮层视图。
 * 宿主用 `?view=<view>` 把同一插件页面装进全窗口 Fluent Dialog，这样浮层
 * 不会被小卡片的 iframe 边界裁掉（DECISIONS D-02b / docs/PLUGIN-REACT.md）。
 * @param {'settings'|string} view 视图名，插件在 main.jsx 里按它分支渲染
 * @param {string} title 宿主浮层标题（用户语言）
 */
export function requestOverlay(view, title) {
  window.parent.postMessage({ type: 'plugin:request-overlay', payload: { view, title } }, '*');
}

/** 打开插件设置浮层（= requestOverlay('settings')） */
export function requestSettings(title = '设置') {
  requestOverlay('settings', title);
}

/**
 * 请求宿主导航到「设置页 → 插件 → 本插件」分区（契约 §5）。
 * 插件不需要知道宿主路由；宿主按消息来源的 pluginId 选中对应分区，
 * 分区内容由 manifest.json 的 settings schema 通用渲染。
 *
 * 新插件统一用这个入口；`host:open-settings` 旧通道仅保留兼容。
 */
export function requestHostSettings() {
  window.parent.postMessage({ type: 'plugin:request-host-settings' }, '*');
}

/* ------------------------------------------------------------------ */
/* 卡片手势（契约 §3.2 / MOTION §2）                                    */
/* ------------------------------------------------------------------ */

/**
 * 长按进编辑模式：500ms，交互阈值不是动效时长（DESIGN §1.2 / 契约 §3.2）。
 * 与宿主 `src/host/desktop/interaction.ts` 同值；长按计时器只在 SDK 跑这一份。
 */
const LONG_PRESS_MS = 500;

/** 手指/笔抖动容差（px）：移动超过就不算长按（与宿主 interaction.ts 同值） */
const LONG_PRESS_MOVE_TOLERANCE = 8;

/**
 * 卡片内的显式控件：这些目标（及其内部）不触发卡片级 press / hover / 长按，
 * 事件留给控件自己处理（契约 §3.2 第 3 条）。
 */
const CARD_GESTURE_CONTROLS = [
  'button',
  'input',
  'textarea',
  'select',
  'a',
  '[role="button"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="slider"]',
  '[contenteditable]',
].join(',');

/**
 * 卡片根节点自己常常是 role="button"（PLUGIN-REACT「主信息与可访问性」），
 * 过滤时必须排除根节点本身；只有根节点内部的控件才算“交互目标”。
 */
function isCardGestureControl(rootNode, target) {
  if (!(target instanceof Element)) return false;
  const control = target.closest(CARD_GESTURE_CONTROLS);
  return Boolean(control && control !== rootNode && rootNode.contains(control));
}

/**
 * 把卡片 iframe 内的指针状态转发给宿主（契约 §3.2）。
 *
 * 返回 `{ ref }`：把它挂到卡片根节点上即可。
 *   const gesture = useHostCardGesture();
 *   <div ref={gesture.ref} role="button" ...>...</div>
 *
 * 行为：
 * - 只在宿主卡片 iframe 里生效；`window.parent === window`（standalone/demo）与
 *   `?view=...` 浮层视图都不挂监听，没有任何副作用；
 * - `pointerdown / pointerup / pointercancel` 原样转发 pointerType；
 * - hover 只对 mouse / pen 的进入/离开转发（触控没有 hover）；
 * - 只响应主键（button === 0）；移动超过 8px、pointercancel、提前抬起都取消长按；
 * - 长按 500ms 发 `plugin:request-edit-mode`，并在 capture 阶段一次性吞掉后续 click；
 * - 禁用插件页原生右键菜单（contextmenu preventDefault）。
 *
 * 插件不要自己处理长按/右键/hover，也不要再发 `plugin:card-pointer`。
 */
export function useHostCardGesture() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    // standalone / demo 页面不挂监听；浮层视图（?view=detail|settings|…）也不发卡片手势。
    if (!plugin.inHost || getOverlayView()) return undefined;

    let activePointerId = null;
    let startX = 0;
    let startY = 0;
    let longPressTimer = 0;
    let longPressFired = false;
    let hovering = false;
    let swallowTimer = 0;
    let swallowArmed = false;

    const isMouseLike = (pointerType) => pointerType === 'mouse' || pointerType === 'pen';

    const postPointer = (phase, pointerType) => {
      window.parent.postMessage({ type: 'plugin:card-pointer', phase, pointerType }, '*');
    };

    const clearLongPress = () => {
      if (!longPressTimer) return;
      window.clearTimeout(longPressTimer);
      longPressTimer = 0;
    };

    /** 长按触发后吞掉紧随的 click：一次性 capture 监听 + 超时清理（契约 §3.2 第 4 条） */
    function onSwallowClick(event) {
      event.preventDefault();
      event.stopPropagation();
      stopSwallowingClick();
    }

    function stopSwallowingClick() {
      swallowArmed = false;
      window.removeEventListener('click', onSwallowClick, true);
      if (swallowTimer) {
        window.clearTimeout(swallowTimer);
        swallowTimer = 0;
      }
    }

    const swallowNextClick = () => {
      stopSwallowingClick();
      swallowArmed = true;
      window.addEventListener('click', onSwallowClick, true);
      // 兜底：极端情况下（收不到 up/cancel）最多吞 10s，避免永久劫持点击
      swallowTimer = window.setTimeout(stopSwallowingClick, 10000);
    };

    /**
     * 长按可能被用户继续按住很久（>1s），click 在 pointerup 之后才产生：
     * 因此清理计时从 pointerup/cancel 开始，而不是从长按触发那一刻开始。
     */
    const scheduleSwallowCleanup = () => {
      if (!swallowArmed) return;
      if (swallowTimer) window.clearTimeout(swallowTimer);
      swallowTimer = window.setTimeout(stopSwallowingClick, 1000);
    };

    const onPointerDown = (event) => {
      // 只响应主键；触控/笔的 button 也是 0
      if (event.button !== 0) return;
      if (isCardGestureControl(root, event.target)) return;
      if (activePointerId !== null) return;

      activePointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      longPressFired = false;
      postPointer('down', event.pointerType);

      // 长按检测在 SDK：宿主只做视觉与进编辑，不重复跑计时器（MOTION §8）
      longPressTimer = window.setTimeout(() => {
        longPressTimer = 0;
        longPressFired = true;
        // 先装吞 click 的监听，再通知宿主；抬起产生的 click 一定晚于这两步
        swallowNextClick();
        window.parent.postMessage({ type: 'plugin:request-edit-mode' }, '*');
      }, LONG_PRESS_MS);
    };

    const onPointerMove = (event) => {
      // hover 只对鼠标/笔：指针在卡片内移动时按“当前目标是否控件”切换状态
      if (isMouseLike(event.pointerType)) {
        const overCard = !isCardGestureControl(root, event.target);
        if (overCard !== hovering) {
          hovering = overCard;
          postPointer(overCard ? 'hover-enter' : 'hover-leave', event.pointerType);
        }
      }

      if (activePointerId === null || event.pointerId !== activePointerId) return;
      const distance = Math.hypot(event.clientX - startX, event.clientY - startY);
      if (distance <= LONG_PRESS_MOVE_TOLERANCE) return;

      // 移动超容差：取消长按，并让宿主回弹（MOTION §2 状态机）
      clearLongPress();
      if (longPressFired) return;
      activePointerId = null;
      postPointer('cancel', event.pointerType);
    };

    const onPointerUp = (event) => {
      if (activePointerId === null || event.pointerId !== activePointerId) return;
      activePointerId = null;
      clearLongPress();
      postPointer('up', event.pointerType);
      if (longPressFired) scheduleSwallowCleanup();
    };

    const onPointerCancel = (event) => {
      if (activePointerId === null || event.pointerId !== activePointerId) return;
      activePointerId = null;
      clearLongPress();
      postPointer('cancel', event.pointerType);
      if (longPressFired) scheduleSwallowCleanup();
    };

    const onPointerLeave = (event) => {
      if (isMouseLike(event.pointerType) && hovering) {
        hovering = false;
        postPointer('hover-leave', event.pointerType);
      }
      // 指针离开 iframe：收不到 pointerup 时按取消处理，避免宿主按压状态卡死
      if (activePointerId === null || event.pointerId !== activePointerId) return;
      activePointerId = null;
      clearLongPress();
      if (longPressFired) scheduleSwallowCleanup();
      else postPointer('cancel', event.pointerType);
    };

    // 插件不得自造右键菜单：在 capture 阶段禁掉插件页原生 contextmenu（契约 §3.2 第 5 条）
    const onContextMenu = (event) => event.preventDefault();

    // capture：即使插件内部某处 stopPropagation，卡片级手势仍能收到事件
    root.addEventListener('pointerdown', onPointerDown, true);
    root.addEventListener('pointermove', onPointerMove, true);
    root.addEventListener('pointerleave', onPointerLeave);
    // up/cancel 挂 window：指针移出根节点后仍能收到（pointer capture 由浏览器按控件处理）
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    document.addEventListener('contextmenu', onContextMenu, true);

    return () => {
      root.removeEventListener('pointerdown', onPointerDown, true);
      root.removeEventListener('pointermove', onPointerMove, true);
      root.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      document.removeEventListener('contextmenu', onContextMenu, true);
      clearLongPress();
      stopSwallowingClick();
    };
  }, []);

  return { ref };
}

// 浮层视图里按 Esc：焦点在 iframe 内时宿主收不到按键，这里主动请求宿主关闭浮层。
// （卡片视图不装这个监听，Esc 仍交给宿主/插件自己的焦点逻辑。）
if (typeof window !== 'undefined' && getOverlayView()) {
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    window.parent.postMessage({ type: 'plugin:request-overlay-close' }, '*');
  });
}


/** 监听宿主转发的「打开设置」（编辑模式点设置按钮也会走这里） */
export function useSettingsRequest(handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== window.parent) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'host:open-settings') handlerRef.current();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
}

/* ------------------------------------------------------------------ */
/* Agent 工具                                                          */
/* ------------------------------------------------------------------ */

/**
 * 注册 Agent 工具（只声明一次）并处理宿主转发来的工具调用。
 * @param declarations [{ name, description, parameters }]
 * @param handlers { [name]: (args) => result | Promise<result> }
 */
export function useAgentTools(declarations, handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const declarationsRef = useRef(declarations);

  useEffect(() => {
    plugin.ready(declarationsRef.current);
    const off = plugin.onToolCall(async (message) => {
      if (!message || typeof message.name !== 'string') return;
      const handler = handlersRef.current?.[message.name];
      try {
        if (!handler) {
          plugin.toolResult(message.id, false, `未知工具：${message.name}`);
          return;
        }
        const result = await handler(message.args);
        plugin.toolResult(message.id, true, result);
      } catch (error) {
        plugin.toolResult(message.id, false, error instanceof Error ? error.message : String(error));
      }
    });
    return off;
    // 只在挂载时注册一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** 把焦点交还宿主（插件内按 Esc 且没有可关闭的浮层时） */
export function exitFocus() {
  plugin.exitFocus();
}
