# 天气（weather）插件

桌面上的天气卡片，数据来自和风天气（QWeather）。规格见 [docs/components/weather.md](../../../docs/components/weather.md)，公共设计约定见 [docs/DESIGN.md](../../../docs/DESIGN.md)，实现规范见 [docs/PLUGIN-REACT.md](../../../docs/PLUGIN-REACT.md)。

## 目录

```
public/plugins/weather/
├── manifest.json          # 一个组件，声明 1×1 / 2×1 / 2×2 / 3×2 / 4×2 五档
├── index.html             # iframe 页面，只加载 app/app.js
├── weather.css            # 全局重置（视觉样式在 React 里走 Fluent token）
├── app/app.js             # 构建产物：React + Fluent UI React v9 的 ES module bundle
├── icons/{dark,light}/    # 和风官方图标（按 icon code 命名，本地文件不联网）
└── src/
    ├── main.jsx           # 入口：按 getOverlayView() 组合卡片 / 设置 / 详情视图
    ├── WeatherApp.jsx     # 卡片视图：刷新、轮询、缓存、Agent 工具
    ├── utils.js           # 尺寸/缓存新鲜度/URL 调试参数小工具
    ├── components/        # Card / CityMenu / forecast / atoms（纯展示组件）
    ├── views/
    │   ├── SettingsView.jsx   # ?view=settings 全窗口设置视图
    │   ├── DetailView.jsx     # ?view=detail 全窗口详情视图
    │   └── panels.jsx         # 逐时 / 7 天 / 空气 / 生活指数 / 预警面板
    ├── data/
    │   ├── api.js         # 和风 API：认证、v1/v7 两套接口、响应归一化
    │   ├── mock.js        # 无 Key 演示数据（形状与归一化结果一致）
    │   ├── service.js     # 请求编排：按城市缓存、失败回退缓存、按需补详情段落
    │   ├── store.js       # 设置/缓存读写（plugin.getConfig/setConfig）、城市增删
    │   ├── tools.js       # 9 个 Agent 工具
    │   ├── icons.js       # icon code → 图标文件（含夜间/遗留 code 兜底）
    │   └── format.js      # 温度/时间/风/AQI 等格式化
    └── ../../_shared/host.js  # 共享宿主脚手架（init 捕获 / 主题 / 尺寸 / 配置 / 浮层）
```

## 构建

插件是 `public/` 下的静态 iframe 页面，Vite 不会处理它的 import；Fluent UI React 由共享脚本用 Vite lib 模式预先打成自包含 bundle（`app/app.js`），运行时不需要构建步骤。改了 `src/` 之后重新打包：

```powershell
node scripts/build-plugin.mjs weather
```

`app/app.js` 是提交进 git 的产物；`npm run build` 只负责把 `public/` 原样拷进 `dist/`，不会再编译插件。

## 浮层视图（D-02b）

设置和详情不再在卡片 iframe 里弹 Dialog/Drawer（会被卡片边界裁切），而是请求宿主用整窗 Fluent Dialog
加载同一插件页面的 `?view=<name>`：

- 点卡片 → `requestOverlay('detail', '天气详情')` → 宿主加载 `?view=detail`，标题「天气 · 天气详情」；
- 长按 / 右键 / 编辑模式设置 → `requestSettings('天气设置')` → 宿主加载 `?view=settings`，标题「天气 · 天气设置」；
- `main.jsx` 用共享脚手架的 `getOverlayView()` 分支渲染；两个视图都是整页排版，不依赖浮层容器；
- 设置视图里的修改即时写入配置（`plugin.setConfig('settings')`），卡片视图通过 `useStoredConfig` 的 storage 事件同步并自动刷新；
- 详情视图里的「设置」按钮同样 `requestSettings`，宿主会再开一层设置浮层。

## 配置

- **API Key**：和风控制台创建。`eyJ` 开头的 JWT 走 `Authorization: Bearer`，其余按 API KEY 走 `X-QW-Api-Key`。
- **API Host（必填）**：控制台 → 设置里查看的专属域名，形如 `abcd1234.qweatherapi.com`。
  填自定义 Host 时走新版 `/weather/v1`、`/airquality/v1`、`/weatheralert/v1`、`/geo/v2` 接口；
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
| `?view=settings` | 直接渲染设置视图（等价于宿主浮层里的那页） |
| `?view=detail` | 直接渲染详情视图 |
| `?size=3x2` | 指定卡片尺寸（1x1 / 2x1 / 2x2 / 3x2 / 4x2），脱离宿主时决定布局 |
| `?theme=light` | 指定亮色主题（默认深色） |
| `?tab=warning` | 详情视图默认打开的 Tab（hourly / daily / air / indices / warning） |

宿主内运行时，尺寸/主题从 `plugin.onInit/onResize/onTheme` 拿，URL 的 `size/theme` 只用于独立开发。

## 信息密度（docs/DENSITY.md / D-04）

- 每张卡片只有一个 Primary：当前温度；现象、今日高低温是仅有的 Secondary。
- 正常模式无 chrome：没有刷新按钮、更新时间文字、齿轮；城市切换/刷新/设置都在宿主浮层里（点卡片或长按卡片打开）。
- 预警条用 Fluent `MessageBar`（intent warning），多条在详情里用 Fluent `Accordion` 折叠展开；`1×1` 不显示独立预警图标，预警数量并入卡片 aria-label。
- 设置视图的 Fluent 控件（Input / Button / Switch / Radio）统一 40px 高；面向用户的文案不出现域名、JWT、CORS 等实现细节。
- 卡片只保留 城市 + 温度 + 现象 + 今日高低温；2×2 的逐时、3×2/4×2 的 7 天、4×2 的 AQI 是该尺寸声明的内容，不是额外的 chrome。
- `3×2` 的 7 天每格只留 星期 / 图标 / 高温（低温省略）。
- 详情视图用 Fluent type ramp（base200/300/400/Hero）与 foreground1/2/3 分层，不靠分割线；预警默认折叠成一行。
- 离线时卡片只在右上角显示一个 6px 状态点（不占文字），详细更新时间/离线状态在详情视图顶部。

## 宿主协议

- 通过共享脚手架 `public/plugins/_shared/host.js` 使用 `/plugin-sdk.js`：`startHostCapture` / `useHostTheme` / `useHostSize` / `useStoredConfig` / `getOverlayView` / `requestOverlay` / `requestSettings` / `useSettingsRequest` / `useAgentTools`。
- 宿主能力：`getConfig` / `setConfig` / `notify` / `getLocation`。
- 注册 9 个 Agent 工具：`weather.current/hourly/daily/air/warning/queryPlace/places/addPlace/removePlace`。

## 边界

- 请求失败或 429：用缓存渲染并显示「离线 · N 分钟前更新」，缓存超过 2×刷新间隔时加「数据可能过期」。
- 未配置 Key：卡片显示引导；Agent 工具返回可读错误。
- 预警优先：卡片顶部预警条，详情默认打开「预警」页。
- 分钟级降水只有开启且接口有数据时才占位。
- 浏览器直连和风 API 依赖对方 CORS 与「网址限制」配置；如果以后被拦截，需要宿主侧加代理（当前按可以直连实现）。
