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
  `requestSettings` / `useAgentTools` / `useSettingsRequest` / `useHostCardGesture`。
- `public/plugins/_shared/typography.js` —— 数字主信息的 Display XL 与 tabular-nums。
- `public/plugins/_shared/motion.js` —— 共享动效（`FadeSlide` / `Collapse` / `CrossFade` /
  `SlidePage` / `useReducedMotion` / `useMotionTransition`）。
- `public/plugins/_shared/ui.jsx` —— 共享 UI 基元（`CardRoot` / `CardHeader` / `Metric` /
  `ListRow` / `EmptyState` / `ActionButton` / L1 骨架 / `Subpage` / `useNow`）。
- `public/plugins/_shared/base.css` —— 插件 iframe 外壳重置（E3 起统一引用）。
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
3. **主题**：根节点 `FluentProvider`，亮暗由宿主 `host:init/theme` 注入（宿主默认跟随系统亮暗，可固定深/浅）；独立打开时跟随 `prefers-color-scheme`。不在组件里判断亮暗或写死颜色。SDK 会记忆最近一次 init/theme，监听注册时自动补发。
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

## 卡片手势（`useHostCardGesture`）

宿主收不到 iframe 内的指针事件，卡片级 press / hover / 长按统一走共享 SDK 的
`useHostCardGesture`。插件只把返回的 `ref` 挂到**卡片根节点**，不自己写任何手势或计时器：

```jsx
import { useHostCardGesture } from '../../_shared/host.js';

export default function ClockApp() {
  const gesture = useHostCardGesture();

  return (
    <div ref={gesture.ref} role="button" tabIndex={0} onClick={openDetail}>
      {/* 卡片内容；内部按钮照常绑自己的 onClick */}
    </div>
  );
}
```

注意：

- 只在宿主卡片视图生效：`window.parent === window`（standalone/demo）和
  `?view=detail|settings|…` 浮层视图都不挂监听，没有副作用；不要自己 post
  `plugin:card-pointer`。
- 必须挂在卡片根 DOM 上。根节点自身可以是 `role="button"`；hook 只过滤根节点**内部**的
  交互控件（`button / input / textarea / select / a / [role=…] / [contenteditable]`），
  这些控件上的 press / hover / 长按不会上升为卡片手势。
- 不要自己实现长按、右键菜单或 hover：长按 500ms 由 hook 检测并发
  `plugin:request-edit-mode`，触发后的 click 也由 hook 在 capture 阶段吞掉。
  自写计时器会与宿主/SDK 状态重复。
- 卡片根节点还需要用于 `plugin.onFocus` 聚焦时，直接复用 `gesture.ref`，不要另建一个 ref。
- 主操作（点击打开详情/执行快捷操作）仍由插件实现；hook 只负责把指针状态转给宿主。

## 共享 UI / 动效 / 测试底座（E3.0）

E3 起六个插件不再各造卡片、详情骨架、动效和验收脚本；统一使用 `_shared` 下的
`ui.jsx` / `motion.js` / `base.css`，并用 `scripts/verify-plugin.mjs` 做硬门槛。
这层只提供结构、触控尺寸、无障碍行为和动效 token，不提供任何具体业务布局。

### 引用 base.css

插件 `index.html` 只保留一个外壳样式入口，不再复制各自的 `base.css`：

```html
<link rel="stylesheet" href="../_shared/base.css" />
```

它负责 `html/body/#root` 100% 高、`box-sizing`、透明背景、`overflow: hidden`、
`overscroll-behavior: none`、Fluent 表单控件 `min-height: 40px`、
`:focus-visible` 的 Fluent 焦点环和细滚动条。**插件不要再写一份外壳重置**。
E3.1 起逐插件把旧的本地 `base.css` 引用换成这一行；本轮不改六个旧插件。

### 组件清单（`_shared/ui.jsx`）

