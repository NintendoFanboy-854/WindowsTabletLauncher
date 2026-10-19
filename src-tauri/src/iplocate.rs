//! ip.cn 网络归属地（D-16）。
//!
//! 链路（2026-10-19 实测）：
//! 1. `GET https://ip.cn/`（桌面 Chrome UA），首页内联 `var _ticket = "…"`；
//! 2. `GET https://my.ip.cn/json/?ticket=…`（同一 UA + `Referer`）→
//!    `{"status":true,"code":0,"data":{ip,country,province,city,district,isp}}`。
//!
//! 首页没有 CORS 头，WebView 里直接 `fetch` 会被拦，所以整条链路只能在 Rust 侧跑。
//! 任何一步失败都返回 `None`：插件 `ipLocate()` 的契约就是“拿不到返回 null”，
//! 由天气插件自己降级（D-16）。日志只记失败原因，不记完整 IP。

use std::fmt;
use std::sync::OnceLock;
use std::time::Duration;

use reqwest::header::REFERER;
use serde::Serialize;

/// 桌面 Chrome UA：ip.cn 对移动 UA 会返回不同页面，这里固定桌面版。
const UA: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const HOME_URL: &str = "https://ip.cn/";
const JSON_URL: &str = "https://my.ip.cn/json/";

/// 首页里 ticket 的固定前缀（实测只有这一种写法）。
const TICKET_PREFIX: &str = "var _ticket = \"";
/// `_ticket` 实测 42 位十六进制；超过这个长度一律当坏数据。
const TICKET_MAX_LEN: usize = 128;

/// 整条链路的总超时与连接超时（D-16：8s 拿不到就返回 null）。
const TOTAL_TIMEOUT: Duration = Duration::from_secs(8);
const CONNECT_TIMEOUT: Duration = Duration::from_secs(4);

/// 网络归属地：只有行政区/运营商，不含坐标。
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct IpLocation {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ip: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub province: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub district: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub isp: Option<String>,
}

/// 定位链路的失败原因，只用于 `log::warn!`；不跨进程返回（插件侧统一拿到 null）。
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum IpLocateError {
    /// 请求/响应阶段失败（网络、超时、非 2xx）
    Http(String),
    /// 首页拿到了，但 HTML 里没有合法的 `_ticket`（页面改版）
    Html,
    /// JSON 接口返回了非 JSON 文本（`auth error` / `ticket expire` / 网关错误页）
    NonJson(String),
    /// JSON 拿到了，但 `status`/`code` 表示失败
    Status(String),
    /// `data` 缺字段，或城市/省份都为空（避免返回全空位置）
    BadData,
}

impl fmt::Display for IpLocateError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Http(detail) => write!(formatter, "{detail}"),
            Self::Html => write!(
                formatter,
                "首页 HTML 里没有合法的 _ticket（ip.cn 可能已改版）"
            ),
            Self::NonJson(body) => write!(formatter, "接口返回非 JSON: {body}"),
            Self::Status(message) if message.is_empty() => {
                write!(formatter, "接口返回失败状态（status/code）")
            }
            Self::Status(message) => write!(formatter, "接口返回失败状态: {message}"),
            Self::BadData => write!(formatter, "接口 data 里没有可用的城市信息"),
        }
    }
}

impl std::error::Error for IpLocateError {}

/// 从 ip.cn 首页 HTML 里取 `_ticket`；空、超长、含空白一律当坏数据。
pub fn extract_ticket(html: &str) -> Option<String> {
    let start = html.find(TICKET_PREFIX)? + TICKET_PREFIX.len();
    let rest = &html[start..];
    let end = rest.find('"')?;
    let ticket = &rest[..end];
    if ticket.is_empty() || ticket.len() > TICKET_MAX_LEN {
        return None;
    }
    if ticket
        .chars()
        .any(|character| character.is_whitespace() || character.is_control())
    {
        return None;
    }
    Some(ticket.to_string())
}

