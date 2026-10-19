/**
 * 宿主内浮层联调截图（OVERLAY-REWRITE-SPEC §6 的集成侧证据）。
 *
 * 用法（仓库根目录，dev server 需在 http://localhost:5173 运行）：
 *   node scripts/shot-host-overlays.mjs
 *
 * 做什么：
 * 1. 用 headless Edge 打开宿主（1440×960，暗色）；
 * 2. 给每个插件的桌面 iframe 直接转发宿主的 `host:open-settings`（与编辑模式
 *    「设置」按钮同一条通道），等宿主 Fluent Dialog 内的浮层视图渲染完成；
 * 3. 全屏截图到 shots/rewrite/overlays/host-<plugin>-<view>.png；
 * 4. 天气额外点一次卡片打开「详情」浮层截图。
 *
 * 只读宿主页面、不改业务代码；串行单 Edge，结束清理 profile。
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HOST_URL = 'http://localhost:5173';
const VIEW_WIDTH = 1440;
const VIEW_HEIGHT = 960;
const DSF = 2;

const WEATHER_SETTINGS = {
  apiKey: '',
  apiHost: '',
  unit: 'c',
  refreshMin: 30,
  autoLocate: false,
  showAir: true,
  showWarnings: true,
  showMinutely: false,
  mock: true,
  places: [
    {
      id: '101010100',
      name: '北京',
      adm1: '北京市',
      adm2: '北京',
      lat: 39.92,
      lon: 116.41,
      country: '中国',
      tz: 'Asia/Shanghai',
      isCurrent: true,
    },
  ],
};

const TARGETS = [
  { plugin: 'clock', view: 'settings' },
  { plugin: 'weather', view: 'settings' },
  { plugin: 'countdown', view: 'settings' },
  { plugin: 'pomodoro', view: 'settings' },
  { plugin: 'sedentary', view: 'settings' },
  { plugin: 'todo', view: 'settings' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FIND_FRAME = (plugin) => `
  [...document.querySelectorAll('iframe')].find((frame) => {
    const src = frame.getAttribute('src') || '';
    return src.includes('plugin=${plugin}&') && !src.includes('background=1');
  })`;

const overlayState = (plugin) => `(() => {
  const iframe = ${FIND_FRAME(plugin)};
  return iframe ? iframe.getBoundingClientRect().toJSON() : null;
})()`;

const DIALOG_READY = `(() => {
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return 0;
  const frame = dialog.querySelector('iframe');
  if (!frame) return 0;
  try {
    return (frame.contentDocument?.body?.innerText || '').trim().length;
  } catch {
    return -1;
  }
})()`;

async function launch(port) {
  const profile = join(process.env.TEMP, `wtsl-host-overlay-${Date.now()}`);
  const child = spawn(
    EDGE,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      `--window-size=${VIEW_WIDTH},${VIEW_HEIGHT}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  let wsUrl = null;
  for (let i = 0; i < 160; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === 'page' && !t.url.startsWith('edge://') && !t.url.startsWith('devtools://'));
      if (page?.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {
      /* wait */
    }
    await sleep(250);
  }
  if (!wsUrl) throw new Error('Edge CDP 没起来');
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  let seq = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: ok, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else ok(msg.result);
    }
  };
  const send = (method, params = {}, timeoutMs = 60000) =>
    new Promise((resolveP, reject) => {
      const id = ++seq;
      pending.set(id, { resolve: resolveP, reject });
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`CDP timeout ${method}`));
        }
      }, timeoutMs);
    });
  await send('Page.enable');
  await send('Runtime.enable');
  return {
    send,
    close: async () => {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      child.kill();
      await sleep(600);
      try {
        const { execSync } = await import('node:child_process');
        execSync(
          `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='msedge.exe'\\" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains('wtsl-host-overlay-') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`,
          { stdio: 'ignore' },
        );
      } catch {
        /* ignore */
      }
      try {
        rmSync(profile, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime.evaluate 异常');
  return result.result?.value;
}

async function waitFor(cdp, expression, check, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let value = null;
  while (Date.now() < deadline) {
    value = await evaluate(cdp, expression);
    if (check(value)) return value;
    await sleep(300);
  }
  return value;
}

async function screenshot(cdp, name) {
  mkdirSync(join('shots', 'rewrite', 'overlays'), { recursive: true });
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join('shots', 'rewrite', 'overlays', name), Buffer.from(shot.data, 'base64'));
  console.log(`  截图 → shots/rewrite/overlays/${name}`);
}

async function pressEscape(cdp) {
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await waitFor(cdp, `document.querySelector('[role="dialog"]') ? 1 : 0`, (value) => value === 0, 8000);
  await sleep(400);
}

async function openSettings(cdp, plugin) {
  const sent = await evaluate(
    cdp,
    `(() => {
      const iframe = ${FIND_FRAME(plugin)};
      if (!iframe) return 'no-frame';
      iframe.contentWindow.postMessage({ type: 'host:open-settings' }, '*');
      return 'sent';
    })()`,
  );
  if (sent !== 'sent') return `桌面没有 ${plugin} 卡片（${sent}）`;
  const length = await waitFor(cdp, DIALOG_READY, (value) => typeof value === 'number' && value > 20, 30000);
  if (typeof length !== 'number' || length <= 20) return `${plugin} 设置浮层没有渲染（文本长度 ${length}）`;
  await sleep(1200);
  await screenshot(cdp, `host-${plugin}-settings.png`);
  await pressEscape(cdp);
  return null;
}

async function openWeatherDetail(cdp) {
  const rect = await evaluate(cdp, overlayState('weather'));
  if (!rect) return '桌面没有天气卡片';
  const x = Math.round(rect.x + rect.width / 2);
  const y = Math.round(rect.y + rect.height / 2);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  const length = await waitFor(cdp, DIALOG_READY, (value) => typeof value === 'number' && value > 20, 30000);
  if (typeof length !== 'number' || length <= 20) return `天气详情浮层没有渲染（文本长度 ${length}）`;
  await sleep(1200);
  await screenshot(cdp, 'host-weather-detail.png');
  await pressEscape(cdp);
  return null;
}

async function main() {
  const port = 9480 + Math.floor(Math.random() * 20);
  const cdp = await launch(port);
  const problems = [];
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: VIEW_WIDTH,
      height: VIEW_HEIGHT,
      deviceScaleFactor: DSF,
      mobile: false,
    });
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: 'dark' }],
    });

    await cdp.send('Page.navigate', { url: HOST_URL });
    await waitFor(cdp, `document.querySelectorAll('iframe').length`, (value) => (value || 0) >= 6, 45000);
    // 注入天气 mock 配置后再刷新，让天气详情有真实内容
    await evaluate(
      cdp,
      `(() => {
        try { localStorage.setItem('plugin.weather.settings', JSON.stringify(${JSON.stringify(WEATHER_SETTINGS)})); } catch (error) {}
        return 'ok';
      })()`,
    );
    await cdp.send('Page.reload');
    const frames = await waitFor(cdp, `document.querySelectorAll('iframe').length`, (value) => (value || 0) >= 6, 45000);
    if ((frames || 0) < 6) throw new Error(`桌面只渲染了 ${frames} 个 iframe`);
    await sleep(5000); // 等插件完成 host:init / 首屏数据

    for (const target of TARGETS) {
      const problem = await openSettings(cdp, target.plugin);
      if (problem) {
        problems.push(problem);
        console.log(`  FAIL ${target.plugin} 设置：${problem}`);
      } else {
        console.log(`  PASS ${target.plugin} 设置`);
      }
    }

    const detailProblem = await openWeatherDetail(cdp);
    if (detailProblem) {
      problems.push(detailProblem);
      console.log(`  FAIL 天气详情：${detailProblem}`);
    } else {
      console.log('  PASS 天气详情');
    }
  } finally {
    await cdp.close();
  }
  if (problems.length > 0) {
    console.log(`\n${problems.length} 个宿主内浮层没有通过`);
    process.exitCode = 1;
  } else {
    console.log('\n宿主内浮层全部渲染通过');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
