# 文档数值 → Fluent token 对照表

> 目的：让 `docs/**` 里出现的每个**规范性数值**都能回答“它从哪个 token 来”。
> 三类出处，表中逐行标注：
>
> - **T**：直接引用 Fluent v9 token（`tokens.*` / `Text size`）。
> - **D**：由 token 值算出的整数（算式写在同一行，算式里只出现 token 值与 4px 基线）。
> - **C**：契约常量（不是 Fluent 设计 token，已在上游规格登记；**不得新增**，见 §11）。
>
> 2026-10-24 起的硬规则：新增文档数值只能是 **T** 或 **D**；出现新的 **C** 必须在 `DECISIONS.md` 登记。
> token 实际值以 `node_modules/@fluentui/tokens/lib/global/**` 为准（spacing 最大 32、`borderRadiusXLarge` = 8、`borderRadius2XLarge` = 12）。

## 1. 栅格与桌面（1440×960）

| 数值 | 用途 | 出处 |
|---:|---|---|
| 1440×960 | 逻辑视口（物理 2880×1920 @200%） | C（设备事实，非设计值） |
| 4 | 基线/步长 | T（`layout.md` 基础单位；spacing ramp 全部 4 的倍数） |
| 8 列 | 桌面列数 | D（断点 ≥1280；`breakpoints.ts` 分档表） |
| 5 行 | 桌面行数 | D（`floor((960 − 2×spacingHorizontalXL + 12) / 176) = 5`） |
| 164 | 单元格边长 | D（`floor((1440 − 2×spacingHorizontalXL − 7×spacingHorizontalM) / 8) = 164`） |
| 12 | 卡间距 gutter | T（`spacingHorizontalM` / `spacingVerticalM`） |
| 22 | 页边距（左右）/ 网格原点 x | D（(1440 − 1396) / 2；`layoutFrame().insetX`） |
| 176 | 网格步长 | D（164 + 12） |
| 1396 | 网格总宽 | D（8×164 + 7×12） |
| 868 | 网格总高 | D（5×164 + 4×12） |
| 26 | 说明条实测高度 `H_p`（**布局输入**） | D（`lineHeightBase200` 16 + 2×`spacingVerticalXS` 4 + 2×`strokeWidthThin` 1；首帧估计 `FOOTER_PILL_ESTIMATE`，运行时由 `desktop/WallpaperLayer.tsx` 的 ResizeObserver 实测、经 `layout/footer` 的 `reportFooterPillHeight` 上报覆盖） |
| 906 | 网格 + 一个 gutter + `H_p`（`unionH`） | D（868 + 12 + 26；`layoutFrame` 的 `frameInset` 与 chat 面板高同值） |
| 27 | 顶部净空 / 网格原点 y | D（(960 − 906) / 2 = 27；上净空 = 960 − pill 下缘 933 = 27；`layoutFrame().insetY`，不做 4px 吸附） |
| 22 | 右侧余量 | D（1440 − 1418 = 22，与左侧相等） |
| 27 | 底部余量 | D（960 − 933 = 27，与顶部相等；933 = 网格下缘 895 + gutter 12 + `H_p` 26，说明条 pill 与 chat 入口共用这条下缘） |
| 1418 / 895 | 网格右下 | D（22 + 1396 / 27 + 868；`layoutFrame().grid`） |
| 907 / 933 | 说明条 pill 上缘 / 下缘 | D（网格下缘 895 + gutter 12；907 + `H_p` 26；`layoutFrame().pill`） |
| 96–220 | 单元格 clamp 下限/上限 | C（可用性下限 96；上限 220，`breakpoints.ts`） |
| 1280 / 900 / 480 / 360 | 列数断点 | C（`layout.md` 断点区间；项目分档） |
| 22 | 卡内容轴 | D（`spacingHorizontalSNudge` 6 + `spacingHorizontalL` 16） |

