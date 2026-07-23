using System.Text.Json;
using System.Text.Json.Nodes;

namespace LauncherHost.Services;

public class LocalizationService
{
    private readonly string _stringsDir;
    private Dictionary<string, JsonObject> _cache = new();
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

    public string Culture => _culture;

    public void SetCulture(string culture)
    {
        if (string.Equals(_culture, culture, StringComparison.OrdinalIgnoreCase))
            return;
        LoadCulture(culture);
        _culture = culture;
        EnsureFallback(culture);
        CultureChanged?.Invoke();
    }

    public string Translate(string key)
    {
        if (TryGet(_culture, key, out var value))
            return value;

        if (!string.Equals(_culture, "zh-cn", StringComparison.OrdinalIgnoreCase) &&
            TryGet("zh-cn", key, out value))
            return value;

        if (!string.Equals(_culture, "en-us", StringComparison.OrdinalIgnoreCase) &&
            TryGet("en-us", key, out value))
            return value;

        LogService.Warn($"Missing key '{key}' for culture '{_culture}'");
        return key;
    }

    private bool TryGet(string culture, string key, out string value)
    {
        value = "";
        if (_cache.TryGetValue(culture, out var json) &&
            json.TryGetPropertyValue(key, out var node) &&
            node is not null)
        {
            value = node.GetValue<string>();
            return true;
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
                _cache[culture] = json;
        }
        catch (Exception ex)
        {
            LogService.Error(ex, $"Failed to parse {path}");
        }
    }
}
