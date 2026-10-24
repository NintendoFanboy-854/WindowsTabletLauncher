# 久坐提醒（sedentary）

手动记录「坐着 ↔ 站立」循环：坐着计时，起身点按钮休息，坐下再开新一轮。到阈值只提醒**坐着**的人；站立多久由用户自己按「我坐下了」，不做自动判定、不碰摄像头、不碰键鼠空闲（D-27）。

## 数据模型

```ts
interface DayStats {
  date: string;              // YYYY-MM-DD（本地）
  sittingMinutes: number;    // 当天累计坐着分钟（只累计 sitting 状态）
  standingMinutes: number;   // 当天累计站立分钟（standing 状态）
  longestStreakMin: number;  // 当天最长连续坐姿
  breaks: number;            // 起身次数（坐着→站立的次数）
}

interface Settings {
  enabled: boolean;
  thresholdMin: number;        // 默认 45
  remindEveryMin: number;      // 默认 10
  strongReminder: boolean;     // 默认 true
}

interface Runtime {
  posture: 'sitting' | 'standing' | null;  // 当前状态
  postureSince: string | null;             // 当前状态起点
  lastRemindAt?: string;
  snoozedUntil?: string;
}
```

存储：`sedentary.days` / `sedentary.runtime` / `sedentary.command`；`"background": true`，计时与提醒只由后台 iframe 的 `SedentaryEngine` 写（单写者，`navigator.locks` 串行化）。

## 状态机（全手动）

| 当前 | 操作 | 结果 |
|---|---|---|
| 坐着 | 点「我站起来了」/ Agent `sedentary.standUp` / 强提醒「我站起来了」 | 结算本轮久坐、`breaks + 1`、更新最长连续；进入站立，久坐计时暂停 |
| 站立 | 点「我坐下了」/ Agent `sedentary.sitDown` | 结算站立时长；回到坐着，开始新一轮久坐 |
| 坐着（到阈值） | 强提醒「稍后 5 分钟」 | 本轮提醒推迟 5 分钟，仍保持坐着 |
| 站立 | — | 不提醒、不计久坐；用户不按就一直算站立 |

- 重复操作幂等：坐着再点「站起来」、站立再点「坐下」不产生副作用。
- 休眠 / 应用退出 / 系统时钟突变（tick 间隔 > 5 分钟）：空档不计入久坐或站立，把当前姿态起点顺延，回来后接着计时；不记 break、不切状态。

## 卡片

| 尺寸 | 内容 |
|---|---|
| `1×1` | identity(图标 + Badge) + 当前状态分钟 40/52 + 单位；**不放按钮、不放提示/状态点** |
| `2×1` | identity(图标 +「久坐」+ trailing〔状态点 + hint〕) + 分钟 40 + 状态按钮 40 |
| `2×2` | Metric(label「连续久坐」+ caption hint) + 3 列统计（今日久坐/今日站立/起身次数）+ 7 天迷你条 32 + 状态按钮 40 |
| `3×2` | 上带：分钟 40 + 3 列统计；中带：7 天迷你条（含 12px 日期行）；下带：状态按钮 40 |
| `3×3`（可选） | 3×2 全部 + 最近 7 天逐行（行高 44，副标题 12） |

- hero 全档同字号 40/52；状态点仅 warning/danger 出现，8×8（`spacingHorizontalS`），success 态不画点。

- 文案只讲状态与下一步，不解释状态机：站立时卡片不再出现「坐下后开始新一轮」，`hintOf` 返回空串，由标题/Badge 表达。
- 状态标签：`久坐中 / 接近提醒 / 该起身了 / 休息中 / 已关闭`；站立为 `informative`。
- 点击卡片主体（非按钮）= 打开详情；按钮 `stopPropagation`，只记录状态；不再为每次操作弹「已记录…」通知（状态在卡片/详情里可见）。

- identity 行尾固定 `ChevronRight16Regular`（`CardIdentity disclosure`，`aria-hidden`）：整卡可点开详情的唯一视觉信号，非 `compact` 档全覆盖（空态与有内容态一致）；空态不写说明句（PLUGIN-CONTRACT §4.4.3）。

## 详情（L1，`?view=detail`）

- **header**：坐着「连续久坐 N 分钟」+「距提醒还有 N 分钟 / 该起身了 / 提醒已推迟到 HH:MM」；站立「站立休息 N 分钟」，不再写辅助说明；右侧「设置…」。
- **操作**：状态按钮（同上）；「稍后 5 分钟」只在坐着且到阈值时出现。
- **今日统计**：今日久坐 / 今日站立 / 起身次数 / 最长连续坐。
- **最近 7 天**：行副标题「站立 X 分钟 · 起身 N 次」，trailing 为久坐分钟。
- 空态：PersonWalking24Regular + 标题（提醒关闭时「提醒已关闭」、没计时时「还没开始计时」）+ 一个次操作（「打开设置」Settings20Regular / 「我坐下了」ArrowDownRegular）；不写说明句。
- 无 L2 子页；设置统一在宿主设置页。

