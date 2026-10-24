/**
 * 半高 peek 的行内 Markdown：只产出行内元素，不产生任何块级元素。
 *
 * 为什么不直接用 `MessageContent`（调查 §3.1 Q1-e 的结论）：半高的文本契约是
 * 「`-webkit-line-clamp:3` 硬截断 + 顶部 22% 渐隐 + 176px 高度预算」，而
 * `MessageContent` 的根是 `display:flex; flex-direction:column`，标题还要 26px 行高。
 * 所以半高只借 `tokenizeInline`（唯一解析器）：块级标记先被剥掉（标题/列表/引用/序号/
 * 分割线/表格行，见 `cleanLine`），剩下的行内语法（粗体 / 行内码 / 链接）照常渲染，
 * 围栏代码块降级为一行等宽片段。
 *
 * 截断规则：按**可见字符预算**在 token 边界截断，不靠 CSS 像素裁切，所以界面上不会
 * 出现半个语法符号（`**`、`` ` ``、`[`）。
 * - `tail`：内容增长时看尾部（流式中的最后一条），配合 peek 的底部对齐做「尾部跟读」；
 * - 默认看头部（历史消息）。
 *
 * 链接渲染成品牌色带下划线的 `Text` 而不是 `<a>`：peek 是 `role="button"`（点击/Enter
 * 展开对话），嵌套可交互元素会破坏它的键盘语义与命中区（accessibility.md:19-20；
 * HIG §5.1 语义一致）。真正的链接在展开后的全高对话里点。
 */
import { Fragment, useMemo, type ReactNode } from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { tokenizeInline } from './markdown';

/**
 * 半高文本列 ≈ 399（契约 §1 的宽度算式）→ 14px 中文约 28 字/行 → 3 行约 84 字。
 * 预算按半角单位计（全角字符 = 2），对中文与英文都落在 3 行附近。
 */
const PEEK_CHAR_BUDGET = 84;
const PEEK_UNIT_BUDGET = PEEK_CHAR_BUDGET * 2;

/** 围栏代码块的起止行（允许最多 3 个前导空格，与 CommonMark 一致） */
const FENCE = /^\s{0,3}```/;
/** 只在被截断时清理的行尾残缺标记：成对/完整语法不会出现在行尾 */
const DANGLING_MARKERS = /(?:\*\*|`|\[)$/;

/**
 * 块级标记：半高只做行内渲染，这些标记必须在成文之前剥掉，否则 `##`、`-`、`>` 会原样上屏。
 *
 * 剥法与「降级」同一条原则：保留文字、丢掉语法。标题的文字保留并加粗（层级还在，只是不再有
 * 26px 的大标题），列表/引用/序号只留条目文字，分割线与表格分隔行整行丢弃，表格行改写成
 * `单元格 · 单元格`（管道符是语法，不是内容）。剥掉标记后连续空行直接跳过，不会在文本里
 * 留下一串空格（`flushInline` 只在两行之间补一个空格）。
 */
const HEADING = /^\s{0,3}(#{1,6})\s+(.*)$/;
const THEMATIC_BREAK = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const TABLE_DIVIDER = /^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)+\|?\s*$/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const BULLET = /^\s{0,3}[-*+]\s+(.*)$/;
const ORDERED = /^\s{0,3}\d{1,3}[.)]\s+(.*)$/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;

const useStyles = makeStyles({
  code: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
    paddingInline: tokens.spacingHorizontalXS,
  },
  link: {
    color: tokens.colorBrandForeground1,
    textDecoration: 'underline',
  },
});

type Token =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; label: string };

/** 全角字符记 2 个半角单位 */
const FULL_WIDTH = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;

function units(text: string): number {
  let total = 0;
  for (const char of text) total += FULL_WIDTH.test(char) ? 2 : 1;
  return total;
}

/** 一行剥离块级标记后的文字；`bold` = 原来是标题（保留层级感，去掉 `## `） */
type CleanLine = { text: string; bold: boolean; kind: 'text' | 'item' | 'row' };

/** 剥掉一行的块级标记；返回 null = 整行没有可读内容（空行 / 分割线 / 表格分隔行） */
function cleanLine(raw: string): CleanLine | null {
  const line = raw.trimEnd();
  if (!line.trim()) return null;
  if (THEMATIC_BREAK.test(line)) return null;
  if (TABLE_DIVIDER.test(line)) return null;

  if (TABLE_ROW.test(line)) {
    const cells = line
      .replace(/^\s*\|/, '')
      .replace(/\|\s*$/, '')
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean);
    return cells.length > 0 ? { text: cells.join(' · '), bold: false, kind: 'row' } : null;
  }

  const heading = HEADING.exec(line);
  if (heading) {
    const text = heading[2].trim();
    return text ? { text, bold: true, kind: 'text' } : null;
  }

  // 引用可以嵌套（`>>`），逐层剥掉
  let quoted = line;
  while (QUOTE.test(quoted)) quoted = QUOTE.exec(quoted)?.[1] ?? '';

  const bullet = BULLET.exec(quoted);
  if (bullet) return bullet[1].trim() ? { text: bullet[1].trim(), bold: false, kind: 'item' } : null;

  const ordered = ORDERED.exec(quoted);
  if (ordered) return ordered[1].trim() ? { text: ordered[1].trim(), bold: false, kind: 'item' } : null;

  return quoted.trim() ? { text: quoted.trim(), bold: false, kind: 'text' } : null;
}