| 导出 | 关键 props | 用途 / 约束 |
|---|---|---|
| `CardRoot` | `onActivate`、`ariaLabel`、`className/style/children` | 卡片根容器；内部挂 `useHostCardGesture`，处理 `role="button"`、`tabIndex`、Enter/Space。内部 `button/input/[role=...]` 控件不会触发 `onActivate`。 |
| `CardHeader` | `title`、`trailing` | 卡片顶部 12/16 fg3 标题行；普通流式（占 16px 内容高度），不放设置/齿轮。 |
| `Metric` | `value`、`unit`、`label`、`caption`、`size` | 数字主信息；`size` 只允许 48/68/80/96/112。48/80/96/112 走项目 Display XL，68 走 Fluent Display（Hero1000）。标签/单位自动用 Fluent `Text`。 |
| `ListRow` | `leading`、`title`、`subtitle`、`trailing`、`onClick`、`selected`、`titleSize` | 44 高列表行；无 `onClick` 是纯展示行，点击冒泡到卡片主体；有 `onClick` 时自己是 `role="button"`，不会触发卡片主操作。 |
| `EmptyState` | `icon`、`title`、`description`、`action` | 空态：图标 + 标题 + 说明 + 一个主操作。 |
| `TouchButton` / `ActionButton` | Fluent Button props | 统一 ≥40px 触控目标的 Fluent Button；`ActionButton` 是 `TouchButton` 的语义别名。 |
| `DetailPage` | `children` | L1 根容器：flex column、100% 高、**透明背景**（宿主 `DialogSurface` 提供表面）。 |
| `DetailHeader` | `children`、`trailing` | L1 header 56；左侧内容 + 右侧页面动作。L1 不放返回箭头。 |
| `DetailToolbar` | `children` | 可选操作条 48；没有操作时不要占位。 |
| `DetailTabs` | `items=[{value,label,badge?}]`、`value`、`onChange`、`ariaLabel` | 40 高 Fluent `TabList`，常显；只用于平级内容。`badge` 可以是节点或计数。 |
| `DetailScroll` | `children` | `flex:1` 内部滚动，24 边距；header/toolbar/tabs 固定。 |
| `Subpage` | `title`、`trailing`、`footer`、`onClosed`、`backLabel` | L2 骨架：绝对覆盖 L1、header 56（← + 标题 + trailing）、内容滚动、可选 footer。mount = push；`onClosed` 在 pop 动画结束后调用，父组件在此时卸载。 |
| `useSubpageClose()` | — | 供 **Subpage 内部渲染的组件**调用，返回 `requestClose()`。footer 用 render prop 更直接。 |
| `useNow(intervalMs)` | — | 可见性感知时钟：页面隐藏时暂停，回到前台立即补一拍。返回 `Date.now()` 毫秒值。 |

`CardRoot` 的标准写法（卡片只负责主体点击 + 显式快捷控件）：

```jsx
import { tokens } from '@fluentui/react-components';
import { useHostSize, requestOverlay } from '../../_shared/host.js';
import { CardRoot, CardHeader, Metric, ListRow } from '../../_shared/ui.jsx';

export default function TodoCard() {
  const sizeKey = useHostSize(([cols, rows]) => `${cols}x${rows}`, '2x2');
  return (
    <CardRoot
      ariaLabel="待办：今日 3 项，点击打开详情"
      onActivate={() => requestOverlay('detail', '待办详情')}
      style={{ padding: tokens.spacingVerticalM, gap: tokens.spacingVerticalS }}
    >
      <CardHeader title="今日 · 3" trailing={<Text size={200}>2 项逾期</Text>} />
      <Metric value="3" unit="项" label="今日待办" size={48} />
      <ListRow leading={<Checkbox ... />} title="写周报" subtitle="今天 18:00" />
    </CardRoot>
  );
}
```

不要再自己写卡片根的 `onClick` / 长按计时器 / hover；`CardRoot` 已经复用
`useHostCardGesture` 的 `ref`，也不要用第二个根 ref。

### L1 标准写法

L1 是宿主全窗口浮层（`?view=detail`），内容 = 更多信息 + 操作，不是把卡片放大：

```jsx
import { useState } from 'react';
import {
  ActionButton, DetailHeader, DetailPage, DetailScroll, DetailTabs, DetailToolbar, ListRow,
} from '../../_shared/ui.jsx';
import { CrossFade } from '../../_shared/motion.js';

export default function WeatherDetail() {
  const [tab, setTab] = useState('hourly');
  return (
    <DetailPage>
      <DetailHeader trailing={<ActionButton>刷新</ActionButton>}>
        <Text size={400} weight="semibold">北京</Text>
      </DetailHeader>

      <DetailToolbar>
        <ActionButton>设置…</ActionButton>
      </DetailToolbar>

      <DetailTabs
        items={[
          { value: 'hourly', label: '逐时' },
          { value: 'daily', label: '7 天' },
          { value: 'warning', label: '预警', badge: 2 },
        ]}
        value={tab}
        onChange={setTab}
      />

      <DetailScroll>
        <CrossFade value={tab}>
          {tab === 'hourly' ? <HourlyList /> : tab === 'daily' ? <DailyList /> : <WarningList />}
        </CrossFade>
      </DetailScroll>
    </DetailPage>
  );
}
```

