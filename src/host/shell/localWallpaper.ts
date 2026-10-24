/**
 * 本机图片壁纸的二进制存储层（v0.6.0）。
 *
 * 为什么是 IndexedDB 而不是 localStorage：一张 4K 图的 JPEG 就有 3 MB 量级，
 * localStorage 是「字符串 + 5 MB 总量」的口袋，base64 还要再胀 33%，一定撑爆配额，
 * 而配额炸掉会顺手连带 `wtsl.wallpaper.v2`（状态与历史）一起写不进去。
 * 所以图片走 IndexedDB 的 Blob，状态与历史元数据继续留在 localStorage。
 *
 * 键按内容寻址：`contentHash` 对文件字节做 SHA-256（无 SubtleCrypto 时退化为
 * FNV-1a + 字节长度）。同一张图重复导入得到同一个键，记录被覆盖而不是堆积，
 * 上层据此把「解释/说明」挂在稳定的内容地址上。
 *
 * 只做存取与 URL 生命周期，不产生任何面向用户的文案，也不 import React。
 */

/** IndexedDB 结构；改结构要同时升 DB_VERSION。 */
const DB_NAME = 'wtsl.wallpaper.local';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export interface StoredLocalImage {
  /** 内容地址（由调用方生成，形如 `local:<hash>`） */
  key: string;
  /** 文件名原文 */
  name: string;
  /** 说明原文；空串如实保存，不替换成文件名 */
  caption: string;
  /** 图片二进制 */
  blob: Blob;
  /** 写入时间戳（ms） */
  savedAt: number;
}

/* ------------------------------------------------------------------ */
/* IndexedDB 基础                                                      */
/* ------------------------------------------------------------------ */

function openRequest(request: IDBOpenDBRequest): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('wtsl.indexeddb.open'));
  });
}

async function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined' || !indexedDB) return null;
  try {
    return await openRequest(indexedDB.open(DB_NAME, DB_VERSION));
  } catch {
    return null;
  }
}

/** 单条请求：成功取结果，失败取 null（存储层对外只报「成/不成」）。 */
function requestDone<T>(request: IDBRequest<T>): Promise<T | null> {
  return new Promise((resolve) => {
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => resolve(null);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<boolean> {
  return new Promise((resolve) => {
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => resolve(false);
    transaction.onabort = () => resolve(false);
  });
}

/* ------------------------------------------------------------------ */
/* 读写                                                                */
/* ------------------------------------------------------------------ */

/** 写入一条本机图片记录（同 key 覆盖）。返回是否落盘。 */
export async function putLocalImage(record: StoredLocalImage): Promise<boolean> {
  const db = await openDatabase();
  if (!db) return false;
  try {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const request = transaction.objectStore(STORE_NAME).put(record);
    const [written, committed] = await Promise.all([requestDone(request), transactionDone(transaction)]);
    return committed && written !== null;
  } catch {
    return false;
  } finally {
    db.close();
  }
}

/** 按 key 读一条记录；不存在或数据坏掉返回 null。 */
export async function getLocalImage(key: string): Promise<StoredLocalImage | null> {
  const db = await openDatabase();
  if (!db) return null;
  try {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const value = await requestDone<unknown>(transaction.objectStore(STORE_NAME).get(key));
    if (!value || typeof value !== 'object') return null;
    const record = value as Partial<StoredLocalImage>;
    if (typeof record.key !== 'string' || !(record.blob instanceof Blob)) return null;
    return {
      key: record.key,
      name: typeof record.name === 'string' ? record.name : '',
      caption: typeof record.caption === 'string' ? record.caption : '',
      blob: record.blob,
      savedAt: typeof record.savedAt === 'number' ? record.savedAt : 0,
    };
  } catch {
    return null;
  } finally {
    db.close();
  }
}

/** 删除一条记录（不存在也算成功）。 */
export async function deleteLocalImage(key: string): Promise<boolean> {
  const db = await openDatabase();
  if (!db) return false;
  try {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const request = transaction.objectStore(STORE_NAME).delete(key);
    const [deleted, committed] = await Promise.all([requestDone(request), transactionDone(transaction)]);
    return committed || deleted !== null;
  } catch {
    return false;
  } finally {
    db.close();
  }
}

/** 改写一条已有记录的说明；记录不存在则什么都不做。 */
export async function updateLocalImageCaption(key: string, caption: string): Promise<void> {
  const existing = await getLocalImage(key);
  if (!existing) return;
  await putLocalImage({ ...existing, caption });
}

/* ------------------------------------------------------------------ */
/* 内容地址                                                            */
/* ------------------------------------------------------------------ */

function toHex(bytes: Uint8Array): string {
  let output = '';
  for (const byte of bytes) output += byte.toString(16).padStart(2, '0');
  return output;
}

function fnv1a(bytes: Uint8Array): string {
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * 文件内容地址：同一份字节永远得到同一个串。
 * 优先 SHA-256（截 128 bit 足够避免碰撞）；没有 SubtleCrypto 时用 FNV-1a + 字节长度，
 * 强度弱但对「同一张图 → 同一个键」这个用途够用。
 */
export async function contentHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const subtle = typeof crypto !== 'undefined' ? crypto.subtle : undefined;
  if (subtle && typeof subtle.digest === 'function') {
    try {
      const digest = await subtle.digest('SHA-256', buffer);
      return toHex(new Uint8Array(digest)).slice(0, 32);
    } catch {
      /* 落到 FNV 分支 */
    }
  }
  return `${fnv1a(bytes)}-${bytes.length.toString(16)}`;
}

/* ------------------------------------------------------------------ */
/* objectURL 生命周期                                                  */
/* ------------------------------------------------------------------ */

/** 生成供 `<img src>` 使用的 objectURL；环境不支持时返回空串。 */
export function createObjectUrl(blob: Blob): string {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return '';
  try {
    return URL.createObjectURL(blob);
  } catch {
    return '';
  }
}

/** 释放 objectURL（只放 blob: 开头且确实存在的串）。 */
export function releaseObjectUrl(url: string | null): void {
  if (!url || !url.startsWith('blob:')) return;
  if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    /* 已经释放过：忽略 */
  }
}
