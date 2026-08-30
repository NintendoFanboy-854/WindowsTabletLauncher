using System.Text.Json;
using System.Text.Json.Nodes;

namespace LauncherHost.Services;

public class LocalizationService
{
    private readonly string _stringsDir;
    private readonly Dictionary<string, Dictionary<string, string>> _cache = new();
    private readonly HashSet<string> _warnedKeys = new();
    private readonly object _gate = new();
    private string _culture;

    public event Action? CultureChanged;

    public LocalizationService(string culture = "zh-cn")
    {
        _culture = culture;
        _stringsDir = Path.Combine(AppContext.BaseDirectory, "Strings");
        LoadCulture(culture);
        EnsureFallback("zh-cn");
        EnsureFallback("en-us");
    }

    public string Culture { get { lock (_gate) return _culture; } }

    public void SetCulture(string culture)
    {
        lock (_gate)
        {
            if (string.Equals(_culture, culture, StringComparison.OrdinalIgnoreCase))
                return;
            LoadCulture(culture);
            _culture = culture;
            EnsureFallback(culture);
        }
        CultureChanged?.Invoke();
    }

    public string Translate(string key)
    {
        string culture;
        lock (_gate) culture = _culture;

        if (TryGet(culture, key, out var value))
            return value;

        if (!string.Equals(culture, "zh-cn", StringComparison.OrdinalIgnoreCase) &&
            TryGet("zh-cn", key, out value))
            return value;

        if (!string.Equals(culture, "en-us", StringComparison.OrdinalIgnoreCase) &&
            TryGet("en-us", key, out value))
            return value;

        WarnMissingKeyOnce(key);
        return key;
    }

    private void WarnMissingKeyOnce(string key)
    {
        lock (_warnedKeys)
        {
            if (!_warnedKeys.Add(key)) return;
        }
        LogService.Warn($"Missing key '{key}' for culture '{_culture}'");
    }

    private bool TryGet(string culture, string key, out string value)
    {
        value = "";
        lock (_gate)
        {
            if (_cache.TryGetValue(culture, out var map) &&
                map.TryGetValue(key, out var v) &&
                !string.IsNullOrEmpty(v))
            {
                value = v;
                return true;
            }
        }
        return false;
    }

    private void EnsureFallback(string culture)
    {
        if (!_cache.ContainsKey(culture))
            LoadCulture(culture);
    }

    private void LoadCulture(string culture)
    {
        var path = Path.Combine(_stringsDir, $"{culture}.json");
        if (!File.Exists(path))
        {
            LogService.Warn($"Strings file not found: {path}");
            return;
        }

        try
        {
            var json = JsonNode.Parse(File.ReadAllText(path))?.AsObject();
            if (json is not null)
            {
                var map = new Dictionary<string, string>(json.Count, StringComparer.Ordinal);
                foreach (var (key, node) in json)
                {
                    if (node is JsonValue v && v.TryGetValue<string>(out var s))
                        map[key] = s;
                }
                _cache[culture] = map;
            }
        }
        catch (Exception ex)
        {
            LogService.Error(ex, $"Failed to parse {path}");
        }
    }
}
