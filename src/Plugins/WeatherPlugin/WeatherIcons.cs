using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Media.Imaging;

namespace WeatherPlugin;

/// <summary>
/// 天气图标：优先加载和风官方 SVG（qwd/Icons，按 icon 代码命名，部署在 Plugins\WeatherIcons\{light,dark}\，
/// 构建时把官方 currentColor 单色图标渲染为两套主题配色）。
/// 缺失或未知代码时回退到 Segoe UI Emoji 文本图标（官方文档明确天气代码会变化，必须容错）。
/// </summary>
public static class WeatherIcons
{
    static readonly string IconBaseDir = Path.Combine(
        Path.GetDirectoryName(Environment.ProcessPath) ?? ".", "Plugins", "WeatherIcons");

    static readonly Dictionary<string, SvgImageSource> SvgCache = new();

    public static bool TryGetSvgSource(string? code, ElementTheme theme, out SvgImageSource source)
    {
        source = null!;
        if (string.IsNullOrWhiteSpace(code)) return false;
        var key = $"{code.Trim()}:{theme}";
        if (SvgCache.TryGetValue(key, out var cached))
        {
            source = cached;
            return true;
        }
        try
        {
            var subdir = theme == ElementTheme.Light ? "light" : "dark";
            var path = Path.Combine(IconBaseDir, subdir, $"{code.Trim()}.svg");
            if (!File.Exists(path)) return false;
            source = new SvgImageSource(new Uri(path));
            SvgCache[key] = source;
            return true;
        }
        catch
        {
            return false;
        }
    }

    const string Sun = "\u2600";
    const string Cloud = "\u2601";
    const string PartlyCloudy = "\u26C5";
    const string Rain = "\uD83C\uDF27";
    const string Thunder = "\u26C8";
    const string Snow = "\uD83C\uDF28";
    const string Snowflake = "\u2744";
    const string Fog = "\uD83C\uDF2B";
    const string Thermometer = "\uD83C\uDF21";
    const string Warning = "\u26A0";

    /// <summary>emoji 回退映射（按 condition/icon 代码段）。</summary>
    public static string GetEmoji(string? code)
    {
        if (string.IsNullOrWhiteSpace(code) || !int.TryParse(code.Trim(), out var c))
            return Cloud;

        // 月相 801-808 → U+1F311..U+1F318
        if (c is >= 801 and <= 808)
            return new string(new[] { (char)0xD83C, (char)(0xDF11 + (c - 801)) });

        if (c >= 1000) return Warning;
        if (c == 100 || c == 150) return Sun;
        if (c == 101 || c == 151 || c == 104) return Cloud;
        if (c == 102 || c == 103 || c == 152 || c == 153) return PartlyCloudy;
        // 302-304 雷阵雨系；310-318 为暴雨/大暴雨系，350/351/399 为阵雨/暴雨/雨
        if (c is >= 300 and <= 318 or 350 or 351 or 399) return c is >= 302 and <= 304 ? Thunder : Rain;
        if (c is >= 400 and <= 410 or 456 or 457 or 499) return Snow;
        if (c is >= 500 and <= 515) return Fog;
        if (c == 900) return Thermometer;
        if (c == 901) return Snowflake;
        return Cloud;
    }

    /// <summary>创建图标控件：SVG 优先，emoji 回退。</summary>
    public static FrameworkElement CreateIcon(string? code, double size, ElementTheme theme = ElementTheme.Default)
    {
        if (TryGetSvgSource(code, theme, out var src))
        {
            return new Image
            {
                Source = src,
                Width = size,
                Height = size,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };
        }

        return new TextBlock
        {
            Text = GetEmoji(code),
            FontSize = size * 0.85,
            FontFamily = new FontFamily("Segoe UI Emoji"),
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center
        };
    }
}
