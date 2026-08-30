using Windows.Devices.Bluetooth;
using Windows.Devices.Enumeration;
using Windows.Devices.Radios;
using Windows.Foundation;
using Windows.Media.Audio;

namespace BtAudioPlugin;

public class BtDevice
{
    public string Id = "";
    public string Name = "";
    public bool IsConnected;
    public DateTime LastConnectedTime;
}

/// <summary>
/// 蓝牙设备管理：A2DP 接收设备监听（AudioPlaybackConnection 选择器）、
/// 未配对设备发现、配对/取消配对、蓝牙无线电开关。
/// 事件在后台线程触发，订阅方需自行封送 UI 线程。
/// </summary>
public sealed class BtBluetoothService : IDisposable
{
    DeviceWatcher? _watcher;
    readonly Dictionary<string, BtDevice> _devices = new();
    readonly object _lock = new();

    DeviceWatcher? _discoveryWatcher;
    readonly Dictionary<string, DeviceInformation> _discovered = new();
    readonly object _discoveryLock = new();

    Radio? _radio;

    public event Action<BtDevice>? DeviceAdded;
    public event Action<string>? DeviceRemoved;
    public event Action? EnumerationCompleted;
    public event Action<string>? WatcherFailed;

    public event Action<DeviceInformation>? DiscoveryAdded;
    public event Action<string>? DiscoveryRemoved;
    public event Action? DiscoveryCompleted;

    public event Action? RadioChanged;

    public bool EnumerationDone { get; private set; }
    public bool IsWatching => _watcher != null;
    public bool IsDiscovering => _discoveryWatcher != null;

    public bool RadioAvailable => _radio != null;
    public bool BluetoothOn => _radio?.State == RadioState.On;

    // ---- 主列表：可接收音频的已配对设备 ----

    public List<BtDevice> GetDevices()
    {
        lock (_lock) return new List<BtDevice>(_devices.Values);
    }

    public BtDevice? Find(string id)
    {
        lock (_lock) return _devices.TryGetValue(id, out var d) ? d : null;
    }

    /// <summary>
    /// 一次性全量枚举可接收音频的设备（FindAllAsync 不受 watcher 缓存影响）。
    /// 新配对设备的音频端点注册可能有数秒延迟，调用方需自行重试。
    /// </summary>
    public async Task<List<BtDevice>> FindAllAudioDevicesAsync()
    {
        try
        {
            var coll = await DeviceInformation.FindAllAsync(
                AudioPlaybackConnection.GetDeviceSelector(),
                new[] { "System.Devices.Aep.IsConnected" });

            var list = new List<BtDevice>();
            foreach (var d in coll)
            {
                list.Add(new BtDevice
                {
                    Id = d.Id,
                    Name = string.IsNullOrEmpty(d.Name) ? "未知设备" : d.Name,
                    IsConnected = d.Properties.TryGetValue("System.Devices.Aep.IsConnected", out var c)
                                  && c is bool b && b
                });
            }

            lock (_lock)
            {
                foreach (var nd in list)
                {
                    if (_devices.TryGetValue(nd.Id, out var old)) nd.LastConnectedTime = old.LastConnectedTime;
                    _devices[nd.Id] = nd;
                }
            }
            return list;
        }
        catch
        {
            return new List<BtDevice>();
        }
    }

    public void StartWatching()
    {
        if (_watcher != null) return;

        string selector;
        try
        {
            selector = AudioPlaybackConnection.GetDeviceSelector();
        }
        catch (Exception ex)
        {
            EnumerationDone = true;
            WatcherFailed?.Invoke($"蓝牙不可用: {ex.Message}");
            return;
        }

        var watcher = DeviceInformation.CreateWatcher(
            selector,
            new[] { "System.Devices.Aep.IsConnected" },
            DeviceInformationKind.AssociationEndpoint);

        watcher.Added += OnDeviceAdded;
        watcher.Updated += OnDeviceUpdated;
        watcher.Removed += OnDeviceRemoved;
        watcher.EnumerationCompleted += OnEnumerationCompleted;

        try
        {
            watcher.Start();
            _watcher = watcher;
            EnumerationDone = false;
        }
        catch (Exception ex)
        {
            watcher.Added -= OnDeviceAdded;
            watcher.Updated -= OnDeviceUpdated;
            watcher.Removed -= OnDeviceRemoved;
            watcher.EnumerationCompleted -= OnEnumerationCompleted;
            EnumerationDone = true;
            WatcherFailed?.Invoke($"蓝牙扫描启动失败: {ex.Message}");
        }
    }

