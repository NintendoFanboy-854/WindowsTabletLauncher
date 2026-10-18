/**
 * 待办小组件入口：
 * - 读宿主 init（尺寸 / 主题 / 配置）或独立打开时的 URL 参数；
 * - 渲染工具栏、五种视图、输入框；
 * - 交互：勾选、长按编辑、拖拽排序、搜索、排序、清单切换、完成折叠/清空、设置；
 * - Agent 工具注册与调用；提醒调度（background iframe 同样跑）。
 */
import { plugin } from '/plugin-sdk.js';
import {
  PRIORITIES,
  RECURRENCES,
  addDays,
  addMonths,
  combineDateTime,
  dayKey,
  startOfMonth,
  startOfWeek,
  toLocalDateInput,
  toLocalInput,
} from './date.js';
import { LIST_COLORS, SORTS, store } from './store.js';
import { TOOL_DECLS, runTool } from './tools.js';
import { startReminderLoop } from './reminders.js';
import { shouldSeedDemo, seedDemo } from './demo.js';
import * as uiKit from './ui.js';
import { icon } from './icons.js';
import * as views from './views.js';

const params = new URLSearchParams(location.search);
const isBackground =
  /\/background\.html$/.test(location.pathname) ||
  params.get('background') === '1' ||
  params.get('mode') === 'background' ||
  params.get('widget') === 'background';

// ---------------------------------------------------------------- 数据 & 插件协议

store.load();
store.bindStorageSync();
startReminderLoop();
plugin.ready(TOOL_DECLS);

plugin.onToolCall((data) => {
  const { ok, result, error } = runTool(data.name, data.args);
  plugin.toolResult(data.id, ok, ok ? result : error);
});

/** 宿主配置（配置项保存在宿主的插件配置里，localStorage 只是兜底） */
function applyHostConfig(config) {
  if (!config || typeof config !== 'object') return;
  const incoming = config.settings && typeof config.settings === 'object' ? config.settings : config;
  const patch = {};
  for (const key of ['defaultListId', 'showCompleted', 'defaultSort', 'fontSize', 'weekStart']) {
    if (key in incoming) patch[key] = incoming[key];
  }
  if (!Object.keys(patch).length) return;
  store.updateSettings(patch);
  if (!isBackground) {
    ui.sort = store.settings.defaultSort;
    ui.listId = store.settings.defaultListId;
    if (ui.listScope !== 'all') ui.listScope = store.settings.defaultListId;
    applyFontScale();
    render();
  }
}

function persistSettingsToHost() {
  const { defaultListId, showCompleted, defaultSort, fontSize, weekStart } = store.settings;
  plugin.setConfig('settings', { defaultListId, showCompleted, defaultSort, fontSize, weekStart }).catch?.(() => {});
}

plugin.onInit((payload) => {
  applyHostConfig(payload?.config);
  if (isBackground) return;
  applyTheme(payload?.theme);
  applySize(payload?.size);
});

/** 兼容当前原型宿主的旧协议（wtsl:init，只带颜色，没有尺寸） */
window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  const data = event.data;
  if (data && data.type === 'wtsl:init' && data.theme) {
    applyTheme({ colorScheme: 'dark', ...data.theme });
  }
});

// ---------------------------------------------------------------- 小组件状态

const app = document.getElementById('app');
const standalone = !plugin.inHost;
const DEFAULT_SIZE = [3, 3];

/** @type {Record<string, any>} */
const ui = {
  size: DEFAULT_SIZE,
  sizeKey: '3x3',
  view: 'daytodo',
  listScope: 'all',
  listId: store.settings.defaultListId,
  query: '',
  searchOpen: false,
  sort: store.settings.defaultSort,
  completedOpen: false,
  heatWeighted: params.get('heat') === 'weight',
  heatmapOpen: params.get('heatmap') === '1' || params.get('heat') === 'weight',
  composerOpen: false,
  composerDue: null,
  composerListId: null,
  showComposer: false,
  selectedDay: dayKey(new Date()),
  calMode: 'month',
  calCursor: startOfMonth(new Date()),
  weekCursor: startOfWeek(new Date(), store.settings.weekStart),
};

function layoutKind([w, h]) {
  if (w >= 4 && h <= 2) return 'wide';
  if (h >= 3) return 'full';
  if (w >= 3 && h >= 2) return 'medium';
  if (w === 2 && h === 2) return 'mini';
  if (w <= 1 || h <= 1) return 'summary';
  return 'mini';
}

