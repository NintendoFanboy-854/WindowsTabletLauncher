# Agent

桌面的智能入口：听懂人话 → 选插件工具执行 → 用自然语言回你。能力边界 = 插件工具 + 模型 + 联网搜索。

v0.3.0 起（D-20/D-21/D-22）只保留浮空形态，语音为主入口；全屏页、面板形态、人脸唤醒、dock 与机器人图标均已移除。
**v0.3.7 起（D-30）是语音优先的三段**：半高窗 = 纯语音对话的家，语音回合结束不自动升级，文字对话是显式展开的兜底。

## 浮空三段（唯一形态）

右下角一个 Agent 入口 orb（56×56、`borderRadiusCircular`、`ChatSparkle20Regular`），锚点 = **底部条（说明条行）右下角 (1418, 933)**、安全距 0（1440×960 下 right 22 / bottom 27；933 = 网格下缘 895 + gutter 12 + 说明条实测高 `H_p` 26，见 `layout/breakpoints.ts` 的 `layoutFrame`），同一容器向左上生长：

| 阶段 | 尺寸（1440×960） | 内容 | 进入 / 退出 |
|---|---|---|---|
| 入口 `collapsed` | 56×56 圆形 | 图标 | 点按或按住空格 → 立即录音并进入半高语音窗 |
| 半高语音窗 `voice` | 516×340（3 列 × 2 行） | 顶部控制条（⌃ 展开 /（有 peek 时）麦克风 / 朗读开关 /（播报中）停止朗读 / ✕ 关闭）+ 最近 **2** 条消息 peek + 底部：进行中状态行 / 停止后「已停止」提示 / 录音条。**没有文字输入框。** | 显式 ⌃ / 点 peek / Enter → 全高对话面板；Esc / ✕ / 点外部 → 入口（录音中先取消）；**语音回合结束留在本层** |
| 全高对话面板 `chat` | 516×906（3 列 × 5 行，顶边落网格上缘 27；906 = 网格高 868 + gutter 12 + `H_p` 26） | 消息列表 + 底部单行输入区 `[语音] [输入框] [发送]`；头部 常驻朗读开关 /（播报中）停止朗读 / ⌄ / ⋯ / ✕ | ⌄ → 语音窗（不是关闭）；✕ / Esc / 点外部 → 入口（同一关闭语义） |

- 三态共用右下同一个锚点，只过渡宽高（无位移）；入口 `shadow8` + 圆形，语音窗/对话面板 72% 中性面 + `--wtsl-material-blur` + `shadow64` + 圆角 12；几何由 `agent/ui/entryGeometry.ts` 从栅格推导。动效、reduced-motion、焦点路径见 [MOTION.md](../MOTION.md) §5.1 与 [AGENT-SURFACE-CONTRACT.md](../AGENT-SURFACE-CONTRACT.md) §14。
- 可预测性：**✕ / Esc / 点外部三条退出路径语义一致，都等于关闭（收成入口 orb）**；⌄ 是「收起到语音窗」，不是关闭，不中断正在进行的生成；**没有自动升级**，进入全高对话必须显式展开；关闭后焦点回到入口按钮。
- 半高窗不是过渡态：它停留、可连续进行多轮语音对话；最近 **2** 条消息 peek 可点开全高；录音中收起会取消录音。
- 半高窗的语音入口有两档：**没有 peek 消息**时中部是 96px 圆形麦克风按钮（+ 两层静态细环 + 一句「按住空格说话」——键盘路径没有形状可依，只能用一句话说）；**有 peek 消息**时顶部控制条给一个 44×44 麦克风图标按钮（中部被 peek 占满，空态圆钮不存在）。两档都只出现一个麦克风，不做成两个入口。
- 状态与操作分开：朗读开关常驻（图标表达开/关），「停止朗读」只在播报中出现；旧版“只在播放时才冒出语音控件”已移除。
- 文字是兜底：只有显式展开全高浮栏后才有输入框；从全高 ⌄ 退回语音窗、或 ✕ / Esc / 点外部关闭为入口时草稿都保留（Composer 常驻不卸载），再展开仍在。
- 不再有「面板形态」设置；旧数据里的 `panelMode` 直接忽略。
- 入口在非桌面页、编辑桌面、**欣赏壁纸模式**下隐藏（`hideEntry`）。欣赏壁纸由左下角壁纸说明条点按进入（说明条是该模式的唯一入口，Esc 退出，只在本次会话内有效、不持久化），解释文本与缓存口径见 [AGENT-SURFACE-CONTRACT.md](../AGENT-SURFACE-CONTRACT.md) §20、动效见 [MOTION.md](../MOTION.md) §5.2。

