# 天气（weather）插件

桌面上的天气卡片，数据来自和风天气（QWeather）。规格见 [docs/components/weather.md](../../../docs/components/weather.md)，
公共设计约定见 [docs/DESIGN.md](../../../docs/DESIGN.md)，实现规范见 [docs/PLUGIN-REACT.md](../../../docs/PLUGIN-REACT.md)，
自动定位决策见 [docs/DECISIONS.md](../../../docs/DECISIONS.md) D-16。

## 目录

```
public/plugins/weather/
├── manifest.json          # 一个组件，五档尺寸 + settings schema（宿主设置页通用渲染）
├── index.html             # 只加载 ../_shared/base.css 与 app/app.js
├── app/app.js             # 构建产物：React + Fluent UI React v9 的 ES module bundle
├── icons/{dark,light}/    # 和风官方图标（按 icon code 命名，本地文件不联网）
└── src/
    ├── main.jsx           # 入口：?view=detail → L1 详情；否则卡片
    ├── WeatherApp.jsx     # 卡片视图：数据轮询、缓存、Agent 工具注册
    ├── utils.js           # 尺寸档位 / 演示开关 / 缓存新鲜度
    ├── components/
    │   ├── Card.jsx       # 五档卡片（CardRoot，纯展示）
    │   ├── CityMenu.jsx   # L1 头部城市菜单（切换 / 当前位置 / 管理城市…）
    │   ├── forecast.jsx   # 逐时列/行、7 天列、AQI 环、昼夜判断
    │   └── atoms.jsx      # 天气图标 / 现象 / 高低温 / 更新时间 / 预警 Badge
    ├── views/
    │   ├── DetailView.jsx # L1：header 56 + 摘要 96 + 环境 44 + Tabs 40 + 内容
    │   ├── panels.jsx     # 逐时 / 7 天 / 空气 / 生活指数 / 预警面板
    │   └── ManageCities.jsx # L2：搜索 / 添加 / 删除（行内确认）/ 设为当前
    └── data/
        ├── api.js         # 和风 API：认证、v1/v7 两套接口、响应归一化
        ├── mock.js        # 演示数据（形状与归一化结果一致；北京带两条预警）
        ├── service.js     # 请求编排：按城市缓存、失败回退缓存、按需补详情段落
        ├── locate.js      # D-16：系统定位 → ip.cn 网络归属地 → GeoAPI，8s 封顶
        ├── useWeather.js  # 卡片/详情共用的状态（配置/城市/缓存/定位/刷新）
        ├── store.js       # 配置与缓存归一化、旧版 places 迁移、城市增删
        ├── tools.js       # 14 个 Agent 工具（UI 路径一一对应）
        ├── icons.js       # icon code → 图标文件（含夜间/遗留 code 兜底）
        └── format.js      # 温度/时间/风/AQI 等格式化
```

## 构建

插件是 `public/` 下的静态 iframe 页面，Fluent UI React 由共享脚本用 Vite lib 模式打成自包含
bundle（`app/app.js`），运行时不需要构建步骤。改了 `src/` 之后重新打包：

```powershell
node scripts/build-plugin.mjs weather
node scripts/verify-plugin.mjs weather
```

## 卡片（L0）

纯展示，点卡 = `requestOverlay('detail', '天气详情')`；卡片上没有城市菜单、刷新、设置、长按、右键。
手势与主操作由共享 `CardRoot`（`useHostCardGesture`）接管。

| 尺寸 | 内容 | 内边距 |
|---|---|---|
| `1×1` | 图标 40 + 温度 48 | 8 |
| `2×1` | 图标 48 + 温度 48 + 现象 16 + 今日高低温 14 | 8 纵 / 12 横 |
| `2×2` | 上：城市 12 + 当前天气；下：逐时 6 列（时间 12 / 图标 20 / 温度 14） | 12 |
| `3×2` | 左：城市 12 / 图标 56 / 温度 68 / 现象 14 / 高低温 14；右：逐时 6 行（行高 40，时间 12 / 图标 20 / 温度 16 右对齐）；**不放 7 天** | 12 纵 / 16 横 |
| `4×2` | 上：当前（左）+ AQI 环 72（右）；下：未来 7 天等宽 7 列（星期 12 / 图标 20 / 高温 16 / 低温 12） | 12 纵 / 16 横 |

