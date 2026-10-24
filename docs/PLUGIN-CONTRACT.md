# 插件契约（Host ⇄ Plugin Contract）

> **目的**：插件与宿主**完全解耦**，实现 plug-and-play——把插件 zip 拖进窗口，宿主一行代码都不用改，
> 卡片、设置、详情、Agent 工具、复盘统计就全部自动生效。
>
> **两条铁律**：
> 1. **宿主不认识任何具体插件**：宿主代码里不能出现某个插件 id 的 if/else、它的设置字段名、
>    它的详情页特殊处理、它写死的展示名。
> 2. **插件不依赖宿主内部**：插件只允许使用 `public/plugin-sdk.js` 和 `public/plugins/_shared/**`；
>    不 import `src/host/**`，不假设宿主的路由/状态结构。
>
> 相关文档：`docs/PLUGIN-REACT.md`（插件工程与构建）、`docs/FLUENT2.md`（视觉规范）、
> `docs/DENSITY.md`（信息预算）、`docs/components/*.md`（逐插件设计）。冲突时以本契约为交互/能力边界，
> 视觉仍以 Fluent 2 规范为准。

## 1. 职责划分

| 能力 | 插件提供（声明/实现） | 宿主通用处理（不认插件 id） |
|---|---|---|
| 卡片 | `manifest.json`：widgets、尺寸档位、默认尺寸、cell、`background` | 按 manifest 摆卡、挂 iframe、长按编辑、拖拽改尺寸 |
| 卡片内交互 | 插件在 iframe 内实现：主体点击 → `requestOverlay('detail', title)`；快捷控件自己 `stopPropagation` | 只负责卡片手势层（长按进编辑、拖拽）与浮层容器 |
| 详情 | 同一插件页面的 `?view=detail` | 收到 `plugin:request-overlay` 后开宿主全窗口 Fluent Dialog，标题由插件给 |
| 设置 | `manifest.json` 的 `settings` schema（分组 + 字段 + 默认值） | 通用表单渲染器生成设置页，读写走 `getConfig/setConfig` |
| 配置同步 | 监听 `host:config`（增量 `{ key, value }`） | `setConfig` 写盘后向该插件所有 iframe 推送；不依赖 storage 事件 |
| 设置入口 | 任意视图发 `plugin:request-host-settings` | 导航到设置页对应插件分区（按消息来源 pluginId） |
| Agent 工具 | `plugin.ready(tools)` 声明 + `onToolCall` 处理 | 注册、路由、交给 Agent；不解释工具语义 |
| 通知/强提醒 | 调桥接 API `notify` / `showReminder` | 宿主统一 Toaster / 遮罩 |
| 定位 | 调桥接 API `getLocation`（系统坐标）/ `ipLocate`（ip.cn 网络归属地，D-16） | 宿主提供能力；失败返回 null，插件自己降级 |
| 后台常驻 | `"background": true` | 宿主挂隐藏 iframe，路由工具调用 |
| 复盘聚合 | 声明 `*.stats` 工具 | 按工具聚合，展示名从 manifest 取，不写死 |
| 主题/尺寸 | 监听 `host:init` / `host:theme` / `host:resize` | 注入同一套 Fluent token |

> **初始值时序**：`host:init` 在 iframe `onLoad` 后发出，可能晚于插件 React 首帧。宿主在每次
> 加载的 `init` 之后会立即补发一次幂等的 `host:resize` / `host:theme`，SDK 也会在插件注册监听时
> 重放最近一次消息；插件应通过 `useHostSize` / `useHostTheme`（或 `plugin.onInit` / `onResize` /
> `onTheme`）读取，不要在首帧假设 init 已到达，也不要自己缓存布局/主题。
>
> **配置更新时序（D-29）**：`host:init` 只带一次配置快照；之后宿主每次 `setConfig` 都会给该插件
> **所有 iframe**（卡片 / 详情浮层 / 后台）发 `host:config`（`{ key, value }` 增量）。插件用
> `useStoredConfig` 或 `plugin.onConfig` 消费即可，**不能依赖 `window 'storage'` 事件**：Tauri 打包版
> 宿主页（`http://tauri.localhost`）与插件 iframe（`http://wtsl.localhost`）不同 origin，storage 事件
> 不会派发到插件文档；dev 浏览器（HTTP 插件源）同源只是巧合。

## 2. manifest 声明

```json
{
  "id": "clock",
  "name": "时钟",
  "version": "0.2.0",
  "identityHue": "blue",
  "background": false,
  "widgets": [
    {
      "id": "clock",
      "title": "时钟",
      "sizes": [[1, 1], [2, 1], [3, 2]],
      "defaultSize": [2, 1],
      "cell": [0, 0]
    }
  ],
  "settings": {
    "key": "settings",
    "version": 1,
    "groups": [
      {
        "id": "display",
        "title": "时间显示",
        "hint": "只影响卡片的显示方式",
        "fields": [
          { "key": "hour12", "type": "boolean", "label": "12 小时制", "default": false },
          { "key": "showSeconds", "type": "boolean", "label": "显示秒", "default": true },
          {
            "key": "dateFormat",
            "type": "enum",
            "label": "日期格式",
            "default": "zh",
            "options": [
              { "value": "zh", "label": "10月18日 星期日" },
              { "value": "iso", "label": "2026-10-18" },
              { "value": "en", "label": "10/18 Sun" }
            ]
          }
        ]
      }
    ]
  }
}
```

### 2.1 settings schema 字段类型（v1）

| type | 宿主渲染 | 额外属性 |
|---|---|---|
| `boolean` | Switch 行（行高 48） | — |
| `number` | Input（数字，40 高） | `min`、`max`、`step`、`unit`（如“分钟”，显示在后缀） |
| `enum` | 选项 ≤4 用横向 RadioGroup，>4 用 Dropdown | `options: [{ value, label }]` |
| `text` | Input（失焦/回车写入） | `placeholder`、`secret`（密码态 + 显示/隐藏）、`maxLength` |
| `timeRange` | 两个 `type=time` Input（起/止） | 值形如 `{ "start": "22:00", "end": "08:00" }` |

