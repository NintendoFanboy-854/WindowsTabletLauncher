//! Windows 平板桌面启动器 —— Tauri 宿主内核。
//!
//! 这一层只提供“系统能力 + 插件目录”的薄封装，业务全在前端 `src/host`：
//! - 窗口：全屏切换、退出
//! - 开机自启（HKCU Run）
//! - 系统定位（Windows Geolocator，失败返回 null）
//! - ip.cn 网络归属地（失败返回 null，D-16）
//! - 系统空闲秒数（GetLastInputInfo）
//! - 防息屏（SetThreadExecutionState）
//! - 蓝牙音箱（A2DP Sink：AudioPlaybackConnection，已配对手机把音频推给本机）
//! - 插件目录读写、扫描、zip 安装
//! - `wtsl://` 自定义协议：把插件目录里的静态文件喂给 iframe

mod autostart;
mod audio_focus;
mod bingarchive;
mod bluetooth_audio;
mod browser_window;
mod iplocate;
mod location;
mod media_session;
mod micsite;
mod plugins;
mod power;
mod protocol;
mod settings_win;
mod system_status;
mod window;
mod zip;

use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use tauri::Manager;
use tauri::webview::{PermissionKind, PermissionResponse};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

type CmdResult<T> = Result<T, String>;

/// 退出链路专用同步日志（append 到 `%TEMP%\wtsl-exit-trace.log`）。
///
/// `tauri-plugin-log` 的写入在进程快速退出时可能来不及落盘，这个函数每次 open/write/flush，
/// 用来还原 CloseRequested / app_exit → coordinator（恢复音频 → 断开 A2DP）→ 进程退出的时间线。
pub(crate) fn exit_trace(message: impl AsRef<str>) {
    use std::io::Write;
    let path = std::env::temp_dir().join("wtsl-exit-trace.log");
    if let Ok(mut file) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
    {
        let millis = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|duration| duration.as_millis())
            .unwrap_or(0);
        let _ = writeln!(file, "{millis} {}", message.as_ref());
        let _ = file.flush();
    }
}

// ---------- 窗口 ----------

#[tauri::command]
fn window_set_fullscreen(window: tauri::WebviewWindow, enabled: bool) -> CmdResult<()> {
    window::set_fullscreen(&window, enabled)
}

#[tauri::command]
fn window_toggle_fullscreen(window: tauri::WebviewWindow) -> CmdResult<bool> {
    let next = !window::is_fullscreen(&window)?;
    window::set_fullscreen(&window, next)?;
    Ok(next)
}

#[tauri::command]
fn window_is_fullscreen(window: tauri::WebviewWindow) -> CmdResult<bool> {
    window::is_fullscreen(&window)
}

/// 统一退出入口（Ctrl+Q / 设置页退出按钮）。语义已改为 P2 的退出 coordinator，
/// 命令本身立即返回；真正的清理与 `process::exit` 在后台线程完成。
#[tauri::command]
fn app_exit(app: tauri::AppHandle) {
    begin_exit(&app);
}

/// 隐藏/显示主窗口，返回切换后的可见状态（全局快捷键与外壳共用）。
///
/// 隐藏 ≠ 退出：只隐藏窗口，蓝牙音频 worker 与 A2DP 连接保持不变（用户要后台继续接收音频）。
fn toggle_visible(window: &tauri::WebviewWindow) -> CmdResult<bool> {
    let visible = window.is_visible().map_err(|err| err.to_string())?;
    if visible {
        window.hide().map_err(|err| err.to_string())?;
        log::info!("主窗口已隐藏（应用与蓝牙音频连接保持运行）");
        Ok(false)
    } else {
        window.show().map_err(|err| err.to_string())?;
        window.set_focus().map_err(|err| err.to_string())?;
        log::info!("主窗口已显示");
        Ok(true)
    }
}

#[tauri::command]
fn window_toggle_visible(window: tauri::WebviewWindow) -> CmdResult<bool> {
    toggle_visible(&window)
}

// ---------- 开机自启 ----------

#[tauri::command]
fn autostart_is_enabled() -> CmdResult<bool> {
    autostart::is_enabled()
}

#[tauri::command]
fn autostart_set_enabled(enabled: bool) -> CmdResult<bool> {
    autostart::set_enabled(enabled)?;
    Ok(enabled)
}

// ---------- 系统状态 ----------

