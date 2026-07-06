using System.Runtime.InteropServices;
using System.Text.Json;
using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;

namespace SedentaryPlugin;

public sealed record SedentaryStats(
    int ActiveSeconds,
    int TodaySeconds,
    int ThresholdSeconds,
    int Breaks,
    int[] Hourly,
    List<(DateTime date, int minutes)> Last7);

public class SedentaryPlugin : IPlugin, IPluginSettings, IAgentCapability
{
    const int PollSeconds = 15;

    IHostHandle _host = null!;
    DispatcherQueue _dispatcher = null!;
    SedentaryWidget? _widget;
    DispatcherQueueTimer? _monitor;

    int _activeSeconds;
    int _todaySeconds;
    int _breaksToday;
    readonly int[] _hourly = new int[24];
    DateTime _today = DateTime.Today;
    long _lastReminderTick;
    int _persistCounter;

    public string DisplayName => "久坐提醒";

    public string PluginId => nameof(SedentaryPlugin);

    public void Initialize(IHostHandle host)
    {
        _host = host;

        _dispatcher = DispatcherQueue.GetForCurrentThread();
        _monitor = _dispatcher.CreateTimer();
        _monitor.Interval = TimeSpan.FromSeconds(PollSeconds);
        _monitor.IsRepeating = true;
        _monitor.Tick += (_, _) => Poll();
        _monitor.Start();
    }

    public IReadOnlyList<IWidget> GetWidgets()
    {
        _widget ??= new SedentaryWidget(_host, StatsSnapshot, ResetActive);
        _widget.SetAcrylicBackground((Brush)_host.GetWidgetBackgroundBrush());
        return new[] { new SedentaryWidgetInfo(_host, _widget) };
    }

    public void Shutdown() { _monitor?.Stop(); SaveHistory(); }

    int ThresholdMin => GetInt("threshold_min", 60);
    int CooldownMin => GetInt("cooldown_min", 10);
    int BreakMin => GetInt("break_min", 5);
    int ActiveStart => GetInt("active_start", 9);
    int ActiveEnd => GetInt("active_end", 22);
    bool Enabled => (_host.GetConfig(PluginId, "enabled") ?? "true") == "true";

    int GetInt(string key, int def)
        => int.TryParse(_host.GetConfig(PluginId, key), out var v) && v >= 0 ? v : def;

    bool InActiveWindow(DateTime now)
    {
        int s = ActiveStart, e = ActiveEnd;
        if (s == e) return true;         // full day
        if (s < e) return now.Hour >= s && now.Hour < e;
        return now.Hour >= s || now.Hour < e; // wraps midnight
    }

    SedentaryStats StatsSnapshot()
        => new(_activeSeconds, _todaySeconds, ThresholdMin * 60, _breaksToday, (int[])_hourly.Clone(), Last7());

    void Poll()
    {
        if (DateTime.Today != _today)
        {
            SaveHistory();
            _today = DateTime.Today;
            _todaySeconds = 0;
            _breaksToday = 0;
            Array.Clear(_hourly);
        }

        if (!Enabled)
        {
            _widget?.Refresh();
            return;
        }

        var now = DateTime.Now;
        var idleMs = GetIdleMilliseconds();

        if (idleMs >= BreakMin * 60_000L)
        {
            if (_activeSeconds >= 300) _breaksToday++;   // counts as a real break
            _activeSeconds = 0;
        }
        else if (idleMs < PollSeconds * 1000L)
        {
            _activeSeconds += PollSeconds;
            _todaySeconds += PollSeconds;
            _hourly[now.Hour] += PollSeconds;

            if (_activeSeconds >= ThresholdMin * 60 && InActiveWindow(now))
            {
                var tick = Environment.TickCount64;
                if (tick - _lastReminderTick >= CooldownMin * 60_000L)
                {
                    _lastReminderTick = tick;
                    _host.Log($"Sedentary: reminder at {_activeSeconds / 60}min continuous");
                    _host.ShowNotification(
                        "久坐提醒",
                        $"你已经连续坐了 {_activeSeconds / 60} 分钟，起来活动一下吧。",
                        escalate: true);
                }
            }
        }

        if (++_persistCounter >= 8) { _persistCounter = 0; SaveHistory(); }
        _widget?.Refresh();
    }

