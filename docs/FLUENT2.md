# Fluent 2 设计规范（本项目落地版）

> 来源：Fluent 2 官网（fluent2.microsoft.design）15 个设计语言页面，已抓取到本地 `references/fluentui-design/`（design-principles / color / typography / layout / shapes / elevation / material / motion / iconography / accessibility / content-design / design-tokens / handoffs / onboarding / wait-ux）。
>
> 三份文档的分工：
> - **本文**：官方设计语言 → 可执行的视觉规则与数值（颜色/字阶/间距/圆角/阴影/材质/动效/图标/无障碍/文案/等待）。
> - [DESIGN.md](DESIGN.md)：工程约定（插件协议、宿主 API、自适应布局、数据）。
> - [DENSITY.md](DENSITY.md)：信息密度与层级（每尺寸信息预算、渐进披露）。

## 1. 设计原则（官方四条）

| 原则 | 含义 | 本项目对应 |
|---|---|---|
| **Natural on every platform** | 体验适配设备、沿用熟悉模式 | 自适应网格、触控优先、键盘/鼠标都能用 |
| **Built for focus** | 减少视觉噪音，让人保持专注 | 卡片 glanceable、chrome on demand、渐进披露 |
| **One for all, all for one** | 包容不同能力与视角 | 对比度/焦点/缩放、中文界面 |
| **Unmistakably Microsoft** | 一致、可识别的 Microsoft 气质 | Fluent 组件 + token + 动效，不用自造控件 |

## 2. 颜色

**官方结构**：三套色板 —— `neutral`（黑/白/灰，承载表面、文字、层级）、`shared`（跨 M365 组件的强调色，谨慎使用）、`brand`（品牌/主操作）。其中一部分 shared 颜色是 **semantic colors**：只表达反馈/状态/紧急，不做装饰；可与别的指示（图标、文案）配合降低认知负担。

**本项目落地**：

- 只允许用 Fluent token：`colorNeutralBackground*`（表面）、`colorNeutralForeground1/2/3`（文字层级）、`colorNeutralStroke*`（轮廓）、`colorBrandBackground*`（主操作）、`colorStatus*`（semantic）。
- **不手写 hex**；需要新语义色先找 token。
- 层级表达顺序：字号 → foreground 层级 → 间距。颜色最后用。
- **identity 色例外**（Equal Except Hue v2）：每个插件在 manifest 声明一个 `identityHue`，只能取
  blue/pink/orange/green/purple/teal；宿主映射到 Fluent shared palette 的同一档 `Foreground2`
  （同 L* / 同 C*），只允许出现在 20px identity 图标（可选 1 处 2px 状态强调）。
  不承担状态/语义、不用于卡背景/大数字/按钮填充/空态色块、不新增 hex，也不允许插件引用具体 palette token。
- 深色/浅色主题都由 `FluentProvider` 切换，组件不硬编码主题；**默认跟随系统亮暗**（`prefers-color-scheme`），设置页可固定为深色/亮色（DECISIONS D-06）。插件由宿主注入同一主题，独立打开时跟随系统。

## 3. 字体与字阶（官方 type ramp，Web）

| 名称 | 字重 | 字号 / 行高 | 本项目用途 |
|---|---|---|---|
| Caption 2 | Regular | 10 / 14 | 极次要（时间戳、辅助说明） |
| Caption 1 | Regular / Semibold | 12 / 16 | 次要标签、元信息 |
| Body 1 | Regular / Semibold | 14 / 20 | 正文、列表项 |
| Subtitle 2 | Semibold | 16 / 22 | 卡片标题 |
| Subtitle 1 | Semibold | 20 / 26 | 段落小标题 |
| Title 3 | Semibold | 24 / 32 | 页面标题 |
| Title 2 | Semibold | 28 / 36 | 页面大标题 |
| Title 1 | Semibold | 32 / 40 | 强调数值 |
| Large Title | Semibold | 40 / 52 | 主数值（时钟/计时器） |
| Display | Semibold | 68 / 92 | 极限大标题（少用） |

**本项目落地**：

- 字体：`fontFamilyBase`（Segoe UI Variable），中文回退系统字体。
- 组件内字号只取上表对应 token（`fontSizeBase100/200/300/400/500/600/700/800/900/1000`）。
- **hero 数字统一上限**：所有插件主数字引用 `tokens.fontSizeHero900` / `tokens.lineHeightHero900`
  （官方 Large Title：逻辑 40 / 52，200% DPI = 物理 80px）；不再按插件/尺寸选择 48/68/80/96/112，
  也不再按视口 `clamp()` 放大。**不定义项目级字号变量**（纯 token 引用，见 §14 第 5 条）。
  次级数字/标签/说明只用 `Text size` 与 `fontSizeBase*`（title3/body1/caption1）。
  **所有尺寸档同字号**：hero 不随 1×1 / 2×1 / 3×2 放大或缩小；空带 ≤22% 与“行高 44 + 行距 4”同属硬门禁（DENSITY §1.1）。
