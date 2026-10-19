# 字号与间距系统审计（REPORT-TYPE）

> 审计员：type-spacing-auditor（独立审计，不继承旧审计结论）
> 审计对象：`public/plugins/{clock,countdown,pomodoro,sedentary,todo,weather}/src/**`、`public/plugins/_shared/**`、`src/host/**`、`src/styles.css`
> 判定依据：Fluent 2 官方字阶（`references/fluentui-design/typography.md`）+ Fluent v9 token（`node_modules/@fluentui/tokens`）+ 4px spacing ramp + 平板 0.5–2 m 远看场景
> 渲染环境：Microsoft Edge 155.0.4283.62 headless + CDP，Node v24.20.0，viewport deviceScaleFactor=1，dev server `http://localhost:5173/`
> 代码基线：`@fluentui/react-components ^9.74.9`，React 19
> 截图：`shots/audit2/{1440x960,1024x768,960x1440}-*.png`、`shots/audit2/type-host-*.png`

---

## 0. 摘要

### 0.1 一句话结论

字号系统事实上没有统一：六个插件在同一个尺寸档下，Primary（主值）实测从 **12 px 到 68 px**（5.7 倍差距）；天气插件的主温度因为使用了**不存在的 Fluent token**，在所有尺寸下都退化为 **14 px**，比它自己的 7 天高温（16 px）还小；时钟 2×1 主时间只有 **40 px**，而同尺寸番茄钟是 **68 px**。间距值本身都在 4px ramp 上（2/4/8/12/16/20），但**同一语义的 padding/gap 在插件间、尺寸间没有共同的映射规则**：3×2 卡片 padding 同时存在 8、12、16 三种，组间距同时存在 2、4、8、12 四种。

### 0.2 问题统计

| 类别 | 数量 | P0 | P1 | P2 | P3 |
|---|---:|---:|---:|---:|---:|
| F 字号 | 11 | 2 | 5 | 3 | 1 |
| S 间距 | 7 | 0 | 4 | 2 | 1 |
| L 行高/字重/细节 | 7 | 0 | 2 | 2 | 3 |
| X 跨插件/跨尺寸 | 6 | 0 | 5 | 1 | 0 |
| **合计** | **31** | **2** | **16** | **8** | **5** |

严重度定义：P0 = 主信息在目标观看距离不可读/层级倒置；P1 = 同语义跨插件或跨尺寸明显不一致，用户可直接感知；P2 = 行高/间距/字重不统一，影响节奏但不阻断识别；P3 = 细节一致性。

### 0.3 问题清单（摘要）

| ID | 严重度 | 问题 | 实测证据（px / 文件:行） | 建议 |
|---|---|---|---|---|
| F-01 | P0 | 天气主温度没有字号：`fontSizeBase700/800/900` 不是 Fluent token，声明被丢弃，继承 14px | `public/plugins/weather/src/components/Card.jsx:84,89,111,133,160`；2×1/2×2/3×2/4×2 实测均 `14/14 w600`；1×1 `14/14`（1440/960） | 改用 `Text size={900/1000}` 或 `fontSizeHero900/1000`：1×1 40/52；2×1/2×2/3×2/4×2 68/92（2×1 高 <150 时 40/52） |
| F-02 | P0 | 天气主值小于自己的 Secondary/Tertiary：3×2 主温度 14px，7 天高温 16px；4×2 AQI 16px | 3×2 `24° 14/14` vs `26° 16/18.4`；4×2 `24° 14/14` vs AQI `71 16/16.8`（1440） | 主值 68/92（3×2/4×2），日高 16/22，AQI 值 32/40 |
| F-03 | P1 | 时钟 2×1 主时间 40px；同尺寸番茄钟 68px | `ClockApp.jsx:207` `size={large ? 1000 : 900}`；328×152 实测 `40/52 w600`；同尺寸 `pomodoro 68/68`（1440） | 2×1 改 `Text size={1000}`（68/92）；iframe 高 <150 时隐藏日期行 |
| F-04 | P1 | 久坐主值随卡片变大而变小：1×1=40、2×1=28、2×2=28、3×2=32 | `SedentaryApp.jsx:216` `size={compact ? 900 : wide ? 800 : 700}`；实测 40→28→28→32（1440） | 3×2 68/92；2×2/2×1/1×1 40/52 |
| F-05 | P1 | 倒数日 1×1 的 Primary 只有 12px；当天状态没有数字主值 | `CountdownApp.jsx:461-480` 全部 `size={200}`；实测 `countdown-1x1` 字号集合仅 `{12}`，`就是今天` `12/16`（1440） | “今天/还有 N 天”主值 40/52；单位/标题 14/20 |
| F-06 | P1 | 待办元信息 10px，低于 Caption 12px 下限，更低于正文 14px；3×3/4×2 也一样 | `components.jsx:361,370` `size={100}`；`views.jsx:117` `fontSizeBase100`；实测 `18:00 10/14`、月历任务 10px（1440） | 元信息 12/16（`Base200`）；3×3 正文任务 16/22 |
| F-07 | P1 | 待办 2×2/3×2/3×3/4×2 没有单值 Primary，最大文本只有 14px 任务标题 | `TodoApp.jsx:447` 仅 1×1 用 `800`；`components.jsx:554` 标题 `size={300}`；实测 1×1 `32/32`，其余最大 `14/20`（1440） | 任务标题 16/22；组头 14/20 semibold；若保留计数主值，2×2 起用 24/32 |
| F-08 | P2 | 倒数日 3×2 主值 20px，小于 2×1 的 32px（大卡反而小） | `CountdownApp.jsx:265` `size={wide ? 500 : 400}`；实测 3×2 `20/28`、2×1 `32/40`（1440） | 3×2 28/36；2×2 24/32；2×1 40/52 |
| F-09 | P2 | 天气 4×2 的每日高温 14px，小于 3×2 的 16px（大卡反而小） | `forecast.jsx:74` `dayHiLo` `Base300`；`:81` `daySingleTemp` `Base400`；实测 3×2 `16/18.4`、4×2 `14/16.1`（1440） | 两档统一 16/22；低温 14/20 `fg3` |
| F-10 | P2 | 天气城市/高低温 12px，而时钟日期 14–16px；Secondary 层跨插件差 4px | `Card.jsx:50` city `Base200`、`:101` subMeta `Base200`；实测 city `12/16`，clock date `14/20`（2×1）/`16/22`（3×2） | 城市/高低温 14/20（2×1 高 ≥150 时城市可 12/16）；天气现象 16/22 |
| F-11 | P3 | 时钟 1×1 与 2×1 都是 40px，尺寸升级没有字号台阶 | `ClockApp.jsx:207`；实测 152×152 与 328×152 均 `40/52`（1440） | 2×1 68/92；1×1 保留 40/52 |
| S-01 | P1 | 天气 1×1 卡片 padding 只有 4px，其他插件 1×1 是 8px | `Card.jsx:45` `pad1: spacingVerticalXS`；实测 `4px 4px 4px 4px`，内容框 152×152（1440） | 1×1 统一 `spacingHorizontalS`（8） |
| S-02 | P1 | 待办所有尺寸固定 8px padding；3×3（504px）也只有 8px，明显过挤 | `TodoApp.jsx:89` `padding: spacingVerticalS`；实测 2×2/3×2/3×3/4×2 均 `8px`，仅 1×1 走 `rootSummary` 的 12px（1440） | 2×2/3×2/4×2 12；3×3 16；1×1 统一 8 |
| S-03 | P1 | 同一 3×2 档卡片 padding 有 8/12/16 三种 | 实测 3×2：clock 16、countdown 16、pomodoro 16、sedentary 16、todo 8、weather 12/16（1440） | 3×2/4×2 统一 `12 vertical / 16 horizontal` |
| S-04 | P1 | 同一 3×2 档组间距从 2 到 12px，列表行间距 0–2px，远看会粘连 | 实测 3×2 gap：clock 12、countdown 8、pomodoro 8、sedentary 4、todo 2、weather 4；countdown list gap 0（`CountdownApp.jsx:164`）、todo list gap 2（`TodoApp.jsx:130`） | 组间 8（2×2/3×2/4×2）、12（3×3）、4（1×1/2×1）；列表行间 4；禁止 0/2 作为内容行距 |
| S-05 | P2 | 图标与文字距离不统一：2/8/12px 混用 | weather `heroMeta gap 2`（`Card.jsx:137`）、`currentRow gap 8`（`:110`）、`currentHero gap 12`（`:129`）；pomodoro badge-time 8（`:99`）；sedentary badge-number 8（`:81`） | 20–24px 图标用 8；≥32px 图标用 12 |
| S-06 | P2 | 统计/分栏组间距：久坐统计 20px、番茄分栏 20px、待办分栏 8px（同语义差 2.5 倍） | `SedentaryApp.jsx:101` `spacingHorizontalXL`；`PomodoroApp.jsx:123` `XL`；`TodoApp.jsx:145` `S`（8） | 统计组间 20；组内 8；分栏列间 12 |
| S-07 | P3 | 宿主 6px 内衬 + 插件 padding 形成双层内边距，各插件视觉留白被放大且不一致 | `WidgetCard.tsx:167` `padding: spacingHorizontalSNudge`（6）；1×1 总留白 weather 4+6=10，clock 8+6=14（1440） | 保留 6px 宿主内衬；插件 padding 按本报告表执行，统一按 iframe 内沿计 |
| L-01 | P1 | 主值 `lineHeight: 1`，行高塌陷：68/68、40/40、32/32、14/14，偏离 Fluent 68/92、40/52、32/40、14/20 | `PomodoroApp.jsx:93,158`；`SedentaryApp.jsx:87`；`TodoApp.jsx:447`；`weather/Card.jsx:80`、`atoms.jsx:19`；实测值见 §3.3 | 删除 `lineHeight: 1`，改用 `lineHeightHero*`/`lineHeightBase*` |
| L-02 | P1 | 天气行高错配：日高温 16/18.4（1.15），逐时标签 10/20（2.0），日标签 12/20 | `forecast.jsx:77` `lineHeight: 1.15`；`hourLabel` 无行高（`:29-34`）继承 20；`dayLabel` 无行高（`:68-72`）；实测 3×2 `16/18.4`、2×2 `10/20`、3×2 `12/20` | 16/22、12/16、12/16；删除局部 1.15 |
| L-03 | P2 | 同一语义字重不一致：天气日高 3×2 是 600，4×2 是 400 | `forecast.jsx:81` 600 vs `:74` 400；实测 3×2 `26° w600`、4×2 `26° w400`（1440） | 列表值统一 600；正文 400 |
| L-04 | P2 | 颜色承担层级：倒数日主值用 `colorPaletteRedForeground1` 等，而 DENSITY 规定 Primary 用 `fg1` | `CountdownApp.jsx:267` `tokens[colorTokenOf(...)]`；实测主值 `rgb(227,125,128)`（red），其他插件主值 `rgb(255,255,255)` | 主值 `fg1`；颜色只作状态（今天/逾期），不替代字号层级 |
| L-05 | P3 | 数字未使用 Fluent 的 numeric 字体族（Bahnschrift），只用了 `tabular-nums` | `Text` 的 `font="numeric"` 全项目 0 次；仅 clock/pomodoro/sedentary/countdown/weather 用 `fontVariantNumeric` | 数字主值统一 `font="numeric"` 或保留 tabular-nums + 同一字体族 |
| L-06 | P3 | 宿主 body 用 `Segoe UI Variable Display`，Fluent 组件用 `fontFamilyBase`（Segoe UI），两套字体栈 | `src/styles.css:15`；插件实测 fontFamily 为 `"Segoe UI", ...`（headless 结果） | 项目级统一 `fontFamilyBase`；如要 Variable，显式覆写 Fluent token 一处 |
| L-07 | P3 | 仅天气主值有 `letter-spacing: -0.02em`，其他数字主值没有 | `weather/atoms.jsx:20`；clock/pomodoro/sedentary 无 letterSpacing | 要么全删除，要么 ≥40px 数字统一 -0.01em |
| X-01 | P1 | 1×1 Primary 跨插件 12/14/32/40px（4 种） | 1440 实测：countdown 12、weather 14、todo 32、clock/pomodoro/sedentary 40 | 统一 40/52；列表型内容另列 |
| X-02 | P1 | 2×1 Primary 跨插件 14/28/32/40/68px（5 种） | 1440 实测：weather 14、sedentary 28、countdown 32、clock 40、pomodoro 68 | 单值卡 68/92；列表卡 40/52 |
| X-03 | P1 | 3×2 Primary 跨插件 14/20/32/68px（4 种） | 1440 实测：weather 14、countdown 20、sedentary 32、clock/pomodoro 68 | 单值卡 68/92；列表卡 28/36 |
| X-04 | P1 | 同插件不同尺寸却同字号：weather 全部 14；pomodoro 2×1/2×2/3×2 都 68；todo 非 1×1 都 14；clock 1×1/2×1 都 40 | 1440 矩阵 §2.2；如 weather `1x1..4x2` 全 `14/14`，pomodoro `2x1=2x2=3x2=68/68` | 按 §4.2 档位表逐档设值，而不是只改布局 |
| X-05 | P1 | 大卡反而小字：weather 4×2 日高 14 < 3×2 16；countdown 3×2 主值 20 < 2×1 32；sedentary 3×2 32 < 1×1 40 | 见 F-04/F-08/F-09 实测 | 主值随面积单调不降；§4.2 已给出单调表 |
| X-06 | P2 | 规范与实现冲突：DENSITY 规定 Primary `Base500/600`（20/24），实际主值 28/32/40/68；DESIGN 要求按视口 clamp，实测三个视口字号完全不变 | `docs/DENSITY.md:28`；`docs/DESIGN.md:39`；实测 164/154/143 cell 下 clock 2×1 均 40、weather 均 14 | 以 §4.1 语义表为准；更新 DENSITY/DESIGN 的旧表述 |

