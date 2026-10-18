/**
 * 视图渲染：只产出 HTML 字符串，交互由 app.js 的事件委托统一处理。
 * 五种视图：Daytodo / 最近待办 / 分类清单 / 日历+任务 / 周视图·月视图；
 * 另含工作量热力图、1×1 计数、2×2·3×2·4×2 的简化列表。
 */
import { icon } from './icons.js';
import {
  DAY,
  addDays,
  dayKey,
  fmtDate,
  fmtTime,
  isSameDay,
  priorityMeta,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDate,
  weekdayLabels,
} from './date.js';
import { store } from './store.js';
import { esc } from './ui.js';

const VIEWS = [
  { id: 'daytodo', label: '今日', menuLabel: '今日（Daytodo）', icon: 'calendarDay', title: 'Daytodo：今天 / 明天' },
  { id: 'recent', label: '最近', menuLabel: '最近待办', icon: 'clock', title: '最近待办' },
  { id: 'category', label: '清单', menuLabel: '分类清单', icon: 'folder', title: '分类清单' },
  { id: 'calendar', label: '日历', menuLabel: '日历 + 任务', icon: 'calendar', title: '日历 + 任务' },
  { id: 'weekmonth', label: '周月', menuLabel: '周视图 / 月视图', icon: 'calendarMonth', title: '周视图 / 月视图' },
];

/** 常驻在工具条上的两个主视图（其余视图收进 ⋯ 菜单） */
const TAB_VIEWS = VIEWS.filter((view) => view.id === 'daytodo' || view.id === 'recent');

export const VIEW_LIST = VIEWS;
export const TAB_VIEW_LIST = TAB_VIEWS;

export function scopeInfo(ui) {
  if (ui.listScope === 'all') {
    return { id: 'all', name: '全部清单', color: 'colorNeutralForeground3', isAll: true };
  }
  const list = store.listById(ui.listScope) || store.listById(store.settings.defaultListId) || store.lists[0];
  return { id: list?.id, name: list?.name || '清单', color: list?.color || 'colorNeutralForeground3', isAll: false };
}

function scopeTasks(ui) {
  const scope = scopeInfo(ui);
  if (scope.isAll) return store.state.tasks;
  return store.state.tasks.filter((task) => task.listId === scope.id);
}

/** 已完成任务统一按完成时间倒序（最近的在前） */
function sortDone(tasks) {
  return [...tasks].sort((a, b) => (toDate(b.doneAt)?.getTime() || 0) - (toDate(a.doneAt)?.getTime() || 0));
}

function dot(color) {
  return `<span class="list-dot" style="--dot:var(--${esc(color)})"></span>`;
}

// ---------------------------------------------------------------- 任务行

/**
 * 任务行的唯一主元信息（DENSITY.md：逾期 / 今日时间 / 优先级点 三选一）。
 * 清单、重复、标签、子任务进度等一律收进长按打开的详情面板。
 */
function primaryMeta(task, now = new Date()) {
  if (task.done) return '';
  const due = toDate(task.dueAt);
  if (due) {
    if (due < now) {
      const days = Math.floor((now.getTime() - due.getTime()) / DAY);
      return `<span class="task-meta overdue" title="已逾期">${days >= 1 ? `逾期 ${days} 天` : '已逾期'}</span>`;
    }
    if (isSameDay(due, now)) {
      const hasTime = !(due.getHours() === 23 && due.getMinutes() === 59);
      if (hasTime) return `<span class="task-meta today" title="今天 ${fmtTime(due)}">${fmtTime(due)}</span>`;
    }
  }
  if (task.priority > 0) {
    const meta = priorityMeta(task.priority);
    return `<span class="prio-dot p${task.priority}" title="优先级：${esc(meta.label)}" aria-label="优先级${esc(meta.label)}"></span>`;
  }
  return '';
}

