# 自包含插件模板（E3.0b）

这是复制到 `public/plugins/<new-id>/` 开始写新插件的 React + Fluent 模板。它**不属于工程运行时**：
不在 `public/plugins/` 下、不在 `public/plugins/index.json` 里，不会被
`node scripts/build-plugin.mjs --all` 发现，也不会进入 `dist` 或出现在桌面、设置、插件管理里。
删掉整个 `templates/plugin-template/` 对宿主和六个现有插件零影响。

模板已经包含**构建好的 `app/app.js`**（React + Fluent UI React 已打进去，只有 `/plugin-sdk.js`
是宿主外部依赖），所以复制到 `public/plugins/` 后不构建也能先看卡片；改源码后必须重新构建。

## 目录结构

```
templates/plugin-template/
  README.md          本文件：复制、改名、构建、删除、快照说明
  manifest.json      宿主清单：id/name/widgets/sizes/settings schema
  index.html         卡片 iframe 外壳；引用本地 ./base.css 与已构建 app/app.js
  base.css           vendored 的 _shared/base.css 快照（iframe 视口重置）
  src/
    main.jsx         startHostCapture + FluentProvider(useHostTheme) + getOverlayView 分支
    Card.jsx         L0 卡片：CardRoot / CardHeader / Metric / ListRow / TouchButton
    Detail.jsx       L1 详情 + L2 Subpage 编辑示例
    settings.js      默认值、normalize、尺寸 key、Agent 工具声明与摘要
    demo.js          演示用跨 iframe 计数数据（localStorage）
    shared/          vendored 的 _shared 快照（见下）
  app/
    app.js           已提交的构建产物；运行时只读
```

模板源码的相对 import 只到自己的 `./shared/*`，唯一的宿主外部模块是 `/plugin-sdk.js`
（React 与 Fluent 由构建打进 bundle）；不引用 `../../_shared/*`、`src/host/**`，因此把
整个目录复制到工程外也能独立构建。

## 复制为新插件

在仓库根目录（PowerShell）：

```powershell
$id = 'my-plugin'
Copy-Item -Recurse templates/plugin-template "public/plugins/$id"

# 在 public/plugins/index.json 的数组末尾加入 "my-plugin"（JSON 字符串数组；保持 UTF-8）

node scripts/build-plugin.mjs $id
node scripts/verify-plugin.mjs $id
```

`verify-plugin.mjs` 要求 `manifest.id` 等于目录名；改 id 后也要重新构建 `app/app.js`。

## 改哪些字段

复制后至少改这些：

1. `manifest.json`：`id` 改成目录名（也是 index.json 里的字符串）；`name`、`widgets[].title`、
   `widgets[].id`、`version` 按新插件改；`sizes`/`defaultSize` 保留或按需增删。
   需要设置项时改 `settings.groups[].fields`，**不要**在新插件里画设置表单。
2. `src/settings.js`：`DEFAULT_SETTINGS` 与 `manifest.settings` 的 `default` 同步；
   设置 key 仍可叫 `settings`，宿主会写到 `plugin.<id>.settings`。
3. `src/Card.jsx` / `src/Detail.jsx`：替换可见文案、`requestOverlay('detail', '…')` 的标题，
   并把快捷按钮的业务操作换成自己的实现。卡片主体点击必须继续只请求 `detail`。
4. Agent 工具：把 `SUMMARY_TOOL.name`（现在是 `template.summary`）改成
   `<新 id>.summary`，同步改 `useAgentTools` 的 handler key；有写操作时新增 `<新 id>.<verb>` 工具。
5. `src/demo.js`：把演示 storage key `plugin.template.demoCount` 里的 `template` 换成新 id，
   或换成真实数据层。
6. `index.html` 的 `<title>` 和本 README（或替换成你插件的文档）。
7. 重新构建 `app/app.js`；产物连同源码一起提交。

`manifest.settings` 现在有 3 个演示字段：boolean「显示快捷提示」、enum「计数单位」、
number「每次增加」。宿主设置页会按 schema 自动渲染，修改即时写入
`localStorage['plugin.template.settings']`（新插件为 `plugin.<id>.settings`）。

## 运行与验证

dev server 在仓库根目录启动后：

```powershell
node scripts/build-plugin.mjs $id
node scripts/verify-plugin.mjs $id
```

验证脚本会做静态检查、按 manifest 的每个尺寸独立打开卡片，并在宿主桌面点卡开详情。
模板的验收截图保存在 `shots/e3-template/`（截图目录被 `.gitignore` 忽略）。

