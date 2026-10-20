# 发布验证报告（v0.2.2）

> 生成时间：2026-10-20（+08:00）
> 代码提交：`fb5ab5f`（v0.2.0 发布收尾）；v0.2.1 安装包热修见 §10；v0.2.2 交互/定位热修见 §11（实现提交 `348587c`）
> 分支：`main`；版本：`0.2.2`（`package.json` / `src-tauri/tauri.conf.json` / `src-tauri/Cargo.toml` / `Cargo.lock`）
> 复现环境：Windows 10 LTSC 19044.7807，2880×1920 物理屏 = 1440×960 CSS @200%，Node 24.20.0，Rust 1.99.1，Edge headless（CDP）
> 证据根：`shots/e7/`、`shots/v022-final/`（本报告所有路径相对仓库根）；逐项矩阵见 `shots/e7/REPORT.md`、`shots/v022-final/REPORT.md`

## 0. 结论

**可发布**：E0–E7 全部完成；工程门禁、六个插件的脚本回归、宿主 E2E、plug-and-play 验收全部通过；发布时点 **P0 = 0、P1 = 0**（E7 回归期间发现 1 项 P1，已修复并复验，见 §6.1），P2 债务均为已记录、不阻塞交付的已知项。Tauri debug 真窗口已重跑（§2.2），release 安装包已产出 MSI + NSIS（§2.3）。
**v0.2.1 热修（2026-10-20）**：v0.2.0 安装包首次运行桌面卡在「正在加载桌面」——内置插件种子逻辑把构建期压缩字节原样写盘 + 忽略 AssetKey 前导 `/`，导致插件 manifest 全部非法、插件列表为空。已修复并用真实 release exe + CDP 复验 6 卡正常（§10）。
**v0.2.2 热修（2026-10-20）**：修复用户实测 4 个问题——天气定位成功不应用到 widget、尺寸菜单失败项仍打勾、无添加组件入口、删除后插件页仍只显示已启用。独立回归 A/B/C/C.6 全 PASS（0 P0/P1），真实 release exe + WebView2 CDP 复验见 §11。

## 1. 阶段与关键 commit

| 阶段 | 内容 | commit |
|---|---|---|
| E0 | 六份组件文档按新契约重写、DECISIONS 定稿、契约/HIG 参考 | `0cf44fc`、`908ac6b`、`016a804`、`8370e4e`、`509eb53` |
| E1 | 宿主通用设置页（manifest schema 驱动、即时保存、恢复默认、导航） | `bd6a8b8` |
| E2 | 卡片手势与反馈（SDK 转发 hover/press/长按、宿主视觉） | `5f65153` |
| E2b | ip.cn 网络归属地（D-16）Rust 后端 + `ipLocate` 桥接 | `05fbafd` |
| E3.0 | 共享插件底座 `_shared`（UI/主题/动效/字号） | `d2c3ae8` |
| E3.0b | 自包含模板插件（不进 index/dist） | `27ef06c` |
| E3 | 六插件重构（clock/countdown/pomodoro/sedentary/todo/weather）+ 工具对等 | `15bb70d`、`2d7fed2`、`9a14a0b`、`286f4cf`、`67faf87`、`03be1e6`、`c71ff1f` |
| E3 修复 | B5 设置分区串写 | `b970287` |
| E4 | 浮层完整 container transform 与动效收口 | `4a6ac2a` |
| E4b | P1 布局 reload 覆盖 / reload 后尺寸主题不同步 / P2 同会话换色 | `8c43d0b`、`0bca3ab`、`a467830` |
| E5 | 视觉收口（P0/P1 清零，P2 清单） | `f568c86`、`c305374` |
| E6 | 测试脚手架清理与 cdp 生命周期加固 | `14fd1e7`、`1e2b44f` |
| E7 | 回归与发布（本轮） | `66c2330` |

## 2. 构建与工程门禁

| 项 | 命令 | 结果 | 证据 |
|---|---|---|---|
| 类型检查 | `npm run typecheck` | ✅ 0 错误，exit 0 | `shots/e7/logs/typecheck.log` |
| 前端构建 | `npm run build` | ✅ exit 0（5.54s；仅 chunk >500KB 已知警告） | `shots/e7/logs/build.log` |
| 插件产物 | `node scripts/build-plugin.mjs --all` | ✅ 六插件全部「打包完成」；重建后 `git diff -- public/plugins` 为空 | `shots/e7/logs/build-plugin-all.log` |
| Rust 侧 | `cargo check`（`src-tauri`） | ✅ exit 0（1m40s，版本 0.2.0） | `shots/e7/logs/cargo-check.log` |
| `dist` 结构 | 构建后静态检查 | ✅ 7 个 HTML = 1 个 host entry（`dist/index.html` → 单脚本 `assets/index-CvN8saV_.js`）+ 6 个插件 standalone；无 `demo.html` / `bridge-check.html` | 见 §2.1 |
| host bundle 演示文案 | 对 `dist/assets/index-*.js` 原文检索 | ✅ `演示/测试/demo/scenario/bridge-check/源码路径/浏览器演示模式` 均为 0 | 见 §2.1 |
| Tauri 真窗口 | `tauri build --debug --no-bundle` + 真实启动 | ✅ **2026-10-20 补充重跑**：v0.2.0 debug exe 构建并启动，窗口/六插件渲染见 §2.2 | `shots/e7/tauri/` |
| 安装包 | `npx tauri build`（release） | ✅ 2026-10-20 产出 MSI + NSIS（§2.3）；未做安装验证 | `src-tauri/target/release/bundle/` |

