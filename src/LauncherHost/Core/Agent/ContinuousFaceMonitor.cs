/*
using Microsoft.UI.Dispatching;
using Windows.Media;
using Windows.Media.Capture;
using Windows.Graphics.Imaging;
using LauncherHost.Services;

namespace LauncherHost.Core.Agent;

public sealed class ContinuousFaceMonitor : IDisposable
{
    readonly FaceAuthService _faceAuth;
    readonly AgentService _agentService;
    readonly AgentSession _agentSession;
    readonly DispatcherQueue _dispatcher;

    MediaCapture? _capture;
    VoiceRecorder? _voiceRecorder;
    DispatcherQueueTimer? _timer;
    int _noFaceSeq;
    int _hitSeq;
    int _silenceThresh = 5;
    int _captureIntervalSec = 2;
    string? _apiKey;
    bool _listening;
    bool _active;

    public event Action<bool>? ListeningStateChanged;

    public ContinuousFaceMonitor(FaceAuthService faceAuth, AgentService agentService, AgentSession agentSession)
    {
        _faceAuth = faceAuth;
        _agentService = agentService;
        _agentSession = agentSession;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
    }

    public async Task StartAsync(int silenceFrames, int captureIntervalSec, string apiKey)
    {
        _silenceThresh = silenceFrames;
        _captureIntervalSec = Math.Clamp(captureIntervalSec, 1, 10);
        _apiKey = apiKey;

        try
        {
            _capture = new MediaCapture();
            var settings = new MediaCaptureInitializationSettings
            {
                StreamingCaptureMode = StreamingCaptureMode.Video,
                SharingMode = MediaCaptureSharingMode.SharedReadOnly,
                MemoryPreference = MediaCaptureMemoryPreference.Cpu
            };
            await _capture.InitializeAsync(settings);
            await _capture.StartPreviewAsync();  // enables GetPreviewFrameAsync

            _active = true;

            _timer = _dispatcher.CreateTimer();
            _timer.Interval = TimeSpan.FromSeconds(_captureIntervalSec);
            _timer.IsRepeating = true;
            _timer.Tick += OnTimerTick;
            _timer.Start();

            LogService.Info($"[FaceMonitor] started (polling every {_captureIntervalSec}s, silence={_silenceThresh} frames)");
        }
        catch (Exception ex)
        {
            LogService.Error($"[FaceMonitor] start failed: {ex.Message}");
            Stop();
        }
    }

    async void OnTimerTick(object? sender, object e)
    {
        if (!_active || _capture == null) return;

        try
        {
            var videoFrame = new VideoFrame(BitmapPixelFormat.Gray8, 320, 240);
            await _capture.GetPreviewFrameAsync(videoFrame);
            var bmp = videoFrame.SoftwareBitmap;
            if (bmp == null) return;

            var name = await _faceAuth.ProcessFrameAsync(bmp);
            bmp.Dispose();

            if (string.IsNullOrEmpty(name))
            {
                _noFaceSeq++;
                _hitSeq = 0;
            }
            else
            {
                _noFaceSeq = 0;
                _hitSeq++;
            }

            if (!_listening && _hitSeq >= 3)
            {
                _listening = true;
                SetListening(true);
                LogService.Info($"[FaceMonitor] face '{name}' detected, starting recording");
                await StartRecording();
            }

            if (_listening && _noFaceSeq >= _silenceThresh)
            {
                _listening = false;
                SetListening(false);
                LogService.Info($"[FaceMonitor] face lost for {_silenceThresh} frames, stopping");
                await StopRecordingAndSend();
            }
        }
        catch (Exception ex)
        {
            LogService.Error($"[FaceMonitor] tick error: {ex.Message}");
        }
    }

    void SetListening(bool state)
    {
        _dispatcher.TryEnqueue(() => ListeningStateChanged?.Invoke(state));
    }

    async Task StartRecording()
    {
        try
        {
            _voiceRecorder = new VoiceRecorder();
            var ok = await _voiceRecorder.StartAsync();
            if (!ok) _listening = false;
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[FaceMonitor] StartRecording failed");
            _listening = false;
        }
    }

    async Task StopRecordingAndSend()
    {
        try
        {
            if (_voiceRecorder == null) return;
            var wav = await _voiceRecorder.StopAsync();
            _voiceRecorder = null;
            if (wav.Length == 0) return;

            _agentSession.SendAudioToLlm(wav, "");

            if (!string.IsNullOrWhiteSpace(_apiKey))
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                        var text = await ChatClient.TranscribeStreamAsync(_apiKey, wav, _ => { }, cts.Token);
                        if (!string.IsNullOrWhiteSpace(text))
                            _agentService.History.ReplaceLastUserAudio(text);
                    }
                    catch { }
                });
            }
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[FaceMonitor] StopRecordingAndSend failed");
        }
    }

    public void Stop()
    {
        _active = false;

        _timer?.Stop();
        _timer = null;

        if (_capture != null)
        {
            try { _capture.StopPreviewAsync().AsTask().Wait(1000); } catch { }
            _capture.Dispose();
            _capture = null;
        }

        _listening = false;
        SetListening(false);
        LogService.Info("[FaceMonitor] stopped");
    }

    public void Dispose() => Stop();
}
*/
