//! SMTC 媒体会话（P3a 通用能力）：列出系统媒体会话、读元数据/封面、发传输命令。
//!
//! 设计见 `docs/history/V090-AUDIO-MUSIC-SPEC.md §5.4`。宿主只做通用机制：
//! **不认识任何 appId、不做会话选择**——会话列表原样交给调用方（未来插件按 appId/最近更新
//! 自己挑），宿主不写任何业务过滤，也不把 AUMID 写死进代码。
//!
//! 结构沿用 `bluetooth_audio.rs` / `audio_focus.rs`：
//! - **worker 线程**（`std::thread`，进程内唯一）：`RoInitialize(MTA)` 一次，持有
//!   `GlobalSystemMediaTransportControlsSessionManager`（懒创建，失败后下次重建）；所有
//!   WinRT 调用都只在这个线程执行。
//! - **Tauri managed state**（[`MediaSessionManager`]）：命令 `Sender` + 只读快照 `Mutex` +
//!   `JoinHandle`。命令投递请求后等 worker 回包；慢调用由命令层放 `spawn_blocking`。
//!
//! 每次 `list` 都重新 `GetSessions()` 取一遍（不长期缓存会话对象，避免旧对象失效）；
//! 枚举失败返回空列表 + `log::warn`，不 panic、不把 HRESULT 抛给前端。
//!
//! 会话 id 规则：`<SourceAppUserModelId>#<枚举下标>`（同一次枚举内稳定）。
//! 命令与封面都按 id 重新枚举匹配，找不到返回 `Err` / 空串。
//!
//! 封面：`TryGetMediaPropertiesAsync` → `Thumbnail`（`IRandomAccessStreamReference`）→
//! `OpenReadAsync` → `DataReader` 读全部字节 → 本模块内置的 base64 编码（不引新依赖）。
//!
//! 兜底：SMTC 没有可用会话时，调用方可改用 [`send_media_key`]（`SendInput` 发媒体键）。

use std::sync::Mutex;
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::Arc;
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

use serde::Serialize;
use windows::Foundation::TimeSpan;
use windows::Media::Control::{
    GlobalSystemMediaTransportControlsSession,
    GlobalSystemMediaTransportControlsSessionManager,
    GlobalSystemMediaTransportControlsSessionPlaybackStatus,
};
use windows::Storage::Streams::DataReader;
use windows::Win32::System::WinRT::{RO_INIT_MULTITHREADED, RoInitialize, RoUninitialize};
use windows::Win32::UI::Input::KeyboardAndMouse::{
    INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYBD_EVENT_FLAGS, KEYEVENTF_KEYUP, SendInput,
    VIRTUAL_KEY, VK_MEDIA_NEXT_TRACK, VK_MEDIA_PLAY_PAUSE, VK_MEDIA_PREV_TRACK,
};
use windows_future::{AsyncStatus, IAsyncOperation};

// ---------- 行为常量（超时/上限，不是设计 token） ----------

/// 拿 `GlobalSystemMediaTransportControlsSessionManager` 的上限（首次 RequestAsync）。
const MANAGER_TIMEOUT: Duration = Duration::from_secs(3);
/// 单次读媒体属性（标题/歌手/专辑）的上限；每个会话各算一次。
const PROPERTIES_TIMEOUT: Duration = Duration::from_millis(800);
/// 发传输命令（TryPlayAsync 等）的上限。
const COMMAND_TIMEOUT: Duration = Duration::from_secs(2);
/// 读封面（OpenReadAsync / LoadAsync）的上限。
const ARTWORK_TIMEOUT: Duration = Duration::from_secs(2);
/// 封面字节上限：SMTC 缩略图通常几十到几百 KB，超过这个尺寸直接放弃。
const MAX_ARTWORK_BYTES: u64 = 8 * 1024 * 1024;
/// 命令层等 worker 回包的上限（一次 list 最多要等几个会话的属性超时）。
const COMMAND_REPLY_TIMEOUT: Duration = Duration::from_secs(8);
/// 轮询 WinRT 异步状态的步进。
const POLL_INTERVAL: Duration = Duration::from_millis(20);

// ---------- 前端快照 ----------