### 2.1 dist 审计明细

- HTML：`dist/index.html` + `dist/plugins/{clock,countdown,pomodoro,sedentary,todo,weather}/index.html`；无 demo 宿主。
- host bundle `dist/assets/index-CvN8saV_.js`（1,122,797 B）：演示类关键词全部 0。
- `dist/plugins/todo/js/demo.js` 与插件 bundle 内的 26 处「演示」属插件 `?demo=1` 开发数据（E6 已记录、按“不改 `public/plugins/**`”保留），不在 host 入口。
- `dist` 总大小 14.0 MB。

### 2.2 Tauri debug 真窗口冒烟（2026-10-20 补充重跑）

在 E7 报告之后补做（v0.2.0 实际二进制，而非浏览器模拟）：

| 项 | 结果 / 证据 |
|---|---|
| 构建 | `cargo build --release`/debug 等价路径；`src-tauri/target/debug/app.exe` v0.2.0，22,730,240 B；`cargo build` 日志 `Finished dev profile` |
| 启动 | 真实窗口启动成功，进程存活、无 panic |
| 窗口 | 标题 `Windows Tablet Launcher`；`IsWindowVisible=True`；DPI-aware `GetWindowRect` = `(0,0,2880,1920)` 全屏无边框 |
| 插件加载 | Rust 日志 `插件目录: …\public\plugins`；窗口截图可见六张卡片真实渲染（clock 13:01:36、countdown 空态、sedentary「0 分钟 / 我起来了」+ 久坐 Toast、pomodoro 25:00、todo「今日 · 0」、weather「还没有城市」） |
| stderr | 仅关闭时 WebView2 teardown 一条 `Failed to unregister class Chrome_WidgetWin_0 (1412)`（已知无害，退出阶段） |
| 截图 | `shots/e7/tauri/app-window.png`（2880×1920 全窗口）；日志 `shots/e7/tauri/{app-stdout.log,app-stderr.log,verify.json}` |
| 限制 | 真窗口内的长按/拖拽/浮层/热键等交互未自动化驱动；窗口由人工关闭，未做完整交互回归（交互回归仍以 §3 的 headless 套件为准） |

### 2.3 发布安装包（2026-10-20 补充）

`npx tauri build` exit 0，`Finished release profile [optimized] in 6m 33s`，产出两个安装包（未安装验证，避免自动修改系统）：

| 类型 | 产物 | 大小 | SHA-256 前 16 位 |
|---|---|---|---|
| MSI | `src-tauri/target/release/bundle/msi/Windows Tablet Launcher_0.2.0_x64_en-US.msi` | 9.43 MiB | `190554C2DDC9FDC2` |
| NSIS | `src-tauri/target/release/bundle/nsis/Windows Tablet Launcher_0.2.0_x64-setup.exe` | 8.32 MiB | `267182BB8F3121B1` |

构建过程由 Tauri 自动下载并校验 WiX 3.14.1 与 NSIS 3.13 + nsis_tauri_utils；release `app.exe`（16,735,232 B）同时产出。
安装/卸载验证留给真机人工执行（会写注册表与安装目录），本报告不代做。

## 2.4 plug-and-play 自动化脚本（2026-10-20 补充）

`scripts/verify-plug-and-play.mjs` 已落地并跑通 **12/12 PASS**：冷复制 `templates/plugin-template` → 只改 manifest id/name → 仅追加 `index.json` 条目 → 正式宿主出现第 7 张卡、点卡开 detail、Esc 关闭、设置页按 schema 渲染 3 字段、console 0 → 删除目录与 index 后恢复 6 卡、无残留。截图 `shots/pnp/`。
（Agent 工具与复盘统计块仍依赖插件声明 `*.stats`，模板无该工具，故以 E7 人工 ping fixture 证据为准。）

## 3. 脚本回归（全量）

