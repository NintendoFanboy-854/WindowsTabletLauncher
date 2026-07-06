using Microsoft.UI.Composition;
using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Hosting;
using Microsoft.UI.Xaml.Media;
using Windows.UI;

namespace SharedUtils;

public class BasePluginOverlay
{
    Popup? _popup;
    protected FrameworkElement? Card { get; private set; }
    protected Grid? Scrim { get; private set; }

    public bool IsOpen => _popup?.IsOpen == true;

    public void Show(FrameworkElement source, string title, FrameworkElement body, Action<string>? log = null)
    {
        if (source.XamlRoot == null || IsOpen) return;

        var theme = source.ActualTheme;
        var root = source.XamlRoot.Content as FrameworkElement;
        double w = root?.ActualWidth > 0 ? root.ActualWidth : source.XamlRoot.Size.Width;
        double h = root?.ActualHeight > 0 ? root.ActualHeight : source.XamlRoot.Size.Height;

        var raw = source.XamlRoot.Size;
        log?.Invoke($"Overlay open '{title}': content={w:F0}x{h:F0}epx xamlRootSize={raw.Width:F0}x{raw.Height:F0} scale={source.XamlRoot.RasterizationScale:F2}");

        var primary = theme == ElementTheme.Light
            ? new SolidColorBrush(Color.FromArgb(0xFF, 0x1A, 0x1A, 0x1A))
            : new SolidColorBrush(Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF));
        var tint = theme == ElementTheme.Light
            ? Color.FromArgb(0xFF, 0xF3, 0xF3, 0xF3)
            : Color.FromArgb(0xFF, 0x2B, 0x2B, 0x2B);

        var scrim = new Grid
        {
            Width = w,
            Height = h,
            Background = new SolidColorBrush(Color.FromArgb(0x99, 0, 0, 0))
        };
        scrim.Tapped += (_, _) => Close();
        Scrim = scrim;

        var header = BuildHeader(title, primary);

        var outer = new StackPanel { Spacing = 16 };
        outer.Children.Add(header);
        outer.Children.Add(new ScrollViewer
        {
            Content = body,
            MaxHeight = Math.Max(200, h - 160),
            VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
            HorizontalScrollBarVisibility = ScrollBarVisibility.Auto
        });

        var card = new Border
        {
            MaxWidth = w - 80,
            MaxHeight = h - 80,
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center,
            CornerRadius = new CornerRadius(12),
            Padding = new Thickness(24),
            Background = new AcrylicBrush { TintColor = tint, TintOpacity = 0.85, FallbackColor = tint },
            Child = outer
        };
        card.Tapped += (_, e) => e.Handled = true;
        scrim.Children.Add(card);
        Card = card;

        _popup = new Popup { XamlRoot = source.XamlRoot, IsLightDismissEnabled = false, Child = scrim };
        _popup.IsOpen = true;

        var sv = ElementCompositionPreview.GetElementVisual(scrim);
        var comp = sv.Compositor;
        var fade = comp.CreateScalarKeyFrameAnimation();
        fade.InsertKeyFrame(0f, 0f);
        fade.InsertKeyFrame(1f, 1f);
        fade.Duration = TimeSpan.FromMilliseconds(180);
        sv.StartAnimation("Opacity", fade);

        card.Loaded += (_, _) =>
        {
            var cw = card.ActualWidth;
            var ch = card.ActualHeight;
            var overflow = cw > w + 0.5 || ch > h + 0.5;
            log?.Invoke($"Overlay laid out '{title}': card={cw:F0}x{ch:F0} window={w:F0}x{h:F0} overflow={overflow}");

            var cv = ElementCompositionPreview.GetElementVisual(card);
            cv.CenterPoint = new System.Numerics.Vector3(card.ActualSize.X / 2f, card.ActualSize.Y / 2f, 0f);
            cv.Scale = new System.Numerics.Vector3(0.94f, 0.94f, 1f);
            var s = comp.CreateVector3KeyFrameAnimation();
            s.InsertKeyFrame(1f, new System.Numerics.Vector3(1f, 1f, 1f));
            s.Duration = TimeSpan.FromMilliseconds(220);
            cv.StartAnimation("Scale", s);
        };

        OnOpened();
    }

    protected virtual FrameworkElement BuildHeader(string title, SolidColorBrush primary)
    {
        var back = new Button
        {
            Content = new FontIcon { Glyph = "\uE72B", FontSize = 16 },
            Background = new SolidColorBrush(Color.FromArgb(0, 0, 0, 0)),
            BorderThickness = new Thickness(0),
            Width = 40,
            Height = 40,
            VerticalAlignment = VerticalAlignment.Center
        };
        back.Click += (_, _) => Close();

        var header = new StackPanel { Orientation = Orientation.Horizontal };
        header.Children.Add(back);
        header.Children.Add(new TextBlock
        {
            Text = title,
            FontSize = 24,
            FontWeight = FontWeights.SemiBold,
            Foreground = primary,
            VerticalAlignment = VerticalAlignment.Center,
            Margin = new Thickness(8, 0, 0, 0)
        });
        return header;
    }

    protected virtual void OnOpened() { }

    public virtual void Close()
    {
        OnClosing();
        if (_popup != null)
        {
            _popup.IsOpen = false;
            _popup = null;
        }
        Scrim = null;
        Card = null;
    }

    protected virtual void OnClosing() { }
}
