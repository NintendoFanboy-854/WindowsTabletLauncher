# 动效规范（v1，2026-10-19）

> 适用范围：宿主卡片、编辑模式、页面切换、详情/设置浮层，以及六个插件内部的过渡。
> 原则：动效只服务**因果与空间连续性**，不是装饰；频繁交互不叠加动画；所有时长/曲线只能来自
> Fluent `motionTokens`；尊重 `prefers-reduced-motion`。
> 依据：[FLUENT2.md](FLUENT2.md) §8、[DESIGN.md](DESIGN.md) §7、[APPLE-HIG.md](reference/APPLE-HIG.md) §9、
> [PLUGIN-CONTRACT.md](PLUGIN-CONTRACT.md)。交互语义以契约与组件文档为准，本文只定义“怎么动”。

## 0. 输入前提（触控优先）

- **触控**：无 hover；按下 = 唯一物理反馈；长按 500ms = 编辑模式。
- **鼠标/笔**：有 hover；左键点击同轻点；长按同样生效（行为统一，不按设备分叉）。
- 卡片上的交互控件（按钮/勾选/输入）由插件处理，宿主不为它们做卡片级缩放；
  只有“卡片主体”参与下面的卡片状态机。

## 1. token 表（只用这些值）

| 用途 | 时长 token | 值 | 曲线 |
|---|---|---|---|
| 按下 | `durationUltraFast` | 50ms | `curveAccelerateMin` |
| 悬停进入 | `durationFaster` | 100ms | `curveDecelerateMin` |
| 悬停离开 / 微退场 | `durationFaster` | 100ms | `curveAccelerateMin` |
| 退出类（浮层收回、chrome 淡出） | `durationFast` | 150ms | `curveAccelerateMid` |
| 常规进出（编辑模式、Tab 内容） | `durationNormal` | 200ms | `curveDecelerateMid` |
| 浮层展开 / 大块进场 | `durationGentle` | 250ms | `curveDecelerateMid` |
| 翻页落位 | `durationSlow` | 300ms | `curveDecelerateMid` |
| 长按进度 | `durationUltraSlow` | 500ms | `curveLinear` |

禁止：自定义毫秒数、自定义 cubic-bezier、弹簧/回弹超调、`ease-in-out` 字面量。

## 2. 卡片状态机（宿主统一驱动）

```
rest ──hover(鼠标/笔)──▶ hover ──pointerdown──▶ pressed ──hold 500ms──▶ longpress ──▶ 编辑模式
  ▲                        │                      │                                    │
  └──hover leave───────────┘                      └──up / cancel / 移动超 8px──▶ 回弹
```

| 状态 | transform | 阴影/描边 | 过渡 |
|---|---|---|---|
| rest | scale(1) | `shadow4` + 材质 token | — |
| hover | scale(1.015) | `shadow8` + 1px `colorNeutralStroke1` | 100ms `curveDecelerateMin` |
| hover 离开 | scale(1) | 回 rest | 100ms `curveAccelerateMin` |
| pressed | scale(0.985) | `shadow4`，描边保持 | 50ms `curveAccelerateMin` |
| longpress（500ms 内） | scale(0.985 → 0.97) 线性下沉 | 描边渐显到 `colorBrandStroke1`（透明度 0→0.35） | 500ms `curveLinear` |
| 松手未触发 | 回 hover/rest | 回原样 | 150ms `curveDecelerateMid` |
| 进入编辑模式 | 0.97 → 0.96 | `shadow8`、chrome 淡入 | 200ms `curveDecelerateMid` |

- 放大上限 **1.5%**：164px 卡片每侧约 1.2px，在 12–16px gap 内不会挤到邻居；同时用描边/阴影补充“抬起”感，不靠单一缩放。
- 长按进度用**卡片逐渐下沉**表达，不加进度环；到 500ms 才切编辑模式，期间任何移动/松手都可中断。
- 只对卡片主体生效；SDK 转发 pointer 时过滤掉 `button/input/[role=button]` 等交互目标。
- 编辑模式中卡片不参与 hover/press；由编辑覆盖层接管。

