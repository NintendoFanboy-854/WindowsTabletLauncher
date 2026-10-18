# 久坐提醒（sedentary）

后台盯着你坐了多久，到点叫你起来动一动。纯输入活动判定，不碰摄像头。

## 数据模型

```ts
interface DayStats {
  date: string;              // YYYY-MM-DD（本地时区）
  sittingMinutes: number;    // 当天累计久坐分钟（不含起身间隔）
  longestStreakMin: number;  // 当天最长连续久坐
  breaks: number;            // 起身次数
}

interface Settings {
  enabled: boolean;            // 默认 true
  thresholdMin: number;        // 坐多久提醒，默认 45
  remindEveryMin: number;      // 没起来就再催，默认 10
  idleResetMin: number;        // 空闲多久算起身，默认 5
  strongReminder: boolean;     // 全屏强提醒，默认 true
  quietHours: { start: string; end: string } | null; // 默认 null（可设为 22:00–08:00）
}

interface Runtime {
  sittingSince: string;      // ISO，本轮开始久坐的时间
  lastInputAt: string;
  lastRemindAt?: string;
  snoozedUntil?: string;
}
```

存储：`sedentary.days`（长期保留）、`sedentary.settings`、`sedentary.runtime`。

## 判定逻辑

- 每 10 秒轮询 `host.getIdleSeconds()`；有输入（idle < 60 秒）时累加本轮久坐时长。
- 本轮时长 ≥ `thresholdMin` → 触发提醒（`notify`，`strongReminder` 开则 `showReminder`）。
- 提醒后未起身，每 `remindEveryMin` 分钟再催一次。
- `idleSeconds ≥ idleResetMin × 60`（含锁屏、休眠）→ 判定已起身：写 `breaks`、结束本轮、清零计时。
- 跨过本地零点：结算前一天，写 `sedentary.days`，开新的一天。
- 免打扰时段内：不提醒，但**继续计时**；时段结束时若仍超阈值，立刻补一次提醒。
- 强提醒的按钮：「起来了」（立刻结算本轮）和「稍后 5 分钟」（snooze 5 分钟）。

## 尺寸与布局

| 尺寸 | 内容 |
|---|---|
| `1×1` | 状态点（绿 / 黄 / 红）+ 当前连续分钟 |
| `2×1` | 当前连续时长 + 提示语 + 「我起来了」按钮 |
| `2×2` | 今日累计久坐 + 起身次数 + 打卡 + 最近一次次数 |
| `3×2` | 完整：今日累计、最长连续、起身次数、阈值/免打扰设置入口 |

## 自适应

- `1×1` 只留状态点 + 分钟数；文字提示和打卡按钮从 `2×1` 起。
- 状态颜色用 Fluent 语义色 token（success / warning / danger）。

## 交互

- 点击卡片 = 打卡「我起来了」。
- 长按 = 设置面板（开关、阈值、提醒间隔、空闲判定、强提醒、免打扰时段）。
- 强提醒遮罩：点「起来了」或「稍后 5 分钟」，30 秒无操作自动收起。

## 配置项

上面 `Settings` 全部，改完立即生效；进行中的一轮不改变 `sittingSince`。

## Agent 工具

| 工具 | 参数 | 返回 |
|---|---|---|
| `sedentary.status` | — | 是否在久坐、当前连续分钟、阈值、距提醒还有多久 |
| `sedentary.today` | — | 今日累计、最长连续、起身次数 |
| `sedentary.takeBreak` | — | 结算本轮，返回今日统计 |

## 边界与异常

- 应用重启：从 `sedentary.runtime` 恢复；若 `lastInputAt` 很久以前，按“已起身”处理。
- 休眠唤醒：`getIdleSeconds` 会很大，按起身处理。
- 免打扰时段跨零点（22:00–08:00）：按“当天时段”处理即可。
- 必须 `"background": true`，否则桌面没挂载时计时停摆。

## 依赖的宿主能力

`init`、`getConfig/setConfig`、`notify`、`showReminder`、`getIdleSeconds`。

## 不做什么

摄像头姿态识别、健康数据同步、强制锁屏、趋势图（进复盘页）、多设备。

## 与参考产品对齐

参考产品（Todo清单）没有久坐功能，这里没有可抄的，按上面的设计来。
