import { defineConfig, type Plugin } from 'vite';

/**
 * Make the built bundle runnable by double-clicking dist/index.html (file://).
 * ES-module scripts are fetched and blocked by CORS on file://, so we emit a
 * single classic IIFE script. We turn `type="module"` into `defer` (same
 * "run after the DOM is parsed" timing, no CORS) and drop `crossorigin`.
 */
function classicScript(): Plugin {
  return {
    name: 'classic-script',
    apply: 'build', // dev must keep native ESM (type="module"); only rewrite the built HTML
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(/\s+type="module"/g, ' defer').replace(/\s+crossorigin/g, '');
    },
  };
}

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    modulePreload: false,
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'app.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  plugins: [classicScript()],
});
