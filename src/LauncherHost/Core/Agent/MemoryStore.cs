using System.Text.Json;

namespace LauncherHost.Core.Agent;

public sealed class MemoryStore
{
    readonly string _path;
    readonly List<(string Key, string Value)> _facts = new();
    readonly object _gate = new();
    const int MaxFacts = 100;

    public MemoryStore()
    {
        _path = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "WindowsTabletLauncher", "memory.json");
        Load();
    }

    public IReadOnlyList<(string Key, string Value)> Facts
    {
        get { lock (_gate) return _facts.ToList(); }
    }

    public void SetFact(string key, string value)
    {
        lock (_gate)
        {
            SetFactInternal(key, value);
            Save();
        }
    }

    public void Clear()
    {
        lock (_gate)
        {
            _facts.Clear();
            Save();
        }
    }

    public void ReloadFromDisk()
    {
        lock (_gate)
        {
            _facts.Clear();
            Load();
        }
    }

    public string ToPromptSection()
    {
        lock (_gate)
        {
            if (_facts.Count == 0) return "";
            return "用户信息:\n" + string.Join("\n", _facts.Select(f => "- " + f.Key + ": " + f.Value)) + "\n";
        }
    }

    void SetFactInternal(string key, string value)
    {
        var existing = _facts.FindIndex(f => f.Key == key);
        if (existing >= 0) _facts[existing] = (key, value);
        else _facts.Add((key, value));

        while (_facts.Count > MaxFacts)
            _facts.RemoveAt(0);
    }

    void Load()
    {
        if (!File.Exists(_path)) return;
        try
        {
            var json = File.ReadAllText(_path);
            var list = JsonSerializer.Deserialize<List<List<string>>>(json);
            if (list != null)
                foreach (var pair in list)
                    if (pair.Count >= 2) _facts.Add((pair[0], pair[1]));
        }
        catch (Exception ex)
        {
            Log($"memory.json parse failed: {ex.Message}");
            _facts.Clear();
        }
    }

    void Save()
    {
        try
        {
            var list = _facts.Select(f => new List<string> { f.Key, f.Value }).ToList();
            Directory.CreateDirectory(Path.GetDirectoryName(_path)!);
            var tmp = _path + ".tmp";
            File.WriteAllText(tmp, JsonSerializer.Serialize(list));
            File.Move(tmp, _path, true);
        }
        catch (Exception ex)
        {
            Log($"memory.json save failed: {ex.Message}");
        }
    }

    static void Log(string message) => Services.LogService.Warn($"MemoryStore: {message}");
}