> **`H_p` 是布局输入（v0.6.0，`layout/breakpoints.ts` 的 `layoutFrame`）**：说明条高度由文字内容决定
> （`<Text size={200}>` 行高 + 上下 padding + 描边），布局把它当**参数**用，而不是塞进一条写死的等高带子：
> `unionH = 868 + 12 + H_p`，整块「网格 + 一个 gutter + 说明条」在视口内垂直居中。1440×960 / `H_p`=26 下
> 网格 (22,27)-(1418,895)、pill (22,907)-(1418,933)、chat 入口 (1362,877)-(1418,933)（下缘 = pill 下缘 933）。
> 上净空 = 下净空 = 27；网格下净空 65 = 12 + 26 + 27（与下净空配对的是 pill 下缘，不是网格下缘）。
>
> **`H_p` = 0 的语义（已实现，`layout/breakpoints.ts` 的 `normalizeFooterPillHeight` + `frameInset`）**：
> 0 表示**没有说明条**（用户在设置里隐藏，或本机图片没填说明文字），不是「还没测到」；只有负数 / NaN
> 才退回首帧估计。此时 pill 行与它上方的 gutter 一并消失：`unionH = 868`、`insetY = 46`、
> 网格 (22,46)-(1418,914)、pill 退化为 `grid.bottom` 上的零高矩形 (22,914)-(1418,914)、
> chat 入口 (1362,858)-(1418,914)（下缘贴网格下缘）、对话面板 516×868 → (902,46)-(1418,914)，
> 上/下净空 46/46。上报侧由 `desktop/WallpaperLayer.tsx` 在说明条不渲染时 `reportFooterPillHeight(0)`。

## 2. 卡片外壳

| 数值 | 用途 | 出处 |
|---:|---|---|
| 12 | 卡片圆角 | T（`borderRadius2XLarge` = 12；不再使用项目 `--wtsl-card-radius`） |
| 1 | 描边 | T（`strokeWidthThin`） |
| 72% | 卡面不透明度 | C（D-31 材质决定；无 Fluent alpha token，唯一登记的材质例外） |
| 24 | 背景模糊 | C（`--wtsl-material-blur`，项目 token，D-31 唯一例外） |
| shadow4 / shadow8 | 静止 / hover·编辑投影 | T（`tokens.shadow4` / `tokens.shadow8`） |
| 16 | 卡片内 padding | T（`spacingHorizontalL` / `spacingVerticalL`） |
| 8 | 组间距 | T（`spacingVerticalS`） |
| 6 | 宿主内衬 | T（`spacingHorizontalSNudge`） |
| 56 | 编辑态标题带 | D（`spacingHorizontalXXL`×2 + `spacingHorizontalS` = 24+24+8） |
| 20 | 编辑态标题 pill 高 | D（`spacingHorizontalL` 16 + `spacingHorizontalXXS`×2 = 16+2+2） |
| 4 | pill 内缩 | T（`spacingHorizontalXS`） |
| 44 | 触控目标 | C（`TOUCH_TARGET`；Fluent `layout.md:57` 的 iOS & Web 44×44，与 HIG §6 44 同值；宿主与插件共享层同值） |

## 3. 字号与行高

| 数值（px / 行高） | 用途 | 出处 |
|---|---|---|
| 40 / 52 | **唯一 hero**（全档、全插件） | T（`fontSizeHero900` / `lineHeightHero900`） |
| 32 / 40 | 页面/分区大标题 | T（`fontSizeHero800` / `lineHeightHero800`） |
| 28 / 36 | 列表头（旧口径，仅详情） | T（`fontSizeHero700` / `lineHeightHero700`） |
| 24 / 32 | 统计大值、section 标题 | T（`fontSizeBase600` / `lineHeightBase600`） |
| 20 / 28 | 统计值、section 标题 | T（`fontSizeBase500` / `lineHeightBase500`；Fluent 2 设计表写 20/26，v9 token 实际是 20/28，以 token 为准） |
| 16 / 22 | 行标题、标题正文 | T（`fontSizeBase400` / `lineHeightBase400`） |
| 14 / 20 | 正文/标签 | T（`fontSizeBase300` / `lineHeightBase300`） |
| 12 / 16 | 元信息、最小字号 | T（`fontSizeBase200` / `lineHeightBase200`） |
| 10 / 14 | **禁止**（<12px） | T（`fontSizeBase100`，白名单外） |
| 1.0–1.5m / 0.5–0.8m | 视距分档 | C（DENSITY 物理前提，非 token） |
| 1 CSS px = 0.1902mm | 物理换算 | C（2880×1920 / 200%，非 token） |
| ≥2.0 / ≥1.5 | 主次字号比 | D（40/16=2.5、40/14=2.86；16/12=1.33 列表卡按结构断言） |

