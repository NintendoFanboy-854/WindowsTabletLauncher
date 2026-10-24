# 番茄钟（pomodoro）

桌面专注计时器：番茄工作法 + 白噪音 + 专注记录，数据并入复盘。

## 数据模型

```ts
type Phase = 'focus' | 'shortBreak' | 'longBreak';

interface Session {
  id: string;
  startedAt: string;
  endedAt?: string;
  phase: Phase;
  durationMin: number;
  actualMin: number;
  completed: boolean;
  taskId?: string;
  taskTitle?: string;
}

interface Settings {
  focusMin: number;                // 25
  shortBreakMin: number;           // 5
  longBreakMin: number;            // 15
  roundsBeforeLongBreak: number;   // 4
  autoStartNext: boolean;          // false
  sound: boolean;                  // true
  keepAwake: boolean;              // true
  whiteNoise: 'none' | 'rain' | 'cafe' | 'fan';
  whiteNoiseVolume: number;        // 0–100
}
```

存储：`pomodoro.sessions`、`pomodoro.settings`、`pomodoro.runtime`（进行中状态，崩溃恢复）。

## 卡片

| 尺寸 | 内容 |
|---|---|
| `1×1` | 剩余时间 `fontSizeHero900`/`lineHeightHero900`（40/52）+ 阶段 12；**不放按钮、不放进度条**，点击进详情 |
| `2×1` | 时间 40 + 阶段 +「开始/暂停」40 +「重置」40（**计时器类 2×1 主操作例外**，见 DENSITY §2） |
| `2×2` | 时间 + 阶段 + 当前任务 16 + 轮次 12 + 今日统计一行 + 按钮行 |
| `3×2` | 时间 + 阶段 + 进度条 4 + 任务 + 2×2 统计块（完成/专注/连续/轮次）+ 按钮 |

- hero 全档同字号 40/52，不随尺寸放大（旧的 48/68/96 作废，DENSITY §2.1-8 / D-36 §1）。
- 快捷操作只留「开始/暂停」「重置」（高频、单步）；跳过、任务关联、白噪音都在详情/设置。
- 删除 `⋯` 菜单、沉浸模式、插件长按/右键；点击非按钮区域 = 打开详情。
- 任务标题只在有关联任务时渲染；无任务不占行（不再显示「未关联任务」占位）。

- identity 行尾固定 `ChevronRight16Regular`（`CardIdentity disclosure`，`aria-hidden`）：整卡可点开详情的唯一视觉信号，非 `compact` 档全覆盖（空态与有内容态一致）；空态不写说明句（PLUGIN-CONTRACT §4.4.3）。

## 详情（L1，`?view=detail`）

- **header 56**：阶段 Badge 14（专注=brand tint，短休/长休=informative tint）+ 剩余时间 40（tabular）+ 轮次提示 12 fg3；右侧「设置…」40。
- **操作条 48**：「开始/暂停」40 primary /「重置」40 /「跳过阶段」40 /「任务：标题 ▾」40（打开 L2 选择任务）。
- **今日与趋势**：一行四列统计块（label 12 fg3 + 值 24 semibold + 单位 12）：今日完成 / 今日专注 / 本周完成 / 连续天数。
- **最近记录**：section 标题 16 semibold；按天分组（组头 12 fg3 高 28）；行 44：时间区间 14 fg2 tabular + 任务/阶段 14 fg1 + 时长 16 semibold + 状态 Badge 12（完成/中断）。
- **清空记录**：行内展开确认「进行中的一轮不会删除」+「清空今日 / 清空全部 / 取消」40；执行后行内提示已清空 N 条。
- 空记录：一句话 + primary「开始专注」。
- 内容区滚动；header/操作条固定。

## 详情（L2，选择关联任务）

- push 子页：header 56（← 返回 +「选择任务」16 semibold）。
- 搜索 Input 40；置顶「不关联任务」行 44；按今日/以后分组列出待办未完成任务（行 44，checkbox 40 单选）。
- 选中即关联并 pop；L1「任务 ▾」文案更新；`pomodoro.start(taskId, taskTitle)` 带上参数。
- 无任务时提示「待办里没有未完成任务」；返回/取消 = pop；X/Esc = 关闭整个浮层。

## 设置 schema

```json
{
  "key": "settings",
  "groups": [
    { "title": "时长与轮数", "fields": [
      { "key": "focusMin", "type": "number", "label": "专注", "unit": "分钟", "min": 1, "max": 180, "default": 25 },
      { "key": "shortBreakMin", "type": "number", "label": "短休", "unit": "分钟", "min": 1, "max": 60, "default": 5 },
      { "key": "longBreakMin", "type": "number", "label": "长休", "unit": "分钟", "min": 1, "max": 60, "default": 15 },
      { "key": "roundsBeforeLongBreak", "type": "number", "label": "长休前轮数", "min": 1, "max": 12, "default": 4 }
    ]},
    { "title": "行为", "fields": [
      { "key": "autoStartNext", "type": "boolean", "label": "自动开始下一阶段", "default": false },
      { "key": "sound", "type": "boolean", "label": "阶段结束提示音", "default": true },
      { "key": "keepAwake", "type": "boolean", "label": "专注时阻止息屏", "default": true }
    ]},
    { "title": "白噪音", "fields": [
      { "key": "whiteNoise", "type": "enum", "label": "类型", "default": "none", "options": [
        { "value": "none", "label": "无" },
        { "value": "rain", "label": "雨声" },
        { "value": "cafe", "label": "咖啡厅" },
        { "value": "fan", "label": "风扇" }
      ]},
      { "key": "whiteNoiseVolume", "type": "number", "label": "音量", "min": 0, "max": 100, "default": 40 }
    ]}
  ]
}
```

## Agent 工具（UI 路径 ↔ 工具）

| UI 路径 | 工具 |
|---|---|
| 卡片/详情·开始 | `pomodoro.start`（可带 minutes/taskId/taskTitle） |
| 卡片/详情·暂停 | `pomodoro.pause` |
| 继续 | `pomodoro.resume` |
| 详情·重置 | `pomodoro.reset` |
| 详情·跳过阶段 | `pomodoro.skip` |
| 结束本轮 | `pomodoro.stop` |
| 详情·状态/统计 | `pomodoro.status` / `pomodoro.stats` |
| 详情·清空记录 | `pomodoro.clearStats`（scope: today/all） |
| L2·选择任务 | `pomodoro.start(taskId, taskTitle)`；任务列表来自待办工具 |
| 宿主设置页·番茄钟 | `pomodoro.settings.get` / `pomodoro.settings.set` |

## 边界与异常

- 应用重启优先从 `pomodoro.runtime` 恢复；过期按完成落库。
- 中止也写 Session（`completed=false`，`actualMin` 按实际经过时间）。
- keepAwake 只在专注期间开启，结束/退出必须关闭。
- 阶段切换通知宿主 `notify`；提示音可选。
- 清空今日只删今天 session；清空全部删除全部历史；进行中的一轮不受影响。
- 白噪音内置音频随插件打包，不联网。

## 不做什么

计时历史编辑、多设备同步、团队番茄钟、排行榜、自动排期。
