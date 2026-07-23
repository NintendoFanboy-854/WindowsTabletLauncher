using System.Text;
using System.Threading;

namespace LauncherHost.Core.Agent;

public sealed record ContentPart(string Type, Dictionary<string, object?> Data);

public sealed record ChatMessage(
    string Role,
    string? Content = null,
    string? ToolCallId = null,
    List<ToolCallInfo>? ToolCalls = null,
    string? ReasoningContent = null,
    List<ContentPart>? ContentParts = null)
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

    public void AddUserMessage(List<ContentPart> parts)
        => _messages.Add(new ChatMessage("user", ContentParts: parts));

    public void AddAssistantMessage(string? content, string? reasoning, List<ToolCallInfo>? calls)
        => _messages.Add(new ChatMessage("assistant", Content: content, ToolCalls: calls, ReasoningContent: reasoning));

    public void AddToolResult(string toolCallId, string toolName, string result)
        => _messages.Add(new ChatMessage("tool", Content: result, ToolCallId: toolCallId) { Name = toolName });

    public void ReplaceLastUserAudio(string transcription)
    {
        for (int i = _messages.Count - 1; i >= 0; i--)
        {
            if (_messages[i].Role == "user" && _messages[i].ContentParts is { Count: > 0 })
            {
                _messages[i] = _messages[i] with { ContentParts = null, Content = transcription };
                return;
            }
        }
    }

    public void Clear() { _messages.Clear(); _systemPrompt = ""; }

    static string ContentPartToPlaceholder(ContentPart part) => part.Type switch
    {
        "input_audio" => "[用户发送了音频]",
        "image_url" => "[用户发送了图片]",
        "video_url" => "[用户发送了视频]",
        _ => "[用户发送了附带内容]"
    };

    static string ContentPartsToFallbackText(List<ContentPart> parts, string model)
    {
        var sb = new StringBuilder();
        foreach (var part in parts)
        {
            if (part.Type == "text" && part.Data.TryGetValue("text", out var t))
            {
                sb.Append(t?.ToString() ?? "");
            }
            else if (!ModelCapabilities.Supports(model, part.Type))
            {
                sb.Append(ContentPartToPlaceholder(part));
            }
        }
        return sb.ToString().Trim();
    }

    static bool AllPartsSupported(List<ContentPart> parts, string model)
    {
        foreach (var p in parts)
            if (!ModelCapabilities.Supports(model, p.Type))
                return false;
        return true;
    }

    public List<object> ToApiMessages(string model = "deepseek-v4-pro")
    {
        var list = new List<object>(_messages.Count + 1);
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
            else if (m.Role == "user" && m.ContentParts is { Count: > 0 } && AllPartsSupported(m.ContentParts, model))
            {
                var parts = m.ContentParts.Select(p =>
                {
                    if (p.Type is "input_audio" or "image_url" or "video_url")
                        return (object)new Dictionary<string, object?> { ["type"] = p.Type, [p.Type] = p.Data };
                    var part = new Dictionary<string, object?> { ["type"] = p.Type };
                    foreach (var kv in p.Data)
                        part[kv.Key] = kv.Value;
                    return (object)part;
                }).ToList();
                list.Add(new { role = "user", content = parts });
            }
            else if (m.Role == "user" && m.ContentParts is { Count: > 0 })
            {
                list.Add(new { role = "user", content = ContentPartsToFallbackText(m.ContentParts, model) });
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
        var totalChars = 0;
        foreach (var m in _messages)
        {
            totalChars += m.Role.Length + 2;
            if (m.ContentParts is { Count: > 0 })
                totalChars += ContentPartsToFallbackText(m.ContentParts, "text").Length;
            else
                totalChars += m.Content?.Length ?? 0;
            totalChars += (m.ReasoningContent?.Length ?? 0) + 1;
        }
        return (int)(totalChars * 0.65);
    }

    public async Task CompressAsync(ChatClient flash, string memoryPrompt, CancellationToken ct)
    {
        var text = string.Join("\n", _messages.TakeLast(30).Select(m =>
        {
            if (m.ContentParts is { Count: > 0 })
                return $"{m.Role}: {ContentPartsToFallbackText(m.ContentParts, "text")}";
            return $"{m.Role}: {m.Content ?? (m.ToolCalls != null ? "[工具调用: " + string.Join(",", m.ToolCalls.Select(tc => tc.Function.Name)) + "]" : "(空)")}";
        }));

        var summary = await CompressOneShotAsync(flash, text, ct);
        var last3 = _messages.TakeLast(6).ToList();
        _messages.Clear();

        var compressedPrompt = _systemPrompt;
        if (!string.IsNullOrEmpty(memoryPrompt)) compressedPrompt += "\n" + memoryPrompt;
        compressedPrompt += "\n[对话摘要]\n" + (summary ?? "(无)") + "\n";

        foreach (var m in last3)
            _messages.Add(m);

        _systemPrompt = compressedPrompt;
    }

    async Task<string?> CompressOneShotAsync(ChatClient flash, string text, CancellationToken ct)
    {
        var msgs = new List<object>
        {
            new { role = "user", content = "请将以下对话提炼为要点，只包含: 用户目标、已完成操作、当前状态、关键事实。\n\n" + text }
        };
        try
        {
            var resp = await flash.SendAndCollectAsync(msgs, null, null, null, ct);
            return resp.Content?.Trim();
        }
        catch { return null; }
    }
}