| 脚本 | 范围 | 结果 | 证据 |
|---|---|---|---|
| `verify-plugin.mjs` | 六插件 × 全尺寸 + 宿主点卡冒烟 | ✅ 6/6 PASS（见 §3.1） | `shots/e7/logs/verify-plugin-final.log` |
| `verify-widgets.mjs` | 六插件 × 25 档尺寸，暗色 | ✅ 25/25 PASS（1 项已接受 P2 记账） | `shots/e7/logs/verify-widgets-final-dark.log` |
| `verify-widgets.mjs --scheme light` | 同上，亮色 | ✅ 25/25 PASS | `shots/e7/logs/verify-widgets-final-light.log` |
| `verify-overlays.mjs` | 六插件 `?view=detail`（834×582）暗色 | ✅ 6/6 PASS | `shots/e7/logs/verify-overlays-dark.log`、`overlays-dark.json` |
| `verify-overlays.mjs --scheme light` | 同上，亮色 | ✅ 6/6 PASS | `shots/e7/logs/verify-overlays-light.log`、`overlays-light.json` |
| `shot-host-overlays.mjs` | 宿主内点卡 → detail 浮层（880×680）暗色 | ✅ 6/6 PASS | `shots/e7/logs/shot-host-overlays-dark.log` |
| `shot-host-overlays.mjs --scheme light` | 同上，亮色 | ✅ 6/6 PASS | `shots/e7/logs/shot-host-overlays-light.log` |
| `verify-plug-and-play.mjs` | 冷复制模板 + 仅登记 index → 正式宿主卡片/详情/设置/清理 | ✅ 12/12 PASS（2026-10-20 补充，§2.4） | `shots/pnp/` |

### 3.1 六个插件

```
clock      1x1/2x1/3x2 + 宿主冒烟 PASS
countdown  1x1/2x1/2x2/3x2 + 宿主冒烟 PASS
pomodoro   1x1/2x1/2x2/3x2 + 宿主冒烟 PASS
sedentary  1x1/2x1/2x2/3x2 + 宿主冒烟 PASS
todo       1x1/2x2/3x2/3x3/4x2 + 宿主冒烟 PASS
weather    1x1/2x1/2x2/3x2/4x2 + 宿主冒烟 PASS
```

每个插件均覆盖：manifest 静态检查（无禁用字阶/clamp/10-11px/自定义 hex）、按真实 iframe 尺寸的渲染与最小字号、点卡开 detail 浮层、X 与 Esc 关闭、console 0 error。运行结束无残留 Edge 进程与 `%TEMP%\wtsl-*` profile。

### 3.2 断言变更（E7 修正的过时断言）

1. **`verify-overlays.mjs` 重写**：原 12 个 `?view=settings|edit|all` 用例在 E1 后已不存在（设置只在宿主设置页，countdown 编辑改为详情内 L2）。改为六插件 detail 矩阵，视口 834×582，断言：详情骨架存在、视口精确、根内边距 24（`data-detail-header/toolbar/tabs` 的 computed padding-inline，对应 `spacingHorizontalXXL`）、无页面级横向溢出、可交互控件**根节点**（`.fui-*` 根，不是内部 input）宽高 ≥40、可见文字 ≥12px、console error 0。未放宽任何阈值。
2. **`shot-host-overlays.mjs` 重写**：旧版直接向卡片 iframe 转发 `host:open-settings` 打开已删除的设置视图。改为真实用户路径「点卡 → 宿主 Fluent Dialog 加载 `?view=detail` → 截图 → Esc → 焦点归还」，并断言浮层 880×680、iframe 为 detail、文字就绪；暗/亮各 6 例。
3. **`verify-widgets.mjs`**：
   - weather 用例改为 URL `?mock=1`（E1 起 `settings.mock` 不在 schema，只写 localStorage 会落到“缺 API Key”引导，量到 12–16px 假阴性）。
   - todo 按 `docs/components/todo.md` 的纯列表卡口径验收（头部「今日 · N」12 fg3、行标题 16、行高 ≥44、行数 ≤ D-04 预算 4/5/8/5），替代 DENSITY §2.1 的「列表头主层 ≥28px + 主次比 ≥1.5」——两者文档冲突，见 §6 P2-3。
   - weather 2×2 的空白带/内容带保留 DENSITY 断言，但按 E5-P2-01 的已接受结论登记放宽护栏（空带 ≤30%、内容带 ≥40%，实测 26.8% / 42.7%），输出 `PASS*` 并打印理由；超护栏即 FAIL。
   - Edge 生命周期改用 `scripts/lib/cdp.mjs`（E6 加固版）。旧版 4 次运行各留 1 棵 Edge 进程树（本轮已按 root PID 清理，最终 0）。

## 4. 宿主 E2E（最终代码）

脚本：临时 CDP 脚本（`%TEMP%\wtsl-e7\desktop-e2e.mjs`，跑完删除），每套 fresh profile。四套视口 × 亮暗各 **53/53 PASS**：

