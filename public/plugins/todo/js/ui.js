/**
 * 轻量 UI 原语：菜单、底部面板（Drawer 风格）、确认框、Toast、分段控件、开关。
 * 插件是 iframe 页面，不能直接引 @fluentui/react-components；这里用原生 DOM + Fluent token
 * 复刻 Fluent 2 的结构与状态（subtle 背景、focus indicator、motionTokens、shadow、radius）。
 */
import { icon } from './icons.js';

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ic(name, size, className) {
  return icon(name, size, className || '');
}

/** 从 CSS 变量读 Fluent 动效时长（不写死常量） */
export function motionMs(token = '--durationNormal', fallback = 200) {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    const match = /^([\d.]+)\s*(ms|s)$/.exec(raw);
    if (!match) return fallback;
    return match[2] === 's' ? Number(match[1]) * 1000 : Number(match[1]);
  } catch {
    return fallback;
  }
}

/** 局部 Toast（脱离宿主时 UI 反馈；宿主内优先走 plugin.notify） */
let toastTimer = 0;
export function toast(text) {
  const host = document.getElementById('toast');
  if (!host) return;
  host.textContent = text;
  host.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => host.classList.remove('show'), 2400);
}

// ------------------------------------------------------------------ overlay

const overlayStack = [];

export function hasOverlay() {
  return overlayStack.length > 0;
}

export function closeTopOverlay() {
  const top = overlayStack[overlayStack.length - 1];
  if (!top) return false;
  top.close();
  return true;
}

function mountOverlay(element, { onEsc } = {}) {
  const root = document.getElementById('overlay');
  root.append(element);
  let closed = false;
  const api = {
    element,
    close(result) {
      if (closed) return;
      closed = true;
      const index = overlayStack.findIndex((item) => item.api === api);
      if (index >= 0) overlayStack.splice(index, 1);
      element.classList.add('closing');
      setTimeout(() => element.remove(), motionMs('--durationFaster', 120));
      onEsc?.(result);
    },
  };
  overlayStack.push({ api, close: () => api.close() });
  return api;
}

/** 底部面板（触控友好；宽屏居中），Fluent Drawer 的观感 */
export function openSheet({ title, subtitle, content = '', footer = '', wide = false, onMount, onClose }) {
  const wrap = document.createElement('div');
  wrap.className = 'ovl';
  wrap.innerHTML = `
    <div class="scrim" data-close="1"></div>
    <section class="sheet${wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <header class="sheet-head">
        <div class="sheet-titles">
          <h2 class="sheet-title">${esc(title)}</h2>
          ${subtitle ? `<p class="sheet-subtitle">${esc(subtitle)}</p>` : ''}
        </div>
        <button type="button" class="tb-btn icon-only" data-close="1" aria-label="关闭">${ic('dismiss')}</button>
      </header>
      <div class="sheet-body">${content}</div>
      ${footer ? `<footer class="sheet-foot">${footer}</footer>` : ''}
    </section>`;
  const api = mountOverlay(wrap, { onEsc: onClose });
  wrap.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => api.close()));
  wrap.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      api.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [...wrap.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])')].filter(
      (el) => !el.disabled && el.offsetParent !== null,
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  const body = wrap.querySelector('.sheet-body');
  onMount?.(body, api);
  requestAnimationFrame(() => {
    const focusable = body.querySelector('input, textarea, button');
    focusable?.focus();
  });
  return api;
}

/** 确认框，Promise<boolean> */
export function confirmDialog({ title = '确认', message = '', confirmLabel = '确定', cancelLabel = '取消', danger = false }) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
      api.close();
    };
    const api = openSheet({
      title,
      content: `<p class="confirm-message">${esc(message)}</p>`,
      footer: `<button type="button" class="btn secondary" data-role="cancel">${esc(cancelLabel)}</button><button type="button" class="btn ${danger ? 'danger' : 'primary'}" data-role="ok">${esc(confirmLabel)}</button>`,
      onClose: () => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      },
      onMount: (body) => {
        body.closest('.sheet').querySelector('[data-role="cancel"]').addEventListener('click', () => finish(false));
        body.closest('.sheet').querySelector('[data-role="ok"]').addEventListener('click', () => finish(true));
      },
    });
  });
}

// ------------------------------------------------------------------ menu

/**
 * Fluent Menu 观感的下拉菜单。
 * items: [{ id, label, icon?, checked?, danger?, disabled?, separator? }]
 */
