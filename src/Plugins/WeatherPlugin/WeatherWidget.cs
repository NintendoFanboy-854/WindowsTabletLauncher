using Microsoft.UI.Dispatching;
using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;
using Windows.UI;

namespace WeatherPlugin;

public sealed class WeatherWidget : UserControl
{
    readonly IHostHandle _host;
    readonly AmapWeatherService _service;
    readonly DispatcherQueue _dispatcher;
    readonly DispatcherQueueTimer _timer;
    readonly BasePluginOverlay _overlay = new();

    Border _root = null!;
    FontIcon _icon = null!;
    TextBlock _temp = null!;
    TextBlock _condition = null!;
    TextBlock _city = null!;
    TextBlock _details = null!;

    bool _isRefreshing;
    string? _adcode;
    Live? _lastLive;
    Forecast? _lastForecast;

    public WeatherWidget(IHostHandle host, AmapWeatherService service)
    {
        _host = host;
        _service = service;
        _dispatcher = DispatcherQueue.GetForCurrentThread();

        BuildUi();

        Loaded += (_, _) =>
        {
            ApplyTheme(((FrameworkElement)this).ActualTheme);
            _ = RefreshAsync();
        };
        ActualThemeChanged += (_, _) => ApplyTheme(((FrameworkElement)this).ActualTheme);

        _timer = _dispatcher.CreateTimer();
        _timer.Interval = TimeSpan.FromMinutes(RefreshMinutes);
        _timer.IsRepeating = true;
        _timer.Tick += (_, _) => _ = RefreshAsync();
        _timer.Start();
    }

    int RefreshMinutes
        => int.TryParse(_host.GetConfig(nameof(WeatherPlugin), "refresh_min"), out var v) && v > 0 ? v : 30;

    public void ApplyRefreshInterval() => _timer.Interval = TimeSpan.FromMinutes(RefreshMinutes);

    // ---- tile ----

