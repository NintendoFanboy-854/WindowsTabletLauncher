/**
 * 倒数日插件
 *
 * 规格：docs/components/countdown.md
 * - 1×1 最近一条（天数 + 截断标题）/ 2×1 单事件（标题 + 天数）
 * - 2×2 列表（最多 4 条）/ 3×2 列表 + 新增按钮
 * - 每年重复自动换算到下一个周年日；今天 = 就是今天（高亮）；过去 = 已过 N 天
 * - 颜色用 Fluent 调色板 token 名；长按某条删除；点击编辑
 * - Agent 工具：countdown.list / countdown.add / countdown.remove
 */
import { plugin } from '/plugin-sdk.js';

/* ------------------------------------------------------------------ */
/* 常量                                                                */
/* ------------------------------------------------------------------ */

const SUPPORTED_SIZES = [
  [1, 1],
  [2, 1],
  [2, 2],
  [3, 2],
];
const DEFAULT_SIZE = [2, 1];
const ITEMS_KEY = 'countdown.items';
const SETTINGS_KEY = 'countdown.settings';
const MAX_ITEMS = 50; // docs/components/countdown.md：数量达 50 时 add 返回错误
const LONG_PRESS_MS = 500; // DESIGN.md 的长按阈值（交互参数，不是动效时长）

const DEFAULT_SETTINGS = {
  showPast: true,
  highlightSoon: true,
};

const COLORS = [
  { id: 'accent', label: '主题色', token: '--colorBrandForeground1' },
  { id: 'blue', label: '蓝色', token: '--colorPaletteBlueForeground2' },
  { id: 'green', label: '绿色', token: '--colorPaletteGreenForeground1' },
  { id: 'orange', label: '橙色', token: '--colorPaletteOrangeForeground2' },
  { id: 'red', label: '红色', token: '--colorPaletteRedForeground1' },
  { id: 'purple', label: '紫色', token: '--colorPalettePurpleForeground2' },
  { id: 'teal', label: '青色', token: '--colorPaletteTealForeground2' },
];

const COLOR_BY_ID = new Map(COLORS.map((color) => [color.id, color]));

const THEME_ALIASES = {
  background: '--colorNeutralBackground1',
  foreground: '--colorNeutralForeground1',
  muted: '--colorNeutralForeground3',
  accent: '--colorBrandForeground1',
};

/* ------------------------------------------------------------------ */
/* DOM                                                                 */
/* ------------------------------------------------------------------ */

const $ = (id) => document.getElementById(id);
const els = {
  widget: $('widget'),
  single: $('single'),
  list: $('list'),
  empty: $('empty'),
  emptyAdd: $('empty-add'),
  barCount: $('bar-count'),
  addBtn: $('add-btn'),
  menuBackdrop: $('menu-backdrop'),
  contextMenu: $('context-menu'),
  menuTitle: $('menu-title'),
  menuMeta: $('menu-meta'),
  menuEdit: $('menu-edit'),
  menuSettings: $('menu-settings'),
  menuDelete: $('menu-delete'),
  scrim: $('scrim'),
  formSheet: $('form-sheet'),
  formTitle: $('form-title'),
  formClose: $('form-close'),
  formError: $('form-error'),
  formName: $('form-name'),
  formDate: $('form-date'),
  formRepeat: $('form-repeat'),
  formColors: $('form-colors'),
  formDelete: $('form-delete'),
  formCancel: $('form-cancel'),
  formSave: $('form-save'),
  settingsSheet: $('settings-sheet'),
  settingsClose: $('settings-close'),
  setShowPast: $('set-show-past'),
  setHighlightSoon: $('set-highlight-soon'),
  confirmSheet: $('confirm-sheet'),
  confirmClose: $('confirm-close'),
  confirmText: $('confirm-text'),
  confirmCancel: $('confirm-cancel'),
  confirmDelete: $('confirm-delete'),
};

/* ------------------------------------------------------------------ */
/* 状态                                                                */
/* ------------------------------------------------------------------ */

const state = {
  settings: loadSettings(),
  items: loadItems(),
  size: resolveSize(),
  sizeFromUrl: sizeFromUrl(),
  panel: null,
  editingId: null,
  deletingId: null,
  suppressClick: false,
  menuOpen: false,
  menuItemId: null,
};

