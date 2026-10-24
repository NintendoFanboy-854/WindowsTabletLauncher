/**
 * 「欣赏壁纸」一次性说明卡的公共出口（`src/host/agent/oneshot/**`）。
 *
 * 接线方只需要：
 *   const { text, status } = useWallpaperNote(wallpaper ? {
 *     key: wallpaper.url, market: 'zh-CN', title, copyright, date,
 *   } : null);
 *
 * 这个模块不 import 会话层（`useAgentSession` / `storage.ts`），
 * 也不影响 `agent.conversations`；缓存只写独立库 `wtsl.wallpaper-note`。
 */

export type { NoteStatus, WallpaperNote, WallpaperNoteInput } from './types';

export { cacheKeyFor, getCachedNote, RETRY_AFTER_FAILURE_MS } from './cache';
export type { NoteRecord } from './cache';

export { describeWallpaper } from './generate';
export { useWallpaperNote } from './useWallpaperNote';

export { DEFAULT_MARKET, PROMPT_VERSION } from './prompt';
export { MAX_NOTE_CHARS } from './sanitize';
