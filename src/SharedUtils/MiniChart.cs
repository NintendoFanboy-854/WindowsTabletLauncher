using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using Windows.Foundation;
using Windows.UI;

namespace SharedUtils;

public static class MiniChart
{
    public static FrameworkElement Bars(IReadOnlyList<(string label, double value)> data, Brush bar, Brush text, double barAreaHeight = 120)
    {
        var root = new Grid();
        root.RowDefinitions.Add(new RowDefinition { Height = new GridLength(barAreaHeight) });
        root.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

        var bars = new Grid { VerticalAlignment = VerticalAlignment.Bottom, ColumnSpacing = 8 };
        var labels = new Grid { ColumnSpacing = 8, Margin = new Thickness(0, 4, 0, 0) };
        for (int i = 0; i < data.Count; i++)
        {
            bars.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            labels.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        }

        var max = data.Count == 0 ? 1 : Math.Max(1, data.Max(d => d.value));
        for (int i = 0; i < data.Count; i++)
        {
            var h = Math.Max(2, data[i].value / max * (barAreaHeight - 18));
            var col = new StackPanel { VerticalAlignment = VerticalAlignment.Bottom, Spacing = 2 };
            col.Children.Add(new TextBlock { Text = data[i].value.ToString("0.#"), FontSize = 11, Foreground = text, HorizontalAlignment = HorizontalAlignment.Center });
            col.Children.Add(new Border { Height = h, Background = bar, CornerRadius = new CornerRadius(4, 4, 0, 0) });
            Grid.SetColumn(col, i);
            bars.Children.Add(col);

            var lbl = new TextBlock { Text = data[i].label, FontSize = 11, Foreground = text, HorizontalAlignment = HorizontalAlignment.Center, TextTrimming = TextTrimming.CharacterEllipsis };
            Grid.SetColumn(lbl, i);
            labels.Children.Add(lbl);
        }

        Grid.SetRow(bars, 0);
        Grid.SetRow(labels, 1);
        root.Children.Add(bars);
        root.Children.Add(labels);
        return root;
    }

    public static FrameworkElement Line(IReadOnlyList<(string label, double value)> data, Brush stroke, Brush text, double height = 120, double stepX = 44)
    {
        var n = data.Count;
        var width = Math.Max(160, (n - 1) * stepX);
        var max = n == 0 ? 1 : Math.Max(1, data.Max(d => d.value));

        var canvas = new Canvas { Width = width, Height = height };
        var poly = new Polyline { Stroke = stroke, StrokeThickness = 2 };
        for (int i = 0; i < n; i++)
        {
            var x = i * stepX;
            var y = height - 18 - data[i].value / max * (height - 24);
            poly.Points.Add(new Point(x, y));
            var dot = new Ellipse { Width = 6, Height = 6, Fill = stroke };
            Canvas.SetLeft(dot, x - 3);
            Canvas.SetTop(dot, y - 3);
            canvas.Children.Add(dot);
            var lbl = new TextBlock { Text = data[i].label, FontSize = 10, Foreground = text };
            Canvas.SetLeft(lbl, x - stepX / 2);
            Canvas.SetTop(lbl, height - 16);
            canvas.Children.Add(lbl);
        }
        canvas.Children.Insert(0, poly);

        return new ScrollViewer
        {
            Content = canvas,
            HorizontalScrollBarVisibility = ScrollBarVisibility.Auto,
            VerticalScrollBarVisibility = ScrollBarVisibility.Disabled
        };
    }
}
