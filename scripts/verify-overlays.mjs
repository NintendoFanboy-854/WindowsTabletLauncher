/**
 * 插件设置/详情浮层回归断言（OVERLAY-REWRITE-SPEC §6）。
 *
 * 用法（仓库根目录，dev server 需在 http://localhost:5173 运行）：
 *   node scripts/verify-overlays.mjs                     # 全部插件全部浮层视图
 *   node scripts/verify-overlays.mjs --plugin weather    # 只测一个插件
 *   node scripts/verify-overlays.mjs --scheme light      # 亮色抽查（默认 dark）
 *   node scripts/verify-overlays.mjs --screenshots       # 截图写到 shots/rewrite/overlays/verify/
 *
 * 实现：宿主浮层 iframe 实测尺寸 834×582（1440×960 下 Dialog 880×680 − 标题/边距）。
 * 每个视图直接以 standalone 页面 + `?view=` 打开，串行单 Edge，结束清理进程。
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';
const VIEW_WIDTH = 834;
const VIEW_HEIGHT = 582;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 每个插件的浮层视图；detail/edit/all 需要演示数据时自动加 &demo=1 */
const CASES = [
  { plugin: 'clock', widget: 'clock', view: 'settings', demo: false },
  { plugin: 'weather', widget: 'weather-card', view: 'settings', demo: false },
  { plugin: 'weather', widget: 'weather-card', view: 'detail', demo: false },
  { plugin: 'countdown', widget: 'countdown', view: 'settings', demo: true },
  { plugin: 'countdown', widget: 'countdown', view: 'edit', demo: true },
  { plugin: 'pomodoro', widget: 'pomodoro', view: 'settings', demo: true },
  { plugin: 'pomodoro', widget: 'pomodoro', view: 'detail', demo: true },
  { plugin: 'sedentary', widget: 'sedentary', view: 'settings', demo: true },
  { plugin: 'sedentary', widget: 'sedentary', view: 'detail', demo: true },
  { plugin: 'todo', widget: 'todo-list', view: 'settings', demo: true },
  { plugin: 'todo', widget: 'todo-list', view: 'detail', demo: true },
  { plugin: 'todo', widget: 'todo-list', view: 'all', demo: true },
];

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

const MEASURE = `(() => {
  const W = innerWidth, H = innerHeight;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    return r.bottom > 0 && r.top < H + 200 && r.right > 0 && r.left < W;
  };
  const fonts = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('script,style')) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => (n.textContent || '').trim()).filter(Boolean).join(' ');
    if (!own || !visible(el)) continue;
    const fs = Number.parseFloat(getComputedStyle(el).fontSize) || 0;
    if (fs) fonts.push(fs);
  }
  const controls = [];
  const push = (el, kind) => {
    if (!visible(el)) return;
    const r = el.getBoundingClientRect();
    controls.push({ kind, w: Math.round(r.width), h: Math.round(r.height) });
  };
  document.querySelectorAll('button, [role="button"], [role="tab"], input, select, textarea, .fui-Switch, .fui-Checkbox, .fui-Radio, .fui-Slider, .fui-Dropdown, .fui-Input').forEach((el) => push(el, el.className.split(' ').find((c) => c.startsWith('fui-')) || el.tagName.toLowerCase()));
  const below12 = fonts.filter((f) => f < 12).length;
  const below40 = controls.filter((c) => c.h < 40).length;
  return {
    width: W,
    height: H,
    bodyText: (document.body.innerText || '').trim().slice(0, 120),
    textLength: (document.body.innerText || '').trim().length,
    minFont: fonts.length ? Math.min(...fonts) : 0,
    maxFont: fonts.length ? Math.max(...fonts) : 0,
    fontCount: fonts.length,
    below12,
    controlCount: controls.length,
    below40,
    smallControls: controls.filter((c) => c.h < 40).slice(0, 10),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  };
})()`;

async function launch(port) {
  const profile = join(process.env.TEMP, `wtsl-overlays-${Date.now()}`);
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
      '--window-size=834,582',
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
  const errors = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: ok, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else ok(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      errors.push('EXC ' + JSON.stringify(msg.params.exceptionDetails).slice(0, 200));
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push('ERR ' + msg.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 200));
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
  return { send, ws, child, profile, errors, close: async () => {
    try { ws.close(); } catch { /* ignore */ }
    child.kill();
    await sleep(600);
    try {
      const { execSync } = await import('node:child_process');
      execSync(
        `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='msedge.exe'\\" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains('wtsl-overlays-') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`,
        { stdio: 'ignore' },
      );
    } catch { /* ignore */ }
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* ignore */ }
  } };
}

