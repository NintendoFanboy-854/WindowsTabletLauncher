# Apple HIG 原则参照（项目内参考文档）

> **来源**：Apple《人机界面指南》中文站 <https://developer.apple.com/cn/design/human-interface-guidelines/>。中文站是 JS 渲染的应用，直接抓 HTML 只有标题，因此正文取自该站文档数据接口 `https://developer.apple.com/tutorials/data/cn/design/human-interface-guidelines/<slug>.json`（返回的是中文正文，与中文站页面同源）。
> **抓取日期**：2026-10-19。HIG 自身变更日志显示：设计原则页 **2026-06-08 重写**，小组件页 2025-12-16 更新，无障碍页 2025-06-09 改版。本文以抓取日版本为准，不追后续改动。
> **用途**：平台无关 UI/UX 原则的**参照系**，供后续设计讨论取证。**不是**要改用 Apple 设计语言——Liquid Glass 材质、SF 字体、Apple 控件形态、Apple 的 pt 尺寸体系一律不引入。
> **与 Fluent 2 的关系**：与 [FLUENT2.md](../FLUENT2.md)、[DESIGN.md](../DESIGN.md)、[DENSITY.md](../DENSITY.md)、[DECISIONS.md](../DECISIONS.md) 冲突时，**以 Fluent 2 与项目规范为准**。本文只做观察与对照，不产出"必须这么改"的结论。
> **引用格式**：`[HIG: 文章名](URL)`；正文里不重复长 URL，完整清单见 §14。

## 0. 覆盖范围与一个结构性事实

- 覆盖 **27 篇**：设计原则 / 反馈 / 小组件 / 模态化 / 表单 / 弹出窗口 / 提醒 / 按钮 / 手势 / 布局 / 设置 / 动态效果 / 无障碍 / 全屏显示 / 拖放 / 撤销和重做 / 加载 / 显示控制 / 列表和表格 / 分段控制 / 菜单 / 切换 / 进度指示符 / 指针设备 / 搜索 / 用户引导 / 入门指南。
- **结构性事实**：老版 HIG 里独立成篇的 *mental model*、*direct manipulation*、*predictability* 在现版**已没有同名页面**（`/mental-models`、`/direct-manipulation`、`/predictability` 均 404）。这些概念被并入新的 8 条设计原则（尤其「熟悉感」）与「反馈」「手势」「拖放」四篇。查旧文档时不要按名字找。
- 现版设计原则是 8 条：**目标感、能动性、责任感、熟悉感、灵活、简洁、匠心、愉悦感**（每条下有 3–4 句可执行展开）。

## 1. 设计原则（8 条，2026 改版）

