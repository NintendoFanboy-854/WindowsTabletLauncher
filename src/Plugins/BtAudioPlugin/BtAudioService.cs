using Windows.Foundation;
using Windows.Media.Audio;

namespace BtAudioPlugin;

/// <summary>
/// A2DP Sink 音频接收连接（AudioPlaybackConnection）。
/// Enable 通知系统有应用请求远程音频，OpenAsync 真正建立连接（3 次重试）。
/// 事件在后台线程触发，订阅方需自行封送 UI 线程。
/// </summary>
public sealed class BtAudioService : IDisposable
{
    readonly Dictionary<string, AudioPlaybackConnection> _enabled = new();
    AudioPlaybackConnection? _active;
    string? _activeDeviceId;
    readonly object _lock = new();
    const int MaxRetries = 3;
    const int RetryDelayMs = 500;

    public event Action<bool>? ConnectionStateChanged;
    public event Action<string>? StreamingStateChanged;
    public event Action<string>? ErrorOccurred;

    public bool IsConnected => _active != null;
    public bool IsStreaming { get; private set; }
    public string? ActiveDeviceId => _activeDeviceId;

    public bool Enable(string deviceId)
    {
        lock (_lock)
        {
            if (_enabled.ContainsKey(deviceId)) return true;
        }

        var connection = AudioPlaybackConnection.TryCreateFromId(deviceId);
        if (connection == null) return false;

        connection.StateChanged += OnStateChanged;
        try
        {
            connection.Start();
        }
        catch (Exception ex)
        {
            connection.StateChanged -= OnStateChanged;
            ErrorOccurred?.Invoke($"启用音频接收失败: {ex.Message}");
            return false;
        }

        lock (_lock) _enabled[deviceId] = connection;
        return true;
    }

    public async Task<bool> OpenAsync(string deviceId)
    {
        AudioPlaybackConnection? connection;
        lock (_lock)
        {
            if (!_enabled.TryGetValue(deviceId, out connection)) return false;
        }

        await CloseAsync();

        for (int attempt = 1; attempt <= MaxRetries; attempt++)
        {
            try
            {
                var result = await connection.OpenAsync();
                if (result.Status == AudioPlaybackConnectionOpenResultStatus.Success)
                {
                    await WaitForStateAsync(connection, AudioPlaybackConnectionState.Opened, 500);
                    _active = connection;
                    _activeDeviceId = deviceId;
                    IsStreaming = connection.State == AudioPlaybackConnectionState.Opened;
                    StreamingStateChanged?.Invoke(IsStreaming ? "Streaming" : "Connected");
                    ConnectionStateChanged?.Invoke(true);
                    return true;
                }
                if (attempt < MaxRetries) await Task.Delay(RetryDelayMs);
            }
            catch (Exception ex)
            {
                if (attempt == MaxRetries)
                {
                    ErrorOccurred?.Invoke(ex.Message);
                    return false;
                }
                await Task.Delay(RetryDelayMs);
            }
        }

        ErrorOccurred?.Invoke("多次尝试后仍无法建立音频连接。");
        return false;
    }

    public async Task CloseAsync()
    {
        AudioPlaybackConnection? old;
        bool wasConnected;
        string? deviceId;
        lock (_lock)
        {
            old = _active;
            wasConnected = old != null;
            _active = null;
            deviceId = _activeDeviceId;
            _activeDeviceId = null;
            if (deviceId != null) _enabled.Remove(deviceId);
        }

        if (old != null)
        {
            try
            {
                old.StateChanged -= OnStateChanged;
                old.Dispose();
            }
            catch { }
        }

        IsStreaming = false;
        if (wasConnected) ConnectionStateChanged?.Invoke(false);
        await Task.CompletedTask;
    }

    async Task WaitForStateAsync(AudioPlaybackConnection connection, AudioPlaybackConnectionState target, int timeoutMs)
    {
        if (connection.State == target) return;

        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        TypedEventHandler<AudioPlaybackConnection, object> handler = (sender, args) =>
        {
            if (sender.State == target) tcs.TrySetResult(true);
        };
        connection.StateChanged += handler;
        try
        {
            if (connection.State == target) return;
            await Task.WhenAny(tcs.Task, Task.Delay(timeoutMs));
        }
        finally
        {
            connection.StateChanged -= handler;
        }
    }

    void OnStateChanged(AudioPlaybackConnection sender, object args)
    {
        var wasStreaming = IsStreaming;
        IsStreaming = sender.State == AudioPlaybackConnectionState.Opened;
        if (wasStreaming != IsStreaming)
            StreamingStateChanged?.Invoke(IsStreaming ? "Streaming" : "Connected");

        if (sender.State == AudioPlaybackConnectionState.Closed && sender == _active)
        {
            IsStreaming = false;
            ConnectionStateChanged?.Invoke(false);
        }
    }

    public void Dispose()
    {
        lock (_lock)
        {
            if (_active != null)
            {
                try
                {
                    _active.StateChanged -= OnStateChanged;
                    _active.Dispose();
                }
                catch { }
                _active = null;
            }
            foreach (var kv in _enabled)
            {
                try
                {
                    kv.Value.StateChanged -= OnStateChanged;
                    kv.Value.Dispose();
                }
                catch { }
            }
            _enabled.Clear();
        }
        _activeDeviceId = null;
        IsStreaming = false;
    }
}
