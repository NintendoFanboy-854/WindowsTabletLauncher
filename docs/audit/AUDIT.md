# Windows 平板桌面启动器 · UI 设计审计报告（基线）

> **审计类型**：Fluent 2 规范符合性 + 信息密度规范符合性（独立审计，非实现者自评）
> **审计基线**：`ad7ea0a`（2026-10-18 23:37:05 +08:00），审计时工作区 clean
> **审计时间**：2026-10-18 22:56 – 2026-10-19 00:1x（+08:00）
> **审计工具**：PowerShell 7 + Edge 155.0.4283.62 headless（CDP 截图）+ ripgrep 静态扫描
> **截图目录**：`shots/audit/`（本报告引用的截图均在此目录）
> **扫描原始输出**：`docs/audit/_scan-*.txt`、`docs/audit/_shots-*.log`、`docs/audit/_baseline-manifest.txt`
> **审计者立场**：只对照规范与产物；不接受"整体良好"结论；每条违规均带截图或 `文件:行` 证据。

## 0. 结论摘要

| 严重度 | 数量 | 含义 |
|---|---|---|
| **P0（阻断）** | **0** | 未发现导致功能不可用/信息不可读的阻断级缺陷 |
| **P1（应修）** | **8** | 明确违反 FLUENT2 / DENSITY 硬规则，应在发布前修复 |
| **P2（可优化）** | **15** | 有风险/体验退化/规范内部冲突，可排期修复 |
| **P3（备注）** | 3 | 个人偏好/产品决策，不计入违规 |

**最严重 3 条**

1. **桌面卡片圆角 16px**（规范要求 X-Large 12px，且代码用 `calc(borderRadiusXLarge * 2)` 自造值）——`src/host/desktop/desktop.styles.ts:11`；
2. **五款插件全部手绘控件（按钮/开关/单选/底部弹层/菜单），只有天气用了 Fluent React 组件**——违反 DESIGN §6「一律用 Fluent UI React v9…不自己画控件」，证据 `public/plugins/clock/index.html:38-77` 等；
3. **插件字号/间距体系整体脱离 token ramp**：CSS 字号 113/153（74%）、gap 113/152（74%）非 token，todo 更是 52/52、63/63 全量自定 ——`docs/audit/_scan-fontsize.txt`、`_scan-gap.txt`。

**可发布性**：**当前状态不建议发布**。P0 为 0，但 8 项 P1 中 V-01/V-03/V-04/V-05/V-06/V-07 属于"设计语言与无障碍"红线，须修复或由需求方书面豁免后方可发布（见 §7）。

---

## 1. 审计方法与环境

### 1.1 依据文档（全部通读）

- `docs/FLUENT2.md`：官方 Fluent 2 数值与落地规则（颜色/字阶/间距/圆角/阴影/材质/动效/图标/无障碍/文案/等待）。
- `docs/DENSITY.md`：尺寸信息预算、三层重要性、渐进披露、chrome on demand、逐组件审计。
- `docs/DESIGN.md`：工程约定（网格、触控 40px、插件契约、宿主 API、动效、页面）。
- `docs/components/*.md`：clock/countdown/pomodoro/sedentary/todo/weather/agent 七份组件规格。
- `references/fluentui-design/`（15 个官网设计语言页原文）与 `references/fluentui-docs/`（组件文档）抽查核对。

### 1.2 审计范围与基线

- 六个插件 × 全部声明尺寸：clock（1×1/2×1/3×2）、countdown（1×1/2×1/2×2/3×2）、pomodoro（1×1/2×1/2×2/3×2）、sedentary（1×1/2×1/2×2/3×2）、todo（1×1/2×2/3×2/3×3/4×2 + 周/月视图）、weather（1×1/2×1/2×2/3×2/4×2 + 详情/设置/亮色）。
- 宿主：桌面普通模式 + 编辑模式、设置页、复盘页、插件管理页，各 1440×960 / 1024×768 / 960×1440。
- Agent：浮层 / 常驻侧栏 / 全屏（含竖屏）/ 语音 / 设置对话框 / 联网搜索结果态。
- 通知：强提醒遮罩（Toast 无 URL 触发入口，仅静态审查，见 §1.6）。

### 1.3 截图矩阵

| 页面/组件 | URL 参数 | 分辨率 |
|---|---|---|
| 桌面普通模式 | `http://localhost:5173/` | 1440×960 / 1024×768 / 960×1440 |
| 桌面编辑模式 | `/?edit=1` | 1440×960 / 1024×768 / 960×1440 |
| 设置 / 复盘 / 插件管理 | `/?page=settings|review|plugins` | 同上三档 |
| Agent（宿主内） | `/?agent=1` | 1440×960 / 1024×768 / 960×1440 |
| Agent 场景 | `/src/host/agent/demo.html?scenario=overlay|sidebar|fullscreen|voice|settings|search` | 1440×960（全屏另加 960×1440） |
| 强提醒 | `/src/host/shell/demo.html?reminder=1` | 1440×960 / 1024×768 |
| 插件独立页 | `/plugins/<id>/index.html?size=<WxH>&demo=1`（天气 `&mock=1`，另加 `&detail=...&settings=1&theme=light`） | 1×1 180×180、2×1 360×180、2×2 360×360、3×2 540×360、3×3 540×540、4×2 720×360 |

截图统一由 headless Edge + CDP `Page.captureScreenshot` 生成（不占桌面、不抢焦点），日志见 `docs/audit/_shots-plugins2.log`、`docs/audit/_shots-host-final.log`。插件独立页采用 180px 基准卡片尺寸（3×2=540×360 等），与宿主真实卡片（1440×960 下约 166px 单元格）视觉近似，密度结论以宿主截图为主、独立页用于观察各档位裁剪。

### 1.4 判定口径

- **token 判定**：颜色/字号/间距/圆角/阴影/动效必须来自 Fluent token（`var(--color*)`、`var(--fontSize*)`、`var(--spacing*)`、`var(--borderRadius*)`、`var(--shadow*)`、`var(--duration*/--curve*)`）。数值恰好等于 ramp 值但手写的，计"值合规、未走 token"，归 P2。
- **密度判定**：按 DENSITY §2 预算表逐尺寸数 Primary / Secondary / Tertiary 项数，超预算记违规；空状态额外按 FLUENT2 §13 检查"是否给出下一步主操作"。
- **严重度**：P0=阻断（内容不可读/功能不可用）；P1=明确违反规范条款或硬规则、且影响体验一致性/无障碍；P2=规范内部冲突、体验退化、token 双源等风险项；P3=个人偏好/产品决策。
- **扫描口径**：静态扫描覆盖 `public/plugins/**`（手写 CSS/JS/HTML，排除天气构建产物 `app/app.js`、图标集、`todo/fluent-tokens.css` token 定义文件）与 `src/host/**` + `src/styles.css`；`dist/`、`node_modules/`、`references/` 不计入。

