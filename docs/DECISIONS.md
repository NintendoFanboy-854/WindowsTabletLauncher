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
- 实现：App 解析偏好 → FluentProvider 切 `webLightTheme` / `webDarkTheme`；`applyColorSchemeToDocument()` 把 `data-theme` 与 `color-scheme` 写到 `<html>/<body>`（壁纸、滚动条、原生控件跟随）；Desktop 从 FluentProvider 实际 CSS 变量读 token，并通过 `host:init` / `host:theme` 注入每个插件 iframe。
- 插件侧：`public/plugins/_shared/host.js` 的 `useHostTheme()` 在宿主内完全跟随宿主主题；独立打开（开发/截图）时跟随系统 `prefers-color-scheme` 并监听变化。
- 旧值兼容：`dark` / `light` 照旧生效；未设置时按 `system`。
- 插件 SDK：`public/plugin-sdk.js` 记忆最近一次 `host:init/theme/resize` 并在监听注册时补发，避免插件挂载晚于主题消息而停在回退主题（实测出现过亮色系统里部分插件仍深色）。

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
