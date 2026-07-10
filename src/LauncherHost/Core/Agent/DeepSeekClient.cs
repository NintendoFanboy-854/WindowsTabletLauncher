using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using LauncherHost.Services;

namespace LauncherHost.Core.Agent;

public record ToolDef(string Name, string Description, string ParametersJsonSchema);

public record AgentToolCall(string Id, string Name, string Arguments);

public record AgentResponse(
    string? Content,
    string? ThinkingContent,
    List<AgentToolCall>? ToolCalls,
    bool IsError = false);

public sealed class DeepSeekClient : IDisposable
{
    readonly HttpClient _http;
    readonly string _model;
    readonly string _thinking;
    static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public DeepSeekClient(string apiKey, string model = "deepseek-v4-pro", string thinking = "none")
    {
        _model = model;
        _thinking = thinking;
        _http = new HttpClient { Timeout = TimeSpan.FromMinutes(5) };
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", apiKey);
    }

    public void Dispose() => _http.Dispose();

    public async Task<AgentResponse> SendAndCollectAsync(
        List<object> messages,
        List<ToolDef>? tools,
        Action<string>? onThinking,
        Action<string>? onContent,
        CancellationToken ct)
    {
        var hasThinking = _thinking != "none";
        var body = BuildBody(messages, tools, stream: true);

        var lastMsg = messages.Count > 0 ? messages[^1] : null;
        var lastRole = "none";
        var lastPreview = "";
        if (lastMsg is Dictionary<string, object?> dict)
        {
            lastRole = dict.TryGetValue("role", out var r) ? r?.ToString() ?? "" : "";
            var cnt = dict.TryGetValue("content", out var c) ? c : null;
            lastPreview = cnt?.ToString()?.Trim() ?? "";
        }
        else if (lastMsg != null)
        {
            var props = lastMsg.GetType().GetProperties();
            var roleProp = props.FirstOrDefault(p => p.Name == "role");
            var contProp = props.FirstOrDefault(p => p.Name == "content");
            lastRole = roleProp?.GetValue(lastMsg)?.ToString() ?? "";
            lastPreview = contProp?.GetValue(lastMsg)?.ToString()?.Trim() ?? "";
        }
        if (lastPreview.Length > 100) lastPreview = lastPreview[..100] + "...";

        LogService.Info($"[AgentReq] model={_model} thinking={_thinking} tools={tools?.Count ?? 0} msgs={messages.Count} last=({lastRole}) {lastPreview}");

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.deepseek.com/chat/completions")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        };
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("text/event-stream"));

        using var response = await _http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();

