using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Media;
using SharedUtils;
using Windows.UI;

namespace WeatherPlugin;

/// <summary>
/// 天气插件设置页（Fluent 2）：InfoBar 引导提示、TextBox.Header 布局、AutoSuggestBox 城市搜索、
/// ToggleButton chips（热门城市）、Expander 分区、4px 间距网格。
/// </summary>
public sealed class WeatherSettingsPanel : StackPanel
{
    readonly QWeatherService _service;
    readonly Func<WeatherWidget?> _widget;
    bool _loading = true;

    public WeatherSettingsPanel(QWeatherService service, Func<WeatherWidget?> widget)
    {
        _service = service;
        _widget = widget;

        Spacing = 8;
        Margin = new Thickness(0, 8, 0, 4);

        BuildCredentialSection();
        BuildLocationSection();
        BuildFavoritesSection();
        BuildBehaviorSection();
        BuildUsageSection();

        _loading = false;
    }

    void RefreshWidget()
    {
        if (_loading) return;
        _widget()?.Refresh();
    }

    // ---- 凭据 ----

    void BuildCredentialSection()
    {
        var expander = new Expander { Header = "和风天气凭据（API Host + API Key）", IsExpanded = false };

        var panel = new StackPanel { Spacing = 8 };
        panel.Children.Add(new InfoBar
        {
            Title = "配置方式",
            Message = "控制台 → 设置 查看专属 API Host；控制台 → 项目管理 → 创建凭据（API KEY）。免费额度：每月 50,000 次请求。",
            Severity = InfoBarSeverity.Informational,
            IsOpen = true,
            IsClosable = false
        });

        var hostBox = new TextBox { Header = "API Host", PlaceholderText = "例如 abcdefg.qweatherapi.com" };
        hostBox.Text = _service.GetConfig(QWeatherService.KeyHost);
        hostBox.LostFocus += (_, _) =>
        {
            _service.SetConfig(QWeatherService.KeyHost, hostBox.Text.Trim());
            _service.ClearCache();
            _service.Client.ResetBreaker();
            RefreshWidget();
        };
        panel.Children.Add(hostBox);

        var keyBox = new TextBox { Header = "API Key", PlaceholderText = "控制台创建的 API KEY" };
        keyBox.Text = _service.GetConfig(QWeatherService.KeyApiKey);
        keyBox.LostFocus += (_, _) =>
        {
            _service.SetConfig(QWeatherService.KeyApiKey, keyBox.Text.Trim());
            _service.ClearCache();
            _service.Client.ResetBreaker();
            RefreshWidget();
        };
        panel.Children.Add(keyBox);

        var langBox = new TextBox { Header = "数据语言", PlaceholderText = "zh / zh-hant / en / ja …" };
        langBox.Text = _service.GetConfig(QWeatherService.KeyLang) is { Length: > 0 } l ? l.ToLowerInvariant() : "zh";
        langBox.LostFocus += (_, _) =>
        {
            _service.SetConfig(QWeatherService.KeyLang, langBox.Text.Trim().ToLowerInvariant());
            _service.ClearCache();
            RefreshWidget();
        };
        panel.Children.Add(langBox);

        var testRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceS };
        var testBtn = Fluent.Cta("连接测试", null, accent: true);
        var testResult = new TextBlock { VerticalAlignment = VerticalAlignment.Center, FontSize = 12, LineHeight = 16, TextWrapping = TextWrapping.Wrap };
        testBtn.Click += async (_, _) =>
        {
            _service.SetConfig(QWeatherService.KeyHost, hostBox.Text.Trim());
            _service.SetConfig(QWeatherService.KeyApiKey, keyBox.Text.Trim());
            _service.ClearCache();
            _service.Client.ResetBreaker();
            testBtn.IsEnabled = false;
            testResult.Text = "测试中…";
            try
            {
                var list = await _service.SearchLocationsAsync("北京", number: 1);
                testResult.Text = list.Count > 0
                    ? $"✓ 连接成功：{list[0].Name} ({list[0].Id})"
                    : "✗ 连接成功但无结果";
            }
            catch (Exception ex)
            {
                testResult.Text = $"✗ {ex.Message}";
            }
            finally { testBtn.IsEnabled = true; }
        };
        testRow.Children.Add(testBtn);
        testRow.Children.Add(testResult);
        panel.Children.Add(testRow);

