# 开发计划

## 0. 现状

已经有的：

- **工程骨架**：Tauri 2 + React 19 + Vite 8 + Fluent UI React v9，已编译出 `app.exe`，全屏无边框窗口验证通过。
- **原型**：固定 8×5 网格、iframe 插件加载、拖拽换格、时钟 / 待办两个 demo 插件。
- **验证方式**：`vite preview` 后台服务 + Edge headless 截图，不占桌面。
- **需求与设计**：[VISION.md](VISION.md)、[DESIGN.md](DESIGN.md)、`docs/components/*.md`（6 个插件 + Agent）。

要重构的：网格引擎（改成自适应）、manifest 格式（多尺寸）、宿主桥（8 个 API）、界面 Fluent 化。

## 1. 目标架构

```
宿主（React）
├── 桌面层：自适应网格、多页、编辑模式、拖拽
├── 插件管理器：扫描 / 加载 / 热重载 / zip 安装 / 后台 iframe
├── 桥接层：postMessage 协议（8 个 API、请求响应、主题注入、焦点交接）
├── 页面：设置 / 复盘 / 插件管理
├── 通知：Toast + 强提醒遮罩
└── Agent：三形态面板、模型接入、工具调度、语音、人脸

插件（iframe 页面 + manifest）
└── clock / todo / pomodoro / sedentary / weather / countdown

Tauri（Rust）
└── 全屏窗口、开机自启、系统定位、空闲检测、阻止息屏、文件读写、zip 解压
```

## 2. 任务分解

> 每个任务都是独立可交付的；`写作用域` 是给 subagent 并行时防冲突用的。

### 阶段 A：宿主内核（串行，先做完）

| # | 任务 | 产出 | 依赖 | 写作用域 |
|---|---|---|---|---|
| A0 | 工程基线 | 目录重构（`src/host`）、Bridge 协议类型定义、Fluent 主题与 token、`scripts/shot.ps1` 截图脚本 | — | `src/host/**`、`scripts/**`、`package.json` |
| A1 | Tauri 系统能力 | Rust command：窗口全屏/退出、开机自启、`getLocation`、`getIdleSeconds`、`setKeepAwake`、插件目录读写、zip 解压 | A0 | `src-tauri/**` |
| A2 | 插件管理器 | 扫描 `plugins/`、读 manifest（多尺寸）、挂载 iframe、后台 iframe、热重载、zip 拖入安装 | A0 | `src/host/plugins/**` |
| A3 | 布局引擎 | 自适应列数（8/6/4/3/2）、正方形单元格、行数推导、多页、布局持久化、列数变化重排 | A0 | `src/host/layout/**` |
| A4 | 编辑模式与拖拽 | 长按进入、卡片缩放、删除/改尺寸/设置按钮、拖拽吸附、边缘翻页、跨页拖动、键盘操作 | A3 | `src/host/desktop/**` |
| A5 | 桥接层 | 8 个宿主 API 的 postMessage 实现（请求/响应 id、超时处理）、主题 token 注入、焦点交接协议 | A2、A3 | `src/host/bridge/**` |

### 阶段 B：宿主外壳（可与 C 并行）

| # | 任务 | 产出 | 依赖 | 写作用域 |
|---|---|---|---|---|
| B1 | 设置页 | 全屏 Fluent 页面：主题、语言、开机自启、快捷键、Agent 设置入口、插件管理入口、退出 | A5 | `src/host/pages/settings/**` |
| B2 | 通知 | 全局 Toaster、强提醒遮罩组件（`showReminder` 实现） | A5 | `src/host/notifications/**` |
| B3 | 复盘页 | 昨日小结 / 本周 / 本月 / 工作量热力图，从插件 `stats.range` 聚合 | A5 | `src/host/pages/review/**` |
| B4 | 插件管理页 | 列表、启用/禁用、删除、重载、zip 安装入口 | A2 | `src/host/pages/plugins/**` |
| B5 | 全局行为 | 快捷键（隐藏/显示、Esc、退出）、退出方式、开机自启联动 | A1、B1 | `src/host/shell/**` |

