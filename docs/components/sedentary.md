# 久坐提醒（sedentary）

后台盯着久坐时长，到点提醒起身。纯输入活动判定，不碰摄像头。

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
  idleResetMin: number;        // 默认 5
  strongReminder: boolean;     // 默认 true
  quietHours: { start: string; end: string } | null;
}

interface Runtime {
  sittingSince: string | null;
  lastInputAt: string;
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
      { "key": "remindEveryMin", "type": "number", "label": "未起身再催", "unit": "分钟", "min": 1, "max": 60, "default": 10 },
      { "key": "idleResetMin", "type": "number", "label": "空闲判定起身", "unit": "分钟", "min": 1, "max": 30, "default": 5 }
    ]},
    { "title": "免打扰", "fields": [
      { "key": "quietHours", "type": "timeRange", "label": "免打扰时段", "default": { "start": "22:00", "end": "08:00" } }
    ]}
  ]
}
```

## Agent 工具（UI 路径 ↔ 工具）

| UI 路径 | 工具 |
|---|---|
| 详情/状态 | `sedentary.status` |
| 详情·今日统计 | `sedentary.today` |
| 卡片/详情·我起来了 | `sedentary.takeBreak` |
| 强提醒·稍后 5 分钟 | `sedentary.snooze` |
| 宿主设置页·久坐 | `sedentary.settings.get` / `sedentary.settings.set` |

## 判定逻辑（不变）

- 每 10 秒轮询 `host.getIdleSeconds()`；有输入时累加本轮久坐。
- 达阈值→提醒（`strongReminder` 开则 `showReminder`，否则 `notify`）；未起身按 `remindEveryMin` 再催。
- `idleSeconds ≥ idleResetMin×60`（含锁屏/休眠）→ 判定起身，记录 breaks、结束本轮。
- 免打扰时段继续计时但不提醒，时段结束补一次。
- 跨零点结算前一天；重启从 runtime 恢复。

## 边界与异常

- 提醒单写者 + `navigator.locks` 抢锁（见 D-12），不会重复弹。
- 休眠唤醒、系统时钟突变按“已起身”处理。
- 独立预览（无宿主）由卡片实例兜底启动引擎。

## 不做什么

摄像头姿态识别、健康数据同步、强制锁屏、趋势图（进复盘页）、多设备。
