using System.Globalization;
using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;
using Windows.UI;

namespace ClockPlugin;

/// <summary>
/// 时钟 tile（Fluent 2）：主题资源画刷 + 字阶 + 卡片描边 + Subtle hover；
/// overlay：日期/农历卡 + 世界时钟卡（打开期间每秒实时刷新）。
/// </summary>
public sealed class ClockWidget : UserControl
{
    static readonly string[] WeekNames = { "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六" };

    readonly IHostHandle _host;
    readonly DispatcherQueueTimer _timer;
    readonly ClockOverlay _overlay = new();

    Border _root = null!;
    Border _hoverLayer = null!;
    TextBlock _timeText = null!;
    TextBlock _dateText = null!;
    TextBlock _lunarText = null!;

    // overlay live refs
    readonly List<(TextBlock Time, TimeZoneInfo? Zone)> _ovClocks = new();
    TextBlock? _ovDateText;
    TextBlock? _ovLunarText;
    TextBlock? _ovHeroTime;
    TextBlock? _ovHeroDate;
    DispatcherQueueTimer? _ovTimer;

    bool _use12;
    bool _showSeconds;
    bool _showLunar;
    string _lastTime = "";
    string _lastDate = "";
    string _lastLunar = "";
    string? _lunarDayKey;
    string _lunarDayText = "";

    public ClockWidget(IHostHandle host)
    {
        _host = host;
        _overlay.OnClose = () => { _ovTimer?.Stop(); _ovClocks.Clear(); };
        BuildUi();

        Loaded += (_, _) => ApplyTheme(((FrameworkElement)this).ActualTheme);
        ActualThemeChanged += (_, _) => ApplyTheme(((FrameworkElement)this).ActualTheme);

        _timer = DispatcherQueue.GetForCurrentThread().CreateTimer();
        _timer.Tick += OnTick;

        ReadConfig();
        ConfigureTimer();
        OnTick(null!, null!);
    }

    void ConfigureTimer()
    {
        _timer.Stop();
        if (ShowSeconds)
        {
            _timer.Interval = TimeSpan.FromSeconds(1);
            _timer.IsRepeating = true;
            _timer.Start();
        }
        else
        {
            var now = DateTime.Now;
            var msToNextMinute = (60 - now.Second) * 1000 - now.Millisecond;
            if (msToNextMinute < 50) msToNextMinute += 60_000;
            _timer.Interval = TimeSpan.FromMilliseconds(msToNextMinute);
            _timer.IsRepeating = false;
            _timer.Start();
        }
    }

    bool Use12 => _use12;
    bool ShowSeconds => _showSeconds;
    bool ShowLunar => _showLunar;

    void ReadConfig()
    {
        _use12 = (_host.GetConfig(nameof(ClockPlugin), "time_format") ?? "HH:mm:ss").StartsWith("hh");
        _showSeconds = (_host.GetConfig(nameof(ClockPlugin), "show_seconds") ?? "true") == "true";
        _showLunar = (_host.GetConfig(nameof(ClockPlugin), "show_lunar") ?? "false") == "true";
    }

    string TimeFormat()
    {
        var sec = ShowSeconds ? ":ss" : "";
        return Use12 ? $"hh:mm{sec} tt" : $"HH:mm{sec}";
    }

    void BuildUi()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        _timeText = Fluent.Text("", theme, "title");
        _timeText.FontSize = 48;
        _timeText.LineHeight = 56;
        _timeText.HorizontalAlignment = HorizontalAlignment.Center;
        _dateText = Fluent.Text("", theme, "bodyLarge", Fluent.TextSecondary(theme));
        _dateText.HorizontalAlignment = HorizontalAlignment.Center;
        _lunarText = Fluent.Text("", theme, "caption", Fluent.TextTertiary(theme));
        _lunarText.HorizontalAlignment = HorizontalAlignment.Center;
        _lunarText.Visibility = Visibility.Collapsed;

