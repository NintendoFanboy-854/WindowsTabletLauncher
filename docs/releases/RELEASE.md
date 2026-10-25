# 发布前检查清单（v0.3.0 → v0.3.1）

> v0.3.0（2026-10-20）：Agent 改为右下角浮空三段界面（按钮 → 半高输入窗 → 全高浮栏，点按/空格立即录音）；语音本轮原生音频只发一次、ASR 回填文字入库、上下文零音频；删除人脸/全屏/dock/机器人；天气 3×2 三带式重排 + 横向空洞门禁。
> v0.3.1（2026-10-21）：半高窗补顶部控制条与 peek、录音中收起取消录音、转写中收起不自动弹回；新增 `tts.autoRead` 总开关与常驻朗读开关；宿主设置改由桌面右键进入（不放进 Agent）。增量检查见 §8。
> 证据根：`shots/releases/v0.3.x/v030-dev/`（Phase 1，dev server）、`shots/releases/v0.3.x/v030-final/`（Phase 2，release exe/安装包）；脚本冒烟 `scripts/smoke-mimo-audio.mjs` 输出。
> 勾选口径：`[x]` = 实际执行并通过；`[ ]` = 未执行/未验证，原因写在行内。

## 1. 代码与构建

- [x] `npm run typecheck` 通过（0 错误）
- [x] `npm run build` 通过（tsc + vite；仅 chunk >500KB 已知警告）
- [x] `src-tauri` release 构建通过：`npx tauri build` exit 0（2026-10-20 20:50–21:0x；beforeBuild tsc+vite 18.36s；cargo release 约 13 分钟；NSIS/MSI bundling 完成）
- [x] 天气插件产物与源码一致：`node scripts/build-plugin.mjs weather` 重建成功，`public/plugins/weather/app/app.js` 931,293 B / SHA-256 `49E47718…`
- [x] Agent 浮空界面 E2E：`node scripts/verify-agent-surface.mjs` **107/108 PASS，1 项判定 TEST（播报停止按钮采样时序）**；P1 空格 <300ms 取消、P2 点外部收起焦点两个产品 bug 修复后定向复测 PASS — `shots/releases/v0.3.x/v030-dev/REPORT.md`、`run8.log`、`p1p2-retest.json`
- [x] 既有回归脚本全部 exit 0（`shots/releases/v0.3.x/v030-dev/existing-scripts.log`）：verify-plugin 6/6、verify-overlays 6/6×2、verify-plug-and-play 12/12、verify-widgets 25/25×2
- [x] 真实 MiMo 音频冒烟：`node scripts/smoke-mimo-audio.mjs` **PASS 5/5**（TTS 流式 pcm16 3.84s → chat `input_audio` HTTP 200 / 6 内容块 / `audio_tokens=25`≈3.84×6.25 → ASR 回读与原句 100% 一致 → 后续纯文字请求无 `input_audio`）

## 2. Agent 浮空界面契约（AGENT-SURFACE-CONTRACT §11/§12）

- [x] 右下角唯一 56×56 入口（圆角 12、ChatSparkle），无 dock / 无机器人 / 无麦克风图标 / 无头像 — run8
- [x] 点入口或按住空格**立即录音**（不需要先开窗再点录音）；录音中 Esc 取消；结束发送后 morph 到 chat — run8
- [x] 三段尺寸：collapsed 56×56 / composer 420×422（1440）、420×338（1024）/ chat 420×920、420×728；圆角恒 12；过渡 300/300/250/200/250ms（契约 ±80ms 内）
- [x] 语义：Esc 退一级、⌄ 收起、X 关闭、composer 点外部收起且草稿保留、chat 点外部不关、关闭后焦点回入口 — run8 + P2 复测
- [x] 空格：按住发送、<300ms 取消（麦克风轨道 ended）、输入框聚焦不触发 — run8 + P1 复测
- [x] 语音气泡：24 桶声纹 + shimmer→转写文字、无「语音/转写结果」文字标签；localStorage 无音频/base64；mock 请求无 `input_audio`
- [x] 播报：语音提问自动朗读、文字提问默认不朗读；单条朗读/停止；收起/关闭先停播报 — run8（1 项采样 TEST）
- [x] reduced-motion：容器 0ms 几何过渡、连续动画关闭、仅 120ms opacity — run8
- [x] 设置入口：Ctrl+, / 编辑工具栏「设置」；设置页「入口」组（打开 Agent / 复盘 / 插件管理）；Agent 设置仅语音/模型/联网搜索
- [x] 截图（`shots/releases/v0.3.x/v030-dev/`）：collapsed / recording / transcribing / chat / voice bubble / speaking / empty / Agent 设置 / 设置入口 / 1024 light / reduced-motion

