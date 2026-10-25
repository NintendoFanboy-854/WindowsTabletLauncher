# v0.4.0 视觉升级实施规范（Lead → 执行者）

> 只读本文件 + 你负责的文件；不要读整个仓库文档。用户要求：严格 Fluent 2、**不允许自己写设计 token**、全量构建后 push。
> 所有颜色/字号/间距/圆角/阴影/动效必须来自 `@fluentui/react-components` 的 `tokens` / `motionTokens`。

## 0. 硬约束（违反即返工）

1. **不新增项目自定义 token、不手写 hex/rgb/hsl、不写自造毫秒/曲线。** 例外：仓库已有的 `--wtsl-card-radius`、`--wtsl-material-blur` 由 Lead 处理，你不要动、不要扩散。
2. 不引入 Apple 组件/设计语言；不用非 Fluent 图标。
3. 中文文案按 `docs/FLUENT2.md §11`：短句、不加句号、动词开头、不用感叹号。
4. 组件 identity 色只允许用 `_shared/ui.jsx` 的 `CARD_ACCENTS`（6 个 Fluent palette hue），只出现在 identity 图标的 24×24 chip 上（≤10% 卡片面积），不承担状态/语义，不做背景装饰。
5. 只改你负责的文件；不改 `_shared/ui.jsx`（Lead 已改好）、不改 `src/host/**`、不改 `docs/**`、不跑 git。

## 1. Lead 已完成的共享改动（直接用，不要重复实现）

`public/plugins/_shared/ui.jsx` 新增：

```jsx
import { CardIdentity, EmptyState } from '../_shared/ui.jsx';

<CardIdentity icon={<Clock16Regular />} label="时钟" accent="blue" />
// 1×1 卡用 compact：只显示 chip
<CardIdentity icon={<Clock16Regular />} label="时钟" accent="blue" compact />
// trailing 放原有的计数/城市/状态等辅助信息（可选）
<CardIdentity icon={<WeatherSunny16Regular />} label="天气" accent="teal" trailing={<Text size={200}>北京</Text>} />

<EmptyState
  icon={<CalendarLtr24Regular />}      // 建议 32–48px 图标，作为空态视觉锚点
  iconAccent="pink"                    // 与卡片 identity 同色
  title="还没有倒数日"
  description="添加一个重要的日子，卡片会显示剩余天数"
  action={<TouchButton appearance="primary">添加倒数日</TouchButton>}
/>
```

- `CardIdentity` = 24px 高、24×24 accent chip（`colorPalette*Background2` 底 + `colorPalette*Foreground2` 图标）+ 12px 半粗 fg3 标签，可选 trailing。
- 它不是 chrome：没有可交互控件、不占点击热区，只是卡片身份锚点。每卡只在内容区第一行放一个。

## 2. identity 分配（固定，勿改色相）

| 插件 | accent | 16px 图标（先在 `node_modules/@fluentui/react-icons/lib/sizedIcons/*.d.ts` grep 确认存在） | 标签 |
|---|---|---|---|
| clock | blue | `Clock16Regular` | 时钟 |
| countdown | pink | `CalendarLtr16Regular` | 倒数日 |
| pomodoro | orange | `Timer16Regular` | 番茄钟 |
| sedentary | green | `PersonWalking16Regular`（若无 → `HeartPulse16Regular`） | 久坐 |
| todo | purple | `TaskListSquareLtr16Regular`（若无 → `CheckmarkCircle16Regular`） | 待办 |
| weather | teal | `WeatherSunny16Regular`（若无 → `WeatherMoon16Regular`） | 天气 |

## 3. 每张卡要做的三件事

### 3.1 identity 行
- 在卡片内容区第一行插入 `CardIdentity`（1×1 用 `compact`；2×1 起 chip+标签）。
- 替换/吸收该卡原本的顶部分组标签（如 todo 的「今日 · N」可用 `label="待办"` + `trailing` 放「今日 · N」；weather 的「城市」可作为 trailing）。
- 不能因此把主信息挤小；不要新增分割线/边框/背景。
- `CardIdentity` 外面的容器用你插件现有的 padding/gap，不额外加 padding。

### 3.2 空态
- 该卡可能出现空态时（todo 无任务、countdown 无事件、weather 无城市/无 Key、todo 今日 0 等），统一换成 `EmptyState` + `iconAccent`（与 identity 同色）。
- 图标用 24/32/48 中能放下的最大 Fluent 图标；标题 ≤8 字；说明 ≤2 行；主操作只给 1 个（`TouchButton appearance="primary"` 或 Fluent Button）。
- 空态要占满卡片剩余高度、居中；不要留一张"空灰卡"。

### 3.3 中景与层级（只做减法/微调）
- 允许把辅助值/次值从 12 提到 14/16（`Text size={200|300|400}`），让卡片内有"中景"。
- 硬门禁（DENSITY §2.1，`verify-widgets` 会测）：最小字号 ≥12；主:次字号比 ≥2.0；任意空带 ≤22% 卡高；内容带 ≥60%（weather 3×2 ≥70%）；横向连续空洞 ≤40px；3×2 信息量必须比 1×1 多。
- 不要为了填满加无意义信息；空态/数据不足时宁可用 identity + EmptyState。

## 4. 默认布局（8×5，1440×960，cell=164 gap=12 padding=20）

改各自插件的 `public/plugins/<id>/manifest.json`：`widgets[].defaultSize` 与 `widgets[].cell`。

| 插件 | defaultSize | cell |
|---|---|---|
| weather | `[4,2]` | `[0,0]` |
| clock | `[3,2]` | `[4,0]` |
| todo | `[3,3]` | `[0,2]` |
| pomodoro | `[3,2]` | `[3,2]` |
| countdown | `[2,2]` | `[6,2]` |
| sedentary | `[2,1]` | `[6,4]` |

- `defaultSize` 必须在 `sizes` 数组里；`cell` 是逻辑格坐标（列,行）。
- 改完清理本地布局缓存后打开桌面确认落位（`localStorage.removeItem('wtsl.layout')`；或 `?reset-layout=1` 若存在）。
- 其他分辨率会 clamp 尺寸/回退空位，不追求一致。

## 5. 交付与验证（每个执行者必须完成）

1. `node scripts/build-plugin.mjs <id>` 成功（产物 `public/plugins/<id>/app/app.js` 更新）。
2. `node scripts/verify-widgets.mjs --plugin <id>` 全 PASS（dev server 已在 `http://localhost:5173` 运行；不通就告诉 Lead，不要自己起/杀服务）。
3. `node scripts/verify-widgets.mjs --plugin <id> --scheme light` 也跑一遍（亮色回归）。
4. 自检：卡片无 console error；1×1 / 2×1 / 2×2 / 3×2 至少各截一张或在 verify 的 `--screenshots` 里看过。
5. 交付时报告：改了哪些文件、verify 输出摘要（PASS/FAIL 数）、截图路径（如果生成）。

## 6. 工作方式

- 先 `team_task_list` 找到你的任务，`team_task_update` claim，完成后 complete。
- 有疑问先看现有代码与 DENSITY 门禁，不要问用户；实在冲突时在 shared task 备注并告知 Lead。
- 不要跑 `npm run build` / `npx tauri build`（Lead 统一做）；不要 commit/push。
