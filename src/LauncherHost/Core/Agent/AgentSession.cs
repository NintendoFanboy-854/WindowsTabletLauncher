using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Windows.Media.Core;
using Windows.Media.Playback;
using Windows.Storage.Streams;
using System.Text;
using LauncherHost.Services;
using SharedUtils;
using Windows.UI;

namespace LauncherHost.Core.Agent;

enum BlockType { Thinking, Tool, Output }

sealed class BlockInfo
{
    public BlockType Type;
    public UIElement Container = null!;       // ScrollViewer(think) / TextBlock(tool) / Grid(output)
    public TextBlock? CollapsedPh;
    public StringBuilder Text = new();
    public Brush PrimaryBrush = null!;
    public Brush SecondaryBrush = null!;
}

public sealed class AgentSession
{
    readonly AgentService _service;
    readonly Grid _parentGrid;
    readonly DispatcherQueue _dispatcher;

    Border? _bubble;
    ScrollViewer? _scrollViewer;
    StackPanel? _msgStack;
    StackPanel? _curBlock;
    readonly List<BlockInfo> _curBlocks = new();
    readonly List<List<BlockInfo>> _allSubTurnBlocks = new();

    TextBlock? _curThinkingPh;
    TextBlock? _curToolPh;
    TextBlock? _waitingStatusTb;
    bool _thinkingActive;
    bool _toolActive;
    static readonly SolidColorBrush RetryTint = new(Color.FromArgb(0x12, 0x40, 0x90, 0xFF));

    Brush? _primaryBrush;
    Brush? _secondaryBrush;

