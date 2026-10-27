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

## 2. 桌面表面状态机（widget 卡片 + 桌面 chrome，宿主统一驱动）

```
rest ──hover(鼠标/笔)──▶ hover ──pointerdown──▶ pressed ──hold 500ms──▶ longpress ──▶ 编辑模式
  ▲                        │                      │                                    │
  └──hover leave───────────┘                      └──up / cancel / 移动超 8px──▶ 回弹
```

| 状态 | transform | 阴影/描边 | 过渡 |
|---|---|---|---|
| rest | scale(1) | `shadow4` + 材质 token | — |
| hover | scale(1.02) | `shadow8` + 1px `colorNeutralStroke1` | 100ms `curveDecelerateMin` |
| hover 离开 | scale(1) | 回 rest | 100ms `curveAccelerateMin` |
| pressed | scale(0.98) | `shadow4`，描边保持 | 50ms `curveAccelerateMin` |
| longpress（500ms 内） | scale(0.98 → 0.97) 线性下沉 | 描边渐显到 `colorBrandStroke1`（透明度 0→0.35） | 500ms `curveLinear` |
| 松手未触发 | 回 hover/rest | 回原样 | 150ms `curveDecelerateMid` |
| 进入编辑模式 | 0.97 → 0.96 | `shadow8`、chrome 淡入 | 200ms `curveDecelerateMid` |

- 数值来自 `design/metrics` 的 `SURFACE_HOVER_SCALE = 1.02` / `SURFACE_PRESS_SCALE = 0.98` / `SURFACE_LONG_PRESS_SCALE = 0.97`（**项目 C 值，不是 Fluent token**：Fluent 2 的 tokens 只覆盖颜色/字体/间距/圆角/描边/动效时长与曲线，没有交互缩放 token）；widget 卡片与桌面 chrome（说明条、chat 入口、状态栏、快速设置面板）共用这一套。
- 放大 2%：164px 卡片每侧约 1.6px，在 12–16px gap 内不会挤到邻居；同时用描边/阴影补充“抬起”感，不靠单一缩放。2880×1920 @200% DPI 下缩放不担心发虚（用户拍板）。
- 长按进度用**卡片逐渐下沉**表达，不加进度环；到 500ms 才切编辑模式，期间任何移动/松手都可中断。
- 只对卡片主体生效；SDK 转发 pointer 时过滤掉 `button/input/[role=button]` 等交互目标。
- 编辑模式中卡片不参与 hover/press；由编辑覆盖层接管。

## 3. 编辑模式

- 进入：卡片 1→0.96（200ms 减速）；编辑 chrome（标题/按钮/顶部遮罩）opacity 0→1、translateY -4→0（200ms 减速）；桌面衬底轻微压暗 200ms。
- 退出：卡片 0.96→1（150ms 加速）；chrome 淡出（150ms 加速）；可随时中断，不阻塞操作。
- 拖拽：拖起卡片 opacity→0.25（150ms 加速）；跟手移动零过渡；落位吸附 200ms 减速。
- 改尺寸：width/height 200ms 减速；不缩放内容、不做整体缩放。
- 翻页：拖动跟手零过渡；松手落位 300ms 减速；越界橡皮筋线性跟手；页码点 100ms 切换。

## 4. 详情浮层：完整 container transform（所有卡片尺寸）

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

### 4.1 L2 子页 push / pop（同一浮层内）

- **进入 L2（push）**：新页从右侧进入（translateX 48px→0）+ 淡入，250ms `curveDecelerateMid`；
  旧页保持原样被覆盖（不做反向位移，避免两层同时动导致晕）。
