/**
 * 「欣赏壁纸」说明卡的 React 入口。
 *
 * 只暴露 `{ text, status }`：没有输入框、没有消息列表、没有 TTS，
 * 也不参与 `useAgentSession` 的任何状态。组件卸载或图片换掉时 abort 等待，
 * 底层请求（若已发出）会跑完并写缓存，下次同图直接命中。
 */

import { useEffect, useState } from 'react';
import { cacheKeyFor } from './cache';
import { describeWallpaper } from './generate';
import type { NoteStatus, WallpaperNoteInput } from './types';

interface NoteState {
  text: string | null;
  status: NoteStatus;
}

const IDLE: NoteState = { text: null, status: 'idle' };

/**
 * 缓存键是 effect 的唯一依赖：同一张图（内容地址 + 市场 + 提示词版本都不变）
 * 不会重复触发请求；图片换掉 → 键变 → 重新走一次 miss。
 */
export function useWallpaperNote(input: WallpaperNoteInput | null): {
  text: string | null;
  status: NoteStatus;
} {
  const cacheKey = input ? cacheKeyFor(input) : '';
  const [state, setState] = useState<NoteState>(IDLE);

  useEffect(() => {
    if (!cacheKey || !input) {
      setState(IDLE);
      return;
    }

    const controller = new AbortController();
    let alive = true;
    setState({ text: null, status: 'loading' });

    void describeWallpaper(input, { signal: controller.signal }).then((note) => {
      if (!alive) return;
      setState(note ? { text: note.text, status: 'ready' } : { text: null, status: 'failed' });
    });

    return () => {
      alive = false;
      controller.abort();
    };
    // input 每帧都是新对象；只有缓存键变了才需要重新取（键即内容）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return state;
}
