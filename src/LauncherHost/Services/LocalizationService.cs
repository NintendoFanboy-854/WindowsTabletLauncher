using System.Text.Json;
using System.Text.Json.Nodes;

namespace LauncherHost.Services;

public class LocalizationService
{
    private readonly string _stringsDir;
    private Dictionary<string, JsonObject> _cache = new();
    private string _culture;

    public event Action? CultureChanged;

    public LocalizationService(string culture = "en-us")
    {
        _culture = culture;
        _stringsDir = Path.Combine(AppContext.BaseDirectory, "Strings");
        Directory.CreateDirectory(_stringsDir);
        LoadCulture(culture);
    }

    public string Culture => _culture;

    public void SetCulture(string culture)
    {
        if (_culture == culture) return;
        LoadCulture(culture);
        _culture = culture;
        CultureChanged?.Invoke();
    }

    public string Translate(string key)
    {
        if (_cache.TryGetValue(_culture, out var json) &&
            json.TryGetPropertyValue(key, out var node) &&
            node is not null)
            return node.GetValue<string>();

        LogService.Warn($"Missing key '{key}' for culture '{_culture}'");
        return key;
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
