# Windows 平板桌面启动器 · UI 设计审计报告（基线）

> **审计类型**：Fluent 2 规范符合性 + 信息密度规范符合性（独立审计，非实现者自评）
> **审计基线**：`ad7ea0a`（2026-10-18 23:37:05 +08:00），审计时工作区 clean
> **审计时间**：2026-10-18 22:56 – 2026-10-19 00:1x（+08:00）
> **G2 复检**：修复后提交 `e6e57b7`（2026-10-19 01:59:53），复检时间 2026-10-19 02:00–03:00；判定口径见 `docs/DECISIONS.md`（D-01~D-05 / D-02b）、`docs/PLUGIN-REACT.md`。基线结论与 §1~§7 原文保留不篡改，复检结果见 §0、§8、§9。
> **G2b 增量复验**：收口提交 `2b79fb9`（2026-10-19 02:58:06），复验时间 03:0x–03:4x；结果见 §0（历史）、§8、§9.8。
> **G2c 最终确认（本次更新）**：收口提交 `85c3962`（2026-10-19 03:30:44，工作区除 1 个未跟踪 `docs/releases/RELEASE-REPORT.md` 外干净），复验时间 2026-10-19 03:3x–03:5x；最终判定见 §0、§8、§9.9。
> **审计工具**：PowerShell 7 + Edge 155.0.4283.62 headless（CDP 截图/DOM 测量）+ ripgrep 静态扫描
> **截图与运行日志目录**：`shots/audits/round1-fluid-visual/`（截图在根目录，运行日志在 `logs/`；均不入库，本报告引用的截图均在此目录）
> **扫描原始输出**：`docs/audits/round1-fluid-visual/_scan-*.txt`、`shots/audits/round1-fluid-visual/logs/_shots-*.log`、`docs/audits/round1-fluid-visual/_baseline-manifest.txt`
> **审计者立场**：只对照规范与产物；不接受"整体良好"结论；每条违规均带截图或 `文件:行` 证据。

## 0. 结论摘要（G2c 最终确认，2026-10-19）

> **基线（`ad7ea0a`）**：P0=0 / P1=8 / P2=15 / P3=3（§1~§7 为基线原文，保留）。
> **G2（`e6e57b7`）**：P0=0 / P1=1 / P2=5 / P3=9（§8、§9）。
> **G2b（`2b79fb9`）**：P0=0 / P1=0 / P2=4 / P3=14（§8、§9.8）。
> **G2c（`85c3962`，本次最终确认）**：P0=0 / **P1=0 / P2=0** / P3=14（§8、§9.9）。

| 严重度 | 基线 | G2 | G2b | **G2c 最终** | 说明 |
|---|---|---|---|---|---|
| **P0（阻断）** | 0 | 0 | 0 | **0** | 未发现阻断级缺陷 |
| **P1（应修）** | 8 | 1 | 0 | **0** | V-01~V-08 全部关闭（G2/G2b 完成） |
| **P2（可优化）** | 15 | 5 | 4 | **0** | G2c 关闭 V-17（最后 1 处文案）、N-02（1×1 进度条，已提交）、N-03（Fluent 内建控件 min-height 40）、N-04（插件空/错误态 CTA 40）、N-05（全部插件产物重建并核对） |
| **P3（备注）** | 3 | 9 | 14 | **14** | 均为产品决策/已记录例外/内容图形常量，不阻断发布（清单见 §9.9.4） |

**最终判定：可发布（设计维度：P0=0 / P1=0 / P2=0）。** 无设计阻断项；14 项 P3 为备注与已记录例外，不需要在发布前处理。

**G2c 收口证据（摘要）**

- **N-03（触控）**：`?page=settings` Switch **40**、纵向 Tab 40、below40=0；`?page=plugins` 6 个 Switch 全 **40**、below40=0；weather 设置浮层 13 个 Fluent 控件根元素全 **40**、below40=0；Agent 设置对话框 14 个控件根元素全 **40**、below40=0。内部 `fui-Input__input` 38 / `fui-Dropdown__button` 38 / `fui-Slider__input` 20 属 Fluent 内部几何（命中区根元素 40），记 P3。
- **N-04（空/错误态 CTA）**：weather NoKey「去设置填 Key」129×**40**、「使用演示数据」130×**40**；todo 空态「新建任务」98×**40**；below40=0（`g2c-weather-nokey.png`、`g2c-todo-empty-2x2.png`）。
- **N-05（产物同步）**：六个插件 `app.js` 均于 03:23 重建；`todo/app.js` 旧文案「按 Fluent type ramp 切档」**0 命中**、新文案命中；`pomodoro/app.js` 旧「通过宿主 setKeepAwake 实现」**0 命中**、新文案命中；运行时 `?view=settings` 已确认新文案（`g2c-todo-overlay-settings-1440x960.png`、`g2c-pomodoro-overlay-settings-1440x960.png`）。
- **N-02 / V-17**：pomodoro 1×1 实测 `role=progressbar` 1 个；源码扫描 0 处工程术语，全部文案已用户语言。
- **回归**：桌面 6 卡片 / 0 alert / 圆角 12px；weather 3×2 字号仅 12/14/16px、无溢出；G2c 全部场景无 console 报错（0 error / 0 warning）。
- **复扫（`_g2c-scan-*.txt`）**：非 token 字号 5、gap 5、padding 7、margin 12（均为配置值/0/auto/内容图形常量）、圆角 3（项目 token）、阴影 0、hex 7（4 weather 算法常量 + 2 项目 token 声明 + 1 演示页，组件样式 0）、自定义动效 0。

**P3（14，摘要）**：V-14 dock 常驻（D-03 产品决策）、Composer 顶部分隔线、weather 对比度算法 hex、插件独立页无宿主主题白底、Fluent 内部 input/trigger 38/20px（根命中区 40）、todo Tag dismiss 20px（Fluent Pattern）、天气图表 2px gap（内容图形）、Dialog 默认 8px 圆角（D-01 已记录例外）、Keyborg 仅演示页、单次瞬态 React #520（未复现）、320 窄屏（tauri `minWidth:960` 已限制）、sedentary 3×2 组件措辞冲突、pomodoro 3×2 视觉重心、时钟秒角标偏好。详见 §9.9.4。

**发布说明建议（对应 P3）**：① 平板触控增强——宿主与插件对 Fluent 内建表单控件统一 `min-height:40px`，视觉密度略高于 Fluent 桌面默认；② 窗口最小尺寸 960×640；③ 天气图标为和风 SVG（Fluent 覆盖不全，内容图形例外）；④ CSS 近似 Acrylic/Mica（Win10 无系统材质）；⑤ 桌面右下 dock 常驻为产品决策（D-03）。

---

## 1. 审计方法与环境

### 1.1 依据文档（全部通读）

- `docs/FLUENT2.md`：官方 Fluent 2 数值与落地规则（颜色/字阶/间距/圆角/阴影/材质/动效/图标/无障碍/文案/等待）。
- `docs/DENSITY.md`：尺寸信息预算、三层重要性、渐进披露、chrome on demand、逐组件审计。
- `docs/DESIGN.md`：工程约定（网格、触控 40px、插件契约、宿主 API、动效、页面）。
- `docs/components/*.md`：clock/countdown/pomodoro/sedentary/todo/weather/agent 七份组件规格。
- `docs/reference/fluent-design/`（15 个官网设计语言页原文）与 `docs/reference/fluent-ui-docs/`（组件文档）抽查核对。

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

截图统一由 headless Edge + CDP `Page.captureScreenshot` 生成（不占桌面、不抢焦点），日志见 `shots/audits/round1-fluid-visual/logs/_shots-plugins2.log`、`shots/audits/round1-fluid-visual/logs/_shots-host-final.log`。插件独立页采用 180px 基准卡片尺寸（3×2=540×360 等），与宿主真实卡片（1440×960 下约 166px 单元格）视觉近似，密度结论以宿主截图为主、独立页用于观察各档位裁剪。

### 1.4 判定口径

- **token 判定**：颜色/字号/间距/圆角/阴影/动效必须来自 Fluent token（`var(--color*)`、`var(--fontSize*)`、`var(--spacing*)`、`var(--borderRadius*)`、`var(--shadow*)`、`var(--duration*/--curve*)`）。数值恰好等于 ramp 值但手写的，计"值合规、未走 token"，归 P2。
- **密度判定**：按 DENSITY §2 预算表逐尺寸数 Primary / Secondary / Tertiary 项数，超预算记违规；空状态额外按 FLUENT2 §13 检查"是否给出下一步主操作"。
- **严重度**：P0=阻断（内容不可读/功能不可用）；P1=明确违反规范条款或硬规则、且影响体验一致性/无障碍；P2=规范内部冲突、体验退化、token 双源等风险项；P3=个人偏好/产品决策。
- **扫描口径**：静态扫描覆盖 `public/plugins/**`（手写 CSS/JS/HTML，排除天气构建产物 `app/app.js`、图标集、`todo/fluent-tokens.css` token 定义文件）与 `src/host/**` + `src/styles.css`；`dist/`、`node_modules/`、`docs/reference/` 不计入。

### 1.5 基线快照与代码漂移处理

