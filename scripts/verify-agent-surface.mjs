/**
 * Agent 浮空界面 E2E（mock 模式，假麦克风）。
 *
 * v0.3.7（语音优先）适配：半高形态由旧「composer 输入窗」改为纯语音窗 `voice`；
 * 语音回合结束不再自动 morph 到全高 chat（连续语音对话）；文字输入只在 chat；
 * chat 输入区改为单行 [麦克风][输入][发送]；任何阶段切换都不自动聚焦 textarea。
 *
 * 契约：docs/AGENT-SURFACE-CONTRACT.md（v0.3.7 修订）+ 共享任务 task-1 contract
 * 用法（仓库根目录，dev server 在 http://localhost:5173）：
 *   node scripts/verify-agent-surface.mjs
 *   node scripts/verify-agent-surface.mjs --screenshots   # 默认就截图到 shots/releases/v0.3.x/v030-dev/
 *
 * 覆盖（Phase 1）：
 * - 入口形态：无 dock / 无机器人头像 / 56×56 / aria-label「开始语音提问」；
 * - 入口即录：点入口立即 recording + morph voice；停止→transcribing→**停留 voice**；
 * - 语音气泡：声纹装饰（24 桶）+ 转写文字入气泡、无「语音/转写结果」文字；
 * - 音频硬约束：localStorage 无 audio/base64、mock 请求无 input_audio；
 * - 播报：语音提问自动播报 + 停止；文字提问默认不播报；单条播报可停；
 * - 语义：Esc/⌄/X/点外部/焦点回归/语音窗无输入框/chat 单行 composer/空格语义；
 * - 三段尺寸/圆角/transitionDuration 符合契约 token 近似；reduced-motion 只保留 120ms opacity；
 * - 设置入口：Ctrl+, / 编辑工具栏「设置」/ 设置页「入口」组；Agent 设置对话框字段范围；
 * - 1440×960 dark / 1024×768 light / reduced-motion 截图；console error=0；横向溢出=0。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { launch, sleep } from './lib/cdp.mjs';

const REPO_ROOT = process.cwd();
const OUT = join(REPO_ROOT, 'shots', 'releases', 'v0.3.x', 'v030-dev');
const BASE_URL = process.env.WTSL_BASE_URL || 'http://localhost:5173';
mkdirSync(OUT, { recursive: true });

const results = [];
const failures = [];
let currentTag = 'setup';

function check(name, ok, detail = '') {
  const entry = { tag: currentTag, name, ok: Boolean(ok), detail: String(detail ?? '').slice(0, 1000) };
  results.push(entry);
  const status = ok ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${currentTag} :: ${name}${detail ? ` — ${String(detail).slice(0, 300)}` : ''}`);
  if (!ok) failures.push(entry);
  return Boolean(ok);
}

async function step(name, fn) {
  try {
    const detail = await fn();
    return check(name, true, detail === undefined ? '' : typeof detail === 'string' ? detail : JSON.stringify(detail).slice(0, 900));
  } catch (error) {
    let body = '';
    try {
      body = String(
        await cdp.evaluate(`String(document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 300)`),
      );
    } catch {
      /* ignore */
    }
    check(name, false, `${error?.message || error}；body=${body}`);
    try {
      await cdp.screenshot(join(OUT, `FAIL-${currentTag}-${failures.length}.png`));
    } catch {
      /* ignore */
    }
    return false;
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

let cdp = null;

// ---------------------------------------------------------------------------
// CDP 小工具
// ---------------------------------------------------------------------------

const SURFACE_STATE = `(() => {
  const el = document.querySelector('[data-wtsl-agent-surface]');
  if (!el) return null;
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const entry = el.querySelector('[data-wtsl-agent-entry]');
  const active = document.activeElement;
  const visible = (node) => {
    if (!node || node.nodeType !== 1) return false;
    const own = getComputedStyle(node);
    if (own.display === 'none' || own.visibility === 'hidden') return false;
    for (let current = node; current && current.nodeType === 1; current = current.parentElement) {
      if (Number(getComputedStyle(current).opacity) < 0.05) return false;
      if (current.hasAttribute && (current.hasAttribute('inert') || current.getAttribute('aria-hidden') === 'true')) return false;
    }
    const r = node.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const textareas = [...el.querySelectorAll('textarea')];
  return {
    stage: el.getAttribute('data-stage'),
    motion: el.getAttribute('data-motion'),
    voiceStage: el.getAttribute('data-voice-stage'),
    speaking: el.getAttribute('data-speaking') === 'true',
    ariaLabel: el.getAttribute('aria-label'),
    width: Math.round(rect.width * 100) / 100,
    height: Math.round(rect.height * 100) / 100,
    radius: cs.borderRadius,
    shadow: cs.boxShadow,
    transitionDuration: cs.transitionDuration,
    transitionProperty: cs.transitionProperty,
    transitionTimingFunction: cs.transitionTimingFunction,
    entryCount: el.querySelectorAll('[data-wtsl-agent-entry]').length,
    textareasInSurface: textareas.length,
    visibleTextareas: textareas.filter(visible).length,
    entryRect: entry ? (() => { const r = entry.getBoundingClientRect(); return { w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100, aria: entry.getAttribute('aria-label') }; })() : null,
    activeElement: { tag: active && active.tagName, aria: active && active.getAttribute && active.getAttribute('aria-label'), isTextarea: Boolean(active && active.tagName === 'TEXTAREA'), isEntry: Boolean(active && active.hasAttribute && active.hasAttribute('data-wtsl-agent-entry')) },
    overflow: { doc: document.documentElement.scrollWidth - document.documentElement.clientWidth, body: document.body.scrollWidth - document.body.clientWidth },
  };
})()`;

const VISIBLE_TEXT = `(() => {
  const el = document.querySelector('[data-wtsl-agent-surface]');
  if (!el) return '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('.wtsl-agent-sr-only').forEach((node) => node.remove());
  return String(clone.textContent || '').replace(/\\s+/g, ' ').trim();
})()`;

const STORAGE_AUDIT = `(() => {
  const audit = { keys: [], hasDataAudio: false, hasLargeBase64: false, conversations: null };
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    const value = localStorage.getItem(key) || '';
    const hasDataAudio = value.includes('data:audio');
    const hasLargeBase64 = /[A-Za-z0-9+/]{2000,}/.test(value);
    audit.keys.push({ key, length: value.length, hasDataAudio, hasLargeBase64 });
    if (hasDataAudio) audit.hasDataAudio = true;
    if (hasLargeBase64) audit.hasLargeBase64 = true;
    if (key === 'agent.conversations') {
      try { audit.conversations = JSON.parse(value); } catch { audit.conversations = null; }
    }
  }
  const serialized = JSON.stringify(audit.conversations || null) || '';
  audit.conversationsHasAudio = serialized.includes('data:audio');
  audit.conversationsHasLargeBase64 = /[A-Za-z0-9+/]{2000,}/.test(serialized);
  audit.totalBytes = audit.keys.reduce((sum, item) => sum + item.length, 0);
  return audit;
})()`;

async function evaluate(expression) {
  return cdp.evaluate(expression);
}

async function waitFor(expression, timeout, message) {
  return cdp.waitFor(expression, { timeout, interval: 80, message });
}

async function surfaceState() {
  return evaluate(SURFACE_STATE);
}

async function waitStage(stage, timeout = 20000) {
  return waitFor(
    `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === ${JSON.stringify(stage)}`,
    timeout,
    `Agent 未到 ${stage} 阶段`,
  );
}

