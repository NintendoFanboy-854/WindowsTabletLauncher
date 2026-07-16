# 实现路线图 — MiMo 多模态 Agent 集成

## 1. 项目特有约束与可用武器库

### 1.1 架构约束

| 约束 | 影响 |
|------|------|
| 自包含部署，无 Package Identity | `Windows.Media.SpeechRecognition` 不可用；语音方案改为原始音频→MiMo 直接理解（跳过 STT） |
| XAML-in-C#（无编译 .xbf） | 所有 UI 通过 `new Grid()` / `new StackPanel()` 构造 |
| PluginContract 无 WinUI 依赖（plain `net10.0`） | 多模态、人脸、音频模块必须放在 `LauncherHost` 而非 `PluginContract` |
| 插件通过 `AssemblyLoadContext.Default.LoadFromAssemblyPath` 加载 | 新增共享库需各插件独立引用 |
| ConfigStore 持久化 | 人脸特征向量存 `ConfigStore`（base64 编码），遵循现有 `GetConfig/SetConfig` pattern |
| 现有 Agent 架构（AgentLoop/AgentService/AgentSession/HostAgentCapability） | 新 provider 在此框架内扩展，不引入独立管线 |

### 1.2 可用 WinUI 3 内置 API

| API | 本地文档 | 用途 |
|-----|----------|------|
| `MediaCapture` + `MediaPlayerElement` | `hub/apps/develop/camera/camera-quickstart-winui3.md` | 摄像头预览（人脸注册） |
| `FaceDetectionEffect` | `hub/apps/develop/camera/scene-analysis-for-media-capture.md` | 实时人脸检测框 |
| `FaceDetector` (`Windows.Media.FaceAnalysis`) | `hub/apps/develop/media-authoring-processing/detect-and-track-faces-in-an-image.md` | 抓帧后提取人脸区域 `SoftwareBitmap` |
| `AudioGraph` | `hub/apps/develop/media-authoring-processing/audio-graphs.md` | 麦克风→PCM 缓冲区→WAV 文件 |
| `ContentDialog` | `hub/apps/develop/ui/controls/dialogs-and-flyouts/dialogs.md` | 摄像头注册 UI 弹窗 |
| `Composition` 动画 | `hub/apps/develop/composition/` | 输入框展开/收起动画 |

### 1.3 外部 NuGet 依赖（新增）

| 包 | 用途 | 大小 |
|----|------|------|
| `OpenCvSharp4` + `OpenCvSharp4.runtime.win` | LBPH 人脸识别（训练+预测） | ~30 MB native DLL |
| `Markdig` 0.40.0 | 已存在，MD 渲染 | — |

### 1.4 项目已有模式复用

- **Agent 工具注册**：`_host.RegisterAgentCapability(this)` → 新的多模态能力 = 新 agent 工具
- **Config 持久化**：`_host.GetConfig/SetConfig(pluginId, key, json)` → 人脸数据、provider 配置
- **通知**：`_host.ShowNotification(title, msg, escalate)` → 语音发送状态、人脸识别反馈
- **UI 线程调度**：`DispatcherQueue.TryEnqueue()` → 所有相机/音频回调

---

## 2. MiMo API 兼容性

### 2.1 与 DeepSeek 差异

| 能力 | DeepSeek | MiMo |
|------|------|------|
| 模型 | `deepseek-v4-pro` / `deepseek-v4-flash` | `mimo-v2.5`（全模态）/ `mimo-v2.5-pro`（纯文本） |
| Base URL | `https://api.deepseek.com` | `https://api.xiaomimimo.com/v1` |
| 认证 | `Authorization: Bearer sk-xxx` | `api-key: sk-xxx`（也兼容 `Authorization: Bearer`）|
| 思考模式 | `thinking.type` + `reasoning_effort` | 仅 `thinking.type`（无 effort 档位） |
| 流式 SSE | ✅ | ✅ |
| Tool Calls | ✅ | ✅ |
| 纯文本 | ✅ | ✅ |
| 图片输入 | ❌ | ✅ `mimo-v2.5` 支持（`image_url` + base64） |
| 音频输入 | ❌ | ✅ `mimo-v2.5` 支持（`input_audio` + base64） |
| 视频输入 | ❌ | ✅ `mimo-v2.5` 支持（`video_url`） |
| 上下文窗口 | 1M | 1M |
| reasoning_content 回传 | 有 tool call 时必须回传 | 相同规则 |

