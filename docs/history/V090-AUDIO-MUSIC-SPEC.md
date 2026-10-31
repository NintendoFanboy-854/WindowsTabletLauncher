# v0.9 / v0.10 音频焦点 · 蓝牙状态机 · Apple Music 设计草案（v3）

> **状态**：草案 v3（2026-10-31），按最新反馈修订，待确认后实施。落地顺序：**1 音频 → 2 蓝牙 → 3 Apple Music**。
> **v3 相对 v2 的修订**（用户反馈）：
> 1. **不再尝试控制手机**。蓝牙音箱对手机只能是"本地出声 / 本地静音"；FIFO 里 BT 先播放、AM 后播放时，
>    **BT 直接本地静音**（不断连接、不碰无线电、不操控对端）。本机侧（AM）作为输家时才是"停止"= 暂停。
> 2. FIFO 输家**手动恢复**，不自动恢复；手动恢复优先，直到下一次新的播放开始再重新判定。
> 3. 彻底退出时**断开 A2DP Sink 连接**（不是关蓝牙开关/无线电）。
> 4. **删除所有性能/耗时验收目标**（"多少秒以内"这类）。这台机器性能一般，功能实现优先，不设性能 KPI。
> 5. 其余沿用 v2：启动器一直开着；AM 全部业务在插件、宿主只提供通用能力；独立 Edge profile。
> **性质**：一次性实施规格（先实现再说，不做提前抽象）；完成后结论回填 `DESIGN.md` / `DECISIONS.md` /
> `PLUGIN-CONTRACT.md` / `README.md`，本文件转历史。

## 0. 目标与非目标

### 0.1 功能目标

1. **音频焦点（需求 1）**：任何"音乐"正在响时（当前是手机→平板 A2DP Sink 的蓝牙音乐，之后是本机
   Apple Music 的播放），语音输入一开始就自动压低音乐、结束恢复；TTS 默认不参与、但一旦出 TTS 也要压；
   压低量可调；**两个音乐音源冲突时按 FIFO 处理**（后开始者胜出，先开始者淡出后停止：BT=本地静音，
   本机媒体=暂停）；所有音量变化带过渡。
2. **蓝牙状态机（需求 2）**：重写为带过渡态的显式状态机；关/断/开/连/退出都有真实的进行中状态。
   **退出不碰蓝牙无线电，但断开 A2DP Sink 连接**，然后退进程。
3. **Apple Music（需求 3）**：做成**插件**，在"不逆向、无开发者账号、只有 Edge/PWA"的约束下做到
   不逆向的天花板：播放器是 Edge 子进程里的官方网页（用户正常登录），插件面板是我们自己的 Fluent UI；
   经由宿主**通用**的受管浏览器窗口 + SMTC 能力实现遥控。所有 AM 逻辑在插件，宿主零 AM 知识。

### 0.2 非目标（本轮明确不做）

- 不逆向 / 不抓包 Apple 接口；不读取、不保存 Apple 凭据或 token。
- 不做 Apple Music 官方 API（无 Apple Developer Program 会员）。
- 不内置 DRM 播放器（WebView2 无 Widevine，见 §1.3）。
- 不操控手机端（蓝牙 Sink 对端只能"听"，不能"指挥"）。
- 不新增全屏插件页；不新增设计 token；不改默认六卡布局。
- 不做 CDP / UI 自动化。
- 不做独占模式 / ASIO / 低延迟等底层音频优化。
- **不设性能/耗时验收指标**；只验收功能是否成立。
- 不做"操作取消"、事件总线等提前抽象；先按本草案最小实现。

## 1. 现状与根因（摘要）

### 1.1 音频：没有任何焦点 / 压低层

- 录音走 WebView2 `getUserMedia`（`src/host/agent/voice/recorder.ts`），TTS 走 WebAudio
  （`src/host/agent/voice/ttsPlayer.ts`），主音量是另一套 CoreAudio（`src-tauri/src/system_status.rs`）；
  三者互不认识，中间没有"音频会话管理"。
- Windows 没有"一句话把别人音量压低"的公开 API。现实三条路：系统通信闪避（量由系统设置决定）、
  逐会话调音量（`IAudioSessionManager2` + `ISimpleAudioVolume`，可精确控制/恢复/静音）、主音量兜底。