/// 一个 SMTC 会话的可序列化快照。
#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaSessionInfo {
    /// `<appId>#<index>`（同一次枚举内稳定；命令/封面按它重新匹配）
    pub id: String,
    /// 系统提供的 SourceAppUserModelId（宿主不认识它，原样透传）
    pub app_id: String,
    /// 曲名；拿不到为空串
    pub title: String,
    /// 歌手；拿不到为空串
    pub artist: String,
    /// 专辑；拿不到为空串
    pub album: String,
    /// PlaybackStatus == Playing
    pub playing: bool,
    /// 播放位置（毫秒，100ns TimeSpan 换算）；拿不到为 None
    pub position_ms: Option<u64>,
    /// 曲目时长（毫秒）；拿不到/为 0 时为 None
    pub duration_ms: Option<u64>,
    /// 该会话是否支持播放/暂停切换；拿不到为 None
    pub can_play_pause: Option<bool>,
    /// 是否支持下一曲；拿不到为 None
    pub can_next: Option<bool>,
    /// 是否支持上一曲；拿不到为 None
    pub can_previous: Option<bool>,
    /// 封面缓存键（`<appId>#<title>#<artist>`）；标题与歌手都为空时为 None
    pub artwork_key: Option<String>,
}

/// 会话列表快照（`{ sessions: [...] }`）。
#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaSessionSnapshot {
    pub sessions: Vec<MediaSessionInfo>,
}

// ---------- worker 命令 ----------

enum MediaCommand {
    List {
        reply: Sender<MediaSessionSnapshot>,
    },
    Control {
        session_id: String,
        command: String,
        reply: Sender<Result<MediaSessionSnapshot, String>>,
    },
    Artwork {
        session_id: String,
        reply: Sender<String>,
    },
    Shutdown,
}

struct Worker {
    /// 懒创建的会话管理器；调用失败后置回 None，下次请求重建。
    manager: Option<GlobalSystemMediaTransportControlsSessionManager>,
    snapshot: Arc<Mutex<MediaSessionSnapshot>>,
}

impl Worker {
    fn new(snapshot: Arc<Mutex<MediaSessionSnapshot>>) -> Self {
        Self {
            manager: None,
            snapshot,
        }
    }

    /// 取（或懒创建）会话管理器。
    fn manager(&mut self) -> Result<GlobalSystemMediaTransportControlsSessionManager, String> {
        if let Some(manager) = &self.manager {
            return Ok(manager.clone());
        }
        let operation = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
            .map_err(|err| format!("读取系统媒体会话管理器失败: {err}"))?;
        let manager = await_operation(&operation, MANAGER_TIMEOUT)?;
        self.manager = Some(manager.clone());
        Ok(manager)
    }

    /// 重新枚举当前会话（不缓存会话对象）。
    fn sessions(&mut self) -> Result<Vec<GlobalSystemMediaTransportControlsSession>, String> {
        let manager = self.manager()?;
        let collection = manager
            .GetSessions()
            .map_err(|err| format!("枚举媒体会话失败: {err}"))?;
        let count = collection
            .Size()
            .map_err(|err| format!("读取媒体会话数量失败: {err}"))?;
        let mut sessions = Vec::with_capacity(count as usize);
        for index in 0..count {
            match collection.GetAt(index) {
                Ok(session) => sessions.push(session),
                Err(err) => log::warn!("读取第 {index} 个媒体会话失败: {err}"),
            }
        }
        Ok(sessions)
    }

    /// 当前快照（每次重新枚举；失败返回空列表 + warn，不 panic）。
    fn list(&mut self) -> MediaSessionSnapshot {
        let snapshot = match self.describe_all() {
            Ok(sessions) => MediaSessionSnapshot { sessions },
            Err(err) => {
                log::warn!("枚举媒体会话失败（返回空列表）: {err}");
                // 管理器可能已经失效，下次请求重建。
                self.manager = None;
                MediaSessionSnapshot::default()
            }
        };
        self.publish(&snapshot);
        snapshot
    }

    fn describe_all(&mut self) -> Result<Vec<MediaSessionInfo>, String> {
        let sessions = self.sessions()?;
        let mut infos = Vec::with_capacity(sessions.len());
        for (index, session) in sessions.iter().enumerate() {
            infos.push(describe(session, index as u32));
        }
        Ok(infos)
    }