async function waitVoiceStage(voiceStage, timeout = 10000) {
  return waitFor(
    `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage') === ${JSON.stringify(voiceStage)}`,
    timeout,
    `Agent 语音状态未到 ${voiceStage}（实际 ${await evaluate(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage')`)}）`,
  );
}

async function waitCards(expected = 6, timeout = 180000) {
  return waitFor(
    `document.querySelectorAll('[data-widget-card]').length === ${expected}`,
    timeout,
    `桌面 ${expected} 卡未就绪`,
  );
}

/** 等 6 个 widget iframe（+后台 iframe）真正渲染出内容：截图/视觉断言前调用，避免抓到白块首帧 */
async function waitIframesRendered() {
  return waitFor(
    `(() => {
      const frames = [...document.querySelectorAll('iframe')];
      if (frames.length === 0) return false;
      const loaded = frames.filter((el) => {
        try {
          return Boolean(el.contentDocument && el.contentDocument.body && String(el.contentDocument.body.innerText || '').trim().length > 0);
        } catch (error) { return false; }
      });
      return loaded.length >= Math.min(6, frames.length);
    })()`,
    90000,
    '插件 iframe 内容未渲染',
  );
}

async function waitTextFor(expression, timeout, message) {
  return waitFor(expression, timeout, message);
}

/** 当前是否还有生成中的回答（streaming） */
async function sessionIdle(timeout = 30000) {
  return waitFor(
    `!document.querySelector('[aria-label="停止生成"]') && !document.querySelector('[aria-label="正在生成回答"]')`,
    timeout,
    '等不到会话空闲（仍在生成回答）',
  );
}

/** 在指定 pane 内按 aria-label 找可见按钮并原生 click()（跨 pane 的同名控件/隐藏层不会误点） */
async function clickPaneButton(paneName, label) {
  return evaluate(`(() => {
    const pane = document.querySelector('[data-wtsl-agent-pane=${JSON.stringify(paneName)}]');
    if (!pane) return false;
    const visible = (node) => {
      if (!node || node.nodeType !== 1) return false;
      const own = getComputedStyle(node);
      if (own.display === 'none' || own.visibility === 'hidden') return false;
      for (let current = node; current && current.nodeType === 1; current = current.parentElement) {
        if (Number(getComputedStyle(current).opacity) < 0.05) return false;
        if (current.hasAttribute && (current.hasAttribute('inert') || current.getAttribute('aria-hidden') === 'true')) return false;
      }
      const r = node.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    const el = [...pane.querySelectorAll('[aria-label=${JSON.stringify(String(label))}]')].find(visible);
    if (!el) return false;
    el.click();
    return true;
  })()`);
}

/** 把浮层收敛到 collapsed（幂等，供各步骤独立从干净状态开始）。
 *  v0.3.7：用 pane 内按钮 DOM click 收敛，避免 Esc 焦点/过渡导致的不稳定；Esc 链由专门用例覆盖。 */
async function ensureCollapsed() {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const state = await surfaceState();
    if (!state) throw new Error('surface 不存在，无法恢复 collapsed');
    if (state.stage === 'collapsed' && state.voiceStage === 'idle') {
      await settle(380); // 等收起动画（200–300ms）落定，入口按钮恢复 56×56 后才可稳定点击
      return true;
    }
    if (state.voiceStage !== 'idle') {
      const cancelled = await clickPaneButton('voice', '取消录音');
      if (!cancelled) await pressEscape();
      await sleep(450);
      continue;
    }
    if (state.stage === 'chat') {
      const clicked = await clickPaneButton('chat', '关闭 Agent');
      if (!clicked) await pressEscape();
    } else if (state.stage === 'voice') {
      const clicked = await clickPaneButton('voice', '收起 Agent');
      if (!clicked) await pressEscape();
    }
    try {
      await waitStage('collapsed', 8000);
      await settle(380);
      return true;
    } catch {
      /* 再来一轮 */
    }
  }
  throw new Error(`无法回到 collapsed（当前 ${JSON.stringify(await surfaceState())}）`);
}

/** 点右下角入口（进入 voice + 录音）。先收敛到 collapsed：收起动画中入口层
 *  仍是整块大矩形，按旧坐标点击会在 mouseUp 落空；在 voice/chat 阶段入口层 pointer-events=none。 */
async function clickEntry() {
  await ensureCollapsed();
  await clickSelector('[data-wtsl-agent-entry]');
  await waitStage('voice', 15000);
  await waitVoiceStage('recording', 20000);
}

async function spaceTapInPage(holdMs) {
  // CDP Input.dispatchKeyEvent 往返在弱机下会拉长按键间隔（可能 >300ms），
  // 用页面内合成事件精确控制“按住时长”，验证 <300ms 取消语义。
  return evaluate(`(() => new Promise((resolve) => {
    const down = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true });
    window.dispatchEvent(down);
    setTimeout(() => {
      const up = new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true, cancelable: true });
      window.dispatchEvent(up);
      resolve(true);
    }, ${holdMs});
  }))()`);
}

async function settle(ms = 500) {
  await sleep(ms);
}

/** 收起动画（200–250ms）与浏览器默认 focus 行为都有延迟：按时间线采样 activeElement，
 *  用于区分“焦点真的没回入口（产品 bug）”与“采样早于过渡结束（测试问题）”。 */
async function focusTimeline() {
  const samples = [];
  const offsets = [0, 120, 300, 600, 1100];
  let previous = 0;
  for (const offset of offsets) {
    if (offset > previous) await sleep(offset - previous);
    previous = offset;
    const sample = await evaluate(`(() => {
      const a = document.activeElement;
      return {
        at: ${offset},
        tag: a && a.tagName,
        aria: a && a.getAttribute && a.getAttribute('aria-label'),
        isEntry: Boolean(a && a.hasAttribute && a.hasAttribute('data-wtsl-agent-entry')),
        stage: document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') || null,
        surfaceTransition: document.querySelector('[data-wtsl-agent-surface]')
          ? getComputedStyle(document.querySelector('[data-wtsl-agent-surface]')).transitionDuration
          : null,
      };
    })()`);
    samples.push(sample);
  }
  return samples;
}

async function clickPoint(x, y) {
  await cdp.dispatchMouse('mouseMoved', x, y);
  await cdp.dispatchMouse('mousePressed', x, y);
  await sleep(45);
  await cdp.dispatchMouse('mouseReleased', x, y);
  await sleep(120);
}

async function clickSelector(selector, timeout = 20000) {
  const point = await waitFor(
    `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`,
    timeout,
    `找不到可点击元素 ${selector}`,
  );
  await clickPoint(point.x, point.y);
}

async function clickAria(label, timeout = 20000) {
  const point = await waitFor(
    `(() => {
      const needle = ${JSON.stringify(label)};
      for (const el of document.querySelectorAll('[aria-label]')) {
        if ((el.getAttribute('aria-label') || '').trim() !== needle) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    })()`,
    timeout,
    `找不到可见 aria-label：${label}`,
  );
  await clickPoint(point.x, point.y);
}

async function clickTextButton(text, timeout = 20000) {
  const point = await waitFor(
    `(() => {
      const needle = ${JSON.stringify(text)};
      for (const el of document.querySelectorAll('button')) {
        const label = String(el.innerText || '').replace(/\\s+/g, ' ').trim();
        if (label !== needle) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    })()`,
    timeout,
    `找不到文本按钮：${text}`,
  );
  await clickPoint(point.x, point.y);
}

async function pressKey(type, key, code, keyCode, modifiers = 0, text = '') {
  await cdp.send('Input.dispatchKeyEvent', {
    type,
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode,
    modifiers,
    ...(text && type === 'keyDown' ? { text, unmodifiedText: text } : {}),
  });
}

async function pressEscape() {
  await pressKey('keyDown', 'Escape', 'Escape', 27);
  await pressKey('keyUp', 'Escape', 'Escape', 27);
  await sleep(200);
}

async function pressEnter() {
  await pressKey('keyDown', 'Enter', 'Enter', 13);
  await pressKey('keyUp', 'Enter', 'Enter', 13);
  await sleep(150);
}

async function pressCtrlComma() {
  await pressKey('rawKeyDown', ',', 'Comma', 188, 2);
  await pressKey('keyUp', ',', 'Comma', 188, 2);
  await sleep(300);
}

async function insertText(text) {
  await cdp.send('Input.insertText', { text });
  await sleep(120);
}

async function screenshot(name) {
  const file = join(OUT, name);
  await cdp.screenshot(file);
  return file;
}

// ---------------------------------------------------------------------------
// 断言片段
// ---------------------------------------------------------------------------

const OPEN_TIMING = { 'open-voice': 300, 'open-chat': 300, 'back-voice': 250, 'back-collapsed': 200, 'close-chat': 250 };

function durationMs(value) {
  const first = String(value || '').split(',')[0].trim();
  if (first.endsWith('ms')) return Number.parseFloat(first);
  if (first.endsWith('s')) return Number.parseFloat(first) * 1000;
  return Number.NaN;
}

function checkTransition(state, kind, label) {
  const actual = durationMs(state.transitionDuration);
  const expected = OPEN_TIMING[kind];
  const ok = Number.isFinite(actual) && Math.abs(actual - expected) <= 80;
  return check(
    `${label}：transitionDuration ≈ 契约 ${expected}ms`,
    ok,
    `实际 ${state.transitionDuration}（motion=${state.motion}）`,
  );
}

function checkGeometry(state, stage, tag, { width, height }) {
  const okW = Math.abs(state.width - width) <= 2;
  const okH = Math.abs(state.height - height) <= 2;
  check(
    `${tag} ${stage} 尺寸 ${width}×${height}`,
    okW && okH,
    `实际 ${state.width}×${state.height}`,
  );
  check(`${tag} ${stage} 圆角 12px`, state.radius === '12px', `实际 ${state.radius}`);
}

async function checkNoOverflow(tag) {
  const state = await surfaceState();
  check(`${tag} 无横向溢出`, state.overflow.doc <= 0 && state.overflow.body <= 0, JSON.stringify(state.overflow));
}

function checkVisibleTextSanitized(text, label) {
  const forbidden = ['语音', '转写', '正在聆听', '正在识别', '录音中'];
  const hits = forbidden.filter((word) => text.includes(word));
  check(`${label}：界面无「语音/转写」解释文字`, hits.length === 0, hits.length ? `命中 ${hits.join('、')}：${text.slice(0, 160)}` : '');
}

// ---------------------------------------------------------------------------
// 会话
// ---------------------------------------------------------------------------

const FETCH_RECORDER = `(() => {
  window.__wtslReqBodies = [];
  const original = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const body = init && init.body != null ? String(init.body) : '';
      window.__wtslReqBodies.push({
        url: String(url).slice(0, 200),
        bodyLength: body.length,
        hasInputAudio: body.includes('input_audio') || body.includes('data:audio'),
      });
    } catch (error) { /* ignore */ }
    return original(input, init);
  };
})();`;

/** 记录 getUserMedia 返回的 MediaStream：用于断言“取消录音后麦克风轨道已停止”。 */
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

async function installPageInstrumentation() {
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: FETCH_RECORDER });
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: MIC_TRACKER });
}

async function openMockSurface({ agentOpen = false } = {}) {
  const query = agentOpen ? '/?mock=1&agent=1' : '/?mock=1';
  // Vite dev server 偶发冷启动/重优化会让首个页面 15–60s 才挂载；给两次机会
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await cdp.navigate(`${BASE_URL}${query}`, { timeout: 180000 });
    try {
      await waitFor(`Boolean(document.querySelector('[data-wtsl-agent-surface]'))`, 120000, 'Agent surface 未渲染');
      return;
    } catch (error) {
      if (attempt === 1) throw error;
      await sleep(3000);
    }
  }
}

async function collectBaseAssertions(tag) {
  const base = await evaluate(`(() => ({
    dockCount: document.querySelectorAll('.desktop-dock, [aria-label="桌面入口"]').length,
    botIcons: [...document.querySelectorAll('[aria-label]')].filter((el) => /机器人|Bot|Person|头像|Avatar|麦克风|Mic/i.test(el.getAttribute('aria-label') || '')).length,
    botImages: [...document.querySelectorAll('img')].filter((el) => /机器人|bot|avatar|person/i.test(el.getAttribute('alt') || '')).length,
    botText: String(document.body.innerText || '').includes('机器人'),
    surfaceCount: document.querySelectorAll('[data-wtsl-agent-surface]').length,
    entryCount: document.querySelectorAll('[data-wtsl-agent-entry]').length,
  }))()`);
  check(`${tag} 无 dock`, base.dockCount === 0, `dockCount=${base.dockCount}`);
  check(`${tag} 无机器人/头像/麦克风图标`, base.botIcons === 0 && base.botImages === 0 && !base.botText, JSON.stringify(base));
  check(`${tag} 只有一个 Agent 浮层与一个入口`, base.surfaceCount === 1 && base.entryCount === 1, JSON.stringify(base));

  const state = await surfaceState();
  expect(state.stage === 'collapsed', `初始不是 collapsed：${state.stage}`);
  checkGeometry(state, 'collapsed', tag, { width: 56, height: 56 });
  check(`${tag} 入口 aria-label=开始语音提问`, state.entryRect?.aria === '开始语音提问', JSON.stringify(state.entryRect));
  check(`${tag} 入口按钮 56×56`, state.entryRect?.w === 56 && state.entryRect?.h === 56, JSON.stringify(state.entryRect));
}

// ---- 主会话（1440×960 dark，全量语义） ----
async function runFullSession() {
  currentTag = '1440-dark';
  cdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
  const evidence = { transitions: {}, timings: {}, storage: null, fetch: null, screenshots: [] };
  try {
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: FETCH_RECORDER });
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: MIC_TRACKER });
    await openMockSurface();
    await waitCards(6);

    currentTag = '1440-dark';
    await step('入口形态', async () => {
      await collectBaseAssertions('1440-dark');
      await checkNoOverflow('1440-dark');
      await waitIframesRendered();
      await settle(500);
      evidence.screenshots.push(await screenshot('01-collapsed-1440-dark.png'));
      return 'collapsed 56×56 / 无 dock / 无机器人图标';
    });

    await step('点入口立即录音（单次点击，不需要第二下）', async () => {
      // 记录 data-speaking 变化：TTS 可能在我们断言前播完，用 MutationObserver 保留“出现过播报”的证据
      await evaluate(`(() => {
        const surface = document.querySelector('[data-wtsl-agent-surface]');
        window.__agentSpeakingLog = [];
        if (!surface) return false;
        window.__agentSpeakingObserver = new MutationObserver(() => {
          window.__agentSpeakingLog.push({ at: Date.now(), speaking: surface.getAttribute('data-speaking') === 'true' });
        });
        window.__agentSpeakingObserver.observe(surface, { attributes: true, attributeFilter: ['data-speaking'] });
        return true;
      })()`);
      const clickAt = Date.now();
      await clickEntry();
      const recordingAt = Date.now();
      evidence.timings.clickToRecordingMs = recordingAt - clickAt;
      check('单击入口后进入录音（无需第二下）', true, `click→recording ${recordingAt - clickAt}ms`);
      await settle(500);
      const state = await surfaceState();
      evidence.transitions['open-voice'] = state;
      checkTransition(state, 'open-voice', 'button → voice');
      checkGeometry(state, 'voice', '1440-dark', { width: 420, height: 422.4 });
      await checkNoOverflow('1440-dark');
      evidence.screenshots.push(await screenshot('02-recording-1440-dark.png'));
      return JSON.stringify({ clickToRecordingMs: recordingAt - clickAt });
    });

    await step('录音态：声纹带 + 无解释文字', async () => {
      await settle(600);
      const wave = await evaluate(`(() => {
        const el = document.querySelector('[data-wtsl-agent-surface]');
        return {
          animatedBars: el ? el.querySelectorAll('[data-wtsl-agent-animated="true"]').length : 0,
          bars: el ? el.querySelectorAll('.wtsl-agent-wave-bar').length : 0,
        };
      })()`);
      check('录音态声纹竖条存在', wave.bars >= 20, JSON.stringify(wave));
      const visibleText = await evaluate(VISIBLE_TEXT);
      checkVisibleTextSanitized(visibleText, '录音态');
      check('录音态有停止/取消按钮', await evaluate(`Boolean(document.querySelector('[aria-label="结束录音并发送"]') && document.querySelector('[aria-label="取消录音"]'))`));
      return JSON.stringify(wave);
    });

    await step('停止→transcribing→停留 voice（绝不自动 morph 到 chat）', async () => {
      const beforeCount = await evaluate(`document.querySelectorAll('[aria-label^="语音消息："]').length`);
      // 阶段观测：从停止录音到回答完成，data-stage 不允许出现 chat
      await evaluate(`(() => {
        const surface = document.querySelector('[data-wtsl-agent-surface]');
        window.__stageLog = [];
        if (!surface) return false;
        const record = () => window.__stageLog.push({
          at: Date.now(),
          stage: surface.getAttribute('data-stage'),
          voiceStage: surface.getAttribute('data-voice-stage'),
        });
        record();
        window.__stageObserver = new MutationObserver(record);
        window.__stageObserver.observe(surface, { attributes: true, attributeFilter: ['data-stage', 'data-voice-stage'] });
        return true;
      })()`);
      await clickAria('结束录音并发送');
      let transcribing = false;
      for (let attempt = 0; attempt < 80; attempt += 1) {
        const voiceStage = await evaluate(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage')`);
        if (voiceStage === 'transcribing') {
          transcribing = true;
          await sleep(420); // mock ASR 650ms：约 450ms 点截转写态（可看到 >400ms 才出现的 spinner）
          evidence.screenshots.push(await screenshot('03-transcribing-1440-dark.png'));
          break;
        }
        if (voiceStage === 'idle') break;
        await sleep(40);
      }
      check('停止后出现 transcribing 状态', transcribing, `voiceStage=${await evaluate(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage')`)}`);
      // 等语音回合完成：转写文字进 peek、voiceStage 回 idle、会话空闲
      await waitFor(
        `String(document.querySelector('[data-wtsl-agent-surface]')?.textContent || '').includes('帮我看看今天的待办')`,
        30000,
        '转写文字未出现',
      );
      await waitVoiceStage('idle', 30000);
      await sessionIdle(40000);
      await sleep(500);
      const stayVoice = await surfaceState();
      check('语音回合结束后 stage 仍是 voice（不自动展开 chat）', stayVoice.stage === 'voice', `stage=${stayVoice.stage}`);
      const stageLog = await evaluate(`window.__stageLog || []`);
      check(
        '语音回合全程 data-stage 从未变成 chat',
        !stageLog.some((item) => item.stage === 'chat'),
        JSON.stringify(stageLog.filter((item) => item.stage === 'chat').slice(0, 4)),
      );
      const paneAudit = await evaluate(`(() => {
        const visible = (node) => {
          if (!node || node.nodeType !== 1) return false;
          const own = getComputedStyle(node);
          if (own.display === 'none' || own.visibility === 'hidden') return false;
          for (let current = node; current && current.nodeType === 1; current = current.parentElement) {
            if (Number(getComputedStyle(current).opacity) < 0.05) return false;
            if (current.hasAttribute && (current.hasAttribute('inert') || current.getAttribute('aria-hidden') === 'true')) return false;
          }
          const r = node.getBoundingClientRect();
          return r.width > 1 && r.height > 1;
        };
        const pane = document.querySelector('[data-wtsl-agent-pane="voice"]');
        const surface = document.querySelector('[data-wtsl-agent-surface]');
        const textareas = surface ? [...surface.querySelectorAll('textarea')] : [];
        return {
          voicePane: Boolean(pane),
          voicePaneTextareas: pane ? pane.querySelectorAll('textarea').length : -1,
          surfaceTextareas: textareas.length,
          surfaceVisibleTextareas: textareas.filter(visible).length,
          focusedTag: document.activeElement && document.activeElement.tagName,
          focusedAria: document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('aria-label'),
        };
      })()`);
      check('半高 voice 窗内 textarea 数 = 0（纯语音）', paneAudit.voicePane === true && paneAudit.voicePaneTextareas === 0, JSON.stringify(paneAudit));
      check('语音回合后无可见输入框（空格不可能打出空格）', paneAudit.surfaceVisibleTextareas === 0, JSON.stringify(paneAudit));
      check(
        '语音回合后焦点不在 textarea',
        paneAudit.focusedTag !== 'TEXTAREA' && paneAudit.focusedAria !== '给 Agent 发消息',
        JSON.stringify(paneAudit),
      );
      check(
        '语音回合后仍是半高几何',
        stayVoice.width >= 360 && stayVoice.width <= 520 && stayVoice.height >= 300 && stayVoice.height <= 490,
        `${stayVoice.width}×${stayVoice.height}`,
      );
      // 显式「展开对话」进入 chat，继续做气泡/播报断言
      await clickAria('展开对话', 15000);
      await waitStage('chat', 20000);
      const transitionState = await surfaceState();
      evidence.transitions['open-chat'] = transitionState;
      checkTransition(transitionState, 'open-chat', 'voice → chat');
      await settle(600);
      const state = await surfaceState();
      checkGeometry(state, 'chat', '1440-dark', { width: 420, height: 920 });
      await sleep(300);
      return JSON.stringify({ beforeCount, stage: state.stage, stayedVoice: stayVoice.stage });
    });

    await step('语音气泡：转写文字 + 声纹 + 无文字标签', async () => {
      await waitFor(`document.body.innerText.includes('帮我看看今天的待办')`, 30000, '转写文字未出现');
      const bubble = await evaluate(`(() => {
        const row = [...document.querySelectorAll('[aria-label^="语音消息："]')].pop();
        if (!row) return null;
        const bars = [...row.querySelectorAll('span')].filter((el) => /px$/.test(el.style.height || ''));
        const clone = row.cloneNode(true);
        clone.querySelectorAll('.wtsl-agent-sr-only').forEach((node) => node.remove());
        return {
          aria: row.getAttribute('aria-label'),
          text: String(clone.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 200),
          peaksBars: bars.length,
        };
      })()`);
      expect(bubble, '找不到语音消息气泡');
      check('语音气泡 aria-label 为语音消息', /^语音消息：/.test(bubble.aria || ''), bubble.aria);
      check('语音气泡转写文字入气泡', bubble.text.includes('帮我看看今天的待办'), bubble.text);
      check('语音气泡有声纹装饰（12–24 桶）', bubble.peaksBars >= 12 && bubble.peaksBars <= 24, `peaksBars=${bubble.peaksBars}`);
      checkVisibleTextSanitized(bubble.text, '语音气泡');
      evidence.screenshots.push(await screenshot('04-chat-voice-bubble-1440-dark.png'));
      return JSON.stringify(bubble);
    });

    await step('语音提问自动播报 + 停止', async () => {
      let state = await surfaceState();
      let seen = state.speaking;
      if (!seen) {
        const log = await evaluate(`window.__agentSpeakingLog || []`);
        seen = log.some((item) => item.speaking === true);
      }
      if (!seen) {
        seen = await waitFor(
          `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-speaking') === 'true'`,
          12000,
          '语音提问后未自动进入 speaking',
        )
          .then(() => true)
          .catch(() => false);
        state = await surfaceState();
      }
      check('语音提问后自动播报（speaking 出现过）', seen === true, JSON.stringify(await evaluate(`window.__agentSpeakingLog || []`)));
      if (state.speaking) {
        check('播报中有「停止朗读」按钮', await evaluate(`Boolean(document.querySelector('[aria-label="停止朗读"]'))`));
        evidence.screenshots.push(await screenshot('05-speaking-1440-dark.png'));
        await clickAria('停止朗读');
        await waitFor(
          `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-speaking') !== 'true'`,
          15000,
          '停止朗读失败',
        );
        check('播报中可停止', true);
      } else {
        check('播报中可停止（若播报已结束则由后续单条朗读步骤覆盖）', true, 'auto-speak 已结束，未截到 speaking 画面');
      }
      const stoppedBefore = await surfaceState();
      if (stoppedBefore.speaking) {
        // 慢机/异步合成下可能在断言的瞬间仍在播报：停掉再断言，避免误报
        await evaluate(`(() => { const el = document.querySelector('[aria-label="停止朗读"]'); if (el) el.click(); return Boolean(el); })()`);
        await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-speaking') !== 'true'`, 15000, '停止朗读失败').catch(() => {});
      }
      const stopped = await surfaceState();
      check('停止后 speaking=false', stopped.speaking === false, String(stopped.speaking));
      return 'auto-speak';
    });

    await step('音频硬约束：localStorage / mock 请求无音频', async () => {
      const storage = await evaluate(STORAGE_AUDIT);
      evidence.storage = storage;
      check('localStorage 无 data:audio', storage.hasDataAudio === false, JSON.stringify(storage.keys.filter((item) => item.hasDataAudio)));
      check('localStorage 无大段 base64', storage.hasLargeBase64 === false, JSON.stringify(storage.keys.filter((item) => item.hasLargeBase64)));
      check('会话存储无音频字段', storage.conversationsHasAudio === false, '');
      const conversation = storage.conversations;
      let voiceMessage = null;
      if (Array.isArray(conversation)) {
        for (const item of conversation) {
          const messages = Array.isArray(item?.messages) ? item.messages : [];
          voiceMessage = messages.find((message) => message?.input === 'voice') || voiceMessage;
        }
      } else if (conversation && Array.isArray(conversation.messages)) {
        voiceMessage = conversation.messages.find((message) => message.input === 'voice') || null;
      }
      check('会话消息含 voice 输入且转写 ready', Boolean(voiceMessage) && voiceMessage.transcriptStatus === 'ready', JSON.stringify(voiceMessage && { input: voiceMessage.input, transcriptStatus: voiceMessage.transcriptStatus, peaks: voiceMessage.voicePeaks?.length, content: voiceMessage.content }));
      check('语音消息只存 voicePeaks 数字（无音频）', Boolean(voiceMessage) && Array.isArray(voiceMessage.voicePeaks) && voiceMessage.voicePeaks.every((peak) => typeof peak === 'number'), '');
      const fetchAudit = await evaluate(`window.__wtslReqBodies || []`);
      evidence.fetch = fetchAudit;
      check('mock 请求无 input_audio/data:audio', !fetchAudit.some((item) => item.hasInputAudio), JSON.stringify(fetchAudit.filter((item) => item.hasInputAudio)));
      return 'storage/fetch clean';
    });

    await step('Esc 语义：chat→voice→collapsed + 焦点回入口', async () => {
      await pressEscape();
      await waitStage('voice', 15000);
      await settle(350); // 等 chat→voice（250ms）几何过渡落定再取样
      const voiceState = await surfaceState();
      evidence.transitions['back-voice'] = voiceState;
      checkTransition(voiceState, 'back-voice', 'chat → voice');
      // 弱机/HMR 抖动可能吞掉一次按键：最多重试 3 次，每次都是真实 Esc
      let collapsed = null;
      let escAttempts = 0;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        escAttempts += 1;
        await pressEscape();
        try {
          await waitStage('collapsed', 5000);
          collapsed = await surfaceState();
          break;
        } catch {
          /* 再按一次 */
        }
      }
      expect(collapsed, `Esc 无法从 voice 收起（尝试 ${escAttempts} 次，当前 ${JSON.stringify(await surfaceState())}）`);
      await settle(350); // 等 voice→button（200ms）几何过渡落定再量尺寸/焦点
      collapsed = await surfaceState();
      evidence.transitions['back-collapsed'] = collapsed;
      checkTransition(collapsed, 'back-collapsed', 'voice → button');
      check('收起后焦点回到入口按钮', collapsed.activeElement.isEntry === true, JSON.stringify(collapsed.activeElement));
      check('收起后焦点不在 textarea', collapsed.activeElement.isTextarea !== true, JSON.stringify(collapsed.activeElement));
      checkGeometry(collapsed, 'collapsed', '1440-dark', { width: 56, height: 56 });
      return 'Esc semantics ok';
    });

    await step('语音窗点外部收起 + chat 草稿跨 voice 往返保留', async () => {
      // 进 voice idle
      await clickEntry();
      await clickAria('取消录音');
      await waitVoiceStage('idle', 10000);
      await settle(300);
      // 点外部：voice → collapsed
      await clickPoint(40, 40);
      await waitStage('collapsed', 15000);
      const outsideTimeline = await focusTimeline();
      evidence.focusOutside = outsideTimeline;
      const collapsed = await surfaceState();
      const lastOutside = outsideTimeline[outsideTimeline.length - 1];
      check('voice 点外部收起', collapsed.stage === 'collapsed', collapsed.stage);
      check('收起后焦点回入口', lastOutside.isEntry === true, JSON.stringify({ last: lastOutside }));
      check('收起后焦点不在 textarea', outsideTimeline.every((sample) => sample.isTextarea !== true), JSON.stringify(outsideTimeline));
      // chat 输入草稿 → ⌄ 回 voice → 再展开：草稿应保留（Composer 常驻挂载）
      await clickEntry();
      await clickAria('取消录音');
      await waitVoiceStage('idle', 10000);
      await clickAria('展开对话');
      await waitStage('chat', 20000);
      await settle(450);
      await clickSelector('[data-wtsl-agent-composer="chat"] textarea');
      await insertText('草稿保留测试');
      const draftBefore = await evaluate(`document.querySelector('[data-wtsl-agent-composer="chat"] textarea')?.value || ''`);
      expect(draftBefore === '草稿保留测试', `草稿未输入：${draftBefore}`);
      await clickAria('收起到语音窗');
      await waitStage('voice', 15000);
      await settle(450);
      await clickAria('展开对话');
      await waitStage('chat', 20000);
      await settle(450);
      const draftAfter = await evaluate(`document.querySelector('[data-wtsl-agent-composer="chat"] textarea')?.value || ''`);
      check('chat → voice → chat 后草稿保留', draftAfter === '草稿保留测试', `draft=${draftAfter}`);
      // 清空草稿，避免影响后续发送
      await evaluate(`(() => { const el = document.querySelector('[data-wtsl-agent-composer="chat"] textarea'); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; setter.call(el, ''); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
      await clickAria('关闭 Agent');
      await waitStage('collapsed', 15000);
      return 'draft kept across voice';
    });

    await step('空格按住发送 / <300ms 取消 / 输入框内不触发', async () => {
      // 长按发送（v0.3.7：语音结束后停留 voice，不自动展开 chat）
      await ensureCollapsed();
      await sessionIdle(30000);
      await pressKey('keyDown', ' ', 'Space', 32);
      await waitVoiceStage('recording', 15000);
      const duringLongPress = await surfaceState();
      check('空格长按进入录音且 stage=voice', duringLongPress.stage === 'voice' && duringLongPress.voiceStage === 'recording', JSON.stringify({ stage: duringLongPress.stage, voiceStage: duringLongPress.voiceStage }));
      await sleep(700);
      await pressKey('keyUp', ' ', 'Space', 32);
      await waitVoiceStage('transcribing', 15000);
      check('空格松开进入 transcribing', true);
      await waitFor(
        `String(document.querySelector('[data-wtsl-agent-surface]')?.textContent || '').includes('我听到你的语音了')`,
        40000,
        '空格语音回合回答未出现',
      );
      await waitVoiceStage('idle', 30000);
      await sessionIdle(40000);
      await settle(600);
      const longPressState = await surfaceState();
      check('空格长按 → 录音 → 发送 → 停留 voice（不 morph chat）', longPressState.stage === 'voice', longPressState.stage);
      check('空格语音回合后无可见输入框', longPressState.visibleTextareas === 0, JSON.stringify({ visible: longPressState.visibleTextareas, mounted: longPressState.textareasInSurface }));
      // 回 collapsed
      await ensureCollapsed();
      await sessionIdle(30000); // 上一轮语音回答结束前，空格会被 session.status!==idle 守卫忽略
      // <300ms 取消：页面内合成 keydown/keyup（间隔 80ms，不受 CDP 往返延迟影响）
      const before = await evaluate(`document.querySelectorAll('[aria-label^="语音消息："]').length`);
      await spaceTapInPage(80);
      await sleep(1800);
      const afterState = await surfaceState();
      const after = await evaluate(`document.querySelectorAll('[aria-label^="语音消息："]').length`);
      // 再等 1.5s 复核：若 startRecording 的 then 回调没执行取消，录音会一直挂到用户手动停止
      await sleep(1500);
      const laterState = await surfaceState();
      const mic = await evaluate(`(() => {
        const streams = window.__wtslMicStreams || [];
        const tracks = [];
        for (const stream of streams) {
          for (const track of stream.getTracks()) tracks.push(track.kind + ':' + track.readyState);
        }
        return { streams: streams.length, tracks, liveTracks: tracks.filter((item) => item.endsWith(':live')).length };
      })()`);
      check(
        '空格 <300ms 取消（不发送、停留 voice、不残留录音）',
        afterState.voiceStage === 'idle' && afterState.stage === 'voice' && laterState.voiceStage === 'idle' && after === before,
        JSON.stringify({ at1800: { stage: afterState.stage, voiceStage: afterState.voiceStage }, at3300: { stage: laterState.stage, voiceStage: laterState.voiceStage }, before, after }),
      );
      check('快速点按取消后麦克风轨道全部停止', mic.liveTracks === 0, JSON.stringify(mic));
      // 清理现场（若复现出残留录音，先按 Esc 取消，继续后续用例）
      if (laterState.voiceStage !== 'idle') {
        await pressEscape();
        await sleep(500);
      }
      // 焦点在 chat textarea 内：空格必须打字，不触发录音
      await ensureCollapsed();
      await sessionIdle(20000);
      await clickEntry();
      await clickAria('取消录音');
      await waitVoiceStage('idle', 10000);
      await clickAria('展开对话');
      await waitStage('chat', 20000);
      await settle(450);
      await clickSelector('[data-wtsl-agent-composer="chat"] textarea');
      await insertText('空格不应录音');
      const beforeVoice = await evaluate(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage')`);
      await pressKey('keyDown', ' ', 'Space', 32, 0, ' ');
      await sleep(400);
      const duringVoice = await evaluate(`(() => ({
        voiceStage: document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage'),
        value: document.querySelector('[data-wtsl-agent-composer="chat"] textarea')?.value || '',
        focused: document.activeElement && document.activeElement.tagName === 'TEXTAREA',
      }))()`);
      await pressKey('keyUp', ' ', 'Space', 32);
      check('焦点在 textarea 时空格不开始录音', beforeVoice === 'idle' && duringVoice.voiceStage === 'idle', JSON.stringify({ beforeVoice, duringVoice }));
      check('焦点在 textarea 时空格被当作字符输入', String(duringVoice.value || '').includes('空格不应录音 '), JSON.stringify(duringVoice));
      await evaluate(`(() => { const el = document.querySelector('[data-wtsl-agent-composer="chat"] textarea'); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; setter.call(el, ''); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
      return 'space ok';
    });

    await step('文字提问默认不播报 + 单条朗读可停 + chat 点外不关', async () => {
      await ensureCollapsed();
      await sessionIdle(20000);
      await clickEntry();
      await clickAria('取消录音');
      await waitVoiceStage('idle', 10000);
      await clickAria('展开对话');
      await waitStage('chat', 20000);
      await settle(450);
      await clickSelector('[data-wtsl-agent-composer="chat"] textarea');
      await insertText('你好');
      await pressEnter();
      await settle(400);
      const textState = await surfaceState();
      check('文字提问后 stage 仍是 chat（文字通道只存在于全高窗）', textState.stage === 'chat', textState.stage);
      await waitFor(`Boolean(document.querySelector('[aria-label="朗读这条回答"]'))`, 30000, '文字回答未完成（无单条朗读按钮）');
      await sleep(1800);
      const speaking = await evaluate(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-speaking') === 'true'`);
      check('文字提问默认不自动播报', speaking === false, '');
      await clickAria('朗读这条回答');
      const speakTarget = await evaluate(`(() => {
        const buttons = [...document.querySelectorAll('[aria-label="朗读这条回答"]')];
        const el = buttons[buttons.length - 1];
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      expect(speakTarget, '找不到单条朗读按钮');
      await clickPoint(speakTarget.x, speakTarget.y);
      await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-speaking') === 'true'`, 15000, '单条朗读未开始');
      evidence.screenshots.push(await screenshot('05-speaking-1440-dark.png'));
      check('单条朗读可开始', true);
      // 停止按钮可能在弱机 CDP 往返期间已经播完：用页面内直接点击，停止与否以 speaking 状态为准
      await evaluate(`(() => { const el = document.querySelector('[aria-label="停止朗读"]'); if (el) el.click(); return Boolean(el); })()`);
      await waitFor(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-speaking') !== 'true'`, 15000, '单条朗读未停止');
      check('单条朗读可停止', true);
      await clickPoint(30, 30);
      await sleep(400);
      const afterOutside = await surfaceState();
      check('chat 点外部不关闭', afterOutside.stage === 'chat', afterOutside.stage);
      evidence.screenshots.push(await screenshot('06-chat-1440-dark.png'));
      return 'text no autoplay / single speak / outside';
    });

    await step('⌄ 收起 / X 关闭 / 焦点回归', async () => {
      await ensureCollapsed();
      await sessionIdle(20000);
      // 进 chat，再测 ⌄（收起到语音窗）
      await clickEntry();
      await clickAria('取消录音');
      await waitVoiceStage('idle', 10000);
      await clickAria('展开对话');
      await waitStage('chat', 20000);
      await settle(400);
      await clickAria('收起到语音窗');
      await waitStage('voice', 15000);
      await settle(350); // 等 250ms 几何过渡结束再点 X，避免点击落在过渡中的位置
      check('⌄ 收起到 voice', true);
      await clickAria('收起 Agent');
      await waitStage('collapsed', 15000);
      const voiceXTimeline = await focusTimeline();
      evidence.focusVoiceX = voiceXTimeline;
      const collapsed = await surfaceState();
      const lastVoiceX = voiceXTimeline[voiceXTimeline.length - 1];
      check('voice X 直接收成按钮', collapsed.stage === 'collapsed');
      check('voice X 后焦点回入口', lastVoiceX.isEntry === true, JSON.stringify({ last: lastVoiceX, timeline: voiceXTimeline }));
      check('voice X 后焦点不在 textarea', voiceXTimeline.every((sample) => sample.isTextarea !== true), JSON.stringify(voiceXTimeline));
      // 进入 chat 再测 chat X
      await clickEntry();
      await clickAria('取消录音');
      await waitVoiceStage('idle', 10000);
      await clickAria('展开对话');
      await waitStage('chat', 20000);
      await settle(400);
      await clickAria('关闭 Agent');
      await waitStage('collapsed', 15000);
      const chatXTimeline = await focusTimeline();
      evidence.focusChatX = chatXTimeline;
      const closed = await surfaceState();
      const lastChatX = chatXTimeline[chatXTimeline.length - 1];
      check('chat X 直接收成按钮', closed.stage === 'collapsed');
      check('chat X 后焦点回入口', lastChatX.isEntry === true, JSON.stringify({ last: lastChatX, timeline: chatXTimeline }));
      return 'X/⌄ ok';
    });

    await step('Agent 设置对话框：仅语音/模型/搜索', async () => {
      await ensureCollapsed();
      await sessionIdle(30000);
      await clickEntry();
      await clickAria('取消录音');
      await waitVoiceStage('idle', 10000);
      const voiceProbe = await surfaceState();
      check(
        '整理后 voice 窗无输入框（文字输入只在 chat）',
        voiceProbe.stage === 'voice' && voiceProbe.visibleTextareas === 0,
        JSON.stringify({ stage: voiceProbe.stage, voiceStage: voiceProbe.voiceStage, visibleTextareas: voiceProbe.visibleTextareas }),
      );
      await clickAria('展开对话');
      await waitStage('chat', 20000);
      await settle(450);
      check(
        'chat 存在单行 composer 输入框',
        await evaluate(`Boolean(document.querySelector('[data-wtsl-agent-composer="chat"] textarea'))`),
        'chat composer textarea',
      );
      await clickAria('更多');
      await waitFor(`Boolean(document.querySelector('[role="menu"]'))`, 15000, '更多菜单未打开');
      const item = await waitFor(
        `(() => {
          for (const el of document.querySelectorAll('[role="menuitem"]')) {
            if (String(el.innerText || '').includes('Agent 设置')) {
              const r = el.getBoundingClientRect();
              return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            }
          }
          return null;
        })()`,
        15000,
        '菜单里没有 Agent 设置',
      );
      await clickPoint(item.x, item.y);
      // 注意：AgentSurface 自身在 composer/chat 阶段也带 role="dialog"，这里必须按内容匹配真正的设置对话框
      await waitFor(
        `[...document.querySelectorAll('[role="dialog"]')].some((el) => String(el.innerText || '').includes('Agent 设置'))`,
        15000,
        'Agent 设置对话框未打开',
      );
      const dialog = await evaluate(`(() => {
        const el = [...document.querySelectorAll('[role="dialog"]')].find((node) => String(node.innerText || '').includes('Agent 设置'));
        const text = String(el?.innerText || '').replace(/\\s+/g, ' ');
        return {
          text,
          hasVoice: text.includes('语音'),
          hasModel: text.includes('模型'),
          hasSearch: text.includes('联网搜索'),
          hasPanel: /面板|人脸|continuous|autoPlay|自动播报|连续对话/.test(text),
          hasReadText: text.includes('文字提问的回答也朗读'),
        };
      })()`);
      check('Agent 设置只有语音/模型/联网搜索', dialog.hasVoice && dialog.hasModel && dialog.hasSearch && !dialog.hasPanel, JSON.stringify({ voice: dialog.hasVoice, model: dialog.hasModel, search: dialog.hasSearch, legacy: dialog.hasPanel }));
      check('Agent 设置含「文字提问的回答也朗读」', dialog.hasReadText === true);
      evidence.screenshots.push(await screenshot('07-agent-settings-1440-dark.png'));
      await clickAria('关闭 Agent 设置');
      await waitFor(
        `![...document.querySelectorAll('[role="dialog"]')].some((el) => String(el.innerText || '').includes('Agent 设置'))`,
        15000,
        '设置对话框未关闭',
      );
      return 'settings dialog ok';
    });

    await step('设置入口：Ctrl+, / 编辑工具栏「设置」/ 「入口」组三按钮', async () => {
      await ensureCollapsed();
      await sessionIdle(30000);
      await pressCtrlComma();
      await waitFor(`document.body.innerText.includes('打开 Agent')`, 30000, 'Ctrl+, 未打开设置页');
      const entryGroup = await evaluate(`(() => {
        const group = document.querySelector('section[aria-label="入口"]');
        return {
          hasGroup: Boolean(group),
          text: group ? String(group.innerText || '').replace(/\\s+/g, ' ') : '',
          buttons: group ? [...group.querySelectorAll('button')].map((el) => String(el.innerText || '').trim()) : [],
        };
      })()`);
      check('Ctrl+, 打开设置页', true);
      check('设置页「入口」组存在且三按钮', entryGroup.hasGroup && entryGroup.buttons.length === 3, JSON.stringify(entryGroup));
      check('入口组含 Agent/复盘/插件管理', ['打开 Agent', '打开复盘', '管理插件'].every((label) => entryGroup.text.includes(label)), entryGroup.text);
      evidence.screenshots.push(await screenshot('08-settings-entry-1440-dark.png'));
      await clickTextButton('打开 Agent');
      await waitStage('chat', 20000);
      const openAgent = await evaluate(`({ stage: document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage'), entry: Boolean(document.querySelector('[data-wtsl-agent-entry]')) })`);
      check('设置页「打开 Agent」打开 chat（设置页内无入口按钮）', openAgent.stage === 'chat' && openAgent.entry === false, JSON.stringify(openAgent));
      // 受控 open 的 chat 不会随页面 Esc 收起：先点 X 收起，再 Esc 回桌面
      await clickAria('关闭 Agent');
      await waitStage('collapsed', 20000);
      await pressEscape(); // 全局快捷键：回桌面
      await waitFor(`document.querySelector('.host-desktop-layer')?.getAttribute('data-active') === 'true'`, 20000, '未回到桌面');
      // 长按桌面空白进编辑 → 工具栏「设置」
      const blank = await evaluate(`(() => {
        for (const y of [940, 930, 920, 910]) {
          for (const x of [10, 30, 760, 720]) {
            const el = document.elementFromPoint(x, y);
            if (!el) continue;
            if (el.closest('[data-widget-card], [data-wtsl-agent-surface]')) continue;
            if (!el.closest('.host-desktop-layer')) continue;
            return { x, y };
          }
        }
        return null;
      })()`);
      expect(blank, '找不到桌面空白点');
      await cdp.dispatchTouch('touchStart', [blank]);
      await sleep(750);
      await cdp.dispatchTouch('touchEnd', []);
      await waitFor(`[...document.querySelectorAll('[aria-label="编辑桌面"]')].some((el) => el.getAttribute('aria-hidden') !== 'true')`, 20000, '长按未进入编辑模式');
      check('长按桌面空白进入编辑模式', true);
      const toolbarButtons = await evaluate(`[...document.querySelectorAll('[aria-label="编辑桌面"] button')].map((el) => String(el.innerText || '').replace(/\\s+/g, ' ').trim()).filter(Boolean)`);
      check('编辑工具栏含「设置」按钮', toolbarButtons.includes('设置'), JSON.stringify(toolbarButtons));
      await clickTextButton('设置');
      await waitFor(`document.body.innerText.includes('打开 Agent')`, 30000, '编辑工具栏「设置」未打开设置页');
      check('编辑工具栏「设置」打开设置页', true);
      await clickTextButton('返回桌面');
      await waitFor(`document.querySelector('.host-desktop-layer')?.getAttribute('data-active') === 'true'`, 30000, '未回到桌面');
      return 'settings entries ok';
    });

    await step('空态截图（清空 Agent 会话）', async () => {
      await evaluate(`(() => { localStorage.removeItem('agent.conversations'); localStorage.removeItem('agent.activeConversation'); return true; })()`);
      await openMockSurface({ agentOpen: true });
      await waitStage('chat', 20000);
      await waitIframesRendered();
      await sleep(700);
      const emptyText = await evaluate(`String(document.querySelector('[data-wtsl-agent-surface]')?.innerText || '').replace(/\\s+/g, ' ').slice(0, 200)`);
      check('空态无消息（只有建议）', !emptyText.includes('语音消息'), emptyText);
      evidence.screenshots.push(await screenshot('09-empty-chat-1440-dark.png'));
      return emptyText;
    });

    await step('收尾：console error=0 / 横向溢出=0', async () => {
      await sleep(500);
      const errors = cdp.consoleErrors.slice();
      check('console error=0', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
      const state = await surfaceState();
      check('横向溢出=0', state.overflow.doc <= 0 && state.overflow.body <= 0, JSON.stringify(state.overflow));
      return 'clean';
    });
  } finally {
    try {
      await cdp.close();
    } catch (error) {
      console.error('Edge 清理失败', error?.message);
    }
    cdp = null;
  }
  writeFileSync(join(OUT, 'agent-surface-1440-dark.json'), JSON.stringify({ results, failures: failures.length, evidence }, null, 2));
  return evidence;
}

