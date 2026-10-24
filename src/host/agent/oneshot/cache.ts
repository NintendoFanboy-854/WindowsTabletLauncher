/**
 * 「欣赏壁纸」说明卡的持久缓存：独立 IndexedDB 库 `wtsl.wallpaper-note`。
 *
 * 为什么不进 localStorage：会话（`agent.conversations`）整块读写、有大小上限，
 * 说明卡属于另一类数据——按内容地址寻址、条目会长期累积、失败还要记时间戳。
 * 这里也不与会话层共享任何键：本文件不 import `storage.ts`。
 *
 * 键 = `${内容地址}|${市场}|${PROMPT_VERSION}`：
 * - 必应换图 → 内容地址变 → 键变 → 自然 miss；
 * - 切回旧图 → 键命中 → 零网络零成本；
 * - 改提示词 → 版本变 → 全部 miss，旧条目留在库里不迁移（按需清理，不做隐式删除）。
 *
 * 失败记录与成功记录同表：`text` 为空 + `lastFailureAt` 非零 = 24 小时内不再尝试。
 *
 * 所有 IDB 异常都吞掉（返回 null / 静默），因为 UI 只认 `ready` / `failed`：
 * 隐私模式、配额满、库被删都不该把错误冒到界面上。
 */

import { DEFAULT_MARKET, PROMPT_VERSION } from './prompt';
import type { WallpaperNote } from './types';

const DB_NAME = 'wtsl.wallpaper-note';
const DB_VERSION = 1;
const STORE_NOTES = 'notes';

/** 失败后多久才允许重试：同一张图失败一次后 24 小时内不再花钱 */
export const RETRY_AFTER_FAILURE_MS = 24 * 60 * 60 * 1000;

/** 库里的行：成功行 `text` 非空；失败行 `text` 为空、`lastFailureAt` 非零 */
export interface NoteRecord {
  /** 缓存键（含市场与提示词版本） */
  key: string;
  text: string;
  model: string;
  createdAt: number;
  /** 这张图一共尝试过几次（失败也计数） */
  tries: number;
  /** 最近一次失败的时间戳；0 = 最近一次不是失败 */
  lastFailureAt: number;
}

export interface NoteCacheKeyInput {
  key: string;
  market: string;
}

/** 组装缓存键；内容地址为空时返回空串（调用方按「没有 key」处理） */
export function cacheKeyFor(input: NoteCacheKeyInput): string {
  const contentKey = input.key.trim();
  if (!contentKey) return '';
  const market = input.market.trim() || DEFAULT_MARKET;
  return `${contentKey}|${market}|${PROMPT_VERSION}`;
}

/**
 * `getCachedNote(key)` 的入参兼容两种写法：
 * - 完整缓存键（含 `|`，即 `cacheKeyFor()` 的产物，`WallpaperNote.key` 也是它）；
 * - 裸内容地址（不含 `|`）：按默认市场 `zh-CN` + 当前提示词版本补齐。
 */
function resolveLookupKey(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  if (value.includes('|')) return value;
  return `${value}|${DEFAULT_MARKET}|${PROMPT_VERSION}`;
}

/* ------------------------------------------------------------------ */
/* IndexedDB 薄封装（只覆盖本模块用到的四个动作：open / get / put / 版本升级） */
/* ------------------------------------------------------------------ */

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase | null>((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    // 打不开（隐私模式 / 配额 / 版本冲突）就当没有缓存：本模块对外只表现成 miss
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
  return dbPromise;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** 库里取出来的东西一律重新校验：脏数据当 miss，不把 NaN 传下去 */
function normalizeRecord(raw: unknown, expectedKey: string): NoteRecord | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.key !== 'string' || value.key !== expectedKey) return null;
  return {
    key: value.key,
    text: typeof value.text === 'string' ? value.text : '',
    model: typeof value.model === 'string' ? value.model : '',
    createdAt: isFiniteNumber(value.createdAt) ? value.createdAt : 0,
    tries: isFiniteNumber(value.tries) ? Math.max(0, Math.round(value.tries)) : 0,
    lastFailureAt: isFiniteNumber(value.lastFailureAt) ? value.lastFailureAt : 0,
  };
}

/** 读一行；任何异常都返回 null（= miss） */
export function readNoteRecord(cacheKey: string): Promise<NoteRecord | null> {
  if (!cacheKey) return Promise.resolve(null);
  return new Promise<NoteRecord | null>((resolve) => {
    void openDb().then((db) => {
      if (!db) {
        resolve(null);
        return;
      }
      let transaction: IDBTransaction;
      try {
        transaction = db.transaction([STORE_NOTES], 'readonly');
      } catch {
        resolve(null);
        return;
      }
      const request = transaction.objectStore(STORE_NOTES).get(cacheKey);
      request.onsuccess = () => resolve(normalizeRecord(request.result, cacheKey));
      request.onerror = () => resolve(null);
      transaction.onabort = () => resolve(null);
    });
  });
}

/** 写一行（失败行也走这里）；写不进去就算了，不改动调用方结果 */
export function saveNoteRecord(record: NoteRecord): Promise<void> {
  return new Promise<void>((resolve) => {
    void openDb().then((db) => {
      if (!db) {
        resolve();
        return;
      }
      let transaction: IDBTransaction;
      try {
        transaction = db.transaction([STORE_NOTES], 'readwrite');
      } catch {
        resolve();
        return;
      }
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => resolve();
      transaction.onerror = () => resolve();
      try {
        transaction.objectStore(STORE_NOTES).put(record);
      } catch {
        resolve();
      }
    });
  });
}

/* ------------------------------------------------------------------ */
/* 对外读写                                                             */
/* ------------------------------------------------------------------ */

/** 成功行 → 对外契约；失败行 / 空文本 → null */
export function noteFromRecord(record: NoteRecord | null): WallpaperNote | null {
  if (!record || !record.text.trim()) return null;
  return {
    key: record.key,
    text: record.text,
    model: record.model,
    createdAt: record.createdAt,
  };
}

/** 失败行是否还在 24 小时冷静期内（冷静期内不发起新请求） */
export function isSuppressed(record: NoteRecord | null, now = Date.now()): boolean {
  if (!record || record.text.trim() || !record.lastFailureAt) return false;
  return now - record.lastFailureAt < RETRY_AFTER_FAILURE_MS;
}

/**
 * 只读 peek：命中返回缓存，未命中 / 失败冷静期 / 库不可用一律 null。
 * 不发请求、不计费，可以在任意时机调用。
 */
export async function getCachedNote(key: string): Promise<WallpaperNote | null> {
  return noteFromRecord(await readNoteRecord(resolveLookupKey(key)));
}