#[tauri::command]
fn get_idle_seconds() -> CmdResult<u64> {
    power::idle_seconds()
}

#[tauri::command]
async fn set_keep_awake(app: tauri::AppHandle, on: bool) -> CmdResult<()> {
    // SetThreadExecutionState 是线程级的，必须落回主线程；主线程活到应用退出。
    let (sender, receiver) = std::sync::mpsc::channel();
    app.run_on_main_thread(move || {
        let _ = sender.send(power::set_keep_awake(on));
    })
    .map_err(|err| format!("派发主线程任务失败: {err}"))?;
    receiver
        .recv()
        .map_err(|err| format!("主线程没有返回防息屏结果: {err}"))?
}

#[tauri::command]
async fn get_location() -> CmdResult<Option<location::GeoLocation>> {
    tauri::async_runtime::spawn_blocking(location::locate)
        .await
        .map_err(|err| format!("定位任务失败: {err}"))
}

/// ip.cn 网络归属地（D-16）：失败已经在 `iplocate` 里记日志，命令层返回 null，
/// 不把网络错误抛给插件（插件契约就是“拿不到返回 null”）。
#[tauri::command]
async fn ip_locate() -> CmdResult<Option<iplocate::IpLocation>> {
    Ok(iplocate::locate().await)
}

// ---------- 麦克风权限 ----------

/// 把 WebView2「站点权限」里的本站麦克风写成 Allow。
///
/// 0.4.4 起这条权限被 WebView2 自己按 origin 持久化成了 Block（宿主没应答 `PermissionRequested`
/// 时 WebView2 按拒绝落盘），落盘之后 `on_permission_request` 根本不会被问到：
/// `permissions.query` 直接 denied、`getUserMedia` 直接 `NotAllowedError`。
/// 前端在启动时与每次探测前都会调用一次（幂等），用户升级后不需要手动清 profile。
#[tauri::command]
async fn ensure_mic_permission(window: tauri::WebviewWindow) -> CmdResult<()> {
    micsite::allow_microphone(&window).await
}

/// 打开 Windows「隐私和安全性 → 麦克风」设置页，并把它切到前台。
///
/// 系统层的麦克风开关被关掉后，应用内**无法**再唤起系统提示（WebView2 也不会二次弹窗），
/// 只能把用户导过去。`ms-settings:` 是 Windows 设置协议的固定入口，未打包的 Win32 应用同样有效；
/// 用 `cmd /C start` 是因为它走 shell 关联，不需要额外引入 `tauri-plugin-opener`。
///
/// 光把进程拉起来不够：设置页的窗口会被全屏的启动器压在下面（0.4.6 实测），
/// 所以 `settings_win::open` 还负责前台交接与复核。
#[tauri::command]
async fn open_mic_privacy_settings() -> CmdResult<()> {
    tauri::async_runtime::spawn_blocking(|| {
        #[cfg(target_os = "windows")]
        {
            settings_win::open("ms-settings:privacy-microphone")
        }
        #[cfg(not(target_os = "windows"))]
        {
            Err("只有 Windows 才有系统级麦克风开关".to_string())
        }
    })
    .await
    .map_err(|err| format!("打开 Windows 设置任务失败: {err}"))?
}

// ---------- 插件目录 ----------

#[tauri::command]
fn plugin_env(state: tauri::State<'_, plugins::PluginState>) -> plugins::PluginEnv {
    plugins::env(state.inner())
}

#[tauri::command]
fn plugin_list(
    state: tauri::State<'_, plugins::PluginState>,
) -> CmdResult<Vec<plugins::PluginRecord>> {
    plugins::list(state.inner())
}

#[tauri::command]
fn plugin_read_manifest(
    state: tauri::State<'_, plugins::PluginState>,
    plugin_id: String,
) -> CmdResult<String> {
    plugins::read_manifest(state.inner(), &plugin_id)
}

#[tauri::command]
fn plugin_read_text(
    state: tauri::State<'_, plugins::PluginState>,
    plugin_id: String,
    rel_path: String,
) -> CmdResult<String> {
    plugins::read_text(state.inner(), &plugin_id, &rel_path)
}

#[tauri::command]
fn plugin_write_text(
    state: tauri::State<'_, plugins::PluginState>,
    plugin_id: String,
    rel_path: String,
    contents: String,
) -> CmdResult<()> {
    plugins::write_text(state.inner(), &plugin_id, &rel_path, &contents)
}

