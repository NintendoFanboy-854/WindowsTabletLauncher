# 第三轮小组件 UI/UX + HIG/Fluent 2 + 动效审计（只读）

- 审计时间：2026-11-01（Asia/Shanghai）
- 仓库版本：`package.json` v0.9.0
- 范围：7 个插件 × 30 个尺寸档 × 深/亮 × 1440×960 / 1024×768；7 个详情面板（含 L2）+ Apple Music large 面板；宿主桌面默认构图、设置页（schema 渲染）、Agent 入口/浮层
- 边界：**只读**。未改 `src/**`、`public/**`、`scripts/**`；未跑 `cargo` / `tauri` / `npm run build`；未安装或重启 launcher。全部写入只发生在 `docs/audits/round3-widget-audit/**` 与 `.tmp/audit-round3/**`
- 结论一句话：**动效的“值”基本合规（全部落在 `motionTokens` 上，0 处裸毫秒/曲线字面量），但“体验”有两处硬伤——首帧 6 张卡纯白且无加载指示；Agent 三段 morph 的时长与 `MOTION.md §5.1` 登记值系统性不符（200ms 覆盖 300/250ms）。卡片信息密度整体达标，剩余问题集中在 todo 行元信息超预算、appleMusic 3×2→4×2 无字段增长、42px 触控控件、以及若干 1×1/2×1 空带。**

---

## 0. 方法与可复现命令

### 0.1 环境

| 项 | 值 |
|---|---|
| 宿主代跑 | `node node_modules/vite/bin/vite.js --config .tmp/audit-round3/tools/vite.audit.config.mjs --host 127.0.0.1`（dep 缓存改到 `.tmp/audit-round3/vite-cache`，不写 `node_modules/.vite`） |
| 渲染器 | headless Edge（`scripts/lib/cdp.mjs` 的 `launch`，`--headless=new --disable-gpu`），**串行单实例** |
| 视口 | 1440×960（cell 164 / 8 列）、1024×768（cell 154 / 6 列）；卡片按真实 iframe 尺寸 standalone 打开（`?demo=1` / 天气 `?mock=1`） |
| 网络 | 无外网：必应壁纸与和风 API 取不到（`transferSize=0`），壁纸层未渲染 → 材质/壁纸类结论标注未验证 |
| 真机 | 未做。`src-tauri` 未启动、用户 launcher 未触碰；状态栏/快速设置面板在浏览器预览下不渲染（`src/host/desktop/StatusBar.tsx:381` 的 `isTauriRuntime()` + `:728` `return null`） |

### 0.2 采集脚本（全部在 `.tmp/audit-round3/tools/`，只读）

| 脚本 | 作用 | 产物 |
|---|---|---|
| `doc-manifest.mjs` | 741 个参考文档清点 + 每文件 digest + 24 批笔记 | `doc-read/MANIFEST.md`、`doc-read/batch-01..24.md`、`doc-read/digest/*.md`、`doc-read/stats.json` |
| `static-motion-scan.mjs` | 宿主 + 插件源码动效静态扫描（220 文件 / 58,389 行） | `metrics/static/motion-scan.json` |
| `cards-matrix.mjs` | 30 组 × 2 主题 × 2 视口 = 120 例卡片：DOM 指标 + 像素级对比度 + 截图 | `metrics/cards/*.json`（120）、`shots/cards/<viewport>-<scheme>/*.png`（120） |
| `analyze-cards.mjs` | 门禁判定（字号/空带/裁切/触控/溢出/主题一致性/尺寸递增） | `metrics/cards/_analysis.json`、`_analysis.md` |
| `motion-probe2.mjs` | 卡片 hover/press/长按/编辑 + 浮层开合 + reduced-motion（页内 8ms 采样 + WAAPI 清单 + 录屏帧） | `metrics/motion/overlay-v2.json`、`shots/motion/**` |
| `motion-shell.mjs` | 页面切换 / 设置分区 / 返回桌面 / Agent 入口 + 设置页 schema 渲染 | `metrics/motion/shell.json` |
| `panels-l2.mjs` | 7 个详情 L1 + L2 push/pop 动画 + Apple Music large 面板 | `metrics/panels/panels.json`、`shots/panels/*.png` |
| `host-load.mjs` | 宿主首屏加载态（白屏时长 / 内容到达时刻） | `metrics/host/load-state.json`、`shots/host/load-t*.png` |
| `settings-targets.mjs` | 设置页 6 个分区的触控目标/字号/溢出 | `metrics/host/settings.json` |
| `states-focus-empty.mjs` | 键盘焦点遍历（6 次 Tab）+ 6 个插件空态 | `metrics/states/focus-empty.json`、`shots/host/focus-tab.png`、`shots/states/*.png` |

复现顺序（任意脚本可单独跑）：

```powershell
# 0) 起宿主（后台）——只读，缓存落 .tmp
node node_modules/vite/bin/vite.js --config .tmp/audit-round3/tools/vite.audit.config.mjs --host 127.0.0.1
# 1) 文档清点
node .tmp/audit-round3/tools/doc-manifest.mjs
# 2) 静态动效扫描
node .tmp/audit-round3/tools/static-motion-scan.mjs
# 3) 卡片矩阵（约 25 min，单 Edge 串行；--only clock / --resume 可增量）
node .tmp/audit-round3/tools/cards-matrix.mjs
node .tmp/audit-round3/tools/analyze-cards.mjs
# 4) 动效抓取
node .tmp/audit-round3/tools/motion-probe2.mjs
node .tmp/audit-round3/tools/motion-shell.mjs
node .tmp/audit-round3/tools/panels-l2.mjs
# 5) 加载态、设置页、键盘焦点与空态
node .tmp/audit-round3/tools/host-load.mjs
node .tmp/audit-round3/tools/settings-targets.mjs
node .tmp/audit-round3/tools/states-focus-empty.mjs
```

### 0.3 证据目录

```text
.tmp/audit-round3/
├── doc-read/            MANIFEST.md（741 行）+ batch-01..24.md + digest/（532 篇）
├── metrics/
│   ├── cards/           120 份逐例 JSON + _summary.json + _analysis.{json,md}
│   ├── motion/          card-surface.json、overlay-v2.json、shell.json
│   ├── panels/          panels.json
│   ├── host/            load-state.json、settings.json
│   └── static/          motion-scan.json
└── shots/
    ├── cards/           1440x960-dark|light/、1024x768-dark|light/（120 张）
    ├── motion/          card-hover/、card-press/、overlay-open-v2/、overlay-close-v2/（帧序列 + frames.json）
    ├── panels/          7 个 L1 + 4 个 L2 + appleMusic-large.png
    └── host/            桌面、设置页、schema 分区、load-t*.png（5 个时刻）
```

### 0.4 测量口径（与 DENSITY §1.1 / §2.1 的对应）

- **ink 内容带**：可见文本/图形包围盒并集的纵向覆盖率（`contentBandPct`）。这是“墨迹覆盖”，**不是** DENSITY 的“内容单元带”口径——单值卡两者接近，列表卡 ink 天然偏低（一行 44px 里文字只占 22px）。报告里对列表卡改用**行节奏**判定（行数 × 48 pitch），不拿 ink 带当违规依据。
- **单块空带**：`max(首内容上边距, 相邻块间距, 末内容下边距) / iframe 高`（与 DENSITY §1.1-2 同式）。
- **1×1 均分**：identity 行下沿（16+24=40）以下的主内容块，上下留白差 ≤4px；同时给出“扣除 16px 内衬”的换算，因为 DENSITY 自己的表（`docs/DENSITY.md:28-29`「22 / 22」）就是按扣除内衬的算法得出的。
- **对比度**：截图像素采样文字矩形外扩 3px 的背景中位色 + 计算 `color`，按 WCAG 公式算比值（`lib-audit.mjs` 的 `regionMedian` / `contrastRatio`）。

---

## 1. 已读清单（741 / 741 全覆盖）

| 项 | 数 | 说明 |
|---|---:|---|
| `docs/reference` 全部 md/mdx | **741** | 逐文件 `size` + `sha256:16` 入册 |
| 读（非 API） | **532** | 每篇产出 `doc-read/digest/NNN-*.md`（标题栈 + 首段 + 关键词命中行号）；人工全文精读核心规范与契约（见下） |
| 显式跳过 | **209** | `*.api.md` **147**（组件 API 表）+ `Spec.md` **62**（组件规范表；含 3 个 `SPEC.md` 大写变体） |
| 覆盖率 | **741/741** | 无未分类文件；跳过项均在 MANIFEST 里给了理由 |

- 清单文件：`.tmp/audit-round3/doc-read/MANIFEST.md`（123,570 B，741 行表格：`# / path / size / sha256:16 / read|skip / reason`）
- 批次笔记：`.tmp/audit-round3/doc-read/batch-01.md` … `batch-24.md`（每批 ~22 篇，含路径 + 一句话要点 + 条款行号）
- 统计：`.tmp/audit-round3/doc-read/stats.json`（按目录的 read/skip 分布 + 关键词密度 Top40）