    void ResetActive()
    {
        if (_activeSeconds >= 300) _breaksToday++;
        _activeSeconds = 0;
        _lastReminderTick = Environment.TickCount64;
        _widget?.Refresh();
    }

    // ---- daily history: date(yyyy-MM-dd) -> total sitting minutes ----

    Dictionary<string, int> LoadHistory()
    {
        var raw = _host.GetConfig(PluginId, "history");
        if (string.IsNullOrWhiteSpace(raw)) return new();
        try { return JsonSerializer.Deserialize<Dictionary<string, int>>(raw) ?? new(); }
        catch { return new(); }
    }

    void SaveHistory()
    {
        var h = LoadHistory();
        h[_today.ToString("yyyy-MM-dd")] = _todaySeconds / 60;
        foreach (var k in h.Keys.Where(k => DateTime.TryParse(k, out var d) && (DateTime.Today - d).TotalDays > 60).ToList())
            h.Remove(k);
        _host.SetConfig(PluginId, "history", JsonSerializer.Serialize(h));
    }

    List<(DateTime date, int minutes)> Last7()
    {
        var h = LoadHistory();
        h[_today.ToString("yyyy-MM-dd")] = _todaySeconds / 60;
        var list = new List<(DateTime, int)>();
        for (int i = 6; i >= 0; i--)
        {
            var d = DateTime.Today.AddDays(-i);
            h.TryGetValue(d.ToString("yyyy-MM-dd"), out var m);
            list.Add((d, m));
        }
        return list;
    }

    static long GetIdleMilliseconds()
    {
        var info = new LASTINPUTINFO { cbSize = (uint)Marshal.SizeOf<LASTINPUTINFO>() };
        if (!GetLastInputInfo(ref info)) return 0;
        return unchecked((uint)Environment.TickCount - info.dwTime);
    }

    [StructLayout(LayoutKind.Sequential)]
    struct LASTINPUTINFO
    {
        public uint cbSize;
        public uint dwTime;
    }

