/**
 * v0.3.7「语音优先」Agent 浮空界面 E2E 验收（headless Edge + 假麦克风 + ?mock=1）。
 *
 * 用户投诉驱动的契约（v0.3.7）：
 * 1. 语音回合结束后必须停在半高「voice」，绝不自动 morph 到全高 chat（连续语音对话）；
 * 2. 半高 voice 窗是纯语音：整个窗口里没有文字输入框（textarea）；
 * 3. 语音回复后按空格必须再次开始录音，而不是往输入框里打一个空格；
 * 4. 全高 chat 的 composer 只有一行：[麦克风][输入框][发送]。
 *
 * 覆盖矩阵（对照共享任务 task-1 的 DOM/behavior contract v0.3.7）：
 * - DOM：data-stage ∈ collapsed|voice|chat、data-voice-stage ∈ idle|recording|transcribing；
 *   voice pane [data-wtsl-agent-pane="voice"]（顶部控制条 / peek / talk 按钮 / 无 textarea）；
 *   chat pane [data-wtsl-agent-pane="chat"]（header / 单行 composer [data-wtsl-agent-composer="chat"]）。
 * - 行为：入口点击 → voice+录音；空格按住 ≥300ms → 语音回合且停留 voice；
 *   回复后空格再次录音；展开（⌃ / peek 点击 / peek Enter）→ chat；⌄ / Esc → voice；
 *   Esc(voice) → collapsed；X 关闭 → collapsed；点外部 voice 收起、chat 不收起；
 *   录音 / 转写中「展开对话」禁用、X 取消；textarea 内空格是打字不是录音；Esc 先失焦再回 voice；
 *   任何阶段切换都不自动聚焦 textarea；reduced-motion 只剩 120ms opacity；console error=0。
 *
 * 用法（仓库根目录；dev server 已在 http://localhost:5173）：
 *   node scripts/verify-agent-voice-first.mjs
 *   WTSL_BASE_URL=http://127.0.0.1:5173 node scripts/verify-agent-voice-first.mjs
 *
 * 约束：只通过 scripts/lib/cdp.mjs 启动 headless Edge；一次一个实例；结束即清理自己的进程树。
 * 证据：截图 + JSON 写 shots/releases/v0.3.x/v037-dev/（gitignored）。
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { launch, sleep } from './lib/cdp.mjs';

const REPO_ROOT = process.cwd();
const OUT = join(REPO_ROOT, 'shots', 'releases', 'v0.3.x', 'v037-dev');
const BASE_URL = process.env.WTSL_BASE_URL || 'http://localhost:5173';
mkdirSync(OUT, { recursive: true });

const results = [];
const failures = [];
const evidence = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  screenshots: [],
  sessions: {},
};
let currentTag = 'setup';
let cdp = null;

// ---------------------------------------------------------------------------
// 结果记录 / 步骤包装
// ---------------------------------------------------------------------------

function check(name, ok, detail = '') {
  const entry = {
    tag: currentTag,
    name,
    ok: Boolean(ok),
    detail: String(detail ?? '').slice(0, 1200),
  };
  results.push(entry);
  const status = ok ? 'PASS' : 'FAIL';
  console.log(
    `[${status}] ${currentTag} :: ${name}${detail ? ` — ${String(detail).slice(0, 360)}` : ''}`,
  );
  if (!ok) failures.push(entry);
  return Boolean(ok);
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function step(name, fn) {
  try {
    const detail = await fn();
    return check(
      name,
      true,
      detail === undefined
        ? ''
        : typeof detail === 'string'
          ? detail
          : JSON.stringify(detail).slice(0, 900),
    );
  } catch (error) {
    let body = '';
    try {
      body = String(
        await evaluate(
          `String(document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 400)`,
        ),
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

// ---------------------------------------------------------------------------
// 页面内评审片段（形态 / 焦点 / composer / reduced-motion）
// ---------------------------------------------------------------------------

const SURFACE_STATE = `(() => {
  const el = document.querySelector('[data-wtsl-agent-surface]');
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const active = document.activeElement;
  const overflowX = el.scrollWidth - el.clientWidth;
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
    transitionDuration: cs.transitionDuration,
    transitionProperty: cs.transitionProperty,
    entryCount: el.querySelectorAll('[data-wtsl-agent-entry]').length,
    paneVoiceCount: el.querySelectorAll('[data-wtsl-agent-pane="voice"]').length,
    paneChatCount: el.querySelectorAll('[data-wtsl-agent-pane="chat"]').length,
    textareasInSurface: textareas.length,
    visibleTextareas: textareas.filter(visible).length,
    activeElement: {
      tag: active && active.tagName,
      aria: active && active.getAttribute && active.getAttribute('aria-label'),
      isTextarea: Boolean(active && active.tagName === 'TEXTAREA'),
      isEntry: Boolean(active && active.hasAttribute && active.hasAttribute('data-wtsl-agent-entry')),
    },
    entryRect: (() => {
      const entry = el.querySelector('[data-wtsl-agent-entry]');
      if (!entry) return null;
      const r = entry.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), aria: entry.getAttribute('aria-label') };
    })(),
    overflow: {
      doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      surface: overflowX,
    },
  };
})()`;

/** 可见性判定：display/visibility/opacity 祖先链 + inert/aria-hidden + 尺寸 */
const VISIBLE_FN = `
  const visible = (el) => {
    if (!el || el.nodeType !== 1) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      if (Number(getComputedStyle(node).opacity) < 0.05) return false;
      if (node.hasAttribute && (node.hasAttribute('inert') || node.getAttribute('aria-hidden') === 'true')) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const rectOf = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.left * 10) / 10,
      y: Math.round(r.top * 10) / 10,
      w: Math.round(r.width * 10) / 10,
      h: Math.round(r.height * 10) / 10,
      cx: Math.round((r.left + r.width / 2) * 10) / 10,
      cy: Math.round((r.top + r.height / 2) * 10) / 10,
      bottom: Math.round(r.bottom * 10) / 10,
    };
  };
  const byAria = (root, label) => [...root.querySelectorAll('[aria-label]')].filter(
    (el) => (el.getAttribute('aria-label') || '').trim() === label,
  );
  const byAriaMatch = (root, pattern) => [...root.querySelectorAll('[aria-label]')].filter(
    (el) => pattern.test(el.getAttribute('aria-label') || ''),
  );
  const inputAudit = (root) => {
    const textareas = [...root.querySelectorAll('textarea')];
    const contentEditables = [...root.querySelectorAll('[contenteditable="true"]')];
    return {
      textareas: textareas.length,
      visibleTextareas: textareas.filter(visible).map((el) => ({
        aria: el.getAttribute('aria-label'),
        value: String(el.value || '').slice(0, 40),
      })),
      visibleContentEditables: contentEditables.filter(visible).length,
      inputs: [...root.querySelectorAll('input')].filter(visible).length,
    };
  };
`;

const VOICE_PANE_AUDIT = `(() => {
  const surface = document.querySelector('[data-wtsl-agent-surface]');
  const pane = surface && surface.querySelector('[data-wtsl-agent-pane="voice"]');
  if (!pane) return { exists: false, surface: Boolean(surface) };
  ${VISIBLE_FN}
  const expand = byAria(pane, '展开对话').filter((el) => !el.hasAttribute('data-wtsl-agent-peek'));
  const autoRead = byAriaMatch(pane, /自动朗读/);
  const close = byAria(pane, '收起 Agent');
  const peek = pane.querySelector('[data-wtsl-agent-peek]');
  const talk = pane.querySelector('[data-wtsl-agent-talk]');
  return {
    exists: true,
    visible: visible(pane),
    rect: rectOf(pane),
    inputs: inputAudit(pane),
    expand: expand.filter(visible).map((el) => ({
      tag: el.tagName,
      disabled: el.disabled === true || el.getAttribute('aria-disabled') === 'true',
      rect: rectOf(el),
    })),
    autoRead: autoRead.filter(visible).map((el) => el.getAttribute('aria-label')),
    closeCount: close.filter(visible).length,
    peek: peek
      ? {
          exists: true,
          role: peek.getAttribute('role'),
          aria: peek.getAttribute('aria-label'),
          visible: visible(peek),
          rect: rectOf(peek),
        }
      : null,
    talk: talk
      ? {
          exists: true,
          aria: String(talk.getAttribute('aria-label') || '').trim(),
          text: String(talk.innerText || '').replace(/\\s+/g, ' ').trim(),
          visible: visible(talk),
          rect: rectOf(talk),
        }
      : null,
    voiceCapture: {
      stopCount: byAria(pane, '结束录音并发送').filter(visible).length,
      cancelCount: byAria(pane, '取消录音').filter(visible).length,
    },
    ariaLabels: [...pane.querySelectorAll('[aria-label]')]
      .filter(visible)
      .map((el) => el.getAttribute('aria-label')),
    textContent: String(pane.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 400),
  };
})()`;

const CHAT_PANE_AUDIT = `(() => {
  const surface = document.querySelector('[data-wtsl-agent-surface]');
  const pane = surface && surface.querySelector('[data-wtsl-agent-pane="chat"]');
  if (!pane) return { exists: false, surface: Boolean(surface) };
  ${VISIBLE_FN}
  return {
    exists: true,
    visible: visible(pane),
    rect: rectOf(pane),
    inputs: inputAudit(pane),
    collapseToVoiceCount: byAria(pane, '收起到语音窗').filter(visible).length,
    closeCount: byAria(pane, '关闭 Agent').filter(visible).length,
    moreCount: byAria(pane, '更多').filter(visible).length,
    autoRead: byAriaMatch(pane, /自动朗读/)
      .filter(visible)
      .map((el) => el.getAttribute('aria-label')),
    composerCount: pane.querySelectorAll('[data-wtsl-agent-composer="chat"]').length,
    textContent: String(pane.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 400),
  };
})()`;

