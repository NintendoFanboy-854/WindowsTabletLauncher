using System.Text.Json;
using System.Text.Json.Nodes;

namespace LauncherHost.Services;

public class ConfigStore
{
    private readonly string _configDir;
    private readonly Dictionary<string, JsonObject> _cache = new();
    private readonly HashSet<string> _dirty = new();
    private readonly object _lock = new();
    private readonly System.Threading.Timer _flushTimer;
    private static readonly JsonSerializerOptions IndentedOptions = new() { WriteIndented = true };
    private const int FlushDelayMs = 750;

    public ConfigStore()
    {
        _configDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "WindowsTabletLauncher", "config");
        Directory.CreateDirectory(_configDir);
        _flushTimer = new System.Threading.Timer(_ => FlushNow(), null, Timeout.Infinite, Timeout.Infinite);
    }

    public string? Get(string pluginId, string key)
    {
        lock (_lock)
        {
            var json = Load(pluginId);
            if (json.TryGetPropertyValue(key, out var node) && node is not null)
            {
                if (node is JsonValue jv && jv.TryGetValue<string>(out var sv))
                    return sv;
                return node.ToJsonString();
            }
            return null;
        }
    }

    public void Set(string pluginId, string key, string value)
    {
        lock (_lock)
        {
            if (!_cache.TryGetValue(pluginId, out var json))
            {
                json = LoadFromDisk(pluginId);
                _cache[pluginId] = json;
            }
            if (json.TryGetPropertyValue(key, out var existing) &&
                existing is JsonValue jv && jv.TryGetValue<string>(out var current) && current == value)
                return;
            json[key] = value;
            MarkDirty(pluginId);
        }
    }

    public JsonObject LoadAll(string pluginId)
    {
        lock (_lock) return Load(pluginId);
    }

    public IReadOnlyList<(string pluginId, string key, string value)> GetAll()
    {
        var result = new List<(string, string, string)>();
        try
        {
            lock (_lock)
            {
                foreach (var file in Directory.GetFiles(_configDir, "*.json"))
                {
                    var pluginId = Path.GetFileNameWithoutExtension(file);
                    var json = Load(pluginId);
                    foreach (var (key, node) in json)
                    {
                        if (node is not null)
                            result.Add((pluginId, key, node.ToString()));
                    }
                }
            }
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "ConfigStore.GetAll failed");
        }
        return result;
    }

    public void SaveAll(string pluginId, JsonObject data)
    {
        lock (_lock)
        {
            _cache[pluginId] = data;
            MarkDirty(pluginId);
        }
    }

    public void ResetAll()
    {
        lock (_lock)
        {
            _dirty.Clear();
            _cache.Clear();
        }
        try
        {
            if (Directory.Exists(_configDir))
                foreach (var file in Directory.GetFiles(_configDir, "*.json"))
                    File.Delete(file);
            var memoryPath = Path.Combine(Path.GetDirectoryName(_configDir)!, "memory.json");
            if (File.Exists(memoryPath)) File.Delete(memoryPath);
            LogService.Info("ConfigStore: all config files deleted (reset)");
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "ConfigStore.ResetAll failed");
        }
    }

    public void FlushNow()
    {
        lock (_lock)
        {
            if (_dirty.Count == 0) return;
            foreach (var id in _dirty)
            {
                if (!_cache.TryGetValue(id, out var json)) continue;
                var path = Path.Combine(_configDir, $"{id}.json");
                var tmp = path + ".tmp";
                try
                {
                    File.WriteAllText(tmp, json.ToJsonString(IndentedOptions));
                    File.Move(tmp, path, true);
                }
                catch (Exception ex)
                {
                    LogService.Error(ex, $"ConfigStore: write failed for {path}");
                    try { if (File.Exists(tmp)) File.Delete(tmp); } catch { }
                }
            }
            _dirty.Clear();
        }
    }

    private void MarkDirty(string pluginId)
    {
        _dirty.Add(pluginId);
        try { _flushTimer.Change(FlushDelayMs, Timeout.Infinite); }
        catch (ObjectDisposedException) { }
    }

    private JsonObject Load(string pluginId)
    {
        if (_cache.TryGetValue(pluginId, out var cached))
            return cached;
        var json = LoadFromDisk(pluginId);
        _cache[pluginId] = json;
        return json;
    }

    private JsonObject LoadFromDisk(string pluginId)
    {
        var path = Path.Combine(_configDir, $"{pluginId}.json");
        if (!File.Exists(path)) return new JsonObject();
        string raw;
        try { raw = File.ReadAllText(path); }
        catch (Exception ex)
        {
            LogService.Error(ex, $"Failed to read config file for {pluginId}");
            return new JsonObject();
        }
        try
        {
            return JsonNode.Parse(raw)?.AsObject() ?? new JsonObject();
        }
        catch (Exception ex)
        {
            LogService.Error(ex, $"Failed to parse config for {pluginId} (raw backed up)");
            BackupCorruptFile(path, raw);
            return new JsonObject();
        }
    }

    private void BackupCorruptFile(string path, string raw)
    {
        try
        {
            var backup = $"{path}.corrupt-{DateTime.Now:yyyyMMdd_HHmmss}";
            File.WriteAllText(backup, raw);
            LogService.Error($"ConfigStore: corrupted config backed up to {backup}");
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "ConfigStore: corrupt backup failed");
        }
    }
}