- 22:56 建立 `docs/audits/round1-fluid-visual/_baseline-manifest.txt`（137 个源文件 SHA256 前 16 位）。
- 实现任务在审计期间持续提交，最终基线为 `ad7ea0a`（23:37）。**本报告所有判定以 `ad7ea0a` 当前文件为准**；23:37 之前的截图已全部重拍覆盖（宿主/插件/Agent/提醒共 60+ 张），静态扫描亦在最终代码上重跑（`docs/audits/round1-fluid-visual/_scan-*.txt` 为最终版本）。
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
| **V-01** | FLUENT2 §5「卡片：X-Large 12px；不允许规范外圆角」 | `src/host/desktop/desktop.styles.ts:10-11`：`/** 卡片圆角：Fluent 的 borderRadiusXLarge 是 8px，平板卡片取它的 2 倍（16px） */` + `calc(${tokens.borderRadiusXLarge} * 2)`；截图 `shots/audits/round1-fluid-visual/host-desktop-1440x960.png` 六张卡片圆角明显大于 12px | 桌面卡片实际圆角 16px，偏离规范 12px，且用 calc 自造 token 之外数值 | 改为 8/12px 规范值之一（按 §5 取 12px），移除 `*2` 计算 |
| **V-02** | FLUENT2 §5 圆角 token 表；DENSITY §2「用 token 层级」 | 规范表写 Large 8px / X-Large 12px，但 Fluent v9 token 实际为 Large 6px / X-Large 8px（`desktop.styles.ts:10` 注释自证）；页面卡片用 `tokens.borderRadiusLarge`（`ReviewPage.tsx:60`、`PluginsPage.tsx:106`）=6px；提醒对话框覆写 `tokens.borderRadiusXLarge`（`ReminderDialog.tsx:40`）=8px | 规范文档与组件 token 值不一致，导致同一产品出现 16/6/8px 三套卡片圆角 | 先修正 FLUENT2 §5 的数值映射（或在项目 token 层定义 `--wtsl-card-radius: 12px`），再统一桌面/页面/弹层三处卡片圆角 |
| **V-03** | DESIGN §6「组件一律用 Fluent UI React v9 的 Button、Card、Dialog、Drawer…；不自己画控件」；FLUENT2 §1「不用自造控件」 | 手绘控件证据：`public/plugins/clock/index.html:38-77`（自绘 switch/radio 结构）、`clock/styles.css:297-330`（`.icon-btn`/`.switch-track` 自绘）；`pomodoro/index.html:105-174` 自绘设置 sheet；`countdown/index.html:60-158` 自绘表单/确认弹层；`sedentary/index.html:89-160` 自绘设置 sheet；`todo/app.css` 全量自绘。仅 weather 使用 Fluent React（`public/plugins/weather/src/components/SettingsDialog.jsx`，含 Fluent `Dialog/Input/Switch`）。截图对照：`p-weather-settings.png`（Fluent 观感）vs `p-pomodoro-settings.png`（自绘观感） | 5/6 插件自造 Fluent 控件的替代品，状态/hover/pressed/focus/材质/圆角由各插件各自实现，长期无法与 Fluent 版本同步 | 统一用 Fluent React 构建（weather 已有 `build.mjs` 先例）；过渡期至少把按钮/开关/单选/弹层换成 `@fluentui/react-components`，并在 DESIGN 中登记豁免 |
| **V-04** | FLUENT2 §3「组件内字号只取 type ramp（10/12/14/16/20/24/28/32/40/68）；Primary 允许 clamp 缩放但基准参照 ramp」 | 扫描 `docs/audits/round1-fluid-visual/_scan-fontsize.txt`：非 token 113/153（74%）。逐文件：clock 11/17、countdown 17/28、pomodoro 15/27、sedentary 15/26、todo 52/52、`src/styles.css` 3/3。典型：`clock/styles.css:229-288`（`clamp(11px,2.9vmin,20px)` 等非 ramp 端点）；`pomodoro/styles.css:365`（`clamp(12px,3.2vmin,16px)`）；`todo/app.css:24`（`font-size: var(--fs,13px)`）+ `todo/js/app.js:214` 按卡片尺寸把根字号连续缩放到 10.5–16.5px，全部 rem 字号随之连续变化（`todo/app.css:146-2153` 52 处 rem/em） | 插件字号不落在 type ramp 上；todo 甚至用连续缩放字号，等同放弃字阶体系 | 把字号改为 `var(--fontSizeBase*)`，Primary 的 clamp 端点取 ramp 值；todo 放弃 rem 全量缩放，按尺寸档位切 ramp 字号 |
| **V-05** | FLUENT2 §4「只用 spacing token（2/4/6/8/10/12/16/20/24/32/40/48）」；DENSITY §2「分组用 spacing token 留白」 | 扫描 `docs/audits/round1-fluid-visual/_scan-gap.txt` / `_scan-padding.txt` / `_scan-margin.txt`：gap 非 token 113/152、padding 101/124、margin 42/53。典型：`todo/app.css:75`（`padding: 0.75rem 0.95rem`）、`:347/:370`（`min-height: 2.5rem/2.25rem`）、`:665-680`；`sedentary/styles.css` gap 21/32；`countdown/styles.css` gap 14/26；`src/styles.css:49-59`（26px 标题栏高度、12px padding 等手写值） | 间距使用 rem/px 任意值（如 0.3rem=4.8px、0.4rem=6.4px、0.95rem=15.2px），不在 4px ramp 上，跨尺寸无法保持节奏 | 改用 `var(--spacingHorizontal*)`/`var(--spacingVertical*)`；需要缩放时用 ramp 端点 clamp |
| **V-06** | FLUENT2 §9「交互目标 ≥40×40」；DESIGN §1.2「触控目标不小于 40×40 CSS px」 | ① 桌面 dock：`src/host/App.tsx:149-159` 四个 `size="small"` 按钮（Fluent small 高 24px），截图 `host-desktop-1440x960.png` 右下角；② 编辑模式：`WidgetCard.tsx:211/225/249` 三个 `size="small"` 图标按钮，截图 `host-desktop-edit-1440x960.png` 卡片右上；③ Agent 头部：`ConversationPane.tsx:135-239` 五个默认 medium 图标按钮（Fluent medium 32px），截图 `agent-demo-overlay-1440x960.png`；④ Agent 设置对话框：`SettingsDialog.tsx:146-325` 的输入框/开关/下拉均为 Fluent 默认 32px 高（截图 `agent-demo-settings-1440x960.png`）；⑤ 设置页纵向 Tab：截图像素测量行高约 33px（`host-settings-1024x768.png` 导航项 y=116/149/181/215/248/282）；⑥ todo 任务行：`todo/app.css:347/370`（2.5rem/2.25rem，按 `--fs` 10.5–16.5px 换算约 26–36px），截图 `p-todo-2x2.png` 8 行/360px 高；⑦ todo 周/月视图日历格约 33px 高、内文 8–9px（`p-todo-week-3x3.png`、`p-todo-month-3x3.png`） | 平板触控场景下大量主操作目标低于 40×40，误触率高 | 宿主 chrome 统一 `size="large"`（40px）或加 `minHeight:40/minWidth:40`；Tab 用 `size="large"`；表单控件统一 40px 高；todo 行高与日历格改为 ≥40px（或降低单屏条数） |
| **V-07** | DESIGN §7「页面切换用 Fluent 减速曲线…不允许自定义」；FLUENT2 §8「Enter/Exit 用 createPresenceComponent」 | `src/host/shell/PageTransition.tsx:8-16` 用 `createMotionComponent` 直接包页面；`App.tsx:133` `<PageTransition key={page}>{content}</PageTransition>`。运行日志 `shots/audits/round1-fluid-visual/logs/_shots-host-final.log` 每次页面加载均报：`@fluentui/react-motion: Invalid child element. Motion factories require a single child element...`；另有 `Keyborg instance ... disposed incorrectly`（切页焦点管理库告警） | 页面切换动效实际不生效（退化/报错），motion 用法错误；焦点管理库在页面卸载时异常 | 用 `createPresenceComponent`/`createMotionComponent` 的 motion slot 规范包裹单个元素（或对 div 套用 className），并修正 Keyborg 卸载顺序；验收以控制台零报错为准 |
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
| **V-18** | FLUENT2 §2「只允许 Fluent token，不手写 hex」 | `docs/audits/round1-fluid-visual/_scan-hex.txt` 共 151 处 / 7 文件：140 处是四款插件 CSS 内复制的 Fluent token 兜底声明（clock 30、countdown 40、pomodoro 35、sedentary 35）；11 处直接字面量：4×`#1f1f1f`（clock:143/countdown:137/pomodoro:132/sedentary:129 body 背景）、`todo/app.css:50` `#0e0f13`、`todo/index.html:29-30` 3 处 inline fallback、`src/styles.css:17-18` `#0e0f13`/`#f3f3f3`（宿主壁纸与文字色，live） | token 值双源复制，FluentProvider 主题/亮色注入失败时颜色会退回深色硬编码；宿主壁纸/文字色直接手写 | 删除插件 CSS 的 140 条 hex 兜底（未注入时用 `color-scheme` + 透明背景），改为纯 `var(--color*)`；宿主壁纸改用 `colorNeutralBackground*` 或声明为项目材质 token |
| **V-19** | FLUENT2 §5/§6「不允许出现规范外圆角/自定义大阴影」 | 非 token 圆角 15/92：`todo/app.css:55` `20px`（standalone 卡片）、`:119/:391/:481/:556/:1379/:2027/:2117` `50%`、`:382` `1px`、`:1208/:1597` `2px`、`weather/weather.css:36` `4px`、`src/styles.css:43` `20px`（死样式）、`:97` `999px`（死样式）、`:123` `12px`（dock）；非 token 阴影 8/21：`sedentary/styles.css:176-194` 四处自定义状态光晕、`todo/app.css:163/1554/2124` inset/环形阴影、`src/styles.css:45` `0 18px 40px`（死样式）。另 `ReminderDialog.tsx:41` 覆写 `shadow64`（超 FLUENT2 检查表 4/8/16） | 规范外圆角/阴影仍存在于 CSS（部分为独立开发态或死代码，但仍在仓库）；提醒弹窗阴影档位超标 | 清理 `src/styles.css` 中 `.widget/.widget-head/.reset-layout` 等死样式；standalone 容器改用 token；状态点光晕改用 2px stroke；提醒弹窗回退 Fluent Dialog 默认（不覆写 shadow） |
| **V-20** | FLUENT2 §2/§4 | `src/styles.css:14-18`（桌面壁纸 radial-gradient + `#0e0f13` + `#f3f3f3`）、`:115-128`（`.desktop-dock` 使用 `18px/16px/4px/6px/12px` 字面量与 rgba fallback） | 宿主根样式未走 token（壁纸为设计决定的例外，但值是手写的；dock 间距/圆角为字面量） | 壁纸如需保留，声明为项目材质 token（如 `--wtsl-desktop-backdrop`）并注明例外；dock 改 spacing/radius token |
| **V-21** | DENSITY §4 页面「一屏一个主任务」；FLUENT2 §13 空状态 | `host-review-1440x960.png`：页头"刷新"与空状态"重新读取"两个等效操作并存；空态描述在 1440 宽下仍被压成两行（"…会自动汇/总。"）；`host-plugins-1440x960.png` 操作列仅有一个禁用"删除"，无重载/禁用等动作 | 复盘空态双刷新入口、文案换行生硬；插件管理操作列信息价值低 | 空态只留一个"重新读取"，页头刷新在空态时隐藏；空态描述限宽改为一句话；插件管理补"重新扫描/禁用"行内操作或移除空列 |
| **V-22** | FLUENT2 §10「支持 320px 宽回流」；DESIGN §1.1 | `src/host/layout/breakpoints.ts:26-30`（<900 一律 4 列）、`:56`（cell 夹取 ≥96px）：320px 宽时 4×96+3×12=420px > 可用宽 280px，网格必然横向溢出（页内不滚动 + overflow hidden）。另 `host-agent-overlay-960x1440.png`：960px 宽时 Agent 浮层固定 min(420px,92vw) 占宽 44%，遮住右下卡片 | 320px 极小宽度无降列策略（未实机截图，几何推导确定溢出）；窄屏浮层占比过高 | 增加 <480 断点降为 2–3 列或允许横向滚动；窄屏（<1100）Agent 浮层改全屏形态 |
| **V-23** | FLUENT2 §8「统一走 motionTokens」 | `shots/audits/round1-fluid-visual/logs/_shots-host-final.log` 每次页面加载出现 `Keyborg instance ... is being disposed incorrectly`（Fluent 焦点管理库） | 切页时焦点管理实例异常，可能造成焦点丢失/焦点顺序错乱 | 检查 PageTransition 包裹方式与 FocusTrap 生命周期，确保页面卸载顺序正确 |

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

