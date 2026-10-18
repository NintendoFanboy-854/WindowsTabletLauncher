/**
 * Agent 回答的轻量 Markdown 解析：
 * - 行内链接支持「带括号的 URL」（如 Wikipedia 的 `_Foo_(bar)`），不再把原始语法漏到界面；
 * - 正文末尾的「来源：1. [..](..)」清单会被裁掉，来源统一由下方 chips 呈现，避免重复。
 */

export type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'link'; label: string; url: string }
  | { type: 'bold'; text: string }
  | { type: 'code'; text: string };

/** 行尾不该算进 URL 的标点 */
const TRAILING_PUNCTUATION = /[.,;:!?，。；：！？、）)\]】」』]/;
/** 裸 URL 到此为止的字符 */
const URL_STOP = /[\s<>"'“”‘’]/;

const SOURCE_HEADER = /^\s*(?:\*\*)?(?:来源|参考资料|Sources?)(?:\*\*)?\s*[:：]/i;

function isBareUrlStart(text: string, index: number): boolean {
  const slice = text.slice(index, index + 8).toLowerCase();
  return slice.startsWith('http://') || slice.startsWith('https://');
}

/** 从 markdown 链接的 "(" 之后开始，找到配对的 ")"，允许 URL 内部含成对括号 */
function findMarkdownUrlEnd(text: string, start: number): number {
  let depth = 1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (char === '(') depth += 1;
    else if (char === ')') {
      depth -= 1;
      if (depth === 0) return index + 1;
    } else if (char === '\n') return -1;
  }
  return -1;
}

function readBareUrl(text: string, start: number): { url: string; end: number } {
  let end = start;
  while (end < text.length && !URL_STOP.test(text[end])) end += 1;
  let url = text.slice(start, end);
  while (url && TRAILING_PUNCTUATION.test(url[url.length - 1])) {
    url = url.slice(0, -1);
    end -= 1;
  }
  return { url, end };
}

/** 把一段文本拆成行内 token；纯函数，任何输入都不抛异常 */
export function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let buffer = '';
  let index = 0;

  const flush = () => {
    if (buffer) {
      tokens.push({ type: 'text', text: buffer });
      buffer = '';
    }
  };

  while (index < text.length) {
    const char = text[index];

    if (char === '[') {
      const labelEnd = text.indexOf('](', index + 1);
      if (labelEnd > index) {
        const urlEnd = findMarkdownUrlEnd(text, labelEnd + 2);
        if (urlEnd > 0) {
          const label = text.slice(index + 1, labelEnd);
          const url = text.slice(labelEnd + 2, urlEnd - 1).trim();
          if (label && /^https?:\/\//i.test(url)) {
            flush();
            tokens.push({ type: 'link', label, url });
            index = urlEnd;
            continue;
          }
        }
      }
    } else if (char === '*' && text.startsWith('**', index)) {
      const boldEnd = text.indexOf('**', index + 2);
      if (boldEnd > index + 2) {
        flush();
        tokens.push({ type: 'bold', text: text.slice(index + 2, boldEnd) });
        index = boldEnd + 2;
        continue;
      }
    } else if (char === '`') {
      const codeEnd = text.indexOf('`', index + 1);
      if (codeEnd > index) {
        flush();
        tokens.push({ type: 'code', text: text.slice(index + 1, codeEnd) });
        index = codeEnd + 1;
        continue;
      }
    } else if (isBareUrlStart(text, index)) {
      const { url, end } = readBareUrl(text, index);
      if (url.length > 8) {
        flush();
        tokens.push({ type: 'link', label: url, url });
        index = end;
        continue;
      }
    }

    buffer += char;
    index += 1;
  }
  flush();
  return tokens;
}

/**
 * 去掉正文末尾的「来源：」清单（列表项都是链接/编号/裸链）。
 * 只在回答确实有 annotations 来源时调用，避免误伤普通正文。
 */
export function stripSourceSection(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (!SOURCE_HEADER.test(line)) continue;

    const afterHeader = lines.slice(index + 1).filter((item) => item.trim());
    const headerTail = line.replace(SOURCE_HEADER, '').trim();
    const listLike = (item: string): boolean =>
      /^(\d+[.)]|[-*+])\s+/.test(item.trim()) ||
      /^\[[^\]]+\]\(.+\)$/.test(item.trim()) ||
      /^https?:\/\//.test(item.trim());
    const headerTailStartsList = /^(\d+[.)]|[-*+])\s+/.test(headerTail);
    const tailLooksLikeList =
      headerTail.length > 0 ? listLike(headerTail) || headerTailStartsList : true;
    const restLooksLikeList = afterHeader.every(listLike);
    // 只有“确实有一段来源清单”才裁：单行「参考资料：[链接]」属于正文引用，保留
    const shouldStrip =
      (afterHeader.length > 0 && tailLooksLikeList && restLooksLikeList) ||
      (headerTailStartsList && restLooksLikeList);

    if (shouldStrip) {
      return lines.slice(0, index).join('\n').replace(/\s+$/, '');
    }
  }

  return text;
}
