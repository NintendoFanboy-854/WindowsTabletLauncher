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
    bool IsError = false,
    bool Cancelled = false,
    bool StreamError = false,
    string? FinishReason = null);

public sealed class ChatClient : IDisposable
{
    readonly HttpClient _http;
    readonly ProviderClientConfig _cfg;
    static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    static readonly HttpClient SharedTranscribeHttp = new()
    {
        Timeout = TimeSpan.FromMinutes(2)
    };

    public ProviderClientConfig Config => _cfg;
    public string Provider => _cfg.ProviderName;

    public ChatClient(ProviderClientConfig config)
    {
        _cfg = config;
        _http = new HttpClient { Timeout = TimeSpan.FromMinutes(5) };
        if (config.AuthHeaderName == "api-key")
        {
            _http.DefaultRequestHeaders.Add("api-key", config.ApiKey);
        }
        else
        {
            _http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", config.ApiKey);
        }
    }

    public void Dispose() => _http.Dispose();

    public async Task<AgentResponse> SendAndCollectAsync(
        List<object> messages,
        List<ToolDef>? tools,
        Action<string>? onThinking,
        Action<string>? onContent,
        CancellationToken ct)
    {
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

        LogService.Info($"[AgentReq] model={_cfg.Model} thinking={_cfg.Thinking} tools={tools?.Count ?? 0} msgs={messages.Count} last=({lastRole}) {lastPreview}");

        var url = $"{_cfg.BaseUrl.TrimEnd('/')}/chat/completions";
        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        };
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("text/event-stream"));

        bool cancelled = false;
        bool streamError = false;
        string? finishReason = null;

        using var response = await _http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            LogService.Error($"[AgentErr] HTTP {(int)response.StatusCode}: {errorBody}");
            LogService.Info($"[AgentReqBody] {body}");
            response.EnsureSuccessStatusCode();
        }

        using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream);

        LogService.Info("[SSE] read started, waiting for chunks...");
        var contentBuilder = new StringBuilder();
        var reasoningBuilder = new StringBuilder();
        var toolCallAccum = new Dictionary<int, (string Id, string Name, StringBuilder Args)>();
        bool firstChunk = true;

        while (true)
        {
            string? line;
            try { line = await reader.ReadLineAsync(ct); }
            catch (OperationCanceledException)
            {
                LogService.Info("[SSE] cancelled");
                cancelled = true;
                break;
            }
            catch (Exception ex)
            {
                LogService.Warn($"[SSE] stream interrupted: {ex.GetType().Name}: {ex.Message}");
                streamError = true;
                break;
            }
            if (line == null) { LogService.Info("[SSE] connection closed"); break; }
            if (line == "") continue;
            if (!line.StartsWith("data:")) continue;
            var json = line.Length > 5 ? line[5..].TrimStart() : "";
            if (json.Length == 0) continue;
            if (json == "[DONE]") { LogService.Info("[SSE] DONE"); break; }

            if (firstChunk)
            {
                LogService.Info("[SSE] first chunk received");
                firstChunk = false;
            }

            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                if (root.ValueKind != JsonValueKind.Object) continue;
                if (!root.TryGetProperty("choices", out var choices) || choices.ValueKind != JsonValueKind.Array) continue;
                if (choices.GetArrayLength() == 0) continue;

                var choice = choices[0];

                // 先处理本 chunk 的 delta 增量（部分端点把最后一段 content 与 finish_reason 放在同一 chunk）
                if (choice.TryGetProperty("delta", out var delta) && delta.ValueKind == JsonValueKind.Object)
                {
                    if (delta.TryGetProperty("reasoning_content", out var rc) && rc.ValueKind == JsonValueKind.String)
                    {
                        var t = rc.GetString() ?? "";
                        reasoningBuilder.Append(t);
                        onThinking?.Invoke(t);
                    }
                    if (delta.TryGetProperty("content", out var cnt) && cnt.ValueKind == JsonValueKind.String)
                    {
                        var t = cnt.GetString() ?? "";
                        contentBuilder.Append(t);
                        onContent?.Invoke(t);
                    }
                    // 部分端点在每个 delta 中都带 "tool_calls": null，必须先校验 ValueKind
                    if (delta.TryGetProperty("tool_calls", out var tcs) && tcs.ValueKind == JsonValueKind.Array)
                        ProcessToolCallDeltas(tcs, toolCallAccum);
                }

                if (choice.TryGetProperty("finish_reason", out var fr) && fr.ValueKind == JsonValueKind.String)
                {
                    finishReason = fr.GetString();
                    LogService.Info($"[SSE] finish_reason={finishReason}");
                    if (finishReason == "stop" || finishReason == "tool_calls")
                        break;
                    if (finishReason == "length")
                    {
                        LogService.Warn("[SSE] finish_reason=length (response truncated by token limit)");
                        break;
                    }
                    // 其它 finish_reason（content_filter 等）继续读到流结束
                }
            }
            catch (Exception ex) when (ex is JsonException or InvalidOperationException)
            {
                LogService.Warn($"[SSE] bad chunk skipped: {ex.Message}");
            }
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
            (toolCalls is { Count: > 0 } ? " [" + string.Join(",", toolCalls.Select(tc => tc.Name)) + "]" : "") +
            $" cancelled={cancelled} streamError={streamError} finish={finishReason ?? "none"}");

        return new AgentResponse(
            content.Length > 0 ? content : null,
            reasoning,
            toolCalls,
            Cancelled: cancelled,
            StreamError: streamError,
            FinishReason: finishReason);
    }

    static void ProcessToolCallDeltas(JsonElement tcs,
        Dictionary<int, (string Id, string Name, StringBuilder Args)> toolCallAccum)
    {
        var fallbackIdx = toolCallAccum.Count > 0 ? toolCallAccum.Keys.Max() + 1 : 0;
        foreach (var tc in tcs.EnumerateArray())
        {
            var idx = tc.TryGetProperty("index", out var idxEl) && idxEl.ValueKind == JsonValueKind.Number
                ? idxEl.GetInt32()
                : fallbackIdx++;
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

    string BuildBody(List<object> messages, List<ToolDef>? tools, bool stream)
    {
        var body = new Dictionary<string, object>
        {
            ["model"] = _cfg.Model,
            ["messages"] = messages,
            ["stream"] = stream,
        };

        if (_cfg.Thinking == "none")
        {
            body["temperature"] = 0.1;
            body["thinking"] = new { type = "disabled" };
        }
        else
        {
            body["thinking"] = new { type = "enabled" };
            if (_cfg.SupportsThinkingEffort)
                body["reasoning_effort"] = _cfg.Thinking;
        }

        if (tools is { Count: > 0 })
        {
            var toolList = new List<object>();
            foreach (var t in tools)
            {
                object? schema;
                try { schema = GetCachedSchema(t.ParametersJsonSchema) ?? new { type = "object", properties = new { } }; }
                catch (Exception ex)
                {
                    LogService.Warn($"[BuildBody] invalid schema for tool '{t.Name}', using fallback: {ex.Message}");
                    schema = new { type = "object", properties = new { } };
                }
                toolList.Add(new
                {
                    type = "function",
                    function = new
                    {
                        name = t.Name,
                        description = t.Description,
                        parameters = schema
                    }
                });
            }
            body["tools"] = toolList;
        }

        return JsonSerializer.Serialize(body, JsonOpts);
    }

    static readonly System.Collections.Concurrent.ConcurrentDictionary<string, object?> SchemaCache = new();

    static object? GetCachedSchema(string json)
        => SchemaCache.GetOrAdd(json, static s => JsonSerializer.Deserialize<object>(s));

    public static async Task<string?> TranscribeAsync(string apiKey, byte[] wav, CancellationToken ct)
    {
        try
        {
            var base64 = Convert.ToBase64String(wav);
            var body = new Dictionary<string, object>
            {
                ["model"] = "mimo-v2.5-asr",
                ["messages"] = new[]
                {
                    new
                    {
                        role = "user",
                        content = new[]
                        {
                            new
                            {
                                type = "input_audio",
                                input_audio = new { data = $"data:audio/wav;base64,{base64}" }
                            }
                        }
                    }
                },
                ["asr_options"] = new { language = "auto" },
                ["stream"] = false
            };

            var json = JsonSerializer.Serialize(body, JsonOpts);
            var req = new HttpRequestMessage(HttpMethod.Post, "https://api.xiaomimimo.com/v1/chat/completions")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            req.Headers.Add("api-key", apiKey);

            var resp = await SharedTranscribeHttp.SendAsync(req, ct);
            resp.EnsureSuccessStatusCode();

            var respText = await resp.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(respText);
            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object ||
                !root.TryGetProperty("choices", out var choices) || choices.ValueKind != JsonValueKind.Array ||
                choices.GetArrayLength() == 0 ||
                !choices[0].TryGetProperty("message", out var msg) || msg.ValueKind != JsonValueKind.Object ||
                !msg.TryGetProperty("content", out var contentEl) || contentEl.ValueKind != JsonValueKind.String)
            {
                LogService.Warn("[ChatClient.Transcribe] ASR response missing choices/message/content");
                return null;
            }
            return contentEl.GetString()?.Trim();
        }
        catch (Exception ex)
        {
            LogService.Warn($"[ChatClient.Transcribe] ASR failed: {ex.Message}");
            return null;
        }
    }

    public static async Task<string?> TranscribeStreamAsync(string apiKey, byte[] wav, Action<string> onDelta, CancellationToken ct)
    {
        try
        {
            var base64 = Convert.ToBase64String(wav);
            var body = new Dictionary<string, object>
            {
                ["model"] = "mimo-v2.5-asr",
                ["messages"] = new[]
                {
                    new
                    {
                        role = "user",
                        content = new[]
                        {
                            new
                            {
                                type = "input_audio",
                                input_audio = new { data = $"data:audio/wav;base64,{base64}" }
                            }
                        }
                    }
                },
                ["asr_options"] = new { language = "auto" },
                ["stream"] = true
            };

            var json = JsonSerializer.Serialize(body, JsonOpts);
            var req = new HttpRequestMessage(HttpMethod.Post, "https://api.xiaomimimo.com/v1/chat/completions")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            req.Headers.Add("api-key", apiKey);
            req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("text/event-stream"));

            using var resp = await SharedTranscribeHttp.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
            resp.EnsureSuccessStatusCode();

            using var stream = await resp.Content.ReadAsStreamAsync(ct);
            using var reader = new StreamReader(stream);
            var fullText = new StringBuilder();
            bool interrupted = false;

            while (true)
            {
                string? line;
                try { line = await reader.ReadLineAsync(ct); }
                catch (OperationCanceledException) { break; }
                catch (Exception ex)
                {
                    LogService.Warn($"[ASR] stream interrupted: {ex.Message}");
                    interrupted = true;
                    break;
                }
                if (line == null) break;
                if (line == "" || !line.StartsWith("data:")) continue;
                var data = line.Length > 5 ? line[5..].TrimStart() : "";
                if (data.Length == 0) continue;
                if (data == "[DONE]") break;

                try
                {
                    using var doc = JsonDocument.Parse(data);
                    var root = doc.RootElement;
                    if (root.ValueKind != JsonValueKind.Object) continue;
                    if (!root.TryGetProperty("choices", out var choices) || choices.ValueKind != JsonValueKind.Array) continue;
                    if (choices.GetArrayLength() == 0) continue;
                    if (!choices[0].TryGetProperty("delta", out var delta) || delta.ValueKind != JsonValueKind.Object) continue;
                    if (delta.TryGetProperty("content", out var c) && c.ValueKind == JsonValueKind.String)
                    {
                        var text = c.GetString() ?? "";
                        fullText.Append(text);
                        onDelta(text);
                    }
                }
                catch (Exception ex) when (ex is JsonException or InvalidOperationException) { }
            }

            var result = fullText.ToString().Trim();
            if (interrupted && result.Length == 0) return null;
            return result;
        }
        catch (Exception ex)
        {
            LogService.Warn($"[ChatClient.TranscribeStream] ASR failed: {ex.Message}");
            return null;
        }
    }
}