### 0.4 对旧审计与现行文档的核验

`docs/FLUENT2.md:169` 写着“插件内字号未统一走 type ramp …… 已修（G2）：…… 由组件默认字阶保证”。**实测不成立**：

- 天气 3×2 主温度 `14/14`，7 天高温 `16/18.4`；主值比次值小，且 14px 不在主值应处的 28–68 区间。
- 时钟 2×1 主时间 `40/52`，同尺寸番茄钟 `68/68`。
- 6 个插件在 3×2 档的主值有 4 种字号（14/20/32/68）。

旧审计 `docs/audit/AUDIT.md` 只作为线索；本报告的所有 px 值来自本轮 headless Edge 实测与代码逐行核对，不复用旧审计数字。

---

## 1. 方法与样本

### 1.1 真实渲染尺寸（实测，不是估算）

宿主网格：`GRID_GAP=12`、`GRID_PADDING=20`、`96≤cell≤220`（`src/host/layout/breakpoints.ts:18-25`）。卡片外框 = `w*cell+(w-1)*12`，iframe 视口 = 卡片 − 2×6px 宿主内衬（`WidgetCard.tsx:167`）。

| 视口 | 列×行 | cell | 1×1 卡片/iframe | 2×1 | 2×2 | 3×2 | 3×3 | 4×2 |
|---|---:|---:|---|---|---|---|---|---|
| 1440×960 | 8×5 | 164 | 164 / **152** | 340×164 / **328×152** | 340×340 / **328×328** | 516×340 / **504×328** | 516×516 / **504×504** | 692×340 / **680×328** |
| 1024×768 | 6×4 | 154 | 154 / **142** | 320×154 / **308×142** | 320×320 / **308×308** | 486×320 / **474×308** | 486×486 / **474×474** | 652×320 / **640×308** |
| 960×1440 | 6×9 | 143 | 143 / **131** | 298×143 / **286×131** | 298×298 / **286×286** | 453×298 / **441×286** | 453×453 / **441×441** | 608×298 / **596×286** |

> 注：任务说明里“1024/960 下 cell 约 100–130px”与实测不符；实测为 154/143px（受 96–220 夹取与 20px 页边距影响）。本报告全部按实测值。

### 1.2 测量方法

1. **代码侧**：递归读取 `public/plugins/*/src/**`、`src/host/**`、`src/styles.css`、`*.css`，正则抽取 `tokens.*`、`fontSize/lineHeight/fontWeight`、`padding/gap/margin`；把 `tokens.*` 与 `@fluentui/tokens` 实际导出的 467 个 token 键比对，找出“静默失效 token”。
2. **渲染侧**：headless Edge + CDP。由于宿主当前存在“首次 reconcile 早于插件目录加载，忽略已存布局”的行为（见 §1.4），直接改 `wtsl.layout` 会被宿主覆盖；改用**独立 iframe harness**：在宿主页面内创建 25 个 iframe，按上表精确设置 iframe 宽高，向每个 iframe 发送与宿主同形的 `host:init`（`{size,theme,config}`）并回复 `plugin:call`，等所有插件渲染稳定后，用 `Runtime.evaluate` 读取 `getComputedStyle`。
3. **真实宿主复核**：用同一 headless 实例加载真实桌面，确认卡片/iframe 尺寸（340×164→328×152 等）与 harness 一致，并截图。
4. **稳定性**：每个视口先等所有 iframe 根节点有内容，再重复 post init 6–8 秒；对 weather 逐例检查 `°` 出现、clock 3×2 主值 ≥60px、todo 1×1 ≥30px；仍不满足则再补发并等待。两次 dump 间隔 1s，取第二次。

### 1.3 数据文件

- 原始数据（临时，不纳入交付）：`%TEMP%\audit-typography\raw\harness-{1440x960,1024x768,960x1440}.json`
- 语义矩阵：`%TEMP%\audit-typography\analysis-rows.json`、`matrix.md`、`matrix-extra.md`
- 宿主复核：`%TEMP%\audit-typography\host-measure.json`
- 截图：`shots/audit2/`（24 张分区尺寸图 + 3 张真实桌面图 `type-host-*.png`）

### 1.4 测量限制（如实记录）

- harness 是“受控宿主”，不是真实设置的完整链路：`getConfig` 由本地每例配置直接回复，避免多实例互相污染；因此 weather 的 no-key/loading 态不应出现。但 weather 1×1（1024）与 2×2（960）两次截图仍落入“未配置 Key”态（16px 状态标题、12px 说明），该两格的主值用同插件相邻尺寸/代码目标值补齐，不作为唯一证据。
- 真实宿主中 todo 数据来自 localStorage（本轮真实桌面为空态），harness 中注入 6 条任务；字号结论不受任务内容影响。
- 实测量的是 CSS px；设备 DPR=2 时物理像素翻倍，但 CSS 字号规则不变。

---

## 2. 现状取证

### 2.1 代码侧

#### 2.1.1 字号实现机制分布

| 插件 | `Text size` prop（Fluent 字阶） | makeStyles 覆写 | 行高覆写 | CSS 字号 |
|---|---|---|---|---|
| clock | `1000/900`（时间）、`400/300`（秒/日期）— `ClockApp.jsx:207,211,222` | 无 | 无 | 无 |
| countdown | `900/800/500/400/300/200` — `CountdownApp.jsx:260,265,383,419,422,461-480,495-505` | 无 | `singleDays lineHeight:1`（`:207`） | 无 |
| pomodoro | `1000/900/400/300/200` — `PomodoroApp.jsx:368,371,375,399,434,440,480,518,542,546` | 无 | `time/immersiveTime lineHeight:1`（`:93,158`） | 无 |
| sedentary | `900/800/700`（主值）、`300/200`（单位/统计）— `SedentaryApp.jsx:216,219,239-251,317,348,387` | 无 | `number lineHeight:1`（`:87`） | 无 |
| todo | `800/900`（`textSizeFor`）、`500/400/300/200/100` — `TodoApp.jsx:447,450,456,474-478`；`components.jsx:323,341,345,361,370,552-554,588,606`；`views.jsx:502-570` | `weekTask Base200`、`monthTask Base100`（`components.jsx:252,283`；`views.jsx:85,117`） | 主值 `lineHeight:1`（`TodoApp.jsx:447`） | 无 |
| weather | 卡片无 `Text`；卡片文本全部是 `span` + makeStyles | `city Base200`、`temp1 Base700`、`temp2 Base800`、`temp22/hero/42 Base900`、`condition Base300`、`subMeta Base200`（`Card.jsx:48-50,84,89,90,101,111,113,133,160,183,185,192`）；逐时/7 天 `Base100/200/300/400`（`forecast.jsx:30,36,69,74,81,118,123,128`） | `tempBase 1`、`dayHiLo 1.15`、`ringCenter 1.05`、`atoms temp 1`（`Card.jsx:80`、`forecast.jsx:77,115`、`atoms.jsx:19`） | 无 |
| host | `Text size={200}`（编辑标题）、`size={300}`（页面文本）等 | `desktop.styles.ts:212,246` 12px（toolbar/indicator） | `MessageContent` token 行高 | `styles.css` 只设 font-family |