    /// 按会话 id 发传输命令，然后重新枚举返回新快照。
    fn control(
        &mut self,
        session_id: &str,
        command: &str,
    ) -> Result<MediaSessionSnapshot, String> {
        validate_command(command)?;
        let sessions = self.sessions()?;
        let session = find_by_id(&sessions, session_id)?;
        let operation = match command {
            "play" => session.TryPlayAsync(),
            "pause" => session.TryPauseAsync(),
            "toggle" => session.TryTogglePlayPauseAsync(),
            "next" => session.TrySkipNextAsync(),
            _ => session.TrySkipPreviousAsync(),
        }
        .map_err(|err| format!("发送媒体命令 {command} 失败: {err}"))?;
        let accepted = await_operation(&operation, COMMAND_TIMEOUT)?;
        if accepted {
            log::info!("媒体命令 {command} 已被接受（session={session_id}）");
        } else {
            // 会话不接受这条命令（例如已经切走）：不是致命错误，快照照常返回给前端。
            log::warn!("媒体会话拒绝了命令 {command}（session={session_id}）");
        }
        Ok(self.list())
    }

    /// 按会话 id 取封面 data URL；任何一步失败都返回空串。
    fn artwork(&mut self, session_id: &str) -> String {
        match self.read_artwork(session_id) {
            Ok(data) => data,
            Err(err) => {
                log::warn!("读取媒体封面失败（session={session_id}）: {err}");
                String::new()
            }
        }
    }

    fn read_artwork(&mut self, session_id: &str) -> Result<String, String> {
        let sessions = self.sessions()?;
        let session = find_by_id(&sessions, session_id)?;
        let operation = session
            .TryGetMediaPropertiesAsync()
            .map_err(|err| format!("读取媒体属性失败: {err}"))?;
        let properties = await_operation(&operation, PROPERTIES_TIMEOUT)?;
        let thumbnail = properties
            .Thumbnail()
            .map_err(|err| format!("该会话没有封面: {err}"))?;
        let open = thumbnail
            .OpenReadAsync()
            .map_err(|err| format!("读取封面流失败: {err}"))?;
        let stream = await_operation(&open, ARTWORK_TIMEOUT)?;

        let content_type = stream
            .ContentType()
            .map(|value| value.to_string())
            .unwrap_or_default();
        let size = stream
            .Size()
            .map_err(|err| format!("读取封面大小失败: {err}"))?;
        if size == 0 {
            return Ok(String::new());
        }
        if size > MAX_ARTWORK_BYTES {
            return Err(format!("封面过大（{size} 字节），跳过"));
        }
        let input = stream
            .GetInputStreamAt(0)
            .map_err(|err| format!("打开封面输入流失败: {err}"))?;
        let reader = DataReader::CreateDataReader(&input)
            .map_err(|err| format!("创建封面数据读取器失败: {err}"))?;
        let load = reader
            .LoadAsync(size as u32)
            .map_err(|err| format!("读取封面数据失败: {err}"))?;
        let loaded = await_operation(&load, ARTWORK_TIMEOUT)?;
        if loaded == 0 {
            return Ok(String::new());
        }
        let mut bytes = vec![0u8; loaded as usize];
        reader
            .ReadBytes(&mut bytes)
            .map_err(|err| format!("解码封面字节失败: {err}"))?;
        Ok(format!(
            "data:{};base64,{}",
            normalize_mime(&content_type),
            base64_encode(&bytes)
        ))
    }

    fn publish(&self, snapshot: &MediaSessionSnapshot) {
        let mut guard = self
            .snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        *guard = snapshot.clone();
    }
}

