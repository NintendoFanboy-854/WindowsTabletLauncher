using System.Text.Json;
using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;

namespace PomodoroPlugin;

public class PomodoroPlugin : IPlugin, IPluginSettings, IAgentCapability
{
    IHostHandle _host = null!;
    DispatcherQueue _dispatcher = null!;
    PomodoroWidget? _widget;

    public string DisplayName => "番茄钟";

    public string PluginId => nameof(PomodoroPlugin);

    public void Initialize(IHostHandle host)
    {
        _host = host;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
    }

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

    public void Shutdown() { }

    // ---- daily stats: date(yyyy-MM-dd) -> completed focus count ----

    static Dictionary<string, int> GetStats(IHostHandle host)
    {
        var raw = host.GetConfig(nameof(PomodoroPlugin), "stats");
        if (string.IsNullOrWhiteSpace(raw)) return new();
        try { return JsonSerializer.Deserialize<Dictionary<string, int>>(raw) ?? new(); }
        catch { return new(); }
    }

    internal static void AddCompletion(IHostHandle host)
    {
        var stats = GetStats(host);
        var key = DateTime.Today.ToString("yyyy-MM-dd");
        stats[key] = stats.TryGetValue(key, out var c) ? c + 1 : 1;
        // keep only recent 60 days
        foreach (var k in stats.Keys.Where(k => DateTime.TryParse(k, out var d) && (DateTime.Today - d).TotalDays > 60).ToList())
            stats.Remove(k);
        host.SetConfig(nameof(PomodoroPlugin), "stats", JsonSerializer.Serialize(stats));
        host.Log($"Pomodoro: completion recorded, today={stats[key]}");
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
        new AgentTool
        {
            Name = "start_pomodoro",
            Description = "开始一个专注计时，可指定分钟数（默认使用设置中的专注时长）。",
            ParametersJsonSchema = """{"type":"object","properties":{"minutes":{"type":"integer","minimum":1}}}"""
        },
        new AgentTool { Name = "pause_pomodoro", Description = "暂停当前番茄钟计时。" },
        new AgentTool { Name = "resume_pomodoro", Description = "继续当前番茄钟计时。" },
        new AgentTool { Name = "skip_pomodoro", Description = "跳过当前阶段（专注/休息）。" },
        new AgentTool { Name = "reset_pomodoro", Description = "重置当前阶段计时。" },
        new AgentTool { Name = "query_pomodoro_stats", Description = "获取番茄钟统计：今日完成数与近 7 天每日完成数。" }
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
                return Task.FromResult(AgentJson.Serialize(new
                {
                    ok = true,
                    today = last7.Count > 0 ? last7[^1].count : 0,
                    last7 = last7.Select(d => new { date = d.date.ToString("yyyy-MM-dd"), count = d.count })
                }));
            }

            default:
                return Task.FromResult(AgentJson.Error("unknown_tool"));
        }
    }

    class PomodoroWidgetInfo : IWidget
    {
        readonly IHostHandle _host;
        readonly PomodoroWidget _control;

        public PomodoroWidgetInfo(IHostHandle host, PomodoroWidget control)
        {
            _host = host;
            _control = control;
        }

        public string Id => "pomodoro.main";
        public int Columns => 2;
        public int Rows => 2;
        public WidgetBackdrop Backdrop => WidgetBackdrop.Acrylic;

        public object CreateControl()
        {
            _control.SetAcrylicBackground((Brush)_host.GetWidgetBackgroundBrush());
            return _control;
        }
    }
}