**结论**：字号来源不是“CSS 乱写”，而是三种机制并存：

- `Text size` 走 Fluent 字阶（clock/countdown/pomodoro/sedentary/todo 大部分）；
- `makeStyles({ fontSize: tokens.* })` 直接覆写（weather 卡片、todo 周/月视图、宿主局部）；
- 少量 `fontSize` 是**无效 token**（weather），声明被 Griffel 丢弃，实际继承父级字号。

#### 2.1.2 代码中的实际字号/间距值

| 插件 | 主值代码表达式 → 实测 | Secondary/标签代码 → 实测 | 间距代码 → 实测 |
|---|---|---|---|
| clock | `Text size={large ? 1000 : 900}` → 3×2 68/92、1×1/2×1 40/52（`ClockApp.jsx:207`） | 秒 `400/300` → 16/14；日期 `400/300` → 16/14（`:211,222`） | 根 `padding M/L/S` → 12/16/8；gap `S/M/XS` → 8/12/4（`:46-63`） |
| countdown | `Text size={900/800/500/400}` → 40/32/20/16（`:467,500,265,260`） | 标题 `400` → 16；1×1 标签/标题 `200` → 12（`:461-480`） | 根 8/12/16；list gap 0；row pad 4/8（`:121-174`） |
| pomodoro | `Text size={1000/900}` → 68/40（`:434,480,518,542`） | 任务 `300` → 14；Badge `large` → 12/16（`:440,546,349-355`） | 根 8/12/16；compact gap 2；wide row/col 8/20（`:69-124`） |
| sedentary | `Text size={900/800/700}` → 40/32/28（`:216`） | 单位/提示 `300/200` → 14/12；统计值 `300` → 14（`:219,317,348,387,242,250`） | 根 8/12/16；stats gap 20（`:65-101`） |
| todo | `textSizeFor(config,800)` → 32/40（`TodoApp.jsx:447`）；任务 `300` → 14（`components.jsx:554`） | 组头/计数 `200` → 12；元信息 `100` → 10（`components.jsx:341,345,361,370`） | 根 8（1×1 12）；清单 gap 2；宽栏 gap 8（`TodoApp.jsx:89,95,130,145`） |
| weather | `fontSizeBase700/800/900` → **undefined → 继承 14/14**（`Card.jsx:84,89,111,133,160`） | 城市 `Base200` → 12；现象 `Base300` → 14；逐时标签 `Base100` → 10；日高 `Base300/400` → 14/16（`Card.jsx:50,90,101,113`；`forecast.jsx:30,69,74,81`） | 1×1 4；2×1/2×2 8v/12h；3×2/4×2 12v/16h（`Card.jsx:45-48`） |

#### 2.1.3 无效 token（静默失效，最严重）

`@fluentui/tokens` 的 fontSize 实际只有 10 个键：

```
fontSizeBase100 10 / Base200 12 / Base300 14 / Base400 16 / Base500 20 / Base600 24
fontSizeHero700 28 / Hero800 32 / Hero900 40 / Hero1000 68
```

**不存在** `fontSizeBase700/800/900/1000`。代码中：

| 文件:行 | 写法 | 实际结果 |
|---|---|---|
| `public/plugins/weather/src/components/Card.jsx:84` | `temp1: { fontSize: tokens.fontSizeBase700 }` | `undefined` → 无 font-size 声明 |
| 同上 `:89` | `temp2: { fontSize: tokens.fontSizeBase800 }` | 同上 |
| 同上 `:111` | `temp22: { fontSize: tokens.fontSizeBase900 }` | 同上 |
| 同上 `:133` | `tempHero: { fontSize: tokens.fontSizeBase900 }` | 同上 |
| 同上 `:160` | `temp42: { fontSize: tokens.fontSizeBase900 }` | 同上 |
| `public/plugins/pomodoro/src/PomodoroApp.jsx:57` | `colorStatusInfoForeground1` | 颜色 token 也不存在（跨域问题，记录） |

构建产物 `public/plugins/weather/app/app.js` 里同样保留 `temp2: { fontSize: Y.fontSizeBase800 }`，说明不是“源码没构建”，而是源码本身写错。

#### 2.1.4 行高覆写清单

| 文件:行 | 写法 | 计算后的行高 |
|---|---|---|
| `pomodoro/PomodoroApp.jsx:93` | `time: { lineHeight: 1 }` | 68/68、40/40 |
| `pomodoro/PomodoroApp.jsx:158` | `immersiveTime: { lineHeight: 1 }` | 同上 |
| `sedentary/SedentaryApp.jsx:87` | `number: { lineHeight: 1 }` | 40/40、32/32、28/28 |
| `todo/TodoApp.jsx:447` | `style={{ lineHeight: 1 }}` | 32/32 |
| `weather/Card.jsx:80` | `tempBase: { lineHeight: 1 }` | 14/14（因为字号本身丢失） |
| `weather/atoms.jsx:19` | `temp: { lineHeight: 1 }` | 同上 |
| `weather/forecast.jsx:77` | `dayHiLo: { lineHeight: 1.15 }` | 16/18.4、14/16.1 |
| `weather/forecast.jsx:115` | `ringCenter: { lineHeight: 1.05 }` | AQI 中心 |
| `weather/atoms.jsx:47-48` | `lineHeightBase100 / fontSizeBase100` | 10/14（演示徽章） |
| `countdown/CountdownApp.jsx:207` | `singleDays: { lineHeight: 1 }` | 32/32（当天/数字） |

#### 2.1.5 间距值扫描

- 所有 `padding/gap/margin` 都来自 `tokens.spacing*`；没有发现字号式的“无效 spacing token”。
- 唯二字面量是非内容装饰：`minHeight: '40px'`（触控目标）、`height: '36px'`（分钟降水条）、`gap: '2px'`（`weather/views/panels.jsx:98`，详情页，不在卡片正常态）。
- 因此间距问题不是“用了魔法数”，而是**同一语义没有同一个 token 映射**；详见 §3.4。

### 2.2 渲染侧：语义元素 × 插件 × 尺寸字号矩阵（1440×960，CSS px）

色角色：`fg1=colorNeutralForeground1`（#ffffff）、`fg2=NeutralForeground2`（#d6d6d6）、`fg3=NeutralForeground3`（#adadad）、`fg4=NeutralForeground4`（#999999）。格式：`字号/行高 字重 色角色`。

| 插件 | 尺寸 | iframe | Primary | Secondary | Tertiary | 卡内 padding | gap |
|---|---|---|---:|---|---|---|---|
| clock | 1×1 | 152×152 | 11:25 `40/52 600 fg1` | — | — | 8 | 4 |
| clock | 2×1 | 328×152 | 11:25 `40/52 600 fg1` | 日期 `14/20 400 fg2` | 秒 `14/20 400 fg3` | 12 | 4 |
| clock | 3×2 | 504×328 | 11:25 `68/92 600 fg1` | 日期 `16/22 400 fg2` | 秒 `16/22 400 fg3` | 16 | 12 |
| countdown | 1×1 | 152×152 | 就是今天 `12/16 400 fg3` | 产品发布 `12/16 400 fg2` | — | 8 | 0 |
| countdown | 2×1 | 328×152 | 今天 `32/40 600 paletteRed` | 产品发布 `16/22 400 fg2` | — | 12 | 4 |
| countdown | 2×2 | 328×328 | 今天 `16/22 600 paletteRed` | 产品发布 `14/20 400 fg2` | — | 12 | 4 |
| countdown | 3×2 | 504×328 | 还有 12 天 `20/28 600 paletteRed` | 项目终期评审会 `16/22 400 fg2` | 倒数日 `20/28 600 fg1` / 5 项 `12/16 400 fg3` | 16 | 8 |
| pomodoro | 1×1 | 152×152 | 25:00 `40/40 600 fg1` | — | 专注 Badge `12/16 600 brand` | 8 | 2 |
| pomodoro | 2×1 | 328×152 | 25:00 `68/68 600 fg1` | — | 专注 `12/16 600 brand` | 12 | 12 |
| pomodoro | 2×2 | 328×328 | 25:00 `68/68 600 fg1` | 未关联任务 `14/20 400 fg2` | 专注 `12/16 600 brand` | 12 | 4 |
| pomodoro | 3×2 | 504×328 | 25:00 `68/68 600 fg1` | 未关联任务 `14/20 400 fg2` | 专注 `12/16 600 brand` | 16 | 8 |
| sedentary | 1×1 | 152×152 | 0 `40/40 600 fg1` | 分钟 `14/20 400 fg3` | — | 8 | 4 |
| sedentary | 2×1 | 328×152 | 0 `28/28 600 fg1` | 分钟 `12/16 400 fg3` | 刚起身… `12/16 400 fg3` | 8 | 4 |
| sedentary | 2×2 | 328×328 | 0 `28/28 600 fg1` | 刚起身… `14/20 400 fg2` | 今日久坐 `12/16 400 fg3` / 0 分钟 `14/20 600 fg2` | 12 | 4 |
| sedentary | 3×2 | 504×328 | 0 `32/32 600 fg1` | 刚起身… `14/20 400 fg3` | 今日久坐 `12/16 400 fg3` / 0 分钟 `14/20 600 fg2` | 16 | 4 |
| todo | 1×1 | 152×152 | 5 `32/32 600 fg1` | 整理季度汇报材料 `12/16 400 fg2` | 未完成 · 今日 2 `12/16 400 fg3` | 12 | 2 |
| todo | 2×2 | 328×328 | —（无单值主值） | 整理季度汇报材料 `14/20 400 fg2` | 18:00 `10/14 400 fg3` | 8 | 2 |
| todo | 3×2 | 504×328 | — | 整理季度汇报材料 `14/20 400 fg2` | 18:00 `10/14 400 fg3` | 8 | 2 |
| todo | 3×3 | 504×504 | — | 整理季度汇报材料 `14/20 400 fg2` | 18:00 `10/14 400 fg3` | 8 | 2 |
| todo | 4×2 | 680×328 | — | 整理季度汇报材料 `14/20 400 fg2` | 18:00 `10/14 400 fg3` | 8 | 2 |
| weather | 1×1 | 152×152 | 24° `14/14 600 fg1` | — | — | 4 | 4 |
| weather | 2×1 | 328×152 | 24° `14/14 600 fg1` | 雷阵雨 `14/20 400 fg2` | 北京 `12/16 400 fg3` / 26°/15° `12/16 400 fg3` | 8/12 | 4 |
| weather | 2×2 | 328×328 | 24° `14/14 600 fg1` | 雷阵雨 `14/20 400 fg2` | 北京 `12/16 400 fg3` / 现在 `10/20 400 fg3` / 26° `14/20 600 fg1` | 8/12 | 4 |
| weather | 3×2 | 504×328 | 24° `14/14 600 fg1` | 雷阵雨 `14/20 400 fg2` | 今天 `12/20 400 fg3` / 26° `16/18.4 600 fg1` | 12/16 | 4 |
| weather | 4×2 | 680×328 | 24° `14/14 600 fg1` | 雷阵雨 `14/20 400 fg2` | 今天 `12/20 400 fg3` / 26° `14/16.1 400 fg1` / AQI 71 `16/16.8 600 fg1` / AQI `10/10.5 400 fg3` | 12/16 | 4 |

