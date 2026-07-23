using Markdig;
using Markdig.Extensions.Tables;
using Markdig.Syntax;
using Markdig.Syntax.Inlines;
using Microsoft.UI;
using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Documents;
using Microsoft.UI.Xaml.Media;
using Windows.UI;
using Windows.UI.Text;

namespace SharedUtils;

public static class MarkdownRenderer
{
    static readonly MarkdownPipeline Pipeline = new MarkdownPipelineBuilder()
        .UseAdvancedExtensions()
        .DisableHtml()
        .Build();

    static readonly SolidColorBrush CodeBlockBackgroundBrush = new(Color.FromArgb(0x30, 0, 0, 0));
    static readonly SolidColorBrush SemiTransparentBorderBrush = new(Color.FromArgb(0x30, 0x88, 0x88, 0x88));
    static readonly SolidColorBrush QuoteBorderBrush = new(Color.FromArgb(0x60, 0x88, 0x88, 0x88));
    static readonly SolidColorBrush TableHeaderBrush = new(Color.FromArgb(0x18, 0x88, 0x88, 0x88));
    static readonly SolidColorBrush InlineCodeBrush = new(Color.FromArgb(0xFF, 0xE0, 0x6C, 0x75));
    static readonly SolidColorBrush LinkBrush = new(Color.FromArgb(0xFF, 0x62, 0xA0, 0xE0));
    static readonly FontFamily CodeFontFamily = new("Consolas");

    static readonly Dictionary<string, MarkdownDocument> ParseCache = new();
    static readonly object ParseCacheLock = new();

    public static Panel Render(string markdown, Brush primary, Brush secondary, double fontSize = 13)
    {
        var panel = new StackPanel { Spacing = 4 };
        if (string.IsNullOrWhiteSpace(markdown))
        {
            panel.Children.Add(new TextBlock { Text = markdown, FontSize = fontSize, Foreground = primary, TextWrapping = TextWrapping.Wrap });
            return panel;
        }

        try
        {
            MarkdownDocument doc;
            lock (ParseCacheLock)
            {
                if (!ParseCache.TryGetValue(markdown, out doc!))
                {
                    doc = Markdown.Parse(markdown, Pipeline);
                    if (ParseCache.Count >= 50)
                        ParseCache.Clear();
                    ParseCache[markdown] = doc;
                }
            }
            foreach (var block in doc)
                RenderBlock(block, panel, primary, secondary, fontSize);
        }
        catch
        {
            panel.Children.Add(new TextBlock { Text = markdown, FontSize = fontSize, Foreground = primary, TextWrapping = TextWrapping.Wrap });
        }
        return panel;
    }

