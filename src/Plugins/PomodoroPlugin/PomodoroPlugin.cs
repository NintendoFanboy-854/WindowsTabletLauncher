using System.Runtime.InteropServices;
using System.Text.Json;
using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;

namespace PomodoroPlugin;

public class PomodoroPlugin : IPlugin, IPluginSettings, IAgentCapability
{
    IHostHandle _host = null!;
    DispatcherQueue _dispatcher = null!;
    PomodoroWidget? _widget;

    [DllImport("kernel32.dll")]
    static extern uint SetThreadExecutionState(uint esFlags);
    const uint ES_CONTINUOUS = 0x80000000;
    const uint ES_DISPLAY_REQUIRED = 0x00000002;
    const uint ES_SYSTEM_REQUIRED = 0x00000001;

    public string DisplayName => "番茄钟";
    public string PluginId => nameof(PomodoroPlugin);

    public void Initialize(IHostHandle host)
    {
        _host = host;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
        PomodoroWidget.PluginInstance = this;
    }

    bool AllowPause => (_host.GetConfig(PluginId, "allow_pause") ?? "true") == "true";
    bool KeepScreenOn => (_host.GetConfig(PluginId, "keep_screen_on") ?? "true") == "true";

    Task<string> OnUi(Func<string> action)
    {
        var tcs = new TaskCompletionSource<string>();
        if (_dispatcher.HasThreadAccess)
        {
            try { tcs.SetResult(action()); } catch (Exception ex) { tcs.SetException(ex); }
        }
        else
        {
            _dispatcher.TryEnqueue(() =>
            {
                try { tcs.SetResult(action()); } catch (Exception ex) { tcs.SetException(ex); }
            });
        }
        return tcs.Task;
    }

    public IReadOnlyList<IWidget> GetWidgets()
    {
        _widget ??= new PomodoroWidget(_host);
        _widget.SetAcrylicBackground((Brush)_host.GetWidgetBackgroundBrush());
        return new[] { new PomodoroWidgetInfo(_host, _widget) };
    }

    public void Shutdown()
    {
        SetThreadExecutionState(ES_CONTINUOUS);
    }

    internal void SetScreenOn(bool on)
    {
        if (on && KeepScreenOn)
            SetThreadExecutionState(ES_CONTINUOUS | ES_DISPLAY_REQUIRED | ES_SYSTEM_REQUIRED);
        else
            SetThreadExecutionState(ES_CONTINUOUS);
    }

    internal static Dictionary<string, int> GetStats(IHostHandle host)
    {
        var raw = host.GetConfig(nameof(PomodoroPlugin), "stats");
        if (string.IsNullOrWhiteSpace(raw)) return new();
        try { return JsonSerializer.Deserialize<Dictionary<string, int>>(raw) ?? new(); }
        catch { return new(); }
    }

    internal static void AddCompletion(IHostHandle host, string task, int focusMin)
    {
        var stats = GetStats(host);
        var key = StatsHelper.TodayKey();
        stats[key] = stats.TryGetValue(key, out var c) ? c + 1 : 1;
        StatsHelper.PruneOldEntries(stats, 60);
        host.SetConfig(nameof(PomodoroPlugin), "stats", JsonSerializer.Serialize(stats));

        var sessions = GetSessions(host);
        sessions.Add(new PomodoroSession
        {
            Date = key,
            Task = task,
            FocusMin = focusMin,
            Completed = true,
            Timestamp = DateTime.Now
        });
        while (sessions.Count > 500) sessions.RemoveAt(0);
        host.SetConfig(nameof(PomodoroPlugin), "sessions", JsonSerializer.Serialize(sessions));
        host.Log($"Pomodoro: completion recorded, today={stats[key]}, total sessions={sessions.Count}");
    }

    internal static List<PomodoroSession> GetSessions(IHostHandle host)
    {
        var raw = host.GetConfig(nameof(PomodoroPlugin), "sessions");
        if (string.IsNullOrWhiteSpace(raw)) return new();
        try { return JsonSerializer.Deserialize<List<PomodoroSession>>(raw) ?? new(); }
        catch { return new(); }
    }

    internal static List<(DateTime date, int count)> Last7(IHostHandle host)
    {
        var stats = GetStats(host);
        var list = new List<(DateTime, int)>();
        for (int i = 6; i >= 0; i--)
        {
            var d = DateTime.Today.AddDays(-i);
            stats.TryGetValue(d.ToString("yyyy-MM-dd"), out var c);
            list.Add((d, c));
        }
        return list;
    }

