using System.Globalization;
using Microsoft.UI.Dispatching;
using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using Windows.UI;

namespace ClockPlugin;

public sealed class ClockWidget : UserControl
{
    static readonly string[] WeekNames = { "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六" };

    readonly IHostHandle _host;
    readonly DispatcherQueueTimer _timer;
    readonly PluginOverlay _overlay = new();

    Border _root = null!;
    TextBlock _timeText = null!;
    TextBlock _dateText = null!;
    TextBlock _lunarText = null!;

    public ClockWidget(IHostHandle host)
    {
        _host = host;
        BuildUi();

        Loaded += (_, _) => ApplyTheme(((FrameworkElement)this).ActualTheme);
        ActualThemeChanged += (_, _) => ApplyTheme(((FrameworkElement)this).ActualTheme);

        _timer = DispatcherQueue.GetForCurrentThread().CreateTimer();
        _timer.Interval = TimeSpan.FromSeconds(1);
        _timer.IsRepeating = true;
        _timer.Tick += OnTick;
        _timer.Start();

        OnTick(null!, null!);
    }

    bool Use12 => (_host.GetConfig(nameof(ClockPlugin), "time_format") ?? "HH:mm:ss").StartsWith("hh");
    bool ShowSeconds => (_host.GetConfig(nameof(ClockPlugin), "show_seconds") ?? "true") == "true";
    bool ShowLunar => (_host.GetConfig(nameof(ClockPlugin), "show_lunar") ?? "false") == "true";

    string TimeFormat()
    {
        var sec = ShowSeconds ? ":ss" : "";
        return Use12 ? $"hh:mm{sec} tt" : $"HH:mm{sec}";
    }

    void BuildUi()
    {
        _timeText = new TextBlock { FontSize = 48, FontWeight = FontWeights.SemiLight, HorizontalAlignment = HorizontalAlignment.Center };
        _dateText = new TextBlock { FontSize = 16, HorizontalAlignment = HorizontalAlignment.Center };
        _lunarText = new TextBlock { FontSize = 13, Opacity = 0.75, HorizontalAlignment = HorizontalAlignment.Center, Visibility = Visibility.Collapsed };

        var stack = new StackPanel { VerticalAlignment = VerticalAlignment.Center, Spacing = 2 };
        stack.Children.Add(_timeText);
        stack.Children.Add(_dateText);
        stack.Children.Add(_lunarText);

        _root = new Border { CornerRadius = new CornerRadius(8), Padding = new Thickness(16, 12, 16, 12), Child = stack };
        _root.Tapped += (_, _) => OpenOverlay();
        Content = _root;
    }

    void ApplyTheme(ElementTheme theme)
    {
        _root.Background = (Brush)_host.GetWidgetBackgroundBrush();
        var (primary, secondary) = ThemeBrushes(theme);
        _timeText.Foreground = primary;
        _dateText.Foreground = secondary;
        _lunarText.Foreground = secondary;
    }

    static (Brush primary, Brush secondary) ThemeBrushes(ElementTheme theme) =>
        theme == ElementTheme.Light
            ? (new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A)), new SolidColorBrush(Color.FromArgb(0x99, 0x00, 0x00, 0x00)))
            : (new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF)), new SolidColorBrush(Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF)));

    void OnTick(DispatcherQueueTimer sender, object args)
    {
        var now = DateTime.Now;
        _timeText.Text = now.ToString(TimeFormat());
        _dateText.Text = $"{now:yyyy-MM-dd} {WeekNames[(int)now.DayOfWeek]}";
        if (ShowLunar)
        {
            _lunarText.Text = LunarString(now);
            _lunarText.Visibility = Visibility.Visible;
        }
        else
        {
            _lunarText.Visibility = Visibility.Collapsed;
        }
    }

    public void ApplySettings()
    {
        OnTick(null!, null!);
        ApplyTheme(((FrameworkElement)this).ActualTheme);
    }

    internal void SetTimeFormat(string format) => ApplySettings();

    // ---- lunar ----

    static readonly string[] LunarMonths = { "正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月" };
    static readonly string[] LunarDayTens = { "初", "十", "廿", "三" };
    static readonly string[] LunarDayUnits = { "十", "一", "二", "三", "四", "五", "六", "七", "八", "九" };

    internal static string LunarString(DateTime date)
    {
        try
        {
            var cal = new ChineseLunisolarCalendar();
            if (date < cal.MinSupportedDateTime || date > cal.MaxSupportedDateTime) return "";
            int month = cal.GetMonth(date);
            int year = cal.GetYear(date);
            int leap = cal.GetLeapMonth(year);
            bool isLeap = leap > 0 && month == leap;
            int realMonth = leap > 0 && month >= leap ? month - 1 : month;
            int day = cal.GetDayOfMonth(date);
            var m = (isLeap ? "闰" : "") + LunarMonths[Math.Clamp(realMonth - 1, 0, 11)];
            return $"农历{m}{LunarDay(day)}";
        }
        catch { return ""; }
    }

    static string LunarDay(int day)
    {
        if (day == 10) return "初十";
        if (day == 20) return "二十";
        if (day == 30) return "三十";
        return LunarDayTens[day / 10] + LunarDayUnits[day % 10];
    }

    // ---- full-screen: world clock ----

    void OpenOverlay()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        var (primary, secondary) = ThemeBrushes(theme);
        var now = DateTime.Now;

        var body = new StackPanel { Spacing = 14, MinWidth = 360 };

        body.Children.Add(new TextBlock { Text = LunarString(now), FontSize = 16, Foreground = secondary });
        var week = ISOWeek.GetWeekOfYear(now);
        body.Children.Add(new TextBlock { Text = $"{now:yyyy-MM-dd} {WeekNames[(int)now.DayOfWeek]} · 第 {week} 周", FontSize = 14, Foreground = secondary });

        body.Children.Add(new Border { Height = 1, Background = new SolidColorBrush(Color.FromArgb(0x30, 0x88, 0x88, 0x88)) });
        body.Children.Add(new TextBlock { Text = "世界时钟", FontSize = 18, FontWeight = FontWeights.SemiBold, Foreground = primary });

        body.Children.Add(WorldRow("本地", now, primary, secondary));
        foreach (var id in ClockPlugin.GetZones(_host))
        {
            try
            {
                var tz = TimeZoneInfo.FindSystemTimeZoneById(id);
                var t = TimeZoneInfo.ConvertTime(DateTimeOffset.Now, tz);
                body.Children.Add(WorldRow(tz.DisplayName, t.DateTime, primary, secondary));
            }
            catch { }
        }

        _overlay.Show(this, "时钟", body, _host.Log);
    }

    Grid WorldRow(string label, DateTime time, Brush primary, Brush secondary)
    {
        var grid = new Grid { Margin = new Thickness(0, 2, 0, 2) };
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        var l = new TextBlock { Text = label, FontSize = 14, Foreground = secondary, VerticalAlignment = VerticalAlignment.Center, TextTrimming = TextTrimming.CharacterEllipsis };
        Grid.SetColumn(l, 0);
        var t = new TextBlock { Text = time.ToString(TimeFormat()) + "  " + time.ToString("MM-dd"), FontSize = 18, FontWeight = FontWeights.SemiLight, Foreground = primary };
        Grid.SetColumn(t, 1);
        grid.Children.Add(l);
        grid.Children.Add(t);
        return grid;
    }

    internal void SetAcrylicBackground(Brush brush) => _root.Background = brush;
}
