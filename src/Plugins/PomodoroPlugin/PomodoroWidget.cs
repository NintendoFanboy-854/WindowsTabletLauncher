using Microsoft.UI.Dispatching;
using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;
using System.Text.Json;
using Windows.UI;

namespace PomodoroPlugin;

public sealed class PomodoroWidget : UserControl
{
    enum Phase { Focus, Break }

    readonly IHostHandle _host;
    readonly PomodoroPlugin _plugin;
    readonly DispatcherQueue _dispatcher;
    readonly DispatcherQueueTimer _timer;
    readonly BasePluginOverlay _overlay = new();

    Border _root = null!;
    TextBlock _phaseText = null!;
    TextBlock _timeText = null!;
    TextBlock _hintText = null!;
    TextBlock _taskText = null!;

    TextBlock? _ovTime;
    TextBlock? _ovPhase;
    Button? _ovStartPause;
    Button? _ovSkip;
    readonly int[] _hourlySeconds = new int[24];

    Phase _phase = Phase.Focus;
    bool _running;
    bool _isLongBreak;
    int _remaining;
    int _focusCount;
    int _tickCounter;

    [System.Runtime.InteropServices.DllImport("user32.dll")]
    static extern bool MessageBeep(uint uType);

    public PomodoroWidget(IHostHandle host, PomodoroPlugin plugin)
    {
        _host = host;
        _plugin = plugin;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
        _remaining = FocusMin * 60;

        RestoreState();

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
    bool AllowPauseCfg => (_host.GetConfig(nameof(PomodoroPlugin), "allow_pause") ?? "true") == "true";
    bool KeepScreenOnCfg => (_host.GetConfig(nameof(PomodoroPlugin), "keep_screen_on") ?? "true") == "true";
    string Task => _host.GetConfig(nameof(PomodoroPlugin), "task") ?? "";

    int GetInt(string key, int def)
        => int.TryParse(_host.GetConfig(nameof(PomodoroPlugin), key), out var v) && v > 0 ? v : def;

    int CurrentPhaseSeconds => (_phase == Phase.Focus ? FocusMin : (_isLongBreak ? LongBreakMin : BreakMin)) * 60;

    void PlayChime() { if (!SoundOn) return; try { MessageBeep(0x00000040); } catch { } }

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
        var now = DateTime.Now;
        _hourlySeconds[now.Hour] += 1;
        _tickCounter++;
        if (_tickCounter >= 30)
        {
            _tickCounter = 0;
            PersistState();
        }
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
            PomodoroPlugin.AddCompletion(_host, Task, FocusMin);
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

        if (!_running)
            SetScreen(false);

        if (_running && _phase == Phase.Focus)
            SetScreen(true);

        PersistState();
    }

    void SetScreen(bool on)
    {
        _plugin.SetScreenOn(on);
    }

    public void PersistState()
    {
        _host.SetConfig(nameof(PomodoroPlugin), "phase_state", _phase.ToString());
        _host.SetConfig(nameof(PomodoroPlugin), "remaining_seconds", _remaining.ToString());
        _host.SetConfig(nameof(PomodoroPlugin), "focus_count", _focusCount.ToString());
        _host.SetConfig(nameof(PomodoroPlugin), "is_long_break", _isLongBreak ? "true" : "false");
        var today = DateTime.Today.ToString("yyyyMMdd");
        _host.SetConfig(nameof(PomodoroPlugin), "hourly_today", JsonSerializer.Serialize(_hourlySeconds));
        _host.SetConfig(nameof(PomodoroPlugin), "hourly_date", today);
    }

