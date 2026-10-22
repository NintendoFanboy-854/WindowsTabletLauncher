/**
 * 久坐「坐—站」循环的聚焦验证（独立预览页，demo=1 注入演示数据）。
 *
 * 覆盖：
 * 1) 首屏处于坐着状态、计时开始；
 * 2) 点「我站起来了」→ breaks+1、进入 standing、按钮变「我坐下了」；
 * 3) 站立时按钮/提示切换为休息中；
 * 4) 点「我坐下了」→ 回到 sitting、站立分钟被累计；
 * 5) 无旧文案（我起来了/刚起身）、console error 0。
 *
 * 用法：先 `npm run dev -- --port 5173`，再 `node scripts/verify-sedentary.mjs`。
 */
import { launch, sleep } from './lib/cdp.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'shots', 'sedentary-verify');
const BASE = process.env.WTSL_BASE_URL || 'http://localhost:5173';
const url = `${BASE}/plugins/sedentary/index.html?plugin=sedentary&demo=1`;
const result = { url, checks: [], consoleErrors: [] };
let cdp = null;

const snapshot = `(() => {
  const rt = JSON.parse(localStorage.getItem('sedentary.runtime') || 'null');
  const days = JSON.parse(localStorage.getItem('sedentary.days') || 'null');
  const day = days && Object.values(days).find((d) => d.date === new Date().toLocaleDateString('sv-SE'));
  const button = document.querySelector(
    '[aria-label="我站起来了"], [aria-label="我坐下了"]',
  );
  return {
    rt,
    day,
    buttonAria: button ? button.getAttribute('aria-label') : null,
    buttonText: button ? String(button.innerText || '').trim() : null,
    text: String(document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 260),
  };
})()`;

const clickButton = (label) => `(() => {
  const el = document.querySelector('[aria-label=' + JSON.stringify(${JSON.stringify(label)}) + ']');
  if (!el) return null;
  const info = { tag: el.tagName, aria: el.getAttribute('aria-label') };
  el.click();
  return info;
})()`;

try {
  cdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
  await cdp.navigate(url, { timeout: 120000 });
  const evalJS = (expr) => cdp.evaluate(expr);
  await cdp.waitFor(
    `Boolean(document.querySelector('[aria-label*="我站起来了"]'))`,
    30000,
    '独立预览未渲染「我站起来了」',
  );
  await sleep(1500);

  const sitting = await evalJS(snapshot);
  result.checks.push({
    name: '首屏：坐着状态 + 计时已开始',
    ok: sitting.rt?.posture === 'sitting' && Boolean(sitting.rt.postureSince),
    detail: `posture=${sitting.rt?.posture} since=${sitting.rt?.postureSince}`,
  });
  result.checks.push({
    name: '首屏：卡片按钮为「我站起来了」',
    ok: sitting.buttonAria?.includes('我站起来了') === true,
    detail: `${sitting.buttonAria} / ${sitting.buttonText}`,
  });
  result.checks.push({
    name: '首屏：无旧文案「我起来了」「刚起身」',
    ok: !sitting.text.includes('我起来了') && !sitting.text.includes('刚起身'),
    detail: sitting.text,
  });

  const beforeBreaks = sitting.day?.breaks ?? 0;
  const beforeStanding = sitting.day?.standingMinutes ?? 0;
  const standClick = await evalJS(clickButton('我站起来了'));
  await sleep(1500);
  const standing = await evalJS(snapshot);
  result.checks.push({
    name: '点「我站起来了」→ breaks +1、进入站立状态',
    ok:
      Boolean(standClick) &&
      (standing.day?.breaks ?? 0) === beforeBreaks + 1 &&
      standing.rt?.posture === 'standing',
    detail: `${JSON.stringify(standClick)} breaks ${beforeBreaks} -> ${standing.day?.breaks}, posture=${standing.rt?.posture}`,
  });
  result.checks.push({
    name: '站立时按钮变「我坐下了」、提示为休息中',
    ok: standing.buttonAria?.includes('我坐下了') === true && standing.text.includes('休息中'),
    detail: `${standing.buttonAria} / ${standing.text}`,
  });

  const sitClick = await evalJS(clickButton('我坐下了'));
  await sleep(1500);
  const sittingAgain = await evalJS(snapshot);
  result.checks.push({
    name: '点「我坐下了」→ 回到坐着状态',
    ok: Boolean(sitClick) && sittingAgain.rt?.posture === 'sitting',
    detail: `${JSON.stringify(sitClick)} posture=${sittingAgain.rt?.posture}`,
  });
  result.checks.push({
    name: '站立时长已累计到今日站立分钟',
    ok: (sittingAgain.day?.standingMinutes ?? 0) > beforeStanding,
    detail: `standing ${beforeStanding} -> ${sittingAgain.day?.standingMinutes}; day=${JSON.stringify(sittingAgain.day)}; rt=${JSON.stringify(sittingAgain.rt)}`,
  });
  result.checks.push({
    name: '坐下后按钮重新变回「我站起来了」',
    ok: sittingAgain.buttonAria?.includes('我站起来了') === true,
    detail: sittingAgain.buttonAria,
  });

  result.consoleErrors = await evalJS(`window.__wtslErrors || []`);
  result.checks.push({
    name: 'console error = 0',
    ok: result.consoleErrors.length === 0,
    detail: JSON.stringify(result.consoleErrors),
  });
} catch (error) {
  result.checks.push({ name: '脚本执行', ok: false, detail: String(error?.message || error) });
} finally {
  try {
    await cdp?.screenshot(join(OUT, 'sedentary-cycle.png'));
  } catch {
    /* ignore */
  }
  try {
    await cdp?.close();
  } catch {
    /* ignore */
  }
}

const failed = result.checks.filter((item) => !item.ok);
writeFileSync(join(OUT, 'result.json'), JSON.stringify(result, null, 2));
for (const check of result.checks) {
  console.log(`[${check.ok ? 'PASS' : 'FAIL'}] ${check.name}${check.detail ? ' — ' + check.detail : ''}`);
}
console.log(failed.length === 0 ? 'ALL PASS' : `${failed.length} FAIL`);
process.exitCode = failed.length === 0 ? 0 : 1;

