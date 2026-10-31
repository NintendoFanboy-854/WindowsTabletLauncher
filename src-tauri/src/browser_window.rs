//! 受管浏览器窗口（P3a 通用能力）：调用方给一个 https URL，宿主拉起 Edge 的 app 窗口并管生命周期。
//!
//! 设计见 `docs/history/V090-AUDIO-MUSIC-SPEC.md §5.3`。宿主只做通用机制：不认识任何插件、
//! 不内置任何业务 URL 或文案，URL 一律由调用方（插件经桥接）传入。
//!
//! - **进程**：`msedge.exe --app=<url> --user-data-dir=<独立 profile> --no-first-run
//!   --no-default-browser-check --window-size=W,H --window-position=X,Y`，用
//!   `std::process::Command` 直接拉起（不经过 shell，参数不重新解析）；独立 profile 放在
//!   `app_data_dir/browser-window-profile`，不碰用户自己的 Edge 配置。
//! - **窗口**：按 pid 用 `EnumWindows` + `GetWindowThreadProcessId` 找顶层窗口，`ShowWindow`
//!   / `SetForegroundWindow` 做 show/hide/minimize，`PostMessage(WM_CLOSE)` +
//!   `taskkill /T /F` 做 close。
//! - **单实例**：进程还活着时再次 open 只做 show/restore，不再拉第二个窗口。
//! - **进程身份**：Edge 有时会把命令转交给一个**新的浏览器进程**（例如需要 de-elevate 时），
//!   自己拉起后就退出；所以不能用 `Command::spawn` 的 pid 当窗口身份。这里改为「调试端口
//!   的监听进程」：端口只由真实浏览器进程持有，用 `GetExtendedTcpTable` 反查 pid，再用它
//!   `EnumWindows` 找窗口、`taskkill /T /F` 结束整棵树。`DevToolsActivePort` 文件用来识别
//!   上次异常退出遗留的受管浏览器，重新打开前先结束它，避免新实例被旧进程吞掉。
//! - **生命周期**：每个窗口一个监控线程（约 1s 检查浏览器进程），进程退出就清空状态，命令不会
//!   看到僵尸；应用退出时由 [`BrowserWindowManager::close_for_exit`] 尽力结束进程，
//!   不等待、不阻塞退出。
//!
//! 安全边界：只接受 `https://`；不执行调用方传入的路径或命令；profile 目录固定在本应
//! 用数据目录（或临时目录）下，不接受外部指定。
//!
//! 调试端口（2026-10-31）：拉起 Edge 时额外开一个只监听回环的 DevTools 端口，并提供
//! [`BrowserWindowManager::debug_targets`] 把 `/json/list` 原样透传出去。宿主仍然只做通用机制：
//! 不判断 target 类型/URL/标题，不认识调用方，也不替调用方连 WebSocket——挑哪个目标、怎么用
//! 都是调用方的事。

use std::io::{ErrorKind, Read, Write};
use std::net::{SocketAddr, TcpListener, TcpStream};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex, MutexGuard};
use std::thread;
use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};
use windows::Win32::Foundation::{CloseHandle, HWND, LPARAM, WPARAM};
use windows::Win32::NetworkManagement::IpHelper::{
    GetExtendedTcpTable, MIB_TCPTABLE_OWNER_PID, TCP_TABLE_OWNER_PID_LISTENER,
};
use windows::Win32::Networking::WinSock::AF_INET;
use windows::Win32::System::Threading::{
    CREATE_NO_WINDOW, GetExitCodeProcess, OpenProcess, PROCESS_NAME_WIN32,
    PROCESS_QUERY_LIMITED_INFORMATION, PROCESS_TERMINATE, QueryFullProcessImageNameW,
    TerminateProcess,
};
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, GA_ROOT, GetAncestor, GetSystemMetrics, GetWindowTextLengthW,
    GetWindowThreadProcessId, IsIconic, IsWindowVisible, PostMessageW, SM_CXSCREEN, SM_CYSCREEN,
    SW_HIDE, SW_MINIMIZE, SW_RESTORE, SetForegroundWindow, ShowWindow, WM_CLOSE,
};
use windows::core::{BOOL, PWSTR};
use winreg::RegKey;
use winreg::enums::{
    HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE, KEY_READ, KEY_WOW64_32KEY, KEY_WOW64_64KEY,
};

// ---------- 参数常量（窗口几何与轮询节奏，不是设计 token） ----------

/// 独立 profile 目录名（放在 app_data_dir 下，与用户自己的 Edge 配置完全隔离）。
const PROFILE_DIR_NAME: &str = "browser-window-profile";
/// app 窗口的默认尺寸（P3 spec 固定 1200×800；屏幕更小时 clamp）。
const WINDOW_WIDTH: i32 = 1200;
const WINDOW_HEIGHT: i32 = 800;
/// 拉起后等窗口句柄出现的上限：只为了让 open 的返回值尽量准确，等不到就返回
/// `running=true/visible=false`，调用方下一轮 `state` 会拿到真实值。
const WINDOW_APPEAR_TIMEOUT: Duration = Duration::from_millis(600);
const WINDOW_POLL_INTERVAL: Duration = Duration::from_millis(100);
/// 拉起后等「真实浏览器进程」出现（持有调试端口的那个 pid）的上限。
const BROWSER_PID_TIMEOUT: Duration = Duration::from_secs(3);
const BROWSER_PID_POLL_INTERVAL: Duration = Duration::from_millis(150);
/// 启动宽限期：这段时间内「进程还没认出来 / 窗口还没建好」都按 running 处理，
/// 避免插件在冷启动的几秒里误判为「播放器未打开」。
const STARTUP_GRACE: Duration = Duration::from_secs(12);
/// Chromium 在 user-data-dir 里写的实际调试端口（第一行端口、第二行 browser ws 路径）。
/// 注意：显式 `--remote-debugging-port` 模式实测**不会**写这个文件，所以受管窗口身份不依赖它，
/// 只用它做辅助判断；真正的身份记录见 [`IDENTITY_FILE`]。
const DEVTOOLS_PORT_FILE: &str = "DevToolsActivePort";
/// 本应用自己写的受管窗口身份文件（崩溃/强杀后下次 open 用它找回并结束遗留浏览器）。
const IDENTITY_FILE: &str = "managed-window.json";
/// `GetExitCodeProcess` 的 STILL_ACTIVE（259，`STILL_ACTIVE` 常量在 windows crate 里是 NTSTATUS）。
const STILL_ACTIVE_CODE: u32 = 259;
/// 监控线程的进程存活检查间隔（进程被用户关掉后状态置未运行）。
const MONITOR_INTERVAL: Duration = Duration::from_secs(1);
/// 交互式 close 等 taskkill 结束的上限（退出路径另用更短的 [`EXIT_TASKKILL_TIMEOUT`]）。
const TASKKILL_TIMEOUT: Duration = Duration::from_millis(1200);
const EXIT_TASKKILL_TIMEOUT: Duration = Duration::from_millis(300);
const TASKKILL_POLL_INTERVAL: Duration = Duration::from_millis(50);