## 3. 编辑模式

- 进入：卡片 1→0.96（200ms 减速）；编辑 chrome（标题/按钮/顶部遮罩）opacity 0→1、translateY -4→0（200ms 减速）；桌面衬底轻微压暗 200ms。
- 退出：卡片 0.96→1（150ms 加速）；chrome 淡出（150ms 加速）；可随时中断，不阻塞操作。
- 拖拽：拖起卡片 opacity→0.25（150ms 加速）；跟手移动零过渡；落位吸附 200ms 减速。
- 改尺寸：width/height 200ms 减速；不缩放内容、不做整体缩放。
- 翻页：拖动跟手零过渡；松手落位 300ms 减速；越界橡皮筋线性跟手；页码点 100ms 切换。

## 4. 详情 / 设置浮层：完整 container transform（所有卡片尺寸）

**决定的方案**：从被点卡片的矩形**变形展开**到浮层矩形，关闭反向收回同一卡片；1×1 到 4×2 全部启用。

1×1 卡片直接变形会让内容文字从很小放大、观感廉价，解决办法是**内容交叉淡入**，不是限制尺寸：

- 打开
  1. 记录来源卡片 `[data-widget-card]` 的 rect（宿主在请求浮层时已知 widget 实例）；
  2. 浮层 surface 先固定在卡片 rect（位置/宽高/圆角/阴影都来自卡片），内容 opacity 0、scrim opacity 0；
  3. surface 用 `durationGentle` + `curveDecelerateMid` 过渡到目标 rect（居中 880×680 / 1024 下 880×553）；
  4. 到约 60% 时内容 opacity 0→1（`durationFast` 减速），scrim 同步淡入（`durationNormal` 减速）；
  5. 动画只动 surface 的位置/尺寸/透明度，内容不参与缩放。
- 关闭
  1. 内容 opacity 1→0（100ms 加速）；
  2. surface 从目标 rect 收回卡片 rect（150ms `curveAccelerateMid`）；
  3. scrim 150ms 加速淡出；
  4. 关闭后焦点回到原卡片。
- 兜底：卡片已删除/不在当前页/窗口尺寸变化导致 rect 无效时，退化为“居中 scale 0.96→1 + 淡入”（200ms/150ms）。
- 遮罩：点击 scrim = 关闭，与 X / Esc 同义；scrim 可点击区域始终覆盖全屏。
- 圆角/阴影：随 rect 一起过渡（圆角从卡片半径到浮层半径；阴影从 `shadow4` 到浮层阴影），不使用布局外元素。
- 性能：只对一个 surface 做位置/尺寸过渡；内容延迟淡入避免每帧重排；如低端设备掉帧，降级为 scale 0.96→1 + 淡入。

## 5. 页面切换

- 桌面 ↔ 设置/复盘/插件：新页面 200ms 减速淡入 + 6px 上移（现有）；旧页面直接替换（不等待退出动画）。
- 桌面层常驻：切回桌面用 `replayKey` 重放 200ms 淡入，不重挂 iframe。
- 设置页内插件分区切换：内容 150ms 淡入 + 4px 上移，不横向滑动。
- Agent 面板 / Toast / 强提醒 / Drawer：完全使用 Fluent 组件默认过渡，不覆写。

## 6. 插件内部动效（全部按 Fluent motion）

插件通过共享 `_shared/motion.js` 使用统一封装（内部只用 `motionTokens` 与 `createPresenceComponent`），
不允许各插件自写时长/曲线。推荐模式：

