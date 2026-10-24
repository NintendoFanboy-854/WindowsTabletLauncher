/**
 * 宿主侧设计常量（唯一的数值出口）。
 *
 * 这些值不是 Fluent 设计 token，但都由 Fluent 的公开值推导；宿主页面与浮层只引用
 * 这里的常量，调用点不写字面量（DENSITY §2.1-6「共享原语的常量是唯一出口」）。
 */

/**
 * 触控目标 44×44（逻辑 px）。
 *
 * 出处：Fluent `layout.md:57` 的 iOS & Web 最小触控 44×44；同时满足 HIG §6 的 44。
 * 与 `public/plugins/_shared/ui.jsx` 的 `TOUCH_TARGET` 同值、同口径。
 */
export const TOUCH_TARGET = 44;

/** CSS 侧直接可用的字符串形式（宿主 Griffel 样式统一引用它，避免调用点拼 px） */
export const TOUCH_TARGET_CSS = `${TOUCH_TARGET}px`;

/**
 * 空态主图标大档 40。
 *
 * 图标阶梯 16 / 20 / 24 / 32 / 48 之外，空态主图标单独补 40（Fluent 图标交付档与
 * 40 逻辑 px 视觉重量的折中；voice 空态圆内图标即此档）。与
 * `public/plugins/_shared/ui.jsx` 的 `EMPTY_STATE_ICON_SIZE_LARGE` 同值。
 */
export const EMPTY_STATE_ICON_SIZE_LARGE = 40;
