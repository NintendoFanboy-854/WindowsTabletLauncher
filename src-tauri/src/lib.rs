//! Windows 平板桌面启动器 —— Tauri 宿主内核。
//!
//! 这一层只提供“系统能力 + 插件目录”的薄封装，业务全在前端 `src/host`：
//! - 窗口：全屏切换、退出
//! - 开机自启（HKCU Run）
//! - 系统定位（Windows Geolocator，失败返回 null）
//! - ip.cn 网络归属地（失败返回 null，D-16）
//! - 系统空闲秒数（GetLastInputInfo）
//! - 防息屏（SetThreadExecutionState）
//! - 插件目录读写、扫描、zip 安装
//! - `wtsl://` 自定义协议：把插件目录里的静态文件喂给 iframe

mod autostart;
mod iplocate;
mod location;
mod plugins;
mod power;
mod protocol;
mod window;
mod zip;

use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

type CmdResult<T> = Result<T, String>;

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

/// 隐藏/显示主窗口，返回切换后的可见状态（全局快捷键与外壳共用）
fn toggle_visible(window: &tauri::WebviewWindow) -> CmdResult<bool> {
    let visible = window.is_visible().map_err(|err| err.to_string())?;
    if visible {
        window.hide().map_err(|err| err.to_string())?;
        Ok(false)
    } else {
        window.show().map_err(|err| err.to_string())?;
        window.set_focus().map_err(|err| err.to_string())?;
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

// ---------- 插件目录 ----------

#[tauri::command]
fn plugin_env(state: tauri::State<'_, plugins::PluginState>) -> plugins::PluginEnv {
    plugins::env(state.inner())
}

#[tauri::command]
fn plugin_list(state: tauri::State<'_, plugins::PluginState>) -> CmdResult<Vec<plugins::PluginRecord>> {
    plugins::list(state.inner())
}

#[tauri::command]
fn plugin_read_manifest(state: tauri::State<'_, plugins::PluginState>, plugin_id: String) -> CmdResult<String> {
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
fn plugin_remove(state: tauri::State<'_, plugins::PluginState>, plugin_id: String) -> CmdResult<()> {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .register_uri_scheme_protocol(protocol::SCHEME, |ctx, request| {
            protocol::handle(ctx.app_handle(), &request).map(std::borrow::Cow::Owned)
        })
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            let state = plugins::PluginState::resolve(app.handle())
                .map_err(|err| -> Box<dyn std::error::Error> {
                    Box::new(std::io::Error::other(err))
                })?;
            app.manage(state);

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
            plugin_env,
            plugin_list,
            plugin_read_manifest,
            plugin_read_text,
            plugin_write_text,
            plugin_remove,
            plugin_install_zip,
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}

