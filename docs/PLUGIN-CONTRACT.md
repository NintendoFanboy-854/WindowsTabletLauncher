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