完整 25 行可复现数据见 `%TEMP%\audit-typography\matrix.md`；本文只保留结论所需的值。

### 2.3 三个视口的 Primary 对比（px）

| 插件·尺寸 | 1440×960（cell 164） | 1024×768（cell 154） | 960×1440（cell 143） |
|---|---:|---:|---:|
| clock 1×1 | 40 | 40 | 40 |
| clock 2×1 | 40 | 40 | 40 |
| clock 3×2 | 68 | 68 | 68 |
| countdown 1×1 | 12 | 12 | 12 |
| countdown 2×1 | 32 | 32 | 32 |
| countdown 2×2 | 16 | 16 | 16 |
| countdown 3×2 | 20 | 20 | 20 |
| pomodoro 1×1 | 40 | 40 | 40 |
| pomodoro 2×1 | 68 | 68 | 68 |
| pomodoro 2×2 | 68 | 68 | 68 |
| pomodoro 3×2 | 68 | 68 | 68 |
| sedentary 1×1 | 40 | 40 | 40 |
| sedentary 2×1 | 28 | 28 | 28 |
| sedentary 2×2 | 28 | 28 | 28 |
| sedentary 3×2 | 32 | 32 | 32 |
| todo 1×1 | 32 | 32 | 32 |
| todo 2×2/3×2/3×3/4×2（任务标题） | 14 | 14 | 14 |
| weather 1×1 | 14 | —（no-key 态） | 14 |
| weather 2×1 | 14 | 14 | 14 |
| weather 2×2 | 14 | 14 | —（no-key 态） |
| weather 3×2 | 14 | 14 | 14 |
| weather 4×2 | 14 | 14 | 14 |

**关键事实**：三视口字号完全相同。也就是说，当前插件只按“尺寸档位（1×1/2×1/…）”分支，**没有按实际 cell（164/154/143）做任何字号响应**；天气甚至所有尺寸档都同字号。

### 2.4 字号集合与直方图（1440×960）

| 插件 | 出现过的字号（px） | 说明 |
|---|---|---|
| clock | 14,16,40,68 | 有清晰 14/16/40/68 台阶 |
| countdown | 12,14,16,20,32 | 1×1 仅有 12；2×1 跳到 32；3×2 反落到 20 |
| pomodoro | 12,14,16,40,68 | 主值 40/68，正文 14/16 |
| sedentary | 12,14,16,28,32,40 | 主值 28/32/40 三档且不单调 |
| todo | 10,12,14,32 | 10px 元信息；非 1×1 最大 14 |
| weather | 10,12,14,16 | **没有 20 以上字号**；主值 14 |

---

## 3. 一致性诊断

### 3.1 同一语义层跨插件是否统一？

**Primary（主值）**：

| 尺寸 | clock | countdown | pomodoro | sedentary | todo | weather | 不同值 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1×1 | 40 | 12 | 40 | 40 | 32 | 14 | 4 种 |
| 2×1 | 40 | 32 | 68 | 28 | — | 14 | 5 种 |
| 2×2 | — | 16 | 68 | 28 | 14* | 14 | 4 种 |
| 3×2 | 68 | 20 | 68 | 32 | 14* | 14 | 4 种 |
| 4×2 | — | — | — | — | 14* | 14 | 1 种（同为 14） |

`*` 待办无单值主值，这里取最大文本（任务标题）。即便如此，2×1 仍有 14/28/32/40/68 五种主值，跨插件差异最高 4.9 倍。

**反例清单（文件:行 + 实测 px）**：

1. `weather/Card.jsx:84` 目标 `Base700`（不存在）→ 实测 `14/14`；同尺寸 `pomodoro/PomodoroApp.jsx:434` 的 `Text size={1000}` → `68/68`（3×2，504×328）。差 54px。
2. `countdown/CountdownApp.jsx:461-480` 1×1 全部 `size={200}` → 实测 `12/16`；同尺寸 `clock/ClockApp.jsx:207` → `40/52`；`todo/TodoApp.jsx:447` → `32/32`（152×152）。差 28px。
3. `sedentary/SedentaryApp.jsx:216` 2×1 用 `size={700}` → `28/28`；同尺寸 `clock` `40/52`、`pomodoro` `68/68`、`weather` `14/14`、`countdown` `32/40`（328×152）。5 种值。
4. `weather/Card.jsx:133` 3×2 主值 `14/14`；同尺寸 `clock` `68/92`、`countdown` `20/28`、`sedentary` `32/32`、`todo` 任务 `14/20`（504×328）。
5. `todo/components.jsx:554` 任务标题 `size={300}` → `14/20`；`weather/Card.jsx:50` 城市 `Base200` → `12/16`；`clock` 日期 `16/22`（3×2）。同为 Secondary 层，12/14/16 三值。

**Secondary（次要信息）**：

| 尺寸 | clock | countdown | pomodoro | sedentary | todo | weather | 不同值 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2×1 | 14 | 16 | — | 12 | — | 14 | 3 种 |
| 2×2 | — | 14 | 14 | 14 | 14 | 14 | 1 种 |
| 3×2 | 16 | 16 | 14 | 14 | 14 | 14 | 2 种 |

Secondary 在 2×2 已经收敛到 14；2×1 的 12/14/16 是主要不一致点（sedentary 12 对 countdown 16）。

**Tertiary（第三层/标签/元信息）**：

| 尺寸 | clock | countdown | pomodoro | sedentary | todo | weather | 不同值 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2×1 | 14（秒） | — | 12（Badge） | 12（提示） | — | 12（城市） | 2 种 |
| 2×2 | — | — | 12（Badge） | 12（统计标签） | 10（时间） | 10（逐时标签） | 2 种 |
| 3×2 | 16（秒） | 12（项数） | 12（Badge） | 12（统计标签） | 10（时间） | 12（日标签） | 3 种 |

结论：**Tertiary 没有统一层**。10/12/14/16 四档同时作为“标签/元信息”使用；10px 在 todo 与 weather 内容里出现，已在正文下限之外。

### 3.2 同插件不同尺寸：是在调层级，还是只改布局？

| 插件 | 1×1 | 2×1 | 2×2 | 3×2 | 3×3 | 4×2 | 判定 |
|---|---:|---:|---:|---:|---:|---:|---|
| clock | 40 | 40 | — | 68 | — | — | 1×1/2×1 无台阶；2×1 偏小（用户反馈） |
| countdown | 12 | 32 | 16 | 20 | — | — | 非单调：32→16→20；大卡回落 |
| pomodoro | 40 | 68 | 68 | 68 | — | — | 2×1 起恒定 68；可接受，但 2×1 与 clock 冲突 |
| sedentary | 40 | 28 | 28 | 32 | — | — | **倒置**：1×1 最大、2×1/2×2 最小、3×2 回升 |
| todo | 32 | — | 14* | 14* | 14* | 14* | 1×1 有主值，其余全 14；没有随尺寸调层级 |
| weather | 14 | 14 | 14 | 14 | — | 14 | 完全不变；尺寸只改布局 |

结论：除 clock 3×2、countdown 2×1 外，**大部分插件只在 1×1 与“其他尺寸”之间切换布局**，没有建立“尺寸越大、主值越大”的单调层级；sedentary 与 countdown 还出现反向。

### 3.3 行高、字重、tabular-nums、单位/空格

**行高（实测，primary/secondary）**：

