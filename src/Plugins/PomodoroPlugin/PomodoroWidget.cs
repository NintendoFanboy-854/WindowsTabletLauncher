using Microsoft.UI.Dispatching;
using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using Windows.UI;

namespace PomodoroPlugin;

public sealed class PomodoroWidget : UserControl
{
    enum Phase { Focus, Break }

    readonly IHostHandle _host;
    readonly DispatcherQueue _dispatcher;
    readonly DispatcherQueueTimer _timer;
    readonly PluginOverlay _overlay = new();

    Border _root = null!;
    TextBlock _phaseText = null!;
    TextBlock _timeText = null!;
    TextBlock _hintText = null!;
    TextBlock _taskText = null!;

    TextBlock? _ovTime;
    TextBlock? _ovPhase;
    Button? _ovStartPause;

    Phase _phase = Phase.Focus;
    bool _running;
    bool _isLongBreak;
    int _remaining;
    int _focusCount;

    [System.Runtime.InteropServices.DllImport("user32.dll")]
    static extern bool MessageBeep(uint uType);

    public PomodoroWidget(IHostHandle host)
    {
        _host = host;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
        _remaining = FocusMin * 60;

        BuildUi();

        Loaded += (_, _) =>
        {
            ApplyTheme(((FrameworkElement)this).ActualTheme);
            UpdateViews();
        };
        ActualThemeChanged += (_, _) => ApplyTheme(((FrameworkElement)this).ActualTheme);

        _timer = _dispatcher.CreateTimer();
        _timer.Interval = TimeSpan.FromSeconds(1);
        _timer.IsRepeating = true;
        _timer.Tick += OnTick;
        _timer.Start();
    }

    int FocusMin => GetInt("focus_min", 25);
    int BreakMin => GetInt("break_min", 5);
    int LongBreakMin => GetInt("long_break_min", 15);
    int LongBreakEvery => GetInt("long_break_every", 4);
    bool AutoStart => (_host.GetConfig(nameof(PomodoroPlugin), "auto_start") ?? "true") == "true";
    bool SoundOn => (_host.GetConfig(nameof(PomodoroPlugin), "sound") ?? "true") == "true";
    string Task => _host.GetConfig(nameof(PomodoroPlugin), "task") ?? "";

    int GetInt(string key, int def)
        => int.TryParse(_host.GetConfig(nameof(PomodoroPlugin), key), out var v) && v > 0 ? v : def;

    int CurrentPhaseSeconds => (_phase == Phase.Focus ? FocusMin : (_isLongBreak ? LongBreakMin : BreakMin)) * 60;

    void PlayChime()
    {
        if (!SoundOn) return;
        try { MessageBeep(0x00000040); } catch { }
    }

    void BuildUi()
    {
        _phaseText = new TextBlock { FontSize = 16, HorizontalAlignment = HorizontalAlignment.Center, Text = "专注" };
        _timeText = new TextBlock { FontSize = 48, FontWeight = FontWeights.SemiLight, HorizontalAlignment = HorizontalAlignment.Center, Text = "25:00" };
        _hintText = new TextBlock { FontSize = 13, Opacity = 0.7, HorizontalAlignment = HorizontalAlignment.Center, Text = "已暂停" };
        _taskText = new TextBlock { FontSize = 12, Opacity = 0.7, HorizontalAlignment = HorizontalAlignment.Center, TextTrimming = TextTrimming.CharacterEllipsis, Visibility = Visibility.Collapsed };

        var stack = new StackPanel { Spacing = 4, HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center };
        stack.Children.Add(_phaseText);
        stack.Children.Add(_timeText);
        stack.Children.Add(_hintText);
        stack.Children.Add(_taskText);

        _root = new Border { CornerRadius = new CornerRadius(8), Padding = new Thickness(12), Child = stack };
        _root.Tapped += (_, _) => OpenDetail();
        Content = _root;
    }

