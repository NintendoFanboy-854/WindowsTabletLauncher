/**
 * 客户端兜底：模型不一定守规矩，落库前统一降级成「一段纯文本」，
 * 再用 `detectNoteViolation` 做语言与来源硬校验（不合格的输出整条丢弃）。
 *
 * 处理顺序：去 Markdown → 压平成一个段落 → 去包裹引号。
 * 长度（提示词里建议 ≤200 字）是**提示词层面的美观约束**：客户端不做任何截断，
 * 也不按长度判失败——写多写少由模型在提示词下自行把握。
 */

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

/**
 * 生成文本 → 可落库的说明。
 * 空字符串表示这条输出不可用（调用方按失败处理，不写成功记录）。
 *
 * 只做格式降级（Markdown/换行/包裹引号），**不截断**；长度完全交给提示词约束。
 */
export function normalizeNoteText(raw: string): string {
  return flattenToParagraph(stripMarkup(raw)).replace(WRAP_QUOTES, '').trim();
}

/* ------------------------------------------------------------------ */
/* 语言与来源硬校验（落库前最后一道闸门）                                */
/* ------------------------------------------------------------------ */

/**
 * 说明卡输出不合格的两种原因：
 * - `non-chinese`：正文不是简体中文（整段英文、英文占主导、几乎没有汉字）；
 * - `source-narration`：写了「根据搜索结果」「According to」这类来源旁白。
 * 调用方命中任意一种都按失败处理：不落库、不写成功记录。
 */
export type NoteViolation = 'non-chinese' | 'source-narration';

/**
 * 合法说明的汉字下限。
 *
 * 正常 2–3 句中文说明至少有 30 个汉字；这里取 12 是为了容忍
 * 「黄石公园的灰狼在雪原巡行。」这类短但合法的句子。
 * 真正的防线是「汉字数为 0 的纯英文 / 纯符号输出一律失败」。
 */
export const MIN_CJK_CHARS = 12;

/**
 * 拉丁字母占「汉字 + 拉丁字母」总数的上限。
 *
 * 说明里允许保留专有名词原文（Yellowstone National Park、Canis lupus），
 * 但正文必须是中文：拉丁字母超过六成时，这段文字已经不是中文说明。
 * 取 0.65 而不是 0.5，是因为「中文短句 + 完整英文地名」实测能到六成左右，
 * 收紧会误杀合法说明；「中文零星 + 一整段英文」由下面的词串上限兜住。
 */
export const MAX_LATIN_RATIO = 0.65;

/**
 * 连续英文单词串的长度上限（词与词之间只允许空白）。
 *
 * 4 个词以内放行：Yellowstone National Park 这类专有名词通常 3 个词；
 * 5 个词起基本是英文句子片段（the image shows a gray wolf），拒。
 * 单个英文词（如学名 Canis lupus 共 2 个词）不受此限。
 */
export const MAX_LATIN_WORDS_RUN = 4;

/**
 * 来源旁白规则：任何语言、任何位置的「我查了 / 资料说 / According to」
 * 都是来源叙述，不是画面描述。
 *
 * 中英文分开写，只认这些固定的旁白句式，避免误伤正常描述
 * （「资料馆」「搜索者」这类词不会命中任何一条）。
 */
const SOURCE_NARRATION_PATTERNS: readonly RegExp[] = [
  // 中文：根据搜索结果 / 根据资料 / 根据相关报道
  /(?:根据|依据|按照)(?:搜索|检索|查询|网络|网上|公开|相关)?(?:结果|资料|信息|内容|报道|来源)/,
  // 中文：资料显示 / 信息显示 / 搜索结果显示 / 检索结果表明
  /(?:资料|信息|来源|数据|报道|搜索|检索|查询)(?:结果)?(?:显示|表明|指出|发现|查到)/,
  // 中文：据检索 / 据搜索结果 / 据资料 / 据报道 / 据记载
  /据(?:搜索|检索|查询|资料|记载|报道|介绍|悉|了解)/,
  // 中文：我查到 / 我搜到 / 我找到 / 我检索到
  /我(?:查到|搜到|找到|检索到|搜索到)/,
  // 中文：参考来源 / 参考资料 / 来源：
  /(?:参考|引用)(?:来源|资料|文献)/,
  /来源\s*[:：]/,
  // 英文：According to / based on sources / search results / ...
  /\baccording to\b/i,
  /\bbased on (?:the |my |our )?(?:search|search results|sources?|information|data|reports?|web)\b/i,
  /\bsearch results?\b/i,
  /\b(?:web|internet|online) (?:search|sources?)\b/i,
  /\b(?:the |my |our )?(?:search|research) (?:shows?|showed|indicates?|suggests?|found|revealed)\b/i,
  /\b(?:sources?|results?) (?:show|shows|indicate|indicates|suggest|suggests|say|says)\b/i,
  /\bi (?:searched|found|looked (?:it )?up|checked)\b/i,
  /\b(?:retrieved|sourced) from\b/i,
  /\bas (?:reported|shown) (?:by|in)\b/i,
];

/** 汉字个数（只数汉脚本字符，不含标点与数字） */
function countHanChars(text: string): number {
  return text.match(/\p{Script=Han}/gu)?.length ?? 0;
}

/** 拉丁字母个数（只数 ASCII 字母，数字与标点不计入占比） */
function countLatinLetters(text: string): number {
  return text.match(/[A-Za-z]/g)?.length ?? 0;
}

/** 连续英文词串的最大长度：词间只有空白才算同一串，中文与标点都会打断 */
function longestLatinWordRun(text: string): number {
  let longest = 0;
  let current = 0;
  let lastEnd = -1;
  for (const match of text.matchAll(/[A-Za-z][A-Za-z'’]*/g)) {
    const start = match.index ?? 0;
    const sameRun = lastEnd >= 0 && /^\s+$/.test(text.slice(lastEnd, start));
    current = sameRun ? current + 1 : 1;
    if (current > longest) longest = current;
    lastEnd = start + match[0].length;
  }
  return longest;
}

function hasSourceNarration(text: string): boolean {
  return SOURCE_NARRATION_PATTERNS.some((pattern) => pattern.test(text));
}

/** 是不是「不像中文说明」：汉字太少、拉丁字母占比过高、或整串英文太长 */
function looksNonChinese(text: string, hanChars: number): boolean {
  if (hanChars < MIN_CJK_CHARS) return true;
  const latinLetters = countLatinLetters(text);
  const totalLetters = hanChars + latinLetters;
  if (totalLetters > 0 && latinLetters / totalLetters > MAX_LATIN_RATIO) return true;
  return longestLatinWordRun(text) > MAX_LATIN_WORDS_RUN;
}

/**
 * 检测一段（通常是 `normalizeNoteText` 产物）说明是否可用；返回 null 表示通过。
 *
 * 先查来源旁白再查语言：一段英文旁白（According to search results…）两种都犯，
 * 先报「旁白」更能指导重试原因。`generate.ts` 命中后按失败处理，不落库。
 */
export function detectNoteViolation(text: string): NoteViolation | null {
  if (hasSourceNarration(text)) return 'source-narration';
  if (looksNonChinese(text, countHanChars(text))) return 'non-chinese';
  return null;
}
