# 设计决策记录（审计相关）

> 日期：2026-10-19。对应 `docs/audit/AUDIT.md` 的 P1/P2 处置口径。
> 由 Lead 决策，作为审计复检（task-25）的判定依据。

## D-01 卡片圆角（V-01 / V-02）

- **决策**：桌面卡片、页面卡片、弹层卡片统一 **12px**，定义为项目 token `--wtsl-card-radius: 12px`。
- 背景：Fluent 2 设计规范圆角表为 Medium 4 / Large 8 / X-Large 12；Fluent UI React v9 的 `borderRadius*` token 实际值为 Medium 4 / Large 6 / X-Large 8，两套数值不完全一致（审计报告 V-02 指出）。
- 以设计规范为准，在项目 token 层固定 12px，**不允许各组件用 calc 再算、也不允许混用 6/8/16/**。
- 文档修订：`FLUENT2.md §5` 已补"token 值映射注意"。

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
  - todo：`2×2` ≤ 4 行、`3×2` ≤ 6 行、`3×3` ≤ 10 行；超出显示「查看全部」。
  - weather：`2×2` 逐时 ≤ 6；`3×2/4×2` 的 7 天每行=1 天，不计入 Secondary。
- 文档修订：`DENSITY.md §2` 已补内容列表例外说明。

## D-05 其余 P2 处置

| 项 | 处置 |
|---|---|
| V-06 触控目标 | desktop-core / host-core / agent-core / 插件 owner 统一 ≥40×40 |
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