/// Edge 的 App Paths 注册表项（默认值 = msedge.exe 全路径）。
const EDGE_APP_PATH_KEY: &str = r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe";

// ---------- 调试端口常量（通用能力，与业务无关） ----------

/// 调试端口只绑回环地址：调试端点等价于该浏览器的完全控制权，不出本机。
const DEBUG_ADDRESS: &str = "127.0.0.1";
/// 允许连 CDP WebSocket 的 Origin（浏览器握手会带 `Origin`，Chromium 默认拒绝非空 Origin）。
///
/// 三个值分别是插件 iframe（`http://wtsl.localhost`）、宿主页（`http://tauri.localhost`）与
/// 浏览器开发模式（Vite，`http://localhost:5173`）。宿主不认识具体插件，这里只枚举本项目的
/// 渲染面 origin，不做任何业务过滤。
const DEBUG_ALLOWED_ORIGINS: &str =
    "http://wtsl.localhost,http://tauri.localhost,http://localhost:5173";
/// CDP `/json/list` 的 HTTP 超时（连接 + 读各一份）。
const DEBUG_HTTP_TIMEOUT: Duration = Duration::from_secs(2);
/// `/json/list` 响应上限：目标列表只有几 KB，超过按异常响应处理，避免无限读。
const DEBUG_MAX_RESPONSE_BYTES: usize = 1024 * 1024;

// ---------- 前端快照 ----------

/// 受管窗口状态（serde camelCase，`url` 只在运行时有值）。
#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserWindowState {
    /// 进程是否在跑（监控线程/`try_wait` 清理过僵尸，这里是实时结论）
    pub running: bool,
    /// 窗口当前是否可见（`IsWindowVisible` 实时读）
    pub visible: bool,
    /// 窗口当前是否最小化（`IsIconic` 实时读）
    pub minimized: bool,
    /// 当前受管窗口打开的 URL（未运行时为 None）
    pub url: Option<String>,
}

// ---------- 调试目标快照（通用透传） ----------

/// 一条 CDP 调试目标：字段原样来自 `/json/list`，宿主不解释、不过滤。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserDebugTarget {
    /// CDP 目标类型（`page` / `iframe` / `service_worker` …）；显式 rename，避免依赖 raw ident 的命名规则
    #[serde(rename = "type")]
    pub r#type: String,
    pub url: String,
    pub title: String,
    /// CDP WebSocket 调试地址；调用方自己决定连不连、连哪个
    pub web_socket_debugger_url: String,
}

/// 受管窗口的调试目标快照：端口 + 目标列表。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserDebugTargets {
    /// 该受管窗口的 DevTools 端口（调用方也可以自己拼 HTTP / WS 地址）
    pub port: u16,
    pub targets: Vec<BrowserDebugTarget>,
}

/// `/json/list` 的原始条目：只取四个字段，其余（id / description / devtoolsFrontendUrl…）丢弃。
#[derive(Debug, serde::Deserialize)]
struct RawDebugTarget {
    #[serde(rename = "type", default)]
    r#type: String,
    #[serde(default)]
    url: String,
    #[serde(default)]
    title: String,
    #[serde(rename = "webSocketDebuggerUrl", default)]
    web_socket_debugger_url: String,
}

// ---------- 内部状态 ----------

/// 受管窗口的身份存档（写在 profile 目录里，崩溃/强杀后用来清理遗留浏览器）。
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PersistedIdentity {
    debug_port: u16,
    browser_pid: u32,
}

/// 一个受管 Edge 窗口：拉起时的子进程（只用来收尸）+ URL + DevTools 端口 + 真实浏览器身份。
///
/// `browser_pid` 是**持有调试端口的真实浏览器进程**，可能不是 `pid`（Edge 会中继启动后退出）；
/// 懒解析并缓存，进程死了会重新解析。
struct ManagedWindow {
    child: Child,
    /// `Command::spawn` 返回的 pid：可能只是 Edge 的中继进程，不能当窗口身份用。
    pid: u32,
    url: String,
    /// 本次启动分配的回环调试端口（`--remote-debugging-port`）。
    debug_port: u16,
    /// 真实浏览器进程（`/json/list` 端口的监听者）；未识别出来时为 None。
    browser_pid: Option<u32>,
    /// 拉起时刻：冷启动宽限期与遗留进程判断用。
    launched_at: Instant,
    /// 身份存档路径（`profile_dir/managed-window.json`）。
    identity_path: PathBuf,
}

/// 宿主侧句柄：唯一窗口槽位 + 独立 profile 目录。所有命令都是同步短操作。
pub struct BrowserWindowManager {
    window: Arc<Mutex<Option<ManagedWindow>>>,
    profile_dir: PathBuf,
}

