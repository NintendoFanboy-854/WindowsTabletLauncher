//! 蓝牙音频（A2DP Sink）：把本机当作蓝牙音箱，接收已配对设备推送的音频。
//!
//! Windows 的 `Windows.Media.Audio.AudioPlaybackConnection` 是官方唯一入口
//! （Windows 10 1803+，解包桌面应用可用）。流程与旧 WinUI 版 BtAudioPlugin 一致：
//! `GetDeviceSelector` 找出「已配对、可推送音频」的设备 → `TryCreateFromId`
//! → `Start()` 告诉系统有应用愿意接收 → `OpenAsync()` 真正建立连接（带重试）。
//!
//! 设计取舍：
//! - 状态由宿主持有（`BtAudioManager`），前端轮询快照；不依赖 iframe/插件。
//! - 所有 WinRT 调用都在 `spawn_blocking` 线程里、并且当前线程先 RoInitialize(MTA)：
//!   `IAsyncOperation::join()` 是阻塞等待，不能跑在 UI 线程上。
//! - 连接对象必须长期持有：`enabled` 字典就是它的所有者，丢了引用系统会判定应用
//!   不再接收音频（旧版 / 社区实践都踩过）。
//! - 配对不在本模块里做：手机与本机先在系统层配对，这里只操作已配对设备；
//!   配对入口（含 PIN 仪式）是后续独立能力。

use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde::Serialize;
use windows::Devices::Enumeration::DeviceInformation;
use windows::Devices::Radios::{Radio, RadioKind, RadioState};
use windows::Media::Audio::{AudioPlaybackConnection, AudioPlaybackConnectionState};
use windows::Win32::System::WinRT::{RO_INIT_MULTITHREADED, RoInitialize, RoUninitialize};
use windows::core::HSTRING;

const OPEN_RETRIES: u32 = 3;
const OPEN_RETRY_DELAY: Duration = Duration::from_millis(500);

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
    /// idle | enabled | opened | closed（诊断用；UI 以 connected/streaming 为准）
    pub connection_state: String,
    /// 最近一次失败原因（成功后清空）
    pub last_error: Option<String>,
}

struct BtState {
    available: bool,
    bluetooth_supported: bool,
    bluetooth_on: Option<bool>,
    devices: Vec<BtDeviceInfo>,
    /// 已 Start 的连接：key = device id。值必须长期持有，否则连接会被系统回收。
    enabled: HashMap<String, AudioPlaybackConnection>,
    active_id: Option<String>,
    /// 本次连接是否曾经进入 Opened。用于区分「刚打开、手机还没推流」和「推流后掉线」：
    /// 两者 `State` 都是 Closed，但前者仍是已连接，后者才是断开。
    ever_opened: bool,
    last_error: Option<String>,
}

impl Default for BtState {
    fn default() -> Self {
        Self {
            available: false,
            bluetooth_supported: false,
            bluetooth_on: None,
            devices: Vec::new(),
            enabled: HashMap::new(),
            active_id: None,
            ever_opened: false,
            last_error: None,
        }
    }
}

pub struct BtAudioManager {
    state: Mutex<BtState>,
}

impl Default for BtAudioManager {
    fn default() -> Self {
        Self::new()
    }
}

/// 在当前线程初始化 WinRT/COM（MTA）。已初始化过（如 RPC_E_CHANGED_MODE）不算失败，
/// 与 `location.rs` 的处理保持一致：调用方只关心后续 WinRT 调用能不能跑。
fn initialize_thread() -> bool {
    unsafe { RoInitialize(RO_INIT_MULTITHREADED).is_ok() }
}

fn hstring(value: HSTRING) -> String {
    value.to_string()
}

impl BtAudioManager {
    pub fn new() -> Self {
        Self {
            state: Mutex::new(BtState::default()),
        }
    }

    /// 读快照：只读缓存 + 当前连接状态（`State()` 是廉价同步调用，不触发 I/O）。
    pub fn snapshot(&self) -> BtAudioSnapshot {
        let initialized = initialize_thread();
        let mut state = self
            .state
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        let (connected, streaming, connection_state) = match state.active_id.as_deref() {
            None => (false, false, "idle".to_string()),
            Some(active) => {
                let current = state
                    .enabled
                    .get(active)
                    .and_then(|connection| connection.State().ok());
                match current {
                    Some(value) if value == AudioPlaybackConnectionState::Opened => {
                        state.ever_opened = true;
                        (true, true, "opened".to_string())
                    }
                    // 打开成功但手机还没推流：State 仍是 Closed，仍算已连接。
                    Some(value)
                        if value == AudioPlaybackConnectionState::Closed && !state.ever_opened =>
                    {
                        (true, false, "enabled".to_string())
                    }
                    // 推流过又回到 Closed：手机断开。
                    Some(_) if state.ever_opened => (false, false, "closed".to_string()),
                    _ => (true, false, "enabled".to_string()),
                }
            }
        };
        let snapshot = BtAudioSnapshot {
            available: state.available,
            bluetooth_supported: state.bluetooth_supported,
            bluetooth_on: state.bluetooth_on,
            devices: state.devices.clone(),
            active_device_id: state.active_id.clone(),
            connected,
            streaming,
            connection_state,
            last_error: state.last_error.clone(),
        };
        drop(state);
        if initialized {
            // SAFETY: 与 initialize_thread 的 RoInitialize 成对。
            unsafe { RoUninitialize() };
        }
        snapshot
    }

