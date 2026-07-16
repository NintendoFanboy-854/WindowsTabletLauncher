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

public sealed class ChatClient : IDisposable
{
    readonly HttpClient _http;
    readonly ProviderClientConfig _cfg;
    static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
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
        var hasThinking = _cfg.Thinking != "none";
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

        using var response = await _http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
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
            catch (OperationCanceledException) { LogService.Info("[SSE] cancelled"); break; }
            catch { break; }
            if (line == null) { LogService.Info("[SSE] connection closed"); break; }
            if (line == "") continue;
            if (!line.StartsWith("data: ")) continue;
            var json = line[6..];
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

            using var http = new HttpClient { Timeout = TimeSpan.FromMinutes(2) };
            http.DefaultRequestHeaders.Add("api-key", apiKey);

            var json = JsonSerializer.Serialize(body, JsonOpts);
            var resp = await http.PostAsync(
                "https://api.xiaomimimo.com/v1/chat/completions",
                new StringContent(json, Encoding.UTF8, "application/json"),
                ct);
            resp.EnsureSuccessStatusCode();

            var respText = await resp.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(respText);
            var content = doc.RootElement.GetProperty("choices")[0]
                .GetProperty("message").GetProperty("content").GetString();
            return content?.Trim();
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

                using var http = new HttpClient { Timeout = TimeSpan.FromMinutes(2) };
                http.DefaultRequestHeaders.Add("api-key", apiKey);

                var json = JsonSerializer.Serialize(body, JsonOpts);
                var req = new HttpRequestMessage(HttpMethod.Post, "https://api.xiaomimimo.com/v1/chat/completions")
                {
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                };
                req.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("text/event-stream"));

                using var resp = await http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
                resp.EnsureSuccessStatusCode();

                using var stream = await resp.Content.ReadAsStreamAsync(ct);
                using var reader = new StreamReader(stream);
                var fullText = new StringBuilder();

                while (true)
                {
                    string? line;
                    try { line = await reader.ReadLineAsync(ct); }
                    catch (OperationCanceledException) { break; }
                    catch { break; }
                    if (line == null) break;
                    if (line == "" || !line.StartsWith("data: ")) continue;
                    var data = line[6..];
                    if (data == "[DONE]") break;

                    try
                    {
                        using var doc = JsonDocument.Parse(data);
                        var choices = doc.RootElement.GetProperty("choices");
                        if (choices.GetArrayLength() == 0) continue;
                        var delta = choices[0].GetProperty("delta");
                        if (delta.TryGetProperty("content", out var c) && c.ValueKind == JsonValueKind.String)
                        {
                            var text = c.GetString() ?? "";
                            fullText.Append(text);
                            onDelta(text);
                        }
                    }
                    catch { }
                }
                return fullText.ToString().Trim();
            }
            catch (Exception ex)
            {
                LogService.Warn($"[ChatClient.TranscribeStream] ASR failed: {ex.Message}");
                return null;
            }
        }
    }