## 3. 天气 3×2（v0.3.0 三带式）

- [x] `verify-widgets.mjs` 天气 3×2 门禁 PASS：1440 横向连续空白 **16px**（旧版 166px）、上带分栏间距 16px、分栏空带 6.1%、今日指标 3 项占上带 56.9%/右缘 16px、Secondary=2（2×2+1）、裁切/省略 0；1024 复测横向 12px / 上带 12px / 指标 2 项 / 裁切 0；整卡内容带 ≥70% 通过（`shots/releases/v0.3.x/v030-dev/existing-scripts.log`、`shots/releases/v0.3.x/v030-dev/weather/`）
- [x] 结构：上带当前簇（城市/图标 56/温度 68/现象/高低温）+ 今日指标（体感/降水概率/风，占满剩余宽度、右缘对齐）+ 组间 16；下带全宽 6 列逐时（时间/图标/温度/降水概率）；3×2 不显示 AQI/7 天；4×2 未改
- [x] 文档：`docs/components/weather.md`（3×2 规格/今日指标/1024 说明）、`docs/DENSITY.md`（横向空洞/内容带/Secondary 门禁、旧 weather 口径删除）已更新

## 4. 设计合规（Fluent 2 + HIG 参照）

- [x] 只使用 Fluent token（颜色/间距/圆角/阴影/字号/动效时长），无手写 hex / 渐变 / 发光；实底表面，无 backdrop blur
- [x] 所有交互图标按钮 ≥40×40（入口 56）；Tooltip / focus ring / 键盘可达
- [x] 主界面无机器人/头像/模型 badge/解释性状态文字；身份只由 ChatSparkle 承担；文案只保留输入占位、必要错误（tooltip/aria）、对话内容
- [x] 动效只用 `motionTokens`；入场方向定义出场方向（右下角长出、原路收回）；reduced-motion 处理
- [x] 可预测性：只有“发送”会升级到 chat；Esc 永远退一级；关闭后焦点回入口；草稿跨阶段保留

## 5. 打包与发布

- [x] `npx tauri build`（release）exit 0，产物：`app.exe` 12,163,584 B / `E540F13D…`；NSIS `Windows Tablet Launcher_0.3.0_x64-setup.exe` 3,927,851 B / `A786D075…`；MSI `Windows Tablet Launcher_0.3.0_x64_zh-CN.msi` 5,136,384 B / `9888375A…`（体积比 v0.2.2 明显下降，删人脸模型/依赖）
- [x] release exe 真窗口验证（`shots/releases/v0.3.x/v030-final/REPORT.md`）：标题 4.3s/Responding/全屏 1440×960 CSS @DPR2（物理 2880×1920）；`.seed-version` 0.2.2→0.3.0 且 weather 新产物重种（SHA-256 `49E47718…` 与仓库一致）；WebView2 CDP 六卡 / 8 iframe（wtsl 协议）/ 无 dock / 无机器人 / Agent 入口 56×56 / console 0 / 无加载文案 / 无溢出；截图 `app-cdp-window.png`、`webview2-cdp.json`、`seed-upgrade.json`、`patch-evidence.json`
- [x] 安装包语言/哈希回填（NSIS SimpChinese / MSI zh-CN）
- [x] `git status` 干净；commit / push / tag `v0.3.0` — 本次推送（tag 见 git）