规则：

- schema 只放**长期偏好**；列表/城市/条目这类内容管理放详情里，不进设置。
- 宿主即时生效（自动保存）；底部固定「保存」按钮是羡余：再提交一次并关闭浮层，幂等。
  × / Esc / 点外部与「保存」同义（都不会丢改动）。
- 每插件分区提供「恢复默认」（取 schema 的 `default`）。
- 未知字段类型：宿主跳过并显示“该设置项暂不支持”，不写坏配置。
- 校验（类型/范围/枚举）由宿主做，插件读配置时再做一次 normalize 兜底。
- 配置存储：`plugin.<pluginId>.<settings.key>`，由宿主 `setConfig` 写入；写入后宿主向该插件的
  所有 iframe 推 `host:config`，插件用 `useStoredConfig`（或自定义 hook 里的 `plugin.onConfig`）
  即时同步。**不要用 storage 事件**（跨 origin 失效，见 §1 配置更新时序）。

### 2.2 identityHue（Equal Except Hue）

manifest 顶层必须声明一个身份 hue：

```json
{ "identityHue": "blue" }
```

- 白名单只有 `blue / pink / orange / green / purple / teal`，不接受任意 hex、rgb 或自定义调色板。
- 宿主把 hue 映射到 Fluent shared palette 的同一档 `Foreground2 / BorderActive / Background2`，
  其中 `Foreground2` 通过 `ThemePayload.wtslIdentity` 下发，插件把它写成 `--wtsl-identity`。
  **插件代码不得引用具体 palette token 名或写死颜色**。
- 非法/缺失的 `identityHue` 会被 loader 拒绝加载，并在插件管理页与 console 给出可定位的报错；
  不做默认 hue 回退（静默回退会破坏“六个插件一套色相”的保证）。
- 身份色只允许出现在 20px identity 图标；不得用于卡背景、大数字、按钮填充、空态色块。
  状态（running / paused / alert / done）走 Fluent semantic token，不占用身份 hue。
- **色相落点最终形态（2026-10-24）**：全库只有两处——① 20px identity 图标（`IDENTITY_ICON_SIZE`，
  `_shared/ui.jsx`）；② 可选 1 处状态强调线，厚 `tokens.strokeWidthThick`（2px）。其余任何位置
  （卡底、大数字、按钮填充、空态色块、图表、进度带）出现身份色即违规——进度带用 `colorBrandBackground`，
  状态用 `colorStatus*`，都不是身份色。
- **manifest 只存 hue 名**：`identityHue` 的值必须是白名单字符串本身，**不得**写 hex / rgb / 任意调色板值；
  把 hue 解析成颜色的唯一位置是宿主 `withIdentityTheme`（`src/host/plugins/identity.ts`），插件侧只读
  `--wtsl-identity`（= shared palette 同档 `Foreground2`）。插件代码里出现颜色字面量即违规。
- **白名单是封闭集合，没有默认值**：`blue / pink / orange / green / purple / teal` 之外的
  字符串、缺失、数字、对象一律在 `normalizeManifest` 阶段抛错；`PluginManager` 把该插件
  记入 `problems` 并跳过，插件管理页可见。宿主运行时不再回退成中性色：主题里身份色
  `Foreground2 / BorderActive / Background2` 任意一档解析不到，`withIdentityTheme` 直接抛错
  （`src/host/plugins/identity.ts`），不静默降级。
- 三档身份色由宿主按当前 manifest hue 只交付本插件的一份：`wtslIdentity`（Foreground2，
  `--wtsl-identity` 的唯一来源）、`wtslIdentityBorder`、`wtslIdentitySurface`（契约保留，
  默认不用于装饰）。插件不得引用其它 palette token 名，也不得用 border/surface 铺卡背景。

## 3. 卡片交互契约（触控优先）

项目是平板桌面，**一切以触控为基线**；鼠标/键盘只保证“能完成”，不为其设计专属手势。

### 3.1 交互矩阵

| 输入 | 卡片 | 桌面空白 | 编辑模式 |
|---|---|---|---|
| 触控轻点 | 插件主操作（打开详情 / 快捷控件） | 点击退出编辑 / 聚焦 | 拖拽换格、点按钮改尺寸/删除 |
| 触控长按 500ms | 进入编辑模式并选中该卡 | 进入编辑模式 | — |
| 鼠标左键 | 同轻点 | 同轻点 | 拖拽、点按钮 |
| 鼠标右键 | 不提供自定义菜单（原生菜单全局禁用） | 同左 | 同左 |
| 键盘 | Tab 聚焦、Enter/Space 主操作 | Esc 退出编辑 | 方向键移动、Delete 删除、Enter 设置、Esc 退出 |
| 鼠标/键盘进入编辑 | 宿主设置页 →「外观」→「编辑桌面布局」 | 同左 | — |

### 3.2 卡片手势协议（跨 iframe 的最小转发）

宿主收不到 iframe 内的事件，所以由共享 SDK 在卡片根节点挂一个 hook（`useHostCardGesture`）。
协议只有插件 → 宿主两条消息，**只在卡片实例的 iframe 里发**；`?view=...` 浮层视图与后台常驻
iframe 不发，宿主也没有新增 host → plugin 消息：

| 消息 | 字段 | 何时发 |
|---|---|---|
| `plugin:card-pointer` | `phase: 'down' \| 'up' \| 'cancel' \| 'hover-enter' \| 'hover-leave'`、`pointerType: 'touch' \| 'pen' \| 'mouse'` | 指针按下/抬起/取消；hover 只对 `mouse` / `pen` 发进入、离开 |
| `plugin:request-edit-mode` | —（无字段） | SDK 检测到 500ms 长按，触发时发一次 |

