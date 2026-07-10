using System.Text.Json;
using LauncherHost.Services;

namespace LauncherHost.Core.Agent;

public sealed class AgentLoop
{
    readonly ConversationHistory _history;
    readonly ToolRegistry _toolRegistry;
    readonly DeepSeekClient _client;
    readonly MemoryStore _memory;
    readonly string _apiKey;
    int _maxTurns = 10;
    int _retryAttempt;
    const int MaxRetry = 3;
    const int CompressThreshold = 800_000;

    public event Action<string>? OnThinking;
    public event Action<string>? OnContent;
    public event Action<string, string>? OnToolStart;
    public event Action<string, string>? OnToolResult;
    public event Action<string>? OnError;
    public event Action? OnRetry;
    public event Action? OnRetryExhausted;

    public AgentLoop(DeepSeekClient client, ToolRegistry toolRegistry, MemoryStore memory, string apiKey,
        ConversationHistory? history = null, string? systemPrompt = null)
    {
        _client = client;
        _toolRegistry = toolRegistry;
        _memory = memory;
        _apiKey = apiKey;
        _history = history ?? new ConversationHistory();
        _history.SystemPrompt = BuildSystemPrompt(systemPrompt ?? DefaultSystemPrompt);
    }

    public ConversationHistory History => _history;

    string BuildSystemPrompt(string basePrompt)
    {
        var memory = _memory.ToPromptSection();
        if (string.IsNullOrEmpty(memory)) return basePrompt;
        return basePrompt + "\n" + memory;
    }

    public async Task<string> RunAsync(string userInput, CancellationToken ct)
    {
        _history.AddUserMessage(userInput);

        for (int turn = 0; turn < _maxTurns && !ct.IsCancellationRequested; turn++)
        {
            LogService.Info($"[AgentTurn] sub_turn={turn} msgs={_history.Messages.Count}");
            var tools = _toolRegistry.GetToolDefs();
            AgentResponse response;

            try
            {
                response = await _client.SendAndCollectAsync(
                    _history.ToApiMessages(),
                    tools.Count > 0 ? tools : null,
                    delta => OnThinking?.Invoke(delta),
                    delta => OnContent?.Invoke(delta),
                    ct);
            }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex)
            {
                OnError?.Invoke(ex.Message);
                return "错误: " + ex.Message;
            }

            if (response.ToolCalls is { Count: > 0 })
            {
                _retryAttempt = 0;
                _history.AddAssistantMessage(
                    response.Content,
                    response.ThinkingContent,
                    response.ToolCalls.Select(tc =>
                        new ToolCallInfo(tc.Id, "function", new FunctionCallInfo(tc.Name, tc.Arguments))
                    ).ToList());

                foreach (var tc in response.ToolCalls)
                {
                    OnToolStart?.Invoke(tc.Name, tc.Arguments);
                    var result = await _toolRegistry.InvokeAsync(tc.Name, tc.Arguments);
                    OnToolResult?.Invoke(tc.Name, result);
                    _history.AddToolResult(tc.Id, tc.Name, result);
                }
            }
            else
            {
                var finalText = response.Content ?? "";
                if (!string.IsNullOrWhiteSpace(finalText))
                {
                    _retryAttempt = 0;
                    _history.AddAssistantMessage(finalText, response.ThinkingContent, null);
                    await MaybeCompressAsync();
                    return finalText;
                }
                if (!string.IsNullOrEmpty(response.ThinkingContent) && ++_retryAttempt < MaxRetry)
                {
                    LogService.Info($"[AgentLoop] empty content with thinking, retry {_retryAttempt}/{MaxRetry}");
                    OnRetry?.Invoke();
                    turn--;
                    continue;
                }
                if (_retryAttempt >= MaxRetry)
                {
                    LogService.Info("[AgentLoop] max retries reached");
                    OnRetryExhausted?.Invoke();
                }
                return "";
            }
        }

        var error = "达到最大工具调用次数，已中止。";
        OnError?.Invoke(error);
        return error;
    }

    async Task MaybeCompressAsync()
    {
        if (_history.EstimateTokenCount() > CompressThreshold)
        {
            try { await _history.CompressAsync(_apiKey, _memory.ToPromptSection()); }
            catch (Exception ex) { OnError?.Invoke("压缩失败: " + ex.Message); }
        }
    }

    public void Abort() { }

    static string DefaultSystemPrompt =>
        """
        你是 Windows Tablet Launcher 的智能助手。

        回复规则：
        1. 可使用 Markdown 简单排版（**粗体**、- 列表、`代码`），禁止 HTML
        2. 回复简洁，直接给结果
        3. 优先使用工具完成任务
        4. 禁止 emoji
        """;
}
