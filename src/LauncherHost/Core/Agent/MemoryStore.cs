using System.Text.Json;

namespace LauncherHost.Core.Agent;

public sealed class MemoryStore
{
    readonly string _path;
    readonly List<(string Key, string Value)> _facts = new();
    const int MaxFacts = 100;

    public MemoryStore()
    {
        _path = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "WindowsTabletLauncher", "memory.json");
        Load();
    }

    public IReadOnlyList<(string Key, string Value)> Facts => _facts;

    public void SetFact(string key, string value)
    {
        SetFactInternal(key, value);
        Save();
    }

    public void ApplyFromJson(string jsonResult)
    {
        try
        {
            var doc = JsonDocument.Parse(jsonResult);
            if (doc.RootElement.TryGetProperty("facts", out var arr))
            {
                foreach (var f in arr.EnumerateArray())
                {
                    var key = f.GetProperty("key").GetString();
                    var value = f.GetProperty("value").GetString();
                    if (!string.IsNullOrWhiteSpace(key) && !string.IsNullOrWhiteSpace(value))
                        SetFactInternal(key, value);
                }
                Save();
            }
        }
        catch { }
    }

    void SetFactInternal(string key, string value)
    {
        var existing = _facts.FindIndex(f => f.Key == key);
        if (existing >= 0) _facts[existing] = (key, value);
        else _facts.Add((key, value));

        while (_facts.Count > MaxFacts)
            _facts.RemoveAt(0);
    }

    public string ToPromptSection()
    {
        if (_facts.Count == 0) return "";
        return "用户信息:\n" + string.Join("\n", _facts.Select(f => "- " + f.Key + ": " + f.Value)) + "\n";
    }

    public void Clear()
    {
        _facts.Clear();
        Save();
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
        catch { _facts.Clear(); }
    }

    void Save()
    {
        try
        {
            var list = _facts.Select(f => new List<string> { f.Key, f.Value }).ToList();
            Directory.CreateDirectory(Path.GetDirectoryName(_path)!);
            File.WriteAllText(_path, JsonSerializer.Serialize(list));
        }
        catch { }
    }
}