[HIG: 设计原则](https://developer.apple.com/cn/design/human-interface-guidelines/design-principles)

| 原则 | Apple 一句话 | 与本项目相关度 |
|---|---|---|
| 目标感 | 设计始于意图；明确产品为何存在，专注把最重要的事做好；不要重复造已有的解决方案 | 高（六卡片各自"一件事"已在 DENSITY 信息预算里体现） |
| 能动性 | 界面为达成目标而存在：让用户自由操作、了解当下情况、**轻松从误操作中恢复**；"最好的设计是不挡路、需要时才出现" | 高（对应 chrome on demand、撤销/容错） |
| 责任感 | 透明说明产品做什么、为什么；只收集必要数据 | 中（天气定位、API Key、AI Agent 的数据边界） |
| 熟悉感 | 利用用户已有的现实与软件概念；**建立行为后全局一致**；提供清晰反馈 | 最高（可预测性的正式表述） |
| 灵活 | 适配不同情境与需求；**保留用户的情境**（位置一致可预测、用自然动效缓解过渡）；支持多种输入 | 高（自适应网格、触控+键盘+鼠标） |
| 简洁 | "简洁不是极简主义"：保留重要内容、滤掉其余；措辞精炼；**建立层级结构** | 高（DENSITY 三条硬规则同源） |
| 匠心 | 每个细节体现用心；原型迭代；发布不是终点 | 中（视觉返工的证据要求） |
| 愉悦感 | 明确想激发的情绪；创造决定性时刻；**不要把愉悦感当装饰**，不要妨碍核心任务 | 中（动效的分寸） |

**对照**：这 8 条与 Fluent 2 的"Natural on every platform / Built for focus / One for all, all for one"在语义上高度重叠（见 [FLUENT2.md](../FLUENT2.md) §1），差异主要在**措辞颗粒度**：Apple 把"可恢复性/透明度/一致性"写成独立句子，Fluent 2 把它们压在四条里。值得借鉴的是这种"一条原则配三句可执行展开"的写法。

## 2. 可预测性、一致性与"人类化操作"

- **一致性是学习成本问题**：一旦为某元素建立了外观或行为，就应用到整个设计；这样用户对新交互"有信心它会按预期工作"（设计原则·熟悉感）。
- **手势的响应要与预期一致**：用户期望轻点在所有情境下都是"激活/选择"；不要用轻点、轻扫这类熟悉手势去执行 App 专有的操作，也不要为"激活按钮""滚动长列表"这类标准操作发明新手势。[HIG: 手势](https://developer.apple.com/cn/design/human-interface-guidelines/gestures)
- **不可用状态必须看得出来**：手势不可用时若不说明，用户会以为 App 卡住或自己做错了；按钮的禁用态要与可用态有明显区别（手势篇、菜单篇都强调这一点）。
- **定义一次，处处一致**：菜单项图标在同一分组内统一给或不给；分段控制不混用文字与图标；切换项用描述当前状态的标签而不是并列两个菜单项。[HIG: 菜单](https://developer.apple.com/cn/design/human-interface-guidelines/menus)、[HIG: 分段控制](https://developer.apple.com/cn/design/human-interface-guidelines/segmented-controls)

**对照**：项目已经有这条的骨架（[DENSITY.md](../DENSITY.md) §3「点击=主操作、长按=上下文菜单、编辑模式=卡片级操作」），但**六个插件对"点击卡片"的定义并不统一**，见 §12-1。这是 HIG 这条原则在项目里最直接的一面镜子。

## 3. 反馈：把打扰程度与信息重要性对齐

[HIG: 反馈](https://developer.apple.com/cn/design/human-interface-guidelines/feedback)

- **核心公式**：最有效的反馈是把*信息的重要性*与*传递方式*匹配。被动展示、就近可见的状态反馈优于打断；只有"数据可能丢失"这类才有资格打断。
- **状态反馈要贴近它描述的对象**，让用户不离开当前环境就能取到（例：邮箱列表就地显示未读数）。→ 直接支持"卡片上就地显示状态/进度"的做法。
- **警告的边界很窄**：只在"用户主动发起的任务可能造成非预期且不可逆转的数据丢失"时警告；**当数据丢失是用户操作的预期结果时不要警告**（删邮件不弹窗）；确认只在"足够重要"时才给——用户默认认为操作会成功，只想知道失败。
- **命令无法执行时说明原因**，而不是静默失败。

**对照**：项目目前的状态反馈基本是"就地"的（卡片显示倒数日、番茄环形、久坐分钟数），符合这条。差异点在**破坏性操作的确认**：删任务、删倒数日、清空历史这类路径，组件文档里只写了"长按=删除"，没有写"确认"还是"可撤销"的口径（HIG 的立场是二者取一即可，不必既确认又可撤销）。

## 4. 小组件：可扫读性、密度与点按语义

[HIG: 小组件](https://developer.apple.com/cn/design/human-interface-guidelines/widgets)（这是与项目最贴近的一篇）

- **点按语义是分层的**：用户轻点/点按小组件主体时**启动对应 App 并深链到与内容直接相关的详情**（"不要让用户自己导航过去"）；只有小组件内的**按钮、切换**才是就地操作。两者边界清楚：整块 = 进入，控件 = 就地。
- **内容选择**：只显示与小组件主要用途直接相关的信息；大尺寸可以扩展信息层级，但**不要为了填满更大区域而把小尺寸内容放大**；"创建一个尺寸最适合表现内容的小组件"比"给所有尺寸都做一个"更重要。
- **密度**：布局太稀会显得多余，太密则不可扫读；目标是"**既能一眼看懂，也能细看到更多细节**"（一瞥 + 细看两级）。信息太密时的解法是换更大尺寸或用图形替代文字，不是压缩字号。
- **可扫读的具体约束**：文本一般 ≥11pt，小于 11pt 对很多用户不可读；用系统字体与文本样式；标准外边距 16pt，需要更紧时 11pt 是好值；内容圆角要与容器圆角协调。
- **不要只靠颜色**：小组件可能被渲染成单色/着色模式，所以含义必须同时由文字或图形承载。
- **两面镜子**：①不要在 App 内镜像小组件的外观（长得像小组件但行为不同会让用户困惑）；②用视觉映射一致性维持熟悉感（圆角卡片 + 大数字 = 用户预期"点开看详情"）。

**对照**：项目的卡片正是"圆角卡片 + 大数字"这一视觉族，而点击行为在六个插件里分别被定义为"切换 12/24 小时制""打卡""进入沉浸模式""打开详情"——**同一种外观承载了四种语义**。这正是 HIG 上一条"镜像外观"警示的镜像场景（我们在桌面内自己制造了这个歧义），见 §12-1、§12-5。

## 5. 层级与模态：何时用 sheet / popover / full-screen

[HIG: 模态化](https://developer.apple.com/cn/design/human-interface-guidelines/modality) · [HIG: 表单](https://developer.apple.com/cn/design/human-interface-guidelines/sheets) · [HIG: 弹出窗口](https://developer.apple.com/cn/design/human-interface-guidelines/popovers) · [HIG: 提醒](https://developer.apple.com/cn/design/human-interface-guidelines/alerts) · [HIG: 全屏显示](https://developer.apple.com/cn/design/human-interface-guidelines/going-full-screen)

**何时用哪种（HIG 的分工）**

| 容器 | 适合 | HIG 给的硬约束 |
|---|---|---|
| 模态（sheet / full-screen） | 明确的小范围任务、需要专注、需要确认影响内容或设备的选择 | 只在有明确益处时用；任务要短；避免"模态里再套一个 App"；**一次只显示一个**；必须有明显的关闭方式 |
| 全屏模态 | 深度内容、多步骤任务（看图、标记、编辑） | 全屏时仍要能访问必要控制，不必退出即可完成任务；隐藏工具栏要用用户熟悉的操作恢复 |
| popover | 少量信息或功能、看完即走、想省空间 | 功能数量要少；点外部即关闭；**关闭按钮只在需要确认/指导时才给**；自动关闭时**必须保存工作**；不要用它显示警告 |
| alert | 必须打断的、可操作的重要信息 | 谨慎使用；不要仅传递信息；不要为"常见且可撤销"的破坏性操作弹；标题具体（不要"出错了"）；最多三个按钮 |
| 我们这里的常态 | 桌面是全屏常驻，没有"全屏模式"可切换 | 所以 Apple 的"全屏"建议要反过来读：**全屏是基线，浮层才是例外**；例外越少越好（与 chrome on demand 同向） |

**"从哪来、回哪去"**：HIG 在模态、表单、弹出窗口三篇里反复讲同一件事——关闭后要回到"进入前的地方"，并且**不要让用户忘记自己在哪**（模态里再套模态、关闭一个表单却落到另一个表单，都会让人丢失位置感）。可迁移的判断标准：**浮层的关闭动作必须把用户送回触发它的那个对象，而不是一个笼统的页面**。

### 5.1 关闭语义与"羡余"

**羡余（redundancy）** 在语言学/文学里指超出最小必要信息量的成分，并非缺陷：重复、同位语、语气词承担强调、衔接与容错。信息设计里它有两种形态——**正面的"冗余编码"**（同一信息用颜色+文字+图标多渠道表达，抗噪、抗色觉差异；HIG 无障碍篇"不仅仅通过颜色传达信息"就是在要求冗余编码），和**负面的"同义控件不同规则"**（同一语义由两个控件用不同规则表达，用户得在两个都能关闭的东西之间猜哪个会保存）。

Apple 的取舍很明确：**退出的路径可以多（按钮、轻扫、Esc、点外部），但每条路径的语义必须一致；语义不同的控件不要叠在同一层**。三条证据：

1. 表单里「取消 = 关闭且不保存」「完成 = 保存并关闭」「返回 = 回上一级/父视图，**不用于关闭**」，并要求**不要同时出现这三个按钮**（表单篇）。
2. 表单给了「完成」就必须同时给「取消」，否则"完成任务"成了退出的唯一路径。
3. 弹出窗口**默认不给关闭按钮**：点外部或选中即关；关闭按钮只在需要说明"退出时保存还是不保存"时才加；自动关闭时必须保存工作。

**对照**：项目现在是**四个退出路径、两种语义**——宿主 Dialog 的关闭按钮、Esc、点遮罩、以及插件视图内的「取消」；而「取消」在 countdown 里是"恢复表单初值但不关浮层"，在 todo detail 里是"请求关闭"（见 [OVERLAY-REWRITE-RESULT.md](../OVERLAY-REWRITE-RESULT.md) §3、[DESIGN.md](../DESIGN.md) §2）。也就是说，「取消」与「关闭」同名不同义、且并存。这不是"按钮太多"的问题，是**两条路径对"未保存改动"的承诺不一致**的问题。开放问题见 §12-2。

## 6. 按钮与控件：命中区域、按压反馈、主次

[HIG: 按钮](https://developer.apple.com/cn/design/human-interface-guidelines/buttons) · [HIG: 切换](https://developer.apple.com/cn/design/human-interface-guidelines/toggles)

- **命中区域 ≥44×44pt**（visionOS ≥60×60），与输入方式无关；按钮四周要有足够空间与周围内容区分。
- **自定义按钮必须有按压状态**：没有按压反馈，用户会觉得按钮没响应、进而怀疑输入没被接收。→ 这条对桌面卡片的"按下收缩/变暗"是正面依据。
- **主次用样式区分，不要用尺寸**：同尺寸并排的两个按钮暗示它们是一组同级选项；用更突出的样式标记首选。**每个视图保留 1–2 个突出按钮**，多了反而增加"该选哪个"的负担。
- **角色有语义**：普通 / 主要 / 取消 / 破坏性。主要按钮响应 Return；**破坏性操作不能当默认按钮**，因为突出的按钮会被不读文案的人直接点。
- **省略号 = 还需要用户输入**（macOS 约定：按钮标题带 `…` 表示会打开另一个视图/需要补充信息）。这条在桌面端仍成立，可直接用于"设置…""更多…"这类入口。
- **切换的状态要视觉可辨**，且不能只靠颜色（加/去填充、显隐背景形状、改内部对勾/圆点）。

**对照**：项目触控目标是 **≥40×40**（[DENSITY.md](../DENSITY.md) §2、[DECISIONS.md](../DECISIONS.md) D-05），HIG 的默认值是 44×44、最小 28×28。40 落在两者之间，符合 Fluent 2 的官方要求，**不需要按 HIG 改**——但值得知道：在 267 PPI、1.0–1.5m 观看距离下，44 与 40 的差别约 0.8mm，属于可忽略的工程差异；真正的差异在**控件间距**（HIG：有边框控件四周约 12pt、无边框约 24pt）。

## 7. 信息密度、分组与渐进披露

[HIG: 布局](https://developer.apple.com/cn/design/human-interface-guidelines/layout) · [HIG: 显示控制](https://developer.apple.com/cn/design/human-interface-guidelines/disclosure-controls) · [HIG: 列表和表格](https://developer.apple.com/cn/design/human-interface-guidelines/lists-and-tables)

- **分组靠留白**：用负空间、背景形状、颜色、材质**或分隔线**来表达"这些是一组"；同时要保证**内容与控制之间有明显区别**。→ 与 [DENSITY.md](../DENSITY.md) "用 spacing 分组、不用分割线"同向，HIG 只是把分隔线列为可选项而非禁区。
- **位置即重要性**：用户按阅读顺序（上→下、前→后）扫视，重要内容放顶部/前端；对齐让界面显得有条理、便于追行；对齐 + 缩进可以表达层级。
- **渐进披露要给"还有更多"的信号**：一次显示不下时，必须指明还有不可见的内容（显示控制、显示部分内容、滚动渐隐），而不是默默裁掉。
- **一个视图最多一个显示按钮**（disclosure button）；默认隐藏高级功能，把最常用的控件放在顶层。
- **列表的选择反馈分两种**：会导航到新视图→持续高亮；只是选中一个选项→短暂高亮 + 勾号。选错反馈形式会让用户误判"点一下会发生什么"。

**对照**：项目的"每尺寸信息预算 + 超预算降级到详情/菜单"（[DENSITY.md](../DENSITY.md) §2）就是 HIG 的渐进披露 + 密度平衡；HIG 额外提供的是一条**可测判据**："若某尺寸的内容显得空，说明该尺寸不该存在，而不是该放大内容"。这与 DENSITY §2.1 第 5 项（3×2 不得更空）是同一个判据的两种写法。

## 8. 设置归属：什么进设置、什么就地

[HIG: 设置](https://developer.apple.com/cn/design/human-interface-guidelines/settings)

- **能就地改的就别进设置**：任务特定选项（显示/隐藏某区域、重排项目、过滤列表）应放在它影响的屏幕上，因为进设置意味着"中止当前任务 + 失去上下文 + 看不到即时结果"。
- **设置区只放通用、不常改的东西**（窗口配置、账户、存档行为），并且**尽量减少设置数量**——设置越多越显得难用、也越难找。
- **给最好的默认值**，让多数用户不需要进设置；能自动检测的（深色模式、外接设备）不要问用户。
- **不要在 UI 里重复系统级设置**；尊重用户在系统层的选择。
- 重新打开设置时**恢复上次看的面板**；macOS 还建议把设置入口放菜单而不是工具栏（避免挤占常用命令的空间）。

**对照**：项目目前是**双层设置**——宿主设置页（主题、布局等全局项）+ 六个插件各自的 `?view=settings` 浮层（城市、单位、阈值、提醒间隔等）。按 HIG 的切分，插件设置里的"显示项/排序/过滤"属于**任务特定选项**，更接近"就地"而不是"设置"；而"提醒间隔""阈值"这类改一次就不再动的，确实属于设置。§12-6 把这个切成一个具体问题。

## 9. 动效：目的、连续性、减少动效

[HIG: 动态效果](https://developer.apple.com/cn/design/human-interface-guidelines/motion) · [HIG: 无障碍（减弱动态效果）](https://developer.apple.com/cn/design/human-interface-guidelines/accessibility) · [HIG: 指针设备（悬停效果）](https://developer.apple.com/cn/design/human-interface-guidelines/pointing-devices)

- **有目的才动**：无意义或过多的动画会分散注意，甚至造成不适；**频繁发生的交互通常不该加动画**（系统已经为标准控件提供了精细的过渡，自定义元素再叠一层只是让用户每次都多等一会）。
- **反馈动画要简洁精确**：动画与触发它的手势要"真实对应"——"从顶部下滑出现的视图，用户不会期望向侧边滑动来关闭"。这就是"从哪来、回哪去"的动画版本：**入场方向定义了出场方向**。
- **动效可关闭、可跳过**：不要把动效当作传达信息的唯一方式；不要让用户等动画放完才能操作。
- **减弱动态效果（Reduce Motion）的具体做法**（HIG 给了 5 条，都可直接抄成工程约定）：收紧弹簧减少回弹；让动画直接跟随手势；不对 z 轴深度变化做动画；把 x/y/z 位移替换为淡入淡出；不对进出模糊做动画。
- **悬停放大有条件**：自定义 hover 的缩放/阴影/间距要一起考虑——**缩放只适合"放大时不会挤到邻居"的元素**；周围空间很小的元素应该用**着色而不是缩放**；且"只有阴影没有缩放"效果很差（元素不会因为影子显得更近）。

**对照**：这条与 §12-6 直接相关。项目规范现在写的是"悬停/按下统一用 Fluent 的 subtle 背景与边框变化"（[DESIGN.md](../DESIGN.md) §2），而讨论中出现过"hover 放大、按下收缩"的方案；HIG 给出的判据不是"能不能放大"，而是**该元素放大后会不会与邻居打架**——桌面网格 12–16px 的 gap（[FLUENT2.md](../FLUENT2.md) §4）显然属于"空间很小"。

## 10. 无障碍：触控目标、键盘、文本缩放

[HIG: 无障碍](https://developer.apple.com/cn/design/human-interface-guidelines/accessibility)

| 项 | HIG 值 | 项目现值 | 备注 |
|---|---|---|---|
| 触控目标 | 默认 44×44pt，最小 28×28pt（iOS/iPadOS） | ≥40×40 | Fluent 2 要求 40，项目合规 |
| 控件间距 | 有边框约 12pt，无边框约 24pt | 未成文 | DENSITY 未涉及 |
| 文本放大 | 支持 ≥200% | 未成文 | 与 400% 缩放/320 宽回流的 Fluent 要求同向 |
| 对比度 | ≤17pt 需 4.5:1；18pt 或粗体 3:1 | 正文 4.5:1 / 大文本 3:1 | 两边一致（[FLUENT2.md](../FLUENT2.md) §10） |
| 最小字号 | 小组件内文本 ≥11pt | ≥12px | 项目更严 |
| 时间限制 | 尽量少用会超时自动关闭的界面 | 无超时口径 | 待核实 |

- **不只靠颜色**、**不只靠一种输入方式**、**不只手势**：核心功能必须有多条物理路径（HIG 甚至要求"轻扫关闭的视图同时给按钮"）。
- **键盘全功能可达**，并避免覆盖系统快捷键。
- 认知负荷：优先用户熟悉的系统手势；**减少限时元素**（超时自动关闭对需要更多时间的用户是硬障碍）；难以恢复的操作要求二次确认。

**对照**：项目在对比度、焦点顺序、400% 缩放上已经对齐；HIG 多出的两条是**控件间距的量值**与**限时元素的克制**——后者对 Agent 的"正在思考…"这类状态文案是要核实的点：规范里没有写"多久后可以自动消失"，而 HIG 的立场是这类超时对需要更多时间的用户是硬障碍。

## 11. 其他直接影响可预测性的模式

- **菜单**：按逻辑分组并加分隔符；高频项放前面；**不可用项变暗，但菜单本身仍可打开**（让用户知道里面有什么）；需要补充输入的项加 `…`；切换项用状态标签（"显示地图/隐藏地图"），必要时成对出现；子菜单不超过一层、不超过约 5 项。[HIG: 菜单](https://developer.apple.com/cn/design/human-interface-guidelines/menus)
- **拖放**：拖起约 3pt 后显示半透明拖影；**落点是否可接受必须有反馈**（可接受才高亮、不可接受显示禁止记号）；放置失败要给反馈（飞回或淡出）；**优先让拖放可撤销**，做不到就在不可逆的放置前确认；必须提供拖放的替代方式（菜单命令）；放置后保持选中。[HIG: 拖放](https://developer.apple.com/cn/design/human-interface-guidelines/drag-and-drop)
- **撤销/重做**：帮用户**预测**结果（菜单标签写"撤销键入""重做加粗"，而不是"撤销"）；撤销影响屏幕外内容时要**显示结果**（滚过去给用户看）；不要限制撤销次数。[HIG: 撤销和重做](https://developer.apple.com/cn/design/human-interface-guidelines/undo-and-redo)
- **加载**：先出内容再替换占位符，不要先给空白；超过几秒用进度指示符；**进度要诚实**（5 秒走 90% 再卡 5 分钟会让人怀疑 App 挂了）；能取消就给取消。[HIG: 加载](https://developer.apple.com/cn/design/human-interface-guidelines/loading) · [HIG: 进度指示符](https://developer.apple.com/cn/design/human-interface-guidelines/progress-indicators)
- **引导**：用交互教，而不是用教程教；情境提示优于一次性引导；能跳过的教程要让用户以后还能找到；推迟不必要的设置步骤。[HIG: 用户引导](https://developer.apple.com/cn/design/human-interface-guidelines/onboarding) · [HIG: 搜索](https://developer.apple.com/cn/design/human-interface-guidelines/searching)

## 12. 可能与现有实现冲突 / 值得讨论的点

> 这一节全部是**观察 + 开放问题**，不构成改动要求。证据列已给出可复核的位置。

| # | 议题 | HIG 依据 | 项目现状（证据） | 开放问题 |
|---|---|---|---|---|
| 1 | **点按语义不统一** | 小组件：主体点按=进入 + 深链到相关详情；仅按钮/切换就地操作 | 同一外观四种语义：clock 点击=切 12/24h；sedentary 点击=打卡；pomodoro 点击时间区=沉浸模式；weather 点击=详情 Drawer（[clock.md](../components/clock.md)、[sedentary.md](../components/sedentary.md)、[pomodoro.md](../components/pomodoro.md)、[weather.md](../components/weather.md)） | 桌面卡片这一层要不要统一成"点=打开详情/就地主操作"两类明确契约？clock 的"整块点按切换制式"是否属于"无可见 affordance 的隐式状态变更"？ |
| 2 | **取消 vs 关闭的羡余** | 表单：取消=关闭不保存、完成=保存关闭、返回≠关闭，且三者不同时出现；弹出窗口：关闭按钮只在需要说明保存语义时给 | 宿主 Dialog 关闭按钮 + Esc + 遮罩 + 插件内「取消」四条路径；「取消」在 countdown=恢复初值不关、在 todo=请求关闭（[OVERLAY-REWRITE-RESULT.md](../OVERLAY-REWRITE-RESULT.md) §3、[DESIGN.md](../DESIGN.md) §2） | 同一个浮层里，「取消」到底是"放弃改动"还是"关闭"？未保存改动时，宿主关闭按钮承诺什么？（保留/丢弃/询问） |
| 3 | **展开后的详情层级** | 小组件：一瞥 + 细看两级；小尺寸信息有限、大尺寸扩展层级而不是放大；≥11pt 文本 | 详情用宿主全窗口 Dialog（880×680）；插件文档给 weather 详情记的是"右侧滑出 Drawer"，D-11 又把浮层统一成宿主 Dialog、内容 max-width 720（[weather.md](../components/weather.md)、[DECISIONS.md](../DECISIONS.md) D-11） | 详情首屏该给"更大的数字/图"还是"列表/操作"？近距阅读（0.5–0.8m）时现有 12px 辅助文字与 44px 行高是否已经够密？ |
| 4 | **信息聚集/分隔与右侧 spacing** | 布局：用留白/背景/颜色分组，内容与控制要区分；小组件：标准外边距 16pt，更紧时 11pt，内容不要挤到边缘 | 卡片内 padding 按尺寸档 8/12/16（[DENSITY.md](../DENSITY.md) §2.1）；组间 ≥ spacingVerticalM、组内 ≤ XS | 1×1 的 8px padding 在 267 PPI 下换算约 1.5mm，与 HIG 的 16pt 标准边距差一倍；"右侧 trailing 值贴边"是分组问题还是边距问题？ |
| 5 | **是否所有 widget 都能打开详情** | 熟悉感：行为建立后全局一致；菜单：不可用项也要可见以便理解 | 只有 weather 的卡片点击明确指向详情；todo/countdown 的详情在任务行/条目级，不在卡片级 | "卡片可点开详情"要不要成为六个插件的共同契约？若某些插件没有"更多内容"，它的点击应该做什么？ |
| 6 | **设置归属** | 设置：任务特定选项就地，通用不常改才进设置；减少设置数量；恢复上次面板 | 宿主设置页（全局）+ 六插件 `?view=settings` 浮层（城市/单位/阈值/显示项/API Key，[weather.md](../components/weather.md)） | "显示项/排序/过滤"这类应该留在插件的设置浮层，还是变成卡片上的就地切换？宿主与插件的设置边界用什么判据切？ |
| 7 | **动效连续性** | 动态效果：入场方向定义出场方向；频繁交互不加动画；让用户可取消 | 规范为 Fluent subtle 背景/边框；编辑模式进出用 Fluent 标准缩放过渡（[DESIGN.md](../DESIGN.md) §7）；讨论中出现 hover 放大 / 按下收缩 | 展开/收起是否严格"从触发处来、回触发处去"（卡片→详情→同卡片）？hover 放大在 12–16px gap 的网格里是否会把邻居挤成视觉噪声？ |
| 8 | **减少动效与触控目标** | 无障碍：Reduce Motion 五条具体做法；触控 44×44（最小 28）；限时元素克制 | 触控 ≥40×40 已达标；`prefers-reduced-motion` 未见于规范 | 是否把"减少动效"落成工程约定（收紧弹簧/位移改淡入淡出）？长按 500ms 这类"时间阈值"在行动不便用户下是否偏短？ |

## 13. 与 Fluent 2 的对照

### 13.1 两边一致（可放心用，HIG 可作为二次论证）

| 原则 | HIG | Fluent 2 / 项目 |
|---|---|---|
| 少而精的设置、合理默认 | 减少设置数量、给最好默认 | 设置页"低频、留白多"，空状态给主操作 |
| 渐进披露、信息预算 | 一瞥+细看、默认隐藏高级功能 | DENSITY 三条硬规则、chrome on demand |
| 状态就地反馈、就近展示 | 反馈贴近对象 | 每张卡一个 Primary，状态直接画在卡上（[DENSITY.md](../DENSITY.md) §2） |
| 动效有目的、用 token | 无意义动画有害、频繁交互不加 | 只用 motionTokens、禁止各写时长 |
| 对比度、键盘可达、不只靠颜色 | 4.5:1 / 3:1、多输入路径 | FLUENT2 §10 |
| 布局靠留白分组、对齐传达结构 | 负空间分组、对齐 | 不画分割线、间距 ramp |
| 破坏性操作要显眼但不能是默认 | 破坏性按钮不给主要角色 | danger 语义色 + 删除入口收在编辑模式/浮层底部左侧（[FLUENT2.md](../FLUENT2.md) §2、[DENSITY.md](../DENSITY.md) §3） |
| 加载分档（先出内容 / 不确定 / 确定） | 先给内容再替换；几秒以上才用进度指示符，长时给确定型 | FLUENT2 §12 的 1s / 3s 分档表 |

### 13.2 Apple 特有（不适用，或需要转换后才可用）

| Apple 概念 | 为什么不直接搬 | 可转换的部分 |
|---|---|---|
| pt 尺寸体系（44pt、16pt 边距、11pt 下限） | 项目用 CSS px + Fluent token，且 267 PPI 下 1px≈0.19mm，换算无意义 | 只搬**相对关系**（默认/最小/紧） |
| Liquid Glass / vibrancy / 渲染模式（全彩/强调/虚化） | 是 iOS/watchOS 的材质与系统着色机制 | 只搬"**不要只靠颜色**"这一条约束 |
| 系统集成（旁白、动态字体、Siri、Spotlight、WidgetKit 刷新预算） | 依赖 Apple 框架 | 搬"**预算/限流**"的思路：数据刷新要诚实标注更新时间 |
| 平台惯例（下拉关闭、三指撤销、Cmd-,、摇动撤销） | 是 macOS/iOS 的既有习惯，Windows 用户没有 | 搬"**遵循目标平台的既有惯例**"这条元原则 |
| sheet 的 detent（中号/大号两段高度） | iOS 专属 | 可借用思想：**浮层先给半高、可展开**，用于渐进披露 |

### 13.3 Fluent 2 缺失、但值得在项目里补成工程约定的

1. **按压态是硬要求**（HIG：没有按压反馈用户会怀疑输入未被接收）——Fluent 2 有状态 token，但没有"每个可交互元素必须有 press 态"的成文规定。
2. **悬停放大的适用条件**（HIG：放大后不能挤到邻居，否则改用着色）——Fluent 2 讲 motion 曲线，不讲"什么元素不该动"。
3. **减弱动态效果的具体动作清单**（HIG 的 5 条）——比 Fluent 2 的"尊重用户偏好"更能落地成 CSS。
4. **关闭语义矩阵**（哪些容器默认无关闭按钮、点外部是否保存、未保存改动怎么办）——Fluent 2 没有跨组件的统一口径，项目现在正因此出现"取消/关闭"歧义。
5. **控件间距量值**（12/24）——Fluent 2 只给 spacing ramp，不给"两个可点元素之间最少多远"。
6. **进度诚实性**（不要先快后卡）——比"给进度条"更具体。
7. **"不可用也要可见"**：菜单/入口的禁用态不能直接隐藏，否则用户不知道功能存在。

## 14. 来源清单（27 篇，均为中文站，抓取于 2026-10-19）

设计原则 · [设计原则](https://developer.apple.com/cn/design/human-interface-guidelines/design-principles) ｜ 模式 · [反馈](https://developer.apple.com/cn/design/human-interface-guidelines/feedback)、[模态化](https://developer.apple.com/cn/design/human-interface-guidelines/modality)、[设置](https://developer.apple.com/cn/design/human-interface-guidelines/settings)、[全屏显示](https://developer.apple.com/cn/design/human-interface-guidelines/going-full-screen)、[拖放](https://developer.apple.com/cn/design/human-interface-guidelines/drag-and-drop)、[撤销和重做](https://developer.apple.com/cn/design/human-interface-guidelines/undo-and-redo)、[加载](https://developer.apple.com/cn/design/human-interface-guidelines/loading)、[用户引导](https://developer.apple.com/cn/design/human-interface-guidelines/onboarding)、[搜索](https://developer.apple.com/cn/design/human-interface-guidelines/searching) ｜ 基础 · [布局](https://developer.apple.com/cn/design/human-interface-guidelines/layout)、[动态效果](https://developer.apple.com/cn/design/human-interface-guidelines/motion)、[无障碍](https://developer.apple.com/cn/design/human-interface-guidelines/accessibility) ｜ 组件 · [按钮](https://developer.apple.com/cn/design/human-interface-guidelines/buttons)、[手势](https://developer.apple.com/cn/design/human-interface-guidelines/gestures)、[菜单](https://developer.apple.com/cn/design/human-interface-guidelines/menus)、[表单](https://developer.apple.com/cn/design/human-interface-guidelines/sheets)、[弹出窗口](https://developer.apple.com/cn/design/human-interface-guidelines/popovers)、[提醒](https://developer.apple.com/cn/design/human-interface-guidelines/alerts)、[显示控制](https://developer.apple.com/cn/design/human-interface-guidelines/disclosure-controls)、[列表和表格](https://developer.apple.com/cn/design/human-interface-guidelines/lists-and-tables)、[分段控制](https://developer.apple.com/cn/design/human-interface-guidelines/segmented-controls)、[切换](https://developer.apple.com/cn/design/human-interface-guidelines/toggles)、[进度指示符](https://developer.apple.com/cn/design/human-interface-guidelines/progress-indicators)、[指针设备](https://developer.apple.com/cn/design/human-interface-guidelines/pointing-devices) ｜ 技术 · [小组件](https://developer.apple.com/cn/design/human-interface-guidelines/widgets) ｜ 入门 · [入门指南](https://developer.apple.com/cn/design/human-interface-guidelines/getting-started)

**关于"羡余"的延伸阅读**（本轮未逐篇核对内容，仅作检索入口）：信息设计中的 redundancy 研究可见 [Analysis of the concept of redundancy concerning the design of multimodal combinations of output-elements](https://ieeexplore.ieee.org/document/704340)；中文语境下的"羡余"更接近语言学概念（超出最小必要量的成分承担强调/衔接/容错），与交互设计里的"冗余编码"同源，但**不能直接等同于"多一个按钮"**——判据仍是 §5.1 的原则：多渠道表达同一语义是正收益，同一语义由两个规则不同的控件表达是负收益。
