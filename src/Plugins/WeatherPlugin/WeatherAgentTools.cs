using System.Globalization;
using System.Text.Json;
using PluginContract;
using SharedUtils;

namespace WeatherPlugin;

/// <summary>
/// Agent 工具层：覆盖 Docs.md 全部 10 类 API（GeoAPI 4 端点、天气 v1+v7 共 6 端点、
/// 分钟预报、预警、指数、空气质量 3 端点、时光机、天文 3 端点、控制台 2 端点）。
/// 由 WeatherPlugin 直接实现 IAgentCapability 委托到本类（HTTP 异步，无需 UI 线程）。
/// </summary>
public sealed class WeatherAgentTools
{
    readonly QWeatherService _service;
    readonly IHostHandle _host;
    readonly Action _onLocationChanged;

    public WeatherAgentTools(QWeatherService service, IHostHandle host, Action onLocationChanged)
    {
        _service = service;
        _host = host;
        _onLocationChanged = onLocationChanged;
    }

    public IReadOnlyList<AgentTool> GetTools() => new[]
    {        new AgentTool
        {
            Name = "query_weather",
            Description = "查询当前配置城市的实时天气（温度/体感/湿度/风/气压/能见度/UV 等），可选附带小时/每日/分钟降水/预警/空气/指数。",
            ParametersJsonSchema = """{"type":"object","properties":{"include":{"type":"array","items":{"type":"string","enum":["hourly","daily","minutely","alerts","air","indices"]},"description":"可选附加数据"}}}"""
        },
        new AgentTool
        {
            Name = "query_weather_by_city",
            Description = "按城市名查询天气（不改变 widget 显示的城市）。",
            ParametersJsonSchema = """{"type":"object","properties":{"city":{"type":"string"},"include":{"type":"array","items":{"type":"string"}}},"required":["city"]}"""
        },
        new AgentTool
        {
            Name = "query_forecast",
            Description = "天气预报：kind=daily(v1,1-10天)/city_daily(v7城市端点,3/7/10/15/30天)/hourly(v1,1-240小时)/city_hourly(v7,24/72/168小时)。",
            ParametersJsonSchema = """{"type":"object","properties":{"kind":{"type":"string","enum":["daily","city_daily","hourly","city_hourly"]},"days":{"type":"integer"},"hours":{"type":"integer"}},"required":["kind"]}"""
        },
        new AgentTool
        {
            Name = "query_minutely_precip",
            Description = "分钟级降水临近预报（未来2小时、5分钟粒度，仅中国地区）。",
            ParametersJsonSchema = """{"type":"object","properties":{}}"""
        },
        new AgentTool
        {
            Name = "query_alerts",
            Description = "查询当前城市正在生效的官方天气预警列表。",
            ParametersJsonSchema = """{"type":"object","properties":{}}"""
        },
        new AgentTool
        {
            Name = "query_indices",
            Description = "天气生活指数（运动/洗车/穿衣/钓鱼/紫外线/旅游/感冒等）。types 为指数ID逗号分隔，中国支持1-16，全球1-5。",
            ParametersJsonSchema = """{"type":"object","properties":{"types":{"type":"string","description":"如 1,3,5 或 0(全部)"},"days":{"type":"integer","enum":[1,3]}}}"""
        },
        new AgentTool
        {
            Name = "query_air_quality",
            Description = "空气质量：mode=current(实时)/hourly(未来24h)/daily(未来3天)，含AQI/污染物浓度/健康建议。",
            ParametersJsonSchema = """{"type":"object","properties":{"mode":{"type":"string","enum":["current","hourly","daily"]}},"required":["mode"]}"""
        },
        new AgentTool
        {
            Name = "query_history",
            Description = "历史天气（时光机，最近10天不含今天）。daysAgo=1 表示昨天。",
            ParametersJsonSchema = """{"type":"object","properties":{"daysAgo":{"type":"integer","minimum":1,"maximum":9}},"required":["daysAgo"]}"""
        },
        new AgentTool
        {
            Name = "query_astronomy",
            Description = "天文数据：kind=sun(日出日落)/moon(月升月落和月相)/solar_angle(太阳高度角)。date 格式 yyyy-MM-dd（默认今天）。",
            ParametersJsonSchema = """{"type":"object","properties":{"kind":{"type":"string","enum":["sun","moon","solar_angle"]},"date":{"type":"string"},"time":{"type":"string","description":"solar_angle 用，HH:mm"},"altitude":{"type":"number","description":"海拔米数，solar_angle 用"}},"required":["kind"]}"""
        },
        new AgentTool
        {
            Name = "search_locations",
            Description = "GeoAPI 城市搜索：支持名称模糊搜索、LocationID 精确查询、'经度,纬度' 坐标反查。",
            ParametersJsonSchema = """{"type":"object","properties":{"keyword":{"type":"string"},"adm":{"type":"string","description":"限定上级行政区"},"range":{"type":"string","description":"ISO 3166 国家代码如 cn"},"number":{"type":"integer"}},"required":["keyword"]}"""
        },
        new AgentTool
        {
            Name = "search_pois",
            Description = "GeoAPI POI 搜索（景点 scenic / 潮汐站 TSTA）。mode=lookup 按当前城市名+城市范围搜索；mode=range 按坐标半径搜索（radius 公里1-50）。",
            ParametersJsonSchema = """{"type":"object","properties":{"mode":{"type":"string","enum":["lookup","range"]},"type":{"type":"string","enum":["scenic","TSTA"]},"city":{"type":"string"},"radius":{"type":"integer"},"number":{"type":"integer"}},"required":["mode","type"]}"""
        },
        new AgentTool
        {
            Name = "top_cities",
            Description = "全球/某国热门城市列表（默认 range=cn）。",
            ParametersJsonSchema = """{"type":"object","properties":{"range":{"type":"string"},"number":{"type":"integer"}}}"""
        },
        new AgentTool
        {
            Name = "set_weather_location",
            Description = "设置天气定位：mode=auto 恢复自动定位；mode=manual + city 按城市名手动定位（会改变 widget 显示）。",
            ParametersJsonSchema = """{"type":"object","properties":{"mode":{"type":"string","enum":["auto","manual"]},"city":{"type":"string"}},"required":["mode"]}"""
        },
        new AgentTool
        {
            Name = "list_favorites",
            Description = "列出已收藏的天气城市。",
            ParametersJsonSchema = """{"type":"object","properties":{}}"""
        },
        new AgentTool
        {
            Name = "add_favorite_city",
            Description = "按城市名添加收藏城市。",
            ParametersJsonSchema = """{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}"""
        },
        new AgentTool
        {
            Name = "remove_favorite_city",
            Description = "删除收藏城市（按名称或 LocationID）。",
            ParametersJsonSchema = """{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}"""
        },
        new AgentTool
        {
            Name = "query_api_usage",
            Description = "查询和风天气控制台数据：kind=finance(财务汇总)/stats(最近24h请求量)/both。需凭据开通控制台权限。",
            ParametersJsonSchema = """{"type":"object","properties":{"kind":{"type":"string","enum":["finance","stats","both"]}}}"""
        },
    };

