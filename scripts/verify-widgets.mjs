/**
 * 小部件 UI 回归断言（DENSITY §2.1 / UI-REWRITE-SPEC §6）。
 *
 * 用法（仓库根目录，dev server 需在 http://localhost:5173 运行）：
 *   node scripts/verify-widgets.mjs                 # 全部插件 × 全部尺寸（1440×960）
 *   node scripts/verify-widgets.mjs --plugin clock  # 只测一个插件
 *   node scripts/verify-widgets.mjs --scheme light  # 亮色主题抽查（默认 dark）
 *   node scripts/verify-widgets.mjs --screenshots   # 同时把每例截图写到 shots/rewrite/verify/
 *
 * 实现：Edge headless + CDP（Node 22+ 自带 WebSocket，无第三方依赖）。
 * 每个插件按真实 iframe 尺寸单独打开（standalone + `&demo=1`，天气用 ?mock=1），
 * 串行执行、跑完清理自己的 Edge 进程，避免进程泄漏拖慢机器。
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 1440×960 网格：cell=164、gap=12、页边距=20；iframe = 卡片 − 2×6 宿主内衬 */
function iframeSize([cols, rows], { cell = 164, gap = 12, inner = 6 } = {}) {
  return {
    width: cols * cell + (cols - 1) * gap - inner * 2,
    height: rows * cell + (rows - 1) * gap - inner * 2,
  };
}

/** 每插件：支持尺寸 + 首屏语义类型（numeric 单值卡 / list 列表卡 / mixed 兼有） */
const PLUGINS = [
  {
    id: 'clock',
    widgetId: 'clock',
    sizes: [
      { key: '1x1', bytes: [1, 1], kind: 'numeric' },
      { key: '2x1', bytes: [2, 1], kind: 'numeric' },
      { key: '3x2', bytes: [3, 2], kind: 'numeric' },
    ],
  },
  {
    id: 'countdown',
    widgetId: 'countdown',
    sizes: [
      { key: '1x1', bytes: [1, 1], kind: 'numeric' },
      { key: '2x1', bytes: [2, 1], kind: 'numeric' },
      { key: '2x2', bytes: [2, 2], kind: 'list' },
      { key: '3x2', bytes: [3, 2], kind: 'mixed' },
    ],
  },
  {
    id: 'pomodoro',
    widgetId: 'pomodoro',
    sizes: [
      { key: '1x1', bytes: [1, 1], kind: 'numeric' },
      { key: '2x1', bytes: [2, 1], kind: 'numeric' },
      { key: '2x2', bytes: [2, 2], kind: 'numeric' },
      { key: '3x2', bytes: [3, 2], kind: 'numeric' },
    ],
  },
  {
    id: 'sedentary',
    widgetId: 'sedentary',
    sizes: [
      { key: '1x1', bytes: [1, 1], kind: 'numeric' },
      { key: '2x1', bytes: [2, 1], kind: 'numeric' },
      { key: '2x2', bytes: [2, 2], kind: 'numeric' },
      { key: '3x2', bytes: [3, 2], kind: 'numeric' },
    ],
  },
  {
    id: 'todo',
    widgetId: 'todo-list',
    sizes: [
      { key: '1x1', bytes: [1, 1], kind: 'numeric' },
      { key: '2x2', bytes: [2, 2], kind: 'list' },
      { key: '3x2', bytes: [3, 2], kind: 'list' },
      { key: '3x3', bytes: [3, 3], kind: 'list' },
      { key: '4x2', bytes: [4, 2], kind: 'list' },
    ],
  },
  {
    id: 'weather',
    widgetId: 'weather-card',
    sizes: [
      { key: '1x1', bytes: [1, 1], kind: 'numeric' },
      { key: '2x1', bytes: [2, 1], kind: 'numeric' },
      { key: '2x2', bytes: [2, 2], kind: 'numeric' },
      { key: '3x2', bytes: [3, 2], kind: 'numeric' },
      { key: '4x2', bytes: [4, 2], kind: 'numeric' },
    ],
  },
];