        expander.Content = panel;
        Children.Add(expander);
    }

    // ---- 定位 ----

    void BuildLocationSection()
    {
        var modeCombo = new ComboBox { Header = "定位方式" };
        var autoItem = new ComboBoxItem { Content = "自动（IP 定位 + 系统定位 fallback）", Tag = "auto" };
        var manualItem = new ComboBoxItem { Content = "手动选择", Tag = "manual" };
        modeCombo.Items.Add(autoItem);
        modeCombo.Items.Add(manualItem);
        var mode = _service.GetConfig(QWeatherService.KeyLocMode);
        modeCombo.SelectedItem = mode == "manual" ? manualItem : autoItem;
        Children.Add(modeCombo);

        var manualPanel = new StackPanel { Spacing = 8 };
        manualPanel.Visibility = mode == "manual" ? Visibility.Visible : Visibility.Collapsed;
        Children.Add(manualPanel);

        var currentText = new TextBlock { FontSize = 12, LineHeight = 16, Opacity = 0.8, TextWrapping = TextWrapping.Wrap };
        void UpdateCurrentText()
        {
            var loc = _service.GetLastKnownLocation();
            currentText.Text = loc == null
                ? "当前：未选择城市"
                : $"当前：{loc.DisplayName}（{loc.Id}）";
        }
        UpdateCurrentText();
        manualPanel.Children.Add(currentText);

        var suggest = new AutoSuggestBox
        {
            Header = "搜索城市",
            PlaceholderText = "城市名 / LocationID / 经度,纬度",
            QueryIcon = new SymbolIcon(Symbol.Find)
        };
        int suggestSeq = 0;
        suggest.TextChanged += async (s, e) =>
        {
            if (e.Reason != AutoSuggestionBoxTextChangeReason.UserInput) return;
            var kw = s.Text.Trim();
            if (kw.Length == 0) { s.ItemsSource = null; return; }
            var seq = ++suggestSeq;
            try
            {
                var list = await _service.SearchLocationsAsync(kw, number: 10);
                if (seq == suggestSeq) s.ItemsSource = list;
            }
            catch { if (seq == suggestSeq) s.ItemsSource = null; }
        };
        suggest.QuerySubmitted += (s, e) =>
        {
            if (e.ChosenSuggestion is not QGeoLocation g) return;
            s.Text = "";
            s.ItemsSource = null;
            _service.SetManualLocation(QLocation.FromGeo(g));
            UpdateCurrentText();
            RefreshWidget();
        };
        manualPanel.Children.Add(suggest);

        var hotHeader = new TextBlock { Text = "热门城市", FontSize = 12, LineHeight = 16, Margin = new Thickness(0, Fluent.SpaceXS, 0, 0) };
        manualPanel.Children.Add(hotHeader);
        var hotRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceS };
        manualPanel.Children.Add(hotRow);

        _ = LoadHotCitiesAsync(hotRow, UpdateCurrentText);

        modeCombo.SelectionChanged += (_, _) =>
        {
            if (_loading) return;
            var tag = (modeCombo.SelectedItem as ComboBoxItem)?.Tag as string ?? "auto";
            if (tag == "auto") _service.SetAutoLocation();
            manualPanel.Visibility = tag == "manual" ? Visibility.Visible : Visibility.Collapsed;
            RefreshWidget();
        };
    }

    async Task LoadHotCitiesAsync(StackPanel hotRow, Action updateCurrent)
    {
        try
        {
            var cities = await _service.GetTopCitiesAsync("cn", 10);
            foreach (var g in cities)
            {
                var chip = new ToggleButton
                {
                    Content = g.Name,
                    Padding = new Thickness(Fluent.SpaceL, Fluent.SpaceS, Fluent.SpaceL, Fluent.SpaceS),
                    MinHeight = Fluent.TouchTarget,
                    CornerRadius = new CornerRadius(22),
                    FontSize = 12
                };
                chip.Click += (_, _) =>
                {
                    _service.SetManualLocation(QLocation.FromGeo(g));
                    updateCurrent();
                    RefreshWidget();
                };
                hotRow.Children.Add(chip);
            }
        }
        catch (Exception ex)
        {
            _widget()?.Host.LogError($"Weather: hot cities failed {ex.Message}");
            hotRow.Children.Add(new TextBlock { Text = "热门城市加载失败", FontSize = 12, Opacity = 0.7 });
        }
    }

    // ---- 收藏 ----

    StackPanel _favList = null!;

    void BuildFavoritesSection()
    {
        Children.Add(new TextBlock { Text = "收藏城市", FontSize = 14, LineHeight = 20, FontWeight = Microsoft.UI.Text.FontWeights.SemiBold, Margin = new Thickness(0, Fluent.SpaceXS, 0, 0) });

        var addBtn = Fluent.Cta("把当前城市加入收藏", null, accent: false);
        addBtn.HorizontalAlignment = HorizontalAlignment.Stretch;
        addBtn.Click += (_, _) =>
        {
            var loc = _service.GetLastKnownLocation();
            if (loc != null)
            {
                _service.AddFavorite(loc.Id, loc.DisplayName);
                RebuildFavList();
            }
        };
        Children.Add(addBtn);

        _favList = new StackPanel { Spacing = Fluent.SpaceXS };
        Children.Add(_favList);
        RebuildFavList();
    }

    void RebuildFavList()
    {
        _favList.Children.Clear();
        foreach (var (id, name) in _service.GetFavorites())
        {
            var row = new Grid
            {
                ColumnSpacing = Fluent.SpaceS,
                ColumnDefinitions =
                {
                    new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) },
                    new ColumnDefinition { Width = GridLength.Auto }
                }
            };

            var label = new TextBlock { Text = name, VerticalAlignment = VerticalAlignment.Center };
            Grid.SetColumn(label, 0);

            var del = Fluent.IconButton("\uE711", $"删除收藏 {name}", null, "删除", 12);
            var locId = id;
            del.Click += (_, _) =>
            {
                _service.RemoveFavorite(locId);
                RebuildFavList();
            };
            Grid.SetColumn(del, 1);

            row.Children.Add(label);
            row.Children.Add(del);
            _favList.Children.Add(row);
        }
    }

    // ---- 行为 ----

    void BuildBehaviorSection()
    {
        var refreshBox = new NumberBox
        {
            Header = "自动刷新间隔（分钟，最小 15 以节省免费额度）",
            Minimum = 15,
            Maximum = 360,
            SpinButtonPlacementMode = NumberBoxSpinButtonPlacementMode.Inline,
            Value = _service.RefreshMinutes
        };
        refreshBox.ValueChanged += (_, _) =>
        {
            if (_loading || double.IsNaN(refreshBox.Value)) return;
            _service.SetConfig(QWeatherService.KeyRefreshMin, ((int)refreshBox.Value).ToString());
            _widget()?.ApplyRefreshInterval();
        };
        Children.Add(refreshBox);

        var notifyToggle = new ToggleSwitch
        {
            Header = "天气预警系统通知",
            IsOn = _service.GetConfig(QWeatherService.KeyNotifyAlerts) != "false"
        };
        notifyToggle.Toggled += (_, _) =>
        {
            if (_loading) return;
            _service.SetConfig(QWeatherService.KeyNotifyAlerts, notifyToggle.IsOn ? "true" : "false");
        };
        Children.Add(notifyToggle);
    }

    // ---- 用量 ----

    void BuildUsageSection()
    {
        var expander = new Expander { Header = "账户用量（控制台 API）", IsExpanded = false };
        var panel = new StackPanel { Spacing = 8 };

        panel.Children.Add(new InfoBar
        {
            Title = "需要控制台权限",
            Message = "在控制台 → 项目管理 → 凭据 中开启「控制台权限」后才能查询。免费额度为每月 50,000 次请求。",
            Severity = InfoBarSeverity.Warning,
            IsOpen = true,
            IsClosable = false
        });

        var btn = Fluent.Cta("查询用量", null, accent: false);
        var result = new TextBlock { FontSize = 12, LineHeight = 16, TextWrapping = TextWrapping.Wrap, IsTextSelectionEnabled = true };
        btn.Click += async (_, _) =>
        {
            btn.IsEnabled = false;
            result.Text = "查询中…";
            try
            {
                var fin = await _service.GetFinanceSummaryAsync();
                var stats = await _service.GetStatsAsync();
                var ok = QWeatherService.SumHours(stats?.Success);
                var err = QWeatherService.SumHours(stats?.Errors);
                result.Text =
                    $"余额：{fin?.Balance:0.##} {fin?.Currency ?? ""}\n" +
                    $"本月应计费用：{fin?.AccruedCharges?.ThisMonth:0.##}\n" +
                    $"最近 24h 请求：成功 {ok} / 错误 {err}\n" +
                    $"数据截至：{stats?.AsOf ?? fin?.AsOf ?? "--"}";
            }
            catch (QWeatherApiException ex)
            {
                result.Text = ex.StatusCode == 403
                    ? "无权限：请在控制台为该凭据开启「财务汇总」和「请求量统计」权限"
                    : ex.Message;
            }
            catch (Exception ex)
            {
                result.Text = $"查询失败：{ex.Message}";
            }
            finally { btn.IsEnabled = true; }
        };
        panel.Children.Add(btn);
        panel.Children.Add(result);
        expander.Content = panel;
        Children.Add(expander);
    }
}