规则：L1 无返回箭头、无关闭按钮；Tabs 常显；设置走 `requestHostSettings()` /
宿主设置页，不在详情里画设置表单。

### L2 标准写法

L2 是同一浮层内的 push，不是第二个 Dialog。`Subpage` 自己管理进入/退出，
父组件只负责“何时渲染”和“`onClosed` 时卸载”：

```jsx
{editing ? (
  <Subpage
    title="编辑任务"
    onClosed={() => setEditing(false)}
    footer={(close) => (
      <>
        <ActionButton onClick={close}>取消</ActionButton>
        <ActionButton
          appearance="primary"
          onClick={() => {
            saveTask();
            close(); // 提交后按 pop 动画返回 L1
          }}
        >
          保存
        </ActionButton>
      </>
    )}
  >
    <TaskForm />
  </Subpage>
) : null}
```

- 进入 = 组件 mount，`SlidePage` 从右 48px、250ms 减速；
- ← 返回 / 取消 / 保存 = `requestClose()`，向右 200ms 加速 pop，结束后 `onClosed`；
- X / Esc / 遮罩属于宿主，关闭整个浮层，不要从 L2 里自己发关闭消息；
- L2 内不得再套 L3 / Dialog / Sheet；footer 的“保存”走 render prop 的 `close`，
  嵌套组件里可以用 `useSubpageClose()`。需要“左侧 danger 删除 + 右侧取消/保存”时，
  footer 传一个 `width: 100%` 的 space-between 行即可。
- `Subpage` 背景使用 `tokens.colorNeutralBackground1`，与 Fluent v9 `DialogSurface`
  的 `background-color` 完全一致（宿主当前就是该 token）；不要在插件里写 hex 或别的表面色。

### 动效（`_shared/motion.js`）

只从这里取动效，插件源码里不出现毫秒数/自定义贝塞尔：

| 导出 | 用途 |
|---|---|
| `useReducedMotion()` | 订阅 `(prefers-reduced-motion: reduce)`；非 WAAPI 的内联样式用它。 |
| `FadeSlide` | 通用淡入 + 8px 位移（`direction` 可配）；exit 100ms 淡出。列表项新增用它，删除配合 `unmountOnExit`。 |
| `Collapse` | 内联展开/折叠：高度 + 透明度；enter 200ms 减速 / exit 150ms 加速；reduced-motion 只做 100ms 透明度。 |
| `CrossFade` | L1 Tab 内容/平级视图切换；旧内容淡出，新内容淡入 + 4px 上移。 |
| `SlidePage` | L2 push/pop；`direction="forward"` 从右进，`direction="back"` 向右 pop。`Subpage` 已封装。 |
| `transitionStyle(kind)` | 返回 `{ transitionDuration, transitionTimingFunction }`；kind：`press` / `hoverEnter` / `hoverLeave` / `exit` / `normal` / `gentle` / `slow` / `longPress`。 |
| `useMotionTransition(kind)` | 上者的 hook 版本；reduced-motion 下统一 100ms、无位移。 |

所有 presence 组件都带 reducedMotion 变体：不位移/缩放，只保留 ≤100ms 淡入淡出。
不要在插件里覆盖 `createPresenceComponent` 的时长，也不要写 `ease-in-out`/`cubic-bezier(...)`。

### 验收脚本（`scripts/verify-plugin.mjs`）

```powershell
node scripts/build-plugin.mjs <id>
node scripts/verify-plugin.mjs <id>
node scripts/verify-plugin.mjs <id> --scheme light   # 亮色抽查
node scripts/verify-plugin.mjs <id> --no-screenshots
node scripts/verify-plugin.mjs <id> --skip-host      # 只跑静态 + 独立尺寸
```

脚本做三件事：

1. **静态检查**：`index.html` / `manifest.json` / `app/app.js` 存在；manifest 的
   `id/name/widgets/sizes/defaultSize/settings` 结构合法；插件源码（`src/**`、根目录
   CSS、`index.html`）没有非 Fluent 字阶、clamp、`lineHeight: 1`、<12px 字号、
   自定义 hex 颜色。
2. **独立尺寸**：按 manifest 的每个 widget × size 打开
   `/plugins/<id>/index.html?plugin=<id>&widget=<wid>&size=<WxH>&demo=1`，
   iframe 尺寸按 1440×960 网格换算；断言有文字、最小字号 ≥12、无 console error，
   截图到 `shots/e3/<id>/`。
