/**
 * 插件共享动效（MOTION §6 / §7）。
 *
 * 所有插件内部过渡都从这里取，不在插件里写毫秒数、cubic-bezier 或 `ease-in-out`。
 * 内部只使用 Fluent `motionTokens` + `createPresenceComponent` / `PresenceGroup`；
 * `prefers-reduced-motion: reduce` 时每个组件都带 reducedMotion 变体（只做 ≤100ms 透明度，
 * 或直接切换），不出现位移/缩放。
 *
 * 常用：
 *   <FadeSlide visible={show} unmountOnExit><div>...</div></FadeSlide>
 *   <Collapse visible={open}><div>...</div></Collapse>
 *   <CrossFade value={tab}><TabContent /></CrossFade>
 *   <SlidePage visible={open} appear direction="forward"><Page /></SlidePage>
 *   const style = useMotionTransition('normal');
 *
 * 语义说明：
 * - FadeSlide.direction 表示“内容移动方向”：'up'（默认，从下方 8px 上移归位）、
 *   'down'、'left'、'right' 同理；退出只淡出，不做位移。
 * - SlidePage.direction：'forward' 从右侧进、向左退；'back' 从左侧进、向右退。
 *   L2 子页 push 用 forward 进入，返回/取消时切到 back，退出即为向右 pop。
 */

import { createElement, useEffect, useMemo, useState } from 'react';
import {
  createPresenceComponent,
  motionTokens,
  PresenceGroup,
} from '@fluentui/react-components';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** FadeSlide 位移距离（MOTION §6：列表项淡入 + 上移 8px） */
const FADE_SLIDE_DISTANCE = '8px';
/** CrossFade 位移距离（MOTION §6：Tab 内容上移 4px） */
const CROSS_FADE_DISTANCE = '4px';
/** L2 push/pop 横向位移（MOTION §4.1） */
const PAGE_SLIDE_DISTANCE = '48px';

function reducedMotionQuery() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(REDUCED_MOTION_QUERY);
}

/**
 * 订阅系统“减少动效”设置；组件需要根据它改变布局/位移时用它。
 * presence 组件自身的 reducedMotion 变体由 Fluent 的 `useIsReducedMotion` 处理，
 * 这个 hook 用于非 WAAPI 的内联样式（如 transitionStyle）。
 *
 * @returns {boolean} true 表示用户要求减少动效
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => Boolean(reducedMotionQuery()?.matches));

  useEffect(() => {
    const media = reducedMotionQuery();
    if (!media) return undefined;
    const update = () => setReduced(media.matches);
    update();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    // 老 Edge / Safari 兜底
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return reduced;
}

/** 方向 → 初始 translate（内容从该方向偏移 distance 进入，再归位） */
function offsetForDirection(direction, distance) {
  switch (direction) {
    case 'down':
      return `0px -${distance}`;
    case 'left':
      return `${distance} 0px`;
    case 'right':
      return `-${distance} 0px`;
    case 'up':
    default:
      return `0px ${distance}`;
  }
}

/**
 * 构造一个“淡入 + 指定距离位移”的 presence motion。
 * enter 200ms 减速；exit 默认 100ms 加速（列表项删除），CrossFade 传 150ms。
 */
function fadeSlidePresence(
  distance,
  exitDuration = motionTokens.durationFaster,
  exitEasing = motionTokens.curveAccelerateMin,
) {
  return ({ direction = 'up' }) => {
    const offset = offsetForDirection(direction, distance);
    return {
      enter: {
        keyframes: [
          { opacity: 0, translate: offset },
          { opacity: 1, translate: '0px 0px' },
        ],
        duration: motionTokens.durationNormal,
        easing: motionTokens.curveDecelerateMid,
        fill: 'both',
        reducedMotion: {
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
          duration: motionTokens.durationFaster,
          easing: motionTokens.curveDecelerateMid,
        },
      },
      exit: {
        keyframes: [
          { opacity: 1, translate: '0px 0px' },
          { opacity: 0, translate: '0px 0px' },
        ],
        duration: exitDuration,
        easing: exitEasing,
        fill: 'both',
        reducedMotion: {
          keyframes: [{ opacity: 1 }, { opacity: 0 }],
          duration: motionTokens.durationFaster,
          easing: motionTokens.curveAccelerateMid,
        },
      },
    };
  };
}

