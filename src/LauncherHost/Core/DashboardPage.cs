using System.Text.Json;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;

namespace LauncherHost.Core;

public sealed class DashboardPage
{
    readonly IHostHandle _host;
    BasePluginOverlay? _overlay;

    public DashboardPage(IHostHandle host)
    {
        _host = host;
    }

    public void Show(FrameworkElement source)
    {
        if (source.XamlRoot == null || _overlay?.IsOpen == true) return;

        var theme = source.ActualTheme;
        var primary = Fluent.TextPrimary(theme);
        var secondary = Fluent.TextSecondary(theme);

        var body = new StackPanel { Spacing = Fluent.SpaceXL, MinWidth = 480 };

        var title = Fluent.Text("数据复盘", theme, "title", primary);
        title.Margin = new Thickness(0, 0, 0, Fluent.SpaceS);
        body.Children.Add(title);

        try
        {
            var allConfigs = _host.GetAllConfigs("");
            AddPomodoroSection(body, allConfigs, primary, secondary);
            AddTodoSection(body, allConfigs, primary, secondary);
            AddSedentarySection(body, allConfigs, primary, secondary);
        }
        catch (Exception ex)
        {
            body.Children.Add(Fluent.Text($"数据加载失败: {ex.Message}", theme, "body", secondary));
        }

        _overlay = new BasePluginOverlay();
        _overlay.Show(source, "数据复盘", body, _host.Log);
    }

    void AddPomodoroSection(StackPanel body, IReadOnlyList<(string pluginId, string key, string value)> configs, Brush primary, Brush secondary)
    {
        var theme = (App.MainWindow?.Content as FrameworkElement)?.ActualTheme ?? ElementTheme.Default;
        var statsRaw = configs.FirstOrDefault(c => c.pluginId == "PomodoroPlugin" && c.key == "stats").value;
        if (string.IsNullOrWhiteSpace(statsRaw)) return;

        body.Children.Add(Fluent.SectionTitle("番茄专注", theme, primary));

        try
        {
            var stats = JsonSerializer.Deserialize<Dictionary<string, int>>(statsRaw) ?? new();
            var todayKey = StatsHelper.TodayKey();
            var today = stats.TryGetValue(todayKey, out var tc) ? tc : 0;

            var bodyRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 32 };
            StatCard(bodyRow, "今日完成", today.ToString(), primary, secondary);
            StatCard(bodyRow, "累计完成", stats.Values.Sum().ToString(), primary, secondary);
            body.Children.Add(bodyRow);

            var last7 = new List<(string, double)>();
            for (int i = 6; i >= 0; i--)
            {
                var d = DateTime.Today.AddDays(-i).ToString("yyyy-MM-dd");
                last7.Add((d[5..], stats.TryGetValue(d, out var v) ? v : 0));
            }
            body.Children.Add(MiniChart.Bars(last7.Select(t => (t.Item1, t.Item2)).ToList(), Fluent.Accent(), secondary));
        }
        catch { }
    }

    void AddTodoSection(StackPanel body, IReadOnlyList<(string pluginId, string key, string value)> configs, Brush primary, Brush secondary)
    {
        var itemsRaw = configs.FirstOrDefault(c => c.pluginId == "TodoPlugin" && c.key == "items").value;
        if (string.IsNullOrWhiteSpace(itemsRaw)) return;

        var theme = (App.MainWindow?.Content as FrameworkElement)?.ActualTheme ?? ElementTheme.Default;
        body.Children.Add(Fluent.SectionTitle("待办事项", theme, primary));

        try
        {
            var items = JsonSerializer.Deserialize<List<JsonElement>>(itemsRaw);
            if (items == null) return;
            var doneCount = items.Count(i => i.TryGetProperty("Done", out var d) && d.GetBoolean());
            var overdueCount = 0;
            foreach (var i in items)
            {
                if (i.TryGetProperty("Done", out var d) && d.GetBoolean()) continue;
                if (i.TryGetProperty("Deadline", out var dl) && dl.ValueKind == JsonValueKind.String && DateTime.TryParse(dl.GetString(), out var dd) && dd < DateTime.Now) overdueCount++;
            }

            var bodyRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 32 };
            StatCard(bodyRow, "总计", items.Count.ToString(), primary, secondary);
            StatCard(bodyRow, "已完成", doneCount.ToString(), primary, secondary);
            StatCard(bodyRow, "逾期", overdueCount.ToString(), primary, secondary);
            body.Children.Add(bodyRow);
        }
        catch { }
    }

    void AddSedentarySection(StackPanel body, IReadOnlyList<(string pluginId, string key, string value)> configs, Brush primary, Brush secondary)
    {
        var historyRaw = configs.FirstOrDefault(c => c.pluginId == "SedentaryPlugin" && c.key == "history").value;
        if (string.IsNullOrWhiteSpace(historyRaw)) return;

        var theme = (App.MainWindow?.Content as FrameworkElement)?.ActualTheme ?? ElementTheme.Default;
        body.Children.Add(Fluent.SectionTitle("久坐统计", theme, primary));

        try
        {
            var history = JsonSerializer.Deserialize<Dictionary<string, int>>(historyRaw) ?? new();
            var todayKey = StatsHelper.TodayKey();
            var today = history.TryGetValue(todayKey, out var tm) ? tm : 0;

            var last7 = new List<(string, double)>();
            for (int i = 6; i >= 0; i--)
            {
                var d = DateTime.Today.AddDays(-i).ToString("yyyy-MM-dd");
                last7.Add((d[5..], history.TryGetValue(d, out var v) ? v : 0));
            }
            var weekAvg = last7.Average(t => t.Item2);

            var bodyRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 32 };
            StatCard(bodyRow, "今日久坐", $"{today} 分钟", primary, secondary);
            StatCard(bodyRow, "周平均", $"{weekAvg:F0} 分钟", primary, secondary);
            body.Children.Add(bodyRow);

            body.Children.Add(MiniChart.Line(last7, Fluent.Accent(), secondary));
        }
        catch { }
    }

    static void StatCard(Panel parent, string label, string value, Brush primary, Brush secondary)
    {
        var stack = new StackPanel { Spacing = Fluent.SpaceXS, MinWidth = 80 };
        var valueText = Fluent.Text(value, ElementTheme.Dark, "subtitle", primary);
        var labelText = Fluent.Text(label, ElementTheme.Dark, "caption", secondary);
        stack.Children.Add(valueText);
        stack.Children.Add(labelText);
        parent.Children.Add(stack);
    }
}