    [DllImport("user32.dll")]
    static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);

    object IPluginSettings.CreateSettingsControl()
    {
        var panel = new StackPanel { Spacing = 12, Margin = new Thickness(0, 8, 0, 4) };

        var enable = new ToggleSwitch { Header = "启用久坐监控", IsOn = Enabled };
        enable.Toggled += (_, _) => _host.SetConfig(PluginId, "enabled", enable.IsOn ? "true" : "false");
        panel.Children.Add(enable);

        panel.Children.Add(MakeNumber("久坐阈值（分钟）", "threshold_min", 60, 240));
        panel.Children.Add(MakeNumber("提醒冷却（分钟）", "cooldown_min", 10, 120));

        panel.Children.Add(new TextBlock { Text = "活跃时段", FontWeight = Microsoft.UI.Text.FontWeights.SemiBold, Margin = new Thickness(0, 8, 0, 0) });
        var from = MakeNumber("开始（时）", "active_start", 9, 23);
        var to = MakeNumber("结束（时）", "active_end", 22, 23);
        var row = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 12 };
        row.Children.Add(from);
        row.Children.Add(to);
        panel.Children.Add(row);

        return panel;
    }

    NumberBox MakeNumber(string header, string key, int def, int max)
    {
        var box = new NumberBox
        {
            Header = header,
            Minimum = 1,
            Maximum = max,
            SpinButtonPlacementMode = NumberBoxSpinButtonPlacementMode.Inline,
            Value = int.TryParse(_host.GetConfig(PluginId, key), out var v) && v > 0 ? v : def
        };
        box.ValueChanged += (_, _) =>
        {
            if (!double.IsNaN(box.Value))
                _host.SetConfig(PluginId, key, ((int)box.Value).ToString());
        };
        return box;
    }

    IReadOnlyList<AgentTool> IAgentCapability.GetTools() => new[]
    {
        new AgentTool { Name = "query_sitting_time", Description = "获取连续久坐时长、今日累计久坐时长与提醒阈值。" },
        new AgentTool { Name = "reset_sitting", Description = "重置连续久坐计时（用户已起身活动）。" },
        new AgentTool
        {
            Name = "set_sedentary_enabled",
            Description = "开启或关闭久坐监控。",
            ParametersJsonSchema = """{"type":"object","properties":{"enabled":{"type":"boolean"}},"required":["enabled"]}"""
        },
        new AgentTool
        {
            Name = "set_sedentary_threshold",
            Description = "设置久坐提醒阈值（分钟）。",
            ParametersJsonSchema = """{"type":"object","properties":{"minutes":{"type":"integer","minimum":1}},"required":["minutes"]}"""
        },
        new AgentTool { Name = "query_sedentary_stats", Description = "获取久坐统计：连续久坐、今日分钟、起身次数、分时数据、近7天。" }
    };

    Task<string> IAgentCapability.InvokeAsync(string tool, string argumentsJson)
    {
        _host.Log($"Sedentary: agent invoke '{tool}' args={argumentsJson}");
        switch (tool)
        {
            case "query_sitting_time":
                return Task.FromResult(AgentJson.Serialize(new
                {
                    continuousMinutes = _activeSeconds / 60,
                    todayMinutes = _todaySeconds / 60,
                    thresholdMinutes = ThresholdMin,
                    enabled = Enabled
                }));

            case "reset_sitting":
                if (_dispatcher.HasThreadAccess) ResetActive();
                else _dispatcher.TryEnqueue(ResetActive);
                return Task.FromResult(AgentJson.Serialize(new { ok = true, continuousMinutes = 0 }));

            case "set_sedentary_enabled":
            {
                var on = AgentJson.GetBool(argumentsJson, "enabled") ?? true;
                _host.SetConfig(PluginId, "enabled", on ? "true" : "false");
                return Task.FromResult(AgentJson.Serialize(new { ok = true, enabled = on }));
            }

            case "set_sedentary_threshold":
            {
                var mins = AgentJson.GetInt(argumentsJson, "minutes");
                if (mins is not > 0) return Task.FromResult(AgentJson.Error("invalid_minutes"));
                _host.SetConfig(PluginId, "threshold_min", mins.Value.ToString());
                return Task.FromResult(AgentJson.Serialize(new { ok = true, thresholdMinutes = mins.Value }));
            }

            case "query_sedentary_stats":
            {
                var s = StatsSnapshot();
                return Task.FromResult(AgentJson.Serialize(new
                {
                    ok = true,
                    continuousMinutes = s.ActiveSeconds / 60,
                    todayMinutes = s.TodaySeconds / 60,
                    thresholdMinutes = s.ThresholdSeconds / 60,
                    breaks = s.Breaks,
                    hourly = s.Hourly.Select(v => v / 60),
                    last7 = s.Last7.Select(d => new { date = d.date.ToString("yyyy-MM-dd"), minutes = d.minutes }),
                    activeWindow = new { start = ActiveStart, end = ActiveEnd }
                }));
            }

            default:
                return Task.FromResult(AgentJson.Error("unknown_tool"));
        }
    }

    class SedentaryWidgetInfo : IWidget
    {
        readonly IHostHandle _host;
        readonly SedentaryWidget _control;

        public SedentaryWidgetInfo(IHostHandle host, SedentaryWidget control)
        {
            _host = host;
            _control = control;
        }

        public string Id => "sedentary.dot";
        public int Columns => 1;
        public int Rows => 1;
        public int HalfColumns => 1;
        public int HalfRows => 1;
        public WidgetBackdrop Backdrop => WidgetBackdrop.Acrylic;

        public object CreateControl()
        {
            _control.SetAcrylicBackground((Brush)_host.GetWidgetBackgroundBrush());
            return _control;
        }
    }
}