### 1.5 基线快照与代码漂移处理

- 22:56 建立 `docs/audit/_baseline-manifest.txt`（137 个源文件 SHA256 前 16 位）。
- 实现任务在审计期间持续提交，最终基线为 `ad7ea0a`（23:37）。**本报告所有判定以 `ad7ea0a` 当前文件为准**；23:37 之前的截图已全部重拍覆盖（宿主/插件/Agent/提醒共 60+ 张），静态扫描亦在最终代码上重跑（`docs/audit/_scan-*.txt` 为最终版本）。
- 与审计初期快照相比有 16 个文件变化（含 `desktop.styles.ts`、`WidgetCard.tsx`、`todo/app.css`、`pomodoro/styles.css`、`ReviewPage.tsx`、`PluginsPage.tsx` 等），变化后 token 违规计数未下降（见 §4）。

### 1.6 审计局限（如实记录）

1. **宿主亮色主题未截图**：宿主主题存于 localStorage，headless 无 URL 入口；仅验证天气插件 `?theme=light`。宿主亮色下的 token 表现靠静态 token 检查（`FluentProvider` + `tokens.*` 全覆盖）推断，标注为不确定项。
2. **Toast 无运行时截图**：`NotificationsProvider` 的 `notify` 仅由按钮触发，演示页无 URL 入口；已静态审查 `Toaster` 用法（合规），但未获得像素证据。
3. **长按菜单/详情**：倒计时长按菜单、todo ⋯ 菜单、插件设置面板中仅"番茄设置/天气设置/天气详情"有 URL 参数可截；其余按源码审查。
4. **触控目标**：headless 无真实触控，均按源码尺寸（rem×--fs、Fluent 组件 size）与截图像素测量推算。
5. **320px 宽 / 400% 缩放**：未实机截图，按 `breakpoints.ts` 几何推导（见 V-22）。
6. **插件独立页 demo 数据与宿主同源 localStorage**：宿主截图前已执行 `localStorage.clear()`；倒计时空态截图未单独保留，用宿主桌面 2×1 空态截图作证。

---

## 2. 逐组件 / 逐页面评分表

图例：**通过** / **需改**（有 P1/P2） / **待核**（无法取证）。"主要违规"列编号对应 §3。

### 2.1 宿主

| 页面 / 形态 | 尺寸 | 密度 | Fluent 2 | 主要违规 |
|---|---|---|---|---|
| 桌面 · 普通模式 | 1440×960 | 通过（卡片无 chrome） | 需改 | V-01 圆角 16px；V-06 dock 小按钮；V-11 倒计时/番茄空态与主操作缺失；V-12 久坐重复值 |
| 桌面 · 普通模式 | 1024×768 | 通过 | 需改 | 同上；V-09 天气留白 |
| 桌面 · 普通模式 | 960×1440 | 通过 | 需改 | 同上 |
| 桌面 · 编辑模式 | 1440×960 | 通过 | 需改 | V-13 chrome 压住插件首行；V-06 编辑按钮 24px |
| 设置页 | 1440/1024/960 | 通过 | 通过 | V-06 纵向 Tab 行高约 33px；V-17 关于页出现路由实现细节 |
| 复盘页 | 1440/1024/960 | 通过 | 通过 | V-21 空状态双刷新入口；页面卡片圆角 6px（V-02） |
| 插件管理页 | 1440/1024/960 | 通过 | 通过 | V-15 表格行线；操作列只有禁用"删除" |
| Agent · 浮层 | 420px @1440/1024/960 | 通过 | 需改 | V-06 头部 32px 图标按钮；V-15 头部/来源分割线；V-16 来源重复；V-17 文案 |
| Agent · 常驻侧栏 | 1440 | 通过 | 需改 | 同上；V-22 窄屏降级判定 |
| Agent · 全屏 | 1440 / 960×1440 | 通过 | 需改 | 同上 |
| Agent · 语音 | 1440×960 | 通过（一句话主区 + 波形 + 单个大按钮） | 通过（自绘波形/圆形麦克风为内容图形；头部图标按钮 32px 计入 V-06） | V-06；语音页为演示态文案，产品页无 Mock 字样 |
| 强提醒遮罩 | 1440×960 / 1024×768 | 通过（标题 + 一句说明 + 2 按钮） | 需改 | V-06 按钮 32px；V-19 覆写 `shadow64` 并额外加 1px 边框（`ReminderDialog.tsx:40-42`） |
| 通知 Toast | — | 静态通过 | 静态通过 | 无运行时截图（局限 2） |

### 2.2 六插件