| 视口 × 主题 | 结果 | 证据 |
|---|---|---|
| 1440×960 dark | ✅ 53/53 | `shots/e7/logs/desktop-e2e-1440x960-dark.log` |
| 1440×960 light | ✅ 53/53 | `shots/e7/logs/desktop-e2e-1440x960-light.log` |
| 1024×768 dark | ✅ 53/53 | `shots/e7/logs/desktop-e2e-1024x768-dark.log` |
| 1024×768 light | ✅ 53/53 | `shots/e7/logs/desktop-e2e-1024x768-light.log` |

页面专项（临时脚本 `pages-e2e.mjs`）：插件页 / 复盘页 / Agent mock **12/12 PASS**（`shots/e7/logs/pages-e2e.log`）。

关键实测：

- 桌面：六卡全渲染、无横向溢出（scrollWidth = clientWidth）、console 0 error、普通模式无编辑 chrome。
- 浮层：`data-overlay-mode=container`；首帧缩放 0.386/0.241（从卡片展开）、末帧 880×680（1024×768 下 880×553）；关闭 274–297ms 走 `exit/retract`；焦点归还来源卡片；打开/关闭布局与卡片 rect 不变。
- 编辑：长按进编辑；clock 2×1→1×1、weather 3×2→2×2；拖拽换位（1440 拖 weather 至 (5,1)，1024 无 2×2 空位时拖 clock 至 (1,0)）；删除 sedentary（会话内）；Esc /「完成」退出。
- reload：未删除五组件布局签名一致；clock 1×1、weather 2×2 与拖拽位置保留；iframe 内层 `data-clock-size=1x1` / `data-size=2x2` 同步；console 0。
- 重置布局：恢复默认六卡摆放（与基线签名逐字一致）。
- 设置：六插件分区按 schema 渲染 3/2/9/6/4/8 项；clock 改值即时写 `plugin.clock.settings`；「保存」Toast「已保存」；「恢复默认」写回 schema 默认值。
- 同会话换主题（不 reload）：宿主立即生效；六插件 iframe **365–398ms** 跟随（≤1s）；clock 前景 `rgb(255,255,255)` ↔ `rgb(0,0,0)`。
- 插件页：六插件列出、启用/禁用偏好写入并在桌面生效（P1 修复项，见 §6）、console 0。
- 复盘页：todo/pomodoro 统计块 + 热力图 + 昨日小结，console 0。
- Agent（`?mock=1`）：打开、发消息、工具卡片 `system.time` 完成；设置对话框无「演示模式」；console 0。

## 5. Plug-and-play 验收（契约 §8，零宿主改动）

最小第三方插件 `ping`（复制 `templates/plugin-template`，改名 + `ping.summary` / `ping.stats`），只把 `"ping"` 加入 `public/plugins/index.json` 并 `node scripts/build-plugin.mjs ping`，未改任何 `src/host/**`。**19/19 PASS**：

| # | 断言 | 证据 |
|---|---|---|
| 1–2 | 桌面出现 ping 卡并渲染；无横向溢出 | `shots/e7/plug-and-play/1-desktop-with-ping.png` |
| 3 | 点卡进入 `?view=detail` 浮层（文字就绪） | `2-detail.png` |
| 4 | 详情「设置…」收起浮层并导航到 ping 分区 | `3-settings-ping.png` |
| 5–7 | 设置页自动分区、boolean/enum/number 按 schema 渲染、改值即时写 localStorage、「保存」Toast | `3-settings-ping.png` |
| 8–11 | 长按进编辑；2×2→1×1；拖拽换位；删除；其他六卡布局不变 | `4-edit.png` |
| 12 | 重置布局后 ping 重新出现 | — |
| 13–14 | Agent（`?mock=1`）工具 `system.time` 可调用；Agent 设置无演示模式 | `5-agent-mock.png` |
| 15 | 复盘页出现「Ping 测试」统计块（`ping.stats` 实际返回 `completed=3`） | `6-review-ping.png` |
| 16–19 | 删除插件目录与 index 项后桌面恢复六卡、layout 无残留、console 0 | `7-desktop-restored.png` |

证据 JSON：`shots/e7/plug-and-play/evidence.json`；fixture 源码留档：`shots/e7/plug-and-play/fixture-src/`（仅证据目录，`shots/` 被 gitignore）。验收后 `public/plugins/ping/` 与 index 项已删除，`public/plugins/index.json` 内容与 HEAD 一致。

## 6. 设计合规与问题清单

### 6.1 P0 / P1