/* ------------------------------------------------------------------ */
/* 存储                                                                */
/* ------------------------------------------------------------------ */

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 内存态继续工作 */
  }
}

function loadSettings() {
  const stored = readJSON(SETTINGS_KEY, null);
  return { ...DEFAULT_SETTINGS, ...(stored && typeof stored === 'object' ? stored : {}) };
}

function saveSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  writeJSON(SETTINGS_KEY, state.settings);
  plugin.setConfig(SETTINGS_KEY, state.settings);
  syncSettingsControls();
  render();
}

function loadItems() {
  const stored = readJSON(ITEMS_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored
    .filter((item) => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.targetDate === 'string')
    .map((item) => ({
      id: item.id,
      title: item.title,
      targetDate: item.targetDate,
      repeatYearly: Boolean(item.repeatYearly),
      color: COLOR_BY_ID.has(item.color) ? item.color : 'accent',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    }));
}

function saveItems() {
  writeJSON(ITEMS_KEY, state.items);
}

/* ------------------------------------------------------------------ */
/* 日期工具                                                            */
/* ------------------------------------------------------------------ */

const pad2 = (n) => String(n).padStart(2, '0');

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateString(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function toDateString(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** 周年日：2 月 29 日在平年按当月最后一天算，不额外做规则 */
function anniversaryInYear(base, year) {
  const daysInMonth = new Date(year, base.getMonth() + 1, 0).getDate();
  const day = Math.min(base.getDate(), daysInMonth);
  return new Date(year, base.getMonth(), day);
}

function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

/** 把一条记录换算成“今天视角”的展示数据 */
function decorate(item, today) {
  const base = parseDateString(item.targetDate);
  if (!base) return null;
  const todayStart = startOfDay(today);
  let target = base;
  if (item.repeatYearly) {
    const thisYear = anniversaryInYear(base, todayStart.getFullYear());
    const nextYear = anniversaryInYear(base, todayStart.getFullYear() + 1);
    target = thisYear >= todayStart ? thisYear : nextYear;
  }
  const days = daysBetween(todayStart, target);
  const color = COLOR_BY_ID.get(item.color) ?? COLORS[0];
  const sub = item.repeatYearly
    ? `每年 ${base.getMonth() + 1}月${base.getDate()}日`
    : toDateString(target);
  let status = 'future';
  if (days === 0) status = 'today';
  else if (days < 0) status = 'past';
  return { item, target, targetDate: toDateString(target), days, color, colorToken: color.token, sub, status };
}

function displayText(entry) {
  if (entry.days === 0) return '就是今天';
  if (entry.days > 0) return `还有 ${entry.days} 天`;
  return `已过 ${Math.abs(entry.days)} 天`;
}

/** 未来升序在前、过去按最近在前；过去事件可被设置过滤 */
function sortEntries(entries) {
  entries.sort((a, b) => {
    const aPast = a.days < 0;
    const bPast = b.days < 0;
    if (aPast && bPast) return b.days - a.days;
    if (aPast) return 1;
    if (bPast) return -1;
    return a.days - b.days;
  });
  return entries;
}

function sortedEntries() {
  const today = new Date();
  const showPast = state.settings.showPast;
  const entries = [];
  for (const item of state.items) {
    const entry = decorate(item, today);
    if (!entry) continue;
    if (entry.days < 0 && !showPast) continue;
    entries.push(entry);
  }
  return sortEntries(entries);
}

/* ------------------------------------------------------------------ */
/* 主题 / 尺寸                                                         */
/* ------------------------------------------------------------------ */

function applyTheme(theme) {
  if (!theme || typeof theme !== 'object') return;
  const root = document.documentElement;
  if (theme.colorScheme === 'light' || theme.colorScheme === 'dark') root.dataset.scheme = theme.colorScheme;
  for (const [key, value] of Object.entries(theme)) {
    if (typeof value !== 'string') continue;
    let target = THEME_ALIASES[key];
    if (!target && /^(color|font|borderRadius|spacing|shadow|duration|curve|strokeWidth)/.test(key)) {
      target = `--${key}`;
    }
    if (target) root.style.setProperty(target, value);
  }
}

function isSupported(size) {
  return SUPPORTED_SIZES.some(([w, h]) => w === size[0] && h === size[1]);
}

function pickSize(w, h) {
  if (isSupported([w, h])) return [w, h];
  const aspect = w / h;
  let best = SUPPORTED_SIZES[0];
  let bestDelta = Infinity;
  for (const candidate of SUPPORTED_SIZES) {
    const delta = Math.abs(candidate[0] / candidate[1] - aspect);
    if (delta < bestDelta) {
      best = candidate;
      bestDelta = delta;
    }
  }
  return best;
}

function sizeFromUrl() {
  const raw = new URLSearchParams(location.search).get('size');
  const match = /^(\d+)x(\d+)$/.exec(raw || '');
  if (!match) return null;
  return pickSize(Number(match[1]), Number(match[2]));
}

function resolveSize() {
  const fromUrl = sizeFromUrl();
  if (fromUrl) return fromUrl;
  const rect = document.documentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) return pickSize(rect.width, rect.height);
  return DEFAULT_SIZE;
}

function applySize(size) {
  state.size = size;
  document.documentElement.dataset.size = size[0] + 'x' + size[1];
}

/* ------------------------------------------------------------------ */
/* 渲染                                                                */
/* ------------------------------------------------------------------ */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function svgIcon(pathData) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', 'currentColor');
  path.setAttribute('d', pathData);
  svg.append(path);
  return svg;
}

const ICON_CALENDAR =
  'M7 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2m4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5zM4 7h12v7.5c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5zm1.5-3h9c.83 0 1.5.67 1.5 1.5V6H4v-.5C4 4.67 4.67 4 5.5 4';

function daysNode(entry, { pillText = '就是今天' } = {}) {
  const wrap = el('span', 'days-wrap');
  if (entry.status === 'today') {
    wrap.append(el('span', 'today-pill', pillText));
    return wrap;
  }
  if (entry.status === 'past') wrap.append(el('span', 'days-unit', '已过'));
  wrap.append(el('span', 'days-num', String(Math.abs(entry.days))));
  wrap.append(el('span', 'days-unit', '天'));
  return wrap;
}

function buildItemNode(entry) {
  const node = el('div', 'item');
  node.setAttribute('role', 'listitem');
  node.tabIndex = 0;
  node.dataset.id = entry.item.id;
  node.style.setProperty('--item-color', `var(${entry.colorToken})`);

  if (entry.days === 0) node.classList.add('is-today');
  else if (state.settings.highlightSoon && entry.days > 0 && entry.days < 7) node.classList.add('is-soon');

  const main = el('span', 'item-main');
  main.append(el('span', 'item-title', entry.item.title));

  const days = el('span', 'item-days');
  days.append(daysNode(entry, { pillText: '今天' }));

  node.setAttribute('aria-label', `${entry.item.title}，${displayText(entry)}`);
  node.append(main, days);
  return node;
}

function buildSingleNode(entry) {
  const node = document.createElement('div');
  node.className = 'single-card';
  node.style.setProperty('--item-color', `var(${entry.colorToken})`);

  const info = el('span', 'single-info');
  info.append(el('span', 'single-title', entry.item.title));

  const count = el('span', 'single-count');
  count.append(daysNode(entry));

  node.append(info, count);
  return node;
}

function render() {
  const entries = sortedEntries();
  const empty = entries.length === 0;
  document.body.classList.toggle('is-empty', empty);
  els.empty.classList.toggle('is-visible', empty);

  if (empty) {
    els.empty.querySelector('.empty-title').textContent =
      state.items.length === 0 ? '还没有倒数日' : '没有可显示的倒数日';
    els.emptyAdd.hidden = state.items.length > 0;
    els.single.textContent = '';
    els.list.textContent = '';
    els.barCount.textContent = '';
    return;
  }

  const isListSize = state.size[0] === 2 && state.size[1] === 2 ? true : state.size[0] === 3;
  const limit = state.size[0] === 3 ? 6 : 4;

  if (isListSize) {
    els.list.textContent = '';
    els.single.textContent = '';
    const shown = entries.slice(0, limit);
    for (const entry of shown) els.list.append(buildItemNode(entry));
    els.barCount.textContent = `${shown.length} 项`;
  } else {
    els.list.textContent = '';
    const nearest = entries[0];
    els.single.textContent = '';
    els.single.append(buildSingleNode(nearest));
    els.single.setAttribute('aria-label', `${nearest.item.title}，${displayText(nearest)}，点击编辑`);
    els.single.dataset.id = nearest.item.id;
  }
}

/* ------------------------------------------------------------------ */
/* 覆盖层管理                                                          */
/* ------------------------------------------------------------------ */

function motionMs(name, fallback = 200) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^([\d.]+)ms$/.exec(raw);
  return match ? Number(match[1]) : fallback;
}

