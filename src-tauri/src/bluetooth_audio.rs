//! 蓝牙音频（A2DP Sink）：把本机当作蓝牙音箱，接收已配对设备推送的音频。
//!
//! Windows 的 `Windows.Media.Audio.AudioPlaybackConnection` 是官方唯一入口
//! （Windows 10 1803+，解包桌面应用可用）。流程与旧 WinUI 版 BtAudioPlugin 一致：
//! `GetDeviceSelector` 找出「已配对、可推送音频」的设备 → `TryCreateFromId`
//! → `Start()` 告诉系统有应用愿意接收 → `OpenAsync()` 真正建立连接（带重试）。
//!
//! P3 起本模块是一个常驻状态机，分两层：
//!
//! - **worker 线程**（`std::thread`，进程内唯一）：持有全部 WinRT 对象（DeviceWatcher、
//!   AudioPlaybackConnection、Radio），启动时 `RoInitialize(MTA)` 一次；所有
//!   connect/disconnect/OpenAsync/枚举/无线电开关都串行进这个线程，同一时刻至多一个
//!   `AudioPlaybackConnection`。WinRT 事件回调只把「哪台设备/哪个状态变了」丢进命令通道，
//!   回调里不做阻塞调用。
//! - **Tauri managed state**（[`BtAudioManager`]）：只有只读快照 `Mutex`、命令 `Sender`、
//!   stop flag 与 `JoinHandle`；前端命令发请求后等 worker 回传快照（不会碰 WinRT）。
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
//!   仍算已连接；只有「进过 Opened 之后又回到 Closed」才判断开（`ever_opened`）。
//! - 配对不在本模块里做：手机与本机先在系统层配对，这里只操作已配对设备。

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
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
use windows::Win32::System::WinRT::{RoInitialize, RoUninitialize, RO_INIT_MULTITHREADED};
use windows::core::{HSTRING, IInspectable};
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
/// 无线电状态兜底轮询间隔（用户可能在 Windows 设置里开关蓝牙）。
const RADIO_REFRESH_INTERVAL: Duration = Duration::from_secs(30);
/// 命令等待 worker 回传快照的上限（一轮多设备尝试可能跑几十秒）。
const COMMAND_REPLY_TIMEOUT: Duration = Duration::from_secs(60);
/// 退出应用时等系统蓝牙链路（ACL）真正断开的上限。
///
/// 真机实测（v0.8.1，iPhone A2DP Sink）：`AudioPlaybackConnection.Close()` 只释放应用侧，
/// Windows/iPhone 的 ACL 链路不会因此自动断开（trace 实测 14s+ 仍是 Connected）。
/// 所以退出清理会先关闭蓝牙无线电（见 `shutdown`），再等 `ConnectionStatus` 变为
/// Disconnected；5s 是关闭无线电后确认链路已断的兜底上限。
const SHUTDOWN_TEARDOWN_TIMEOUT: Duration = Duration::from_secs(5);
/// 等链路断开时的轮询间隔。
const TEARDOWN_POLL: Duration = Duration::from_millis(150);
/// 设备 id 里解析不出蓝牙地址时的固定等待（给传输层留释放时间）。
const FALLBACK_CLOSE_SETTLE: Duration = Duration::from_secs(2);

// ---------- 前端快照 ----------

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BtDeviceInfo {
    pub id: String,
    pub name: String,
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
    /// 是否已建立连接（Opened 或 Start+Open 成功但手机还没开始推流）
    pub connected: bool,
    /// 手机是否正在推流（`AudioPlaybackConnectionState::Opened`）
    pub streaming: bool,
    /// idle | enabled | opened（诊断用；UI 以 connected/streaming 为准）
    pub connection_state: String,
    /// 最近一次非连接类失败原因（枚举/无线电；成功后清空）
    pub last_error: Option<String>,
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
            auto_connect_enabled: true,
            auto_connect_state: "unavailable".to_string(),
            attempt_device_id: None,
            last_attempt_error: None,
            preferred_device_id: None,
            order: Vec::new(),
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
}

// ---------- 命令 / 事件 ----------

