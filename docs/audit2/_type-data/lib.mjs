import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
export const BASE = path.join(process.env.TEMP, 'audit-typography');
export const APP = 'http://localhost:5173/';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch(port, profileName) {
  const profile = path.join(BASE, `${profileName}-${Date.now()}`);
  const proc = spawn(EDGE, [
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
  ], { stdio: 'ignore' });
  let wsUrl = null;
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/new?url=about:blank`, { method: 'PUT' });
      if (res.ok) {
        const target = await res.json();
        if (target?.webSocketDebuggerUrl) { wsUrl = target.webSocketDebuggerUrl; break; }
      }
    } catch {}
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === 'page' && !t.url.startsWith('edge://') && !t.url.startsWith('devtools://'));
      if (page?.webSocketDebuggerUrl) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch {}
    await sleep(250);
  }
  if (!wsUrl) throw new Error('无法连接 Edge CDP');
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  const cdp = new Cdp(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  return { cdp, ws, proc, profile };
}

export function killEdge(profileName) {
  try {
    const { execFileSync } = require('node:child_process');
    execFileSync('powershell.exe', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains('${profileName}') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`]);
  } catch {}
}

export class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.logs = [];
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const p = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
        else p.resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        this.logs.push('EXC ' + JSON.stringify(msg.params.exceptionDetails).slice(0, 400));
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        this.logs.push('ERR ' + msg.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 400));
      }
    };
  }
  send(method, params = {}, timeoutMs = 120000) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error(`timeout ${method}`)); }
      }, timeoutMs);
    });
  }
  async eval(expression, timeoutMs = 120000) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, timeoutMs);
    if (res.exceptionDetails) throw new Error('EVAL: ' + JSON.stringify(res.exceptionDetails).slice(0, 800));
    return res.result.value;
  }
}

export async function waitGridReady(cdp, timeoutMs = 120000, expected = 1) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    let v;
    try {
      v = await cdp.eval(`(() => { const cards=[...document.querySelectorAll('[data-widget-card]')]; let ok=0; for(const c of cards){const d=c.querySelector('iframe')?.contentDocument; const r=d?.getElementById('root'); if(r&&r.childElementCount>0) ok++;} return {cards:cards.length, ok, body:(document.body?.innerText||'').replace(/\\s+/g,' ').slice(0,80)}; })()`, 30000);
    } catch {
      await sleep(1000);
      continue;
    }
    if (v.cards >= expected && v.ok === v.cards) return v;
    await sleep(1000);
  }
  throw new Error('timed out waiting for grid');
}

export function gridFor(width, height) {
  const COLUMNS = [[1280, 8], [900, 6], [480, 4], [360, 3], [0, 2]];
  const columns = COLUMNS.find(([min]) => width >= min)[1];
  const gap = 12;
  const padding = 20;
  let cell = Math.floor((width - padding * 2 - (columns - 1) * gap) / columns);
  cell = Math.min(220, Math.max(96, cell));
  let rows = Math.max(4, Math.floor((height - padding * 2 + gap) / (cell + gap)));
  if (rows === 4) {
    const fit = Math.floor((height - padding * 2 - 3 * gap) / 4);
    if (fit > 0 && fit < cell) cell = Math.max(96, fit);
  }
  rows = Math.max(4, Math.floor((height - padding * 2 + gap) / (cell + gap)));
  return { columns, rows, cell };
}

export function pack(widgets, columns, rows) {
  const pages = [];
  let current = { occ: new Set(), widgets: [] };
  pages.push(current);
  const fits = (occ, col, row, w, h) => {
    if (col + w > columns || row + h > rows) return false;
    for (let c = col; c < col + w; c++) for (let r = row; r < row + h; r++) if (occ.has(`${c}:${r}`)) return false;
    return true;
  };
  for (const w of widgets) {
    const [ww, hh] = w.size;
    let placed = false;
    for (const page of pages) {
      for (let row = 0; row <= rows - hh && !placed; row++) {
        for (let col = 0; col <= columns - ww && !placed; col++) {
          if (!fits(page.occ, col, row, ww, hh)) continue;
          for (let c = col; c < col + ww; c++) for (let r = row; r < row + hh; r++) page.occ.add(`${c}:${r}`);
          page.widgets.push({ ...w, col, row });
          placed = true;
        }
      }
      if (placed) break;
    }
    if (!placed) {
      const page = { occ: new Set(), widgets: [] };
      for (let c = 0; c < ww; c++) for (let r = 0; r < hh; r++) page.occ.add(`${c}:${r}`);
      page.widgets.push({ ...w, col: 0, row: 0 });
      pages.push(page);
    }
  }
  return pages;
}

export function layoutJson(pages) {
  const widgets = [];
  pages.forEach((page, index) => {
    for (const w of page.widgets) {
      widgets.push({ uid: w.uid, pluginId: w.pluginId, widgetId: w.widgetId, title: w.title, page: index, col: w.col, row: w.row, size: w.size, sizes: w.sizes });
    }
  });
  return JSON.stringify({ version: 2, pages: pages.length, activePage: 0, widgets, savedAt: Date.now() });
}