### 阶段 C：六个插件（全部并行）

每个插件一个目录，互不冲突；输入 = 自己的组件文档 + DESIGN.md；产出 = `manifest.json` + 页面 + 自测截图。

| # | 插件 | 文档 | 写作用域 |
|---|---|---|---|
| C1 | 时钟 | [clock](components/clock.md) | `public/plugins/clock/**` |
| C2 | 待办 | [todo](components/todo.md) | `public/plugins/todo/**` |
| C3 | 番茄钟 | [pomodoro](components/pomodoro.md) | `public/plugins/pomodoro/**` |
| C4 | 久坐提醒 | [sedentary](components/sedentary.md) | `public/plugins/sedentary/**` |
| C5 | 天气 | [weather](components/weather.md) | `public/plugins/weather/**` |
| C6 | 倒数日 | [countdown](components/countdown.md) | `public/plugins/countdown/**` |

### 阶段 D：Agent

| # | 任务 | 产出 | 依赖 | 写作用域 |
|---|---|---|---|---|
| D1 | 面板三形态 | 浮层 Drawer / 常驻侧栏 / 全屏；对话列表、输入框、工具调用卡片 | A5 | `src/host/agent/panel/**` |
| D2 | 模型接入 | MiMo V2.6 流式 SSE、tool calls、上下文裁剪、错误重试、Key 设置 | A0 | `src/host/agent/model/**` |
| D3 | 工具调度 | 插件工具聚合 + 路由（postMessage + requestId）+ 宿主工具 `web.search`/`web.fetch`/`system.time` | A5、D2 | `src/host/agent/tools/**` |
| D4 | 语音 | MiMo ASR 录音上传、MiMo TTS 流式播放、连续朗读状态持久化 | D2 | `src/host/agent/voice/**` |
| D5 | 人脸 | `@vladmandic/face-api` 注册/识别/防误唤醒，唤醒后开语音 | D1、D4 | `src/host/agent/face/**` |
| D6 | 联网搜索 | Tavily provider、结果摘要、来源链接 | D3 | `src/host/agent/search/**` |

### 阶段 E：收尾

| # | 任务 | 产出 |
|---|---|---|
| E1 | Fluent 动效统一 | 检查所有过渡都走 `motionTokens`，无自定义时长常量 |
| E2 | 自适应验收 | 1440×960、1280×800、1024×768、竖屏、200% DPI 下截图对比 |
| E3 | 打包 | `npx tauri build` 出安装包，验证可安装可启动 |
| E4 | 截图回归 | `scripts/shot.ps1` 支持指定页面/尺寸，输出到 `shots/` |

## 3. 并行与顺序

```
A0 → A1/A2/A3 → A5 → A4
                 ↘
                  B1–B5  ┐
                  C1–C6  ├→ D1–D6 → E1–E4
```

- A 阶段串行（内核，其他都依赖它）。
- B、C 可同时开工：B 用 A5 的桥、C 只用协议文档 + 截图自测。
- D 依赖 A5、D2 可先做（不需要插件），D3 起需要至少 C1/C2/C3 就位验证工具调用。
- 每个 subagent 只改自己的写作用域；跨域改动（如协议）由我统一改。

## 4. 每个 subagent 的输入与交付

输入：

1. [DESIGN.md](DESIGN.md)（公共约定，必读）
2. 自己的组件文档
3. 对应的任务卡（第 2 节表格里的一行）

交付：

- 代码，`npm run build` 通过
- 一张 headless 截图（`shots/<模块>-<尺寸>.png`）
- 一句话说明：做了什么、没做什么、还缺什么

不要求写测试体系（个人项目），但改协议时必须同步 `src/host/bridge/types.ts`。

## 5. 风险

