using Microsoft.UI.Composition;
using Microsoft.UI.Composition.SystemBackdrops;
using Microsoft.UI.Dispatching;
using Microsoft.UI.Input;
using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Hosting;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Media.Animation;
using System.Text.Json;
using Windows.Foundation;
using PluginContract;
using WinRT;
using LauncherHost.Controls;
using LauncherHost.Core;
using LauncherHost.Core.Agent;
using LauncherHost.Services;

namespace LauncherHost;

public sealed partial class MainWindow : Window
{
    DesktopAcrylicController? _acrylicController;
    SystemBackdropConfiguration? _configurationSource;
    LocalizationService _loc = null!;
    ConfigStore _config = null!;
    HostHandle _hostHandle = null!;
    AcrylicBrushProvider _acrylicProvider = null!;
    DashboardPage? _dashboard;
    AgentService? _agentService;
    AgentSession? _agentSession;
    VoiceSession? _voiceSession;
    MemoryStore? _agentMemory;
    List<IPlugin> _plugins = new();
    List<PluginContract.IPluginSettings> _pluginSettings = new();
    bool _editMode;
    const double Pad = 32;
    const double PagerReserve = 56;
    const string LayoutStore = "layout";
    const string SettingsWidgetId = "host.settings";
    const string LayoutSchema = "3";
    bool _restorePositions;
    FrameworkElement? _dragTarget;
    int _dragOrigCol, _dragOrigRow, _dragOrigColSpan, _dragOrigRowSpan;
    DesktopPage? _dragOrigPage;
    double _dragTotalX, _dragTotalY;
    FrameworkElement? _settingsTile;
    readonly List<DesktopPage> _pages = new();
    readonly Dictionary<FrameworkElement, DesktopPage> _elementPage = new();
    readonly Dictionary<FrameworkElement, string> _elementIds = new();
    readonly Dictionary<FrameworkElement, Action> _tapActions = new();
    readonly Dictionary<string, List<WidgetSlot>> _pluginWidgets = new();

    readonly Queue<(string title, string message, bool escalate)> _notifQueue = new();
    Popup? _notifPopup;
    DispatcherQueueTimer? _notifTimer;
    bool _notifActive;

    sealed class WidgetSlot
    {
        public required IWidget Widget { get; init; }
        public FrameworkElement? Element { get; set; }
    }

