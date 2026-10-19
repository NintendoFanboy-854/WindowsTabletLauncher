import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const BASE = path.join(process.env.TEMP, 'audit-typography');
const ROOT = 'C:\\Users\\HuanChen\\Documents\\PersonalProject\\WindowsTabletLauncher';
const require = createRequire(path.join(ROOT, 'package.json'));
const themePath = require.resolve('@fluentui/react-theme');
const themeMod = await import(pathToFileURL(themePath).href);
const dark = themeMod.webDarkTheme || themeMod.default?.webDarkTheme || themeMod.default;
const colorTokens = Object.entries(dark).filter(([k, v]) => typeof v === 'string' && v.startsWith('#'));
function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return `rgb(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)})`;
}
const colorMap = new Map();
const PRIORITY = [
  'colorNeutralForeground1', 'colorNeutralForeground2', 'colorNeutralForeground3', 'colorNeutralForeground4',
  'colorNeutralForegroundDisabled', 'colorBrandForeground1', 'colorBrandForeground2',
  'colorStatusDangerForeground1', 'colorStatusSuccessForeground1', 'colorStatusWarningForeground1',
];
const ordered = [
  ...PRIORITY.map((name) => [name, dark[name]]).filter(([, v]) => typeof v === 'string' && v.startsWith('#')),
  ...colorTokens,
];
for (const [name, hex] of ordered) {
  const rgb = hexToRgb(hex);
  if (!colorMap.has(rgb)) colorMap.set(rgb, name);
}
function colorRole(rgb) {
  return colorMap.get(rgb) || rgb;
}

const VIEWPORTS = ['1440x960', '1024x768', '960x1440'];
const data = {};
for (const vp of VIEWPORTS) {
  const file = path.join(BASE, 'raw', `harness-${vp}.json`);
  data[vp] = JSON.parse(fs.readFileSync(file, 'utf8'));
}

function textsOf(c) { return c.texts || []; }
function pick(texts, predicate, sort = null) {
  const list = texts.filter(predicate);
  if (!list.length) return null;
  const sorted = sort ? [...list].sort(sort) : list;
  return sorted[0];
}
function info(t) {
  if (!t) return null;
  return {
    text: t.text,
    px: t.fontSize,
    lh: t.lineHeight,
    ratio: typeof t.lineHeight === 'number' && t.fontSize ? +(t.lineHeight / t.fontSize).toFixed(2) : null,
    weight: t.fontWeight,
    color: colorRole(t.color),
    fvn: t.fvn,
    cls: (t.cls || '').split(' ').filter((x) => x.startsWith('___'))[0] || '',
  };
}

