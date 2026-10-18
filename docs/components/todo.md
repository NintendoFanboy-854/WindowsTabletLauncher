# 待办（todo）

桌面常驻的待办清单。支持多清单、子任务、优先级、截止日期、提醒、重复任务、标签、搜索、日历视图。

> 自然语言输入（“明天下午三点交报告”）由主 Agent 解析后调用下面的结构化工具，**组件本身不做自然语言解析**。

## 数据模型

```ts
type Priority = 0 | 1 | 2 | 3; // 无 / 低 / 中 / 高

interface TodoList {
  id: string;
  name: string;
  color: string;      // Fluent token 名
  order: number;
}

interface Subtask {
  id: string;
  title: string;
  done: boolean;
  order: number;
}

interface Task {
  id: string;
  listId: string;
  title: string;            // 不限长度，列表里按宽度截断
  note?: string;
  done: boolean;
  doneAt?: string;          // ISO
  createdAt: string;        // ISO
  updatedAt: string;        // ISO
  order: number;            // 手动排序用，可插入的浮点序
  priority: Priority;
  dueAt?: string;           // ISO；可只有日期（当天 23:59 视为到期）
  remindAt?: string;        // ISO；由后台 iframe 定时触发通知
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags: string[];
  subtasks: Subtask[];
}
```

存储：插件自己持久化（`localStorage` 键 `todo.lists` / `todo.tasks` / `todo.tags` / `todo.settings`），不设数量上限。

## 尺寸与布局

| 尺寸 | 内容 |
|---|---|
| `1×1` | 未完成总数 + 今日到期数 + 第一条任务标题 |
| `2×2` | 当前清单的任务列表（约 4–5 条），无输入框 |
| `3×2` | 列表 + `+` 展开输入框 + 清单名 |
| `3×3` | 完整视图：工具条（清单切换 / 搜索 / 视图切换）+ 列表 + 输入框 |
| `4×2` | 宽列表：左列未完成、右列已完成 |

## 自适应

- 字号随卡片缩放，行高用 Fluent 间距 token。
- `1×1` 只留计数 + 首条；`2×2` 隐藏工具条；`3×3` 才显示清单切换和筛选。
- 软键盘弹出时卡片内容内部滚动，不带动整个桌面。

## 交互

- 点任务 = 打勾；点已完成任务 = 取消打勾。
- `+` = 展开输入框（软键盘自动弹），回车提交，Esc 收起。
- 长按任务 = 菜单：编辑标题、备注、优先级、截止日期、提醒时间、重复规则、标签、加子任务、移动清单、删除。
- 点击子任务 = 打勾；任务行显示 `2/5` 进度。
- 拖拽任务 = 手动排序（仅排序方式为“手动”时可用）。
- 工具条：清单切换、搜索框、视图切换、排序下拉（手动 / 截止 / 优先级 / 创建时间）。
- 日期分组视图：今天 / 明天 / 以后 / 无日期 / 已完成。
- 视图共五种（对齐参考产品 Todo清单）：Daytodo（今天 / 明天，Ivy Lee 式安排）、最近待办（近期未完成 + 未来几天）、分类清单（按清单看）、日历+任务（月历与今日待办合一，点日期看当天）、周视图 / 月视图（看整周 / 整月安排，点日期直接建任务）。
- 已完成默认折叠在底部，点“清空”删除所有已完成。

## 配置项

- 默认清单（默认第一个）
- 是否显示已完成（默认显示、折叠）
- 默认排序（默认手动）
- 字号（默认 / 大）
- 一周起始日（默认周一）

## Agent 工具

| 工具 | 参数 | 返回 |
|---|---|---|
| `todo.lists` | — | 清单数组 |
| `todo.list` | `{ listId?, done?, dueBefore?, tag?, query? }` | 任务数组（默认未完成） |
| `todo.add` | `{ title, listId?, priority?, dueAt?, remindAt?, recurrence?, tags?, subtasks? }` | 新任务 |
| `todo.addList` | `{ name }` | 新清单 |
| `todo.complete` | `{ id, done? }` | 更新后的任务 |
| `todo.update` | `{ id, title?, note?, priority?, dueAt?, remindAt?, recurrence?, tags?, listId? }` | 更新后的任务 |
| `todo.remove` | `{ id }` | 删除结果 |
| `todo.addSubtask` | `{ taskId, title }` | 更新后的任务 |
| `todo.completeSubtask` | `{ taskId, subtaskId, done? }` | 更新后的任务 |
| `todo.search` | `{ query }` | 匹配的任务数组 |

## 边界与异常

- 空清单显示空状态文案；搜索无结果显示“没有匹配”。
- 标题超长时列表内截断展示。
- 提醒时间已过：启动时若 `remindAt < now` 且未触发，立即补一条通知，只补一次。
- 重复任务完成时：按规则生成下一次任务（`dueAt` 往后推一个周期），原任务保留为已完成。
- 软键盘弹出时列表自动上推，不遮挡输入框。
- 500 条上限达成后，`todo.add` 返回错误，需要先清理。

## 依赖的宿主能力

- 宿主 API：`init(theme)`、`getConfig/setConfig`、`notify(text)`。
- `"background": true`：保证没有组件挂载时，提醒定时器仍在跑。

## 不做什么

附件、协作者/共享、云同步、外部日历（Outlook/Google）集成、Markdown 富文本、自然语言解析（交给 Agent）。

## 与参考产品（Todo清单）对齐

抄功能，不抄设计（设计按 Fluent 2）：

- 事件列表三种：Daytodo / 最近待办 / 分类清单。
- 日历+任务、周视图、月视图三种日历类小组件。
- 工作量热力图：按每天完成的任务量（默认按完成数，也可按优先级加权）渲染热力格。
- 拖动调整重要性次序（手动排序）。
- 重复设置（每日/每周/每月/每年）。
- 数据复盘：昨日小结、周报、统计，数据来自 `stats.range`。
- 倒数日：**单独插件**，不塞进待办（参考产品里它也是独立小组件）。