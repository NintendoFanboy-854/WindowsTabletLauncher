# Agent

桌面的智能入口：听懂人话 → 选插件工具执行 → 用自然语言回你。能力边界 = 插件工具 + 模型 + 联网搜索。

v0.3.0 起（D-20/D-21/D-22）只保留浮空形态，语音为主入口；全屏页、面板形态、人脸唤醒、dock 与机器人图标均已移除。

## 浮空三段（唯一形态）

右下角一个入口按钮（56×56、圆角 12、`ChatSparkle20Regular`），同一容器向右上生长：

| 阶段 | 尺寸 | 内容 | 进入 / 退出 |
|---|---|---|---|
| 按钮 | 56×56 | 图标 | 点按或按住空格 → 立即录音并进入半高窗 |
| 半高输入窗 | min(420px, 92vw) × clamp(320px, 44vh, 440px) | 最近一条回答的渐隐预览 + 输入区 + 语音/发送；录音时为声纹带 | 发送后自动进入全高浮栏；Esc/点外部/X 回按钮（草稿保留） |
| 全高浮栏 | 同宽 × calc(100vh − 40px) | 消息列表 + 同一输入组件；头部 ⌄ / ⋯ / X | ⌄ 或 Esc 回半高；X 直接回按钮 |

- 右/下锚定，只过渡宽高，圆角恒 12，shadow8 ↔ shadow16；动效、reduced-motion、焦点路径见 [MOTION.md](../MOTION.md) §5.1 与 [AGENT-SURFACE-CONTRACT.md](../AGENT-SURFACE-CONTRACT.md)。
- 可预测性：Esc 永远退一级；⌄ 收起、X 关闭；composer 点外部一律收起并保存草稿，chat 点外部不关闭；唯一自动升级 = 发送后进入 chat；关闭后焦点回到入口按钮。
- 不再有「面板形态」设置；旧数据里的 `panelMode` 直接忽略。

## 语音（主入口）

- **点按钮 / 按住空格 = 立即开始录音**（不是先开窗再点麦克风）；松开或点停止 = 结束并发送。空格在输入框/按钮/菜单/对话框/iframe 聚焦时不响应，避免打字误触；短按 <300ms、Esc、窗口失焦取消录音。
- 录音结束时：当前这轮语音以 `input_audio`（`data:audio/wav;base64,…`）**只发一次**给 MiMo 对话模型；同一份 WAV 并行送 MiMo ASR（`mimo-v2.5-asr`），转写文字回填到该 user 消息并入库。
- 音频不写 localStorage、不进 Message、不进后续请求；重试/切会话/重启都只发文字。转写失败时该条上下文用「（用户发来一段语音）」占位，界面以声纹 + shimmer 提示，可再录一次。
- 播报：语音提问的回答自动朗读；文字提问默认不朗读（设置 `文字提问也朗读`，默认关）。每条助手消息可单独播放/停止；收起/关闭窗口、开始录音、发送新消息都先停止播报；TTS 失败只做一次轻提示，不打断文字。
- 语音消息呈现：与打字消息同形同色；气泡顶部一条声纹装饰（高度来自 `voicePeaks`），转写未回时声纹轻微起伏 + 两行 shimmer，回填后文字淡入、声纹静止。**界面不写「语音/转写结果」等标签**，`aria-label` 给屏幕阅读器。

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
    readTextReplies: boolean;   // 默认 false：文字提问不自动朗读；语音提问始终朗读
    voice: string;              // MiMo TTS 音色
    rate: number;               // 0.5–2.0，默认 1.0
  };
  search: { enabled: boolean; maxKeyword: number; forceSearch: boolean };
  mimo: { apiKey: string; baseUrl: string };
}
```

- 存储：会话 `agent.conversations`（只存文字，音频用完即弃）、设置 `agent.settings`。
- 迁移：`readTextReplies` 取旧 `tts.autoPlay`；旧 `tts.continuous`（曾被语音模式强制写 true）不迁移；旧 `face` / `panelMode` 丢弃。

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

- 设置页顶部「入口」组：打开 Agent / 复盘 / 插件管理（取代已删除的 dock）。
- 打开设置页：长按桌面空白 → 编辑工具栏「设置」；或 `Ctrl+,`。
- Agent 设置（模型/Key/语音/搜索）：窗口头部 `⋯` → 设置。

## 不做

全屏形态、面板形态切换、人脸/摄像头、唤醒词与常驻监听、机器人形象、多用户、长期记忆向量库、插件自定义提示词、Agent 自主后台任务。

## 联网搜索：用 MiMo 原生能力

- 用 MiMo 自带的 `web_search` 工具：请求里加 `{"type":"web_search","max_keyword":3,"force_search":false,"limit":1}`，与函数工具混用，`tool_choice: "auto"`。
- 来源来自响应 `message.annotations`（`url_citation`），按 Fluent 2 的来源 chips 展示。
- **需要先在 MiMo 控制台 → 插件管理开通 Web Search Plugin**；未开通时接口返回 400，窗口内映射成可读提示。
- 设置项：联网搜索开关（默认开）、`max_keyword`（默认 3）、`force_search`（默认关）。
- 不做：自建搜索/抓取 Provider、内置浏览器、深度爬虫、多轮检索策略。

## 验收

- 交互/动效/颜色/焦点见 [AGENT-SURFACE-CONTRACT.md](../AGENT-SURFACE-CONTRACT.md) §11 与 v0.3.0 回归报告；音频链路、上下文零音频、天气 3×2 由独立 verifier 用 CDP + 真实 release 复核。