> 扫描范围：`public/plugins/**` 手写 CSS/JS/HTML（排除天气构建产物与图标集、`todo/fluent-tokens.css`）+ `src/host/**` + `src/styles.css`。完整命中见 `docs/audits/round1-fluid-visual/_scan-{hex,radius,shadow,fontsize,gap,padding,margin}.txt`、`_scan-ts-visual.txt`。

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

## 8. 复检记录表（G2 / G2b / G2c 已填）

> 复检基线：`ad7ea0a` → G2 `e6e57b7`（2026-10-19 01:59:53）→ G2b `2b79fb9`（2026-10-19 02:58:06，工作区 clean）。G2 复检时间 02:00–03:00，G2b 复检时间 03:0x–03:4x。状态：`已修 / 部分修 / 豁免（需方书面）/ 未修`。证据文件中 `final-*` 为 G2 截图，`g2b-*`/`g2b2-*` 为 G2b 截图（`shots/audits/round1-fluid-visual/`），`_g2-*`/`_g2b*` 为对应日志/扫描。

| 编号 | 基线严重度 | 复检状态 | 复检证据（截图/文件:行/计数） | 复检时间 | 复检人 |
|---|---|---|---|---|---|
| V-01 | P1 | **已修** | `desktop.styles.ts:13` `CARD_RADIUS = 'var(--wtsl-card-radius)'`；`src/styles.css:9` `--wtsl-card-radius: 12px`；DOM 实测 6 张卡片 `border-radius: 12px`（`_g2-measure-host.log`）；截图 `final-desktop-1440x960.png` | 2026-10-19 02:0x | design-auditor |
| V-02 | P1 | **已修** | FLUENT2 §5 已补 token 值映射说明（D-01）；桌面卡片 12px、页面卡片 `ReviewPage.tsx:60`/`PluginsPage.tsx:106` 均改用 `var(--wtsl-card-radius)`；弹层由 Fluent Dialog 默认承载（见 §9.4 P3 备注） | 同上 | design-auditor |
| V-03 | P1 | **已修** | 六插件均 `src/main.jsx` + `FluentProvider` + `@fluentui/react-components`；Fluent JSX 组件计数 clock 19 / countdown 42 / pomodoro 54 / sedentary 46 / todo 163 / weather 73；无小写原生控件（唯一 `<form>` 为语义容器，内部均为 Fluent 组件）；插件 CSS 仅剩视口重置（`base.css` 319B）；设置/详情全部 `?view=` 全窗口浮层（`final-overlay-*.png`，Dialog 880×680、内嵌 iframe 834×582、关闭按钮 40×40）。详见 §9.2 | 同上 | design-auditor |
| V-04 | P1 | **已修（G2b 关闭）** | 天气 `forecast.jsx` 5 处 clamp 字号改为 `fontSizeBase100/200/300/400`，`Card.jsx` 温度统一 `tempBase`+`Base700/800/900` ramp（`Card.jsx:79-160/407-505`）；实测 3×2 字号仅 12/14/16px、4×2 仅 10/12/14/16px（`_g2b2-scenarios.log`）；复扫非 token 字号 5 处均为 todo 配置值/`Temp` 动态 prop（`_g2b-scan-fontsize.txt`），无样式字面量 | 2026-10-19 03:3x | design-auditor |
| V-05 | P1 | **已修（G2b 关闭）** | 天气 `forecast.jsx` 8 处 clamp gap/padding → `spacingHorizontal*/Vertical*`；`CityMenu.jsx` padding/gap token + `minHeight:40`；复扫 gap 非 token 5 处 = 图表条 `panels.jsx:98 '2px'`（值在 ramp、内容图形）+ 归零值/`CELL_GAP` 布局常量；padding 7 处均为 0、margin 12 处均为 0/auto（`_g2b-scan-gap/padding/margin.txt`） | 同上 | design-auditor |
| V-06 | P1 | **已修（G2b 关闭）** | G2b 实测（`_g2b-scenarios.log`/`_g2b3-scenarios.log`）：编辑工具条 5 按钮 **40px**（原 32）；卡片编辑按钮 41；设置纵向 Tab **40**（原 38）；设置/复盘/插件页可交互按钮无 <40；Agent 空态 3 个建议按钮 **40**（原 32）；dock 58×40/50×40；插件任务行 40、月历格 40。原 V-06 记录证据项全部达标。剩余 <40 均为 Fluent 内建控件（Switch 行 36、Input 38、Checkbox 内部 32）与插件空/错误态 CTA 24px → 转记 N-03/N-04（P2） | 同上 | design-auditor |
| V-07 | P1 | **已修** | `PageTransition.tsx` 改为 `createMotionComponent` + 单个 `<div>` child；G2 全部日志 0 条 `react-motion`/`Invalid child element` 报错（`_g2-shots-*.log`） | 同上 | design-auditor |
| V-08 | P1 | **已修** | D-04 落地：`todo/src/sizes.js` rowBudget = 4/6/10；实测 2×2 行数 4、3×2 行数 6、3×3 行数 10、均 40px 行高；4×2 双栏内部滚动（scrollHeight 1040 / clientHeight 270，`_g2-measure-plugins2.log`）；截图 `final-p-todo-*.png` | 同上 | design-auditor |
| V-09 | P2 | **已修（D-04 口径）** | weather 4×2 AQI 分类文字不再裁切（"良" top 190 / bottom 210 / parentBottom 210，`_g2-measure-plugins2.log`）；2×2 逐时 6 项、3×2/4×2 7 天按 D-04「内容列表例外」计；截图 `final-p-weather-*.png` | 同上 | design-auditor |
| V-10 | P2 | **已修** | `weather/src/components/atoms.jsx:117-129` 预警条改为 Fluent `MessageBar`（intent warning）；截图 `final-p-weather-2x2/3x2/4x2.png` | 同上 | design-auditor |
| V-11 | P2 | **已修** | countdown 空态含「添加倒数日」按钮（`CountdownApp.jsx:377-385`，`final-desktop-1440x960.png`）；pomodoro 2×1 有 40px 主按钮（`final-p-pomodoro-2x1.png`）；todo 空态单一主操作（`final-p-todo-2x2.png`） | 同上 | design-auditor |
| V-12 | P2 | **已修** | `SedentaryApp.jsx` 改为状态 Badge + 阈值提示（"距提醒还有 38 分钟"），不再重复数值；截图 `final-p-sedentary-2x1/3x2.png` | 同上 | design-auditor |
| V-13 | P2 | **已修** | `WidgetCard.tsx:217` 新增 `data-edit-scrim` 渐变遮罩（`desktop.styles.ts:107-115`）；截图 `final-desktop-edit-1440x960.png` 内容不再被标题直接压住 | 同上 | design-auditor |
| V-14 | P2 | **豁免（产品决策）** | `docs/DECISIONS.md` D-03：保留常驻 dock，按钮 ≥40px（实测 40px 达标）；审计按 P3 记录 | 同上 | design-auditor |
| V-15 | P2 | **已修** | `ConversationPane` 头部/`MessageBubble` 气泡/来源区/全屏左右竖线已移除（`grep border*` 仅剩 `Composer.tsx:32` 输入区顶线与 `FaceSetup` 头像卡边界，见 §9.4 P3） | 同上 | design-auditor |
| V-16 | P2 | **已修** | 新增 `markdown.ts`：支持带括号 URL、`stripSourceSection` 去重；`MessageBubble.tsx:154` 有 sources 时裁掉正文"来源："清单；placeholder 改为"问点什么…"（`Composer.tsx:188`）；截图 `final-agent-search-1440x960.png`（无原始 markdown、无重复来源） | 同上 | design-auditor |
| V-17 | P2 | **已修（G2c 关闭）** | `85c3962`：pomodoro 最后 1 处「通过宿主 setKeepAwake 实现」→「专注期间不锁屏，结束后自动恢复」；六插件产物全部重建，运行时确认 todo/pomodoro 设置浮层新文案、旧文案 0 命中（`_g2c-scenarios.log`、`_g2c2-scenarios.log`、`g2c-todo-overlay-settings-1440x960.png`、`g2c-pomodoro-overlay-settings-1440x960.png`）；源码复扫 0 处工程术语 | 2026-10-19 03:4x | design-auditor |
| V-18 | P2 | **已修** | 插件 CSS 140 条 hex 兜底全部删除（`base.css` 仅视口重置，`_g2-scan-hex.txt` 7 处：4 处天气对比度算法常量、2 处宿主项目 token 声明、1 处演示页）；宿主壁纸改为 `--wtsl-desktop-backdrop` token（`src/styles.css:10-14`） | 同上 | design-auditor |
| V-19 | P2 | **已修** | 非 token 圆角 0（唯一 `CARD_RADIUS` 为项目 token）、非 token 阴影 0（`_g2-scan-radius/shadow.txt`）；`ReminderDialog` 不再覆写 `shadow64`/加边框（`ReminderDialog.tsx:37` 注释）；插件状态光晕/inset 阴影已移除 | 同上 | design-auditor |
| V-20 | P2 | **已修** | `src/styles.css` 壁纸/前景/字体集中为项目 token（`:root`），dock 间距/圆角/阴影/背景全部 `var(--spacing*/--borderRadius*/--shadow*/--color*)`，无 rgba fallback | 同上 | design-auditor |
| V-21 | P2 | **已修** | 复盘空态仅保留「重新读取」一个入口（`final-review-1440x960.png`，实测 refreshBtns=1）；插件管理"操作"列改为启用/禁用 Switch（`PluginsPage.tsx:160-176`），浏览器模式不渲染删除按钮；截图 `final-plugins-1440x960.png` | 同上 | design-auditor |
| V-22 | P2 | **已修** | `breakpoints.ts` 新增 480/360 断点（8/6/4/3/2 列）；320×640 实测 `scrollWidth=clientWidth=320`，2 列布局无横向溢出；截图 `final-desktop-320x640.png`（竖向仍为"一屏不滚动"，320 宽下部分组件在视口外，属产品最小窗口定义，见 §9.4 P3） | 同上 | design-auditor |
| V-23 | P2 | **已修** | 宿主页面（桌面/编辑/三页面/Agent 三形态）G2 日志 0 条 Keyborg 报错（`_g2-shots-plain.log`、`_g2-shots-remaining.log` 中 Keyborg 仅出现在 `src/host/agent/demo.html` 演示页，见 §9.4 P3） | 同上 | design-auditor |
| N-01 | G2 新增 P2 | **已修（G2b）** | countdown 3×2 改为单个「⋯」Menu（`CountdownApp.jsx:424-452`），aria-label=倒数日操作，菜单项「新增倒数日/设置」；实测 header 仅 1 个按钮（`_g2b-scenarios.log`），截图 `g2b-countdown-3x2.png`、`g2b-countdown-3x2-menu.png` | 2026-10-19 03:3x | design-auditor |
| N-02 | G2 新增 P2 | **已修（G2c 提交确认）** | pomodoro 1×1 进度指示：`role=progressbar` 1 个；`85c3962` 提交 `PomodoroApp.jsx` progressBar + 重建产物（787KB）；截图 `g2c-pomodoro-1x1.png`（专注 12:57 + 顶部进度条） | 2026-10-19 03:4x | design-auditor |
| N-03 | G2b 新增 P2 | **已修（G2c 关闭）** | `src/styles.css` + 六插件 `base.css`/`weather.css` 追加 `.fui-Input/Switch/Checkbox/Radio/Slider/Dropdown { min-height:40px }`；G2c 实测：设置页 Switch **40**/Tab 40、插件页 6 Switch 全 **40**、below40=0；weather 设置浮层 13 个控件根元素全 **40**、below40=0；Agent 设置对话框 14 个控件全 **40**、below40=0（`_g2c-scenarios.log`、`_g2c2-scenarios.log`）。Fluent 内部 input/trigger 38/20px 属内部几何（根命中区 40），记 P3 | 2026-10-19 03:4x | design-auditor |
| N-04 | G2b 新增 P2 | **已修（G2c 关闭）** | `85c3962`：weather NoKey/ErrorState CTA 与 todo 空态 CTA 改 `size="large"`；G2c 实测 weather NoKey「去设置填 Key」129×**40**、「使用演示数据」130×**40**；todo 空态「新建任务」98×**40**；below40=0（`g2c-weather-nokey.png`、`g2c-todo-empty-2x2.png`）。todo Tag 删除按钮约 20px 属 Fluent Tag Pattern 内部，记 P3 | 2026-10-19 03:4x | design-auditor |
| N-05 | G2b 新增 P2 | **已修（G2c 关闭）** | `85c3962`：`node scripts/build-plugin.mjs --all` 重建六插件产物（`app.js` 均 03:23 更新）；`todo/app.js` 旧文案「按 Fluent type ramp 切档」0 命中、新文案命中；`pomodoro/app.js` 旧「通过宿主 setKeepAwake 实现」0 命中、新文案命中；运行时 `?view=settings` 新文案已确认（`g2c-todo-overlay-settings-1440x960.png`、`g2c-pomodoro-overlay-settings-1440x960.png`）；`RELEASE.md` §1 已加产物重建核对项 | 2026-10-19 03:4x | design-auditor |