- **P0 = 0。**
- **P1 = 0（本轮发现并修复 1 项）**：
  - **E7-P1-01 插件启用/禁用开关无效**：`PluginsPage` 写入 `wtsl.plugins.preferences`，但桌面层（`Desktop.tsx`）从未读取，禁用后卡片仍显示，页面文案「桌面下次扫描后不再显示」不成立。
  - 修复（最小）：`Desktop` 订阅 `usePluginPreferences()`，渲染时过滤被禁用插件（**不删布局条目**，重新启用回到原位）；焦点/键盘导航/后台 iframe 同步过滤。验证：`pages-e2e` P2–P4 —— 禁用后桌面 5 卡、重新启用 6 卡。
  - 变更文件：`src/host/desktop/Desktop.tsx`（1 文件，无 UI/交互语义变化）。

### 6.2 P2 / 文档冲突（不阻塞交付）

1. **weather 2×2 空带**：实测 26.8% > DENSITY 22%，E5-P2-01 已记录为“需产品决定加/减内容”；E7 在脚本中登记为已接受 P2（护栏 30% / 内容带 40%），不改产品。
2. **clock L1 数据少时偏空、pomodoro 3×2 右列、列表卡空底、亮色渐隐弱**：沿用 `shots/e5/REPORT.md` §4 的 P2 清单。
3. **DENSITY §2.1 与 `docs/components/todo.md` 冲突（已收口）**：DENSITY 已补「纯列表卡（todo）按组件文档：12 fg3 分组标题 + 16 行标题，不套用列表头主层 ≥28」的口径；`verify-widgets` 对 todo 使用行预算/行高断言，两者一致。
4. **编辑模式删除卡片是会话级（已定稿）**：reload 后按插件目录重建（`reconcileLayout` 补回）；持久移除路径是插件管理页启用/禁用（E7 P1 修复后真正生效，且不删布局条目）。见 `DECISIONS.md` D-18。
5. **`docs/DECISIONS.md` D-11（已更新）**：E1 起插件只有 `?view=detail`；D-11 宽度口径（表单 720 / 详情列表满宽 834）仍有效。
6. **`verify-overlays.mjs` / `shot-host-overlays.mjs` 的旧截图目录**（`shots/rewrite/overlays`）不再写入；新证据在 `shots/e7/overlays`、`shots/e7/host`。

### 6.3 设计合规复核

- 六插件均为 React + Fluent UI React（无自绘控件）；静态检查无 `lineHeight:1`、clamp、10/11px、自定义 hex（`verify-plugin` 静态段）。
- 触控目标：详情可交互控件根 ≥40（6/6 × 暗/亮）；卡片编辑按钮 40×40；设置行 48、控件 40。
- 最小字号：六插件 detail 全部 ≥12px（`overlays-*.json`）。
- 亮/暗两套、1440×960 / 1024×768 均有桌面、浮层、设置、页面截图（`shots/e7/`）。
- 未在本轮重新执行 `design-auditor`；P0/P1 结论来自 E5 收口 + E7 回归，未发现新的 P0/P1（除已修 P1）。

## 7. 已知限制与未验证项

- **Tauri 真窗口已重跑（debug）**：v0.2.0 debug exe 构建并启动，窗口/六插件渲染已验证（§2.2）；**release 安装包**已产出 MSI + NSIS（§2.3），未做安装/卸载验证（需人工双击安装，避免自动改系统）。真窗口内的长按/拖拽/浮层/热键/退出等交互未自动化驱动，交互结论仍以 headless 套件（§3）为准。
- **物理 200% DPI**：真窗口 `GetWindowRect` 为 2880×1920 物理像素（200% 全屏无边框）已确认；但像素级排版审计仍以 headless CSS 1440×960 / 1024×768 截图为准，未做 200% 缩放下的逐像素对比。
- **浏览器环境无 Tauri 能力**：插件 zip 安装/删除、开机自启、系统定位、空闲检测、阻止息屏只在 Tauri 运行时可用（插件页已明确提示）。
- **和风天气**：需用户自己的 API Host + Key；无 Key 时卡片显示配置引导（E7 用 `?mock=1` 演示数据验收）。
- **MiMo / 语音 / 人脸 / 联网搜索**：需 API Key、麦克风、摄像头；E7 只验证 `?mock=1` 对话与工具调用，真实模型链路沿用 v0.1.0 结论（未重跑）。
- **严格 404**：已删除的旧 demo URL 在 Vite dev 下仍由 SPA fallback 返回官方 host（200，无 demo 内容）；E6 已记录，本阶段未改（需重启 dev server，超出约束）。
- **`verify-widgets` 的 weather 2×2 为记账式 PASS***，不是无条件通过（护栏数值与理由见 §3.2）。

## 8. 运行方式

```powershell
npm install
npm run dev                        # http://localhost:5173
npm run typecheck
npm run build
node scripts/build-plugin.mjs --all
node scripts/verify-plugin.mjs clock   # 六插件逐个
node scripts/verify-widgets.mjs --screenshots
node scripts/verify-overlays.mjs --scheme dark --screenshots
node scripts/verify-overlays.mjs --scheme light
node scripts/shot-host-overlays.mjs --scheme dark
node scripts/verify-plug-and-play.mjs
npm run tauri dev                  # Tauri 真窗口（debug）
npx tauri build                    # release + 安装包
```

