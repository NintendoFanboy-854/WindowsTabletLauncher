/**
 * Apple Music Agent 工具：与 UI 共用同一套通用桥接能力。
 *
 * 工具只在卡片视图注册一次（卡片常驻桌面）；大面板执行的操作与这些工具
 * 走同一组宿主 API。每个写操作都有 UI 路径：
 * - playback → 卡片播放/暂停、大面板上一曲/播放暂停/下一曲
 * - openPlayer / minimizePlayer / closePlayer → 大面板底部动作
 */

import {
  browserWindowState,
  controlBrowserWindow,
  mediaCommand,
  mediaSessions,
  openBrowserWindow,
} from '../../_shared/host.js';
import {
  MUSIC_URL,
  PLAYBACK_COMMANDS,
  normalizeSessions,
  normalizeWindowState,
  selectSession,
} from './player.js';

const NO_ARGS = Object.freeze({
  type: 'object',
  properties: {},
  additionalProperties: false,
});

export const APPLE_MUSIC_TOOLS = Object.freeze([
  {
    name: 'appleMusic.status',
    description:
      '读取受管播放器窗口状态与当前媒体会话元数据（只读）。' +
      '返回 { ok, browser, session, sessions }；session 为 null 表示当前没有可显示的播放会话。',
    parameters: NO_ARGS,
  },
  {
    name: 'appleMusic.playback',
    description: '控制当前播放会话：play / pause / toggle / next / previous。',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [...PLAYBACK_COMMANDS],
          description: 'play=播放，pause=暂停，toggle=播放/暂停，next=下一曲，previous=上一曲',
        },
      },
      required: ['action'],
      additionalProperties: false,
    },
  },
  {
    name: 'appleMusic.openPlayer',
    description: '打开或唤起受管播放器窗口；窗口已在运行时只显示并置前。',
    parameters: NO_ARGS,
  },
  {
    name: 'appleMusic.minimizePlayer',
    description: '最小化受管播放器窗口（不停止播放）。',
    parameters: NO_ARGS,
  },
  {
    name: 'appleMusic.closePlayer',
    description: '关闭受管播放器窗口并结束其进程（不关闭启动器）。',
    parameters: NO_ARGS,
  },
]);

function sessionPayload(session) {
  if (!session) return null;
  return {
    id: session.id,
    appId: session.appId,
    title: session.title,
    artist: session.artist,
    album: session.album,
    playing: session.playing === true,
    positionMs: session.positionMs ?? null,
    durationMs: session.durationMs ?? null,
    canPlayPause: session.canPlayPause ?? null,
    canNext: session.canNext ?? null,
    canPrevious: session.canPrevious ?? null,
    artworkKey: session.artworkKey ?? null,
  };
}

/** 读当前窗口 + 会话；与 UI 一样，只有窗口在运行才选会话。 */
async function readCurrent() {
  const [windowValue, sessionValue] = await Promise.all([
    browserWindowState(),
    mediaSessions(),
  ]);
  const browser = normalizeWindowState(windowValue);
  const sessions = normalizeSessions(sessionValue);
  const session = browser.running ? selectSession(sessions) : null;
  return { browser, sessions, session };
}

export function createAppleMusicToolHandlers() {
  return {
    'appleMusic.status': async () => {
      const { browser, sessions, session } = await readCurrent();
      return {
        ok: true,
        browser,
        session: sessionPayload(session),
        sessionCount: sessions.length,
        sessions: sessions.map(sessionPayload),
      };
    },

    'appleMusic.playback': async (args) => {
      const action = typeof args?.action === 'string' ? args.action : '';
      if (!PLAYBACK_COMMANDS.includes(action)) {
        return { ok: false, code: 'invalid-action', error: '不支持的播放操作' };
      }

      const { session } = await readCurrent();
      if (!session) {
        return { ok: false, code: 'no-session', error: '没有可控制的会话' };
      }

      const snapshot = await mediaCommand(session.id, action);
      if (!snapshot) {
        return { ok: false, code: 'command-failed', error: '播放控制失败' };
      }

      const nextSessions = normalizeSessions(snapshot);
      return {
        ok: true,
        action,
        session: sessionPayload(selectSession(nextSessions)),
        sessions: nextSessions.map(sessionPayload),
      };
    },

    'appleMusic.openPlayer': async () => {
      const browser = await openBrowserWindow(MUSIC_URL);
      if (!browser) {
        return { ok: false, code: 'open-failed', error: '打不开播放器' };
      }
      return { ok: true, browser: normalizeWindowState(browser) };
    },

    'appleMusic.minimizePlayer': async () => {
      const browser = await controlBrowserWindow('minimize');
      if (!browser) {
        return { ok: false, code: 'not-running', error: '播放器未运行' };
      }
      return { ok: true, browser: normalizeWindowState(browser) };
    },

    'appleMusic.closePlayer': async () => {
      const browser = await controlBrowserWindow('close');
      if (!browser) {
        return { ok: false, code: 'not-running', error: '播放器未运行' };
      }
      return { ok: true, browser: normalizeWindowState(browser) };
    },
  };
}