const sheets = { form: els.formSheet, settings: els.settingsSheet, confirm: els.confirmSheet };

function focusFirst(sheet) {
  const target = sheet.querySelector('input, button, [tabindex]');
  if (target) target.focus({ preventScroll: true });
}

function openPanel(name) {
  if (state.panel === name) return;
  closeContextMenu();
  if (state.panel) {
    const previous = sheets[state.panel];
    previous.classList.remove('is-open');
    previous.hidden = true;
  }
  state.panel = name;
  const sheet = sheets[name];
  els.scrim.hidden = false;
  sheet.hidden = false;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.scrim.classList.add('is-open');
      sheet.classList.add('is-open');
    });
  });
  window.setTimeout(() => focusFirst(sheet), 30);
}

function closePanel() {
  if (!state.panel) return;
  const name = state.panel;
  const sheet = sheets[name];
  state.panel = null;
  els.scrim.classList.remove('is-open');
  sheet.classList.remove('is-open');
  window.setTimeout(() => {
    if (state.panel) return;
    sheet.hidden = true;
    els.scrim.hidden = true;
  }, motionMs('--durationNormal') + 20);
}

/* ------------------------------------------------------------------ */
/* 表单                                                                */
/* ------------------------------------------------------------------ */

function buildColorOptions() {
  els.formColors.textContent = '';
  for (const color of COLORS) {
    const label = document.createElement('label');
    label.className = 'swatch';
    label.title = color.label;
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'countdown-color';
    input.value = color.id;
    input.setAttribute('aria-label', color.label);
    const dot = el('span', 'swatch-dot');
    dot.style.setProperty('--swatch-color', `var(${color.token})`);
    label.append(input, dot);
    els.formColors.append(label);
  }
}