const COMPOSER_AUDIT = `(() => {
  ${VISIBLE_FN}
  const composer = document.querySelector('[data-wtsl-agent-composer="chat"]');
  if (!composer) {
    return {
      exists: false,
      composerCount: document.querySelectorAll('[data-wtsl-agent-composer="chat"]').length,
      allTextareas: document.querySelectorAll('textarea').length,
    };
  }
  const find = (label) => {
    const candidates = byAria(composer, label);
    return candidates.find(visible) || candidates[0] || null;
  };
  const textarea = [...composer.querySelectorAll('textarea')].find(visible) || composer.querySelector('textarea');
  const mic = find('语音输入');
  const send = find('发送');
  const cr = composer.getBoundingClientRect();
  return {
    exists: true,
    composer: {
      x: Math.round(cr.left),
      y: Math.round(cr.top),
      w: Math.round(cr.width * 10) / 10,
      h: Math.round(cr.height * 10) / 10,
      bottom: Math.round(cr.bottom * 10) / 10,
    },
    empty: !textarea || String(textarea.value || '').length === 0,
    mic: rectOf(mic),
    textarea: rectOf(textarea),
    send: rectOf(send),
    sendDisabled: send ? send.disabled === true || send.getAttribute('aria-disabled') === 'true' : null,
    micDisabled: mic ? mic.disabled === true || mic.getAttribute('aria-disabled') === 'true' : null,
    textareaAria: textarea ? textarea.getAttribute('aria-label') : null,
    visibleTextareas: [...composer.querySelectorAll('textarea')].filter(visible).length,
    ariaLabels: [...composer.querySelectorAll('[aria-label]')].map((el) =>
      el.getAttribute('aria-label'),
    ),
    hintText: String(composer.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 120),
  };
})()`;

const FOCUS_SAMPLE = `(() => {
  const active = document.activeElement;
  const surface = document.querySelector('[data-wtsl-agent-surface]');
  return {
    tag: active && active.tagName,
    aria: active && active.getAttribute && active.getAttribute('aria-label'),
    isTextarea: Boolean(active && active.tagName === 'TEXTAREA'),
    isEntry: Boolean(active && active.hasAttribute && active.hasAttribute('data-wtsl-agent-entry')),
    stage: surface && surface.getAttribute('data-stage'),
    voiceStage: surface && surface.getAttribute('data-voice-stage'),
  };
})()`;

const STORE_SUMMARY = `(() => {
  try {
    const raw = localStorage.getItem('agent.conversations');
    if (!raw) return { conversations: 0, messages: 0, streamings: 0, lastAssistant: '' };
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return { conversations: 0, messages: 0, streamings: 0, lastAssistant: '' };
    let messages = 0;
    let streamings = 0;
    let lastAssistant = '';
    for (const conversation of list) {
      const items = Array.isArray(conversation && conversation.messages) ? conversation.messages : [];
      messages += items.length;
      for (const message of items) {
        if (message && message.status === 'streaming') streamings += 1;
        if (message && message.role === 'assistant' && message.content) lastAssistant = String(message.content);
      }
    }
    return { conversations: list.length, messages, streamings, lastAssistant: lastAssistant.slice(-160) };
  } catch (error) {
    return { error: String(error) };
  }
})()`;

/** mock 语音回合的固定回答（MockTransport.transcribe 固定转写 + 语音回答文案） */
const VOICE_REPLY_TEXT = '我听到你的语音了';

const VOICE_REPLY_READY = `(() => {
  const text = String(document.querySelector('[data-wtsl-agent-surface]')?.textContent || '');
  if (text.includes(${JSON.stringify(VOICE_REPLY_TEXT)})) return true;
  try {
    const raw = localStorage.getItem('agent.conversations');
    if (raw && raw.includes(${JSON.stringify(VOICE_REPLY_TEXT)})) return true;
  } catch (error) { /* ignore */ }
  return false;
})()`;

const SESSION_IDLE = `(() => {
  if (document.querySelector('[aria-label="停止生成"]')) return false;
  if (document.querySelector('[aria-label="正在生成回答"]')) return false;
  const surface = document.querySelector('[data-wtsl-agent-surface]');
  if (surface && surface.getAttribute('data-voice-stage') === 'transcribing') return false;
  try {
    const raw = localStorage.getItem('agent.conversations');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.some((conversation) =>
        Array.isArray(conversation && conversation.messages) &&
        conversation.messages.some((message) => message && message.status === 'streaming'),
      )) return false;
    }
  } catch (error) { /* ignore */ }
  return true;
})()`;

const REDUCED_MOTION_AUDIT = `(() => {
  const surface = document.querySelector('[data-wtsl-agent-surface]');
  if (!surface) return null;
  const durationMs = (value) => {
    const first = String(value || '').split(',')[0].trim();
    if (first.endsWith('ms')) return Number.parseFloat(first);
    if (first.endsWith('s')) return Number.parseFloat(first) * 1000;
    return Number.NaN;
  };
  const all = [...surface.querySelectorAll('*')];
  const animated = all.filter((el) => {
    const name = getComputedStyle(el).animationName;
    return name && name !== 'none';
  });
  const opacityTransitions = all
    .map((el) => ({ el, cs: getComputedStyle(el) }))
    .filter(({ cs }) => String(cs.transitionProperty || '').split(',').map((item) => item.trim()).includes('opacity'))
    .map(({ el, cs }) => ({
      cls: String(el.className || '').slice(0, 60),
      duration: durationMs(cs.transitionDuration),
      delay: durationMs(cs.transitionDelay),
      property: cs.transitionProperty,
    }))
    .filter((item) => Number.isFinite(item.duration) && item.duration > 0);
  return {
    mediaReduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    surfaceTransitionDuration: getComputedStyle(surface).transitionDuration,
    surfaceTransitionProperty: getComputedStyle(surface).transitionProperty,
    surfaceGeometryDuration: (() => {
      const cs = getComputedStyle(surface);
      const props = String(cs.transitionProperty || '').split(',').map((item) => item.trim());
      const durations = String(cs.transitionDuration || '').split(',').map((item) => durationMs(item));
      const geometry = props
        .map((property, index) => ({ property, duration: durations[index] ?? durations[0] }))
        .filter((item) => /width|height|border|box-shadow/i.test(item.property));
      return geometry;
    })(),
    animatedCount: animated.length,
    animatedNames: [...new Set(animated.map((el) => getComputedStyle(el).animationName))].slice(0, 6),
    opacityTransitions: opacityTransitions.slice(0, 8),
    entryCount: surface.querySelectorAll('[data-wtsl-agent-entry]').length,
  };
})()`;

const MIC_AUDIT = `(() => {
  const streams = window.__wtslMicStreams || [];
  const tracks = [];
  for (const stream of streams) {
    for (const track of stream.getTracks()) tracks.push(track.kind + ':' + track.readyState);
  }
  return { streams: streams.length, tracks, live: tracks.filter((item) => item.endsWith(':live')).length };
})()`;

// ---------------------------------------------------------------------------
// CDP 小工具
// ---------------------------------------------------------------------------

async function evaluate(expression) {
  return cdp.evaluate(expression);
}

async function waitFor(expression, timeout, message) {
  return cdp.waitFor(expression, { timeout, interval: 100, message });
}

async function settle(ms = 400) {
  await sleep(ms);
}

async function surfaceState() {
  return evaluate(SURFACE_STATE);
}

async function waitStage(stage, timeout = 30000) {
  return waitFor(
    `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') === ${JSON.stringify(stage)}`,
    timeout,
    `Agent 未到 data-stage=${stage}`,
  );
}

async function waitVoiceStage(voiceStage, timeout = 30000) {
  return waitFor(
    `document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage') === ${JSON.stringify(voiceStage)}`,
    timeout,
    `Agent 语音状态未到 data-voice-stage=${voiceStage}`,
  );
}

async function waitSessionIdle(timeout = 40000) {
  return waitFor(SESSION_IDLE, timeout, '会话仍在生成 / 转写中');
}

async function waitVoiceReply(timeout = 40000) {
  return waitFor(VOICE_REPLY_READY, timeout, '语音回合回答未出现（mock 固定回答）');
}

/**
 * 转写态只有 ~650ms（mock ASR）。坐标点击 + 多轮 CDP 往返可能错过这个窗口，
 * 所以在触发结束录音前装一个页面内 MutationObserver：data-voice-stage 一变成
 * transcribing 就同步记录「展开对话」是否禁用，后续直接读证据。
 */
async function installTranscribingProbe() {
  const installed = await evaluate(`(() => {
    const surface = document.querySelector('[data-wtsl-agent-surface]');
    window.__vfTranscribingProbe = { samples: [] };
    if (!surface) return false;
    if (window.__vfTranscribingObserver) window.__vfTranscribingObserver.disconnect();
    const sample = () => {
      if (surface.getAttribute('data-voice-stage') !== 'transcribing') return;
      if (window.__vfTranscribingProbe.samples.length > 0) return;
      const pane = surface.querySelector('[data-wtsl-agent-pane="voice"]');
      const expand = pane
        ? [...pane.querySelectorAll('[aria-label="展开对话"]')].filter((el) => !el.hasAttribute('data-wtsl-agent-peek'))
        : [];
      window.__vfTranscribingProbe.samples.push({
        at: Math.round(performance.now()),
        stage: surface.getAttribute('data-stage'),
        expandCount: expand.length,
        expandDisabled: expand.map((el) => el.disabled === true || el.getAttribute('aria-disabled') === 'true'),
        textareasInVoicePane: pane ? pane.querySelectorAll('textarea').length : -1,
      });
    };
    window.__vfTranscribingObserver = new MutationObserver(sample);
    window.__vfTranscribingObserver.observe(surface, { attributes: true, attributeFilter: ['data-voice-stage', 'data-stage'] });
    sample();
    return true;
  })()`);
  expect(installed, '转写态探针安装失败');
}

async function readTranscribingProbe() {
  return evaluate(`window.__vfTranscribingProbe || { samples: [] }`);
}

async function waitCards(expected = 6, timeout = 150000) {
  return waitFor(
    `document.querySelectorAll('[data-widget-card]').length >= ${expected}`,
    timeout,
    `桌面 ${expected} 卡未就绪`,
  );
}

async function waitDesktopActive(timeout = 120000) {
  return waitFor(
    `document.querySelector('.host-desktop-layer')?.getAttribute('data-active') === 'true'`,
    timeout,
    '桌面层未激活',
  );
}

const MIC_TRACKER = `(() => {
  window.__wtslMicStreams = [];
  try {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices || typeof mediaDevices.getUserMedia !== 'function') return;
    const original = mediaDevices.getUserMedia.bind(mediaDevices);
    mediaDevices.getUserMedia = async (constraints) => {
      const stream = await original(constraints);
      try { window.__wtslMicStreams.push(stream); } catch (error) { /* ignore */ }
      return stream;
    };
  } catch (error) { /* ignore */ }
})();`;

const FETCH_RECORDER = `(() => {
  window.__wtslReqBodies = [];
  const original = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const body = init && init.body != null ? String(init.body) : '';
      window.__wtslReqBodies.push({
        url: String(url).slice(0, 200),
        hasInputAudio: body.includes('input_audio') || body.includes('data:audio'),
      });
    } catch (error) { /* ignore */ }
    return original(input, init);
  };
})();`;

