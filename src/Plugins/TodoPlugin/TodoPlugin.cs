using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;
using SharedUtils;

namespace TodoPlugin;

public class TodoPlugin : IPlugin, IPluginSettings, IAgentCapability
{
    const int PollSeconds = 30;

    IHostHandle _host = null!;
    DispatcherQueue _dispatcher = null!;
    TodoStore _store = null!;
    HolidayService _holiday = null!;
    DispatcherQueueTimer? _reminderTimer;
    TodoWidget? _widget;
    bool _checking;

    public string DisplayName => "待办";
    public string PluginId => nameof(TodoPlugin);

    bool AutoCompleteSub => (_host.GetConfig(PluginId, "auto_complete_on_subtasks") ?? "true") == "true";

    public void Initialize(IHostHandle host)
    {
        _host = host;
        _dispatcher = DispatcherQueue.GetForCurrentThread();
        _store = new TodoStore(host);
        _holiday = new HolidayService(host);

        _reminderTimer = _dispatcher.CreateTimer();
        _reminderTimer.Interval = TimeSpan.FromSeconds(PollSeconds);
        _reminderTimer.IsRepeating = true;
        _reminderTimer.Tick += (_, _) => _ = CheckRemindersAsync();
        _reminderTimer.Start();
        _host.Log("Todo: reminder timer started");
    }

    public IReadOnlyList<IWidget> GetWidgets()
    {
        _widget ??= new TodoWidget(_host, _store, ToggleItem);
        _widget.SetWidgetBackground((Brush)_host.GetWidgetBackgroundBrush());
        return new[] { new TodoWidgetInfo(_host, _widget) };
    }