---

## 9. G2 复检详情（`e6e57b7`，2026-10-19）

### 9.1 复检方法与环境

- **对象**：修复后提交 `e6e57b7`（2026-10-19 01:59:53），复检时 `git status` 干净。
- **依据**：`docs/FLUENT2.md`、`docs/DENSITY.md`、`docs/DESIGN.md`、`docs/PLUGIN-REACT.md`、`docs/DECISIONS.md`（D-01~D-05 / D-02b）、`docs/releases/RELEASE.md` §3。
- **工具**：Edge 155.0.4283.62 headless + CDP（`scripts` 外置审计脚本：截图/DOM 测量/`postMessage` 触发插件浮层）；静态扫描 PowerShell/ripgrep；对照 `shots/audits/round1-fluid-visual/final-*.png` 与 `_g2-*.txt`。
- **运行时**：dev server `http://localhost:5173`（Vite），深色主题；插件浮层通过页面内 `contentWindow.eval("parent.postMessage({type:'plugin:request-overlay'…})")` 触发（与真实插件点击同一协议）。
- **限制**：宿主亮色主题仍无 headless 入口（未截图，静态 token 覆盖已查）；Toast 仍无 URL 触发入口（静态审查 Fluent `Toaster`，未变）；插件独立页截图含 `?demo=1` 演示数据，宿主截图前已清空 localStorage。

### 9.2 新增判定（D-02b / 浮层机制）

| 插件 | `src/main.jsx` + `FluentProvider` | Fluent JSX 组件数 | 原生控件 | 设置/详情浮层（`?view=`） |
|---|---|---|---|---|
| clock | ✓ | 19 | 无 | settings ✓（`final-overlay-clock-settings-1440x960.png`） |
| countdown | ✓ | 42 | 无 | settings / edit ✓（`final-overlay-countdown-settings-1440x960.png`） |
| pomodoro | ✓ | 54 | 无 | settings / detail ✓（`final-overlay-pomodoro-detail-1440x960.png`） |
| sedentary | ✓ | 46 | 无 | settings / detail ✓（`final-overlay-sedentary-settings-1440x960.png`） |
| todo | ✓ | 163 | 仅 `<form>` 语义容器 | settings / detail / all ✓（`final-overlay-todo-settings-1440x960.png`） |
| weather | ✓ | 73 | 无 | settings / detail ✓（`final-overlay-weather-detail-1440x960.png`） |

