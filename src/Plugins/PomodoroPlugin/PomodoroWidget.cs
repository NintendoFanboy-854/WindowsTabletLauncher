using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;
using System.Text.Json;
using Windows.UI;

namespace PomodoroPlugin;

/// <summary>
/// 番茄钟 tile（Fluent 2）：主题资源画刷 + 字阶 + 卡片描边 + hover + 阶段色（专注=Accent，休息=Success）；
/// overlay：计时卡（display 大数字 + accent 主按钮）/ 任务卡 / 统计卡 / 记录卡。
/// </summary>
public sealed class PomodoroWidget : UserControl
{
    enum Phase { Focus, Break }

    readonly IHostHandle _host;
    readonly PomodoroPlugin _plugin;
    readonly DispatcherQueue _dispatcher;
    readonly DispatcherQueueTimer _timer;
    readonly BasePluginOverlay _overlay = new();

    WidgetTile _tile = null!;
    TextBlock _phaseText = null!;
    TextBlock _timeText = null!;
    TextBlock _hintText = null!;
    TextBlock _taskText = null!;

    TextBlock? _ovTime;
    TextBlock? _ovPhase;
    Button? _ovStartPause;
    ProgressBar? _ovProgress;
    readonly int[] _hourlySeconds = new int[24];

    Phase _phase = Phase.Focus;
    bool _running;
    bool _isLongBreak;
    int _remaining;
    int _focusCount;
    int _tickCounter;
    DateTime _hourlyDate = DateTime.Today;
    int? _tempFocusSeconds;

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
        UpdateTimer();
    }

    void UpdateTimer()
    {
        if (_running) _timer.Start();
        else _timer.Stop();
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

    int CurrentPhaseSeconds
        => _phase == Phase.Focus ? (_tempFocusSeconds ?? FocusMin * 60) : (_isLongBreak ? LongBreakMin : BreakMin) * 60;

    void PlayChime() { if (!SoundOn) return; try { MessageBeep(0x00000040); } catch { } }

    void BuildUi()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        _phaseText = Fluent.Text("专注", theme, "bodyStrong", Fluent.TextSecondary(theme));
        _phaseText.HorizontalAlignment = HorizontalAlignment.Center;
        _timeText = Fluent.Text("25:00", theme, "numberTile");
        _timeText.HorizontalAlignment = HorizontalAlignment.Center;
        _hintText = Fluent.Text("已暂停", theme, "caption", Fluent.TextTertiary(theme));
        _hintText.HorizontalAlignment = HorizontalAlignment.Center;
        _taskText = Fluent.Text("", theme, "caption", Fluent.TextTertiary(theme));
        _taskText.TextTrimming = TextTrimming.CharacterEllipsis;
        _taskText.HorizontalAlignment = HorizontalAlignment.Center;
        _taskText.Visibility = Visibility.Collapsed;

        var stack = new StackPanel { Spacing = Fluent.SpaceXS, HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center };
        stack.Children.Add(_phaseText);
        stack.Children.Add(_timeText);
        stack.Children.Add(_hintText);
        stack.Children.Add(_taskText);

        var content = new Grid { Padding = new Thickness(Fluent.SpaceM) };
        content.Children.Add(stack);

        _tile = WidgetTile.Create(content, "番茄钟").Tap(OpenDetail);
        Content = _tile;
    }

    void ApplyTheme(ElementTheme theme)
    {
        _tile.ApplyTheme(theme, (Brush)_host.GetWidgetBackgroundBrush());
        _timeText.Foreground = Fluent.TextPrimary(theme);
        _hintText.Foreground = Fluent.TextTertiary(theme);
        _taskText.Foreground = Fluent.TextSecondary(theme);
        UpdatePhaseColor(theme);
    }

    void UpdatePhaseColor(ElementTheme theme)
    {
        _phaseText.Foreground = _phase == Phase.Focus ? Fluent.Accent() : Fluent.Success(theme);
    }

    void OnTick(DispatcherQueueTimer sender, object args)
    {
        if (!_running) return;
        _remaining--;
        var now = DateTime.Now;
        // 跨午夜：清零分时分布，避免昨日数据被改签到今天
        if (now.Date != _hourlyDate)
        {
            _hourlyDate = now.Date;
            Array.Clear(_hourlySeconds, 0, 24);
        }
        // 只有专注阶段计入专注分布
        if (_phase == Phase.Focus)
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
            var focusMin = _tempFocusSeconds.HasValue ? Math.Max(1, _tempFocusSeconds.Value / 60) : FocusMin;
            _tempFocusSeconds = null;
            _focusCount++;
            PomodoroPlugin.AddCompletion(_host, Task, focusMin);
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

        // 屏幕常亮只在专注运行阶段保持
        if (_running && _phase == Phase.Focus)
            SetScreen(true);
        else
            SetScreen(false);

        UpdateTimer();
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
        _host.SetConfig(nameof(PomodoroPlugin), "hourly_today", JsonSerializer.Serialize(_hourlySeconds));
        _host.SetConfig(nameof(PomodoroPlugin), "hourly_date", _hourlyDate.ToString("yyyyMMdd"));
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
            _hourlyDate = DateTime.Today;
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
        if (!_running)
        {
            // 开始始终允许
            _running = true;
            if (_phase == Phase.Focus) SetScreen(true);
        }
        else if (AllowPauseCfg)
        {
            _running = false;
            SetScreen(false);
        }
        else
        {
            return;
        }
        UpdateTimer();
        PersistState();
        UpdateViews();
    }

    internal void Pause()
    {
        if (!AllowPauseCfg) return;
        _running = false;
        SetScreen(false);
        UpdateTimer();
        PersistState();
        UpdateViews();
    }

    internal void Resume()
    {
        if (!AllowPauseCfg) return;
        _running = true;
        if (_phase == Phase.Focus) SetScreen(true);
        UpdateTimer();
        PersistState();
        UpdateViews();
    }

    internal void Skip()
    {
        if (_phase == Phase.Focus)
        {
            // 跳过的专注同样推进长休节奏（与自然完成口径一致），但不记录完成次数
            _focusCount++;
            _isLongBreak = LongBreakEvery > 0 && _focusCount % LongBreakEvery == 0;
            _tempFocusSeconds = null;
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
        UpdateTimer();
        PersistState();
        UpdateViews();
    }

    internal void ResetTimer()
    {
        _running = false;
        _remaining = CurrentPhaseSeconds;
        SetScreen(false);
        UpdateTimer();
        PersistState();
        UpdateViews();
    }

    public void StartFocus(int minutes)
    {
        // 临时时长：不永久改写 focus_min 配置；限制 1-180 分钟防止溢出
        var m = Math.Clamp(minutes, 1, 180);
        _tempFocusSeconds = m * 60;
        _phase = Phase.Focus;
        _isLongBreak = false;
        _remaining = m * 60;
        _running = true;
        SetScreen(true);
        _host.Log($"Pomodoro: start focus {m}min (temporary)");
        UpdateTimer();
        PersistState();
        UpdateViews();
    }

    public void ApplyDurations()
    {
        // 计时进行中不打断当前倒计时，仅未运行时应用新时长
        if (!_running)
            _remaining = CurrentPhaseSeconds;
        _host.Log($"Pomodoro: apply durations focus={FocusMin} break={BreakMin} running={_running}");
        UpdateViews();
    }

    public void ResetState()
    {
        _phase = Phase.Focus;
        _isLongBreak = false;
        _focusCount = 0;
        _tempFocusSeconds = null;
        _hourlyDate = DateTime.Today;
        Array.Clear(_hourlySeconds, 0, 24);
        _remaining = FocusMin * 60;
        _running = false;
        SetScreen(false);
        UpdateTimer();
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

    /// <summary>AI 状态快照（一行摘要，供 GetContextSnapshot hook）。</summary>
    public string Snapshot()
    {
        var phase = _phase == Phase.Focus ? "专注" : (_isLongBreak ? "长休息" : "休息");
        var last7 = PomodoroPlugin.Last7(_host);
        var today = last7.Count > 0 ? last7[^1].count : 0;
        return $"番茄钟: {phase} 剩余 {Format(_remaining)} {(_running ? "运行中" : "已暂停")}；任务「{Task}」；今日完成 {today} 个；设置 专注{FocusMin}min/休息{BreakMin}min/长休{LongBreakMin}min/每{LongBreakEvery}轮";
    }

    static string Format(int seconds)
    {
        if (seconds < 0) seconds = 0;
        return $"{seconds / 60:00}:{seconds % 60:00}";
    }

    void UpdateViews()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        var phase = _phase == Phase.Focus ? "专注" : (_isLongBreak ? "长休息" : "休息");
        _phaseText.Text = phase;
        UpdatePhaseColor(theme);
        _timeText.Text = Format(_remaining);
        _hintText.Text = _running ? "进行中" : "已暂停";

        var task = Task;
        _taskText.Text = task;
        _taskText.Visibility = string.IsNullOrEmpty(task) ? Visibility.Collapsed : Visibility.Visible;

        if (_overlay.IsOpen)
        {
            if (_ovPhase != null) _ovPhase.Text = phase;
            if (_ovTime != null) _ovTime.Text = Format(_remaining);
            if (_ovStartPause != null)
            {
                _ovStartPause.Content = _running ? "暂停" : "开始";
                // 不允许暂停时，仅禁用"暂停"方向；开始方向始终可用
                _ovStartPause.IsEnabled = !(_running && !AllowPauseCfg);
            }
            if (_ovProgress != null)
            {
                var pct = ProgressPercent();
                // 0% 时隐藏，避免被误读为装饰分隔线
                _ovProgress.Visibility = pct > 0.5 || _running ? Visibility.Visible : Visibility.Collapsed;
                _ovProgress.Value = pct;
                var t = ((FrameworkElement)this).ActualTheme;
                _ovProgress.Foreground = _phase == Phase.Focus ? Fluent.Accent() : Fluent.Success(t);
            }
        }
    }

    double ProgressPercent()
    {
        var total = CurrentPhaseSeconds;
        return total <= 0 ? 0 : Math.Clamp((total - _remaining) * 100.0 / total, 0, 100);
    }

    void OpenDetail()
    {
        if (_overlay.IsOpen) return;
        var theme = ((FrameworkElement)this).ActualTheme;

        // 两列自适应（横屏）：左=计时主卡（视觉重心），右=任务/统计/记录
        var body = new Grid { ColumnSpacing = Fluent.SpaceM };
        body.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(45, GridUnitType.Star) });
        body.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(55, GridUnitType.Star) });
        var leftCol = new StackPanel { Spacing = Fluent.SpaceM };
        var rightCol = new StackPanel { Spacing = Fluent.SpaceM };
        Grid.SetColumn(leftCol, 0);
        Grid.SetColumn(rightCol, 1);
        body.Children.Add(leftCol);
        body.Children.Add(rightCol);

        // 计时卡
        _ovPhase = Fluent.Text(_phase == Phase.Focus ? "专注" : "休息", theme, "bodyLarge", Fluent.TextSecondary(theme));
        _ovPhase.HorizontalAlignment = HorizontalAlignment.Center;
        _ovTime = Fluent.Text(Format(_remaining), theme, "numberHero");
        _ovTime.HorizontalAlignment = HorizontalAlignment.Center;

        _ovStartPause = Fluent.Cta(_running ? "暂停" : "开始", ToggleStartPause, accent: true);
        _ovStartPause.IsEnabled = !(_running && !AllowPauseCfg);

        var skipBtn = Fluent.Cta("跳过", Skip, accent: false);
        var resetBtn = Fluent.Cta("重置", ResetTimer, accent: false);
        var controls = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceS, HorizontalAlignment = HorizontalAlignment.Center };
        controls.Children.Add(_ovStartPause);
        controls.Children.Add(skipBtn);
        controls.Children.Add(resetBtn);

        var timerBody = new StackPanel { Spacing = Fluent.SpaceM, VerticalAlignment = VerticalAlignment.Center };
        timerBody.Children.Add(_ovPhase);
        timerBody.Children.Add(_ovTime);
        _ovProgress = new ProgressBar
        {
            Minimum = 0,
            Maximum = 100,
            Value = ProgressPercent(),
            Height = 4,
            CornerRadius = new CornerRadius(2)
        };
        timerBody.Children.Add(_ovProgress);
        timerBody.Children.Add(controls);
        var timerCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceL));
        timerCard.Child = timerBody;
        leftCol.Children.Add(timerCard);

        // 任务卡
        var taskBox = new TextBox
        {
            Header = "当前专注任务",
            PlaceholderText = "在做什么…",
            Text = Task,
            HorizontalAlignment = HorizontalAlignment.Stretch,
            MinHeight = Fluent.TouchTarget
        };
        taskBox.LostFocus += (_, _) => { _host.SetConfig(nameof(PomodoroPlugin), "task", taskBox.Text.Trim()); UpdateViews(); };
        var taskCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceM));
        taskCard.Child = taskBox;
        rightCol.Children.Add(taskCard);

        // 统计卡
        var statsBody = new StackPanel { Spacing = Fluent.SpaceS };
        var last7 = PomodoroPlugin.Last7(_host);
        var todayCount = last7.Count > 0 ? last7[^1].count : 0;
        statsBody.Children.Add(Fluent.Text($"今日完成 {todayCount} 个 · 近 7 天", theme, "bodyLargeStrong", Fluent.TextPrimary(theme)));
        var chartData = last7.Select(d => (d.date.ToString("MM-dd"), (double)d.count)).ToList();
        statsBody.Children.Add(MiniChart.Bars(chartData, Fluent.Accent(), Fluent.TextSecondary(theme)));

        var hourlyMins = _hourlySeconds.Select(v => v / 60.0).ToArray();
        if (hourlyMins.Any(v => v > 0))
        {
            statsBody.Children.Add(Fluent.Text("今日专注分布", theme, "bodyLargeStrong", Fluent.TextPrimary(theme)));
            var barList = Enumerable.Range(0, 24).Select(h => ($"{h:D2}", hourlyMins[h])).ToList();
            statsBody.Children.Add(MiniChart.Bars(barList, Fluent.Success(theme), Fluent.TextSecondary(theme), 80));
        }
        var statsCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceL));
        statsCard.Child = statsBody;
        rightCol.Children.Add(statsCard);

        // 最近记录卡
        var sessions = PomodoroPlugin.GetSessions(_host);
        var recent = sessions.OrderByDescending(s => s.Timestamp).Take(10).ToList();
        if (recent.Count > 0)
        {
            var recentBody = new StackPanel { Spacing = Fluent.SpaceS };
            recentBody.Children.Add(Fluent.Text("最近专注记录", theme, "bodyLargeStrong", Fluent.TextPrimary(theme)));
            foreach (var s in recent)
            {
                var row = new Grid { ColumnSpacing = 8 };
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                var t1 = Fluent.Text(s.Timestamp.ToString("HH:mm"), theme, "caption", Fluent.TextTertiary(theme));
                t1.VerticalAlignment = VerticalAlignment.Center;
                Grid.SetColumn(t1, 0);
                row.Children.Add(t1);
                var t2 = Fluent.Text(s.Task.Length > 24 ? s.Task[..24] + "…" : s.Task, theme, "body", Fluent.TextPrimary(theme));
                t2.TextTrimming = TextTrimming.CharacterEllipsis;
                t2.VerticalAlignment = VerticalAlignment.Center;
                Grid.SetColumn(t2, 1);
                row.Children.Add(t2);
                var t3 = Fluent.Text($"{s.FocusMin}min", theme, "caption", Fluent.TextSecondary(theme));
                t3.VerticalAlignment = VerticalAlignment.Center;
                Grid.SetColumn(t3, 2);
                row.Children.Add(t3);
                recentBody.Children.Add(row);
            }
            var recentCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceM));
            recentCard.Child = recentBody;
            rightCol.Children.Add(recentCard);
        }

        _overlay.Show(this, "番茄钟", body, _host.Log);
        UpdateViews();
    }

    internal void SetWidgetBackground(Brush brush) => _tile.ApplyTheme(((FrameworkElement)this).ActualTheme, brush);
}
