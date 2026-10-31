# 设计决策记录（审计相关）

> 日期：2026-10-19。对应 `docs/audits/round1-fluid-visual/AUDIT.md` 的 P1/P2 处置口径。
> 由 Lead 决策，作为审计复检（task-25）的判定依据。

## D-01 卡片圆角（V-01 / V-02）

- **决策（2026-10-24 更正）**：桌面卡片、页面卡片、弹层卡片统一 **12px**，直接使用 Fluent `tokens.borderRadius2XLarge`（v9 实际值 **12px**）。项目不再定义 `--wtsl-card-radius`。
- 背景：Fluent 2 设计规范圆角表为 Medium 4 / Large 8 / X-Large 12；Fluent UI React v9 的 `borderRadius*` token 实际值为 Medium 4 / Large 6 / X-Large 8 / **2X-Large 12**。旧决策误判「v9 最大只有 8」而自造项目 token，已由独立审计 P0-1 证伪。
- 卡片 12px 用 `borderRadius2XLarge`；**不允许各组件用 calc 再算、也不允许混用 6/8/16/**。
- 文档修订：`FLUENT2.md §5`、`TOKEN-MAP.md §2` 已同步更正。
- 例外：Fluent 自带的 `Dialog` / `DialogSurface` 弹层按 Fluent 组件默认圆角（8px）渲染，不覆写 token；卡片/浮层 surface 用 `borderRadius2XLarge`。
- G2 补充：宿主插件设置/详情浮层（`?view=` 全窗口 Dialog）同样沿 Fluent 默认圆角（8px），已与审计口径对齐。

## D-02 插件控件实现策略（V-03）——已由 D-02b 取代

- ~~**原决策（2026-10-19 早）**：插件运行在 iframe 中，不强制使用 Fluent UI React，只要 token 化 + 四态一致 + 触控 ≥40 即可。~~
- 原决策作废，见 D-02b。

## D-02b 全部插件必须使用 Fluent UI React（取代 D-02）

- **决策（用户 2026-10-19 明确要求）**：**每一个组件都必须基于 Fluent UI React v9**，最严格地满足 Fluent 2 设计规范与官方组件，"设计风格优先于一切"，不为了包体积牺牲一致性。
- 具体：
  1. 六个插件（clock / countdown / pomodoro / sedentary / todo / weather）全部改为 **React + `@fluentui/react-components`** 的 iframe 页面，用 Vite 打包成自包含 ES module（沿用 weather 的 `build.mjs` 模式，产物 `app/app.js` 随 public 进 git）。
  2. 插件内**不再自绘控件**：按钮、菜单、对话框、抽屉、输入、开关、进度条、徽标、提示、骨架、空态、消息条等一律用 Fluent 组件；布局/层级用 `tokens`（spacing、typography、color）与 `makeStyles`。
  3. 插件根节点包 `FluentProvider`，主题由宿主 `host:init/theme` 注入（亮/暗）。
  4. 数据层/业务逻辑（store、api、定时器）可保留为纯 JS 模块，由 React 入口引用。
  5. 包体积不再是约束（每插件约 1MB，可接受）；不为省体积引入手写 HTML 控件。
- **审计口径**：V-03 由「豁免」改回 **P1，必须修复**；V-04/V-05/V-19（插件 token 化）由 React 迁移自然消解，复检时按 Fluent 组件使用率与 token 扫描判定。


## D-03 桌面常驻 dock（V-14）——v0.3.0 起由 D-22 取代（dock 已移除）

> **已被 D-22 取代**：v0.3.0 删除右下角 dock，四个入口收进设置页；桌面只保留 Agent 入口按钮。

- **决策**：保留常驻 dock（Agent / 复盘 / 插件 / 设置），按钮高度 ≥ 40px，不新增与 Agent 悬浮按钮重复的入口。
- 后续可选：收进边缘手势或长按。审计按 P3（产品决策）记录。

## D-04 内容列表与密度预算（V-09）

- **决策**：组件声明的「内容列表」按**行**计为 1 个 Secondary 区块，不逐项累加；但必须遵守行数上限：
  - **公式（2026-10-24 重算，取代“按卡高减工具条”的旧口径）**：`A = Hc − 24 − 8 − (Hf ? 52 + 8 : 0)`，
    `N = min(cap, floor((A + 4) / 48))`，`Hc` 为 iframe 内容框高（已扣卡片 padding 16×2），
    `Hf` 为 countdown featured 的 hero 行高 52；行高 44 + 行距 4 = 48。
  - todo：`2×2` ≤ **5** 行（`Hc=296`、`A=264`，5 行 236、slack 28 = 卡高 8.5%；旧 cap 4 的 slack 76 =
    23.2% > 22%，已作废）、`3×2` ≤ 5、`3×3` ≤ 8（`A=440`，公式 N=9 但 cap 8）、`4×2` 每栏 ≤ 5。
  - countdown：`1×2` ≤ 3（`A=204`，公式 N=4 但 cap 3）、`2×2` ≤ 4、`3×2` ≤ 4、`3×3` ≤ 8（`A=380`，slack 0）。
  - weather：逐时按**列**计，`2×2` 4 列、`3×2` 6 列（`4×2` 的 7 天每行=1 天，不计入 Secondary）。
  - 旧口径「328 卡高 − padding 24 − composer 40 − 组间距 16 = 248」基于已删除的工具条/composer，作废；
    细节与逐档 slack 见 `DENSITY.md §2.2`。
- 文档修订：`DENSITY.md §2` 已补内容列表例外说明。

## D-05 其余 P2 处置

| 项 | 处置 |
|---|---|
| V-06 触控目标 | desktop-core / host-core / agent-core / 插件 owner 统一 **≥44×44**（Fluent `layout.md:57` 的 44×44，与 HIG §6 同值）。宿主与插件 iframe 的 Fluent 内建控件（Switch/Input/Radio/Checkbox/Slider/Dropdown/Button/Tab/MenuItem）统一 `min-height: calc(spacingVerticalXXXL + spacingVerticalM)` = 44（CSS 命中区规则）；`TOUCH_TARGET=44`、`LIST_ROW_HEIGHT=44`、L1 tabs=44。2026-10-24 收口复测：卡片可点元素 0 项 <44 |
| V-10 预警组件 | plugin-weather 改 Fluent MessageBar/Badge |
| V-11 空态死胡同 | countdown / pomodoro / todo 按任务卡补主操作 |
| V-12 久坐重复值 | plugin-pack 改阈值/激励提示 |
| V-13 编辑 chrome 压内容 | desktop-core 加遮罩或顶部让位 |
| V-16 来源重复 / markdown 链接 | agent-core 修 |
| V-17 文案工程术语 | agent-core / plugin-weather / plugin-pack 改用户语言 |
| V-18/V-19/V-20 样式清理 | 宿主归 host-core；插件 hex 兜底归各插件 owner |
| V-21 复盘空态 | host-core 收敛为一个入口 |
| V-22 窄屏断点 | desktop-core 增加 <480 断点；Agent 窄屏全屏化视时间补 |
| V-23 Keyborg 告警 | 随 V-07 一起修 |

## D-06 主题：默认跟随系统亮暗（新增，2026-10-19）

- **决策**：默认 **跟随 Windows 的亮暗模式**（`prefers-color-scheme`），主 host 与六个插件一起切换；设置页「外观 → 配色模式」可固定为深色或亮色，偏好存 `wtsl.themeMode`（`system` / `dark` / `light`）。
- 实现：App 解析偏好 → FluentProvider 切 `webLightTheme` / `webDarkTheme`；`applyColorSchemeToDocument()` 把 `data-theme` 与 `color-scheme` 写到 `<html>/<body>`（壁纸、滚动条、原生控件跟随）；Desktop 从 FluentProvider 实际 CSS 变量读 token，并通过 `host:init` / `host:theme` 注入每个插件 iframe。**换主题时 provider 只更新 CSS 变量、className 不变**，因此桌面层以 App 解析后的 `colorScheme` 作为 effect 依赖重读 token 并下发 `host:theme`（P2：同会话切配色后插件卡要立即跟随，不能等 reload）。
- 插件侧：`public/plugins/_shared/host.js` 的 `useHostTheme()` 在宿主内完全跟随宿主主题；独立打开（开发/截图）时跟随系统 `prefers-color-scheme` 并监听变化。
- 旧值兼容：`dark` / `light` 照旧生效；未设置时按 `system`。
- 插件 SDK：`public/plugin-sdk.js` 记忆最近一次 `host:init/theme/resize` 并在监听注册时补发，避免插件挂载晚于主题消息而停在回退主题（实测出现过亮色系统里部分插件仍深色）。
- 初始值时序（2026-10-20，P1 回归）：`host:init` 在 iframe `onLoad` 后发出，**可能晚于插件 React 首帧**（reload 后实测插件先按默认尺寸/主题渲染）。因此宿主在每次加载的 `init` 后立即补发一次幂等的 `host:resize` / `host:theme`；共享底座 `useHostSize` / `useHostTheme` 同时消费 `init` 与增量消息，保证 reload 后卡片内容与用户保存的尺寸档位、当前主题一致。

## D-07 Display XL：数字型主信息的项目字阶例外（新增，2026-10-19）

> **已作废（2026-10-24，D-36 Equal Except Hue）**：`Display XL`（48/80/96/112）与 `displayXl()` /
> `DISPLAY_XL` 已从 `public/plugins/_shared/typography.js` 删除；所有插件主数字改用 Fluent 官方
> `tokens.fontSizeHero900` / `lineHeightHero900`（40/52），不再有项目级字号例外。以下条文仅作历史记录。

- **背景**：Fluent 2 官方字阶（本地副本 `docs/reference/fluent-design/typography.md`，不入库）与 Fluent UI React v9 token
  （`node_modules/@fluentui/tokens/lib/global/fonts.js`）的最大角色都是 **Display 68px / 92px**
  （`fontSizeHero1000`）。本项目平板常驻桌面、当作台面电子设备使用（0.5–2m 观看），
  墙钟/计时/温度等**纯数字主信息**在 1–1.5m 外需要更大的字，官方 ramp 不提供。
- **决策（用户拍板，选项 B）**：定义项目级 `Display XL` 字阶，**只允许用于数字型主信息**：

  | 档位 | 字号 | 行高 | 典型用途 |
  |---|---|---|---|
  | XL-48 | 48px | 56px | 1×1 / 2×1 单值卡主数字（时钟、计时、久坐、计数、天数） |
  | XL-80 | 80px | 88px | 2×2 单值卡主数字（如久坐分钟数） |
  | XL-96 | 96px | 104px | 3×2 数字主信息（久坐分钟、番茄计时） |
  | XL-112 | 112px | 124px | 3×2 墙钟级 hero（时钟时间） |

- **限制**：不得用于标题、正文、标签、按钮文字；实现统一走 `public/plugins/_shared/typography.js`
  的 `displayXl(size)` / `DISPLAY_XL`，不在组件里裸写数字；行高用该表值，不做 `lineHeight: 1`。
- **文档口径**：`FLUENT2.md §14` 记录为项目偏离项；`DENSITY.md §2.1` 的量化门禁按此执行；
  审计中"超过 68px 即非严格 Fluent 字阶"的结论仍然成立——这是**明确的项目例外**，不是 Fluent 合规范畴。

## D-10 自动定位暂缓（2026-10-19）

> **已被 D-16 取代**：不再使用高德；自动定位改走 ip.cn 网络归属地。

- 现状：卡片已有「自动定位」开关与「使用系统定位」入口，但 Windows Geolocator 在目标环境/大陆网络下不可靠，当前实现常返回空；本轮不改代码，等需求方提供**高德（Amap）API Key** 后再做。
- 方案预定：Windows Geolocator 优先 → 高德 IP 归属地（大陆可用）兜底 → 失败保留上次城市并提示手动搜索；同时让「自动定位」在启动时真正选中定位城市（当前只做位置标记）。
- 本轮 UI 重写（设置/详情浮层）保持自动定位 UI 原样，不做功能改动。

## D-11 设置/详情浮层统一骨架（2026-10-19，已落地）

- 插件浮层视图统一按 `docs/history/OVERLAY-REWRITE-SPEC.md`：**E1 起插件只保留 `?view=detail`**；
  旧的 `?view=settings` 已删除（设置统一由 manifest schema 在宿主设置页渲染），`edit` / `all`
  也已并入详情内的 L2/Tabs。历史写法 `?view=settings|detail|edit|all` 仅见旧文档。
  视图根 padding 24、内容 max-width 720 居中、section 间距 24、设置行 48 / 列表行 44、
  控件 40（Input/Dropdown/Button `size="large"` + Switch/Radio/Slider `min-height: 40`）、
  辅助文字 12、表单正文 14、section 标题 20、无 `Divider` 分组、无 10/11px 与 clamp 字号。
- 浮层标题与关闭按钮只由宿主 Dialog 提供，插件视图内不再画标题栏/关闭按钮。
- 回归入口：`node scripts/verify-overlays.mjs`（E7 起重写为**六插件 × detail 的 6 个视图断言**，
  暗/亮各一遍；E1 之前的 12 个 settings/edit/all 用例已失效）+ `node scripts/shot-host-overlays.mjs`
  （宿主内联调截图，E7 更新为真实路径「点卡 → detail 浮层 → Esc → 焦点归还」）。细节与残留见 `docs/history/OVERLAY-REWRITE-RESULT.md`。
- 宽度口径（E5 复核，2026-10-20）：**表单/设置内容 max-width 720 居中；详情里的列表/统计区可用满宽 834**
  （见 [OVERLAY-REWRITE-SPEC.md](history/OVERLAY-REWRITE-SPEC.md) §2）。组件文档未要求 720 的详情页不强制收窄，
  避免改变列表密度与列对齐。
- 后续新增任何插件浮层视图都按此骨架执行；不再逐页另立规格。

## D-12 三个运行时 bug 的修复口径（2026-10-19，已落地）

1. **浮层关不掉**：根因不是 Dialog 写错，而是卡片长按/桌面滑动在 `pointerdown` 抢指针，
   把 Portal 浮层里按钮的后续事件重定向到桌面。修复口径：所有抢指针的手势入口先做
   `currentTarget.contains(target)` 守卫，Portal 事件不参与桌面手势；不要用排除 data 属性的补丁。
2. **保存后自动关闭**：编辑类浮层（countdown edit / todo detail）保存成功后通过
   `plugin:request-overlay-close` 请求宿主关闭，失败留在浮层显示错误；不做“保存后仍停留 + 提示”。
3. **通知重复**：检查发现两层原因——todo 详情保存无条件清掉已触发提醒标记（分钟级归一化导致
   同一条提醒再次触发），以及卡片/浮层/后台多个 iframe 都跑提醒循环。修复口径：提醒只由
   `background: true` 的后台 iframe 调度（单写者），`navigator.locks` 原子化 claim，标记按
   “任务 id + 提醒分钟”去重；独立预览（无宿主）由卡片实例兜底。countdown 的按日去重 key
   改为本地日期（原 UTC 日界会在 Asia/Shanghai 08:00 重复提醒）。
4. **复盘页「插件当前不在桌面」**：切页时 `Desktop` 被整棵卸载，插件 iframe/后台运行时消失，
   `HostBridge.callTool` 路由不到。修复口径：桌面层在所有页面保持挂载（隐藏 + `inert`），
   页面切换只换覆盖层；复盘页对晚到的工具声明用 `onToolsChange` 补刷。

## D-13 动效规范 v1（2026-10-19，已定稿）

- 触控优先、鼠标/笔额外 hover；hover 放大 1.5%、按下缩到 0.985、长按 500ms 内逐渐下沉到 0.97，
  到点进编辑模式（可中断）。长按进度不用进度环。
- 详情/设置浮层使用**完整 container transform**（所有卡片尺寸，1×1 也启用）：从被点卡片 rect
  变形展开、关闭 150ms 收回同一卡片；内容在变形后段交叉淡入，避免小卡片放大文字；遮罩点击=关闭。
- 插件内部动效全部按 Fluent motion（Tab 内容、列表增删、内联展开、勾选、进度、视图切换），
  共享 `_shared/motion.js` 封装；不做 stagger/数字滚动/粒子/视差。
- 只用 `motionTokens` 时长与曲线，禁止自定义毫秒/贝塞尔；`prefers-reduced-motion` 下所有
  transform/尺寸动效关闭（直接操纵与 Fluent 默认状态指示保留）。
- 完整参数、状态机与验收见 `docs/MOTION.md`。

## D-14 详情页栈层级模型（2026-10-19，取代此前“多形态详情”）

- 层级固定为 **L0 卡片 → L1 插件详情（宿主浮层）→ L2 子页（同一浮层内 push）**；
  最多两层，禁止 L2 再套 L3，禁止嵌套 Dialog/Sheet。
- **L1**：`?view=detail`，无返回箭头；X / Esc / 点遮罩 = 关闭浮层回卡片。
- **L2**：任务编辑、清单管理、添加城市/世界时钟等；有返回箭头；
  保存 = 提交并 pop 回 L1；取消/返回 = 放弃并 pop；X/Esc/遮罩 = 关闭整个浮层。
- **Tabs 只用于平级内容且必须常显**（天气信息分类、待办视图）；禁止再用“视图菜单/切换形态”隐藏平级内容。
- 六个插件共用详情骨架（header 56 / 可选工具栏 48 / Tabs 40 / 内容滚动 / 可选 footer），
  由 `_shared` 布局组件实现。
- 「设置…」是跨页导航（关闭浮层 → 宿主设置页插件分区）；暂不做返回详情，记为后续优化。
- 此模型取代 D-12 第 2 条中“保存后关闭整个浮层”的旧口径：**保存 = 提交并返回上一级**；
  仅当编辑页是直接从卡片打开（没有 L1 列表）时才等于关闭浮层。

## D-15 六插件交互与视觉定稿（2026-10-19，汇总）

- 设计依据：严格遵循 Fluent 2 Design System；Apple HIG 仅作为平台无关原则的启发
  （分组/层级/可扫读/触控目标/减少动效），不引入 Apple 设计语言。
- 本轮定稿内容：卡片点击语义、详情 L1/L2、设置宿主化（manifest schema）、六插件卡片/详情规格、
  插件内部动效、颜色政策（严格功能色）、Agent 对等、测试脚手架清理计划。
- 逐插件规格见 `docs/components/{clock,countdown,sedentary,pomodoro,todo,weather}.md`；
  总览见 `docs/history/DESIGN-ROUND-SUMMARY.md`；契约见 `docs/PLUGIN-CONTRACT.md`；动效见 `docs/MOTION.md`。
- 设置：插件在 manifest 中声明 schema（boolean/number/enum/text/timeRange），宿主设置页通用渲染；
  即时生效 +「保存」羡余 +「恢复默认」；插件不再提供 `?view=settings`。
- 颜色：本轮只使用 Fluent 功能色（中性文字层级、品牌色交互、语义色状态、数据色图表、内容色小面积），
  插件个性色/氛围色后续再讨论；不新增 hex。
- 卡片快捷操作：仅保留高频单步操作（番茄开始/暂停/重置、久坐我起来了、待办勾选）；
  时钟/倒数日/天气无快捷操作；所有详情级操作移入 L1/L2。
- 待办：卡片固定「今日」视图、只展示 + 勾选；五视图/搜索/编辑/清单管理进详情（Tabs + L2）。
- 天气：3×2 不展示 7 天（改逐时 6 行）；4×2 保留等宽 7 天底栏；详情去掉大 hero 与 6 张 statCard，
  改为紧凑摘要 + 单行环境信息 + Tabs。
- 测试脚手架清理（E6）：删除三套 demo host 与 bridge-check，生产 `dist` 不得包含 demo 页面/文案；
  Agent「演示模式」移出主设置。
- 实现按 `docs/history/PLAN.md` §8 的 E0–E7 执行。

## D-16 自动定位改用 ip.cn 网络归属地（2026-10-19，已实现）

- **不再使用高德（Amap）任何能力**，D-10 的高德 API Key 等待作废；天气数据仍是和风天气（QWeather）。
- **链路**（2026-10-19 实测）：
  1. `GET https://ip.cn/`（桌面 UA）→ 首页 HTML 内联 `var _ticket = "…"`；
  2. `GET https://my.ip.cn/json/?ticket=<ticket>`（UA + `Referer: https://ip.cn/`）→
     `{"status":true,"data":{"ip","country","province","city","district","isp"}}`；
     缺/过期 ticket 分别返回 `auth error` / `ticket expire`。
  3. 首页 HTML 没有 CORS 头（JSON 接口有 `Access-Control-Allow-Origin: *`，但 ticket 只能从首页拿），
     所以整条链路放在 **Tauri Rust 后端**；WebView 里直接 `fetch` 会被 CORS 拦。
- **宿主 API**：新增 `ipLocate()` → `IpLocation | null`（`ip/country/province/city/district/isp`，
  **不含坐标**）；`getLocation()` 保持系统定位（坐标）语义不变。
- **天气优先级**：Windows Geolocator（有坐标）→ 失败用 `ipLocate` 城市名 → 和风 GeoAPI
  `geoLookup(城市名)` 换 `id/经纬度`（需要 Weather API Key）→ 全失败保留上次城市并提示手动搜索。
  无 API Key 时自动定位直接跳过（与现有 `hasKeyOrMock` 门禁一致）。
- **自动定位语义（可预期，v0.2.2 按用户反馈修订）**：定位成功即**自动应用**——定位城市加入城市列表
  并设为当前城市（已存在则切换；当前城市已是它时不重复写配置），卡片与详情立即刷新该城市天气。
  定位城市成为当前后，城市菜单不再重复显示「当前位置 · X」候选行（`showLocated = located && !located.isCurrent`），
  用户仍可在菜单里手动切到别的城市。修订前口径为“已有城市时不自动切换、只显示候选”，
  用户实测反馈定位成功后 widget 不更新，故改为成功即应用；升级后若已有 30 分钟内的定位结果，
  只在它「尚未应用过」（旧数据无 `applied` 标记）时迁移应用一次；已应用过的 fresh 结果不会
  覆盖用户手动选择的城市（见 weather 插件 `useWeather` / `store.normalizeLocation`）。
- **隐私**：仅在 `autoLocate` 打开时请求；只暴露公网 IP 与常规 UA，不发送本地数据。
- **实现位置**：`src-tauri/src/iplocate.rs`（`extract_ticket` / `parse_payload` 纯函数 + 单测；
  reqwest native-tls，8s 总超时 / 4s connect 超时）→ Tauri 命令 `ip_locate` →
  `src/host/plugins/tauri.ts` 的 `ipLocate()` → bridge `HostApiMethod` / `HostApiMap` →
  `plugin-sdk.js` 的 `plugin.ipLocate()`；天气插件在 E3 接入。浏览器 dev 没有 Tauri 后端，
  bridge 与 SDK 都返回 null（插件按“拿不到”降级）。
- **失败兜底**：ip.cn 改版 / 超时（8s）→ 返回 null；不影响手动搜索城市；日志记录原因，不弹错误。
- 细节见 [components/weather.md](components/weather.md)「自动定位」一节；任务见 [PLAN.md](history/PLAN.md) E2b。

## D-17 插件契约与自包含模板（2026-10-19，E3.0b）

- **契约层 vs 实现层**：换硬件/换 WebView/换 UI 框架时必须继承的是插件契约
  （manifest、postMessage 协议、L0/L1/L2 层级、settings schema、卡片手势、Agent 对等）；
  Fluent UI React + Fluent 2 是 WebView 实现的资产，不是契约本身。实现可以替换，
  但替换方必须提供同一套 manifest/协议/层级/设置/手势/工具语义。
- 插件继续**自包含**打包 React + Fluent（`app/app.js` 提交进 git，运行时不需要构建或
  共享运行时）。不引入共享 plugin-runtime：共享模块会把版本、依赖、缓存与升级责任
  带回宿主，破坏 plug-and-play。若未来确要做，必须是独立任务，先解决版本协商、
  包管理、缓存与旧插件兼容；不能顺手在 E3.x 里加。
- **模板插件独立于运行时清单**：`templates/plugin-template/` 自带 vendor 的
  `_shared` 快照与已构建 `app.js`，不放进 `public/plugins/`、不进 `index.json`、
  不被 `build-plugin.mjs --all` 发现、不进 `dist`、不出现在桌面/设置/插件管理；
  删掉它对工程零影响。模板只用于复制到 `public/plugins/<new-id>/` 后开新插件。
- 模板是自包含的代价：vendored 快照不会自动跟随宿主升级；README 记录快照日期与
  SHA-256，宿主升级后手动重同步。模板只注册一条只读 `template.summary` 演示工具；
  复制者必须为每个写操作补 Agent 工具，模板 README 明示了这个缺口。
- 实现与验证：冷复制到 `public/plugins/template/`（不构建）后通过 `verify-plugin.mjs`
  三档尺寸 + 宿主冒烟；14 项交互/设置/工具断言通过，console 0 error；截图在
  `shots/milestones/e3-template/`。
- 本轮同时修复宿主缺口：浮层内发 `plugin:request-host-settings` 时，宿主先关闭浮层再导航
  （契约 §5），插件只发一条消息；模板与后续六个插件的「设置…」都按这个口径写。

## D-18 插件可见性：编辑删除（v0.2.2 起由 D-19 取代），启用/禁用 = 持久（2026-10-20，E7 定稿）

- **桌面编辑模式「删除」**：v0.2.2 起改为**持久下桌**（见 D-19）；旧口径（会话级、reload 重新并入）
  已废弃。删除不是卸载插件，插件目录与启用状态都不变。
- **插件管理页「启用/禁用」**：持久偏好（`wtsl.plugins.preferences`），禁用后桌面不渲染该插件、
  不运行后台 iframe、焦点/键盘导航跳过；**不删布局条目**，重新启用后卡片回到原位置与尺寸。
- 背景：E7 回归发现插件页启用/禁用此前只写偏好、桌面层没有读取，开关无实际效果（P1）；
  `Desktop.tsx` 改为订阅 `usePluginPreferences` 并按偏好过滤渲染（含 `BackgroundFrames`），
  `layout` 中禁用插件的条目保留。
- 验收：禁用后桌面 5 卡、重新启用 6 卡；reload 后位置/尺寸不变；全量宿主 E2E 53/53 ×4 复跑通过。

## D-19 小组件上桌/下桌：持久删除 + 显式添加（2026-10-20，v0.2.2）

- 背景：用户反馈「删除 widget 后右下角插件页仍显示已启用，且没有增加 widget 的入口」。
  旧口径（D-18）把编辑删除当会话级临时腾位，reload 会重新并入；同时缺少添加入口，
  用户无法判断「已启用」的插件到底上没上桌，也无法把删掉的 widget 加回来。
- **删除 = 持久下桌**：编辑模式「删除」把 widget key（`pluginId:widgetId`）写入布局
  `removed`，reload 不复活。`wtsl.layout` 升 version 3（读取兼容 v2，旧存档 `removed: []`）；
  `widgets` 为空但 `removed` 非空是合法存档（用户可删光所有卡片）。删除不是卸载插件。
- **添加入口（两条路径，行为一致）**：
  1. 编辑模式工具条「添加组件」→ Fluent Dialog：列出已启用但不在桌面的插件小组件，
     点击「添加」即上桌；空态区分“都已在桌面”与“有插件被禁用，去插件管理启用”。
  2. 插件管理页对「已启用 · 未上桌」的插件在操作列提供「添加到桌面」。
  添加 = 从 `removed` 移除 + 布局引擎放当前页第一个空位（放不下顺延后续页，最后新开页），
  切到该卡所在页并聚焦，即时持久化。
- **插件管理页状态四分**：`已禁用` / `已启用`（纯后台插件）/ `已启用 · 未上桌` /
  `已启用 · 桌面 n/m`。启用/禁用语义不变（D-18：禁用不删布局条目，重新启用回原位）。
- **重置布局**（设置页「外观」）= `clearLayout` + 清空 `removed`，恢复 manifest 默认摆放。
- **尺寸菜单勾选修复**：改尺寸菜单的勾选改为受控，只反映真实 `widget.size`；选到当前页放不下的
  档位时提示「当前页面没有空间放 W × H，尺寸保持不变」，卡片与勾选都保持原尺寸。
- 验收：删除 → reload 仍在桌面外；插件页显示未上桌并可一键加回；编辑模式对话框可加回；
  六卡基线 / 重置恢复 / console 0（v0.2.2 回归报告 `docs/releases/RELEASE-REPORT.md` §11）。

## D-20 Agent 浮空三段式界面 + 立即录音（2026-10-20，v0.3.0）

- 背景：用户要求 Agent 只做浮空形态；右下角入口从一个按钮长成半高输入窗、再长成全高浮栏；点按与空格必须**立即开始说话**（快速说内容，而不是先开窗再点录音）。旧的全屏语音页、三形态面板、人脸唤醒全部移除。
- 三形态：`collapsed`（56×56 圆角 12，ChatSparkle 图标）→ `composer`（420 × clamp(320, 44vh, 440)）→ `chat`（420 × calc(100vh-40px)）；右/下锚定，只变宽高，圆角恒 12，shadow8↔16；动效、关闭语义、焦点路径、颜色分配以 `docs/AGENT-SURFACE-CONTRACT.md` 为准（实现后并入 `components/agent.md` / `DESIGN.md` / `MOTION.md`）。
- 可预测性：Esc 退一级（chat→composer→collapsed），⌄ 收起，X 关闭；composer 点外部一律收起并保存草稿，chat 点外部不关闭；唯一自动升级 = 发送后进入 chat；关闭后焦点回到入口按钮。
- 语音入口：点入口按钮或按住空格立即 `startRecording()`（不是先开窗再录）；录音中 Esc 取消；松开/再点停止 = 结束并发送。无唤醒词、无常驻监听。
- 视觉：去 robot/avatar；身份只由 ChatSparkle 标记；状态用形态/颜色/动效/符号表达，主界面不写解释性文字；品牌色只用于正在发生的动作（录音、发送、焦点、链接）。
- 验收：入口/三段 morph/录音时序/键盘/焦点/亮暗/1024/1440/reduced-motion 截图与断言；见 v0.3.0 回归报告。

## D-21 语音原生音频一次发送 + 文字上下文（2026-10-20，v0.3.0）

- 背景：用户要求「MiMo 可以原生处理音频」；此前实现是本地录音→ASR→只发文字，虽然音频从未进上下文，但表达不了语音本身。
- 决策：**当前这一轮**的语音以 `input_audio`（`data:audio/wav;base64,…`）原生进入 MiMo 对话请求（模型 `mimo-v2.6-flash/pro` 支持音频输入；音频 token ≈ 时长秒 × 6.25）。同一份 WAV 并行/事后送 `mimo-v2.5-asr`，转写文字写入该 user 消息（`input: 'voice'`）并进入后续上下文。
- **音频只上传一次**：音频 Blob 用完即弃，不写 localStorage、不进 Message、不进后续请求；重试、切会话、重启都只发文字。转写失败时该条上下文用「（用户发来一段语音）」占位，界面用声纹 + shimmer 提示失败/重试。
- 界面：语音消息与打字消息同形同色；用 `voicePeaks` 声纹装饰 + 转写 shimmer→文字淡入表达「这是语音」，不写「语音/转写结果如下」等文字标签；`aria-label` 给屏幕阅读器。
- 播报：语音提问的回复自动朗读；文字提问默认不朗读（设置 `tts.readTextReplies`，默认关，迁移自旧 `autoPlay`）；去掉 continuous/autoPlay/voice.active 三套状态，单条消息可播放/停止，收起/关闭/新发送/开始录音先停播报。
- 验证：mock 语音全链路 + localStorage/请求体无音频断言 + `scripts/smoke-mimo-audio.mjs` 真实接口冒烟（TTS 合成→chat 音频输入→ASR 回读）。

## D-22 移除 dock / 全屏 / 人脸，设置入口收进设置页（2026-10-20，v0.3.0）

- **dock 移除**（取代 D-03）：右下角四个按钮（Agent/复盘/插件/设置）不再常驻；四个入口收进设置页顶部「入口」组（打开 Agent / 复盘 / 插件管理）。桌面只剩 Agent 入口按钮与页码点。
- **设置入口**（三条冗余）：长按桌面空白 → 编辑工具栏「设置」；全局快捷键 `Ctrl+,`；设置页内各分区可互相导航。
- **全屏移除**：`PanelMode` 与全屏语音页删除，Agent 永远浮空；`panelMode` 设置项删除（旧 `fullscreen` 忽略）。
- **人脸移除**：删除 `faceService`、`FaceSetup`、`useFaceState`、face-api 依赖与 6.7MB 模型、`face` 设置项、摄像头相关文档；不保留任何摄像头调用。
- **机器人图标移除**：消息头像、Bot 图标、空态机器人全部删除；Agent 身份标记统一为 ChatSparkle。
- 验收：桌面无 dock/无机器人/无麦克风图标；设置页四个入口可达；Ctrl+, 与编辑工具栏「设置」均能打开设置页；回归截图与断言见 v0.3.0 报告。

## D-23 设置入口的层级：宿主设置只从宿主入口进，不塞进 Agent（2026-10-21，v0.3.1 反馈）

- 背景：用户反馈「鼠标状态下怎么进设置？真就全触屏了是吗？」。核查后确认：v0.3.0 的三条入口（长按空白→编辑栏、`Ctrl+,`、设置页内导航）分别只覆盖触控与键盘，鼠标用户没有可发现的路径；这是把「触控优先」误做成「只做触控」。
- **否掉的方案**：在 Agent ⋯ 菜单加「桌面设置…」。从 HIG / Fluent 2 看都不成立：
  1. **层级错位**：Agent 是对话与语音域，桌面设置是启动器域；跨域入口会暗示「Agent 在控制桌面」，也让 Agent 菜单承担与它无关的导航职责。
  2. **设置要有唯一、可预期的家**：app 级设置应由 app 级入口进入；辅助浮层（可收起/可关闭）不承载全局目的地，否则「关掉浮层后设置页返回到哪」都说不清，入口还依赖 Agent 是否打开。
  3. **一致性**：同一设置出现两个语义不同的门，用户无法建立稳定模型。
- **采用的方案**：桌面空白处鼠标右键 = Windows 桌面惯例的上下文菜单：打开 Agent / 编辑桌面 / 设置。Fluent Menu 用虚拟 target（`positioning.target`）在光标处定位，只含 `MenuPopover`，不挂 MenuTrigger。`Ctrl+,` 与触控长按路径保留。
- Agent 自己的设置（模型/Key/语音/搜索）仍在 Agent ⋯ 菜单：入口跟着「设置作用的对象」走。
- 验收：`scripts/smoke-v031-ui.mjs` A/B/C 全 PASS（真实 CDP 右键、`data-active=false`、Agent 菜单无宿主入口、console error 0）。

## D-24 半高窗补出口 + 播报状态常驻 + 录音关闭语义（2026-10-21，v0.3.1 反馈）

- 背景：用户反馈「半高形态下 bug 又多」「全高框不播放时右上角什么都没有，一旦播放就有了语音」「语音默认播放本身没问题，但设置不能调默认、有时需要经常静音」。三件事指向同一类设计错误：把「状态」当成「临时动作」，把「半高」当成只能往上走的过渡态。
- **半高窗不是过渡态**：它会停留（取消录音后、点外部收起后再打开），旧版只有一条渐隐预览、没有回到全高的出口，只能靠再发一条消息升级。现在顶部加 ⌃ 展开、中部为最近 3 条消息 peek（点击/Enter/空格展开）；录音/转写时这两块暂隐，展开禁用。
- **关闭 = 结束当前任务**：录音中点 X / 点外部先 `cancelRecording()`（旧版会留下后台麦克风）；转写中收起后 `suppressVoiceReveal` 阻止 ASR 完成把窗口弹回 chat。
- **播报状态常驻、动作按需**：`tts.autoRead` 总开关（默认 true）+ header/composer 常驻扬声器开关（图标开/关，aria-pressed；切换即持久化并先停当前播报）；「停止朗读」只在播报中出现。文字提问是否朗读降为次级项，总开关关闭时禁用（HIG：依赖项应禁用并解释，而不是让用户设一个不生效的选项）。
- 验收：`scripts/smoke-v031-ui.mjs` D–G PASS（40×40 控件、peek 可展开、未播放也有朗读开关、reload 持久化、录音中收起 voice idle + mic ended + 无新消息）。

## D-25 久坐计时改为连续计时：去掉「键鼠空闲判定起身」（2026-10-21，v0.3.2 反馈）

- 背景：用户反馈「久坐第一次还能正常计时，按了卡片上的『我起来了』之后就再也不计时了」。查代码 + 用户机器上的 `sedentary.runtime` 存档：
  - 引擎在隐藏 iframe 里，定时器被浏览器节流到约 60 秒（存档 `lastTickAt` 全是整 60 秒间隔，而代码写 10 秒），但显示按 `sittingSince` 计算，所以第一次看着像正常计时；
  - 旧逻辑：`idleSeconds ≥ idleResetMin×60`（默认 5 分钟无键鼠输入）→ 判定起身、记 break、`sittingSince=null`；之后必须等一次 tick 恰好采样到「最近 60 秒内有输入」才重新开始。桌面摆件式使用（人在桌前、只是看屏幕不摸）根本不会产生这种输入 → 一直停在 0 分钟 /「刚起身，计时未开始」。
  - 存档实证：只有 1 条手动 break 命令，但当天 breaks 记到 3 次；两次 idle 自动结算（21:59、22:05）把计时反复清零。
- 决策：**改为连续计时**（v0.3.2）：
  1. 去掉 `plugin.getIdleSeconds()` 空闲判定与 `idleResetMin` 设置项（宿主设置页、manifest schema、Agent `sedentary.settings.set` 同步移除；旧存储里的字段忽略）。
  2. 会话开始后一直累加，显示 = now − `sittingSince`；只有「我起来了」（卡片/详情/强提醒/Agent 工具）会结算并 `breaks+1`。
  3. 结算后**立即开始新一轮**（`sittingSince = now`），不再出现等待输入的 0 分钟空窗。
  4. tick 间隔 > 5 分钟（休眠/应用退出/时钟突变）→ 空档不计入，把 `sittingSince` 顺延同样时长；不记 break、不清零。
- 取舍：桌面摆件场景下「长时间不碰屏但人在」按久坐计；离开位置需要按「我起来了」或关闭应用，否则离开时间也计入本轮（docs/components/sedentary.md「已知取舍」）。
- 验证：`node scripts/build-plugin.mjs sedentary` 重新打包；typecheck/build；dev 冒烟覆盖「点我起来了 → 计时从 0 立即继续、不再等输入」。

## D-26 移除久坐「免打扰」时段（2026-10-21，v0.3.3）

- 背景：用户明确要求去掉久坐的免打扰功能（「你直接给我去掉免打扰功能，谁加上去的」）。
- 来源：`quietHours` 是久坐插件最初接入宿主（ede04b6）与 E3.3 重构（9a14a0b）时从早期设计 schema 带下来的配置项，不是近期新加的；但它让「到阈值提醒」这条核心行为多了一个隐藏分支（`quietSkip`、`status='quiet'`、`isQuiet`），与产品「到点就提醒」的预期不一致。
- 决策（v0.3.3）：完整移除
  1. engine：删除 `DEFAULT_QUIET_HOURS`、`normalizeQuietHours`、`isQuiet`、`quietSkip`、`status='quiet'`、免打扰提示文案；`migrateSettings` 删除旧配置里的 `quietHours` 字段。
  2. manifest 设置 schema：删除「免打扰」group；`sedentary.settings.set` Agent tool schema 同步去掉 `quietHours`。
  3. UI：卡片/详情的 `quiet` 状态色与文案删除。
- 兼容：旧存档里的 `quietHours` / `quietSkip` 字段被忽略并在迁移时删除；设置页不再显示该分组。
- 验证：`node scripts/build-plugin.mjs sedentary`；`scripts/verify-sedentary.mjs` 聚焦验证 PASS；typecheck/build/tauri build exit 0。

## D-27 久坐改为手动「坐 ↔ 站」循环（2026-10-21，v0.3.4）

- 背景：用户要求久坐插件体现「坐着—起来—坐着」循环（旧版只记录「我起来了」一个动作，且 v0.3.2 为了修 bug 变成按「站起来」后立即从 0 继续、站立时间也计入久坐）。明确不做番茄钟联动、不做插件间能力图；Agent 需要能操作两个动作；复盘要能看到新数据。
- 决策（v0.3.4）：
  1. **状态机**：`sitting` ↔ `standing`，全部手动。坐着 →「我站起来了」：结算本轮久坐、`breaks + 1`、更新最长连续，进入站立并暂停久坐计时；站立 →「我坐下了」：结算站立时长，回到坐着开新一轮。没有自动判定（不碰键鼠空闲/摄像头）。
  2. **数据**：`sedentary.days` 增加 `standingMinutes`；`longestStreakMin` 只统计坐姿；`runtime` 改为 `posture + postureSince`（旧 `sittingSince` 迁移成 sitting）。
  3. **提醒**：只在坐着时提醒；强提醒动作改为「我站起来了」/「稍后 5 分钟」（snooze 仅坐着可用）。
  4. **Agent 工具**：删除 `sedentary.takeBreak`，新增 `sedentary.standUp` / `sedentary.sitDown`；新增 `sedentary.stats` 给复盘。
  5. **复盘**：`sedentary.stats` 返回区间久坐/站立分钟、起身次数、最长连续与按天起身次数；复盘页主数值 = 起身次数（单位「次起身」），次要指标 = 久坐/站立分钟，热力图按每天起身次数。
  6. 休眠/退出空档只顺延时间，不切换姿态、不记 break（沿用 D-25）。
- 迁移：旧 runtime `sittingSince` → 坐着继续；旧 days 无 `standingMinutes` 视为 0；旧 `takeBreak` 工具不再提供（Agent 自然语言适配为新工具）。
- 验证：`scripts/verify-sedentary.mjs` 坐→站→坐循环 10/10 PASS；复盘页集成检查 PASS（`sedentary.stats` 被宿主发现并渲染）；typecheck/build/tauri build exit 0。

## D-28 Agent 状态短句直通 + 语音先转写（2026-10-22，v0.3.5）

- 背景：用户反馈「在 Agent 里说了我坐下了，卡片没变，还得手动点按钮」。排查真实数据（WebView2 LevelDB）确认：模型在语音轮里没有调用工具，只回了一段“已记录…”的编造回复；插件状态从未改变。复现实验：同一句「我坐下了」用纯音频请求，4 次里只有 1 次真的产生 tool call，其余是文字幻觉或畸形 `<tool_call>`。
- 决策：
  1. **状态短语直通**：插件工具声明可带 `phrases: string[]`；用户整句（忽略空白/标点）完全命中时，宿主 `matchPhraseTool` 在模型请求前直接执行工具，把结果以 tool call 形式放进对话，模型只负责一句短确认。只认整句，带疑问/长句仍交给模型，避免误判。
  2. **语音先转写再请求**：`stopRecording` 先等 ASR（≤8s），再把音频 + 转写文本一起发给模型；纯音频 function calling 不可靠。转写超时才退回纯音频，晚到的转写对状态短语补执行一次。
  3. **文案做减法**：删掉「休息中，坐下后开始新一轮」这类状态机说明、工具描述里的「（UI：…）」提示、每次点按后的「已记录…」通知；站立时 `hintOf` 返回空串，状态交给标题/Badge/按钮。Agent 提示词新增“工具成功后只回一句短确认，不要教用户点按钮”。
- 兼容：`phrases` 是可选项，未声明的插件行为不变；旧会话/旧设置不受影响。
- 验证：短语匹配单测 10/10；真实 MiMo + headless Edge 端到端 12/12（说“我站起来了/我坐下了”→ 插件 runtime 立即切换、卡片按钮同步、工具卡出现、回复短确认、无防御性文案、console 0）；`scripts/verify-agent-surface.mjs` 语音链路回归。

## D-29 插件配置同步改为宿主主动 `host:config` 推送（2026-10-22，v0.3.6 修复）

- 背景：用户反馈「设置里打开天气自动定位后，详情页自动有了信息，但桌面 widget 不同步，必须重启」。
  根因：Tauri 打包版宿主页是 `http://tauri.localhost`、插件 iframe 是 `http://wtsl.localhost`
  （`src-tauri/src/protocol.rs`），两者不同 origin；`HostBridge.setConfig` 写的是宿主文档的
  localStorage，而 `window 'storage'` 事件只在同源文档之间派发，插件 iframe 永远收不到。此前
  `useStoredConfig`、天气、倒数日都假设「另一个 iframe 文档会收到 storage 事件」——dev 浏览器
  （HTTP 插件源，同源）成立，打包版不成立。WebView2 LevelDB 实测：`plugin.weather.*` 记录归属
  `_http://tauri.localhost`，插件 iframe 自己写的 `sedentary.*` 归属 `_http://wtsl.localhost`，
  证实是两个存储区。
- 决策：
  1. 宿主 → 插件新增 `host:config`（`{ key, value }` 增量），协议版本 2。`HostBridge.setConfig`
     写盘后经 `src/host/bridge/configBus.ts` 广播，每个 `PluginWidgetFrame`（卡片 / 详情浮层 /
     后台）按 pluginId 订阅并各自 post 给自己的 iframe。
  2. `plugin-sdk.js` 新增 `plugin.onConfig(fn)`：记忆最近配置快照、注册时重放；`host:init` 的
     `config` 也记入快照。
  3. `_shared/host.js` 的 `useStoredConfig`：mount 时向宿主 `getConfig` 重读一次（init 快照可能
     过期），订阅 `onConfig` 应用增量；`storage` 监听降级为 dev 同源兜底。读取序号防止晚到的
     旧响应覆盖新写入。
  4. 浮层 iframe 的 init 快照改为现取（`PluginWidgetFrame.configSnapshot` 供应商），不再依赖父
     组件渲染时缓存的旧配置。
  5. 宿主设置页表单订阅 configBus：插件 / Agent 写配置后，打开中的设置表单同步。
- 兼容：`host:config` 是可选增量，旧插件忽略未知消息即可，不依赖回包；只升级宿主的旧构建
  第三方插件会退化为修复前表现（需要重新打包才享受推送），但不会崩；`storage` 兜底保留，
  dev HTTP 同源模式行为不变。发布时需递增版本号，安装版升级才会因 `.seed-version` 变化重种
  内置插件产物（`src-tauri/src/plugins.rs`）。
- 验证：跨 origin harness（宿主页 `http://localhost:4300`、插件 iframe `http://127.0.0.1:4300`，
  模拟 tauri.localhost/wtsl.localhost；`.tmp/config-sync-harness/`，一条命令可复跑）：
  - before（HEAD 5f098fe）：宿主 localStorage 已写入 `unit:"f"` / places 上海，但已挂载卡片 2s 窗口内
    仍是 北京 23°（iframe 收到 `host:config` 0 条）——bug 复现；
  - after（本修复，最终产物 sha 48c8b86e…）：iframe 收到 `host:config` 6 条；settings push 34ms 生效
    （23°→73°F），places push 58ms 生效（北京→上海），iframe console error 0。
  - `npm run typecheck` / `npm run build` / 六插件产物重建通过（产物已完成，与源码一致）。
  - release 真窗口（patched CDP 副本，`shots/releases/v0.3.x/v036-final/`，38 PASS / 0 FAIL）：升级重种 0.3.5→0.3.6；真实 WebView2 里设置页切时钟 12 小时制/天气自动定位开关后，跨 origin 卡片 360ms 内可见更新、iframe 71ms 收到 `host:config`（天气双向 75/60ms）、timeOrigin/探针证明未 reload、console 0。

## D-30 Agent 语音优先：半高窗改为纯语音、取消自动升级、输入区单行（2026-10-23，v0.3.7 反馈）

- 背景：用户反馈「按空格发语音 / 触屏点 chat 图标，期待的是连续语音对话，文字对话是兜底；现在语音一发完就自动半高→全高；半高窗里不该有文字输入框；回答完再按空格竟然打出空格；右下角对话框没必要分两行」。四条是同一个设计错误：把语音当成“填满文字对话的输入方式”，导致状态机把语音结果当作进入 chat 的理由，并自动把焦点塞进输入框。
- 决策：
  1. **三段语义重定义**：`collapsed` → `voice`（半高纯语音窗，原 `composer` 更名）→ `chat`（全高文字/历史浮栏）。**删除“发送/语音结束自动升级到 chat”**；进入 `chat` 只能显式操作（⌃ / peek / Enter / 受控打开）。语音回合结束（含 TTS 朗读）留在 `voice`，可立即再按空格/点「点击说话」继续下一轮 = 连续语音对话。
  2. **半高窗是纯语音**：移除文字输入框、发送按钮与 peek 下方输入区；底部只留全宽 primary「点击说话」大按钮（idle）或声纹录音条（录/转写中）。文字输入只存在于 `chat` 的单行输入区。
  3. **空格默认永远是按住说话**：不再在展开/语音结束时自动聚焦输入框（根因 bug）；只有用户主动点入 `chat` 的输入框后才打字；输入框内第一次 Esc 只退出输入框，第二次才退级。展开/收起/换层后焦点放在 surface 容器，收起后回入口按钮。
  4. **全高输入区改单行**：`[语音] [Textarea] [发送/停止]` 同一行（Fluent Button/Textarea `size=large`，间距/高度全用 token），录音时整行换成声纹条；草稿跨 `chat → voice → chat` 保留。
  5. **视觉严格回到 Fluent 2 token**：颜色/字号/间距/圆角/阴影/动效全部取 `tokens`/`motionTokens`，不自造尺寸（点击说话按钮用 `size=large` 的 40px，而不是 56px 自定高度）、不覆写按钮圆角；交互遵循 HIG 思想：入口长出/原路收回、关闭焦点回入口、✕ 关层 vs ⌄/Esc 退一级、peek 顶部渐隐做渐进披露、半高 detent 可停留可展开、reduced-motion 只留 120ms 透明度。
- 否掉的方案：
  - 「全高回答后自动收回半高」：仍保留“语音结果决定形态”的自动逻辑，且用户可能正在读长回答。
  - 「半高窗保留一行文字输入」：用户明确“半高就是纯语音”；文字是兜底，需要显式展开。
  - 「靠“输入框为空时允许空格录音”的启发式」：状态不可预测，且解决不了自动聚焦根因。
- 兼容：`SurfaceStage` 由 `composer` 改为 `voice`（仅 UI 内部类型，不持久化）；`AgentSurface` props 不变（`open` 仍打开 `chat`）；session / 存储 / 音频链路不变；不迁移数据。
- 验证：新增 `scripts/verify-agent-voice-first.mjs`（headless Edge + 假麦克风，voice 回合后观测不到 chat、回答后空格再录音、半高窗 textarea=0、chat 单行 composer 三控件同轴、焦点/Esc/录音取消、reduced-motion、console 0）；`scripts/verify-agent-surface.mjs`、`scripts/smoke-v031-ui.mjs` 按新语义更新后全 PASS；`tsc --noEmit` / `npm run build` 通过；证据 `shots/releases/v0.3.x/v037-dev/`。

## D-31 壁纸层：必应每日壁纸（原生接口）+ 修复 provider 盖住壁纸（2026-10-23，v0.4.0）

- 背景：v0.3.x 的桌面壁纸 `--wtsl-desktop-backdrop` 挂在 `body` 上，被 `FluentProvider` 根 div 自带的不透明 `background-color: var(--colorNeutralBackground1)` 完全盖住（截图像素实测：暗色画布 `#292929`、亮色 `#ffffff`）。因此卡片上的 `--wtsl-material-blur` 实际在模糊一块纯色，`MATERIAL_BACKGROUND`（`colorNeutralBackground2` 72%）在暗色下比画布更暗，读作"凹陷的洞"；亮色卡片 `#fbfbfb` 对 `#ffffff` 仅 1.03:1。用户反馈界面"很素"，这是材质层失效的根因。
- 决策：
  1. `FluentProvider` 根背景显式透明，壁纸层放到 provider 内部最底层（`src/host/desktop/WallpaperLayer.tsx`），固定在桌面内容下方、不拦指针；设置/复盘/插件页仍是不透明全屏页，壁纸不会透出。
  2. 壁纸来源：**必应每日壁纸**。按用户要求「都试一下」，依次尝试 `https://api.bimg.cc/all?...&uhd=true`（必应壁纸 API 的实际接口；文档站即 `api-bimg-cc.apifox.cn`）→ `https://api-bimg-cc.apifox.cn/all?...` → `https://www.bing.com/HPImageArchive.aspx?format=js`（原生 JSON，可能无 CORS，失败即跳过）。取 UHD（3840×2160）4K；缓存 `wtsl.wallpaper.v1` 12 小时；全部失败退回上次缓存，再失败停在 `colorNeutralBackground3`。
  3. 比例不匹配用 `object-fit: cover`（填充），**不拉伸**（用户明确要求）。
  4. 壁纸说明：桌面左下角一条安静的 12px 说明（标题 + 地点短句；完整版权放 `aria-label` / `title`），只在桌面页出现，不新增入口、不抢小组件。
  5. 卡片材质回到 `colorNeutralBackground1` 72% + 既有 `--wtsl-material-blur` + `colorNeutralStroke2` 1px 描边（`FLUENT2.md §6/§7`），暗色卡片才重新"浮"在壁纸上。
- 不新增设计 token：颜色/字号/间距/圆角/阴影全部取 Fluent token；只沿用既有两个项目 token（卡片圆角、材质模糊）与既有 `--wtsl-material-blur` 引用点。
- 否掉：把必应图片打进 `public/` 随仓库分发（版权与体积）；随机图片 API（不可复现）；`background-size: 100% 100%` 拉伸铺满。
- **修订（2026-10-25，v0.6.0，D-37）**：§4「只在桌面页出现，不新增入口、不抢小组件」按本轮修订为「不新增**另一个**入口控件」——那条 12px 说明在 v0.6.0 变成按钮，同时是「欣赏壁纸」模式的**唯一**入口（点击进入 / 再点或 Esc 退出，只在本次会话内有效、不持久化）。§2 的三源兜底（bimg → apifox → 原生）同时作废，改为只走必应官方归档。

## D-32 组件 identity 色（2026-10-23，v0.4.0，用户拍板"开吧"）

- 背景：D-15「颜色严格功能化」+ DENSITY「层级只用中性色」让六张卡完全同质（全界面唯一彩色是 Microsoft 蓝按钮），用户认为"素"。
- 决策：允许每个插件一个 **identity 色**，仅用于卡片顶部 24×24 identity chip 的背景和其中 16px 图标，占卡面积 ≤10%；色相固定映射到 Fluent shared palette 六种，不新增 hex：
  - clock = blue（`colorPaletteBlueForeground2` / `colorPaletteBlueBackground2`）
  - countdown = pink、pomodoro = orange、sedentary = green、todo = purple、weather = teal（同理取对应 palette token）
- 限制：identity 色不承担状态/语义/数据含义（状态仍用 `colorStatus*` / 语义色）；不用于背景、边框、大面积填充；不新增项目 token。实现集中在 `public/plugins/_shared/ui.jsx` 的 `CARD_ACCENTS` / `CardIdentity` / `EmptyState.iconAccent`。
- 否掉：给每卡配自定义主色（会变成 6 套小主题，和 Fluent token 体系冲突）；用 identity 色做卡片背景渐变（不是 Fluent 2）。
- **修订（2026-10-24，D-36 §4）**：本条“24×24 chip 背景 + 16px 图标”作废；identity 只允许出现在
  **20px 图标**（可选 1 处 2px 状态强调），不再有 chip 底色，也不用于空态色块。

## D-33 卡片静态 identity 行（2026-10-23，v0.4.0）

- 背景：DENSITY「正常模式无 chrome」+ 去标题栏之后，卡片没有身份锚点，桌面读作"灰色矩形阵列"。
- 决策：每张卡内容区第一行允许一条 **静态** identity 行：24px 高，identity chip（24×24）+ 12px 半粗 `colorNeutralForeground3` 组件名（≤4 字）+ 可选 trailing（原有计数 / 城市 / 状态）。1×1 卡只留 chip（`compact`）。
- 边界：它不是 chrome——没有可交互控件、不常驻操作、不占点击热区；不改变「点击=主操作、长按=编辑」的交互契约。DENSITY §2 的 Primary/Secondary 信息预算不把 identity 行计入；其余门禁（最小 12px、主次字号比、空带、内容带、横向空洞）不变。
- **修订（2026-10-24，D-36 §2）**：identity 行仍 24 高，但组成改为 **20px 图标 + 12px 标签**，
  取消 24×24 chip 底色；`1×1` 只留 20px 图标。token 出处：`spacingVerticalXXL`（24）、图标档位 20、
  `fontSizeBase200` / `lineHeightBase200`（12/16）。

## D-34 默认布局：填满首屏（2026-10-23，v0.4.0）

- 背景：8 列 × 5 行网格，六个内置插件的旧默认布局只占 2–3 行（实测截图 18/40 格），右下大片空白，进一步放大"素"。
- 决策：内置插件 `manifest.json` 的默认尺寸/位置改为一块 35/40 格构图（1440×960）：
  weather 4×2 @ (0,0)、clock 3×2 @ (4,0)、todo 3×3 @ (0,2)、pomodoro 3×2 @ (3,2)、countdown 2×2 @ (6,2)、sedentary 2×1 @ (6,4)。
- 兼容：老用户已保存的 `wtsl.layout` 不受影响；「重置布局」回落到新构图。其他分辨率按既有 clamp / 首个空位回退规则，不追求一致。
- 实现修正（v0.4.0 落位时发现）：`src/host/plugins/manifest.ts` 原先用 `asWidgetSize` 校验 `cell`（尺寸语义，要求两维 ≥1），导致声明在**第一列/第一行**的坐标（0）被判非法、默认布局静默退化成“首个空位”装箱。已改为 `asGridCell`（坐标语义，允许 0）；默认构图的落位以本条为准。
- **修订（2026-10-24，v0.4.5 布局居中轮）**：`breakpoints.gridOrigin` 取消 4px 吸附、改为严格居中，网格由 (20,44)-(1416,912) 变为 **(22,46)-(1418,914)**，四边留白 **22/22/46/46**（cell 164、gutter 12、8×5 全不变；22/46 的唯一定义处是新导出的 `gridInsets()`）。默认构图随之更正为：weather **3×2 @ (0,0)**、clock **3×2 @ (5,0)**、todo 3×3 @ (0,2)、pomodoro 3×2 @ (3,2)、countdown 2×2 @ (6,2)、sedentary **2×1 @ (5,4)**。与初版不同的两条：① clock 由 (4,0) 移入 (5,0)，使首行右缘与网格右缘 1418 齐平、首行中缝落在屏幕中线 720；② sedentary 由 (6,4) 显式钉到 (5,4)，否则它与右下保留格 (7,4) 相交、会被 first-fit 挤回首行 (3,0)。各组件 `sizes` / `defaultSize` 均未改，卡片尺寸不变。老用户已保存的 `wtsl.layout` 不受影响（`sanitizeLayout` 只在缺组件/越界时重排）。
- **修订（2026-10-25，v0.6.0 说明条参与布局，D-37）**：说明条实测高度 `H_p` 成为布局输入后，垂直居中改为「网格 + 一个 gutter + `H_p`」整块居中：网格由 (22,46)-(1418,914) 变为 **(22,27)-(1418,895)**，四边留白 **22/22/27/65**（cell 164、gutter 12、8×5 与上一条的默认构图坐标全不变；`layoutFrame` 是唯一定义处，`gridInsets` 只作派生视图）。底部余量 27 = 960 − 933，`933` = 网格下缘 895 + gutter 12 + `H_p` 26 = 说明条 pill 下缘 = chat 入口下缘。网格下净空 65 不是不对称：与上净空 27 配对的是 **pill 下缘**，不是网格下缘。`H_p`=0（隐藏说明条）时网格单独上下居中、回到 22/22/46/46。

## D-35 半高语音窗 idle 视觉锚点（2026-10-23，v0.4.0）

- 背景：v0.3.7 的半高语音窗在 idle 态中部只有 24px `ChatSparkle`，420 × clamp(320px,44vh,440px) 的窗口大面积空白，用户认为"素"；而 `MOTION.md §6` 明确禁止"循环呼吸/粒子/视差/自造时长"，不能用动效填。
- 决策：voice 段空态改为**静态**构图：
  1. 96px 圆形容器（`borderRadiusCircular`、`colorNeutralBackground2` 底、`strokeWidthThin colorNeutralStroke2` 边），内部 40px `ChatSparkleRegular`（`colorBrandForeground1`）；
  2. 外层 132/168px 两层 `colorNeutralStroke3` 细环，绝对居中、不占布局；
  3. dock 内加 14px `colorNeutralForeground3` 提示「说点什么，或按住空格」（`Text size={300}`，无句号），talk 按钮 `aria-describedby` 指向它；移除原「按住空格也可以说话」Tooltip（空格录音仍保留，提示常驻更可发现）；
  4. 空态关闭 peek 顶部渐隐 mask（避免 168 环上缘被 mask 切掉）；有消息时恢复原渐隐。
- 明确不做：循环呼吸/脉冲/粒子/视差动画；**本轮新增动画时长 = 0**（进入仍走既有 motionTokens 过渡）。
- 契约不变：voice 段无 textarea、顶栏 ⌃/朗读/✕、peek 最近 3 条、底部「点击说话」、录音时声纹替换。
- 验证：`scripts/verify-agent-surface.mjs` **127/127 PASS**；`scripts/verify-agent-voice-first.mjs` 断言层全 PASS（198/200，2 条 FAIL 为并发环境 Edge teardown 竞态，非 UI 断言）；`npm run typecheck` exit 0。详见 `docs/AGENT-SURFACE-CONTRACT.md §14.6`。

## D-36 Equal Except Hue：同权插件的视觉契约（2026-10-24，用户已认可）

- 背景：六个插件同级，但分别自定义字号（48/68/80/96/112）、padding（8/12/16）、按钮层级（四个 accent）和 identity 色出现位置（chip 背景、空态色块），画面既无差异秩序也无统一秩序。
- 决策：
  1. **唯一 hero 字号**：直接引用 Fluent token `tokens.fontSizeHero900` / `tokens.lineHeightHero900`（逻辑 40/52，200% DPI = 物理 80px，官方 Large Title 档）。**不定义项目级字号变量**（第二遍复核删除了 `--wtsl-hero-size/-line-height` 这类手写像素 token）；所有插件主数字经共享 `HERO_TEXT` 取用，次级数字/标签/说明用 Fluent `Text size`（title3/body1/caption1）。
  2. **唯一卡片栅格**：共享 `CardRoot` 提供 padding 16、gap 8；插件不再按尺寸覆盖 padding/gap。identity 行 24 高（20px 图标 + 12px 标签），hero 紧随其后。
  3. **按钮层级**：插件内行动按钮默认 secondary/subtle；accent 只保留给状态（番茄“运行中”），同一页不同时点亮两个 accent。
  4. **身份色契约**：manifest 顶层 `identityHue`（blue/pink/orange/green/purple/teal 白名单）；loader 缺失/非法即拒绝并报错；宿主映射到 shared palette 同档 `Foreground2`（orange → `colorPaletteDarkOrangeForeground2`，Fluent v9 没有 `colorPaletteOrangeForeground2`），随主题下发 `wtslIdentity`，插件写成 `--wtsl-identity`。只允许出现在 20px identity 图标（可选 1 处 2px 状态强调），禁止卡背景/大数字/按钮填充/空态色块。
  5. **空态**：中性单色 24–32px 图标 + 12px caption，不再用彩色色块。
  6. **材质**：宿主卡片统一 12px 圆角、`shadow4`（hover 8）+ 72% `colorNeutralBackground1` + blur + `colorNeutralStroke2`；插件不覆盖卡框。
  7. **动效**：继续只走 `motionTokens`；插件共享 `motion.js` 已有 reducedMotion 变体，`base.css` 再为内联 transition 提供 reduce 兜底。
- 实现：`src/host/plugins/identity.ts`、`src/host/plugins/manifest.ts`、`src/host/plugins/manager.ts`、`src/host/desktop/WidgetCard.tsx`、`public/plugins/_shared/{base.css,host.js,ui.jsx,typography.js}` 与六个插件 `src/**`；产物 `app/app.js` 已重建。
- 验证：`npm run typecheck` exit 0；`npm run build` 通过（2227 modules，2.41s）。

## D-37 壁纸三模式 / 欣赏壁纸 / 一次性解释文本 / 说明条参与布局（2026-10-25，v0.6.0）

- 背景：v0.4.0 的壁纸只有「一天一张、12h TTL、三源兜底（bimg → apifox → 原生）」一种形态，说明是左下角一条静态文本。用户要能换图（钉住喜欢的、用自己拍的），并且能在桌面完整看这张图；而「完整看图」需要一个入口，说明条是桌面上唯一能承载它的东西。同时说明条高度本来就是由文字内容决定的，布局却把它当成固定留白——两件事在本轮一起解决。
- 决策：
  1. **数据层固定必应官方归档**（`shell/wallpaper.ts`）：`HPImageArchive.aspx?format=js&idx=<n>&n=8&mkt=zh-CN`，`mkt` 是常量 `zh-CN`（第三方镜像的 `url` 与文案常落后官方，且它们无法保证 mkt 一致）。4K 只能由 `urlbase + '_UHD.jpg'` 拼出（3840×2160），不补 `&w=`/`&h=`。历史最多 **15 天**：`idx=0&n=8` 与 `idx=7&n=8` 两页合并去重（`idx>=8` 只是重复最后 8 条）。缩略图没有独立参数，用官方 1080p `url` 懒加载。
  2. **三模式互斥**：`auto`（按**本地日期**选「日期不晚于今天」的最新一条，不用固定 TTL；`autoUpdate=false` 时保留当前图、跨天也不跟）、`pinned`（`pin(entry)` 后忽略日期变化，`refresh()` 不动 current）、`local`（本机图片，二进制在 IndexedDB，键按文件内容寻址 `local:<内容哈希>`，说明文字按内容地址挂）。设置页同一时刻只渲染当前模式那一组控件；模式状态存 `wtsl.wallpaper.v2`（只存元数据，不含二进制；`v1` 只读一次做迁移、迁移后不删旧键）。
  3. **说明条高度 `H_p` 是布局输入，不是固定留白**：`layoutFrame(metrics, vw, vh, H_p)` 把整块「网格 + 一个 gutter + 说明条」在视口内垂直居中，1440×960 / `H_p`=26 → `unionH` 906、`insetY` 27、网格 (22,27)-(1418,895)、pill (22,907)-(1418,933)；**chat 入口下缘 = pill 下缘 933**（right 22 / bottom 27，不是网格下缘 895）。`H_p` 由说明条自己的 ResizeObserver 量 border-box 后经 `reportFooterPillHeight` 上报（取整 + 去重 + 丢弃 NaN/负数），首帧用 token 推算的 `FOOTER_PILL_ESTIMATE`=26（`lineHeightBase200` 16 + 2×`spacingVerticalXS` 4 + 2×`strokeWidthThin` 1），实测与估计相等时不产生重排。**`H_p`=0 的语义 = 没有说明条 → 网格单独上下居中（22/22/46/46，入口下缘贴 914、面板 868）**，已落地：`normalizeFooterPillHeight` 只拒绝负数 / NaN，0 是合法值。
  4. **说明条即欣赏壁纸入口**：说明条改为 `<button type="button" aria-pressed>`（点击进入 / 再点退出 / Esc 退出，会话内状态、不持久化；隐藏说明条或离开桌面页自动退出）。视觉高度保持 26（这是它继续作为 `H_p` 的前提），44×44 命中区由 `::after` 用 `calc(-(44−26)/2 - strokeWidthThin)` 外扩，不改 padding、不占布局高度。进入时卡片只做 opacity（+ MOTION §3/§6 已有的 4–8px 量级 `translateY`）淡出、`inert`、不重排，编辑 chrome / 分页点 / Agent 入口一并淡出/隐藏。
  5. **一次性解释文本**（`agent/oneshot/**`）：欣赏模式下对当前必应图发**一次**独立调用——不碰 `useAgentSession`、不写会话、不产生气泡、不接 TTS；请求强制 `web_search`（覆盖 settings 快照，不受设置页开关影响），模型没检索就判失败不落库；输出按提示词约束 + 客户端 `sanitize.ts` 二次降级成纯文本 ≤120 字；缓存键 = `${内容地址}|${mkt}|${PROMPT_VERSION}`，存独立 IndexedDB 库 `wtsl.wallpaper-note`；失败行记 `lastFailureAt`，**24h 内不再重试**（配置类错误不写冷静期），同键并发只发一次请求。本机图片不发请求（没有可搜的元数据）。
- 否掉的方案：
  - **中轴对齐**（说明条与 chat 入口按垂直中线对齐）：26 高的 pill 与 56 高的入口按中轴对齐时底边差 `(56−26)/2` = 15，肉眼就是「没对齐」；改为**下缘共线**（两者都取 `layoutFrame().pill.bottom`），入口上缘越过网格下缘是这条规则的必然结果，不是算错（`entryGeometry.ts` 的注释与 `breakpoints.ts` 的 `axis` 字段都按这个口径写的）。
  - **把说明条并入网格**（恢复一条等高带子：网格下缘固定 914、底部 46 恒定）：说明条高度由文字内容（语言、字阶、缩放、是否本机图）决定，写死带子等于再引入第二套「真实高度 vs 预留高度」的口径，v0.6.0 前的不对称 bug 正是这么来的；宁可让网格随 `H_p` 动，也不让说明条被裁在带子里。
  - **为 Windows 10 1809 / 旧 WebView2（Chromium 96–100）单独做降级适配**：目标设备是 Win10 19044 的 Evergreen 运行时；页面级 94% 材质已有 `@supports` 分档（`styles.css:32-51`、`PageScaffold.tsx:48-65`），说明条这一层不再加第二套机制。已知残留：旧运行时会把 `color-mix(…78%…)` 整条丢弃 → 说明条没有底色（描边与文字仍在，布局与可读性不受影响）；真要覆盖 1809，按同一 `@supports` 口径补一条不透明中性底，不新开降级路径。
  - **bimg / apifox 作主源**（沿用 D-31 §2 的三源兜底）：镜像落后官方、`mkt` 无法保证，且多源让「今天这张图是哪张」不可复现；改单一官方源后失败只体现 `status`（不产生任何用户可见文案）。
- 兼容与数据：`wtsl.wallpaper.v1` 只读一次迁移到 `v2`，旧键保留（回滚路径）；`--wtsl-desktop-backdrop` 等旧壁纸变量不再是数据来源；「说明条是否显示」单独存 `wtsl.wallpaper.ui`（`captionHidden`，缺字段/坏数据回落默认）。
- 文档落点：几何口径 `TOKEN-MAP §1/§6`、`AGENT-SURFACE-CONTRACT §1/§14.1/§20`、`components/agent.md`、`DENSITY §1.1-5`、`DESIGN §1.1/§6`、`FLUENT2 §5/§7/§14`、`PLUGIN-CONTRACT §栅格`；动效 `MOTION §5.2`；数据层与模式在 `DESIGN §6`。
- 实现状态：`H_p`=0 通道已落地——`layout/footer.ts` 只拒绝负数/NaN（0 合法），`layout/breakpoints.ts` 的 `normalizeFooterPillHeight` 把 0 当有效值、`frameInset` 不再为 pill 行预留 gutter，`desktop/WallpaperLayer.tsx` 在说明条不渲染时上报 0；隐藏说明条后网格 (22,46)-(1418,914)、入口 (1362,858)-(1418,914)、对话面板 516×868，与显示态共用同一个 `layoutFrame`。

## D-38 欣赏壁纸收口：说明文本 v2 硬校验 / 手动重新生成 / 说明条按下形变 / 卡片缩放归位 / 磨砂诊断（2026-10-25，v0.6.0）

- 背景：D-37 把说明条变成欣赏壁纸入口、并加了一次性解释文本，但五处仍与规范或用户预期有缝：①提示词只「建议」中文与不写来源，模型偶尔整段英文或写「根据搜索结果…」，客户端只做字数/格式降级、没有语言与来源判定；②说明一旦生成或失败，只能等换图或 24 小时冷静期，用户无法手动重试；③说明条没有任何按压反馈（HIG：自定义按钮必须有按压状态），而任何改变高度的做法都会破坏 `H_p` 这个布局输入；④v0.6.0 之前的卡片 hover/press scale 加在内容层（contentLayer）上，属于跨 iframe 内容缩放；⑤「磨砂不明显」需要定位原因（材质配比/主题 vs 合成层）并给出是否调整 72% 与 blur 24 的结论。本轮一起收口。
- 决策：
  1. **说明文本 v2：提示词硬约束 + 客户端硬校验**（`agent/oneshot/**`）：`PROMPT_VERSION='v2'`。`SYSTEM_PROMPT` 输出规则新增——「正文只用简体中文，地名/物种等专有名词可保留原文，禁止英文句子、英文段落或任何用英文写的正文」；「禁止任何语言、任何形式的来源旁白（中文不写『根据搜索结果』『资料显示』『据检索』『我查到』，英文不写 According to / search results 之类），不列来源、不写作者署名」。`sanitize.ts` 新增 `detectNoteViolation`（`non-chinese` / `source-narration`：汉字数下限、拉丁字母占比上限、连续英文词串长度、中英文来源旁白句式），`generate.ts` 在落库前调用，命中即按既有失败路径处理（不落库、不向 UI 抛错、沿用 24 小时冷静期，配置类错误除外）。提示词与客户端判定不一致时以客户端为准。
  2. **手动「重新生成说明」**（`desktop/WallpaperLayer.tsx`）：欣赏壁纸模式下解释文本右侧出现 44×44（`TOUCH_TARGET`）图标按钮，`aria-label`「重新生成说明」、加载中 `aria-busy` + 禁用；只在有文本或加载中时显示（首轮就失败、没有任何可显示文本时不出现）。`useWallpaperNote` 返回 `{ text, status, refresh }`，`refresh()` 触发 `force`：跳过缓存成功命中与失败冷静期，强制搜索、语言与旁白校验照旧；加载中图标按 `durationUltraSlow` + `curveLinear` 旋转，reduced-motion 下不旋转。**不做**自动刷新、自动重试或轮询。
  3. **手动刷新失败保留旧说明**：`generate.ts` 的 `recordFailure` 在旧行 `text` 非空时直接返回，不把成功记录覆盖成失败行——说明卡不消失、也不进冷静期；首次失败仍照旧写冷静期。
  4. **说明条按下形变**：`transform: scale(0.985)`（TOKEN-MAP §11 已登记的 C 值，与 MOTION §2 卡片 pressed 同档），`transform-origin: center center`；按下 50ms `durationUltraFast` + `curveAccelerateMin`、hover 进入 100ms `durationFaster` + `curveDecelerateMin`、hover 离开与松手回弹 100ms `durationFaster` + `curveAccelerateMin`（松手后仍 hover 时走 hover 进入档；MOTION §1 用途表，全部是 `motionTokens`）。`transform` 只走合成层、**不改变 border-box**，`H_p` 仍为 26（`FOOTER_PILL_ESTIMATE` = `lineHeightBase200` 16 + 2×`spacingVerticalXS` 4 + 2×`strokeWidthThin` 1）；高度测量因此改用 `offsetHeight`（布局 border-box），不再用会随缩放变化的 `getBoundingClientRect()`。44×44 命中区仍由 `::after` 外扩，不改 padding / border / 高度。reduced-motion 下不合并按下形变类——按钮完全没有 transform，只保留 100ms 颜色与描边变化（MOTION §7）。
  5. **卡片缩放归位**（`WidgetCard.tsx` + `desktop.styles.ts`）：hover / press / 长按 / 编辑模式四种 scale 全部叠在 Fluent `Card` 本体的 `transform` 上（宿主外层，`cardTransform`）；内容层（承载 iframe 的 `contentLayer`）永久 `transform: none`，并且不再声明 `will-change`。`Card` 与翻页轨道 `track` 的 `will-change: transform` 保留（它们是缩放/翻页的合成层提示）。MOTION §2 状态机参数不变，reduced-motion 下 Card 也不缩放。
  6. **磨砂诊断：不改 72% 与 blur 24**：真实 2880×1920 / DPR2 窗口截图实测 `backdrop-filter` 确实在对壁纸合成（卡片区域 Laplacian 方差 0.02，见 `.tmp/blur-diag/diag2-analysis.json`；卡外同一片壁纸 lapVar 约 1994，见 `real-compare.json`；透明卡面 blur 与 no-blur 的方差比 0.00036，见 `diag-analysis.json`）。把卡片自身与全部祖先的 `will-change` 内联改为 `auto`、以及把 `isolation` 改为 `auto`，卡片区域像素 diff 均为 0.0（`diag2.json` 的 dark/light-material-blur-vs-wc-auto、`diag-analysis.json` 的 s3–s6/s9 对比 lapVarRatio 均为 1.0）。**本轮不修改 72% 与 blur 24 这两个 C 值**：它们是 D-31 登记值，磨砂强弱由材质配比与壁纸内容决定；要动必须先按 TOKEN-MAP §11 与本节登记。
- 否掉的方案：
  - **只在提示词里写「尽量中文 / 别写来源」**：软约束不可判定，模型照犯仍会落库；改为提示词硬约束 + 客户端 `detectNoteViolation` 命中即失败不落库。
  - **手动刷新失败时照常写失败行**（原 `recordFailure` 行为）：说明卡立刻消失、还要等 24 小时冷静期；改为旧行是成功记录时保留不覆盖。
  - **说明条用 0.98 / 只做颜色反馈 / 不做按压反馈**：0.98 是 MOTION §5.1 的 Agent 按钮档，与卡片 pressed（0.985）不同档；26 高的带状说明条只改底色变化太弱（HIG：没有按压反馈用户会怀疑输入未被接收）；用户拍板取 0.985，与卡片 pressed 同档。
  - **用 `getBoundingClientRect().height` 量 `H_p`**：按下时量到缩放后的高度，经 `reportFooterPillHeight` 会让整张网格在按下/松手时抖动一次；改为 `offsetHeight`，`H_p` 语义（border-box=26）不变。
  - **把 scale 留在 contentLayer 上**（D-37 实现）：属于 MOTION §10 明确不做的「跨 iframe 内容缩放」；改为只作用 Card 本体。
  - **改 72% / blur 24、或移除 `will-change` 来「让磨砂更明显」**：实测无效（像素 diff 0.0），且 72%/24 是 D-31 登记值，改它需要新的 C 登记；不动。
- 证据：磨砂/合成诊断 `.tmp/blur-diag/{diag2.json,diag2-analysis.json,diag-analysis.json,real-compare.json}`（本地证据，不入库）；提示词与硬校验 `src/host/agent/oneshot/{prompt,sanitize,generate,useWallpaperNote}.ts`；说明条按压与手动重新生成 `src/host/desktop/WallpaperLayer.tsx`；卡片缩放归位 `src/host/desktop/{WidgetCard.tsx,desktop.styles.ts}`。
- 文档落点：动效 `MOTION §5.2/§7/§8/§9`（§2 状态机数值表未改，只在文字里引用其 pressed 档）；材质与说明条视觉 `FLUENT2 §7`；一次性解释文本契约 `AGENT-SURFACE-CONTRACT §20.1/§20.2`；`TOKEN-MAP §11` 无新增 C 值（0.985、44 已在册；50/100/500ms 均为 `motionTokens` 档位），本轮不改。
- 实现状态：`src/host/agent/oneshot/{prompt,sanitize,generate,useWallpaperNote}.ts`、`src/host/desktop/{WallpaperLayer.tsx,WidgetCard.tsx,desktop.styles.ts}`。

## D-39 蓝牙音箱（A2DP Sink）：系统能力进宿主，UI 复用设置页（2026-10-27）

- 背景：旧 WinUI 版有 `BtAudioPlugin`（`735c530`，2026-08-30），用 `AudioPlaybackConnection` 把平板当蓝牙音箱；`5fdc618` 删除 WinUI 实现时未做「不做蓝牙」的决策，能力丢失。当前插件是 iframe，拿不到 WinRT；按「系统能力进宿主」的口径，蓝牙音频不能做成插件。**初版实现额外加了宿主全屏页 / 路由 / 命令总线 / 偏好组，评审确认属于过度设计，按「勿增实体」收敛为设置页内的一个分组。**
- 决策：
  1. **宿主 Rust 后端**（`src-tauri/src/bluetooth_audio.rs`）：`BtAudioManager`（Mutex）持有 `AudioPlaybackConnection` 与设备缓存；6 个命令 `bt_audio_snapshot/refresh/connect/disconnect/set_bluetooth/open_settings`；WinRT 调用全部在 `spawn_blocking` 线程里先 `RoInitialize(MTA)`，`join()` 不跑 UI 线程；连接对象长期持有在 `enabled` 字典（社区已知的「~5 秒断连」根因是对象/委托被回收）。
  2. **连接时序**：`TryCreateFromId → Start() → OpenAsync()` 3 次 ×500ms 重试；`OpenAsync` Success 后再轮询 `State` 至多 500ms 等 `Opened`。快照额外给 `connected`（已连、手机可能还没推流）与 `streaming`（`State=Opened`）两个布尔：打开成功但手机未播放时 State 本来就是 Closed，不能据此判掉线；`ever_opened` 记录本次是否进过 Opened，推流后回到 Closed 才判断开。
  3. **UI 形态**：设置页「常规 → 设备」里的 `BluetoothSpeakerSettings` 分组（`src/host/pages/settings/BluetoothSpeakerSettings.tsx`）。不新增宿主页面 / 路由 / `PAGE_TITLES` / 事件总线 / 图标 / 搜索项；状态落在 `SettingsGroup` + `SettingsRow` 的 label/description 里，动作只有 Fluent Switch / Dropdown / Button / Badge / MessageBar；只在设置页挂载期间轮询快照，离开即停。
  4. **Agent 内置工具（4 个）**：`btAudio.status/devices/connect/disconnect`；`connect` 支持 deviceId 或 deviceName 精确匹配，找不到时把设备列表回给模型重选；不做 `openSettings`（没有新页面可开）。
  5. **不做的实体**：自动连接 / 连接通知 / 上次设备记忆（`wtsl.btAudio` 偏好整块删除）、桌面卡、底部状态簇入口、独立预览 mock。配对是外部一次性动作，空态/失败只给「蓝牙设置」兜底（复用 `settings_win::open` 的前台交接）。
  6. **MVP 不配对**：只操作「已配对、可推送音频」的设备（`AudioPlaybackConnection.GetDeviceSelector`）；旧版配对 PIN 仪式（`PairingRequested` 必须 handler 内同步 Accept）与 SMTC 媒体信息/播放控制后置。
- 探针证据（2026-10-27，Windows 10 19044 解包 exe）：`AudioPlaybackConnection.GetDeviceSelector()` 可用；`Radio.GetRadiosAsync` 找到蓝牙无线电，`SetStateAsync(当前状态)` 返回 `RadioAccessStatus.Allowed`；`GlobalSystemMediaTransportControlsSessionManager.RequestAsync()` 可用；无已配对手机时设备列表 0。解包 exe 下 A2DP Sink / 无线电 / SMTC 入口可用，配对与真实推流仍需手机实机验证。
- 否掉的方案：
  - **插件卡**：iframe 没有 WinRT，且插件被禁用/卸载时系统能力随之消失；真要做桌面常显卡，需先加 bridge + 新插件包，实体更多，等有需求再说。
  - **宿主全屏页 + 路由 + hostCommandBus**（初版）：一个设备设置不需要新的页面框架；`WallpaperSettings` 已证明「宿主能力以分组形式进设置」的先例。
  - **MVP 塞入自动连接/通知/偏好、配对 PIN 与媒体控制**：都是额外状态与额外 UI；先保证「能连上、能出声」。
  - **把 `State=Closed` 直接当断开**：手机还没播放时就是 Closed，会误报「连接已断开」。
- 文档落点：本节；`DESIGN §8`；`README` 特性与安装说明；旧行为考古 `.tmp/bt-speaker/{HISTORY,UX-SPEC,RUST-WINRT}.md`（本地证据，不入库）。
- 实现状态：Rust `cargo check --lib` 通过；`typecheck` / `build` 通过；**v0.7.0 正式构建成功**（NSIS `Windows Tablet Launcher_0.7.0_x64-setup.exe` 4.10 MB / MSI 5.10 MB），`/S` 静默覆盖安装 exit 0，注册表 `DisplayVersion=0.7.0`，安装版 `app.exe` FileVersion 0.7.0 并正常运行；用户确认手机可连接播放；安装版状态栏显示「音箱 / 38% / 98%」。
- v0.8.0 修订（D-42/D-43/D-44）：说明条交互重做为 A2（D-42）；即时控制进状态栏快速设置面板（D-43）；后台自动连接状态机（D-44）取代本条「不做自动连接 / 连接通知 / 上次设备记忆」的旧口径；「MVP 不配对」维持不变。设置页分组保留自动连接/首选/蓝牙开关/错误详情，重复的连接下拉已移除。

## D-40 桌面底部状态栏：系统状态（电量/充电/音量/蓝牙音箱）进宿主 chrome（2026-10-27）

- 背景：用户要求桌面至少保留一个状态面，且电量、充电、音量等可以一起融进去；放在底部，并和现有说明条 / Agent 入口的底部几何对齐。这是宿主 chrome，不是插件（系统状态读取是宿主能力），也不新开页面。
- 决策：
  1. **只读系统状态走宿主 Rust**（`src-tauri/src/system_status.rs`）：`GetSystemPowerStatus` 读电量/AC 状态；CoreAudio 默认渲染端点 `IAudioEndpointVolume` 读主音量/静音；命令 `system_status_snapshot` 统一返回 camelCase 快照，失败项为 `null`。蓝牙音箱状态复用 `bt_audio_snapshot`。
  2. **状态栏是桌面层的一个 chrome**（`src/host/desktop/StatusBar.tsx`）：右侧定位，右缘 = Agent 入口左侧一个 gutter，**下缘 = `layoutFrame().pill.bottom`**（与说明条、Agent 入口同一条线）；材质与说明条同一套 token（78% `colorNeutralBackground1` + `--wtsl-material-blur` + `shadow4` + 1px `colorNeutralStroke2` + 圆形圆角），高度由 20px 图标 + `size 200` 文本 + `spacingVerticalXXS` 内边距 + 1px 描边组成（= `FOOTER_PILL_ESTIMATE` 26）。
  3. **布局输入复用 `H_p`，不新增第二套几何**：状态栏用 ResizeObserver 实测高度并上报 `reportFooterStatusBarHeight`，`footer.ts` 以 `H_p = max(说明条, 状态栏)` 通知所有消费者。说明条隐藏（`H_p` 原本 0）时状态栏仍把底部带撑住，网格不会压到状态栏；欣赏壁纸 / 编辑模式隐藏状态栏但保留高度上报，避免布局抖动。
  4. **信息表达**：每项「20px 图标 + `Text size={200}`」冗余编码，不只靠颜色；蓝牙音箱项用品牌色/成功色 + 文字（接收中/已连接/音箱/蓝牙关）；音量显示百分比/静音；电量显示百分比，充电时用 BatteryCharge 图标。唯一交互项是蓝牙状态按钮：44×44 命中区由 `TOUCH_TARGET` 外扩（不改视觉高度），点击回设置页「常规 → 设备」；音量/电量为只读信息（控制面后置）。
  5. **隐藏与层级**：桌面层内渲染，`visibility`+`inert` 隐藏（不卸载，保留高度测量）；层级用 `--wtsl-layer-desktop`，低于页面/浮层。浏览器预览用 `?statusDemo=1` 的静态假数据检查布局，不参与产品逻辑。
- 否掉的方案：
  - **做成插件卡 / 底部状态簇入口**：系统状态不是插件能力；桌面上再加一张常显卡会抢小组件的信息预算，用户要的是底部一条窄 chrome。
  - **把状态塞进时钟/天气插件**：跨插件拼装属于宿主；插件只对自身数据负责。
  - **单独做「系统状态」页面或 popover**：一个常显状态不值得一个新页面/浮层；只读信息直接放桌面层。
  - **写死 bottom/right 像素**：全部由 `layoutFrame`、`FOOTER_PILL_ESTIMATE`、`TOUCH_TARGET` 与 Fluent spacing token 推导；命中区用 `TOUCH_TARGET` 外扩公式，不写裸 44。
  - **用电量/音量做交互控件**：MVP 先只读，避免在没有明确控制语义时引入滑杆/弹层实体；控制面在后续系统控制能力里统一做。
- 证据（本地，不入库）：`src-tauri/src/system_status.rs`、`src/host/desktop/StatusBar.tsx`、`src/host/layout/footer.ts`、`src/host/App.tsx`、`src-tauri/src/lib.rs`（启动预热 refresh）。
- 真机验证（Tauri，2026-10-27）：`shots/bt-ui/tauri-installed-0.7.0-2.png`（安装版 0.7.0，状态栏「音箱 / 38% / 98%」；`tauri-desktop-final2.png` 为调试版同口径对照）、`shots/bt-ui/tauri-settings-2.png`（设置页「蓝牙已开启 / 还没有配对的手机 / 蓝牙设置」）。浏览器 1440×960 几何实测 `right=1350` / `bottom=933` / `height=26`，与 Agent 入口下缘 933 共线、间距一个 gutter；独立审查 `.tmp/bt-speaker/UI-REVIEW-2.md`。状态栏轮询 2s、设置分组轮询 1.5s（行为常量，不进设计 token）。
- 文档落点：本节；`DESIGN §8`；`README` 特性；`DENSITY` 底部条口径在实现后按需补一句（本轮不改规范数值）。
- 实现状态：Rust `cargo check --lib` 通过；`typecheck` / `build` 通过；独立审查 P0（蓝牙按钮命中区 40px < 44）已修为 `::after` 纵向 `TOUCH_TARGET_CSS`；手机配对推流待实机验证。
- v0.8.0 修订（D-41/D-43）：状态栏不再只读——整条可点、展开快速设置面板（D-43）；材质/状态统一到 D-41（72% 表面、hover 1.02 / pressed 0.98）；图标改 16/12、暗色品牌填充 brand 90。

## D-41 桌面表面统一：材质 / 状态 / 图标档位（2026-10-28，v0.8.0）

- 背景：桌面 chrome（说明条、chat 入口、状态栏）与 widget 卡片各自写材质与 hover（72% / 78% / 实色；shadow4/8 混用；只有卡片有缩放状态机），用户指出「设计样式应当统一，而不是各自为政」；同时追问 0.985 是否为 Fluent token。
- 决策：
  1. **唯一表面**：`colorNeutralBackground1` 72% + `--wtsl-material-blur`（24）+ `colorNeutralStroke2` 1px + `shadow4`；卡片/浮层圆角 12（`borderRadius2XLarge`）、胶囊圆形。说明条/状态栏从 78% 收敛到 72%；chat 入口从实色改为 72% + blur。
  2. **唯一状态机**（MOTION §2）：hover `scale(1.02)` + shadow8 + stroke1（100ms decelerate）；pressed `scale(0.98)`（50ms accelerate）；松手/离开 100ms accelerate；focus 2px `colorStrokeFocus2`；reduced-motion 不做 transform。hover/pressed 数值统一（用户拍板 1.02/0.98，原 1.015/0.985 废止；1440×960 @200% DPI 不担心发虚）。
  3. **共享常量**：`design/metrics.ts` 的 `SURFACE_HOVER_SCALE = 1.02` / `SURFACE_PRESS_SCALE = 0.98` / `SURFACE_LONG_PRESS_SCALE = 0.97`；`WidgetCard`、`WallpaperLayer`、`desktop.styles` 等不再写本地字面量。TOKEN-MAP §11 标注「项目 C 值，非 Fluent token」——Fluent 2 tokens 只覆盖颜色/字体/间距/圆角/描边/动效时长与曲线，没有交互缩放 token；Fluent UI v9 组件按下默认只改颜色。
  4. **图标**：桌面 chrome 只用 `@fluentui/react-icons`（禁手绘 SVG、禁混用其他图标集）；状态栏内联信息图标 **16 + 文字 12**（Fluent 图标库 Bluetooth/Speaker2 无 12 档，16 是最小可用信息档），按钮类图标 20。
- 否掉：继续按表面各写一套 hover；自造 1.03 小表面档（用户要求跟 widget 一致）；缩放 20 图标到 12（违反 Fluent「按具体尺寸使用、不要缩放」）。
- 文档落点：FLUENT2 §7/§9、MOTION §2/§5.2、TOKEN-MAP §11、DESIGN §8、README。
- 实现/验证：`npm run typecheck` 通过；浏览器与真机截图见 v0.8.0 发布验证。

## D-42 壁纸说明条 A2：非欣赏无 chevron、欣赏态默认展开、刷新迁移设置页（2026-10-28，v0.8.0）

- 背景：用户在看完多版 P0 后明确交互：非欣赏态说明条只应整条可按（无展开按钮）；进入欣赏壁纸后默认展开详情，并用「最小变形」把 chevron 拉出来；展开态文字区 = 退出欣赏、chevron = 折叠（语义不得混）；详情不重复说明条已有信息（标题/版权），只留日期/来源 + 说明；文字左轴 = 说明条内容左轴、右轴 = 箭头视觉右缘；日期只左对齐；说明条宽度不出现省略号（min 256，最大随文字动态变化）；刷新说明低频，移到设置页。
- 决策：
  1. **结构**：非欣赏态一个按钮（无 chevron）；欣赏态渲染 chevron（20 图标 + 8 间距 + 右 8 padding，44×44 命中伪元素外扩）并默认展开；底部 pill 行保留（文字区 = 退出欣赏、chevron = 折叠）；退出欣赏自动收起、chevron 消失。
  2. **宽度**：非欣赏 `max-content` + `min-width: 256`（8×XXXL）；不设固定上限、不出现 ellipsis；极端超长换行兜底（H_p 实测自适应）。展开宽度只 **+36**（gap 8 + 20 图标 + 行尾呼吸位 8；v0.8.1 修正为内容驱动，见 D-45）；详情左右 padding 12，右轴按箭头图标**视觉**右缘（盒右 412 / 图标视觉右 ≈408，与正文右 408 同线）；日期/来源只左对齐；正文 `text-align: justify`（左右都贴内容带，最后一行左对齐）。
  3. **展开是浮层**：H_p 恒 26（只测底部 pill 行 `offsetHeight`），网格/入口/状态栏不动；展开 250 / 收起 150、reduced-motion 只淡入；点外部/Esc 收起（不退出欣赏）；与状态栏面板互斥。
  4. **刷新迁移**：移除旧 noteRow /「重新生成说明」按钮；说明刷新移到设置 → 外观 → 壁纸「说明」行（打开设置页只读缓存状态，点刷新才 force 一次；固定模式选图后目标随之切换）。
- 否掉：非欣赏态保留展开按钮（语义冲突）；展开卡固定 420 / 无 min-width；正文左对齐（右侧参差，用户肉眼判不齐）；桌面放刷新按钮。
- 文档落点：MOTION §5.2、DESIGN §8、FLUENT2 §7、TOKEN-MAP §11、README。
- 实现：`WallpaperLayer.tsx`（WallpaperCredit 重写）、`WallpaperSettings.tsx`（说明行）；typecheck 通过；真机截图见发布验证。

## D-43 状态栏快速设置面板 + 系统控制（2026-10-28，v0.8.0）

- 背景：用户要求状态栏可点、触控优先地快速调音量/静音/亮度、选择蓝牙设备与首选、自动连接；并给 P0 定稿：面板与说明条同源 morph、底部保留状态栏行 + chevron、折叠时 chevron 一起隐藏；暗色面板填充用 brand 90；已选 star 用实心；检测到自动亮度才显示该行。
- 决策：
  1. **状态栏整条按钮**：统一 surface（D-41）；图标 16 + 文字 12；gap 20/4、padding 12；保留轮询（系统状态与蓝牙拆开，避免慢链路阻塞电量/音量）。
  2. **点击展开 QuickSettingsPanel**：右缘/下缘不动、宽高/圆角/阴影 morph（250/150）、内容淡入；底部保留状态栏行 + chevron（折叠时一起隐藏）；点外部/Esc 折叠、焦点回状态栏。
  3. **面板内容**：自动连接 Switch、设备列表（点行连接；唯一首选 star：`Star20Filled` / `Star20Regular`）、音量（静音 + Slider）、亮度 Slider、自动亮度（条件行）、打开 Windows 蓝牙设置。交互行 44；滑杆触控优先、鼠标/键盘兼容；拖动本地乐观 + 节流提交。
  4. **系统控制 Rust 命令**：`system_status_snapshot` 增加 `brightnessPercent` / `autoBrightnessSupported` / `autoBrightnessEnabled`；`system_set_volume` / `system_set_muted` / `system_set_brightness` / `system_set_auto_brightness`。亮度走 WMI（内置屏），自动亮度检测环境光传感器 + 电源设置 GUID；写入权限不足返回 Err、前端隐藏/降级。
  5. **颜色**：暗色面板填充 brand 90（#2886de，Fluent brand ramp），亮色用 `colorBrandBackground`；链接/star 用 `colorBrandForeground1`；不引入自造色。
- 否掉：状态栏只读（D-40 旧口径）；把控制放设置页（用户要就地快速调整）；面板另起浮层实体（与说明条同源 morph）；暗色用 brand 100（用户拍板 brand 90）。
- 文档落点：MOTION §5.3、DESIGN §8、FLUENT2 §7/§9、README、D-40 修订。

## D-44 蓝牙自动连接状态机：首选 + MRU/FIFO 回退、事件驱动、用户意图（2026-10-28，v0.8.0）

- 背景：用户要求后台一直进行自动连接：首选设备优先，失败按顺序尝试下一台；未设首选按 FIFO；收到系统「设备已连接」通知而当前无连接时主动连；手动断开后本轮不自动连（除非自己手动连上，之后被动断开才恢复自动寻找）；手动连接不自动改首选；不做配对流程。
- 决策：
  1. Rust 常驻 worker（MTA 专用线程）持有 `DeviceWatcher`（AudioPlaybackConnection selector）+ `StateChanged`；事件只投递 worker；所有连接操作串行；退出显式 shutdown。
  2. 队列：preferred 第一，其余按最近连接时间（MRU）倒序，未连接过的按发现顺序；每轮从队头顺序尝试，全失败退避 5/15/30/60s。
  3. 用户意图：手动 disconnect → `paused`（不自动、不响应系统连接事件）；手动 connect 成功解除 paused；之后被动断开 → 恢复自动寻找；`resume_auto` 可显式恢复；手动连接只更新 lastConnectedAt，不改 preferred。
  4. 系统事件：设备 Added（已连接）且当前无连接、非 paused/off → 立即尝试该设备；已有连接不切。
  5. 持久化 `app_data_dir/bt-audio.json`（autoConnectEnabled 默认 true、preferredDeviceId、order、lastConnectedAt）；命令 `bt_audio_set_auto_connect` / `bt_audio_set_preferred` / `bt_audio_resume_auto`；快照增加 autoConnectEnabled / autoConnectState / attemptDeviceId / lastAttemptError / preferredDeviceId / order。
  6. 仍不做配对（延续 D-39）；媒体控制后置。
- 文档落点：DESIGN §8、README、D-39 修订、Agent 工具字段（btAudio.status/devices 透传新字段）。
- 实现/验证：`cargo check --lib` 通过；真机连接/自动重连/首选回退场景见发布验证。

## D-45 说明条真机回归修复：宽度累积 / chevron 点击失效 / 行尾呼吸位 / 背景层缩放（2026-10-28，v0.8.1）

- 背景：v0.8.0 真机回归发现四个问题：① 反复进出欣赏后说明条越来越长；② 欣赏态点 chevron 展开时常无效；③ 非欣赏态左右 padding 不对称（右侧多 8）；④ 展开/收起与 hover 的整体缩放不自然。用户另指出展开态 chevron 右侧没有 spacing、紧贴圆角边很难看。
- 根因（CDP 多轮复现实测，非猜测）：
  1. 宽度累积：`baseWidth` 在退出欣赏的 layout effect 里量 `shell.offsetWidth`，此时 width 过渡（baseWidth+28 → baseWidth）还没结束，读到的仍是旧宽度 → 每进出一次 +28。
  2. chevron 失效：`noteShell` 的 `:active { transform: scale(0.98) }` 让按下后的按钮几何收缩，chevron 从指针下移开，release 落在按钮外 → click 派发到共同祖先（creditStack），React `onClick` 收不到；CDP 事件日志显示 pointerdown target=svg、click target=DIV。
  3. 左右不对称：`noteRow` 的 `paddingRight: 8`（给 chevron 的呼吸位）在非欣赏态也生效。
  4. 动效：整壳 width/height 做 layout 过渡，文字逐帧重排（拉伸感）；height 在 auto↔px 间无法补间（瞬跳）；缩放把文字一起放大（发虚）。
- 决策：
  1. **宽度内容驱动**：删除 baseWidth/detailHeight 测量与显式 width/height；非欣赏 = main（padding 16/16）；欣赏 = main + gap 8 + chevron 20 + `noteRowGallery` paddingRight 8 → 只向右 +36；删除 ResizeObserver。
  2. **命中稳定且内容跟随缩放**：hover 1.02 作用在**整壳**（文字/图标一起放大，与 widget 卡统一）；pressed 不缩放（`:active` 只加深背景）——按下时几何收缩会让 chevron 从指针下移开、click 被派发到祖先；展开态不做 hover 缩放。
  3. **展开 morph**：`grid-template-rows: 0fr → 1fr` 补间高度（不再测量 detail 高度），详情内容随 wrap opacity 淡入；不补间 width/height。
  4. **行尾呼吸位**：仅欣赏态给 `noteRow` 加 8 paddingRight；非欣赏态左右 padding 对称。
  5. **层级**：材质伪元素 z-index 0，noteRow / noteDetailWrap 抬到 z-index 1（否则 backdrop-filter 的半透明面盖住详情文字——截图表现为「内容在、视觉空白」）。
  6. **详情宽度锁定**（v0.8.1 二次修正）：`noteDetailWrap` 用 `width: 0; min-width: 100%`，让长正文不参与 shell 的 max-content 计算——否则真机 AI 说明（一段长文本）会把展开卡撑到近全屏、正文不换行。
- 否掉：继续用测量宽度 + 固定 +28（脆弱且与内容耦合）；整壳 scale 换 `transform-origin` 规避（命中漂移仍在）；用 max-height 补间高度（内容动态时需要魔法数）。
- 文档落点：MOTION §5.2、DECISIONS D-42 修订、`WallpaperLayer.tsx` 头注释。
- 实现/验证：`npm run typecheck` 通过；CDP 多轮「进入 → 折叠 → 退出」宽度恒定（263 ↔ 299）；chevron 每轮点击有效；非欣赏左右对称；展开态详情可见（日期 + 说明/Spinner）；真机安装验证见发布记录。

## D-46 蓝牙退出清理：窗口关闭时后台断开、关无线电让 iPhone 真正断开（2026-10-28，v0.8.1）

- 背景：用户反馈「退出应用后手机仍显示已连接」。真机实测（v0.8.1 安装版，自动连接 iPhone 后点窗口关闭）：进程 10.2s 后才消失（系统按无响应结束），日志只写到「应用退出，停止蓝牙音频 worker」。加同步 trace（`%TEMP%\wtsl-exit-trace.log`）后定位到两件事：
  1. 在 `RunEvent::Exit` 阶段（WebView2 与事件循环已在拆除）调用 `Close()` 会卡死，后续日志全部丢失；改成 `CloseRequested` 时先隐藏窗口、后台线程清理后才退出。
  2. 修掉时序后，`Close()` 约 0.6–0.9s 返回成功，但 `BluetoothDevice.ConnectionStatus` 在 2/4/…/14s 全部是 `Connected`——**`AudioPlaybackConnection.Close()` 只释放应用侧，iPhone/Windows 的 ACL 链路不会因此自动断开**（手机端因此一直显示已连接）。`State()` 在 Close 后访问也会同步卡死（trace 停在 Close 返回后），已删除该轮询。
- 决策：
  1. 拦截 `WindowEvent::CloseRequested`：`api.prevent_close()` + 隐藏主窗口（用户立即看到窗口消失），后台线程清理，完成后 `app.exit(0)`；15s 兜底强退；`RunEvent::Exit` 只兜底（`AtomicBool` 只执行一次）。
  2. 清理顺序：停 watcher → `Close()`（不轮询 State）→ **若有活动连接则关闭蓝牙无线电**（`Radio.SetStateAsync(Off)`，强制断开 ACL）→ 等 `ConnectionStatus == Disconnected`（≤5s）→ 落盘配置。
  3. `bt-audio.json` 增加 `radioOffByExit`：退出关无线电前写入；下次启动 `initialize` 恢复打开并清标记（用户不会遇到「蓝牙无缘无故被关」）。只在与手机有活动连接时关无线电，普通退出不动蓝牙。
  4. release 也启用 `tauri-plugin-log`（默认写 `%LOCALAPPDATA%\com.huanchen.windows-tablet-launcher\logs`），这类退出链路问题只能靠文件日志回溯。
- 否掉：继续在 Exit 回调里同步 Close（COM 环境已拆除，必卡）；只 Close 等待系统自然断开（实测 14s+ 不断，手机一直显示已连接）；禁用手机 BTHENUM 设备实例（需管理员权限，且会把设备留在禁用状态）；退出不等待直接 `std::process::exit`（音频流关闭但 ACL 仍连接）。
- 文档落点：D-46、MOTION §5.2 无关、`lib.rs` / `bluetooth_audio.rs` 注释、发布说明。
- 实现/验证：`cargo check --lib` 通过；trace 确认 Close 不再卡、关闭耗时收敛到 ~1s + ACL 等待；手机端断开与启动自动恢复待本轮安装复测后回填。

## D-47 快速设置面板行首对齐：图标与滑杆共用 20 宽行首（2026-10-28，v0.8.1）

- 背景：真机截图显示面板「声音」行与「亮度」行明显错位——音量行行首是 44×44 静音按钮、亮度行行首是 20 宽裸图标，导致滑杆起点差 24、图标中心差 12；设备行图标（裸 20）又与音量行对不齐。
- 决策：所有行的行首占位统一为 **20 宽（图标本身宽）× 44 高**：
  - 音量行的静音按钮改为 20 宽布局盒，44×44 命中区由 `::after` 外扩（不占布局，与说明条 chevron 同口径）；
  - 亮度 / 自动亮度行的图标槽 `rowIconSlot` 改为 20 宽、`placeItems: center`；
  - 设备行 Phone 图标本就是裸 20，保持不变。
  这样行首图标左缘 = 面板内容左缘（与标题同轴），滑杆起点 = 行首 + 20 + gap 8 = +28，所有行一致。
- 否掉：行首统一 44 槽（图标中心距行首 22，会与标题/链接文字左缘差 12，肉眼仍不齐）。
- 文档落点：D-47、`QuickSettingsPanel.tsx` 注释。
- 实现/验证：`npm run typecheck` 通过；真机截图待本轮安装复测。

## D-48 快速设置「蓝牙音箱」= 总开关 + 进行中状态（2026-10-28，v0.8.1）

- 背景：用户反馈面板顶部开关关掉后仍显示「接收中」，已连接时点连接仍返回成功，操作过程中没有系统反馈（没有转圈/正在断开状态）。
- 根因：顶部开关实际绑定 `autoConnectEnabled`（自动连接偏好），关掉只停自动回连、**不断开当前连接**；命令进行中只禁用控件，没有视觉状态；「正在连接」只覆盖手动连接，自动尝试与断开过程都没有提示。
- 决策：
  1. 开关改为**「蓝牙音箱」总开关**（标题即语义）：开 = 自动连接开（若 paused 顺带解除）；关 = 先停自动连接、再断开当前连接（后端 disconnect 置 paused）。手动「断开」按钮语义不变（暂停自动连接）。
  2. **进行中状态用转圈 + 文案**，数据来自系统快照（connected / streaming / autoConnectState / attemptDeviceId）与前端命令 pending：
     - 标题行：`btBusy` 时显示小 Spinner；
     - 设备行：状态优先级「正在断开… > 正在连接… > 接收中/已连接 > 等待重试… > 未连接」，前两态带 `Spinner`；
     - 断开按钮：进行中显示「正在断开…」并禁用；
     - 开关 busy 时禁用，不假装瞬间完成。
  3. 删除面板「自动连接已暂停 / 恢复」行：总开关已表达，重新打开开关即恢复。
- 否掉：继续用自动连接开关（用户认知是总开关，语义不符）；关开关但保留连接（"关不掉"）；乐观先隐藏连接状态（手机端可能还没断，UI 会撒谎）。
- 文档落点：D-48、`QuickSettingsPanel.tsx` / `StatusBar.tsx` 注释、D-43 修订。
- 实现/验证：`npm run typecheck` 通过；浏览器 `?statusDemo` 面板文本 on=「接收中」→ off=「未连接」、开关视觉切换正确；真机转圈与断开耗时待安装复测。

## D-49 蓝牙音箱总开关联动：关掉就不寻找，打开就联动开蓝牙（2026-10-28，v0.8.1）

- 背景：用户指出「关闭蓝牙后蓝牙音箱不用再寻找，除非我打开蓝牙音箱」——一个动作应该联动蓝牙无线电/断开/寻找/自动连接，不能只盯着局部开关改。
- 问题：总开关只切自动连接，watcher 与设备枚举照跑（关掉仍「在找」）；系统蓝牙关闭时 worker 仍枚举/刷新；面板只能显示"接收中/未连接"，不表达"已关闭、不再寻找"。
- 决策：
  1. **后端新增 `bt_audio_set_enabled` 与 Worker `enabled`（持久化）**：
     - 开：若系统蓝牙关则先开蓝牙 → 重启 watcher → 开自动连接 + 解除 paused → 枚举设备（一个命令原子完成）；
     - 关：断开当前连接 → 停 watcher → 清空设备列表 → 关自动连接 + paused（不再寻找，`tick` 只保留无线电轮询）。
  2. **系统蓝牙被关的联动**：无线电轮询间隔 30s→5s；检测到 `bluetoothOn === false` 时停 watcher、清设备、断开连接，并把 `enabled` 置 false 持久化——总开关跟着关、不再寻找；系统蓝牙重新打开后不自动启用，等用户打开总开关（开关点击会联动打开蓝牙）。
  3. **面板**：开关 disabled 仅在命令进行中/无适配器；蓝牙关闭时「蓝牙音箱已关闭」文案；进行中状态沿用 D-48（转圈 + 正在连接/断开）。
  4. 总开关状态持久化到 `bt-audio.json`（`enabled`）；旧配置缺字段按 true。
- 否掉：前端串联三个命令（不原子、容易竞态）；系统蓝牙关掉仍保留设备列表（陈旧且在"找"）；只关自动连接不关寻找（用户明确要求不寻找）。
- 文档落点：D-49、`bluetooth_audio.rs` / `StatusBar.tsx` / `QuickSettingsPanel.tsx` 注释、D-44 修订。
- 实现/验证：`cargo check --lib`、`npm run typecheck` 通过；真机联动（开总开关 → 开蓝牙 + 自动连接；关总开关 → 断开 + 停止寻找；系统关蓝牙 → 总开关跟关）待安装复测。

## D-50 音频焦点：录音 / 朗读逐会话压低本机音乐（2026-10-31）

- 背景：本轮需求 1。录音走 WebView2 `getUserMedia`（`src/host/agent/voice/recorder.ts`），朗读走 WebAudio（`ttsPlayer.ts`），主音量是另一套 CoreAudio（`system_status.rs`），三者互不认识；Windows 也没有「一句话把别人音量压低」的公开 API（系统通信闪避的压低量由系统设置决定、不可控）。同时 P3 会让本机 Apple Music 与手机 A2DP 推流同时出声，需要先有可精确控制的执行层，才谈得上双音源仲裁（D-53）。
- 决策：
  1. 新增 `src-tauri/src/audio_focus.rs`：独立 worker 线程（MTA，长期持有 `IMMDeviceEnumerator` → 默认渲染端点 → `IAudioSessionManager2`）+ 命令通道 + 只读快照 Mutex，结构与 `bluetooth_audio.rs` 一致，不引入框架。命令：`audio_focus_snapshot` / `audio_focus_acquire(reason, gain)` / `audio_focus_release(reason)` / `audio_focus_restore_all` / `audio_focus_set_fifo(enabled)` / `audio_focus_restore_suppressed`；`gain` 是 0–100 整数百分比，Rust 侧归一成 0..1。
  2. 压低粒度是**逐会话**：`GetSessionEnumerator` → `IAudioSessionControl2`（pid / session instance id / state）→ `ISimpleAudioVolume`（`GetMasterVolume` / `SetMasterVolume` / `SetMute`）。只写各应用自己的会话音量，**不动默认端点主音量**（没有 `IAudioEndpointVolume` 写路径），所以朗读 / TTS 自己不会被一起压掉。
  3. reasons 只有 `voiceInput`（录音）与 `speechOutput`（TTS）：同一 reason 重复 acquire 不叠加、release 只移除该 reason；每个会话目标增益 = min(所有 active reasons 的增益)，没有 reason = 1.0（恢复）。首次接管记原始音量 / 静音态，之后只写 `original × gain`；原本静音的会话保持静音。会话按 session instance id 管理，重枚举不会把已压低后的音量误当原始值。
  4. 过渡（听感参数，不是验收指标）：淡出 150ms / 恢复 300ms、10ms 步进；最短保持 300ms，快速点按与「录音 → TTS」之间不中间回弹。焦点活跃时每 500ms 重枚举一次（录音中途新出现的会话也纳入），空闲不枚举。
  5. 生命周期接线（`src/host/agent/hooks/useAgentSession.ts`）：`startRecording` 先 acquire（不 await，与启动麦克风并行）；麦克风启动失败、启动在途取消、`cancelRecording`、面板卸载都 release。`stopRecording` 第一行 release（松手即发，恢复受 300ms 最短保持约束；不等解码 / ASR / 模型）。`speakText` 先 acquire `speechOutput`，`finally` 释放；`stopSpeaking`（收起 / 关闭 / 新一轮录音 / 发送新消息）立即释放，被下一次朗读接替时由新朗读持有。所有调用点统一 `void ...catch()`：焦点失败不影响录音 / 朗读。
  6. 设置：`wtsl.audio`（`src/host/system/audioSettings.ts`）字段 `duckVoice` / `voiceGain` / `duckTts` / `ttsGain` / `conflictPolicy`；档位白名单 50/30/20/10/0（0 = 静音），默认 20；写入后派发 `wtsl:audio-settings-changed`。UI 位于设置 → 常规 → 声音（5 行）。
  7. 「自身」判定：本进程 + `msedgewebview2.exe` 子树（TTS / 插件 iframe 声音）永不压低。**不排除宿主拉起的 Edge**：`msedge.exe` 是本进程直接子进程，但它的音频（本机媒体）必须参与压低与 FIFO；不能排除整棵子孙树，否则 AM 永远不被压。
  8. 崩溃保护：首次压低 / 静音写 `app_data_dir/audio-focus-journal.json`（session instance id + pid + process + 原始音量 / 静音态 + 时间），正常恢复后删除；worker 启动时按残留 journal best-effort 恢复（没有默认端点时保留、下次会话枚举重试）；退出路径另调 `restore_all`。
  9. 降级（当前实现）：会话 `SetMasterVolume` 失败只记一次日志并接受本次写入（避免每 10ms 重试刷屏）；**没有主音量 fallback**。A2DP 推流会话归属（P1a 探针）尚未实测；FIFO 对 external 的压制按「非 local-media 的会话」执行，避免会话归属不明时蓝牙音乐漏静音（见 D-53）。
- 否掉的方案：
  - **调主音量压低**：会把 TTS / 本机媒体一起压掉，也会和用户手动调音量互相打架；只作为后续降级候选，当前不实现。
  - **系统通信闪避（ducking）**：压低量由 Windows 设置决定，用户不可控，也不区分音源。
  - **排除整棵子进程树**：会把宿主拉起的 Edge 误当自身，AM 永不被压低。
  - **CoreAudio 会话事件驱动**：需要额外的 COM 回调与线程模型；本轮用 500ms 重枚举覆盖，不做事件总线。
  - **在插件里实现压低**：插件是 iframe，拿不到 CoreAudio；系统能力必须留在宿主。
- 文档落点：本节；`DESIGN §8`；`AGENT-SURFACE-CONTRACT §21`；`TOKEN-MAP §11`（档位与过渡时长登记）；`README`（特性 / 已知限制）；`docs/history/V090-AUDIO-MUSIC-SPEC.md §12`。
- 实现/验证：`cargo check` / `npx tsc --noEmit` 通过（Lead 执行；本轮文档回填未重跑构建）。真机 P1-1…P1-6 待用户验证（`V090-AUDIO-MUSIC-SPEC §8.1`）；A2DP 会话归属（P1a）未决。

## D-51 蓝牙状态机 v2 与统一退出路径（2026-10-31）

- 背景：v0.8.1 的退出链路（D-46）在 `CloseRequested` 里后台关无线电、等 ACL、15s 强退——退出会关掉蓝牙无线电（蓝牙键鼠一起掉线），且 `radioOffByExit` 在关成功后才落盘，强退可能留下「蓝牙被关且没有恢复标记」。同时用户意图与物理状态混在一起：`Close()` 调完快照立刻 `connected:false`，前端各组件用本地 `btBusy` / `pendingDisconnect` 假装进行中，跨入口不一致；所有命令排队进唯一 WinRT worker 并等回包，断开 / 关总开关只能整体禁用。
- 决策：
  1. 快照四层：`radioPhase`（`unavailable / off / turningOn / on / turningOff`；退出不碰）、`linkPhase`（`idle / connecting / connected / streaming / disconnecting / closed`）、`autoConnectState`（D-44 保留）、`operation`（`id / kind / deviceId / stage / startedAtMs`）；另加 `lastTransitionAtMs` / `unverifiedDisconnect` / `outputSuppressed` / `suppressReason`。旧字段 `connectionState` / `connected` / `streaming` 保留兼容（`disconnecting` 期间 `connected` 仍为 true，UI 以 `linkPhase` 为准）。
  2. `connect / disconnect / set_enabled / set_bluetooth` 改为非阻塞：manager 先把 `operation(stage=queued)` 写进快照并立即返回，worker 执行时**收养**这条 operation（复用 id / startedAtMs）、替换 stage，结束后清空；`bt_audio_refresh` 仍是阻塞的显式重扫。
  3. 断开观察 ACL：`Close()` 后在 3s 窗口内轮询 `BluetoothDevice.ConnectionStatus`（150ms 步进）；确认 `Disconnected` → `idle`，确认不了 → `closed + unverifiedDisconnect`，UI 文案「可能仍连接」（不撒谎）。`disconnecting` 期间不访问 `State()`（D-46 实测会卡）。
  4. 关总开关的 transition stages：`closing` → `verifying-link` → `stopping-watcher`；开：`turning-on-radio` → `starting-watcher`。`refresh_radio` 仍刷新无线电状态，但「关总开关 / 清设备 / 断连」的联动只在检测到系统蓝牙被外部关闭时触发一次，副作用不再散在轮询函数里（D-49 语义保留）。
  5. 自动连接保留 D-44：preferred → MRU/FIFO 回退、5/15/30/60s 退避、手动断开的 paused、系统连接事件优先；自动尝试也体现为 operation / stage。
  6. 退出统一 `begin_exit`（`src-tauri/src/lib.rs`）：所有入口（窗口关闭 / Ctrl+Q / `app_exit` / 设置页退出）→ `EXITING` 只执行一次 → `window.hide()` → `audio_focus_restore_all` → `close_for_exit` 断开 A2DP Sink（`Close()`；不碰无线电、不关 watcher、不等 ACL，最多等 2s）→ 结束受管 Edge 窗口（`WM_CLOSE` → `taskkill /T /F`，最多等 300ms）→ `std::process::exit(0)`。内部兜底：音频 3s、蓝牙 2s、总兜底 6s，只防挂死；**不设耗时验收指标**。
  7. 删除 15s 强退与 `radioOffByExit` 写入；`bt-audio.json` 中旧字段只在启动时一次性恢复（`initialize`：若 `radioOffByExit == true` 则打开无线电并清标记）。
  8. 前端单一数据源：`src/host/system/useBluetoothAudio.ts` 模块级 store（`useSyncExternalStore`），状态栏 pill / 快速设置面板 / 设置页共用一份快照与一套 action；空闲 2s、`operation != null` 或 linkPhase 处于过渡态时 500ms 轮询；组件本地 `btBusy` / `pending*` 删除。过渡文案集中在 `btOperationText`（连接中… / 断开中… / 打开蓝牙中… / 正在停止寻找… / 关闭中…等），Rust 只给英文 stage。
  9. Agent：`btAudio.status/devices` 透传新字段；`connect / disconnect` 非阻塞发起后用 `waitForBluetoothSettled()` 轮询到 `operation === null` 再返回真实终态（不把「已发起」当「已完成」）；新增 `btAudio.restoreOutput`（解除 FIFO 本地静音，与面板「恢复」对等）。
- 否掉的方案：
  - **退出关无线电**（D-46 旧口径）：蓝牙键鼠一起掉线，还要跨启动恢复标记；本轮明确退出只释放应用侧 A2DP。
  - **退出等 ACL 断开**：真机实测 `Close()` 后 ACL 可能十几秒不断，等待只会拖住进程；手机端显示可能滞后，写进已知限制。
  - **阻塞命令 + 前端本地 pending**：跨入口不一致、面板只能整体禁用；改为快照里的显式 operation。
  - **`Close()` 后轮询 `State()`**：D-46 实测会同步卡死；改看 `BluetoothDevice.ConnectionStatus`。
- 文档落点：本节；`DESIGN §8`；`README`（特性 / 已知限制 / 验证状态）；`V090-AUDIO-MUSIC-SPEC §12`；`bluetooth_audio.rs` / `lib.rs` 注释。
- 实现/验证：`cargo check` / `npx tsc --noEmit` 通过（Lead 执行）。真机 P2-1…P2-6 待用户验证；`%TEMP%\wtsl-exit-trace.log` 打点保留（不作为验收指标）。

## D-52 通用受管浏览器窗口 + SMTC：Apple Music 做成插件（2026-10-31）

- 背景：需求 3 的三条硬约束（`V090-AUDIO-MUSIC-SPEC §1.3` 实测 / 已确认）：① 官网 `https://music.apple.com/cn/` 返回 `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`，现有插件 iframe 不能嵌；② WebView2 只有 PlayReady、没有 Widevine，Apple Music 全曲播放靠 DRM，自家窗口拿不到 30s 以上；③ Apple Music API 需要 Apple Developer Program 会员，本机没有。→ 不逆向的天花板 = Edge 子进程里的官方网页 + Windows SMTC 遥控 + 我们自己的 Fluent 面板。
- 决策：
  1. 宿主只提供两个通用能力，零业务字样：
     - `browser_window.rs`：`browser_window_open({ url })` / `browser_window_control({ action })` / `browser_window_state()`。只接受 `https://`（大小写不敏感，拒绝控制字符与无主机名），定位 `msedge.exe`（注册表 App Paths → 已知安装路径），以 `--app=<url>` + `--user-data-dir=<app_data_dir>/browser-window-profile`（独立 profile，不碰用户 Edge）+ `--no-first-run --no-default-browser-check --window-size=1200,800` 启动，按屏幕工作区 clamp 并居中；单窗口单实例（已运行则 show/restore）；close = `WM_CLOSE` → `taskkill /PID <pid> /T /F`；`close_for_exit` 用 300ms 版 taskkill，不阻塞退出。
     - `media_session.rs`：SMTC `GlobalSystemMediaTransportControlsSessionManager`。列表（id = `<appId>#<枚举下标>`、appId、标题 / 歌手 / 专辑、playing、position / duration、can*、artworkKey）+ 按会话 id 的 `play / pause / toggle / next / previous` + 封面 data URL（8MB 上限，按 key 由调用方缓存）+ `media_key` 媒体键兜底（`SendInput`）。宿主不认 appId、不做会话选择。
  2. 桥接与 SDK：`HostApiMethod` 新增 7 个通用方法 `openBrowserWindow` / `browserWindowControl` / `browserWindowState` / `mediaSessions` / `mediaCommand` / `mediaArtwork` / `mediaKey`；`PROTOCOL_VERSION 2 → 3`（仅新增，旧插件无感）；`plugin-sdk.js` 补 `plugin.browserWindow.*` / `plugin.media.*`，`_shared/host.js` 补同名便利函数。插件可请求受管窗口，但宿主不认插件、不写业务 URL、不执行插件传入的路径 / 命令。
  3. 插件 `public/plugins/appleMusic`：manifest `identityHue: "pink"`、`autoPlace: false`、无 settings schema；widgets 一个卡片，sizes `[[2,1],[3,2],[4,2]]`、defaultSize `[2,1]`。卡片 2×1 = identity 行 + 曲名 / 歌手 + 播放暂停 + 进度带；3×2 加 160 封面与专辑；4×2 把封面升到 240 并加时间。空态只有中性音符 +「未在播放」。点卡片 `requestOverlay('detail', '音乐详情', { size: 'large' })`。
  4. 大面板：`large` 浮层 `min(1120px, 92vw) × min(80vh, 760px)`（`PluginOverlay` 内联几何，`data-overlay-size="large"`），三块：Artwork 320 + 曲名 / 歌手 / 专辑 + 播放状态；`HeroProgress` + 时间 + 上一曲 / 播放暂停 / 下一曲；打开 / 最小化 / 关闭播放器。不做 seek。
  5. Agent 工具（与 UI 对等）：`appleMusic.status`（只读）/ `appleMusic.playback`（`play / pause / toggle / next / previous`）/ `appleMusic.openPlayer` / `appleMusic.minimizePlayer` / `appleMusic.closePlayer`。会话选择在插件：优先 appId 含 `edge` / `msedge` 且 playing 的会话，其次任一 edge 会话，否则只有一个会话时用它，否则空态；宿主只给列表。
  6. 插件化：URL、登录引导、卡片 / 面板 UI、会话选择、工具全在插件；宿主代码无 appleMusic 分支。新增通用 manifest 能力 `autoPlace?: boolean`（缺省 true；false = 不自动上桌，只能编辑模式「添加组件」/ 插件管理手动添加；`manifest.ts` 与 `Desktop.tsx` 实现）。
  7. 共享原语 `Artwork`（`_shared/ui.jsx`）：尺寸档 48/96/160/240/320、12 圆角、无阴影、`object-fit: cover`、`alt` 必填、无图中性音符占位、`style` 只允许定位；契约 §4.4 登记。
  8. 登录与退出：首次「打开播放器」拉起 Edge app 窗口，用户在窗口里正常登录 Apple ID（含 2FA），登录态存在受管 profile；插件不读取 / 不保存凭据，也无法知道是否已登录，只按播放器 / 媒体会话状态显示。启动器退出时由 `begin_exit` 结束该 Edge 进程。
  9. UI/UX 评审结论（已接受，不修）：
     - 暗色快速设置面板填充 `#2886de` = Fluent brand ramp brand 90，D-43 已登记（`QuickSettingsPanel.tsx` 的 `DARK_BRAND_FILL`，全文件唯一字面色值）；
     - Apple Music 2×1 空态走 `EmptyState compact`，单块空带约 23%，按契约 §4.4.3 的短卡 compact 规则（图标槽 24 / 组距 4）处理，不按 DENSITY 22% 空带门禁改版；
     - 「打开播放器 / 显示播放器 / 关闭播放器」的对象名超过 4 字，属于窗口动作的已接受例外（契约 §4.4.3 补注）；
     - v0.8.0 既有状态色（接收中 success / 电量等）视觉不动。
- 否掉的方案：
  - **iframe 嵌官网**：`X-Frame-Options: DENY` + `frame-ancestors 'none'`，直接被拒。
  - **WebView2 内嵌播放**：无 Widevine，只有 30s 试听；PlayReady 对 Apple Music 不适用。
  - **官方 API / 资料库 / 搜索重写**：无开发者账号；不做逆向、不抓包。
  - **CDP / UI 自动化点网页**：脆弱且等于逆向；不做。**（已被 D-55 推翻并限定场景：只操作受管 Edge 里用户自己已登录的官方网页，不逆向、不读凭据；见 D-55。）**
  - **宿主内置 Apple Music 业务 / 写死 appId / URL**：违反宿主不认插件的铁律；URL 与选择逻辑全在插件。
  - **默认把 AM 卡放上桌**：六卡定稿不动；用 `autoPlace: false` 让用户手动添加。
- 文档落点：本节；`DESIGN §8`；`PLUGIN-CONTRACT §1/§2.3/§3.5/§4.1/§4.4/§6`；`TOKEN-MAP §8/§11`；`README`（特性 / 安装 / 已知限制 / 验证状态）；`V090-AUDIO-MUSIC-SPEC §12`。
- 实现/验证：`cargo check` / `npx tsc --noEmit` 通过；`node scripts/build-plugin.mjs appleMusic` 产物已更新（`public/plugins/appleMusic/app/app.js`）；UI/UX 评审完成。真机 P3-1…P3-8 待用户验证；SMTC 的 Edge AUMID 识别、A2DP 会话归属均待真机确认。
- **修订（D-55，2026-10-31 晚）**：卡片 3×2/4×2 增加状态行与「上一曲/播放暂停/下一曲」44 组（2×1 不变，仍只有行内播放键）；面板改为 CDP 数据层 + 富信息布局（hero 160 紧凑条、两列播放列表带封面/描述/数量、L2 序号/专辑/E/时长、固定页脚）；`large` 浮层几何与「单 CDP 客户端、卡片走 SMTC」不变。以 D-55 与当前实现为准。

## D-53 双音源 FIFO：后播优先、输家手动恢复（2026-10-31）

- 背景：P3c。蓝牙 A2DP 推流（external）与本机 SMTC 媒体（local，当前是 Apple Music）可以同时在播；spec v3 明确「后开始者胜出、先开始者淡出后停止」，且**不操控手机端、不断开蓝牙连接**；输家手动恢复、不自动恢复。需要一套仲裁把 D-50 的逐会话音量能力用到两个音源上。
- 决策：
  1. 仲裁在 `audio_focus.rs` 的同一 worker 里，每 1000ms 评估一次（`FIFO_POLL_INTERVAL`），命令与过渡可随时打断；不新线程。
  2. 两路判定：external = `bt.snapshot().streaming`；local = SMTC 快照里 `playing == true` 的会话非空。任一方 false → true 记开始时间；同时在播时后开始者胜出；同一拍或缺失时间戳按本机媒体优先（tie-break）。
  3. 输家动作：external 输 = 淡出到 0 后**平板本地静音**（`bt.set_output_suppressed(true, "local-media-playing")` 只写快照字段，会话增益 0 由 `target_gain_for` 施加），不断连接、不碰无线电、不操控手机；local 输 = 淡出 150ms 后发一次 SMTC `pause`（每集只发一次），不自动播放回来。
  4. 不自动恢复：只有三种情况解除压制——用户手动恢复、输家自己停止播放、冲突消失（另一方不再播放）。手动恢复 = `audio_focus_restore_suppressed`：清除本地静音旗标 / 恢复会话音量，并进入 `manual_override`，直到下一次任一方新的播放开始再重新判定。本机媒体手动恢复只恢复音量，播放仍需用户点（不替用户按播放）。
  5. 入口：快速设置面板「已被本机音乐静音」+「恢复」按钮（读 `bt.outputSuppressed`）、状态栏 pill「已静音」、Agent `btAudio.restoreOutput`；本机媒体由用户在面板 / Edge / 媒体键点播放。
  6. 与语音 / TTS 压低的关系：FIFO 不停止录音 / TTS、也不被它们释放；两者同时生效时目标增益取 min（`target_gain_for`），互不覆盖。
  7. 不触发 FIFO：录音 / TTS、同一方的暂停 / 恢复、两个本地媒体会话之间（交给 Windows）。
  8. 设置「两个音源同时播放」= 后播优先（默认）/ 不处理，存 `wtsl.audio.conflictPolicy`；**已接线**：`audio_focus_set_fifo` 命令 + App 启动按持久化值同步（`App.tsx`）+ 设置页切换立即同步（`SettingsPage.tsx`）。关闭时不压制，并清掉残留压制状态（只恢复音量，不动播放）；语音 / TTS 压低保留。
  9. 降级：external 的压制作用于「非 local-media」的会话（A2DP 会话归属待真机，宁可按同一侧处理）；会话不可写时 `SetMasterVolume` 失败只记日志，没有主音量回退。
- 否掉的方案：
  - **自动恢复**（赢家停止后把输家放回来）：v3 明确不要，FIFO 语义就是「后播优先，输家等人」；自动恢复会在推流断续时反复抢音。
  - **控制手机端暂停 / 断开**：蓝牙 Sink 只收不发，物理上办不到；「停止」只能是平板本地静音。
  - **local 输家直接关会话 / 杀进程**：超出音频焦点职责；只发一次 SMTC pause。
  - **常驻高频轮询**：1s 一拍足够，命令与过渡可打断；不做事件总线。
- 文档落点：本节；`DESIGN §8`；`README`（特性 / 已知限制）；`AGENT-SURFACE-CONTRACT §21.3`；`V090-AUDIO-MUSIC-SPEC §12`。
- 实现/验证：`cargo check` / `npx tsc --noEmit` 通过；真机 P3-6 / P3-7 待用户验证（蓝牙先播 / AM 先播两条冲突路径）。

## D-54 退出 / 关总开关真正停止 A2DP 接收：系统层停用手机 A2DP 音频源服务（2026-10-31 修复）

- 背景：用户报告「退出启动器后电脑仍然可以当音箱」。真机核查：退出链路本身正常（`Close()` + `process::exit`），当前也没有启动器进程；但系统里 A2DP SNK **采集端点**仍有活跃会话、默认扬声器有活跃渲染会话（peak≈0.5），说明 Windows 在应用退出后仍继续渲染手机推流。D-46 已确认 `Close()` 不会断开 ACL；本轮进一步确认**音频也继续**——只靠应用侧 `Close()` 不足以让 PC 停止当音箱。
- 决策：
  1. 退出 / 关总开关时，在系统蓝牙层**停用该设备（手机）的 A2DP 音频源服务**（Bluetooth AudioSource，0x110A；`BluetoothSetServiceState` / `bluetoothapis`）。不碰蓝牙无线电，也不影响 AVRCP/HFP/PBAP 等服务（蓝牙键鼠不受影响）。
  2. 停用的设备 id 持久化到 `bt-audio.json` 的 `a2dpServiceDisabled`；下次启动 / 开总开关**先恢复服务再起 watcher**（驱动重装需要一点时间），恢复失败每 5s 重试；已恢复的条目从列表删除。
  3. 需要 windows crate 的 `Win32_Devices_Bluetooth` feature（无新第三方依赖）。实测普通用户权限即可调用（medium integrity 探针 rc=0）。
  4. 退出等待上限从 2s 放宽到 5s（驱动卸载实测约 4s），内部兜底 10s；仍然不碰无线电、不等 ACL、不设耗时验收指标。
- 否掉的方案：
  - **退出时关蓝牙无线电**（旧 D-46 行为）：会断蓝牙键鼠 / 其它蓝牙设备，用户明确不要。
  - **只 `Close()` AudioPlaybackConnection**：真机确认应用退出后音频仍继续（本轮根因）。
  - **保持后台进程 / 隐藏常驻**：用户要退出进程。
  - **让用户手动去系统里断开手机**：不是产品行为；但强杀等无法覆盖的场景写进已知限制。
- 已知边界：进程被强杀 / 崩溃不走退出清理（A2DP 服务保持启用，PC 仍可当音箱）；干净退出后卸载启动器，手机侧 A2DP 音频服务需要在 Windows 蓝牙设置里手动恢复；手动「断开」按钮目前仍只释放应用侧连接（不保证停手机推流）。这些写入 README 已知限制。
- 实现/验证：`cargo check` 通过；release 构建 + NSIS `/S` 静默安装（0.9.0 同版本覆盖）；程序化验证：启动 → 自动连接 → 关闭后 exit trace 出现 `a2dp-service-disable-done pending=1`、A2DP SNK MEDIA 设备与采集端点消失、`bt-audio.json.a2dpServiceDisabled` 写入；再启动日志出现「蓝牙音频服务恢复」、列表清空、设备与自动连接恢复。真机听感（退出后手机推流是否真的停止）待用户验证。
- 文档落点：本节；`DESIGN §8`；`README`（特性 / 已知限制 / 验证状态）；`V090-AUDIO-MUSIC-SPEC §12`。

## D-55 Apple Music 走 CDP 接管：受管 Edge 调试端口 + 插件直连（2026-10-31）

- 背景：D-52 交付的 SMTC 版本只能拿到「正在播放 / 传输控制」，面板里的资料库、播放列表、点歌都无法用；SMTС 也不提供曲目列表与进度（进度要轮询会话快照）。用户明确选择 CDP 路线（原话「肯定选 CDP 那条路」），边界仍是**不逆向、不拦截凭据**：用户正常登录官方网页，插件操作的是同一个已登录页面。D-52 里「CDP / UI 自动化点网页一律不做」的结论据此改写（限定场景，见本节）。
- 决策：
  1. **宿主通用调试端口**：`browser_window.rs` 拉起 Edge 时追加 `--remote-debugging-port=<系统分配的空闲回环端口>`、`--remote-debugging-address=127.0.0.1`、`--remote-allow-origins=http://wtsl.localhost,http://tauri.localhost,http://localhost:5173`（只放行本项目三个渲染面 origin，绑定失败不阻塞窗口）。新增 HostApi `browserWindowDebugTargets() → { port, targets[] }`：用原生 `std::net::TcpStream` 发 HTTP/1.1 GET `/json/list`，按 `Content-Length` 收满即停，把 `type / url / title / webSocketDebuggerUrl` 四个字段原样透传；宿主**不判断 type/url、不过滤、不替调用方连 WebSocket**，也不出现任何业务 URL/字样。bridge types、`bridge.ts`、`tauri.ts`、`plugin-sdk.js`（独立运行 fallback `{port:0,targets:[]}`）、`_shared/host.js` 同步；`PROTOCOL_VERSION` 保持 3（v3 内追加，宿主不按版本分支）。
  2. **窗口身份改为「调试端口 owner pid」**：真机实测 Edge 156 会**中继启动**——`Command::spawn` 的 msedge 进程约 1s 内退出，真正持有调试端口并创建窗口的是另一个浏览器进程（原进程的子进程）。旧实现用 spawned pid 判断存活，导致「启动即判定退出」→ 面板认为窗口没开、再 open 被同 profile 旧实例吞掉、退出也没有 pid 可杀（用户报告的「退出 launcher 后 AM 没退」）。改为 `GetExtendedTcpTable` 从调试端口反查监听 pid（校验镜像名是 `msedge.exe`），窗口枚举、show/hide/minimize、结束全部按该 pid；启动 12s 宽限期内「进程没认出来 / 窗口还没建好」按 running 处理，避免插件冷启动误判。
  3. **遗留实例与退出清理**：每次识别出真实浏览器 pid 后写 `profile_dir/managed-window.json`（debugPort + browserPid）；open 前若发现上次遗留的受管浏览器（pid 存活或端口 owner 存活，且镜像名 msedge）先结束它，再拉起新实例（同 profile 的 Edge 单实例会吞掉新命令，导致新端口永不监听）；兼容 Chromium 的 `DevToolsActivePort`（显式端口模式实测不写）。退出路径改为 `WM_CLOSE` → **立即 `TerminateProcess`** → 后台异步 `taskkill /T /F` 清子进程：旧实现退出只等 300ms taskkill，真机实测超时后应用先退出、Edge 反而留在桌面上。
  4. **插件数据层（CDP）**：新增 `public/plugins/appleMusic/src/cdp.js`（WebSocket JSON-RPC：`Runtime.evaluate` 带 `userGesture/returnByValue/awaitPromise`、`Input.dispatchMouseEvent`、关闭/重连回调）与 `library.js`（单例 store + 状态机）。连接流程：`browserWindowState` → 未运行则 `openBrowserWindow(LIBRARY_URL)` 并**立即隐藏**（冷启动轮询到 `visible:false`）→ 轮询 `browserWindowDebugTargets`（300ms，总 12s）→ 优先 `music.apple.com` 的 page target → 连 WS → 等 `readyState` → 首同步。轮询 1.8s（复用 `player.js` 的节奏），面板 iframe `visibilityState === 'hidden'` 时暂停、回可见补一拍；离线/断线自动重取 target 重连，失败 5s 退避；用户关掉 Edge 后停在「播放器未打开」不自动重开。动作全部走真实指针点击：`openPlaylist(href)`（点侧栏/列表 anchor 中心，等 URL 与曲目行）、`playTrack(index)`（点行内 `button[aria-label^="播放"]`，等标题变化或 `currentTime>0.5`，上限 15s）、`transport('toggle'|'next'|'previous')`（toggle 先读 `audio.paused` 选 `playback-play__play` / `playback-play__pause`，next/prev 用 `item-skip[direction]`）、`show/hide/closePlayer`。
  5. **数据范围**：`sync()` 一次 evaluate 读 `{url, ready, needLogin, playlists, tracks, nowPlaying}`；`playlists` 来自页面侧栏 `a[href*="/library/playlist/"]`；`tracks` 只在当前页是播放列表详情时读（避免 1.8s 重传长列表）；`nowPlaying` = `navigator.mediaSession.metadata`（artwork 取最大尺寸）+ `audio.paused/currentTime/duration`。登录判断 = 没有播放列表且正文出现登录入口文案时才 `needLogin`，首次登录态显示一次 Edge、登录成功后自动隐藏一次。
  6. **单 CDP 客户端**：只有详情面板连 WebSocket（卡片继续 SMTC：媒体会话 + 传输命令）；一个 page target 同时只保留一个业务 WS 客户端（Edge 156 实测允许多客户端，但不依赖该行为）。
  7. 安全边界：只操作受管 Edge 自己的 profile 与官方网页；**不读取/不保存 token、cookie、凭据，不抓包、不逆向**；`LIBRARY_URL` 等业务常量只在插件里，宿主 grep 无 `appleMusic` / `music.apple.com` / `Apple Music` 字样；调试端口只绑 `127.0.0.1`，Origin 白名单最小化。
  8. **富信息面板与数据采集**（插件）：`collectSnapshot` 采集侧栏播放列表的名称/href，并用前端主内容区 `[data-testid="product-lockup"]` 的 `picture source[srcset]` 最大档补封面、`product-lockup-subtitle` 补描述（缺省取卡片 aria-label「、」后一段）；打开播放列表详情后补歌曲数（`tracklist-footer-description`）与策展/描述。曲目采集 `track-list-item[data-row]` 的显示序号、`track-title` / `track-column-secondary` / `track-column-tertiary`、`track-duration`（解析毫秒）、`.songs-list-row__badge--explicit`、行内 `artwork-component` 封面（40/80 档按 mzstatic 尺寸段升到 160；已采集，行内暂不上屏）。取不到一律降级为空，不编造。
  9. **面板 UI（HIG + Fluent 2 重做）**：L1 三块 = ① 正在播放紧凑条（Artwork 160 + 状态/曲名 24/歌手 16/专辑 14 + 进度与 12px tabular 时间 + 44 传输）；② 播放列表两列（48 封面 + 名称 + 描述或「N 首」 + chevron，首屏 12 个）；③ **固定页脚**（显示/隐藏播放器、关闭播放器，不随内容滚动）。L2 = 共享 `Subpage`（56 header：← + 播放列表名 + 歌曲数/策展行）+ 曲目行（序号/播放指示 + 标题 + 歌手·专辑 + explicit E + 时长，44+4 pitch）。四态（连接中/登录/错误/未运行）统一图标 + 标题 + 下一步。卡片 2×1 不变；3×2/4×2 增加 `StatusLine` 与「上一曲/播放暂停/下一曲」44 组（SMTC 数据，2×1 仍只有行内播放键）。D-52 里「卡片只有播放暂停、面板 Artwork 320、3×2 封面 160/4×2 240」的旧口径据此修订。
  10. **隐藏窗口下的 DRM 起播**：Edge 窗口被 `SW_HIDE` 后页面 `visibilityState=hidden`，Apple Music 的 DRM/MSE 初始缓冲不推进（真机 15s+ `paused=false`、`readyState=0`、`currentTime=0`）；连接后调用 CDP `Emulation.setFocusEmulationEnabled(true)` 把页面模拟成「已聚焦/激活」（窗口仍隐藏），同一套 `Input` 真实指针点击即可正常起播，真机 `currentTime` 正常前进。
  11. **轮询 / 显隐 / 首同步兜底**：插件 iframe 的 `visibilityState` 在 WebView2 里可能长期是 hidden，tick 不能永久停摆（hidden 时 5s 后重试，回可见立即补一拍）；冷启动 Apple 资料库 hydration 真机需 40–60s，首同步在「已登录但播放列表为空」时保持「正在连接播放器」每 500ms 重试（上限 60s），避免先闪「没有播放列表」；已登录时每轮同步兜底隐藏可见的 Edge 窗口，但用户主动点「显示播放器」后（`userWantsVisible`）不再自动隐藏；`main.jsx` 的 `colorScheme` 改为跟随主题 `scheme` 并给滚动区 token 色 `scrollbar-color`，修掉深色面板右侧的白色 UA 滚动条。
- 否掉的方案：
  - **继续只用 SMTC**：没有资料库/曲目列表，面板只能当遥控器；用户明确要 CDP。
  - **在 Rust 侧连 CDP WebSocket**：要引第三方 WS crate，且宿主不该懂业务；数据层放插件（iframe 原生 WebSocket）。
  - **固定调试端口**：与其他软件冲突且暴露面固定；用系统分配的空闲回环端口。
  - **用 hwnd/窗口标题当身份**：标题随导航变化、可能撞车；端口 owner pid 是唯一可靠身份。
  - **退出继续用 300ms taskkill 等**：真机已证伪（超时 → Edge 留存）。
  - **隐藏窗口时用 show 一下再起播**：会打断「默认不可见」的设计；用 `Emulation.setFocusEmulationEnabled` 不显示窗口即可解决。
- 已知限制：
  - DOM 选择器来自真实页面（`track-list-item`、`button[aria-label^="播放"]`、`amp-playback-controls-*`、侧栏 `a[href*="/library/playlist/"]`、`product-lockup*`），Apple 改版会让对应动作/字段退化（动作返回一句事实错误，字段降级为空），不静默做错事；
  - DRM 起播有 5–7s 延迟，`playTrack` 的等待上限 15s；
  - 冷启动独立 profile 的 Apple 资料库 hydration 真机 40–60s，期间显示「正在连接播放器」；之后的首屏数据依赖 1.8s 轮询补齐；
  - 受管 Edge 被用户手动关掉后不自动重开（按设计）；面板关闭即断开 CDP，重开面板会重连；
  - 显式 `--remote-debugging-port` 模式 Edge 不写 `DevToolsActivePort`，遗留实例清理依赖本应用自己的 `managed-window.json`（旧版本遗留的实例可能无法找回，重启一次即可）；
  - 一个 page target 只保留一个业务 WS 客户端；卡片与 Agent 工具仍走 SMTC（资料库/点歌是面板内的 CDP 路径，Agent 工具暂未对等——工具化需要后台数据层或宿主代理，后续再做）；
  - 隐藏窗口起播依赖 `Emulation.setFocusEmulationEnabled`（Edge 156 真机正常）；若浏览器不支持会退化为需要在窗口可见时起播。
- 文档落点：本节；D-52 修订；`PLUGIN-CONTRACT §1`（通用 HostApi + D-55 段）；`README`（特性 / 已知限制 / 验证状态）；`V090-AUDIO-MUSIC-SPEC §12.6`；`browser_window.rs` / `lib.rs` / `cdp.js` / `library.js` / `Detail.jsx` / `Card.jsx` 注释。
- 实现/验证：`cargo check --lib` / `npx tsc --noEmit` 通过；插件离线 E2E（headless Edge + 宿主替身 + 假 CDP）**41 断言 PASS**、采集器 fixture **18 断言 PASS**、状态机 harness **23 断言 PASS**；release NSIS 构建 + `/S` 静默安装。真机（安装版 + 真实登录态 Edge 156，1440×960@200%）已验证：面板列出 21 个播放列表（封面/描述/数量）→ 进 L2 31 首（序号/专辑/时长）→ 点曲目在 Edge 隐藏状态下真实起播（`audio.currentTime` 5.77s、`readyState=4`、mediaSession=Afterwards）→ 面板暂停后 `audio.paused=true` → 「显示播放器」窗口可见 → 「关闭播放器」结束 Edge 进程并回到「播放器未打开」→ 退出 launcher 后受管 Edge 一并结束（修复了旧版「退出 launcher 但 AM 不退」）。
