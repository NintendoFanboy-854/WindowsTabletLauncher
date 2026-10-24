/**
 * 说明条（`desktop/WallpaperLayer` 的 `WallpaperCredit` pill）**实测高度**的单一通道。
 *
 * 为什么需要它：说明条高度由文字内容决定（`<Text size={200}>` 的行高 + 上下 padding +
 * 描边），而布局又必须用它才能算出「网格与说明条之间恰好一个 gutter、上净空 = 下净空、
 * chat 入口下缘与说明条下缘共线」。几何（`breakpoints.layoutFrame`）是纯函数、不碰 DOM，
 * 所以测量结果必须从 DOM 侧送进来：pill 自己 `ResizeObserver` 量 → `reportFooterPillHeight`
 * → 桌面层 / Agent 入口用 `useFooterPillHeight` 订阅 → 作为 `layoutFrame` 的第 4 个输入。
 *
 * 为什么是模块级 store 而不是 React context：三个消费者（`WallpaperCredit`、`Desktop`、
 * `AgentSurface` 经 `entryGeometry.useAgentSurfaceGeometry`）在组件树里没有共同的、可写的
 * 祖先（`App` 里前者与后两者是兄弟），而 `AgentSurface` 不在本次可改范围内。
 * 模块级 store + `useSyncExternalStore` 让三者共享同一个值，不改任何一处组件签名。
 *
 * 防抖 / 防回环（实测链路只有单向依赖）：
 * 1. **量化**：实测值四舍五入到整数 px 后才比较。ResizeObserver 会为亚像素变化反复回调，
 *    不量化就会以 0.3px 为节奏抖出无穷多次重排；取整也让网格留在整数坐标上（卡片边缘
 *    不会落在半像素上）。代价是真实高度的小数部分被忽略（≤0.5px，肉眼不可见）。
 * 2. **去重**：取整后与当前值相等就直接 return，不通知任何订阅者——同一高度不会触发 setState。
 * 3. **单向**：pill 只量**自己**（量的是它自己的 border-box），pill 的高度只由文字内容与
 *    自身 CSS 决定（`whiteSpace:nowrap` + 固定 padding + `maxWidth` 裁切，宽度变化不改高度）；
 *    布局变化（grid 下移、dock 上移）不会改变 pill 高度，因此不会形成「布局→测量→布局」的循环。
 * 4. **非法值**：0 / 负数 / NaN（容器未布局时的初值）直接丢弃，布局保持上一个有效值。
 *
 * 首帧策略：模块加载时值 = `FOOTER_PILL_ESTIMATE`（由 token 推算的 26，见 breakpoints.ts），
 * 所以第一帧就有一份可用的布局；pill 挂载后的第一次 ResizeObserver 回调给出实测值。
 * 估计值与实测值相等时（当前 CSS 下确实相等，都是 26）**不会发生任何重排**；
 * 若字体/缩放变了导致实测不同，则发生一次 1~2px 的收敛（网格整体上移或下移该差值的一半）。
 */
import { useSyncExternalStore } from 'react';

import { FOOTER_PILL_ESTIMATE } from './breakpoints';

/** 当前生效的说明条高度（整数 px）；首帧为 token 推算的估计值 */
let pillHeight = FOOTER_PILL_ESTIMATE;

const listeners = new Set<() => void>();

/** 读取当前值（不订阅）：供纯函数/工具函数与测试使用 */
export function readFooterPillHeight(): number {
  return pillHeight;
}

/**
 * 上报 pill 的实测高度（border-box，px）。取整 + 去重，重复/非法值不触发任何通知。
 *
 * 只有真的变了才会通知订阅者，因此在 ResizeObserver 回调里直接调用是安全的。
 */
export function reportFooterPillHeight(measured: number): void {
  if (!Number.isFinite(measured) || measured <= 0) return;
  const next = Math.round(measured);
  if (next === pillHeight) return;
  pillHeight = next;
  for (const listener of [...listeners]) listener();
}

/** 订阅高度变化（`useSyncExternalStore` 的 subscribe；返回退订函数） */
export function subscribeFooterPillHeight(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 复位到首帧估计值并通知：只在测试/报告脚本里用，产品代码不调用 */
export function resetFooterPillHeight(): void {
  if (pillHeight === FOOTER_PILL_ESTIMATE) return;
  pillHeight = FOOTER_PILL_ESTIMATE;
  for (const listener of [...listeners]) listener();
}

/**
 * 订阅说明条实测高度：任何需要 `layoutFrame(..., pillHeight)` 的组件都用它取 `H_p`。
 *
 * 服务端快照与客户端快照同值（首帧估计），本项目无 SSR，第三个参数只为满足 API 形状。
 */
export function useFooterPillHeight(): number {
  return useSyncExternalStore(
    subscribeFooterPillHeight,
    readFooterPillHeight,
    readFooterPillHeight,
  );
}
