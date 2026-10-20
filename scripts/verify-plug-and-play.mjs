/**
 * Plug-and-play 验收脚本（契约 §8，E7 后补的正式化脚本）。
 *
 * 目标：证明「新增插件 = 放目录 + 登记 index.json，零宿主改动」。
 *
 * 做法：
 *   1. 把 `templates/plugin-template/` 冷复制到 `public/plugins/wtsl-pnp-probe/`，
 *      只改 manifest 的 id/name（模板自带预构建 app.js，不需要重新构建）；
 *   2. 仅把 `"wtsl-pnp-probe"` 追加到 `public/plugins/index.json`；
 *   3. 用 headless Edge 打开正式宿主（`/`），断言：
 *      - 桌面出现第 7 张卡片（iframe 指向该插件），且能点卡进入 `?view=detail` 浮层；
 *      - 宿主设置页出现该插件分区，按 schema 渲染 3 个字段；
 *      - 关闭浮层后布局/console 正常；
 *   4. finally：删除插件目录、恢复 index.json 原文，再断言桌面恢复 6 卡、无插件残留。
 *
 * 覆盖边界：卡片/详情/设置分区/清理（契约 §8 的桌面与设置路径）。
 * Agent 工具与复盘统计块依赖插件声明 `*.stats` 工具，模板只注册 `template.summary`，
 * 因此这两项仍以 E7 人工验收（临时 ping fixture，19/19）与插件专项 verify-plugin 为准；
 * 本脚本聚焦宿主侧 plug-and-play 的最小硬门槛。
 *
 * 用法（仓库根目录，dev server 需在 http://localhost:5173 运行）：
 *   node scripts/verify-plug-and-play.mjs
 *   node scripts/verify-plug-and-play.mjs --screenshots   # 截图到 shots/pnp/
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, cpSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { launch, sleep } from './lib/cdp.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templateDir = join(repoRoot, 'templates', 'plugin-template');
const pluginsRoot = join(repoRoot, 'public', 'plugins');
const probeId = 'wtsl-pnp-probe';
const probeDir = join(pluginsRoot, probeId);
const indexPath = join(pluginsRoot, 'index.json');
const baseUrl = process.env.WTSL_BASE_URL || 'http://localhost:5173';
const wantScreenshots = process.argv.includes('--screenshots');
const shotDir = join(repoRoot, 'shots', 'pnp');

let failures = 0;
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const tag = ok ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
  return ok;
}

function restoreIndex(original) {
  writeFileSync(indexPath, original, 'utf8');
}

async function waitCards(cdp, expected, message) {
  return cdp.waitFor(
    `document.querySelectorAll('[data-widget-card]').length === ${expected}`,
    // v0.2.2 回归：弱机 + Vite 冷加载时宿主首屏可达 60–100s（见 shots/v022-final/pnp-investigation.json），
    // 30s 会把环境慢误判成产品回归；放宽到 120s，断言本身不变。
    { timeout: 120000, interval: 200, message },
  );
}

async function clickProbeCard(cdp) {
  // 等插件 iframe 真正挂载出 CardRoot（新增插件是异步加载 iframe；过早点击会落在未挂载的文档上）。
  await cdp.waitFor(
    `(() => {
      const frame = [...document.querySelectorAll('iframe')].find((item) =>
        (item.getAttribute('src') || '').includes('/plugins/${probeId}/'),
      );
      try {
        return Boolean(frame && frame.contentDocument && frame.contentDocument.querySelector('[data-card-root]'));
      } catch {
        return false;
      }
    })()`,
    { timeout: 120000, interval: 200, message: '探测插件 iframe 未挂载出 CardRoot' },
  );

  // 优先用 iframe 内的 CardRoot 触发主操作：同源（dev server）可直接访问 contentDocument。
  // 坐标点击可能落在卡片快捷按钮上（模板有「增加」按钮，stopPropagation），因此不用它做主路径。
  const viaCardRoot = await cdp.evaluate(`(() => {
    const frame = [...document.querySelectorAll('iframe')].find((item) =>
      (item.getAttribute('src') || '').includes('/plugins/${probeId}/'),
    );
    if (!frame) return false;
    try {
      const root = frame.contentDocument?.querySelector('[data-card-root]');
      if (!root) return false;
      root.click();
      return true;
    } catch {
      return false;
    }
  })()`);
  if (viaCardRoot) {
    await sleep(300);
    return true;
  }
  // 兜底：坐标点击卡片中心
  const rect = await cdp.evaluate(`(() => {
    const frame = [...document.querySelectorAll('iframe')].find((item) =>
      (item.getAttribute('src') || '').includes('/plugins/${probeId}/'),
    );
    if (!frame) return null;
    const r = frame.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (!rect) return false;
  await cdp.dispatchMouse('mouseMoved', rect.x, rect.y);
  await cdp.dispatchMouse('mousePressed', rect.x, rect.y);
  await sleep(60);
  await cdp.dispatchMouse('mouseReleased', rect.x, rect.y);
  await sleep(300);
  return true;
}

async function main() {
  if (!existsSync(templateDir)) throw new Error(`找不到模板：${templateDir}`);
  if (existsSync(probeDir)) {
    console.log(`清理上次残留：${probeDir}`);
    rmSync(probeDir, { recursive: true, force: true });
  }
  const indexOriginal = readFileSync(indexPath, 'utf8');
  const indexList = JSON.parse(indexOriginal);
  if (!Array.isArray(indexList)) throw new Error('index.json 不是字符串数组');

  const serverOk = await fetch(`${baseUrl}/`).then((r) => r.status).catch(() => 0);
  if (serverOk !== 200) throw new Error(`dev server 不可用：${baseUrl}（HTTP ${serverOk}）`);

  let cdp = null;
  try {
    // ---------- 准备：冷复制 + 仅登记 index ----------
    cpSync(templateDir, probeDir, { recursive: true });
    const manifestPath = join(probeDir, 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.id = probeId;
    manifest.name = 'PnP 探针';
    manifest.version = '0.0.0';
    if (Array.isArray(manifest.widgets)) {
      for (const widget of manifest.widgets) widget.title = 'PnP 探针';
    }
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    writeFileSync(indexPath, `${JSON.stringify([...indexList, probeId], null, 2)}\n`, 'utf8');
    check('复制模板并登记 index.json（零宿主改动）', true, probeDir);

    // ---------- 启动浏览器，打开正式宿主 ----------
    cdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
    await cdp.navigate(`${baseUrl}/`);
    await waitCards(cdp, 7, '新增插件后桌面应出现 7 张卡片');
    const frameCount = await cdp.evaluate(
      `document.querySelectorAll('iframe').length`,
    );
    const probeFrame = await cdp.evaluate(`(() => {
      const frame = [...document.querySelectorAll('iframe')].find((item) =>
        (item.getAttribute('src') || '').includes('/plugins/${probeId}/'),
      );
      return frame ? { src: frame.getAttribute('src'), width: frame.clientWidth, height: frame.clientHeight } : null;
    })()`);
    check('桌面出现第 7 张卡片且 iframe 指向探测插件', Boolean(probeFrame), JSON.stringify(probeFrame));
    if (wantScreenshots && probeFrame) {
      mkdirSync(shotDir, { recursive: true });
      await cdp.screenshot(join(shotDir, '01-desktop-7-cards.png'));
    }

    // ---------- 点卡 → detail 浮层 ----------
    const clicked = await clickProbeCard(cdp);
    check('可点击探测卡片', clicked);
    if (clicked) {
      let overlay = null;
      try {
        overlay = await cdp.waitFor(
          `(() => {
            const frame = [...document.querySelectorAll('iframe')].find((item) =>
              (item.getAttribute('src') || '').includes('view=detail') &&
              (item.getAttribute('src') || '').includes('${probeId}'),
            );
            if (!frame) return null;
            const surface = document.querySelector('[data-overlay-mode]');
            const rect = surface ? surface.getBoundingClientRect() : frame.getBoundingClientRect();
            return { src: frame.getAttribute('src'), surface: [Math.round(rect.width), Math.round(rect.height)] };
          })()`,
          { timeout: 60000, interval: 150, message: '点卡后没有出现探测插件的 detail 浮层' },
        );
      } catch (error) {
        const srcs = await cdp.evaluate(
          `[...document.querySelectorAll('iframe')].map((item) => item.getAttribute('src'))`,
        );
        console.error('[DEBUG] 当前 iframe src：', JSON.stringify(srcs));
        throw error;
      }
      check('点卡打开 detail 浮层', Boolean(overlay), JSON.stringify(overlay));
      if (wantScreenshots) await cdp.screenshot(join(shotDir, '02-detail.png'));

      // Esc 关闭浮层，布局与卡片数量保持不变
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
      await cdp.waitFor(
        `![...document.querySelectorAll('iframe')].some((item) => (item.getAttribute('src') || '').includes('view=detail'))`,
        { timeout: 30000, interval: 150, message: 'Esc 后 detail 浮层未关闭' },
      );
      check('Esc 关闭 detail 浮层', true);
      await waitCards(cdp, 7, '关闭浮层后卡片数量应保持 7');
      check('关闭浮层后布局保持不变（7 卡）', true);
    }

    // ---------- 宿主设置页：按 schema 渲染插件分区 ----------
    await cdp.navigate(`${baseUrl}/?page=settings`);
    await cdp.waitFor(`document.body.innerText.includes('PnP 探针')`, {
      timeout: 60000,
      interval: 200,
      message: '设置页没有出现探测插件分区',
    });
    check('设置页出现探测插件分区', true);
    await cdp.clickText('PnP 探针', { timeout: 60000 });
    const fieldState = await cdp.waitFor(
      `(() => {
        const text = document.body.innerText;
        const labels = ['显示快捷提示', '计数单位', '每次增加'];
        return labels.every((label) => text.includes(label))
          ? { labels, found: true }
          : null;
      })()`,
      { timeout: 60000, interval: 200, message: '设置分区没有按 schema 渲染字段' },
    );
    check('设置分区按 manifest schema 渲染 3 个字段', Boolean(fieldState), JSON.stringify(fieldState));
    if (wantScreenshots) await cdp.screenshot(join(shotDir, '03-settings-section.png'));

    const consoleErrors = [...cdp.consoleErrors];
    check('宿主 console error = 0', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  } finally {
    if (cdp) {
      try {
        await cdp.close();
      } catch (error) {
        console.error(`[WARN] 浏览器清理失败：${error.message}`);
      }
    }
    try {
      restoreIndex(indexOriginal);
    } catch (error) {
      console.error(`[WARN] index.json 恢复失败：${error.message}`);
    }
    try {
      rmSync(probeDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`[WARN] 插件目录清理失败：${error.message}`);
    }
    check(
      '清理插件目录并恢复 index.json',
      !existsSync(probeDir) && readFileSync(indexPath, 'utf8') === indexOriginal,
      indexPath,
    );

    // ---------- 清理后复验：桌面回到 6 卡 ----------
    let cleanupCdp = null;
    try {
      cleanupCdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
      await cleanupCdp.navigate(`${baseUrl}/`);
      await waitCards(cleanupCdp, 6, '清理后桌面应恢复 6 张卡片');
      const leftover = await cleanupCdp.evaluate(
        `[...document.querySelectorAll('iframe')].some((item) => (item.getAttribute('src') || '').includes('${probeId}'))`,
      );
      check('清理后桌面恢复 6 卡且无探测插件残留', !leftover);
      const consoleErrors = [...cleanupCdp.consoleErrors];
      check('清理后 console error = 0', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
    } catch (error) {
      console.error(`[WARN] 清理后复验未完成：${error.message}`);
    } finally {
      if (cleanupCdp) {
        try {
          await cleanupCdp.close();
        } catch (error) {
          console.error(`[WARN] 清理后复验浏览器关闭失败：${error.message}`);
        }
      }
    }
  }

  console.log(`\n${results.length - failures}/${results.length} PASS`);
  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
