using System.Collections.Concurrent;
using System.Globalization;
using System.Text.Json;
using Microsoft.UI.Dispatching;
using PluginContract;
using Windows.Devices.Geolocation;

namespace WeatherPlugin;

public sealed class QLocation
{
    public string Id = "";
    public string Name = "";
    public string Adm1 = "";
    public string Adm2 = "";
    public string Country = "";
    public double Lat;
    public double Lon;

    public bool IsChina =>
        Country.Contains("中国", StringComparison.OrdinalIgnoreCase) ||
        Country.Contains("China", StringComparison.OrdinalIgnoreCase);

    public string DisplayName => string.IsNullOrEmpty(Adm1) || Adm1 == Name ? Name : $"{Adm1} {Name}";

    public static QLocation FromGeo(QGeoLocation g)
    {
        double.TryParse(g.Lat, NumberStyles.Float, CultureInfo.InvariantCulture, out var lat);
        double.TryParse(g.Lon, NumberStyles.Float, CultureInfo.InvariantCulture, out var lon);
        return new QLocation
        {
            Id = g.Id ?? "",
            Name = g.Name ?? "",
            Adm1 = g.Adm1 ?? "",
            Adm2 = g.Adm2 ?? "",
            Country = g.Country ?? "",
            Lat = lat,
            Lon = lon
        };
    }
}

/// <summary>
/// 和风天气业务层：22 个端点 + 每类数据独立 TTL 缓存 + 位置解析（IP 定位 → 系统定位 fallback）+ 预警通知去重。
/// 免费额度（每月 5 万次）保障：常规刷新每天约 100-150 次请求，月用量约 4,000 次。
/// </summary>
public sealed class QWeatherService
{
    public const string PluginId = "WeatherPlugin";

    // config keys
    public const string KeyHost = "api_host";
    public const string KeyApiKey = "api_key";
    public const string KeyLang = "lang";
    public const string KeyLocMode = "location_mode";
    public const string KeyLocId = "location_id";
    public const string KeyLocName = "location_name";
    public const string KeyLocAdm1 = "location_adm1";
    public const string KeyLocAdm2 = "location_adm2";
    public const string KeyLocLat = "location_lat";
    public const string KeyLocLon = "location_lon";
    public const string KeyLocCountry = "location_country";
    public const string KeyFavorites = "favorites";
    public const string KeyRefreshMin = "refresh_min";
    public const string KeyNotifyAlerts = "notify_alerts";
    public const string KeyNotifiedAlerts = "notified_alerts";

    static readonly TimeSpan TtlCurrent = TimeSpan.FromMinutes(30);
    static readonly TimeSpan TtlAlert = TimeSpan.FromMinutes(15);
    static readonly TimeSpan TtlMinutely = TimeSpan.FromMinutes(15);
    static readonly TimeSpan TtlHourly = TimeSpan.FromHours(1);
    static readonly TimeSpan TtlAir = TimeSpan.FromHours(1);
    static readonly TimeSpan TtlDaily = TimeSpan.FromHours(3);
    static readonly TimeSpan TtlIndices = TimeSpan.FromHours(6);
    static readonly TimeSpan TtlAstro = TimeSpan.FromHours(24);
    static readonly TimeSpan TtlHistory = TimeSpan.FromHours(24);
    static readonly TimeSpan TtlGeo = TimeSpan.FromHours(1);
    static readonly TimeSpan TtlTopCity = TimeSpan.FromHours(24);
    static readonly TimeSpan TtlIp = TimeSpan.FromHours(6);