    void ApplyTheme(ElementTheme theme)
    {
        _root.Background = (Brush)_host.GetWidgetBackgroundBrush();
        var (primary, secondary) = Brushes(theme);
        _phaseText.Foreground = secondary;
        _timeText.Foreground = primary;
        _hintText.Foreground = secondary;
        _taskText.Foreground = secondary;
    }

    static (Brush primary, Brush secondary) Brushes(ElementTheme theme) =>
        theme == ElementTheme.Light
            ? (new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A)), new SolidColorBrush(Color.FromArgb(0x99, 0, 0, 0)))
            : (new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF)), new SolidColorBrush(Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF)));

    void OnTick(DispatcherQueueTimer sender, object args)
    {
        if (!_running) return;
        _remaining--;
        if (_remaining <= 0)
            PhaseComplete();
        UpdateViews();
    }

    void PhaseComplete()
    {
        PlayChime();
        if (_phase == Phase.Focus)
        {
            _focusCount++;
            PomodoroPlugin.AddCompletion(_host);
            _isLongBreak = LongBreakEvery > 0 && _focusCount % LongBreakEvery == 0;
            _phase = Phase.Break;
            _remaining = (_isLongBreak ? LongBreakMin : BreakMin) * 60;
            _host.ShowNotification("番茄钟", _isLongBreak ? "完成一组专注，长休息一下。" : "专注时间结束，休息一下吧。");
            _running = AutoStart;
        }
        else
        {
            _phase = Phase.Focus;
            _isLongBreak = false;
            _remaining = FocusMin * 60;
            _host.ShowNotification("番茄钟", "休息结束，开始下一个专注。");
            _running = AutoStart;
        }
    }

    void ToggleStartPause()
    {
        _running = !_running;
        UpdateViews();
    }

    internal void Pause()
    {
        _running = false;
        UpdateViews();
    }

    internal void Resume()
    {
        _running = true;
        UpdateViews();
    }

    internal void Skip()
    {
        if (_phase == Phase.Focus)
        {
            _isLongBreak = LongBreakEvery > 0 && (_focusCount + 1) % LongBreakEvery == 0;
            _phase = Phase.Break;
        }
        else
        {
            _phase = Phase.Focus;
            _isLongBreak = false;
        }
        _remaining = CurrentPhaseSeconds;
        _running = false;
        UpdateViews();
    }

    internal void ResetTimer()
    {
        _running = false;
        _remaining = CurrentPhaseSeconds;
        UpdateViews();
    }

    public void StartFocus(int minutes)
    {
        _phase = Phase.Focus;
        _isLongBreak = false;
        _remaining = Math.Max(1, minutes) * 60;
        _running = true;
        _host.Log($"Pomodoro: start focus {minutes}min");
        UpdateViews();
    }

    // Re-apply focus/break durations from config (used when settings or the
    // full-screen editor changes them); only resets the clock when idle.
    public void ApplyDurations()
    {
        if (!_running)
            _remaining = CurrentPhaseSeconds;
        _host.Log($"Pomodoro: apply durations focus={FocusMin} break={BreakMin} running={_running}");
        UpdateViews();
    }

    public string StateJson()
    {
        return System.Text.Json.JsonSerializer.Serialize(new
        {
            ok = true,
            phase = _phase == Phase.Focus ? "focus" : (_isLongBreak ? "long_break" : "break"),
            remainingSeconds = Math.Max(0, _remaining),
            running = _running,
            task = Task,
            focusCount = _focusCount
        });
    }

    static string Format(int seconds)
    {
        if (seconds < 0) seconds = 0;
        return $"{seconds / 60:00}:{seconds % 60:00}";
    }

    void UpdateViews()
    {
        var phase = _phase == Phase.Focus ? "专注" : (_isLongBreak ? "长休息" : "休息");
        _phaseText.Text = phase;
        _timeText.Text = Format(_remaining);
        _hintText.Text = _running ? "进行中" : "已暂停";

        var task = Task;
        _taskText.Text = task;
        _taskText.Visibility = string.IsNullOrEmpty(task) ? Visibility.Collapsed : Visibility.Visible;

        if (_overlay.IsOpen)
        {
            if (_ovPhase != null) _ovPhase.Text = phase;
            if (_ovTime != null) _ovTime.Text = Format(_remaining);
            if (_ovStartPause != null) _ovStartPause.Content = _running ? "暂停" : "开始";
        }
    }

    void OpenDetail()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        var (primary, secondary) = Brushes(theme);

        var body = new StackPanel { Spacing = 20, MinWidth = 320, HorizontalAlignment = HorizontalAlignment.Center };

        _ovPhase = new TextBlock { Text = _phase == Phase.Focus ? "专注" : "休息", FontSize = 20, Foreground = secondary, HorizontalAlignment = HorizontalAlignment.Center };
        _ovTime = new TextBlock { Text = Format(_remaining), FontSize = 72, FontWeight = FontWeights.SemiLight, Foreground = primary, HorizontalAlignment = HorizontalAlignment.Center };
        body.Children.Add(_ovPhase);
        body.Children.Add(_ovTime);

        _ovStartPause = new Button { Content = _running ? "暂停" : "开始", MinWidth = 100 };
        _ovStartPause.Click += (_, _) => ToggleStartPause();
        var skip = new Button { Content = "跳过", MinWidth = 100 };
        skip.Click += (_, _) => Skip();
        var reset = new Button { Content = "重置", MinWidth = 100 };
        reset.Click += (_, _) => ResetTimer();

        var controls = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 12, HorizontalAlignment = HorizontalAlignment.Center };
        controls.Children.Add(_ovStartPause);
        controls.Children.Add(skip);
        controls.Children.Add(reset);
        body.Children.Add(controls);

        var taskBox = new TextBox { Header = "当前专注任务", PlaceholderText = "在做什么…", Text = Task, HorizontalAlignment = HorizontalAlignment.Stretch };
        taskBox.LostFocus += (_, _) => { _host.SetConfig(nameof(PomodoroPlugin), "task", taskBox.Text.Trim()); UpdateViews(); };
        body.Children.Add(taskBox);

        var durations = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 16, HorizontalAlignment = HorizontalAlignment.Center };
        durations.Children.Add(MakeDurationBox("专注时长", "focus_min", FocusMin));
        durations.Children.Add(MakeDurationBox("休息时长", "break_min", BreakMin));
        body.Children.Add(durations);

        // stats
        body.Children.Add(new Border { Height = 1, Background = new SolidColorBrush(Color.FromArgb(0x30, 0x88, 0x88, 0x88)) });
        var last7 = PomodoroPlugin.Last7(_host);
        var todayCount = last7.Count > 0 ? last7[^1].count : 0;
        body.Children.Add(new TextBlock { Text = $"今日完成 {todayCount} 个 · 近 7 天", FontSize = 15, FontWeight = FontWeights.SemiBold, Foreground = primary });
        var chartData = last7.Select(d => (d.date.ToString("MM-dd"), (double)d.count)).ToList();
        body.Children.Add(MiniChart.Bars(chartData, new SolidColorBrush(Color.FromArgb(0xFF, 0xE0, 0x62, 0x40)), secondary));

        _overlay.Show(this, "番茄钟", body, _host.Log);
        UpdateViews();
    }

    NumberBox MakeDurationBox(string header, string key, int value)
    {
        var box = new NumberBox
        {
            Header = header,
            Minimum = 1,
            Maximum = 180,
            SpinButtonPlacementMode = NumberBoxSpinButtonPlacementMode.Inline,
            Value = value,
            MinWidth = 130
        };
        box.ValueChanged += (_, _) =>
        {
            if (double.IsNaN(box.Value)) return;
            _host.SetConfig(nameof(PomodoroPlugin), key, ((int)box.Value).ToString());
            ApplyDurations();
        };
        return box;
    }

    internal void SetAcrylicBackground(Brush brush) => _root.Background = brush;
}
