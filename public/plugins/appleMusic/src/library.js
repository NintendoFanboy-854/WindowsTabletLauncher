/**
 * 播放器数据层：用 CDP 接管「用户正常登录后的官方网页」。
 *
 * 业务全在插件里：宿主只给通用能力（受管浏览器窗口 + `/json/list` 调试目标透传），
 * 不逆向任何 Apple 接口、不读 token；这里只是操作已经登录的官方页面（点链接、点按钮、
 * 读 DOM × `navigator.mediaSession`）。
 *
 * 状态机（同一份面板内）：
 *
 *   idle ──面板打开──▶ connecting ──连上 CDP + 首次 sync──▶ ready
 *                          │                                  │
 *                          │ 拿不到播放列表且页面有登录提示      │ 页面进入登录提示
 *                          ├──────────────▶ login ────────────┘
 *                          │                （显示 Edge，轮询到登录成功后隐藏）
 *                          └── 连接/调试失败 ──▶ error（一句事实 + 刷新按钮）
 *
 * - 默认隐藏 Edge：窗口拉起后立即 `hide`，只有登录时才 `show`；用户也可以在面板底部
 *   手动显示/隐藏。
 * - 轮询：面板可见时 [`POLL_INTERVAL_MS`]（1.8s）一次；`document.visibilityState ===
 *   'hidden'` 时暂停，回到可见立即补一拍。
 * - 断线重连：WebSocket close/error 或页面 target 变化 → 关旧连接、重新取 target 连一次；
 *   失败置错误态，之后每 [`RECONNECT_DELAY_MS`] 再试一次（不会无限快速重连）。
 * - 同一时刻只有一个 CDP 客户端：只有详情面板 iframe 会用这份数据层；卡片 iframe 继续走
 *   宿主的 SMTC（`player.js`），两者不抢同一个 page target。
 */

import { useEffect, useState } from 'react';

import {
  browserWindowDebugTargets,
  browserWindowState,
  controlBrowserWindow,
  openBrowserWindow,
} from '../../_shared/host.js';
import { CdpClient, sleep } from './cdp.js';
import { EMPTY_WINDOW_STATE, POLL_INTERVAL_MS, normalizeWindowState } from './player.js';

/** 资料库「所有播放列表」页（登录也让用户在这个页面里做）。 */
export const LIBRARY_URL = 'https://music.apple.com/cn/library/all-playlists';
/** 侧栏回列表的链接（相对路径，页面里就是这么写的）。 */
const LIBRARY_PATH = '/library/all-playlists';

/** 连接失败后的重试间隔：错误态下每 5s 自动再试一次，用户也可以点「刷新」立刻重试。 */
const RECONNECT_DELAY_MS = 5000;
/** 面板不可见时只暂停同步、不永久停摆：WebView2 里的 visibilityState 可能长时间是 hidden。 */
const HIDDEN_POLL_INTERVAL_MS = 5000;
/** 首次同步等 Apple 页面 hydration 的上限/间隔：DOM readyState 完成后侧栏播放列表还要再渲一下。
 *  真机冷启动（独立 profile、页面完全隐藏）实测需要 40–60s 才把资料库侧栏渲染出来，
 *  这段时间保持「正在连接播放器」，不要先闪「没有播放列表」。 */
const FIRST_SYNC_TIMEOUT_MS = 60000;
const FIRST_SYNC_RETRY_MS = 500;
/** 拉起 Edge 后隐藏窗口的短轮询：窗口句柄可能比进程晚出现，一次 hide 未必打得中。 */
const HIDE_TIMEOUT_MS = 4000;
const HIDE_RETRY_MS = 300;
/** 找 page target 的上限（Edge 冷启动到 DevTools 端口可用）。 */
const TARGET_TIMEOUT_MS = 12000;
const TARGET_POLL_MS = 300;
/** 等 `document.readyState` 离开 loading 的上限。 */
const DOCUMENT_TIMEOUT_MS = 15000;
const DOCUMENT_POLL_MS = 400;
/** SPA 导航完成（URL 变化）的上限。 */
const NAVIGATION_TIMEOUT_MS = 8000;
const URL_POLL_MS = 300;
/** 播放列表页灌入曲目行的上限。 */
const TRACKS_TIMEOUT_MS = 8000;
/** 点击后等到「真的开始播」的上限：DRM 起播约 5–7s。 */
const START_TIMEOUT_MS = 15000;
const START_POLL_MS = 600;
/** 传输命令后让页面状态先变一拍再同步。 */
const ACTION_SETTLE_MS = 400;

/** 播放器控件选择器（真机探针验证过；只操作官方页面自己的按钮）。 */
const PLAY_SELECTOR = 'amp-playback-controls-play button.playback-play__play';
const PAUSE_SELECTOR = 'amp-playback-controls-play button.playback-play__pause';
const NEXT_SELECTOR = 'amp-playback-controls-item-skip[direction="next"]';
const PREVIOUS_SELECTOR = 'amp-playback-controls-item-skip[direction="previous"]';

/* ------------------------------------------------------------------ */
/* 页面内求值脚本                                                       */
/* ------------------------------------------------------------------ */

/**
 * 下面这些函数会被序列化（`Function.prototype.toString()`）后送进 Edge 页面执行，
 * 因此**不能引用本模块的任何变量**：它们在渲染进程里运行，看不到插件作用域。
 */

/**
 * 一次求值拿全量快照：登录态、播放列表（含封面 / 描述 / 歌曲数）、当前播放列表档案、
 * 当前页曲目（序号 / 专辑 / 时长 / 显式标记 / 行内封面）、播放元数据。
 *
 * 选择器依据 2026-10-31 真机探针（受管 profile，CN 站点；证据见报告 §4）：
 * - 播放列表链接：`a[href*="/library/playlist/"]`（侧栏，全量、稳定；主内容区卡片
 *   `[data-testid="product-lockup"]` 的链接是 `href="#"`，**不能**用来导航，
 *   只能按名称补齐封面与副标题）；
 * - 播放列表卡：`[data-testid="product-lockup"]` → `product-lockup-title` /
 *   `product-lockup-subtitle` / `artwork-component` 里的 `source[srcset]`；
 * - 播放列表详情页：`non-editable-product-title` / `product-subtitles` / `description` /
 *   `tracklist-footer-description`（形如「25 首歌曲、1 小时 36 分钟」）；
 * - 曲目行：`[data-testid="track-list-item"]` + `data-row`，列 `track-title` /
 *   `track-column-secondary`（艺人）/ `track-column-tertiary`（专辑）/ `track-duration`，
 *   显式标记 `.songs-list-row__badge--explicit`，行内封面 `artwork-component`。
 *
 * 取不到的字段一律留空（`''` / `0` / `false`），不编造。
 */