- 层级用 `colorNeutralForeground1/2/3` 区分，不靠加粗堆叠。

## 4. 布局与间距

**官方要点**：基础单位 **4px**；间距 ramp 包含 2/6/10（为图标对齐 4px 网格）。间距用来表达**分组**，不是画分隔线；更多留白 = 更高重要性；信息过密会让人失去方向。

**本项目落地**：

- 只用 `spacingHorizontal*/spacingVertical*` token（2/4/6/8/10/12/16/20/24/32/40/48）。
- 卡片内分组：组间 ≥ `spacingVerticalM`，组内 ≤ `spacingVerticalXS`。
- 不新增分割线/边框来表达分组（DENSITY 已列为硬规则）。
- 页面级留白：桌面网格 gutter **12**（`spacingHorizontalM`）、页边距由「网格 + 一个 gutter + 说明条实测高」整块严格居中派生 **22 / 27**（`layoutFrame`，1440×960 / `H_p`=26 下；底部 27 = 960 − 933，说明条 pill 下缘 933 也是 chat 入口下缘；`spacingHorizontalXL` 的 20 只是推导 cell 的最小留白，不是最终页边距）；旧的 14px 自定义值与 46/46 口径均已作废（host-impl §2.1、`breakpoints.ts`）。

## 5. 形状与圆角（官方 token）

| Token | 值 | 用途 |
|---|---|---|
| None | 0 | 导航栏、tab bar |
| Small | 2px | 小徽章、小于 32px 的控件 |
| Medium | **4px** | 按钮、下拉（默认圆角） |
| Large | 8px | 大按钮 |
| X-Large | 12px | 浮层、popover、大容器 |
| Circle | 50% | 头像、圆形状态点 |

**本项目落地**：

> **token 值映射注意**：Fluent 2 设计规范的圆角表（Medium 4 / Large 8 / X-Large 12）与 Fluent UI React v9 的 `borderRadius*` token 实际值不完全一致（v9：Medium 4 / Large 6 / X-Large 8 / 2X-Large **12**）。**v9 已有 `borderRadius2XLarge = 12px`**，因此卡片直接引用该 token，项目不再自造 `--wtsl-card-radius`。

- 卡片：**12px**（`tokens.borderRadius2XLarge`，不允许 calc 自造或混用 6/8/16）。
- 按钮/输入框：Medium 4px；小徽章：Small 2px；圆形状态点：Circle。
- 不允许出现规范之外的圆角数值。

## 6. 高度与阴影（官方 shadow ramp）

**官方要点**：阴影 2/4/8/16/28/64 表示从近到远的六档；阴影 = 方向锐利 key shadow + 柔和 ambient shadow；**Windows 用 stroke 而不是 key shadow 来描边**。

**本项目落地**：

- 卡片：`shadow4`（普通）/ `shadow8`（浮起，如被拖动时）；菜单/浮层由 Fluent 组件自带。
- 卡片轮廓用 `colorNeutralStroke2`（stroke 表达边界），**不要同时叠自定义大阴影**（v0.3.0 之前的 `0 18px 40px` 是自定义值，已改为 `shadow4`→hover `shadow8` + `colorNeutralStroke2` 1px 描边，见 §14-2）。
- 对话/抽屉的 scrim 用 Fluent 的 Smoke 语义（Dialog/Drawer 自带 backdrop）。

## 7. 材质

**官方四类**：solid（默认、不透明）、acrylic（半透明磨砂，用于菜单/浮层）、mica（Win11 窗口底材）、smoke（遮罩，永远半透明黑）。

**本项目决定**（已和需求方确认）：

- **不做系统级 Mica/Acrylic**（Web 端无官方实现；Win10 19044 无 Mica）。
- 桌面卡片与面板用 **solid + 半透明 Fluent 颜色 + 单一 `backdrop-filter` 模糊 token**（`--wtsl-material-blur`），这是官方在 web 上"近似材质"的合理做法。
- **v0.4.0 壁纸/材质修复**（DECISIONS D-31）：桌面壁纸层画在 `FluentProvider` 内部最底层（provider 根背景必须透明，否则 v0.3.x 的壁纸被
  `colorNeutralBackground1` 实色盖住）；壁纸用必应每日壁纸 UHD 4K，比例不符时 `object-fit: cover` 填充不拉伸；卡片底色改用
  `colorNeutralBackground1` 72% + 模糊 + `colorNeutralStroke2` 1px 描边，暗色下才浮在壁纸之上。左下角壁纸说明只用 12px / `colorNeutralForeground2/3`。
