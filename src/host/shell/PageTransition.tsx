/**
 * 页面切换动效（Fluent motion + motionTokens）。
 *
 * 注意：`createMotionComponent` 的工厂要求**单个真实 DOM 元素**作为 child
 * （它要把动画挂到该元素的 ref 上）。直接把页面组件（可能返回 Fragment / 自定义组件）
 * 塞进去会报 “Invalid child element”，动画也不生效。所以这里包一层稳定的
 * `<div>`，页面内容放进 div 里；App 用 `key={page}` 触发整棵子树重挂载，
 * 每次切换重放一次淡入。曲线/时长全部来自 motionTokens（DESIGN §7）。
 */
import type { ReactNode } from 'react';
import { createMotionComponent, makeStyles, motionTokens, tokens } from '@fluentui/react-components';

const PageMotion = createMotionComponent({
  keyframes: [
    { opacity: 0, transform: 'translateY(6px)' },
    { opacity: 1, transform: 'translateY(0px)' },
  ],
  duration: motionTokens.durationNormal,
  easing: motionTokens.curveDecelerateMid,
  // 动画结束后回到元素自然样式，避免残留 transform 形成 fixed 包含块
  fill: 'backwards',
});

const useStyles = makeStyles({
  // motion 工厂动画的单个 child 必须是 DOM 元素；同时撑满 host-root 给页面高度
  frame: {
    height: '100%',
    minHeight: 0,
    color: tokens.colorNeutralForeground1,
  },
});

export interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const styles = useStyles();
  return (
    <PageMotion>
      <div className={styles.frame}>{children}</div>
    </PageMotion>
  );
}