    /// 重新枚举已配对音频设备 + 蓝牙无线电状态。阻塞调用，必须跑在 blocking 线程。
    pub fn refresh(&self) -> BtAudioSnapshot {
        let initialized = initialize_thread();
        let mut available = false;
        let mut devices = Vec::new();
        let mut error: Option<String> = None;

        match AudioPlaybackConnection::GetDeviceSelector() {
            Ok(selector) => match DeviceInformation::FindAllAsyncAqsFilter(&selector) {
                Ok(operation) => match operation.join() {
                    Ok(collection) => {
                        available = true;
                        let count = collection.Size().unwrap_or(0);
                        for index in 0..count {
                            let Ok(device) = collection.GetAt(index) else {
                                continue;
                            };
                            let id = device.Id().map(hstring).unwrap_or_default();
                            if id.is_empty() {
                                continue;
                            }
                            let name = device
                                .Name()
                                .map(hstring)
                                .ok()
                                .filter(|name| !name.trim().is_empty())
                                .unwrap_or_else(|| "未知设备".to_string());
                            devices.push(BtDeviceInfo { id, name });
                        }
                    }
                    Err(failure) => error = Some(format!("枚举音频设备失败: {failure}")),
                },
                Err(failure) => error = Some(format!("枚举音频设备失败: {failure}")),
            },
            Err(failure) => error = Some(format!("蓝牙音频不可用: {failure}")),
        }

        let (bluetooth_supported, bluetooth_on) = read_bluetooth_radio();

        {
            let mut state = self
                .state
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            state.available = available;
            state.bluetooth_supported = bluetooth_supported;
            state.bluetooth_on = bluetooth_on;
            state.devices = devices;
            state.last_error = error;
        }

        let snapshot = self.snapshot();
        if initialized {
            // SAFETY: 与 initialize_thread 的 RoInitialize 成对。
            unsafe { RoUninitialize() };
        }
        snapshot
    }

    /// 连接指定已配对设备：Start（声明接收）→ OpenAsync（真正建立，3 次重试）。
    /// 若已有连接会先断开旧设备。
    pub fn connect(&self, device_id: &str) -> BtAudioSnapshot {
        let initialized = initialize_thread();
        self.disconnect_inner();

        let connection = match AudioPlaybackConnection::TryCreateFromId(&HSTRING::from(device_id)) {
            Ok(connection) => connection,
            Err(failure) => {
                self.set_error(format!("创建音频连接失败: {failure}"));
                return self.finish(initialized);
            }
        };

        if let Err(failure) = connection.Start() {
            self.set_error(format!("启用音频接收失败: {failure}"));
            return self.finish(initialized);
        }

        {
            let mut state = self
                .state
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            state
                .enabled
                .insert(device_id.to_string(), connection.clone());
            state.ever_opened = false;
            state.last_error = None;
        }

        let mut last_failure = None;
        for attempt in 0..OPEN_RETRIES {
            let current = {
                let state = self
                    .state
                    .lock()
                    .unwrap_or_else(|poisoned| poisoned.into_inner());
                state.enabled.get(device_id).cloned()
            };
            let Some(current) = current else { break };
            match current.OpenAsync() {
                Ok(operation) => match operation.join() {
                    Ok(result) => match result.Status() {
                        Ok(status) if status == windows::Media::Audio::AudioPlaybackConnectionOpenResultStatus::Success => {
                            // OpenAsync 成功 ≠ 已进入 Opened：旧版实测要再等最多 500ms 才切到串流态，
                            // 直接读 State 会误报「已连接」。
                            let deadline = Instant::now() + Duration::from_millis(500);
                            while Instant::now() < deadline {
                                if current.State().ok() == Some(AudioPlaybackConnectionState::Opened) {
                                    break;
                                }
                                std::thread::sleep(Duration::from_millis(50));
                            }
                            last_failure = None;
                            break;
                        }
                        Ok(status) => {
                            last_failure = Some(format!("建立音频连接未成功: {status:?}"));
                            if attempt + 1 < OPEN_RETRIES {
                                std::thread::sleep(OPEN_RETRY_DELAY);
                            }
                        }
                        Err(failure) => last_failure = Some(format!("读取连接状态失败: {failure}")),
                    },
                    Err(failure) => {
                        last_failure = Some(format!("建立音频连接失败: {failure}"));
                        if attempt + 1 < OPEN_RETRIES {
                            std::thread::sleep(OPEN_RETRY_DELAY);
                        }
                    }
                },
                Err(failure) => {
                    last_failure = Some(format!("建立音频连接失败: {failure}"));
                    if attempt + 1 < OPEN_RETRIES {
                        std::thread::sleep(OPEN_RETRY_DELAY);
                    }
                }
            }
        }

        // Open 成功才算「已连接」；失败时清掉 enabled/active，避免 UI 同时出现
        // 「已连接」和错误条，也避免留下一个 Start 过但从未 Open 的连接对象。
        match last_failure {
            None => {
                let mut state = self
                    .state
                    .lock()
                    .unwrap_or_else(|poisoned| poisoned.into_inner());
                state.active_id = Some(device_id.to_string());
                state.ever_opened = false;
                state.last_error = None;
            }
            Some(failure) => {
                let mut state = self
                    .state
                    .lock()
                    .unwrap_or_else(|poisoned| poisoned.into_inner());
                if let Some(connection) = state.enabled.remove(device_id) {
                    let _ = connection.Close();
                }
                state.active_id = None;
                state.last_error = Some(failure);
            }
        }
        self.finish(initialized)
    }