## 9. 发布前剩余动作

1. E7 工作树 diff 已由 Lead 审查、`typecheck` + `build` 门禁复跑后提交为 `66c2330`；后续 `899f885`（hash 回填）、`66e5021`（久坐空态文案）已提交；
2. ✅ `git push origin main` 已完成（远端 HEAD 与本地一致）；
3. ✅ Tauri debug 真窗口已重跑（§2.2）；release 安装包 MSI + NSIS 已产出（§2.3），安装验证待人工；
4. ✅ `scripts/verify-plug-and-play.mjs` 已落地并 12/12 PASS（§2.4）。

## 10. v0.2.1 安装包热修（2026-10-20）

### 10.1 现象与根因

安装 v0.2.0（MSI/NSIS）后启动，桌面永久显示「正在加载桌面…」，控制台无报错。

- **根因 A（前导 `/`）**：Tauri 的 `asset_resolver().iter()` 返回的 `AssetKey` 统一带前导 `/`（`tauri-utils/assets.rs` 的 `From<Path>` 实现），`strip_prefix("plugins/")` 永远不匹配 → 种子写出 0 个文件。
- **根因 B（压缩字节）**：即使匹配上，`iter()` 返回的是构建期 **brotli 压缩后的字节**；直接 `fs::write` 得到的 `manifest.json` 不是合法 JSON → 6 个插件全部解析失败（`manifest.json 不是合法 JSON: expected value at line 1 column 1`），插件列表为空，`reconcileLayout` 在空目录下不产出布局，桌面就卡在 loading。

### 10.2 修复（`src-tauri/src/plugins.rs`）

- `iter()` 只用来取 key；文件内容改用 `resolver.get(path)` 拿**解压后的** `Asset.bytes`。
- key 先 `trim_start_matches('/')` 再 `strip_prefix("plugins/")`。
- 新增 `.seed-version` 标记（内容为 `CARGO_PKG_VERSION`）：首次运行或版本升级时重新种内置插件，**会覆盖旧版本种下的坏文件**，用户自己放进来的额外插件目录不受影响。

### 10.3 复验（真实 release exe + WebView2 CDP）

启动 `target/release/app.exe`（v0.2.1），CDP 重载后采集：

| 断言 | 结果 |
|---|---|
| `document.body.innerText` 含「正在加载桌面」 | ❌ 不出现（loadingText=false） |
| 桌面卡片数 | **6**（clock/countdown/pomodoro/sedentary/todo/weather） |
| 插件 iframe | 全部走 `http://wtsl.localhost/<id>/...`（TauriPluginSource 生效） |
| `plugin_list` | 6 条记录，`hasManifest=true` |
| console error / warning | 0 |
| 窗口截图 | `shots/e7/release-seed/seed-window.png`（2880×1920，六卡真实内容） |

诊断原始输出：`shots/e7/release-debug/diag2.json`。修复前同一诊断可见 6 条 `manifest.json 不是合法 JSON`（`diag.json`）。

### 10.4 中文安装器与 v0.2.1 产物

`tauri.conf.json > bundle.windows` 增加 NSIS `languages: ["SimpChinese"]`（安装界面简体中文、无语言选择框）与 WiX `language: ["zh-CN"]`（MSI 中文语言包）。

| 类型 | 产物 | 大小 | SHA-256 前 16 位 |
|---|---|---|---|
| NSIS（推荐） | `src-tauri/target/release/bundle/nsis/Windows Tablet Launcher_0.2.1_x64-setup.exe` | 8.16 MiB | `84BACC6C951E4162` |
| MSI | `src-tauri/target/release/bundle/msi/Windows Tablet Launcher_0.2.1_x64_zh-CN.msi` | 9.27 MiB | `F09A1D5A77E293EE` |

`npx tauri build` exit 0；release `app.exe` 16,735,232 B。**安装/卸载仍由用户手动验证**（安装器会写注册表与安装目录，不自动执行）。

### 10.5 升级路径

- 直接运行 v0.2.1 安装包覆盖 v0.2.0 即可；首次启动检测到 `.seed-version` 缺失/版本变化会重新种内置插件，自动修复用户目录里的坏文件。
- v0.2.0 的安装包仍在 bundle 目录（`*_0.2.0_*`），仅作历史证据；分发请用 **v0.2.1**。

## 11. v0.2.2 交互/定位热修（2026-10-20）

安装 v0.2.1 后用户实测反馈 4 个问题，本轮全部修复并独立回归。实现提交：`348587c`（版本 0.2.2 / 安装包热修同批）。