    public void StopWatching()
    {
        if (_watcher == null) return;
        _watcher.Added -= OnDeviceAdded;
        _watcher.Updated -= OnDeviceUpdated;
        _watcher.Removed -= OnDeviceRemoved;
        _watcher.EnumerationCompleted -= OnEnumerationCompleted;

        if (_watcher.Status == DeviceWatcherStatus.Started ||
            _watcher.Status == DeviceWatcherStatus.EnumerationCompleted)
        {
            try { _watcher.Stop(); } catch { }
        }
        _watcher = null;
        EnumerationDone = false;
    }

    void OnDeviceAdded(DeviceWatcher sender, DeviceInformation device)
    {
        var bt = new BtDevice
        {
            Id = device.Id,
            Name = string.IsNullOrEmpty(device.Name) ? "未知设备" : device.Name,
            IsConnected = device.Properties.TryGetValue("System.Devices.Aep.IsConnected", out var c)
                          && c is bool b && b
        };
        lock (_lock) _devices[device.Id] = bt;
        DeviceAdded?.Invoke(bt);
    }

    void OnDeviceUpdated(DeviceWatcher sender, DeviceInformationUpdate update)
    {
        BtDevice? device;
        lock (_lock)
        {
            if (!_devices.TryGetValue(update.Id, out device)) return;
        }
        if (update.Properties.TryGetValue("System.Devices.Aep.IsConnected", out var connected))
            device.IsConnected = connected is bool b && b;
        DeviceAdded?.Invoke(device);
    }

    void OnDeviceRemoved(DeviceWatcher sender, DeviceInformationUpdate update)
    {
        bool removed;
        lock (_lock) removed = _devices.Remove(update.Id);
        if (removed) DeviceRemoved?.Invoke(update.Id);
    }

    void OnEnumerationCompleted(DeviceWatcher sender, object args)
    {
        EnumerationDone = true;
        EnumerationCompleted?.Invoke();
    }

    // ---- 蓝牙无线电开关 ----

    public async Task InitRadioAsync()
    {
        try
        {
            var radios = await Radio.GetRadiosAsync();
            var bt = radios.FirstOrDefault(r => r.Kind == RadioKind.Bluetooth);
            if (bt == null) return;
            if (_radio != null) _radio.StateChanged -= OnRadioStateChanged;
            _radio = bt;
            _radio.StateChanged += OnRadioStateChanged;
            RadioChanged?.Invoke();
        }
        catch
        {
            _radio = null;
        }
    }

    void OnRadioStateChanged(Radio sender, object args) => RadioChanged?.Invoke();

    /// <returns>false 表示被系统拒绝（解包应用可能无 radios 权限），需回退到系统设置</returns>
    public async Task<bool> SetBluetoothAsync(bool on)
    {
        var radio = _radio;
        if (radio == null) return false;
        try
        {
            return await radio.SetStateAsync(on ? RadioState.On : RadioState.Off) == RadioAccessStatus.Allowed;
        }
        catch
        {
            return false;
        }
    }

    // ---- 发现未配对设备 ----

    public void StartDiscovery()
    {
        if (_discoveryWatcher != null) return;
        lock (_discoveryLock) _discovered.Clear();

        string selector;
        try
        {
            selector = BluetoothDevice.GetDeviceSelectorFromPairingState(false);
        }
        catch
        {
            DiscoveryCompleted?.Invoke();
            return;
        }

        var watcher = DeviceInformation.CreateWatcher(
            selector,
            new[] { "System.Devices.Aep.CanPair" });
        watcher.Added += OnDiscoveryWatcherAdded;
        watcher.Removed += OnDiscoveryWatcherRemoved;
        watcher.EnumerationCompleted += OnDiscoveryWatcherCompleted;

        try
        {
            watcher.Start();
            _discoveryWatcher = watcher;
        }
        catch
        {
            watcher.Added -= OnDiscoveryWatcherAdded;
            watcher.Removed -= OnDiscoveryWatcherRemoved;
            watcher.EnumerationCompleted -= OnDiscoveryWatcherCompleted;
            DiscoveryCompleted?.Invoke();
        }
    }

    public void StopDiscovery()
    {
        if (_discoveryWatcher == null) return;
        _discoveryWatcher.Added -= OnDiscoveryWatcherAdded;
        _discoveryWatcher.Removed -= OnDiscoveryWatcherRemoved;
        _discoveryWatcher.EnumerationCompleted -= OnDiscoveryWatcherCompleted;

        if (_discoveryWatcher.Status == DeviceWatcherStatus.Started ||
            _discoveryWatcher.Status == DeviceWatcherStatus.EnumerationCompleted)
        {
            try { _discoveryWatcher.Stop(); } catch { }
        }
        _discoveryWatcher = null;
        lock (_discoveryLock) _discovered.Clear();
    }

