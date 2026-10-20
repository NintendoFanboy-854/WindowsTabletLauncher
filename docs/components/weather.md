# 天气（weather）

桌面上的天气卡片，数据来自和风天气（QWeather）。支持多城市与自动定位：系统定位优先，
失败用 **ip.cn 网络归属地** 兜底（D-16；不再使用高德）。

## 数据模型

```ts
interface Place {
  id: string;        // 和风 location id
  name: string;
  adm1?: string;
  lat: number;
  lon: number;
  tz?: string;
  isCurrent: boolean; // 当前显示城市
}

interface Settings {
  places: Place[];
  unit: 'c' | 'f';
  refreshMin: 15 | 30 | 60;
  autoLocate: boolean;
  showAir: boolean;
  showWarnings: boolean;
  showMinutely: boolean;
  apiKey: string;
  apiHost: string;
}
```

存储：`weather.settings`、`weather.cache`（按城市缓存）。

## 自动定位（ip.cn 网络归属地，D-16）

- 数据源：`https://ip.cn/` 首页 HTML 内联的 `_ticket` → `https://my.ip.cn/json/?ticket=…`，
  返回 `ip / country / province / city / district / isp`，**不含经纬度**（实测 2026-10-19）。
  首页无 CORS 头，整条链路只能在 Tauri Rust 后端执行；插件通过宿主 API `ipLocate()` 取结果。
- 优先级：`getLocation()`（Windows 定位，有坐标）→ `ipLocate()`（城市名）→
  和风 GeoAPI `geoLookup(城市名)` 换 `id` 与经纬度 → 全失败保留上次城市并提示手动搜索。
- 语义：定位成功后**自动应用**——城市不在列表里则加入并设为当前，已存在则切换为当前；
  卡片与详情立即刷新该城市天气。当前城市已经是定位城市时只更新定位结果，不重复写配置。
  定位结果缓存 30 分钟（`location` 键，含 `applied` 标记）：启动时只迁移「未应用过」的 fresh 结果
  （升级前旧版可能已存了但没应用），应用过的不再覆盖用户手动选择的城市；fresh 结果不重复请求定位。
- 无 API Key / mock 模式：自动定位跳过（GeoAPI 换坐标需要 Key）；mock 模式用 mock 城市演示。
- 隐私：仅在 `autoLocate` 打开时请求；只暴露公网 IP 与常规 UA，不发送本地数据。

## 卡片（纯展示，点击=详情）

| 尺寸 | 内容 |
|---|---|
| `1×1` | 图标 + 温度 48 |
| `2×1` | 图标 + 温度 48 + 现象 16 + 今日高低温 14 |
| `2×2` | 上半当前天气；下半逐时 6 列（时间 12 / 图标 20 / 温度 14） |
| `3×2` | 左当前（城市 12 / 图标 56 / 温度 68 / 现象 14 / 高低温 14）+ 右「逐时」6 行（行高 40：时间 12 / 图标 20 / 温度 16 右对齐）；**不展示 7 天** |
| `4×2` | 上：当前（左）+ 空气质量（右，AQI 环 72、值 24、类别 14）；下：「未来 7 天」等宽 7 列（星期 12 / 图标 20 / 高温 16 semibold / 低温 12，列 gap 8、内容居中、末列右边缘对齐） |

- 内边距：1×1=8；2×1/2×2=12；3×2/4×2=12 纵 × 16 横。
- 分组只用留白：当前天气 / 逐时 / 天气质量 / 7 天各组之间 16–24，组内 4–8；**不使用 `space-between` 拉伸高低温**。
- 预警：仅 3×2/4×2 在城市行放一个紧凑 Badge（12），完整内容在详情预警 Tab。
- 删除卡片上的城市菜单、刷新按钮、设置入口、长按/右键；点击卡片任意位置 = 打开详情。

## 详情（L1，`?view=detail`）

- **header 56**：城市按钮 16 semibold + chevron（打开城市菜单）+「1 分钟前更新 / 离线」12 fg3；右侧刷新 40、设置…40（图标+文字）。
- **摘要 96**：图标 56 + 温度 48（Display XL）+ 现象 16 fg1 + 高低温 14 fg2；最右 AQI Badge（值 16 + 类别 14）。
- **环境信息 44**：六项单行等宽网格（gap 16）：label 12 fg3 + 值 14 fg1 tabular——体感 / 湿度 / 风 / 气压 / 能见度 / 紫外线；<700px 宽时两行三列。
- **Tabs 40（常显）**：逐时 / 7 天 / 空气 / 生活指数 / 预警；有预警时默认进预警，否则逐时；预警 Tab 带 Badge 数量。
- **内容区**：
  - 逐时：行 44，时间 14 fg2 / 图标 24 / 温度 16 semibold / 现象 14 / 风 12 fg3 / 降水 12 fg3。
  - 7 天：行 44，星期 14 + 日期 12 fg3 / 图标 24 / 现象 14 / 高温 20 semibold + 低温 14 fg3 / 风 12。
  - 空气：AQI 环 88 + 类别 14 + 首要污染物 12；污染物行 44（名称 14 / 值 16 semibold 右对齐 / 单位 12 fg3）。
  - 生活指数：行 48–64，名称 14 / 类别 14 fg2 / 建议 14 fg2。
  - 预警：Fluent MessageBar/Accordion，标题 14 semibold / 正文 14 fg2 / 时间 12 fg3；不裁切。
