//! WebView2「站点权限」里的麦克风：把陈旧的持久化拒绝自愈成 Allow。
//!
//! 为什么会坏（0.4.4–0.4.6 实测链路，证据见 `wtsl-mic-fix.md`）：
//! - WebView2 没有内建授权 UI。宿主没有应答 `PermissionRequested` 时，WebView2 按「拒绝」处理，
//!   **并且把这次拒绝按 origin 持久化**到 profile 的 `Preferences`：
//!   `profile.content_settings.exceptions.media_stream_mic["http://tauri.localhost:80,*"] = {setting: 2}`。
//! - 落盘之后，权限管理器在问到宿主之前就按 Block 短路：`PermissionRequested` 根本不再触发，
//!   `navigator.permissions.query({name:'microphone'})` 直接返回 `denied`，
//!   `getUserMedia` 直接 `NotAllowedError` —— 所以 `Builder::on_permission_request` 应答 Allow 也无效。
//! - 这一层与 Windows 隐私开关（注册表 `ConsentStore\microphone`）无关：把后者改成 Allow 不会改变任何现象。
//!
//! 修法：用 WebView2 官方 API `ICoreWebView2Profile4::SetPermissionState` 把本站 origin 的
//! 麦克风状态写成 `Allow`（写的是同一份存储，会覆盖旧的 Block）。
//!
//! 版本门槛（Microsoft Learn「Applies to / Introduced」+ 版本兼容规则：API 在 Runtime 构建号
//! ≥ 引入它的 SDK 构建号时可用）：
//! - `ICoreWebView2_13`（提供 `Profile` 属性）：SDK 1.0.1210.39 / Runtime 101（2022-05）；
//! - `ICoreWebView2Profile4`（提供 `SetPermissionState`）：SDK 1.0.1661.34 / Runtime 111（2023-03）。
//! 所以整条链路要求 Runtime ≥ 111。低于此值时两级 `cast` 都会失败，函数返回 `Err`（不 panic、
//! 不影响启动），前端 `ensureMicSitePermission()` 只记一条 warn，录音退化到
//! 「应用内同意 + 打开 Windows 设置」那条既有路径 —— Windows 10 1809 上装的 2021–2022 年
//! 运行时（Chromium 96–100）走的就是这条降级路径。
//! 只动麦克风这一格：相机/定位/通知一概不碰。

use std::sync::mpsc::{self, RecvTimeoutError};
use std::time::Duration;

use tauri::WebviewWindow;

/// 只处理本站页面自己的 origin：不替别的站点做决定
pub const PAGE_ORIGIN: &str = "http://tauri.localhost";

/// WebView2 回报写入结果的最长等待
const RESULT_TIMEOUT: Duration = Duration::from_secs(3);

/// 把本站 origin 的麦克风站点权限写成 Allow。
///
/// `SetPermissionState` 是异步的：真实调用必须落到主线程（WebView2 的要求），
/// 结果通过完成回调回来，所以这里用「派发 + 等回调」而不是同步阻塞主线程。
pub async fn allow_microphone(window: &WebviewWindow) -> Result<(), String> {
    let (sender, receiver) = mpsc::channel::<Result<(), String>>();
    let origin = PAGE_ORIGIN.to_string();
    let dispatch = sender.clone();
    window
        .with_webview(move |webview| {
            if let Err(err) = apply(&webview, &origin, dispatch.clone()) {
                let _ = dispatch.send(Err(err));
            }
        })
        .map_err(|err| format!("无法把权限请求派发到 WebView2 主线程: {err}"))?;

    tauri::async_runtime::spawn_blocking(move || receiver.recv_timeout(RESULT_TIMEOUT))
        .await
        .map_err(|err| format!("等待 WebView2 权限写入结果失败: {err}"))?
        .map_err(|err| match err {
            RecvTimeoutError::Timeout => "WebView2 在 3 秒内没有回报权限写入结果".to_string(),
            RecvTimeoutError::Disconnected => "WebView2 权限回调通道断开".to_string(),
        })?
}

#[cfg(target_os = "windows")]
fn apply(
    webview: &tauri::webview::PlatformWebview,
    origin: &str,
    sender: mpsc::Sender<Result<(), String>>,
) -> Result<(), String> {
    use webview2_com::Microsoft::Web::WebView2::Win32::{
        ICoreWebView2Profile4, ICoreWebView2_13, COREWEBVIEW2_PERMISSION_KIND_MICROPHONE,
        COREWEBVIEW2_PERMISSION_STATE_ALLOW,
    };
    use webview2_com::SetPermissionStateCompletedHandler;
    use windows::core::{HSTRING, Interface};

    // SAFETY: `controller` 由当前窗口的 WebView2 持有，本函数运行在主线程，窗口在 with_webview 期间存活。
    let controller = webview.controller();
    let core = unsafe { controller.CoreWebView2() }
        .map_err(|err| format!("取 CoreWebView2 失败: {err}"))?;
    // `Profile` 只挂在 ICoreWebView2_13 上（SDK 1.0.1210.39 / Runtime 101 引入）。
    // 更老的运行时上 `cast` 返回 E_NOINTERFACE，这里转成 Err 返回给调用方：
    // 沿着 with_webview 闭包 → mpsc → allow_microphone 的 Err 通道走，不 panic、不阻塞启动。
    let core: ICoreWebView2_13 = core.cast().map_err(|_| {
        "当前 WebView2 运行时缺少 ICoreWebView2_13（需要 Runtime 101 / 1.0.1210.39 及以上）"
            .to_string()
    })?;
    let profile = unsafe { core.Profile() }.map_err(|err| format!("取 CoreWebView2Profile 失败: {err}"))?;
    // SetPermissionState 在 ICoreWebView2Profile4 上（SDK 1.0.1661.34 / Runtime 111 引入）；
    // 运行时 101–110 能过上一级 cast 但过不了这一级，同样按 Err 降级。
    let profile: ICoreWebView2Profile4 = profile.cast().map_err(|_| {
        "当前 WebView2 运行时缺少 SetPermissionState（需要 Runtime 111 / 1.0.1661.34 及以上）"
            .to_string()
    })?;

    let origin = HSTRING::from(origin);
    let handler = SetPermissionStateCompletedHandler::create(Box::new(move |result| {
        let _ = sender.send(result.map_err(|err| format!("WebView2 写入麦克风权限失败: {err}")));
        Ok(())
    }));
    // SAFETY: 参数是当前 profile 的合法 origin 与已构造好的完成回调，回调所有权交给 WebView2。
    unsafe {
        profile
            .SetPermissionState(
                COREWEBVIEW2_PERMISSION_KIND_MICROPHONE,
                &origin,
                COREWEBVIEW2_PERMISSION_STATE_ALLOW,
                &handler,
            )
            .map_err(|err| format!("调用 SetPermissionState 失败: {err}"))?;
    }
    Ok(())
}

#[cfg(not(target_os = "windows"))]
fn apply(
    _webview: &tauri::webview::PlatformWebview,
    _origin: &str,
    _sender: mpsc::Sender<Result<(), String>>,
) -> Result<(), String> {
    Err("只有 Windows 的 WebView2 需要这一层站点权限".to_string())
}
