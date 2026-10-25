/**
 * 小部件 UI 回归断言（DENSITY §2.1 / UI-REWRITE-SPEC §6）。
 *
 * 用法（仓库根目录，dev server 需在 http://localhost:5173 运行）：
 *   node scripts/verify-widgets.mjs                 # 全部插件 × 全部尺寸（1440×960）
 *   node scripts/verify-widgets.mjs --plugin clock  # 只测一个插件
 *   node scripts/verify-widgets.mjs --scheme light  # 亮色主题抽查（默认 dark）
 *   node scripts/verify-widgets.mjs --screenshots   # 同时把每例截图写到 shots/milestones/e7/cards/
 *
 * 实现：复用 `scripts/lib/cdp.mjs`（串行单 Edge、唯一 `%TEMP%\wtsl-verify-*` profile、
 * 结束按本次 profile 清理，不用 `taskkill /F /IM msedge.exe`）。
 * 每个插件按真实 iframe 尺寸单独打开（standalone + `&demo=1`，天气用 `?mock=1`）。
 *
 * v0.3.0 追加门禁（DENSITY §2.1 第 9–11 条 / AGENT-SURFACE-CONTRACT §11-8，只作用于 weather 3×2）：
 * - 横向连续空白 ≤40px：同一视觉行相邻内容单元的间距（排除 space-between 分栏留白与 grid gap）；
 * - 上带分栏间距 ≤40px：同一条带内横向并排的直接子分栏之间不得用 space-between 留出大空洞；
 * - 今日指标须占满上带剩余宽度（右缘距卡边 ≤20px）；1440 下 3 项、1024 下 2 项；
 * - 整卡内容带 ≥70%；分栏空带 ≤22%（`data-content-band` 直接子分栏的 lead/trail/internal 最大垂直空白）；
 * - Secondary 区块数：3×2 = 2×2 + 1（今日指标整组计 1 个，`data-secondary-block` 计数）；
 * - 1024 断点复测（3×2 iframe 474×308）：上述横向/裁切/指标项数断言同样执行。
 */
import { join } from 'node:path';

import { launch, sleep } from './lib/cdp.mjs';

const BASE_URL = process.env.WTSL_BASE_URL || 'http://localhost:5173';

/** 1440×960 网格：cell=164、gap=12、页边距=20；iframe = 卡片 − 2×6 宿主内衬 */
function iframeSize([cols, rows], { cell = 164, gap = 12, inner = 6 } = {}) {
  return {
    width: cols * cell + (cols - 1) * gap - inner * 2,
    height: rows * cell + (rows - 1) * gap - inner * 2,
  };
}

/**
 * 与 `src/host/layout/breakpoints.ts` 同规则的网格几何（用于 1024 断点复测）。
 * 1024×768 → 6 列、cell 154；3×2 卡片 486×320、iframe 474×308（触发天气 3×2 的窄卡降级）。
 */
