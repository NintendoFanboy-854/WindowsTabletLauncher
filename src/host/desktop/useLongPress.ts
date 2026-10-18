/**
 * 长按手势 hook。
 *
 * DESIGN.md §2：长按 500ms 进编辑模式。指针移动超过容差、抬起、取消都会取消长按。
 * 抬起时没触发长按则算一次点击（onTap），用于“点空白聚焦卡片”。
 */
import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { LONG_PRESS_MOVE_TOLERANCE } from './interaction';

export interface LongPressOptions {
  delay: number;
  onLongPress: () => void;
  onTap?: () => void;
  moveTolerance?: number;
}

export interface LongPressHandlers {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
}

interface PressState {
  pointerId: number;
  startX: number;
  startY: number;
  timer: number;
  fired: boolean;
  moved: boolean;
}

export function useLongPress(options: LongPressOptions): LongPressHandlers {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const stateRef = useRef<PressState | null>(null);

  const clearTimer = useCallback(() => {
    const state = stateRef.current;
    if (state) window.clearTimeout(state.timer);
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (stateRef.current) return;
    const state: PressState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      timer: 0,
      fired: false,
      moved: false,
    };
    state.timer = window.setTimeout(() => {
      state.fired = true;
      optionsRef.current.onLongPress();
    }, optionsRef.current.delay);
    stateRef.current = state;
    // 捕获指针：长按触发后卡片的编辑浮层会盖住手势区，没有捕获就丢 pointerup
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // 某些合成事件没有活动指针，忽略
    }
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const state = stateRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const tolerance = optionsRef.current.moveTolerance ?? LONG_PRESS_MOVE_TOLERANCE;
    const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
    if (distance > tolerance) {
      state.moved = true;
      window.clearTimeout(state.timer);
    }
  }, []);

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const state = stateRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    stateRef.current = null;
    window.clearTimeout(state.timer);
    if (!state.fired && !state.moved) optionsRef.current.onTap?.();
  }, []);

  const onPointerCancel = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const state = stateRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    stateRef.current = null;
    window.clearTimeout(state.timer);
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