- **v0.6.0 壁纸修订**（DECISIONS D-37）：说明条从静态文本变成**按钮**——同一套 12px/`fg2`·`fg3` 字阶，底色加
  `color-mix(in srgb, colorNeutralBackground1 78%, transparent)` + 既有单一模糊 token + `borderRadiusCircular`，
  hover/active 只改同一中性面的 `color-mix` 百分比（88% / 72%），不引入新色值；焦点环用 `colorStrokeFocus2`；44×44 命中区由 `::after` 外扩，
  **不改变 26 的视觉高度**（它仍是桌面网格布局的输入 `H_p`）。说明条同时是「欣赏壁纸」模式的入口（点击 / Esc 退出）。
- 弹层/菜单/遮罩一律用 Fluent 组件自带的材质与 scrim，不自己画。

## 8. 动效（官方原则 + 时长/曲线）

**官方原则**：Functional（有目的）、Natural（符合物理：惯性/重力/速度）、Consistent（统一）、Appealing（有温度但不喧宾夺主）。

**官方指导**：

- 元素越大/移动距离越远，时长越长；反之要快。
- 缓动：进入/退出用 ease-out，移动/变换用 ease-in-out；linear 只用于旋转等恒定速率场景。
- 常见过渡：Enter/Exit、容器变形（container transform）、列表 stagger（短偏移，可递减）。

**本项目落地**：

- 只用 `motionTokens` 的时长与曲线（`durationUltraFast/Faster/Fast/Normal/Slow/Slower/UltraSlow`、`curveAccelerate*/curveDecelerate*/curveEasyEase`）。
- Enter/Exit 用 Fluent 的 `createPresenceComponent`；页面切换、编辑模式、拖拽吸附统一走 Fluent 曲线。
- 禁止组件各写一套时长常量（DENSITY 检查项）。

## 9. 图标（官方 Iconography）

**官方要点**：三套图标 —— system / product launch / file。System icons 有两套主题：**Regular**（常规动作/导航）与 **Filled**（选中态或需要更强视觉重量）。12px 图标只传达信息，不用于交互；触摸场景要放大图标；**不缩放图标，而是用对应的尺寸**。

**本项目落地**：

- 界面图标统一 Fluent System Icons；导航/动作 Regular，选中态 Filled。
- 常用尺寸 16 / 20 / 24（共享层 `ICON_SIZE` 阶梯是 16/20/24/32/48：32 给详情空态与内容图形，48 只给天气等内容图形；空态主图标另有 `EMPTY_STATE_ICON_SIZE_LARGE = 40`）；交互目标 ≥ 44×44（见无障碍）。
- 唯一例外：天气现象图标用和风 SVG（Fluent 覆盖不全），只作为内容图形，尺寸/颜色按本规范排。

## 10. 无障碍（官方 A11y）

- 正文对比度 ≥ **4.5:1**；大文本（≥18.5px Bold 或 ≥24px Regular）≥ **3:1**；交互控件与非文本元素 ≥ 3:1。
- 焦点顺序遵循 z 字形（左→右、上→下）；弹窗关闭后焦点要回到触发处（本项目：Agent/Dialog 关闭恢复焦点）。
- 支持 **400% 缩放**与 **320px 宽**回流；文字 200% 缩放不裁切。
- 内容需有可读的 alt/aria-label；键盘可达所有功能（Tab/Enter/Esc/方向键已在桌面层实现）。

## 11. 内容设计（官方 Content Design）

- **sentence case**（句首大写）用于 Windows/Android/web；本项目中文界面 = 短句、不加句号、动词开头。
- UI 元素（标题、按钮、标签、列表）**不加句号**；疑问句用问号；不用感叹号。
- 主动语态、短句、可扫读；一个句子只说一件事。
- 中英文混排：数字与单位之间空格（`25 分钟`），英文词前后留空格。
- 空状态/错误文案：说明现状 + 下一步动作，不超过两行。

## 12. 等待体验（官方 Wait UX）

