using Markdig;
using Markdig.Extensions.Tables;
using Markdig.Syntax;
using Markdig.Syntax.Inlines;
using Microsoft.UI.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Documents;
using Microsoft.UI.Xaml.Media;
using Windows.UI.Text;

namespace SharedUtils;

/// <summary>
/// Markdown 渲染（Fluent 2）：颜色全部走主题令牌（随亮/暗主题切换），
/// 强调用 SemiBold，代码块 4px 圆角，正文 14px Body 起。
/// </summary>
public static class MarkdownRenderer
{
    static readonly MarkdownPipeline Pipeline = new MarkdownPipelineBuilder()
        .UseAdvancedExtensions()
        .DisableHtml()
        .Build();

    static readonly FontFamily CodeFontFamily = new("Consolas");

    static readonly Dictionary<string, MarkdownDocument> ParseCache = new();
    static readonly Queue<string> ParseCacheOrder = new();
    static readonly object ParseCacheLock = new();
    const int ParseCacheCapacity = 50;
    const int ParseCacheMaxKeyLength = 8192;


    static Brush TokenBrush(string key, Brush fallback) => Fluent.Brush(key) ?? fallback;

    public static Panel Render(string markdown, Brush primary, Brush secondary, double fontSize = 14, bool useCache = true, ElementTheme theme = ElementTheme.Dark)
    {
        var panel = new StackPanel { Spacing = Fluent.SpaceXS };
        if (string.IsNullOrWhiteSpace(markdown))
        {
            panel.Children.Add(new TextBlock { Text = markdown, FontSize = fontSize, Foreground = primary, TextWrapping = TextWrapping.Wrap });
            return panel;
        }

        // 规范化：LLM 常把表格紧贴在段落后面输出（缺空行），Markdig 无法把表格从段落里切出来；
        // 在以 | 开头的行之前若上一行是非表格文本，则补一个空行
        markdown = NormalizeTableBreaks(markdown);

        try
        {
            var doc = useCache && markdown.Length <= ParseCacheMaxKeyLength
                ? GetCachedDocument(markdown)
                : Markdown.Parse(markdown, Pipeline);
            foreach (var block in doc)
                RenderBlock(block, panel, primary, secondary, fontSize, theme);
        }
        catch
        {
            panel.Children.Add(new TextBlock { Text = markdown, FontSize = fontSize, Foreground = primary, TextWrapping = TextWrapping.Wrap });
        }
        return panel;
    }