    internal static int[] HourlyDistribution(IHostHandle host)
    {
        var sessions = GetSessions(host);
        var recent = sessions.Where(s => (DateTime.Today - s.Timestamp.Date).TotalDays < 30);
        return StatsHelper.HourlyBuckets(recent.Select(s => (s.Timestamp, s.FocusMin * 60)));
    }

    object IPluginSettings.CreateSettingsControl()
    {
        var panel = new StackPanel { Spacing = 12, Margin = new Thickness(0, 8, 0, 4) };

        panel.Children.Add(MakeNumber("专注时长（分钟）", "focus_min", 25));
        panel.Children.Add(MakeNumber("休息时长（分钟）", "break_min", 5));
        panel.Children.Add(MakeNumber("长休息时长（分钟）", "long_break_min", 15));
        panel.Children.Add(MakeNumber("长休息间隔（个专注）", "long_break_every", 4));

        var autoStart = new ToggleSwitch { Header = "自动开始下一阶段", IsOn = (_host.GetConfig(PluginId, "auto_start") ?? "true") == "true" };
        autoStart.Toggled += (_, _) => _host.SetConfig(PluginId, "auto_start", autoStart.IsOn ? "true" : "false");
        panel.Children.Add(autoStart);

        var sound = new ToggleSwitch { Header = "完成提示音", IsOn = (_host.GetConfig(PluginId, "sound") ?? "true") == "true" };
        sound.Toggled += (_, _) => _host.SetConfig(PluginId, "sound", sound.IsOn ? "true" : "false");
        panel.Children.Add(sound);

        var pause = new ToggleSwitch { Header = "允许暂停", IsOn = AllowPause };
        pause.Toggled += (_, _) => _host.SetConfig(PluginId, "allow_pause", pause.IsOn ? "true" : "false");
        panel.Children.Add(pause);

        var screenOn = new ToggleSwitch { Header = "专注时屏幕常亮", IsOn = KeepScreenOn };
        screenOn.Toggled += (_, _) => _host.SetConfig(PluginId, "keep_screen_on", screenOn.IsOn ? "true" : "false");
        panel.Children.Add(screenOn);

        return panel;
    }

    NumberBox MakeNumber(string header, string key, int def)
    {
        var box = new NumberBox
        {
            Header = header,
            Minimum = 1,
            Maximum = 180,
            SpinButtonPlacementMode = NumberBoxSpinButtonPlacementMode.Inline,
            Value = int.TryParse(_host.GetConfig(PluginId, key), out var v) && v > 0 ? v : def
        };
        box.ValueChanged += (_, _) =>
        {
            if (double.IsNaN(box.Value)) return;
            _host.SetConfig(PluginId, key, ((int)box.Value).ToString());
            _widget?.ApplyDurations();
        };
        return box;
    }

    IReadOnlyList<AgentTool> IAgentCapability.GetTools() => new[]
    {
        new AgentTool { Name = "query_pomodoro", Description = "获取番茄钟当前状态（阶段、剩余秒数、是否运行）。" },
        new AgentTool { Name = "start_pomodoro", Description = "开始一个专注计时，可指定分钟数。", ParametersJsonSchema = """{"type":"object","properties":{"minutes":{"type":"integer","minimum":1}}}""" },
        new AgentTool { Name = "pause_pomodoro", Description = "暂停当前番茄钟计时（需要允许暂停设置开启）。" },
        new AgentTool { Name = "resume_pomodoro", Description = "继续当前番茄钟计时。" },
        new AgentTool { Name = "skip_pomodoro", Description = "跳过当前阶段（专注/休息）。" },
        new AgentTool { Name = "reset_pomodoro", Description = "重置当前阶段计时。" },
        new AgentTool { Name = "query_pomodoro_stats", Description = "获取番茄钟统计：今日完成数、近7天每日完成数、累计总数、累计分钟。" },
        new AgentTool { Name = "query_pomodoro_sessions", Description = "获取最近N条番茄专注记录（任务、时长、时间）。", ParametersJsonSchema = """{"type":"object","properties":{"count":{"type":"integer","minimum":1,"maximum":100}}}""" },
        new AgentTool { Name = "query_pomodoro_distribution", Description = "获取近30天专注时间分时分布（24小时各小时分钟数）。" },
        new AgentTool { Name = "set_white_noise", Description = "设置白噪音类型：rain/fire/cafe/none。", ParametersJsonSchema = """{"type":"object","properties":{"name":{"type":"string","enum":["rain","fire","cafe","none"]}},"required":["name"]}""" },
        new AgentTool { Name = "query_white_noise", Description = "查询当前白噪音状态和类型。" },
        new AgentTool { Name = "enter_immersive", Description = "进入沉浸模式（大字体倒计时）。" },
        new AgentTool { Name = "exit_immersive", Description = "退出沉浸模式。" },
    };