## 4. 间距 ramp 与常用组合

| 数值 | token | 文档落点 |
|---:|---|---|
| 2 | `spacingHorizontalXXS` / `spacingVerticalXXS` | 行高补足、pill 内缩 |
| 4 | `spacingHorizontalXS` / `spacingVerticalXS` | 行距、dot 间距、组内 |
| 6 | `spacingHorizontalSNudge` / `spacingVerticalSNudge` | 宿主内衬、图标补正 |
| 8 | `spacingHorizontalS` / `spacingVerticalS` | 卡片组间距、图标-文字 |
| 10 | `spacingHorizontalMNudge` / `spacingVerticalMNudge` | 仅允许图标对齐补正（不新增用途） |
| 12 | `spacingHorizontalM` / `spacingVerticalM` | gutter、列表内边距、分页底距 |
| 16 | `spacingHorizontalL` / `spacingVerticalL` | 卡片 padding、分组间距、列表首末 inset |
| 20 | `spacingHorizontalXL` / `spacingVerticalXL` | 推导 cell 的最小留白（`GRID_PADDING`）；不是最终页边距，也不是入口安全距 |
| 24 | `spacingHorizontalXXL` / `spacingVerticalXXL` | identity 行高、页面 body padding、DialogTitle padding |
| 32 | `spacingHorizontalXXXL` / `spacingVerticalXXXL` | 首行偏移组合、插件表行高补足 |

> v9 spacing 最大 32；40/44/48/52/56 不在 spacing token 内，必须写成下面的推导式。

## 5. 列表与行预算

| 数值 | 用途 | 出处 |
|---:|---|---|
| 44 | 列表行高 | T（`LIST_ROW_HEIGHT` = `TOUCH_TARGET` 44；行高与触控目标同值） |
| 4 | 行距 | T（`spacingVerticalXS`） |
| 48 | 行 pitch | D（44 + 4） |
| 24 | identity 行高（`CARD_IDENTITY_HEIGHT_PX`） | T（`spacingVerticalXXL`） |
| 20 | identity 图标（`IDENTITY_ICON_SIZE` = `ICON_SIZE.S`） | T（图标档位 20；`iconography.md:19-23` 按档位取、不缩放） |
| 28 | identity 标签左缘 | D（图标 20 + `spacingHorizontalS` 8） |
| 12 | identity 标签 | T（`fontSizeBase200`） |
| 32 | 首行距内容顶 | D（24 + `spacingVerticalS` 8） |
| 54 | 首行距卡顶 | D（6 + 16 + 32） |
| 296 / 264 / 204 / 380 / 440 | 行预算 Hc / A | D（卡高/iframe 高扣除 padding 16×2、identity 24、gap 8、featured 52+8） |
| 5 / 8 / 3 / 4 | cap | D（`N = min(cap, floor((A+4)/48))`；见 DENSITY §2.2） |
| 22% | 单块空带上限 | D（门禁比例，由卡高算术裁定） |
| 60% / 70% | 内容带下限 | D（通用 / weather 3×2） |
| 40 | 横向空洞上限 | D（10×`spacingHorizontalXS`；DENSITY §2.1-9） |

## 6. Agent 入口（右下保留格）/ Agent 浮空

