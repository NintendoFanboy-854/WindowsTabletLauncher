using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using LauncherHost.Core.Agent;
using LauncherHost.Services;
using Windows.UI;

namespace LauncherHost.Controls;

public sealed partial class SettingsDialog : ContentDialog
{
    const string LayoutStore = "layout";

    readonly LocalizationService _loc;
    readonly ConfigStore _config;
    readonly Action<bool> _onEditMode;
    readonly Action<string, bool> _onPluginToggle;
    readonly Action<string, int> _onPageChange;
    int _pageCount;
    bool _editMode;
    bool _rebuilding;
    readonly Func<Task> _onExit;
    readonly Func<Task> _onReset;
    readonly Action? _onExpandCotChanged;
    readonly MemoryStore? _sharedMemory;
    /* readonly Func<Task<bool>>? _onRegisterFace; */
    /* readonly Func<string, Task<bool>>? _onReinforceFace; */
    /* readonly Action<bool>? _onVoiceAutoChanged; */
    /* readonly Action<string>? _onDeleteFace; */
    readonly List<ComboBox> _pageCombos = new();
    bool _rebuildingAi;

    public SettingsDialog(
        LocalizationService loc,
        ConfigStore config,
        IReadOnlyList<IPlugin> plugins,
        IReadOnlyList<IPluginSettings> pluginSettings,
        bool editMode,
        int pageCount,
        Action<bool> onEditMode,
        Action<string, bool> onPluginToggle,
        Action<string, int> onPageChange,
        Func<Task> onExit,
        Func<Task> onReset,
        Action? onExpandCotChanged = null,
        MemoryStore? sharedMemory = null
        /*, Func<Task<bool>>? onRegisterFace = null */
        /*, Func<string, Task<bool>>? onReinforceFace = null */
        /*, Action<bool>? onVoiceAutoChanged = null */
        /*, Action<string>? onDeleteFace = null */)
    {
        InitializeComponent();
        _loc = loc;
        _config = config;
        _onEditMode = onEditMode;
        _onPluginToggle = onPluginToggle;
        _onPageChange = onPageChange;
        _editMode = editMode;
        _pageCount = pageCount;
        _onExit = onExit;
        _onReset = onReset;
        _onExpandCotChanged = onExpandCotChanged;
        _sharedMemory = sharedMemory;

        XamlRoot = App.MainWindow!.Content.XamlRoot;
        ApplyLocalizedTexts();

        SetupLanguage();
        SetupTheme();
        SetupEditMode(editMode);
        SetupNotify();
        SetupSettingsPageCombo();
        SetupProvider();
        SetupApiKey();
        SetupModelCombo();
        SetupThinkingCombo();
        SetupExpandCot();
        SetupVoiceAuto();
        /* SetupFaceSection(); */
        SetupNavigation(plugins, pluginSettings);

        EditModeToggle.Toggled += (_, _) => _onEditMode(EditModeToggle.IsOn);

        CloseButton.Click += (_, _) => Hide();

        ExitButton.Click += async (_, _) =>
        {
            Hide();
            await Task.Delay(150);
            await _onExit();
        };

        ResetButton.Click += async (_, _) =>
        {
            Hide();
            await Task.Delay(150);
            await _onReset();
        };
    }

    string T(string key) => _loc.Translate(key);

    string PageLabel(int i) => string.Format(T("settings.page_label"), i + 1);

