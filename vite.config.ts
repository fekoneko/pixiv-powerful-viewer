import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { patchKuromoji } from './plugins/vite-plugin-patch-kuromoji';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), patchKuromoji()],
  resolve: {
    alias: {
      '@': resolve('src'),
      kuromoji: resolve('patched_modules/kuromoji.js'),
    },
  },
  build: { chunkSizeWarningLimit: 1024 },

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: { ignored: ['**/src-tauri/**'] },
  },
}));