    /// 断开当前设备并释放连接引用。
    pub fn disconnect(&self) -> BtAudioSnapshot {
        let initialized = initialize_thread();
        self.disconnect_inner();
        self.finish(initialized)
    }

    /// 开关系统蓝牙无线电。返回快照；权限被拒时 `last_error` 写明原因，UI 走设置页兜底。
    pub fn set_bluetooth(&self, on: bool) -> BtAudioSnapshot {
        let initialized = initialize_thread();
        let mut error: Option<String> = None;

        match Radio::GetRadiosAsync() {
            Ok(operation) => {
                match operation.join() {
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
                        Some(radio) => match radio.SetStateAsync(if on { RadioState::On } else { RadioState::Off }) {
                            Ok(operation) => match operation.join() {
                                Ok(access) if access == windows::Devices::Radios::RadioAccessStatus::Allowed => {}
                                Ok(access) => error = Some(format!("系统不允许切换蓝牙开关（{access:?}）")),
                                Err(failure) => error = Some(format!("切换蓝牙失败: {failure}")),
                            },
                            Err(failure) => error = Some(format!("切换蓝牙失败: {failure}")),
                        },
                        None => error = Some("没有找到蓝牙无线电".to_string()),
                    }
                    }
                    Err(failure) => error = Some(format!("读取蓝牙状态失败: {failure}")),
                }
            }
            Err(failure) => error = Some(format!("读取蓝牙状态失败: {failure}")),
        }

        let radio = read_bluetooth_radio();
        {
            let mut state = self
                .state
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            state.bluetooth_supported = radio.0;
            state.bluetooth_on = radio.1;
            state.last_error = error;
        }
        self.finish(initialized)
    }

    fn disconnect_inner(&self) {
        let mut state = self
            .state
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        if let Some(active) = state.active_id.take() {
            if let Some(connection) = state.enabled.remove(&active) {
                let _ = connection.Close();
            }
        }
        // 其余 enabled（理论上只有刚失败的残留）也一并释放，避免占住音频接收。
        for (_id, connection) in state.enabled.drain() {
            let _ = connection.Close();
        }
        state.ever_opened = false;
        state.last_error = None;
    }

    fn set_error(&self, message: String) {
        let mut state = self
            .state
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        state.last_error = Some(message);
    }

    fn finish(&self, initialized: bool) -> BtAudioSnapshot {
        let snapshot = self.snapshot();
        if initialized {
            // SAFETY: 与 initialize_thread 的 RoInitialize 成对。
            unsafe { RoUninitialize() };
        }
        snapshot
    }
}

impl Drop for BtAudioManager {
    fn drop(&mut self) {
        let mut state = self
            .state
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        state.active_id = None;
        for (_id, connection) in state.enabled.drain() {
            let _ = connection.Close();
        }
    }
}

/// 读系统蓝牙无线电状态；返回 (是否检测到蓝牙无线电, 是否开启)。
fn read_bluetooth_radio() -> (bool, Option<bool>) {
    match Radio::GetRadiosAsync() {
        Ok(operation) => match operation.join() {
            Ok(radios) => {
                let count = radios.Size().unwrap_or(0);
                for index in 0..count {
                    let Ok(radio) = radios.GetAt(index) else {
                        continue;
                    };
                    if radio.Kind().ok() == Some(RadioKind::Bluetooth) {
                        return (
                            true,
                            radio.State().ok().map(|state| state == RadioState::On),
                        );
                    }
                }
                (false, None)
            }
            Err(_) => (false, None),
        },
        Err(_) => (false, None),
    }
}
