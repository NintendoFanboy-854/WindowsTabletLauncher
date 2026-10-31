//! 蓝牙音频（A2DP Sink）：把本机当作蓝牙音箱，接收已配对设备推送的音频。
//!
//! Windows 的 `Windows.Media.Audio.AudioPlaybackConnection` 是官方唯一入口
//! （Windows 10 1803+，解包桌面应用可用）。流程与旧 WinUI 版 BtAudioPlugin 一致：
//! `GetDeviceSelector` 找出「已配对、可推送音频」的设备 → `TryCreateFromId`
//! → `Start()` 告诉系统有应用愿意接收 → `OpenAsync()` 真正建立连接（带重试）。
//!
//! P2（D-51）起是带显式过渡态的常驻状态机，分两层：
//!
//! - **worker 线程**（`std::thread`，进程内唯一）：持有全部 WinRT 对象（DeviceWatcher、
//!   AudioPlaybackConnection、Radio），启动时 `RoInitialize(MTA)` 一次；所有
//!   connect/disconnect/OpenAsync/枚举/无线电开关都串行进这个线程，同一时刻至多一个
//!   `AudioPlaybackConnection`。WinRT 事件回调只把「哪台设备/哪个状态变了」丢进命令通道，
//!   回调里不做阻塞调用。
//! - **Tauri managed state**（[`BtAudioManager`]）：只有只读快照 `Mutex`、命令 `Sender`、
//!   stop flag 与 `JoinHandle`；前端命令不碰 WinRT。
//!
//! 快照上的四层状态（旧字段 `connectionState/connected/streaming` 按 `linkPhase` 映射保留兼容）：
//! - `radioPhase`：`unavailable | off | turningOn | on | turningOff`（蓝牙无线电；退出不碰）；
//! - `linkPhase`：`idle | connecting | connected | streaming | disconnecting | closed`
//!   （A2DP 链路物理事实；`disconnecting` = Close 后正在观察系统 ACL）；
//! - `autoConnectState`：自动连接意图（见下，沿用 D-44）；
//! - `operation`：正在进行的显式操作（`queued/connecting/closing/verifying-link/...`），
//!   阶段串只写英文，中文文案由前端映射。
//!
//! 命令语义（P2）：`connect/disconnect/set_enabled/set_bluetooth` **非阻塞**——manager 先把
//! `operation(stage=queued)` 写进快照并立即返回，worker 执行时收养这条操作、替换 stage、
//! 结束后清空；`refresh` 仍是阻塞的显式重扫。退出路径只调用 [`WorkerCommand::CloseForExit`]：
//! 释放 A2DP Sink 连接（`Close()`），不碰蓝牙无线电、不关 watcher、不等 ACL。
//!
//! 自动连接状态机（`autoConnectState`）：
//! `off | waiting | trying | listening | backoff | paused | unavailable`
//! - 队列：preferred 设备排第一，其余按最近连接时间倒序，从未连接过的按发现顺序兜底；
//! - 每轮从队头顺序尝试，全失败按 5/15/30/60s 退避（上限 60s）；
//! - 手动 disconnect → `paused`（本轮内不自动连接、系统事件也不触发），直到手动 connect
//!   成功或 `bt_audio_resume_auto`；手动 connect 不改 preferred，只更新 lastConnectedAt；
//! - watcher 的 Added（系统枚举到新设备）且当前无连接、非 paused/off → 立即优先尝试该设备；
//!   当前已有连接则不切换；
//! - 配置持久化到 `app_data_dir/bt-audio.json`（autoConnectEnabled / preferredDeviceId /
//!   order / lastConnectedAt），写失败只记日志，不致命。
//!
//! 其他取舍：
//! - 连接对象必须长期持有（`LiveConnection`）：丢了引用系统会判定应用不再接收音频
//!   （旧版 / 社区实践都踩过「约 5 秒断连」）。
//! - `OpenAsync` 用轮询 `Status()` + 超时取消，避免 `join()` 无限阻塞 worker
//!   （单次尝试超时/取消兜底）。
//! - 快照的 `connected` 与旧版语义一致：Open 成功但手机还没推流时 `State` 是 Closed，
//!   仍算已连接（`linkPhase=connected`）；只有「进过 Opened 之后又回到 Closed」才判断开。
//!   `disconnecting` 期间 `connected` 仍为 true（旧前端兼容），UI 以 `linkPhase` 为准。
//! - 配对不在本模块里做：手机与本机先在系统层配对，这里只操作已配对设备。

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::mpsc::{self, Receiver, RecvTimeoutError, Sender};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use windows::Devices::Bluetooth::{BluetoothConnectionStatus, BluetoothDevice};
use windows::Devices::Enumeration::{DeviceInformation, DeviceWatcher, DeviceWatcherStatus};
use windows::Devices::Radios::{Radio, RadioAccessStatus, RadioKind, RadioState};
use windows::Foundation::TypedEventHandler;
use windows::Media::Audio::{
    AudioPlaybackConnection, AudioPlaybackConnectionOpenResultStatus,
    AudioPlaybackConnectionState,
};
use windows::Win32::Devices::Bluetooth::{
    BluetoothFindDeviceClose, BluetoothFindFirstDevice, BluetoothFindFirstRadio,
    BluetoothFindNextDevice, BluetoothFindRadioClose, BluetoothSetServiceState,
    BLUETOOTH_DEVICE_INFO, BLUETOOTH_DEVICE_SEARCH_PARAMS, BLUETOOTH_FIND_RADIO_PARAMS,
    BLUETOOTH_SERVICE_DISABLE, BLUETOOTH_SERVICE_ENABLE,
};
use windows::Win32::Foundation::{CloseHandle, HANDLE};
use windows::Win32::System::WinRT::{RoInitialize, RoUninitialize, RO_INIT_MULTITHREADED};
use windows::core::{GUID, HSTRING, IInspectable};
use windows_future::AsyncStatus;

// ---------- 行为常量（不是设计 token，是状态机参数） ----------

/// 一轮全失败后的退避序列（秒），最后一项封顶。
const BACKOFF_SECONDS: [u64; 4] = [5, 15, 30, 60];
/// 同一设备单次连接里的 OpenAsync 重试次数与间隔（沿用 D-39 的 3 × 500ms）。
const OPEN_ATTEMPTS: u32 = 3;
const OPEN_RETRY_DELAY: Duration = Duration::from_millis(500);
/// 单次 OpenAsync 的等待上限：超时后 Cancel，避免 worker 永久卡住。
const OPEN_TIMEOUT: Duration = Duration::from_secs(3);
/// 其他 WinRT 异步调用（无线电枚举/开关）的等待上限。
const OPERATION_TIMEOUT: Duration = Duration::from_secs(6);
/// A2DP 设备枚举的等待上限：本机冷启动实测 FindAllAsync 约 8s 才返回，
/// 不能按「普通异步调用」的 6s 掐断，否则首轮会误判 unavailable。
const DEVICE_ENUM_TIMEOUT: Duration = Duration::from_secs(20);
/// OpenAsync 成功后再给「进入 Opened」的观察窗口（旧版实测最多 500ms）。
const OPENED_WATCH: Duration = Duration::from_millis(500);
/// 已连接时的状态轮询间隔（StateChanged 是快路径，轮询是兜底）。
const CONNECTION_POLL_INTERVAL: Duration = Duration::from_millis(300);
/// 等待态下的最大 tick 间隔（也是命令/事件之外的心跳）。
const IDLE_TICK: Duration = Duration::from_millis(1000);
/// 等不到 watcher 事件时，兜底重新枚举设备的间隔（watcher 正常时只是低频自检）。
/// 本机实测 FindAllAsync 每次 5–8s，所以不能高频轮询；设备变化主要靠 watcher 事件。
const DEVICE_REFRESH_INTERVAL_WATCHER: Duration = Duration::from_secs(120);
/// watcher 不可用时的兜底轮询间隔。
const DEVICE_REFRESH_INTERVAL_FALLBACK: Duration = Duration::from_secs(15);
/// watcher 启动后等 EnumerationCompleted 的宽限；超时就自己做一次慢枚举兜底。
const ENUMERATION_FALLBACK: Duration = Duration::from_secs(10);
/// 无线电状态轮询间隔（要尽快反映用户在系统里开关蓝牙 → 停止/恢复寻找）。
const RADIO_REFRESH_INTERVAL: Duration = Duration::from_secs(5);
/// 显式 `bt_audio_refresh` 等 worker 回传快照的上限（一轮多设备枚举可能跑几十秒）。
/// P2 起只有 refresh 还用它；非阻塞命令不等回包。
const COMMAND_REPLY_TIMEOUT: Duration = Duration::from_secs(60);
/// 设置类命令（自动连接 / 首选 / 恢复自动连接）等 worker 回传快照的上限：
/// 这些命令只改内存与配置，不碰慢速 WinRT 连接流程；上限留够一次设备枚举（本机 5–8s，
/// 冷启动最多 ~20s），避免慢枚举期间的设置命令被误判超时。
const SETTING_REPLY_TIMEOUT: Duration = Duration::from_secs(20);
/// 手动断开 / 关总开关时观察系统蓝牙链路（ACL）是否真正断开的上限。
///
/// 真机实测（v0.8.1，iPhone A2DP Sink）：`AudioPlaybackConnection.Close()` 只释放应用侧，
/// Windows/iPhone 的 ACL 链路不会因此立刻断开。P2 的退出路径**不等待**（不碰无线电）；
/// 手动断开与关总开关会在这段有限窗口里观察 `ConnectionStatus`，确认不了就如实标记
/// `unverifiedDisconnect`（UI 文案「可能仍连接」）。这是行为上限，不是验收指标。
const DISCONNECT_VERIFY_TIMEOUT: Duration = Duration::from_secs(3);
/// 等链路断开时的轮询间隔。
const TEARDOWN_POLL: Duration = Duration::from_millis(150);
/// 设备 id 里解析不出蓝牙地址时的固定等待（给传输层留释放时间）。
const FALLBACK_CLOSE_SETTLE: Duration = Duration::from_secs(2);
/// 手机侧 A2DP 音频源服务（Bluetooth AudioSource，0x110A）的 GUID。
///
/// 退出 / 关总开关时在系统层**停用**该服务（不碰蓝牙无线电，也不影响 AVRCP/HFP/PBAP
/// 等其它服务，蓝牙键鼠不受影响），Windows 才会真正拆掉 A2DP Sink 传输；仅
/// `Close()` AudioPlaybackConnection 不够：真机实测应用退出后系统仍会继续渲染手机推流。
/// 下次启动 / 开总开关时恢复启用。
const A2DP_AUDIO_SOURCE_GUID_U128: u128 = 0x0000_110A_0000_1000_8000_0080_5F9B_34FB;
/// 启动时恢复 A2DP 音频服务的重试间隔（驱动重新安装需要一点时间）。
const A2DP_SERVICE_RESTORE_RETRY: Duration = Duration::from_secs(5);

// ---------- 前端快照 ----------

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BtDeviceInfo {
    pub id: String,
    pub name: String,
}