/**
 * 通用淡入 + 8px 位移的 presence 组件。
 *
 * 用法：
 *   <FadeSlide visible={items.length > 0} unmountOnExit direction="up">
 *     <div>...</div>
 *   </FadeSlide>
 *
 * 列表项新增不要逐项 stagger；删除用 exit 的 100ms 淡出即可。
 */
export const FadeSlide = createPresenceComponent(fadeSlidePresence(FADE_SLIDE_DISTANCE));

/** Tab 内容更小的位移版本（4px），无需直接使用，交给 CrossFade。 */
const CrossFadeItem = createPresenceComponent(
  fadeSlidePresence(
    CROSS_FADE_DISTANCE,
    motionTokens.durationFast,
    motionTokens.curveAccelerateMid,
  ),
);

/**
 * 内联展开/折叠：高度 + 透明度。
 *
 * 用法：
 *   <Collapse visible={expanded}>
 *     <div>展开内容</div>
 *   </Collapse>
 *
 * enter 200ms 减速，exit 150ms 加速；reduced-motion 下只做 100ms 透明度，
 * 不跑高度动画。内容必须在正常布局流里（不要 position:absolute）。
 */
export const Collapse = createPresenceComponent(({ element }) => {
  const openHeight = `${element.scrollHeight}px`;
  return {
    enter: {
      keyframes: [
        { maxHeight: '0px', opacity: 0, overflow: 'hidden' },
        { maxHeight: openHeight, opacity: 1, overflow: 'hidden', offset: 0.9999 },
        { maxHeight: 'unset', opacity: 1, overflow: 'unset' },
      ],
      duration: motionTokens.durationNormal,
      easing: motionTokens.curveDecelerateMid,
      fill: 'both',
      reducedMotion: {
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
        duration: motionTokens.durationFaster,
        easing: motionTokens.curveDecelerateMid,
      },
    },
    exit: {
      keyframes: [
        { maxHeight: openHeight, opacity: 1, overflow: 'hidden' },
        { maxHeight: '0px', opacity: 0, overflow: 'hidden' },
      ],
      duration: motionTokens.durationFast,
      easing: motionTokens.curveAccelerateMid,
      fill: 'both',
      reducedMotion: {
        keyframes: [{ opacity: 1 }, { opacity: 0 }],
        duration: motionTokens.durationFaster,
        easing: motionTokens.curveAccelerateMid,
      },
    },
  };
});

/**
 * Tab 内容 / 平级视图切换：旧内容淡出 150ms，新内容淡入并上移 4px（200ms）。
 * 新旧内容在同一个 grid 单元里短暂重叠，不会把容器高度瞬间弹掉。
 *
 * 用法（value 变化时切换，孩子用普通条件渲染即可）：
 *   <CrossFade value={tab}>{tab === 'hourly' ? <Hourly /> : <Daily />}</CrossFade>
 *
 * @param {object} props
 * @param {string|number} props.value 当前内容标识，变化时触发交叉淡化
 * @param {'up'|'down'|'left'|'right'} [props.direction='up'] 新内容进入方向
 */
export function CrossFade({ value, direction = 'up', children, className, style }) {
  const key = value === undefined || value === null ? 'default' : String(value);
  return createElement(
    'div',
    {
      className,
      style: { display: 'grid', minWidth: 0, ...style },
      'data-cross-fade': key,
    },
    createElement(
      PresenceGroup,
      null,
      createElement(
        CrossFadeItem,
        { key, direction },
        createElement('div', { style: { gridArea: '1 / 1', minWidth: 0 } }, children),
      ),
    ),
  );
}