## 语音（主入口）

- **点按钮 / 按住空格 / 点「点击说话」= 立即开始录音**（不是先开窗再点麦克风）；松开或点停止 = 结束并发送。录音/转写期间入口与展开都不可用；短按 <300ms、Esc、窗口失焦取消录音。
- **空格默认永远是按住说话**，只有光标主动落在输入框里（显式展开 chat 后点入 / Tab 进入）时空格才是打字；展开、收起、语音回合结束都**不会**把焦点塞进输入框（v0.3.7 修复“回答后按空格打出空格”）。输入框里按 Esc 先退出输入框，再按即关闭为入口。
- 录音结束时：先等 ASR 转写（v0.3.5；最多 8s），再把同一段 WAV 以 `input_audio` + 转写文本一起发给 MiMo 对话模型。纯音频的 function calling 不稳定（会出现“嘴上说已记录、实际没调工具”），带转写文本后模型能可靠地按文字调工具；转写超时才退回纯音频请求，晚到的转写仍会补同步状态类短语。
- **状态短语直通**（D-28）：插件工具可声明 `phrases`；用户整句命中（如「我站起来了 / 我坐下了」）时，宿主的 `matchPhraseTool` 先执行工具、再把结果作为 tool call 交给模型，模型只回一句短确认。UI 状态靠插件的 storage 事件立即同步，不依赖模型是否听话。
- 音频不写 localStorage、不进 Message、不进后续请求；重试/切会话/重启都只发文字。转写失败时该条上下文用「（用户发来一段语音）」占位，界面以声纹 + shimmer 提示，可再录一次。
- 播报：总开关 `tts.autoRead`（默认开）关闭后，语音/文字回答都不自动朗读，手动点单条朗读仍可用；开启时语音提问必读、文字提问按「文字提问也朗读」（默认关，总开关关闭时该项禁用）。每条助手消息可单独播放/停止；收起/关闭窗口、开始录音、发送新消息都先停止播报；TTS 失败只做一次轻提示，不打断文字。
- 语音消息呈现：与打字消息同形同色；气泡顶部一条声纹装饰（高度来自 `voicePeaks`），转写未回时声纹轻微起伏 + 两行 shimmer，回填后文字淡入、声纹静止。**界面不写「语音/转写结果」等标签**，`aria-label` 给屏幕阅读器。

## 对话渲染（轮次时间线 / Markdown / 失败 / 停止）

- **一轮 = 一条按发生顺序的时间线**（v0.4.5 起，`TurnTimeline`，取代 v0.4.2 的聚合轮次卡 `TurnSteps`）：模型先思考了什么 → 调了什么工具 → 输出了什么 → 又思考了什么 → 又调了什么工具，**顺序即事件到达顺序**。数据层真相源是 `Message.blocks`（`thinking | tool | text | notice` 的有序块序列），`content` / `reasoning` / `toolCalls` 降级为投影，协议不变。详见 `AGENT-SURFACE-CONTRACT.md §19`。
- **过程块默认全部折叠，但折叠后不消失**：每个 thinking / tool 块折叠成一行 44px 摘要（整行可点、`aria-expanded`、命中区 `TOUCH_TARGET_CSS`），失败在行尾固定「● 失败」（danger 色，三重编码）。`text` / `notice` 永不折叠。设置里有全局开关「显示全部过程细节」（`agent.timeline.expandAll`，默认关），单块可在全局开启时单独收起（双向）；全局关着时点开一块会收起同轮其它块（手风琴）。
- **渲染器只按块 `kind` 分支，不按工具名分支**——不为任何具体工具写特例，摘要由 `blockSummary.ts` 统一生成。
- **全高正文支持块级 Markdown**：标题 / 列表 / **围栏代码块**（等宽块 + 语言标记，长行在块内横向滚动）/ **表格**（表头 + 数据行 + 底边线，窄容器整块横滚，单元格可换行）/ 粗体 / 行内码 / 链接。不引第三方解析器，数据层仍是同一段 `content` 字符串。
- **半高只做行内**：`PeekText` 先把块级标记剥掉（`#{1,6}` / `-`·`*`·`+` / `>` / `1.` / 分割线 / 表格行），标题文字保留并加粗，列表条目之间用 ` · `、表格行之间用 `；` 连接，围栏降级为一行等宽片段；再按可见字符预算在 token 边界截断，界面上不出现 `##`、`-`、`|` 或半个语法符号。
- **失败轮不留空气泡**：一轮没有正文/思考/步骤/来源时，不渲染气泡壳；错误提示条（`MessageBar` + 重试 + 关闭）内联在该轮里，失败本身就是这一轮的视觉主体。同一条错误只在一处渲染（输入区的 `AgentAlerts` 此时被抑制）。
- **停止有回声**：半高窗点「停止生成」后，状态行改述为「已停止」（warning 色 + 停止图标 + `role=status`），停留 3 秒后淡出；同时回到可再次说话的 idle 态。