#[tauri::command]
fn plugin_remove(
    state: tauri::State<'_, plugins::PluginState>,
    plugin_id: String,
) -> CmdResult<()> {
    plugins::remove(state.inner(), &plugin_id)
}

#[tauri::command]
async fn plugin_install_zip(
    state: tauri::State<'_, plugins::PluginState>,
    zip_path: String,
) -> CmdResult<plugins::PluginRecord> {
    let root = state.root.clone();
    tauri::async_runtime::spawn_blocking(move || plugins::install_zip(&root, &zip_path))
        .await
        .map_err(|err| format!("安装 zip 任务失败: {err}"))?
}

// ---------- 蓝牙音箱（A2DP Sink） ----------
//
// 所有 WinRT 对象都在 BtAudioManager 的后台 worker 线程里创建/调用（RoInitialize MTA 一次）。
// snapshot 是纯内存读取；P2 起 connect/disconnect/set_enabled/set_bluetooth 是非阻塞的
// （manager 先把 operation 写进快照再入队），refresh 仍是阻塞的显式重扫。

type BtAudioManagerHandle = Arc<bluetooth_audio::BtAudioManager>;

#[tauri::command]
fn bt_audio_snapshot(
    manager: tauri::State<'_, BtAudioManagerHandle>,
) -> bluetooth_audio::BtAudioSnapshot {
    manager.snapshot()
}

#[tauri::command]
async fn bt_audio_refresh(
    manager: tauri::State<'_, BtAudioManagerHandle>,
) -> CmdResult<bluetooth_audio::BtAudioSnapshot> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || manager.refresh())
        .await
        .map_err(|err| format!("刷新蓝牙设备失败: {err}"))
}

#[tauri::command]
async fn bt_audio_connect(
    manager: tauri::State<'_, BtAudioManagerHandle>,
    device_id: String,
) -> CmdResult<bluetooth_audio::BtAudioSnapshot> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || manager.connect(&device_id))
        .await
        .map_err(|err| format!("连接蓝牙音箱失败: {err}"))
}

#[tauri::command]
async fn bt_audio_disconnect(
    manager: tauri::State<'_, BtAudioManagerHandle>,
) -> CmdResult<bluetooth_audio::BtAudioSnapshot> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || manager.disconnect())
        .await
        .map_err(|err| format!("断开蓝牙音箱失败: {err}"))
}

#[tauri::command]
async fn bt_audio_set_bluetooth(
    manager: tauri::State<'_, BtAudioManagerHandle>,
    on: bool,
) -> CmdResult<bluetooth_audio::BtAudioSnapshot> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || manager.set_bluetooth(on))
        .await
        .map_err(|err| format!("切换蓝牙失败: {err}"))
}

/// 蓝牙音箱总开关：开 = 开蓝牙 + 恢复寻找；关 = 断开 + 停止寻找（一动作联动）。
#[tauri::command]
async fn bt_audio_set_enabled(
    manager: tauri::State<'_, BtAudioManagerHandle>,
    enabled: bool,
) -> CmdResult<bluetooth_audio::BtAudioSnapshot> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || manager.set_enabled(enabled))
        .await
        .map_err(|err| format!("切换蓝牙音箱失败: {err}"))
}

/// 自动连接开关（持久化到 app_data_dir/bt-audio.json）。
#[tauri::command]
async fn bt_audio_set_auto_connect(
    manager: tauri::State<'_, BtAudioManagerHandle>,
    enabled: bool,
) -> CmdResult<bluetooth_audio::BtAudioSnapshot> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || manager.set_auto_connect(enabled))
        .await
        .map_err(|err| format!("设置蓝牙自动连接失败: {err}"))
}

/// 首选设备（唯一 star）；传 null 清空。
#[tauri::command]
async fn bt_audio_set_preferred(
    manager: tauri::State<'_, BtAudioManagerHandle>,
    device_id: Option<String>,
) -> CmdResult<bluetooth_audio::BtAudioSnapshot> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || manager.set_preferred(device_id))
        .await
        .map_err(|err| format!("设置蓝牙首选设备失败: {err}"))
}