    void ApplyLocalizedTexts()
    {
        Title = T("settings.title");
        LanguageCombo.Header = T("settings.language");
        ThemeCombo.Header = T("settings.theme");
        EditModeToggle.Header = T("settings.edit_mode");
        NotifySecondsBox.Header = T("settings.notify_seconds");
        SettingsPageCombo.Header = T("settings.settings_tile_page");
        AiExpander.Header = T("settings.ai");
        ProviderCombo.Header = T("settings.provider");
        ModelCombo.Header = T("settings.model");
        ThinkingCombo.Header = T("settings.thinking");
        ExpandCotToggle.Header = T("settings.expand_cot");
        VoiceAutoToggle.Header = T("settings.voice_auto");
        CloseButton.Content = T("settings.close");
        ExitButton.Content = T("settings.exit");
        ResetButton.Content = T("settings.reset");
        ViewMemoryBtn.Content = T("settings.memory_view");
        ClearMemoryBtn.Content = T("settings.memory_clear");
        if (ThemeCombo.Items.Count == 3)
        {
            ((ComboBoxItem)ThemeCombo.Items[0]).Content = T("settings.theme.system");
            ((ComboBoxItem)ThemeCombo.Items[1]).Content = T("settings.theme.light");
            ((ComboBoxItem)ThemeCombo.Items[2]).Content = T("settings.theme.dark");
        }
    }

    public void RefreshPageCombos(int pageCount, bool editMode)
    {
        _rebuilding = true;
        try
        {
            _pageCount = pageCount;
            var max = Math.Max(0, _pageCount - 1);
            foreach (var combo in _pageCombos)
            {
                var savedIdx = combo.SelectedIndex;
                combo.Items.Clear();
                for (int i = 0; i < _pageCount; i++)
                    combo.Items.Add(new ComboBoxItem { Content = PageLabel(i), Tag = i });
                combo.IsEnabled = editMode;
                combo.SelectedIndex = Math.Clamp(savedIdx, 0, max);
            }
        }
        finally
        {
            _rebuilding = false;
        }
    }

    string GetCurrentProvider() => ProviderCombo.SelectedItem is ComboBoxItem ci ? (string)ci.Tag : "deepseek";

    string GetProviderApiKey(string provider)
    {
        var key = _config.Get("host", $"agent_api_key.{provider}");
        if (!string.IsNullOrWhiteSpace(key)) return key!;
        if (provider == "deepseek")
            return _config.Get("host", "agent_api_key") ?? "";
        return "";
    }

    void SetupLanguage()
    {
        foreach (ComboBoxItem item in LanguageCombo.Items)
        {
            if ((string)item.Tag == _loc.Culture)
            {
                LanguageCombo.SelectedItem = item;
                break;
            }
        }

        LanguageCombo.SelectionChanged += (_, _) =>
        {
            if (LanguageCombo.SelectedItem is ComboBoxItem item)
            {
                var tag = (string)item.Tag;
                _config.Set("host", "language", tag);
                _loc.SetCulture(tag);
            }
        };
    }

    void SetupTheme()
    {
        var current = _config.Get("host", "theme") ?? "Default";
        foreach (ComboBoxItem item in ThemeCombo.Items)
        {
            if ((string)item.Tag == current)
            {
                ThemeCombo.SelectedItem = item;
                break;
            }
        }

        ThemeCombo.SelectionChanged += (_, _) =>
        {
            if (ThemeCombo.SelectedItem is ComboBoxItem item)
            {
                var tag = (string)item.Tag;
                _config.Set("host", "theme", tag);
            }
        };
    }

    void SetupEditMode(bool current)
    {
        EditModeToggle.IsOn = current;
    }

    void SetupNotify()
    {
        var raw = _config.Get("host", "notify_escalate_seconds");
        NotifySecondsBox.Value = int.TryParse(raw, out var s) && s > 0 ? s : 10;
        NotifySecondsBox.ValueChanged += (_, _) =>
        {
            if (!double.IsNaN(NotifySecondsBox.Value))
                _config.Set("host", "notify_escalate_seconds", ((int)NotifySecondsBox.Value).ToString());
        };
    }

