/**
 * v0.3.1 UI 冒烟：桌面右键菜单 / Agent 半高语音窗控制条+peek / 全高窗常驻朗读开关 / 菜单项边界。
 *
 * v0.3.7 适配：半高窗由旧「composer（输入窗）」改为纯语音窗 `data-stage="voice"`
 * （无 textarea、点「点击说话」开录、peek 展开对话）；全高 chat 的输入区改成单行 composer。
 * 本文件跟随新契约调整阶段名与断言，覆盖范围不缩水。
 *
 * 用法（仓库根目录，dev server 已在跑；端口可用 WTSL_BASE_URL 覆盖）：
 *   node scripts/smoke-v031-ui.mjs
 *
 * 约束：只启动一个 headless Edge（假麦克风 flags 由 scripts/lib/cdp.mjs 默认带上），
 * 全程串行；失败继续后续项；证据（截图/JSON）写 shots/releases/v0.3.x/v031-dev/。
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { launch, sleep } from './lib/cdp.mjs';

const REPO_ROOT = process.cwd();
const OUT = join(REPO_ROOT, 'shots', 'releases', 'v0.3.x', 'v031-dev');
// 注意：Vite dev server 可能只监听 IPv6 loopback（::1），127.0.0.1 会 ERR_CONNECTION_REFUSED；
// 统一用 localhost（与 scripts/lib/cdp.mjs 的 DEFAULT_BASE_URL 一致）。
const BASE_URL = process.env.WTSL_BASE_URL || 'http://localhost:5173';
mkdirSync(OUT, { recursive: true });

const results = [];
const failures = [];
let currentTag = 'setup';

function check(tag, name, ok, detail = '') {
  const entry = { tag, name, ok: Boolean(ok), detail: String(detail ?? '').slice(0, 1200) };
  results.push(entry);
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${tag} :: ${name}${detail ? ` — ${String(detail).slice(0, 400)}` : ''}`);
  if (!ok) failures.push(entry);
  return Boolean(ok);
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

let cdp = null;
let logCapture = null;

async function step(tag, name, fn) {
  currentTag = tag;
  try {
    const detail = await fn();
    return check(tag, name, true, detail === undefined ? '' : typeof detail === 'string' ? detail : JSON.stringify(detail).slice(0, 900));
  } catch (error) {
    let body = '';
    try {
      body = String(await evalJS(`String(document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 400)`));
    } catch {
      /* ignore */
    }
    check(tag, name, false, `${error?.message || error}；body=${body}`);
    try {
      await cdp.screenshot(join(OUT, `FAIL-${tag}-${failures.length}.png`));
    } catch {
      /* ignore */
    }
    return false;
  }
}

async function evalJS(expression) {
  return cdp.evaluate(expression);
}

async function waitFor(expression, timeout, message) {
  return cdp.waitFor(expression, { timeout, interval: 120, message });
}

async function screenshot(name) {
  const file = join(OUT, name);
  await cdp.screenshot(file);
  return file;
}

async function mouseClick(x, y) {
  await cdp.dispatchMouse('mouseMoved', x, y);
  await cdp.dispatchMouse('mousePressed', x, y);
  await sleep(40);
  await cdp.dispatchMouse('mouseReleased', x, y);
  await sleep(150);
}

async function rightClick(x, y) {
  await cdp.dispatchMouse('mouseMoved', x, y);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'right', buttons: 2, clickCount: 1 });
  await sleep(60);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'right', buttons: 0, clickCount: 1 });
  await sleep(300);
}

async function pointOf(selector, timeout = 20000) {
  const point = await waitFor(
    `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`,
    timeout,
    `找不到可见元素 ${selector}`,
  );
  return point;
}

async function clickSelector(selector, timeout = 20000) {
  const point = await pointOf(selector, timeout);
  await mouseClick(point.x, point.y);
}

async function clickAria(label, timeout = 20000, exact = true) {
  const point = await waitFor(
    `(() => {
      const needle = ${JSON.stringify(label)};
      for (const el of document.querySelectorAll('[aria-label]')) {
        const value = (el.getAttribute('aria-label') || '').trim();
        if (${exact ? 'value !== needle' : '!value.includes(needle)'}) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) continue;
        if (el.closest('[aria-hidden="true"]') || el.closest('[inert]')) continue;
        // 命中测试：中心点最上层元素必须是它自己或其后代（防止被 Portal/遮罩挡住时点到别处）
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        if (!hit || !(hit === el || el.contains(hit))) continue;
        return { x: cx, y: cy };
      }
      return null;
    })()`,
    timeout,
    `找不到可见 aria-label：${label}`,
  );
  await mouseClick(point.x, point.y);
}

async function clickText(text, timeout = 20000) {
  const point = await waitFor(
    `(() => {
      const needle = ${JSON.stringify(text)};
      const candidates = [...document.querySelectorAll('button, [role="menuitem"], [role="button"], a')];
      for (const el of candidates) {
        const label = String(el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim();
        if (label !== needle) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    })()`,
    timeout,
    `找不到可点击文本：${text}`,
  );
  await mouseClick(point.x, point.y);
}