/// 解析 `my.ip.cn/json/` 的响应体；`status == true && code == 0` 且 `data` 是对象才算成功。
pub fn parse_payload(body: &str) -> Result<IpLocation, IpLocateError> {
    let value: serde_json::Value =
        serde_json::from_str(body).map_err(|_| IpLocateError::NonJson(excerpt(body)))?;
    let object = value
        .as_object()
        .ok_or_else(|| IpLocateError::NonJson(excerpt(body)))?;

    let succeeded = object.get("status").and_then(serde_json::Value::as_bool) == Some(true)
        && object.get("code").and_then(serde_json::Value::as_i64) == Some(0);
    if !succeeded {
        let message = object
            .get("msg")
            .and_then(serde_json::Value::as_str)
            .unwrap_or_default()
            .trim()
            .to_string();
        return Err(IpLocateError::Status(message));
    }

    let data = object
        .get("data")
        .and_then(serde_json::Value::as_object)
        .ok_or(IpLocateError::BadData)?;
    let field = |key: &str| {
        data.get(key)
            .and_then(serde_json::Value::as_str)
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_string)
    };
    let location = IpLocation {
        ip: field("ip"),
        country: field("country"),
        province: field("province"),
        city: field("city"),
        district: field("district"),
        isp: field("isp"),
    };
    if location.city.is_none() && location.province.is_none() {
        return Err(IpLocateError::BadData);
    }
    Ok(location)
}

/// 整条 ip.cn 链路；失败返回 `None`（原因写日志，不影响插件）。
pub async fn locate() -> Option<IpLocation> {
    match locate_result().await {
        Ok(location) => Some(location),
        Err(error) => {
            log::warn!("网络定位失败（ipLocate 返回 null）: {error}");
            None
        }
    }
}

/// HTTP 客户端只建一次：8s 总超时、4s 连接超时、系统代理。
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
                    log::warn!("ip.cn HTTP 客户端初始化失败: {error}");
                    None
                }
            }
        })
        .as_ref()
}

async fn locate_result() -> Result<IpLocation, IpLocateError> {
    let client = client().ok_or_else(|| IpLocateError::Http("HTTP 客户端不可用".to_string()))?;
    let ticket = fetch_ticket(client).await?;
    fetch_location(client, &ticket).await
}

async fn fetch_ticket(client: &reqwest::Client) -> Result<String, IpLocateError> {
    let response = client.get(HOME_URL).send().await.map_err(|error| {
        IpLocateError::Http(format!("GET {HOME_URL} 失败: {}", error.without_url()))
    })?;
    let status = response.status();
    if !status.is_success() {
        return Err(IpLocateError::Http(format!(
            "GET {HOME_URL} 返回 HTTP {status}"
        )));
    }
    let html = response.text().await.map_err(|error| {
        IpLocateError::Http(format!("读取 {HOME_URL} 响应失败: {}", error.without_url()))
    })?;
    extract_ticket(&html).ok_or(IpLocateError::Html)
}

async fn fetch_location(
    client: &reqwest::Client,
    ticket: &str,
) -> Result<IpLocation, IpLocateError> {
    // 不用 `RequestBuilder::query`（需要 reqwest 的 query 特性）；直接拼 URL，顺手做百分号编码。
    let mut url = reqwest::Url::parse(JSON_URL)
        .map_err(|error| IpLocateError::Http(format!("解析 my.ip.cn/json URL 失败: {error}")))?;
    url.query_pairs_mut().append_pair("ticket", ticket);

    let response = client
        .get(url)
        .header(REFERER, HOME_URL)
        .send()
        .await
        // ticket 是临时凭证：错误里去掉带 query 的 URL，日志只留原因。
        .map_err(|error| {
            IpLocateError::Http(format!("GET my.ip.cn/json 失败: {}", error.without_url()))
        })?;
    let status = response.status();
    if !status.is_success() {
        return Err(IpLocateError::Http(format!(
            "GET my.ip.cn/json 返回 HTTP {status}"
        )));
    }
    let body = response.text().await.map_err(|error| {
        IpLocateError::Http(format!(
            "读取 my.ip.cn/json 响应失败: {}",
            error.without_url()
        ))
    })?;
    parse_payload(&body)
}

/// 日志里的响应摘要：压掉换行、截断到 80 字，避免把整页 HTML 灌进日志。
fn excerpt(body: &str) -> String {
    let flat = body.replace(['\r', '\n'], " ");
    let text = flat.trim();
    let mut excerpt: String = text.chars().take(80).collect();
    if text.chars().count() > 80 {
        excerpt.push('…');
    }
    excerpt
}

#[cfg(test)]
mod tests {
    use super::*;