    void BuildUi()
    {
        _icon = new FontIcon { FontSize = 40, Glyph = "\uE753", HorizontalAlignment = HorizontalAlignment.Center };
        _temp = new TextBlock { FontSize = 32, FontWeight = FontWeights.SemiLight, HorizontalAlignment = HorizontalAlignment.Center, Text = "--" };

        var left = new StackPanel { Spacing = 2, VerticalAlignment = VerticalAlignment.Center, HorizontalAlignment = HorizontalAlignment.Center };
        left.Children.Add(_icon);
        left.Children.Add(_temp);
        Grid.SetColumn(left, 0);

        _city = new TextBlock { FontSize = 13, Opacity = 0.75, Text = "" };
        _condition = new TextBlock { FontSize = 17, FontWeight = FontWeights.SemiBold, Text = "加载中…" };
        _details = new TextBlock { FontSize = 12, Opacity = 0.75, Text = "", TextWrapping = TextWrapping.Wrap };

        var right = new StackPanel { Spacing = 3, VerticalAlignment = VerticalAlignment.Center, Margin = new Thickness(8, 0, 0, 0) };
        right.Children.Add(_city);
        right.Children.Add(_condition);
        right.Children.Add(_details);
        Grid.SetColumn(right, 1);

        var layout = new Grid();
        layout.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        layout.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.2, GridUnitType.Star) });
        layout.Children.Add(left);
        layout.Children.Add(right);

        _root = new Border { CornerRadius = new CornerRadius(8), Padding = new Thickness(16, 12, 16, 12), Child = layout };
        _root.Tapped += (_, _) => OpenOverlay();

        Content = _root;
    }

    void ApplyTheme(ElementTheme theme)
    {
        _root.Background = (Brush)_host.GetWidgetBackgroundBrush();
        var (primary, secondary) = ThemeBrushes(theme);
        _icon.Foreground = primary;
        _temp.Foreground = primary;
        _condition.Foreground = primary;
        _city.Foreground = secondary;
        _details.Foreground = secondary;
    }

    static (Brush primary, Brush secondary) ThemeBrushes(ElementTheme theme) =>
        theme == ElementTheme.Light
            ? (new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A)), new SolidColorBrush(Color.FromArgb(0x99, 0x00, 0x00, 0x00)))
            : (new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF)), new SolidColorBrush(Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF)));

    public void Refresh() => _ = RefreshAsync();

    async Task RefreshAsync()
    {
        if (_isRefreshing) return;
        _isRefreshing = true;
        try
        {
        var mode = _host.GetConfig(nameof(WeatherPlugin), "location_mode") ?? "auto";
        string? adcode;

        if (mode == "manual")
        {
            adcode = _host.GetConfig(nameof(WeatherPlugin), "adcode");
        }
        else
        {
            var ipResult = await _service.GetIpLocationAsync();
            adcode = ipResult?.Adcode;
        }

        if (string.IsNullOrWhiteSpace(adcode))
        {
            _adcode = null;
            _lastLive = null;
            _lastForecast = null;
            _temp.Text = "--";
            _condition.Text = mode == "manual" ? "未选择城市" : "定位失败";
            _city.Text = "";
            _details.Text = "";
            return;
        }

        var live = await _service.GetLiveAsync(adcode);
        _adcode = adcode;

        if (live == null)
        {
            _condition.Text = "天气获取失败";
            return;
        }

        _lastLive = live;
        _icon.Glyph = WeatherIcons.GetGlyph(live.Weather);
        _temp.Text = $"{live.Temperature}°";
        _condition.Text = live.Weather;
        _city.Text = live.City;
        _details.Text = $"湿度 {live.Humidity}% · {live.Winddirection}风 {live.Windpower}级";

        _lastForecast = await _service.GetForecastAsync(adcode);
        }
        finally { _isRefreshing = false; }
    }

    async void SwitchCity(string adcode, string name)
    {
        _host.SetConfig(nameof(WeatherPlugin), "location_mode", "manual");
        _host.SetConfig(nameof(WeatherPlugin), "adcode", adcode);
        _host.SetConfig(nameof(WeatherPlugin), "location_name", name);
        _host.Log($"Weather: switch city {name} ({adcode})");
        await RefreshAsync();
        _overlay.Close();
        OpenOverlay();
    }

    // ---- overlay (lightweight scale/fade via shared BasePluginOverlay) ----

    void OpenOverlay()
    {
        if (_lastLive == null) return;
        var theme = ((FrameworkElement)this).ActualTheme;
        var body = BuildOverlayBody(theme);
        _overlay.Show(this, _lastLive.City, body, _host.Log);
    }

    FrameworkElement BuildOverlayBody(ElementTheme theme)
    {
        var (primary, secondary) = ThemeBrushes(theme);
        var live = _lastLive!;

        var body = new StackPanel { Spacing = 16, MinWidth = 360 };

        // favorites quick-switch bar
        var favs = WeatherPlugin.GetFavorites(_host);
        if (favs.Count > 0)
        {
            var bar = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 8 };
            foreach (var f in favs)
            {
                var b = new Button { Content = f.Name };
                if (f.Adcode == _adcode) b.IsEnabled = false;
                b.Click += (_, _) => SwitchCity(f.Adcode, f.Name);
                bar.Children.Add(b);
            }
            body.Children.Add(bar);
        }

        // current summary
        var summary = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 20 };
        summary.Children.Add(new FontIcon { Glyph = WeatherIcons.GetGlyph(live.Weather), FontSize = 72, Foreground = primary, VerticalAlignment = VerticalAlignment.Center });
        var summaryText = new StackPanel { VerticalAlignment = VerticalAlignment.Center };
        summaryText.Children.Add(new TextBlock { Text = $"{live.Temperature}°C", FontSize = 48, FontWeight = FontWeights.SemiLight, Foreground = primary });
        summaryText.Children.Add(new TextBlock { Text = live.Weather, FontSize = 18, Foreground = secondary });
        summary.Children.Add(summaryText);
        body.Children.Add(summary);

        var stats = new (string label, string value)[]
        {
            ("温度", $"{live.Temperature} ℃"),
            ("湿度", $"{live.Humidity} %"),
            ("风向", live.Winddirection),
            ("风力", $"{live.Windpower} 级"),
            ("天气", live.Weather),
            ("省份", live.Province),
            ("城市", live.City),
            ("区域编码", live.Adcode),
            ("发布时间", live.Reporttime),
        };
        body.Children.Add(BuildStatsGrid(stats, 3, primary, secondary));

        body.Children.Add(new Border { Height = 1, Background = new SolidColorBrush(Color.FromArgb(0x30, 0x88, 0x88, 0x88)) });
        body.Children.Add(new TextBlock { Text = "未来预报", FontSize = 18, FontWeight = FontWeights.SemiBold, Foreground = primary });

        var casts = _lastForecast?.Casts;
        if (casts is { Count: > 0 })
        {
            var row = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 12 };
            for (int i = 0; i < casts.Count; i++)
                row.Children.Add(BuildDayColumn(casts[i], i, primary, secondary));
            body.Children.Add(row);
        }
        else
        {
            body.Children.Add(new TextBlock { Text = "预报获取失败", FontSize = 14, Foreground = secondary });
        }

        return body;
    }

    static Grid BuildStatsGrid((string label, string value)[] items, int columns, Brush primary, Brush secondary)
    {
        var grid = new Grid { ColumnSpacing = 24, RowSpacing = 10 };
        for (int c = 0; c < columns; c++)
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

        var rows = (int)Math.Ceiling(items.Length / (double)columns);
        for (int r = 0; r < rows; r++)
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

        for (int i = 0; i < items.Length; i++)
        {
            var cell = new StackPanel { Spacing = 2 };
            cell.Children.Add(new TextBlock { Text = items[i].label, FontSize = 12, Foreground = secondary });
            cell.Children.Add(new TextBlock
            {
                Text = string.IsNullOrEmpty(items[i].value) ? "—" : items[i].value,
                FontSize = 16,
                Foreground = primary,
                TextWrapping = TextWrapping.Wrap
            });
            Grid.SetColumn(cell, i % columns);
            Grid.SetRow(cell, i / columns);
            grid.Children.Add(cell);
        }
        return grid;
    }

    static Border BuildDayColumn(Cast cast, int index, Brush primary, Brush secondary)
    {
        var panel = new StackPanel { Spacing = 6, MinWidth = 150 };

        panel.Children.Add(new TextBlock { Text = DayLabel(cast.Date, index), FontSize = 15, FontWeight = FontWeights.SemiBold, Foreground = primary, HorizontalAlignment = HorizontalAlignment.Center });
        panel.Children.Add(new TextBlock { Text = FormatDate(cast.Date), FontSize = 11, Foreground = secondary, HorizontalAlignment = HorizontalAlignment.Center });
        panel.Children.Add(new FontIcon { Glyph = WeatherIcons.GetGlyph(cast.Dayweather), FontSize = 32, Foreground = primary, HorizontalAlignment = HorizontalAlignment.Center, Margin = new Thickness(0, 2, 0, 6) });
        panel.Children.Add(new TextBlock { Text = $"{cast.Nighttemp}° ~ {cast.Daytemp}°", FontSize = 15, Foreground = primary, HorizontalAlignment = HorizontalAlignment.Center, Margin = new Thickness(0, 0, 0, 6) });

        var rows = new StackPanel { Spacing = 4 };
        AddRow(rows, "白天", cast.Dayweather, primary, secondary);
        AddRow(rows, "夜间", cast.Nightweather, primary, secondary);
        AddRow(rows, "白天风", $"{cast.Daywind} {cast.Daypower}级", primary, secondary);
        AddRow(rows, "夜间风", $"{cast.Nightwind} {cast.Nightpower}级", primary, secondary);
        panel.Children.Add(rows);

        return new Border
        {
            CornerRadius = new CornerRadius(8),
            Padding = new Thickness(14),
            Background = new SolidColorBrush(Color.FromArgb(0x14, 0x88, 0x88, 0x88)),
            Child = panel
        };
    }

    static void AddRow(Panel container, string label, string value, Brush primary, Brush secondary)
    {
        var row = new Grid();
        row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(60) });
        row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

        var l = new TextBlock { Text = label, FontSize = 12, Foreground = secondary };
        Grid.SetColumn(l, 0);
        var v = new TextBlock { Text = string.IsNullOrEmpty(value) ? "—" : value, FontSize = 12, Foreground = primary, TextWrapping = TextWrapping.Wrap };
        Grid.SetColumn(v, 1);

        row.Children.Add(l);
        row.Children.Add(v);
        container.Children.Add(row);
    }

    static string DayLabel(string date, int index) => index switch
    {
        0 => "今天",
        1 => "明天",
        2 => "后天",
        _ => WeekName(date)
    };

    static string WeekName(string date)
    {
        if (!DateTime.TryParse(date, out var d)) return "";
        return d.DayOfWeek switch
        {
            DayOfWeek.Monday => "星期一",
            DayOfWeek.Tuesday => "星期二",
            DayOfWeek.Wednesday => "星期三",
            DayOfWeek.Thursday => "星期四",
            DayOfWeek.Friday => "星期五",
            DayOfWeek.Saturday => "星期六",
            _ => "星期日"
        };
    }

    static string FormatDate(string date) => DateTime.TryParse(date, out var d) ? d.ToString("MM-dd") : date;

    public void Stop() => _timer?.Stop();

    internal void SetWidgetBackground(Brush brush) => _root.Background = brush;
}