export function taskRow(task, ui, { dense = false } = {}) {
  const draggable = ui.sort === 'manual' && !task.done;
  const classes = ['task'];
  if (task.done) classes.push('done');
  if (dense) classes.push('dense');
  return `<div class="${classes.join(' ')}" role="checkbox" aria-checked="${task.done}" data-task-id="${esc(task.id)}" tabindex="0" title="${esc(task.title)}">
      ${draggable ? `<span class="drag-handle" data-drag-handle data-noclick title="拖动排序">${icon('reorder')}</span>` : ''}
      <span class="check${task.done ? ' checked' : ''}">${task.done ? icon('check') : ''}</span>
      <span class="task-title">${esc(task.title)}</span>
      ${primaryMeta(task)}
    </div>`;
}

// ---------------------------------------------------------------- 分组

function groupHeader(label, count, extra = '') {
  return `<div class="group-head"><span class="group-label">${label}</span>${count === undefined || count === null ? '' : `<span class="group-count">${count}</span>`}${extra}</div>`;
}

function emptyBlock(title, hint = '') {
  return `<div class="empty">${icon('taskList', '1.7em', 'empty-icon')}<p class="empty-title">${esc(title)}</p>${hint ? `<p class="empty-hint">${esc(hint)}</p>` : ''}</div>`;
}

function sortForView(ui, scopeId) {
  return ui.sort;
}

export function completedSectionHtml(ui, doneTasks, { allLists = false } = {}) {
  if (!store.settings.showCompleted) return '';
  const count = doneTasks.length;
  if (!count) return '';
  const open = ui.completedOpen;
  const rows = open ? doneTasks.map((task) => taskRow(task, ui, { dense: true })).join('') : '';
  return `<section class="completed">
    <div class="completed-head">
      <button type="button" class="tb-btn subtle-text" data-action="toggle-completed" aria-expanded="${open}">
        ${icon(open ? 'chevronDown' : 'chevronRight')}<span>已完成</span><span class="completed-count">${count}</span>
      </button>
      <button type="button" class="tb-btn subtle-text danger-text" data-action="clear-completed">清空</button>
    </div>
    <div class="completed-list">${rows}</div>
  </section>`;
}

// ---------------------------------------------------------------- 搜索

function searchViewHtml(ui) {
  const hits = store.searchTasks(ui.query);
  const undone = hits.filter((task) => !task.done);
  const done = hits.filter((task) => task.done);
  const scope = scopeInfo(ui);
  const scoped = (tasks) => (scope.isAll ? tasks : tasks.filter((task) => task.listId === scope.id));
  const undoneScoped = scoped(undone);
  const doneScoped = scoped(done);
  return `
    ${groupHeader(`搜索结果 · “${esc(ui.query)}”`, undoneScoped.length + doneScoped.length)}
    ${undoneScoped.map((task) => taskRow(task, ui)).join('')}
    ${doneScoped.map((task) => taskRow(task, ui)).join('')}
    ${!undoneScoped.length && !doneScoped.length ? emptyBlock('没有匹配', '换个关键词试试') : ''}`;
}

// ---------------------------------------------------------------- Daytodo

function daytodoHtml(ui) {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const tasks = scopeTasks(ui).filter((task) => !task.done);
  const overdue = tasks.filter((task) => {
    const due = toDate(task.dueAt);
    return due && due < today;
  });
  const todayTasks = tasks.filter((task) => task.dueAt && isSameDay(task.dueAt, today));
  const tomorrowTasks = tasks.filter((task) => task.dueAt && isSameDay(task.dueAt, tomorrow));
  const todayAll = store.sortTasks([...overdue, ...todayTasks], ui.sort);
  const tomorrowAll = store.sortTasks(tomorrowTasks, ui.sort);
  const doneToday = scopeTasks(ui).filter(
    (task) => task.done && task.doneAt && isSameDay(task.doneAt, now),
  );
  const row = (task) => taskRow(task, ui);
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
  const todayLabel = `今天 · ${now.getMonth() + 1}月${now.getDate()}日 周${weekday}`;

  return `
    <div class="dtd-grid">
      <section class="dtd-col">
        ${groupHeader(todayLabel, todayAll.length)}
        ${todayAll.map(row).join('') || emptyBlock('今天没有到期任务', '在下方输入框添加，或从「无日期」里挑一件')}
      </section>
      <section class="dtd-col">
        ${groupHeader('明天', tomorrowAll.length)}
        ${tomorrowAll.map(row).join('') || emptyBlock('明天还空着', '提前安排，明天会轻松一点')}
      </section>
    </div>
    ${completedSectionHtml(ui, sortDone(doneToday))}`;
}

