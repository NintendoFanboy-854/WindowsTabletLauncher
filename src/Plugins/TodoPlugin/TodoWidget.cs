using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using Windows.UI;
using Windows.UI.Text;

namespace TodoPlugin;

public sealed class TodoWidget : UserControl
{
    readonly IHostHandle _host;
    readonly TodoStore _store;
    readonly Action<TodoItem> _onToggle;
    readonly TodoOverlay _overlay = new();

    Border _root = null!;
    StackPanel _preview = null!;
    ListView? _taskList;
    ContentControl? _detailHost;
    TextBox? _searchBox;
    ComboBox? _listCombo;
    TodoItem? _selected;
    string _currentList = TodoStore.DefaultList;

    public TodoWidget(IHostHandle host, TodoStore store, Action<TodoItem> onToggle)
    {
        _host = host;
        _store = store;
        _onToggle = onToggle;

        BuildUi();
        _store.Changed += OnStoreChanged;

        Loaded += (_, _) => { ApplyTheme(((FrameworkElement)this).ActualTheme); RefreshTile(); };
        ActualThemeChanged += (_, _) => { ApplyTheme(((FrameworkElement)this).ActualTheme); RefreshTile(); };
    }

    bool HideDone => (_host.GetConfig(nameof(TodoPlugin), "hide_done") ?? "false") == "true";

    void BuildUi()
    {
        _preview = new StackPanel { Spacing = 6 };
        _root = new Border { CornerRadius = new CornerRadius(8), Padding = new Thickness(16, 12, 16, 12), Child = _preview };
        _root.Tapped += (_, _) => OpenDetail();
        Content = _root;
    }

    void ApplyTheme(ElementTheme theme)
    {
        _root.Background = (Brush)_host.GetWidgetBackgroundBrush();
        RefreshTile();
    }