    const HOMEPAGE: &str = r#"<html><body><script type="text/javascript">
var _ticket = "08719135f46a19506249a29bee4e08bb1792221494";
</script></body></html>"#;

    const PAYLOAD: &str = r#"{"status":true,"code":0,"msg":"ok","data":{"ip":"203.0.113.7","country":"中国","province":"澳门","city":"澳门","district":"","isp":"澳門電訊"}}"#;

    #[test]
    fn extracts_ticket_from_homepage() {
        assert_eq!(
            extract_ticket(HOMEPAGE).as_deref(),
            Some("08719135f46a19506249a29bee4e08bb1792221494")
        );
    }

    #[test]
    fn rejects_missing_ticket() {
        assert_eq!(
            extract_ticket("<html><body>no ticket here</body></html>"),
            None
        );
    }

    #[test]
    fn rejects_empty_ticket() {
        assert_eq!(extract_ticket(r#"var _ticket = "";"#), None);
    }

    #[test]
    fn rejects_ticket_with_newline() {
        assert_eq!(extract_ticket("var _ticket = \"abc\ndef\";"), None);
    }

    #[test]
    fn rejects_overlong_ticket() {
        let html = format!("var _ticket = \"{}\";", "a".repeat(TICKET_MAX_LEN + 1));
        assert_eq!(extract_ticket(&html), None);
    }

    #[test]
    fn parses_payload_and_drops_empty_fields() {
        let location = parse_payload(PAYLOAD).expect("正常响应应当解析成功");
        assert_eq!(location.ip.as_deref(), Some("203.0.113.7"));
        assert_eq!(location.country.as_deref(), Some("中国"));
        assert_eq!(location.province.as_deref(), Some("澳门"));
        assert_eq!(location.city.as_deref(), Some("澳门"));
        assert_eq!(location.district, None, "空字符串不应序列化");
        assert_eq!(location.isp.as_deref(), Some("澳門電訊"));
    }

    #[test]
    fn rejects_status_false() {
        let body = r#"{"status":false,"code":0,"msg":"auth error"}"#;
        assert!(matches!(
            parse_payload(body),
            Err(IpLocateError::Status(message)) if message == "auth error"
        ));
    }

    #[test]
    fn rejects_non_zero_code() {
        let body = r#"{"status":true,"code":1,"msg":"bad ticket"}"#;
        assert!(matches!(
            parse_payload(body),
            Err(IpLocateError::Status(message)) if message == "bad ticket"
        ));
    }

    #[test]
    fn rejects_auth_error_text() {
        assert!(
            matches!(parse_payload("auth error"), Err(IpLocateError::NonJson(body)) if body == "auth error")
        );
    }

    #[test]
    fn rejects_ticket_expire_text() {
        assert!(matches!(
            parse_payload("ticket expire"),
            Err(IpLocateError::NonJson(body)) if body == "ticket expire"
        ));
    }

    #[test]
    fn rejects_empty_data() {
        let body = r#"{"status":true,"code":0,"msg":"ok","data":{"ip":"203.0.113.7","country":"中国","province":"","city":"","district":"","isp":""}}"#;
        assert!(matches!(parse_payload(body), Err(IpLocateError::BadData)));
    }

    #[test]
    fn rejects_data_not_object() {
        let body = r#"{"status":true,"code":0,"data":"oops"}"#;
        assert!(matches!(parse_payload(body), Err(IpLocateError::BadData)));
    }

    /// 真实网络链路；默认 ignore，需要时手动跑：
    /// `cargo test live_ip_cn_chain -- --ignored --nocapture`
    #[test]
    #[ignore = "真实网络：访问 ip.cn"]
    fn live_ip_cn_chain() {
        match tauri::async_runtime::block_on(locate_result()) {
            Ok(location) => {
                // 不打印完整 IP（D-16 隐私口径）。
                println!(
                    "ip.cn 归属地: 国家={:?} 省={:?} 市={:?} 区={:?} 运营商={:?}",
                    location.country,
                    location.province,
                    location.city,
                    location.district,
                    location.isp
                );
                assert!(
                    location
                        .city
                        .as_deref()
                        .is_some_and(|city| !city.trim().is_empty()),
                    "响应里应当至少有城市名"
                );
            }
            Err(error) => panic!("ip.cn 链路失败: {error}"),
        }
    }
}