### 2.2 消息格式差异

**DeepSeek（纯文本）**：
```json
{"role": "user", "content": "你好"}
```

**MiMo（多模态）**：
```json
{
  "role": "user",
  "content": [
    {"type": "input_audio", "input_audio": {"data": "data:audio/wav;base64,..."}},
    {"type": "text", "text": "（用户的语音输入）"}
  ]
}
```

---

## 3. 功能模块分解

### 3.1 服务提供商抽象层（MultiProviderClient）✅ 已实现

**目标**：`DeepSeekClient` → 抽象为 `ChatClient`，支持运行时切换 provider。

**已实现方案**：
- `ProviderClientConfig` record：`ProviderName`, `BaseUrl`, `ApiKey`, `Model`, `Thinking`, `AuthHeaderName`, `SupportsMultimodal`, `SupportsThinkingEffort`
- `ChatClient` 构造函数接受 `ProviderClientConfig`，根据 `AuthHeaderName` 选用 `Authorization: Bearer` 或 `api-key` header
- `AgentService` 读取 `host.agent_provider`（"deepseek"/"mimo"），创建对应 client
- **API Key 按 provider 持久化**：`host.agent_api_key.{provider}` 格式存储，切换时自动加载对应 key；`host.agent_api_key` 作为向后兼容 fallback
- **切换 provider 时保留对话历史**：不清空 `ConversationHistory`，而是在 `ToApiMessages(model)` 中按目标模型能力自动筛选
- `ConversationHistory.AddUserMessage` 新增重载支持 `content parts` 列表（多模态）
- **占位符机制**：目标模型不支持的模态类型自动替换为占位符文本（如 `[用户发送了音频]`）
- **`ModelCapabilities` 静态字典**：集中管理所有模型的模态支持（`text`, `image_url`, `input_audio`, `video_url`），未知模型自动回退为纯文本
- `AgentService.EnsureClient()` 比较 provider/model/thinking/apiKey 决定是否重建 client
- `SupportsMultimodal` 按模型名判断（`mimo-v2.5`=true, `mimo-v2.5-pro`=false），用于 UI 和 API 请求格式选择

**Config keys**：
| Key | 说明 |
|-----|------|
| `host.agent_provider` | "deepseek" / "mimo" |
| `host.agent_api_key.deepseek` | DeepSeek API Key |
| `host.agent_api_key.mimo` | MiMo API Key |
| `host.agent_api_key` | 向后兼容（DeepSeek fallback） |

**新增文件**：
- `LauncherHost/Core/Agent/ChatClient.cs` — 统一客户端（替代 `DeepSeekClient`）
- `LauncherHost/Core/Agent/ProviderClientConfig.cs` — 配置 record
- `LauncherHost/Core/Agent/ModelCapabilities.cs` — 模型→模态能力静态字典

**修改文件**：
- `DeepSeekClient.cs` — 删除（功能合并入 `ChatClient`）
- `AgentService.cs` — 增加 `_provider` / `GetApiKey()` / `SwitchProvider()` / `IsMultimodalModel()`
- `ConversationHistory.cs` — 新增多模态 `AddUserMessage` 重载、`ToApiMessages(model)` 按模型能力筛选、占位符转换
- `AgentLoop.cs` — `DeepSeekClient` → `ChatClient`，`ToApiMessages` 传入 model
- `SettingsDialog.xaml` / `.cs` — Provider 选择、API Key 存取、模型列表联动
- `ConversationHistory.ToApiMessages()` — 判断 provider 类型构建不同消息格式

### 3.2 人脸检测与识别（FaceAuthService）

**目标**：注册后可通过摄像头自动识别用户，唤醒语音聆听。

**方案**：
- **人脸检测**（免 OpenCV）：
  - `Windows.Media.FaceAnalysis.FaceDetector` — WinRT 内置
  - 每帧 `SoftwareBitmap` → `FaceDetector.DetectFacesAsync()` → `IList<DetectedFace>`
  - 取最大 `FaceBox` 的人脸区域