/** 断言表：阈值来自 DENSITY §2.1 / UI-REWRITE-SPEC §6 */
function thresholds(sizeKind, key) {
  const [cols] = key.split('x').map(Number);
  if (sizeKind === 'list' && key !== '1x1') {
    // 列表卡：DENSITY §2.1 用「列表头主层 ≥28px」替代占比阈值，不做 maxFont/height 断言
    return { minPrimary: 28, minRatio: 1.5, primaryRatio: 0 };
  }
  // 混合卡（列表 + hero 数字）：按 hero ≥48 断言，不套数值卡占比
  if (sizeKind === 'mixed') return { minPrimary: 48, minRatio: 1.5, primaryRatio: 0 };
  if (key === '1x1' || key === '2x1') return { minPrimary: 40, minRatio: 2.0, primaryRatio: 0.3 };
  if (key === '2x2') return { minPrimary: 40, minRatio: 2.0, primaryRatio: 0.125 };
  if (key === '3x2') return { minPrimary: 48, minRatio: 2.0, primaryRatio: 0.15 };
  if (key === '3x3') return { minPrimary: 28, minRatio: 1.5, primaryRatio: 0.12 };
  return { minPrimary: 56, minRatio: 2.0, primaryRatio: 0.17 };
}

async function launch(port, scheme) {
  const profile = join(process.env.TEMP, `wtsl-verify-${Date.now()}`);
  const child = spawn(
    EDGE,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      '--disable-gpu',
      '--disable-sync',
      '--no-service-autorun',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1440,960',
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
      /* 还没起来 */
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
  const logs = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: ok, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else ok(msg.result);
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      logs.push(msg.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 200));
    } else if (msg.method === 'Runtime.exceptionThrown') {
      logs.push(JSON.stringify(msg.params.exceptionDetails).slice(0, 200));
    }
  };
  const send = (method, params = {}, timeoutMs = 120000) =>
    new Promise((resolvePromise, reject) => {
      const id = ++seq;
      pending.set(id, { resolve: resolvePromise, reject });
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, timeoutMs);
    });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: scheme === 'light' ? 'light' : 'dark' }],
  });

  return {
    ws,
    child,
    logs,
    send,
    evaluate: async (expression) => {
      const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      return result.result?.value;
    },
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
          `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='msedge.exe'\\" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains('${profile.replace(/\\/g, '\\\\')}') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`,
          { stdio: 'ignore' },
        );
      } catch {
        /* ignore */
      }
    },
  };
}

/** 种子配置：天气 mock、时钟设置等（写在同源 localStorage，插件 standalone 会读） */
const SEEDS = {
  'plugin.weather.settings': {
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
  },
  'plugin.clock.clock.settings': { hour12: false, showSeconds: true, dateFormat: 'zh' },
  'plugin.countdown.settings': { showPast: true, highlightSoon: true },
  'plugin.pomodoro.settings': {
    focusMin: 25,
    shortBreakMin: 5,
    longBreakMin: 15,
    longBreakEvery: 4,
    autoStartBreak: false,
    autoStartFocus: false,
    whiteNoise: 'off',
    whiteNoiseVolume: 40,
    notify: true,
  },
  'plugin.sedentary.settings': {
    enabled: true,
    intervalMin: 45,
    breakMin: 5,
    activeStart: '09:00',
    activeEnd: '22:00',
    weekend: true,
    notify: true,
  },
};

