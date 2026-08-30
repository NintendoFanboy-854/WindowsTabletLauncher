using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Windows.UI.Text;
using Windows.UI.ViewManagement;

namespace SharedUtils;

/// <summary>
/// Fluent 2 设计令牌与组件工厂（规范依据 windows-dev-docs 设计指南与 fluent2.microsoft.design）：
/// - 颜色：全部优先解析 WinUI 主题资源画刷（自动适配亮/暗/高对比主题与系统强调色）
/// - 字阶 type ramp：Caption 12/16 · Body 14/20 · BodyStrong 14/20 · BodyLarge 18/24 ·
///   Subtitle 20/28 · Title 28/36；数字两档：磁贴 48/56 · 弹层主数字 68/76
/// - 圆角：控件 4px · 卡片 8px · 弹层 8px
/// - 间距：4px 网格（4/8/12/16/24）
/// - 触控目标：所有可交互元素 ≥ 44×44 epx
/// </summary>
public static class Fluent
{
    // ---- 几何常量 ----

    public const double TouchTarget = 44;
    public const double RadiusControl = 4;
    public const double RadiusCard = 8;
    public const double RadiusOverlay = 8;
    public const double SpaceXS = 4;
    public const double SpaceS = 8;
    public const double SpaceM = 12;
    public const double SpaceL = 16;
    public const double SpaceXL = 24;

    // ---- 字阶常量（与 Ramp 一致）----

    public const double FontCaption = 12;
    public const double FontBody = 14;
    public const double FontBodyLarge = 18;
    public const double FontSubtitle = 20;
    public const double FontTitle = 28;
    public const double NumberTileSize = 48;
    public const double NumberHeroSize = 68;

    static readonly bool _animationsEnabled = new UISettings().AnimationsEnabled;
    public static bool AnimationsEnabled => _animationsEnabled;

    // ---- 令牌解析 ----

    static T? Res<T>(string key) where T : class =>
        Application.Current.Resources.TryGetValue(key, out var v) && v is T t ? t : null;

    /// <summary>按 key 解析主题资源画刷；缺失时返回 null（调用方决定回退）。</summary>
    public static Brush? Brush(string key) => Res<Brush>(key);

    static Brush Fallback(ElementTheme theme, byte lightA, byte lr, byte lg, byte lb, byte darkA, byte dr, byte dg, byte db) =>
        new SolidColorBrush(theme == ElementTheme.Light
            ? Windows.UI.Color.FromArgb(lightA, lr, lg, lb)
            : Windows.UI.Color.FromArgb(darkA, dr, dg, db));

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

    public static Brush TileBackground(ElementTheme t) =>
        Res<Brush>("Tile.BackgroundBrush") ?? Fallback(t, 0xFF, 0xF3, 0xF3, 0xF3, 0xFF, 0x2B, 0x2B, 0x2B);

    public static Brush TileStroke(ElementTheme t) =>
        Res<Brush>("Tile.StrokeBrush") ?? Fallback(t, 0x0F, 0, 0, 0, 0x1A, 255, 255, 255);

    public static Brush OverlaySurface(ElementTheme t) =>
        Res<Brush>("Overlay.SurfaceBrush") ?? Fallback(t, 0xFF, 0xF3, 0xF3, 0xF3, 0xFF, 0x2B, 0x2B, 0x2B);

    public static Brush Accent() =>
        Res<Brush>("AccentFillColorDefaultBrush") ??
        (Application.Current.Resources.TryGetValue("SystemAccentColor", out var ac) && ac is Windows.UI.Color c
            ? new SolidColorBrush(c)
            : new SolidColorBrush(Windows.UI.Color.FromArgb(0xFF, 0, 95, 184)));