- **浮层机制核查**：宿主机 `src/host/plugins/PluginWidgetFrame.tsx:259-267` 接收 `plugin:request-overlay` → `openOverlay` → `?view=<name>` 加载同页 iframe，装在 Fluent `Dialog`（实测 880×680，内嵌 iframe 834×582，关闭按钮 40×40，Esc 关闭协议 `plugin:request-overlay-close`）。逐插件截图中**未出现 iframe 卡片内被裁切的 Dialog/Drawer**；插件内 `grep Dialog/Drawer` 无卡片视图内弹层（`CountdownEditor`/`SettingsView` 等均为 `?view=` 独立视图）。
- **V-03 判定：已修（P1 关闭）**，满足 D-02b「全部 React + Fluent UI React、不自绘控件」。

### 9.3 静态扫描统计（G2 vs 基线）

| 扫描项 | 基线（ad7ea0a） | G2（e6e57b7） | 说明 |
|---|---|---|---|
| 手写 hex | 151 处 / 7 文件 | **7 处 / 3 文件** | 4 处为天气 `utils.js:29-50` 对比度**算法常量**；2 处为 `src/styles.css:13-14` **项目 token 声明**（D-01/材质例外）；1 处为 Agent 演示页背景。组件样式 0 处 |
| 非 token 字号 | 113 / 153（74%） | **10 处** | 均为 weather `clamp()` 端点（9/10/11/16px）与配置值，见 §9.4 |
| 非 token 间距 gap | 113 / 152（74%） | **11 处** | weather clamp 1/2px + 归零/布局常量，见 §9.4 |
| 非 token padding / margin | 101/124、42/53 | **10 / 12 处** | 0、auto、`clamp(2px…)` 等，无任意大间距 |
| 非 token 圆角 / 阴影 | 15/92、8/21 | **3 / 0 处** | 3 处均为 `CARD_RADIUS = var(--wtsl-card-radius)`（项目 token，非字面量） |
| 自定义动效时长/曲线 | 0（2 处 reduced-motion 例外） | **0** | 全部 `motionTokens`/`--duration*/--curve*` |
| 插件 CSS 手绘控件 | 5 插件自绘 | **0** | 六插件 `base.css` 仅视口重置（各 319–366B） |

扫描原始输出：`docs/audits/round1-fluid-visual/_g2-scan-{hex,fontsize,radius,shadow,gap,padding,margin}.txt`；G2b 复扫见 §9.8.3（文件 `_g2b-scan-*.txt`）。

### 9.4 残留问题清单（G2 时点；G2b 收口结果见 §9.8）

| 编号 | 级别 | 状态 | 内容 | 证据 |
|---|---|---|---|---|
| V-06 | **P1 残留** | 部分修 | host 页面级按钮（`返回桌面`/`复盘`/`退出应用`/`Agent 复盘`/`重新读取`/`重新扫描`）32px；编辑工具条 5 按钮 32px；Agent 空态建议按钮 340×32；设置纵向 Tab 38px | `_g2-measure-host.log`；`final-settings-1440x960.png`、`final-desktop-edit-1440x960.png`、`final-agent-overlay-1440x960.png` |
| V-04 | P2 残留 | 部分修 | weather `forecast.jsx:118/123/128` 等 `clamp()` 端点 9/10/11px 非 type ramp | `_g2-scan-fontsize.txt` |
| V-05 | P2 残留 | 部分修 | weather `forecast.jsx:14/24/27/51/59/61/66/91`、`panels.jsx:98`、`CityMenu.jsx:31` clamp/`6px` 非 spacing ramp | `_g2-scan-gap.txt`、`_g2-scan-padding.txt` |
| V-17 | P2 残留 | 部分修 | 5 处工程文案：`PomodoroSettings.jsx:160`（WebAudio 合成，不联网）、`PomodoroDetail.jsx:111`（Session 记录）、`todo/src/settings.jsx:179`（Fluent type ramp）、`PluginsPage.tsx:406`（isPluginEnabled）、`PluginsPage.tsx:339/:423`、`Desktop.tsx:1023`（index.json/manifest.json） | 对应文件行；`final-overlay-pomodoro-detail-1440x960.png`、`final-overlay-todo-settings-1440x960.png` |
| N-01 | **P2 新增** | 未修 | countdown 3×2 正常模式常驻「设置」齿轮（`CountdownApp.jsx:431-439`），违反 DENSITY 硬规则 3 / §4 countdown「齿轮（如有）去掉」 | `final-p-countdown-3x2.png` |
| N-02 | **P2 新增** | 未修 | pomodoro 1×1 无进度指示（组件规格要求 1×1 = 剩余时间 + 环形进度 + 阶段；实测 `role=progressbar` 0 个，仅文字） | `_g2-measure-plugins2.log`；`final-p-pomodoro-1x1.png` |

**P3 备注（不计入违规）**

1. `V-14` dock 保留（D-03 产品决策），按钮 40px 达标。
2. `Composer.tsx:32` 输入区顶部 1px 分隔线保留（输入区边界，非内容分组；DENSITY 原条款针对卡片内部）。
3. `weather/src/utils.js:29-50` 4 处 hex 为对比度算法常量（非样式 token，函数内计算用），建议后续改用相对亮度函数参数化。
4. 插件独立页（无宿主 `host:init`）时钟为白底主题回退（`final-p-clock-2x1.png`）；产品内始终由宿主注入主题，不影响发布。
5. 320×640 下桌面按"一屏不滚动"定义仅显示前 4 个组件，todo/weather 在视口外；属产品最小窗口定义，建议 Tauri 窗口设 `minWidth ≥ 960` 并在发布说明记录。
6. `sedentary` 3×2 展示「今日久坐/起身次数」与 DENSITY §4 组件级表述「只留状态点+连续分钟+打卡」存在措辞冲突，但符合 §2 预算表（Secondary 5 项）与组件文档，建议修订 DENSITY 组件段。
7. `pomodoro` 3×2 视觉重心略偏下（progress 条 + 大时间），不影响信息层级。
8. Fluent Dialog 默认圆角 8px（`PluginWidgetFrame`/`ReminderDialog` 未覆写），与 D-01「弹层卡片统一 12px」措辞不一致，建议 D-01 补「Dialog 沿用 Fluent 默认」例外。
9. Agent 演示页（`src/host/agent/demo.html`）仍打印 Keyborg disposal warning；产品宿主页面 0 报错（V-23 已修）。

### 9.5 文档口径一致性复核

| 文档 | 与实现/决策一致性 | 备注 |
|---|---|---|
| `DECISIONS.md` D-01（卡片 12px） | ✓（桌面/页面卡片均为 `--wtsl-card-radius`） | P3-8 弹层 Dialog 默认 8px 建议补例外 |
| `DECISIONS.md` D-02b（插件 React+Fluent） | ✓（六插件全部达标，§9.2） | — |
| `DECISIONS.md` D-03（dock 保留、≥40） | ✓（实测 40px） | — |
| `DECISIONS.md` D-04（内容列表例外/行数上限） | ✓（todo 4/6/10 行、weather 2×2 逐时 6） | — |
| `FLUENT2.md` §5 token 值映射 | ✓（已补说明，实现用项目 token） | — |
| `FLUENT2.md` §14 item 5/9 | 基本一致 | item 5 称"由组件默认字阶保证"，weather clamp 残留（P2）建议补一句例外 |
| `DENSITY.md` §2 内容列表例外 | ✓ | 与 D-04 数值一致 |
| `DESIGN.md` §1.1 断点 8/6/4/3/2 | ✓（`breakpoints.ts:30-34`） | — |
| `DESIGN.md` §3 插件 React 约定 / §1.2 触控 40 | React 约定 ✓；触控仍有 V-06 残留 | — |
| `RELEASE.md` §3 设计合规 | 已含新增 React/浮层检查项 | "无手写 hex、无非 token 字号"与 weather clamp 残留不完全一致（P2） |
| `PLUGIN-REACT.md` | ✓（入口/主题/浮层/触控约定与实现一致） | — |

### 9.6 最终判定

- **P0 = 0**（无阻断）。
- **P1 残留 = 1（V-06 触控目标）**：11 项基线 P1 中已关闭 7 项；V-04/V-05 按 D-02b 新口径降为 P2；V-06 大部分已修，仅剩 **host 页面级按钮 / 编辑工具条 / Agent 空态建议按钮 32px + 设置 Tab 38px**。
- **P2 残留 = 5**（V-04 weather clamp、V-05 weather clamp、V-17 文案、N-01 countdown 齿轮、N-02 pomodoro 1×1 进度）；均有明确修法、不阻断发布。
- **可发布判定：有条件可发布**。
  1. **必须**：关闭 V-06 残留（统一 `size="large"`/`minHeight:40`，预计 30 分钟）——或由需求方在 `DECISIONS.md` 书面豁免「Fluent 默认 32px 控件」；
  2. **必须**：N-01 倒计时齿轮移入 `⋯`/长按菜单（3 行改动）；
  3. **建议本迭代**：V-17 文案清理、V-04/V-05 weather clamp 端点改为 ramp 值、N-02 1×1 进度指示；
  4. 发布说明记录 P3 项（dock 决策、320 最小窗口、Dialog 圆角例外）。
  
  满足 1+2 后，P0=0 / P1=0，可发布。

### 9.7 G2 截图遗漏与替代证据

