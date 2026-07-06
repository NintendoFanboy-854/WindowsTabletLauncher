namespace PluginContract;

public sealed class AgentTool
{
    public required string Name { get; init; }
    public required string Description { get; init; }

    // JSON Schema (object) describing the tool's parameters, e.g.
    // {"type":"object","properties":{"minutes":{"type":"integer"}},"required":["minutes"]}
    public string ParametersJsonSchema { get; init; } = """{"type":"object","properties":{}}""";
}

public interface IAgentCapability
{
    // The tools this capability exposes to the Agent/LLM.
    IReadOnlyList<AgentTool> GetTools();

    // Invoke a tool by name with JSON-encoded arguments.
    // Returns a JSON string with the structured result/data — the Agent/LLM
    // is responsible for turning it into a natural-language answer.
    Task<string> InvokeAsync(string tool, string argumentsJson);
}
