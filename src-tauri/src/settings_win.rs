//! 「打开 Windows 麦克风设置」＝把设置页拉起来，再把它真的送到用户眼前。
//!
//! 0.4.6 实测症状：`cmd /C start "" ms-settings:privacy-microphone` 确实拉起了
//! `SystemSettings.exe`（宿主是 `ApplicationFrameHost.exe`，标题「设置」），但无边框全屏的
//! 主窗口仍占着前台，设置页落在后面 —— 用户看到的是「点了没反应」。
//!
//! 所以拉起之后必须自己做前台交接：`ShowWindow(SW_RESTORE)` → `SetForegroundWindow` →
//! `BringWindowToTop`，再用 `GetForegroundWindow` 复核。顺序是实测出来的：不先 SW_RESTORE
//! 直接 SetForegroundWindow 会被系统忽略，窗口依旧停在后面；简单的 SetForegroundWindow 也可能
//! 在窗口还在初始化时「返回成功但没真的激活」，所以要循环重试到超时。
//!
//! 认窗口只靠「可见 + 进程名」，不靠标题文案：标题是本地化字符串，做判据会在非中文系统上失效。
//! 新窗口优先（拉起前后各拍一次快照做差集），差集为空时才回落到已有窗口 —— 用户重复点按钮时
//! 设置页往往已经开着，系统只会把它重新激活，不会再建窗口。

use std::collections::HashSet;
use std::time::{Duration, Instant};

use windows::Win32::Foundation::{CloseHandle, HWND, LPARAM};
use windows::Win32::System::Threading::{
    AttachThreadInput, GetCurrentThreadId, OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_WIN32,
    PROCESS_QUERY_LIMITED_INFORMATION,
};
use windows::Win32::UI::WindowsAndMessaging::{
    AllowSetForegroundWindow, BringWindowToTop, EnumWindows, GetAncestor, GetForegroundWindow,
    GetWindowThreadProcessId, IsWindowVisible, SetForegroundWindow, ShowWindow, ASFW_ANY, GA_ROOT,
    SW_RESTORE,
};
use windows::core::{BOOL, PWSTR};

/// 设置页从进程起来到窗口出现，实测 0.5–2s；给 8s 兜住冷启动（反病毒/预热）
const WAIT_TIMEOUT: Duration = Duration::from_secs(8);
/// 没有新窗口时，等这么久就回落到「已有设置窗口」重新激活
/// （实测冷启动建窗口 ≈0.5–0.9s；用户重复点按钮时设置页已经开着，2.5s 的等待会显得像没反应）
const REUSE_AFTER: Duration = Duration::from_millis(700);
const POLL_INTERVAL: Duration = Duration::from_millis(150);
/// 交给系统的前台切换有延迟，复核前先让出一个调度片
const VERIFY_DELAY: Duration = Duration::from_millis(120);

/// 拉起设置页并把它切到前台。
///
/// 返回 `Ok` 的条件是「设置窗口确实存在」。存在但前台复核始终没通过时也返回 `Ok` 并记日志：
/// 窗口已经在桌面上（可能在别的虚拟桌面/显示器），把它当失败只会让用户看到一句没有意义的报错。
pub fn open(uri: &str) -> Result<(), String> {
    let before = visible_settings_windows();
    // 允许设置页自己抢前台；ASFW_ANY 只对当前前台进程有效，失败了还有下面的显式交接兜底
    // SAFETY: 纯 Win32 调用，参数是固定常量。
    let _ = unsafe { AllowSetForegroundWindow(ASFW_ANY) };
    spawn_uri(uri)?;

    let started = Instant::now();
    let deadline = started + WAIT_TIMEOUT;
    loop {
        let current = visible_settings_windows();
        let fresh: Vec<isize> = current
            .iter()
            .copied()
            .filter(|key| !before.contains(key))
            .collect();
        let targets: Vec<isize> = if !fresh.is_empty() {
            fresh
        } else if started.elapsed() >= REUSE_AFTER {
            current.iter().copied().collect()
        } else {
            Vec::new()
        };
        for key in targets {
            let hwnd = HWND(key as *mut std::ffi::c_void);
            // SAFETY: key 来自刚刚的 EnumWindows 枚举，在本进程内可达。
            if unsafe { raise(hwnd) } {
                return Ok(());
            }
        }
        if Instant::now() >= deadline {
            if current.is_empty() {
                return Err(format!(
                    "{} 秒内没有检测到 Windows 设置窗口（ms-settings 可能被策略拦了）",
                    WAIT_TIMEOUT.as_secs()
                ));
            }
            log::warn!("设置窗口已出现，但前台复核没通过（可能在别的虚拟桌面或显示器上）");
            return Ok(());
        }
        std::thread::sleep(POLL_INTERVAL);
    }
}

/// `ms-settings:` 走 shell 关联；`cmd /C start` 的第一个参数是空串才不会把 URI 当成窗口标题
fn spawn_uri(uri: &str) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    /// CREATE_NO_WINDOW：别为了开一个设置页闪一下黑框
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;
    std::process::Command::new("cmd")
        .args(["/C", "start", "", uri])
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map(|_| ())
        .map_err(|err| format!("打开 Windows 设置失败: {err}"))
}