function parseSizeParam(raw) {
  if (!raw) return null;
  const match = /^(\d+)\s*[x×,]\s*(\d+)$/i.exec(String(raw).trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

function applySize(size) {
  const width = Math.max(1, Number(size?.[0]) || DEFAULT_SIZE[0]);
  const height = Math.max(1, Number(size?.[1]) || DEFAULT_SIZE[1]);
  ui.size = [width, height];
  ui.sizeKey = `${width}x${height}`;
  if (!store.listById(ui.listId)) ui.listId = store.lists[0]?.id;
  if (!store.listById(ui.listScope) && ui.listScope !== 'all') ui.listScope = store.settings.defaultListId;
  render();
}

function initWidget() {
  if (standalone) document.body.classList.add('standalone');
  if (shouldSeedDemo()) {
    try {
      seedDemo();
    } catch (error) {
      console.warn('[todo] 演示数据注入失败', error);
    }
  }
  ui.listId = store.settings.defaultListId || store.lists[0]?.id;
  const sizeParam = parseSizeParam(params.get('size'));
  if (sizeParam) ui.size = sizeParam;

  const viewParam = params.get('view');
  if (viewParam === 'week') {
    ui.view = 'weekmonth';
    ui.calMode = 'week';
    ui.weekCursor = startOfWeek(new Date(), store.settings.weekStart);
  } else if (viewParam === 'month') {
    ui.view = 'weekmonth';
    ui.calMode = 'month';
  } else if (views.VIEW_LIST.some((view) => view.id === viewParam)) {
    ui.view = viewParam;
  }
  if (params.get('calmode') === 'week') ui.calMode = 'week';
  if (params.get('completed') === '1') ui.completedOpen = true;

  const listParam = params.get('list');
  if (listParam === 'all') ui.listScope = 'all';
  else if (listParam && store.listById(listParam)) {
    ui.listScope = listParam;
    ui.listId = listParam;
  } else if (params.get('list')) {
    const byName = store.lists.find((list) => list.name === listParam);
    if (byName) {
      ui.listScope = byName.id;
      ui.listId = byName.id;
    }
  }

  store.subscribe(() => render());
  bindEvents();
  new ResizeObserver(() => updateScale()).observe(app);

  // 独立打开时尺寸来自 URL；宿主里等 host:init 的尺寸，先按默认渲染避免白屏
  ui.sizeKey = `${ui.size[0]}x${ui.size[1]}`;
  render();

  // 宿主上可能已有配置，而 init 的 config 快照未必带全，主动补一次
  if (plugin.inHost) {
    Promise.resolve(plugin.getConfig('settings'))
      .then((value) => {
        if (value) applyHostConfig({ settings: value });
      })
      .catch(() => {});
  }
}

function applyFontScale() {
  updateScale();
}

let scaleFrame = 0;
let lastFontSize = 0;

function updateScale() {
  cancelAnimationFrame(scaleFrame);
  scaleFrame = requestAnimationFrame(() => {
    const rect = app.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const basis = Math.min(rect.width, rect.height * 1.35);
    let fontSize = Math.max(10.5, Math.min(16.5, basis / 38));
    if (store.settings.fontSize === 'large') fontSize *= 1.12;
    // 尺寸变化小于 0.2px 时不写 CSS 变量，避免 ResizeObserver 自激
    if (Math.abs(fontSize - lastFontSize) < 0.2) return;
    lastFontSize = fontSize;
    document.documentElement.style.setProperty('--fs', `${fontSize.toFixed(2)}px`);
  });
}

function applyTheme(theme) {
  if (!theme || typeof theme !== 'object') return;
  const root = document.documentElement;
  const source = theme.tokens && typeof theme.tokens === 'object' ? theme.tokens : theme;
  const scheme = theme.colorScheme || source.colorScheme;
  if (scheme === 'light') root.dataset.theme = 'light';
  else if (scheme === 'dark') root.dataset.theme = 'dark';
  const legacy = {
    background: 'colorNeutralBackground1',
    foreground: 'colorNeutralForeground1',
    muted: 'colorNeutralForeground3',
    accent: 'colorBrandBackground',
  };
  for (const [key, value] of Object.entries(source)) {
    if (typeof value !== 'string' || !value || key === 'colorScheme') continue;
    let name = key;
    if (legacy[key]) name = legacy[key];
    else if (key.startsWith('--')) name = key.slice(2);
    root.style.setProperty(`--${name}`, value);
  }
  updateScale();
}

function currentKind() {
  return layoutKind(ui.size);
}

// ---------------------------------------------------------------- 渲染

const SCROLL_SELECTORS = ['#view', '.mini-list', '.medium-list', '.wide-col-body', '.medium-done-list'];

function captureScroll() {
  const map = [];
  for (const selector of SCROLL_SELECTORS) {
    app.querySelectorAll(selector).forEach((el, index) => map.push([selector, index, el.scrollTop]));
  }
  return map;
}

function restoreScroll(map) {
  for (const [selector, index, top] of map) {
    const el = app.querySelectorAll(selector)[index];
    if (el) el.scrollTop = top;
  }
}

function fullLayoutHtml() {
  return `<div class="layout full-layout">${views.toolbarHtml(ui)}<main class="view" id="view" data-scroll data-view="${ui.view}">${views.viewBodyHtml(ui)}</main>${views.composerHtml(ui)}</div>`;
}

function render({ focusKey = null } = {}) {
  const kind = currentKind();
  // 3×3 与 3×2 常驻输入框；4×2 用 + 展开输入；2×2 / 1×1 无输入
  ui.showComposer = kind === 'full' || kind === 'medium' || (kind === 'wide' && ui.composerOpen);

  const active = document.activeElement;
  const activeKey = focusKey || (active && app.contains(active) ? active.dataset?.focusKey : null);
  let selectionStart = null;
  let selectionEnd = null;
  if (activeKey && typeof active?.selectionStart === 'number') {
    selectionStart = active.selectionStart;
    selectionEnd = active.selectionEnd;
  }
  const scroll = captureScroll();

  let html;
  if (kind === 'summary') html = `<div class="layout summary-layout">${views.summaryHtml(ui)}</div>`;
  else if (kind === 'mini') html = `<div class="layout mini-layout">${views.miniListHtml(ui)}</div>`;
  else if (kind === 'medium') html = `<div class="layout medium-layout">${views.mediumListHtml(ui)}${views.composerHtml(ui)}</div>`;
  else if (kind === 'wide') html = `<div class="layout wide-layout">${views.wideListHtml(ui)}${views.composerHtml(ui)}</div>`;
  else html = fullLayoutHtml();

  app.dataset.sizeKey = ui.sizeKey;
  app.dataset.kind = kind;
  app.innerHTML = html;
  restoreScroll(scroll);

  if (activeKey) {
    const next = app.querySelector(`[data-focus-key="${activeKey}"]`);
    if (next) {
      next.focus({ preventScroll: true });
      try {
        if (selectionStart !== null && typeof next.setSelectionRange === 'function') {
          next.setSelectionRange(selectionStart, selectionEnd);
        }
      } catch {
        /* 某些 input 类型不支持 setSelectionRange */
      }
    }
  }
  updateScale();
}

function focusComposer() {
  requestAnimationFrame(() => app.querySelector('#composer-input')?.focus());
}

// ---------------------------------------------------------------- 通用通知

function notifyUser(text) {
  if (plugin.inHost) plugin.notify(text);
  else uiKit.toast(text);
}

// ---------------------------------------------------------------- 动作表

const ACTIONS = {
  'set-view': (el) => {
    const view = el.dataset.view;
    if (!views.VIEW_LIST.some((item) => item.id === view)) return;
    ui.view = view;
    render();
  },
  'open-more-menu': (el) => openMoreMenu(el),
  'open-settings': () => openSettingsSheet(),
  'toggle-search': () => {
    ui.searchOpen = !ui.searchOpen;
    if (!ui.searchOpen) ui.query = '';
    render({ focusKey: ui.searchOpen ? 'search' : null });
  },
  'close-search': () => {
    ui.searchOpen = false;
    ui.query = '';
    render();
  },
  'toggle-completed': () => {
    ui.completedOpen = !ui.completedOpen;
    render();
  },
  'clear-completed': async () => {
    const kind = currentKind();
    const scope = views.scopeInfo(ui);
    const listId = kind === 'full' ? (ui.listScope === 'all' ? undefined : ui.listScope) : ui.listId;
    const count = store.state.tasks.filter(
      (task) => task.done && (!listId || task.listId === listId) && (kind === 'full' || listId),
    ).length;
    if (!count) {
      notifyUser('没有已完成任务');
      return;
    }
    const agreed = await uiKit.confirmDialog({
      title: '清空已完成',
      message: `删除 ${count} 条已完成任务？此操作不可撤销。`,
      confirmLabel: '清空',
      danger: true,
    });
    if (!agreed) return;
    const removed = store.clearCompleted({ listId });
    notifyUser(`已清空 ${removed} 条已完成任务`);
    render();
  },
  'toggle-heat-weight': () => {
    ui.heatWeighted = !ui.heatWeighted;
    render();
  },
  'set-cal-mode': (el) => {
    ui.calMode = el.dataset.mode === 'week' ? 'week' : 'month';
    render();
  },
  'cal-prev': () => {
    if (ui.view === 'weekmonth' && ui.calMode === 'week') ui.weekCursor = addDays(ui.weekCursor, -7);
    else ui.calCursor = addMonths(ui.calCursor, -1);
    render();
  },
  'cal-next': () => {
    if (ui.view === 'weekmonth' && ui.calMode === 'week') ui.weekCursor = addDays(ui.weekCursor, 7);
    else ui.calCursor = addMonths(ui.calCursor, 1);
    render();
  },
  'cal-today': () => {
    ui.calCursor = startOfMonth(new Date());
    ui.weekCursor = startOfWeek(new Date(), store.settings.weekStart);
    ui.selectedDay = dayKey(new Date());
    render();
  },
  'cal-select': (el) => {
    ui.selectedDay = el.dataset.day || dayKey(new Date());
    render();
  },
  'add-on-day': (el) => {
    const day = el.dataset.day;
    if (!day) return;
    ui.composerDue = day;
    ui.selectedDay = day;
    if (currentKind() !== 'full') ui.composerOpen = true;
    render({ focusKey: 'composer' });
    focusComposer();
  },
  'add-on-selected': () => {
    ui.composerDue = ui.selectedDay;
    render({ focusKey: 'composer' });
    focusComposer();
  },
  'clear-composer-due': () => {
    ui.composerDue = null;
    render({ focusKey: 'composer' });
    focusComposer();
  },
  'toggle-composer': () => {
    ui.composerOpen = !ui.composerOpen;
    render({ focusKey: ui.composerOpen ? 'composer' : null });
    if (ui.composerOpen) focusComposer();
  },
  'edit-task': (el) => openTaskEditor(el.dataset.taskId),
};

function dispatchAction(event) {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return false;
  const handler = ACTIONS[actionEl.dataset.action];
  if (!handler) return false;
  event.preventDefault();
  event.stopPropagation();
  handler(actionEl, event);
  return true;
}

// ---------------------------------------------------------------- 菜单

let activeMenu = null;

/** 打开菜单前先关掉上一个，避免点两次按钮叠两个菜单 */
function showMenu(anchor, items, onPick, { align = 'start' } = {}) {
  activeMenu?.close();
  activeMenu = uiKit.openMenu(anchor, items, {
    align,
    onPick(item) {
      activeMenu = null;
      onPick(item);
    },
  });
}

/**
 * 3×3 的 ⋯ 菜单（DENSITY.md：常驻工具条只留今日/最近 + 搜索 + ⋯）：
 * 视图（分类清单 / 日历 / 周月）、清单切换、排序、工作量热力图、设置都在这里。
 */
function openMoreMenu(anchor) {
  const items = [];
  // 今日 / 最近 常驻在工具条，菜单里只放另外三个视图
  for (const view of views.VIEW_LIST.filter((entry) => entry.id !== 'daytodo' && entry.id !== 'recent')) {
    items.push({
      id: `view:${view.id}`,
      label: view.menuLabel || view.label,
      icon: view.icon,
      checks: true,
      checked: ui.view === view.id,
    });
  }
  items.push({ separator: true });
  items.push({ id: 'list:__all', label: '全部清单', icon: 'appsList', checks: true, checked: ui.listScope === 'all' });
  const counts = new Map();
  for (const task of store.state.tasks) if (!task.done) counts.set(task.listId, (counts.get(task.listId) || 0) + 1);
  for (const list of store.lists) {
    items.push({ id: `list:${list.id}`, label: list.name, checks: true, checked: ui.listScope === list.id, hint: String(counts.get(list.id) || 0) });
  }
  items.push({ id: 'list:__new', label: '新建清单', icon: 'add' });
  items.push({ separator: true });
  const sortIcons = { manual: 'reorder', due: 'calendar', priority: 'flag', created: 'clock' };
  for (const sort of SORTS) {
    items.push({ id: `sort:${sort.value}`, label: `排序：${sort.label}`, icon: sortIcons[sort.value], checks: true, checked: ui.sort === sort.value });
  }
  items.push({ separator: true });
  items.push({ id: 'heatmap', label: '工作量热力图', icon: 'histogram', checks: true, checked: Boolean(ui.heatmapOpen) });
  items.push({ id: 'settings', label: '设置', icon: 'settings' });

  showMenu(
    anchor,
    items,
    (item) => {
      if (item.id.startsWith('view:')) {
        const view = item.id.slice(5);
        if (views.VIEW_LIST.some((entry) => entry.id === view)) ui.view = view;
      } else if (item.id === 'list:__all') {
        ui.listScope = 'all';
      } else if (item.id === 'list:__new') {
        openNewListSheet();
        return;
      } else if (item.id.startsWith('list:')) {
        const listId = item.id.slice(5);
        ui.listScope = listId;
        ui.listId = listId;
      } else if (item.id.startsWith('sort:')) {
        ui.sort = item.id.slice(5);
      } else if (item.id === 'heatmap') {
        ui.heatmapOpen = !ui.heatmapOpen;
      } else if (item.id === 'settings') {
        openSettingsSheet();
        return;
      }
      render();
    },
    { align: 'end' },
  );
}

// ---------------------------------------------------------------- 编辑任务（长按 / ⋯ / 周视图点任务）

function splitLocalInput(iso, { dropEndOfDay = false } = {}) {
  const value = toLocalInput(iso) || '';
  const [date, time] = value.split('T');
  const isEndOfDay = time === '23:59';
  return { date: date || '', time: dropEndOfDay && isEndOfDay ? '' : time || '' };
}

function openTaskEditor(taskId) {
  const task = store.taskById(taskId);
  if (!task) return;
  const due = splitLocalInput(task.dueAt, { dropEndOfDay: true });
  const remind = splitLocalInput(task.remindAt);
  const draft = {
    title: task.title,
    note: task.note || '',
    priority: task.priority,
    dueDate: due.date,
    dueTime: due.time,
    remindDate: remind.date,
    remindTime: remind.time,
    recurrence: task.recurrence || '',
    tags: [...task.tags],
    subtasks: [...task.subtasks].sort((a, b) => a.order - b.order).map((sub) => ({ ...sub })),
    listId: task.listId,
  };

  const tagsHtml = () =>
    draft.tags.length
      ? draft.tags
          .map(
            (tag) =>
              `<span class="chip tag editable">${uiKit.esc(tag)}<button type="button" class="chip-x" data-tag="${uiKit.esc(tag)}" aria-label="移除标签">${icon('dismiss')}</button></span>`,
          )
          .join('')
      : '<span class="field-hint">还没有标签</span>';

  const subsHtml = () =>
    draft.subtasks.length
      ? draft.subtasks
          .map(
            (sub, index) => `<div class="sub-edit" data-index="${index}">
              <button type="button" class="sub-toggle" data-sub-toggle="${index}" role="checkbox" aria-checked="${sub.done}"><span class="check small${sub.done ? ' checked' : ''}">${sub.done ? icon('check') : ''}</span></button>
              <span class="sub-edit-title">${uiKit.esc(sub.title)}</span>
              <button type="button" class="tb-btn icon-only" data-sub-remove="${index}" aria-label="删除子任务">${icon('dismiss')}</button>
            </div>`,
          )
          .join('')
      : '<p class="field-hint">还没有子任务，输入后回车添加</p>';

  const content = `
    <div class="editor">
      ${uiKit.field('标题', `<input id="ed-title" class="input" type="text" value="${uiKit.esc(draft.title)}" autocomplete="off" />`)}
      ${uiKit.field('备注', `<textarea id="ed-note" class="input textarea" rows="2" placeholder="补充说明（可留空）">${uiKit.esc(draft.note)}</textarea>`)}
      ${uiKit.field(
        '优先级',
        uiKit.segmented({
          id: 'ed-priority',
          name: 'priority',
          options: PRIORITIES.map((item) => ({ value: String(item.value), label: item.label })),
          value: String(draft.priority),
        }),
      )}
      ${uiKit.field(
        '截止日期',
        `<div class="field-inline">
          <input id="ed-due-date" class="input" type="date" value="${uiKit.esc(draft.dueDate)}" aria-label="截止日期" />
          <input id="ed-due-time" class="input time" type="time" value="${uiKit.esc(draft.dueTime)}" aria-label="截止时间" />
          <button type="button" class="tb-btn subtle-text" id="ed-due-clear">清除</button>
        </div>`,
        '只选日期时按当天 23:59 到期',
      )}
      ${uiKit.field(
        '提醒',
        `<div class="field-inline">
          <input id="ed-remind-date" class="input" type="date" value="${uiKit.esc(draft.remindDate)}" aria-label="提醒日期" />
          <input id="ed-remind-time" class="input time" type="time" value="${uiKit.esc(draft.remindTime)}" aria-label="提醒时间" />
          <button type="button" class="tb-btn subtle-text" id="ed-remind-clear">清除</button>
        </div>`,
        '到点由后台 iframe 触发强提醒',
      )}
      ${uiKit.field(
        '重复',
        uiKit.segmented({
          id: 'ed-recurrence',
          name: 'recurrence',
          options: [{ value: '', label: '不重复' }, ...RECURRENCES.map((item) => ({ value: item.value, label: item.label }))],
          value: draft.recurrence,
        }),
      )}
      ${uiKit.field('标签', `<div class="tag-editor" id="ed-tags">${tagsHtml()}<input id="ed-tag-input" class="input inline-input" type="text" placeholder="回车添加" autocomplete="off" /></div>`)}
      ${uiKit.field('子任务', `<div class="sub-editor" id="ed-subtasks">${subsHtml()}<input id="ed-sub-input" class="input inline-input" type="text" placeholder="回车添加子任务" autocomplete="off" /></div>`)}
      ${uiKit.field(
        '清单',
        `<select id="ed-list" class="input select">${store.lists
          .map((list) => `<option value="${uiKit.esc(list.id)}"${list.id === draft.listId ? ' selected' : ''}>${uiKit.esc(list.name)}</option>`)
          .join('')}</select>`,
      )}
    </div>`;

  const footer = `
    <button type="button" class="btn danger-text" data-role="delete">${icon('del')}删除</button>
    <span class="sheet-spacer"></span>
    <button type="button" class="btn secondary" data-role="cancel">取消</button>
    <button type="button" class="btn primary" data-role="save">保存</button>`;

  const sheet = uiKit.openSheet({
    title: '编辑任务',
    subtitle: task.recurrence ? '重复任务：完成后会自动生成下一次' : '',
    content,
    footer,
    onMount(body, api) {
      const $ = (selector) => body.querySelector(selector);
      uiKit.bindSegmented($('#ed-priority'), (value) => {
        draft.priority = Number(value);
      });
      uiKit.bindSegmented($('#ed-recurrence'), (value) => {
        draft.recurrence = value;
      });

      const tagsEditor = $('#ed-tags');
      const tagInput = $('#ed-tag-input');
      const renderTags = () => {
        tagsEditor.innerHTML = `${tagsHtml()}<input id="ed-tag-input" class="input inline-input" type="text" placeholder="回车添加" autocomplete="off" />`;
        const nextInput = tagsEditor.querySelector('input');
        nextInput.addEventListener('keydown', onTagKey);
        tagsEditor.querySelectorAll('[data-tag]').forEach((button) => {
          button.addEventListener('click', () => {
            draft.tags = draft.tags.filter((tag) => tag !== button.dataset.tag);
            renderTags();
            tagsEditor.querySelector('input')?.focus();
          });
        });
      };
      function onTagKey(event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        const value = event.currentTarget.value.trim();
        if (!value) return;
        if (!draft.tags.includes(value)) draft.tags.push(value);
        renderTags();
        tagsEditor.querySelector('input')?.focus();
      }
      tagInput.addEventListener('keydown', onTagKey);
      tagsEditor.querySelectorAll('[data-tag]').forEach((button) => {
        button.addEventListener('click', () => {
          draft.tags = draft.tags.filter((tag) => tag !== button.dataset.tag);
          renderTags();
        });
      });

      const subEditor = $('#ed-subtasks');
      const subInput = $('#ed-sub-input');
      const bindSubs = () => {
        subEditor.querySelectorAll('[data-sub-toggle]').forEach((button) => {
          button.addEventListener('click', () => {
            const sub = draft.subtasks[Number(button.dataset.subToggle)];
            sub.done = !sub.done;
            renderSubs();
          });
        });
        subEditor.querySelectorAll('[data-sub-remove]').forEach((button) => {
          button.addEventListener('click', () => {
            draft.subtasks.splice(Number(button.dataset.subRemove), 1);
            renderSubs();
          });
        });
      };
      const renderSubs = () => {
        subEditor.innerHTML = `${subsHtml()}<input id="ed-sub-input" class="input inline-input" type="text" placeholder="回车添加子任务" autocomplete="off" />`;
        const input = subEditor.querySelector('input');
        input.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          const value = event.currentTarget.value.trim();
          if (!value) return;
          draft.subtasks.push({ id: null, title: value, done: false, order: draft.subtasks.length });
          renderSubs();
          subEditor.querySelector('input')?.focus();
        });
        bindSubs();
      };
      bindSubs();
      subInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        const value = event.currentTarget.value.trim();
        if (!value) return;
        draft.subtasks.push({ id: null, title: value, done: false, order: draft.subtasks.length });
        renderSubs();
        subEditor.querySelector('input')?.focus();
      });

      $('#ed-due-clear').addEventListener('click', () => {
        $('#ed-due-date').value = '';
        $('#ed-due-time').value = '';
      });
      $('#ed-remind-clear').addEventListener('click', () => {
        $('#ed-remind-date').value = '';
        $('#ed-remind-time').value = '';
      });

      const sheetEl = body.closest('.sheet');
      sheetEl.querySelector('[data-role="cancel"]').addEventListener('click', () => api.close());
      sheetEl.querySelector('[data-role="delete"]').addEventListener('click', async () => {
        const agreed = await uiKit.confirmDialog({
          title: '删除任务',
          message: `删除「${draft.title || task.title}」？`,
          confirmLabel: '删除',
          danger: true,
        });
        if (!agreed) return;
        api.close();
        try {
          store.removeTask(task.id);
          notifyUser('已删除任务');
        } catch (error) {
          notifyUser(error.message);
        }
      });
      sheetEl.querySelector('[data-role="save"]').addEventListener('click', () => {
        const title = $('#ed-title').value.trim();
        if (!title) {
          $('#ed-title').focus();
          notifyUser('标题不能为空');
          return;
        }
        const dueDate = $('#ed-due-date').value;
        const dueTime = $('#ed-due-time').value;
        const remindDate = $('#ed-remind-date').value;
        const remindTime = $('#ed-remind-time').value;
        try {
          store.updateTask(task.id, {
            title,
            note: $('#ed-note').value,
            priority: draft.priority,
            dueAt: dueDate ? combineDateTime(dueDate, dueTime || null) : null,
            remindAt: remindDate ? combineDateTime(remindDate, remindTime || '09:00') : null,
            recurrence: draft.recurrence || null,
            tags: draft.tags,
            listId: $('#ed-list').value,
          });
          applySubtaskDiff(task.id, draft.subtasks);
          api.close();
          notifyUser('已保存');
        } catch (error) {
          notifyUser(error.message);
        }
      });
    },
  });
  return sheet;
}