    public void Shutdown()
    {
        _reminderTimer?.Stop();
        _widget?.Dispose();
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

    async void ToggleItem(TodoItem item)
    {
        try
        {
            if (!item.Done && item.Repeat != RepeatKind.None && item.Deadline is { } dl)
            {
                item.Deadline = await NextOccurrenceAsync(dl, item.Repeat);
                item.Reminded = false;
                item.Done = false;
                _host.Log($"Todo: recurring '{item.Text}' rolled to {item.Deadline:yyyy-MM-dd HH:mm}");
                _store.MarkDirty(); _store.Save();
            }
            else
            {
                _store.Toggle(item);
            }
        }
        catch (Exception ex)
        {
            _host.LogError($"Todo: toggle failed: {ex.Message}");
        }
    }

    async Task CheckRemindersAsync()
    {
        if (_checking) return;
        _checking = true;
        try
        {
            var now = DateTime.Now;
            var changed = false;
            // 快照遍历：await 期间 UI 线程可能增删 Items，避免集合被修改异常
            foreach (var item in _store.Items.ToList())
            {
                if (item.Done || item.Reminded || item.Deadline is not { } dl) continue;
                var remindAt = dl.AddMinutes(-item.LeadMinutes);
                if (now < remindAt) continue;

                _host.Log($"Todo: reminder fired for '{item.Text}'");
                _host.ShowNotification("待办提醒", $"{item.Text}（截止 {dl:MM-dd HH:mm}）", escalate: true);

                if (item.Repeat != RepeatKind.None)
                {
                    item.Deadline = await NextOccurrenceAsync(dl, item.Repeat);
                    item.Reminded = false;
                }
                else
                {
                    item.Reminded = true;
                }
                changed = true;
            }
            if (changed)
            {
                _store.MarkDirty();
                _store.Save();
            }
        }
        catch (Exception ex) { _host.LogError($"Todo: reminder check failed: {ex.Message}"); }
        finally { _checking = false; }
    }

    async Task<DateTime> NextOccurrenceAsync(DateTime from, RepeatKind repeat)
    {
        var next = repeat switch
        {
            RepeatKind.Daily => from.AddDays(1),
            RepeatKind.Weekly => from.AddDays(7),
            RepeatKind.Monthly => from.AddMonths(1),
            RepeatKind.Workday => (await _holiday.NextWorkdayAsync(from)).Date + from.TimeOfDay,
            _ => from
        };
        // 追赶到未来：设备关机数天后重开时，避免连环补发过期提醒
        var guard = 0;
        while (next <= DateTime.Now && guard++ < 400)
        {
            next = repeat switch
            {
                RepeatKind.Daily => next.AddDays(1),
                RepeatKind.Weekly => next.AddDays(7),
                RepeatKind.Monthly => next.AddMonths(1),
                RepeatKind.Workday => (await _holiday.NextWorkdayAsync(DateTime.Now)).Date + from.TimeOfDay,
                _ => next
            };
            if (repeat == RepeatKind.Workday) break; // Workday 一次跳跃已基于当前时间
        }
        return next;
    }

    object IPluginSettings.CreateSettingsControl()
    {
        var panel = new StackPanel { Spacing = 12, Margin = new Thickness(0, 8, 0, 4) };

        var hide = new ToggleSwitch { Header = "磁贴隐藏已完成", IsOn = (_host.GetConfig(PluginId, "hide_done") ?? "false") == "true" };
        hide.Toggled += (_, _) => { _host.SetConfig(PluginId, "hide_done", hide.IsOn ? "true" : "false"); _widget?.OnStoreChanged(); };
        panel.Children.Add(hide);

        var autoComp = new ToggleSwitch { Header = "子任务全部完成时自动完成", IsOn = AutoCompleteSub };
        autoComp.Toggled += (_, _) => _host.SetConfig(PluginId, "auto_complete_on_subtasks", autoComp.IsOn ? "true" : "false");
        panel.Children.Add(autoComp);

        var calView = new ToggleSwitch { Header = "默认日历视图", IsOn = (_host.GetConfig(PluginId, "default_view") ?? "list") == "calendar" };
        calView.Toggled += (_, _) => _host.SetConfig(PluginId, "default_view", calView.IsOn ? "calendar" : "list");
        panel.Children.Add(calView);

        return panel;
    }

    void IPluginSettings.ResetConfig(IHostHandle host)
    {
        host.SetConfig(PluginId, "items", "[]");
        host.SetConfig(PluginId, "items_corrupt_backup", "");
        host.SetConfig(PluginId, "lists", "[]");
        host.SetConfig(PluginId, "holiday_cache", "");
        host.SetConfig(PluginId, "auto_complete_on_subtasks", "true");
        host.SetConfig(PluginId, "hide_done", "false");
        host.SetConfig(PluginId, "default_view", "list");
        host.SetConfig(PluginId, "current_list", "");
        host.SetConfig(PluginId, "selected_item_id", "");
        _store.ResetAll();
        _widget?.OnStoreChanged();
    }

    IReadOnlyList<AgentTool> IAgentCapability.GetTools() => new[]
    {
        new AgentTool { Name = "list_todo", Description = "获取全部待办，可选按日期过滤。返回每个item包含Id字段供精确操作。", ParametersJsonSchema = """{"type":"object","properties":{"date":{"type":"string","description":"yyyy-MM-dd 过滤指定日期"}}}""" },
        new AgentTool { Name = "add_todo", Description = "新增待办。", ParametersJsonSchema = """{"type":"object","properties":{"text":{"type":"string"},"list":{"type":"string"},"inbox":{"type":"boolean"},"priority":{"type":"string","enum":["none","low","medium","high"]},"tags":{"type":"string"},"deadline":{"type":"string","description":"ISO 8601 date-time, e.g. 2026-07-25 or 2026-07-25T15:00:00","format":"date-time"},"leadMinutes":{"type":"integer"},"note":{"type":"string"},"repeat":{"type":"string","enum":["none","daily","weekly","monthly","workday"]}},"required":["text"]}""" },
        new AgentTool { Name = "complete_todo", Description = "把某条待办标记为完成。", ParametersJsonSchema = IdSchema },
        new AgentTool { Name = "uncomplete_todo", Description = "把某条已完成待办标记为未完成。", ParametersJsonSchema = IdSchema },
        new AgentTool { Name = "delete_todo", Description = "删除某条待办。", ParametersJsonSchema = IdSchema },
        new AgentTool { Name = "clear_completed_todo", Description = "清除所有已完成的待办。" },
        new AgentTool { Name = "set_todo_deadline", Description = "设置或清除截止时间。", ParametersJsonSchema = """{"type":"object","properties":{"id":{"type":"string"},"deadline":{"type":"string","description":"ISO 8601 date-time, e.g. 2026-07-25 or 2026-07-25T15:00:00; pass empty to clear","format":"date-time"},"leadMinutes":{"type":"integer"}},"required":["id"]}""" },
        new AgentTool { Name = "set_todo_note", Description = "设置备注。", ParametersJsonSchema = """{"type":"object","properties":{"id":{"type":"string"},"note":{"type":"string"}},"required":["id","note"]}""" },
        new AgentTool { Name = "set_todo_repeat", Description = "设置重复方式。", ParametersJsonSchema = """{"type":"object","properties":{"id":{"type":"string"},"repeat":{"type":"string","enum":["none","daily","weekly","monthly","workday"]}},"required":["id","repeat"]}""" },
        new AgentTool { Name = "set_todo_priority", Description = "设置优先级。", ParametersJsonSchema = """{"type":"object","properties":{"id":{"type":"string"},"priority":{"type":"string","enum":["none","low","medium","high"]}},"required":["id","priority"]}""" },
        new AgentTool { Name = "set_todo_tags", Description = "设置标签。", ParametersJsonSchema = """{"type":"object","properties":{"id":{"type":"string"},"tags":{"type":"string"}},"required":["id","tags"]}""" },
        new AgentTool { Name = "add_subtask", Description = "添加子任务。", ParametersJsonSchema = """{"type":"object","properties":{"id":{"type":"string"},"subtask":{"type":"string"}},"required":["id","subtask"]}""" },
        new AgentTool { Name = "toggle_subtask", Description = "切换子任务完成状态。", ParametersJsonSchema = """{"type":"object","properties":{"id":{"type":"string"},"subtask":{"type":"string"}},"required":["id","subtask"]}""" },
        new AgentTool { Name = "list_lists", Description = "列出所有待办列表名称。" },
        new AgentTool { Name = "create_list", Description = "创建一个新的待办列表。", ParametersJsonSchema = """{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}""" },
        new AgentTool { Name = "rename_list", Description = "重命名一个待办列表。", ParametersJsonSchema = """{"type":"object","properties":{"old":{"type":"string"},"new":{"type":"string"}},"required":["old","new"]}""" },
        new AgentTool { Name = "delete_list", Description = "删除一个待办列表及其所有任务。", ParametersJsonSchema = """{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}""" },
        new AgentTool { Name = "query_todo_stats", Description = "获取待办统计数据：今日完成率、逾期数、累计完成、近7天趋势。" },
        new AgentTool { Name = "move_to_list", Description = "将任务移入指定列表。", ParametersJsonSchema = """{"type":"object","properties":{"id":{"type":"string"},"listName":{"type":"string"}},"required":["id","listName"]}""" },
        new AgentTool { Name = "share_todo_list", Description = "导出待办清单文本并复制到剪贴板。", ParametersJsonSchema = """{"type":"object","properties":{"listName":{"type":"string"}}}""" },
    };

    const string IdSchema = """{"type":"object","properties":{"id":{"type":"string"}},"required":["id"]}""";

    Task<string> IAgentCapability.InvokeAsync(string tool, string argumentsJson)
    {
        _host.Log($"Todo: agent invoke '{tool}' args={argumentsJson}");
        string ListJson() => AgentJson.Serialize(new { ok = true, items = _store.Items });

        switch (tool)
        {
            case "list_todo":
                return OnUi(() =>
                {
                    var dateStr = AgentJson.GetString(argumentsJson, "date");
                    if (!string.IsNullOrWhiteSpace(dateStr) && DateTime.TryParse(dateStr, out var dt))
                    {
                        var filtered = _store.Items.Where(i => i.Deadline?.Date == dt.Date).ToList();
                        return AgentJson.Serialize(new { ok = true, items = filtered, date = dateStr });
                    }
                    return ListJson();
                });

            case "add_todo":
                return OnUi(() =>
                {
                    var text = AgentJson.GetString(argumentsJson, "text");
                    if (string.IsNullOrWhiteSpace(text)) return AgentJson.Error("text_required");
                    var dlStr = AgentJson.GetString(argumentsJson, "deadline");
                    if (!string.IsNullOrWhiteSpace(dlStr) && !DateTime.TryParse(dlStr, out _))
                        return AgentJson.Error("invalid_deadline");
                    var list = AgentJson.GetString(argumentsJson, "list");
                    var inbox = AgentJson.GetBool(argumentsJson, "inbox") ?? false;
                    if (inbox && string.IsNullOrWhiteSpace(list)) list = TodoStore.InboxList;
                    var item = _store.Add(text, list ?? TodoStore.DefaultList);
                    ApplyOptionalFields(item, argumentsJson);
                    _store.MarkDirty(); _store.Save();
                    return ListJson();
                });

            case "complete_todo": return OnUi(() => WithItemById(argumentsJson, item => { item.Done = true; item.CompletedDate = DateTime.Today; _store.MarkDirty(); _store.Save(); }));
            case "uncomplete_todo": return OnUi(() => WithItemById(argumentsJson, item => { item.Done = false; item.CompletedDate = null; _store.MarkDirty(); _store.Save(); }));
            case "delete_todo": return OnUi(() => WithItemById(argumentsJson, item => _store.Delete(item)));
            case "clear_completed_todo": return OnUi(() => { _store.ClearCompleted(); return ListJson(); });

            case "set_todo_deadline":
                return OnUi(() =>
                {
                    var id = AgentJson.GetString(argumentsJson, "id");
                    if (string.IsNullOrWhiteSpace(id)) return AgentJson.Error("id_required");
                    var item = _store.FindById(id);
                    if (item == null) return AgentJson.Error("not_found");
                    var dlStr = AgentJson.GetString(argumentsJson, "deadline");
                    if (string.IsNullOrWhiteSpace(dlStr)) item.Deadline = null;
                    else if (DateTime.TryParse(dlStr, out var dt)) item.Deadline = dt;
                    else return AgentJson.Error("invalid_deadline");
                    var lead = AgentJson.GetInt(argumentsJson, "leadMinutes");
                    if (lead is >= 0) item.LeadMinutes = lead.Value;
                    item.Reminded = false;
                    _store.MarkDirty(); _store.Save();
                    return ListJson();
                });

            case "set_todo_note": return OnUi(() => WithItemById(argumentsJson, item => { item.Note = AgentJson.GetString(argumentsJson, "note"); _store.MarkDirty(); _store.Save(); }));
            case "set_todo_repeat": return OnUi(() => WithItemById(argumentsJson, item => { item.Repeat = ParseRepeat(AgentJson.GetString(argumentsJson, "repeat")); _store.MarkDirty(); _store.Save(); }));
            case "set_todo_priority": return OnUi(() => WithItemById(argumentsJson, item => { item.Priority = ParsePriority(AgentJson.GetString(argumentsJson, "priority")); _store.MarkDirty(); _store.Save(); }));
            case "set_todo_tags": return OnUi(() => WithItemById(argumentsJson, item => { item.Tags = AgentJson.GetString(argumentsJson, "tags") ?? ""; _store.MarkDirty(); _store.Save(); }));

            case "add_subtask":
                return OnUi(() =>
                {
                    var id = AgentJson.GetString(argumentsJson, "id");
                    var sub = AgentJson.GetString(argumentsJson, "subtask");
                    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(sub)) return AgentJson.Error("id_required");
                    var item = _store.FindById(id);
                    if (item == null) return AgentJson.Error("not_found");
                    item.Subtasks.Add(new Subtask { Text = sub.Trim() });
                    _store.MarkDirty(); _store.Save();
                    return ListJson();
                });

            case "toggle_subtask":
                return OnUi(() =>
                {
                    var id = AgentJson.GetString(argumentsJson, "id");
                    var sub = AgentJson.GetString(argumentsJson, "subtask");
                    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(sub)) return AgentJson.Error("id_required");
                    var item = _store.FindById(id);
                    if (item == null) return AgentJson.Error("not_found");
                    var st = item.Subtasks.FirstOrDefault(s => s.Text.Contains(sub, StringComparison.OrdinalIgnoreCase));
                    if (st == null) return AgentJson.Error("subtask_not_found");
                    _store.ToggleSubtask(item, st, AutoCompleteSub);
                    return ListJson();
                });

            case "list_lists":
                return OnUi(() => AgentJson.Serialize(new { ok = true, lists = _store.ListNames }));

            case "create_list":
                return OnUi(() =>
                {
                    var name = AgentJson.GetString(argumentsJson, "name");
                    if (string.IsNullOrWhiteSpace(name)) return AgentJson.Error("name_required");
                    if (!_store.CreateList(name)) return AgentJson.Error("list_exists_or_builtin");
                    return AgentJson.Serialize(new { ok = true, list = name, lists = _store.ListNames });
                });

            case "rename_list":
                return OnUi(() =>
                {
                    var old = AgentJson.GetString(argumentsJson, "old"); var @new = AgentJson.GetString(argumentsJson, "new");
                    if (string.IsNullOrWhiteSpace(old) || string.IsNullOrWhiteSpace(@new)) return AgentJson.Error("name_required");
                    if (old == TodoStore.DefaultList || old == TodoStore.InboxList) return AgentJson.Error("cannot_rename_builtin");
                    _store.RenameList(old, @new);
                    return AgentJson.Serialize(new { ok = true, lists = _store.ListNames });
                });

            case "delete_list":
                return OnUi(() =>
                {
                    var name = AgentJson.GetString(argumentsJson, "name");
                    if (string.IsNullOrWhiteSpace(name)) return AgentJson.Error("name_required");
                    if (name == TodoStore.DefaultList || name == TodoStore.InboxList) return AgentJson.Error("cannot_delete_builtin");
                    _store.DeleteList(name);
                    return AgentJson.Serialize(new { ok = true, lists = _store.ListNames });
                });

            case "query_todo_stats":
                return OnUi(() =>
                {
                    var items = _store.Items;
                    var today = DateTime.Today;
                    var todayCompleted = items.Count(i => i.Done && i.CompletedDate?.Date == today);
                    var todayTotal = items.Count(i => i.Deadline?.Date == today || i.List == TodoStore.InboxList || (i.CompletedDate?.Date == today));
                    var overdue = items.Count(i => !i.Done && i.Deadline is { } dl && dl < DateTime.Now);
                    var totalDone = items.Count(i => i.Done);
                    var weekly = Enumerable.Range(0, 7).Select(offset =>
                    {
                        var d = today.AddDays(-offset);
                        return new { date = d.ToString("MM-dd"), count = items.Count(i => i.Done && i.CompletedDate?.Date == d) };
                    }).Reverse().ToList();
                    return AgentJson.Serialize(new
                    {
                        ok = true,
                        todayCompleted,
                        todayTotal,
                        overdueCount = overdue,
                        historyTotal = totalDone,
                        weeklyTrend = weekly
                    });
                });

            case "move_to_list":
                return OnUi(() =>
                {
                    var id = AgentJson.GetString(argumentsJson, "id");
                    var listName = AgentJson.GetString(argumentsJson, "listName");
                    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(listName)) return AgentJson.Error("id_required");
                    var item = _store.FindById(id);
                    if (item == null) return AgentJson.Error("not_found");
                    _store.MoveToExistingList(item, listName);
                    return ListJson();
                });

