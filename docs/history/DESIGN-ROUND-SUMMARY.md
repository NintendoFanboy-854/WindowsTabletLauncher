# 2026-10 交互与视觉设计定稿（汇总）

> **⚠️ 历史文档**：2026-10 设计定稿汇总，正文状态（含 ⏳）为写作当时快照；现行规范见 `docs/` 根目录与 `docs/components/`。

> 本轮完成：六个插件的交互模型、信息架构、设置归属、Agent 对等、详情层级、动效与视觉规格。
> 本轮**未改代码**；实现按 [PLAN.md](PLAN.md) §8 的 E0–E7 执行。
>
> 权威文档：
> - 交互/能力契约：[PLUGIN-CONTRACT.md](../PLUGIN-CONTRACT.md)
> - 动效：[MOTION.md](../MOTION.md)
> - 逐插件规格：[components/](../components/)
> - 设计参考：[reference/APPLE-HIG.md](../reference/APPLE-HIG.md)
> - 历史规格（已部分被取代）：[OVERLAY-REWRITE-SPEC.md](OVERLAY-REWRITE-SPEC.md)、[UI-REWRITE-SPEC.md](UI-REWRITE-SPEC.md)
>
> **2026-10-24 口径**：hero 全档 40/52、卡片 padding 16 / gap 8、行高 44、2×2 行预算 5 行；本文旧数字已按
> [DENSITY.md](../DENSITY.md) §1.1–§2.2 与四份密度规格修正。

## 1. 设计原则

1. **严格遵循 Fluent 2 Design System**：组件、token、type ramp、spacing、圆角、阴影、材质、动效全部用 Fluent UI React v9 与 `motionTokens`；不引入 Apple 设计语言，只把 HIG 当平台无关的原则参照。
2. **触控优先**：平板是第一输入。触控轻点=主操作，长按 500ms=编辑模式；鼠标/笔额外有 hover，行为与触控一致，不做设备分叉。
3. **可预测性 > 便利性**：同一种外观只有一种主语义；平级内容可见（Tabs），层级内容可回退（L1/L2 页栈）；不搞隐藏形态切换。
4. **羡余是正向的**：同义多路径（图标+文字、按钮+手势、颜色+文字、取消=×/Esc/遮罩）保留；有害的是“同名不同义”。
5. **卡片只做展示 + 极轻操作**；多步、不可逆、需要上下文的工作进详情；长期偏好进宿主设置。
6. **颜色严格功能化**：中性文字层级 + 品牌色（交互）+ 语义色（状态）+ 数据色（AQI/热力图）+ 内容色（天气图标/用户选色，小面积）。插件个性色、氛围色后续再单独讨论。

## 2. 统一层级模型（D-14）

| 层级 | 内容 | 进入 | 退出 |
|---|---|---|---|
| L0 | 桌面卡片 | — | — |
| L1 | 插件详情（宿主全窗口浮层，`?view=detail`） | 点卡片主体（container transform） | X / Esc / 遮罩 → 回卡片 |
| L2 | 子页（同一浮层内 push）：任务编辑、清单管理、添加城市、选择任务 | L1 内点行 /「管理…」/「添加…」 | 保存=提交并 pop；取消/返回=放弃并 pop；X/Esc/遮罩=关闭整个浮层 |

- 最多两层，禁止 L2 再套 L3、禁止嵌套 Dialog。
- Tabs 只用于平级内容且常显（天气信息分类、待办视图）。
- 六插件共用详情骨架：header 56 / 可选工具栏 48 / 可选 Tabs 40 / 内容滚动 / 可选 footer。
- 「设置…」跨页跳到宿主设置页对应分区（暂不返回详情，记后续优化）。

## 3. 输入与反馈（触控优先）

