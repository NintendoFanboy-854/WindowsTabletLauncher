using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;

namespace WeatherPlugin;

/// <summary>
/// 和风天气插件（QWeather）。数据层 QWeatherService（22 个端点 + TTL 缓存），
/// UI 层 WeatherWidget（tile）+ WeatherOverlayBuilder（总览页）+ WeatherSettingsPanel（设置），
/// Agent 层 WeatherAgentTools（17 个工具）。
/// </summary>
public class WeatherPlugin : IPlugin, IPluginSettings, IAgentCapability
{
    IHostHandle _host = null!;
    DispatcherQueue _dispatcher = null!;
    QWeatherService _service = null!;
    WeatherAgentTools _agentTools = null!;
    WeatherWidget? _widget;

    public string DisplayName => "天气";

    public string PluginId => QWeatherService.PluginId;

    public void Initialize(IHostHandle host)
    {
        _host = host;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
        _service = new QWeatherService(host, _dispatcher, host.LogError);
        _agentTools = new WeatherAgentTools(_service, host, RefreshOnUi);
    }

    void RefreshOnUi()
    {
        if (_widget == null) return;
        if (_dispatcher.HasThreadAccess) _widget.Refresh();
        else _dispatcher.TryEnqueue(() => _widget?.Refresh());
    }

    public IReadOnlyList<IWidget> GetWidgets()
    {
        _widget ??= new WeatherWidget(_host, _service);
        _widget.SetWidgetBackground((Brush)_host.GetWidgetBackgroundBrush());
        return new[] { new WeatherWidgetInfo(_host, _widget) };
    }

    public void Shutdown()
    {
        _widget?.Stop();
    }

    object IPluginSettings.CreateSettingsControl()
        => new WeatherSettingsPanel(_service, () => _widget);

    void IPluginSettings.ResetConfig(IHostHandle host)
    {
        // 注意：GetConfig 对空值返回 ""，ResetConfig 必须写默认值
        host.SetConfig(PluginId, QWeatherService.KeyHost, "");
        host.SetConfig(PluginId, QWeatherService.KeyApiKey, "");
        host.SetConfig(PluginId, QWeatherService.KeyLang, "zh");
        host.SetConfig(PluginId, QWeatherService.KeyLocMode, "auto");
        host.SetConfig(PluginId, QWeatherService.KeyLocId, "");
        host.SetConfig(PluginId, QWeatherService.KeyLocName, "");
        host.SetConfig(PluginId, QWeatherService.KeyLocAdm1, "");
        host.SetConfig(PluginId, QWeatherService.KeyLocAdm2, "");
        host.SetConfig(PluginId, QWeatherService.KeyLocLat, "");
        host.SetConfig(PluginId, QWeatherService.KeyLocLon, "");
        host.SetConfig(PluginId, QWeatherService.KeyLocCountry, "");
        host.SetConfig(PluginId, QWeatherService.KeyFavorites, "[]");
        host.SetConfig(PluginId, QWeatherService.KeyRefreshMin, "30");
        host.SetConfig(PluginId, QWeatherService.KeyNotifyAlerts, "true");
        host.SetConfig(PluginId, QWeatherService.KeyNotifiedAlerts, "[]");
        _service.ClearCache();
        _service.Client.ResetBreaker();
        _widget?.ApplyRefreshInterval();
        RefreshOnUi();
    }

    IReadOnlyList<AgentTool> IAgentCapability.GetTools() => _agentTools.GetTools();

    /// <summary>AI 状态快照 hook：仅读本地缓存，不发网络请求。</summary>
    string? IAgentCapability.GetContextSnapshot()
    {
        try
        {
            var loc = _service.GetLastKnownLocation();
            if (loc == null) return "天气: 未定位（未配置城市）";
            var modeText = _service.GetConfig(QWeatherService.KeyLocMode) == "manual" ? "手动" : "自动";
            var current = _service.TryGetCachedCurrent(loc);
            if (current?.Condition == null)
                return $"天气: {loc.DisplayName}（{modeText}定位，实况尚未加载）";
            var temp = current.Temperature?.Value is double t ? $"{t:0.#}°C" : "--";
            var feels = current.FeelsLike?.Value is double f ? $"，体感 {f:0.#}°C" : "";
            var hum = current.Humidity is double h ? $"，湿度 {Math.Round(h * 100)}%" : "";
            return $"天气: {loc.DisplayName}（{modeText}定位）{current.Condition.Text} {temp}{feels}{hum}";
        }
        catch { return null; }
    }

    async Task<string> IAgentCapability.InvokeAsync(string tool, string argumentsJson)
    {
        _host.Log($"Weather: agent invoke '{tool}' args={argumentsJson}");
        return await _agentTools.InvokeAsync(tool, argumentsJson);
    }

    class WeatherWidgetInfo : IWidget
    {
        readonly IHostHandle _host;
        readonly WeatherWidget _control;

        public WeatherWidgetInfo(IHostHandle host, WeatherWidget control)
        {
            _host = host;
            _control = control;
        }

        public string Id => "weather.main";
        public int Columns => 2;
        public int Rows => 1;
        public WidgetBackdrop Backdrop => WidgetBackdrop.Acrylic;

        public object CreateControl()
        {
            _control.SetWidgetBackground((Brush)_host.GetWidgetBackgroundBrush());
            return _control;
        }
    }
}
