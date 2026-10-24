/**
 * 轻量 Markdown 渲染：段落、无序/有序列表、标题、围栏代码块、表格、粗体、行内代码、链接。
 * 行内解析（含括号 URL）与「来源」清单裁剪在 ./markdown.ts，只负责排版。
 *
 * 围栏代码块与表格是 v0.4.3 补的（验证报告 §5-⑤：对话面渲染 Markdown 却不认代码块是硬伤）：
 * - 代码块 = 等宽块 + 语言标记（可选显示，12px fg3）+ **内部横向滚动**（`overflow-x:auto`），
 *   不撑破 516 宽的面板；`pre` 是唯一的横向滚动容器，外层不再有第二层滚动。
 * - 表格 = 基础对齐表格（表头 / 数据行 / 底边线），窄容器下同样由外层 `div` 横向滚动，
 *   单元格允许换行（中文表格更常换行而不是横向拖）。
 * 两者都不引第三方解析器、不改数据层：`content` 仍是同一段字符串。
 */

import { Fragment, useMemo, type ReactNode } from 'react';
import { Link, makeStyles, Text, tokens } from '@fluentui/react-components';
import { tokenizeInline } from './markdown';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  paragraph: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    lineHeight: tokens.lineHeightBase300,
  },
  list: {
    margin: 0,
    paddingInlineStart: tokens.spacingHorizontalXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  listItem: {
    margin: 0,
    padding: 0,
  },
  heading: {
    margin: 0,
    lineHeight: tokens.lineHeightBase400,
  },
  code: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
    paddingInline: tokens.spacingHorizontalXS,
  },
  /** 围栏块：一块有边界的等宽面（不是行内码堆成的段落） */
  codeBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    maxWidth: '100%',
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  codeLang: {
    color: tokens.colorNeutralForeground3,
  },
  codePre: {
    margin: 0,
    minWidth: 0,
    maxWidth: '100%',
    // 唯一的横向滚动容器：长行在块内拖动，不撑破消息气泡（scrollWidth > clientWidth 只发生在这里）
    overflowX: 'auto',
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'pre',
    tabSize: 2,
  },
  /** 表格：窄容器下整块横向滚动，单元格自己换行 */
  tableScroll: {
    minWidth: 0,
    maxWidth: '100%',
    overflowX: 'auto',
  },
  table: {
    borderCollapse: 'collapse',
    minWidth: '100%',
  },
  th: {
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXS,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  td: {
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXS,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    textAlign: 'left',
    verticalAlign: 'top',
    overflowWrap: 'anywhere',
  },
});

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'paragraph'; text: string }
  | { kind: 'code'; lang: string; code: string }
  | { kind: 'table'; head: string[]; rows: string[][] };

/** 围栏起止行（3 个以上反引号/波浪号，允许最多 3 个前导空格，与 CommonMark 一致） */
const FENCE = /^\s{0,3}(`{3,}|~{3,})(.*)$/;
/** 表格分隔行：`| --- | :---: |` */
const TABLE_DIVIDER = /^\s*\|?\s*:?-{1,}:?\s*(?:\|\s*:?-{1,}:?\s*)+\|?\s*$/;
/** 表格数据行：必须含管道符（`a | b` 这种纯文本不算） */
const TABLE_ROW = /^\s*\|.*\|\s*$|\s*\S\s*\|\s*\S/;

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: 'paragraph', text: paragraph.join('\n').trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ kind: 'list', ordered: list.ordered, items: list.items });
      list = null;
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trimEnd();

    // 围栏代码块：原样收集到闭合行；未闭合就吃到结尾（流式中途也当成代码块，不把 ``` 上屏）
    const fence = FENCE.exec(line);
    if (fence) {
      flushParagraph();
      flushList();
      const marker = fence[1][0];
      const lang = fence[2].trim().split(/\s+/)[0] ?? '';
      const body: string[] = [];
      let closed = false;
      for (index += 1; index < lines.length; index += 1) {
        const inner = lines[index];
        if (inner.trim().startsWith(marker.repeat(3))) {
          closed = true;
          break;
        }
        body.push(inner);
      }
      if (!closed) index = lines.length;
      blocks.push({ kind: 'code', lang, code: body.join('\n') });
      continue;
    }

    // 表格：当前行是数据行、下一行是分隔行；至少两列
    if (
      TABLE_ROW.test(line) &&
      index + 1 < lines.length &&
      TABLE_DIVIDER.test(lines[index + 1])
    ) {
      const head = splitRow(line);
      if (head.length >= 2) {
        flushParagraph();
        flushList();
        const rows: string[][] = [];
        index += 2;
        while (index < lines.length && TABLE_ROW.test(lines[index]) && lines[index].trim()) {
          rows.push(splitRow(lines[index]));
          index += 1;
        }
        index -= 1;
        blocks.push({ kind: 'table', head, rows });
        continue;
      }
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2] });
      continue;
    }
    if (bullet || ordered) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      if (!list || list.ordered !== isOrdered) {
        flushList();
        list = { ordered: isOrdered, items: [] };
      }
      list.items.push((bullet?.[1] ?? ordered?.[1] ?? '').trim());
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