| 组件 | 尺寸 | 密度 | Fluent 2 | 主要违规 |
|---|---|---|---|---|
| clock | 1×1 | 通过 | 需改 | 字号 clamp 基准非 ramp（V-04） |
| clock | 2×1 | 通过 | 需改 | 秒数字号/基点非 ramp（V-04） |
| clock | 3×2 | 通过 | 需改 | 同上 |
| countdown | 1×1 | 通过 | 需改 | V-04；品牌色大胶囊与列表视觉不一致（P3） |
| countdown | 2×1 | 通过 | 需改 | V-04；空态无添加入口（V-11） |
| countdown | 2×2 | 通过（4 行） | 需改 | V-04；行字号非 ramp |
| countdown | 3×2 | 通过（5 行 + 1 动作） | 需改 | V-04、V-05 |
| pomodoro | 1×1 | 通过 | 需改 | V-04、V-05 |
| pomodoro | 2×1 | 通过 | 需改 | 无可见主操作（V-11） |
| pomodoro | 2×2 | 通过 | 需改 | V-04；自绘按钮/菜单（V-03） |
| pomodoro | 3×2 | 通过（时间+任务+主按钮+⋯） | 需改 | V-03、V-04、V-05 |
| sedentary | 1×1 | 通过 | 需改 | V-04 |
| sedentary | 2×1 | 通过 | 需改 | 数值重复（V-12）；自绘开关（V-03） |
| sedentary | 2×2 | 通过（4 项） | 需改 | V-12、V-03；自定义状态光晕（V-19） |
| sedentary | 3×2 | 通过（仅值+打卡） | 需改 | 大面积留白（V-12） |
| todo | 1×1 | 通过 | 需改 | V-04（52/52 字号非 token） |
| todo | 2×2 | **需改** | 需改 | **8 条任务超 2–4 预算（V-08）**；行高 26–30px（V-06） |
| todo | 3×2 | **需改** | 需改 | **8 条任务超 4–6 预算（V-08）**；V-06 |
| todo | 3×3 | 通过（工具条已收敛为 2 切换+搜索+⋯） | 需改 | 空态 6 个文本元素（V-11）；V-04 |
| todo | 4×2 | 通过（双栏） | 需改 | 已完成列底部裁切（V-08 备注）；V-04 |
| todo 周/月视图 | 3×3 | 需改 | 需改 | 单元格 8–9px 文字、3–4 条摘要/格、标题截断（V-09 备注） |
| weather | 1×1 | 通过（+预警三角，可接受） | 需改 | V-10 预警图标超 1×1 预算 |
| weather | 2×1 | 通过（组件规范允许预警条） | 需改 | V-09 |
| weather | 2×2 | **需改** | 需改 | 6 条逐时超 2–4 预算（V-09，规范冲突） |
| weather | 3×2 | 通过（7 天仅星期/图标/高温） | 需改 | 大块留白（V-09）；V-10 自绘预警条 |
| weather | 4×2 | 需改 | 需改 | AQI"良"被裁切、7 天高低双行超预算（V-09） |
| weather 详情/设置 | 720×360 / 540×360 | 通过（详情进 Drawer） | 需改 | 设置文案含实现细节（V-17）；控件 32px（V-06） |

---

## 3. 违规清单

> 证据格式：截图路径（相对仓库）或 `文件:行`。行号以 `ad7ea0a` 为准。

### 3.1 P0（阻断）

无。

### 3.2 P1（应修，发布前必须处理或书面豁免）

