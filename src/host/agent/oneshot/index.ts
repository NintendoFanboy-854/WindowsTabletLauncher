/**
 * 「欣赏壁纸」一次性说明卡的公共出口（`src/host/agent/oneshot/**`）。
 *
 * 接线方只需要：
 *   const { text, status, refresh } = useWallpaperNote(wallpaper ? {
 *     key: wallpaper.url, market: 'zh-CN', title, copyright, date, imageUrl,
 *   } : null);
 *
 * `refresh` 只接手动「重新生成」入口（force 重新请求）；不要自动调用。
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