规则：

1. **长按检测在 SDK**：`pointerdown` 后 500ms 内移动不超过 8px 触发；移动超 8px、
   500ms 内 `pointerup`、`pointercancel` 都取消。宿主不跑卡片长按计时器，只根据消息做视觉与进编辑。
2. 只响应主键（`button === 0`）。**press / 长按对 `touch / pen / mouse` 都生效**（MOTION §0
   “行为统一”）；**hover 只有鼠标/笔有**，触控没有 hover。
3. SDK 过滤卡片根节点内部的显式控件及其内部：
   `button, input, textarea, select, a, [role="button"], [role="tab"], [role="switch"],
   [role="checkbox"], [role="radio"], [role="slider"], [contenteditable]`。
   这些目标不触发卡片级 press / hover / 长按；根节点自身可以是 `role="button"`，不算控件。
4. **长按后的 click 由 SDK 吞掉**：触发时长按计时器的同一 tick 里在 capture 阶段装一次性
   click 监听并 `preventDefault/stopPropagation`；click 未出现时在抬起/取消 1s 后清理，
   收不到抬起事件则最多 10s 兜底，避免永久劫持点击。
5. 插件**不得自行处理**长按、右键、hover：不监听长按（开设置/编辑条目等一律删掉），
   不实现右键菜单；SDK 在 capture 阶段禁用插件页原生 contextmenu。
6. 宿主视觉状态：`data-hover`、`data-press="down|holding"`；hover `scale(1.015)` + `shadow8` +
   1px `colorNeutralStroke1`，按下 50ms 到 0.985、长按 500ms 线性到 0.97、松手/取消 150ms 回弹；
   `prefers-reduced-motion: reduce` 下不做 scale，只保留颜色/描边。插件不再自加卡片级缩放/阴影。
7. 插件只负责：点击卡片主体 → 主操作（通常是 `requestOverlay('detail')`）；内部显式控件 → 就地操作。

### 3.3 宿主编辑模式入口

- 触控：卡片/桌面空白长按 500ms（主路径）。
- 鼠标/键盘兜底：宿主设置页「外观」分组的「编辑桌面布局」按钮，点击后回到桌面并进入编辑模式；
  同一分组提供「重置布局」（恢复默认卡片摆放，低频兜底）。
- 编辑模式内：点「完成」、Esc、点空白退出；触控与鼠标一致。

### 3.4 卡片内容规则

1. **卡片主体点击 = 打开详情**：插件在 iframe 内实现，点击根区域时
   `requestOverlay('detail', '标题')`；键盘 Enter/Space 同样打开详情。
2. **卡片内快捷控件 = 就地操作**：按钮/勾选/开关必须 `stopPropagation`，不得触发详情。
3. **快捷操作只允许高频、单步、可逆、低风险、不需要上下文**的选择题
   （如番茄开始/暂停/重置、久坐“起来了”、待办勾选完成）。
   多步表单、不可逆、需要看全量数据的操作一律进详情。
4. 卡片内容遵守 DENSITY 信息预算；详情级操作不出现在卡片上（含 `+`、齿轮、⋯菜单）。
5. 按压/长按期间的视觉反馈由宿主统一提供，插件不自行加卡片级缩放/阴影动画。

### 3.5 宿主独占的视觉属性（插件不得设置）

| 属性 | 宿主唯一来源 | 插件不得做什么 |
|---|---|---|
| 卡壳 | `src/host/desktop/desktop.styles.ts` + `desktop.css`：12 圆角（`borderRadius2XLarge`）、1px 描边（`strokeWidthThin`）、`shadow4→8`、72% `colorNeutralBackground1` + `--wtsl-material-blur`（24）、6px 内衬（`spacingHorizontalSNudge`） | 不得自画卡框、边框、圆角、投影、材质、内衬 |
| 字号 / 行高 / 字重 | Fluent `Text size` / `fontSizeBase*` / `fontSizeHero900`；唯一 hero 是 `_shared/ui.jsx` 的 `HeroText` | 不得写裸 px / `lineHeight:1` / `<12px` 文本；不得另造 hero |
| 按钮层级 | `TouchButton` / `ActionButton` 的 secondary 默认；只有状态触发才 `primary` | 不得把多个按钮同时做成 accent 实心；不得自画按钮 |
| 内边距 / 组间距 | `CardRoot` 强制 16 / 8；宿主 6px 内衬；合计内容轴 22 | 不得用 `className/style` 覆盖 CardRoot 的 padding/gap，不得在插件根节点再叠 padding |
| 栅格 / 卡片尺寸 | `src/host/layout/**`：8×5、164 cell、12 gutter、居中留白 22 / 27（`layoutFrame`；底部 27 = 960 − 933，933 是说明条 pill 与 chat 入口共用的下缘）；右下角 1 格为 Agent 入口的保留格 | 不得改列数/步长/页边距；尺寸只能从 manifest 允许档位里选 |
| 浮层几何 / 关闭 | `PluginOverlay`：880×680、12 圆角、`shadow64`、24+16 内容内衬、X/Esc/遮罩同义 | 不得自造浮层、关闭按钮或遮罩；L2 的←/取消只 pop 不关闭 |
| 动效 | 宿主 `motionTokens` 与 `overlayMotion` | 不得写自定义时长/曲线；不得用循环呼吸表达状态 |

> 唯一合法变量仍是 manifest 的 `identityHue` + 图标形状 + 内容 + 状态文案。
> 违反上述任一项，宿主不保证像素稳定；评审时按硬门槛处理。

### 3.5.1 插件不得设置的四类东西（2026-10-24 追加）

上一节是「属性 → 唯一来源」的对照；这一节是**可直接判定的禁止清单**。四类属性全部由 `CardRoot` 与共享原语
在**代码里强制**，不靠插件自觉；绕过写法（例：包一层 `<div style={{ padding: 16 }}>` 自造卡壳、给共享原语传
`className` 改字号）与直接写属性同罪。

