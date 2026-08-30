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
    private static readonly object _writeLock = new();
    private const int KeepLogFiles = 5;
    private const long MaxLogBytes = 5 * 1024 * 1024;
    private const int MaxRequeueEntries = 2000;
    private static long _bytesSinceRotate;

    static LogService()
    {
        LogDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "WindowsTabletLauncher", "logs");
        Directory.CreateDirectory(LogDir);
        LogPath = Path.Combine(LogDir, $"launcher_{DateTime.Now:yyyyMMdd_HHmmss}.log");
        CleanupOldLogs();
        _flushTimer = new Timer(_ => Flush(), null, TimeSpan.FromMilliseconds(500), TimeSpan.FromMilliseconds(500));
    }

    private static void CleanupOldLogs()
    {
        try
        {
            var files = new DirectoryInfo(LogDir)
                .GetFiles("launcher_*.log*")
                .OrderByDescending(f => f.CreationTimeUtc)
                .ToList();
            for (int i = KeepLogFiles; i < files.Count; i++)
            {
                try { files[i].Delete(); } catch { }
            }
        }
        catch { }
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
        if (_queue.IsEmpty) return;
        var sb = new StringBuilder();
        var drained = new List<string>();
        while (_queue.TryDequeue(out var entry))
        {
            sb.Append(entry);
            drained.Add(entry);
        }

        if (sb.Length == 0) return;

        try
        {
            lock (_writeLock)
            {
                File.AppendAllText(LogPath, sb.ToString());
                _bytesSinceRotate += sb.Length;
                if (_bytesSinceRotate >= MaxLogBytes) RotateLocked();
            }
        }
        catch
        {
            Requeue(drained);
        }
    }

    private static void Requeue(List<string> drained)
    {
        if (drained.Count == 0) return;
        var take = Math.Min(drained.Count, MaxRequeueEntries);
        var slice = drained.GetRange(drained.Count - take, take);
        for (int i = slice.Count - 1; i >= 0; i--)
            _queue.Enqueue(slice[i]);
    }

    private static void RotateLocked()
    {
        try
        {
            var rotated = LogPath + ".old";
            if (File.Exists(rotated))
            {
                try { File.Delete(rotated); } catch { }
            }
            File.Move(LogPath, rotated);
            _bytesSinceRotate = 0;
            LogService.Info("Log rotated due to size limit");
        }
        catch (Exception ex)
        {
            _bytesSinceRotate = 0;
            try { System.Diagnostics.Debug.WriteLine(ex); } catch { }
        }
    }

    public static void FlushNow() => Flush();
}
