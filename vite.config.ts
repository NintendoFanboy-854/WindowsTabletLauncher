import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    // 证据截图（shots，gitignored，体量大）与 Rust 构建产物不参与 HMR：
    // 否则 dev server 闲置时也会因监听到的大目录反复触发扫描/重建，白占 CPU。
    watch: {
      ignored: ['**/shots/**', '**/dist/**', '**/src-tauri/target/**'],
    },
  },
  build: {
    target: 'chrome120',
    outDir: 'dist',
    emptyOutDir: true,
  },
});
