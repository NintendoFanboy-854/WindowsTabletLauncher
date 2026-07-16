using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Windows.Media.Core;
using Windows.Media.Playback;
using Windows.Storage.Streams;
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
    public string Text = "";
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
    bool _thinkingActive;
    bool _toolActive;
    static readonly SolidColorBrush RetryTint = new(Color.FromArgb(0x12, 0x40, 0x90, 0xFF));

    DispatcherQueueTimer? _spinnerTimer;
    int _spinnerIdx;
    int _tickCount;
    bool _spinnerRunning;

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
            if (_tickCount % 25 == 0)
                LogService.Info($"[AgentSession] spinner tick #{_tickCount}");
            if (_thinkingActive && _curThinkingPh != null && _curThinkingPh.Visibility == Visibility.Visible)
                _curThinkingPh.Text = frame + " 思考中...";
            if (_toolActive && _curToolPh != null && _curToolPh.Visibility == Visibility.Visible)
                _curToolPh.Text = frame + " 调用工具...";
        };
        _spinnerTimer.Start();
        _spinnerRunning = true;
        _service.ExpandCotChanged += ApplyExpandMode;
        _service.OnAgentRetry += () => _dispatcher.TryEnqueue(() => { if (_curBlock != null) _curBlock.Background = RetryTint; });
        _service.OnAgentRetryExhausted += () => _dispatcher.TryEnqueue(() => { if (_curBlock != null) _curBlock.Background = null; });
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
        var primary = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A))
            : new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF));
        var secondary = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0x99, 0, 0, 0))
            : new SolidColorBrush(Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF));
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
            VerticalAlignment = VerticalAlignment.Center
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

        var theme = _parentGrid.ActualTheme;
        var primary = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A))
            : new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF));
        var secondary = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0x99, 0, 0, 0))
            : new SolidColorBrush(Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF));

        var parts = new List<ContentPart>
        {
            new("input_audio", new() { ["data"] = $"data:audio/wav;base64,{Convert.ToBase64String(wav)}" })
        };
        if (!string.IsNullOrWhiteSpace(transcription))
            parts.Add(new("text", new() { ["text"] = transcription }));

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
            }));
    }

    public async void Send(string input, FrameworkElement source)
    {
        if (_service.IsBusy) return;
        LogService.Info($"[AgentSession.Send] entry bubble={_bubble!=null} spinnerRunning={_spinnerRunning} expand={Expand}");

        var theme = source.ActualTheme;
        var primary = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A))
            : new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF));
        var secondary = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0x99, 0, 0, 0))
            : new SolidColorBrush(Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF));

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

        if (_curBlocks.Count > 0)
            _allSubTurnBlocks.Add(new List<BlockInfo>(_curBlocks));
        _curBlocks.Clear();
        _curBlock = null;
        _thinkingActive = false;
        _toolActive = false;
        _curThinkingPh = null;
        _curToolPh = null;

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
        _dispatcher.TryEnqueue(() => { _thinkingActive = false; _toolActive = false; if (_curBlock != null) _curBlock.Background = null; });
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
        if (_curBlocks.Count == 0) return;
        var bi = _curBlocks[^1];
        _thinkingActive = false;
        _toolActive = false;
        _curThinkingPh = null;
        _curToolPh = null;

        if (bi.Type == BlockType.Thinking && !string.IsNullOrEmpty(bi.Text) && bi.CollapsedPh != null)
            bi.CollapsedPh.Text = "思考完毕";
        else if (bi.Type == BlockType.Tool && bi.CollapsedPh != null)
            bi.CollapsedPh.Text = "已调用工具";

        LogService.Info($"[AgentSession] CloseLastBlock type={bi.Type} textLen={bi.Text.Length}");
    }

    void EnsureCurBlock(Brush primary, Brush secondary)
    {
        if (_curBlock != null) return;
        _curBlock = new StackPanel { Spacing = 4, Margin = new Thickness(0, 4, 48, 4), HorizontalAlignment = HorizontalAlignment.Stretch };
        _msgStack!.Children.Add(_curBlock);
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
        bi.Text += delta;

        var sv = (ScrollViewer)bi.Container;
        if (Expand)
        {
            sv.Visibility = Visibility.Visible;
            if (bi.CollapsedPh != null) bi.CollapsedPh.Visibility = Visibility.Collapsed;
            try
            {
                var rendered = MarkdownRenderer.Render(bi.Text, secondary, secondary, 11);
                sv.Content = rendered;
            }
            catch { }
            _dispatcher.TryEnqueue(() => { sv.UpdateLayout(); sv.ChangeView(null, double.MaxValue, null); });
        }
        else
        {
            sv.Visibility = Visibility.Collapsed;
            if (bi.CollapsedPh != null) { bi.CollapsedPh.Visibility = Visibility.Visible; }
        }
        AutoScroll();
    }

    void OnContentDelta(string delta, Brush primary, Brush secondary)
    {
        var bi = EnsureBlock(BlockType.Output, primary, secondary);
        _thinkingActive = false;
        _toolActive = false;
        bi.Text += delta;

        var host = (Grid)((ScrollViewer)bi.Container).Content;
        try
        {
            UIElement rendered = string.IsNullOrEmpty(bi.Text)
                ? new TextBlock { Text = bi.Text, FontSize = 13, Foreground = primary, TextWrapping = TextWrapping.Wrap }
                : MarkdownRenderer.Render(bi.Text, primary, secondary);
            host.Children.Clear();
            host.Children.Add(rendered);
        }
        catch
        {
            host.Children.Clear();
            host.Children.Add(new TextBlock { Text = bi.Text, FontSize = 13, Foreground = primary, TextWrapping = TextWrapping.Wrap });
        }
        if (bi.Container is ScrollViewer sv)
            _dispatcher.TryEnqueue(() => { sv.UpdateLayout(); sv.ChangeView(null, double.MaxValue, null); });
        AutoScroll();
    }

    void OnToolStartDelta(string name, Brush primary, Brush secondary)
    {
        CloseLastBlock();
        var bi = CreateToolBlock(primary, secondary);
        _thinkingActive = false;
        _toolActive = true;

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
        bi.Text = name;
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
                try { sv.Content = MarkdownRenderer.Render(b.Text, b.PrimaryBrush, b.SecondaryBrush, 11); }
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
            _scrollViewer.UpdateLayout();
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
    }

    public bool IsOpen => _bubble != null;
}
