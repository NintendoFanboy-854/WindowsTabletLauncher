using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using LauncherHost.Services;

namespace LauncherHost.Core;

public class HostHandle : IHostHandle
{
    private readonly LocalizationService _loc;
    private readonly AcrylicBrushProvider _acrylicProvider;
    private readonly ConfigStore _config;
    private readonly List<IAgentCapability> _capabilities = new();

    internal event Action<ElementTheme>? ThemeChanged;
    internal event Action<string, string, bool>? NotificationRequested;

    internal Func<ElementTheme>? LiveTheme { get; set; }

    private ElementTheme _currentTheme = ElementTheme.Default;

    public HostHandle(LocalizationService loc, AcrylicBrushProvider acrylicProvider, ConfigStore config)
    {
        _loc = loc;
        _acrylicProvider = acrylicProvider;
        _config = config;
    }

    public string Translate(string key) => _loc.Translate(key);

    public object GetWidgetBackgroundBrush()
        => _acrylicProvider.GetBrush(LiveTheme?.Invoke() ?? _currentTheme);

    public string? GetConfig(string pluginId, string key) => _config.Get(pluginId, key);

    public void SetConfig(string pluginId, string key, string value)
        => _config.Set(pluginId, key, value);

    public void RegisterAgentCapability(IAgentCapability capability)
    {
        _capabilities.Add(capability);
        var tools = capability.GetTools().Select(t => t.Name);
        LogService.Info($"Agent capability registered: {string.Join(", ", tools)}");
    }

    public void ShowNotification(string title, string message, bool escalate = true)
    {
        LogService.Info($"Notification requested: {title} - {message} (escalate={escalate})");
        NotificationRequested?.Invoke(title, message, escalate);
    }

    public void Log(string message) => LogService.Info(message);

    public void LogError(string message) => LogService.Error(message);

    internal IReadOnlyList<IAgentCapability> GetCapabilities() => _capabilities;

    public IReadOnlyList<(string pluginId, string key, string value)> GetAllConfigs(string keyPrefix)
    {
        var result = new List<(string, string, string)>();
        var all = _config.GetAll();
        foreach (var (pluginId, key, value) in all)
        {
            if (string.IsNullOrEmpty(keyPrefix) || key.StartsWith(keyPrefix, StringComparison.OrdinalIgnoreCase))
                result.Add((pluginId, key, value));
        }
        return result;
    }

    internal void NotifyTheme(ElementTheme theme)
    {
        _currentTheme = theme;
        ThemeChanged?.Invoke(theme);
    }
}