**人工全文精读（规范与实现，作为判定依据）**：`docs/MOTION.md`（248 行全读）、`docs/TOKEN-MAP.md`（294）、`docs/DESIGN.md`（227）、`docs/DENSITY.md`（273）、`docs/FLUENT2.md`（210）、`docs/components/{clock,countdown,weather,pomodoro,todo}.md`、`docs/PLUGIN-CONTRACT.md §4.3–§4.4.3`（318–467）、`docs/audits/README.md`、`docs/audits/round2-type-visual/REWRITE-RESULT.md`、`docs/reference/APPLE-HIG.md §9–§10`（130–161）、`docs/reference/fluent-design/{motion,layout,wait-ux,accessibility}.md` 的相关条款、`public/plugins/_shared/motion.js`（全文）、`src/host/desktop/WidgetCard.tsx` / `desktop.styles.ts` / `shell/PageTransition.tsx` / `plugins/overlayMotion.ts` / `agent/ui/AgentSurface.tsx` 的动效段。

> 读取方式的诚实说明：532 篇里，**逐篇机器提取（标题/首段/关键词行号）+ 人工抽读**是主体，只有上面的核心规范与契约是逐行全文精读。MANIFEST 的 `read` 表示“已处理并留证”，不等于 532 篇都逐行读完——按 1.5 MB 体量，本轮用“全量抽取 + 重点精读”保证不漏文件、重要条款有行号可查。

---

## 2. 动效专章（P0，最关键）

### 2.1 结论先行

1. **值层面干净**：220 个源文件 / 58,389 行里，`transition: all` **0** 处、自定义 `cubic-bezier` **0** 处、`ease-in-out` 字面量 **0** 处、非 token 毫秒 **0** 处；唯一毫秒字面量是 CSS 变量兜底 `var(--durationUltraFast, 50ms)`（`public/plugins/_shared/base.css:90`，合规）。9 个文件声明了 `prefers-reduced-motion`。
2. **实测曲线与登记值一一对上**（下表）：卡片 hover/press/长按/编辑、浮层 container transform、L2 push/pop、页面切换、设置分区切换全部落在 `motionTokens` 的 50/100/150/200/250/300ms 档。
3. **两处体验硬伤**：
   - **M-P0-1** Agent 三段 morph 几何时长 = `durationNormal`(200ms) × 5 条路径（`src/host/agent/ui/AgentSurface.tsx:127-157`），而 `docs/MOTION.md:108-112` 登记的是 300 / 300 / 250 / 200 / 250ms。大块进场用 200ms 既违反登记表，也违反 Fluent 自己的“元素越大时长越长”（`docs/reference/fluent-design/motion.md:22`）。
   - **M-P0-2** 宿主首屏**纯白闪**：6 个 iframe 在 t=300ms 时全部 `rgb(255,255,255)`，t=1500ms 才变暗（`metrics/host/load-state.json`）。期间**没有骨架、没有 Spinner、没有占位材质**，番茄钟文字到 t=4000ms 才出现。违反 `docs/reference/fluent-design/wait-ux.md:12`（“Blank screens or static loaders should be avoided”）、`:27`（骨架屏）、`docs/FLUENT2.md:163-173`（等待体验分级）、`docs/MOTION.md:166`（加载/骨架用 Fluent Skeleton/Spinner）。

### 2.2 逐动效评估表（预期 token → 实测 → 结论）

| # | 动效 | 文档预期（file:line） | 实测（计算样式 / WAAPI / 帧） | 结论 | 证据 |
|---|---|---|---|---|---|
| M1 | 卡片 hover 进入 | 100ms `durationFaster` + `curveDecelerateMin`，scale 1.02（`docs/MOTION.md:42`、`:49`、`docs/TOKEN-MAP.md:245`） | `transform matrix(1.02,…)`；`transition: 100ms cubic-bezier(0.33,0,0.1,1)`；WAAPI `transform 100ms` 同曲线 | **通过** | `metrics/motion/overlay-v2.json` → `hover` |
| M2 | 卡片按下 | 50ms `durationUltraFast` + `curveAccelerateMin`，scale 0.98（`docs/MOTION.md:44`） | `transform 50ms cubic-bezier(0.8,0,0.78,1)`，keyframe 起点 `scale(1.02)`→按下 | **通过** | 同上 → `press-then-hold` |
| M3 | 长按下沉 + 品牌描边 | 500ms `durationUltraSlow` + `curveLinear`，0.98→0.97，描边透明度 0→0.35（`docs/MOTION.md:45`、`:191`） | 两条 WAAPI：`transform 500ms cubic-bezier(0,0,1,1)`（= `curveLinear`）+ 描边 overlay `opacity 500ms` 同曲线 | **通过** | 同上；`cubic-bezier(0,0,1,1)` = `node_modules/@fluentui/tokens/lib/global/curves.js:10` 的 `curveLinear` |
| M4 | 进入编辑模式 | 0.97→0.96，200ms `curveDecelerateMid`；chrome 200ms + translateY −4→0（`docs/MOTION.md:47`、`:57`） | `transform 200ms cubic-bezier(0,0,0,1)` → `scale(0.96)`；编辑 chrome `opacity 200ms` + `translateY(-4px) scale(0.98)` 200ms | **通过** | 同上 → `press-then-hold` |
| M5 | 退出编辑 | 0.96→1，150ms `curveAccelerateMid`（`docs/MOTION.md:58`） | 代码 `WidgetCard.tsx:401-403`（150ms accelerateMid）；实测 Esc 后 chrome `opacity` 回到 0，卡片接管 hover 过渡（100ms decelerateMin） | **部分验证**：退出段被 hover 过渡覆盖，未单独隔离出 150ms 样本 | `metrics/motion/overlay-v2.json` → `exit-edit` |
| M6 | 浮层 container transform 开 | 卡片 rect → 浮层 rect，250ms `durationGentle` + `curveDecelerateMid`；内容 60% 处淡入 150ms；scrim 200ms（`docs/MOTION.md:69-74`） | `data-overlay-mode="container"`；surface `transform/box-shadow/radius 250ms cubic-bezier(0,0,0,1)`；首帧 `matrix(0.598,0,0,0.51,616.84,-97…)` ≈ 卡片/浮层比 `516/880=0.586`、`340/680=0.5` → **起点就是卡片矩形**；终态 `880×680 @ (280,140)` | **通过** | `overlay-v2.json` → `overlay-open` / `overlay-open-state`；`shots/motion/overlay-open-end.png` |
| M7 | 浮层关闭 + 卸载时机 | 内容 100ms 淡出 → surface 150ms `curveAccelerateMid` 收回 → scrim 150ms；动画完再卸载，焦点回来源卡片（`docs/MOTION.md:76-79`、`:213`） | `DialogBody opacity 100ms`（accelerateMin）+ `DialogSurface opacity/radius/box-shadow/transform 150ms cubic-bezier(1,0,1,1)`（=`curveAccelerateMid`）+ backdrop `opacity 150ms`；**卸载发生在 t≈283ms**（> 150+100），`document.activeElement` = `DIV|时钟 小组件` | **通过** | `overlay-v2.json` → `overlay-close` / `overlay-close-state`；`metrics/…/frames.json` |
| M8 | L2 push | 新页 translateX 48→0 + 淡入，250ms `curveDecelerateMid`（`docs/MOTION.md:87`） | `waapi 250ms cubic-bezier(0,0,0,1)`，keyframe `translate: 48px → 0` | **通过** | `metrics/panels/panels.json` → `l2PushAnim`（clock/countdown/todo 一致） |
| M9 | L2 pop | 0→48px + 淡出，200ms `curveAccelerateMid`（`docs/MOTION.md:89`） | `waapi 200ms cubic-bezier(1,0,1,1)` | **通过** | 同上 → `l2PopAnim` |
| M10 | 页面切换（桌面↔设置） | 200ms 减速淡入 + 6px 上移（`docs/MOTION.md:97`） | `waapi 200ms cubic-bezier(0,0,0,1)`，keyframe `translateY(var(--spacingVerticalSNudge))`→0（=6px） | **通过** | `metrics/motion/shell.json` → `page-transition-to-settings`；`back-to-desktop` 同参数 |
| M11 | 设置页分区切换 | 150ms 淡入 + 4px 上移（`docs/MOTION.md:99`） | `opacity 150ms` + `transform 150ms translateY(4px)`（decelerateMid） | **通过** | `shell.json` → `settings-section-switch` |
| M12 | Tab 指示条 | Fluent 默认，不覆写（`docs/MOTION.md:163`） | `300ms cubic-bezier(0.1,0.9,0.2,1)`（`curveDecelerateMax`）由 Fluent Tabs 提供 | **通过（Fluent 默认）** | 同上 |
| M13 | reduced-motion：卡片 hover/press | 不做 transform，仅 100ms 颜色/描边（`docs/MOTION.md:177`、`:194`） | `transform matrix(1,0,0,1,…)`（无缩放）、`transition 0.1s`；按下 `data-press="holding"` 但 transform 仍为 1 | **通过** | `overlay-v2.json` → `reduced-hover` |
| M14 | reduced-motion：浮层 | 只 100ms 淡入淡出，无位移/缩放（`docs/MOTION.md:181`、`:92`） | 终态 `transform: none`；`opacity 100ms`；几何在不可见阶段瞬变（采样见到 `748×578`→`880×680` 但 `opacity:0`） | **通过（几何不可见期变化）** | `overlay-v2.json` → `reduced-overlay-open`；`shots/motion/reduced-overlay.png` |
| M15 | 插件内列表/内联/勾选/Tab | FadeSlide 200/100、CrossFade 200/150、Collapse 200/150（`docs/MOTION.md:157-165`） | `_shared/motion.js` 逐参数核对一致；todo L2 见 `waapi 200ms 8px`（列表项）+ `200ms 4px`（内容） | **通过** | `public/plugins/_shared/motion.js:120-260`；`panels.json` → `todo.push` |
| M16 | 空闲/后台持续动画 | 不做循环呼吸/视差/粒子；加载外用 Fluent 指示（`docs/MOTION.md:169`） | 桌面静置 `document.getAnimations()` = **0 条运行中**；时钟只做 1s/次的文本更新（12:51:22→23），无 CSS 动画 | **通过（无 CPU 空转动画）** | `metrics/motion/card-surface.json` → `idle` |
| M17 | Agent 三段 morph | 300/300/250/200/250ms（`docs/MOTION.md:108-112`） | 代码 5 条路径全部 `durationNormal`(200ms)（`AgentSurface.tsx:129/135/141/147/153`）；实测浮层几何 morph 250ms 样本为 DialogSurface 自带 | **违规（P0）** | 见 §2.3 |
| M18 | 首帧/加载 | 骨架或 Spinner；空白屏禁止（`wait-ux.md:12/27`、`FLUENT2.md:172`、`MOTION.md:166`） | t=300ms 六卡全白；t=1500ms 变暗；番茄钟正文 t=4000ms | **违规（P0）** | `metrics/host/load-state.json`；`shots/host/load-t300.png` |

