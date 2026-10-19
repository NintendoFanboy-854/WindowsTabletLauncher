# 插件设置 / 详情浮层重排规格（v1，2026-10-19）

> 范围：六个插件在宿主全窗口 Fluent Dialog 里加载的 **设置 / 详情 / 编辑 / 全部任务** 视图
> （`?view=settings|detail|edit|all`）。卡片视图已完成 v0.2 重写，本轮只动浮层视图。
> 依据：`docs/audit2/REPORT-VISUAL.md`、`docs/audit2/REPORT-TYPE.md`、
> `docs/DENSITY.md`（信息层级/留白）、`docs/DECISIONS.md`（D-07 Display XL 与浮层无关）、
> Fluent 2 表单与页面布局最佳实践。

## 0. 宿主浮层尺寸（重排的舞台）

- 1440×960：Dialog surface 880×680，内嵌 iframe 约 **834×582**；
- 1024×768：surface 880×553，iframe 约 **834×455**；
- 窄窗口（<760px）：surface 92vw，iframe 约 **92vw−46**。
- 浮层标题与关闭按钮由宿主 Dialog 提供；**插件视图内不要再画页面标题栏 / 关闭按钮**。
- 视图根：`width/height 100%`，内容区可滚动，**不能出现横向滚动**。

## 1. 统一排版骨架

```
root（flex column; height 100%; padding: 24 24 0; overflow: hidden）
  ├─ scrollArea（flex 1; overflow-y auto; padding-bottom 24）
  │    ├─ section（gap 16；section 之间 margin/gap 24）
  │    │    ├─ sectionTitle  20px semibold（Text size=500）
  │    │    ├─ sectionHint   12px fg3（可选，一行）
  │    │    └─ 内容（rows / grid / list）
  │    └─ …
  └─ footer（可选，sticky；padding 12 0；右对齐 40px 按钮；上边界用留白不画线）
```

- 主内容最大宽度 **720px 居中**（设置/表单）；详情里的统计区可用满宽 834。
- 底部操作（保存/取消/删除）固定在视图底部，不随内容滚动；按钮 `size="large"`（40px）。
- 分区之间用 **24px 留白**，不画 `Divider`/边框；组内条目间距 12；表单 Field 上下间距 16。
- 内容最小字号 **12px**（只允许描述/辅助），表单标签/正文 **14px**；不允许 10/11px、不允许 `clamp()` 字号、不允许 `lineHeight: 1`。

## 2. 设置视图（6 个插件统一形态）

- 单列、max-width 720 居中，自上而下分组。
- **行式设置项**（开关/单选/下拉这类短控件）：左侧 label 14 + 描述 12 fg3，右侧控件；行最小高度 48；行宽满 720；控件右对齐。
- **字段式设置项**（API Key/Host、时长数字、名称输入）：`Field` 上下布局，label 14，input 宽 100%，高度 40；描述 12 fg3。
- 分组顺序：先"常用/显示"→ 再"行为"→ 再"高级/管理"；不要按实现顺序堆。
- 列表管理（天气城市、待办清单、标签）：行高 44，左侧名称 14 + 说明 12，右侧操作 40 图标按钮；新增入口固定在列表底部一行（input 40 + 按钮 40）。
- 页脚（如需要）：右对齐主按钮；**设置都是即时保存，不放大号"保存"**（天气/待办/时钟为即时保存），只有编辑类视图（countdown edit / todo detail）才需要保存/取消。
- 每个 section 最多 7 行/字段；超出拆第二节或用滚动，不要缩字号。

## 3. 详情视图

### 3.1 天气详情（`view=detail`）

- 头部：城市（16 semibold）+ 状态/更新时间（12 fg3）+ 右侧操作（刷新/设置 40 图标按钮）。
- `TabList`：高度 40、Tab 文字 14；Tab 内容区滚动。
- 面板：使用两列统计网格（每格最小 160×88，背景 `colorNeutralBackground2`、圆角 8、padding 12），值 24–32 semibold、标签 12 fg3；逐时/7 天/预警用列表，不得 10px。
- 预警：Fluent MessageBar / Accordion，标题 14、正文 12–14；不裁切。

### 3.2 番茄钟 / 久坐详情