    /// <summary>强调色之上的安全前景：按强调色亮度选择黑/白，保证 WCAG 对比度（用户气泡等）。</summary>
    public static Brush OnAccent(ElementTheme t)
    {
        if (Accent() is SolidColorBrush sc)
        {
            var lum = 0.2126 * sc.Color.R + 0.7152 * sc.Color.G + 0.0722 * sc.Color.B;
            return new SolidColorBrush(lum > 150
                ? Windows.UI.Color.FromArgb(0xFF, 0x10, 0x10, 0x10)
                : Windows.UI.Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF));
        }
        return Fallback(t, 0xFF, 255, 255, 255, 0xFF, 0, 0, 0);
    }

    public static Brush Attention(ElementTheme t) =>
        Res<Brush>("SystemFillColorAttentionBrush") ?? Fallback(t, 0xFF, 0x9D, 0x5D, 0x00, 0xFF, 0xFC, 0xE1, 0x00);

    public static Brush Success(ElementTheme t) =>
        Res<Brush>("SystemFillColorSuccessBrush") ?? Fallback(t, 0xFF, 0x0F, 0x7B, 0x31, 0xFF, 0x6F, 0xDE, 0x5C);

    public static Brush Caution(ElementTheme t) =>
        Res<Brush>("SystemFillColorCautionBrush") ?? Fallback(t, 0xFF, 0x9D, 0x5D, 0x00, 0xFF, 0xFC, 0xE1, 0x00);

    public static Brush Critical(ElementTheme t) =>
        Res<Brush>("SystemFillColorCriticalBrush") ?? Fallback(t, 0xFF, 0xC4, 0x2B, 0x1C, 0xFF, 0xFF, 0x99, 0xA4);

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
        "numberTile" => (48, 56, FontWeights.SemiBold),
        "numberHero" => (68, 76, FontWeights.SemiBold),
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

    /// <summary>节标题（BodyLargeStrong）。</summary>
    public static TextBlock SectionTitle(string? text, ElementTheme theme, Brush? brush = null) =>
        Text(text, theme, "bodyLargeStrong", brush);

    // ---- 通用卡片 ----

    public static Border Card(ElementTheme theme, Thickness? padding = null, double radius = RadiusCard)
    {
        return new Border
        {
            CornerRadius = new CornerRadius(radius),
            Background = CardBg(theme),
            BorderThickness = new Thickness(1),
            BorderBrush = CardStroke(theme),
            Padding = padding ?? new Thickness(SpaceL)
        };
    }

    /// <summary>信息瓦片：label + value 两行小卡（统计数字组）。</summary>
    public static Border StatTile(string label, string value, ElementTheme theme)
    {
        var stack = new StackPanel { Spacing = 2 };
        stack.Children.Add(Text(label, theme, "caption", TextSecondary(theme)));
        stack.Children.Add(Text(value, theme, "bodyStrong"));
        return new Border
        {
            CornerRadius = new CornerRadius(RadiusControl),
            Background = CardBgSecondary(theme),
            BorderThickness = new Thickness(1),
            BorderBrush = CardStroke(theme),
            Padding = new Thickness(SpaceM, SpaceS, SpaceM, SpaceS),
            Child = stack
        };
    }

    // ---- 交互控件工厂（触控目标一律 ≥44px）----

    static void Name(FrameworkElement fe, string? name, string? tooltip)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Microsoft.UI.Xaml.Automation.AutomationProperties.SetName(fe, name);
        if (!string.IsNullOrWhiteSpace(tooltip))
            ToolTipService.SetToolTip(fe, tooltip);
    }

    /// <summary>图标按钮：44×44、16px 字形、透明底、可选点击与无障碍名称/工具提示。</summary>
    public static Button IconButton(string glyph, string name, Action? click = null,
        string? tooltip = null, double fontSize = 16)
    {
        var b = new Button
        {
            MinWidth = TouchTarget,
            MinHeight = TouchTarget,
            Padding = new Thickness(SpaceXS),
            Background = new SolidColorBrush(Microsoft.UI.Colors.Transparent),
            BorderThickness = new Thickness(0),
            CornerRadius = new CornerRadius(RadiusControl),
            Content = new FontIcon { Glyph = glyph, FontSize = fontSize },
            HorizontalAlignment = HorizontalAlignment.Left,
            VerticalAlignment = VerticalAlignment.Center,
            UseSystemFocusVisuals = true
        };
        Name(b, name, tooltip ?? name);
        if (click != null) b.Click += (_, _) => click();
        return b;
    }

    /// <summary>文字按钮：MinHeight 44、MinWidth 120（CTA 尺寸）。accent=true 时使用系统强调色样式。</summary>
    public static Button Cta(string text, Action? click = null, bool accent = true,
        string? name = null, string? tooltip = null)
    {
        var b = new Button
        {
            Content = text,
            MinWidth = 120,
            MinHeight = TouchTarget,
            Padding = new Thickness(SpaceL, SpaceS, SpaceL, SpaceS),
            FontSize = 14,
            CornerRadius = new CornerRadius(RadiusControl),
            UseSystemFocusVisuals = true
        };
        if (accent) b.Style = Res<Style>("AccentButtonStyle");
        Name(b, name ?? text, tooltip);
        if (click != null) b.Click += (_, _) => click();
        return b;
    }

    /// <summary>空状态：可选图标 + 一行说明（用于空列表/全零图表）。</summary>
    public static FrameworkElement EmptyState(string text, ElementTheme theme, string? glyph = null)
    {
        var stack = new StackPanel
        {
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center,
            Spacing = SpaceS,
            Padding = new Thickness(SpaceL)
        };
        if (!string.IsNullOrEmpty(glyph))
            stack.Children.Add(new FontIcon
            {
                Glyph = glyph,
                FontSize = 24,
                Foreground = TextTertiary(theme),
                HorizontalAlignment = HorizontalAlignment.Center
            });
        var t = Text(text, theme, "caption", TextTertiary(theme));
        t.HorizontalAlignment = HorizontalAlignment.Center;
        t.TextAlignment = TextAlignment.Center;
        stack.Children.Add(t);
        return stack;
    }

    /// <summary>所有值都为 0/空时视为空数据。</summary>
    public static bool IsEmptyData(IReadOnlyList<(string label, double value)> data) =>
        data.Count == 0 || data.All(d => Math.Abs(d.value) < 0.0001);
}
