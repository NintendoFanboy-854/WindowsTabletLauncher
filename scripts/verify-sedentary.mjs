/**
 * 久坐修复的聚焦验证（独立预览页，不经宿主）：用前后差值断言（demo=1 会注入演示数据）。
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
  return { rt, day, text: String(document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 240) };
})()`;
try {
  cdp = await launch({ width: 1440, height: 960, scheme: 'dark' });
  await cdp.navigate(url, { timeout: 120000 });
  const evalJS = (expr) => cdp.evaluate(expr);
  await cdp.waitFor(`Boolean(document.querySelector('[aria-label="我起来了，记录一次起身"]'))`, 30000, '独立预览未渲染「我起来了」');
  await sleep(1500);
  const first = await evalJS(snapshot);
  result.checks.push({ name: '首屏 tick 开始计时（sittingSince 非空）', ok: Boolean(first.rt && first.rt.sittingSince), detail: first.text });
  result.checks.push({ name: '首屏没有「刚起身，计时未开始」', ok: !first.text.includes('刚起身，计时未开始'), detail: first.text });

  const beforeSince = first.rt?.sittingSince;
  const beforeBreaks = first.day?.breaks ?? 0;
  const clicked = await evalJS(`(() => {
    const el = document.querySelector('[aria-label="我起来了，记录一次起身"]');
    if (!el) return null;
    const info = { tag: el.tagName, disabled: el.disabled === true, aria: el.getAttribute('aria-label') };
    el.click();
    return info;
  })()`);
  await sleep(1500);
  const cmd = await evalJS(`localStorage.getItem('sedentary.command')`);
  const after = await evalJS(snapshot);
  const afterBreaks = after.day?.breaks ?? 0;
  result.checks.push({ name: '诊断：点击元素 / command / runtime.commandId', ok: Boolean(clicked), detail: `${JSON.stringify(clicked)} cmd=${String(cmd).slice(0, 140)} runtimeId=${after.rt?.commandId} text=${after.text}` });
  result.checks.push({ name: '点「我起来了」后 breaks +1', ok: afterBreaks === beforeBreaks + 1, detail: `${beforeBreaks} -> ${afterBreaks}` });
  result.checks.push({
    name: '点「我起来了」后 sittingSince 立即重置为新起点',
    ok: Boolean(after.rt?.sittingSince) && after.rt.sittingSince !== beforeSince && Date.now() - new Date(after.rt.sittingSince).getTime() < 8000,
    detail: `${beforeSince} -> ${after.rt?.sittingSince}`,
  });
  result.checks.push({ name: '计时仍显示 0~1 分钟（从 0 继续）', ok: /0 分钟|1 分钟/.test(after.text), detail: after.text });
  result.consoleErrors = await evalJS(`window.__wtslErrors || []`);
  result.checks.push({ name: 'console error = 0', ok: result.consoleErrors.length === 0, detail: JSON.stringify(result.consoleErrors) });
} catch (error) {
  result.checks.push({ name: '脚本执行', ok: false, detail: String(error?.message || error) });
} finally {
  try { await cdp?.screenshot(join(OUT, 'sedentary-fix.png')); } catch { /* ignore */ }
  try { await cdp?.close(); } catch { /* ignore */ }
}
const failed = result.checks.filter((item) => !item.ok);
writeFileSync(join(OUT, 'result.json'), JSON.stringify(result, null, 2));
for (const check of result.checks) console.log(`[${check.ok ? 'PASS' : 'FAIL'}] ${check.name}${check.detail ? ' — ' + check.detail : ''}`);
console.log(failed.length === 0 ? 'ALL PASS' : `${failed.length} FAIL`);
process.exitCode = failed.length === 0 ? 0 : 1;


