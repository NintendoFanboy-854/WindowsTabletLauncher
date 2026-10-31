//! 音频焦点 / 逐会话压低（需求 1，P1）。
//!
//! 设计见 `docs/history/V090-AUDIO-MUSIC-SPEC.md §3`：语音输入 / TTS 开始时，把**其他进程**
//! 在默认渲染端点上的音频会话按比例压低，结束后恢复。只作用于平板本地输出（会话音量），
//! 不碰手机端、不碰系统主音量、也永不压低本应用自己的会话（含 `msedgewebview2.exe` 子进程，
//! 即 TTS / 插件声音）。
//!
//! 结构沿用 `bluetooth_audio.rs`：
//! - **worker 线程**（`std::thread`，进程内唯一）：持有全部 CoreAudio COM 对象
//!   （`IMMDeviceEnumerator` → 默认渲染端点 → `IAudioSessionManager2`），启动时
//!   `RoInitialize(MTA)` 一次；所有枚举/音量读写/进程树查询都只在这个线程执行，不碰 UI 线程。
//! - **Tauri managed state**（[`AudioFocusManager`]）：只有只读快照 `Mutex`、命令 `Sender`、
//!   stop flag 与 `JoinHandle`；前端命令发请求后等 worker 回传快照。
//!
//! 焦点语义（§3.2）：
//! - reasons：`voiceInput`（录音）/ `speechOutput`（TTS）；同一 reason 重复 acquire 不叠加，
//!   release 只移除该 reason；
//! - 每个可管理会话的目标增益 = min(所有 active reasons 的增益)；没有 reason = 1.0（恢复）；
//! - 首次进入管理时记录原始音量/静音态，之后只写 `original * gain`；
//!   原本就静音的会话保持静音，恢复时写回原值并还原 mute；
//! - 过渡用约 10ms 步进的线性淡入淡出（淡出 150ms / 恢复 300ms），并带最小保持时间防抖；
//!   收到新命令会按当前音量重新计算目标，不会等上一段过渡跑完。
//!
//! 会话刷新：焦点活跃期间每 500ms 重枚举一次，录音中途新出现的会话也会被纳入压低；
//! 已管理的会话以 session instance id 识别，重枚举不会把已压低后的音量误当成原始值。
//!
//! 崩溃保护：首次压低时把原始音量/静音态写进 `app_data_dir/audio-focus-journal.json`，
//! 正常恢复后删除；worker 启动时读残留 journal，按 session instance id best-effort 恢复。
//!
//! P3c 起在同一个 worker 里做**双音源 FIFO 仲裁**（SPEC §3.6）：蓝牙推流（external）与
//! SMTC 媒体会话（local）同时在播时，后开始的一方胜出，先开始的一方被压制——external 输 =
//! 只把平板本地输出静音（不断连接、不碰蓝牙无线电、不操控手机端），local 输 = 淡出后发一次
//! SMTC pause（不自动恢复播放）。压制只在三种情况下解除：手动恢复命令、被压制方自己停止播放、
//! 或冲突消失（另一方不再播放）；手动恢复后进入“手动覆盖”，直到下一次任一方新的播放开始
//! 再按 FIFO 重新判定。FIFO 状态与语音 / TTS 压低叠加时取各自增益的最小值，互不覆盖。
//!
//! P1 已知未决（等 P1a 探针）：A2DP Sink 推送音频的会话归属进程尚未实测。当前“自身”判定
//! 按进程树排除本进程与 WebView2 子进程（TTS / 插件声音）；若探针发现蓝牙音乐会话也挂在
//! 本进程树上，需要在 P1 验收前把“自身”判定收窄（否则蓝牙音乐不会被压低）。
//!
//! 所有 COM 失败只记日志、不 panic；快照不把 HRESULT 抛给前端。

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Receiver, RecvTimeoutError, Sender};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use windows::Win32::Foundation::CloseHandle;
use windows::Win32::Media::Audio::{
    eConsole, eRender, AudioSessionState, AudioSessionStateActive, AudioSessionStateInactive,
    IAudioSessionControl2, IAudioSessionManager2, IMMDevice, IMMDeviceEnumerator, ISimpleAudioVolume,
    MMDeviceEnumerator,
};
use windows::Win32::System::Com::{CoCreateInstance, CoTaskMemFree, CLSCTX_ALL};
use windows::Win32::System::Diagnostics::ToolHelp::{
    CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
};
use windows::Win32::System::Threading::{
    OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_WIN32, PROCESS_QUERY_LIMITED_INFORMATION,
};
use windows::Win32::System::WinRT::{RoInitialize, RoUninitialize, RO_INIT_MULTITHREADED};
use windows::core::{Interface, PWSTR};

use crate::bluetooth_audio::BtAudioManager;
use crate::media_session::MediaSessionManager;

// ---------- 行为常量（听感/调度参数，不是设计 token） ----------

/// 淡出时长（录音开口前）。
const FADE_OUT_DURATION: Duration = Duration::from_millis(150);
/// 恢复/淡入时长（松手后）。
const FADE_IN_DURATION: Duration = Duration::from_millis(300);
/// 过渡步进间隔。
const FADE_STEP: Duration = Duration::from_millis(10);
/// 最短保持时间：快速点按时不来回抽动（录音→TTS 之间也保持压低）。
const MIN_HOLD: Duration = Duration::from_millis(300);
/// 焦点活跃时的会话重枚举间隔（覆盖录音中途新出现的会话）。
const SESSION_REFRESH_INTERVAL: Duration = Duration::from_millis(500);
/// FIFO 仲裁的评估间隔（P3c）：空闲也按这个节奏醒来读两路快照；命令/过渡随时可打断。
const FIFO_POLL_INTERVAL: Duration = Duration::from_millis(1000);
/// 等 worker 快照回复的上限（纯内存，正常是毫秒级）。
const COMMAND_REPLY_TIMEOUT: Duration = Duration::from_secs(2);
/// 等 restore_all 完成的上限（退出兜底用）。
const RESTORE_ALL_TIMEOUT: Duration = Duration::from_secs(3);
/// 音量比较的浮点容差。
const VOLUME_EPSILON: f32 = 0.002;
/// journal 版本号（后续格式变化时用于迁移）。
const JOURNAL_VERSION: u32 = 1;
const JOURNAL_FILE_NAME: &str = "audio-focus-journal.json";

/// 已知的本机媒体播放器 / 浏览器进程（只用于 kind 提示，不参与“自身”判定）。
/// “自身”判定永远走进程树，不靠名字。
///
/// 宿主只认识**通用**播放器/浏览器；具体业务播放器（插件自带）不写进宿主。
const LOCAL_MEDIA_PROCESS_NAMES: &[&str] = &[
    "msedge.exe",
    "chrome.exe",
    "firefox.exe",
    "spotify.exe",
    "wmplayer.exe",
    "foobar2000.exe",
    "qqmusic.exe",
    "cloudmusic.exe",
];

// ---------- 前端快照 ----------

/// FIFO 冲突状态（P3c，SPEC §3.6）。
#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FifoState {
    /// 冲突赢家：`external`（蓝牙推流）/ `local`（SMTC 媒体会话）；没有冲突时是当前唯一在播的一方
    pub winner: Option<String>,
    /// 被压制的一方：`external` = 本地静音 / `local` = 淡出后暂停；None = 没有压制
    pub suppressed: Option<String>,
}

/// FIFO 的两条通道：`external` = 蓝牙 Sink 推流，`local` = 本机 SMTC 媒体会话。
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum FifoChannel {
    External,
    Local,
}

impl FifoChannel {
    fn as_str(self) -> &'static str {
        match self {
            Self::External => "external",
            Self::Local => "local",
        }
    }

    fn other(self) -> Self {
        match self {
            Self::External => Self::Local,
            Self::Local => Self::External,
        }
    }
}

