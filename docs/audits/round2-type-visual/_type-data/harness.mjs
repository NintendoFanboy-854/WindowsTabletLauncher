import fs from 'node:fs';
import path from 'node:path';
import { BASE, SEED, gridFor, launch, sleep } from './lib.mjs';

const OUT = path.join(BASE, 'raw');
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = path.resolve('shots/audits/round2-type-visual');
fs.mkdirSync(SHOTS, { recursive: true });

const PLUGINS = [
  { pluginId: 'clock', widgetId: 'clock', title: '时钟', sizes: [[1, 1], [2, 1], [3, 2]] },
  { pluginId: 'countdown', widgetId: 'countdown', title: '倒数日', sizes: [[1, 1], [2, 1], [2, 2], [3, 2]] },
  { pluginId: 'pomodoro', widgetId: 'pomodoro', title: '番茄钟', sizes: [[1, 1], [2, 1], [2, 2], [3, 2]] },
  { pluginId: 'sedentary', widgetId: 'sedentary', title: '久坐提醒', sizes: [[1, 1], [2, 1], [2, 2], [3, 2]] },
  { pluginId: 'todo', widgetId: 'todo-list', title: '待办', sizes: [[1, 1], [2, 2], [3, 2], [3, 3], [4, 2]] },
  { pluginId: 'weather', widgetId: 'weather-card', title: '天气', sizes: [[1, 1], [2, 1], [2, 2], [3, 2], [4, 2]] },
];

const COUNTDOWN_ITEMS = [
  { id: 'c1', title: '产品发布', targetDate: '2026-10-19', repeatYearly: false, color: 'red' },
  { id: 'c2', title: '项目终期评审会', targetDate: '2026-10-31', repeatYearly: false, color: 'blue' },
  { id: 'c3', title: '年度体检', targetDate: '2026-10-16', repeatYearly: false, color: 'green' },
  { id: 'c4', title: '春节回家', targetDate: '2027-02-06', repeatYearly: true, color: 'orange' },
  { id: 'c5', title: '结婚纪念日', targetDate: '2027-05-20', repeatYearly: true, color: 'purple' },
];

const CONFIG = {
  clock: { settings: { hour12: false, showSeconds: true, dateFormat: 'zh' } },
  countdown: { items: COUNTDOWN_ITEMS, settings: { showPast: true, highlightSoon: true } },
  pomodoro: { settings: { focusMin: 25, shortBreakMin: 5, longBreakMin: 15, longBreakEvery: 4, autoStartBreak: false, autoStartFocus: false, whiteNoise: 'off', whiteNoiseVolume: 40, notify: true } },
  sedentary: { settings: { enabled: true, intervalMin: 45, breakMin: 5, activeStart: '09:00', activeEnd: '22:00', weekend: true, notify: true } },
  todo: { settings: { defaultListId: 'l1', showCompleted: true, defaultSort: 'manual', fontSize: 'default', weekStart: 1 } },
  weather: {
    settings: {
      apiKey: '', apiHost: '', unit: 'c', refreshMin: 30, autoLocate: false, showAir: true,
      showWarnings: false, showMinutely: false, mock: true,
      places: [{ id: '101010100', name: '北京', adm1: '北京市', adm2: '北京', lat: 39.92, lon: 116.41, country: '中国', tz: 'Asia/Shanghai', isCurrent: true }],
    },
    cache: {},
  },
};

const VIEWPORTS = [
  { name: '1440x960', width: 1440, height: 960 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '960x1440', width: 960, height: 1440 },
];

