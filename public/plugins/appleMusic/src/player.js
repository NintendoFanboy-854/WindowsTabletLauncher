/**
 * 播放器数据层（全部是 Apple Music 插件自己的业务，宿主不认识这些规则）。
 *
 * - 轮询受管浏览器窗口 + 系统 SMTC 会话；页面隐藏时停摆（宿主只在可见时省电）。
 * - 会话选择是启发式（P3a 提示 Edge 的 AUMID 仍需真机确认）：
 *   优先 appId 含 edge / msedge 且正在播放的会话；否则 appId 含 edge / msedge；
 *   否则只有一个会话时用它；一个都没有 → null。宿主只原样给会话列表，不做过滤。
 * - 封面按 artworkKey 缓存在当前 iframe 的内存 Map：key 不变不重新拉取。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  browserWindowState,
  controlBrowserWindow,
  mediaArtwork,
  mediaCommand,
  mediaSessions,
  openBrowserWindow,
} from '../../_shared/host.js';

/** Apple Music 官方网页（登录也在受管 Edge 窗口里完成，插件不碰凭据）。 */
export const MUSIC_URL = 'https://music.apple.com/cn/';

/** 播放器轮询间隔：规格要求可见时约 1.5–2s，页面隐藏时暂停。 */
export const POLL_INTERVAL_MS = 1800;

/** 受管窗口未运行时的稳定空快照，避免每次轮询都创建新对象。 */
export const EMPTY_WINDOW_STATE = Object.freeze({
  running: false,
  visible: false,
  minimized: false,
  url: null,
});

export const PLAYBACK_COMMANDS = Object.freeze(['play', 'pause', 'toggle', 'next', 'previous']);

/**
 * 归一化宿主返回的窗口状态：命令失败时 SDK 会解析成 undefined，
 * 这里退化成“未运行”，让 UI 稳定落到空态而不是崩溃。
 */
export function normalizeWindowState(value) {
  if (!value || typeof value !== 'object') return { ...EMPTY_WINDOW_STATE };
  return {
    running: value.running === true,
    visible: value.visible === true,
    minimized: value.minimized === true,
    url: typeof value.url === 'string' && value.url ? value.url : null,
  };
}

/** 归一化媒体会话快照；字段按 P3a 的 camelCase JSON 原样使用。 */
export function normalizeSessions(value) {
  const list = Array.isArray(value?.sessions) ? value.sessions : [];
  return list.filter(
    (session) =>
      session &&
      typeof session === 'object' &&
      typeof session.id === 'string' &&
      session.id.length > 0,
  );
}

/**
 * 插件侧会话选择启发式。
 *
 * P3a 已提示：Edge 的 SMTC AUMID 仍需真机确认，可能是 MSEdge、
 * MicrosoftEdge 或带包名的变体；因此先用大小写不敏感的 edge / msedge 子串匹配，
 * 真机确认后再收紧。宿主不写死任何 appId，这里只影响插件显示哪个会话。
 */
export function selectSession(sessions) {
  const list = Array.isArray(sessions) ? sessions : [];
  const edgeSessions = list.filter((session) => {
    const appId = String(session?.appId ?? '').toLowerCase();
    return appId.includes('edge') || appId.includes('msedge');
  });

  const playingEdge = edgeSessions.find((session) => session.playing === true);
  if (playingEdge) return playingEdge;
  if (edgeSessions.length > 0) return edgeSessions[0];
  // 没有 Edge 特征时只接受唯一会话，避免把别的播放器误当成本插件拉起的窗口。
  if (list.length === 1) return list[0];
  return null;
}