/// 双音源 FIFO 仲裁状态（只在 audio-focus worker 线程内读写）。
///
/// 语义（SPEC §3.6）：
/// - 任一方 false → true 记“开始时间”；两方同时在播时后开始者胜出、先开始者被压制；
/// - 压制只作用于平板本地输出，不自动恢复；手动恢复后进入 `manual_override`，
///   直到下一次任一方新的播放开始再重新判定。
#[derive(Debug, Default)]
struct FifoArbiter {
    external_playing: bool,
    local_playing: bool,
    /// 上一次观察到 “external 变为在播” 的时间
    external_since: Option<Instant>,
    /// 上一次观察到 “local 变为在播” 的时间
    local_since: Option<Instant>,
    winner: Option<FifoChannel>,
    suppressed: Option<FifoChannel>,
    /// 手动恢复优先：为 true 时不再因为“赢家还在播”而重新压制
    manual_override: bool,
    /// local 被压制时，等会话淡出到 0 之后再发 pause 的时间点
    pending_pause_at: Option<Instant>,
    /// 本次压制里已经发过 pause 的会话 id（只发一次，不每拍重发）
    paused_ids: HashSet<String>,
}

/// 正在被管理的音频会话（诊断 + 设置页状态用）。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioSource {
    /// local-media | external-media | other（P1 按进程名粗略给，P3 细化）
    pub kind_hint: String,
    /// 会话所属进程 id
    pub pid: u32,
    /// 进程 exe 名（小写）；拿不到为空串
    pub process: String,
    /// active | inactive | expired
    pub state: String,
    /// 首次接管时的原始音量 0..1
    pub original_volume: f32,
    /// 当前已写入的音量 0..1
    pub applied_volume: f32,
    /// 当前是否静音（原本静音的会话保持静音）
    pub muted: bool,
    /// 当前目标增益 0..1
    pub gain: f32,
}

/// 音频焦点只读快照。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioFocusSnapshot {
    /// 当前 active 的焦点 reason
    pub active: Vec<String>,
    /// 双音源 FIFO 冲突处理是否启用（设置页「两个音源同时播放」；false = 只保存、不处理）
    pub fifo_enabled: bool,
    /// 双音源 FIFO 状态（P3c；没有冲突时 winner 是唯一在播的一方、suppressed 为 None）
    pub fifo: FifoState,
    /// 正在被管理的会话
    pub sources: Vec<AudioSource>,
}

impl AudioFocusSnapshot {
    /// 进程启动、worker 还没发布首份快照时的占位值。
    pub fn initial() -> Self {
        Self {
            active: Vec::new(),
            fifo_enabled: true,
            fifo: FifoState::default(),
            sources: Vec::new(),
        }
    }
}

