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
mod bingarchive;
mod bluetooth_audio;
mod iplocate;
mod location;
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

use tauri::Manager;
use tauri::webview::{PermissionKind, PermissionResponse};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

type CmdResult<T> = Result<T, String>;

/// 退出链路专用同步日志（append 到 `%TEMP%\wtsl-exit-trace.log`）。
///
/// `tauri-plugin-log` 的写入在进程快速退出时可能来不及落盘（实测退出日志停在
/// 「应用退出，停止蓝牙音频 worker」），这个函数每次 open/write/flush，用来还原
/// CloseRequested → shutdown → 进程退出 的时间线。
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

#[tauri::command]
fn app_exit(app: tauri::AppHandle) {
    app.exit(0);
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
// 所有 WinRT 对象都在 BtAudioManager 的后台 worker 线程里创建/调用（RoInitialize MTA 一次），
// 命令只做「投递 → 等 worker 回传快照」；snapshot 是纯内存读取，不做 WinRT 调用。
// 因此除 snapshot 外的命令都是 async + spawn_blocking（worker 可能正跑一轮连接尝试）。

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
            let bluetooth_audio = Arc::new(bluetooth_audio::BtAudioManager::start(app_data_dir));
            app.manage(bluetooth_audio);

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
            bt_audio_set_auto_connect,
            bt_audio_set_preferred,
            bt_audio_resume_auto,
            bt_audio_open_settings,
            system_status_snapshot,
            system_set_volume,
            system_set_muted,
            system_set_brightness,
            system_set_auto_brightness,
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

    // 退出路径（v0.8.1 真机回归）：
    // - 直接点窗口关闭时，Tauri 会先销毁 WebView2 / 停事件循环；若在 RunEvent::Exit 里才调
    //   `AudioPlaybackConnection.Close()`，WinRT 同步调用会卡在正在拆除的 COM 环境里
    //   （实测：进程 10s 后被系统结束，日志停在「应用退出」前一行，手机仍显示已连接）。
    // - 因此在 CloseRequested 时先拦住关闭、隐藏窗口，再在后台线程里做蓝牙清理，
    //   完成后才真正退出；Exit 回调只做兜底（注销/关机等路径）。
    app.run(|app_handle, event| match event {
        tauri::RunEvent::WindowEvent {
            label,
            event: tauri::WindowEvent::CloseRequested { api, .. },
            ..
        } => {
            exit_trace("close-requested: prevent_close + hide");
            api.prevent_close();
            if let Some(window) = app_handle.get_webview_window(&label) {
                let _ = window.hide();
            }
            let handle = app_handle.clone();
            std::thread::spawn(move || {
                shutdown_bluetooth_audio(&handle);
                handle.exit(0);
            });
            // 兜底：清理线程若被蓝牙栈卡住，也不能让「隐藏窗口 + 进程残留」挂死。
            let fallback = app_handle.clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(15));
                exit_trace("fallback: 15s 强退");
                fallback.exit(0);
                std::process::exit(0);
            });
        }
        tauri::RunEvent::Exit => {
            exit_trace("exit-event 兜底清理");
            shutdown_bluetooth_audio(app_handle);
        }
        _ => {}
    });
}

/// 蓝牙退出清理只执行一次：窗口关闭时后台线程做，Exit 回调兜底。
static BLUETOOTH_SHUTDOWN_DONE: AtomicBool = AtomicBool::new(false);

/// 收敛蓝牙音频 worker：停 watcher、关连接并等系统蓝牙链路断开、落盘配置。
/// 重复调用安全（只执行一次）。
fn shutdown_bluetooth_audio(app: &tauri::AppHandle) {
    if BLUETOOTH_SHUTDOWN_DONE.swap(true, Ordering::SeqCst) {
        return;
    }
    let started = std::time::Instant::now();
    exit_trace("shutdown-start");
    match app.try_state::<BtAudioManagerHandle>() {
        Some(manager) => {
            log::info!("应用退出，停止蓝牙音频 worker");
            manager.shutdown();
            log::info!("蓝牙音频 worker 已停止，退出清理耗时 {:?}", started.elapsed());
            exit_trace(format!("shutdown-done {:?}", started.elapsed()));
        }
        None => {
            log::warn!("应用退出时找不到蓝牙音频 managed state，跳过清理");
            exit_trace("shutdown-skip: no managed state");
        }
    }
}