    void SetupSettingsPageCombo()
    {
        SettingsPageCombo.IsEnabled = _editMode;
        var currentPage = int.TryParse(_config.Get(LayoutStore, "page.host.settings"), out var cp) ? cp : 0;
        var max = Math.Max(0, _pageCount - 1);
        for (int i = 0; i < _pageCount; i++)
            SettingsPageCombo.Items.Add(new ComboBoxItem { Content = PageLabel(i), Tag = i });
        SettingsPageCombo.SelectedIndex = Math.Clamp(currentPage, 0, max);

        SettingsPageCombo.SelectionChanged += (_, _) =>
        {
            if (_rebuilding) return;
            if (SettingsPageCombo.SelectedItem is not ComboBoxItem ci || ci.Tag is not int p) return;
            _config.Set(LayoutStore, "page.host.settings", p.ToString());
            _onPageChange("host.settings", p);
        };

        _pageCombos.Add(SettingsPageCombo);
    }

    void SetupProvider()
    {
        var current = _config.Get("host", "agent_provider") ?? "deepseek";
        _rebuildingAi = true;
        try
        {
            foreach (ComboBoxItem item in ProviderCombo.Items)
            {
                if ((string)item.Tag == current)
                {
                    ProviderCombo.SelectedItem = item;
                    break;
                }
            }
        }
        finally { _rebuildingAi = false; }

        ProviderCombo.SelectionChanged += (_, _) =>
        {
            if (_rebuildingAi) return;
            var provider = GetCurrentProvider();
            _config.Set("host", "agent_provider", provider);

            var key = GetProviderApiKey(provider);
            ApiKeyBox.Text = key;

            RefreshModelCombo(provider);
            RefreshThinkingCombo(provider);
        };
    }

    void SetupApiKey()
    {
        var provider = GetCurrentProvider();
        ApiKeyBox.Text = GetProviderApiKey(provider);

        ApiKeyBox.LostFocus += (_, _) =>
        {
            var p = GetCurrentProvider();
            _config.Set("host", $"agent_api_key.{p}", ApiKeyBox.Text.Trim());
        };

        var memory = _sharedMemory ?? new MemoryStore();
        memory.ReloadFromDisk();
        MemoryLabel.Text = string.Format(T("settings.memory_label"), memory.Facts.Count);

        ViewMemoryBtn.Click += (_, _) =>
        {
            if (MemoryScroll.Visibility == Visibility.Visible)
            {
                MemoryScroll.Visibility = Visibility.Collapsed;
                return;
            }
            memory.ReloadFromDisk();
            var facts = memory.Facts;
            MemoryContent.Text = facts.Count == 0 ? T("settings.memory_empty") : string.Join("\n", facts.Select(f => f.Key + ": " + f.Value));
            MemoryScroll.Visibility = Visibility.Visible;
        };

        ClearMemoryBtn.Click += (_, _) =>
        {
            memory.Clear();
            MemoryLabel.Text = string.Format(T("settings.memory_label"), 0);
            MemoryScroll.Visibility = Visibility.Collapsed;
        };
    }

    void RefreshModelCombo(string provider)
    {
        _rebuildingAi = true;
        try
        {
            var savedTag = _config.Get("host", $"agent_model.{provider}")
                ?? _config.Get("host", "agent_model")
                ?? "";
            ModelCombo.Items.Clear();

            if (provider == "mimo")
            {
                ModelCombo.Items.Add(new ComboBoxItem { Tag = "mimo-v2.5", Content = "MiMo V2.5" });
                ModelCombo.Items.Add(new ComboBoxItem { Tag = "mimo-v2.5-pro", Content = "MiMo V2.5 Pro" });
            }
            else
            {
                ModelCombo.Items.Add(new ComboBoxItem { Tag = "deepseek-v4-pro", Content = "DeepSeek V4 Pro" });
                ModelCombo.Items.Add(new ComboBoxItem { Tag = "deepseek-v4-flash", Content = "DeepSeek V4 Flash" });
            }

            var matched = false;
            foreach (ComboBoxItem item in ModelCombo.Items)
            {
                if ((string)item.Tag == savedTag)
                {
                    ModelCombo.SelectedItem = item;
                    matched = true;
                    break;
                }
            }
            if (!matched && ModelCombo.Items.Count > 0)
            {
                // 仅选中第一项用于展示；不覆盖用户保存的配置
                ModelCombo.SelectedIndex = 0;
            }
        }
        finally { _rebuildingAi = false; }
    }

