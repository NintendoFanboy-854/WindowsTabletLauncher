using Windows.Media.Capture;
using Windows.Media.MediaProperties;
using Windows.Storage.Streams;
using LauncherHost.Services;

namespace LauncherHost.Core.Agent;

public sealed class VoiceRecorder : IDisposable
{
    readonly object _lock = new();
    MediaCapture? _capture;
    InMemoryRandomAccessStream? _stream;
    bool _recording;

    public bool IsRecording => _recording;

    public async Task<bool> StartAsync()
    {
        try
        {
            _capture = new MediaCapture();
            var settings = new MediaCaptureInitializationSettings
            {
                StreamingCaptureMode = StreamingCaptureMode.Audio,
                MediaCategory = MediaCategory.Speech
            };
            await _capture.InitializeAsync(settings);

            _stream = new InMemoryRandomAccessStream();
            var profile = MediaEncodingProfile.CreateWav(AudioEncodingQuality.Low);
            await _capture.StartRecordToStreamAsync(profile, _stream);
            _recording = true;
            LogService.Info("[VoiceRecorder] started");
            return true;
        }
        catch (Exception ex)
        {
            LogService.Error($"[VoiceRecorder] start failed: {ex.Message}");
            Cleanup();
            return false;
        }
    }

    public async Task<byte[]> StopAsync()
    {
        try
        {
            _recording = false;
            if (_capture != null)
                await _capture.StopRecordAsync();
        }
        catch (Exception ex)
        {
            LogService.Error($"[VoiceRecorder] stop record failed: {ex.Message}");
        }

        byte[] result = Array.Empty<byte>();
        try
        {
            lock (_lock)
            {
                if (_stream != null && _stream.Size > 0)
                {
                    using var ms = new MemoryStream();
                    var managedStream = _stream.AsStream();
                    managedStream.Seek(0, SeekOrigin.Begin);
                    managedStream.CopyTo(ms);
                    result = ms.ToArray();
                }
            }
            LogService.Info($"[VoiceRecorder] stopped, bytes={result.Length}");
        }
        catch (Exception ex)
        {
            LogService.Error($"[VoiceRecorder] read stream failed: {ex.Message}");
        }

        Cleanup();
        return result;
    }

    void Cleanup()
    {
        lock (_lock)
        {
            _capture?.Dispose();
            _capture = null;
            _stream?.Dispose();
            _stream = null;
        }
    }

    public void Dispose() => Cleanup();
}