export function openMenu(anchor, items, { onPick, align = 'start' } = {}) {
  const menu = document.createElement('div');
  menu.className = 'menu';
  menu.setAttribute('role', 'menu');
  const render = () => {
    menu.innerHTML = items
      .map((item, index) => {
        if (item.separator) return '<div class="menu-sep" role="separator"></div>';
        const checked = item.checked ? ic('check', '1em', 'menu-check') : '<span class="menu-check"></span>';
        return `<button type="button" role="${item.checks ? 'menuitemradio' : 'menuitem'}" class="menu-item${item.danger ? ' danger' : ''}" data-index="${index}" aria-checked="${Boolean(item.checked)}" ${item.disabled ? 'aria-disabled="true"' : ''}>${checked}<span class="menu-icon">${item.icon ? ic(item.icon) : ''}</span><span class="menu-label">${esc(item.label)}</span>${item.hint ? `<span class="menu-hint">${esc(item.hint)}</span>` : ''}</button>`;
      })
      .join('');
  };
  render();
  document.body.append(menu);

  const close = () => {
    menu.remove();
    document.removeEventListener('pointerdown', onOutside, true);
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place, true);
  };

  function onOutside(event) {
    if (!menu.contains(event.target) && !anchor.contains(event.target)) close();
  }
  function onKey(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    const focusable = [...menu.querySelectorAll('.menu-item:not([aria-disabled="true"])')];
    if (!focusable.length) return;
    const active = document.activeElement;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const index = Math.max(0, focusable.indexOf(active));
      const next = event.key === 'ArrowDown' ? (index + 1) % focusable.length : (index - 1 + focusable.length) % focusable.length;
      focusable[next].focus();
    }
  }

  const place = () => {
    const rect = anchor.getBoundingClientRect();
    menu.style.visibility = 'hidden';
    menu.style.left = '0px';
    menu.style.top = '0px';
    const menuRect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = align === 'end' ? rect.right - menuRect.width : rect.left;
    left = Math.max(8, Math.min(left, vw - menuRect.width - 8));
    let top = rect.bottom + 4;
    if (top + menuRect.height > vh - 8) top = Math.max(8, rect.top - menuRect.height - 4);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.visibility = 'visible';
  };
  place();

  menu.addEventListener('click', (event) => {
    const button = event.target.closest('.menu-item');
    if (!button) return;
    const item = items[Number(button.dataset.index)];
    if (!item || item.disabled) return;
    close();
    onPick?.(item);
  });

  document.addEventListener('pointerdown', onOutside, true);
  document.addEventListener('keydown', onKey, true);
  // 窗口/卡片尺寸变化时重新定位，而不是关闭（宿主改尺寸时菜单不应该消失）
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, true);
  requestAnimationFrame(() => menu.querySelector('.menu-item')?.focus());
  return { close, element: menu };
}

// ------------------------------------------------------------------ 表单控件（返回 HTML）

export function field(label, control, hint = '') {
  return `<label class="field"><span class="field-label">${label}</span>${control}${hint ? `<span class="field-hint">${esc(hint)}</span>` : ''}</label>`;
}

export function textInput({ id, value = '', placeholder = '', type = 'text', attrs = '' } = {}) {
  return `<input id="${esc(id)}" class="input" type="${esc(type)}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${attrs} />`;
}

export function segmented({ id, options, value, name = 'seg' }) {
  return `<div class="segmented" id="${esc(id)}" role="radiogroup">${options
    .map(
      (option) =>
        `<button type="button" role="radio" class="segment${option.value === value ? ' active' : ''}" data-value="${esc(option.value)}" data-group="${esc(name)}" aria-checked="${option.value === value}">${esc(option.label)}</button>`,
    )
    .join('')}</div>`;
}

export function toggleSwitch({ id, checked, label = '' }) {
  return `<button type="button" class="switch-row" id="${esc(id)}" role="switch" aria-checked="${Boolean(checked)}"><span class="switch" data-checked="${Boolean(checked)}"><span class="switch-knob"></span></span>${label ? `<span class="switch-label">${esc(label)}</span>` : ''}</button>`;
}

/** 分段控件/开关的通用交互绑定 */
export function bindSegmented(container, onChange) {
  container.querySelectorAll('.segment').forEach((button) => {
    button.addEventListener('click', () => {
      container.querySelectorAll('.segment').forEach((item) => {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-checked', String(item === button));
      });
      onChange?.(button.dataset.value);
    });
  });
}

export function bindSwitch(container, onChange) {
  container.querySelectorAll('.switch-row').forEach((row) => {
    row.addEventListener('click', () => {
      const next = row.getAttribute('aria-checked') !== 'true';
      row.setAttribute('aria-checked', String(next));
      row.querySelector('.switch')?.setAttribute('data-checked', String(next));
      onChange?.(next);
    });
  });
}
