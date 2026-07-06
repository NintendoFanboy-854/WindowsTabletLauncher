namespace PluginContract;

public interface IHostHandle
{
    string Translate(string key);
    object GetWidgetBackgroundBrush();

    string? GetConfig(string pluginId, string key);
    void SetConfig(string pluginId, string key, string value);
    void RegisterAgentCapability(IAgentCapability capability);

    void ShowNotification(string title, string message, bool escalate = true);

    void Log(string message);
    void LogError(string message);
}
