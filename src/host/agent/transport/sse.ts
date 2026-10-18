/**
 * 极简 SSE 解析：把 `text/event-stream` 响应体拆成 `data` 事件。
 *
 * 只覆盖模型返回需要的部分：`data:` 行、可选 `event:` 行、空行分帧、注释行忽略。
 */

export interface SseEvent {
  event: string;
  data: string;
}

export interface ReadSseOptions {
  /** 两条事件之间的最长等待时间；超时按网络失败处理（思考模式流式可能间隔较长） */
  idleTimeoutMs?: number;
}

function abortError(): DOMException {
  return new DOMException('请求已中止', 'AbortError');
}

async function readChunk(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  idleTimeoutMs?: number,
): Promise<ReadableStreamReadResult<Uint8Array>> {
  if (!idleTimeoutMs) return reader.read();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`连接超过 ${Math.round(idleTimeoutMs / 1000)} 秒没有收到数据`)),
      idleTimeoutMs,
    );
  });
  try {
    return await Promise.race([reader.read(), timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function* readSse(
  body: ReadableStream<Uint8Array>,
  signal: AbortSignal,
  options: ReadSseOptions = {},
): AsyncGenerator<SseEvent, void, void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let dataLines: string[] = [];
  let eventName = '';

  const flushEvent = (): SseEvent | null => {
    if (!dataLines.length && !eventName) return null;
    const event: SseEvent = { event: eventName || 'message', data: dataLines.join('\n') };
    dataLines = [];
    eventName = '';
    return event;
  };

  try {
    for (;;) {
      if (signal.aborted) throw abortError();
      const readResult = await readChunk(reader, options.idleTimeoutMs);
      if (readResult.done) break;

      buffer += decoder.decode(readResult.value, { stream: true });

      let newlineIndex = buffer.indexOf('\n');
      while (newlineIndex >= 0) {
        const rawLine = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;

        if (line === '') {
          const event = flushEvent();
          if (event) yield event;
        } else if (line.startsWith(':')) {
          // 注释 / 心跳
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).replace(/^ /, ''));
        } else if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        }
        newlineIndex = buffer.indexOf('\n');
      }
    }

    if (buffer.length) {
      const line = buffer.endsWith('\r') ? buffer.slice(0, -1) : buffer;
      if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
    }
    const tail = flushEvent();
    if (tail) yield tail;
  } finally {
    try {
      await reader.cancel();
    } catch {
      // reader 已因 abort 关闭
    }
  }
}

/** 读一个错误响应体，最多取若干字符用于提示 */
export async function readErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    const trimmed = text.trim();
    if (!trimmed) return '';
    try {
      const parsed = JSON.parse(trimmed) as {
        error?: { message?: string } | string;
        message?: string;
      };
      if (typeof parsed.error === 'string') return parsed.error;
      if (parsed.error && typeof parsed.error.message === 'string') return parsed.error.message;
      if (typeof parsed.message === 'string') return parsed.message;
    } catch {
      // 非 JSON，直接用原文
    }
    return trimmed.length > 400 ? `${trimmed.slice(0, 400)}…` : trimmed;
  } catch {
    return '';
  }
}
