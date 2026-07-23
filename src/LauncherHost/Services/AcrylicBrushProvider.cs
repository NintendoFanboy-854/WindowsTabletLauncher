using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Media;

namespace LauncherHost.Services;

public class ThemeBrushProvider
{
    private Brush? _lightBrush;
    private Brush? _darkBrush;

    public Brush GetBrush(ElementTheme theme)
    {
        if (theme == ElementTheme.Dark)
        {
            _darkBrush ??= new SolidColorBrush(
                Windows.UI.Color.FromArgb(255, 28, 28, 28));
            return _darkBrush;
        }

        _lightBrush ??= new SolidColorBrush(
            Windows.UI.Color.FromArgb(255, 243, 243, 243));
        return _lightBrush;
    }
}
