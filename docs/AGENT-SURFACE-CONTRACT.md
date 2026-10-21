# Agent 浮空界面与语音契约（v0.3.0 实施用）

> 这是本版实现的唯一口径。设计取自用户明确要求 + `docs/reference/APPLE-HIG.md`（§5 层级与模态、§5.1 关闭语义、§9 动效、§13.2 sheet detent 思想）+ `docs/FLUENT2.md`。
> 实现完成后本文并入 `docs/components/agent.md` 与 `docs/DESIGN.md`。

## 0. 范围

- Agent 只有浮空形态：右下角入口按钮 → 半高输入窗 → 全高浮栏（三段，同一容器变形）。
- 删除：全屏语音页、面板形态（overlay/sidebar/fullscreen）设置、人脸唤醒、dock、机器人头像/图标、旧 continuous/autoPlay 播报状态机。
- 语音：点按/空格**立即录音**（不是先开窗再录）；音频原生发 MiMo 对话，事后 ASR 转文字入库；上下文/存储只留文字；语音消息用声纹 + shimmer 呈现，不写文字标签。
- 天气 3×2 三带式重排（另见天气任务，不在本文）。

## 1. 三段形态

容器固定 right: 20px、bottom: 20px，只变宽高，圆角恒 12px（项目 `--wtsl-card-radius`）。

| 阶段 | 尺寸 | 表面/层级 | 内容 |
|---|---|---|---|
| collapsed（按钮） | 56×56 | surface1 + stroke1 + shadow8 | `ChatSparkle20Regular` 品牌色图标；无文字、无机器人、无麦克风 |
| composer（半高窗） | width min(420px, 92vw) × height clamp(320px, 44vh, 440px) | surface1 + stroke2 + shadow16 | 顶部：⌃ 展开对话 / 朗读开关 / ✕ 收起；中部：最近 3 条消息的 peek（底部对齐、顶部渐隐，整块可点/Enter/空格展开；无消息时 ChatSparkle 空态）；底部：输入区（Textarea 自动增高 ≤3 行）+ 语音/发送按钮；录音/转写时中部换成声纹带，peek 与展开暂隐 |
| chat（全高浮栏） | 同宽 × calc(100vh - 40px) | surface1 + stroke2 + shadow16 | 头部：[ChatSparkle 小标] + 右侧 朗读开关（常驻）/（仅播报中）停止朗读 / ⌄（收起）/ ⋯ 菜单 / X（关闭）；消息列表；底部同一输入组件（不重挂） |

- 不做全屏、不做侧栏让宽、不做 dock。桌面其它 chrome 不变（页码点、编辑工具栏）。

## 2. 手势 / 键盘 / 焦点 / 关闭语义（可预测性）

| 动作 | 结果 |
|---|---|
| 点入口按钮 | **立即开始录音**，同时 morph 到 composer（录音态）；再点音符/停止方块 = 结束并发送 |
| 按住空格（无修饰键、焦点不在 input/textarea/button/菜单/dialog/iframe、非输入法组合、非 auto-repeat） | 立即开始录音；松开 = 结束并发送；<300ms 或失焦 = 取消 |
| 录音中 Esc | 取消录音，停留在 composer（可改文字）；再 Esc 收起为按钮 |
| composer：⌃ 展开对话 | 进入 chat，焦点到输入框；录音/转写中禁用（不给“看起来能展开但没结果”的死路） |
| composer：Esc / 点外部 | 收起为按钮，草稿保留（HIG popover：点外关闭必须保存工作） |
| composer：录音中 X / 点外部 | 先取消录音再收起：不能留下没人能停的麦克风在后台 |
| composer：转写中 X | 收起后转写完成不再自动弹回 chat（关闭就是关闭；结果仍保存，展开可见） |
| composer：peek 区域点击 / Enter / 空格 | 展开到 chat（半高窗不是死路，不需要先发一条消息才能升级） |
| chat：朗读开关（常驻） | 切换自动朗读总开关 `tts.autoRead`，立即持久化；切换时先停当前播报 |
| chat：⌄ / Esc | 收起到 composer（草稿、会话不丢） |
| chat：X | 直接收成按钮；停止播报 |
| chat：播放中 | 显示临时「停止朗读」；不播放时该按钮不渲染（状态控件常驻、动作控件按需出现） |
| chat：点外部 | 不关闭（稳定阅读） |
| 发送（打字 Enter / 语音结束） | 自动 morph 到 chat；只此一种自动升级，不自动收起 |
| 关闭/收起后焦点 | 回到入口按钮；展开后焦点到输入框；chat 收起后焦点到 composer 输入框 |

- 按钮 56×56（≥40 触控）；所有图标按钮 ≥40×40，带 Tooltip；无隐藏手势、无双击语义。
- 禁用态必须可见（发送按钮空内容时 outline+禁用，不隐藏）。
- 状态与操作分离：常驻控件只表达**状态**（朗读开/关，用图标 + aria-pressed），临时控件只在**动作可用**时出现（停止朗读、展开在转写中禁用）；不出现“只有播放时才凭空冒出的语音控件”。