/// 正在进行的显式操作（P2）。`stage` 只写简短英文串（queued / connecting / closing /
/// verifying-link / stopping-watcher / starting-watcher / turning-on-radio / turning-off-radio），
/// 中文过渡文案由前端按 `kind + stage` 映射，Rust 里不出现中文 UI 文案。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BtOperation {
    pub id: String,
    /// connect | disconnect | enable | disable | bluetoothOn | bluetoothOff | refresh
    pub kind: String,
    /// 连接类操作的目标设备；非连接操作通常为 None（JSON 里是 null）
    pub device_id: Option<String>,
    pub stage: String,
    pub started_at_ms: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BtAudioSnapshot {
    /// 本机蓝牙音频接收能力是否可用（设备选择器能拿到）
    pub available: bool,
    /// 系统是否有蓝牙无线电
    pub bluetooth_supported: bool,
    /// 蓝牙开关状态；未知为 None
    pub bluetooth_on: Option<bool>,
    /// 已配对、可推送音频的设备
    pub devices: Vec<BtDeviceInfo>,
    /// 当前连接/启用的设备 id
    pub active_device_id: Option<String>,
    /// 是否已建立连接（Opened 或 Start+Open 成功但手机还没开始推流）；
    /// `disconnecting` 期间仍为 true（旧前端兼容），UI 以 `linkPhase` 为准。
    pub connected: bool,
    /// 手机是否正在推流（`AudioPlaybackConnectionState::Opened`）
    pub streaming: bool,
    /// idle | enabled | opened | closed（诊断用；由 linkPhase 映射，UI 以 linkPhase 为准）
    pub connection_state: String,
    /// 最近一次非连接类失败原因（枚举/无线电；成功后清空）
    pub last_error: Option<String>,
    /// 蓝牙音箱总开关（持久化，默认 true）：关 = 断开并停止寻找，开 = 开蓝牙并恢复寻找
    pub enabled: bool,
    /// 自动连接是否开启（持久化，默认 true）
    pub auto_connect_enabled: bool,
    /// off | waiting | trying | listening | backoff | paused | unavailable
    pub auto_connect_state: String,
    /// 正在尝试连接的设备 id（trying 时）
    pub attempt_device_id: Option<String>,
    /// 最近一次连接尝试失败原因（成功后清空）
    pub last_attempt_error: Option<String>,
    /// 首选设备 id（持久化，用户唯一 star）
    pub preferred_device_id: Option<String>,
    /// 当前自动连接队列（preferred → 最近连接 → 发现顺序）
    pub order: Vec<String>,
    /// A2DP 链路物理阶段（P2）：idle | connecting | connected | streaming | disconnecting | closed
    pub link_phase: String,
    /// 蓝牙无线电阶段（P2）：unavailable | off | turningOn | on | turningOff
    pub radio_phase: String,
    /// 正在进行的显式操作；None = 空闲（P2）
    pub operation: Option<BtOperation>,
    /// 最近一次链路 / 操作状态跃迁时间（unix 毫秒，P2）
    pub last_transition_at_ms: u64,
    /// Close 后观察窗口内未能确认 ACL 断开（P2）：UI 文案「可能仍连接」
    pub unverified_disconnect: bool,
    /// FIFO 本地静音（P3c；P2 恒 false）
    pub output_suppressed: bool,
    /// 静音原因（P3c；P2 恒 None）
    pub suppress_reason: Option<String>,
}

impl BtAudioSnapshot {
    /// 进程启动、worker 还未发布首份快照时的占位值。
    pub fn initial() -> Self {
        Self {
            available: false,
            bluetooth_supported: false,
            bluetooth_on: None,
            devices: Vec::new(),
            active_device_id: None,
            connected: false,
            streaming: false,
            connection_state: "idle".to_string(),
            last_error: None,
            enabled: true,
            auto_connect_enabled: true,
            auto_connect_state: "unavailable".to_string(),
            attempt_device_id: None,
            last_attempt_error: None,
            preferred_device_id: None,
            order: Vec::new(),
            link_phase: "idle".to_string(),
            radio_phase: "unavailable".to_string(),
            operation: None,
            last_transition_at_ms: 0,
            unverified_disconnect: false,
            output_suppressed: false,
            suppress_reason: None,
        }
    }
}

// ---------- 持久化 ----------

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PersistedConfig {
    /// 缺字段时按默认 true；写盘时总是写实际值。
    #[serde(default)]
    auto_connect_enabled: Option<bool>,
    #[serde(default)]
    preferred_device_id: Option<String>,
    /// 设备发现顺序（用于从未连接过设备的兜底排序）。
    #[serde(default)]
    order: Vec<String>,
    /// 设备 id → 最近一次连接成功的 unix 毫秒。
    #[serde(default)]
    last_connected_at: HashMap<String, u64>,
    /// 退出清理时为断开 A2DP 链路关闭了蓝牙无线电；下次启动自动恢复打开。
    #[serde(default)]
    radio_off_by_exit: Option<bool>,
    /// 蓝牙音箱总开关（默认 true）：关 = 断开并停止寻找，开 = 开蓝牙并恢复寻找。
    #[serde(default)]
    enabled: Option<bool>,
    /// 退出 / 关总开关时被停用 A2DP 音频源的设备 id；启动 / 开总开关时恢复。
    #[serde(default)]
    a2dp_service_disabled: Vec<String>,
}

// ---------- 命令 / 事件 ----------

enum WorkerCommand {
    Refresh { reply: Sender<BtAudioSnapshot> },
    /// 非阻塞：manager 已把 operation 写进快照，worker 只负责执行。
    Connect { device_id: String },
    Disconnect,
    SetEnabled { enabled: bool },
    SetAutoConnect { enabled: bool, reply: Sender<BtAudioSnapshot> },
    SetPreferred { device_id: Option<String>, reply: Sender<BtAudioSnapshot> },
    ResumeAuto { reply: Sender<BtAudioSnapshot> },
    /// 非阻塞：只切系统蓝牙无线电（radioPhase 走 turningOn / turningOff）。
    SetBluetooth { on: bool },
    /// 退出专用：只 `Close()` A2DP Sink 连接（不碰无线电 / 不关 watcher / 不等 ACL）。
    CloseForExit { reply: Sender<()> },
    Shutdown,
}

enum WorkerSignal {
    Command(WorkerCommand),
    /// watcher：设备出现（已配对、可推送音频）
    DeviceAdded { id: String, name: String },
    /// watcher：设备移除
    DeviceRemoved { id: String },
    /// watcher：设备属性更新（名字/配对状态等），触发重新枚举
    DeviceUpdated { id: String },
    /// watcher：初始枚举完成，可以开始自动连接
    EnumerationCompleted,
    /// AudioPlaybackConnection.StateChanged（只用来加快轮询）
    ConnectionStateChanged,
}

/// 事件回调（WinRT 线程池线程）向 worker 投递信号的入口。
/// 回调闭包要求 `Send + 'static`，而 `Sender` 本身 `!Sync`，所以包一层 `Mutex`。
#[derive(Clone)]
struct EventNotifier {
    sender: Arc<Mutex<Sender<WorkerSignal>>>,
}

impl EventNotifier {
    fn new(sender: Sender<WorkerSignal>) -> Self {
        Self {
            sender: Arc::new(Mutex::new(sender)),
        }
    }

    fn notify(&self, signal: WorkerSignal) {
        let guard = self
            .sender
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        let _ = guard.send(signal);
    }
}

// ---------- 当前连接（长期持有） ----------

struct LiveConnection {
    device_id: String,
    connection: AudioPlaybackConnection,
    state_token: Option<i64>,
    /// 本次连接是否进过 Opened：区分「手机还没推流」（Closed 仍算连接）与「推流后掉线」。
    ever_opened: bool,
    /// 当前是否处于 Opened（推流中）。
    opened: bool,
}

// ---------- 自动连接状态机 ----------

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum AutoState {
    Unavailable,
    Off,
    Paused,
    Waiting,
    Trying,
    Listening,
    Backoff,
}

impl AutoState {
    fn as_str(self) -> &'static str {
        match self {
            AutoState::Unavailable => "unavailable",
            AutoState::Off => "off",
            AutoState::Paused => "paused",
            AutoState::Waiting => "waiting",
            AutoState::Trying => "trying",
            AutoState::Listening => "listening",
            AutoState::Backoff => "backoff",
        }
    }
}

/// A2DP 链路物理事实（快照 `linkPhase`）。
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum LinkPhase {
    Idle,
    Connecting,
    Connected,
    Streaming,
    Disconnecting,
    Closed,
}

impl LinkPhase {
    fn as_str(self) -> &'static str {
        match self {
            LinkPhase::Idle => "idle",
            LinkPhase::Connecting => "connecting",
            LinkPhase::Connected => "connected",
            LinkPhase::Streaming => "streaming",
            LinkPhase::Disconnecting => "disconnecting",
            LinkPhase::Closed => "closed",
        }
    }

    /// 旧快照字段 `connectionState` 的兼容映射（旧前端只看这个诊断字段）。
    fn legacy_connection_state(self) -> &'static str {
        match self {
            LinkPhase::Idle => "idle",
            LinkPhase::Connecting => "enabled",
            LinkPhase::Connected => "enabled",
            LinkPhase::Streaming => "opened",
            LinkPhase::Disconnecting | LinkPhase::Closed => "closed",
        }
    }
}

/// 蓝牙无线电阶段（快照 `radioPhase`）。退出路径不碰无线电。
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum RadioPhase {
    Unavailable,
    Off,
    TurningOn,
    On,
    TurningOff,
}

impl RadioPhase {
    fn as_str(self) -> &'static str {
        match self {
            RadioPhase::Unavailable => "unavailable",
            RadioPhase::Off => "off",
            RadioPhase::TurningOn => "turningOn",
            RadioPhase::On => "on",
            RadioPhase::TurningOff => "turningOff",
        }
    }
}

/// watcher 事件注册 token（长期持有，退出时逐个撤销）。
#[derive(Default)]
struct WatcherTokens {
    added: Option<i64>,
    removed: Option<i64>,
    updated: Option<i64>,
    completed: Option<i64>,
}

// ---------- worker ----------

struct Worker {
    snapshot: Arc<Mutex<BtAudioSnapshot>>,
    notifier: EventNotifier,
    persist_path: Option<PathBuf>,
    config: PersistedConfig,
    devices: Vec<BtDeviceInfo>,
    /// 发现顺序（持久化 order 的运行时版本）
    discovery_order: Vec<String>,
    watcher: Option<DeviceWatcher>,
    watcher_tokens: WatcherTokens,
    enumeration_complete: bool,
    available: bool,
    bluetooth_supported: bool,
    bluetooth_on: Option<bool>,
    connection: Option<LiveConnection>,
    paused: bool,
    /// 蓝牙音箱总开关（与 auto_enabled 不同：关 = 断开 + 停 watcher + 不寻找）
    enabled: bool,
    auto_enabled: bool,
    attempt_device_id: Option<String>,
    last_attempt_error: Option<String>,
    last_error: Option<String>,
    /// 退避档位（0→5s，1→15s，2→30s，3→60s 封顶）
    backoff_step: usize,
    retry_at: Option<Instant>,
    /// watcher Added 触发的「优先尝试这台设备」，下一轮优先消费
    pending_priority_device: Option<String>,
    last_device_refresh_at: Instant,
    next_device_refresh_at: Instant,
    next_radio_refresh_at: Instant,
    /// A2DP 链路物理阶段（快照 linkPhase 的来源；disconnecting/closed 无法从连接对象推导）
    link_phase: LinkPhase,
    /// 蓝牙无线电阶段（快照 radioPhase 的来源；turningOn/turningOff 由 set_radio 前后维护）
    radio_phase: RadioPhase,
    /// 正在执行的操作；manager 预置的 `queued` 操作会被 [`Worker::publish`] 收养
    operation: Option<BtOperation>,
    /// 最近一次链路 / 操作状态跃迁（unix 毫秒）
    last_transition_at_ms: u64,
    /// Close 后没能确认 ACL 断开（UI 文案「可能仍连接」）
    unverified_disconnect: bool,
    /// 正在断开、连接对象已释放时保留的 active 设备 id，让面板行能继续显示「正在断开…」
    disconnecting_device_id: Option<String>,
    /// 上一次 refresh_radio 观察到的「蓝牙已关」，用于把联动做成一次显式迁移
    radio_was_off: bool,
    /// 下次尝试恢复被停用 A2DP 音频服务的时间（驱动重装需要一点时间）
    next_service_restore_at: Instant,
}

