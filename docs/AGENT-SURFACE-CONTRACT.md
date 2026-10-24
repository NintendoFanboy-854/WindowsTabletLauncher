# Agent 浮空界面与语音契约（v0.3.0 实施用）

> 这是 v0.3.0 的实现口径。**v0.3.7 的语音优先修订见 §14**：半高窗改为「纯语音」形态、
> 语音回合结束后不再自动升级到全高、空格默认永远是按住说话；与本文 §1/§2/§3/§8 冲突处
> 以 §14 为准（§8 的 `SurfaceStage` 已同步更新）。
>
> 设计取自用户明确要求 + `docs/reference/APPLE-HIG.md`（§5 层级与模态、§5.1 关闭语义、§9 动效、§13.2 sheet detent 思想）+ `docs/FLUENT2.md`。
> 实现完成后本文并入 `docs/components/agent.md` 与 `docs/DESIGN.md`。

## 0. 范围

- Agent 只有浮空形态：右下角入口按钮 → 半高输入窗 → 全高浮栏（三段，同一容器变形）。
- 删除：全屏语音页、面板形态（overlay/sidebar/fullscreen）设置、人脸唤醒、dock、机器人头像/图标、旧 continuous/autoPlay 播报状态机。
- 语音：点按/空格**立即录音**（不是先开窗再录）；音频原生发 MiMo 对话，事后 ASR 转文字入库；上下文/存储只留文字；语音消息用声纹 + shimmer 呈现，不写文字标签。
  **v0.4.5 起形态顺序反转**：录音在折叠态完成（录音胶囊），**转写回来才展开**半高语音窗（§18）。
- 天气 3×2 三带式重排（另见天气任务，不在本文）。

## 1. 三段形态

> **v0.4.2 几何修订**：三态统一到桌面栅格。锚点 = 网格右下角 `(1418, 914)`，安全距 **0**
> （`AGENT_GRID_SAFETY = 0`，入口右缘/下缘与网格右缘/下缘齐平）；1440×960 下即 right 22 / bottom 46。
> 收敛态 56×56 圆（`borderRadiusCircular`），语音窗 516×340、对话面板 516×868
> （3 列宽 / 2 行高 / 5 行高，见 `agent/ui/entryGeometry.ts` 的算式）。三态只变宽高，
> 锚点与圆角规则：orb 圆形、展开后 `borderRadius2XLarge`(12)。
>
> **入口偏移只用一个口径**：安全距 0 是**相对网格轴**的（锚点就是网格右缘 1418 / 下缘 914，
> 不内缩）。CSS `right: 22` / `bottom: 46` 只是因为网格自身的右/下留白就是 22 / 46
> （`gridInsets` 由严格居中的 `gridOrigin` 派生：1440 − 1418 = 22、960 − 914 = 46）。
> 不存在「视口 right 20」的第二种口径；若写成视口 20，orb 右缘会到 1420、越过网格右缘 2，三态也不再共锚点。

| 阶段 | 尺寸（1440×960） | 表面/层级 | 内容 |
|---|---|---|---|
| collapsed（Agent 入口 orb） | 56×56 | surface1 + stroke2（hover stroke1）+ shadow8 + Circular | `ChatSparkle20Regular` 品牌色图标；无文字、无机器人、无麦克风 |
| voice（半高纯语音窗） | 516×340 | 72% surface1 + blur（`--wtsl-material-blur`）+ stroke2 + shadow64 + 圆角 12 | 顶部：⌃ 展开对话 / 朗读开关 /（播报中）停止朗读 / ✕ 关闭；中部：**最近 2 条**消息的 peek（底部对齐、顶部渐隐，整块可点/Enter 展开；无消息时 ChatSparkle 空态）；底部：进行中状态行（`正在思考…` / `正在调用工具：<名>` / `正在生成…` + 已用秒数 + 停止生成）→「点击说话」主按钮 / 录音条；录音/转写时中部换成声纹带，peek 与展开暂隐 |
| chat（全高对话面板） | 516×868 | 同材质 + stroke2 + shadow64 + 圆角 12 | 头部：[ChatSparkle 小标] + 右侧 朗读开关（常驻）/（仅播报中）停止朗读 / ⌄（收起到语音窗）/ ⋯ 菜单 / X（关闭）；消息列表；底部同一输入组件（不重挂） |

- 内衬统一 16（`spacingHorizontalL` / `spacingVerticalL`），面板内元素间距 8（`spacingHorizontalS`）。
- **半高 peek 容量 = 2 条**（v0.4.2 收口）：340 − voiceTop 56 − voiceDock 92 ≈ 192 可用；一条满 3 行气泡
  = 3 × `lineHeightBase300`(20) + 2 × `spacingVerticalXS`(4) = 68；2 条 + 间距 8 = 144 放得下，
  3 条 + 2 × 8 = 220 放不下（第 3 条会落进顶部 22% 渐隐里被裁）。所以实现与本文都写「最近 2 条」，
  不再有一个「3 条」的并列口径。
- 展开后必然覆盖右侧几列卡片：靠 `shadow64` + 72% 材质表达"临时浮层"，而不是把卡片压在实色板下。
- 不做全屏、不做侧栏让宽、不做 dock。桌面其它 chrome 不变（页码点、编辑工具栏）。

## 2. 手势 / 键盘 / 焦点 / 关闭语义（可预测性）

| 动作 | 结果 |
|---|---|
| 点入口按钮（触控 / 笔） | **立即开始录音**，**不展开面板**（v0.4.5，§18）；按住 <300ms 松手 = 锁定继续录（再点一下结束），≥300ms 松手 = 结束；结束 → 转写 → **转写回来才展开**半高语音窗 |
| 点入口按钮（鼠标 / 键盘） | 保持旧手感：立即开始录音并展开半高语音窗（录音条在面板里） |
| 按住空格（无修饰键、焦点不在 input/textarea/button/菜单/dialog/iframe、非输入法组合、非 auto-repeat） | 立即开始录音（**不展开面板**）；松开 ≥300ms = 结束 → 转写 → 转写回来才展开；<300ms 或失焦 = 取消 |
| 录音中 Esc | 取消录音，停留在 composer（可改文字）；再 Esc 收起为按钮 |
| composer：⌃ 展开对话 | 进入 chat，焦点到输入框；录音/转写中禁用（不给“看起来能展开但没结果”的死路） |
| composer：Esc / 点外部 | 收起为按钮，草稿保留（HIG popover：点外关闭必须保存工作） |
| composer：录音中 X / 点外部 | 先取消录音再收起：不能留下没人能停的麦克风在后台 |
| composer：转写中 X | 收起后转写完成不再自动弹回 chat（关闭就是关闭；结果仍保存，展开可见） |
| composer：peek 区域点击 / Enter / 空格 | 展开到 chat（半高窗不是死路，不需要先发一条消息才能升级） |
| chat：朗读开关（常驻） | 切换自动朗读总开关 `tts.autoRead`，立即持久化；切换时先停当前播报 |
| chat：⌄ | 收起到语音窗（**不是关闭**）：草稿、会话、正在进行的生成都不丢 |
| chat：X / Esc / 点外部 | 统一为**关闭**（收成 orb）：三条退出路径同一语义（HIG §5.1）；只改形态，不中断生成、不清草稿 |
| chat：播放中 | 显示临时「停止朗读」；不播放时该按钮不渲染（状态控件常驻、动作控件按需出现） |
| 生成中（两态） | 一条进行中状态行：`正在思考…` / `正在调用工具：<名>` / `正在生成…`，右侧已用秒数（从发出到首 token、一直到结束），**忙时才有**、回 idle 即卸载 |
| 生成中（voice） | 状态行右侧给「停止生成」= `session.stop()`；停止后气泡元信息显示「已停止」，回到可输入态（提示 + 「点击说话」恢复可用），**半高形态不塌陷** |
| 生成中（chat） | 状态行只给状态与秒数；停止动作由输入区同一个「停止生成」承担（一屏只有一个停止入口） |
| 发送（打字 Enter / 语音结束） | 自动 morph 到 chat；只此一种自动升级，不自动收起 |
| 关闭/收起后焦点 | 回到入口按钮；展开后焦点到输入框；chat 收起后焦点到 composer 输入框 |