### 2.3 动效问题详述

**M-P0-1 Agent 三段 morph 时长与登记表不符。** `docs/MOTION.md:108-112` 明确：按钮→半高 `300ms durationSlow`、半高→全高 `300ms`、全高→半高 `250ms accelerateMid`、半高→按钮 `200ms`、全高→按钮 `250ms`。实现里 `MORPH` 表五条 `geometry` 全部是 `durationNormal`（200ms），文件头注释甚至把“进入 durationNormal、离开 durationNormal”写成了设计意图（`src/host/agent/ui/AgentSurface.tsx:122-158`）。这是**代码与契约的单点冲突**，不是测量误差：`motionTokens.durationNormal = 200`、`durationGentle = 250`、`durationSlow = 300`（`node_modules/@fluentui/tokens/lib/global/durations.js`）。建议按登记表改回 300/300/250/200/250，或在 `DECISIONS.md` 登记“Agent morph 统一 200ms”并同步改 `MOTION.md`——两者只能留一个。

**M-P0-2 首帧白屏 + 无加载指示。** 证据：`metrics/host/load-state.json`

```
t=300ms   weather 255,255,255 | clock 255,255,255 | todo 34,34,34 | pomodoro 255,255,255 | countdown 34,34,34 | sedentary 255,255,255   textLens [0,0,0,0,0,0]
t=1500ms  全部 34,34,34                                                                                                              textLens [13,33,17,0,0,19]
t=4000ms  全部 34,34,34                                                                                                              textLens [13,33,17,50,15,19]
```

成因是插件 `index.html` 只带 `<link rel="stylesheet" href="../_shared/base.css">`，`base.css:42` 才有 `body{background:transparent}`；在 CSS 到达并应用之前，iframe 画布按浏览器默认白底绘制。**修法（二选一，代价最小）**：(a) 每个 `public/plugins/*/index.html` 的 `<head>` 里内联 `<style>html,body{background:transparent;color-scheme:light dark}</style>`；(b) 宿主在 iframe 之下先画一层与卡片同材质的占位（`WidgetCard` 的 contentLayer 底色），并把 iframe 背景保持透明。加载指示按 `FLUENT2.md:167-169` 分档：>1s 出 `Spinner + 「正在加载…」`，内容型首屏用 Skeleton（`wait-ux.md:27`）。

**M-P2-1 `HeroProgress` 时长两处文档互斥。** `docs/PLUGIN-CONTRACT.md:340` 写“宽度过渡 100ms `durationFaster` / `curveEasyEase`”，`docs/MOTION.md:162` 写“数字/进度更新…200ms `curveEasyEase`”。实现取 `useMotionTransition('normal')` 的 200ms 档。**冲突双方均已登记在案，本轮不擅自择一**，建议在 `DECISIONS.md` 补一条裁决。

**M-P2-2 页面切换带 6px 位移与 Fluent 的“top level 用纯淡入”建议不同。** `docs/reference/fluent-design/motion.md:56` 建议一级页面切换“用快速淡入而不是滑动/位移”；`docs/MOTION.md:97` 规定 200ms + 6px 上移。实现按后者。属于**已登记的项目取舍**，不判违规，仅记录。

### 2.4 帧序列与采样可信度（重要限制）

- 页内 8ms `setTimeout` 采样器（`POLLER`）能拿到 CSS transition / WAAPI 的真实 `duration / easing / keyframes`，这部分数据不受帧率影响。
- **视觉帧率不可用于“流畅度”结论**：`Page.startScreencast` 在 1440×960 + 6 iframe 的 headless（`--disable-gpu`）下只产出 4–9 帧/1.2s（`metrics/motion/overlay-v2.json` 的 `frames.json`），rAF 间隔 p50 168–287ms。这是**环境上限**，不是产品帧率；真机 WebView2 未测（见 §9）。
- 由此带来的判定边界：**“有没有跳帧/掉帧/首帧空白”只在“首帧矩形/起点缩放/卸载时刻”这类几何事实上给结论**，不给“是否 60fps”的结论。

---

## 3. 审计矩阵（30 组 × 2 主题 × 2 视口 = 120 例）

### 3.1 全局门禁汇总（120 例）

| 门禁 | 结果 | 说明 |
|---|---|---|
| 最小字号 ≥12px（`docs/DENSITY.md:89-90`、`:103`） | **通过**：`<12px` 文本 **0** 处 / 120 例 | `metrics/cards/_analysis.json` → `below12Total: 0` |
| hero 统一 40/52（`docs/DENSITY.md:17`、`docs/FLUENT2.md:53-57`） | **通过**：6 个数值卡全档 `maxFont=40`；列表卡（todo/countdown）按 16/12 列表口径（`docs/DENSITY.md:98-102`） | 逐例 `maxFont` |
| 深/亮主题一致 | **通过**：同插件同尺寸同视口下 `maxFont/minFont/textCount` 全等（0 例差异） | `_analysis.json` → `themeParityIssues: []` |
| 44×44 触控（`docs/TOKEN-MAP.md:68`、`layout.md:57`） | **卡片内通过**：0 个 <44 的可交互控件；**详情/设置违规**（见 §5.2） | 卡片 `interactive` 仅整卡一个命中区 |
| 溢出/静默裁切（`docs/DENSITY.md:109`） | **通过**：0 例横向/纵向溢出；14 例文本裁切中 12 例是 todo 标题的 `ellipsis`（`docs/components/todo.md:31` 规定单行省略）；**2 例非省略裁切**（pomodoro 2×2 @1024 双主题） | `_analysis.json` → `nonEllipsisClip` |
| 对比度 4.5:1 / 3:1（`docs/FLUENT2.md:150`、`accessibility.md:22`） | **通过**：120 例中最低 **5.36:1**（采样：hero 18.73、fg3 12px 8.35、物面色 6.48） | 像素采样，见 §0.4 |
| 控制台错误 | **0** | 120 例逐例 `consoleErrors` 全空 |
| 尺寸递增（`docs/DENSITY.md:104`） | **3 处不满足**：appleMusic 3×2→4×2、todo 3×2→4×2（信息项数持平）、weather 1×2→2×1（面积口径比较的伪差，见下） | `_analysis.json` → `growth` |

### 3.2 逐插件矩阵

> 表内为 1440×960 与 1024×768 的暗色实测（亮色与暗色逐项一致，不重复列）。`ink带` 是墨迹覆盖率（口径见 §0.4），列表卡不作门禁依据。

#### clock（1×1 / 2×1 / 3×2）

