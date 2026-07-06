namespace PluginContract;

public interface IPluginSettings
{
    string PluginId { get; }
    object CreateSettingsControl();
}
