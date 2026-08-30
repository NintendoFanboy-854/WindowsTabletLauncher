using Microsoft.UI;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using Windows.Foundation;
using PluginContract;
using LauncherHost.Services;

namespace LauncherHost.Core;

public class GridLayoutManager
{
    public const int MinColumns = 4;
    public const int MinRows = 3;
    public const double MinCellSize = 160;

    public int Columns { get; private set; }
    public int Rows { get; private set; }
    public double CellSize { get; private set; }
    public int NextColumn { get; private set; }
    public int NextRow { get; private set; }
    public double AvailableWidth { get; private set; }
    public double AvailableHeight { get; private set; }

    public int SubColumns => Columns * 2;
    public int SubRows => Rows * 2;
    public double SubCell => CellSize / 2;

    private readonly Grid _grid;
    private readonly List<FrameworkElement> _widgetElements = new();
    private readonly Dictionary<FrameworkElement, FrameworkElement> _content = new();
    private readonly List<Line> _vLines = new();
    private readonly List<Line> _hLines = new();

    public GridLayoutManager(Grid grid)
    {
        _grid = grid;
    }

    public IReadOnlyList<FrameworkElement> Containers => _widgetElements;

    public FrameworkElement? GetContent(FrameworkElement container)
        => _content.TryGetValue(container, out var c) ? c : null;

    /// <summary>磁贴间距：按 4epx 网格取整（Fluent Layout 规范），最小 4。</summary>
    public double Margin => Math.Max(4, Math.Round(CellSize * 0.04 / 4) * 4);

    public double GridWidth => SubColumns * SubCell;
    public double GridHeight => SubRows * SubCell;

    private static int AlignStep(int subSpan) => subSpan % 2 == 0 ? 2 : 1;