impl BrowserWindowManager {
    /// 启动管理服务。`app_data_dir` 为 None 时退回临时目录（并记 warn），只是 profile 不持久。
    pub fn start(app_data_dir: Option<PathBuf>) -> Self {
        let profile_dir = match app_data_dir {
            Some(dir) => dir.join(PROFILE_DIR_NAME),
            None => {
                log::warn!("受管浏览器窗口：拿不到 app_data_dir，独立 profile 改放临时目录");
                std::env::temp_dir().join(PROFILE_DIR_NAME)
            }
        };
        if let Err(err) = std::fs::create_dir_all(&profile_dir) {
            // 不致命：open 时会再建一次，失败在那个调用点报给插件。
            log::warn!("受管浏览器窗口：创建 profile 目录失败: {err}");
        }
        Self {
            window: Arc::new(Mutex::new(None)),
            profile_dir,
        }
    }

    /// 打开受管窗口。已有进程时只做 show/restore，返回当前状态（不导航到新 URL）。
    pub fn open(&self, url: &str) -> Result<BrowserWindowState, String> {
        let url = normalize_url(url)?;

        // 已有受管窗口：只做 show/restore，不再拉第二个窗口。
        if self.state().running {
            if let Some((pid, _url)) = self.browser() {
                if let Some(hwnd) = find_window(pid) {
                    // SAFETY: hwnd 来自当前 EnumWindows 快照；被用户关掉时 ShowWindow 只是失败。
                    unsafe {
                        let _ = ShowWindow(hwnd, SW_RESTORE);
                        if !SetForegroundWindow(hwnd).as_bool() {
                            // 系统前台锁会忽略这个调用；窗口本身已经恢复，只记一行日志。
                            log::warn!("受管浏览器窗口：SetForegroundWindow 被忽略（窗口已恢复）");
                        }
                    }
                } else {
                    log::info!("受管浏览器窗口进程在跑但还没枚举到窗口（pid={pid}），沿用当前实例");
                }
            }
            return Ok(self.state());
        }

        // 上次被强杀/崩溃时可能留下一个还在跑的受管浏览器（同一 profile 下 Edge 会把新命令
        // 转交给它，导致新端口永远不监听）。先按 profile 里的 DevToolsActivePort 把它结束。
        self.kill_stale_browser();

        let edge = find_edge_path().ok_or_else(|| {
            "找不到 Microsoft Edge（注册表 App Paths 与默认安装路径都没有）".to_string()
        })?;
        std::fs::create_dir_all(&self.profile_dir)
            .map_err(|err| format!("创建浏览器 profile 目录失败: {err}"))?;
        let (width, height, x, y) = window_geometry();
        // 系统分配一个空闲回环端口后立即释放，再交给 Edge 绑定（端口只在本机可用）。
        let debug_port = pick_debug_port()?;

        let child = Command::new(&edge)
            .arg(format!("--app={url}"))
            .arg(format!("--user-data-dir={}", self.profile_dir.display()))
            .arg("--no-first-run")
            .arg("--no-default-browser-check")
            .arg(format!("--window-size={width},{height}"))
            .arg(format!("--window-position={x},{y}"))
            // 通用调试端点：只监听回环、只放行本项目渲染面的 Origin。
            // 宿主不知道谁会来连；这里只是把「受管窗口可被本机调用方调试」这条能力开出来。
            .arg(format!("--remote-debugging-port={debug_port}"))
            .arg(format!("--remote-debugging-address={DEBUG_ADDRESS}"))
            .arg(format!("--remote-allow-origins={DEBUG_ALLOWED_ORIGINS}"))
            // 不给 stdout/stderr 管道：否则父进程退出前管道句柄一直挂着，Edge 也会多一层缓冲。
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|err| format!("启动 Edge 失败: {err}"))?;
        let pid = child.id();
        log::info!(
            "受管浏览器窗口已启动: pid={pid} edge={} profile={} debug_port={debug_port} url={url}",
            edge.display(),
            self.profile_dir.display()
        );

