/**
 * 离线 Mock 传输层：`?mock=1` 时用示例数据验证完整 UI 流程
 * （流式回复、原生联网搜索来源 chips、工具调用卡片、语音状态机、单条播报）。
 *
 * 它只模拟传输层：插件工具走 mock 的 listPluginTools/callPluginTool；
 * 联网搜索模拟 MiMo 原生 web_search 的 annotations / usage 事件，因此来源 chips 是真流程。
 * 语音：chat 请求的 content parts 里忽略 input_audio、返回固定回答；transcribe 返回固定文字；
 * synthesize 产出静音 PCM，只驱动播放状态机（不产生真实声音）。
 */

import type {
  AgentToolDecl,
  AgentTransport,
  ChatRequestMessage,
  ChatTurnRequest,
  ModelStreamEvent,
  SourceRef,
  ToolRunOptions,
} from '../types';

function abortError(): DOMException {
  return new DOMException('请求已中止', 'AbortError');
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const onAbort = () => {
      cleanup();
      reject(abortError());
    };
    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let index = 0;
  let size = 2;
  while (index < text.length) {
    chunks.push(text.slice(index, index + size));
    index += size;
    size = size === 2 ? 3 : size === 3 ? 5 : 4;
  }
  return chunks;
}

function lastUserContent(messages: ChatRequestMessage[]): { text: string; hasAudio: boolean } {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== 'user') continue;
    if (typeof message.content === 'string') return { text: message.content, hasAudio: false };
    // 本轮语音：mock 不解码音频，只把它当“用户在说话”的信号，并拼出 text part 备用
    let text = '';
    let hasAudio = false;
    for (const part of message.content) {
      if (part.type === 'text') text += part.text;
      else if (part.type === 'input_audio') hasAudio = true;
    }
    return { text, hasAudio };
  }
  return { text: '', hasAudio: false };
}

function lastToolOutcome(messages: ChatRequestMessage[]): {
  name: string;
  content: string;
} | null {
  let callName = '';
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === 'assistant' && message.tool_calls?.length) {
      callName = message.tool_calls[message.tool_calls.length - 1].function.name;
      break;
    }
  }
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === 'tool') {
      return { name: callName, content: message.content };
    }
  }
  return null;
}

function pickPluginTool(available: Set<string>, candidates: string[]): string | null {
  return candidates.find((name) => available.has(name)) ?? null;
}

/** 模拟 MiMo annotations：故意给 4 条，验证“首屏 3 条 + 折叠” */
const MOCK_SEARCH_SOURCES: SourceRef[] = [
  {
    url: 'https://mimo.mi.com/docs/zh-CN/updates/model',
    title: 'MiMo V2.6 系列模型更新：1M 上下文、128K 输出',
    siteName: 'mimo.mi.com',
    summary: 'MiMo V2.6 支持文本生成、全模态理解、深度思考、流式输出、函数调用、结构化输出和联网搜索。',
    publishTime: '2026-10-08',
    logoUrl: 'https://mimo.mi.com/favicon.ico',
  },
  {
    url: 'https://mimo.mi.com/docs/zh-CN/api/chat/openai-api',
    title: 'OpenAI Chat Completions API 兼容',
    siteName: 'mimo.mi.com',
    summary: '请求地址 https://api.xiaomimimo.com/v1/chat/completions，SSE 流式返回。',
  },
  {
    url: 'https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/text-generation/tool-calling/web-search',
    title: '联网搜索（web_search）使用指南',
    siteName: 'mimo.mi.com',
    summary: 'tools 里加 { type: "web_search", max_keyword, force_search, limit }，来源通过 annotations 返回。',
  },
  {
    url: 'https://platform.xiaomimimo.com/#/console/plugin',
    title: 'MiMo 控制台 · 插件管理',
    siteName: 'platform.xiaomimimo.com',
    summary: '在控制台开通 Web Search Plugin 后，请求才允许携带 web_search 工具。',
  },
];

