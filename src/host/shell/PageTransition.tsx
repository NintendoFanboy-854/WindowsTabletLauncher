/**
 * 页面切换动效：Fluent 的 createMotionComponent + motionTokens，
 * 不写自定义 easing / 时长（DESIGN.md §7）。
 */
import { createMotionComponent, motionTokens } from '@fluentui/react-components';

/** 进入页面：淡入 + 轻微上移，曲线和时长全部来自 motionTokens */
export const PageTransition = createMotionComponent({
  keyframes: [
    { opacity: 0, transform: 'translateY(6px)' },
    { opacity: 1, transform: 'translateY(0px)' },
  ],
  duration: motionTokens.durationNormal,
  easing: motionTokens.curveDecelerateMid,
  fill: 'both',
});