        {
            let mut guard = self.lock();
            *guard = Some(ManagedWindow {
                child,
                pid,
                url: url.to_string(),
                debug_port,
                browser_pid: None,
                launched_at: Instant::now(),
                identity_path: self.profile_dir.join(IDENTITY_FILE),
            });
        }
        self.spawn_monitor(pid);
        // 等真实浏览器进程出现（Edge 可能中继启动），再短等窗口句柄，让 open 的返回值尽量准确；
        // 等不到也照常返回 running=true/visible=false，后续 state 会自己收敛。
        let browser_pid = self.wait_for_browser(BROWSER_PID_TIMEOUT);
        if let Some(browser_pid) = browser_pid {
            let _ = wait_for_window(browser_pid, WINDOW_APPEAR_TIMEOUT);
        }
        Ok(self.state())
    }

    /// 窗口控制：show / hide / minimize / close；非法动作返回 Err。
    pub fn control(&self, action: &str) -> Result<BrowserWindowState, String> {
        match action {
            "show" | "hide" | "minimize" => {
                let Some((pid, _url)) = self.browser() else {
                    return Err("浏览器窗口未运行".to_string());
                };
                let hwnd = find_window(pid)
                    .ok_or_else(|| "找不到受管浏览器窗口（可能还在启动）".to_string())?;
                let command = match action {
                    "show" => SW_RESTORE,
                    "hide" => SW_HIDE,
                    _ => SW_MINIMIZE,
                };
                // SAFETY: hwnd 来自当前 EnumWindows 快照，窗口可能刚好被关掉，失败可接受。
                unsafe {
                    let _ = ShowWindow(hwnd, command);
                    if action == "show" && !SetForegroundWindow(hwnd).as_bool() {
                        log::warn!("受管浏览器窗口：SetForegroundWindow 未生效（已恢复未置前）");
                    }
                }
                Ok(self.state())
            }
            "close" => {
                self.close(TASKKILL_TIMEOUT)?;
                Ok(BrowserWindowState::default())
            }
            other => Err(format!("未知的窗口控制: {other}")),
        }
    }

    /// 运行状态：以「真实浏览器进程 + 窗口」为准（不看 `Command::spawn` 的子进程，Edge 会中继）。
    pub fn state(&self) -> BrowserWindowState {
        let mut guard = self.lock();
        let Some(managed) = guard.as_mut() else {
            return BrowserWindowState::default();
        };
        let url = managed.url.clone();
        let elapsed = managed.launched_at.elapsed();
        let child_exited = matches!(managed.child.try_wait(), Ok(Some(_)));

        match resolve_managed_pid(managed) {
            Some(pid) => match find_window(pid) {
                Some(hwnd) => BrowserWindowState {
                    running: true,
                    // SAFETY: hwnd 来自当前 EnumWindows 快照，只做只读状态查询。
                    visible: unsafe { IsWindowVisible(hwnd).as_bool() },
                    // SAFETY: 同上。
                    minimized: unsafe { IsIconic(hwnd).as_bool() },
                    url: Some(url),
                },
                // 浏览器进程在、窗口还没建好（冷启动）或已被用户关掉（Edge 后台模式）：
                // 宽限期内按 running 处理，避免插件冷启动误判；之后按未运行处理。
                None if elapsed < STARTUP_GRACE => BrowserWindowState {
                    running: true,
                    visible: false,
                    minimized: false,
                    url: Some(url),
                },
                None => {
                    log::info!("受管浏览器窗口：进程还在但窗口已关闭（pid={pid}）");
                    BrowserWindowState::default()
                }
            },
            None => {
                // 还认不出真实浏览器进程：启动宽限期内 / 中继子进程还没退，先按 running 处理。
                if elapsed < STARTUP_GRACE || !child_exited {
                    return BrowserWindowState {
                        running: true,
                        visible: false,
                        minimized: false,
                        url: Some(url),
                    };
                }
                log::info!("受管浏览器窗口已结束（state 清理）: spawned_pid={}", managed.pid);
                *guard = None;
                BrowserWindowState::default()
            }
        }
    }

    /// 受管窗口的调试目标：`GET http://127.0.0.1:<port>/json/list`，四个字段原样透传。
    ///
    /// 通用能力：宿主不判断 `type` / `url` / `title`，也不认识调用方；窗口没跑、端口没起来、
    /// HTTP 或 JSON 失败一律返回 `Err`，由调用方决定怎么降级。窗口关闭/进程退出后端口随进程
    /// 释放，不需要单独清理。
    pub fn debug_targets(&self) -> Result<BrowserDebugTargets, String> {
        let port = {
            let guard = self.lock();
            guard.as_ref().map(|managed| managed.debug_port)
        };
        let Some(port) = port else {
            return Err("浏览器窗口未运行".to_string());
        };
        if port == 0 {
            return Err("浏览器窗口没有调试端口".to_string());
        }

        let body = match http_get_debug_json(port) {
            Ok(body) => body,
            Err(err) => {
                // 端口不通：真实浏览器进程也没了就是「未运行」，顺手清空状态；
                // 进程还在（例如启动宽限期内端口还没监听）则把原始错误交给调用方。
                if self.browser().is_none() {
                    let mut guard = self.lock();
                    let cleanup = guard.as_mut().is_some_and(|managed| {
                        let stale = managed.launched_at.elapsed() > STARTUP_GRACE;
                        if stale {
                            log::info!(
                                "受管浏览器窗口已结束（调试目标查询清理）: spawned_pid={}",
                                managed.pid
                            );
                        }
                        stale
                    });
                    if cleanup {
                        *guard = None;
                        return Err("浏览器窗口未运行".to_string());
                    }
                }
                return Err(err);
            }
        };
        let raw: Vec<RawDebugTarget> =
            serde_json::from_str(&body).map_err(|err| format!("解析调试目标失败: {err}"))?;
        let targets = raw
            .into_iter()
            .map(|target| BrowserDebugTarget {
                r#type: target.r#type,
                url: target.url,
                title: target.title,
                web_socket_debugger_url: target.web_socket_debugger_url,
            })
            .collect();
        Ok(BrowserDebugTargets { port, targets })
    }

    /// 退出专用：尽力结束受管进程，不 panic、不长时间等待。
    ///
    /// 先 `WM_CLOSE` 给一次正常退出机会，再 `taskkill /PID <pid> /T /F` 结束进程树
    /// （Edge 的渲染进程是它的子进程）；任务栏时间给得很短，失败只记日志。
    pub fn close_for_exit(&self) {
        let mut guard = self.lock();
        let Some(managed) = guard.as_mut() else {
            return;
        };
        let spawned_pid = managed.pid;
        let browser_pid = resolve_managed_pid(managed);
        let identity_path = managed.identity_path.clone();
        log::info!("退出：结束受管浏览器窗口 spawned_pid={spawned_pid} browser_pid={browser_pid:?}");
        if let Some(pid) = browser_pid {
            request_close(pid);
            // 退出路径不能等：taskkill `/T /F` 对 Edge 整棵树经常超过 300ms（实测超时后
            // 应用先退出、Edge 反而留了下来）。直接 TerminateProcess 掉浏览器主进程，
            // 再后台异步 taskkill 清子进程，既快又不会留 AM。
            if terminate_process(pid) {
                spawn_taskkill_background(pid);
            } else {
                let _ = taskkill_tree(pid, EXIT_TASKKILL_TIMEOUT);
            }
        } else {
            // 还没认出真实浏览器进程：只收掉中继进程（它通常已在退出路上）。
            let _ = managed.child.kill();
        }
        let _ = managed.child.wait();
        let _ = std::fs::remove_file(&identity_path);
        *guard = None;
    }

    /// 关窗口并清空 inner：WM_CLOSE → taskkill /T /F → 收尸。
    fn close(&self, taskkill_timeout: Duration) -> Result<(), String> {
        let mut guard = self.lock();
        let Some(managed) = guard.as_mut() else {
            return Err("浏览器窗口未运行".to_string());
        };
        let spawned_pid = managed.pid;
        let browser_pid = resolve_managed_pid(managed);
        let identity_path = managed.identity_path.clone();
        if let Some(pid) = browser_pid {
            request_close(pid);
            if !taskkill_tree(pid, taskkill_timeout) {
                log::warn!("受管浏览器窗口：taskkill 未确认结束，TerminateProcess 兜底 (pid={pid})");
                let _ = terminate_process(pid);
            }
        } else {
            // 没有可识别的真实浏览器进程：中继进程本来就会自己退，收尸即可。
            let _ = managed.child.kill();
        }
        let _ = managed.child.wait();
        let _ = std::fs::remove_file(&identity_path);
        *guard = None;
        log::info!(
            "受管浏览器窗口已关闭: spawned_pid={spawned_pid} browser_pid={browser_pid:?}"
        );
        Ok(())
    }

    fn lock(&self) -> MutexGuard<'_, Option<ManagedWindow>> {
        self.window
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }

    /// 受管浏览器身份（真实浏览器 pid + url）；还没认出来时 None。
    fn browser(&self) -> Option<(u32, String)> {
        let mut guard = self.lock();
        let managed = guard.as_mut()?;
        let pid = resolve_managed_pid(managed)?;
        Some((pid, managed.url.clone()))
    }

    /// 等真实浏览器进程（持有调试端口的那个）出现；超时返回 None。
    fn wait_for_browser(&self, timeout: Duration) -> Option<u32> {
        let deadline = Instant::now() + timeout;
        loop {
            let found = {
                let mut guard = self.lock();
                guard.as_mut().and_then(resolve_managed_pid)
            };
            if let Some(pid) = found {
                return Some(pid);
            }
            if Instant::now() >= deadline {
                return None;
            }
            thread::sleep(BROWSER_PID_POLL_INTERVAL);
        }
    }

    /// 结束上次被强杀/崩溃遗留的受管浏览器。
    ///
    /// 同一个 `--user-data-dir` 下，新的 msedge.exe 会把命令转交给还活着的旧浏览器进程后
    /// 自己退出：新分配的调试端口永远不监听，看起来就是「打开没反应」。我们每次成功识别出
    /// 真实浏览器后都会把 `debug_port + browser_pid` 写进 profile 目录的 [`IDENTITY_FILE`]，
    /// 下次 open 前按它找回旧进程并结束（`DevToolsActivePort` 只在辅助时使用）。
    /// 结束前校验镜像名是 `msedge.exe`，防止端口/pid 复用误杀别的程序；
    /// 这个 profile 只属于本应用，不会误伤用户自己的 Edge。
    fn kill_stale_browser(&self) {
        let identity_path = self.profile_dir.join(IDENTITY_FILE);
        let identity = std::fs::read_to_string(&identity_path)
            .ok()
            .and_then(|text| serde_json::from_str::<PersistedIdentity>(&text).ok());
        let mut stale_pid = identity.and_then(|identity| {
            if process_alive(identity.browser_pid) {
                Some(identity.browser_pid)
            } else {
                tcp_listening_pid(identity.debug_port).filter(|pid| process_alive(*pid))
            }
        });
        if stale_pid.is_none() {
            // 兼容旧版本/异常情况：看 Chromium 自己写没写 DevToolsActivePort。
            stale_pid = std::fs::read_to_string(self.profile_dir.join(DEVTOOLS_PORT_FILE))
                .ok()
                .and_then(|text| text.lines().next()?.trim().parse::<u16>().ok())
                .and_then(tcp_listening_pid)
                .filter(|pid| process_alive(*pid));
        }
        if let Some(pid) = stale_pid.filter(|pid| process_image_is_edge(*pid)) {
            log::warn!("受管浏览器窗口：发现上次遗留的受管浏览器（pid={pid}），先结束它");
            request_close(pid);
            if !terminate_process(pid) {
                let _ = taskkill_tree(pid, TASKKILL_TIMEOUT);
            } else {
                spawn_taskkill_background(pid);
            }
        }
        let _ = std::fs::remove_file(&identity_path);
    }

    /// 每个窗口一个监控线程：真实浏览器进程结束就清空状态，避免命令看到僵尸。
    fn spawn_monitor(&self, pid: u32) {
        let window = Arc::clone(&self.window);
        let spawned = thread::Builder::new()
            .name(format!("browser-window-monitor-{pid}"))
            .spawn(move || {
                loop {
                    thread::sleep(MONITOR_INTERVAL);
                    let mut guard = window
                        .lock()
                        .unwrap_or_else(|poisoned| poisoned.into_inner());
                    let Some(managed) = guard.as_mut() else {
                        break; // 已被 close / close_for_exit 清空
                    };
                    if managed.pid != pid {
                        break; // 槽位换了新窗口，这个监控线程退休
                    }
                    if resolve_managed_pid(managed).is_some() {
                        continue; // 真实浏览器进程还在
                    }
                    if managed.launched_at.elapsed() > STARTUP_GRACE {
                        log::info!("受管浏览器窗口已结束（监控线程清理）: spawned_pid={pid}");
                        *guard = None;
                        break;
                    }
                }
            });
        if let Err(err) = spawned {
            // 没有监控线程也能工作（每条命令自己解析进程），只是僵尸清理慢一点。
            log::warn!("受管浏览器窗口：监控线程启动失败: {err}");
        }
    }
}

