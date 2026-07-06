namespace WeatherPlugin;

internal static class WeatherIcons
{
    const string Sun = "\uE706";
    const string Cloud = "\uE753";

    public static string GetGlyph(string weather)
    {
        if (string.IsNullOrEmpty(weather)) return Cloud;
        if (weather.Contains('晴')) return Sun;
        return Cloud;
    }
}