| 风险 | 应对 |
|---|---|
| iframe 键盘焦点交接复杂 | A5 先写最小协议（宿主→插件 focus、插件→宿主 Esc），跑通一个组件再推广 |
| 自适应重排算法边界（列数变少时重叠） | A3 只做“按顺序找第一个空位”，先简单后优化 |
| WebView2 摄像头权限 / face-api 性能 | D5 单独验证，失败则降级为“手动点击语音” |
| MiMo tool calls 不稳定 | D3 加错误回传，模型自己解释；不做自动重试循环 |
| zip 安装路径穿越 | 不搞安全，但要保证解压到 `plugins/<id>/` 内，不污染其他目录 |
| 天气 API Key / 定位失败 | C5 做缓存与降级，缺 Key 时显示引导 |

## 6. 目标目录（完成后）

```
src/
├── host/
│   ├── layout/          # 自适应网格、多页、持久化
│   ├── desktop/         # 桌面层、编辑模式、拖拽
│   ├── plugins/         # 插件管理器
│   ├── bridge/          # postMessage 协议 + types
│   ├── pages/           # 设置 / 复盘 / 插件管理
│   ├── notifications/
│   ├── agent/           # panel / model / tools / voice / face / search
│   └── shell/           # 快捷键、启动、退出
└── main.tsx
public/plugins/          # clock / todo / pomodoro / sedentary / weather / countdown
src-tauri/               # 窗口、系统能力
shots/                   # 截图回归输出
docs/                    # VISION / DESIGN / PLAN / components
```

## 7. 第一件事

A0 工程基线 + 把现有原型代码迁到 `src/host/` 新结构，跑通同样的截图，然后才开始 A1。

## 8. 交互与信息架构重构（2026-10-19 启动）

> 背景：六个插件的交互/信息架构/视觉已逐个定稿，宿主与插件解耦契约见 [PLUGIN-CONTRACT.md](PLUGIN-CONTRACT.md)；
> 汇总见 [DESIGN-ROUND-SUMMARY.md](DESIGN-ROUND-SUMMARY.md)，动效见 [MOTION.md](MOTION.md)，
> 原则参考 [APPLE-HIG.md](reference/APPLE-HIG.md)。本轮不再按旧阶段表，按下面顺序执行。
> **E0/E1/E2/E2b/E3.0/E3.0b 已完成（2026-10-19）**：设置页 `bd6a8b8`、卡片手势 `5f65153`、
> 网络定位（D-16）`05fbafd`、共享插件底座 `d2c3ae8`；接下来 **E3.1–E3.6 六插件（逐个）**。