## 设计规范（v0.3.7）

- **只使用 Fluent 2 设计 token**（[FLUENT2.md](../FLUENT2.md)）：颜色只用 `colorNeutral*/colorBrand*/colorStatus*`；字号落在 type ramp；间距只用 `spacingHorizontal*/spacingVertical*`；圆角只用 `borderRadius*`（浮窗容器 `borderRadius2XLarge` 12）；阴影只用 `shadow*`；动效只用 `motionTokens`。不写 hex、不自造毫秒/曲线/间距/圆角；触控目标 ≥44×44；图标只用 Fluent System Icons（12/16/20/24，Regular；12px 只表达信息不用于交互）；主操作 1–2 个（「点击说话」primary），其余用 subtle 图标按钮。
- **HIG 启发但只借思想**（[APPLE-HIG.md](../reference/APPLE-HIG.md)）：*从哪来、回哪去*（入口长出、原路收回、关闭焦点回入口）、*关闭语义一致*（✕ 关层 / ⌄·Esc 退一级）、*渐进披露*（peek 顶部渐隐提示更多，完整历史显式展开）、*sheet detent 思想*（半高可停留、可展开）、*减少动效*（reduced-motion 只留 120ms 透明度）。不引入 iOS 专属控件或手势。

## 数据模型

```ts
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  createdAt: string;
  status?: 'streaming' | 'done' | 'error' | 'aborted';
  reasoning?: string;
  sources?: SourceRef[];
  webSearchUsage?: { toolUsage: number; pageUsage: number };
  toolCalls?: ToolCallRecord[];
  /** 以下仅 UI 使用，不进入模型请求 */
  input?: 'voice' | 'text';
  voicePeaks?: number[];        // 12–24 个 0..1 包络桶
  voiceDurationSec?: number;
  transcriptStatus?: 'pending' | 'ready' | 'failed';
}

interface Settings {
  model: 'mimo-v2.6-flash' | 'mimo-v2.6-pro' | 'mimo-v2.6-pro-ultraspeed'; // 默认 flash
  thinking: boolean;                              // 默认 false
  tts: {
    autoRead: boolean;          // 默认 true：自动朗读总开关；关 = 全部只显示文字（手动单条朗读仍可用）
    readTextReplies: boolean;   // 默认 false：文字提问是否也自动朗读；只有 autoRead 开启时生效
    voice: string;              // MiMo TTS 音色
    rate: number;               // 0.5–2.0，默认 1.0
  };
  search: { enabled: boolean; maxKeyword: number; forceSearch: boolean };
  mimo: { apiKey: string; baseUrl: string };
}
```

- 存储：会话 `agent.conversations`（只存文字，音频用完即弃）、设置 `agent.settings`。
- 迁移：`readTextReplies` 取旧 `tts.autoPlay`；`tts.autoRead` 缺省 true；旧 `tts.continuous`（曾被语音模式强制写 true）不迁移；旧 `face` / `panelMode` 丢弃。

## 模型接入

- MiMo V2.6（OpenAI 兼容 `/chat/completions`），SSE 流式，支持 tool calls。
- 本轮语音用 content parts 的 `input_audio` 原生输入；历史消息全部为文字。
- API Key 在设置里填，本地存；服务地址高级项可改。
- 系统提示：角色说明 + 当前时间 + 全部已注册工具清单 + 输出风格要求（简洁、中文、能用工具就别猜）。
- 上下文按模型窗口裁剪；工具结果过长截断；请求失败/超时给可重试错误。

