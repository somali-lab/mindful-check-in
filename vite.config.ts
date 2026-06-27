import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

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
  // Unit tests are the colocated src/**/*.test.ts; the Playwright E2E specs live
  // under tests/ and must NOT be picked up by Vitest.
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Coverage reflects the layers Vitest owns (functional core + infra/state/
      // i18n logic). The ui/ shell is verified by Playwright E2E, and pure
      // type/data modules have nothing to execute — both are out of scope here.
      include: ['src/core/**', 'src/infra/**', 'src/state/**', 'src/i18n/**'],
      exclude: ['**/*.test.ts', 'src/core/types.ts', 'src/i18n/translations.ts'],
      // Known Vitest quirk: a file imported ONLY by its own colocated test
      // (color.ts, reminders.ts, signal.ts here) falls through the reporter and
      // is omitted, even though its spec runs. Those three ARE covered, so the
      // headline % is a floor. Everything else reports normally, including the
      // genuine 0% gaps (notifications.ts, load-request.ts).
    },
  },
});
