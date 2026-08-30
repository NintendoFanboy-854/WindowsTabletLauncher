using Microsoft.UI.Dispatching;
using PluginContract;

namespace SharedUtils;

public abstract class AgentCapabilityBase : IAgentCapability
{
    readonly DispatcherQueue _dispatcher;
    readonly IReadOnlyList<AgentTool> _tools;

    protected AgentCapabilityBase(DispatcherQueue dispatcher)
    {
        _dispatcher = dispatcher;
        _tools = DefineTools();
    }

    protected abstract IReadOnlyList<AgentTool> DefineTools();
    protected abstract string HandleTool(string tool, string argumentsJson);

    public IReadOnlyList<AgentTool> GetTools() => _tools;

    public Task<string> InvokeAsync(string tool, string argumentsJson)
    {
        var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);
        void Run()
        {
            try { tcs.SetResult(HandleTool(tool, argumentsJson ?? "{}")); }
            catch (Exception ex) { tcs.SetException(ex); }
        }

        if (_dispatcher.HasThreadAccess) Run();
        else if (!_dispatcher.TryEnqueue(Run))
            tcs.TrySetResult("{\"ok\":false,\"error\":\"dispatcher_unavailable\"}");
        return tcs.Task;
    }
}
