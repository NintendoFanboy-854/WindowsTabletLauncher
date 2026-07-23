/*
using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using PluginContract;
using LauncherHost.Services;
using Windows.Graphics.Imaging;
using Windows.UI;

namespace LauncherHost.Core.Agent;

public sealed class FaceRegistrationDialog
{
    readonly FaceAuthService _faceAuth;
    readonly IHostHandle _host;
    readonly DispatcherQueue _dispatcher;

    Popup? _popup;
    CameraCapture? _camera;
    Image? _previewImage;
    Border? _previewBorder;
    ProgressBar? _frameProgressBar;
    TextBlock? _stageTitleText;
    TextBlock? _stageGuideText;
    TextBlock? _statusText;
    TextBlock? _progressLabel;
    TextBox? _nameBox;
    Button? _nextBtn;
    Button? _skipBtn;
    Button? _closeBtn;
    Button? _confirmBtn;
    StackPanel? _namePanel;
    StackPanel? _stagePanel;
    StackPanel? _trainingPanel;
    TextBlock? _trainingStatusText;
    StackPanel? _donePanel;
    StackPanel? _btnRow;
    StackPanel? _stepBar;

    List<SoftwareBitmap> _collectedFrames = new();
    int[] _stageFrames = new int[7];
    int _currentStage;
    string? _reinforceName;
    int _faceFrameCount;
    int _processingFrames;
    int _frameIndex;
    bool _collecting;
    bool _previewPhase = true;
    TaskCompletionSource<bool>? _doneTcs;
    TaskCompletionSource<bool>? _showTcs;

    static readonly (string en, string zh, string guideEn, string guideZh, int count)[] Stages = {
        ("Face forward",    "正面",   "Look straight at the camera",       "请正对摄像头",       40),
        ("Turn left",       "向左转头", "Slowly turn your head to the left",  "缓慢向左转头",       40),
        ("Turn right",      "向右转头", "Slowly turn your head to the right", "缓慢向右转头",       40),
        ("Look up",         "向上看",  "Slowly tilt your head up",         "缓慢向上抬头",       40),
        ("Look down",       "向下看",  "Slowly tilt your head down",       "缓慢向下低头",       40),
        ("Clockwise",       "顺时针转", "Slowly rotate your head clockwise",  "缓慢顺时针转一圈",    40),
        ("Counter-clockwise","逆时针转","Slowly rotate your head counter-clockwise","缓慢逆时针转一圈", 40),
    };

    const int MaxConcurrent = 3;

    public FaceRegistrationDialog(FaceAuthService faceAuth, IHostHandle host)
    {
        _faceAuth = faceAuth;
        _host = host;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
    }

    public async Task<bool> ShowAsync(XamlRoot xamlRoot, string? reinforceName = null)
    {
        _reinforceName = reinforceName;
        LogService.Info("[FaceRegDialog] ShowAsync starting" + (reinforceName != null ? $" reinforce={reinforceName}" : ""));
        _showTcs = new TaskCompletionSource<bool>();

        _camera = new CameraCapture();

        _previewImage = new Image
        {
            Width = 320, Height = 240, Stretch = Stretch.UniformToFill
        };

        _stageTitleText = new TextBlock
        {
            FontSize = 18, FontWeight = Microsoft.UI.Text.FontWeights.SemiBold,
            HorizontalTextAlignment = TextAlignment.Center
        };
        _stageGuideText = new TextBlock
        {
            FontSize = 14, Opacity = 0.8,
            TextWrapping = TextWrapping.Wrap, HorizontalTextAlignment = TextAlignment.Center
        };

        _frameProgressBar = new ProgressBar { Minimum = 0, Maximum = 40, Value = 0, Height = 6, Margin = new Thickness(0, 4, 0, 0) };

        var stageDots = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 4, HorizontalAlignment = HorizontalAlignment.Center };
        for (int i = 0; i < 7; i++)
            stageDots.Children.Add(new Ellipse { Width = 8, Height = 8, Fill = new SolidColorBrush(Color.FromArgb(0x60, 0xFF, 0xFF, 0xFF)) });

        _progressLabel = new TextBlock { FontSize = 11, Opacity = 0.7, HorizontalTextAlignment = TextAlignment.Center };

        _nextBtn = new Button { Content = T("face.reg.start_collect"), MinWidth = 120 };
        _skipBtn = new Button { Content = T("face.reg.skip"), MinWidth = 80, Opacity = 0.6, IsEnabled = false };
        _skipBtn.Click += (_, _) => AdvanceStage();
        _nextBtn.Click += (_, _) =>
        {
            if (_previewPhase) { StartStageCollection(); }
            else if (_collecting) FinishCurrentStage();
            else StartCurrentStage();
        };
        _closeBtn = new Button { Content = T("face.reg.close_preview"), MinWidth = 80, Opacity = 0.6 };
        _closeBtn.Click += (_, _) => _showTcs?.TrySetResult(false);

        _btnRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 12, HorizontalAlignment = HorizontalAlignment.Center };
        _btnRow.Children.Add(_closeBtn);
        _btnRow.Children.Add(_skipBtn);
        _btnRow.Children.Add(_nextBtn);

        _nameBox = new TextBox { PlaceholderText = T("face.registration.name_placeholder"), HorizontalAlignment = HorizontalAlignment.Stretch, MaxLength = 20 };
        _confirmBtn = new Button { Content = T("face.registration.confirm"), MinWidth = 100, HorizontalAlignment = HorizontalAlignment.Center };
        _confirmBtn.Click += OnConfirmClick;
        _namePanel = new StackPanel { Spacing = 8, Visibility = Visibility.Collapsed };
        _namePanel.Children.Add(new TextBlock { Text = T("face.registration.name_prompt"), FontSize = 13, TextWrapping = TextWrapping.Wrap, HorizontalTextAlignment = TextAlignment.Center });
        _namePanel.Children.Add(_nameBox);
        _namePanel.Children.Add(_confirmBtn);

        _trainingPanel = new StackPanel { Spacing = 12, Visibility = Visibility.Collapsed, HorizontalAlignment = HorizontalAlignment.Center };
        _trainingPanel.Children.Add(new ProgressRing { IsActive = true, Width = 40, Height = 40, HorizontalAlignment = HorizontalAlignment.Center });
        _trainingStatusText = new TextBlock { FontSize = 14, HorizontalTextAlignment = TextAlignment.Center };
        _trainingPanel.Children.Add(_trainingStatusText);

        _donePanel = new StackPanel { Spacing = 8, Visibility = Visibility.Collapsed, HorizontalAlignment = HorizontalAlignment.Center };
        _donePanel.Children.Add(new FontIcon { Glyph = "\uE73E", FontSize = 40, HorizontalAlignment = HorizontalAlignment.Center, Foreground = new SolidColorBrush(Color.FromArgb(0xFF, 0x4C, 0xAF, 0x50)) });
        _donePanel.Children.Add(new TextBlock { Text = T("face.reg.done"), FontSize = 16, FontWeight = Microsoft.UI.Text.FontWeights.SemiBold, HorizontalTextAlignment = TextAlignment.Center });

        _stagePanel = new StackPanel { Spacing = 8, Visibility = Visibility.Collapsed };
        _stagePanel.Children.Add(_stageTitleText);
        _stagePanel.Children.Add(_stageGuideText);
        _stagePanel.Children.Add(_frameProgressBar);
        _stagePanel.Children.Add(_progressLabel);
        _stagePanel.Children.Add(stageDots);

        _statusText = new TextBlock { FontSize = 12, Opacity = 0.7, HorizontalTextAlignment = TextAlignment.Center };

        _stepBar = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 4, HorizontalAlignment = HorizontalAlignment.Center, Margin = new Thickness(0, 0, 0, 4) };
        var stepNames = new[] { T("face.reg.step_preview"), T("face.reg.step_collect"), T("face.reg.step_name"), T("face.reg.step_train") };
        for (int i = 0; i < 4; i++)
        {
            _stepBar.Children.Add(new TextBlock
            {
                Text = (i > 0 ? "→ " : "") + stepNames[i],
                FontSize = 11, Opacity = 0.8,
                Foreground = new SolidColorBrush(Color.FromArgb(0x40, 0xFF, 0xFF, 0xFF))
            });
        }
        UpdateStepIndicator(0);

        var previewBorder = _previewBorder = new Border
        {
            Child = _previewImage, Width = 320, Height = 240, HorizontalAlignment = HorizontalAlignment.Center,
            BorderThickness = new Thickness(1), BorderBrush = new SolidColorBrush(Color.FromArgb(0x40, 0xFF, 0xFF, 0xFF)),
            CornerRadius = new CornerRadius(8)
        };

        var cardLayout = new StackPanel { Spacing = 12 };
        cardLayout.Children.Add(_stepBar);
        cardLayout.Children.Add(previewBorder);
        cardLayout.Children.Add(_stagePanel);
        cardLayout.Children.Add(_statusText);
        cardLayout.Children.Add(_namePanel);
        cardLayout.Children.Add(_trainingPanel);
        cardLayout.Children.Add(_donePanel);
        cardLayout.Children.Add(_btnRow);

        var theme = _host.GetWidgetBackgroundBrush() is SolidColorBrush b
            ? (b.Color.R + b.Color.G + b.Color.B > 384 ? ElementTheme.Light : ElementTheme.Dark)
            : ElementTheme.Dark;
        var cardBg = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0xF0, 0xF3, 0xF3, 0xF3))
            : new SolidColorBrush(Color.FromArgb(0xF0, 0x1E, 0x1E, 0x1E));

        var card = new Border
        {
            Child = cardLayout, Background = cardBg, CornerRadius = new CornerRadius(12),
            Padding = new Thickness(32), MinWidth = 420, MaxWidth = 480,
            HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center
        };

        var overlay = new Grid { Width = 1440, Height = 960, Background = new SolidColorBrush(Color.FromArgb(0x80, 0x00, 0x00, 0x00)) };
        overlay.Children.Add(card);

        _popup = new Popup { XamlRoot = xamlRoot, IsLightDismissEnabled = false, Child = overlay };

        _camera.FrameCaptured += OnCameraFrame;
        _popup.IsOpen = true;

        var ok = await _camera.StartAsync(_previewImage);
        if (!ok)
        {
            _statusText!.Text = T("face.registration.camera_failed");
            _nextBtn!.IsEnabled = false;
        }

        _statusText!.Text = T("face.registration.no_face");

        var result = await _showTcs.Task;

        _camera.FrameCaptured -= OnCameraFrame;
        _camera.Stop();

        _popup.IsOpen = false;
        LogService.Info($"[FaceRegDialog] ShowAsync completed, result={result}");
        return result;
    }

    void StartStageCollection()
    {
        _previewPhase = false;
        _currentStage = 0;
        _stagePanel!.Visibility = Visibility.Visible;
        _closeBtn!.Visibility = Visibility.Collapsed;
        UpdateStepIndicator(1);
        UpdateStageUI();
    }

    void UpdateStageUI()
    {
        var isZh = _host.Translate("face.reg.next") != "face.reg.next";
        _stageTitleText!.Text = string.Format(T("face.reg.stage_title"), _currentStage + 1, 7, isZh ? Stages[_currentStage].zh : Stages[_currentStage].en);
        _stageGuideText!.Text = isZh ? Stages[_currentStage].guideZh : Stages[_currentStage].guideEn;
        _frameProgressBar!.Maximum = Stages[_currentStage].count;
        _frameProgressBar.Value = 0;
        _stageFrames[_currentStage] = 0;
        _faceFrameCount = 0;
        _progressLabel!.Text = string.Format(T("face.reg.stage_progress"), 0, Stages[_currentStage].count);
        _nextBtn!.Content = T("face.reg.start_stage");
        _skipBtn!.IsEnabled = _currentStage > 0;
        _collecting = false;
        _doneTcs = null;
        _statusText!.Text = "";

        var dots = _stagePanel!.Children[^1] as StackPanel;
        if (dots != null)
        {
            for (int i = 0; i < 7 && i < dots.Children.Count; i++)
            {
                var fill = i < _currentStage ? Color.FromArgb(0xFF, 0x4C, 0xAF, 0x50)
                    : i == _currentStage ? Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF)
                    : Color.FromArgb(0x40, 0xFF, 0xFF, 0xFF);
                ((Ellipse)dots.Children[i]).Fill = new SolidColorBrush(fill);
            }
        }
    }

    void StartCurrentStage()
    {
        _doneTcs = new TaskCompletionSource<bool>();
        _collecting = true;
        _faceFrameCount = 0;
        _frameProgressBar!.Value = 0;
        _nextBtn!.Content = "...";
        _nextBtn.IsEnabled = false;
        _skipBtn!.IsEnabled = false;
        _statusText!.Text = string.Format(T("face.reg.stage_progress"), 0, Stages[_currentStage].count);

        _ = WaitForStageAsync();
    }

    async Task WaitForStageAsync()
    {
        try { await _doneTcs!.Task.WaitAsync(TimeSpan.FromSeconds(30)); }
        catch { }
        FinishCurrentStage();
    }

    void FinishCurrentStage()
    {
        if (!_collecting) return;
        _collecting = false;
        _doneTcs?.TrySetResult(true);
        _nextBtn!.IsEnabled = true;
        _skipBtn!.IsEnabled = _currentStage > 0;
        AdvanceStage();
    }

    void AdvanceStage()
    {
        _currentStage++;
        if (_currentStage >= 7)
        {
            ShowNameInput();
        }
        else
        {
            UpdateStageUI();
        }
    }

    void UpdateStepIndicator(int phase)
    {
        if (_stepBar == null) return;
        for (int i = 0; i < 4 && i < _stepBar.Children.Count; i++)
        {
            var tb = (TextBlock)_stepBar.Children[i];
            var done = i < phase;
            var current = i == phase;
            tb.Foreground = done ? new SolidColorBrush(Color.FromArgb(0xFF, 0x4C, 0xAF, 0x50))
                : current ? new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF))
                : new SolidColorBrush(Color.FromArgb(0x40, 0xFF, 0xFF, 0xFF));
        }
    }

    void ShowNameInput()
    {
        _stagePanel!.Visibility = Visibility.Collapsed;
        _btnRow!.Visibility = Visibility.Collapsed;
        _statusText!.Text = "";
        _progressLabel!.Text = "";
        _previewBorder!.Visibility = Visibility.Collapsed;
        _statusText!.Visibility = Visibility.Collapsed;
        _progressLabel!.Visibility = Visibility.Collapsed;
        UpdateStepIndicator(2);

        if (_reinforceName != null)
        {
            _nameBox!.Text = _reinforceName;
            _nameBox.IsEnabled = false;
        }
        _namePanel!.Visibility = Visibility.Visible;
    }

    async void OnConfirmClick(object sender, RoutedEventArgs e)
    {
        var name = _nameBox!.Text.Trim();
        if (string.IsNullOrWhiteSpace(name)) { _statusText!.Text = T("face.registration.name_required"); return; }

        _namePanel!.Visibility = Visibility.Collapsed;
        _trainingPanel!.Visibility = Visibility.Visible;
        _trainingStatusText!.Text = T("face.reg.training");
        UpdateStepIndicator(3);

        try
        {
            List<SoftwareBitmap> frames;
            lock (_collectedFrames) { frames = new List<SoftwareBitmap>(_collectedFrames); _collectedFrames.Clear(); }

            _trainingStatusText.Text = string.Format(T("face.reg.training_detail"), frames.Count);

            bool success;
            if (_reinforceName != null)
                success = await Task.Run(() => _faceAuth.ReinforceAsync(frames, name));
            else
                success = await Task.Run(() => _faceAuth.RegisterAsync(frames, name));

            foreach (var f in frames) f.Dispose();

            _trainingPanel!.Visibility = Visibility.Collapsed;

            if (!success)
            {
                _statusText!.Text = T("face.registration.failed_no_faces");
                _showTcs?.TrySetResult(false);
                return;
            }
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[FaceRegDialog] confirm error");
            _statusText!.Text = T("face.registration.failed_training");
            _showTcs?.TrySetResult(false);
            return;
        }

        _donePanel!.Visibility = Visibility.Visible;
        _showTcs?.TrySetResult(true);
    }

    void OnCameraFrame(SoftwareBitmap bitmap)
    {
        var idx = Interlocked.Increment(ref _frameIndex);
        if (idx % 2 != 0) { bitmap.Dispose(); return; }

        var current = Interlocked.Increment(ref _processingFrames);
        if (current > MaxConcurrent) { Interlocked.Decrement(ref _processingFrames); bitmap.Dispose(); return; }

        Task.Run(async () =>
        {
            try
            {
                var faceResult = await _faceAuth.ProcessFrameAsync(bitmap);

                if (_previewPhase)
                {
                    _dispatcher.TryEnqueue(() =>
                    {
                        _statusText!.Text = faceResult != null ? T("face.registration.face_detected") : T("face.registration.no_face");
                    });
                    bitmap.Dispose();
                    return;
                }

                if (!_collecting) { bitmap.Dispose(); return; }
                if (_faceFrameCount >= Stages[_currentStage].count) { bitmap.Dispose(); return; }

                if (faceResult != null)
                {
                    lock (_collectedFrames) { _collectedFrames.Add(bitmap); }
                    Interlocked.Increment(ref _faceFrameCount);
                    _stageFrames[_currentStage] = _faceFrameCount;

                    _dispatcher.TryEnqueue(() =>
                    {
                        _frameProgressBar!.Value = _faceFrameCount;
                        var totalDone = _collectedFrames.Count;
                        _progressLabel!.Text = string.Format(T("face.reg.stage_progress"), _faceFrameCount, Stages[_currentStage].count);
                        _statusText!.Text = string.Format(T("face.reg.total_frames"), totalDone);

                        if (_faceFrameCount >= Stages[_currentStage].count)
                            FinishCurrentStage();
                    });
                }
                else
                {
                    bitmap.Dispose();
                }
            }
            catch (Exception ex)
            {
                LogService.Warn($"[FaceRegDialog] frame process: {ex.Message}");
                bitmap.Dispose();
            }
            finally
            {
                Interlocked.Decrement(ref _processingFrames);
            }
        });
    }

    string T(string key) => _host.Translate(key);
}
*/