## 6. 文档齐套

- [x] `docs/VISION.md`（语音优先/浮空入口/无人脸无唤醒词）
- [x] `docs/DECISIONS.md` D-20/D-21/D-22（D-03 作废）
- [x] `docs/AGENT-SURFACE-CONTRACT.md`（设计/接口/验收口径）
- [x] `docs/components/agent.md` / `docs/components/weather.md` / `docs/DENSITY.md`
- [x] `docs/DESIGN.md` / `docs/MOTION.md`（Agent 三段 morph §5.1）
- [x] `docs/history/PLAN.md` E8 完成回填；`docs/releases/RELEASE-REPORT.md` §12 Phase 1/2 已回填；`scripts/smoke-mimo-audio.mjs` 保留

## 7. 已知限制 / 风险（发布说明）

- **不做唤醒词/常驻监听/人脸**（v0.3.0 已移除）：语音入口只有点入口、按住空格、面板内语音按钮。
- **全屏形态与 dock 已删除**：桌面只有入口按钮；设置入口 = 长按桌面空白进编辑工具栏「设置」或 `Ctrl+,`。
- 语音链路：音频只在“本轮语音”请求里以 `input_audio` 发一次；ASR 另发一次同一 WAV 用于文字回填；之后所有轮次/重试/重启只发文字。网络/配额影响 ASR/TTS；ASR 有 30s 超时。
- 真实 MiMo 音频链路只在 Node 冒烟 + mock 浏览器链路验证；真实浏览器内“录音→原生音频对话→出声播报”仍需用户实测（无头 fake mic 只能验证状态机）。
- `public/secrets.json` 仍会被打进 `dist`/安装包（个人自用 P2；对外分发前需排除或改为运行时录入）。
- 天气自动定位、和风天气 Key、联网搜索开通等沿用 v0.2.2 限制。

## 8. v0.3.1 增量检查（2026-10-21）

> 背景：用户反馈半高窗死路、不能默认静音、全高 header 不播放时没有语音控件、鼠标无设置入口；并质疑把宿主设置放进 Agent（HIG 层级）。改动见 D-23/D-24、契约 §13。§1–§7 为 v0.3.0 基线，继续有效。

- [x] 版本号 0.3.1 五处一致（`package.json` / `package-lock.json` / `src-tauri/tauri.conf.json` / `src-tauri/Cargo.toml` / `src-tauri/Cargo.lock`）
- [x] `npm run typecheck`、`npm run build`、`npx tauri build` 均 exit 0（cargo release 8m18s；NSIS/MSI 完成）
- [x] dev 冒烟 `scripts/smoke-v031-ui.mjs`：**24/24 PASS**、console error 0（右键菜单/设置页、半高控制条 + peek + 展开、朗读总开关持久化、录音中收起停麦、Agent 菜单边界）— `shots/releases/v0.3.x/v031-dev/`
- [x] release 真窗口（38 PASS / 0 FAIL）：`.seed-version` 0.3.0 → 0.3.1、6 manifest、天气产物哈希与仓库一致；WebView2 `--webview-exe-version=0.3.1` — `shots/releases/v0.3.x/v031-final/seed-upgrade.json`、`genuine-window.json`
- [x] WebView2 CDP（patched 副本，仅 62 字节参数替换）：6 卡 / 8 iframe / 无 dock / 无加载文案 / 无溢出 / Agent 入口 56×56；console.error/exception/log.error = 0；**16/16 checks PASS** — `shots/releases/v0.3.x/v031-final/checks.json`、`webview2-cdp.json`
- [x] v0.3.1 新交互真实 WebView2 复验：右键菜单三项（无「桌面设置」）→ 设置页；设置→入口→打开 Agent→ chat；未播放有「关闭自动朗读」、无「停止朗读」、点击写 `tts.autoRead=false` 再点回 true；⋯ 菜单无宿主设置 — `shots/releases/v0.3.x/v031-final/REPORT.md`
- [x] 产物哈希稳定：
      `app.exe` 12,166,656 B / `27D66C29…`；NSIS 3,932,235 B / `43B19EF9…`；MSI 5,140,480 B / `CD84C56B…`