// ---------- 崩溃保护 journal ----------

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct JournalEntry {
    /// CoreAudio session instance id（跨进程重启仍能匹配同一个音频会话）
    session_instance_id: String,
    #[serde(default)]
    pid: u32,
    #[serde(default)]
    process: String,
    /// 接管前的原始音量 0..1。
    /// 故意不给 serde default：旧/损坏文件缺这个字段时整条记录解析失败，
    /// 避免把缺省 0.0 当成“原始音量 0”而把用户音乐静音。
    original_volume: f32,
    /// 接管前是否静音
    original_muted: bool,
    #[serde(default)]
    updated_at_ms: u64,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
struct JournalFile {
    version: u32,
    entries: Vec<JournalEntry>,
}

// ---------- 命令 ----------

enum AudioFocusCommand {
    Acquire { reason: String, gain: f32 },
    Release { reason: String },
    Snapshot { reply: Sender<AudioFocusSnapshot> },
    RestoreAll { reply: Sender<()> },
    /// P3c：手动恢复被 FIFO 压制的音源（解除静音 / 恢复音量，不自动播放）。
    RestoreSuppressed { reply: Sender<AudioFocusSnapshot> },
    /// 设置页开关：是否启用双音源 FIFO 冲突处理。
    SetFifoEnabled { enabled: bool, reply: Sender<AudioFocusSnapshot> },
}

// ---------- 会话枚举 ----------

/// 一次枚举得到的会话（worker 内部使用，不序列化）。
struct SessionEntry {
    instance_id: String,
    pid: u32,
    process: String,
    kind_hint: String,
    state: String,
    volume: ISimpleAudioVolume,
    volume_value: f32,
    muted: bool,
}

/// 正在被压低/恢复的会话。
struct ManagedSource {
    instance_id: String,
    pid: u32,
    process: String,
    kind_hint: String,
    state: String,
    volume: ISimpleAudioVolume,
    /// 首次接管时的原始音量；之后永不覆盖
    original_volume: f32,
    original_muted: bool,
    applied_volume: f32,
    from_gain: f32,
    target_gain: f32,
    transition_started: Instant,
    transition_duration: Duration,
    muted: bool,
}

impl ManagedSource {
    fn new(entry: SessionEntry, target_gain: f32, now: Instant) -> Self {
        let original_volume = entry.volume_value.clamp(0.0, 1.0);
        let target_gain = target_gain.clamp(0.0, 1.0);
        Self {
            instance_id: entry.instance_id,
            pid: entry.pid,
            process: entry.process,
            kind_hint: entry.kind_hint,
            state: entry.state,
            volume: entry.volume,
            original_volume,
            original_muted: entry.muted,
            applied_volume: original_volume,
            from_gain: 1.0,
            target_gain,
            transition_started: now,
            transition_duration: if target_gain < 1.0 {
                FADE_OUT_DURATION
            } else {
                FADE_IN_DURATION
            },
            muted: entry.muted,
        }
    }

    /// 当前插值到的增益（用于中途换目标）。
    fn gain_at(&self, now: Instant) -> f32 {
        if self.transition_duration.is_zero() {
            return self.target_gain;
        }
        let elapsed = now.saturating_duration_since(self.transition_started).as_secs_f32();
        let progress =
            (elapsed / self.transition_duration.as_secs_f32()).clamp(0.0, 1.0);
        self.from_gain + (self.target_gain - self.from_gain) * progress
    }

    fn as_snapshot(&self) -> AudioSource {
        AudioSource {
            kind_hint: self.kind_hint.clone(),
            pid: self.pid,
            process: self.process.clone(),
            state: self.state.clone(),
            original_volume: self.original_volume,
            applied_volume: self.applied_volume,
            muted: self.muted,
            gain: self.target_gain,
        }
    }
}

// ---------- worker ----------

struct Worker {
    snapshot: Arc<Mutex<AudioFocusSnapshot>>,
    journal_path: Option<PathBuf>,
    /// 蓝牙推流状态来源（P3c 注入；None = 没有蓝牙能力，FIFO 视为 external 从不在播）
    bt: Option<Arc<BtAudioManager>>,
    /// SMTC 会话状态来源（P3c 注入；None = 没有媒体会话能力，FIFO 视为 local 从不在播）
    media: Option<Arc<MediaSessionManager>>,
    /// 长期持有的设备枚举器（第一次成功时创建，之后复用）
    enumerator: Option<IMMDeviceEnumerator>,
    /// 默认渲染端点上的会话管理器
    manager: Option<IAudioSessionManager2>,
    /// 当前 manager 对应的默认端点 id（默认设备切换时重建）
    endpoint_id: String,
    reasons: HashMap<String, f32>,
    sources: Vec<ManagedSource>,
    /// 当前正在管理、需要写 journal 的会话
    journal: HashMap<String, JournalEntry>,
    /// 上次进程残留、还没成功恢复的 journal（没有默认端点时留到下次 tick 重试）
    pending_recovery: Vec<JournalEntry>,
    /// 恢复前的最短保持截止时间
    hold_until: Option<Instant>,
    /// 下一次重枚举会话的时间
    next_refresh: Instant,
    /// 下一次 FIFO 仲裁评估的时间
    next_fifo_eval: Instant,
    /// 双音源 FIFO 仲裁状态
    fifo: FifoArbiter,
    /// FIFO 冲突处理开关（设置里可关；关时只做语音/TTS 压低）
    fifo_enabled: bool,
    dirty: bool,
    manager_error_logged: bool,
    scan_error_logged: bool,
}

impl Worker {
    fn new(
        snapshot: Arc<Mutex<AudioFocusSnapshot>>,
        journal_path: Option<PathBuf>,
        bt: Option<Arc<BtAudioManager>>,
        media: Option<Arc<MediaSessionManager>>,
    ) -> Self {
        Self {
            snapshot,
            journal_path,
            bt,
            media,
            enumerator: None,
            manager: None,
            endpoint_id: String::new(),
            reasons: HashMap::new(),
            sources: Vec::new(),
            journal: HashMap::new(),
            pending_recovery: Vec::new(),
            hold_until: None,
            next_refresh: Instant::now(),
            next_fifo_eval: Instant::now(),
            fifo: FifoArbiter::default(),
            fifo_enabled: true,
            dirty: false,
            manager_error_logged: false,
            scan_error_logged: false,
        }
    }

    /// 启动：读残留 journal 做 best-effort 恢复，然后发布首份快照。
    fn initialize(&mut self) {
        if let Some(path) = self.journal_path.as_ref() {
            self.pending_recovery = read_journal(path);
        }
        self.try_recover_journal();
        self.publish();
        log::info!(
            "音频焦点 worker 已启动（journal={}）",
            if self.journal_path.is_some() {
                "启用"
            } else {
                "无 app_data_dir，跳过"
            }
        );
    }

    /// 按 journal 里记录的 session instance id，把上次残留的音量/静音态写回去。
    ///
    /// 没有默认输出端点时保留 `pending_recovery`，下一次会话枚举（如录音开始）时重试；
    /// 已不存在的会话只能放弃。
    fn try_recover_journal(&mut self) {
        if self.pending_recovery.is_empty() {
            self.delete_journal_file();
            return;
        }
        let Some(manager) = self.ensure_manager() else {
            // 没有默认输出端点（例如蓝牙扬声器刚断开）：保留 journal，下一次会话枚举时重试。
            log::warn!("音频焦点：找不到默认输出端点，残留 journal 稍后重试恢复");
            return;
        };
        let entries = match collect_sessions(&manager, &HashSet::new()) {
            Ok(entries) => entries,
            Err(err) => {
                log::warn!("音频焦点：恢复 journal 前枚举会话失败，保留残留记录: {err}");
                return;
            }
        };
        let by_id: HashMap<&str, &SessionEntry> = entries
            .iter()
            .map(|entry| (entry.instance_id.as_str(), entry))
            .collect();
        let pending = std::mem::take(&mut self.pending_recovery);
        let mut restored = 0usize;
        for saved in &pending {
            if !saved.original_volume.is_finite() {
                continue;
            }
            let Some(entry) = by_id.get(saved.session_instance_id.as_str()) else {
                continue;
            };
            if apply_restored_volume(*entry, saved.original_volume, saved.original_muted) {
                restored += 1;
            }
        }
        log::info!(
            "音频焦点：journal 恢复完成 {restored}/{}（其余会话已不存在）",
            pending.len()
        );
        self.delete_journal_file();
    }

    /// 取默认渲染端点上的 `IAudioSessionManager2`；默认设备变化时重建。
    fn ensure_manager(&mut self) -> Option<IAudioSessionManager2> {
        if self.enumerator.is_none() {
            match unsafe {
                CoCreateInstance::<_, IMMDeviceEnumerator>(
                    &MMDeviceEnumerator,
                    None,
                    CLSCTX_ALL,
                )
            } {
                Ok(enumerator) => self.enumerator = Some(enumerator),
                Err(err) => {
                    if !self.manager_error_logged {
                        log::warn!("音频焦点：创建音频设备枚举器失败: {err}");
                        self.manager_error_logged = true;
                    }
                    return None;
                }
            }
        }
        let enumerator = self.enumerator.as_ref()?;
        let device = match unsafe { enumerator.GetDefaultAudioEndpoint(eRender, eConsole) } {
            Ok(device) => device,
            Err(err) => {
                if !self.manager_error_logged {
                    log::warn!("音频焦点：找不到默认音频输出设备: {err}");
                    self.manager_error_logged = true;
                }
                // 旧 manager 可能还指向仍然存在的旧端点，先继续用；设备恢复后再重建。
                return self.manager.clone();
            }
        };
        let endpoint_id = read_device_id(&device);
        if self.manager.is_none() || endpoint_id != self.endpoint_id {
            match unsafe { device.Activate::<IAudioSessionManager2>(CLSCTX_ALL, None) } {
                Ok(manager) => {
                    if self.manager.is_some() {
                        log::info!("音频焦点：默认输出端点切换，重建会话管理器");
                    }
                    self.manager = Some(manager);
                    self.endpoint_id = endpoint_id;
                    self.manager_error_logged = false;
                }
                Err(err) => {
                    log::warn!("音频焦点：打开音频会话管理器失败: {err}");
                    // 保留旧 manager，避免一次失败就把已有压低丢掉。
                }
            }
        }
        self.manager.clone()
    }

    /// 按“所有 active reason 的最小增益”刷新一次会话列表。
    fn refresh_sessions(&mut self, now: Instant) {
        let Some(manager) = self.ensure_manager() else {
            return;
        };
        // 上次残留的 journal 还没恢复成功（例如启动时没有输出端点）：先恢复，避免把
        // 旧记录混进本次 journal。
        if !self.pending_recovery.is_empty() {
            self.try_recover_journal();
        }
        let Some(excluded) = self_process_tree() else {
            if !self.scan_error_logged {
                log::warn!("音频焦点：读取进程树失败，本轮跳过压低（避免误压自身 TTS）");
                self.scan_error_logged = true;
            }
            return;
        };
        let entries = match collect_sessions(&manager, &excluded) {
            Ok(entries) => entries,
            Err(err) => {
                if !self.scan_error_logged {
                    log::warn!("音频焦点：{err}");
                    self.scan_error_logged = true;
                }
                return;
            }
        };
        self.scan_error_logged = false;

        let present: HashSet<String> = entries
            .iter()
            .map(|entry| entry.instance_id.clone())
            .collect();
        let mut changed = false;

        // 会话消失（应用退出 / 会话过期）：best-effort 写回原值并停止管理。
        let missing: Vec<String> = self
            .sources
            .iter()
            .filter(|source| !present.contains(&source.instance_id))
            .map(|source| source.instance_id.clone())
            .collect();
        if !missing.is_empty() {
            for source in &self.sources {
                if !missing.iter().any(|id| id == &source.instance_id) {
                    continue;
                }
                restore_source(source);
                self.journal.remove(&source.instance_id);
                changed = true;
            }
            self.sources
                .retain(|source| !missing.iter().any(|id| id == &source.instance_id));
        }

        // 所有 active reason 取最小增益；没有焦点时 base = 1.0（不接管新会话）。
        // FIFO 压制再按通道取 min（P3c）：语音/TTS 压低与 FIFO 互不覆盖。
        let base_gain = self.reasons.values().copied().fold(1.0_f32, f32::min);
        let suppress_external = self.fifo.suppressed == Some(FifoChannel::External);
        let suppress_local = self.fifo.suppressed == Some(FifoChannel::Local);

        for entry in entries {
            if let Some(source) = self
                .sources
                .iter_mut()
                .find(|source| source.instance_id == entry.instance_id)
            {
                // 已管理的会话：只更新诊断信息，绝不重新读原始音量。
                source.state = entry.state;
                source.process = entry.process;
                source.kind_hint = entry.kind_hint;
                source.muted = entry.muted;
                source.volume = entry.volume;
                continue;
            }
            let target_gain = target_gain_for(
                &entry.kind_hint,
                base_gain,
                suppress_external,
                suppress_local,
            );
            if target_gain >= 1.0 {
                continue;
            }
            let source = ManagedSource::new(entry, target_gain, now);
            self.journal.insert(
                source.instance_id.clone(),
                JournalEntry {
                    session_instance_id: source.instance_id.clone(),
                    pid: source.pid,
                    process: source.process.clone(),
                    original_volume: source.original_volume,
                    original_muted: source.original_muted,
                    updated_at_ms: unix_millis(),
                },
            );
            self.sources.push(source);
            changed = true;
        }

        if changed {
            self.write_journal();
            self.dirty = true;
        }
    }

    /// 计算当前应写入的目标增益；`None` 表示还在最短保持时间内，先不动。
    fn effective_target_gain(&self, now: Instant) -> Option<f32> {
        if self.reasons.is_empty() {
            if let Some(until) = self.hold_until {
                if now < until {
                    return None;
                }
            }
            Some(1.0)
        } else {
            Some(
                self.reasons
                    .values()
                    .copied()
                    .fold(1.0_f32, f32::min),
            )
        }
    }

    /// 推动所有会话的过渡；到达 1.0 且没有 reason / FIFO 压制时写回原值并移出管理表。
    fn step_transitions(&mut self, now: Instant) {
        if self.sources.is_empty() {
            return;
        }
        let Some(base_gain) = self.effective_target_gain(now) else {
            return;
        };
        let suppress_external = self.fifo.suppressed == Some(FifoChannel::External);
        let suppress_local = self.fifo.suppressed == Some(FifoChannel::Local);
        // 没有焦点也没有压制时，恢复到 1.0 的会话可以交还给系统（写回原值）。
        let can_release = self.reasons.is_empty() && self.fifo.suppressed.is_none();
        let mut restored = Vec::new();
        let mut changed = false;

        for source in &mut self.sources {
            let target = target_gain_for(
                &source.kind_hint,
                base_gain,
                suppress_external,
                suppress_local,
            );
            if (source.target_gain - target).abs() > f32::EPSILON {
                // 新命令打断上一段过渡：从当前插值音量重新起步。
                let current = source.gain_at(now);
                source.from_gain = current;
                source.target_gain = target;
                source.transition_started = now;
                source.transition_duration = if target < current {
                    FADE_OUT_DURATION
                } else {
                    FADE_IN_DURATION
                };
                changed = true;
            }

            let progress = if source.transition_duration.is_zero() {
                1.0
            } else {
                (now
                    .saturating_duration_since(source.transition_started)
                    .as_secs_f32()
                    / source.transition_duration.as_secs_f32())
                .clamp(0.0, 1.0)
            };
            let gain =
                source.from_gain + (source.target_gain - source.from_gain) * progress;
            let target_volume = (source.original_volume * gain).clamp(0.0, 1.0);
            if (target_volume - source.applied_volume).abs() > VOLUME_EPSILON {
                match unsafe {
                    source
                        .volume
                        .SetMasterVolume(target_volume, core::ptr::null())
                } {
                    Ok(()) => {
                        source.applied_volume = target_volume;
                    }
                    Err(err) => {
                        // 会话可能已经结束：记一次日志并接受这次写入，避免每 10ms 重试刷屏。
                        log::warn!(
                            "音频焦点：写入 {} 音量失败: {err}",
                            display_process(&source.process, source.pid)
                        );
                        source.applied_volume = target_volume;
                    }
                }
                changed = true;
            }

            if progress >= 1.0
                && source.target_gain >= 1.0
                && can_release
            {
                restore_source(source);
                restored.push(source.instance_id.clone());
                changed = true;
            }
        }

        if !restored.is_empty() {
            for id in &restored {
                self.journal.remove(id);
            }
            self.sources
                .retain(|source| !restored.contains(&source.instance_id));
            self.write_journal();
        }
        if changed {
            self.dirty = true;
        }
    }

    // ---------- FIFO 双音源仲裁（P3c，SPEC §3.6） ----------

    /// 当前正在播放的本机会话 id（SMTC 快照里 `playing == true` 的会话）。
    ///
    /// 快照由 media worker 维护；这里在每次评估前请求一次后台刷新（不等待），
    /// 所以看到的是「最多一拍前」的状态——足够判定“谁先开始”，也不会阻塞焦点命令。
    fn local_playing_ids(&self) -> Vec<String> {
        let Some(media) = self.media.as_deref() else {
            return Vec::new();
        };
        media
            .snapshot()
            .sessions
            .into_iter()
            .filter(|session| session.playing)
            .map(|session| session.id)
            .collect()
    }

    /// 读两路快照并推进 FIFO 状态机（每个 [`FIFO_POLL_INTERVAL`] 调一次，空闲也调）。
    fn evaluate_fifo(&mut self, now: Instant) {
        if !self.fifo_enabled {
            // 设置里关掉了冲突处理：不压制任何音源，并把残留状态清掉（只恢复音量，不动播放）。
            if self.fifo.suppressed.is_some() {
                self.clear_suppression("fifo-disabled");
            }
            self.fifo = FifoArbiter::default();
            return;
        }
        // 让 media worker 在后台重新枚举一次 SMTC 会话（不阻塞本线程）。
        if let Some(media) = self.media.as_deref() {
            let _ = media.request_refresh();
        }
        let external_playing = self
            .bt
            .as_deref()
            .map(|bt| bt.snapshot().streaming)
            .unwrap_or(false);
        let local_playing = !self.local_playing_ids().is_empty();

        let external_started = external_playing && !self.fifo.external_playing;
        let local_started = local_playing && !self.fifo.local_playing;

        self.fifo.external_playing = external_playing;
        self.fifo.local_playing = local_playing;
        self.fifo.external_since = if external_playing {
            self.fifo.external_since.or(Some(now))
        } else {
            None
        };
        self.fifo.local_since = if local_playing {
            self.fifo.local_since.or(Some(now))
        } else {
            None
        };

        // 任一方有新的播放开始：手动恢复优先失效，重新按 FIFO 判定。
        if external_started || local_started {
            self.fifo.manual_override = false;
        }

        if !(external_playing && local_playing) {
            // 只有一方（或都不）在播：不该残留压制，立即恢复输家音量。
            self.clear_suppression("only-one-source");
            self.fifo.winner = if external_playing {
                Some(FifoChannel::External)
            } else if local_playing {
                Some(FifoChannel::Local)
            } else {
                None
            };
            return;
        }

        // 两方同时在播。
        if self.fifo.suppressed.is_some() {
            return;
        }
        let winner = self.decide_winner();
        if self.fifo.manual_override {
            // 手动恢复过：直到下一次新的播放开始之前都不再压制。
            self.fifo.winner = Some(winner);
            return;
        }
        self.suppress_loser(winner.other(), now);
    }

    /// 后开始播放的一方胜出；时间戳相同（同一拍观察到）或缺失时按本机媒体优先
    /// （SPEC §3.6 tie-break：避免电话推流和用户点播放互抢）。
    fn decide_winner(&self) -> FifoChannel {
        match (self.fifo.external_since, self.fifo.local_since) {
            // external 先开始 → local 是后开始的一方，胜出
            (Some(external), Some(local)) if external < local => FifoChannel::Local,
            // local 先开始 → external 是后开始的一方，胜出
            (Some(external), Some(local)) if local < external => FifoChannel::External,
            // 同时开始 / 缺时间戳：本机媒体优先
            _ => FifoChannel::Local,
        }
    }

    /// 压制输家：只作用于平板本地输出，不自动恢复、不断连接、不碰无线电、不操控对端。
    fn suppress_loser(&mut self, loser: FifoChannel, now: Instant) {
        self.fifo.suppressed = Some(loser);
        self.fifo.winner = Some(loser.other());
        self.fifo.paused_ids.clear();
        match loser {
            FifoChannel::External => {
                // 输家是蓝牙音乐：平板本地静音（手机继续推流，我们只是不出声）。
                if let Some(bt) = self.bt.as_deref() {
                    bt.set_output_suppressed(true, Some("local-media-playing".to_string()));
                }
                self.fifo.pending_pause_at = None;
                log::info!("双音源冲突：蓝牙音乐被后续播放压制，本地静音");
            }
            FifoChannel::Local => {
                // 输家是本机媒体：先淡出到 0（目标增益 0 走过渡），淡出结束后发一次 pause。
                // 注：若本机会话属于“自身进程树”（例如受管 Edge 窗口是本进程的子进程），它按
                // P1 规则不参与音量管理，这里就没有淡出——SMTC pause 仍然生效（全局接口）。
                self.fifo.pending_pause_at = Some(now + FADE_OUT_DURATION);
                log::info!("双音源冲突：本机媒体被后续播放压制，淡出后暂停");
            }
        }
        // 立刻接管输家会话（目标增益 0），不等下一次周期性刷新。
        self.next_refresh = Instant::now();
        self.dirty = true;
    }

    /// 淡出完成后，对仍在播放的本机会话发一次 SMTC pause（每集只发一次，不自动播放回来）。
    fn pause_suppressed_local(&mut self) {
        self.fifo.pending_pause_at = None;
        if self.fifo.suppressed != Some(FifoChannel::Local) {
            return;
        }
        let Some(media) = self.media.as_deref() else {
            return;
        };
        for id in self.local_playing_ids() {
            if !self.fifo.paused_ids.insert(id.clone()) {
                continue;
            }
            match media.command(&id, "pause") {
                Ok(_) => log::info!("双音源冲突：已暂停本机媒体会话（{id}）"),
                Err(err) => log::warn!("双音源冲突：暂停本机媒体会话失败（{id}）: {err}"),
            }
        }
    }

    /// 解除压制：恢复输家的目标增益（local 只是恢复音量，仍停在暂停态，等用户自己点播放），
    /// 蓝牙本地静音旗标一并清掉。`reason` 只进日志。
    fn clear_suppression(&mut self, reason: &str) {
        let Some(loser) = self.fifo.suppressed.take() else {
            return;
        };
        if loser == FifoChannel::External {
            if let Some(bt) = self.bt.as_deref() {
                bt.set_output_suppressed(false, None);
            }
        }
        self.fifo.pending_pause_at = None;
        self.fifo.paused_ids.clear();
        self.next_refresh = Instant::now();
        self.dirty = true;
        log::info!("双音源冲突：解除对 {} 的压制（{reason}）", loser.as_str());
    }

    /// 手动恢复（FIFO 的唯一恢复路径）：解除压制、恢复音量，并进入手动覆盖，
    /// 直到下一次任一方新的播放开始再重新判定。不恢复播放（本机媒体仍需用户自己点）。
    fn restore_suppressed_now(&mut self) {
        let loser = self.fifo.suppressed.take();
        let bt_flagged = self
            .bt
            .as_deref()
            .map(|bt| bt.snapshot().output_suppressed)
            .unwrap_or(false);
        if let Some(bt) = self.bt.as_deref() {
            bt.set_output_suppressed(false, None);
        }
        self.fifo.pending_pause_at = None;
        self.fifo.paused_ids.clear();
        if loser.is_some() || bt_flagged {
            self.fifo.manual_override = true;
        }
        self.next_refresh = Instant::now();
        self.dirty = true;
        match loser {
            Some(FifoChannel::External) => {
                log::info!("双音源冲突：手动恢复蓝牙音乐输出（本机媒体继续播放）")
            }
            Some(FifoChannel::Local) => {
                log::info!("双音源冲突：手动恢复本机媒体音量（播放仍需用户自己点）")
            }
            None => log::info!("双音源冲突：当前没有处于压制状态的一方，手动恢复为空操作"),
        }
        self.publish();
    }

    fn handle_command(&mut self, command: AudioFocusCommand) {
        match command {
            AudioFocusCommand::Acquire { reason, gain } => {
                let gain = if gain.is_finite() {
                    gain.clamp(0.0, 1.0)
                } else {
                    1.0
                };
                self.reasons.insert(reason, gain);
                // 最短保持：快速点按 / 录音→TTS 之间不中间回弹。
                self.hold_until = Some(Instant::now() + MIN_HOLD);
                // 下一次 tick 立刻枚举，保证开口前音乐已经开始淡出。
                self.next_refresh = Instant::now();
                self.publish();
            }
            AudioFocusCommand::Release { reason } => {
                self.reasons.remove(&reason);
                self.publish();
            }
            AudioFocusCommand::Snapshot { reply } => {
                self.publish();
                let _ = reply.send(self.build_snapshot());
            }
            AudioFocusCommand::RestoreAll { reply } => {
                self.restore_all_now();
                let _ = reply.send(());
            }
            AudioFocusCommand::RestoreSuppressed { reply } => {
                self.restore_suppressed_now();
                let _ = reply.send(self.build_snapshot());
            }
            AudioFocusCommand::SetFifoEnabled { enabled, reply } => {
                self.fifo_enabled = enabled;
                if self.fifo.suppressed.is_some() {
                    self.clear_suppression("fifo-setting-changed");
                }
                // 开关变化后从干净的检测状态开始，下一拍再重新判定（不沿用旧的先后关系）。
                self.fifo = FifoArbiter::default();
                self.publish();
                let _ = reply.send(self.build_snapshot());
            }
        }
    }

    fn tick(&mut self) {
        let now = Instant::now();
        // FIFO 仲裁：空闲也按固定节奏评估（命令随时可以打断这一拍）。
        if now >= self.next_fifo_eval {
            self.evaluate_fifo(now);
            self.next_fifo_eval = Instant::now() + FIFO_POLL_INTERVAL;
        }
        // local 输家：淡出结束后补发一次 pause（只发一次）。
        if let Some(at) = self.fifo.pending_pause_at {
            if now >= at {
                self.pause_suppressed_local();
            }
        }
        // 焦点活跃或 FIFO 压制期间才重枚举会话（空闲不枚举）。
        let managing = !self.reasons.is_empty() || self.fifo.suppressed.is_some();
        if managing && now >= self.next_refresh {
            self.refresh_sessions(now);
            self.next_refresh = Instant::now() + SESSION_REFRESH_INTERVAL;
        }
        self.step_transitions(now);
        if self.dirty {
            self.dirty = false;
            self.publish();
        }
    }

    fn next_wait(&self, now: Instant) -> Duration {
        let transitioning = self.sources.iter().any(|source| {
            source.transition_started + source.transition_duration > now
        });
        if transitioning {
            return FADE_STEP;
        }
        let fifo_wait = self
            .next_fifo_eval
            .saturating_duration_since(now)
            .max(FADE_STEP);
        if !self.reasons.is_empty() || self.fifo.suppressed.is_some() {
            return self
                .next_refresh
                .saturating_duration_since(now)
                .max(FADE_STEP)
                .min(fifo_wait);
        }
        if !self.sources.is_empty() {
            // 目标已回到 1.0、只差最后一拍写回再移出管理表：保持高频（最多一个淡入时长）。
            // 注意：FIFO 压制期间会长期持有目标 0 的会话，那种情况走上面的分支，不能在这里空转。
            return FADE_STEP;
        }
        // 空闲也要醒来评估 FIFO（两路快照的状态变化只能靠轮询发现）。
        fifo_wait
    }

    fn build_snapshot(&self) -> AudioFocusSnapshot {
        let mut active: Vec<String> = self.reasons.keys().cloned().collect();
        active.sort_by_key(|reason| match reason.as_str() {
            "voiceInput" => 0u8,
            "speechOutput" => 1,
            _ => 2,
        });
        let mut sources: Vec<&ManagedSource> = self.sources.iter().collect();
        sources.sort_by(|left, right| {
            left.process
                .cmp(&right.process)
                .then(left.pid.cmp(&right.pid))
        });
        AudioFocusSnapshot {
            active,
            fifo_enabled: self.fifo_enabled,
            fifo: FifoState {
                winner: self.fifo.winner.map(|channel| channel.as_str().to_string()),
                suppressed: self
                    .fifo
                    .suppressed
                    .map(|channel| channel.as_str().to_string()),
            },
            sources: sources
                .into_iter()
                .map(ManagedSource::as_snapshot)
                .collect(),
        }
    }

    fn publish(&self) {
        let snapshot = self.build_snapshot();
        let mut guard = self
            .snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        *guard = snapshot;
    }

    /// 退出兜底：立即写回所有会话的原始音量/静音态并清空状态（含 FIFO 压制）。
    fn restore_all_now(&mut self) {
        for source in &self.sources {
            restore_source(source);
        }
        let restored = self.sources.len();
        self.sources.clear();
        self.reasons.clear();
        self.hold_until = None;
        self.journal.clear();
        // FIFO：清掉压制与本地静音旗标（只动平板本地输出，不碰蓝牙连接/无线电）。
        let suppressed = self.fifo.suppressed.take();
        self.fifo = FifoArbiter::default();
        if let Some(bt) = self.bt.as_deref() {
            bt.set_output_suppressed(false, None);
        }
        self.write_journal();
        self.dirty = false;
        self.publish();
        if restored > 0 {
            log::info!("音频焦点：已恢复 {restored} 个被压低的音频会话");
        }
        if suppressed.is_some() {
            log::info!("音频焦点：已清除双音源压制状态");
        }
    }

    /// worker 退出前的兜底（正常退出由 restore_all 命令先做）。
    fn shutdown(&mut self) {
        let fifo_dirty = self.fifo.suppressed.is_some()
            || self
                .bt
                .as_deref()
                .map(|bt| bt.snapshot().output_suppressed)
                .unwrap_or(false);
        if !self.sources.is_empty() || !self.reasons.is_empty() || fifo_dirty {
            self.restore_all_now();
        } else {
            self.write_journal();
        }
    }

    fn write_journal(&self) {
        let Some(path) = self.journal_path.as_ref() else {
            return;
        };
        // 上一次的残留还没恢复成功：不要覆盖/删除它。
        if !self.pending_recovery.is_empty() {
            return;
        }
        if self.journal.is_empty() {
            self.delete_journal_file();
            return;
        }
        if let Some(parent) = path.parent() {
            if let Err(err) = std::fs::create_dir_all(parent) {
                log::warn!("音频焦点：创建 journal 目录失败: {err}");
                return;
            }
        }
        let mut entries: Vec<JournalEntry> = self.journal.values().cloned().collect();
        entries.sort_by(|left, right| {
            left.session_instance_id
                .cmp(&right.session_instance_id)
        });
        let file = JournalFile {
            version: JOURNAL_VERSION,
            entries,
        };
        match serde_json::to_string_pretty(&file) {
            Ok(text) => {
                if let Err(err) = std::fs::write(path, text) {
                    log::warn!("音频焦点：写 journal 失败: {err}");
                }
            }
            Err(err) => log::warn!("音频焦点：序列化 journal 失败: {err}"),
        }
    }

    fn delete_journal_file(&self) {
        let Some(path) = self.journal_path.as_ref() else {
            return;
        };
        match std::fs::remove_file(path) {
            Ok(()) => {}
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => {}
            Err(err) => log::warn!("音频焦点：删除 journal 失败: {err}"),
        }
    }
}

// ---------- worker 主循环 ----------

fn run_worker(worker: &mut Worker, receiver: Receiver<AudioFocusCommand>, stop: &AtomicBool) {
    loop {
        if stop.load(Ordering::SeqCst) {
            break;
        }
        let wait = worker.next_wait(Instant::now());
        match receiver.recv_timeout(wait) {
            Ok(command) => worker.handle_command(command),
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => break,
        }
        // 先把已经排队的命令处理完（命令优先于过渡 tick），再走一拍过渡。
        while let Ok(command) = receiver.try_recv() {
            worker.handle_command(command);
            if stop.load(Ordering::SeqCst) {
                break;
            }
        }
        if stop.load(Ordering::SeqCst) {
            break;
        }
        worker.tick();
    }
}

// ---------- CoreAudio 辅助 ----------

/// 枚举默认端点上的全部音频会话（已排除自身进程树、系统提示音与过期会话）。
fn collect_sessions(
    manager: &IAudioSessionManager2,
    excluded_pids: &HashSet<u32>,
) -> Result<Vec<SessionEntry>, String> {
    let enumerator = unsafe { manager.GetSessionEnumerator() }
        .map_err(|failure| format!("枚举音频会话失败: {failure}"))?;
    let count = unsafe { enumerator.GetCount() }
        .map_err(|failure| format!("读取音频会话数量失败: {failure}"))?;
    let mut sessions = Vec::new();
    let mut seen: HashSet<String> = HashSet::new();

    for index in 0..count {
        let control = match unsafe { enumerator.GetSession(index) } {
            Ok(control) => control,
            Err(err) => {
                log::warn!("音频焦点：读取第 {index} 个音频会话失败: {err}");
                continue;
            }
        };
        // IAudioSessionControl2 提供 pid / session instance id（IAudioSessionControl 本身没有）。
        let control2: IAudioSessionControl2 = match control.cast() {
            Ok(control2) => control2,
            Err(err) => {
                log::warn!("音频焦点：会话不支持 IAudioSessionControl2: {err}");
                continue;
            }
        };
        let pid = unsafe { control2.GetProcessId() }.unwrap_or(0);
        if pid == 0 || excluded_pids.contains(&pid) {
            // 自身进程树（含 msedgewebview2.exe）永不压低。
            continue;
        }
        // 系统提示音（登录/错误音等）不参与压低；S_FALSE 才是普通会话。
        if unsafe { control2.IsSystemSoundsSession() }.0 == 0 {
            continue;
        }
        let instance_id = unsafe { control2.GetSessionInstanceIdentifier() }
            .ok()
            .map(|value| unsafe { take_pwstr(value) })
            .filter(|id| !id.is_empty())
            .unwrap_or_else(|| format!("pid-{pid}"));
        if !seen.insert(instance_id.clone()) {
            continue;
        }
        let state = match unsafe { control.GetState() } {
            Ok(state) => session_state_text(state).to_string(),
            Err(err) => {
                log::warn!("音频焦点：读取会话状态失败（pid {pid}）: {err}");
                continue;
            }
        };
        if state == "expired" {
            continue;
        }
        // IAudioSessionControl 与 ISimpleAudioVolume 是同一个会话对象上的两个接口。
        let volume: ISimpleAudioVolume = match control.cast() {
            Ok(volume) => volume,
            Err(err) => {
                log::warn!("音频焦点：会话不支持 ISimpleAudioVolume（pid {pid}）: {err}");
                continue;
            }
        };
        let volume_value = match unsafe { volume.GetMasterVolume() } {
            Ok(value) if value.is_finite() => value.clamp(0.0, 1.0),
            Ok(_) => 1.0,
            Err(err) => {
                log::warn!("音频焦点：读取会话音量失败（pid {pid}）: {err}");
                continue;
            }
        };
        let muted = unsafe { volume.GetMute() }
            .map(|value| value.as_bool())
            .unwrap_or(false);
        let process = process_name(pid);
        let kind_hint = kind_hint_for(&process).to_string();
        sessions.push(SessionEntry {
            instance_id,
            pid,
            process,
            kind_hint,
            state,
            volume,
            volume_value,
            muted,
        });
    }
    Ok(sessions)
}

/// 写回指定会话的原始音量/静音态（journal 恢复用）。
fn apply_restored_volume(
    entry: &SessionEntry,
    original_volume: f32,
    original_muted: bool,
) -> bool {
    let volume = original_volume.clamp(0.0, 1.0);
    unsafe {
        if let Err(err) = entry.volume.SetMasterVolume(volume, core::ptr::null()) {
            log::warn!(
                "音频焦点：journal 恢复 {} 音量失败: {err}",
                display_process(&entry.process, entry.pid)
            );
            return false;
        }
        if let Err(err) = entry.volume.SetMute(original_muted, core::ptr::null()) {
            log::warn!(
                "音频焦点：journal 恢复 {} 静音态失败: {err}",
                display_process(&entry.process, entry.pid)
            );
        }
    }
    true
}

/// 把会话写回首次接管时记录的原值并还原 mute。
fn restore_source(source: &ManagedSource) {
    unsafe {
        if let Err(err) = source
            .volume
            .SetMasterVolume(source.original_volume, core::ptr::null())
        {
            log::warn!(
                "音频焦点：恢复 {} 音量失败: {err}",
                display_process(&source.process, source.pid)
            );
        }
        if let Err(err) = source
            .volume
            .SetMute(source.original_muted, core::ptr::null())
        {
            log::warn!(
                "音频焦点：恢复 {} 静音态失败: {err}",
                display_process(&source.process, source.pid)
            );
        }
    }
}

fn session_state_text(state: AudioSessionState) -> &'static str {
    if state == AudioSessionStateActive {
        "active"
    } else if state == AudioSessionStateInactive {
        "inactive"
    } else {
        "expired"
    }
}

