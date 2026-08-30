using Microsoft.UI.Composition;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Hosting;
using Microsoft.UI.Xaml.Media;

namespace SharedUtils;

/// <summary>
/// Fluent 2 磁贴：8px 圆角 + 1px 描边 + 150ms hover 过渡层。
/// 统一替代各插件手写的 root Border + hoverLayer + PointerEntered/Exited 样板。
/// </summary>
public sealed class WidgetTile : Grid
{
    public Border Root { get; }
    readonly Border _hover;

    WidgetTile(FrameworkElement content, string? automationName)
    {
        _hover = new Border
        {
            CornerRadius = new CornerRadius(Fluent.RadiusCard),
            Background = Fluent.SubtleHover(ElementTheme.Dark),
            Opacity = 0,
            IsHitTestVisible = false
        };

        var inner = new Grid();
        inner.Children.Add(content);
        inner.Children.Add(_hover);

        Root = new Border
        {
            CornerRadius = new CornerRadius(Fluent.RadiusCard),
            BorderThickness = new Thickness(1),
            BorderBrush = Fluent.TileStroke(ElementTheme.Dark),
            Background = Fluent.TileBackground(ElementTheme.Dark),
            Child = inner
        };

        Children.Add(Root);

        if (!string.IsNullOrWhiteSpace(automationName))
            Microsoft.UI.Xaml.Automation.AutomationProperties.SetName(this, automationName);

        PointerEntered += (_, _) => AnimateHover(1, Fluent.AnimationsEnabled ? 150 : 0);
        PointerExited += (_, _) => AnimateHover(0, Fluent.AnimationsEnabled ? 150 : 0);
    }

    public static WidgetTile Create(FrameworkElement content, string? automationName = null)
        => new(content, automationName);

    /// <summary>注册点按动作（占用事件，避免冒泡到宿主容器）。</summary>
    public WidgetTile Tap(Action action)
    {
        Tapped += (_, e) => { e.Handled = true; action(); };
        return this;
    }

    /// <summary>主题刷新：磁贴底色/描边/hover 层统一走令牌；background 传宿主画刷可覆盖默认。</summary>
    public void ApplyTheme(ElementTheme theme, Brush? background = null)
    {
        Root.Background = background ?? Fluent.TileBackground(theme);
        Root.BorderBrush = Fluent.TileStroke(theme);
        _hover.Background = Fluent.SubtleHover(theme);
    }

    void AnimateHover(double to, int ms)
    {
        var visual = ElementCompositionPreview.GetElementVisual(_hover);
        if (!Fluent.AnimationsEnabled || ms <= 0)
        {
            visual.Opacity = (float)to;
            return;
        }
        var comp = visual.Compositor;
        var anim = comp.CreateScalarKeyFrameAnimation();
        anim.InsertKeyFrame(1f, (float)to, comp.CreateCubicBezierEasingFunction(
            new System.Numerics.Vector2(0.1f, 0.9f), new System.Numerics.Vector2(0.2f, 1f)));
        anim.Duration = TimeSpan.FromMilliseconds(ms);
        visual.StartAnimation("Opacity", anim);
    }
}

/// <summary>Composition 小工具：淡入/淡出、缩放。</summary>
public static class Comp
{
    static CompositionEasingFunction Ease(Compositor comp) =>
        comp.CreateCubicBezierEasingFunction(
            new System.Numerics.Vector2(0.1f, 0.9f), new System.Numerics.Vector2(0.2f, 1f));

    /// <summary>淡入/淡出到指定值；系统禁用动画时立即到位。</summary>
    public static void Fade(UIElement element, double to, int ms = 200)
    {
        var visual = ElementCompositionPreview.GetElementVisual(element);
        if (!Fluent.AnimationsEnabled || ms <= 0)
        {
            visual.Opacity = (float)to;
            return;
        }
        var comp = visual.Compositor;
        var anim = comp.CreateScalarKeyFrameAnimation();
        anim.InsertKeyFrame(1f, (float)to, Ease(comp));
        anim.Duration = TimeSpan.FromMilliseconds(ms);
        visual.StartAnimation("Opacity", anim);
    }

    /// <summary>缩放到指定倍数（中心点）。</summary>
    public static void Scale(UIElement element, float to, int ms = 220)
    {
        var visual = ElementCompositionPreview.GetElementVisual(element);
        var size = visual.Size;
        visual.CenterPoint = new System.Numerics.Vector3(size.X / 2f, size.Y / 2f, 0f);
        if (!Fluent.AnimationsEnabled || ms <= 0)
        {
            visual.Scale = new System.Numerics.Vector3(to, to, 1f);
            return;
        }
        var comp = visual.Compositor;
        var anim = comp.CreateVector3KeyFrameAnimation();
        anim.InsertKeyFrame(1f, new System.Numerics.Vector3(to, to, 1f), Ease(comp));
        anim.Duration = TimeSpan.FromMilliseconds(ms);
        visual.StartAnimation("Scale", anim);
    }
}