        var stack = new StackPanel { VerticalAlignment = VerticalAlignment.Center, Spacing = 4 };
        stack.Children.Add(_timeText);
        stack.Children.Add(_dateText);
        stack.Children.Add(_lunarText);

        _root = new Border
        {
            CornerRadius = new CornerRadius(8),
            Padding = new Thickness(16, 12, 16, 12),
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

        _root.Tapped += (_, _) => OpenOverlay();
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
        _timeText.Foreground = Fluent.TextPrimary(theme);
        _dateText.Foreground = Fluent.TextSecondary(theme);
        _lunarText.Foreground = Fluent.TextTertiary(theme);
    }

    void OnTick(DispatcherQueueTimer sender, object args)
    {
        var now = DateTime.Now;
        var time = now.ToString(TimeFormat());
        if (time != _lastTime)
        {
            _lastTime = time;
            _timeText.Text = time;
        }
        var date = $"{now:yyyy-MM-dd} {WeekNames[(int)now.DayOfWeek]}";
        if (date != _lastDate)
        {
            _lastDate = date;
            _dateText.Text = date;
        }
        if (ShowLunar)
        {
            var dayKey = now.ToString("yyyyMMdd");
            if (_lunarDayKey != dayKey)
            {
                _lunarDayKey = dayKey;
                _lunarDayText = LunarString(now);
            }
            if (_lunarDayText != _lastLunar)
            {
                _lastLunar = _lunarDayText;
                _lunarText.Text = _lunarDayText;
            }
            _lunarText.Visibility = Visibility.Visible;
        }
        else
        {
            _lunarText.Visibility = Visibility.Collapsed;
        }

        if (!ShowSeconds)
            ConfigureTimer();
    }

    public void ApplySettings()
    {
        ReadConfig();
        ConfigureTimer();
        OnTick(null!, null!);
        ApplyTheme(((FrameworkElement)this).ActualTheme);
    }

    internal void SetTimeFormat(string format) => ApplySettings();

    // ---- lunar ----

    static readonly string[] LunarMonths = { "正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月" };
    static readonly string[] LunarDayTens = { "初", "十", "廿", "三" };
    static readonly string[] LunarDayUnits = { "十", "一", "二", "三", "四", "五", "六", "七", "八", "九" };
    static readonly ChineseLunisolarCalendar _lunarCalendar = new();

