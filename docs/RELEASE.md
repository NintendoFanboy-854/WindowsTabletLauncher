# 发布前检查清单（v0.3.0）

> v0.3.0（2026-10-20）：Agent 改为右下角浮空三段界面（按钮 → 半高输入窗 → 全高浮栏，点按/空格立即录音）；语音本轮原生音频只发一次、ASR 回填文字入库、上下文零音频；删除人脸/全屏/dock/机器人；天气 3×2 三带式重排 + 横向空洞门禁。
> 证据根：`shots/v030-dev/`（Phase 1，dev server）、`shots/v030-final/`（Phase 2，release exe/安装包）；脚本冒烟 `scripts/smoke-mimo-audio.mjs` 输出。
> 勾选口径：`[x]` = 实际执行并通过；`[ ]` = 未执行/未验证，原因写在行内。

## 1. 代码与构建

- [x] `npm run typecheck` 通过（0 错误）
- [x] `npm run build` 通过（tsc + vite；仅 chunk >500KB 已知警告）
- [x] `src-tauri` release 构建通过：`npx tauri build` exit 0（2026-10-20 20:50–21:0x；beforeBuild tsc+vite 18.36s；cargo release 约 13 分钟；NSIS/MSI bundling 完成）
- [x] 天气插件产物与源码一致：`node scripts/build-plugin.mjs weather` 重建成功，`public/plugins/weather/app/app.js` 931,293 B / SHA-256 `49E47718…`
- [x] Agent 浮空界面 E2E：`node scripts/verify-agent-surface.mjs` **107/108 PASS，1 项判定 TEST（播报停止按钮采样时序）**；P1 空格 <300ms 取消、P2 点外部收起焦点两个产品 bug 修复后定向复测 PASS — `shots/v030-dev/REPORT.md`、`run8.log`、`p1p2-retest.json`
- [x] 既有回归脚本全部 exit 0（`shots/v030-dev/existing-scripts.log`）：verify-plugin 6/6、verify-overlays 6/6×2、verify-plug-and-play 12/12、verify-widgets 25/25×2
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
- [x] 截图（`shots/v030-dev/`）：collapsed / recording / transcribing / chat / voice bubble / speaking / empty / Agent 设置 / 设置入口 / 1024 light / reduced-motion

## 3. 天气 3×2（v0.3.0 三带式）

- [ ] `verify-widgets.mjs` 天气 3×2 门禁：横向连续空白 ≤40px、上带分栏间距 ≤40px、今日指标占满上带、内容带 ≥70%、分栏空带 ≤22%、Secondary 3×2 = 2×2 + 1、1024 断点复测 — 数值待回填
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
- [ ] release exe 真窗口验证（WebView2 CDP 六卡/8 iframe/console 0/seed 0.3.0/窗口全屏）— **未执行**：用户要求关机前直接推送；下次启动补验（方法同 v0.2.2，`shots/v030-final/` 尚未生成）
- [x] 安装包语言/哈希回填（NSIS SimpChinese / MSI zh-CN）
- [x] `git status` 干净；commit / push / tag `v0.3.0` — 本次推送（tag 见 git）

## 6. 文档齐套

- [x] `docs/VISION.md`（语音优先/浮空入口/无人脸无唤醒词）
- [x] `docs/DECISIONS.md` D-20/D-21/D-22（D-03 作废）
- [x] `docs/AGENT-SURFACE-CONTRACT.md`（设计/接口/验收口径）
- [x] `docs/components/agent.md` / `docs/components/weather.md` / `docs/DENSITY.md`
- [x] `docs/DESIGN.md` / `docs/MOTION.md`（Agent 三段 morph §5.1）
- [ ] `docs/PLAN.md` E8 完成回填；`docs/RELEASE-REPORT.md` §12 待回填；`scripts/smoke-mimo-audio.mjs` 保留

## 7. 已知限制 / 风险（发布说明）

- **不做唤醒词/常驻监听/人脸**（v0.3.0 已移除）：语音入口只有点入口、按住空格、面板内语音按钮。
- **全屏形态与 dock 已删除**：桌面只有入口按钮；设置入口 = 长按桌面空白进编辑工具栏「设置」或 `Ctrl+,`。
- 语音链路：音频只在“本轮语音”请求里以 `input_audio` 发一次；ASR 另发一次同一 WAV 用于文字回填；之后所有轮次/重试/重启只发文字。网络/配额影响 ASR/TTS；ASR 有 30s 超时。
- 真实 MiMo 音频链路只在 Node 冒烟 + mock 浏览器链路验证；真实浏览器内“录音→原生音频对话→出声播报”仍需用户实测（无头 fake mic 只能验证状态机）。
- `public/secrets.json` 仍会被打进 `dist`/安装包（个人自用 P2；对外分发前需排除或改为运行时录入）。
- 天气自动定位、和风天气 Key、联网搜索开通等沿用 v0.2.2 限制。