// ---------------------------------------------------------------- 最近待办 + 热力图

function recentGroups(ui) {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const tasks = store.sortTasks(scopeTasks(ui).filter((task) => !task.done), ui.sort);
  const groups = [
    { key: 'today', label: '今天', tasks: [] },
    { key: 'tomorrow', label: '明天', tasks: [] },
    { key: 'later', label: '以后', tasks: [] },
    { key: 'none', label: '无日期', tasks: [] },
  ];
  const map = Object.fromEntries(groups.map((group) => [group.key, group]));
  for (const task of tasks) {
    const due = toDate(task.dueAt);
    if (!due) map.none.tasks.push(task);
    else if (dayKey(due) < dayKey(today)) map.today.tasks.push(task);
    else if (isSameDay(due, today)) map.today.tasks.push(task);
    else if (isSameDay(due, tomorrow)) map.tomorrow.tasks.push(task);
    else map.later.tasks.push(task);
  }
  return groups;
}

export function heatmapHtml(ui) {
  const heatDays = 112;
  const stats = store.completionStats(heatDays, { weighted: ui.heatWeighted });
  const levels = (() => {
    const values = [...stats.byDay.values()].map((bucket) => (ui.heatWeighted ? bucket.weight : bucket.count));
    const max = Math.max(1, ...values);
    return { max, pick: (value) => (value <= 0 ? 0 : Math.min(4, Math.ceil((value / max) * 4))) };
  })();
  const days = [...stats.byDay.keys()];
  const cells = [];
  const weekStart = store.settings.weekStart;
  const labels = weekdayLabels(weekStart);
  // 以周为列：grid-auto-flow: column，先补齐首周空位
  const firstDay = days[0] ? new Date(`${days[0]}T00:00:00`) : new Date();
  const pad = (firstDay.getDay() - weekStart + 7) % 7;
  for (let i = 0; i < pad; i += 1) cells.push('<span class="hm-cell empty-cell"></span>');
  for (const key of days) {
    const bucket = stats.byDay.get(key);
    const value = ui.heatWeighted ? bucket.weight : bucket.count;
    const level = levels.pick(value);
    const date = new Date(`${key}T00:00:00`);
    cells.push(
      `<span class="hm-cell level-${level}" title="${date.getMonth() + 1}月${date.getDate()}日 ${labels[(date.getDay() - weekStart + 7) % 7]}：完成 ${bucket.count} 项${ui.heatWeighted ? `（权重 ${bucket.weight}）` : ''}"></span>`,
    );
  }
  return `<section class="heatmap">
    <div class="heatmap-head">
      <span class="heatmap-title">${icon('histogram')}工作量热力图</span>
      <span class="heatmap-stat">近 16 周完成 <b>${stats.total}</b> 项${stats.streak ? ` · 连续 <b>${stats.streak}</b> 天` : ''}</span>
      <button type="button" class="tb-btn subtle-text" data-action="toggle-heat-weight" title="在「按完成数」与「按优先级加权」之间切换">${ui.heatWeighted ? '按权重' : '按完成数'}</button>
    </div>
    <div class="heatmap-grid" role="img" aria-label="近 16 周每日完成量热力图">${cells.join('')}</div>
  </section>`;
}

function recentHtml(ui) {
  const groups = recentGroups(ui);
  const body = groups
    .map(
      (group) => `
      <section class="recent-group">
        ${groupHeader(group.label, group.tasks.length)}
        ${group.tasks.map((task) => taskRow(task, ui)).join('')}
      </section>`,
    )
    .join('');
  const done = sortDone(scopeTasks(ui).filter((task) => task.done));
  return `<div class="recent-body">${body}${completedSectionHtml(ui, done)}</div>${ui.heatmapOpen ? heatmapHtml(ui) : ''}`;
}