/** 把编辑面板里的子任务草稿同步到 store */
function applySubtaskDiff(taskId, draftSubtasks) {
  const task = store.taskById(taskId);
  if (!task) return;
  const draftIds = new Set(draftSubtasks.filter((sub) => sub.id).map((sub) => sub.id));
  for (const sub of [...task.subtasks]) {
    if (!draftIds.has(sub.id)) store.removeSubtask(taskId, sub.id);
  }
  for (const sub of draftSubtasks) {
    if (!sub.id) {
      store.addSubtask(taskId, sub.title);
      continue;
    }
    const current = store.taskById(taskId)?.subtasks.find((item) => item.id === sub.id);
    if (current && current.done !== sub.done) store.completeSubtask(taskId, sub.id, sub.done);
  }
}

// ---------------------------------------------------------------- 新建清单 / 设置

function openNewListSheet() {
  const colorState = { value: LIST_COLORS[store.lists.length % LIST_COLORS.length] };
  const content = `
    ${uiKit.field('清单名', '<input id="new-list-name" class="input" type="text" placeholder="例如：工作 / 学习 / 家务" autocomplete="off" />')}
    ${uiKit.field(
      '颜色',
      `<div class="swatches" id="new-list-colors">${LIST_COLORS.map(
        (color) => `<button type="button" class="swatch${color === colorState.value ? ' active' : ''}" data-color="${uiKit.esc(color)}" style="--dot:var(--${uiKit.esc(color)})" aria-label="${uiKit.esc(color)}"></button>`,
      ).join('')}</div>`,
    )}`;
  const footer = `<span class="sheet-spacer"></span><button type="button" class="btn secondary" data-role="cancel">取消</button><button type="button" class="btn primary" data-role="create">创建</button>`;
  uiKit.openSheet({
    title: '新建清单',
    content,
    footer,
    onMount(body, api) {
      const input = body.querySelector('#new-list-name');
      const colors = body.querySelector('#new-list-colors');
      colors.addEventListener('click', (event) => {
        const button = event.target.closest('.swatch');
        if (!button) return;
        colorState.value = button.dataset.color;
        colors.querySelectorAll('.swatch').forEach((item) => item.classList.toggle('active', item === button));
      });
      const create = () => {
        const name = input.value.trim();
        if (!name) {
          input.focus();
          return;
        }
        const list = store.addList(name, colorState.value);
        ui.listScope = list.id;
        ui.listId = list.id;
        api.close();
        render();
        notifyUser(`已创建清单「${list.name}」`);
      };
      const sheetEl = body.closest('.sheet');
      sheetEl.querySelector('[data-role="cancel"]').addEventListener('click', () => api.close());
      sheetEl.querySelector('[data-role="create"]').addEventListener('click', create);
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          create();
        }
      });
    },
  });
}

