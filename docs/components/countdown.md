# 倒数日（countdown）

桌面上的重要日子倒计时：生日、纪念日、考试、项目截止。卡片只展示；添加/编辑/删除在详情里。

## 数据模型

```ts
interface Countdown {
  id: string;
  title: string;
  targetDate: string;    // YYYY-MM-DD
  repeatYearly: boolean; // 每年重复时按月-日换算
  color: string;         // Fluent token 名（内容色，仅状态点）
  createdAt: string;
}
```

存储：`countdown.items`、`countdown.settings`。

## 卡片

| 尺寸 | 内容 |
|---|---|
| `1×1` | 最近一条：天数 hero 40/52（`fontSizeHero900`/`lineHeightHero900`）+ 标题（截断） |
| `2×1` | 一条：标题 + 天数（featured 横排 52） |
| `2×2` | 纯列表：1 条 featured + 4 行（行高 44） |
| `3×2` | 纯列表：与 2×2 **同为 4 行**，每行多一个日期字段（宽度换字段，不换行数） |

- **归类：纯列表卡**（2026-10-24）。剩余天数 hero 只出现在 featured 单条主事件块，不做 40px 列表头计数；事件总数用 12px fg3 的 `TrailingCount`（「共 X · 显示 Y」）。
- 纯展示；点击卡片任意位置（包括行）= 打开详情；**卡片上不做行级深链、不放 `+`、不响应长按/右键**。
- 空态：CalendarLtr24Regular + 「还没有倒数日」（有已过去条目时换「没有未来事件」）+ **secondary** 按钮（无数据时「添加事件」+ Add20Regular，否则「查看全部」+ ChevronRight20Regular）；不写说明句。
- 天数：未来「还有 N 天」、今天「就是今天」、过去「已过 N 天」；每年重复换算到下一个周年日。

- identity 行尾固定 `ChevronRight16Regular`（`CardIdentity disclosure`，`aria-hidden`）：整卡可点开详情的唯一视觉信号，非 `compact` 档全覆盖（空态与有内容态一致）；空态不写说明句（PLUGIN-CONTRACT §4.4.3）。

## 详情（L1，`?view=detail`）

- **header 56**：左侧「共 N 个事件」14 fg3；右侧 primary「添加倒数日」40。
- **即将到来**（section 标题 16 semibold）：
  - 行 44（`LIST_ROW_HEIGHT`）：标题 16 fg1（单行省略）、天数 20 semibold tabular + 单位 12 fg3、日期/星期 12 fg3、行尾 `⋯` 40。
  - 今天：状态用 Badge「今天」12（brand tint）；≤7 天且设置开启：Badge「7 天内」12。
  - 行尾菜单：编辑 / 删除（删除走行内二次确认，不弹第二个 Dialog）。
- **已过去**：默认折叠在底部，组头「已过去 N」+ 展开按钮 40；展开后按同样行规格显示「已过 N 天」14 fg3。
- 空态：CalendarLtr24Regular + 「还没有倒数日」+ **secondary**「添加事件」（Add20Regular）。
- 内容区滚动；header 固定。

## 详情（L2，新建/编辑）

- push 子页：header 56（← 返回 +「编辑倒数日 / 新增倒数日」16 semibold）。
- 表单 max-width 720 居中：
  - 标题 Input 40（必填）
  - 日期 Input date 40（必填）+ 提示 12 fg3（生日/纪念日可选“每年重复”）
  - ~~颜色 7 个 40 圆形色点~~ **已移除**：密度规格 §2.8 禁用“每条事件自选颜色”（色相预算被拆散、分类无助于识别）；该字段随下次表单改版删除。
  - 每年重复 Switch 40
- footer 固定：编辑时左侧 danger「删除」（行内确认）；右侧「取消」「保存」40。
- 保存 = 提交并 pop 回 L1；校验失败留在本页显示错误；取消/返回 = 放弃并 pop；X/Esc/遮罩 = 关闭整个浮层。

## 设置 schema

```json
{
  "key": "settings",
  "groups": [{
    "title": "显示",
    "fields": [
      { "key": "showPast", "type": "boolean", "label": "显示已过去的事件", "default": true },
      { "key": "highlightSoon", "type": "boolean", "label": "强调 7 天内的事件", "default": true }
    ]
  }]
}
```

## Agent 工具（UI 路径 ↔ 工具）

| UI 路径 | 工具 |
|---|---|
| 详情·列表 | `countdown.list` |
| L2·新建 | `countdown.add` |
| L2·编辑 | `countdown.update` |
| 行尾菜单/表单·删除 | `countdown.remove` |
| 宿主设置页·倒数日 | `countdown.settings.get` / `countdown.settings.set` |

## 边界与异常

- 日期非法或早于今天且不重复：允许，显示「已过 N 天」；设置关闭“显示已过去”时不展示。
- 同一天多条：并列显示，按创建时间排序。
- 每年重复跨年换算到下一年；当天提醒保留（本地日期去重，见 DECISIONS D-12）。
- 标题超长：列表省略、表单单行不撑高。
- 数量上限沿用现有实现（50 条时 add 返回错误）。

## 不做什么

农历、图片背景、分享、时间线视图。
