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
| A3 | 布局引擎 | 自适应列数（8/6/4）、正方形单元格、行数推导、多页、布局持久化、列数变化重排 | A0 | `src/host/layout/**` |
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