/// 把窗口切到前台并复核；返回是否确认到「设置类窗口拿到了前台」。
///
/// 复核不看具体 HWND：UWP 设置页实际被激活的是 `ApplicationFrameHost` 的宿主窗口，
/// `SetForegroundWindow(设置页自己的 CoreWindow)` 之后前台句柄会落在宿主窗口上。
///
/// SAFETY: 调用方保证 `hwnd` 来自 EnumWindows 枚举结果。
unsafe fn raise(hwnd: HWND) -> bool {
    let _ = unsafe { ShowWindow(hwnd, SW_RESTORE) };
    let _ = unsafe { SetForegroundWindow(hwnd) };
    let _ = unsafe { BringWindowToTop(hwnd) };
    std::thread::sleep(VERIFY_DELAY);
    if settings_is_foreground() {
        return true;
    }

    // 前台锁定（SPI_SETFOREGROUNDLOCKTIMEOUT）不为 0 的系统上，直接调用会被静默忽略；
    // 把自己的输入队列临时接到前台窗口所在线程上，借用它的前台权限再试一次。
    let foreground = unsafe { GetForegroundWindow() };
    if foreground.is_invalid() || foreground == hwnd {
        return false;
    }
    let current = unsafe { GetCurrentThreadId() };
    let foreground_thread = unsafe { GetWindowThreadProcessId(foreground, None) };
    let target_thread = unsafe { GetWindowThreadProcessId(hwnd, None) };
    if foreground_thread == 0 || target_thread == 0 {
        return false;
    }
    // SAFETY: 两个线程 ID 都来自刚查询到的有效窗口，成对挂接/解挂。
    let _ = unsafe { AttachThreadInput(current, foreground_thread, true) };
    let _ = unsafe { AttachThreadInput(current, target_thread, true) };
    let raised = unsafe { SetForegroundWindow(hwnd) }.as_bool();
    let _ = unsafe { AttachThreadInput(current, target_thread, false) };
    let _ = unsafe { AttachThreadInput(current, foreground_thread, false) };
    std::thread::sleep(VERIFY_DELAY);
    raised && settings_is_foreground()
}

/// 当前前台窗口是不是设置页（SystemSettings 或它的宿主 ApplicationFrameHost）
fn settings_is_foreground() -> bool {
    // SAFETY: 无参数查询，返回的句柄只在本次判断中使用。
    let foreground = unsafe { GetForegroundWindow() };
    if foreground.is_invalid() {
        return false;
    }
    let mut pid = 0u32;
    // SAFETY: 传的是本栈上有效的 u32 指针。
    unsafe { GetWindowThreadProcessId(foreground, Some(&mut pid)) };
    if pid == 0 {
        return false;
    }
    // SAFETY: pid 来自 GetWindowThreadProcessId，进程可能已退出，函数内部按 None 处理。
    match unsafe { process_image_name(pid) } {
        Some(name) => name.ends_with("systemsettings.exe") || name.ends_with("applicationframehost.exe"),
        None => false,
    }
}

/// 可见的「设置类」顶层窗口键集合（HWND 的整数地址，HWND 本身不实现 Hash）
fn visible_settings_windows() -> HashSet<isize> {
    let mut found: Vec<HWND> = Vec::new();
    let context = LPARAM(&mut found as *mut Vec<HWND> as isize);
    // SAFETY: 回调只读写本函数栈上的 Vec，EnumWindows 同步返回后才使用结果。
    let _ = unsafe { EnumWindows(Some(collect_settings_window), context) };
    found.into_iter().map(hwnd_key).collect()
}

fn hwnd_key(hwnd: HWND) -> isize {
    hwnd.0 as isize
}

unsafe extern "system" fn collect_settings_window(hwnd: HWND, context: LPARAM) -> BOOL {
    // SAFETY: context 是 visible_settings_windows 传进来的 &mut Vec<HWND>，生命周期覆盖整个枚举。
    let found = unsafe { &mut *(context.0 as *mut Vec<HWND>) };
    if !unsafe { IsWindowVisible(hwnd).as_bool() } {
        return true.into();
    }
    // 宿主窗口（ApplicationFrameWindow）在设置页初始化早期就已经可见，标题为空时先跳过
    if unsafe { GetAncestor(hwnd, GA_ROOT) } != hwnd {
        return true.into();
    }
    let mut pid = 0u32;
    // SAFETY: 传的是本栈上有效的 u32 指针。
    unsafe { GetWindowThreadProcessId(hwnd, Some(&mut pid)) };
    if pid == 0 {
        return true.into();
    }
    if let Some(name) = unsafe { process_image_name(pid) } {
        if name.ends_with("systemsettings.exe") || name.ends_with("applicationframehost.exe") {
            found.push(hwnd);
        }
    }
    true.into()
}

/// 进程映象名（小写、含 .exe）；拿不到返回 None（进程已退出/无权限）
///
/// SAFETY: 调用方传的是 EnumWindows 或 GetWindowThreadProcessId 给出的有效 pid。
unsafe fn process_image_name(pid: u32) -> Option<String> {
    // SAFETY: 句柄用后立即关闭。
    let handle = unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false.into(), pid) }.ok()?;
    let mut buffer = [0u16; 512];
    let mut length = buffer.len() as u32;
    // SAFETY: buffer 与 length 都是本栈上的有效缓冲，长度按 u16 计。
    let result = unsafe {
        QueryFullProcessImageNameW(handle, PROCESS_NAME_WIN32, PWSTR(buffer.as_mut_ptr()), &mut length)
    };
    // SAFETY: handle 是上面 OpenProcess 拿到的、尚未关闭的句柄。
    let _ = unsafe { CloseHandle(handle) };
    result.ok()?;
    Some(String::from_utf16_lossy(&buffer[..length as usize]).to_lowercase())
}