const MOCK_PLUGIN_TOOLS: AgentToolDecl[] = [
  {
    name: 'clock.now',
    description: '读取当前时间、日期和星期',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'todo.today',
    description: '列出今天的待办事项',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'pomodoro.start',
    description: '启动一个番茄钟专注计时',
    parameters: {
      type: 'object',
      properties: { minutes: { type: 'number', description: '专注时长（分钟）' } },
      required: ['minutes'],
      additionalProperties: false,
    },
  },
  {
    name: 'weather.queryPlace',
    description: '查询指定城市的天气',
    parameters: {
      type: 'object',
      properties: { place: { type: 'string', description: '城市名' } },
      required: ['place'],
      additionalProperties: false,
    },
  },
];

export class MockTransport implements AgentTransport {
  readonly kind = 'mock' as const;

  isConfigured(): boolean {
    return true;
  }

  async streamChat(
    request: ChatTurnRequest,
    onEvent: (event: ModelStreamEvent) => void,
  ): Promise<void> {
    const { signal } = request;
    const { text: userText, hasAudio } = lastUserContent(request.messages);
    const available = new Set(request.tools.map((tool) => tool.function.name));
    const previousTool = lastToolOutcome(request.messages);

    await sleep(240, signal);

    if (request.thinking) {
      for (const chunk of chunkText('先判断这个问题是否需要工具，再组织一个简短的中文回答。')) {
        await sleep(12, signal);
        onEvent({ type: 'reasoning', text: chunk });
      }
    }

    // 语音轮次（本轮请求带 input_audio）：mock 不解码音频，返回固定回答，
    // 保证 mock 下“录音 → 停止 → 转写 → 回答 → 自动播报”整条链路可测。
    if (hasAudio) {
      const voiceAnswer =
        '我听到你的语音了，今天的待办有两件：给客户回邮件、整理周三评审材料。需要的话我可以帮你启动一个番茄钟。';
      for (const chunk of chunkText(voiceAnswer)) {
        await sleep(14, signal);
        onEvent({ type: 'content', text: chunk });
      }
      onEvent({ type: 'finish', reason: 'stop' });
      return;
    }

    // 第二轮：已经有插件工具结果，生成最终回答
    if (previousTool) {
      const answer = this.composeAnswer(previousTool.name, previousTool.content);
      for (const chunk of chunkText(answer)) {
        await sleep(14, signal);
        onEvent({ type: 'content', text: chunk });
      }
      onEvent({ type: 'finish', reason: 'stop' });
      return;
    }

    // 联网搜索：模拟 MiMo 原生 web_search —— 首个数据包带来源，再流式输出总结
    const wantsSearch = /搜索|最新|新闻|价格|查一下|搜一下|实时/.test(userText);
    if (wantsSearch) {
      await sleep(260, signal);
      onEvent({ type: 'sources', sources: MOCK_SEARCH_SOURCES });
      onEvent({ type: 'usage', webSearchUsage: { toolUsage: 1, pageUsage: 4 } });
      const answer = `我联网查了一下「${userText.replace(/\s+/g, ' ').slice(0, 24)}」。MiMo V2.6 三个型号都支持 1M 上下文和 128K 输出，深度思考、函数调用、流式输出、联网搜索都已支持。详情可以看 [MiMo V2.6 系列模型更新](https://mimo.mi.com/docs/zh-CN/updates/model)。`;
      for (const chunk of chunkText(answer)) {
        await sleep(14, signal);
        onEvent({ type: 'content', text: chunk });
      }
      onEvent({ type: 'finish', reason: 'stop' });
      return;
    }

    // 插件工具：按关键词决定调用哪个
    const wantsTime = /几点|时间|日期|星期/.test(userText);
    const wantsTodo = /待办|任务|日程|今天要做/.test(userText);
    const wantsPomodoro = /番茄|专注/.test(userText);
    const wantsWeather = /天气|气温|下雨/.test(userText);

    const toolName = wantsTime
      ? pickPluginTool(available, ['system__time'])
      : wantsTodo
        ? pickPluginTool(available, ['todo__today'])
        : wantsPomodoro
          ? pickPluginTool(available, ['pomodoro__start'])
          : wantsWeather
            ? pickPluginTool(available, ['weather__queryPlace'])
            : null;

    if (toolName) {
      const toolCall = (args: unknown) => {
        onEvent({
          type: 'tool_call',
          call: { id: `mock-${Date.now()}`, name: toolName, args },
        });
      };
      if (toolName === 'pomodoro__start') toolCall({ minutes: 25 });
      else if (toolName === 'weather__queryPlace') toolCall({ place: '上海' });
      else toolCall({});
      onEvent({ type: 'finish', reason: 'tool_calls' });
      return;
    }

    const fallback = `我是运行在示例数据模式下的桌面 Agent。你刚才说的是「${userText.slice(0, 40)}」。在真实模式里，我会先判断要不要调用插件工具或联网搜索，再用 MiMo V2.6 流式回答。现在可以在设置里填 MiMo API Key 切到真实模型。`;
    for (const chunk of chunkText(fallback)) {
      await sleep(14, signal);
      onEvent({ type: 'content', text: chunk });
    }
    onEvent({ type: 'finish', reason: 'stop' });
  }

