# 动效详细数据与帧序列索引（Round 3）

> 配套主报告：`docs/audits/round3-widget-audit/AUDIT.md` §2（动效专章）。
> 本文只放**原始数据、口径与帧索引**，结论与优先级在主报告。

---

## 1. token 基线（实测时的对照表）

来源：`node_modules/@fluentui/tokens/lib/global/{durations,curves}.js`（与 `docs/MOTION.md:18-27` 的用途表逐条对应）。

| 用途（MOTION §1） | token | 实际值 | 曲线 token | 实际曲线 |
|---|---|---|---|---|
| 按下 | `durationUltraFast` | 50ms | `curveAccelerateMin` | `cubic-bezier(0.8,0,0.78,1)` |
| 悬停进入 | `durationFaster` | 100ms | `curveDecelerateMin` | `cubic-bezier(0.33,0,0.1,1)` |
| 悬停离开 / 微退场 | `durationFaster` | 100ms | `curveAccelerateMin` | `cubic-bezier(0.8,0,0.78,1)` |
| 退出类 | `durationFast` | 150ms | `curveAccelerateMid` | `cubic-bezier(1,0,1,1)` |
| 常规进出 | `durationNormal` | 200ms | `curveDecelerateMid` | `cubic-bezier(0,0,0,1)` |
| 浮层展开 / 大块进场 | `durationGentle` | 250ms | `curveDecelerateMid` | `cubic-bezier(0,0,0,1)` |
| 翻页落位 | `durationSlow` | 300ms | `curveDecelerateMid` | `cubic-bezier(0,0,0,1)` |
| 长按进度 | `durationUltraSlow` | 500ms | `curveLinear` | `cubic-bezier(0,0,1,1)` |
| （未登记用途） | `durationSlower` | 400ms | `curveEasyEase` | `cubic-bezier(0.33,0,0.67,1)` |
| （未登记用途） | — | — | `curveAccelerateMax` | `cubic-bezier(0.9,0.1,1,0.2)` |
| （未登记用途） | — | — | `curveDecelerateMax` | `cubic-bezier(0.1,0.9,0.2,1)` |

> 判读要点：`curveLinear` 在 Fluent v9 里是 `cubic-bezier(0,0,1,1)`，**不是** CSS 关键字 `linear`。本报告中的所有“linear”均指该 token 值。

---

## 2. 静态扫描（`metrics/static/motion-scan.json`）

范围：`src/host/**`、`public/plugins/**/src/**`、`public/plugins/_shared/**`，共 **220 个** `.ts/.tsx/.js/.jsx/.css`，**58,389 行**（排除 `public/plugins/*/app/app.js` 构建产物）。

| 检查项 | 命中 | 结论 |
|---|---:|---|
| `transition: all` / `transitionProperty: 'all'` | **0** | 通过 |
| 自定义 `cubic-bezier(...)`（非 token 变量） | **0** | 通过 |
| `ease-in-out` 字面量 | **0** | 通过 |
| 非 token 毫秒（transition/animation 语境） | **0** | 通过 |
| token 值毫秒字面量 | **1** | `public/plugins/_shared/base.css:90` `transition-duration: var(--durationUltraFast, 50ms) !important;`（CSS 变量兜底，合规） |
| 声明 `prefers-reduced-motion` 的文件 | **9** | `src/host/desktop/*`、`src/host/shell/*`、`_shared/motion.js`、`_shared/base.css` 等 |
| `motionTokens.*` 引用 | 见 `motion-scan.json` → `tokenUsage` | 宿主与插件都直接引用 token，未发现自建时长常量 |

`public/plugins/*/src/**` 里无 `ms` 字面量（逐一核对：`grep -n '\d{2,4}ms'` 的命中全部是注释）。

---

## 3. 动作 → 实测动画清单（WAAPI / CSS transition）

采集脚本：`motion-probe2.mjs`（宿主，1440×960 暗色）、`motion-shell.mjs`、`panels-l2.mjs`（插件 standalone）。
“起点 keyframe”指 `getKeyframes()[0]`，能直接看出位移/缩放的**起点**（用于验证“从哪来”）。

### 3.1 卡片表面（`metrics/motion/overlay-v2.json`）

| 动作 | 实测动画（prop / duration / easing / target） | 起点 keyframe |
|---|---|---|
| hover 进入 | `transform 100ms cubic-bezier(0.33,0,0.1,1)` · `box-shadow 100ms` · `border-*-color 100ms`（`DIV.fui-Card`） | `translate(902px,46px) scale(1)` → `scale(1.02)` |
| 按下 | `transform 50ms cubic-bezier(0.8,0,0.78,1)`（Card） | `scale(1.02)` → `scale(0.98)` |
| 长按 500ms | `transform 500ms cubic-bezier(0,0,1,1)`（Card）+ 描边 overlay `opacity 500ms` 同曲线 | `scale(1.02)` → 线性下沉 |
| 进入编辑 | `transform 200ms cubic-bezier(0,0,0,1)` → `scale(0.96)`；编辑 chrome `opacity 200ms` + `translateY(-4px) scale(0.98)` 200ms | — |
| 松手回弹 | 回 hover/rest 100ms `curveDecelerateMin`（代码 `WidgetCard.tsx:418-419`） | — |
| reduced-motion hover | `transform` 保持 `matrix(1,0,0,1,…)`；`transition 0.1s` | 无缩放 |
| reduced-motion press | `data-press="holding"`，transform 仍 1 | 无缩放 |

