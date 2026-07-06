using System.Net.Http;
using System.Text.Json;
using PluginContract;

namespace TodoPlugin;

// Determines whether a date is a Chinese legal workday (accounts for 调休),
// via https://api.apisbo.com/holidays. Results are cached; on failure it
// falls back to a simple weekend rule.
public sealed class HolidayService
{
    const string Base = "https://api.apisbo.com/holidays";
    static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(8) };

    readonly IHostHandle _host;
    readonly Dictionary<string, bool> _workdayCache = new();

    public HolidayService(IHostHandle host) => _host = host;

    public async Task<bool> IsWorkdayAsync(DateTime date)
    {
        var key = date.ToString("yyyy-MM-dd");
        if (_workdayCache.TryGetValue(key, out var cached))
            return cached;

        bool result;
        try
        {
            var json = await Http.GetStringAsync($"{Base}/date/{key}");
            using var doc = JsonDocument.Parse(json);
            var data = doc.RootElement.GetProperty("data");
            result = data.GetProperty("isWorkday").GetBoolean();
            _host.Log($"Todo/Holiday: {key} isWorkday={result}");
        }
        catch (Exception ex)
        {
            result = date.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday);
            _host.LogError($"Todo/Holiday: query {key} failed ({ex.Message}); fallback workday={result}");
        }

        _workdayCache[key] = result;
        return result;
    }

    // Next legal workday strictly after the given date (same time-of-day kept by caller).
    public async Task<DateTime> NextWorkdayAsync(DateTime after)
    {
        var d = after.Date.AddDays(1);
        for (int i = 0; i < 60; i++)
        {
            if (await IsWorkdayAsync(d))
                return d;
            d = d.AddDays(1);
        }
        return after.AddDays(1); // safety fallback
    }
}