// ---------- URL / 参数 ----------

/// 只放行 https（大小写不敏感），并拒绝控制字符。
///
/// 参数用 `Command::arg` 传入、不经过 shell，所以不需要转义；这里只挡「协议不对」和
/// 「把换行之类塞进命令行」的输入。
fn normalize_url(url: &str) -> Result<&str, String> {
    let url = url.trim();
    let Some(scheme) = url.get(..8) else {
        return Err("只允许 https 链接".to_string());
    };
    if !scheme.eq_ignore_ascii_case("https://") {
        return Err("只允许 https 链接".to_string());
    }
    // 只写 https:// 没有主机名时直接拒绝（`get(..8)` 命中说明前 8 字节是 ASCII，切分安全）。
    let rest = &url[8..];
    if rest.is_empty() || rest.starts_with('/') {
        return Err("只允许 https 链接".to_string());
    }
    if url.chars().any(|ch| ch.is_control()) {
        return Err("链接包含控制字符".to_string());
    }
    Ok(url)
}

// ---------- 调试端口 / HTTP 透传 ----------

/// 选一个空闲的回环端口：bind 到 0 由系统分配，取到端口后立即释放（Edge 随后再绑）。
///
/// 这里只是「挑一个大概率没人占的端口」，不保证不与别的进程抢；Edge 若绑定失败，
/// `debug_targets` 会因为连不上而返回 Err，调用方按连接失败降级。
fn pick_debug_port() -> Result<u16, String> {
    let listener = TcpListener::bind((DEBUG_ADDRESS, 0))
        .map_err(|err| format!("找不到空闲调试端口: {err}"))?;
    let port = listener
        .local_addr()
        .map_err(|err| format!("读不到调试端口: {err}"))?
        .port();
    drop(listener);
    Ok(port)
}

