/**
 * 「欣赏壁纸」说明卡的一次性提示词。改这里的词就改 `PROMPT_VERSION`，
 * 缓存键随版本变，旧条目自然 miss（不做迁移、不删数据）。
 *
 * 与 `transport/prompt.ts`（日常对话系统提示）无关：那份是插件工具 + 人格，
 * 这份只干一件事——先联网搜这张图，再用两句话说明它。
 */

import type { ChatContentPart, ChatRequestMessage } from '../types';
import type { WallpaperNoteInput } from './types';

/** 提示词版本：进缓存键。改 prompt 文案 / 输出规则都要改这里（v3：多模态看图 + 200 字 + pro/深度思考） */
export const PROMPT_VERSION = 'v3';

/** 市场缺省值：`market` 为空时用它拼缓存键与请求文案 */
export const DEFAULT_MARKET = 'zh-CN';

/**
 * 系统消息。
 *
 * 输出约束写死在提示词里（简体中文 / 2–4 句 / 建议 ≤200 字 / 无 Markdown / 无套话 /
 * 无来源旁白），长度只是提示词层面的美观约束；客户端会再校验语言与来源旁白
 * （`sanitize.ts` 的 `detectNoteViolation`）——模型不听话时以客户端为准，命中校验即整条丢弃。
 */
export const SYSTEM_PROMPT = `你在为一台平板桌面的「今日必应壁纸」写一段说明，读者只想用几句话知道这是什么地方、什么动物或什么事。

你会同时收到这张壁纸的图片，以及必应给的标题、版权串和日期。先仔细看图片，再联网搜索核实画面内容：调用 web_search 工具，用标题、地点、拍摄对象组合成关键词检索，确认这张图是什么之后才开始写。搜索只是你自己的准备工作，说明里不要提到搜索、资料、来源这些字眼。

输出规则：
1. 正文只用简体中文。地名、物种等专有名词可以保留原文（例如 Yellowstone National Park、Canis lupus），但禁止英文句子、英文段落或任何用英文写的正文；除专有名词外不要出现英语。
2. 禁止任何语言、任何形式的来源旁白：中文不写「根据搜索结果」「资料显示」「据检索」「我查到」「据报道」，英文不写 According to、search results、based on sources 之类；不列来源、不写作者署名、不解释你是怎么查到的。
3. 只输出一段纯文本，2 到 4 句话，整段不超过 200 个字符。
4. 不分点、不换行、不加标题、不使用任何 Markdown 标记（不用 #、*、-、反引号、链接、加粗）。
5. 不以「这幅图展示了」「可以看到」「图中」这类套话开头或穿插，直接陈述画面里有什么、在哪里、为什么值得看。
6. 查不到的具体细节直接略过，只写查得到的事实，宁短不长；不确定的物种、地名一律不写。
7. 不输出表情符号，不用引号包住整段文字，不附加任何解释、前缀或后缀。`;

/**
 * 用户消息：把必应给的元数据摆清楚。
 *
 * 空字段写成「（无）」，避免模型把空字符串当内容去联想。
 */
export function buildUserMessage(input: WallpaperNoteInput): string {
  const market = input.market.trim() || DEFAULT_MARKET;
  const date = input.date.trim() || '（无）';
  const title = input.title.trim() || '（无）';
  const copyright = input.copyright.trim() || '（无）';
  return [
    `日期：${date}`,
    `市场：${market}`,
    `标题：${title}`,
    `版权串：${copyright}`,
    '',
    '请先看附上的壁纸图片，再联网搜索核实画面内容与地点，按输出规则写一段说明。',
  ].join('\n');
}

/** 一次性会话只有两条消息：system + user（没有历史、没有工具结果回填） */
export function buildMessages(input: WallpaperNoteInput): ChatRequestMessage[] {
  const imageUrl = input.imageUrl.trim();
  const userMessage = buildUserMessage(input);
  if (!imageUrl) {
    return [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ];
  }
  const parts: ChatContentPart[] = [
    { type: 'image_url', image_url: { url: imageUrl } },
    { type: 'text', text: userMessage },
  ];
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: parts },
  ];
}