| 编号 | 规范条款 | 证据 | 问题 | 建议修法 |
|---|---|---|---|---|
| **V-01** | FLUENT2 §5「卡片：X-Large 12px；不允许规范外圆角」 | `src/host/desktop/desktop.styles.ts:10-11`：`/** 卡片圆角：Fluent 的 borderRadiusXLarge 是 8px，平板卡片取它的 2 倍（16px） */` + `calc(${tokens.borderRadiusXLarge} * 2)`；截图 `shots/audit/host-desktop-1440x960.png` 六张卡片圆角明显大于 12px | 桌面卡片实际圆角 16px，偏离规范 12px，且用 calc 自造 token 之外数值 | 改为 8/12px 规范值之一（按 §5 取 12px），移除 `*2` 计算 |
| **V-02** | FLUENT2 §5 圆角 token 表；DENSITY §2「用 token 层级」 | 规范表写 Large 8px / X-Large 12px，但 Fluent v9 token 实际为 Large 6px / X-Large 8px（`desktop.styles.ts:10` 注释自证）；页面卡片用 `tokens.borderRadiusLarge`（`ReviewPage.tsx:60`、`PluginsPage.tsx:106`）=6px；提醒对话框覆写 `tokens.borderRadiusXLarge`（`ReminderDialog.tsx:40`）=8px | 规范文档与组件 token 值不一致，导致同一产品出现 16/6/8px 三套卡片圆角 | 先修正 FLUENT2 §5 的数值映射（或在项目 token 层定义 `--wtsl-card-radius: 12px`），再统一桌面/页面/弹层三处卡片圆角 |
| **V-03** | DESIGN §6「组件一律用 Fluent UI React v9 的 Button、Card、Dialog、Drawer…；不自己画控件」；FLUENT2 §1「不用自造控件」 | 手绘控件证据：`public/plugins/clock/index.html:38-77`（自绘 switch/radio 结构）、`clock/styles.css:297-330`（`.icon-btn`/`.switch-track` 自绘）；`pomodoro/index.html:105-174` 自绘设置 sheet；`countdown/index.html:60-158` 自绘表单/确认弹层；`sedentary/index.html:89-160` 自绘设置 sheet；`todo/app.css` 全量自绘。仅 weather 使用 Fluent React（`public/plugins/weather/src/components/SettingsDialog.jsx`，含 Fluent `Dialog/Input/Switch`）。截图对照：`p-weather-settings.png`（Fluent 观感）vs `p-pomodoro-settings.png`（自绘观感） | 5/6 插件自造 Fluent 控件的替代品，状态/hover/pressed/focus/材质/圆角由各插件各自实现，长期无法与 Fluent 版本同步 | 统一用 Fluent React 构建（weather 已有 `build.mjs` 先例）；过渡期至少把按钮/开关/单选/弹层换成 `@fluentui/react-components`，并在 DESIGN 中登记豁免 |
| **V-04** | FLUENT2 §3「组件内字号只取 type ramp（10/12/14/16/20/24/28/32/40/68）；Primary 允许 clamp 缩放但基准参照 ramp」 | 扫描 `docs/audit/_scan-fontsize.txt`：非 token 113/153（74%）。逐文件：clock 11/17、countdown 17/28、pomodoro 15/27、sedentary 15/26、todo 52/52、`src/styles.css` 3/3。典型：`clock/styles.css:229-288`（`clamp(11px,2.9vmin,20px)` 等非 ramp 端点）；`pomodoro/styles.css:365`（`clamp(12px,3.2vmin,16px)`）；`todo/app.css:24`（`font-size: var(--fs,13px)`）+ `todo/js/app.js:214` 按卡片尺寸把根字号连续缩放到 10.5–16.5px，全部 rem 字号随之连续变化（`todo/app.css:146-2153` 52 处 rem/em） | 插件字号不落在 type ramp 上；todo 甚至用连续缩放字号，等同放弃字阶体系 | 把字号改为 `var(--fontSizeBase*)`，Primary 的 clamp 端点取 ramp 值；todo 放弃 rem 全量缩放，按尺寸档位切 ramp 字号 |
| **V-05** | FLUENT2 §4「只用 spacing token（2/4/6/8/10/12/16/20/24/32/40/48）」；DENSITY §2「分组用 spacing token 留白」 | 扫描 `docs/audit/_scan-gap.txt` / `_scan-padding.txt` / `_scan-margin.txt`：gap 非 token 113/152、padding 101/124、margin 42/53。典型：`todo/app.css:75`（`padding: 0.75rem 0.95rem`）、`:347/:370`（`min-height: 2.5rem/2.25rem`）、`:665-680`；`sedentary/styles.css` gap 21/32；`countdown/styles.css` gap 14/26；`src/styles.css:49-59`（26px 标题栏高度、12px padding 等手写值） | 间距使用 rem/px 任意值（如 0.3rem=4.8px、0.4rem=6.4px、0.95rem=15.2px），不在 4px ramp 上，跨尺寸无法保持节奏 | 改用 `var(--spacingHorizontal*)`/`var(--spacingVertical*)`；需要缩放时用 ramp 端点 clamp |
| **V-06** | FLUENT2 §9「交互目标 ≥40×40」；DESIGN §1.2「触控目标不小于 40×40 CSS px」 | ① 桌面 dock：`src/host/App.tsx:149-159` 四个 `size="small"` 按钮（Fluent small 高 24px），截图 `host-desktop-1440x960.png` 右下角；② 编辑模式：`WidgetCard.tsx:211/225/249` 三个 `size="small"` 图标按钮，截图 `host-desktop-edit-1440x960.png` 卡片右上；③ Agent 头部：`ConversationPane.tsx:135-239` 五个默认 medium 图标按钮（Fluent medium 32px），截图 `agent-demo-overlay-1440x960.png`；④ Agent 设置对话框：`SettingsDialog.tsx:146-325` 的输入框/开关/下拉均为 Fluent 默认 32px 高（截图 `agent-demo-settings-1440x960.png`）；⑤ 设置页纵向 Tab：截图像素测量行高约 33px（`host-settings-1024x768.png` 导航项 y=116/149/181/215/248/282）；⑥ todo 任务行：`todo/app.css:347/370`（2.5rem/2.25rem，按 `--fs` 10.5–16.5px 换算约 26–36px），截图 `p-todo-2x2.png` 8 行/360px 高；⑦ todo 周/月视图日历格约 33px 高、内文 8–9px（`p-todo-week-3x3.png`、`p-todo-month-3x3.png`） | 平板触控场景下大量主操作目标低于 40×40，误触率高 | 宿主 chrome 统一 `size="large"`（40px）或加 `minHeight:40/minWidth:40`；Tab 用 `size="large"`；表单控件统一 40px 高；todo 行高与日历格改为 ≥40px（或降低单屏条数） |
| **V-07** | DESIGN §7「页面切换用 Fluent 减速曲线…不允许自定义」；FLUENT2 §8「Enter/Exit 用 createPresenceComponent」 | `src/host/shell/PageTransition.tsx:8-16` 用 `createMotionComponent` 直接包页面；`App.tsx:133` `<PageTransition key={page}>{content}</PageTransition>`。运行日志 `docs/audit/_shots-host-final.log` 每次页面加载均报：`@fluentui/react-motion: Invalid child element. Motion factories require a single child element...`；另有 `Keyborg instance ... disposed incorrectly`（切页焦点管理库告警） | 页面切换动效实际不生效（退化/报错），motion 用法错误；焦点管理库在页面卸载时异常 | 用 `createPresenceComponent`/`createMotionComponent` 的 motion slot 规范包裹单个元素（或对 div 套用 className），并修正 Keyborg 卸载顺序；验收以控制台零报错为准 |
| **V-08** | DENSITY 硬规则 1「每个尺寸有信息预算，超预算必须降级」；DENSITY §2 预算表（2×2 允许 2–4 项、3×2 允许 4–6 项） | 截图 `p-todo-2x2.png`：2×2 内渲染 **8 条**任务；`p-todo-3x2.png`：3×2 内渲染 **8 条**任务；`host-desktop-1440x960.png` 3×3 空态另行；`p-todo-4x2.png` 已完成列在第 10 行处被裁切（无滚动提示） | todo 2×2/3×2 任务条数超预算 2–4 倍，列表行高被压到 26–30px（同时触发 V-06） | 2×2 限 4 条、3×2 限 6 条，其余进"查看全部"；4×2 已完成列加内部滚动与计数 |

### 3.3 P2（可优化 / 风险项）

