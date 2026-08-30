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

    /// <summary>由宿主注入的状态快照提供者（GetContextSnapshot hook）。</summary>
    public Func<string?>? ContextProvider { get; set; }

    public string? GetContextSnapshot()
    {
        try { return ContextProvider?.Invoke(); }
        catch { return null; }
    }

    public Task<string> InvokeAsync(string tool, string argumentsJson)
    {
        if (!_handlers.TryGetValue(tool, out var handler))
            return Task.FromResult("{\"ok\":false,\"error\":\"unknown_tool\"}");

        var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);
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