function setColorValue(colorId) {
  for (const input of els.formColors.querySelectorAll('input[name="countdown-color"]')) {
    input.checked = input.value === colorId;
  }
}

function getColorValue() {
  const checked = els.formColors.querySelector('input[name="countdown-color"]:checked');
  return checked ? checked.value : 'accent';
}

function showFormError(message) {
  els.formError.textContent = message || '';
  els.formError.classList.toggle('is-visible', Boolean(message));
}

function openForm(item) {
  state.editingId = item ? item.id : null;
  state.deletingId = null;
  els.formTitle.textContent = item ? '编辑倒数日' : '新增倒数日';
  els.formName.value = item ? item.title : '';
  els.formDate.value = item ? item.targetDate : toDateString(new Date());
  els.formRepeat.checked = item ? item.repeatYearly : false;
  setColorValue(item ? item.color : 'accent');
  els.formDelete.hidden = !item;
  showFormError('');
  openPanel('form');
}

function saveForm() {
  const title = els.formName.value.trim();
  const date = els.formDate.value;
  if (!title) {
    showFormError('请填写标题');
    els.formName.focus();
    return;
  }
  if (!parseDateString(date)) {
    showFormError('请选择合法日期');
    els.formDate.focus();
    return;
  }

  const repeatYearly = els.formRepeat.checked;
  const color = getColorValue();
  const isEditing = Boolean(state.editingId);

  if (isEditing) {
    const item = state.items.find((candidate) => candidate.id === state.editingId);
    if (!item) {
      showFormError('这条倒数日已不存在');
      return;
    }
    item.title = title;
    item.targetDate = date;
    item.repeatYearly = repeatYearly;
    item.color = color;
  } else {
    if (state.items.length >= MAX_ITEMS) {
      showFormError(`最多 ${MAX_ITEMS} 条倒数日`);
      return;
    }
    state.items.push({
      id: `cd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      targetDate: date,
      repeatYearly,
      color,
      createdAt: new Date().toISOString(),
    });
  }

  saveItems();
  plugin.notify(isEditing ? `已更新「${title}」` : `已添加「${title}」`);
  closePanel();
  render();
}

function openConfirm(id) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) return;
  state.deletingId = id;
  els.confirmText.textContent = `删除「${item.title}」？删除后不可恢复。`;
  openPanel('confirm');
}

/* ---------------- 长按菜单：日期/重复/编辑/设置/删除 ---------------- */

function positionContextMenu(x, y) {
  const margin = 8;
  const menu = els.contextMenu;
  menu.style.left = '0px';
  menu.style.top = '0px';
  const rect = menu.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  let left = x + margin;
  let top = y + margin;
  if (left + rect.width > viewportWidth - margin) {
    left = Math.max(margin, x - rect.width - margin);
  }
  if (top + rect.height > viewportHeight - margin) {
    top = Math.max(margin, y - rect.height - margin);
  }
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}

function openContextMenu(id, x, y) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) return;
  const entry = decorate(item, new Date());
  if (!entry) return;
  state.menuItemId = id;
  els.menuTitle.textContent = item.title;
  const repeat = item.repeatYearly ? entry.sub : entry.targetDate;
  els.menuMeta.textContent = `${repeat} · ${displayText(entry)}`;
  els.menuBackdrop.hidden = false;
  els.contextMenu.hidden = false;
  positionContextMenu(x, y);
  state.menuOpen = true;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => els.contextMenu.classList.add('is-open'));
  });
  els.menuEdit.focus({ preventScroll: true });
}

function closeContextMenu() {
  if (!state.menuOpen) return;
  state.menuOpen = false;
  state.menuItemId = null;
  els.contextMenu.classList.remove('is-open');
  els.menuBackdrop.hidden = true;
  window.setTimeout(() => {
    if (!state.menuOpen) els.contextMenu.hidden = true;
  }, motionMs('--durationFast') + 20);
}

function confirmDelete() {
  const id = state.deletingId;
  if (!id) return;
  const item = state.items.find((candidate) => candidate.id === id);
  state.items = state.items.filter((candidate) => candidate.id !== id);
  state.deletingId = null;
  saveItems();
  if (item) plugin.notify(`已删除「${item.title}」`);
  closePanel();
  render();
}

/* ------------------------------------------------------------------ */
/* 设置面板                                                            */
/* ------------------------------------------------------------------ */

function syncSettingsControls() {
  els.setShowPast.checked = state.settings.showPast;
  els.setHighlightSoon.checked = state.settings.highlightSoon;
}

/* ------------------------------------------------------------------ */
/* 交互                                                                */
/* ------------------------------------------------------------------ */

function idFromNode(node) {
  const target = node?.closest?.('.item');
  return target?.dataset.id ?? null;
}

function openItem(id) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (item) openForm(item);
}

let pressTimer = 0;
let pressOrigin = null;

function startPress(event) {
  const id = idFromNode(event.target);
  if (!id || state.menuOpen) return;
  clearPress();
  pressOrigin = { x: event.clientX, y: event.clientY };
  pressTimer = window.setTimeout(() => {
    state.suppressClick = true;
    openContextMenu(id, pressOrigin.x, pressOrigin.y);
  }, LONG_PRESS_MS);
}

function clearPress() {
  if (pressTimer) window.clearTimeout(pressTimer);
  pressTimer = 0;
  pressOrigin = null;
}

function movePress(event) {
  if (!pressOrigin) return;
  const dx = event.clientX - pressOrigin.x;
  const dy = event.clientY - pressOrigin.y;
  if (Math.hypot(dx, dy) > 8) clearPress();
}

els.list.addEventListener('pointerdown', startPress);
els.list.addEventListener('pointermove', movePress);
els.list.addEventListener('pointerup', clearPress);
els.list.addEventListener('pointercancel', clearPress);
els.list.addEventListener('pointerleave', clearPress);

els.list.addEventListener('click', (event) => {
  const id = idFromNode(event.target);
  if (!id) return;
  if (state.suppressClick) {
    state.suppressClick = false;
    return;
  }
  openItem(id);
});

els.list.addEventListener('keydown', (event) => {
  const node = event.target.closest?.('.item');
  if (!node) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openItem(node.dataset.id);
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    openConfirm(node.dataset.id);
  }
});

function onSingleActivate() {
  const id = els.single.dataset.id;
  if (id && state.panel === null) openItem(id);
}

els.single.addEventListener('click', (event) => {
  if (state.suppressClick) {
    state.suppressClick = false;
    return;
  }
  event.stopPropagation();
  onSingleActivate();
});

let singlePressTimer = 0;
let singlePressOrigin = null;
els.single.addEventListener('pointerdown', (event) => {
  const id = els.single.dataset.id;
  if (!id || state.menuOpen) return;
  singlePressOrigin = { x: event.clientX, y: event.clientY };
  singlePressTimer = window.setTimeout(() => {
    state.suppressClick = true;
    openContextMenu(id, singlePressOrigin.x, singlePressOrigin.y);
  }, LONG_PRESS_MS);
});
for (const name of ['pointerup', 'pointercancel', 'pointerleave']) {
  els.single.addEventListener(name, () => window.clearTimeout(singlePressTimer));
}

els.addBtn.addEventListener('click', () => openForm(null));
els.emptyAdd.addEventListener('click', () => openForm(null));

// 长按菜单操作
els.menuEdit.addEventListener('click', () => {
  const id = state.menuItemId;
  closeContextMenu();
  if (id) openItem(id);
});
els.menuSettings.addEventListener('click', () => {
  closeContextMenu();
  syncSettingsControls();
  openPanel('settings');
});
els.menuDelete.addEventListener('click', () => {
  const id = state.menuItemId;
  closeContextMenu();
  if (id) openConfirm(id);
});
els.menuBackdrop.addEventListener('click', closeContextMenu);

// 长按空白处（非事件行）= 打开倒数日设置；正常模式不出现齿轮
let blankPressTimer = 0;
els.widget.addEventListener('pointerdown', (event) => {
  if (state.panel || state.menuOpen) return;
  if (event.target.closest?.('.item, .single, .btn, .icon-btn')) return;
  window.clearTimeout(blankPressTimer);
  blankPressTimer = window.setTimeout(() => {
    syncSettingsControls();
    openPanel('settings');
  }, LONG_PRESS_MS);
});
for (const name of ['pointerup', 'pointercancel', 'pointerleave']) {
  els.widget.addEventListener(name, () => window.clearTimeout(blankPressTimer));
}

els.formSave.addEventListener('click', saveForm);
els.formCancel.addEventListener('click', closePanel);
els.formClose.addEventListener('click', closePanel);
els.formDelete.addEventListener('click', () => {
  if (state.editingId) {
    const id = state.editingId;
    state.editingId = null;
    openConfirm(id);
  }
});
els.formName.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') saveForm();
});

els.settingsClose.addEventListener('click', closePanel);
els.setShowPast.addEventListener('change', () => saveSettings({ showPast: els.setShowPast.checked }));
els.setHighlightSoon.addEventListener('change', () => saveSettings({ highlightSoon: els.setHighlightSoon.checked }));

els.confirmDelete.addEventListener('click', confirmDelete);
els.confirmCancel.addEventListener('click', closePanel);
els.confirmClose.addEventListener('click', closePanel);
els.scrim.addEventListener('click', closePanel);

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (state.menuOpen) {
    event.preventDefault();
    closeContextMenu();
  } else if (state.panel) {
    event.preventDefault();
    closePanel();
  } else {
    plugin.exitFocus();
  }
});

/* ------------------------------------------------------------------ */
/* Agent 工具                                                          */
/* ------------------------------------------------------------------ */

const TOOLS = [
  {
    name: 'countdown.list',
    description: '列出倒数日事件（含剩余天数）',
    parameters: {
      type: 'object',
      properties: { includePast: { type: 'boolean', description: '是否包含已过去的事件，默认 true' } },
      additionalProperties: false,
    },
  },
  {
    name: 'countdown.add',
    description: '新增一条倒数日',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '事件标题' },
        targetDate: { type: 'string', description: '目标日期 YYYY-MM-DD' },
        repeatYearly: { type: 'boolean', description: '是否每年重复（生日/纪念日）' },
        color: { type: 'string', description: `颜色 token：${COLORS.map((color) => color.id).join(' / ')}` },
      },
      required: ['title', 'targetDate'],
      additionalProperties: false,
    },
  },
  {
    name: 'countdown.remove',
    description: '按 id 删除一条倒数日',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string', description: '倒数日 id' } },
      required: ['id'],
      additionalProperties: false,
    },
  },
];

function toolList(args) {
  const includePast = args?.includePast !== false;
  const today = new Date();
  const entries = [];
  for (const item of state.items) {
    const entry = decorate(item, today);
    if (!entry) continue;
    if (!includePast && entry.days < 0) continue;
    entries.push(entry);
  }
  sortEntries(entries);
  return {
    today: toDateString(today),
    items: entries.map((entry) => ({
      id: entry.item.id,
      title: entry.item.title,
      targetDate: entry.targetDate,
      repeatYearly: entry.item.repeatYearly,
      color: entry.item.color,
      days: entry.days,
      status: entry.status,
      display: displayText(entry),
    })),
  };
}

function toolAdd(args) {
  const title = typeof args?.title === 'string' ? args.title.trim() : '';
  const targetDate = typeof args?.targetDate === 'string' ? args.targetDate : '';
  if (!title) throw new Error('title 不能为空');
  if (!parseDateString(targetDate)) throw new Error('targetDate 必须是合法的 YYYY-MM-DD');
  if (state.items.length >= MAX_ITEMS) throw new Error(`最多 ${MAX_ITEMS} 条倒数日`);
  const color = typeof args?.color === 'string' && COLOR_BY_ID.has(args.color) ? args.color : 'accent';
  const item = {
    id: `cd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    targetDate,
    repeatYearly: Boolean(args?.repeatYearly),
    color,
    createdAt: new Date().toISOString(),
  };
  state.items.push(item);
  saveItems();
  render();
  const entry = decorate(item, new Date());
  return {
    id: item.id,
    title: item.title,
    targetDate: item.targetDate,
    repeatYearly: item.repeatYearly,
    color: item.color,
    days: entry ? entry.days : null,
    display: entry ? displayText(entry) : '',
  };
}

function toolRemove(args) {
  const id = typeof args?.id === 'string' ? args.id : '';
  if (!id) throw new Error('id 不能为空');
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`找不到 id 为 ${id} 的倒数日`);
  state.items = state.items.filter((candidate) => candidate.id !== id);
  saveItems();
  render();
  return { removed: true, id, title: item.title };
}

plugin.onToolCall((message) => {
  if (!message || typeof message.name !== 'string') return;
  const { id, name, args } = message;
  try {
    switch (name) {
      case 'countdown.list':
        plugin.toolResult(id, true, toolList(args));
        break;
      case 'countdown.add':
        plugin.toolResult(id, true, toolAdd(args));
        break;
      case 'countdown.remove':
        plugin.toolResult(id, true, toolRemove(args));
        break;
      default:
        plugin.toolResult(id, false, `未知工具：${name}`);
    }
  } catch (error) {
    plugin.toolResult(id, false, error instanceof Error ? error.message : String(error));
  }
});

/* ------------------------------------------------------------------ */
/* 启动                                                                */
/* ------------------------------------------------------------------ */

function seedDemo() {
  if (readJSON(ITEMS_KEY, null)) return;
  const offset = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return toDateString(date);
  };
  state.items = [
    { id: 'demo-1', title: '项目截止', targetDate: offset(3), repeatYearly: false, color: 'orange', createdAt: new Date().toISOString() },
    { id: 'demo-2', title: '结婚纪念日', targetDate: '2021-10-18', repeatYearly: true, color: 'red', createdAt: new Date().toISOString() },
    { id: 'demo-3', title: '期末考试', targetDate: offset(45), repeatYearly: false, color: 'purple', createdAt: new Date().toISOString() },
    { id: 'demo-4', title: '搬家', targetDate: offset(-20), repeatYearly: false, color: 'blue', createdAt: new Date().toISOString() },
    { id: 'demo-5', title: '妈妈生日', targetDate: '1968-04-12', repeatYearly: true, color: 'green', createdAt: new Date().toISOString() },
  ];
  saveItems();
}

