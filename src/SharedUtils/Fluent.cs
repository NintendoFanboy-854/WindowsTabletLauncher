using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Windows.UI;
using Windows.UI.Text;

namespace SharedUtils;

/// <summary>
/// Fluent 2 设计令牌（基于 windows-dev-docs 设计指南）：
/// - 颜色：优先取 WinUI 主题资源画刷（自动适配亮暗主题与系统强调色），失败时按主题回退
/// - 字阶 type ramp：Caption 12/16 · Body 14/20 · BodyStrong 14/20 · BodyLarge 18/24 · Subtitle 20/28 · Title 28/36
/// - 圆角：卡片/浮层 8px（OverlayCornerRadius），页内元素 4px（ControlCornerRadius）
/// - 间距：4px 网格（4/8/12/16/24）
/// </summary>
public static class Fluent
{
    static T? Res<T>(string key) where T : class =>
        Application.Current.Resources.TryGetValue(key, out var v) && v is T t ? t : null;

    static Brush Fallback(ElementTheme theme, byte lightA, byte lr, byte lg, byte lb, byte darkA, byte dr, byte dg, byte db) =>
        new SolidColorBrush(theme == ElementTheme.Light
            ? Color.FromArgb(lightA, lr, lg, lb)
            : Color.FromArgb(darkA, dr, dg, db));

    public static Brush TextPrimary(ElementTheme t) =>
        Res<Brush>("TextFillColorPrimaryBrush") ?? Fallback(t, 0xE4, 0, 0, 0, 0xFF, 255, 255, 255);

    public static Brush TextSecondary(ElementTheme t) =>
        Res<Brush>("TextFillColorSecondaryBrush") ?? Fallback(t, 0x9E, 0, 0, 0, 0xC5, 255, 255, 255);

    public static Brush TextTertiary(ElementTheme t) =>
        Res<Brush>("TextFillColorTertiaryBrush") ?? Fallback(t, 0x72, 0, 0, 0, 0x8A, 255, 255, 255);

    public static Brush CardBg(ElementTheme t) =>
        Res<Brush>("CardBackgroundFillColorDefaultBrush") ?? Fallback(t, 0xB3, 255, 255, 255, 0x52, 255, 255, 255);

    public static Brush CardBgSecondary(ElementTheme t) =>
        Res<Brush>("CardBackgroundFillColorSecondaryBrush") ?? Fallback(t, 0x80, 255, 255, 255, 0x25, 255, 255, 255);

    public static Brush CardStroke(ElementTheme t) =>
        Res<Brush>("CardStrokeColorDefaultBrush") ?? Fallback(t, 0x0F, 0, 0, 0, 0x1A, 255, 255, 255);

    public static Brush Divider(ElementTheme t) =>
        Res<Brush>("DividerStrokeColorDefaultBrush") ?? Fallback(t, 0x0F, 0, 0, 0, 0x0F, 255, 255, 255);

    public static Brush SubtleHover(ElementTheme t) =>
        Res<Brush>("SubtleFillColorSecondaryBrush") ?? Fallback(t, 0x0A, 0, 0, 0, 0x14, 255, 255, 255);

    public static Brush Accent() =>
        Res<Brush>("AccentFillColorDefaultBrush") ??
        (Application.Current.Resources.TryGetValue("SystemAccentColor", out var ac) && ac is Color c
            ? new SolidColorBrush(c)
            : new SolidColorBrush(Color.FromArgb(0xFF, 0, 95, 184)));

    public static Brush Attention(ElementTheme t) =>
        Res<Brush>("SystemFillColorAttentionBrush") ?? new SolidColorBrush(Color.FromArgb(0xFF, 0, 95, 184));

    public static Brush Success(ElementTheme t) =>
        Res<Brush>("SystemFillColorSuccessBrush") ?? Fallback(t, 0xFF, 15, 123, 31, 0xFF, 111, 222, 92);

    public static Brush Caution(ElementTheme t) =>
        Res<Brush>("SystemFillColorCautionBrush") ?? Fallback(t, 0xFF, 157, 93, 0, 0xFF, 252, 225, 0);

    public static Brush Critical(ElementTheme t) =>
        Res<Brush>("SystemFillColorCriticalBrush") ?? Fallback(t, 0xFF, 196, 43, 28, 0xFF, 255, 153, 164);

    // ---- 字阶 ----

    static (double Size, double LineHeight, FontWeight Weight) Ramp(string tier) => tier switch
    {
        "caption" => (12, 16, FontWeights.Normal),
        "body" => (14, 20, FontWeights.Normal),
        "bodyStrong" => (14, 20, FontWeights.SemiBold),
        "bodyLarge" => (18, 24, FontWeights.Normal),
        "bodyLargeStrong" => (18, 24, FontWeights.SemiBold),
        "subtitle" => (20, 28, FontWeights.SemiBold),
        "title" => (28, 36, FontWeights.SemiBold),
        "display" => (68, 92, FontWeights.SemiBold),
        _ => (14, 20, FontWeights.Normal)
    };

    public static TextBlock Text(string? text, ElementTheme theme, string tier = "body", Brush? brush = null,
        TextWrapping wrap = TextWrapping.NoWrap)
    {
        var (size, lineHeight, weight) = Ramp(tier);
        return new TextBlock
        {
            Text = text ?? "",
            FontSize = size,
            LineHeight = lineHeight,
            FontWeight = weight,
            Foreground = brush ?? TextPrimary(theme),
            TextWrapping = wrap,
            TextTrimming = wrap == TextWrapping.NoWrap ? TextTrimming.CharacterEllipsis : TextTrimming.None
        };
    }

    // ---- 通用卡片 ----

    public static Border Card(ElementTheme theme, Thickness? padding = null, double radius = 8)
    {
        return new Border
        {
            CornerRadius = new CornerRadius(radius),
            Background = CardBg(theme),
            BorderThickness = new Thickness(1),
            BorderBrush = CardStroke(theme),
            Padding = padding ?? new Thickness(16)
        };
    }
}