    void RefreshThinkingCombo(string provider)
    {
        _rebuildingAi = true;
        try
        {
            var savedTag = _config.Get("host", $"agent_thinking.{provider}")
                ?? _config.Get("host", "agent_thinking")
                ?? "";
            ThinkingCombo.Items.Clear();

            if (provider == "mimo")
            {
                ThinkingCombo.Items.Add(new ComboBoxItem { Tag = "none", Content = T("settings.thinking_none") });
                ThinkingCombo.Items.Add(new ComboBoxItem { Tag = "enabled", Content = T("settings.thinking_enabled") });
            }
            else
            {
                ThinkingCombo.Items.Add(new ComboBoxItem { Tag = "none", Content = T("settings.thinking_none") });
                ThinkingCombo.Items.Add(new ComboBoxItem { Tag = "high", Content = "High" });
                ThinkingCombo.Items.Add(new ComboBoxItem { Tag = "max", Content = "Max" });
            }

            var matched = false;
            foreach (ComboBoxItem item in ThinkingCombo.Items)
            {
                if ((string)item.Tag == savedTag)
                {
                    ThinkingCombo.SelectedItem = item;
                    matched = true;
                    break;
                }
            }
            if (!matched && ThinkingCombo.Items.Count > 0)
            {
                // 仅选中第一项用于展示；不覆盖用户保存的配置
                ThinkingCombo.SelectedIndex = 0;
            }
        }
        finally { _rebuildingAi = false; }
    }

    void SetupModelCombo()
    {
        var provider = GetCurrentProvider();
        RefreshModelCombo(provider);

        var model = _config.Get("host", $"agent_model.{provider}")
            ?? _config.Get("host", "agent_model")
            ?? "deepseek-v4-pro";
        foreach (ComboBoxItem item in ModelCombo.Items)
        {
            if ((string)item.Tag == model) { ModelCombo.SelectedItem = item; break; }
        }
        if (ModelCombo.SelectedIndex < 0 && ModelCombo.Items.Count > 0)
            ModelCombo.SelectedIndex = 0;

        ModelCombo.SelectionChanged += (_, _) =>
        {
            if (_rebuildingAi) return;
            if (ModelCombo.SelectedItem is ComboBoxItem item)
                _config.Set("host", $"agent_model.{GetCurrentProvider()}", (string)item.Tag);
        };
    }

    void SetupThinkingCombo()
    {
        var provider = GetCurrentProvider();
        RefreshThinkingCombo(provider);

        var thinking = _config.Get("host", $"agent_thinking.{provider}")
            ?? _config.Get("host", "agent_thinking")
            ?? "none";
        foreach (ComboBoxItem item in ThinkingCombo.Items)
        {
            if ((string)item.Tag == thinking) { ThinkingCombo.SelectedItem = item; break; }
        }
        if (ThinkingCombo.SelectedIndex < 0 && ThinkingCombo.Items.Count > 0)
            ThinkingCombo.SelectedIndex = 0;

        ThinkingCombo.SelectionChanged += (_, _) =>
        {
            if (_rebuildingAi) return;
            if (ThinkingCombo.SelectedItem is ComboBoxItem item)
                _config.Set("host", $"agent_thinking.{GetCurrentProvider()}", (string)item.Tag);
        };
    }

    void SetupExpandCot()
    {
        ExpandCotToggle.IsOn = (_config.Get("host", "agent_expand_cot") ?? "false") == "true";
        ExpandCotToggle.Toggled += (_, _) =>
        {
            _config.Set("host", "agent_expand_cot", ExpandCotToggle.IsOn ? "true" : "false");
            _onExpandCotChanged?.Invoke();
        };
    }

