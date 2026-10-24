/**
 * 兼容入口。
 *
 * 桌面层（`src/host/desktop/WallpaperLayer.tsx`）按 `agent/oneshot/describeWallpaper`
 * 导入 `useWallpaperNote`，而实现分在 `generate.ts`（调用与缓存策略）、
 * `cache.ts`（IndexedDB）、`useWallpaperNote.ts`（React 入口）三个文件里。
 * 这里只做转出，不再有第二份实现；`./index.ts` 是同一组导出的公共出口。
 */

export { describeWallpaper } from './generate';
export { cacheKeyFor, getCachedNote } from './cache';
export { useWallpaperNote } from './useWallpaperNote';
export type { NoteStatus, WallpaperNote, WallpaperNoteInput } from './types';