| 尺寸 | iframe | 视口 | 字号 max/min | 文本项 | ink带% | 最大空带% | 裁切 | <44 | 溢出 |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1×1 | 152×152 | 1440×960 | 40/40 | 1 | 47.4 | 25.0 | 0 | 0 | 0 |
| 1×1 | 142×142 | 1024×768 | 40/40 | 1 | 50.7 | 23.2 | 0 | 0 | 0 |
| 2×1 | 328×152 | 1440×960 | 40/12 | 4 | 47.4 | 21.7 | 0 | 0 | 0 |
| 2×1 | 308×142 | 1024×768 | 40/12 | 4 | 50.7 | 19.7 | 0 | 0 | 0 |
| 3×2 | 504×328 | 1440×960 | 40/12 | 6 | 56.1 | 10.4 | 0 | 0 | 0 |
| 3×2 | 474×308 | 1024×768 | 40/12 | 6 | 59.7 | 7.8 | 0 | 0 | 0 |

- 1×1 只有 `12:59`，identity 图标无标签 → 符合 `docs/components/clock.md:27`「1×1 只留 HH:MM」与 `docs/PLUGIN-CONTRACT.md:344` 的 `compact`。
- 1×1 均分判定：identity 下沿 40 → 内容 62..114，**上 22 / 下 38**；扣除 16px 内衬后 **22 / 22**，与 `docs/DENSITY.md:29`（时钟 22/22）一致 → **通过**。
- 2×1 空带 21.7%（≤22%）→ **通过**（历史值 21.7%，未漂移）。

#### countdown（1×1 / 2×1 / 2×2 / 3×2 / 3×3）

| 尺寸 | iframe | 视口 | 字号 | 文本项 | ink带% | 最大空带% | 备注 |
|---|---|---|---:|---:|---:|---:|---|
| 1×1 | 152×152 | 1440×960 | 40/16 | 2 | 61.8 | 18.4 | hero + 标题 |
| 2×1 | 328×152 | 1440×960 | 40/12 | 4 | 47.4 | **34.2** | **底部空带超标（>22%）** |
| 2×1 | 308×142 | 1024×768 | 40/12 | 4 | 50.7 | **29.6** | 同上 |
| 2×2 | 328×328 | 1440×960 | 40/12 | 20 | 54.3 | 12.2 | featured + 4 行 ×48 pitch |
| 3×2 | 504×328 | 1440×960 | 40/12 | 24 | 54.3 | 12.2 | 同为 4 行 + 日期字段（`docs/components/countdown.md:27`） |
| 3×3 | 504×504 | 1440×960 | 40/12 | 34 | 46.4 | **23.8** | 实测 7 条数据 → 7 行；预算 8 行（`DENSITY.md:153`），**数据不足致空带**，需 ≥8 条复测 |

#### pomodoro（1×1 / 2×1 / 2×2 / 3×2）

| 尺寸 | iframe | 视口 | 字号 | 文本项 | ink带% | 最大空带% | 备注 |
|---|---|---|---:|---:|---:|---:|---|
| 1×1 | 152×152 | 1440x960 | 40/12 | 2 | 57.9 | 18.4 | 时间 + 阶段 |
| 2×1 | 328×152 | 1440x960 | 40/12 | 3 | 47.4 | **22.4** | 边界（33.4px 上限 vs 实测 34px） |
| 2×2 | 328×328 | 1440x960 | 40/12 | 11 | 57.9 | 12.2 | |
| 2×2 | 308×308 | 1024x768 | 40/12 | 11 | 59.1 | 9.1 | **1 处非省略裁切**（P2） |
| 3×2 | 504×328 | 1440x960 | 40/12 | 14 | 57.9 | 14.0 | 含进度带 + 2×2 统计 |

#### sedentary（1×1 / 2×1 / 2×2 / 3×2）

| 尺寸 | iframe | 视口 | 字号 | 文本项 | ink带% | 最大空带% | 备注 |
|---|---|---|---:|---:|---:|---:|---|
| 1×1 | 152×152 | 1440x960 | 40/12 | 3 | 50.0 | **34.2** | 内容块偏上：不扣内衬 8/52；扣内衬 8/36（Δ28）→ 不均分（P2） |
| 2×1 | 328×152 | 1440x960 | 40/12 | 5 | 47.4 | **22.4** | 边界 |
| 2×2 | 328×328 | 1440x960 | 40/12 | 16 | 56.1 | 15.2 | |
| 3×2 | 504×328 | 1440x960 | 40/12 | 24 | 52.4 | 17.7 | |

#### todo（1×1 / 2×2 / 3×2 / 3×3 / 4×2）

| 尺寸 | iframe | 视口 | 字号 | 文本项 | 行数（实测） | 最大空带% | 备注 |
|---|---|---|---:|---:|---:|---:|---|
| 1×1 | 152×152 | 1440x960 | 40/12 | 3 | — | 42.1 | 计数 hero + 「今日待办」+「逾期 1」 |
| 2×2 | 328×328 | 1440x960 | 16/12 | 12 | 5（59/107/155/203/251，pitch 48） | 16.8 | 预算 5 行（`DENSITY.md:146`）→ 通过 |
| 3×2 | 504×328 | 1440x960 | 16/12 | 17 | 5 | 16.8 | 同上 |
| 3×3 | 504×504 | 1440x960 | 16/12 | 20 | **6** | **36.3** | 数据只有 6 条；预算 8 行 → 空带是“数据不足”，需 8+ 条复测 |
| 4×2 | 680×328 | 1440x960 | 16/12 | 17 | 5 | 16.8 | 与 3×2 **信息项相同（17）** → 尺寸递增不成立（P1） |

- 行节奏实测：行标题 16 / 元信息 12 / 行距 48 pitch → 与 `docs/DENSITY.md:34`、`:146-149` 一致。
- **每行 2 个元信息**：截图与 DOM 均显示「工作 / 生活」清单名 + 「今天 17:00」时间，首行还带「子任务 1/3」。`docs/components/todo.md:31-32` 明确「行内只保留一个元信息…不显示备注、标签、子任务数」，`docs/DENSITY.md:203` 也要求「最多 1 个主元信息」→ **P1 违规**（证据：`shots/cards/1440x960-dark/todo-3x2.png`、`metrics/cards/1440x960-dark-todo-3x2.json` 的 `textSample`）。

#### weather（1×1 / 2×1 / 1×2 / 2×2 / 3×2 / 3×3）

| 尺寸 | iframe | 视口 | 字号 | 文本项 | ink带% | 最大空带% | 备注 |
|---|---|---|---:|---:|---:|---:|---|
| 1×1 | 152×152 | 1440x960 | 40/40 | 1 | 34.2 | 40.8 | 图标 + 温度；identity 用 `placeholder`（`PLUGIN-CONTRACT.md:344`）→ 均分 22/22（扣内衬）**通过** |
| 2×1 | 328×152 | 1440x960 | 40/12 | 5 | 47.4 | 21.7 | 通过 |
| 1×2 | 152×328 | 1440x960 | 40/12 | 12 | 58.5 | 18.0 | 窄高卡，无横向溢出 |
| 2×2 | 328×328 | 1440x960 | 40/12 | 19 | 54.3 | 15.2 | 逐时 4 列（`docs/components/weather.md:54`） |
| 3×2 | 504×328 | 1440x960 | 40/12 | 30 | 60.4 | 10.7 | 三带式；1024 下 30 项、带 64.3%、空带 8.1% → 降级正常（`weather.md:81-83`） |
| 3×3 | 504×504 | 1440x960 | 40/12 | 53 | 57.9 | 9.9 | 信息最密的一档 |

#### appleMusic（2×1 / 3×2 / 4×2）

| 尺寸 | iframe | 视口 | 字号 | 文本项 | ink带% | 最大空带% | 备注 |
|---|---|---|---:|---:|---:|---:|---|
| 2×1 | 328×152 | 1440x960 | 16/12 | 2 | 43.4 | **23.0** | 「未在播放」+「打开播放器」 |
| 3×2 | 504×328 | 1440x960 | 16/12 | 3 | 33.5 | **24.1** | |
| 4×2 | 680×328 | 1440x960 | 16/12 | **3** | 33.5 | **24.1** | **与 3×2 完全相同**：多出的 176px 宽度没有被任何字段消费（`docs/DENSITY.md:70` 4×2 应“1 个主区域 + 分栏辅助 + 1 个入口”） |

- 卡片 idle 态没有 hero 数字，字号 16/12；`DENSITY.md:17` 的“hero 同字号”只约束“主数字”，媒体卡不适用 → 不判违规。
- 状态：浏览器无 SMTC，卡片三档都停在「未在播放」；播放/暂停/进度态**未验证**（§9）。

### 3.3 1×1 均分判据（`docs/DENSITY.md:20`）