- [x] 文档：DECISIONS D-23/D-24、契约 §13、`docs/components/agent.md`、README、RELEASE-REPORT §13 已更新
- [x] 安装包不外发（内含本地 `public/secrets.json`；仅本机安装）
- [ ] NSIS/MSI 实际安装/卸载/注册表路径：未执行（与 v0.3.0 口径相同，需手动验证）
- [x] `git status` 干净；commit / push / tag `v0.3.1`

## 9. v0.3.2 增量检查（2026-10-21）

> 背景：久坐第一次还能计时，点「我起来了」后不再计时。根因与修复见 D-25、RELEASE-REPORT §15。§1–§8 继续有效。

- [x] 版本号 0.3.2 五处一致（`package.json` / `package-lock.json` / `src-tauri/tauri.conf.json` / `src-tauri/Cargo.toml` / `src-tauri/Cargo.lock`）
- [x] `node scripts/build-plugin.mjs sedentary` 重新打包（538 KB，SHA-256 `3F55A28C…`）
- [x] `npm run typecheck`、`npm run build`、`npx tauri build` 均 exit 0（cargo release 8m14s；NSIS/MSI 完成）
- [x] Node 状态机模拟 5/5 PASS（连续计时 / 起了立即重启 / 长空档顺延不记 break）
- [x] 聚焦浏览器验证 `node scripts/verify-sedentary.mjs`：**7/7 PASS**、console error 0（首屏开始计时、点「我起来了」breaks+1、`sittingSince` 立即重置、显示 0 分钟继续）— `shots/milestones/sedentary-verify/`
- [x] 产物哈希：`app.exe` 12,166,144 B / `801DDB11…`；NSIS 3,930,622 B / `2FCE1F0B…`；MSI 5,140,480 B / `D7C7B312…`
- [x] 文档：D-25、`docs/components/sedentary.md`、README、RELEASE-REPORT §15 已更新
- [x] 按用户要求未跑完整 release CDP 回归；本次只改插件与版本号，宿主代码未动
- [x] 安装包不外发（内含本地 `public/secrets.json`）
- [x] `git status` 干净；commit / push / tag `v0.3.2`

## 10. v0.3.3 增量检查（2026-10-21）

> 背景：用户要求去掉久坐的免打扰功能。改动见 D-26、RELEASE-REPORT §16。§1–§9 继续有效。

- [x] 版本号 0.3.3 五处一致（`package.json` / `package-lock.json` / `src-tauri/tauri.conf.json` / `src-tauri/Cargo.toml` / `src-tauri/Cargo.lock`）
- [x] 免打扰完整移除：engine（`quietHours`/`isQuiet`/`quietSkip`/`quiet` 状态与文案）、manifest 设置 schema 的「免打扰」分组、`sedentary.settings.set` tool schema、卡片/详情 `quiet` 状态
- [x] 旧配置迁移：`migrateSettings` 删除旧 `quietHours` 字段（`stripLegacySettings`），设置页不再显示该分组
- [x] `node scripts/build-plugin.mjs sedentary` 重新打包（548,521 B / `774A3721…`）
- [x] `node scripts/verify-sedentary.mjs` **7/7 PASS**、console error 0 — `shots/milestones/sedentary-verify/`
- [x] `npm run typecheck`、`npm run build`、`npx tauri build` 均 exit 0（cargo release 6m55s；NSIS/MSI 完成）
- [x] 产物哈希：`app.exe` 12,164,608 B / `B24C1254…`；NSIS 3,931,048 B / `547BDCC6…`；MSI 5,136,384 B / `2B688750…`
- [x] 文档：D-26、`docs/components/sedentary.md`、README、RELEASE-REPORT §16 已更新
- [x] 安装包不外发（内含本地 `public/secrets.json`）
- [x] `git status` 干净；commit / push / tag `v0.3.3`

## 11. v0.3.4 增量检查（2026-10-21）

