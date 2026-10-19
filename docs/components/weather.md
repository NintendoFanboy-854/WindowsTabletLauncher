# 天气（weather）

桌面上的天气卡片，数据来自和风天气（QWeather）。支持多城市、自动定位。

## 数据模型

```ts
interface Place {
  id: string;          // 和风 location id
  name: string;        // 城市名
  lat: number;
  lon: number;
  isCurrent: boolean;  // 卡片当前显示的城市
}

interface Settings {
  places: Place[];
  unit: 'c' | 'f';                 // 默认 c
  refreshMin: 15 | 30 | 60;        // 默认 30
  autoLocate: boolean;             // 默认 true
  showAir: boolean;                // 默认 true
  showWarnings: boolean;           // 默认 true
  showMinutely: boolean;           // 默认 false（分钟级降水）
}
```

存储：`weather.settings`、`weather.cache`（按城市缓存 `{ fetchedAt, current, hourly, daily, air, warnings, indices }`）。

## 数据源

- 和风天气：GeoAPI（城市搜索/反查）、实时天气、24h 逐时、7 天预报、空气质量、预警、生活指数、分钟级降水。
- API Key 存在 `weather.settings`（本地），不进 git。
- 自动定位：`host.getLocation()`（Windows 系统定位）优先；失败回退“上次城市”，再失败提示手动选择。高德 IP 归属地兜底**暂缓**（等需求方提供高德 API Key，见 DECISIONS D-10），本轮实现不变。

## 尺寸与布局

| 尺寸 | 显示 |
|---|---|
| `1×1` | 和风天气图标 + 当前温度 |
| `2×1` | 当前温度 + 今日最高/最低 + 天气现象文字 |
| `2×2` | 当前 + 未来 6 小时逐时（图标 + 温度） |
| `3×2` | 当前 + 7 天预报（每天：星期、图标、高低温） |
| `4×2` | 当前 + 7 天 + 空气质量（AQI 环） |

图标用和风官方图标集（`icons/dark` 深色主题 / `icons/light` 浅色主题，共 138 个），按 `icon` 代码映射。

## 自适应

- `1×1` 只留图标 + 温度，不显示城市名和文字。
- 逐时/7 天在窄卡片里减少列数，不横向滚动。
- 天气图标按卡片尺寸缩放。

## 交互

- 点击卡片 = 打开详情（Fluent `OverlayDrawer`，右侧滑出）：`TabList` 分「逐小时 / 7 天 / 空气 / 生活指数 / 预警」，内容用 Fluent 组件与 token 排版。选 Drawer 而不是 Dialog，是因为详情信息密度高，Drawer 保留桌面上下文，符合 Fluent 2 的桌面端做法。
- 卡片左上角城市名可点，弹出城市切换（Fluent `Menu`）。
- 长按 = 设置（`Dialog`）：城市管理、单位、刷新间隔、显示项、API Key。
- 自动定位结果：若定位城市与当前城市不同，不自动切换，只在城市菜单里标“当前位置”。

## 配置项

`Settings` 全部；设置里还能管理城市列表（添加/删除/设为当前）。

## Agent 工具

| 工具 | 参数 | 返回 |
|---|---|---|
| `weather.current` | `{ place? }` | 当前天气（默认当前城市） |
| `weather.hourly` | `{ place?, hours? }` | 逐时（默认 12 小时） |
| `weather.daily` | `{ place?, days? }` | 逐日（默认 7 天） |
| `weather.air` | `{ place? }` | 空气质量 |
| `weather.warning` | `{ place? }` | 预警列表 |
| `weather.queryPlace` | `{ city }` | **查询任意地方天气**：先用 GeoAPI 搜索城市，再返回当前 + 今日高低温（不需要在城市列表里） |
| `weather.places` | — | 城市列表 |
| `weather.addPlace` | `{ city }` | 添加城市 |
| `weather.removePlace` | `{ id }` | 删除城市 |

`place` 参数可以是城市名、location id，或 `"current"`（默认）。

## 边界与异常

- 未配置 API Key：卡片显示引导“去设置里填 Key”，Agent 调用返回错误提示。
- 请求失败或 429：用缓存并显示“离线 · 更新于 X 分钟前”；缓存过旧时标注“数据可能过期”。
- 预警优先：有预警时卡片顶部显示预警条，详情默认打开预警 Tab。
- 分钟级降水只在有数据时显示，无数据不占位。
- 刷新：卡片可见时按 `refreshMin` 轮询；后台不轮询。

## 依赖的宿主能力

`init`、`getConfig/setConfig`、`notify`、`getLocation`。

## 不做什么

雷达图、天气地图、台风路径、历史天气、多日空气质量趋势图、账号体系。