### 11.1 用户报告与根因

| # | 用户可见现象 | 根因 |
|---|---|---|
| 1 | 天气自动定位成功后，定位城市只出现在详情「当前位置」候选，widget 仍是旧城市/无城市 | 旧语义（D-16）只在城市列表为空时加入定位城市；已有城市时只写 `location` 候选、永不应用。且 `location` 有 30 分钟 TTL，升级后 fresh 结果也不会补应用 |
| 2 | 尺寸菜单选当前页放不下的档位（如 4×2）提示失败、卡片没变，但菜单里该项仍被勾选 | `<Menu defaultCheckedValues>` 非受控：点击菜单项后 Fluent 内部已改勾选状态，而 `widget.size` 没变；失败不回滚，成功改尺寸后重开菜单也不刷新 |
| 3 | 没有「增加 widget」入口，删掉的组件无法加回 | 编辑删除只有会话级移除（D-18），reload 由 `reconcileLayout` 自动并入；没有显式添加入口 |
| 4 | 删除 widget 后右下角「插件」页里该插件仍只显示「已启用」，看不出组件已不在桌面 | 插件页只读启用/禁用偏好，不知道布局里还有没有该组件；删除又是会话级，语义对用户不可见 |

### 11.2 修复

**天气自动定位成功即应用（`public/plugins/weather/**`，D-16 修订）**
- 新增纯函数 `store.applyLocatedPlace`：不存在则加入并 current、存在则切换、已是当前返回原引用（跳过写配置）；`useWeather` 自动定位 effect 与 Agent 工具 `weather.locate` 共用。
- 定位成功立即应用为当前城市，卡片/详情随 `places` 配置变化刷新；`weather.locate` 的工具描述/返回 message 同步更新。
- `location` 记录新增 `applied` 标记：升级迁移只应用「尚未应用过」的 fresh 结果（旧数据无 `applied`），应用过的不再覆盖用户手动选择的城市、不重复请求定位。
- `app/app.js` 重建（906 KB）；README / 组件文档 / DECISIONS 同步。

**桌面小组件生命周期（`src/host/layout/**`、`desktop/**`、`plugins/**`）**
- 尺寸菜单改受控 `checkedValues={widget.size}`：勾选只跟真实尺寸；失败 toast 改为「当前页面没有空间放 W × H，尺寸保持不变」，卡片/勾选都保持原尺寸；成功改尺寸后重开菜单勾选跟随。
- `LayoutState.removed`（widget key `pluginId:widgetId`）：编辑删除 = 持久下桌，reload 不复活；`wtsl.layout` 升 v3，读取兼容 v2（`removed: []`），「widgets 空 + removed 非空」是合法存档；重置布局清空 removed。
- 新增 `placeWidget` 纯函数：当前页第一个空位 → 后续页 → 新开页。
- 新增 `layout/presence.ts`（`useSyncExternalStore` 桌面存在性 + `requestAddWidget` 事件通道）：Desktop 保存布局后广播，插件页即时刷新。
- 新增编辑模式工具条「添加组件」+ Fluent Dialog（列出已启用但不在桌面的组件、两种空态、添加后关闭并聚焦）；插件页对「已启用 · 未上桌」的插件提供「添加到桌面」。
- 插件页状态四态：`已禁用` / `已启用`（纯后台）/ `已启用 · 未上桌` / `已启用 · 桌面 n/m`；启用/禁用语义不变（不删布局条目，重新启用回原位）。
- 版本 0.2.2 + `.seed-version` 版本变化：安装/升级后自动重种内置插件，weather 新 `app.js` 进入用户目录。

**测试基础设施**
- `scripts/verify-plug-and-play.mjs` 等待超时按弱机加固（30s→120s，detail/设置 8–20s→30–60s），断言不变；原因见 11.3 环境说明。

### 11.3 独立回归（verifier，2026-10-20 15:34–17:30）

| 阶段 | 结果 | 证据 |
|---|---|---|
| A 工程门禁 | 4/4：`typecheck` 0、`build` 0（2234 modules）、`node --check` weather app.js 0、重建前后 SHA-256 一致 `6ACA66D8…` | `shots/v022-final/A-gates.json` |
| B 既有脚本 | `verify-plugin` 六插件全 PASS；`verify-widgets` 25/25 × 暗/亮；`verify-overlays` 6/6 × 暗/亮；`verify-plug-and-play` 12/12 | `shots/v022-final/B-*.log` |
| C 四项修复 E2E | **21/21 PASS**：1024×768 light + 1440×960 dark；尺寸菜单负例 toast+rect 不变+勾选回退、成功跟随；删除持久化 + reload 5 卡 + 插件页「未上桌」→「桌面 1/1」；「添加组件」列表/添加/空态；外观→重置布局恢复六卡；六卡基线/无横向溢出/无编辑 chrome/console 0 | `shots/v022-final/C-e2e-results.json`、`*-C1..C5-*.png` |
| C.6 天气定位注入 | **7/7 PASS**：空列表自动加入上海 + `location.applied=true` + 卡片真实显示「上海 25°」（QWeather 真实网络）；已有北京→切上海且北京保留；`applied=true` 不覆盖手动城市、定位请求 0；无 `applied` 迁移应用、请求 0；console 0 | `shots/v022-final/C6-locate-results.json`、`C6-*.png` |