function collectSnapshot(includeTracks) {
  /** 节点文本：折叠连续空白（Apple 的 `&nbsp;` 会混进 aria-label / 文本）。 */
  const textOf = (node) =>
    node && typeof node.textContent === 'string'
      ? node.textContent.replace(/\s+/g, ' ').trim()
      : '';

  /** mediaSession artwork：按 `sizes` 取最大一档。 */
  const pickMediaArtwork = (artwork) => {
    if (!Array.isArray(artwork) || artwork.length === 0) return '';
    const sizeOf = (value) => {
      const match = /(\d+)/.exec(String(value || ''));
      return match ? Number(match[1]) : 0;
    };
    let best = '';
    let bestSize = -1;
    for (const item of artwork) {
      if (!item || typeof item.src !== 'string' || !item.src) continue;
      const size = sizeOf(item.sizes);
      if (size > bestSize) {
        bestSize = size;
        best = item.src;
      }
    }
    return best;
  };

  /**
   * 从 `artwork-component` 的 `source[srcset]` 里取最大一档。
   * `<img>` 是 `loading="lazy"` 的占位（`/assets/artwork/1x1.gif`），不能当封面用。
   */
  const pickPicture = (root) => {
    if (!root || typeof root.querySelectorAll !== 'function') return '';
    let best = '';
    let bestWidth = -1;
    for (const source of root.querySelectorAll('source[srcset]')) {
      const items = String(source.getAttribute('srcset') || '').split(',');
      for (const item of items) {
        const parts = item.trim().split(/\s+/);
        const url = parts[0] || '';
        if (!url) continue;
        const width = Number(String(parts[1] || '').replace(/[^\d.]/g, '')) || 0;
        if (width > bestWidth) {
          bestWidth = width;
          best = url;
        }
      }
    }
    if (best) return best;
    const img = root.querySelector('img');
    const src = img ? String(img.currentSrc || img.src || '') : '';
    return /\/assets\/artwork\/1x1\./.test(src) ? '' : src;
  };

  /**
   * 曲目行封面只有 40 / 80 两档（换算到 48 CSS px @200% 太糊）。
   * mzstatic 的 URL 末段是尺寸段，改成 160 档实测可用（HTTP 200，见报告 §4）；
   * 只升不降，非 mzstatic 形式原样返回。
   */
  const atLeast = (url, size) => {
    const value = String(url || '');
    const match = /\/(\d+)x(\d+)([a-z]{2})\.(webp|jpg|jpeg|png)$/i.exec(value);
    if (!match) return value;
    const width = Math.max(Number(match[1]) || 0, Number(match[2]) || 0);
    if (!width || width >= size) return value;
    return value.replace(
      /\/(\d+)x(\d+)([a-z]{2})\.(webp|jpg|jpeg|png)$/i,
      `/${size}x${size}${match[3]}.${match[4]}`,
    );
  };

  /** `m:ss` / `h:mm:ss` → 毫秒；格式不符返回 0。 */
  const parseDuration = (value) => {
    const parts = String(value || '').trim().split(':');
    if (parts.length < 2 || parts.length > 3) return 0;
    let seconds = 0;
    for (const part of parts) {
      const number = Number(part);
      if (!Number.isFinite(number) || number < 0) return 0;
      seconds = seconds * 60 + number;
    }
    return Math.round(seconds * 1000);
  };

  const metadata = navigator.mediaSession ? navigator.mediaSession.metadata : null;
  const audio = document.querySelector('audio');
  const nowPlaying = metadata
    ? {
        title: String(metadata.title || '').trim(),
        artist: String(metadata.artist || '').trim(),
        album: String(metadata.album || '').trim(),
        artworkUrl: pickMediaArtwork(metadata.artwork),
        paused: audio ? Boolean(audio.paused) : true,
        positionMs:
          audio && Number.isFinite(audio.currentTime) ? Math.round(audio.currentTime * 1000) : null,
        durationMs:
          audio && Number.isFinite(audio.duration) && audio.duration > 0
            ? Math.round(audio.duration * 1000)
            : null,
      }
    : null;

  // 主内容区的播放列表卡：按名称补齐封面与副标题（副标题是艺人/策展行，不是歌名）。
  const lockupMeta = new Map();
  for (const lockup of document.querySelectorAll('[data-testid="product-lockup"]')) {
    const aria = String(lockup.getAttribute('aria-label') || '');
    const pieces = aria
      .split('、')
      .map((part) => part.trim())
      .filter(Boolean);
    const name =
      textOf(lockup.querySelector('[data-testid="product-lockup-title"]')) || pieces[0] || '';
    if (!name || lockupMeta.has(name)) continue;
    const description =
      textOf(lockup.querySelector('[data-testid="product-lockup-subtitle"]')) ||
      (pieces.length > 1 ? pieces.slice(1).join('、') : '');
    lockupMeta.set(name, { description: description, artworkUrl: pickPicture(lockup) });
  }

  // 播放列表：侧栏里指向 /library/playlist/ 的链接，按 href 去重。
  const seen = new Set();
  const playlists = [];
  const links = document.querySelectorAll('a[href*="/library/playlist/"]');
  for (const link of links) {
    const href = String(link.getAttribute('href') || '');
    if (!href || seen.has(href)) continue;
    const name = textOf(link) || String(link.getAttribute('aria-label') || '').trim();
    if (!name) continue;
    seen.add(href);
    const meta = lockupMeta.get(name);
    playlists.push({
      href: href,
      name: name,
      artworkUrl: meta ? meta.artworkUrl : '',
      description: meta ? meta.description : '',
      songCount: 0,
    });
  }

  const path = String(location.pathname || '');
  const onPlaylist = path.indexOf('/library/playlist/') >= 0;

  /** 当前播放列表页的档案：标题 / 策展行 / 描述 / 歌曲数（来自页脚「25 首歌曲、1 小时 36 分钟」）。 */
  let currentPlaylist = null;
  if (onPlaylist) {
    const footer = textOf(document.querySelector('[data-testid="tracklist-footer-description"]'));
    const countMatch = /(\d+)\s*首/.exec(footer);
    currentPlaylist = {
      href: path,
      name: textOf(document.querySelector('[data-testid="non-editable-product-title"]')),
      curator: textOf(document.querySelector('[data-testid="product-subtitles"]')),
      description: textOf(document.querySelector('[data-testid="description"]')),
      songCount: countMatch ? Number(countMatch[1]) : 0,
    };
    for (const playlist of playlists) {
      const left = playlist.href.replace(/^\/cn(?=\/)/, '');
      if (left !== path.replace(/^\/cn(?=\/)/, '')) continue;
      playlist.songCount = currentPlaylist.songCount;
      if (!playlist.description) playlist.description = currentPlaylist.description;
    }
  }

  const tracks = [];
  if (includeTracks && onPlaylist) {
    const rows = document.querySelectorAll('[data-testid="track-list-item"]');
    for (let order = 0; order < rows.length; order++) {
      const row = rows[order];
      const rowIndex = Number(row.getAttribute('data-row'));
      const title = textOf(row.querySelector('[data-testid="track-title"]'));
      const artist =
        textOf(row.querySelector('[data-testid="track-column-secondary"]')) ||
        textOf(row.querySelector('[data-testid="track-title-by-line"]'));
      const album = textOf(row.querySelector('[data-testid="track-column-tertiary"]'));
      const duration = textOf(row.querySelector('[data-testid="track-duration"]'));
      const explicit = Boolean(
        row.querySelector('.songs-list-row__badge--explicit, [explicit-badge]'),
      );
      if (!title) continue;
      tracks.push({
        // index = 行在 DOM 里的位置（点第 index 行时用），position = 页面上的显示序号（1 起）
        index: order,
        position: Number.isInteger(rowIndex) && rowIndex >= 0 ? rowIndex + 1 : order + 1,
        title: title,
        artist: artist,
        album: album,
        duration: duration,
        durationMs: parseDuration(duration),
        artworkUrl: atLeast(pickPicture(row.querySelector('[data-testid="artwork-component"]')), 160),
        explicit: explicit,
      });
    }
  }

  // 登录判断只在「拿不到任何播放列表」时做（页面正文含登录入口才可能是未登录）。
  let needLogin = false;
  if (playlists.length === 0) {
    const bodyText = document.body ? String(document.body.innerText || '') : '';
    needLogin =
      bodyText.indexOf('登录') >= 0 ||
      bodyText.indexOf('使用 Apple ID') >= 0 ||
      /sign in/i.test(bodyText);
  }

  return {
    url: String(location.href || ''),
    ready: String(document.readyState || ''),
    onPlaylist: onPlaylist,
    needLogin: needLogin,
    playlists: playlists,
    currentPlaylist: currentPlaylist,
    tracks: tracks,
    nowPlaying: nowPlaying,
  };
}