/**
 * L2 子页 push / pop 的页面过渡。
 *
 * - direction="forward"（默认）：从右 48px 进入 250ms 减速；退出向左 200ms 加速。
 * - direction="back"：从左进入；退出向右（pop 回上一级）。
 * - reduced-motion：只做 100ms 透明度，无横向位移。
 *
 * 一般不用直接写，`Subpage` 已封装；需要自绘 L2 时再用。
 */
export const SlidePage = createPresenceComponent(({ direction = 'forward' }) => {
  const isBack = direction === 'back';
  const enterOffset = isBack ? `-${PAGE_SLIDE_DISTANCE} 0px` : `${PAGE_SLIDE_DISTANCE} 0px`;
  const exitOffset = isBack ? `${PAGE_SLIDE_DISTANCE} 0px` : `-${PAGE_SLIDE_DISTANCE} 0px`;
  return {
    enter: {
      keyframes: [
        { opacity: 0, translate: enterOffset },
        { opacity: 1, translate: '0px 0px' },
      ],
      duration: motionTokens.durationGentle,
      easing: motionTokens.curveDecelerateMid,
      fill: 'both',
      reducedMotion: {
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
        duration: motionTokens.durationFaster,
        easing: motionTokens.curveDecelerateMid,
      },
    },
    exit: {
      keyframes: [
        { opacity: 1, translate: '0px 0px' },
        { opacity: 0, translate: exitOffset },
      ],
      duration: motionTokens.durationNormal,
      easing: motionTokens.curveAccelerateMid,
      fill: 'both',
      reducedMotion: {
        keyframes: [{ opacity: 1 }, { opacity: 0 }],
        duration: motionTokens.durationFaster,
        easing: motionTokens.curveAccelerateMid,
      },
    },
  };
});

/**
 * 需要内联 transition 的地方（行文字透明度、进度环 stroke 等）从这里取时长/曲线。
 * 只允许这些 kind；传入未知值按 'normal' 处理。
 *
 * @param {'press'|'hoverEnter'|'hoverLeave'|'exit'|'normal'|'gentle'|'slow'|'longPress'} [kind='normal']
 * @returns {{ transitionDuration: string, transitionTimingFunction: string }}
 */
const TRANSITION_TOKENS = {
  press: ['durationUltraFast', 'curveAccelerateMin'],
  hoverEnter: ['durationFaster', 'curveDecelerateMin'],
  hoverLeave: ['durationFaster', 'curveAccelerateMin'],
  exit: ['durationFast', 'curveAccelerateMid'],
  normal: ['durationNormal', 'curveDecelerateMid'],
  gentle: ['durationGentle', 'curveDecelerateMid'],
  slow: ['durationSlow', 'curveDecelerateMid'],
  longPress: ['durationUltraSlow', 'curveLinear'],
};

export function transitionStyle(kind = 'normal') {
  const [durationToken, curveToken] = TRANSITION_TOKENS[kind] ?? TRANSITION_TOKENS.normal;
  return {
    transitionDuration: `${motionTokens[durationToken]}ms`,
    transitionTimingFunction: motionTokens[curveToken],
  };
}

/**
 * transitionStyle 的 hook 版本：reduced-motion 下统一 100ms 颜色/透明度过渡，
 * 不施加位移。用法：
 *   const motionStyle = useMotionTransition('normal');
 *   <span style={{ opacity: done ? 0.55 : 1, ...motionStyle }}>...</span>
 */
export function useMotionTransition(kind = 'normal') {
  const reduced = useReducedMotion();
  return useMemo(
    () =>
      reduced
        ? {
            transitionDuration: `${motionTokens.durationFaster}ms`,
            transitionTimingFunction: motionTokens.curveDecelerateMin,
          }
        : transitionStyle(kind),
    [kind, reduced],
  );
}
