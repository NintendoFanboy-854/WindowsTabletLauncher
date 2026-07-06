# 实现路线图

基于 [Todo清单 (evetech.top)](https://www.evetech.top/?cat=7) 产品功能完整度对比，
列出 PomodoroPlugin、TodoPlugin、SedentaryPlugin 三个插件的缺失功能及其实现方案。

每条方案优先使用 WinUI 3 内置控件。相关文档位于 `docs/windows-dev-docs/`。

---

## 1. 项目特有约束与可用武器库

### 1.1 架构约束

| 约束 | 影响 |
|------|------|
| 自包含部署，无 Package Identity | `Windows.Media.SpeechRecognition` 和后台任务不可用；`DisplayRequest` 不可用，改 `SetThreadExecutionState` |
| XAML-in-C#（无编译 .xbf） | 所有 UI 通过 `new Grid()` / `new StackPanel()` / `XamlReader.Load()` 构造，不可引用生成的 `InitializeComponent()` |
| PluginContract 无 WinUI 依赖（plain `net10.0`） | 共享类型仅限 `object`（UI 类型擦除）、接口、POCO；不可在 PluginContract 中引用 `Microsoft.UI.Xaml` |
| 插件通过 `AssemblyLoadContext.Default.LoadFromAssemblyPath` 加载 | 新增共享库需各插件独立引用，不可依赖宿主私有类型 |
| GridLayoutManager 用 SubColumns/SubRows 半格系统 | 新 widget 须正确声明 `HalfColumns` / `HalfRows`，最小占 1×1 半格 |
| Acrylic 桌面背景（Win10 `DesktopAcrylicController`） | 所有 overlay 通过 `_host.GetWidgetBackgroundBrush()` 获取统一 Acrylic Brush |
| `PluginOverlay` 模式：每个插件私有一份 | 需提取公共基类，减少代码复制 |
| `MiniChart` 自绘图表：每个插件各有一份 | 需提取共享 |

### 1.2 可用 WinUI 3 内置控件

| 控件 | 本地文档 | 用在哪 |
|------|----------|--------|
| `CalendarView` | `hub/apps/develop/ui/controls/calendar-view.md` | 月历/周历视图 |
| `CalendarDatePicker` | `hub/apps/develop/ui/controls/calendar-date-picker.md` | 日期选择（已有） |
| `MediaPlayerElement` | `hub/apps/develop/ui/controls/media-playback.md` | 白噪音播放 |
| `ProgressBar` / `ProgressRing` | `hub/apps/develop/ui/controls/progress-controls.md` | 子任务进度 |
| `InfoBar` | `hub/apps/develop/ui/controls/infobar.md` | 应用内非侵入提醒 |
| `TeachingTip` | `hub/apps/develop/ui/controls/dialogs-and-flyouts/teaching-tip.md` | 首次使用引导 |
| `ColorPicker` | `hub/apps/develop/ui/controls/color-picker.md` | 工作量配色（备选） |
| `Composition` 动画 | `hub/apps/develop/composition/` (多个文档) | 沉浸过渡、叠加动画 |
| `NumberBox` | `hub/apps/develop/ui/controls/number-box.md` | 设置面板数值输入（已有） |

### 1.3 项目已有模式复用

- **Agent 工具注册**：`_host.RegisterAgentCapability(this)` → 新功能 = 新 agent 工具
- **Config 持久化**：`_host.GetConfig/SetConfig(pluginId, key, json)` → 新数据 = 新 config key
- **半格系统**：`HalfColumns` / `HalfRows` → 新 widget 精确控制占用
- **通知**：`_host.ShowNotification(title, msg, escalate)` → 统一提醒出口
- **UI 线程调度**：各个插件的 `OnUi(Func<string>)` 模式 → agent 调用须 marshal 到 UI 线程

---

## 2. 共享基础设施提取（P0 — 所有后续功能的前置）

### 2.1 MiniChart → SharedUtils

- **现状**：`PomodoroPlugin/MiniChart.cs` 和 `SedentaryPlugin/MiniChart.cs` 完全相同的代码（`Bars()` + `Line()` 方法，使用 WinUI `Grid` / `Border` / `Polyline` Shapes）
- **方案**：提取到 `src/SharedUtils/MiniChart.cs`
  - 新建 `SharedUtils.csproj`：`net10.0-windows10.0.26100.0`，`UseWinUI=true`，`WinUISDKReferences=false`
  - 三个插件的 csproj 添加 `<ProjectReference>` 到 SharedUtils
  - `build-release.ps1` 中 `$morePlugins` 不增加（SharedUtils 不是插件，仅需 build）+ 确保其 DLL 复制到各插件输出

### 2.2 PluginOverlay → BasePluginOverlay

- **现状**：三个插件各自有一份 `PluginOverlay.cs`。PomodoroPlugin 和 SedentaryPlugin 版本相同（`StackPanel` header），TodoPlugin 不同（3列 `Grid` 居中标题）
- **方案**：`SharedUtils/BasePluginOverlay.cs` 提供：
  - 全屏 `Popup`：半透明 `SolidColorBrush` 遮罩 + 居中 `Border` 卡片（带 `AcrylicBrush` 背景和 `CornerRadius`）
  - `FadeIn()` / `FadeOut()` 方法：使用 `Compositor.CreateScalarKeyFrameAnimation` 对 Popup 的 `Opacity` 做动画
  - `BuildHeaderRow()` 虚方法：子类重写标题栏，默认提供返回按钮（`Button` + FontIcon ``）
  - `BuildContent()` 抽象方法：子类填充卡片内容
  - `ShowAsync()` / `Hide()` 方法
  - 卡片默认尺寸 860×560（与现有 TodoWidget overlay 一致）
- **变动**：
  - 删除 `PomodoroPlugin/PluginOverlay.cs`、`SedentaryPlugin/PluginOverlay.cs`；改为继承 `BasePluginOverlay`
  - `TodoPlugin/PluginOverlay.cs` 保留但有差异的头格式 → 改为覆写 `BuildHeaderRow()`

### 2.3 StatsHelper → PluginContract

- **位置**：`PluginContract/StatsHelper.cs`（纯 .NET，无 WinUI 依赖）
- **提供**：
  - `public static Dictionary<string, int> SlidingWindow(Dictionary<string, int> raw, int days)` — 近 N 天滑动窗口，缺失日期补 0
  - `public static void PruneOldEntries(Dictionary<string, int> raw, int maxDays)` — 删除超过 maxDays 的键
  - `public static string TodayKey()` → `DateTime.Today.ToString("yyyy-MM-dd")`
  - `public static int[] HourlyBuckets(IEnumerable<(DateTime time, int value)> entries)` → 返回 `int[24]` 按小时聚合
- **调用方**：PomodoroPlugin 的 `GetStats/Last7/AddCompletion`，SedentaryPlugin 的 `Last7()`

### 2.4 AgentCapabilityBase → SharedUtils

- **现状**：三个插件各自实现 `IAgentCapability`，`OnUi` 调度逻辑完全重复
- **方案**：`SharedUtils/AgentCapabilityBase.cs`
  - 抽象类，实现 `IAgentCapability`
  - 构造函数接受 `DispatcherQueue`
  - 内置 `OnUi(Func<string> action)` 方法（`TaskCompletionSource` + `TryEnqueue`）
  - 抽象方法：`protected abstract IReadOnlyList<AgentTool> DefineTools();`
  - 抽象方法：`protected abstract string HandleTool(string tool, string argumentsJson);`
  - `GetTools()` 和 `InvokeAsync()` 实现由基类提供
- **放在 SharedUtils 而非 PluginContract** 的原因：依赖 `Microsoft.UI.Dispatching`（WinUI 类型）

---

## 3. PomodoroPlugin 缺失实现

### 3.1 专注记录 — 逐次 Session 历史

**对照 Todo清单**：专注记录页面详细留存每次完整/不完整番茄钟的事件名称和时间

**方案**：
- 新增 config key `"sessions"`，存储 `List<PomodoroSession>` JSON
  - `PomodoroSession` 定义在 PluginContract（纯 POCO，字段：`Date`、`Task`、`FocusMin`、`Completed`、`Timestamp`）
- `PomodoroWidget.PhaseComplete()` 中写入一条新 session 记录
- Prune 超过 90 天的记录（调用 `StatsHelper.PruneOldEntries`）
- **Widget 变更**：detail overlay 新增「专注记录」区域（`ItemsControl` + 自定义 `DataTemplate`，最近 20 条）
- **Agent 新工具**：`query_pomodoro_sessions`（参数 `count`: int → 返回最近 N 条 JSON 数组）
- **Agent 工具变更**：`query_pomodoro_stats` 新增 `totalCompleted`、`totalMinutes` 字段

### 3.2 专注时间分布 — 分时柱状图

**对照 Todo清单**：番茄专注时间分布（24小时分布图）

**方案**：
- 在 `PomodoroWidget` 中新增 `int[] _hourlySeconds = new int[24]`，`OnTick` 时累计当前小时桶
- 复用 `SharedUtils.MiniChart.Bars(hourLabels, hourlyMinutes)` 渲染 24 小时蓝色柱状图
- 长图表用 `ScrollViewer` 包裹
- 数据从 sessions 计算也可（按时间戳聚合），但运行时计数器更高效
- **Widget 变更**：detail overlay 新增 "专注时间分布" 区块
- **Agent 新工具**：`query_pomodoro_distribution` → JSON `{"09":45,"10":120,...}`

### 3.3 白噪音

**对照 Todo清单**：番茄专注页面可播放白噪音（多种类型）

**方案**：
- 使用 WinUI 3 `MediaPlayerElement`（`docs/hub/apps/develop/ui/controls/media-playback.md`）
- 音频资源：用 `EmbeddedResource` 嵌入公共领域 `.mp3` 文件（雨声、篝火、咖啡馆 → 3 个即可）
- 在 detail overlay 新增区域：
  - `ComboBox` 选择音频类型
  - `Button`（Play/Pause，`FontIcon` 切换）
  - `Slider` 音量调节（0.0–1.0）
- Overlay 关闭时 `MediaPlayer.Pause()`
- 设置 key `"white_noise"`：当前选中的音频名（空字符串 = 关闭）
- **Agent 新工具**：`set_white_noise`（`name`: "rain"|"fire"|"cafe"|"none"）、`query_white_noise`

### 3.4 沉浸模式

**对照 Todo清单**：全屏沉浸模式 + 随机计数显示 + 防烧屏

**方案**：
- 在 detail overlay 中新增「沉浸」按钮（仅在专注进行中可见）
- 点击后：隐藏设置面板、按钮栏、任务输入，仅保留大号倒计时（100pt+）+ 阶段标签 + 微小 "退出" 文字
- 动画：使用 Composition API (`Compositor.CreateScalarKeyFrameAnimation`) 做时间数字缩放弹出 + 遮罩 `Opacity` 淡入
- 设置 key `"anti_burn_in"`（`ToggleSwitch`）：沉浸模式下每 60 秒微移时间文字位置 ±5px
- 退出：点击任意位置或 ESC → `KeyDown` 事件
- **Agent 新工具**：`enter_immersive`、`exit_immersive`
- **注意**：沉浸模式 overlay 在 `PomodoroWidget` 内部管理，使用 `Popup` 或 Canvas 全屏覆盖

### 3.5 屏幕常亮

**对照 Todo清单**：番茄专注时屏幕常亮

**方案**：
- 使用 `SetThreadExecutionState`（P/Invoke `kernel32.dll`），非打包 WinUI 3 中可用
- 专注开始：`SetThreadExecutionState(ES_CONTINUOUS | ES_DISPLAY_REQUIRED | ES_SYSTEM_REQUIRED)`
- 暂停/结束：`SetThreadExecutionState(ES_CONTINUOUS)`
- P/Invoke 签名模式已有先例（SedentaryPlugin 的 `GetLastInputInfo`）
- 设置 key `"keep_screen_on"`（`ToggleSwitch`，默认 `true`）
- **Agent 影响**：无新增工具，行为通过 settings 控制

### 3.6 暂停按钮策略调整

**对照 Todo清单**：Todo清单**刻意不提供暂停按钮**（严格遵循番茄工作法——番茄钟不能被打断）

**方案**：
- 保留现有暂停功能，但新增设置 key `"allow_pause"`（`ToggleSwitch`，默认 `true`）
- `allow_pause = false` 时：专注期间不显示暂停按钮，`pause_pomodoro` / `resume_pomodoro` agent 工具返回 error
- 给用户选择权，默认兼容现有行为
- **Agent 工具变更**：`pause_pomodoro`、`resume_pomodoro` 在 `allow_pause=false` 时返回 `{"ok":false,"error":"pause_disabled"}`

---

## 4. TodoPlugin 缺失实现

### 4.1 日历月/周视图

**对照 Todo清单**：日视图、月视图、日历中标记事件日期

**方案**：
- TodoWidget overlay 左侧面板（现为 280px `ListView`）增加视图切换（顶部 `Pivot` 或 `RadioButtons`）：「列表」「日历」
- 日历模式使用 WinUI 3 `CalendarView`（`docs/hub/apps/develop/ui/controls/calendar-view.md`）
- `CalendarViewDayItemChanging` 事件中：
  - 遍历当天有截止日的 TodoItem
  - 给日期标记圆点（灰色=正常，红色=有逾期任务）
  - 使用 `CalendarViewDayItem.SetDensityColors()`（需验证 WinUI 3 支持）
- 点击日期 → 筛选该日任务，右侧列表更新
- **Widget 尺寸**：overlay 860px 宽，CalendarView 需约 400px 宽 → 左侧 280px 扩大到 420px，右侧 580px → 440px
- **设置 key**：`"default_view"`（"list"/"calendar"，默认 "list"）
- **Agent 新工具**：`query_todo_by_date`（`date`: "yyyy-MM-dd"）→ JSON 数组
- **Agent 工具变更**：`list_todo` 新增可选 `date` 参数

### 4.2 工作量标记（三色难度）

**对照 Todo清单**：灰色=一般，橙色=中等难度，红色=较高难度

**方案**：
- 利用现有 `TodoItem.Priority` 枚举映射颜色（UI 层纯计算）：
  | Priority | 颜色 | 语义 |
  |----------|------|------|
  | `None` | 无标记 | — |
  | `Low` | `#9E9E9E` 灰 | 一般（对应 Todo清单"一般"） |
  | `Medium` | `#FF9800` 橙 | 中等难度 |
  | `High` | `#F44336` 红 | 较高难度 |
- 任务列表左侧加 4px 宽 `Border` 显示对应颜色
- 详情编辑器的 Priority `ComboBox` 旁加小色条预览（`Border` + `CornerRadius=2`）
- 预置三色 `RadioButton` 横向排列作为快捷选择（不用 `ColorPicker`，太占空间）
- **Agent 工具变更**：无（Priority 字段已存在，颜色由 UI 层自动映射）

### 4.3 待办箱（收件箱）

**对照 Todo清单**："待办箱" 收录尚未确定日期的事件，可随时重新安排

**方案**：
- `TodoStore` 中新增 `public const string InboxList = "收件箱"`
- 添加到 `ListNames` 属性最前面（用分隔符与其他列表区分）
- 无 `Deadline` 且不属于其他显式列表的任务默认归入收件箱
- 从收件箱设置日期后自动移出到默认列表
- UI：overlay 列表选择器 `ComboBox` 中 "收件箱" 排第一位，加水平分隔线
- **Agent 新工具**：`move_to_list`（`taskText`: string, `listName`: string）
- **Agent 工具变更**：`add_todo` 新增 `inbox`: bool 参数（默认 false）

### 4.4 子任务进度条

**对照 Todo清单**：根据子事件显示事件进度（日程概览设置中的选项）

**方案**：
- 详情面板子任务区域顶部加 WinUI 3 `ProgressBar`
  - `Value = completedSubtasks / totalSubtasks * 100`
  - 右侧 `TextBlock` 显示 "2/5"
  - 全部完成时进度条变绿：`Foreground = new SolidColorBrush(Color.FromArgb(0xFF, 0x4C, 0xAF, 0x50))`
- **Agent 工具变更**：`list_todo` 每个任务 JSON 新增 `subtaskProgress`: float 字段（0.0–1.0）

### 4.5 子任务全部完成自动打勾

**对照 Todo清单**："子事件全部完成时，自动完成事件"（事件设置中的开关）

**方案**：
- `TodoStore.ToggleSubtask()` 中增加逻辑：
  - 切换后遍历父任务所有 `Subtasks`，若全部 `Done = true` 则设置 `item.Done = true`
  - 保存并触发 `Changed` 事件
- 设置 key `"auto_complete_on_subtasks"`（`ToggleSwitch`，默认 true）
- **Agent 工具变更**：无（行为自动反映）

### 4.6 任务完成率统计面板

**对照 Todo清单**：事件统计——工作量趋势、完成率、拖延趋势、最勤奋日、时间掌控评估、累计达成总数

**方案**：
- TodoWidget overlay 底部工具栏增加「统计」按钮，切换 overlay 内容到统计面板
- 统计内容（从 `TodoStore.Items` 实时计算，无需额外 config）：
  - 今日完成率：`x/y` + `ProgressBar`
  - 近 7 天完成趋势：`MiniChart.Line()` 折线图
  - 逾期率：逾期任务数 / 有截止的总任务数
  - 累计达成总数：`Items.Count(i => i.Done)`
- **Agent 新工具**：`query_todo_stats` → JSON（`todayCompleted`、`todayTotal`、`overdueCount`、`historyTotal`、`weeklyTrend[]`）
- Moved to shared `MiniChart` after 2.1

### 4.7 语音输入（P2 — 需 Package Identity）

**对照 Todo清单**：长按 "+" 通过语音识别添加事件

**方案**：
- 添加任务输入框旁增加麦克风按钮（FontIcon ``）
- 长按触发：`Windows.Media.SpeechRecognition.SpeechRecognizer`
- 识别结果自动填入输入框
- **阻塞条件**：`SpeechRecognizer` 需要 Package Identity，当前项目为自包含非打包部署
- 若未来改为打包部署则启用；Roadmap 中标注为 "条件编译 / 需要包装项目"

### 4.8 分享清单（Clipboard 轻量版）

**对照 Todo清单**：将清单以图片或文本形式分享

**方案**：
- Overlay 工具栏新增「分享」按钮（FontIcon ``）
- 生成格式化纯文本：
  ```
  [2026-07-07] !! 写周报 #工作 — 截止 17:00
  [2026-07-07]   买菜 #生活
  ```
- 调用 `Windows.ApplicationModel.DataTransfer.Clipboard.SetContent()`
- `InfoBar` 弹出："已复制到剪贴板"（2 秒自动消失）
- **不生成图片**（需要 Win2D 渲染，ROI 低）
- **Agent 新工具**：`share_todo_list`（`listName`: optional string）→ 返回生成文本 + 自动复制

---

## 5. 数据复盘体系 — 全局统一 Dashboard

### 5.1 架构决策

Todo清单 有 4 种数据报告：昨日小结、事件统计、番茄统计、周报。

**决策**：在 LauncherHost 中内建 `DashboardPage`（不是独立插件），理由：
- 统计页面全屏展示，不占 grid tile，不需要 `IWidget`
- 需跨插件聚合数据 → 属于宿主职责
- 免除插件间通信的复杂性

### 5.2 宿主如何获取插件数据

扩展 `IHostHandle` 接口（PluginContract）：

```csharp
// 新增方法 —— 返回所有插件中匹配 keyPrefix 的 (pluginId, key, value) 元组
IReadOnlyList<(string pluginId, string key, string value)> GetAllConfigs(string keyPrefix);
```

`HostHandle` 实现：遍历 `ConfigStore` 中所有 key 并过滤。

`DashboardPage` 调用 `_host.GetAllConfigs("")` 获取全部数据，按已知 schema 解析：
- `PomodoroPlugin` → `stats`、`sessions`
- `TodoPlugin` → `items`
- `SedentaryPlugin` → `history`

### 5.3 DashboardPage 内容布局

全屏 `Grid`（可通过宿主工具栏按钮唤起），Acrylic 背景：

| 板块 | 数据来源 | 主要控件 | 说明 |
|------|----------|----------|------|
| 昨日小结 | Pomodoro.sessions + Todo.items + Sedentary.history | `TextBlock` 卡片（4 个指标）+ 近7天 MiniChart.Line | 昨日番茄数+昨日完成事件+昨日久坐分钟+趋势小图 |
| 事件统计 | TodoStore items | MiniChart.Bars（周完成量）+ ProgressBar（完成率）+ TextBlock（累计达成） | 工作量趋势柱状图、完成率环形占比 |
| 番茄统计 | Pomodoro sessions | MiniChart.Bars（周番茄数）+ MiniChart.Line（时长趋势）+ 分时图 | 时长趋势折线图、最佳专注日计算 |
| 久坐统计 | Sedentary history | MiniChart.Bars（周久坐分钟） + 7天折线图 | 久坐趋势、起身计数 |

全部图表使用 `SharedUtils.MiniChart`。

### 5.4 Agent 工具

宿主新增 agent 工具 `query_dashboard`（通过 `HostAgentCapability` 注册）：

```json
{
  "yesterday": {"focus": 4, "events": 6, "sedentary_min": 180},
  "weekly": {"focus": [4,5,3,...], "events": [6,4,7,...], "sedentary": [180,200,...]},
  "total": {"focus": 120, "events": 340}
}
```

### 5.5 设计理念约束

Todo清单 强调 "专注今天、化繁为简"。Dashboard 不展示 "效率评分" / "拖延指数" 等可能引起焦虑的指标，以 "昨日小结 + 趋势" 为主。

---

## 6. SedentaryPlugin 增强

### 6.1 InfoBar 应用内提醒

- **现状**：通过 `_host.ShowNotification()` 弹系统 Toast
- **方案**：在 widget tile 上方叠加 WinUI 3 `InfoBar`
  - `InfoBar.Severity = InfoBarSeverity.Warning`
  - `InfoBar.Message = "你已经连续久坐 XX 分钟，起来活动一下吧！"`
  - `InfoBar.ActionButton` = "我起来了"（调用 `ResetActive()`）
  - 5 秒后自动关闭（`InfoBar.IsOpen = false`）
  - 系统 Toast 保留作为 fallback（InfoBar 仅在宿主窗口前台可见）
- **Agent 影响**：无

### 6.2 TeachingTip 首次引导

- **方案**：首次使用 SedentaryPlugin 时显示 `TeachingTip`
  - `TeachingTip.Target` = widget tile（指导用户点击 tile 打开详情）
  - `TeachingTip.Subtitle` = "这是久坐提醒，当你连续久坐超过阈值时会提醒你起身活动"
  - 仅在首次初始化显示，通过 config key `"first_run"` = "false" 控制

---

## 7. Agent 工具变更汇总

### PomodoroPlugin

| 工具名 | 类型 | 说明 |
|--------|------|------|
| `query_pomodoro` | 不变 | — |
| `start_pomodoro` | 不变 | — |
| `pause_pomodoro` | **变更** | `allow_pause=false` 时返回 error |
| `resume_pomodoro` | **变更** | 同上 |
| `skip_pomodoro` | 不变 | — |
| `reset_pomodoro` | 不变 | — |
| `query_pomodoro_stats` | **变更** | 新增 `totalCompleted`、`totalMinutes` 字段 |
| `query_pomodoro_sessions` | **新增** | 返回最近 N 条专注 session 记录 |
| `query_pomodoro_distribution` | **新增** | 返回 24 小时分时专注 JSON |
| `set_white_noise` | **新增** | 设置白噪音类型：`{"name":"rain"\|"fire"\|"cafe"\|"none"}` |
| `query_white_noise` | **新增** | 查询当前白噪音状态 |
| `enter_immersive` | **新增** | 进入沉浸模式 |
| `exit_immersive` | **新增** | 退出沉浸模式 |

### TodoPlugin

| 工具名 | 类型 | 说明 |
|--------|------|------|
| `list_todo` | **变更** | 每个任务新增 `subtaskProgress` 字段；新增可选 `date` 参数 |
| `add_todo` | **变更** | 新增 `inbox`: bool 参数 |
| `complete_todo` | 不变 | — |
| `uncomplete_todo` | 不变 | — |
| `delete_todo` | 不变 | — |
| `clear_completed_todo` | 不变 | — |
| `set_todo_deadline` | 不变 | — |
| `set_todo_note` | 不变 | — |
| `set_todo_repeat` | 不变 | — |
| `set_todo_priority` | 不变 | — |
| `set_todo_tags` | 不变 | — |
| `add_subtask` | 不变 | — |
| `toggle_subtask` | 不变 | — |
| `list_lists` | 不变 | — |
| `create_list` | 不变 | — |
| `rename_list` | 不变 | — |
| `delete_list` | 不变 | — |
| `query_todo_stats` | **新增** | 返回今日/本周/累计统计数据 |
| `query_todo_by_date` | **新增** | 按 `date`:"yyyy-MM-dd" 筛选任务 |
| `move_to_list` | **新增** | 将任务移入指定列表 |
| `share_todo_list` | **新增** | 导出格式化文本 + 复制到剪贴板 |

### SedentaryPlugin

| 工具名 | 类型 | 说明 |
|--------|------|------|
| `query_sitting_time` | 不变 | — |
| `reset_sitting` | 不变 | — |
| `set_sedentary_enabled` | 不变 | — |
| `set_sedentary_threshold` | 不变 | — |
| `query_sedentary_stats` | 不变 | — |

### 宿主（HostAgentCapability）

| 工具名 | 类型 | 说明 |
|--------|------|------|
| `query_dashboard` | **新增** | 综合统计面板 JSON（昨日+周趋势+累计） |

---

## 8. 实施顺序与依赖关系

```
第一梯队: P0 基础设施（并行，互不依赖）
  ├── 2.1 MiniChart → SharedUtils
  ├── 2.2 BasePluginOverlay → SharedUtils
  ├── 2.3 StatsHelper → PluginContract
  ├── 2.4 AgentCapabilityBase → SharedUtils
  └── build-release.ps1: 增加 SharedUtils 构建步骤

第二梯队: P0 数据层（依赖 2.3）
  ├── 3.1 Pomodoro session 历史记录
  └── 3.6 暂停按钮策略调整

第三梯队: P1 独立功能（依赖 2.1, 2.2）
  ├── 3.2 专注时间分布      ─ 依赖 2.1 + 3.1
  ├── 3.3 白噪音            ─ 依赖 2.2
  ├── 3.5 屏幕常亮           ─ 无依赖
  ├── 4.2 工作量标记         ─ 无依赖
  ├── 4.3 待办箱             ─ 无依赖
  ├── 4.4 子任务进度条       ─ 无依赖
  ├── 4.5 子任务自动完成     ─ 依赖 4.4
  ├── 4.6 任务统计面板       ─ 依赖 2.1
  └── 4.8 分享清单           ─ 无依赖

第四梯队: P1–P2 增强
  ├── 3.4 沉浸模式            ─ 依赖 2.2 + 3.3（可与白噪音共享动画）
  ├── 4.1 日历视图            ─ 依赖 2.2
  ├── 4.7 语音输入（P2）      ─ 需要 Package Identity，条件编译
  ├── 6.1 InfoBar 提醒        ─ 无依赖
  └── 6.3 TeachingTip 引导    ─ 无依赖

第五梯队: P1 全局统计（最重，依赖所有数据源）
  ├── 5.1-5.4 DashboardPage    ─ 依赖 3.1 + 4.6 + 所有插件 stats 就位
  ├── IHostHandle.GetAllConfigs() 扩展  ─ 无依赖
  └── query_dashboard tool      ─ 依赖 5.*
```

---

## 9. 文件变更预估

| 模块 | 新增 | 修改 | 删除 |
|------|------|------|------|
| **SharedUtils** (新建项目) | `MiniChart.cs`, `BasePluginOverlay.cs`, `AgentCapabilityBase.cs`, `SharedUtils.csproj` | — | — |
| **PluginContract** | `StatsHelper.cs`, `PomodoroSession.cs` | `IHostHandle.cs`（新增 `GetAllConfigs` 方法） | — |
| **PomodoroPlugin** | — | `PomodoroPlugin.cs`(新增 agent tools, settings), `PomodoroWidget.cs`(overlay 重构, 白噪音, 沉浸, 屏幕常亮, 统计) | `MiniChart.cs`, `PluginOverlay.cs` |
| **TodoPlugin** | — | `TodoPlugin.cs`(新增 agent tools, settings), `TodoWidget.cs`(日历, 统计面板, 工作量标记, 待办箱), `TodoStore.cs`(收件箱逻辑, 子任务自动完成), `PluginOverlay.cs`(改为继承基类) | 旧 `PluginOverlay.cs`（合并到基类继承） |
| **SedentaryPlugin** | — | `SedentaryWidget.cs`(InfoBar 叠加), `SedentaryPlugin.cs`(TeachingTip) | `MiniChart.cs`, `PluginOverlay.cs` |
| **LauncherHost** | `DashboardPage.cs` | `HostHandle.cs`(实现 `GetAllConfigs`), `Core/HostAgentCapability.cs`(增加 `query_dashboard`), `DesktopPage.cs`(打开 Dashboard 按钮) | — |
| **build-release.ps1** | — | SharedUtils 构建 + DLL 复制逻辑 | — |

---

## 10. 已知风险与未决问题

| 风险 | 影响 | 应对 |
|------|------|------|
| 语音识别需 Package Identity | P2 功能可能无法在当前部署方式实现 | 文档标注前置条件；提供条件编译分支 |
| `CalendarView` 在自包含 WinUI 3 中是否完整可用 | 日历视图显示异常 | 先本地验证；备选方案为手动构建 `Grid` 月历 |
| `MediaPlayerElement` 嵌入 overlay `Popup` 中的行为 | 白噪音在 overlay 关闭后需确保停止 | `Hide()` 中调用 `MediaPlayer.Pause()`；`MediaPlayer` 生命周期绑定 overlay visibility |
| `SetThreadExecutionState` 在自包含 WinUI 3 中的兼容性 | 屏幕常亮可能失效 | 记录为 "best-effort"，不影响其他功能 |
| DashboardPage 需解析所有插件的 config schema | 紧耦合，插件 config 格式变更可能破坏 Dashboard | 通过约定规范——各插件文档化其 config key schema；Dashboard 解析时 fail-safe（try-catch 每个板块） |
| `build-release.ps1` 需更新构建 SharedUtils | SharedUtils 不被自动发现 | 在脚本中显式构建 SharedUtils 并复制 DLL 到 output |
| `BasePluginOverlay` 的 `Popup` 在 GridLayoutManager 的 `SizeChanged` 处理中是否受影响 | 与现有 `_dragTarget` 保护逻辑交互 | overlay 打开期间 GridLayoutManager 无需响应 SizeChanged，`BasePluginOverlay.ShowAsync()` 中设置标记 |
| PluginContract 新增 `IHostHandle` 方法 | 破坏了宿主接口 → 所有插件重编译 | 使用默认接口实现（C# default interface method）避免 breaking change |
