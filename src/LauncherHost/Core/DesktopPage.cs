using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;

namespace LauncherHost.Core;

public sealed class DesktopPage
{
    public Grid Root { get; }
    public Grid WidgetGrid { get; }
    public Canvas Overlay { get; }
    public GridLayoutManager Layout { get; }

    public DesktopPage()
    {
        WidgetGrid = new Grid
        {
            HorizontalAlignment = HorizontalAlignment.Left,
            VerticalAlignment = VerticalAlignment.Top
        };
        Overlay = new Canvas
        {
            HorizontalAlignment = HorizontalAlignment.Left,
            VerticalAlignment = VerticalAlignment.Top,
            Visibility = Visibility.Collapsed
        };
        Root = new Grid { Background = new Microsoft.UI.Xaml.Media.SolidColorBrush(Microsoft.UI.Colors.Transparent) };
        Root.Children.Add(WidgetGrid);
        Root.Children.Add(Overlay);
        Layout = new GridLayoutManager(WidgetGrid);
    }

    public bool IsEmpty => Layout.Containers.Count == 0;
}
