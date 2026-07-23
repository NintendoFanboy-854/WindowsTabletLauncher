using System.Text.Json;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;
using Windows.UI;

namespace WeatherPlugin;

public sealed record Favorite(string Adcode, string Name);

public class WeatherPlugin : IPlugin, IPluginSettings, IAgentCapability
{
    IHostHandle _host = null!;
    AmapWeatherService _service = null!;
    WeatherWidget? _widget;
    bool _loadingCities;

    public string DisplayName => "天气";

    public string PluginId => nameof(WeatherPlugin);

    public void Initialize(IHostHandle host)
    {
        _host = host;
        _service = new AmapWeatherService(() => ResolveKey(host), host.LogError);
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

    internal static string ResolveKey(IHostHandle host)
    {
        return host.GetConfig(nameof(WeatherPlugin), "api_key") ?? "";
    }

    internal static List<Favorite> GetFavorites(IHostHandle host)
    {
        var raw = host.GetConfig(nameof(WeatherPlugin), "favorites");
        if (string.IsNullOrWhiteSpace(raw)) return new();
        try { return JsonSerializer.Deserialize<List<Favorite>>(raw) ?? new(); }
        catch { return new(); }
    }

    static void SetFavorites(IHostHandle host, List<Favorite> list)
        => host.SetConfig(nameof(WeatherPlugin), "favorites", JsonSerializer.Serialize(list));

    static bool AddFavorite(IHostHandle host, string adcode, string name)
    {
        if (string.IsNullOrWhiteSpace(adcode)) return false;
        var list = GetFavorites(host);
        if (list.Any(f => f.Adcode == adcode)) return false;
        list.Add(new Favorite(adcode, name));
        SetFavorites(host, list);
        return true;
    }

    static void RemoveFavorite(IHostHandle host, string adcode)
    {
        var list = GetFavorites(host);
        list.RemoveAll(f => f.Adcode == adcode);
        SetFavorites(host, list);
    }

    object IPluginSettings.CreateSettingsControl()
    {
        var panel = new StackPanel { Spacing = 12, Margin = new Thickness(0, 8, 0, 4) };

        var keyExpander = new Expander { Header = "高德 API Key", IsExpanded = false };
        var keyBox = new TextBox
        {
            PlaceholderText = "请输入高德 API Key",
            HorizontalAlignment = HorizontalAlignment.Stretch
        };
        var currentKey = ResolveKey(_host);
        if (!string.IsNullOrWhiteSpace(currentKey)) keyBox.Text = currentKey;
        keyBox.LostFocus += (_, _) =>
        {
            _host.SetConfig(PluginId, "api_key", keyBox.Text.Trim());
            _widget?.Refresh();
        };
        keyExpander.Content = keyBox;
        panel.Children.Add(keyExpander);

        var modeCombo = new ComboBox { Header = "定位方式" };
        var autoItem = new ComboBoxItem { Content = "自动探测（IP）", Tag = "auto" };
        var manualItem = new ComboBoxItem { Content = "手动选择", Tag = "manual" };
        modeCombo.Items.Add(autoItem);
        modeCombo.Items.Add(manualItem);

        var mode = _host.GetConfig(PluginId, "location_mode") ?? "auto";
        modeCombo.SelectedItem = mode == "manual" ? manualItem : autoItem;
        panel.Children.Add(modeCombo);

        var manualPanel = new StackPanel
        {
            Spacing = 8,
            Visibility = mode == "manual" ? Visibility.Visible : Visibility.Collapsed
        };
        var provinceCombo = new ComboBox { Header = "省 / 直辖市", HorizontalAlignment = HorizontalAlignment.Stretch };
        var cityCombo = new ComboBox { Header = "城市 / 区", HorizontalAlignment = HorizontalAlignment.Stretch };
        manualPanel.Children.Add(provinceCombo);
        manualPanel.Children.Add(cityCombo);
        panel.Children.Add(manualPanel);

        var savedAdcode = _host.GetConfig(PluginId, "adcode");
        var suppressCity = false;

        provinceCombo.SelectionChanged += async (_, _) =>
        {
            if (_loadingCities) return;
            if (provinceCombo.SelectedItem is not District province) return;

            _loadingCities = true;
            try
            {
                var cities = await _service.GetSubDistrictsAsync(province.Adcode);
                suppressCity = true;
                cityCombo.ItemsSource = cities;
                var match = cities.FirstOrDefault(c => c.Adcode == savedAdcode);
                if (match != null) cityCombo.SelectedItem = match;
                suppressCity = false;
            }
            finally
            {
                _loadingCities = false;
            }
        };

        cityCombo.SelectionChanged += (_, _) =>
        {
            if (suppressCity) return;
            if (cityCombo.SelectedItem is not District city) return;
            var province = provinceCombo.SelectedItem as District;
            _host.SetConfig(PluginId, "adcode", city.Adcode);
            _host.SetConfig(PluginId, "location_name", $"{province?.Name}{city.Name}");
            _widget?.Refresh();
        };

        modeCombo.SelectionChanged += (_, _) =>
        {
            var m = (modeCombo.SelectedItem as ComboBoxItem)?.Tag as string ?? "auto";
            _host.SetConfig(PluginId, "location_mode", m);
            manualPanel.Visibility = m == "manual" ? Visibility.Visible : Visibility.Collapsed;
            _widget?.Refresh();
        };

        // add-to-favorites (uses the currently selected/active city)
        var addFav = new Button { Content = "把当前城市加入收藏", HorizontalAlignment = HorizontalAlignment.Stretch };
        var favList = new StackPanel { Spacing = 6 };
        void RebuildFavList()
        {
            favList.Children.Clear();
            foreach (var f in GetFavorites(_host))
            {
                var row = new Grid();
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                var name = new TextBlock { Text = f.Name, VerticalAlignment = VerticalAlignment.Center };
                Grid.SetColumn(name, 0);
                var del = new Button { Content = new FontIcon { Glyph = "\uE711", FontSize = 12 }, Background = new SolidColorBrush(Windows.UI.Color.FromArgb(0, 0, 0, 0)), BorderThickness = new Thickness(0) };
                del.Click += (_, _) => { RemoveFavorite(_host, f.Adcode); RebuildFavList(); };
                Grid.SetColumn(del, 1);
                row.Children.Add(name);
                row.Children.Add(del);
                favList.Children.Add(row);
            }
        }
        addFav.Click += (_, _) =>
        {
            var adcode = _host.GetConfig(PluginId, "adcode");
            var name = _host.GetConfig(PluginId, "location_name");
            if (!string.IsNullOrWhiteSpace(adcode))
            {
                AddFavorite(_host, adcode!, string.IsNullOrWhiteSpace(name) ? adcode! : name!);
                RebuildFavList();
            }
        };
        panel.Children.Add(new TextBlock { Text = "收藏城市", FontWeight = Microsoft.UI.Text.FontWeights.SemiBold, Margin = new Thickness(0, 8, 0, 0) });
        panel.Children.Add(addFav);
        panel.Children.Add(favList);
        RebuildFavList();

        var refreshBox = new NumberBox
        {
            Header = "自动刷新间隔（分钟）",
            Minimum = 5,
            Maximum = 180,
            SpinButtonPlacementMode = NumberBoxSpinButtonPlacementMode.Inline,
            Value = int.TryParse(_host.GetConfig(PluginId, "refresh_min"), out var rm) && rm > 0 ? rm : 30,
            Margin = new Thickness(0, 8, 0, 0)
        };
        refreshBox.ValueChanged += (_, _) =>
        {
            if (double.IsNaN(refreshBox.Value)) return;
            _host.SetConfig(PluginId, "refresh_min", ((int)refreshBox.Value).ToString());
            _widget?.ApplyRefreshInterval();
        };
        panel.Children.Add(refreshBox);

        _ = InitProvincesAsync(provinceCombo, savedAdcode);

        return panel;
    }

    void IPluginSettings.ResetConfig(IHostHandle host)
    {
        host.SetConfig(PluginId, "api_key", "");
        host.SetConfig(PluginId, "favorites", "[]");
        host.SetConfig(PluginId, "refresh_min", "30");
        host.SetConfig(PluginId, "location_mode", "auto");
        host.SetConfig(PluginId, "adcode", "");
        host.SetConfig(PluginId, "location_name", "");
        _widget?.Refresh();
    }

    async Task InitProvincesAsync(ComboBox provinceCombo, string? savedAdcode)
    {
        try
        {
            var provinces = await _service.GetProvincesAsync();
            provinceCombo.ItemsSource = provinces;

            if (savedAdcode is { Length: >= 2 })
            {
                var prefix = savedAdcode.Substring(0, 2);
                var province = provinces.FirstOrDefault(p => p.Adcode.Length >= 2 && p.Adcode.StartsWith(prefix));
                if (province != null)
                    provinceCombo.SelectedItem = province;
            }
        }
        catch (Exception ex)
        {
            _host.LogError($"[WeatherPlugin] InitProvincesAsync failed: {ex.Message}");
        }
    }

    async Task<string?> ResolveAdcodeAsync()
    {
        var mode = _host.GetConfig(PluginId, "location_mode") ?? "auto";
        return mode == "manual"
            ? _host.GetConfig(PluginId, "adcode")
            : (await _service.GetIpLocationAsync())?.Adcode;
    }

    IReadOnlyList<AgentTool> IAgentCapability.GetTools() => new[]
    {
        new AgentTool
        {
            Name = "query_weather",
            Description = "获取当前配置城市的实况天气（温度、天气现象、湿度、风向风力等）。"
        },
        new AgentTool
        {
            Name = "query_weather_forecast",
            Description = "获取当前配置城市的未来数天天气预报。"
        },
        new AgentTool
        {
            Name = "set_weather_location",
            Description = "设置天气定位：自动(IP)定位，或按城市名手动定位。",
            ParametersJsonSchema = """{"type":"object","properties":{"mode":{"type":"string","enum":["auto","manual"]},"city":{"type":"string","description":"手动模式下的城市名"}},"required":["mode"]}"""
        },
        new AgentTool { Name = "list_favorites", Description = "列出已收藏的天气城市。" },
        new AgentTool
        {
            Name = "add_favorite_city",
            Description = "按城市名添加一个收藏城市。",
            ParametersJsonSchema = """{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}"""
        },
        new AgentTool
        {
            Name = "query_weather_by_ip",
            Description = "通过IP自动定位查询当前设备所在地的天气（不改变widget显示的城市）。"
        },
        new AgentTool
        {
            Name = "query_weather_by_city",
            Description = "查询指定城市的天气（不改变widget显示的城市）。",
            ParametersJsonSchema = """{"type":"object","properties":{"city":{"type":"string"},"includeForecast":{"type":"boolean","description":"是否包含天气预报"}},"required":["city"]}"""
        }
    };

    async Task<string> IAgentCapability.InvokeAsync(string tool, string argumentsJson)
    {
        _host.Log($"Weather: agent invoke '{tool}' args={argumentsJson}");
        switch (tool)
        {
            case "query_weather":
            {
                var adcode = await ResolveAdcodeAsync();
                if (string.IsNullOrWhiteSpace(adcode)) return AgentJson.Error("no_location");
                var live = await _service.GetLiveAsync(adcode);
                return live == null ? AgentJson.Error("fetch_failed") : AgentJson.Serialize(live);
            }

            case "query_weather_forecast":
            {
                var adcode = await ResolveAdcodeAsync();
                if (string.IsNullOrWhiteSpace(adcode)) return AgentJson.Error("no_location");
                var forecast = await _service.GetForecastAsync(adcode);
                return forecast?.Casts is not { Count: > 0 }
                    ? AgentJson.Error("fetch_failed")
                    : AgentJson.Serialize(forecast);
            }

            case "set_weather_location":
            {
                var mode = AgentJson.GetString(argumentsJson, "mode") ?? "auto";
                if (mode != "manual")
                {
                    _host.SetConfig(PluginId, "location_mode", "auto");
                    _widget?.Refresh();
                    return AgentJson.Serialize(new { ok = true, mode = "auto" });
                }

                var city = AgentJson.GetString(argumentsJson, "city");
                if (string.IsNullOrWhiteSpace(city)) return AgentJson.Error("city_required");
                var resolved = await _service.ResolveLocationAsync(city.Trim());
                if (resolved == null) return AgentJson.Error("city_not_found");
                _host.SetConfig(PluginId, "location_mode", "manual");
                _host.SetConfig(PluginId, "adcode", resolved.Value.adcode);
                _host.SetConfig(PluginId, "location_name", resolved.Value.name);
                _widget?.Refresh();
                return AgentJson.Serialize(new { ok = true, mode = "manual", adcode = resolved.Value.adcode, name = resolved.Value.name });
            }

            case "list_favorites":
                return AgentJson.Serialize(new { ok = true, favorites = GetFavorites(_host) });

            case "add_favorite_city":
            {
                var city = AgentJson.GetString(argumentsJson, "city");
                if (string.IsNullOrWhiteSpace(city)) return AgentJson.Error("city_required");
                var resolved = await _service.ResolveLocationAsync(city.Trim());
                if (resolved == null) return AgentJson.Error("city_not_found");
                AddFavorite(_host, resolved.Value.adcode, resolved.Value.name);
                return AgentJson.Serialize(new { ok = true, favorites = GetFavorites(_host) });
            }

            case "switch_city":
            {
                var city = AgentJson.GetString(argumentsJson, "city");
                if (string.IsNullOrWhiteSpace(city)) return AgentJson.Error("city_required");
                var resolved = await _service.ResolveLocationAsync(city.Trim());
                if (resolved == null) return AgentJson.Error("city_not_found");
                _host.SetConfig(PluginId, "location_mode", "manual");
                _host.SetConfig(PluginId, "adcode", resolved.Value.adcode);
                _host.SetConfig(PluginId, "location_name", resolved.Value.name);
                _widget?.Refresh();
                return AgentJson.Serialize(new { ok = true, adcode = resolved.Value.adcode, name = resolved.Value.name });
            }

            case "query_weather_by_ip":
            {
                var ipResult = await _service.GetIpLocationAsync();
                if (ipResult == null) return AgentJson.Error("ip_locate_failed");
                var liveByIp = await _service.GetLiveAsync(ipResult.Adcode);
                return liveByIp == null ? AgentJson.Error("fetch_failed")
                    : AgentJson.Serialize(new { ok = true, city = ipResult.City, weather = liveByIp });
            }

            case "query_weather_by_city":
            {
                var city = AgentJson.GetString(argumentsJson, "city");
                if (string.IsNullOrWhiteSpace(city)) return AgentJson.Error("city_required");
                var resolved = await _service.ResolveLocationAsync(city.Trim());
                if (resolved == null) return AgentJson.Error("city_not_found");
                var live = await _service.GetLiveAsync(resolved.Value.adcode);
                if (live == null) return AgentJson.Error("fetch_failed");
                var includeFc = AgentJson.GetBool(argumentsJson, "includeForecast") ?? false;
                object result;
                if (includeFc)
                {
                    var fc = await _service.GetForecastAsync(resolved.Value.adcode);
                    result = new { ok = true, city = resolved.Value.name, weather = live, forecast = fc };
                }
                else
                {
                    result = new { ok = true, city = resolved.Value.name, weather = live };
                }
                return AgentJson.Serialize(result);
            }

            default:
                return AgentJson.Error("unknown_tool");
        }
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