- 头部：一句状态（16 semibold）+ 辅助说明（12 fg3）。
- 统计区：两列或三列 `statCard`（同天气：值 24–32 / 标签 12）；无统计时给一条空态 + 一个主操作。
- 详情里的操作（打卡/开始/重置）如果保留，按钮 40，放页脚或头部右侧，不要和统计卡混排。
- 不重复卡片主信息的全部内容：详情是"更多 + 操作"，不是把卡片放大。

### 3.3 倒数日编辑（`view=edit`）与待办详情（`view=detail`）

- 表单栈：max-width 720；每个字段 `Field`（label 14 / 描述 12 / 控件 40）。
- 多行文本（备注/描述）用 `Textarea`，高度自适应，最小 3 行。
- 选项类（优先级/重复/清单/标签）用 Dropdown/RadioGroup/Checkbox，行高 40。
- 子任务/标签列表：行高 44；新增行 input 40 + 按钮 40。
- 底部固定操作条：左"删除"（danger，若适用），右"取消/保存"（40px）；保存用 primary。
- 编辑类视图不要在输入过程中自动关闭；保存成功后由插件自行关闭浮层（若当前机制不支持自动关闭，保留"完成"按钮）。

### 3.4 待办全部任务（`view=all`）

- 顶部工具行：搜索 input 40 + 筛选/排序 40；列表行高 44（标题 16 / 元信息 12），分组头 14 semibold。
- 满宽两列 / 单列根据 iframe 宽度：≥760 两列，否则单列；横向不滚动。

## 4. 间距与字号速查（浮层内）

| 项 | 值 |
|---|---|
| 视图 padding | 24（窄于 700px 时 16） |
| section 间距 | 24 |
| 组内 row 间距 | 12 |
| 表单 Field 间距 | 16 |
| 行高（设置行/列表行） | 48 / 44 |
| 控件高度 | 40（Button size=large、Input/Switch/Radio/Slider/Dropdown min-height 40） |
| section 标题 | Text size=500（20）semibold |
| 表单 label / 正文 | Text size=300（14） |
| 辅助说明 | Text size=200（12）fg3 |
| 统计值 | 24–32 semibold；统计标签 12 fg3 |
| 圆角（组块/统计卡） | 8（`tokens.borderRadiusXLarge`，Fluent 组件默认值；不使用项目卡片 12） |

- 颜色只走 token；亮暗两套都要可读。
- 不用 `Divider` 做分组（Fluent 2 浮层内用留白）；TabList 自带的指示条除外。
- 图标按钮必须有 Tooltip/aria-label。

## 5. 文件清单（本轮只改这些）

| 插件 | 视图 |
|---|---|
| clock | `src/ClockSettings.jsx` |
| weather | `src/views/SettingsView.jsx`、`src/views/DetailView.jsx`、`src/views/panels.jsx` |
| countdown | `src/CountdownSettings.jsx`、`src/CountdownEditor.jsx` |
| pomodoro | `src/PomodoroSettings.jsx`、`src/PomodoroDetail.jsx` |
| sedentary | `src/SedentarySettings.jsx`、`src/SedentaryDetail.jsx` |
| todo | `src/settings.jsx`、`src/detail.jsx`、`src/allTasks.jsx` |

## 6. 验收

> **状态（2026-10-19）：已完成**。12 个视图暗/亮两套断言全部 PASS（每视图实测字号/控件高度见
> `docs/OVERLAY-REWRITE-RESULT.md` §2.1），宿主内集成 7/7 PASS；结果与残留见
> `docs/OVERLAY-REWRITE-RESULT.md`。

1. `node scripts/build-plugin.mjs <ids>` 成功，产物更新。
2. `node scripts/verify-overlays.mjs [--plugin id]` 通过：每个视图在 834×582 下
   - 内容渲染（非空）、无横向溢出、无 10/11px 文本、最小字号 ≥12；
   - 可点击控件高度 ≥40；
   - 无 console error；
   - 截图写入 `shots/rewrite/overlays/`。
3. 每视图至少 1 张截图（暗色），亮色抽查 1–2 张；报告列出实测字号/控件高度与改动。
4. 保留功能与浮层机制（`requestSettings/requestOverlay`、`?view=`）；不改卡片视图、宿主、`_shared/**`、docs。

## 7. 不做

- 不新增功能、不重写数据层；只做布局/字号/间距/信息层级。
- 不做竖屏适配（产品只保证横屏；D-08 关闭）。
