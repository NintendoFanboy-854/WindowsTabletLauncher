namespace PluginContract;

public interface IPlugin
{
    string DisplayName { get; }
    void Initialize(IHostHandle host);
    IReadOnlyList<IWidget> GetWidgets();
    void Shutdown();
}