    static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(8) };

    readonly IHostHandle _host;
    readonly DispatcherQueue _dispatcher;
    public QWeatherClient Client { get; }
    readonly Action<string>? _logError;

    readonly ConcurrentDictionary<string, (object Value, DateTimeOffset ExpiresAt)> _cache = new();

    (double Lat, double Lon)? _ipCoords;
    DateTimeOffset _ipCoordsUntil = DateTimeOffset.MinValue;

    public QWeatherService(IHostHandle host, DispatcherQueue dispatcher, Action<string>? logError = null)
    {
        _host = host;
        _dispatcher = dispatcher;
        _logError = logError;
        Client = new QWeatherClient(
            () => GetConfig(KeyHost),
            () => GetConfig(KeyApiKey),
            logError);
    }

    /// <summary>lang 参数（新版 API 大小写敏感：zh / zh-hant / en …，统一转小写防呆）。</summary>
    public string Lang
    {
        get
        {
            var l = GetConfig(KeyLang);
            return string.IsNullOrWhiteSpace(l) ? "zh" : l.Trim().ToLowerInvariant();
        }
    }

    public string GetConfig(string key) => _host.GetConfig(PluginId, key) ?? "";
    public void SetConfig(string key, string value) => _host.SetConfig(PluginId, key, value);

    // ---- cache ----

    async Task<T?> CachedAsync<T>(string key, TimeSpan ttl, Func<Task<T?>> fetch) where T : class
    {
        if (_cache.TryGetValue(key, out var hit) && hit.ExpiresAt > DateTimeOffset.Now)
            return (T)hit.Value;

        try
        {
            var value = await fetch().ConfigureAwait(false);
            if (value != null)
                _cache[key] = (value, DateTimeOffset.Now.Add(ttl));
            return value;
        }
        catch (QWeatherApiException ex) when (ex.StatusCode is 401 or 402 || (ex.StatusCode == 0 && ex.Title?.StartsWith("未配置") == true))
        {
            // 配置类错误（Key 未填/无效/超额）不回退旧缓存，让用户看到真实错误以便修复
            throw;
        }
        catch
        {
            // 网络/服务端失败时返回过期缓存（若有），提升可用性
            if (_cache.TryGetValue(key, out var stale))
                return (T)stale.Value;
            throw;
        }
    }

    public void ClearCache() => _cache.Clear();

    /// <summary>仅读取内存缓存中的实况（不发网络请求），供 agent 状态快照使用；超过 6 小时的陈旧数据不再注入。</summary>
    public QCurrentWeather? TryGetCachedCurrent(QLocation loc) =>
        _cache.TryGetValue($"cur:{loc.Id}", out var hit) &&
        hit.ExpiresAt > DateTimeOffset.Now - TimeSpan.FromHours(6)
            ? hit.Value as QCurrentWeather
            : null;

    // ---- coordinate helpers ----

    static string Fmt(double v) => v.ToString("0.##", CultureInfo.InvariantCulture);
    static string LonLat(QLocation l) => $"{Fmt(l.Lon)},{Fmt(l.Lat)}";

    Dictionary<string, string?> BaseQuery(string? lang = null) =>
        new() { ["lang"] = lang ?? Lang };

    // ---- 位置解析 ----

    public QLocation? GetLastKnownLocation()
    {
        var id = GetConfig(KeyLocId);
        if (string.IsNullOrWhiteSpace(id)) return null;
        double.TryParse(GetConfig(KeyLocLat), NumberStyles.Float, CultureInfo.InvariantCulture, out var lat);
        double.TryParse(GetConfig(KeyLocLon), NumberStyles.Float, CultureInfo.InvariantCulture, out var lon);
        return new QLocation
        {
            Id = id,
            Name = GetConfig(KeyLocName),
            Adm1 = GetConfig(KeyLocAdm1),
            Adm2 = GetConfig(KeyLocAdm2),
            Country = GetConfig(KeyLocCountry),
            Lat = lat,
            Lon = lon
        };
    }

    void PersistLocation(QLocation loc)
    {
        SetConfig(KeyLocId, loc.Id);
        SetConfig(KeyLocName, loc.Name);
        SetConfig(KeyLocAdm1, loc.Adm1);
        SetConfig(KeyLocAdm2, loc.Adm2);
        SetConfig(KeyLocCountry, loc.Country);
        SetConfig(KeyLocLat, Fmt(loc.Lat));
        SetConfig(KeyLocLon, Fmt(loc.Lon));
    }

    /// <summary>
    /// 解析当前应显示的位置。auto 模式（默认，含未设置）：IP 定位（失败 fallback 系统定位）→ GeoAPI 反查；
    /// manual 模式：读配置。结果按"IP 坐标"缓存 6 小时，跨城（如澳门→珠海）IP 变化后自动重新反查。
    /// </summary>
    public async Task<QLocation?> ResolveCurrentAsync(bool force = false)
    {
        var mode = GetConfig(KeyLocMode);
        if (mode == "manual")
            return GetLastKnownLocation();

        var (lat, lon, source) = await GetAutoCoordsAsync().ConfigureAwait(false);
        if (source == null)
        {
            _host.Log("QWeather: auto location failed (ip + system geolocation), falling back to last-known");
            return GetLastKnownLocation();
        }

        var cacheKey = $"loc:auto:{Fmt(lat)},{Fmt(lon)}";
        if (!force && _cache.TryGetValue(cacheKey, out var hit) && hit.ExpiresAt > DateTimeOffset.Now)
            return (QLocation)hit.Value;

        var geo = await Client.GetAsync<QGeoLookupResponse>("/geo/v2/city/lookup", new Dictionary<string, string?>
        {
            ["location"] = $"{Fmt(lon)},{Fmt(lat)}",
            ["number"] = "1",
            ["lang"] = Lang
        }).ConfigureAwait(false);

        var first = geo?.Location is { Count: > 0 } list ? list[0] : null;
        if (first?.Id == null)
        {
            _host.Log($"QWeather: geo reverse lookup returned no result for {Fmt(lon)},{Fmt(lat)}");
            return GetLastKnownLocation();
        }

        var loc = QLocation.FromGeo(first);
        PersistLocation(loc);
        _cache[cacheKey] = (loc, DateTimeOffset.Now.Add(TtlIp));
        _host.Log($"QWeather: auto location resolved via {source}: {loc.DisplayName} ({loc.Id})");
        return loc;
    }

    /// <summary>自动定位：ipwho.is 优先，失败 fallback Windows 系统定位。返回 (lat, lon, 来源)。</summary>
    async Task<(double, double, string?)> GetAutoCoordsAsync()
    {
        if (_ipCoords.HasValue && DateTimeOffset.Now < _ipCoordsUntil)
            return (_ipCoords.Value.Item1, _ipCoords.Value.Item2, "ip-cache");

        var viaIp = await TryIpWhoIsAsync().ConfigureAwait(false);
        if (viaIp.HasValue)
        {
            _ipCoords = viaIp;
            _ipCoordsUntil = DateTimeOffset.Now.Add(TtlIp);
            return (viaIp.Value.Item1, viaIp.Value.Item2, "ipwho.is");
        }

        var viaGeo = await TrySystemLocationAsync();
        if (viaGeo.HasValue)
        {
            _ipCoords = viaGeo;
            _ipCoordsUntil = DateTimeOffset.Now.Add(TtlIp);
            return (viaGeo.Value.Item1, viaGeo.Value.Item2, "system");
        }

        return (0, 0, null);
    }

    async Task<(double, double)?> TryIpWhoIsAsync()
    {
        try
        {
            var json = await Http.GetStringAsync("https://ipwho.is/").ConfigureAwait(false);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (root.TryGetProperty("success", out var ok) && ok.ValueKind == JsonValueKind.False)
                return null;
            if (!root.TryGetProperty("latitude", out var latEl) ||
                !root.TryGetProperty("longitude", out var lonEl))
                return null;
            var lat = latEl.GetDouble();
            var lon = lonEl.GetDouble();
            return (lat, lon);
        }
        catch (Exception ex)
        {
            _logError?.Invoke($"QWeather: ipwho.is failed ({ex.Message})");
            return null;
        }
    }

    /// <summary>Windows 系统定位。RequestAccessAsync 必须在 UI 线程调用，因此整体调度到 dispatcher 上执行。</summary>
    async Task<(double, double)?> TrySystemLocationAsync()
    {
        var tcs = new TaskCompletionSource<(double, double)?>(TaskCreationOptions.RunContinuationsAsynchronously);
        async void Run()
        {
            try
            {
                // 在 UI 线程上直接 await，确保 RequestAccessAsync 满足线程要求
                var access = await Geolocator.RequestAccessAsync();
                if (access != GeolocationAccessStatus.Allowed)
                {
                    tcs.TrySetResult(null);
                    return;
                }
                var gl = new Geolocator { DesiredAccuracy = PositionAccuracy.Default };
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
                var pos = await gl.GetGeopositionAsync().AsTask(cts.Token);
                var p = pos.Coordinate.Point.Position;
                tcs.TrySetResult((p.Latitude, p.Longitude));
            }
            catch (Exception ex)
            {
                _logError?.Invoke($"QWeather: system geolocation failed ({ex.Message})");
                tcs.TrySetResult(null);
            }
        }

        if (_dispatcher.HasThreadAccess) Run();
        else if (!_dispatcher.TryEnqueue(() => Run())) tcs.TrySetResult(null);

        try { return await tcs.Task.WaitAsync(TimeSpan.FromSeconds(15)).ConfigureAwait(false); }
        catch { return null; }
    }

    // ---- GeoAPI ----

    public async Task<List<QGeoLocation>> SearchLocationsAsync(string keyword, string? adm = null,
        string? range = null, int number = 10)
    {
        var key = $"geo:{keyword}|{adm}|{range}|{number}|{Lang}";
        return await CachedAsync<List<QGeoLocation>>(key, TtlGeo, async () =>
        {
            var resp = await Client.GetAsync<QGeoLookupResponse>("/geo/v2/city/lookup", new Dictionary<string, string?>
            {
                ["location"] = keyword,
                ["adm"] = adm,
                ["range"] = range,
                ["number"] = number.ToString(),
                ["lang"] = Lang
            }).ConfigureAwait(false);
            return resp?.Location ?? new List<QGeoLocation>();
        }).ConfigureAwait(false) ?? new List<QGeoLocation>();
    }

    public async Task<List<QGeoLocation>> GetTopCitiesAsync(string range = "cn", int number = 10)
    {
        var key = $"top:{range}|{number}|{Lang}";
        return await CachedAsync<List<QGeoLocation>>(key, TtlTopCity, async () =>
        {
            var resp = await Client.GetAsync<QGeoTopResponse>("/geo/v2/city/top", new Dictionary<string, string?>
            {
                ["range"] = range,
                ["number"] = number.ToString(),
                ["lang"] = Lang
            }).ConfigureAwait(false);
            return resp?.TopCityList ?? new List<QGeoLocation>();
        }).ConfigureAwait(false) ?? new List<QGeoLocation>();
    }

    public async Task<List<QGeoLocation>> SearchPoisAsync(QLocation loc, string type, string? city = null, int number = 10)
    {
        var key = $"poilk:{loc.Id}|{type}|{city}|{number}|{Lang}";
        return await CachedAsync<List<QGeoLocation>>(key, TtlGeo, async () =>
        {
            // 实测：location 传 LocationID 会报 no-such-location，需用坐标
            var resp = await Client.GetAsync<QGeoPoiResponse>("/geo/v2/poi/lookup", new Dictionary<string, string?>
            {
                ["location"] = LonLat(loc),
                ["type"] = type,
                ["city"] = city,
                ["number"] = number.ToString(),
                ["lang"] = Lang
            }).ConfigureAwait(false);
            return resp?.Poi ?? new List<QGeoLocation>();
        }).ConfigureAwait(false) ?? new List<QGeoLocation>();
    }

    public async Task<List<QGeoLocation>> SearchPoiRangeAsync(QLocation loc, string type, int radiusKm = 5, int number = 20)
    {
        var key = $"poirg:{loc.Id}|{type}|{radiusKm}|{number}|{Lang}";
        return await CachedAsync<List<QGeoLocation>>(key, TtlGeo, async () =>
        {
            var resp = await Client.GetAsync<QGeoPoiResponse>("/geo/v2/poi/range", new Dictionary<string, string?>
            {
                ["location"] = LonLat(loc),
                ["type"] = type,
                ["radius"] = Math.Clamp(radiusKm, 1, 50).ToString(),
                ["number"] = Math.Clamp(number, 1, 20).ToString(),
                ["lang"] = Lang
            }).ConfigureAwait(false);
            return resp?.Poi ?? new List<QGeoLocation>();
        }).ConfigureAwait(false) ?? new List<QGeoLocation>();
    }

    // ---- 天气预报 v1（坐标）----

    public Task<QCurrentWeather?> GetCurrentAsync(QLocation loc) =>
        CachedAsync<QCurrentWeather>($"cur:{loc.Id}", TtlCurrent, () =>
            Client.GetAsync<QCurrentWeather>($"/weather/v1/current/{Fmt(loc.Lat)}/{Fmt(loc.Lon)}",
                new Dictionary<string, string?> { ["localTime"] = "true", ["lang"] = Lang }));

    public Task<QDailyWeather?> GetDailyAsync(QLocation loc, int days = 7)
    {
        var d = Math.Clamp(days, 1, 10);
        return CachedAsync<QDailyWeather>($"daily:{loc.Id}:{d}", TtlDaily, () =>
            Client.GetAsync<QDailyWeather>($"/weather/v1/daily/{Fmt(loc.Lat)}/{Fmt(loc.Lon)}",
                new Dictionary<string, string?> { ["days"] = d.ToString(), ["localTime"] = "true", ["lang"] = Lang }));
    }

    public Task<QHourlyWeather?> GetHourlyAsync(QLocation loc, int hours = 24)
    {
        var h = Math.Clamp(hours, 1, 240);
        return CachedAsync<QHourlyWeather>($"hourly:{loc.Id}:{h}", TtlHourly, () =>
            Client.GetAsync<QHourlyWeather>($"/weather/v1/hourly/{Fmt(loc.Lat)}/{Fmt(loc.Lon)}",
                new Dictionary<string, string?> { ["hours"] = h.ToString(), ["localTime"] = "true", ["lang"] = Lang }));
    }

    // ---- 天气预报 v7（LocationID 城市端点）----

    public Task<QV7NowResponse?> GetCityNowAsync(QLocation loc) =>
        CachedAsync<QV7NowResponse>($"v7now:{loc.Id}", TtlCurrent, () =>
            Client.GetAsync<QV7NowResponse>("/v7/weather/now", new Dictionary<string, string?>
            {
                ["location"] = loc.Id,
                ["lang"] = Lang,
                ["unit"] = "m"
            }, checkV7Code: true));

    public Task<QV7DailyResponse?> GetCityDailyAsync(QLocation loc, int days)
    {
        var d = days switch { <= 3 => 3, <= 7 => 7, <= 10 => 10, <= 15 => 15, _ => 30 };
        return CachedAsync<QV7DailyResponse>($"v7daily:{loc.Id}:{d}", TtlDaily, () =>
            Client.GetAsync<QV7DailyResponse>($"/v7/weather/{d}d", new Dictionary<string, string?>
            {
                ["location"] = loc.Id,
                ["lang"] = Lang,
                ["unit"] = "m"
            }, checkV7Code: true));
    }

    public Task<QV7HourlyResponse?> GetCityHourlyAsync(QLocation loc, int hours)
    {
        var h = hours switch { <= 24 => 24, <= 72 => 72, _ => 168 };
        return CachedAsync<QV7HourlyResponse>($"v7hourly:{loc.Id}:{h}", TtlHourly, () =>
            Client.GetAsync<QV7HourlyResponse>($"/v7/weather/{h}h", new Dictionary<string, string?>
            {
                ["location"] = loc.Id,
                ["lang"] = Lang,
                ["unit"] = "m"
            }, checkV7Code: true));
    }

    // ---- 分钟预报（仅中国）----

    public Task<QV7MinutelyResponse?> GetMinutelyAsync(QLocation loc) =>
        CachedAsync<QV7MinutelyResponse>($"minutely:{loc.Id}", TtlMinutely, () =>
            Client.GetAsync<QV7MinutelyResponse>("/v7/minutely/5m", new Dictionary<string, string?>
            {
                ["location"] = LonLat(loc),
                ["lang"] = Lang
            }, checkV7Code: true));

    // ---- 预警 ----

    public async Task<List<QAlert>> GetAlertsAsync(QLocation loc) =>
        await CachedAsync<List<QAlert>>($"alert:{loc.Id}", TtlAlert, async () =>
        {
            var resp = await Client.GetAsync<QAlertResponse>(
                $"/weatheralert/v1/current/{Fmt(loc.Lat)}/{Fmt(loc.Lon)}",
                new Dictionary<string, string?> { ["localTime"] = "true", ["lang"] = Lang })
                .ConfigureAwait(false);
            var alerts = resp?.Alerts ?? new List<QAlert>();
            MaybeNotifyAlerts(alerts);
            return alerts;
        }).ConfigureAwait(false) ?? new List<QAlert>();

    void MaybeNotifyAlerts(List<QAlert> alerts)
    {
        if (GetConfig(KeyNotifyAlerts) == "false") return;
        if (alerts.Count == 0) return;

        List<string> toNotify = new();
        lock (_alertLock)
        {
            var notified = LoadNotifiedAlertIds();
            var added = false;
            foreach (var a in alerts)
            {
                if (string.IsNullOrEmpty(a.Id) || notified.Contains(a.Id)) continue;
                notified.Add(a.Id);
                added = true;
                if (a.MessageType?.Code == "cancel") continue;
                toNotify.Add(a.Id);
            }
            if (added)
            {
                if (notified.Count > 100) notified.RemoveRange(0, notified.Count - 100);
                SetConfig(KeyNotifiedAlerts, JsonSerializer.Serialize(notified));
            }
        }

        // ShowNotification 由宿主封送到 UI 线程，这里可在任意线程调用
        foreach (var id in toNotify)
        {
            var a = alerts.FirstOrDefault(x => x.Id == id);
            if (a == null) continue;
            var escalate = a.Severity is "severe" or "extreme";
            var title = $"天气预警：{a.EventType?.Name ?? ""} {a.Color?.Code ?? ""}".Trim();
            _host.ShowNotification(title, a.Headline ?? a.Description ?? "", escalate);
            _host.Log($"QWeather: alert notified {a.Id} severity={a.Severity}");
        }
    }

    List<string> LoadNotifiedAlertIds()
    {
        var raw = GetConfig(KeyNotifiedAlerts);
        if (string.IsNullOrWhiteSpace(raw)) return new List<string>();
        try { return JsonSerializer.Deserialize<List<string>>(raw) ?? new List<string>(); }
        catch { return new List<string>(); }
    }

    // ---- 天气指数 ----

    public async Task<List<QIndicesItem>> GetIndicesAsync(QLocation loc, int days, string types)
    {
        var d = days <= 1 ? 1 : 3;
        var key = $"indices:{loc.Id}:{d}:{types}:{Lang}";
        return await CachedAsync<List<QIndicesItem>>(key, TtlIndices, async () =>
        {
            var resp = await Client.GetAsync<QV7IndicesResponse>($"/v7/indices/{d}d", new Dictionary<string, string?>
            {
                ["type"] = types,
                ["location"] = loc.Id,
                ["lang"] = Lang
            }, checkV7Code: true).ConfigureAwait(false);
            return resp?.Daily ?? new List<QIndicesItem>();
        }).ConfigureAwait(false) ?? new List<QIndicesItem>();
    }

    // ---- 空气质量 ----

    public Task<QAirResponse?> GetAirCurrentAsync(QLocation loc) =>
        CachedAsync<QAirResponse>($"air:{loc.Id}", TtlAir, () =>
            Client.GetAsync<QAirResponse>($"/airquality/v1/current/{Fmt(loc.Lat)}/{Fmt(loc.Lon)}",
                BaseQuery()));

    public Task<QAirHourlyResponse?> GetAirHourlyAsync(QLocation loc) =>
        CachedAsync<QAirHourlyResponse>($"airh:{loc.Id}", TtlHourly, () =>
            Client.GetAsync<QAirHourlyResponse>(
                $"/airquality/v1/hourly/{Fmt(loc.Lat)}/{Fmt(loc.Lon)}", BaseQuery()));

    public Task<QAirDailyResponse?> GetAirDailyAsync(QLocation loc) =>
        CachedAsync<QAirDailyResponse>($"aird:{loc.Id}", TtlDaily, () =>
            Client.GetAsync<QAirDailyResponse>(
                $"/airquality/v1/daily/{Fmt(loc.Lat)}/{Fmt(loc.Lon)}", BaseQuery()));

    // ---- 时光机（历史，仅 LocationID）----

    public Task<QV7HistoricalResponse?> GetHistoricalAsync(QLocation loc, string dateYmd)
    {
        var key = $"hist:{loc.Id}:{dateYmd}:{Lang}";
        return CachedAsync<QV7HistoricalResponse>(key, TtlHistory, () =>
            Client.GetAsync<QV7HistoricalResponse>("/v7/historical/weather", new Dictionary<string, string?>
            {
                ["location"] = loc.Id,
                ["date"] = dateYmd,
                ["lang"] = Lang,
                ["unit"] = "m"
            }, checkV7Code: true));
    }

    // ---- 天文 ----

    public Task<QV7SunResponse?> GetSunAsync(QLocation loc, DateTime date)
    {
        var d = date.ToString("yyyyMMdd", CultureInfo.InvariantCulture);
        var key = $"sun:{loc.Id}:{d}:{Lang}";
        return CachedAsync<QV7SunResponse>(key, TtlAstro, () =>
            Client.GetAsync<QV7SunResponse>("/v7/astronomy/sun", new Dictionary<string, string?>
            {
                ["location"] = loc.Id,
                ["date"] = d,
                ["lang"] = Lang
            }, checkV7Code: true));
    }

    public Task<QV7MoonResponse?> GetMoonAsync(QLocation loc, DateTime date)
    {
        var d = date.ToString("yyyyMMdd", CultureInfo.InvariantCulture);
        var key = $"moon:{loc.Id}:{d}:{Lang}";
        return CachedAsync<QV7MoonResponse>(key, TtlAstro, () =>
            Client.GetAsync<QV7MoonResponse>("/v7/astronomy/moon", new Dictionary<string, string?>
            {
                ["location"] = loc.Id,
                ["date"] = d,
                ["lang"] = Lang
            }, checkV7Code: true));
    }

    public Task<QV7SolarAngleResponse?> GetSolarElevationAsync(QLocation loc, DateTime whenLocal, double altitudeMeters)
    {
        var tz = loc.Lat == 0 && loc.Lon == 0 ? "0800" : TzOffset(loc);
        return Client.GetAsync<QV7SolarAngleResponse>("/v7/astronomy/solar-elevation-angle", new Dictionary<string, string?>
        {
            ["location"] = LonLat(loc),
            ["date"] = whenLocal.ToString("yyyyMMdd", CultureInfo.InvariantCulture),
            ["time"] = whenLocal.ToString("HHmm", CultureInfo.InvariantCulture),
            ["tz"] = tz,
            ["alt"] = Math.Round(altitudeMeters).ToString(CultureInfo.InvariantCulture)
        }, checkV7Code: true);
    }

    /// <summary>用经度估算 UTC 偏移（粗略，格式 ±HHMM），满足 API 的 tz 参数要求。</summary>
    static string TzOffset(QLocation loc)
    {
        var offsetHours = Math.Round(loc.Lon / 15.0);
        var sign = offsetHours < 0 ? "-" : "+";
        var abs = Math.Abs((int)offsetHours);
        return $"{sign}{abs:00}00";
    }

    // ---- 收藏与手动定位 ----

    readonly object _favLock = new();
    readonly object _alertLock = new();

    public List<(string Id, string Name)> GetFavorites()
    {
        lock (_favLock)
        {
            var raw = GetConfig(KeyFavorites);
            if (string.IsNullOrWhiteSpace(raw)) return new List<(string, string)>();
            try
            {
                var list = JsonSerializer.Deserialize<List<FavoriteEntry>>(raw) ?? new List<FavoriteEntry>();
                return list.Where(f => !string.IsNullOrEmpty(f.Id)).Select(f => (f.Id!, f.Name ?? f.Id!)).ToList();
            }
            catch { return new List<(string, string)>(); }
        }
    }

    public void AddFavorite(string id, string name)
    {
        if (string.IsNullOrWhiteSpace(id)) return;
        lock (_favLock)
        {
            var list = GetFavorites();
            if (list.Any(f => f.Id == id)) return;
            list.Add((id, string.IsNullOrWhiteSpace(name) ? id : name));
            SaveFavorites(list);
        }
    }

    public void RemoveFavorite(string id)
    {
        lock (_favLock)
        {
            var list = GetFavorites();
            list.RemoveAll(f => f.Id == id);
            SaveFavorites(list);
        }
    }

    void SaveFavorites(List<(string Id, string Name)> list) =>
        SetConfig(KeyFavorites, JsonSerializer.Serialize(
            list.Select(f => new FavoriteEntry { Id = f.Id, Name = f.Name }).ToList()));

    /// <summary>设置手动定位（设置页/agent 共用），写入后清空缓存立即生效。</summary>
    public void SetManualLocation(QLocation loc)
    {
        SetConfig(KeyLocMode, "manual");
        PersistLocation(loc);
        ClearCache();
    }

    public void SetAutoLocation()
    {
        SetConfig(KeyLocMode, "auto");
        SetConfig(KeyLocId, "");
        ClearCache();
    }

    public int RefreshMinutes =>
        int.TryParse(GetConfig(KeyRefreshMin), out var v) && v >= 15 ? v : 30;

    public sealed class FavoriteEntry
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
    }

    // ---- 控制台 API（需在控制台为凭据开通权限）----

    public Task<QFinanceSummary?> GetFinanceSummaryAsync() =>
        Client.GetAsync<QFinanceSummary>("/finance/v1/summary");

    public Task<QMetricsStats?> GetStatsAsync() =>
        Client.GetAsync<QMetricsStats>("/metrics/v1/stats");

    /// <summary>最近 24 小时成功请求总量（用于免费额度监控）。</summary>
    public static double SumHours(List<QMetricSeries>? series) =>
        series?.Sum(s => s.Hours?.Sum() ?? 0) ?? 0;
}