function openSettingsSheet() {
  const settings = store.settings;
  const content = `
    <div class="editor settings">
      ${uiKit.field(
        '默认清单',
        `<select id="set-default-list" class="input select">${store.lists
          .map((list) => `<option value="${uiKit.esc(list.id)}"${list.id === settings.defaultListId ? ' selected' : ''}>${uiKit.esc(list.name)}</option>`)
          .join('')}</select>`,
      )}
      ${uiKit.field('显示已完成', uiKit.toggleSwitch({ id: 'set-show-completed', checked: settings.showCompleted, label: '在列表底部折叠展示已完成任务' }))}
      ${uiKit.field(
        '默认排序',
        uiKit.segmented({
          id: 'set-default-sort',
          name: 'default-sort',
          options: SORTS.map((sort) => ({ value: sort.value, label: sort.label })),
          value: settings.defaultSort,
        }),
      )}
      ${uiKit.field(
        '字号',
        uiKit.segmented({
          id: 'set-font-size',
          name: 'font-size',
          options: [
            { value: 'default', label: '默认' },
            { value: 'large', label: '大' },
          ],
          value: settings.fontSize,
        }),
      )}
      ${uiKit.field(
        '一周起始日',
        uiKit.segmented({
          id: 'set-week-start',
          name: 'week-start',
          options: [
            { value: '1', label: '周一' },
            { value: '0', label: '周日' },
          ],
          value: String(settings.weekStart),
        }),
      )}
      <div class="settings-about">
        <p>待办 v1.0 · 数据保存在本机 localStorage（todo.*），不上传。</p>
        <p>提醒由后台 iframe 定时触发；重复任务完成后自动生成下一次。</p>
      </div>
    </div>`;

  uiKit.openSheet({
    title: '待办设置',
    content,
    onMount(body, api) {
      body.querySelector('#set-default-list').addEventListener('change', (event) => {
        store.updateSettings({ defaultListId: event.target.value });
        ui.listId = event.target.value;
        if (ui.listScope !== 'all') ui.listScope = event.target.value;
        persistSettingsToHost();
        render();
      });
      uiKit.bindSwitch(body, (next) => {
        store.updateSettings({ showCompleted: next });
        persistSettingsToHost();
      });
      uiKit.bindSegmented(body.querySelector('#set-default-sort'), (value) => {
        store.updateSettings({ defaultSort: value });
        ui.sort = value;
        persistSettingsToHost();
        render();
      });
      uiKit.bindSegmented(body.querySelector('#set-font-size'), (value) => {
        store.updateSettings({ fontSize: value });
        persistSettingsToHost();
        updateScale();
      });
      uiKit.bindSegmented(body.querySelector('#set-week-start'), (value) => {
        const weekStart = Number(value) === 0 ? 0 : 1;
        store.updateSettings({ weekStart });
        ui.weekCursor = startOfWeek(new Date(), weekStart);
        persistSettingsToHost();
        render();
      });
    },
  });
}