| 输入 | 卡片 | 空白桌面 | 编辑模式 |
|---|---|---|---|
| 触控轻点 | 插件主操作（打开详情/显式控件） | 退出/聚焦 | 拖拽、按钮 |
| 触控长按 500ms | 进入编辑模式（选中该卡） | 进入编辑模式 | — |
| 鼠标左键 | 同轻点 | 同轻点 | 拖拽、按钮 |
| 鼠标 hover | 卡片 +1.5% + 描边/阴影 | — | — |
| 鼠标右键 | 无自定义菜单（原生菜单禁用） | — | — |
| 鼠标/键盘进编辑 | 设置页「外观 → 编辑桌面布局」 | 同左 | — |
| 键盘 | Tab 聚焦、Enter/Space 主操作 | Esc 退出编辑 | 方向键移动、Delete、Enter、Esc |

- 卡片按压：按下 0.985；长按 500ms 内线性下沉到 0.97，到点进编辑；松手回弹。
- 手势由共享 SDK `useHostCardGesture` 上报（过滤按钮/输入等控件），长按计时器只在插件侧 SDK 跑一份，
  宿主只做视觉与进编辑。

## 4. 设置归属（插件声明式 schema）

- 设置页左侧新增“插件”，条目从已安装插件动态生成；插件在 `manifest.json` 的 `settings` 声明分组与字段。
- 字段类型 v1：`boolean` / `number` / `enum` / `text`(secret) / `timeRange`。
- 即时生效；底部「保存」是羡余（幂等提交并关闭）；每分区「恢复默认」；×/Esc/遮罩与保存同义。
- 插件删除 `?view=settings` 界面；内容管理（城市列表、清单管理、世界时钟）留在详情，不进设置。
- 宿主不再写任何插件专属设置 UI；复盘页名称等也不写死插件 id。

## 5. 六个插件定稿摘要

详细规格见各组件文档；这里只列关键决定。

### 5.1 时钟（[clock.md](../components/clock.md)）
- 卡片：1×1 时间；2×1 时间+秒+日期；3×2 大时间+日期/星期。纯展示，点击=详情。
- 详情 L1：时间 40（`Hero900`）+ 日期、世界时钟列表（≤8，秒级刷新）、日期信息；设置…跳宿主设置。
- L2：添加城市（内置 ~40 城市搜索，时区用 IANA，禁止重复，添加后 pop）。
- Agent：`clock.now`、`clock.settings.get/set`、`clock.world.list/add/remove`。

### 5.2 倒数日（[countdown.md](../components/countdown.md)）
- 卡片：1×1 最近一条；2×1 一条；2×2 列表；3×2 列表；纯展示，点击=详情；去掉 `+`/长按/右键。
- 详情 L1：即将到来 / 已过去（折叠）两组；行 44，标题 16、天数 20、日期 12；今天 Badge、7 天内 Badge；行尾 ⋯ 编辑/删除（行内确认）。
- L2：新建/编辑表单（标题/日期/每年重复；**每事件自选颜色已移除**，见 density-countdown-todo §2.8）；保存 pop、取消/返回 pop、X 关闭。
- 设置：显示已过去、强调 7 天内。
- Agent：`countdown.list/add/update/remove/settings.get/set`。

### 5.3 久坐（[sedentary.md](../components/sedentary.md)）
- 卡片：1×1 Badge+分钟 40（无按钮、无状态点）；2×1 起显示分钟 40+状态点+「我站起来了」40；点击=详情；去掉 ⋯ 菜单/长按。
- 详情 L1：状态 16 + 辅助 12、我起来了、设置…；4 个统计块；最近 7 天列表（行 44）。
- 设置：启用、阈值、再催间隔、强提醒（空闲判定/免打扰已按 D-25–D-27 移除）。
- Agent：`sedentary.status/today/takeBreak/snooze/settings.get/set`；提醒只由 background iframe 调度。

### 5.4 番茄钟（[pomodoro.md](../components/pomodoro.md)）
- 卡片：1×1 时间 40+阶段（无按钮、无进度条）；2×1 起「开始/暂停」+「重置」；2×2+ 任务、轮次与今日统计；去掉 ⋯ 菜单/沉浸模式/长按。
- 详情 L1：阶段 Badge + 剩余 40 + 轮次；开始/暂停、重置、跳过、任务选择；一行四列统计；最近记录按天分组；清空记录（行内确认：清空今日/清空全部）。
- L2：选择关联任务（来自待办的未完成任务，选中即关联并 pop）。
- 设置：时长/轮数、自动开始、提示音、保持唤醒、白噪音类型/音量。
- Agent：`pomodoro.start/pause/resume/stop/skip/reset/status/stats/clearStats/settings.get/set`。

