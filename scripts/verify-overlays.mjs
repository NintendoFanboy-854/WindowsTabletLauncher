/**
 * 插件详情浮层回归断言（E7 重写；E1 起插件只有 `?view=detail`）。
 *
 * 历史：E1 之前的 12 个 `?view=settings|edit|all` 用例已随插件设置宿主化而失效
 * （设置只由 manifest.settings 在宿主设置页渲染，countdown 编辑改为详情内 L2）。
 * 本轮按当前规格重写为「六插件 × detail」矩阵，不再保留失效视图。
 *
 * 用法（仓库根目录，dev server 需在 http://localhost:5173 运行）：
 *   node scripts/verify-overlays.mjs                     # 六插件 detail（默认暗色）
 *   node scripts/verify-overlays.mjs --scheme light      # 亮色同一套断言
 *   node scripts/verify-overlays.mjs --plugin weather    # 只测一个插件
 *   node scripts/verify-overlays.mjs --screenshots       # 截图到 shots/milestones/e7/overlays/
 *   node scripts/verify-overlays.mjs --json shots/milestones/e7/logs/overlays.json
 *
 * 视口：宿主浮层 iframe 实测 834×582（1440×960 下 Dialog 880×680 − 标题/边距）。
 * 断言（不随主题放宽）：
 *   - 详情骨架渲染（`[data-detail-page]` 存在且有文字）；
 *   - 视口 834×582；
 *   - 根内边距 24（详情 header/toolbar/tabs 的 computed padding-inline，Fluent spacingHorizontalXXL）；
 *   - 页面级无横向溢出（documentElement / body），详情根不越出视口；
 *   - 可交互控件根（Fluent `.fui-*` 根，不是内部 input）宽高均 ≥40；
 *   - 可见文字最小字号 ≥12px；
 *   - console error = 0。
 *
 * 实现：复用 `scripts/lib/cdp.mjs`（串行单 Edge、唯一 `%TEMP%\wtsl-verify-*` profile、
 * 结束按本次 profile 清理，不用 `taskkill /F /IM msedge.exe`）。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { launch, sleep } from './lib/cdp.mjs';

const BASE_URL = process.env.WTSL_BASE_URL || 'http://localhost:5173';
const VIEW_WIDTH = 834;
const VIEW_HEIGHT = 582;
/** 详情骨架左右内边距：tokens.spacingHorizontalXXL = 24（_shared/ui.jsx 的 header/toolbar/tabs） */
const ROOT_PADDING = 24;
const MIN_FONT = 12;
const MIN_CONTROL = 40;

/**
 * 六插件 detail 用例。demo 参数按插件现状：
 * - clock：默认数据（无事件，世界时钟空态 + 日期信息）；
 * - countdown / pomodoro / sedentary / todo：`&demo=1` 注入演示数据（各自 main.jsx 的 seedDemoData）；
 * - weather：`?mock=1` 走内置演示数据（无 API Key 也能出全部分区）。
 */
const CASES = [
  { plugin: 'clock', widget: 'clock', demo: null },
  { plugin: 'countdown', widget: 'countdown', demo: 'demo' },
  { plugin: 'pomodoro', widget: 'pomodoro', demo: 'demo' },
  { plugin: 'sedentary', widget: 'sedentary', demo: 'demo' },
  { plugin: 'todo', widget: 'todo-list', demo: 'demo' },
  { plugin: 'weather', widget: 'weather-card', demo: 'mock' },
];