- 插件 1×1/2×2 等未逐尺寸截图（clock 1×1/3×2、countdown 1×1/2×2、sedentary 1×1/2×2、todo 1×1、weather 1×1/2×1）：以宿主桌面在 1440×960/1024×768/960×1440 三档的实测卡片 + 代码尺寸分支（`sizes.js`/`sizeKey===` 判定）交叉验证；关键判定（V-03/V-04/V-08/V-11/V-12）均有对应截图或 DOM 实测。
- 亮色主题宿主、Toast 运行时截图仍缺（与基线限制相同）；静态 token 审查覆盖。

### 9.8 G2b 增量复验（`2b79fb9`，2026-10-19 03:0x–03:4x）

**对象**：收口提交 `2b79fb9`（2026-10-19 02:58:06，工作区 clean；`npm run build` exit 0 — Lead 提供）。复验方式：同一 CDP 脚本（`wtsl-g2.mjs`）跑三组场景（`_g2b-scenarios.log` 15 场景、`_g2b2-scenarios.log` 12 场景、`_g2b3-scenarios.log` 7 场景）+ 静态复扫（`_g2b-scan-*.txt`）+ 截图 `g2b-*.png`/`g2b2-*.png`。G2b 环境为同一 dev server/深色主题，浏览器新 profile（截图前清空 localStorage）。

#### 9.8.1 收口项判定

| 项 | 状态 | 实测/证据 |
|---|---|---|
| V-04 字号 ramp | **已修（关闭）** | 天气 `forecast.jsx` 5 处 clamp 字号 → `fontSizeBase100/200/300/400`；`Card.jsx` 温度 `tempBase`+`Base700/800/900`；3×2 实测字号集合 = {12,14,16}px、4×2 = {10,12,14,16}px（全部 ramp）；复扫非 token 字号仅 5 处（todo 配置值/动态 prop），无样式字面量 |
| V-05 间距 ramp | **已修（关闭）** | 天气 8 处 clamp gap/padding → `spacingHorizontal*/Vertical*`；CityMenu padding/gap token + minHeight 40；复扫 gap 非 token 5 处（图表条 2px 在 ramp + 归零/布局常量）、padding 7 处均为 0、margin 12 处均为 0/auto |
| V-06 触控目标 | **已修（关闭，原证据项）** | 编辑工具条 5 按钮 **40px**；卡片编辑按钮 41；设置 Tab **40**；设置/复盘/插件页按钮无 <40；Agent 空态建议按钮 **3×40**；dock 58×40/50×40。原 V-06 记录证据项全部达标。剩余 Fluent 内建控件/插件空态 CTA → 转记 N-03/N-04（P2，见 9.8.2） |
| V-17 工程文案 | **部分修（P2 残留）** | 已生效：weather/plugins/desktop/pomodoro settings/detail、todo **src** 均已改；残留：① `PomodoroSettings.jsx:174`「通过宿主 setKeepAwake 实现」（bundle 内含）；② todo 产物未重建，运行时 `?view=settings` 仍显示旧文案（详见 N-05） |
| N-01 倒数日齿轮 | **已修（关闭）** | 3×2 header 仅「倒数日 5 项 + ⋯」；`aria-label=倒数日操作`；菜单项「新增倒数日/设置」；截图 `g2b-countdown-3x2.png`、`g2b-countdown-3x2-menu.png` |
| N-02 番茄 1×1 进度 | **已修（工作区未提交，见 §9.8.6）** | 1×1 实测 `role=progressbar` 1 个；截图 `g2b-pomodoro-1x1.png`（短休 05:00 + 顶部进度条）。注：该 `progressBar` 改动位于工作区（03:01 修改 `PomodoroApp.jsx` + 重建 `pomodoro/app/app.js`），不在 `2b79fb9` 提交内，发布前需一并提交 |

#### 9.8.2 残留问题（G2b）

| 编号 | 级别 | 状态 | 内容 | 证据 |
|---|---|---|---|---|
| N-03 | P2 | 未修 | Fluent 内建表单控件默认高度 <40：设置页/插件页 Switch 行 36px、weather 设置浮层 Input 38px、Checkbox 内部 32px（行容器 40）；若严格按 D-05「统一 ≥40」需统一 `size="large"`，或在 DECISIONS 记录「Fluent 内建控件按官方默认密度」例外 | `_g2b2-scenarios.log`、`_g2b3-scenarios.log` |
| N-04 | P2 | 未修 | 插件空/错误态 CTA 24px：weather NoKey「去设置填 Key」88×24、「使用演示数据」90×24（截图 `g2b2-weather-nokey.png`），ErrorState「重试」同；todo 3×3「添加任务」38px；todo Tag 删除按钮约 20px（Fluent Tag 内部，属 Pattern 例外） | `_g2b3-scenarios.log`、`_g2b2-scenarios.log`、截图 `g2b2-weather-nokey.png` |
| N-05 | P2（发布前必须） | 未修 | **插件构建产物与源码不同步**：`2b79fb9` 只重建 countdown/weather 的 `app/app.js`；todo（src 已改）与 pomodoro（src 已改）的产物未随 commit 重建。实测 todo `?view=settings` 仍显示「按 Fluent type ramp 切档，不做连续缩放」（`g2b2-overlay-todo-settings-1440x960.png`；`todo/app/app.js` grep 命中），即 V-17 的 todo 修复运行时未生效。发布前必须 `node scripts/build-plugin.mjs --all` 并核对产物与 src 一致（建议纳入 RELEASE 清单） | `_g2b2-scenarios.log`、`g2b2-overlay-todo-settings-1440x960.png`、`git diff --name-only e6e57b7..HEAD` |

**P3 备注（G2b 新增）**

1. 天气详情分钟级降水图表 `panels.jsx:98 gap:'2px'`（值在 spacing ramp、属内容图形，非分组间距）。
2. Fluent `Checkbox` 内部 input 32×32 但任务行容器 `role=checkbox` 实测 40px（有效触控目标达标）。
3. todo Tag 删除按钮为 Fluent Badge 内部 dismiss（约 20px），属 Fluent Pattern 自带密度。
4. `_g2b-scenarios.log` 中曾出现 1 次瞬态 `Minified React error #520`（来自插件页），后续 3 组场景（含同页面）未复现；判定为 dev server/热更瞬态，未列入缺陷，建议发布前在 Tauri 真窗口再冒烟一次。
5. G2b 首次 `g2b2-agent-empty-clean` 截图中宿主曾显示「没有找到可用的插件」错误条（清空 localStorage 后首屏瞬态），后续 `g2b3-console-desktop` 复测 6 卡片、0 alert，未复现；非产品缺陷。
6. 秒数等既有 P3 项不变（见 §9.4）。

#### 9.8.3 G2b 复扫统计（`2b79fb9`）

| 项 | G2（`e6e57b7`） | G2b（`2b79fb9`） | 说明 |
|---|---|---|---|
| 手写 hex | 7 | **7** | 4 处天气对比度算法常量 + 2 处宿主项目 token 声明 + 1 处演示页；组件样式 0 |
| 非 token 字号 | 10 | **5** | 全部为 todo 配置值（'default'/'large'）与 `Temp` 动态 prop；无样式字面量 |
| 非 token gap | 11 | **5** | 图表条 2px（值在 ramp）+ 归零 `0`/`CELL_GAP` 布局常量；无 clamp 间距 |
| 非 token padding / margin | 10 / 12 | **7 / 12** | 全部为 0、auto（结构性归零） |
| 非 token 圆角 / 阴影 | 3 / 0 | **3 / 0** | 圆角 3 处均为 `CARD_RADIUS = var(--wtsl-card-radius)`（项目 token，非字面量） |
| 自定义动效时长/曲线 | 0 | **0** | 全部 `motionTokens` |
| 插件 CSS 手绘控件 | 0 | **0** | 六插件 `base.css` 仅视口重置 |
| clamp 字号/间距（插件样式） | 残留 13 处 | **0** | 复扫插件 src 无 `fontSize` 字面量、无 clamp gap/padding；仅内容图形尺寸保留 clamp（图标/AQI 环/进度条宽，符合 FLUENT2 §14 item5 例外） |

#### 9.8.4 文档口径复核（G2b）

| 文档 | 结论 |
|---|---|
| `DECISIONS.md` D-01 | ✓ 已补 Dialog 默认圆角例外，与实现（`PluginWidgetFrame`/`ReminderDialog` 不覆写）一致 |
| `DECISIONS.md` D-05 | ✓ 已更新 V-06 收口；但「实测 0 项 <40」应限定为「按钮类/原记录项」——本轮实测仍存在 Fluent 内建控件 32–38px（N-03），建议补一句口径说明 |
| `FLUENT2.md` §14 item5 | ✓ 已注明天气 clamp 字号改 token、仅内容图形保留 clamp，与实现一致 |
| `RELEASE.md` §3 | ✓ 已补样式例外说明；建议再补「插件产物必须重建（`build-plugin.mjs --all`）并核对 src」一条，对应 N-05 |
| `DENSITY.md` | 无需变更（D-04 例外已在 G2 记录） |
| `PLUGIN-REACT.md` | 无需变更（构建/产物约定已写，但需在发布检查中执行） |

#### 9.8.5 复验期间的工作区漂移（需 Lead 处置）

G2b 复验开始时（02:58）lead 声称工作区 clean（`2b79fb9`）；复验过程中（03:19 读取 `git status`）发现 **3 个未提交变更**，均不属于本次审计写入（审计仅改 `docs/audits/round1-fluid-visual/**`）：

