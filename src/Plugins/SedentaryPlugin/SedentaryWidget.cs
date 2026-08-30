using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using PluginContract;
using SharedUtils;

namespace SedentaryPlugin;

/// <summary>
/// 久坐提醒 tile（Fluent 2）：状态点（Success/Caution/Critical 语义色）+ 字阶 + 卡片描边 + hover；
/// overlay：统计 chips 卡 + 分时/近7天图表卡 + accent 主按钮。
/// </summary>
public sealed class SedentaryWidget : UserControl
{
    readonly IHostHandle _host;
    readonly Func<SedentaryStats> _state;
    readonly Action _onReset;
    readonly BasePluginOverlay _overlay = new();
    InfoBar? _infoBar;

    WidgetTile _tile = null!;
    Ellipse _dot = null!;
    TextBlock _mins = null!;

    public SedentaryWidget(IHostHandle host, Func<SedentaryStats> state, Action onReset)
    {
        _host = host;
        _state = state;
        _onReset = onReset;

        BuildUi();
        Loaded += (_, _) => { ApplyTheme(((FrameworkElement)this).ActualTheme); Refresh(); };
        ActualThemeChanged += (_, _) => { ApplyTheme(((FrameworkElement)this).ActualTheme); Refresh(); };
    }

    void BuildUi()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        _dot = new Ellipse { Width = 22, Height = 22, HorizontalAlignment = HorizontalAlignment.Center };
        _mins = Fluent.Text("0m", theme, "caption", Fluent.TextSecondary(theme));
        _mins.HorizontalAlignment = HorizontalAlignment.Center;

        var stack = new StackPanel { Spacing = Fluent.SpaceS, HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center };
        stack.Children.Add(_dot);
        stack.Children.Add(_mins);

        var content = new Grid { Padding = new Thickness(Fluent.SpaceS) };
        content.Children.Add(stack);