const MEASURE = `(() => {
  const W = innerWidth;
  const H = innerHeight;
  const num = (value) => Number.parseFloat(value) || 0;
  const visible = (el) => {
    if (!el || el.nodeType !== 1) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || num(cs.opacity) === 0) return false;
    return rect.bottom > 0 && rect.top < H + 200 && rect.right > 0 && rect.left < W;
  };

  // ---- 可见文字字号 ----
  const fonts = [];
  const smallTexts = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('script,style')) continue;
    const own = [...el.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => (node.textContent || '').trim())
      .filter(Boolean)
      .join(' ');
    if (!own || !visible(el)) continue;
    const fontSize = num(getComputedStyle(el).fontSize);
    if (!fontSize) continue;
    fonts.push(fontSize);
    if (fontSize < ${MIN_FONT}) smallTexts.push({ text: own.slice(0, 32), fontSize });
  }

  // ---- 控件根尺寸：Fluent 内建控件量根节点，不是内部的 input/checkbox ----
  const ROOT_SELECTOR = [
    '.fui-Button',
    '.fui-Input',
    '.fui-Textarea',
    '.fui-Dropdown',
    '.fui-Combobox',
    '.fui-Tab',
    '.fui-Switch',
    '.fui-Checkbox',
    '.fui-Radio',
    '.fui-Slider',
    '.fui-SpinButton',
    '.fui-SearchBox',
    '.fui-Select',
  ].join(',');
  const INTERACTIVE =
    'button, [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [role="radio"], [role="slider"], input, select, textarea, a[href]';
  const controls = [];
  for (const el of document.querySelectorAll(INTERACTIVE)) {
    if (!visible(el)) continue;
    const root = el.closest(ROOT_SELECTOR) || el;
    if (!visible(root)) continue;
    const rect = root.getBoundingClientRect();
    const className = typeof root.className === 'string' ? root.className : '';
    controls.push({
      kind: className.split(' ').find((part) => part.startsWith('fui-')) || el.tagName.toLowerCase(),
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute('role') || null,
      label: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });
  }

  // ---- 详情骨架内边距 ----
  const pads = ['[data-detail-header]', '[data-detail-toolbar]', '[data-detail-tabs]']
    .map((selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const cs = getComputedStyle(node);
      return {
        selector,
        left: num(cs.paddingLeft),
        right: num(cs.paddingRight),
      };
    })
    .filter(Boolean);

  const page = document.querySelector('[data-detail-page]');
  const pageRect = page ? page.getBoundingClientRect() : null;

  return {
    width: W,
    height: H,
    bodyText: (document.body.innerText || '').trim().slice(0, 160),
    textLength: (document.body.innerText || '').trim().length,
    fontCount: fonts.length,
    minFont: fonts.length ? Math.min(...fonts) : 0,
    maxFont: fonts.length ? Math.max(...fonts) : 0,
    smallTexts: smallTexts.slice(0, 10),
    smallTextCount: smallTexts.length,
    controlCount: controls.length,
    smallControls: controls.filter((c) => c.width < ${MIN_CONTROL} || c.height < ${MIN_CONTROL}).slice(0, 12),
    smallControlCount: controls.filter((c) => c.width < ${MIN_CONTROL} || c.height < ${MIN_CONTROL}).length,
    pads,
    hasDetailPage: Boolean(page),
    pageRect: pageRect
      ? { left: Math.round(pageRect.left), top: Math.round(pageRect.top), right: Math.round(pageRect.right), bottom: Math.round(pageRect.bottom) }
      : null,
    docScrollWidth: document.documentElement.scrollWidth,
    docClientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    bodyClientWidth: document.body.clientWidth,
  };
})()`;

function caseUrl(entry) {
  const params = new URLSearchParams({
    plugin: entry.plugin,
    widget: entry.widget,
    view: 'detail',
  });
  if (entry.demo === 'demo') params.set('demo', '1');
  if (entry.demo === 'mock') params.set('mock', '1');
  return `${BASE_URL}/plugins/${entry.plugin}/index.html?${params.toString()}`;
}

async function waitForRender(cdp, timeoutMs = 40000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const state = await cdp.evaluate(`(() => {
      const root = document.getElementById('root');
      const text = (root?.innerText || '').trim();
      return {
        textLength: text.length,
        detail: Boolean(document.querySelector('[data-detail-page]')),
        spinner: Boolean(document.querySelector('.fui-Spinner')),
      };
    })()`);
    if (state && state.detail && state.textLength > 40 && !state.spinner) return true;
    await sleep(400);
  }
  return false;
}

