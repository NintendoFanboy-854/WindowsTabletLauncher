using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using PluginContract;
using LauncherHost.Services;

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
    readonly List<ComboBox> _pageCombos = new();

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
        Func<Task> onReset)
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

        XamlRoot = App.MainWindow!.Content.XamlRoot;

        SetupLanguage();
        SetupTheme();
        SetupEditMode(editMode);
        SetupNotify();
        SetupSettingsPageCombo();
        SetupNavigation(plugins, pluginSettings);

        EditModeToggle.Toggled += (_, _) => _onEditMode(EditModeToggle.IsOn);

        CloseButton.Click += (_, _) => Hide();

        ExitButton.Click += async (_, _) =>
        {
            Hide();
            await _onExit();
        };

        ResetButton.Click += async (_, _) =>
        {
            Hide();
            await _onReset();
        };
    }

    /// <summary>Called by MainWindow when page count changes (edit mode on/off).</summary>
    public void RefreshPageCombos(int pageCount, bool editMode)
    {
        _rebuilding = true;
        _pageCount = pageCount;
        foreach (var combo in _pageCombos)
        {
            var savedIdx = combo.SelectedIndex;
            combo.Items.Clear();
            for (int i = 0; i < _pageCount; i++)
                combo.Items.Add(new ComboBoxItem { Content = $"第 {i + 1} 页", Tag = i });
            combo.IsEnabled = editMode;
            combo.SelectedIndex = Math.Clamp(savedIdx, 0, _pageCount - 1);
        }
        _rebuilding = false;
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
        for (int i = 0; i < _pageCount; i++)
            SettingsPageCombo.Items.Add(new ComboBoxItem { Content = $"第 {i + 1} 页", Tag = i });
        SettingsPageCombo.SelectedIndex = Math.Clamp(currentPage, 0, _pageCount - 1);

        SettingsPageCombo.SelectionChanged += (_, _) =>
        {
            if (_rebuilding) return;
            if (SettingsPageCombo.SelectedItem is not ComboBoxItem ci || ci.Tag is not int p) return;
            _config.Set(LayoutStore, "page.host.settings", p.ToString());
            _onPageChange("host.settings", p);
        };

        _pageCombos.Add(SettingsPageCombo);
    }

    void SetupNavigation(
        IReadOnlyList<IPlugin> plugins,
        IReadOnlyList<IPluginSettings> pluginSettings)
    {
        var globalItem = new ListViewItem { Content = "全局", Tag = GlobalPanel };
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
                Header = "所在页面",
                HorizontalAlignment = HorizontalAlignment.Left,
                MinWidth = 120,
                IsEnabled = _editMode
            };
            for (int i = 0; i < _pageCount; i++)
                pageCombo.Items.Add(new ComboBoxItem { Content = $"第 {i + 1} 页", Tag = i });
            pageCombo.SelectedIndex = Math.Clamp(currentPage, 0, _pageCount - 1);

            pageCombo.SelectionChanged += (_, _) =>
            {
                if (_rebuilding) return;
                if (pageCombo.SelectedItem is not ComboBoxItem ci || ci.Tag is not int p) return;
                _config.Set(LayoutStore, $"page.{typeName}", p.ToString());
                if (enabled) _onPageChange(typeName, p);
            };
            detailStack.Children.Add(pageCombo);
            _pageCombos.Add(pageCombo);

            var settings = pluginSettings.FirstOrDefault(s => s.PluginId == typeName);
            if (settings != null)
            {
                detailStack.Children.Add((FrameworkElement)settings.CreateSettingsControl());
            }
            else
            {
                detailStack.Children.Add(new TextBlock
                {
                    Text = "此插件无设置项",
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