function applyInitConfig(config) {
  if (!config || typeof config !== 'object') return null;
  const direct = config[SETTINGS_KEY] ?? config.settings ?? config;
  if (!direct || typeof direct !== 'object') return null;
  const patch = {};
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (direct[key] !== undefined) patch[key] = direct[key];
  }
  return Object.keys(patch).length ? patch : null;
}

/** 兼容宿主把 settings 拆成字段存在 init.config 的情况 */
function applyFlatConfig(config) {
  if (!config || typeof config !== 'object') return null;
  const patch = {};
  if (typeof config.showPast === 'boolean') patch.showPast = config.showPast;
  if (typeof config.highlightSoon === 'boolean') patch.highlightSoon = config.highlightSoon;
  return Object.keys(patch).length ? patch : null;
}

function boot() {
  applySize(state.size);
  buildColorOptions();
  syncSettingsControls();
  render();
}

plugin.ready(TOOLS);

plugin.onInit((payload) => {
  if (payload?.theme) applyTheme(payload.theme);
  const patch = applyInitConfig(payload?.config) ?? applyFlatConfig(payload?.config);
  if (patch) {
    state.settings = { ...state.settings, ...patch };
    writeJSON(SETTINGS_KEY, state.settings);
  }
  if (!patch && plugin.inHost) {
    plugin.getConfig(SETTINGS_KEY).then((stored) => {
      if (stored && typeof stored === 'object') {
        state.settings = { ...state.settings, ...stored };
        syncSettingsControls();
        render();
      }
    });
  }
  if (!state.sizeFromUrl && Array.isArray(payload?.size)) {
    applySize(pickSize(Number(payload.size[0]), Number(payload.size[1])));
  }
  syncSettingsControls();
  render();
});