> v0.4.2 起三态几何全部由 `src/host/agent/ui/entryGeometry.ts` 从栅格推导。
> **v0.6.0 锚点修订**：锚点改取**底部条（说明条行）的右下角** (1418, **933**)，安全距 0 →
> 1440×960 下 right 22 / bottom **27**（933 = 网格下缘 895 + gutter 12 + 说明条实测高 `H_p` 26；
> bottom 27 = 960 − 933，与上净空相等）。入口**不再贴网格右下角**：它比 `g + H_p`(38) 高，
> 上缘 877 向上越过网格下缘 895，那一格由保留格保证不放卡片（`layout/grid.ts` 的 `fabReservedCell`）。
> **`H_p` = 0（没有说明条）时同一套规则退化为贴网格下缘**：锚点 (1418, **914**)、right 22 / bottom **46**、
> entry (1362,858)-(1418,914)、面板 516×868（= 网格高）→ (902,46)-(1418,914)；不需要额外判断分支。
> 面板宽高是 (cell, gutter) 的整数组合；严格居中后留白 ≡ 2 (mod 4)，三态边不再落 4 的倍数。

| 数值 | 用途 | 出处 |
|---:|---|---|
| 56 | Agent 入口外框 | D（`spacingHorizontalXXXL` 32 + `spacingHorizontalXXL` 24） |
| 0 | 入口/面板相对底部条右缘、下缘的安全距 | D（`AGENT_GRID_SAFETY = 0`；右缘 = 网格右缘 1418、下缘 = 说明条 pill 下缘 933，不是网格下缘） |
| 22 / 27 | 1440×960 下的 right / bottom 偏移 | D（视口 − 锚点：1440 − 1418、960 − 933） |
| Circular | 收起态圆角 | T（`borderRadiusCircular`） |
| 12 | 展开后圆角（语音窗 / 对话面板） | T（`borderRadius2XLarge` 12） |
| 1 | 描边 | T（`strokeWidthThin`；rest `colorNeutralStroke2`，hover `colorNeutralStroke1`） |
| shadow8 / shadow64 | orb / 展开浮层投影 | T（`tokens.shadow8` / `tokens.shadow64`） |
| 30 | 入口 z-index | C（CSS 层级无 Fluent token） |
| 58 | 入口命中区 | D（56 + 2×1px `inset`） |
| 516 | 语音窗 / 对话面板宽 | D（3×cell + 2×gutter = 3×164 + 2×12） |
| 340 | 语音窗高 | D（2×cell + gutter = 2×164 + 12） |
| 906 | 对话面板高 | D（网格高 868 + gutter 12 + `H_p` 26：顶边 = 网格上缘 27、下缘 = pill 下缘 933） |
| 16 | 面板内衬 | T（`spacingHorizontalL` / `spacingVerticalL`） |
| 8 | 面板内元素间距 | T（`spacingHorizontalS` / `spacingVerticalS`） |
| 16 | 消息间距 / 消息列表内边距 | T（`spacingVerticalL` / `spacingHorizontalL`） |
| 8 | 气泡纵向 / 块间距 | T（`spacingVerticalS`） |
| 8 | 气泡圆角 | T（`borderRadiusXLarge`，v9 = 8） |
| 20 | 正文行高 | T（`lineHeightBase300`） |
| 44 | 轮次卡折叠头（AccordionHeader large，折叠态一行） | C（`TOUCH_TARGET`；DENSITY §4「工具默认折叠成一行」） |
| 12 | 工具卡文本 | T（`fontSizeBase200`） |
| 96 | voice 空态圆 | D（`spacingHorizontalXXL`×4 = 96） |
| 40 | 圆内图标（voice 空态） | C（`ChatSparkleRegular fontSize={40}`，`AgentSurface.tsx:974`；不在 `ICON_SIZE` 16/20/24/32/48 阶梯内，待裁决见 §11） |
| 132 / 168 | voice 空态环 | C（host 规格 D-35 定值，非 token） |
| 120 | reduced-motion 时长 | C（AGENT-SURFACE-CONTRACT §3；motionTokens 无 120） |
| 2 | 半高 peek 条数上限 | D（340 − voiceTop 56 − voiceDock 92 = 192 可用；68×2 + 间距 8 = 144 放得下、3 条 220 放不下，见契约 §1） |
| 400 | 半高 peek 文本列宽 | D（气泡 416 = 484 × 86%；416 − 2 × `spacingHorizontalS` 8 = 400） |
| 84 | 半高 peek 可见字符预算 | D（3 行 × floor(399 / 14) ≈ 3×28 全角字；代码里按 168 个半角单位计） |
| 1000 | 半高/全高状态行秒数刷新 | C（计时器节拍，不是动效时长，不取 motionTokens） |
| 3 | 来源 chips 首屏上限 | C（预算计数，非尺寸） |

