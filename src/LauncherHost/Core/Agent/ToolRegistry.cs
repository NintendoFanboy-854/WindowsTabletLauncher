using PluginContract;

namespace LauncherHost.Core.Agent;

public sealed class ToolRegistry
{
    readonly IHostHandle _host;
    readonly List<(string PluginId, IAgentCapability Capability)> _caps = new();
    readonly List<ToolDef> _hostTools = new();
    List<ToolDef>? _cachedToolDefs;

    public ToolRegistry(IHostHandle host)
    {
        _host = host;
    }

    public void Refresh()
    {
        _caps.Clear();
        _hostTools.Clear();
        _cachedToolDefs = null;
        var handlesCaps = ((HostHandle)GetHostImpl()).GetCapabilities();
        foreach (var cap in handlesCaps)
        {
            if (cap is HostAgentCapability hc)
            {
                foreach (var t in hc.GetTools())
                    _hostTools.Add(new ToolDef(t.Name, t.Description, t.ParametersJsonSchema));
            }
            else
            {
                var pluginId = cap.GetType().DeclaringType?.Name ?? cap.GetType().Name;
                _caps.Add((pluginId, cap));
            }
        }
    }

    object GetHostImpl()
    {
        return _host;
    }

    public List<ToolDef> GetToolDefs()
    {
        if (_cachedToolDefs != null) return _cachedToolDefs;
        var tools = new List<ToolDef>(_hostTools);
        foreach (var (pluginId, cap) in _caps)
        {
            foreach (var t in cap.GetTools())
                tools.Add(new ToolDef(t.Name, t.Description, t.ParametersJsonSchema));
        }
        _cachedToolDefs = tools;
        return tools;
    }

    public async Task<string> InvokeAsync(string toolName, string argumentsJson)
    {
        foreach (var (id, cap) in _caps)
        {
            foreach (var t in cap.GetTools())
            {
                if (t.Name == toolName)
                {
                    try { return await cap.InvokeAsync(toolName, argumentsJson); }
                    catch (Exception ex) { return $"{{\"ok\":false,\"error\":\"{Escape(ex.Message)}\"}}"; }
                }
            }
        }

        var host = GetHostImpl();
        if (host is HostHandle hh)
        {
            foreach (var cap in hh.GetCapabilities())
            {
                if (cap is HostAgentCapability hc)
                {
                    foreach (var t in hc.GetTools())
                    {
                        if (t.Name == toolName)
                        {
                            try { return await hc.InvokeAsync(toolName, argumentsJson); }
                            catch (Exception ex) { return $"{{\"ok\":false,\"error\":\"{Escape(ex.Message)}\"}}"; }
                        }
                    }
                    break;
                }
            }
        }

        return $"{{\"ok\":false,\"error\":\"tool_not_found: {Escape(toolName)}\"}}";
    }

    static string Escape(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        var sb = new System.Text.StringBuilder(s.Length + 8);
        foreach (var ch in s)
        {
            switch (ch)
            {
                case '\\': sb.Append("\\\\"); break;
                case '"': sb.Append("\\\""); break;
                case '\n': sb.Append("\\n"); break;
                case '\r': sb.Append("\\r"); break;
                case '\t': sb.Append("\\t"); break;
                default:
                    if (char.IsControl(ch)) sb.Append(' ');
                    else sb.Append(ch);
                    break;
            }
        }
        return sb.ToString();
    }

    public int GetActiveToolCount()
    {
        int count = _hostTools.Count;
        foreach (var (_, cap) in _caps) count += cap.GetTools().Count;
        return count;
    }

    /// <summary>
    /// 收集所有插件的状态快照（IAgentCapability.GetContextSnapshot hook），
    /// 用于每轮对话注入 system prompt，让 LLM 无需调用查询工具即可感知当前状态。
    /// </summary>
    public string BuildContextPrompt()
    {
        var sections = new List<string>();
        try
        {
            var host = GetHostImpl();
            if (host is HostHandle hh)
            {
                foreach (var cap in hh.GetCapabilities())
                {
                    if (cap is HostAgentCapability hc)
                    {
                        var s = SafeSnapshot(hc);
                        if (s != null) sections.Add(s);
                        break;
                    }
                }
            }
        }
        catch { }

        foreach (var (pluginId, cap) in _caps)
        {
            var s = SafeSnapshot(cap);
            if (s != null) sections.Add(s);
        }
        return string.Join("\n", sections);
    }

    static string? SafeSnapshot(IAgentCapability cap)
    {
        try { return cap.GetContextSnapshot(); }
        catch { return null; }
    }
}