plugin.onResize((size) => {
  if (state.sizeFromUrl || !Array.isArray(size)) return;
  applySize(pickSize(Number(size[0]), Number(size[1])));
  render();
});

plugin.onTheme((theme) => applyTheme(theme));

plugin.onFocus(() => {
  if (state.panel === 'form') els.formName.focus({ preventScroll: true });
  else if (state.size[0] === 3) els.addBtn.focus({ preventScroll: true });
  else if (state.size[0] === 2 && state.size[1] === 1) els.single.focus({ preventScroll: true });
  else {
    const first = els.list.querySelector('.item');
    (first || els.emptyAdd).focus({ preventScroll: true });
  }
});

window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  if (event.data?.type === 'host:open-settings') {
    syncSettingsControls();
    openPanel('settings');
  }
});

const urlParams = new URLSearchParams(location.search);
// ?demo=1 是给开发/截图用的显式开关（宿主不会带这个参数）
if (urlParams.get('demo') === '1') seedDemo();

if (!plugin.inHost) {
  document.body.classList.add('is-standalone');
  boot();
  if (urlParams.get('form') === '1') openForm(null);
  else if (urlParams.get('settings') === '1') {
    syncSettingsControls();
    openPanel('settings');
  } else if (urlParams.get('menu') === '1') {
    const first = sortedEntries()[0];
    if (first) window.setTimeout(() => openContextMenu(first.item.id, 160, 170), 400);
  }
} else {
  boot();
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) render();
});

// 其它 iframe（后台页面/多实例）改了数据：storage 事件跨文档同步
window.addEventListener('storage', (event) => {
  if (event.key === ITEMS_KEY) {
    state.items = loadItems();
    render();
  } else if (event.key === SETTINGS_KEY) {
    state.settings = loadSettings();
    syncSettingsControls();
    render();
  }
});