/// 解除手动断开造成的 paused，恢复自动寻找。
#[tauri::command]
async fn bt_audio_resume_auto(
    manager: tauri::State<'_, BtAudioManagerHandle>,
) -> CmdResult<bluetooth_audio::BtAudioSnapshot> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || manager.resume_auto())
        .await
        .map_err(|err| format!("恢复蓝牙自动连接失败: {err}"))
}

/// 打开 Windows 蓝牙设置（配对/开关的系统兜底入口）。沿用麦克风设置页的前台交接逻辑。
#[tauri::command]
async fn bt_audio_open_settings() -> CmdResult<()> {
    tauri::async_runtime::spawn_blocking(|| settings_win::open("ms-settings:bluetooth"))
        .await
        .map_err(|err| format!("打开蓝牙设置任务失败: {err}"))?
}

/// 桌面底部状态栏 / 快速设置面板：电量 / 充电 / 主音量 / 亮度 / 自动亮度（只读快照）。
#[tauri::command]
async fn system_status_snapshot() -> CmdResult<system_status::SystemStatus> {
    tauri::async_runtime::spawn_blocking(system_status::snapshot)
        .await
        .map_err(|err| format!("读取系统状态失败: {err}"))
}

/// 设置主音量（0–100，CoreAudio）。
#[tauri::command]
async fn system_set_volume(percent: u8) -> CmdResult<()> {
    tauri::async_runtime::spawn_blocking(move || system_status::set_volume(percent))
        .await
        .map_err(|err| format!("设置音量任务失败: {err}"))?
}

/// 设置静音（CoreAudio）。
#[tauri::command]
async fn system_set_muted(muted: bool) -> CmdResult<()> {
    tauri::async_runtime::spawn_blocking(move || system_status::set_muted(muted))
        .await
        .map_err(|err| format!("设置静音任务失败: {err}"))?
}

/// 设置屏幕亮度（0–100，WMI WmiSetBrightness）；无内置屏/不可写时返回 Err。
#[tauri::command]
async fn system_set_brightness(percent: u8) -> CmdResult<()> {
    tauri::async_runtime::spawn_blocking(move || system_status::set_brightness(percent))
        .await
        .map_err(|err| format!("设置亮度任务失败: {err}"))?
}

/// 设置系统「自适应亮度」开关；写不进去（策略/权限）时返回 Err。
#[tauri::command]
async fn system_set_auto_brightness(enabled: bool) -> CmdResult<()> {
    tauri::async_runtime::spawn_blocking(move || system_status::set_auto_brightness(enabled))
        .await
        .map_err(|err| format!("设置自动亮度任务失败: {err}"))?
}

// ---------- 音频焦点（录音 / TTS 压低其他应用的会话） ----------
//
// 与蓝牙一样：所有 CoreAudio COM 对象都在 AudioFocusManager 的 worker 线程里创建/调用
// （RoInitialize MTA 一次），命令只做「投递 → 等 worker 回传快照」；snapshot 是纯内存读取。
// acquire/release 返回快照但不抛错（音频焦点失败不能影响录音/朗读），restore_all 供退出兜底。

type AudioFocusManagerHandle = Arc<audio_focus::AudioFocusManager>;

#[tauri::command]
fn audio_focus_snapshot(
    manager: tauri::State<'_, AudioFocusManagerHandle>,
) -> audio_focus::AudioFocusSnapshot {
    manager.snapshot()
}

// 注意：Tauri 的 async 命令带 `State` 这类引用入参时必须返回 `Result`（`AsyncCommandMustReturnResult`），
// 所以这里统一返回 `CmdResult<Snapshot>`；失败分支仍然返回 Ok(当前快照)，不把错误抛给录音/朗读主流程。

#[tauri::command]
async fn audio_focus_acquire(
    manager: tauri::State<'_, AudioFocusManagerHandle>,
    reason: String,
    gain: u8,
) -> CmdResult<audio_focus::AudioFocusSnapshot> {
    let worker = Arc::clone(manager.inner());
    let fallback = Arc::clone(manager.inner());
    Ok(match tauri::async_runtime::spawn_blocking(move || {
        worker.acquire(&reason, f32::from(gain) / 100.0)
    })
    .await
    {
        Ok(snapshot) => snapshot,
        Err(err) => {
            log::warn!("音频焦点 acquire 任务失败（不影响录音）: {err}");
            fallback.snapshot()
        }
    })
}