- 按钮 56×56（≥44 触控）；所有图标按钮 ≥44×44，带 Tooltip；无隐藏手势、无双击语义。
- 禁用态必须可见（发送按钮空内容时 outline+禁用，不隐藏）。
- 状态与操作分离：常驻控件只表达**状态**（朗读开/关，用图标 + aria-pressed），临时控件只在**动作可用**时出现（停止朗读、展开在转写中禁用）；不出现“只有播放时才凭空冒出的语音控件”。

## 3. 动效（只用 motionTokens；无自定义曲线/弹簧/模糊）

| 过渡 | 时长 / 曲线 | 内容编排 |
|---|---|---|
| button → voice | 200ms `durationNormal` / `curveDecelerateMid` | 图标 100ms 淡出；内容 150ms 淡入（delay 100ms） |
| voice → chat | 200ms `durationNormal` / `curveDecelerateMid` | 只改高度（同宽），两个内容层各自按固定尺寸排版，只有 opacity 交叉 |
| chat → voice | 200ms `durationNormal` / `curveAccelerateMid` | 消息层 100ms 淡出，几何同时收回 |
| voice → button | 200ms `durationNormal` / `curveAccelerateMid` | 内容 100ms 淡出，图标 150ms 淡入（delay 100ms） |
| chat → button（X） | 200ms `durationNormal` / `curveAccelerateMid` | 内容 100ms 淡出后收几何 |
| shadow | 同一过渡 | shadow8（orb）↔ shadow64（浮层） |
| 按压 | 100ms `durationFaster` | 仅 orb：scale 0.98 + surface pressed；悬停仅鼠标：surface hover + stroke1，无 hover 缩放 |

- 三态共享同一右下锚点：展开/收起**无位移**，只有宽高在动（container transform）。
- 内容层固定尺寸（不随外框伸缩）：切换形态不重排消息、不重置滚动位置。
- `prefers-reduced-motion: reduce`：只保留 opacity（`durationUltraFast`），无尺寸/阴影/位移动画；声纹/脉冲不动。
- 录音/转写/播报的持续动画都带 `data-wtsl-agent-animated`，reduced-motion 下统一关闭（沿用 agent.css 现有约定）。

## 4. 颜色 / 字体 / 图标

- 只用 Fluent token，不写 hex、不做渐变/发光；orb 用实底表面；语音窗/对话面板沿用 widget 卡的
  72% 中性面 + 单一模糊 token（`--wtsl-material-blur`），与卡片同一套材质语言。
- 入口（Agent 入口 orb）：常态 `colorNeutralBackground1` + `colorNeutralStroke2` + shadow8；图标 `colorBrandForeground1`；hover `colorNeutralBackground1Hover` + `colorNeutralStroke1`；pressed `colorNeutralBackground1Pressed`；focus `colorStrokeFocus2` 2px（`strokeWidthThick`）。品牌色只在动作发生时出现（录音、发送、焦点、链接），orb 不用实心 accent。
- 窗口：`colorNeutralBackground1` + `colorNeutralStroke2`；输入区内嵌 `colorNeutralBackground2`，靠明度分组不画线；焦点环 `colorStrokeFocus2`。
- 气泡：用户 `colorBrandBackground2`；助手 `colorNeutralBackground2`；工具卡 `colorNeutralBackground3`；时间/元信息 `colorNeutralForeground3`。
- 语义色只用于错误/警告图标与 tooltip，不做装饰。
- 字体：输入 400（16/22）、消息正文 300（14/20）、元信息 200（12/16）；无大标题、无模型 badge、不出现工程术语。
- 图标：入口/品牌标记 `ChatSparkle20Regular`；语音动作 `SoundWaveCircle20Regular`；发送 `SendRegular`；收起 `ChevronDown20Regular`；展开 `ChevronUp20Regular`；关闭 `DismissRegular`；更多 `MoreHorizontal20Regular`；朗读开/关 `Speaker2Regular` / `SpeakerMuteRegular`。**全项目删除 `Bot*` / `Person*` 头像与机器人图标**。

## 5. 语音交互（入口即录）

- 录音 UI：composer 中部变成声纹带（Waveform 复用/重写）：品牌色 `colorBrandBackground2` 底、实时电平条 `colorBrandForeground1`；右侧停止方块（主操作）+ 取消 X；无“正在聆听”等文字。
- 状态：`idle → recording → transcribing → (发送后) streaming → speaking`；录音开始时立即开始，不等界面。
- 转写中停在 composer，声纹收敛为静态；转写完成后进入 chat（或已在 chat 就地显示）。
- 播报：总开关 `tts.autoRead`（默认开）关闭后，语音/文字回答都不自动读，手动点单条朗读仍可用；开启时语音提问必读、文字提问按 `tts.readTextReplies`（默认关）。播报中：消息元信息旁的声纹图标在动，点它停止；头部显示「停止朗读」；收起/关闭窗口、开始新一轮录音、发送新消息都先停止播报。
- 兼容 mock：`?mock=1` 下录音仍可走假麦克风，ASR 返回固定文字。

## 6. 语音消息呈现（无文字标签）

- `Message` 增加 UI 字段：`input: 'voice' | 'text'`、`voicePeaks?: number[]`（12–24 个 0..1 桶）、`voiceDurationSec?: number`、`transcriptStatus?: 'pending' | 'ready' | 'failed'`。这些字段只给 UI，**不进入模型请求**。
- 用户语音气泡与打字气泡同形同色；气泡顶部渲染**声纹装饰**：竖条高度来自 `voicePeaks`，品牌色低透明度；转写未回时竖条轻微起伏 + 两行 shimmer 骨架（不写字）；ASR 回填后文字 150ms 淡入、声纹静止。
- 不加“语音 / 转写结果如下”等文字；`aria-label` 用屏幕阅读器文本（如“语音消息：帮我看看待办”）即可。
- 助手消息：去掉头像与机器人；身份只由入口/头部的 ChatSparkle 承担。

## 7. 音频与上下文（硬约束，v0.3.5 起）

1. 每段语音只上传一次：当前轮 user 消息以 `input_audio` 原生发 MiMo chat（`data:audio/wav;base64,…`，仅此一轮）。
2. 发请求前先等 ASR 转写（最多 8s，D-28）：转写文本与音频一起进同一轮请求（文本决定工具调用，音频保留语气）。
   转写超时才退回纯音频请求；晚到的转写仍会对状态类短语补执行一次。
3. 同一份 WAV 只送一次 ASR（`mimo-v2.5-asr`）；音频 Blob 用完即弃。
4. 音频不写 localStorage、不进 Message、不进后续请求；重试/切会话/重启都不再上传音频。
5. 历史：ASR 文字作为 user 消息内容进入后续上下文；转写失败时该条用 `（用户发来一段语音）` 文字占位（仅上下文，不上屏）。
6. `normalizeMessage` 丢弃一切未知/音频字段；`message.voicePeaks` 等 UI 字段允许持久化（纯数字，不含音频）。
7. 状态短语直通（D-28）：插件工具声明 `phrases`，用户整句命中时宿主先执行工具、结果作为 tool call 交给模型；
   模型只回一句短确认。这条保证“说了就记录”，不依赖纯音频的 function calling。
8. 真机冒烟：`scripts/smoke-mimo-audio.mjs`（读 public/secrets.json，TTS 合成→chat 音频输入→ASR 回读）必须通过。

## 8. Session 接口契约（W1 UI 依赖 W2 实现，必须一致）

