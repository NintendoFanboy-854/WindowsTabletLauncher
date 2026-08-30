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
    public string Id { get; set; } = "";
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

    readonly List<string> _lists = new();

    public event Action? Changed;

    string[]? _cachedListNames;
    bool _dirty;

    void InvalidateListNamesCache() => _cachedListNames = null;
    public void MarkDirty() => _dirty = true;

    public string[] ListNames
    {
        get
        {
            if (_cachedListNames != null) return _cachedListNames;
            _cachedListNames = new[] { InboxList, DefaultList }.Concat(_lists)
                .Concat(Items.Select(i => i.List).Where(s => !string.IsNullOrWhiteSpace(s) && s != DefaultList && s != InboxList))
                .Distinct().OrderBy(s => s).ToArray();
            return _cachedListNames;
        }
    }

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
        if (string.IsNullOrWhiteSpace(raw)) { Items = new(); }
        else
        {
            try
            {
                Items = JsonSerializer.Deserialize<List<TodoItem>>(raw, Opts) ?? new();
                foreach (var i in Items)
                {
                    if (string.IsNullOrWhiteSpace(i.List)) i.List = DefaultList;
                    if (string.IsNullOrWhiteSpace(i.Id)) i.Id = Guid.NewGuid().ToString();
                }
                _host.Log($"Todo: loaded {Items.Count} items");
            }
            catch (Exception ex)
            {
                // 损坏数据备份到独立配置键，避免空列表覆写导致永久丢失
                _host.LogError($"Todo: failed to load items: {ex.Message}");
                try { _host.SetConfig(PluginId, "items_corrupt_backup", raw.Length > 512 * 1024 ? raw[..(512 * 1024)] : raw); } catch { }
                _host.ShowNotification("待办", "待办数据解析失败，原数据已备份（items_corrupt_backup）。", false);
                Items = new();
            }
        }

        var listsRaw = _host.GetConfig(PluginId, "lists");
        if (!string.IsNullOrWhiteSpace(listsRaw))
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(listsRaw, Opts);
                if (parsed != null) _lists.AddRange(parsed);
                _host.Log($"Todo: loaded {_lists.Count} lists");
            }
            catch (Exception ex)
            {
                _host.LogError($"Todo: failed to load lists: {ex.Message}");
            }
        }
        _dirty = false;
    }

    public void Save()
    {
        if (!_dirty) return;
        Persist();
        Changed?.Invoke();
    }

    // Persists without broadcasting Changed; used by in-place detail edits so
    // the open editor is not rebuilt (which would destroy focus/scroll state).
    public void SaveQuiet()
    {
        _dirty = true;
        Persist();
    }

    void Persist()
    {
        try
        {
            _host.SetConfig(PluginId, "items", JsonSerializer.Serialize(Items));
            _host.SetConfig(PluginId, "lists", JsonSerializer.Serialize(_lists));
        }
        catch (Exception ex) { _host.LogError($"Todo: failed to save items: {ex.Message}"); }
        _dirty = false;
    }

    public TodoItem Add(string text, string? list = null)
    {
        var item = new TodoItem { Id = Guid.NewGuid().ToString(), Text = text.Trim(), Done = false, List = list ?? DefaultList };
        Items.Add(item);
        _dirty = true; InvalidateListNamesCache();
        _host.Log($"Todo: add '{item.Text}' in list '{item.List}'");
        return item;
    }

    public void ToggleSubtask(TodoItem item, Subtask st, bool autoComplete)
    {
        st.Done = !st.Done;
        _dirty = true;
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
        _dirty = true;
        if (item.Done) item.CompletedDate = DateTime.Today;
        else item.CompletedDate = null;
        Save();
    }

    public void Delete(TodoItem item) { Items.Remove(item); _dirty = true; InvalidateListNamesCache(); Save(); }

    public void ClearCompleted(string? list = null)
    {
        var n = list != null
            ? Items.RemoveAll(i => i.Done && i.List == list)
            : Items.RemoveAll(i => i.Done);
        _dirty = true; InvalidateListNamesCache();
        _host.Log($"Todo: cleared {n} completed");
        Save();
    }

    /// <summary>清空全部内存态并落盘（供 ResetConfig 使用）。</summary>
    public void ResetAll()
    {
        Items = new();
        _lists.Clear();
        InvalidateListNamesCache();
        _dirty = true;
        Persist();
        Changed?.Invoke();
    }

    public TodoItem? FindById(string id)
        => Items.FirstOrDefault(i => i.Id == id);

    public void MoveToExistingList(TodoItem item, string list)
    {
        item.List = string.IsNullOrWhiteSpace(list) ? DefaultList : list;
        _dirty = true; InvalidateListNamesCache();
        Save();
    }

    public void RenameList(string oldName, string newName)
    {
        if (oldName == DefaultList || oldName == InboxList) return;
        for (int i = 0; i < _lists.Count; i++)
        {
            if (_lists[i] == oldName) _lists[i] = newName;
        }
        foreach (var i in Items.Where(i => i.List == oldName))
            i.List = newName;
        _dirty = true; InvalidateListNamesCache();
        Save();
    }

    public bool CreateList(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return false;
        if (name == DefaultList || name == InboxList) return false;
        if (_lists.Contains(name)) return false;
        _lists.Add(name);
        _dirty = true; InvalidateListNamesCache();
        Save();
        return true;
    }

    public bool DeleteList(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return false;
        if (name == DefaultList || name == InboxList) return false;
        _lists.Remove(name);
        var toRemove = Items.Where(i => i.List == name).ToList();
        foreach (var i in toRemove) Items.Remove(i);
        _dirty = true; InvalidateListNamesCache();
        Save();
        return true;
    }

    public static int SortOrder(TodoItem i) => SortOrder(i, DateTime.Now);

    public static int SortOrder(TodoItem i, DateTime now)
    {
        if (i.Done) return 6;
        if (i.Deadline is { } d)
        {
            if (d < now) return 0;
            if (d.Date == now.Date) return 1;
            return 2;
        }
        return 3;
    }
}
