# 发布验证报告（v0.1.0）

> 生成时间：2026-10-19（+08:00）
> 代码提交：`85c3962`（含 `e6e57b7` 插件 React 迁移、`2b79fb9` G2 修复、`85c3962` G2b 收口；最终审计随发布提交；分支 `main`）
> 设计审计：`docs/audit/AUDIT.md`（基线 → G2 → G2b → G2c 复检）
> 复现环境：Windows 10 LTSC 19044.7807，2880×1920 物理屏 = 1440×960 CSS @200%，Node 24.20.0，Rust 1.99.1，Edge 155 headless

## 1. 构建验证

| 项 | 命令 / 产物 | 结果 |
|---|---|---|
| 类型检查 | `npm run typecheck`（`tsc --noEmit`） | ✅ 0 错误 |
| 前端构建 | `npm run build`（tsc + vite build） | ✅ exit 0（chunk 体积提示为已知警告） |
| 插件产物 | `node scripts/build-plugin.mjs --all` | ✅ 六插件 `app/app.js`：clock 481KB / countdown 740KB / pomodoro 787KB / sedentary 742KB / todo 1008KB / weather 924KB；均提交进 git |
| Rust 侧 | `cargo check`（由 Tauri 构建间接验证） | ✅ |
| Tauri 真窗口 | `node node_modules/@tauri-apps/cli/tauri.js build --debug --no-bundle` | ✅ 产出 `src-tauri/target/debug/app.exe` |
| 发布包 | `npx tauri build`（release + 安装包） | ⬜ 未做（需额外打包工具链；本报告验证到 debug 真窗口） |

## 2. 运行时冒烟

### 2.1 Tauri 真窗口（debug）

| 检查项 | 结果 / 证据 |
|---|---|
| 启动无 panic / stderr 为空 | ✅ `STDERR_LEN=0`，stdout 仅一行插件目录 INFO |
| 主窗口存在且可见、标题正确 | ✅ `IsWindowVisible=True`，`MainWindowTitle='Windows Tablet Launcher'`（Win32 实测） |
| WebView2 正常运行 | ✅ 8 个 `msedgewebview2` 子进程，无 EBWebView 锁冲突 |
| 全屏 1440×960（2880×1920 @200%） | ✅ 窗口配置 fullscreen，句柄实测 |
| `Ctrl+Shift+H` 全局热键已注册 | ✅ 运行中由第二个进程 `RegisterHotKey` 探测返回 `ERROR_HOTKEY_ALREADY_REGISTERED (1409)`；自动化会话无法注入系统级按键，隐藏/显示行为在项目早期真窗口冒烟中已验证（visible False→True） |
| `Ctrl+Q` / 退出 | ✅ 命令 `app_exit` 注册于 Rust 侧（人工可验） |
| 插件 6 个通过 `wtsl://` 加载 | ⚠️ 自动化受限：debug 构建从 `public/plugins` 读取插件（Rust 日志可证）；DOM 级验证在 headless dev server 完成（见 2.2），真窗口建议人工扫一眼 |

### 2.2 宿主页面（Edge headless + CDP，dev server）

| 检查项 | 结果 / 证据 |
|---|---|
| 桌面普通模式 1440×960 / 1024×768 / 960×1440 | ✅ 6 个插件 iframe 渲染、无横向溢出、卡片圆角实测 12px、dock 按钮 58/50×40 |
| 编辑模式（长按 / `?edit=1`） | ✅ 顶部工具条 5 按钮 40px、卡片三按钮 41×41、顶部渐变压暗遮罩存在、Esc 退出正常 |
| 插件设置 / 详情浮层 | ✅ 全窗口 Fluent Dialog（880×680），`?view=settings|detail|edit|all` 加载同页 iframe；关闭按钮 40×40、Esc 可关；卡片 iframe 内无被裁切 Dialog/Drawer |
| 设置页 / 复盘页 / 插件管理页 | ✅ 1440×960 与 800×1200 渲染正常；按钮 0 项 <40，Tab 40px |
| Agent 三形态 + 设置 + 搜索态 | ✅ 浮层/侧栏/全屏截图；0 error/0 warning；markdown 含括号链接正常；来源只出现一次 |
| 控制台 | ✅ CDP 实测 0 error / 0 warning（宿主 + 插件浮层） |
| 主题 | ✅ 深色主题全量；亮色主题按 Fluent token 覆盖，未截图（已知限制） |