## 工具

### 插件工具

插件通过 `registerAgentTool({ name, description, run })` 注册，宿主汇总后作为 `tools` 传给模型。命名 `<插件id>.<动作>`：`clock.now`、`todo.add`、`pomodoro.start`、`weather.queryPlace`、`sedentary.today`、`countdown.list`…

执行：宿主 → postMessage 到插件 iframe（带 requestId）→ 等结果。失败/超时把错误文本回给模型，由模型向用户解释。

### 宿主内置工具（不依赖插件）

| 工具 | 参数 | 说明 |
|---|---|---|
| `system.time` | — | 当前时间/日期/时区 |

联网搜索用 MiMo 原生 `web_search`（见文末）。

## 错误与空态

- 无 API Key：按钮/窗口保持可用但发送前提示去设置填写，不发起请求。
- 麦克风不可用/被占用：入口旁 danger 图标 + Tooltip；恢复后消失。
- ASR 失败：该条语音气泡保留，声纹 + shimmer 可重试；不阻塞后续文字对话。
- TTS 失败：该条消息旁一次轻提示，可重试；文字完整保留。
- 工具调用了不存在的插件：错误回给模型，由模型自然语言说明。
- 流式输出中用户点停止：中止请求，保留已生成内容（无额外解释文字）。

## 设置入口

- 打开宿主设置页（三条路径，覆盖三种输入方式）：**桌面空白右键 →「设置」**（鼠标）；`Ctrl+,`（键盘）；长按桌面空白 → 编辑工具栏「设置」（触控）。
- 设置页顶部「入口」组：打开 Agent / 复盘 / 插件管理（取代已删除的 dock）。
- Agent 设置（模型/Key/语音/搜索）：窗口头部 `⋯` → Agent 设置。
- **宿主设置不放进 Agent 的 ⋯ 菜单**：Agent 是对话/语音域，宿主设置是启动器域；跨域入口会让“Agent 在控制桌面”的模型错位，也让设置出现第二个不一致的入口（HIG：设置要在一致、可预期的地方；辅助浮层不承载全局目的地）。

## 不做

全屏形态、面板形态切换、人脸/摄像头、唤醒词与常驻监听、机器人形象、多用户、长期记忆向量库、插件自定义提示词、Agent 自主后台任务。

## 联网搜索：用 MiMo 原生能力

- 用 MiMo 自带的 `web_search` 工具：请求里加 `{"type":"web_search","max_keyword":3,"force_search":false,"limit":1}`，与函数工具混用，`tool_choice: "auto"`。
- 来源来自响应 `message.annotations`（`url_citation`），按 Fluent 2 的来源 chips 展示。
- **需要先在 MiMo 控制台 → 插件管理开通 Web Search Plugin**；未开通时接口返回 400，窗口内映射成可读提示。
- 设置项：联网搜索开关（默认开）、`max_keyword`（默认 3）、`force_search`（默认关）。
- 不做：自建搜索/抓取 Provider、内置浏览器、深度爬虫、多轮检索策略。

## 验收

- 交互/动效/颜色/焦点见 [AGENT-SURFACE-CONTRACT.md](../AGENT-SURFACE-CONTRACT.md) §11、§14 与 v0.3.0 回归报告；音频链路、上下文零音频、天气 3×2 由独立 verifier 用 CDP + 真实 release 复核。
- v0.3.7 语音优先验收：`scripts/verify-agent-voice-first.mjs`（headless Edge + 假麦克风 + `?mock=1`）覆盖「入口→半高语音窗并录音 / 空格语音回合后不进入 chat / 回答后空格再次录音 / 半高窗无输入框 / 全高输入区单行 / 焦点与 Esc 语义 / 录音中禁用与取消 / reduced-motion / console error 0」；既有 `scripts/verify-agent-surface.mjs`、`scripts/smoke-v031-ui.mjs` 同步适配新语义；证据 `shots/v037-dev/`。
- v0.3.1 修订的验收脚本：`scripts/smoke-v031-ui.mjs`（headless Edge + 假麦克风；右键菜单、设置页、half-height 控制条/peek/展开、朗读开关持久化、录音中收起停麦），A–H 24/24 PASS、console error 0。
