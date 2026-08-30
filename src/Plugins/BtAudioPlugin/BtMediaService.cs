using Windows.Foundation;
using Windows.Media.Control;

namespace BtAudioPlugin;

/// <summary>
/// 系统媒体会话（SMTC）曲目信息：手机经 AVRCP 上报的元数据会作为会话出现。
/// 会话事件在后台线程触发，订阅方需自行封送 UI 线程。
/// </summary>
public sealed class BtMediaService : IDisposable
{
    GlobalSystemMediaTransportControlsSessionManager? _manager;
    GlobalSystemMediaTransportControlsSession? _session;

    string _title = "";
    string _artist = "";
    string _album = "";
    string _status = "";

    public event Action? Updated;

    public bool IsAvailable => _manager != null;
    public bool HasMedia => !string.IsNullOrEmpty(_title);
    public string Title => _title;
    public string Artist => _artist;
    public string Album => _album;
    public string StatusText => _status;

    public async Task InitializeAsync()
    {
        try
        {
            _manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
            _manager.SessionsChanged += OnSessionsChanged;
            PickSession();
        }
        catch
        {
            _manager = null;
        }
    }

    void OnSessionsChanged(GlobalSystemMediaTransportControlsSessionManager sender, SessionsChangedEventArgs args)
        => PickSession();

    void PickSession()
    {
        var manager = _manager;
        if (manager == null) return;

        GlobalSystemMediaTransportControlsSession? target = null;
        try
        {
            // 蓝牙 AVRCP 会话没有应用 AUMID，优先于本地应用会话
            target = manager.GetSessions().FirstOrDefault(s =>
                string.IsNullOrWhiteSpace(s.SourceAppUserModelId))
                ?? manager.GetCurrentSession();
        }
        catch { }

        if (ReferenceEquals(target, _session)) return;

        if (_session != null)
        {
            try
            {
                _session.MediaPropertiesChanged -= OnMediaChanged;
                _session.PlaybackInfoChanged -= OnMediaChanged;
            }
            catch { }
        }

        _session = target;
        _title = _artist = _album = _status = "";

        if (_session != null)
        {
            try
            {
                _session.MediaPropertiesChanged += OnMediaChanged;
                _session.PlaybackInfoChanged += OnMediaChanged;
                CachePropertiesAsync(_session);
            }
            catch { }
        }
        Updated?.Invoke();
    }

    void OnMediaChanged(GlobalSystemMediaTransportControlsSession sender, object args)
        => CachePropertiesAsync(sender);

    async void CachePropertiesAsync(GlobalSystemMediaTransportControlsSession session)
    {
        try
        {
            var props = await session.TryGetMediaPropertiesAsync();
            if (!ReferenceEquals(session, _session)) return;
            _title = props.Title ?? "";
            _artist = props.Artist ?? "";
            _album = props.AlbumTitle ?? "";
        }
        catch { }

        try
        {
            if (ReferenceEquals(session, _session))
                _status = session.GetPlaybackInfo()?.PlaybackStatus.ToString() ?? "";
        }
        catch { }

        Updated?.Invoke();
    }

    public (TimeSpan position, TimeSpan duration, bool playing) GetTimeline()
    {
        var session = _session;
        if (session == null) return (TimeSpan.Zero, TimeSpan.Zero, false);
        try
        {
            var t = session.GetTimelineProperties();
            var info = session.GetPlaybackInfo();
            bool playing = info?.PlaybackStatus == GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing;
            var pos = t.Position;
            if (playing)
            {
                var elapsed = DateTimeOffset.Now - t.LastUpdatedTime;
                if (elapsed > TimeSpan.Zero) pos += elapsed;
            }
            return (pos, t.EndTime, playing);
        }
        catch
        {
            return (TimeSpan.Zero, TimeSpan.Zero, false);
        }
    }

    public bool IsPlaying()
    {
        try
        {
            return _session?.GetPlaybackInfo()?.PlaybackStatus
                == GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing;
        }
        catch { return false; }
    }

    public bool SendCommand(string action)
    {
        var session = _session;
        if (session == null) return false;
        try
        {
            switch (action)
            {
                case "play_pause": Fire(session.TryTogglePlayPauseAsync()); return true;
                case "play": Fire(session.TryPlayAsync()); return true;
                case "pause": Fire(session.TryPauseAsync()); return true;
                case "next": Fire(session.TrySkipNextAsync()); return true;
                case "previous": Fire(session.TrySkipPreviousAsync()); return true;
                default: return false;
            }
        }
        catch { return false; }
    }

    static async void Fire(IAsyncOperation<bool> op)
    {
        try { await op; } catch { }
    }

    public void Dispose()
    {
        if (_session != null)
        {
            try
            {
                _session.MediaPropertiesChanged -= OnMediaChanged;
                _session.PlaybackInfoChanged -= OnMediaChanged;
            }
            catch { }
        }
        if (_manager != null)
        {
            try { _manager.SessionsChanged -= OnSessionsChanged; } catch { }
        }
        _session = null;
        _manager = null;
    }
}