### 2.3 截图证据（本地 `shots/`，被 `.gitignore` 忽略）

- `final2-desktop-{1440x960,1024x768,960x1440}.png`
- `final2-settings-1440x960.png`、`final2-edit-1440x960.png`、`final2-weather-settings.png`（时钟设置浮层）
- `fix-weather-{2x2,3x2}.png`、`fix-countdown-3x2-demo.png`、`fix-pomodoro-1x1.png`
- 审计截图：`shots/audit/final-*.png`、`shots/audit/g2b-*.png`（设计审计报告引用）

## 3. 设计合规（FLUENT2 / DENSITY / PLUGIN-REACT）

| 项 | 结果 |
|---|---|
| 独立审计最终判定 | **P0=0 / P1=0 / P2=0 / P3=14 → 可发布（设计维度）**（`docs/audit/AUDIT.md` §0 / §9.9） |
| P0 阻断 | 0 |
| P1 应修 | 0（基线 8 项全部关闭） |
| P2 可优化 | **0**（G2c 关闭全部 P2；P3=14 为备注项，见 AUDIT.md §9.9.4） |
| 六个插件实现 | 全部 React 19 + `@fluentui/react-components` v9 + `FluentProvider`，无自绘控件（D-02b） |
| 插件构建 | 统一 `scripts/build-plugin.mjs`，规范见 `docs/PLUGIN-REACT.md` |
| 触控目标 | 按钮类全文 0 项 <40；Fluent 内建表单控件统一 `min-height:40` 命中区 |
| 字号/间距/圆角/阴影/动效 | 插件与宿主样式全部 Fluent token；已知非样式例外见 AUDIT §9 |
| 信息密度 | 按 `docs/DENSITY.md` + D-04 预算，chrome on demand；插件设置/详情走全窗口浮层 |

## 4. 已知限制（发布说明）

- 和风天气需要用户自己的 API Host + Key（`public/secrets.json` 或插件设置）；本次真窗口数据未由自动化验证。
- MiMo 需要 API Key；联网搜索需在 MiMo 控制台开通 Web Search Plugin。
- 人脸识别需要摄像头；headless / 无摄像头环境不可用。
- TTS / ASR 依赖 MiMo 语音接口，受网络与配额影响。
- Windows 10 19044 无 Mica/Acrylic 系统材质，界面用 CSS 近似（项目 token `--wtsl-material-blur`）。
- 亮色主题、Toast 运行时截图未纳入自动化证据（静态 token 审查通过）。
- 320px 级窄窗口不是产品形态：Tauri 窗口已设 `minWidth 960 / minHeight 640`。
- Tauri debug 构建从项目 `public/plugins` 读插件；release 构建会走内置资源（本报告未验证 release 包）。

## 5. 复现命令

```powershell
npm install
npm run build                      # tsc + vite
node scripts/build-plugin.mjs --all # 插件产物（已提交，可跳过）
npm run dev                        # http://localhost:5173
node node_modules/@tauri-apps/cli/tauri.js build --debug --no-bundle
& .\src-tauri\target\debug\app.exe
```

## 6. 结论

代码、构建、设计合规（P0=0 / P1=0 / P2=0）与自动化冒烟通过；发布前剩余动作：
1. 审计员 G2c 最终确认（AUDIT.md §0 更新）；
2. `git push` 到 origin/main（本报告随最终提交）；
3. 如需安装包，执行 release 打包（`npx tauri build`）并在真机安装验证。