| 场景 | 做法 | 时长 |
|---|---|---|
| 详情内 Tab 内容切换（天气/待办） | 旧内容淡出 + 新内容淡入并上移 4px（方向不反转） | 200ms 进 / 150ms 出 |
| 列表项新增（任务、倒数日、城市、世界时钟、标签、子任务） | 单项淡入 + 上移 8px；不逐项 stagger | 200ms 减速 |
| 列表项删除 | 单项淡出 100ms 后移除；不做高度动画 | 100ms 加速 |
| 内联展开/折叠（快速添加、搜索城市、添加标签、子任务输入） | 高度 + 透明度展开/收起 | 200ms 减速 / 150ms 加速 |
| 勾选完成/取消 | Fluent Checkbox 默认 + 行文字 opacity 1→0.55 | 150ms 减速 |
| 数字/进度更新（番茄剩余、进度条、AQI 环） | 数字不做滚动/翻牌；进度条用 Fluent 默认；自绘环的 stroke 过渡 | 200ms `curveEasyEase` |
| 视图切换（待办五视图、全部任务、日历翻月） | 内容淡出+淡入 8px，方向随导航；Tab 指示条用 Fluent 默认 | 200ms 进 / 150ms 出 |
| 阶段切换（番茄） | 阶段文字颜色/透明度切换，不做整卡动画 | 150ms |
| 空态 ↔ 有内容 | 交叉淡入淡出 | 200ms / 150ms |
| 加载 / 骨架 | Fluent Skeleton / Spinner 默认 | — |
| 保存/关闭浮层 | 由宿主负责，插件内容不要先自行做退场 | — |

明确不做：stagger 逐项入场、数字滚动、打字机、粒子/爆炸、循环呼吸、视差、回弹超调。

## 7. 减少动效（`prefers-reduced-motion: reduce`）

宿主与插件都必须响应（共享 `_shared/useReducedMotion`）：

| 原效果 | 减弱后 |
|---|---|
| hover 放大、按下缩放 | 不做 transform，只保留 100ms 颜色/描边变化 |
| 长按下沉 | 不做缩放，按下后显示静态描边 |
| 编辑模式卡片缩放 | 不缩放，直接切换 chrome |
| 浮层 container transform | 只保留 100ms 淡入淡出，不位移/不缩放 |
| 页面/列表/Tab 动效 | 直接切换或 ≤100ms 淡入 |
| 翻页跟手 | 保留（直接操纵） |
| 进度环/进度条 | 保留 Fluent 默认（属于状态指示，不视为装饰） |

## 8. 实现约束

- 宿主：
  - 卡片状态用 `data-hover` / `data-pressed` / `data-longpress` + CSS transition（值全部取 `motionTokens`）；
  - 长按计时器只在宿主跑一份；SDK 以 rAF 节流转发 pointer 事件（过滤交互控件），到点进编辑模式并通知插件吞掉 click；
  - container transform 由浮层组件计算 start/end rect、用 CSS transition 驱动 surface（位置/宽高/透明度），内容交叉淡入；锚点无效时走兜底。
- 插件：
  - `public/plugins/_shared/motion.js` 提供 `FadeSlide` / `Collapse` / `CrossFade` / `useReducedMotion`，内部只用 `motionTokens` + `createPresenceComponent`；
  - 插件不得写出毫秒字面量/自定义曲线；交互密集处（每次点击）不额外加动画。
- 禁止：动画阻塞操作（动画中仍可点击/关闭）；为动画延迟内容渲染；用动画掩盖加载。

## 9. 验收

1. `grep` 检查：宿主与插件 `src` 中无非 token 的 duration/easing/ms 字面量（`_shared` 除外）。
2. 卡片：hover 1.015、press 0.985、长按 500ms 过程中 scale 从 0.985 线性到 0.97、到点进编辑；松手回弹。
3. 浮层：打开第一帧 surface rect ≈ 来源卡片 rect（CDP 采样 ±2px），结束时为目标 rect；关闭回到同一卡片；点遮罩关闭。
4. 页面切换、编辑模式、翻页无布局跳动；动画期间可交互。
5. 插件：Tab 内容切换、列表增删、内联展开、勾选、进度更新按第 6 节；控制台 0 error。
6. `prefers-reduced-motion` 模拟下：无 transform 动画，浮层只淡入淡出。
7. 视觉验收：1440×960 连续截图/录屏；亮暗两套各一遍。

## 10. 明确不做

- 不为“看着高级”加视差/模糊/光效/粒子；
- 不做整页骨架入场动画；
- 不做跨 iframe 内容缩放动画（卡片层动画在宿主外层完成）；
- 不用动画传达唯一信息（长按等必须同时有静态提示/可替代入口）。