async function verifyCase(cdp, entry, options) {
  cdp.clearConsoleErrors();
  await cdp.navigate(caseUrl(entry));
  const ready = await waitForRender(cdp);
  // 详情内异步数据（天气 mock / 演示种子）收尾，避免量到骨架半成品
  await sleep(1800);
  if (options.scheme === 'light') {
    await cdp.evaluate(`(() => {
      document.documentElement.style.background = '#ffffff';
      document.body.style.background = '#ffffff';
      return 'ok';
    })()`);
  }
  const measure = await cdp.evaluate(MEASURE);
  const fails = [];

  if (!ready) fails.push('详情未渲染（无 [data-detail-page] 或文字不足）');
  if (!measure.hasDetailPage) fails.push('缺少详情骨架 [data-detail-page]');
  if (measure.width !== VIEW_WIDTH || measure.height !== VIEW_HEIGHT) {
    fails.push(`视口 ${measure.width}×${measure.height} ≠ ${VIEW_WIDTH}×${VIEW_HEIGHT}`);
  }
  if (measure.pads.length === 0) {
    fails.push('详情骨架没有 header/toolbar/tabs，无法核对根内边距');
  } else {
    const wrong = measure.pads.filter(
      (pad) => pad.left !== ROOT_PADDING || pad.right !== ROOT_PADDING,
    );
    if (wrong.length > 0) {
      fails.push(
        `根内边距不是 ${ROOT_PADDING}：${wrong
          .map((pad) => `${pad.selector} ${pad.left}/${pad.right}`)
          .join('、')}`,
      );
    }
  }
  if (measure.smallControlCount > 0) {
    fails.push(
      `可交互控件根 <${MIN_CONTROL}：${measure.smallControlCount} 个（${measure.smallControls
        .map((c) => `${c.kind}:${c.label}@${c.width}×${c.height}`)
        .join('、')}）`,
    );
  }
  if (measure.smallTextCount > 0) {
    fails.push(
      `可见文字 <${MIN_FONT}px：${measure.smallTextCount} 处（${measure.smallTexts
        .map((t) => `${t.fontSize}px「${t.text}」`)
        .join('、')}）`,
    );
  }
  if (measure.docScrollWidth > measure.docClientWidth + 1) {
    fails.push(`页面横向溢出 ${measure.docScrollWidth} > ${measure.docClientWidth}`);
  }
  if (measure.bodyScrollWidth > measure.bodyClientWidth + 1) {
    fails.push(`body 横向溢出 ${measure.bodyScrollWidth} > ${measure.bodyClientWidth}`);
  }
  if (measure.pageRect && (measure.pageRect.left < -1 || measure.pageRect.right > VIEW_WIDTH + 1)) {
    fails.push(
      `详情根越出视口 left=${measure.pageRect.left} right=${measure.pageRect.right}`,
    );
  }
  if (cdp.consoleErrors.length > 0) {
    fails.push(
      `console error ${cdp.consoleErrors.length} 条：${cdp.consoleErrors
        .map((error) => `${error.type}:${error.text}`)
        .join(' | ')
        .slice(0, 400)}`,
    );
  }

  if (options.screenshots) {
    const dir = join('shots', 'milestones', 'e7', 'overlays');
    mkdirSync(dir, { recursive: true });
    const suffix = options.scheme === 'light' ? '-light' : '-dark';
    await cdp.screenshot(join(dir, `${entry.plugin}-detail${suffix}.png`));
  }

  return { entry, measure, fails, ready };
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.includes('--plugin') ? args[args.indexOf('--plugin') + 1] : null;
  const scheme = args.includes('--scheme') ? args[args.indexOf('--scheme') + 1] : 'dark';
  const screenshots = args.includes('--screenshots');
  const jsonPath = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;

  if (scheme !== 'dark' && scheme !== 'light') {
    throw new Error(`非法 scheme：${scheme}（只支持 dark / light）`);
  }
  const cases = CASES.filter((entry) => !only || entry.plugin === only);
  if (cases.length === 0) throw new Error(`没有匹配的插件：${only}`);

  const cdp = await launch({ width: VIEW_WIDTH, height: VIEW_HEIGHT, scheme });
  const results = [];
  let failures = 0;
  try {
    for (const entry of cases) {
      const result = await verifyCase(cdp, entry, { scheme, screenshots });
      results.push(result);
      const { measure } = result;
      console.log(
        `  ${entry.plugin.padEnd(9)} detail  字号 ${String(measure.minFont).padStart(3)}–${String(
          measure.maxFont,
        ).padStart(4)}px  文本 ${String(measure.textLength).padStart(4)}  控件 ${String(
          measure.controlCount,
        ).padStart(2)}（<${MIN_CONTROL} ${measure.smallControlCount}）  ` +
          `${result.fails.length === 0 ? 'PASS' : 'FAIL'}`,
      );
      for (const fail of result.fails) console.log(`      - ${fail}`);
      if (result.fails.length > 0) failures += 1;
    }
  } finally {
    await cdp.close();
  }

  if (jsonPath) {
    mkdirSync(dirname(jsonPath), { recursive: true });
    writeFileSync(
      jsonPath,
      `${JSON.stringify(
        {
          scheme,
          viewport: { width: VIEW_WIDTH, height: VIEW_HEIGHT },
          assertions: {
            viewport: `${VIEW_WIDTH}×${VIEW_HEIGHT}`,
            rootPadding: ROOT_PADDING,
            minControl: MIN_CONTROL,
            minFont: MIN_FONT,
            consoleErrors: 0,
          },
          generatedAt: new Date().toISOString(),
          results: results.map((result) => ({
            plugin: result.entry.plugin,
            widget: result.entry.widget,
            url: caseUrl(result.entry),
            ready: result.ready,
            fails: result.fails,
            measure: result.measure,
          })),
        },
        null,
        2,
      )}\n`,
    );
    console.log(`  JSON → ${jsonPath}`);
  }

  console.log(`\n=== 汇总（${scheme}，${VIEW_WIDTH}×${VIEW_HEIGHT}）===`);
  for (const result of results) {
    console.log(
      `${result.fails.length === 0 ? 'PASS' : 'FAIL'}  ${result.entry.plugin} detail  (${caseUrl(
        result.entry,
      )})`,
    );
  }
  if (failures > 0) {
    console.log(`\n${failures} 个详情视图未通过断言`);
    process.exitCode = 1;
  } else {
    console.log(`\n全部 ${results.length} 个详情视图通过断言`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
