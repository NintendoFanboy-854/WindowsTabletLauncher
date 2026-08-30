using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using Windows.Foundation;
using Windows.UI;
using Windows.UI.Text;

namespace SharedUtils;

/// <summary>
/// 轻量图表（柱状/折线）。Fluent 2 规范：
/// - 标签 Caption 12px、Tertiary 色
/// - 数值仅标注最大值与最新值，避免逐点噪音
/// - 空数据/全零显示"暂无数据"空状态，不渲染无效图形
/// </summary>
public static class MiniChart
{
    public static FrameworkElement Bars(IReadOnlyList<(string label, double value)> data, Brush bar, Brush text, double barAreaHeight = 120)
    {
        if (Fluent.IsEmptyData(data))
            return Fluent.EmptyState("暂无数据", ElementTheme.Dark, "\uE946");

        var root = new Grid();
        root.RowDefinitions.Add(new RowDefinition { Height = new GridLength(barAreaHeight) });
        root.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

        var bars = new Grid { VerticalAlignment = VerticalAlignment.Bottom, ColumnSpacing = Fluent.SpaceS };
        var labels = new Grid { ColumnSpacing = Fluent.SpaceS, Margin = new Thickness(0, Fluent.SpaceXS, 0, 0) };

        int maxIdx = 0;
        for (int i = 1; i < data.Count; i++)
            if (data[i].value > data[maxIdx].value) maxIdx = i;

        for (int i = 0; i < data.Count; i++)
        {
            bars.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            labels.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        }

        var max = Math.Max(1, data.Max(d => d.value));
        for (int i = 0; i < data.Count; i++)
        {
            var h = Math.Max(4, data[i].value / max * (barAreaHeight - 18));
            var col = new StackPanel { VerticalAlignment = VerticalAlignment.Bottom, Spacing = 2 };
            if (i == maxIdx || i == data.Count - 1)
            {
                var v = new TextBlock
                {
                    Text = data[i].value.ToString("0.#"),
                    FontSize = 12, LineHeight = 16,
                    Foreground = text,
                    HorizontalAlignment = HorizontalAlignment.Center
                };
                col.Children.Add(v);
            }
            col.Children.Add(new Border { Height = h, Background = bar, CornerRadius = new CornerRadius(2, 2, 0, 0) });
            Grid.SetColumn(col, i);
            bars.Children.Add(col);

            var lbl = new TextBlock
            {
                Text = data[i].label,
                FontSize = 12, LineHeight = 16,
                Foreground = text,
                HorizontalAlignment = HorizontalAlignment.Center,
                TextTrimming = TextTrimming.CharacterEllipsis
            };
            Grid.SetColumn(lbl, i);
            labels.Children.Add(lbl);
        }

        // 基线
        var baselineRow = new RowDefinition { Height = GridLength.Auto };
        root.RowDefinitions.Insert(1, baselineRow);
        var baseline = new Border
        {
            Height = 1,
            Background = text,
            Opacity = 0.2,
            Margin = new Thickness(0, 0, 0, 0)
        };

        Grid.SetRow(bars, 0);
        Grid.SetRow(baseline, 1);
        Grid.SetRow(labels, 2);
        root.Children.Add(bars);
        root.Children.Add(baseline);
        root.Children.Add(labels);
        return root;
    }

    public static FrameworkElement Line(IReadOnlyList<(string label, double value)> data, Brush stroke, Brush text, double height = 120, double stepX = 44)
    {
        if (Fluent.IsEmptyData(data))
            return Fluent.EmptyState("暂无数据", ElementTheme.Dark, "\uE946");

        var n = data.Count;
        var width = Math.Max(160, (n - 1) * stepX);

        // y 向归一化：数据映射到 10%~90% 带内（平坦时居中），避免折线贴顶/贴底悬空
        var min = data.Min(d => d.value);
        var max = data.Max(d => d.value);
        bool flat = max - min < 0.0001;
        double Norm(double v) => flat ? 0.5 : 0.1 + 0.8 * (v - min) / (max - min);
        double Y(double v) => height - 18 - Norm(v) * (height - 24);

        var canvas = new Canvas { Width = width, Height = height };

        // 基线（常显）
        canvas.Children.Add(new Border
        {
            Background = text,
            Opacity = 0.35,
            Height = 1,
            Width = width
        });
        Canvas.SetLeft(canvas.Children[^1], 0);
        Canvas.SetTop(canvas.Children[^1], height - 18);

        var poly = new Polyline { Stroke = stroke, StrokeThickness = 2, StrokeLineJoin = PenLineJoin.Round };
        canvas.Children.Add(poly);
        for (int i = 0; i < n; i++)
        {
            var x = i * stepX;
            var y = Y(data[i].value);
            poly.Points.Add(new Point(x, y));
            var dot = new Ellipse { Width = 6, Height = 6, Fill = stroke };
            Canvas.SetLeft(dot, x - 3);
            Canvas.SetTop(dot, y - 3);
            canvas.Children.Add(dot);
            var lbl = new TextBlock
            {
                Text = data[i].label,
                FontSize = 12, LineHeight = 16,
                Foreground = text
            };
            Canvas.SetLeft(lbl, x - stepX / 2);
            Canvas.SetTop(lbl, height - 16);
            canvas.Children.Add(lbl);
        }

        // 最新值标签（最后一个点上方）
        var lastY = Y(data[^1].value);
        var lastLbl = new TextBlock
        {
            Text = data[^1].value.ToString("0.#"),
            FontSize = 12, LineHeight = 16,
            Foreground = text,
            HorizontalAlignment = HorizontalAlignment.Center
        };
        var lastBorder = new Border
        {
            Child = lastLbl,
            Padding = new Thickness(2)
        };
        Canvas.SetLeft(lastBorder, (n - 1) * stepX - 14);
        Canvas.SetTop(lastBorder, Math.Max(0, lastY - 26));
        canvas.Children.Add(lastBorder);

        return new ScrollViewer
        {
            Content = canvas,
            HorizontalScrollBarVisibility = ScrollBarVisibility.Auto,
            VerticalScrollBarVisibility = ScrollBarVisibility.Disabled
        };
    }
}