| 文件 | 变更 | 影响 |
|---|---|---|
| `public/plugins/pomodoro/src/PomodoroApp.jsx`（+1 行 `{progressBar}` 于 1×1） | N-02 修复 | N-02 判定依据来自工作区快照而非 `2b79fb9`；发布前需提交 |
| `public/plugins/pomodoro/app/app.js`（5 行） | 上项的构建产物 | 同上 |
| `src-tauri/tauri.conf.json`（+`minWidth:960`、`minHeight:640`） | 对应 G2 P3-5「320 最小窗口」建议 | 已在配置层解决，发布前需提交 |

**结论**：本报告的 G2b 判定以 **03:2x 工作区快照**为准（含上述 3 项）；其中 N-02 若按 `2b79fb9` 提交严格判定应为「未修（P2）」，但工作区已有修复。**发布前请把这 3 项与 N-05 的重新构建一并提交**，并在提交后复核 `git status` 干净。

#### 9.8.6 最终判定（G2b）

- **P0 = 0；P1 = 0**（基线 P1 8 项全部关闭；G2 唯一残留 V-06 本轮实测原证据项全部达标）。
- **P2 = 4**：V-17 部分（1 处 setKeepAwake 文案 + todo 产物未重建）、N-03（Fluent 内建控件默认密度）、N-04（插件空/错误态 CTA 24px）、N-05（构建产物不同步）。
- **P3 = 14**（§9.4 与 §9.8.2 累计备注项）。
- **结论：可发布（设计维度，P1=0）**。发布前必须完成：
  1. **提交工作区 3 项未提交变更**（pomodoro N-02 修复 + 产物、`tauri.conf.json` minWidth/minHeight），
  2. **执行 N-05**：`node scripts/build-plugin.mjs --all` 重建全部插件 `app.js`（至少 todo），并核对运行时文案（如 todo 设置浮层不再出现「Fluent type ramp」），建议写入 `RELEASE.md` §1 并附证据；
  3. 发布后 `git status` 干净。
  N-03/N-04/V-17 1 处文案不阻断发布，可在下一迭代处理，或由需求方在 `DECISIONS.md` 记录「Fluent 内建控件按官方默认密度」等例外。

### 9.9 G2c 最终确认（`85c3962`，2026-10-19 03:3x–03:5x）

**对象**：`85c3962`（2026-10-19 03:30:44；工作区仅 1 个未跟踪文件 `docs/releases/RELEASE-REPORT.md`，为 Lead 的发布报告，非本次审计写入）。G2b §9.8.5 记录的 3 项未提交变更（pomodoro progressBar、其产物、tauri minWidth/minHeight）均已包含在本提交中。

**复验方式**：CDP 场景 `_g2c-scenarios.log`（12 个）+ `_g2c2-scenarios.log`（3 个定向复测）；静态复扫 `_g2c-scan-*.txt`；截图 `shots/audits/round1-fluid-visual/g2c-*.png`。

#### 9.9.1 收口验证

| 项 | 状态 | 实测/证据 |
|---|---|---|
| N-02 番茄 1×1 进度 | **已修（关闭）** | `PomodoroApp.jsx` 1×1 分支 `{progressBar}` + 产物重建；实测 `role=progressbar`=1；截图 `g2c-pomodoro-1x1.png` |
| N-03 Fluent 控件触控 | **已修（关闭）** | 宿主与六插件 CSS 追加 `.fui-Input/Switch/Checkbox/Radio/Slider/Dropdown{min-height:40px}`；实测：设置页 Switch **40**、Tab 40、below40=0；插件页 6 个 Switch 全 **40**、below40=0；weather 设置浮层 13 个控件根元素全 **40**、below40=0；Agent 设置对话框 14 个控件全 **40**、below40=0。内部 `.fui-Input__input` 38 / `.fui-Dropdown__button` 38 / `.fui-Slider__input` 20 为 Fluent 内部几何（根命中区 40），记 P3 |
| N-04 空/错误态 CTA | **已修（关闭）** | weather NoKey「去设置填 Key」129×**40**、「使用演示数据」130×**40**（`g2c-weather-nokey.png`）；todo 空态「新建任务」98×**40**（`g2c-todo-empty-2x2.png`）；below40=0 |
| N-05 产物同步 | **已修（关闭）** | 六插件 `app.js` 均于 03:23 重建；`todo/app.js` 旧文案「按 Fluent type ramp 切档」0 命中、新文案命中；`pomodoro/app.js` 旧「通过宿主 setKeepAwake 实现」0 命中、新文案命中；运行时 todo/pomodoro `?view=settings` 均显示新文案（`g2c-todo-overlay-settings-1440x960.png`、`g2c-pomodoro-overlay-settings-1440x960.png`）；`RELEASE.md` §1 已加「插件产物必须重建核对」检查项 |
| V-17 工程文案 | **已修（关闭）** | 最后 1 处 `setKeepAwake` →「专注期间不锁屏，结束后自动恢复」；源码复扫 0 处工程术语；运行时文案已确认 |

#### 9.9.2 回归与视觉检查

- 宿主桌面 `g2c-desktop-1440x960.png`：6 卡片、0 alert、卡片圆角 12px、无 console 报错；dock 40px。
- 设置页 `g2c-settings-1440x960.png`：Switch 行因触控规则略增高（40），布局无破版；纵向 Tab 40。
- 插件管理页 `g2c-plugins-1440x960.png`：6 个 Switch 全 40，表格布局正常。
- weather 设置浮层 `g2c-weather-overlay-settings-1440x960.png`：Input/Switch/Radio 根元素 40，内容可滚动，无裁切破版。
- Agent 设置对话框 `g2c-agent-settings-1440x960.png`：14 个控件根元素 40，对话框 720×814 在视口内，布局正常。
- weather 3×2 `g2c-weather-3x2.png`：字号仅 12/14/16px（ramp），无溢出；todo 空态 `g2c-todo-empty-2x2.png` CTA 40。
- G2c 全部场景无 console error/warning 输出。

#### 9.9.3 复扫统计（G2c）

| 项 | G2b | G2c | 说明 |
|---|---|---|---|
| 非 token 字号 / gap / padding / margin | 5 / 5 / 7 / 12 | **5 / 5 / 7 / 12** | 全部为配置值、`0`/`auto` 或内容图形常量，无样式违规 |
| 非 token 圆角 / 阴影 | 3 / 0 | **3 / 0** | 圆角 3 处均为 `CARD_RADIUS = var(--wtsl-card-radius)`（项目 token） |
| 手写 hex | 7 | **7** | 4 天气对比度算法常量 + 2 项目 token 声明 + 1 演示页；组件样式 0 |
| 自定义动效时长/曲线 | 0 | **0** | 全部 `motionTokens` |
| clamp 字号/间距（插件样式） | 0 | **0** | 仅内容图形尺寸保留 clamp（图标/AQI 环等，FLUENT2 §14 item5 例外） |

扫描文件：`docs/audits/round1-fluid-visual/_g2c-scan-*.txt`。

#### 9.9.4 P3 备注清单（14，不阻断发布）

1. V-14 桌面 dock 保留常驻（D-03 产品决策，按钮 40px 达标）。
2. `Composer.tsx:32` 输入区顶部 1px 分隔线（结构边界，非内容分组）。
3. `weather/src/utils.js:29-50` 4 处 hex 为对比度算法常量（非样式 token）。
4. 插件独立页无宿主 `host:init` 时主题回退为浅色（产品内始终由宿主注入主题）。
5. Fluent 内部元素尺寸：`fui-Input__input` 38、`fui-Dropdown__button` 38、`fui-Slider__input` 20（外层命中区 40）。
6. todo Tag 删除按钮约 20px（Fluent Tag Pattern 内部 dismiss）。
7. 天气分钟级降水图表 `panels.jsx:98 gap:'2px'`（值在 spacing ramp，内容图形）。
8. 弹层 Dialog 沿用 Fluent 默认 8px 圆角（D-01 已记录例外）。
9. Keyborg disposal 告警仅出现在 `src/host/agent/demo.html` 演示页（产品页面 0 条）。
10. G2b 期间出现 1 次瞬态 `Minified React error #520`（插件页），后续多轮未复现。
11. 320px 窄屏下桌面按"一屏不滚动"仅显示部分组件（`tauri.conf.json` 已设 minWidth 960/minHeight 640，窗口层已限制）。
12. sedentary 3×2 统计项与 DENSITY §4 组件措辞存在冲突，但符合 §2 预算表与组件文档（建议后续修订措辞）。
13. pomodoro 3×2 视觉重心略偏下（progress 条 + 大时间），不影响层级。
14. 时钟秒角标位置（`p-clock-2x1`）为风格偏好。

#### 9.9.5 最终判定与发布建议

- **P0 = 0 / P1 = 0 / P2 = 0 / P3 = 14**。
- **结论：可发布（设计维度）。** 无设计阻断项；G2b 的 4 项 P2 全部关闭；G2c 未引入新违规。
- 发布前剩余事项（非本审计职责，属 `RELEASE.md` 流程）：`npm run typecheck` / `npm run build`（Lead 已报 exit 0）、Tauri 真窗口冒烟（六插件加载/Agent/通知/编辑模式）、提交未跟踪的 `docs/releases/RELEASE-REPORT.md`、最终 `git status` 干净后打 tag/push。
- 发布说明建议见 §0 末尾（触控增强规则、最小窗口 960×640、天气图标例外、CSS 近似材质、dock 常驻决策）。

---