| 插件 | identity 下沿 | 内容上沿 | 上留白 | 下留白 | 扣 16 内衬后 上/下 | 判定 |
|---|---:|---:|---:|---:|---|---|
| clock | 40 | 62 | 22 | 38 | 22 / 22 | 通过 |
| weather | 40 | 62 | 22 | 38 | 22 / 22 | 通过（与 `DENSITY.md:28` 一致） |
| countdown | 40 | 48 | 8 | 28 | 8 / 12 | 边界通过（Δ4） |
| pomodoro | 40 | 48 | 8 | 28 | 8 / 12 | 边界通过（Δ4） |
| sedentary | 40 | 48 | 8 | 52 | 8 / 36 | **不通过（Δ28，P2）** |
| todo | 40 | 102 | 62 | 30 | 62 / 14 | **不通过（内容压在下半区，P2）** |

> 口径说明：`docs/DENSITY.md:20` 只写“上下留白相等（±4）”，没写是否含卡片 16px 内衬；本表同时给两种算法。历史审计用的是扣除内衬的算法（表里“22 / 22”），本轮沿用该算法判通过项。

---

## 4. 面板（详情浮层）与 Apple Music large

### 4.1 L1 详情（`?view=detail`，内容区 832×632）

| 插件 | 字号档 | ≥12px | <44 控件 | 溢出 | 对比度 | 结论 |
|---|---|---|---:|---|---:|---|
| clock | 40/20/16/14/12 | 是 | 0 | 无 | 18.73 / 8.35 | 通过 |
| countdown | 20/16/14/12 | 是 | 0 | 无 | 14.55 / 6.48 | 通过 |
| pomodoro | 40/24/16/14/12 | 是 | 0 | 无 | 14.55 / 6.48 | 通过 |
| sedentary | 24/16/14/12 | 是 | 0 | 无 | 14.55 / 6.48 | 通过 |
| todo | 16/14/12 | 是 | **2**：`筛选清单 138×42`、`搜索任务 500×42` | 无 | 14.55 / 8.35 | **P1：42px 控件** |
| weather | 40/16/14/12 | 是 | 0（2 个 1×1 的 `<i>` 是装饰字形，非控件） | 无 | 18.73 / 8.35 | 通过 |

- 详情 header 常显、内容滚动、无 L3：符合 `docs/PLUGIN-CONTRACT.md:318-325` 与 `docs/DESIGN.md:76`。
- `docs/components/todo.md:52` 写的是「清单 Dropdown 140 / 搜索 Input」，实测高度 **42px**，`docs/TOKEN-MAP.md:68` 的 `TOUCH_TARGET=44` 不满足（差 2px）。

### 4.2 L2 子页（push/pop）

| 插件 | L2 入口 | push | pop | <44 控件 |
|---|---|---|---:|---|
| clock | 「添加城市」 | 250ms decelerateMid + 48px | 200ms accelerateMid | 1 |
| countdown | 「添加倒数日」 | 250ms + 48px | 200ms | 2 |
| todo | 「添加任务」 | 250ms + 48px（另有列表项 200ms/8px） | 200ms | **13（表单/工具栏控件，与 P1-1 同源）** |
| pomodoro | 「任务」 | 250ms + 48px | — | 1 |
| sedentary | 「设置…」 | 200ms 淡入/4px（走的是详情分区，不是 L2 push） | — | 0 |
| weather | 「北京」 | 打开城市菜单（400ms 淡入），不是 L2 | — | 4 |

- L2 方向：push 从右 48px 进、pop 向右 48px 出（`docs/MOTION.md:87-89`）→ 方向语义正确（“从哪来、回哪去”，`APPLE-HIG.md:135`）。
- **todo L2 表单一屏 13 个 <44 控件**：这是 42px 控件问题在表单里的集中体现（Input/Dropdown/DatePicker 都是 Fluent 默认 32 + 包装 42）。建议统一 `min-height:44`（或 `TOUCH_TARGET_CSS`）。

### 4.3 Apple Music large 面板（1120×760 → 内容区 1072×712）

- 实测状态：**错误态**「连接中断 / 刷新 / 打不开播放器」（浏览器无 SMTC 会话）→ 见 `shots/panels/appleMusic-large.png`。
- 字号 16/14，文本项 3，无溢出、无 <44 控件；居中空态块在 1072×712 里留白极大（约 60% 空白），但对“单错误态”可接受。
- 「打不开播放器」按钮是**实心 danger 填充**；`docs/PLUGIN-CONTRACT.md:450` 规定「空态主操作一律 secondary/subtle；实心 primary 只属于正在进行的动作」。错误态用 danger 实心属于**未登记的偏离**（P2，需在 D-52 例外里补登记或改 secondary+danger 文本）。
- 「打不开播放器」5 字文案已由 `docs/PLUGIN-CONTRACT.md:434`（D-52）登记为已接受例外 → 不判违规。
- 正在播放 / 播放列表 / L2 / 未运行 / 连接中 / 登录 六态**未验证**（依赖 Tauri + 受管 Edge + SMTC）。

---

## 5. 宿主桌面、设置页、Agent

### 5.1 桌面默认构图（1440×960，暗色）

| 卡片 | rect | 档位 | 期望（cell 164 / gap 12） |
|---|---|---|---|
| weather | (22,46) 516×340 | 3×2 | ✓ |
| clock | (902,46) 516×340 | 3×2 | ✓ |
| todo | (22,398) 516×516 | 3×3 | ✓ |
| pomodoro | (550,398) 516×340 | 3×2 | ✓（550 = 22+3×176） |
| countdown | (1078,398) 340×340 | 2×2 | ✓（1078 = 22+6×176） |
| sedentary | (902,750) 340×164 | 2×1 | ✓（750 = 46+4×176） |
| Agent 入口 | (1362,858) 56×56 | — | ✓ 右下保留格（`DENSITY.md:36`） |

- 网格原点 y=46 而非 27：浏览器预览下 `H_p=0`（无说明条、无状态栏）→ 与 `docs/TOKEN-MAP.md:44-49` 的 `H_p=0` 分支一致，**不是缺陷**。
- 状态栏/快速设置：浏览器下不渲染（`StatusBar.tsx:381/728`）→ 见 §9 未验证。
- 壁纸未加载（`wallpaper:false`），卡片材质在纯色背景下测量：72% 中性面 + 描边可见（截图中卡片边界清楚）。

### 5.2 设置页（6 个分区 + 7 个插件 schema）

| 分区 | 字号档 | <12px | <44 控件 |
|---|---|---|---|
| 常规 | 28/20/16/14/12 | 0 | **3**：`语音输入压低到 160×42`、`朗读时压低到 160×42`、`两个音源同时播放 194×42` |
| 外观 | 28/20/16/14/12 | 0 | 0 |
| 快捷键 | 28/20/16/14/12 | 0 | 0 |
| Agent | 28/20/16/14/12 | 0 | **1**：`空闲自动收回 168×42` |
| 插件（schema） | 28/20/16/14/12 | 0 | 4–9 个/分区（同上 Dropdown 42px 类） |
| 关于 | 28/20/16/14/12 | 0 | 0 |

- **P1：Dropdown 类控件 42px 高**，共 4 个已定位 + 插件 schema 里同类若干。`docs/DESIGN.md:46`、`docs/TOKEN-MAP.md:68`、`docs/FLUENT2.md:144` 都要求 ≥44。
- schema 渲染结构正常：分组标题（`Text` 16/20）+ 行标签 14 + 控件；无 `<12px`、无裁切、无溢出。

### 5.3 Agent 入口与浮层

- 入口 56×56 @ (1362,858) ✓；点击后出现容器 morph（实测 `DialogSurface` 的 `radius/shadow/transform 250ms`，起点为右下小矩形）。
- 但 Agent 自身三段 morph 用 200ms（§2.3 M-P0-1）。**入口按钮在浏览器下的 `aria-label` 可能已是「关闭 Agent」**（本次采集中命中该标签），说明同一按钮承担开/关两种语义——符合“原路收回”的意图，但需要在真机复核标签切换时序（未验证）。

### 5.4 键盘焦点（`metrics/states/focus-empty.json`、`shots/host/focus-tab.png`）

按 Tab 6 次的落点（暗色 / 1440×960）：

| 步骤 | activeElement | rect | 是否卡内 | focus-visible | 焦点环（计算样式） |
|---|---|---|---|---|---|
| 1 | `IFRAME` `aria-label="sedentary (background)"` | **(-10000, 0) 1×1** | 否 | false | `outline: rgb(255,255,255) none 3px` |
| 2 | `DIV` `天气 小组件` | (22,46) 516×340 | 是 | true | 无 outline；靠 1px 边框变色 |
| 3 | `DIV` `时钟 小组件` | (902,46) 516×340 | 是 | true | 同上 |
| 4 | `DIV` `待办 小组件` | (22,398) 516×516 | 是 | true | 同上 |
| 5 | `DIV` `番茄钟 小组件` | (550,398) 516×340 | 是 | true | 同上 |
| 6 | `DIV` `倒数日 小组件` | (1078,398) 340×340 | 是 | true | 同上（截图中可见 1px 白色描边） |