impl Worker {
    fn new(
        snapshot: Arc<Mutex<BtAudioSnapshot>>,
        app_data_dir: Option<PathBuf>,
        notifier: EventNotifier,
    ) -> Self {
        let persist_path = app_data_dir.map(|dir| dir.join("bt-audio.json"));
        let config = persist_path
            .as_deref()
            .and_then(|path| std::fs::read_to_string(path).ok())
            .and_then(|text| serde_json::from_str::<PersistedConfig>(&text).ok())
            .unwrap_or_default();
        let now = Instant::now();
        let auto_enabled = config.auto_connect_enabled.unwrap_or(true);
        let enabled = config.enabled.unwrap_or(true);
        let discovery_order = config.order.clone();
        Self {
            snapshot,
            notifier,
            persist_path,
            enabled,
            auto_enabled,
            config,
            devices: Vec::new(),
            discovery_order,
            watcher: None,
            watcher_tokens: WatcherTokens::default(),
            enumeration_complete: false,
            available: false,
            bluetooth_supported: false,
            bluetooth_on: None,
            connection: None,
            paused: false,
            attempt_device_id: None,
            last_attempt_error: None,
            last_error: None,
            backoff_step: 0,
            retry_at: None,
            pending_priority_device: None,
            last_device_refresh_at: now,
            next_device_refresh_at: now,
            next_radio_refresh_at: now,
            link_phase: LinkPhase::Idle,
            radio_phase: RadioPhase::Unavailable,
            operation: None,
            last_transition_at_ms: unix_millis(),
            unverified_disconnect: false,
            disconnecting_device_id: None,
            radio_was_off: false,
            next_service_restore_at: Instant::now(),
        }
    }

    fn snapshot(&self) -> BtAudioSnapshot {
        self.snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .clone()
    }

    // ----- 自动连接意图 / 快照发布 -----

    fn auto_state(&self) -> AutoState {
        if self.paused {
            return AutoState::Paused;
        }
        if self.connection.is_some() {
            return AutoState::Listening;
        }
        if self.attempt_device_id.is_some() {
            return AutoState::Trying;
        }
        if !self.available || !self.bluetooth_supported {
            return AutoState::Unavailable;
        }
        if !self.auto_enabled || self.bluetooth_on == Some(false) {
            return AutoState::Off;
        }
        if self.retry_at.is_some() {
            return AutoState::Backoff;
        }
        AutoState::Waiting
    }

    // ----- 操作 / 阶段（P2） -----

    fn update_stage(&mut self, stage: &str) {
        if let Some(operation) = self.operation.as_mut() {
            operation.stage = stage.to_string();
        }
    }

    /// 改阶段并立即发布（面板/状态栏靠轮询快照看到过渡态）。
    fn set_stage(&mut self, stage: &str) {
        self.update_stage(stage);
        self.publish();
    }

    /// 开始一条显式操作：优先复用 manager 预置（stage=queued）的 operation id，
    /// 保证非阻塞命令的调用方看到的是同一条操作。
    fn begin_operation(&mut self, kind: &str, device_id: Option<String>, stage: &str) {
        let pending = self
            .snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .operation
            .clone();
        let adopted = match (&self.operation, &pending) {
            (Some(current), _) if current.kind == kind => Some(current.clone()),
            (_, Some(queued)) if queued.kind == kind => Some(queued.clone()),
            _ => None,
        };
        let started_at_ms = adopted
            .as_ref()
            .map(|operation| operation.started_at_ms)
            .unwrap_or_else(unix_millis);
        let id = adopted
            .map(|operation| operation.id)
            .unwrap_or_else(next_operation_id);
        self.operation = Some(BtOperation {
            id,
            kind: kind.to_string(),
            device_id,
            stage: stage.to_string(),
            started_at_ms,
        });
        self.last_transition_at_ms = unix_millis();
        self.publish();
    }

    /// 结束当前操作。只在快照里仍是同一个 id 时才清空——避免把 manager 刚排队的新操作清掉。
    fn finish_operation(&mut self) {
        let finished_id = self.operation.take().map(|operation| operation.id);
        {
            let mut guard = self
                .snapshot
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            let same = match (finished_id.as_deref(), guard.operation.as_ref()) {
                (Some(id), Some(current)) => current.id == id,
                _ => false,
            };
            if same {
                guard.operation = None;
            }
        }
        self.last_transition_at_ms = unix_millis();
        self.publish();
    }

    fn update_link_phase(&mut self, phase: LinkPhase) {
        if self.link_phase != phase {
            self.link_phase = phase;
            self.last_transition_at_ms = unix_millis();
        }
    }

    fn radio_phase_from_state(&self) -> RadioPhase {
        if !self.bluetooth_supported {
            return RadioPhase::Unavailable;
        }
        match self.bluetooth_on {
            Some(true) => RadioPhase::On,
            Some(false) => RadioPhase::Off,
            None => RadioPhase::Unavailable,
        }
    }

    // ----- 快照发布 -----

    /// 发布快照。发布前先收养 manager 预置的 operation（非阻塞命令：manager 写 `queued` 后
    /// 立即返回，worker 的 1s tick 不能把排队态清掉）；`outputSuppressed/suppressReason`
    /// 只存在快照里（P3c 的 manager 方法直接改快照，worker 发布时原样保留，不阻塞 worker）。
    fn publish(&mut self) {
        let (pending_operation, pending_transition, output_suppressed, suppress_reason) = {
            let guard = self
                .snapshot
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            (
                guard.operation.clone(),
                guard.last_transition_at_ms,
                guard.output_suppressed,
                guard.suppress_reason.clone(),
            )
        };
        if self.operation.is_none() {
            if let Some(operation) = pending_operation {
                self.operation = Some(operation);
            }
        }
        // manager 直接写快照（预置 operation / P3c 静音态）会带自己的跃迁时间；取较大值保证单调。
        self.last_transition_at_ms = self.last_transition_at_ms.max(pending_transition);
        let link_phase = self.link_phase;
        let disconnecting = link_phase == LinkPhase::Disconnecting;
        let snapshot = BtAudioSnapshot {
            available: self.available,
            bluetooth_supported: self.bluetooth_supported,
            bluetooth_on: self.bluetooth_on,
            devices: self.devices.clone(),
            active_device_id: self
                .connection
                .as_ref()
                .map(|live| live.device_id.clone())
                .or_else(|| {
                    if disconnecting {
                        self.disconnecting_device_id.clone()
                    } else {
                        None
                    }
                }),
            connected: self.connection.is_some() || disconnecting,
            streaming: self
                .connection
                .as_ref()
                .map(|live| live.opened)
                .unwrap_or(false),
            connection_state: link_phase.legacy_connection_state().to_string(),
            last_error: self.last_error.clone(),
            enabled: self.enabled,
            auto_connect_enabled: self.auto_enabled,
            auto_connect_state: self.auto_state().as_str().to_string(),
            attempt_device_id: self.attempt_device_id.clone(),
            last_attempt_error: self.last_attempt_error.clone(),
            preferred_device_id: self.config.preferred_device_id.clone(),
            order: self.queue_order(),
            link_phase: link_phase.as_str().to_string(),
            radio_phase: self.radio_phase.as_str().to_string(),
            operation: self.operation.clone(),
            last_transition_at_ms: self.last_transition_at_ms,
            unverified_disconnect: self.unverified_disconnect,
            output_suppressed,
            suppress_reason,
        };
        let mut guard = self
            .snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        *guard = snapshot;
    }


    // ----- 持久化 -----

    fn persist(&self) {
        let Some(path) = self.persist_path.as_deref() else {
            return;
        };
        let persisted = PersistedConfig {
            auto_connect_enabled: Some(self.auto_enabled),
            preferred_device_id: self.config.preferred_device_id.clone(),
            order: self.discovery_order.clone(),
            last_connected_at: self.config.last_connected_at.clone(),
            radio_off_by_exit: self.config.radio_off_by_exit,
            enabled: Some(self.enabled),
            a2dp_service_disabled: self.config.a2dp_service_disabled.clone(),
        };
        let text = match serde_json::to_string_pretty(&persisted) {
            Ok(text) => text,
            Err(failure) => {
                log::warn!("序列化蓝牙音频配置失败: {failure}");
                return;
            }
        };
        if let Some(parent) = path.parent() {
            if let Err(failure) = std::fs::create_dir_all(parent) {
                log::warn!("创建蓝牙音频配置目录失败: {failure}");
                return;
            }
        }
        let temp = path.with_extension("json.tmp");
        if let Err(failure) = std::fs::write(&temp, &text) {
            log::warn!("写蓝牙音频配置失败: {failure}");
            return;
        }
        if let Err(failure) = std::fs::rename(&temp, path) {
            log::warn!("替换蓝牙音频配置失败: {failure}");
        }
    }

    fn record_connected_at(&mut self, device_id: &str) {
        self.config
            .last_connected_at
            .insert(device_id.to_string(), unix_millis());
        self.persist();
    }

    /// 在系统层启用/停用一台设备的 A2DP 音频源服务，并同步持久化「待恢复」列表。
    ///
    /// 只改这一台设备的 AudioSource 服务：不碰蓝牙无线电，也不影响 AVRCP/HFP/PBAP 等
    /// 其它服务（蓝牙键鼠不受影响）。失败只记日志；失败项留在列表里，下次 tick 重试启用。
    fn set_a2dp_service(&mut self, device_id: &str, enable: bool) -> bool {
        match set_remote_a2dp_service(device_id, enable) {
            Ok(()) => {
                if enable {
                    self.config.a2dp_service_disabled.retain(|id| id != device_id);
                } else if !self
                    .config
                    .a2dp_service_disabled
                    .iter()
                    .any(|id| id == device_id)
                {
                    self.config.a2dp_service_disabled.push(device_id.to_string());
                }
                self.persist();
                log::info!(
                    "蓝牙音频服务{}: {device_id}",
                    if enable { "恢复" } else { "停用" }
                );
                true
            }
            Err(failure) => {
                log::warn!(
                    "蓝牙音频服务{}失败: {device_id}: {failure}",
                    if enable { "恢复" } else { "停用" }
                );
                false
            }
        }
    }

    /// 恢复上次退出/关总开关时停用的 A2DP 音频源服务（启动 / 开总开关时调用）。
    fn restore_a2dp_services(&mut self) {
        let pending = self.config.a2dp_service_disabled.clone();
        for device_id in pending {
            let _ = self.set_a2dp_service(&device_id, true);
        }
        // 还有没恢复成功的：稍后由 tick 重试（驱动安装需要时间）。
        self.next_service_restore_at = Instant::now() + A2DP_SERVICE_RESTORE_RETRY;
    }