/// 用原生 `std::net` 发一个 HTTP/1.1 GET（不引入 HTTP crate），返回响应体。
///
/// 只做 `/json/list` 需要的那一点：写请求 → 读到 Content-Length 收满（或 EOF / 读超时）→
/// 按 `\r\n\r\n` 切头体。实测 Edge 156 即使收到 `Connection: close` 也不会主动断连，
/// 所以必须自己按 Content-Length 收尾，不能等 EOF，否则每次都要白等一个读超时。
fn http_get_debug_json(port: u16) -> Result<String, String> {
    let address = SocketAddr::from(([127, 0, 0, 1], port));
    let mut stream = TcpStream::connect_timeout(&address, DEBUG_HTTP_TIMEOUT)
        .map_err(|err| format!("连接调试端口失败: {err}"))?;
    let _ = stream.set_read_timeout(Some(DEBUG_HTTP_TIMEOUT));
    let _ = stream.set_write_timeout(Some(DEBUG_HTTP_TIMEOUT));

    // Host 必须是回环地址：CDP 的 HTTP 端点拒绝外部 Host（防 DNS rebinding）。
    let request = format!(
        "GET /json/list HTTP/1.1\r\nHost: {DEBUG_ADDRESS}:{port}\r\nAccept: application/json\r\nConnection: close\r\n\r\n"
    );
    stream
        .write_all(request.as_bytes())
        .map_err(|err| format!("请求调试端口失败: {err}"))?;
    let _ = stream.flush();

    let mut response = Vec::new();
    let mut buffer = [0u8; 8192];
    let mut expected_total: Option<usize> = None;
    loop {
        match stream.read(&mut buffer) {
            Ok(0) => break,
            Ok(read) => {
                response.extend_from_slice(&buffer[..read]);
                if response.len() > DEBUG_MAX_RESPONSE_BYTES {
                    return Err("调试端口响应过大".to_string());
                }
            }
            Err(err) if err.kind() == ErrorKind::Interrupted => continue,
            // 读超时也接受已有字节：正常路径在收满 Content-Length 时就已经 break。
            Err(err) if matches!(err.kind(), ErrorKind::WouldBlock | ErrorKind::TimedOut) => break,
            Err(err) => return Err(format!("读取调试端口失败: {err}")),
        }
        if expected_total.is_none() {
            if let Some(index) = find_header_end(&response) {
                expected_total = content_length(&response[..index]).map(|len| index + 4 + len);
            }
        }
        if let Some(total) = expected_total {
            if response.len() >= total {
                break;
            }
        }
    }

    let text = String::from_utf8_lossy(&response);
    let Some((headers, body)) = text.split_once("\r\n\r\n") else {
        return Err("调试端口没有返回完整响应".to_string());
    };
    let status = headers.lines().next().unwrap_or_default();
    if !status.contains(" 200") {
        return Err(format!("调试端口返回 {status}"));
    }
    Ok(body.to_string())
}

/// 在原始字节里找 `\r\n\r\n`，返回头结束的位置（不含分隔符）。
fn find_header_end(bytes: &[u8]) -> Option<usize> {
    const HEADER_END: &[u8] = b"\r\n\r\n";
    bytes
        .windows(HEADER_END.len())
        .position(|window| window == HEADER_END)
}

/// 从 HTTP 头里读 `Content-Length`（缺失或非数字时返回 None，走读超时兜底）。
fn content_length(headers: &[u8]) -> Option<usize> {
    let text = String::from_utf8_lossy(headers);
    for line in text.split("\r\n") {
        let Some((name, value)) = line.split_once(':') else {
            continue;
        };
        if name.trim().eq_ignore_ascii_case("content-length") {
            return value.trim().parse::<usize>().ok();
        }
    }
    None
}

/// 窗口尺寸/位置：1200×800，按主屏分辨率 clamp 后居中。屏幕尺寸读不到时交给系统摆。
fn window_geometry() -> (i32, i32, i32, i32) {
    // SAFETY: GetSystemMetrics 是只读查询，无参数副作用。
    let (screen_width, screen_height) =
        unsafe { (GetSystemMetrics(SM_CXSCREEN), GetSystemMetrics(SM_CYSCREEN)) };
    if screen_width <= 0 || screen_height <= 0 {
        return (WINDOW_WIDTH, WINDOW_HEIGHT, 0, 0);
    }
    let width = WINDOW_WIDTH.min(screen_width);
    let height = WINDOW_HEIGHT.min(screen_height);
    let x = ((screen_width - width) / 2).max(0);
    let y = ((screen_height - height) / 2).max(0);
    (width, height, x, y)
}

// ---------- Edge 定位 ----------

/// 找 msedge.exe：注册表 App Paths（HKLM 两个视图 → HKCU 两个视图）→ 默认安装路径。
fn find_edge_path() -> Option<PathBuf> {
    if let Some(path) = edge_from_registry() {
        return Some(path);
    }
    for env_name in ["ProgramFiles(x86)", "ProgramFiles"] {
        let Some(root) = std::env::var_os(env_name) else {
            continue;
        };
        let candidate = PathBuf::from(root).join(r"Microsoft\Edge\Application\msedge.exe");
        if candidate.is_file() {
            log::info!(
                "受管浏览器窗口：Edge 来自环境变量 {env_name}: {}",
                candidate.display()
            );
            return Some(candidate);
        }
    }
    None
}

