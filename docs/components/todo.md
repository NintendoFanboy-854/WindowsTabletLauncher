# 待办（todo）

桌面常驻待办清单。卡片只展示「今日」并提供勾选；完整管理（多视图、搜索、任务编辑、清单管理）在详情页。

> 自然语言输入由主 Agent 解析后调用结构化工具，组件本身不做 NLP。

## 数据模型

```ts
type Priority = 0 | 1 | 2 | 3; // 无/低/中/高

interface TodoList { id: string; name: string; color: string; order: number }

interface Subtask { id: string; title: string; done: boolean; order: number }

interface Task {
  id: string; listId: string; title: string; note?: string;
  done: boolean; doneAt?: string; createdAt: string; updatedAt: string;
  order: number; priority: Priority;
  dueAt?: string; remindAt?: string;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags: string[]; subtasks: Subtask[];
}
```

存储：`todo.lists`、`todo.tasks`、`todo.tags`、`todo.settings`；`"background": true` 负责提醒。

## 卡片（只做展示 + 勾选）

- **固定「今日」视图**：已逾期 + 今天到期；已完成不上卡片。
- 行 44：Fluent Checkbox 40（勾选即完成）→ 可选优先级旗标 16（内容色）→ 标题 16 fg1（单行省略）→ 元信息 12 fg3（截止时间 / “已逾期 · 昨天” danger）。
- 行内只保留一个元信息；不显示备注、标签、子任务数。
- 点击卡片主体或行 = 打开详情；勾选框 `stopPropagation`，不打开详情。
- 无 `+`、输入框、菜单、搜索、视图切换、拖拽、长按/右键。
- 空态：2×2 起左对齐并顶到首行槽位（`align="start"`），1×1 走 `compact` 居中；`TaskListSquareLtr24Regular` + 标题（没有任务时「还没有待办」，今天空了时「今日没有待办」）+ **secondary** 按钮（没有任务时「添加待办」+ `Add20Regular`，否则「查看全部」+ `ChevronRight20Regular`）；不写说明句。

| 尺寸 | 内容 |
|---|---|
| `1×1` | 今日未完成数 `fontSizeHero900`/`lineHeightHero900`（40/52）+「今日待办」14 +（有逾期）「已逾期 N」12 danger |
| `2×2` | 头部「今日 · N」12 fg3 + 5 行 |
| `3×2` | 头部 + 5 行（每行多清单名） |
| `3×3` | 头部 + 8 行 |
| `4×2` | 头部 + 5 行单列宽行（不做左右两栏） |

行预算（`A = Hc − 24 − 8`、`N = min(cap, floor((A + 4) / 48))`，见 DENSITY §2.2）：
2×2=5、3×2=5、3×3=8、4×2=5；超出在 identity trailing 写「今日 X · 显示 Y」，不静默裁切。

- identity 行尾固定 `ChevronRight16Regular`（`CardIdentity disclosure`，`aria-hidden`）：整卡可点开详情的唯一视觉信号，非 `compact` 档全覆盖（空态与有内容态一致）；空态不写说明句（PLUGIN-CONTRACT §4.4.3）。

## 详情（L1，`?view=detail`）

**header 56**：清单 Dropdown 140（切换筛选 +「管理清单…」）、搜索 Input（flex）、「添加任务」40 primary。

**Tabs 40（常显）**：列表 / 日历 / 周视图 / 月视图 / 热力图。

- **列表**：分组「逾期/今天/明天/以后/无日期/已完成（折叠）」；组头 14 semibold + 计数 12 fg3，高 28；行 44（checkbox 40 + 旗标 16 + 标题 16 + 元信息 12 + 行尾 `⋯` 40）。
  - 点行 → push L2「任务编辑」；行尾 ⋯ → 编辑/删除（删除行内二次确认）。
  - 已完成组默认折叠，组头右侧「展开」「清空」40；清空行内确认。