#[tauri::command]
async fn audio_focus_release(
    manager: tauri::State<'_, AudioFocusManagerHandle>,
    reason: String,
) -> CmdResult<audio_focus::AudioFocusSnapshot> {
    let worker = Arc::clone(manager.inner());
    let fallback = Arc::clone(manager.inner());
    Ok(
        match tauri::async_runtime::spawn_blocking(move || worker.release(&reason)).await {
            Ok(snapshot) => snapshot,
            Err(err) => {
                log::warn!("音频焦点 release 任务失败（不影响主流程）: {err}");
                fallback.snapshot()
            }
        },
    )
}

/// 退出兜底：立即恢复所有被压低的会话音量（P2 的退出 coordinator 会接进退出路径）。
#[tauri::command]
async fn audio_focus_restore_all(
    manager: tauri::State<'_, AudioFocusManagerHandle>,
) -> CmdResult<()> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || manager.restore_all())
        .await
        .map_err(|err| format!("恢复音频会话音量任务失败: {err}"))?
}

/// 设置页开关：启用/关闭双音源 FIFO 冲突处理（关闭 = 不处理，仍保留语音/TTS 压低）。
#[tauri::command]
async fn audio_focus_set_fifo(
    manager: tauri::State<'_, AudioFocusManagerHandle>,
    enabled: bool,
) -> CmdResult<audio_focus::AudioFocusSnapshot> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || manager.set_fifo_enabled(enabled))
        .await
        .map_err(|err| format!("设置音频冲突处理失败: {err}"))
}

/// FIFO 手动恢复（P3c）：解除因双音源冲突造成的压制，并进入手动覆盖。
///
/// 只作用于平板本地输出：蓝牙音乐 = 解除本地静音（连接与手机推流原样保留）；
/// 本机媒体 = 恢复会话音量（仍是暂停态，播放要用户自己点）。不自动播放、不操控手机端。
#[tauri::command]
async fn audio_focus_restore_suppressed(
    manager: tauri::State<'_, AudioFocusManagerHandle>,
) -> CmdResult<audio_focus::AudioFocusSnapshot> {
    let worker = Arc::clone(manager.inner());
    let fallback = Arc::clone(manager.inner());
    Ok(
        match tauri::async_runtime::spawn_blocking(move || worker.restore_suppressed()).await {
            Ok(snapshot) => snapshot,
            Err(err) => {
                log::warn!("音频焦点手动恢复任务失败: {err}");
                fallback.snapshot()
            }
        },
    )
}

// ---------- 受管浏览器窗口（P3a，通用能力） ----------
//
// 插件只给一个 https URL，宿主拉起 Edge 的 app 窗口并管生命周期（进程 + 窗口句柄）。
// 宿主不认识任何插件、不内置业务 URL；三条命令都是同步短操作（拉起进程 / 枚举窗口），
// 进程退出由 browser_window 内部的监控线程清理，不会让命令看到僵尸。

type BrowserWindowManagerHandle = Arc<browser_window::BrowserWindowManager>;

/// 打开受管窗口；已在运行则 show/restore 并返回当前状态。非 https 返回 Err。
#[tauri::command]
fn browser_window_open(
    manager: tauri::State<'_, BrowserWindowManagerHandle>,
    url: String,
) -> CmdResult<browser_window::BrowserWindowState> {
    manager.open(&url)
}

/// 窗口控制：show / hide / minimize / close；非法动作返回 Err。
#[tauri::command]
fn browser_window_control(
    manager: tauri::State<'_, BrowserWindowManagerHandle>,
    action: String,
) -> CmdResult<browser_window::BrowserWindowState> {
    manager.control(&action)
}

/// 当前受管窗口状态（进程已退出则 running=false）。
#[tauri::command]
fn browser_window_state(
    manager: tauri::State<'_, BrowserWindowManagerHandle>,
) -> browser_window::BrowserWindowState {
    manager.state()
}

/// 受管窗口的调试目标（`/json/list` 原样透传，宿主不判断类型/URL/标题）。
///
/// 通用能力：任何调用方都可以用它挑自己的 target；宿主不认识业务，也不替调用方连
/// WebSocket。窗口未运行、调试端口没起来或 HTTP 失败都返回 Err（中文一句事实），
/// 由调用方决定怎么降级。
#[tauri::command]
async fn browser_window_debug_targets(
    manager: tauri::State<'_, BrowserWindowManagerHandle>,
) -> CmdResult<browser_window::BrowserDebugTargets> {
    let worker = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || worker.debug_targets())
        .await
        .map_err(|err| format!("读取浏览器调试目标失败: {err}"))?
}