/**
 * 只在「当前打开的 [role="menu"]」范围内按文本找 menuitem 并点击。
 * 不能全局按文本找：EditToolbar 的「设置」按钮常驻 DOM（inert/opacity 0），会被先命中。
 */
async function clickMenuItem(text, timeout = 10000) {
  const point = await waitFor(
    `(() => {
      const needle = ${JSON.stringify(text)};
      const menu = document.querySelector('[role="menu"]');
      if (!menu) return null;
      for (const el of menu.querySelectorAll('[role="menuitem"]')) {
        const label = String(el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim();
        if (label !== needle) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    })()`,
    timeout,
    `当前菜单里找不到项：${text}`,
  );
  await mouseClick(point.x, point.y);
  await waitFor(`!document.querySelector('[role="menu"]')`, 8000, `点击菜单项后菜单未关闭：${text}`).catch(() => {});
}

/**
 * 打开 Agent chat header 的「更多」菜单：等 morph 完成 → 页面内 .click() → 鼠标点击 → 诊断。
 */
async function openMoreMenu() {
  await waitFor(
    `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === 'chat'`,
    20000,
    '未进入 chat，无法打开 ⋯ 菜单',
  );
  await sleep(600); // 等 voice → chat 的几何过渡与 header 重排结束
  const info = await evalJS(`(() => {
    const surface = document.querySelector('[data-wtsl-agent-surface]');
    const button = [...(surface?.querySelectorAll('[aria-label]') || [])].find((el) => (el.getAttribute('aria-label') || '') === '更多');
    if (!button) return { found: false, labels: [...(surface?.querySelectorAll('[aria-label]') || [])].map((el) => el.getAttribute('aria-label')) };
    const r = button.getBoundingClientRect();
    return { found: true, rect: { x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) }, center: { x: r.left + r.width / 2, y: r.top + r.height / 2 }, disabled: button.disabled === true };
  })()`);
  const diagnostics = { info, attempts: [] };
  if (!info.found) return { opened: false, diagnostics };
  // 1) 页面内点击（不受过渡期坐标影响）
  await evalJS(`(() => {
    const surface = document.querySelector('[data-wtsl-agent-surface]');
    const button = [...(surface?.querySelectorAll('[aria-label]') || [])].find((el) => (el.getAttribute('aria-label') || '') === '更多');
    if (button) button.click();
    return Boolean(button);
  })()`);
  if (await waitFor(`Boolean(document.querySelector('[role="menu"]'))`, 5000, '⋯ 菜单未打开').then(() => true).catch(() => false)) {
    diagnostics.attempts.push('programmatic-click: opened');
    return { opened: true, diagnostics };
  }
  // 2) 鼠标坐标点击
  const point = await waitFor(`(() => {
    const surface = document.querySelector('[data-wtsl-agent-surface]');
    const button = [...(surface?.querySelectorAll('[aria-label]') || [])].find((el) => (el.getAttribute('aria-label') || '') === '更多');
    if (!button) return null;
    const r = button.getBoundingClientRect();
    if (r.width < 1) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`, 5000, '找不到更多按钮');
  await mouseClick(point.x, point.y);
  if (await waitFor(`Boolean(document.querySelector('[role="menu"]'))`, 5000, '⋯ 菜单未打开').then(() => true).catch(() => false)) {
    diagnostics.attempts.push('mouse-click: opened');
    return { opened: true, diagnostics };
  }
  // 3) 诊断快照
  diagnostics.dump = await evalJS(`(() => {
    const surface = document.querySelector('[data-wtsl-agent-surface]');
    const button = [...(surface?.querySelectorAll('[aria-label]') || [])].find((el) => (el.getAttribute('aria-label') || '') === '更多');
    const r = button ? button.getBoundingClientRect() : null;
    const atPoint = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
    return {
      menus: document.querySelectorAll('[role="menu"]').length,
      menusInDom: [...document.querySelectorAll('[role="menu"]')].map((el) => ({ visible: el.getBoundingClientRect().width > 0, text: String(el.innerText || '').slice(0, 80) })),
      button: button ? { aria: button.getAttribute('aria-label'), disabled: button.disabled === true, rect: { x: r.left, y: r.top, width: r.width, height: r.height } } : null,
      elementAtButtonCenter: atPoint ? { tag: atPoint.tagName, aria: atPoint.getAttribute && atPoint.getAttribute('aria-label'), cls: String(atPoint.className || '').slice(0, 120) } : null,
      activeElement: { tag: document.activeElement && document.activeElement.tagName, aria: document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('aria-label') },
      stage: surface ? surface.getAttribute('data-stage') : null,
      bodyText: String(document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 300),
    };
  })()`);
  diagnostics.attempts.push('programmatic + mouse clicks failed');
  return { opened: false, diagnostics };
}

async function pressKey(key, code, keyCode, modifiers = 0) {
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode,
    modifiers,
  });
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode,
    modifiers,
  });
  await sleep(200);
}

