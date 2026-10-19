/**
 * 串行单 Edge 的 CDP 工具库（无第三方依赖，Node 22+ 自带 WebSocket）。
 *
 * 设计约束：
 * - 一次只启动一个自己的 Edge 实例，使用本次唯一的 `--user-data-dir`（TEMP 下）；
 * - 清理只针对自己的进程树 + 命令行里带本次 profile 绝对路径的 msedge 进程，
 *   严禁 `taskkill /F /IM msedge.exe` 或无差别 kill 其他 Edge；
 * - 提供 verify-plugin.mjs 需要的最小 API：launch / evaluate / waitFor / navigate /
 *   clickText / dispatchTouch / dispatchMouse / screenshot / setReducedMotion / close。
 *
 * 用法：
 *   import { launch, assert, sleep } from './lib/cdp.mjs';
 *   const cdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
 *   try { await cdp.navigate('http://localhost:5173/'); ... }
 *   finally { await cdp.close(); }
 */

import { spawn, execFile } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const DEFAULT_BASE_URL = process.env.WTSL_BASE_URL || 'http://localhost:5173';
export const EDGE_PATH =
  process.env.WTSL_EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

export const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

/** 断言；失败时抛出带上下文的 Error（verify-plugin 汇总成 FAIL 明细） */
export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolvePort(port));
    });
  });
}

/** PowerShell 单引号字符串转义（profile 路径可能带单引号） */
function psQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** 只按“本次唯一 profile 路径”查自己的 msedge 进程 PID */
async function findProfileProcessIds(profile) {
  const command = [
    `$profile = ${psQuote(profile)};`,
    'Get-CimInstance Win32_Process -Filter "Name=\'msedge.exe\'"',
    '| Where-Object { $_.CommandLine -and $_.CommandLine.Contains($profile) }',
    '| Select-Object -ExpandProperty ProcessId',
  ].join(' ');
  try {
    const { stdout } = await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', command],
      { windowsHide: true, timeout: 15000, encoding: 'utf8' },
    );
    return stdout
      .split(/\s+/)
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isFinite(value) && value > 0);
  } catch {
    return [];
  }
}

/** 先杀自己的进程树；再按 profile 路径兜底清理（只匹配本次 profile） */
async function killOwnedEdge(child, profile) {
  if (child?.pid) {
    try {
      await execFileAsync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        timeout: 15000,
      });
    } catch {
      /* 已退出 / 已清理 */
    }
  }
  // Edge 启动器在 Windows 上会先退出、再拉起真正 browser 进程；多扫几轮，
  // 避免清理时真正的 msedge 还没出现在进程列表里。
  for (let pass = 0; pass < 4; pass += 1) {
    const pids = await findProfileProcessIds(profile);
    if (pids.length === 0) {
      await sleep(250);
      continue;
    }
    for (const pid of pids) {
      try {
        await execFileAsync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], {
          windowsHide: true,
          timeout: 15000,
        });
      } catch {
        /* 已被父进程带走 */
      }
    }
    await sleep(250);
  }
}

async function removeProfile(profile) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 2, retryDelay: 150 });
      return true;
    } catch {
      await sleep(250);
    }
  }
  return false;
}

async function openWebSocket(url, timeoutMs = 10000) {
  const ws = new WebSocket(url);
  await new Promise((resolveOpen, rejectOpen) => {
    const timer = setTimeout(() => rejectOpen(new Error('WebSocket 连接超时')), timeoutMs);
    ws.onopen = () => {
      clearTimeout(timer);
      resolveOpen();
    };
    ws.onerror = (event) => {
      clearTimeout(timer);
      rejectOpen(new Error(`WebSocket 连接失败：${String(event?.message || event)}`));
    };
  });
  return ws;
}

