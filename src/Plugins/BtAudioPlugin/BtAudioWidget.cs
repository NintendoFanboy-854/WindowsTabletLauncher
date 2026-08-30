using System.Text.Json;
using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Automation;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using PluginContract;
using SharedUtils;
using Windows.Devices.Enumeration;

namespace BtAudioPlugin;

/// <summary>
/// 蓝牙音频接收 tile（Fluent 2）：蓝牙图标 + 状态色点 + 设备/曲目摘要；
/// overlay：状态卡（连接/断开）· 播放卡（曲目/进度/控制）· 设备列表卡（★默认设备）· 设置卡。
/// </summary>
public sealed class BtAudioWidget : UserControl
{
    readonly IHostHandle _host;
    readonly BtBluetoothService _bt;
    readonly BtAudioService _audio;
    readonly BtMediaService _media;
    readonly DispatcherQueue _dispatcher;
    readonly BtOverlay _overlay = new();
    readonly DispatcherQueueTimer _progressTimer;
    readonly object _lock = new();
    readonly List<BtDevice> _devices = new();
    readonly Dictionary<string, DateTime> _lastConnected = new();

    WidgetTile _tile = null!;
    Ellipse _dot = null!;
    TextBlock _devText = null!;
    TextBlock _statusText = null!;
    TextBlock _trackText = null!;

    TextBlock? _ovStatus;
    TextBlock? _ovDetail;
    Button? _ovConnect;
    Button? _ovDisconnect;
    Border? _ovMediaCard;
    TextBlock? _ovTitle;
    TextBlock? _ovArtist;
    ProgressBar? _ovProgress;
    TextBlock? _ovPos;
    TextBlock? _ovDur;
    Button? _ovPlayPause;
    StackPanel? _ovDeviceList;
    TextBlock? _ovEmpty;
    TextBlock? _ovCount;
    TextBlock? _ovError;
    ToggleSwitch? _ovAutoConnect;
    ToggleSwitch? _ovNotify;
    bool _rebuilding;

    string? _selectedId;
    string? _pendingAutoId;
    bool _isConnected;
    bool _isConnecting;
    bool _streaming;
    bool _enumerating;
    string? _errorMsg;

    sealed class DiscoveredItem
    {
        public DeviceInformation Info = null!;
        public string Id = "";
        public string Name = "";
        public bool Pairing;
    }

    readonly List<DiscoveredItem> _discovered = new();
    bool _discovering;
    bool _radioAvailable;
    bool _radioOn;
    bool _radioSetFailed;

    ToggleSwitch? _ovRadio;
    TextBlock? _ovRadioState;
    Button? _ovRadioSettings;
    Button? _ovDiscover;
    ProgressRing? _ovScanRing;
    TextBlock? _ovScanText;
    StackPanel? _ovDiscoveryList;
    TextBlock? _ovDiscoveryEmpty;

    public BtAudioWidget(IHostHandle host, BtBluetoothService bt, BtAudioService audio, BtMediaService media)
    {
        _host = host;
        _bt = bt;
        _audio = audio;
        _media = media;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
        _enumerating = !_bt.EnumerationDone;
        _isConnected = _audio.IsConnected;
        _streaming = _audio.IsStreaming;
        _selectedId = _audio.ActiveDeviceId;

        LoadLastConnected();

        lock (_lock)
        {
            foreach (var d in _bt.GetDevices())
            {
                if (_lastConnected.TryGetValue(d.Id, out var t)) d.LastConnectedTime = t;
                _devices.Add(d);
            }
        }

        _bt.DeviceAdded += OnDeviceAdded;
        _bt.DeviceRemoved += OnDeviceRemoved;
        _bt.EnumerationCompleted += OnEnumerationCompleted;
        _bt.WatcherFailed += OnWatcherFailed;
        _bt.DiscoveryAdded += OnDiscoveryAdded;
        _bt.DiscoveryRemoved += OnDiscoveryRemoved;
        _bt.DiscoveryCompleted += OnDiscoveryCompleted;
        _bt.RadioChanged += OnRadioChanged;
        _bt.ConfirmPinRequested += ConfirmPinBlocking;
        _bt.ProvidePinRequested += ProvidePinBlocking;
        _audio.ConnectionStateChanged += OnConnectionStateChanged;
        _audio.StreamingStateChanged += OnStreamingChanged;
        _audio.ErrorOccurred += OnAudioError;
        _media.Updated += OnMediaUpdated;

        _ = InitRadioAsync();

        BuildUi();

        Loaded += (_, _) => ApplyTheme(((FrameworkElement)this).ActualTheme);
        ActualThemeChanged += (_, _) => ApplyTheme(((FrameworkElement)this).ActualTheme);

        _progressTimer = _dispatcher.CreateTimer();
        _progressTimer.Interval = TimeSpan.FromSeconds(1);
        _progressTimer.IsRepeating = true;
        _progressTimer.Tick += (_, _) => UpdateProgressUi();

        if (_bt.EnumerationDone) TryAutoConnect();
        UpdateViews();
    }

    bool AutoConnectEnabled => (_host.GetConfig(nameof(BtAudioPlugin), "auto_connect") ?? "true") != "false";
    bool NotifyEnabled => (_host.GetConfig(nameof(BtAudioPlugin), "notify") ?? "true") != "false";

    string? Cfg(string key) => _host.GetConfig(nameof(BtAudioPlugin), key);