## 7. 分页指示器

| 数值 | 用途 | 出处 |
|---:|---|---|
| 8 | dot 边长 | T（`spacingHorizontalS`） |
| 4 | dot 间距 | T（`spacingHorizontalXS`） |
| 16 | 容器高 | D（8 + 4 + 4） |
| 4 / 12 | 容器 padding | T（`spacingHorizontalXS` / `spacingHorizontalM`） |
| 12 | 容器底距 | T（`spacingHorizontalM`） |
| 7 | 折叠阈值 | C（`layout/pages.ts` 定值） |
| 12 | 折叠胶囊字号 | T（`fontSizeBase200`） |

> **分页指示器只改颜色（2026-10-24 裁决，host-impl §3.4）**：容器透明、**无材质底、无投影**、`pointer-events: none`，
> dot 过渡只动 `background-color`；当前页 `colorNeutralForeground1`、其余 `colorNeutralForeground3`
> （不用 `colorBrand*` / `colorNeutralStroke*`——brand 留给真正的主操作，常驻状态指示不做强调）。
> 容器高 16 = dot 8 + `spacingVerticalXS` 4 ×2；底距 12 = `spacingVerticalM`。

## 8. overlay / 详情

| 数值 | 用途 | 出处 |
|---:|---|---|
| 880 / 680 | 浮层宽高 | C（host 规格 §3.5；`min(880px, 92vw)` / `min(72vh, 680px)`） |
| 12 | 浮层圆角 | T（`borderRadius2XLarge` 12） |
| shadow64 | 浮层投影 | T（`tokens.shadow64`） |
| 16 | DialogContent 内衬 | T（`spacingHorizontalL` / `spacingVerticalL`） |
| 24 | DialogTitle 内衬 | T（`spacingHorizontalXXL` / `spacingVerticalXXL`） |
| 40 | 浮层内容轴 | D（24 + 16） |
| 56 | header 高 | D（24 + 8 + 24 = 56） |
| 44 | 关闭按钮 / 操作控件 | C（`TOUCH_TARGET`） |
| 8 | 首屏列表行上限 | D（`(680 − 56 − 40 − 56) / 48 = 11`，预算取 8） |
| 24 / 44 / 48 | 详情 section 间距 / 列表行 / 设置行 | T/D（`spacingVerticalXXL` / 44 / 48 = 32+16） |
| 720 / 834 / 1180 / 1040 | 内容最大宽 | C（表单 720、详情 834、插件/复盘 1180、设置 1040） |
| 8 | 统计卡圆角 | T（`borderRadiusXLarge`，v9 = 8） |

## 9. 宿主页面

| 数值 | 用途 | 出处 |
|---:|---|---|
| 56 | 插件表/卡片行高 | D（`spacingVerticalXXXL` 32 + `spacingVerticalXXL` 24） |
| 48 | 设置行高 | D（`spacingVerticalXXXL` 32 + `spacingVerticalL` 16） |
| 140 | 复盘卡最小高 | D（32×4 + 12 = 140） |
| 16 / 12 | 页头上下 padding | T（`spacingVerticalL` / `spacingVerticalM`） |
| 24 | 页面 body 左右 padding | T（`spacingHorizontalXXL`） |
| 12 | 卡片网格 gap | T（`spacingHorizontalM`） |
| 16 | 块间距 | T（`spacingVerticalL`） |
| 44 | 表单控件高 | C（`TOUCH_TARGET`） |