async function verifyCase(cdp, entry, options) {
  cdp.errors.length = 0;
  const params = new URLSearchParams({ plugin: entry.plugin, widget: entry.widget, view: entry.view });
  if (entry.demo) params.set('demo', '1');
  const url = `${BASE_URL}/plugins/${entry.plugin}/index.html?${params.toString()}`;
  await cdp.send('Page.navigate', { url });
  let ready = false;
  for (let i = 0; i < 120; i += 1) {
    const length = await cdp.send('Runtime.evaluate', {
      expression: `((document.getElementById('root')?.innerText) || '').trim().length`,
      returnByValue: true,
    });
    if ((length.result?.value || 0) > 30) {
      ready = true;
      break;
    }
    await sleep(1000);
  }
  await sleep(2000);
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      document.documentElement.style.background = '${options.scheme === 'light' ? '#ffffff' : '#0e0f13'}';
      document.body.style.background = '${options.scheme === 'light' ? '#ffffff' : '#0e0f13'}';
      return 'ok';
    })()`,
  });
  await sleep(300);
  const result = await cdp.send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });
  const measure = result.result?.value || {};
  if (options.screenshots) {
    const dir = join('shots', 'rewrite', 'overlays');
    mkdirSync(dir, { recursive: true });
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const suffix = options.scheme === 'light' ? '-light' : '';
    writeFileSync(join(dir, `${entry.plugin}-${entry.view}${suffix}.png`), Buffer.from(shot.data, 'base64'));
  }
  const fails = [];
  if (!ready) fails.push('视图未渲染（body 文本为空）');
  if ((measure.below12 || 0) > 0) fails.push(`<12px 文本 ${measure.below12} 处`);
  if ((measure.minFont || 0) > 0 && measure.minFont < 12) fails.push(`最小字号 ${measure.minFont}px`);
  if ((measure.below40 || 0) > 0) fails.push(`高度 <40 的控件 ${measure.below40} 个`);
  if ((measure.scrollWidth || 0) > (measure.clientWidth || 0) + 1) {
    fails.push(`横向溢出 ${measure.scrollWidth} > ${measure.clientWidth}`);
  }
  if (cdp.errors.length > 0) fails.push(`控制台错误 ${cdp.errors.length} 条`);
  return { entry, measure, fails, ready };
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.includes('--plugin') ? args[args.indexOf('--plugin') + 1] : null;
  const scheme = args.includes('--scheme') ? args[args.indexOf('--scheme') + 1] : 'dark';
  const screenshots = args.includes('--screenshots');
  const cases = CASES.filter((c) => !only || c.plugin === only);
  if (cases.length === 0) throw new Error(`没有匹配的视图：${only}`);

  const port = 9440 + Math.floor(Math.random() * 20);
  const cdp = await launch(port);
  let failures = 0;
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: VIEW_WIDTH,
      height: VIEW_HEIGHT,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: scheme === 'light' ? 'light' : 'dark' }],
    });
    // 先在宿主页写天气 mock 配置（standalone 设置/详情会读 localStorage）
    await cdp.send('Page.navigate', { url: BASE_URL });
    await sleep(4000);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        try { localStorage.setItem('plugin.weather.settings', JSON.stringify(${JSON.stringify(WEATHER_SETTINGS)})); } catch (e) {}
        return 'ok';
      })()`,
    });

    const results = [];
    for (const entry of cases) {
      const result = await verifyCase(cdp, entry, { scheme, screenshots });
      results.push(result);
      const m = result.measure;
      console.log(
        `  ${entry.plugin.padEnd(9)} ${entry.view.padEnd(8)} 字号 ${String(m.minFont).padStart(4)}–${String(m.maxFont).padStart(4)}px  ` +
          `文本 ${String(m.textLength).padStart(4)}  控件 ${String(m.controlCount).padStart(2)}（<40 ${m.below40}）  ` +
          `${result.fails.length === 0 ? 'PASS' : 'FAIL'}`,
      );
      if (result.fails.length > 0) {
        failures += 1;
        for (const fail of result.fails) console.log(`      - ${fail}`);
      }
    }

    console.log(`\n=== 汇总（${scheme}）===`);
    for (const result of results) {
      console.log(`${result.fails.length === 0 ? 'PASS' : 'FAIL'}  ${result.entry.plugin} ${result.entry.view}`);
    }
  } finally {
    await cdp.close();
  }
  if (failures > 0) {
    console.log(`\n${failures} 个浮层视图未通过`);
    process.exitCode = 1;
  } else {
    console.log('\n全部浮层视图通过断言');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
