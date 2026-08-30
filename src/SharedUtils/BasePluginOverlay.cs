using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Hosting;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;

namespace SharedUtils;

/// <summary>
/// Fluent 2 弹层骨架：
/// - Smoke 遮罩 + 8px 圆角实面卡片（材质规则：瞬态弹层用实面+描边，不用 Acrylic 大面积铺）
/// - 头部：44×44 返回钮 + Subtitle(20) 左对齐标题
/// - 进场 fade 180ms + scale 0.94→1 (220ms)；退场 fade/scale 150ms；尊重系统"减少动画"
/// - Esc 关闭、关闭后焦点归还发起者
/// </summary>
public class BasePluginOverlay
{
    Popup? _popup;
    FrameworkElement? _source;
    bool _closing;
    protected FrameworkElement? Card { get; private set; }
    protected Grid? Scrim { get; private set; }

    public bool IsOpen => _popup?.IsOpen == true;

    /// <summary>
    /// width：内容目标宽度（卡片整体不超过 w-80）。两列布局的复杂弹层可传更大值（如 1100）。
    /// </summary>
    public void Show(FrameworkElement source, string title, FrameworkElement body, Action<string>? log = null, double width = 780)
    {
        if (source.XamlRoot == null || IsOpen || _closing) return;

        var theme = source.ActualTheme;
        var root = source.XamlRoot.Content as FrameworkElement;
        double w = root?.ActualWidth > 0 ? root.ActualWidth : source.XamlRoot.Size.Width;
        double h = root?.ActualHeight > 0 ? root.ActualHeight : source.XamlRoot.Size.Height;

        var raw = source.XamlRoot.Size;
        log?.Invoke($"Overlay open '{title}': content={w:F0}x{h:F0}epx xamlRootSize={raw.Width:F0}x{raw.Height:F0} scale={source.XamlRoot.RasterizationScale:F2}");

        // Fluent 2：横向滚动一律禁用（内容不应左右滚）。HSB=Disabled 使 ScrollViewer
        // 以有限宽度测量子内容，含 * 列的 Grid 也能正常撑满，无需再锚定固定宽度。
        _source = source;
        _closing = false;

        var scrim = new Grid
        {
            Width = w,
            Height = h,
            Background = new SolidColorBrush(Windows.UI.Color.FromArgb(0x99, 0, 0, 0))
        };
        scrim.Tapped += (_, _) => Close();
        Scrim = scrim;

        var header = BuildHeader(title, theme == ElementTheme.Light
            ? new SolidColorBrush(Windows.UI.Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A))
            : new SolidColorBrush(Windows.UI.Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF)));

        // 头部固定 + 内容区自适应滚动：Grid 两行（Auto/*），长内容只滚动 body，头部始终可见
        var outer = new Grid { RowSpacing = Fluent.SpaceL };
        outer.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        outer.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
        Grid.SetRow(header, 0);
        outer.Children.Add(header);
        var scroll = new ScrollViewer
        {
            Content = body,
            HorizontalAlignment = HorizontalAlignment.Stretch,
            HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled,
            HorizontalScrollMode = ScrollMode.Disabled,
            VerticalScrollBarVisibility = ScrollBarVisibility.Auto
        };
        Grid.SetRow(scroll, 1);
        outer.Children.Add(scroll);

        var card = new Border
        {
            // 固定宽度：星号列 Grid 的期望宽度会收缩到内容大小，必须钉死卡片宽度，
            // 内容区（含纵向滚动条）在此宽度内自适应，不再横向溢出
            Width = Math.Min(w - 80, width + Fluent.SpaceXL * 2),
            MaxHeight = h - 80,
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center,
            CornerRadius = new CornerRadius(Fluent.RadiusOverlay),
            Padding = new Thickness(Fluent.SpaceXL),
            Background = Fluent.OverlaySurface(theme),
            BorderThickness = new Thickness(1),
            BorderBrush = Fluent.CardStroke(theme),
            Child = outer
        };
        card.Tapped += (_, e) => e.Handled = true;
        scrim.Children.Add(card);
        Card = card;

        _popup = new Popup { XamlRoot = source.XamlRoot, IsLightDismissEnabled = false, Child = scrim };
        _popup.IsOpen = true;

        Comp.Fade(scrim, 1, 180);

        card.Loaded += (_, _) =>
        {
            var cw = card.ActualWidth;
            var ch = card.ActualHeight;
            var overflow = cw > w + 0.5 || ch > h + 0.5;
            log?.Invoke($"Overlay laid out '{title}': card={cw:F0}x{ch:F0} window={w:F0}x{h:F0} overflow={overflow}");

            if (Fluent.AnimationsEnabled)
            {
                var v = ElementCompositionPreview.GetElementVisual(card);
                var size = v.Size;
                v.CenterPoint = new System.Numerics.Vector3(size.X / 2f, size.Y / 2f, 0f);
                v.Scale = new System.Numerics.Vector3(0.94f, 0.94f, 1f);
                Comp.Scale(card, 1f, 220);
            }
        };

        OnOpened();
    }

    protected virtual FrameworkElement BuildHeader(string title, SolidColorBrush primary)
    {
        var back = Fluent.IconButton("\uE72B", "返回", Close, "返回");
        back.VerticalAlignment = VerticalAlignment.Center;

        var accel = new KeyboardAccelerator { Key = Windows.System.VirtualKey.Escape };
        accel.Invoked += (_, _) => Close();
        back.KeyboardAccelerators.Add(accel);

        var label = Fluent.Text(title, ElementTheme.Dark, "subtitle", primary);
        label.VerticalAlignment = VerticalAlignment.Center;

        var header = new StackPanel
        {
            Orientation = Orientation.Horizontal,
            Spacing = Fluent.SpaceM
        };
        header.Children.Add(back);
        header.Children.Add(label);
        return header;
    }

    protected virtual void OnOpened() { }

    public virtual void Close()
    {
        if (_popup == null || _closing) return;
        _closing = true;
        OnClosing();

        var popup = _popup;
        var scrim = Scrim;
        var card = Card;
        _popup = null;
        Scrim = null;
        Card = null;

        if (Fluent.AnimationsEnabled && scrim != null && card != null)
        {
            Comp.Fade(scrim, 0, 150);
            Comp.Scale(card, 0.96f, 150);
            _ = CloseDelayedAsync(popup);
        }
        else
        {
            popup.IsOpen = false;
        }

        _source?.Focus(FocusState.Programmatic);
        _source = null;
        _closing = false;
    }

    static async System.Threading.Tasks.Task CloseDelayedAsync(Popup popup)
    {
        await System.Threading.Tasks.Task.Delay(150);
        popup.IsOpen = false;
    }

    protected virtual void OnClosing() { }
}