/// 读 `HKLM|HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe` 的默认值。
///
/// 32/64 位视图都试：Edge 装在 `Program Files (x86)` 时，32 位视图与 64 位视图都可能命中
/// （本机实测两处都有值），但不同安装方式只写其中一处。
fn edge_from_registry() -> Option<PathBuf> {
    let hives = [
        (HKEY_LOCAL_MACHINE, "HKLM"),
        (HKEY_CURRENT_USER, "HKCU"),
    ];
    let views = [(KEY_WOW64_64KEY, "64 位视图"), (KEY_WOW64_32KEY, "32 位视图")];
    for (hive, hive_name) in hives {
        for (view, view_name) in views {
            let opened = RegKey::predef(hive)
                .open_subkey_with_flags(EDGE_APP_PATH_KEY, KEY_READ | view);
            let Ok(key) = opened else {
                continue;
            };
            let Ok(value) = key.get_value::<String, _>("") else {
                continue;
            };
            let path = PathBuf::from(value.trim().trim_matches('"'));
            if path.is_file() {
                log::info!(
                    "受管浏览器窗口：Edge 来自 {hive_name} App Paths（{view_name}）: {}",
                    path.display()
                );
                return Some(path);
            }
        }
    }
    None
}

// ---------- 进程身份（调试端口 → 真实浏览器进程） ----------

/// 解析并缓存「持有调试端口的真实浏览器进程」；缓存进程已退出则清空重查。
fn resolve_managed_pid(managed: &mut ManagedWindow) -> Option<u32> {
    if let Some(pid) = managed.browser_pid {
        if process_alive(pid) {
            return Some(pid);
        }
        log::info!("受管浏览器窗口：缓存的浏览器进程已退出 (pid={pid})");
        managed.browser_pid = None;
    }
    let pid = tcp_listening_pid(managed.debug_port)?;
    if !process_alive(pid) {
        return None;
    }
    if !process_image_is_edge(pid) {
        // 端口被别的程序抢到/复用了：宁可不认，也不对非 msedge 进程做窗口/结束操作。
        log::warn!("受管浏览器窗口：调试端口 {} 的监听进程不是 msedge（pid={pid}）", managed.debug_port);
        return None;
    }
    managed.browser_pid = Some(pid);
    // 身份落盘：崩溃/强杀后下次 open 靠它找回并结束遗留浏览器。
    if let Ok(text) = serde_json::to_string(&PersistedIdentity {
        debug_port: managed.debug_port,
        browser_pid: pid,
    }) {
        let _ = std::fs::write(&managed.identity_path, text);
    }
    log::info!(
        "受管浏览器窗口：调试端口 {} 属于真实浏览器进程 pid={pid}",
        managed.debug_port
    );
    Some(pid)
}

/// 进程是否还活着（`OpenProcess` + `GetExitCodeProcess`，同用户权限即可查询）。
fn process_alive(pid: u32) -> bool {
    if pid == 0 {
        return false;
    }
    // SAFETY: 只查询退出码，句柄在函数内关闭。
    unsafe {
        let Ok(handle) = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) else {
            return false;
        };
        let mut exit_code = 0u32;
        let ok = GetExitCodeProcess(handle, &mut exit_code).is_ok();
        let _ = CloseHandle(handle);
        ok && exit_code == STILL_ACTIVE_CODE
    }
}

/// 进程镜像名是否 `msedge.exe`（窗口/结束操作前的最低校验，防端口或 pid 复用误杀）。
fn process_image_is_edge(pid: u32) -> bool {
    if pid == 0 {
        return false;
    }
    // SAFETY: 只读进程镜像路径，句柄在函数内关闭。
    unsafe {
        let Ok(handle) = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) else {
            return false;
        };
        let mut buffer = [0u16; 1024];
        let mut size = buffer.len() as u32;
        let ok = QueryFullProcessImageNameW(
            handle,
            PROCESS_NAME_WIN32,
            PWSTR(buffer.as_mut_ptr()),
            &mut size,
        )
        .is_ok();
        let _ = CloseHandle(handle);
        if !ok {
            return false;
        }
        let path = String::from_utf16_lossy(&buffer[..size as usize]);
        path.to_ascii_lowercase().ends_with("msedge.exe")
    }
}

/// 强制结束单个进程（不等待，退出路径用；子进程交给后台 taskkill 收尾）。
fn terminate_process(pid: u32) -> bool {
    if pid == 0 {
        return false;
    }
    // SAFETY: 只请求结束指定进程，句柄在函数内关闭。
    unsafe {
        let Ok(handle) = OpenProcess(PROCESS_TERMINATE, false, pid) else {
            return false;
        };
        let ok = TerminateProcess(handle, 1).is_ok();
        let _ = CloseHandle(handle);
        ok
    }
}


/// 反查监听指定回环端口的进程 id（`GetExtendedTcpTable`，IPv4 监听表）。
///
/// Edge 中继启动时，`Command::spawn` 的 pid 会先退出，真正持有 `--remote-debugging-port`
/// 的是另一个浏览器进程；这个函数就是「端口 → 进程」的那一步。
fn tcp_listening_pid(port: u16) -> Option<u32> {
    const ERROR_INSUFFICIENT_BUFFER: u32 = 122;
    let mut size = 0u32;
    // SAFETY: 第一次传空表指针只用来取所需缓冲区大小。
    let first = unsafe {
        GetExtendedTcpTable(
            None,
            &mut size,
            false,
            AF_INET.0 as u32,
            TCP_TABLE_OWNER_PID_LISTENER,
            0,
        )
    };
    if first != ERROR_INSUFFICIENT_BUFFER && first != 0 {
        return None;
    }
    if size == 0 {
        return None;
    }
    // 缓冲区按 u32 对齐分配：MIB_TCPTABLE_OWNER_PID 里有 u32 字段，Vec<u8> 只有 1 字节
    // 对齐，直接 cast 解引用在 Rust 里是未对齐访问（UB）。
    let mut buffer = vec![0u32; (size as usize).div_ceil(4)];
    // SAFETY: 缓冲区长度按 API 要求分配，API 只写这段内存。
    let status = unsafe {
        GetExtendedTcpTable(
            Some(buffer.as_mut_ptr().cast()),
            &mut size,
            false,
            AF_INET.0 as u32,
            TCP_TABLE_OWNER_PID_LISTENER,
            0,
        )
    };
    if status != 0 {
        return None;
    }
    // SAFETY: buffer 由 API 写成 MIB_TCPTABLE_OWNER_PID：第一个 u32 是条目数，
    // 紧随其后是条目数组；条目数由同一个 API 填写，且 buffer 按 u32 对齐。
    let (entries, rows) = unsafe {
        let table = buffer.as_ptr().cast::<MIB_TCPTABLE_OWNER_PID>();
        let count = (*table).dwNumEntries as usize;
        (count, std::slice::from_raw_parts((*table).table.as_ptr(), count))
    };
    if entries == 0 {
        return None;
    }
    rows.iter()
        // SAFETY 语义：`dwLocalPort` 低 16 位是网络字节序的端口号，转回本机序再比。
        .find(|row| u16::from_be((row.dwLocalPort & 0xFFFF) as u16) == port)
        .map(|row| row.dwOwningPid)
}

