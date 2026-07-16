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
    Stopwatch? _recordingSw;
    DispatcherQueueTimer? _recordingTimer;
    AgentSession.AudioBubbleRefs? _bubbleRefs;

    VoiceState _state = VoiceState.Idle;

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
        finally { _toggling = false; }
    }

    async Task ProcessRecordingAsync(TimeSpan duration)
    {
        try
        {
            LogService.Info("[VoiceSession] ProcessRecording start");
            var wav = await _recorder.StopAsync();
            LogService.Info($"[VoiceSession] StopAsync done, wav={wav.Length}bytes");
            if (wav.Length == 0)
            {
                LogService.Warn("[VoiceSession] wav empty, skipping");
                _dispatcher.TryEnqueue(() => SetState(VoiceState.Idle));
                return;
            }

            if (_bubbleRefs != null)
                _agentSession.FinalizeAudioBubble(_bubbleRefs, wav, duration);
            SetState(VoiceState.Idle);

            _agentSession.SendAudioToLlm(wav, "");

            _ = Task.Run(async () =>
            {
                var apiKey = _agentService.MimoApiKey;
                if (!string.IsNullOrWhiteSpace(apiKey))
                {
                    var fullText = new StringBuilder();
                    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                    await ChatClient.TranscribeStreamAsync(apiKey, wav, delta =>
                    {
                        fullText.Append(delta);
                        _dispatcher.TryEnqueue(() =>
                        {
                            if (_bubbleRefs != null)
                                _bubbleRefs.TransTb.Text = fullText.ToString();
                        });
                    }, cts.Token);
                    var result = fullText.ToString();
                    LogService.Info($"[VoiceSession] ASR stream done, len={result.Length}");
                    if (!string.IsNullOrWhiteSpace(result))
                        _dispatcher.TryEnqueue(() => _agentService.History.ReplaceLastUserAudio(result));
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
        _recordingTimer?.Stop();
        _recorder.Dispose();
    }
}
