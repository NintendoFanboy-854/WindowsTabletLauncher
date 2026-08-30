using System.Globalization;
using Microsoft.UI;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Media;
using SharedUtils;
using Windows.UI;

namespace WeatherPlugin;

/// <summary>
/// 天气总览页（Fluent 2）：
/// - 顶部：AutoSuggestBox 城市搜索（GeoAPI）+ 收藏城市 chips
/// - SelectorBar 四个视图：总览（预警 InfoBar/实况/分钟降水）· 预报（24h 曲线/7-30 天）· 环境（空气/指数）· 天文·历史
/// - 卡片：8px 圆角 + CardBackground + 1px 描边；加载中用 ProgressRing；每页签懒加载，数据互不阻塞
/// </summary>
public sealed class WeatherOverlayBuilder
{
    readonly WeatherWidget _widget;
    readonly QWeatherService _service;
    readonly ElementTheme _theme;

    QLocation? _loc;
    readonly Grid _pages = new();
    readonly SelectorBar _selector = new();
    readonly StackPanel[] _pagePanels = new StackPanel[4];
    readonly HashSet<string> _loadedPages = new();
    readonly Dictionary<string, (Border Card, Grid Content)> _cards = new();

    public WeatherOverlayBuilder(WeatherWidget widget)
    {
        _widget = widget;
        _service = widget.Service;
        _theme = ((FrameworkElement)widget).ActualTheme;
    }

    // ================= build =================

    public FrameworkElement Build()
    {
        var root = new StackPanel { Spacing = 12 };

        root.Children.Add(BuildSearchBox());

        var favs = BuildFavoritesChips();
        if (favs != null) root.Children.Add(favs);

        foreach (var name in new[] { "总览", "预报", "环境", "天文·历史" })
            _selector.Items.Add(new SelectorBarItem { Text = name });
        // Wayfinding：明确指示"我在哪"——默认选中第一项，选中项用强调色，未选中用次级文字色
        _selector.SelectedItem = _selector.Items[0];
        UpdateSelectorColors();
        _selector.SelectionChanged += (_, _) => { UpdateSelectorColors(); ShowPage(CurrentPageKey()); };
        root.Children.Add(_selector);

        for (int i = 0; i < 4; i++)
        {
            _pagePanels[i] = new StackPanel { Spacing = 12, Visibility = i == 0 ? Visibility.Visible : Visibility.Collapsed };
            _pages.Children.Add(_pagePanels[i]);
        }
        root.Children.Add(_pages);

        BuildOverviewPage();
        _loadedPages.Add("overview");
        _ = LoadPageSafeAsync(new[] { "alerts", "current", "minutely" }, LoadOverviewAsync);

        return root;
    }

    /// <summary>页签级加载兜底：RequireLocAsync 等前置失败时把错误写入对应卡片，避免永远"加载中"。</summary>
    async Task LoadPageSafeAsync(string[] cardKeys, Func<Task> load)
    {
        try { await load(); }
        catch (Exception ex)
        {
            foreach (var key in cardKeys)
                SetCardError(key, ex);
        }
    }

    void UpdateSelectorColors()
    {
        foreach (var it in _selector.Items.OfType<SelectorBarItem>())
        {
            var selected = ReferenceEquals(it, _selector.SelectedItem);
            it.Foreground = selected ? Fluent.Accent() : Fluent.TextSecondary(_theme);
        }
    }

    string CurrentPageKey()
    {
        var idx = _selector.SelectedItem is null ? 0 : _selector.Items.IndexOf(_selector.SelectedItem);
        return idx switch { 1 => "forecast", 2 => "env", 3 => "astro", _ => "overview" };
    }

    void ShowPage(string key)
    {
        var idx = key switch { "forecast" => 1, "env" => 2, "astro" => 3, _ => 0 };
        for (int i = 0; i < _pagePanels.Length; i++)
            _pagePanels[i].Visibility = i == idx ? Visibility.Visible : Visibility.Collapsed;

        if (_loadedPages.Contains(key)) return;
        _loadedPages.Add(key);
        switch (key)
        {
            case "forecast": BuildForecastPage(); _ = LoadPageSafeAsync(new[] { "hourly", "daily" }, LoadForecastAsync); break;
            case "env": BuildEnvPage(); _ = LoadPageSafeAsync(new[] { "air", "indices" }, LoadEnvAsync); break;
            case "astro": BuildAstroPage(); _ = LoadPageSafeAsync(new[] { "astro", "history" }, LoadAstroPageAsync); break;
        }
    }

    // ================= shared builders =================

