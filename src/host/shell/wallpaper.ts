/**
 * 必应每日壁纸数据层（v0.6.0）。
 *
 * 数据源固定为必应官方归档 `HPImageArchive.aspx`（`mkt=zh-CN`），不再试第三方镜像：
 * 镜像站给的 `url` 与文案时常落后于官方，且 `mkt` 直接决定图与文案，第三方无法保证一致。
 *
 * 取图规则（实测，勿改）：
 * - 4K 只能由 `urlbase` + `_UHD.jpg` 拼出（3840×2160）。任何 `&w=`/`&h=` 参数、
 *   `_3840x2160.jpg`、`_4k.jpg` 一律 404，所以不要「顺手补个宽高」。
 * - 历史最多 15 天：`idx=0&n=8` 与 `idx=7&n=8` 两页合并去重；`idx>=8` 只是重复最后 8 条。
 * - 缩略图没有独立参数，历史列表的懒加载图用官方 `url`（1080p，约 332 KB）。
 *
 * 状态机（三种模式，互斥）：
 * - `auto`：以**本地日期**判定该显示哪天的图（不再用固定 12h TTL）；
 *   `autoUpdate === false` 时保留当前图，跨天也不跟。
 * - `pinned`：`pin(entry)` 之后忽略日期变化，`refresh()` 也不动 current。
 * - `local`：本机图片，二进制在 IndexedDB（见 `localWallpaper.ts`），
 *   键按文件内容寻址（`local:<内容哈希>`），说明按内容地址挂。
 *
 * 缓存：`wtsl.wallpaper.v2` 存 state + history 元数据，不含任何图片二进制。
 * 读时逐字段校验，坏数据整体回落默认。旧键 `wtsl.wallpaper.v1` 只读一次用于迁移，
 * 迁移后**不删**旧键（留一条回滚路径）。
 *
 * 纯文本层：本模块不产生任何面向用户的提示文案，失败只体现为 `status`。
 */

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  contentHash,
  createObjectUrl,
  deleteLocalImage,
  getLocalImage,
  putLocalImage,
  releaseObjectUrl,
  updateLocalImageCaption,
  type StoredLocalImage,
} from './localWallpaper.ts';
import { invokeCommand, isTauriRuntime } from '../plugins/tauri.ts';

/* ------------------------------------------------------------------ */
/* 对外契约                                                            */
/* ------------------------------------------------------------------ */

export type WallpaperMode = 'auto' | 'pinned' | 'local';

export interface WallpaperEntry {
  /** 内容地址：hsh 优先；缺失退化 urlbase（见 wallpaperEntryKey） */
  key: string;
  title: string;
  copyright: string;
  copyrightLink: string;
  /** YYYY-MM-DD，来自 startdate */
  date: string;
  /** urlbase + '_UHD.jpg'（4K） */
  imageUrl: string;
  /** 官方 url（1080p），历史列表懒加载用 */
  thumbUrl: string;
  /** 'zh-CN' */
  market: string;
  /** drk === 1 */
  dark: boolean;
  /** top === 1 */
  topBright: boolean;
  /** bot === 1 */
  bottomBright: boolean;
}

export interface LocalWallpaper {
  key: string;
  name: string;
  caption: string;
  url: string;
}

export interface WallpaperState {
  mode: WallpaperMode;
  /** auto / pinned 模式的当前图 */
  current: WallpaperEntry | null;
  /** local 模式的当前图 */
  local: LocalWallpaper | null;
  autoUpdate: boolean;
}

export type WallpaperStatus = 'idle' | 'loading' | 'error';

/** store 的只读快照（`useWallpaper()` 的返回值去掉动作；给单测/调试用）。 */
export interface WallpaperSnapshot {
  state: WallpaperState;
  history: WallpaperEntry[];
  status: WallpaperStatus;
}

export interface WallpaperController {
  state: WallpaperState;
  /** 最近 15 天，按日期倒序 */
  history: WallpaperEntry[];
  status: WallpaperStatus;
  /** 拉最新 + 历史（4K 图不必预取） */
  refresh(): Promise<void>;
  /** null = 回到 auto */
  pin(entry: WallpaperEntry | null): void;
  setAutoUpdate(next: boolean): void;
  useLocal(file: File, caption: string): Promise<void>;
  setLocalCaption(caption: string): void;
  clearLocal(): void;
}