/// 进程名 → kind 提示（按通用播放器/浏览器名单分类，P3c 的 FIFO 用它区分两侧）。
fn kind_hint_for(process: &str) -> &'static str {
    if LOCAL_MEDIA_PROCESS_NAMES.contains(&process) {
        "local-media"
    } else if process == "svchost.exe" || process == "audiodg.exe" {
        // A2DP Sink 推送的音频目前观察到挂在系统音频服务上（P1a 待实测确认）。
        "external-media"
    } else {
        "other"
    }
}

/// 某个会话的最终目标增益 = min(所有 active reason 的增益, FIFO 压制增益)。
///
/// 语音 / TTS 压低与 FIFO 压制叠加时取最小值，互不覆盖（SPEC §3.2 / §3.6）：
/// 录音期间即使 FIFO 只压制了一侧，另一侧仍按 voiceGain 压低。
///
/// FIFO 压制 external 时作用于“非 local-media”的会话：蓝牙 Sink 推流的会话归属进程
/// 在真机上尚未实测（P1a），不能只认 `external-media` 这一种分类；宁可把同一侧的其他
/// 非本机媒体也静音，也不能出现“冲突了但蓝牙音乐还在响”。
fn target_gain_for(
    kind_hint: &str,
    base_gain: f32,
    suppress_external: bool,
    suppress_local: bool,
) -> f32 {
    let fifo_gain = if suppress_external && kind_hint != "local-media" {
        0.0
    } else if suppress_local && kind_hint == "local-media" {
        0.0
    } else {
        1.0
    };
    base_gain.min(fifo_gain)
}

