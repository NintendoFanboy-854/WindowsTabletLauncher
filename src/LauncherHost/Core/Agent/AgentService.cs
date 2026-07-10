using PluginContract;

namespace LauncherHost.Core.Agent;

public sealed class AgentService
{
    readonly IHostHandle _host;
    readonly ToolRegistry _toolRegistry;
    readonly MemoryStore _memory = new();
    readonly ConversationHistory _history = new();
    DeepSeekClient? _client;
    AgentLoop? _currentLoop;
    CancellationTokenSource? _cts;
    string _model = "deepseek-v4-pro";
    string _thinking = "none";

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
    public ConversationHistory History => _history;

    public AgentService(IHostHandle host)
    {
        _host = host;
        _toolRegistry = new ToolRegistry(host);
        ReloadConfig();
        RefreshTools();
    }

    public void ReloadConfig()
    {
        _model = _host.GetConfig("host", "agent_model") ?? "deepseek-v4-pro";
        _thinking = _host.GetConfig("host", "agent_thinking") ?? "none";
    }

    public bool ExpandCot => (_host.GetConfig("host", "agent_expand_cot") ?? "false") == "true";
    public event Action? ExpandCotChanged;
    public event Action? OnAgentRetry;
    public event Action? OnAgentRetryExhausted;
    public void NotifyExpandCotChanged() => ExpandCotChanged?.Invoke();

    public void RefreshTools()
    {
        _toolRegistry.Refresh();
        _host.Log($"Agent: {_toolRegistry.GetActiveToolCount()} tools, model={_model} thinking={_thinking}");
    }

    public async Task SendAsync(string userInput,
        Action<string>? onThinking = null,
        Action<string>? onContent = null,
        Action<string, string>? onToolStart = null,
        Action<string, string>? onToolResult = null,
        Action<string>? onError = null)
    {
        if (IsBusy) return;

        ReloadConfig();
        var apiKey = _host.GetConfig("host", "agent_api_key");
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            onError?.Invoke("请先在设置中填写 DeepSeek API Key");
            return;
        }

        bool needNewClient = _client == null;
        if (!needNewClient) needNewClient = true;

        if (needNewClient)
        {
            try { _client = new DeepSeekClient(apiKey, _model, _thinking); }
            catch (Exception ex) { onError?.Invoke("API Key 无效: " + ex.Message); return; }
        }

        _cts = new CancellationTokenSource();
        _currentLoop = new AgentLoop(_client!, _toolRegistry, _memory, apiKey, _history);

        _currentLoop.OnThinking += d => { onThinking?.Invoke(d); OnThinking?.Invoke(d); };
        _currentLoop.OnContent += d => { onContent?.Invoke(d); OnContent?.Invoke(d); };
        _currentLoop.OnToolStart += (n, a) => { onToolStart?.Invoke(n, a); OnToolStart?.Invoke(n, a); };
        _currentLoop.OnToolResult += (n, r) => { onToolResult?.Invoke(n, r); OnToolResult?.Invoke(n, r); };
        _currentLoop.OnError += e => { onError?.Invoke(e); OnError?.Invoke(e); };
        _currentLoop.OnRetry += () =>
        {
            OnAgentRetry?.Invoke();
            _host.ShowNotification("自动重试", "模型未返回最终回答，正在重试…", false);
        };
        _currentLoop.OnRetryExhausted += () =>
        {
            OnAgentRetryExhausted?.Invoke();
            _host.ShowNotification("重试失败", "已达最大重试次数，可展开查看思考内容", false);
        };

        NotifyBusy();

        try
        {
            var result = await _currentLoop.RunAsync(userInput, _cts.Token);
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
            _currentLoop = null;
            _cts?.Dispose();
            _cts = null;
            NotifyBusy();
        }
    }

    public void Abort()
    {
        _cts?.Cancel();
        _currentLoop = null;
    }

    public void ClearHistory()
    {
        if (IsBusy) return;
        _history.Clear();
    }

    void NotifyBusy() => OnBusyChanged?.Invoke();
}