export const SEED = `(() => {
  localStorage.setItem('plugin.weather.settings', JSON.stringify({
    apiKey: '', apiHost: '', unit: 'c', refreshMin: 30, autoLocate: false, showAir: true,
    showWarnings: false, showMinutely: false, mock: true,
    places: [{ id: '101010100', name: '北京', adm1: '北京市', adm2: '北京', lat: 39.92, lon: 116.41, country: '中国', tz: 'Asia/Shanghai', isCurrent: true }]
  }));
  localStorage.setItem('plugin.countdown.items', JSON.stringify([
    { id: 'c1', title: '产品发布', targetDate: '2026-10-19', repeatYearly: false, color: 'red' },
    { id: 'c2', title: '项目终期评审会', targetDate: '2026-10-31', repeatYearly: false, color: 'blue' },
    { id: 'c3', title: '年度体检', targetDate: '2026-10-16', repeatYearly: false, color: 'green' },
    { id: 'c4', title: '春节回家', targetDate: '2027-02-06', repeatYearly: true, color: 'orange' },
    { id: 'c5', title: '结婚纪念日', targetDate: '2027-05-20', repeatYearly: true, color: 'purple' }
  ]));
  localStorage.setItem('todo.lists', JSON.stringify([{ id: 'l1', name: '工作', color: 'colorPaletteBlueForeground2', order: 0 }]));
  const today = new Date(); const iso = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18, 0, 0).toISOString();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const tasks = [
    ['t1', '整理季度汇报材料', 0, false, iso(today), 2],
    ['t2', '和设计确认卡片字号方案', 0, false, iso(today), 3],
    ['t3', '修复天气插件图标错位', 0, false, iso(tomorrow), 1],
    ['t4', '给番茄钟补周末统计', 0, true, iso(today), 0],
    ['t5', '预约牙科复诊', 0, false, null, 0],
    ['t6', '读完《设计中的设计》第三章', 0, false, iso(tomorrow), 1]
  ].map(([id, title, listId, done, dueAt, priority], i) => ({
    id, listId: 'l1', title, done, priority, order: i, tags: [], subtasks: [],
    createdAt: new Date(today.getTime() - 86400000 * (i + 1)).toISOString(),
    updatedAt: new Date().toISOString(), ...(dueAt ? { dueAt } : {})
  }));
  localStorage.setItem('todo.tasks', JSON.stringify(tasks));
  localStorage.setItem('todo.settings', JSON.stringify({ defaultListId: 'l1', showCompleted: true, defaultSort: 'manual', fontSize: 'default', weekStart: 1, reminders: {} }));
  localStorage.setItem('plugin.todo.settings', JSON.stringify({ defaultListId: 'l1', showCompleted: true, defaultSort: 'manual', fontSize: 'default', weekStart: 1 }));
  localStorage.setItem('wtsl.themeMode', 'dark');
  return 'seeded';
})()`;

export const SIZE_TABLE = [
  { pluginId: 'clock', widgetId: 'clock', title: '时钟', sizes: [[1, 1], [2, 1], [3, 2]] },
  { pluginId: 'countdown', widgetId: 'countdown', title: '倒数日', sizes: [[1, 1], [2, 1], [2, 2], [3, 2]] },
  { pluginId: 'pomodoro', widgetId: 'pomodoro', title: '番茄钟', sizes: [[1, 1], [2, 1], [2, 2], [3, 2]] },
  { pluginId: 'sedentary', widgetId: 'sedentary', title: '久坐提醒', sizes: [[1, 1], [2, 1], [2, 2], [3, 2]] },
  { pluginId: 'todo', widgetId: 'todo-list', title: '待办', sizes: [[1, 1], [2, 2], [3, 2], [3, 3], [4, 2]] },
  { pluginId: 'weather', widgetId: 'weather-card', title: '天气', sizes: [[1, 1], [2, 1], [2, 2], [3, 2], [4, 2]] },
];

export function allWidgets() {
  const out = [];
  for (const entry of SIZE_TABLE) {
    for (const size of entry.sizes) {
      const key = `${size[0]}x${size[1]}`;
      out.push({
        uid: `audit-${entry.pluginId}-${key}`,
        pluginId: entry.pluginId,
        widgetId: entry.widgetId,
        title: `${entry.title} ${key}`,
        size,
        sizes: entry.sizes,
      });
    }
  }
  return out;
}

export const TEXT_DUMP = String.raw`
(() => {
  const cards = [...document.querySelectorAll('[data-widget-card]')];
  const out = [];
  for (const card of cards) {
    const iframe = card.querySelector('iframe');
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;
    if (!doc || !win) continue;
    const uid = card.getAttribute('data-widget-uid') || '';
    const cardRect = card.getBoundingClientRect();
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
            text: [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean).join(' ').slice(0, 60),
            fontSize: +parseFloat(cs.fontSize).toFixed(2),
            lineHeight: cs.lineHeight === 'normal' ? 'normal' : +parseFloat(cs.lineHeight).toFixed(2),
            fontWeight: cs.fontWeight,
            color: cs.color,
            fvn: cs.fontVariantNumeric,
            ls: cs.letterSpacing,
            rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
            inView: r.right > 0 && r.bottom > 0 && r.left < win.innerWidth && r.top < win.innerHeight,
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
      uid,
      card: { w: +cardRect.width.toFixed(1), h: +cardRect.height.toFixed(1), x: +cardRect.x.toFixed(1), y: +cardRect.y.toFixed(1) },
      inner: { w: win.innerWidth, h: win.innerHeight },
      root: rootEl ? { fontSize: rcs.fontSize, fontFamily: rcs.fontFamily, pad: [rcs.paddingTop, rcs.paddingRight, rcs.paddingBottom, rcs.paddingLeft], gap: rcs.gap, cls: rootEl.className, rect: (() => { const r = rootEl.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; })() } : null,
      texts, boxes,
    });
  }
  return out;
})()
`;