/** 毫秒 → `m:ss` / `h:mm:ss`；拿不到时返回占位符。 */
export function formatTime(milliseconds) {
  if (milliseconds === null || milliseconds === undefined || milliseconds === '') return '--:--';
  const value = Number(milliseconds);
  if (!Number.isFinite(value) || value < 0) return '--:--';
  const totalSeconds = Math.floor(value / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (part) => String(part).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** 播放进度（0–1），数据不完整时返回 0。 */
export function playbackProgress(session) {
  const position = Number(session?.positionMs);
  const duration = Number(session?.durationMs);
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) return 0;
  return Math.min(1, Math.max(0, position / duration));
}

/** 窗口控制失败的短文案：只说没做成什么，不写教程（PLUGIN-CONTRACT §4.4.3） */
const CONTROL_ERROR_TEXT = {
  show: '显示失败',
  hide: '隐藏失败',
  minimize: '最小化失败',
  close: '关不掉播放器',
};

/**
 * 播放器状态 hook：窗口状态 + 会话列表 + 带动作错误的命令。
 *
 * 轮询只在 `document.visibilityState === 'visible'` 时进行；隐藏时清掉定时器，
 * 回到可见再立即拉一次。动作成功后用返回值先行更新，避免等下一轮轮询。
 */
export function usePlayer() {
  const [browser, setBrowser] = useState(() => ({ ...EMPTY_WINDOW_STATE }));
  const [sessions, setSessions] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const aliveRef = useRef(true);
  /** 动作会让在途轮询的旧快照失效，避免“刚点完暂停又被旧快照覆盖”。 */
  const revisionRef = useRef(0);

  useEffect(
    () => () => {
      aliveRef.current = false;
    },
    [],
  );

  const refresh = useCallback(async () => {
    const revision = revisionRef.current;
    const [windowValue, sessionValue] = await Promise.all([
      browserWindowState(),
      mediaSessions(),
    ]);
    if (!aliveRef.current || revision !== revisionRef.current) return;
    setBrowser(normalizeWindowState(windowValue));
    setSessions(normalizeSessions(sessionValue));
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    let inFlight = false;

    const tick = async () => {
      if (cancelled || document.visibilityState === 'hidden') return;
      inFlight = true;
      await refresh();
      inFlight = false;
      if (!cancelled && document.visibilityState === 'visible') {
        timer = window.setTimeout(tick, POLL_INTERVAL_MS);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (inFlight) return;
        window.clearTimeout(timer);
        void tick();
      } else {
        window.clearTimeout(timer);
      }
    };

    void tick();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refresh]);

  const open = useCallback(async () => {
    revisionRef.current += 1;
    setError('');
    const next = await openBrowserWindow(MUSIC_URL);
    if (!next) {
      setError('打不开播放器');
      return false;
    }
    setBrowser(normalizeWindowState(next));
    void refresh();
    return true;
  }, [refresh]);

  const control = useCallback(
    async (action) => {
      revisionRef.current += 1;
      setError('');
      const next = await controlBrowserWindow(action);
      if (!next) {
        setError(CONTROL_ERROR_TEXT[action] ?? '窗口操作失败');
        return false;
      }
      setBrowser(normalizeWindowState(next));
      void refresh();
      return true;
    },
    [refresh],
  );

  const command = useCallback(async (sessionId, commandName) => {
    revisionRef.current += 1;
    setError('');
    if (!sessionId) {
      setError('没有可控制的会话');
      return false;
    }
    const snapshot = await mediaCommand(sessionId, commandName);
    if (!snapshot) {
      setError('播放控制失败');
      return false;
    }
    setSessions(normalizeSessions(snapshot));
    return true;
  }, []);

  const session = useMemo(
    () => (browser.running ? selectSession(sessions) : null),
    [browser.running, sessions],
  );

  return {
    browser,
    sessions,
    session,
    ready,
    error,
    refresh,
    open,
    minimize: () => control('minimize'),
    close: () => control('close'),
    command,
  };
}

/**
 * 按 artworkKey 缓存封面 data URL。
 *
 * 同一首歌轮询到新会话快照时 key 不变，effect 依赖不变，不会重新拉取；
 * 换歌（key 变化）才调用 mediaArtwork。缓存只在当前 iframe 生命周期内有效，
 * 大面板是另一个 iframe，不共享这份内存缓存。
 *
 * @param {object|null} session 当前会话
 * @param {boolean} enabled 只在确实要显示封面时拉取（2×1 卡片不传）
 */
export function useArtwork(session, enabled = true) {
  const cacheRef = useRef(new Map());
  const sessionId = session?.id ?? null;
  const artworkKey = session?.artworkKey ?? null;
  const [uri, setUri] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!enabled || !sessionId || !artworkKey) {
      setUri('');
      return () => {
        cancelled = true;
      };
    }

    if (cacheRef.current.has(artworkKey)) {
      setUri(cacheRef.current.get(artworkKey));
      return () => {
        cancelled = true;
      };
    }

    setUri('');
    mediaArtwork(sessionId).then((value) => {
      if (cancelled) return;
      const data = typeof value === 'string' ? value : '';
      cacheRef.current.set(artworkKey, data);
      setUri(data);
    });

    return () => {
      cancelled = true;
    };
  }, [artworkKey, enabled, sessionId]);

  return uri;
}