- **人脸注册**（`OpenCvSharp`）：
  - 采集 N 帧（默认 30 帧），每帧提取人脸→灰度→resize(100×100)
  - 训练 LBPH 模型 → 导出 `byte[]` → base64 → `_config.Set("host", "face_data", base64)`
  - 同步存储 `_config.Set("host", "face_count", N)` — 哪个人脸
- **人脸识别**（`OpenCvSharp`）：
  - 每 K 帧（默认 3 帧）检测到人脸 → LBPH 预测 → 置信度阈值（默认 70）→ match/no match
  - 连续 3 帧命中 → 状态机 `FacesDetected`；连续 10 帧未命中 → `FacesLost`
- **状态机**：`Idle → FacesDetected → Listening → ... → FacesLost → Idle`

**新增文件**：
- `LauncherHost/Core/Agent/FaceAuthService.cs` — 人脸注册/识别/状态机
- `LauncherHost/Core/Agent/FaceRegistrationDialog.cs` — 人脸注册 UI（控件编程式构造）

**新增 NuGet**：
- `OpenCvSharp4` + `OpenCvSharp4.runtime.win`

### 3.3 音频采集（AudioCapture）

**目标**：VAD 检测语音→裁剪有效段→WAV→base64→MiMo。

**方案**：
- 使用 WinUI 3 `AudioGraph`（`Windows.Media.Audio.AudioGraph`）
  - `AudioDeviceInputNode` → 麦克风
  - `AudioFrameOutputNode` → 实时 PCM 帧（16kHz mono）
  - 环形缓冲区（5 秒窗口，`Memory<short>`）
- **VAD**：自建能量阈值法（RMS > threshold → speech，持续 200ms 确认后设标志；RMS < threshold 持续 800ms → silence → 发送）
- 备注：WebRTC VAD 有 `Concentus` NuGet 可用，但能量阈值法零依赖且对近距离麦克风足够准确
- **音频格式**：WAV PCM 16kHz mono 16-bit（MiMo 支持）
- 裁剪有效语音段 → `MemoryStream` → `Convert.ToBase64String` → `data:audio/wav;base64,...`

**新增文件**：
- `LauncherHost/Core/Agent/AudioCapture.cs` — 录音 + VAD + 裁剪

### 3.4 语音交互状态机（VoiceSession）

**目标**：协调人脸→录音→VAD→发送的完整流程。

**状态图**：
```
Idle
 ├─[face detected & voice_auto=true]→ Listening
 ├─[mic button clicked]             → Listening
 └─[text submitted]                  → stays Idle

Listening
 ├─[VAD=speech] → _buffer accumulates PCM
 └─[VAD=silence ≥800ms] → Sending

Sending
 ├─裁剪 PCM→WAV→base64→AgentService.SendAsync(audioBytes)
 └─→ Processing

Processing
 ├─[streaming delta] → AgentSession renders blocks
 └─[SendAsync complete] → Idle
```

**两种触发路径**：
- **自动模式**（`host.voice_auto = true`）：人脸识别命中→自动开始聆听
- **手动模式**：麦克风按钮点击（Agent 输入框旁）

**新增文件**：
- `LauncherHost/Core/Agent/VoiceSession.cs` — 状态机

### 3.5 设置 UI 变更

**SettingsDialog.xaml** 新增/修改：

```
全局区 ← 现有面板
  ComboBox: 选择服务提供商 (DeepSeek / MiMo)   ← 新增
  TextBox: MiMo API Key（provider=MiMo 时显示） ← 新增

AI 设置 ← 现有 AiExpander
  现有: ApiKeyBox, ModelCombo, ThinkingCombo, ExpandCotToggle
  ToggleSwitch: 语音自动聆听                    ← 新增
  Button: 注册人脸 → FaceRegistrationDialog     ← 新增
  TextBlock: 人脸注册状态（"未注册"/"已注册 N 张人脸"） ← 新增

Agent 输入栏 ← MainWindow.xaml BottomBar
  Button: 麦克风（FontIcon ⏺/⏹）               ← 新增
  动画: 语音监听中 → 麦克风按钮脉冲动画（Composition）
```