  private composeAnswer(toolName: string, toolContent: string): string {
    if (toolName === 'system__time') {
      try {
        const parsed = JSON.parse(toolContent) as { local?: string; weekday?: string };
        return `现在是 ${parsed.local ?? new Date().toLocaleString('zh-CN')}，${parsed.weekday ?? ''}。需要我顺便看一下今天的待办吗？`;
      } catch {
        return `现在的时间是 ${new Date().toLocaleString('zh-CN')}。`;
      }
    }
    if (toolName === 'todo__today') {
      return '今天有 2 件待办：给客户回邮件、整理周三评审材料。有需要的话我可以启动一个番茄钟，或者把它们加到明天的清单里。';
    }
    if (toolName === 'pomodoro__start') {
      return '番茄钟已经开始了，25 分钟专注，时间到了我会提醒你。';
    }
    if (toolName === 'weather__queryPlace') {
      return '上海今天多云转晴，18–24°C，风力不大，适合开窗。要出门的话傍晚带件薄外套。';
    }
    return `工具 ${toolName} 已经执行完了，结果是：${toolContent.slice(0, 120)}。`;
  }

  async transcribe(_wav: Blob, options: ToolRunOptions): Promise<string> {
    // 固定转写文本，保证 mock 语音链路完整可测（WAV 参数在 mock 下不读取）
    await sleep(650, options.signal);
    return '帮我看看今天的待办';
  }

  async *synthesize(
    text: string,
    options: ToolRunOptions & { voice: string; rate: number },
  ): AsyncIterable<Int16Array> {
    // 静音占位：只驱动播放状态机（波形 / 连续朗读 / 停止），不产生真实声音
    const chunks = Math.max(1, Math.min(24, Math.ceil(text.length / 8)));
    const silence = new Int16Array(2400); // 100ms @ 24kHz
    for (let index = 0; index < chunks; index += 1) {
      await sleep(90, options.signal);
      yield silence;
    }
  }

  listPluginTools(): AgentToolDecl[] {
    return MOCK_PLUGIN_TOOLS;
  }

  async callPluginTool(name: string, args: unknown, options: ToolRunOptions): Promise<unknown> {
    await sleep(360, options.signal);
    switch (name) {
      case 'clock.now':
        return {
          iso: new Date().toISOString(),
          local: new Date().toLocaleString('zh-CN', { hour12: false }),
          weekday: new Date().toLocaleDateString('zh-CN', { weekday: 'long' }),
        };
      case 'todo.today':
        return {
          total: 2,
          items: [
            { title: '给客户回邮件', done: false },
            { title: '整理周三评审材料', done: false },
          ],
        };
      case 'pomodoro.start':
        return { started: true, minutes: (args as { minutes?: number } | null)?.minutes ?? 25 };
      case 'weather.queryPlace':
        return {
          place: (args as { place?: string } | null)?.place ?? '上海',
          condition: '多云转晴',
          tempC: 23,
          low: 18,
          high: 24,
        };
      default:
        throw new Error(`Mock 插件没有工具 ${name}`);
    }
  }
}
