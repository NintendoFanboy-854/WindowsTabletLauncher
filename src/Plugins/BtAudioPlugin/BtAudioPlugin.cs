using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;

namespace BtAudioPlugin;

public class BtAudioPlugin : IPlugin, IPluginSettings, IAgentCapability
{
    IHostHandle _host = null!;
    DispatcherQueue _dispatcher = null!;
    BtBluetoothService _bt = null!;
    BtAudioService _audio = null!;
    BtMediaService _media = null!;
    BtAudioWidget? _widget;

    public string DisplayName => "蓝牙音频";
    public string PluginId => nameof(BtAudioPlugin);

    public void Initialize(IHostHandle host)
    {
        _host = host;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
        _bt = new BtBluetoothService();
        _audio = new BtAudioService();
        _media = new BtMediaService();
        _ = _media.InitializeAsync();
        _bt.StartWatching();
        host.Log("BtAudio: services started");
    }

    public IReadOnlyList<IWidget> GetWidgets()
    {
        _widget ??= new BtAudioWidget(_host, _bt, _audio, _media);
        _widget.SetWidgetBackground((Brush)_host.GetWidgetBackgroundBrush());
        return new[] { new BtAudioWidgetInfo(_widget) };
    }

    public void Shutdown()
    {
        _widget?.Stop();
        _bt.Dispose();
        _audio.Dispose();
        _media.Dispose();
        _host.Log("BtAudio: shutdown");
    }