    /// 停用当前已知设备的 A2DP 音频源服务（退出 / 关总开关时调用）。
    ///
    /// 先落盘「待恢复」列表再执行停用：万一进程在停用途中被杀，下次启动仍会恢复。
    fn disable_a2dp_services(&mut self) {
        let mut ids: Vec<String> = self
            .devices
            .iter()
            .filter(|device| parse_bluetooth_address(&device.id).is_some())
            .map(|device| device.id.clone())
            .collect();
        if let Some(live) = self.connection.as_ref() {
            if parse_bluetooth_address(&live.device_id).is_some()
                && !ids.contains(&live.device_id)
            {
                ids.push(live.device_id.clone());
            }
        }
        if ids.is_empty() {
            if let Some(preferred) = self.config.preferred_device_id.clone() {
                if parse_bluetooth_address(&preferred).is_some() {
                    ids.push(preferred);
                }
            }
        }
        if ids.is_empty() {
            return;
        }
        for device_id in &ids {
            if !self
                .config
                .a2dp_service_disabled
                .iter()
                .any(|id| id == device_id)
            {
                self.config.a2dp_service_disabled.push(device_id.clone());
            }
        }
        self.persist();
        for device_id in ids {
            let _ = self.set_a2dp_service(&device_id, false);
        }
    }

    // ----- 设备列表 / 排序 -----

    fn queue_order(&self) -> Vec<String> {
        let mut ids: Vec<String> = self.devices.iter().map(|device| device.id.clone()).collect();
        let preferred = self.config.preferred_device_id.clone();
        let last_connected = &self.config.last_connected_at;
        let discovery_order = &self.discovery_order;
        ids.sort_by(|a, b| {
            let rank = |id: &str| {
                let preferred_rank = u8::from(preferred.as_deref() != Some(id));
                let connected_at = last_connected.get(id).copied().unwrap_or(0);
                let discovered = discovery_order
                    .iter()
                    .position(|item| item == id)
                    .unwrap_or(usize::MAX);
                (preferred_rank, u64::MAX - connected_at, discovered)
            };
            rank(a).cmp(&rank(b))
        });
        ids
    }

    fn device_name(&self, device_id: &str) -> String {
        self.devices
            .iter()
            .find(|device| device.id == device_id)
            .map(|device| device.name.clone())
            .unwrap_or_else(|| device_id.to_string())
    }

    // ----- watcher -----

    fn start_watcher(&mut self) -> Result<(), String> {
        let selector = AudioPlaybackConnection::GetDeviceSelector()
            .map_err(|failure| format!("蓝牙音频不可用: {failure}"))?;
        let watcher = DeviceInformation::CreateWatcherAqsFilter(&selector)
            .map_err(|failure| format!("创建蓝牙设备监听失败: {failure}"))?;

        let added = {
            let notifier = self.notifier.clone();
            TypedEventHandler::<DeviceWatcher, DeviceInformation>::new(move |_sender, device| {
                if let Some(device) = device.as_ref() {
                    if let Ok(id) = device.Id() {
                        let name = device
                            .Name()
                            .map(|name| name.to_string())
                            .unwrap_or_default();
                        notifier.notify(WorkerSignal::DeviceAdded {
                            id: id.to_string(),
                            name,
                        });
                    }
                }
                Ok(())
            })
        };
        let removed = {
            let notifier = self.notifier.clone();
            TypedEventHandler::<DeviceWatcher, windows::Devices::Enumeration::DeviceInformationUpdate>::new(
                move |_sender, update| {
                    if let Some(update) = update.as_ref() {
                        if let Ok(id) = update.Id() {
                            notifier.notify(WorkerSignal::DeviceRemoved { id: id.to_string() });
                        }
                    }
                    Ok(())
                },
            )
        };
        let updated = {
            let notifier = self.notifier.clone();
            TypedEventHandler::<DeviceWatcher, windows::Devices::Enumeration::DeviceInformationUpdate>::new(
                move |_sender, update| {
                    if let Some(update) = update.as_ref() {
                        if let Ok(id) = update.Id() {
                            notifier.notify(WorkerSignal::DeviceUpdated { id: id.to_string() });
                        }
                    }
                    Ok(())
                },
            )
        };
        let completed = {
            let notifier = self.notifier.clone();
            TypedEventHandler::<DeviceWatcher, IInspectable>::new(move |_sender, _args| {
                notifier.notify(WorkerSignal::EnumerationCompleted);
                Ok(())
            })
        };

        self.watcher_tokens.added = watcher.Added(&added).ok();
        self.watcher_tokens.removed = watcher.Removed(&removed).ok();
        self.watcher_tokens.updated = watcher.Updated(&updated).ok();
        self.watcher_tokens.completed = watcher.EnumerationCompleted(&completed).ok();

        watcher
            .Start()
            .map_err(|failure| format!("启动蓝牙设备监听失败: {failure}"))?;
        self.watcher = Some(watcher);
        // 选择器 + watcher 都拿到了，说明本机 A2DP Sink 能力可用；
        // 设备列表可能还在枚举中（watcher 会用 Added 事件补），但 UI 不必先显示 unavailable。
        self.available = true;
        Ok(())
    }

    fn stop_watcher(&mut self) {
        let Some(watcher) = self.watcher.take() else {
            return;
        };
        let _ = watcher.Stop();
        // 等 watcher 真正停下再撤销回调，避免退出时回调还引用着已释放的通道。
        let deadline = Instant::now() + Duration::from_secs(2);
        loop {
            let status = watcher.Status().ok();
            if status.is_none()
                || status == Some(DeviceWatcherStatus::Stopped)
                || status == Some(DeviceWatcherStatus::Aborted)
            {
                break;
            }
            if Instant::now() >= deadline {
                break;
            }
            thread::sleep(Duration::from_millis(20));
        }
        if let Some(token) = self.watcher_tokens.added.take() {
            let _ = watcher.RemoveAdded(token);
        }
        if let Some(token) = self.watcher_tokens.removed.take() {
            let _ = watcher.RemoveRemoved(token);
        }
        if let Some(token) = self.watcher_tokens.updated.take() {
            let _ = watcher.RemoveUpdated(token);
        }
        if let Some(token) = self.watcher_tokens.completed.take() {
            let _ = watcher.RemoveEnumerationCompleted(token);
        }
    }

    // ----- 枚举 / 无线电 -----

    fn refresh_devices(&mut self) {
        match AudioPlaybackConnection::GetDeviceSelector() {
            Ok(selector) => match DeviceInformation::FindAllAsyncAqsFilter(&selector) {
                Ok(operation) => match await_operation(&operation, DEVICE_ENUM_TIMEOUT) {
                    Ok(collection) => {
                        self.available = true;
                        let count = collection.Size().unwrap_or(0);
                        let mut devices: Vec<BtDeviceInfo> = Vec::new();
                        let mut seen: Vec<String> = Vec::new();
                        for index in 0..count {
                            let Ok(device) = collection.GetAt(index) else {
                                continue;
                            };
                            let id = device
                                .Id()
                                .map(|value| value.to_string())
                                .unwrap_or_default();
                            if id.is_empty() || seen.contains(&id) {
                                continue;
                            }
                            let name = device
                                .Name()
                                .ok()
                                .map(|value| value.to_string())
                                .filter(|value| !value.trim().is_empty())
                                .unwrap_or_else(|| "未知设备".to_string());
                            seen.push(id.clone());
                            devices.push(BtDeviceInfo { id, name });
                        }
                        self.devices = devices;
                        // 发现顺序：保留旧顺序里仍在的 id，新出现的按枚举顺序追加。
                        let mut order: Vec<String> = self
                            .discovery_order
                            .iter()
                            .filter(|id| seen.contains(id))
                            .cloned()
                            .collect();
                        for id in &seen {
                            if !order.contains(id) {
                                order.push(id.clone());
                            }
                        }
                        if order != self.discovery_order {
                            self.discovery_order = order;
                            self.persist();
                        }
                        self.last_error = None;
                    }
                    Err(failure) => {
                        // watcher 还活着时枚举失败只记错误，不把「能力可用」误判成不可用。
                        if self.watcher.is_none() {
                            self.available = false;
                        }
                        self.last_error = Some(failure);
                    }
                },
                Err(failure) => {
                    if self.watcher.is_none() {
                        self.available = false;
                    }
                    self.last_error = Some(format!("枚举音频设备失败: {failure}"));
                }
            },
            Err(failure) => {
                if self.watcher.is_none() {
                    self.available = false;
                }
                self.last_error = Some(format!("蓝牙音频不可用: {failure}"));
            }
        }
        let now = Instant::now();
        self.last_device_refresh_at = now;
        self.schedule_device_refresh();
        self.publish();
    }

    fn schedule_device_refresh(&mut self) {
        let interval = if self.watcher.is_some() {
            DEVICE_REFRESH_INTERVAL_WATCHER
        } else {
            DEVICE_REFRESH_INTERVAL_FALLBACK
        };
        self.next_device_refresh_at = Instant::now() + interval;
    }

    /// 读一次无线电状态。
    ///
    /// 轮询只负责「检测 + 触发一次显式迁移」：系统蓝牙被关掉的联动副作用（停 watcher / 清设备 /
    /// 释放连接 / 总开关联动 / 落盘）全部在 [`Worker::handle_radio_lost`] 里，不再散落在轮询函数。
    fn refresh_radio(&mut self) {
        match Radio::GetRadiosAsync() {
            Ok(operation) => match await_operation(&operation, OPERATION_TIMEOUT) {
                Ok(radios) => {
                    let count = radios.Size().unwrap_or(0);
                    let mut supported = false;
                    let mut on = None;
                    for index in 0..count {
                        let Ok(radio) = radios.GetAt(index) else {
                            continue;
                        };
                        if radio.Kind().ok() == Some(RadioKind::Bluetooth) {
                            supported = true;
                            on = radio.State().ok().map(|state| state == RadioState::On);
                            break;
                        }
                    }
                    self.bluetooth_supported = supported;
                    self.bluetooth_on = on;
                }
                Err(failure) => {
                    self.bluetooth_supported = false;
                    self.bluetooth_on = None;
                    self.last_error = Some(failure);
                }
            },
            Err(failure) => {
                self.bluetooth_supported = false;
                self.bluetooth_on = None;
                self.last_error = Some(format!("读取蓝牙状态失败: {failure}"));
            }
        }
        // 先按真实状态刷新 radioPhase（turningOn/turningOff 只存在于 set_radio 调用的前后）。
        self.radio_phase = self.radio_phase_from_state();
        if self.bluetooth_on == Some(false) {
            // 系统蓝牙被关闭 → 只在这条状态迁移上做一次联动，下一次轮询不再重复。
            if !self.radio_was_off {
                self.handle_radio_lost();
            }
            self.radio_was_off = true;
        } else {
            self.radio_was_off = false;
            if self.enabled && self.bluetooth_on == Some(true) && self.watcher.is_none() {
                // watcher 的 Added 事件会补齐设备（毫秒级）；不做同步慢枚举，避免阻塞命令通道。
                if let Err(failure) = self.start_watcher() {
                    self.last_error = Some(failure);
                }
            }
        }
        self.next_radio_refresh_at = Instant::now() + RADIO_REFRESH_INTERVAL;
    }

    /// 系统蓝牙被外部关掉时的一次性联动（D-49 语义，P2 从轮询里外移成显式方法）：
    /// 停 watcher → 清设备 → 释放连接 → 总开关跟关 / 自动连接暂停 → 落盘。
    ///
    /// 无线电已经关了，链路不可能还连着，所以链路阶段直接回到 idle（不观察 ACL）。
    fn handle_radio_lost(&mut self) {
        log::info!("系统蓝牙已关闭：停止寻找并把蓝牙音箱总开关跟关");
        self.stop_watcher();
        self.devices.clear();
        self.enumeration_complete = false;
        self.disconnecting_device_id = None;
        self.close_connection();
        self.attempt_device_id = None;
        self.retry_at = None;
        self.pending_priority_device = None;
        self.unverified_disconnect = false;
        self.update_link_phase(LinkPhase::Idle);
        if self.enabled {
            self.enabled = false;
            self.auto_enabled = false;
            self.paused = true;
            self.persist();
        }
        self.last_transition_at_ms = unix_millis();
        self.publish();
    }