function renderInline(
  text: string,
  codeClassName: string,
  keyPrefix: string,
): ReactNode[] {
  return tokenizeInline(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (token.type) {
      case 'link':
        return (
          <Link key={key} href={token.url} target="_blank" rel="noreferrer">
            {token.label}
          </Link>
        );
      case 'bold':
        return (
          <Text key={key} weight="semibold">
            {token.text}
          </Text>
        );
      case 'code':
        return (
          <Text key={key} className={codeClassName} font="monospace">
            {token.text}
          </Text>
        );
      default:
        return <Fragment key={key}>{token.text}</Fragment>;
    }
  });
}

export function MessageContent({ text }: { text: string }): ReactNode {
  const styles = useStyles();
  const blocks = useMemo(() => parseBlocks(text), [text]);

  return (
    <div className={styles.root} data-wtsl-agent-content="true">
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          const size = block.level <= 1 ? 500 : block.level === 2 ? 400 : 300;
          return (
            <Text key={index} as="p" size={size} weight="semibold" className={styles.heading}>
              {renderInline(block.text, styles.code, `h-${index}`)}
            </Text>
          );
        }
        if (block.kind === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag key={index} className={styles.list}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className={styles.listItem}>
                  <Text size={300} className={styles.paragraph}>
                    {renderInline(item, styles.code, `l-${index}-${itemIndex}`)}
                  </Text>
                </li>
              ))}
            </ListTag>
          );
        }
        if (block.kind === 'code') {
          return (
            <div key={index} className={styles.codeBlock} data-wtsl-agent-code="true">
              {block.lang ? (
                <Text size={200} className={styles.codeLang} data-wtsl-agent-code-lang={block.lang}>
                  {block.lang}
                </Text>
              ) : null}
              <pre className={styles.codePre}>{block.code}</pre>
            </div>
          );
        }
        if (block.kind === 'table') {
          return (
            <div key={index} className={styles.tableScroll} data-wtsl-agent-table="true">
              <table className={styles.table}>
                <thead>
                  <tr>
                    {block.head.map((cell, cellIndex) => (
                      <th key={cellIndex} className={styles.th} scope="col">
                        <Text size={200} weight="semibold">
                          {renderInline(cell, styles.code, `th-${index}-${cellIndex}`)}
                        </Text>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {block.head.map((_, cellIndex) => (
                        <td key={cellIndex} className={styles.td}>
                          <Text size={200}>
                            {renderInline(row[cellIndex] ?? '', styles.code, `td-${index}-${rowIndex}-${cellIndex}`)}
                          </Text>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <Text key={index} as="p" size={300} className={styles.paragraph}>
            <Fragment>{renderInline(block.text, styles.code, `p-${index}`)}</Fragment>
          </Text>
        );
      })}
    </div>
  );
}