    Task<string> OnUi(Func<string> action)
    {
        var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);
        if (_dispatcher.HasThreadAccess)
        {
            try { tcs.SetResult(action()); } catch (Exception ex) { tcs.SetException(ex); }
        }
        else if (_dispatcher.TryEnqueue(() =>
        {
            try { tcs.SetResult(action()); } catch (Exception ex) { tcs.SetException(ex); }
        }))
        {
            // enqueued
        }
        else
        {
            tcs.TrySetResult(AgentJson.Error("dispatcher_unavailable"));
        }
        return tcs.Task;
    }

    Task<string> OnUiAsync(Func<Task<string>> action)
    {
        var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);
        void Run()
        {
            _ = action().ContinueWith(t =>
            {
                if (t.IsFaulted) tcs.TrySetException(t.Exception!);
                else tcs.TrySetResult(t.Result);
            }, TaskScheduler.Default);
        }
        if (_dispatcher.HasThreadAccess) Run();
        else if (_dispatcher.TryEnqueue(Run)) { }
        else tcs.TrySetResult(AgentJson.Error("dispatcher_unavailable"));
        return tcs.Task;
    }

    object IPluginSettings.CreateSettingsControl()
    {
        var panel = new StackPanel { Spacing = 12, Margin = new Thickness(0, 8, 0, 4) };

        var autoConnect = new ToggleSwitch
        {
            Header = "自动连接记忆设备",
            IsOn = (_host.GetConfig(PluginId, "auto_connect") ?? "true") != "false"
        };
        autoConnect.Toggled += (_, _) =>
            _host.SetConfig(PluginId, "auto_connect", autoConnect.IsOn ? "true" : "false");
        panel.Children.Add(autoConnect);

        var notify = new ToggleSwitch
        {
            Header = "连接成功通知",
            IsOn = (_host.GetConfig(PluginId, "notify") ?? "true") != "false"
        };
        notify.Toggled += (_, _) =>
            _host.SetConfig(PluginId, "notify", notify.IsOn ? "true" : "false");
        panel.Children.Add(notify);

        return panel;
    }

    void IPluginSettings.ResetConfig(IHostHandle host)
    {
        host.SetConfig(PluginId, "auto_connect", "true");
        host.SetConfig(PluginId, "notify", "true");
        host.SetConfig(PluginId, "default_device_id", "");
        host.SetConfig(PluginId, "default_device_name", "");
        host.SetConfig(PluginId, "last_device_id", "");
        host.SetConfig(PluginId, "last_device_name", "");
        host.SetConfig(PluginId, "device_last_connected", "");
    }

    IReadOnlyList<AgentTool> IAgentCapability.GetTools() => new[]
    {
        new AgentTool { Name = "query_bt_devices", Description = "获取蓝牙音频接收状态和可接收音频的蓝牙设备列表（含连接状态、默认设备、上次连接时间）。" },
        new AgentTool { Name = "bt_connect", Description = "连接指定蓝牙设备开始接收音频（A2DP Sink），本机变为蓝牙音箱；若当前已连接其它设备会自动断开后切换。名称仅支持精确匹配：若返回 device_not_found，响应中带有 devices 全量设备列表，请从中选出正确设备并用其 deviceId 重新调用。省略参数时连接默认/上次设备。", ParametersJsonSchema = """{"type":"object","properties":{"deviceId":{"type":"string"},"deviceName":{"type":"string"}}}""" },
        new AgentTool { Name = "bt_disconnect", Description = "断开当前蓝牙音频接收连接。" },
        new AgentTool { Name = "bt_media_info", Description = "获取当前系统媒体会话的播放曲目信息（标题/艺术家/专辑/播放状态/进度），蓝牙设备播放时即其曲目。" },
        new AgentTool { Name = "bt_media_control", Description = "控制当前媒体播放：play_pause / play / pause / next / previous。", ParametersJsonSchema = """{"type":"object","properties":{"action":{"type":"string","enum":["play_pause","play","pause","next","previous"]}},"required":["action"]}""" },
        new AgentTool { Name = "bt_toggle_bluetooth", Description = "开关系统蓝牙无线电。失败表示系统限制，需引导用户在系统设置中操作。", ParametersJsonSchema = """{"type":"object","properties":{"on":{"type":"boolean"}},"required":["on"]}""" },
        new AgentTool { Name = "bt_pair", Description = "按名称搜索未配对蓝牙设备并发起配对（最长等待 15 秒）。系统会弹出 PIN 确认窗口，需要用户确认；配对成功后自动开始音频接收连接。", ParametersJsonSchema = """{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}""" },
    };

    Task<string> IAgentCapability.InvokeAsync(string tool, string argumentsJson)
    {
        _host.Log($"BtAudio: agent invoke '{tool}' args={argumentsJson}");
        switch (tool)
        {
            case "query_bt_devices":
                return OnUi(() => _widget?.StateJson() ?? AgentJson.Error("not_ready"));

            case "bt_connect":
            {
                var deviceId = AgentJson.GetString(argumentsJson, "deviceId");
                var deviceName = AgentJson.GetString(argumentsJson, "deviceName");
                return OnUi(() => _widget?.ConnectViaAgent(deviceId, deviceName) ?? AgentJson.Error("not_ready"));
            }

            case "bt_disconnect":
                return OnUi(() => { _widget?.Disconnect(); return _widget?.StateJson() ?? AgentJson.Error("not_ready"); });

            case "bt_media_info":
                return OnUi(() => _widget?.MediaInfoJson() ?? AgentJson.Error("not_ready"));

            case "bt_media_control":
            {
                var action = AgentJson.GetString(argumentsJson, "action") ?? "play_pause";
                return OnUi(() =>
                {
                    if (_widget == null) return AgentJson.Error("not_ready");
                    var sent = _widget.SendMediaCommand(action);
                    return sent
                        ? AgentJson.Serialize(new { ok = true, action, media = _widget.MediaInfoJson() })
                        : AgentJson.Error("no_session_or_unknown_action");
                });
            }

            case "bt_toggle_bluetooth":
            {
                var on = AgentJson.GetBool(argumentsJson, "on") ?? true;
                return OnUiAsync(async () =>
                {
                    var ok = await _bt.SetBluetoothAsync(on);
                    return ok
                        ? AgentJson.Serialize(new { ok = true, bluetoothOn = on })
                        : AgentJson.Serialize(new { ok = false, error = "radio_access_denied", message = "无法控制系统蓝牙开关，请在系统设置中操作" });
                });
            }

            case "bt_pair":
            {
                var name = AgentJson.GetString(argumentsJson, "name");
                return OnUiAsync(async () =>
                    _widget != null
                        ? await _widget.PairViaAgent(name)
                        : AgentJson.Error("not_ready"));
            }

            default:
                return Task.FromResult(AgentJson.Error("unknown_tool"));
        }
    }

    string? IAgentCapability.GetContextSnapshot() => _widget?.Snapshot();

    class BtAudioWidgetInfo : IWidget
    {
        readonly BtAudioWidget _control;
        public BtAudioWidgetInfo(BtAudioWidget control) { _control = control; }
        public string Id => "btaudio.main";
        public int Columns => 2;
        public int Rows => 2;
        public WidgetBackdrop Backdrop => WidgetBackdrop.Acrylic;
        public object CreateControl() => _control;
    }
}