    fn refresh_all(&mut self) {
        self.refresh_devices();
        self.refresh_radio();
        self.publish();
    }

    /// 打开/关闭蓝牙无线电；返回错误文案（None = 成功）。
    ///
    /// 只由设置页/面板的蓝牙开关（`toggle_bluetooth`）与总开关打开时调用；
    /// 退出路径不碰无线电（P2，D-51）。
    fn set_radio(&mut self, on: bool) -> Option<String> {
        let mut error: Option<String> = None;
        match Radio::GetRadiosAsync() {
            Ok(operation) => match await_operation(&operation, OPERATION_TIMEOUT) {
                Ok(radios) => {
                    let count = radios.Size().unwrap_or(0);
                    let mut bluetooth_radio = None;
                    for index in 0..count {
                        let Ok(radio) = radios.GetAt(index) else {
                            continue;
                        };
                        if radio.Kind().ok() == Some(RadioKind::Bluetooth) {
                            bluetooth_radio = Some(radio);
                            break;
                        }
                    }
                    match bluetooth_radio {
                        Some(radio) => {
                            let target = if on { RadioState::On } else { RadioState::Off };
                            match radio.SetStateAsync(target) {
                                Ok(operation) => {
                                    match await_operation(&operation, OPERATION_TIMEOUT) {
                                        Ok(RadioAccessStatus::Allowed) => {}
                                        Ok(access) => {
                                            error = Some(format!(
                                                "系统不允许切换蓝牙开关（{access:?}）"
                                            ))
                                        }
                                        Err(failure) => error = Some(failure),
                                    }
                                }
                                Err(failure) => {
                                    error = Some(format!("切换蓝牙失败: {failure}"));
                                }
                            }
                        }
                        None => error = Some("没有找到蓝牙无线电".to_string()),
                    }
                }
                Err(failure) => error = Some(failure),
            },
            Err(failure) => error = Some(format!("读取蓝牙状态失败: {failure}")),
        }
        error
    }

    /// 切蓝牙无线电：radioPhase 先进入 turningOn/turningOff（前端显示「打开蓝牙中…」/「关闭中…」），
    /// 真实状态由 `refresh_radio` 回写。关无线电会让系统侧 ACL 一起消失，
    /// `handle_radio_lost` 会把总开关跟关（D-49）。
    fn toggle_bluetooth(&mut self, on: bool) {
        let (kind, stage, phase) = if on {
            ("bluetoothOn", "turning-on-radio", RadioPhase::TurningOn)
        } else {
            ("bluetoothOff", "turning-off-radio", RadioPhase::TurningOff)
        };
        self.begin_operation(kind, None, stage);
        self.radio_phase = phase;
        self.publish();
        let error = self.set_radio(on);
        self.last_error = error;
        self.refresh_radio();
        // 打开蓝牙后立刻重新枚举一次，缩短「打开开关 → 列表出现设备」的等待。
        if on && self.last_error.is_none() {
            self.refresh_devices();
        }
        self.publish();
    }

    // ----- 连接 / 断开 -----

    fn can_auto_connect(&self) -> bool {
        self.auto_enabled
            && !self.paused
            && self.available
            && self.bluetooth_supported
            && self.bluetooth_on != Some(false)
    }

    /// 释放当前连接：只调 `Close()` 并撤销 StateChanged 回调，返回被关闭的设备 id。
    ///
    /// 注意：State=Closed 只代表 WinRT 对象侧关闭；系统蓝牙链路（ACL）会再滞后一会儿才断。
    /// - 手动断开 / 关总开关：调用方用 [`Worker::disconnect_and_verify`] 观察 ACL 并在
    ///   确认不了时标记 `unverifiedDisconnect`；
    /// - 退出：`CloseForExit` 只 Close，不碰无线电、不等 ACL（P2，D-51）。
    fn close_connection(&mut self) -> Option<String> {
        self.attempt_device_id = None;
        let live = self.connection.take()?;
        crate::exit_trace(format!("close-connection-start device={}", live.device_id));
        if let Some(token) = live.state_token {
            let _ = live.connection.RemoveStateChanged(token);
        }
        crate::exit_trace("close-connection: RemoveStateChanged done");
        let close_result = live.connection.Close();
        let close_status = match &close_result {
            Ok(()) => "ok".to_string(),
            Err(error) => format!("err({error})"),
        };
        crate::exit_trace(format!("close-connection: Close() returned {close_status}"));
        // D-46 真机诊断：`Close()` 之后访问 `State()` 会同步卡死（trace 显示 Close 返回后
        // 既没有 State 结果、也没有后续步骤，进程最终被系统结束）。Close 是同步释放，
        // 不再轮询 State；链路是否真断只由 `BluetoothDevice.ConnectionStatus` 观察。
        log::info!(
            "蓝牙音频关闭连接: device={} close={close_status}",
            live.device_id
        );
        Some(live.device_id)
    }

    /// 释放连接并观察系统 ACL（手动断开 / 关总开关共用）。
    ///
    /// 顺序固定：快照先进入 `disconnecting`（stage=closing）→ `Close()`（之后不访问 State，
    /// D-46）→ stage=verifying-link，用 `BluetoothDevice.ConnectionStatus` 在有限窗口里观察 →
    /// 确认断开回到 idle；超时无法确认则 `closed + unverifiedDisconnect`（UI「可能仍连接」）。
    fn disconnect_and_verify(&mut self) {
        let device_id = self.connection.as_ref().map(|live| live.device_id.clone());
        let Some(device_id) = device_id else {
            self.disconnecting_device_id = None;
            self.unverified_disconnect = false;
            self.update_link_phase(LinkPhase::Idle);
            self.last_transition_at_ms = unix_millis();
            self.publish();
            return;
        };
        self.update_stage("closing");
        self.disconnecting_device_id = Some(device_id.clone());
        self.update_link_phase(LinkPhase::Disconnecting);
        self.last_transition_at_ms = unix_millis();
        self.publish();
        self.close_connection();
        self.set_stage("verifying-link");
        crate::exit_trace(format!("bt-disconnect-verify-start device={device_id}"));
        let verified = wait_acl_disconnected(&device_id, DISCONNECT_VERIFY_TIMEOUT);
        crate::exit_trace(format!("bt-disconnect-verify-done verified={verified}"));
        self.disconnecting_device_id = None;
        self.unverified_disconnect = !verified;
        self.update_link_phase(if verified {
            LinkPhase::Idle
        } else {
            LinkPhase::Closed
        });
        self.last_transition_at_ms = unix_millis();
        self.publish();
    }

    fn open_device(&mut self, device_id: &str) -> Result<LiveConnection, String> {
        let connection = AudioPlaybackConnection::TryCreateFromId(&HSTRING::from(device_id))
            .map_err(|failure| format!("创建音频连接失败: {failure}"))?;
        connection
            .Start()
            .map_err(|failure| format!("启用音频接收失败: {failure}"))?;

        let mut last_failure = "建立音频连接失败".to_string();
        let mut opened_success = false;
        for attempt in 0..OPEN_ATTEMPTS {
            match self.open_once(&connection) {
                Ok(()) => {
                    opened_success = true;
                    break;
                }
                Err(failure) => {
                    last_failure = failure;
                    if attempt + 1 < OPEN_ATTEMPTS {
                        thread::sleep(OPEN_RETRY_DELAY);
                    }
                }
            }
        }
        if !opened_success {
            let _ = connection.Close();
            return Err(last_failure);
        }

        // StateChanged 只用于唤醒 worker 加快轮询，不做阻塞调用。
        let state_token = {
            let notifier = self.notifier.clone();
            let handler = TypedEventHandler::<AudioPlaybackConnection, IInspectable>::new(
                move |_sender, _args| {
                    notifier.notify(WorkerSignal::ConnectionStateChanged);
                    Ok(())
                },
            );
            connection.StateChanged(&handler).ok()
        };

        // OpenAsync 成功 ≠ 已进入 Opened：旧版实测要再等最多 500ms 才切到串流态。
        let mut opened = false;
        let deadline = Instant::now() + OPENED_WATCH;
        while Instant::now() < deadline {
            if connection.State().ok() == Some(AudioPlaybackConnectionState::Opened) {
                opened = true;
                break;
            }
            thread::sleep(Duration::from_millis(50));
        }

        Ok(LiveConnection {
            device_id: device_id.to_string(),
            connection,
            state_token,
            ever_opened: opened,
            opened,
        })
    }

    fn open_once(&self, connection: &AudioPlaybackConnection) -> Result<(), String> {
        let operation = connection
            .OpenAsync()
            .map_err(|failure| format!("建立音频连接失败: {failure}"))?;
        let result = await_operation(&operation, OPEN_TIMEOUT)?;
        let status = result
            .Status()
            .map_err(|failure| format!("读取连接结果失败: {failure}"))?;
        if status == AudioPlaybackConnectionOpenResultStatus::Success {
            Ok(())
        } else {
            Err(format!("建立音频连接未成功: {status:?}"))
        }
    }

    /// 单次连接尝试：成功则长期持有连接并写 lastConnectedAt，失败返回原因。
    ///
    /// 手动连接与自动连接（D-44）都走这里：先进入 `connecting` 并把本次尝试体现为 operation，
    /// 成功后按是否见过 Opened 落到 `streaming` / `connected`，失败回到 `idle`。
    fn attempt_connect(&mut self, device_id: &str) -> bool {
        self.begin_operation("connect", Some(device_id.to_string()), "connecting");
        self.close_connection();
        self.disconnecting_device_id = None;
        self.unverified_disconnect = false;
        self.attempt_device_id = Some(device_id.to_string());
        self.update_link_phase(LinkPhase::Connecting);
        self.last_transition_at_ms = unix_millis();
        self.publish();
        log::info!("蓝牙音频尝试连接: {}", self.device_name(device_id));
        let outcome = self.open_device(device_id);
        self.attempt_device_id = None;
        let connected = match outcome {
            Ok(live) => {
                self.last_attempt_error = None;
                self.retry_at = None;
                self.backoff_step = 0;
                let streaming = live.opened;
                self.connection = Some(live);
                self.paused = false;
                self.record_connected_at(device_id);
                self.update_link_phase(if streaming {
                    LinkPhase::Streaming
                } else {
                    LinkPhase::Connected
                });
                self.last_transition_at_ms = unix_millis();
                self.publish();
                log::info!("蓝牙音频已连接: {}", self.device_name(device_id));
                true
            }
            Err(failure) => {
                self.last_attempt_error = Some(failure.clone());
                self.update_link_phase(LinkPhase::Idle);
                self.last_transition_at_ms = unix_millis();
                self.publish();
                log::warn!(
                    "蓝牙音频连接 {} 失败: {failure}",
                    self.device_name(device_id)
                );
                false
            }
        };
        // 自动连接没有外层 handle_command，必须在这里结束本次尝试的 operation。
        self.finish_operation();
        connected
    }

    // ----- 自动连接驱动 -----

    fn enter_backoff(&mut self) {
        let step = self.backoff_step.min(BACKOFF_SECONDS.len() - 1);
        let delay = BACKOFF_SECONDS[step];
        self.retry_at = Some(Instant::now() + Duration::from_secs(delay));
        self.backoff_step = (step + 1).min(BACKOFF_SECONDS.len() - 1);
        self.publish();
        log::info!("蓝牙自动连接一轮全失败，{delay}s 后重试");
    }