- **P1-6：后台 iframe 抢焦点**。第 1 个 Tab 落在 `sedentary (background)` 的离屏 1×1 iframe 上（x=-10000），用户按 Tab 的第一下“焦点消失”，要到第 2 下才进到第一张卡。违反 `docs/reference/fluent-design/accessibility.md:20`（焦点不应“丢失”，应 z 字顺序）与 `docs/DESIGN.md:78-81`（Tab 在小组件之间移动）。修法：后台 iframe 加 `tabindex="-1"` + `aria-hidden="true"`（或 `inert`），并把它移出 Tab 序。
- **P1-6 附带 i18n**：`aria-label="sedentary (background)"` 是英文串，中文界面下读屏会念英文；`docs/FLUENT2.md:157`（中文界面短句）与 `docs/PLUGIN-CONTRACT.md:452`（语义落到中文 aria-label）不一致。
- **P2-7：焦点环只有 1px**。实测卡片 focus 态无 `outline`，可见描边为 1px 白（暗色下 `colorStrokeFocus2` 的值），而 `docs/FLUENT2.md:117`（D-41）登记的是 **2px `colorStrokeFocus2`**，`docs/DESIGN.md:170` 要求“用 Fluent 默认焦点样式，不覆写”。建议改用 Fluent 的 focus indicator（2px `colorStrokeFocus2` + 1px 内描边）而不是改卡片 border。

### 5.5 空态（`metrics/states/focus-empty.json`、`shots/states/*`）

| 插件 | 3×2 空态 | `[data-empty-state]` | 图标槽 | 动作按钮 | ink 带 |
|---|---|---|---:|---|---:|
| countdown | 「还没有倒数日 / 添加事件」 | 有，`align=start` | 24 | 44 高 | 33.5% |
| todo | 「还没有待办 / 添加待办」 | 有，`align=start` | 24 | 44 高 | 33.5% |
| weather | 「还没有城市 / 添加城市」 | 有，`align=start` | 24 | 44 高 | 33.5% |
| clock | 「没有世界时钟 / 添加城市」 | **无**（自绘子空态） | 无图标 | 44 高 | 22% |
| pomodoro | 无空态（恒有 25:00 主值） | — | — | — | 51.2% |
| sedentary | 无空态（恒有状态值） | — | — | — | 48.2% |

- 三张列表/数据卡空态结构统一（中性 24 图标 + ≤6 字标题 + 44 高次操作）→ 符合 `docs/PLUGIN-CONTRACT.md:415-418`。
- **P2-8：clock 的「没有世界时钟」是自绘子空态**，没有 24px 中性图标槽，与另外三张卡的空态观感不一致（`docs/PLUGIN-CONTRACT.md:369-370` 的“不得复制实现”只约束同类结构，这里属观感一致性）。建议复用 `EmptyState`（`compact` 或去图标两选一，但六张卡要统一）。

---

## 6. 跨插件一致性问题

1. **identity 行**：6 张卡都渲染 24px identity 行，20px 图标 + 12px 组件名（1×1 只留图标，weather 1×1 用 `placeholder`）→ 与 `docs/DESIGN.md:47-49`、`docs/PLUGIN-CONTRACT.md:344` 一致。
2. **hero 字阶**：6 个数值卡全档 40/52；列表卡 16/12（todo/countdown）→ 符合 Equal Except Hue v2（`docs/DENSITY.md:17`）。唯一不一致：**appleMusic 无 hero**（媒体卡，不违规）与 **weather 1×1 无 12px 元信息**（`compact`，符合规格）。
3. **信息预算/空带**：todo 行 2 个元信息（P1）、appleMusic 3×2/4×2 无增长（P1）、countdown 2×1 空带 34.2%（P1）、sedentary/todo 1×1 不均分（P2）。
4. **44 触控**：卡片内 0 违规；详情/设置 6 类控件 42px（P1）。
5. **行节奏**：todo 行高 44 + pitch 48 ✓；countdown 行 pitch 48 ✓；weather 逐时列宽 1440 下 72 / 1024 下 67 ✓（`docs/components/weather.md:77-79`）。
6. **材质/描边**：卡片圆角 12、`shadow4`、1px 描边，hover `shadow8` + 描边变亮 → 实测 `box-shadow 100ms` 与描边 transition 同步，符合 `docs/FLUENT2.md:116-118`。
7. **文案**：卡片可见文案均为名词/数字/单位，无“说明句”；空态为「还没有城市 / 还没有待办」+ 一个动作按钮 → 符合 `docs/PLUGIN-CONTRACT.md:420-432`。
8. **焦点/无障碍**：Dialog 关闭后焦点回卡（实测 `activeElement = DIV|时钟 小组件`）；Tab 依次落到 6 张卡（roving focus 生效）。缺口有两处：**第一个 Tab 落在离屏后台 iframe**（§5.4，P1-6），卡片焦点环只有 1px 白描边（§5.4，P2-7）；详情内 `<44` 控件是第三处。
9. **状态转换**：空态↔内容、加载、错误三态在插件侧都有结构；宿主侧**缺加载态**（P0-2）。

---

## 7. 问题清单（按优先级）

### P0（2）

| ID | 问题 | 证据 | 建议 |
|---|---|---|---|
| **P0-1** | 首屏 6 张卡纯白（t=300ms 全白，t=1.5s 才暗），无骨架/Spinner；番茄钟正文 4s 才出 | `metrics/host/load-state.json`、`shots/host/load-t300.png`；`wait-ux.md:12,27`、`FLUENT2.md:163-173`、`MOTION.md:166` | 插件 `index.html` 内联首帧 `html,body{background:transparent;color-scheme:light dark}`；宿主 >1s 出 Skeleton/Spinner + 「正在加载…」 |
| **P0-2** | Agent 三段 morph 五条路径全用 200ms，`MOTION.md §5.1` 登记为 300/300/250/200/250 | `src/host/agent/ui/AgentSurface.tsx:127-157`；`docs/MOTION.md:108-112`；`durations.js` | 改回 300/300/250/200/250（`durationSlow/Gentle/Fast`）；或在 `DECISIONS.md` 登记 200ms 并同步改 MOTION |

### P1（6）

| ID | 问题 | 证据 | 建议 |
|---|---|---|---|
| **P1-1** | 设置页 4 个 Dropdown + 待办详情 2 个工具栏控件高 **42px** < 44；todo L2 表单 12 个同类 | `metrics/host/settings.json`、`metrics/panels/panels.json`；`TOKEN-MAP.md:68`、`DESIGN.md:46`、`FLUENT2.md:144` | 统一 `min-height: TOUCH_TARGET_CSS`（44）；Fluent `size="large"` 或 wrapper 补偿 |
| **P1-2** | todo 卡片每行 **2 个元信息**（清单名 + 时间），首行还带「子任务 1/3」 | `shots/cards/1440x960-dark/todo-3x2.png`、`todo-3x2.json`；`components/todo.md:31-32`、`DENSITY.md:203` | 行内只留 1 个主元信息（逾期/时间/优先级之一），清单名进详情或 identity trailing |
| **P1-3** | appleMusic 3×2 与 4×2 信息项完全相同（3 项），4×2 的 176px 宽度未消费 | `metrics/cards/1440x960-dark-appleMusic-4x2.json` vs `-3x2.json`；`DENSITY.md:70`、`:104` | 4×2 增加分栏字段（如专辑/播放列表/时长）或干脆不声明 4×2 |
| **P1-4** | countdown 2×1 底部空带 **34.2%**（52px / 152），2×2/3×2 在 1024 下 22.1% 边界 | `_analysis.json` → `gapOver22`；`DENSITY.md:106` | hero 与标题改为上下居中/或补第二行辅助信息（如日期），把空带压回 ≤22% |
| **P1-5** | 卡片 hover/press 文档自相矛盾：实现 1.02/0.98，`DESIGN.md:44` 与 `MOTION.md:235` 写 1.015/0.985 | `src/host/design/metrics.ts:37-38`；`docs/MOTION.md:42,44,49` vs `:235`；`docs/DESIGN.md:44` | 以 §2 表 + metrics 为准，修正 `MOTION.md:235`、`DESIGN.md:44`（纯文档改动） |
| **P1-6** | 键盘第一个 Tab 落在离屏后台 iframe（`sedentary (background)`，1×1 @ x=-10000），焦点“消失”一次；且该 `aria-label` 是英文 | `metrics/states/focus-empty.json` → `focus[0]`；`shots/host/focus-tab.png`；`accessibility.md:20`、`DESIGN.md:78-81` | 后台 iframe 加 `tabindex="-1"` + `aria-hidden`/`inert`；`aria-label` 改中文（「久坐提醒（后台）」） |

### P2（8）

