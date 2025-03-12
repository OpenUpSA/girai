import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    copyPublicDir: false,
    rollupOptions: {
      input: 'index.html',
      output: {
        entryFileNames: 'chat.js',
        format: 'iife',
        assetFileNames: '[name].[ext]',
        dir: '../public/'
      },
    },
    outDir: 'dist',
  },
  server: {
    open: '/index.html'
  }
});
