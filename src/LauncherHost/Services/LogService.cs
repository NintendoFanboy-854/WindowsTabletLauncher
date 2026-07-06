using System.Runtime.CompilerServices;

namespace LauncherHost.Services;

public static class LogService
{
    private static readonly string LogDir;
    private static readonly string LogPath;
    private static readonly object _lock = new();

    static LogService()
    {
        LogDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "WindowsTabletLauncher", "logs");
        Directory.CreateDirectory(LogDir);
        LogPath = Path.Combine(LogDir, $"launcher_{DateTime.Now:yyyyMMdd_HHmmss}.log");
    }

    public static void Info(string message,
        [CallerFilePath] string? file = null,
        [CallerMemberName] string? member = null,
        [CallerLineNumber] int line = 0)
        => Write("INFO", message, file, member, line);

    public static void Warn(string message,
        [CallerFilePath] string? file = null,
        [CallerMemberName] string? member = null,
        [CallerLineNumber] int line = 0)
        => Write("WARN", message, file, member, line);

    public static void Error(string message,
        [CallerFilePath] string? file = null,
        [CallerMemberName] string? member = null,
        [CallerLineNumber] int line = 0)
        => Write("ERROR", message, file, member, line);

    public static void Error(Exception ex, string? context = null,
        [CallerFilePath] string? file = null,
        [CallerMemberName] string? member = null,
        [CallerLineNumber] int line = 0)
        => Write("ERROR", context != null ? $"{context}: {ex}" : ex.ToString(), file, member, line);

    private static void Write(string level, string message, string? file, string? member, int line)
    {
        var src = $"{Path.GetFileNameWithoutExtension(file)}.{member}:{line}";
        var entry = $"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} [{level}] [{src}] {message}{Environment.NewLine}";
        lock (_lock)
            File.AppendAllText(LogPath, entry);
    }
}
