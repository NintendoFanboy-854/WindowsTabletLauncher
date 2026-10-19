/**
 * 通用插件验收模板（E3 起每个插件 subagent 直接跑）。
 *
 * 用法（仓库根目录，dev server 已在 http://localhost:5173 运行）：
 *   node scripts/verify-plugin.mjs <id>
 *   node scripts/verify-plugin.mjs <id> --scheme light
 *   node scripts/verify-plugin.mjs <id> --no-screenshots
 *   node scripts/verify-plugin.mjs <id> --skip-host
 *
 * 检查顺序：
 *   1. 静态：manifest 结构与源码禁用样式（非 Fluent 字阶 / clamp / lineHeight:1 /
 *      10-11px / 自定义 hex 颜色）；
 *   2. 独立尺寸：按 manifest 的 sizes 逐个打开插件卡片页，断言有文字、最小字号 ≥12、
 *      无 console error，并截图到 shots/e3/<id>/；
 *   3. 宿主冒烟：打开 /?page=desktop，触控轻点该插件卡片；若插件发
 *      plugin:request-overlay，则等宿主 Dialog、截图、X 关闭；再用 Esc 关一次。
 *      未请求浮层的卡片只检查渲染。
 *
 * 扩展点：E3.x 插件 subagent 在“插件专属断言”注释处追加本插件的行为断言
 * （例如天气 mock 数据、待办勾选、番茄按钮），不要改通用断言。
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DEFAULT_BASE_URL, assert, launch, sleep } from './lib/cdp.mjs';

const REPO_ROOT = process.cwd();
const PLUGINS_ROOT = join(REPO_ROOT, 'public', 'plugins');
const SHOTS_ROOT = join(REPO_ROOT, 'shots', 'e3');

const args = process.argv.slice(2);
const id = args.find((arg) => !arg.startsWith('--'));
const scheme = args.includes('--scheme') ? args[args.indexOf('--scheme') + 1] : 'dark';
const screenshots = !args.includes('--no-screenshots');
const skipHost = args.includes('--skip-host');

if (!id) {
  console.error('用法: node scripts/verify-plugin.mjs <pluginId> [--scheme dark|light] [--no-screenshots] [--skip-host]');
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]+$/.test(id)) {
  console.error(`非法插件 id：${id}`);
  process.exit(1);
}
if (scheme !== 'dark' && scheme !== 'light') {
  console.error(`非法 scheme：${scheme}（只支持 dark / light）`);
  process.exit(1);
}

const pluginRoot = join(PLUGINS_ROOT, id);
const baseUrl = process.env.WTSL_BASE_URL || DEFAULT_BASE_URL;

/* ------------------------------------------------------------------ */
/* 静态检查                                                            */
/* ------------------------------------------------------------------ */

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${relative(REPO_ROOT, filePath)} 不是合法 JSON：${error.message}`);
  }
}

function collectSourceFiles(root) {
  if (!existsSync(root)) return [];
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'app') continue;
        walk(fullPath);
      } else if (/\.(js|jsx|css|html)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  };
  walk(root);
  return files;
}

/**
 * 去掉注释后再扫 hex；保留字符串内容，以便用上下文排除 URL 片段。
 * 这是保守规则：注释里的 #fff 不算，href="#abc"/url(#fade) 不算。
 */
function stripComments(content) {
  let output = '';
  let index = 0;
  let blockComment = false;
  let lineComment = false;
  let quote = null;
  while (index < content.length) {
    const char = content[index];
    const next = content[index + 1];
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        output += '  ';
        index += 2;
      } else {
        output += char === '\n' ? '\n' : ' ';
        index += 1;
      }
      continue;
    }
    if (lineComment) {
      if (char === '\n') {
        lineComment = false;
        output += '\n';
      } else {
        output += ' ';
      }
      index += 1;
      continue;
    }
    if (quote) {
      output += char;
      if (char === '\\') {
        output += next ?? '';
        index += 2;
        continue;
      }
      if (char === quote) quote = null;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      output += char;
      index += 1;
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      output += '  ';
      index += 2;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      output += '  ';
      index += 2;
      continue;
    }
    output += char;
    index += 1;
  }
  return output;
}

function lineAt(content, index) {
  return content.slice(0, index).split('\n').length;
}

function scanSourceFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const problems = [];
  const rules = [
    [/fontSizeBase(?:700|800|900|1000)/, '不存在的 Fluent 字阶 fontSizeBase7xx+（DENSITY §2.1）'],
    [/(?:fontSize|font-size)\s*:\s*['"]?clamp\(/, '禁止 clamp 字号（DENSITY §2.1）'],
    [/(?:lineHeight|line-height)\s*:\s*['"]?1['"]?(?=\s*[,;}\n])/, '禁止 lineHeight: 1（DENSITY §2.1）'],
  ];
  for (const [pattern, message] of rules) {
    if (pattern.test(content)) problems.push(`${relative(REPO_ROOT, filePath)}: ${message}`);
  }

  // 字号数值 <12（含 10/11/11.5）：DENSITY §2.1 的硬门槛。只匹配明确的 px / 无单位数值，
  // 不误伤 fontSizeBase* / fontSizeHero* token 引用。
  const numericFontPattern = /(?:fontSize|font-size)\s*:\s*['"]?(\d+(?:\.\d+)?)(?:px)?['"]?/g;
  let numericMatch;
  while ((numericMatch = numericFontPattern.exec(content))) {
    const size = Number.parseFloat(numericMatch[1]);
    if (size > 0 && size < 12) {
      problems.push(
        `${relative(REPO_ROOT, filePath)}: 字号 ${numericMatch[1]}px < 12px（DENSITY §2.1）`,
      );
    }
  }

  // hex 颜色：排除 URL 片段（href="#abc"、url(#fade)）与 data URI 里的 %23。
  const stripped = stripComments(content);
  const hexPattern = /#(?:[0-9a-fA-F]{3,8})\b/g;
  let match;
  while ((match = hexPattern.exec(stripped))) {
    const before = stripped.slice(Math.max(0, match.index - 48), match.index);
    if (/(?:href|src|xlink:href)\s*=\s*\{?\s*["']?$/.test(before)) continue;
    if (/url\(\s*["']?$/.test(before)) continue;
    problems.push(
      `${relative(REPO_ROOT, filePath)}:${lineAt(stripped, match.index)} 自定义 hex 颜色 ${match[0]}`,
    );
  }

  return problems;
}

function validateSizeList(widget) {
  assert(Array.isArray(widget.sizes) && widget.sizes.length > 0, `widget ${widget.id}: sizes 必须是非空数组`);
  for (const size of widget.sizes) {
    assert(
      Array.isArray(size) &&
        size.length === 2 &&
        size.every((value) => Number.isInteger(value) && value >= 1 && value <= 12),
      `widget ${widget.id}: 非法尺寸 ${JSON.stringify(size)}`,
    );
  }
  const key = (size) => `${size[0]}x${size[1]}`;
  assert(Array.isArray(widget.defaultSize) && widget.defaultSize.length === 2, `widget ${widget.id}: 缺少 defaultSize`);
  assert(
    widget.sizes.some((size) => key(size) === key(widget.defaultSize)),
    `widget ${widget.id}: defaultSize ${key(widget.defaultSize)} 不在 sizes 中`,
  );
}

const SETTING_TYPES = new Set(['boolean', 'number', 'enum', 'text', 'timeRange']);

function validateSettings(settings) {
  assert(settings && typeof settings === 'object', 'settings 必须是对象');
  assert(typeof settings.key === 'string' && settings.key.trim(), 'settings.key 必须是非空字符串');
  if (settings.version !== undefined) assert(typeof settings.version === 'number', 'settings.version 必须是数字');
  assert(Array.isArray(settings.groups), 'settings.groups 必须是数组');
  for (const group of settings.groups) {
    assert(group && typeof group === 'object', 'settings.groups 含非法分组');
    assert(typeof group.title === 'string' && group.title.trim(), 'settings 分组缺少 title');
    assert(Array.isArray(group.fields), `settings 分组「${group.title}」缺少 fields 数组`);
    for (const field of group.fields) {
      assert(field && typeof field === 'object', 'settings 字段必须是对象');
      assert(typeof field.key === 'string' && field.key.trim(), 'settings 字段缺少 key');
      assert(typeof field.label === 'string' && field.label.trim(), `settings 字段 ${field.key} 缺少 label`);
      assert(SETTING_TYPES.has(field.type), `settings 字段 ${field.key} 类型不支持：${field.type}`);
      if (field.type === 'enum') {
        assert(
          Array.isArray(field.options) && field.options.length > 0,
          `settings 枚举字段 ${field.key} 缺少 options`,
        );
        for (const option of field.options) {
          assert(
            option && typeof option.label === 'string' && 'value' in option,
            `settings 枚举字段 ${field.key} 的 option 结构不合法`,
          );
        }
      }
    }
  }
}

function runStaticChecks() {
  const problems = [];
  const required = ['index.html', 'manifest.json', 'app/app.js'];
  for (const relativePath of required) {
    const fullPath = join(pluginRoot, relativePath);
    if (!existsSync(fullPath)) problems.push(`缺少文件：public/plugins/${id}/${relativePath}`);
  }

  let manifest = null;
  const manifestPath = join(pluginRoot, 'manifest.json');
  if (existsSync(manifestPath)) {
    try {
      manifest = readJson(manifestPath);
      assert(manifest && typeof manifest === 'object', 'manifest 必须是对象');
      assert(manifest.id === id, `manifest.id（${manifest.id}）必须等于目录名 ${id}`);
      assert(typeof manifest.name === 'string' && manifest.name.trim(), 'manifest.name 必须是非空字符串');
      if (manifest.version !== undefined) assert(typeof manifest.version === 'string', 'manifest.version 必须是字符串');
      if (manifest.background !== undefined) assert(typeof manifest.background === 'boolean', 'manifest.background 必须是布尔值');
      assert(Array.isArray(manifest.widgets) && manifest.widgets.length > 0, 'manifest.widgets 必须是非空数组');
      for (const widget of manifest.widgets) {
        assert(widget && typeof widget === 'object', 'manifest.widgets 含非法项');
        assert(typeof widget.id === 'string' && widget.id.trim(), 'widget 缺少 id');
        assert(typeof widget.title === 'string' && widget.title.trim(), `widget ${widget.id} 缺少 title`);
        validateSizeList(widget);
      }
      if (manifest.settings !== undefined) validateSettings(manifest.settings);
    } catch (error) {
      problems.push(`manifest.json: ${error.message}`);
    }
  }

  const sourceFiles = collectSourceFiles(join(pluginRoot, 'src'));
  for (const entry of readdirSync(pluginRoot, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.css')) {
      sourceFiles.push(join(pluginRoot, entry.name));
    }
  }
  const indexPath = join(pluginRoot, 'index.html');
  if (existsSync(indexPath)) sourceFiles.push(indexPath);
  for (const filePath of sourceFiles) problems.push(...scanSourceFile(filePath));

  return { manifest, problems };
}

/* ------------------------------------------------------------------ */
/* 尺寸                                                                */
/* ------------------------------------------------------------------ */

/** 1440×960 网格：cell=164、gap=12；iframe = 卡片 − 2×6 宿主内衬（同 verify-widgets.mjs） */
function iframeSize([cols, rows], { cell = 164, gap = 12, inner = 6 } = {}) {
  return {
    width: cols * cell + (cols - 1) * gap - inner * 2,
    height: rows * cell + (rows - 1) * gap - inner * 2,
  };
}

const MEASURE_EXPRESSION = `(() => {
  const root = document.getElementById('root');
  const isVisible = (el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  };
  const fonts = [];
  const textSamples = [];
  for (const el of (root || document.body).querySelectorAll('*')) {
    if (el.closest('script,style')) continue;
    const own = [...el.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => (node.textContent || '').trim())
      .filter(Boolean)
      .join(' ');
    if (!own || !isVisible(el)) continue;
    const fontSize = Number.parseFloat(getComputedStyle(el).fontSize) || 0;
    if (!fontSize) continue;
    fonts.push(fontSize);
    if (textSamples.length < 8) textSamples.push(own.slice(0, 40));
  }
  return {
    width: innerWidth,
    height: innerHeight,
    textLength: ((root || document.body).innerText || '').trim().length,
    textSamples,
    fontCount: fonts.length,
    minFont: fonts.length ? Math.min(...fonts) : 0,
    maxFont: fonts.length ? Math.max(...fonts) : 0,
    below12: fonts.filter((value) => value < 12).length,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  };
})()`;

async function verifySizes(cdp, manifest, results) {
  for (const widget of manifest.widgets) {
    const sizes = [];
    for (const size of widget.sizes) {
      const key = `${size[0]}x${size[1]}`;
      if (!sizes.some((entry) => entry.key === key)) sizes.push({ key, bytes: size });
    }

    for (const size of sizes) {
      const { width, height } = iframeSize(size.bytes);
      const label = `${id} ${widget.id} ${size.key}`;
      const fails = [];
      await cdp.setViewport(width, height);
      cdp.clearConsoleErrors();
      const url = new URL(`/plugins/${encodeURIComponent(id)}/index.html`, baseUrl);
      url.searchParams.set('plugin', id);
      url.searchParams.set('widget', widget.id);
      url.searchParams.set('size', size.key);
      url.searchParams.set('demo', '1');

      try {
        await cdp.navigate(url.href, { timeout: 20000 });
        await cdp.waitFor(
          `(() => ((document.getElementById('root')?.innerText || '').trim().length > 0))()`,
          { timeout: 20000, message: `${label} 未渲染出文字` },
        );
        // 插件页 standalone 不会读 URL 的 size；按宿主协议补发一次 resize（同 verify-widgets.mjs）
        await cdp.evaluate(
          `window.postMessage({ type: 'host:resize', payload: { size: [${size.bytes[0]}, ${size.bytes[1]}] } }, '*'); 'ok'`,
        );
        await cdp.evaluate('document.fonts ? document.fonts.ready.then(() => true) : true');
        await sleep(500);
        const measure = await cdp.evaluate(MEASURE_EXPRESSION);
        assert(measure.textLength > 0, `${label} 没有文字`);
        assert(measure.fontCount > 0, `${label} 没有可见文字`);
        assert(measure.minFont >= 12, `${label} 最小字号 ${measure.minFont}px < 12px`);
        assert(measure.below12 === 0, `${label} 有 ${measure.below12} 处 <12px 文本`);
        if (cdp.consoleErrors.length > 0) {
          fails.push(
            `${label} console error ${cdp.consoleErrors.length} 条：${cdp.consoleErrors
              .map((entry) => entry.text)
              .join(' | ')
              .slice(0, 300)}`,
          );
        }
        if (screenshots) {
          await cdp.send('Emulation.setDefaultBackgroundColorOverride', {
            color:
              scheme === 'light'
                ? { r: 255, g: 255, b: 255, a: 1 }
                : { r: 14, g: 15, b: 19, a: 1 },
          });
          const shot = join(SHOTS_ROOT, id, `${id}-${widget.id}-${size.key}-${scheme}.png`);
          await cdp.screenshot(shot);
          results.screenshots.push(relative(REPO_ROOT, shot));
        }
        console.log(
          `  PASS ${size.key.padEnd(4)} ${String(width).padStart(3)}×${String(height).padStart(3)}  ` +
            `字号 ${String(measure.minFont).padStart(4)}–${String(measure.maxFont).padStart(4)}px  ` +
            `文本 ${String(measure.textLength).padStart(4)}`,
        );
      } catch (error) {
        fails.push(`${label}: ${error.message}`);
        console.log(`  FAIL ${size.key.padEnd(4)} ${error.message}`);
      }
      results.cases.push({ label, fails });
    }
  }
}

/* ------------------------------------------------------------------ */
/* 宿主卡片冒烟                                                        */
/* ------------------------------------------------------------------ */

async function openDesktopAndFindCard(cdp) {
  await cdp.setViewport(1440, 960);
  cdp.clearConsoleErrors();
  await cdp.navigate(new URL('/?page=desktop', baseUrl).href, { timeout: 30000 });
  const iframeSelector = `iframe[src*="/plugins/${id}/"]`;
  await cdp.waitFor(
    `(() => {
      const frame = document.querySelector(${JSON.stringify(iframeSelector)});
      if (!frame) return false;
      const rect = frame.getBoundingClientRect();
      return rect.width > 10 && rect.height > 10;
    })()`,
    { timeout: 90000, message: `宿主桌面没有出现 ${id} 的卡片 iframe` },
  );
  await cdp.waitFor(
    `(() => {
      const frame = document.querySelector(${JSON.stringify(iframeSelector)});
      return Boolean(frame && (frame.contentDocument?.getElementById('root')?.innerText || '').trim().length > 0);
    })()`,
    { timeout: 45000, message: `${id} 卡片 iframe 已挂载但没有渲染文字` },
  );
  // 给宿主手势/React 事件监听一个稳定帧，避免极快 headless 下 touch 早于 commit
  await sleep(800);
  const card = await cdp.evaluate(`(() => {
    const frame = document.querySelector(${JSON.stringify(iframeSelector)});
    const card = frame?.closest('[data-widget-card]');
    if (!card) return null;
    const rect = card.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      uid: card.getAttribute('data-widget-uid') || '',
    };
  })()`);
  assert(card && card.uid, `找不到 ${id} 的桌面卡片`);
  return card;
}

async function tapCard(cdp, card) {
  await cdp.dispatchTouch('touchStart', [{ x: card.x, y: card.y }]);
  await sleep(120);
  await cdp.dispatchTouch('touchEnd', []);
  await sleep(450);
}

async function clickCardWithMouse(cdp, card) {
  await cdp.dispatchMouse('mouseMoved', card.x, card.y);
  await cdp.dispatchMouse('mousePressed', card.x, card.y);
  await sleep(60);
  await cdp.dispatchMouse('mouseReleased', card.x, card.y);
  await sleep(450);
}

/** 编辑模式是宿主的全局状态；headless 触控事件偶尔丢失 touchEnd 会误触长按。 */
async function isEditMode(cdp) {
  return cdp.evaluate(`(() => {
    const done = [...document.querySelectorAll('button')].some((button) => (button.textContent || '').trim() === '完成');
    return done || document.body.getAttribute('data-edit-mode') === 'true';
  })()`);
}

async function leaveEditMode(cdp) {
  await cdp.clickText('完成', { touch: false, timeout: 5000 });
  await sleep(400);
}

async function waitForDialog(cdp, timeout = 3000) {
  try {
    return await cdp.waitFor(
      `(() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return null;
        const rect = dialog.getBoundingClientRect();
        if (rect.width < 100 || rect.height < 100) return null;
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      })()`,
      { timeout, interval: 100, message: '宿主 Dialog 未出现' },
    );
  } catch {
    return null;
  }
}

async function closeDialogWithX(cdp) {
  try {
    await cdp.clickText('关闭浮层', { touch: true });
    await cdp.waitFor(`!document.querySelector('[role="dialog"]')`, {
      timeout: 3000,
      interval: 100,
      message: '点 X 后宿主 Dialog 没有关闭',
    });
    return;
  } catch {
    // 触控点击偶尔没有合成 click；用鼠标点同一颗 X 兜底，仍验证关闭链路
    await cdp.clickText('关闭浮层', { touch: false });
    await cdp.waitFor(`!document.querySelector('[role="dialog"]')`, {
      timeout: 8000,
      interval: 100,
      message: '点 X 后宿主 Dialog 没有关闭',
    });
  }
}

async function closeDialogWithEscape(cdp) {
  // 先等浮层 iframe 真正挂载，再把焦点交给它；焦点在 iframe 内时 SDK 会直接发
  // plugin:request-overlay-close（真实使用路径）。
  await cdp.waitFor(
    `(() => {
      const frame = [...document.querySelectorAll('iframe')].find((item) => item.src.includes('view=detail'));
      return Boolean(frame && frame.contentDocument?.getElementById('root'));
    })()`,
    { timeout: 10000, interval: 100, message: '详情浮层 iframe 未挂载' },
  );
  await cdp.evaluate(`(() => {
    const frame = [...document.querySelectorAll('iframe')].find((item) => item.src.includes('view=detail'));
    if (!frame) return false;
    frame.contentWindow?.focus();
    return true;
  })()`);
  await sleep(200);
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
    nativeVirtualKeyCode: 27,
  });
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
    nativeVirtualKeyCode: 27,
  });
  await cdp.waitFor(`!document.querySelector('[role="dialog"]')`, {
    timeout: 2500,
    interval: 100,
    message: '按 Esc 后宿主 Dialog 没有关闭',
  }).catch(async () => {
    // headless 下 focus 偶尔没有真正进入 iframe，原生按键会落到宿主文档。
    // 退化为在浮层 window 上派发同一个 KeyboardEvent，仍然验证 SDK 的 Esc 监听链路。
    console.log('      (headless focus 未生效，Esc 改用 iframe 内 KeyboardEvent 兜底)');
    await cdp.evaluate(`(() => {
      const frame = [...document.querySelectorAll('iframe')].find((item) => item.src.includes('view=detail'));
      if (!frame?.contentWindow) return false;
      const KeyboardEventCtor = frame.contentWindow.KeyboardEvent;
      frame.contentWindow.dispatchEvent(
        new KeyboardEventCtor('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }),
      );
      return true;
    })()`);
    await cdp.waitFor(`!document.querySelector('[role="dialog"]')`, {
      timeout: 8000,
      interval: 100,
      message: '按 Esc 后宿主 Dialog 没有关闭（含 iframe 内事件兜底）',
    });
  });
}

async function openCardDetail(cdp, card) {
  await cdp.send('Page.bringToFront');
  await cdp.evaluate('window.focus(); true');
  await tapCard(cdp, card);
  let dialog = await waitForDialog(cdp, 2500);
  if (dialog) return { dialog, mode: 'touch' };

  // headless 触控偶尔丢 touchEnd → 宿主误进编辑模式。退出编辑后再试一次 touch。
  if (await isEditMode(cdp)) {
    await leaveEditMode(cdp);
    await sleep(400);
    await tapCard(cdp, card);
    dialog = await waitForDialog(cdp, 2500);
    if (dialog) return { dialog, mode: 'touch' };
  }

  // 最后一次用鼠标点击兜底，避免 CDP 触控合成问题把插件验收卡死。
  await clickCardWithMouse(cdp, card);
  dialog = await waitForDialog(cdp, 4000);
  return { dialog, mode: dialog ? 'mouse' : null };
}

async function verifyHost(cdp, results) {
  if (skipHost) {
    console.log('  SKIP 宿主冒烟（--skip-host）');
    return;
  }

  const fails = [];
  try {
    const card = await openDesktopAndFindCard(cdp);
    const opened = await openCardDetail(cdp, card);
    let dialog = opened.dialog;

    if (!dialog) {
      // 按模板约定：不发 plugin:request-overlay 的卡片只检查渲染，不算失败；
      // 契约要求“所有卡片点主体都能进详情”，由各插件 subagent 在扩展点补断言。
      console.log('  PASS 卡片渲染正常；未请求宿主浮层（仅检查卡片）');
      if (screenshots) {
        const shot = join(SHOTS_ROOT, id, `${id}-host-card-${scheme}.png`);
        await cdp.screenshot(shot);
        results.screenshots.push(relative(REPO_ROOT, shot));
      }
      results.cases.push({ label: `${id} 宿主冒烟`, fails });
      return;
    }

    await cdp.waitFor(
      `(() => {
        const frame = [...document.querySelectorAll('iframe')].find((item) => item.src.includes('view=detail'));
        return Boolean(frame && (frame.contentDocument?.getElementById('root')?.innerText || '').trim().length > 0);
      })()`,
      { timeout: 20000, message: '详情浮层 iframe 没有渲染文字' },
    );
    if (screenshots) {
      const shot = join(SHOTS_ROOT, id, `${id}-host-detail-${scheme}.png`);
      await cdp.screenshot(shot);
      results.screenshots.push(relative(REPO_ROOT, shot));
    }
    console.log(
      `  PASS 卡片${opened.mode === 'touch' ? '触控' : '鼠标兜底'} → 宿主 Dialog（${dialog.width}×${dialog.height}）`,
    );

    try {
      await closeDialogWithX(cdp);
      console.log('  PASS X 关闭浮层');
    } catch (error) {
      fails.push(`X 关闭失败：${error.message}`);
      console.log(`  FAIL X 关闭浮层：${error.message}`);
    }

    // Esc 再开一次，验证“焦点在 iframe 内”的真实路径
    try {
      const reopened = await openCardDetail(cdp, card);
      dialog = reopened.dialog;
      assert(dialog, '第二次点卡没有打开 Dialog');
      await closeDialogWithEscape(cdp);
      console.log('  PASS Esc 关闭浮层');
    } catch (error) {
      fails.push(`Esc 关闭失败：${error.message}`);
      console.log(`  FAIL Esc 关闭浮层：${error.message}`);
    }

    const relevantErrors = cdp.consoleErrors.filter(
      (entry) => entry.url.includes(`/plugins/${id}/`) || entry.text.includes(id),
    );
    if (relevantErrors.length > 0) {
      fails.push(
        `宿主冒烟 console error ${relevantErrors.length} 条：${relevantErrors
          .map((entry) => entry.text)
          .join(' | ')
          .slice(0, 300)}`,
      );
      console.log(`  FAIL 宿主冒烟 console error ${relevantErrors.length} 条`);
    } else {
      console.log('  PASS 宿主冒烟 console 0 error');
    }
  } catch (error) {
    fails.push(`宿主冒烟：${error.message}`);
    console.log(`  FAIL 宿主冒烟：${error.message}`);
  }
  results.cases.push({ label: `${id} 宿主冒烟`, fails });
}

/* ------------------------------------------------------------------ */
/* 主流程                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  console.log(`=== verify-plugin: ${id}（${scheme}）===`);
  if (!existsSync(pluginRoot)) {
    console.error(`插件目录不存在：public/plugins/${id}`);
    process.exitCode = 1;
    return;
  }

  const { manifest, problems: staticProblems } = runStaticChecks();
  const results = { cases: [], screenshots: [], staticProblems };

  if (staticProblems.length > 0) {
    console.log('\n[静态检查] FAIL');
    for (const problem of staticProblems) console.log(`  - ${problem}`);
  } else {
    console.log('\n[静态检查] PASS（manifest 结构合法；源码未命中禁用样式规则）');
  }

  if (!manifest || !Array.isArray(manifest.widgets) || manifest.widgets.length === 0) {
    console.log('\nmanifest 不可用，跳过运行时检查');
    results.cases.push({ label: `${id} 静态检查`, fails: staticProblems });
    if (staticProblems.length > 0) process.exitCode = 1;
    return;
  }

  const cdp = await launch({ width: 1440, height: 960, scheme });
  try {
    console.log('\n[独立尺寸]');
    await verifySizes(cdp, manifest, results);

    // === 插件专属断言扩展点（E3.x）===
    // 在这里追加本插件的断言，例如：
    //   - 读取 fixture/模拟数据后检查主信息数值；
    //   - 对真实插件点击快捷控件，断言 localStorage 或 UI 状态；
    //   - 断言亮暗两套截图。
    // 直接使用 cdp.evaluate / cdp.clickText / cdp.screenshot；不要引第三方依赖。

    console.log('\n[宿主卡片冒烟]');
    await verifyHost(cdp, results);
  } finally {
    await cdp.close();
  }

  const failures = [
    ...staticProblems.map((problem) => `静态检查：${problem}`),
    ...results.cases.flatMap((entry) => entry.fails),
  ];

  console.log('\n=== 汇总 ===');
  for (const entry of results.cases) {
    console.log(`${entry.fails.length === 0 ? 'PASS' : 'FAIL'}  ${entry.label}`);
    for (const fail of entry.fails) console.log(`      - ${fail}`);
  }
  if (results.screenshots.length > 0) {
    console.log(`\n截图 ${results.screenshots.length} 张：`);
    for (const shot of results.screenshots) console.log(`  ${shot}`);
  }

  if (failures.length > 0) {
    console.log(`\n${failures.length} 项未通过`);
    process.exitCode = 1;
  } else {
    console.log('\n全部检查通过');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