const MEASURE_SCRIPT = `(() => {
  const W = innerWidth, H = innerHeight;
  const isVisible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    return r.bottom > 0 && r.top < H && r.right > 0 && r.left < W;
  };
  const texts = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('script,style')) continue;
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => (n.textContent || '').trim())
      .filter(Boolean)
      .join(' ');
    if (!own) continue;
    if (seen.has(el)) continue;
    if (!isVisible(el)) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const fs = Number.parseFloat(cs.fontSize) || 0;
    if (!fs) continue;
    seen.add(el);
    texts.push({ text: own.slice(0, 60), fontSize: fs, top: r.top, bottom: r.bottom, left: r.left, right: r.right });
  }
  const graphics = [];
  for (const el of document.querySelectorAll('svg, img')) {
    if (!isVisible(el)) continue;
    const r = el.getBoundingClientRect();
    graphics.push({ top: r.top, bottom: r.bottom, kind: el.tagName.toLowerCase() });
  }
  const intervals = [...texts.map((t) => [t.top, t.bottom]), ...graphics.map((g) => [g.top, g.bottom])]
    .map(([a, b]) => [Math.max(0, a), Math.min(H, b)])
    .filter(([a, b]) => b > a)
    .sort((x, y) => x[0] - y[0]);
  const merged = [];
  for (const [a, b] of intervals) {
    const last = merged[merged.length - 1];
    if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  let contentBand = 0;
  for (const [a, b] of merged) contentBand += b - a;
  let maxGap = merged.length ? merged[0][0] : H;
  for (let i = 1; i < merged.length; i += 1) maxGap = Math.max(maxGap, merged[i][0] - merged[i - 1][1]);
  maxGap = Math.max(maxGap, H - (merged.length ? merged[merged.length - 1][1] : 0));
  const fonts = [...new Set(texts.map((t) => Math.round(t.fontSize * 10) / 10))].sort((a, b) => b - a);
  const maxFont = fonts[0] || 0;
  const secondTier = fonts.find((f) => f < maxFont) || 0;
  const minFont = fonts.length ? fonts[fonts.length - 1] : 0;
  const below12 = texts.filter((t) => t.fontSize > 0 && t.fontSize < 12).length;
  const primary = texts.filter((t) => Math.abs(t.fontSize - maxFont) < 0.6).map((t) => t.text);
  const uniqueTexts = [...new Set(texts.map((t) => t.text))];
  return {
    width: W,
    height: H,
    textCount: texts.length,
    infoItemCount: uniqueTexts.length,
    fonts,
    maxFont,
    secondTier,
    minFont,
    below12,
    primaryTexts: primary.slice(0, 6),
    contentBandPct: Math.round((contentBand / H) * 1000) / 10,
    maxGapPct: Math.round((maxGap / H) * 1000) / 10,
    intervals: merged.map(([a, b]) => [Math.round(a), Math.round(b)]),
    consoleErrorHint: null,
  };
})()`;

async function verifyCase(cdp, plugin, size, options) {
  const { width, height } = iframeSize(size.bytes, options.grid);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  const params = new URLSearchParams({ plugin: plugin.id, widget: plugin.widgetId, size: size.key });
  if (plugin.id === 'weather') {
    const weatherMock = await cdp.evaluate(`(() => {
      try { localStorage.setItem('plugin.weather.settings', JSON.stringify(${JSON.stringify(SEEDS['plugin.weather.settings'])})); } catch (e) {}
      try { localStorage.setItem('plugin.weather.cache', '{}'); } catch (e) {}
      return 'ok';
    })()`);
    if (weatherMock !== 'ok') throw new Error('weather 种子失败');
  } else {
    params.set('demo', '1');
  }
  const url = `${BASE_URL}/plugins/${plugin.id}/index.html?${params.toString()}`;
  await cdp.send('Page.navigate', { url });
  // 等插件渲染出带文字的根节点
  for (let i = 0; i < 120; i += 1) {
    const ready = await cdp.evaluate(`(() => {
      const root = document.getElementById('root');
      const text = (root?.innerText || '').trim();
      return text.length > 0;
    })()`);
    if (ready) break;
    await sleep(1000);
  }
  // 插件页 standalone 不会读 URL 里的尺寸：按宿主协议补发一次 resize（SDK 在 standalone 下
  // window.parent === window，self postMessage 能通过 source 校验）
  await cdp.evaluate(
    `window.postMessage({ type: 'host:resize', payload: { size: ${JSON.stringify(size.bytes)} } }, '*'); 'ok'`,
  );
  await sleep(1500);
  // 统一深色底（standalone 没有宿主卡片材质，避免白底白字影响截图）
  await cdp.evaluate(`(() => {
    document.documentElement.style.background = '${options.scheme === 'light' ? '#ffffff' : '#0e0f13'}';
    document.body.style.background = '${options.scheme === 'light' ? '#ffffff' : '#0e0f13'}';
    return 'ok';
  })()`);
  await sleep(400);
  const measure = await cdp.evaluate(MEASURE_SCRIPT);
  if (options.screenshots) {
    mkdirSync(join('shots', 'rewrite', 'verify'), { recursive: true });
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(
      join('shots', 'rewrite', 'verify', `${plugin.id}-${size.key}-${options.scheme}.png`),
      Buffer.from(shot.data, 'base64'),
    );
  }
  return { plugin, size, width, height, measure };
}

