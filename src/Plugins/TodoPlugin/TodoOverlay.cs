using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using SharedUtils;
using Windows.UI;

namespace TodoPlugin;

internal sealed class TodoOverlay : BasePluginOverlay
{
    protected override FrameworkElement BuildHeader(string title, SolidColorBrush primary)
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

        var header = new Grid { Margin = new Thickness(0, 0, 0, 16) };
        header.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        header.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        header.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

        Grid.SetColumn(back, 0);
        header.Children.Add(back);

        var titleBlock = new TextBlock
        {
            Text = title,
            FontSize = 24,
            FontWeight = FontWeights.SemiBold,
            Foreground = primary,
            VerticalAlignment = VerticalAlignment.Center,
            TextAlignment = TextAlignment.Center,
            TextTrimming = TextTrimming.CharacterEllipsis
        };
        Grid.SetColumn(titleBlock, 1);
        header.Children.Add(titleBlock);

        var spacer = new Border { Width = 40 };
        Grid.SetColumn(spacer, 2);
        header.Children.Add(spacer);

        return header;
    }
}