// ---------------------------------------------------------------- 分类清单

function categoryHtml(ui) {
  const lists = store.lists;
  const sections = lists
    .map((list) => {
      const tasks = store.sortTasks(store.state.tasks.filter((task) => task.listId === list.id && !task.done), ui.sort);
      return `<section class="cat-group">
        <div class="group-head cat-head">
          ${dot(list.color)}
          <span class="group-label">${esc(list.name)}</span>
          <span class="group-count">${tasks.length}</span>
        </div>
        ${tasks.map((task) => taskRow(task, ui)).join('') || `<p class="cat-empty">这个清单是空的</p>`}
      </section>`;
    })
    .join('');
  return sections;
}

// ---------------------------------------------------------------- 日历 + 任务

export function monthMatrix(monthDate, weekStart) {
  const first = startOfMonth(monthDate);
  const start = startOfWeek(first, weekStart);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function dueTasksByDay(ui) {
  const scope = scopeInfo(ui);
  const map = new Map();
  for (const task of store.state.tasks) {
    if (task.done || !task.dueAt) continue;
    if (!scope.isAll && task.listId !== scope.id) continue;
    const key = dayKey(task.dueAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(task);
  }
  return map;
}

function calendarHeader(ui, { cursorKey, title, nav }) {
  return `<div class="cal-head">
    <button type="button" class="tb-btn icon-only" data-action="cal-prev" title="上一页">${icon('chevronLeft')}</button>
    <button type="button" class="cal-title" data-action="cal-today" title="回到今天">${esc(title)}</button>
    <button type="button" class="tb-btn icon-only" data-action="cal-next" title="下一页">${icon('chevronRight')}</button>
    <span class="cal-spacer"></span>
    ${nav || ''}
  </div>`;
}

function calendarGridHtml(ui, matrix, byDay, { compact = false } = {}) {
  const now = new Date();
  const selected = ui.selectedDay;
  const labels = weekdayLabels(store.settings.weekStart);
  const heads = labels.map((label) => `<span class="cal-wd">${label}</span>`).join('');
  const cells = matrix
    .map((date) => {
      const key = dayKey(date);
      const tasks = byDay.get(key) || [];
      const isOther = date.getMonth() !== ui.calCursor.getMonth();
      const classes = ['cal-cell'];
      if (isOther) classes.push('other');
      if (isSameDay(date, now)) classes.push('today');
      if (selected === key) classes.push('selected');
      const dots = tasks
        .slice(0, 3)
        .map((task) => `<span class="cal-dot p${task.priority}"></span>`)
        .join('');
      const chips = !compact
        ? tasks
            .slice(0, 3)
            .map((task) => `<span class="cal-chip" title="${esc(task.title)}">${esc(task.title)}</span>`)
            .join('')
        : '';
      return `<button type="button" class="${classes.join(' ')}" data-action="cal-select" data-day="${key}" title="${date.getMonth() + 1}月${date.getDate()}日 · ${tasks.length} 项">
        <span class="cal-daynum">${date.getDate()}</span>
        <span class="cal-dots">${dots}</span>
        ${chips ? `<span class="cal-chips">${chips}</span>` : ''}
        ${tasks.length > 3 ? `<span class="cal-more">+${tasks.length - 3}</span>` : ''}
      </button>`;
    })
    .join('');
  return `<div class="cal-grid">${heads}${cells}</div>`;
}

function calendarViewHtml(ui) {
  const byDay = dueTasksByDay(ui);
  const matrix = monthMatrix(ui.calCursor, store.settings.weekStart);
  const title = `${ui.calCursor.getFullYear()}年${ui.calCursor.getMonth() + 1}月`;
  const selectedDate = new Date(`${ui.selectedDay}T00:00:00`);
  const dayTasks = store
    .state.tasks.filter((task) => task.dueAt && dayKey(task.dueAt) === ui.selectedDay)
    .filter((task) => {
      const scope = scopeInfo(ui);
      return scope.isAll || task.listId === scope.id;
    });
  const sorted = store.sortTasks(dayTasks, ui.sort);
  const undone = sorted.filter((task) => !task.done);
  const done = sorted.filter((task) => task.done);
  return `<div class="cal-view">
    <div class="cal-top">
      ${calendarHeader(ui, { title })}
      ${calendarGridHtml(ui, matrix, byDay)}
    </div>
    <section class="cal-day">
      <div class="group-head">
        <span class="group-label">${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 周${weekdayLabels(1)[(selectedDate.getDay() + 6) % 7]}</span>
        <span class="group-count">${undone.length}</span>
        <span class="cal-spacer"></span>
        <button type="button" class="tb-btn subtle-text" data-action="add-on-selected" title="在这一天添加任务">${icon('add')}添加</button>
      </div>
      ${[...undone.map((task) => taskRow(task, ui, { dense: true })), ...done.map((task) => taskRow(task, ui, { dense: true }))].join('') || emptyBlock('这天没有安排', '点「添加」在这天建一条任务')}
    </section>
  </div>`;
}

// ---------------------------------------------------------------- 周视图 / 月视图

function weekViewHtml(ui) {
  const weekStartDay = startOfWeek(ui.weekCursor, store.settings.weekStart);
  const labels = weekdayLabels(store.settings.weekStart);
  const today = new Date();
  const byDay = dueTasksByDay(ui);
  const cols = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStartDay, index);
    const key = dayKey(date);
    const tasks = store.sortTasks(byDay.get(key) || [], ui.sort);
    const classes = ['wk-col'];
    if (isSameDay(date, today)) classes.push('today');
    return `<div class="${classes.join(' ')}" data-day="${key}">
      <button type="button" class="wk-head" data-action="add-on-day" data-day="${key}" title="在 ${date.getMonth() + 1}月${date.getDate()}日 添加任务">
        <span class="wk-wd">${labels[index]}</span>
        <span class="wk-date">${date.getDate()}</span>
      </button>
      <div class="wk-tasks">
        ${tasks
          .map(
            (task) =>
              `<button type="button" class="wk-task p${task.priority}${task.done ? ' done' : ''}" data-action="edit-task" data-task-id="${esc(task.id)}" title="${esc(task.title)}${task.dueAt ? ` · ${esc(fmtTime(task.dueAt))}` : ''}">${esc(task.title)}</button>`,
          )
          .join('')}
      </div>
    </div>`;
  }).join('');
  const range = `${weekStartDay.getMonth() + 1}月${weekStartDay.getDate()}日 – ${addDays(weekStartDay, 6).getMonth() + 1}月${addDays(weekStartDay, 6).getDate()}日`;
  return `${calendarHeader(ui, { title: range })}
    <div class="wk-grid">${cols}</div>
    <p class="view-hint">点日期列标题可直接在那天建任务。</p>`;
}