/** 围栏代码块降级成一行等宽片段；块级标记先剥，行内语法交给 tokenizeInline */
function buildTokens(raw: string): Token[] {
  const tokens: Token[] = [];
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  let pendingLines: CleanLine[] = [];

  const flushInline = () => {
    if (pendingLines.length === 0) return;
    // 空行/分割线已经在 cleanLine 里消失，这里再滤一次防御空白条目：不会产生空行堆积
    const cleaned = pendingLines.filter((line) => line.text.length > 0);
    pendingLines = [];
    cleaned.forEach((line, index) => {
      if (index > 0) {
        // 分隔符承担「行与行的关系」：列表条目之间「 · 」、表格行之间「；」、其余用空格。
        // 不能都用空格：表格行会被读成一长串单元格；也不能都用「 · 」：两行会被读成一行。
        const previous = cleaned[index - 1];
        const separator =
          previous.kind === 'item' && line.kind === 'item'
            ? ' · '
            : previous.kind === 'row' && line.kind === 'row'
              ? '；'
              : ' ';
        tokens.push({ kind: 'text', text: separator });
      }
      for (const token of tokenizeInline(line.text)) {
        if (token.type === 'link') tokens.push({ kind: 'link', label: token.label });
        else if (token.type === 'bold' || (line.bold && token.type === 'text')) {
          tokens.push({ kind: 'bold', text: token.text });
        } else if (token.type === 'code') tokens.push({ kind: 'code', text: token.text });
        else tokens.push({ kind: 'text', text: token.text });
      }
    });
  };

  let inFence = false;
  let fenceFirstLine = '';

  for (const line of lines) {
    if (FENCE.test(line)) {
      if (inFence) {
        // 闭合：整段代码压成一行（首行代码；空块记「代码块」），绝不输出 ``` 本身
        tokens.push({ kind: 'code', text: fenceFirstLine || '代码块' });
        tokens.push({ kind: 'text', text: ' ' });
        inFence = false;
        fenceFirstLine = '';
      } else {
        flushInline();
        inFence = true;
      }
      continue;
    }
    if (inFence) {
      if (!fenceFirstLine && line.trim()) fenceFirstLine = line.trim();
      continue;
    }
    const cleaned = cleanLine(line);
    if (cleaned) pendingLines.push(cleaned);
  }
  // 未闭合的围栏同样只留一行代码，不外泄 ``` 语法
  if (inFence) tokens.push({ kind: 'code', text: fenceFirstLine || '代码块' });
  flushInline();
  return tokens;
}

function visibleText(token: Token): string {
  return token.kind === 'link' ? token.label : token.text;
}

function withText(token: Token, text: string): Token {
  return token.kind === 'link' ? { kind: 'link', label: text } : { ...token, text };
}

/** 从头部或尾部按单位预算取一段；返回该 token 的可见片段 */
function sliceToUnits(text: string, room: number, tail: boolean): string {
  if (room <= 0) return '';
  const chars = [...text];
  const picked: string[] = [];
  let used = 0;
  if (tail) {
    for (let index = chars.length - 1; index >= 0; index -= 1) {
      const width = FULL_WIDTH.test(chars[index]) ? 2 : 1;
      if (used + width > room) break;
      picked.unshift(chars[index]);
      used += width;
    }
  } else {
    for (const char of chars) {
      const width = FULL_WIDTH.test(char) ? 2 : 1;
      if (used + width > room) break;
      picked.push(char);
      used += width;
    }
  }
  return picked.join('');
}

function trimDangling(text: string): string {
  let next = text;
  while (next.length > 0 && DANGLING_MARKERS.test(next)) {
    next = next.replace(DANGLING_MARKERS, '');
  }
  return next;
}

/** 预算内取 token；截断只发生在 token 边界（或 token 文本内部，不跨语法） */
function fitTokens(tokens: Token[], tail: boolean): Token[] {
  const source = tail ? [...tokens].reverse() : tokens;
  const kept: Token[] = [];
  let used = 0;
  let truncated = false;

  for (const token of source) {
    const text = visibleText(token);
    const width = units(text);
    if (used + width <= PEEK_UNIT_BUDGET) {
      kept.push(token);
      used += width;
      continue;
    }
    const room = PEEK_UNIT_BUDGET - used;
    const piece = sliceToUnits(text, room, tail);
    if (piece) kept.push(withText(token, piece));
    truncated = true;
    break;
  }

  if (tail) kept.reverse();
  if (!truncated) return kept;

  // 头部截断：末尾可能是被切开的行内语法，清掉残缺标记（尾随截断已用「…」提示，无需清头）
  if (!tail && kept.length > 0) {
    const last = kept[kept.length - 1];
    if (last.kind === 'text') {
      const cleaned = trimDangling(last.text);
      if (cleaned) kept[kept.length - 1] = { kind: 'text', text: cleaned };
      else kept.pop();
    }
  }
  if (tail) kept.unshift({ kind: 'text', text: '…' });
  else kept.push({ kind: 'text', text: '…' });
  return kept;
}

export interface PeekTextProps {
  text: string;
  /** true = 显示尾部（流式中跟读）；默认显示头部 */
  tail?: boolean;
}

export function PeekText({ text, tail = false }: PeekTextProps): ReactNode {
  const styles = useStyles();
  const tokens = useMemo(() => fitTokens(buildTokens(text), tail), [text, tail]);

  return (
    <>
      {tokens.map((token, index) => {
        if (token.kind === 'bold') {
          return (
            <Text key={index} weight="semibold">
              {token.text}
            </Text>
          );
        }
        if (token.kind === 'code') {
          return (
            <Text key={index} className={styles.code} font="monospace">
              {token.text}
            </Text>
          );
        }
        if (token.kind === 'link') {
          return (
            <Text key={index} className={styles.link}>
              {token.label}
            </Text>
          );
        }
        return <Fragment key={index}>{token.text}</Fragment>;
      })}
    </>
  );
}