    internal static string LunarString(DateTime date)
    {
        try
        {
            var cal = _lunarCalendar;
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

    // ---- full-screen overlay ----

    void OpenOverlay()
    {
        if (_overlay.IsOpen) return;
        var theme = ((FrameworkElement)this).ActualTheme;
        var now = DateTime.Now;

        _ovClocks.Clear();
        var body = new StackPanel { Spacing = 12 };

        // hero：当前时间卡
        var heroTime = Fluent.Text("", theme, "title");
        heroTime.FontSize = 52;
        heroTime.LineHeight = 60;
        heroTime.HorizontalAlignment = HorizontalAlignment.Center;
        var heroDate = Fluent.Text("", theme, "bodyLarge", Fluent.TextSecondary(theme));
        heroDate.HorizontalAlignment = HorizontalAlignment.Center;
        var heroCard = Fluent.Card(theme, new Thickness(16, 14, 16, 16));
        heroCard.Child = new StackPanel { Spacing = 4, Children = { heroTime, heroDate } };
        body.Children.Add(heroCard);
        _ovHeroTime = heroTime;
        _ovHeroDate = heroDate;

        // 日期卡
        _ovLunarText = Fluent.Text(LunarString(now), theme, "bodyLarge", Fluent.TextSecondary(theme));
        _ovDateText = Fluent.Text("", theme, "bodyLarge", Fluent.TextSecondary(theme));
        var dateCard = Fluent.Card(theme, new Thickness(16, 12, 16, 14));
        dateCard.Child = new StackPanel { Spacing = 4, Children = { _ovDateText, _ovLunarText } };
        body.Children.Add(dateCard);

        // 世界时钟卡
        var worldBody = new StackPanel { Spacing = 6 };
        worldBody.Children.Add(Fluent.Text("世界时钟", theme, "bodyLargeStrong", Fluent.TextPrimary(theme)));
        worldBody.Children.Add(AddWorldRow(theme, "本地", null));
        foreach (var id in ClockPlugin.GetZones(_host))
        {
            try
            {
                var tz = TimeZoneInfo.FindSystemTimeZoneById(id);
                worldBody.Children.Add(AddWorldRow(theme, tz.DisplayName, tz));
            }
            catch { }
        }
        var worldCard = Fluent.Card(theme, new Thickness(16, 12, 16, 14));
        worldCard.Child = worldBody;
        body.Children.Add(worldCard);

        _overlay.Show(this, "时钟", body, _host.Log);

        // overlay 打开期间每秒刷新（Tick 只订阅一次，避免反复开关叠加处理器）
        if (_ovTimer == null)
        {
            _ovTimer = DispatcherQueue.GetForCurrentThread().CreateTimer();
            _ovTimer.Interval = TimeSpan.FromSeconds(1);
            _ovTimer.IsRepeating = true;
            _ovTimer.Tick += (_, _) => UpdateOverlayClocks();
        }
        _ovTimer.Start();
        UpdateOverlayClocks();
    }

    sealed class ClockOverlay : BasePluginOverlay
    {
        public Action? OnClose;
        protected override void OnClosing() => OnClose?.Invoke();
    }

    FrameworkElement AddWorldRow(ElementTheme theme, string label, TimeZoneInfo? zone)
    {
        var grid = new Grid { ColumnSpacing = 12 };
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

        var l = Fluent.Text(label, theme, "body", Fluent.TextSecondary(theme));
        l.VerticalAlignment = VerticalAlignment.Center;
        l.TextTrimming = TextTrimming.CharacterEllipsis;
        Grid.SetColumn(l, 0);
        grid.Children.Add(l);

        var t = Fluent.Text("", theme, "bodyLargeStrong", Fluent.TextPrimary(theme));
        Grid.SetColumn(t, 1);
        grid.Children.Add(t);

        _ovClocks.Add((t, zone));
        return new Border
        {
            Padding = new Thickness(8, 4, 8, 6),
            CornerRadius = new CornerRadius(4),
            Background = Fluent.CardBgSecondary(theme),
            Child = grid
        };
    }

    void UpdateOverlayClocks()
    {
        var now = DateTimeOffset.Now;
        var local = now.LocalDateTime;
        if (_ovHeroTime != null)
            _ovHeroTime.Text = local.ToString(TimeFormat());
        if (_ovHeroDate != null)
            _ovHeroDate.Text = LunarString(local);
        if (_ovDateText != null)
        {
            var week = ISOWeek.GetWeekOfYear(local);
            var dayOfYear = local.DayOfYear;
            var yearProgress = Math.Round(dayOfYear / (DateTime.IsLeapYear(local.Year) ? 366.0 : 365.0) * 100);
            _ovDateText.Text = $"{local:yyyy-MM-dd} {WeekNames[(int)local.DayOfWeek]} · 第 {week} 周 · 年进度 {yearProgress}%";
        }
        if (_ovLunarText != null)
            _ovLunarText.Text = LunarString(local);
        foreach (var (tb, zone) in _ovClocks)
        {
            var t = zone == null ? local : TimeZoneInfo.ConvertTime(now, zone).DateTime;
            tb.Text = t.ToString(TimeFormat()) + "  " + t.ToString("MM-dd");
        }
    }

    public void Stop()
    {
        _timer?.Stop();
        _ovTimer?.Stop();
    }

    internal void SetWidgetBackground(Brush brush) => _root.Background = brush;
}