### 5.5 待办（[todo.md](../components/todo.md)）
- 卡片：固定「今日」视图（逾期+今天），纯展示 + checkbox 勾选；1×1 计数 40；2×2 5 行、3×2 5 行、3×3 8 行、4×2 5 行单列；无 `+`/输入框/菜单/视图切换/拖拽。
- 详情 L1：header（清单筛选 + 搜索 + 添加任务）+ 常显 Tabs（列表/日历/周/月/热力图）+ 分组列表；行 ⋯ 编辑/删除（行内确认）；已完成折叠 + 清空。
- L2：任务编辑（标题/备注/清单/优先级/截止/提醒/重复/标签/子任务；保存/取消/删除）、清单管理（新建/重命名/删除/默认）。
- 设置：显示已完成、默认排序、一周起始（`fontSize` 字号设置已删除，D-36 §1）；默认清单进详情清单管理。
- Agent：在原有 lists/list/add/update/remove/addList/complete/subtask/search 基础上补 `renameList/removeList/removeSubtask/clearCompleted/settings.get/set` 与 `stats`。

### 5.6 天气（[weather.md](../components/weather.md)）
- 卡片：1×1 图标+温度 40；2×1 +现象+高低温；2×2 当前+逐时 4 列；3×2 当前+逐时 6 列 × 4 行（不放 7 天）；4×2 当前+AQI+等宽 7 天底栏；预警仅 3×2/4×2 紧凑 Badge；点击=详情；去掉城市菜单/刷新/设置/长按。
- 详情 L1：城市/更新时间/刷新/设置 56；紧凑摘要（温度 40、AQI Badge）；单行 6 项环境信息；Tabs（逐时/7天/空气/生活指数/预警）；列表行 44；有预警默认进预警 Tab。
- L2：管理城市（搜索添加/删除/设为当前/系统定位或 ip.cn 网络定位）。
- 设置：单位、刷新间隔、自动定位、显示 AQI/预警/分钟级降水、API Key/Host。
- Agent：原有 current/hourly/daily/air/warning/queryPlace/places/addPlace/removePlace，补 `setCurrentPlace/locate/refresh/settings.get/set`。

## 6. 动效（索引）

完整参数见 [MOTION.md](../MOTION.md)：卡片 hover 1.5% / 按下 0.985 / 长按下沉；L1 完整 container transform（所有尺寸，内容后段交叉淡入，关闭 150ms 收回卡片）；L2 push/pop；页面/编辑模式/翻页；插件内容按 Fluent motion；`prefers-reduced-motion` 全局生效。

## 7. 颜色（本轮口径）

严格 Fluent 2 功能色：中性文字 + 品牌（交互）+ 语义（状态）+ 数据（AQI/热力图）+ 内容色（天气图标、用户选色小面积）。**插件个性色/氛围色本轮不做**，后续单独讨论；不新增 hex，需要新色先映射 Fluent 调色板或登记项目 token。

## 8. Agent 对等原则

用户能做的每个操作都有对应工具，反之亦然；插件文档必须列「UI 路径 ↔ 工具」；详细见契约 §6。

## 9. 工程债与后续

- E6 测试脚手架清理：删除三套 demo host（shell/agent/plugins）与 bridge-check，收敛到正式 host 的 dev-only 参数或 `tests/`；去掉演示横幅/假桌面/源码水印；Agent「演示模式」移出主设置；生产 `dist` 不得包含 demo 页面与文案。
- 后续优化：设置页返回详情（第三层返回栈）、插件个性色、HIG 之外的视觉“感觉”、Tauri 真机验收。
- 自动定位方案已定：Windows 定位优先，失败用 ip.cn 网络归属地（D-16，待实现）；不再使用高德。

## 10. 状态

- 设计定稿：✅（2026-10-19）
- 文档定稿：✅（六份组件文档 + 契约 + 动效 + 本汇总）
- 实现：⏳ 按 [PLAN.md](PLAN.md) E0–E7 串行推进。
