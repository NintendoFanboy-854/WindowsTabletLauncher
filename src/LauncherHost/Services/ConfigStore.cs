using System.Text.Json;
using System.Text.Json.Nodes;

namespace LauncherHost.Services;

public class ConfigStore
{
    private readonly string _configDir;

    public ConfigStore()
    {
        _configDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "WindowsTabletLauncher", "config");
        Directory.CreateDirectory(_configDir);
    }

    public string? Get(string pluginId, string key)
    {
        var json = Load(pluginId);
        if (json.TryGetPropertyValue(key, out var node) && node is not null)
            return node.GetValue<string>();
        return null;
    }

    public void Set(string pluginId, string key, string value)
    {
        var json = Load(pluginId);
        json[key] = value;
        Save(pluginId, json);
    }

    public JsonObject LoadAll(string pluginId) => Load(pluginId);

    public IReadOnlyList<(string pluginId, string key, string value)> GetAll()
    {
        var result = new List<(string, string, string)>();
        try
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
        catch (Exception ex)
        {
            LogService.Error(ex, "ConfigStore.GetAll failed");
        }
        return result;
    }

    public void SaveAll(string pluginId, JsonObject data) => Save(pluginId, data);

    public void ResetAll()
    {
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

    private string GetPath(string pluginId)
        => Path.Combine(_configDir, $"{pluginId}.json");

    private JsonObject Load(string pluginId)
    {
        var path = GetPath(pluginId);
        if (!File.Exists(path)) return new JsonObject();
        try
        {
            return JsonNode.Parse(File.ReadAllText(path))?.AsObject() ?? new JsonObject();
        }
        catch (Exception ex)
        {
            LogService.Error(ex, $"Failed to load config for {pluginId}");
            return new JsonObject();
        }
    }

    private void Save(string pluginId, JsonObject data)
    {
        File.WriteAllText(GetPath(pluginId),
            JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true }));
    }
}