    static (Brush primary, Brush secondary) Brushes(ElementTheme theme) =>
        theme == ElementTheme.Light
            ? (new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A)), new SolidColorBrush(Color.FromArgb(0x99, 0, 0, 0)))
            : (new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF)), new SolidColorBrush(Color.FromArgb(0xCC, 0xFF, 0xFF, 0xFF)));

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
        var (primary, secondary) = Brushes(((FrameworkElement)this).ActualTheme);
        _preview.Children.Clear();

        var items = _store.ItemsInList(_currentList).AsEnumerable();
        if (HideDone) items = items.Where(i => !i.Done);
        var pending = items.Count(i => !i.Done);
        var count = _store.ListNames.Length;
        _preview.Children.Add(new TextBlock
        {
            Text = count > 1 ? $"待办 · {_currentList} · {pending}" : $"待办 · {pending}",
            FontSize = 15,
            FontWeight = FontWeights.SemiBold,
            Foreground = secondary
        });

        var list = items.Take(7).ToList();
        if (list.Count == 0)
        {
            _preview.Children.Add(new TextBlock { Text = "暂无待办", FontSize = 14, Opacity = 0.6, Foreground = secondary });
            return;
        }

        foreach (var item in list)
        {
            var row = new Grid();
            row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            row.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var overdue = !item.Done && item.Deadline is { } dl && dl < DateTime.Now;
            var prefix = PriorityTag(item.Priority);
            var title = new TextBlock
            {
                Text = (item.Done ? "\u2713 " : "\u25CB ") + prefix + item.Text + (item.Repeat != RepeatKind.None ? " \u21BB" : ""),
                FontSize = 14,
                Foreground = item.Done ? secondary : primary,
                TextTrimming = TextTrimming.CharacterEllipsis,
                TextDecorations = item.Done ? TextDecorations.Strikethrough : TextDecorations.None
            };
            Grid.SetColumn(title, 0);
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
                    Foreground = overdue ? new SolidColorBrush(Color.FromArgb(0xFF, 0xE0, 0x3A, 0x3A)) : secondary
                };
                Grid.SetColumn(ddlText, 1);
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

    static Color PriorityColor(Priority p) => p switch
    {
        Priority.High => Color.FromArgb(0xFF, 0xF4, 0x43, 0x36),
        Priority.Medium => Color.FromArgb(0xFF, 0xFF, 0x98, 0x00),
        Priority.Low => Color.FromArgb(0xFF, 0x9E, 0x9E, 0x9E),
        _ => Color.FromArgb(0, 0, 0, 0)
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
        var winW = root?.ActualWidth > 0 ? root.ActualWidth : 1440;
        var winH = root?.ActualHeight > 0 ? root.ActualHeight : 960;

        var cardW = Math.Min(860, winW - 80);
        var cardH = Math.Min(560, winH - 120);

        var cols = new Grid { Width = cardW, Height = cardH, ColumnSpacing = 24, RowSpacing = 16 };
        cols.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(280) });
        cols.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        cols.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        cols.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
        cols.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

        // -- top row (list switcher + search spanning both columns) --
        var topRow = new Grid { ColumnSpacing = 12 };
        topRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        topRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

        var listSw = new ComboBox { HorizontalAlignment = HorizontalAlignment.Stretch };
        _listCombo = listSw;
        void PopLists() { listSw.Items.Clear(); foreach (var n in _store.ListNames) listSw.Items.Add(n); listSw.SelectedItem = _currentList; }
        PopLists();
        listSw.Text = _currentList;
        listSw.TextSubmitted += (_, _) =>
        {
            if (listSw.Items.Contains(listSw.Text)) { _currentList = listSw.Text; RebuildTaskList(); return; }
            if (string.IsNullOrWhiteSpace(listSw.Text) || _currentList == TodoStore.DefaultList) return;
            _store.RenameList(_currentList, listSw.Text);
            _currentList = listSw.Text;
            RebuildTaskList();
        };
        listSw.SelectionChanged += (_, _) => { if (listSw.SelectedItem is string s && s != _currentList) { _currentList = s; RebuildTaskList(); } };
        Grid.SetColumn(listSw, 0);

        var newBtn = new Button
        {
            Content = new FontIcon { Glyph = "\uE710", FontSize = 12 },
            Width = 36, Height = 36, Padding = new Thickness(0),
            VerticalAlignment = VerticalAlignment.Center
        };
        ToolTipService.SetToolTip(newBtn, "新建列表");
        newBtn.Click += (_, _) => { var n = "新列表"; _store.Add("占位", n); _store.ClearCompleted(n); _currentList = n; RebuildTaskList(); PopLists(); };
        Grid.SetColumn(newBtn, 1);

        topRow.Children.Add(listSw);
        topRow.Children.Add(newBtn);
        Grid.SetRow(topRow, 0);
        Grid.SetColumnSpan(topRow, 2);
        cols.Children.Add(topRow);

        // -- left column --
        var leftCol = new Grid { RowSpacing = 12 };
        leftCol.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        leftCol.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
        leftCol.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

        var sb = new TextBox { PlaceholderText = "搜索…" };
        _searchBox = sb;
        sb.TextChanged += (_, _) => RebuildTaskList();
        Grid.SetRow(sb, 0);
        leftCol.Children.Add(sb);

        _taskList = new ListView { SelectionMode = ListViewSelectionMode.Single };
        var leftCard = new Border
        {
            CornerRadius = new CornerRadius(8),
            BorderThickness = new Thickness(1),
            BorderBrush = ((FrameworkElement)this).ActualTheme == ElementTheme.Light
                ? new SolidColorBrush(Color.FromArgb(0x10, 0x00, 0x00, 0x00))
                : new SolidColorBrush(Color.FromArgb(0x10, 0xFF, 0xFF, 0xFF)),
            Child = _taskList
        };
        Grid.SetRow(leftCard, 1);
        leftCol.Children.Add(leftCard);

        var addRow = new Grid { ColumnSpacing = 8 };
        addRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        addRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        var inp = new TextBox { PlaceholderText = "添加任务…", VerticalAlignment = VerticalAlignment.Center };
        void DoAdd()
        {
            if (string.IsNullOrWhiteSpace(inp.Text)) return;
            _selected = _store.Add(inp.Text, _currentList);
            inp.Text = "";
            RebuildTaskList();
        }
        inp.KeyDown += (_, e) => { if (e.Key == Windows.System.VirtualKey.Enter) DoAdd(); };
        var addBtn = new Button { Content = "添加" };
        addBtn.Click += (_, _) => DoAdd();
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
        var bottomRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 12, VerticalAlignment = VerticalAlignment.Center };

        var clearBtn = new Button { Content = "清除已完成", FontSize = 13, Background = new SolidColorBrush(Color.FromArgb(0, 0, 0, 0)), BorderThickness = new Thickness(0), Foreground = Brushes(((FrameworkElement)this).ActualTheme).secondary };
        clearBtn.Click += (_, _) => { _store.ClearCompleted(_currentList); RebuildTaskList(); };
        bottomRow.Children.Add(clearBtn);

        var statsBtn = new Button { Content = "统计", FontSize = 13, Background = new SolidColorBrush(Color.FromArgb(0, 0, 0, 0)), BorderThickness = new Thickness(0), Foreground = Brushes(((FrameworkElement)this).ActualTheme).secondary };
        statsBtn.Click += (_, _) => OpenStats();
        bottomRow.Children.Add(statsBtn);

        var shareBtn = new Button { Content = "分享", FontSize = 13, Background = new SolidColorBrush(Color.FromArgb(0, 0, 0, 0)), BorderThickness = new Thickness(0), Foreground = Brushes(((FrameworkElement)this).ActualTheme).secondary };
        shareBtn.Click += (_, _) => ShareList();
        bottomRow.Children.Add(shareBtn);

        Grid.SetRow(bottomRow, 2);
        Grid.SetColumnSpan(bottomRow, 2);
        cols.Children.Add(bottomRow);

        _overlay.Show(this, "待办事项", cols, _host.Log);
        RebuildTaskList();
    }

    void RebuildTaskList()
    {
        if (_taskList == null) return;
        var (primary, secondary) = Brushes(((FrameworkElement)this).ActualTheme);

        _taskList.SelectionChanged -= OnTaskSelectionChanged;
        _taskList.Items.Clear();

        var items = _store.ItemsInList(_currentList).AsEnumerable();
        if (HideDone) items = items.Where(i => !i.Done);
        var q = _searchBox?.Text;
        if (!string.IsNullOrWhiteSpace(q))
            items = items.Where(i => i.Text.Contains(q, StringComparison.OrdinalIgnoreCase)
                || (i.Tags ?? "").Contains(q, StringComparison.OrdinalIgnoreCase)
                || (i.Note ?? "").Contains(q, StringComparison.OrdinalIgnoreCase));

        var sorted = items
            .OrderBy(TodoStore.SortOrder)
            .ThenByDescending(i => (int)i.Priority)
            .ThenBy(i => i.Deadline)
            .ToList();

        ListViewItem? toSelect = null;
        int? lastGroup = null;

        foreach (var item in sorted)
        {
            var g = TodoStore.SortOrder(item);
            if (g != lastGroup)
            {
                var gh = new Border
                {
                    Margin = new Thickness(0, 8, 0, 4),
                    Padding = new Thickness(8, 6, 8, 6),
                    CornerRadius = new CornerRadius(6),
                    Background = ((FrameworkElement)this).ActualTheme == ElementTheme.Light
                        ? new SolidColorBrush(Color.FromArgb(0x08, 0x00, 0x00, 0x00))
                        : new SolidColorBrush(Color.FromArgb(0x08, 0xFF, 0xFF, 0xFF)),
                    Child = new TextBlock
                    {
                        Text = GroupTitle(g) + $" · {sorted.Count(i => TodoStore.SortOrder(i) == g)} 项",
                        FontSize = 12,
                        FontWeight = FontWeights.Medium,
                        Foreground = secondary,
                        Opacity = 0.8
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

            var ext = new TextBlock { Text = meta, FontSize = 11, Foreground = secondary, Opacity = 0.75, Margin = new Thickness(0, 2, 0, 0) };
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

            var pcolor = PriorityColor(item.Priority);
            if (pcolor != Color.FromArgb(0, 0, 0, 0))
            {
                var workloadBar = new Border { Background = new SolidColorBrush(pcolor), Width = 4, CornerRadius = new CornerRadius(2), VerticalAlignment = VerticalAlignment.Stretch, Margin = new Thickness(0, 0, 4, 0) };
                Grid.SetColumn(workloadBar, 0);
                Grid.SetRowSpan(workloadBar, 2);
                // Wrap in a grid to add the color bar
                var wrap = new Grid { ColumnSpacing = 6 };
                wrap.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                wrap.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                wrap.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                Grid.SetColumn(workloadBar, 0);
                wrap.Children.Add(workloadBar);
                Grid.SetColumn(check, 1); Grid.SetColumn(txt, 2);
                line1.Children.Clear();
                wrap.Children.Add(check); wrap.Children.Add(txt);
                row.Children.Add(wrap);
            }
            else
            {
                row.Children.Add(line1);
            }

            var dlv = DeadlineShort(item);
            if (dlv != null || meta.Length > 0)
            {
                var subItems = new StackPanel { Spacing = 2 };
                if (dlv != null)
                {
                    var overdue = !item.Done && item.Deadline is { } d && d < DateTime.Now;
                    subItems.Children.Add(new TextBlock { Text = dlv, FontSize = 11, Foreground = overdue ? new SolidColorBrush(Color.FromArgb(0xFF, 0xE0, 0x3A, 0x3A)) : secondary });
                }
                if (meta.Length > 0) subItems.Children.Add(ext);
                Grid.SetColumn(subItems, 1); Grid.SetRow(subItems, 1);
                if (pcolor != Color.FromArgb(0, 0, 0, 0))
                    row.Children.Add(line1);
                row.Children.Add(subItems);
            }

            var lvi = new ListViewItem { Content = row, Tag = item, HorizontalContentAlignment = HorizontalAlignment.Stretch, Padding = new Thickness(4, 6, 4, 6) };
            _taskList.Items.Add(lvi);
            if (ReferenceEquals(item, _selected)) toSelect = lvi;
        }

        _taskList.SelectionChanged += OnTaskSelectionChanged;
        if (toSelect != null) _taskList.SelectedItem = toSelect;
        else _selected = null;
        RebuildDetail();
    }

    static string GroupTitle(int g) => g switch { 0 => "逾期", 1 => "今天", 2 => "将来", 3 => "无截止", _ => "已完成" };

    void OnTaskSelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        _selected = (_taskList?.SelectedItem as ListViewItem)?.Tag as TodoItem;
        RebuildDetail();
    }

    void RebuildDetail()
    {
        if (_detailHost == null) return;
        var (primary, secondary) = Brushes(((FrameworkElement)this).ActualTheme);
        var cardBg = ((FrameworkElement)this).ActualTheme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0x0A, 0x88, 0x88, 0x88))
            : new SolidColorBrush(Color.FromArgb(0x0A, 0x88, 0x88, 0x88));

        if (_selected is not { } item)
        {
            _detailHost.Content = new Border
            {
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(32),
                VerticalAlignment = VerticalAlignment.Stretch,
                Child = new TextBlock
                {
                    Text = "选择左侧任务以编辑",
                    FontSize = 14,
                    Foreground = secondary,
                    Opacity = 0.4,
                    TextAlignment = TextAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center
                }
            };
            return;
        }

        var card = new Border
        {
            CornerRadius = new CornerRadius(10),
            Padding = new Thickness(24),
            Background = cardBg
        };

        var stack = new StackPanel { Spacing = 20 };

        // title row
        var titleRow = new Grid { ColumnSpacing = 12 };
        titleRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        titleRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        var ttl = new TextBlock { Text = item.Text, FontSize = 20, FontWeight = FontWeights.SemiBold, Foreground = primary, TextWrapping = TextWrapping.Wrap, VerticalAlignment = VerticalAlignment.Center };
        Grid.SetColumn(ttl, 0);

        // priority picker
        var pcb = new ComboBox { Width = 80 };
        pcb.Items.Add(new ComboBoxItem { Content = "无", Tag = Priority.None });
        pcb.Items.Add(new ComboBoxItem { Content = "低", Tag = Priority.Low });
        pcb.Items.Add(new ComboBoxItem { Content = "中", Tag = Priority.Medium });
        pcb.Items.Add(new ComboBoxItem { Content = "高", Tag = Priority.High });
        pcb.SelectedIndex = (int)item.Priority;
        pcb.SelectionChanged += (_, _) => { if (pcb.SelectedItem is ComboBoxItem ci && ci.Tag is Priority p) { item.Priority = p; _store.Save(); } };
        Grid.SetColumn(pcb, 1);
        titleRow.Children.Add(ttl); titleRow.Children.Add(pcb);
        stack.Children.Add(titleRow);

        // tags
        var tbx = new TextBox { PlaceholderText = "标签（逗号分隔）", Text = item.Tags ?? "", FontSize = 13, HorizontalAlignment = HorizontalAlignment.Stretch };
        tbx.LostFocus += (_, _) => { item.Tags = tbx.Text; _store.Save(); };
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
            _store.Save();
        }
        dp.DateChanged += (_, _) => UpdDdl();
        tp.TimeChanged += (_, _) => UpdDdl();
        var cdl = new Button { Content = "清除截止", FontSize = 13, HorizontalAlignment = HorizontalAlignment.Left, Background = new SolidColorBrush(Color.FromArgb(0, 0, 0, 0)), BorderThickness = new Thickness(0), Foreground = secondary };
        cdl.Click += (_, _) => { dp.Date = null; item.Deadline = null; item.Reminded = false; _store.Save(); RebuildDetail(); };
        var ds = new StackPanel { Spacing = 8 };
        ds.Children.Add(dp); ds.Children.Add(tp); ds.Children.Add(cdl);
        stack.Children.Add(ds);

        // repeat + lead
        stack.Children.Add(SectHead("重复与提醒", secondary));
        var rcb = new ComboBox { HorizontalAlignment = HorizontalAlignment.Stretch };
        foreach (var k in new[] { RepeatKind.None, RepeatKind.Daily, RepeatKind.Weekly, RepeatKind.Monthly, RepeatKind.Workday })
            rcb.Items.Add(new ComboBoxItem { Content = RepeatName(k), Tag = k });
        rcb.SelectedIndex = (int)item.Repeat;
        rcb.SelectionChanged += (_, _) => { if (rcb.SelectedItem is ComboBoxItem ci && ci.Tag is RepeatKind rk) { item.Repeat = rk; _store.Save(); } };
        var ldb = new NumberBox { Minimum = 0, Maximum = 1440, SpinButtonPlacementMode = NumberBoxSpinButtonPlacementMode.Inline, Value = item.LeadMinutes, HorizontalAlignment = HorizontalAlignment.Stretch, Header = "提前（分钟）" };
        ldb.ValueChanged += (_, _) => { if (!double.IsNaN(ldb.Value)) { item.LeadMinutes = (int)ldb.Value; _store.Save(); } };
        var rs2 = new StackPanel { Spacing = 8 };
        rs2.Children.Add(rcb); rs2.Children.Add(ldb);
        stack.Children.Add(rs2);

        stack.Children.Add(Sep());

        // note
        var nb = new TextBox { PlaceholderText = "备注…", Text = item.Note ?? "", AcceptsReturn = true, TextWrapping = TextWrapping.Wrap, MinHeight = 64, FontSize = 13, HorizontalAlignment = HorizontalAlignment.Stretch, Header = "备注" };
        nb.LostFocus += (_, _) => { item.Note = nb.Text; _store.Save(); };
        stack.Children.Add(nb);

        // subtasks
        stack.Children.Add(Sep());
        var ss = new StackPanel { Spacing = 8 };
        ss.Children.Add(SectHead("子任务", secondary));

        if (item.Subtasks.Count > 0)
        {
            var doneCount = item.Subtasks.Count(s => s.Done);
            var totalCount = item.Subtasks.Count;
            var progRow = new Grid { ColumnSpacing = 8 };
            progRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            progRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            var pb = new ProgressBar { Value = (double)doneCount / totalCount * 100, Minimum = 0, Maximum = 100, Height = 6, Foreground = doneCount == totalCount ? new SolidColorBrush(Color.FromArgb(0xFF, 0x4C, 0xAF, 0x50)) : new SolidColorBrush(Color.FromArgb(0xFF, 0x62, 0xA0, 0xE0)) };
            Grid.SetColumn(pb, 0);
            progRow.Children.Add(pb);
            var progressText = new TextBlock { Text = $"{doneCount}/{totalCount}", FontSize = 12, Foreground = secondary, VerticalAlignment = VerticalAlignment.Center };
            Grid.SetColumn(progressText, 1);
            progRow.Children.Add(progressText);
            ss.Children.Add(progRow);
        }
        foreach (var st in item.Subtasks.ToList())
        {
            var sr = new Grid { ColumnSpacing = 4 };
            sr.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            sr.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            var ch = new CheckBox { IsChecked = st.Done, Content = st.Text, FontSize = 13 };
            ch.Click += (_, _) => { st.Done = ch.IsChecked == true; if (AutoCompleteSub && item.Subtasks.All(s => s.Done)) { item.Done = true; item.CompletedDate = DateTime.Today; } _store.Save(); RebuildDetail(); };
            Grid.SetColumn(ch, 0);
            var sd = new Button { Content = new FontIcon { Glyph = "\uE711", FontSize = 10 }, Background = new SolidColorBrush(Color.FromArgb(0, 0, 0, 0)), BorderThickness = new Thickness(0), Width = 28, Height = 28, Padding = new Thickness(0) };
            sd.Click += (_, _) => { item.Subtasks.Remove(st); _store.Save(); RebuildDetail(); };
            Grid.SetColumn(sd, 1);
            sr.Children.Add(ch); sr.Children.Add(sd);
            ss.Children.Add(sr);
        }
        var sa = new Grid { ColumnSpacing = 8 };
        sa.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        sa.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        var si = new TextBox { PlaceholderText = "新增子任务…", FontSize = 13, VerticalAlignment = VerticalAlignment.Center };
        var sbtn = new Button { Content = "+", Width = 32, Height = 32, FontSize = 14, Padding = new Thickness(0) };
        void SDo() { if (string.IsNullOrWhiteSpace(si.Text)) return; item.Subtasks.Add(new Subtask { Text = si.Text.Trim() }); _store.Save(); RebuildDetail(); }
        sbtn.Click += (_, _) => SDo();
        si.KeyDown += (_, e) => { if (e.Key == Windows.System.VirtualKey.Enter) SDo(); };
        Grid.SetColumn(si, 0); Grid.SetColumn(sbtn, 1);
        sa.Children.Add(si); sa.Children.Add(sbtn);
        ss.Children.Add(sa);
        stack.Children.Add(ss);

        // delete
        var delBtn = new Button
        {
            Content = "删除任务",
            Foreground = new SolidColorBrush(Color.FromArgb(0xFF, 0xCC, 0x33, 0x33)),
            Background = new SolidColorBrush(Color.FromArgb(0, 0, 0, 0)),
            BorderThickness = new Thickness(0),
            HorizontalAlignment = HorizontalAlignment.Left,
            FontSize = 13,
            Margin = new Thickness(0, 8, 0, 0)
        };
        delBtn.Click += (_, _) => { _store.Delete(item); _selected = null; RebuildTaskList(); };
        stack.Children.Add(delBtn);

        card.Child = stack;
        _detailHost.Content = card;
    }

    static Border Sep() => new() { Height = 1, Background = new SolidColorBrush(Color.FromArgb(0x18, 0x88, 0x88, 0x88)) };

    static TextBlock SectHead(string text, Brush color) => new() { Text = text, FontSize = 12, FontWeight = FontWeights.SemiBold, Foreground = color, Opacity = 0.7, Margin = new Thickness(0, 0, 0, 4) };

    static string RepeatName(RepeatKind k) => k switch
    {
        RepeatKind.Daily => "每天",
        RepeatKind.Weekly => "每周",
        RepeatKind.Monthly => "每月",
        RepeatKind.Workday => "法定工作日",
        _ => "不重复"
    };

    internal void SetAcrylicBackground(Brush brush) => _root.Background = brush;

    void OpenStats()
    {
        var items = _store.ItemsInList(_currentList);
        var today = DateTime.Today;
        var todayDone = items.Count(i => i.Done && i.CompletedDate?.Date == today);
        var totalDoneThisWeek = items.Count(i => i.Done && i.CompletedDate?.Date >= today.AddDays(-6));
        var weekly = Enumerable.Range(0, 7).Select(offset =>
        {
            var d = today.AddDays(-offset);
            return (d.ToString("MM-dd"), (double)items.Count(i => i.Done && i.CompletedDate?.Date == d));
        }).Reverse().ToList();
        var overdue = items.Count(i => !i.Done && i.Deadline is { } dl && dl < DateTime.Now);

        var (primary, secondary) = Brushes(((FrameworkElement)this).ActualTheme);
        var body = new StackPanel { Spacing = 12, MinWidth = 320 };
        body.Children.Add(new TextBlock { Text = "待办统计", FontSize = 20, FontWeight = FontWeights.SemiBold, Foreground = primary });

        var grid = new Grid { ColumnSpacing = 24 };
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

        void AddStat(int col, string label, string value)
        {
            var s = new StackPanel { Spacing = 2 };
            s.Children.Add(new TextBlock { Text = value, FontSize = 28, FontWeight = FontWeights.SemiBold, Foreground = primary });
            s.Children.Add(new TextBlock { Text = label, FontSize = 12, Foreground = secondary, Opacity = 0.7 });
            Grid.SetColumn(s, col);
            grid.Children.Add(s);
        }

        AddStat(0, "今日完成", todayDone.ToString());
        AddStat(1, "本周完成", totalDoneThisWeek.ToString());
        AddStat(2, "逾期", overdue.ToString());
        AddStat(3, "总计", items.Count.ToString());
        body.Children.Add(grid);

        body.Children.Add(new Border { Height = 1, Background = new SolidColorBrush(Color.FromArgb(0x30, 0x88, 0x88, 0x88)) });
        body.Children.Add(new TextBlock { Text = "近 7 天完成趋势", FontSize = 14, FontWeight = FontWeights.SemiBold, Foreground = primary });
        body.Children.Add(SharedUtils.MiniChart.Line(weekly, new SolidColorBrush(Color.FromArgb(0xFF, 0x62, 0xA0, 0xE0)), secondary));

        if (_overlay.IsOpen) _overlay.Close();
        var statsOverlay = new SharedUtils.BasePluginOverlay();
        statsOverlay.Show(this, "待办统计", body, _host.Log);
    }
}