    Task<string> IAgentCapability.InvokeAsync(string tool, string argumentsJson)
    {
        _host.Log($"Pomodoro: agent invoke '{tool}' args={argumentsJson}");
        switch (tool)
        {
            case "query_pomodoro":
                return OnUi(() => _widget?.StateJson() ?? AgentJson.Error("not_ready"));

            case "start_pomodoro":
            {
                var minutes = AgentJson.GetInt(argumentsJson, "minutes")
                    ?? (int.TryParse(_host.GetConfig(PluginId, "focus_min"), out var f) && f > 0 ? f : 25);
                return OnUi(() => { _widget?.StartFocus(minutes); return _widget?.StateJson() ?? AgentJson.Error("not_ready"); });
            }

            case "pause_pomodoro":
                if (!AllowPause) return Task.FromResult(AgentJson.Serialize(new { ok = false, error = "pause_disabled" }));
                return OnUi(() => { _widget?.Pause(); return _widget?.StateJson() ?? AgentJson.Error("not_ready"); });

            case "resume_pomodoro":
                return OnUi(() => { _widget?.Resume(); return _widget?.StateJson() ?? AgentJson.Error("not_ready"); });

            case "skip_pomodoro":
                return OnUi(() => { _widget?.Skip(); return _widget?.StateJson() ?? AgentJson.Error("not_ready"); });

            case "reset_pomodoro":
                return OnUi(() => { _widget?.ResetTimer(); return _widget?.StateJson() ?? AgentJson.Error("not_ready"); });

            case "query_pomodoro_stats":
            {
                var last7 = Last7(_host);
                var sessions = GetSessions(_host);
                var totalCompleted = sessions.Count(s => s.Completed);
                var totalMinutes = sessions.Where(s => s.Completed).Sum(s => s.FocusMin);
                return Task.FromResult(AgentJson.Serialize(new
                {
                    ok = true,
                    today = last7.Count > 0 ? last7[^1].count : 0,
                    last7 = last7.Select(d => new { date = d.date.ToString("yyyy-MM-dd"), count = d.count }),
                    totalCompleted,
                    totalMinutes
                }));
            }

            case "query_pomodoro_sessions":
            {
                var count = AgentJson.GetInt(argumentsJson, "count") ?? 20;
                var sessions = GetSessions(_host);
                var result = sessions.OrderByDescending(s => s.Timestamp).Take(Math.Min(count, 100)).Select(s => new
                {
                    s.Date,
                    s.Task,
                    s.FocusMin,
                    s.Completed,
                    timestamp = s.Timestamp.ToString("yyyy-MM-dd HH:mm:ss")
                });
                return Task.FromResult(AgentJson.Serialize(new { ok = true, sessions = result }));
            }

            case "query_pomodoro_distribution":
            {
                var hourly = HourlyDistribution(_host);
                var labels = Enumerable.Range(0, 24).Select(h => $"{h:D2}").ToArray();
                return Task.FromResult(AgentJson.Serialize(new { ok = true, hourly = labels.Zip(hourly.Select(v => v / 60), (l, m) => new { hour = l, minutes = m }) }));
            }

            case "set_white_noise":
            {
                var name = AgentJson.GetString(argumentsJson, "name") ?? "none";
                return OnUi(() => { _widget?.SetWhiteNoise(name.ToLowerInvariant()); return AgentJson.Serialize(new { ok = true, whiteNoise = name }); });
            }

            case "query_white_noise":
            {
                var current = _host.GetConfig(PluginId, "white_noise") ?? "none";
                return Task.FromResult(AgentJson.Serialize(new { ok = true, whiteNoise = current }));
            }

            case "enter_immersive":
                return OnUi(() => { _widget?.EnterImmersive(); return AgentJson.Serialize(new { ok = true }); });

            case "exit_immersive":
                return OnUi(() => { _widget?.ExitImmersive(); return AgentJson.Serialize(new { ok = true }); });

            default:
                return Task.FromResult(AgentJson.Error("unknown_tool"));
        }
    }

    class PomodoroWidgetInfo : IWidget
    {
        readonly IHostHandle _host;
        readonly PomodoroWidget _control;
        public PomodoroWidgetInfo(IHostHandle host, PomodoroWidget control) { _host = host; _control = control; }
        public string Id => "pomodoro.main";
        public int Columns => 2;
        public int Rows => 2;
        public WidgetBackdrop Backdrop => WidgetBackdrop.Acrylic;
        public object CreateControl() { _control.SetAcrylicBackground((Brush)_host.GetWidgetBackgroundBrush()); return _control; }
    }
}