- 现成轮子：[winmix](https://docs.rs/winmix/latest/winmix/)（Rust，MIT/Apache，可枚举并设置每个程序
  会话音量），但没有 duck / 恢复 / 过渡 / 静音 / 新会话处理语义，仍需在宿主写调度。

### 1.2 蓝牙：用户意图和物理状态混在一起

- `close_connection()` 调完 `Close()` 就把连接对象丢掉、快照立刻 `connected:false`；Windows ACL
  链路实际要过一会儿才断（D-46 实测：Close 后还要关无线电才真断）。
- 快照只有 `connected/streaming` + 自动连接 intent 状态，没有"正在连接/正在断开/正在关蓝牙/正在退出"；
  前端只能在组件里用本地 `btBusy`/`pendingDisconnect` 假装进行中，跨入口不一致。
- 所有命令排队进唯一 WinRT worker 并等回包，一轮连接尝试可能很久；断开/关总开关要排在后面，
  面板只能整体禁用。
- 退出把最慢的活放在关窗之后（停 watcher → 关无线电 → 等 ACL → 15s 强退兜底），窗口没了进程还挂着；
  `radioOffByExit` 还是关无线电成功后才落盘，强退可能留下"蓝牙被关且没恢复标记"。

### 1.3 Apple Music：三条硬约束（可验证）

1. **官网禁止被嵌**：实测 `https://music.apple.com/cn/` 返回 `X-Frame-Options: DENY` +
   CSP `frame-ancestors 'none'` → 现有插件 iframe 形态不能嵌官网。
2. **WebView2 没有 Widevine**：只有 PlayReady，Widevine 的 feature request 至今 open
   （[#4828](https://github.com/MicrosoftEdge/WebView2Feedback/issues/4828)）。Apple Music 全曲播放靠 DRM
   （Safari FairPlay / Chromium 系 Widevine），社区反馈 MusicKit JS 在 Chromium 内核只拿得到 30s 试听；
   **自家窗口完整播放不可行**。
3. **官方数据 API 要开发者会员**：Apple Music API 需 Apple Developer Program 会员 → MusicKit
   identifier + private key → ES256 developer token；本机没有会员 → 官方数据层不存在。

→ **不逆向的天花板**：Edge 子进程里的官方网页（用户正常登录）+ Windows SMTC 遥控 + 我们自己的
Fluent 面板。浏览/搜索/登录留在官方 Edge 窗口里，我们不碰凭据。

## 2. 总体架构（宿主 = 通用能力；AM = 插件）

```text
Rust 宿主（通用能力，零 Apple Music 知识）
├─ audio_focus.rs       音频焦点 / 压低 / FIFO 静音（需求 1）
├─ bluetooth_audio.rs   蓝牙 FSM v2（需求 2）
├─ browser_window.rs    受管浏览器窗口：插件给 https URL，宿主拉 Edge app 窗口（需求 3 通用能力）
├─ media_session.rs     SMTC 媒体会话：读元数据 / 发传输命令（需求 3 通用能力）
├─ exit.rs              退出协调：恢复音频 → 断开 A2DP Sink → 关受管窗口 → 退进程（需求 2/3）
└─ lib.rs               命令注册 / managed state（不出现 AM 专属逻辑）

渲染层（宿主 UI / 通用）
├─ system/audioSettings.ts + audioFocus.ts     声音设置与焦点 client
├─ system/bluetoothAudio.ts + useBluetoothAudio 蓝牙单一数据源
└─ bridge：新增通用 browserWindow.* / media.* API（任何插件可调用，不认插件 id）

插件（iframe，可插拔）
└─ public/plugins/appleMusic
   ├─ URL、登录引导、卡片、大面板、会话选择、Agent 工具 = 全部 AM 业务
   └─ 只经 bridge 调用宿主通用能力（开窗口 / 读媒体会话 / 发命令）
```

**职责边界（硬规则）**

| 事情 | AM 插件 | 宿主 |
|---|---|---|
| Apple Music 的 URL / 文案 / UI / 卡片 / 面板 / 工具 | ✅ 全部 | ❌ 代码里不得出现 |
| 受管浏览器窗口 | 请求打开哪个 URL、显示/最小化/关闭 | 通用实现、进程生命周期、退出清理 |
| SMTC 媒体会话 | 轮询、挑哪个会话、映射成 UI | 通用实现（列出会话 / 读元数据 / 发命令 / 封面） |
| 音频焦点 / 压低 / FIFO | 不参与 | 通用实现（BT 状态 + SMTC 状态 + 录音/TTS） |
| 蓝牙状态机 / A2DP Sink 连接 | 不参与 | 通用实现 |

> 插件是 iframe，**无法直接拉进程或读 SMTC**，所以宿主提供这两个通用能力；但宿主只做"通用机制"，
> 不写 AM 业务。插件可像其它插件一样单独卸载，卸载后宿主通用能力仍在但没人用。

## 3. 音频焦点与音量过渡（需求 1）

### 3.1 音源模型

| 音源 | 识别方式 | 说明 |
|---|---|---|
| 蓝牙音乐（external） | A2DP Sink 推流 + 非自身进程树的活跃会话 | 会话归属进程待 P1a 探针确认；先按通用规则处理 |
| 本机媒体（local） | SMTC 里 PlaybackStatus=Playing 的会话（当前主要是 AM） | P3 接入；FIFO 用它判定"本机音乐" |
| TTS（self） | 本应用进程树（含 `msedgewebview2.exe` 子进程） | **永不压低自己** |
| 其他插件声音 / 系统音 | self / external 同规则 | 不专门处理 |

原则：**所有控制只作用于平板本地输出（会话音量 / 静音 / 恢复），绝不影响手机端**。蓝牙音箱对手机
只能听不能说——同一条物理约束。

### 3.2 焦点模型

- 焦点请求 reasons：`voiceInput`（录音）、`speechOutput`（TTS）。未来可扩展。
- 每个音源目标增益 = min(所有 active reasons 的增益, FIFO 状态下该音源的增益)；没有请求 = 1.0。
- 幂等：同一 reason 重复 acquire 不叠加，release 只移除该 reason。

### 3.3 压低策略表

| 场景 | 蓝牙音乐 | 本机媒体（AM） | TTS |
|---|---|---|---|
| 空闲 | 100% | 100% | — |
| 录音中 | voiceGain（默认 20%） | voiceGain | 停止（现有逻辑先停 TTS） |
| TTS 中 | ttsGain（默认 20%） | ttsGain | 100% |
| 录音结束、思考中 | 恢复 100% | 恢复 100% | — |
| 双音源冲突 | FIFO：败者淡出后**本地静音** | FIFO：败者淡出后**暂停** | — |
| 退出应用 | 立即恢复 100% | 立即恢复 100% | — |

### 3.4 过渡曲线

- 淡出/淡入过渡（听感参数，不是验收指标）：默认 attack 150ms / release 300ms、约 10ms 步进。
- 最短保持一小段时间，避免快速点按造成抽动；录音→TTS 间隔很短时保持压低，不中间回弹。
- 用户在主音量 / Windows 音量混合器改了被压会话：以"上次写入值 vs 观测值"判定，识别为用户修改时
  更新恢复基线。
- 原本静音的会话保持静音，恢复时不改 mute。
- **降级**：若 P1a 探针发现 A2DP 会话音量不可写，录音期回退为压低默认端点主音量；TTS 场景不压
  （避免把 TTS 自己压了），设置页显示一行限制说明。FIFO 在同样情况下降级为"不处理"（见 §3.6）。

### 3.5 Rust 实现（`audio_focus.rs`）

- 独立 worker 线程（MTA，长期持有 `IMMDeviceEnumerator` / 默认端点 / `IAudioSessionManager2`）；
  命令通道 + 只读快照 Mutex，结构与 `bluetooth_audio.rs` 一致，不引入新框架。
- 命令：`audio_focus_acquire(reason, gain)` / `audio_focus_release(reason)` /
  `audio_focus_snapshot()` / `audio_focus_restore_all()` / `audio_focus_restore_suppressed()`。
- 枚举：`IAudioSessionManager2::GetSessionEnumerator` → `IAudioSessionControl2`（session id / state /
  pid）→ `ISimpleAudioVolume`（get/set/mute）→（可选）`IAudioMeterInformation`。
- "自身"判定：Toolhelp 进程树（本进程 + 本进程的 `msedgewebview2.exe` 子进程）→ 排除，TTS / 插件声音
  永不被压。
- 会话刷新：焦点活跃时周期性重枚举（覆盖录音中途新会话）；空闲不枚举。
- 崩溃保护：首次压低/静音时写 `app_data_dir/audio-focus-journal.json`（session id + 原始音量/静音态 +
  时间）；正常恢复删除；启动时对残留 journal 做 best-effort 恢复。退出路径另调 `restore_all`。

### 3.6 双音源冲突 = FIFO（v3 修订）

- **参与方**：`external`（蓝牙 Sink 推流中）与 `local`（SMTC 有会话在播放）。
- **判定**：任一方从"没在播"变为"在播"时记开始时间；两方同时在播 → **后开始的一方保留，先开始的一方
  被停止**。时间差很小视为同时开始（tie-break：本机媒体优先，避免电话推流和用户点播放互抢）。
- **"停止"动作**（都只作用于平板本地输出，带淡出过渡）：
  - `external`（BT，输家）：淡出到 0 → **本地静音**（`ISimpleAudioVolume::SetMute(true)`）。
    **不控制手机、不断开 A2DP 连接、不碰无线电**；手机继续推流，只是平板不出声。
  - `local`（AM，输家）：淡出到 0 → SMTC `pause` → 把会话音量恢复到原值（暂停状态无声）。
  - 两者都**不自动恢复**（FIFO 语义），等待用户手动恢复。
- **手动恢复（唯一恢复路径）**：
  - BT：快速设置面板 BT 行显示「已静音（与本机音乐冲突）」+「恢复」按钮（状态栏 pill 同步显示
    「已静音」）；点击 = 清除抑制 + `SetMute(false)` + 恢复原音量。Agent 侧对应工具
    `btAudio.restoreOutput`（用户能做，Agent 也能做）。
  - AM：用户在面板 / Edge 窗口 / 媒体键点播放即可；播放恢复即清除该源的抑制状态。
  - **手动恢复优先**：用户手动恢复后，不再因为当前赢家还在播而被立刻重新压/静音，直到下一次新的
    播放开始再按 FIFO 判定。
- **不触发 FIFO 的情况**：录音/TTS 只压低、不停止；同一方的暂停/恢复不参与 FIFO；两个本地媒体会话之间
  不接管（交给 Windows）。
- **降级**：若探针确认 A2DP 会话既不能调音量也不能静音 → FIFO 关闭（设置项显示"当前设备不支持双音源
  冲突处理"），只保留语音/TTS 压低；不拿主音量硬做（会把 AM 也压掉）。
- 设置里增加一行「双音源同时播放」：仅 **FIFO（默认）/ 不处理** 两个选项。

## 4. 蓝牙状态机 v2（需求 2）

### 4.1 状态模型（四层，单快照）

| 层 | 取值 | 语义 |
|---|---|---|
| radioPhase | `unavailable / off / turningOn / on / turningOff` | 蓝牙无线电（退出不碰） |
| linkPhase | `idle / connecting / connected / streaming / disconnecting / closed` | A2DP 链路物理事实 |
| service | 现有 autoConnectState：`off / waiting / trying / listening / backoff / paused / unavailable` | 自动连接意图 |
| operation | `null \| { id, kind, deviceId?, stage, startedAtMs }` | 正在进行的显式操作 |

- 快照新增 `radioPhase` / `linkPhase` / `operation` / `lastTransitionAtMs`；旧字段 `connectionState`、
  `connected`、`streaming` 保留兼容（`connected` 在 disconnecting 期间仍为 true，UI 以 `linkPhase` 为准）。
- 快照新增 `outputSuppressed`（是否被 FIFO 本地静音）与 `suppressReason`，供面板显示"已静音"。

### 4.2 关键时序

- **连接**：`connecting` → OpenAsync 成功 + 观察 Opened → `connected` / `streaming`（沿用现有
  `ever_opened` 语义，不回归）。
- **手动断开**：`disconnecting` → `Close()`（不再访问 `State()`，D-46 已知会卡）→ 观察 ACL 状态 →
  `idle`；若迟迟无法确认，结束 operation 并置 `unverifiedDisconnect=true`，UI 文案"可能仍连接"
  （不撒谎）。
- **关总开关**：`disable` operation → 记 paused / 停自动连接 → close + 观察 ACL → 停 watcher →
  清设备列表 → 关。阶段写进 `operation.stage` 供 UI 显示（"正在断开…"/"正在停止寻找…"）。
- **开总开关**：`enable` → 若蓝牙关先 `turningOn` → 起 watcher → 等设备 → `waiting`，阶段可见。
- **系统蓝牙被外部关闭**：现有 `refresh_radio` 联动保留，但把"关总开关/清设备/断连"的副作用从轮询
  函数里挪进显式 transition，轮询只负责检测 + 触发一次。
- **自动连接**：保留 D-44 队列/退避；自动尝试也体现为 operation / stage，UI 显示"正在连接 X…"。
- **FIFO 静音态**：BT 因 FIFO 输给本机媒体时，**连接与推流保持原样**，只是本地输出被静音（§3.6）；
  不影响自动连接逻辑，也不产生 `paused`。

### 4.3 命令与轮询（非阻塞）

- `bt_audio_connect / disconnect / set_enabled / set_bluetooth` 改为**非阻塞**：manager 先把 operation
  写进快照再入队，立即返回快照；worker 完成后清 operation、更新状态。
- `bt_audio_refresh` 保留阻塞语义（显式重新扫描），只在首次挂载/蓝牙设置入口用。
- 前端轮询：空闲 2s（状态栏）/1.5s（设置页）；`operation != null` 或 linkPhase 处于过渡态时提高频率
  （实现细节，不作为验收指标）。本轮不加 Tauri 事件推送。

### 4.4 退出路径（v3：不碰无线电，断开 A2DP Sink）

所有退出入口（窗口关闭 / Ctrl+Q / `app_exit` / 设置页退出）统一走一个 coordinator：

1. `prevent_close` + 立即 `window.hide()`（体感即时关闭）；
2. 依次做：
   - `audio_focus_restore_all()`（恢复所有被压低/静音的会话）；
   - 结束受管 Edge 子进程；
   - **断开 A2DP Sink 连接**（`Close()`；不碰蓝牙无线电、不关 watcher、不操控手机）；
3. `std::process::exit(0)`。实现上给一个内部兜底，避免某一步卡死导致进程永远不退；
   **不设耗时验收指标**。

- 手机端在 A2DP Sink 关闭后可能仍显示"已连接"（D-46 已知，无线电才决定 ACL），我们接受并在
  已知限制里写明。
- 删除写 `radioOffByExit` 的代码；保留启动时对旧配置 `radioOffByExit=true` 的一次性恢复（升级兼容）。
- 保留 `%TEMP%\wtsl-exit-trace.log` 打点，方便真机排查，不作为验收指标。

### 4.5 UI 映射

- 状态栏 pill：有 operation 时优先显示过渡文案（连接中…/断开中…/关闭中…/打开蓝牙中…/正在停止寻找…）；
  FIFO 静音时显示「已静音」。
- 快速设置设备行：状态优先级在原有规则上加 `linkPhase`/`operation`/`outputSuppressed`；
  **只禁用受影响的控件**（断开中只禁断开+开关，不禁用音量/亮度）。
- 设置页设备分组：按钮进行中显示阶段文案；错误保留 MessageBar。
- Agent 工具：`btAudio.status/devices` 返回新字段；`connect/disconnect` 改为"发起 + 等待终态"
  （工具侧轮询直到结束，返回 `{ ok, linkPhase, reason }`），不假装成功；新增 `btAudio.restoreOutput`
  （解除 FIFO 静音，与面板「恢复」按钮对等）。
- 删除全部本地 `btBusy`/pending 布尔，改为 store 派生（单一数据源）。

### 4.6 已知边界（本轮不做）

- 不做操作取消/抢占。
- 不做逐设备连接进度条；不做事件总线；不做蓝牙配对（沿用 D-39）。
- 退出后手机端显示不保证（不关无线电）。

## 5. Apple Music 插件（需求 3）

### 5.1 前提与天花板

- 无开发者账号 → 无官方 API → 资料库/搜索/歌单无法在我们插件里重写；
- WebView2 无 Widevine + 官网禁止 iframe → 不能在自家窗口播放；
- 本轮 = **插件自己的 Fluent 面板 + 官方网页在 Edge 窗口里播放 + SMTC 遥控**；浏览/搜索/登录留在
  官方 Edge 窗口，我们不碰凭据；不做 CDP/UI 自动化。

### 5.2 插件 ⇄ 宿主职责（硬边界）

- **插件负责**：Apple Music 的 URL、登录引导文案、卡片/大面板 UI、SMTC 会话选择与状态映射、
  Agent 工具（`appleMusic.*`）、空态/错误态文案、面板按钮。
- **宿主提供（通用、无 AM 知识）**：
  1. `browserWindow`：受管浏览器窗口（打开 https URL、显示/最小化/关闭、状态读取、进程生命周期、
     退出清理）；
  2. `mediaSession`：SMTC 会话列表 / 元数据 / 封面 / 传输命令（按会话 id）；
  3. 音频焦点（§3）与蓝牙 FSM（§4）——插件不参与。
- 宿主**不认插件 id**：bridge 新增的 API 是通用的，任何插件都能用；插件卸载后宿主代码不受影响。

### 5.3 受管浏览器窗口（宿主通用能力 `browser_window.rs`）

- **打开**：`browser_window_open({ url })`。宿主定位 `msedge.exe`（注册表 App Paths + 已知路径；
  本机实测 `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`），以 app 模式启动：
  `--app=<url>`、`--user-data-dir=%APPDATA%\<app_data>\browser-window-profile`（独立 profile，
  不碰用户 Edge）、`--no-first-run --no-default-browser-check`、`--window-size=1200,800`、居中
  （按屏幕工作区 clamp）；单实例：已运行则 show/restore。
- **控制**：`browser_window_control({ action: 'show'|'hide'|'minimize'|'close' })`；
  `browser_window_state()` 返回 `{ running, visible, minimized, url }`。
- **启动器不隐藏**：Edge 窗口是普通窗口，浮在全屏启动器上方；用户可拖动/最小化/关闭，启动器始终在。
  面板提供「打开播放器 / 最小化 / 关闭播放器」。
- **生命周期**：窗口/进程被用户关闭 → 状态置未运行（插件据此显示空态）；启动器退出时由 exit
  协调器结束该进程（先尝试正常关闭，不行再强杀）。
- **安全**：只接受 https URL、单窗口实例、不执行插件传入的命令/路径；插件本身是用户信任的本地代码。
- **降级**：找不到 Edge → 命令报错，插件显示"打不开播放器"；不静默回退默认浏览器。

### 5.4 SMTC 媒体会话（宿主通用能力 `media_session.rs`）

- WinRT `GlobalSystemMediaTransportControlsSessionManager`（D-39 探针已确认本机可用）。
- **读**：会话列表（appId / title / artist / album / playbackStatus / position / duration /
  canPlayPause / canNext / canPrevious / 封面 key）；封面按 key 单独取 data URL，插件缓存。
- **写**：`play/pause/toggle/next/previous`（按会话 id）；seek 本轮不做（需要时再加）。
- **会话选择是插件逻辑**：插件用 `appId`/最近更新/窗口运行状态挑"我们的 AM 会话"；P3a 探针确认本机
  Edge 的 AUMID 后固化规则。宿主不写死任何 appId。
- **降级**：SMTC 无会话但受管窗口在跑 → 宿主提供通用 `media_key(command)`（`SendInput` 媒体键）兜底，
  插件只能显示"正在播放"占位；不把这条当默认路径。
- 轮询：面板打开时较频、卡片常驻时较疏、页面隐藏时暂停（具体间隔实现时定，不设验收指标）。

### 5.5 插件 `public/plugins/appleMusic`

- manifest：id `appleMusic`、name「Apple Music」、`identityHue: "pink"`（唯一落点 = 20px identity
  图标）、widgets：一个卡片，sizes `[[2,1],[3,2],[4,2]]`，defaultSize `[2,1]`；无 settings schema；
  **不加入默认布局**（六卡定稿不动；用户在编辑模式「添加组件」）。
- 卡片（L0）：identity 行 + 曲名/歌手 + 播放/暂停快捷按钮（44 命中、`stopPropagation`）；
  空态中性图标 +「未在播放」；点卡片 → 详情浮层。
- 大面板（L1，`size: 'large'` 浮层）：**1120 × min(80vh, 760)**（1024 屏按 92vw 自适应），三块：
  1. 正在播放：`Artwork` 320 + 曲名/歌手/专辑 + 播放器状态；
  2. 进度与传输：进度（`HeroProgress` + 时间）+ 上一曲/播放暂停/下一曲（≥44 触控）；
  3. 动作：打开播放器 / 最小化播放器 / 关闭播放器（secondary；关闭 = 结束受管窗口进程）。
  空态（播放器未运行）：`EmptyState`「未在播放」+ 打开播放器。
- 不做 seek 拖动。
- Agent 工具（与 UI 对等）：`appleMusic.status`（只读）、`appleMusic.playback`
  （play/pause/toggle/next/previous）、`appleMusic.openPlayer`、`appleMusic.minimizePlayer`、
  `appleMusic.closePlayer`。
- 登录：用户在被拉起的 Edge 窗口里正常 Apple ID 登录（含 2FA），会话存在受管 profile；插件不读取、
  不保存凭据，也无法知道"是否已登录"，只按播放器/媒体会话状态显示。

### 5.6 共享原语与契约变更

- 新增共享原语 `Artwork`（封面图：固定尺寸档、`borderRadius2XLarge`、无阴影；无图时中性音符图标），
  写入 `_shared/ui.jsx` + `PLUGIN-CONTRACT §4.4`。
- 浮层新增 `size: 'default' | 'large'`：SDK `requestOverlay('detail', title, { size: 'large' })` →
  payload `{ view, title, size }` → `PluginOverlay` 变体；`overlayMotion` 已按实测 surface rect 做动画，
  无需改算法；契约 §3.5/§4.1 补大面板几何。
- bridge 新增通用 API（见 §6.3）；`PROTOCOL_VERSION 2 → 3`（仅新增，旧插件无感）。
- `public/plugin-sdk.js` 补包装；插件构建脚本自动发现，无需改。

## 6. 接口草案

### 6.1 Rust 命令

| 命令 | 形态 | 说明 |
|---|---|---|
| `audio_focus_acquire` | `(reason, gain) -> AudioFocusSnapshot` | 录音 / TTS 焦点 |
| `audio_focus_release` | `(reason) -> AudioFocusSnapshot` | 释放焦点 |
| `audio_focus_snapshot` | `() -> AudioFocusSnapshot` | 诊断 / 设置页 / 面板状态 |
| `audio_focus_restore_all` | `() -> ()` | 退出兜底 |
| `audio_focus_restore_suppressed` | `() -> AudioFocusSnapshot` | FIFO 手动恢复（BT 静音解除） |
| `bt_audio_connect / disconnect / set_enabled / set_bluetooth` | 改为非阻塞，返回快照 | 语义变化，前端 API 不变 |
| `bt_audio_refresh` | 阻塞（不变） | 显式扫描 |
| `browser_window_open` | `(url) -> BrowserWindowState` | 打开 / 显示受管 Edge 窗口 |
| `browser_window_control` | `(action) -> BrowserWindowState` | show / hide / minimize / close |
| `browser_window_state` | `() -> BrowserWindowState` | 运行状态 |
| `media_session_list` | `() -> MediaSessionSnapshot` | SMTC 会话列表 |
| `media_session_command` | `(session_id, command) -> Snapshot` | 传输控制 |
| `media_session_artwork` | `(session_id) -> String` | 封面 data URL（按 key 缓存） |
| `media_key` | `(command) -> ()` | 媒体键兜底（通用） |
| `app_exit` | `() -> ()` | 统一退出 coordinator |

### 6.2 前端类型（草案）

```ts
type AudioFocusReason = 'voiceInput' | 'speechOutput';

interface AudioFocusSnapshot {
  active: AudioFocusReason[];
  fifo: { winner: 'external' | 'local' | null; suppressed: 'external' | 'local' | null };
  sources: {
    kindHint: 'local-media' | 'external-media' | 'other';
    pid: number;
    process: string;
    state: string;
    originalVolume: number;
    appliedVolume: number;
    muted: boolean;
    gain: number;
  }[];
}

type LinkPhase = 'idle' | 'connecting' | 'connected' | 'streaming' | 'disconnecting' | 'closed';
type RadioPhase = 'unavailable' | 'off' | 'turningOn' | 'on' | 'turningOff';

interface BtOperation {
  id: string;
  kind: 'connect' | 'disconnect' | 'enable' | 'disable' | 'bluetoothOn' | 'bluetoothOff' | 'refresh';
  deviceId?: string;
  stage: string;
  startedAtMs: number;
}

interface BrowserWindowState { running: boolean; visible: boolean; minimized: boolean; url?: string; }

interface MediaSessionInfo {
  id: string; appId: string; title?: string; artist?: string; album?: string;
  playing: boolean; positionMs?: number; durationMs?: number;
  canPlayPause?: boolean; canNext?: boolean; canPrevious?: boolean;
  artworkKey?: string;
}
interface MediaSessionSnapshot { sessions: MediaSessionInfo[]; }
```

### 6.3 插件桥接新增（`HostApiMethod` / `HostApiMap`，通用）

- `openBrowserWindow: { params: { url: string }; result: BrowserWindowState }`
- `browserWindowControl: { params: { action: 'show' | 'hide' | 'minimize' | 'close' }; result: BrowserWindowState }`
- `browserWindowState: { params: never; result: BrowserWindowState }`
- `mediaSessions: { params: never; result: MediaSessionSnapshot }`
- `mediaCommand: { params: { sessionId: string; command: 'play' | 'pause' | 'toggle' | 'next' | 'previous' }; result: MediaSessionSnapshot }`
- `mediaArtwork: { params: { sessionId: string }; result: string }`
- `mediaKey: { params: { command: 'play' | 'pause' | 'toggle' | 'next' | 'previous' }; result: void }`
- `PROTOCOL_VERSION 2 → 3`；SDK 对应 `plugin.browserWindow.*` / `plugin.media.*`。

## 7. 实施阶段与文件范围

### P1 音频焦点（需求 1）

- Rust：新增 `src-tauri/src/audio_focus.rs`；`lib.rs` 注册 state/命令；`Cargo.toml` 新增
  `Win32_System_Diagnostics_ToolHelp`（进程树）。
- 前端：新增 `src/host/system/audioSettings.ts`（`wtsl.audio` normalize）、
  `src/host/system/audioFocus.ts`；改 `src/host/agent/hooks/useAgentSession.ts`
  （start/stop/cancel/speak/unmount）；改 `src/host/pages/settings/SettingsPage.tsx`（声音分组）。
- 验证：typecheck/build；真机：手机推流 → 语音输入 → 音乐压低/恢复；开 TTS → 压低；设置档位生效；
  退出后无残留压低。
- 不做：FIFO（需要 P2 的 BT 状态 + P3 的 SMTC，放到 P3c）。

### P2 蓝牙 FSM + 退出（需求 2）

- Rust：重写 `src-tauri/src/bluetooth_audio.rs`（linkPhase/radioPhase/operation；命令非阻塞；
  disconnect ACL 观察；enable/disable 阶段；`refresh_radio` 副作用外移）；`src-tauri/src/lib.rs`
  退出 coordinator（hide → 恢复音频 → 断开 A2DP Sink → 关受管窗口 → `process::exit`；
  删掉关无线电/ACL 等待/15s 兜底）。
- 前端：`src/host/system/bluetoothAudio.ts` 类型；新增 `useBluetoothAudio` store（App 层）；改
  `StatusBar.tsx` / `QuickSettingsPanel.tsx` / `BluetoothSpeakerSettings.tsx`；`agent/tools/registry.ts`
  加等待终态 helper 与 `btAudio.restoreOutput`；`shell/useGlobalShortcuts.ts` / 设置页退出一致走
  coordinator。
- 验证：真机矩阵 §8.1；退出前后 `bluetoothOn` 不变、蓝牙键鼠不掉、A2DP Sink 已断开。

### P3 Apple Music（需求 3）

- **P3a 宿主通用能力**：新增 `browser_window.rs` + `media_session.rs` + 命令；手动探针（Edge 窗口、
  登录、SMTC 会话/AUMID、窗口控制、kill）。
- **P3b 桥接 + 插件**：bridge 通用 API + SDK；`public/plugins/appleMusic/`（卡片 + 大面板 + 构建产物）；
  `Artwork` 原语；浮层 `large`；契约/DECISIONS/README 文档。
- **P3c FIFO 冲突**：`audio_focus` 接 BT 状态 + SMTC 状态，实现 §3.6（BT=静音、AM=暂停、手动恢复）；
  退出顺序串联；验证与截图。
- **不做**：官方 API、CDP、全屏、seek、资料库重写。

版本：P1 + P2 → **v0.9.0**；P3 → **v0.10.0**（也可以合并到 0.9.0，按你方便）。

## 8. 验证计划

### 8.1 真机矩阵（需要你的设备/账号）

| # | 场景 | 期望 |
|---|---|---|
| P1-1 | 手机推流播放 → 按住空格录音 | 音乐淡出到 20%，松手淡回 |
| P1-2 | 快速点按 | 不产生明显抽动（最短保持） |
| P1-3 | Edge 播放 Apple Music → 录音 | AM 被压低（P3 前半验证） |
| P1-4 | 设置改档位 / 关开关 | 下一次录音按新设置生效 |
| P1-5 | 录音中手机开始推流 / 推流中录音 | 新会话也被纳入压低 |
| P1-6 | 强杀进程后重启 | 残留压低被 journal 恢复 |
| P2-1 | 空闲点断开 | "正在断开…"→ 最终"未连接"或"可能仍连接" |
| P2-2 | 连接中点断开 | 当前操作结束/中断后执行断开 |
| P2-3 | 关 / 开总开关 | 分阶段文案：断开→停止寻找→关闭；开：打开蓝牙→寻找 |
| P2-4 | 播放中关闭窗口 / Ctrl+Q | 进程退出；`bluetoothOn` 不变；A2DP Sink 连接已断开（推流停止）；手机端显示不保证 |
| P2-5 | 蓝牙键鼠连接时退出 | 外设不掉线 |
| P2-6 | 系统蓝牙被外部关掉 | 总开关跟关、停止寻找（沿用 D-49） |
| P3-1 | 首次打开播放器 | Edge 窗口出现、可正常登录 Apple ID 并播放；**启动器仍开着** |
| P3-2 | 面板读状态 | 曲名/歌手/专辑/封面/进度/播放状态正确 |
| P3-3 | 面板控制 | 播放/暂停/上一曲/下一曲 与官方播放器一致 |
| P3-4 | 窗口按钮 | 打开 / 最小化 / 关闭播放器正常；关闭后音乐停、面板回空态 |
| P3-5 | 退出启动器 | Edge 子进程一并结束，无残留 |
| P3-6 | BT 先播、AM 后播 | BT **本地静音**（手机仍在播），AM 继续；面板显示 BT「已静音」+「恢复」；点恢复后 BT 出声 |
| P3-7 | AM 先播、BT 后播 | AM 淡出后**暂停**，BT 继续；AM 手动恢复播放即可 |
| P3-8 | 大面板 1440×960 / 1024×768 | 1120×760 / 自适应 92vw，动效正常 |

### 8.2 自动化

- `npm run typecheck` / `npm run build`；现有 `scripts/verify-*` 全量回归。
- Rust 纯函数单测：增益取 min / FIFO 判定（时间戳）/ 静音恢复。
- 新增 CDP 断言：大面板尺寸、过渡态文案（沿用现有 CDP 方式）。
- 证据：`shots/`（不入库）；结论回填 `docs/`。

### 8.3 退出功能检查（不看耗时）

- 退出后：蓝牙无线电状态不变（`bluetoothOn` 与退出前一致）、蓝牙键鼠不掉线、A2DP Sink 连接已关闭
  （手机推流停止）、Edge 子进程已结束、被压低/静音的会话音量已恢复。

## 9. 风险与回退

| 风险 | 影响 | 回退 / 缓解 |
|---|---|---|
| A2DP Sink 会话不可写（不能调音量/静音） | 压低与 FIFO 静音失效 | 录音期回退主音量压低（TTS 不压）；FIFO 关闭并显示"当前设备不支持"；设置页说明 |
| 手动恢复入口不明显 | BT 被静音后用户不知道怎么出声 | 快速设置行内「已静音（与本机音乐冲突）」+「恢复」；状态栏「已静音」；Agent `btAudio.restoreOutput` |
| SMTC 会话识别不准 | 面板显示/控制不对 | P3a 探针固化规则；媒体键兜底；插件内降级 |
| Edge 窗口与全屏启动器叠放 | 体感 | 普通窗口、可最小化；面板提供最小化；不隐藏启动器 |
| Edge 子进程残留 | 进程泄漏 | 退出时结束进程；启动时清理上次残留 |
| 大面板改动浮层动画 | 视觉回归 | 1440/1024 两种尺寸验证 |

## 10. 待确认默认值（点头即可，或改）

1. 压低默认 **20%**，档位 50/30/20/10/静音。
2. **录音结束立即恢复音乐**（思考中不压）；TTS 开始时再压。
3. **FIFO 冲突**：后开始播放者胜出；先播放者淡出后停止——BT=**本地静音**（不操控手机、不断连接），
   AM=**暂停**；**输家手动恢复，不自动恢复**；手动恢复优先到下一次新的播放开始。
4. **退出**：不碰蓝牙无线电；断开 A2DP Sink 连接；结束 Edge 子进程；恢复音频；退进程。不设耗时指标。
5. **启动器始终开着**；播放器是浮在上面的普通 Edge 窗口（1200×800，可最小化/关闭）。
6. **AM 全部业务在插件**；宿主只提供通用 `browserWindow` / `mediaSession` 能力 + 音频焦点 + 蓝牙 FSM。
7. **大面板 1120×760**；AM 卡片默认 2×1，**不加入默认布局**。
8. AM 使用**独立 Edge profile**（需要你在里面重新登录一次 Apple ID；我们不碰凭据）。
9. 本轮**不做 seek / 资料库重写 / CDP / 官方 API / 全屏**。

## 11. 实现时同步更新的文档

- `DECISIONS.md`：拟登记 **D-50 音频焦点与压低**、**D-51 蓝牙 FSM v2 与退出路径**、
  **D-52 通用受管浏览器窗口 + SMTC 的插件化 Apple Music**（含 FIFO 语义与"不做"边界）。
- `DESIGN.md §8`（蓝牙/系统控制）；`README.md`（特性、安装、已知限制）；
  `PLUGIN-CONTRACT.md`（`Artwork`、大面板几何、通用媒体/窗口 API）；`AGENT-SURFACE-CONTRACT.md`
  （语音压低行为）；`TOKEN-MAP.md` 注明无新增 token。
- 本文件实现后回填验证结果，按 `docs/README.md` 约定留档。

## 12. 实现状态（2026-10-31）

> 本轮把 §3–§7 从草案变成代码：**P1 + P2 + P3a/P3b/P3c**，外加一轮 UI/UX 评审与 FIFO 开关接线。
> 版本号未动（`package.json` / `src-tauri/Cargo.toml` / `src-tauri/tauri.conf.json` 仍为 **0.8.1**），
> 未打安装包；本文件自此转历史，结论已回填现行文档（见 §12.5）。

### 12.1 已实现范围

- **P1 音频焦点**：`src-tauri/src/audio_focus.rs`（worker / 逐会话 `ISimpleAudioVolume` / reasons /
  150ms–300ms 过渡 / 300ms 最短保持 / 500ms 重枚举 / journal 崩溃恢复 / FIFO 仲裁）；
  `lib.rs` 注册 6 个命令（`audio_focus_snapshot / acquire / release / restore_all / set_fifo /
  restore_suppressed`）；`Cargo.toml` 增加 `Win32_System_Diagnostics_ToolHelp`。
  前端 `src/host/system/audioSettings.ts`（`wtsl.audio`）、`audioFocus.ts`（幂等 + 串行 IPC）；
  `useAgentSession.ts` 接录音 / 朗读生命周期；设置页「常规 → 声音」5 行。
- **P2 蓝牙 FSM + 退出**：`bluetooth_audio.rs` 四层快照（`radioPhase` / `linkPhase` /
  `autoConnectState` / `operation`）、非阻塞命令 + worker 收养 queued 操作、断开观察 ACL 与
  `unverifiedDisconnect`、总开关 transition stages；`lib.rs` 的 `begin_exit` 统一退出
  （hide → 恢复音频 → 断开 A2DP Sink → 结束受管 Edge 窗口 → `process::exit`）；
  删除 15s 强退与 `radioOffByExit` 写入（旧配置启动时一次性恢复）。
  前端新增 `useBluetoothAudio.ts` 单一 store；`StatusBar` / `QuickSettingsPanel` /
  `BluetoothSpeakerSettings` 改用 store；`bluetoothAudio.ts` 增加终态等待 helper 与过渡文案；
  Agent 5 个工具（`status / devices / connect / disconnect / restoreOutput`）。
- **P3a 通用能力**：`browser_window.rs`（https-only、独立 profile、Edge app 窗口 1200×800、
  单实例、show/hide/minimize/close、退出清理）；`media_session.rs`（SMTC 列表 / 元数据 /
  封面 / 传输命令 / `media_key` 兜底）；对应 7 个 Rust 命令。
- **P3b 桥接 + 插件**：`PROTOCOL_VERSION = 3`、7 个通用 HostApi、`plugin-sdk.js` 与
  `_shared/host.js` 包装；`PluginOverlay` 的 `size: 'default' | 'large'`；
  `Artwork` 原语；`autoPlace?: boolean`（`manifest.ts` / `Desktop.tsx`）；
  `public/plugins/appleMusic`（manifest / 卡片 / large 面板 / Agent 工具 / 会话选择启发式）。
- **P3c FIFO**：`audio_focus.rs` 的 `FifoArbiter`（1000ms 评估 / 后播优先 / tie-break 本机媒体优先 /
  external 本地静音 / local 淡出后 SMTC pause / 手动恢复进入手动覆盖）；
  面板「已被本机音乐静音」+「恢复」、状态栏「已静音」、Agent `btAudio.restoreOutput`。
- **UI/UX 评审**：暗色面板 `#2886de`（D-43 登记值）、2×1 空态 compact 23% 空带、
  三个窗口动作名超过 4 字、v0.8.0 既有状态色——四项均**已接受、不修**，登记在 D-52。
- **FIFO 开关接线**：设置「两个音源同时播放」不再只保存；`App.tsx` 启动按持久化值调
  `audio_focus_set_fifo`，设置页切换立即同步（`audio_focus_set_fifo`），关闭时清残留压制。

### 12.2 与草案的偏差（按代码事实）

1. **自进程判定收窄到 WebView2 子树**：草案写“本进程 + `msedgewebview2.exe` 子进程”，代码只沿
   `msedgewebview2.exe` 向下排除、**不排除宿主拉起的 `msedge.exe`**——否则 Apple Music 会被当成
   自身而永不压低 / 不参与 FIFO（`audio_focus.rs` 的 `self_process_tree` 注释）。
2. **`radioPhase` UI 未单独显示**：快照与前端类型都有 `radioPhase`，但状态栏 / 面板 / 设置页只用
   `operation`、`linkPhase`、`bluetoothOn` 组合文案；`radioPhase` 当前只在 `?statusDemo` 假数据里出现。
3. **FIFO 设置开关已接线**（草案只写“设置里增加一行”）：新增 `audio_focus_set_fifo` 命令，
   App 启动与设置页切换时同步；`fifo_enabled` 进入快照。`audioSettings.ts` 文件头仍保留早期注释
   “P1 只保存、不消费”，属未同步的旧注释（代码已消费）。
4. **新增 `audio_focus_set_fifo`**（草案 §6.1 未列）；`audio_focus_acquire` 的 `gain` 定为 0–100
   整数百分比（草案只写 `gain`，未定单位）。
5. **退出顺序与兜底**：草案 §4.4 写“恢复 → 结束 Edge → 断开 A2DP”；代码实际为
   **恢复音频 → 断开 A2DP Sink → 结束 Edge → `process::exit`**（A2DP 先做，避免手机还在推流时 Edge 先死）。
   内部兜底：`restore_all` 3s、`close_for_exit` 2s、总兜底 6s；**没有耗时验收指标**。
6. **无主音量 fallback**：草案 §3.4 的“A2DP 会话不可写 → 回退主音量”未实现；`SetMasterVolume` 失败
   只记一次日志并接受写入（避免 10ms 重试刷屏）。P1a 探针未做，真机确认不可写后再决定是否补。
7. **`media_key` 兜底未接线**：宿主命令、桥接方法、SDK 包装都已实现，但 `appleMusic` 插件没有调用它；
   SMTC 无会话时面板直接空态，不显示“正在播放”占位（草案 §5.4 的兜底“不把这条当默认路径”，实际连
   非默认路径也没走）。
8. **A2DP 会话归属仍待真机**：FIFO 的 external 判定用 `bt.snapshot().streaming`；会话压低对
   “非 `local-media` 的会话”统一施加，避免归属不明时蓝牙音乐漏静音。SMTC 的 Edge AUMID 同样待真机
   （插件用 appId 含 `edge` / `msedge` 的启发式）。
9. **Apple Music 不自动上桌落成通用 `autoPlace: false`**（草案只写“不加入默认布局”）；`manifest`
   无 `cell`、`defaultSize [2,1]`、`sizes [[2,1],[3,2],[4,2]]`。
10. **`Artwork` 尺寸档定为 48/96/160/240/320**（草案只写“固定尺寸档”）；默认 320，
    卡片 3×2 用 160、4×2 用 240。
11. **大面板几何**：`min(1120px, 92vw) × min(80vh, 760px)`，与草案一致（1024×768 下取 92vw / 80vh）。
12. **未升版本号 / 未打包**：三处版本仍 0.8.1；本轮没有 `npx tauri build`、没有安装包、没有真机运行。

### 12.3 已执行的验证（本轮）

- Rust：`cargo check`（Lead 执行，通过）。
- 前端：`npx tsc --noEmit`（Lead 执行，通过）。
- 插件：插件构建（`public/plugins/appleMusic/app/app.js` 已由 `node scripts/build-plugin.mjs appleMusic`
  重建；文件时间 2026-10-31 19:35）。
- UI/UX 评审：完成，结论见 D-52 决策第 9 条（四项已接受例外）。
- 打包 / 安装（2026-10-31）：`npx tauri build --bundles nsis` 通过（release 14m14s；NSIS
  `Windows Tablet Launcher_0.9.0_x64-setup.exe` 4.29 MiB）；NSIS `/S` 静默安装 exit 0，
  注册表 `DisplayVersion` 与安装后 `app.exe` FileVersion 均为 0.9.0；产物与 SHA256 在 `release/v0.9.0/`。
- **未执行**：安装版运行、真机矩阵、CDP 自动化回归。

### 12.4 待真机验证（§8.1 原表，编号不变）

- P1：P1-1（推流中录音压低 / 松手恢复）、P1-2（快速点按不抽动）、P1-3（AM 播放中录音）、
  P1-4（改档位 / 关开关下一次生效）、P1-5（录音中新会话纳入）、P1-6（强杀重启 journal 恢复）。
- P2：P2-1（空闲断开）、P2-2（连接中断开）、P2-3（开关总开关分阶段文案）、P2-4（播放中退出：
  `bluetoothOn` 不变、A2DP 已断、手机显示不保证）、P2-5（蓝牙键鼠退出不掉线）、P2-6（系统蓝牙被外部关闭联动）。
- P3：P3-1（首次打开播放器并登录）、P3-2（面板读状态）、P3-3（面板控制）、P3-4（窗口按钮）、
  P3-5（退出结束 Edge）、P3-6（BT 先播 / AM 后播 → BT 本地静音 + 恢复）、P3-7（AM 先播 / BT 后播 →
  AM 暂停）、P3-8（大面板 1440×960 / 1024×768）。

### 12.5 文档落点

- `DECISIONS.md`：**D-50**（音频焦点）/ **D-51**（蓝牙 FSM v2 + 退出）/ **D-52**（受管窗口 + SMTC +
  Apple Music）/ **D-53**（双音源 FIFO）。
- `DESIGN.md §8`：设备 / 系统控制（蓝牙状态机、退出、音频焦点、FIFO、Apple Music、声音设置位置）。
- `PLUGIN-CONTRACT.md`：§1（能力表 + 7 个通用 API）、§2.3（`autoPlace`）、§3.5 / §4.1（浮层 `large`）、
  §4.4（`Artwork`）、§4.4.3（按钮文案例外）、§6（媒体 / 窗口类工具对等）。
- `AGENT-SURFACE-CONTRACT.md §21`：录音 / 朗读压低行为、设置、边界。
- `TOKEN-MAP.md §8 / §11`：`large` 浮层几何、`Artwork` 档位、150/300ms、`wtsl.audio` 档位；无新增 token。
- `README.md`：特性 / 安装（Apple Music 用法）/ 已知限制 / 验证状态。
- `docs/README.md`：history 目录加上本文件。

### 12.6 P3d：CDP 接管 + 富信息面板（2026-10-31 晚，D-55）

- **用户决策**：明确选择 CDP 路线（原话「肯定选 CDP 那条路」）；边界不变：不逆向、不拦截凭据，用户正常登录官方网页，插件操作同一个已登录页面。
- **宿主**：`browser_window.rs` 增加通用调试端口（`--remote-debugging-port` 系统分配空闲回环端口 + `--remote-debugging-address=127.0.0.1` + `--remote-allow-origins` 三个本项目 origin）与 `browserWindowDebugTargets` 透传；窗口身份改为「调试端口 owner pid」（修 Edge 中继启动导致的假退出）；`managed-window.json` 记录身份并在 open 前清理崩溃遗留实例；退出改为 `WM_CLOSE` → `TerminateProcess` → 后台 `taskkill /T /F`（修「退出 launcher 但 AM 没退出」）。新增 windows crate features `Win32_NetworkManagement_IpHelper` / `Win32_Networking_WinSock`。`lib.rs` 仅注册命令。
- **插件**：新增 `cdp.js`（WebSocket + `Runtime.evaluate` + `Input.dispatchMouseEvent`）与 `library.js` CDP 数据层/状态机；`Detail.jsx` 重做富信息 L1/L2；`Card.jsx` 3×2/4×2 加状态行 + 上一曲/播放暂停/下一曲 44 组；`main.jsx` 修 `colorScheme`（白滚动条根因）。
- **关键真机结论**：
  1. 隐藏窗口下页面 `visibilityState=hidden`，Apple Music DRM 起播不推进（15s+ `readyState=0`）；`Emulation.setFocusEmulationEnabled(true)` 后同一点击正常起播，窗口仍隐藏；
  2. 独立 profile 冷启动资料库 hydration 40–60s，首同步需保持「正在连接播放器」并短轮询，不能先报空；
  3. WebView2 里插件 iframe 的 `visibilityState` 可能长期 hidden，轮询不能永久停摆（hidden 时定时重试）；
  4. Edge 156 显式端口模式不写 `DevToolsActivePort`，遗留实例身份必须自己落盘；
  5. 卡片/Agent 工具仍 SMTC（单 CDP 客户端约束），资料库/点歌只在面板内。
- **验证**：`cargo check --lib`、`npx tsc --noEmit`、插件构建通过；离线 E2E 41 断言、采集器 fixture 18 断言、状态机 harness 23 断言全 PASS；安装版 + 真实登录态 Edge 156 真机：21 个播放列表（封面/描述/数量）→ L2 31 首（序号/专辑/时长）→ 隐藏窗口下点歌真实起播（`currentTime` 5.77s / `readyState=4`）→ 面板暂停生效 → 显示/关闭播放器 → 退出 launcher 后 Edge 一并结束。P3-1/P3-2/P3-3/P3-4/P3-5/P3-8 的真机路径已覆盖；P3-6/P3-7（双音源 FIFO 真机听感）与 P1/P2 仍待用户验证。
- **待办**：Agent 工具与面板资料库/点歌的能力对等（需要后台单 CDP 客户端或宿主代理）；Apple 改版后的选择器漂移；隐藏窗口起播的浏览器兼容性。