// ---------- 窗口枚举 / 控制 ----------

/// 找该 pid 的顶层窗口。优先「可见 + 有标题」，其次可见，最后才用被隐藏/无标题的窗口
/// （hide 之后还要能 show 回来，所以不能只认可见窗口）。
///
/// 用 `GetAncestor(GA_ROOT)` 排掉子窗口和挂在别的窗口下的辅助窗口；Edge 的 app 窗口是
/// 顶层窗口，根祖先就是它自己。
fn find_window(pid: u32) -> Option<HWND> {
    struct Search {
        pid: u32,
        best: Option<(i32, HWND)>,
    }

    unsafe extern "system" fn callback(hwnd: HWND, context: LPARAM) -> BOOL {
        // SAFETY: context 是 find_window 栈上的 &mut Search，生命周期覆盖整个 EnumWindows。
        let search = unsafe { &mut *(context.0 as *mut Search) };
        let mut window_pid = 0u32;
        // SAFETY: 传的是本栈上有效的 u32 指针。
        unsafe { GetWindowThreadProcessId(hwnd, Some(&mut window_pid)) };
        if window_pid != search.pid {
            return true.into();
        }
        // SAFETY: 只读查询，句柄来自本次枚举。
        if unsafe { GetAncestor(hwnd, GA_ROOT) } != hwnd {
            return true.into();
        }
        // SAFETY: 只读查询，句柄来自本次枚举。
        let visible = unsafe { IsWindowVisible(hwnd).as_bool() };
        // SAFETY: 只读查询，句柄来自本次枚举。
        let titled = unsafe { GetWindowTextLengthW(hwnd) } > 0;
        let score = (if visible { 2 } else { 0 }) + (if titled { 1 } else { 0 });
        if search.best.map(|(best, _)| score > best).unwrap_or(true) {
            search.best = Some((score, hwnd));
        }
        true.into()
    }

    let mut search = Search { pid, best: None };
    let context = LPARAM(&mut search as *mut Search as isize);
    // SAFETY: 回调只读写本栈上的 Search，EnumWindows 同步返回后才使用结果。
    let _ = unsafe { EnumWindows(Some(callback), context) };
    search.best.map(|(_, hwnd)| hwnd)
}

/// 拉起后短等窗口出现（只用于让 open 的返回值准确，不参与正常路径）。
fn wait_for_window(pid: u32, timeout: Duration) -> Option<HWND> {
    let deadline = Instant::now() + timeout;
    loop {
        if let Some(hwnd) = find_window(pid) {
            return Some(hwnd);
        }
        if Instant::now() >= deadline {
            return None;
        }
        thread::sleep(WINDOW_POLL_INTERVAL);
    }
}

/// 给窗口发 WM_CLOSE（给一次正常退出机会；用户没保存的东西由页面自己处理）。
fn request_close(pid: u32) {
    let Some(hwnd) = find_window(pid) else {
        return;
    };
    // SAFETY: PostMessageW 只投递消息，句柄失效时返回错误由 Result 吞掉。
    let _ = unsafe { PostMessageW(Some(hwnd), WM_CLOSE, WPARAM(0), LPARAM(0)) };
}

/// `taskkill /PID <pid> /T /F`（无控制台窗口）。返回是否确认成功结束。
///
/// 用系统自带 taskkill 而不是只 `Child::kill()`：Edge 的渲染/网络进程是它的子进程，
/// `/T` 才能整棵树一起结束，不留后台页面。
fn taskkill_tree(pid: u32, timeout: Duration) -> bool {
    use std::os::windows::process::CommandExt;

    let mut command = Command::new("taskkill");
    command
        .arg("/PID")
        .arg(pid.to_string())
        .arg("/T")
        .arg("/F")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(CREATE_NO_WINDOW.0);
    let mut child = match command.spawn() {
        Ok(child) => child,
        Err(err) => {
            log::warn!("受管浏览器窗口：taskkill 启动失败: {err}");
            return false;
        }
    };
    let deadline = Instant::now() + timeout;
    loop {
        match child.try_wait() {
            Ok(Some(status)) => {
                if !status.success() {
                    log::warn!("受管浏览器窗口：taskkill 返回失败状态 {status} (pid={pid})");
                }
                return status.success();
            }
            Ok(None) => {}
            Err(err) => {
                log::warn!("受管浏览器窗口：等待 taskkill 失败: {err}");
                return false;
            }
        }
        if Instant::now() >= deadline {
            log::warn!("受管浏览器窗口：taskkill 在期限内没有结束 (pid={pid})");
            return false;
        }
        thread::sleep(TASKKILL_POLL_INTERVAL);
    }
}

/// 后台 `taskkill /T /F`：只投递清理、不等待（退出路径专用，避免拖慢退出）。
fn spawn_taskkill_background(pid: u32) {
    use std::os::windows::process::CommandExt;

    let spawned = Command::new("taskkill")
        .arg("/PID")
        .arg(pid.to_string())
        .arg("/T")
        .arg("/F")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(CREATE_NO_WINDOW.0)
        .spawn();
    if let Err(err) = spawned {
        log::warn!("受管浏览器窗口：后台 taskkill 启动失败: {err}");
    }
}