| ID | 问题 | 证据 |
|---|---|---|
| P2-1 | sedentary 1×1 内容偏上（扣内衬 8/36，Δ28）；todo 1×1 内容偏下（62/14） | `_analysis.json` → `oneByOne`；`shots/cards/*/sedentary-1x1.png`、`todo-1x1.png` |
| P2-2 | pomodoro 2×2 @1024 有 1 处**非省略裁切**（双主题） | `metrics/cards/1024x768-dark-pomodoro-2x2.json` → `clipped[]`（`ellipsis:false`） |
| P2-3 | appleMusic 2×1 空带 23.0%、3×2/4×2 24.1% | `_analysis.json` → `gapOver22` |
| P2-4 | todo 3×3 空带 36.3%、countdown 3×3 23.8%：演示数据 6/7 条 < 预算 8 行，需 ≥8 条复测 | `_analysis.json`；`DENSITY.md:148,153` |
| P2-5 | HeroProgress 时长两处文档互斥（100 vs 200ms） | `PLUGIN-CONTRACT.md:340` vs `MOTION.md:162` |
| P2-6 | Apple Music 错误态用实心 danger 按钮，未登记例外 | `shots/panels/appleMusic-large.png`；`PLUGIN-CONTRACT.md:450`、`:434` |
| P2-7 | 卡片焦点环实测只有 1px 白描边（改 border 实现），D-41 登记 2px `colorStrokeFocus2`；`DESIGN.md:170` 要求不覆写 Fluent 焦点态 | `metrics/states/focus-empty.json` → `focus[1..5]`、`shots/host/focus-tab.png`；`FLUENT2.md:117` |
| P2-8 | clock 的「没有世界时钟」是自绘子空态，无 24px 中性图标槽，与 countdown/todo/weather 的 `EmptyState` 观感不一致 | `metrics/states/focus-empty.json` → `empty[clock]`；`shots/states/clock-empty-3x2.png` |

---

## 8. 已接受例外（引用历史审计，本轮不推翻）

| 例外 | 出处 | 本轮复核 |
|---|---|---|
| 3×3 空态空带 31–33%（结构性例外） | `docs/DENSITY.md:39-59`、`PLUGIN-CONTRACT.md:417` | 未触发（本轮 3×3 有数据）；保留 |
| static identity 行（24px）不计入信息预算 | `docs/FLUENT2.md:196`（D-33）、`DESIGN.md:47-49` | 通过，6/6 卡有 |
| 桌面表面缩放 1.02/0.98/0.97 为项目 C 值 | `docs/TOKEN-MAP.md:245`、`MOTION.md:49` | 实现一致 |
| 72% 中性面 + blur 24 材质 | `docs/FLUENT2.md:108-118`（D-31/D-41） | 壁纸缺失，仅验证纯色下的描边/阴影 |
| 天气图标用和风 SVG | `docs/FLUENT2.md:146`、`DESIGN.md:169` | 天气 6 档图标均正常渲染 |
| Apple Music 三动作文案 >4 字 | `docs/PLUGIN-CONTRACT.md:434`（D-52） | 「打开播放器 / 打不开播放器」不判违规 |
| Agent reduced-motion 120ms | `docs/TOKEN-MAP.md:159`（D-35） | 未触发（本轮只测到宿主 reduced-motion） |
| 单值卡 1×1 不套 22% 空带 | `docs/audits/round2-type-visual/REWRITE-RESULT.md:43` | 沿用；1×1 改用均分判据 |
| 计时器 2×1 允许两端分布（横向空洞例外） | `docs/DENSITY.md:120-131` | pomodoro/sedentary 2×1 未判横向空洞 |

---

## 9. 未验证项（依赖真机/运行时，不做假设）

1. **真机 WebView2 下的帧率与流畅度**：headless `--disable-gpu` + 6 iframe 只有 4–9 帧/1.2s；真实 DPI 200% 与合成器表现未测。
2. **状态栏 + 快速设置面板 morph（250/150ms）**：`StatusBar.tsx:381/728` 仅在 Tauri 运行时渲染，浏览器预览下不存在；代码与文档一致（`MOTION.md:143-148`），**行为未验证**。
3. **壁纸材质**：无外网 → 壁纸未加载；72% 中性面在照片上的对比度、模糊观感未验证。
4. **Apple Music 六态**：正在播放 / 播放列表 / L2 / 未运行 / 连接中 / 登录 —— 需要 Tauri + 受管 Edge + SMTC；本轮只有错误态。
5. **Agent 半高↔全高形态切换的视觉效果**：只测到入口→浮层的容器 morph 与代码参数，形态切换的帧序列未抓到（Agent 在浏览器下的会话依赖宿主桥）。
6. **拖拽/改尺寸/翻页（EdgePageTurn）**：编辑态拖拽、改尺寸 200ms、翻页 300ms 的跟手与吸附未在真机验证；本轮只核对了源码参数（`WidgetCard.tsx` / `desktop.styles.ts`）。
7. **Toast/强提醒、Drawer**：未触发（无对应入口的浏览器路径）。
8. **200% DPI 截图**：本轮卡片截图 dsf=1（小图快采）；DPI 2 只用于宿主整屏抽样，未覆盖 30 组。
9. **已补测但仍有限**：键盘焦点（§5.4）只在 1440×960 暗色桌面走了 6 步 Tab，**未覆盖** 1024 断点、编辑模式下的方向键、跨 iframe 的焦点交接（宿主 → 插件第一个可聚焦元素 → Esc 回宿主）。

> 本轮补测覆盖：键盘焦点、6 个插件空态、宿主首屏加载态。**禁用态未单独取证**（未验证）。


---

## 10. 结论与最该先修的 5 件事

**一句话结论**：动效的“值”是干净的（全部走 `motionTokens`，0 处裸毫秒/曲线，reduced-motion 全覆盖），但**首帧白屏 + 无加载指示**和 **Agent morph 时长偏离登记表**这两件事，让“动效/等待体验”在真实启动路径上不合格；卡片侧 30 组尺寸的排版与字号体系整体达标，剩余是行元信息超预算、4×2 无增长、42px 控件与几处空带。

**最该先修的 5 件事**：

1. **P0-1 首帧白屏**：6 个 `public/plugins/*/index.html` 内联首帧透明背景样式；宿主补 Skeleton/Spinner 分档（>1s 出指示）。改动 7 个 html + 1 个宿主组件，收益是每次启动的第一印象。
2. **P0-2 Agent morph 时长**：`AgentSurface.tsx:127-157` 五条 `geometry` 按 `MOTION.md:108-112` 改回 300/300/250/200/250（或反向登记并改文档）。
3. **P1-1 42px 控件**：设置页 4 个 Dropdown、待办详情 2 个工具栏控件、待办 L2 表单控件统一到 44px（`TOUCH_TARGET_CSS`）。
4. **P1-2 todo 行元信息**：每行只留 1 个元信息，清单名/子任务进度移出卡片行。
5. **P1-3/P1-4 appleMusic 4×2 与 countdown 2×1**：前者补分栏字段（或删档），后者把 hero+标题居中/补一行，压回 ≤22% 空带。

> 紧随其后的第 6 件：**P1-6 键盘焦点**——后台 iframe 抢走第一个 Tab（离屏 1×1，英文 aria-label），键盘用户第一下看不到焦点。修法只要一行 `tabindex="-1"` + `aria-hidden`，性价比最高，建议与上面 5 件同批修。

---

## 11. 附：文档冲突清单（不擅自择一）

| # | 冲突 A | 冲突 B | 现状 |
|---|---|---|---|
| C1 | `docs/MOTION.md:42,44`（hover 1.02 / press 0.98） | `docs/MOTION.md:235`（验收写 1.015 / 0.985）、`docs/DESIGN.md:44`（“接住 hover 1.015”） | 实现 = 1.02/0.98（`metrics.ts:37-38`）；B 侧为旧值 |
| C2 | `docs/PLUGIN-CONTRACT.md:340`（HeroProgress 100ms） | `docs/MOTION.md:162`（进度更新 200ms `curveEasyEase`） | 实现取 200ms 档（`useMotionTransition('normal')`） |
| C3 | `docs/MOTION.md:108-112`（Agent 300/300/250/200/250） | `src/host/agent/ui/AgentSurface.tsx:122-157`（全 200ms，注释自称设计意图） | 代码偏离文档 |
| C4 | `docs/DENSITY.md:20`（1×1 均分 ±4，未写是否含 16px 内衬） | `docs/DENSITY.md:28-29`（实测 22/22，隐含扣除内衬） | 口径需在文档里写明 |
| C5 | `docs/reference/fluent-design/motion.md:56`（一级页面用纯淡入） | `docs/MOTION.md:97`（200ms + 6px 上移） | 已登记取舍，按项目规范执行 |

---

## 12. 附录 A：741 文件覆盖分布

完整逐行清单见 `.tmp/audit-round3/doc-read/MANIFEST.md`（741 行，含 `size` / `sha256:16` / `read|skip` / 理由）。

| 目录/文件 | read | skip |
|---|---:|---:|
| `fluent-ui-docs/packages/**`（组件文档/故事） | 377 | 209 |
| `fluent-ui-docs/apps/**`（概念/无障碍/主题/迁移） | 136 | 0 |
| `fluent-design/*.md`（15 篇设计语言） | 15 | 0 |
| `APPLE-HIG.md` | 1 | 0 |
| `external-services.md` | 1 | 0 |
| `README.md` | 1 | 0 |
| **合计** | **532** | **209** |

