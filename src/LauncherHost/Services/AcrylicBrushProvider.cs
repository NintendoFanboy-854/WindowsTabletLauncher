using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Media;

namespace LauncherHost.Services;

public class AcrylicBrushProvider
{
    private Brush? _lightBrush;
    private Brush? _darkBrush;

    public Brush GetBrush(ElementTheme theme)
    {
        if (theme == ElementTheme.Dark)
        {
            _darkBrush ??= new AcrylicBrush
            {
                TintColor = Windows.UI.Color.FromArgb(255, 32, 32, 32),
                TintOpacity = 0.7,
                FallbackColor = Windows.UI.Color.FromArgb(255, 32, 32, 32)
            };
            return _darkBrush;
        }

        _lightBrush ??= new AcrylicBrush
        {
            TintColor = Windows.UI.Color.FromArgb(255, 255, 255, 255),
            TintOpacity = 0.7,
            FallbackColor = Windows.UI.Color.FromArgb(255, 230, 230, 230)
        };
        return _lightBrush;
    }
}
