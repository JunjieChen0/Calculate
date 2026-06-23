import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'renderer'),
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'renderer/index.html'),
        web: resolve(__dirname, 'renderer/index-web.html'),
        test: resolve(__dirname, 'renderer/test-android.html')
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    include: ['mathjs', 'katex']
  }
});