    void RestoreState()
    {
        _running = false;

        var phaseStr = _host.GetConfig(nameof(PomodoroPlugin), "phase_state");
        if (!string.IsNullOrEmpty(phaseStr) && Enum.TryParse<Phase>(phaseStr, out var p))
            _phase = p;

        _isLongBreak = (_host.GetConfig(nameof(PomodoroPlugin), "is_long_break") ?? "") == "true";

        var fcStr = _host.GetConfig(nameof(PomodoroPlugin), "focus_count");
        if (int.TryParse(fcStr, out var fc) && fc >= 0)
            _focusCount = fc;

        var remStr = _host.GetConfig(nameof(PomodoroPlugin), "remaining_seconds");
        if (int.TryParse(remStr, out var rem) && rem > 0)
            _remaining = rem;
        if (_remaining <= 0)
            _remaining = CurrentPhaseSeconds;

        var hourlyDate = _host.GetConfig(nameof(PomodoroPlugin), "hourly_date");
        if (hourlyDate == DateTime.Today.ToString("yyyyMMdd"))
        {
            var hourlyJson = _host.GetConfig(nameof(PomodoroPlugin), "hourly_today");
            if (!string.IsNullOrEmpty(hourlyJson))
            {
                try
                {
                    var arr = JsonSerializer.Deserialize<int[]>(hourlyJson);
                    if (arr is { Length: 24 })
                        Array.Copy(arr, _hourlySeconds, 24);
                }
                catch { }
            }
        }
    }

    public void Stop() => _timer?.Stop();

    void ToggleStartPause()
    {
        if (!_running && !AllowPauseCfg) return;
        _running = !_running;
        SetScreen(_running && _phase == Phase.Focus);
        PersistState();
        UpdateViews();
    }

    internal void Pause()
    {
        if (!AllowPauseCfg) return;
        _running = false;
        SetScreen(false);
        PersistState();
        UpdateViews();
    }

    internal void Resume()
    {
        _running = true;
        if (_phase == Phase.Focus) SetScreen(true);
        PersistState();
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
        SetScreen(false);
        PersistState();
        UpdateViews();
    }

    internal void ResetTimer()
    {
        _running = false;
        _remaining = CurrentPhaseSeconds;
        SetScreen(false);
        PersistState();
        UpdateViews();
    }

    public void StartFocus(int minutes)
    {
        _host.SetConfig(nameof(PomodoroPlugin), "focus_min", minutes.ToString());
        _phase = Phase.Focus;
        _isLongBreak = false;
        _remaining = Math.Max(1, minutes) * 60;
        _running = true;
        SetScreen(true);
        _host.Log($"Pomodoro: start focus {minutes}min");
        PersistState();
        UpdateViews();
    }

    public void ApplyDurations()
    {
        _remaining = CurrentPhaseSeconds;
        _host.Log($"Pomodoro: apply durations focus={FocusMin} break={BreakMin} running={_running}");
        UpdateViews();
    }

    public void ResetState()
    {
        _phase = Phase.Focus;
        _isLongBreak = false;
        _focusCount = 0;
        Array.Clear(_hourlySeconds, 0, 24);
        _remaining = FocusMin * 60;
        _running = false;
        SetScreen(false);
        PersistState();
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
            focusCount = _focusCount,
            focusMin = FocusMin,
            breakMin = BreakMin,
            longBreakMin = LongBreakMin,
            longBreakEvery = LongBreakEvery,
            autoStart = AutoStart,
            sound = SoundOn,
            allowPause = AllowPauseCfg,
            keepScreenOn = KeepScreenOnCfg
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
        if (_overlay.IsOpen) return;
        var theme = ((FrameworkElement)this).ActualTheme;
        var (primary, secondary) = Brushes(theme);

        var body = new StackPanel { Spacing = 20, MinWidth = 340, HorizontalAlignment = HorizontalAlignment.Center };

        _ovPhase = new TextBlock { Text = _phase == Phase.Focus ? "专注" : "休息", FontSize = 20, Foreground = secondary, HorizontalAlignment = HorizontalAlignment.Center };
        _ovTime = new TextBlock { Text = Format(_remaining), FontSize = 72, FontWeight = FontWeights.SemiLight, Foreground = primary, HorizontalAlignment = HorizontalAlignment.Center };
        body.Children.Add(_ovPhase);
        body.Children.Add(_ovTime);

        _ovStartPause = new Button { Content = _running ? "暂停" : "开始", MinWidth = 100 };
        _ovStartPause.Click += (_, _) => ToggleStartPause();
        if (!AllowPauseCfg && !_running) _ovStartPause.IsEnabled = false;

        _ovSkip = new Button { Content = "跳过", MinWidth = 100 };
        _ovSkip.Click += (_, _) => Skip();
        var reset = new Button { Content = "重置", MinWidth = 100 };
        reset.Click += (_, _) => ResetTimer();
        var controls = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 12, HorizontalAlignment = HorizontalAlignment.Center };
        controls.Children.Add(_ovStartPause);
        controls.Children.Add(_ovSkip);
        controls.Children.Add(reset);
        body.Children.Add(controls);

