//! 必应每日壁纸归档（`HPImageArchive.aspx`）的 Rust 侧代取。
//!
//! 为什么必须在 Rust 侧跑（2026-10-25 实测）：`https://www.bing.com/HPImageArchive.aspx?...`
//! 的响应头里没有 `Access-Control-Allow-Origin`，WebView2 里的 `fetch` 会被 CORS 拦断，
//! `wallpaper.ts` 的 `fetchJson` 只能拿到异常 → 壁纸历史为空、没有左下角说明条（0.6.0 现象）。
//! 图片本身走 `<img src>`，不受 CORS 约束，所以这里只代取 JSON 原文。
//!
//! 返回的是**原始 JSON 文本**（`String`），解析仍留在前端 `parseArchivedImage` 链路里：
//! 字段语义（`urlbase` + `_UHD.jpg`、`startdate`、`hsh`）只有前端一处解释，不在 Rust 复制一份。
//!
//! 结构与 `iplocate.rs` 一致：静态 `OnceLock` 只建一个客户端，8s 总超时 + 4s 连接超时，走系统代理。

use std::sync::OnceLock;
use std::time::Duration;

use crate::CmdResult;

use reqwest::header::ACCEPT;

/// 桌面 Chrome UA。实测无 UA 与带此 UA 都返回 200 / 5534 字节；
/// 这里显式带上，与 `iplocate.rs` 的 UA 策略保持一致，避免将来 Bing 收紧无 UA 的请求。
const UA: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const BING_ORIGIN: &str = "https://www.bing.com";
const ARCHIVE_PATH: &str = "/HPImageArchive.aspx";

/// 与前端 `REQUEST_TIMEOUT_MS`（8000）同语义：8s 拿不到就当失败，让前端走回退。
const TOTAL_TIMEOUT: Duration = Duration::from_secs(8);
const CONNECT_TIMEOUT: Duration = Duration::from_secs(4);

/// HTTP 客户端只建一次：8s 总超时、4s 连接超时、系统代理（与 `iplocate::client` 同构）。
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
                    log::warn!("必应归档 HTTP 客户端初始化失败: {error}");
                    None
                }
            }
        })
        .as_ref()
}

/// 取 `HPImageArchive.aspx?format=js&idx=&n=&mkt=` 的 JSON 原文。
///
/// URL 在 Rust 侧按固定参数重拼（前端只传 `idx` / `n` / `mkt`），不接收任意地址。
/// 失败一律返回 `Err(String)`：由前端 `fetchJson` 捕获后回退到原生 `fetch` 路径。
#[tauri::command]
pub async fn fetch_bing_archive(idx: u32, n: u32, mkt: String) -> CmdResult<String> {
    let client = client().ok_or_else(|| "必应归档 HTTP 客户端不可用".to_string())?;

    let mut url = reqwest::Url::parse(&format!("{BING_ORIGIN}{ARCHIVE_PATH}"))
        .map_err(|error| format!("解析必应归档 URL 失败: {error}"))?;
    {
        // `query_pairs_mut` 自带百分号编码；`mkt` 为空时退回 zh-CN（前端 MARKET 的默认值）。
        let market = if mkt.trim().is_empty() { "zh-CN" } else { mkt.trim() };
        let mut query = url.query_pairs_mut();
        query.append_pair("format", "js");
        query.append_pair("idx", &idx.to_string());
        query.append_pair("n", &n.to_string());
        query.append_pair("mkt", market);
    }

    let response = client
        .get(url)
        .header(ACCEPT, "application/json")
        .send()
        .await
        .map_err(|error| format!("GET {ARCHIVE_PATH} 失败: {}", error.without_url()))?;

    let status = response.status();
    if !status.is_success() {
        return Err(format!("GET {ARCHIVE_PATH} 返回 HTTP {status}"));
    }

    let body = response
        .text()
        .await
        .map_err(|error| format!("读取 {ARCHIVE_PATH} 响应失败: {}", error.without_url()))?;

    // 空 body 当失败：Bing 偶尔回 200 + 空（UA/风控），交给前端回退，不把空串当有效 JSON。
    if body.trim().is_empty() {
        return Err(format!("GET {ARCHIVE_PATH} 返回空响应体"));
    }

    Ok(body)
}