| 语义 | 实测 | Fluent 应然 | 偏差 |
|---|---|---|---|
| clock 1×1/2×1 | 40/52 | Hero900 40/52 | 0 |
| clock 3×2 | 68/92 | Hero1000 68/92 | 0 |
| countdown 2×1 | 32/40 | Hero800 32/40 | 0 |
| countdown 2×2 | 16/22 | Base400 16/22 | 0 |
| countdown 3×2 | 20/28 | Base500 20/28 | 0 |
| pomodoro 1×1 | 40/40 | Hero900 40/52 | **−12px** |
| pomodoro 2×1/2×2/3×2 | 68/68 | Hero1000 68/92 | **−24px** |
| sedentary 1×1 | 40/40 | 40/52 | −12 |
| sedentary 2×1/2×2 | 28/28 | Hero700 28/36 | −8 |
| sedentary 3×2 | 32/32 | Hero800 32/40 | −8 |
| todo 1×1 | 32/32 | 32/40 | −8 |
| weather 主值 | 14/14 | 无（应为 40/52 或 68/92） | 字号与行高同时丢 |
| weather 日高 3×2 | 16/18.4 | 16/22 | −3.6 |
| weather 逐时标签 2×2 | 10/20 | 12/16 | 字号 −2，行高 +4（比字号大 2 倍） |
| weather 日标签 3×2 | 12/20 | 12/16 | 行高 +4 |

**字重**：

- 所有主值都是 600（semibold），与 Fluent 的 LargeTitle/Title 一致。
- 天气 3×2 日高 `26° w600`，4×2 日高/日低 `26° w400`、`15° w400`；同一语义跨尺寸不同字重（`forecast.jsx:81` vs `:74`）。
- 待办任务标题 400、组头 600、元信息 400；同一行内 400 + 400 + 600 混排，层级靠字号而非字重，尚可。

**tabular-nums**：

- clock `numeric`（`ClockApp.jsx:71`）、pomodoro `time`（`:92`）、sedentary `number`（`:86`）、countdown `rowDays/singleDays`（`:191,206`）、todo `listCount`/`meta`（`TodoApp.jsx:123`、`components.jsx:135`）、weather temp/hilo/hour/day/AQI（`atoms.jsx:17,30`；`forecast.jsx:32,39,75,120`）均设置。
- 覆盖基本完整；唯一系统性缺口是**数字字体族**：全项目 `Text font="numeric"` 0 次，仍用 Segoe UI 的比例数字 + `tabular-nums`。不是硬缺陷，列为 P3。

**颜色角色**：

- 主值：clock/pomodoro/sedentary/todo/weather 均 `fg1`（#ffffff）；countdown 主值用 `colorPaletteRedForeground1`/`colorPaletteGreenForeground1` 等（`CountdownApp.jsx:267`），实测 `rgb(227,125,128)`，与其他主值不一致。
- Secondary：clock 日期 `fg2`；weather 现象 `fg2`；countdown 标题 `fg2`；sedentary 提示在 2×2/3×2 是 `fg3`、2×1 是 `fg3`；todo 标题 `fg1`（不是 `fg2`）。
- Tertiary：weather 城市/日标签 `fg3`；todo 元信息 `fg3`；clock 秒 `fg3`；countdown 项数 `fg3`。基本一致，除 todo 标题用了 `fg1`。

**单位/空格**：

- sedentary “0 分钟”“0 次”、countdown “还有 12 天”“5 项”、weather “26° / 15°” 均符合中英文混排空格规则。
- countdown 1×1 把数字与“天”拆成两行（`CountdownApp.jsx:465-477`），不是空格问题，但导致 12px 标签成为唯一主值（F-05）。
- clock 日期 `10月19日 星期一` 无空格，符合中文日期写法；weather 温度 `24°` 不加空格，正确。

### 3.4 间距：是否来自 ramp？各尺寸档 padding 是否一样？

**实测 padding/gap（1440×960）**：

| 插件·尺寸 | padding（上/右/下/左） | gap | 备注 |
|---|---|---|---|
| clock 1×1 | 8/8/8/8 | 4 | 8=S |
| clock 2×1 | 12/12/12/12 | 4 | 12=M |
| clock 3×2 | 16/16/16/16 | 12 | 16=L |
| countdown 1×1 | 8/8/8/8 | 0 | gap 0 不好 |
| countdown 2×1 | 12/12/12/12 | 4 | |
| countdown 2×2 | 12/12/12/12 | 4 | |
| countdown 3×2 | 16/16/16/16 | 8 | |
| pomodoro 1×1 | 8/8/8/8 | 2 | gap 2 太小 |
| pomodoro 2×1 | 12/12/12/12 | 12 | gap 12 过大（行式布局） |
| pomodoro 2×2 | 12/12/12/12 | 4 | |
| pomodoro 3×2 | 16/16/16/16 | 8 | |
| sedentary 1×1 | 8/8/8/8 | 4 | |
| sedentary 2×1 | 8/8/8/8 | 4 | 比 clock/countdown/pomodoro 少 4 |
| sedentary 2×2 | 12/12/12/12 | 4 | |
| sedentary 3×2 | 16/16/16/16 | 4 | 组间只有 4（其他 8–12） |
| todo 1×1 | 12/12/12/12 | 2 | 1×1 反而 12 |
| todo 2×2 | 8/8/8/8 | 2 | |
| todo 3×2 | 8/8/8/8 | 2 | |
| todo 3×3 | 8/8/8/8 | 2 | 504px 大卡仍 8 |
| todo 4×2 | 8/8/8/8 | 2 | |
| weather 1×1 | 4/4/4/4 | 4 | 最小 |
| weather 2×1 | 8/12/8/12 | 4 | |
| weather 2×2 | 8/12/8/12 | 4 | |
| weather 3×2 | 12/16/12/16 | 4 | |
| weather 4×2 | 12/16/12/16 | 4 | |

**结论**：

1. 数值本身全部落在 4px ramp（2/4/8/12/16）上，没有 7/9/13 之类魔法数；但**语义映射不统一**。
2. 同一尺寸档的 padding 不一致：1×1 有 4/8/12；2×1 有 8/12；3×2 有 8/12/16；3×3 只有 todo 一处 8。
3. 同一尺寸档的 gap 不一致：3×2 从 2 到 12（6 倍）；列表行距出现 0（countdown）和 2（todo），在 2m 外会并成一条。
4. 大卡没有获得更大留白：todo 3×3 与 2×2 同 8px；weather 1×1 只有 4px，内容几乎贴边。
5. 宿主 6px 内衬使实际视觉留白 = 6 + 插件 padding；1×1 weather 总 10px、clock 总 14px，跨插件观感差 4px。

### 3.5 跨领域问题（记录，不展开）

- 天气详情/设置页也用 makeStyles 字号，但均使用有效 token（`Base100–500`、`Hero700/800`），没有卡片里的无效 token 问题；详情页 AQI 值 `Hero800 32`、标题 `Hero700 28`，相对卡片是另一套层级。
- 宿主右下 dock 按钮 `size="small"`（`src/host/App.tsx:152-163`）实测 `12/16`，低于 14px 正文下限；对 0.5–2m 的台面设备偏小。应改 `size="medium"`（14/20）或显式 `fontSizeBase300`。
- `src/host/desktop/desktop.styles.ts:212,246` 的 toolbar/页码胶囊为 12px；作为非关键 chrome 可保留 12，但与 dock 12 一起形成“宿主全是 12”的观感。
- `docs/DENSITY.md:28` 规定 Primary 用 `fontSizeBase500/600`（20/24），与实际主值 28/32/40/68 冲突；这是规范文本需要更新的地方，不是实现单方面问题（X-06）。

---

## 4. 目标规格（可直接实现）

### 4.1 项目级 typography 语义与 Fluent 映射

所有卡片文本只用下表 10 个语义角色；`Text size` 是 Fluent UI React v9 的 `size` prop，`token` 是 makeStyles 场景应使用的 token。

| 语义 role | Fluent 角色 | Text size | fontSize token | lineHeight token | px / 行高 | 字重 | 颜色 | 用途 |
|---|---|---|---:|---|---|---|---|---|
| `Display` | Display | 1000 | `fontSizeHero1000` | `lineHeightHero1000` | **68 / 92** | 600 | `fg1` | 单值主信息（clock/pomodoro/sedentary/weather 的 3×2 及以上） |
| `Hero` | Large Title | 900 | `fontSizeHero900` | `lineHeightHero900` | **40 / 52** | 600 | `fg1` | 1×1 主值；2×1 列表型主值；weather 2×1/2×2 |
| `Title` | Title 1 | 800 | `fontSizeHero800` | `lineHeightHero800` | **32 / 40** | 600 | `fg1` | 2×1 countdown；todo 1×1；weather AQI 值 |
| `Title2` | Title 2 | 700 | `fontSizeHero700` | `lineHeightHero700` | **28 / 36** | 600 | `fg1` | 3×2 列表型主值（countdown 3×2） |
| `Subtitle` | Title 3 | 600 | `fontSizeBase600` | `lineHeightBase600` | **24 / 32** | 600 | `fg1` | 列表型 2×2/3×2 主值（countdown 2×2） |
| `Subtitle2` | Subtitle 1 | 500 | `fontSizeBase500` | `lineHeightBase500` | **20 / 28** | 600 | `fg1` | 3×2 列表主值/区块标题 |
| `BodyStrong` | Subtitle 2 | 400 | `fontSizeBase400` | `lineHeightBase400` | **16 / 22** | 600 | `fg1`/`fg2` | 列表值、任务标题、天气现象/日高 |
| `Body` | Body 1 | 300 | `fontSizeBase300` | `lineHeightBase300` | **14 / 20** | 400 | `fg2` | 正文、任务标题、城市、单位 |
| `Caption` | Caption 1 | 200 | `fontSizeBase200` | `lineHeightBase200` | **12 / 16** | 400/600 | `fg3` | 标签、元信息、日标签、计数 |
| `Micro` | Caption 2 | 100 | `fontSizeBase100` | `lineHeightBase100` | 10 / 14 | 400 | `fg4` | **仅非内容装饰**（如演示徽章）；卡片内容禁用 |

约束：