function monthPlanHtml(ui) {
  const byDay = dueTasksByDay(ui);
  const matrix = monthMatrix(ui.calCursor, store.settings.weekStart);
  const title = `${ui.calCursor.getFullYear()}年${ui.calCursor.getMonth() + 1}月`;
  const labels = weekdayLabels(store.settings.weekStart);
  const now = new Date();
  const cells = matrix
    .map((date) => {
      const key = dayKey(date);
      const tasks = store.sortTasks(byDay.get(key) || [], ui.sort);
      const classes = ['mp-cell'];
      if (date.getMonth() !== ui.calCursor.getMonth()) classes.push('other');
      if (isSameDay(date, now)) classes.push('today');
      if (key === ui.selectedDay) classes.push('selected');
      return `<div class="${classes.join(' ')}" data-day="${key}">
        <button type="button" class="mp-day" data-action="add-on-day" data-day="${key}" title="在 ${date.getMonth() + 1}月${date.getDate()}日 添加任务">${date.getDate()}</button>
        <div class="mp-tasks">
          ${tasks
            .slice(0, 3)
            .map((task) => `<button type="button" class="mp-task p${task.priority}" data-action="edit-task" data-task-id="${esc(task.id)}" title="${esc(task.title)}">${esc(task.title)}</button>`)
            .join('')}
          ${tasks.length > 3 ? `<span class="mp-more">+${tasks.length - 3}</span>` : ''}
        </div>
      </div>`;
    })
    .join('');
  return `<div class="mp-view">
    ${calendarHeader(ui, { title })}
    <div class="mp-subnav">
      <div class="segmented mini" role="radiogroup" aria-label="周/月视图">
        <button type="button" role="radio" class="segment${ui.calMode === 'week' ? ' active' : ''}" data-action="set-cal-mode" data-mode="week" aria-checked="${ui.calMode === 'week'}">周</button>
        <button type="button" role="radio" class="segment${ui.calMode === 'month' ? ' active' : ''}" data-action="set-cal-mode" data-mode="month" aria-checked="${ui.calMode === 'month'}">月</button>
      </div>
    </div>
    <div class="mp-grid">${labels.map((label) => `<span class="cal-wd">${label}</span>`).join('')}${cells}</div>
    <p class="view-hint">点日期数字直接在那天建任务。</p>
  </div>`;
}

