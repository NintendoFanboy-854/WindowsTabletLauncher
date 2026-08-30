using System.Net.Http;
using System.Text.Json;
using PluginContract;

namespace TodoPlugin;

// Determines whether a date is a Chinese legal workday (accounts for 调休),
// via https://api.apisbo.com/holidays. Results are cached in memory and
// persisted to config so they survive restarts; on failure it falls back to
// a simple weekend rule. NextWorkdayAsync fetches candidates in parallel and
// is bounded by a small candidate window.
public sealed class HolidayService
{
    const string Base = "https://api.apisbo.com/holidays";
    const string CacheKey = "holiday_cache";
    const int MaxCandidates = 8;
    const int MaxCacheEntries = 1000;

    static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(8) };

    readonly IHostHandle _host;
    readonly Dictionary<string, bool> _workdayCache;
    readonly object _cacheLock = new();
    bool _cacheDirty;

    public HolidayService(IHostHandle host)
    {
        _host = host;
        _workdayCache = LoadPersisted();
    }

    Dictionary<string, bool> LoadPersisted()
    {
        var raw = _host.GetConfig(nameof(TodoPlugin), CacheKey);
        if (!string.IsNullOrWhiteSpace(raw))
        {
            try
            {
                return JsonSerializer.Deserialize<Dictionary<string, bool>>(raw) ?? new Dictionary<string, bool>();
            }
            catch (Exception ex)
            {
                _host.LogError($"Todo/Holiday: failed to load persisted cache: {ex.Message}");
            }
        }
        return new Dictionary<string, bool>();
    }

    void PersistCache()
    {
        Dictionary<string, bool> snapshot;
        lock (_cacheLock)
        {
            if (!_cacheDirty) return;
            _cacheDirty = false;
            snapshot = new Dictionary<string, bool>(_workdayCache);
        }
        try
        {
            _host.SetConfig(nameof(TodoPlugin), CacheKey, JsonSerializer.Serialize(snapshot));
        }
        catch (Exception ex)
        {
            _host.LogError($"Todo/Holiday: failed to persist cache: {ex.Message}");
        }
    }

    public async Task<bool> IsWorkdayAsync(DateTime date)
    {
        var key = date.ToString("yyyy-MM-dd");
        lock (_cacheLock)
        {
            if (_workdayCache.TryGetValue(key, out var cached))
                return cached;
        }

        var (result, fromApi) = await QueryWorkdayAsync(date);
        // 网络失败时的周末规则降级值不得进入缓存/持久化，否则节假日调休判断会长期错误
        if (fromApi)
            Store(key, result);
        return result;
    }

    async Task<(bool IsWorkday, bool FromApi)> QueryWorkdayAsync(DateTime date)
    {
        var key = date.ToString("yyyy-MM-dd");
        try
        {
            var json = await Http.GetStringAsync($"{Base}/date/{key}");
            using var doc = JsonDocument.Parse(json);
            var result = doc.RootElement.GetProperty("data").GetProperty("isWorkday").GetBoolean();
            _host.Log($"Todo/Holiday: {key} isWorkday={result}");
            return (result, true);
        }
        catch (Exception ex)
        {
            var fallback = date.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday);
            _host.LogError($"Todo/Holiday: query {key} failed ({ex.Message}); fallback workday={fallback} (not cached)");
            return (fallback, false);
        }
    }

    void Store(string key, bool result)
    {
        lock (_cacheLock)
        {
            if (_workdayCache.Count >= MaxCacheEntries)
                _workdayCache.Clear();
            _workdayCache[key] = result;
            _cacheDirty = true;
        }
        PersistCache();
    }

    // Next legal workday strictly after the given date (same time-of-day kept by caller).
    // Fetches missing candidates in parallel so the worst case latency is one
    // request timeout instead of N sequential timeouts.
    public async Task<DateTime> NextWorkdayAsync(DateTime after)
    {
        var cursor = after.Date.AddDays(1);
        var candidates = new List<DateTime>(MaxCandidates);
        for (int i = 0; i < 60 && candidates.Count < MaxCandidates; i++, cursor = cursor.AddDays(1))
            candidates.Add(cursor);

        List<DateTime> missing;
        lock (_cacheLock)
            missing = candidates.Where(c => !_workdayCache.ContainsKey(c.ToString("yyyy-MM-dd"))).ToList();

        if (missing.Count > 0)
        {
            var fetched = await Task.WhenAll(missing.Select(async dt =>
            {
                var (wd, fromApi) = await QueryWorkdayAsync(dt);
                return (Date: dt, IsWorkday: wd, FromApi: fromApi);
            }));

            var dirty = false;
            lock (_cacheLock)
            {
                foreach (var (dt, wd, fromApi) in fetched)
                {
                    if (!fromApi) continue; // 降级结果只用于本次判断，不落缓存
                    if (_workdayCache.Count >= MaxCacheEntries)
                        _workdayCache.Clear();
                    _workdayCache[dt.ToString("yyyy-MM-dd")] = wd;
                    dirty = true;
                }
            }
            if (dirty) PersistCache();
        }

        foreach (var c in candidates)
        {
            lock (_cacheLock)
            {
                if (_workdayCache.TryGetValue(c.ToString("yyyy-MM-dd"), out var wd) && wd)
                    return c;
            }
            // 缓存未命中（本次查询失败）时按周末规则临时判断，不写入缓存
            if (c.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
                return c;
        }
        return after.AddDays(1); // safety fallback
    }
}