/** 焦点日志 + 阶段日志（页面内 MutationObserver，捕获瞬态 morph） */
async function installMonitors() {
  const installed = await evaluate(`(() => {
    window.__vfFocusLog = [];
    window.__vfStageLog = [];
    document.addEventListener('focusin', (event) => {
      const target = event.target;
      window.__vfFocusLog.push({
        at: Math.round(performance.now()),
        tag: target && target.tagName,
        aria: target && target.getAttribute && target.getAttribute('aria-label'),
        isTextarea: Boolean(target && target.tagName === 'TEXTAREA'),
        stage: document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage') || null,
      });
    }, true);
    const surface = document.querySelector('[data-wtsl-agent-surface]');
    if (!surface) return { surface: false };
    const record = () => window.__vfStageLog.push({
      at: Math.round(performance.now()),
      stage: surface.getAttribute('data-stage'),
      voiceStage: surface.getAttribute('data-voice-stage'),
    });
    record();
    window.__vfStageObserver = new MutationObserver(record);
    window.__vfStageObserver.observe(surface, { attributes: true, attributeFilter: ['data-stage', 'data-voice-stage'] });
    return { surface: true };
  })()`);
  expect(installed && installed.surface, `监控安装失败（surface=${JSON.stringify(installed)}）`);
}

async function resetFocusLog() {
  await evaluate(`(() => { window.__vfFocusLog = []; return true; })()`);
}

async function focusLog() {
  return evaluate(`window.__vfFocusLog || []`);
}

async function resetStageLog() {
  await evaluate(`(() => { window.__vfStageLog = []; const surface = document.querySelector('[data-wtsl-agent-surface]'); if (surface) { window.__vfStageLog.push({ at: 0, stage: surface.getAttribute('data-stage'), voiceStage: surface.getAttribute('data-voice-stage') }); } return true; })()`);
}

async function stageLog() {
  return evaluate(`window.__vfStageLog || []`);
}

async function focusSample() {
  return evaluate(FOCUS_SAMPLE);
}

async function focusTimeline(offsets = [0, 120, 300, 600, 1000]) {
  const samples = [];
  let previous = 0;
  for (const offset of offsets) {
    if (offset > previous) await sleep(offset - previous);
    previous = offset;
    samples.push({ at: offset, ...(await focusSample()) });
  }
  return samples;
}

async function clickPoint(x, y) {
  await cdp.dispatchMouse('mouseMoved', x, y);
  await cdp.dispatchMouse('mousePressed', x, y);
  await sleep(45);
  await cdp.dispatchMouse('mouseReleased', x, y);
  await sleep(180);
}

/** 按选择器点击（要求可见、命中测试最上层是自己或后代，避免点到遮挡层） */
async function clickSelector(selector, { timeout = 25000, afterMs = 150 } = {}) {
  const point = await waitFor(
    `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      ${VISIBLE_FN.replace(/^  /gm, '      ')}
      if (!visible(el)) return null;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      if (!hit || !(hit === el || el.contains(hit) || hit.contains(el))) return null;
      return { x: cx, y: cy };
    })()`,
    timeout,
    `找不到可点击元素：${selector}`,
  );
  await clickPoint(point.x, point.y);
  if (afterMs) await sleep(afterMs);
  return point;
}

/**
 * 按 aria-label 点击。within 限定容器选择器（例如 voice pane），避免 voice 顶部
 * 「展开对话」按钮和 peek（同 aria-label）互相抢命中。
 */
async function clickAria(label, { within = null, exact = true, timeout = 25000, afterMs = 150 } = {}) {
  const point = await waitFor(
    `(() => {
      const needle = ${JSON.stringify(String(label))};
      const exact = ${exact ? 'true' : 'false'};
      const root = ${within ? `document.querySelector(${JSON.stringify(within)})` : 'document'};
      if (!root) return null;
      ${VISIBLE_FN.replace(/^  /gm, '      ')}
      const candidates = [...root.querySelectorAll('[aria-label]')];
      for (const el of candidates) {
        const value = (el.getAttribute('aria-label') || '').trim();
        if (exact ? value !== needle : !value.includes(needle)) continue;
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        if (!hit || !(hit === el || el.contains(hit) || hit.contains(el))) continue;
        return { x: cx, y: cy, hit: { tag: el.tagName, aria: value } };
      }
      return null;
    })()`,
    timeout,
    `找不到可见 aria-label：${label}${within ? `（within ${within}）` : ''}`,
  );
  await clickPoint(point.x, point.y);
  if (afterMs) await sleep(afterMs);
  return point;
}

async function dispatchKey(type, key, code, keyCode, extra = {}) {
  await cdp.send('Input.dispatchKeyEvent', {
    type,
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode,
    ...extra,
  });
}

async function pressEscape() {
  await dispatchKey('keyDown', 'Escape', 'Escape', 27);
  await dispatchKey('keyUp', 'Escape', 'Escape', 27);
  await sleep(220);
}

async function pressEnter() {
  await dispatchKey('keyDown', 'Enter', 'Enter', 13);
  await dispatchKey('keyUp', 'Enter', 'Enter', 13);
  await sleep(180);
}

/** 空格：带 text 的 keyDown 才能在 textarea 里真的产生一个空格字符。 */
async function spaceDown() {
  await dispatchKey('keyDown', ' ', 'Space', 32, { text: ' ', unmodifiedText: ' ' });
}

async function spaceUp() {
  await dispatchKey('keyUp', ' ', 'Space', 32);
}

async function insertText(text) {
  await cdp.send('Input.insertText', { text });
  await sleep(120);
}

async function blurActive() {
  await evaluate(`(() => {
    const active = document.activeElement;
    if (active && active !== document.body && typeof active.blur === 'function') active.blur();
    return true;
  })()`);
  await sleep(80);
}

async function screenshot(name) {
  const file = join(OUT, name);
  await cdp.screenshot(file);
  evidence.screenshots.push(file);
  return file;
}

// ---------------------------------------------------------------------------
// 状态恢复 / 语义动作
// ---------------------------------------------------------------------------

/** 找 voice pane 顶部「展开对话」按钮（不是 peek，peek 也有同名 aria-label） */
const VOICE_EXPAND_SELECTOR = '[data-wtsl-agent-pane="voice"] [aria-label="展开对话"]:not([data-wtsl-agent-peek])';

async function ensureSessionIdle(timeout = 40000) {
  await waitSessionIdle(timeout);
}

/** 在指定 pane 内按 aria-label 找可见按钮并原生 click()（避免命中另一块隐藏 pane 的同名控件） */
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

/** 把浮层收敛到 collapsed（幂等）。任何阶段都可调用。 */
async function ensureCollapsed(timeout = 30000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    const state = await surfaceState();
    if (!state) throw new Error('surface 不存在，无法恢复 collapsed');
    if (state.stage === 'collapsed') {
      if (state.voiceStage === 'idle') return state;
      // collapsed 但还在转写：等会话结束
      await ensureSessionIdle(timeout);
      return surfaceState();
    }
    if (state.voiceStage !== 'idle') {
      // 录音/转写中：优先点取消按钮，其次 Esc（Esc 在录音中=取消）
      const canceled = await clickPaneButton('voice', '取消录音');
      if (!canceled) await pressEscape();
      await sleep(400);
      continue;
    }
    if (state.stage === 'chat') {
      const clicked = await clickPaneButton('chat', '关闭 Agent');
      if (!clicked) await pressEscape();
    } else {
      const clicked = await clickPaneButton('voice', '收起 Agent');
      if (!clicked) await pressEscape();
    }
    await sleep(450);
  }
  throw new Error(`无法恢复到 collapsed：${JSON.stringify(await surfaceState())}`);
}

/** 从 collapsed 进入 voice 并停在 idle（入口点击=录音，随即取消）。 */
async function ensureVoiceIdle(timeout = 30000) {
  await ensureCollapsed(timeout);
  await ensureSessionIdle(timeout);
  await clickSelector('[data-wtsl-agent-entry]');
  await waitStage('voice', 20000);
  await waitVoiceStage('recording', 30000);
  await clickAria('取消录音', { within: '[data-wtsl-agent-pane="voice"]' });
  await waitVoiceStage('idle', 20000);
  await settle(400);
  return surfaceState();
}

/** 从任意阶段进入 chat（带重试：阶段几何过渡中点击可能落空或被判为「点外部」）。 */
async function ensureChat(timeout = 30000) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const state = await surfaceState();
    if (!state) throw new Error('surface 不存在');
    if (state.stage === 'chat') return state;
    if (state.stage === 'collapsed' || state.voiceStage !== 'idle') {
      await ensureVoiceIdle(timeout);
    }
    // 等上一段几何过渡（chat→voice 250ms）落定再点，否则按钮坐标会在过渡中失效
    await settle(450);
    await clickSelector(VOICE_EXPAND_SELECTOR).catch(() => {});
    try {
      await waitStage('chat', 10000);
      await settle(450);
      return surfaceState();
    } catch {
      // 过渡中点到外部会收起，重试时从当前状态恢复
      await settle(300);
    }
  }
  throw new Error(`无法进入 chat：${JSON.stringify(await surfaceState())}`);
}

/** 找桌面空白点（不在卡片 / Agent / 菜单 / 弹层里） */
async function findBlankPoint() {
  return waitFor(
    `(() => {
      const layer = document.querySelector('.host-desktop-layer');
      if (!layer) return null;
      for (let y = 120; y <= 900; y += 40) {
        for (let x = 100; x <= 1300; x += 40) {
          const el = document.elementFromPoint(x, y);
          if (!el) continue;
          if (!layer.contains(el)) continue;
          if (el.closest('[data-widget-card], [data-wtsl-agent-surface], [role="menu"], [role="dialog"], [role="tooltip"], [data-widget-overlay]')) continue;
          return { x, y };
        }
      }
      return null;
    })()`,
    30000,
    '找不到桌面空白点',
  );
}

async function storeSummary() {
  return evaluate(STORE_SUMMARY);
}

function durationMs(value) {
  const first = String(value || '').split(',')[0].trim();
  if (first.endsWith('ms')) return Number.parseFloat(first);
  if (first.endsWith('s')) return Number.parseFloat(first) * 1000;
  return Number.NaN;
}

/** 半高窗（voice）几何：宽度接近契约 420、高度在 300–480（960 高视口） */
function checkVoiceGeometry(state, label) {
  const wideEnough = state.width >= 360 && state.width <= 520;
  const halfHeight = state.height >= 300 && state.height <= 490;
  check(
    `${label}：voice 半高窗几何（宽 360–520 / 高 300–490）`,
    wideEnough && halfHeight,
    `实际 ${state.width}×${state.height}`,
  );
}