    public List<(string Id, string Name)> GetDiscovered()
    {
        lock (_discoveryLock)
        {
            return _discovered.Values
                .Select(d => (d.Id, string.IsNullOrEmpty(d.Name) ? "未知设备" : d.Name))
                .ToList();
        }
    }

    void OnDiscoveryWatcherAdded(DeviceWatcher sender, DeviceInformation device)
    {
        lock (_discoveryLock) _discovered[device.Id] = device;
        DiscoveryAdded?.Invoke(device);
    }

    void OnDiscoveryWatcherRemoved(DeviceWatcher sender, DeviceInformationUpdate update)
    {
        bool removed;
        lock (_discoveryLock) removed = _discovered.Remove(update.Id);
        if (removed) DiscoveryRemoved?.Invoke(update.Id);
    }

    void OnDiscoveryWatcherCompleted(DeviceWatcher sender, object args)
        => DiscoveryCompleted?.Invoke();

    // ---- 配对 / 取消配对 ----

    /// <summary>数字比对仪式（阻塞调用）：返回 true 表示用户确认双方配对码一致。</summary>
    public event Func<string, bool>? ConfirmPinRequested;

    /// <summary>PIN 仪式（阻塞调用）：返回本机生成的 PIN（显示给用户输入到手机），null 表示取消。</summary>
    public event Func<string?>? ProvidePinRequested;

    /// <summary>
    /// 配对指定设备。第一轮 ConfirmOnly+Medium（同步 Accept，适配多数设备）；
    /// 失败则第二轮完整仪式（数字比对/PIN 输入，阻塞等待 UI 决定）。
    /// PairingRequested 的 Accept 必须在 handler 内同步调用，否则系统按 RejectedByHandler 裁决。
    /// </summary>
    public async Task<(bool ok, string message)> PairAsync(string deviceId)
    {
        try
        {
            for (int attempt = 1; ; attempt++)
            {
                DeviceInformation info;
                try
                {
                    info = await DeviceInformation.CreateFromIdAsync(deviceId);
                }
                catch
                {
                    return (false, "无法获取设备信息，设备可能已离开");
                }

                var pairing = info.Pairing;
                if (pairing == null) return (false, "该设备不支持配对");
                if (pairing.IsPaired) return (true, "设备已配对");

                if (!pairing.CanPair && attempt < 2)
                {
                    await Task.Delay(800);
                    continue;
                }

                var custom = pairing.Custom;

                var result = await RunCeremony(custom,
                    DevicePairingKinds.ConfirmOnly,
                    DevicePairingProtectionLevel.Default,
                    advanced: false);

                if (result.Status is DevicePairingResultStatus.Paired or DevicePairingResultStatus.AlreadyPaired)
                    return (true, result.Status == DevicePairingResultStatus.AlreadyPaired ? "设备已配对" : "配对成功");

                result = await RunCeremony(custom,
                    DevicePairingKinds.ConfirmOnly |
                    DevicePairingKinds.ConfirmPinMatch |
                    DevicePairingKinds.ProvidePin,
                    DevicePairingProtectionLevel.Default,
                    advanced: true);

                if (result.Status is DevicePairingResultStatus.Paired or DevicePairingResultStatus.AlreadyPaired)
                    return (true, result.Status == DevicePairingResultStatus.AlreadyPaired ? "设备已配对" : "配对成功");

                if (result.Status == DevicePairingResultStatus.NotReadyToPair && attempt < 2)
                {
                    await Task.Delay(800);
                    continue;
                }
                return (false, MapPairFailure(result.Status));
            }
        }
        catch (Exception ex)
        {
            return (false, $"配对异常: {ex.Message}");
        }
    }

