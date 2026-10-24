/**
 * 桌面层的交互参数。
 *
 * 这些是手势/交互阈值，不属于视觉动效，所以不套 motionTokens；
 * 数值来源都写在注释里，不拍脑袋。
 */

import { TOUCH_TARGET } from '../design/metrics';

/** 长按进编辑模式：DESIGN.md §2 规定 500ms */
export const LONG_PRESS_MS = 500;

/** 拖拽到左右边缘停住多久翻页：DESIGN.md §1.3 规定 0.6s */
export const EDGE_PAGE_TURN_MS = 600;

/** 手指抖动容差（px）：移动超过这个距离就不算长按 */
export const LONG_PRESS_MOVE_TOLERANCE = 8;

/** 拖拽启动距离（px）：编辑模式里按下后移动超过它才算拖拽，否则算点击选中 */
export const DRAG_START_DISTANCE = 6;

/**
 * 滑动切页阈值：按窗口宽度比例算，超过 10% 宽度松手翻页。
 * 用比例不用像素，窄屏/宽屏手感一致。
 */
export const PAGE_SWIPE_RATIO = 0.1;

/** 拖到首/尾页之外时的橡皮筋阻尼（0–1，越小越拖不动） */
export const SWIPE_RUBBER_BAND = 0.3;

/** 鼠标滚轮/触控板翻页的累计距离：一个单元格宽度算一次翻页，由布局引擎提供 cell */
export const WHEEL_PAGE_RATIO = 1;

/** 滚轮累计的冷却窗口：Fluent motionTokens.durationUltraSlow = 500ms */
export const WHEEL_RESET_MS = 500;

/** 拖动到屏幕边缘的触发带宽度 = 一个单元格（由布局引擎的 cell 决定，见 Desktop.tsx） */

/**
 * 编辑模式卡片缩放（MOTION §2「进入编辑模式 0.97 → 0.96」/ §3「卡片 1→0.96」）。
 * E2 早期取 0.97，E4 对齐规范改为 0.96。
 * 编辑 chrome 的触控目标要按这个缩放反算，保证屏幕上实际命中区仍 ≥44（D-05 / FLUENT2 §9）。
 */
export const EDIT_CARD_SCALE = 0.96;

/**
 * 编辑模式下 chrome 按钮的**布局尺寸**：把 44 的目标按 0.96 缩放反算成布局尺寸，
 * 屏幕上实测才不会低于 44（44 / 0.96 = 45.8 → 46）。
 *
 * 触控目标的唯一出口是 `design/metrics` 的 `TOUCH_TARGET`（44，DENSITY §1.1-6
 * 「共享原语的常量是唯一出口」）：这里 import 它，不再另立一个 40 的重复常量。
 */
export const EDIT_TOUCH_TARGET = Math.ceil(TOUCH_TARGET / EDIT_CARD_SCALE);
