using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace WeatherPlugin;

public sealed class AmapWeatherService
{
    const string Base = "https://restapi.amap.com";

    static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(10) };
    static readonly JsonSerializerOptions Opts = new() { PropertyNameCaseInsensitive = true };

    readonly Func<string> _keyProvider;
    readonly Action<string>? _logError;
    List<District>? _provincesCache;

    public AmapWeatherService(Func<string> keyProvider, Action<string>? logError = null)
    {
        _keyProvider = keyProvider;
        _logError = logError;
    }

    string Key => _keyProvider();

    public async Task<Live?> GetLiveAsync(string adcode)
    {
        var url = $"{Base}/v3/weather/weatherInfo?key={Key}&city={adcode}&extensions=base&output=JSON";
        var resp = await GetJsonAsync<LiveResponse>(url);
        if (resp?.Lives is { Count: > 0 })
            return resp.Lives[0];
        return null;
    }

    public async Task<Forecast?> GetForecastAsync(string adcode)
    {
        var url = $"{Base}/v3/weather/weatherInfo?key={Key}&city={adcode}&extensions=all&output=JSON";
        var resp = await GetJsonAsync<ForecastResponse>(url);
        if (resp?.Forecasts is { Count: > 0 })
            return resp.Forecasts[0];
        return null;
    }

    public async Task<IpResponse?> GetIpLocationAsync()
    {
        var url = $"{Base}/v3/ip?key={Key}&output=JSON";
        var resp = await GetJsonAsync<IpResponse>(url);
        if (resp?.Status == "1" && !string.IsNullOrWhiteSpace(resp.Adcode))
            return resp;
        return null;
    }

    public async Task<List<District>> GetProvincesAsync()
    {
        if (_provincesCache is { Count: > 0 })
            return _provincesCache;

        var root = await FetchDistrictAsync("中国");
        _provincesCache = root?.Districts ?? new List<District>();
        return _provincesCache;
    }

    public async Task<List<District>> GetSubDistrictsAsync(string adcode)
    {
        var node = await FetchDistrictAsync(adcode);
        return node?.Districts ?? new List<District>();
    }

    public async Task<(string adcode, string name)?> ResolveLocationAsync(string keyword)
    {
        var d = await FetchDistrictAsync(keyword);
        if (d != null && !string.IsNullOrWhiteSpace(d.Adcode))
            return (d.Adcode, d.Name);
        return null;
    }

    async Task<District?> FetchDistrictAsync(string keyword)
    {
        var url = $"{Base}/v3/config/district?key={Key}&keywords={Uri.EscapeDataString(keyword)}&subdistrict=1&extensions=base&output=JSON";
        var resp = await GetJsonAsync<DistrictResponse>(url);
        if (resp?.Districts is { Count: > 0 })
            return resp.Districts[0];
        return null;
    }

    async Task<T?> GetJsonAsync<T>(string url) where T : class
    {
        try
        {
            var json = await Http.GetStringAsync(url);
            return JsonSerializer.Deserialize<T>(json, Opts);
        }
        catch (Exception ex)
        {
            _logError?.Invoke($"Weather: request failed ({ex.Message})");
            return null;
        }
    }
}

public sealed class FlexibleStringConverter : JsonConverter<string?>
{
    public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
            return reader.GetString();

        reader.Skip();
        return null;
    }

    public override void Write(Utf8JsonWriter writer, string? value, JsonSerializerOptions options)
        => writer.WriteStringValue(value);
}