3. **宿主冒烟**：打开 `/?page=desktop`，触控轻点卡片中心；若插件发
   `plugin:request-overlay` 则等宿主 Dialog、截图、X 关闭，再用 Esc 关一次；
   未请求浮层的卡片只检查渲染。

脚本内的「插件专属断言扩展点」用注释标出，E3.x subagent 在这里追加本插件行为
（例如天气 mock、待办勾选、番茄开始/暂停），不要改通用断言。退出码非 0 = 失败。

### 从模板新建插件

`templates/plugin-template/` 是**不在工程运行时**里的自包含 React + Fluent 模板：不在
`public/plugins/`、不被 `public/plugins/index.json` 引用、不被
`node scripts/build-plugin.mjs --all` 发现、不进 `dist`，删掉它对工程零影响。
模板自带已构建的 `app/app.js`，复制到 `public/plugins/<new-id>/` 后不构建也能先打开；
改源码后必须重新构建。

```powershell
$id = 'my-plugin'
Copy-Item -Recurse templates/plugin-template "public/plugins/$id"
# 在 public/plugins/index.json 数组末尾加入 "my-plugin"
node scripts/build-plugin.mjs $id
node scripts/verify-plugin.mjs $id
```

复制后至少改这些字段：`manifest.json` 的 `id`/`name`（`id` 必须等于目录名和 index.json
里的字符串）、`widgets[].id`/`title`、`sizes`/`defaultSize`；`src/settings.js` 的
`DEFAULT_SETTINGS` 与 manifest schema 默认值；`src/Card.jsx` / `src/Detail.jsx` 的可见文案、
`requestOverlay('detail', '…')` 标题与业务操作；`SUMMARY_TOOL.name` 从 `template.summary`
改成 `<new-id>.summary`；`src/demo.js` 的 `plugin.template.demoCount` storage key；
`index.html` 标题。复制后替换或删除模板 README，写自己插件的文档。

模板源码的相对 import 只指向自己目录内的 `./shared/*`，宿主外部模块只有 `/plugin-sdk.js`
（React 与 Fluent 打进 bundle）；**不能**改回 `../../_shared/*`，否则复制到工程外就坏。
`base.css` 与 `src/shared/` 是 E3.0 共享底座（2026-10-19）的快照，从
`public/plugins/_shared/` 整份复制、未改逻辑；宿主升级底座后
按 README 的 SHA-256 快照表重新复制即可。`app.js` 只把 `/plugin-sdk.js` 留在外部。

模板的演示功能：1×1 / 2×2 / 3×2 卡片、点卡开 L1、两个平级 Tab（CrossFade）、
push L2 编辑表单（Input + Switch、取消/保存/返回 pop）、manifest schema 设置页、
`template.summary` Agent 工具和宿主设置页入口。模板只演示只读 Agent 工具；卡片快捷按钮
是演示写入，复制后必须补对应写工具（`<new-id>.add` 等）并让 UI 与工具共用数据层。
E3.0 宿主从 L1 点「设置…」只导航、不自动关闭详情浮层；模板的 `openHostSettings()` 先发
`requestHostSettings()` 再发 `plugin:request-overlay-close`（不能反序），宿主修复后可收敛。

`verify-plugin.mjs` 的静态检查、独立尺寸与宿主冒烟可直接复用；模板自己的尺寸截图与
交互验证在 `shots/e3-template/`，这些截图和临时验证脚本不进 git（`shots/` 已忽略）。

### 常见反模式

- 自己写卡片根 `onClick` / 长按计时器 / hover / 右键菜单；应使用 `CardRoot`。
- 自己画设置表单或“保存才生效”的设置页；设置只声明在 manifest `settings`。
- 自己画关闭按钮、Dialog、Drawer 或第二个浮层；X/Esc/遮罩归宿主，L2 用 `Subpage`。
- 在 L2 里再 push L3，或用 Tabs 隐藏平级内容。
- 在插件源码里写 hex、毫秒数、cubic-bezier、clamp 字号、10/11px 字号或 `lineHeight: 1`。
- 用 `Metric` 的 Display XL 字号渲染标题/正文/标签；它只给数字主信息。
- 复制一份 iframe 外壳重置；应引用 `_shared/base.css`。

## 主信息与可访问性

- 卡片本身（iframe 根）作为可聚焦的 `role="button"` / `tabIndex={0}` 时，要提供
  `aria-label` 描述当前内容与操作（例如"当前时间 14:05，点击切换 12/24 小时制"）。
- 图标按钮必须有 `aria-label` + `Tooltip`（Fluent 的 `Tooltip`）。
- 内容随尺寸变化时，读屏文本同步更新。