/// 把单个会话读成快照。单项失败只留空/None，不影响其它会话。
fn describe(session: &GlobalSystemMediaTransportControlsSession, index: u32) -> MediaSessionInfo {
    let app_id = session
        .SourceAppUserModelId()
        .map(|value| value.to_string())
        .unwrap_or_default();
    let mut info = MediaSessionInfo {
        id: format!("{app_id}#{index}"),
        app_id: app_id.clone(),
        ..MediaSessionInfo::default()
    };

    match session.TryGetMediaPropertiesAsync() {
        Ok(operation) => match await_operation(&operation, PROPERTIES_TIMEOUT) {
            Ok(properties) => {
                info.title = properties.Title().map(|value| value.to_string()).unwrap_or_default();
                info.artist = properties
                    .Artist()
                    .map(|value| value.to_string())
                    .unwrap_or_default();
                info.album = properties
                    .AlbumTitle()
                    .map(|value| value.to_string())
                    .unwrap_or_default();
            }
            Err(err) => log::warn!("读取媒体属性失败（{app_id}）: {err}"),
        },
        Err(err) => log::warn!("请求媒体属性失败（{app_id}）: {err}"),
    }

    if let Ok(playback) = session.GetPlaybackInfo() {
        info.playing = matches!(
            playback.PlaybackStatus(),
            Ok(status) if status == GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing
        );
        if let Ok(controls) = playback.Controls() {
            info.can_play_pause = controls.IsPlayPauseToggleEnabled().ok();
            info.can_next = controls.IsNextEnabled().ok();
            info.can_previous = controls.IsPreviousEnabled().ok();
        }
    }

    if let Ok(timeline) = session.GetTimelineProperties() {
        info.position_ms = timeline.Position().ok().and_then(timespan_millis);
        info.duration_ms = timeline
            .EndTime()
            .ok()
            .and_then(timespan_millis)
            .filter(|millis| *millis > 0);
    }

    // 封面缓存键：同一首歌（appId + 标题 + 歌手）稳定，插件据此缓存 data URL。
    info.artwork_key = if info.title.is_empty() && info.artist.is_empty() {
        None
    } else {
        Some(format!("{app_id}#{}#{}", info.title, info.artist))
    };
    info
}

/// 按 id 在本次枚举里找会话（id 由 [`describe`] 生成：`<appId>#<index>`）。
fn find_by_id<'a>(
    sessions: &'a [GlobalSystemMediaTransportControlsSession],
    session_id: &str,
) -> Result<&'a GlobalSystemMediaTransportControlsSession, String> {
    for (index, session) in sessions.iter().enumerate() {
        let app_id = session
            .SourceAppUserModelId()
            .map(|value| value.to_string())
            .unwrap_or_default();
        if format!("{app_id}#{index}") == session_id {
            return Ok(session);
        }
    }
    Err(format!("找不到媒体会话: {session_id}"))
}

/// WinRT `TimeSpan`（100ns）→ 毫秒；负值按拿不到处理。
fn timespan_millis(value: TimeSpan) -> Option<u64> {
    if value.Duration < 0 {
        return None;
    }
    Some((value.Duration as u64) / 10_000)
}

/// 封面 MIME：只接受 `image/*`，其余（含空串）一律按 jpeg 给，避免拼出非法 data URL。
fn normalize_mime(value: &str) -> String {
    let mime = value
        .split(';')
        .next()
        .unwrap_or("")
        .trim()
        .to_ascii_lowercase();
    if mime.starts_with("image/") {
        mime
    } else {
        "image/jpeg".to_string()
    }
}

/// 标准 base64（含 `=` 补齐）。不引第三方 crate：封面是 SMTC 缩略图，几十到几百 KB。
fn base64_encode(bytes: &[u8]) -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    let mut out = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let first = u32::from(chunk[0]);
        let second = u32::from(*chunk.get(1).unwrap_or(&0));
        let third = u32::from(*chunk.get(2).unwrap_or(&0));
        let triple = (first << 16) | (second << 8) | third;
        out.push(TABLE[((triple >> 18) & 0x3f) as usize] as char);
        out.push(TABLE[((triple >> 12) & 0x3f) as usize] as char);
        if chunk.len() > 1 {
            out.push(TABLE[((triple >> 6) & 0x3f) as usize] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(TABLE[(triple & 0x3f) as usize] as char);
        } else {
            out.push('=');
        }
    }
    out
}

/// 校验传输命令（非法命令在任何 WinRT 调用之前就返回 Err）。
fn validate_command(command: &str) -> Result<(), String> {
    match command {
        "play" | "pause" | "toggle" | "next" | "previous" => Ok(()),
        other => Err(format!("未知的媒体命令: {other}")),
    }
}