            case "share_todo_list":
                return OnUi(() =>
                {
                    var listName = AgentJson.GetString(argumentsJson, "listName");
                    var items = listName != null ? _store.Items.Where(i => i.List == listName) : _store.Items;
                    var sb = new System.Text.StringBuilder();
                    foreach (var i in items.Where(i => !i.Done))
                    {
                        var tag = i.Priority switch { Priority.High => "!!", Priority.Medium => "!", Priority.Low => "·", _ => "" };
                        var dl = i.Deadline is { } d ? $" — 截止 {d:MM-dd HH:mm}" : "";
                        sb.AppendLine($"[{(i.List == TodoStore.InboxList ? "待办箱" : i.List)}] {tag} {i.Text}{dl}");
                    }
                    var result = sb.ToString();
                    bool copied = false;
                    try
                    {
                        var dp = new Windows.ApplicationModel.DataTransfer.DataPackage();
                        dp.SetText(result);
                        Windows.ApplicationModel.DataTransfer.Clipboard.SetContent(dp);
                        copied = true;
                    }
                    catch (Exception ex) { _host.LogError($"Todo: clipboard failed: {ex.Message}"); }
                    return AgentJson.Serialize(new { ok = true, text = result, copied });
                });

            default: return Task.FromResult(AgentJson.Error("unknown_tool"));
        }
    }

    /// <summary>AI 状态快照 hook。</summary>
    string? IAgentCapability.GetContextSnapshot()
    {
        try
        {
            var items = _store.Items;
            var pending = items.Count(i => !i.Done);
            var overdue = items.Count(i => !i.Done && i.Deadline is { } d && d < DateTime.Now);
            var lists = string.Join("、", _store.ListNames);
            var current = _host.GetConfig(PluginId, "current_list");
            return $"待办: 共 {items.Count} 项（未完成 {pending}，逾期 {overdue}）；列表 [{lists}]，当前 {(string.IsNullOrWhiteSpace(current) ? TodoStore.DefaultList : current)}";
        }
        catch { return null; }
    }

    string WithItemById(string argsJson, Action<TodoItem> op)
    {
        var id = AgentJson.GetString(argsJson, "id");
        if (string.IsNullOrWhiteSpace(id)) return AgentJson.Error("id_required");
        var item = _store.FindById(id);
        if (item == null) return AgentJson.Error("not_found");
        op(item);
        return AgentJson.Serialize(new { ok = true, items = _store.Items });
    }

    string? ApplyOptionalFields(TodoItem item, string argsJson)
    {
        var dlStr = AgentJson.GetString(argsJson, "deadline");
        if (!string.IsNullOrWhiteSpace(dlStr))
        {
            if (DateTime.TryParse(dlStr, out var dt)) item.Deadline = dt;
            else return AgentJson.Error("invalid_deadline");
        }
        var lead = AgentJson.GetInt(argsJson, "leadMinutes");
        if (lead is >= 0) item.LeadMinutes = lead.Value;
        var note = AgentJson.GetString(argsJson, "note");
        if (!string.IsNullOrWhiteSpace(note)) item.Note = note;
        item.Repeat = ParseRepeat(AgentJson.GetString(argsJson, "repeat"));
        item.Priority = ParsePriority(AgentJson.GetString(argsJson, "priority"));
        var tags = AgentJson.GetString(argsJson, "tags");
        if (tags != null) item.Tags = tags;
        return null;
    }

    static RepeatKind ParseRepeat(string? s) => (s ?? "none").ToLowerInvariant() switch
    {
        "daily" => RepeatKind.Daily, "weekly" => RepeatKind.Weekly, "monthly" => RepeatKind.Monthly, "workday" => RepeatKind.Workday, _ => RepeatKind.None
    };

    static Priority ParsePriority(string? s)
        => Enum.TryParse<Priority>(s, true, out var p) ? p : Priority.None;

    class TodoWidgetInfo : IWidget
    {
        readonly IHostHandle _host; readonly TodoWidget _control;
        public TodoWidgetInfo(IHostHandle host, TodoWidget control) { _host = host; _control = control; }
        public string Id => "todo.main";
        public int Columns => 2; public int Rows => 2;
        public WidgetBackdrop Backdrop => WidgetBackdrop.Acrylic;
        public object CreateControl() { _control.SetWidgetBackground((Brush)_host.GetWidgetBackgroundBrush()); return _control; }
    }
}