fn display_process(process: &str, pid: u32) -> String {
    if process.is_empty() {
        format!("pid {pid}")
    } else {
        process.to_string()
    }
}

/// 读 session / device 的 PWSTR 并释放 CoTaskMem 内存。
///
/// SAFETY: 调用方保证 `value` 是 COM 分配、以 NUL 结尾的字符串。
unsafe fn take_pwstr(value: PWSTR) -> String {
    if value.is_null() {
        return String::new();
    }
    let text = unsafe { value.to_string().unwrap_or_default() };
    // SAFETY: COM（CoTaskMemAlloc）分配的内存由调用方用 CoTaskMemFree 释放。
    unsafe { CoTaskMemFree(Some(value.0 as *const core::ffi::c_void)) };
    text
}

fn read_device_id(device: &IMMDevice) -> String {
    unsafe {
        match device.GetId() {
            Ok(id) => take_pwstr(id),
            Err(err) => {
                log::warn!("音频焦点：读取默认输出设备 id 失败: {err}");
                String::new()
            }
        }
    }
}

fn unix_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

// ---------- 进程树 / 进程名 ----------

/// 自身音频会话的 pid 集合：本进程 + **WebView2 子进程树**（`msedgewebview2.exe`）。
///
/// 不能把整棵子孙树都排除：受管浏览器窗口是宿主用 `Command::spawn()` 拉起的微软 Edge
/// （`msedge.exe`），它同样是本进程的子进程，但它的音频（本机媒体）必须参与压低与 FIFO。
/// 因此这里只沿 `msedgewebview2.exe` 向下排除（TTS / 插件 iframe 声音都在那棵树里）；
/// 其它子进程（例如 Edge 浏览器、外部工具）即使父进程是本进程也不算自身。
///
/// 进程枚举顺序不保证父进程在前，所以按父 pid 反复扫到不动点（进程总数几百，代价可忽略）。
/// 拿不到进程快照时返回 `None`：宁可这一轮不压低，也不能把自身的 TTS 会话一起压了。
fn self_process_tree() -> Option<HashSet<u32>> {
    let current = std::process::id();
    let mut parents: HashMap<u32, u32> = HashMap::new();
    let mut names: HashMap<u32, String> = HashMap::new();
    unsafe {
        // Toolhelp 偶发 ERROR_BAD_LENGTH，重试一次即可。
        let mut snapshot = None;
        for _ in 0..2 {
            if let Ok(handle) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
                snapshot = Some(handle);
                break;
            }
        }
        let snapshot = snapshot?;
        let mut entry = PROCESSENTRY32W::default();
        entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() as u32;
        if Process32FirstW(snapshot, &mut entry).is_err() {
            let _ = CloseHandle(snapshot);
            return None;
        }
        loop {
            parents.insert(entry.th32ProcessID, entry.th32ParentProcessID);
            let raw = String::from_utf16_lossy(&entry.szExeFile);
            let name = raw.trim_end_matches('\0').trim().to_lowercase();
            names.insert(entry.th32ProcessID, name);
            if Process32NextW(snapshot, &mut entry).is_err() {
                break;
            }
        }
        let _ = CloseHandle(snapshot);
    }

    let mut self_pids: HashSet<u32> = HashSet::new();
    self_pids.insert(current);
    loop {
        let mut added = false;
        for (pid, parent) in &parents {
            if self_pids.contains(pid) {
                continue;
            }
            let name = names.get(pid).map(String::as_str).unwrap_or("");
            let is_webview = name == "msedgewebview2.exe";
            let include = if is_webview {
                // WebView2 进程即使不是直接子进程（中间夹了 helper）也要排除整棵子树。
                true
            } else if *parent == current {
                // 本进程的直接子进程里只有 WebView2 算自身；Edge 浏览器等不排除。
                false
            } else {
                self_pids.contains(parent)
            };
            if include && self_pids.insert(*pid) {
                added = true;
            }
        }
        if !added {
            break;
        }
    }
    Some(self_pids)
}

