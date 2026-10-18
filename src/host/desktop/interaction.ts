/**
 * 桌面层的交互参数。
 *
 * 这些是手势/交互阈值，不属于视觉动效，所以不套 motionTokens；
 * 数值来源都写在注释里，不拍脑袋。
 */

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
 * 编辑模式卡片缩放（DESIGN.md §2「卡片轻微缩放」）。
 * 编辑 chrome 的触控目标要按这个缩放反算，保证屏幕上实际命中区仍 ≥40×40（AUDIT V-06）。
 */
export const EDIT_CARD_SCALE = 0.97;

/** 触控目标基准：DESIGN.md §1.2 规定不小于 40×40 CSS px */
export const TOUCH_TARGET_SIZE = 40;

/** 编辑模式下按钮的布局尺寸（反算缩放后屏幕实测仍 ≥40） */
export const EDIT_TOUCH_TARGET = Math.ceil(TOUCH_TARGET_SIZE / EDIT_CARD_SCALE);
