# 天气（weather）插件

桌面上的天气卡片，数据来自和风天气（QWeather）。规格见 [docs/components/weather.md](../../../docs/components/weather.md)，公共设计约定见 [docs/DESIGN.md](../../../docs/DESIGN.md)。

## 目录

```
public/plugins/weather/
├── manifest.json          # 一个组件，声明 1×1 / 2×1 / 2×2 / 3×2 / 4×2 五档
├── index.html             # iframe 页面，只加载 app/app.js
├── weather.css            # 全局重置（视觉样式在 React 里走 Fluent token）
├── app/app.js             # 构建产物：React + Fluent UI React v9 的 ES module bundle
├── build.mjs              # 打包脚本（开发时手动跑，产物进 git）
├── icons/{dark,light}/    # 和风官方图标（按 icon code 命名，本地文件不联网）
└── src/
    ├── main.jsx           # 入口：读设置/缓存 → 挂载 React
    ├── WeatherApp.jsx     # 状态、刷新、缓存、宿主消息、详情/设置浮层
    ├── theme.js           # 宿主主题载荷 → Fluent theme
    ├── utils.js           # 尺寸/亮度/缓存新鲜度小工具
    ├── components/        # Card / DetailDrawer / SettingsDialog / CityMenu / forecast / atoms
    └── data/
        ├── api.js         # 和风 API：认证、v1/v7 两套接口、响应归一化
        ├── mock.js        # 无 Key 演示数据（形状与归一化结果一致）
        ├── service.js     # 请求编排：按城市缓存、失败回退缓存、按需补详情段落
        ├── store.js       # 设置/缓存读写（plugin.getConfig/setConfig）、城市增删
        ├── tools.js       # 9 个 Agent 工具
        ├── icons.js       # icon code → 图标文件（含夜间/遗留 code 兜底）
        └── format.js      # 温度/时间/风/AQI 等格式化
```

## 构建

插件页面是 `public/` 下的静态 iframe 页面，Vite 不会处理它的 import，所以 Fluent UI React 通过
`build.mjs` 的 Vite lib 模式预先打成自包含 bundle（`app/app.js`），运行时不需要构建步骤。
只有改了 `src/` 之后才需要重新打包：

```powershell
& 'C:\Program Files\nodejs\node.exe' public/plugins/weather/build.mjs
```

`npm run build` 只负责把 `public/` 原样拷进 `dist/`，不会再编译插件。

## 配置

- **API Key**：和风控制台创建。`eyJ` 开头的 JWT 走 `Authorization: Bearer`，其余按 API KEY 走 `X-QW-Api-Key`。
- **API Host（必填）**：控制台 → 设置里查看的专属域名，形如 `abcd1234.qweatherapi.com`。
  填自定义 Host 时走新版 `/weather/v1`、`/airquality/v1`、`/weatheralert/v1`、`/geo/v2` 接口。
  旧的公共域名 `devapi.qweather.com` / `api.qweather.com` 已停用（实测返回 403 INVALID HOST），
  只保留在代码里兼容旧配置；不填 API Host 时插件会直接提示去控制台获取，而不是发无效请求。
- API Key / Host 存在 `weather.settings`（本地存储，不进 git）；按城市缓存存在 `weather.cache`。

## 演示数据（无 Key 也能看界面）

- URL 加 `?mock=1`，或设置里打开「演示数据」。
- 内置城市：北京 / 上海 / 杭州 / 广州 / 深圳 / 成都；北京的演示数据带两条预警，用来验证「预警优先」。
- 演示数据不联网、不消耗和风额度，Agent 工具在 mock 下同样可用。

## 独立开发 / 截图用 URL 参数

| 参数 | 作用 |
|---|---|
| `?mock=1` | 使用内置演示数据（不联网） |
| `?size=3x2` | 指定卡片尺寸（1x1 / 2x1 / 2x2 / 3x2 / 4x2），脱离宿主时决定布局 |
| `?theme=light` | 指定亮色主题（默认深色） |
| `?detail=hourly\|daily\|air\|indices\|warning` | 自动打开详情 Drawer 并切到对应 Tab（`detail=1` 走默认 Tab） |
| `?settings=1` | 自动打开设置 Dialog |

宿主内运行时，尺寸/主题从 `plugin.onInit/onResize/onTheme` 拿，URL 参数不再生效（mock 参数除外）。

## 宿主协议

- 通过 `/plugin-sdk.js` 的 `plugin` 对象通信：`onInit` / `onResize` / `onTheme` / `onFocus` / `onToolCall` / `ready`。
- 兼容旧骨架宿主的 `wtsl:init` 消息（只取主题），方便在宿主桥接层完成前调试。
- 宿主能力：`getConfig` / `setConfig` / `notify` / `getLocation`。
- 注册 9 个 Agent 工具：`weather.current/hourly/daily/air/warning/queryPlace/places/addPlace/removePlace`。

## 边界

- 请求失败或 429：用缓存渲染并显示「离线 · N 分钟前更新」，缓存超过 2×刷新间隔时加「数据可能过期」。
- 未配置 Key：卡片显示引导；Agent 工具返回可读错误。
- 预警优先：卡片顶部预警条，详情默认打开「预警」页。
- 分钟级降水只有开启且接口有数据时才占位。
- 浏览器直连和风 API 依赖对方 CORS 与「网址限制」配置；如果以后被拦截，需要宿主侧加代理（当前按可以直连实现）。
