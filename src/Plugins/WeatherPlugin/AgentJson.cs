using System.Text.Json;

namespace WeatherPlugin;

internal static class AgentJson
{
    public static string Serialize(object value) => JsonSerializer.Serialize(value);

    public static string Error(string code) => JsonSerializer.Serialize(new { ok = false, error = code });

    public static string? GetString(string json, string key)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                doc.RootElement.TryGetProperty(key, out var v))
                return v.ValueKind == JsonValueKind.String ? v.GetString() : v.ToString();
        }
        catch { }
        return null;
    }

    public static int? GetInt(string json, string key)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                doc.RootElement.TryGetProperty(key, out var v))
            {
                if (v.ValueKind == JsonValueKind.Number && v.TryGetInt32(out var n)) return n;
                if (v.ValueKind == JsonValueKind.String && int.TryParse(v.GetString(), out var s)) return s;
            }
        }
        catch { }
        return null;
    }

    public static bool? GetBool(string json, string key)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                doc.RootElement.TryGetProperty(key, out var v))
            {
                if (v.ValueKind == JsonValueKind.True) return true;
                if (v.ValueKind == JsonValueKind.False) return false;
                if (v.ValueKind == JsonValueKind.String && bool.TryParse(v.GetString(), out var b)) return b;
            }
        }
        catch { }
        return null;
    }
}
