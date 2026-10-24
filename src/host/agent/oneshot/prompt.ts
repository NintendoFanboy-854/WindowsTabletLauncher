/**
 * 「欣赏壁纸」说明卡的一次性提示词。改这里的词就改 `PROMPT_VERSION`，
 * 缓存键随版本变，旧条目自然 miss（不做迁移、不删数据）。
 *
 * 与 `transport/prompt.ts`（日常对话系统提示）无关：那份是插件工具 + 人格，
 * 这份只干一件事——先联网搜这张图，再用两句话说明它。
 */

import type { ChatRequestMessage } from '../types';
import type { WallpaperNoteInput } from './types';

/** 提示词版本：进缓存键。改 prompt 文案 / 输出规则都要改这里 */
export const PROMPT_VERSION = 'v1';

/** 市场缺省值：`market` 为空时用它拼缓存键与请求文案 */
export const DEFAULT_MARKET = 'zh-CN';

/**
 * 系统消息。
 *
 * 输出约束写死在提示词里（2–3 句 / ≤120 字 / 无 Markdown / 无套话），
 * 客户端仍会再降级一次（`sanitize.ts`）——模型不听话时以客户端为准。
 */
export const SYSTEM_PROMPT = `你在为一台平板桌面的「今日必应壁纸」写一段说明，读者只想用两句话知道这是什么地方、什么动物或什么事。

你看到的只有壁纸标题、版权串和日期，这些信息不足以说明画面内容，所以必须先联网搜索：调用 web_search 工具，用标题、地点、拍摄对象组合成关键词检索，确认这张图是什么之后才开始写。

输出规则：
1. 只输出一段纯文本，2 到 3 句话，整段不超过 120 个字符。
2. 不分点、不换行、不加标题、不使用任何 Markdown 标记（不用 #、*、-、反引号、链接、加粗）。
3. 不以「这幅图展示了」「可以看到」「图中」这类套话开头或穿插，直接陈述画面里有什么、在哪里、为什么值得看。
4. 不写「根据搜索结果」「资料显示」这类来源旁白，不列来源，不写作者署名。
5. 查不到的具体细节直接略过，只写查得到的事实，宁短不长；不确定的物种、地名一律不写。
6. 不输出表情符号，不用引号包住整段文字，不附加任何解释、前缀或后缀。`;

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
    '请先联网搜索这张壁纸的内容，再按输出规则写一段说明。',
  ].join('\n');
}

/** 一次性会话只有两条消息：system + user（没有历史、没有工具结果回填） */
export function buildMessages(input: WallpaperNoteInput): ChatRequestMessage[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserMessage(input) },
  ];
}