    fn drive_auto(&mut self) {
        if self.connection.is_some() || !self.can_auto_connect() {
            return;
        }
        let now = Instant::now();
        if let Some(retry_at) = self.retry_at {
            if now < retry_at {
                return;
            }
            self.retry_at = None;
        }

        let candidates = match self.pending_priority_device.take() {
            Some(id) if self.devices.iter().any(|device| device.id == id) => vec![id],
            _ => self.queue_order(),
        };
        if candidates.is_empty() {
            return;
        }
        for id in candidates {
            if self.attempt_connect(&id) {
                return;
            }
        }
        if self.can_auto_connect() {
            self.enter_backoff();
        }
    }

    /// 轮询连接对象状态（StateChanged 是快路径，轮询是兜底）。
    ///
    /// 只在持有连接对象时调用——`Close()` 之后绝不再访问 `State()`（D-46）。
    fn poll_connection_state(&mut self) {
        let Some((state, ever_opened)) = self
            .connection
            .as_ref()
            .map(|live| (live.connection.State().ok(), live.ever_opened))
        else {
            return;
        };
        match state {
            Some(AudioPlaybackConnectionState::Opened) => {
                if let Some(live) = self.connection.as_mut() {
                    live.opened = true;
                    live.ever_opened = true;
                }
                self.update_link_phase(LinkPhase::Streaming);
                self.publish();
            }
            Some(AudioPlaybackConnectionState::Closed) => {
                if ever_opened {
                    // 推流过又回到 Closed：手机断开。释放连接对象并恢复自动寻找
                    // （立即从队头重试；一轮全失败后按 5/15/30/60s 退避）。
                    let device = self.close_connection();
                    self.disconnecting_device_id = None;
                    self.unverified_disconnect = false;
                    self.update_link_phase(LinkPhase::Idle);
                    self.retry_at = None;
                    self.pending_priority_device = None;
                    self.last_transition_at_ms = unix_millis();
                    log::info!("蓝牙音频被动断开: {device:?}");
                    self.publish();
                } else {
                    // 持有连接但还没见过 Opened：仍是「已连接」。
                    self.update_link_phase(LinkPhase::Connected);
                    self.publish();
                }
            }
            // 只有 Closed / Opened 两个取值，其余按「无变化」处理。
            _ => {}
        }
    }

    // ----- watcher 事件 -----

    fn on_device_added(&mut self, id: String, name: String) {
        let is_new = !self.devices.iter().any(|device| device.id == id);
        if is_new {
            let fallback_name = if name.trim().is_empty() {
                "未知设备".to_string()
            } else {
                name
            };
            self.devices.push(BtDeviceInfo {
                id: id.clone(),
                name: fallback_name,
            });
            if !self.discovery_order.contains(&id) {
                self.discovery_order.push(id.clone());
                self.persist();
            }
        }
        // 系统枚举到新设备且当前没有连接、自动连接可用：立即优先尝试该设备。
        // 已有连接时不切换；paused / off / 未就绪时也不触发。
        if is_new && self.enumeration_complete && self.connection.is_none() && self.can_auto_connect()
        {
            self.retry_at = None;
            self.pending_priority_device = Some(id);
        }
        self.publish();
    }

    fn on_device_removed(&mut self, id: &str) {
        self.devices.retain(|device| device.id != id);
        self.discovery_order.retain(|item| item != id);
        if self.pending_priority_device.as_deref() == Some(id) {
            self.pending_priority_device = None;
        }
        self.publish();
    }

    // ----- 命令处理 -----

    /// 处理一条命令；返回 true 表示要求 worker 退出。
    ///
    /// P2 的四个用户命令不携带 reply：manager 已把 operation 预先写进快照并立即返回，
    /// 这里执行完只需清空 operation（`finish_operation` 幂等）。
    fn handle_command(&mut self, command: WorkerCommand) -> bool {
        match command {
            WorkerCommand::Shutdown => return true,
            WorkerCommand::Refresh { reply } => {
                self.refresh_all();
                let _ = reply.send(self.snapshot());
            }
            WorkerCommand::Connect { device_id } => {
                self.manual_connect(&device_id);
                self.finish_operation();
            }
            WorkerCommand::Disconnect => {
                self.manual_disconnect();
                self.finish_operation();
            }
            WorkerCommand::SetEnabled { enabled } => {
                self.set_enabled(enabled);
                self.finish_operation();
            }
            WorkerCommand::SetAutoConnect { enabled, reply } => {
                self.auto_enabled = enabled;
                self.persist();
                if !enabled {
                    self.retry_at = None;
                    self.pending_priority_device = None;
                } else if !self.paused && self.connection.is_none() {
                    // 重新开启后立即从队头开始，不等旧退避。
                    self.retry_at = None;
                }
                self.publish();
                let _ = reply.send(self.snapshot());
            }
            WorkerCommand::SetPreferred { device_id, reply } => {
                self.config.preferred_device_id = device_id;
                self.persist();
                self.publish();
                let _ = reply.send(self.snapshot());
            }
            WorkerCommand::ResumeAuto { reply } => {
                self.paused = false;
                if self.auto_enabled {
                    self.retry_at = None;
                }
                self.publish();
                let _ = reply.send(self.snapshot());
            }
            WorkerCommand::SetBluetooth { on } => {
                self.toggle_bluetooth(on);
                self.finish_operation();
            }
            WorkerCommand::CloseForExit { reply } => {
                // 退出专用：只释放应用侧 A2DP Sink 连接。不碰蓝牙无线电（键盘/鼠标不掉线）、
                // 不 stop watcher、不等 ACL（不设耗时目标，D-51）。
                crate::exit_trace("close-for-exit-start");
                self.close_connection();
                self.disconnecting_device_id = None;
                self.update_link_phase(LinkPhase::Idle);
                // 只 Close 应用侧连接不够：真机确认应用退出后 Windows 仍会继续渲染手机推流。
                // 退出前在系统层停用该设备的 A2DP 音频源服务（不碰无线电），下次启动恢复。
                crate::exit_trace("a2dp-service-disable-start");
                self.disable_a2dp_services();
                crate::exit_trace(format!(
                    "a2dp-service-disable-done pending={}",
                    self.config.a2dp_service_disabled.len()
                ));
                self.publish();
                let _ = reply.send(());
                crate::exit_trace("close-for-exit-done");
            }
        }
        false
    }

    fn manual_connect(&mut self, device_id: &str) {
        self.begin_operation("connect", Some(device_id.to_string()), "connecting");
        if !self.available {
            self.last_error = Some("蓝牙音频不可用".to_string());
            self.publish();
            return;
        }
        // 手动连接：取消退避/优先队列，先试这一台；成功才解除 paused。
        self.retry_at = None;
        self.pending_priority_device = None;
        let success = self.attempt_connect(device_id);
        if success {
            self.paused = false;
        } else if !self.paused {
            self.enter_backoff();
        }
        self.publish();
    }

    fn manual_disconnect(&mut self) {
        let target = self
            .connection
            .as_ref()
            .map(|live| live.device_id.clone());
        self.begin_operation("disconnect", target.clone(), "closing");
        // 用户手动断开：进入 paused，本轮内不接受系统连接事件、也不再自动连接。
        self.paused = true;
        self.retry_at = None;
        self.pending_priority_device = None;
        self.backoff_step = 0;
        if target.is_none() {
            self.update_link_phase(LinkPhase::Idle);
            self.unverified_disconnect = false;
            self.publish();
            return;
        }
        self.disconnect_and_verify();
        if let Some(device_id) = target {
            log::info!("蓝牙音频手动断开: {device_id}");
        }
    }

    /// 蓝牙音箱总开关：一个动作联动「蓝牙无线电 / 断开 / watcher / 自动寻找」。
    ///
    /// - 关（operation kind=disable）：`closing`（释放连接）→ `verifying-link`（观察 ACL）→
    ///   `stopping-watcher`，结束后 enabled=false / paused=true / auto=false / 设备清空；
    /// - 开（kind=enable）：`turning-on-radio`（若蓝牙关）→ `starting-watcher`，结束后 waiting。
    fn set_enabled(&mut self, enabled: bool) {
        if enabled {
            let stage = if self.bluetooth_on == Some(true) {
                "starting-watcher"
            } else {
                "turning-on-radio"
            };
            self.begin_operation("enable", None, stage);
        } else {
            let target = self
                .connection
                .as_ref()
                .map(|live| live.device_id.clone());
            self.begin_operation("disable", target, "closing");
        }
        if enabled == self.enabled {
            self.publish();
            return;
        }
        self.enabled = enabled;
        if enabled {
            self.paused = false;
            self.auto_enabled = true;
            self.retry_at = None;
            self.pending_priority_device = None;
            // 开总开关 = 恢复 A2DP 音频服务（退出/关总开关时停用过）。
            self.restore_a2dp_services();
            // 先打开系统蓝牙，再刷新状态：否则 refresh_radio 的「系统蓝牙被关 → 总开关跟关」
            // 联动会把刚打开的 enabled 又置回 false。
            if self.bluetooth_on != Some(true) {
                self.set_stage("turning-on-radio");
                self.radio_phase = RadioPhase::TurningOn;
                self.publish();
                self.last_error = self.set_radio(true);
            }
            self.refresh_radio();
            self.set_stage("starting-watcher");
            if self.watcher.is_none() && self.bluetooth_on != Some(false) {
                if let Err(failure) = self.start_watcher() {
                    self.last_error = Some(failure);
                }
            }
            // 设备枚举由 refresh_radio 的联动路径负责（避免重复慢枚举）。
            log::info!(
                "蓝牙音箱总开关: 开 (bluetooth_on={:?} devices={})",
                self.bluetooth_on,
                self.devices.len()
            );
        } else {
            self.paused = true;
            self.auto_enabled = false;
            self.retry_at = None;
            self.pending_priority_device = None;
            // 关总开关 = 在系统层停用 A2DP 音频服务，手机端才会真正停止推流
            // （只 Close AudioPlaybackConnection 时 OS 仍会继续渲染，真机已确认）。
            self.disable_a2dp_services();
            self.disconnect_and_verify();
            self.set_stage("stopping-watcher");
            self.enabled = false;
            self.stop_watcher();
            self.devices.clear();
            self.enumeration_complete = false;
            if self.link_phase == LinkPhase::Closed {
                // 无法确认 ACL 断开：保留 unverifiedDisconnect，UI 显示「可能仍连接」。
            } else {
                self.update_link_phase(LinkPhase::Idle);
                self.unverified_disconnect = false;
            }
            log::info!("蓝牙音箱总开关: 关（断开并停止寻找）");
        }
        self.persist();
        self.publish();
    }

    // ----- 主循环 -----