/// 进程 exe 名（小写）；拿不到返回空串（不抛错）。
fn process_name(pid: u32) -> String {
    unsafe {
        let Ok(handle) =
            OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid)
        else {
            return String::new();
        };
        let mut buffer = [0u16; 512];
        let mut length = buffer.len() as u32;
        let result = QueryFullProcessImageNameW(
            handle,
            PROCESS_NAME_WIN32,
            PWSTR(buffer.as_mut_ptr()),
            &mut length,
        );
        let _ = CloseHandle(handle);
        if result.is_err() || length == 0 {
            return String::new();
        }
        let path = String::from_utf16_lossy(&buffer[..length as usize]);
        path.rsplit('\\')
            .next()
            .unwrap_or(path.as_str())
            .to_lowercase()
    }
}

// ---------- journal 读写 ----------

fn read_journal(path: &Path) -> Vec<JournalEntry> {
    let text = match std::fs::read_to_string(path) {
        Ok(text) => text,
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => return Vec::new(),
        Err(err) => {
            log::warn!("音频焦点：读取 journal 失败: {err}");
            return Vec::new();
        }
    };
    match serde_json::from_str::<JournalFile>(&text) {
        Ok(file) => file.entries,
        Err(err) => {
            log::warn!("音频焦点：解析 journal 失败（按空处理）: {err}");
            Vec::new()
        }
    }
}