    void LoadLastConnected()
    {
        var raw = Cfg("device_last_connected");
        if (string.IsNullOrWhiteSpace(raw)) return;
        try
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, DateTime>>(raw);
            if (dict != null)
                foreach (var kv in dict) _lastConnected[kv.Key] = kv.Value;
        }
        catch { }
    }

    void SaveLastConnected()
    {
        _host.SetConfig(nameof(BtAudioPlugin), "device_last_connected",
            JsonSerializer.Serialize(_lastConnected));
    }

    void Enqueue(Action a)
    {
        if (_dispatcher.HasThreadAccess) a();
        else _dispatcher.TryEnqueue(() => a());
    }

    BtDevice? FindLocal(string? id)
    {
        if (string.IsNullOrEmpty(id)) return null;
        lock (_lock) return _devices.FirstOrDefault(d => d.Id == id);
    }

    BtDevice? ActiveDevice => FindLocal(_audio.ActiveDeviceId) ?? FindLocal(_selectedId);

    // ---- 服务事件（后台线程 → UI 线程） ----

    void OnDeviceAdded(BtDevice device)
    {
        Enqueue(() =>
        {
            lock (_lock)
            {
                var existing = _devices.FirstOrDefault(d => d.Id == device.Id);
                if (existing != null) _devices.Remove(existing);
                if (_lastConnected.TryGetValue(device.Id, out var t)) device.LastConnectedTime = t;
                _devices.Add(device);
            }
            if (_pendingAutoId != null && device.Id == _pendingAutoId && !_isConnected && !_isConnecting)
            {
                _pendingAutoId = null;
                ConnectTo(device);
            }
            if (_overlay.IsOpen) RebuildDeviceList();
            UpdateViews();
        });
    }

    void OnDeviceRemoved(string deviceId)
    {
        Enqueue(() =>
        {
            lock (_lock)
            {
                var existing = _devices.FirstOrDefault(d => d.Id == deviceId);
                if (existing != null) _devices.Remove(existing);
            }
            if (_selectedId == deviceId) _selectedId = null;
            if (_audio.ActiveDeviceId == deviceId && _isConnected)
                _ = _audio.CloseAsync();
            if (_overlay.IsOpen) RebuildDeviceList();
            UpdateViews();
        });
    }

    void OnEnumerationCompleted()
    {
        Enqueue(() =>
        {
            _enumerating = false;
            TryAutoConnect();
            UpdateViews();
        });
    }

    void OnWatcherFailed(string message)
    {
        Enqueue(() =>
        {
            _enumerating = false;
            _errorMsg = message;
            UpdateViews();
        });
    }

    void OnConnectionStateChanged(bool connected)
    {
        Enqueue(() =>
        {
            _host.Log($"BtAudio: audio connection → {(connected ? "CONNECTED" : "DISCONNECTED")}");
            _isConnected = connected;
            _isConnecting = false;
            if (connected)
            {
                _selectedId = _audio.ActiveDeviceId;
                RecordConnected();
                _errorMsg = null;
            }
            else
            {
                _streaming = false;
            }
            UpdateViews();
        });
    }

    void OnStreamingChanged(string state)
    {
        Enqueue(() =>
        {
            _streaming = state == "Streaming";
            UpdateViews();
        });
    }

    void OnAudioError(string message)
    {
        Enqueue(() =>
        {
            _errorMsg = message;
            _isConnecting = false;
            UpdateViews();
        });
    }

    void OnMediaUpdated()
    {
        Enqueue(UpdateViews);
    }

    // ---- 蓝牙开关 / 发现设备 / 配对 ----

    /// <summary>数字比对确认（服务在后台线程阻塞调用，60 秒超时）。</summary>
    bool ConfirmPinBlocking(string pin)
    {
        if (_dispatcher.HasThreadAccess)
        {
            // 极罕见：事件在 UI 线程触发，无法阻塞，退化为立即接受以保住仪式
            _ = ShowConfirmDialogAsync(pin, null);
            return true;
        }
        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        _dispatcher.TryEnqueue(() => _ = ShowConfirmDialogAsync(pin, tcs));
        try
        {
            return tcs.Task.Wait(60_000) && tcs.Task.Result;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>PIN 仪式：本机生成 6 位 PIN 并显示，用户输入到手机（阻塞调用）。</summary>
    string? ProvidePinBlocking()
    {
        var pin = Random.Shared.Next(100000, 999999).ToString();
        if (_dispatcher.HasThreadAccess)
        {
            _ = ShowProvidePinDialogAsync(pin, null);
            return pin;
        }
        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        _dispatcher.TryEnqueue(() => _ = ShowProvidePinDialogAsync(pin, tcs));
        try
        {
            return tcs.Task.Wait(60_000) && tcs.Task.Result ? pin : null;
        }
        catch
        {
            return null;
        }
    }

    async Task ShowConfirmDialogAsync(string pin, TaskCompletionSource<bool>? tcs)
    {
        try
        {
            var decided = false;
            var dlg = new ContentDialog
            {
                XamlRoot = XamlRoot,
                Title = "蓝牙配对确认",
                Content = $"请留意手机屏幕上的配对请求，与本机配对码一致后点击确认。\n\n配对码：{pin}",
                PrimaryButtonText = "一致，确认配对",
                CloseButtonText = "取消",
                DefaultButton = ContentDialogButton.Primary
            };
            dlg.PrimaryButtonClick += (_, _) => { decided = true; tcs?.TrySetResult(true); };
            dlg.Closed += (_, _) => { if (!decided) tcs?.TrySetResult(false); };
            _ = dlg.ShowAsync();
        }
        catch
        {
            tcs?.TrySetResult(false);
        }
    }

    async Task ShowProvidePinDialogAsync(string pin, TaskCompletionSource<bool>? tcs)
    {
        try
        {
            var decided = false;
            var dlg = new ContentDialog
            {
                XamlRoot = XamlRoot,
                Title = "蓝牙配对 PIN",
                Content = $"请在手机的配对请求界面输入以下 PIN：\n\n{pin}",
                PrimaryButtonText = "已在手机上输入",
                CloseButtonText = "取消",
                DefaultButton = ContentDialogButton.Primary
            };
            dlg.PrimaryButtonClick += (_, _) => { decided = true; tcs?.TrySetResult(true); };
            dlg.Closed += (_, _) => { if (!decided) tcs?.TrySetResult(false); };
            _ = dlg.ShowAsync();
        }
        catch
        {
            tcs?.TrySetResult(false);
        }
    }

    async Task InitRadioAsync()
    {
        await _bt.InitRadioAsync();
        Enqueue(() =>
        {
            _radioAvailable = _bt.RadioAvailable;
            _radioOn = _radioAvailable && _bt.BluetoothOn;
            UpdateViews();
        });
    }

    void OnRadioChanged()
    {
        Enqueue(() =>
        {
            _radioAvailable = _bt.RadioAvailable;
            _radioOn = _radioAvailable && _bt.BluetoothOn;
            if (_radioOn) _radioSetFailed = false;
            UpdateViews();
        });
    }

    void OnDiscoveryAdded(DeviceInformation info)
    {
        Enqueue(() =>
        {
            lock (_lock)
            {
                if (_discovered.Any(d => d.Id == info.Id)) return;
                _discovered.Add(new DiscoveredItem
                {
                    Info = info,
                    Id = info.Id,
                    Name = string.IsNullOrEmpty(info.Name) ? "未知设备" : info.Name
                });
            }
            RebuildDiscoveryList();
        });
    }

    void OnDiscoveryRemoved(string id)
    {
        Enqueue(() =>
        {
            lock (_lock) _discovered.RemoveAll(d => d.Id == id);
            RebuildDiscoveryList();
        });
    }

    void OnDiscoveryCompleted()
    {
        Enqueue(() =>
        {
            _discovering = false;
            RebuildDiscoveryList();
            UpdateOverlayUi();
        });
    }

    void StartDiscovery()
    {
        lock (_lock) _discovered.Clear();
        _discovering = true;
        _bt.StartDiscovery();
        RebuildDiscoveryList();
        UpdateOverlayUi();
    }

    async Task ToggleRadioAsync(bool on)
    {
        var ok = await _bt.SetBluetoothAsync(on);
        Enqueue(() =>
        {
            if (ok)
            {
                _radioSetFailed = false;
                _radioOn = on;
            }
            else
            {
                _radioSetFailed = true;
                _errorMsg = "无法控制系统蓝牙开关，请使用系统设置";
            }
            UpdateViews();
        });
    }

    async void PairDiscovered(DiscoveredItem item)
    {
        item.Pairing = true;
        RebuildDiscoveryList();

        var (ok, msg) = await _bt.PairAsync(item.Id);
        _host.Log($"BtAudio: pair '{item.Name}' → {msg}");

        Enqueue(() =>
        {
            item.Pairing = false;
            if (ok)
            {
                lock (_lock) _discovered.RemoveAll(d => d.Id == item.Id);
                _selectedId = item.Id;
                _host.ShowNotification("蓝牙音频", msg + "，正在准备连接…", false);
                // 定向刷新：等音频端点注册后自动发起连接
                _ = RefreshDevicesAsync(item.Id);
            }
            else
            {
                _errorMsg = msg;
            }
            RebuildDiscoveryList();
            UpdateOverlayUi();
        });
    }

    async void UnpairDevice(BtDevice device)
    {
        if (_audio.ActiveDeviceId == device.Id && _isConnected) Disconnect();

        var (ok, msg) = await BtBluetoothService.UnpairAsync(device.Id);

        Enqueue(() =>
        {
            if (ok)
                _host.ShowNotification("蓝牙音频", $"已取消配对 {device.Name}", false);
            else
                _errorMsg = msg;
            UpdateViews();
        });
    }

    internal async Task<string> PairViaAgent(string? name)
    {
        if (string.IsNullOrEmpty(name))
            return AgentJson.Serialize(new { ok = false, error = "missing_name", message = "缺少设备名称" });

        var (info, error) = await _bt.ScanAndFindAsync(name, 15000);
        if (info == null)
            return AgentJson.Serialize(new { ok = false, error = "device_not_found", message = error });

        var (ok, msg) = await _bt.PairAsync(info.Id);
        _host.Log($"BtAudio: agent pair '{info.Name}' → {msg}");
        if (!ok)
            return AgentJson.Serialize(new { ok = false, error = "pair_failed", message = msg });

        Enqueue(() =>
        {
            _selectedId = info.Id;
            _ = RefreshDevicesAsync(info.Id);
            UpdateViews();
        });
        return AgentJson.Serialize(new { ok = true, message = msg + "，正在准备自动连接", device = info.Name });
    }

    void RecordConnected()
    {
        var device = FindLocal(_audio.ActiveDeviceId);
        if (device == null) return;
        device.LastConnectedTime = DateTime.Now;
        _lastConnected[device.Id] = device.LastConnectedTime;
        SaveLastConnected();
        _host.SetConfig(nameof(BtAudioPlugin), "last_device_id", device.Id);
        _host.SetConfig(nameof(BtAudioPlugin), "last_device_name", device.Name);
        if (NotifyEnabled)
            _host.ShowNotification("蓝牙音频", $"已连接 {device.Name}，可以开始播放音乐了。", false);
        _host.Log($"BtAudio: connected '{device.Name}'");
    }

    // ---- 连接控制 ----

    void TryAutoConnect()
    {
        if (_isConnected || _isConnecting || !AutoConnectEnabled) return;

        var defId = Cfg("default_device_id");
        var lastId = Cfg("last_device_id");
        BtDevice? target = FindLocal(defId) ?? FindLocal(lastId);
        if (target == null)
        {
            lock (_lock) target = _devices.FirstOrDefault(d => d.IsConnected);
        }

        if (target != null)
        {
            ConnectTo(target);
        }
        else if (!string.IsNullOrEmpty(defId))
        {
            _pendingAutoId = defId;
        }
        else if (!string.IsNullOrEmpty(lastId))
        {
            _pendingAutoId = lastId;
        }
    }

    void ConnectTo(BtDevice device)
    {
        // 目标就是当前设备，无需操作
        if (_audio.ActiveDeviceId == device.Id && (_isConnected || _isConnecting)) return;

        // 正在连接/已连接其它设备 → 先断开再连接（切换）
        if (_isConnected || _isConnecting)
        {
            _ = SwitchToAsync(device);
            return;
        }
        BeginConnect(device);
    }

    async Task SwitchToAsync(BtDevice device)
    {
        _isConnecting = true;
        _errorMsg = null;
        _selectedId = device.Id;
        UpdateViews();
        _host.Log($"BtAudio: switching connection to '{device.Name}'...");

        await _audio.CloseAsync();

        if (!_audio.Enable(device.Id))
        {
            _errorMsg = $"无法为 {device.Name} 启用音频接收";
            _host.Log($"BtAudio: Enable failed for '{device.Name}' ({device.Id})");
            _isConnecting = false;
            UpdateViews();
            return;
        }
        _host.Log($"BtAudio: opening audio connection to '{device.Name}'...");
        await _audio.OpenAsync(device.Id);
    }

    void BeginConnect(BtDevice device)
    {
        _selectedId = device.Id;
        _isConnecting = true;
        _errorMsg = null;
        UpdateViews();

        if (!_audio.Enable(device.Id))
        {
            _errorMsg = $"无法为 {device.Name} 启用音频接收";
            _host.Log($"BtAudio: Enable failed for '{device.Name}' ({device.Id})");
            _isConnecting = false;
            UpdateViews();
            return;
        }
        _host.Log($"BtAudio: opening audio connection to '{device.Name}'...");
        _ = _audio.OpenAsync(device.Id);
    }

    internal void Disconnect()
    {
        if (!_isConnected) return;
        _ = _audio.CloseAsync();
        UpdateViews();
    }

    internal string ConnectViaAgent(string? deviceId, string? deviceName)
    {
        BtDevice? target = null;
        lock (_lock)
        {
            // 只做精确匹配；匹配失败时返回全量设备列表，由 AI 自行挑选后用 deviceId 重试
            if (!string.IsNullOrEmpty(deviceId))
                target = _devices.FirstOrDefault(d => d.Id == deviceId);
            if (target == null && !string.IsNullOrEmpty(deviceName))
                target = _devices.FirstOrDefault(d =>
                    string.Equals(d.Name, deviceName, StringComparison.OrdinalIgnoreCase));
            if (target == null && string.IsNullOrEmpty(deviceId) && string.IsNullOrEmpty(deviceName))
            {
                target = _devices.FirstOrDefault(d => d.Id == Cfg("default_device_id"))
                    ?? _devices.FirstOrDefault(d => d.Id == Cfg("last_device_id"))
                    ?? _devices.FirstOrDefault(d => d.IsConnected);
            }
        }
        if (target == null)
        {
            List<BtDevice> devices;
            lock (_lock) devices = new List<BtDevice>(_devices);
            var defId = Cfg("default_device_id");
            return AgentJson.Serialize(new
            {
                ok = false,
                error = "device_not_found",
                message = "未找到匹配设备，请从 devices 列表中选出正确设备，用其 deviceId 重新调用",
                activeDevice = _audio.ActiveDeviceId,
                devices = devices.Select(d => new
                {
                    id = d.Id,
                    name = d.Name,
                    btConnected = d.IsConnected,
                    isDefault = d.Id == defId,
                    lastConnected = d.LastConnectedTime == default
                        ? null
                        : d.LastConnectedTime.ToString("yyyy-MM-dd HH:mm")
                })
            });
        }
        ConnectTo(target);
        return StateJson();
    }

    internal bool SendMediaCommand(string action) => _media.SendCommand(action);

    internal void RefreshDevices() => _ = RefreshDevicesAsync(null);

    /// <summary>
    /// 重启主 watcher + 一次性全量枚举。expectedId 非空（配对成功后调用）时最多重试 8 秒，
    /// 等新配对设备的音频端点注册完成，出现后按自动连接设置直接发起连接。
    /// </summary>
    internal async Task RefreshDevicesAsync(string? expectedId)
    {
        lock (_lock) _devices.Clear();
        _pendingAutoId = expectedId != null && AutoConnectEnabled ? expectedId : null;
        _enumerating = true;
        _bt.StopWatching();
        _bt.StartWatching();
        UpdateViews();

        for (int i = 0; i < 8; i++)
        {
            await _bt.FindAllAudioDevicesAsync();
            Enqueue(() =>
            {
                if (_overlay.IsOpen) RebuildDeviceList();
                UpdateViews();
            });
            if (expectedId == null || FindLocal(expectedId) != null) break;
            await Task.Delay(1000);
        }

        Enqueue(() =>
        {
            _enumerating = false;
            if (expectedId != null)
            {
                var target = FindLocal(expectedId);
                if (target != null && AutoConnectEnabled)
                {
                    ConnectTo(target);
                }
                else if (target == null)
                {
                    _errorMsg = "配对成功，但暂未发现音频端点，请稍后点「刷新」重试";
                }
            }
            else
            {
                TryAutoConnect();
            }
            UpdateViews();
        });
    }

    /// <summary>overlay 打开时静默补一次全量枚举，避免只依赖 watcher 缓存。</summary>
    async void ScanQuietly()
    {
        await _bt.FindAllAudioDevicesAsync();
        Enqueue(() =>
        {
            if (_overlay.IsOpen) RebuildDeviceList();
            UpdateViews();
        });
    }

    void ToggleDefaultDevice()
    {
        var device = ActiveDevice;
        if (device == null) return;
        if (Cfg("default_device_id") == device.Id)
        {
            _host.SetConfig(nameof(BtAudioPlugin), "default_device_id", "");
            _host.SetConfig(nameof(BtAudioPlugin), "default_device_name", "");
        }
        else
        {
            _host.SetConfig(nameof(BtAudioPlugin), "default_device_id", device.Id);
            _host.SetConfig(nameof(BtAudioPlugin), "default_device_name", device.Name);
            _host.SetConfig(nameof(BtAudioPlugin), "auto_connect", "true");
        }
        UpdateViews();
    }

    // ---- Widget UI ----

    void BuildUi()
    {
        var theme = ((FrameworkElement)this).ActualTheme;

        _dot = new Ellipse { Width = 8, Height = 8, Margin = new Thickness(8, 2, 0, 0) };
        var iconRow = new StackPanel
        {
            Orientation = Orientation.Horizontal,
            HorizontalAlignment = HorizontalAlignment.Center
        };
        iconRow.Children.Add(new FontIcon { Glyph = "\uE702", FontSize = 18 });
        iconRow.Children.Add(_dot);

        _devText = Fluent.Text("蓝牙音频", theme, "bodyStrong");
        _devText.HorizontalAlignment = HorizontalAlignment.Center;
        _statusText = Fluent.Text("未连接", theme, "caption", Fluent.TextTertiary(theme));
        _statusText.HorizontalAlignment = HorizontalAlignment.Center;
        _trackText = Fluent.Text("", theme, "caption", Fluent.TextSecondary(theme));
        _trackText.HorizontalAlignment = HorizontalAlignment.Center;
        _trackText.TextWrapping = TextWrapping.Wrap;
        _trackText.TextTrimming = TextTrimming.CharacterEllipsis;
        _trackText.MaxLines = 2;
        _trackText.Visibility = Visibility.Collapsed;

        var stack = new StackPanel
        {
            Spacing = Fluent.SpaceXS,
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center
        };
        stack.Children.Add(iconRow);
        stack.Children.Add(_devText);
        stack.Children.Add(_statusText);
        stack.Children.Add(_trackText);

        var content = new Grid { Padding = new Thickness(Fluent.SpaceM) };
        content.Children.Add(stack);

        _tile = WidgetTile.Create(content, "蓝牙音频").Tap(OpenOverlay);
        Content = _tile;
    }

    void ApplyTheme(ElementTheme theme)
    {
        _tile.ApplyTheme(theme, (Brush)_host.GetWidgetBackgroundBrush());
        _devText.Foreground = Fluent.TextPrimary(theme);
        UpdateViews();
    }

    string StatusLabel()
    {
        if (_streaming) return "正在接收音频";
        if (_isConnecting) return "正在连接…";
        if (_isConnected) return "已连接";
        if (_enumerating) return "正在扫描…";
        return "未连接";
    }

    string DetailLabel()
    {
        var name = ActiveDevice?.Name ?? "";
        if (_isConnecting) return $"正在连接 {name}…";
        if (_streaming) return $"正在接收来自 {name} 的音频";
        if (_isConnected) return "音频连接已就绪，等待播放";
        if (_enumerating) return "正在扫描支持音频接收的蓝牙设备…";
        int count;
        lock (_lock) count = _devices.Count;
        return count > 0 ? $"共找到 {count} 台设备" : "选择一台设备开始接收";
    }

    void UpdateViews()
    {
        var theme = ((FrameworkElement)this).ActualTheme;
        var name = ActiveDevice?.Name;
        _devText.Text = string.IsNullOrEmpty(name) ? "蓝牙音频" : name;
        _statusText.Text = StatusLabel();
        _dot.Fill = _streaming ? Fluent.Success(theme)
            : _isConnecting ? Fluent.Caution(theme)
            : _isConnected ? Fluent.Accent()
            : Fluent.TextTertiary(theme);

        var showTrack = _streaming && _media.HasMedia;
        _trackText.Text = showTrack ? $"正在播放: {_media.Title} - {_media.Artist}" : "";
        _trackText.Visibility = showTrack ? Visibility.Visible : Visibility.Collapsed;

        if (_overlay.IsOpen) UpdateOverlayUi();
    }

    // ---- Overlay ----

    sealed class BtOverlay : BasePluginOverlay
    {
        public Action? ClosedHook;
        protected override void OnClosing() => ClosedHook?.Invoke();
    }

    void OpenOverlay()
    {
        if (_overlay.IsOpen) return;
        var theme = ((FrameworkElement)this).ActualTheme;
        _rebuilding = true;

        // 两列自适应布局（横向屏幕）：左列=状态/播放/蓝牙/设置；右列=发现/设备/帮助
        var body = new Grid { ColumnSpacing = Fluent.SpaceM };
        body.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(45, GridUnitType.Star) });
        body.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(55, GridUnitType.Star) });
        var leftCol = new StackPanel { Spacing = Fluent.SpaceM };
        var rightCol = new StackPanel { Spacing = Fluent.SpaceM };
        Grid.SetColumn(leftCol, 0);
        Grid.SetColumn(rightCol, 1);
        body.Children.Add(leftCol);
        body.Children.Add(rightCol);

        // 状态卡
        _ovStatus = Fluent.Text(StatusLabel(), theme, "subtitle");
        _ovDetail = Fluent.Text(DetailLabel(), theme, "caption", Fluent.TextTertiary(theme));
        _ovDetail.TextWrapping = TextWrapping.Wrap;

        _ovConnect = Fluent.Cta("连接", () => { var d = ActiveDevice; if (d != null) ConnectTo(d); }, accent: true);
        _ovDisconnect = Fluent.Cta("断开", Disconnect, accent: false);

        var statusButtons = new StackPanel
        {
            Orientation = Orientation.Horizontal,
            Spacing = Fluent.SpaceS,
            HorizontalAlignment = HorizontalAlignment.Left
        };
        statusButtons.Children.Add(_ovConnect);
        statusButtons.Children.Add(_ovDisconnect);

        var statusBody = new StackPanel { Spacing = Fluent.SpaceS };
        statusBody.Children.Add(_ovStatus);
        statusBody.Children.Add(_ovDetail);
        statusBody.Children.Add(statusButtons);
        var statusCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceL));
        statusCard.Child = statusBody;
        leftCol.Children.Add(statusCard);

        // 蓝牙卡
        _ovRadio = new ToggleSwitch
        {
            Header = !_radioAvailable ? "蓝牙（不可用）" : "蓝牙",
            OnContent = "开",
            OffContent = "关",
            IsOn = _radioOn,
            IsEnabled = _radioAvailable,
            Margin = new Thickness(0, 0, 0, 4)
        };
        _ovRadio.Toggled += (_, _) =>
        {
            if (_rebuilding) return;
            _ = ToggleRadioAsync(_ovRadio.IsOn);
        };
        _ovRadioState = Fluent.Text(RadioStateText(), theme, "caption", Fluent.TextTertiary(theme));
        _ovRadioState.TextWrapping = TextWrapping.Wrap;
        _ovRadioSettings = Fluent.Cta("打开系统蓝牙设置", null, accent: false);
        _ovRadioSettings.Click += async (_, _) =>
        {
            try { _ = await Windows.System.Launcher.LaunchUriAsync(new Uri("ms-settings:bluetooth")); }
            catch { }
        };
        _ovRadioSettings.Visibility = (!_radioAvailable || _radioSetFailed) ? Visibility.Visible : Visibility.Collapsed;
        _ovRadioSettings.HorizontalAlignment = HorizontalAlignment.Left;
        var radioBody = new StackPanel { Spacing = Fluent.SpaceS };
        radioBody.Children.Add(_ovRadio);
        radioBody.Children.Add(_ovRadioState);
        radioBody.Children.Add(_ovRadioSettings);
        var radioCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceM));
        radioCard.Child = radioBody;
        leftCol.Children.Add(radioCard);

        // 发现设备卡
        _ovDiscover = Fluent.Cta("搜索附近设备", null, accent: false);
        _ovDiscover.Click += (_, _) => StartDiscovery();
        _ovDiscover.IsEnabled = !_discovering;
        _ovScanRing = new ProgressRing { Width = 16, Height = 16, IsActive = _discovering };
        // 扫描状态 + 配对提示合并为一条说明，独占一行避免与标题/按钮挤压换行
        _ovScanText = Fluent.Text(_discovering ? "正在扫描附近设备…" : "点击「搜索附近设备」开始扫描；配对时留意系统弹出的确认窗口", theme, "caption", Fluent.TextTertiary(theme));
        _ovScanText.TextWrapping = TextWrapping.Wrap;
        _ovScanText.VerticalAlignment = VerticalAlignment.Center;

        // 头部两行：第一行=标题+按钮（两端对齐），第二行=扫描说明
        var discoveryHeader = new Grid { RowSpacing = Fluent.SpaceXS };
        discoveryHeader.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        discoveryHeader.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        var titleRow = new Grid { ColumnSpacing = Fluent.SpaceS };
        titleRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        titleRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        var discoveryTitle = Fluent.SectionTitle("发现新设备", theme);
        discoveryTitle.VerticalAlignment = VerticalAlignment.Center;
        Grid.SetColumn(discoveryTitle, 0);
        titleRow.Children.Add(discoveryTitle);
        var discoveryRight = new StackPanel
        {
            Orientation = Orientation.Horizontal,
            Spacing = Fluent.SpaceS,
            VerticalAlignment = VerticalAlignment.Center
        };
        _ovScanRing.VerticalAlignment = VerticalAlignment.Center;
        discoveryRight.Children.Add(_ovScanRing);
        discoveryRight.Children.Add(_ovDiscover);
        Grid.SetColumn(discoveryRight, 1);
        titleRow.Children.Add(discoveryRight);
        Grid.SetRow(titleRow, 0);
        discoveryHeader.Children.Add(titleRow);
        Grid.SetRow(_ovScanText, 1);
        discoveryHeader.Children.Add(_ovScanText);

        _ovDiscoveryList = new StackPanel { Spacing = Fluent.SpaceS };
        _ovDiscoveryEmpty = Fluent.Text("未发现设备，请确认设备已进入配对模式", theme, "caption", Fluent.TextTertiary(theme));
        _ovDiscoveryEmpty.HorizontalAlignment = HorizontalAlignment.Center;
        _ovDiscoveryEmpty.Margin = new Thickness(0, Fluent.SpaceXS, 0, 0);

        var discoveryBody = new StackPanel { Spacing = Fluent.SpaceS };
        discoveryBody.Children.Add(discoveryHeader);
        discoveryBody.Children.Add(_ovDiscoveryList);
        discoveryBody.Children.Add(_ovDiscoveryEmpty);
        var discoveryCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceM));
        discoveryCard.Child = discoveryBody;
        rightCol.Children.Add(discoveryCard);

        // 播放卡（横排）：左侧曲目信息，右侧播放控制，进度条全宽置底
        _ovTitle = Fluent.Text("", theme, "bodyStrong");
        _ovTitle.TextTrimming = TextTrimming.CharacterEllipsis;
        _ovArtist = Fluent.Text("", theme, "caption", Fluent.TextSecondary(theme));
        _ovArtist.TextTrimming = TextTrimming.CharacterEllipsis;
        _ovPos = Fluent.Text("0:00", theme, "caption", Fluent.TextTertiary(theme));
        _ovDur = Fluent.Text("--:--", theme, "caption", Fluent.TextTertiary(theme));
        _ovProgress = new ProgressBar { Minimum = 0, Maximum = 100, Value = 0, Height = 4, CornerRadius = new CornerRadius(2) };

        var progressRow = new Grid { ColumnSpacing = Fluent.SpaceS };
        progressRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        progressRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        progressRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        Grid.SetColumn(_ovPos, 0);
        progressRow.Children.Add(_ovPos);
        Grid.SetColumn(_ovProgress, 1);
        _ovProgress.VerticalAlignment = VerticalAlignment.Center;
        progressRow.Children.Add(_ovProgress);
        Grid.SetColumn(_ovDur, 2);
        progressRow.Children.Add(_ovDur);

        var prevBtn = Fluent.IconButton("\uE892", "上一首", () => _media.SendCommand("previous"));
        _ovPlayPause = Fluent.IconButton("\uE768", "播放/暂停", () => _media.SendCommand("play_pause"));
        var nextBtn = Fluent.IconButton("\uE893", "下一首", () => _media.SendCommand("next"));
        var mediaButtons = new StackPanel
        {
            Orientation = Orientation.Horizontal,
            Spacing = Fluent.SpaceXS,
            VerticalAlignment = VerticalAlignment.Center
        };
        mediaButtons.Children.Add(prevBtn);
        mediaButtons.Children.Add(_ovPlayPause);
        mediaButtons.Children.Add(nextBtn);

        var mediaInfo = new StackPanel { Spacing = 2, VerticalAlignment = VerticalAlignment.Center };
        mediaInfo.Children.Add(_ovTitle);
        mediaInfo.Children.Add(_ovArtist);

        var mediaTop = new Grid { ColumnSpacing = Fluent.SpaceM };
        mediaTop.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        mediaTop.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        mediaTop.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        var musicIcon = new FontIcon
        {
            Glyph = "\uE8D6",
            FontSize = 24,
            Foreground = Fluent.Accent(),
            VerticalAlignment = VerticalAlignment.Center
        };
        Grid.SetColumn(musicIcon, 0);
        mediaTop.Children.Add(musicIcon);
        Grid.SetColumn(mediaInfo, 1);
        mediaTop.Children.Add(mediaInfo);
        Grid.SetColumn(mediaButtons, 2);
        mediaTop.Children.Add(mediaButtons);

        var mediaBody = new StackPanel { Spacing = Fluent.SpaceS };
        mediaBody.Children.Add(mediaTop);
        mediaBody.Children.Add(progressRow);
        _ovMediaCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceM));
        _ovMediaCard.Child = mediaBody;
        _ovMediaCard.Visibility = Visibility.Collapsed;
        leftCol.Children.Add(_ovMediaCard);

        // 设备列表卡
        _ovCount = Fluent.SectionTitle("设备", theme);
        var refreshBtn = Fluent.IconButton("\uE72C", "刷新设备列表", RefreshDevices, "刷新");
        var listHeader = new Grid();
        listHeader.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        listHeader.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        _ovCount.VerticalAlignment = VerticalAlignment.Center;
        Grid.SetColumn(_ovCount, 0);
        listHeader.Children.Add(_ovCount);
        Grid.SetColumn(refreshBtn, 1);
        listHeader.Children.Add(refreshBtn);

        _ovDeviceList = new StackPanel { Spacing = Fluent.SpaceS };
        _ovEmpty = Fluent.Text("未找到设备，请在 Windows 蓝牙设置中配对手机。", theme, "caption", Fluent.TextTertiary(theme));
        _ovEmpty.HorizontalAlignment = HorizontalAlignment.Center;
        _ovEmpty.Margin = new Thickness(0, Fluent.SpaceS, 0, Fluent.SpaceXS);

        var listBody = new StackPanel { Spacing = Fluent.SpaceS };
        listBody.Children.Add(listHeader);
        listBody.Children.Add(_ovDeviceList);
        listBody.Children.Add(_ovEmpty);
        var listCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceM));
        listCard.Child = listBody;
        rightCol.Children.Add(listCard);

        // 设置卡
        _ovAutoConnect = new ToggleSwitch
        {
            Header = "自动连接记忆设备",
            IsOn = AutoConnectEnabled,
            Margin = new Thickness(0, 0, 0, 4)
        };
        _ovAutoConnect.Toggled += (_, _) =>
        {
            if (_rebuilding) return;
            _host.SetConfig(nameof(BtAudioPlugin), "auto_connect", _ovAutoConnect.IsOn ? "true" : "false");
            if (_ovAutoConnect.IsOn) TryAutoConnect();
            UpdateViews();
        };
        _ovNotify = new ToggleSwitch
        {
            Header = "连接成功通知",
            IsOn = NotifyEnabled,
            Margin = new Thickness(0, 0, 0, 4)
        };
        _ovNotify.Toggled += (_, _) =>
        {
            if (_rebuilding) return;
            _host.SetConfig(nameof(BtAudioPlugin), "notify", _ovNotify.IsOn ? "true" : "false");
        };
        var settingsBody = new StackPanel { Spacing = Fluent.SpaceXS };
        settingsBody.Children.Add(_ovAutoConnect);
        settingsBody.Children.Add(_ovNotify);
        var settingsCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceM));
        settingsCard.Child = settingsBody;
        leftCol.Children.Add(settingsCard);

        // 错误行 + 帮助卡
        _ovError = Fluent.Text("", theme, "caption", Fluent.Critical(theme));
        _ovError.TextWrapping = TextWrapping.Wrap;
        _ovError.Visibility = Visibility.Collapsed;

        var help = Fluent.Text(
            "将手机与本机配对后，在上方列表选择设备并点击「连接」，然后在手机的蓝牙设置中把「媒体音频」输出切换到本机，手机播放的音频即通过本机扬声器播放。星标可设为默认设备，开启自动连接后将自动回连。若听不到声音，请检查系统音量与输出设备。",
            theme, "caption", Fluent.TextTertiary(theme));
        help.TextWrapping = TextWrapping.Wrap;
        var helpCard = Fluent.Card(theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceM));
        helpCard.Child = help;
        rightCol.Children.Add(_ovError);
        rightCol.Children.Add(helpCard);

        _rebuilding = false;

        RebuildDeviceList();
        RebuildDiscoveryList();
        UpdateOverlayUi();
        _overlay.ClosedHook = () =>
        {
            _progressTimer.Stop();
            _bt.StopDiscovery();
            _discovering = false;
        };
        _overlay.Show(this, "蓝牙音频", body, _host.Log, width: 1100);
        _progressTimer.Start();
        ScanQuietly();
    }

    void RebuildDeviceList()
    {
        if (_ovDeviceList == null) return;
        _rebuilding = true;
        _ovDeviceList.Children.Clear();
        var theme = ((FrameworkElement)this).ActualTheme;

        List<BtDevice> sorted;
        lock (_lock)
        {
            sorted = _devices
                .OrderByDescending(d => d.IsConnected)
                .ThenByDescending(d => d.LastConnectedTime)
                .ThenBy(d => d.Name)
                .ToList();
        }
        var defId = Cfg("default_device_id");

        foreach (var d in sorted)
        {
            var device = d;
            var isSelected = device.Id == _selectedId;
            var isActive = device.Id == _audio.ActiveDeviceId && _isConnected;
            var isDefault = device.Id == defId;

            var iconBorder = new Border
            {
                Width = 32,
                Height = 32,
                CornerRadius = new CornerRadius(Fluent.RadiusControl),
                Background = Fluent.CardBgSecondary(theme),
                Child = new FontIcon { Glyph = "\uE702", FontSize = 14 }
            };
            Grid.SetColumn(iconBorder, 0);

            var nameText = Fluent.Text(device.Name, theme, "body", Fluent.TextPrimary(theme));
            var statusText = Fluent.Text(
                isActive && _streaming ? "正在接收音频"
                : isActive ? "已连接"
                : device.IsConnected ? "已配对"
                : "未连接",
                theme, "caption", Fluent.TextSecondary(theme));
            var lastText = Fluent.Text(
                device.LastConnectedTime == default
                    ? ""
                    : $"上次连接 {device.LastConnectedTime:yyyy/M/d HH:mm}",
                theme, "caption", Fluent.TextTertiary(theme));
            lastText.Opacity = 0.7;
            var texts = new StackPanel { VerticalAlignment = VerticalAlignment.Center, Margin = new Thickness(Fluent.SpaceM, 0, 0, 0) };
            texts.Children.Add(nameText);
            texts.Children.Add(statusText);
            if (device.LastConnectedTime != default) texts.Children.Add(lastText);
            Grid.SetColumn(texts, 1);

            var star = new TextBlock
            {
                Text = isDefault ? "\u2605" : "\u2606",
                FontSize = 18,
                Foreground = Fluent.Accent(),
                VerticalAlignment = VerticalAlignment.Center
            };
            var starBtn = new Button
            {
                Content = star,
                Background = new SolidColorBrush(Microsoft.UI.Colors.Transparent),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(Fluent.SpaceXS),
                MinWidth = Fluent.TouchTarget,
                MinHeight = Fluent.TouchTarget,
                CornerRadius = new CornerRadius(Fluent.RadiusControl)
            };
            ToolTipService.SetToolTip(starBtn, isDefault ? "取消默认设备" : "设为默认设备");
            AutomationProperties.SetName(starBtn, isDefault ? $"取消默认设备 {device.Name}" : $"设为默认设备 {device.Name}");
            starBtn.Click += (_, _) =>
            {
                var target = FindLocal(device.Id);
                if (target == null) return;
                if (Cfg("default_device_id") == device.Id)
                {
                    _host.SetConfig(nameof(BtAudioPlugin), "default_device_id", "");
                    _host.SetConfig(nameof(BtAudioPlugin), "default_device_name", "");
                }
                else
                {
                    _host.SetConfig(nameof(BtAudioPlugin), "default_device_id", device.Id);
                    _host.SetConfig(nameof(BtAudioPlugin), "default_device_name", device.Name);
                    _host.SetConfig(nameof(BtAudioPlugin), "auto_connect", "true");
                    if (_ovAutoConnect != null) _ovAutoConnect.IsOn = true;
                }
                RebuildDeviceList();
            };
            Grid.SetColumn(starBtn, 2);

            var moreBtn = new Button
            {
                Content = new FontIcon { Glyph = "\uE712", FontSize = 14 },
                Background = new SolidColorBrush(Microsoft.UI.Colors.Transparent),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(Fluent.SpaceXS),
                MinWidth = Fluent.TouchTarget,
                MinHeight = Fluent.TouchTarget,
                CornerRadius = new CornerRadius(Fluent.RadiusControl),
                VerticalAlignment = VerticalAlignment.Center
            };
            ToolTipService.SetToolTip(moreBtn, "更多操作");
            AutomationProperties.SetName(moreBtn, $"更多操作 {device.Name}");
            var moreFlyout = new MenuFlyout();
            var unpairItem = new MenuFlyoutItem { Text = "取消配对" };
            unpairItem.Click += (_, _) => UnpairDevice(device);
            moreFlyout.Items.Add(unpairItem);
            moreBtn.Flyout = moreFlyout;
            Grid.SetColumn(moreBtn, 3);

            var rowGrid = new Grid { ColumnSpacing = Fluent.SpaceS };
            rowGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            rowGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            rowGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            rowGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            rowGrid.Children.Add(iconBorder);
            rowGrid.Children.Add(texts);
            rowGrid.Children.Add(starBtn);
            rowGrid.Children.Add(moreBtn);

            var row = new Border
            {
                CornerRadius = new CornerRadius(Fluent.RadiusControl),
                Padding = new Thickness(Fluent.SpaceM),
                Background = isSelected ? Fluent.SubtleHover(theme) : Fluent.CardBgSecondary(theme),
                BorderThickness = new Thickness(1),
                BorderBrush = isSelected ? Fluent.Accent() : Fluent.CardStroke(theme),
                Child = rowGrid
            };
            AutomationProperties.SetName(row, $"设备 {device.Name}");
            row.Tapped += (_, _) =>
            {
                _selectedId = device.Id;
                RebuildDeviceList();
                UpdateOverlayUi();
            };
            _ovDeviceList.Children.Add(row);
        }

        int count;
        lock (_lock) count = _devices.Count;
        if (_ovEmpty != null) _ovEmpty.Visibility = count == 0 ? Visibility.Visible : Visibility.Collapsed;
        if (_ovCount != null) _ovCount.Text = count > 0 ? $"设备 ({count})" : "设备";
        _rebuilding = false;
    }

    void RebuildDiscoveryList()
    {
        if (_ovDiscoveryList == null) return;
        _rebuilding = true;
        _ovDiscoveryList.Children.Clear();
        var theme = ((FrameworkElement)this).ActualTheme;

        List<DiscoveredItem> items;
        lock (_lock) items = new List<DiscoveredItem>(_discovered);

        foreach (var item in items)
        {
            var iconBorder = new Border
            {
                Width = 32,
                Height = 32,
                CornerRadius = new CornerRadius(Fluent.RadiusControl),
                Background = Fluent.CardBgSecondary(theme),
                Child = new FontIcon { Glyph = "\uE702", FontSize = 14 }
            };
            Grid.SetColumn(iconBorder, 0);

            var nameText = Fluent.Text(item.Name, theme, "body", Fluent.TextPrimary(theme));
            var statusText = Fluent.Text(item.Pairing ? "正在配对…" : "未配对", theme, "caption", Fluent.TextSecondary(theme));
            var texts = new StackPanel { VerticalAlignment = VerticalAlignment.Center, Margin = new Thickness(Fluent.SpaceM, 0, 0, 0) };
            texts.Children.Add(nameText);
            texts.Children.Add(statusText);
            Grid.SetColumn(texts, 1);

            var pairBtn = new Button
            {
                Content = item.Pairing ? "配对中…" : "配对",
                Padding = new Thickness(Fluent.SpaceL, Fluent.SpaceS, Fluent.SpaceL, Fluent.SpaceS),
                MinHeight = Fluent.TouchTarget,
                IsEnabled = !item.Pairing,
                VerticalAlignment = VerticalAlignment.Center
            };
            pairBtn.Click += (_, _) => PairDiscovered(item);
            Grid.SetColumn(pairBtn, 2);

            var rowGrid = new Grid { ColumnSpacing = Fluent.SpaceS };
            rowGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            rowGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            rowGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            rowGrid.Children.Add(iconBorder);
            rowGrid.Children.Add(texts);
            rowGrid.Children.Add(pairBtn);

            var row = new Border
            {
                CornerRadius = new CornerRadius(Fluent.RadiusControl),
                Padding = new Thickness(Fluent.SpaceM),
                Background = Fluent.CardBgSecondary(theme),
                BorderThickness = new Thickness(1),
                BorderBrush = Fluent.CardStroke(theme),
                Child = rowGrid
            };
            _ovDiscoveryList.Children.Add(row);
        }

        if (_ovDiscoveryEmpty != null)
            _ovDiscoveryEmpty.Visibility = items.Count == 0 && !_discovering
                ? Visibility.Visible
                : Visibility.Collapsed;
        _rebuilding = false;
    }

    string RadioStateText()
    {
        if (!_radioAvailable) return "无法获取蓝牙状态（可能被系统限制）";
        if (_radioOn)
        {
            return _radioSetFailed
                ? "蓝牙已开启（此前开关操作失败，可跳转系统设置）"
                : "蓝牙已开启，可扫描和连接设备";
        }
        return _radioSetFailed
            ? "蓝牙开关操作失败，请使用系统设置"
            : "蓝牙已关闭，扫描和连接不可用";
    }

    int GetDiscoveredCount()
    {
        lock (_lock) return _discovered.Count;
    }

    static string Fmt(TimeSpan t)
    {
        if (t < TimeSpan.Zero) t = TimeSpan.Zero;
        return t.TotalHours >= 1
            ? $"{(int)t.TotalHours}:{t.Minutes:D2}:{t.Seconds:D2}"
            : $"{(int)t.TotalMinutes}:{t.Seconds:D2}";
    }

    void UpdateOverlayUi()
    {
        if (!_overlay.IsOpen) return;
        var theme = ((FrameworkElement)this).ActualTheme;

        if (_ovStatus != null) _ovStatus.Text = StatusLabel();
        if (_ovDetail != null) _ovDetail.Text = DetailLabel();
        if (_ovConnect != null)
        {
            var selected = ActiveDevice;
            var switching = _isConnected && selected != null && selected.Id != _audio.ActiveDeviceId;
            _ovConnect.Content = _isConnecting ? "连接中…" : switching ? "切换" : "连接";
            _ovConnect.IsEnabled = !_isConnecting && selected != null &&
                                   !(_isConnected && !switching);
        }
        if (_ovDisconnect != null) _ovDisconnect.IsEnabled = _isConnected;
        if (_ovError != null)
        {
            _ovError.Text = _errorMsg ?? "";
            _ovError.Visibility = string.IsNullOrEmpty(_errorMsg) ? Visibility.Collapsed : Visibility.Visible;
        }

        if (_ovRadio != null)
        {
            _rebuilding = true;
            _ovRadio.IsOn = _radioOn;
            _rebuilding = false;
        }
        if (_ovRadioState != null) _ovRadioState.Text = RadioStateText();
        if (_ovRadioSettings != null)
            _ovRadioSettings.Visibility = !_radioAvailable || _radioSetFailed
                ? Visibility.Visible
                : Visibility.Collapsed;
        if (_ovScanRing != null) _ovScanRing.IsActive = _discovering;
        if (_ovScanRing != null) _ovScanRing.Visibility = _discovering ? Visibility.Visible : Visibility.Collapsed;
        if (_ovScanText != null)
            _ovScanText.Text = _discovering
                ? "正在扫描附近设备…"
                : "点击「搜索附近设备」开始扫描；配对时留意系统弹出的确认窗口";
        if (_ovDiscover != null) _ovDiscover.IsEnabled = !_discovering;
        if (_ovDiscoveryEmpty != null)
            _ovDiscoveryEmpty.Visibility = !_discovering && GetDiscoveredCount() == 0
                ? Visibility.Visible
                : Visibility.Collapsed;

        if (_ovMediaCard != null)
        {
            var show = _streaming && _media.HasMedia;
            _ovMediaCard.Visibility = show ? Visibility.Visible : Visibility.Collapsed;
            if (show)
            {
                _ovTitle!.Text = _media.Title;
                _ovArtist!.Text = string.IsNullOrEmpty(_media.Artist) ? _media.Album : _media.Artist;
                _ovPlayPause!.Content = new FontIcon
                {
                    Glyph = _media.IsPlaying() ? "\uE769" : "\uE768",
                    FontSize = 16
                };
                UpdateProgressUi();
            }
        }
    }

    void UpdateProgressUi()
    {
        if (!_overlay.IsOpen || _ovProgress == null) return;
        if (!_streaming || !_media.HasMedia) return;
        var (pos, dur, playing) = _media.GetTimeline();
        if (_ovPos != null) _ovPos.Text = Fmt(pos);
        if (_ovDur != null) _ovDur.Text = dur > TimeSpan.Zero ? Fmt(dur) : "--:--";
        _ovProgress.Maximum = 100;
        _ovProgress.IsIndeterminate = false;
        _ovProgress.Value = dur > TimeSpan.Zero ? Math.Clamp(pos.TotalMilliseconds * 100.0 / dur.TotalMilliseconds, 0, 100) : 0;
        _ovProgress.Foreground = playing ? Fluent.Success(((FrameworkElement)this).ActualTheme) : Fluent.TextTertiary(((FrameworkElement)this).ActualTheme);
    }

    internal void SetWidgetBackground(Brush brush) => _tile.ApplyTheme(((FrameworkElement)this).ActualTheme, brush);

    internal void Stop() => _progressTimer.Stop();

    // ---- Agent 数据 ----

    public string StateJson()
    {
        List<BtDevice> devices;
        lock (_lock) devices = new List<BtDevice>(_devices);
        var defId = Cfg("default_device_id");
        return JsonSerializer.Serialize(new
        {
            ok = true,
            connected = _isConnected,
            streaming = _streaming,
            connecting = _isConnecting,
            autoConnect = AutoConnectEnabled,
            activeDevice = _audio.ActiveDeviceId,
            deviceCount = devices.Count,
            devices = devices.Select(d => new
            {
                id = d.Id,
                name = d.Name,
                btConnected = d.IsConnected,
                isDefault = d.Id == defId,
                lastConnected = d.LastConnectedTime == default
                    ? null
                    : d.LastConnectedTime.ToString("yyyy-MM-dd HH:mm")
            })
        });
    }

    public string MediaInfoJson()
    {
        var (pos, dur, playing) = _media.GetTimeline();
        return JsonSerializer.Serialize(new
        {
            ok = true,
            smtcAvailable = _media.IsAvailable,
            hasMedia = _media.HasMedia,
            title = _media.Title,
            artist = _media.Artist,
            album = _media.Album,
            playbackStatus = _media.StatusText,
            playing,
            positionSeconds = (int)pos.TotalSeconds,
            durationSeconds = (int)dur.TotalSeconds
        });
    }

    public string Snapshot()
    {
        var name = ActiveDevice?.Name;
        var media = _streaming && _media.HasMedia ? $" 正在播放「{_media.Title}」" : "";
        return $"蓝牙音频: {StatusLabel()}" +
               (string.IsNullOrEmpty(name) ? "" : $" 设备「{name}」") + media;
    }
}