- **正文不小于 14px**：`Body` 是最小正文；`Caption` 只用于辅助标签/元信息；`Micro` 不得承载任务时间、城市、逐时标签等需要读取的信息。
- **主值不小于 40px**：所有单值 Primary 在 1×1 用 `Hero` 40/52；2×1 起用 `Display` 68/92 或 `Hero` 40/52（见每插件表）。
- **2×1 的 68px 有条件**：只有“主值 + ≤1 行辅助”时才用 68/92；sedentary 2×1 必须保留提示行，weather 2×1 在 iframe 高 <150 时必须保留城市/现象，这两种情况用 40/52，不算层级不一致。
- **行高必须来自 token**：禁止 `lineHeight: 1 / 1.15 / 1.05`；`lineHeight` 至少为 `fontSize × 1.3`，Fluent 档位本身满足。
- **字重只用 400/600**：主值与列表值 600；正文/标签 400；不用 500/700。
- **颜色只表达层级/状态**：Primary `fg1`；Secondary `fg2`；Tertiary `fg3`；状态色只用于“今天/逾期/预警”等语义，不能替代字号层级。

### 4.2 每插件每尺寸的“字号 + 行高 + 字重 + 颜色”表

格式：`role size/lineheight weight color`。所有 `size`/`lineheight` 都可由 §4.1 的 `Text size` 直接实现。

#### clock

| 尺寸 | Primary | Secondary | Tertiary | padding | gap |
|---|---|---|---|---|---|
| 1×1 | 时间 **Hero 40/52 600 fg1** | 日期隐藏 | 秒隐藏 | 8 | 4 |
| 2×1 | 时间 **Display 68/92 600 fg1** | 日期 `Body 14/20 400 fg2`；秒 `BodyStrong 16/22 400 fg3` | — | 8v / 12h | 4 |
| 3×2 | 时间 **Display 68/92 600 fg1** | 日期 `BodyStrong 16/22 400 fg2`；秒 `Subtitle2 20/28 400 fg3` | — | 12v / 16h | 8 |

实现规则：2×1 的 iframe 高 <150px（1024/960）时隐藏日期行，只保留时间 + 秒，主值仍 68/92；高度足够时显示日期。`1×1` 不显示日期和秒（现行逻辑保持）。

#### countdown

| 尺寸 | Primary | Secondary | Tertiary | padding | gap |
|---|---|---|---|---|---|
| 1×1 | 天数/“今天” **Hero 40/52 600 fg1** | 标题 `Body 14/20 400 fg2`；单位与“还有”合并为同行 `Body 14/20 400 fg3` | — | 8 | 4 |
| 2×1 | 天数 **Hero 40/52 600 fg1** | 标题 `BodyStrong 16/22 400 fg2` | — | 8v / 12h | 4 |
| 2×2 | 天数 **Subtitle 24/32 600 fg1** | 标题 `BodyStrong 16/22 400 fg2` | — | 12 | 4（列表行距） |
| 3×2 | 天数 **Title2 28/36 600 fg1** | 标题 `BodyStrong 16/22 400 fg2`；头部标题 `Subtitle2 20/28 600 fg1`；项数 `Caption 12/16 400 fg3` | — | 12v / 16h | 8 |

颜色：主值统一 `fg1`；“今天”可用 `colorBrandForeground1` 作为状态色，但字号不变。

#### pomodoro

| 尺寸 | Primary | Secondary | Tertiary | padding | gap |
|---|---|---|---|---|---|
| 1×1 | 时间 **Hero 40/52 600 fg1** | — | 阶段 Badge `Caption 12/16 600 brand` | 8 | 4 |
| 2×1 | 时间 **Display 68/92 600 fg1** | — | 阶段 Badge `Caption 12/16 600 brand` | 8v / 12h | 4（高 <150）/ 8（高 ≥150） |
| 2×2 | 时间 **Display 68/92 600 fg1** | 任务 `BodyStrong 16/22 400 fg2` | 阶段 Badge `Caption 12/16 600 brand`；主按钮 `BodyStrong 16/22 600` | 12 | 8 |
| 3×2 | 时间 **Display 68/92 600 fg1** | 任务 `BodyStrong 16/22 400 fg2` | 阶段 Badge `Caption 12/16 600 brand`；主按钮 `BodyStrong 16/22 600` | 12v / 16h | 8 |

删除 `lineHeight: 1`；Badge 的 12/16 保留（它是状态标签，不是主值）。

#### sedentary

| 尺寸 | Primary | Secondary | Tertiary | padding | gap |
|---|---|---|---|---|---|
| 1×1 | 分钟数 **Hero 40/52 600 fg1** | 单位 `Body 14/20 400 fg3`；Badge `Caption 12/16 600` | — | 8 | 4 |
| 2×1 | 分钟数 **Hero 40/52 600 fg1** | 单位 `Body 14/20 400 fg3`；提示 `Body 14/20 400 fg3`；Badge `Caption 12/16 600` | — | 8v / 12h | 4 |
| 2×2 | 分钟数 **Hero 40/52 600 fg1** | 提示 `Body 14/20 400 fg2`；统计标签 `Caption 12/16 400 fg3`；统计值 `BodyStrong 16/22 600 fg2` | 主按钮 `BodyStrong 16/22 600` | 12 | 8 |
| 3×2 | 分钟数 **Display 68/92 600 fg1** | 提示 `Body 14/20 400 fg2`；统计标签 `Caption 12/16 400 fg3`；统计值 `BodyStrong 16/22 600 fg2` | 主按钮 `BodyStrong 16/22 600` | 12v / 16h | 8 |

#### todo

| 尺寸 | Primary | Secondary | Tertiary | padding | gap |
|---|---|---|---|---|---|
| 1×1 | 未完成数 **Hero 40/52 600 fg1** | 标签 `Body 14/20 400 fg3`；首条任务 `Body 14/20 400 fg2` | — | 8 | 4 |
| 2×2 | 无单值主值（列表型） | 任务标题 **BodyStrong 16/22 400 fg2**；列表名 `Body 14/20 400 fg3` | 元信息 `Caption 12/16 400 fg3`；组头 `Body 14/20 600 fg2` | 12 | 8（组间）/4（行间） |
| 3×2 | 同上 | 任务标题 **BodyStrong 16/22 400 fg2**；列表名 `Body 14/20 400 fg3` | 元信息 `Caption 12/16 400 fg3`；组头 `Body 14/20 600 fg2` | 12v / 16h | 8 / 4 |
| 3×3 | 同上 | 任务标题 **BodyStrong 16/22 400 fg2**；组头 `Body 14/20 600 fg2` | 元信息 `Caption 12/16 400 fg3`；tab `Body 14/20` | 16 | 12（组间）/4（行间） |
| 4×2 | 同上 | 任务标题 **BodyStrong 16/22 400 fg2**；分栏标题 `Body 14/20 400 fg3` | 元信息 `Caption 12/16 400 fg3` | 12v / 16h | 8 / 4 |

说明：待办是列表型内容，允许“没有单值 Primary”；但任务标题必须 ≥16/22，元信息必须 ≥12/16，且 3×3 的行距要足以扫读。若产品坚持每卡一个 Primary，可在 2×2 起把“未完成数”做成 24/32 的角标，但不能以牺牲任务标题为代价。

#### weather

| 尺寸 | Primary | Secondary | Tertiary | padding | gap |
|---|---|---|---|---|---|
| 1×1 | 温度 **Hero 40/52 600 fg1** | 城市 `Caption 12/16 400 fg3`；图标 40–48 | — | 8 | 4 |
| 2×1 | 温度 **Display 68/92 600 fg1**（iframe 高 ≥150）；否则 **Hero 40/52** | 高 ≥150：城市 `Caption 12/16 400 fg3`、现象 `BodyStrong 16/22 400 fg2`，隐藏高低温；高 <150：城市 `Body 14/20 400 fg3`、现象 `BodyStrong 16/22 400 fg2`、高低温 `Body 14/20 400 fg3`（高 <140 再隐藏高低温） | — | 8v / 12h | 4（高 ≥150）/ 8（高 <150） |
| 2×2 | 温度 **Display 68/92 600 fg1** | 城市 `Body 14/20 400 fg3`；现象 `BodyStrong 16/22 400 fg2`；高低温 `Body 14/20 400 fg3`；逐时标签 `Caption 12/16 400 fg3`；逐时温度 `BodyStrong 16/22 600 fg1` | — | 12 | 8 |
| 3×2 | 温度 **Display 68/92 600 fg1** | 城市 `Body 14/20 400 fg3`；现象 `BodyStrong 16/22 400 fg2`；高低温 `Body 14/20 400 fg3`；日标签 `Caption 12/16 400 fg3`；日高 `BodyStrong 16/22 600 fg1` | — | 12v / 16h | 8 |
| 4×2 | 温度 **Display 68/92 600 fg1** | 城市 `Body 14/20 400 fg3`；现象 `BodyStrong 16/22 400 fg2`；高低温 `Body 14/20 400 fg3`；AQI 值 `Title 32/40 600 fg1`；AQI 标签 `Caption 12/16 400 fg3`；AQI 类别 `Body 14/20 600` | 日标签 `Caption 12/16 400 fg3`；日高 `BodyStrong 16/22 600 fg1`；日低 `Body 14/20 400 fg3` | 12v / 16h | 8 |

天气是本次改动量最大的插件：把卡片里的 `span + makeStyles` 改成 `Text`（`size={1000/900/400/300/200}`），即可同时修好 F-01、F-02、L-01、L-02，不再依赖手写 `fontSize`。

### 4.3 间距规格（全部用 spacing token）

| 尺寸 | 卡片 padding | 组间 gap | 行间 gap | 图标-文字 | 说明 |
|---|---|---|---|---|---|
| 1×1 | `spacingVerticalS` / `spacingHorizontalS` = **8** | `spacingVerticalXS` = **4** | — | `spacingHorizontalS` = **8** | 最小留白 8，禁止 4 |
| 2×1 | 垂直 `spacingVerticalS` **8** / 水平 `spacingHorizontalM` **12** | `spacingVerticalXS` = **4** | — | `spacingHorizontalS` = **8** | 高度 131 时不再压缩 |
| 2×2 | 四边 `spacingVerticalM` / `spacingHorizontalM` = **12** | `spacingVerticalS` = **8** | `spacingVerticalXS` = **4** | 8（≤24px 图标）/12（≥32px 图标） | 列表行 minHeight 40 |
| 3×2 | 垂直 `spacingVerticalM` **12** / 水平 `spacingHorizontalL` **16** | `spacingVerticalS` = **8** | `spacingVerticalXS` = **4** | 8 / 12 | 统计组间 `spacingHorizontalXL` = 20 |
| 3×3 | 四边 `spacingVerticalL` / `spacingHorizontalL` = **16** | `spacingVerticalM` = **12** | `spacingVerticalXS` = **4** | 8 / 12 | 大卡必须比 2×2 更松 |
| 4×2 | 垂直 `spacingVerticalM` **12** / 水平 `spacingHorizontalL` **16** | `spacingVerticalS` = **8** | `spacingVerticalXS` = **4** | 8 / 12 | 分栏列间 `spacingHorizontalM` = 12 |

