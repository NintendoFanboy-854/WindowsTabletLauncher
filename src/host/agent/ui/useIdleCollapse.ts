/**
 * 空闲自动收回：面板（voice / chat）在「无操作 N 秒」后回到右下角收起态。
 *
 * 契约（仅此一份计时逻辑，调用方不写计时器）：
 * - **只有一个计时器**：每次活动都 `clearTimeout` 后按完整时长重新计时；
 * - `paused` 为真时不计时（录音 / 转写 / 生成 + 回声 / 授权卡 / 弹层 / 输入焦点 / 指针按下）；
 * - `active` 为假（已收起、或没有入口按钮的嵌入式实例）时彻底停表；
 * - `seconds <= 0` = 用户关掉了这个行为，永不计时；
 * - 卸载时清掉计时器（绝不留一个会对已卸载组件回调的定时器）。
 *
 * 纯 hook：不读 storage、不碰 DOM、不订阅事件 —— 活动源由调用方喂 `reset()`，
 * 这样「什么算活动」留在界面层（它才知道面板边界），「多久收回」留在这一处。
 *
 * 不做「越用越久」的自适应，也不做随机抖动（规格明确排除）。
 */

import { useCallback, useEffect, useRef } from 'react';

/** 秒 → 毫秒换算：档位只写秒，毫秒只在这一处出现 */
export const MS_PER_SECOND = 1000;

/**
 * 生成结束后的「回声期」：流式从 streaming/tools 回到 idle 之后再多等这么久才开始计时，
 * 避免回答刚写完、用户还在读就被收走。
 */
export const STREAM_END_ECHO_SECONDS = 3;

/** 回声期（毫秒），供调用方的 setTimeout 使用 */
export const STREAM_END_ECHO_MS = STREAM_END_ECHO_SECONDS * MS_PER_SECOND;

/**
 * `pointermove` 的位移阈值（逻辑 px）：超过它才算「真的在动」。
 *
 * 手指/鼠标在面板上按住时的细微抖动不会重置计时，否则轻轻一碰就能让面板永不收回。
 * 这是手势阈值，不是布局间距，因此不走 spacing ramp。
 */
export const IDLE_POINTER_MOVE_THRESHOLD = 8;

export interface UseIdleCollapseOptions {
  /** 面板处于 expanded 形态、并且这次收回有地方可退（收起态 orb 存在）时才为真 */
  active: boolean;
  /** 空闲时长（秒），`0` = 关闭 */
  seconds: number;
  /** 不计时（录音 / 生成 / 弹层 / 输入焦点 / 指针按下等） */
  paused: boolean;
  /** 到点要执行的动作：由调用方实现「静默收回」（不弹提示、不播音、不改会话状态） */
  onCollapse: () => void;
}

export interface IdleCollapseControls {
  /** 重新计时（任一活动发生时调用） */
  reset: () => void;
}

export function useIdleCollapse({
  active,
  seconds,
  paused,
  onCollapse,
}: UseIdleCollapseOptions): IdleCollapseControls {
  // 回调放 ref：父组件每次渲染换一个箭头函数时不该重置计时（那会让面板永不收回）
  const onCollapseRef = useRef(onCollapse);
  onCollapseRef.current = onCollapse;

  const timerRef = useRef<number | null>(null);
  /** 是否该走计时：三条件全部满足才开表 */
  const armed = active && !paused && seconds > 0;

  const stop = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  /** 唯一的计时入口：先清旧表，再按完整时长重开 */
  const reset = useCallback(() => {
    stop();
    if (!armed) return;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onCollapseRef.current();
    }, seconds * MS_PER_SECOND);
  }, [armed, seconds, stop]);

  // active / seconds / paused 任一变化都重开表（暂停期间不计时，恢复后从头计时）
  useEffect(() => {
    reset();
    return stop;
  }, [reset, stop]);

  return { reset };
}