- **返回/取消（pop）**：当前页 translateX 0→48px + 淡出，200ms `curveAccelerateMid`；回到 L1 原状态（Tab/滚动位置保留）。
- **保存（pop）**：提交后按 pop 动画返回 L1；L1 列表项用“列表项新增/更新”的 150–200ms 淡入变化。
- **在 L2 按 X / Esc / 点遮罩**：整个浮层关闭——内容 100ms 淡出后，surface 按第 4 节的反向 container transform 收回来源卡片。
- **Reduced Motion**：push/pop 改为 100ms 淡入淡出，无横向位移。
- L2 内不做 Tab（Tab 只在 L1 的平级内容上用），避免“页里还有页”的层级混淆。

## 5. 页面切换

- 桌面 ↔ 设置/复盘/插件：新页面 200ms 减速淡入 + 6px 上移（现有）；旧页面直接替换（不等待退出动画）。
- 桌面层常驻：切回桌面用 `replayKey` 重放 200ms 淡入，不重挂 iframe。
- 设置页内插件分区切换：内容 150ms 淡入 + 4px 上移，不横向滑动。
- Agent 浮空窗口：三段式 container transform（§5.1）；Toast / 强提醒 / 其它 Drawer：用 Fluent 默认过渡，不覆写。

### 5.1 Agent 浮空三段 morph（v0.3.0 D-20；v0.3.7 D-30 语义修订）

同一容器固定在 right/bottom，只过渡 width/height/borderRadius/box-shadow，禁止位移与模糊往返：

| 过渡 | 时长 / 曲线 | 内容 |
|---|---|---|
| 按钮 → 半高语音窗（`open-voice`） | 300ms `durationSlow` / `curveDecelerateMid` | 图标 100ms 淡出；内容 150ms 淡入（delay 100ms） |
| 半高语音窗 → 全高对话（`open-chat`，显式展开） | 300ms / `curveDecelerateMid` | 内容 150ms 交叉淡入；消息列表 150ms 淡入 + 4px 上移；气泡 20ms 错峰 |
| 全高对话 → 半高语音窗（`back-voice`，⌄ / Esc） | 250ms / `curveAccelerateMid` | 对话淡出，语音窗内容淡入（共享元素只切可见性，不重排） |
| 半高语音窗 → 按钮（`back-collapsed`） | 200ms / `curveAccelerateMid` | 内容 100ms 淡出，图标 150ms 淡入 |
| 全高对话 → 按钮（`close-chat`，X） | 250ms / `curveAccelerateMid` | 内容 100ms 淡出后收几何 |
| 按压 | 100ms `durationFaster` | scale 0.98 + surface pressed；悬停只变 surface/shadow |

- **语音回合结束不换段**（v0.3.7）：录音结束 → 转写 → 回答 → 朗读，全部在当前段内完成，没有 chat/composer 的自动 morph；只播放状态变化（声纹 / 流式气泡 / 朗读图标），不触发几何过渡。
- 动画不阻塞操作（输入首帧可用）；阶段可打断并从当前尺寸重定向。
- Reduced Motion：只保留 120ms 透明度，无尺寸/阴影/位移动画；声纹/脉冲静止。
- 入场方向定义出场方向：永远从右下角长出、原路收回；关闭后焦点回入口按钮。

### 5.2 欣赏壁纸模式（v0.6.0；v0.8.0 说明条 A2 修订，D-42）

桌面进入「欣赏壁纸」时只做一次**退场**、退出时做一次**回场**，不新增第三套时长口径——两类过渡直接套 §1 用途表：

| 过渡 | 归类（§1） | 允许的做法 |
|---|---|---|
| 进入欣赏壁纸（卡片淡出、`PageIndicator` 与编辑 chrome 淡出） | 「退出类（浮层收回、chrome 淡出）」 | 只做 opacity（卡片可叠一个 §3/§6 已有的 4–8px 量级 `translateY`）；**不允许 scale**（§10 不做跨 iframe 内容缩放，卡片容器也不缩放）；不碰 width/height，不触发布局 |
| 退出欣赏壁纸（卡片回场） | 「常规进出」 | 同上的属性集合，方向不变；回场不叠错峰 |