终态快照（同一会话）：

```
rest      matrix(1,0,0,1,902,46)        transition 0.1s
hover     matrix(1.02,0,0,1.02,902,46)  transition 0.1s  cubic-bezier(0.33,0,0.1,1)  data-hover=true
press     scale→0.98（50ms）
hold      matrix(0.96,0,0,0.96,902,46)  transition 0.2s  cubic-bezier(0,0,0,1)
contentLayer transform = none（缩放不进 iframe 内容，符合 MOTION §8）
```

### 3.2 浮层开合（`metrics/motion/overlay-v2.json`）

打开（`data-overlay-mode="container"`, `data-overlay-size="default"`）：

```
surface: transform / box-shadow / border-*-radius  250ms  cubic-bezier(0,0,0,1)   （= durationGentle + curveDecelerateMid）
card:    transform 100ms decelerateMin（回到 hover 态）
首帧 transform: matrix(0.598,0,0,0.51,616.84,-97.…)    → 起点 ≈ 卡片 rect（516/880=0.586、340/680=0.5）
终态 rect: (280,140) 880×680，radius 12px，opacity 1
```

关闭：

```
DialogBody   opacity 100ms cubic-bezier(0.8,0,0.78,1)      （内容先淡出）
DialogSurface opacity / radius / box-shadow / transform 150ms cubic-bezier(1,0,1,1)  （= durationFast + curveAccelerateMid）
backdrop      opacity 150ms cubic-bezier(1,0,1,1)
卸载时刻      t≈283ms（> 100+150ms，动画完再卸载）
焦点          document.activeElement = DIV|时钟 小组件（回来源卡片）
```

### 3.3 插件内（`metrics/panels/panels.json`）

| 动作 | 实测 | 对照 |
|---|---|---|
| clock L2 push | `waapi 250ms cubic-bezier(0,0,0,1)`，`translate: 48px → 0` | MOTION §4.1 ✓ |
| clock L2 pop | `waapi 200ms cubic-bezier(1,0,1,1)`，`translate: 0 → 48px` | MOTION §4.1 ✓ |
| countdown L2 push/pop | 同上（250 / 200，48px） | ✓ |
| todo L2 push | 250ms/48px + 列表项 `200ms 8px` + 内容 `200ms 4px` | MOTION §6 ✓ |
| todo L2 pop | 200ms/48px + 列表项 200ms/8px | ✓ |
| sedentary 详情分区 | `waapi 200ms cubic-bezier(0,0,0,1)` + `0px 4px` | MOTION §6 ✓ |
| weather 城市菜单 | `waapi 400ms cubic-bezier(0,0,0,1)` 淡入 | 400ms 不在 MOTION §1 用途表内（`durationSlower`）；需登记或改 250ms（P2，见主报告 §7 备注） |
| Fluent 控件默认 | `background-color / color / border-color 100ms cubic-bezier(0.33,0,0.67,1)`（`curveEasyEase`） | Fluent 自带，允许 |

> 注：`weather` 城市菜单的 400ms 是本轮唯一“时长不在 MOTION §1 用途表”的实测值；它来自 `_shared/motion.js` 之外的 Fluent Presence 默认（`durationSlower`），需要在文档里补一条用途或调回 `durationGentle`。

### 3.4 宿主页面 / 设置 / Agent（`metrics/motion/shell.json`）

| 动作 | 实测 | 对照 |
|---|---|---|
| 桌面 → 设置 | `waapi 200ms cubic-bezier(0,0,0,1)`，`translateY(var(--spacingVerticalSNudge))`→0（6px） | MOTION §5 ✓ |
| 返回桌面 | `waapi 200ms` 同参数（`replayKey` 重放） | ✓ |
| 设置分区切换 | `opacity 150ms` + `transform 150ms translateY(4px)` | MOTION §5 ✓ |
| Tab 指示条 | `transform 300ms cubic-bezier(0.1,0.9,0.2,1)`（`curveDecelerateMax`），Fluent Tabs 默认 | 允许（MOTION §6） |
| Agent 入口 → 浮层 | `DialogSurface` radius/shadow/transform `250ms decelerateMid`，起点为右下 56×56 小矩形 | 与 `MOTION §5.1` 的 300ms 不符（代码侧 200ms，见主报告 P0-2） |
| 空闲 1.2s 后 | `document.getAnimations()` 运行中 = **0** | 无 CPU 空转动画 ✓ |
| 时钟 | 文本 `12:51:22 → 12:51:23`，1s/次，无 CSS 动画 | ✓ |