        var taskBox = new TextBox { Header = "当前专注任务", PlaceholderText = "在做什么…", Text = Task, HorizontalAlignment = HorizontalAlignment.Stretch };
        taskBox.LostFocus += (_, _) => { _host.SetConfig(nameof(PomodoroPlugin), "task", taskBox.Text.Trim()); UpdateViews(); };
        body.Children.Add(taskBox);

        // stats
        body.Children.Add(new Border { Height = 1, Background = new SolidColorBrush(Color.FromArgb(0x30, 0x88, 0x88, 0x88)) });
        var last7 = PomodoroPlugin.Last7(_host);
        var todayCount = last7.Count > 0 ? last7[^1].count : 0;
        body.Children.Add(new TextBlock { Text = $"今日完成 {todayCount} 个 · 近 7 天", FontSize = 15, FontWeight = FontWeights.SemiBold, Foreground = primary });
        var chartData = last7.Select(d => (d.date.ToString("MM-dd"), (double)d.count)).ToList();
        body.Children.Add(MiniChart.Bars(chartData, new SolidColorBrush(Color.FromArgb(0xFF, 0xE0, 0x62, 0x40)), secondary));

        // hourly distribution
        var hourlyMins = _hourlySeconds.Select(v => v / 60.0).ToArray();
        var hourLabels = Enumerable.Range(0, 24).Select(h => $"{h:D2}").ToList();
        var hasData = hourlyMins.Any(v => v > 0);
        if (hasData)
        {
            body.Children.Add(new TextBlock { Text = "今日专注分布", FontSize = 14, FontWeight = FontWeights.SemiBold, Foreground = primary, Margin = new Thickness(0, 8, 0, 0) });
            var barList = hourLabels.Select((l, i) => (l, hourlyMins[i])).ToList();
            body.Children.Add(MiniChart.Bars(barList, new SolidColorBrush(Color.FromArgb(0xFF, 0x62, 0xA0, 0xE0)), secondary, 80));
        }

        // recent sessions
        var sessions = PomodoroPlugin.GetSessions(_host);
        var recent = sessions.OrderByDescending(s => s.Timestamp).Take(10).ToList();
        if (recent.Count > 0)
        {
            body.Children.Add(new TextBlock { Text = "最近专注记录", FontSize = 14, FontWeight = FontWeights.SemiBold, Foreground = primary, Margin = new Thickness(0, 8, 0, 0) });
            foreach (var s in recent)
            {
                var row = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 8 };
                row.Children.Add(new TextBlock { Text = s.Timestamp.ToString("HH:mm"), FontSize = 12, Foreground = secondary, Width = 48 });
                row.Children.Add(new TextBlock { Text = s.Task.Length > 20 ? s.Task[..20] + "…" : s.Task, FontSize = 12, Foreground = primary });
                row.Children.Add(new TextBlock { Text = $"{s.FocusMin}min", FontSize = 12, Foreground = secondary });
                body.Children.Add(row);
            }
        }

        _overlay.Show(this, "番茄钟", body, _host.Log);
        UpdateViews();
    }

    internal void SetWidgetBackground(Brush brush) => _root.Background = brush;
}