- 跳过 = `*.api.md` 147（组件 API 属性表）+ `Spec.md` 62（组件规范表，含 3 个 `SPEC.md` 大写变体）。理由：这两类是**组件 API/规范表格**，不承载本项目的 HIG/Fluent 设计判据；本轮的判定依据是 `fluent-design/*`、`APPLE-HIG.md`、`fluent-ui-docs/apps/**` 与组件用法文档。
- 批次笔记：`doc-read/batch-01.md` … `batch-24.md`，每批约 22 篇，格式为「路径 + 一句话要点 + 关键条款行号 + 关键词分组命中数」。
- 逐文件 digest：`doc-read/digest/001-*.md` … `532-*.md`（标题栈 + 首段 + 命中行）。

## 13. 附录 B：证据文件索引（便于复核）

| 结论 | 证据文件 |
|---|---|
| 动效 token 合规 | `.tmp/audit-round3/metrics/static/motion-scan.json` |
| 卡片 120 例指标 | `.tmp/audit-round3/metrics/cards/*.json`、`_summary.json`、`_analysis.{json,md}` |
| 卡片截图 | `.tmp/audit-round3/shots/cards/{1440x960,1024x768}-{dark,light}/*.png`（120 张） |
| 卡片动效 | `.tmp/audit-round3/metrics/motion/overlay-v2.json`、`shots/motion/{overlay-open-v2,overlay-close-v2}/` |
| 页面/设置/Agent 动效 | `.tmp/audit-round3/metrics/motion/shell.json` |
| 详情 L1/L2 + Apple Music | `.tmp/audit-round3/metrics/panels/panels.json`、`shots/panels/*.png` |
| 首屏白屏 | `.tmp/audit-round3/metrics/host/load-state.json`、`shots/host/load-t{300,1500,4000,9000,18000}.png` |
| 设置页 42px 控件 | `.tmp/audit-round3/metrics/host/settings.json`、`shots/host/settings-*.png` |
| 键盘焦点 / 空态 | `.tmp/audit-round3/metrics/states/focus-empty.json`、`shots/host/focus-tab.png`、`shots/states/*.png` |
| 文档覆盖 | `.tmp/audit-round3/doc-read/MANIFEST.md`、`batch-*.md`、`digest/`、`stats.json` |

---

## 14. 收尾（一句话结论 + 最该先修的 5 件事）

**一句话结论**：动效的**参数**是全仓最干净的一块（120 例 + 220 文件扫描：0 裸毫秒、0 自定义曲线、0 `transition:all`、reduced-motion 全覆盖、浮层/L2/页面的时长与曲线逐条对上登记值），但**首帧白屏无加载指示**与**Agent morph 时长偏离 `MOTION.md §5.1`** 这两件事，让真实启动路径上的“动效与等待体验”不合格；卡片侧 30 组尺寸的字号/触控/主题一致性达标，剩余问题集中在 todo 行元信息、appleMusic 4×2 无增长、42px 控件与 4 处空带。

**最该先修的 5 件事**

1. **首帧白屏（P0-1）**：`public/plugins/*/index.html` 内联首帧透明背景；宿主 >1s 出 Skeleton/Spinner。见 §2.3、`metrics/host/load-state.json`。
2. **Agent morph 时长（P0-2）**：`src/host/agent/ui/AgentSurface.tsx:127-157` 五条 `geometry` 改回 300/300/250/200/250（或反向登记并改 `docs/MOTION.md:108-112`）。
3. **42px 控件（P1-1）**：设置页 4 个 Dropdown + 待办详情 2 个工具栏控件 + 待办 L2 表单统一到 44px（P1-6 焦点陷阱可同批改）。
4. **todo 行元信息（P1-2）**：每行只留 1 个元信息，清单名与子任务进度移出卡片行。
5. **appleMusic 4×2 / countdown 2×1（P1-3、P1-4）**：前者补分栏字段或删档，后者把空带压回 ≤22%。

**紧随其后（第 6 件，建议同批）**：**P1-6 键盘焦点陷阱**——第一个 Tab 落在离屏后台 iframe（`aria-label="sedentary (background)"`，1×1 @ x=-10000），键盘用户第一下看不到焦点；修法 `tabindex="-1"` + `aria-hidden` + 中文 label，证据 `metrics/states/focus-empty.json` → `focus[0]`、`shots/host/focus-tab.png`。

**本轮覆盖自查**：`docs/reference` 741/741（读 532 + 跳过 209）；卡片 120/120 例（30 组 × 2 主题 × 2 视口）；详情 L1 6 个（clock/countdown/pomodoro/sedentary/todo/weather）+ Apple Music large 1 个 + L2 push/pop 4 次；宿主桌面 1440×960 暗色（默认构图 / 键盘焦点 6 步 / 加载态 5 个时刻）；设置页 6 分区 + 7 个插件 schema；空态 6 个插件；动效 18 项逐条判定（**15 通过 / 2 违规 / 1 部分验证**）。未验证项见 §9。

---

## 15. 实施期修正（2026-11-01，逐条复演后的口径更正）

> 修复实施时对源码、组件规范与证据 JSON 逐条复演，以下 6 条结论需要修正；**以本节为准**，§2–§7 的对应判断保留原样作为审计过程记录。实际改动与验收见 `docs/DECISIONS.md` D-57。

| # | 原结论 | 更正 | 依据 |
|---|---|---|---|
| A1 | P1-2：todo 每行 2 个元信息是违规；报告称 3×2 首行还带「子任务 1/3」 | **不是违规**。`docs/components/todo.md:41` 明确 3×2/4×2「每行多清单名」；`DENSITY §2.2` 的 4×2 行预算同为 5 行。且 3×2 证据 JSON 里没有「子任务」字样——代码只在 3×3 档渲染它。真正违规的只有 3×3 的子任务计数（`todo.md:32` 明确不显示），已删除 | 证据 `metrics/cards/1440x960-dark-todo-3x2.json` 无「子任务」；`TodoCard.jsx` 原 `TaskSecondary` 只在 `kind==='full'` 追加 |
| A2 | P1-3：appleMusic 3×2 与 4×2 信息项相同（3 项），4×2 未消费宽度 | **空态伪差，不判违规**。`Card.jsx` 的 `CARD_FIELDS` 已按档递增：4×2 = 封面 240 + 时长行，3×2 = 封面 160、无时长行；浏览器无 SMTC 会话时 `session` 为空，三档都只渲染空态。播放态字段需真机复测 | `public/plugins/appleMusic/src/Card.jsx:47-78` |
| A3 | P2-8：clock「没有世界时钟」是自绘空态，无 24px 图标槽 | **不成立**。源码就是共享 `EmptyState`（`Globe24Regular` 24 图标 + 44 高按钮）。原审计的空态脚本只改 URL `?size=`、没有补发 `host:resize`，量到的是插件默认档（clock 默认 2×1，本就没有世界时钟空态）。实施期复验：clock 3×2 空态 `[data-empty-state]` 存在、iconSlot=24、按钮 44 | `ClockApp.jsx:286-304`；实施期复验 `.tmp/fix-verify/batch2-cards.json` |
| A4 | P1-6：修法是给后台 iframe 加 `tabindex="-1"` + `aria-hidden` | **修法不成立**（两属性 2026-10-18 起就有）。真因是 Chromium 从 `body` 起的第一下顺序焦点导航会进入文档里第一个 iframe，`tabindex=-1` 拦不住。修法是给后台 iframe 加 `visibility:hidden`（实测插件定时器照跑：1.2s/7 tick） | `.tmp/fix-verify/focus.json`、`focus-fixes.json`（5 种候选对比，visibility/移到末尾有效，inert 会落进 Tabster 焦点哨兵） |
| A5 | P0-1：首屏「6 张卡纯白」 | 实测是 **4/6**（t=300ms 时 todo/countdown 已是 `rgb(34,34,34)`）；且根因不止 `base.css` 晚到——iframe 的初始 `about:blank` 在真实文档提交前就是白底；todo 插件还在 `host:init` 前误判 standalone、渲染了不透明的预览底色 | 报告自己的 `metrics/host/load-state.json` t=300 行；`todo/src/main.jsx` 原逻辑 |
| A6 | P1-1：「42px = 外层没设 44」 | 外层根已经是 44（host `styles.control`、插件 `base.css`），真正可点的内层 `button/input` 才是 42；修法要打在**内层命中元素**上，改外层无效 | 实施期 `targets-44-test.json`：root 44 / inner 42；给 inner 补 44 后 root 变 46 |

> 另：报告正文 §2.3 的 P0 编号（M-P0-1=Agent morph、M-P0-2=白屏）与 §7 起清单的编号（P0-1=白屏、P0-2=morph）互换；§10 与 §14 是同一段结论的重复。均不影响实施，D-57 用名称而非编号引用。