async function staticScan(pluginId) {
  const { readFileSync } = await import('node:fs');
  const { readdirSync, statSync } = await import('node:fs');
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.(jsx|js|css)$/.test(name)) files.push(full);
    }
  };
  walk(join('public', 'plugins', pluginId, 'src'));
  const problems = [];
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    if (/fontSizeBase(700|800|900|1000)/.test(content)) problems.push(`${file}: 不存在的 fontSizeBase7xx/8xx/9xx`);
    if (/fontSize:\s*['"]clamp\(/.test(content)) problems.push(`${file}: clamp 字号`);
    if (/lineHeight:\s*1\s*[,}]/.test(content)) problems.push(`${file}: lineHeight: 1`);
    if (/fontSize:\s*['"]?(?:[0-9]|1[01])px/.test(content)) problems.push(`${file}: 10/11 级 px 字号`);
  }
  return problems;
}

/** 把“逐行文本/图标区间”聚成内容块（块内间隙 ≤40px 视为同一块），用于多块卡片的空白带断言 */
function blockStats(intervals, height, clusterGap = 40) {
  if (!intervals || intervals.length === 0) return { bandPct: 0, maxGapPct: 100 };
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const clusters = [];
  for (const [a, b] of sorted) {
    const last = clusters[clusters.length - 1];
    if (last && a - last[1] <= clusterGap) last[1] = Math.max(last[1], b);
    else clusters.push([a, b]);
  }
  const band = clusters.reduce((sum, [a, b]) => sum + (b - a), 0);
  let maxGap = clusters[0][0];
  for (let i = 1; i < clusters.length; i += 1) maxGap = Math.max(maxGap, clusters[i][0] - clusters[i - 1][1]);
  maxGap = Math.max(maxGap, height - clusters[clusters.length - 1][1]);
  return {
    bandPct: Math.round((band / height) * 1000) / 10,
    maxGapPct: Math.round((maxGap / height) * 1000) / 10,
    blocks: clusters,
  };
}

function judge(result, allResults) {
  const { plugin, size, measure } = result;
  const t = thresholds(size.kind, size.key);
  const fails = [];
  if (measure.maxFont < t.minPrimary) fails.push(`主字号 ${measure.maxFont}px < ${t.minPrimary}px`);
  const primaryPct = measure.height ? (measure.maxFont / measure.height) * 100 : 0;
  if (t.primaryRatio > 0 && primaryPct < t.primaryRatio * 100) {
    fails.push(`主信息占卡高 ${primaryPct.toFixed(1)}% < ${(t.primaryRatio * 100).toFixed(1)}%`);
  }
  if (measure.secondTier && measure.maxFont / measure.secondTier < t.minRatio) {
    fails.push(`主/次字号比 ${(measure.maxFont / measure.secondTier).toFixed(2)} < ${t.minRatio}`);
  }
  if (measure.minFont > 0 && measure.minFont < 12) fails.push(`最小字号 ${measure.minFont}px < 12px`);
  if (measure.below12 > 0) fails.push(`<12px 文本 ${measure.below12} 处`);

  // 空白带/内容带只对“多块卡片”生效（weather 2×2/3×2/4×2）；用内容块（块内间隙≤40px）而不是逐行区间
  const multiBlock = plugin.id === 'weather' && ['2x2', '3x2', '4x2'].includes(size.key);
  const blocks = blockStats(measure.intervals, measure.height);
  if (multiBlock && blocks.maxGapPct > 22) fails.push(`最大空带 ${blocks.maxGapPct}% > 22%`);
  if (multiBlock && blocks.bandPct < 60) fails.push(`内容带 ${blocks.bandPct}% < 60%`);
  measure.blockBandPct = blocks.bandPct;
  measure.blockMaxGapPct = blocks.maxGapPct;

  // 同插件 3×2 的信息项必须多于 1×1（“尺寸变大 → 信息量变多”）；
  // 不用纵向覆盖率跨尺寸比较：1×1 单值卡天然占比更高，会误杀已经铺满的 3×2。
  if (size.key === '3x2') {
    const base = allResults.find((r) => r.plugin.id === plugin.id && r.size.key === '1x1');
    if (base && measure.infoItemCount <= base.measure.infoItemCount) {
      fails.push(`3×2 信息项 ${measure.infoItemCount} ≤ 1×1 ${base.measure.infoItemCount}`);
    }
  }
  return { fails, warns: [] };
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.includes('--plugin') ? args[args.indexOf('--plugin') + 1] : null;
  const scheme = args.includes('--scheme') ? args[args.indexOf('--scheme') + 1] : 'dark';
  const screenshots = args.includes('--screenshots');

  const plugins = PLUGINS.filter((p) => !only || p.id === only);
  if (plugins.length === 0) throw new Error(`未知插件：${only}`);

  const grid = { cell: 164, gap: 12, inner: 6 };
  const port = 9410 + Math.floor(Math.random() * 20);
  const cdp = await launch(port, scheme);
  const results = [];
  let hardFailures = 0;

  try {
    // 先打开同源页面，写入各插件种子（standalone 页面会读 localStorage）
    await cdp.send('Page.navigate', { url: BASE_URL });
    await sleep(5000);
    const seedResult = await cdp.evaluate(`(() => {
      const seeds = ${JSON.stringify(SEEDS)};
      for (const [key, value] of Object.entries(seeds)) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
      }
      return Object.keys(seeds).length;
    })()`);
    console.log(`[verify] 种子配置：${seedResult} 项`);

    for (const plugin of plugins) {
      console.log(`\n=== ${plugin.id}（${scheme}）===`);
      for (const size of plugin.sizes) {
        const result = await verifyCase(cdp, plugin, size, { grid, scheme, screenshots });
        result.fails = [];
        results.push(result);
        const { measure } = result;
        console.log(
          `  ${size.key.padEnd(4)} ${String(result.width).padStart(3)}×${String(result.height).padStart(3)}  ` +
            `主 ${String(measure.maxFont).padStart(5)}px  次 ${String(measure.secondTier).padStart(4)}px  ` +
            `最小 ${String(measure.minFont).padStart(4)}px  占比 ${(measure.maxFont / measure.height * 100).toFixed(0)}%  ` +
            `内容带 ${measure.contentBandPct}%  空带 ${measure.maxGapPct}%  文本 ${measure.textCount}`,
        );
      }
      const staticProblems = await staticScan(plugin.id);
      const pluginResults = results.filter((r) => r.plugin.id === plugin.id);
      for (const r of pluginResults) {
        r.fails = judge(r, pluginResults).fails;
        if (r.fails.length > 0) hardFailures += 1;
      }
      const pluginFails = [...new Set(pluginResults.flatMap((r) => r.fails).concat(staticProblems))];
      if (pluginFails.length === 0) {
        console.log('  PASS');
      } else {
        for (const fail of pluginFails) console.log(`  FAIL ${fail}`);
      }
    }

    console.log('\n=== 汇总 ===');
    for (const r of results) {
      const ok = r.fails.length === 0;
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.plugin.id} ${r.size.key}`);
    }
  } finally {
    await cdp.close();
  }

  if (hardFailures > 0) {
    console.log(`\n${hardFailures} 个尺寸未通过断言`);
    process.exitCode = 1;
  } else {
    console.log('\n全部尺寸通过断言');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
