/**
 * 天气插件前端打包脚本（只在插件开发时手动运行）。
 *
 * 插件页面是 public/ 下的静态 iframe 页面，不能像 src/ 那样由 Vite 自动处理，
 * 因此这里用 Vite 的 JS API 把 src/main.jsx + Fluent UI React v9 打成一个
 * 自包含的 ES module（app/app.js），产物随 public/ 一起进 git，运行时不依赖构建。
 *
 * 用法（仓库根目录）：
 *   & 'C:\Program Files\nodejs\node.exe' public/plugins/weather/build.mjs
 */
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));

await build({
  root: dir,
  configFile: false,
  base: './',
  plugins: [react()],
  publicDir: false,
  // lib 模式下 Vite 不会自动替换 React/Griffel 里的 process.env.NODE_ENV
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  logLevel: 'info',
  build: {
    outDir: 'app',
    emptyOutDir: true,
    lib: {
      entry: join(dir, 'src/main.jsx'),
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

console.log('[weather] 打包完成 → public/plugins/weather/app/app.js');