function consoleArgText(arg) {
  if (!arg || typeof arg !== 'object') return String(arg ?? '');
  if (arg.value !== undefined) {
    if (typeof arg.value === 'string') return arg.value;
    try {
      return JSON.stringify(arg.value);
    } catch {
      return String(arg.value);
    }
  }
  return arg.description || arg.unserializableValue || '';
}

/**
 * 启动一个独立的 headless Edge 并连接 CDP。
 * @param {{width?: number, height?: number, scheme?: 'dark'|'light'}} [options]
 */
export async function launch({ width = 1440, height = 960, scheme = 'dark' } = {}) {
  if (!existsSync(EDGE_PATH)) throw new Error(`找不到 Edge：${EDGE_PATH}`);

  const port = await getFreePort();
  const profile = join(
    tmpdir(),
    `wtsl-cdp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  mkdirSync(profile, { recursive: true });

  const args = [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--disable-gpu',
    '--disable-sync',
    '--disable-extensions',
    '--disable-background-networking',
    '--no-service-autorun',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    `--window-size=${width},${height}`,
    'about:blank',
  ];

  const child = spawn(EDGE_PATH, args, { stdio: 'ignore', windowsHide: true });

  let wsUrl = null;
  for (let attempt = 0; attempt < 160; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find(
        (target) =>
          target.type === 'page' &&
          !String(target.url).startsWith('edge://') &&
          !String(target.url).startsWith('devtools://'),
      );
      if (page?.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {
      /* 浏览器还没起来 */
    }
    await sleep(200);
  }

  if (!wsUrl) {
    await killOwnedEdge(child, profile);
    await removeProfile(profile);
    throw new Error(`Edge CDP 没有就绪（profile=${profile}）`);
  }

  const ws = await openWebSocket(wsUrl);
  let seq = 0;
  let closed = false;
  const pending = new Map();
  const consoleErrors = [];
  const contexts = new Map();
  const frames = new Map();

  function cleanupTimers() {
    for (const entry of pending.values()) clearTimeout(entry.timer);
    pending.clear();
  }

  function contextUrl(executionContextId) {
    const context = contexts.get(executionContextId);
    if (!context?.frameId) return '';
    return frames.get(context.frameId) || '';
  }

  function firstStackUrl(stackTrace) {
    const frame = stackTrace?.callFrames?.find((entry) => entry?.url);
    return frame?.url || '';
  }

  function pushError(type, text, url) {
    consoleErrors.push({
      type,
      text: String(text || '').slice(0, 500),
      url: String(url || ''),
    });
  }

  ws.onmessage = (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }

    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(entry.timer);
      if (message.error) entry.reject(new Error(`CDP ${entry.method}: ${message.error.message}`));
      else entry.resolve(message.result);
      return;
    }

    switch (message.method) {
      case 'Runtime.executionContextCreated': {
        const context = message.params?.context;
        if (context?.id !== undefined) {
          contexts.set(context.id, {
            frameId: context.auxData?.frameId,
            origin: context.origin,
          });
        }
        break;
      }
      case 'Runtime.executionContextDestroyed': {
        contexts.delete(message.params?.executionContextId);
        break;
      }
      case 'Page.frameNavigated': {
        const frame = message.params?.frame;
        if (frame?.id) frames.set(frame.id, frame.url || '');
        break;
      }
      case 'Runtime.consoleAPICalled': {
        if (message.params?.type !== 'error') break;
        const text = (message.params.args || []).map(consoleArgText).join(' ');
        const url =
          firstStackUrl(message.params.stackTrace) ||
          contextUrl(message.params.executionContextId);
        pushError('console', text, url);
        break;
      }
      case 'Runtime.exceptionThrown': {
        const details = message.params?.exceptionDetails;
        const text = details?.exception?.description || details?.text || '未知异常';
        const url =
          details?.url ||
          firstStackUrl(details?.stackTrace) ||
          contextUrl(details?.executionContextId);
        pushError('exception', text, url);
        break;
      }
      default:
        break;
    }
  };

  function send(method, params = {}, timeoutMs = 120000) {
    if (closed) return Promise.reject(new Error('CDP 已关闭'));
    return new Promise((resolvePromise, reject) => {
      const id = ++seq;
      const timer = setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, timeoutMs);
      pending.set(id, { resolve: resolvePromise, reject, method, timer });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression, options = {}) {
    const result = await send('Runtime.evaluate', {
      expression,
      awaitPromise: options.awaitPromise !== false,
      returnByValue: options.returnByValue !== false,
      userGesture: options.userGesture === true,
    });
    if (result.exceptionDetails) {
      const description =
        result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text ||
        'Runtime.evaluate 异常';
      throw new Error(description);
    }
    const remote = result.result;
    if (!remote) return undefined;
    if (remote.unserializableValue !== undefined) return remote.unserializableValue;
    return remote.value;
  }

  async function setViewport(nextWidth, nextHeight) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: nextWidth,
      height: nextHeight,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }

  const mediaState = { scheme, reduced: false };
  async function applyMedia() {
    await send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-color-scheme', value: mediaState.scheme === 'light' ? 'light' : 'dark' },
        {
          name: 'prefers-reduced-motion',
          value: mediaState.reduced ? 'reduce' : 'no-preference',
        },
      ],
    });
  }

  async function setReducedMotion(enabled) {
    mediaState.reduced = Boolean(enabled);
    await applyMedia();
  }

  async function navigate(url, { timeout = 20000 } = {}) {
    const result = await send('Page.navigate', { url });
    if (result?.errorText) throw new Error(`Page.navigate 失败：${result.errorText}`);
    // 等到新文档至少进入 interactive；complete 会被第三方字体/图片拖住，
    // 插件/宿主真正就绪由调用方的 waitFor 判定。
    await waitFor('document.readyState !== "loading"', {
      timeout,
      interval: 100,
      message: `页面加载超时：${url}`,
    });
  }

  async function waitFor(predicate, options = {}) {
    const timeout = options.timeout ?? 15000;
    const interval = options.interval ?? 150;
    const message = options.message || 'waitFor 超时';
    const startedAt = Date.now();
    let lastValue;
    let lastError = null;
    while (Date.now() - startedAt < timeout) {
      try {
        lastValue =
          typeof predicate === 'string' ? await evaluate(predicate) : await predicate();
        if (lastValue) return lastValue;
      } catch (error) {
        lastError = error;
      }
      await sleep(interval);
    }
    const suffix = lastError
      ? `；最后错误：${lastError instanceof Error ? lastError.message : String(lastError)}`
      : `；最后值：${JSON.stringify(lastValue)}`;
    throw new Error(`${message}${suffix}`);
  }

  async function dispatchTouch(type, points = []) {
    await send('Input.dispatchTouchEvent', {
      type,
      touchPoints: points.map((point, index) => ({
        x: Math.round(point.x),
        y: Math.round(point.y),
        id: point.id ?? index + 1,
        radiusX: point.radiusX ?? 1,
        radiusY: point.radiusY ?? 1,
        force: point.force ?? 1,
      })),
    });
  }

  async function dispatchMouse(type, x, y, options = {}) {
    const button = options.button || 'left';
    const buttons =
      type === 'mousePressed' ? 1 : type === 'mouseReleased' ? 0 : options.buttons ?? 0;
    await send('Input.dispatchMouseEvent', {
      type,
      x: Math.round(x),
      y: Math.round(y),
      button,
      buttons,
      clickCount: type === 'mouseMoved' ? 0 : 1,
    });
  }

  /** 在页面（含同源 iframe）里按文字/aria-label/title 找到可点击元素并点击 */
  async function clickText(text, options = {}) {
    const needle = String(text);
    const exact = options.exact === true;
    const touch = options.touch === true;
    const expression = `(() => {
      const needle = ${JSON.stringify(needle)};
      const exact = ${exact ? 'true' : 'false'};
      const selector = 'button, [role="button"], [role="tab"], [role="menuitem"], [role="option"], a, label, [aria-label], [title]';
      const visible = (el) => {
        // 注意：跨 iframe 的元素 instanceof 顶层 Element 为 false，不能用 instanceof
        if (!el || el.nodeType !== 1) return false;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 1 && r.height > 1;
      };
      const labelOf = (el) =>
        (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '')
          .replace(/\\s+/g, ' ')
          .trim();
      const matchScore = (label) => {
        if (label === needle) return 0;
        if (label.replace(/\\s+/g, '') === needle) return 0;
        if (exact) return null;
        if (label.startsWith(needle)) return 1;
        if (label.includes(needle)) return 2;
        return null;
      };
      const findIn = (root, offsetX, offsetY) => {
        let best = null;
        for (const el of root.querySelectorAll(selector)) {
          if (!visible(el)) continue;
          const label = labelOf(el);
          if (!label) continue;
          const match = matchScore(label);
          if (match === null) continue;
          const rect = el.getBoundingClientRect();
          const interactive = el.matches(selector);
          const score = match * 100000000 + (interactive ? 0 : 1000000000) + rect.width * rect.height;
          if (!best || score < best.score) {
            best = { el, score };
          }
        }
        if (!best) return null;
        best.el.scrollIntoView({ block: 'center', inline: 'center' });
        const rect = best.el.getBoundingClientRect();
        return {
          x: offsetX + rect.left + rect.width / 2,
          y: offsetY + rect.top + rect.height / 2,
          label: labelOf(best.el),
          tag: best.el.tagName,
        };
      };
      const searchDoc = (doc, offsetX, offsetY) => {
        const found = findIn(doc, offsetX, offsetY);
        if (found) return found;
        for (const frame of doc.querySelectorAll('iframe')) {
          let childDoc = null;
          try { childDoc = frame.contentDocument; } catch { continue; }
          if (!childDoc) continue;
          const rect = frame.getBoundingClientRect();
          const nested = searchDoc(childDoc, offsetX + rect.left, offsetY + rect.top);
          if (nested) return nested;
        }
        return null;
      };
      return searchDoc(document, 0, 0);
    })()`;

    const target = await waitFor(expression, {
      timeout: options.timeout ?? 8000,
      interval: 120,
      message: `没有找到可点击文本/标签：${needle}`,
    });
    if (touch) {
      await dispatchTouch('touchStart', [target]);
      await sleep(70);
      await dispatchTouch('touchEnd', []);
    } else {
      await dispatchMouse('mouseMoved', target.x, target.y);
      await dispatchMouse('mousePressed', target.x, target.y);
      await sleep(50);
      await dispatchMouse('mouseReleased', target.x, target.y);
    }
    await sleep(options.afterMs ?? 100);
    return target;
  }

  async function screenshot(filePath) {
    const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, Buffer.from(result.data, 'base64'));
    return filePath;
  }

  async function close() {
    if (closed) return;
    closed = true;
    cleanupTimers();
    try {
      ws.close();
    } catch {
      /* ignore */
    }
    await sleep(150);
    await killOwnedEdge(child, profile);
    await sleep(400);
    await removeProfile(profile);
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await setViewport(width, height);
  await applyMedia();
  // 平板基线：保留触控能力，但 CDP 的 mouse 事件仍按 mouse 派发
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  return {
    send,
    evaluate,
    waitFor,
    navigate,
    clickText,
    dispatchTouch,
    dispatchMouse,
    screenshot,
    setReducedMotion,
    setViewport,
    clearConsoleErrors: () => {
      consoleErrors.length = 0;
    },
    get consoleErrors() {
      return consoleErrors;
    },
    get baseUrl() {
      return DEFAULT_BASE_URL;
    },
    get profile() {
      return profile;
    },
    get port() {
      return port;
    },
    close,
  };
}