## 10. 内容图形与状态点

| 数值 | 用途 | 出处 |
|---:|---|---|
| 8×8 | 状态点 | T（`spacingHorizontalS` × `spacingHorizontalS`） |
| 2 | 状态强调线 | T（`strokeWidthThick`） |
| 4 | 进度带厚（`HeroProgress`） | T（`strokeWidthThickest`，**Web 档 = 4**；不是 `strokeWidthThicker`（Web 3 / Mobile 4，`shapes.md:67-72`），也不是 spacing token） |
| 56 | 天气现象图标 | D（32 + 24；内容图形，和风 SVG 例外） |
| 48 / 32 / 24 / 20 / 16 | 图标档位（`ICON_SIZE` = XS16/S20/M24/L32/XL48） | T（Fluent System Icon 按档位交付、不缩放，`iconography.md:19-23`；XL 48 = 天气等内容图形上限）。12 只用于「纯信息、不可交互」（`iconography.md:20-21`），不在 `ICON_SIZE` 阶梯内、不得用于控件 |
| 24 / 32 / 40 | 空态图标 | T（`EMPTY_STATE_ICON_SIZE` 24 = `ICON_SIZE.M`，用于 `compact`/1×1；普通档图标槽 32 = `ICON_SIZE.L`；`EMPTY_STATE_ICON_SIZE_LARGE` 40 用于 voice 空态主图标，宿主同值常量在 `src/host/design/metrics.ts`） |
| 72 | AQI 环外径 | D（`spacingHorizontalXXL`×3 = 72） |
| 88 | 详情 AQI 环 | D（56 + 32；内容图形） |
| 72 | 天气 3×2 逐时列宽 | D（`(472 − 5×8) / 6 ≈ 72`） |
| 10px | 旧颜色点（已移除） | T（`fontSizeBase100`，白名单外，作废） |

## 11. 契约常量（C 类）清单

以下值**不是** Fluent 设计 token，但已在上游规格中钉死；不得再新增同类数值：

| 数值 | 出处 | 说明 |
|---:|---|---|
| 1440×960 | 设备事实 | 逻辑视口 |
| 96–220、1280/900/480/360 | `breakpoints.ts` / `layout.md` | 单元格夹取与断点 |
| 72% + blur 24 | D-31 | 材质唯一例外（`--wtsl-material-blur` 为项目 token） |
| 44 | `TOUCH_TARGET` | 触控目标（Fluent `layout.md:57` 的 iOS & Web 44×44，与 HIG §6 同值；宿主 `src/host/design/metrics.ts` 同值） |
| 40 | `EMPTY_STATE_ICON_SIZE_LARGE` | voice 空态圆内主图标。图标阶梯（16/20/24/32/48）之外的唯一空态主图标档，已纳入常量出口，调用点不写裸 40 |
| 30 | `agent.css` | Agent 入口层级 |
| 880 / 680 / 92vw / 72vh | host 规格 §3.5 | 浮层几何 |
| 720 / 834 / 1180 / 1040 | `PLUGIN-CONTRACT` §4 | 内容列宽 |
| 7 | `layout/pages.ts` | 分页折叠阈值 |
| 132 / 168 / 120 | D-35 / Agent 契约 | voice 环与 reduced-motion 时长 |
| 1.015 / 0.985 / 0.97 / 0.98 | `MOTION.md` | 卡片 hover / 按下 / 长按下沉 / 按压缩放；0.985 同时用于说明条 pressed（D-38，`wallpaper-credit` 的 `:active`） |
| 500ms | `DESIGN.md` §2 | 长按进编辑的手势阈值 |
| 80–320ms（80/120/150/200/220/240/250/280/300/320） | Agent 契约 §12 | 已登记为 `motionTokens` 就近取值（`durationFaster/Fast/Normal/Gentle/Slow`） |
| 22% / 60% / 70% / 40 | DENSITY §2.1 | 门禁比例与空洞上限 |