    public async Task<string> InvokeAsync(string tool, string argumentsJson)
    {
        try
        {
            return await InvokeInnerAsync(tool, argumentsJson ?? "{}");
        }
        catch (QWeatherApiException ex)
        {
            _host.LogError($"Weather: agent '{tool}' api error {ex.Message}");
            return AgentJson.Serialize(new { ok = false, error = ex.Title ?? "api_error", detail = ex.Detail });
        }
        catch (Exception ex)
        {
            _host.LogError($"Weather: agent '{tool}' failed: {ex.Message}");
            return AgentJson.Error("internal_error");
        }
    }

    async Task<string> InvokeInnerAsync(string tool, string args)
    {
        switch (tool)
        {
            case "query_weather":
            {
                var loc = await RequireLocationAsync();
                var current = await _service.GetCurrentAsync(loc)
                    ?? throw new QWeatherApiException(400, "无数据", null!);
                var result = new Dictionary<string, object?>
                {
                    ["ok"] = true,
                    ["city"] = loc.DisplayName,
                    ["locationId"] = loc.Id,
                    ["weather"] = current
                };
                await FillIncludesAsync(_service, loc, GetIncludeList(AgentJson.GetString(args, "include")), result);
                return AgentJson.Serialize(result);
            }

            case "query_weather_by_city":
            {
                var city = AgentJson.GetString(args, "city");
                if (string.IsNullOrWhiteSpace(city)) return AgentJson.Error("city_required");
                var loc = await ResolveByNameAsync(city) ?? throw new QWeatherApiException(400, "城市未找到", city);
                var current = await _service.GetCurrentAsync(loc)
                    ?? throw new QWeatherApiException(400, "无数据", null!);
                var result = new Dictionary<string, object?>
                {
                    ["ok"] = true,
                    ["city"] = loc.DisplayName,
                    ["locationId"] = loc.Id,
                    ["weather"] = current
                };
                await FillIncludesAsync(_service, loc, GetIncludeList(AgentJson.GetString(args, "include")), result);
                return AgentJson.Serialize(result);
            }

            case "query_forecast":
            {
                var loc = await RequireLocationAsync();
                var kind = AgentJson.GetString(args, "kind") ?? "daily";
                object? data = kind switch
                {
                    "daily" => await _service.GetDailyAsync(loc, AgentJson.GetInt(args, "days") ?? 7),
                    "city_daily" => await _service.GetCityDailyAsync(loc, AgentJson.GetInt(args, "days") ?? 7),
                    "hourly" => await _service.GetHourlyAsync(loc, AgentJson.GetInt(args, "hours") ?? 24),
                    "city_hourly" => await _service.GetCityHourlyAsync(loc, AgentJson.GetInt(args, "hours") ?? 24),
                    _ => null
                };
                if (data == null) return AgentJson.Error("bad_kind");
                return AgentJson.Serialize(new { ok = true, kind, city = loc.DisplayName, data });
            }

            case "query_minutely_precip":
            {
                var loc = await RequireLocationAsync();
                if (!loc.IsChina) return AgentJson.Error("only_china_supported");
                var data = await _service.GetMinutelyAsync(loc)
                    ?? throw new QWeatherApiException(400, "无数据", null!);
                return AgentJson.Serialize(new { ok = true, city = loc.DisplayName, data });
            }

            case "query_alerts":
            {
                var loc = await RequireLocationAsync();
                var alerts = await _service.GetAlertsAsync(loc);
                return AgentJson.Serialize(new { ok = true, city = loc.DisplayName, count = alerts.Count, alerts });
            }

            case "query_indices":
            {
                var loc = await RequireLocationAsync();
                var types = AgentJson.GetString(args, "types")
                    ?? (loc.IsChina ? "1,3,5,9" : "1,3,5");
                var days = AgentJson.GetInt(args, "days") ?? 1;
                var data = await _service.GetIndicesAsync(loc, days, types);
                return AgentJson.Serialize(new { ok = true, city = loc.DisplayName, count = data.Count, indices = data });
            }

            case "query_air_quality":
            {
                var loc = await RequireLocationAsync();
                var mode = AgentJson.GetString(args, "mode") ?? "current";
                object? data = mode switch
                {
                    "hourly" => await _service.GetAirHourlyAsync(loc),
                    "daily" => await _service.GetAirDailyAsync(loc),
                    _ => await _service.GetAirCurrentAsync(loc)
                };
                if (data == null) return AgentJson.Error("fetch_failed");
                return AgentJson.Serialize(new { ok = true, mode, city = loc.DisplayName, data });
            }

            case "query_history":
            {
                var loc = await RequireLocationAsync();
                var daysAgo = Math.Clamp(AgentJson.GetInt(args, "daysAgo") ?? 1, 1, 9);
                var date = DateTime.Today.AddDays(-daysAgo);
                var data = await _service.GetHistoricalAsync(loc, date.ToString("yyyyMMdd", CultureInfo.InvariantCulture))
                    ?? throw new QWeatherApiException(400, "无数据", null!);
                return AgentJson.Serialize(new { ok = true, date = date.ToString("yyyy-MM-dd"), city = loc.DisplayName, data });
            }

            case "query_astronomy":
            {
                var loc = await RequireLocationAsync();
                var kind = AgentJson.GetString(args, "kind") ?? "sun";
                var date = ParseDate(AgentJson.GetString(args, "date"));
                object? data = kind switch
                {
                    "moon" => await _service.GetMoonAsync(loc, date),
                    "solar_angle" => await _service.GetSolarElevationAsync(
                        loc, Combine(date, AgentJson.GetString(args, "time")),
                        AgentJson.GetInt(args, "altitude") ?? 0),
                    _ => await _service.GetSunAsync(loc, date)
                };
                if (data == null) return AgentJson.Error("bad_kind");
                return AgentJson.Serialize(new { ok = true, kind, date = date.ToString("yyyy-MM-dd"), city = loc.DisplayName, data });
            }

            case "search_locations":
            {
                var keyword = AgentJson.GetString(args, "keyword");
                if (string.IsNullOrWhiteSpace(keyword)) return AgentJson.Error("keyword_required");
                var list = await _service.SearchLocationsAsync(keyword,
                    AgentJson.GetString(args, "adm"),
                    AgentJson.GetString(args, "range"),
                    Math.Clamp(AgentJson.GetInt(args, "number") ?? 10, 1, 20));
                return AgentJson.Serialize(new { ok = true, count = list.Count, locations = list });
            }

            case "search_pois":
            {
                var loc = await RequireLocationAsync();
                var mode = AgentJson.GetString(args, "mode") ?? "lookup";
                var type = AgentJson.GetString(args, "type") ?? "scenic";
                var number = Math.Clamp(AgentJson.GetInt(args, "number") ?? 10, 1, 20);
                var pois = mode == "range"
                    ? await _service.SearchPoiRangeAsync(loc, type, AgentJson.GetInt(args, "radius") ?? 5, number)
                    : await _service.SearchPoisAsync(loc, type, AgentJson.GetString(args, "city"), number);
                return AgentJson.Serialize(new { ok = true, mode, count = pois.Count, pois });
            }

            case "top_cities":
            {
                var range = AgentJson.GetString(args, "range") ?? "cn";
                var number = Math.Clamp(AgentJson.GetInt(args, "number") ?? 10, 1, 20);
                var list = await _service.GetTopCitiesAsync(range, number);
                return AgentJson.Serialize(new { ok = true, count = list.Count, cities = list });
            }

            case "set_weather_location":
            {
                var mode = AgentJson.GetString(args, "mode") ?? "auto";
                if (mode != "manual")
                {
                    _service.SetAutoLocation();
                    _onLocationChanged();
                    return AgentJson.Serialize(new { ok = true, mode = "auto" });
                }
                var city = AgentJson.GetString(args, "city");
                if (string.IsNullOrWhiteSpace(city)) return AgentJson.Error("city_required");
                var loc = await ResolveByNameAsync(city);
                if (loc == null) return AgentJson.Error("city_not_found");
                _service.SetManualLocation(loc);
                _onLocationChanged();
                return AgentJson.Serialize(new { ok = true, mode = "manual", id = loc.Id, name = loc.DisplayName, lat = loc.Lat, lon = loc.Lon });
            }

            case "list_favorites":
                return AgentJson.Serialize(new
                {
                    ok = true,
                    favorites = _service.GetFavorites().Select(f => new { id = f.Id, name = f.Name }).ToList()
                });

            case "add_favorite_city":
            {
                var city = AgentJson.GetString(args, "city");
                if (string.IsNullOrWhiteSpace(city)) return AgentJson.Error("city_required");
                var loc = await ResolveByNameAsync(city);
                if (loc == null) return AgentJson.Error("city_not_found");
                _service.AddFavorite(loc.Id, loc.DisplayName);
                return AgentJson.Serialize(new
                {
                    ok = true,
                    favorites = _service.GetFavorites().Select(f => new { id = f.Id, name = f.Name }).ToList()
                });
            }

            case "remove_favorite_city":
            {
                var city = AgentJson.GetString(args, "city");
                if (string.IsNullOrWhiteSpace(city)) return AgentJson.Error("city_required");
                var favs = _service.GetFavorites();
                var hit = favs.FirstOrDefault(f =>
                    f.Id.Equals(city, StringComparison.OrdinalIgnoreCase) ||
                    f.Name.Contains(city, StringComparison.OrdinalIgnoreCase));
                if (hit.Id == null) return AgentJson.Error("not_found");
                _service.RemoveFavorite(hit.Id);
                return AgentJson.Serialize(new
                {
                    ok = true,
                    removed = hit,
                    favorites = _service.GetFavorites().Select(f => new { id = f.Id, name = f.Name }).ToList()
                });
            }

            case "query_api_usage":
            {
                var kind = AgentJson.GetString(args, "kind") ?? "both";
                var result = new Dictionary<string, object?>();
                if (kind is "finance" or "both")
                    result["finance"] = await _service.GetFinanceSummaryAsync();
                if (kind is "stats" or "both")
                {
                    var stats = await _service.GetStatsAsync();
                    result["stats"] = stats;
                    result["stats24hSuccess"] = QWeatherService.SumHours(stats?.Success);
                    result["stats24hErrors"] = QWeatherService.SumHours(stats?.Errors);
                }
                result["ok"] = true;
                return AgentJson.Serialize(result);
            }

            default:
                return AgentJson.Error("unknown_tool");
        }
    }