/* ------------------------------------------------------------------ */
/* 常量                                                                */
/* ------------------------------------------------------------------ */

const CACHE_KEY = 'wtsl.wallpaper.v2';
const LEGACY_CACHE_KEY = 'wtsl.wallpaper.v1';
const CACHE_VERSION = 2;

const MARKET = 'zh-CN';
const BING_ORIGIN = 'https://www.bing.com';
const ARCHIVE_URL = (idx: number): string =>
  `${BING_ORIGIN}/HPImageArchive.aspx?format=js&idx=${idx}&n=8&mkt=${MARKET}`;
/** 两页拼满 15 天；idx 再往后只是重复。 */
const ARCHIVE_PAGES: readonly number[] = [0, 7];
const HISTORY_LIMIT = 15;
const REQUEST_TIMEOUT_MS = 8000;
/** 跨天检测的轮询间隔：只比字符串，代价可忽略。 */
const DATE_WATCH_INTERVAL_MS = 60_000;
const LOCAL_KEY_PREFIX = 'local:';

/* ------------------------------------------------------------------ */
/* 纯函数（单测入口）                                                  */
/* ------------------------------------------------------------------ */

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === 'string' ? value.trim() : '';
}

function readFlag(source: Record<string, unknown>, key: string): boolean {
  const value = source[key];
  return value === 1 || value === '1' || value === true;
}

