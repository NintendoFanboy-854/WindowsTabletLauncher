# 插件实现规范：React + Fluent UI React（D-02b）

> 决策：`docs/DECISIONS.md` D-02b。所有插件一律 **React + Fluent UI React v9**，
> 最严格要求符合 Fluent 2；包体积不是约束。参考实现：`public/plugins/weather/`。

## 目录约定

```
public/plugins/<id>/
  manifest.json        宿主读的清单（多尺寸）
  index.html           <div id="root"></div> + <script type="module" src="./app/app.js">
  src/main.jsx         React 入口（按 getOverlayView() 组合：卡片视图 / 设置视图 / 详情视图）
  src/<App>.jsx        卡片视图
  src/settings.jsx     设置视图（宿主 ?view=settings 全窗口浮层加载）
  src/data/*.js        业务逻辑（store / api / 定时器），不依赖 React
  app/app.js           构建产物（提交进 git，运行时不需要 Node）
```

共享代码（不进 bundle 的宿主 SDK 除外）：

- `import { plugin } from '/plugin-sdk.js'` —— 构建时 external，由宿主静态提供。
- `public/plugins/_shared/theme.js` —— 主题载荷 → Fluent Theme。
- `public/plugins/_shared/host.js` —— `startHostCapture` / `useHostTheme` /
  `useHostSize` / `useStoredConfig` / `getOverlayView` / `requestOverlay` /
  `requestSettings` / `useAgentTools` / `useSettingsRequest`。
- 相对引用：插件 `src/*.jsx` 里 `import { ... } from '../../_shared/host.js'`。

## 构建

```powershell
node scripts/build-plugin.mjs clock          # 单插件
node scripts/build-plugin.mjs --all          # 全部带 src/main.jsx 的插件
```

`app/app.js` 是提交进 git 的产物：宿主运行时只读 `public/`，不需要构建。

## 入口模板

```jsx
// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { startHostCapture, useHostTheme, getOverlayView } from '../../_shared/host.js';
import ClockApp from './ClockApp.jsx';
import ClockSettings from './settings.jsx';

startHostCapture(); // 必须在 React 挂载前（host:init 可能更早到达）

function Root() {
  const { theme } = useHostTheme();
  const overlayView = getOverlayView();
  return (
    <FluentProvider theme={theme} style={{ width: '100%', height: '100%' }}>
      {overlayView === 'settings' ? <ClockSettings /> : <ClockApp />}
    </FluentProvider>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
```

## 必须遵守

1. **组件**：只用 Fluent UI React 组件（Button / Menu / Dialog / Drawer / TabList /
   Input / Switch / Radio / Slider / ProgressBar / Badge / MessageBar / Skeleton /
   Spinner / Tooltip / Toast / Field / Divider / Text / Card…），不自绘控件。
2. **样式**：`makeStyles` + `tokens.*`；不写 hex、不写 px 字面量字号/间距/圆角/阴影、
   不自定义动效时长（用 `motionTokens`）。插件根节点尺寸用 `100%` / `vh` / `vw`。
3. **主题**：根节点 `FluentProvider`，亮暗由宿主注入；不在组件里判断亮暗写死颜色。
4. **触控目标**：所有可点击元素 ≥40×40 CSS px（平板）。
5. **状态**：hover / pressed / disabled / focus-visible 交给 Fluent 组件，不覆写焦点态。
6. **设置 / 详情浮层**：不在 iframe 内做 Dialog / Drawer（会被卡片边界裁切）。做成独立视图：
   - 卡片里长按 / 设置入口 → `requestSettings('时钟设置')`；详情入口 → `requestOverlay('detail', '天气详情')`；
   - 宿主用 `?view=<name>` 重新加载同一页面的对应视图（全窗口 Fluent Dialog，自带主题）；
   - `main.jsx` 用 `getOverlayView()` 分支渲染：`'settings'` → 设置视图，`'detail'` → 详情视图，`null` → 卡片视图；
   - 浮层里用 `useStoredConfig` / `plugin.setConfig` 持久化，改完自动生效（卡片视图通过 storage 事件同步）。
7. **Agent 工具**：`useAgentTools([{ name, description, parameters }], { 'x.y': fn })`。
8. **尺寸**：`useHostSize(sizeKeyOf, '2x1')`；按档位决定显示层级（信息预算见
   `docs/DENSITY.md`），小档位优先保主信息。
9. **等待态**：按 `docs/FLUENT2.md §12`：<1s 不显示；1–3s Spinner；>3s 进度/文案。
10. **空态**：Fluent 排版 + 一个主操作，不用两套空态文案。

## 主信息与可访问性

- 卡片本身（iframe 根）作为可聚焦的 `role="button"` / `tabIndex={0}` 时，要提供
  `aria-label` 描述当前内容与操作（例如"当前时间 14:05，点击切换 12/24 小时制"）。
- 图标按钮必须有 `aria-label` + `Tooltip`（Fluent 的 `Tooltip`）。
- 内容随尺寸变化时，读屏文本同步更新。
