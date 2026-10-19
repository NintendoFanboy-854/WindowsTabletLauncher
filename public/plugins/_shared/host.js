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
    const off = plugin.onTheme((next) => {
      if (next && typeof next === 'object') setPayload(next);
    });
    return off;
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
    const off = plugin.onResize((size) => {
      if (Array.isArray(size) && size.length === 2) setSizeKey(keyOfRef.current(size));
    });
    return off;
  }, []);
  return sizeKey;
}

/* ------------------------------------------------------------------ */
/* 配置持久化                                                          */
/* ------------------------------------------------------------------ */

/**
 * 插件配置读写：初始化时先吃 init 快照，再按需从宿主捞一次；写入同时回传宿主。
 * @returns [value, setValue, loaded]
 */
export function useStoredConfig(key, fallback, normalize) {
  const normalizeRef = useRef(normalize);
  normalizeRef.current = normalize;

  const [value, setValueState] = useState(() => {
    const fromInit = initialConfigValue(key);
    return normalizeRef.current ? normalizeRef.current(fromInit) : fromInit ?? fallback;
  });
  const [loaded, setLoaded] = useState(() => initialConfigValue(key) !== undefined);

  useEffect(() => {
    if (initialConfigValue(key) !== undefined) {
      setLoaded(true);
      return undefined;
    }
    let alive = true;
    plugin
      .getConfig(key)
      .then((stored) => {
        if (!alive) return;
        setValueState(normalizeRef.current ? normalizeRef.current(stored) : stored ?? fallback);
        setLoaded(true);
      })
      .catch(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
    // fallback 只在首次使用，不参与依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (next) => {
      setValueState((previous) => {
        const resolved = typeof next === 'function' ? next(previous) : next;
        plugin.setConfig(key, resolved).catch(() => {});
        return resolved;
      });
    },
    [key],
  );

  // 设置视图（宿主全窗口浮层）改了配置后，卡片视图要跟着更新：
  // 宿主把配置写在同源 localStorage 的 `plugin.<pluginId>.<key>`，
  // 另一个 iframe 文档会收到 storage 事件，这里据此重新读一次。
  useEffect(() => {
    const storageKey = `plugin.${plugin.pluginId}.${key}`;
    const onStorage = (event) => {
      if (event.key !== storageKey && event.key !== null) return;
      plugin
        .getConfig(key)
        .then((stored) => {
          setValueState(normalizeRef.current ? normalizeRef.current(stored) : stored ?? fallback);
        })
        .catch(() => {});
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

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