        using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream);

        var contentBuilder = new StringBuilder();
        var reasoningBuilder = new StringBuilder();
        var toolCallAccum = new Dictionary<int, (string Id, string Name, StringBuilder Args)>();

        while (true)
        {
            string? line;
            try { line = await reader.ReadLineAsync(ct); }
            catch (OperationCanceledException) { break; }
            catch { break; }
            if (line == null) break;
            if (line == "") continue;
            if (!line.StartsWith("data: ")) continue;
            var json = line[6..];
            if (json == "[DONE]") break;

            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                if (!root.TryGetProperty("choices", out var choices)) continue;
                if (choices.GetArrayLength() == 0) continue;

                var choice = choices[0];

                if (choice.TryGetProperty("finish_reason", out var fr) && fr.ValueKind == JsonValueKind.String)
                {
                    var reason = fr.GetString();
                    if (reason == "tool_calls" || reason == "stop")
                    {
                        if (choice.TryGetProperty("delta", out var delta) &&
                            delta.TryGetProperty("tool_calls", out var tcs))
                        {
                            foreach (var tc in tcs.EnumerateArray())
                            {
                                var idx = tc.GetProperty("index").GetInt32();
                                if (!toolCallAccum.TryGetValue(idx, out var existing))
                                    existing = ("", "", new StringBuilder());

                                if (tc.TryGetProperty("id", out var tid) && tid.ValueKind == JsonValueKind.String)
                                    existing.Id = tid.GetString()!;
                                if (tc.TryGetProperty("function", out var fn))
                                {
                                    if (fn.TryGetProperty("name", out var fnName) && fnName.ValueKind == JsonValueKind.String)
                                        existing.Name = fnName.GetString() ?? existing.Name;
                                    if (fn.TryGetProperty("arguments", out var fnArgs) && fnArgs.ValueKind == JsonValueKind.String)
                                        existing.Args.Append(fnArgs.GetString());
                                }
                                toolCallAccum[idx] = existing;
                            }
                        }
                    }
                    if (reason == "stop" || reason == "tool_calls")
                        break;
                    continue;
                }

                if (choice.TryGetProperty("delta", out var delta2))
                {
                    if (delta2.TryGetProperty("reasoning_content", out var rc) && rc.ValueKind == JsonValueKind.String)
                    {
                        var t = rc.GetString() ?? "";
                        reasoningBuilder.Append(t);
                        onThinking?.Invoke(t);
                    }
                    if (delta2.TryGetProperty("content", out var cnt) && cnt.ValueKind == JsonValueKind.String)
                    {
                        var t = cnt.GetString() ?? "";
                        contentBuilder.Append(t);
                        onContent?.Invoke(t);
                    }
                    if (delta2.TryGetProperty("tool_calls", out var tcs2))
                    {
                        foreach (var tc in tcs2.EnumerateArray())
                        {
                            var idx = tc.GetProperty("index").GetInt32();
                            if (!toolCallAccum.TryGetValue(idx, out var existing))
                                existing = ("", "", new StringBuilder());

                            if (tc.TryGetProperty("id", out var tid) && tid.ValueKind == JsonValueKind.String)
                                existing.Id = tid.GetString()!;
                            if (tc.TryGetProperty("function", out var fn))
                            {
                                if (fn.TryGetProperty("name", out var fnName) && fnName.ValueKind == JsonValueKind.String)
                                    existing.Name = fnName.GetString() ?? existing.Name;
                                if (fn.TryGetProperty("arguments", out var fnArgs) && fnArgs.ValueKind == JsonValueKind.String)
                                    existing.Args.Append(fnArgs.GetString());
                            }
                            toolCallAccum[idx] = existing;
                        }
                    }
                }
            }
            catch { }
        }

        var content = contentBuilder.ToString();
        var reasoning = reasoningBuilder.Length > 0 ? reasoningBuilder.ToString() : null;
        List<AgentToolCall>? toolCalls = null;
        if (toolCallAccum.Count > 0)
        {
            toolCalls = toolCallAccum.OrderBy(kv => kv.Key).Select(kv =>
                new AgentToolCall(kv.Value.Id, kv.Value.Name, kv.Value.Args.ToString())
            ).ToList();
        }

        LogService.Info($"[AgentResp] reasoning={reasoning?.Length ?? 0}chars content={content.Length}chars toolCalls={toolCalls?.Count ?? 0}" +
            (toolCalls is { Count: > 0 } ? " [" + string.Join(",", toolCalls.Select(tc => tc.Name)) + "]" : ""));

        return new AgentResponse(
            content.Length > 0 ? content : null,
            reasoning,
            toolCalls);
    }

    string BuildBody(List<object> messages, List<ToolDef>? tools, bool stream)
    {
        var body = new Dictionary<string, object>
        {
            ["model"] = _model,
            ["messages"] = messages,
            ["stream"] = stream,
        };

        if (_thinking == "none")
        {
            body["temperature"] = 0.1;
            body["thinking"] = new { type = "disabled" };
        }
        else
        {
            body["thinking"] = new { type = "enabled" };
            body["reasoning_effort"] = _thinking;
        }

        if (tools is { Count: > 0 })
        {
            body["tools"] = tools.Select(t => new
            {
                type = "function",
                function = new
                {
                    name = t.Name,
                    description = t.Description,
                    parameters = JsonSerializer.Deserialize<object>(t.ParametersJsonSchema)
                        ?? new { type = "object", properties = new { } }
                }
            }).ToList();
        }

        return JsonSerializer.Serialize(body, JsonOpts);
    }
}