function absoluteBingUrl(value: string): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${BING_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`;
}

function hashText(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * 内容地址：`hsh` 优先；缺失退化到绝对化的 `urlbase`；再缺就用 `url` 的哈希。
 * 只认这三种来源，别的字段（title 之类）不参与——同一天不同 mkt 的 key 必须不同，
 * 同一张图换文案的 key 必须相同。
 */
export function wallpaperEntryKey(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const candidate = raw as Record<string, unknown>;
  const hsh = readString(candidate, 'hsh');
  if (hsh) return hsh;
  const urlbase = absoluteBingUrl(readString(candidate, 'urlbase'));
  if (urlbase) return urlbase;
  const fallback = readString(candidate, 'url') || readString(candidate, 'thumbUrl') || readString(candidate, 'imageUrl');
  return fallback ? `url:${hashText(fallback)}` : '';
}

/** 本地日期键（本地时区，不用 UTC——跨时区用 UTC 会让早上多拉一次）。 */
export function localDateKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 自动模式挑图：给出 `today`（YYYY-MM-DD）时取「日期不晚于今天」的最新一条。
 * 全部条目都在今天之后（时钟乱跳/历史只有未来）时返回 null，让上层保持现状并等待刷新。
 */
export function pickCurrentForAuto(history: readonly WallpaperEntry[], today: string): WallpaperEntry | null {
  for (const entry of normalizeHistory(history)) {
    if (!entry.date) return entry;
    if (entry.date <= today) return entry;
  }
  return null;
}

function normalizeDate(value: string): string {
  if (/^\d{8}$/.test(value)) return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return '';
}

function normalizeHistory(entries: readonly WallpaperEntry[]): WallpaperEntry[] {
  const seen = new Set<string>();
  const unique: WallpaperEntry[] = [];
  for (const entry of entries) {
    if (seen.has(entry.key)) continue;
    seen.add(entry.key);
    unique.push(entry);
  }
  unique.sort((left, right) => {
    if (left.date === right.date) return left.key < right.key ? 1 : -1;
    return left.date < right.date ? 1 : -1;
  });
  return unique.slice(0, HISTORY_LIMIT);
}

/* ------------------------------------------------------------------ */
/* 解析与校验                                                          */
/* ------------------------------------------------------------------ */

function parseArchivedImage(raw: unknown): WallpaperEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const key = wallpaperEntryKey(item);
  const urlbase = absoluteBingUrl(readString(item, 'urlbase'));
  const url = absoluteBingUrl(readString(item, 'url'));
  const imageUrl = urlbase ? `${urlbase}_UHD.jpg` : url;
  if (!key || !imageUrl) return null;
  const thumbUrl = url || (urlbase ? `${urlbase}_1920x1080.jpg` : imageUrl);
  const date = normalizeDate(readString(item, 'startdate')) || normalizeDate(readString(item, 'datetime'));
  return {
    key,
    title: readString(item, 'title'),
    copyright: readString(item, 'copyright'),
    copyrightLink: readString(item, 'copyrightlink'),
    date,
    imageUrl,
    thumbUrl,
    market: readString(item, 'market') || readString(item, 'mkt') || MARKET,
    dark: readFlag(item, 'drk'),
    topBright: readFlag(item, 'top'),
    bottomBright: readFlag(item, 'bot'),
  };
}

function isDateLike(value: unknown): boolean {
  return typeof value === 'string' && (value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function isWallpaperEntry(value: unknown): value is WallpaperEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.key === 'string' &&
    entry.key.length > 0 &&
    typeof entry.title === 'string' &&
    typeof entry.copyright === 'string' &&
    typeof entry.copyrightLink === 'string' &&
    isDateLike(entry.date) &&
    typeof entry.imageUrl === 'string' &&
    entry.imageUrl.length > 0 &&
    typeof entry.thumbUrl === 'string' &&
    entry.thumbUrl.length > 0 &&
    typeof entry.market === 'string' &&
    entry.market.length > 0 &&
    typeof entry.dark === 'boolean' &&
    typeof entry.topBright === 'boolean' &&
    typeof entry.bottomBright === 'boolean'
  );
}

function isWallpaperMode(value: unknown): value is WallpaperMode {
  return value === 'auto' || value === 'pinned' || value === 'local';
}

function isPersistedLocal(value: unknown): value is { key: string; name: string; caption: string } {
  if (!value || typeof value !== 'object') return false;
  const local = value as Record<string, unknown>;
  return (
    typeof local.key === 'string' &&
    local.key.length > 0 &&
    typeof local.name === 'string' &&
    typeof local.caption === 'string'
  );
}

/* ------------------------------------------------------------------ */
/* 持久化                                                              */
/* ------------------------------------------------------------------ */

interface PersistedState {
  mode: WallpaperMode;
  current: WallpaperEntry | null;
  local: { key: string; name: string; caption: string } | null;
  autoUpdate: boolean;
}

interface PersistedWallpaper {
  version: number;
  savedAt: number;
  state: PersistedState;
  history: WallpaperEntry[];
}

type Snapshot = WallpaperSnapshot;

function readRaw(key: string): string | null {
  if (typeof localStorage === 'undefined' || !localStorage) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): void {
  if (typeof localStorage === 'undefined' || !localStorage) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 隐私模式 / 配额满：状态留在内存里，下次再写 */
  }
}

function toRecord(snapshot: Snapshot): PersistedWallpaper {
  const local = snapshot.state.local;
  return {
    version: CACHE_VERSION,
    savedAt: Date.now(),
    state: {
      mode: snapshot.state.mode,
      current: snapshot.state.current,
      // objectURL 跨进程无效，不落盘；启动后按 key 从 IndexedDB 重建
      local: local ? { key: local.key, name: local.name, caption: local.caption } : null,
      autoUpdate: snapshot.state.autoUpdate,
    },
    history: snapshot.history,
  };
}

function defaultSnapshot(): Snapshot {
  return {
    state: { mode: 'auto', current: null, local: null, autoUpdate: true },
    history: [],
    status: 'idle',
  };
}

function readPersisted(raw: string | null): Snapshot | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const record = parsed as Partial<PersistedWallpaper>;
  if (record.version !== CACHE_VERSION) return null;
  const state = record.state as Partial<PersistedState> | undefined;
  if (!state || !isWallpaperMode(state.mode) || typeof state.autoUpdate !== 'boolean') return null;

  const rawCurrent = state.current;
  let current: WallpaperEntry | null = null;
  if (rawCurrent !== null && rawCurrent !== undefined) {
    if (!isWallpaperEntry(rawCurrent)) return null;
    current = rawCurrent;
  }

  let local: LocalWallpaper | null = null;
  const rawLocal = state.local;
  if (rawLocal !== null && rawLocal !== undefined) {
    if (!isPersistedLocal(rawLocal)) return null;
    local = { key: rawLocal.key, name: rawLocal.name, caption: rawLocal.caption, url: '' };
  }

  const rawHistory = Array.isArray(record.history) ? record.history : [];
  const history = normalizeHistory(rawHistory.filter(isWallpaperEntry));
  return { state: { mode: state.mode, current, local, autoUpdate: state.autoUpdate }, history, status: 'idle' };
}

/** 旧 v1（`{ savedAt, wallpaper }`）迁移：只取 title/copyright/url，key 退化为 url 哈希。 */
function readLegacySnapshot(): Snapshot | null {
  const raw = readRaw(LEGACY_CACHE_KEY);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const record = parsed as Record<string, unknown>;
  const inner = record.wallpaper;
  const legacy = (inner && typeof inner === 'object' ? inner : record) as Record<string, unknown>;
  const url = readString(legacy, 'url');
  if (!url) return null;
  const entry = parseArchivedImage({
    url,
    title: legacy.title,
    copyright: legacy.copyright,
    copyrightlink: legacy.copyrightlink,
    datetime: legacy.datetime,
  });
  if (!entry) return null;
  const snapshot: Snapshot = {
    state: { mode: 'auto', current: entry, local: null, autoUpdate: true },
    history: [entry],
    status: 'idle',
  };
  // 写 v2，旧键保留（可回滚）
  writeRaw(CACHE_KEY, JSON.stringify(toRecord(snapshot)));
  return snapshot;
}

function loadSnapshot(): Snapshot {
  return readPersisted(readRaw(CACHE_KEY)) ?? readLegacySnapshot() ?? defaultSnapshot();
}

/* ------------------------------------------------------------------ */
/* 模块级 store                                                        */
/* ------------------------------------------------------------------ */

let snapshot: Snapshot = loadSnapshot();
const listeners = new Set<() => void>();

/** 当前生效的 objectURL；换图 / 清除时释放，避免 blob 泄漏。 */
let activeLocalUrl: string | null = null;

function getSnapshot(): Snapshot {
  return snapshot;
}

/** 只读快照（React 之外读 store 的唯一入口；不要拿它改状态）。 */
export function getWallpaperSnapshot(): WallpaperSnapshot {
  return snapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function patch(next: Partial<Snapshot>): void {
  snapshot = { ...snapshot, ...next };
  writeRaw(CACHE_KEY, JSON.stringify(toRecord(snapshot)));
  for (const listener of listeners) listener();
}

function applyHistory(state: WallpaperState, history: WallpaperEntry[]): WallpaperState {
  if (state.mode === 'local') return state;
  if (state.mode === 'pinned') return state;
  if (!state.autoUpdate) {
    // 不跟随日期：有 current 就留着，没有才拿最新一条点亮
    return state.current ? state : { ...state, current: history[0] ?? null };
  }
  const picked = pickCurrentForAuto(history, localDateKey());
  return { ...state, current: picked ?? state.current ?? history[0] ?? null };
}

/* ------------------------------------------------------------------ */
/* 取数                                                                */
/* ------------------------------------------------------------------ */

/**
 * 从 `ARCHIVE_URL(idx)` 拼出的地址里取回 `idx` / `n` / `mkt`。
 *
 * 只在 origin 与 `BING_ORIGIN` 一致时成立：Rust 侧按固定参数重拼 URL，不接受任意地址。
 */
function archiveQuery(url: string): { idx: number; n: number; mkt: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== BING_ORIGIN) return null;
    const idx = Number(parsed.searchParams.get('idx') ?? '0');
    const n = Number(parsed.searchParams.get('n') ?? '8');
    if (!Number.isInteger(idx) || idx < 0) return null;
    if (!Number.isInteger(n) || n <= 0) return null;
    return { idx, n, mkt: parsed.searchParams.get('mkt') || MARKET };
  } catch {
    return null;
  }
}

/**
 * 经 Rust command `fetch_bing_archive` 代取归档 JSON（0.6.0 的 CORS 修复）。
 *
 * `HPImageArchive.aspx` 的响应头没有 `Access-Control-Allow-Origin`，WebView2 里的原生
 * `fetch` 必然被拦；这里拿**原文**再 `JSON.parse`，解析口径不变。
 * 非 Tauri 运行时（浏览器/截图）、调用异常、空响应、坏 JSON 一律返回 null，
 * 由 `fetchJson` 回退到原来的 `window.fetch` 路径。
 */
async function fetchArchiveViaCommand(url: string): Promise<unknown | null> {
  const query = archiveQuery(url);
  if (!query || !isTauriRuntime()) return null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // 前端侧仍按 REQUEST_TIMEOUT_MS 兜底：Rust 侧超时是 8s，两边语义一致。
    const text = await Promise.race([
      invokeCommand<string>('fetch_bing_archive', query),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), REQUEST_TIMEOUT_MS);
      }),
    ]);
    if (typeof text !== 'string' || !text.trim()) return null;
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

async function fetchJson(url: string): Promise<unknown | null> {
  // 先走 Rust 代取（绕 CORS）；拿不到再退回原生 fetch（浏览器调试、命令异常时仍可工作）
  const archived = await fetchArchiveViaCommand(url);
  if (archived !== null) return archived;
  if (typeof fetch !== 'function') return null;
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = setTimeout(() => controller?.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller?.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHistory(): Promise<WallpaperEntry[]> {
  const payloads = await Promise.all(ARCHIVE_PAGES.map((idx) => fetchJson(ARCHIVE_URL(idx))));
  const entries: WallpaperEntry[] = [];
  for (const payload of payloads) {
    const images = (payload as { images?: unknown } | null)?.images;
    if (!Array.isArray(images)) continue;
    for (const image of images) {
      const entry = parseArchivedImage(image);
      if (entry) entries.push(entry);
    }
  }
  return normalizeHistory(entries);
}

/* ------------------------------------------------------------------ */
/* 对外动作                                                            */
/* ------------------------------------------------------------------ */

export async function refresh(): Promise<void> {
  patch({ status: 'loading' });
  const entries = await fetchHistory();
  if (entries.length === 0) {
    // 失败不清 current：界面上继续显示上一次的图
    patch({ status: 'error' });
    return;
  }
  const history = normalizeHistory([...entries, ...snapshot.history]);
  patch({ state: applyHistory(snapshot.state, history), history, status: 'idle' });
}

export function pin(entry: WallpaperEntry | null): void {
  if (entry) {
    if (snapshot.state.local) {
      releaseObjectUrl(activeLocalUrl ?? snapshot.state.local.url);
      activeLocalUrl = null;
    }
    patch({
      state: { ...snapshot.state, mode: 'pinned', current: entry, local: null },
    });
    return;
  }
  if (snapshot.state.mode === 'local') {
    releaseObjectUrl(activeLocalUrl ?? snapshot.state.local?.url ?? null);
    activeLocalUrl = null;
  }
  const current = pickCurrentForAuto(snapshot.history, localDateKey()) ?? snapshot.history[0] ?? null;
  patch({ state: { ...snapshot.state, mode: 'auto', current, local: null } });
}

export function setAutoUpdate(next: boolean): void {
  if (snapshot.state.autoUpdate === next) return;
  const state = { ...snapshot.state, autoUpdate: next };
  if (next && state.mode === 'auto') {
    state.current = pickCurrentForAuto(snapshot.history, localDateKey()) ?? state.current;
  }
  patch({ state });
}

export async function useLocal(file: File, caption: string): Promise<void> {
  const key = `${LOCAL_KEY_PREFIX}${await contentHash(file)}`;
  const stored: StoredLocalImage = {
    key,
    name: typeof file.name === 'string' ? file.name : '',
    caption,
    blob: file,
    savedAt: Date.now(),
  };
  const saved = await putLocalImage(stored);
  if (!saved) {
    patch({ status: 'error' });
    return;
  }
  const url = createObjectUrl(file);
  if (activeLocalUrl) releaseObjectUrl(activeLocalUrl);
  activeLocalUrl = url;
  patch({
    status: 'idle',
    state: {
      ...snapshot.state,
      mode: 'local',
      local: { key, name: stored.name, caption, url },
    },
  });
}

export function setLocalCaption(caption: string): void {
  const local = snapshot.state.local;
  if (!local) return;
  patch({ state: { ...snapshot.state, local: { ...local, caption } } });
  void updateLocalImageCaption(local.key, caption);
}

export function clearLocal(): void {
  const local = snapshot.state.local;
  if (local) {
    releaseObjectUrl(local.url || activeLocalUrl);
    activeLocalUrl = null;
    void deleteLocalImage(local.key);
  }
  const current = snapshot.state.current ?? pickCurrentForAuto(snapshot.history, localDateKey()) ?? snapshot.history[0] ?? null;
  patch({ state: { ...snapshot.state, mode: 'auto', local: null, current } });
}

/* ------------------------------------------------------------------ */
/* 启动期的两件事：重建 objectURL、跨天跟随                             */
/* ------------------------------------------------------------------ */

async function hydrateLocal(): Promise<void> {
  const local = snapshot.state.local;
  if (!local) {
    if (snapshot.state.mode === 'local') patch({ state: { ...snapshot.state, mode: 'auto' } });
    return;
  }
  const stored = await getLocalImage(local.key);
  if (!stored) {
    // 记录被清掉（例如清过浏览器数据）：回到 auto，不留一个空 src
    clearLocal();
    return;
  }
  const url = createObjectUrl(stored.blob);
  if (activeLocalUrl) releaseObjectUrl(activeLocalUrl);
  activeLocalUrl = url;
  patch({
    state: {
      ...snapshot.state,
      local: { key: stored.key, name: stored.name, caption: stored.caption, url },
    },
  });
}

let watchStarted = false;
let watchedDate = '';

function startDateWatch(): void {
  if (watchStarted) return;
  watchStarted = true;
  watchedDate = localDateKey();
  void syncForToday();
  if (typeof globalThis.setInterval !== 'function') return;
  globalThis.setInterval(() => {
    const today = localDateKey();
    if (today === watchedDate) return;
    watchedDate = today;
    void syncForToday();
  }, DATE_WATCH_INTERVAL_MS);
}

async function syncForToday(): Promise<void> {
  if (snapshot.state.mode === 'local') return;
  if (snapshot.history.length === 0) {
    await refresh();
    return;
  }
  if (!snapshot.state.autoUpdate) return;
  if (snapshot.status === 'loading') return;
  const newest = snapshot.history[0]?.date ?? '';
  if (newest && newest >= localDateKey()) return;
  await refresh();
}

/* ------------------------------------------------------------------ */
/* React hook                                                          */
/* ------------------------------------------------------------------ */

export function useWallpaper(): WallpaperController {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void hydrateLocal();
  }, []);

  useEffect(() => {
    startDateWatch();
  }, []);

  return useMemo<WallpaperController>(
    () => ({
      state: current.state,
      history: current.history,
      status: current.status,
      refresh,
      pin,
      setAutoUpdate,
      useLocal,
      setLocalCaption,
      clearLocal,
    }),
    [current],
  );
}

/* ------------------------------------------------------------------ */
/* v0.4/v0.5 兼容层                                                    */
/*                                                                     */
/* `App.tsx` 与 `desktop/WallpaperLayer` 仍按旧符号取壁纸，且这两个文件 */
/* 不属于本模块的改动范围，所以旧类型与旧函数继续导出，内部改为读新    */
/* store。新 UI 请直接用 `useWallpaper()`。                            */
/* ------------------------------------------------------------------ */

export type WallpaperSource = 'bimg' | 'apifox' | 'bing';

export interface BingWallpaper {
  title: string;
  copyright: string;
  copyrightlink: string;
  /** 4K（UHD）图片地址 */
  url: string;
  /** 图片日期 YYYY-MM-DD */
  datetime: string;
  source: WallpaperSource;
}

function toLegacy(state: WallpaperState): BingWallpaper | null {
  if (state.mode === 'local' && state.local) {
    return {
      title: state.local.name,
      copyright: state.local.caption,
      copyrightlink: '',
      url: state.local.url,
      datetime: '',
      source: 'bing',
    };
  }
  const entry = state.current;
  if (!entry) return null;
  return {
    title: entry.title,
    copyright: entry.copyright,
    copyrightlink: entry.copyrightLink,
    url: entry.imageUrl,
    datetime: entry.date,
    source: 'bing',
  };
}

export interface WallpaperCredit {
  /** 第一行：图片标题 */
  title: string;
  /** 第二行：地点短句（版权串去掉作者与最后一级区域，最多两段） */
  location: string;
  /** 完整版权（读屏 / title 用） */
  full: string;
}

export function wallpaperCredit(wallpaper: BingWallpaper): WallpaperCredit {
  const withoutAuthor = wallpaper.copyright.split(/\s*[（(]/)[0]?.trim() ?? '';
  const segments = withoutAuthor
    .split(/[，,]/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const location = segments.slice(0, 2).join('，');
  return {
    title: wallpaper.title,
    location,
    full: wallpaper.copyright,
  };
}

export function readCachedWallpaper(): BingWallpaper | null {
  return toLegacy(snapshot.state);
}

export async function fetchBingWallpaper(): Promise<BingWallpaper | null> {
  await refresh();
  return toLegacy(getSnapshot().state);
}

export function useBingWallpaper(): BingWallpaper | null {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void hydrateLocal();
  }, []);

  useEffect(() => {
    startDateWatch();
  }, []);

  return useMemo(() => toLegacy(current.state), [current]);
}
