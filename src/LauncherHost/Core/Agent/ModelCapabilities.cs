namespace LauncherHost.Core.Agent;

public static class ModelCapabilities
{
    static readonly Dictionary<string, HashSet<string>> _supported = new()
    {
        ["deepseek-v4-pro"]   = new() { "text" },
        ["deepseek-v4-flash"] = new() { "text" },
        ["mimo-v2.5"]         = new() { "text", "image_url", "input_audio", "video_url" },
        ["mimo-v2.5-pro"]     = new() { "text" },
    };

    public static bool Supports(string model, string contentType)
        => _supported.TryGetValue(model, out var set) && set.Contains(contentType);

    public static bool SupportsAnyMultimodal(string model)
        => _supported.TryGetValue(model, out var set) && set.Any(c => c != "text");

    public static HashSet<string> GetSupported(string model)
        => _supported.TryGetValue(model, out var set) ? set : new() { "text" };
}