const SURFACE_STATE = `(() => {
  const el = document.querySelector('[data-wtsl-agent-surface]');
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    stage: el.getAttribute('data-stage'),
    voiceStage: el.getAttribute('data-voice-stage'),
    speaking: el.getAttribute('data-speaking') === 'true',
    ariaLabel: el.getAttribute('aria-label'),
    width: Math.round(rect.width * 10) / 10,
    height: Math.round(rect.height * 10) / 10,
    overflow: { doc: document.documentElement.scrollWidth - document.documentElement.clientWidth, surface: el.scrollWidth - el.clientWidth },
  };
})()`;

const MIC_TRACKER = `(() => {
  window.__wtslMicStreams = [];
  try {
    const md = navigator.mediaDevices;
    if (!md || typeof md.getUserMedia !== 'function') return;
    const original = md.getUserMedia.bind(md);
    md.getUserMedia = async (constraints) => {
      const stream = await original(constraints);
      try { window.__wtslMicStreams.push(stream); } catch (error) { /* ignore */ }
      return stream;
    };
  } catch (error) { /* ignore */ }
})();`;

async function startLogCapture() {
  try {
    const list = await (await fetch(`http://127.0.0.1:${cdp.port}/json/list`, { signal: AbortSignal.timeout(5000) })).json();
    const page = list.find((item) => item.type === 'page');
    if (!page) return null;
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    const logs = [];
    ws.onmessage = (event) => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error') {
        logs.push({ text: String(message.params.entry.text || '').slice(0, 500), url: String(message.params.entry.url || '') });
      }
    };
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = (error) => reject(new Error(String(error?.message || 'log ws error')));
    });
    ws.send(JSON.stringify({ id: 1, method: 'Log.enable' }));
    return { logs, close: () => ws.close() };
  } catch (error) {
    console.error('Log capture 未建立（不阻塞）：', error?.message);
    return null;
  }
}

async function waitDesktopActive(timeout = 30000) {
  return waitFor(
    `document.querySelector('.host-desktop-layer')?.getAttribute('data-active') === 'true'`,
    timeout,
    '桌面层未激活',
  );
}

async function waitCards(expected = 6, timeout = 180000) {
  return waitFor(
    `document.querySelectorAll('[data-widget-card]').length === ${expected}`,
    timeout,
    `桌面 ${expected} 卡未就绪`,
  );
}

/** 找桌面空白点：不在卡片/Agent/菜单/页码上，且位于桌面层内 */
async function findBlankPoint() {
  return waitFor(
    `(() => {
      const layer = document.querySelector('.host-desktop-layer');
      if (!layer || layer.getAttribute('data-active') !== 'true') return null;
      for (let y = 140; y <= 900; y += 30) {
        for (let x = 120; x <= 1320; x += 30) {
          const el = document.elementFromPoint(x, y);
          if (!el) continue;
          if (!layer.contains(el)) continue;
          if (el.closest('[data-widget-card], [data-wtsl-agent-surface], [role="menu"], [role="dialog"], [data-widget-overlay]')) continue;
          return { x, y };
        }
      }
      return null;
    })()`,
    30000,
    '找不到桌面空白点',
  );
}

async function openContextMenu() {
  const blank = await findBlankPoint();
  // 1) 真实右键（CDP Input）
  await rightClick(blank.x, blank.y);
  const realOpened = await waitFor(`Boolean(document.querySelector('[role="menu"]'))`, 2500, '右键菜单未出现').catch(() => false);
  if (realOpened) return { blank, method: 'cdp-right-click' };
  // 2) 回退：页面内合成 pointerdown(pointerType=mouse)+contextmenu，满足 lastPointerType 与坐标
  await evalJS(`(() => {
    const x = ${blank.x}; const y = ${blank.y};
    const el = document.elementFromPoint(x, y);
    if (!el) return false;
    const base = { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 2, buttons: 2, view: window };
    el.dispatchEvent(new PointerEvent('pointerdown', { ...base, pointerType: 'mouse', pointerId: 1, isPrimary: true, button: 2, buttons: 2 }));
    el.dispatchEvent(new MouseEvent('contextmenu', base));
    el.dispatchEvent(new PointerEvent('pointerup', { ...base, button: 0, buttons: 0, pointerType: 'mouse', pointerId: 1, isPrimary: true }));
    return true;
  })()`);
  await waitFor(`Boolean(document.querySelector('[role="menu"]'))`, 4000, '右键菜单未出现（CDP 与合成事件均失败）');
  return { blank, method: 'synthetic-contextmenu' };
}

async function readMenuItems() {
  return evalJS(`(() => {
    const menu = document.querySelector('[role="menu"]');
    if (!menu) return null;
    const items = [...menu.querySelectorAll('[role="menuitem"]')].map((el) => String(el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim());
    return { text: String(menu.innerText || '').replace(/\\s+/g, ' ').trim(), items };
  })()`);
}