**说明条（A2）**：同一个胶囊容器在「非欣赏 pill」与「欣赏态展开卡」之间 morph——非欣赏态只有主体按钮（无 chevron）；
进入欣赏后出现 chevron 并默认展开详情（日期/来源 + AI 说明；标题/版权只在底部 pill 行出现，不重复，
正文两端对齐），底部 pill 行保留：文字区=退出欣赏、chevron=折叠。
- 宽度由内容决定（v0.8.1 起不再测量）：非欣赏 = 文字 + 左右 padding 16；欣赏 = 同一内容 + gap 8 + chevron 20 + 行尾呼吸位 8 = **只向右 +36**；
  44×44 命中区由伪元素外扩，不参与布局宽度。圆角 circular → 12、shadow4 → shadow16。
- 展开/收起只补间**高度**（`grid-template-rows: 0fr → 1fr`，250ms `durationGentle` + `curveDecelerateMid`；收起 150ms `durationFast` + `curveAccelerateMid`）
  + 详情内容淡入；不对 width/height 做 layout 过渡（那是逐帧重排的「拉伸」感来源）。reduced-motion 只保留 100ms 淡入淡出、尺寸瞬变。
- hover / pressed 与 §2 桌面表面状态机统一（**hover 1.02 是整壳缩放，文字一起放大**，与 widget 卡同语言）；
  pressed 不缩放：几何收缩会让 chevron 从指针下移开、click 丢目标，按压反馈改为背景加深；展开态不做 hover 缩放。
- 展开卡是浮层：`H_p` 恒 26，网格 / Agent 入口 / 状态栏不动；欣赏态展开时点外部或 Esc **收起**（不退出欣赏）。
- 说明刷新不在桌面：设置页「外观 → 壁纸 → 说明」行（低频；打开设置页只读缓存状态，点「刷新说明」才 force 一次，**不自动生成**）。

### 5.3 状态栏快速设置面板（v0.8.0，D-43）

与说明条同源的「胶囊 → 展开卡」morph：状态栏 pill 向上、向左（宽高增长，右缘/下缘不动，`right: 90`、`bottom: 27`），
圆角 circular → 12、shadow4 → shadow16；展开 250ms / 收起 150ms（同 §5.2）；面板内容淡入；reduced-motion 只淡入。
- 底部保留状态栏行 + chevron；**chevron 只在展开态存在**，折叠时随面板一起隐藏（回到普通状态栏）——与说明条不同：说明条有欣赏/非欣赏两个桌面状态，chevron 在欣赏态一直存在。
- 面板内容：自动连接开关、设备列表（唯一首选 star：已选 `Star20Filled` 实心 + brand 色、未选空心）、音量/静音、亮度、自动亮度（仅检测到能力才渲染）、打开 Windows 蓝牙设置。
- 点外部 / Esc 折叠、焦点回状态栏；与说明条展开互斥（同时最多一个桌面浮层）。
- 暗色面板填充用 Fluent brand ramp brand 90（#2886de），亮色用主题 `colorBrandBackground`；链接/选中 star 用 `colorBrandForeground1`（D-43 记录）。

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
| 保存/关闭浮层 | 由宿主负责；L2 保存按 pop 返回 L1，插件内容不要先自行做退场 | — |

明确不做：stagger 逐项入场、数字滚动、打字机、粒子/爆炸、循环呼吸、视差、回弹超调。

## 7. 减少动效（`prefers-reduced-motion: reduce`）

宿主与插件都必须响应（共享 `_shared/useReducedMotion`）：