> v0.4.2 作废项：Agent 宽高钳位 `420 / 320 / 440` 已不再存在于实现（`agent.css` 只读
> `--wtsl-agent-width/height`，值由 `entryGeometry.ts` 从栅格推导，见 §6）；「3 条 peek」改为 2 条（§6）。

## 12. 共享原语几何（2026-10-24，`_shared/ui.jsx` / `_shared/sizes.js`）

> 这一节登记 Wave 2-D 新增/修复的原语内部尺寸。原则：原语内部只用 token；插件调用点不得复写这些数字。

| 数值 | 用途 | 出处 |
|---:|---|---|
| 92 | `Metric` 总高（有 label；空 caption 也是 92，两态等高） | D（`lineHeightHero900` 52 + `spacingVerticalXXS` 2 + meta 38） |
| 38 | `Metric` meta（label 行 + caption 行最小高） | D（`lineHeightBase300` 20 + `spacingVerticalXXS` 2 + `lineHeightBase200` 16） |
| 74 | `Metric` 旧总高（`reserveCaption={false}`，caption 缺失时塌陷 18） | D（52 + 2 + `lineHeightBase300` 20） |
| 52 | `Metric` 仅 value（无 label / caption，weather 详情用法） | T（`lineHeightHero900`） |
| 28 | `DataRow` 行高 | T（`lineHeightBase500` 28；label `Text size=200`、值 `size=500`、单位 `size=200`） |
| 24 / 32 | `MiniBars` 轨道高（默认 / `size="tall"`） | T（`spacingVerticalXXL` / `spacingVerticalXXXL`） |
| 32 | `MiniBars` 条宽上限 | T（`spacingHorizontalXXXL`） |
| 4 | `MiniBars` 列距 | T（`spacingHorizontalXS`） |
| 2 | `MiniBars` 轨道/条圆角 | T（`borderRadiusSmall`，v9 = 2） |
| 24 | `EmptyState` 紧凑档图标槽（= 空态图标档位） | T（`spacingHorizontalXXL` / `spacingVerticalXXL` = `EMPTY_STATE_ICON_SIZE`） |
| 4 | `EmptyState` 紧凑档组距 | T（`spacingVerticalXS`） |
| 32 | `EmptyState` 普通档图标槽 | T（`spacingHorizontalXXXL` / `spacingVerticalXXXL`） |
| 70 | `EmptyState compact` 实测总高（标题 16/22 + 组距 4 + CTA 44） | D（`lineHeightBase400` 22 + `spacingVerticalXS` 4 + 44） |
| 44 | `TOUCH_TARGET` / `TouchButton` / `ListRow` / L1 tabs | C（`TOUCH_TARGET` 44；L1 tabs 与列表行同值） |
| 56 / 48 / 44 | L1 骨架 header / toolbar / tabs | D（`spacingVerticalXXL` 24 + `spacingVerticalM` 12 + 20；toolbar 32 + 16；tabs = `TOUCH_TARGET` 44） |
| 20×20 | `CardIdentity` 无图标时的空占位槽 | T（`spacingHorizontalXL` × `spacingVerticalXL`；保证 label 左缘恒 28） |
| — | `sizes.js` 不产生任何设计数值 | 纯数据结构（`SIZE_KEYS` / `sizeKeyOf` / `defineSizeFields`），几何仍由本表各行决定 |

## 13. 覆盖与校验

- 本表覆盖 `docs/**` 中**当前生效**的规范性数值（历史审计报告 `docs/audits/**`、`RELEASE*` 的实测值不在内）。
- 逐行校验命令（只读）：
  ```powershell
  # 找出文档里带 px 的裸值，逐条对照本表
  Select-String -Path docs\*.md,docs\components\*.md -Pattern '\b\d+px\b' |
    Select-Object Path,LineNumber,Line
  ```
- 新增数值的写法示例：`56 = spacingHorizontalXXXL(32) + spacingHorizontalXXL(24)`；
  `48 = LIST_ROW_HEIGHT 44 + spacingVerticalXS 4`；禁止直接写 `56px` 而不给出处。
