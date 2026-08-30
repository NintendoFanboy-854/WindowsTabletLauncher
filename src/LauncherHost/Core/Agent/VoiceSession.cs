using System.Diagnostics;
using System.Text;
using Microsoft.UI.Dispatching;
using LauncherHost.Services;

namespace LauncherHost.Core.Agent;

public enum VoiceState { Idle, Recording, Sending }

public sealed class VoiceSession : IDisposable
{
    readonly VoiceRecorder _recorder;
    readonly AgentService _agentService;
    readonly AgentSession _agentSession;
    readonly DispatcherQueue _dispatcher;
    readonly object _textLock = new();
    VoiceState _state = VoiceState.Idle;
    Stopwatch? _recordingSw;
    DispatcherQueueTimer? _recordingTimer;
    AgentSession.AudioBubbleRefs? _bubbleRefs;
    CancellationTokenSource? _transcribeCts;

    void FlushTranscription(StringBuilder fullText, AgentSession.AudioBubbleRefs refs)
    {
        string current;
        lock (_textLock)
        {
            current = fullText.ToString();
        }
        _dispatcher.TryEnqueue(() =>
        {
            refs.TransTb.Text = current;
        });
    }

    public event Action<VoiceState>? OnStateChanged;

    public VoiceState State => _state;

    public VoiceSession(AgentService agentService, DispatcherQueue dispatcher, AgentSession agentSession)
    {
        _agentService = agentService;
        _agentSession = agentSession;
        _dispatcher = dispatcher;
        _recorder = new VoiceRecorder();
    }

    bool _toggling;

    public async void Toggle()
    {
        if (_toggling) { LogService.Info("[VoiceSession] Toggle → ignored (in progress)"); return; }
        _toggling = true;
        try
        {
            if (_state == VoiceState.Idle)
            {
                LogService.Info("[VoiceSession] Toggle → starting recorder");
                _bubbleRefs = _agentSession.CreateRecordingBubble();
                if (_bubbleRefs == null) { _toggling = false; return; }

                _recordingSw = Stopwatch.StartNew();
                _recordingTimer = _dispatcher.CreateTimer();
                _recordingTimer.Interval = TimeSpan.FromSeconds(1);
                _recordingTimer.Tick += (_, _) =>
                {
                    var elapsed = _recordingSw?.Elapsed ?? TimeSpan.Zero;
                    if (_bubbleRefs != null)
                        _bubbleRefs.DurText.Text = $"{(int)elapsed.TotalMinutes}:{elapsed.Seconds:D2}";
                };
                _recordingTimer.Start();

                var ok = await _recorder.StartAsync();
                if (!ok)
                {
                    LogService.Warn("[VoiceSession] Toggle → start failed, back to Idle");
                    _recordingTimer?.Stop();
                    SetState(VoiceState.Idle);
                    return;
                }
                SetState(VoiceState.Recording);
            }
            else if (_state == VoiceState.Recording)
            {
                _recordingTimer?.Stop();
                _recordingSw?.Stop();
                var dur = _recordingSw?.Elapsed ?? TimeSpan.Zero;
                LogService.Info($"[VoiceSession] Toggle → stopping, dur={(int)dur.TotalSeconds}s");
                SetState(VoiceState.Sending);
                await ProcessRecordingAsync(dur);
            }
            else
            {
                LogService.Info($"[VoiceSession] Toggle → ignored (state={_state})");
            }
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[VoiceSession] Toggle crashed");
            try { _recordingTimer?.Stop(); } catch { }
            SetState(VoiceState.Idle);
        }
        finally { _toggling = false; }
    }

    async Task ProcessRecordingAsync(TimeSpan duration)
    {
        // 快照：转录回调只作用于本次录音的气泡，避免新一轮录音覆盖引用
        var refs = _bubbleRefs;
        try
        {
            LogService.Info("[VoiceSession] ProcessRecording start");
            var wav = await _recorder.StopAsync();
            LogService.Info($"[VoiceSession] StopAsync done, wav={wav.Length}bytes");
            if (wav.Length == 0)
            {
                LogService.Warn("[VoiceSession] wav empty, skipping");
                _dispatcher.TryEnqueue(() =>
                {
                    if (refs != null) refs.TransTb.Text = "[录音为空]";
                    SetState(VoiceState.Idle);
                });
                return;
            }

            if (refs != null)
                _agentSession.FinalizeAudioBubble(refs, wav, duration);
            SetState(VoiceState.Idle);

            _agentSession.SendAudioToLlm(wav, "");

            _ = Task.Run(async () =>
            {
                try
                {
                    var apiKey = _agentService.MimoApiKey;
                    if (string.IsNullOrWhiteSpace(apiKey))
                    {
                        _dispatcher.TryEnqueue(() =>
                        {
                            if (refs != null) refs.TransTb.Text = "[未配置语音识别 Key]";
                            _agentService.History.ReplaceLastUserAudio("[语音输入]");
                        });
                        return;
                    }

                    var fullText = new StringBuilder();
                    var lastFlush = DateTime.UtcNow;
                    var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
                    _transcribeCts = cts;
                    try
                    {
                        await ChatClient.TranscribeStreamAsync(apiKey, wav, delta =>
                        {
                            lock (_textLock) fullText.Append(delta);
                            var now = DateTime.UtcNow;
                            if ((now - lastFlush).TotalMilliseconds < 250) return;
                            lastFlush = now;
                            FlushTranscription(fullText, refs!);
                        }, cts.Token);
                    }
                    finally
                    {
                        if (ReferenceEquals(_transcribeCts, cts)) _transcribeCts = null;
                        cts.Dispose();
                    }

                    string result;
                    lock (_textLock) result = fullText.ToString();
                    result = result.Trim();
                    LogService.Info($"[VoiceSession] ASR stream done, len={result.Length}");
                    if (result.Length > 0)
                    {
                        _dispatcher.TryEnqueue(() =>
                        {
                            refs?.TransTb.Text = result;
                            _agentService.History.ReplaceLastUserAudio(result);
                        });
                    }
                    else
                    {
                        _dispatcher.TryEnqueue(() =>
                        {
                            if (refs != null) refs.TransTb.Text = "[转录失败]";
                            _agentService.History.ReplaceLastUserAudio("[语音输入]");
                        });
                    }
                }
                catch (Exception ex)
                {
                    LogService.Error(ex, "[VoiceSession] ASR task error");
                    _dispatcher.TryEnqueue(() =>
                    {
                        if (refs != null) refs.TransTb.Text = "[转录失败]";
                    });
                }
            });
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[VoiceSession] ProcessRecording error");
            _dispatcher.TryEnqueue(() => SetState(VoiceState.Idle));
        }
    }

    void SetState(VoiceState state)
    {
        if (_state == state) return;
        _state = state;
        LogService.Info($"[VoiceSession] state: {state}");
        OnStateChanged?.Invoke(state);
    }

    public void Dispose()
    {
        try { _transcribeCts?.Cancel(); } catch { }
        _recordingTimer?.Stop();
        _recorder.Dispose();
    }
}
