using PluginContract;

namespace LauncherHost.Core.Agent;

public sealed class AgentService
{
    readonly IHostHandle _host;
    readonly ToolRegistry _toolRegistry;
    readonly MemoryStore _memory = new();
    readonly ConversationHistory _history = new();
    ChatClient? _client;
    AgentLoop? _currentLoop;
    CancellationTokenSource? _cts;
    string _model = "deepseek-v4-pro";
    string _thinking = "none";
    string _provider = "deepseek";

    public event Action<string>? OnThinking;
    public event Action<string>? OnContent;
    public event Action<string, string>? OnToolStart;
    public event Action<string, string>? OnToolResult;
    public event Action<string>? OnError;
    public event Action? OnBusyChanged;

    public bool IsBusy => _currentLoop != null;
    public string? LastError { get; private set; }
    public string Model => _model;
    public string Thinking => _thinking;
    public string Provider => _provider;
    public ConversationHistory History => _history;
    public MemoryStore Memory => _memory;

    public AgentService(IHostHandle host)
    {
        _host = host;
        _toolRegistry = new ToolRegistry(host);
        ReloadConfig();
        RefreshTools();
    }

    public void ReloadConfig()
    {
        _provider = _host.GetConfig("host", "agent_provider") ?? "deepseek";
        _model = _host.GetConfig("host", $"agent_model.{_provider}")
            ?? _host.GetConfig("host", "agent_model")
            ?? "deepseek-v4-pro";
        _thinking = _host.GetConfig("host", $"agent_thinking.{_provider}")
            ?? _host.GetConfig("host", "agent_thinking")
            ?? "none";
    }

    string GetApiKey()
    {
        var key = _host.GetConfig("host", $"agent_api_key.{_provider}");
        if (!string.IsNullOrWhiteSpace(key)) return key!;
        return _host.GetConfig("host", "agent_api_key") ?? "";
    }

    public string MimoApiKey =>
        _host.GetConfig("host", "agent_api_key.mimo")
        ?? _host.GetConfig("host", "mimo_api_key")
        ?? "";

    public bool ExpandCot => (_host.GetConfig("host", "agent_expand_cot") ?? "false") == "true";
    public event Action? ExpandCotChanged;
    public event Action? OnAgentRetry;
    public event Action? OnAgentRetryExhausted;
    public void NotifyExpandCotChanged() => ExpandCotChanged?.Invoke();

    public void RefreshTools()
    {
        _toolRegistry.Refresh();
        _host.Log($"Agent: {_toolRegistry.GetActiveToolCount()} tools, model={_model} thinking={_thinking} provider={_provider}");
    }

    static bool IsMultimodalModel(string model) => model == "mimo-v2.5";

    public void EnsureClient()
    {
        var apiKey = GetApiKey();
        if (string.IsNullOrWhiteSpace(apiKey))
            return;

        var oldProvider = _client?.Provider;
        if (_client != null && _provider == oldProvider && _client.Config.Model == _model
            && _client.Config.Thinking == _thinking && _client.Config.ApiKey == apiKey)
            return;

        var supportsMultimodal = IsMultimodalModel(_model);
        var isMimo = _provider == "mimo";

        var config = new ProviderClientConfig(
            _provider,
            isMimo ? "https://api.xiaomimimo.com/v1" : "https://api.deepseek.com",
            apiKey,
            _model,
            _thinking,
            isMimo ? "api-key" : "authorization",
            supportsMultimodal,
            !isMimo);

        _client?.Dispose();
        _client = new ChatClient(config);
    }

    public async Task SendAsync(string userInput,
        Action<string>? onThinking = null,
        Action<string>? onContent = null,
        Action<string, string>? onToolStart = null,
        Action<string, string>? onToolResult = null,
        Action<string>? onError = null)
    {
        await SendCoreAsync(
            (loop, ct) => loop.RunAsync(userInput, ct),
            onThinking, onContent, onToolStart, onToolResult, onError);
    }

    public async Task SendWithParts(List<ContentPart> parts,
        Action<string>? onThinking = null,
        Action<string>? onContent = null,
        Action<string, string>? onToolStart = null,
        Action<string, string>? onToolResult = null,
        Action<string>? onError = null)
    {
        await SendCoreAsync(
            (loop, ct) => loop.RunWithParts(parts, ct),
            onThinking, onContent, onToolStart, onToolResult, onError);
    }

    async Task SendCoreAsync(
        Func<AgentLoop, CancellationToken, Task<string>> run,
        Action<string>? onThinking,
        Action<string>? onContent,
        Action<string, string>? onToolStart,
        Action<string, string>? onToolResult,
        Action<string>? onError)
    {
        if (IsBusy)
        {
            onError?.Invoke("busy");
            return;
        }

        ReloadConfig();
        EnsureClient();

        if (_client == null)
        {
            onError?.Invoke("请先在设置中填写 API Key");
            return;
        }

        var cts = new CancellationTokenSource();
        _cts = cts;
        var loop = new AgentLoop(_client, _toolRegistry, _memory, _history);
        _currentLoop = loop;

        loop.OnThinking += d => { onThinking?.Invoke(d); OnThinking?.Invoke(d); };
        loop.OnContent += d => { onContent?.Invoke(d); OnContent?.Invoke(d); };
        loop.OnToolStart += (n, a) => { onToolStart?.Invoke(n, a); OnToolStart?.Invoke(n, a); };
        loop.OnToolResult += (n, r) => { onToolResult?.Invoke(n, r); OnToolResult?.Invoke(n, r); };
        loop.OnError += e => { onError?.Invoke(e); OnError?.Invoke(e); };
        loop.OnRetry += () =>
        {
            OnAgentRetry?.Invoke();
            _host.ShowNotification("自动重试", "模型未返回最终回答，正在重试…", false);
        };
        loop.OnRetryExhausted += () =>
        {
            OnAgentRetryExhausted?.Invoke();
            _host.ShowNotification("重试失败", "已达最大重试次数，可展开查看思考内容", false);
        };

        NotifyBusy();

        try
        {
            var result = await run(loop, cts.Token);
            _host.Log($"Agent: completed, length={result.Length}");
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            LastError = ex.Message;
            onError?.Invoke(ex.Message);
            OnError?.Invoke(ex.Message);
            _host.LogError($"Agent error: {ex.Message}");
        }
        finally
        {
            if (ReferenceEquals(_currentLoop, loop))
                _currentLoop = null;
            if (ReferenceEquals(_cts, cts))
            {
                _cts.Dispose();
                _cts = null;
            }
            NotifyBusy();
        }
    }

    public void SwitchProvider(string provider)
    {
        if (IsBusy) return;
        _provider = provider;
        _host.SetConfig("host", "agent_provider", provider);
        ClearHistory();
        _client?.Dispose();
        _client = null;
        _host.Log($"Agent: switched provider to {provider}");
    }

    public void Abort()
    {
        try { _cts?.Cancel(); }
        catch (ObjectDisposedException) { }
    }

    public void ClearHistory()
    {
        if (IsBusy) return;
        _history.Clear();
    }

    void NotifyBusy() => OnBusyChanged?.Invoke();
}