| 原效果 | 减弱后 |
|---|---|
| hover 放大、按下缩放 | 不做 transform，只保留 100ms 颜色/描边变化 |
| 说明条按下形变（§5.2） | 不做 transform，只保留 100ms 颜色/描边变化 |
| 长按下沉 | 不做缩放，按下后显示静态描边 |
| 编辑模式卡片缩放 | 不缩放，直接切换 chrome |
| 浮层 container transform | 只保留 100ms 淡入淡出，不位移/不缩放 |
| L2 子页 push/pop | 直接切换或 100ms 淡入淡出，无横向位移 |
| 页面/列表/Tab 动效 | 直接切换或 ≤100ms 淡入 |
| 翻页跟手 | 保留（直接操纵） |
| 进度环/进度条 | 保留 Fluent 默认（属于状态指示，不视为装饰） |

## 8. 实现约束

- 宿主：
  - 卡片状态用 `data-hover` / `data-press="down|holding"` + CSS transition（值全部取 `motionTokens`）；
    1px 描边用独立 overlay：hover 中性描边常驻、长按品牌描边 500ms 线性渐显到 0.35；
  - **长按计时器只在插件侧 SDK（`useHostCardGesture`）跑一份**；宿主只做视觉与进编辑，不重复计时。
    SDK 转发 pointer 事件时过滤交互控件，到点发 `plugin:request-edit-mode`，并负责吞掉后续 click；
  - `prefers-reduced-motion: reduce`：hover/press 不做 transform，只保留 100ms 颜色/描边变化；
    编辑模式卡片也不缩放，直接切换 chrome；
  - **卡片状态 scale 只在 Card 本体**：hover / press / 长按 / 编辑四种缩放全部叠在 Fluent `Card` 的 `transform` 上（`WidgetCard.tsx` 的 `cardTransform`）；内容层（承载 iframe 的 `contentLayer`）永久 `transform: none` 且不再声明 `will-change`——缩放不进入 iframe 内容（§10 的落地）；
  - **说明条（§5.2）**：按下形变放在单独的 `creditPressable` 类里，reduced-motion 不合并该类；`H_p` 由 `offsetHeight` 上报（`transform` 不改 border-box）；44×44 命中区仍由 `::after` 外扩；解释文本与「重新生成说明」按钮挂在绝对定位的 `noteRow` 上，不参与 `H_p` 测量；
  - container transform 由浮层组件计算 start/end rect、用 CSS transition 驱动 surface（位置/宽高/透明度），内容交叉淡入；锚点无效时走兜底。
    （E4 落地时的微调：surface 固定在自己的最终 rect 上，位置/尺寸的变化用 `translate + scale` 表达，
    等价于“位置/宽高过渡”但只走合成层；圆角/阴影仍随同一段 transition 一起变化。）
- 插件：
  - `public/plugins/_shared/motion.js` 提供 `FadeSlide` / `Collapse` / `CrossFade` / `useReducedMotion`，内部只用 `motionTokens` + `createPresenceComponent`；
  - 插件不得写出毫秒字面量/自定义曲线；交互密集处（每次点击）不额外加动画。
- 禁止：动画阻塞操作（动画中仍可点击/关闭）；为动画延迟内容渲染；用动画掩盖加载。

- **实现状态：E2 已按本文件落地（2026-10-19）。** 卡片 hover/press/长按视觉与 reduced-motion
  在 `WidgetCard.tsx`；手势转发与长按检测在 `_shared/host.js` 的 `useHostCardGesture`。