async function surfaceState() {
  return evalJS(SURFACE_STATE);
}

async function micState() {
  return evalJS(`(() => {
    const streams = window.__wtslMicStreams || [];
    const tracks = [];
    for (const stream of streams) for (const track of stream.getTracks()) tracks.push(track.kind + ':' + track.readyState);
    return { streams: streams.length, tracks, live: tracks.filter((item) => item.endsWith(':live')).length };
  })()`);
}

async function readAgentSettings() {
  return evalJS(`(() => { try { const raw = localStorage.getItem('agent.settings'); return raw ? JSON.parse(raw) : null; } catch (error) { return null; } })()`);
}

const startedAt = Date.now();
const evidence = {};
try {
  cdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: MIC_TRACKER });
  logCapture = await startLogCapture();
  evidence.edge = await evalJS(`navigator.userAgent`);

  // ---- 基座：清 localStorage → 重载，等桌面 6 卡 ----
  await cdp.navigate(`${BASE_URL}/`, { timeout: 180000 });
  await evalJS(`localStorage.clear()`);
  await cdp.navigate(`${BASE_URL}/`, { timeout: 180000 });
  await waitCards(6, 180000);
  await waitDesktopActive(60000);
  await sleep(800);
  evidence.baseUrl = BASE_URL;

  // ================= A 右键菜单 =================
  await step('A', '桌面空白处右键出现菜单（打开 Agent / 编辑桌面 / 设置）', async () => {
    const opened = await openContextMenu();
    evidence.contextMenuMethod = opened.method;
    const menu = await readMenuItems();
    expect(menu, '右键后没有 [role="menu"]');
    expect(menu.items.includes('打开 Agent'), `菜单缺少「打开 Agent」：${JSON.stringify(menu.items)}`);
    expect(menu.items.includes('编辑桌面'), `菜单缺少「编辑桌面」：${JSON.stringify(menu.items)}`);
    expect(menu.items.includes('设置'), `菜单缺少「设置」：${JSON.stringify(menu.items)}`);
    expect(!menu.text.includes('桌面设置'), `菜单出现「桌面设置」：${menu.text}`);
    evidence.contextMenu = menu;
    await screenshot('01-context-menu.png');
    return `${opened.method} / items=${JSON.stringify(menu.items)}`;
  });

  // ================= B 菜单「设置」→ 设置页 =================
  await step('B', '菜单「设置」进入宿主设置页（桌面层 data-active=false）', async () => {
    await clickMenuItem('设置', 10000);
    await waitFor(
      `document.querySelector('.host-desktop-layer')?.getAttribute('data-active') === 'false'`,
      30000,
      '点击「设置」后桌面层仍为 active',
    );
    await waitFor(`document.body.innerText.includes('外观')`, 30000, '设置页未出现（无「外观」分区）');
    const pageText = String(await evalJS(`document.body.innerText`)).replace(/\s+/g, ' ');
    expect(pageText.includes('设置'), '设置页缺少标题文字「设置」');
    evidence.settingsPageText = pageText.slice(0, 500);
    await screenshot('02-settings.png');
    return pageText.slice(0, 160);
  });

  // 回桌面（全局 Esc）
  await pressKey('Escape', 'Escape', 27);
  await waitDesktopActive(30000);
  await waitCards(6, 60000);
  await sleep(500);

  // ================= C 菜单「打开 Agent」 =================
  await step('C', '菜单「打开 Agent」→ Agent chat；⋯ 菜单无「桌面设置」宿主入口', async () => {
    await openContextMenu();
    await clickMenuItem('打开 Agent', 10000);
    await waitFor(
      `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === 'chat'`,
      30000,
      '点击「打开 Agent」后未进入 chat',
    );
    await waitFor(`!document.querySelector('[role="menu"]')`, 8000, '打开 Agent 后右键菜单未关闭').catch(() => {});
    const state = await surfaceState();
    expect(state.stage === 'chat', `stage=${state.stage}`);
    // ⋯ 菜单检查（先等 morph 完成；失败时带诊断）
    const more = await openMoreMenu();
    expect(more.opened, `⋯ 菜单未打开；diagnostics=${JSON.stringify(more.diagnostics)}`);
    const items = await evalJS(`[...document.querySelectorAll('[role="menu"] [role="menuitem"]')].map((el) => String(el.innerText || '').replace(/\\s+/g, ' ').trim())`);
    expect(Array.isArray(items) && items.length > 0, '⋯ 菜单没有 menuitem');
    const hasDesktopSettings = items.some((text) => text.includes('桌面设置') || text === '设置');
    evidence.agentMenuItems = items;
    // 关闭菜单（Esc 只关菜单，不应收起 Agent）
    await pressKey('Escape', 'Escape', 27);
    await sleep(400);
    const afterEsc = await surfaceState();
    expect(!hasDesktopSettings, `⋯ 菜单出现宿主设置入口：${JSON.stringify(items)}`);
    expect(afterEsc.stage === 'chat', `关闭 ⋯ 菜单时 Agent 被误收起：stage=${afterEsc.stage}`);
    await screenshot('03-chat.png');
    return `menu=${JSON.stringify(items)}`;
  });

  // ================= D 半高窗控制条 + peek =================
  await step('D', '半高窗：顶部控制条（展开对话/朗读开关/收起）+ peek 区域 + 无横向溢出', async () => {
    // 从 chat 收起再点入口进入录音 → voice（v0.3.7：半高窗是纯语音形态）
    await clickAria('关闭 Agent', 15000);
    await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === 'collapsed'`, 15000, '未收起为 collapsed');
    await sleep(350); // 等 back-collapsed 200–240ms 过渡结束，入口按钮稳定可命中
    const entryDiag = await evalJS(`(() => {
      const el = document.querySelector('[data-wtsl-agent-entry]');
      if (!el) return { found: false };
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      const cs = getComputedStyle(el);
      const surface = document.querySelector('[data-wtsl-agent-surface]');
      return {
        found: true,
        rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
        opacity: cs.opacity, pointerEvents: cs.pointerEvents, visibility: cs.visibility,
        hit: hit ? { tag: hit.tagName, aria: hit.getAttribute && hit.getAttribute('aria-label'), isEntryOrChild: hit === el || el.contains(hit) } : null,
        stage: surface && surface.getAttribute('data-stage'),
      };
    })()`);
    evidence.entryDiag = entryDiag;
    await clickAria('开始语音提问', 15000);
    let voiceOk = await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === 'voice'`, 12000, '入口未进入 voice').then(() => true).catch(() => false);
    let entryClickMethod = 'mouse';
    if (!voiceOk) {
      // 回退：页面内 .click()（排除坐标/遮挡因素）
      await evalJS(`(() => { const el = document.querySelector('[data-wtsl-agent-entry]'); if (el) el.click(); return Boolean(el); })()`);
      entryClickMethod = 'programmatic-fallback';
      voiceOk = await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === 'voice'`, 12000, '入口未进入 voice').then(() => true).catch(() => false);
    }
    const afterEntry = await surfaceState();
    const entryClickDiag = { entryDiag, afterEntry, entryClickMethod, voiceOk };
    evidence.entryClick = entryClickDiag;
    expect(voiceOk, `入口未进入 voice；diag=${JSON.stringify(entryClickDiag)}`);
    // 入口即录是异步的（getUserMedia 可能数百 ms~数秒）：等 recording 后再断言控制条禁用态
    await waitFor(
      `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage') === 'recording'`,
      30000,
      '入口点击后未进入 recording',
    ).catch(() => {});
    await sleep(250);
    const recording = await surfaceState();
    const topBar = await evalJS(`(() => {
      const surface = document.querySelector('[data-wtsl-agent-surface]');
      const find = (label) => [...(surface?.querySelectorAll('[aria-label]') || [])].find((el) => (el.getAttribute('aria-label') || '') === label) || null;
      const expand = find('展开对话');
      const toggle = find('关闭自动朗读') || find('开启自动朗读');
      const close = find('收起 Agent');
      return {
        expand: Boolean(expand), expandDisabled: expand ? expand.disabled === true || expand.getAttribute('aria-disabled') === 'true' : null,
        toggle: Boolean(toggle), toggleLabel: toggle ? toggle.getAttribute('aria-label') : null,
        close: Boolean(close),
      };
    })()`);
    check('D', 'voice 顶部控制条三个控件存在', topBar.expand && topBar.toggle && topBar.close, JSON.stringify({ topBar, recording }));
    check('D', '录音态顶部「展开对话」按设计为禁用（voiceStage!=idle）', topBar.expandDisabled === true, JSON.stringify({ topBar, voiceStage: recording.voiceStage }));
    // v0.3.7：半高窗是纯语音形态 —— 录音态与 idle 都不允许出现 textarea
    const voiceInputs = await evalJS(`(() => {
      const pane = document.querySelector('[data-wtsl-agent-pane="voice"]');
      return {
        paneTextareas: pane ? pane.querySelectorAll('textarea').length : -1,
        talkExists: Boolean(pane && pane.querySelector('[data-wtsl-agent-talk]')),
      };
    })()`);
    check('D', 'voice 窗内没有 textarea（纯语音）', voiceInputs.paneTextareas === 0, JSON.stringify(voiceInputs));
    // 取消录音回 idle → peek 区域应出现（录音态 Esc = 取消并停留 voice）
    await pressKey('Escape', 'Escape', 27);
    await waitFor(
      `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === 'voice' && document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage') === 'idle'`,
      30000,
      'Esc 取消录音后未回到 voice idle',
    );
    await sleep(300);
    const idle = await surfaceState();
    const peek = await evalJS(`(() => {
      const surface = document.querySelector('[data-wtsl-agent-surface]');
      const el = surface?.querySelector('[role="button"][aria-label="展开对话"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { width: Math.round(r.width), height: Math.round(r.height), display: cs.display, visibility: cs.visibility, text: String(el.innerText || '').slice(0, 120) };
    })()`);
    expect(peek, 'voice idle 时找不到 peek 区域 [role=button][aria-label=展开对话]');
    expect(peek.width > 10 && peek.height > 10, `peek 区域尺寸异常：${JSON.stringify(peek)}`);
    check('D', 'voice 顶部朗读开关存在且默认「关闭自动朗读」', idle.stage === 'voice' && topBar.toggleLabel === '关闭自动朗读', JSON.stringify({ stage: idle.stage, toggleLabel: topBar.toggleLabel }));
    check('D', 'voice idle 时有「点击说话」按钮 [data-wtsl-agent-talk]', await evalJS(`Boolean(document.querySelector('[data-wtsl-agent-pane="voice"] [data-wtsl-agent-talk]'))`));
    // 无横向溢出：文档无溢出 + surface overflowX=hidden（内容被裁剪、不出滚动条）；
    // surface scrollWidth-clientWidth 允许 1px 边框亚像素舍入（探针 shots/releases/v0.3.x/v031-dev/overflow-probe.log 证：无子元素越界）。
    const overflow = await evalJS(`(() => {
      const el = document.querySelector('[data-wtsl-agent-surface]');
      const cs = getComputedStyle(el);
      const peekEl = el?.querySelector('[role="button"][aria-label="展开对话"]');
      return {
        doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        surfaceDelta: el ? el.scrollWidth - el.clientWidth : null,
        overflowX: cs.overflowX,
        peekDelta: peekEl ? peekEl.scrollWidth - peekEl.clientWidth : null,
        childOverflow: el ? [...el.querySelectorAll('*')].filter((node) => {
          const r = node.getBoundingClientRect();
          const sr = el.getBoundingClientRect();
          return r.width > 1 && r.right - sr.right > 1;
        }).length : null,
      };
    })()`);
    check('D', '半高窗无横向溢出', overflow.doc <= 0 && overflow.overflowX === 'hidden' && overflow.surfaceDelta <= 1 && overflow.childOverflow === 0 && (overflow.peekDelta ?? 0) <= 0, JSON.stringify(overflow));
    // 控件触控目标 ≥40
    const sizes = await evalJS(`(() => {
      const surface = document.querySelector('[data-wtsl-agent-surface]');
      const out = {};
      for (const label of ['展开对话', '关闭自动朗读', '收起 Agent']) {
        const el = [...(surface?.querySelectorAll('[aria-label]') || [])].find((node) => (node.getAttribute('aria-label') || '') === label);
        out[label] = el ? { w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) } : null;
      }
      return out;
    })()`);
    const small = Object.entries(sizes).filter(([, value]) => !value || value.w < 40 || value.h < 40).map(([label]) => label);
    check('D', 'voice 顶部控件 ≥40×40', small.length === 0, JSON.stringify(sizes));
    await screenshot('04-voice.png');
    return JSON.stringify({ recording: { stage: recording.stage, voiceStage: recording.voiceStage }, topBar, peek, sizes });
  });

  // ================= E 展开 → chat；未播放也有朗读开关 =================
  await step('E', '点「展开对话」→ chat；header 未播放时也有常驻朗读开关', async () => {    await clickAria('展开对话', 15000);
    await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === 'chat'`, 20000, '点「展开对话」未进入 chat');
    const state = await surfaceState();
    expect(state.stage === 'chat', `stage=${state.stage}`);
    expect(state.speaking === false, '未播放却处于 speaking');
    const header = await evalJS(`(() => {
      const surface = document.querySelector('[data-wtsl-agent-surface]');
      const labels = [...(surface?.querySelectorAll('[aria-label]') || [])].map((el) => el.getAttribute('aria-label'));
      return { hasAutoRead: labels.includes('关闭自动朗读') || labels.includes('开启自动朗读'), hasStopSpeaking: labels.includes('停止朗读'), labels };
    })()`);
    check('E', 'chat header 未播放时仍有常驻朗读开关', header.hasAutoRead === true, JSON.stringify(header.labels));
    check('E', '未播放时不显示「停止朗读」', header.hasStopSpeaking === false, JSON.stringify(header.labels));
    await screenshot('05-chat-header.png');
    return JSON.stringify(header);
  });

  // ================= F 静音持久化 =================
  await step('F', '朗读开关：点击→localStorage tts.autoRead=false；reload 后仍为「开启自动朗读」；可再点回 on', async () => {
    await clickAria('关闭自动朗读', 15000);
    await waitFor(
      `[...document.querySelectorAll('[aria-label]')].some((el) => (el.getAttribute('aria-label') || '') === '开启自动朗读')`,
      15000,
      '点击后 aria-label 未变为「开启自动朗读」',
    );
    const settings = await readAgentSettings();
    expect(settings && settings.tts && settings.tts.autoRead === false, `localStorage agent.settings.tts.autoRead !== false：${JSON.stringify(settings && settings.tts)}`);
    // reload 后（agent 默认 collapsed）经右键菜单打开 chat 再验证
    await cdp.navigate(`${BASE_URL}/`, { timeout: 180000 });
    await waitCards(6, 180000);
    await waitDesktopActive(60000);
    await openContextMenu();
    await clickMenuItem('打开 Agent', 10000);
    await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === 'chat'`, 30000, 'reload 后打开 Agent 未进入 chat');
    const labelAfterReload = await evalJS(`(() => {
      const surface = document.querySelector('[data-wtsl-agent-surface]');
      const el = [...(surface?.querySelectorAll('[aria-label]') || [])].find((node) => /自动朗读/.test(node.getAttribute('aria-label') || ''));
      return el ? el.getAttribute('aria-label') : null;
    })()`);
    expect(labelAfterReload === '开启自动朗读', `reload 后朗读开关 label=${labelAfterReload}`);
    const settingsAfterReload = await readAgentSettings();
    expect(settingsAfterReload && settingsAfterReload.tts && settingsAfterReload.tts.autoRead === false, 'reload 后 localStorage autoRead 不是 false');
    // 点回开启（恢复默认）：鼠标点击；若 label 未变则页面内 .click() 重试
    await clickAria('开启自动朗读', 15000);
    let restored = await waitFor(
      `[...document.querySelectorAll('[aria-label]')].some((el) => (el.getAttribute('aria-label') || '') === '关闭自动朗读')`,
      6000,
      '再点后未恢复「关闭自动朗读」',
    ).then(() => true).catch(() => false);
    let restoreMethod = 'mouse';
    if (!restored) {
      await evalJS(`(() => {
        const surface = document.querySelector('[data-wtsl-agent-surface]');
        const el = [...(surface?.querySelectorAll('[aria-label]') || [])].find((node) => /自动朗读/.test(node.getAttribute('aria-label') || ''));
        if (el) el.click();
        return Boolean(el);
      })()`);
      restoreMethod = 'programmatic-fallback';
      restored = await waitFor(
        `[...document.querySelectorAll('[aria-label]')].some((el) => (el.getAttribute('aria-label') || '') === '关闭自动朗读')`,
        10000,
        '再点后未恢复「关闭自动朗读」',
      ).then(() => true).catch(() => false);
    }
    const restoreDiag = await evalJS(`(() => {
      const surface = document.querySelector('[data-wtsl-agent-surface]');
      const labels = [...(surface?.querySelectorAll('[aria-label]') || [])].map((el) => el.getAttribute('aria-label'));
      const toggle = [...(surface?.querySelectorAll('[aria-label]') || [])].find((el) => /自动朗读/.test(el.getAttribute('aria-label') || ''));
      const r = toggle ? toggle.getBoundingClientRect() : null;
      const hit = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
      return {
        stage: surface && surface.getAttribute('data-stage'),
        labels,
        toggle: toggle ? { aria: toggle.getAttribute('aria-label'), rect: { w: Math.round(r.width), h: Math.round(r.height) } } : null,
        hit: hit ? { tag: hit.tagName, aria: hit.getAttribute && hit.getAttribute('aria-label'), inside: Boolean(toggle && (hit === toggle || toggle.contains(hit))) } : null,
      };
    })()`);
    expect(restored, `再点后未恢复「关闭自动朗读」（${restoreMethod}）；diag=${JSON.stringify(restoreDiag)}`);
    const settingsRestored = await readAgentSettings();
    expect(settingsRestored && settingsRestored.tts && settingsRestored.tts.autoRead === true, '恢复后 localStorage autoRead 不是 true');
    evidence.autoRead = { afterOff: settings.tts.autoRead, afterReloadLabel: labelAfterReload, restored: settingsRestored.tts.autoRead, restoreMethod };
    return JSON.stringify(evidence.autoRead);
  });

  // ================= G 收起 / 录音中 X 收起 =================
  await step('G', 'chat 收起；录音中点 X 收起→voice idle、麦克风停、无新消息', async () => {
    await clickAria('关闭 Agent', 15000);
    await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === 'collapsed'`, 15000, 'chat X 未收起');
    check('G', 'chat X 收起为 collapsed', true);
    const before = await evalJS(`document.querySelectorAll('[aria-label^="语音消息："]').length`);
    await clickAria('开始语音提问', 15000);
    let recording = await waitFor(
      `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage') === 'recording'`,
      12000,
      '录音未开始',
    ).then(() => true).catch(() => false);
    if (!recording) {
      // 回退：页面内 .click() 入口按钮
      await evalJS(`(() => { const el = document.querySelector('[data-wtsl-agent-entry]'); if (el) el.click(); return Boolean(el); })()`);
      recording = await waitFor(
        `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage') === 'recording'`,
        20000,
        '录音未开始',
      ).then(() => true).catch(() => false);
    }
    const gDiag = await evalJS(`(() => {
      const surface = document.querySelector('[data-wtsl-agent-surface]');
      const entry = document.querySelector('[data-wtsl-agent-entry]');
      const r = entry ? entry.getBoundingClientRect() : null;
      const hit = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
      return {
        stage: surface && surface.getAttribute('data-stage'),
        voiceStage: surface && surface.getAttribute('data-voice-stage'),
        speaking: surface && surface.getAttribute('data-speaking'),
        entry: entry ? { rect: { w: Math.round(r.width), h: Math.round(r.height) }, opacity: getComputedStyle(entry).opacity, hit: hit ? { tag: hit.tagName, aria: hit.getAttribute && hit.getAttribute('aria-label') } : null } : null,
        recordingUi: Boolean(document.querySelector('[aria-label="结束录音并发送"], [aria-label="取消录音"]')),
        messages: document.querySelectorAll('[aria-label^="语音消息："]').length,
      };
    })()`);
    expect(recording, `录音未开始；diag=${JSON.stringify(gDiag)}`);
    const recState = await surfaceState();
    expect(recState.stage === 'voice', `录音时 stage=${recState.stage}`);
    const recordingUi = await evalJS(`Boolean(document.querySelector('[aria-label="结束录音并发送"], [aria-label="取消录音"]'))`);
    check('G', '录音态录音 UI 可见（结束/取消按钮）', recordingUi === true, String(recordingUi));
    // 录音中点顶部 X（收起 Agent）
    await clickAria('收起 Agent', 15000);
    await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === 'collapsed'`, 20000, '录音中点 X 未收起');
    await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage') === 'idle'`, 20000, '录音中 X 收起后 voice-stage 未回 idle');
    await sleep(600);
    const after = await evalJS(`document.querySelectorAll('[aria-label^="语音消息："]').length`);
    const recordingUiAfter = await evalJS(`Boolean(document.querySelector('[aria-label="结束录音并发送"], [aria-label="取消录音"]'))`);
    const mic = await micState();
    const stateAfter = await surfaceState();
    check('G', '录音中 X 收起后 voice-stage=idle', stateAfter.voiceStage === 'idle', JSON.stringify(stateAfter));
    check('G', '录音中 X 收起后无新增语音消息', after === before, JSON.stringify({ before, after }));
    check('G', '录音中 X 收起后麦克风轨道全部停止', mic.live === 0, JSON.stringify(mic));
    check('G', '录音中 X 收起后录音 UI 消失', recordingUiAfter === false, String(recordingUiAfter));
    evidence.collapseWhileRecording = { recState, stateAfter, mic, before, after };
    return JSON.stringify({ recState: { stage: recState.stage, voiceStage: recState.voiceStage }, mic, before, after });
  });

  // ================= H 控制台 error =================
  await step('H', '全程 console error / Log error = 0', async () => {
    await sleep(1000);
    const consoleErrors = cdp.consoleErrors.slice();
    const logErrorsRaw = logCapture ? logCapture.logs.slice() : [];
    // dev server 的 /favicon.ico 404 是浏览器常规请求，不算产品控制台错误；单独记录原样。
    const benign = logErrorsRaw.filter((item) => /\/favicon\.ico$/.test(item.url || ''));
    const logErrors = logErrorsRaw.filter((item) => !/\/favicon\.ico$/.test(item.url || ''));
    evidence.consoleErrors = consoleErrors;
    evidence.logErrors = logErrors;
    evidence.logErrorsRaw = logErrorsRaw;
    evidence.benignLogErrors = benign;
    check('H', 'console.error/exception = 0', consoleErrors.length === 0, JSON.stringify(consoleErrors.slice(0, 3)));
    check('H', 'Log.entryAdded(error) = 0（忽略 dev favicon 404）', logErrors.length === 0, JSON.stringify(logErrors.slice(0, 3)));
    check('H', `Log 原始记录（含 favicon 404 ${benign.length} 条，非产品）`, true, JSON.stringify(benign.slice(0, 2)));
    return `${consoleErrors.length} console / ${logErrors.length} log（raw ${logErrorsRaw.length}）`;
  });
} catch (error) {
  check('setup', '冒烟主流程异常', false, error?.stack || String(error));
  console.error('SMOKE FATAL', error);
} finally {
  try {
    if (logCapture) logCapture.close();
  } catch {
    /* ignore */
  }
  if (cdp) {
    try {
      await cdp.close();
      console.log('[PASS] cleanup :: Edge closed');
    } catch (error) {
      console.log(`[FAIL] cleanup :: Edge close — ${error?.message}`);
      failures.push({ tag: 'cleanup', name: 'Edge close', ok: false, detail: String(error?.message) });
    }
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    durationMs: Date.now() - startedAt,
    pass: results.filter((item) => item.ok).length,
    fail: failures.length,
    results,
    evidence,
  };
  writeFileSync(join(OUT, 'smoke-results.json'), JSON.stringify(summary, null, 2));
  console.log(`\n=== v0.3.1 UI 冒烟：${summary.pass}/${results.length} PASS，${summary.fail} FAIL，耗时 ${Math.round(summary.durationMs / 1000)}s ===`);
  if (summary.fail > 0) process.exitCode = 1;
}