    public MainWindow()
    {
        try
        {
            InitializeComponent();

            LogService.Info("MainWindow initializing");

            _acrylicProvider = new AcrylicBrushProvider();
            _config = new ConfigStore();
            _loc = new LocalizationService(_config.Get("host", "language") ?? "zh-cn");
            _hostHandle = new HostHandle(_loc, _acrylicProvider, _config);

            SetupWindow();
            SetupAcrylicBackdrop();
            _hostHandle.NotificationRequested += OnNotificationRequested;
            _hostHandle.LiveTheme = () => ((FrameworkElement)Content).ActualTheme;
            _dashboard = new DashboardPage(_hostHandle);
            _agentService = new AgentService(_hostHandle);

            Pager.SelectionChanged += (_, _) =>
            {
                if (Pips.SelectedPageIndex != Pager.SelectedIndex)
                    Pips.SelectedPageIndex = Pager.SelectedIndex;
            };
            Pips.SelectedIndexChanged += (_, _) =>
            {
                if (Pager.SelectedIndex != Pips.SelectedPageIndex)
                    Pager.SelectedIndex = Pips.SelectedPageIndex;
            };

            ((FrameworkElement)Content).Loaded += (_, _) =>
            {
                ApplyStoredTheme();
                LogService.Info("Loading plugins");
                LoadPlugins();
                _agentService!.RefreshTools();

                _agentSession = new AgentSession(_agentService, (Grid)Content);

                _voiceSession = new VoiceSession(_agentService, DispatcherQueue, _agentSession);
                var micBgBrush = new SolidColorBrush(Windows.UI.Color.FromArgb(0x40, 0x60, 0xA0, 0xFF));
                _voiceSession.OnStateChanged += state =>
                {
                    LogService.Info($"[MainWindow] voice state → {state}");
                    if (state == VoiceState.Recording)
                        MicBtn.Background = micBgBrush;
                    else
                        MicBtn.ClearValue(Button.BackgroundProperty);
                };

                MicBtn.Click += (_, _) =>
                {
                    LogService.Info($"[MainWindow] mic clicked, voiceState={_voiceSession.State}");
                    _voiceSession.Toggle();
                };

                AgentInput.PlaceholderText = _hostHandle.Translate("agent.placeholder");
                AgentSendBtn.Content = _hostHandle.Translate("agent.send");

                AgentSendBtn.Click += (_, _) =>
                {
                    var text = AgentInput.Text.Trim();
                    if (string.IsNullOrEmpty(text)) return;
                    AgentInput.Text = "";
                    _agentSession!.Send(text, (FrameworkElement)Content);
                };

                AgentInput.KeyDown += (_, e) =>
                {
                    if (e.Key == Windows.System.VirtualKey.Enter)
                    {
                        var text = AgentInput.Text.Trim();
                        if (string.IsNullOrEmpty(text)) return;
                        AgentInput.Text = "";
                        _agentSession!.Send(text, (FrameworkElement)Content);
                    }
                };

                RelayoutGrid();
                LogService.Info("MainWindow initialized successfully");
            };

            ((FrameworkElement)Content).SizeChanged += (_, _) => RelayoutGrid();
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "MainWindow initialization failed");
            throw;
        }
    }

    (double w, double h) Avail()
    {
        var content = (FrameworkElement)Content;
        return (content.ActualWidth - Pad * 2, content.ActualHeight - Pad - PagerReserve);
    }

    void ApplyGeometry(DesktopPage page)
    {
        var (availW, availH) = Avail();
        if (availW <= 0 || availH <= 0) return;

        page.Layout.Recalculate(availW, availH);
        var left = Pad + (availW - page.Layout.GridWidth) / 2;
        var top = Pad + (availH - page.Layout.GridHeight) / 2;
        page.WidgetGrid.Margin = new Thickness(left, top, 0, 0);
        page.Overlay.Margin = new Thickness(left, top, 0, 0);
    }

    void RelayoutGrid(bool reflow = true)
    {
        if (_dragTarget != null) return;
        var (availW, availH) = Avail();
        if (availW <= 0 || availH <= 0) return;

        foreach (var page in _pages)
        {
            ApplyGeometry(page);
            if (reflow)
            {
                page.Layout.Reflow();
                page.Layout.ReapplyMargins();
            }
            page.Layout.DrawGridOverlay(page.Overlay, _editMode);
            page.Overlay.Visibility = _editMode ? Visibility.Visible : Visibility.Collapsed;
        }
    }

    // ---- page management ----

    DesktopPage AddPage()
    {
        var page = new DesktopPage();
        _pages.Add(page);
        Pager.Items.Add(page.Root);
        Pips.NumberOfPages = _pages.Count;
        ApplyGeometry(page);
        return page;
    }

    DesktopPage GetOrCreatePage(int index)
    {
        var idx = Math.Clamp(index, 0, int.MaxValue);
        while (_pages.Count <= idx) AddPage();
        return _pages[idx];
    }

    int PageIndexOf(FrameworkElement fe)
        => _elementPage.TryGetValue(fe, out var p) ? _pages.IndexOf(p) : 0;

    DesktopPage PageOf(FrameworkElement fe)
        => _elementPage.TryGetValue(fe, out var p) ? p : _pages[0];

    FrameworkElement? ContentOf(FrameworkElement fe)
        => _elementPage.TryGetValue(fe, out var p) ? p.Layout.GetContent(fe) : null;

    void SetupWindow()
    {
        var presenter = AppWindow.Presenter as OverlappedPresenter
            ?? throw new InvalidOperationException("OverlappedPresenter not available");

        presenter.SetBorderAndTitleBar(false, false);
        presenter.IsMaximizable = false;
        presenter.IsMinimizable = false;
        presenter.IsResizable = false;

        AppWindow.TitleBar.ExtendsContentIntoTitleBar = true;
        AppWindow.TitleBar.PreferredHeightOption = TitleBarHeightOption.Collapsed;

        AppWindow.SetIcon("Assets/AppIcon.ico");
        AppWindow.SetPresenter(AppWindowPresenterKind.FullScreen);

        LogService.Info("Window setup complete");
    }

    void SetupAcrylicBackdrop()
    {
        if (!DesktopAcrylicController.IsSupported())
        {
            LogService.Warn("DesktopAcrylicController not supported");
            return;
        }

        DispatcherQueue.EnsureSystemDispatcherQueue();

        _configurationSource = new SystemBackdropConfiguration { IsInputActive = true };
        Activated += OnActivated;
        Closed += OnClosed;
        ((FrameworkElement)Content).ActualThemeChanged += OnThemeChanged;

        ApplyTheme();

        ApplyBackdropController();

        LogService.Info("Backdrop set up");
    }

    void ApplyBackdropController()
    {
        _acrylicController?.Dispose();
        _acrylicController = null;

        _acrylicController = new DesktopAcrylicController { Kind = DesktopAcrylicKind.Thin };
        _acrylicController.AddSystemBackdropTarget(
            this.As<ICompositionSupportsSystemBackdrop>());
        _acrylicController.SetSystemBackdropConfiguration(_configurationSource!);
        LogService.Info("Backdrop: Acrylic Thin");
    }

    void ApplyStoredTheme()
    {
        var stored = _config.Get("host", "theme") ?? "Default";
        ((FrameworkElement)Content).RequestedTheme = stored switch
        {
            "Light" => ElementTheme.Light,
            "Dark" => ElementTheme.Dark,
            _ => ElementTheme.Default
        };
    }

    void LoadPlugins()
    {
        _restorePositions = _config.Get(LayoutStore, "schema") == LayoutSchema;

        GetOrCreatePage(0);
        AddSettingsTile();

        var pluginsDir = "Plugins";
        var result = PluginLoader.LoadAll(pluginsDir, _hostHandle);

        foreach (var error in result.Errors)
            LogService.Error(error);

        _plugins = result.Plugins;
        _pluginSettings = result.Settings;

        if (_plugins.Count == 0)
        {
            LogService.Warn("No plugins loaded");
            return;
        }

        foreach (var plugin in _plugins)
        {
            var typeName = plugin.GetType().Name;
            var slots = new List<WidgetSlot>();
            foreach (var widget in plugin.GetWidgets())
                slots.Add(new WidgetSlot { Widget = widget });
            _pluginWidgets[typeName] = slots;

            if (IsPluginEnabled(typeName))
                ShowPlugin(typeName);
        }

        _config.Set(LayoutStore, "schema", LayoutSchema);
        _restorePositions = true;

        RegisterHostAgent();
    }

    void RegisterHostAgent()
    {
        var tools = new List<AgentTool>
        {
            new() { Name = "list_plugins", Description = "列出所有已加载插件及其启用状态。" },
            new()
            {
                Name = "set_theme",
                Description = "设置界面主题。",
                ParametersJsonSchema = """{"type":"object","properties":{"theme":{"type":"string","enum":["default","light","dark"]}},"required":["theme"]}"""
            },
            new()
            {
                Name = "set_language",
                Description = "设置界面语言。",
                ParametersJsonSchema = """{"type":"object","properties":{"language":{"type":"string","enum":["zh-cn","en-us"]}},"required":["language"]}"""
            },
            new()
            {
                Name = "set_edit_mode",
                Description = "开启或关闭桌面编辑模式。",
                ParametersJsonSchema = """{"type":"object","properties":{"enabled":{"type":"boolean"}},"required":["enabled"]}"""
            },
            new()
            {
                Name = "enable_plugin",
                Description = "按插件名称启用某个插件（显示其小组件）。",
                ParametersJsonSchema = """{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}"""
            },
            new()
            {
                Name = "disable_plugin",
                Description = "按插件名称停用某个插件（隐藏其小组件）。",
                ParametersJsonSchema = """{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}"""
            },
            new()
            {
                Name = "set_notify_seconds",
                Description = "设置通知横幅升级为全屏强制提醒前的等待秒数。",
                ParametersJsonSchema = """{"type":"object","properties":{"seconds":{"type":"integer","minimum":1}},"required":["seconds"]}"""
            },
            new()
            {
                Name = "query_dashboard",
                Description = "获取数据复盘综合统计：番茄数、待办数、久坐数据汇总。"
            },
            new()
            {
                Name = "set_memory",
                Description = "写入一条持久记忆（key-value）。用户要求记住信息时使用。",
                ParametersJsonSchema = """{"type":"object","properties":{"key":{"type":"string"},"value":{"type":"string"}},"required":["key","value"]}"""
            },
            new()
            {
                Name = "get_memory",
                Description = "获取全部持久记忆。"
            },
            new()
            {
                Name = "clear_memory",
                Description = "清空全部持久记忆。"
            },
            new()
            {
                Name = "set_expand_cot",
                Description = "展开/折叠思维链与工具调用。",
                ParametersJsonSchema = """{"type":"object","properties":{"enabled":{"type":"boolean"}},"required":["enabled"]}"""
            },
            new()
            {
                Name = "exit_launcher",
                Description = "退出启动器（需用户在弹窗确认）。"
            },
        };

        var handlers = new Dictionary<string, Func<string, string>>
        {
            ["list_plugins"] = _ =>
            {
                var list = _plugins.Select(p => new
                {
                    name = p.DisplayName,
                    id = p.GetType().Name,
                    enabled = IsPluginEnabled(p.GetType().Name)
                });
                return JsonSerializer.Serialize(new { ok = true, plugins = list });
            },
            ["set_theme"] = args =>
            {
                var theme = HostJson.Str(args, "theme") ?? "default";
                var value = theme.ToLowerInvariant() switch
                {
                    "light" => "Light",
                    "dark" => "Dark",
                    _ => "Default"
                };
                _config.Set("host", "theme", value);
                ApplyStoredTheme();
                return JsonSerializer.Serialize(new { ok = true, theme = value });
            },
            ["set_language"] = args =>
            {
                var lang = HostJson.Str(args, "language") ?? "zh-cn";
                _config.Set("host", "language", lang);
                _loc.SetCulture(lang);
                return JsonSerializer.Serialize(new { ok = true, language = lang });
            },
            ["set_edit_mode"] = args =>
            {
                var on = HostJson.Bool(args, "enabled") ?? false;
                _editMode = on;
                SetEditMode(on);
                return JsonSerializer.Serialize(new { ok = true, editMode = on });
            },
            ["enable_plugin"] = args => TogglePluginByName(HostJson.Str(args, "name"), true),
            ["disable_plugin"] = args => TogglePluginByName(HostJson.Str(args, "name"), false),
            ["set_notify_seconds"] = args =>
            {
                var s = HostJson.Int(args, "seconds");
                if (s is not > 0) return "{\"ok\":false,\"error\":\"invalid_seconds\"}";
                _config.Set("host", "notify_escalate_seconds", s.Value.ToString());
                return JsonSerializer.Serialize(new { ok = true, seconds = s.Value });
            },
            ["query_dashboard"] = _ => BuildDashboardJson(),
            ["set_memory"] = args =>
            {
                var key = HostJson.Str(args, "key");
                var value = HostJson.Str(args, "value");
                if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(value))
                    return "{\"ok\":false,\"error\":\"key_value_required\"}";
                _agentMemory ??= new MemoryStore();
                _agentMemory.SetFact(key, value);
                return JsonSerializer.Serialize(new { ok = true });
            },
            ["get_memory"] = args =>
            {
                _agentMemory ??= new MemoryStore();
                return JsonSerializer.Serialize(new { ok = true, memories = _agentMemory.Facts.Select(f => new { key = f.Key, value = f.Value }) });
            },
            ["clear_memory"] = args =>
            {
                _agentMemory ??= new MemoryStore();
                _agentMemory.Clear();
                return JsonSerializer.Serialize(new { ok = true });
            },
            ["set_expand_cot"] = args =>
            {
                var on = HostJson.Bool(args, "enabled") ?? false;
                _config.Set("host", "agent_expand_cot", on ? "true" : "false");
                _agentService!.NotifyExpandCotChanged();
                return JsonSerializer.Serialize(new { ok = true, expandCot = on });
            },
            ["exit_launcher"] = args =>
            {
                _ = ExitLauncherAsync();
                return JsonSerializer.Serialize(new { ok = true, message = "exit_dialog_shown" });
            },
        };

        _hostHandle.RegisterAgentCapability(new HostAgentCapability(DispatcherQueue, tools, handlers));
    }

    async Task ExitLauncherAsync()
    {
        var confirm = new ContentDialog
        {
            Title = "确认退出",
            Content = "确定要退出启动器吗？",
            PrimaryButtonText = "退出",
            CloseButtonText = "取消",
            DefaultButton = ContentDialogButton.Close,
            XamlRoot = Content.XamlRoot
        };
        var result = await confirm.ShowAsync();
        if (result == ContentDialogResult.Primary)
            Application.Current.Exit();
    }

    string BuildDashboardJson()
    {
        var all = _hostHandle.GetAllConfigs("");
        var pmStats = all.FirstOrDefault(c => c.pluginId == "PomodoroPlugin" && c.key == "stats").value;
        var todoItems = all.FirstOrDefault(c => c.pluginId == "TodoPlugin" && c.key == "items").value;
        var sedHistory = all.FirstOrDefault(c => c.pluginId == "SedentaryPlugin" && c.key == "history").value;

        var pData = new Dictionary<string, int>();
        if (!string.IsNullOrWhiteSpace(pmStats)) { try { pData = JsonSerializer.Deserialize<Dictionary<string, int>>(pmStats) ?? new(); } catch { } }
        var todayKey = DateTime.Today.ToString("yyyy-MM-dd");
        var pmToday = pData.TryGetValue(todayKey, out var pc) ? pc : 0;
        var pmTotal = pData.Values.Sum();

        int todoTotal = 0, todoDone = 0, todoOverdue = 0;
        if (!string.IsNullOrWhiteSpace(todoItems))
        {
            try
            {
                var items = JsonSerializer.Deserialize<List<JsonElement>>(todoItems);
                if (items != null)
                {
                    todoTotal = items.Count;
                    todoDone = items.Count(i => i.TryGetProperty("Done", out var d) && d.GetBoolean());
                    foreach (var i in items)
                    {
                        if (i.TryGetProperty("Done", out var d) && d.GetBoolean()) continue;
                        if (i.TryGetProperty("Deadline", out var dl) && dl.ValueKind == JsonValueKind.String && DateTime.TryParse(dl.GetString(), out var dd) && dd < DateTime.Now)
                            todoOverdue++;
                    }
                }
            }
            catch { }
        }

        int sedToday = 0, sedTotal = 0;
        if (!string.IsNullOrWhiteSpace(sedHistory))
        {
            try
            {
                var hist = JsonSerializer.Deserialize<Dictionary<string, int>>(sedHistory) ?? new();
                sedToday = hist.TryGetValue(todayKey, out var sm) ? sm : 0;
                sedTotal = hist.Values.Sum();
            }
            catch { }
        }

        return JsonSerializer.Serialize(new
        {
            ok = true,
            pomodoro = new { today = pmToday, total = pmTotal },
            todo = new { total = todoTotal, done = todoDone, overdue = todoOverdue },
            sedentary = new { today_minutes = sedToday, total_minutes = sedTotal }
        });
    }

    string TogglePluginByName(string? name, bool enable)
    {
        if (string.IsNullOrWhiteSpace(name)) return "{\"ok\":false,\"error\":\"name_required\"}";
        var plugin = _plugins.FirstOrDefault(p =>
            p.DisplayName == name || p.GetType().Name.Equals(name, StringComparison.OrdinalIgnoreCase));
        if (plugin == null) return "{\"ok\":false,\"error\":\"plugin_not_found\"}";

        var typeName = plugin.GetType().Name;
        if (enable) ShowPlugin(typeName); else HidePlugin(typeName);
        return JsonSerializer.Serialize(new { ok = true, name = plugin.DisplayName, enabled = enable });
    }

    static class HostJson
    {
        public static string? Str(string json, string key)
        {
            try
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.ValueKind == JsonValueKind.Object && doc.RootElement.TryGetProperty(key, out var v))
                    return v.ValueKind == JsonValueKind.String ? v.GetString() : v.ToString();
            }
            catch { }
            return null;
        }

        public static int? Int(string json, string key)
        {
            try
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.ValueKind == JsonValueKind.Object && doc.RootElement.TryGetProperty(key, out var v))
                {
                    if (v.ValueKind == JsonValueKind.Number && v.TryGetInt32(out var n)) return n;
                    if (v.ValueKind == JsonValueKind.String && int.TryParse(v.GetString(), out var s)) return s;
                }
            }
            catch { }
            return null;
        }

        public static bool? Bool(string json, string key)
        {
            try
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.ValueKind == JsonValueKind.Object && doc.RootElement.TryGetProperty(key, out var v))
                {
                    if (v.ValueKind == JsonValueKind.True) return true;
                    if (v.ValueKind == JsonValueKind.False) return false;
                    if (v.ValueKind == JsonValueKind.String && bool.TryParse(v.GetString(), out var b)) return b;
                }
            }
            catch { }
            return null;
        }
    }

    void AddSettingsTile()
    {
        var button = new Button
        {
            HorizontalAlignment = HorizontalAlignment.Stretch,
            VerticalAlignment = VerticalAlignment.Stretch,
            Background = (Brush)_hostHandle.GetWidgetBackgroundBrush(),
            Content = new FontIcon { Glyph = "\uE713", FontSize = 28 }
        };
        button.Click += OnSettingsClick;

        var configuredPage = int.TryParse(_config.Get(LayoutStore, "page.host.settings"), out var cp) ? cp : 0;
        var pos = ReadSavedPosition(SettingsWidgetId);
        var pageIdx = pos?.page ?? Math.Max(0, configuredPage);
        var page = GetOrCreatePage(pageIdx);
        var defaultCol = Math.Max(0, page.Layout.SubColumns - 1);
        var container = page.Layout.AddElement(button, 1, 1, pos?.col ?? defaultCol, pos?.row ?? 0);
        _settingsTile = container;
        _elementPage[container] = page;
        _elementIds[container] = SettingsWidgetId;
        _tapActions[container] = OpenSettings;
        RegisterElement(container);
    }

    bool IsPluginEnabled(string typeName)
        => (_config.Get(LayoutStore, $"enabled.{typeName}") ?? "true") == "true";

    void ShowPlugin(string typeName)
    {
        if (_pluginWidgets.TryGetValue(typeName, out var slots))
        {
            foreach (var slot in slots)
            {
                var pos = ReadSavedPosition(slot.Widget.Id);
                var configuredPage = int.TryParse(_config.Get(LayoutStore, $"page.{typeName}"), out var cp) ? cp : -1;
                var pageIdx = configuredPage >= 0 ? configuredPage : (pos?.page ?? (slot.Element != null ? PageIndexOf(slot.Element) : 0));
                var page = GetOrCreatePage(pageIdx);

                if (slot.Element == null)
                {
                    slot.Element = page.Layout.AddWidget(slot.Widget, pos?.col, pos?.row);
                    _elementIds[slot.Element] = slot.Widget.Id;
                }
                else
                {
                    page.Layout.ShowElement(slot.Element, pos?.col, pos?.row);
                }
                _elementPage[slot.Element] = page;
                RegisterElement(slot.Element);
            }
        }
        _config.Set(LayoutStore, $"enabled.{typeName}", "true");
        LogService.Info($"ShowPlugin: {typeName}");
    }

    void HidePlugin(string typeName)
    {
        if (_pluginWidgets.TryGetValue(typeName, out var slots))
        {
            foreach (var slot in slots)
            {
                if (slot.Element == null) continue;
                UnregisterElement(slot.Element);
                PageOf(slot.Element).Layout.HideElement(slot.Element);
                _elementPage.Remove(slot.Element);
                _elementIds.Remove(slot.Element);
                _tapActions.Remove(slot.Element);
            }
        }
        _config.Set(LayoutStore, $"enabled.{typeName}", "false");
        LogService.Info($"HidePlugin: {typeName}");
    }

    (int page, int col, int row)? ReadSavedPosition(string id)
    {
        if (!_restorePositions) return null;
        var raw = _config.Get(LayoutStore, id);
        if (raw == null) return null;
        var parts = raw.Split(',');
        if (parts.Length == 3 &&
            int.TryParse(parts[0], out var page) &&
            int.TryParse(parts[1], out var col) &&
            int.TryParse(parts[2], out var row))
            return (page, col, row);
        return null;
    }

    void PersistPosition(FrameworkElement fe)
    {
        if (_elementIds.TryGetValue(fe, out var id))
            _config.Set(LayoutStore, id, $"{PageIndexOf(fe)},{Grid.GetColumn(fe)},{Grid.GetRow(fe)}");
    }

    void RegisterElement(FrameworkElement fe)
    {
        fe.PointerEntered += OnWidgetPointerEntered;
        fe.PointerExited += OnWidgetPointerExited;

        var content = ContentOf(fe);
        if (content != null)
            content.IsHitTestVisible = !_editMode;

        EnableDrag(fe, _editMode);
    }

    void UnregisterElement(FrameworkElement fe)
    {
        fe.PointerEntered -= OnWidgetPointerEntered;
        fe.PointerExited -= OnWidgetPointerExited;

        var content = ContentOf(fe);
        if (content != null)
            content.IsHitTestVisible = true;

        EnableDrag(fe, false);
    }

    void EnableDrag(FrameworkElement fe, bool on)
    {
        if (on)
        {
            fe.ManipulationMode = ManipulationModes.TranslateX | ManipulationModes.TranslateY;
            fe.ManipulationStarted += OnWidgetDragStarted;
            fe.ManipulationDelta += OnWidgetDragDelta;
            fe.ManipulationCompleted += OnWidgetDragCompleted;
            fe.Tapped += OnContainerTapped;
        }
        else
        {
            fe.ManipulationMode = ManipulationModes.System;
            fe.ManipulationStarted -= OnWidgetDragStarted;
            fe.ManipulationDelta -= OnWidgetDragDelta;
            fe.ManipulationCompleted -= OnWidgetDragCompleted;
            fe.Tapped -= OnContainerTapped;
        }
    }

    void OnContainerTapped(object sender, TappedRoutedEventArgs e)
    {
        if (sender is not FrameworkElement fe) return;
        e.Handled = true;

        if (_editMode) return;

        if (_tapActions.TryGetValue(fe, out var action))
            action();
    }

    void OnWidgetPointerEntered(object sender, PointerRoutedEventArgs e)
    {
        if (_editMode || sender is not FrameworkElement fe) return;
        AnimateScale(fe, 1.04, TimeSpan.FromMilliseconds(250), EasingMode.EaseOut);
    }

    void OnWidgetPointerExited(object sender, PointerRoutedEventArgs e)
    {
        if (_editMode || sender is not FrameworkElement fe) return;
        AnimateScale(fe, 1.0, TimeSpan.FromMilliseconds(167), EasingMode.EaseIn);
    }

    void AnimateScale(FrameworkElement fe, double to, TimeSpan duration, EasingMode easing)
    {
        if (fe.RenderTransform is not ScaleTransform st) return;
        var story = new Storyboard();
        var animX = new DoubleAnimation
        {
            To = to, Duration = new Duration(duration),
            EasingFunction = new CubicEase { EasingMode = easing }
        };
        var animY = new DoubleAnimation
        {
            To = to, Duration = new Duration(duration),
            EasingFunction = new CubicEase { EasingMode = easing }
        };
        Storyboard.SetTarget(animX, st);
        Storyboard.SetTargetProperty(animX, "ScaleX");
        Storyboard.SetTarget(animY, st);
        Storyboard.SetTargetProperty(animY, "ScaleY");
        story.Children.Add(animX);
        story.Children.Add(animY);
        story.Begin();
    }

    void OnSettingsClick(object sender, RoutedEventArgs e) => OpenSettings();

    async void OpenSettings()
    {
        SettingsDialog? dialog = null;
        dialog = new SettingsDialog(
            _loc, _config, _plugins, _pluginSettings,
            _editMode,
            _pages.Count,
            mode =>
            {
                _editMode = mode;
                SetEditMode(mode);
                dialog!.RefreshPageCombos(_pages.Count, mode);
            },
            (typeName, enabled) =>
            {
                if (enabled) ShowPlugin(typeName);
                else HidePlugin(typeName);
            },
            (typeName, pageIdx) =>
            {
                MovePluginToPage(typeName, pageIdx);
            },
            async () =>
            {
                var confirm = new ContentDialog
                {
                    Title = "确认退出",
                    Content = "确定要退出启动器吗？",
                    PrimaryButtonText = "退出",
                    CloseButtonText = "取消",
                    DefaultButton = ContentDialogButton.Close,
                    XamlRoot = Content.XamlRoot
                };
                var result = await confirm.ShowAsync();
                if (result == ContentDialogResult.Primary)
                    Application.Current.Exit();
            },
            async () =>
            {
                var confirm = new ContentDialog
                {
                    Title = "确认重置",
                    Content = "将清空全部设置、布局与插件数据（待办、位置、页面等），并关闭启动器。此操作不可撤销，确定继续吗？",
                    PrimaryButtonText = "重置并退出",
                    CloseButtonText = "取消",
                    DefaultButton = ContentDialogButton.Close,
                    XamlRoot = Content.XamlRoot
                };
                var result = await confirm.ShowAsync();
                if (result == ContentDialogResult.Primary)
                {
                    LogService.Info("User requested full reset");
                    foreach (var p in _pluginSettings)
                        p.ResetConfig(_hostHandle);
                    _config.ResetAll();
                    Application.Current.Exit();
                }
            },
            () => _agentService!.NotifyExpandCotChanged());

        dialog.XamlRoot = Content.XamlRoot;
        var result = await dialog.ShowAsync();
        ApplyStoredTheme();
    }

    void MovePluginToPage(string typeName, int pageIdx)
    {
        if (typeName == "host.settings")
        {
            MoveSettingsTile(pageIdx);
            return;
        }
        if (!IsPluginEnabled(typeName)) return;
        HidePlugin(typeName);
        _config.Set(LayoutStore, $"page.{typeName}", pageIdx.ToString());
        ShowPlugin(typeName);
        LogService.Info($"MovePluginToPage: {typeName} → page {pageIdx}");
    }

    void MoveSettingsTile(int pageIdx)
    {
        if (_settingsTile == null) return;
        var oldPage = PageOf(_settingsTile);
        UnregisterElement(_settingsTile);
        oldPage.Layout.HideElement(_settingsTile);
        _elementPage.Remove(_settingsTile);
        _elementIds.Remove(_settingsTile);
        _tapActions.Remove(_settingsTile);

        var page = GetOrCreatePage(pageIdx);
        page.Layout.ShowElement(_settingsTile);
        _elementPage[_settingsTile] = page;
        _elementIds[_settingsTile] = SettingsWidgetId;
        RegisterElement(_settingsTile);
        PersistPosition(_settingsTile);
        _config.Set(LayoutStore, "page.host.settings", pageIdx.ToString());
        LogService.Info($"MoveSettingsTile: → page {pageIdx}");
    }

    void SetEditMode(bool enabled)
    {
        var savedIndex = Pager.SelectedIndex;

        if (enabled && _pages.Count > 0 && !_pages[^1].IsEmpty)
            AddPage();

        if (Pager.SelectedIndex != savedIndex)
            Pager.SelectedIndex = savedIndex;

        foreach (var page in _pages)
        {
            page.Layout.DrawGridOverlay(page.Overlay, enabled);
            page.Overlay.Visibility = enabled ? Visibility.Visible : Visibility.Collapsed;

            foreach (var container in page.Layout.Containers)
            {
                if (_elementIds.TryGetValue(container, out var id) && id.StartsWith("host.settings"))
                    continue;

                if (page.Layout.GetContent(container) is { } content)
                    content.IsHitTestVisible = !enabled;
                EnableDrag(container, enabled);
            }
        }

        SetPagerSwipe(!enabled);

        if (!enabled) PruneEmptyPages();

        if (Pager.SelectedIndex != savedIndex && savedIndex < _pages.Count)
            Pager.SelectedIndex = savedIndex;
        if (Pips.SelectedPageIndex != savedIndex && savedIndex < _pages.Count)
            Pips.SelectedPageIndex = savedIndex;
    }

    void PruneEmptyPages()
    {
        while (_pages.Count > 0 && _pages[^1].IsEmpty)
        {
            _pages.RemoveAt(_pages.Count - 1);
            Pager.Items.RemoveAt(Pager.Items.Count - 1);
        }
        if (_pages.Count == 0) AddPage();
        Pips.NumberOfPages = _pages.Count;
        if (Pager.SelectedIndex >= _pages.Count)
            Pager.SelectedIndex = _pages.Count - 1;
    }

    void SetPagerSwipe(bool enabled)
    {
        var sv = FindChild<ScrollViewer>(Pager);
        if (sv != null)
            sv.HorizontalScrollMode = enabled ? ScrollMode.Enabled : ScrollMode.Disabled;
    }

    static T? FindChild<T>(DependencyObject root) where T : class
    {
        var count = VisualTreeHelper.GetChildrenCount(root);
        for (int i = 0; i < count; i++)
        {
            var child = VisualTreeHelper.GetChild(root, i);
            if (child is T t) return t;
            var found = FindChild<T>(child);
            if (found != null) return found;
        }
        return null;
    }

    // ---- inline drag via TranslateTransform (no Popup/Canvas virtual layer) ----

    void OnWidgetDragStarted(object sender, ManipulationStartedRoutedEventArgs e)
    {
        if (!_editMode || sender is not FrameworkElement fe) return;

        _dragTarget = fe;
        _dragOrigPage = PageOf(fe);
        _dragOrigCol = Grid.GetColumn(fe);
        _dragOrigRow = Grid.GetRow(fe);
        _dragOrigColSpan = Grid.GetColumnSpan(fe);
        _dragOrigRowSpan = Grid.GetRowSpan(fe);

        _dragTotalX = 0;
        _dragTotalY = 0;

        fe.RenderTransform = new TranslateTransform { X = 0, Y = 0 };
        fe.Opacity = 0.88;
        Canvas.SetZIndex(fe, 999);
    }

    void OnWidgetDragDelta(object sender, ManipulationDeltaRoutedEventArgs e)
    {
        if (_dragTarget is null || !_editMode) return;
        e.Handled = true;

        _dragTotalX += e.Delta.Translation.X;
        _dragTotalY += e.Delta.Translation.Y;

        var tt = (TranslateTransform)_dragTarget.RenderTransform;
        tt.X = _dragTotalX;
        tt.Y = _dragTotalY;
    }

    void OnWidgetDragCompleted(object sender, ManipulationCompletedRoutedEventArgs e)
    {
        if (_dragTarget is not { } fe || _dragOrigPage is null) return;

        fe.Opacity = 1.0;
        Canvas.SetZIndex(fe, 0);
        fe.RenderTransform = new ScaleTransform { CenterX = 0.5, CenterY = 0.5 };

        var page = _dragOrigPage;
        var layout = page.Layout;
        var sub = layout.SubCell;

        var deltaCol = (int)Math.Round(_dragTotalX / sub, MidpointRounding.AwayFromZero);
        var deltaRow = (int)Math.Round(_dragTotalY / sub, MidpointRounding.AwayFromZero);

        var targetCol = Math.Clamp(_dragOrigCol + deltaCol, 0, layout.SubColumns - _dragOrigColSpan);
        var targetRow = Math.Clamp(_dragOrigRow + deltaRow, 0, layout.SubRows - _dragOrigRowSpan);

        string outcome;
        if (targetCol == _dragOrigCol && targetRow == _dragOrigRow)
        {
            outcome = "no_move";
        }
        else if (layout.TryPlace(fe, targetCol, targetRow, _dragOrigColSpan, _dragOrigRowSpan))
        {
            outcome = "placed";
        }
        else
        {
            var swap = layout.GetSingleSwapTarget(fe, targetCol, targetRow, _dragOrigColSpan, _dragOrigRowSpan);
            if (swap != null)
            {
                Grid.SetColumn(swap, Grid.GetColumn(fe));
                Grid.SetRow(swap, Grid.GetRow(fe));
                Grid.SetColumn(fe, targetCol);
                Grid.SetRow(fe, targetRow);
                PersistPosition(swap);
                outcome = "swapped";
            }
            else
            {
                Grid.SetColumn(fe, _dragOrigCol);
                Grid.SetRow(fe, _dragOrigRow);
                outcome = "blocked";
            }
        }

        layout.ReapplyMargins();
        PersistPosition(fe);
        _dragTarget = null;
        _dragOrigPage = null;
        LogService.Info($"DragEnd: orig=({_dragOrigCol},{_dragOrigRow}) delta=({deltaCol},{deltaRow}) target=({targetCol},{targetRow}) [{outcome}]");
    }

    // ---- notifications (queue + banner + escalate to full-screen) ----

    void OnNotificationRequested(string title, string message, bool escalate)
    {
        _notifQueue.Enqueue((title, message, escalate));
        if (!_notifActive)
            ShowNextNotification();
    }

    int EscalateSeconds()
    {
        var raw = _config.Get("host", "notify_escalate_seconds");
        return int.TryParse(raw, out var s) && s > 0 ? s : 10;
    }

    void ShowNextNotification()
    {
        if (_notifQueue.Count == 0) { _notifActive = false; return; }
        if (Content?.XamlRoot == null) { _notifActive = false; return; }

        _notifActive = true;
        var (title, message, escalate) = _notifQueue.Dequeue();

        var contentFe = (FrameworkElement)Content;
        var theme = contentFe.ActualTheme;
        var banner = BuildBanner(title, message, isFullScreen: false, theme);

        double w = contentFe.ActualWidth, h = contentFe.ActualHeight;
        var raw = Content.XamlRoot.Size;
        LogService.Info($"Notification show: content={w:F0}x{h:F0}epx xamlRootSize={raw.Width:F0}x{raw.Height:F0} scale={Content.XamlRoot.RasterizationScale:F2}");

        var host = new Grid { Width = w, Height = h };
        host.Children.Add(banner);

        _notifPopup = new Popup { XamlRoot = Content.XamlRoot, IsLightDismissEnabled = false, Child = host };
        _notifPopup.IsOpen = true;
        FadeInElement(banner);

        _notifTimer?.Stop();
        _notifTimer = DispatcherQueue.CreateTimer();
        _notifTimer.Interval = TimeSpan.FromSeconds(EscalateSeconds());
        _notifTimer.IsRepeating = false;
        _notifTimer.Tick += (_, _) =>
        {
            _notifTimer?.Stop();
            if (escalate) EscalateNotification(title, message, theme);
            else DismissNotification();
        };
        _notifTimer.Start();
    }

    void EscalateNotification(string title, string message, ElementTheme theme)
    {
        if (_notifPopup?.Child is not Grid host) return;
        host.Children.Clear();
        host.Background = new SolidColorBrush(Windows.UI.Color.FromArgb(0xB0, 0x00, 0x00, 0x00));

        var card = BuildBanner(title, message, isFullScreen: true, theme);
        card.HorizontalAlignment = HorizontalAlignment.Center;
        card.VerticalAlignment = VerticalAlignment.Center;
        host.Children.Add(card);

        var visual = ElementCompositionPreview.GetElementVisual(card);
        visual.Scale = new System.Numerics.Vector3(0.6f, 0.6f, 1f);
        var size = card.ActualSize;
        var comp = visual.Compositor;
        var scale = comp.CreateVector3KeyFrameAnimation();
        scale.InsertKeyFrame(1f, new System.Numerics.Vector3(1f, 1f, 1f));
        scale.Duration = TimeSpan.FromMilliseconds(260);
        var opacity = comp.CreateScalarKeyFrameAnimation();
        opacity.InsertKeyFrame(0f, 0f);
        opacity.InsertKeyFrame(1f, 1f);
        opacity.Duration = TimeSpan.FromMilliseconds(220);
        card.Loaded += (_, _) =>
        {
            var v = ElementCompositionPreview.GetElementVisual(card);
            v.CenterPoint = new System.Numerics.Vector3(card.ActualSize.X / 2f, card.ActualSize.Y / 2f, 0f);
            v.StartAnimation("Scale", scale);
            v.StartAnimation("Opacity", opacity);
        };
    }

    void DismissNotification()
    {
        _notifTimer?.Stop();
        _notifTimer = null;
        if (_notifPopup != null)
        {
            _notifPopup.IsOpen = false;
            _notifPopup = null;
        }
        ShowNextNotification();
    }

    FrameworkElement BuildBanner(string title, string message, bool isFullScreen, ElementTheme theme)
    {
        var tint = theme == ElementTheme.Light
            ? Windows.UI.Color.FromArgb(0xFF, 0xF3, 0xF3, 0xF3)
            : Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x2B, 0x2B);
        var primary = theme == ElementTheme.Light
            ? new SolidColorBrush(Windows.UI.Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A))
            : new SolidColorBrush(Windows.UI.Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF));
        var secondary = theme == ElementTheme.Light
            ? new SolidColorBrush(Windows.UI.Color.FromArgb(0x99, 0x00, 0x00, 0x00))
            : new SolidColorBrush(Windows.UI.Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF));

        var text = new StackPanel { Spacing = 4, VerticalAlignment = VerticalAlignment.Center };
        text.Children.Add(new TextBlock
        {
            Text = title,
            FontSize = isFullScreen ? 28 : 16,
            FontWeight = Microsoft.UI.Text.FontWeights.SemiBold,
            Foreground = primary
        });
        text.Children.Add(new TextBlock
        {
            Text = message,
            FontSize = isFullScreen ? 18 : 13,
            Foreground = secondary,
            TextWrapping = TextWrapping.Wrap
        });

        var dismiss = new Button
        {
            Content = new FontIcon { Glyph = "\uE711", FontSize = 14 },
            Background = new SolidColorBrush(Windows.UI.Color.FromArgb(0, 0, 0, 0)),
            BorderThickness = new Thickness(0),
            VerticalAlignment = VerticalAlignment.Top
        };
        dismiss.Click += (_, _) => DismissNotification();

        var layout = new Grid { ColumnSpacing = 12 };
        layout.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        layout.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        Grid.SetColumn(text, 0);
        Grid.SetColumn(dismiss, 1);
        layout.Children.Add(text);
        layout.Children.Add(dismiss);

        return new Border
        {
            Background = new AcrylicBrush { TintColor = tint, TintOpacity = 0.85, FallbackColor = tint },
            CornerRadius = new CornerRadius(isFullScreen ? 16 : 10),
            Padding = new Thickness(isFullScreen ? 40 : 20, isFullScreen ? 32 : 14, isFullScreen ? 24 : 14, isFullScreen ? 32 : 14),
            Margin = isFullScreen ? new Thickness(0) : new Thickness(0, 24, 0, 0),
            MinWidth = isFullScreen ? 360 : 320,
            MaxWidth = isFullScreen ? 560 : 460,
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = isFullScreen ? VerticalAlignment.Center : VerticalAlignment.Top,
            Child = layout
        };
    }

    static void FadeInElement(UIElement element)
    {
        var visual = ElementCompositionPreview.GetElementVisual(element);
        var comp = visual.Compositor;
        var anim = comp.CreateScalarKeyFrameAnimation();
        anim.InsertKeyFrame(0f, 0f);
        anim.InsertKeyFrame(1f, 1f);
        anim.Duration = TimeSpan.FromMilliseconds(200);
        visual.StartAnimation("Opacity", anim);
    }

    void OnActivated(object sender, WindowActivatedEventArgs args)
    {
        if (_configurationSource != null)
            _configurationSource.IsInputActive =
                args.WindowActivationState != WindowActivationState.Deactivated;
    }

    void OnClosed(object sender, WindowEventArgs args)
    {
        LogService.Info("Window closing");
        foreach (var plugin in _plugins)
            plugin.Shutdown();

        _acrylicController?.Dispose();
        _acrylicController = null;
        _configurationSource = null;

        Activated -= OnActivated;
        Closed -= OnClosed;
        if (Content is FrameworkElement fe2)
            fe2.ActualThemeChanged -= OnThemeChanged;
    }

    void OnThemeChanged(FrameworkElement sender, object args) => ApplyTheme();

    void ApplyTheme()
    {
        if (_configurationSource != null && Content is FrameworkElement fe)
        {
            var theme = fe.ActualTheme == ElementTheme.Dark
                ? SystemBackdropTheme.Dark
                : SystemBackdropTheme.Light;
            _configurationSource.Theme = theme;
            _hostHandle?.NotifyTheme(
                fe.ActualTheme == ElementTheme.Dark ? ElementTheme.Dark : ElementTheme.Light);
        }

        if (_hostHandle != null)
        {
            foreach (var kv in _elementIds)
            {
                if (kv.Value.StartsWith("host.settings") && ContentOf(kv.Key) is Control settingsButton)
                    settingsButton.Background = (Brush)_hostHandle.GetWidgetBackgroundBrush();
            }
        }
    }
}