| # | 任务 | 内容 | 验收 |
|---|---|---|---|
| E0 | 文档定稿 ✅ | 六份 `docs/components/*.md` 按新契约重写（交互/设置/Agent/尺寸/视觉）；DECISIONS 记录卡片交互、设置宿主化、插件解耦、触控优先、页栈层级、动效、颜色政策 | 已完成（2026-10-19），见 [DESIGN-ROUND-SUMMARY.md](DESIGN-ROUND-SUMMARY.md) |
| E1 | 宿主通用设置页 ✅ | manifest `settings` schema → 通用表单（5 种字段）、插件分区动态生成、即时保存 +「保存」羡余按钮 +「恢复默认」；「外观」分组加「编辑桌面布局」「重置布局」；`plugin:request-host-settings` 导航 | 已完成（2026-10-19，commit `bd6a8b8`）；六插件设置全部由 schema 渲染；插件内不再有设置界面 |
| E2 | 卡片手势与反馈 ✅ | SDK `useHostCardGesture`：转发 hover（鼠标/笔）、pointer down/up/cancel、长按（500ms）→ `plugin:request-edit-mode`、长按后吞 click；宿主统一按压/悬停/长按进度视觉；浮层点遮罩=关闭 | 已完成（2026-10-19，commit `5f65153`）；触控长按进编辑稳定；鼠标/触控都有按压反馈；遮罩点击关闭 |
| E2b | 网络定位（ip.cn）✅ | Rust `src-tauri/src/iplocate.rs`：GET `ip.cn/` 解析 `_ticket` → GET `my.ip.cn/json/?ticket=…` → `ip/country/province/city/district/isp`（D-16）；8s 超时，改版/失败返回 null；bridge 新增 `ipLocate` API + `plugin-sdk.js` 方法；Rust 单测覆盖 ticket/JSON/异常 | 已完成（2026-10-19）：`cargo test` 12 项通过；`live_ip_cn_chain -- --ignored` 真机返回澳门；`cargo check` 无新增 warning；`npm run typecheck` / `build` 通过；天气插件在 E3 直接调用 `plugin.ipLocate()` |
| E3.0 | 共享插件底座 ✅ | `_shared` 的 `host.js` / `theme.js` / `typography.js` / `motion.js` / `ui.jsx` / `base.css`；`verify-plugin.mjs` 通用静态 + 独立尺寸 + 宿主冒烟 | 已完成（2026-10-19，commit `d2c3ae8`）；卡片/详情/L2/动效/验收共用一套底座；六个旧插件在 E3.1–E3.6 逐个迁移 |
| E3.0b | 自包含模板插件 ✅ | `templates/plugin-template/`：自带 vendor 的 E3.0 共享底座快照与预构建 React + Fluent `app/app.js`；1×1/2×2/3×2 卡片、L1 两 Tab、L2 编辑示例、settings schema、`template.summary` 工具；README 写复制/改名/构建/删除 | 已完成（2026-10-19）：不在 index、不进 dist、`--all` 不发现；冷复制到 `public/plugins/template/` **不构建**通过 `verify-plugin.mjs`（3 档 + 宿主冒烟）；14 项交互/设置/工具断言通过、console 0 error；截图 `shots/e3-template/`；删除无影响 |
| E3 | 六插件重构 | clock（详情+世界时钟+设置迁移）、countdown（整卡详情、表单保存/取消语义）、sedentary（卡片展示+起来了、详情 7 天）、pomodoro（开始/暂停/重置、详情清空）、todo（卡片仅展示+勾选、详情完整管理+删除）、weather（3×2 逐时、4×2 等宽 7 天、详情紧凑化、自动定位接 ip.cn 网络归属地）；每个插件补 Agent 对等工具 | PLUGIN-CONTRACT 验收清单逐项通过；每插件截图 |
| E4 | 动效 | 按 [MOTION.md](MOTION.md) 实现：hover 1.5%、按下 0.985、长按 500ms 下沉、详情/设置完整 container transform（所有尺寸，内容交叉淡入，关闭 150ms 收回）、插件内容按 Fluent motion；全部 token，尊重 reduced-motion | 1440×960 录屏/截图对比；无自定义时长/曲线 |
| E5 | 视觉收口 | spacing/分组/层级/字号统一（HIG 分组原则 + Fluent 2 token）；天气右端对齐、卡片内边距、详情首屏密度；亮暗两套 | 1440×960 / 1024×768 截图；审计无 P0/P1 |
| E6 | 测试脚手架清理 | 删除 `src/host/{shell,agent,plugins}/demo.html` 三套演示宿主与 `bridge-check`，能力收敛到正式 host 的 dev-only 参数或 `tests/`；去掉演示页的“Agent 模块演示 / scenario / 源码路径”测试横幅与假桌面；Agent「演示模式」移出主设置（只保留高级/URL `?mock=1`） | `npm run build` 后 `dist` 无 demo 页面与演示文案；运行时只有一个 host；产品 UI 无“测试/演示”入口 |
| E7 | 回归与发布 | 更新 `verify-widgets` / `verify-overlays`；做一个最小第三方插件跑 plug-and-play 验收（零宿主改动）；更新 RELEASE/RELEASE-REPORT；截图归档 | 断言全 PASS；契约验收清单全勾 |

> 执行顺序：E0 →（E1/E2 可并行）→ E2b → E3.0 → E3.0b → E3.x（逐插件）→ E4 → E5 → E6 → E7。
> 动效（E4）的具体参数在实现前单独定稿；视觉（E5）不再改交互语义。
