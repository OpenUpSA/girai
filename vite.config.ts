import { defineConfig } from 'vite';

const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html: string) {
      return html.replace(
        /<title>(.*?)<\/title>/,
        `<title>Title replaced!</title>`,
      )
    },
  }
};

export default defineConfig({
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: './public/demo.html', // Include demo.html in the build
      output: {
        entryFileNames: 'chat.js', // Output chat.js in the dist directory
        format: 'iife', // This format will work well with <script> tags
        assetFileNames: '[name].[ext]',
        dir: 'dist'
      },
    },
    outDir: 'dist', // Output directory for production build
  },
  server: {
    open: '/demo.html'
  },
  plugins: [
    htmlPlugin()
  ]
});