    FrameworkElement BuildSearchBox()
    {
        var suggest = new AutoSuggestBox
        {
            PlaceholderText = "搜索全球城市（GeoAPI）…",
            QueryIcon = new SymbolIcon(Symbol.Find),
            HorizontalAlignment = HorizontalAlignment.Stretch
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
                var list = await _service.SearchLocationsAsync(kw, number: 8);
                if (seq == suggestSeq) s.ItemsSource = list;
            }
            catch { if (seq == suggestSeq) s.ItemsSource = null; }
        };
        suggest.QuerySubmitted += (s, e) =>
        {
            if (e.ChosenSuggestion is QGeoLocation g)
            {
                s.Text = "";
                s.ItemsSource = null;
                _ = _widget.SwitchAndReopenAsync(QLocation.FromGeo(g));
            }
        };
        return suggest;
    }

    FrameworkElement? BuildFavoritesChips()
    {
        var favs = _service.GetFavorites();
        if (favs.Count == 0) return null;

        var bar = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceS };
        var cur = _widget.CurrentLocation?.Id;
        foreach (var (id, name) in favs)
        {
            var locId = id;
            var chip = new ToggleButton
            {
                Content = Fluent.Text(name, _theme, "body", Fluent.TextPrimary(_theme)),
                Padding = new Thickness(Fluent.SpaceL, Fluent.SpaceS, Fluent.SpaceL, Fluent.SpaceS),
                MinHeight = Fluent.TouchTarget,
                CornerRadius = new CornerRadius(22)
            };
            chip.Click += async (_, _) =>
            {
                try
                {
                    var list = await _service.SearchLocationsAsync(locId, number: 1);
                    var g = list.FirstOrDefault();
                    if (g != null) await _widget.SwitchAndReopenAsync(QLocation.FromGeo(g));
                    else chip.IsChecked = false;
                }
                catch (Exception ex)
                {
                    _widget.Host.LogError($"Weather: favorite switch failed {ex.Message}");
                    chip.IsChecked = false;
                }
            };
            bar.Children.Add(chip);
        }
        return new ScrollViewer
        {
            Content = bar,
            HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled,
            HorizontalScrollMode = ScrollMode.Auto,
            VerticalScrollBarVisibility = ScrollBarVisibility.Disabled
        };
    }

    /// <summary>创建带标题的卡片并加入对应页签，内容区初始为 ProgressRing。</summary>
    (Border Card, Grid Content) Card(string pageKey, string key, string title, FrameworkElement? headerExtra = null)
    {
        var content = new Grid { MinHeight = 32 };
        content.Children.Add(LoadingPlaceholder());

        var header = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceS };
        var headerTitle = Fluent.SectionTitle(title, _theme);
        // 标题与右侧高元素（如 44px 切换胶囊）同行时垂直居中，否则默认顶对齐会偏上
        headerTitle.VerticalAlignment = VerticalAlignment.Center;
        header.Children.Add(headerTitle);
        if (headerExtra != null) header.Children.Add(headerExtra);

        var body = new StackPanel { Spacing = Fluent.SpaceS };
        body.Children.Add(header);
        body.Children.Add(content);

        var card = Fluent.Card(_theme, new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceL));
        card.Child = body;

        PageIdx(pageKey);
        _pagePanels[PageIdx(pageKey)].Children.Add(card);

        var entry = (card, content);
        _cards[key] = entry;
        return entry;
    }

    static int PageIdx(string pageKey) => pageKey switch
    {
        "forecast" => 1,
        "env" => 2,
        "astro" => 3,
        _ => 0
    };

    FrameworkElement LoadingPlaceholder()
    {
        var s = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 8 };
        s.Children.Add(new ProgressRing { Width = 16, Height = 16, IsActive = true });
        s.Children.Add(Fluent.Text("加载中…", _theme, "caption", Fluent.TextTertiary(_theme)));
        s.VerticalAlignment = VerticalAlignment.Center;
        s.HorizontalAlignment = HorizontalAlignment.Left;
        return s;
    }

    void SetCard(string key, FrameworkElement content)
    {
        _widget.RunOnUi(() =>
        {
            if (_cards.TryGetValue(key, out var entry))
            {
                entry.Content.Children.Clear();
                entry.Content.Children.Add(content);
            }
        });
    }

    void SetCardError(string key, Exception ex)
    {
        var msg = ex is QWeatherApiException q
            ? $"{q.Title}{(string.IsNullOrEmpty(q.Detail) ? "" : "：" + q.Detail)}"
            : ex.Message;
        SetCard(key, Fluent.Text($"获取失败：{msg}", _theme, "body", Fluent.Critical(_theme), TextWrapping.Wrap));
    }

    async void Load(string key, Func<Task<FrameworkElement>> build)
    {
        try { SetCard(key, await build()); }
        catch (Exception ex) { SetCardError(key, ex); }
    }

    async Task<QLocation> RequireLocAsync()
    {
        if (_loc != null) return _loc;
        _loc = _widget.CurrentLocation ?? await _service.ResolveCurrentAsync();
        return _loc ?? throw new QWeatherApiException(400, "未定位", "请在设置中选择位置");
    }

    FrameworkElement InfoNote(string text) =>
        Fluent.Text(text, _theme, "body", Fluent.TextSecondary(_theme));

    // ================= 总览 =================

    void BuildOverviewPage()
    {
        Card("overview", "alerts", "预警");
        Card("overview", "current", "实况");
        Card("overview", "minutely", "分钟降水");
    }

    async Task LoadOverviewAsync()
    {
        var loc = await RequireLocAsync();

        Load("alerts", async () => BuildAlerts(await _service.GetAlertsAsync(loc)));

        Load("current", async () =>
        {
            var current = _widget.CurrentWeather ?? await _service.GetCurrentAsync(loc)
                ?? throw new QWeatherApiException(400, "无数据", null!);
            return BuildCurrent(current);
        });

        if (loc.IsChina)
            Load("minutely", async () => BuildMinutely(
                await _service.GetMinutelyAsync(loc) ?? throw new QWeatherApiException(400, "无数据", null!)));
        else
            SetCard("minutely", InfoNote("分钟级降水仅支持中国地区"));
    }

    FrameworkElement BuildAlerts(List<QAlert> alerts)
    {
        var body = new StackPanel { Spacing = 8 };
        if (alerts.Count == 0)
        {
            body.Children.Add(new InfoBar
            {
                Title = "无生效预警",
                Message = "当前城市没有正在生效的官方天气预警",
                Severity = InfoBarSeverity.Informational,
                IsOpen = true,
                IsClosable = false
            });
            return body;
        }

        foreach (var a in alerts)
        {
            var severity = a.Severity switch
            {
                "extreme" => InfoBarSeverity.Error,
                "severe" => InfoBarSeverity.Error,
                "moderate" => InfoBarSeverity.Warning,
                _ => InfoBarSeverity.Informational
            };
            var headline = a.Headline;
            var message = string.IsNullOrEmpty(a.Description) ? a.Criteria : a.Description;
            // 澳门等地 CAP 预警的 headline 与 description 文本相同，去重只显示一次
            if (!string.IsNullOrEmpty(headline) && !string.IsNullOrEmpty(message) &&
                (headline == message || message.Contains(headline)))
            {
                message = headline;
                headline = $"{a.EventType?.Name ?? "天气"}预警";
            }
            var bar = new InfoBar
            {
                Title = headline ?? $"{a.EventType?.Name}预警",
                Message = message,
                Severity = severity,
                IsOpen = true,
                IsClosable = false
            };
            body.Children.Add(bar);
            if (!string.IsNullOrEmpty(a.Instruction))
                body.Children.Add(new TextBlock
                {
                    Text = a.Instruction,
                    FontSize = 12,
                    LineHeight = 17,
                    Foreground = Fluent.TextSecondary(_theme),
                    TextWrapping = TextWrapping.Wrap,
                    Margin = new Thickness(12, 0, 12, 0)
                });
            body.Children.Add(Fluent.Text(
                $"{a.SenderName} · {SeverityZh(a.Severity)} · 至 {FmtTime(a.ExpireTime)}",
                _theme, "caption", Fluent.TextTertiary(_theme)));
        }
        return body;
    }

    static string SeverityZh(string? s) => s switch
    {
        "extreme" => "极端",
        "severe" => "严重",
        "moderate" => "较重",
        "minor" => "一般",
        _ => s ?? "--"
    };

    FrameworkElement BuildCurrent(QCurrentWeather c)
    {
        var body = new StackPanel { Spacing = Fluent.SpaceL };

        // hero 水平居中：图标 + 温度 + 现象
        var hero = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceL, HorizontalAlignment = HorizontalAlignment.Center };
        hero.Children.Add(WeatherIcons.CreateIcon(c.Condition?.Code, 64, _theme));

        var heroText = new StackPanel { Spacing = 2, VerticalAlignment = VerticalAlignment.Center };
        heroText.Children.Add(Fluent.Text(
            c.Temperature?.Value is double t ? $"{t:0.#}°" : "--",
            _theme, "numberTile", Fluent.TextPrimary(_theme)));
        heroText.Children.Add(Fluent.Text(c.Condition?.Text ?? "--", _theme, "bodyLarge", Fluent.TextSecondary(_theme)));
        hero.Children.Add(heroText);
        body.Children.Add(hero);

        body.Children.Add(BuildStatChips(new (string, string)[]
        {
            ("体感", Temp(c.FeelsLike, "℃")),
            ("湿度", Pct(c.Humidity)),
            ("风", WindText(c)),
            ("阵风", Speed(c.WindGust)),
            ("降水", PrecipText(c)),
            ("气压", Val(c.Pressure, "hPa")),
            ("能见度", VisibilityText(c)),
            ("云量", Pct(c.CloudCover)),
            ("紫外线", c.UvIndex is double uv ? $"{uv:0.#}" : "--"),
            ("露点", Temp(c.DewPoint, "℃")),
        }));
        return body;
    }

    FrameworkElement BuildStatChips((string label, string value)[] items)
    {
        const int cols = 5;
        var grid = new Grid { ColumnSpacing = Fluent.SpaceS, RowSpacing = Fluent.SpaceS };
        for (int i = 0; i < cols; i++)
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        var rows = (int)Math.Ceiling(items.Length / (double)cols);
        for (int r = 0; r < rows; r++)
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

        for (int i = 0; i < items.Length; i++)
        {
            var chip = Fluent.StatTile(items[i].label,
                string.IsNullOrEmpty(items[i].value) ? "—" : items[i].value, _theme);
            Grid.SetColumn(chip, i % cols);
            Grid.SetRow(chip, i / cols);
            grid.Children.Add(chip);
        }
        return grid;
    }

    FrameworkElement BuildMinutely(QV7MinutelyResponse r)
    {
        var body = new StackPanel { Spacing = Fluent.SpaceS };
        body.Children.Add(Fluent.Text(r.Summary ?? "--", _theme, "bodyLarge", Fluent.TextPrimary(_theme), TextWrapping.Wrap));

        var items = (r.Minutely ?? new()).Take(24).ToList();
        if (items.Count > 0)
        {
            // 24 根柱在 780px 下每列 ~30px，纯小时数字必然放得下 → 每 4 根显示一个
            // 注意 "HH" 是合法的 DateTime 格式符（"H" 不是，ToString("H") 会抛 FormatException）
            var data = items.Select((m, i) => (i % 4 == 0 ? Label(m.FxTime, "HH") : "", ParseD(m.Precip))).ToList();
            body.Children.Add(MiniChart.Bars(data, Fluent.Accent(), Fluent.TextSecondary(_theme), 110));
        }
        return body;
    }

    // ================= 预报 =================

    void BuildForecastPage()
    {
        var bar = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceS };
        foreach (var (label, days) in new[] { ("7 天", 7), ("15 天", 15), ("30 天", 30) })
        {
            var chip = new ToggleButton
            {
                Content = Fluent.Text(label, _theme, "body", Fluent.TextPrimary(_theme)),
                Padding = new Thickness(Fluent.SpaceL, Fluent.SpaceS, Fluent.SpaceL, Fluent.SpaceS),
                MinHeight = Fluent.TouchTarget,
                CornerRadius = new CornerRadius(22),
                IsChecked = days == 7
            };
            var dayCount = days;
            chip.Click += (_, _) =>
            {
                foreach (var child in bar.Children.OfType<ToggleButton>()) child.IsChecked = child == chip;
                Load("daily", () => LoadDailyAsync(dayCount));
            };
            bar.Children.Add(chip);
        }
        Card("forecast", "hourly", "逐小时（24h）");
        Card("forecast", "daily", "每日预报", bar);
    }

    async Task LoadForecastAsync()
    {
        var loc = await RequireLocAsync();
        Load("hourly", async () => BuildHourly(
            await _service.GetHourlyAsync(loc, 24) ?? throw new QWeatherApiException(400, "无数据", null!)));
        Load("daily", () => LoadDailyAsync(7));
    }

    async Task<FrameworkElement> LoadDailyAsync(int days)
    {
        var loc = await RequireLocAsync();
        FrameworkElement el = days <= 10
            ? BuildDailyV1(await _service.GetDailyAsync(loc, days) ?? throw new QWeatherApiException(400, "无数据", null!))
            : BuildDailyV7(await _service.GetCityDailyAsync(loc, days) ?? throw new QWeatherApiException(400, "无数据", null!), days);
        return el;
    }

    FrameworkElement BuildHourly(QHourlyWeather h)
    {
        // 逐小时信息由下方卡片行承载（图标+温度+降水概率），不再重复绘制温度折线
        var body = new StackPanel { Spacing = Fluent.SpaceM };
        var hours = h.Hours ?? new List<QHourlyHour>();
        if (hours.Count == 0) return InfoNote("暂无数据");

        var row = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceS };
        foreach (var x in hours)
        {
            var col = new StackPanel { Spacing = 2, MinWidth = 64 };
            col.Children.Add(Fluent.Text(Label(x.ForecastTime, "HH:mm"), _theme, "caption", Fluent.TextTertiary(_theme)));
            col.Children.Add(WeatherIcons.CreateIcon(x.Condition?.Code, 26, _theme));
            col.Children.Add(new TextBlock
            {
                Text = x.Temperature?.Value is double t ? $"{t:0.#}°" : "--",
                FontSize = 14,
                LineHeight = 20,
                FontWeight = Microsoft.UI.Text.FontWeights.SemiBold,
                Foreground = Fluent.TextPrimary(_theme),
                HorizontalAlignment = HorizontalAlignment.Center
            });
            col.Children.Add(x.Precipitation?.Probability is double p && p > 0
                ? Fluent.Text($"{Math.Round(p * 100)}%", _theme, "caption", Fluent.TextSecondary(_theme))
                : Fluent.Text("", _theme, "caption"));

            var chip = Fluent.Card(_theme, new Thickness(Fluent.SpaceS, Fluent.SpaceS, Fluent.SpaceS, Fluent.SpaceM), Fluent.RadiusControl);
            chip.Child = col;
            row.Children.Add(chip);
        }
        body.Children.Add(new ScrollViewer
        {
            Content = row,
            HorizontalScrollBarVisibility = ScrollBarVisibility.Auto,
            HorizontalScrollMode = ScrollMode.Auto,
            VerticalScrollBarVisibility = ScrollBarVisibility.Disabled
        });
        return body;
    }

    FrameworkElement BuildDailyV1(QDailyWeather d)
    {
        var body = new StackPanel { Spacing = 6 };
        var days = d.Days ?? new List<QDailyDay>();
        if (days.Count == 0) return InfoNote("暂无数据");

        var mins = days.Where(x => x.TemperatureMin?.Value is not null).Select(x => x.TemperatureMin!.Value ?? 0).ToList();
        var maxs = days.Where(x => x.TemperatureMax?.Value is not null).Select(x => x.TemperatureMax!.Value ?? 0).ToList();
        var weekMin = mins.Count > 0 ? mins.Min() : 0;
        var weekMax = maxs.Count > 0 ? maxs.Max() : 0;
        var span = Math.Max(1, weekMax - weekMin);

        for (int i = 0; i < days.Count; i++)
        {
            var day = days[i];
            var cond = $"{Short(day.Daytime?.Condition?.Text)} · {Short(day.Nighttime?.Condition?.Text)}";
            var pop = Math.Max(day.Daytime?.Precipitation?.Probability ?? 0, day.Nighttime?.Precipitation?.Probability ?? 0);
            if (pop > 0) cond += $" · 降水{Math.Round(pop * 100)}%";
            body.Children.Add(BuildDayRow(
                DayLabel(i, day.ForecastStartTime),
                day.Daytime?.Condition?.Code,
                cond,
                day.TemperatureMin?.Value, day.TemperatureMax?.Value, weekMin, span));
        }
        return body;
    }

    FrameworkElement BuildDailyV7(QV7DailyResponse d, int days)
    {
        var body = new StackPanel { Spacing = 6 };
        var list = d.Daily ?? new List<QV7Day>();
        if (list.Count == 0) return InfoNote("暂无数据");

        var mins = list.Where(x => double.TryParse(x.TempMin, NumberStyles.Float, CultureInfo.InvariantCulture, out _))
            .Select(x => ParseD(x.TempMin)).ToList();
        var maxs = list.Where(x => double.TryParse(x.TempMax, NumberStyles.Float, CultureInfo.InvariantCulture, out _))
            .Select(x => ParseD(x.TempMax)).ToList();
        var weekMin = mins.Count > 0 ? mins.Min() : 0;
        var weekMax = maxs.Count > 0 ? maxs.Max() : 0;
        var span = Math.Max(1, weekMax - weekMin);

        for (int i = 0; i < list.Count; i++)
        {
            var day = list[i];
            var row = BuildDayRow(
                DayLabel(i, day.FxDate),
                day.IconDay,
                $"{Short(day.TextDay)} · {Short(day.TextNight)}",
                ParseD(day.TempMin), ParseD(day.TempMax), weekMin, span);
            body.Children.Add(row);
        }
        body.Children.Add(Fluent.Text($"数据来源：v7 城市端点 · {days} 天", _theme, "caption", Fluent.TextTertiary(_theme)));
        return body;
    }

    FrameworkElement BuildDayRow(string dayLabel, string? iconCode, string condition,
        double? tMin, double? tMax, double weekMin, double span)
    {
        var grid = new Grid
        {
            ColumnSpacing = Fluent.SpaceM,
            ColumnDefinitions =
            {
                new ColumnDefinition { Width = new GridLength(56) },
                new ColumnDefinition { Width = new GridLength(32) },
                new ColumnDefinition { Width = new GridLength(1.2, GridUnitType.Star) },
                new ColumnDefinition { Width = new GridLength(44) },
                new ColumnDefinition { Width = new GridLength(1.6, GridUnitType.Star) },
                new ColumnDefinition { Width = new GridLength(44) }
            }
        };

        var day = Fluent.Text(dayLabel, _theme, "bodyStrong", Fluent.TextPrimary(_theme));
        day.VerticalAlignment = VerticalAlignment.Center;
        Grid.SetColumn(day, 0);
        grid.Children.Add(day);

        var icon = WeatherIcons.CreateIcon(iconCode, 26, _theme);
        Grid.SetColumn(icon, 1);
        grid.Children.Add(icon);

        var cond = Fluent.Text(condition, _theme, "caption", Fluent.TextSecondary(_theme));
        cond.VerticalAlignment = VerticalAlignment.Center;
        cond.TextTrimming = TextTrimming.CharacterEllipsis;
        cond.MaxLines = 1;
        Grid.SetColumn(cond, 2);
        grid.Children.Add(cond);

        var min = Fluent.Text(tMin is double lo ? $"{Math.Round(lo)}°" : "--", _theme, "caption", Fluent.TextSecondary(_theme));
        min.HorizontalAlignment = HorizontalAlignment.Right;
        min.VerticalAlignment = VerticalAlignment.Center;
        Grid.SetColumn(min, 3);
        grid.Children.Add(min);

        // 温度区间轨道：贯穿中间剩余宽度（Apple Weather 式），蓝色区段按全周最低/最高温比例定位，
        // 用星号权重表达比例——任意宽度下都居中铺满，不再留出中段空洞
        var track = new Grid { Height = 4, VerticalAlignment = VerticalAlignment.Center };
        var loVal = tMin ?? weekMin;
        var hiVal = tMax ?? weekMin;
        var leftF = Math.Clamp((loVal - weekMin) / span, 0, 1);
        var blueF = Math.Clamp((hiVal - loVal) / span, 0.04, 1 - leftF);
        var rightF = Math.Max(0, 1 - leftF - blueF);
        track.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(leftF, GridUnitType.Star) });
        track.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(Math.Max(blueF, 0.001), GridUnitType.Star) });
        track.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(Math.Max(rightF, 0.001), GridUnitType.Star) });
        var gray = new Border { CornerRadius = new CornerRadius(2), Background = Fluent.Divider(_theme) };
        Grid.SetColumnSpan(gray, 3);
        track.Children.Add(gray);
        var blue = new Border { CornerRadius = new CornerRadius(2), Background = Fluent.Accent() };
        Grid.SetColumn(blue, 1);
        track.Children.Add(blue);
        Grid.SetColumn(track, 4);
        grid.Children.Add(track);

        var max = Fluent.Text(tMax is double up ? $"{Math.Round(up)}°" : "--", _theme, "bodyStrong", Fluent.TextPrimary(_theme));
        max.VerticalAlignment = VerticalAlignment.Center;
        Grid.SetColumn(max, 5);
        grid.Children.Add(max);

        return new Border
        {
            MinHeight = Fluent.TouchTarget,
            Padding = new Thickness(Fluent.SpaceM, Fluent.SpaceS, Fluent.SpaceM, Fluent.SpaceS),
            CornerRadius = new CornerRadius(Fluent.RadiusControl),
            Background = Fluent.CardBgSecondary(_theme),
            Child = grid
        };
    }

    // ================= 环境 =================

    void BuildEnvPage()
    {
        Card("env", "air", "空气质量");
        Card("env", "indices", "生活指数");
    }

    async Task LoadEnvAsync()
    {
        var loc = await RequireLocAsync();
        Load("air", async () => BuildAir(
            await _service.GetAirCurrentAsync(loc) ?? throw new QWeatherApiException(400, "无数据", null!)));
        Load("indices", async () => BuildIndices(
            await _service.GetIndicesAsync(loc, 1, loc.IsChina ? "1,3,5,9" : "1,3,5")));
    }

    FrameworkElement BuildAir(QAirResponse air)
    {
        var body = new StackPanel { Spacing = Fluent.SpaceM };
        var index = PickAirIndex(air);
        if (index == null) return InfoNote("该地区暂无空气质量数据");

        var aqiColor = index.Color is { Red: not null } col
            ? Color.FromArgb(0xFF, (byte)Math.Clamp(col.Red!.Value, 0, 255), (byte)Math.Clamp(col.Green ?? 0, 0, 255), (byte)Math.Clamp(col.Blue ?? 0, 0, 255))
            : Colors.Gray;

        var head = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceL };
        head.Children.Add(Fluent.Text(
            index.AqiDisplay ?? index.Aqi?.ToString("0.#") ?? "--",
            _theme, "numberTile", new SolidColorBrush(aqiColor)));
        var info = new StackPanel { Spacing = 2, VerticalAlignment = VerticalAlignment.Center };
        info.Children.Add(Fluent.Text($"{index.Name}: {index.Category ?? "--"}", _theme, "bodyLargeStrong", Fluent.TextPrimary(_theme)));
        if (index.PrimaryPollutant != null)
            info.Children.Add(Fluent.Text($"首要污染物：{index.PrimaryPollutant.Name}", _theme, "body", Fluent.TextSecondary(_theme)));
        head.Children.Add(info);
        body.Children.Add(head);

        if (index.Health?.Advice?.GeneralPopulation is { Length: > 0 } advice)
            body.Children.Add(new InfoBar
            {
                Title = "健康建议",
                Message = advice,
                Severity = InfoBarSeverity.Informational,
                IsOpen = true,
                IsClosable = false
            });

        var chips = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceS };
        foreach (var p in air.Pollutants ?? new List<QPollutant>())
        {
            var chip = new StackPanel { Spacing = 0 };
            chip.Children.Add(Fluent.Text(p.Name ?? p.Code ?? "", _theme, "caption", Fluent.TextTertiary(_theme)));
            chip.Children.Add(Fluent.Text(
                p.Concentration?.Value is double v ? $"{v:0.#} {p.Concentration?.Unit}" : "--",
                _theme, "bodyStrong", Fluent.TextPrimary(_theme)));

            var box = Fluent.Card(_theme, new Thickness(Fluent.SpaceM, Fluent.SpaceXS, Fluent.SpaceM, Fluent.SpaceXS), Fluent.RadiusControl);
            box.Background = Fluent.CardBgSecondary(_theme);
            box.Child = chip;
            chips.Children.Add(box);
        }
        if (chips.Children.Count > 0)
            body.Children.Add(new ScrollViewer
            {
                Content = chips,
                HorizontalScrollBarVisibility = ScrollBarVisibility.Auto,
                HorizontalScrollMode = ScrollMode.Auto,
                VerticalScrollBarVisibility = ScrollBarVisibility.Disabled
            });
        return body;
    }

    static QAirIndex? PickAirIndex(QAirResponse air)
    {
        var indexes = air.Indexes ?? new List<QAirIndex>();
        return indexes.FirstOrDefault(i => i.Code?.Contains("cn", StringComparison.OrdinalIgnoreCase) == true)
               ?? indexes.FirstOrDefault(i => i.Code == "qaqi")
               ?? indexes.FirstOrDefault();
    }

    FrameworkElement BuildIndices(List<QIndicesItem> items)
    {
        var body = new StackPanel { Spacing = Fluent.SpaceS };
        if (items.Count == 0) return InfoNote("暂无指数数据");

        foreach (var it in items)
        {
            var grid = new Grid
            {
                ColumnSpacing = Fluent.SpaceS,
                ColumnDefinitions =
                {
                    new ColumnDefinition { Width = new GridLength(96) },
                    new ColumnDefinition { Width = GridLength.Auto },
                    new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) }
                }
            };

            var name = Fluent.Text(it.Name ?? "", _theme, "bodyStrong", Fluent.TextPrimary(_theme));
            name.VerticalAlignment = VerticalAlignment.Center;
            Grid.SetColumn(name, 0);
            grid.Children.Add(name);

            var catChip = Fluent.Card(_theme, new Thickness(Fluent.SpaceM, Fluent.SpaceXS, Fluent.SpaceM, Fluent.SpaceXS), Fluent.RadiusControl);
            catChip.Background = Fluent.CardBgSecondary(_theme);
            catChip.Child = Fluent.Text($"{it.Category}（{it.Level}级）", _theme, "caption", Fluent.TextPrimary(_theme));
            catChip.VerticalAlignment = VerticalAlignment.Center;
            Grid.SetColumn(catChip, 1);
            grid.Children.Add(catChip);

            var text = Fluent.Text(it.Text ?? "", _theme, "caption", Fluent.TextSecondary(_theme), TextWrapping.Wrap);
            text.VerticalAlignment = VerticalAlignment.Center;
            Grid.SetColumn(text, 2);
            grid.Children.Add(text);

            body.Children.Add(new Border
            {
                Padding = new Thickness(Fluent.SpaceM, Fluent.SpaceS, Fluent.SpaceM, Fluent.SpaceS),
                CornerRadius = new CornerRadius(Fluent.RadiusControl),
                Background = Fluent.CardBgSecondary(_theme),
                Child = grid
            });
        }
        return body;
    }

    // ================= 天文·历史 =================

    void BuildAstroPage()
    {
        Card("astro", "astro", "天文");
        Card("astro", "history", "历史天气（时光机）");
    }

    async Task LoadAstroPageAsync()
    {
        var loc = await RequireLocAsync();
        Load("astro", () => BuildAstro(loc));

        var results = new Grid();

        // 选择即查：去掉"选日期→再点查询"的两步流程与帮助文案
        var combo = new ComboBox { Width = 140, MinHeight = Fluent.TouchTarget };
        for (int i = 1; i <= 9; i++) combo.Items.Add(i == 1 ? "昨天" : $"{i} 天前");
        combo.SelectedIndex = 0;

        async void QueryAsync(int idx)
        {
            combo.IsEnabled = false;
            results.Children.Clear();
            results.Children.Add(LoadingPlaceholder());
            try
            {
                var el = await BuildHistory(idx);
                _widget.RunOnUi(() =>
                {
                    results.Children.Clear();
                    results.Children.Add(el);
                });
            }
            catch (Exception ex)
            {
                var msg = ex is QWeatherApiException q
                    ? $"{q.Title}{(string.IsNullOrEmpty(q.Detail) ? "" : "：" + q.Detail)}"
                    : ex.Message;
                _widget.RunOnUi(() =>
                {
                    results.Children.Clear();
                    results.Children.Add(Fluent.Text($"获取失败：{msg}", _theme, "body", Fluent.Critical(_theme), TextWrapping.Wrap));
                });
            }
            finally
            {
                _widget.RunOnUi(() => combo.IsEnabled = true);
            }
        }

        combo.SelectionChanged += (_, _) =>
        {
            var idx = combo.SelectedIndex < 0 ? 1 : combo.SelectedIndex + 1;
            QueryAsync(idx);
        };

        var row = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceS };
        row.Children.Add(combo);

        if (_cards.TryGetValue("history", out var entry))
        {
            entry.Content.Children.Clear();
            var wrap = new StackPanel { Spacing = Fluent.SpaceS };
            wrap.Children.Add(row);
            wrap.Children.Add(results);
            entry.Content.Children.Add(wrap);
        }

        // 初始即查一次"昨天"，避免打开页签后是空白提示
        QueryAsync(1);
    }

    async Task<FrameworkElement> BuildAstro(QLocation loc)
    {
        var today = DateTime.Today;
        var sun = await _service.GetSunAsync(loc, today);
        var moon = await _service.GetMoonAsync(loc, today);

        var body = new StackPanel { Spacing = Fluent.SpaceS };

        var grid = new Grid
        {
            ColumnSpacing = Fluent.SpaceM,
            ColumnDefinitions = { new ColumnDefinition(), new ColumnDefinition() }
        };

        var sunBody = new StackPanel { Spacing = Fluent.SpaceS };
        sunBody.Children.Add(Fluent.Text("太阳", _theme, "bodyStrong", Fluent.TextPrimary(_theme)));
        sunBody.Children.Add(BuildAstroRow("\uE706", "日出", FmtTimeShort(sun?.Sunrise)));
        sunBody.Children.Add(BuildAstroRow("\uE708", "日落", FmtTimeShort(sun?.Sunset)));

        var sunCard = Fluent.Card(_theme, new Thickness(Fluent.SpaceL), Fluent.RadiusControl);
        sunCard.Background = Fluent.CardBgSecondary(_theme);
        sunCard.Child = sunBody;
        Grid.SetColumn(sunCard, 0);
        grid.Children.Add(sunCard);

        var moonBody = new StackPanel { Spacing = Fluent.SpaceS };
        moonBody.Children.Add(Fluent.Text("月亮", _theme, "bodyStrong", Fluent.TextPrimary(_theme)));
        var phase = moon?.MoonPhase is { Count: > 0 } ph ? ph[0] : null;
        if (phase != null)
        {
            var row = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceS };
            row.Children.Add(WeatherIcons.CreateIcon(phase.Icon, 24, _theme));
            var t = Fluent.Text($"{phase.Name} · 照亮率 {phase.Illumination ?? "--"}%", _theme, "body", Fluent.TextSecondary(_theme));
            t.VerticalAlignment = VerticalAlignment.Center;
            row.Children.Add(t);
            moonBody.Children.Add(row);
        }
        moonBody.Children.Add(BuildAstroRow("\uE9B4", "月升", FmtTimeShort(moon?.Moonrise)));
        moonBody.Children.Add(BuildAstroRow("\uE9B5", "月落", FmtTimeShort(moon?.Moonset)));

        var moonCard = Fluent.Card(_theme, new Thickness(Fluent.SpaceL), Fluent.RadiusControl);
        moonCard.Background = Fluent.CardBgSecondary(_theme);
        moonCard.Child = moonBody;
        Grid.SetColumn(moonCard, 1);
        grid.Children.Add(moonCard);

        body.Children.Add(grid);
        return body;
    }

    FrameworkElement BuildAstroRow(string glyph, string label, string value)
    {
        var grid = new Grid
        {
            ColumnSpacing = 8,
            ColumnDefinitions = { new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) }, new ColumnDefinition { Width = GridLength.Auto } }
        };
        var l = Fluent.Text(label, _theme, "body", Fluent.TextSecondary(_theme));
        Grid.SetColumn(l, 0);
        grid.Children.Add(l);
        var v = Fluent.Text(value, _theme, "bodyStrong", Fluent.TextPrimary(_theme));
        Grid.SetColumn(v, 1);
        grid.Children.Add(v);
        return grid;
    }

    async Task<FrameworkElement> BuildHistory(int daysAgo)
    {
        var loc = await RequireLocAsync();
        var date = DateTime.Today.AddDays(-daysAgo);
        var h = await _service.GetHistoricalAsync(loc, date.ToString("yyyyMMdd", CultureInfo.InvariantCulture))
                ?? throw new QWeatherApiException(400, "无数据", null!);

        var body = new StackPanel { Spacing = Fluent.SpaceS };
        var d = h.WeatherDaily;
        body.Children.Add(BuildStatChips(new (string, string)[]
        {
            ("日期", d?.Date ?? "--"),
            ("最高温", d?.TempMax != null ? $"{d.TempMax}℃" : "--"),
            ("最低温", d?.TempMin != null ? $"{d.TempMin}℃" : "--"),
            ("湿度", d?.Humidity != null ? $"{d.Humidity}%" : "--"),
            ("降水量", d?.Precip != null ? $"{d.Precip}mm" : "--"),
            ("日出", d?.Sunrise ?? "--"),
            ("日落", d?.Sunset ?? "--"),
            ("月相", d?.MoonPhase ?? "--"),
        }));

        var hourly = (h.WeatherHourly ?? new List<QHistoricalHour>())
            .Where(x => !string.IsNullOrEmpty(x.Time))
            .Select(x => (HourLabel(x.Time!), ParseD(x.Temp)))
            .ToList();
        if (hourly.Count > 0)
            body.Children.Add(MiniChart.Line(hourly, Fluent.Accent(), Fluent.TextSecondary(_theme), 110, 46));
        return body;
    }

    // ================= helpers =================

    static double ParseD(string? s) =>
        double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out var v) ? v : 0;

    static string? Short(string? s) => string.IsNullOrEmpty(s) || s.Length <= 6 ? s : s[..6];

    static string Label(string? iso, string fmt)
    {
        if (iso == null) return "--";
        if (DateTimeOffset.TryParse(iso, CultureInfo.InvariantCulture, DateTimeStyles.None, out var t))
            return t.ToString(fmt, CultureInfo.InvariantCulture);
        return iso;
    }

    static string FmtTime(string? iso) => iso == null ? "--" : Label(iso, "MM-dd HH:mm");

    /// <summary>历史逐小时时间标签：API 可能给 "2026-08-29T13:00+08:00" 也可能只给 "13"；统一为 "HH:00"。</summary>
    static string HourLabel(string t)
    {
        if (t.Length >= 16 && t[13] == ':') return t[11..16];
        if (int.TryParse(t, out var hr)) return $"{hr:00}:00";
        return t;
    }

    static string FmtTimeShort(string? iso) => iso == null ? "--" : Label(iso, "HH:mm");

    static string DayLabel(int index, string? iso)
    {
        if (index == 0) return "今天";
        if (index == 1) return "明天";
        if (index == 2) return "后天";
        if (iso != null && DateTimeOffset.TryParse(iso, CultureInfo.InvariantCulture, DateTimeStyles.None, out var t))
            return t.DayOfWeek switch
            {
                DayOfWeek.Monday => "周一",
                DayOfWeek.Tuesday => "周二",
                DayOfWeek.Wednesday => "周三",
                DayOfWeek.Thursday => "周四",
                DayOfWeek.Friday => "周五",
                DayOfWeek.Saturday => "周六",
                _ => "周日"
            };
        return $"D+{index}";
    }

    static string Temp(QValueUnit? v, string unit) =>
        v?.Value is double d ? $"{d:0.#} {unit}" : "--";

    static string Pct(double? ratio) => ratio is double d ? $"{Math.Round(d * 100)} %" : "--";

    static string Val(QValueUnit? v, string unit) =>
        v?.Value is double d ? $"{d:0.#} {unit}" : "--";

    static string Speed(QValueUnit? v) =>
        v?.Value is double d ? $"{d:0.#} m/s" : "--";

    static string WindText(QCurrentWeather c)
    {
        var parts = new List<string>();
        if (c.Wind?.Direction?.Compass is { Length: > 0 } cp) parts.Add(WeatherWidget.CompassZh(cp));
        if (c.Wind?.Speed?.Value is double s) parts.Add($"{s:0.#} m/s");
        if (c.Wind?.Scale is double sc) parts.Add($"{Math.Round(sc)}级");
        return parts.Count == 0 ? "--" : string.Join(" ", parts);
    }

    static string PrecipText(QCurrentWeather c) =>
        c.Precipitation?.Amount?.Value is double a
            ? $"{a:0.#}mm（{PrecipTypeZh(c.Precipitation?.Type)}）"
            : "无";

    static string PrecipTypeZh(string? type) => type?.ToLowerInvariant() switch
    {
        "rain" => "雨",
        "snow" => "雪",
        _ => type ?? "-"
    };

    static string VisibilityText(QCurrentWeather c)
    {
        if (c.Visibility?.Value is not double v) return "--";
        return v >= 1000 ? $"{v / 1000:0.#} km" : $"{v:0} m";
    }
}
