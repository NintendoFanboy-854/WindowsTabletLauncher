namespace PluginContract;

public sealed class PomodoroSession
{
    public string Date { get; set; } = "";
    public string Task { get; set; } = "";
    public int FocusMin { get; set; }
    public bool Completed { get; set; }
    public DateTime Timestamp { get; set; }
}