    public void Recalculate(double width, double height)
    {
        AvailableWidth = width;
        AvailableHeight = height;
        Columns = Math.Max(MinColumns, (int)(width / MinCellSize));
        Rows = Math.Max(MinRows, (int)(height / MinCellSize));
        CellSize = Math.Min(width / Columns, height / Rows);

        _grid.HorizontalAlignment = HorizontalAlignment.Left;
        _grid.VerticalAlignment = VerticalAlignment.Top;

        _grid.ColumnDefinitions.Clear();
        _grid.RowDefinitions.Clear();

        for (int i = 0; i < SubColumns; i++)
            _grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(SubCell, GridUnitType.Pixel) });
        for (int i = 0; i < SubRows; i++)
            _grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(SubCell, GridUnitType.Pixel) });

        _grid.ColumnSpacing = 0;
        _grid.RowSpacing = 0;

        LogService.Info($"Grid recalc: {Columns}×{Rows} (sub {SubColumns}×{SubRows}) cell={CellSize:F1} sub={SubCell:F1}epx grid={GridWidth:F0}×{GridHeight:F0}epx margin={Margin:F1}epx window={width:F0}×{height:F0}epx");
    }

    public void DrawGridOverlay(Canvas canvas, bool visible)
    {
        canvas.Children.Clear();
        if (!visible) return;

        // 主题感知：浅色主题用暗色网格线，深色主题用亮色网格线
        var dark = canvas.ActualTheme == ElementTheme.Dark;
        var cellBrush = new SolidColorBrush(dark
            ? Windows.UI.Color.FromArgb(0x26, 0xFF, 0xFF, 0xFF)
            : Windows.UI.Color.FromArgb(0x22, 0x00, 0x00, 0x00));
        var subBrush = new SolidColorBrush(dark
            ? Windows.UI.Color.FromArgb(0x12, 0xFF, 0xFF, 0xFF)
            : Windows.UI.Color.FromArgb(0x10, 0x00, 0x00, 0x00));

        var step = SubCell;
        var totalW = SubColumns * step;
        var totalH = SubRows * step;
        var numV = SubColumns + 1;
        var numH = SubRows + 1;

        while (_vLines.Count < numV)
        {
            var line = new Line { StrokeThickness = 1 };
            _vLines.Add(line);
        }
        while (_vLines.Count > numV)
            _vLines.RemoveAt(_vLines.Count - 1);

        while (_hLines.Count < numH)
        {
            var line = new Line { StrokeThickness = 1 };
            _hLines.Add(line);
        }
        while (_hLines.Count > numH)
            _hLines.RemoveAt(_hLines.Count - 1);

        for (int i = 0; i < numV; i++)
        {
            var line = _vLines[i];
            var x = i * step;
            line.X1 = x; line.Y1 = 0; line.X2 = x; line.Y2 = totalH;
            line.Stroke = i % 2 == 0 ? cellBrush : subBrush;
            canvas.Children.Add(line);
        }

        for (int i = 0; i < numH; i++)
        {
            var line = _hLines[i];
            var y = i * step;
            line.X1 = 0; line.Y1 = y; line.X2 = totalW; line.Y2 = y;
            line.Stroke = i % 2 == 0 ? cellBrush : subBrush;
            canvas.Children.Add(line);
        }
    }

    public FrameworkElement AddWidget(IWidget widget, int? col = null, int? row = null)
    {
        var content = (FrameworkElement)widget.CreateControl();
        var container = CreateContainer(content);
        var colSpan = Math.Clamp(widget.HalfColumns, 1, SubColumns);
        var rowSpan = Math.Clamp(widget.HalfRows, 1, SubRows);

        Prepare(container);
        Grid.SetColumnSpan(container, colSpan);
        Grid.SetRowSpan(container, rowSpan);
        Place(container, colSpan, rowSpan, col, row);

        LogService.Info($"AddWidget: '{widget.Id}' {colSpan}×{rowSpan} at ({Grid.GetColumn(container)},{Grid.GetRow(container)})");
        return container;
    }

    public FrameworkElement AddElement(FrameworkElement content, int colSpan, int rowSpan, int? col = null, int? row = null)
    {
        var container = CreateContainer(content);
        colSpan = Math.Clamp(colSpan, 1, SubColumns);
        rowSpan = Math.Clamp(rowSpan, 1, SubRows);

        Prepare(container);
        Grid.SetColumnSpan(container, colSpan);
        Grid.SetRowSpan(container, rowSpan);
        Place(container, colSpan, rowSpan, col, row);

        LogService.Info($"AddElement: {colSpan}×{rowSpan} at ({Grid.GetColumn(container)},{Grid.GetRow(container)})");
        return container;
    }

    private Grid CreateContainer(FrameworkElement content)
    {
        content.HorizontalAlignment = HorizontalAlignment.Stretch;
        content.VerticalAlignment = VerticalAlignment.Stretch;

        var container = new Grid
        {
            Background = new SolidColorBrush(Colors.Transparent),
            HorizontalAlignment = HorizontalAlignment.Stretch,
            VerticalAlignment = VerticalAlignment.Stretch
        };
        container.Children.Add(content);
        _content[container] = content;
        return container;
    }

    public void ShowElement(FrameworkElement control, int? col = null, int? row = null)
    {
        var colSpan = Math.Clamp(Grid.GetColumnSpan(control), 1, SubColumns);
        var rowSpan = Math.Clamp(Grid.GetRowSpan(control), 1, SubRows);

        control.Margin = new Thickness(Margin);
        Grid.SetColumnSpan(control, colSpan);
        Grid.SetRowSpan(control, rowSpan);
        Place(control, colSpan, rowSpan, col, row);

        LogService.Info($"ShowElement: {colSpan}×{rowSpan} at ({Grid.GetColumn(control)},{Grid.GetRow(control)})");
    }

    public void HideElement(FrameworkElement control)
    {
        _widgetElements.Remove(control);
        _grid.Children.Remove(control);
        LogService.Info("HideElement");
    }

    private void Prepare(FrameworkElement control)
    {
        control.Margin = new Thickness(Margin);
        control.RenderTransform = new ScaleTransform { CenterX = 0.5, CenterY = 0.5 };
        control.RenderTransformOrigin = new Point(0.5, 0.5);
    }

    private void Place(FrameworkElement control, int colSpan, int rowSpan, int? col, int? row)
    {
        int placeCol, placeRow;
        if (col.HasValue && row.HasValue &&
            col.Value >= 0 && row.Value >= 0 &&
            col.Value + colSpan <= SubColumns && row.Value + rowSpan <= SubRows &&
            !IsOccupied(col.Value, row.Value, colSpan, rowSpan, control))
        {
            placeCol = col.Value;
            placeRow = row.Value;
        }
        else
        {
            (placeCol, placeRow) = FindFreePosition(colSpan, rowSpan, control);
        }

        Grid.SetColumn(control, placeCol);
        Grid.SetRow(control, placeRow);

        if (!_widgetElements.Contains(control))
            _widgetElements.Add(control);
        if (!_grid.Children.Contains(control))
            _grid.Children.Add(control);

        NextColumn = placeCol;
        NextRow = placeRow;
    }

    public void ReapplyMargins()
    {
        var margin = Margin;
        foreach (var fe in _widgetElements)
            fe.Margin = new Thickness(margin);
        LogService.Info($"ReapplyMargins: {_widgetElements.Count} widgets, margin={margin:F1}");
    }

    public bool TryPlace(FrameworkElement fe, int col, int row, int colSpan, int rowSpan)
    {
        if (col < 0 || row < 0 || col + colSpan > SubColumns || row + rowSpan > SubRows)
            return false;
        if (IsOccupied(col, row, colSpan, rowSpan, fe))
            return false;

        Grid.SetColumn(fe, col);
        Grid.SetRow(fe, row);
        Grid.SetColumnSpan(fe, colSpan);
        Grid.SetRowSpan(fe, rowSpan);
        return true;
    }

    public FrameworkElement? GetSingleSwapTarget(FrameworkElement fe, int col, int row, int colSpan, int rowSpan)
    {
        FrameworkElement? found = null;
        foreach (var other in _widgetElements)
        {
            if (ReferenceEquals(other, fe)) continue;
            if (RectsOverlap(col, row, colSpan, rowSpan,
                    Grid.GetColumn(other), Grid.GetRow(other),
                    Grid.GetColumnSpan(other), Grid.GetRowSpan(other)))
            {
                if (found != null) return null;
                found = other;
            }
        }

        if (found == null) return null;
        if (Grid.GetColumnSpan(found) != colSpan || Grid.GetRowSpan(found) != rowSpan)
            return null;
        return found;
    }

    public void Reflow()
    {
        foreach (var fe in _widgetElements)
        {
            var colSpan = Math.Clamp(Grid.GetColumnSpan(fe), 1, SubColumns);
            var rowSpan = Math.Clamp(Grid.GetRowSpan(fe), 1, SubRows);
            var col = Math.Clamp(Grid.GetColumn(fe), 0, SubColumns - colSpan);
            var row = Math.Clamp(Grid.GetRow(fe), 0, SubRows - rowSpan);

            Grid.SetColumnSpan(fe, colSpan);
            Grid.SetRowSpan(fe, rowSpan);

            if (IsOccupied(col, row, colSpan, rowSpan, fe))
                (col, row) = FindFreePosition(colSpan, rowSpan, fe);

            Grid.SetColumn(fe, col);
            Grid.SetRow(fe, row);
        }
        LogService.Info($"Reflow: {_widgetElements.Count} widgets into sub {SubColumns}×{SubRows}");
    }

    private (int col, int row) FindFreePosition(int colSpan, int rowSpan, FrameworkElement? ignore = null)
    {
        var colStep = AlignStep(colSpan);
        var rowStep = AlignStep(rowSpan);
        for (int row = 0; row <= SubRows - rowSpan; row += rowStep)
            for (int col = 0; col <= SubColumns - colSpan; col += colStep)
                if (!IsOccupied(col, row, colSpan, rowSpan, ignore))
                    return (col, row);
        return (0, 0);
    }

    private bool IsOccupied(int col, int row, int colSpan, int rowSpan, FrameworkElement? ignore)
    {
        foreach (var fe in _widgetElements)
        {
            if (ReferenceEquals(fe, ignore)) continue;
            if (RectsOverlap(col, row, colSpan, rowSpan,
                    Grid.GetColumn(fe), Grid.GetRow(fe),
                    Grid.GetColumnSpan(fe), Grid.GetRowSpan(fe)))
                return true;
        }
        return false;
    }

    private static bool RectsOverlap(int aCol, int aRow, int aColSpan, int aRowSpan,
                                     int bCol, int bRow, int bColSpan, int bRowSpan)
        => aCol < bCol + bColSpan && aCol + aColSpan > bCol &&
           aRow < bRow + bRowSpan && aRow + aRowSpan > bRow;
}