// ---------- SMTC 媒体会话（P3a，通用能力） ----------
//
// 与蓝牙/音频焦点一样：所有 WinRT 对象都在 MediaSessionManager 的 worker 线程里创建/调用
// （RoInitialize MTA 一次），命令只投递请求等回包；每次 list 重新枚举会话，不缓存会话对象。
// 会话选择不在宿主（宿主不认 appId），由调用方自己按 appId/最近更新挑。

type MediaSessionManagerHandle = Arc<media_session::MediaSessionManager>;

/// 会话列表；失败返回空列表（不抛错）。
#[tauri::command]
async fn media_session_list(
    manager: tauri::State<'_, MediaSessionManagerHandle>,
) -> CmdResult<media_session::MediaSessionSnapshot> {
    let worker = Arc::clone(manager.inner());
    let fallback = Arc::clone(manager.inner());
    Ok(
        match tauri::async_runtime::spawn_blocking(move || worker.list()).await {
            Ok(snapshot) => snapshot,
            Err(err) => {
                log::warn!("读取媒体会话列表任务失败: {err}");
                fallback.snapshot()
            }
        },
    )
}

/// 按会话 id 发传输命令（play/pause/toggle/next/previous），返回重新枚举后的快照。
#[tauri::command]
async fn media_session_command(
    manager: tauri::State<'_, MediaSessionManagerHandle>,
    session_id: String,
    command: String,
) -> CmdResult<media_session::MediaSessionSnapshot> {
    let worker = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || worker.command(&session_id, &command))
        .await
        .map_err(|err| format!("媒体会话命令任务失败: {err}"))?
}

/// 按会话 id 取封面 data URL（`data:<mime>;base64,...`）；拿不到返回空串。
#[tauri::command]
async fn media_session_artwork(
    manager: tauri::State<'_, MediaSessionManagerHandle>,
    session_id: String,
) -> CmdResult<String> {
    let worker = Arc::clone(manager.inner());
    Ok(
        match tauri::async_runtime::spawn_blocking(move || worker.artwork(&session_id)).await {
            Ok(data) => data,
            Err(err) => {
                log::warn!("读取媒体封面任务失败: {err}");
                String::new()
            }
        },
    )
}