| 编号 | 规范条款 | 证据 | 问题 | 建议修法 |
|---|---|---|---|---|
| **V-09** | DENSITY 预算表；DENSITY §4 weather「3×2 的 7 天每天只留星期/图标/高温」 | `p-weather-2x2.png`（6 条逐时 = 18 个信息项）、`p-weather-3x2.png`（当前与 7 天之间约 90px 空带）、`p-weather-4x2.png`（AQI 环下"良"字被裁切；7 天同时给高/低温）、`host-desktop-1440x960.png` 天气卡中部大块留白 | 组件规范（2×2 六小时逐时、4×2 7 天+AQI）与 DENSITY 预算表冲突；4×2 存在裁切；3×2/4×2 空间利用差 | 由需求方裁定优先规范：要么修订 DENSITY 预算表（明确"7 天/6 小时属于内容列表，不计入 Secondary"），要么削减小时数/行数；修 AQI 环底部裁切与竖向留白 |
| **V-10** | FLUENT2 §6「弹层/菜单/遮罩用 Fluent 组件自带材质」；§10 语义色；DENSITY weather「预警条只在有预警时出现」 | `p-weather-2x1.png` / `p-weather-2x2.png` / `p-weather-3x2.png` 顶部预警条为自绘蓝色横幅（非 Fluent MessageBar）；`p-weather-1x1.png` 右上角额外预警三角图标 | 预警条自绘、无展开详情入口指示；1×1 出现第 3 个信息元素（超 1×1 预算） | 用 Fluent `MessageBar`（intent=warning）或 Fluent `Badge`；1×1 把预警并入图标语义即可，不加独立图标 |
| **V-11** | FLUENT2 §13「空状态负责教会下一步」；DENSITY §3 渐进披露 | 截图 `host-desktop-1440x960.png`：countdown 2×1 空态仅"还没有倒数日"、无添加入口（源码 `countdown/styles.css:498-509`：`.empty .btn { display:none }`，仅 2×2/3×2 显示添加按钮）；`p-pomodoro-2x1.png` 只有时间无可见主操作（仅点击卡片开始，无 affordance）；`host-desktop-1440x960.png` todo 3×3 空态同时渲染两块空状态（图标+标题+说明 ×2 = 6 个文本元素） | 空状态是死胡同；2×1 番茄主操作不可发现；todo 空态过度解释 | countdown 2×1 空态加"添加"按钮（组件规范 3×2 已有 `#empty-add`，可复用）；pomodoro 2×1 增一个 40px 开始按钮；todo 3×3 空态只保留 1 块 + 1 个主操作 |
| **V-12** | DENSITY 硬规则 2「每张卡只有一个 Primary」；§2 层级手段 | `p-sedentary-2x1.png`：主数值"7 分钟"与副文案"已连续坐 7 分钟"重复同一数值；`p-sedentary-2x2.png`：4 项中含重复数值；`p-sedentary-3x2.png`：仅数值+按钮，中部约 200px 空白 | 同值重复消耗密度预算；3×2 版式失衡 | 2×1/2×2 副文案改为激励/阈值提示（如"距提醒还有 38 分钟"），不重复数值；3×2 用空间放 1 项统计或居中布局 |
| **V-13** | DENSITY §4「编辑模式下才出现标题、删除、改尺寸、设置」 | 截图 `host-desktop-edit-1440x960.png`：todo 卡"待办"标题与 3 个按钮压在插件工具栏（今日/最近/搜索）上；天气卡"天气"标题与"北京"城市名重叠 | 编辑 chrome 无背景/scrim 直接覆盖插件首行内容，可读性下降 | 编辑浮层加半透明底色或顶部渐变遮罩，或编辑模式下给 iframe 加 padding-top 让出 32px |
| **V-14** | DENSITY 硬规则 3「Chrome on demand：标题栏、齿轮、删除/改尺寸等默认不显示」 | `host-desktop-1440x960.png` 右下角常驻 4 个文字按钮（Agent/复盘/插件/设置）；`src/host/App.tsx:148-161` | 宿主全局导航常驻桌面（非卡片 chrome，但同属常驻 UI）；与"桌面即内容"的密度目标有张力 | 产品决策：可保留（备注），或收进右下角单一入口/长按/边缘手势；至少避免与 Agent FAB 重复入口 |
| **V-15** | DENSITY §2「分组用 spacing token，不靠边框/分割线」 | `ConversationPane.tsx:72`（header `borderBottom`）、`:58-63`（全屏对话列左右各 1px 竖线，截图 `agent-demo-fullscreen-1440x960.png` 两列边缘可见）、`MessageBubble.tsx:68`（assistant bubble `border`）、`:91`（来源区 `borderTop`）、`PluginsPage` 使用 Fluent Table 默认行线（`host-plugins-1440x960.png`） | Agent 面板内部用 1px 分割线表达分组（头部 1 条 + 气泡 1 条 + 来源 1 条 + 全屏左右 2 条），与 DENSITY 明确规则冲突 | 用 spacingVertical 留白替代 header/来源分割线；气泡去掉 border，用背景层级区分；全屏列去掉竖线改用页面背景 |
| **V-16** | DENSITY §4 Agent「来源 chips 最多首屏 3 条，更多折叠」；FLUENT2 §11 内容设计；Markdown 渲染 | `agent-demo-overlay-1440x960.png` / `agent-demo-search-1440x960.png`：同一条回答里正文出现"来源：1…2…"链接列表，下方又出现"来源"chips 区块（3+1 折叠）；搜索场景中正文链接渲染断裂：`1. [MiMo V2.6 系列模型更新] (https://mimo.mi.com/docs/zh-CN/updates/` 原样显示并断行（`MessageContent.tsx:105-153` 内联链接正则未覆盖含嵌套括号的 URL） | 来源信息重复两遍；markdown 链接解析失败导致原始语法泄漏到用户界面；输入框 placeholder 过长 | 正文渲染时移除 markdown 链接列表（或 chips 只在无正文列表时渲染）；修正内联链接正则（支持成对括号 URL）；placeholder 缩短为"问点什么…"，快捷键说明移到设置 |
| **V-17** | FLUENT2 §11「主动语态、短句、可扫读；面向用户」 | `sedentary/index.html:166-167`（"宿主 getIdleSeconds…"、"manifest 的 background: true"）；`pomodoro/index.html:153`（"用 WebAudio 合成，不联网"）、`:172-173`（"Agent 工具 pomodoro.start({ taskId })…本期未接"）；`weather/src/components/SettingsDialog.jsx:165`（"旧公共域名 devapi/api.qweather.com 已停用"）；`SettingsPage.tsx:383`（"?page=settings / review / plugins"）；Agent 设置对话框 `SettingsDialog.tsx:146`（"只保存在本机 localStorage；请求直接发往 https://…"）、`:155`（"Token Plan 可换成专属地址"）、`:165`（"深度思考（thinking）"）、`:232`（"连续朗读（持久化）"）、`:325`（"force_search：强制每次回答前搜索"） | 用户界面暴露工程实现/开发调试信息，并出现中英混排工程术语 | 改成用户语言（如"由系统空闲检测驱动，锁屏也算起身"）；"thinking/持久化/Token Plan/force_search" 等术语换中文并下沉到高级说明；实现细节留在 README/注释 |
| **V-18** | FLUENT2 §2「只允许 Fluent token，不手写 hex」 | `docs/audit/_scan-hex.txt` 共 151 处 / 7 文件：140 处是四款插件 CSS 内复制的 Fluent token 兜底声明（clock 30、countdown 40、pomodoro 35、sedentary 35）；11 处直接字面量：4×`#1f1f1f`（clock:143/countdown:137/pomodoro:132/sedentary:129 body 背景）、`todo/app.css:50` `#0e0f13`、`todo/index.html:29-30` 3 处 inline fallback、`src/styles.css:17-18` `#0e0f13`/`#f3f3f3`（宿主壁纸与文字色，live） | token 值双源复制，FluentProvider 主题/亮色注入失败时颜色会退回深色硬编码；宿主壁纸/文字色直接手写 | 删除插件 CSS 的 140 条 hex 兜底（未注入时用 `color-scheme` + 透明背景），改为纯 `var(--color*)`；宿主壁纸改用 `colorNeutralBackground*` 或声明为项目材质 token |
| **V-19** | FLUENT2 §5/§6「不允许出现规范外圆角/自定义大阴影」 | 非 token 圆角 15/92：`todo/app.css:55` `20px`（standalone 卡片）、`:119/:391/:481/:556/:1379/:2027/:2117` `50%`、`:382` `1px`、`:1208/:1597` `2px`、`weather/weather.css:36` `4px`、`src/styles.css:43` `20px`（死样式）、`:97` `999px`（死样式）、`:123` `12px`（dock）；非 token 阴影 8/21：`sedentary/styles.css:176-194` 四处自定义状态光晕、`todo/app.css:163/1554/2124` inset/环形阴影、`src/styles.css:45` `0 18px 40px`（死样式）。另 `ReminderDialog.tsx:41` 覆写 `shadow64`（超 FLUENT2 检查表 4/8/16） | 规范外圆角/阴影仍存在于 CSS（部分为独立开发态或死代码，但仍在仓库）；提醒弹窗阴影档位超标 | 清理 `src/styles.css` 中 `.widget/.widget-head/.reset-layout` 等死样式；standalone 容器改用 token；状态点光晕改用 2px stroke；提醒弹窗回退 Fluent Dialog 默认（不覆写 shadow） |
| **V-20** | FLUENT2 §2/§4 | `src/styles.css:14-18`（桌面壁纸 radial-gradient + `#0e0f13` + `#f3f3f3`）、`:115-128`（`.desktop-dock` 使用 `18px/16px/4px/6px/12px` 字面量与 rgba fallback） | 宿主根样式未走 token（壁纸为设计决定的例外，但值是手写的；dock 间距/圆角为字面量） | 壁纸如需保留，声明为项目材质 token（如 `--wtsl-desktop-backdrop`）并注明例外；dock 改 spacing/radius token |
| **V-21** | DENSITY §4 页面「一屏一个主任务」；FLUENT2 §13 空状态 | `host-review-1440x960.png`：页头"刷新"与空状态"重新读取"两个等效操作并存；空态描述在 1440 宽下仍被压成两行（"…会自动汇/总。"）；`host-plugins-1440x960.png` 操作列仅有一个禁用"删除"，无重载/禁用等动作 | 复盘空态双刷新入口、文案换行生硬；插件管理操作列信息价值低 | 空态只留一个"重新读取"，页头刷新在空态时隐藏；空态描述限宽改为一句话；插件管理补"重新扫描/禁用"行内操作或移除空列 |
| **V-22** | FLUENT2 §10「支持 320px 宽回流」；DESIGN §1.1 | `src/host/layout/breakpoints.ts:26-30`（<900 一律 4 列）、`:56`（cell 夹取 ≥96px）：320px 宽时 4×96+3×12=420px > 可用宽 280px，网格必然横向溢出（页内不滚动 + overflow hidden）。另 `host-agent-overlay-960x1440.png`：960px 宽时 Agent 浮层固定 min(420px,92vw) 占宽 44%，遮住右下卡片 | 320px 极小宽度无降列策略（未实机截图，几何推导确定溢出）；窄屏浮层占比过高 | 增加 <480 断点降为 2–3 列或允许横向滚动；窄屏（<1100）Agent 浮层改全屏形态 |
| **V-23** | FLUENT2 §8「统一走 motionTokens」 | `docs/audit/_shots-host-final.log` 每次页面加载出现 `Keyborg instance ... is being disposed incorrectly`（Fluent 焦点管理库） | 切页时焦点管理实例异常，可能造成焦点丢失/焦点顺序错乱 | 检查 PageTransition 包裹方式与 FocusTrap 生命周期，确保页面卸载顺序正确 |

