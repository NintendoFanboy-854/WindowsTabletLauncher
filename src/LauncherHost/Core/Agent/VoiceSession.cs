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

    public async void Toggle()
    {
        if (_state == VoiceState.Idle)
        {
            LogService.Info("[VoiceSession] Toggle → starting recorder");
            var ok = await _recorder.StartAsync();
            if (!ok)
            {
                LogService.Warn("[VoiceSession] Toggle → start failed, back to Idle");
                SetState(VoiceState.Idle);
                return;
            }
            _recordingSw = Stopwatch.StartNew();
            SetState(VoiceState.Recording);
        }
        else if (_state == VoiceState.Recording)
        {
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

        LogService.Info("[VoiceSession] enqueuing CreateAudioBubble");
        _dispatcher.TryEnqueue(() =>
        {
            var tb = _agentSession.CreateAudioBubble(wav, "转录中…", duration);
            if (tb == null) return;
            SetState(VoiceState.Idle);

            _agentSession.SendAudioToLlm(wav, "");

            _ = Task.Run(async () =>
            {
                var apiKey = _agentService.MimoApiKey;
                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    _dispatcher.TryEnqueue(() => tb.Text = "MiMo API Key 未设置");
                    return;
                }
                var fullText = new StringBuilder();
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                await ChatClient.TranscribeStreamAsync(apiKey, wav, delta =>
                {
                    fullText.Append(delta);
                    _dispatcher.TryEnqueue(() => tb.Text = fullText.ToString());
                }, cts.Token);
                LogService.Info($"[VoiceSession] ASR stream done, len={fullText.Length}");
                var result = fullText.ToString();
                if (!string.IsNullOrWhiteSpace(result))
                    _dispatcher.TryEnqueue(() => _agentService.History.ReplaceLastUserAudio(result));
            });
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
        _recorder.Dispose();
    }
}