    fn initialize(&mut self) {
        // 上次退出时为了断开手机连接关闭了蓝牙无线电：启动时恢复，避免用户以为蓝牙坏了。
        if self.config.radio_off_by_exit == Some(true) {
            let error = self.set_radio(true);
            match error {
                Some(failure) => log::warn!("恢复蓝牙无线电失败: {failure}"),
                None => log::info!("已恢复上次退出时关闭的蓝牙无线电"),
            }
            self.config.radio_off_by_exit = None;
            self.persist();
        }
        // 上次退出 / 关总开关时停用了 A2DP 音频服务：启动时先恢复（不碰无线电），再起
        // watcher；驱动重装需要一点时间，watcher / 自动连接会等到设备重新出现。
        if self.enabled && !self.config.a2dp_service_disabled.is_empty() {
            self.restore_a2dp_services();
        }
        // 总开关关闭时不做设备监听（「不用再寻找」），只保留无线电轮询。
        if self.enabled {
            if let Err(failure) = self.start_watcher() {
                self.last_error = Some(failure);
            }
        } else if let Ok(selector) = AudioPlaybackConnection::GetDeviceSelector() {
            // 关闭状态不启动 watcher，但仍要报告「本机具备 A2DP Sink 能力」，
            // 否则面板会显示"没有找到可用的蓝牙适配器"并禁用总开关（用户无法再打开）。
            self.available = !selector.is_empty();
        }
        // 无线电枚举很快（本机约 50ms），先把它和「能力可用」发布出去，
        // 前端首帧就能看到真实开关状态，而不是 unavailable。
        self.refresh_radio();
        self.publish();
        // 设备列表优先靠 watcher 的 Added 事件补（毫秒级）；只有 watcher 起不来时
        // 才立刻做一次慢枚举（本机实测 FindAllAsync 每次 5–8s）兜底。
        if self.enabled && self.watcher.is_none() {
            self.refresh_devices();
            self.enumeration_complete = true;
        }
        self.next_radio_refresh_at = Instant::now() + RADIO_REFRESH_INTERVAL;
        self.schedule_device_refresh();
        self.publish();
        log::info!(
            "蓝牙音频 worker 启动: available={} supported={} on={:?} devices={} auto={} preferred={:?} watcher={}",
            self.available,
            self.bluetooth_supported,
            self.bluetooth_on,
            self.devices.len(),
            self.auto_enabled,
            self.config.preferred_device_id,
            self.watcher.is_some()
        );
    }

    fn tick(&mut self) {
        let now = Instant::now();
        // 总开关关闭：只保留无线电状态轮询（面板要显示「蓝牙已关闭」），
        // 不再枚举设备、不再自动连接——「不用再寻找」。
        if !self.enabled {
            if now >= self.next_radio_refresh_at {
                self.refresh_radio();
                self.publish();
            }
            return;
        }
        if self.connection.is_some() {
            self.poll_connection_state();
        }
        // watcher 的 EnumerationCompleted 迟迟不来时兜底一次慢枚举，避免自动连接永远不启动。
        if !self.enumeration_complete
            && self.last_device_refresh_at.elapsed() >= ENUMERATION_FALLBACK
        {
            self.refresh_devices();
            self.enumeration_complete = true;
        }
        if now >= self.next_device_refresh_at && self.connection.is_none() {
            self.refresh_devices();
        }
        if now >= self.next_radio_refresh_at {
            self.refresh_radio();
            self.publish();
        }
        // 启动时没恢复成功的 A2DP 服务：低频重试（例如蓝牙服务刚启动、驱动还在安装）。
        if !self.config.a2dp_service_disabled.is_empty() && now >= self.next_service_restore_at {
            self.restore_a2dp_services();
        }
        if self.connection.is_none() && self.enabled && self.auto_enabled && !self.paused {
            self.drive_auto();
        }
    }

    fn next_wait(&self) -> Duration {
        let mut wait = if self.connection.is_some() {
            CONNECTION_POLL_INTERVAL
        } else {
            IDLE_TICK
        };
        if let Some(retry_at) = self.retry_at {
            let remaining = retry_at.saturating_duration_since(Instant::now());
            wait = wait.min(remaining.max(Duration::from_millis(10)));
        }
        wait.min(IDLE_TICK)
    }

    /// worker 停止时的轻量清理：只释放应用侧连接并停 watcher。
    ///
    /// P2 起退出路径不再走这里（由 `lib.rs` 的 coordinator 调 [`WorkerCommand::CloseForExit`]，
    /// 不碰蓝牙无线电、不等 ACL）；关无线电 / 等 ACL / 落盘这些退出专用重活已删除。
    fn shutdown(&mut self) {
        crate::exit_trace("worker-shutdown-start");
        self.close_connection();
        self.disconnecting_device_id = None;
        self.update_link_phase(LinkPhase::Idle);
        self.publish();
        self.stop_watcher();
        crate::exit_trace("worker-shutdown-done");
    }
}

// ---------- 线程 / 异步辅助 ----------

fn unix_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

/// 操作 id 的进程内序号：只用于前端/日志区分两条操作，不参与业务判断。
static OPERATION_SEQ: AtomicU64 = AtomicU64::new(0);

fn next_operation_id() -> String {
    let sequence = OPERATION_SEQ.fetch_add(1, Ordering::Relaxed);
    format!("bt-{}-{sequence}", unix_millis())
}

/// 轮询 WinRT `IAsyncOperation` 并在超时后 Cancel（替代会无限阻塞的 `join()`）。
fn await_operation<T: windows::core::RuntimeType + 'static>(
    operation: &windows_future::IAsyncOperation<T>,
    timeout: Duration,
) -> Result<T, String> {
    let deadline = Instant::now() + timeout;
    loop {
        match operation.Status() {
            Ok(AsyncStatus::Completed) => {
                return operation
                    .GetResults()
                    .map_err(|failure| format!("读取异步结果失败: {failure}"))
            }
            Ok(AsyncStatus::Started) => {
                if Instant::now() >= deadline {
                    let _ = operation.Cancel();
                    return Err("等待系统蓝牙调用超时".to_string());
                }
                thread::sleep(Duration::from_millis(20));
            }
            Ok(AsyncStatus::Canceled) => return Err("系统蓝牙调用已取消".to_string()),
            Ok(AsyncStatus::Error) => {
                let code = operation
                    .ErrorCode()
                    .map(|hresult| format!("{:#x}", hresult.0))
                    .unwrap_or_else(|_| "未知".to_string());
                return Err(format!("系统蓝牙调用失败: HRESULT {code}"));
            }
            Ok(_) => return Err("系统蓝牙调用返回未知状态".to_string()),
            Err(failure) => return Err(format!("读取系统蓝牙调用状态失败: {failure}")),
        }
    }
}

/// 从 A2DP 设备 id 里解析蓝牙地址。
///
/// BTHENUM 设备 id 形如
/// `\\?\BTHENUM#{0000110a-...}_VID&0001004c_PID&7510#7&105c378a&0&D468AA12EA33_C00000000#{...}\SNK`，
/// 其中 `D468AA12EA33` 是手机蓝牙地址（12 位十六进制、后面跟 `_`）。
fn parse_bluetooth_address(device_id: &str) -> Option<u64> {
    let bytes = device_id.as_bytes();
    let mut index = 0;
    while index + 13 <= bytes.len() {
        if device_id.is_char_boundary(index) && device_id.is_char_boundary(index + 13) {
            let candidate = &device_id[index..index + 12];
            let next = bytes[index + 12];
            if next == b'_'
                && candidate
                    .bytes()
                    .all(|byte| byte.is_ascii_hexdigit())
            {
                if let Ok(address) = u64::from_str_radix(candidate, 16) {
                    return Some(address);
                }
            }
        }
        index += 1;
    }
    None
}

/// 在系统蓝牙层启用/停用指定已配对设备的 A2DP 音频源服务（0x110A）。
///
/// 只改这一台设备的 AudioSource 服务：不碰蓝牙无线电，也不影响 AVRCP/HFP/PBAP 等
/// 其它服务。失败返回原因，由调用方决定是否重试。
fn set_remote_a2dp_service(device_id: &str, enable: bool) -> Result<(), String> {
    let Some(address) = parse_bluetooth_address(device_id) else {
        return Err("无法从设备 id 解析蓝牙地址".to_string());
    };
    let find_radio_params = BLUETOOTH_FIND_RADIO_PARAMS {
        dwSize: std::mem::size_of::<BLUETOOTH_FIND_RADIO_PARAMS>() as u32,
    };
    let mut radio = HANDLE::default();
    let radio_find = unsafe { BluetoothFindFirstRadio(&find_radio_params, &mut radio) }
        .map_err(|failure| format!("找不到蓝牙无线电: {failure}"))?;

    let result = (|| -> Result<(), String> {
        let search = BLUETOOTH_DEVICE_SEARCH_PARAMS {
            dwSize: std::mem::size_of::<BLUETOOTH_DEVICE_SEARCH_PARAMS>() as u32,
            fReturnAuthenticated: true.into(),
            fReturnRemembered: true.into(),
            fReturnUnknown: true.into(),
            fReturnConnected: true.into(),
            fIssueInquiry: false.into(),
            cTimeoutMultiplier: 0,
            hRadio: HANDLE(radio.0),
        };
        let mut info = BLUETOOTH_DEVICE_INFO {
            dwSize: std::mem::size_of::<BLUETOOTH_DEVICE_INFO>() as u32,
            ..Default::default()
        };
        let device_find = unsafe { BluetoothFindFirstDevice(&search, &mut info) }
            .map_err(|failure| format!("枚举已配对设备失败: {failure}"))?;
        let mut found = false;
        loop {
            if unsafe { info.Address.Anonymous.ullLong } == address {
                found = true;
                break;
            }
            info = BLUETOOTH_DEVICE_INFO {
                dwSize: std::mem::size_of::<BLUETOOTH_DEVICE_INFO>() as u32,
                ..Default::default()
            };
            if unsafe { BluetoothFindNextDevice(device_find, &mut info) }.is_err() {
                break;
            }
        }
        let _ = unsafe { BluetoothFindDeviceClose(device_find) };
        if !found {
            return Err("未找到这台已配对的蓝牙设备".to_string());
        }
        let guid = GUID::from_u128(A2DP_AUDIO_SOURCE_GUID_U128);
        let flags = if enable {
            BLUETOOTH_SERVICE_ENABLE
        } else {
            BLUETOOTH_SERVICE_DISABLE
        };
        let code = unsafe { BluetoothSetServiceState(Some(HANDLE(radio.0)), &info, &guid, flags) };
        match code {
            0 => Ok(()),
            // 文档：请求的状态与当前状态相同时返回 E_INVALIDARG；按幂等成功处理。
            0x8007_0057 => Ok(()),
            other => Err(format!("设置蓝牙音频服务状态失败（{other:#x}）")),
        }
    })();

    let _ = unsafe { BluetoothFindRadioClose(radio_find) };
    let _ = unsafe { CloseHandle(radio) };
    result
}

/// 查一次系统侧蓝牙链路状态（WinRT `BluetoothDevice.ConnectionStatus`）。
fn device_acl_connected(address: u64) -> Option<bool> {
    let operation = BluetoothDevice::FromBluetoothAddressAsync(address).ok()?;
    let device = await_operation(&operation, Duration::from_secs(2)).ok()?;
    device
        .ConnectionStatus()
        .ok()
        .map(|status| status == BluetoothConnectionStatus::Connected)
}

/// 观察系统蓝牙链路（ACL）是否已断开，返回是否在超时内看到非 Connected。
///
/// Windows 的 A2DP Sink 释放是异步的：`AudioPlaybackConnection.Close()` 返回后，
/// 手机侧的链路还要过一会儿才断。手动断开 / 关总开关用它把「正在断开」落成真实结果；
/// 退出路径不做这个观察（P2 不设耗时指标）。
fn wait_acl_disconnected(device_id: &str, timeout: Duration) -> bool {
    let Some(address) = parse_bluetooth_address(device_id) else {
        // 解析不出地址（理论上不会发生）时退回固定等待，给传输层留出释放时间。
        thread::sleep(FALLBACK_CLOSE_SETTLE);
        return false;
    };
    let started = Instant::now();
    let deadline = started + timeout;
    let mut last_report = 0u64;
    loop {
        let connected = device_acl_connected(address);
        let elapsed_secs = started.elapsed().as_secs();
        if elapsed_secs >= last_report.saturating_add(2) {
            crate::exit_trace(format!(
                "wait-acl: {elapsed_secs}s connected={connected:?}"
            ));
            last_report = elapsed_secs;
        }
        if connected != Some(true) {
            // None = 蓝牙已关/设备不可达（关闭无线电后 FromBluetoothAddressAsync 会失败），
            // 与 Disconnected 等价：链路不可能还连着。
            return true;
        }
        if Instant::now() >= deadline {
            return false;
        }
        thread::sleep(TEARDOWN_POLL);
    }
}