function weekmonthHtml(ui) {
  return ui.calMode === 'week' ? weekViewHtml(ui) : monthPlanHtml(ui);
}

// ---------------------------------------------------------------- 组合

export function viewBodyHtml(ui) {
  if (ui.query.trim()) return searchViewHtml(ui);
  switch (ui.view) {
    case 'daytodo':
      return daytodoHtml(ui);
    case 'category':
      return categoryHtml(ui);
    case 'calendar':
      return calendarViewHtml(ui);
    case 'weekmonth':
      return weekmonthHtml(ui);
    case 'recent':
    default:
      return recentHtml(ui);
  }
}

function tabsHtml(ui) {
  return `<div class="tabs" role="tablist" aria-label="视图">${TAB_VIEWS.map(
    (view) =>
      `<button type="button" role="tab" class="tab${ui.view === view.id ? ' active' : ''}" data-action="set-view" data-view="${view.id}" aria-selected="${ui.view === view.id}" title="${esc(view.title)}">${esc(view.label)}</button>`,
  ).join('')}</div>`;
}

/**
 * 3×3 工具条（DENSITY.md）：常驻只有 今日 / 最近 两个切换 + 搜索图标 + ⋯ 菜单。
 * 清单切换、日历/周月/清单视图、排序、热力图、设置全部收进 ⋯ 菜单。
 */
export function toolbarHtml(ui) {
  const specialView = ui.view !== 'daytodo' && ui.view !== 'recent';
  return `<header class="toolbar" id="toolbar">
    ${tabsHtml(ui)}
    <span class="tb-spacer"></span>
    <button type="button" class="tb-btn icon-only${ui.searchOpen ? ' active' : ''}" data-action="toggle-search" aria-label="搜索" title="搜索">${icon('search')}</button>
    <button type="button" class="tb-btn icon-only${specialView ? ' active' : ''}" data-action="open-more-menu" aria-label="更多" aria-haspopup="menu" title="${esc(specialView ? `${VIEWS.find((view) => view.id === ui.view)?.menuLabel || ''} · 更多` : '更多')}">${icon('more')}</button>
  </header>
  ${
    ui.searchOpen
      ? `<div class="search-row"><span class="search-icon">${icon('search')}</span><input class="input search-input" id="search-input" data-focus-key="search" type="search" value="${esc(ui.query)}" placeholder="搜索标题、备注、标签、子任务" autocomplete="off" /><button type="button" class="tb-btn icon-only" data-action="close-search" aria-label="关闭搜索">${icon('dismiss')}</button></div>`
      : ''
  }`;
}

