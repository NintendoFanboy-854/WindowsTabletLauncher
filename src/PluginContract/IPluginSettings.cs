namespace PluginContract;

public interface IPluginSettings
{
    string PluginId { get; }
    object CreateSettingsControl();

    void ResetConfig(IHostHandle host) { }
}