| # | 不得设置 | 唯一来源 | 判定方式（静态扫描即可） |
|---|---|---|---|
| 1 | **卡壳**：圆角 / 描边 / 投影 / 材质 / 内衬 | 12（`borderRadius2XLarge`）、1（`strokeWidthThin`）、`shadow4→8`、72% `colorNeutralBackground1` + `--wtsl-material-blur` 24、6（`spacingHorizontalSNudge`）——全部来自宿主 `desktop.styles.ts` / `desktop.css` | 插件源码或样式里出现 `borderRadius` / `boxShadow` / `backdrop-filter` / 卡根 `border` 即违规 |
| 2 | **字号层级**：hero / 行标题 / 标签 / 元信息的字号与行高 | hero 只能由 `HeroText`（`Metric` 内部用同一实现）产出；其余用 Fluent `Text size`（200–600）；行标题走 `ListRow`（16/22）；计数走 `TrailingCount`（12/16） | 出现 `fontSize` / `lineHeight` 字面量、`<12px` 文本、`lineHeight: 1`、`clamp()` 字号即违规；hero 不经 `HeroText` 也违规 |
| 3 | **按钮层级**：强调等级与数量 | `TouchButton` / `ActionButton` 默认 secondary；只有「状态驱动的主操作」（开始/暂停、我站起来了）才 `primary`；同一卡片同一屏 ≤1 个 accent 实心 | 自绘按钮、非状态驱动处用 `appearance="primary"`、同一视区两个实心按钮即违规 |
| 4 | **内外边距**：卡片 padding / 组间距 / 插件根节点再叠内边距 | `CardRoot` 强制 padding 16（`spacingHorizontalL` / `spacingVerticalL`）+ gap 8（`spacingVerticalS`）；宿主 6 内衬 → 内容轴 22；L1/L2 内衬由宿主 `DialogSurface` 24 + `DialogContent` 16 给 | 给 `CardRoot` 传 `style`/`className` 改 padding/gap、或插件根节点再写 padding 即违规（`CardRoot` 会覆盖，但代码仍按违规记） |

> 一条换算兜底：文档/评审引用这四类数值时只写 token 名（`spacingVerticalL` 等），不写 `16` / `8` / `12`；
> 数字与 token 的对照在 [TOKEN-MAP.md](TOKEN-MAP.md)，新增数值先查表再加。

## 4. 详情视图契约（页栈层级，L0 → L1 → L2）

### 4.1 层级模型

| 层级 | 是什么 | 进入 | 退出 |
|---|---|---|---|
| L0 | 桌面卡片 | — | — |
| L1 | 插件**详情页**（宿主全窗口浮层，`?view=detail`） | 点卡片主体（container transform 从卡片展开） | X / Esc / 点遮罩 → 回卡片 |
| L2 | **子页**（同一浮层内 push，不是第二个 Dialog）：任务编辑、清单管理、添加城市/世界时钟等 | L1 内点行 /「管理…」/「添加…」 | 返回箭头 / 取消 → pop 回 L1；保存 → 提交并 pop；X / Esc / 遮罩 → 关闭整个浮层回卡片 |

规则：

- **最多两层**（L1 + 一个 L2）；L2 内部不得再套 L3，不得出现嵌套 Dialog/Sheet。
- L1 不放返回箭头（它已是第一级），只放页面动作（设置…/添加/刷新等）。
- L2 固定结构：header 56（← 返回 + 标题 + 右侧动作）→ 内容 →（表单时）底部操作条。
- **Tabs 只用于平级内容**（天气信息分类、待办视图），必须常显；禁止用“视图菜单/切换形态”隐藏平级内容。
- 六个插件共用同一套详情骨架（header 56 / 可选工具栏 48 / 可选 Tabs 40 / 内容滚动 / 可选 footer），
  通过 `_shared` 的布局组件实现，不各画一套。
- 「设置…」是跨页导航：关闭浮层、跳到宿主设置页对应分区；暂不提供返回详情（记入后续优化）。

### 4.2 关闭 / 返回 / 保存语义（全插件一致）

| 动作 | 含义 |
|---|---|
| L1 X / Esc / 点遮罩 | 关闭浮层回卡片 |
| L2 ← 返回 | 放弃未保存改动并 pop 回 L1 |
| L2 取消 | 放弃未保存改动并 pop 回 L1（与 ← 同义，正面羡余） |
| L2 保存 | 提交并 pop 回 L1；失败留在原地显示错误 |
| L2 X / Esc / 点遮罩 | 放弃一切未保存改动，关闭整个浮层回卡片 |

- 从卡片直接进入的编辑表单（极少数，如插件只有单条数据）可视为 L1 = L2 合一：保存即关闭回卡片。
- 插件不得自造“关闭浮层”按钮；L2 的返回箭头属于页内导航，不是关闭。
- 详情页的头部不放“页面标题栏/关闭按钮”（宿主 Dialog 提供）；L2 标题由插件自己画。

### 4.3 内容与密度

- L1 内容 = **更多信息 + 具体操作**，不是把卡片放大；近距阅读（0.5–0.8m）用紧凑字号与更高密度。
- 详情内不做“多形态切换”：表单、管理、添加都是 L2 子页，有明确返回路径；平级视图用 Tabs 常显。
- 内衬由宿主给：`DialogSurface` 24 + `DialogContent` 16 = 40；插件 L1/L2 骨架横向 padding 已归零，
  插件不得再给详情根节点加左右内边距（否则内容轴会跳）。
- 密度上限：L1 首屏 ≤3 个信息区块、≤8 个列表行、每行 ≤2 个元信息；L2 ≤3 个表单字段组。
  放不下时用 `DetailScroll` 滚动，不静默裁切。