const CREATE_FN = `(cases) => {
  const root = document.getElementById('root');
  if (root) root.style.display = 'none';
  document.getElementById('audit-harness')?.remove();
  if (window.__AUDIT_TIMER) clearInterval(window.__AUDIT_TIMER);
  const host = document.createElement('div');
  host.id = 'audit-harness';
  host.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;background:#0e0f13;overflow:hidden;';
  host.style.width = innerWidth + 'px';
  host.style.height = innerHeight + 'px';
  document.body.appendChild(host);
  window.__AUDIT_CASES = cases;

  const iframeOf = (source) => [...host.querySelectorAll('iframe')].find((f) => f.contentWindow === source);

  window.__AUDIT_REPLY = (event) => {
    const data = event.data;
    if (!data || typeof data.type !== 'string') return;
    const f = iframeOf(event.source);
    if (!f || !f.__case) return;
    const c = f.__case;
    if (data.type !== 'plugin:call') return;
    let result = null;
    let ok = true;
    if (!f.__store) f.__store = Object.assign({}, c.config || {});
    try {
      const method = data.method;
      const params = data.params || {};
      if (method === 'getConfig') {
        result = Object.prototype.hasOwnProperty.call(f.__store, params.key) ? f.__store[params.key] : null;
      } else if (method === 'setConfig') {
        f.__store[params.key] = params.value;
        result = undefined;
      } else if (method === 'getLocation') {
        result = null;
      } else if (method === 'getIdleSeconds') {
        result = 0;
      } else if (method === 'showReminder') {
        result = { actionId: null };
      } else {
        result = undefined;
      }
    } catch (error) {
      ok = false;
      result = String(error);
    }
    try { event.source.postMessage({ type: 'host:reply', id: data.id, ok, result }, '*'); } catch (error) {}
  };
  if (window.__AUDIT_REPLY) window.removeEventListener('message', window.__AUDIT_REPLY);
  window.addEventListener('message', window.__AUDIT_REPLY);
  window.__AUDIT_REPLY_INSTALLED = true;

  for (const c of cases) {
    const f = document.createElement('iframe');
    f.dataset.case = c.id;
    f.__case = c;
    f.style.cssText = 'position:absolute;left:0;top:0;border:0;visibility:hidden;width:' + c.iw + 'px;height:' + c.ih + 'px;';
    f.src = '/plugins/' + c.pluginId + '/index.html?plugin=' + c.pluginId + '&widget=' + c.widgetId;
    host.appendChild(f);
  }

  window.__AUDIT_POST = () => {
    for (const f of host.querySelectorAll('iframe')) {
      const c = f.__case;
      if (!c) continue;
      try {
        f.contentWindow.postMessage({ type: 'host:init', payload: { v: 1, pluginId: c.pluginId, widgetId: c.widgetId, size: c.size, theme: { colorScheme: 'dark' }, config: c.config } }, '*');
        f.contentWindow.postMessage({ type: 'host:resize', payload: { size: c.size } }, '*');
        f.contentWindow.postMessage({ type: 'host:theme', payload: { theme: { colorScheme: 'dark' } } }, '*');
      } catch (error) {}
    }
  };
  window.__AUDIT_POST();
  window.__AUDIT_TIMER = setInterval(window.__AUDIT_POST, 250);
  return cases.length;
}`;

const SHOW_FN = `(id) => {
  const host = document.getElementById('audit-harness');
  for (const f of host.querySelectorAll('iframe')) {
    f.style.visibility = f.dataset.case === id ? 'visible' : 'hidden';
  }
  return true;
}`;

const DUMP_FN = `() => {
  const out = [];
  const host = document.getElementById('audit-harness');
  for (const f of host.querySelectorAll('iframe')) {
    const doc = f.contentDocument;
    const win = f.contentWindow;
    if (!doc || !win) continue;
    const id = f.dataset.case;
    const texts = [];
    const boxes = [];
    const walk = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
    let el = doc.body;
    while (el) {
      const tag = el.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'noscript') { el = walk.nextNode(); continue; }
      const cs = win.getComputedStyle(el);
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (hasText) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none') {
          texts.push({
            tag,
            cls: typeof el.className === 'string' ? el.className : '',
            text: [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean).join(' ').slice(0, 70),
            fontSize: +parseFloat(cs.fontSize).toFixed(2),
            lineHeight: cs.lineHeight === 'normal' ? 'normal' : +parseFloat(cs.lineHeight).toFixed(2),
            fontWeight: cs.fontWeight,
            color: cs.color,
            fvn: cs.fontVariantNumeric,
            ls: cs.letterSpacing,
            fontFamily: cs.fontFamily.slice(0, 40),
            rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
            role: el.getAttribute('role') || '',
          });
        }
      }
      const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft];
      const hasPad = pad.some((v) => v && v !== '0px');
      const gap = cs.gap && cs.gap !== 'normal' && cs.gap !== '0px';
      if (hasPad || gap) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && cs.display !== 'none') {
          boxes.push({
            tag, cls: typeof el.className === 'string' ? el.className : '',
            display: cs.display, dir: cs.flexDirection,
            gap: cs.gap, rowGap: cs.rowGap, colGap: cs.columnGap, pad,
            justify: cs.justifyContent, align: cs.alignItems,
            rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
          });
        }
      }
      el = walk.nextNode();
    }
    const rootEl = doc.getElementById('root')?.firstElementChild;
    const rcs = rootEl ? win.getComputedStyle(rootEl) : null;
    out.push({
      id,
      inner: { w: win.innerWidth, h: win.innerHeight },
      root: rootEl ? { fontSize: rcs.fontSize, fontFamily: rcs.fontFamily, pad: [rcs.paddingTop, rcs.paddingRight, rcs.paddingBottom, rcs.paddingLeft], gap: rcs.gap, cls: rootEl.className, rect: (() => { const r = rootEl.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; })() } : null,
      texts, boxes,
    });
  }
  return out;
}`;

const { cdp, ws } = await launch(9347, 'edge-profile-harness');
const casesByViewport = new Map();

