# Agent

桌面的智能入口：听懂人话 → 选插件工具执行 → 用自然语言回你。能力边界 = 插件工具 + 模型 + 联网搜索。

## 面板形态（三种都做，设置里选）

- **浮层**（默认）：右侧 `OverlayDrawer`（约 420px），点右下角按钮或语音唤醒时滑出，不占桌面网格。
- **常驻侧栏**：一直停靠在右侧，桌面网格自动让出宽度。
- **全屏**：整屏对话，适合语音模式（大字幕 + 波形动画 + 说话按钮）。

三种形态共用同一套对话状态，切换时不断话。语音交互自动切全屏。

## 自适应

- 浮层宽度 `min(420px, 92vw)`；常驻侧栏只在大屏（≥1280）可选，否则退化为浮层。
- 消息列表内部滚动，不带动桌面；消息、输入框、工具卡片全用 Fluent 组件。

## 数据模型

```ts
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: { id: string; name: string; args: unknown; result?: unknown; error?: string }[];
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;        // 首条用户消息截断
  messages: Message[];
  updatedAt: string;
}

interface Settings {
  model: 'mimo-v2.6-flash' | 'mimo-v2.6-pro' | 'mimo-v2.6-pro-ultraspeed'; // 默认 flash
  panelMode: 'overlay' | 'sidebar' | 'fullscreen';   // 默认 overlay
  thinking: boolean;                                  // 默认 false
  tts: {
    autoPlay: boolean;     // 默认 false：只显示文字，点喇叭才读
    continuous: boolean;   // 记忆的播放状态：点过一次后保持连续朗读
    voice: string;         // MiMo TTS 音色
    rate: number;          // 0.5–2.0，默认 1.0
  };
  face: {
    enabled: boolean;      // 默认 true
    descriptors: number[][]; // 注册的人脸特征样本
    threshold: number;     // 默认 0.5
  };
  search: {
    enabled: boolean;      // 联网搜索开关，默认 true
    maxKeyword: number;    // 每轮最多并发关键词，默认 3
    forceSearch: boolean;  // 强制搜索，默认 false（交给模型判断）
  };
}
```

存储：会话 `agent.conversations`、设置 `agent.settings`。**连续朗读状态要持久化**——重启后仍按上次选择。

## 模型接入

- MiMo V2.6（OpenAI 兼容 `/chat/completions`），SSE 流式，支持 tool calls。
- API Key 在设置里填，本地存。
- 系统提示：角色说明 + 当前时间 + **全部已注册工具清单**（工具名、描述、参数 schema）+ 输出风格要求（简洁、中文、能用工具就别猜）。
- 上下文：按模型上下文窗口自动裁剪，保留系统提示 + 最近的消息。工具结果太长时截断后再给模型。
- 请求失败或超时：提示错误并提供重试按钮。

## 工具

### 插件工具

插件通过 `registerAgentTool({ name, description, run })` 注册，宿主汇总后作为 `tools` 传给模型。命名 `<插件id>.<动作>`：`clock.now`、`todo.add`、`pomodoro.start`、`weather.queryPlace`、`sedentary.today`、`countdown.list`…

执行：宿主 → postMessage 到插件 iframe（带 requestId）→ 等结果。失败/超时把错误文本回给模型，由模型向用户解释。

### 宿主内置工具（不依赖插件）

| 工具 | 参数 | 说明 |
|---|---|---|
| `system.time` | — | 当前时间/日期/时区 |

联网搜索不自己实现，用 MiMo 原生 `web_search`（见文末）。



## 语音

- 输入：点麦克风按钮开始录音 → 停止 → 上传 MiMo ASR → 得到文本后走正常对话。
- 输出：MiMo TTS 流式合成。
- **连续朗读**：用户点一次喇叭后进入连续朗读模式（`tts.continuous = true`，持久化）——本条回复全部读完，之后每条新回复自动朗读，直到用户点停止或关掉该模式。语音模式下默认开启。
- 朗读时再次点击喇叭 = 停止朗读。

## 人脸唤醒

- 方案：浏览器端 `@vladmandic/face-api`（WASM）。
- 注册：设置里对准摄像头拍几张样本，存特征向量。
- 识别：按较低频率抽帧检测；与注册特征的距离小于 `threshold` 且连续多帧命中才触发（防误唤醒）。
- 触发：打开全屏语音面板并开始录音，提示音后开始听。
- 隐私：特征只存本地，不上传；无摄像头/权限被拒 → 设置里显示不可用，不影响其他功能。
- 不做：头部姿态识别、表情识别、多用户区分。

## 边界与异常

- 无 API Key：面板显示引导“去设置里填 MiMo Key”，不发起请求。
- 工具调用了不存在的插件：返回错误给模型，模型用自然语言说明。
- 流式输出中用户点停止：中止请求，保留已生成内容。
- 语音合成失败：退回纯文本并提示一次。

## 不做

多用户、长期记忆向量库、插件自定义提示词、Agent 自主后台任务（定时自动执行）。

## 联网搜索：用 MiMo 原生能力

- 用 MiMo 自带的 `web_search` 工具：请求里加 `{"type":"web_search","max_keyword":3,"force_search":false,"limit":1}`，与函数工具混用，`tool_choice: "auto"`。
- 来源来自响应 `message.annotations`（`url_citation`：url / title / site_name / summary / publish_time / logo_url），按 Fluent 2 的来源 chips 展示；流式首个数据包会先带来源。
- **需要先在 MiMo 控制台 → 插件管理开通 Web Search Plugin**；未开通时接口返回 400（`webSearchEnabled is false`），面板要映射成可读提示并给出控制台链接。
- 设置项：联网搜索开关（默认开）、`max_keyword`（默认 3）、`force_search`（默认关，交给模型判断）。
- 不做：自建搜索/抓取 Provider（Tavily 等已删除）、内置浏览器、深度爬虫、多轮检索策略。