## 设置 schema

```json
{
  "key": "settings",
  "groups": [
    { "title": "提醒", "fields": [
      { "key": "enabled", "type": "boolean", "label": "启用久坐提醒", "default": true },
      { "key": "strongReminder", "type": "boolean", "label": "全屏强提醒", "default": true }
    ]},
    { "title": "计时", "fields": [
      { "key": "thresholdMin", "type": "number", "label": "提醒阈值", "unit": "分钟", "min": 5, "max": 120, "default": 45 },
      { "key": "remindEveryMin", "type": "number", "label": "未起身再催", "unit": "分钟", "min": 1, "max": 60, "default": 10 }
    ]}
  ]
}
```

- 已移除：免打扰（quietHours，D-26）、空闲判定起身（idleResetMin，D-25/D-27）。

## Agent 工具

| 工具 | 说明 |
|---|---|
| `sedentary.status` | 当前姿态、当前状态分钟、今日久坐/站立分钟、起身次数、距提醒 |
| `sedentary.today` | 今日统计 + 最近 7 天 |
| `sedentary.standUp` | 坐着→站立（记录起身、暂停久坐计时）；短语 `我站起来了 / 站起来了 / 我起身了 / 我离开座位了` |
| `sedentary.sitDown` | 站立→坐着（结算站立）；短语 `我坐下了 / 我坐下来了 / 坐下了 / 我回到座位了` |
| `sedentary.snooze` | 已到阈值时推迟 5 分钟（仅坐着） |
| `sedentary.stats` | 复盘用：区间汇总，见下 |
| `sedentary.settings.get/set` | 读写设置 |

- `standUp` / `sitDown` 声明了 `phrases`：用户整句（忽略空白与标点）等于其中一条时，**宿主直接执行工具**，
  不等模型决定；状态写入插件后，卡片/详情靠 storage 事件立即同步。工具结果再以 tool call 形式交给模型，
  模型只做一句短确认（D-28）。
- 工具描述与返回保持精简（只回姿态与必要数字），不在描述里教模型“点 UI 哪个按钮”。

### 复盘契约（`sedentary.stats`）

参数：`{ range: 'today'|'week'|'month', from?: ISO, to?: ISO }`（宿主复盘页按 `*.stats` 约定调用，range/from/to 都会带上）。

返回：

```ts
{
  range, from, to,
  completed: number,       // 主数值 = 起身次数
  breaks: number,
  sittingMinutes: number,
  standingMinutes: number,
  longestStreakMin: number,
  byDay: { [date: string]: number }  // 每天的起身次数（热力图口径）
}
```

- 复盘页主数值显示「N 次起身」；次要指标显示久坐/站立分钟；热力图按每天起身次数累计。

## 判定逻辑

- 后台每 10 秒 tick；隐藏 iframe 定时器可能被节流到约 60 秒，分钟数按 tick 时间戳增量累加。
- 坐着：累计 `sittingMinutes`、更新 `longestStreakMin`；到阈值按 `remindEveryMin` 提醒。
- 站立：累计 `standingMinutes`，不提醒。
- 跨零点：累计时长按天拆分（across-midnight 拆到两天）。
- 重启从 runtime 恢复；旧版本只有 `sittingSince` 的存档迁移成「坐着」。

## 边界与异常

- 提醒单写者 + `navigator.locks` 抢锁（D-12），不会重复弹。
- 休眠唤醒 / 系统时钟突变 / 应用退出：空档不计入、姿态顺延（v0.3.2 起不再判为起身）。
- 独立预览（无宿主）由卡片实例兜底启动引擎。
- Agent 同步（D-28）：在聊天里说「我站起来了 / 我坐下了」时，宿主按 `phrases` 直接执行工具，卡片/详情无需再点按钮；
  语音先等 ASR 转写（最多 8s）再发带转写文本的请求，避免模型“听懂了但没调工具”。
- 已知取舍：离开位置要按「我站起来了」或对 Agent 说，否则离开时间仍计入久坐；站立后要按「我坐下了」或对 Agent 说，否则站立时间会一直累计。

## 不做什么

摄像头姿态识别、自动坐/站检测、键鼠空闲推断、强制锁屏、与番茄钟联动、健康数据同步、多设备。