try {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });
  await sleep(8000);
  await cdp.eval(SEED);
  await cdp.eval('document.getElementById("root")?.style.setProperty("display","none"); "ok"');
  console.log('seeded');

  for (const viewport of VIEWPORTS) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false,
      screenWidth: viewport.width, screenHeight: viewport.height,
    });
    await sleep(800);
    const grid = gridFor(viewport.width, viewport.height);
    const gap = 12;
    const cases = [];
    for (const plugin of PLUGINS) {
      for (const size of plugin.sizes) {
        const key = `${size[0]}x${size[1]}`;
        const cardW = size[0] * grid.cell + (size[0] - 1) * gap;
        const cardH = size[1] * grid.cell + (size[1] - 1) * gap;
        cases.push({
          id: `${plugin.pluginId}-${key}`,
          pluginId: plugin.pluginId,
          widgetId: plugin.widgetId,
          size,
          card: { w: cardW, h: cardH },
          iw: cardW - 12,
          ih: cardH - 12,
          config: CONFIG[plugin.pluginId],
        });
      }
    }
    casesByViewport.set(viewport.name, { viewport, grid, cases });
    await cdp.eval('document.getElementById("audit-harness")?.remove(); "ok"');
    await cdp.eval(`(${CREATE_FN})(${JSON.stringify(cases)})`);
    // 等待所有 iframe 渲染出内容
    let ready = false;
    for (let i = 0; i < 60; i++) {
      await sleep(500);
      const stats = await cdp.eval(`(() => { const fs=[...document.querySelectorAll('#audit-harness iframe')]; let ok=0; for(const f of fs){ if(f.contentDocument?.getElementById('root')?.childElementCount) ok++; } return {n:fs.length, ok}; })()`);
      if (stats.n === cases.length && stats.ok === cases.length) { ready = true; break; }
    }
    console.log(`\n=== ${viewport.name} cell=${grid.cell} iframeReady=${ready} cases=${cases.length} ===`);
    await sleep(6000);
    await cdp.eval('if (window.__AUDIT_TIMER) clearInterval(window.__AUDIT_TIMER); "stopped"');
    await sleep(1200);
    for (let i = 0; i < 15; i++) {
      const ok = await cdp.eval(`(() => {
        const get = (id) => [...document.querySelectorAll('#audit-harness iframe')].find((f) => f.dataset.case === id);
        for (const id of ['weather-1x1','weather-2x1','weather-2x2','weather-3x2','weather-4x2']) {
          const f = get(id); if (!f) return false;
          if (!(f.contentDocument?.body?.innerText || '').includes('°')) return false;
        }
        const clock = get('clock-3x2');
        const clockText = clock?.contentDocument?.querySelector('.fui-Text');
        if (!clockText || parseFloat(clock.contentWindow.getComputedStyle(clockText).fontSize) < 60) return false;
        const todo = get('todo-1x1');
        const todoText = todo?.contentDocument?.querySelector('.fui-Text');
        if (!todoText || parseFloat(todo.contentWindow.getComputedStyle(todoText).fontSize) < 30) return false;
        return true;
      })()`);
      if (ok) break;
      await cdp.eval('window.__AUDIT_POST && window.__AUDIT_POST(); "reposted"');
      await sleep(1000);
    }
    await sleep(800);
    const data = await cdp.eval(`(${DUMP_FN})()`, 120000);
    const data2 = await cdp.eval(`(${DUMP_FN})()`, 120000);
    const weatherCase = data2.find((d) => d.id === 'weather-3x2');
    console.log('weather text:', weatherCase ? weatherCase.texts.map((t) => t.text).join(' | ').slice(0, 160) : 'missing');
    const clockWide = data2.find((d) => d.id === 'clock-3x2');
    console.log('clock-3x2:', clockWide ? clockWide.texts.map((t) => `${t.fontSize}/${t.lineHeight}`).join(' | ') : 'missing');
    const todoMini = data2.find((d) => d.id === 'todo-1x1');
    console.log('todo-1x1:', todoMini ? todoMini.texts.map((t) => `${t.fontSize} ${t.text}`).join(' | ').slice(0, 120) : 'missing');
    const file = path.join(OUT, `harness-${viewport.name}.json`);
    fs.writeFileSync(file, JSON.stringify({ viewport, grid, cases, data: data2 }, null, 2));
    console.log('saved', file, 'frames', data2.length, 'texts', data2.reduce((n, d) => n + d.texts.length, 0));

    // 截图：每个视口选 8 个代表尺寸
    const shotIds = [
      'clock-1x1', 'clock-2x1', 'clock-3x2',
      'weather-1x1', 'weather-2x1', 'weather-3x2',
      'todo-1x1', 'todo-3x3',
    ];
    for (const id of shotIds) {
      const entry = data.find((d) => d.id === id);
      if (!entry) continue;
      await cdp.eval(`(${SHOW_FN})(${JSON.stringify(id)})`);
      await sleep(400);
      const shot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: entry.inner.w, height: entry.inner.h, scale: 1 },
      }, 30000);
      fs.writeFileSync(path.join(SHOTS, `${viewport.name}-${id}.png`), Buffer.from(shot.data, 'base64'));
    }
    console.log('shots saved');
  }
} finally {
  ws.close();
}

fs.writeFileSync(path.join(BASE, 'harness-summary.json'), JSON.stringify([...casesByViewport.entries()].map(([k, v]) => ({ name: k, grid: v.grid, cases: v.cases.length })), null, 2));
console.log('DONE');



