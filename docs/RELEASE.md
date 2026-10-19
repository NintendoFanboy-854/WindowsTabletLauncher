# 发布前检查清单

> 最后一次全量验证用。每项都要有证据（命令输出 / 截图路径 / commit hash）。

## 1. 代码与构建

- [ ] `npm run typecheck` 通过（0 错误）
- [ ] `npm run build` 通过（tsc + vite）
- [ ] `src-tauri` 目录 `cargo check` 通过
- [ ] `npx tauri build --debug --no-bundle` 通过（真窗口可运行）
- [ ] 插件产物与源码一致：`node scripts/build-plugin.mjs --all` 重建并通过 `git status` 确认 `app/app.js` 已提交（N-05）

## 2. 运行时冒烟（Tauri 真窗口）

- [ ] 启动 `src-tauri/target/debug/app.exe`，无 panic / stderr 为空
- [ ] 窗口全屏 2880×1920（1440×960 epx @200%），无边框
- [ ] 六个插件通过 `wtsl://` 加载并渲染（clock / countdown / pomodoro / sedentary / todo / weather）
- [ ] 天气显示真实数据（种子注入的 API Host/Key 生效）
- [ ] Agent 面板可打开（浮层/侧栏/全屏切换），MiMo 对话可发送并流式返回
- [ ] 联网搜索：`web_search` 可用（MiMo 插件已开通），来源 chips 显示
- [ ] `Ctrl+Shift+H` 隐藏/显示窗口（全局热键，隐藏后仍可唤回）
- [ ] `Ctrl+Q` 退出应用
- [ ] 编辑模式：长按进、拖拽换格、改尺寸、删除、设置
- [ ] 插件管理：启用/禁用、重载、zip 安装（拖入）
- [ ] 设置页：开机自启开关、主题切换、退出
- [ ] 复盘页：能聚合插件 stats（todo / pomodoro）
- [ ] 通知：普通 Toast + 强提醒遮罩

## 3. 设计合规（对照 FLUENT2.md / DENSITY.md）

- [ ] `design-auditor` 复检通过：P0 = 0，P1 已修复或明确记录
- [ ] 六个插件全部是 React + Fluent UI React（`src/main.jsx` + `FluentProvider`），无自绘控件（DECISIONS D-02b）
- [ ] 插件设置/详情走宿主全窗口浮层（`?view=settings|detail`），卡片 iframe 内无被裁切的 Dialog/Drawer
- [ ] 三分辨率截图：1440×960 / 1024×768 / 960×1440（深色 + 亮色各一套，亮色验证跟随系统）
- [ ] 普通模式卡片无 chrome；编辑模式才出现操作
- [ ] 每个组件每个尺寸的信息预算内（见 DENSITY.md 第 2 节）
- [ ] 无手写 hex、无非 token 圆角/阴影/间距/字号/动效时长（样式相关；已记录例外：天气图标对比度算法常量、项目材质 token 声明、内容图形尺寸 clamp）
- [ ] 加载态符合 1s/3s 阈值；文案无句号、短句

## 4. 打包与发布

- [ ] `npx tauri build`（release）产出安装包，路径记录
- [ ] 安装包可在当前机器安装、启动（或明确记录未验证项）
- [ ] `git status` 干净；`secrets.json` 未被跟踪
- [ ] commit 信息清晰；`git push` 到 origin/main
- [ ] 打 tag（可选）：`v0.1.0`

## 5. 文档齐套

- [ ] docs/VISION.md（需求）
- [ ] docs/FLUENT2.md（Fluent 2 设计规范落地）
- [ ] docs/DENSITY.md（信息密度）
- [ ] docs/DESIGN.md（工程约定）
- [ ] docs/PLAN.md（开发计划）
- [ ] docs/components/*.md（6 插件 + Agent）
- [ ] docs/audit/AUDIT.md（设计审计报告）

## 6. 已知限制（发布说明里写明）

- 和风天气：需要用户自己的 API Host + Key（`public/secrets.json` 或设置页）
- MiMo：需要 API Key；联网搜索需要在 MiMo 控制台开通 Web Search Plugin
- 人脸识别：需要摄像头；headless/无摄像头环境不可用
- TTS/ASR：依赖 MiMo 语音接口，受网络与配额影响
- 本地运行：Windows 10 19044 无 Mica/Acrylic 系统材质，界面用 CSS 近似
