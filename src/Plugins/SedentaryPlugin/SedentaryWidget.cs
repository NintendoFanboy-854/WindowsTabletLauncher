using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using PluginContract;
using SharedUtils;
using Windows.UI;

namespace SedentaryPlugin;

public sealed class SedentaryWidget : UserControl
{
    readonly IHostHandle _host;
    readonly Func<SedentaryStats> _state;
    readonly Action _onReset;
    readonly BasePluginOverlay _overlay = new();
    InfoBar? _infoBar;

    Border _root = null!;
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
        _dot = new Ellipse { Width = 22, Height = 22, HorizontalAlignment = HorizontalAlignment.Center };
        _mins = new TextBlock { FontSize = 12, HorizontalAlignment = HorizontalAlignment.Center, Text = "0m" };

        var stack = new StackPanel { Spacing = 4, HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center };
        stack.Children.Add(_dot);
        stack.Children.Add(_mins);

        _root = new Border { CornerRadius = new CornerRadius(8), Padding = new Thickness(8), Child = stack };
        _root.Tapped += (_, _) => OpenDetail();
        Content = _root;
    }

    void ApplyTheme(ElementTheme theme)
    {
        _root.Background = (Brush)_host.GetWidgetBackgroundBrush();
        _mins.Foreground = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0x99, 0, 0, 0))
            : new SolidColorBrush(Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF));
    }

    static Color StatusColor(int active, int threshold)
    {
        var ratio = threshold > 0 ? (double)active / threshold : 0;
        if (ratio >= 1.0) return Color.FromArgb(0xFF, 0xE0, 0x3A, 0x3A);
        if (ratio >= 0.6) return Color.FromArgb(0xFF, 0xE0, 0xA0, 0x30);
        return Color.FromArgb(0xFF, 0x3A, 0xC0, 0x5A);
    }

    public void Refresh()
    {
        var s = _state();
        _dot.Fill = new SolidColorBrush(StatusColor(s.ActiveSeconds, s.ThresholdSeconds));
        _mins.Text = $"{s.ActiveSeconds / 60}m";
    }

    void OpenDetail()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        var primary = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A))
            : new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF));
        var secondary = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0x99, 0, 0, 0))
            : new SolidColorBrush(Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF));

        var s = _state();
        var body = new StackPanel { Spacing = 12, MinWidth = 340 };

        Row(body, "连续久坐", $"{s.ActiveSeconds / 60} 分钟", primary, secondary);
        Row(body, "今日累计", $"{s.TodaySeconds / 60} 分钟", primary, secondary);
        Row(body, "提醒阈值", $"{s.ThresholdSeconds / 60} 分钟", primary, secondary);
        Row(body, "起身次数", s.Breaks.ToString(), primary, secondary);

        var reset = new Button { Content = "我起来了", MinWidth = 120, HorizontalAlignment = HorizontalAlignment.Left };
        reset.Click += (_, _) => { _onReset(); Refresh(); };
        body.Children.Add(reset);

        body.Children.Add(new Border { Height = 1, Background = new SolidColorBrush(Color.FromArgb(0x30, 0x88, 0x88, 0x88)) });

        // hourly bar chart
        body.Children.Add(new TextBlock { Text = "今日分时久坐", FontSize = 14, FontWeight = FontWeights.SemiBold, Foreground = primary });
        var barData = s.Hourly.Select((v, i) => ($"{i:D2}", (double)v / 60d)).ToList();
        body.Children.Add(MiniChart.Bars(barData, new SolidColorBrush(Color.FromArgb(0xFF, 0x62, 0xA0, 0xE0)), secondary, 80));

        // 7-day line chart
        body.Children.Add(new TextBlock { Text = "近 7 天久坐总量", FontSize = 14, FontWeight = FontWeights.SemiBold, Foreground = primary, Margin = new Thickness(0, 8, 0, 0) });
        var lineData = s.Last7.Select(d => (d.date.ToString("MM-dd"), (double)d.minutes)).ToList();
        body.Children.Add(MiniChart.Line(lineData, new SolidColorBrush(Color.FromArgb(0xFF, 0xE0, 0x62, 0x40)), secondary));

        _overlay.Show(this, "久坐提醒", body, _host.Log);
    }

    static void Row(Panel container, string label, string value, Brush primary, Brush secondary)
    {
        var grid = new Grid();
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(96) });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        var l = new TextBlock { Text = label, FontSize = 14, Foreground = secondary };
        Grid.SetColumn(l, 0);
        var v = new TextBlock { Text = value, FontSize = 16, Foreground = primary };
        Grid.SetColumn(v, 1);
        grid.Children.Add(l);
        grid.Children.Add(v);
        container.Children.Add(grid);
    }

    internal void SetAcrylicBackground(Brush brush) => _root.Background = brush;

    public void ShowInfoBar(int minutes)
    {
        if (_infoBar != null) return;
        _infoBar = new InfoBar
        {
            Message = $"你已经连续坐了 {minutes} 分钟，起来活动一下吧！",
            Severity = InfoBarSeverity.Warning,
            IsOpen = true,
            ActionButton = new Button { Content = "我起来了" }
        };
        ((Button)_infoBar.ActionButton).Click += (_, _) => { _onReset(); HideInfoBar(); };
        _infoBar.CloseButtonClick += (_, _) => HideInfoBar();

        var parent = _root.Parent as Panel;
        parent?.Children.Add(_infoBar);
    }

    public void HideInfoBar()
    {
        if (_infoBar == null) return;
        _infoBar.IsOpen = false;
        var parent = _infoBar.Parent as Panel;
        parent?.Children.Remove(_infoBar);
        _infoBar = null;
    }

    public void ShowTeachingTipIfNeeded()
    {
        if (_root.XamlRoot == null) return;
        var tip = new TeachingTip
        {
            Target = _root,
            Title = "久坐提醒",
            Subtitle = "当你连续久坐超过阈值时，这里会提醒你起身活动。点击圆点可查看详细数据。",
            IsLightDismissEnabled = true,
            PreferredPlacement = TeachingTipPlacementMode.Bottom
        };
        tip.Closed += (_, _) => { };
        _root.Loaded += (_, _) => { tip.IsOpen = true; };
    }
}
