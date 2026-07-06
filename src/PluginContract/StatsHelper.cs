namespace PluginContract;

public static class StatsHelper
{
    public static string TodayKey() => DateTime.Today.ToString("yyyy-MM-dd");

    public static Dictionary<string, int> SlidingWindow(Dictionary<string, int> raw, int days)
    {
        var result = new Dictionary<string, int>();
        for (int i = days - 1; i >= 0; i--)
        {
            var key = DateTime.Today.AddDays(-i).ToString("yyyy-MM-dd");
            result[key] = raw.TryGetValue(key, out var v) ? v : 0;
        }
        return result;
    }

    public static void PruneOldEntries(Dictionary<string, int> raw, int maxDays)
    {
        foreach (var k in raw.Keys.Where(k =>
            DateTime.TryParse(k, out var d) && (DateTime.Today - d).TotalDays > maxDays).ToList())
            raw.Remove(k);
    }

    public static int[] HourlyBuckets(IEnumerable<(DateTime time, int value)> entries)
    {
        var buckets = new int[24];
        foreach (var (time, value) in entries)
            if (time.Hour >= 0 && time.Hour < 24)
                buckets[time.Hour] += value;
        return buckets;
    }
}
