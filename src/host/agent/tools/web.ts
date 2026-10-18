/**
 * 宿主内置网页能力：Tavily 搜索 + 网页正文抓取。
 *
 * 浏览器 / Tauri WebView 里直接 fetch 任意站点会被 CORS 拦，因此 `web.fetch`：
 * 1. 先直接 fetch；
 * 2. 失败后退到 Jina Reader（`r.jina.ai`，返回已转好的纯文本，CORS 允许浏览器直连）；
 * 3. 仍失败则把两次错误原样抛给模型。
 */

import type { WebPage, WebSearchResult } from '../types';

const TAVILY_ENDPOINT = 'https://api.tavily.com/search';
const JINA_READER_PREFIX = 'https://r.jina.ai/';

/** 单条搜索结果保留的正文字符数：按“工具结果预算 / 结果条数”估算（10K tokens / 5 条 ≈ 2K token） */
const SEARCH_RESULT_CONTENT_CHARS = 2_000;

/** web.fetch 返回正文的字符上限（同一工具结果预算） */
const PAGE_CONTENT_CHARS = 20_000;

/** 返回给模型的搜索结果条数：结果越多，单条能带的正文越少；5 条覆盖常见问答需要 */
export const SEARCH_RESULT_LIMIT = 5;

interface TavilyResponse {
  answer?: string;
  results?: Array<{ title?: string; url?: string; content?: string; score?: number }>;
}

export async function tavilySearch(
  apiKey: string,
  query: string,
  signal: AbortSignal,
): Promise<WebSearchResult[]> {
  if (!apiKey.trim()) {
    throw new Error('未配置搜索服务：请在设置 → 联网搜索里填 Tavily API Key');
  }

  const response = await fetch(TAVILY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'basic',
      include_answer: false,
      max_results: SEARCH_RESULT_LIMIT,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const detail = text.trim().slice(0, 300);
    throw new Error(
      `Tavily 搜索失败（HTTP ${response.status}）${detail ? `：${detail}` : ''}`,
    );
  }

  const payload = (await response.json()) as TavilyResponse;
  const results = Array.isArray(payload.results) ? payload.results : [];
  return results
    .filter((item) => typeof item.url === 'string' && item.url)
    .map((item) => ({
      title: (item.title ?? item.url ?? '未命名结果').trim(),
      url: item.url as string,
      content: (item.content ?? '').replace(/\s+/g, ' ').trim().slice(0, SEARCH_RESULT_CONTENT_CHARS),
    }));
}

function stripHtml(html: string, pageUrl: string): { title: string; text: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  for (const selector of ['script', 'style', 'noscript', 'svg', 'iframe', 'nav', 'header', 'footer', 'aside', 'form', 'button']) {
    doc.querySelectorAll(selector).forEach((node) => node.remove());
  }
  const title = (doc.title || doc.querySelector('h1')?.textContent || pageUrl).replace(/\s+/g, ' ').trim();
  const text = (doc.body?.innerText || doc.body?.textContent || '')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { title, text };
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error(`web.fetch 只接受 http/https 链接，收到：${trimmed}`);
  }
  return trimmed;
}

export async function fetchPageText(
  rawUrl: string,
  signal: AbortSignal,
): Promise<WebPage> {
  const url = normalizeUrl(rawUrl);
  let directError: unknown = null;

  try {
    const response = await fetch(url, {
      signal,
      headers: { Accept: 'text/html,text/plain;q=0.9,*/*;q=0.5' },
    });
    if (response.ok) {
      const contentType = response.headers.get('content-type') ?? '';
      const raw = await response.text();
      const page = contentType.includes('html')
        ? stripHtml(raw, url)
        : { title: url, text: raw.replace(/\n{3,}/g, '\n\n').trim() };
      return clipPage(url, page.title, page.text);
    }
    directError = new Error(`HTTP ${response.status}`);
  } catch (error) {
    directError = error;
  }

  if ((directError as { name?: string } | null)?.name === 'AbortError') throw directError;

  // CORS / 403 等场景：交给 Jina Reader 抓正文
  try {
    const readerResponse = await fetch(`${JINA_READER_PREFIX}${url}`, { signal });
    if (!readerResponse.ok) {
      throw new Error(`Reader HTTP ${readerResponse.status}`);
    }
    const text = await readerResponse.text();
    const firstLine = text.split('\n').find((line) => line.trim()) ?? url;
    const title = firstLine.replace(/^Title:\s*/i, '').trim() || url;
    const body = text.replace(/^Title:.*$/im, '').replace(/^URL Source:.*$/im, '').trim();
    return clipPage(url, title, body);
  } catch (readerError) {
    const message = directError instanceof Error ? directError.message : String(directError);
    throw new Error(
      `抓取网页失败：${message}${readerError instanceof Error ? `；备用 Reader：${readerError.message}` : ''}`,
    );
  }
}

function clipPage(url: string, title: string, text: string): WebPage {
  const truncated = text.length > PAGE_CONTENT_CHARS;
  return {
    url,
    title,
    content: truncated ? `${text.slice(0, PAGE_CONTENT_CHARS)}\n…（正文已截断）` : text,
    truncated,
  };
}

/** system.time 的返回值 */
export function readSystemTime(): {
  iso: string;
  local: string;
  date: string;
  weekday: string;
  timeZone: string;
} {
  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '本地时区';
  return {
    iso: now.toISOString(),
    local: now.toLocaleString('zh-CN', { hour12: false }),
    date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    weekday: now.toLocaleDateString('zh-CN', { weekday: 'long' }),
    timeZone,
  };
}