    static string NormalizeTableBreaks(string md)
    {
        if (!md.Contains('|')) return md;
        var lines = md.Replace("\r\n", "\n").Split('\n');
        var sb = new System.Text.StringBuilder(md.Length + 16);
        bool prevEmpty = true;
        bool prevRow = false;
        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i];
            var t = line.TrimStart();
            var isRow = t.StartsWith("|") || (t.EndsWith("|") && t.Contains('|') && !t.StartsWith("```"));
            if (isRow && !prevEmpty && !prevRow)
                sb.Append('\n');
            sb.Append(line);
            if (i < lines.Length - 1) sb.Append('\n');
            prevEmpty = t.Length == 0;
            prevRow = isRow;
        }
        return sb.ToString();
    }

    static MarkdownDocument GetCachedDocument(string markdown)
    {
        lock (ParseCacheLock)
        {
            if (ParseCache.TryGetValue(markdown, out var doc))
                return doc!;
        }
        var parsed = Markdown.Parse(markdown, Pipeline);
        lock (ParseCacheLock)
        {
            if (ParseCache.TryGetValue(markdown, out var existing))
                return existing!;
            ParseCache[markdown] = parsed;
            ParseCacheOrder.Enqueue(markdown);
            while (ParseCacheOrder.Count > ParseCacheCapacity)
                ParseCache.Remove(ParseCacheOrder.Dequeue());
            return parsed;
        }
    }

    static void RenderBlock(Markdig.Syntax.Block block, StackPanel panel, Brush primary, Brush secondary, double fontSize, ElementTheme theme)
    {
        var f = fontSize;
        var borderBrush = TokenBrush("CardStrokeColorDefaultBrush", Fluent.CardStroke(theme));
        switch (block)
        {
            case HeadingBlock h:
            {
                double hf = h.Level switch { 1 => f + 6, 2 => f + 4, _ => f };
                var tb = new TextBlock { FontSize = hf, LineHeight = hf * 1.35, Foreground = primary, FontWeight = FontWeights.SemiBold, TextWrapping = TextWrapping.Wrap };
                RenderInlines(h.Inline, tb.Inlines, primary, secondary, f, theme);
                panel.Children.Add(tb);
                break;
            }
            case ParagraphBlock p:
            {
                var tb = new TextBlock { FontSize = f, LineHeight = f * 1.45, Foreground = primary, TextWrapping = TextWrapping.Wrap };
                RenderInlines(p.Inline, tb.Inlines, primary, secondary, f, theme);
                panel.Children.Add(tb);
                break;
            }
            case CodeBlock code:
            {
                var text = code.Lines.ToString();
                var border = new Border
                {
                    Background = TokenBrush("CardBackgroundFillColorDefaultBrush", Fluent.CardBg(theme)),
                    CornerRadius = new CornerRadius(Fluent.RadiusControl),
                    Padding = new Thickness(Fluent.SpaceM, Fluent.SpaceS, Fluent.SpaceM, Fluent.SpaceS)
                };
                border.Child = new TextBlock
                {
                    Text = text,
                    FontSize = Math.Max(Fluent.FontCaption, f - 2),
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
                            Margin = new Thickness(0, 0, Fluent.SpaceS, 0),
                            HorizontalTextAlignment = TextAlignment.Right
                        });

                        var content = new StackPanel();
                        foreach (var sub in li)
                            RenderBlock(sub, content, primary, secondary, f, theme);
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
                    Background = TokenBrush("DividerStrokeColorDefaultBrush", Fluent.Divider(theme)),
                    Margin = new Thickness(0, Fluent.SpaceXS, 0, Fluent.SpaceXS)
                });
                break;
            case QuoteBlock quote:
            {
                var border = new Border
                {
                    BorderBrush = borderBrush,
                    BorderThickness = new Thickness(3, 0, 0, 0),
                    Padding = new Thickness(Fluent.SpaceS, 2, 0, 2),
                    Margin = new Thickness(0, 2, 0, 2)
                };
                var inner = new StackPanel();
                foreach (var b in quote)
                    RenderBlock(b, inner, secondary, secondary, f, theme);
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
                        cellTb.Inlines.Add(new Run { Text = ExtractText(cell) });
                        Grid.SetRow(cellTb, rowIdx);
                        Grid.SetColumn(cellTb, colIdx);

                        var cellBorder = new Border
                        {
                            BorderBrush = borderBrush,
                            BorderThickness = new Thickness(1),
                            Padding = new Thickness(Fluent.SpaceS, 4, Fluent.SpaceS, 4),
                            Child = cellTb
                        };
                        if (rowIdx == 0)
                            cellBorder.Background = TokenBrush("CardBackgroundFillColorSecondaryBrush", Fluent.CardBgSecondary(theme));
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
                RenderInlines(leaf.Inline, tb.Inlines, primary, secondary, f, theme);
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

    static void RenderInlines(ContainerInline? container, InlineCollection target, Brush primary, Brush secondary, double f, ElementTheme theme)
    {
        if (container == null) return;
        foreach (var inline in container)
        {
            switch (inline)
            {
                case LiteralInline lit:
                    target.Add(new Run { Text = lit.Content.ToString() ?? "" });
                    break;
                case LineBreakInline:
                    // 换行不能丢：软/硬换行（Markdig 统一为 LineBreakInline）丢弃后
                    // "段落\n表格"会黏成一行，破坏表格与排版
                    target.Add(new LineBreak());
                    break;
                case EmphasisInline em:
                {
                    // Fluent 排版：不使用 Bold/Italic，强调用 SemiBold，次级强调用次级文字色
                    var span = new Span();
                    if (em.DelimiterCount >= 2)
                        span.FontWeight = FontWeights.SemiBold;
                    else
                        span.Foreground = secondary;
                    RenderInlines(em, span.Inlines, primary, secondary, f, theme);
                    target.Add(span);
                    break;
                }
                case CodeInline ci:
                {
                    var run = new Run
                    {
                        Text = ci.Content,
                        FontFamily = CodeFontFamily,
                        FontSize = Math.Max(Fluent.FontCaption, f - 2),
                        Foreground = Fluent.Critical(theme)
                    };
                    target.Add(run);
                    break;
                }
                case LinkInline link:
                {
                    var span = new Span();
                    span.Foreground = Fluent.Accent();
                    RenderInlines(link, span.Inlines, primary, secondary, f, theme);
                    target.Add(span);
                    break;
                }
                default:
                    if (inline is ContainerInline ci2)
                        RenderInlines(ci2, target, primary, secondary, f, theme);
                    break;
            }
        }
    }
}