export function composerHtml(ui) {
  if (!ui.showComposer) return '';
  const scope = scopeInfo(ui);
  let placeholder = '添加任务，回车提交';
  if (ui.composerDue) placeholder = `添加到 ${fmtDate(ui.composerDue)}…`;
  else if (!scope.isAll) placeholder = `添加到「${scope.name}」，回车提交`;
  else {
    const own = store.listById(ui.listId);
    if (own) placeholder = `添加到「${own.name}」，回车提交`;
  }
  return `<form class="composer" id="composer" autocomplete="off">
    ${icon('add', '1em', 'composer-plus')}
    <input class="input composer-input" id="composer-input" data-focus-key="composer" type="text" placeholder="${esc(placeholder)}" enterkeyhint="done" />
    ${ui.composerDue ? `<button type="button" class="chip composer-due" data-action="clear-composer-due" title="清除日期">${esc(fmtDate(ui.composerDue))}${icon('dismiss')}</button>` : ''}
    <button type="submit" class="btn primary small" title="添加">添加</button>
  </form>`;
}

// ---------------------------------------------------------------- 简化尺寸（1×1 / 2×2 / 3×2 / 4×2）

function currentList(ui) {
  return store.listById(ui.listId) || store.lists[0];
}

function simpleListTasks(ui) {
  const list = currentList(ui);
  return {
    list,
    undone: store.sortTasks(store.state.tasks.filter((task) => task.listId === list.id && !task.done), ui.sort),
    done: sortDone(store.state.tasks.filter((task) => task.listId === list.id && task.done)),
  };
}

export function summaryHtml(ui) {
  const list = currentList(ui);
  const undone = store.state.tasks.filter((task) => task.listId === list.id && !task.done);
  const first = store.sortTasks(undone, 'due')[0];
  return `<div class="summary">
    <div class="summary-main">
      <b class="summary-num">${undone.length}</b>
      <span class="summary-label">未完成</span>
    </div>
    <div class="summary-first" title="${esc(first?.title || '没有待办')}">
      ${first ? `<span class="check">${icon('circle')}</span><span class="summary-title">${esc(first.title)}</span>` : `<span class="summary-title empty-text">${esc('没有待办')}</span>`}
    </div>
  </div>`;
}

export function miniListHtml(ui) {
  const { undone } = simpleListTasks(ui);
  return `<div class="mini">
    <div class="mini-list">${undone.map((task) => taskRow(task, ui, { dense: true })).join('') || emptyBlock('没有待办', '长按任务可以编辑')}</div>
  </div>`;
}

export function mediumListHtml(ui) {
  const { list, undone } = simpleListTasks(ui);
  return `<div class="medium">
    <header class="medium-head">
      <span class="medium-name">${esc(list.name)}</span>
      <span class="medium-count">${undone.length}</span>
    </header>
    <div class="medium-list">${undone.map((task) => taskRow(task, ui, { dense: true })).join('') || emptyBlock('没有待办', '在下方输入框添加')}</div>
  </div>`;
}

export function wideListHtml(ui) {
  const { list, undone, done } = simpleListTasks(ui);
  return `<div class="wide">
    <header class="wide-head">
      <span class="medium-name">${esc(list.name)}</span>
      <span class="medium-count">${undone.length}</span>
      <span class="tb-spacer"></span>
      <button type="button" class="tb-btn icon-only" data-action="toggle-composer" title="添加任务" aria-label="添加任务">${icon('add')}</button>
    </header>
    <div class="wide-cols">
      <section class="wide-col">
        <div class="wide-col-head"><span>未完成</span><span class="wide-count">${undone.length}</span></div>
        <div class="wide-col-body">${undone.map((task) => taskRow(task, ui, { dense: true })).join('') || emptyBlock('全部做完了', '')}</div>
      </section>
      <section class="wide-col">
        <div class="wide-col-head done-head"><span>已完成</span><span class="wide-count">${done.length}</span></div>
        <div class="wide-col-body">${done.length ? done.map((task) => taskRow(task, ui, { dense: true })).join('') : `<p class="wide-empty">${esc('暂无已完成')}</p>`}</div>
      </section>
    </div>
  </div>`;
}