    Brush GetPrimaryBrush(ElementTheme theme)
    {
        _primaryBrush ??= theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A))
            : new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF));
        return _primaryBrush;
    }

    Brush GetSecondaryBrush(ElementTheme theme)
    {
        _secondaryBrush ??= theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0x99, 0, 0, 0))
            : new SolidColorBrush(Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF));
        return _secondaryBrush;
    }

    DispatcherQueueTimer? _spinnerTimer;
    int _spinnerIdx;
    int _tickCount;
    bool _spinnerRunning;

    DispatcherQueueTimer? _renderThrottleTimer;
    bool _renderPending;
    BlockInfo? _pendingBi;

    static readonly string[] SpinnerFrames = { "\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F" };

    static MediaPlayer? _activeAudioPlayer;

    public AgentSession(AgentService service, Grid parentGrid)
    {
        _service = service;
        _parentGrid = parentGrid;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
        _spinnerTimer = _dispatcher.CreateTimer();
        _spinnerTimer.Interval = TimeSpan.FromMilliseconds(100);
        _spinnerTimer.IsRepeating = true;
        _spinnerTimer.Tick += (_, _) =>
        {
            var frame = SpinnerFrames[_spinnerIdx++ % SpinnerFrames.Length];
            _tickCount++;
            if (_thinkingActive && _curThinkingPh != null && _curThinkingPh.Visibility == Visibility.Visible)
                _curThinkingPh.Text = frame + " 思考中...";
            if (_toolActive && _curToolPh != null && _curToolPh.Visibility == Visibility.Visible)
                _curToolPh.Text = frame + " 调用工具...";
            if (_waitingStatusTb != null)
                _waitingStatusTb.Text = frame + " 等待回应中…";
        };

        _renderThrottleTimer = _dispatcher.CreateTimer();
        _renderThrottleTimer.Interval = TimeSpan.FromMilliseconds(30);
        _renderThrottleTimer.IsRepeating = false;
        _renderThrottleTimer.Tick += (_, _) =>
        {
            if (!_renderPending) return;
            _renderPending = false;
            var bi = _pendingBi;
            if (bi == null || _curBlocks.Count == 0 || bi != _curBlocks[^1]) return;
            RenderBlock(bi);
        };

        _service.ExpandCotChanged += ApplyExpandMode;
        _service.OnAgentRetry += () => _dispatcher.TryEnqueue(() => { if (_curBlock != null) _curBlock.Background = RetryTint; });
        _service.OnAgentRetryExhausted += () => _dispatcher.TryEnqueue(() => { if (_curBlock != null) _curBlock.Background = null; });
    }

    void StartSpinner()
    {
        if (!_spinnerRunning && _spinnerTimer != null)
        {
            _spinnerTimer.Start();
            _spinnerRunning = true;
        }
    }

    void TryStopSpinner()
    {
        if (_spinnerRunning && !_thinkingActive && !_toolActive)
        {
            _spinnerTimer?.Stop();
            _spinnerRunning = false;
        }
    }

    public sealed record AudioBubbleRefs(
        Button PlayBtn, TextBlock DurText, TextBlock TransTb, MediaPlayer Player);

    public AudioBubbleRefs? CreateRecordingBubble()
    {
        try
        {
            var theme = _parentGrid.ActualTheme;
            var secondary = GetSecondaryBrush(theme);
            var bgColor = Color.FromArgb(0xFF, 0x1A, 0x66, 0xCC);

            EnsureBubble(_parentGrid,
                theme == ElementTheme.Light
                    ? new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A))
                    : new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF)),
                secondary);

            var playBtn = new Button
            {
                Width = 32, Height = 32, Padding = new Thickness(0),
                Content = new FontIcon { Glyph = "\uE1D6", FontSize = 14 },
                VerticalAlignment = VerticalAlignment.Center,
                IsEnabled = false,
                IsTabStop = false
            };
            var durText = new TextBlock
            {
                Text = "0:00", FontSize = 11, Foreground = secondary, Opacity = 0.7,
                VerticalAlignment = VerticalAlignment.Center
            };

            var player = new MediaPlayer();

            var audioRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 6 };
            audioRow.Children.Add(playBtn);
            audioRow.Children.Add(durText);

            var bubbleStack = new StackPanel { Spacing = 4 };
            bubbleStack.Children.Add(audioRow);

            var transTb = new TextBlock
            {
                Text = "...", FontSize = 11, Opacity = 0.7,
                Foreground = secondary, TextWrapping = TextWrapping.Wrap
            };
            bubbleStack.Children.Add(transTb);

            var bubble = new Border
            {
                CornerRadius = new CornerRadius(8), Padding = new Thickness(8, 6, 8, 6),
                Margin = new Thickness(48, 4, 0, 4), HorizontalAlignment = HorizontalAlignment.Right,
                Background = new SolidColorBrush(bgColor), Child = bubbleStack, MaxWidth = 360
            };
            _msgStack!.Children.Add(bubble);
            LogService.Info($"[AgentSession] recording bubble added, msgStackChildren={_msgStack.Children.Count}");

            return new AudioBubbleRefs(playBtn, durText, transTb, player);
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[AgentSession.CreateRecordingBubble] failed");
            return null;
        }
    }

    public void FinalizeAudioBubble(AudioBubbleRefs refs, byte[] wav, TimeSpan dur)
    {
        try
        {
            var theme = _parentGrid.ActualTheme;
            var secondary = GetSecondaryBrush(theme);

            refs.DurText.Text = $"{(int)dur.TotalMinutes}:{dur.Seconds:D2}";
            refs.PlayBtn.IsEnabled = true;
            ((FontIcon)refs.PlayBtn.Content).Glyph = "\uE102";
            refs.TransTb.Text = "转录中…";

            var wavCopy = wav;
            var player = refs.Player;

            refs.PlayBtn.Click += (_, _) =>
            {
                if (_activeAudioPlayer != null && _activeAudioPlayer != player)
                {
                    _activeAudioPlayer.Pause();
                    _activeAudioPlayer.Source = null;
                    _activeAudioPlayer = null;
                }

                if (player.PlaybackSession.PlaybackState == MediaPlaybackState.Playing)
                {
                    player.Pause();
                    ((FontIcon)refs.PlayBtn.Content).Glyph = "\uE102";
                }
                else
                {
                    if (player.Source == null)
                    {
                        var audioStream = new InMemoryRandomAccessStream();
                        var writer = new DataWriter(audioStream);
                        writer.WriteBytes(wavCopy);
                        writer.StoreAsync().AsTask().GetAwaiter().GetResult();
                        writer.DetachStream();
                        player.Source = MediaSource.CreateFromStream(audioStream, "audio/wav");
                    }
                    player.Play();
                    ((FontIcon)refs.PlayBtn.Content).Glyph = "\uE103";
                    _activeAudioPlayer = player;
                }
            };

            player.MediaEnded += (_, _) =>
            {
                _dispatcher.TryEnqueue(() =>
                {
                    ((FontIcon)refs.PlayBtn.Content).Glyph = "\uE102";
                    _activeAudioPlayer = null;
                });
            };
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[AgentSession.FinalizeAudioBubble] failed");
        }
    }

    public TextBlock CreateAudioBubble(byte[] wav, string initialTranscription, TimeSpan duration)
    {
        if (_service.IsBusy)
        {
            LogService.Warn("[AgentSession.SendAudio] blocked, service busy");
            return null!;
        }

        try
        {
        LogService.Info($"[AgentSession.SendAudio] entry, wav={wav.Length}bytes transLen={initialTranscription?.Length ?? 0} dur={duration.TotalSeconds:F1}s msgStack={_msgStack != null} bubble={_bubble != null}");

        var theme = _parentGrid.ActualTheme;
        var primary = GetPrimaryBrush(theme);
        var secondary = GetSecondaryBrush(theme);
        var bgColor = theme == ElementTheme.Light
            ? Color.FromArgb(0xFF, 0x1A, 0x66, 0xCC)
            : Color.FromArgb(0xFF, 0x1A, 0x66, 0xCC);

        EnsureBubble(_parentGrid, primary, secondary);
        LogService.Info($"[AgentSession.SendAudio] EnsureBubble done, msgStack={_msgStack != null}");

        // audio player
        var playBtn = new Button
        {
            Width = 32, Height = 32, Padding = new Thickness(0),
            Content = new FontIcon { Glyph = "\uE102", FontSize = 12 },
            VerticalAlignment = VerticalAlignment.Center,
            IsTabStop = false
        };
        var durText = new TextBlock
        {
            Text = $"{(int)duration.TotalMinutes}:{duration.Seconds:D2}",
            FontSize = 11, Foreground = secondary, Opacity = 0.7,
            VerticalAlignment = VerticalAlignment.Center, Margin = new Thickness(0, 0, 0, 0)
        };

        var wavCopy = wav;
        var player = new MediaPlayer();

        playBtn.Click += (_, _) =>
        {
            if (_activeAudioPlayer != null && _activeAudioPlayer != player)
            {
                _activeAudioPlayer.Pause();
                _activeAudioPlayer.Source = null;
                _activeAudioPlayer = null;
            }

            if (player.PlaybackSession.PlaybackState == MediaPlaybackState.Playing)
            {
                player.Pause();
                ((FontIcon)playBtn.Content).Glyph = "\uE102";
            }
            else
            {
                if (player.Source == null)
                {
                    var audioStream = new InMemoryRandomAccessStream();
                    var writer = new DataWriter(audioStream);
                    writer.WriteBytes(wavCopy);
                    writer.StoreAsync().AsTask().GetAwaiter().GetResult();
                    writer.DetachStream();
                    player.Source = MediaSource.CreateFromStream(audioStream, "audio/wav");
                }
                player.Play();
                ((FontIcon)playBtn.Content).Glyph = "\uE103";
                _activeAudioPlayer = player;
            }
        };

        player.MediaEnded += (_, _) =>
        {
            _dispatcher.TryEnqueue(() =>
            {
                ((FontIcon)playBtn.Content).Glyph = "\uE102";
                _activeAudioPlayer = null;
            });
        };

        var audioRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 6 };
        audioRow.Children.Add(playBtn);
        audioRow.Children.Add(durText);

        var bubbleStack = new StackPanel { Spacing = 4 };
        bubbleStack.Children.Add(audioRow);

        var transcriptionTb = new TextBlock
        {
            Text = initialTranscription ?? "转录中…",
            FontSize = 11, Opacity = 0.7, Foreground = secondary,
            TextWrapping = TextWrapping.Wrap
        };
        bubbleStack.Children.Add(transcriptionTb);

        var bubble = new Border
        {
            CornerRadius = new CornerRadius(8),
            Padding = new Thickness(8, 6, 8, 6),
            Margin = new Thickness(48, 4, 0, 4),
            HorizontalAlignment = HorizontalAlignment.Right,
            Background = new SolidColorBrush(bgColor),
            Child = bubbleStack,
            MaxWidth = 360
        };
        _msgStack!.Children.Add(bubble);
        LogService.Info($"[AgentSession.SendAudio] user bubble added, msgStackChildren={_msgStack.Children.Count}");

        if (_curBlocks.Count > 0)
        {
            LogService.Info($"[AgentSession.SendAudio] archiving {_curBlocks.Count} curBlocks");
            _allSubTurnBlocks.Add(new List<BlockInfo>(_curBlocks));
        }
        _curBlocks.Clear();
        _curBlock = null;
        _renderPending = false;
        _pendingBi = null;
        _renderThrottleTimer?.Stop();
        _thinkingActive = false;
        _toolActive = false;
        _curThinkingPh = null;
        _curToolPh = null;

        return transcriptionTb;
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[AgentSession.CreateAudioBubble] failed");
            return null!;
        }
    }

    public void SendAudioToLlm(byte[] wav, string transcription)
    {
        LogService.Info($"[AgentSession.SendAudioToLlm] sending, transLen={transcription?.Length ?? 0}, audioBase64={wav.Length}bytes");

        if (_curBlocks.Count > 0)
            _allSubTurnBlocks.Add(new List<BlockInfo>(_curBlocks));
        _curBlocks.Clear();
        _curBlock = null;
        _renderPending = false;
        _pendingBi = null;
        _renderThrottleTimer?.Stop();
        _thinkingActive = false;
        _toolActive = false;
        _curThinkingPh = null;
        _curToolPh = null;

        var theme = _parentGrid.ActualTheme;
        var secondary = GetSecondaryBrush(theme);

        _waitingStatusTb = new TextBlock { Text = "⠋ 等待回应中…", FontSize = 10, Foreground = secondary, Opacity = 0.4, Margin = new Thickness(0, 2, 0, 0) };
        _msgStack!.Children.Add(_waitingStatusTb);
        AutoScroll();

        var primary = GetPrimaryBrush(theme);

        var parts = new List<ContentPart>
        {
            new("input_audio", new() { ["data"] = $"data:audio/wav;base64,{Convert.ToBase64String(wav)}" })
        };
        if (!string.IsNullOrWhiteSpace(transcription))
            parts.Add(new("text", new() { ["text"] = transcription }));

        StartSpinner();
        _ = _service.SendWithParts(parts,
            onThinking: d => _dispatcher.TryEnqueue(() => OnThinkingDelta(d, primary, secondary)),
            onContent: d => _dispatcher.TryEnqueue(() => OnContentDelta(d, primary, secondary)),
            onToolStart: (name, _) => _dispatcher.TryEnqueue(() => OnToolStartDelta(name, primary, secondary)),
            onToolResult: (name, _) => _dispatcher.TryEnqueue(() => OnToolDoneDelta(name, primary, secondary)),
            onError: err => _dispatcher.TryEnqueue(() =>
            {
                if (_msgStack != null)
                {
                    var errBlock = new Border
                    {
                        CornerRadius = new CornerRadius(8), Padding = new Thickness(10, 6, 10, 6),
                        Margin = new Thickness(0, 4, 48, 4), HorizontalAlignment = HorizontalAlignment.Left,
                        Background = new SolidColorBrush(Color.FromArgb(0x1A, 0xE0, 0x3A, 0x3A)),
                        Child = new TextBlock { Text = err, FontSize = 13, Foreground = new SolidColorBrush(Color.FromArgb(0xFF, 0xE0, 0x3A, 0x3A)), TextWrapping = TextWrapping.Wrap }
                    };
                    _msgStack.Children.Add(errBlock);
                    AutoScroll();
                }
            })).ContinueWith(t =>
            {
                if (t.IsFaulted) LogService.Warn($"[AgentSession] SendWithParts failed: {t.Exception}");
            }, TaskContinuationOptions.OnlyOnFaulted);
    }

    public async Task Send(string input, FrameworkElement source)
    {
        if (_service.IsBusy) { LogService.Info("[AgentSession.Send] blocked, service busy"); return; }
        LogService.Info($"[AgentSession.Send] entry bubble={_bubble!=null} spinnerRunning={_spinnerRunning} expand={Expand}");

        var theme = source.ActualTheme;
        var primary = GetPrimaryBrush(theme);
        var secondary = GetSecondaryBrush(theme);

        EnsureBubble(source, primary, secondary);

        var userBubble = new Border
        {
            CornerRadius = new CornerRadius(8),
            Padding = new Thickness(10, 6, 10, 6),
            Margin = new Thickness(48, 4, 0, 4),
            HorizontalAlignment = HorizontalAlignment.Right,
            Background = new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x66, 0xCC)),
            Child = new TextBlock { Text = input, FontSize = 13, Foreground = new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF)), TextWrapping = TextWrapping.Wrap }
        };
        _msgStack!.Children.Add(userBubble);
        _waitingStatusTb = new TextBlock { Text = "⠋ 等待回应中…", FontSize = 11, Foreground = secondary, Opacity = 0.5, Margin = new Thickness(0, 2, 0, 0) };
        _msgStack.Children.Add(_waitingStatusTb);
        AutoScroll();

        if (_curBlocks.Count > 0)
            _allSubTurnBlocks.Add(new List<BlockInfo>(_curBlocks));
        _curBlocks.Clear();
        _curBlock = null;
        _renderPending = false;
        _pendingBi = null;
        _renderThrottleTimer?.Stop();
        _thinkingActive = false;
        _toolActive = false;
        _curThinkingPh = null;
        _curToolPh = null;

        StartSpinner();
        await _service.SendAsync(
            input,
            onThinking: d => _dispatcher.TryEnqueue(() => { try { LogService.Info($"[AgentSession] onThinking delta len={d.Length}"); OnThinkingDelta(d, primary, secondary); } catch (Exception ex) { LogService.Error(ex, "[AgentSession] onThinking crash"); } }),
            onContent: d => _dispatcher.TryEnqueue(() => { try { LogService.Info($"[AgentSession] onContent delta len={d.Length}"); OnContentDelta(d, primary, secondary); } catch (Exception ex) { LogService.Error(ex, "[AgentSession] onContent crash"); } }),
            onToolStart: (name, _) => _dispatcher.TryEnqueue(() => { try { LogService.Info($"[AgentSession] onToolStart name={name}"); OnToolStartDelta(name, primary, secondary); } catch (Exception ex) { LogService.Error(ex, "[AgentSession] onToolStart crash"); } }),
            onToolResult: (name, _) => _dispatcher.TryEnqueue(() => { try { LogService.Info($"[AgentSession] onToolResult name={name}"); OnToolDoneDelta(name, primary, secondary); } catch (Exception ex) { LogService.Error(ex, "[AgentSession] onToolResult crash"); } }),
            onError: err => _dispatcher.TryEnqueue(() =>
            {
                if (_msgStack != null)
                {
                    var errBlock = new Border
                    {
                        CornerRadius = new CornerRadius(8), Padding = new Thickness(10, 6, 10, 6),
                        Margin = new Thickness(0, 4, 48, 4), HorizontalAlignment = HorizontalAlignment.Left,
                        Background = new SolidColorBrush(Color.FromArgb(0x1A, 0xE0, 0x3A, 0x3A)),
                        Child = new TextBlock { Text = err, FontSize = 13, Foreground = new SolidColorBrush(Color.FromArgb(0xFF, 0xE0, 0x3A, 0x3A)), TextWrapping = TextWrapping.Wrap }
                    };
                    _msgStack.Children.Add(errBlock);
                    AutoScroll();
                }
            }));
        _dispatcher.TryEnqueue(() => { _thinkingActive = false; _toolActive = false; TryStopSpinner(); if (_curBlock != null) _curBlock.Background = null; });
    }

    // ── Block management ──────────────────────────────────────────

    BlockInfo EnsureBlock(BlockType type, Brush primary, Brush secondary)
    {
        if (_curBlocks.Count > 0 && _curBlocks[^1].Type == type)
            return _curBlocks[^1];

        LogService.Info($"[AgentSession] EnsureBlock new type={type} after cur={_curBlocks.Count}");
        DiscardEmptyBlock();
        CloseLastBlock();
        return type switch
        {
            BlockType.Thinking => CreateThinkingBlock(primary, secondary),
            BlockType.Tool => CreateToolBlock(primary, secondary),
            BlockType.Output => CreateOutputBlock(primary, secondary),
            _ => throw new ArgumentOutOfRangeException(nameof(type))
        };
    }

    void DiscardEmptyBlock()
    {
        if (_curBlocks.Count == 0 || _curBlock == null) return;
        var bi = _curBlocks[^1];
        if (bi.Text.Length == 0 && bi.Container != null)
        {
            _curBlock.Children.Remove(bi.Container);
            if (bi.CollapsedPh != null) _curBlock.Children.Remove(bi.CollapsedPh);
            _curBlocks.RemoveAt(_curBlocks.Count - 1);
        }
    }

    void CloseLastBlock()
    {
        if (_renderPending && _pendingBi != null && _curBlocks.Count > 0 && _pendingBi == _curBlocks[^1])
        {
            _renderThrottleTimer?.Stop();
            _renderPending = false;
            RenderBlock(_pendingBi);
        }

        if (_curBlocks.Count == 0) return;
        var bi = _curBlocks[^1];
        _thinkingActive = false;
        _toolActive = false;
        _curThinkingPh = null;
        _curToolPh = null;
        TryStopSpinner();

        if (bi.Type == BlockType.Thinking && bi.Text.Length > 0 && bi.CollapsedPh != null)
            bi.CollapsedPh.Text = "思考完毕";
        else if (bi.Type == BlockType.Tool && bi.CollapsedPh != null)
            bi.CollapsedPh.Text = "已调用工具";

        LogService.Info($"[AgentSession] CloseLastBlock type={bi.Type} textLen={bi.Text.Length}");
    }

    void EnsureCurBlock(Brush primary, Brush secondary)
    {
        if (_curBlock != null) return;
        if (_waitingStatusTb != null) { _msgStack!.Children.Remove(_waitingStatusTb); _waitingStatusTb = null; }
        _curBlock = new StackPanel { Spacing = 4, Margin = new Thickness(0, 4, 48, 4), HorizontalAlignment = HorizontalAlignment.Stretch };
        _msgStack!.Children.Add(_curBlock);
        AutoScroll();
    }

    BlockInfo CreateThinkingBlock(Brush primary, Brush secondary)
    {
        EnsureCurBlock(primary, secondary);

        var tb = new TextBlock { FontSize = 11, Foreground = secondary, Opacity = 0.6, TextWrapping = TextWrapping.Wrap };
        var sv = new ScrollViewer
        {
            Content = tb,
            MaxHeight = Expand ? double.PositiveInfinity : 72,
            VerticalScrollBarVisibility = ScrollBarVisibility.Disabled,
            HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled,
            HorizontalAlignment = HorizontalAlignment.Stretch,
            Visibility = Expand ? Visibility.Visible : Visibility.Collapsed,
            Opacity = 0.6
        };
        _curBlock.Children.Add(sv);

        var ph = new TextBlock { Text = "思考中...", FontSize = 10, Opacity = 0.4, Foreground = secondary, Visibility = Expand ? Visibility.Collapsed : Visibility.Visible };
        _curBlock.Children.Add(ph);

        var bi = new BlockInfo { Type = BlockType.Thinking, Container = sv, CollapsedPh = ph, PrimaryBrush = primary, SecondaryBrush = secondary };
        _curBlocks.Add(bi);
        _curThinkingPh = ph;
        return bi;
    }

    BlockInfo CreateToolBlock(Brush primary, Brush secondary)
    {
        EnsureCurBlock(primary, secondary);

        var toolForeground = new SolidColorBrush(Color.FromArgb(0xFF, 0x62, 0xA0, 0xE0));
        var toolTb = new TextBlock { FontSize = 11, Foreground = toolForeground, Opacity = 0.6, Visibility = Expand ? Visibility.Visible : Visibility.Collapsed };
        _curBlock.Children.Add(toolTb);

        var ph = new TextBlock { Text = "调用工具...", FontSize = 10, Opacity = 0.4, Foreground = new SolidColorBrush(Color.FromArgb(0x60, 0x62, 0xA0, 0xE0)), Visibility = Expand ? Visibility.Collapsed : Visibility.Visible };
        _curBlock.Children.Add(ph);

        var bi = new BlockInfo { Type = BlockType.Tool, Container = toolTb, CollapsedPh = ph, PrimaryBrush = toolForeground, SecondaryBrush = toolForeground };
        _curBlocks.Add(bi);
        _curToolPh = ph;
        return bi;
    }

    BlockInfo CreateOutputBlock(Brush primary, Brush secondary)
    {
        EnsureCurBlock(primary, secondary);

        var tb = new TextBlock { FontSize = 13, Foreground = primary, TextWrapping = TextWrapping.Wrap };
        var host = new Grid();
        host.Children.Add(tb);
        var sv = new ScrollViewer
        {
            Content = host,
            VerticalScrollBarVisibility = ScrollBarVisibility.Disabled,
            HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled,
            HorizontalAlignment = HorizontalAlignment.Stretch
        };
        _curBlock.Children.Add(sv);

        var bi = new BlockInfo { Type = BlockType.Output, Container = sv, PrimaryBrush = primary, SecondaryBrush = secondary };
        _curBlocks.Add(bi);
        return bi;
    }

    // ── Delta handlers ────────────────────────────────────────────

    void OnThinkingDelta(string delta, Brush primary, Brush secondary)
    {
        var bi = EnsureBlock(BlockType.Thinking, primary, secondary);
        _thinkingActive = true;
        _toolActive = false;
        StartSpinner();
        bi.Text.Append(delta);

        var sv = (ScrollViewer)bi.Container;
        if (Expand)
        {
            sv.Visibility = Visibility.Visible;
            if (bi.CollapsedPh != null) bi.CollapsedPh.Visibility = Visibility.Collapsed;

            if (!_renderPending)
            {
                _renderPending = true;
                _pendingBi = bi;
                _renderThrottleTimer?.Start();
            }
        }
        else
        {
            sv.Visibility = Visibility.Collapsed;
            if (bi.CollapsedPh != null) { bi.CollapsedPh.Visibility = Visibility.Visible; }
        }
    }

    void OnContentDelta(string delta, Brush primary, Brush secondary)
    {
        var bi = EnsureBlock(BlockType.Output, primary, secondary);
        _thinkingActive = false;
        _toolActive = false;
        TryStopSpinner();
        bi.Text.Append(delta);

        if (!_renderPending)
        {
            _renderPending = true;
            _pendingBi = bi;
            _renderThrottleTimer?.Start();
        }
    }

    void RenderBlock(BlockInfo bi)
    {
        if (bi.Type == BlockType.Thinking)
        {
            var sv = (ScrollViewer)bi.Container;
            try
            {
                var rendered = MarkdownRenderer.Render(bi.Text.ToString(), bi.SecondaryBrush, bi.SecondaryBrush, 11);
                sv.Content = rendered;
            }
            catch { }
            _dispatcher.TryEnqueue(() => { sv.ChangeView(null, double.MaxValue, null); });
        }
        else if (bi.Type == BlockType.Output)
        {
            var sv = (ScrollViewer)bi.Container;
            var host = (Grid)sv.Content;
            try
            {
                UIElement rendered = bi.Text.Length == 0
                    ? new TextBlock { Text = bi.Text.ToString(), FontSize = 13, Foreground = bi.PrimaryBrush, TextWrapping = TextWrapping.Wrap }
                    : MarkdownRenderer.Render(bi.Text.ToString(), bi.PrimaryBrush, bi.SecondaryBrush);
                host.Children.Clear();
                host.Children.Add(rendered);
            }
            catch
            {
                host.Children.Clear();
                host.Children.Add(new TextBlock { Text = bi.Text.ToString(), FontSize = 13, Foreground = bi.PrimaryBrush, TextWrapping = TextWrapping.Wrap });
            }
            _dispatcher.TryEnqueue(() => { sv.ChangeView(null, double.MaxValue, null); });
        }
        AutoScroll();
    }

    void OnToolStartDelta(string name, Brush primary, Brush secondary)
    {
        CloseLastBlock();
        var bi = CreateToolBlock(primary, secondary);
        _thinkingActive = false;
        _toolActive = true;
        StartSpinner();

        if (bi.Container is TextBlock toolTb)
            toolTb.Text = "调用: " + name;

        if (Expand)
        {
            bi.Container.Visibility = Visibility.Visible;
            if (bi.CollapsedPh != null) bi.CollapsedPh.Visibility = Visibility.Collapsed;
        }
        else
        {
            bi.Container.Visibility = Visibility.Collapsed;
            if (bi.CollapsedPh != null) { bi.CollapsedPh.Visibility = Visibility.Visible; }
        }
        AutoScroll();
    }

    void OnToolDoneDelta(string name, Brush primary, Brush secondary)
    {
        _toolActive = false;
        _curToolPh = null;
        if (_curBlocks.Count == 0) return;
        var bi = _curBlocks[^1];
        if (bi.Type != BlockType.Tool) return;
        bi.Text.Clear();
        bi.Text.Append(name);
        if (!Expand && bi.CollapsedPh != null)
            bi.CollapsedPh.Text = "已调用工具";
    }

    // ── Expand / collapse ─────────────────────────────────────────

    bool Expand => _service.ExpandCot;

    void ApplyExpandMode()
    {
        var expand = Expand;
        LogService.Info($"[AgentSession] ApplyExpandMode allGroups={_allSubTurnBlocks.Count} curBlocks={_curBlocks.Count} expand={expand}");
        try
        {
            foreach (var group in _allSubTurnBlocks)
                foreach (var b in group)
                    ApplyOne(b, expand);
            foreach (var b in _curBlocks)
                ApplyOne(b, expand);
        }
        catch (Exception ex) { LogService.Error(ex, "[AgentSession] ApplyExpandMode crash"); }
    }

    void ApplyOne(BlockInfo b, bool expand)
    {
        if (b.Type == BlockType.Output) return;
        if (b.Container is ScrollViewer sv)
        {
            sv.MaxHeight = expand ? double.PositiveInfinity : (b.Type == BlockType.Thinking ? 72 : 36);
            if (expand && b.Type == BlockType.Thinking && sv.Content is TextBlock && b.Text.Length > 0)
            {
                try { sv.Content = MarkdownRenderer.Render(b.Text.ToString(), b.PrimaryBrush, b.SecondaryBrush, 11); }
                catch { }
            }
        }
        b.Container.Visibility = expand ? Visibility.Visible : Visibility.Collapsed;
        if (b.CollapsedPh != null)
            b.CollapsedPh.Visibility = expand ? Visibility.Collapsed : Visibility.Visible;
    }

    // ── Bubble ────────────────────────────────────────────────────

    void EnsureBubble(FrameworkElement source, Brush primary, Brush secondary)
    {
        if (_bubble != null) return;

        var tint = source.ActualTheme == ElementTheme.Light
            ? Color.FromArgb(0xFF, 0xF3, 0xF3, 0xF3)
            : Color.FromArgb(0xFF, 0x2B, 0x2B, 0x2B);

        _msgStack = new StackPanel { Spacing = 2 };

        _scrollViewer = new ScrollViewer
        {
            Content = _msgStack,
            VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
            HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled,
            MaxHeight = 360
        };
        Grid.SetRow(_scrollViewer, 1);

        var closeBtn = new Button
        {
            Content = new FontIcon { Glyph = "\uE711", FontSize = 10 },
            Background = new SolidColorBrush(Color.FromArgb(0, 0, 0, 0)),
            BorderThickness = new Thickness(0),
            Width = 24, Height = 24, Padding = new Thickness(0),
            HorizontalAlignment = HorizontalAlignment.Right
        };
        closeBtn.Click += (_, _) => CloseBubble();
        Grid.SetRow(closeBtn, 0);

        var bubbleContent = new Grid();
        bubbleContent.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        bubbleContent.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
        bubbleContent.Children.Add(_scrollViewer);
        bubbleContent.Children.Add(closeBtn);

        _bubble = new Border
        {
            Background = new AcrylicBrush { TintColor = tint, TintOpacity = 0.9, FallbackColor = tint },
            CornerRadius = new CornerRadius(10),
            Padding = new Thickness(14, 10, 14, 14),
            MaxWidth = 480,
            HorizontalAlignment = HorizontalAlignment.Right,
            VerticalAlignment = VerticalAlignment.Bottom,
            Margin = new Thickness(0, 0, 16, 56),
            Child = bubbleContent
        };

        _parentGrid.Children.Add(_bubble);
    }

    void AutoScroll()
    {
        if (_scrollViewer == null) return;
        _scrollViewer.DispatcherQueue.TryEnqueue(() =>
        {
            _scrollViewer.ChangeView(null, double.MaxValue, null);
        });
    }

    public void CloseBubble()
    {
        if (_bubble != null) { _parentGrid.Children.Remove(_bubble); _bubble = null; }
        _scrollViewer = null; _msgStack = null;
        _curBlock = null;
        _curBlocks.Clear();
        _allSubTurnBlocks.Clear();
        _curThinkingPh = null;
        _curToolPh = null;
        _renderPending = false;
        _pendingBi = null;
        _renderThrottleTimer?.Stop();
    }

    public bool IsOpen => _bubble != null;
}
