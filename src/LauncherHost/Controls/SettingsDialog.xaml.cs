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
    readonly Func<Task> _onExit;
    readonly Func<Task> _onReset;

    public SettingsDialog(
        LocalizationService loc,
        ConfigStore config,
        IReadOnlyList<IPlugin> plugins,
        IReadOnlyList<IPluginSettings> pluginSettings,
        bool editMode,
        Action<bool> onEditMode,
        Action<string, bool> onPluginToggle,
        Func<Task> onExit,
        Func<Task> onReset)
    {
        InitializeComponent();
        _loc = loc;
        _config = config;
        _onEditMode = onEditMode;
        _onPluginToggle = onPluginToggle;
        _onExit = onExit;
        _onReset = onReset;

        XamlRoot = App.MainWindow!.Content.XamlRoot;

        SetupLanguage();
        SetupTheme();
        SetupEditMode(editMode);
        SetupNotify();
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

            FrameworkElement detail;
            var settings = pluginSettings.FirstOrDefault(s => s.PluginId == typeName);
            if (settings != null)
            {
                detail = (FrameworkElement)settings.CreateSettingsControl();
            }
            else
            {
                detail = new TextBlock
                {
                    Text = "此插件无设置项",
                    Opacity = 0.5,
                    Margin = new Thickness(0, 4, 0, 4)
                };
            }

            NavList.Items.Add(new ListViewItem { Content = header, Tag = detail });
        }

        NavList.SelectionChanged += (_, _) =>
        {
            if (NavList.SelectedItem is ListViewItem { Tag: FrameworkElement content })
                DetailHost.Content = content;
        };

        NavList.SelectedItem = globalItem;
    }
}
