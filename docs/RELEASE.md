# 发布前检查清单（v0.2.0）

> 最后一次全量验证：2026-10-20（E7）。每项都有证据（命令输出 / 截图路径 / commit hash）。
> 证据根：`shots/e7/`；总报告：`docs/RELEASE-REPORT.md`、`shots/e7/REPORT.md`。
> 勾选口径：`[x]` = 本阶段实际执行并通过；`[ ]` = 未执行/未验证，原因写在行内。

## 1. 代码与构建

- [x] `npm run typecheck` 通过（0 错误）— `shots/e7/logs/typecheck.log`
- [x] `npm run build` 通过（tsc + vite；仅 chunk >500KB 已知警告）— `shots/e7/logs/build.log`
- [x] `src-tauri` 目录 `cargo check` 通过（1m40s，app v0.2.0）— `shots/e7/logs/cargo-check.log`
- [ ] `npx tauri build --debug --no-bundle`（真窗口）— **本阶段未重跑**，继承 v0.1.0 真窗口结论（见 `docs/RELEASE-REPORT.md` §7）
- [x] 插件产物与源码一致：`node scripts/build-plugin.mjs --all` 重建后 `git diff -- public/plugins` 为空 — `shots/e7/logs/build-plugin-all.log`
- [x] 小部件 UI 断言通过：`node scripts/verify-widgets.mjs`（DENSITY §2.1，25/25；亮色同 25/25；1 项已接受 P2 记账，见报告）
- [x] 插件详情浮层 UI 断言通过：`node scripts/verify-overlays.mjs`（六插件 `?view=detail`，834×582；暗 6/6、亮 6/6）— `shots/e7/logs/verify-overlays-*.log`
- [x] 宿主内浮层联调：`node scripts/shot-host-overlays.mjs`（点卡 → detail 浮层 880×680；暗 6/6、亮 6/6，截图 `shots/e7/host/`）
- [x] 亮暗两套的宿主整屏 + 插件代表尺寸截图：`shots/e7/desktop/`（1440×960 / 1024×768 × 暗/亮）、`shots/e7/cards/`（1440 网格下 25 档 × 暗/亮）
- [x] 插件验收：六插件 `node scripts/verify-plugin.mjs <id>` 全 PASS（尺寸 + 宿主点卡冒烟 + console 0）— `shots/e7/logs/verify-plugin-final.log`
- [x] Plug-and-play：最小第三方插件零宿主改动 19/19 PASS（临时 `ping` 已删除）— `shots/e7/plug-and-play/`；另有正式脚本 `scripts/verify-plug-and-play.mjs` **12/12 PASS**（冷复制模板 + index 登记 → 卡片/详情/设置/清理）— `shots/pnp/`
- [x] 宿主 E2E：1440×960 / 1024×768 × 暗/亮 各 53/53 PASS；页面专项 12/12 — `shots/e7/logs/desktop-e2e-*.log`、`pages-e2e.log`

## 2. 运行时冒烟（Tauri 真窗口）

> **2026-10-20 补充重跑（v0.2.0 debug）**：`tauri build --debug --no-bundle` 产出 `src-tauri/target/debug/app.exe`（22.7 MB），真实启动后窗口标题正确、可见、DPI-aware 全屏 `2880×1920` 物理像素，Rust 日志确认插件目录，截图中六张卡片真实渲染。证据：`shots/e7/tauri/`（`app-window.png`、`verify.json`、stdout/stderr）。
> 窗口由人工关闭；长按/拖拽/浮层/热键等交互未在真窗口内自动化驱动，交互结论仍以 headless 套件为准。安装包构建见 §4。

- [x] 启动 `src-tauri/target/debug/app.exe`，无 panic、正常启动 — ✅ 2026-10-20 补充（stderr 仅关闭时 WebView2 teardown 一条无害告警）
- [x] 窗口全屏 2880×1920（1440×960 epx @200%），无边框 — ✅ 2026-10-20 补充（`GetWindowRect` DPI-aware = 0,0,2880,1920）
- [x] 六个插件通过 Tauri 加载并渲染 — ✅ 2026-10-20 补充（Rust 插件目录日志 + 全窗口截图六卡真实内容）
- [ ] 天气显示真实数据（种子注入的 API Host/Key 生效）— 未验证（需真实 Key）
- [ ] Agent 面板可打开（浮层/侧栏/全屏切换），MiMo 对话可发送并流式返回 — 未验证（需 Key；只验证过 `?mock=1`）
- [ ] 联网搜索：`web_search` 可用，来源 chips 显示 — 未验证（需 MiMo 控制台开通）
- [ ] `Ctrl+Shift+H` 隐藏/显示窗口 — 未验证（自动化无法注入系统级按键）
- [ ] `Ctrl+Q` 退出应用 — 未验证（自动化无法注入系统级按键）
- [ ] 编辑模式：长按进、拖拽换格、改尺寸、删除、设置 — **浏览器 E2E 通过**（`desktop-e2e` C1–C6），Tauri 真窗口未驱动
- [ ] 插件管理：启用/禁用、重载、zip 安装（拖入）— 启用/禁用与重扫在浏览器通过（`pages-e2e` P1–P5）；zip 安装仅 Tauri 可用、未验证
- [ ] 设置页：开机自启开关、主题切换、退出 — 主题切换通过；开机自启/退出仅 Tauri、未验证
- [ ] 复盘页：能聚合插件 stats（todo / pomodoro）— **浏览器通过**（`pages-e2e` R1–R3）
- [ ] 通知：普通 Toast + 强提醒遮罩 — Toast 通过（设置保存触发）；强提醒需 Tauri 空闲检测、未验证