function semantic(pluginId, texts) {
  if (pluginId === 'clock') {
    const primary = pick(texts, (t) => /^\d{1,2}:\d{2}$/.test(t.text));
    const secondary = pick(texts, (t) => /月|星期/.test(t.text));
    const tertiary = pick(texts, (t) => /^\d{2}$/.test(t.text));
    return { primary, secondary, tertiary };
  }
  if (pluginId === 'countdown') {
    const primary = pick(texts, (t) => /^(就是今天|今天|还有 .+ 天|已过 .+ 天)$/.test(t.text));
    const header = pick(texts, (t) => t.text === '倒数日');
    const count = pick(texts, (t) => /^\d+ 项$/.test(t.text));
    const secondary = pick(texts, (t) => t !== primary && t !== header && t !== count && t.fontSize >= 12 && !/^\d+ 项$/.test(t.text) && !/^(还有|已过|就是今天|今天|天)$/.test(t.text));
    return { primary, secondary, tertiary: header || count };
  }
  if (pluginId === 'pomodoro') {
    const primary = pick(texts, (t) => /^\d{2}:\d{2}$/.test(t.text));
    const secondary = pick(texts, (t) => t.text === '未关联任务' || (t.fontSize === 14 && t.weight === '400' && t.text !== '专注'));
    const tertiary = pick(texts, (t) => t.cls.includes('fui-Badge'));
    return { primary, secondary, tertiary };
  }
  if (pluginId === 'sedentary') {
    const primary = pick(texts, (t) => /^\d+$/.test(t.text), (a, b) => b.fontSize - a.fontSize);
    const unit = pick(texts, (t) => t.text === '分钟');
    const hint = pick(texts, (t) => /^(距|刚)/.test(t.text));
    const stats = pick(texts, (t) => /^\d+ (分钟|次)$/.test(t.text));
    return { primary, secondary: hint || unit, tertiary: stats || unit };
  }
  if (pluginId === 'todo') {
    const numeric = pick(texts, (t) => /^\d+$/.test(t.text), (a, b) => b.fontSize - a.fontSize);
    const primary = numeric && numeric.fontSize >= 24 ? numeric : null;
    const meta = pick(texts, (t) => /^\d{2}:\d{2}$/.test(t.text));
    const group = pick(texts, (t) => /^(今天|明天|最近|今天 · .+)$/.test(t.text) && t.weight === '600');
    const tabs = pick(texts, (t) => t.cls.includes('fui-Tab__content'));
    const secondary = pick(texts, (t) => t !== primary && t !== meta && t !== group && t !== tabs && t.fontSize >= 14 && !t.cls.includes('fui-Button') && !t.text.includes('·'));
    return { primary, secondary, tertiary: meta || group };
  }
  if (pluginId === 'weather') {
    const temps = texts.filter((t) => /^-?\d+°$/.test(t.text));
    const primary = temps[0] || null;
    const city = pick(texts, (t) => t.text === '北京');
    const condition = pick(texts, (t) => t.text === '雷阵雨');
    const hilo = pick(texts, (t) => /° \/ /.test(t.text));
    const dailyLabel = pick(texts, (t) => /^(今天|明天|周[一二三四五六日])$/.test(t.text));
    const aqiLabel = pick(texts, (t) => t.text === 'AQI');
    const hourlyLabel = pick(texts, (t) => /^(现在|\d{2}:\d{2})$/.test(t.text));
    return { primary, secondary: condition || city, tertiary: dailyLabel || aqiLabel || hourlyLabel, city, condition, hilo, dailyLabel, hourlyLabel, aqiLabel };
  }
  return {};
}

function rootBox(caseData) {
  const inner = caseData.inner;
  const boxes = caseData.boxes || [];
  const nearRoot = boxes.filter((b) => b.rect.w >= inner.w - 8 && b.rect.h >= inner.h - 8 && b.pad.some((p) => p !== '0px'));
  const list = nearRoot.length ? nearRoot : boxes.filter((b) => b.pad.some((p) => p !== '0px'));
  if (!list.length) return null;
  list.sort((a, b) => b.rect.w * b.rect.h - a.rect.w * a.rect.h);
  return list[0];
}

const rows = [];
for (const vp of VIEWPORTS) {
  const doc = data[vp];
  for (const c of doc.data) {
    const [pluginId, sizeKey] = [c.id.split('-')[0], c.id.split('-').slice(1).join('-')];
    const sem = semantic(pluginId, c.texts);
    const rb = rootBox(c);
    const allSizes = [...new Set(c.texts.map((t) => t.fontSize))].sort((a, b) => a - b);
    rows.push({
      viewport: vp,
      pluginId,
      size: sizeKey,
      case: c.id,
      inner: c.inner,
      primary: info(sem.primary),
      secondary: info(sem.secondary),
      tertiary: info(sem.tertiary),
      city: info(sem.city),
      condition: info(sem.condition),
      hilo: info(sem.hilo),
      dailyLabel: info(sem.dailyLabel),
      hourlyLabel: info(sem.hourlyLabel),
      aqiLabel: info(sem.aqiLabel),
      rootPad: rb ? rb.pad.join(' ') : null,
      rootGap: rb ? rb.gap : null,
      fontSizes: allSizes,
      textCount: c.texts.length,
      sampleTexts: c.texts.map((t) => `${t.fontSize}:${t.text}`).slice(0, 30),
    });
  }
}

fs.writeFileSync(path.join(BASE, 'analysis-rows.json'), JSON.stringify(rows, null, 2));

function fmt(x) {
  if (!x) return '—';
  return `${x.px}/${x.lh} w${x.weight} ${x.color.replace('color', '')}`;
}
const out = [];
out.push('| 视口 | 插件 | 尺寸 | iframe | Primary | Secondary | Tertiary | 卡内 padding | gap |');
out.push('|---|---|---|---|---|---|---|---|---|');
for (const row of rows) {
  out.push(`| ${row.viewport} | ${row.pluginId} | ${row.size} | ${row.inner.w}×${row.inner.h} | ${fmt(row.primary)} | ${fmt(row.secondary)} | ${fmt(row.tertiary)} | ${row.rootPad} | ${row.rootGap} |`);
}
fs.writeFileSync(path.join(BASE, 'matrix.md'), out.join('\n'), 'utf8');
console.log(out.join('\n'));