// ---------------------------------------------------------------- 事件

let pressState = null;
let dragState = null;
const LONG_PRESS_MS = 500;

function bindEvents() {
  app.addEventListener('click', (event) => {
    const subtask = event.target.closest('.subtask');
    if (subtask) {
      const taskId = subtask.dataset.taskId;
      const subId = subtask.dataset.subId;
      const task = store.taskById(taskId);
      const current = task?.subtasks.find((sub) => sub.id === subId);
      if (current) {
        try {
          store.completeSubtask(taskId, subId, !current.done);
        } catch (error) {
          notifyUser(error.message);
        }
      }
      return;
    }
    dispatchAction(event);
  });

  app.addEventListener('submit', (event) => {
    if (event.target.id !== 'composer') return;
    event.preventDefault();
    submitComposer();
  });

  app.addEventListener('input', (event) => {
    if (event.target.id !== 'search-input') return;
    ui.query = event.target.value;
    render({ focusKey: 'search' });
  });

  app.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target.classList?.contains('task')) {
      const taskId = target.dataset.taskId;
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        toggleTask(taskId);
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const rows = [...app.querySelectorAll('.task[data-task-id]')];
        const index = rows.indexOf(target);
        const next = rows[index + (event.key === 'ArrowDown' ? 1 : -1)];
        next?.focus();
        return;
      }
      if (event.key === 'e' || event.key === 'E') {
        event.preventDefault();
        openTaskEditor(taskId);
        return;
      }
    }
    if (target.classList?.contains('subtask')) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        const task = store.taskById(target.dataset.taskId);
        const sub = task?.subtasks.find((item) => item.id === target.dataset.subId);
        if (sub) store.completeSubtask(task.id, sub.id, !sub.done);
      }
    }
  });

  app.addEventListener('contextmenu', (event) => {
    const row = event.target.closest('.task[data-task-id]');
    if (!row) return;
    event.preventDefault();
    openTaskEditor(row.dataset.taskId);
  });

  app.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerCancel);

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (uiKit.hasOverlay()) return;
    if (ui.searchOpen) {
      ui.searchOpen = false;
      ui.query = '';
      render();
      event.preventDefault();
      return;
    }
    if ((currentKind() === 'medium' || currentKind() === 'wide') && ui.composerOpen) {
      ui.composerOpen = false;
      render();
      event.preventDefault();
      return;
    }
    plugin.exitFocus();
  });

  plugin.onFocus(() => {
    const target =
      app.querySelector('.task[data-task-id]') ||
      app.querySelector('#composer-input') ||
      app.querySelector('button');
    target?.focus();
  });

  plugin.onTheme((theme) => applyTheme(theme));
  plugin.onResize((size) => applySize(size));
}