```ts
export type TurnStatus = 'idle' | 'streaming' | 'tools';
export type SurfaceStage = 'collapsed' | 'voice' | 'chat'; // 仅 UI 持有；v0.3.7 起 composer → voice

export interface AgentVoiceState {
  stage: 'idle' | 'recording' | 'transcribing';
  level: number;          // 0..1 实时电平
  durationSec: number;    // 本次录音时长
  error: { kind: 'mic' | 'asr'; message: string } | null;
  speechError: string | null; // TTS 失败（一次性提示，dismissSpeechError 清除）
}

export interface AgentSession {
  settings: AgentSettings;
  updateSettings(patch: SettingsPatch): void;
  conversations: Conversation[];
  conversation: Conversation | null;
  status: TurnStatus;
  error: AgentSessionError | null;
  voice: AgentVoiceState;
  speakingMessageId: string | null;
  isMock: boolean;
  configured: boolean;
  toolBindings: ToolBinding[];
  /** 打字发送（无音频） */
  send(text: string): Promise<void>;
  /** 开始录音；已在录音/转写时忽略 */
  startRecording(): Promise<void>;
  /** 结束录音：先等 ASR 转写（≤8s），再发音频 + 转写文本；状态短语先执行工具 */
  stopRecording(): Promise<void>;
  /** 取消录音（不发送、不留消息） */
  cancelRecording(): void;
  stop(): void;
  retry(): Promise<void>;
  dismissError(): void;
  dismissSpeechError(): void;
  newConversation(): void;
  selectConversation(id: string): void;
  deleteConversation(id: string): void;
  /** 单条朗读/停止切换；失败写入 voice.speechError */
  speakMessage(messageId: string): void;
  stopSpeaking(): void;
}
```

- `useAgentSession` 返回值必须与上面完全一致；`AgentSurface` 组件 props：
```ts
interface AgentSurfaceProps {
  transport?: AgentTransport;
  seed?: AgentSeed;
  open?: boolean;                  // 受控打开 chat（设置页「打开 Agent」用）
  onOpenChange?: (open: boolean) => void;
  hideEntry?: boolean;             // 无桌面入口时（如设置页内的实例）
  defaultSettingsOpen?: boolean;   // 截图/验证
}
```
- UI 不直接碰 transport / recorder / ttsPlayer。

## 9. Message / Settings schema 变更

```ts
// types.ts
interface Message {
  id: string; role: 'user' | 'assistant' | 'tool'; content: string; createdAt: string;
  status?: 'streaming' | 'done' | 'error' | 'aborted';
  reasoning?: string; sources?: SourceRef[]; webSearchUsage?: ...;
  toolCalls?: ToolCallRecord[];
  input?: 'voice' | 'text';
  voicePeaks?: number[];
  voiceDurationSec?: number;
  transcriptStatus?: 'pending' | 'ready' | 'failed';
}

interface AgentSettings {
  model: MimoModel;
  thinking: boolean;
  tts: { readTextReplies: boolean; voice: string; rate: number }; // 删 autoPlay/continuous
  search: {...};
  mimo: {...};
  // 删除 panelMode / face
}
```
- 旧数据迁移：`readTextReplies = old.tts.autoPlay === true`（continuous 被语音模式强制写 true，不迁移）；`panelMode='fullscreen'` 忽略（surface 自己三段）；`face` 丢弃。
- `ChatRequestMessage.user.content`: `string | Array<{type:'input_audio';input_audio:{data:string}} | {type:'text';text:string}>`；只有“本轮语音”这一条用数组，其余全部 string。

## 10. 文件归属

- W1 `agent-surface`：`src/host/agent/ui/**`（重写 AgentPanel→新 surface、Composer、MessageBubble、MessageList、删除 VoiceStage/ConversationPane、改造 Waveform、SettingsDialog、agent.css）、`src/host/agent/index.ts`、`src/host/App.tsx`、`src/host/shell/useGlobalShortcuts.ts`、`src/host/desktop/{EditToolbar,Desktop}.tsx`、`src/styles.css`、`src/host/pages/settings/SettingsPage.tsx`。
- W2 `voice-pipeline`：`src/host/agent/hooks/**`、`transport/**`、`voice/**`、`settings.ts`、`types.ts`、`storage.ts`、删除 `face/**`、`models/**`、`ui/FaceSetup.tsx` 以外的人脸文件（重复项归 W2：`hooks/useFaceState.ts`、`face/`、`models/`）；`scripts/smoke-mimo-audio.mjs`。
- W3 `weather-fix`：`public/plugins/weather/**`、`docs/components/weather.md`、`docs/DENSITY.md`、`scripts/verify-widgets.mjs`。
- Lead：`package.json`、`docs/VISION.md`、`docs/DECISIONS.md`、`docs/DESIGN.md`、`docs/components/agent.md`、`docs/PLAN.md`、`docs/RELEASE*`、版本号、release 构建。
- W4 `verifier`：`scripts/**`（新增 verify-agent-surface / 修改 cdp 假麦克风）、`shots/v030-final/**`。

## 11. 验收清单（W1/W2 自查，verifier 复核）

1. 右下角只有一个 56×56 圆角按钮；无 dock、无机器人、无麦克风图标。
2. 点按钮/按空格 = 立即录音（不是先开窗再点录音）；录音中 Esc 取消；发送后 morph 到 chat。
3. 三段 morph 时长/曲线符合 §3，reduced-motion 只有淡入淡出。
4. Esc/⌄/X/点外部的语义符合 §2；焦点回到该回的位置；草稿保留。
5. composer 顶部有展开对话 + 朗读开关 + 关闭；peek 可展开；录音中关闭会取消录音；转写中关闭不自动弹回。
6. chat header 不播放时也有朗读开关；「停止朗读」只在播报中出现；开关状态持久化到 `tts.autoRead`。
7. 桌面空白右键能打开「打开 Agent / 编辑桌面 / 设置」；Agent ⋯ 菜单不含宿主设置入口。
8. 语音气泡无声纹以外的文字标签；转写 shimmer→文字；`localStorage`/网络后续请求无音频。
9. 总开关关闭后语音/文字回答都不自动播报；单条播报可停；收起/关闭即停。
10. `tsc --noEmit` 通过；mock 下可走完整录音→转写→回答链路（假麦克风）。
11. 天气 3×2 无 166px 横向空洞；内容带 ≥70%；1024/1440 不裁切（W3）。

## 12. 实现备注（v0.3.0 落地时确认）

- **动效时长一律取 Fluent 2 的 duration token，契约不设毫秒级数值验收**：任何过渡的时长都取 `motionTokens`
  的 `durationUltraFast/Faster/Fast/Normal/Gentle/Slow`，任何过渡的曲线都取 `motionTokens` 的 `curve*`；
  契约不再给出、也不再比对毫秒数值，reduced-motion 分支同样只引用 token 而不写字面时长。
  视觉验收只看 duration/curve token 是否被正确引用（引用错档、写死毫秒、自造曲线三者都算不通过）。
  方向不变：展开 decelerate、收回 accelerate。
- **图标命名**：`@fluentui/react-icons` 根导出为无编号名（`ChatSparkleRegular` / `SoundWaveCircleRegular` /
  `MoreHorizontalRegular`），按 `fontSize={20}` 使用；视觉规格同 20px 图标。
- **图标尺寸**：入口按钮内 20px；消息元信息 16px；均 ≥44×44 命中区。
- **composer 位置**：composer 与 chat 共用同一个贴底输入组件（共享元素不重挂）；录音/转写时声纹带在输入窗中部。
- **键盘守卫**：空格/ Esc 仅在「不在输入控件、不在外部 dialog/menu、不是其它按钮」时生效；**入口按钮本身放行**
  （焦点回按钮后仍可按住空格说话）。实现见 `AgentSurface.canUseVoiceKeys`。
- **转写态**：ASR 通常 <1s，不显示 spinner（FLUENT2 wait-ux 1s 阈值），声纹静止；超过 1s 由后续版本补。
- **入口按钮 hover**：只变 surface/shadow，不做 hover 缩放；按压 0.98（reduced-motion 取消）。
- **机器人清理**：`Bot*`/`Person*`/`Avatar`/`Mic*` 图标、模型 badge、解释性状态文字均已从 Agent UI 移除；
  身份只由 ChatSparkle 承担。