    async Task<QLocation> RequireLocationAsync()
    {
        var loc = await _service.ResolveCurrentAsync();
        return loc ?? throw new QWeatherApiException(400, "未定位", "无法解析当前城市，请检查网络或在设置中手动选择城市");
    }

    async Task<QLocation?> ResolveByNameAsync(string city)
    {
        var list = await _service.SearchLocationsAsync(city, number: 1);
        var g = list.FirstOrDefault();
        return g == null ? null : QLocation.FromGeo(g);
    }

    /// <summary>解析 include 参数：支持 JSON 数组或逗号分隔字符串。</summary>
    static List<string> GetIncludeList(string? raw)
    {
        var list = new List<string>();
        if (string.IsNullOrWhiteSpace(raw)) return list;
        try
        {
            using var doc = JsonDocument.Parse(raw);
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var e in doc.RootElement.EnumerateArray())
                {
                    var s = e.ValueKind == JsonValueKind.String ? e.GetString() : e.ToString();
                    if (!string.IsNullOrWhiteSpace(s)) list.Add(s);
                }
                return list;
            }
        }
        catch { }
        list.AddRange(raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
        return list;
    }

    static async Task FillIncludesAsync(QWeatherService service, QLocation loc, List<string> include, Dictionary<string, object?> result)
    {
        if (include.Count == 0) return;
        foreach (var raw in include)
        {
            try
            {
                switch (raw.Trim().ToLowerInvariant())
                {
                    case "hourly":
                        result["hourly"] = await service.GetHourlyAsync(loc, 24);
                        break;
                    case "daily":
                        result["daily"] = await service.GetDailyAsync(loc, 7);
                        break;
                    case "minutely":
                        if (loc.IsChina) result["minutely"] = await service.GetMinutelyAsync(loc);
                        break;
                    case "alerts":
                        result["alerts"] = await service.GetAlertsAsync(loc);
                        break;
                    case "air":
                        result["air"] = await service.GetAirCurrentAsync(loc);
                        break;
                    case "indices":
                        result["indices"] = await service.GetIndicesAsync(loc, 1, loc.IsChina ? "1,3,5,9" : "1,3,5");
                        break;
                }
            }
            catch (Exception ex)
            {
                result[$"{raw}Error"] = ex.Message;
            }
        }
    }

    static DateTime ParseDate(string? s)
    {
        if (s is { Length: > 0 } &&
            (DateTime.TryParseExact(s, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d) ||
             DateTime.TryParseExact(s, "yyyyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out d)))
            return d;
        return DateTime.Today;
    }

    static DateTime Combine(DateTime date, string? time)
    {
        if (time is { Length: >= 4 } t &&
            DateTime.TryParseExact(t.Replace(":", ""), "HHmm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
            return date.Date + dt.TimeOfDay;
        // 时间非法时保留日期（此前丢失日期直接回退到今天，会查错日子）
        return date.Date;
    }
}