- 预警只在 `3×2` / `4×2` 的城市行显示一个紧凑 Badge（12），完整内容在详情预警 Tab；
  缓存离线时同一行显示 12 号「离线」，不额外加 chrome。
- 无 Key：卡片显示「配置 Key」引导（详细操作在详情里的「设置…」）。
- 城市为空：显示「还没有城市 / 正在定位…」，点卡进入详情管理城市。

## 详情（L1，`?view=detail`）

- **header 56**：城市按钮 16 semibold + chevron（打开城市菜单）+ 更新时间 12 fg3；
  右侧刷新 40、设置… 40（图标 + 文字，只发 `requestHostSettings()`）。
- **摘要 96**：图标 56 + 温度 48（Display XL）+ 现象 16 + 高低温 14；最右 AQI Badge（值 16 + 类别 14）。
- **环境信息 44**：六项单行等宽网格（gap 16）：体感 / 湿度 / 风 / 气压 / 能见度 / 紫外线；
  容器宽 <700px 时两行三列。
- **Tabs 40 常显**：逐时 / 7 天 / 空气 / 生活指数 / 预警；有预警时默认进预警；`showAir` /
  `showWarnings` 关闭时对应 Tab 不出现（平级内容仍始终由 Tabs 直接可见）。
- **内容**：逐时行 44；7 天行 44；空气 = AQI 环 88 + 类别 14 + 首要污染物 12 + 污染物行 44；
  生活指数行 48–64；预警 Fluent Accordion（标题 14 semibold / 正文 14 fg2 / 时间 12 fg3）。
- 内容区滚动，header / 摘要 / 环境信息 / Tabs 固定；Tab 切换用共享 `CrossFade`。

## 管理城市（L2，同一浮层 push）

- 从城市菜单「管理城市…」进入；`Subpage` header 56（← 返回 + 标题）。
- 搜索 Input 40（和风 GeoAPI；mock 模式走内置城市）；结果行 44：城市 14 + 行政区 12 fg3 +「添加」40。
- 已添加城市行 44：城市 14 + 当前 Badge +「设为当前」40 +「删除」40（行内二次确认）。
- 顶部「当前位置 · X」来自自动定位，可一键加入或切换；添加/删除/设为当前后 pop 回 L1，
  卡片通过同一份配置刷新。
- 未配置 Key 时搜索禁用，但已保存城市仍可切换 / 删除。

## 设置（manifest schema）

全部在 `manifest.json` 的 `settings` 里，由宿主设置页按 schema 渲染并即时保存；
插件不再提供 `?view=settings` 视图，也不读宿主路由。

| key | type | default | 说明 |
|---|---|---|---|
| `unit` | enum | `c` | 摄氏 / 华氏 |
| `refreshMin` | enum（数字） | `30` | 15 / 30 / 60 分钟 |
| `showAir` | boolean | `true` | 卡片 AQI 与详情空气 Tab |
| `showWarnings` | boolean | `true` | 卡片预警 Badge 与详情预警 Tab、预警优先 |
| `showMinutely` | boolean | `false` | 逐时 Tab 的分钟级降水 |
| `autoLocate` | boolean | `false` | 打开时才请求系统定位 / ip.cn |
| `apiKey` | text（secret） | `""` | 和风 API Key（JWT 或普通 Key） |
| `apiHost` | text | `""` | 和风控制台的专属 API Host |

城市列表属于内容，存 `places` 键，不进设置 schema（宿主设置页不会把它当成未声明字段）；
旧版把 `places` 写在 `settings` 里的配置会在首次加载时迁移到 `places` 并清洗 `settings`。

## 自动定位（D-16）

1. `plugin.getLocation()`（Windows 定位，有坐标）→ 和风 GeoAPI 反查最近城市；
2. 失败 → `plugin.ipLocate()`（ip.cn 网络归属地：省/市/区/运营商，无坐标）→
   和风 GeoAPI `geoLookup(城市名)` 换 id/经纬度；
3. 全失败返回 null：保留上次城市，提示手动搜索。