> 背景：久坐要「坐着—起来—坐着」循环；Agent 可操作两个动作；复盘页要反映新数据。改动见 D-27、RELEASE-REPORT §17。§1–§10 继续有效。

- [x] 版本号 0.3.4 五处一致（`package.json` / `package-lock.json` / `src-tauri/tauri.conf.json` / `src-tauri/Cargo.toml` / `src-tauri/Cargo.lock`）
- [x] 状态机：sitting ↔ standing 全手动；久坐只累计坐姿；站立单独统计；强提醒/按钮/卡片/详情/aria 文案全部随状态切换
- [x] 数据：`sedentary.days` 增加 `standingMinutes`；`runtime` 改 `posture/postureSince`（旧 `sittingSince` 迁移为 sitting）
- [x] Agent 工具：移除 `sedentary.takeBreak`，新增 `sedentary.standUp` / `sedentary.sitDown` / `sedentary.stats`；`snooze` 仅坐着可用
- [x] 复盘：`sedentary.stats` 返回区间统计与 byDay；宿主 `stats.ts`/`ReviewPage` 展示「次起身」主数值 + 久坐/站立分钟
- [x] 过渡计时修复：命令处理不再提前改写 `lastTickAt`，站/坐切换按上次 tick 补记时长
- [x] `node scripts/build-plugin.mjs sedentary`（554,867 B / `FA7168D9…`）
- [x] `node scripts/verify-sedentary.mjs`：坐→站→坐循环 **10/10 PASS**、console error 0 — `shots/milestones/sedentary-verify/sedentary-cycle.png`
- [x] 复盘集成检查（headless Edge `?page=review`）：出现久坐区块「0 次起身 · 久坐 0 分钟 · 站立 0 分钟」，来源含 `sedentary.stats` — `shots/milestones/sedentary-verify/review.png`
- [x] `npm run typecheck`、`npm run build`、`npx tauri build` 均 exit 0（cargo release 9m55s；NSIS/MSI 完成）
- [x] 产物哈希：`app.exe` 12,168,192 B / `F763A47B…`；NSIS 3,932,629 B / `BEDFCFB1…`；MSI 5,140,480 B / `78F5ACF6…`
- [x] 文档：D-27、`docs/components/sedentary.md`、README、RELEASE-REPORT §17 已更新
- [x] 安装包不外发（内含本地 `public/secrets.json`）
- [x] `git status` 干净；commit / push / tag `v0.3.4`

## 12. v0.3.5 增量检查（2026-10-22）

> 背景：用户反馈「在 Agent 里说『我坐下了』，卡片没变，还得手动点按钮」，并要求久坐 UI 按 HIG 做减法。改动见 D-28、RELEASE-REPORT §18。§1–§11 继续有效。

- [x] 版本号 0.3.5 五处一致（`package.json` / `package-lock.json` / `src-tauri/tauri.conf.json` / `src-tauri/Cargo.toml` / `src-tauri/Cargo.lock`）
- [x] 协议：`AgentToolDecl` 增加可选 `phrases`；`buildToolBindings` 带入绑定；`matchPhraseTool` 整句匹配（忽略空白/标点），单测 10/10
- [x] 文字直通：`send()` 命中短语时先执行插件工具，再以 `assistant.toolCalls` 进对话；模型只回一句短确认（真实 MiMo E2E 验证）
- [x] 语音链路：`stopRecording()` 先等 ASR（≤8s）→ 音频 + 转写文本同发；转写超时退回纯音频，晚到转写对短语补执行
- [x] 久坐文案减法：站立 `hintOf` 空串 / 2×1「休息中」；详情站立无辅助说明；去掉每次操作的「已记录…」通知；工具描述去掉「（UI：…）」；提示词禁止“教用户点按钮”
- [x] 真实 MiMo + headless Edge 同步 E2E：**12/12 PASS** — 说站/坐后 runtime 立即切换（`commandId=null`）、卡片按钮同步、工具卡出现、短确认、无防御性文案、console 0 — `shots/milestones/sedentary-agent-sync/`
- [x] `node scripts/verify-agent-surface.mjs` 复跑 **109/109 PASS、0 FAIL**（ASR-first 未破坏语音状态机）
- [x] `node scripts/build-plugin.mjs sedentary`（553,803 B / `5F1902C2…`）
- [x] `npm run typecheck`、`npm run build`、`npx tauri build` 均 exit 0（cargo release 8m19s；NSIS/MSI 完成）
- [x] 产物哈希：`app.exe` 12,168,704 B / `497BB9B9…`；NSIS 3,934,447 B / `65051899…`；MSI 5,140,480 B / `7DA6BD56…`
- [x] 文档：D-28、`docs/components/sedentary.md` / `agent.md`、`AGENT-SURFACE-CONTRACT.md` §7、`PLUGIN-CONTRACT.md` §6、README、RELEASE-REPORT §18 已更新
- [x] 安装包不外发（内含本地 `public/secrets.json`）
- [x] `git status` 干净；commit / push / tag `v0.3.5`

