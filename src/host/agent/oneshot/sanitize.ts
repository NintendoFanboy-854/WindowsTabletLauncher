/**
 * 客户端兜底：模型不一定守规矩，落库前统一降级成「一段纯文本、≤120 字符」。
 *
 * 处理顺序：去 Markdown → 压平成一个段落 → 去包裹引号 → 按句子边界截断。
 * 提示词里的限制是软约束，这里的处理是硬约束；两者对不上时以本文件为准。
 */

/** 说明卡的字数上限（含标点，按 Unicode 码点算） */
export const MAX_NOTE_CHARS = 120;

/** 截断时优先在这些字符处收尾（句末） */
const SENTENCE_STOPS = '。！？!?';

/** 句末找不到时退而求其次（分句） */
const CLAUSE_STOPS = '，、；：,;:';

/** 截断后至少保留这么多字符，否则宁可硬切也不留一个碎片 */
const MIN_KEEP_CHARS = 24;

/** 包裹在整段外面的引号/书名号，去掉不影响语义 */
const WRAP_QUOTES = /^[\s"'“”‘’「」『』]+|[\s"'“”‘’「」『』]+$/g;

/** 行尾是否已经有一个收尾标点（用来判断要不要补句号） */
const LINE_END_STOPS = /[。！？!?，,；;：:]$/;

/**
 * 去掉所有 Markdown 标记与代码块，只留下文字。
 *
 * 标题行、列表行按「独立句子」处理：先去掉标记，缺句号就补一个。
 * 这样压平后不会出现「黄石雪原两只灰狼在雪原上巡行」这种粘连——
 * 模型退回列表时，说明卡至少还能读成几句人话。
 */
function stripMarkup(raw: string): string {
  let text = raw.replace(/\r\n?/g, '\n');
  text = text.replace(/```[\s\S]*?(```|$)/g, ' ');
  text = text.replace(/`([^`]*)`/g, '$1');
  text = text.replace(/!\[[^\]]*]\([^)]*\)/g, '');
  text = text.replace(/\[([^\]]*)]\([^)]*\)/g, '$1');
  text = text.replace(/^\s*[-=]{3,}\s*$/gm, '');

  text = text
    .split('\n')
    .map((line) => {
      const isHeading = /^\s{0,3}#{1,6}\s+/.test(line);
      const isListItem = /^\s{0,3}([-*+]|\d{1,2}[.)])\s+/.test(line);
      // 去掉行首标记与行内强调符号：中文说明里不该出现这些符号
      let cleaned = line
        .replace(/^\s{0,3}#{1,6}\s*/, '')
        .replace(/^\s{0,3}>\s?/, '')
        .replace(/^\s{0,3}([-*+]|\d{1,2}[.)])\s+/, '')
        .replace(/[*_`#>~]+/g, '')
        .replace(/\|/g, ' ')
        .trim();
      if ((isHeading || isListItem) && cleaned && !LINE_END_STOPS.test(cleaned)) {
        cleaned += '。';
      }
      return cleaned;
    })
    .join('\n');

  return text;
}

/** 中文（含全角标点、CJK 标点）两侧不需要空格 */
const CJK_NEIGHBOR = '\\u3000-\\u303f\\u3400-\\u9fff\\uff00-\\uffef';

/** 只对 CJK 标点去前置空格：拉丁词与中文之间的空格是有意义的 */
const CJK_PUNCT = '。，、；：！？…—「」『』（）《》';

/** 压平成一段：中文之间不留空格，英文单词之间保留一个空格 */
function flattenToParagraph(raw: string): string {
  const cjkGap = new RegExp(`(?<=[${CJK_NEIGHBOR}])\\s+(?=[${CJK_NEIGHBOR}])`, 'g');
  const spaceBeforePunct = new RegExp(`\\s+(?=[${CJK_PUNCT}])`, 'g');
  return raw
    .replace(/\s*\n+\s*/g, ' ')
    .replace(cjkGap, '')
    .replace(spaceBeforePunct, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 超长时按句末 → 分句 → 硬切 的顺序截断 */
export function truncateNoteText(text: string, limit = MAX_NOTE_CHARS): string {
  const chars = Array.from(text);
  if (chars.length <= limit) return text;
  const head = chars.slice(0, limit);

  // 句末收尾：保留句号，读起来是完整的一句话
  for (let index = head.length - 1; index >= 0; index -= 1) {
    if (!SENTENCE_STOPS.includes(head[index])) continue;
    if (index + 1 < MIN_KEEP_CHARS) break;
    return head.slice(0, index + 1).join('').trim();
  }

  // 分句收尾：半句停在逗号上不好看，连逗号一起去掉
  for (let index = head.length - 1; index >= 0; index -= 1) {
    if (!CLAUSE_STOPS.includes(head[index])) continue;
    if (index < MIN_KEEP_CHARS) break;
    return head.slice(0, index).join('').trim();
  }

  return head
    .join('')
    .replace(/[，、；：,;:\s]+$/u, '')
    .trim();
}

/**
 * 生成文本 → 可落库的说明。
 * 空字符串表示这条输出不可用（调用方按失败处理，不写成功记录）。
 */
export function normalizeNoteText(raw: string): string {
  const flat = flattenToParagraph(stripMarkup(raw)).replace(WRAP_QUOTES, '').trim();
  return truncateNoteText(flat);
}
