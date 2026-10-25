/**
 * 宿主内详情浮层联调（E7 重写）：点桌面卡片 → 宿主 Fluent Dialog 加载 `?view=detail`。
 *
 * 历史：E1 之前用 `host:open-settings` 直接给卡片 iframe 转发宿主消息，打开 6 个
 * `?view=settings`（该视图已删除）。现在插件只有 detail 浮层，且真实入口是「点卡片」，
 * 所以本脚本改为走完整用户路径：点卡 → 等浮层 iframe 渲染 → 截图 → Esc 关闭 → 焦点归还。
 *
 * 用法（仓库根目录，dev server 需在 http://localhost:5173 运行）：
 *   node scripts/shot-host-overlays.mjs                  # 暗色，1440×960
 *   node scripts/shot-host-overlays.mjs --scheme light   # 亮色
 *   node scripts/shot-host-overlays.mjs --dsf 1          # 降低截图分辨率（默认 2）
 *
 * 与 verify-overlays.mjs 的分工：那个只测插件页 standalone 的 detail 布局与字号/控件；
 * 这个测宿主集成（点卡开浮层、Dialog 尺寸、iframe 内容、Esc 收回、焦点归还），
 * 截图归档 `shots/milestones/e7/host/`。
 *
 * 实现：复用 `scripts/lib/cdp.mjs`（串行单 Edge、唯一 `%TEMP%\wtsl-verify-*` profile、自动清理）。
 */
import { join } from 'node:path';

import { launch, sleep } from './lib/cdp.mjs';

const WIDTH = 1440;
const HEIGHT = 960;
const DIALOG_WIDTH = 880;
const DIALOG_HEIGHT = 680;

const PLUGINS = ['clock', 'countdown', 'pomodoro', 'sedentary', 'todo', 'weather'];

const findCard = (plugin) => `(() => {
  const frame = [...document.querySelectorAll('iframe')].find((item) => {
    const src = item.getAttribute('src') || '';
    return src.includes('plugin=${plugin}&') && !src.includes('background=1') && !src.includes('view=detail');
  });
  const card = frame?.closest('[data-widget-card]');
  if (!card) return null;
  const rect = card.getBoundingClientRect();
  return {
    uid: card.getAttribute('data-widget-uid') || '',
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
})()`;

const dialogState = `(() => {
  const surface = document.querySelector('[data-overlay-phase]');
  if (!surface) return null;
  const frame = surface.querySelector('iframe');
  const rect = surface.getBoundingClientRect();
  let textLength = -1;
  try {
    textLength = (frame?.contentDocument?.body?.innerText || '').trim().length;
  } catch {
    textLength = -1;
  }
  return {
    mode: surface.getAttribute('data-overlay-mode'),
    phase: surface.getAttribute('data-overlay-phase'),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    src: frame?.getAttribute('src') || '',
    textLength,
  };
})()`;

async function clickCard(cdp, card) {
  await cdp.dispatchMouse('mouseMoved', card.x, card.y);
  await cdp.dispatchMouse('mousePressed', card.x, card.y);
  await sleep(70);
  await cdp.dispatchMouse('mouseReleased', card.x, card.y);
}

async function pressEscape(cdp) {
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
}

async function waitDialog(cdp, plugin, timeout) {
  try {
    return await cdp.waitFor(dialogState, {
      timeout,
      interval: 200,
      message: `${plugin} 浮层没有出现`,
    });
  } catch {
    return null;
  }
}

async function openDetail(cdp, plugin) {
  const card = await cdp.evaluate(findCard(plugin));
  if (!card || !card.uid) return { fail: `桌面没有 ${plugin} 卡片` };
  await clickCard(cdp, card);
  let state = await waitDialog(cdp, plugin, 6000);
  if (!state) {
    // 卡片中心可能落在内部快捷控件上（例如番茄钟的开始按钮）：补一次触控轻点
    await cdp.dispatchTouch('touchStart', [{ x: card.x, y: card.y }]);
    await sleep(120);
    await cdp.dispatchTouch('touchEnd', []);
    state = await waitDialog(cdp, plugin, 12000);
  }
  if (!state) return { fail: `${plugin} 点卡后宿主浮层没有出现（鼠标 + 触控均未打开）` };
  // 等内容渲染（container transform 结束后 iframe 内才有完整文字）
  const startedAt = Date.now();
  while (Date.now() - startedAt < 20000) {
    state = await cdp.evaluate(dialogState);
    if (state && state.textLength > 20 && state.phase === 'open') break;
    await sleep(300);
  }
  await sleep(900);
  return { card, state: await cdp.evaluate(dialogState) };
}

async function closeDetail(cdp, plugin, card) {
  await pressEscape(cdp);
  let closed = false;
  try {
    closed = await cdp.waitFor(`!document.querySelector('[role="dialog"]')`, {
      timeout: 8000,
      interval: 150,
      message: `${plugin} 浮层按 Esc 后没有关闭`,
    });
  } catch {
    closed = false;
  }
  if (!closed) return { fail: `${plugin} 浮层按 Esc 后没有关闭` };
  const focused = await cdp.evaluate(
    `(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName || null,
        uid: el?.closest?.('[data-widget-card]')?.getAttribute('data-widget-uid') || null,
        ariaLabel: el?.getAttribute?.('aria-label') || null,
      };
    })()`,
  );
  if (!focused || focused.uid !== card.uid) {
    return { fail: `${plugin} 关闭后焦点未归还卡片（${JSON.stringify(focused)}）` };
  }
  return { focused };
}

