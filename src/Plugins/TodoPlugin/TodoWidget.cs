using Microsoft.UI.Dispatching;
using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using PluginContract;
using SharedUtils;
using Windows.UI.Text;

namespace TodoPlugin;

public sealed class TodoWidget : UserControl, IDisposable
{
    readonly IHostHandle _host;
    readonly TodoStore _store;
    readonly Action<TodoItem> _onToggle;
    readonly TodoOverlay _overlay = new();

    WidgetTile _tile = null!;
    StackPanel _preview = null!;
    ListView? _taskList;
    ContentControl? _detailHost;
    TextBox? _searchBox;
    ComboBox? _listCombo;
    TodoItem? _selected;
    string _currentList = TodoStore.DefaultList;
    string _lastTileSnapshot = "";
    string _lastSavedSelectedId = "";
    ProgressBar? _subProgress;
    TextBlock? _subProgressText;
    double _detailMinHeight = 320;
    readonly DispatcherQueueTimer _searchDebounce;

    public TodoWidget(IHostHandle host, TodoStore store, Action<TodoItem> onToggle)
    {
        _host = host;
        _store = store;
        _onToggle = onToggle;

        _currentList = _host.GetConfig(nameof(TodoPlugin), "current_list") ?? TodoStore.DefaultList;

        var savedId = _host.GetConfig(nameof(TodoPlugin), "selected_item_id") ?? "";
        _lastSavedSelectedId = savedId;
        if (!string.IsNullOrEmpty(savedId))
            _selected = _store.Items.FirstOrDefault(i => i.Id == savedId);

        _searchDebounce = DispatcherQueue.CreateTimer();
        _searchDebounce.Interval = TimeSpan.FromMilliseconds(250);
        _searchDebounce.IsRepeating = false;
        _searchDebounce.Tick += (_, _) => RebuildTaskList();

        // 磁贴"今天/逾期"标签随时间变化，每分钟轻量刷新（快照比对无变化则无开销）
        var tileTimer = DispatcherQueue.CreateTimer();
        tileTimer.Interval = TimeSpan.FromSeconds(30);
        tileTimer.IsRepeating = true;
        tileTimer.Tick += (_, _) => RefreshTile();
        tileTimer.Start();

        BuildUi();
        _store.Changed += OnStoreChanged;

        Loaded += (_, _) => { ApplyTheme(((FrameworkElement)this).ActualTheme); RefreshTile(); };
        ActualThemeChanged += (_, _) => { ApplyTheme(((FrameworkElement)this).ActualTheme); RefreshTile(); };
    }

    bool HideDone => (_host.GetConfig(nameof(TodoPlugin), "hide_done") ?? "false") == "true";

    void BuildUi()
    {
        _preview = new StackPanel { Spacing = Fluent.SpaceS };
        var content = new Grid { Padding = new Thickness(Fluent.SpaceL, Fluent.SpaceM, Fluent.SpaceL, Fluent.SpaceM) };
        content.Children.Add(_preview);
        _tile = WidgetTile.Create(content, "待办事项").Tap(OpenDetail);
        Content = _tile;
    }

    static Brush Res(string key) =>
        Application.Current.Resources.TryGetValue(key, out var v) && v is Brush b
            ? b
            : Fluent.TextPrimary(ElementTheme.Dark);

    void ApplyTheme(ElementTheme theme)
    {
        _tile.ApplyTheme(theme, (Brush)_host.GetWidgetBackgroundBrush());
        RefreshTile();
    }

    public void OnStoreChanged()
    {
        RefreshTile();
        if (_overlay.IsOpen)
        {
            if (_listCombo != null) { _listCombo.Items.Clear(); foreach (var n in _store.ListNames) _listCombo.Items.Add(n); _listCombo.SelectedItem = _currentList; }
            RebuildTaskList();
        }
    }

    // ---- tile preview ----