function checkFullChatGeometry(state, label) {
  const wideEnough = state.width >= 360 && state.width <= 520;
  const fullHeight = state.height >= 600;
  check(
    `${label}：chat 全高窗几何（高 ≥600）`,
    wideEnough && fullHeight,
    `实际 ${state.width}×${state.height}`,
  );
}

/** voice 阶段纯净度：pane 内无 textarea、整个文档无可见文字输入 */
async function checkVoicePurity(label) {
  const pane = await evaluate(VOICE_PANE_AUDIT);
  check(`${label}：voice pane 存在并可见`, pane.exists === true && pane.visible === true, JSON.stringify({ exists: pane.exists, visible: pane.visible }));
  if (!pane.exists) return pane;
  check(
    `${label}：voice pane 内 textarea 数 = 0`,
    pane.inputs.textareas === 0,
    JSON.stringify(pane.inputs),
  );
  const docInputs = await evaluate(`(() => {
    ${VISIBLE_FN}
    const textareas = [...document.querySelectorAll('textarea')];
    return {
      total: textareas.length,
      visible: textareas.filter(visible).map((el) => ({ aria: el.getAttribute('aria-label'), value: String(el.value || '').slice(0, 30) })),
      visibleContentEditables: [...document.querySelectorAll('[contenteditable="true"]')].filter(visible).length,
      focused: document.activeElement && document.activeElement.tagName,
    };
  })()`);
  check(
    `${label}：整个界面无可见文字输入框（voice 纯语音）`,
    docInputs.visible.length === 0 && docInputs.visibleContentEditables === 0,
    JSON.stringify(docInputs),
  );
  const surface = await surfaceState();
  check(
    `${label}：surface 内无可见 textarea（chat pane 隐藏态允许挂载）`,
    surface.visibleTextareas === 0,
    JSON.stringify({ visibleTextareas: surface.visibleTextareas, mounted: surface.textareasInSurface }),
  );
  return pane;
}

async function assertNoTextareaFocused(label) {
  const sample = await focusSample();
  check(`${label}：焦点不在 textarea`, sample.isTextarea === false && sample.aria !== '给 Agent 发消息', JSON.stringify(sample));
}

async function assertFocusLogNoTextarea(label, sinceIndex = 0) {
  const log = await focusLog();
  const textareaFocuses = log.slice(sinceIndex).filter((item) => item.isTextarea || item.aria === '给 Agent 发消息');
  check(`${label}：焦点从未落进 textarea`, textareaFocuses.length === 0, JSON.stringify(textareaFocuses.slice(0, 3)));
}

async function assertStageLogNeverChat(label, sinceIndex = 0) {
  const log = await stageLog();
  const chats = log.slice(sinceIndex).filter((item) => item.stage === 'chat');
  check(`${label}：data-stage 从未变成 chat（不自动 morph）`, chats.length === 0, JSON.stringify(chats.slice(0, 4)));
}

// ---------------------------------------------------------------------------
// 会话准备
// ---------------------------------------------------------------------------

async function preparePage({ clearAgentStorage = true, waitCardsMs = 150000 } = {}) {
  // Vite dev server 偶发重优化/HMR 抖动会让首个页面长时间空白：给两次完整机会
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await cdp.navigate(`${BASE_URL}/?mock=1`, { timeout: 180000 });
    if (clearAgentStorage) {
      await evaluate(`(() => {
        localStorage.removeItem('agent.conversations');
        localStorage.removeItem('agent.activeConversation');
        localStorage.removeItem('agent.settings');
        return true;
      })()`).catch(() => {});
      await cdp.navigate(`${BASE_URL}/?mock=1`, { timeout: 180000 });
    }
    try {
      await waitFor(
        `Boolean(document.querySelector('[data-wtsl-agent-surface]'))`,
        attempt === 0 ? 150000 : 180000,
        'Agent 浮空层未渲染',
      );
      break;
    } catch (error) {
      if (attempt === 1) throw error;
      await sleep(3000);
    }
  }
  await waitDesktopActive(120000);
  if (waitCardsMs > 0) {
    try {
      await waitCards(6, waitCardsMs);
    } catch {
      /* 卡片属于基座，单独在步骤里断言 */
    }
  }
  await installMonitors();
  await settle(900);
}

// ---------------------------------------------------------------------------
// 主会话（1440×960 dark）：完整行为矩阵
// ---------------------------------------------------------------------------