enum WorkerCommand {
    Refresh { reply: Sender<BtAudioSnapshot> },
    Connect { device_id: String, reply: Sender<BtAudioSnapshot> },
    Disconnect { reply: Sender<BtAudioSnapshot> },
    SetAutoConnect { enabled: bool, reply: Sender<BtAudioSnapshot> },
    SetPreferred { device_id: Option<String>, reply: Sender<BtAudioSnapshot> },
    ResumeAuto { reply: Sender<BtAudioSnapshot> },
    SetBluetooth { on: bool, reply: Sender<BtAudioSnapshot> },
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
        let discovery_order = config.order.clone();
        Self {
            snapshot,
            notifier,
            persist_path,
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
        }
    }

    fn snapshot(&self) -> BtAudioSnapshot {
        self.snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .clone()
    }

    // ----- 快照发布 -----

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

    fn connection_state(&self) -> String {
        match self.connection.as_ref() {
            None => "idle".to_string(),
            Some(live) if live.opened => "opened".to_string(),
            Some(_) => "enabled".to_string(),
        }
    }

    fn publish(&self) {
        let snapshot = BtAudioSnapshot {
            available: self.available,
            bluetooth_supported: self.bluetooth_supported,
            bluetooth_on: self.bluetooth_on,
            devices: self.devices.clone(),
            active_device_id: self.connection.as_ref().map(|live| live.device_id.clone()),
            connected: self.connection.is_some(),
            streaming: self
                .connection
                .as_ref()
                .map(|live| live.opened)
                .unwrap_or(false),
            connection_state: self.connection_state(),
            last_error: self.last_error.clone(),
            auto_connect_enabled: self.auto_enabled,
            auto_connect_state: self.auto_state().as_str().to_string(),
            attempt_device_id: self.attempt_device_id.clone(),
            last_attempt_error: self.last_attempt_error.clone(),
            preferred_device_id: self.config.preferred_device_id.clone(),
            order: self.queue_order(),
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
        self.next_radio_refresh_at = Instant::now() + RADIO_REFRESH_INTERVAL;
    }

    fn refresh_all(&mut self) {
        self.refresh_devices();
        self.refresh_radio();
        self.publish();
    }

    /// 打开/关闭蓝牙无线电；返回错误文案（None = 成功）。
    ///
    /// 退出清理与设置页开关共用：退出时为了让 iPhone 真正断开 ACL，会关闭无线电，
    /// 下次启动 `initialize` 再恢复打开。
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

    fn toggle_bluetooth(&mut self, on: bool) {
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

    /// 关闭当前连接：`Close()` 后等 WinRT 对象进入 Closed（最多 1s），并记录结果。
    ///
    /// 注意：State=Closed 只代表 WinRT 对象侧关闭；系统蓝牙链路（ACL）会再滞后 1–3s
    /// 才真正断开。退出流程必须再用 [`wait_acl_disconnected`] 等链路掉线后才能结束进程。
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
        // v0.8.1 真机诊断：`Close()` 之后访问 `State()` 会在退出路径上同步卡死
        // （trace 显示 Close 返回后既没有 State 结果、也没有后续 shutdown 步骤，
        //  进程最终被系统结束）。Close 是同步释放，不再轮询 State。
        log::info!(
            "蓝牙音频关闭连接: device={} close={close_status}",
            live.device_id
        );
        Some(live.device_id)
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
    fn attempt_connect(&mut self, device_id: &str) -> bool {
        self.close_connection();
        self.attempt_device_id = Some(device_id.to_string());
        self.publish();
        log::info!("蓝牙音频尝试连接: {}", self.device_name(device_id));
        let outcome = self.open_device(device_id);
        self.attempt_device_id = None;
        match outcome {
            Ok(live) => {
                self.last_attempt_error = None;
                self.retry_at = None;
                self.backoff_step = 0;
                self.connection = Some(live);
                self.paused = false;
                self.record_connected_at(device_id);
                self.publish();
                log::info!("蓝牙音频已连接: {}", self.device_name(device_id));
                true
            }
            Err(failure) => {
                self.last_attempt_error = Some(failure.clone());
                self.publish();
                log::warn!(
                    "蓝牙音频连接 {} 失败: {failure}",
                    self.device_name(device_id)
                );
                false
            }
        }
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

    fn poll_connection_state(&mut self) {
        let Some(live) = self.connection.as_ref() else {
            return;
        };
        let state = live.connection.State().ok();
        match state {
            Some(AudioPlaybackConnectionState::Opened) => {
                if let Some(live) = self.connection.as_mut() {
                    live.opened = true;
                    live.ever_opened = true;
                }
                self.publish();
            }
            Some(AudioPlaybackConnectionState::Closed) => {
                if live.ever_opened {
                    // 推流过又回到 Closed：手机断开。释放连接对象并恢复自动寻找
                    // （立即从队头重试；一轮全失败后按 5/15/30/60s 退避）。
                    let device = self.close_connection();
                    self.retry_at = None;
                    self.pending_priority_device = None;
                    log::info!("蓝牙音频被动断开: {device:?}");
                    self.publish();
                } else {
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
    fn handle_command(&mut self, command: WorkerCommand) -> bool {
        match command {
            WorkerCommand::Shutdown => return true,
            WorkerCommand::Refresh { reply } => {
                self.refresh_all();
                let _ = reply.send(self.snapshot());
            }
            WorkerCommand::Connect { device_id, reply } => {
                self.manual_connect(&device_id);
                let _ = reply.send(self.snapshot());
            }
            WorkerCommand::Disconnect { reply } => {
                self.manual_disconnect();
                let _ = reply.send(self.snapshot());
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
            WorkerCommand::SetBluetooth { on, reply } => {
                self.toggle_bluetooth(on);
                let _ = reply.send(self.snapshot());
            }
        }
        false
    }

    fn manual_connect(&mut self, device_id: &str) {
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
        // 用户手动断开：进入 paused，本轮内不接受系统连接事件、也不再自动连接。
        self.paused = true;
        self.retry_at = None;
        self.pending_priority_device = None;
        self.backoff_step = 0;
        let device = self.close_connection();
        if device.is_some() {
            log::info!("蓝牙音频手动断开: {device:?}");
        }
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
        if let Err(failure) = self.start_watcher() {
            self.last_error = Some(failure);
        }
        // 无线电枚举很快（本机约 50ms），先把它和「能力可用」发布出去，
        // 前端首帧就能看到真实开关状态，而不是 unavailable。
        self.refresh_radio();
        self.publish();
        // 设备列表优先靠 watcher 的 Added 事件补（毫秒级）；只有 watcher 起不来时
        // 才立刻做一次慢枚举（本机实测 FindAllAsync 每次 5–8s）兜底。
        if self.watcher.is_none() {
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
        if self.connection.is_none() && self.auto_enabled && !self.paused {
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

    fn shutdown(&mut self) {
        let active_device = self.connection.as_ref().map(|live| live.device_id.clone());
        let shutdown_started = Instant::now();
        crate::exit_trace("worker-shutdown-start");
        self.close_connection();
        crate::exit_trace(format!("worker-shutdown: close_connection done {:?}", shutdown_started.elapsed()));
        self.stop_watcher();
        crate::exit_trace(format!("worker-shutdown: stop_watcher done {:?}", shutdown_started.elapsed()));
        // 关键：Close 只是应用侧释放；Windows 蓝牙栈的 A2DP 传输链路要晚 1–3s 才断。
        // 进程若在这之前退出，手机会一直显示「已连接」，所以退出路径必须等链路断开。
        if let Some(device_id) = active_device {
            // 关闭连接只是应用侧释放：iPhone/Windows 的 ACL 链路不会因此自动断开
            // （实测 Close 后 14s+ 仍是 Connected）。退出时为了让手机端真正显示断开，
            // 关闭蓝牙无线电；下次启动 initialize 按 radioOffByExit 标记恢复打开。
            let radio_error = self.set_radio(false);
            crate::exit_trace(format!(
                "worker-shutdown: radio-off error={radio_error:?}"
            ));
            if radio_error.is_none() {
                self.config.radio_off_by_exit = Some(true);
                self.persist();
            }
            let disconnect_started = Instant::now();
            crate::exit_trace("worker-shutdown: wait-acl-start");
            let disconnected = wait_acl_disconnected(&device_id, SHUTDOWN_TEARDOWN_TIMEOUT);
            crate::exit_trace(format!(
                "worker-shutdown: wait-acl-done disconnected={disconnected} wait={:?}",
                disconnect_started.elapsed()
            ));
            log::info!(
                "蓝牙音频退出清理: device={device_id} acl_disconnected={disconnected} wait={:?} total_shutdown={:?}",
                disconnect_started.elapsed(),
                shutdown_started.elapsed()
            );
        } else {
            log::info!(
                "蓝牙音频退出清理: 无活动连接 total_shutdown={:?}",
                shutdown_started.elapsed()
            );
        }
        self.persist();
        self.publish();
        crate::exit_trace(format!("worker-shutdown-done {:?}", shutdown_started.elapsed()));
    }
}

// ---------- 线程 / 异步辅助 ----------

fn unix_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
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

/// 查一次系统侧蓝牙链路状态（WinRT `BluetoothDevice.ConnectionStatus`）。
fn device_acl_connected(address: u64) -> Option<bool> {
    let operation = BluetoothDevice::FromBluetoothAddressAsync(address).ok()?;
    let device = await_operation(&operation, Duration::from_secs(2)).ok()?;
    device
        .ConnectionStatus()
        .ok()
        .map(|status| status == BluetoothConnectionStatus::Connected)
}

/// 等系统蓝牙链路（ACL）真正断开，返回是否在超时内观察到 Disconnected。
///
/// Windows 的 A2DP Sink 释放是异步的：`AudioPlaybackConnection.Close()` 返回后，
/// 手机侧的链路还要过一会儿才断；进程提前退出会把手机关联状态留在「已连接」。
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

    fn request(&self, make: impl FnOnce(Sender<BtAudioSnapshot>) -> WorkerSignal) -> BtAudioSnapshot {
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
        match reply_rx.recv_timeout(COMMAND_REPLY_TIMEOUT) {
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

    /// 重新枚举设备 + 无线电状态。阻塞（worker 内排队），调用方放 `spawn_blocking`。
    pub fn refresh(&self) -> BtAudioSnapshot {
        self.request(|reply| WorkerSignal::Command(WorkerCommand::Refresh { reply }))
    }

    /// 手动连接指定设备（成功解除 paused；不改 preferred，只更新 lastConnectedAt）。
    pub fn connect(&self, device_id: &str) -> BtAudioSnapshot {
        let device_id = device_id.to_string();
        self.request(move |reply| {
            WorkerSignal::Command(WorkerCommand::Connect { device_id, reply })
        })
    }

    /// 手动断开：进入 paused，直到手动连接成功或 resume_auto。
    pub fn disconnect(&self) -> BtAudioSnapshot {
        self.request(|reply| WorkerSignal::Command(WorkerCommand::Disconnect { reply }))
    }

    pub fn set_bluetooth(&self, on: bool) -> BtAudioSnapshot {
        self.request(move |reply| WorkerSignal::Command(WorkerCommand::SetBluetooth { on, reply }))
    }

    pub fn set_auto_connect(&self, enabled: bool) -> BtAudioSnapshot {
        self.request(move |reply| {
            WorkerSignal::Command(WorkerCommand::SetAutoConnect { enabled, reply })
        })
    }

    pub fn set_preferred(&self, device_id: Option<String>) -> BtAudioSnapshot {
        self.request(move |reply| {
            WorkerSignal::Command(WorkerCommand::SetPreferred { device_id, reply })
        })
    }

    pub fn resume_auto(&self) -> BtAudioSnapshot {
        self.request(|reply| WorkerSignal::Command(WorkerCommand::ResumeAuto { reply }))
    }

    /// 显式退出：通知 worker 停 watcher / 关连接 / 落盘，然后 join。可重复调用。
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
