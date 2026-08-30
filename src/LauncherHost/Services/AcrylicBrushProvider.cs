using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Media;
using SharedUtils;

namespace LauncherHost.Services;

/// <summary>磁贴底色提供者。统一走 Fluent 令牌（亮/暗/高对比主题资源），不再硬编码颜色。</summary>
public class ThemeBrushProvider
{
    public Brush GetBrush(ElementTheme theme) => Fluent.TileBackground(theme);
}