/// worker 运行循环：`recv_timeout` 收命令/事件，超时走 tick（轮询 + 自动连接驱动）。
fn run_worker(worker: &mut Worker, receiver: Receiver<WorkerSignal>, stop: &AtomicBool) {
    loop {
        if stop.load(Ordering::SeqCst) {
            break;
        }
        let wait = worker.next_wait();
        match receiver.recv_timeout(wait) {
            Ok(signal) => {
                if handle_signal(worker, signal) {
                    break;
                }
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => break,
        }
        // 先把已经排队的信号处理完（用户命令优先于自动连接尝试），再 tick。
        let mut stopping = false;
        while let Ok(signal) = receiver.try_recv() {
            if handle_signal(worker, signal) {
                stopping = true;
                break;
            }
        }
        if stopping || stop.load(Ordering::SeqCst) {
            break;
        }
        worker.tick();
    }
}

/// 处理一条 worker 信号；返回 true 表示要求 worker 退出。
fn handle_signal(worker: &mut Worker, signal: WorkerSignal) -> bool {
    match signal {
        WorkerSignal::Command(command) => worker.handle_command(command),
        WorkerSignal::DeviceAdded { id, name } => {
            worker.on_device_added(id, name);
            false
        }
        WorkerSignal::DeviceRemoved { id } => {
            worker.on_device_removed(&id);
            false
        }
        WorkerSignal::DeviceUpdated { id } => {
            // 设备属性更新（名字/配对信息等）：当前列表已经按 id 存着，
            // 留一次低频兜底枚举给 tick 的看门狗即可，这里不做慢速 FindAllAsync。
            let _ = id;
            false
        }
        WorkerSignal::EnumerationCompleted => {
            worker.enumeration_complete = true;
            // 设备列表已由 Added 事件填好，tick 会立刻驱动自动连接。
            worker.publish();
            false
        }
        WorkerSignal::ConnectionStateChanged => {
            worker.poll_connection_state();
            false
        }
    }
}

// ---------- Tauri managed state ----------

/// 宿主侧句柄：只读快照 + 命令通道 + stop flag + join handle，不持有任何 WinRT 对象。
pub struct BtAudioManager {
    snapshot: Arc<Mutex<BtAudioSnapshot>>,
    command_tx: Mutex<Option<Sender<WorkerSignal>>>,
    stop: Arc<AtomicBool>,
    join: Mutex<Option<JoinHandle<()>>>,
}

impl BtAudioManager {
    /// 启动后台 worker。`app_data_dir` 为 None 时不持久化（只影响记忆能力）。
    pub fn start(app_data_dir: Option<PathBuf>) -> Self {
        let snapshot = Arc::new(Mutex::new(BtAudioSnapshot::initial()));
        let (command_tx, command_rx) = mpsc::channel::<WorkerSignal>();
        let stop = Arc::new(AtomicBool::new(false));
        let worker_snapshot = Arc::clone(&snapshot);
        let worker_stop = Arc::clone(&stop);
        let notifier = EventNotifier::new(command_tx.clone());

        let join = thread::Builder::new()
            .name("bt-audio-worker".to_string())
            .spawn(move || {
                let initialized = unsafe { RoInitialize(RO_INIT_MULTITHREADED).is_ok() };
                {
                    let mut worker = Worker::new(worker_snapshot, app_data_dir, notifier);
                    worker.initialize();
                    run_worker(&mut worker, command_rx, &worker_stop);
                    worker.shutdown();
                }
                if initialized {
                    // SAFETY: 与上方 RoInitialize(MTA) 成对。
                    unsafe { RoUninitialize() };
                }
                log::info!("蓝牙音频 worker 已退出");
            })
            .ok();

        if join.is_none() {
            log::error!("无法启动蓝牙音频 worker 线程");
        }

        Self {
            snapshot,
            command_tx: Mutex::new(Some(command_tx)),
            stop,
            join: Mutex::new(join),
        }
    }

    /// 读快照：纯内存克隆，无 WinRT 调用，可在任意线程高频调用。
    pub fn snapshot(&self) -> BtAudioSnapshot {
        self.snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .clone()
    }

    fn request(
        &self,
        timeout: Duration,
        make: impl FnOnce(Sender<BtAudioSnapshot>) -> WorkerSignal,
    ) -> BtAudioSnapshot {
        let (reply_tx, reply_rx) = mpsc::channel::<BtAudioSnapshot>();
        let queued = {
            let guard = self
                .command_tx
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            match guard.as_ref() {
                Some(sender) => sender.send(make(reply_tx)).is_ok(),
                None => false,
            }
        };
        if !queued {
            return self.snapshot();
        }
        match reply_rx.recv_timeout(timeout) {
            Ok(snapshot) => snapshot,
            Err(_) => {
                let mut snapshot = self.snapshot();
                if snapshot.last_error.is_none() {
                    snapshot.last_error = Some("蓝牙音频命令处理超时".to_string());
                }
                snapshot
            }
        }
    }

    /// 非阻塞命令：先把 operation（stage=queued）写进快照，再投递命令并立即返回。
    ///
    /// worker 执行时会收养这条操作并替换 stage；前端靠轮询快照看到过渡态，
    /// 需要终态的调用方用 `waitForBluetoothSettled`（前端）或轮询快照。
    fn dispatch(
        &self,
        kind: &str,
        device_id: Option<String>,
        command: WorkerCommand,
    ) -> BtAudioSnapshot {
        let operation = BtOperation {
            id: next_operation_id(),
            kind: kind.to_string(),
            device_id,
            stage: "queued".to_string(),
            started_at_ms: unix_millis(),
        };
        let queued = {
            let mut guard = self
                .snapshot
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            guard.operation = Some(operation);
            guard.last_transition_at_ms = unix_millis();
            guard.clone()
        };
        let sent = {
            let guard = self
                .command_tx
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            match guard.as_ref() {
                Some(sender) => sender.send(WorkerSignal::Command(command)).is_ok(),
                None => false,
            }
        };
        if sent {
            return queued;
        }
        let mut failed = queued;
        failed.operation = None;
        if failed.last_error.is_none() {
            failed.last_error = Some("蓝牙音频命令通道已关闭".to_string());
        }
        let mut guard = self
            .snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        *guard = failed.clone();
        failed
    }

    /// 重新枚举设备 + 无线电状态。阻塞（worker 内排队），调用方放 `spawn_blocking`。
    /// P2 起只有这条命令保留阻塞语义（显式重扫），也是 [`COMMAND_REPLY_TIMEOUT`] 的唯一使用者。
    pub fn refresh(&self) -> BtAudioSnapshot {
        self.request(COMMAND_REPLY_TIMEOUT, |reply| {
            WorkerSignal::Command(WorkerCommand::Refresh { reply })
        })
    }

    /// 手动连接指定设备（成功解除 paused；不改 preferred，只更新 lastConnectedAt）。
    /// 非阻塞：返回带 `operation(kind=connect, stage=queued)` 的当前快照。
    pub fn connect(&self, device_id: &str) -> BtAudioSnapshot {
        self.dispatch(
            "connect",
            Some(device_id.to_string()),
            WorkerCommand::Connect {
                device_id: device_id.to_string(),
            },
        )
    }

    /// 手动断开：进入 paused，直到手动连接成功或 resume_auto。非阻塞。
    pub fn disconnect(&self) -> BtAudioSnapshot {
        self.dispatch("disconnect", None, WorkerCommand::Disconnect)
    }

    /// 蓝牙音箱总开关：开联动开蓝牙 + 寻找；关联动断开 + 停止寻找。非阻塞。
    pub fn set_enabled(&self, enabled: bool) -> BtAudioSnapshot {
        self.dispatch(
            if enabled { "enable" } else { "disable" },
            None,
            WorkerCommand::SetEnabled { enabled },
        )
    }

    /// 系统蓝牙无线电开关。非阻塞（radioPhase 走 turningOn / turningOff）。
    pub fn set_bluetooth(&self, on: bool) -> BtAudioSnapshot {
        self.dispatch(
            if on { "bluetoothOn" } else { "bluetoothOff" },
            None,
            WorkerCommand::SetBluetooth { on },
        )
    }

    pub fn set_auto_connect(&self, enabled: bool) -> BtAudioSnapshot {
        self.request(SETTING_REPLY_TIMEOUT, move |reply| {
            WorkerSignal::Command(WorkerCommand::SetAutoConnect { enabled, reply })
        })
    }

    pub fn set_preferred(&self, device_id: Option<String>) -> BtAudioSnapshot {
        self.request(SETTING_REPLY_TIMEOUT, move |reply| {
            WorkerSignal::Command(WorkerCommand::SetPreferred { device_id, reply })
        })
    }

    pub fn resume_auto(&self) -> BtAudioSnapshot {
        self.request(SETTING_REPLY_TIMEOUT, |reply| {
            WorkerSignal::Command(WorkerCommand::ResumeAuto { reply })
        })
    }

    /// FIFO 本地静音状态（P3c）：由音频焦点 worker 在双音源冲突时写入，只改快照字段
    /// （worker 发布时原样保留），不阻塞 worker、不改连接/自动连接状态。
    ///
    /// 语义：手机继续推流，只是平板本地输出被压住——不断连接、不碰蓝牙无线电、不操控手机端。
    pub fn set_output_suppressed(&self, suppressed: bool, reason: Option<String>) {
        let mut guard = self
            .snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        guard.output_suppressed = suppressed;
        guard.suppress_reason = reason;
        guard.last_transition_at_ms = unix_millis();
    }

    /// 退出专用：让 worker `Close()` 当前 A2DP Sink 连接，最多等 `timeout`。
    ///
    /// 不碰蓝牙无线电、不关 watcher、不等 ACL（P2 不设耗时指标）；失败/超时由调用方忽略。
    pub fn close_for_exit(&self, timeout: Duration) -> bool {
        let (reply_tx, reply_rx) = mpsc::channel::<()>();
        let sent = {
            let guard = self
                .command_tx
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            match guard.as_ref() {
                Some(sender) => sender
                    .send(WorkerSignal::Command(WorkerCommand::CloseForExit {
                        reply: reply_tx,
                    }))
                    .is_ok(),
                None => false,
            }
        };
        if !sent {
            return false;
        }
        reply_rx.recv_timeout(timeout).is_ok()
    }

    /// 显式退出：停 worker 循环并 join（只做轻量关闭，退出重活已移到 coordinator）。
    pub fn shutdown(&self) {
        self.stop.store(true, Ordering::SeqCst);
        {
            let guard = self
                .command_tx
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            if let Some(sender) = guard.as_ref() {
                let _ = sender.send(WorkerSignal::Command(WorkerCommand::Shutdown));
            }
        }
        let handle = self
            .join
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .take();
        if let Some(handle) = handle {
            let _ = handle.join();
        }
    }
}

impl Default for BtAudioManager {
    fn default() -> Self {
        Self::start(None)
    }
}

impl Drop for BtAudioManager {
    fn drop(&mut self) {
        self.shutdown();
    }
}
