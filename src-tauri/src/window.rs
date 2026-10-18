//! 窗口能力：全屏切换、退出应用。
//!
//! 前端通过 `invoke('window_toggle_fullscreen')` / `invoke('app_exit')` 调用，
//! 真正的命令注册在 `lib.rs`。

use tauri::WebviewWindow;

pub fn set_fullscreen(window: &WebviewWindow, enabled: bool) -> Result<(), String> {
    window
        .set_fullscreen(enabled)
        .map_err(|err| format!("切换全屏失败: {err}"))
}

pub fn is_fullscreen(window: &WebviewWindow) -> Result<bool, String> {
    window
        .is_fullscreen()
        .map_err(|err| format!("读取全屏状态失败: {err}"))
}