### 4.4 共享原语（下一批插件直接调用，接口稳定）

全部来自 `public/plugins/_shared/ui.jsx`，只引用 Fluent token；插件不得复制实现或改其尺寸。

| 原语 | 签名 / 关键 props | 用途与约束 |
|---|---|---|
| `HeroText` | `<HeroText>{value}</HeroText>` | 唯一主数字；固定 `fontSizeHero900` / `lineHeightHero900`，不接收 size；**任何尺寸档都不放大** |
| `Metric` | `value` / `unit?` / `label?` / `caption?` / `reserveCaption=true` | HeroText + 单位 + label/caption；给了 label 时 meta 固定两行（38），总高恒 92，`reserveCaption={false}` 回旧 74 |
| `DataRow` | `<DataRow label value unit? />`（2026-10-24 新增） | **只读数据行**：label 左（12 fg3）/ 值右（20 fg1 + tabular-nums，可带 12 单位）；行高 28（`lineHeightBase500`）；同一容器内多行共用一条值轴，节奏由容器 rowGap 控制 |
| `ListStack` | `<ListStack inset?>{rows}</ListStack>` | 行距固定 4；`inset` 只在无 `CardRoot` 的 L1/L2 补首末 16 留白，卡片内保持 false |
| `ListRow` | `leading` / `title` / `subtitle` / `trailing` / `onClick` / `selected` / `titleSize` | 固定行高 44（`LIST_ROW_HEIGHT`）；行内不写 padding；可点行自己处理 Enter/Space |
| `EmptyState` | `icon` / `title` / `action` / `align='center'\|'start'` / **`compact=false`** / `...rest`（**无 `description`**） | 中性单色图标（24；**3×3 档自动升到 40 档位**，共享层按宿主尺寸判定，写入 `data-emphasized`，DENSITY §1.2）+ 一句标题（≤6 汉字）+ 一个次操作；**不接收说明文字**（§4.4.3）；禁止彩色块；卡片空态用 `align="start"`。组距 24（`spacingVerticalXXL`），`compact`（1×1 / 2×1 短卡）为图标槽 24 + 组距 4；插件不得覆盖 gap。`...rest` 透传 `data-*` / `aria-*` |
| `MiniBars` | `values` / `labels?` / `max?` / `todayIndex?` / `size='default'\|'tall'` / `ariaLabel?`（2026-10-24 新增） | 迷你条带（7 天趋势）：N 列等宽、列距 4、轨道 24（`tall` 32）、条宽上限 32、`borderRadiusSmall`；颜色只两档（今天 `colorNeutralForeground1`、其余 `colorNeutralForeground3`），轨道 `colorNeutralBackground3`；自带 `role="img"` + `aria-label`；柱高是**数据**归一化值，不是设计值 |
| `HeroProgress` | `value(0–1)` / `active=true` / `label?`（2026-10-24 新增） | 卡片内进度带：厚 `HERO_PROGRESS_THICKNESS_PX` 4（= `strokeWidthThickest`）、填充 `colorBrandBackground`、轨道 `colorNeutralBackground3`；`active=false` 时保留 4px 占位并 `visibility:hidden`（不重排、不出画、去掉 role）；宽度过渡 100ms `durationFaster` / `curveEasyEase`，reduced-motion 不加过渡 |
| `StatusDot` | `tone='success'\|'warning'\|'danger'\|'info'\|'neutral'` / `label?` | 8×8 圆点；状态色只用 `colorStatus*Foreground1`，success 不常亮 |
| `StatusLine` | `tone` + children | 圆点 + 12px caption，用于就地状态行；不用于分类/装饰 |
| `TrailingCount` | `<TrailingCount total={n} shown={m} />` | 固定「共 X · 显示 Y」口径，12px fg3、tabular-nums；不占独立行 |
| `CardIdentity` | `icon?` / `label?` / `trailing?` / `compact=false` / **`placeholder=false`** / **`disclosure=false`** / `...rest` | 24 高 identity 行（`CARD_IDENTITY_HEIGHT_PX`）；`trailing` 限高 24；图标 20（`IDENTITY_ICON_SIZE`）且是身份色唯一落点。**不传 `icon`** 时渲染 20×20 空槽（label 不左移，`data-card-identity-empty`）；**`placeholder`** 只保留 24 高空行（本档不放 identity，如 weather 1×1）；**`disclosure`** 在行尾追加 `ChevronRight16Regular`（整卡可点开详情的唯一视觉信号，§4.4.3） |
| `CardDisclosure` | `<CardDisclosure />`（2026-10-24 新增） | 行尾 16px 中性 chevron，`aria-hidden="true"` + `data-card-disclosure="true"`；不抢命中区、不进 Tab 序列（点它等于点卡片）。自定义行（如早期自绘 identity 行）用它，不要在插件里手写 SVG/图标 |
| `CardRoot` | `onActivate` / `ariaLabel` / children | 系统内容栅格 16 / 8 强制生效；插件传 style 也不能覆盖 padding/gap |

常量（`ui.jsx` 导出，插件只许引用、不得复写数值）：
`TOUCH_TARGET=44`、`LIST_ROW_HEIGHT=44`、`LIST_ROW_GAP=4`、`LIST_ROW_PITCH=48`、
`CARD_PADDING_PX=16`、`CARD_GAP_PX=8`、`HERO_LINE_HEIGHT_PX=52`、`CARD_IDENTITY_HEIGHT_PX=24`、
`ICON_SIZE={ XS:16, S:20, M:24, L:32, XL:48 }`（冻结）、`IDENTITY_ICON_SIZE=20`（= `ICON_SIZE.S`）、
`EMPTY_STATE_ICON_SIZE=24`（= `ICON_SIZE.M`）、`EMPTY_STATE_ICON_SIZE_LARGE=40`（空态主图标专用档）、`HERO_PROGRESS_THICKNESS_PX=4`（= `strokeWidthThickest`）。