- **日历**：月头 40（‹ / 2026年10月 / › / 今天）；7 列等宽；日格 44（日期 14 + 任务点/计数 12）；下方列出选中日任务（行 44）。
- **周视图**：7 列等宽，日期头 28，任务行 44，列间距 8；内容滚动。
- **月视图**：6×7 日格 44，格内最多 2 个任务点/计数；下方列出选中日任务。
- **热力图**：16 周网格 + 图例 12 fg3；顶部统计一行（值 20）。
- 所有视图共用 padding 24、行高 44、字号 12/14/16、无分割线。
  > 2026-10-24 澄清：详情里的内衬由宿主给（`DialogSurface` 24 + `DialogContent` 16 = 内容轴 40），
  > 插件根节点**不再加左右 padding**（PLUGIN-CONTRACT §4.3）；这里的 24 指宿主 `DialogSurface` 内衬，
  > 不是插件自己的值。卡片内 padding 恒 16（`CardRoot` 强制）。

## 详情（L2，任务编辑，push）

- header 56：← 返回 +「编辑任务 / 新建任务」16 semibold。
- 表单 max-width 720：标题 Input 40、备注 Textarea 3 行、清单 Dropdown 40、优先级 Radio 40、截止/提醒（日期 40 + 时间 40 + 清除 40）、重复 Dropdown 40、标签 chips + input 40/添加 40、子任务行 44 + 添加行 40。
- footer 固定：编辑时左侧 danger「删除」（行内确认）；右侧「取消」「保存」40。
- 保存 = 提交并 pop 回 L1；取消/返回 = 放弃并 pop；X/Esc/遮罩 = 关闭整个浮层。

## 详情（L2，清单管理，push）

- header 56：← 返回 +「清单管理」16 semibold；右侧新清单 Input 40 +「新建」40。
- 行 44：颜色点 + 名称 14 + 任务数 12 fg3 + 设为默认星标 40 + 重命名 40 + 删除 40。
- 重命名/删除行内确认；删除提示“同时删除其中的 N 个任务”；默认清单决定详情初始筛选，不影响卡片。
- 返回 list 保留当前 Tab/筛选。

## 设置 schema

```json
{
  "key": "settings",
  "groups": [{
    "title": "显示与行为",
    "fields": [
      { "key": "showCompleted", "type": "boolean", "label": "显示已完成", "default": true },
      { "key": "defaultSort", "type": "enum", "label": "默认排序", "default": "manual",
        "options": [ { "value": "manual", "label": "手动" }, { "value": "due", "label": "截止时间" },
                     { "value": "priority", "label": "优先级" }, { "value": "created", "label": "创建时间" } ] },
      { "key": "weekStart", "type": "enum", "label": "一周起始日", "default": 1,
        "options": [ { "value": 1, "label": "周一" }, { "value": 0, "label": "周日" } ] }
    ]
  }]
}
```

「默认清单」是动态数据，放在详情·清单管理（设为默认），不进 schema。
原 `fontSize`（默认/大）设置已删除：行标题恒 `fontSizeBase400`（16），跨卡字号不一致违反 Equal Except Hue（D-36 §1）。

## Agent 工具（UI 路径 ↔ 工具）

| UI 路径 | 工具 |
|---|---|
| 详情·列表/搜索 | `todo.list` / `todo.search` |
| 卡片/详情·勾选完成 | `todo.complete` |
| L2·新建 | `todo.add` |
| L2·编辑 | `todo.update` |
| 删除任务 | `todo.remove` |
| 子任务 | `todo.addSubtask` / `todo.completeSubtask` / `todo.removeSubtask` |
| 清单管理 | `todo.lists` / `todo.addList` / `todo.renameList` / `todo.removeList` / `todo.setDefaultList` |
| 已完成组·清空 | `todo.clearCompleted` |
| 复盘统计 | `todo.stats` |
| 宿主设置页·待办 | `todo.settings.get` / `todo.settings.set` |

## 边界与异常

- 提醒：单写者 background iframe + `navigator.locks`（D-12）；本地日期去重。
- 空清单/搜索无结果：EmptyState 标题 + 一个次操作（「添加任务」/「清除搜索」），不写说明句。
- 重复任务完成时生成下一次任务；原任务保留为已完成。
- 软键盘弹出时详情表单内部滚动，不带动桌面。
- 标题超长列表省略；时间/数字 tabular。

## 不做什么

附件、协作者/共享、云同步、外部日历集成、Markdown 富文本、自然语言解析（交给 Agent）。