## 3. 动效（只用 motionTokens；无自定义曲线/弹簧/模糊）

| 过渡 | 时长 / 曲线 | 内容编排 |
|---|---|---|
| button → composer | 280ms durationSlow / curveDecelerateMid | 图标 80ms 淡出；composer 内容 120ms 淡入（delay 80ms） |
| composer → chat | 320ms durationSlow / curveDecelerateMid | 输入组件原地不动（共享元素）；消息列表 150ms 淡入 + 4px 上移；气泡 20ms 错峰 |
| chat → composer | 220ms / curveAccelerateMid | 消息先 100ms 淡出，几何 220ms 收回 |
| composer → button | 200ms / curveAccelerateMid | 内容 100ms 淡出，图标 120ms 淡入 |
| chat → button（X） | 240ms / curveAccelerateMid | 内容 100ms 淡出后收几何 |
| shadow | 同一过渡 | shadow8 ↔ shadow16 |
| 按压 | 100ms durationFaster | scale 0.98 + surface pressed；悬停仅鼠标：surface hover + shadow16，无 hover 缩放 |

- 动画不阻塞操作：输入第一帧可用；阶段可打断（从当前尺寸重新过渡）。
- `prefers-reduced-motion: reduce`：只保留 120ms opacity，无尺寸/阴影/位移动画；声纹/脉冲不动。
- 录音/转写/播报的持续动画都带 `data-wtsl-agent-animated`，reduced-motion 下统一关闭（沿用 agent.css 现有约定）。

## 4. 颜色 / 字体 / 图标

- 只用 Fluent token，不写 hex、不做渐变/发光；实底表面，不用 backdrop blur（弱机省 GPU）。
- 入口按钮：常态 `colorNeutralBackground1` + `colorNeutralStroke1` + shadow8；图标 `colorBrandForeground1`；hover `colorNeutralBackground1Hover`；pressed `colorNeutralBackground1Pressed`。品牌色只在动作发生时出现（录音、发送、焦点、链接）。
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
export type SurfaceStage = 'collapsed' | 'composer' | 'chat'; // 仅 UI 持有

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
5. composer 顶部有展开对话 + 朗读开关 + 收起；peek 可展开；录音中收起会取消录音；转写中收起不自动弹回。
6. chat header 不播放时也有朗读开关；「停止朗读」只在播报中出现；开关状态持久化到 `tts.autoRead`。
7. 桌面空白右键能打开「打开 Agent / 编辑桌面 / 设置」；Agent ⋯ 菜单不含宿主设置入口。
8. 语音气泡无声纹以外的文字标签；转写 shimmer→文字；`localStorage`/网络后续请求无音频。
9. 总开关关闭后语音/文字回答都不自动播报；单条播报可停；收起/关闭即停。
10. `tsc --noEmit` 通过；mock 下可走完整录音→转写→回答链路（假麦克风）。
11. 天气 3×2 无 166px 横向空洞；内容带 ≥70%；1024/1440 不裁切（W3）。

## 12. 实现备注（v0.3.0 落地时确认）

- **动效数值取最近 token**：契约 §3 的 80/120/220/240/280/320ms 无一一对应 token，实现取 `motionTokens` 的
  `durationFaster/Fast/Normal/Gentle/Slow`（100/150/200/250/300ms）近似；reduced-motion 的 120ms 与气泡 20ms
  错峰按契约字面保留。方向不变：展开 decelerate、收回 accelerate。
- **图标命名**：`@fluentui/react-icons` 根导出为无编号名（`ChatSparkleRegular` / `SoundWaveCircleRegular` /
  `MoreHorizontalRegular`），按 `fontSize={20}` 使用；视觉规格同 20px 图标。
- **图标尺寸**：入口按钮内 20px；消息元信息 16px；均 ≥40×40 命中区。
- **composer 位置**：composer 与 chat 共用同一个贴底输入组件（共享元素不重挂）；录音/转写时声纹带在输入窗中部。
- **键盘守卫**：空格/ Esc 仅在「不在输入控件、不在外部 dialog/menu、不是其它按钮」时生效；**入口按钮本身放行**
  （焦点回按钮后仍可按住空格说话）。实现见 `AgentSurface.canUseVoiceKeys`。
- **转写态**：ASR 通常 <1s，不显示 spinner（FLUENT2 wait-ux 1s 阈值），声纹静止；超过 1s 由后续版本补。
- **入口按钮 hover**：只变 surface/shadow，不做 hover 缩放；按压 0.98（reduced-motion 取消）。
- **机器人清理**：`Bot*`/`Person*`/`Avatar`/`Mic*` 图标、模型 badge、解释性状态文字均已从 Agent UI 移除；
  身份只由 ChatSparkle 承担。

## 13. v0.3.1 修订（用户反馈：半高窗死路 / 不能默认静音 / header 空 / 鼠标进不了设置）

- **半高窗补出口**：顶部控制条（⌃ 展开 / 朗读开关 / ✕ 收起）+ 最近 3 条消息 peek；录音/转写时这两块暂隐，
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