## 附录 A：截图索引（`shots/audits/round1-fluid-visual/`）

**宿主（12）**：`host-desktop-1440x960.png`、`host-desktop-1024x768.png`、`host-desktop-960x1440.png`、`host-desktop-edit-1440x960.png`、`host-desktop-edit-1024x768.png`、`host-desktop-edit-960x1440.png`、`host-settings-{1440x960,1024x768,960x1440}.png`、`host-review-{1440x960,1024x768,960x1440}.png`、`host-plugins-{1440x960,1024x768,960x1440}.png`（共 15）

**Agent（11）**：`host-agent-overlay-{1440x960,1024x768,960x1440}.png`、`agent-demo-overlay-{1440x960,1024x768}.png`、`agent-demo-sidebar-1440x960.png`、`agent-demo-fullscreen-{1440x960,960x1440}.png`、`agent-demo-voice-1440x960.png`、`agent-demo-settings-1440x960.png`、`agent-demo-search-1440x960.png`

**通知（2）**：`host-reminder-1440x960.png`、`host-reminder-1024x768.png`

**插件（33）**：`p-clock-{1x1,2x1,3x2}.png`、`p-countdown-{1x1,2x1,2x2,3x2}.png`、`p-pomodoro-{1x1,2x1,2x2,3x2}.png`、`p-pomodoro-settings.png`、`p-sedentary-{1x1,2x1,2x2,3x2}.png`、`p-todo-{1x1,2x2,3x2,3x3,4x2}.png`、`p-todo-week-3x3.png`、`p-todo-month-3x3.png`、`p-weather-{1x1,2x1,2x2,3x2,4x2}.png`、`p-weather-light-3x2.png`、`p-weather-detail-hourly.png`、`p-weather-detail-warning.png`、`p-weather-settings.png`、`_sheetA-small.png`、`_sheetB-todo.png`、`_sheetC-weather.png`、`_sheetD-overlays.png`（对照图）

## 附录 B：证据文件

| 文件 | 内容 |
|---|---|
| `docs/audits/round1-fluid-visual/_baseline.txt` | 审计基线时间/git 状态 |
| `docs/audits/round1-fluid-visual/_baseline-manifest.txt` | 137 个源文件 SHA256 快照（22:56） |
| `docs/audits/round1-fluid-visual/_scan-hex.txt` | 151 处 hex 命中明细 |
| `docs/audits/round1-fluid-visual/_scan-radius.txt` / `_scan-shadow.txt` | 圆角/阴影命中 |
| `docs/audits/round1-fluid-visual/_scan-fontsize.txt` / `_scan-gap.txt` / `_scan-padding.txt` / `_scan-margin.txt` | 字号/间距命中 |
| `docs/audits/round1-fluid-visual/_scan-ts-visual.txt` | 宿主 TS 非 token 视觉属性（8 处） |
| `shots/audits/round1-fluid-visual/logs/_shots-plugins2.log` / `_shots-host-final.log` | 最终截图批次日志（含控制台报错原文） |
| `shots/audits/round1-fluid-visual/logs/_shots-host2.log` / `_shots-log.txt` | 过程截图日志（基线期间，供追溯） |

---


## 附录 C：G2 截图索引（`shots/audits/round1-fluid-visual/final-*.png`）

**宿主（19）**：`final-desktop-{1440x960,1024x768,960x1440,320x640}.png`、`final-desktop-edit-{1440x960,1024x768,960x1440}.png`、`final-settings-{1440x960,1024x768,960x1440}.png`、`final-review-{1440x960,1024x768,960x1440}.png`、`final-plugins-{1440x960,1024x768,960x1440}.png`

**Agent（10）**：`final-agent-overlay-{1440x960,1024x768,960x1440}.png`、`final-agent-demo-overlay-1440x960.png`、`final-agent-sidebar-1440x960.png`、`final-agent-fullscreen-1440x960.png`、`final-agent-voice-1440x960.png`、`final-agent-settings-1440x960.png`、`final-agent-search-1440x960.png`

**插件浮层（7）**：`final-overlay-{clock-settings-1440x960,clock-settings-1024x768,countdown-settings-1440x960,pomodoro-detail-1440x960,sedentary-settings-1440x960,todo-settings-1440x960,weather-detail-1440x960}.png`

**插件卡片（16）**：`final-p-{clock-2x1,clock-settings-2x1,countdown-2x1,countdown-3x2,pomodoro-1x1,pomodoro-2x1,pomodoro-3x2,sedentary-2x1,sedentary-3x2,todo-2x2,todo-3x2,todo-3x3,todo-4x2,weather-2x2,weather-3x2,weather-4x2}.png`

**通知（1）**：`final-reminder-1440x960.png`

**对照图（2）**：`_g2-sheet-small.png`、`_g2-sheet-todo-weather.png`

**G2b 截图（`g2b-*.png` / `g2b2-*.png`，2026-10-19 03:0x；`2b79fb9`）**

- 宿主：`g2b-desktop-1440x960.png`、`g2b-desktop-edit-1440x960.png`、`g2b-settings-1440x960.png`、`g2b-review-1440x960.png`、`g2b-plugins-1440x960.png`
- Agent：`g2b-agent-empty-1440x960.png`、`g2b2-agent-empty-1440x960.png`、`g2b2-agent-settings-1440x960.png`
- 插件：`g2b-countdown-3x2.png`、`g2b-countdown-3x2-menu.png`（N-01 证据）、`g2b-weather-3x2.png`、`g2b-weather-4x2.png`、`g2b-pomodoro-1x1.png`（N-02 证据）、`g2b2-weather-nokey.png`（N-04 证据）
- 浮层/文案：`g2b-overlay-weather-settings-1440x960.png`、`g2b-overlay-pomodoro-settings-1440x960.png`、`g2b-overlay-todo-settings-1440x960.png`、`g2b2-overlay-pomodoro-settings-1440x960.png`、`g2b2-overlay-todo-settings-1440x960.png`（N-05 证据：todo 旧文案）

**G2c 截图（`g2c-*.png`，2026-10-19 03:4x；`85c3962` 最终状态）**

- 宿主：`g2c-desktop-1440x960.png`、`g2c-settings-1440x960.png`、`g2c-plugins-1440x960.png`
- Agent：`g2c-agent-settings-1440x960.png`（14 控件 40px）
- 插件/浮层：`g2c-weather-overlay-settings-1440x960.png`（13 控件 40px）、`g2c-weather-nokey.png`（CTA 40px）、`g2c-todo-empty-2x2.png`（CTA 40px）、`g2c-todo-overlay-settings-1440x960.png`（新文案）、`g2c-pomodoro-overlay-settings-1440x960.png`（新文案）、`g2c-pomodoro-1x1.png`（progressbar）、`g2c-weather-3x2.png`

## 附录 D：G2 证据文件

| 文件 | 内容 |
|---|---|
| `docs/audits/round1-fluid-visual/_g2-scan-hex.txt`、`_g2-scan-fontsize.txt`、`_g2-scan-radius.txt`、`_g2-scan-shadow.txt`、`_g2-scan-gap.txt`、`_g2-scan-padding.txt`、`_g2-scan-margin.txt`、`_g2-scan-transition.txt` | G2 静态扫描明细 |
| `shots/audits/round1-fluid-visual/logs/_g2-measure-host.log` | 宿主 DOM 实测（dock/编辑按钮/页面按钮/Tab/320 溢出/Agent 头部） |
| `shots/audits/round1-fluid-visual/logs/_g2-measure-plugins2.log` | 插件 DOM 实测（todo 行高/行数、weather AQI、pomodoro 1×1、countdown 3×2 按钮） |
| `shots/audits/round1-fluid-visual/logs/_g2-shots-plain.log`、`_g2-shots-remaining.log` | G2 截图批次日志（含控制台报错原文：0 条 react-motion；Keyborg 仅演示页） |
| `shots/audits/round1-fluid-visual/logs/_g2-overlays.log`、`_g2-overlay-todo-retry.log` | 插件全窗口浮层截图日志（Dialog 尺寸/关闭按钮 40×40） |
| `docs/audits/round1-fluid-visual/_g2b-scan-*.txt` | **G2b 复扫**（hex/字号/圆角/阴影/gap/padding/margin） |
| `shots/audits/round1-fluid-visual/logs/_g2b-scenarios.log`、`_g2b2-scenarios.log`、`_g2b3-scenarios.log` | **G2b DOM 实测/截图日志**（V-06 高度、N-01/N-02 验证、N-03/N-04 高度、N-05 产物核对） |
| `docs/audits/round1-fluid-visual/_g2c-scan-*.txt` | **G2c 复扫**（与 G2b 一致） |
| `shots/audits/round1-fluid-visual/logs/_g2c-scenarios.log`、`_g2c2-scenarios.log` | **G2c DOM 实测/截图日志**（控件根元素 40、CTA 40、产物文案核对、progressbar） |

> 说明：`_g2b*-scenarios.log` / `_g2c*-scenarios.log` 命中仓库 `.gitignore` 的 `*.log` 规则，仅本地留存；其关键数值已定量写入 §9.8/§9.9，扫描结果（`_g2b-scan-*`、`_g2c-scan-*`）与截图目录另行保存。复现命令与场景 JSON 脚本位于本机 `%TEMP%\wtsl-g2.mjs`、`g2b*-scenarios.json`、`g2c*-scenarios.json`（临时文件，如需归档可在发布前复制进 `docs/audits/round1-fluid-visual/`）。
