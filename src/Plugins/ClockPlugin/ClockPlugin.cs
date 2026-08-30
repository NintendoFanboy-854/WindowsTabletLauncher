using System.Text.Json;
using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;

namespace ClockPlugin;

public class ClockPlugin : IPlugin, IAgentCapability, IPluginSettings
{
    IHostHandle _host = null!;
    DispatcherQueue _dispatcher = null!;
    ClockWidget? _widget;

    public string DisplayName => "时钟";

    public string PluginId => nameof(ClockPlugin);

    public void Initialize(IHostHandle host)
    {
        _host = host;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
    }

    internal static List<string> GetZones(IHostHandle host)
    {
        var raw = host.GetConfig(nameof(ClockPlugin), "world_zones");
        if (string.IsNullOrWhiteSpace(raw)) return new();
        try { return JsonSerializer.Deserialize<List<string>>(raw) ?? new(); }
        catch { return new(); }
    }

    static void SetZones(IHostHandle host, List<string> zones)
        => host.SetConfig(nameof(ClockPlugin), "world_zones", JsonSerializer.Serialize(zones));

    Task<string> OnUi(Func<string> action)
    {
        var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);
        if (_dispatcher.HasThreadAccess)
        {
            try { tcs.SetResult(action()); } catch (Exception ex) { tcs.SetException(ex); }
        }
        else if (_dispatcher.TryEnqueue(() =>
        {
            try { tcs.SetResult(action()); } catch (Exception ex) { tcs.SetException(ex); }
        }))
        {
            // enqueued
        }
        else
        {
            tcs.TrySetResult(AgentJson.Error("dispatcher_unavailable"));
        }
        return tcs.Task;
    }

    public IReadOnlyList<IWidget> GetWidgets()
    {
        _widget ??= new ClockWidget(_host);
        _widget.SetWidgetBackground((Brush)_host.GetWidgetBackgroundBrush());

        return new[]
        {
            new ClockWidgetInfo(_host, _widget)
        };
    }

    public void Shutdown()
    {
        _widget?.Stop();
    }

    object IPluginSettings.CreateSettingsControl()
    {
        var panel = new StackPanel { Spacing = 8, Margin = new Thickness(0, 8, 0, 4) };
        var combo = new ComboBox { Header = "时间格式" };

        var format24 = new ComboBoxItem { Tag = "HH:mm:ss", Content = "24 小时制 (HH:mm:ss)" };
        var format12 = new ComboBoxItem { Tag = "hh:mm:ss tt", Content = "12 小时制 (hh:mm:ss tt)" };
        combo.Items.Add(format24);
        combo.Items.Add(format12);

        combo.Loaded += (_, _) =>
        {
            var saved = _host.GetConfig(PluginId, "time_format") ?? "HH:mm:ss";
            combo.SelectedItem = saved.StartsWith("HH") ? format24 : format12;
        };

        combo.SelectionChanged += (_, _) =>
        {
            if (combo.SelectedItem is ComboBoxItem item)
            {
                var format = (string)item.Tag;
                _host.SetConfig(PluginId, "time_format", format);
                _widget?.ApplySettings();
            }
        };

        panel.Children.Add(combo);

        var seconds = new ToggleSwitch { Header = "显示秒", IsOn = (_host.GetConfig(PluginId, "show_seconds") ?? "true") == "true" };
        seconds.Toggled += (_, _) => { _host.SetConfig(PluginId, "show_seconds", seconds.IsOn ? "true" : "false"); _widget?.ApplySettings(); };
        panel.Children.Add(seconds);

        var lunar = new ToggleSwitch { Header = "显示农历", IsOn = (_host.GetConfig(PluginId, "show_lunar") ?? "false") == "true" };
        lunar.Toggled += (_, _) => { _host.SetConfig(PluginId, "show_lunar", lunar.IsOn ? "true" : "false"); _widget?.ApplySettings(); };
        panel.Children.Add(lunar);

        // world clock time zones
        panel.Children.Add(new TextBlock { Text = "世界时钟时区", FontWeight = Microsoft.UI.Text.FontWeights.SemiBold, Margin = new Thickness(0, 8, 0, 0) });

        var zoneCombo = new ComboBox { Header = "添加时区", HorizontalAlignment = HorizontalAlignment.Stretch };
        foreach (var tz in TimeZoneInfo.GetSystemTimeZones())
            zoneCombo.Items.Add(new ComboBoxItem { Content = tz.DisplayName, Tag = tz.Id });
        var zoneList = new StackPanel { Spacing = 6 };
        void RebuildZones()
        {
            zoneList.Children.Clear();
            foreach (var id in GetZones(_host))
            {
                string name = id;
                try { name = TimeZoneInfo.FindSystemTimeZoneById(id).DisplayName; } catch { }
                var row = new Grid();
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                var t = new TextBlock { Text = name, VerticalAlignment = VerticalAlignment.Center, TextTrimming = TextTrimming.CharacterEllipsis };
                Grid.SetColumn(t, 0);
                var del = new Button { Content = new FontIcon { Glyph = "\uE711", FontSize = 12 }, Background = new SolidColorBrush(Windows.UI.Color.FromArgb(0, 0, 0, 0)), BorderThickness = new Thickness(0) };
                del.Click += (_, _) => { var z = GetZones(_host); z.Remove(id); SetZones(_host, z); RebuildZones(); };
                Grid.SetColumn(del, 1);
                row.Children.Add(t);
                row.Children.Add(del);
                zoneList.Children.Add(row);
            }
        }
        zoneCombo.SelectionChanged += (_, _) =>
        {
            if (zoneCombo.SelectedItem is ComboBoxItem ci && ci.Tag is string id)
            {
                var z = GetZones(_host);
                if (!z.Contains(id)) { z.Add(id); SetZones(_host, z); RebuildZones(); }
                zoneCombo.SelectedIndex = -1;
            }
        };
        panel.Children.Add(zoneCombo);
        panel.Children.Add(zoneList);
        RebuildZones();

        return panel;
    }

    void IPluginSettings.ResetConfig(IHostHandle host)
    {
        host.SetConfig(PluginId, "time_format", "HH:mm:ss");
        host.SetConfig(PluginId, "show_seconds", "true");
        host.SetConfig(PluginId, "show_lunar", "false");
        host.SetConfig(PluginId, "world_zones", "[]");
        _widget?.ApplySettings();
    }

    IReadOnlyList<AgentTool> IAgentCapability.GetTools() => new[]
    {
        new AgentTool
        {
            Name = "query_time",
            Description = "获取当前时间、日期与星期。",
        },        new AgentTool
        {
            Name = "set_time_format",
            Description = "设置时钟的显示格式为 12 小时制或 24 小时制。",
            ParametersJsonSchema = """{"type":"object","properties":{"format":{"type":"string","enum":["12h","24h"]}},"required":["format"]}"""
        },
        new AgentTool
        {
            Name = "query_world_time",
            Description = "获取指定时区（IANA/Windows 时区 Id）的当前时间；不传则返回本地及已配置的世界时钟。",
            ParametersJsonSchema = """{"type":"object","properties":{"zone":{"type":"string","description":"时区 Id，可选"}}}"""
        }
    };

    Task<string> IAgentCapability.InvokeAsync(string tool, string argumentsJson)
    {
        _host.Log($"Clock: agent invoke '{tool}' args={argumentsJson}");
        switch (tool)
        {
            case "query_time":
            {
                var now = DateTime.Now;
                return Task.FromResult(AgentJson.Serialize(new
                {
                    time = now.ToString("HH:mm:ss"),
                    date = now.ToString("yyyy-MM-dd"),
                    weekday = (int)now.DayOfWeek,
                    format24 = (_host.GetConfig(PluginId, "time_format") ?? "HH:mm:ss").StartsWith("HH"),
                    lunar = ClockWidget.LunarString(now)
                }));
            }

            case "query_world_time":
            {
                var zone = AgentJson.GetString(argumentsJson, "zone");
                if (!string.IsNullOrWhiteSpace(zone))
                {
                    try
                    {
                        var tz = TimeZoneInfo.FindSystemTimeZoneById(zone);
                        var t = TimeZoneInfo.ConvertTime(DateTimeOffset.Now, tz);
                        return Task.FromResult(AgentJson.Serialize(new { ok = true, zone = tz.Id, name = tz.DisplayName, time = t.ToString("yyyy-MM-dd HH:mm:ss") }));
                    }
                    catch { return Task.FromResult(AgentJson.Error("zone_not_found")); }
                }
                var list = new List<object> { new { zone = "Local", time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") } };
                foreach (var id in GetZones(_host))
                {
                    try
                    {
                        var tz = TimeZoneInfo.FindSystemTimeZoneById(id);
                        var t = TimeZoneInfo.ConvertTime(DateTimeOffset.Now, tz);
                        list.Add(new { zone = tz.Id, name = tz.DisplayName, time = t.ToString("yyyy-MM-dd HH:mm:ss") });
                    }
                    catch { }
                }
                return Task.FromResult(AgentJson.Serialize(new { ok = true, clocks = list }));
            }

            case "set_time_format":
            {
                var fmt = AgentJson.GetString(argumentsJson, "format") ?? "24h";
                var use12 = fmt.Contains("12");
                var format = use12 ? "hh:mm:ss tt" : "HH:mm:ss";
                return OnUi(() =>
                {
                    _host.SetConfig(PluginId, "time_format", format);
                    _widget?.SetTimeFormat(format);
                    return AgentJson.Serialize(new { ok = true, format = use12 ? "12h" : "24h" });
                });
            }

            default:
                return Task.FromResult(AgentJson.Error("unknown_tool"));
        }
    }

    /// <summary>AI 状态快照 hook。</summary>
    string? IAgentCapability.GetContextSnapshot()
    {
        try
        {
            var now = DateTime.Now;
            var fmt = _host.GetConfig(PluginId, "time_format") ?? "HH:mm:ss";
            var zones = GetZones(_host);
            return $"时钟: 当前 {now:yyyy-MM-dd HH:mm:ss}（{(fmt.StartsWith("HH") ? "24" : "12")}小时制）农历 {ClockWidget.LunarString(now)}"
                + (zones.Count > 0 ? $"；世界时钟: {string.Join("、", zones)}" : "");
        }
        catch { return null; }
    }

    class ClockWidgetInfo : IWidget
    {
        readonly IHostHandle _host;
        readonly ClockWidget _control;

        public ClockWidgetInfo(IHostHandle host, ClockWidget control)
        {
            _host = host;
            _control = control;
        }

        public string Id => "clock.main";
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
