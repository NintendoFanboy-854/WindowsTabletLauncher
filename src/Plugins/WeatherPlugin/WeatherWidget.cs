using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Media.Imaging;
using PluginContract;
using SharedUtils;
using Windows.UI;

namespace WeatherPlugin;

/// <summary>
/// 天气 tile（Fluent 2）：主题资源画刷 + 字阶（Title 28 温度 / BodyStrong 现象 / Caption 辅助）+
/// 卡片 8px 圆角 + 1px 卡片描边 + Subtle hover 反馈 + InfoBadge 预警计数。
/// </summary>
public sealed class WeatherWidget : UserControl
{
    readonly IHostHandle _host;
    readonly QWeatherService _service;
    readonly DispatcherQueue _dispatcher;
    readonly DispatcherQueueTimer _timer;
    readonly BasePluginOverlay _overlay = new();

    Border _root = null!;
    Border _hoverLayer = null!;
    Panel _iconHost = null!;
    TextBlock _temp = null!;
    TextBlock _condition = null!;
    TextBlock _city = null!;
    TextBlock _details = null!;
    Grid _alertRow = null!;
    InfoBadge _alertBadge = null!;

    QLocation? _loc;
    QCurrentWeather? _lastCurrent;
    List<QAlert> _alerts = new();
    bool _isRefreshing;

    public WeatherWidget(IHostHandle host, QWeatherService service)
    {
        _host = host;
        _service = service;
        _dispatcher = DispatcherQueue.GetForCurrentThread();

        BuildUi();

        Loaded += (_, _) => { ApplyTheme(); _ = RefreshAsync(); };
        ActualThemeChanged += (_, _) => ApplyTheme();

        _timer = _dispatcher.CreateTimer();
        _timer.Interval = TimeSpan.FromMinutes(_service.RefreshMinutes);
        _timer.IsRepeating = true;
        _timer.Tick += (_, _) => _ = RefreshAsync();
        _timer.Start();
    }

    public IHostHandle Host => _host;
    public QWeatherService Service => _service;
    public QLocation? CurrentLocation => _loc;
    public QCurrentWeather? CurrentWeather => _lastCurrent;
    public List<QAlert> CurrentAlerts => _alerts;
    public DispatcherQueue Ui => _dispatcher;

    public void RunOnUi(Action action)
    {
        if (_dispatcher.HasThreadAccess) action();
        else _dispatcher.TryEnqueue(() => action());
    }

    public void ApplyRefreshInterval() => _timer.Interval = TimeSpan.FromMinutes(_service.RefreshMinutes);

    // ---- tile ----

