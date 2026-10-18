# 番茄钟（pomodoro）

桌面上的专注计时器：番茄工作法 + 白噪音 + 专注记录，数据并入复盘。

## 数据模型

```ts
type Phase = 'focus' | 'shortBreak' | 'longBreak';

interface Session {
  id: string;
  startedAt: string;      // ISO
  endedAt?: string;       // ISO，中止时也写
  phase: Phase;
  durationMin: number;    // 计划时长
  actualMin: number;      // 实际专注分钟（中止时按 elapsed）
  completed: boolean;     // 是否跑完
  taskId?: string;        // 关联的待办任务
}

interface Settings {
  focusMin: number;          // 默认 25
  shortBreakMin: number;     // 默认 5
  longBreakMin: number;      // 默认 15
  roundsBeforeLongBreak: number; // 默认 4
  autoStartNext: boolean;    // 默认 false
  sound: boolean;            // 阶段结束提示音，默认 true
  keepAwake: boolean;        // 专注时阻止息屏，默认 true
  whiteNoise: 'none' | 'rain' | 'cafe' | 'fan'; // 默认 none
  whiteNoiseVolume: number;  // 0–100，默认 40
}
```

存储：`pomodoro.sessions`（长期保留）、`pomodoro.settings`、`pomodoro.runtime`（进行中的状态，崩溃恢复用）。

## 尺寸与布局

| 尺寸 | 内容 |
|---|---|
| `1×1` | 剩余时间 + 环形进度 + 当前阶段 |
| `2×1` | 时间 + 开始/暂停/跳过按钮 |
| `2×2` | 时间 + 当前任务标题 + 按钮 + 白噪音开关 |
| `3×2` | 时间 + 今日统计（完成 N 个 / 专注 M 分钟）+ 设置入口 |

## 自适应

- `1×1` 只留环形进度 + 剩余分钟；按钮从 `2×1` 起；统计和任务从 `2×2` 起。
- 环形进度随卡片短边缩放，SVG 用 viewBox + 100% 尺寸。

## 交互

- 按钮：开始 / 暂停 / 继续 / 跳过本轮 / 重置。
- 点击时间区域 = 进入沉浸模式（全屏遮罩，只显示大倒计时 + 当前任务 + 结束按钮）。
- 阶段自动流转：专注 → 短休 → 专注…，每完成 `roundsBeforeLongBreak` 个专注进长休。
- 白噪音：选择后循环播放，可独立调音量；阶段结束淡出。
- 关联待办：开始前可选择一项任务（从待办插件读未完成任务）；完成后按配置自动打勾。

## 配置项

上面 `Settings` 全部可在设置面板里改，并即时生效（进行中的一轮不改变时长）。

## Agent 工具

| 工具 | 参数 | 返回 |
|---|---|---|
| `pomodoro.start` | `{ minutes?, taskId? }` | 当前状态 |
| `pomodoro.pause` | — | 当前状态 |
| `pomodoro.resume` | — | 当前状态 |
| `pomodoro.stop` | — | 本次记录 |
| `pomodoro.skip` | — | 当前状态 |
| `pomodoro.status` | — | 阶段、剩余秒、任务、今日统计 |
| `pomodoro.stats` | `{ range: 'today' \| 'week' \| 'month' }` | 完成数、专注分钟、连续天数 |

## 边界与异常

- 应用重启：优先从 `pomodoro.runtime` 恢复进行中的一轮；已过期的按“完成”落库。
- 中止（stop）也写 Session，`completed=false`，`actualMin` 按实际经过时间取整分钟。
- 沉浸模式与屏幕常亮：常亮由宿主 API 提供（`host.setKeepAwake(true/false)`），退出时务必关闭。
- 白噪音：内置音频文件随插件打包，不联网。
- 阶段切换必须走通知（宿主 `notify`），声音可选。

## 依赖的宿主能力

- `init(theme)`、`getConfig/setConfig`、`notify(text)`。
- `host.setKeepAwake(bool)`：宿主新增（Tauri 侧停掉息屏）。
- 读待办任务：通过 Agent 工具调用 `todo.list`，插件不直接跨插件访问。

## 不做什么

计时器历史编辑、多设备同步、团队番茄钟、排行榜、自动排期。

## 与参考产品（Todo清单）对齐

- 番茄专注小组件：一键开始专注。
- 番茄工作法 + 白噪音（雨声 / 咖啡厅 / 风扇）。
- 专注数据进「复盘」：昨日小结、周报、统计。
