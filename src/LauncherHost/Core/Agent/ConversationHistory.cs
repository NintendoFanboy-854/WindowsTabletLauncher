namespace LauncherHost.Core.Agent;

public sealed record ChatMessage(
    string Role,
    string? Content = null,
    string? ToolCallId = null,
    List<ToolCallInfo>? ToolCalls = null,
    string? ReasoningContent = null)
{
    public string? Name { get; init; }
}

public sealed record ToolCallInfo(
    string Id,
    string Type,
    FunctionCallInfo Function);

public sealed record FunctionCallInfo(
    string Name,
    string Arguments);

public class ConversationHistory
{
    readonly List<ChatMessage> _messages = new();
    string _systemPrompt = "";

    public IReadOnlyList<ChatMessage> Messages => _messages;
    public string SystemPrompt { get => _systemPrompt; set => _systemPrompt = value; }

    public void AddUserMessage(string text)
        => _messages.Add(new ChatMessage("user", Content: text));

    public void AddAssistantMessage(string? content, string? reasoning, List<ToolCallInfo>? calls)
        => _messages.Add(new ChatMessage("assistant", Content: content, ToolCalls: calls, ReasoningContent: reasoning));

    public void AddToolResult(string toolCallId, string toolName, string result)
        => _messages.Add(new ChatMessage("tool", Content: result, ToolCallId: toolCallId) { Name = toolName });

    public void Clear() { _messages.Clear(); _systemPrompt = ""; }

    public List<object> ToApiMessages()
    {
        var list = new List<object>();
        if (!string.IsNullOrWhiteSpace(_systemPrompt))
            list.Add(new { role = "system", content = _systemPrompt });

        foreach (var m in _messages)
        {
            if (m.Role == "tool")
            {
                list.Add(new { role = "tool", tool_call_id = m.ToolCallId, content = m.Content, name = m.Name });
            }
            else if (m.Role == "assistant" && m.ToolCalls is { Count: > 0 })
            {
                var tcs = m.ToolCalls.Select(tc => new
                {
                    id = tc.Id,
                    type = tc.Type,
                    function = new { name = tc.Function.Name, arguments = tc.Function.Arguments }
                }).ToList();

                var msg = new Dictionary<string, object?>
                {
                    ["role"] = "assistant",
                    ["content"] = m.Content,
                    ["tool_calls"] = tcs
                };
                if (!string.IsNullOrEmpty(m.ReasoningContent))
                    msg["reasoning_content"] = m.ReasoningContent;
                list.Add(msg);
            }
            else if (m.Role == "assistant" && !string.IsNullOrEmpty(m.ReasoningContent))
            {
                list.Add(new { role = "assistant", content = m.Content, reasoning_content = m.ReasoningContent });
            }
            else
            {
                list.Add(new { role = m.Role, content = m.Content });
            }
        }
        return list;
    }

    public int EstimateTokenCount()
    {
        var text = string.Join("\n", _messages.Select(m =>
            $"{m.Role}: {m.Content ?? ""} {(m.ReasoningContent ?? "")}"
        ));
        return (int)(text.Length * 0.65);
    }

    public async Task CompressAsync(string apiKey, string memoryPrompt)
    {
        using var flash = new DeepSeekClient(apiKey, "deepseek-v4-flash", "none");
        var text = string.Join("\n", _messages.TakeLast(30).Select(m =>
            $"{m.Role}: {m.Content ?? (m.ToolCalls != null ? "[工具调用: " + string.Join(",", m.ToolCalls.Select(tc => tc.Function.Name)) + "]" : "(空)")}"
        ));

        var summary = await CompressOneShotAsync(flash, text);
        var last3 = _messages.TakeLast(6).ToList();
        _messages.Clear();

        var compressedPrompt = _systemPrompt;
        if (!string.IsNullOrEmpty(memoryPrompt)) compressedPrompt += "\n" + memoryPrompt;
        compressedPrompt += "\n[对话摘要]\n" + (summary ?? "(无)") + "\n";

        foreach (var m in last3)
            _messages.Add(m);

        _systemPrompt = compressedPrompt;
    }

    async Task<string?> CompressOneShotAsync(DeepSeekClient flash, string text)
    {
        var msgs = new List<object>
        {
            new { role = "user", content = "请将以下对话提炼为要点，只包含: 用户目标、已完成操作、当前状态、关键事实。\n\n" + text }
        };
        try
        {
            var resp = await flash.SendAndCollectAsync(msgs, null, null, null, CancellationToken.None);
            return resp.Content?.Trim();
        }
        catch { return null; }
    }
}
