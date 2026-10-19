# 插件设置 / 详情浮层重排结果（v1，2026-10-19）

> **⚠️ 历史文档（部分被取代）**：本文记录的是 v1 浮层重排；随后定稿的新模型已把设置迁到宿主设置页、
> 详情改为 L1/L2 页栈（见 `docs/PLUGIN-CONTRACT.md`、`docs/DESIGN-ROUND-SUMMARY.md`、D-14）。
> 本文保留作为历史验收证据（12 视图断言、截图），不再描述目标状态。

> 对应规格：`docs/OVERLAY-REWRITE-SPEC.md`。范围：宿主全窗口 Fluent Dialog 里加载的
> `?view=settings|detail|edit|all` 视图（6 个插件、12 个视图）。卡片视图、宿主代码、
> `_shared/**` 未改；功能与浮层机制（`requestSettings` / `requestOverlay` / `?view=`）保持原样。

## 1. 改了什么

| 插件 | 视图 | 主要改动 |
|---|---|---|
| clock | settings | 预览块 40→新布局；分组「时间显示 / 日期格式」；行 48、开关 40；底部操作提示 12 fg3；删除重复标题 |
| weather | settings | 单列 720 居中；分组「显示 → 行为 → 天气数据 → 城市」；Field 上下布局；城市行 44 + 40 图标操作；新增城市 input 40 + 按钮 40；自动定位逻辑原样 |
| weather | detail | 头部城市 16 + 状态 12 + 刷新/设置 40；TabList/Tab 40；当前天气改 6 个两列 statCard（385×88）；面板接新 StatCard；无 10px/clamp |
| countdown | settings | 开关行 48 + 说明 12；「使用提示」统一说明；删除 Divider |
| countdown | edit | 表单 720 + Field 上下布局；底部固定操作条（删除 danger + 取消/保存 40） |
| pomodoro | settings | 分组「时长与轮数 → 行为 → 白噪音」；时长 Field 两列；开关行 48；控件 40 |
| pomodoro | detail | 头部状态 16 + 辅助 12；今日与趋势 4 张 statCard（值 24 / 标签 12）；空态主操作 |
| sedentary | settings | 分组「提醒 → 计时 → 免打扰」；3 个时长 Field；说明文案去工程细节 |
| sedentary | detail | 头部状态 16；今日统计 4 张 statCard；底部主操作「我起来了」 |
| todo | settings | 分组「显示 / 列表行为 / 清单管理 / 数据」；行 48、清单行 44、40 图标操作；新增清单 input 40 + 按钮 40；行内二次确认删除 |
| todo | detail | 表单 720 + Field；子任务行 44；标签/截止/提醒 40；底部固定操作条（删除 / 取消 / 保存 40） |
| todo | all | 工具行搜索/筛选/排序 40；分组头 14、行 44（标题 16 / 元信息 12）；≥760 两列按**时间顺序**切段（左列读完接右列），否则单列；纵向滚动 |

统一规则（全部视图）：root padding 24、内容 max-width 720 居中、section 间距 24、组内行距 12、
设置行 48 / 列表行 44、控件 40、无 `Divider` 分组、无 10/11px、无 clamp 字号、无 `lineHeight: 1`；
浮层内补 `.fui-Input__input` / `.fui-Dropdown__button` `min-height: 40px`（Fluent large 内层实测 38px）。

## 2. 机器验证

### 2.1 浮层断言（`node scripts/verify-overlays.mjs`，834×582）