| 等待时长 | 官方要求 | 本项目落地 |
|---|---|---|
| < 1 秒 | **不显示**任何加载动画 | 插件初始化、配置读写不加 spinner |
| 1–3 秒 | Spinner + `-ing` 文案（"加载中…"） | 天气刷新、复盘聚合、工具调用 |
| > 3 秒 | 进度条或明确的状态文案 | 大模型首包前：立即显示"正在思考…"流式占位 |
| AI 对话 | 响应指示器**立即出现**，不估算时间 | Agent 发送后立刻显示 running 状态与工具卡片 |

- 骨架屏用于内容加载（表格/列表首次渲染），不用 spinner 占位整页。
- 不用多个 spinner 同时出现。

## 13. 上手与引导（官方 Onboarding）

- 首次使用用渐进式引导（coach mark / 空状态里的主操作），不要一次性弹多层教程。
- 空状态负责"教会下一步"，不是展示文档。
- 本项目落地：桌面首次启动已有默认布局；插件空状态里给 1 个主操作（如待办空状态的"添加任务"）。

## 14. 当前项目已知偏离项（审计）

| # | 偏离 | 规范要求 | 处理 |
|---|---|---|---|
| 1 | 卡片圆角 20px | X-Large 12px 上限 | 接入密度返工改为 12 |
| 2 | 卡片阴影 `0 18px 40px` 自定 | shadow4/8 + stroke | 同上 |
| 3 | 每张卡片常驻标题栏/齿轮 | chrome on demand | task-15 处理 |
| 4 | 待办列表元信息过密 | 渐进披露 | task-12 处理 |
| 5 | 插件内字号未统一走 type ramp | 字阶表 | **Equal Except Hue v2 已修**：所有 hero 数字统一 `tokens.fontSizeHero900` / `lineHeightHero900`（40/52），其余文本走 `Text size` / `fontSizeBase*`；仅图标/环形图等内容图形保留像素尺寸 |
| 6 | 桌面网格 gap 14px | 间距 ramp | **已改为 12**（`spacingHorizontalM`）；14 作废，见 host-impl §2.1 |
| 7 | 天气图标非 Fluent | 仅内容图形例外 | 已记录，保持 |
| 8 | CSS 近似材质 | Web 无官方材质 | 已记录，保持单一 token |
| 9 | 插件自绘控件（clock/countdown/pomodoro/sedentary/todo） | 一律用 Fluent UI React 组件 | **已定案：全部迁移到 Fluent UI React + FluentProvider（DECISIONS D-02b），按严格规范执行** |
| 10 | 数字型主信息使用 48–112px（超出 Fluent Display 68px 上限） | 官方字阶最大 Display 68/92 | **Equal Except Hue v2 已收敛**：hero 统一 `fontSizeHero900`/`lineHeightHero900`（40/52），不再使用 48–112；文本/标签不得使用 hero token |
| 11 | 六张卡各有一个 identity 色 | 颜色严格功能化（中性 + 品牌 + 语义） | **Equal Except Hue v2**：manifest `identityHue` → shared palette 同档；只用于 20px 图标（可选 2px 状态强调），不承担语义 |
| 12 | 卡片顶部静态 identity 行（24px） | chrome on demand / 正常模式无标题栏 | **已定案：项目例外（DECISIONS D-33）**，静态无交互、不占点击热区、不计入信息预算 |
| 13 | 桌面使用必应每日壁纸 | Fluent 2 不规定桌面壁纸（Windows 桌面本身靠壁纸/Mica） | **已定案（DECISIONS D-31）**：壁纸是桌面场景的内容层；比例不符用 cover 填充；说明文字仍用 Fluent 字阶/颜色 token。**D-37 追加**：来源固定必应官方归档 `HPImageArchive.aspx`（`mkt=zh-CN`），模式分自动/固定/本机三种；说明条成为「欣赏壁纸」入口（系统无对应组件，属桌面场景例外） |

## 15. 检查清单（每个组件/页面上线前）

1. 颜色全部来自 Fluent token？有没有手写 hex？
2. 字号是否落在 type ramp 上（10/12/14/16/20/24/28/32/40/68）？主数字是否统一 `fontSizeHero900`（40/52）？
3. 间距是否来自 spacing ramp（含 2/6/10）？
4. 圆角是否只用 0/2/4/8/12/Circle？
5. 阴影是否只用 shadow4/8/16 且没有和自定大阴影叠加？
6. 动效是否只用 motionTokens，没有自定义时长/曲线？
7. 图标是否 Regular/Filled 得当、交互目标 ≥44×44？
8. 对比度（正文 4.5:1 / 大文本 3:1）是否达标？
9. 加载态是否按 1s/3s 阈值选择（无/Spinner/进度条/AI 立即指示）？
10. 文案是否短句、无句号、动词开头、空状态给了下一步？