- **生成中的等待态文案是例外（v0.4.2）**：`正在思考…` / `正在调用工具：<名>` / `正在生成…` 属于
  `wait-ux.md:38` 与 `FLUENT2.md:161` 要求的**响应指示器**（AI 对话必须立即出现、>3s 给明确状态），
  不是「解释性状态文字」；它们只在忙时存在、回 idle 即卸载，且不写原因与建议。

## 13. v0.3.1 修订（用户反馈：半高窗死路 / 不能默认静音 / header 空 / 鼠标进不了设置）

- **半高窗补出口**：顶部控制条（⌃ 展开 / 朗读开关 / ✕ 关闭）+ **最近 2 条**消息 peek（340 高容量，v0.4.2 由 3 改 2）；录音/转写时这两块暂隐，
  展开按钮禁用。理由：半高窗不再必须“先发一条消息”才能升级，也不会只有一条渐隐预览可看。
- **关闭即结束**：录音中收起先 `cancelRecording()`；转写中收起后 `suppressVoiceReveal` 阻止 ASR 完成时把窗口
  弹回 chat。旧行为是“关闭只改布局”，会留下后台录音 / 覆盖用户关闭意图。
- **播报状态常驻**：chat header 与 composer 顶部都有朗读开关（`tts.autoRead`，默认开）；「停止朗读」只在播报中
  出现。旧行为把唯一的语音控件放在“播放中才出现”，导致不播放时看起来没有语音能力。
- **设置入口的层级**（详见 DECISIONS D-23）：Agent ⋯ 菜单只保留 Agent 自己的设置，**不**加入宿主的
  「桌面设置」。宿主设置入口 = 桌面空白右键菜单「设置」/ `Ctrl+,` / 触控长按空白 → 编辑工具栏「设置」。
  桌面右键菜单同时提供「打开 Agent」「编辑桌面」，用 Fluent Menu 的虚拟 target 定位（Portal，无 MenuTrigger）。
- **鼠标路径**：桌面空白处右键 = Windows 桌面惯例；不再要求用户先知道 Ctrl+, 或长按空白。触控长按语义不变。
- 验收：`scripts/smoke-v031-ui.mjs`（headless Edge + 假麦克风）A–H 全 PASS（24/24，console error 0）；
  `tsc --noEmit` 通过；截图 `shots/v031-dev/`。

## 14. v0.3.7 修订（语音优先：半高窗不再自动升级）

> 背景（用户反馈）：按住空格或触屏点入口后，语音回合结束会「半高 → 全高」自动展开；但用户期待的是
> **连续语音对话**，文字对话只是兜底。半高窗里还留着文字输入框（应纯语音）；自动展开又把焦点塞进
> 输入框，导致回答完后**再按空格打出的是空格**；全高输入区还分两行（输入一行、按钮一行），一行放得下。
> 三个问题同源：把「语音」当成填满文字对话的一种输入方式，而不是独立、可停留的对话形态。

### 14.1 三段形态（`composer` 更名 `voice`）

| 阶段 | 尺寸（1440×960） | 内容 | 进入 / 退出 |
|---|---|---|---|
| `collapsed` Agent 入口 orb | 56×56（Circular） | `ChatSparkle20Regular`（录音态换成 `SoundWaveCircleRegular` + 品牌底） | 触控/笔点按或按住空格 → **留在本层立即录音**（出现录音胶囊，§18）；录音结束、转写回来 → `voice`；鼠标点按仍先展开再录 |
| `voice` 半高纯语音窗 | 516×340（3 列 × 2 行） | 顶部：⌃ 展开对话（录音/转写中禁用）/ 朗读开关 /（播报中）停止朗读 / ✕ 关闭；中部：**最近 2 条**消息 peek（底部对齐、顶部渐隐；点击或 Enter 展开，空格=说话）；底部：进行中状态行（思考 / 调用工具 / 生成 + 已用秒数 + 停止生成）→ **「点击说话」大按钮**（全宽、primary、`size=large`）或录音条（声纹 + 取消 X + 停止 ■）。**没有文字输入框。** | 显式 ⌃ / 点 peek / Enter → `chat`；Esc / ✕ / 点外部 → `collapsed`（录音中先取消）；语音回合结束**留在本层** |
| `chat` 全高对话面板 | 516×868（3 列 × 5 行，顶边落网格上缘 46） | 头部：ChatSparkle + 朗读开关 /（播报中）停止朗读 / ⌄ 收起到语音窗 / ⋯ 菜单 / ✕ 关闭；消息列表；底部**单行输入区**：`[语音] [输入框] [发送]`（录音/转写时整行换成声纹条） | ⌄ → `voice`（不是关闭）；✕ / Esc / 点外部 → `collapsed`（同一关闭语义）；发送文字/语音回合**留在本层** |

- **不再有自动形态升级**。`open` 受控入口（设置页「打开 Agent」/ `?agent=1`）仍打开 `chat`。
- 半高语音窗是「语音对话的家」：回答会被朗读（`tts.autoRead` 开时）并显示在 peek 里，用户可立即再按住
  空格/点「点击说话」继续下一轮；想读历史或打字时再显式展开。

### 14.2 空格 / 焦点（edge corner 口径）

| 场景 | 结果 |
|---|---|
| 默认焦点（body / surface 容器 / 消息区 / 入口按钮 / 「点击说话」/ peek）按住空格 | 立即录音；松开 ≥300ms 发送，<300ms 或失焦取消 |
| 光标在输入框 / textarea / contenteditable 内 | 空格是打字，**不**录音（文字兜底模式，用户主动点入才成立） |
| 焦点在其它按钮 / 链接 / 菜单 / 对话框 | 不劫持空格（保留原生激活语义） |
| 带 Ctrl/Alt/Meta/Shift 的空格、输入法组合中、auto-repeat | 不触发 |
| 任何展开 / 收起 / 语音回合结束 / 播放结束 | **绝不自动聚焦输入框**；焦点放在 surface 容器（开/换层）或入口按钮（收起） |
| 输入框获得焦点后按 Esc | 第一次 Esc 只退出输入框（焦点回容器）；再按 Esc = 关闭（与 ✕ / 点外部一致） |

- 这条修复的直接 bug：旧实现 `语音结束 → 自动展开 chat → 自动聚焦 textarea`，用户再按空格就把空格
  打进输入框。现在「语音结束」不换层、不聚焦输入框，空格默认永远是按住说话。
- 录音 / 转写中：⌃ 与 ⌄ 禁用、音频回合不叠新录音；✕ / 点外部收起时先 `cancelRecording()`；
  转写结果仍保存，不会再把窗口弹回来。窗口失焦 = 取消录音（不能留没人能停的麦克风）。
- 播报中：开始录音先 `stopSpeaking()`；收起 / 关闭窗口立即停播；两个形态的顶部都有常驻朗读开关，
  「停止朗读」只在播报中出现。

### 14.3 全高输入区：单行

- 一行三控件：`[SoundWaveCircle20Regular 语音] [Textarea 自动增高 ≤3 行] [SendRegular 发送]`，
  空内容时发送按钮保持可见禁用态（outline + disabled，不隐藏；生成中换成「停止生成」）。
- Enter 发送 / Shift+Enter 换行；`?mock=1` 下文字链路可用。草稿在 `chat → voice → chat` / `chat → collapsed → chat`
  之间一律保留（Composer 常驻不卸载，切层只切容器宽高与可见性；`MessageList` 也不再重挂，
  滚动位置不重置）。

### 14.4 设计规范（FLUENT2 强约束 + HIG 取舍启发）