### 3.4 P3（备注，不计入违规）

- 时钟秒数（`p-clock-2x1.png`）以右上角小号上标呈现，视觉上像独立徽标；不违反规范，但可考虑基线对齐。
- 倒数日 1×1/2×1 使用大号品牌色胶囊、2×2/3×2 用列表行 + 小徽标，同一事件在不同尺寸的视觉语言不一致（偏好问题）。
- 桌面常驻 dock 是否保留属于产品决策（见 V-14）。

---

## 4. 全局问题汇总（扫描统计）

### 4.1 token 违规计数（最终代码 `ad7ea0a`）

| 扫描项 | 总声明数 | 非 token 数 | 占比 | 主要来源 |
|---|---|---|---|---|
| 字号 `font-size` | 153 | **113** | 74% | todo 52/52、countdown 17/28、pomodoro 15/27、sedentary 15/26、clock 11/17、src/styles 3/3 |
| 间距 `gap` | 152 | **113** | 74% | todo 63/63、sedentary 21/32、countdown 14/26、pomodoro 8/20、clock 4/8 |
| 内边距 `padding` | 124 | **101** | 81% | todo 72/72、sedentary 7/11、countdown 7/15、pomodoro 5/13、clock 4/7、src/styles 5/5 |
| 外边距 `margin` | 53 | **42** | 79% | todo 19/19、sedentary 6/8、clock 5/8、countdown 5/8、pomodoro 5/8 |
| 圆角 `border-radius` | 92 | **15** | 16% | todo 11/40、src/styles 3/3、weather 1/1 |
| 阴影 `box-shadow` | 21 | **8** | 38% | sedentary 4/5、todo 3/8、src/styles 1/2 |
| 手写 hex 颜色 | 151 | 11 直接使用 + 140 兜底声明 | — | 4 插件 CSS 兜底 140；直接使用 7 文件 11 处 |
| 动效时长/曲线 | 36 处 transition/animation 引用 | **0**（2 处 `1ms/none !important` 为 reduced-motion/[hidden]，合规） | 0% | 全部来自 `motionTokens`/`--duration*`/`--curve*` |
| backdrop-filter | 7 | 0（全部 `var(--wtsl-material-blur)`） | 0% | 单一项目材质 token，符合 DESIGN §6 例外 |

> 扫描范围：`public/plugins/**` 手写 CSS/JS/HTML（排除天气构建产物与图标集、`todo/fluent-tokens.css`）+ `src/host/**` + `src/styles.css`。完整命中见 `docs/audit/_scan-{hex,radius,shadow,fontsize,gap,padding,margin}.txt`、`_scan-ts-visual.txt`。

