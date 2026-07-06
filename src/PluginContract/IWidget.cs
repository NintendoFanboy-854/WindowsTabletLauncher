namespace PluginContract;

public interface IWidget
{
    string Id { get; }
    int Columns { get; }
    int Rows { get; }
    WidgetBackdrop Backdrop { get; }
    object CreateControl();

    int HalfColumns => Columns * 2;
    int HalfRows => Rows * 2;
}
