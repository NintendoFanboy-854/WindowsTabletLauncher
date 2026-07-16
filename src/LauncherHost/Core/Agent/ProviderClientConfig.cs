namespace LauncherHost.Core.Agent;

public record ProviderClientConfig(
    string ProviderName,
    string BaseUrl,
    string ApiKey,
    string Model,
    string Thinking,
    string AuthHeaderName,
    bool SupportsMultimodal,
    bool SupportsThinkingEffort);
