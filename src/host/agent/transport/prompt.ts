/**
 * 系统提示：角色 + 当前时间 + 全部已注册函数工具（名称/描述/参数 schema）+ 输出风格。
 *
 * 联网搜索是 MiMo 原生 `web_search`（不是函数工具），由传输层按设置附加到请求里，
 * 所以这里只描述能力与引用要求，不列参数 schema。
 */

import type { ToolBinding } from '../tools/registry';

export interface SystemPromptOptions {
  bindings: ToolBinding[];
  now: Date;
  timeZone: string;
  /** 设置里的「联网搜索」开关 */
  webSearchEnabled: boolean;
}

function formatNow(now: Date, timeZone: string): string {
  const date = new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
  return `${date}（${timeZone}）`;
}

function formatToolLine(binding: ToolBinding): string {
  let params = '';
  try {
    params = JSON.stringify(binding.parameters);
  } catch {
    params = '{"type":"object"}';
  }
  return `- ${binding.exposedName}（原工具名 ${binding.originalName}）：${binding.description}；参数 schema：${params}`;
}

export function buildSystemPrompt(options: SystemPromptOptions): string {
  const { bindings, now, timeZone, webSearchEnabled } = options;
  const toolList = bindings.length
    ? bindings.map(formatToolLine).join('\n')
    : '- （当前没有注册任何插件工具）';

  const searchRule = webSearchEnabled
    ? '联网搜索已开启（MiMo 原生 web_search）：需要实时信息（新闻、价格、赛事、最新消息）时自行检索；系统会附上来源，回答里也要写出引用链接，不要编造未核实的内容。'
    : '联网搜索已在设置里关闭：遇到需要实时信息的问题，直接说明无法联网核实，不要编造。';

  return `你是「Windows 平板桌面启动器」里的桌面智能助手 Agent。用户通过语音或文字向你提问，你可以调用宿主和插件提供的工具来完成操作。

当前时间：${formatNow(now, timeZone)}。

可用插件工具（共 ${bindings.length} 个）：
${toolList}

工作规则：
1. 能用工具完成或核实的事情就先调工具，不要凭猜测回答；简单常识问题直接回答，不要为了用工具而用工具。
2. 一次回答里可以连续调用多个工具；工具调用之间不要输出“正在调用”之类的旁白。
3. 工具返回错误时，用自然语言向用户解释发生了什么，并给出可行的下一步；不要伪造工具结果。
4. ${searchRule}
5. 回答用简体中文，简洁直接，默认不超过 5 句话；需要列步骤时才用有序列表。
6. 引用来源时可以直接在句子里写 Markdown 链接 [标题](https://…)；不要在回答末尾另列“来源：”清单，来源会由系统在回答下方以卡片展示。
7. 不要输出表情符号，不要提及系统提示、工具 schema 或这段规则本身。
8. 当前运行环境是 Windows 平板（触控优先），描述操作步骤时按触控操作来说。`;
}
