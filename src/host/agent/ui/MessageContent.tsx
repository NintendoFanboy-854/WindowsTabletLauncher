/**
 * 轻量 Markdown 渲染：段落、无序/有序列表、标题、粗体、行内代码、链接。
 * 行内解析（含括号 URL）与「来源」清单裁剪在 ./markdown.ts，只负责排版。
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
});

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'paragraph'; text: string };

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

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
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
    <div className={styles.root}>
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
        return (
          <Text key={index} as="p" size={300} className={styles.paragraph}>
            <Fragment>{renderInline(block.text, styles.code, `p-${index}`)}</Fragment>
          </Text>
        );
      })}
    </div>
  );
}
