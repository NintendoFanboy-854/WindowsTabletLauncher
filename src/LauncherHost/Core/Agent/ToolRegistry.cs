using PluginContract;

namespace LauncherHost.Core.Agent;

public sealed class ToolRegistry
{
    readonly IHostHandle _host;
    readonly List<(string PluginId, IAgentCapability Capability)> _caps = new();
    readonly List<ToolDef> _hostTools = new();
    int _pageCount;

    public int PageCount => _pageCount;

    public ToolRegistry(IHostHandle host)
    {
        _host = host;
    }

    public void Refresh()
    {
        _caps.Clear();
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

    public void IncreasePageCount(int count) => _pageCount = Math.Max(_pageCount, count);

    public List<ToolDef> GetToolDefs()
    {
        var tools = new List<ToolDef>(_hostTools);
        foreach (var (pluginId, cap) in _caps)
        {
            foreach (var t in cap.GetTools())
                tools.Add(new ToolDef(t.Name, t.Description, t.ParametersJsonSchema));
        }
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

    static string Escape(string s) => s.Replace("\\", "\\\\").Replace("\"", "\\\"");

    public int GetActiveToolCount()
    {
        int count = _hostTools.Count;
        foreach (var (_, cap) in _caps) count += cap.GetTools().Count;
        return count;
    }
}