async function main() {
  const args = process.argv.slice(2);
  const scheme = args.includes('--scheme') ? args[args.indexOf('--scheme') + 1] : 'dark';
  const dsfIndex = args.indexOf('--dsf');
  const dsf = dsfIndex >= 0 ? Number(args[dsfIndex + 1]) : 2;
  if (scheme !== 'dark' && scheme !== 'light') throw new Error(`非法 scheme：${scheme}`);
  if (!Number.isFinite(dsf) || dsf <= 0) throw new Error(`非法 dsf：${args[dsfIndex + 1]}`);

  const dir = join('shots', 'milestones', 'e7', 'host');
  const suffix = scheme === 'light' ? '-light' : '-dark';
  const cdp = await launch({ width: WIDTH, height: HEIGHT, scheme });
  const problems = [];
  const evidence = [];
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: dsf,
      mobile: false,
    });

    cdp.clearConsoleErrors();
    await cdp.navigate(`${cdp.baseUrl}/`);
    await cdp.waitFor(
      `document.querySelectorAll('[data-widget-card]').length >= ${PLUGINS.length}`,
      { timeout: 60000, interval: 300, message: '桌面卡片没有全部挂载' },
    );
    // 等六张卡片的 iframe 都出了文字（插件首屏就绪）
    const startedAt = Date.now();
    while (Date.now() - startedAt < 60000) {
      const ready = await cdp.evaluate(`(() => {
        const frames = [...document.querySelectorAll('[data-widget-card] iframe')];
        return {
          count: frames.length,
          withText: frames.filter((frame) => {
            try { return (frame.contentDocument?.body?.innerText || '').trim().length > 10; } catch { return false; }
          }).length,
        };
      })()`);
      if (ready && ready.count >= PLUGINS.length && ready.withText >= PLUGINS.length) break;
      await sleep(500);
    }
    await sleep(1200);
    await cdp.screenshot(join(dir, `desktop-${WIDTH}x${HEIGHT}${suffix}.png`));

    for (const plugin of PLUGINS) {
      const opened = await openDetail(cdp, plugin);
      if (opened.fail) {
        problems.push(opened.fail);
        console.log(`  FAIL ${plugin} detail：${opened.fail}`);
        continue;
      }
      const { card, state } = opened;
      const caseFails = [];
      if (!state) caseFails.push('浮层状态读不到');
      else {
        if (state.width !== DIALOG_WIDTH || state.height !== DIALOG_HEIGHT) {
          // 固定 1440×960：浮层 surface 必须是 880×680（1024 视口才会 min(72vh,680) 变矮）
          caseFails.push(
            `浮层尺寸 ${state.width}×${state.height} ≠ ${DIALOG_WIDTH}×${DIALOG_HEIGHT}`,
          );
        }
        if (!(state.src || '').includes('view=detail')) {
          caseFails.push(`浮层 iframe 不是 detail 视图：${state.src}`);
        }
        if (!(state.textLength > 20)) {
          caseFails.push(`浮层 iframe 文字不足（${state.textLength}）`);
        }
      }
      await cdp.screenshot(join(dir, `overlay-${plugin}-detail${suffix}.png`));
      const closed = await closeDetail(cdp, plugin, card);
      if (closed.fail) caseFails.push(closed.fail);
      evidence.push({
        plugin,
        card,
        open: state,
        close: closed.focused || null,
        fails: caseFails,
      });
      if (caseFails.length === 0) {
        console.log(
          `  PASS ${plugin} detail  ${state?.width}×${state?.height}  mode=${state?.mode}  ` +
            `文本 ${state?.textLength}  焦点 ${closed.focused?.uid}`,
        );
      } else {
        problems.push(...caseFails);
        for (const fail of caseFails) console.log(`  FAIL ${plugin} detail：${fail}`);
      }
      await sleep(400);
    }

    const errors = cdp.consoleErrors;
    if (errors.length > 0) {
      problems.push(`console error ${errors.length} 条`);
      for (const error of errors) console.log(`  FAIL console ${error.type}: ${error.text}`);
    } else {
      console.log('  PASS console 0 error');
    }
  } finally {
    await cdp.close();
  }

  const { writeFileSync, mkdirSync } = await import('node:fs');
  mkdirSync(join('shots', 'milestones', 'e7', 'logs'), { recursive: true });
  writeFileSync(
    join('shots', 'milestones', 'e7', 'logs', `host-overlays-${scheme}.json`),
    `${JSON.stringify(
      {
        scheme,
        viewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: dsf },
        expectedDialog: { width: DIALOG_WIDTH, height: DIALOG_HEIGHT },
        generatedAt: new Date().toISOString(),
        problems,
        evidence,
      },
      null,
      2,
    )}\n`,
  );

  if (problems.length > 0) {
    console.log(`\n${problems.length} 个宿主内详情浮层问题`);
    process.exitCode = 1;
  } else {
    console.log(`\n宿主内 ${PLUGINS.length} 个详情浮层全部通过（${scheme}）`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