function gridMetrics(viewportWidth, viewportHeight) {
  const columns =
    viewportWidth >= 1280 ? 8 : viewportWidth >= 900 ? 6 : viewportWidth >= 480 ? 4 : viewportWidth >= 360 ? 3 : 2;
  const gap = 12;
  const padding = 20;
  const availableWidth = Math.max(0, viewportWidth - padding * 2);
  const availableHeight = Math.max(0, viewportHeight - padding * 2);
  let cell = Math.floor((availableWidth - (columns - 1) * gap) / columns);
  cell = Math.min(220, Math.max(96, cell));
  let rows = Math.max(4, Math.floor((availableHeight + gap) / (cell + gap)));
  if (rows === 4) {
    const cellToFitFourRows = Math.floor((availableHeight - 3 * gap) / 4);
    if (cellToFitFourRows > 0 && cellToFitFourRows < cell) cell = Math.max(96, cellToFitFourRows);
  }
  rows = Math.max(4, Math.floor((availableHeight + gap) / (cell + gap)));
  return { columns, rows, cell, gap };
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

/**
 * 纯列表卡（E7 追加）：docs/components/todo.md 明确「2×2 头部『今日 · N』12 fg3 + 4 行」，
 * 头部不是计数主层，因此 DENSITY §2.1 的「列表头主层 ≥28px + 主次比 ≥1.5」不适用
 * （文档冲突已记入 shots/milestones/e7/REPORT.md，建议 Lead 统一口径）。
 * 这里改用更贴合物料的断言：行数在 D-04 预算内、行高 ≥44、行标题 16px、头部文案存在。
 */
const ROW_CARDS = {
  todo: { rowBudget: { '2x2': 4, '3x2': 5, '3x3': 8, '4x2': 5 }, rowTitleMin: 16, headerPrefix: '今日' },
};

/**
 * 已知且已接受为 P2 的偏差账本（必须写理由与出处）：
 * 断言仍然执行；只有在此账本登记、且未超出放宽后的护栏时才 PASS*（不隐藏偏差）。
 * - weather 2×2：E5-P2-01（`shots/milestones/e5/REPORT.md` §4.1）实测约 29% 空带，是当前内容预算的
 *   结果，Lead 未要求改产品；E7 只把上限放宽到 30% / 内容带 ≥40% 作为回归护栏。
 */
const ACCEPTED_P2 = {
  'weather:2x2': {
    maxGapPct: 30,
    bandPct: 40,
    reason: 'E5-P2-01：weather 2×2 空带 29% 为已接受 P2（不改内容/预算）',
  },
};


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
    graphics.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right, kind: el.tagName.toLowerCase() });
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

  // ---------- v0.3.0 横向空洞 / 分栏空带 / 溢出裁切测量 ----------
  // 横向空洞：同一视觉行内、相邻内容单元（flex row 子项 / grid 行内列单元）之间的连续水平空白。
  // 显式 space-between / space-around / space-evenly 的两端分栏留白不计（由 DENSITY 组间距规则管），
  // 无内容的布局占位（旧 3×2 逐时行的 flex spacer）不算内容单元，因此其空白会被测出来。
  const contentBoxes = [
    ...texts.map((t) => ({ top: t.top, bottom: t.bottom, left: t.left, right: t.right })),
    ...graphics.map((g) => ({ top: g.top, bottom: g.bottom, left: g.left, right: g.right })),
  ];
  const hasContent = (el) => {
    if (el.matches?.('img, svg')) return true;
    if ((el.textContent || '').trim().length > 0) return true;
    return Boolean(el.querySelector?.('img, svg'));
  };
  const distributedJustify = new Set(['space-between', 'space-around', 'space-evenly']);
  const horizontalGaps = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('script,style')) continue;
    if (!isVisible(el)) continue;
    const cs = getComputedStyle(el);
    const rowFlex = cs.display === 'flex' && (cs.flexDirection === 'row' || cs.flexDirection === 'row-reverse');
    const grid = cs.display === 'grid' || cs.display === 'inline-grid';
    if (!rowFlex && !grid) continue;
    if (distributedJustify.has(cs.justifyContent)) continue;
    const kids = [...el.children].filter((child) => isVisible(child) && hasContent(child));
    if (kids.length < 2) continue;
    // 按垂直重叠把子项分到视觉行（flex row 通常只有一行；grid 可能多行）
    const rows = [];
    for (const kid of kids) {
      const rect = kid.getBoundingClientRect();
      const box = { rect, text: (kid.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 12) };
      const row = rows.find((candidate) => {
        const overlap = Math.min(candidate.bottom, rect.bottom) - Math.max(candidate.top, rect.top);
        const minHeight = Math.min(candidate.bottom - candidate.top, rect.height);
        return overlap > minHeight * 0.5;
      });
      if (row) {
        row.items.push(box);
        row.top = Math.min(row.top, rect.top);
        row.bottom = Math.max(row.bottom, rect.bottom);
      } else {
        rows.push({ top: rect.top, bottom: rect.bottom, items: [box] });
      }
    }
    for (const row of rows) {
      const sorted = row.items.sort((a, b) => a.rect.left - b.rect.left);
      for (let i = 1; i < sorted.length; i += 1) {
        const gap = sorted[i].rect.left - sorted[i - 1].rect.right;
        if (gap > 0.5) {
          horizontalGaps.push({
            gap: Math.round(gap * 10) / 10,
            where: (sorted[i - 1].text || 'icon') + ' → ' + (sorted[i].text || 'icon'),
            container: (el.getAttribute('class') || el.tagName).slice(0, 48),
          });
        }
      }
    }
  }
  horizontalGaps.sort((a, b) => b.gap - a.gap);
  const horizontalMaxGap = horizontalGaps.length ? horizontalGaps[0].gap : 0;

  // 分栏空带：每个 data-content-band 内每个直接子分栏，相对 band 的 lead/trail/internal 最大垂直空白
  const bandGaps = [];
  for (const band of document.querySelectorAll('[data-content-band]')) {
    if (!isVisible(band)) continue;
    const bandRect = band.getBoundingClientRect();
    for (const [index, child] of [...band.children].entries()) {
      if (!isVisible(child)) continue;
      const childRect = child.getBoundingClientRect();
      const inside = contentBoxes
        .filter(
          (box) =>
            box.top >= childRect.top - 1 &&
            box.bottom <= childRect.bottom + 1 &&
            box.left >= childRect.left - 1 &&
            box.right <= childRect.right + 1,
        )
        .map((box) => [Math.max(0, box.top), Math.min(H, box.bottom)])
        .filter(([a, b]) => b > a)
        .sort((a, b) => a[0] - b[0]);
      if (inside.length === 0) continue;
      const merged = [];
      for (const [a, b] of inside) {
        const last = merged[merged.length - 1];
        if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b);
        else merged.push([a, b]);
      }
      const leading = Math.max(0, merged[0][0] - bandRect.top);
      const trailing = Math.max(0, bandRect.bottom - merged[merged.length - 1][1]);
      let internal = 0;
      for (let i = 1; i < merged.length; i += 1) internal = Math.max(internal, merged[i][0] - merged[i - 1][1]);
      const maxGap = Math.max(leading, trailing, internal);
      bandGaps.push({
        band: band.getAttribute('data-content-band'),
        child: index,
        maxGap: Math.round(maxGap * 10) / 10,
        maxGapPct: Math.round((maxGap / H) * 1000) / 10,
      });
    }
  }
  const columnMaxGapPct = bandGaps.length ? Math.max(...bandGaps.map((entry) => entry.maxGapPct)) : 0;

  // 分栏间距（band 口径）：同一条带内横向并排的直接子分栏之间 ≤40px。
  // 防止用 space-between 把两组推到两端、中间留出大块空洞（旧 3×2 上带的问题）。
  let bandHorizontalMaxGap = 0;
  const bandHorizontalGaps = [];
  for (const band of document.querySelectorAll('[data-content-band]')) {
    if (!isVisible(band)) continue;
    const kids = [...band.children].filter(isVisible);
    if (kids.length < 2) continue;
    const boxes = kids
      .map((kid) => ({ rect: kid.getBoundingClientRect(), text: (kid.textContent || '').trim().slice(0, 12) }))
      .sort((a, b) => a.rect.left - b.rect.left);
    for (let i = 1; i < boxes.length; i += 1) {
      const prev = boxes[i - 1].rect;
      const cur = boxes[i].rect;
      const overlap = Math.min(prev.bottom, cur.bottom) - Math.max(prev.top, cur.top);
      if (overlap <= 0) continue;
      const gap = cur.left - prev.right;
      if (gap > 0.5) {
        bandHorizontalGaps.push({
          band: band.getAttribute('data-content-band'),
          gap: Math.round(gap * 10) / 10,
        });
        bandHorizontalMaxGap = Math.max(bandHorizontalMaxGap, gap);
      }
    }
  }
  bandHorizontalMaxGap = Math.round(bandHorizontalMaxGap * 10) / 10;

  // Secondary 区块结构（weather 3×2 应为 2×2 + 1）
  const secondaryBlockCount = [...document.querySelectorAll('[data-secondary-block]')].filter(isVisible).length;

  // 溢出/省略号：内容盒越界 + 文本元素 scrollWidth 超 clientWidth（textOverflow 裁切）
  const clippedCount =
    texts.filter((t) => t.top < -1 || t.left < -1 || t.bottom > H + 1 || t.right > W + 1).length +
    graphics.filter((g) => g.top < -1 || g.left < -1 || g.bottom > H + 1 || g.right > W + 1).length;
  let truncatedCount = 0;
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('script,style')) continue;
    if (!isVisible(el)) continue;
    const cs = getComputedStyle(el);
    const clipsText =
      cs.textOverflow === 'ellipsis' ||
      cs.overflow === 'hidden' ||
      cs.overflowX === 'hidden';
    if (!clipsText) continue;
    const ownText = [...el.childNodes].some((node) => node.nodeType === 3 && (node.textContent || '').trim());
    if (!ownText) continue;
    // inline 元素的 clientWidth 恒为 0，无法可靠测省略；只对块级/内联块做 scrollWidth 断言
    if (el.clientWidth < 1) continue;
    if (el.scrollWidth > el.clientWidth + 1) truncatedCount += 1;
  }

  // 今日指标块（3 行定义列表；整块须占满 top32 剩余宽度、右缘贴卡片内容右缘；1024 降为 2 项）
  const metricsBlock = [...document.querySelectorAll('[data-content-block="metrics"]')].find(isVisible) || null;
  let metricItemCount = 0;
  let metricsRightInset = 999;
  let metricsWidthPct = 0;
  if (metricsBlock) {
    const rect = metricsBlock.getBoundingClientRect();
    metricItemCount = [...metricsBlock.children].filter(isVisible).length;
    metricsRightInset = Math.round((W - rect.right) * 10) / 10;
    metricsWidthPct = Math.round((rect.width / W) * 1000) / 10;
  }
  // 列表卡结构（todo）：共享底座 ListRow 带 data-list-row，卡片头部是 CardHeader
  const listRows = [...document.querySelectorAll('[data-list-row]')].filter(isVisible);
  const rowHeights = listRows.map((row) => row.getBoundingClientRect().height);
  const cardRoot = document.querySelector('[data-card-root]');
  const headerNode = cardRoot?.firstElementChild || null;
  const headerText = headerNode ? (headerNode.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) : '';
  const rowTitleTexts = listRows
    .map((row) => {
      // ListRow 结构：leading / main（title + subtitle）/ trailing；标题在 main 的第一个文本节点
      const main = row.children[1];
      const title = main?.querySelector('.fui-Text, span');
      return title ? Number.parseFloat(getComputedStyle(title).fontSize) || 0 : 0;
    })
    .filter((size) => size > 0);
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
    listRowCount: listRows.length,
    minListRowHeight: rowHeights.length ? Math.round(Math.min(...rowHeights)) : 0,
    maxListRowHeight: rowHeights.length ? Math.round(Math.max(...rowHeights)) : 0,
    headerText,
    rowTitleMin: rowTitleTexts.length ? Math.round(Math.min(...rowTitleTexts)) : 0,
    // v0.3.0 密度门禁测量
    horizontalMaxGap,
    horizontalGaps: horizontalGaps.slice(0, 6),
    bandHorizontalMaxGap,
    bandHorizontalGaps,
    columnMaxGapPct,
    bandGaps,
    secondaryBlockCount,
    clippedCount,
    truncatedCount,
    metricItemCount,
    metricsRightInset,
    metricsWidthPct,
    consoleErrorHint: null,
  };
})()`;

async function verifyCase(cdp, plugin, size, options) {
  const { width, height } = iframeSize(size.bytes, options.grid);
  await cdp.setViewport(width, height);
  const params = new URLSearchParams({ plugin: plugin.id, widget: plugin.widgetId, size: size.key });
  if (plugin.id === 'weather') {
    // E1 起 weather 的演示数据只认 URL `?mock=1`（settings 里的 mock 字段已迁出 schema），
    // 只写 localStorage 会落到“缺 API Key”的配置引导，量到 12–16px 的假阴性。
    params.set('mock', '1');
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
  await cdp.navigate(url);
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
    // E7：卡片证据归档到 shots/milestones/e7/cards（E5 时期的旧路径已废弃）
    await cdp.screenshot(
      join('shots', 'milestones', 'e7', 'cards', `${plugin.id}-${size.key}-${options.scheme}.png`),
    );
  }

  // v0.3.0：weather 3×2 追加 1024 断点复测（同规则网格下 iframe = 474×308，
  // 触发今日指标单列 2 项降级）；断言不裁切/无横向空洞。
  let narrowMeasure = null;
  if (plugin.id === 'weather' && size.key === '3x2') {
    const narrow = iframeSize(size.bytes, { ...gridMetrics(1024, 768), inner: 6 });
    await cdp.setViewport(narrow.width, narrow.height);
    await sleep(900);
    narrowMeasure = await cdp.evaluate(MEASURE_SCRIPT);
  }

  return { plugin, size, width, height, measure, narrowMeasure };
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
  const notes = [];
  const rowCard = ROW_CARDS[plugin.id];
  const isRowLayout = Boolean(rowCard) && size.key !== '1x1';
  const isWeather32 = plugin.id === 'weather' && size.key === '3x2';

  if (isRowLayout) {
    // 纯列表卡：按组件文档验行预算/行高/行标题字号，不套「计数主层」字号阈值
    const budget = rowCard.rowBudget[size.key];
    if (measure.listRowCount < 1) fails.push('列表卡没有渲染出列表行');
    if (budget && measure.listRowCount > budget) {
      fails.push(`列表行 ${measure.listRowCount} > 预算 ${budget}`);
    }
    if (measure.listRowCount > 0 && measure.minListRowHeight < 44) {
      fails.push(`列表行高 ${measure.minListRowHeight}px < 44px`);
    }
    if (measure.rowTitleMin > 0 && measure.rowTitleMin < rowCard.rowTitleMin) {
      fails.push(`行标题字号 ${measure.rowTitleMin}px < ${rowCard.rowTitleMin}px`);
    }
    if (!measure.headerText.startsWith(rowCard.headerPrefix)) {
      fails.push(`卡片头部不是「${rowCard.headerPrefix} · N」：${measure.headerText || '（空）'}`);
    }
  } else {
    if (measure.maxFont < t.minPrimary) fails.push(`主字号 ${measure.maxFont}px < ${t.minPrimary}px`);
    const primaryPct = measure.height ? (measure.maxFont / measure.height) * 100 : 0;
    if (t.primaryRatio > 0 && primaryPct < t.primaryRatio * 100) {
      fails.push(`主信息占卡高 ${primaryPct.toFixed(1)}% < ${(t.primaryRatio * 100).toFixed(1)}%`);
    }
    if (measure.secondTier && measure.maxFont / measure.secondTier < t.minRatio) {
      fails.push(`主/次字号比 ${(measure.maxFont / measure.secondTier).toFixed(2)} < ${t.minRatio}`);
    }
  }

  if (measure.minFont > 0 && measure.minFont < 12) fails.push(`最小字号 ${measure.minFont}px < 12px`);
  if (measure.below12 > 0) fails.push(`<12px 文本 ${measure.below12} 处`);

  // 空白带/内容带只对“多块卡片”生效（weather 2×2/3×2/4×2）；用内容块（块内间隙≤40px）而不是逐行区间
  const multiBlock = plugin.id === 'weather' && ['2x2', '3x2', '4x2'].includes(size.key);
  const blocks = blockStats(measure.intervals, measure.height);
  const accepted = ACCEPTED_P2[`${plugin.id}:${size.key}`] || null;
  if (multiBlock) {
    const gapLimit = accepted ? accepted.maxGapPct : 22;
    // v0.3.0：weather 3×2 三带式要求整卡内容带 ≥70%（高于通用 60%）
    const bandLimit = accepted ? accepted.bandPct : isWeather32 ? 70 : 60;
    if (blocks.maxGapPct > gapLimit) {
      fails.push(
        `最大空带 ${blocks.maxGapPct}% > ${gapLimit}%${accepted ? `（已接受 P2 上限，${accepted.reason}）` : ''}`,
      );
    }
    if (blocks.bandPct < bandLimit) {
      fails.push(
        `内容带 ${blocks.bandPct}% < ${bandLimit}%${accepted ? `（已接受 P2 下限，${accepted.reason}）` : ''}`,
      );
    }
    if (accepted && fails.length === 0) notes.push(`已接受 P2：${accepted.reason}`);
  }
  measure.blockBandPct = blocks.bandPct;
  measure.blockMaxGapPct = blocks.maxGapPct;

  // v0.3.0 weather 3×2 三带式专项门禁（AGENT-SURFACE-CONTRACT §11-8 / DENSITY §2.1 第 9–11 条）：
  // 无横向空洞、分栏空带、内容不裁切、今日指标降级、Secondary 区块 3×2 = 2×2 + 1、1024 断点复测。
  if (isWeather32) {
    if (measure.horizontalMaxGap > 40) {
      fails.push(`横向连续空白 ${measure.horizontalMaxGap}px > 40px`);
    }
    if (measure.bandHorizontalMaxGap > 40) {
      fails.push(`上带分栏间距 ${measure.bandHorizontalMaxGap}px > 40px（禁止两组推到两端）`);
    }
    if (measure.columnMaxGapPct > 22) {
      fails.push(`分栏空带 ${measure.columnMaxGapPct}% > 22%`);
    }
    if (measure.clippedCount > 0) fails.push(`内容超出卡片 ${measure.clippedCount} 处`);
    if (measure.truncatedCount > 0) fails.push(`文本被裁切/省略 ${measure.truncatedCount} 处`);
    if (measure.metricItemCount !== 3) fails.push(`今日指标应为 3 项，实测 ${measure.metricItemCount} 项`);
    if (measure.metricsRightInset > 20) {
      fails.push(`今日指标未占满剩余宽度：右缘距卡边 ${measure.metricsRightInset}px > 20px`);
    }
    const base22 = allResults.find((r) => r.plugin.id === 'weather' && r.size.key === '2x2');
    if (!base22) {
      fails.push('缺少 weather 2×2 基线，无法断言 Secondary 区块 +1');
    } else if (measure.secondaryBlockCount !== base22.measure.secondaryBlockCount + 1) {
      fails.push(
        `Secondary 区块 ${measure.secondaryBlockCount} ≠ 2×2 ${base22.measure.secondaryBlockCount} + 1`,
      );
    }
    const narrow = result.narrowMeasure;
    if (!narrow) {
      fails.push('3×2 缺少 1024 断点复测');
    } else {
      if (narrow.horizontalMaxGap > 40) {
        fails.push(`1024 横向连续空白 ${narrow.horizontalMaxGap}px > 40px`);
      }
      if (narrow.bandHorizontalMaxGap > 40) {
        fails.push(`1024 上带分栏间距 ${narrow.bandHorizontalMaxGap}px > 40px`);
      }
      if (narrow.columnMaxGapPct > 22) {
        fails.push(`1024 分栏空带 ${narrow.columnMaxGapPct}% > 22%`);
      }
      if (narrow.clippedCount > 0) fails.push(`1024 内容超出卡片 ${narrow.clippedCount} 处`);
      if (narrow.truncatedCount > 0) fails.push(`1024 文本被裁切/省略 ${narrow.truncatedCount} 处`);
      if (narrow.metricItemCount !== 2) {
        fails.push(`1024 今日指标应为 2 项（体感/风），实测 ${narrow.metricItemCount} 项`);
      }
      if (narrow.metricsRightInset > 20) {
        fails.push(`1024 今日指标未占满剩余宽度：右缘距卡边 ${narrow.metricsRightInset}px > 20px`);
      }
      if (narrow.secondaryBlockCount !== measure.secondaryBlockCount) {
        fails.push(
          `1024 Secondary 区块 ${narrow.secondaryBlockCount} ≠ 1440 的 ${measure.secondaryBlockCount}`,
        );
      }
    }
  }

  // 同插件 3×2 的信息项必须多于 1×1（“尺寸变大 → 信息量变多”）；
  // 不用纵向覆盖率跨尺寸比较：1×1 单值卡天然占比更高，会误杀已经铺满的 3×2。
  if (size.key === '3x2') {
    const base = allResults.find((r) => r.plugin.id === plugin.id && r.size.key === '1x1');
    if (base && measure.infoItemCount <= base.measure.infoItemCount) {
      fails.push(`3×2 信息项 ${measure.infoItemCount} ≤ 1×1 ${base.measure.infoItemCount}`);
    }
  }
  return { fails, notes, accepted };
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.includes('--plugin') ? args[args.indexOf('--plugin') + 1] : null;
  const scheme = args.includes('--scheme') ? args[args.indexOf('--scheme') + 1] : 'dark';
  const screenshots = args.includes('--screenshots');

  const plugins = PLUGINS.filter((p) => !only || p.id === only);
  if (plugins.length === 0) throw new Error(`未知插件：${only}`);

  const grid = { cell: 164, gap: 12, inner: 6 };
  const cdp = await launch({ width: 1440, height: 960, scheme });
  const results = [];
  let hardFailures = 0;

  try {
    // 先打开同源页面，写入各插件种子（standalone 页面会读 localStorage）
    await cdp.navigate(BASE_URL);
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
        if (plugin.id === 'weather' && size.key === '3x2') {
          const narrow = result.narrowMeasure;
          console.log(
            `        横向空洞 ${measure.horizontalMaxGap}px  上带分栏 ${measure.bandHorizontalMaxGap}px  ` +
              `分栏空带 ${measure.columnMaxGapPct}%  Secondary ${measure.secondaryBlockCount}  ` +
              `今日指标 ${measure.metricItemCount} 项 / 宽 ${measure.metricsWidthPct}% / 右缘 ${measure.metricsRightInset}px  ` +
              `裁切 越界 ${measure.clippedCount} / 省略 ${measure.truncatedCount}`,
          );
          if (narrow) {
            console.log(
              `        1024  横向 ${narrow.horizontalMaxGap}px  上带分栏 ${narrow.bandHorizontalMaxGap}px  ` +
                `今日指标 ${narrow.metricItemCount} 项 / 宽 ${narrow.metricsWidthPct}% / 右缘 ${narrow.metricsRightInset}px  ` +
                `裁切 越界 ${narrow.clippedCount} / 省略 ${narrow.truncatedCount}`,
            );
          }
        }
      }
      const staticProblems = await staticScan(plugin.id);
      const pluginResults = results.filter((r) => r.plugin.id === plugin.id);
      for (const r of pluginResults) {
        const judgement = judge(r, pluginResults);
        r.fails = judgement.fails;
        r.notes = judgement.notes;
        if (r.fails.length > 0) hardFailures += 1;
      }
      const pluginFails = [...new Set(pluginResults.flatMap((r) => r.fails).concat(staticProblems))];
      const pluginNotes = [...new Set(pluginResults.flatMap((r) => r.notes || []))];
      if (pluginFails.length === 0) {
        console.log(pluginNotes.length > 0 ? `  PASS*（${pluginNotes.join('；')}）` : '  PASS');
      } else {
        for (const fail of pluginFails) console.log(`  FAIL ${fail}`);
      }
    }

    console.log('\n=== 汇总 ===');
    for (const r of results) {
      const ok = r.fails.length === 0;
      const note = r.notes && r.notes.length > 0 ? '  ← 已接受 P2' : '';
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.plugin.id} ${r.size.key}${note}`);
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