function toggleTask(taskId) {
  const task = store.taskById(taskId);
  if (!task) return;
  try {
    store.setDone(taskId, !task.done);
  } catch (error) {
    notifyUser(error.message);
  }
}

function submitComposer() {
  const input = app.querySelector('#composer-input');
  if (!input) return;
  const title = input.value.trim();
  if (!title) return;
  let listId;
  const kind = currentKind();
  if (ui.composerListId) listId = ui.composerListId;
  else if (kind === 'full') {
    const scope = views.scopeInfo(ui);
    listId = scope.isAll ? store.settings.defaultListId : scope.id;
  } else {
    listId = ui.listId;
  }
  const dueAt = ui.composerDue ? combineDateTime(ui.composerDue, null) : undefined;
  try {
    store.addTask({ title, listId, dueAt });
    ui.composerListId = null;
    render({ focusKey: 'composer' });
    focusComposer();
  } catch (error) {
    notifyUser(error.message);
  }
}

function onPointerDown(event) {
  const handle = event.target.closest('[data-drag-handle]');
  if (handle) {
    startDrag(event, handle.closest('.task'));
    return;
  }
  if (event.target.closest('button, input, textarea, select, .subtask')) return;
  const row = event.target.closest('.task[data-task-id]');
  if (!row) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  pressState = {
    row,
    id: row.dataset.taskId,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    longFired: false,
    timer: setTimeout(() => {
      if (!pressState) return;
      pressState.longFired = true;
      openTaskEditor(pressState.id);
    }, LONG_PRESS_MS),
  };
}

