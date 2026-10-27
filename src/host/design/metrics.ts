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

/**
 * 桌面表面状态机缩放（项目 C 值，**不是 Fluent design token**）。
 *
 * 来源：`MOTION.md §2` 卡片状态机。Fluent 2 的 design tokens 只覆盖颜色 / 字体 /
 * 间距 / 圆角 / 描边 / 动效时长与曲线，没有交互缩放 token；Fluent UI v9 组件按下默认只改颜色。
 * 原卡片 hover `1.015` / pressed `0.985`，本轮统一为 hover `1.02` / pressed `0.98`
 * （用户拍板；1440×960 @200% DPI，不担心缩放发虚）。桌面 chrome（说明条 / 状态栏 /
 * 快速设置面板 / chat 入口）与 widget 卡片共用同一套数值，调用点不再写字面量。
 */
export const SURFACE_HOVER_SCALE = 1.02;
export const SURFACE_PRESS_SCALE = 0.98;
/** 长按 500ms 内的下沉档（沿用 MOTION §2 的 0.97，不参与 hover/press 统一） */
export const SURFACE_LONG_PRESS_SCALE = 0.97;