新增共享原语必须同时更新本表与 `_shared/ui.jsx` 顶部用法注释；不得只在一个插件里本地实现。

### 4.4.1 插件只能通过共享原语渲染（2026-10-24 追加）

卡片、L1、L2 里的**结构**只允许用下面这组原语拼；插件负责的是「放哪些字段、文案、数据」，
不是「长什么样」。白名单是封闭集合：

`EmptyState` / `CardIdentity` / `CardDisclosure` / `ListRow` / `ListStack` / `DataRow` / `MiniBars` / `HeroProgress` /
`StatusDot` / `TrailingCount` / `HeroText`（外加外壳 `CardRoot` / `CardHeader`、按钮 `TouchButton` / `ActionButton`、
骨架 `Detail*` / `Subpage`）。

规则：

1. **不得复制实现**：插件里出现「自己画一遍」的同类结构（自绘 7 天条、自绘进度条、手写 label 左 / value 右的
   data row、手写「共 X · 显示 Y」、自写空态块）一律按反模式处理，即使像素看起来一致。
2. **不得改其尺寸**：原语的字号、行高、图标档位、间距都是系统值；`className` / `style` 只允许做定位
   （margin/align/flex），不允许改 font/padding/height/border/shadow。
3. **不得绕过语义钩子**：原语输出的 `data-*`（`data-wtsl-hero`、`data-card-identity`、`data-data-row`、
   `data-mini-bars`、`data-hero-progress`、`data-empty-state`、`data-compact`）是验收脚本的定位依据，
   插件不得覆盖或删除；`...rest` 只能**追加**属性。
4. **缺原语时先补共享层**：需要一种新结构，先在 `_shared/ui.jsx` 实现并更新本节与 TOKEN-MAP，再在插件里用；
   不允许「先在一个插件里试，成了再搬」。

### 4.4.2 尺寸档位字段表：换字段集合，不放大字号（2026-10-24 追加）

尺寸档变化时唯一允许改变的是**显示哪些字段**（以及列表行数，见 DENSITY §2.2），**不是字号**。

```js
import { defineSizeFields, sizeKeyOf } from '../../_shared/ui.jsx'; // ui.jsx:58 再导出 sizes.js

const FIELDS = defineSizeFields(
  {
    '1x1': { identity: 'compact', seconds: false, worldClocks: 0 },
    '2x1': { identity: 'full', seconds: true, worldClocks: 0 },
    '3x2': { identity: 'full', seconds: true, worldClocks: 3 },
  },
  { defaultSizeKey: '2x1' },
);

FIELDS.fieldsFor(size);   // 接受 '3x2' / [3,2] / { columns, rows } / { width, height } / { w, h }
FIELDS.countFor(size);    // 自检：相邻档字段项数必须 +1 以上（DENSITY §2.1-4）
FIELDS.has('3x2');        // 是否声明了该档
```

- `SIZE_KEYS = 1x1 / 2x1 / 1x2 / 2x2 / 3x2 / 3x3 / 4x2`（与 manifest `sizes` 同一坐标系，冻结）。
- `sizeKeyOf(size, fallback='2x1')` 只做**归一化**：非法输入返回 fallback，不抛错（宿主尺寸是外部输入）。
- `defineSizeFields` 对**声明期**错误显式抛错：非法档位 key → `RangeError`；`defaultSizeKey` 不在表里 →
  `RangeError`；空表 / 非对象 → `TypeError`；表与每档字段集 `Object.freeze`。**禁止**用静默回退掩盖拼错的档位。
- 收益：同一张表的 `fieldsFor` 让「1×1 → 3×2」只增字段，不增字号；hero 仍由 `HeroText` 固定 40/52，
  所以「放大字号来填满卡片」在结构上不可能发生（DENSITY §1.1-1）。
- 例外：**列表行数**是尺寸档的合法差异（DENSITY §2.2 公式 + cap），不算放大字号。

### 4.4.3 文案规则：可做的事由 affordance 承担，不写说明书（2026-10-24 追加）

> 触发原因是用户原始指令：「不要防御性书写，用颜色、形状、图标、摆放位置来暗示可以做的工作，而不是用大量的文字。」
> 依据：Fluent `content-design.md:24`「get to the point fast，prune every excess word」、
> `onboarding.md`（空状态负责给下一步，不负责讲文档）、HIG §11「用交互教，而不是用教程教」、
> HIG §4「不要只靠颜色」。

**空态结构（固定，不允许增删元素）**：中性单色图标（24，`EMPTY_STATE_ICON_SIZE`；3×3 档自动用 40 档位，
见 DENSITY §1.2）+ 一句标题（≤6 汉字）+ 一个次操作按钮。**不接收说明文字**——`EmptyState` 已删除
`description` 参数，传了也不渲染（结构上杜绝）。3×3 档的空带超标是**结构性例外**：靠图标档位与垂直居中撑观感，
不靠补一行说明文字解决。

**允许出现在卡片上的文字**（穷举，超出即违规）：

| 类别 | 约束 | 例 |
|---|---|---|
| 组件名 | ≤4 字 | 「天气」「待办」 |
| 空态/状态标题 | ≤6 汉字 | 「还没有城市」「提醒已关闭」 |
| 数据标签与单位 | 名词 + 单位，可带数量 | 「今日完成」「45 分钟」「逾期 3」「共 6 · 显示 5」 |
| 按钮文字 | 动词 + 名词 ≤4 字 | 「添加城市」「打开设置」「重新获取」 |
| 错误文案 | 一行，只说发生了什么 | 「天气不可用」「天气数据地址未设置」 |
| 等待文案 | 动词进行时，≤1 行（FLUENT2 §12） | 「正在获取天气…」 |

**禁止**：`在……里添加`、`卡片会显示……`、`你可以……`、`先记录一次……`、`点击说话`、`说点什么，或按住空格`、
`换个关键词……`、`完成后会自动……`、`请检查/请稍后/请填写`。错误与校验文案只陈述事实，动作由按钮承担。