整条链路 **8 秒封顶**（系统定位 2.5s、ip.cn 4s、GeoAPI 2.5s 的剩余预算），不阻塞首屏；
浏览器 dev 没有 Tauri 后端时 `getLocation()` / `ipLocate()` 都返回 null，静默跳过。
无 API Key 时自动定位直接跳过；mock 模式用内置城市演示。
语义：定位成功后**自动应用**——定位城市不在列表里则加入并设为当前，已存在则切换为当前，
卡片和详情立即刷新该城市天气（当前城市已是定位城市时只更新定位结果，不重复写配置）。
定位结果缓存 30 分钟（`location` 键，含 `applied` 标记）：启动时只迁移「未应用过」的 fresh 结果
（升级前旧版可能存了但没应用），已应用过的不再覆盖手动选择的城市；fresh 结果不重复请求；
卡片和详情共享，避免重复请求 ip.cn。

## 数据与缓存

- `settings`：上面 8 个 schema 字段；`places`：城市列表（`isCurrent` 有且只有一个）；
  `cache`：按 LocationID 存整套归一化数据（current/hourly/daily/air/warnings/indices/minutely）；
  `location`：最近一次定位结果 `{ place, source, at }`。
- 首屏先读缓存，再按 `refreshMin` 轮询；页面隐藏暂停，回到前台补一拍。
- 请求失败 / 429：用缓存并标注「离线 · N 分钟前更新」；缓存超过 2×刷新间隔时加「数据可能过期」。
- 卡片与 L1/L2 是同一插件的不同 iframe，通过宿主 `host:config` 推送（`plugin.onConfig` /
  `useStoredConfig`）同步 `plugin.weather.*` 配置。**不能依赖 storage 事件**：Tauri 打包版宿主页
  （`tauri.localhost`）与插件 iframe（`wtsl.localhost`）不同 origin，storage 事件到不了插件（D-29）；
  dev 浏览器同源模式才会触发，仅作兜底。

## Agent 工具（UI 路径 ↔ 工具）

| UI 路径 | 工具 |
|---|---|
| 卡片 / 详情·当前天气 | `weather.current` |
| 详情·逐时 | `weather.hourly` |
| 详情·7 天 | `weather.daily` |
| 详情·空气 | `weather.air` |
| 详情·预警 | `weather.warning` |
| 详情·L2 搜索任意城市 | `weather.queryPlace` |
| 城市菜单 / 管理城市 | `weather.places` / `weather.addPlace` / `weather.removePlace` / `weather.setCurrentPlace` |
| 详情·刷新 | `weather.refresh` |
| 自动定位 | `weather.locate` |
| 宿主设置页·天气 | `weather.settings.get` / `weather.settings.set` |

`weather.settings.get/set` 不回传 API Key 明文，只返回 `hasApiKey`；`settings.set` 只接受
schema 里的字段并做类型/取值校验。工具从宿主配置读最新状态，与 UI 共用 `useWeather` 数据层；
卡片 iframe 常驻桌面，L1 浮层打开期间工具仍可用。

## 独立开发 / 截图用 URL 参数

| 参数 | 作用 |
|---|---|
| `?mock=1` 或 `?demo=1` | 使用内置演示数据（不联网；`verify-plugin.mjs` 用 `demo=1`） |
| `?view=detail` | 直接渲染 L1 详情 |
| `?size=3x2` | 指定卡片尺寸（1x1 / 2x1 / 2x2 / 3x2 / 4x2），脱离宿主时决定布局 |

宿主内运行时尺寸/主题从 `plugin.onInit/onResize/onTheme` 拿，URL 参数只用于独立开发与验收。
演示数据不写 `mock` 到设置；关闭页面后设置里不会留下演示开关。

## 宿主协议

- 只使用 `/plugin-sdk.js` 与 `public/plugins/_shared/**`（`host.js` / `ui.jsx` / `motion.js` /
  `base.css` / `typography.js`），不 import `src/host/**`。
- 宿主能力：`getConfig` / `setConfig` / `getLocation` / `ipLocate` / `notify` 等。
- 设置入口只发 `plugin:request-host-settings`；L2 的返回/取消/保存是页内导航，X / Esc / 遮罩由宿主关闭浮层。

## 边界

- 无 Key：卡片与详情显示配置引导；Agent 工具返回可读错误。
- ip.cn 首调冷启动：Rust 后端要先取首页 ticket 再取 JSON，真机首次可能接近 4s 预算；
  超时按“定位失败”处理，不影响手动搜索。
- 雷达图 / 天气地图 / 台风路径 / 历史天气 / 多日 AQI 趋势不在本插件范围内。
