//! 壁纸纹理的代取，给桌面上的「液态玻璃」当折射源。
//!
//! 为什么必须在 Rust 侧跑：WebGL 的 `texImage2D` 要求图片同源。必应图片走
//! `<img src>` 显示没问题，但把它喂给 WebGL 会因为缺 `Access-Control-Allow-Origin`
//! 被浏览器拒绝（跨源图片会污染纹理）。这里把字节取回来编码成 data URL，
//! 前端拿到的是一个同源 data URL，纹理就能正常上传。
//!
//! 只接受必应域名的 https 地址：这个命令的作用是「取一张壁纸」，
//! 不该变成任意地址的下载器。
//!
//! 不引第三方 base64 crate：编码器在 `media_session` 里已有一份（封面用），复用。

use std::sync::OnceLock;
use std::time::Duration;

use crate::media_session::base64_encode;
use crate::CmdResult;

use reqwest::header::{ACCEPT, CONTENT_TYPE};

/// 桌面 Chrome UA：与 `bingarchive.rs` / `iplocate.rs` 同一策略。
const UA: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const TOTAL_TIMEOUT: Duration = Duration::from_secs(30);
const CONNECT_TIMEOUT: Duration = Duration::from_secs(15);

/// 上限 16MB：4K 原图也就 2–5MB，超过这个量级说明拿到的不是壁纸。
const MAX_BYTES: usize = 16 * 1024 * 1024;

fn client() -> Option<&'static reqwest::Client> {
    static CLIENT: OnceLock<Option<reqwest::Client>> = OnceLock::new();
    CLIENT
        .get_or_init(|| {
            match reqwest::Client::builder()
                .user_agent(UA)
                .timeout(TOTAL_TIMEOUT)
                .connect_timeout(CONNECT_TIMEOUT)
                .build()
            {
                Ok(client) => Some(client),
                Err(error) => {
                    log::warn!("壁纸纹理 HTTP 客户端初始化失败: {error}");
                    None
                }
            }
        })
        .as_ref()
}

/// 取一张必应壁纸，返回 `data:<mime>;base64,...`。
///
/// 失败一律 `Err(String)`：调用方（`LiquidGlassLayer`）会退回到「不开玻璃」，
/// 底图仍然由 `<img>` 正常显示，不影响桌面。
#[tauri::command]
pub async fn fetch_wallpaper_texture(url: String) -> CmdResult<String> {
    let parsed = reqwest::Url::parse(url.trim()).map_err(|error| format!("壁纸地址无法解析: {error}"))?;

    if parsed.scheme() != "https" {
        return Err("壁纸纹理只接受 https 地址".to_string());
    }
    let host = parsed.host_str().unwrap_or_default();
    if !(host == "bing.com" || host.ends_with(".bing.com")) {
        return Err(format!("壁纸纹理只允许必应域名，收到 {host}"));
    }

    let client = client().ok_or_else(|| "壁纸纹理 HTTP 客户端不可用".to_string())?;

    let response = client
        .get(parsed)
        .header(ACCEPT, "image/*")
        .send()
        .await
        .map_err(|error| format!("取壁纸失败: {}", error.without_url()))?;

    let status = response.status();
    if !status.is_success() {
        return Err(format!("取壁纸返回 HTTP {status}"));
    }

    let mime = response
        .headers()
        .get(CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("image/jpeg")
        .to_string();

    let bytes = response
        .bytes()
        .await
        .map_err(|error| format!("读取壁纸字节失败: {}", error.without_url()))?;

    if bytes.is_empty() {
        return Err("壁纸响应为空".to_string());
    }
    if bytes.len() > MAX_BYTES {
        return Err(format!("壁纸过大（{} 字节）", bytes.len()));
    }

    Ok(format!("data:{mime};base64,{}", base64_encode(&bytes)))
}