## 13. v0.3.6 插件配置同步修复（2026-10-22）

> 背景：用户反馈「设置里打开天气自动定位后，详情页自动有了信息，但桌面 widget 不同步，必须重启」。根因：Tauri 打包版宿主页（`tauri.localhost`）与插件 iframe（`wtsl.localhost`）跨 origin，旧的 `storage` 事件同步在打包版从未生效。修复见 D-29、RELEASE-REPORT §19。§1–§12 继续有效。

- [x] 版本号 0.3.6 五处一致（`package.json` / `package-lock.json` / `src-tauri/tauri.conf.json` / `src-tauri/Cargo.toml` / `src-tauri/Cargo.lock`；`cargo metadata --locked` 通过；注意 Cargo.lock 只改 `name = "app"` 条目，不要全局替换版本串）
- [x] 协议 v2：新增 `host:config` 增量推送；`HostBridge.setConfig` 写后广播；卡片/详情浮层/后台 iframe 三类实例都能收到
- [x] 插件侧：`plugin.onConfig` + `useStoredConfig` 新时序（init 快照 → mount 重读 → 推送 → storage 兜底；seq 防旧读；同值回推丢弃；注册重放不作废在途读取）
- [x] 浮层 init 快照现取（`configSnapshot`）+ 后台 iframe init 快照；宿主设置页表单订阅 configBus
- [x] 顺带修：clock 旧设置迁移改走宿主配置（兼容宿主旧键）；sedentary `?demo=1` 本地种子加宿主守卫；`verify-sedentary.mjs` 3 处过期选择器更新（复跑 9/9 PASS）
- [x] 六插件产物重建（`node scripts/build-plugin.mjs --all`）+ `npm run typecheck` / `npm run build` exit 0
- [x] 跨 origin harness：before 复现 / after PASS（settings 34ms、places 58ms、`host:config` 6 条、console 0）— `.tmp/config-sync-harness/`
- [x] 独立审计（`.tmp/config-sync-audit/audit.md`）与最终 diff 评审（`.tmp/config-sync-review/review.md`）：P0/P1 = 0
- [x] 全量基线回归：verify-plugin ×6 / verify-overlays 6/6 / verify-widgets 25/25 / verify-plug-and-play 12/12 / verify-sedentary 9/9，全部 exit 0、console error 0 — `.tmp/v036-regression/report.md`、`shots/releases/v0.3.x/v036-dev/`
- [x] `npx tauri build` exit 0（cargo release 16m08s；NSIS/MSI 完成）；产物：`app.exe` 12,173,312 B / `1D1BFFC3…`；NSIS 3,935,767 B / `3EB6230F…`；MSI 5,144,576 B / `7C6F51B2…`；已复制到 `release/v0.3.6/` + `SHA256SUMS.txt`
- [x] release 真窗口：`.seed-version` 0.3.5 → 0.3.6、六插件重种哈希与仓库一致；WebView2 CDP 6 卡 / 8 iframe（wtsl 协议）/ console 0；**真实跨 origin 配置同步 PASS**（时钟 12h 设置页 UI → 卡片 2s 内切换、clock iframe 收到 host:config 1 条、timeOrigin/探针证明未 reload；天气自动定位开关双向切换收到 2→3 条）— `shots/releases/v0.3.x/v036-final/`
- [x] 文档：D-29、`PLUGIN-CONTRACT.md`（配置更新时序）、`PLUGIN-REACT.md`（配置同步章节）、`components/weather.md` / `clock.md`、weather README、README、RELEASE-REPORT §19
- [x] 安装包不外发（内含本地 `public/secrets.json`）
- [ ] `git status` 干净；commit / tag `v0.3.6`