### 4.2 宿主 React 层（token 合规性良好）

- `src/host/**/*.tsx|ts` 的 `fontSize/borderRadius/boxShadow/gap/transitionDuration` 非 token 项仅 8 处：`'0'`/`'0ms'`（归零值）、`CARD_RADIUS`（即 V-01）、`Heatmap CELL_GAP` 常量（来自布局常量，可接受）。
- 动效值全部来自 `motionTokens`（`desktop.styles.ts`、`PageTransition.tsx` 等），无自定义 easing/时长。
- 颜色全部来自 `tokens.*`（唯一例外为桌面壁纸与 Agent 演示页背景，后者非产品页面）。
- 对比度（深色主题，按 Fluent v9 token 值推算）：正文 4.5:1 全部达标（见 §6）；按钮/控件 3:1 达标。

### 4.3 通过与已修复项（证据）

- **正常模式卡片无 chrome**：`WidgetCard.tsx:175-185` 仅悬停拖拽提示（overlay 不占布局）；截图 6 张卡片均无标题栏/齿轮/刷新。task-15 目标达成。
- **weather 正常模式无刷新/更新时间/齿轮**：`p-weather-*.png` 无 chrome；7 天仅星期/图标/高温（3×2）。
- **pomodoro 3×2 收敛**：环形 + 任务 1 行 + 主按钮 + ⋯，跳过/重置/统计/白噪音进菜单/详情（`pomodoro/index.html:12` 注释与截图一致）。
- **todo 3×3 工具条收敛**：今日/最近 + 搜索图标 + ⋯，符合 DENSITY 要求（`host-desktop-1440x960.png`）。
- **工具调用卡片默认折叠**：`ToolCallCard.tsx:105` Accordion 默认收起；截图 `agent-demo-overlay-1440x960.png` 显示为单行"图标+动作+状态"。
- **来源 chips 首屏 3 条 + 折叠**：`MessageBubble.tsx:132` `SOURCE_CHIP_LIMIT = 3`；截图显示"还有 1 条来源"折叠按钮。
- **网格 gap 已从 14px 改为 12px**（`layout/breakpoints.ts:15`），符合 FLUENT2 已知偏离项 #6 的整改方向。
- **触控图标按钮在插件内 ≥40px**：clock/countdown/pomodoro/sedentary 的 `.icon-btn`/`.btn` 均 `min-width/min-height:40px`（`clock/styles.css:301-302` 等）。
- **焦点态**：插件 CSS 均定义 `:focus-visible`（clock 3 / countdown 3 / pomodoro 3 / sedentary 2 / todo 9 条规则）；宿主用 Fluent 默认焦点。
- **减少动效**：`todo/app.css:2196-2197` 对 `prefers-reduced-motion` 置 1ms，合规。

---

## 5. 信息密度核对明细（按 DENSITY 预算表）

| 尺寸 | 预算（P/S/T） | clock | countdown | pomodoro | sedentary | todo | weather |
|---|---|---|---|---|---|---|---|
| 1×1 | 1/1/0 | 1/0/0 ✓ | 1/1/0 ✓ | 1/1/0 ✓ | 1/0/0 ✓ | 1/1/0 ✓ | 1/0/1(预警) △ |
| 2×1 | 1/1–2/0 | 1/1+秒 ✓ | 1/1/0 ✓ | 1/1/0 ✓ | 1/2(重复)/0 △ | — | 1/3+预警 △ |
| 2×2 | 1/2–4/0 | — | 1/4/0 ✓ | 1/1+1动作 ✓ | 1/3/0 △ | **1/8/0 ✗** | 1/3+6逐时/0 ✗ |
| 3×2 | 1/4–6/0, ≤1 动作 | 1/2/0 ✓ | 1/5+1动作 ✓ | 1/1+动作+1入口 ✓ | 1/0+动作 ✓ | **1/8+输入 ✗** | 1/7+预警 ⚠（规范要求） |
| 3×3 | 1 主区 + 列表 + 1 入口 | — | — | — | — | 2 切换+搜索+⋯+列表 ✓ | — |
| 4×2 | 1 主区 + 分栏 + 1 入口 | — | — | — | — | 双栏 ✓（已完成列裁切 △） | 当前+7天+AQI △（"良"裁切） |

✓ 通过；△ 有风险/超预算但组件规范允许；✗ 明确超预算。

---

## 6. 无障碍核对

### 6.1 对比度（深色主题，Fluent v9 token 值推算）

| 前景 / 背景 | 比值 | 要求 | 结论 |
|---|---|---|---|
| `colorNeutralForeground1` #ffffff / `colorNeutralBackground1` #292929 | 14.55:1 | ≥4.5 | 通过 |
| `Foreground2` #d6d6d6 / #292929 | 10.01:1 | ≥4.5 | 通过 |
| `Foreground3` #adadad / #292929 | 6.48:1 | ≥4.5 | 通过 |
| `Foreground4` #999999 / #292929 | 5.11:1 | ≥4.5 | 通过 |
| 品牌前景 #479ef5 / #292929 | 5.18:1 | ≥4.5 | 通过 |
| 品牌底 #115ea3 / 白字 | 6.66:1 | ≥4.5 | 通过（主按钮/预警条） |
| 成功 #54b054 / #292929 | 5.34:1 | ≥4.5 | 通过 |
| 警告 #fce100 / #292929 | 11.02:1 | ≥4.5 | 通过 |
| 危险 #e37d80 / #292929 | 5.20:1 | ≥4.5 | 通过 |

未覆盖：半透明卡片材质叠加壁纸后的实际对比度（推算仍 >5:1，但未实测像素）；亮色主题（见局限 1）。天气图标为多色 SVG，按内容图形处理，未逐色测。

### 6.2 触控目标

违规见 **V-06**（桌面 dock 24px、编辑按钮 24px、Agent 头部 32px、设置 Tab 33px、todo 行 26–36px、日历格 33px）。插件内的图标按钮/主按钮 40px 达标。

### 6.3 键盘与焦点