## 模板功能

- 卡片：`CardRoot` + `CardHeader` + `Metric` + `ListRow` + `TouchButton`；
  1×1 按 DENSITY 只保留标题、主数值和标签；2×2 / 3×2 才出现列表行和快捷按钮。
- 点卡体 → `requestOverlay('detail', '模板详情')`；卡片快捷按钮
  `stopPropagation`，且 `CardRoot` 过滤 `button`，不会打开详情。
- L1：`DetailHeader`（标题 + 刷新动作）、含「设置…」的 `DetailToolbar`、
  两个常显平级 Tab（`CrossFade` 切换）、`DetailScroll` + `ListRow`，以及 L2 入口。
- L2：`Subpage`「编辑示例」+ `Input` + `Switch`；footer 用 render prop 提供取消/保存。
  保存只写当前详情会话的演示 state 后 `close()`；X / Esc / 遮罩关闭整个浮层由宿主负责。
- 设置：声明在 `manifest.settings`，宿主设置页自动渲染；L1 的「设置…」只发
  `requestHostSettings()`，宿主负责先收起详情浮层再导航（E3.0b 起宿主内建该行为，
  插件不要自己再发 `plugin:request-overlay-close`）。
- 主题 / 尺寸：`useHostTheme`、`useHostSize`；所有颜色、字号、间距、动效来自 Fluent token
  或 vendored `shared/`，没有 hex、毫秒、clamp、10/11px。
- 无障碍：`CardRoot` 的 `ariaLabel` 描述内容 + 操作；按钮都有可读文本；
  L2 返回箭头由 `Subpage` 提供 `aria-label`。

## UI 路径 ↔ Agent 工具

契约要求每个用户可执行操作都有对应工具。模板只注册 1 条**只读**工具作为最小示例：

| UI 路径 | 工具 | 返回 |
|---|---|---|
| 读卡片摘要 / 打开 L1 概述（内容同源于 `demo.js` + 设置） | `template.summary` | `{ count, unit, step, showHint, summary }` |

卡片快捷按钮「增加 N」目前是模板演示写入，还没有对应工具；复制成真实插件时必须补
`<新 id>.add` 之类的写操作工具，并让 UI 和工具调用同一个数据层。这是模板唯一刻意留下的
Agent 对等缺口，不要原样发布。

## vendor 快照

`base.css` 与 `src/shared/{host.js,theme.js,typography.js,motion.js,ui.jsx}` 是
**E3.0 共享底座（2026-10-19）的快照**，从 `public/plugins/_shared/` 整份复制，没有改原件，
也没有改逻辑。`src/shared` 内部仍使用同目录相对引用（如 `./host.js`、`./motion.js`），
`index.html` 用本地 `./base.css`。

快照文件与 SHA-256 前 16 位（用于发现未来漂移）：

| 文件 | SHA-256 前缀 |
|---|---|
| `base.css` | `BCDDA5012FD50A49` |
| `src/shared/host.js` | `C772B8632728DAAF` |
| `src/shared/theme.js` | `2303C7CE4F6C1CC6` |
| `src/shared/typography.js` | `E50F0380DB4D2E1B` |
| `src/shared/motion.js` | `DFB316EAAA3512A5` |
| `src/shared/ui.jsx` | `2B4886B9F518C8CC` |

宿主升级共享底座后，把上述文件重新从 `public/plugins/_shared/` 复制到本模板（注意
`base.css` 要复制到根目录），更新本表和 `app/app.js`；不要只改模板、把原件当成副本。
因为快照与宿主版本解耦，模板不会自动跟随上游修复，这是自包含打包的已知成本。

## 构建模板自身

模板本身不在 `public/plugins/`，`build-plugin.mjs` 不能直接构建它。维护模板时临时复制：

```powershell
Copy-Item -Recurse templates/plugin-template public/plugins/template
# 临时把 "template" 加入 public/plugins/index.json
node scripts/build-plugin.mjs template
Copy-Item public/plugins/template/app/app.js templates/plugin-template/app/app.js
# 删除 public/plugins/template，并恢复 index.json；不要提交临时挂载
```

`app/app.js` 是上述源码构建出的自包含 ES module（React + Fluent 已打进去），
约 670 KB；运行时不需要 Node，也不需要模板目录以外的源码。

## 删除模板

```powershell
Remove-Item -Recurse templates/plugin-template
```

宿主不引用该目录，`index.json` 也不包含它；删除后工程构建、`dist`、桌面、设置和插件管理
都不受影响。