    void SetupVoiceAuto()
    {
        VoiceAutoToggle.IsOn = (_config.Get("host", "voice_auto") ?? "false") == "true";
        /* var silenceStr = _config.Get("host", "voice_auto_silence_frames") ?? "10"; */
        /* SilenceFramesBox.Value = int.TryParse(silenceStr, out var s) ? s : 10; */
        /* var intervalStr = _config.Get("host", "voice_auto_capture_interval_sec") ?? "2"; */
        /* CaptureIntervalBox.Value = int.TryParse(intervalStr, out var iv) ? iv : 2; */

        VoiceAutoToggle.Toggled += (_, _) =>
        {
            _config.Set("host", "voice_auto", VoiceAutoToggle.IsOn ? "true" : "false");
            /* _onVoiceAutoChanged?.Invoke(VoiceAutoToggle.IsOn); */
        };
        /* SilenceFramesBox.ValueChanged += (_, _) => */
        /* { */
        /*     if (!double.IsNaN(SilenceFramesBox.Value)) */
        /*         _config.Set("host", "voice_auto_silence_frames", ((int)SilenceFramesBox.Value).ToString()); */
        /* }; */
        /* CaptureIntervalBox.ValueChanged += (_, _) => */
        /* { */
        /*     if (!double.IsNaN(CaptureIntervalBox.Value)) */
        /*         _config.Set("host", "voice_auto_capture_interval_sec", ((int)CaptureIntervalBox.Value).ToString()); */
        /* }; */
    }

    /* void SetupFaceSection() */
    /* { */
    /*     RefreshFaceSection(); */
    /*     _loc.CultureChanged += () => { _dispatcher.TryEnqueue(RefreshFaceSection); }; */
    /*     RegisterFaceBtn.Click += async (_, _) => */
    /*     { */
    /*         if (_onRegisterFace == null) return; */
    /*         await _onRegisterFace(); */
    /*         RefreshFaceSection(); */
    /*     }; */
    /* } */
    /* */
    /* void RefreshFaceSection() */
    /* { */
    /*     var namesJson = _config.Get("host", "face_names"); */
    /*     LogService.Info($"[SettingsDialog] RefreshFace face_names raw: {namesJson ?? "null"}"); */
    /*     IReadOnlyList<string> names = Array.Empty<string>(); */
    /*     if (!string.IsNullOrWhiteSpace(namesJson)) */
    /*     { */
    /*         var list = System.Text.Json.JsonSerializer.Deserialize<List<string>>(namesJson); */
    /*         if (list != null) names = list; */
    /*     } */
    /*     while (FaceSection.Children.Count > 1) */
    /*         FaceSection.Children.RemoveAt(1); */
    /*     if (names.Count == 0) */
    /*     { */
    /*         FaceStatusLabel.Text = T("face.not_registered"); */
    /*     } */
    /*     else */
    /*     { */
    /*         FaceStatusLabel.Text = string.Format(T("face.registered"), names.Count); */
    /*         foreach (var name in names) */
    /*         { */
    /*             var row = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 6, Margin = new Thickness(0, 2, 0, 0) }; */
    /*             row.Children.Add(new TextBlock { Text = name, FontSize = 12, Opacity = 0.8, VerticalAlignment = VerticalAlignment.Center }); */
    /*             var reinforceBtn = new Button { Content = T("face.reinforce_btn"), FontSize = 10, Height = 24, Padding = new Thickness(4, 0, 4, 0) }; */
    /*             var delBtn = new Button { Content = T("face.delete_btn"), FontSize = 10, Height = 24, Padding = new Thickness(4, 0, 4, 0) }; */
    /*             var capturedName = name; */
    /*             reinforceBtn.Click += async (_, _) => { if (_onReinforceFace != null) await _onReinforceFace(capturedName); RefreshFaceSection(); }; */
    /*             delBtn.Click += (_, _) => { _onDeleteFace?.Invoke(capturedName); _dispatcher.TryEnqueue(RefreshFaceSection); }; */
    /*             row.Children.Add(reinforceBtn); */
    /*             row.Children.Add(delBtn); */
    /*             FaceSection.Children.Add(row); */
    /*         } */
    /*     } */
    /*     RegisterFaceBtn.Content = T("face.register_btn"); */
    /* } */
    /* */
    /* string T(string key) => _loc.Translate(key); */