- **E4 实现状态（2026-10-20）**：container transform、页面/分区切换、编辑模式与插件动效审计落地位置：
  - **详情浮层 container transform（§4）**：`src/host/plugins/overlayMotion.ts`（几何/时序/reduced-motion/
    兜底判定，导出 `useOverlayTransform` 与 `captureOverlaySource`）+ `src/host/plugins/PluginOverlay.tsx`
    （Fluent Dialog 容器：关掉 Fluent 自带 surface 进场动效与 backdrop 淡入，换成自定义 scrim）。
    `src/host/plugins/PluginWidgetFrame.tsx` 在 `plugin:request-overlay` 时用 `captureOverlaySource`
    记录 `{element, rect, viewport}` 并随 overlay 状态保存；关闭动画结束后卸载浮层并把焦点还给来源卡片。
  - 实现细节（参数不变）：surface 固定在自己的**最终 rect**上，用 `translate + scale`（`transform-origin: 0 0`）
    把视觉矩形摆回来源卡片，因此每帧只走合成层、不触发布局；圆角按 `卡片半径 / 缩放` 反算（`borderRadius`
    用双值 `x / y`）保证起始视觉圆角等于卡片圆角；阴影在 `shadow4 ↔ 浮层阴影` 之间过渡。
    量尺前会 `cancel()` 掉 Fluent DialogSurface 自带的 `Scale` WAAPI 动画（该动画优先级高于内联样式，
    不摘掉会量到 0.85 缩放后的 rect，且与 container transform 叠加）。
  - **L2 push/pop（§4.1）**：插件侧 `_shared/ui.jsx` 的 `Subpage` + `_shared/motion.js` 的 `SlidePage`
    （E3.0 已落地，本轮复核未改）。
  - **页面切换（§5）**：`src/host/shell/PageTransition.tsx`（200ms/6px，新增 reduced-motion 变体 →
    100ms 仅淡入）；设置页分区切换用 `src/host/shell/ContentTransition.tsx`（150ms 淡入 + 4px 上移，
    仅 `viewKey` 变化时重放，首屏不叠加动画），接在 `SettingsPage.tsx` 的内容容器上。
  - **编辑模式（§3）**：`WidgetCard.tsx` 的卡片缩放/进入 200ms 减速、退出 150ms `curveAccelerateMid`
    （`EDIT_CARD_SCALE` 由 E2 的 0.97 对齐回规范 0.96）；`desktop.styles.ts` 的 chrome/工具栏退出统一
    150ms `curveAccelerateMid`；新增 `editBackdrop`（桌面衬底 200ms 压暗 / 150ms 恢复），挂在 `Desktop.tsx`。
  - **插件动效（§6）**：审计六个插件 `src/**`，无 ms 字面量/自定义曲线；补上 `todo/src/ListManager.jsx`
    的清单列表增删（`FadeSlide`：新增 200ms 淡入 + 8px、删除 100ms 淡出后再移除），并重建
    `public/plugins/todo/app/app.js`。其余场景（Tab/视图切换、列表增删、内联展开、勾选、阶段切换、
    空态↔内容）已在 E3 用 `CrossFade` / `FadeSlide` / `Collapse` / `useMotionTransition` 覆盖，未改参数。

## 9. 验收

1. `grep` 检查：宿主与插件 `src` 中无非 token 的 duration/easing/ms 字面量（`_shared` 除外）。
2. 卡片：hover 1.015、press 0.985、长按 500ms 过程中 scale 从 0.985 线性到 0.97、到点进编辑；松手回弹；**缩放只作用 Card 本体，iframe 内容与 contentLayer 不发生 transform**。
3. 浮层：打开第一帧 surface rect ≈ 来源卡片 rect（CDP 采样 ±2px），结束时为目标 rect；关闭回到同一卡片；点遮罩关闭。
4. 页面切换、编辑模式、翻页无布局跳动；动画期间可交互。
5. 插件：Tab 内容切换、列表增删、内联展开、勾选、进度更新按第 6 节；控制台 0 error。
6. `prefers-reduced-motion` 模拟下：无 transform 动画，浮层只淡入淡出。
7. 视觉验收：1440×960 连续截图/录屏；亮暗两套各一遍。
8. 说明条（§5.2）：按下 scale 0.985（50ms）、松手回弹；reduced-motion 模拟下无 transform；按下前后 `H_p` 不变（`offsetHeight`）。

## 10. 明确不做

- 不为“看着高级”加视差/模糊/光效/粒子；
- 不做整页骨架入场动画；
- 不做跨 iframe 内容缩放动画（卡片层动画在宿主外层完成）；
- 不用动画传达唯一信息（长按等必须同时有静态提示/可替代入口）。
