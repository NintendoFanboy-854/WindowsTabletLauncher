using System.Net;
using System.Net.Http;
using System.Text.Json;

namespace WeatherPlugin;

/// <summary>
/// 和风天气 HTTP 基础层。
/// - 认证：X-QW-Api-Key 请求头（API KEY 模式）
/// - 双轨错误解析：新版端点用 HTTP 状态码 + problem+json；v7 旧端点用 body 中的 code 字段
/// - 熔断：连续失败 >= 3 次暂停 5 分钟，避免触发和风安全策略（官方文档警告持续错误请求会被冻结账号）
/// </summary>
public sealed class QWeatherClient
{
    static readonly HttpClient Http = CreateHttp();

    readonly Func<string> _hostProvider;
    readonly Func<string> _keyProvider;
    readonly Action<string>? _log;
    readonly Action<string>? _logError;

    int _consecutiveFailures;
    DateTimeOffset _blockedUntil = DateTimeOffset.MinValue;
    readonly object _breakerLock = new();

    /// <summary>用户修改配置（如 API Key）后调用，立即解除熔断。</summary>
    public void ResetBreaker()
    {
        lock (_breakerLock)
        {
            _consecutiveFailures = 0;
            _blockedUntil = DateTimeOffset.MinValue;
        }
    }

    public bool IsBlocked { get { lock (_breakerLock) return DateTimeOffset.Now < _blockedUntil; } }

    static HttpClient CreateHttp()
    {
        var handler = new HttpClientHandler
        {
            AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
        };
        return new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(10) };
    }

    public QWeatherClient(Func<string> hostProvider, Func<string> keyProvider,
        Action<string>? log = null, Action<string>? logError = null)
    {
        _hostProvider = hostProvider;
        _keyProvider = keyProvider;
        _log = log;
        _logError = logError;
    }

    string NormalizeHost(string raw)
    {
        var host = raw.Trim().TrimEnd('/');
        if (host.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            host = host["https://".Length..];
        else if (host.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
            host = host["http://".Length..];
        return host.TrimEnd('/');
    }

    public string BuildUrl(string path, IReadOnlyDictionary<string, string?>? query = null)
    {
        var host = NormalizeHost(_hostProvider() ?? "");
        var sb = new System.Text.StringBuilder("https://").Append(host).Append(path);
        if (query is { Count: > 0 })
        {
            sb.Append('?');
            bool first = true;
            foreach (var (k, v) in query)
            {
                if (string.IsNullOrEmpty(v)) continue;
                if (!first) sb.Append('&');
                sb.Append(k).Append('=').Append(Uri.EscapeDataString(v!));
                first = false;
            }
        }
        return sb.ToString();
    }

    /// <summary>发送 GET 并反序列化。checkV7Code=true 时按 v7 旧协议解析 body.code。</summary>
    public async Task<T?> GetAsync<T>(string path, IReadOnlyDictionary<string, string?>? query = null,
        bool checkV7Code = false) where T : class
    {
        var key = (_keyProvider() ?? "").Trim();
        if (string.IsNullOrWhiteSpace(key))
            throw new QWeatherApiException(0, "未配置 API Key", "请在天气插件设置中填写和风天气 API Key");
        var host = (_hostProvider() ?? "").Trim();
        if (string.IsNullOrWhiteSpace(host))
            throw new QWeatherApiException(0, "未配置 API Host", "请在天气插件设置中填写控制台分配的 API Host");

        lock (_breakerLock)
        {
            if (DateTimeOffset.Now < _blockedUntil)
                throw new QWeatherApiException(0, "请求暂停中",
                    $"连续请求失败触发熔断，暂停至 {_blockedUntil.LocalDateTime:HH:mm:ss}；在设置中保存配置后立即解除");
        }

        var url = BuildUrl(path, query);
        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Get, url);
            req.Headers.Add("X-QW-Api-Key", key);
            using var resp = await Http.SendAsync(req).ConfigureAwait(false);
            var body = await resp.Content.ReadAsStringAsync().ConfigureAwait(false);

            if (!resp.IsSuccessStatusCode)
            {
                var ex = ParseProblem(resp.StatusCode, body);
                throw ex;
            }

            if (checkV7Code && !string.IsNullOrEmpty(body))
            {
                var code = TryReadV7Code(body);
                if (code is not (null or "200"))
                    throw new QWeatherApiException(V7HttpStatus(code), $"v7 错误码 {code}", V7CodeHint(code));
            }

            lock (_breakerLock)
            {
                _consecutiveFailures = 0;
                _blockedUntil = DateTimeOffset.MinValue;
            }
            if (typeof(T) == typeof(string)) return (T)(object)body;
            return string.IsNullOrEmpty(body) ? null : JsonSerializer.Deserialize<T>(body, JsonOpts);
        }
        catch (QWeatherApiException ex)
        {
            // 402/403/404 属于配额、权限或数据缺失，不计入熔断；401 计入以保护账号，
            // 但用户在设置中保存配置后会调用 ResetBreaker 立即解除
            if (ex.StatusCode is not (402 or 403 or 404))
                TrackFailure();
            throw;
        }
        catch (Exception ex)
        {
            TrackFailure();
            _logError?.Invoke($"QWeather: request failed {path} ({ex.Message})");
            throw new QWeatherApiException(0, "网络错误", ex.Message);
        }
    }

    void TrackFailure()
    {
        _consecutiveFailures++;
        if (_consecutiveFailures >= 3)
        {
            _blockedUntil = DateTimeOffset.Now.AddMinutes(5);
            _consecutiveFailures = 0;
            _logError?.Invoke("QWeather: 连续失败，熔断 5 分钟");
        }
    }

    static QWeatherApiException ParseProblem(HttpStatusCode status, string body)
    {
        int code = (int)status;
        try
        {
            var problem = JsonSerializer.Deserialize<QProblemError>(body, JsonOpts);
            if (problem?.Error != null)
            {
                var st = problem.Error.Status is > 0 ? (int)problem.Error.Status : code;
                return new QWeatherApiException(st, problem.Error.Title ?? "请求失败", problem.Error.Detail);
            }
        }
        catch { /* fall through */ }
        return new QWeatherApiException(code, $"HTTP {code}", Truncate(body, 200));
    }

    static string? TryReadV7Code(string body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                doc.RootElement.TryGetProperty("code", out var c))
                return c.ValueKind == JsonValueKind.String ? c.GetString() : c.ToString();
        }
        catch { }
        return null;
    }

    static int V7HttpStatus(string code) => code switch
    {
        "204" => 204,
        "400" => 400,
        "401" => 401,
        "402" => 402,
        "403" => 403,
        "404" => 404,
        "429" => 429,
        "500" => 500,
        _ => 400
    };

    static string V7CodeHint(string code) => code switch
    {
        "204" => "请求成功，但你查询的地区暂时没有你需要的数据",
        "400" => "请求错误，可能缺少必选参数或参数格式不正确",
        "401" => "认证失败，请检查 API Key 与 API Host",
        "402" => "超过访问次数/余额不足",
        "403" => "无访问权限，或不支持的地理位置",
        "404" => "查询的数据或地区不存在",
        "429" => "超过限定的每分钟访问次数（QPM），请稍后再试",
        "500" => "和风天气服务端错误",
        _ => "请求失败"
    };

    static string Truncate(string s, int max) => s.Length <= max ? s : s[..max] + "…";

    static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true, NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString };
}