- 插件均声明 `role="button"/"switch"/"radio"`、`tabindex`、`aria-label` 或可见文本；图标按钮均有 `aria-label`（`clock/index.html:28`、`countdown/index.html:18/63/108/144`、`pomodoro/index.html:44/70/110/182`、`sedentary/index.html:62/92`）。
- 宿主组件使用 Fluent 默认焦点样式与 Tab 顺序；Agent 面板关闭/形态切换有 Fluent Drawer/Dialog 语义（`role="dialog" aria-modal` 见 `AgentPanel.tsx:75`）。
- 焦点库存在运行时告警（V-07/V-23），需修复后复测关闭弹窗焦点归还。
- 320px/400% 缩放未验证（V-22 源推导存在横向溢出风险）。

---

## 7. 结论：是否可发布

**结论：当前基线（`ad7ea0a`）不建议发布。**

- **P0 = 0**：没有内容不可读/功能不可用的阻断缺陷。
- **P1 = 8（V-01~V-08）**，属于设计语言红线或无障碍/动效功能缺陷，发布前必须修复，或由需求方对每条给出书面豁免（建议至少修复 V-01/V-03/V-06/V-07）。
- **P2 = 15（V-09~V-23）**：可排期修复；其中 V-11（空状态死胡同）、V-18（token 双源）建议随 P1 一并处理。
- **P3 = 3**：仅记录，不作为验收条件。

**必须修复项（发布门槛）**

| 顺序 | 编号 | 一句话 |
|---|---|---|
| 1 | V-01 + V-02 | 统一卡片圆角为 12px（先修正规范表与 token 映射） |
| 2 | V-06 | 宿主与插件触控目标统一 ≥40×40 |
| 3 | V-03 | 插件控件迁移 Fluent 组件（或登记豁免并补齐状态样式） |
| 4 | V-04 + V-05 | 插件字号/间距全面 token 化 |
| 5 | V-07 | 修复 PageTransition，页面切换零控制台报错 |
| 6 | V-08 | todo 2×2/3×2 按预算收敛条数 |

**复检方式**：同一份违规清单在原文件/截图位置上逐条复核（见 §8），修复项需附 after 截图与静态扫描计数为证；P1 全部关闭且 P2 给出处置结论后，方可判定可发布。

---

## 8. 复检记录表（待填）

> 复检基线：`ad7ea0a`；复检时请在同一路径复查并记录证据。状态填写：`未修 / 已修 / 部分修 / 豁免（需方书面）`。

| 编号 | 严重度 | 复检状态 | 复检证据（截图/文件:行/计数） | 复检时间 | 复检人 |
|---|---|---|---|---|---|
| V-01 | P1 | 未复检 | | | |
| V-02 | P1 | 未复检 | | | |
| V-03 | P1 | 未复检 | | | |
| V-04 | P1 | 未复检 | | | |
| V-05 | P1 | 未复检 | | | |
| V-06 | P1 | 未复检 | | | |
| V-07 | P1 | 未复检 | | | |
| V-08 | P1 | 未复检 | | | |
| V-09 | P2 | 未复检 | | | |
| V-10 | P2 | 未复检 | | | |
| V-11 | P2 | 未复检 | | | |
| V-12 | P2 | 未复检 | | | |
| V-13 | P2 | 未复检 | | | |
| V-14 | P2 | 未复检 | | | |
| V-15 | P2 | 未复检 | | | |
| V-16 | P2 | 未复检 | | | |
| V-17 | P2 | 未复检 | | | |
| V-18 | P2 | 未复检 | | | |
| V-19 | P2 | 未复检 | | | |
| V-20 | P2 | 未复检 | | | |
| V-21 | P2 | 未复检 | | | |
| V-22 | P2 | 未复检 | | | |
| V-23 | P2 | 未复检 | | | |

---

## 附录 A：截图索引（`shots/audit/`）

**宿主（12）**：`host-desktop-1440x960.png`、`host-desktop-1024x768.png`、`host-desktop-960x1440.png`、`host-desktop-edit-1440x960.png`、`host-desktop-edit-1024x768.png`、`host-desktop-edit-960x1440.png`、`host-settings-{1440x960,1024x768,960x1440}.png`、`host-review-{1440x960,1024x768,960x1440}.png`、`host-plugins-{1440x960,1024x768,960x1440}.png`（共 15）

**Agent（11）**：`host-agent-overlay-{1440x960,1024x768,960x1440}.png`、`agent-demo-overlay-{1440x960,1024x768}.png`、`agent-demo-sidebar-1440x960.png`、`agent-demo-fullscreen-{1440x960,960x1440}.png`、`agent-demo-voice-1440x960.png`、`agent-demo-settings-1440x960.png`、`agent-demo-search-1440x960.png`

**通知（2）**：`host-reminder-1440x960.png`、`host-reminder-1024x768.png`

**插件（33）**：`p-clock-{1x1,2x1,3x2}.png`、`p-countdown-{1x1,2x1,2x2,3x2}.png`、`p-pomodoro-{1x1,2x1,2x2,3x2}.png`、`p-pomodoro-settings.png`、`p-sedentary-{1x1,2x1,2x2,3x2}.png`、`p-todo-{1x1,2x2,3x2,3x3,4x2}.png`、`p-todo-week-3x3.png`、`p-todo-month-3x3.png`、`p-weather-{1x1,2x1,2x2,3x2,4x2}.png`、`p-weather-light-3x2.png`、`p-weather-detail-hourly.png`、`p-weather-detail-warning.png`、`p-weather-settings.png`、`_sheetA-small.png`、`_sheetB-todo.png`、`_sheetC-weather.png`、`_sheetD-overlays.png`（对照图）

## 附录 B：证据文件

| 文件 | 内容 |
|---|---|
| `docs/audit/_baseline.txt` | 审计基线时间/git 状态 |
| `docs/audit/_baseline-manifest.txt` | 137 个源文件 SHA256 快照（22:56） |
| `docs/audit/_scan-hex.txt` | 151 处 hex 命中明细 |
| `docs/audit/_scan-radius.txt` / `_scan-shadow.txt` | 圆角/阴影命中 |
| `docs/audit/_scan-fontsize.txt` / `_scan-gap.txt` / `_scan-padding.txt` / `_scan-margin.txt` | 字号/间距命中 |
| `docs/audit/_scan-ts-visual.txt` | 宿主 TS 非 token 视觉属性（8 处） |
| `docs/audit/_shots-plugins2.log` / `_shots-host-final.log` | 最终截图批次日志（含控制台报错原文） |
| `docs/audit/_shots-host2.log` / `_shots-log.txt` | 过程截图日志（基线期间，供追溯） |
