//! 系统空闲时间与防息屏。
//!
//! - `GetLastInputInfo` 是系统级“最后一次键鼠输入”的时间，按毫秒计。
//! - `SetThreadExecutionState` 是**线程级**状态，所以调用方必须保证落在主线程上
//!   （见 `lib.rs` 的 `set_keep_awake` 命令）；主线程活到应用退出，状态才持续有效。

use windows::Win32::System::Power::{
    SetThreadExecutionState, ES_CONTINUOUS, ES_DISPLAY_REQUIRED, ES_SYSTEM_REQUIRED,
};
use windows::Win32::System::SystemInformation::GetTickCount;
use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};

/// 距最后一次键鼠输入的秒数（向下取整）。
pub fn idle_seconds() -> Result<u64, String> {
    let mut info = LASTINPUTINFO {
        cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
        dwTime: 0,
    };
    // SAFETY: 传入的是本函数栈上有效的 LASTINPUTINFO 指针。
    let ok = unsafe { GetLastInputInfo(&mut info) };
    if !ok.as_bool() {
        return Err(format!(
            "GetLastInputInfo 失败: {}",
            std::io::Error::last_os_error()
        ));
    }
    // SAFETY: 无参数，直接返回系统 tick。
    let now = unsafe { GetTickCount() };
    // tick 是 32 位、约 49.7 天回绕一次；wrapping_sub 处理回绕。
    let idle_ms = now.wrapping_sub(info.dwTime);
    Ok(u64::from(idle_ms / 1000))
}

/// 开/关防息屏（同时保留屏幕与系统唤醒）。
pub fn set_keep_awake(on: bool) -> Result<(), String> {
    let flags = if on {
        ES_CONTINUOUS | ES_DISPLAY_REQUIRED | ES_SYSTEM_REQUIRED
    } else {
        ES_CONTINUOUS
    };
    // SAFETY: 纯 Win32 调用，参数是合法 flags。
    let previous = unsafe { SetThreadExecutionState(flags) };
    if previous.0 == 0 {
        return Err(format!(
            "SetThreadExecutionState 失败: {}",
            std::io::Error::last_os_error()
        ));
    }
    Ok(())
}