/** 当前文档 URL / readyState。 */
function readDocumentStatus() {
  return { url: String(location.href || ''), ready: String(document.readyState || '') };
}

/** 播放进度真相：`audio.currentTime` / `duration` 比播放器进度 DOM 可靠（探针结论）。 */
function readPlaybackStatus() {
  const audio = document.querySelector('audio');
  const metadata = navigator.mediaSession ? navigator.mediaSession.metadata : null;
  return {
    title: metadata ? String(metadata.title || '') : '',
    paused: audio ? Boolean(audio.paused) : true,
    currentTime: audio && Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
  };
}

/** 只读 `audio.paused`：决定 toggle 点播放还是暂停。 */
function readAudioPaused() {
  const audio = document.querySelector('audio');
  return audio ? Boolean(audio.paused) : true;
}

/** 当前页曲目行数：等 SPA 把列表灌进来。 */
function readTrackCount() {
  return document.querySelectorAll('[data-testid="track-list-item"]').length;
}

/** 页面内某个选择器的中心点（先滚到视口中央再量）。 */
function selectorCenter(selector) {
  const element = document.querySelector(selector);
  if (!element) return null;
  element.scrollIntoView({ block: 'center', inline: 'nearest' });
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** 第 index 行曲目的播放按钮中心点（每行都有「播放…」按钮）。 */
function trackButtonCenter(index) {
  const rows = document.querySelectorAll('[data-testid="track-list-item"]');
  const row = rows[index];
  if (!row) return null;
  const button = row.querySelector('button[aria-label^="播放"]') || row.querySelector('button');
  if (!button) return null;
  button.scrollIntoView({ block: 'center', inline: 'nearest' });
  const rect = button.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** 按 `href` 属性精确匹配链接（不拼选择器，避免 href 里的字符需要转义）。 */
function anchorCenter(href) {
  const links = document.querySelectorAll('a[href]');
  for (const link of links) {
    if (link.getAttribute('href') !== href) continue;
    link.scrollIntoView({ block: 'center', inline: 'nearest' });
    const rect = link.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  return null;
}

/** 兜底导航：页面内 `.click()`（导航不要求用户手势；指针点击失败时用）。 */
function anchorClick(href) {
  const links = document.querySelectorAll('a[href]');
  for (const link of links) {
    if (link.getAttribute('href') !== href) continue;
    link.click();
    return true;
  }
  return false;
}

/**
 * 把页面内函数 + 参数序列化成一条 `Runtime.evaluate` 表达式。
 * 参数只允许 JSON 值（字符串 / 数字 / 布尔）。
 */
function expressionOf(fn, ...args) {
  return `(${fn.toString()})(${args.map((arg) => JSON.stringify(arg)).join(', ')})`;
}

/* ------------------------------------------------------------------ */
/* 快照归一化（宿主返回值是外部输入，这里兜一次底）                       */
/* ------------------------------------------------------------------ */

/** 折叠空白；非字符串返回空串（页面返回值是外部输入）。 */
function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

/** 只接受 http(s) 图片地址：data: / javascript: / 相对路径一律丢弃。 */
function httpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim()) ? value.trim() : '';
}

/** 计数：非负整数，取不到是 0。 */
function countOf(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

/**
 * 播放列表身份键：去掉 `/cn` 前缀与尾斜杠。
 * 侧栏 href 是 `/library/playlist/p.x`，页面 pathname 可能是 `/cn/library/playlist/p.x`。
 */
function playlistKey(href) {
  const raw = String(href || '').trim();
  if (!raw) return '';
  const path = raw.indexOf('://') >= 0 ? pagePath(raw) : raw;
  return path.replace(/^\/cn(?=\/)/, '').replace(/\/+$/, '');
}

function normalizePlaylists(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const playlists = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const href = typeof item.href === 'string' ? item.href : '';
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    if (!href || !name || seen.has(href)) continue;
    seen.add(href);
    playlists.push({
      href: href,
      name: name,
      artworkUrl: httpUrl(item.artworkUrl),
      description: cleanText(item.description),
      songCount: countOf(item.songCount),
    });
  }
  return playlists;
}

function normalizeCurrentPlaylist(value) {
  if (!value || typeof value !== 'object') return null;
  const href = typeof value.href === 'string' ? value.href : '';
  const key = playlistKey(href);
  const name = cleanText(value.name);
  if (!key && !name) return null;
  return {
    key: key,
    name: name,
    curator: cleanText(value.curator),
    description: cleanText(value.description),
    songCount: countOf(value.songCount),
  };
}

function normalizeTracks(value) {
  if (!Array.isArray(value)) return [];
  const tracks = [];
  value.forEach((item, fallbackIndex) => {
    if (!item || typeof item !== 'object') return;
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const playLabel = typeof item.playLabel === 'string' ? item.playLabel : '';
    if (!title && !playLabel) return;
    const position = Number(item.position);
    tracks.push({
      /** 行在 DOM 里的位置（点击起播按它取行） */
      index: Number.isInteger(item.index) ? item.index : fallbackIndex,
      /** 页面显示的序号（1 起） */
      position: Number.isInteger(position) && position > 0 ? position : fallbackIndex + 1,
      title: title,
      artist: cleanText(item.artist),
      album: cleanText(item.album),
      duration: cleanText(item.duration),
      durationMs: countOf(item.durationMs),
      artworkUrl: httpUrl(item.artworkUrl),
      explicit: item.explicit === true,
      playLabel: playLabel,
    });
  });
  return tracks;
}

function normalizeNowPlaying(value) {
  if (!value || typeof value !== 'object') return null;
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  if (!title) return null;
  return {
    title: title,
    artist: typeof value.artist === 'string' ? value.artist.trim() : '',
    album: typeof value.album === 'string' ? value.album.trim() : '',
    artworkUrl: typeof value.artworkUrl === 'string' ? value.artworkUrl : '',
    paused: value.paused === true,
    positionMs: Number.isFinite(value.positionMs) ? Number(value.positionMs) : null,
    durationMs: Number.isFinite(value.durationMs) ? Number(value.durationMs) : null,
  };
}

/* ------------------------------------------------------------------ */
/* 小工具                                                              */
/* ------------------------------------------------------------------ */

/** 面板/会话换代后仍在飞的异步操作：不算错误，静默丢弃。 */
class SessionCancelled extends Error {}

/** 播放器窗口已被关掉（不自动拉起，停在未运行空态）。 */
class WindowClosed extends Error {}

const FALLBACK_ERROR = '播放器连接中断';
/** 中文短句直接透出；更长的底层报错（WebSocket/JSON 细节）收敛成一句事实。 */
function errorText(error) {
  const message = error instanceof Error ? error.message : String(error || '');
  if (!message) return FALLBACK_ERROR;
  return message.length <= 16 && /[\u4e00-\u9fa5]/.test(message) ? message : FALLBACK_ERROR;
}

function pagePath(url) {
  try {
    return new URL(String(url || '')).pathname;
  } catch {
    return '';
  }
}

/** URL 是否指向某个 href（Apple Music 的 URL 带 `/cn` 前缀与尾斜杠；href 可能是绝对的）。 */
function pathMatches(url, href) {
  const urlPath = pagePath(url).replace(/\/+$/, '');
  const raw = String(href || '');
  const target = (raw.indexOf('://') >= 0 ? pagePath(raw) : raw).replace(/\/+$/, '');
  if (!urlPath || !target) return false;
  return urlPath === target || urlPath.endsWith(target);
}

/* ------------------------------------------------------------------ */
/* store                                                               */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  /** idle（未运行）/ connecting / login / ready / error */
  phase: 'idle',
  browser: { ...EMPTY_WINDOW_STATE },
  connected: false,
  loggedIn: false,
  needLogin: false,
  url: '',
  ready: '',
  playlists: [],
  tracks: [],
  /** 当前播放列表页的档案 `{ key, name, curator, description, songCount }`；不在播放列表页是 null */
  currentPlaylist: null,
  /** L2 打开的播放列表 `{ href, name }`；null = 停在 L1 */
  activePlaylist: null,
  tracksLoading: false,
  nowPlaying: null,
  /** 正在起播的曲目行下标（面板里只显示这一个 loading 行） */
  playingIndex: null,
  transportBusy: false,
  error: '',
};