补充规则：

- token 对应：**4 = `spacingHorizontalXS`/`spacingVerticalXS`**；**8 = `spacingHorizontalS`/`spacingVerticalS`**；**12 = `spacingHorizontalM`/`spacingVerticalM`**；**16 = `spacingHorizontalL`/`spacingVerticalL`**；**20 = `spacingHorizontalXL`/`spacingVerticalXL`**；**2 = `spacingHorizontalXXS`/`spacingVerticalXXS`**。
- 所有 padding/gap 只能取 **2/4/8/12/16/20/24**；2 仅用于图标光学对齐，不用于内容分组。
- 列表行间距不得为 0/2：统一 4；行高 `minHeight: 40px` 保留（触控目标）。
- 组间距必须大于行间距：组间 8（2×2/3×2/4×2）、12（3×3）、4（1×1、2×1），行间 4。
- 大卡 padding 不得小于小卡：1×1=8、2×1=8/12、2×2=12、3×2=12/16、3×3=16、4×2=12/16，单调不降。
- 宿主 6px 内衬（`WidgetCard.tsx:167`）保持不变；上表是 iframe 内沿的 padding，不要叠加计算。

### 4.4 实现方式（不改业务代码，只给落点）

1. **新增共享语义层**（建议 `public/plugins/_shared/typography.js`）：
   ```js
   export const TYPE = {
     display:  { size: 1000, weight: 'semibold', color: 'colorNeutralForeground1' },
     hero:     { size: 900,  weight: 'semibold', color: 'colorNeutralForeground1' },
     title:    { size: 800,  weight: 'semibold', color: 'colorNeutralForeground1' },
     title2:   { size: 700,  weight: 'semibold', color: 'colorNeutralForeground1' },
     subtitle: { size: 600,  weight: 'semibold', color: 'colorNeutralForeground1' },
     subtitle2:{ size: 500,  weight: 'semibold', color: 'colorNeutralForeground1' },
     bodyStrong:{ size: 400, weight: 'semibold', color: 'colorNeutralForeground1' },
     body:     { size: 300,  weight: 'regular',  color: 'colorNeutralForeground2' },
     caption:  { size: 200,  weight: 'regular',  color: 'colorNeutralForeground3' },
   };
   export const CARD_PADDING = {
     '1x1': { v: 8,  h: 8  },
     '2x1': { v: 8,  h: 12 },
     '2x2': { v: 12, h: 12 },
     '3x2': { v: 12, h: 16 },
     '3x3': { v: 16, h: 16 },
     '4x2': { v: 12, h: 16 },
   };
   ```
2. **天气**：删除 `temp1/temp2/temp22/tempHero/temp42` 的 `fontSize`，改用 `<Text size={...}>`；`tempBase` 只保留 `fontVariantNumeric`，删除 `lineHeight:1`；`cityLine/subMeta` 从 `Base200` 改 `Base300`；`condition` 从 `Base300` 改 `Base400`；`dayHiLo` 删除 `lineHeight:1.15`。
3. **clock/pomodoro/sedentary/todo**：把 `Text size` 按 §4.2 改；删除 `lineHeight:1`；列表/统计间距按 §4.3 改。
4. **响应式**：2×1 的天气/时钟用 iframe 高度媒体查询（`@media (max-height: 149px)`）隐藏最次要行，而不是缩字号；字号档位由尺寸 key 决定。
5. **宿主**：dock 按钮从 `size="small"` 改 `size="medium"`（`src/host/App.tsx:152-163`）；toolbar/页码 12px 可保留为 caption。

---

## 5. 验收标准与检查方法

### 5.1 可脚本化的静态检查

在 `scripts/audit-typography.mjs` 中执行（示意）：

1. **无效 token**：
   - 扫描 `public/plugins/**/src/**`、`src/host/**`，断言 `tokens.fontSizeBase(700|800|900|1000)` 命中数 = 0。
   - 断言 `tokens.colorStatusInfoForeground1` 命中数 = 0（或改为有效 token）。
2. **行高**：
   - 卡片视图文件中 `lineHeight:\s*1([,}\s])` 命中数 = 0。
   - `lineHeight:\s*1\.(0[0-9]|1[0-9]|2[0-9])` 命中数 = 0（禁止 1.05/1.15 等非 token 值）。
3. **字号下限**：
   - 卡片内容中 `fontSize: tokens.fontSizeBase100` 命中数 = 0；`<Text size={100}>` 在卡片视图命中数 = 0（白名单：演示徽章）。
   - 所有 `fontSize` 值 ∈ {10,12,14,16,20,24,28,32,40,68}。
4. **间距**：
   - 所有 `padding/gap/margin` 的 token 值 ∈ {0,2,4,8,12,16,20,24,32}；内容行 gap 不得为 0/2。
   - `CARD_PADDING` 表与 §4.3 完全一致（若落地为共享常量）。
5. **颜色**：
   - 主值不得使用 `colorPalette*`；只允许 `colorNeutralForeground1` 或明确的 `colorBrandForeground1` 状态色。

### 5.2 可脚本化的渲染断言（沿用本次 harness）

对 1440×960、1024×768、960×1440 三个视口、25 个 plugin×size 组合：

1. 读取每个 case 的 Primary/Secondary/Tertiary 的 `fontSize/lineHeight/fontWeight/color`，与 §4.2 表逐项比较，允许误差 0px（CSS px）。
2. 断言 `lineHeight` 等于 `fontSize` 对应的 Fluent token 值（如 68→92、40→52、32→40、16→22、14→20、12→16）。
3. 断言 `Primary.fontSize >= Secondary.fontSize >= Tertiary.fontSize`（列表型 todo 允许无 Primary，但任务标题 ≥16）。
4. 断言所有可见文本 `fontSize >= 12`；卡片正文（任务标题/城市/现象/单位/提示）`fontSize >= 14`。
5. 断言数字主值 `fontVariantNumeric === 'tabular-nums'`。
6. 断言卡内 padding/gap 与 §4.3 一致；组间 gap > 行间 gap。
7. 断言同一尺寸档跨插件的 Primary 只允许：单值卡 68（1×1 或紧凑 2×1 为 40），列表卡 16–28；禁止 12/14 作为主值（todo 列表型无主值时按其任务标题 16 校验）。

### 5.3 视觉验收

- 每个插件至少 1×1、2×1、3×2 三档截图；todo 加 3×3/4×2，weather 加 2×2/4×2。
- 在 0.5m、1m、2m 三个距离看：2m 能读出 Primary；1m 能读出 Secondary；0.5m 不觉得空。
- 同一尺寸档并排看六张卡：主值大小关系符合“单值 68 / 列表 16–28 / 1×1 40”，不能出现一张 12px、一张 68px。

### 5.4 当前值 → 目标值迁移清单

按优先级排序；`→` 左侧是当前实测/代码值，右侧是目标。

