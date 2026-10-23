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


## D-03 桌面常驻 dock（V-14）——v0.3.0 起由 D-22 取代（dock 已移除）

> **已被 D-22 取代**：v0.3.0 删除右下角 dock，四个入口收进设置页；桌面只保留 Agent 入口按钮。

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

- 插件浮层视图统一按 `docs/OVERLAY-REWRITE-SPEC.md`：**E1 起插件只保留 `?view=detail`**；
  旧的 `?view=settings` 已删除（设置统一由 manifest schema 在宿主设置页渲染），`edit` / `all`
  也已并入详情内的 L2/Tabs。历史写法 `?view=settings|detail|edit|all` 仅见旧文档。
  视图根 padding 24、内容 max-width 720 居中、section 间距 24、设置行 48 / 列表行 44、
  控件 40（Input/Dropdown/Button `size="large"` + Switch/Radio/Slider `min-height: 40`）、
  辅助文字 12、表单正文 14、section 标题 20、无 `Divider` 分组、无 10/11px 与 clamp 字号。
- 浮层标题与关闭按钮只由宿主 Dialog 提供，插件视图内不再画标题栏/关闭按钮。
- 回归入口：`node scripts/verify-overlays.mjs`（E7 起重写为**六插件 × detail 的 6 个视图断言**，
  暗/亮各一遍；E1 之前的 12 个 settings/edit/all 用例已失效）+ `node scripts/shot-host-overlays.mjs`
  （宿主内联调截图，E7 更新为真实路径「点卡 → detail 浮层 → Esc → 焦点归还」）。细节与残留见 `docs/OVERLAY-REWRITE-RESULT.md`。
- 宽度口径（E5 复核，2026-10-20）：**表单/设置内容 max-width 720 居中；详情里的列表/统计区可用满宽 834**
  （见 [OVERLAY-REWRITE-SPEC.md](OVERLAY-REWRITE-SPEC.md) §2）。组件文档未要求 720 的详情页不强制收窄，
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
  六卡基线 / 重置恢复 / console 0（v0.2.2 回归报告 `docs/RELEASE-REPORT.md` §11）。

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
  - release 真窗口（patched CDP 副本，`shots/v036-final/`，38 PASS / 0 FAIL）：升级重种 0.3.5→0.3.6；真实 WebView2 里设置页切时钟 12 小时制/天气自动定位开关后，跨 origin 卡片 360ms 内可见更新、iframe 71ms 收到 `host:config`（天气双向 75/60ms）、timeOrigin/探针证明未 reload、console 0。

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
- 验证：新增 `scripts/verify-agent-voice-first.mjs`（headless Edge + 假麦克风，voice 回合后观测不到 chat、回答后空格再录音、半高窗 textarea=0、chat 单行 composer 三控件同轴、焦点/Esc/录音取消、reduced-motion、console 0）；`scripts/verify-agent-surface.mjs`、`scripts/smoke-v031-ui.mjs` 按新语义更新后全 PASS；`tsc --noEmit` / `npm run build` 通过；证据 `shots/v037-dev/`。