// ---- 1024×768 light：视觉截图 + 尺寸 ----
async function runLightSession() {
  currentTag = '1024-light';
  cdp = await launch({ width: 1024, height: 768, scheme: 'light' });
  try {
    await installPageInstrumentation();
    await openMockSurface();
    await waitCards(6);
    await step('light 入口', async () => {
      await collectBaseAssertions('1024-light');
      await waitIframesRendered();
      await settle(400);
      await screenshot('11-collapsed-1024-light.png');
      return 'collapsed';
    });
    await step('light 录音与尺寸', async () => {
      await clickEntry();
      await sleep(600);
      const state = await surfaceState();
      evidenceDimsLight = state;
      checkGeometry(state, 'voice', '1024-light', { width: 420, height: 337.92 });
      await checkNoOverflow('1024-light');
      await screenshot('12-recording-1024-light.png');
      return JSON.stringify({ w: state.width, h: state.height });
    });
    await step('light 语音回合停留 voice + chat 尺寸/气泡', async () => {
      await clickAria('结束录音并发送');
      let transcribingShot = false;
      for (let attempt = 0; attempt < 80; attempt += 1) {
        const voiceStage = await evaluate(`document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage')`);
        if (voiceStage === 'transcribing') {
          await sleep(420); // 450ms 点左右截转写态（spinner 在 >400ms 出现）
          await screenshot('03-transcribing-1024-light.png');
          transcribingShot = true;
          break;
        }
        if (voiceStage === 'idle') break;
        await sleep(40);
      }
      check('light 转写态截图', transcribingShot, transcribingShot ? '03-transcribing-1024-light.png' : '未捕捉到 transcribing（窗口可能被慢机错过）');
      await waitVoiceStage('idle', 40000);
      await sessionIdle(40000);
      await settle(500);
      const voiceState = await surfaceState();
      check('light 语音回合后仍停留 voice（不自动 morph chat）', voiceState.stage === 'voice', `stage=${voiceState.stage}`);
      check('light 语音回合后无可见输入框', voiceState.visibleTextareas === 0, JSON.stringify({ visible: voiceState.visibleTextareas, mounted: voiceState.textareasInSurface }));
      await waitFor(`String(document.querySelector('[data-wtsl-agent-surface]')?.textContent || '').includes('帮我看看今天的待办')`, 30000, 'light 转写文字未出现');
      await screenshot('04-voice-reply-1024-light.png');
      await clickAria('展开对话');
      await waitStage('chat', 20000);
      await settle(700); // 等 300ms 几何过渡结束再量尺寸/截图
      const state = await surfaceState();
      checkGeometry(state, 'chat', '1024-light', { width: 420, height: 728 });
      await checkNoOverflow('1024-light');
      await sleep(300);
      await screenshot('13-chat-1024-light.png');
      const errors = cdp.consoleErrors.slice();
      check('light console error=0', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
      return 'voice stays / chat';
    });
    await step('light 空态截图', async () => {
      await evaluate(`(() => { localStorage.removeItem('agent.conversations'); localStorage.removeItem('agent.activeConversation'); return true; })()`);
      await openMockSurface({ agentOpen: true });
      await waitStage('chat', 20000);
      await waitIframesRendered();
      await sleep(700);
      const emptyText = await evaluate(`String(document.querySelector('[data-wtsl-agent-surface]')?.innerText || '').replace(/\\s+/g, ' ').slice(0, 160)`);
      check('light 空态无消息', !emptyText.includes('语音消息'), emptyText);
      await screenshot('09-empty-chat-1024-light.png');
      return emptyText;
    });
  } finally {
    try {
      await cdp.close();
    } catch (error) {
      console.error('Edge 清理失败', error?.message);
    }
    cdp = null;
  }
}

let evidenceDimsLight = null;

// ---- reduced motion ----
async function runReducedMotionSession() {
  currentTag = 'reduced-motion';
  cdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
  try {
    await cdp.setReducedMotion(true);
    await openMockSurface();
    await waitCards(6);
    await step('reduced-motion：无尺寸过渡，仅 120ms opacity', async () => {
      await clickEntry();
      await sleep(500);
      const state = await surfaceState();
      const reduced = await evaluate(`(() => {
        const surface = document.querySelector('[data-wtsl-agent-surface]');
        const animated = document.querySelector('[data-wtsl-agent-animated="true"]');
        const content = surface ? surface.querySelector('[style*="opacity"]') : null;
        return {
          transitionDuration: surface ? getComputedStyle(surface).transitionDuration : null,
          animatedAnimation: animated ? getComputedStyle(animated).animationName : null,
          contentTransition: content ? getComputedStyle(content).transitionDuration : null,
          mediaReduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        };
      })()`);
      check('reduced-motion 媒体查询生效', reduced.mediaReduced === true, JSON.stringify(reduced));
      check('reduced-motion 容器过渡 0ms', durationMs(reduced.transitionDuration) === 0, reduced.transitionDuration);
      check('reduced-motion 连续动画关闭', reduced.animatedAnimation === 'none', String(reduced.animatedAnimation));
      await screenshot('21-recording-reduced-1440-dark.png');
      return JSON.stringify({ state: { w: state.width, h: state.height }, reduced });
    });
    await step('reduced-motion 语音回合停留 voice + chat 截图', async () => {
      await clickAria('结束录音并发送');
      await waitFor(
        `String(document.querySelector('[data-wtsl-agent-surface]')?.textContent || '').includes('我听到你的语音了')`,
        40000,
        'reduced-motion 语音回答未出现',
      );
      await waitVoiceStage('idle', 30000);
      await sessionIdle(40000);
      await sleep(500);
      const voiceState = await surfaceState();
      check('reduced-motion：语音回合后仍停留 voice', voiceState.stage === 'voice', `stage=${voiceState.stage}`);
      await clickAria('展开对话');
      await waitStage('chat', 40000);
      await sleep(800);
      await screenshot('22-chat-reduced-1440-dark.png');
      const errors = cdp.consoleErrors.slice();
      check('reduced console error=0', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
      return 'chat';
    });
  } finally {
    try {
      await cdp.close();
    } catch (error) {
      console.error('Edge 清理失败', error?.message);
    }
    cdp = null;
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const startedAt = Date.now();
let fatal = null;
try {
  await runFullSession();
  await runLightSession();
  await runReducedMotionSession();
} catch (error) {
  fatal = error?.stack || String(error);
  console.error('FATAL', error);
}

const summary = {
  generatedAt: new Date().toISOString(),
  durationMs: Date.now() - startedAt,
  pass: results.filter((item) => item.ok).length,
  fail: failures.length,
  results,
  evidenceDimsLight,
  fatal,
};
writeFileSync(join(OUT, 'agent-surface-results.json'), JSON.stringify(summary, null, 2));
console.log(`\n=== Agent 浮空界面：${summary.pass}/${results.length} PASS，${summary.fail} FAIL，耗时 ${Math.round(summary.durationMs / 1000)}s ===`);
if (summary.fail > 0 || fatal) process.exitCode = 1;