**用 affordance 替代被删掉的文字**（唯一做法，不允许用更多小字补偿）：

| 要表达的事 | 承载方式 |
|---|---|
| 可添加 | `Add20Regular` 图标 + 次操作按钮（`appearance="secondary"`） |
| 可展开详情 | 标题行行尾 `ChevronRight16Regular`（`CardIdentity disclosure` / `CardDisclosure`），**不写「详情」** |
| 可打开设置 | 齿轮图标（`Settings20Regular`）+「打开设置」 |
| 可重试 | 回环箭头图标（`ArrowClockwise20Regular`） |
| 状态（逾期/接近/该起身） | `StatusDot` 语义色 **+ 图标形状差异**（计时/警示/勾）+ 位置（identity 行尾），不只靠颜色 |
| 下一次提醒 | 点 + `Timer16Regular` + 剩余分钟（数据）；完整语义交给 `aria-label` 与 `Tooltip` |
| 正在运行 | `colorBrandBackground` 进度带（`HeroProgress`）+ accent 前景；空态**不得**用实心 accent |
| 语音入口 | 大号圆形麦克风按钮（96×96）+ 待机细环；`aria-label` + `aria-keyshortcuts="Space"` + Tooltip |

**按钮层级**：空态主操作一律 `secondary` / `subtle`；实心 `primary` 只属于「正在进行的动作」（开始/停止/发送）。

**无障碍兜底（删字之后必须成立）**：每个被删掉语义务必落到 `aria-label`（读屏）与 Fluent `Tooltip`
（鼠标可发现，`relationship="label"` 用于命名、`"description"` 用于补充说明）之一；
**禁止原生 `title`**（会露出系统白框，见 iframe tooltip 旧账）。纯装饰（chevron、状态点）`aria-hidden="true"`，
语义由容器 `CardRoot ariaLabel`（「…，点击打开详情」）承担。

**几何连带约束**：去掉说明行后空态块变矮，`EmptyState` 组距因此固定为 24（`spacingVerticalXXL`），
短卡（1×1 / 2×1）走 `compact`（图标槽 24、组距 4）。插件**不得**再用 `style={{ gap }}` 覆盖——
六张卡的空态图标尺寸、颜色、组距必须逐像素一致（DENSITY §1.1-2 的 22% 空带门禁是这条的算术依据）。


## 5. 设置入口协议

```
plugin → host: { type: 'plugin:request-host-settings' }
```

宿主根据消息来源的 pluginId，导航到 `设置页 → 插件 → <manifest.name>`。插件不需要知道路由。

- 若消息来自**详情/编辑浮层的 iframe**，宿主必须先关闭该浮层再导航（与 §4.1「设置…」= 跨页导航一致）；
  否则 Fluent Dialog 的 modal Portal 会继续挡住设置页。
- 插件只发这一条消息，不要自己再发 `plugin:request-overlay-close` 做兼容；关闭浮层是宿主职责。

## 6. Agent 工具契约（与用户能力对等）

- **每个用户可执行的操作，都必须有对应工具**；反之每个写操作工具都要有用户可达的 UI 路径。
- 命名：`<pluginId>.<verb>`，如 `clock.settings.get`、`countdown.update`。只读工具加 `.get/.list/.status` 后缀，
  写操作明确动词。
- 工具必须返回结构化结果（对象），错误用 `{ error }` 或 SDK 的 `toolResult(ok=false)`。
- 工具声明可带可选 `phrases: string[]`（v0.3.5，D-28）：用户整句（忽略空白/标点）与其中一条完全相等时，
  宿主**直接执行该工具**，不再等模型决定。只适合「用户报告自身状态、必须立即生效」的动作
  （如久坐的「我站起来了 / 我坐下了」）；带疑问或长句仍交给模型判断。
- 插件文档的「Agent 工具」表必须同时列出 **UI 路径 ↔ 工具** 的对应关系。
- 宿主不校验对等性（无法通用校验），由插件验收清单与文档负责。

## 7. 验收清单（插件进入本项目的硬门槛）

> 本阶段验收记录：2026-10-20（E7，版本 0.2.0）。六个正式插件全部通过；逐条证据见下表与
> `shots/e7/REPORT.md`。命令：`node scripts/verify-plugin.mjs <id>`、`node scripts/verify-widgets.mjs`、
> `node scripts/verify-overlays.mjs --scheme dark|light`。

| # | 门槛 | 结果 | 证据 |
|---|---|---|---|
| 1 | 卡片主体点击 = `requestOverlay('detail')`；卡片内控件阻止冒泡 | ✅ | 六插件宿主冒烟（点卡开 detail 浮层、X/Esc 关闭）；`shots/e7/logs/verify-plugin-final.log` |
| 2 | 设置只通过 manifest `settings` schema 声明，无自带设置界面 | ✅ | 六插件 `?view=settings` 已删除；设置页按 schema 渲染 3/2/9/6/4/8 项（E2E E2） |
| 3 | 每个用户操作都有对应 Agent 工具（含设置读写） | ✅ | 六插件工具声明与 `plugin:ready` 注册；plug-and-play 复盘页 `ping.stats` 实际调用成功 |
| 4 | 提供 `?view=detail`，内容为「更多 + 操作」 | ✅ | `verify-overlays` 六插件 detail 6/6 × 暗/亮；`shots/e7/overlays/` |
| 5 | 长按通过 SDK `useHostCardGesture` 上报，插件不自处理长按/右键/hover | ✅ | 宿主 E2E 长按进编辑 53/53 × 4 套；静态扫描无插件自绘长按 |
| 6 | 详情按 L1/L2 页栈；L1 无返回箭头、L2 有；保存 pop / 取消 pop / X 关闭 | ✅ | 六插件 detail 断言 + E5 L2 截图；`docs/DECISIONS.md` D-14 |
| 7 | Tabs 只用于平级内容且常显 | ✅ | weather / todo detail Tabs 常显；detail 骨架无「视图菜单」 |
| 8 | 每个尺寸符合 DENSITY 信息预算，无详情级操作 | ✅ | `verify-widgets` 25/25 × 暗/亮（1 项已接受 P2 记账，见 `shots/e7/REPORT.md` §3.2） |
| 9 | 只使用 `plugin-sdk.js` + `_shared/**`，未 import `src/host/**` | ✅ | `verify-plugin` 静态检查；插件源码 grep 无 `src/host` |
| 10 | `node scripts/build-plugin.mjs <id>` 产物提交；`verify-widgets --plugin <id>` 通过 | ✅ | `build-plugin --all` 重建后 `git status` 无 diff；六插件 widgets 全 PASS |

