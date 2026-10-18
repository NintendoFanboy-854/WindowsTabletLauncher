# 桌面设计约定

> 跨组件的公共决定。具体组件的行为写在 `docs/components/<id>.md`。
>
> 三条总原则：
> 1. **设计语言只有一个：Fluent 2**。所有视觉、组件、动效、焦点态都走 Fluent。
> 2. **自适应优先**。不假设固定分辨率，横竖屏、窗口缩放、高 DPI 下都要好看好用。
> 3. **不自造限制**。数字要么来自 Fluent token，要么来自实际需要，不拍脑袋。

## 1. 布局系统

### 1.1 自适应网格

> 旧版固定 8×5 / 每格 180×192 的做法作废——分辨率一变就崩。

- **单元格**：正方形，边长由窗口推导，约束 `96px ≤ cell ≤ 220px`。
- **列数**按窗口宽度分档（Fluent 没有官方断点，这组数字来自我们自己的可用性测试，可改）：

    窗口宽度（CSS px）   列数  
   --- --- 
    ≥ 1280   8  
    900 – 1279   6  
    < 900   4  

- **行数** = `floor(可用高度 / cell)`，最少 4 行；页内**不滚动**，桌面始终是一屏（这是桌面环境的定义，不是限制）。
- **竖屏**（高 > 宽）：沿用上面的列数规则，行数自然变多；组件尺寸照档位走，不需要旋转逻辑。
- **尺寸档位**（列跨 × 行跨）：`1×1`、`2×1`、`1×2`、`2×2`、`3×2`、`4×2`、`3×3`。插件在 manifest 里声明**它支持哪几档**，用户在编辑模式里切换。
- **列数变少时的降级**：`w = min(w, 列数)`，`h` 不变；然后整页按“从左到右、从上到下”重排到第一个放得下的空位（避免重叠）。
- 布局持久化用逻辑坐标（页、列、行、档位），不存像素。

### 1.2 小组件内部

- 小组件是 iframe，**iframe 的视口就是卡片本身**：内部直接用 `vw / vh / % / clamp()`，不要写死像素。
- 字阶、间距用 Fluent token 做基准，再用 `clamp()` 按视口缩放；极端小尺寸下**优先保信息、砍装饰**。
- 触控目标不小于 **40×40 CSS px**（Fluent 的触控尺寸）。
- 每个组件文档里必须写清楚：各档位显示什么、**太小的时候砍掉什么**。
- 加载态用 Fluent `Skeleton` / `Spinner`，错误态用 `MessageBar`，空状态用 Fluent 的空状态排版。

### 1.3 多页面

- 页数不限；左右滑动切页（手指落在小组件上时手势归小组件）。
- 页面指示点：页数超过 7 时折叠成“当前页/总页数”的小胶囊，避免指示点排一长串。
- 编辑模式下可增删页、调整顺序；拖到屏幕左右边缘停住会翻页。

## 2. 交互

- **点击** = 小组件默认动作（插件定义，可以什么都不做）。
- **长按 500ms**（`motionTokens` 之外的手势阈值，属于交互参数）进入编辑模式：卡片轻微缩放、右上角出现「删除 / 改尺寸 / 设置」；点空白或 `Esc` 退出。
- **拖拽**：编辑模式里拖标题条换格，松手吸附；拖到边缘停 0.6 秒翻页。
- **键盘**：
  - `Tab` 在桌面小组件之间移动焦点（宿主负责 roving focus，焦点环用 Fluent 的 focus indicator）；
  - 焦点进入某个小组件后，宿主通过消息让插件聚焦它内部第一个可聚焦元素；`Esc` 把焦点交还宿主；
  - 编辑模式下方向键移动、`Delete` 删除、`Enter` 打开该组件的设置。
- **悬停 / 按下**：小组件统一用 Fluent 的 subtle 背景与边框变化，插件内部自行使用 Fluent 状态样式。

## 3. 插件契约

- 位置：`plugins/<id>/`，`manifest.json` + 资源（`index.html` 等）。
- 名单：`plugins/index.json`，字符串数组。
- manifest（一个小组件可支持多个尺寸）：

  ```json
  {
    "id": "clock",
    "name": "时钟",
    "version": "0.1.0",
    "widgets": [
      {
        "id": "clock",
        "title": "时钟",
        "sizes": [[1, 1], [2, 1], [3, 2]],
        "defaultSize": [2, 1],
        "cell": [0, 0]
      }
    ]
  }
  ```

- 加载：宿主读名单 → 读 manifest → 每个小组件挂一个 iframe；当前尺寸由布局决定，通过 `init` 告诉插件。
- **后台插件**：`"background": true` 时额外挂一个不可见的常驻 iframe（定时、提醒、轮询）。
- **热加载**：进入编辑模式时重扫插件目录。
- **安装**：zip 拖进窗口 → 解压到 `plugins/<id>/` → 重扫；手动放文件夹同样生效。
- **主题注入**：`init(theme)` 传 Fluent token 的颜色；插件把值写到 CSS 变量里用。
- 插件之间不直接通信，要共享数据经过宿主。

### iframe 的取舍（已确认）