- **只用 Fluent 2 设计 token**：颜色（`colorNeutral*/colorBrand*/colorStatus*`）、字号（type ramp token）、
  间距（`spacingHorizontal*/spacingVertical*`）、圆角（`borderRadius*`；orb `borderRadiusCircular`、
  展开后 `borderRadius2XLarge` 12）、阴影（`shadow*`；orb `shadow8`、浮层 `shadow64`）、
  动效（`motionTokens`）。不写 hex、不自造毫秒/曲线/间距；触控目标 ≥44×44；
  图标只用 Fluent System Icons 的 Regular 尺寸 16/20/24。主操作（点击说话）用 primary 样式，
  次操作（展开 / 朗读 / 关闭）用 subtle 图标按钮，命令式文案不加句号。
- **HIG 启发（不照搬 iOS 组件）**：
  - *从哪来、回哪去*（HIG §5）：窗口永远从右下角入口长出、原路收回；关闭后焦点回入口按钮；
    进入方向定义出场方向（§9）。
  - *关闭语义一致*（§5.1）：✕ / Esc / 点外部 = 关闭（收成 orb），三条路径同一语义；
    ⌄ = 收起到语音窗，**不是关闭**，不中断正在进行的生成。
  - *渐进披露*（§7）：半高只给最近 2 条 peek + 顶部渐隐暗示还有更多；完整历史/文字输入在显式展开后。
  - *sheet detent 思想*（§13.2）：半高先出现、可展开全高；半高本身是可持续停留的形态，不是过渡态。
  - *减少动效*（§9）：reduced-motion 下只保留 `durationUltraFast` 的透明度，无尺寸/阴影/位移。

### 14.5 验收

- 新脚本 `scripts/verify-agent-voice-first.mjs`（headless Edge + 假麦克风）：入口→voice+录音；空格语音回合
  后**观测不到 chat**；回答后空格再次录音；voice 窗 textarea=0；chat 输入区单行（三控件同轴、高度紧凑）；
  展开/收起/Esc/点外部/焦点/录音中禁用/取消录音；reduced-motion；console error 0。
- 既有 `scripts/verify-agent-surface.mjs`、`scripts/smoke-v031-ui.mjs` 已按新语义更新（stage 名、
  不再自动 upgrade、无输入框的半高窗、单行 composer、焦点断言）。
- 证据目录：`shots/v037-dev/`（截图 + JSON + REPORT.md）。

## 15. v0.4.0 修订（半高窗 idle 视觉锚点）

> 背景：v0.3.7 的半高语音窗在 idle 态中部只有 24px `ChatSparkle`，420 × clamp(320px,44vh,440px) 窗口大面积空白；
> 用户反馈"素"。`MOTION.md §6` 明确禁止循环呼吸/粒子/视差/自造时长，因此用**静态构图**而不是动效填。

### 15.1 idle 静态 voice mark

- voice 段空态（无 peek 消息）中部：96px 圆形容器（`borderRadiusCircular`、`colorNeutralBackground2` 底、
  `strokeWidthThin` `colorNeutralStroke2` 边）+ 40px `ChatSparkleRegular`（`colorBrandForeground1`）；
  外层 132/168px 两层 `colorNeutralStroke3` 细环，绝对居中、不占布局、不裁切。
- dock 内加 `Text size={300}` 提示「说点什么，或按住空格」（14px、`colorNeutralForeground3`、无句号）；
  「点击说话」按钮保留 `aria-label="开始语音"`，并用 `aria-describedby` 关联该提示；移除原 Tooltip（提示常驻更可发现）。
- 空态关闭 peek 顶部渐隐 mask（`mask-image: none`），有消息时恢复原渐隐。
- **不新增任何动画时长/曲线、不做循环呼吸/脉冲**；idle→recording 仍只切换现有 `VoiceCapture` 声纹。

### 15.2 契约不变

- voice 段无 textarea；顶栏 ⌃/朗读/✕（✕ 的 `aria-label` 与全高一致为「关闭 Agent」）；peek **最近 2 条**（340 高容量，见 §1）；底部「点击说话」+ 进行中状态行；录音时声纹替换；焦点/Esc/关闭语义同 §14.2。
- 验收：`scripts/verify-agent-surface.mjs` 127/127 PASS；`scripts/verify-agent-voice-first.mjs` 断言层全 PASS
  （198/200，2 条 FAIL 为并发环境 Edge teardown 竞态）；`npm run typecheck` exit 0。决策记录见 DECISIONS D-35。

## 16. v0.4.2 修订（轮次卡 / 等待态 / 半高行内 Markdown / label 统一）

> 背景与依据：`wtsl-agent-surface-investigation.md`（三态现状地图 + Q1/Q2/Q3 结论 + 两方案对比）。
> 本节只登记**渲染分组**与**等待反馈**，不改 IPC / 消息协议 / 数据字段语义：
> `reasoning` 与 `toolCalls` 仍是同一条 `Message` 的两个字段（§9 不变），`storage.ts` 白名单不变。

### 16.1 轮次卡（Q3 方案 A）

| 项 | 旧 | 新 |
|---|---|---|
| 一条回答的容器 | 工具卡（每工具一个 Accordion）+「还有 N 个工具…」按钮 + 思考 Accordion + 正文 → **三个折叠控件** | 一个轮次卡：**思考 → 工具步骤 → 正文**，只有**一个**折叠控制（HIG §7:113） |
| 顺序 | 工具 → 思考 → 正文（与传输顺序相反） | 思考 → 工具 → 正文（与「每轮内」传输顺序一致） |
| 折叠态 | 每张工具卡各占一行、溢出再折叠 | 一行摘要：`N 个步骤 · <工具名> <状态> <结果一行>`（失败写「失败」+ 错误首行） |
| 展开态 | 参数 + 结果（结果重复一次） | 思考全文 + 每个工具的 参数 / 结果全文 / 错误 + 状态 |
| 失败/重试 | 独立块 | 内联在该轮（步骤行状态 + 气泡元信息） |
| 思考可见性 | 受 `settings.thinking` 全局开关控制（关掉后历史 reasoning 消失、数据还在） | 有 `message.reasoning` 就渲染折叠头；开关只影响**请求**是否带思考 |
| 进行中指示器 | 列表尾部 spinner + 工具卡 spinner（同屏两个） | 一个：轮次卡外的状态行（§16.2） |

- **顺序为什么取「思考 → 步骤 → 正文」**：传输层在每一轮内保证 `reasoning*` 先于 `content*`、
  `content*` 先于该轮 `tool_calls` 的批量 flush（`real.ts:312-319` vs `:346-362`）；多轮正文已被拼进
  同一个 `content`（`useAgentSession.ts:510-522`），真实交错不可还原，所以只承诺「与每轮内顺序一致」，
  不伪造时间线。旧顺序恰好把这个保证倒过来。
- 删除 `ui/ToolCallCard.tsx`（被 `ui/TurnSteps.tsx` 取代）；删除 `TOOL_CARD_LIMIT` 与「还有 N 个工具…」出口。

> **⚠ 本节已被 v0.4.5 取代，下文为历史记录。**「思考 → 工具 → 正文」的聚合轮次卡（`ui/TurnSteps.tsx`）
> 是**数据层被迫的妥协**：它把多轮正文拼进同一个 `content`、把 `tool_calls` 在轮末批量 flush，
> 于是真实的「思考→工具→正文→再思考→再工具」交错不可还原，只能按类型聚合。
> v0.4.5 起改为**按发生顺序的单条时间线**，取代口径见 **§19 轮次时间线（v0.4.5）**；
> `ui/TurnSteps.tsx` 已删除，`ToolCallCard.tsx` 与 `TOOL_CARD_LIMIT` 同样不再存在。

### 16.2 等待与流式反馈（Q2 三档）