async function runMainSession() {
  currentTag = 'main-1440-dark';
  evidence.sessions.main = {};
  cdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
  try {
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: MIC_TRACKER });
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: FETCH_RECORDER });
    await preparePage();
    evidence.sessions.main.baseUrl = BASE_URL;

    // ---- 基座 ----
    await step('基座：collapsed 入口 56×56，初始无输入框', async () => {
      const cardCount = await evaluate(`document.querySelectorAll('[data-widget-card]').length`);
      check('基座：桌面 6 卡渲染（截图质量前提）', cardCount >= 6, `cards=${cardCount}`);
      const state = await surfaceState();
      expect(state.stage === 'collapsed', `初始 stage=${state.stage}`);
      check('collapsed：入口按钮 56×56', state.entryRect?.w === 56 && state.entryRect?.h === 56, JSON.stringify(state.entryRect));
      check('collapsed：入口 aria-label=开始语音提问', state.entryRect?.aria === '开始语音提问', JSON.stringify(state.entryRect));
      check('collapsed：surface 尺寸 56×56', Math.abs(state.width - 56) <= 2 && Math.abs(state.height - 56) <= 2, `${state.width}×${state.height}`);
      check('collapsed：无可见 textarea', state.visibleTextareas === 0, `visible=${state.visibleTextareas} mounted=${state.textareasInSurface}`);
      check('collapsed：无横向溢出', state.overflow.doc <= 0 && state.overflow.surface <= 1, JSON.stringify(state.overflow));
      await screenshot('01-collapsed-1440-dark.png');
      return JSON.stringify({ cards: cardCount });
    });

    // ---- 入口点击 → voice + 立即录音 ----
    await step('入口点击 → voice（半高纯语音）+ 立即录音；绝不进入 chat', async () => {
      await ensureCollapsed();
      await ensureSessionIdle();
      await resetStageLog();
      await resetFocusLog();
      const clickAt = Date.now();
      await clickSelector('[data-wtsl-agent-entry]');
      await waitStage('voice', 20000);
      await waitVoiceStage('recording', 30000);
      const recordingAt = Date.now();
      const state = await surfaceState();
      evidence.sessions.main.entryToRecordingMs = recordingAt - clickAt;
      check('入口点击后 stage=voice（不是 chat）', state.stage === 'voice', `stage=${state.stage}`);
      check('入口点击后立即 recording', state.voiceStage === 'recording', `voiceStage=${state.voiceStage}`);
      checkVoiceGeometry(state, '入口点击');
      await assertStageLogNeverChat('入口点击');
      await assertNoTextareaFocused('入口点击');
      await assertFocusLogNoTextarea('入口点击');
      await checkVoicePurity('录音态');
      await settle(400);
      await screenshot('02-voice-recording-1440-dark.png');
      return JSON.stringify({ clickToRecordingMs: recordingAt - clickAt });
    });

    // ---- 录音态 UI（顶部控制条 / VoiceCapture / 展开禁用）----
    await step('录音态：顶部控制条齐全、「展开对话」禁用、录音按钮可见、无解释文字', async () => {
      const pane = await evaluate(VOICE_PANE_AUDIT);
      expect(pane.exists, 'voice pane 不存在');
      check('录音态：顶部「展开对话」按钮存在', pane.expand.length >= 1, JSON.stringify(pane.expand));
      check(
        '录音态：「展开对话」禁用（voiceStage!=idle）',
        pane.expand.length >= 1 && pane.expand.every((item) => item.disabled === true),
        JSON.stringify(pane.expand),
      );
      check('录音态：自动朗读开关存在', pane.autoRead.length >= 1, JSON.stringify(pane.autoRead));
      check('录音态：顶部「收起 Agent」存在', pane.closeCount >= 1, `count=${pane.closeCount}`);
      check('录音态：VoiceCapture 结束/取消按钮存在', pane.voiceCapture.stopCount >= 1 && pane.voiceCapture.cancelCount >= 1, JSON.stringify(pane.voiceCapture));
      const text = await evaluate(`(() => {
        const pane = document.querySelector('[data-wtsl-agent-pane="voice"]');
        if (!pane) return '';
        const clone = pane.cloneNode(true);
        clone.querySelectorAll('.wtsl-agent-sr-only').forEach((node) => node.remove());
        return String(clone.textContent || '').replace(/\\s+/g, ' ').trim();
      })()`);
      const forbidden = ['语音', '转写', '正在聆听', '正在识别', '录音中'].filter((word) => text.includes(word));
      check('录音态：界面无解释性「语音/转写」文字', forbidden.length === 0, `命中 ${forbidden.join('、')}；text=${text.slice(0, 160)}`);
      checkVoiceGeometry(await surfaceState(), '录音态');
      return JSON.stringify({ ariaLabels: pane.ariaLabels.slice(0, 12) });
    });

    // ---- 取消录音 → voice idle：talk 按钮可再次开录 ----
    await step('取消录音 → voice idle；talk「点击说话」按钮可再次开始录音', async () => {
      await clickAria('取消录音', { within: '[data-wtsl-agent-pane="voice"]' });
      await waitVoiceStage('idle', 20000);
      await settle(400);
      const state = await surfaceState();
      check('取消后 stage 仍是 voice（不收起、不 morph）', state.stage === 'voice', `stage=${state.stage}`);
      check('取消后 voiceStage=idle', state.voiceStage === 'idle', `voiceStage=${state.voiceStage}`);
      await checkVoicePurity('voice idle');
      const pane = await evaluate(VOICE_PANE_AUDIT);
      check('voice idle：peek 区域存在（role=button / aria-label=展开对话）', Boolean(pane.peek && pane.peek.visible), JSON.stringify(pane.peek));
      check('voice idle：peek role=button', pane.peek?.role === 'button', JSON.stringify(pane.peek));
      check('voice idle：peek aria-label=展开对话', pane.peek?.aria === '展开对话', JSON.stringify(pane.peek));
      check('voice idle：talk 按钮 [data-wtsl-agent-talk] 存在', Boolean(pane.talk && pane.talk.visible), JSON.stringify(pane.talk));
      check('voice idle：talk 按钮文案含「点击说话」', Boolean(pane.talk && /点击说话/.test(`${pane.talk.text}${pane.talk.aria}`)), JSON.stringify(pane.talk));
      await screenshot('03-voice-idle-1440-dark.png');
      await clickSelector('[data-wtsl-agent-talk]');
      await waitVoiceStage('recording', 30000);
      check('talk 按钮点击 → recording', true);
      // 收尾：取消回 idle
      await clickAria('取消录音', { within: '[data-wtsl-agent-pane="voice"]' });
      await waitVoiceStage('idle', 20000);
      await settle(300);
      return 'voice idle ok';
    });

    // ---- 展开路径①：顶部「展开对话」→ chat；chat 纯净度 + 单行 composer ----
    await step('展开①：顶部「展开对话」→ chat；chat 面板 + header 控件齐全', async () => {
      await resetFocusLog();
      await clickSelector(VOICE_EXPAND_SELECTOR);
      await waitStage('chat', 20000);
      await settle(500);
      const state = await surfaceState();
      check('展开后 stage=chat', state.stage === 'chat', `stage=${state.stage}`);
      checkFullChatGeometry(state, 'chat');
      check('chat：surface 内可见 textarea 数 = 1（只在 chat）', state.visibleTextareas === 1, JSON.stringify({ visible: state.visibleTextareas, mounted: state.textareasInSurface }));
      const pane = await evaluate(CHAT_PANE_AUDIT);
      check('chat pane 存在并可见', pane.exists === true && pane.visible === true, JSON.stringify({ exists: pane.exists, visible: pane.visible }));
      check('chat header：「收起到语音窗」存在', pane.collapseToVoiceCount >= 1, `count=${pane.collapseToVoiceCount}`);
      check('chat header：「关闭 Agent」存在', pane.closeCount >= 1, `count=${pane.closeCount}`);
      check('chat header：「更多」存在', pane.moreCount >= 1, `count=${pane.moreCount}`);
      check('chat header：自动朗读开关存在', pane.autoRead.length >= 1, JSON.stringify(pane.autoRead));
      await screenshot('04-chat-expanded-1440-dark.png');
      return JSON.stringify({ pane: { rect: pane.rect } });
    });

    await step('chat：composer 单行 [麦克风][输入框][发送] 几何', async () => {
      const audit = await evaluate(COMPOSER_AUDIT);
      expect(audit.exists, `找不到 [data-wtsl-agent-composer="chat"]：${JSON.stringify(audit)}`);
      check('composer 持有 voice 麦克风按钮（aria-label=语音输入）', Boolean(audit.mic), JSON.stringify(audit.ariaLabels));
      check('composer 持有 textarea（aria-label=给 Agent 发消息）', Boolean(audit.textarea) && audit.textareaAria === '给 Agent 发消息', JSON.stringify({ textareaAria: audit.textareaAria }));
      check('composer 持有发送按钮（aria-label=发送）', Boolean(audit.send), JSON.stringify(audit.ariaLabels));
      check('composer 内可见 textarea 恰好 1 个', audit.visibleTextareas === 1, `visibleTextareas=${audit.visibleTextareas}`);
      const centers = [audit.mic?.cy, audit.textarea?.cy, audit.send?.cy].filter((value) => typeof value === 'number');
      const spread = centers.length === 3 ? Math.max(...centers) - Math.min(...centers) : Number.POSITIVE_INFINITY;
      check('composer 单行：三控件垂直中心差 ≤8px', spread <= 8, `centers=${JSON.stringify(centers)} spread=${spread}`);
      const ordered = audit.mic && audit.textarea && audit.send && audit.mic.cx < audit.textarea.cx && audit.textarea.cx < audit.send.cx;
      check('composer 单行：水平顺序 [mic][input][send]', Boolean(ordered), JSON.stringify({ mic: audit.mic?.cx, input: audit.textarea?.cx, send: audit.send?.cx }));
      const inside = [audit.mic, audit.textarea, audit.send].every(
        (item) =>
          item &&
          item.cx >= audit.composer.x - 1 &&
          item.cx <= audit.composer.x + audit.composer.w + 1 &&
          item.cy >= audit.composer.y - 1 &&
          item.cy <= audit.composer.y + audit.composer.h + 1,
      );
      check('composer 单行：三控件都在 composer 包围盒内', inside, JSON.stringify(audit.composer));
      check('composer 空卡高度 ≤72px（单行）', audit.empty === true && audit.composer.h <= 72, JSON.stringify({ empty: audit.empty, h: audit.composer.h }));
      check('composer 底边接近窗口底部（单行卡片无第二行留白）', audit.composer.bottom >= 960 - 80, `bottom=${audit.composer.bottom}`);
      await screenshot('05-chat-composer-single-row.png');
      return JSON.stringify({ composer: audit.composer, mic: audit.mic, textarea: audit.textarea, send: audit.send });
    });

    await step('chat 展开后：不自动聚焦 textarea（焦点时间线 + focusin 日志）', async () => {
      const timeline = await focusTimeline([0, 120, 300, 600, 1000]);
      const textareaFocused = timeline.filter((sample) => sample.isTextarea);
      check('展开到 chat 后 activeElement 不是 textarea（时间线 0–1000ms）', textareaFocused.length === 0, JSON.stringify(timeline));
      await assertFocusLogNoTextarea('展开到 chat');
      const sample = await focusSample();
      check('展开到 chat 后焦点不落在输入框', sample.isTextarea === false && sample.aria !== '给 Agent 发消息', JSON.stringify(sample));
      return JSON.stringify(sample);
    });

    // ---- ⌄ → voice ----
    await step('chat「收起到语音窗」→ voice；焦点不落 textarea', async () => {
      await resetFocusLog();
      await clickAria('收起到语音窗', { within: '[data-wtsl-agent-pane="chat"]' });
      await waitStage('voice', 20000);
      await settle(500);
      const state = await surfaceState();
      check('⌄ 后 stage=voice', state.stage === 'voice', `stage=${state.stage}`);
      check('⌄ 后 voiceStage=idle', state.voiceStage === 'idle', `voiceStage=${state.voiceStage}`);
      checkVoiceGeometry(state, '⌄ 回 voice');
      await checkVoicePurity('⌄ 回 voice');
      await assertNoTextareaFocused('⌄ 回 voice');
      await assertFocusLogNoTextarea('⌄ 回 voice');
      return JSON.stringify(state.activeElement);
    });

    // ---- 展开路径②：peek 点击 ----
    await step('展开②：点击 peek 区域 → chat', async () => {
      await clickSelector('[data-wtsl-agent-peek]');
      await waitStage('chat', 20000);
      await settle(400);
      check('peek 点击后 stage=chat', (await surfaceState()).stage === 'chat');
      return 'peek click → chat';
    });

    // ---- Esc in chat → voice ----
    await step('chat 内 Esc → voice（不直接收起）', async () => {
      await pressEscape();
      await waitStage('voice', 20000);
      await settle(400);
      const state = await surfaceState();
      check('Esc(chat) → stage=voice', state.stage === 'voice', `stage=${state.stage}`);
      check('Esc(chat) → voiceStage=idle', state.voiceStage === 'idle', `voiceStage=${state.voiceStage}`);
      return 'esc chat->voice';
    });

    // ---- 展开路径③：peek 获得焦点后 Enter ----
    await step('展开③：peek 聚焦后按 Enter → chat（Space 不展开）', async () => {
      const focused = await evaluate(`(() => {
        const peek = document.querySelector('[data-wtsl-agent-peek]');
        if (!peek) return false;
        peek.focus();
        return document.activeElement === peek;
      })()`);
      check('peek 可获得键盘焦点', focused === true, 'peek.focus() 未生效');
      // Space 不得展开（用户投诉：peek 不能吃掉空格；空格默认应是录音）
      await spaceDown();
      await sleep(180);
      await spaceUp();
      await sleep(450);
      const afterSpace = await surfaceState();
      check('Space（peek 聚焦）不展开到 chat', afterSpace.stage !== 'chat', `stage=${afterSpace.stage}`);
      if (afterSpace.voiceStage !== 'idle') {
        // 若空格触发了录音也允许（默认空格=说话），先取消再继续 Enter 用例
        await evaluate(`(() => { const el = document.querySelector('[data-wtsl-agent-pane="voice"] [aria-label="取消录音"]'); if (el) el.click(); return true; })()`);
        await waitVoiceStage('idle', 15000);
      }
      await blurActive();
      const peekFocused = await evaluate(`(() => {
        const peek = document.querySelector('[data-wtsl-agent-peek]');
        if (!peek) return false;
        peek.focus();
        return document.activeElement === peek;
      })()`);
      expect(peekFocused, 'peek 无法再次聚焦');
      await pressEnter();
      await waitStage('chat', 20000);
      await settle(400);
      check('Enter（peek 聚焦）→ chat', (await surfaceState()).stage === 'chat');
      return 'peek enter → chat';
    });

    // ---- Esc 链：chat → voice → collapsed ----
    await step('Esc 链：chat → voice → collapsed', async () => {
      await ensureChat();
      await pressEscape();
      await waitStage('voice', 20000);
      await settle(450);
      check('Esc 链第一步：chat → voice', (await surfaceState()).stage === 'voice');
      await pressEscape();
      await waitStage('collapsed', 20000);
      await settle(450);
      const collapsed = await surfaceState();
      check('Esc 链第二步：voice → collapsed', collapsed.stage === 'collapsed', `stage=${collapsed.stage}`);
      check('Esc 链：collapsed 后无可见 textarea', collapsed.visibleTextareas === 0, JSON.stringify({ visible: collapsed.visibleTextareas, mounted: collapsed.textareasInSurface }));
      check('Esc 链：collapsed 后入口按钮存在', collapsed.entryCount === 1, `entryCount=${collapsed.entryCount}`);
      return 'esc chain ok';
    });

    // ---- 空格按住 ≥300ms → 语音回合；停留 voice；回复后空格再录音 ----
    await step('空格按住 ≥300ms → 语音回合；全程停留 voice，绝不自动 morph 到 chat', async () => {
      await ensureVoiceIdle();
      await ensureSessionIdle();
      await blurActive();
      await resetStageLog();
      await resetFocusLog();
      const beforeStore = await storeSummary();
      await installTranscribingProbe();
      await spaceDown();
      await waitVoiceStage('recording', 20000);
      const during = await surfaceState();
      check('空格 keydown → recording', during.voiceStage === 'recording', `voiceStage=${during.voiceStage}`);
      check('空格录音时 stage=voice', during.stage === 'voice', `stage=${during.stage}`);
      await settle(650); // 按住 >300ms
      await spaceUp();
      await waitVoiceStage('transcribing', 20000);
      const transcribing = await surfaceState();
      check('空格松开 → transcribing', transcribing.voiceStage === 'transcribing', `voiceStage=${transcribing.voiceStage}`);
      check('转写时 stage 仍为 voice', transcribing.stage === 'voice', `stage=${transcribing.stage}`);
      // 转写窗口只有 ~650ms：用页面内 MutationObserver 在进入 transcribing 的瞬间取样
      const probe = await readTranscribingProbe();
      const probeSample = (probe.samples || []).find((sample) => sample.expandCount > 0) || null;
      check(
        '转写态：「展开对话」禁用（进入 transcribing 瞬间取样）',
        Boolean(probeSample) && probeSample.expandDisabled.every((value) => value === true),
        JSON.stringify(probe),
      );
      check(
        '转写态：voice pane 无 textarea',
        Boolean(probeSample) && probeSample.textareasInVoicePane === 0,
        JSON.stringify(probeSample),
      );
      // 等 mock 语音链路完成：ASR 650ms + mock 回答 + 自动播报
      await waitVoiceReply(40000);
      await waitVoiceStage('idle', 30000);
      await waitSessionIdle(40000);
      await settle(900);
      const after = await surfaceState();
      const afterStore = await storeSummary();
      evidence.sessions.main.voiceTurn = { beforeStore, afterStore, during, transcribing, after };
      check('语音回合完成后 stage 仍是 voice（半高停留）', after.stage === 'voice', `stage=${after.stage}`);
      checkVoiceGeometry(after, '语音回合后');
      await assertStageLogNeverChat('语音回合');
      await checkVoicePurity('语音回合后');
      check('语音回合后无可见输入框（不可能被空格打出空格）', after.visibleTextareas === 0, JSON.stringify({ visible: after.visibleTextareas, mounted: after.textareasInSurface }));
      check('mock 语音链路：用户消息+回答已入库', afterStore.messages > beforeStore.messages, JSON.stringify({ before: beforeStore.messages, after: afterStore.messages }));
      await assertNoTextareaFocused('语音回合后');
      await screenshot('06-voice-reply-stays-voice.png');
      return JSON.stringify({ before: beforeStore.messages, after: afterStore.messages, stage: after.stage, height: after.height });
    });

    await step('回复后停留半高：1.2s–3.6s 采样不自动 morph', async () => {
      const samples = [];
      for (const delay of [0, 1200, 1200, 1200]) {
        if (delay) await sleep(delay);
        const state = await surfaceState();
        samples.push({ stage: state.stage, voiceStage: state.voiceStage, height: state.height, textareas: state.textareasInSurface });
      }
      check(
        '回复后 3.6s 内始终 stage=voice 且高度不变',
        samples.every((sample) => sample.stage === 'voice' && Math.abs(sample.height - samples[0].height) <= 2),
        JSON.stringify(samples),
      );
      await assertStageLogNeverChat('回复后停留窗口');
      return JSON.stringify(samples);
    });

    await step('回复后按空格：再次进入录音，而不是输入空格', async () => {
      await ensureVoiceIdle();
      // ensureVoiceIdle 会经历一次录音→取消，然后再确认回复后的空格行为
      await ensureSessionIdle();
      await blurActive();
      await resetStageLog();
      await resetFocusLog();
      const textareaCountBefore = await evaluate(`document.querySelectorAll('textarea').length`);
      await spaceDown();
      await waitVoiceStage('recording', 20000);
      const state = await surfaceState();
      check('回复后空格 → data-voice-stage=recording', state.voiceStage === 'recording', `voiceStage=${state.voiceStage}`);
      check('回复后空格 → stage 仍 voice', state.stage === 'voice', `stage=${state.stage}`);
      check('回复后空格没有可被写入的 textarea', state.visibleTextareas === 0, JSON.stringify({ visible: state.visibleTextareas, mounted: state.textareasInSurface, docTotal: textareaCountBefore }));
      await assertNoTextareaFocused('回复后空格');
      await assertFocusLogNoTextarea('回复后空格');
      await screenshot('07-space-after-reply-recording.png');
      // 松开空格完成第二轮语音回合（连续语音对话）
      await installTranscribingProbe();
      await spaceUp();
      await waitVoiceStage('transcribing', 20000);
      check('第二轮语音回合进入 transcribing', true);
      const secondProbe = await readTranscribingProbe();
      const secondSample = (secondProbe.samples || []).find((sample) => sample.expandCount > 0) || null;
      check(
        '第二轮转写瞬间：stage=voice 且「展开对话」禁用',
        Boolean(secondSample) && secondSample.stage === 'voice' && secondSample.expandDisabled.every((value) => value === true),
        JSON.stringify(secondProbe),
      );
      await waitVoiceReply(40000);
      await waitVoiceStage('idle', 30000);
      await waitSessionIdle(40000);
      await settle(600);
      const after = await surfaceState();
      check('连续第二轮语音后仍停留 voice（连续语音对话）', after.stage === 'voice', `stage=${after.stage}`);
      await assertStageLogNeverChat('第二轮语音回合');
      await screenshot('08-voice-after-second-turn.png');
      return JSON.stringify({ stage: after.stage, height: after.height });
    });

    // ---- chat：textarea 空格是打字；Esc 先失焦；文字发送 ----
    await step('chat：textarea 内空格 = 输入空格（不触发录音）', async () => {
      await ensureChat();
      await clickSelector('[data-wtsl-agent-composer="chat"] textarea');
      await sleep(250);
      const focused = await evaluate(`document.activeElement && document.activeElement.tagName === 'TEXTAREA'`);
      check('点击 chat textarea 后焦点进入输入框', focused === true, `active=${JSON.stringify(await focusSample())}`);
      await insertText('测试');
      await spaceDown();
      await sleep(220);
      await spaceUp();
      await sleep(300);
      const audit = await evaluate(`(() => {
        const textarea = document.querySelector('[data-wtsl-agent-composer="chat"] textarea');
        return {
          value: textarea ? textarea.value : null,
          focused: document.activeElement === textarea,
          voiceStage: document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-voice-stage'),
          stage: document.querySelector('[data-wtsl-agent-surface]')?.getAttribute('data-stage'),
        };
      })()`);
      check('textarea 内空格被当作字符输入', typeof audit.value === 'string' && audit.value.includes('测试 ') && audit.value.length >= 3, JSON.stringify(audit));
      check('textarea 内空格不触发录音（voiceStage 保持 idle）', audit.voiceStage === 'idle', JSON.stringify(audit));
      check('textarea 内空格不改变 stage（仍 chat）', audit.stage === 'chat', JSON.stringify(audit));
      // 清空草稿
      await evaluate(`(() => {
        const textarea = document.querySelector('[data-wtsl-agent-composer="chat"] textarea');
        if (!textarea) return false;
        const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        setter.call(textarea, '');
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      })()`);
      await settle(200);
      return JSON.stringify(audit);
    });

    await step('chat：Esc 先让 textarea 失焦并停留在 chat，再按 Esc → voice', async () => {
      await clickSelector('[data-wtsl-agent-composer="chat"] textarea');
      await sleep(200);
      expect(await evaluate(`document.activeElement && document.activeElement.tagName === 'TEXTAREA'`), 'textarea 未聚焦');
      await pressEscape();
      await sleep(500);
      const afterFirst = await focusSample();
      check('第一次 Esc：textarea 失焦', afterFirst.isTextarea === false && afterFirst.aria !== '给 Agent 发消息', JSON.stringify(afterFirst));
      check('第一次 Esc：stage 仍为 chat', afterFirst.stage === 'chat', `stage=${afterFirst.stage}`);
      await pressEscape();
      await waitStage('voice', 20000);
      await settle(450); // 等 chat→voice 几何过渡落定，避免下一步点击落在过渡中的坐标
      check('第二次 Esc：chat → voice', true);
      return JSON.stringify(afterFirst);
    });

    await step('chat composer 空内容：发送按钮可见禁用；Shift+Enter 换行不发送', async () => {
      await ensureChat();
      const emptyAudit = await evaluate(COMPOSER_AUDIT);
      check('composer 空内容时发送按钮存在且可见', Boolean(emptyAudit.send), JSON.stringify({ send: emptyAudit.send }));
      check(
        'composer 空内容时发送按钮为禁用态（outline+disabled）',
        emptyAudit.sendDisabled === true,
        JSON.stringify({ sendDisabled: emptyAudit.sendDisabled }),
      );
      const beforeStore = await storeSummary();
      await clickSelector('[data-wtsl-agent-composer="chat"] textarea');
      await insertText('第一行');
      await dispatchKey('keyDown', 'Enter', 'Enter', 13, { modifiers: 8, text: '\r', unmodifiedText: '\r' });
      await dispatchKey('keyUp', 'Enter', 'Enter', 13, { modifiers: 8 });
      await sleep(350);
      const valueAfter = await evaluate(`document.querySelector('[data-wtsl-agent-composer="chat"] textarea')?.value || ''`);
      const afterStore = await storeSummary();
      check('Shift+Enter 在输入框内换行', valueAfter.includes('\n'), JSON.stringify(valueAfter));
      check('Shift+Enter 不发送消息', afterStore.messages === beforeStore.messages, JSON.stringify({ before: beforeStore.messages, after: afterStore.messages }));
      await evaluate(`(() => { const el = document.querySelector('[data-wtsl-agent-composer="chat"] textarea'); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; setter.call(el, ''); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
      await settle(200);
      return JSON.stringify({ valueAfter });
    });

    await step('chat 内语音输入：录音→回合结束仍停留 chat（录音/转写中「收起到语音窗」禁用）', async () => {
      await ensureChat();
      await ensureSessionIdle();
      const before = await storeSummary();
      await resetStageLog();
      await clickAria('语音输入', { within: '[data-wtsl-agent-composer="chat"]' });
      await waitVoiceStage('recording', 30000);
      const recording = await surfaceState();
      check(
        'chat 内点「语音输入」→ recording',
        recording.voiceStage === 'recording' && recording.stage === 'chat',
        JSON.stringify({ stage: recording.stage, voiceStage: recording.voiceStage }),
      );
      const collapseDisabled = await evaluate(`(() => {
        const pane = document.querySelector('[data-wtsl-agent-pane="chat"]');
        const el = pane && [...pane.querySelectorAll('[aria-label="收起到语音窗"]')].find((node) => node.getBoundingClientRect().width > 1);
        return el ? el.disabled === true || el.getAttribute('aria-disabled') === 'true' : null;
      })()`);
      check('chat 录音中「收起到语音窗」禁用', collapseDisabled === true, String(collapseDisabled));
      await clickAria('结束录音并发送');
      await waitVoiceStage('transcribing', 20000);
      const transcribing = await surfaceState();
      check('chat 转写中 stage 仍为 chat', transcribing.stage === 'chat', `stage=${transcribing.stage}`);
      await waitVoiceReply(40000);
      await waitVoiceStage('idle', 30000);
      await waitSessionIdle(40000);
      await settle(700);
      const after = await surfaceState();
      const afterStore = await storeSummary();
      check('chat 语音回合结束后仍停留 chat（留在本层）', after.stage === 'chat', `stage=${after.stage}`);
      const chatStageLog = await stageLog();
      check(
        'chat 语音回合全程 data-stage 未离开 chat',
        !chatStageLog.some((item) => item.stage !== 'chat'),
        JSON.stringify(chatStageLog.filter((item) => item.stage !== 'chat').slice(0, 4)),
      );
      check('chat 语音链路：消息已入库', afterStore.messages > before.messages, JSON.stringify({ before: before.messages, after: afterStore.messages }));
      const mic = await evaluate(MIC_AUDIT);
      check('chat 语音回合后麦克风轨道全部停止', mic.live === 0, JSON.stringify(mic));
      return JSON.stringify({ stage: after.stage });
    });

    await step('窗口失焦取消空格录音（按住说话期间切走不留后台麦克风）', async () => {
      await ensureCollapsed();
      await ensureSessionIdle();
      await blurActive();
      const before = await storeSummary();
      await spaceDown();
      await waitVoiceStage('recording', 20000);
      await evaluate(`(() => { window.dispatchEvent(new Event('blur')); return true; })()`);
      await sleep(700);
      const state = await surfaceState();
      check('空格录音中窗口失焦 → voiceStage=idle', state.voiceStage === 'idle', JSON.stringify({ stage: state.stage, voiceStage: state.voiceStage }));
      const mic = await evaluate(MIC_AUDIT);
      check('空格录音中窗口失焦 → 麦克风轨道全部停止', mic.live === 0, JSON.stringify(mic));
      check('空格录音中窗口失焦不产生消息', (await storeSummary()).messages === before.messages, '');
      await spaceUp(); // 失焦已清空空格会话：松键不应发出语音回合
      await settle(400);
      const after = await surfaceState();
      const afterStore = await storeSummary();
      check(
        '失焦取消后松键不会发送语音回合',
        after.stage === 'voice' && after.voiceStage === 'idle' && afterStore.messages === before.messages,
        JSON.stringify({ stage: after.stage, voiceStage: after.voiceStage, before: before.messages, after: afterStore.messages }),
      );
      await ensureCollapsed();
      return JSON.stringify({ mic });
    });

    await step('P2 回归：任意路径录音中窗口失焦自动取消（talk 按钮起录）', async () => {
      await ensureVoiceIdle();
      const before = await storeSummary();
      await clickSelector('[data-wtsl-agent-talk]');
      await waitVoiceStage('recording', 20000);
      await evaluate(`(() => { window.dispatchEvent(new Event('blur')); return true; })()`);
      await sleep(800);
      const state = await surfaceState();
      const mic = await evaluate(MIC_AUDIT);
      check(
        '窗口失焦（talk 起录）→ voiceStage 回 idle',
        state.voiceStage === 'idle',
        JSON.stringify({ stage: state.stage, voiceStage: state.voiceStage }),
      );
      check('窗口失焦（talk 起录）→ 麦克风 0 live', mic.live === 0, JSON.stringify(mic));
      check('窗口失焦（talk 起录）→ 不产生新消息', (await storeSummary()).messages === before.messages, JSON.stringify({ before: before.messages }));
      // 清场：若实现未取消，按 Esc 取消录音，避免污染后续用例
      if (state.voiceStage !== 'idle') {
        await pressEscape();
        await waitVoiceStage('idle', 15000).catch(() => {});
      }
      return JSON.stringify({ stage: state.stage, voiceStage: state.voiceStage, mic });
    });

    await step('chat：单行 composer 发送文字 → 文字对话可用（fallback 通道）', async () => {
      await ensureChat();
      await clickSelector('[data-wtsl-agent-composer="chat"] textarea');
      await insertText('你好');
      await pressEnter();
      await waitFor(
        `String(document.querySelector('[data-wtsl-agent-surface]')?.textContent || '').includes('你好')`,
        30000,
        '文字提问未进入消息列表',
      );
      await waitSessionIdle(40000);
      await settle(500);
      const state = await surfaceState();
      check('文字发送后 stage 仍是 chat（文字通道只存在于全高窗）', state.stage === 'chat', `stage=${state.stage}`);
      const audit = await evaluate(COMPOSER_AUDIT);
      check('文字发送后 composer 仍单行且清空', audit.exists === true && audit.empty === true && audit.composer.h <= 72, JSON.stringify({ h: audit.composer?.h, empty: audit.empty }));
      return JSON.stringify({ stage: state.stage });
    });

    // ---- 录音中点 X：取消 + collapsed + 麦克风停止 ----
    await step('录音中点「收起 Agent」：取消录音 → collapsed，麦克风停止，无新消息', async () => {
      await ensureCollapsed();
      await ensureSessionIdle();
      await settle(500);
      const beforeStore = await storeSummary();
      await resetStageLog();
      await clickSelector('[data-wtsl-agent-entry]');
      await waitStage('voice', 20000);
      await waitVoiceStage('recording', 30000);
      await clickAria('收起 Agent', { within: '[data-wtsl-agent-pane="voice"]' });
      await waitStage('collapsed', 20000);
      await waitVoiceStage('idle', 30000);
      await settle(900);
      const afterStore = await storeSummary();
      const state = await surfaceState();
      const mic = await evaluate(MIC_AUDIT);
      check('录音中 X：stage=collapsed', state.stage === 'collapsed', `stage=${state.stage}`);
      check('录音中 X：voiceStage=idle', state.voiceStage === 'idle', `voiceStage=${state.voiceStage}`);
      check('录音中 X：无新增消息', afterStore.messages === beforeStore.messages, JSON.stringify({ before: beforeStore.messages, after: afterStore.messages }));
      check('录音中 X：麦克风轨道全部停止', mic.live === 0, JSON.stringify(mic));
      await assertStageLogNeverChat('录音中 X');
      await screenshot('09-recording-x-cancel-collapsed.png');
      return JSON.stringify({ mic, before: beforeStore.messages, after: afterStore.messages });
    });

    // ---- 转写中点 X：expand 禁用 + 收起取消 + 不自动展开 ----
    await step('转写态：「展开对话」禁用；点「收起 Agent」取消并保持 collapsed（不自动展开）', async () => {
      await ensureCollapsed();
      await ensureSessionIdle();
      await resetStageLog();
      await clickSelector('[data-wtsl-agent-entry]');
      await waitStage('voice', 20000);
      await waitVoiceStage('recording', 30000);
      await installTranscribingProbe();
      await clickAria('结束录音并发送', { within: '[data-wtsl-agent-pane="voice"]' });
      await waitVoiceStage('transcribing', 20000);
      // 转写窗口只有 ~650ms（mock ASR）：用进入 transcribing 瞬间的页面内取样判定禁用态
      const probe = await readTranscribingProbe();
      const probeSample = (probe.samples || []).find((sample) => sample.expandCount > 0) || null;
      check(
        '转写态：「展开对话」禁用（进入 transcribing 瞬间取样）',
        Boolean(probeSample) && probeSample.expandDisabled.every((value) => value === true),
        JSON.stringify(probe),
      );
      check(
        '转写态：voice pane 无 textarea（瞬间取样）',
        Boolean(probeSample) && probeSample.textareasInVoicePane === 0,
        JSON.stringify(probeSample),
      );
      // X 用页面内原生 click：转写窗口极短，坐标点击的多次 CDP 往返可能错过；click() 仍是真实 React 事件
      const clickedCollapse = await evaluate(`(() => {
        const pane = document.querySelector('[data-wtsl-agent-pane="voice"]');
        const el = pane && pane.querySelector('[aria-label="收起 Agent"]');
        if (!el) return false;
        el.click();
        return true;
      })()`);
      check('转写态：点「收起 Agent」取消（未先展开 chat）', clickedCollapse === true, String(clickedCollapse));
      await waitStage('collapsed', 20000);
      await screenshot('10-voice-transcribing-x-cancel.png');
      await settle(1200);
      const collapsedNow = await surfaceState();
      check('转写中 X：stage=collapsed', collapsedNow.stage === 'collapsed', `stage=${collapsedNow.stage}`);
      // 采样 2.4s：ASR 完成后不得把窗口弹回 chat
      const samples = [];
      for (let index = 0; index < 4; index += 1) {
        await sleep(600);
        const state = await surfaceState();
        samples.push({ stage: state.stage, voiceStage: state.voiceStage });
      }
      check(
        '转写中 X：之后 2.4s 内不自动展开 / 不回 chat',
        samples.every((sample) => sample.stage !== 'chat'),
        JSON.stringify(samples),
      );
      await assertStageLogNeverChat('转写中 X');
      await waitVoiceStage('idle', 30000).catch(() => {});
      await ensureSessionIdle(40000);
      await settle(500);
      const finalState = await surfaceState();
      check('转写中 X：最终 voiceStage=idle 且 collapsed', finalState.stage === 'collapsed' && finalState.voiceStage === 'idle', JSON.stringify(finalState));
      return JSON.stringify({ samples });
    });

    // ---- 点外部：voice 收起，chat 不收起 ----
    await step('点外部：voice 收起为 collapsed', async () => {
      await ensureVoiceIdle();
      await settle(300);
      const blank = await findBlankPoint();
      await clickPoint(blank.x, blank.y);
      await waitStage('collapsed', 15000);
      check('voice 点外部 → collapsed', true, `blank=${JSON.stringify(blank)}`);
      await screenshot('11-click-outside-collapsed.png');
      return JSON.stringify(blank);
    });

    await step('点外部：chat 不收起', async () => {
      await ensureChat();
      await settle(300);
      const blank = await findBlankPoint();
      await clickPoint(blank.x, blank.y);
      await settle(700);
      const state = await surfaceState();
      check('chat 点外部 → 仍是 chat', state.stage === 'chat', `stage=${state.stage}`);
      // 收尾回 collapsed
      await clickAria('关闭 Agent', { within: '[data-wtsl-agent-pane="chat"]' });
      await waitStage('collapsed', 15000);
      return JSON.stringify(blank);
    });

    // ---- 收尾：console error=0 / 溢出 ----
    await step('收尾：console error=0、无横向溢出、collapsed 焦点不在 textarea', async () => {
      await settle(800);
      const errors = cdp.consoleErrors.slice();
      check('console error/exception = 0', errors.length === 0, JSON.stringify(errors.slice(0, 5)));
      const state = await surfaceState();
      check('无横向溢出', state.overflow.doc <= 0 && state.overflow.surface <= 1, JSON.stringify(state.overflow));
      await assertNoTextareaFocused('收尾 collapsed');
      return JSON.stringify({ errors: errors.length });
    });
  } finally {
    try {
      await cdp.close();
    } catch (error) {
      console.error('Edge 清理失败：', error?.message);
      check('Edge 实例清理', false, String(error?.message));
    }
    cdp = null;
  }
}

// ---------------------------------------------------------------------------
// 轻量会话（1024×768 light）：视觉与响应式回归
// ---------------------------------------------------------------------------

async function runLightSession() {
  currentTag = 'light-1024x768';
  evidence.sessions.light = {};
  cdp = await launch({ width: 1024, height: 768, scheme: 'light' });
  try {
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: MIC_TRACKER });
    await preparePage({ waitCardsMs: 150000 });
    await step('light：入口点击 → voice 录音，半高窗纯净', async () => {
      await waitDesktopActive();
      await settle(500);
      await clickSelector('[data-wtsl-agent-entry]');
      await waitStage('voice', 20000);
      await waitVoiceStage('recording', 30000);
      await settle(400);
      const state = await surfaceState();
      checkVoiceGeometry(state, 'light 入口点击');
      await checkVoicePurity('light 录音态');
      check('light：入口后 stage=voice', state.stage === 'voice', `stage=${state.stage}`);
      await screenshot('12-light-voice-recording.png');
      return JSON.stringify({ w: state.width, h: state.height });
    });
    await step('light：转写 → 停留 voice（不 morph）', async () => {
      await clickAria('结束录音并发送', { within: '[data-wtsl-agent-pane="voice"]' });
      await waitVoiceReply(40000);
      await waitVoiceStage('idle', 30000);
      await waitSessionIdle(40000);
      await settle(600);
      const state = await surfaceState();
      check('light：语音回合后仍 stage=voice', state.stage === 'voice', `stage=${state.stage}`);
      await assertNoTextareaFocused('light 语音回合后');
      await screenshot('13-light-voice-reply.png');
      return JSON.stringify({ h: state.height });
    });
    await step('light：展开 → chat 单行 composer', async () => {
      await clickSelector(VOICE_EXPAND_SELECTOR);
      await waitStage('chat', 20000);
      await settle(600);
      const audit = await evaluate(COMPOSER_AUDIT);
      expect(audit.exists, `light 找不到 chat composer：${JSON.stringify(audit)}`);
      const centers = [audit.mic?.cy, audit.textarea?.cy, audit.send?.cy].filter((value) => typeof value === 'number');
      const spread = centers.length === 3 ? Math.max(...centers) - Math.min(...centers) : Number.POSITIVE_INFINITY;
      check('light：composer 三控件垂直中心差 ≤8px', spread <= 8, JSON.stringify(centers));
      check('light：composer 空卡高度 ≤72px', audit.empty === true && audit.composer.h <= 72, JSON.stringify(audit.composer));
      const state = await surfaceState();
      checkFullChatGeometry(state, 'light chat');
      await screenshot('14-light-chat-single-row.png');
      return JSON.stringify({ composer: audit.composer });
    });
    await step('light：console error=0 / 无横向溢出', async () => {
      await settle(600);
      const errors = cdp.consoleErrors.slice();
      check('light console error=0', errors.length === 0, JSON.stringify(errors.slice(0, 5)));
      const state = await surfaceState();
      check('light 无横向溢出', state.overflow.doc <= 0 && state.overflow.surface <= 1, JSON.stringify(state.overflow));
      return `${errors.length} errors`;
    });
  } finally {
    try {
      await cdp.close();
    } catch (error) {
      console.error('Edge 清理失败：', error?.message);
      check('light Edge 实例清理', false, String(error?.message));
    }
    cdp = null;
  }
}

// ---------------------------------------------------------------------------
// reduced-motion 会话
// ---------------------------------------------------------------------------

async function runReducedMotionSession() {
  currentTag = 'reduced-motion';
  evidence.sessions.reducedMotion = {};
  cdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
  try {
    await cdp.setReducedMotion(true);
    await preparePage({ waitCardsMs: 150000 });
    await step('reduced-motion：媒体查询生效 + 连续动画关闭', async () => {
      await waitDesktopActive();
      await settle(400);
      const media = await evaluate(`matchMedia('(prefers-reduced-motion: reduce)').matches`);
      check('reduced-motion 媒体查询生效', media === true, String(media));
      await clickSelector('[data-wtsl-agent-entry]');
      await waitStage('voice', 20000);
      await waitVoiceStage('recording', 30000);
      await settle(600);
      const audit = await evaluate(REDUCED_MOTION_AUDIT);
      evidence.sessions.reducedMotion.audit = audit;
      check('reduced-motion：媒体查询（stage 内复核）', audit.mediaReduced === true, JSON.stringify(audit.mediaReduced));
      const geometryDurations = (audit.surfaceGeometryDuration || [])
        .map((item) => item.duration)
        .filter((value) => Number.isFinite(value));
      check(
        'reduced-motion：容器无尺寸过渡（width/height/border/shadow 时长 0ms）',
        geometryDurations.length === 0 || geometryDurations.every((value) => value === 0),
        JSON.stringify(audit.surfaceGeometryDuration),
      );
      check('reduced-motion：连续动画全部关闭（animationName=none）', audit.animatedCount === 0, JSON.stringify(audit.animatedNames));
      const hasOpacity120 = (audit.opacityTransitions || []).some((item) => Math.abs(item.duration - 120) <= 30);
      check('reduced-motion：仍保留 120ms opacity 入场过渡', hasOpacity120, JSON.stringify(audit.opacityTransitions));
      await screenshot('20-reduced-motion-voice-recording.png');
      return JSON.stringify({ geometryDurations, animated: audit.animatedNames });
    });
    await step('reduced-motion：转写后停留 voice + console error=0', async () => {
      await clickAria('结束录音并发送', { within: '[data-wtsl-agent-pane="voice"]' });
      await waitVoiceReply(40000);
      await waitVoiceStage('idle', 30000);
      await waitSessionIdle(40000);
      await settle(500);
      const state = await surfaceState();
      check('reduced-motion：语音回合后仍 stage=voice', state.stage === 'voice', `stage=${state.stage}`);
      const errors = cdp.consoleErrors.slice();
      check('reduced-motion console error=0', errors.length === 0, JSON.stringify(errors.slice(0, 5)));
      await screenshot('21-reduced-motion-voice-reply.png');
      return JSON.stringify({ h: state.height });
    });
  } finally {
    try {
      await cdp.close();
    } catch (error) {
      console.error('Edge 清理失败：', error?.message);
      check('reduced-motion Edge 实例清理', false, String(error?.message));
    }
    cdp = null;
  }
}

// ---------------------------------------------------------------------------
// --self-test：只校验所有页面内探针表达式 / 交互工具可执行（实现未就绪时排脚本问题）
// ---------------------------------------------------------------------------

async function runSelfTest() {
  currentTag = 'self-test';
  cdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
  try {
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: MIC_TRACKER });
    await preparePage({ waitCardsMs: 0 });
    const probes = {
      SURFACE_STATE,
      VOICE_PANE_AUDIT,
      CHAT_PANE_AUDIT,
      COMPOSER_AUDIT,
      FOCUS_SAMPLE,
      STORE_SUMMARY,
      SESSION_IDLE,
      VOICE_REPLY_READY,
      REDUCED_MOTION_AUDIT,
      MIC_AUDIT,
    };
    for (const [name, expression] of Object.entries(probes)) {
      try {
        const value = await evaluate(expression);
        check(`探针 ${name} 可执行`, true, JSON.stringify(value).slice(0, 320));
      } catch (error) {
        check(`探针 ${name} 可执行`, false, String(error?.message || error));
      }
    }
    for (const [name, fn] of [
      ['installMonitors', installMonitors],
      ['installTranscribingProbe', installTranscribingProbe],
      ['resetStageLog', resetStageLog],
      ['resetFocusLog', resetFocusLog],
    ]) {
      try {
        await fn();
        check(`工具 ${name} 可执行`, true);
      } catch (error) {
        check(`工具 ${name} 可执行`, false, String(error?.message || error));
      }
    }
    try {
      const point = await findBlankPoint();
      check('工具 findBlankPoint 可执行', true, JSON.stringify(point));
    } catch (error) {
      check('工具 findBlankPoint 可执行', false, String(error?.message || error));
    }
    try {
      const state = await surfaceState();
      check('surfaceState 可执行', Boolean(state) && typeof state.stage === 'string', JSON.stringify(state).slice(0, 320));
    } catch (error) {
      check('surfaceState 可执行', false, String(error?.message || error));
    }
    try {
      const stageLogValue = await stageLog();
      const focusLogValue = await focusLog();
      check('stage/focus 日志可执行', Array.isArray(stageLogValue) && Array.isArray(focusLogValue), JSON.stringify({ stage: stageLogValue, focus: focusLogValue }));
    } catch (error) {
      check('stage/focus 日志可执行', false, String(error?.message || error));
    }
  } finally {
    try {
      await cdp.close();
    } catch (error) {
      check('self-test Edge 实例清理', false, String(error?.message));
    }
    cdp = null;
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const startedAt = Date.now();
const selfTestMode = process.argv.includes('--self-test');
let fatal = null;
try {
  if (selfTestMode) {
    await runSelfTest();
  } else {
    await runMainSession();
    await runLightSession();
    await runReducedMotionSession();
  }
} catch (error) {
  fatal = error?.stack || String(error);
  console.error('FATAL', error);
}

const summary = {
  generatedAt: new Date().toISOString(),
  mode: selfTestMode ? 'self-test' : 'full',
  durationMs: Date.now() - startedAt,
  baseUrl: BASE_URL,
  pass: results.filter((item) => item.ok).length,
  fail: failures.length,
  total: results.length,
  results,
  failures,
  evidence,
  fatal,
};
writeFileSync(
  join(OUT, selfTestMode ? 'verify-voice-first-selftest.json' : 'verify-voice-first-results.json'),
  JSON.stringify(summary, null, 2),
);
console.log(
  `\n=== v0.3.7 语音优先 E2E（${summary.mode}）：${summary.pass}/${summary.total} PASS，${summary.fail} FAIL，耗时 ${Math.round(summary.durationMs / 1000)}s ===`,
);
if (summary.fail > 0 || fatal) process.exitCode = 1;