## 14. v0.3.7 语音优先 Agent 界面（2026-10-23）

> 背景：用户反馈「按着空格发语音 / 触屏点 chat 图标，期待的是连续语音对话，文字对话是兜底；现在语音一发完就自动半高 → 全高；半高窗不该有文字输入框；回答完再按空格竟打出空格；右下角对话框没必要分两行」。四条同源：把语音当成“填满文字对话的输入方式”。修复见 D-30、AGENT-SURFACE-CONTRACT §14、RELEASE-REPORT §20。§1–§13 继续有效。

- [x] 版本号 0.3.7 五处一致（`package.json` / `package-lock.json` / `src-tauri/tauri.conf.json` / `src-tauri/Cargo.toml` / `src-tauri/Cargo.lock` 的 `name = "app"` 条目；`app.exe` 资源版本实测 0.3.7）
- [x] 状态机：`composer` → `voice`（半高纯语音窗）；**删除发送/语音结束自动升级到 chat**，进入全高只能显式展开（⌃ / peek / Enter / 受控 open）；语音回合结束留在 voice（连续语音对话）
- [x] 半高窗移除文字输入框/发送按钮：peek + 全宽 primary「点击说话」（`size=large` 40px）/ 录音声纹条；无横向溢出
- [x] 空格与焦点：不再自动聚焦输入框（修复“回答后空格打出空格”）；只有光标主动在 textarea 内才是打字；textarea 内第一次 Esc 只失焦；窗口失焦取消任意路径录音（P2）；Esc/点外部监听常驻化，消除换段丢事件
- [x] 全高输入区改单行 `[语音][输入][发送]`（空卡高 44px、三控件垂直中心差 1px）；录音/转写整行换声纹条；草稿跨 chat→voice→chat 保留
- [x] Fluent 2 token 审计：颜色/字号/间距/圆角/阴影/动效全取 `tokens`/`motionTokens`，语音主按钮用 `size=large`（不自造 56px 高度）、不覆写按钮圆角；HIG 取舍：入口长出/原路收回、关闭焦点回入口、✕ 关层 vs ⌄/Esc 退一级、peek 顶部渐隐、半高 detent、reduced-motion 120ms
- [x] 新增 `scripts/verify-agent-voice-first.mjs` **198/198 PASS**（194s）；`scripts/verify-agent-surface.mjs` **127/127 PASS**（217s）；`scripts/smoke-v031-ui.mjs` **26/26 PASS**（82s）；1440 dark / 1024 light / reduced-motion console error 0 — `shots/releases/v0.3.x/v037-dev/REPORT.md`
- [x] `npm run typecheck` / `npm run build` exit 0
- [x] `npx tauri build` exit 0（cargo release 4m53s；NSIS/MSI 完成）；产物：`app.exe` 12,173,312 B / `33791E72…`；NSIS 3,936,298 B / `E6E6098D…`；MSI 5,144,576 B / `7C925253…`；已复制到 `release/v0.3.7/` + `SHA256SUMS.txt`（哈希自校验 OK）
- [x] 文档：D-30、`AGENT-SURFACE-CONTRACT.md` §14、`components/agent.md`、`DESIGN.md`、`MOTION.md`、README（含 v037 截图）、RELEASE-REPORT §20
- [x] 安装包不外发（内含本地 `public/secrets.json`）
- [x] `git status` 干净；commit / push / tag `v0.3.7`