| 时机 | 半高（voice） | 全高（chat） |
|---|---|---|
| 发出后、首 token 前 | `正在思考…` + `N 秒` + 停止生成（立即出现，不等 1s） | 轮次卡内同一行（无停止按钮） |
| 工具执行 | `正在调用工具：<工具名>`（`clock.now` 形式）+ `N 秒` + 停止生成 | 同上（无停止按钮） |
| 流式输出 | `正在生成…` + `N 秒`；peek 看**尾部**（跟读最新增量） | 同上；正文末尾 `▍` 光标 |
| 结束/停止 | 行卸载；提示与「点击说话」恢复可用；气泡元信息给「已停止」 | 行卸载；`▍` 消失 |

- 秒数：从 assistant 消息创建时刻（= 发出）算起，每秒刷新，直到本轮结束；对读屏隐藏（避免每秒播报）。
- 停止入口：**voice 一个**（状态行内「停止生成」）、**chat 一个**（输入区同一个按钮）——一屏一个，不重复。
- `data-wtsl-agent-pending="thinking|tool|streaming"` 是验收锚点（DOM 断言用）。
- reduced-motion：Fluent Spinner 自行停动画，文案与秒数仍在（动效不是唯一载体）。

### 16.3 半高行内 Markdown（Q1 最小改动）

- 新增 `ui/PeekText.tsx`：复用 `tokenizeInline`，只输出**行内**元素（粗体 / 行内码 / 链接标签）。
- **不切到 `MessageContent`**：半高是「`-webkit-line-clamp:3` + 顶部 22% 渐隐 + 176px 预算」，
  块级排版（flex 根、26px 标题）与它不兼容（全高的 `parseBlocks` 在 v0.4.3 已支持围栏块与表格，见 §17.1）。
- 围栏代码块降级为**一行等宽片段**（取首行代码，语言标记丢弃），不输出 ``` 本身。
- **块级标记先剥后渲染**（v0.4.3，验证报告 §5-①）：行首 `#{1,6}` / `-*+` / `>` / `1.` 序号、分割线、
  表格分隔行在 `cleanLine` 里剥掉；标题文字保留并加粗（层级还在，只是不再是 26px 大标题）；
  表格行改写成 `单元格 · 单元格`（行与行之间 `；`），列表条目之间 ` · `。
  剥完不产生空行堆积（空行直接跳过），也不留半个符号。