/// 媒体键兜底（SendInput 发全局媒体键）；非法命令返回 Err。
#[tauri::command]
fn media_key(command: String) -> CmdResult<()> {
    media_session::send_media_key(&command)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        // WebView2 没有内建授权 UI：媒体权限请求落到 `COREWEBVIEW2_PERMISSION_STATE_DEFAULT`
        // 就等同于「无人应答 → 拒绝」，0.4.4 的 `Permission denied` 就是这么来的。
        // 这里只放行麦克风：应用内同意由 `MicPermissionCard` 负责（先解释再开麦），
        // 其余权限（相机/定位/通知/剪贴板…）保持平台默认，不替用户做决定。
        //
        // 注意：这个回调**只在没有持久化决定时**才会被问到。0.4.4 已经把一次拒绝写进了
        // profile（`media_stream_mic` = Block），所以真正的修复在 `ensure_mic_permission`
        // 命令里（用 SetPermissionState 覆盖那份旧记录）；这一层保留为「全新 profile」的兜底。
        .on_permission_request(|_webview, kind| {
            let response = match kind {
                PermissionKind::Microphone => PermissionResponse::Allow,
                _ => PermissionResponse::Default,
            };
            // 排障入口：站点权限层每次真的问过来都会留一行（0.4.4 就是在这里静默变成 Deny 的）
            log::info!("WebView2 权限请求 {kind} -> {response}");
            response
        })
        .register_uri_scheme_protocol(protocol::SCHEME, |ctx, request| {
            protocol::handle(ctx.app_handle(), &request).map(std::borrow::Cow::Owned)
        })
        .setup(|app| {
            // 日志：debug/release 都装（release 默认写 OS 日志目录 + stdout）。
            // 安装版没有控制台，蓝牙退出链路这类偶发问题只能靠日志文件回溯。
            app.handle().plugin(
                tauri_plugin_log::Builder::default()
                    .level(log::LevelFilter::Info)
                    .build(),
            )?;
            let state = plugins::PluginState::resolve(app.handle()).map_err(
                |err| -> Box<dyn std::error::Error> { Box::new(std::io::Error::other(err)) },
            )?;
            app.manage(state);
            // 蓝牙音箱：worker 线程持有全部 WinRT 对象，managed state 只放只读快照 +
            // 命令通道 + stop flag + JoinHandle。worker 启动时会自己完成一次预热
            // （启动设备 watcher + 无线电状态枚举；设备列表由 watcher 事件补齐），
            // 前端首帧后拿 snapshot 就是真实状态。
            let app_data_dir = app.path().app_data_dir().ok();
            let bluetooth_audio = Arc::new(bluetooth_audio::BtAudioManager::start(
                app_data_dir.clone(),
            ));
            app.manage(Arc::clone(&bluetooth_audio));
            // 受管浏览器窗口（P3a 通用能力）：插件给 https URL，宿主拉 Edge app 窗口并管进程。
            // 独立 profile 放在 app_data_dir/browser-window-profile；拿不到 app_data_dir 时
            // 退回临时目录（只是 profile 不持久）。退出时由 `begin_exit` 结束进程。
            let browser_window =
                Arc::new(browser_window::BrowserWindowManager::start(app_data_dir.clone()));
            app.manage(browser_window);
            // SMTC 媒体会话（P3a 通用能力）：独立 worker 线程（MTA），命令只走通道 + 只读快照。
            // 宿主只列会话、不认 appId；会话选择是调用方（未来插件）的事。
            let media_session = Arc::new(media_session::MediaSessionManager::start());
            app.manage(Arc::clone(&media_session));
            // 音频焦点：同样是自己起 worker 线程并各自 RoInitialize(MTA)，与蓝牙 worker 互不依赖。
            // app_data_dir 用于崩溃保护 journal（拿不到只是失去残留恢复能力）。
            // P3c：注入蓝牙与 SMTC 的 manager（只读快照 + 命令通道），在同一个 worker 里做
            // 双音源 FIFO 仲裁；不引入新线程，也不改变两个 manager 的职责。
            // 退出由 `begin_exit` 调 `restore_all`；强杀仍由 journal 兜底。
            let audio_focus = Arc::new(audio_focus::AudioFocusManager::start(
                app_data_dir,
                Some(Arc::clone(&bluetooth_audio)),
                Some(Arc::clone(&media_session)),
            ));
            app.manage(audio_focus);

            // 全局快捷键：Ctrl+Shift+H 隐藏/显示主窗口（隐藏后也能恢复）
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyH);
            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(|app, _shortcut, event| {
                        if event.state() == ShortcutState::Pressed {
                            if let Some(win) = app.get_webview_window("main") {
                                let _ = toggle_visible(&win);
                            }
                        }
                    })
                    .build(),
            )?;
            app.global_shortcut().register(shortcut)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            window_set_fullscreen,
            window_toggle_fullscreen,
            window_is_fullscreen,
            window_toggle_visible,
            app_exit,
            autostart_is_enabled,
            autostart_set_enabled,
            get_idle_seconds,
            set_keep_awake,
            get_location,
            ip_locate,
            bingarchive::fetch_bing_archive,
            ensure_mic_permission,
            open_mic_privacy_settings,
            bt_audio_snapshot,
            bt_audio_refresh,
            bt_audio_connect,
            bt_audio_disconnect,
            bt_audio_set_bluetooth,
            bt_audio_set_enabled,
            bt_audio_set_auto_connect,
            bt_audio_set_preferred,
            bt_audio_resume_auto,
            bt_audio_open_settings,
            system_status_snapshot,
            system_set_volume,
            system_set_muted,
            system_set_brightness,
            system_set_auto_brightness,
            audio_focus_snapshot,
            audio_focus_acquire,
            audio_focus_release,
            audio_focus_restore_all,
            audio_focus_set_fifo,
            audio_focus_restore_suppressed,
            browser_window_open,
            browser_window_control,
            browser_window_state,
            browser_window_debug_targets,
            media_session_list,
            media_session_command,
            media_session_artwork,
            media_key,
            plugin_env,
            plugin_list,
            plugin_read_manifest,
            plugin_read_text,
            plugin_write_text,
            plugin_remove,
            plugin_install_zip,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    // 退出路径（P2，D-51）：所有入口都走 `begin_exit`。
    // - 直接点窗口关闭：Tauri 会先销毁 WebView2 / 停事件循环，若此时才调
    //   `AudioPlaybackConnection.Close()`，WinRT 同步调用会卡在正在拆除的 COM 环境里
    //   （v0.8.1 实测：进程 10s 后被系统结束，手机仍显示已连接）。所以 CloseRequested
    //   先 prevent_close + hide，再在后台线程里清理，最后 `process::exit`。
    // - 不碰蓝牙无线电：蓝牙键盘/鼠标不掉线；只释放 A2DP Sink 连接。
    app.run(|app_handle, event| {
        if let tauri::RunEvent::WindowEvent {
            event: tauri::WindowEvent::CloseRequested { api, .. },
            ..
        } = event
        {
            exit_trace("close-requested: prevent_close");
            api.prevent_close();
            begin_exit(app_handle);
        }
    });
}