/**
 * 建一个播放器 store（详情面板里只用模块级那一个 `library`）。
 *
 * 所有对外方法都返回 Promise，失败时把一句中文事实写进 `state.error`，不抛给调用方。
 */
export function createLibraryStore() {
  const listeners = new Set();
  let state = { ...INITIAL_STATE };
  let session = null;
  let timer = 0;
  let running = false;
  /** 面板挂载代次：卸载/重开后，旧的异步流程自行退出。 */
  let generation = 0;
  /** 自动重连的下一次最早时间（错误态按 5s 退避，不快速重连）。 */
  let retryAt = 0;
  /** 本次登录是否已经把 Edge 显示出来了（成功登录后只隐藏一次）。 */
  let loginShown = false;
  /**
   * 用户是否主动要看见播放器窗口（点了「显示播放器」）。
   * 为 true 时同步兜底不再把可见窗口隐藏；点「隐藏播放器」/关窗/重开面板时复位。
   */
  let userWantsVisible = false;
  /**
   * 播放列表歌曲数缓存（`playlistKey → 首数`）。
   * 只有打开过某个播放列表、页脚给了「N 首歌曲」才知道数量；缓存让 L1 列表随后带上它。
   * 每次 `start()` 清空，跨面板会话不保留可能过期的计数。
   */
  let songCounts = new Map();

  const setState = (patch) => {
    state = { ...state, ...patch };
    for (const listener of listeners) {
      try {
        listener(state);
      } catch {
        /* 订阅方自己的错误不打断状态分发 */
      }
    }
  };

  const getState = () => state;

  const subscribe = (listener) => {
    if (typeof listener !== 'function') return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const isCurrent = (token) => running && token === generation;

  const checkCurrent = (token) => {
    if (!isCurrent(token)) throw new SessionCancelled();
  };

  const clearTimer = () => {
    if (!timer) return;
    window.clearTimeout(timer);
    timer = 0;
  };

  const closeSession = () => {
    const current = session;
    session = null;
    if (!current) return;
    try {
      current.close();
    } catch {
      /* 已经断开 */
    }
  };

  const handleSessionClosed = (client) => {
    if (client !== session) return;
    session = null;
    setState({ connected: false });
  };

  const markWindowClosed = () => {
    // 窗口没了就把连接也放掉：残留的 WebSocket 会让下一次「打开播放器」连到死 target。
    closeSession();
    loginShown = false;
    userWantsVisible = false;
    setState({
      ...INITIAL_STATE,
      browser: { ...EMPTY_WINDOW_STATE },
      activePlaylist: null,
      error: '',
    });
  };

  /** 窗口控制（show / hide / close）；失败按“未运行”归一化，下一轮轮询会纠正。 */
  const controlWindow = async (action) => {
    const next = normalizeWindowState(await controlBrowserWindow(action).catch(() => null));
    setState({ browser: next });
    return next;
  };

  /**
   * 拉起 Edge 后尽快隐藏（默认不让用户看到播放器窗口）。
   *
   * `open` 只等窗口句柄 600ms，冷启动时窗口可能还没建好，一次 hide 会报“找不到窗口”；
   * 因此这里短轮询重试，成功隐藏就返回。隐藏失败不阻断连接（页面照样能控制）。
   */
  const hideWindowWhenReady = async (token) => {
    const deadline = Date.now() + HIDE_TIMEOUT_MS;
    while (Date.now() < deadline) {
      checkCurrent(token);
      const next = normalizeWindowState(await controlBrowserWindow('hide').catch(() => null));
      checkCurrent(token);
      if (next.running) {
        setState({ browser: next });
        if (!next.visible) return true;
      }
      await sleep(HIDE_RETRY_MS);
    }
    return false;
  };

  /** 等一个已经导航到网页的 page target；窗口刚拉起时可能还是 about:blank。 */
  const findPageTarget = async (token) => {
    const deadline = Date.now() + TARGET_TIMEOUT_MS;
    let pages = [];
    while (Date.now() < deadline) {
      checkCurrent(token);
      const snapshot = await browserWindowDebugTargets().catch(() => null);
      checkCurrent(token);
      if (snapshot && Array.isArray(snapshot.targets)) {
        pages = snapshot.targets.filter(
          (target) => target && target.type === 'page' && target.webSocketDebuggerUrl,
        );
        const preferred = pages.find(
          (target) => String(target.url || '').indexOf('music.apple.com') >= 0,
        );
        if (preferred) return preferred;
      }
      await sleep(TARGET_POLL_MS);
    }
    checkCurrent(token);
    // 没有已导航的 target 时按调用方要求退到第一个 page（之后 sync 会自己纠错）。
    return pages[0] || null;
  };

  /** 等页面离开 loading；超时不致命（后续 sync 继续读）。 */
  const waitForDocument = async (client, token) => {
    const deadline = Date.now() + DOCUMENT_TIMEOUT_MS;
    while (Date.now() < deadline) {
      checkCurrent(token);
      const status = await client
        .evaluate(expressionOf(readDocumentStatus), 4000)
        .catch(() => null);
      checkCurrent(token);
      if (!status) {
        await sleep(DOCUMENT_POLL_MS);
        continue;
      }
      const ready = typeof status.ready === 'string' ? status.ready : '';
      const url = typeof status.url === 'string' ? status.url : '';
      if (ready && ready !== 'loading' && url.indexOf('music.apple.com') >= 0) return status;
      await sleep(DOCUMENT_POLL_MS);
    }
    return null;
  };

  /**
   * 连 WebSocket。一个 page target 同时只允许一个客户端：上一个面板的 WebSocket 可能还在
   * 关闭中，因此失败后隔 500ms 重试一次（仍失败就按错误态处理）。
   */
  const connectClient = async (webSocketUrl, token) => {
    const first = new CdpClient(webSocketUrl);
    first.onClose(() => handleSessionClosed(first));
    try {
      await first.open();
      return first;
    } catch {
      first.close();
      checkCurrent(token);
      await sleep(500);
      checkCurrent(token);
      const second = new CdpClient(webSocketUrl);
      second.onClose(() => handleSessionClosed(second));
      await second.open();
      return second;
    }
  };

  /**
   * 面板重开时如果 Edge 还停在某个播放列表页（上次在 L2 关面板），先点回列表页。
   *
   * 只做 SPA 导航（点侧栏链接），不刷新页面、不打断正在播的曲目；找不到链接就保持原状，
   * 由 sync 读页面现有内容，不报错。
   */
  const normalizeLibraryPage = async (token) => {
    const client = session;
    if (!client || !client.isOpen()) return;
    const status = await client
      .evaluate(expressionOf(readDocumentStatus), 4000)
      .catch(() => null);
    checkCurrent(token);
    const url = status && typeof status.url === 'string' ? status.url : '';
    if (!url || pathMatches(url, LIBRARY_PATH)) return;
    if (pagePath(url).indexOf('/library/playlist/') < 0) return;
    const clicked = await clickAnchor(client, LIBRARY_PATH).catch(() => false);
    if (!clicked) return;
    await waitForUrlChange(client, token, url, LIBRARY_PATH).catch(() => false);
  };

  /**
   * 确保有一个可用连接。
   *
   * `autoOpen`：窗口未运行时是否自动拉起（面板打开 / 用户点刷新 / 打开播放器 = true；
   * 后台轮询 = false，避免用户关掉 Edge 后被我们自动重开）。
   */
  const ensureSession = async (token, autoOpen) => {
    if (session && session.isOpen()) return session;
    closeSession();
    checkCurrent(token);

    const windowState = normalizeWindowState(await browserWindowState().catch(() => null));
    checkCurrent(token);
    setState({ browser: windowState });

    if (!windowState.running) {
      if (!autoOpen) throw new WindowClosed();
      setState({ phase: 'connecting', connected: false, error: '' });
      const opened = normalizeWindowState(await openBrowserWindow(LIBRARY_URL).catch(() => null));
      checkCurrent(token);
      if (!opened.running) throw new Error('打不开播放器');
      setState({ browser: opened });
      // 默认不让用户看到 Edge：拉起后立即隐藏，只有登录/异常时才 show。
      await hideWindowWhenReady(token);
    }

    const target = await findPageTarget(token);
    if (!target || !target.webSocketDebuggerUrl) throw new Error('找不到播放器连接');

    const client = await connectClient(target.webSocketDebuggerUrl, token);
    checkCurrent(token);
    session = client;
    // 隐藏的 Edge 窗口在 Chromium 里是 hidden 页面：Apple Music 的 DRM 起播会卡在
    // readyState=0（真机实测 15s 不走）。把页面模拟成「已聚焦/激活」不显示窗口，
    // 同一套 CDP 点击即可正常起播。
    await client.setActivePage(true);
    checkCurrent(token);
    setState({ connected: true, url: target.url || '' });
    await waitForDocument(client, token);
    checkCurrent(token);
    return client;
  };

  /**
   * 同步一次：一次 evaluate 拿全量快照，写进状态。
   *
   * `tracks`：是否连曲目列表一起读（只在 L2 打开/刷新时 true，避免每 1.8s 传一份长列表）。
   */
  const syncNow = async (token, options) => {
    const client = session;
    if (!client || !client.isOpen()) throw new Error('播放器连接已断开');
    const withTracks = Boolean(options && options.tracks === true);
    const [snapshot, windowValue] = await Promise.all([
      client.evaluate(expressionOf(collectSnapshot, withTracks)),
      browserWindowState().catch(() => null),
    ]);
    checkCurrent(token);
    if (!snapshot || typeof snapshot !== 'object') throw new Error('播放器页面无响应');

    const url = typeof snapshot.url === 'string' ? snapshot.url : '';
    // 连到了不是网页文档的 target（窗口刚拉起时可能还是 about:blank）：按连接问题重来，
    // 下一轮会挑到已经导航过的 page target。
    if (url.indexOf('https://') !== 0) throw new Error('播放器页面未就绪');

    const browser = windowValue && typeof windowValue === 'object'
      ? normalizeWindowState(windowValue)
      : null;
    // 只有拿到明确的「未运行」才收摊；状态命令偶发失败不能当成窗口被关掉。
    if (browser && !browser.running) throw new WindowClosed();

    const playlists = normalizePlaylists(snapshot.playlists);
    const currentPlaylist = normalizeCurrentPlaylist(snapshot.currentPlaylist);
    const nowPlaying = normalizeNowPlaying(snapshot.nowPlaying);
    // 打开过的播放列表把页脚给的歌曲数记下来，随后 L1 列表带上「N 首」
    if (currentPlaylist && currentPlaylist.key && currentPlaylist.songCount > 0) {
      songCounts.set(currentPlaylist.key, currentPlaylist.songCount);
    }
    const mergedPlaylists = playlists.map((playlist) => {
      const cached = songCounts.get(playlistKey(playlist.href)) || 0;
      return cached > playlist.songCount ? { ...playlist, songCount: cached } : playlist;
    });
    const needLogin = snapshot.needLogin === true;
    const patch = {
      browser: browser || state.browser,
      url: url,
      ready: typeof snapshot.ready === 'string' ? snapshot.ready : '',
      playlists: mergedPlaylists,
      currentPlaylist: currentPlaylist,
      nowPlaying: nowPlaying,
      needLogin: needLogin,
      loggedIn: !needLogin && mergedPlaylists.length > 0,
      connected: true,
      error: '',
    };
    if (withTracks) patch.tracks = normalizeTracks(snapshot.tracks);

    if (needLogin) {
      patch.phase = 'login';
      setState(patch);
      if (!loginShown) {
        // 只在第一次进入登录态时显示窗口，避免每轮同步都把 Edge 顶到最前面。
        loginShown = true;
        await controlWindow('show');
      }
    } else {
      patch.phase = 'ready';
      setState(patch);
      if (loginShown) {
        loginShown = false;
        await controlWindow('hide');
      } else if (!userWantsVisible && browser && browser.running && browser.visible) {
        // 拉起早期可能因为窗口句柄还没建好导致 hide 失败；已登录状态下每轮同步兜底隐藏，
        // 不把 Edge 窗口留在桌面上（登录态 / 用户主动「显示播放器」除外）。
        await controlWindow('hide');
      }
    }
    return {
      playlists: mergedPlaylists,
      currentPlaylist: currentPlaylist,
      nowPlaying: nowPlaying,
      tracks: state.tracks,
    };
  };

  /** 页面层面的失败保留连接与已有数据；连接没了才进错误态并按退避重连。 */
  const handleError = (error, token) => {
    if (!isCurrent(token) || error instanceof SessionCancelled) return;
    if (error instanceof WindowClosed) {
      markWindowClosed();
      return;
    }
    const text = errorText(error);
    if (session && session.isOpen()) {
      setState({ error: text });
      return;
    }
    session = null;
    retryAt = Date.now() + RECONNECT_DELAY_MS;
    setState({ error: text, phase: 'error', connected: false });
  };

  const schedule = (delay = POLL_INTERVAL_MS) => {
    clearTimer();
    if (!running) return;
    const token = generation;
    timer = window.setTimeout(() => {
      timer = 0;
      void tick(token);
    }, delay);
  };

  /** 按 `href` 导航：先真实指针点，点不到再退回页面内 `.click()`（导航不要求手势）。 */
  const clickAnchor = async (client, href) => {
    const center = await client.evaluate(expressionOf(anchorCenter, href)).catch(() => null);
    if (center && Number.isFinite(center.x) && Number.isFinite(center.y)) {
      await client.clickPoint(center.x, center.y);
      return true;
    }
    const clicked = await client.evaluate(expressionOf(anchorClick, href)).catch(() => false);
    return clicked === true;
  };

  const waitForUrlChange = async (client, token, previousUrl, targetPath) => {
    const deadline = Date.now() + NAVIGATION_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await sleep(URL_POLL_MS);
      checkCurrent(token);
      const status = await client
        .evaluate(expressionOf(readDocumentStatus), 4000)
        .catch(() => null);
      if (!status) continue;
      const url = typeof status.url === 'string' ? status.url : '';
      if (url && url !== previousUrl && pathMatches(url, targetPath)) return true;
    }
    return false;
  };

  const waitForTracks = async (client, token) => {
    const deadline = Date.now() + TRACKS_TIMEOUT_MS;
    while (Date.now() < deadline) {
      checkCurrent(token);
      const count = await client.evaluate(expressionOf(readTrackCount), 4000).catch(() => 0);
      if (typeof count === 'number' && count > 0) return true;
      await sleep(DOCUMENT_POLL_MS);
    }
    return false;
  };

  /** 起播判定：标题变化 或 `audio.currentTime` 开始走（DRM 起播约 5–7s）。 */
  const waitForPlaybackStart = async (client, token, before) => {
    const previousTitle = before && typeof before.title === 'string' ? before.title : '';
    const deadline = Date.now() + START_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await sleep(START_POLL_MS);
      checkCurrent(token);
      const status = await client
        .evaluate(expressionOf(readPlaybackStatus), 4000)
        .catch(() => null);
      if (!status) continue;
      const title = typeof status.title === 'string' ? status.title : '';
      const running =
        status.paused === false && Number(status.currentTime) > 0.5;
      if ((title && title !== previousTitle) || running) return true;
    }
    return false;
  };

  /* ---------------- 对外动作 ---------------- */

  const refresh = async () => {
    if (!running) return false;
    const token = generation;
    retryAt = 0;
    setState({ error: '' });
    try {
      await ensureSession(token, true);
      await syncNow(token, { tracks: Boolean(state.activePlaylist) });
      schedule(POLL_INTERVAL_MS);
      return true;
    } catch (error) {
      if (error instanceof WindowClosed) {
        markWindowClosed();
        return false;
      }
      handleError(error, token);
      schedule(RECONNECT_DELAY_MS);
      return false;
    }
  };

  const openPlayer = async () => {
    if (!running) return false;
    const token = generation;
    retryAt = 0;
    // 显式「打开播放器」：先丢掉可能已经死掉的旧连接，重新走一遍拉起 + 连接。
    closeSession();
    setState({ phase: 'connecting', connected: false, error: '' });
    try {
      await ensureSession(token, true);
      await syncNow(token, { tracks: false });
      schedule(POLL_INTERVAL_MS);
      return true;
    } catch (error) {
      if (error instanceof WindowClosed) {
        markWindowClosed();
        return false;
      }
      handleError(error, token);
      schedule(RECONNECT_DELAY_MS);
      return false;
    }
  };

  const closePlayer = async () => {
    clearTimer();
    closeSession();
    loginShown = false;
    userWantsVisible = false;
    await controlWindow('close');
    markWindowClosed();
    return true;
  };

  const showPlayer = () => {
    userWantsVisible = true;
    return controlWindow('show');
  };
  const hidePlayer = () => {
    userWantsVisible = false;
    return controlWindow('hide');
  };

  const openPlaylist = async (href, name) => {
    if (!running || !href) return false;
    const token = generation;
    setState({
      activePlaylist: { href: href, name: name || '' },
      tracks: [],
      currentPlaylist: null,
      tracksLoading: true,
      error: '',
    });
    try {
      const client = await ensureSession(token, false);
      const status = await client
        .evaluate(expressionOf(readDocumentStatus), 4000)
        .catch(() => null);
      checkCurrent(token);
      if (!pathMatches(status && status.url, href)) {
        const clicked = await clickAnchor(client, href);
        if (!clicked) throw new Error('打不开播放列表');
        const changed = await waitForUrlChange(client, token, status && status.url, href);
        if (!changed) throw new Error('打不开播放列表');
        await waitForTracks(client, token);
      }
      checkCurrent(token);
      await syncNow(token, { tracks: true });
      setState({ tracksLoading: false });
      return true;
    } catch (error) {
      setState({ activePlaylist: null, tracks: [], tracksLoading: false });
      handleError(error, token);
      return false;
    }
  };

  /** L2 返回：让 Edge 页面也回到列表页（两边一致），再清空曲目。 */
  const closePlaylist = () => {
    setState({ activePlaylist: null, tracks: [], currentPlaylist: null, tracksLoading: false });
    void backToLibrary();
  };

  const backToLibrary = async () => {
    if (!running) return false;
    const token = generation;
    try {
      const client = await ensureSession(token, false);
      const status = await client
        .evaluate(expressionOf(readDocumentStatus), 4000)
        .catch(() => null);
      checkCurrent(token);
      if (!pathMatches(status && status.url, LIBRARY_PATH)) {
        const clicked = await clickAnchor(client, LIBRARY_PATH);
        if (!clicked) throw new Error('打不开播放列表');
        await waitForUrlChange(client, token, status && status.url, LIBRARY_PATH);
      }
      checkCurrent(token);
      await syncNow(token, { tracks: false });
      return true;
    } catch (error) {
      handleError(error, token);
      return false;
    }
  };

  const playTrack = async (index) => {
    if (!running) return false;
    const token = generation;
    setState({ playingIndex: index, error: '' });
    try {
      const client = await ensureSession(token, false);
      const before = await client
        .evaluate(expressionOf(readPlaybackStatus), 4000)
        .catch(() => null);
      const center = await client
        .evaluate(expressionOf(trackButtonCenter, index))
        .catch(() => null);
      checkCurrent(token);
      if (!center || !Number.isFinite(center.x) || !Number.isFinite(center.y)) {
        throw new Error('起播失败');
      }
      await client.clickPoint(center.x, center.y);
      const started = await waitForPlaybackStart(client, token, before);
      checkCurrent(token);
      await syncNow(token, { tracks: false });
      setState({ playingIndex: null, error: started ? '' : '起播超时' });
      return started;
    } catch (error) {
      setState({ playingIndex: null });
      handleError(error, token);
      return false;
    }
  };

  const transport = async (command) => {
    if (!running) return false;
    const token = generation;
    setState({ transportBusy: true, error: '' });
    try {
      const client = await ensureSession(token, false);
      let selector = NEXT_SELECTOR;
      if (command === 'previous') selector = PREVIOUS_SELECTOR;
      if (command === 'toggle') {
        const paused = await client.evaluate(expressionOf(readAudioPaused)).catch(() => null);
        checkCurrent(token);
        selector = paused === true ? PLAY_SELECTOR : PAUSE_SELECTOR;
      }
      const center = await client
        .evaluate(expressionOf(selectorCenter, selector))
        .catch(() => null);
      checkCurrent(token);
      if (!center || !Number.isFinite(center.x) || !Number.isFinite(center.y)) {
        throw new Error('播放控制失败');
      }
      await client.clickPoint(center.x, center.y);
      await sleep(ACTION_SETTLE_MS);
      await syncNow(token, { tracks: false });
      setState({ transportBusy: false });
      return true;
    } catch (error) {
      setState({ transportBusy: false });
      handleError(error, token);
      return false;
    }
  };

  /* ---------------- 轮询 ---------------- */

  const tick = async (token) => {
    if (!isCurrent(token)) return;
    // 启动器隐藏/最小化时暂停同步（省电）；但不能永久停摆——真机实测 WebView2 的
    // visibilityState 可能长时间是 hidden（尤其 Edge 窗口短暂抢过前台），必须排下一拍重试。
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      schedule(HIDDEN_POLL_INTERVAL_MS);
      return;
    }
    try {
      if (!session || !session.isOpen()) {
        if (Date.now() < retryAt) {
          schedule(RECONNECT_DELAY_MS);
          return;
        }
        await ensureSession(token, false);
        checkCurrent(token);
      }
      await syncNow(token, { tracks: false });
      schedule(POLL_INTERVAL_MS);
    } catch (error) {
      if (error instanceof WindowClosed) {
        // 用户把播放器关掉了：停在「未运行」空态，不自动重开。
        markWindowClosed();
        return;
      }
      handleError(error, token);
      schedule(RECONNECT_DELAY_MS);
    }
  };

  const onVisibilityChange = () => {
    if (typeof document === 'undefined' || document.visibilityState !== 'visible') return;
    if (!running) return;
    clearTimer();
    void tick(generation);
  };

  const start = () => {
    if (running) return;
    running = true;
    generation += 1;
    retryAt = 0;
    loginShown = false;
    userWantsVisible = false;
    songCounts = new Map();
    state = { ...INITIAL_STATE, browser: { ...EMPTY_WINDOW_STATE }, phase: 'connecting' };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }
    void (async () => {
      const token = generation;
      try {
        await ensureSession(token, true);
        // 上次在 L2 里直接关面板时，Edge 会停在播放列表页：先回到列表页，保持两边一致。
        await normalizeLibraryPage(token);
        await syncNow(token, { tracks: false });
        checkCurrent(token);
        // 冷启动时 DOM 已 ready 但 Apple 的侧栏还在 hydration：首同步可能是空列表。
        // 已登录（非登录态）且还没有播放列表时保持「连接中」短轮询补几拍，
        // 避免先闪一下「没有播放列表」再变成真列表。
        const firstSyncDeadline = Date.now() + FIRST_SYNC_TIMEOUT_MS;
        while (
          isCurrent(token) &&
          state.playlists.length === 0 &&
          !state.needLogin &&
          !state.error &&
          Date.now() < firstSyncDeadline
        ) {
          setState({ phase: 'connecting' });
          await sleep(FIRST_SYNC_RETRY_MS);
          checkCurrent(token);
          await syncNow(token, { tracks: false });
        }
        checkCurrent(token);
        schedule(POLL_INTERVAL_MS);
      } catch (error) {
        if (!isCurrent(token) || error instanceof SessionCancelled) return;
        if (error instanceof WindowClosed) {
          markWindowClosed();
          return;
        }
        handleError(error, token);
        schedule(RECONNECT_DELAY_MS);
      }
    })();
  };

  const stop = () => {
    if (!running) return;
    running = false;
    generation += 1;
    clearTimer();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
    closeSession();
    loginShown = false;
    userWantsVisible = false;
    retryAt = 0;
    state = { ...INITIAL_STATE, browser: { ...EMPTY_WINDOW_STATE } };
  };

  return {
    getState,
    subscribe,
    start,
    stop,
    refresh,
    openPlayer,
    closePlayer,
    showPlayer,
    hidePlayer,
    openPlaylist,
    closePlaylist,
    playTrack,
    transport,
  };
}

/** 详情面板单例（只有面板 iframe 用它；卡片继续走 SMTC）。 */
export const library = createLibraryStore();

/**
 * 面板数据 hook：挂载即接管播放器（默认隐藏 Edge），卸载断开 WebSocket 与定时器。
 * 返回 store 的只读快照。
 */
export function useLibrary() {
  const [snapshot, setSnapshot] = useState(() => library.getState());
  useEffect(() => {
    let active = true;
    const off = library.subscribe((next) => {
      if (active) setSnapshot(next);
    });
    library.start();
    setSnapshot(library.getState());
    return () => {
      active = false;
      off();
      library.stop();
    };
  }, []);
  return snapshot;
}