    async Task<DevicePairingResult> RunCeremony(
        DeviceInformationCustomPairing custom,
        DevicePairingKinds kinds,
        DevicePairingProtectionLevel level,
        bool advanced)
    {
        void Handler(DeviceInformationCustomPairing sender, DevicePairingRequestedEventArgs a)
        {
            switch (a.PairingKind)
            {
                case DevicePairingKinds.ConfirmPinMatch when advanced:
                {
                    var handler = ConfirmPinRequested;
                    var ok = handler == null || handler(a.Pin ?? "");
                    if (ok) a.Accept();
                    break;
                }
                case DevicePairingKinds.ProvidePin when advanced:
                {
                    var handler = ProvidePinRequested;
                    var pin = handler?.Invoke();
                    if (!string.IsNullOrEmpty(pin)) a.Accept(pin);
                    break;
                }
                default:
                    a.Accept();
                    break;
            }
        }

        custom.PairingRequested += Handler;
        try
        {
            return await custom.PairAsync(kinds, level);
        }
        finally
        {
            custom.PairingRequested -= Handler;
        }
    }

    static string MapPairFailure(DevicePairingResultStatus status) => status switch
    {
        DevicePairingResultStatus.ConnectionRejected => "设备拒绝了配对",
        DevicePairingResultStatus.PairingCanceled => "配对已取消",
        DevicePairingResultStatus.AuthenticationFailure => "PIN 校验失败",
        DevicePairingResultStatus.AuthenticationTimeout => "配对确认超时",
        DevicePairingResultStatus.AccessDenied => "系统拒绝了配对请求",
        DevicePairingResultStatus.OperationAlreadyInProgress => "已有配对操作进行中，请稍后再试",
        DevicePairingResultStatus.TooManyConnections => "设备连接数已达上限",
        DevicePairingResultStatus.RemoteDeviceHasAssociation => "设备已与其它主机关联",
        DevicePairingResultStatus.ProtectionLevelCouldNotBeMet => "安全级别不满足要求",
        DevicePairingResultStatus.RejectedByHandler => "配对被系统处理程序拒绝",
        DevicePairingResultStatus.Failed => "配对失败，请重试并留意手机上的确认弹窗",
        _ => $"配对失败 ({status})"
    };

    public static async Task<(bool ok, string message)> UnpairAsync(string deviceId)
    {
        try
        {
            var info = await DeviceInformation.CreateFromIdAsync(deviceId);
            var pairing = info.Pairing;
            if (pairing == null || !pairing.IsPaired) return (true, "设备未配对");

            var result = await pairing.UnpairAsync();
            return result.Status switch
            {
                DeviceUnpairingResultStatus.Unpaired => (true, "已取消配对"),
                DeviceUnpairingResultStatus.AlreadyUnpaired => (true, "设备已取消配对"),
                DeviceUnpairingResultStatus.AccessDenied => (false, "取消配对被系统拒绝"),
                _ => (false, $"取消配对失败 ({result.Status})")
            };
        }
        catch (Exception ex)
        {
            return (false, $"取消配对异常: {ex.Message}");
        }
    }

    /// <summary>按名称扫描未配对设备（agent 工具专用，独立 watcher，不触发 UI 事件）。</summary>
    public async Task<(DeviceInformation? device, string error)> ScanAndFindAsync(string nameContains, int timeoutMs)
    {
        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        DeviceInformation? match = null;
        DeviceWatcher watcher;
        try
        {
            watcher = DeviceInformation.CreateWatcher(BluetoothDevice.GetDeviceSelectorFromPairingState(false));
        }
        catch
        {
            return (null, "蓝牙扫描不可用");
        }

        TypedEventHandler<DeviceWatcher, DeviceInformation> added = (s, info) =>
        {
            if (match == null && !string.IsNullOrEmpty(info.Name) &&
                info.Name.Contains(nameContains, StringComparison.OrdinalIgnoreCase))
            {
                match = info;
            }
        };
        TypedEventHandler<DeviceWatcher, object> completed = (s, a) => tcs.TrySetResult(true);
        watcher.Added += added;
        watcher.EnumerationCompleted += completed;

        try
        {
            watcher.Start();
        }
        catch
        {
            return (null, "蓝牙扫描启动失败");
        }

        await Task.WhenAny(tcs.Task, Task.Delay(timeoutMs));

        watcher.Added -= added;
        watcher.EnumerationCompleted -= completed;
        try
        {
            if (watcher.Status == DeviceWatcherStatus.Started ||
                watcher.Status == DeviceWatcherStatus.EnumerationCompleted)
            {
                watcher.Stop();
            }
        }
        catch { }

        return match != null
            ? (match, "")
            : (null, "未找到该设备，请确认设备已进入配对模式且名称匹配");
    }

    public void Dispose()
    {
        StopWatching();
        StopDiscovery();
        if (_radio != null)
        {
            try { _radio.StateChanged -= OnRadioStateChanged; } catch { }
        }
        lock (_lock) _devices.Clear();
        lock (_discoveryLock) _discovered.Clear();
    }
}