        _tile = WidgetTile.Create(content, "久坐提醒").Tap(OpenDetail);
        Content = _tile;
    }

    void ApplyTheme(ElementTheme theme)
    {
        _tile.ApplyTheme(theme, (Brush)_host.GetWidgetBackgroundBrush());
        _mins.Foreground = Fluent.TextSecondary(theme);
        Refresh();
    }

    /// <summary>状态点画刷：直接使用 Fluent 语义色（Success/Caution/Critical），与进度条一致。</summary>
    Brush StatusBrush(int active, int threshold, ElementTheme theme)
    {
        var ratio = threshold > 0 ? (double)active / threshold : 0;
        if (ratio >= 1.0) return Fluent.Critical(theme);
        if (ratio >= 0.6) return Fluent.Caution(theme);
        return Fluent.Success(theme);
    }

    public void Refresh()
    {
        var s = _state();
        _dot.Fill = StatusBrush(s.ActiveSeconds, s.ThresholdSeconds, ((FrameworkElement)this).ActualTheme);
        _mins.Text = $"{s.ActiveSeconds / 60}m";
    }

    void OpenDetail()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        var s = _state();

        var body = new StackPanel { Spacing = Fluent.SpaceM };

        // 统计 chips + 阈值进度条
        var stats = new (string, string)[]
        {
            ("连续久坐", $"{s.ActiveSeconds / 60} 分钟"),
            ("今日累计", $"{s.TodaySeconds / 60} 分钟"),
            ("提醒阈值", $"{s.ThresholdSeconds / 60} 分钟"),
            ("起身次数", s.Breaks.ToString()),
        };
        var chipGrid = new Grid { ColumnSpacing = Fluent.SpaceS };
        foreach (var _ in stats) chipGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        for (int i = 0; i < stats.Length; i++)
        {
            var chip = Fluent.StatTile(stats[i].Item1, stats[i].Item2, theme);
            Grid.SetColumn(chip, i);
            chipGrid.Children.Add(chip);
        }
        var statsCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceL));
        var statsWrap = new StackPanel { Spacing = Fluent.SpaceS };
        statsWrap.Children.Add(chipGrid);

        var ratio = s.ThresholdSeconds > 0 ? (double)s.ActiveSeconds / s.ThresholdSeconds : 0;
        var pb = new ProgressBar
        {
            Minimum = 0,
            Maximum = 100,
            Value = Math.Clamp(ratio * 100, 0, 100),
            Height = 4,
            CornerRadius = new CornerRadius(2),
            Foreground = StatusBrush(s.ActiveSeconds, s.ThresholdSeconds, theme)
        };
        statsWrap.Children.Add(pb);
        statsWrap.Children.Add(Fluent.Text(
            ratio >= 1.0 ? "已达到提醒阈值，快起身活动！"
            : ratio >= 0.6 ? "接近提醒阈值，稍后休息一下"
            : "状态良好，继续保持",
            theme, "caption", Fluent.TextSecondary(theme)));
        statsCard.Child = statsWrap;
        body.Children.Add(statsCard);

        // 图表卡
        var chartBody = new StackPanel { Spacing = Fluent.SpaceS };
        chartBody.Children.Add(Fluent.SectionTitle("今日分时久坐", theme));
        var barData = s.Hourly.Select((v, i) => ($"{i:D2}", (double)v / 60d)).ToList();
        chartBody.Children.Add(MiniChart.Bars(barData, Fluent.Accent(), Fluent.TextSecondary(theme), 80));

        chartBody.Children.Add(Fluent.SectionTitle("近 7 天久坐总量", theme));
        var lineData = s.Last7.Select(d => (d.date.ToString("MM-dd"), (double)d.minutes)).ToList();
        chartBody.Children.Add(MiniChart.Line(lineData, Fluent.Accent(), Fluent.TextSecondary(theme)));
        var chartCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceL));
        chartCard.Child = chartBody;
        body.Children.Add(chartCard);

        // 操作
        var reset = Fluent.Cta("我起来了", () => { _onReset(); Refresh(); }, accent: true);
        reset.HorizontalAlignment = HorizontalAlignment.Left;
        body.Children.Add(reset);

        _overlay.Show(this, "久坐提醒", body, _host.Log);
    }

    internal void SetWidgetBackground(Brush brush) => _tile.ApplyTheme(((FrameworkElement)this).ActualTheme, brush);

    public void ShowInfoBar(int minutes)
    {
        if (_infoBar != null) return;
        var parent = _tile.Root.Parent as Panel;
        if (parent == null) return;
        _infoBar = new InfoBar
        {
            Message = $"你已经连续坐了 {minutes} 分钟，起来活动一下吧！",
            Severity = InfoBarSeverity.Warning,
            IsOpen = true,
            ActionButton = Fluent.Cta("我起来了", () => { _onReset(); HideInfoBar(); })
        };
        _infoBar.CloseButtonClick += (_, _) => HideInfoBar();
        parent.Children.Add(_infoBar);
    }

    public void HideInfoBar()
    {
        if (_infoBar == null) return;
        _infoBar.IsOpen = false;
        var parent = _infoBar.Parent as Panel;
        parent?.Children.Remove(_infoBar);
        _infoBar = null;
    }

    /// <summary>
    /// 首次使用引导。控件可能尚未进入可视树，因此统一等 Loaded 后再弹出；
    /// 提示关闭（含 light dismiss）后回调 onShown，由插件标记 first_run=false。
    /// </summary>
    public void ShowTeachingTipIfNeeded(Action? onShown = null)
    {
        if (_tipShown) return;
        _tipShown = true;

        void ShowTip()
        {
            var tip = new TeachingTip
            {
                Target = _tile.Root,
                Title = "久坐提醒",
                Subtitle = "当你连续久坐超过阈值时，这里会提醒你起身活动。点击圆点可查看详细数据。",
                IsLightDismissEnabled = true,
                PreferredPlacement = TeachingTipPlacementMode.Bottom
            };
            tip.Closed += (_, _) => onShown?.Invoke();
            tip.IsOpen = true;
        }

        if (this.XamlRoot != null && this.IsLoaded)
        {
            ShowTip();
        }
        else
        {
            RoutedEventHandler onLoaded = null!;
            onLoaded = (_, _) =>
            {
                Loaded -= onLoaded;
                ShowTip();
            };
            Loaded += onLoaded;
        }
    }

    bool _tipShown;
}