function onPointerMove(event) {
  if (dragState) {
    moveDrag(event);
    return;
  }
  if (!pressState) return;
  const dx = event.clientX - pressState.startX;
  const dy = event.clientY - pressState.startY;
  if (Math.hypot(dx, dy) > 10) {
    pressState.moved = true;
    clearTimeout(pressState.timer);
  }
}

function onPointerUp() {
  if (dragState) {
    endDrag();
    return;
  }
  if (!pressState) return;
  const press = pressState;
  pressState = null;
  clearTimeout(press.timer);
  if (press.longFired || press.moved) return;
  if (!document.contains(press.row)) return;
  toggleTask(press.id);
}

function onPointerCancel() {
  if (pressState) {
    clearTimeout(pressState.timer);
    pressState = null;
  }
  if (dragState) endDrag();
}

// ---------------------------------------------------------------- 拖拽排序

function startDrag(event, row) {
  if (!row || ui.sort !== 'manual') return;
  if (event.button !== undefined && event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  if (pressState) {
    clearTimeout(pressState.timer);
    pressState = null;
  }
  const task = store.taskById(row.dataset.taskId);
  if (!task) return;
  dragState = {
    row,
    taskId: task.id,
    listId: task.listId,
    container: row.parentElement,
    indicator: document.createElement('div'),
  };
  dragState.indicator.className = 'drop-indicator';
  row.classList.add('dragging');
  document.body.classList.add('is-dragging');
}

function dragRows() {
  if (!dragState) return [];
  const { container, listId } = dragState;
  return [...container.querySelectorAll('.task[data-task-id]')].filter((row) => store.taskById(row.dataset.taskId)?.listId === listId);
}

function moveDrag(event) {
  if (!dragState) return;
  if (event.cancelable) event.preventDefault();
  const rows = dragRows();
  const target = rows.find((row) => {
    if (row === dragState.row) return false;
    const rect = row.getBoundingClientRect();
    return event.clientY >= rect.top && event.clientY <= rect.bottom;
  });
  dragState.target = target || null;
  dragState.targetAfter = false;
  if (target) {
    const rect = target.getBoundingClientRect();
    dragState.targetAfter = event.clientY > rect.top + rect.height / 2;
  }
  if (!target) {
    dragState.indicator.remove();
    return;
  }
  if (dragState.indicator.parentElement !== target.parentElement) {
    target.parentElement.insertBefore(dragState.indicator, target);
  }
  if (dragState.targetAfter) target.after(dragState.indicator);
  else target.before(dragState.indicator);
}

function endDrag() {
  const state = dragState;
  dragState = null;
  if (!state) return;
  state.indicator.remove();
  state.row.classList.remove('dragging');
  document.body.classList.remove('is-dragging');
  const target = state.target;
  if (!target) return;
  const listTasks = store.sortTasks(store.state.tasks.filter((task) => task.listId === state.listId), 'manual');
  const ids = listTasks.map((task) => task.id).filter((id) => id !== state.taskId);
  const targetId = target.dataset.taskId;
  let index = ids.indexOf(targetId);
  if (index < 0) index = ids.length;
  else if (state.targetAfter) index += 1;
  ids.splice(index, 0, state.taskId);
  try {
    store.reorderTasks(state.listId, ids);
  } catch (error) {
    notifyUser(error.message);
  }
}

// 设置页保存到宿主的失败（脱离宿主时 SDK 兜底）不阻塞交互
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[todo] unhandled rejection', event.reason);
});

// ---------------------------------------------------------------- 启动

if (isBackground) {
  document.documentElement.dataset.mode = 'background';
} else {
  initWidget();
  // 调试/截图钩子：?dev=editor|settings|newlist|moremenu 可直接打开对应浮层
  const dev = params.get('dev');
  if (dev && standalone) {
    setTimeout(() => {
      const firstTask = store.tasks.find((task) => !task.done);
      if (dev === 'editor' && firstTask) openTaskEditor(firstTask.id);
      else if (dev === 'settings') openSettingsSheet();
      else if (dev === 'newlist') openNewListSheet();
      else if (dev === 'moremenu') openMoreMenu(app.querySelector('[data-action="open-more-menu"]'));
    }, 250);
  }
}