## 3. 设计合规（对照 FLUENT2.md / DENSITY.md）

- [x] 设计审计结论：发布时点 P0 = 0、P1 = 0（E5 收口；E7 回归期间发现并修复 1 项 P1「插件启用/禁用无效」，复验通过）— `shots/e5/REPORT.md`、`docs/RELEASE-REPORT.md` §6
- [x] 六个插件全部是 React + Fluent UI React（`FluentProvider`），无自绘控件（DECISIONS D-02b）— `verify-plugin` 静态检查
- [x] 设置只在宿主设置页（manifest `settings` schema）渲染，插件内无设置视图；详情/设置均为宿主全窗口浮层（`?view=detail`）— 原“`?view=settings|detail`”条目已过时并删除
- [x] 双分辨率截图：1440×960 / 1024×768（深色 + 亮色各一套）— `shots/e7/desktop/`
- [x] 普通模式卡片无 chrome；编辑模式才出现操作 — E2E A4 / C1
- [x] 每个组件每个尺寸的信息预算内 — `verify-widgets` 25/25（weather 2×2 为已接受 P2 记账）
- [x] 无手写 hex、无非 token 圆角/阴影/间距/字号/动效时长（样式相关；例外：天气图标对比度常量、项目材质 token、内容图形尺寸 clamp）— `verify-plugin` 静态检查
- [x] 加载态符合 1s/3s 阈值；文案无句号、短句 — E5 复核 + 本轮未改文案
- [x] 详情浮层：视口 834×582、根 padding 24、控件根 ≥40、最小字号 ≥12、无横向溢出、console 0 — 六插件 × 暗/亮
- [x] 动效：打开 container transform（首帧从卡片缩放）、末帧 880×680、关闭 ~150ms 收回、焦点归还 — E2E B1–B6

## 4. 打包与发布

- [x] `npx tauri build`（release）产出安装包，路径记录 — ✅ 2026-10-20 产出 MSI 9.43 MiB / NSIS 8.32 MiB（`src-tauri/target/release/bundle/{msi,nsis}/`，校验见 RELEASE-REPORT §2.3）
- [ ] 安装包可在当前机器安装、启动（或明确记录未验证项）— 未做安装验证（避免自动修改系统；由用户手动双击安装）
- [x] `git status` 干净（E7 与后续补充变更均已提交；`public/plugins/**`、`templates/**` 无意外 diff；`secrets.json` 未跟踪）
- [x] commit 信息清晰；`git push` 到 origin/main — 已 push（本地 HEAD 与 origin/main 一致）
- [x] 打 tag：`v0.2.0` — 已创建并推送

## 5. 文档齐套

- [x] docs/VISION.md（需求）
- [x] docs/FLUENT2.md（Fluent 2 设计规范落地）
- [x] docs/DENSITY.md（信息密度）
- [x] docs/DESIGN.md（工程约定）
- [x] docs/PLAN.md（开发计划，E0–E7 全部 ✅）
- [x] docs/components/*.md（6 插件 + Agent）
- [x] docs/PLUGIN-CONTRACT.md（契约；§7 验收清单已勾选，§8 已人工验收 2026-10-20）
- [x] docs/RELEASE.md（本清单）
- [x] docs/RELEASE-REPORT.md（v0.2.0 本阶段报告）
- [x] shots/e7/REPORT.md（E7 回归报告与断言矩阵）
- [x] docs/DECISIONS.md、docs/audit/AUDIT.md、docs/audit2/*（历史审计，保留不改）

## 6. 已知限制（发布说明里写明）

- 和风天气：需要用户自己的 API Host + Key（`public/secrets.json` 或设置页）
- MiMo：需要 API Key；联网搜索需要在 MiMo 控制台开通 Web Search Plugin
- 人脸识别：需要摄像头；headless/无摄像头环境不可用
- TTS/ASR：依赖 MiMo 语音接口，受网络与配额影响
- 本地运行：Windows 10 19044 无 Mica/Acrylic 系统材质，界面用 CSS 近似
- Tauri 真窗口：0.2.0 debug 已重跑（窗口/六插件渲染通过）；安装包与真窗口内交互未完整验证
- 浏览器预览：zip 安装/删除、开机自启、系统定位、空闲检测不可用
- 编辑模式删除卡片是会话级：reload 后按插件目录重建；持久移除用插件管理页启用/禁用
