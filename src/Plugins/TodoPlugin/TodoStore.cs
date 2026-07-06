using System.Text.Json;
using System.Text.Json.Serialization;
using PluginContract;

namespace TodoPlugin;

public enum RepeatKind { None, Daily, Weekly, Monthly, Workday }

public enum Priority { None, Low, Medium, High }

public sealed class Subtask
{
    public string Text { get; set; } = "";
    public bool Done { get; set; }
}

public sealed class TodoItem
{
    public string Text { get; set; } = "";
    public bool Done { get; set; }
    public DateTime? Deadline { get; set; }
    public int LeadMinutes { get; set; }
    public string? Note { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public RepeatKind Repeat { get; set; } = RepeatKind.None;

    public bool Reminded { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Priority Priority { get; set; } = Priority.None;

    public string Tags { get; set; } = "";          // comma-separated
    public List<Subtask> Subtasks { get; set; } = new();

    public string List { get; set; } = "默认";      // which named list this belongs to
    public DateTime? CompletedDate { get; set; }     // when this item was completed
}

public sealed class TodoStore
{
    const string PluginId = nameof(TodoPlugin);
    public const string DefaultList = "默认";
    public const string InboxList = "收件箱";
    static readonly JsonSerializerOptions Opts = new() { PropertyNameCaseInsensitive = true };

    readonly IHostHandle _host;

    public List<TodoItem> Items { get; private set; } = new();

    public event Action? Changed;

    public string[] ListNames
        => new[] { InboxList, DefaultList }.Concat(
            Items.Select(i => i.List).Where(s => !string.IsNullOrWhiteSpace(s) && s != DefaultList && s != InboxList).Distinct().OrderBy(s => s)).ToArray();

    public TodoStore(IHostHandle host)
    {
        _host = host;
        Load();
    }

    public List<TodoItem> ItemsInList(string list)
        => Items.Where(i => i.List == list).ToList();

    void Load()
    {
        var raw = _host.GetConfig(PluginId, "items");
        if (string.IsNullOrWhiteSpace(raw)) { Items = new(); return; }
        try
        {
            Items = JsonSerializer.Deserialize<List<TodoItem>>(raw, Opts) ?? new();
            // backfill missing List to default
            foreach (var i in Items)
                if (string.IsNullOrWhiteSpace(i.List)) i.List = DefaultList;
            _host.Log($"Todo: loaded {Items.Count} items");
        }
        catch (Exception ex)
        {
            _host.LogError($"Todo: failed to load items: {ex.Message}");
            Items = new();
        }
    }

    public void Save()
    {
        try { _host.SetConfig(PluginId, "items", JsonSerializer.Serialize(Items)); }
        catch (Exception ex) { _host.LogError($"Todo: failed to save items: {ex.Message}"); }
        Changed?.Invoke();
    }

    public TodoItem Add(string text, string? list = null)
    {
        var item = new TodoItem { Text = text.Trim(), Done = false, List = list ?? DefaultList };
        Items.Add(item);
        _host.Log($"Todo: add '{item.Text}' in list '{item.List}'");
        Save();
        return item;
    }

    public void ToggleSubtask(TodoItem item, Subtask st, bool autoComplete)
    {
        st.Done = !st.Done;
        if (autoComplete && !item.Done && item.Subtasks.Count > 0 && item.Subtasks.All(s => s.Done))
        {
            item.Done = true;
            item.CompletedDate = DateTime.Today;
            _host.Log($"Todo: auto-completed '{item.Text}' (all subtasks done)");
        }
        Save();
    }

    public void Toggle(TodoItem item)
    {
        item.Done = !item.Done;
        if (item.Done) item.CompletedDate = DateTime.Today;
        else item.CompletedDate = null;
        Save();
    }

    public void Delete(TodoItem item) { Items.Remove(item); Save(); }

    public void ClearCompleted(string? list = null)
    {
        var n = list != null
            ? Items.RemoveAll(i => i.Done && i.List == list)
            : Items.RemoveAll(i => i.Done);
        _host.Log($"Todo: cleared {n} completed");
        Save();
    }

    public bool CompleteByText(string text)
    {
        var item = Items.FirstOrDefault(i => !i.Done && i.Text.Contains(text, StringComparison.OrdinalIgnoreCase));
        if (item == null) return false;
        item.Done = true;
        Save();
        return true;
    }

    public bool UncompleteByText(string text)
    {
        var item = Items.FirstOrDefault(i => i.Done && i.Text.Contains(text, StringComparison.OrdinalIgnoreCase));
        if (item == null) return false;
        item.Done = false;
        Save();
        return true;
    }

    public bool DeleteByText(string text)
    {
        var item = Items.FirstOrDefault(i => i.Text.Contains(text, StringComparison.OrdinalIgnoreCase));
        if (item == null) return false;
        Items.Remove(item); Save();
        return true;
    }

    public TodoItem? FindByText(string text)
        => Items.FirstOrDefault(i => i.Text.Contains(text, StringComparison.OrdinalIgnoreCase));

    public void MoveToExistingList(TodoItem item, string list)
    {
        item.List = string.IsNullOrWhiteSpace(list) ? DefaultList : list;
        Save();
    }

    public void RenameList(string oldName, string newName)
    {
        if (oldName == DefaultList) return;
        foreach (var i in Items.Where(i => i.List == oldName))
            i.List = newName;
        Save();
    }

    // sort key for display ordering: overdue → today → future → no deadline, then by priority desc, then by deadline asc
    public static int SortOrder(TodoItem i)
    {
        var now = DateTime.Now;
        if (i.Done) return 6;         // done always last
        if (i.Deadline is { } d)
        {
            if (d < now) return 0;   // overdue
            if (d.Date == now.Date) return 1;  // today
            return 2;                // future
        }
        return 3;                    // no deadline
    }
}
