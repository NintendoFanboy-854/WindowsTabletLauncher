using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Text;

namespace LauncherHost.Services;

public static class LogService
{
    private static readonly string LogDir;
    private static readonly string LogPath;
    private static readonly ConcurrentQueue<string> _queue = new();
    private static readonly Timer _flushTimer;

    static LogService()
    {
        LogDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "WindowsTabletLauncher", "logs");
        Directory.CreateDirectory(LogDir);
        LogPath = Path.Combine(LogDir, $"launcher_{DateTime.Now:yyyyMMdd_HHmmss}.log");
        _flushTimer = new Timer(_ => Flush(), null, TimeSpan.FromMilliseconds(500), TimeSpan.FromMilliseconds(500));
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
        _queue.Enqueue(entry);
    }

    private static void Flush()
    {
        var sb = new StringBuilder();
        while (_queue.TryDequeue(out var entry))
            sb.Append(entry);

        if (sb.Length == 0) return;

        try
        {
            File.AppendAllTextAsync(LogPath, sb.ToString());
        }
        catch { }
    }
}
