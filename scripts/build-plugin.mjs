/**
 * 插件前端打包脚本（所有 React 插件共用，DECISIONS.md D-02b）。
 *
 * 插件页面是 public/ 下的静态 iframe 页面，不由 src/ 的 Vite 流程处理，
 * 因此这里用 Vite 的 JS API 把 public/plugins/<id>/src/main.jsx + Fluent UI React
 * 打成一个自包含 ES module（app/app.js），产物随 public/ 一起进 git，运行时不依赖构建。
 *
 * 用法（仓库根目录）：
 *   node scripts/build-plugin.mjs clock
 *   node scripts/build-plugin.mjs todo
 *   node scripts/build-plugin.mjs --all        # 构建 public/plugins 下所有带 src/main.jsx 的插件
 *
 * 约定（新插件照抄）：
 *   public/plugins/<id>/index.html     <div id="root"></div> + <script type="module" src="./app/app.js">
 *   public/plugins/<id>/src/main.jsx   React 入口（先 startHostCapture() 再 createRoot）
 *   public/plugins/<id>/app/app.js     构建产物（提交进 git）
 *   plugin-sdk.js 由宿主静态提供，不打进 bundle（external）
 */
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pluginsRoot = join(repoRoot, 'public', 'plugins');

/** 共享脚手架目录，不是插件（不参与构建） */
const NON_PLUGIN_DIRS = new Set(['_shared']);

function pluginSrcEntry(pluginId) {
  return join(pluginsRoot, pluginId, 'src', 'main.jsx');
}

function discoverReactPlugins() {
  return readdirSync(pluginsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !NON_PLUGIN_DIRS.has(entry.name))
    .map((entry) => entry.name)
    .filter((id) => existsSync(pluginSrcEntry(id)))
    .sort();
}

async function buildPlugin(pluginId) {
  const dir = join(pluginsRoot, pluginId);
  const entry = pluginSrcEntry(pluginId);
  if (!existsSync(entry)) {
    throw new Error(`[${pluginId}] 找不到 React 入口：${entry}`);
  }

  await build({
    root: dir,
    configFile: false,
    base: './',
    plugins: [react()],
    publicDir: false,
    // lib 模式下 Vite 不会自动替换 React/Griffel 里的 process.env.NODE_ENV
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    logLevel: 'warn',
    build: {
      outDir: 'app',
      emptyOutDir: true,
      lib: {
        entry,
        formats: ['es'],
        fileName: () => 'app.js',
      },
      rollupOptions: {
        // 插件 SDK 由宿主页面以静态文件提供，不打进 bundle
        external: (id) => id === '/plugin-sdk.js',
      },
      minify: true,
      target: 'chrome120',
    },
  });

  const appPath = join(dir, 'app', 'app.js');
  const bytes = readFileSync(appPath).length;
  console.log(`[${pluginId}] 打包完成 → public/plugins/${pluginId}/app/app.js (${(bytes / 1024).toFixed(0)} KB)`);
  return appPath;
}

export { buildPlugin, discoverReactPlugins };

// 作为 CLI 直接运行（被 import 时 process.argv[1] 不是本文件）
const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isCli) {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  const all = process.argv.includes('--all');
  const ids = all ? discoverReactPlugins() : args;

  if (ids.length === 0) {
    console.error('用法: node scripts/build-plugin.mjs <pluginId> [<pluginId>...] | --all');
    process.exit(1);
  }

  for (const id of ids) {
    try {
      await buildPlugin(id);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}
