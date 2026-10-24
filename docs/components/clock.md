# 时钟（clock）

桌面最常被看到的组件：抬手看时间/日期；进入详情后看世界时钟与日期信息。

## 数据模型

```ts
interface Settings {
  hour12: boolean;       // 12 小时制，默认 false
  showSeconds: boolean;  // 默认 true
  dateFormat: 'zh' | 'iso' | 'en'; // 默认 zh（旧数据 cn 读取时归一为 zh）
}

interface WorldClock {
  id: string;      // 城市 id
  name: string;    // 中文城市名
  tz: string;      // IANA 时区，如 Asia/Shanghai
}
```

存储：`clock.settings`、`clock.places`（世界时钟，最多 8 个）。

## 卡片

| 尺寸 | 内容 |
|---|---|
| `1×1` | 时间 `fontSizeHero900`/`lineHeightHero900`（40/52），不显示秒/日期 |
| `2×1` | 时间 40 + 秒 16（`Base400`）+ 日期 14（`Base300`，放 identity 行 trailing） |
| `3×2` | 时间 40 + 秒 16 + 日期/星期 16（`Base400`）+ 世界时钟 3 行（城市 14 / 当地时间 24，行高 44） |

- hero 全档同字号 40/52，不随尺寸放大（48/68/112 作废，DENSITY §2.1-8 / D-36 §1）。
- 纯展示；点击卡片主体 / Enter / Space = 打开详情（宿主 `?view=detail`）。
- 不响应长按/右键（长按归宿主编辑模式），无快捷操作。
- 设置（12/24h、显示秒、日期格式）在宿主设置页「时钟」分区。

- identity 行尾固定 `ChevronRight16Regular`（`CardIdentity disclosure`，`aria-hidden`）：整卡可点开详情的唯一视觉信号，非 `compact` 档全覆盖（空态与有内容态一致）；空态不写说明句（PLUGIN-CONTRACT §4.4.3）。

## 详情（L1，`?view=detail`）

- **header 56**：当前时间 40（`Hero900`，tabular）+ 日期 14 fg3；右侧「添加城市」40、「设置…」40。
- **世界时钟**：section 标题 16 semibold + 上限提示 12 fg3 + 右侧「刷新」40（逐条用 Nominatim + timeapi.io 重新解析时区，失败保留原值，1.1s/条）；
  行高 48：城市 14 fg1 + 时区（12 fg3）/ 当地时间 24 semibold tabular（右对齐）/ 今天·明天·昨天 12 fg3 / 行尾 `⋯` 40 → 删除（即时生效，可重新添加）。
  > 48 = `spacingVerticalXXXL`(32) + `spacingVerticalL`(16)，是**详情页的富行**（两行文字 + 行尾操作）；
  > 卡片内的列表行仍是 `LIST_ROW_HEIGHT` 44（`ListRow`），两者不要混用（TOKEN-MAP §8/§12）。
  秒级刷新；时间格式跟随设置；时区用 `Intl.DateTimeFormat` 计算，不手写偏移。
- **日期信息**：三列等宽（label 12 fg3 + value 20 semibold）：本周第 N 周 / 今年第 N 天 / 系统时区。
- 空态（卡片 3×2）：「没有世界时钟」+ Globe24Regular（中性）+ **secondary**「添加城市」（补 Add20Regular）；详情页空态：「还没有城市」+「添加城市」。空态不写说明句（PLUGIN-CONTRACT §4.4.3），入口由这两个动作按钮与 identity 行尾 chevron 承担。
- 内容区滚动；header 固定。

## 详情（L2，添加城市）

- `?view=detail` 内 push 子页：header 56（← 返回 + “添加城市” 16 semibold）。
- 搜索 Input 40：**没有内置城市表**，输入 ≥2 字符停顿 400ms 后请求 API（Nominatim 城市搜索 + timeapi.io 坐标换 IANA 时区，均免 key）；同一关键词命中 `clock.searchCache` 时直接出结果；合法 IANA 时区名直接给候选。结果行 44：城市 14 + 国家/行政区 12 fg3 + 时区 12 fg3 +「添加」40。
- 已添加→「已添加」disabled；重复城市禁止；达上限 8 时提示。
- 添加成功：pop 回 L1，新行 200ms 淡入上移。

## 设置 schema（manifest `settings`）

```json
{
  "key": "settings",
  "groups": [{
    "title": "时间显示",
    "fields": [
      { "key": "hour12", "type": "boolean", "label": "12 小时制", "default": false },
      { "key": "showSeconds", "type": "boolean", "label": "显示秒", "default": true },
      { "key": "dateFormat", "type": "enum", "label": "日期格式", "default": "zh",
        "options": [
          { "value": "zh", "label": "10月18日 星期日" },
          { "value": "iso", "label": "2026-10-18" },
          { "value": "en", "label": "10/18 Sun" }
        ] }
    ]
  }]
}
```

## Agent 工具（UI 路径 ↔ 工具）

| UI 路径 | 工具 |
|---|---|
| 读当前时间/日期 | `clock.now` |
| 宿主设置页·时钟分区 | `clock.settings.get` / `clock.settings.set` |
| 详情·世界时钟列表 | `clock.world.list` |
| 详情·添加城市 | `clock.world.add` |
| 详情·删除城市 | `clock.world.remove` |

## 边界与异常

- 世界时钟最多 8 个；超出/重复在 L2 禁用添加。
- 搜索失败/离线就是没有结果（不做内置表兜底）；已添加的行只存 IANA 时区名，照常显示（不依赖接口）。
- 搜过的关键词缓存在 `clock.searchCache`（最多 30 条），缓存命中不发请求。
- Nominatim 使用条款要求 ≤1 次/秒：输入 debounce 400ms，单次最多 6 条结果。
- 夏令时/时区偏移由 `Intl` 计算；系统时区变化自动跟随。
- 12/24h 与日期格式修改后，卡片与详情通过宿主 `host:config` 推送即时同步（D-29；不依赖
  storage 事件——Tauri 打包版宿主页与插件 iframe 不同 origin）。
- 独立预览（无宿主）使用本地配置兜底，不依赖宿主 API。

## 不做什么

闹钟、倒计时、秒表、日程、农历。（世界时钟本轮重新纳入范围，见上。）