// ---------- 退出 coordinator（P2，D-51） ----------

/// 退出只执行一次：窗口关闭 / `app_exit`（Ctrl+Q / 设置页）都汇聚到这里。
static EXITING: AtomicBool = AtomicBool::new(false);

/// 等蓝牙 worker 关闭 A2DP Sink 连接的上限（Close 是同步释放，worker 忙时也最多等这么久）。
const EXIT_BT_CLOSE_TIMEOUT: Duration = Duration::from_secs(5);
/// 内部兜底：某一步卡死时也能退进程。只防挂死，不是性能验收目标（P2 明确不设耗时指标）。
const EXIT_FALLBACK_TIMEOUT: Duration = Duration::from_secs(10);

/// 统一退出：先隐藏窗口（体感即时关闭），再在后台依次
/// 恢复音频会话 → 断开 A2DP Sink 连接 → 结束受管浏览器窗口 → `process::exit(0)`。
///
/// 所有清理都发生在 WebView2 拆除之前（hide 之后、进程退出之前），避免在拆除中的 COM 环境里
/// 调 WinRT。音频焦点 `restore_all` 自己最多等 3s，蓝牙 `close_for_exit` 最多等 2s，
/// 受管浏览器窗口不等待（尽力结束进程）；内部兜底 6s 只用来防止某一步永久卡住。
fn begin_exit(app: &tauri::AppHandle) {
    if EXITING.swap(true, Ordering::SeqCst) {
        return;
    }
    exit_trace("begin-exit: hide-window");
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
    let handle = app.clone();
    std::thread::spawn(move || {
        exit_trace("exit-step: audio-focus-restore-all");
        match handle.try_state::<AudioFocusManagerHandle>() {
            Some(manager) => match manager.restore_all() {
                Ok(()) => exit_trace("exit-step: audio-focus-restore-all done"),
                Err(error) => {
                    exit_trace(format!("exit-step: audio-focus-restore-all failed: {error}"))
                }
            },
            None => exit_trace("exit-step: audio-focus state missing"),
        }
        exit_trace("exit-step: bt-close-for-exit");
        match handle.try_state::<BtAudioManagerHandle>() {
            Some(manager) => {
                let closed = manager.close_for_exit(EXIT_BT_CLOSE_TIMEOUT);
                exit_trace(format!("exit-step: bt-close-for-exit done={closed}"));
            }
            None => exit_trace("exit-step: bt-audio state missing"),
        }
        // 受管浏览器窗口（P3a）：尽力结束 Edge 子进程（WM_CLOSE → taskkill /T /F），
        // 不等待、不阻塞退出，失败只记日志（close_for_exit 内部吞掉错误）。
        exit_trace("exit-step: browser-window-close-for-exit");
        if let Some(manager) = handle.try_state::<BrowserWindowManagerHandle>() {
            manager.close_for_exit();
            exit_trace("exit-step: browser-window-close-for-exit done");
        } else {
            exit_trace("exit-step: browser-window state missing");
        }
        exit_trace("exit-step: process-exit");
        std::process::exit(0);
    });
    // 内部兜底线程：不参与功能验收，只保证「窗口已隐藏但进程残留」不会挂死。
    std::thread::spawn(move || {
        std::thread::sleep(EXIT_FALLBACK_TIMEOUT);
        exit_trace("exit-fallback: 强制退出");
        std::process::exit(0);
    });
}
