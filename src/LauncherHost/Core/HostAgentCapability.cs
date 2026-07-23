using Microsoft.UI.Dispatching;
using PluginContract;

namespace LauncherHost.Core;

public sealed class HostAgentCapability : IAgentCapability
{
    readonly DispatcherQueue _dispatcher;
    readonly IReadOnlyList<AgentTool> _tools;
    readonly Dictionary<string, Func<string, string>> _handlers;

    public HostAgentCapability(
        DispatcherQueue dispatcher,
        IReadOnlyList<AgentTool> tools,
        Dictionary<string, Func<string, string>> handlers)
    {
        _dispatcher = dispatcher;
        _tools = tools;
        _handlers = handlers;
    }

    public IReadOnlyList<AgentTool> GetTools() => _tools;

    public Task<string> InvokeAsync(string tool, string argumentsJson)
    {
        if (!_handlers.TryGetValue(tool, out var handler))
            return Task.FromResult("{\"ok\":false,\"error\":\"unknown_tool\"}");

        var tcs = new TaskCompletionSource<string>();
        void Run()
        {
            try { tcs.SetResult(handler(argumentsJson ?? "{}")); }
            catch (Exception ex) { tcs.SetException(ex); }
        }

        if (_dispatcher.HasThreadAccess) Run();
        else if (!_dispatcher.TryEnqueue(Run))
            tcs.SetException(new InvalidOperationException("DispatcherQueue rejected the work item"));
        return tcs.Task;
    }
}