// ---------- Tauri managed state ----------

/// 宿主侧句柄：只读快照 + 命令通道 + stop flag + join handle，不持有任何 COM 对象。
pub struct AudioFocusManager {
    snapshot: Arc<Mutex<AudioFocusSnapshot>>,
    command_tx: Mutex<Option<Sender<AudioFocusCommand>>>,
    stop: Arc<AtomicBool>,
    join: Mutex<Option<JoinHandle<()>>>,
}

impl AudioFocusManager {
    /// 启动后台 worker。
    ///
    /// - `app_data_dir` 为 None 时不做 journal 崩溃保护（只影响恢复能力）；
    /// - `bt` / `media` 是 P3c FIFO 仲裁的两路状态来源（只读快照 + 命令通道，不引入新线程）；
    ///   传 None 时该侧视为“从不在播”，FIFO 自然不触发。
    pub fn start(
        app_data_dir: Option<PathBuf>,
        bt: Option<Arc<BtAudioManager>>,
        media: Option<Arc<MediaSessionManager>>,
    ) -> Self {
        let snapshot = Arc::new(Mutex::new(AudioFocusSnapshot::initial()));
        let (command_tx, command_rx) = mpsc::channel::<AudioFocusCommand>();
        let stop = Arc::new(AtomicBool::new(false));
        let worker_snapshot = Arc::clone(&snapshot);
        let worker_stop = Arc::clone(&stop);
        let journal_path = app_data_dir.map(|dir| dir.join(JOURNAL_FILE_NAME));

        let join = thread::Builder::new()
            .name("audio-focus-worker".to_string())
            .spawn(move || {
                // 每个后台线程各自初始化 COM/WinRT（MTA），与蓝牙 worker 互不影响。
                let initialized = unsafe { RoInitialize(RO_INIT_MULTITHREADED).is_ok() };
                {
                    let mut worker = Worker::new(worker_snapshot, journal_path, bt, media);
                    worker.initialize();
                    run_worker(&mut worker, command_rx, &worker_stop);
                    worker.shutdown();
                }
                if initialized {
                    // SAFETY: 与上方 RoInitialize(MTA) 成对。
                    unsafe { RoUninitialize() };
                }
                log::info!("音频焦点 worker 已退出");
            })
            .ok();

        if join.is_none() {
            log::error!("无法启动音频焦点 worker 线程");
        }

        Self {
            snapshot,
            command_tx: Mutex::new(Some(command_tx)),
            stop,
            join: Mutex::new(join),
        }
    }