    static void RenderBlock(Markdig.Syntax.Block block, StackPanel panel, Brush primary, Brush secondary, double fontSize)
    {
        var f = fontSize;
        switch (block)
        {
            case HeadingBlock h:
            {
                double hf = h.Level switch { 1 => f + 5, 2 => f + 2, _ => f };
                var tb = new TextBlock { FontSize = hf, Foreground = primary, FontWeight = FontWeights.SemiBold, TextWrapping = TextWrapping.Wrap };
                RenderInlines(h.Inline, tb.Inlines, primary, secondary);
                panel.Children.Add(tb);
                break;
            }
            case ParagraphBlock p:
            {
                var tb = new TextBlock { FontSize = f, Foreground = primary, TextWrapping = TextWrapping.Wrap };
                RenderInlines(p.Inline, tb.Inlines, primary, secondary);
                panel.Children.Add(tb);
                break;
            }
            case CodeBlock code:
            {
                var text = code.Lines.ToString();
                var border = new Border
                {
                    Background = CodeBlockBackgroundBrush,
                    CornerRadius = new CornerRadius(6),
                    Padding = new Thickness(10, 8, 10, 8)
                };
                border.Child = new TextBlock
                {
                    Text = text,
                    FontSize = f - 1,
                    FontFamily = CodeFontFamily,
                    Foreground = secondary,
                    TextWrapping = TextWrapping.Wrap
                };
                panel.Children.Add(border);
                break;
            }
            case ListBlock list:
            {
                int idx = 0;
                foreach (var item in list)
                {
                    if (item is ListItemBlock li)
                    {
                        var row = new StackPanel { Orientation = Orientation.Horizontal };

                        row.Children.Add(new TextBlock
                        {
                            Text = list.IsOrdered ? $"{++idx}." : "-",
                            FontSize = f,
                            Foreground = secondary,
                            Width = 24,
                            Margin = new Thickness(0, 0, 8, 0),
                            HorizontalTextAlignment = TextAlignment.Right
                        });

                        var content = new StackPanel();
                        foreach (var sub in li)
                            RenderBlock(sub, content, primary, secondary, f);
                        row.Children.Add(content);

                        panel.Children.Add(row);
                    }
                }
                break;
            }
            case ThematicBreakBlock:
                panel.Children.Add(new Border
                {
                    Height = 1,
                    Background = SemiTransparentBorderBrush,
                    Margin = new Thickness(0, 4, 0, 4)
                });
                break;
            case QuoteBlock quote:
            {
                var border = new Border
                {
                    BorderBrush = QuoteBorderBrush,
                    BorderThickness = new Thickness(3, 0, 0, 0),
                    Padding = new Thickness(8, 2, 0, 2),
                    Margin = new Thickness(0, 2, 0, 2)
                };
                var inner = new StackPanel();
                foreach (var b in quote)
                    RenderBlock(b, inner, secondary, secondary, f);
                border.Child = inner;
                panel.Children.Add(border);
                break;
            }
            case Table table:
            {
                var colCount = table.ColumnDefinitions?.Count ?? 0;
                if (colCount == 0) break;
                var grid = new Grid { Margin = new Thickness(0, 2, 0, 2) };
                for (int c = 0; c < colCount; c++)
                    grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

                int rowIdx = 0;
                foreach (var tRow in table)
                {
                    if (tRow is not TableRow row) continue;
                    grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
                    int colIdx = 0;
                    foreach (var tCell in row)
                    {
                        if (tCell is not TableCell cell || colIdx >= colCount) continue;
                        var cellTb = new TextBlock { FontSize = f, Foreground = primary, TextWrapping = TextWrapping.Wrap };
                        cellTb.Inlines.Add(new Run { Text = ExtractText(cell), Foreground = primary });
                        Grid.SetRow(cellTb, rowIdx);
                        Grid.SetColumn(cellTb, colIdx);

                        var cellBorder = new Border
                        {
                            BorderBrush = SemiTransparentBorderBrush,
                            BorderThickness = new Thickness(1),
                            Padding = new Thickness(6, 3, 6, 3),
                            Child = cellTb
                        };
                        if (rowIdx == 0)
                            cellBorder.Background = TableHeaderBrush;
                        Grid.SetRow(cellBorder, rowIdx);
                        Grid.SetColumn(cellBorder, colIdx);
                        grid.Children.Add(cellBorder);
                        colIdx++;
                    }
                    rowIdx++;
                }
                panel.Children.Add(grid);
                break;
            }
            default:
                if (block is LeafBlock leaf && leaf.Inline != null)
                {
                    var tb = new TextBlock { FontSize = f, Foreground = primary, TextWrapping = TextWrapping.Wrap };
                    RenderInlines(leaf.Inline, tb.Inlines, primary, secondary);
                    panel.Children.Add(tb);
                }
                break;
        }
    }

    static string ExtractText(Markdig.Syntax.ContainerBlock cell)
    {
        var sb = new System.Text.StringBuilder();
        foreach (var child in cell)
        {
            if (child is LeafBlock leaf && leaf.Inline != null)
                AppendInlineText(leaf.Inline, sb);
        }
        return sb.ToString();
    }

    static void AppendInlineText(Markdig.Syntax.Inlines.Inline inline, System.Text.StringBuilder sb)
    {
        if (inline is LiteralInline lit)
            sb.Append(lit.Content);
        else if (inline is ContainerInline ci)
            foreach (var child in ci)
                AppendInlineText(child, sb);
    }

    static void RenderInlines(ContainerInline? container, InlineCollection target, Brush primary, Brush secondary)
    {
        if (container == null) return;
        foreach (var inline in container)
        {
            switch (inline)
            {
                case LiteralInline lit:
                    target.Add(new Run { Text = lit.Content.ToString() ?? "", Foreground = primary });
                    break;
                case EmphasisInline em:
                {
                    var span = new Span();
                    if (em.DelimiterChar == '*' && em.DelimiterCount == 2)
                        span.FontWeight = FontWeights.Bold;
                    else
                        span.FontStyle = FontStyle.Italic;
                    RenderInlines(em, span.Inlines, primary, secondary);
                    target.Add(span);
                    break;
                }
                case CodeInline ci:
                {
                    var run = new Run
                    {
                        Text = ci.Content,
                        FontFamily = CodeFontFamily,
                        FontSize = 12,
                        Foreground = InlineCodeBrush
                    };
                    target.Add(run);
                    break;
                }
                case LinkInline link:
                {
                    var span = new Span();
                    span.Foreground = LinkBrush;
                    RenderInlines(link, span.Inlines, primary, secondary);
                    target.Add(span);
                    break;
                }
                default:
                    if (inline is ContainerInline ci2)
                        RenderInlines(ci2, target, primary, secondary);
                    break;
            }
        }
    }
}