    void RefreshTile()
    {
        var items = _store.ItemsInList(_currentList).AsEnumerable();
        if (HideDone) items = items.Where(i => !i.Done);
        var list = items.Take(5).ToList();
        var pending = items.Count(i => !i.Done);

        var snapshot = string.Join(",", list.Select(i => $"{i.Id}:{i.Done}:{(int)i.Priority}:{i.Deadline?.Ticks}:{i.Repeat}:{i.Text}:{i.Tags}:{i.Subtasks.Count(s => s.Done)}/{i.Subtasks.Count}"))
            + $"|{pending}|{_store.ListNames.Length}|{_currentList}"
            + $"|{DateTime.Now.Ticks / TimeSpan.TicksPerMinute}";
        if (snapshot == _lastTileSnapshot) return;
        _lastTileSnapshot = snapshot;

        var primary = Res("TextFillColorPrimaryBrush");
        var secondary = Res("TextFillColorSecondaryBrush");
        var tertiary = Res("TextFillColorTertiaryBrush");
        var critical = Res("SystemFillColorCriticalBrush");
        _preview.Children.Clear();

        var count = _store.ListNames.Length;
        var head = new TextBlock
        {
            Text = count > 1 ? $"待办 · {_currentList} · {pending}" : $"待办 · {pending}",
            FontSize = 14,
            LineHeight = 20,
            FontWeight = FontWeights.SemiBold,
            Foreground = secondary
        };
        _preview.Children.Add(head);

        if (list.Count == 0)
        {
            _preview.Children.Add(Fluent.EmptyState("暂无待办，点击添加", ElementTheme.Dark));
            return;
        }

        foreach (var item in list)
        {
            var row = new Grid { ColumnSpacing = 4 };
            row.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            row.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var overdue = !item.Done && item.Deadline is { } dl && dl < DateTime.Now;

            var dotBrush = PriorityBrush(item.Priority);
            if (dotBrush != null)
            {
                var dot = new Ellipse
                {
                    Width = 8, Height = 8,
                    Fill = dotBrush,
                    VerticalAlignment = VerticalAlignment.Center
                };
                Grid.SetColumn(dot, 0);
                row.Children.Add(dot);
            }

            var title = new TextBlock
            {
                Text = (item.Done ? "\u2713 " : "\u25CB ") + item.Text + (item.Repeat != RepeatKind.None ? " \u21BB" : ""),
                FontSize = 14,
                Foreground = item.Done ? secondary : primary,
                TextTrimming = TextTrimming.CharacterEllipsis,
                TextDecorations = item.Done ? TextDecorations.Strikethrough : TextDecorations.None,
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetColumn(title, 1);
            row.Children.Add(title);

            var ddl = DeadlineShort(item);
            if (ddl != null)
            {
                var ddlText = new TextBlock
                {
                    Text = ddl,
                    FontSize = 12,
                    Margin = new Thickness(8, 0, 0, 0),
                    VerticalAlignment = VerticalAlignment.Center,
                    Foreground = overdue ? critical : secondary
                };
                Grid.SetColumn(ddlText, 2);
                row.Children.Add(ddlText);
            }

            _preview.Children.Add(row);
        }
    }

    static string? DeadlineShort(TodoItem item)
    {
        if (item.Deadline is not { } dl) return null;
        if (!item.Done && dl < DateTime.Now) return "逾期";
        var d = dl.Date;
        var today = DateTime.Today;
        if (d == today) return dl.ToString("今天 HH:mm");
        if (d == today.AddDays(1)) return dl.ToString("明天 HH:mm");
        return dl.ToString("MM-dd HH:mm");
    }

    static string PriorityTag(Priority p) => p switch
    {
        Priority.High => "!! ",
        Priority.Medium => "! ",
        Priority.Low => "· ",
        _ => ""
    };

    static Brush? PriorityBrush(Priority p) => p switch
    {
        Priority.High => Res("SystemFillColorCriticalBrush"),
        Priority.Medium => Res("SystemFillColorCautionBrush"),
        Priority.Low => Res("TextFillColorTertiaryBrush"),
        _ => null
    };

    bool AutoCompleteSub => (_host.GetConfig(nameof(TodoPlugin), "auto_complete_on_subtasks") ?? "true") == "true";

    void ShareList()
    {
        var items = _store.ItemsInList(_currentList).Where(i => !i.Done).ToList();
        var sb = new System.Text.StringBuilder();
        foreach (var i in items)
        {
            var tag = i.Priority switch { Priority.High => "!!", Priority.Medium => "!", Priority.Low => "·", _ => "" };
            var dl = i.Deadline is { } d ? $" — 截止 {d:MM-dd HH:mm}" : "";
            sb.AppendLine($"{tag} {i.Text}{dl}");
        }
        var result = sb.ToString();
        try
        {
            Windows.ApplicationModel.DataTransfer.DataPackage dp = new();
            dp.SetText(result);
            Windows.ApplicationModel.DataTransfer.Clipboard.SetContent(dp);
        }
        catch { }
    }

    // ---- full-screen (Fluent Design fixed-size master-detail) ----

    void OpenDetail()
    {
        var root = XamlRoot?.Content as FrameworkElement;
        var winH = root?.ActualHeight > 0 ? root.ActualHeight : 960;

        var primary = Res("TextFillColorPrimaryBrush");
        var secondary = Res("TextFillColorSecondaryBrush");

        // 宽度交给 BasePluginOverlay 统一锚定（min(w-120, 780)），高度按窗口比例
        var cols = new Grid
        {
            Height = Math.Min(winH * 0.62, winH - 200),
            ColumnSpacing = Fluent.SpaceXL,
            RowSpacing = Fluent.SpaceL
        };
        cols.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(35, GridUnitType.Star) });
        cols.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(65, GridUnitType.Star) });
        cols.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        cols.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
        cols.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        // 空态卡需要撑满右列（减去顶行与底行）
        _detailMinHeight = Math.Max(320, cols.Height - 150);

        // -- top row: 列表选择（固定宽度）+ 列表管理按钮 --
        var topRow = new Grid { ColumnSpacing = Fluent.SpaceS };
        topRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        topRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        topRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        topRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

        var listCombo = new ComboBox { HorizontalAlignment = HorizontalAlignment.Stretch, MinHeight = Fluent.TouchTarget };
        _listCombo = listCombo;
        void PopLists() { listCombo.Items.Clear(); foreach (var n in _store.ListNames) listCombo.Items.Add(n); listCombo.SelectedItem = _currentList; }
        PopLists();
        listCombo.SelectionChanged += (_, _) => { if (listCombo.SelectedItem is string s && s != _currentList) { _currentList = s; _host.SetConfig(nameof(TodoPlugin), "current_list", s); RebuildTaskList(); } };
        Grid.SetColumn(listCombo, 0);

        var renameBtn = Fluent.IconButton("\uE70F", "重命名列表", null, "重命名列表");
        renameBtn.Click += (_, _) =>
        {
            if (_currentList == TodoStore.DefaultList || _currentList == TodoStore.InboxList) return;
            listCombo.IsEditable = true;
            listCombo.Focus(FocusState.Programmatic);
        };
        Grid.SetColumn(renameBtn, 1);

        var newBtn = Fluent.IconButton("\uE710", "新建列表", null, "新建列表");
        newBtn.Click += async (_, _) =>
        {
            var input = new TextBox { PlaceholderText = "列表名称…", Width = 200 };
            var dialog = new ContentDialog
            {
                Title = "新建列表",
                Content = input,
                PrimaryButtonText = "创建",
                CloseButtonText = "取消",
                DefaultButton = ContentDialogButton.Primary,
                XamlRoot = XamlRoot
            };
            input.KeyDown += (s, e2) => { if (e2.Key == Windows.System.VirtualKey.Enter) dialog.Hide(); };
            if (await dialog.ShowAsync() == ContentDialogResult.Primary && !string.IsNullOrWhiteSpace(input.Text))
            {
                if (_store.CreateList(input.Text.Trim()))
                {
                    _currentList = input.Text.Trim();
                    _host.SetConfig(nameof(TodoPlugin), "current_list", _currentList);
                    RebuildTaskList();
                    PopLists();
                }
            }
        };
        Grid.SetColumn(newBtn, 2);

        var delBtn = Fluent.IconButton("\uE74D", "删除列表", null, "删除列表");
        delBtn.Click += async (_, _) =>
        {
            if (_currentList == TodoStore.DefaultList || _currentList == TodoStore.InboxList) return;
            var confirm = new ContentDialog
            {
                Title = "删除列表",
                Content = $"确定删除列表「{_currentList}」及其所有任务吗？此操作不可撤销。",
                PrimaryButtonText = "删除",
                CloseButtonText = "取消",
                DefaultButton = ContentDialogButton.Close,
                XamlRoot = XamlRoot
            };
            if (await confirm.ShowAsync() == ContentDialogResult.Primary)
            {
                var deleted = _currentList;
                _currentList = TodoStore.DefaultList;
                _host.SetConfig(nameof(TodoPlugin), "current_list", _currentList);
                _store.DeleteList(deleted);
                RebuildTaskList();
                PopLists();
            }
        };
        Grid.SetColumn(delBtn, 3);

        topRow.Children.Add(listCombo);
        topRow.Children.Add(renameBtn);
        topRow.Children.Add(newBtn);
        topRow.Children.Add(delBtn);
        Grid.SetRow(topRow, 0);
        Grid.SetColumnSpan(topRow, 2);
        cols.Children.Add(topRow);

        // -- left column --
        var leftCol = new Grid { RowSpacing = Fluent.SpaceM };
        leftCol.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        leftCol.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
        leftCol.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

        var sb = new TextBox { PlaceholderText = "搜索…", MinHeight = Fluent.TouchTarget };
        _searchBox = sb;
        sb.TextChanged += (_, _) =>
        {
            _searchDebounce.Stop();
            _searchDebounce.Start();
        };
        Grid.SetRow(sb, 0);
        leftCol.Children.Add(sb);

        _taskList = new ListView { SelectionMode = ListViewSelectionMode.Single };
        var leftCard = Fluent.Card(ElementTheme.Dark, new Thickness(Fluent.SpaceS));
        leftCard.Child = _taskList;
        Grid.SetRow(leftCard, 1);
        leftCol.Children.Add(leftCard);

        var addRow = new Grid { ColumnSpacing = Fluent.SpaceS };
        addRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        addRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        var inp = new TextBox { PlaceholderText = "添加任务…", MinHeight = Fluent.TouchTarget, VerticalAlignment = VerticalAlignment.Center };
        void DoAdd()
        {
            if (string.IsNullOrWhiteSpace(inp.Text)) return;
            _selected = _store.Add(inp.Text, _currentList);
            _store.Save();
            inp.Text = "";
            RebuildTaskList();
        }
        inp.KeyDown += (_, e) => { if (e.Key == Windows.System.VirtualKey.Enter) DoAdd(); };
        var addBtn = Fluent.Cta("添加", DoAdd, accent: true);
        Grid.SetColumn(inp, 0); Grid.SetColumn(addBtn, 1);
        addRow.Children.Add(inp); addRow.Children.Add(addBtn);
        Grid.SetRow(addRow, 2);
        leftCol.Children.Add(addRow);

        Grid.SetRow(leftCol, 1);
        Grid.SetColumn(leftCol, 0);
        cols.Children.Add(leftCol);

        // -- right column --
        _detailHost = new ContentControl { HorizontalContentAlignment = HorizontalAlignment.Stretch, VerticalAlignment = VerticalAlignment.Stretch };
        var rightPanel = new ScrollViewer { Content = _detailHost, VerticalScrollBarVisibility = ScrollBarVisibility.Auto };
        Grid.SetRow(rightPanel, 1);
        Grid.SetColumn(rightPanel, 1);
        cols.Children.Add(rightPanel);

        // bottom toolbar
        var bottomRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = Fluent.SpaceM, VerticalAlignment = VerticalAlignment.Center };

        var clearBtn = Fluent.Cta("清除已完成", () => { _store.ClearCompleted(_currentList); RebuildTaskList(); }, accent: false);
        bottomRow.Children.Add(clearBtn);

        var statsBtn = Fluent.Cta("统计", OpenStats, accent: false);
        bottomRow.Children.Add(statsBtn);

        var shareBtn = Fluent.Cta("分享", ShareList, accent: false);
        bottomRow.Children.Add(shareBtn);

        Grid.SetRow(bottomRow, 2);
        Grid.SetColumnSpan(bottomRow, 2);
        cols.Children.Add(bottomRow);

        _overlay.Show(this, "待办事项", cols, _host.Log, width: 1100);
        RebuildTaskList();
    }

    void RebuildTaskList(bool rebuildDetail = true)
    {
        if (_taskList == null) return;
        var primary = Res("TextFillColorPrimaryBrush");
        var secondary = Res("TextFillColorSecondaryBrush");
        var critical = Res("SystemFillColorCriticalBrush");
        var groupBg = Res("SubtleFillColorTertiaryBrush");

        _taskList.SelectionChanged -= OnTaskSelectionChanged;
        _taskList.Items.Clear();

        var items = _store.ItemsInList(_currentList).AsEnumerable();
        if (HideDone) items = items.Where(i => !i.Done);
        var q = _searchBox?.Text;
        if (!string.IsNullOrWhiteSpace(q))
            items = items.Where(i => i.Text.Contains(q, StringComparison.OrdinalIgnoreCase)
                || (i.Tags ?? "").Contains(q, StringComparison.OrdinalIgnoreCase)
                || (i.Note ?? "").Contains(q, StringComparison.OrdinalIgnoreCase));

        var now = DateTime.Now;
        var sorted = items
            .OrderBy(i => TodoStore.SortOrder(i, now))
            .ThenByDescending(i => (int)i.Priority)
            .ThenBy(i => i.Deadline)
            .ToList();
        var groupCounts = sorted.GroupBy(i => TodoStore.SortOrder(i, now)).ToDictionary(g => g.Key, g => g.Count());

        ListViewItem? toSelect = null;
        int? lastGroup = null;

        foreach (var item in sorted)
        {
            var g = TodoStore.SortOrder(item, now);
            if (g != lastGroup)
            {
                var gh = new Border
                {
                    Margin = new Thickness(0, Fluent.SpaceS, 0, Fluent.SpaceXS),
                    Padding = new Thickness(Fluent.SpaceM, Fluent.SpaceS, Fluent.SpaceM, Fluent.SpaceS),
                    CornerRadius = new CornerRadius(Fluent.RadiusControl),
                    Background = groupBg,
                    Child = new TextBlock
                    {
                        Text = GroupTitle(g) + $" · {groupCounts.GetValueOrDefault(g)} 项",
                        FontSize = 12,
                        LineHeight = 16,
                        FontWeight = FontWeights.SemiBold,
                        Foreground = secondary
                    }
                };
                _taskList.Items.Add(new ListViewItem { Content = gh, IsHitTestVisible = false });
                lastGroup = g;
            }

            var check = new CheckBox { IsChecked = item.Done, MinWidth = 0, Margin = new Thickness(0), VerticalAlignment = VerticalAlignment.Center };
            check.Click += (_, _) => _onToggle(item);

            var txt = new TextBlock
            {
                Text = item.Text,
                FontSize = 14,
                Foreground = item.Done ? secondary : primary,
                TextDecorations = item.Done ? TextDecorations.Strikethrough : TextDecorations.None,
                TextTrimming = TextTrimming.CharacterEllipsis,
                VerticalAlignment = VerticalAlignment.Center
            };
            if (item.Priority > Priority.None) txt.Text = PriorityTag(item.Priority) + " " + txt.Text;

            var meta = "";
            if (!string.IsNullOrWhiteSpace(item.Tags)) meta += "\uEABB " + item.Tags;
            if (item.Repeat != RepeatKind.None) meta += (meta.Length > 0 ? "  " : "") + "\u21BB";
            if (item.Subtasks.Count > 0) meta += (meta.Length > 0 ? "  " : "") + $"{item.Subtasks.Count(s => s.Done)}/{item.Subtasks.Count}";

            var ext = new TextBlock { Text = meta, FontSize = 12, LineHeight = 16, Foreground = secondary, Opacity = 0.75, Margin = new Thickness(0, 2, 0, 0) };
            Grid.SetColumn(ext, 1);
            Grid.SetRow(ext, 1);

            var line1 = new Grid { ColumnSpacing = 6 };
            line1.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            line1.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            Grid.SetColumn(check, 0); Grid.SetColumn(txt, 1);
            line1.Children.Add(check); line1.Children.Add(txt);

            var row = new Grid();
            row.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            row.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            row.Children.Add(line1);

            var dlv = DeadlineShort(item);
            if (dlv != null || meta.Length > 0)
            {
                var subItems = new StackPanel { Spacing = 2 };
                if (dlv != null)
                {
                    var overdue = !item.Done && item.Deadline is { } d && d < DateTime.Now;
                    subItems.Children.Add(new TextBlock { Text = dlv, FontSize = 12, LineHeight = 16, Foreground = overdue ? critical : secondary });
                }
                if (meta.Length > 0) subItems.Children.Add(ext);
                Grid.SetColumn(subItems, 1); Grid.SetRow(subItems, 1);
                row.Children.Add(subItems);
            }

            var lvi = new ListViewItem { Content = row, Tag = item, HorizontalContentAlignment = HorizontalAlignment.Stretch, MinHeight = Fluent.TouchTarget, Padding = new Thickness(Fluent.SpaceM, Fluent.SpaceS, Fluent.SpaceM, Fluent.SpaceS) };
            _taskList.Items.Add(lvi);
            if (ReferenceEquals(item, _selected)) toSelect = lvi;
        }

        // 先恢复选中再挂事件：程序性赋值不触发 RebuildDetail，
        // 保证 rebuildDetail:false 时编辑器与焦点不被重建
        if (toSelect != null)
        {
            _taskList.SelectedItem = toSelect;
        }
        else if (_selected != null && sorted.Any(i => ReferenceEquals(i, _selected)))
        {
            // 选中项仍在列表中但被过滤视图隐藏（如搜索命中其它项）：保留选中与详情
        }
        else
        {
            _selected = null;
            SaveSelection("");
        }
        _taskList.SelectionChanged += OnTaskSelectionChanged;
        if (rebuildDetail) RebuildDetail();
    }

    void SaveSelection(string id)
    {
        if (_lastSavedSelectedId == id) return;
        _lastSavedSelectedId = id;
        _host.SetConfig(nameof(TodoPlugin), "selected_item_id", id);
    }

    static string GroupTitle(int g) => g switch { 0 => "逾期", 1 => "今天", 2 => "将来", 3 => "无截止", _ => "已完成" };

    void OnTaskSelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        _selected = (_taskList?.SelectedItem as ListViewItem)?.Tag as TodoItem;
        SaveSelection(_selected?.Id ?? "");
        RebuildDetail();
    }

    void RebuildDetail()
    {
        if (_detailHost == null) return;
        _subProgress = null;
        _subProgressText = null;
        var primary = Res("TextFillColorPrimaryBrush");
        var secondary = Res("TextFillColorSecondaryBrush");
        var accent = Res("AccentFillColorDefaultBrush");
        var success = Res("SystemFillColorSuccessBrush");
        var critical = Res("SystemFillColorCriticalBrush");

        if (_selected is not { } item)
        {
            _detailHost.Content = new Border
            {
                CornerRadius = new CornerRadius(Fluent.RadiusCard),
                Padding = new Thickness(32),
                MinHeight = _detailMinHeight,
                Background = Res("CardBackgroundFillColorDefaultBrush"),
                BorderThickness = new Thickness(1),
                BorderBrush = Res("CardStrokeColorDefaultBrush"),
                VerticalAlignment = VerticalAlignment.Stretch,
                Child = Fluent.EmptyState("选择左侧任务以编辑", ElementTheme.Dark, "\uE70F")
            };
            return;
        }

        var card = new Border
        {
            CornerRadius = new CornerRadius(Fluent.RadiusCard),
            Padding = new Thickness(Fluent.SpaceXL),
            Background = Res("CardBackgroundFillColorDefaultBrush"),
            BorderThickness = new Thickness(1),
            BorderBrush = Res("CardStrokeColorDefaultBrush")
        };

        var stack = new StackPanel { Spacing = Fluent.SpaceXL };

        // title row
        var titleRow = new Grid { ColumnSpacing = Fluent.SpaceM };
        titleRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        titleRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        var ttl = new TextBlock { Text = item.Text, FontSize = 20, LineHeight = 28, FontWeight = FontWeights.SemiBold, Foreground = primary, TextWrapping = TextWrapping.Wrap, VerticalAlignment = VerticalAlignment.Center };
        Grid.SetColumn(ttl, 0);

        // priority picker
        var pcb = new ComboBox { Width = 80, MinHeight = Fluent.TouchTarget };
        pcb.Items.Add(new ComboBoxItem { Content = "无", Tag = Priority.None });
        pcb.Items.Add(new ComboBoxItem { Content = "低", Tag = Priority.Low });
        pcb.Items.Add(new ComboBoxItem { Content = "中", Tag = Priority.Medium });
        pcb.Items.Add(new ComboBoxItem { Content = "高", Tag = Priority.High });
        pcb.SelectedIndex = (int)item.Priority;
        pcb.SelectionChanged += (_, _) => { if (pcb.SelectedItem is ComboBoxItem ci && ci.Tag is Priority p) { item.Priority = p; SaveDetailEdit(); } };
        Grid.SetColumn(pcb, 1);
        titleRow.Children.Add(ttl); titleRow.Children.Add(pcb);
        stack.Children.Add(titleRow);

        // tags
        var tbx = new TextBox { PlaceholderText = "标签（逗号分隔）", Text = item.Tags ?? "", HorizontalAlignment = HorizontalAlignment.Stretch, MinHeight = Fluent.TouchTarget };
        tbx.LostFocus += (_, _) => { item.Tags = tbx.Text; SaveDetailEdit(); };
        stack.Children.Add(tbx);

        stack.Children.Add(Sep());

        // deadline section
        stack.Children.Add(SectHead("截止日期", secondary));
        var dp = new CalendarDatePicker { HorizontalAlignment = HorizontalAlignment.Stretch, Date = item.Deadline };
        var tp = new TimePicker { ClockIdentifier = "24HourClock", HorizontalAlignment = HorizontalAlignment.Stretch };
        if (item.Deadline is { } dl0) tp.Time = dl0.TimeOfDay;
        void UpdDdl()
        {
            if (dp.Date is { } dd) { item.Deadline = dd.Date + tp.Time; item.Reminded = false; }
            else item.Deadline = null;
            SaveDetailEdit();
        }
        dp.DateChanged += (_, _) => UpdDdl();
        tp.TimeChanged += (_, _) => UpdDdl();
        var cdl = Fluent.Cta("清除截止", () => { dp.Date = null; item.Deadline = null; item.Reminded = false; SaveDetailEdit(); RebuildDetail(); }, accent: false);
        cdl.HorizontalAlignment = HorizontalAlignment.Left;
        var ds = new StackPanel { Spacing = Fluent.SpaceS };
        ds.Children.Add(dp); ds.Children.Add(tp); ds.Children.Add(cdl);
        stack.Children.Add(ds);

        // repeat + lead
        stack.Children.Add(SectHead("重复与提醒", secondary));
        var rcb = new ComboBox { HorizontalAlignment = HorizontalAlignment.Stretch };
        foreach (var k in new[] { RepeatKind.None, RepeatKind.Daily, RepeatKind.Weekly, RepeatKind.Monthly, RepeatKind.Workday })
            rcb.Items.Add(new ComboBoxItem { Content = RepeatName(k), Tag = k });
        rcb.SelectedIndex = (int)item.Repeat;
        rcb.SelectionChanged += (_, _) => { if (rcb.SelectedItem is ComboBoxItem ci && ci.Tag is RepeatKind rk) { item.Repeat = rk; SaveDetailEdit(); } };
        var ldb = new NumberBox { Minimum = 0, Maximum = 1440, SpinButtonPlacementMode = NumberBoxSpinButtonPlacementMode.Inline, Value = item.LeadMinutes, HorizontalAlignment = HorizontalAlignment.Stretch, Header = "提前（分钟）" };
        ldb.ValueChanged += (_, _) => { if (!double.IsNaN(ldb.Value)) { item.LeadMinutes = (int)ldb.Value; SaveDetailEdit(); } };
        var rs2 = new StackPanel { Spacing = Fluent.SpaceS };
        rs2.Children.Add(rcb); rs2.Children.Add(ldb);
        stack.Children.Add(rs2);

        stack.Children.Add(Sep());

        // note
        var nb = new TextBox { PlaceholderText = "备注…", Text = item.Note ?? "", AcceptsReturn = true, TextWrapping = TextWrapping.Wrap, MinHeight = 64, HorizontalAlignment = HorizontalAlignment.Stretch, Header = "备注" };
        nb.LostFocus += (_, _) => { item.Note = nb.Text; SaveDetailEdit(); };
        stack.Children.Add(nb);

        // subtasks
        stack.Children.Add(Sep());
        var ss = new StackPanel { Spacing = Fluent.SpaceS };
        ss.Children.Add(SectHead("子任务", secondary));

        if (item.Subtasks.Count > 0)
        {
            var doneCount = item.Subtasks.Count(s => s.Done);
            var totalCount = item.Subtasks.Count;
            var progRow = new Grid { ColumnSpacing = Fluent.SpaceS };
            progRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            progRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            var pb = new ProgressBar { Value = (double)doneCount / totalCount * 100, Minimum = 0, Maximum = 100, Height = 6, Foreground = doneCount == totalCount ? success : accent };
            _subProgress = pb;
            Grid.SetColumn(pb, 0);
            progRow.Children.Add(pb);
            var progressText = new TextBlock { Text = $"{doneCount}/{totalCount}", FontSize = 12, LineHeight = 16, Foreground = secondary, VerticalAlignment = VerticalAlignment.Center };
            _subProgressText = progressText;
            Grid.SetColumn(progressText, 1);
            progRow.Children.Add(progressText);
            ss.Children.Add(progRow);
        }
        foreach (var st in item.Subtasks.ToList())
        {
            var sr = new Grid { ColumnSpacing = Fluent.SpaceXS };
            sr.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            sr.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            var ch = new CheckBox { IsChecked = st.Done, Content = st.Text, MinHeight = Fluent.TouchTarget, VerticalContentAlignment = VerticalAlignment.Center };
            ch.Click += (_, _) =>
            {
                st.Done = ch.IsChecked == true;
                if (AutoCompleteSub && item.Subtasks.All(s => s.Done)) { item.Done = true; item.CompletedDate = DateTime.Today; }
                _store.SaveQuiet();
                UpdateSubProgress(item);
                RebuildTaskList(rebuildDetail: false);
                RefreshTile();
            };
            Grid.SetColumn(ch, 0);
            var sd = Fluent.IconButton("\uE711", $"删除子任务 {st.Text}", () => { item.Subtasks.Remove(st); SaveDetailEdit(); RebuildDetail(); }, "删除", 12);
            Grid.SetColumn(sd, 1);
            sr.Children.Add(ch); sr.Children.Add(sd);
            ss.Children.Add(sr);
        }
        var sa = new Grid { ColumnSpacing = Fluent.SpaceS };
        sa.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        sa.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        var si = new TextBox { PlaceholderText = "新增子任务…", MinHeight = Fluent.TouchTarget, VerticalAlignment = VerticalAlignment.Center };
        var sbtn = Fluent.IconButton("\uE710", "新增子任务", null, "新增");
        void SDo() { if (string.IsNullOrWhiteSpace(si.Text)) return; item.Subtasks.Add(new Subtask { Text = si.Text.Trim() }); SaveDetailEdit(); RebuildDetail(); }
        sbtn.Click += (_, _) => SDo();
        si.KeyDown += (_, e) => { if (e.Key == Windows.System.VirtualKey.Enter) SDo(); };
        Grid.SetColumn(si, 0); Grid.SetColumn(sbtn, 1);
        sa.Children.Add(si); sa.Children.Add(sbtn);
        ss.Children.Add(sa);
        stack.Children.Add(ss);

        // delete
        var delBtn = Fluent.Cta("删除任务", () => { _store.Delete(item); _selected = null; SaveSelection(""); RebuildTaskList(); }, accent: false);
        delBtn.Foreground = critical;
        delBtn.HorizontalAlignment = HorizontalAlignment.Left;
        delBtn.Margin = new Thickness(0, Fluent.SpaceS, 0, 0);
        stack.Children.Add(delBtn);

        card.Child = stack;
        _detailHost.Content = card;
    }

    void SaveDetailEdit()
    {
        _store.SaveQuiet();
        RebuildTaskList(rebuildDetail: false);
        RefreshTile();
    }

    void UpdateSubProgress(TodoItem item)
    {
        if (_selected != item || item.Subtasks.Count == 0) return;
        if (_subProgress == null || _subProgressText == null) return;
        var doneCount = item.Subtasks.Count(s => s.Done);
        var totalCount = item.Subtasks.Count;
        _subProgress.Value = (double)doneCount / totalCount * 100;
        _subProgress.Foreground = doneCount == totalCount ? Res("SystemFillColorSuccessBrush") : Res("AccentFillColorDefaultBrush");
        _subProgressText.Text = $"{doneCount}/{totalCount}";
    }

    static Border Sep() => new() { Height = 1, Background = Res("DividerStrokeColorDefaultBrush") };

    static TextBlock SectHead(string text, Brush color) => new() { Text = text, FontSize = 12, LineHeight = 16, FontWeight = FontWeights.SemiBold, Foreground = color, Opacity = 0.7, Margin = new Thickness(0, 0, 0, Fluent.SpaceXS) };

    static string RepeatName(RepeatKind k) => k switch
    {
        RepeatKind.Daily => "每天",
        RepeatKind.Weekly => "每周",
        RepeatKind.Monthly => "每月",
        RepeatKind.Workday => "法定工作日",
        _ => "不重复"
    };

    public void Dispose()
    {
        _store.Changed -= OnStoreChanged;
    }

    internal void SetWidgetBackground(Brush brush) => _tile.ApplyTheme(((FrameworkElement)this).ActualTheme, brush);

    void OpenStats()
    {
        var items = _store.ItemsInList(_currentList);
        var today = DateTime.Today;
        var todayDone = 0;
        var overdue = 0;
        var weekly = new int[7];
        foreach (var i in items)
        {
            if (!i.Done)
            {
                if (i.Deadline is { } dl && dl < DateTime.Now) overdue++;
                continue;
            }
            if (i.CompletedDate is not { } cd) continue;
            if (cd.Date == today) todayDone++;
            for (int k = 0; k < 7; k++)
            {
                if (cd.Date == today.AddDays(-k)) { weekly[k]++; break; }
            }
        }
        var totalDoneThisWeek = weekly.Sum();
        var weeklySeries = Enumerable.Range(0, 7).Select(offset =>
        {
            var d = today.AddDays(-offset);
            return (d.ToString("MM-dd"), (double)weekly[offset]);
        }).Reverse().ToList();

        var primary = Res("TextFillColorPrimaryBrush");
        var secondary = Res("TextFillColorSecondaryBrush");
        var accent = Res("AccentFillColorDefaultBrush");

        // 标题由弹层头部统一展示，正文不再重复
        var body = new StackPanel { Spacing = Fluent.SpaceM, MinWidth = 320 };

        var grid = new Grid { ColumnSpacing = Fluent.SpaceXL };
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

        void AddStat(int col, string label, string value)
        {
            var s = new StackPanel { Spacing = Fluent.SpaceXS };
            s.Children.Add(new TextBlock { Text = value, FontSize = 28, LineHeight = 36, FontWeight = FontWeights.SemiBold, Foreground = primary });
            s.Children.Add(new TextBlock { Text = label, FontSize = 12, LineHeight = 16, Foreground = secondary });
            var chip = new Border
            {
                CornerRadius = new CornerRadius(Fluent.RadiusControl),
                Padding = new Thickness(Fluent.SpaceM, Fluent.SpaceS, Fluent.SpaceM, Fluent.SpaceS),
                Background = Res("CardBackgroundFillColorSecondaryBrush"),
                BorderThickness = new Thickness(1),
                BorderBrush = Res("CardStrokeColorDefaultBrush"),
                Child = s
            };
            Grid.SetColumn(chip, col);
            grid.Children.Add(chip);
        }

        AddStat(0, "今日完成", todayDone.ToString());
        AddStat(1, "本周完成", totalDoneThisWeek.ToString());
        AddStat(2, "逾期", overdue.ToString());
        AddStat(3, "总计", items.Count.ToString());
        body.Children.Add(grid);

        body.Children.Add(new Border { Height = 1, Background = Res("DividerStrokeColorDefaultBrush") });
        body.Children.Add(new TextBlock { Text = "近 7 天完成趋势", FontSize = 14, LineHeight = 20, FontWeight = FontWeights.SemiBold, Foreground = primary });
        body.Children.Add(MiniChart.Line(weeklySeries, accent, secondary));

        // 不关闭主界面：统计 overlay 关闭后回到待办主视图
        var statsOverlay = new BasePluginOverlay();
        statsOverlay.Show(this, "待办统计", body, _host.Log);
    }
}