    void SetupNavigation(
        IReadOnlyList<IPlugin> plugins,
        IReadOnlyList<IPluginSettings> pluginSettings)
    {
        var globalItem = new ListViewItem { Content = T("settings.global"), Tag = GlobalPanel };
        NavList.Items.Add(globalItem);

        foreach (var plugin in plugins)
        {
            var typeName = plugin.GetType().Name;
            var enabled = (_config.Get(LayoutStore, $"enabled.{typeName}") ?? "true") == "true";
            var currentPage = int.TryParse(_config.Get(LayoutStore, $"page.{typeName}"), out var cp) ? cp : 0;

            var header = new Grid { Padding = new Thickness(0, 2, 0, 2) };
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var name = new TextBlock
            {
                Text = plugin.DisplayName,
                VerticalAlignment = VerticalAlignment.Center,
                TextTrimming = TextTrimming.CharacterEllipsis
            };
            Grid.SetColumn(name, 0);

            var toggle = new ToggleSwitch
            {
                IsOn = enabled,
                OnContent = null,
                OffContent = null,
                MinWidth = 0,
                VerticalAlignment = VerticalAlignment.Center
            };
            toggle.Toggled += (_, _) => _onPluginToggle(typeName, toggle.IsOn);
            Grid.SetColumn(toggle, 1);

            header.Children.Add(name);
            header.Children.Add(toggle);

            var detailStack = new StackPanel { Spacing = 12, Margin = new Thickness(0, 4, 0, 0) };

            var pageCombo = new ComboBox
            {
                Header = T("settings.location_page"),
                HorizontalAlignment = HorizontalAlignment.Left,
                MinWidth = 120,
                IsEnabled = _editMode
            };
            var max = Math.Max(0, _pageCount - 1);
            for (int i = 0; i < _pageCount; i++)
                pageCombo.Items.Add(new ComboBoxItem { Content = PageLabel(i), Tag = i });
            pageCombo.SelectedIndex = Math.Clamp(currentPage, 0, max);

            pageCombo.SelectionChanged += (_, _) =>
            {
                if (_rebuilding) return;
                if (pageCombo.SelectedItem is not ComboBoxItem ci || ci.Tag is not int p) return;
                _config.Set(LayoutStore, $"page.{typeName}", p.ToString());
                // 实时读取启用状态，避免闭包捕获过期值
                var enabledNow = (_config.Get(LayoutStore, $"enabled.{typeName}") ?? "true") == "true";
                if (enabledNow) _onPageChange(typeName, p);
            };
            detailStack.Children.Add(pageCombo);
            _pageCombos.Add(pageCombo);

            var settings = pluginSettings.FirstOrDefault(s => s.PluginId == typeName)
                ?? pluginSettings.FirstOrDefault(s => s.PluginId == plugin.DisplayName);
            if (settings != null)
            {
                detailStack.Children.Add((FrameworkElement)settings.CreateSettingsControl());
            }
            else
            {
                detailStack.Children.Add(new TextBlock
                {
                    Text = T("settings.no_settings"),
                    Opacity = 0.5
                });
            }

            NavList.Items.Add(new ListViewItem { Content = header, Tag = detailStack });
        }

        NavList.SelectionChanged += (_, _) =>
        {
            if (NavList.SelectedItem is ListViewItem { Tag: FrameworkElement content })
                DetailHost.Content = content;
        };

        NavList.SelectedItem = globalItem;
    }
}
