using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using PluginContract;

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
        _widget.SetAcrylicBackground((Brush)_host.GetWidgetBackgroundBrush());
        return new[] { new TodoWidgetInfo(_host, _widget) };
    }

    public void Shutdown() => _reminderTimer?.Stop();

    Task<string> OnUi(Func<string> action)
    {
        var tcs = new TaskCompletionSource<string>();
        if (_dispatcher.HasThreadAccess)
        {
            try { tcs.SetResult(action()); } catch (Exception ex) { tcs.SetException(ex); }
        }
        else
        {
            _dispatcher.TryEnqueue(() =>
            {
                try { tcs.SetResult(action()); } catch (Exception ex) { tcs.SetException(ex); }
            });
        }
        return tcs.Task;
    }

    // ---- reminders + recurrence ----

    async void ToggleItem(TodoItem item)
    {
        if (!item.Done && item.Repeat != RepeatKind.None && item.Deadline is { } dl)
        {
            // Completing a recurring task rolls it to the next occurrence
            item.Deadline = await NextOccurrenceAsync(dl, item.Repeat);
            item.Reminded = false;
            item.Done = false;
            _host.Log($"Todo: recurring '{item.Text}' rolled to {item.Deadline:yyyy-MM-dd HH:mm}");
            _store.Save();
        }
        else
        {
            _store.Toggle(item);
        }
    }

    async Task CheckRemindersAsync()
    {
        if (_checking) return;
        _checking = true;
        try
        {
            var now = DateTime.Now;
            foreach (var item in _store.Items.ToList())
            {
                if (item.Done || item.Reminded || item.Deadline is not { } dl) continue;
                var remindAt = dl.AddMinutes(-item.LeadMinutes);
                if (now < remindAt) continue;

                _host.Log($"Todo: reminder fired for '{item.Text}' (deadline {dl:yyyy-MM-dd HH:mm})");
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
                _store.Save();
            }
        }
        catch (Exception ex)
        {
            _host.LogError($"Todo: reminder check failed: {ex.Message}");
        }
        finally
        {
            _checking = false;
        }
    }

    async Task<DateTime> NextOccurrenceAsync(DateTime from, RepeatKind repeat)
    {
        switch (repeat)
        {
            case RepeatKind.Daily: return from.AddDays(1);
            case RepeatKind.Weekly: return from.AddDays(7);
            case RepeatKind.Monthly: return from.AddMonths(1);
            case RepeatKind.Workday:
                var next = await _holiday.NextWorkdayAsync(from);
                return next.Date + from.TimeOfDay;
            default: return from;
        }
    }

    // ---- settings ----

    object IPluginSettings.CreateSettingsControl()
    {
        var panel = new StackPanel { Spacing = 12, Margin = new Thickness(0, 8, 0, 4) };

        var hide = new ToggleSwitch
        {
            Header = "磁贴隐藏已完成",
            IsOn = (_host.GetConfig(PluginId, "hide_done") ?? "false") == "true"
        };
        hide.Toggled += (_, _) =>
        {
            _host.SetConfig(PluginId, "hide_done", hide.IsOn ? "true" : "false");
            _widget?.OnStoreChanged();
        };
        panel.Children.Add(hide);

        return panel;
    }

    // ---- agent tools ----

    IReadOnlyList<AgentTool> IAgentCapability.GetTools() => new[]
    {
        new AgentTool { Name = "list_todo", Description = "获取全部待办（含优先级、标签、截止时间、备注、重复、子任务、所属列表）。" },
        new AgentTool
        {
            Name = "add_todo",
            Description = "新增待办，可选列表、优先级、标签、截止时间、提前提醒分钟、备注、重复。",
            ParametersJsonSchema = """{"type":"object","properties":{"text":{"type":"string"},"list":{"type":"string"},"priority":{"type":"string","enum":["none","low","medium","high"]},"tags":{"type":"string"},"deadline":{"type":"string"},"leadMinutes":{"type":"integer"},"note":{"type":"string"},"repeat":{"type":"string","enum":["none","daily","weekly","monthly","workday"]}},"required":["text"]}"""
        },
        new AgentTool { Name = "complete_todo", Description = "把某条待办标记为完成（按文本匹配）。", ParametersJsonSchema = TextSchema },
        new AgentTool { Name = "uncomplete_todo", Description = "把某条已完成待办标记为未完成（按文本匹配）。", ParametersJsonSchema = TextSchema },
        new AgentTool { Name = "delete_todo", Description = "删除某条待办（按文本匹配）。", ParametersJsonSchema = TextSchema },
        new AgentTool { Name = "clear_completed_todo", Description = "清除所有已完成的待办。" },
        new AgentTool
        {
            Name = "set_todo_deadline",
            Description = "为某条待办设置或清除截止时间（按文本匹配）。",
            ParametersJsonSchema = """{"type":"object","properties":{"text":{"type":"string"},"deadline":{"type":"string","description":"ISO 日期时间；留空则清除"},"leadMinutes":{"type":"integer"}},"required":["text"]}"""
        },
        new AgentTool { Name = "set_todo_note", Description = "为某条待办设置备注（按文本匹配）。", ParametersJsonSchema = """{"type":"object","properties":{"text":{"type":"string"},"note":{"type":"string"}},"required":["text","note"]}""" },
        new AgentTool { Name = "set_todo_repeat", Description = "为某条待办设置重复方式（按文本匹配）。", ParametersJsonSchema = """{"type":"object","properties":{"text":{"type":"string"},"repeat":{"type":"string","enum":["none","daily","weekly","monthly","workday"]}},"required":["text","repeat"]}""" },
        new AgentTool { Name = "set_todo_priority", Description = "为某条待办设置优先级（按文本匹配）。", ParametersJsonSchema = """{"type":"object","properties":{"text":{"type":"string"},"priority":{"type":"string","enum":["none","low","medium","high"]}},"required":["text","priority"]}""" },
        new AgentTool { Name = "set_todo_tags", Description = "为某条待办设置标签（按文本匹配）。", ParametersJsonSchema = """{"type":"object","properties":{"text":{"type":"string"},"tags":{"type":"string"}},"required":["text","tags"]}""" },
        new AgentTool { Name = "add_subtask", Description = "为某条待办添加子任务（按文本匹配）。", ParametersJsonSchema = """{"type":"object","properties":{"text":{"type":"string"},"subtask":{"type":"string"}},"required":["text","subtask"]}""" },
        new AgentTool { Name = "toggle_subtask", Description = "切换某条待办的一条子任务完成状态（按文本匹配，子任务模糊匹配）。", ParametersJsonSchema = """{"type":"object","properties":{"text":{"type":"string"},"subtask":{"type":"string"}},"required":["text","subtask"]}""" },
        new AgentTool { Name = "list_lists", Description = "列出所有待办列表名称。" },
        new AgentTool { Name = "create_list", Description = "创建一个新的待办列表。", ParametersJsonSchema = """{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}""" },
        new AgentTool { Name = "rename_list", Description = "重命名一个待办列表。", ParametersJsonSchema = """{"type":"object","properties":{"old":{"type":"string"},"new":{"type":"string"}},"required":["old","new"]}""" },
        new AgentTool { Name = "delete_list", Description = "删除一个待办列表及其所有任务。", ParametersJsonSchema = """{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}""" },
    };

    const string TextSchema = """{"type":"object","properties":{"text":{"type":"string"}},"required":["text"]}""";

    Task<string> IAgentCapability.InvokeAsync(string tool, string argumentsJson)
    {
        _host.Log($"Todo: agent invoke '{tool}' args={argumentsJson}");
        string ListJson() => AgentJson.Serialize(new { ok = true, items = _store.Items });

        switch (tool)
        {
            case "list_todo":
                return OnUi(ListJson);

            case "add_todo":
                return OnUi(() =>
                {
                    var text = AgentJson.GetString(argumentsJson, "text");
                    if (string.IsNullOrWhiteSpace(text)) return AgentJson.Error("text_required");
                    var list = AgentJson.GetString(argumentsJson, "list") ?? TodoStore.DefaultList;
                    var item = _store.Add(text, list);
                    ApplyOptionalFields(item, argumentsJson);
                    _store.Save();
                    return ListJson();
                });

            case "complete_todo":
                return OnUi(() => WithText(argumentsJson, t => _store.CompleteByText(t)));
            case "uncomplete_todo":
                return OnUi(() => WithText(argumentsJson, t => _store.UncompleteByText(t)));
            case "delete_todo":
                return OnUi(() => WithText(argumentsJson, t => _store.DeleteByText(t)));

            case "clear_completed_todo":
                return OnUi(() => { _store.ClearCompleted(); return ListJson(); });

            case "set_todo_deadline":
                return OnUi(() =>
                {
                    var text = AgentJson.GetString(argumentsJson, "text");
                    if (string.IsNullOrWhiteSpace(text)) return AgentJson.Error("text_required");
                    var item = _store.FindByText(text);
                    if (item == null) return AgentJson.Error("not_found");
                    var dlStr = AgentJson.GetString(argumentsJson, "deadline");
                    if (string.IsNullOrWhiteSpace(dlStr)) item.Deadline = null;
                    else if (DateTime.TryParse(dlStr, out var dt)) item.Deadline = dt;
                    else return AgentJson.Error("invalid_deadline");
                    var lead = AgentJson.GetInt(argumentsJson, "leadMinutes");
                    if (lead is >= 0) item.LeadMinutes = lead.Value;
                    item.Reminded = false;
                    _store.Save();
                    return ListJson();
                });

            case "set_todo_note":
                return OnUi(() =>
                {
                    var text = AgentJson.GetString(argumentsJson, "text");
                    var note = AgentJson.GetString(argumentsJson, "note");
                    if (string.IsNullOrWhiteSpace(text)) return AgentJson.Error("text_required");
                    var item = _store.FindByText(text);
                    if (item == null) return AgentJson.Error("not_found");
                    item.Note = note;
                    _store.Save();
                    return ListJson();
                });

            case "set_todo_repeat":
                return OnUi(() =>
                {
                    var text = AgentJson.GetString(argumentsJson, "text");
                    if (string.IsNullOrWhiteSpace(text)) return AgentJson.Error("text_required");
                    var item = _store.FindByText(text);
                    if (item == null) return AgentJson.Error("not_found");
                    item.Repeat = ParseRepeat(AgentJson.GetString(argumentsJson, "repeat"));
                    _store.Save();
                    return ListJson();
                });

            case "set_todo_priority":
                return OnUi(() =>
                {
                    var text = AgentJson.GetString(argumentsJson, "text");
                    if (string.IsNullOrWhiteSpace(text)) return AgentJson.Error("text_required");
                    var item = _store.FindByText(text);
                    if (item == null) return AgentJson.Error("not_found");
                    item.Priority = (Priority?)Enum.Parse(typeof(Priority), AgentJson.GetString(argumentsJson, "priority") ?? "None", true) ?? Priority.None;
                    _store.Save();
                    return ListJson();
                });

            case "set_todo_tags":
                return OnUi(() =>
                {
                    var text = AgentJson.GetString(argumentsJson, "text");
                    if (string.IsNullOrWhiteSpace(text)) return AgentJson.Error("text_required");
                    var item = _store.FindByText(text);
                    if (item == null) return AgentJson.Error("not_found");
                    item.Tags = AgentJson.GetString(argumentsJson, "tags") ?? "";
                    _store.Save();
                    return ListJson();
                });

            case "add_subtask":
                return OnUi(() =>
                {
                    var text = AgentJson.GetString(argumentsJson, "text");
                    var sub = AgentJson.GetString(argumentsJson, "subtask");
                    if (string.IsNullOrWhiteSpace(text) || string.IsNullOrWhiteSpace(sub)) return AgentJson.Error("text_required");
                    var item = _store.FindByText(text);
                    if (item == null) return AgentJson.Error("not_found");
                    item.Subtasks.Add(new Subtask { Text = sub.Trim() });
                    _store.Save();
                    return ListJson();
                });

            case "toggle_subtask":
                return OnUi(() =>
                {
                    var text = AgentJson.GetString(argumentsJson, "text");
                    var sub = AgentJson.GetString(argumentsJson, "subtask");
                    if (string.IsNullOrWhiteSpace(text) || string.IsNullOrWhiteSpace(sub)) return AgentJson.Error("text_required");
                    var item = _store.FindByText(text);
                    if (item == null) return AgentJson.Error("not_found");
                    var st = item.Subtasks.FirstOrDefault(s => s.Text.Contains(sub, StringComparison.OrdinalIgnoreCase));
                    if (st == null) return AgentJson.Error("subtask_not_found");
                    st.Done = !st.Done;
                    _store.Save();
                    return ListJson();
                });

            case "list_lists":
                return Task.FromResult(AgentJson.Serialize(new { ok = true, lists = _store.ListNames }));

            case "create_list":
                return OnUi(() =>
                {
                    var name = AgentJson.GetString(argumentsJson, "name");
                    if (string.IsNullOrWhiteSpace(name)) return AgentJson.Error("name_required");
                    _store.Add("占位", name); _store.ClearCompleted(name);
                    return AgentJson.Serialize(new { ok = true, list = name, lists = _store.ListNames });
                });

            case "rename_list":
                return OnUi(() =>
                {
                    var old = AgentJson.GetString(argumentsJson, "old");
                    var @new = AgentJson.GetString(argumentsJson, "new");
                    if (string.IsNullOrWhiteSpace(old) || string.IsNullOrWhiteSpace(@new)) return AgentJson.Error("name_required");
                    if (old == TodoStore.DefaultList) return AgentJson.Error("cannot_rename_default");
                    _store.RenameList(old, @new);
                    return AgentJson.Serialize(new { ok = true, lists = _store.ListNames });
                });

            case "delete_list":
                return OnUi(() =>
                {
                    var name = AgentJson.GetString(argumentsJson, "name");
                    if (string.IsNullOrWhiteSpace(name)) return AgentJson.Error("name_required");
                    if (name == TodoStore.DefaultList) return AgentJson.Error("cannot_delete_default");
                    var items = _store.Items.Where(i => i.List == name).ToList();
                    foreach (var i in items) _store.Items.Remove(i);
                    _store.Save();
                    return AgentJson.Serialize(new { ok = true, lists = _store.ListNames });
                });

            default:
                return Task.FromResult(AgentJson.Error("unknown_tool"));
        }
    }

    string WithText(string argsJson, Func<string, bool> op)
    {
        var text = AgentJson.GetString(argsJson, "text");
        if (string.IsNullOrWhiteSpace(text)) return AgentJson.Error("text_required");
        return op(text)
            ? AgentJson.Serialize(new { ok = true, items = _store.Items })
            : AgentJson.Error("not_found");
    }

    void ApplyOptionalFields(TodoItem item, string argsJson)
    {
        var dlStr = AgentJson.GetString(argsJson, "deadline");
        if (!string.IsNullOrWhiteSpace(dlStr) && DateTime.TryParse(dlStr, out var dt)) item.Deadline = dt;
        var lead = AgentJson.GetInt(argsJson, "leadMinutes");
        if (lead is >= 0) item.LeadMinutes = lead.Value;
        var note = AgentJson.GetString(argsJson, "note");
        if (!string.IsNullOrWhiteSpace(note)) item.Note = note;
        item.Repeat = ParseRepeat(AgentJson.GetString(argsJson, "repeat"));
        item.Priority = (Priority?)Enum.Parse(typeof(Priority), AgentJson.GetString(argsJson, "priority") ?? "None", true) ?? Priority.None;
        var tags = AgentJson.GetString(argsJson, "tags");
        if (tags != null) item.Tags = tags;
    }

    static RepeatKind ParseRepeat(string? s) => (s ?? "none").ToLowerInvariant() switch
    {
        "daily" => RepeatKind.Daily,
        "weekly" => RepeatKind.Weekly,
        "monthly" => RepeatKind.Monthly,
        "workday" => RepeatKind.Workday,
        _ => RepeatKind.None
    };

    class TodoWidgetInfo : IWidget
    {
        readonly IHostHandle _host;
        readonly TodoWidget _control;

        public TodoWidgetInfo(IHostHandle host, TodoWidget control)
        {
            _host = host;
            _control = control;
        }

        public string Id => "todo.main";
        public int Columns => 2;
        public int Rows => 3;
        public WidgetBackdrop Backdrop => WidgetBackdrop.Acrylic;

        public object CreateControl()
        {
            _control.SetAcrylicBackground((Brush)_host.GetWidgetBackgroundBrush());
            return _control;
        }
    }
}