- 内容区滚动；header / Tabs 固定；1024×768 内容可视行数减少。

## 详情（L2，管理城市，push）

- 从城市菜单「管理城市…」进入；header 56（← 返回 +「管理城市」16 semibold）。
- 搜索 Input 40（GeoAPI 城市搜索）；结果行 44：城市 14 + 行政区 12 fg3 +「添加」40。
- 已添加城市行 44：城市 14 + 当前 Badge +「设为当前」40 +「删除」40（删除行内确认）。
- 城市菜单：「当前位置 · X」一行在定位城市**不是**当前城市时出现（例如定位后用户手动切到了
  别的城市），点一下加入或切换；D-16 定位成功即自动应用，通常不会出现。
- 添加/删除/设为当前后 pop 回 L1，卡片数据随之刷新。

## 设置 schema

```json
{
  "key": "settings",
  "groups": [
    { "title": "显示", "fields": [
      { "key": "unit", "type": "enum", "label": "温度单位", "default": "c",
        "options": [ { "value": "c", "label": "摄氏 °C" }, { "value": "f", "label": "华氏 °F" } ] },
      { "key": "refreshMin", "type": "enum", "label": "刷新间隔", "default": 30,
        "options": [ { "value": 15, "label": "15 分钟" }, { "value": 30, "label": "30 分钟" }, { "value": 60, "label": "60 分钟" } ] },
      { "key": "showAir", "type": "boolean", "label": "显示空气质量", "default": true },
      { "key": "showWarnings", "type": "boolean", "label": "显示天气预警", "default": true },
      { "key": "showMinutely", "type": "boolean", "label": "显示分钟级降水", "default": false }
    ]},
    { "title": "行为", "fields": [
      { "key": "autoLocate", "type": "boolean", "label": "自动定位", "default": false }
    ]},
    { "title": "数据源", "fields": [
      { "key": "apiKey", "type": "text", "label": "和风天气 API Key", "secret": true, "default": "" },
      { "key": "apiHost", "type": "text", "label": "API Host", "default": "" }
    ]}
  ]
}
```

城市列表属于内容，放详情城市菜单，不进设置。

## Agent 工具（UI 路径 ↔ 工具）

| UI 路径 | 工具 |
|---|---|
| 卡片/详情·当前天气 | `weather.current` |
| 详情·逐时 | `weather.hourly` |
| 详情·7 天 | `weather.daily` |
| 详情·空气 | `weather.air` |
| 详情·预警 | `weather.warning` |
| 详情·搜索任意城市 | `weather.queryPlace` |
| 城市菜单/管理城市 | `weather.places` / `weather.addPlace` / `weather.removePlace` / `weather.setCurrentPlace` |
| 详情·刷新 | `weather.refresh` |
| 自动定位 | `weather.locate`（系统定位 → ip.cn 网络归属地 → GeoAPI；成功后加入并设为当前城市） |
| 宿主设置页·天气 | `weather.settings.get` / `weather.settings.set` |

## 边界与异常

- 无 API Key：卡片显示引导（去设置填 Key）；Agent 返回错误提示。
- 请求失败/429：用缓存并标注“更新于 X 分钟前”；缓存过旧标注“可能过期”。
- 有预警：详情默认打开预警 Tab；卡片 3×2/4×2 显示紧凑 Badge。
- 分钟级降水仅在有数据时显示。
- 定位：Windows Geolocator 优先 → ip.cn 网络归属地兜底（D-16）→ 失败保留上次城市并提示手动搜索；
  无 API Key 时自动定位跳过（GeoAPI 换坐标需要 Key）。
- 自动定位成功即应用：定位城市加入城市列表并设为当前（卡片/详情随之切换）；
  已是当前城市时只更新「当前位置」，不重复写配置。

## 不做什么

雷达图、天气地图、台风路径、历史天气、多日空气质量趋势图、账号体系。