    /// 读快照：纯内存克隆，无 COM 调用，可在任意线程高频调用。
    pub fn snapshot(&self) -> AudioFocusSnapshot {
        self.snapshot
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .clone()
    }

    fn send(&self, command: AudioFocusCommand) -> bool {
        let guard = self
            .command_tx
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        match guard.as_ref() {
            Some(sender) => sender.send(command).is_ok(),
            None => false,
        }
    }

    /// 发一条命令后等 worker 回传快照（命令通道 FIFO，保证看到这条命令之后的状态）。
    fn request_snapshot(&self) -> AudioFocusSnapshot {
        let (reply, receiver) = mpsc::channel::<AudioFocusSnapshot>();
        if !self.send(AudioFocusCommand::Snapshot { reply }) {
            return self.snapshot();
        }
        match receiver.recv_timeout(COMMAND_REPLY_TIMEOUT) {
            Ok(snapshot) => snapshot,
            Err(_) => {
                log::warn!("音频焦点：等待 worker 快照超时");
                self.snapshot()
            }
        }
    }

    /// 申请焦点（gain 0..1）。同一 reason 重复 acquire 由前端幂等层兜底，后端按覆盖处理。
    pub fn acquire(&self, reason: &str, gain: f32) -> AudioFocusSnapshot {
        if !self.send(AudioFocusCommand::Acquire {
            reason: reason.to_string(),
            gain,
        }) {
            log::warn!("音频焦点：worker 命令通道已关闭，忽略 acquire({reason})");
            return self.snapshot();
        }
        self.request_snapshot()
    }

    /// 释放焦点；没有 reason 时目标增益自动回到 1.0（带恢复过渡）。
    pub fn release(&self, reason: &str) -> AudioFocusSnapshot {
        if !self.send(AudioFocusCommand::Release {
            reason: reason.to_string(),
        }) {
            log::warn!("音频焦点：worker 命令通道已关闭，忽略 release({reason})");
            return self.snapshot();
        }
        self.request_snapshot()
    }

    /// 退出兜底：立即恢复所有被管理的会话。阻塞，调用方放 `spawn_blocking`。
    pub fn restore_all(&self) -> Result<(), String> {
        let (reply, receiver) = mpsc::channel::<()>();
        if !self.send(AudioFocusCommand::RestoreAll { reply }) {
            return Err("音频焦点服务未运行".to_string());
        }
        match receiver.recv_timeout(RESTORE_ALL_TIMEOUT) {
            Ok(()) => Ok(()),
            Err(RecvTimeoutError::Timeout) => {
                Err("恢复音频会话音量超时（worker 可能正忙）".to_string())
            }
            Err(RecvTimeoutError::Disconnected) => {
                Err("音频焦点服务已停止".to_string())
            }
        }
    }

    /// 手动恢复 FIFO 压制（P3c）：解除蓝牙本地静音 / 恢复本机媒体音量，并进入手动覆盖。
    ///
    /// 不恢复播放（本机媒体仍是暂停态，要用户自己点）；不断连接、不碰无线电、不操控手机端。
    /// 阻塞到 worker 回传快照，调用方放 `spawn_blocking`。
    pub fn restore_suppressed(&self) -> AudioFocusSnapshot {
        let (reply, receiver) = mpsc::channel::<AudioFocusSnapshot>();
        if !self.send(AudioFocusCommand::RestoreSuppressed { reply }) {
            log::warn!("音频焦点：worker 命令通道已关闭，无法手动恢复压制");
            return self.snapshot();
        }
        match receiver.recv_timeout(COMMAND_REPLY_TIMEOUT) {
            Ok(snapshot) => snapshot,
            Err(_) => {
                log::warn!("音频焦点：等待手动恢复结果超时");
                self.snapshot()
            }
        }
    }

    /// 设置页开关：是否启用双音源 FIFO 冲突处理（false = 不处理，只保留语音/TTS 压低）。
    pub fn set_fifo_enabled(&self, enabled: bool) -> AudioFocusSnapshot {
        let (reply, receiver) = mpsc::channel::<AudioFocusSnapshot>();
        if !self.send(AudioFocusCommand::SetFifoEnabled { enabled, reply }) {
            log::warn!("音频焦点：worker 命令通道已关闭，忽略 set_fifo_enabled({enabled})");
            return self.snapshot();
        }
        match receiver.recv_timeout(COMMAND_REPLY_TIMEOUT) {
            Ok(snapshot) => snapshot,
            Err(_) => {
                log::warn!("音频焦点：等待 FIFO 开关设置结果超时");
                self.snapshot()
            }
        }
    }

    /// 显式退出：通知 worker 恢复音量、落盘清理，然后 join。可重复调用。
    pub fn shutdown(&self) {
        self.stop.store(true, Ordering::SeqCst);
        // 唤醒可能阻塞在 recv_timeout 的 worker。它要么处理这条 RestoreAll，要么在下一拍
        // 看到 stop 直接退出；两条路径最后都会由 Worker::shutdown 兜底恢复，所以不等回包。
        let (reply, _) = mpsc::channel::<()>();
        let _ = self.send(AudioFocusCommand::RestoreAll { reply });
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

impl Drop for AudioFocusManager {
    fn drop(&mut self) {
        self.shutdown();
    }
}