| 优先级 | 文件:行 | 当前 | 目标 |
|---|---|---|---|
| P0 | `weather/src/components/Card.jsx:84` | `fontSizeBase700`（undefined → 14/14） | `Text size={900}` 或 `fontSizeHero900` → 40/52 |
| P0 | `weather/src/components/Card.jsx:89` | `fontSizeBase800`（undefined → 14/14） | `Text size={1000}` → 68/92（高 <150 时 900 → 40/52） |
| P0 | `weather/src/components/Card.jsx:111` | `fontSizeBase900`（undefined → 14/14） | `Text size={1000}` → 68/92 |
| P0 | `weather/src/components/Card.jsx:133` | `fontSizeBase900`（undefined → 14/14） | `Text size={1000}` → 68/92 |
| P0 | `weather/src/components/Card.jsx:160` | `fontSizeBase900`（undefined → 14/14） | `Text size={1000}` → 68/92 |
| P0 | `weather/src/components/Card.jsx:80` | `lineHeight: 1` → 14/14 | 删除；使用 `Text` 的 `lineHeightHero*` |
| P1 | `weather/src/components/Card.jsx:45` | `pad1: spacingVerticalXS`（4） | `spacingHorizontalS`（8） |
| P1 | `weather/src/components/Card.jsx:47` | `pad22: 8v/12h` | `12v/12h` |
| P1 | `weather/src/components/Card.jsx:50` | city `Base200` → 12/16 | `Base300` → 14/20 |
| P1 | `weather/src/components/Card.jsx:101` | subMeta `Base200` → 12/16 | `Base300` → 14/20 |
| P1 | `weather/src/components/Card.jsx:90,113` | condition `Base300` → 14/20 | `Base400` → 16/22 |
| P1 | `weather/src/components/forecast.jsx:30` | hourLabel `Base100` → 10/20 | `Base200` + `lineHeightBase200` → 12/16 |
| P1 | `weather/src/components/forecast.jsx:36` | hourTemp `Base300` → 14/20 | `Base400` → 16/22 |
| P1 | `weather/src/components/forecast.jsx:69` | dayLabel `Base200`（12/20） | `Base200` + `lineHeightBase200` → 12/16 |
| P1 | `weather/src/components/forecast.jsx:74,77` | dayHiLo `Base300` + 1.15 → 16/18.4（3×2）、14/16.1（4×2） | `Base400` + `lineHeightBase400` → 16/22；4×2 也 16/22，低温 14/20 |
| P1 | `weather/src/components/forecast.jsx:118` | aqiValue `Base400` → 16/16.8 | `Hero800`（Text 800）→ 32/40 |
| P1 | `weather/src/components/forecast.jsx:123` | aqiLabel `Base100` → 10/10.5 | `Base200` → 12/16 |
| P1 | `weather/src/components/forecast.jsx:128` | aqiCategory `Base200` → 12/20 | `Base300` → 14/20 |
| P1 | `clock/src/ClockApp.jsx:207` | `large ? 1000 : 900` → 1×1=40、2×1=40、3×2=68 | 1×1=900(40)；2×1=1000(68)；3×2=1000(68) |
| P1 | `clock/src/ClockApp.jsx:211,222` | 秒 `400/300`、日期 `400/300` | 2×1 秒 400(16)/日期 300(14)；3×2 秒 500(20)/日期 400(16) |
| P1 | `clock/src/ClockApp.jsx:47` | `padding: spacingHorizontalM`（12，所有尺寸） | 1×1=8；2×1=8v/12h；3×2=12v/16h；gap 3×2=8 |
| P1 | `countdown/src/CountdownApp.jsx:461-480` | 1×1 全部 `size={200}` → 12 | 主值 `size={900}`（40/52）；标题/单位 `size={300}`（14/20） |
| P1 | `countdown/src/CountdownApp.jsx:265` | `wide ? 500 : 400` → 2×2=16、3×2=20 | 2×2=600（24/32）；3×2=700（28/36）；2×1=900（40/52） |
| P1 | `countdown/src/CountdownApp.jsx:164` | list `gap: spacingVerticalNone`（0） | `spacingVerticalXS`（4） |
| P1 | `countdown/src/CountdownApp.jsx:130,134` | 1×1 gap 0、3×2 gap 8 | 1×1 gap 4；3×2 gap 8；2×2 gap 4 |
| P1 | `clock/ClockApp.jsx:46,62`；`pomodoro/PomodoroApp.jsx:69,89`；`sedentary/SedentaryApp.jsx:64`；`countdown/CountdownApp.jsx:121,134`；`todo/TodoApp.jsx:90`；`weather/Card.jsx:37` | 根 gap 2/4/12 混用（1×1 2、2×2 4、3×2 8–12） | 1×1/2×1=4；2×2/3×2/4×2=8；3×3=12 |
| P1 | `sedentary/src/SedentaryApp.jsx:216` | `compact ? 900 : wide ? 800 : 700` → 40/32/28/28 | 1×1/2×1/2×2=900（40/52）；3×2=1000（68/92） |
| P1 | `sedentary/src/SedentaryApp.jsx:219,317,348,387` | 单位/提示 200–300（12/14） | 单位/提示 `size={300}`（14/20）；统计值 `size={400}`（16/22） |
| P1 | `sedentary/src/SedentaryApp.jsx:87` | `lineHeight: 1` → 40/40、32/32、28/28 | 删除；用 `lineHeightHero*`（52/40/36） |
| P1 | `sedentary/src/SedentaryApp.jsx:65,72,76` | pad 8/8/12/16 不统一 | 1×1=8；2×1=8v/12h；2×2=12；3×2=12v/16h |
| P1 | `pomodoro/src/PomodoroApp.jsx:93,158` | `lineHeight: 1` → 68/68、40/40 | 删除；`lineHeightHero1000/900`（92/52） |
| P1 | `pomodoro/src/PomodoroApp.jsx:440,546` | task `size={300}` → 14/20 | `size={400}` → 16/22 |
| P1 | `pomodoro/src/PomodoroApp.jsx:78` | compact gap 2 | `spacingVerticalXS`（4） |
| P1 | `todo/src/TodoApp.jsx:89` | `padding: spacingVerticalS`（8，所有尺寸） | 1×1=12；2×2/3×2/4×2=12；3×3=16 |
| P1 | `todo/src/TodoApp.jsx:130` | list gap 2 | `spacingVerticalXS`（4） |
| P1 | `todo/src/components.jsx:554` | title `size={300}` → 14/20 | `size={400}` → 16/22（全部非 1×1） |
| P1 | `todo/src/components.jsx:361,370` | meta `size={100}` → 10/14 | `size={200}` → 12/16 |
| P1 | `todo/src/components.jsx:341,345` | group label/count `size={200}` → 12/16 | `size={300}` → 14/20（组头 semibold） |
| P1 | `todo/src/views.jsx:117` | monthTask `Base100` → 10/14 | `Base200` → 12/16 |
| P1 | `todo/src/TodoApp.jsx:447` | 1×1 `textSizeFor(config, 800)` → 32/32 | 固定 `size={900}`（40/52）；删除 `lineHeight:1` |
| P1 | `todo/src/TodoApp.jsx:95` | 1×1 pad 12 | 8（与 §4.3 的 1×1 统一） |
| P2 | `todo/src/components.jsx:252` | weekTask `Base200` → 12 | `Base300` → 14（周视图内容） |
| P2 | `weather/src/components/atoms.jsx:19` | `lineHeight: 1` | 删除（随 Text） |
| P2 | `weather/src/components/atoms.jsx:20` | `letterSpacing: '-0.02em'` | 删除或全局 ≥40px 数字统一 -0.01em |
| P2 | `src/host/App.tsx:152-163` | dock Button `size="small"` → 12/16 | `size="medium"` → 14/20 |
| P2 | `src/host/desktop/desktop.styles.ts:212,246` | toolbar/indicator 12px | 保持 12（caption）或改 14（若要跟正文一致） |
| P3 | `src/styles.css:15` | `Segoe UI Variable Display` | 与 Fluent `fontFamilyBase` 统一，或显式覆写 token 一处 |
| P3 | `pomodoro/src/PomodoroApp.jsx:57` | `colorStatusInfoForeground1`（无效） | `colorBrandForeground1` 或有效状态色 |

---

## 6. 附录

### 6.1 无效 token 扫描结果

有效 fontSize 键（10 个）：`fontSizeBase100/200/300/400/500/600`、`fontSizeHero700/800/900/1000`。
无效命中：

| token | 次数 | 位置 |
|---|---:|---|
| `fontSizeBase700` | 1 | `public/plugins/weather/src/components/Card.jsx:84` |
| `fontSizeBase800` | 1 | `public/plugins/weather/src/components/Card.jsx:89` |
| `fontSizeBase900` | 3 | `public/plugins/weather/src/components/Card.jsx:111,133,160` |
| `colorStatusInfoForeground1` | 1 | `public/plugins/pomodoro/src/PomodoroApp.jsx:57` |

### 6.2 字号 token 使用频次（插件+宿主源码）

| token | 次数 |
|---|---:|
| `fontSizeBase100` | 14 |
| `fontSizeBase200` | 30 |
| `fontSizeBase300` | 11 |
| `fontSizeBase400` | 8 |
| `fontSizeBase500` | 1 |
| `fontSizeBase700` | 1（无效） |
| `fontSizeBase800` | 1（无效） |
| `fontSizeBase900` | 3（无效） |
| `fontSizeHero700` | 3 |
| `fontSizeHero800` | 1 |
| `lineHeightBase100` | 1 |
| `lineHeightBase200` | 7 |
| `lineHeightBase300` | 5 |
| `lineHeightBase400` | 1 |
| `lineHeightBase500` | 1 |
| `lineHeightHero700` | 2 |

### 6.3 原始字号字面量扫描

- `fontSize: <数字>`：**0 处**。
- `padding/gap/margin: <数字>`：25 处，均为 `0`/`0 auto`/`minHeight`/`height:36px`/`gap:2px`（详情页装饰）；无字号类魔法数。
- 结论：问题不在“乱写 px”，在“token 名字写错 + 语义映射不统一 + 局部 lineHeight 覆写”。

### 6.4 截图索引

| 文件 | 内容 |
|---|---|
| `shots/audit2/1440x960-clock-{1x1,2x1,3x2}.png` | 时钟三档（2×1 40px 偏小） |
| `shots/audit2/1440x960-weather-{1x1,2x1,3x2}.png` | 天气三档（主温度 14px） |
| `shots/audit2/1440x960-todo-{1x1,3x3}.png` | 待办 1×1/3×3（10px 元信息、3×3 8px padding） |
| `shots/audit2/1024x768-*`、`960x1440-*` | 同一尺寸在更小 cell 下的对照 |
| `shots/audit2/type-host-{1440x960,1024x768,960x1440}.png` | 真实宿主桌面（含 dock 12px） |

### 6.5 复核用原始矩阵文件

- `%TEMP%\audit-typography\matrix.md`：25 行完整语义矩阵（视口/插件/尺寸/iframe/primary/secondary/tertiary/padding/gap）。
- `%TEMP%\audit-typography\matrix-extra.md`：Primary/Secondary 跨尺寸表、字号直方图、行高比 <1.3 清单。
- `%TEMP%\audit-typography\analysis-rows.json`：逐 case 的原始 px/lh/weight/color。
- `%TEMP%\audit-typography\raw\harness-*.json`：25×3 的完整 `getComputedStyle` 原始数据（含每个文本节点）。

---

## 7. 结论（给实现者的最短路径）

1. **先修天气的 5 个无效 token**：`weather/Card.jsx:84,89,111,133,160` 改成 `Text size` 或 `fontSizeHero*`。这一处会把天气主温度从 14px 恢复到 40/68px，是收益最大的单点改动。
2. **再修“大卡小字”的三处倒置**：sedentary（`SedentaryApp.jsx:216`）、countdown（`CountdownApp.jsx:265`）、weather 4×2 日高（`forecast.jsx:74`）。
3. **统一间距映射**：按 §4.3 的 6 档 padding 表替换各插件根节点，优先处理 weather 1×1（4→8）、todo 3×3（8→16）、3×2 的 8/12/16 混用。
4. **删除所有 `lineHeight: 1`**：pomodoro/sedentary/todo/weather 共 6 处；行高回到 Fluent ramp 后，即使用户不改字号，排版也会立刻“像 Fluent”。
5. **最后做字号台阶**：按 §4.2 让主值随尺寸单调（1×1 40 → 2×1 68 → 3×2 68；列表 16→24→28），而不是只切换布局。