- 裁切：按可见字符预算（84 全角字 = 168 半角单位，约 3 行 × 399px / 14px）在 token 边界截断，
  末尾加 `…`；被截断时清掉行尾残缺标记（`**`、`` ` ``、`[`），界面上不出现半个语法符号。
- 流式中的最新一条（以及结束后仍是最新那条助手回答）走 `tail`：取尾部而非头部，配合 peek 底部对齐实现
  「跟读到底」；更早的条目取头部。结束后不回跳到开头。
- 链接渲染为 `colorBrandForeground1` + 下划线的 `Text`，**不嵌 `<a>`**：peek 是 `role="button"`
  （点击/Enter = 展开对话），嵌套可交互元素会破坏键盘语义；真正可点的链接在展开后的全高对话里。

### 16.4 关闭/收起 label 统一

| 控件 | 旧 `aria-label` | 新 `aria-label` | 语义 |
|---|---|---|---|
| 半高 ✕ | 「收起 Agent」 | **「关闭 Agent」** | 关闭（Esc / 点外部同义） |
| 全高 ✕ | 「关闭 Agent」 | 「关闭 Agent」（不变） | 关闭 |
| 全高 ⌄ | 「收起到语音窗」 | 「收起到语音窗」（不变） | 退一层形态，**不中断生成** |

- 影响：`scripts/**` 里按「收起 Agent」定位的断言全部过期（`verify-agent-surface.mjs:260`；
  `verify-agent-voice-first.mjs:809,1065,1559,1576,1602`；`smoke-v031-ui.mjs:547,609,745-746`）。
  本轮按「不改 scripts」的约束没有改脚本，属**旧断言过期**，不是行为回归。

### 16.5 验收

- `npm run typecheck` / `npm run build`：exit 0。
- headless Edge + `?mock=1` 探针（唯一新增文件在仓库外，见实现报告的 §验证）：28/28 PASS，
  覆盖轮次卡 DOM 顺序、三档等待态（含 `tools` 档真实帧）、停止生成、peek 宽度 416（文本列 400）无溢出与无残缺语法。
- 未做实机像素复核（不安装/不重启 app）：需要发布批在 1440×960 真机上确认状态行与「点击说话」同屏不挤、peek 第 2 条不被渐隐吃掉。

## 17. v0.4.3 修订（判断性复核：5 条观察项 + 空态结构性例外）

> 来源：`wtsl-verify-agent-surface.md` §5 的 5 条观察项 + `wtsl-copy-affordance.md` 的「删过头」自查。
> 判据不是「有没有写说明」，而是「用户能不能一眼看懂能做什么」。本节只登记设计口径，
> 不改 IPC / 消息协议 / 数据字段（§9 不变）。

### 17.1 全高正文补上围栏代码块与表格

| 块 | 渲染 | 依据 |
|---|---|---|
| 围栏代码块 | 等宽块（`colorNeutralBackground3` + `borderRadiusMedium` 内衬）；语言标记 12px fg3（可缺省）；`<pre>` 是唯一的横向滚动容器（`overflow-x:auto`），长行在块内拖、不撑破气泡 | 对话面渲染 Markdown 却不认代码块是硬伤；`iconography`/`typography` 的等宽档位 |
| 表格 | 基础对齐表格：表头 semibold、数据行、`strokeWidthThin` + `colorNeutralStroke2` 底边线；外层 `div` 横向滚动，单元格允许换行 | 表格是 Markdown 的常规块，窄容器用滚动而不是压缩字号 |

- 未闭合围栏（流式中途）同样按代码块渲染，不把 ``` 上屏；解析器仍是本文件内的 `parseBlocks`，不引第三方依赖。
- 取舍：表格没有做「窄屏降级成卡片」的第二种排版——516 宽的面板里两列表格仍可读，多列表格交给横向滚动
  （比把表格拆成一堆行更少认知负担）。这条写进了实现报告的风险项。

### 17.2 折叠态必须能看出失败

- 折叠头结构改为：`[扳手] N 个步骤 [摘要（可省略）] [● N 失败（固定）]`。
- 摘要是**可截断**的一行（`text-overflow: ellipsis`），所以失败信息不能只放在摘要里——放在摘要里就等于把它
  交给省略号决定。失败小计 `flex-shrink: 0`，摘要再长它也留在行尾；颜色（danger）+ 形状（圆点）+ 文字（`N 失败`）
  三重编码，不只靠颜色。
- 摘要同步做减法：有失败先说失败那一步，否则说最后一步（多步骤拼一行再截断＝不可读）。

### 17.3 失败轮不留空气泡

- 判据 `isEmptyAssistantMessage`（正文 / 思考 / 工具步骤 / 来源 / 语音转写都为空）在 `turnPhase.ts`，
  全高渲染（`MessageBubble`）与输入区（`Composer` → `AgentAlerts`）共用。
- 失败的空轮不渲染气泡壳，`MessageBar` + 重试 + 关闭内联在该轮里；输入区抑制同一条错误（同一条错误只渲染一次）。
- 语音窗没有消息列表，错误仍由 `AgentAlerts` 承担（两处不会同时可见：语音窗里的对话面板是 inert 的）。

### 17.4 停止后的回声

- 一轮被用户停止（`Message.status === 'aborted'`）时，半高窗在 dock 给一行「已停止」：
  warning 色 + 停止图标 + `role=status`；停留 `STOP_NOTICE_MS`（3000，功能计时）后按 `motionTokens.durationFast` +
  `curveAccelerateMid` 淡出。用 warning 不用 danger：用户主动停止不是错误，但内容不完整需要留意。
- 触发取「`TurnStatus` 回落到 idle 且该轮 status=aborted」这一帧，而不是点按钮那一帧（点下去时状态还是 streaming，
  那一刻挂出来的提示会被下一帧冲掉）。新一轮开始/开始录音即撤掉旧提示。

### 17.5 半高语音入口补一档

- 空态（无 peek）：96px 圆形麦克风按钮 + 两层细环 + 一句「按住空格说话」。
- 有 peek：顶部控制条给 44×44 麦克风图标按钮（`data-wtsl-agent-talk-compact`），空态圆钮不渲染。
- 理由：删掉「点击说话」+「说点什么，或按住空格」之后，有历史消息时半高窗没有任何可见的语音入口，
  只剩「按住空格」这条看不见的路径——这正是「少一句话反而说不清」的地方：点按路径由圆钮承担，
  键盘路径只能写出来，所以只补这一句（不是恢复原句）。

### 17.6 空态 3×3 的结构性例外

见 [DENSITY.md](DENSITY.md) §1.2：3×3 空态空带 31–33% 不是文案能解决的问题，靠「更大的中性图标（40 档位）+
垂直居中」撑观感，不补说明文字、不把身份色扩散到图标。

## 18. v0.4.5 修订（触控语音：混合手势 / 权限链路 / 设置页触控）

> 依据：`wtsl-touch-voice-design.md`（HIG / Fluent 2 核查 + 状态机）。本节是 v0.4.5 的实现口径，
> 与 §2 / §5 / §14 的形态顺序冲突处以本节为准；**§12 的动效 token 口径不变**——本节出现的
> 300ms / 400ms / 2.5s / 120s 是**手势与录音阈值**，不是动效时长，动效仍只引用 `motionTokens`。
> 本轮只改 `src/host/agent/ui/**` 与 `src-tauri/**`；几何常量 `entryGeometry.ts` 不动。

### 18.1 折叠态录音胶囊（新形态，不是第四种面板）

| 项 | 口径 |
|---|---|
| 尺寸 | 2 列 + 1 gutter（1440×960 下 2×164+12 = 340）× 与 orb 同高 56；由 `geometry.grid` 推导，不写像素 |
| 位置 | 右缘与三态锚点对齐，底边贴 orb 上缘上方 `spacingVerticalM`；`collapsed` 时容器 `overflow: visible` |
| 内容 | 声纹（`Waveform compact`，12 根竖条）+ `m:ss` 计时 + ✕ 取消（44）+ ■ 结束（44，primary）；点按锁定后补一行「点一下结束」 |
| 转写中 | 声纹静止 + `转写中` + >400ms 才出 spinner + ✕「收起（结果仍会保存）」 |
| 视觉 | 只用 `tokens.*`（圆角 `borderRadiusXLarge`、描边 `colorNeutralStroke2`、`shadow16`）；复用 `Waveform`，不新造声纹 |

### 18.2 手势状态机（每个状态 → 代码位置）

| 状态 | 触发 | 可见反馈 | 实现 |
|---|---|---|---|
| 折叠空闲 | 初始 / 关闭 | orb | `AgentSurface` 的 `data-stage=collapsed` |
| 折叠启动中 | 触控 pointerdown / 空格 keydown / 授权卡「允许」 | orb 按下态（`data-wtsl-agent-starting`），不展开 | `useVoiceGesture.begin()` + `starting`；5s 看门狗 |
| 折叠录音中 | getUserMedia resolve | 胶囊（`data-wtsl-agent-pill=recording`）；orb 变录音态（`data-wtsl-agent-recording`） | `pill='recording'` |
| 点按锁定 | pointerup 且 <300ms | 胶囊写「点一下结束」 | `lockedRef` / `locked` |
| 转写中 | 松手 ≥300ms / 再点一下 / ■ / 空格 keyup / 静音断句 / 120s 上限 | 胶囊（`data-wtsl-agent-pill=transcribing`） | `finish()` → `revealPending` |
| 展开 | 转写回来（`transcriptStatus=ready`）或回合已开始 | 半高语音窗 | reveal effect → `openVoice()` |
| 取消 | ✕ / Esc / 窗口失焦 / pointercancel / 按住期间捕获丢失 / <400ms 丢弃 | 回 orb（短提示「太短了，再说一次」/「麦克风没有响应」） | `cancel()` / `finish()` 的短录音分支 |
| 授权 / 失败 | 未同意、系统关闭、无设备、被占用、不支持 | 授权卡（`data-wtsl-agent-mic-card`） | `MicPermissionCard` + `micPermission.ts` |

- **形态只由用户动作与「转写回来」改变**：转写失败不自动收起、回答到达不自动升级到 chat（§14 不变）。
- 转写慢于 8s 预等待时回合已开始（有内容可看）→ 允许先展开；否则保持「转写中」胶囊，不展开空面板。

### 18.3 输入形态判定

- 主判据 = **最近一次 pointer 事件的 `pointerType`**（touch / pen / mouse）；`(pointer: coarse)`、`maxTouchPoints` 只作能力补充，**不用于判断当下形态**；仅当 Pointer Events 不可用时回退 `(any-pointer: coarse)`。
- 设置项「输入方式」= auto / touch / precise（独立键 `agent.inputMode`，不进 `agent.settings`）；用户选择覆盖事件推断。
- 笔按「精确指针」处理，但命中区仍按 44。
- 鼠标形态保持 0.4.4 的点按手感（先展开再录）；触控/笔走混合手势。

### 18.4 空格语义（与触控不同，结果契约一致）

- 空格 = 按住说话：keydown 立即录音（**不 openVoice**），keyup ≥300ms 结束、<300ms 取消；`event.repeat` 与输入法组合忽略。
- **空格不被输入框抢走**：`canUseVoiceKeys` 继续排除 input/textarea/contenteditable、外部 dialog/menu/listbox、其它 button/a；入口按钮、说话按钮、peek 例外。
- 取舍：手指可以「点一下锁定」，键盘必须「按住」（避免一次误触把麦克风打开且长期不关；与 HIG「Distinct from other gestures」一致）。

### 18.5 麦克风权限链路（0.4.4 的 `Permission denied` 根因修复）

| 层 | 谁控制 | 0.4.5 做法 |
|---|---|---|
| ① 应用内同意 | WTSL | `MicPermissionCard`（首次点麦克风时出现）：用途一句 + 「允许」/「先用文字」；同意写 `agent.micConsent` |
| ② WebView2 站点权限 | Rust | `Builder::on_permission_request`：`PermissionKind::Microphone → Allow`，**其余一律 `PermissionResponse::Default`**（不写成全部 Allow） |
| ③ Windows 系统隐私开关 | 系统 | 应用内无法解除：失败卡给「打开 Windows 设置」，走新命令 `open_mic_privacy_settings`（`ms-settings:privacy-microphone`） |
| ④ 设备 | 驱动 | `NotFoundError` / `NotReadableError` 分类后给「重试」 |

- 版本核实：`Cargo.toml` / `Cargo.lock` 均为 tauri **2.12.4**（`tauri-runtime 2.12.2` / `wry 0.57.0`），`Builder::on_permission_request`、`PermissionKind`、`PermissionResponse` 均在本地 registry 源码中确认存在；Windows 后端经 `PermissionRequested` → `SetState(ALLOW)`。
- 授权后复核：探测 `getUserMedia` 拿到流后检查 `track.readyState === 'live'` 且 `getSettings().deviceId` 非空，随即释放音轨；失败按 `err.name` 归类（`voice.error` 只带 message、拿不到 name，所以归类必须靠真实探测）。
- 安全边界：只放行麦克风。剪贴板读取等其它权限保持默认（设置页「粘贴」失败时给可见提示，让用户用系统粘贴）。
- 风险（未验证）：WebView2 profile 若在 0.4.4 之前持久化过 Deny，处理器可能不再被调用；需一次性清 profile（发布后真机第一次录音看日志确认）。

### 18.6 设置页触控（13 条）

编号沿用 `wtsl-touch-voice-design.md` §4.7，实现逐条落在 `SettingsDialog.tsx`：
1. 语速 ± 步进（44×44）+ `touch-action: pan-y`；2. 当前值 `aria-live`；3. 下拉 `Option` 行高 44；
4. API Key 显示/隐藏 + 粘贴 + 清空（默认密文）；5. 关键词数量 1–10 改下拉；6. 控制台链接改 44 高按钮；
7. `size=large` 按钮补 `minWidth/minHeight: 44`；8. 滚动区 `overscroll-behavior: contain` + 底部内衬；
9. 四组锚点（语音 / 模型 / 联网搜索 / 输入与权限）；10. Switch label 去括号补充语、改成下一行 hint；
11. 禁用态给「先打开自动朗读回答」；12. 新增「输入方式」（auto / touch / precise）；13. 新增「麦克风」状态行（状态 + 检查 + 打开 Windows 设置）。

- 说明：Fluent v9 的 `Slider` 只有 small/medium 两档（没有 large），所以第 1 条的触控改善落在「两侧 44 步进 + `touch-action` + 可读当前值」，而不是把滑杆本身放大。
- 全部颜色/间距/字号取 `tokens.*`，命中区高度取 `TOUCH_TARGET_CSS`。

### 18.7 验收锚点

- `data-stage` 全程 `collapsed`：入口点按 → 出现 `[data-wtsl-agent-pill="recording"]`；松手 <300ms 仍 `collapsed`；再点 → `transcribing`；转写回来 → `data-stage=voice`，全程无 `chat`。
- 按住 800ms 松手 → 一次到位。
- 空格 keydown→keyup ≥300ms 展开一次；<300ms 不展开、无消息；输入框内空格不触发。
- mock 一个 reject `NotAllowedError` 的 `getUserMedia` → 出现 `[data-wtsl-agent-mic-card]`（不是空面板），并给「打开 Windows 设置」。
- 胶囊 ✕ / ■ 各点一次：live 音轨数 0；✕ 不写消息。
- 120s 上限、400ms 下限、静音 2.5s 断句各一条用例（静音阈值需真机标定后再定稿）。

## 19. v0.4.5 修订（轮次时间线：按发生顺序排列，取代轮次卡）

取代 §16.1。用户需求原话是「模型先思考了什么、然后调用了什么工具、然后输出了什么，接下来又重新思考……」，
即**按发生顺序**排，而不是按类型聚合。

### 19.1 为什么必须同时改数据层

旧口径承认「真实交错不可还原」（§16.1）——根因是数据层：多轮正文被拼进同一个 `content`，
`tool_calls` 在轮末批量 flush。**只改渲染层不可能恢复顺序**，所以 `Message.blocks` 升为唯一真相源。

### 19.2 块模型

```ts
type BlockKind = 'thinking' | 'tool' | 'text' | 'notice';
interface BlockBase { id: string; seq: number; open: boolean; createdAt: string }
ThinkingBlock { kind:'thinking'; text: string }
TextBlock     { kind:'text';     text: string }
ToolBlock     { kind:'tool';     call: ToolCallRecord }   // 与既有记录同构，不新增语义
NoticeBlock   { kind:'notice';   level:'error'|'warning'|'info'; code; text; action? }
TurnBlock = ThinkingBlock | TextBlock | ToolBlock | NoticeBlock
```

追加规则（事件到达顺序 = 块序）：

- `appendDelta(kind, delta)`：最后一个块存在、`kind` 相同且 `open` → **原地追加**；否则**关闭上一块、新建块**。
- `tool_call` 事件 → 立刻建 `open=true / status='running'` 的 tool 块；执行完/失败 → 原地回填那一块，**顺序不动**。
- `notice` 独立成块、永不与他人合并；同 `code` 去重。空增量不产生块（不会出现空折叠行）。
- 轮次结束/停止/失败 → `closeBlocks()` 收尾所有 `open`。
- 块 `id` 创建后不变 → React key 稳定，流式追加不重排、不重挂载、折叠状态不丢。

### 19.3 旧字段降级为投影（协议不变）

`content` = 所有 `text` 块按 `seq` 以 `\n\n` 连接；`reasoning` = 所有 `thinking` 块同样连接；
`toolCalls` = 所有 `tool` 块的 `call`。每次写入同步刷新，因此 `transport/history.ts`（模型请求）、TTS、
标题、`isEmptyAssistantMessage` 全部零改动。

> 行为变化（已知）：多段正文的 `content` 现在用 `\n\n` 连接后会原样进入下一次模型请求与 TTS；
> 单段正文不受影响。

### 19.4 折叠语义（默认全部折叠）

| 项 | 规格 |
|---|---|
| 过程块（thinking / tool） | 折叠成**一行 44px 摘要**（`[Chevron] [摘要] [失败标记?]`，整行是 `<button aria-expanded>`，命中区 `TOUCH_TARGET_CSS`）。**默认折叠，但折叠后不消失。** |
| 摘要文案 | thinking：`正在深度思考…` / `已深度思考（1.2k 字）`；tool：`读取了 a.md，1200 字` / `正在调用 clock.now…` / `调用了 clock.now` |
| 失败 | 行尾固定「● 失败」（danger）+ 节点 danger 色（形状＋文字＋颜色三重编码），展开看错误全文 |
| text / notice | **永不折叠**，无折叠控件 |
| 全局开关 | 设置 → 显示 → `Switch`「显示全部过程细节」，键 `agent.timeline.expandAll`，默认关 |
| 每块覆盖 | `isOpen = overrides[blockId] ?? expandAll`；全局开着也能单独收起一块（双向） |
| 排他 | 全局关着时点开一块 → 同轮其它块显式收起（手风琴）；全局开着时自由展开 |
| 持久化 | 逐块展开状态**不持久化**，重开回到默认折叠 |

渲染器**只按 `kind` 分支，不按工具名分支**（用户明确要求「general 的做法」，不为每种工具写特例）。

### 19.5 老存档兼容

`blocksFromLegacy(message)`：**reasoning → toolCalls → content** 合成（真实交错早已丢失，只能降级），
`id = legacy-${message.id}-${index}`（同一老数据每次渲染 key 相同），`open=false`，`seq` 按位置递增。
读取时若无 `blocks` 且角色是 assistant 就补齐；user / tool 角色不合成块，气泡直接渲染 `content`。
`restoring` 时顺带 `closeBlocks()`（上次崩溃遗留的 `open=true` 不算数）。**不清空任何用户数据。**

### 19.6 半高 peek

1. 取数：`(user|assistant) && hasVisibleText(message)`（有 text 块），仍取最近 2 条。
2. 文本：只拼 `text` 块 → 仍走 `PeekText`（84 全角字预算 / token 边界截断 / 最新一条 `tail`），算法未改。
3. 过程：气泡**上方**（气泡外，避免侵占 `-webkit-line-clamp: 3`）渲染 `PeekMotionPips`：≤3 个 4px 点
   （完成中性 / 进行中品牌色 / 失败 danger），超出显示 `+N`；不可点、`aria-hidden`；无过程块则整行不渲染。
4. thinking / tool 正文**不进** peek 文本。

### 19.7 文件归属

新增 `ui/TurnTimeline.tsx`、`ui/BlockRow.tsx`、`ui/blockSummary.ts`、`ui/useTurnBlocks.ts`、`ui/PeekMotionPips.tsx`；
删除 `ui/TurnSteps.tsx`；数据层改动在 `agent/types.ts`、`agent/storage.ts`、`agent/hooks/useAgentSession.ts`。

### 19.8 验收锚点

- 一条「思考→工具→正文→再思考→再工具→正文」的 mock 会话，DOM 顺序必须与事件顺序一致（不是类型聚合）。
- 折叠态下每个过程块仍占一行 44px，且摘要可读；text/notice 无折叠控件。
- 全局开关打开 → 全部过程块展开；再单独收起一块 → 只有那一块收起（双向）。
- 老存档（无 `blocks`）加载不崩、不丢消息，顺序为 reasoning→tools→content。
- `MessageList` 不再有横向偏移（`scrollbarGutter: stable both-edges`），气泡左缘与输入区左缘同一条竖线。

