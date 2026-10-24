/**
 * 输入形态（触控 / 笔 / 精确指针）与用户的「输入方式」覆盖设置。
 *
 * 判据只用**最近一次指针事件的 `pointerType`**——这是唯一能回答「此刻用的是什么」的信号
 * （`wtsl-touch-voice-design.md` §4.1）：
 * - `(pointer: coarse)` / `(hover: none)` 描述的是**主**指针设备：平板接了磁吸键盘后主指针变 fine，
 *   用户用手时它仍是 false，不能判当下；
 * - `(any-pointer: coarse)` / `maxTouchPoints` 只说明**存在**触控屏（T305CA 永远为真），
 *   对「此刻是手指还是鼠标」零信息，因此只作为 Pointer Events 不可用时的回退判据。
 * 用户在设置里显式选了 auto / touch / precise 时以设置为准（覆盖事件推断）。
 *
 * 设置存在独立键 `agent.inputMode`（不进 `agent.settings`）：它是输入设备偏好，
 * 与模型/语音/搜索这些 Agent 业务设置不同源；同页变化用 CustomEvent 广播。
 */

import { useSyncExternalStore } from 'react';

export type InputModeSetting = 'auto' | 'touch' | 'precise';

/** 一次手势实际采用的形态；`pen` 与 `precise` 走同一条「精确指针」路径（笔不享受更小命中区） */
export type InputModality = 'touch' | 'pen' | 'precise';

export const INPUT_MODE_STORAGE_KEY = 'agent.inputMode';
export const INPUT_MODE_EVENT = 'agent:input-mode-changed';

const INPUT_MODES: readonly InputModeSetting[] = ['auto', 'touch', 'precise'];

function isInputMode(value: unknown): value is InputModeSetting {
  return typeof value === 'string' && (INPUT_MODES as readonly string[]).includes(value);
}

function readStorage(): InputModeSetting {
  if (typeof localStorage === 'undefined') return 'auto';
  const raw = localStorage.getItem(INPUT_MODE_STORAGE_KEY);
  return isInputMode(raw) ? raw : 'auto';
}

let currentMode: InputModeSetting = readStorage();
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeInputMode(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== INPUT_MODE_STORAGE_KEY) return;
    currentMode = readStorage();
    emit();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function getInputMode(): InputModeSetting {
  return currentMode;
}

export function setInputMode(next: InputModeSetting): void {
  currentMode = next;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(INPUT_MODE_STORAGE_KEY, next);
  }
  window.dispatchEvent(new CustomEvent(INPUT_MODE_EVENT));
  emit();
}

/** 组件侧订阅（含同页与跨窗口变化） */
export function useInputMode(): InputModeSetting {
  return useSyncExternalStore(subscribeInputMode, getInputMode, getInputMode);
}

/** 当前运行时是否支持 Pointer Events（WebView2 / 现代 Chromium 恒为 true） */
export function pointerEventsSupported(): boolean {
  return typeof window !== 'undefined' && 'PointerEvent' in window;
}

/**
 * Pointer Events 不可用时的回退：设备**有没有**触控屏（`any-pointer: coarse` 优先，
 * 再看 `maxTouchPoints`）。只在这条降级路径上使用能力信号，不用它判断日常形态。
 */
function coarsePointerFallback(): InputModality {
  if (typeof window === 'undefined') return 'precise';
  if (typeof window.matchMedia === 'function' && window.matchMedia('(any-pointer: coarse)').matches) {
    return 'touch';
  }
  return (navigator.maxTouchPoints ?? 0) > 0 ? 'touch' : 'precise';
}

/**
 * 解析一次交互的形态。
 *
 * @param setting 用户设置（auto / touch / precise）
 * @param pointerType 最近一次 pointer 事件的 `pointerType`；没有事件时为 `undefined`
 */
export function resolveModality(
  setting: InputModeSetting,
  pointerType?: string,
): InputModality {
  if (setting === 'touch') return 'touch';
  if (setting === 'precise') return 'precise';
  if (pointerType === 'touch') return 'touch';
  if (pointerType === 'pen') return 'pen';
  if (pointerType === 'mouse') return 'precise';
  if (!pointerEventsSupported()) return coarsePointerFallback();
  // 没有 pointerType 且 Pointer Events 可用：键盘/程序化触发，按精确指针处理
  return 'precise';
}

/** 触控/笔是否走「混合手势」（点按锁定 / 按住说话），鼠标保持旧的点按即展开手感 */
export function usesHybridGesture(modality: InputModality): boolean {
  return modality === 'touch' || modality === 'pen';
}

export const INPUT_MODE_OPTIONS: readonly {
  value: InputModeSetting;
  label: string;
  hint: string;
}[] = [
  {
    value: 'auto',
    label: '自动',
    hint: '按最近一次操作的设备判断：手指走触控手势，鼠标保持原来的点按',
  },
  {
    value: 'touch',
    label: '触控优先',
    hint: '一律按触控处理：点一下锁定录音，再点一下结束',
  },
  {
    value: 'precise',
    label: '鼠标优先',
    hint: '一律按鼠标处理：点按先展开语音窗再录音',
  },
];
