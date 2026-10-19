# 设计决策记录（审计相关）

> 日期：2026-10-19。对应 `docs/audit/AUDIT.md` 的 P1/P2 处置口径。
> 由 Lead 决策，作为审计复检（task-25）的判定依据。

## D-01 卡片圆角（V-01 / V-02）

- **决策**：桌面卡片、页面卡片、弹层卡片统一 **12px**，定义为项目 token `--wtsl-card-radius: 12px`。
- 背景：Fluent 2 设计规范圆角表为 Medium 4 / Large 8 / X-Large 12；Fluent UI React v9 的 `borderRadius*` token 实际值为 Medium 4 / Large 6 / X-Large 8，两套数值不完全一致（审计报告 V-02 指出）。
- 以设计规范为准，在项目 token 层固定 12px，**不允许各组件用 calc 再算、也不允许混用 6/8/16/**。
- 文档修订：`FLUENT2.md §5` 已补"token 值映射注意"。
- 例外：Fluent 自带的 `Dialog` / `DialogSurface` 弹层按 Fluent 组件默认圆角（8px）渲染，不覆写项目 token；项目 token 用于卡片（桌面卡片 / 页面卡片）。
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


## D-03 桌面常驻 dock（V-14）

- **决策**：保留常驻 dock（Agent / 复盘 / 插件 / 设置），按钮高度 ≥ 40px，不新增与 Agent 悬浮按钮重复的入口。
- 后续可选：收进边缘手势或长按。审计按 P3（产品决策）记录。

## D-04 内容列表与密度预算（V-09）

- **决策**：组件声明的「内容列表」按**行**计为 1 个 Secondary 区块，不逐项累加；但必须遵守行数上限：
  - todo：`2×2` ≤ 4 行、`3×2` ≤ 5 行、`3×3` ≤ 8 行、`4×2` 每栏 ≤ 5 行；行高 44 + 行距 4，行数按实际可用高度动态取 `min(cap, floor((avail + 4) / 48))`；超出显示「查看全部」或滚动渐隐。3×2 从 6 行改为 5 行是算术约束：328px 卡高 − padding 24 − composer 40 − 组间距 16 = 248px，6 行需要 284px；5 行 236px 可放下（计数由工具条/composer 占位承担，不再单占 28px 头）。3×3 同理，1024×768 下动态 6–7 行、1440 下 7–8 行。
  - weather：`2×2` 逐时 ≤ 6；`3×2/4×2` 的 7 天每行=1 天，不计入 Secondary。
- 文档修订：`DENSITY.md §2` 已补内容列表例外说明。

## D-05 其余 P2 处置

| 项 | 处置 |
|---|---|
| V-06 触控目标 | desktop-core / host-core / agent-core / 插件 owner 统一 ≥40×40；G2 后宿主页面按钮、编辑工具条、Agent 建议按钮已统一 large；G2b 后 Fluent 内建表单控件（Switch/Input/Radio/Checkbox/Slider/Dropdown）在宿主与插件 iframe 里统一 `min-height: 40px`（CSS 命中区规则）。按钮类实测 0 项 <40，内建控件命中区 40（Checkbox 内部图形尺寸除外） |
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

- **背景**：Fluent 2 官方字阶（`references/fluentui-design/typography.md`）与 Fluent UI React v9 token
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

- 插件浮层视图（`?view=settings|detail|edit|all`）统一按 `docs/OVERLAY-REWRITE-SPEC.md`：
  视图根 padding 24、内容 max-width 720 居中、section 间距 24、设置行 48 / 列表行 44、
  控件 40（Input/Dropdown/Button `size="large"` + Switch/Radio/Slider `min-height: 40`）、
  辅助文字 12、表单正文 14、section 标题 20、无 `Divider` 分组、无 10/11px 与 clamp 字号。
- 浮层标题与关闭按钮只由宿主 Dialog 提供，插件视图内不再画标题栏/关闭按钮。
- 回归入口：`node scripts/verify-overlays.mjs`（12 视图断言）+ `node scripts/shot-host-overlays.mjs`
  （宿主内联调截图）。细节与残留见 `docs/OVERLAY-REWRITE-RESULT.md`。
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
  总览见 `docs/DESIGN-ROUND-SUMMARY.md`；契约见 `docs/PLUGIN-CONTRACT.md`；动效见 `docs/MOTION.md`。
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
- 实现按 `docs/PLAN.md` §8 的 E0–E7 执行。

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
- **自动定位语义（可预期）**：城市列表为空时，定位城市自动加入并设为当前；已有城市时**不自动切换**，
  只在城市菜单显示「当前位置 · X 一键切换」。
- **隐私**：仅在 `autoLocate` 打开时请求；只暴露公网 IP 与常规 UA，不发送本地数据。
- **实现位置**：`src-tauri/src/iplocate.rs`（`extract_ticket` / `parse_payload` 纯函数 + 单测；
  reqwest native-tls，8s 总超时 / 4s connect 超时）→ Tauri 命令 `ip_locate` →
  `src/host/plugins/tauri.ts` 的 `ipLocate()` → bridge `HostApiMethod` / `HostApiMap` →
  `plugin-sdk.js` 的 `plugin.ipLocate()`；天气插件在 E3 接入。浏览器 dev 没有 Tauri 后端，
  bridge 与 SDK 都返回 null（插件按“拿不到”降级）。
- **失败兜底**：ip.cn 改版 / 超时（8s）→ 返回 null；不影响手动搜索城市；日志记录原因，不弹错误。
- 细节见 [components/weather.md](components/weather.md)「自动定位」一节；任务见 [PLAN.md](PLAN.md) E2b。

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
  `shots/e3-template/`。
- 本轮同时修复宿主缺口：浮层内发 `plugin:request-host-settings` 时，宿主先关闭浮层再导航
  （契约 §5），插件只发一条消息；模板与后续六个插件的「设置…」都按这个口径写。
