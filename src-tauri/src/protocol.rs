//! `wtsl://<plugins-dir>/...` 自定义协议。
//!
//! Windows / Android 上 WebView 会把自定义协议映射成 `http://wtsl.localhost/<path>`，
//! macOS / Linux 是 `wtsl://localhost/<path>`。插件 iframe 用这个协议加载，
//! 于是“装到用户数据目录里的插件”和“随前端打包的插件”走同一条路径。
//!
//! 另外兜住插件页面里的绝对导入 `/plugin-sdk.js`：先找打包进前端的资源，
//! 开发模式再回退到 `public/plugin-sdk.js`（插件目录的上一级）。

use std::path::{Component, Path, PathBuf};

use tauri::http::{header, Request, Response, StatusCode};
use tauri::Manager;

use crate::plugins::PluginState;

pub const SCHEME: &str = "wtsl";

pub fn frame_base() -> String {
    if cfg!(windows) {
        format!("http://{SCHEME}.localhost")
    } else {
        format!("{SCHEME}://localhost")
    }
}

pub fn handle<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    request: &Request<Vec<u8>>,
) -> Response<Vec<u8>> {
    let decoded = match percent_encoding::percent_decode_str(request.uri().path()).decode_utf8() {
        Ok(path) => path.into_owned(),
        Err(_) => return text_response(StatusCode::BAD_REQUEST, "非法的 URL 编码"),
    };
    let relative = decoded.trim_start_matches('/');
    if relative.is_empty() {
        return text_response(StatusCode::NOT_FOUND, "缺少插件文件路径");
    }

    if relative == "plugin-sdk.js" {
        return serve_plugin_sdk(app);
    }

    let Some(relative) = safe_relative_path(relative) else {
        return text_response(StatusCode::BAD_REQUEST, "非法插件路径");
    };
    let root = app.state::<PluginState>().root.clone();
    let file = root.join(&relative);
    match std::fs::read(&file) {
        Ok(bytes) => binary_response(mime_for(&file), bytes),
        Err(err) => text_response(
            StatusCode::NOT_FOUND,
            format!("读不到插件文件 {}: {err}", file.display()),
        ),
    }
}

fn serve_plugin_sdk<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> Response<Vec<u8>> {
    if let Some(asset) = app.asset_resolver().get("plugin-sdk.js".to_string()) {
        return binary_response("text/javascript; charset=utf-8", asset.bytes);
    }
    let root = app.state::<PluginState>().root.clone();
    let candidates = [
        root.parent().map(|parent| parent.join("plugin-sdk.js")),
        Some(root.join("plugin-sdk.js")),
    ];
    for candidate in candidates.into_iter().flatten() {
        if let Ok(bytes) = std::fs::read(&candidate) {
            return binary_response("text/javascript; charset=utf-8", bytes);
        }
    }
    text_response(StatusCode::NOT_FOUND, "找不到 plugin-sdk.js")
}

fn safe_relative_path(raw: &str) -> Option<PathBuf> {
    let mut path = PathBuf::new();
    for component in Path::new(raw).components() {
        match component {
            Component::Normal(part) => path.push(part),
            Component::CurDir => {}
            Component::ParentDir | Component::RootDir | Component::Prefix(_) => return None,
        }
    }
    if path.as_os_str().is_empty() {
        None
    } else {
        Some(path)
    }
}

fn mime_for(path: &Path) -> &'static str {
    let ext = path
        .extension()
        .map(|ext| ext.to_string_lossy().to_ascii_lowercase())
        .unwrap_or_default();
    match ext.as_str() {
        "html" | "htm" => "text/html; charset=utf-8",
        "js" | "mjs" => "text/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "json" | "map" => "application/json; charset=utf-8",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "ico" => "image/x-icon",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        "otf" => "font/otf",
        "wasm" => "application/wasm",
        "txt" | "md" => "text/plain; charset=utf-8",
        "xml" => "application/xml; charset=utf-8",
        "csv" => "text/csv; charset=utf-8",
        "mp3" => "audio/mpeg",
        "wav" => "audio/wav",
        "mp4" => "video/mp4",
        "webm" => "video/webm",
        _ => "application/octet-stream",
    }
}

fn binary_response(mime: &str, body: Vec<u8>) -> Response<Vec<u8>> {
    response(StatusCode::OK, mime, body)
}

fn text_response(status: StatusCode, message: impl Into<String>) -> Response<Vec<u8>> {
    response(
        status,
        "text/plain; charset=utf-8",
        message.into().into_bytes(),
    )
}

fn response(status: StatusCode, mime: &str, body: Vec<u8>) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .header(header::CONTENT_TYPE, mime)
        .header(header::CACHE_CONTROL, "no-store")
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .body(body)
        .unwrap_or_else(|_| Response::new(b"response build error".to_vec()))
}