/// 轮询 WinRT `IAsyncOperation`（不用会无限阻塞的 `get()`/`join()`）。
fn await_operation<T: windows::core::RuntimeType + 'static>(
    operation: &IAsyncOperation<T>,
    timeout: Duration,
) -> Result<T, String> {
    let deadline = Instant::now() + timeout;
    loop {
        match operation.Status() {
            Ok(AsyncStatus::Completed) => {
                return operation
                    .GetResults()
                    .map_err(|failure| format!("读取异步结果失败: {failure}"));
            }
            Ok(AsyncStatus::Started) => {
                if Instant::now() >= deadline {
                    let _ = operation.Cancel();
                    return Err("等待系统媒体接口超时".to_string());
                }
                thread::sleep(POLL_INTERVAL);
            }
            Ok(AsyncStatus::Canceled) => return Err("系统媒体接口调用已取消".to_string()),
            Ok(AsyncStatus::Error) => {
                let code = operation
                    .ErrorCode()
                    .map(|hresult| format!("{:#x}", hresult.0))
                    .unwrap_or_else(|_| "未知".to_string());
                return Err(format!("系统媒体接口调用失败: HRESULT {code}"));
            }
            Ok(_) => return Err("系统媒体接口返回未知状态".to_string()),
            Err(failure) => return Err(format!("读取系统媒体接口状态失败: {failure}")),
        }
    }
}

/// worker 主循环：串行处理命令，`Shutdown` 退出。
fn run_worker(worker: &mut Worker, receiver: &Receiver<MediaCommand>) {
    while let Ok(command) = receiver.recv() {
        match command {
            MediaCommand::List { reply } => {
                let _ = reply.send(worker.list());
            }
            MediaCommand::Control {
                session_id,
                command,
                reply,
            } => {
                let _ = reply.send(worker.control(&session_id, &command));
            }
            MediaCommand::Artwork { session_id, reply } => {
                let _ = reply.send(worker.artwork(&session_id));
            }
            MediaCommand::Shutdown => break,
        }
    }
    log::info!("媒体会话 worker 已退出");
}

// ---------- Tauri managed state ----------

/// 宿主侧句柄：命令通道 + 只读快照 + join handle，不持有任何 WinRT 对象。
pub struct MediaSessionManager {
    snapshot: Arc<Mutex<MediaSessionSnapshot>>,
    command_tx: Mutex<Option<Sender<MediaCommand>>>,
    join: Mutex<Option<JoinHandle<()>>>,
}

impl MediaSessionManager {
    /// 启动后台 worker（懒创建 WinRT 管理器，首条命令才会真正初始化）。
    pub fn start() -> Self {
        let snapshot = Arc::new(Mutex::new(MediaSessionSnapshot::default()));
        let (command_tx, command_rx) = mpsc::channel::<MediaCommand>();
        let worker_snapshot = Arc::clone(&snapshot);

        let join = thread::Builder::new()
            .name("media-session-worker".to_string())
            .spawn(move || {
                // 每个后台线程各自初始化 COM/WinRT（MTA），与蓝牙/音频焦点 worker 互不影响。
                let initialized = unsafe { RoInitialize(RO_INIT_MULTITHREADED).is_ok() };
                {
                    let mut worker = Worker::new(worker_snapshot);
                    run_worker(&mut worker, &command_rx);
                }
                if initialized {
                    // SAFETY: 与上方 RoInitialize(MTA) 成对。
                    unsafe { RoUninitialize() };
                }
                log::info!("媒体会话 worker 已退出");
            })
            .ok();

        if join.is_none() {
            log::error!("无法启动媒体会话 worker 线程");
        }

        Self {
            snapshot,
            command_tx: Mutex::new(Some(command_tx)),
            join: Mutex::new(join),
        }
    }

    /// 读最近一次枚举的快照：纯内存克隆，无 WinRT 调用。
    pub fn snapshot(&self) -> MediaSessionSnapshot {
        self.snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .clone()
    }

    fn send(&self, command: MediaCommand) -> bool {
        let guard = self
            .command_tx
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        match guard.as_ref() {
            Some(sender) => sender.send(command).is_ok(),
            None => false,
        }
    }

    /// 投递请求并等 worker 回包；通道关闭/超时返回 None。
    fn request<T>(
        &self,
        timeout: Duration,
        make: impl FnOnce(Sender<T>) -> MediaCommand,
    ) -> Option<T> {
        let (reply, receiver) = mpsc::channel::<T>();
        if !self.send(make(reply)) {
            return None;
        }
        receiver.recv_timeout(timeout).ok()
    }

