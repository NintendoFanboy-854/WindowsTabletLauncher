# 久坐提醒（sedentary）

后台盯着久坐时长，到点提醒起身。**连续计时**：只有「我起来了」/ 休眠 / 退出应用会截断本轮，不按键鼠空闲判定起身（v0.3.2 起，见 D-25）。

## 数据模型

```ts
interface DayStats {
  date: string;              // YYYY-MM-DD（本地）
  sittingMinutes: number;    // 当天累计久坐分钟
  longestStreakMin: number;  // 当天最长连续
  breaks: number;            // 起身次数
}

interface Settings {
  enabled: boolean;
  thresholdMin: number;        // 默认 45
  remindEveryMin: number;      // 默认 10
  strongReminder: boolean;     // 默认 true
}

interface Runtime {
  sittingSince: string | null;  // 本轮连续计时起点；「起来了」后立即重置为新起点
  lastRemindAt?: string;
  snoozedUntil?: string;
}
```

存储：`sedentary.days`（保留）、`sedentary.settings`、`sedentary.runtime`；`"background": true`，提醒只由后台 iframe 调度（单写者）。

## 卡片

| 尺寸 | 内容 |
|---|---|
| `1×1` | 状态点/状态色 + 当前连续分钟；**不放按钮** |
| `2×1` | 分钟 68 + 状态文案 +「我起来了」40 |
| `2×2` | 分钟 + 两项统计 +「我起来了」40 |
| `3×2` | 分钟 + 三项统计 +「我起来了」40 |

- 纯展示 +「我起来了」这一个显式快捷操作；点击卡片主体（非按钮）= 打开详情。
- 删除卡片上的 `⋯` 菜单、插件长按、右键处理。
- 状态用「颜色 + 文字」双通道（Fluent Badge）；「我起来了」在卡片、详情、强提醒三处同义（正面羡余）。

## 详情（L1，`?view=detail`）

- **header**：当前状态 16 semibold + 辅助说明 12 fg3；右侧「设置…」40。
- **操作**：「我起来了」40 primary（状态危险时强调）；「稍后 5 分钟」仅在可稍后状态显示。
- **今日统计**：一行四列统计块（label 12 fg3 + 值 24 semibold + 单位 12）：今日累计久坐 / 起身次数 / 最长连续 / 距上次起身。
- **最近 7 天**：section 标题 16 semibold；行 44：日期 14 fg2 + 久坐分钟 16 semibold + 起身次数 12 fg3；纵向滚动。
- 空态：还没有今天的记录 + primary「我起来了」。
- 无 L2 子页；设置走宿主设置页。

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

- **免打扰（quietHours）已移除**（v0.3.3，D-26）：旧配置里的 `quietHours` 由 `migrateSettings` 自动删除；设置页不再出现该分组。

## Agent 工具（UI 路径 ↔ 工具）

| UI 路径 | 工具 |
|---|---|
| 详情/状态 | `sedentary.status` |
| 详情·今日统计 | `sedentary.today` |
| 卡片/详情·我起来了 | `sedentary.takeBreak` |
| 强提醒·稍后 5 分钟 | `sedentary.snooze` |
| 宿主设置页·久坐 | `sedentary.settings.get` / `sedentary.settings.set` |

## 判定逻辑（v0.3.2 连续计时 / v0.3.3 去掉免打扰）

- 后台每 10 秒 tick 一次；隐藏 iframe 的定时器可能被浏览器节流到约 60 秒，久坐分钟按 tick 时间戳增量累加，不受间隔影响。
- 会话开始后持续累加，显示 = 当前时间 − `sittingSince`。
- 达阈值→提醒（`strongReminder` 开则 `showReminder`，否则 `notify`）；未起身按 `remindEveryMin` 再催。
- 「我起来了」（卡片/详情/强提醒确认/`sedentary.takeBreak`）→ 结算本轮、breaks +1，**立即开始新一轮**（计时从 0 继续，不等待输入）。
- tick 间隔 > 5 分钟（休眠唤醒 / 应用退出 / 系统时钟突变）→ 空档不计入久坐，把 `sittingSince` 顺延同样时长，回来后接着计时；不记 break。
- 无免打扰时段：到阈值就提醒（v0.3.3 起）。
- 跨零点结算前一天；重启从 runtime 恢复。

## 边界与异常

- 提醒单写者 + `navigator.locks` 抢锁（见 D-12），不会重复弹。
- 休眠唤醒、系统时钟突变、应用退出：空档不计入，计时顺延（v0.3.2 起不再判为起身）。
- 独立预览（无宿主）由卡片实例兜底启动引擎。
- 已知取舍：桌面摆件式使用（长时间只是看屏幕、不触碰）按连续久坐计；离开位置请按「我起来了」或关闭应用，否则离开时间也会计入本轮。

## 不做什么

摄像头姿态识别、健康数据同步、强制锁屏、趋势图（进复盘页）、多设备。