| 插件 | 视图 | 字号实测 | 文本长度 | 可交互控件（<40px） | 结果 |
|---|---|---|---|---|---|
| clock | settings | 12–40 | 164 | 5（0） | PASS |
| weather | settings | 12–20 | 403 | 14（0） | PASS |
| weather | detail | 12–32 | 177 | 10（0） | PASS |
| countdown | settings | 12–20 | 108 | 2（0） | PASS |
| countdown | edit | 12–20 | 87 | 9（0） | PASS |
| pomodoro | settings | 12–20 | 207 | 14（0） | PASS |
| pomodoro | detail | 12–24 | 91 | 0（0） | PASS |
| sedentary | settings | 12–20 | 226 | 9（0） | PASS |
| sedentary | detail | 12–24 | 113 | 1（0） | PASS |
| todo | settings | 12–20 | 210 | 19（0） | PASS |
| todo | detail | 12–16 | 142 | 29（0） | PASS |
| todo | all | 12–16 | 299 | 24（0） | PASS |

- 暗色 `--screenshots`：12/12 PASS；亮色 `--scheme light --screenshots`：12/12 PASS。
- 每个视图同时断言：非空渲染、无横向溢出（`scrollWidth ≤ clientWidth`）、无 <12px 文本、
  无高度 <40 的控件、0 console error。
- 截图（暗色 + 亮色各 12 张）：`shots/rewrite/overlays/<plugin>-<view>[-light].png`。

### 2.2 宿主内集成（`node scripts/shot-host-overlays.mjs`，1440×960，DSF2）

对桌面卡片 iframe 直接转发宿主 `host:open-settings`（与编辑模式「设置」同一条通道），
断言宿主 Fluent Dialog 内的浮层渲染完成并截图：

- 7/7 PASS：clock / weather / countdown / pomodoro / sedentary / todo 的**设置** + weather **详情**；
- 截图：`shots/rewrite/overlays/host-<plugin>-<view>.png`（含宿主标题「插件名 · 视图名」与关闭按钮）。

### 2.3 构建

- `node scripts/build-plugin.mjs clock countdown pomodoro sedentary todo weather` 全部成功；
  产物：clock 474 KB / countdown 776 KB / pomodoro 809 KB / sedentary 740 KB / todo 1000 KB / weather 912 KB。
- `npm run build`（宿主）通过。

## 3. 残留与说明（非阻塞）

1. **浮层自动关闭协议**：宿主目前没有“关闭浮层”的逆向消息，插件视图的取消/完成按钮只能
   （a）恢复表单初始值或（b）通过既有 Esc 通道 `plugin:request-overlay-close` 请求关闭。
   countdown 的「取消」为恢复初始值，不关浮层；todo detail 保存/删除后请求关闭。若后续需要
   “保存后自动关”，再补一条宿主→插件→宿主的显式 close 协议（不属本轮布局范围）。
2. **详情页信息量**：pomodoro / sedentary 详情在 582px 高度下首屏 4 张 statCard + 一行说明，
   下方留白较多（详情是“更多 + 操作”，不重复放卡片主信息）；weather / todo 详情内容已填满。
   若后续要加“最近记录”等，属于新功能，不在本轮范围。
3. **天气「风力」**：详情里“东南风3级”改用 24px 值字号（其它数值仍 32px），避免中文长词过重。
4. **Fluent 控件外框 42px**：Input/Dropdown 外层 42px（1px 边框），内层原生控件 40px；
   断言按 ≥40 通过，未为了 40 而牺牲内层触控高度。
5. **倒计时编辑页截图是新增态**：编辑已有条目时左侧才出现 danger「删除」（需二次确认）。
6. 竖屏不在产品范围（DESIGN），浮层只在横屏窗口验证；1024×768 下 iframe 约 834×455，
   各视图均为内部滚动，无横向溢出。

## 4. 文件清单

- 源码：`public/plugins/{clock,weather,countdown,pomodoro,sedentary,todo}/src/**`（仅浮层视图文件，见规格 §5）
- 产物：`public/plugins/*/app/app.js`（全部重建）
- 脚本：`scripts/verify-overlays.mjs`（新增）、`scripts/shot-host-overlays.mjs`（新增）
- 规格：`docs/OVERLAY-REWRITE-SPEC.md`（新增）
- 截图：`shots/rewrite/overlays/`（12 视图 × 暗/亮 + 7 张宿主内集成）