**设置 keys 汇总**：
| Key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `host.provider` | string | `"deepseek"` | 服务提供商 |
| `host.mimo_api_key` | string | `""` | MiMo API Key |
| `host.voice_auto` | string | `"false"` | 人脸自动聆听 |
| `host.face_data` | string (base64) | `""` | LBPH 模型数据 |
| `host.face_count` | int | `0` | 已注册人脸数 |

### 3.6 Agent 工具变更

**新增 Host Agent Tools**（`MainWindow.xaml.cs:RegisterHostAgent`）：

| 工具名 | 参数 | 说明 |
|--------|------|------|
| `set_provider` | `provider`:"deepseek"\|"mimo" | 切换服务提供商（自动清空对话历史） |
| `set_voice_auto` | `enabled`:bool | 人脸自动聆听开关 |
| `register_face` | 无 | 弹人脸注册引导 UI |
| `query_face_status` | 无 | 返回 `{"registered":true,"count":N}` |

---

## 4. 实施顺序与依赖关系

```
第一梯队: P0 基础设施（并行）
  ├── 3.1 ChatClient 抽象层
  ├── ConversationHistory 多模态支持
  └── SettingsDialog provider 选择 UI

第二梯队: P0 独立模块（依赖 3.1）
  ├── 3.2 FaceAuthService (OpenCvSharp LBPH)
  ├── 3.3 AudioCapture (AudioGraph + VAD)
  └── 3.5 设置 UI 完整实现

第三梯队: P1 集成（依赖 3.2 + 3.3）
  ├── 3.4 VoiceSession 状态机
  ├── Agent 输入栏麦克风按钮 + 动画
  └── 3.6 Agent 新工具注册

第四梯队: P2 增强
  ├── 连续人脸追踪稳定性调优
  ├── VAD 阈值自适应
  └── 语音输入体验打磨
```

---

## 5. 文件变更预估

| 模块 | 新增 | 修改 |
|------|------|------|
| **LauncherHost/Core/Agent/** | `ChatClient.cs` (~250行), `ProviderClientConfig.cs` (~20行), `FaceAuthService.cs` (~200行), `FaceRegistrationDialog.cs` (~150行), `AudioCapture.cs` (~150行), `VoiceSession.cs` (~250行) | `AgentService.cs`, `ConversationHistory.cs`, `AgentSession.cs`(语音发送入口) |
| **LauncherHost/Controls/** | — | `SettingsDialog.xaml`, `SettingsDialog.xaml.cs` |
| **LauncherHost/** | — | `MainWindow.xaml`(麦克风按钮), `MainWindow.xaml.cs`(新 agent tools 注册) |
| **LauncherHost/Core/Agent/** | — | `DeepSeekClient.cs`(废弃/删除) |

**预估**：新增 ~1020 行，修改 ~200 行，删除 ~230 行（DeepSeekClient 合并）。

---

## 6. 已知风险与未决问题

| 风险 | 影响 | 应对 |
|------|------|------|
| 自包含部署的 `MediaCapture` 权限 | 无 Package Identity 可能受限 | Win10 19044 支持 Capability 声明；备选：手动授权流程 |
| `FaceDetector` 准确率受光照/角度影响 | 注册环境与使用环境不一致时识别失败 | LBPH 多角度样本采集（注册时提示转头）；阈值可调 |
| `AudioGraph` 在非 MSIX 部署是否需要 Capability | 麦克风可能无法初始化 | `app.manifest` 声明 `microphone` capability |
| OpenCvSharp 30MB native DLL 对自包含部署体积影响 | 发布包膨胀 | 接受；用户已知权衡 |
| MiMo `input_audio` 的 base64 限制 50MB | 长语音可能超限 | 前端限制单次录音最长时间（~60s WAV ≈ 2MB，足够） |
| 切换 provider 清空历史可能丢失有用上下文 | 用户期望保留对话 | InfoBar 明确告知；用户可提前手动切换 |
| `FaceDetectionEffect` 仅返回 `FaceBox`，不返回特征 | 仍需 OpenCV 做 LBPH 提取 | 组合使用：WinRT 检测→截取 `SoftwareBitmap`→OpenCV LBPH |
