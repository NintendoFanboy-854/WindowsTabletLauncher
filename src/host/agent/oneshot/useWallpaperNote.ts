/**
 * 「欣赏壁纸」说明卡的 React 入口。
 *
 * 只暴露 `{ text, status, refresh }`：没有输入框、没有消息列表、没有 TTS，
 * 也不参与 `useAgentSession` 的任何状态。组件卸载或图片换掉时 abort 等待，
 * 底层请求（若已发出）会跑完并写缓存，下次同图直接命中。
 *
 * `refresh()` 只给用户手动「重新生成」按钮调用：触发一次 `force` 取数
 * （跳过缓存成功命中与失败冷静期）。本文件不做自动刷新、自动重试或轮询。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { cacheKeyFor } from './cache';
import { describeWallpaper } from './generate';
import type { NoteStatus, WallpaperNoteInput } from './types';

interface NoteState {
  text: string | null;
  status: NoteStatus;
}

const IDLE: NoteState = { text: null, status: 'idle' };

/**
 * 缓存键是 effect 的主依赖：同一张图（内容地址 + 市场 + 提示词版本都不变）
 * 不会重复触发请求；图片换掉 → 键变 → 重新走一次 miss。
 */
export function useWallpaperNote(input: WallpaperNoteInput | null): {
  text: string | null;
  status: NoteStatus;
  refresh: () => void;
} {
  const cacheKey = input ? cacheKeyFor(input) : '';
  const [state, setState] = useState<NoteState>(IDLE);
  /** 手动刷新的触发计数：refresh() 加一让 effect 重跑一次 */
  const [refreshTick, setRefreshTick] = useState(0);
  /**
   * 下一次取数是否强制。放 ref 而不是 state：手动刷新只是一次性标志，
   * 不需要额外渲染；也不能在 effect 里消费掉——StrictMode 下 effect 会连跑两次，
   * 第二次只是加入第一次已发出的在途请求（`generate.ts` 的 `inFlight` 去重），
   * 不会重复请求、重复计费。
   */
  const forceRef = useRef(false);
  /** 上一次 effect 见到的缓存键：换图时清掉强制标志，旧图的手动刷新不能带到新图 */
  const trackedKeyRef = useRef(cacheKey);

  const refresh = useCallback((): void => {
    if (!cacheKey) return;
    forceRef.current = true;
    setRefreshTick((tick) => tick + 1);
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey || !input) {
      forceRef.current = false;
      trackedKeyRef.current = '';
      setState(IDLE);
      return;
    }
    if (trackedKeyRef.current !== cacheKey) {
      trackedKeyRef.current = cacheKey;
      forceRef.current = false;
    }
    const force = forceRef.current;

    const controller = new AbortController();
    let alive = true;
    setState({ text: null, status: 'loading' });

    void describeWallpaper(input, { signal: controller.signal, force }).then((note) => {
      if (!alive) return;
      setState(note ? { text: note.text, status: 'ready' } : { text: null, status: 'failed' });
    });

    return () => {
      alive = false;
      controller.abort();
    };
    // input 每帧都是新对象；只有缓存键和手动刷新计数变了才需要重新取（键即内容）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, refreshTick]);

  return { text: state.text, status: state.status, refresh };
}