function px(x) { return x ? x.px : '—'; }
const sizesOrder = ['1x1', '2x1', '2x2', '3x2', '3x3', '4x2'];
const pluginOrder = ['clock', 'countdown', 'pomodoro', 'sedentary', 'todo', 'weather'];
const extra = [];
extra.push('\n=== PRIMARY px BY SIZE × PLUGIN (1440x960) ===');
extra.push('| size | ' + pluginOrder.join(' | ') + ' | distinct |');
extra.push('|---|' + pluginOrder.map(() => '---').join('|') + '|---|');
for (const size of sizesOrder) {
  const vals = pluginOrder.map((p) => rows.find((r) => r.viewport === '1440x960' && r.pluginId === p && r.size === size)?.primary?.px ?? null);
  const distinct = [...new Set(vals.filter((v) => v != null))].sort((a, b) => a - b);
  extra.push(`| ${size} | ${vals.map((v) => v ?? '—').join(' | ')} | ${distinct.join(',')} (${distinct.length}) |`);
}
extra.push('\n=== SECONDARY px BY SIZE × PLUGIN (1440x960) ===');
extra.push('| size | ' + pluginOrder.join(' | ') + ' | distinct |');
extra.push('|---|' + pluginOrder.map(() => '---').join('|') + '|---|');
for (const size of sizesOrder) {
  const vals = pluginOrder.map((p) => rows.find((r) => r.viewport === '1440x960' && r.pluginId === p && r.size === size)?.secondary?.px ?? null);
  const distinct = [...new Set(vals.filter((v) => v != null))].sort((a, b) => a - b);
  extra.push(`| ${size} | ${vals.map((v) => v ?? '—').join(' | ')} | ${distinct.join(',')} (${distinct.length}) |`);
}
extra.push('\n=== PRIMARY ACROSS VIEWPORTS (px) ===');
for (const p of pluginOrder) {
  const lines = sizesOrder.map((size) => {
    const vals = ['1440x960', '1024x768', '960x1440'].map((vp) => rows.find((r) => r.viewport === vp && r.pluginId === p && r.size === size)?.primary?.px ?? '—');
    return `${size}: ${vals.join(' / ')}`;
  });
  extra.push(`${p}: ${lines.join('   ')}`);
}
extra.push('\n=== FONT SIZE HISTOGRAM (1440x960) ===');
for (const p of pluginOrder) {
  const counts = new Map();
  for (const r of rows.filter((r) => r.viewport === '1440x960' && r.pluginId === p)) {
    for (const fs of r.fontSizes) counts.set(fs, (counts.get(fs) || 0) + 1);
  }
  extra.push(`${p}: ` + [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([s, n]) => `${s}px×${n}`).join(', '));
}
extra.push('\n=== ROOT PADDING / GAP BY CASE (1440x960) ===');
for (const r of rows.filter((r) => r.viewport === '1440x960')) {
  extra.push(`${r.case}: pad=${r.rootPad} gap=${r.rootGap}`);
}
extra.push('\n=== LINE-HEIGHT RATIOS < 1.3 (1440x960) ===');
for (const r of rows.filter((r) => r.viewport === '1440x960')) {
  for (const field of ['primary', 'secondary', 'tertiary']) {
    const v = r[field];
    if (v && v.ratio != null && v.px >= 14 && v.ratio < 1.3) extra.push(`${r.case} ${field}: ${v.text} ${v.px}/${v.lh} ratio=${v.ratio}`);
  }
}
fs.writeFileSync(path.join(BASE, 'matrix-extra.md'), extra.join('\n'), 'utf8');
console.log(extra.join('\n'));

console.log('\n=== FONT SIZE SETS ===');
for (const row of rows.filter((r) => r.viewport === '1440x960')) {
  console.log(row.case, 'inner', row.inner.w + 'x' + row.inner.h, 'sizes', row.fontSizes.join(','), 'pad', row.rootPad, 'gap', row.rootGap);
}