    /// 会话列表：每次重新枚举；失败/超时回落到最近一次快照（首次为空列表）。
    pub fn list(&self) -> MediaSessionSnapshot {
        match self.request(COMMAND_REPLY_TIMEOUT, |reply| MediaCommand::List { reply }) {
            Some(snapshot) => snapshot,
            None => {
                log::warn!("读取媒体会话列表超时或服务未运行");
                self.snapshot()
            }
        }
    }

    /// 请 worker 在后台重新枚举一次会话，**不等待结果**（返回是否成功投递）。
    ///
    /// 供音频焦点（P3c FIFO 仲裁）这类不能阻塞的调用方使用：仲裁线程只要下一拍读
    /// [`Self::snapshot`] 就能看到最新状态；完整枚举（含属性读取）可能等几秒，不能同步等。
    pub fn request_refresh(&self) -> bool {
        // 回包通道随请求一起丢弃：worker 照常枚举并发布快照，只是没人等这份回包。
        let (reply, _receiver) = mpsc::channel::<MediaSessionSnapshot>();
        self.send(MediaCommand::List { reply })
    }

    /// 按会话 id 发传输命令；非法命令/找不到会话返回 Err。
    pub fn command(
        &self,
        session_id: &str,
        command: &str,
    ) -> Result<MediaSessionSnapshot, String> {
        validate_command(command)?;
        if session_id.trim().is_empty() {
            return Err("缺少媒体会话 id".to_string());
        }
        let session_id = session_id.to_string();
        let command_name = command.to_string();
        self.request(COMMAND_REPLY_TIMEOUT, move |reply| MediaCommand::Control {
            session_id,
            command: command_name,
            reply,
        })
        .unwrap_or_else(|| Err("媒体会话服务未响应".to_string()))
    }

    /// 按会话 id 取封面 data URL；拿不到返回空串。
    pub fn artwork(&self, session_id: &str) -> String {
        if session_id.trim().is_empty() {
            return String::new();
        }
        let session_id = session_id.to_string();
        self.request(COMMAND_REPLY_TIMEOUT, move |reply| MediaCommand::Artwork {
            session_id,
            reply,
        })
        .unwrap_or_else(|| {
            log::warn!("读取媒体封面超时或服务未运行");
            String::new()
        })
    }

    /// 显式退出：停 worker 并 join。可重复调用。
    pub fn shutdown(&self) {
        let _ = self.send(MediaCommand::Shutdown);
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

impl Drop for MediaSessionManager {
    fn drop(&mut self) {
        self.shutdown();
    }
}

// ---------- 兜底：媒体键（SendInput） ----------

/// 通用媒体键兜底：SMTC 拿不到会话时由调用方改用全局媒体键。
///
/// `toggle` / `play` / `pause` 都映射到播放/暂停键（媒体键只有切换语义），非法命令返回 Err。
pub fn send_media_key(command: &str) -> Result<(), String> {
    let key = match command {
        "play" | "pause" | "toggle" => VK_MEDIA_PLAY_PAUSE,
        "next" => VK_MEDIA_NEXT_TRACK,
        "previous" => VK_MEDIA_PREV_TRACK,
        other => return Err(format!("未知的媒体键: {other}")),
    };
    send_key(key)
}

/// 发一次「按下 + 抬起」。`SendInput` 被 UIPI/输入桌面拦下时返回 Err（前端可提示）。
fn send_key(key: VIRTUAL_KEY) -> Result<(), String> {
    let inputs = [
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: key,
                    wScan: 0,
                    dwFlags: KEYBD_EVENT_FLAGS(0),
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        },
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: key,
                    wScan: 0,
                    dwFlags: KEYEVENTF_KEYUP,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        },
    ];
    // SAFETY: inputs 是本栈上的定长数组，cbSize 与 INPUT 的布局一致。
    let sent = unsafe { SendInput(&inputs, std::mem::size_of::<INPUT>() as i32) };
    if sent as usize != inputs.len() {
        return Err(format!("发送媒体键失败: SendInput 只受理 {sent} 个事件"));
    }
    Ok(())
}