环境说明：回归期间本机 4 核持续 93–100% CPU，Vite 冷加载 60–100s，导致 plug-and-play 首次 30s 超时误报；对照实验（`pnp-investigation.json`：15s 时 0 卡、83.6s 时 6 卡、console 0）确认非产品回归，加固超时后 12/12 PASS。完整报告：`shots/v022-final/REPORT.md`。

### 11.4 安装包与升级路径

`npx tauri build`（release）产出见下表；安装器中文配置沿用 v0.2.1。**安装/卸载仍由用户手动执行**（会写注册表与安装目录，不自动安装）。

| 类型 | 产物 | 大小 | SHA-256 前 16 位 |
|---|---|---|---|
| NSIS（推荐） | `src-tauri/target/release/bundle/nsis/Windows Tablet Launcher_0.2.2_x64-setup.exe` | 8.16 MiB（8,561,260 B） | `29D763199A2279AA` |
| MSI | `src-tauri/target/release/bundle/msi/Windows Tablet Launcher_0.2.2_x64_zh-CN.msi` | 9.27 MiB（9,715,712 B） | `E8FF653E75AA6AF0` |

`npx tauri build` exit 0（release 编译 7m36s；日志 `shots/v022-final/tauri-build.log`）；release `app.exe` 16,737,280 B（SHA-256 `5A17A9991CE9F3AD…`）。

- 直接安装 v0.2.2 覆盖 v0.2.1：`.seed-version` 变化会重新种六个内置插件（weather 新产物生效）；`wtsl.layout` v2 存档自动迁移到 v3（`removed: []`）；升级前 30 分钟内的天气定位结果会在首次启动应用一次（`applied` 迁移），之后不再覆盖手动选择。
- 用户数据（插件配置、城市列表、布局、插件启用偏好）保留；自己放进插件目录的额外插件不受影响。

### 11.5 release exe + WebView2 CDP 复验（2026-10-20 17:41–17:52）

证据：`shots/v022-final/release/RELEASE-VERIFY.md`、`webview2-cdp.json`、`seed-upgrade.json`、`app-cdp-window.png`。

| 项 | 结果 |
|---|---|
| 三产物哈希 | NSIS `29D76319…`、MSI `E8FF653E…`、`app.exe` `5A17A999…` 与构建后一致，验证前后未变 |
| 真实 exe 启动 | 窗口标题正确、Responding、全屏 CSS 1440×960（DPR=2 → 物理 2880×1920）；UI Automation 命中六卡 aria-label；截图 `genuine-window.png` |
| **升级重种** | 启动前 appdata `.seed-version=0.2.1` → 启动后 **0.2.2**；`weather/app/app.js` 被重写，SHA-256 `6ACA66D8…` 与仓库产物一致；`已切换当前城市为`/`当前城市已是`/`applied` 命中、旧「不自动切换」文案 0；6 个 manifest 合法；第二次启动幂等 |
| CDP DOM 采集 | `http://tauri.localhost/` complete、无「正在加载桌面」、6 卡、8 iframe（2 background + 6 widget，均 `http://wtsl.localhost/...`）、无横向溢出、console.error/exception 0、`wtsl.layout` v3 / removed=[] |
| 真实定位应用 | 用户配置 `autoLocate=true`；首轮启动真实 ip.cn 定位成功并应用（`source=ip`、`applied=true`、澳门），天气卡显示「澳门 30° 晴」；第二轮不再重复请求 |

限制：`WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS` 在 wry 0.57 下被忽略，DOM 取证通过临时副本（仅替换 62 字节调试参数，原产物哈希不变，副本已删除）完成；安装包实际安装/卸载未执行（由用户手动）。

### 11.6 已知风险（v0.2.2）

- **P2 打包内嵌 `secrets.json`**：`public/secrets.json` 会进入 `dist` 与安装包，安装包携带本机和风天气 Key（个人自用可接受；若对外分发需在构建时排除或改为运行时录入）。证据 `shots/v022-final/release/secrets-embed.json`（仅状态，不含 Key 明文）。
- 真实 Windows Geolocator（系统定位）权限路径未单独验证；本轮真实定位走 ip.cn 成功。QWeather 真实网络链路已在 headless C.6 与真实 release exe 两处验证。