- 选 iframe：样式天然隔离、插件能独立开发、坏插件不至于污染桌面。
- 代价：主题要手动注入、键盘焦点跨 iframe 要协议、无障碍边界不完美、每个组件占一份内存。
- 不选 Web Component：样式隔离弱，主题/尺寸协商更绕。
- 因此插件必须遵守：只用 `init` 拿到的主题、只用 iframe 视口单位做自适应、实现键盘焦点交接消息。

## 4. 宿主给插件的 API

- `init(theme, widget)`：主题 token + 当前尺寸。
- `getConfig(key)` / `setConfig(key, value)`：按插件命名空间隔离。
- `notify(text)`：一条提示。
- `registerAgentTool({ name, description, run })`。
- `setKeepAwake(bool)`：阻止息屏。
- `getIdleSeconds()`：系统级空闲秒数。
- `showReminder({ title, message, actions, autoDismissSec })`：全屏强提醒。
- `getLocation()`：系统定位。

新 API 只在真有组件需要时加，不预埋。通信走 `postMessage`。

## 5. 数据与持久化

- 布局存 `wtsl.layout`（页、列、行、档位），页面配置存 `wtsl.pages`。
- 每个插件自己的数据自己存，键名以插件 id 开头；宿主不碰。
- 先用 `localStorage`；以后换 Tauri 文件存储时插件接口不变。

## 6. Fluent 2 规范

> 官方设计语言的完整落地规则（颜色/字阶/间距/圆角/阴影/材质/动效/图标/无障碍/文案/等待）见 **[FLUENT2.md](FLUENT2.md)**。本节只保留工程约定；冲突时以 FLUENT2.md 为准。

- **组件**：一律用 Fluent UI React v9（`@fluentui/react-components`）的 Button、Card、Dialog、Drawer、TabList、Menu、Toast、Skeleton、MessageBar、Spinner、Input、Switch、Slider…；不自己画控件。
- **主题**：`FluentProvider` + 深色主题，亮色作为可选项；颜色全部取 `tokens.*`，不手写 hex。
- **字体**：Fluent 字体 token（`fontFamilyBase` → Segoe UI Variable），字阶用 `fontSizeBase*` 档位。
- **圆角 / 间距 / 阴影**：`borderRadius*`、`spacing*`、`shadow*` token。
- **材质**：Fluent 的 web 端没有 Acrylic/Mica 的官方实现，也不做系统级窗口材质（已决定）。卡片用 `colorNeutralBackground*` 的半透明色 + 统一的 `backdrop-filter` 模糊（模糊值定义成项目 token `--wtsl-material-blur`，只此一处例外）。未来若升 Windows 11 再考虑 Mica。
- **图标**：界面图标用 Fluent System Icons；**天气现象图标是唯一例外**（用和风 SVG，因为 Fluent 天气图标覆盖不全），只作为内容图形，颜色/间距仍按 Fluent 排。
- **焦点态 / 高对比度**：用 Fluent 默认焦点样式，不覆写。
- 本地参考：`references/fluentui-docs/`。

## 7. 动效：完全按 Fluent 2

- 用 `motionTokens` 的时长和曲线 + `@fluentui/react-motion`（`createPresenceComponent` / `createMotionComponent`），不自定义 easing。
- Drawer / Dialog / Toast：Fluent 组件自带过渡，不覆写。
- 编辑模式进出：卡片缩放淡入淡出，用 Fluent 标准缩放过渡。
- 拖拽吸附：短时长位移过渡（`motionTokens`）。
- 页面切换：用 Fluent 的减速曲线做滑动/淡入，不发明花哨动画。
- 动画强度统一走 token；任何组件不允许写自己的时长常量。

## 8. 宿主页面（同样要自适应）

- **设置页**：全屏 Fluent 页面，宽屏两栏（左侧导航、右侧内容），窄屏单栏堆叠。
- **复盘页**：独立全屏页 + Agent 面板入口；宽屏四栏卡片网格，窄屏单栏。
- **插件管理**：列表用 Fluent Table/List，窄屏折叠成卡片。
- **Agent 面板**：浮层宽度 `min(420px, 92vw)`；常驻侧栏只在大屏（≥1280）作为选项生效，否则退化为浮层；全屏模式覆盖桌面。

## 9. 权衡记录

  决策   放弃的方案   理由  
 --- --- --- 
  自适应列数（8/6/4）   固定 8 列   固定列在窄窗口/竖屏下格子过小，字放不下  
  正方形单元格 + 页内不滚动   填满高度、页内滚动   桌面是“一屏”概念，滚动会破坏小部件心二象  
  尺寸档位 + 多档声明   自由拖拽改尺寸   档位保证视觉秩序，同时插件可控  
  iframe 插件   Web Component / 直接模块   隔离收益大于主题与键盘协议的成本  
  天气图标用和风   全 Fluent 图标   Fluent 天气图标覆盖不全，和风图标只作内容图形  
  卡片材质自定模糊值   纯 Fluent 纯色背景   Fluent web 无 Acrylic token；定义为单一项目 token  

## 10. 组件文档模板

每个组件一个 `docs/components/<id>.md`，固定回答：

1. 用途
2. 数据模型
3. 支持的尺寸档位 × 各档显示什么、太小砍什么
4. 交互
5. 配置项
6. Agent 工具
7. 边界与异常
8. 依赖的宿主能力
9. 不做什么
