using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using PluginContract;
using SharedUtils;
using Windows.UI;

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

    Border _root = null!;
    Border _hoverLayer = null!;
    Ellipse _dot = null!;
    TextBlock _mins = null!;

    Color _lastStatusColor;
    Brush _statusBrush = new SolidColorBrush();

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

        var stack = new StackPanel { Spacing = 6, HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center };
        stack.Children.Add(_dot);
        stack.Children.Add(_mins);

        _root = new Border
        {
            CornerRadius = new CornerRadius(8),
            Padding = new Thickness(8),
            Child = stack
        };
        _hoverLayer = new Border
        {
            CornerRadius = new CornerRadius(8),
            Background = Fluent.SubtleHover(theme),
            Opacity = 0,
            IsHitTestVisible = false
        };

        var grid = new Grid();
        grid.Children.Add(_root);
        grid.Children.Add(_hoverLayer);

        _root.Tapped += (_, _) => OpenDetail();
        PointerEntered += (_, _) => _hoverLayer.Opacity = 1;
        PointerExited += (_, _) => _hoverLayer.Opacity = 0;
        Content = grid;
    }

    void ApplyTheme(ElementTheme theme)
    {
        _root.Background = (Brush)_host.GetWidgetBackgroundBrush();
        _root.BorderBrush = Fluent.CardStroke(theme);
        _root.BorderThickness = new Thickness(1);
        _hoverLayer.Background = Fluent.SubtleHover(theme);
        _mins.Foreground = Fluent.TextSecondary(theme);
    }

    Color StatusColor(int active, int threshold)
    {
        var ratio = threshold > 0 ? (double)active / threshold : 0;
        if (ratio >= 1.0) return Color.FromArgb(0xFF, 0xE0, 0x3A, 0x3A);
        if (ratio >= 0.6) return Color.FromArgb(0xFF, 0xE0, 0xA0, 0x30);
        return Color.FromArgb(0xFF, 0x3A, 0xC0, 0x5A);
    }

    public void Refresh()
    {
        var s = _state();
        var newColor = StatusColor(s.ActiveSeconds, s.ThresholdSeconds);
        if (newColor != _lastStatusColor)
        {
            _lastStatusColor = newColor;
            ((SolidColorBrush)_statusBrush).Color = newColor;
        }
        _dot.Fill = _statusBrush;
        _mins.Text = $"{s.ActiveSeconds / 60}m";
    }

    void OpenDetail()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        var s = _state();

        var body = new StackPanel { Spacing = 12 };

        // 统计 chips + 阈值进度条
        var stats = new (string, string)[]
        {
            ("连续久坐", $"{s.ActiveSeconds / 60} 分钟"),
            ("今日累计", $"{s.TodaySeconds / 60} 分钟"),
            ("提醒阈值", $"{s.ThresholdSeconds / 60} 分钟"),
            ("起身次数", s.Breaks.ToString()),
        };
        var chipGrid = new Grid { ColumnSpacing = 8 };
        foreach (var _ in stats) chipGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        for (int i = 0; i < stats.Length; i++)
        {
            var cell = new StackPanel { Spacing = 1 };
            cell.Children.Add(Fluent.Text(stats[i].Item1, theme, "caption", Fluent.TextTertiary(theme)));
            cell.Children.Add(Fluent.Text(stats[i].Item2, theme, "bodyStrong", Fluent.TextPrimary(theme)));
            var chip = Fluent.Card(theme, new Thickness(10, 6, 10, 8), 4);
            chip.Background = Fluent.CardBgSecondary(theme);
            chip.Child = cell;
            Grid.SetColumn(chip, i);
            chipGrid.Children.Add(chip);
        }
        var statsCard = Fluent.Card(theme, new Thickness(16, 14, 16, 16));
        var statsWrap = new StackPanel { Spacing = 10 };
        statsWrap.Children.Add(chipGrid);

        var ratio = s.ThresholdSeconds > 0 ? (double)s.ActiveSeconds / s.ThresholdSeconds : 0;
        var pb = new ProgressBar
        {
            Minimum = 0,
            Maximum = 100,
            Value = Math.Clamp(ratio * 100, 0, 100),
            Height = 4,
            CornerRadius = new CornerRadius(2)
        };
        pb.Foreground = ratio >= 1.0 ? Fluent.Critical(theme) : ratio >= 0.6 ? Fluent.Caution(theme) : Fluent.Success(theme);
        statsWrap.Children.Add(pb);
        statsWrap.Children.Add(Fluent.Text(
            ratio >= 1.0 ? "已达到提醒阈值，快起身活动！"
            : ratio >= 0.6 ? "接近提醒阈值，稍后休息一下"
            : "状态良好，继续保持",
            theme, "caption", Fluent.TextSecondary(theme)));
        statsCard.Child = statsWrap;
        body.Children.Add(statsCard);

        // 图表卡
        var chartBody = new StackPanel { Spacing = 10 };
        chartBody.Children.Add(Fluent.Text("今日分时久坐", theme, "bodyLargeStrong", Fluent.TextPrimary(theme)));
        var barData = s.Hourly.Select((v, i) => ($"{i:D2}", (double)v / 60d)).ToList();
        chartBody.Children.Add(MiniChart.Bars(barData, Fluent.Accent(), Fluent.TextSecondary(theme), 80));

        chartBody.Children.Add(Fluent.Text("近 7 天久坐总量", theme, "bodyLargeStrong", Fluent.TextPrimary(theme)));
        var lineData = s.Last7.Select(d => (d.date.ToString("MM-dd"), (double)d.minutes)).ToList();
        chartBody.Children.Add(MiniChart.Line(lineData, Fluent.Caution(theme), Fluent.TextSecondary(theme)));
        var chartCard = Fluent.Card(theme, new Thickness(16, 14, 16, 16));
        chartCard.Child = chartBody;
        body.Children.Add(chartCard);

        // 操作
        var reset = new Button { Content = "我起来了", MinWidth = 128, Padding = new Thickness(16, 6, 16, 8), HorizontalAlignment = HorizontalAlignment.Left };
        if (Application.Current.Resources.TryGetValue("AccentButtonStyle", out var accentStyle) && accentStyle is Style accent)
            reset.Style = accent;
        reset.Click += (_, _) => { _onReset(); Refresh(); };
        body.Children.Add(reset);

        _overlay.Show(this, "久坐提醒", body, _host.Log);
    }

    internal void SetWidgetBackground(Brush brush) => _root.Background = brush;

    public void ShowInfoBar(int minutes)
    {
        if (_infoBar != null) return;
        var parent = _root.Parent as Panel;
        if (parent == null) return;
        _infoBar = new InfoBar
        {
            Message = $"你已经连续坐了 {minutes} 分钟，起来活动一下吧！",
            Severity = InfoBarSeverity.Warning,
            IsOpen = true,
            ActionButton = new Button { Content = "我起来了" }
        };
        ((Button)_infoBar.ActionButton).Click += (_, _) => { _onReset(); HideInfoBar(); };
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
                Target = _root,
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