    void BuildUi()
    {
        _iconHost = new Grid { Width = 48, Height = 48 };
        _iconHost.Children.Add(new TextBlock
        {
            Text = "--",
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center
        });
        _temp = Fluent.Text("--", ((FrameworkElement)this).ActualTheme, "title");

        var left = new StackPanel { Spacing = 4, VerticalAlignment = VerticalAlignment.Center, HorizontalAlignment = HorizontalAlignment.Center };
        left.Children.Add(_iconHost);
        left.Children.Add(_temp);
        Grid.SetColumn(left, 0);

        _city = Fluent.Text("", ElementTheme.Default, "caption", Fluent.TextTertiary(ElementTheme.Default));
        _condition = Fluent.Text("加载中…", ElementTheme.Default, "bodyStrong");
        _details = Fluent.Text("", ElementTheme.Default, "caption", Fluent.TextSecondary(ElementTheme.Default), TextWrapping.Wrap);

        _alertBadge = new InfoBadge { Value = 1, Visibility = Visibility.Collapsed };
        var alertStyle = Application.Current.Resources.TryGetValue("AttentionValueInfoBadgeStyle", out var s) && s is Style st ? st : null;
        if (alertStyle != null) _alertBadge.Style = alertStyle;
        var alertText = Fluent.Text("天气预警", ElementTheme.Default, "caption", Fluent.Critical(ElementTheme.Default));
        _alertRow = new Grid
        {
            Visibility = Visibility.Collapsed,
            ColumnSpacing = 6,
            ColumnDefinitions =
            {
                new ColumnDefinition { Width = GridLength.Auto },
                new ColumnDefinition { Width = GridLength.Auto }
            }
        };
        _alertBadge.SetValue(Grid.ColumnProperty, 0);
        alertText.SetValue(Grid.ColumnProperty, 1);
        alertText.VerticalAlignment = VerticalAlignment.Center;
        _alertRow.Children.Add(_alertBadge);
        _alertRow.Children.Add(alertText);

        var right = new StackPanel { Spacing = 4, VerticalAlignment = VerticalAlignment.Center, Margin = new Thickness(8, 0, 0, 0) };
        right.Children.Add(_city);
        right.Children.Add(_condition);
        right.Children.Add(_details);
        right.Children.Add(_alertRow);
        Grid.SetColumn(right, 1);

        var layout = new Grid { Margin = new Thickness(4) };
        layout.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        layout.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.15, GridUnitType.Star) });
        layout.Children.Add(left);
        layout.Children.Add(right);

        _hoverLayer = new Border
        {
            CornerRadius = new CornerRadius(8),
            Background = Fluent.SubtleHover(ElementTheme.Default),
            Opacity = 0,
            IsHitTestVisible = false
        };

        _root = new Border
        {
            CornerRadius = new CornerRadius(8),
            Padding = new Thickness(16, 12, 16, 12),
            Child = layout
        };

        var grid = new Grid();
        grid.Children.Add(_root);
        grid.Children.Add(_hoverLayer);

        _root.Tapped += (_, _) => OpenOverlay();
        PointerEntered += (_, _) => _hoverLayer.Opacity = 1;
        PointerExited += (_, _) => _hoverLayer.Opacity = 0;

        Content = grid;
    }

    void ApplyTheme()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        _root.Background = (Brush)_host.GetWidgetBackgroundBrush();
        _root.BorderBrush = Fluent.CardStroke(theme);
        _root.BorderThickness = new Thickness(1);
        _hoverLayer.Background = Fluent.SubtleHover(theme);
        _temp.Foreground = Fluent.TextPrimary(theme);
        _condition.Foreground = Fluent.TextPrimary(theme);
        _city.Foreground = Fluent.TextTertiary(theme);
        _details.Foreground = Fluent.TextSecondary(theme);
    }

    public void Refresh() => _ = RefreshAsync();

    public async Task RefreshAsync()
    {
        if (_isRefreshing) return;
        _isRefreshing = true;
        try
        {
            var loc = await _service.ResolveCurrentAsync();
            _loc = loc;
            if (loc == null)
            {
                RunOnUi(() =>
                {
                    _temp.Text = "--";
                    _condition.Text = "未定位";
                    _city.Text = "";
                    _details.Text = "请检查网络或在设置中手动选择城市";
                    _alertRow.Visibility = Visibility.Collapsed;
                });
                return;
            }

            QCurrentWeather? current = null;
            List<QAlert> alerts = new();
            try { current = await _service.GetCurrentAsync(loc); }
            catch (QWeatherApiException ex)
            {
                _host.LogError($"Weather: current failed {ex.Message}");
                RunOnUi(() => { _condition.Text = ex.Title ?? "获取失败"; _details.Text = ex.Detail ?? ""; });
            }
            try { alerts = await _service.GetAlertsAsync(loc); }
            catch (QWeatherApiException ex) { _host.LogError($"Weather: alerts failed {ex.Message}"); }

            _lastCurrent = current;
            _alerts = alerts;
            RunOnUi(() => ApplyData(loc, current, alerts));
        }
        catch (Exception ex)
        {
            _host.LogError($"Weather: refresh failed {ex.Message}");
            RunOnUi(() => { if (_lastCurrent == null) _condition.Text = "获取失败"; });
        }
        finally { _isRefreshing = false; }
    }

    void ApplyData(QLocation loc, QCurrentWeather? current, List<QAlert> alerts)
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        _city.Text = loc.DisplayName;
        if (current?.Condition == null)
        {
            if (_lastCurrent == null) _condition.Text = "天气获取失败";
            return;
        }

        _iconHost.Children.Clear();
        _iconHost.Children.Add(WeatherIcons.CreateIcon(current.Condition.Code, 48, theme));
        _temp.Text = FmtTemp(current.Temperature);
        _condition.Text = current.Condition.Text ?? "--";
        _details.Text = BuildDetailLine(current);

        if (alerts.Count > 0)
        {
            _alertBadge.Value = alerts.Count;
            _alertBadge.Visibility = Visibility.Visible;
            _alertRow.Visibility = Visibility.Visible;
        }
        else
        {
            _alertRow.Visibility = Visibility.Collapsed;
        }
    }

    internal static string FmtTemp(QValueUnit? v) =>
        v?.Value is double d ? $"{Math.Round(d)}°" : "--";

    internal static string BuildDetailLine(QCurrentWeather c)
    {
        var parts = new List<string>();
        if (c.FeelsLike?.Value is double f) parts.Add($"体感 {Math.Round(f)}°");
        if (c.Humidity is double h) parts.Add($"湿度 {Math.Round(h * 100)}%");
        if (c.Wind?.Scale is double s && s > 0)
            parts.Add($"风{(c.Wind?.Direction?.Compass is { Length: > 0 } dir ? CompassZh(dir) + " " : "")}{Math.Round(s)}级");
        if (c.Precipitation?.Amount?.Value is double p && p > 0) parts.Add($"降水 {p:0.#}mm");
        return string.Join(" · ", parts);
    }

    static readonly string[] Compass16 =
    {
        "北", "东北偏北", "东北", "东北偏东", "东", "东南偏东", "东南", "东南偏南",
        "南", "西南偏南", "西南", "西南偏西", "西", "西北偏西", "西北", "西北偏北"
    };

    public static string CompassZh(string compass) => compass?.ToLowerInvariant() switch
    {
        "n" => "北", "nne" => "东北偏北", "ne" => "东北", "ene" => "东北偏东",
        "e" => "东", "ese" => "东南偏东", "se" => "东南", "sse" => "东南偏南",
        "s" => "南", "ssw" => "西南偏南", "sw" => "西南", "wsw" => "西南偏西",
        "w" => "西", "wnw" => "西北偏西", "nw" => "西北", "nnw" => "西北偏北",
        "vrb" => "风向不定", _ => ""
    };

    // ---- overlay ----

    void OpenOverlay()
    {
        if (((FrameworkElement)this).XamlRoot == null) return;
        var builder = new WeatherOverlayBuilder(this);
        var body = builder.Build();
        var title = _loc?.Name is { Length: > 0 } n ? n : "天气";
        _overlay.Show(this, title, body, _host.Log);
    }

    /// <summary>切换城市后：刷新并重开 overlay。</summary>
    public async Task SwitchAndReopenAsync(QLocation loc)
    {
        _service.SetManualLocation(loc);
        _host.Log($"Weather: switch city {loc.DisplayName} ({loc.Id})");
        _overlay.Close();
        await RefreshAsync();
        OpenOverlay();
    }

    internal void SetWidgetBackground(Brush brush) => _root.Background = brush;

    public void Stop() => _timer?.Stop();
}