---

## 4. 帧序列索引（`shots/motion/**`）

每目录含 `frames.json`（`{i, file, absT, relT}`，时间戳来自 `Page.screencastFrame.metadata.timestamp`）。

| 目录 | 帧数 | 覆盖动作 | 用途 |
|---|---:|---|---|
| `card-hover/` | 4 | 卡片 hover 进入（录屏） | 视觉：1.02 放大 + 阴影/描边同步 |
| `card-press/` | 1 | 卡片按下 | 视觉：按下瞬间（帧率不足，仅 1 帧） |
| `overlay-open/` | 9 | 浮层打开（第一版采样） | 与 `overlay-open-v2` 互为对照 |
| `overlay-open-v2/` | 11 | 浮层打开（配 8ms 页内采样） | 首帧矩形/起点缩放 |
| `overlay-close/` | 6 | 浮层关闭（第一版） | 卸载时刻 |
| `overlay-close-v2/` | 7 | 浮层关闭（配 8ms 页内采样） | 收回方向 + 卸载 |

单帧文件名形如 `frame-000.png`；`frames.json` 里的 `relT` 是相对首帧的毫秒数。

**帧率事实（环境，不是产品结论）**：headless `--disable-gpu` + 6 iframe 下，
`screencast` 在 1.2s 窗口里只有 4–11 帧；页内 rAF 间隔 p50 = 168–287ms（`overlay-v2.json` 的 `stats`）。
真机 WebView2 的帧率**未验证**。

---

## 5. reduced-motion 矩阵

| 场景 | 期望（MOTION §7） | 实测 | 结论 |
|---|---|---|---|
| 卡片 hover | 不做 transform，仅 100ms 颜色/描边 | transform `matrix(1,0,0,1,…)`；`transition 0.1s` | ✓ |
| 卡片按下 | 不做缩放 | `data-press="holding"`，transform 1 | ✓ |
| 长按下沉 | 不做缩放 | 由 `base.css:90` 强制 `transition-duration: 50ms` + 无 transform | ✓（静态） |
| 浮层 container transform | 只 100ms 淡入淡出，无位移/缩放 | 终态 `transform:none`；`opacity 100ms`；几何在 `opacity:0` 阶段瞬变（748×578→880×680） | ✓（不可见期变化） |
| L2 push/pop | 直接切换或 100ms 淡入淡出，无横向位移 | `SlidePage.reducedMotion` = 100ms 纯透明度（`_shared/motion.js:238-252`） | ✓（源码级） |
| 页面/分区/列表/Tab | ≤100ms 淡入 | `PageTransition` reduced 变体 100ms；`ContentTransition` 100ms | ✓（源码级） |
| 翻页跟手 | 保留 | 未测（真机） | 未验证 |
| 进度环/进度条 | 保留 Fluent 默认 | 未测（需运行中的番茄钟/进度带） | 未验证 |

---

## 6. 采样方法与被排除的伪信号

1. **不要用 `getBoundingClientRect` 判断合成层动画进度**：浮层 surface 的 morph 走 `transform`（合成层），主线程 `getBoundingClientRect` 在动画期间可能直接返回终态（本轮在 `overlay-open` 的 rect 序列里观察到“从 t=567ms 起矩形不再变化”，而 transform 值仍在推进）。因此：
   - 几何判定用 **transform 值**（`matrix` 的缩放分量）+ WAAPI keyframes；
   - 不用 rect 序列判断“是否掉帧”。
2. **不要用录屏帧率判断流畅度**：见 §4 的帧率事实。
3. **`document.getAnimations()` 会漏掉已完成/已取消的动画**：采样器每 8ms 轮询一次并去重（key = prop|duration|easing|target），可抓到 8ms 内启动的动画；对 <8ms 的动画（如 Fluent Button 的 0.01ms 颜色过渡）只能记录到 duration 值，不能还原过程。
4. **排除的伪信号**：
   - `<i>` 装饰字形被触控目标扫描误判为 1×1 控件（已按 `tag==='i' && width<=4` 过滤）；
   - `[data-edit-chrome]` / `[data-edit-backdrop]` 常驻 DOM（透明），不能用“元素存在”判断编辑态，改用 `opacity`；
   - `[data-page-index]` 在选择器里命中的是整页容器而不是指示点，页码尺寸未采信。

---

## 7. 复现命令

```powershell
node .tmp/audit-round3/tools/motion-probe2.mjs   # 卡片 + 浮层 + reduced-motion
node .tmp/audit-round3/tools/motion-shell.mjs    # 页面/分区/返回桌面/Agent
node .tmp/audit-round3/tools/panels-l2.mjs       # 详情 L1/L2 + Apple Music large
```

原始 JSON：`metrics/motion/{card-surface,overlay-v2,shell}.json`、`metrics/panels/panels.json`。
录屏帧：`shots/motion/<name>/frame-*.png` + `frames.json`。