- [x] 卡片主体点击 = `requestOverlay('detail')`；所有卡片内控件阻止冒泡。
- [x] 设置只通过 manifest `settings` schema 声明，没有自带设置界面。
- [x] 每个用户操作都有对应 Agent 工具（含设置读写）。
- [x] 提供 `?view=detail`，内容为“更多 + 操作”。
- [x] 长按通过 SDK 的 `useHostCardGesture` 上报给宿主，插件不自行处理长按/右键/hover。
- [x] 详情按 L1/L2 页栈：L1 无返回箭头，L2 有返回箭头；保存 = 提交并 pop、取消/返回 = 放弃并 pop、X = 关闭整个浮层。
- [x] Tabs 只用于平级内容且常显，不用隐藏菜单做形态切换。
- [x] 每个尺寸符合 DENSITY 信息预算，无详情级操作。
- [x] 只使用 `plugin-sdk.js` + `_shared/**`，未 import `src/host/**`。
- [x] `node scripts/build-plugin.mjs <id>` 产物提交；`node scripts/verify-widgets.mjs --plugin <id>` 通过。

## 8. Plug-and-play 验收方式

> **已人工验收 2026-10-20**（E7，v0.2.0）。fixture：`ping`（`manifest.id=ping`、name「Ping 测试」、
> 一个 widget、sizes 1×1/2×2/3×2、settings schema 3 字段 boolean/enum/number、`?view=detail`、
> Agent 工具 `ping.summary` + 只读 `ping.stats`）。步骤：复制 `templates/plugin-template` → 改名/改工具 →
> 只把 `"ping"` 加入 `public/plugins/index.json` → `node scripts/build-plugin.mjs ping` →
> 打开宿主跑 6 类断言 → 删除 `public/plugins/ping/` 与 index 项。**未改任何 `src/host/**`**，19/19 断言通过
> （桌面出卡、点卡进详情、编辑改尺寸/拖拽/删除、设置页自动分区并按 schema 渲染/即时保存、详情「设置…」
> 跳分区、Agent `?mock=1` 工具调用、复盘页 `Ping 测试` 统计块、删除后桌面恢复六卡无残留）。
> 步骤、用例与证据：`shots/e7/REPORT.md` §2.3（截图与 JSON 在 `shots/e7/plug-and-play/`）。
> 自动化脚本：`node scripts/verify-plug-and-play.mjs`（2026-10-20 落地）。冷复制模板 → 仅登记 index →
> 正式宿主断言第 7 卡 / 详情 / 设置 schema / 清理，**12/12 PASS**；Agent 工具与复盘统计仍以 E7 人工
> fixture 证据为准（模板未声明 `*.stats` 工具）。

1. 准备一个最小第三方插件（manifest + 卡片 + `?view=detail` + settings schema + 一个 `*.stats` 工具）；
2. zip 拖入/放入 `plugins/<id>/`，重扫；
3. 断言（无需改宿主代码）：
   - 桌面出现卡片，编辑模式可改尺寸/删除；
   - 点卡片进入详情；
   - 宿主设置页出现该插件分区，字段按 schema 渲染、修改即时生效；
   - 详情里的「设置…」跳转到该分区；
   - Agent 工具列表出现该插件工具，可调用；
   - 复盘页出现该插件的统计块（名称来自 manifest）。
4. 自动化脚本：`node scripts/verify-plug-and-play.mjs`（2026-10-20 落地；覆盖桌面/详情/设置/清理，12/12 PASS）。

## 9. 反模式（出现即不通过）

- 宿主里写 `if (pluginId === 'clock')`、按插件名写死设置字段/展示名。
- 插件自带设置页面/关闭按钮/长按菜单；插件读取宿主内部路由或模块。
- 卡片上出现 `+`、齿轮、详情级菜单；卡片主体点击改变自身展示状态。
- 用户能做但 Agent 做不到（或 Agent 能做但用户无路径）。
- 设置项需要“保存才生效”（必须即时生效；保存按钮只是羡余）。

## 10. 落地清单（宿主侧待实现）

1. 设置页新增“插件”导航：从 PluginManager 动态列出插件 → 按 manifest `settings` 渲染通用表单
   （字段类型 v1、即时保存、保存按钮、恢复默认）。
2. `plugin:request-host-settings` 与 `plugin:request-edit-mode` 消息处理；编辑模式「设置」跳转；
   设置页「外观」分组增加「编辑桌面布局」「重置布局」两个低频兜底操作。
3. 复盘页 provider 展示名改为从 manifest 取，删除写死的 `todo/pomodoro` 标签。
4. 六个插件：删除 `?view=settings` 界面；交互改为第 3 节；补 detail 视图；补 Agent 工具对等；
   把设置项迁入 manifest schema；内容管理搬进详情。
5. 文档：六个 `docs/components/*.md` 按本契约重写交互/设置/Agent 部分；
   `docs/DECISIONS.md` 记录“卡片交互契约 / 设置宿主化 / 插件解耦”决策。
