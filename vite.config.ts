import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

/**
 * Additionally emit dist/mindful-check-in.html: the entire app in ONE file
 * (script, styles, fonts, logos and favicon inlined as data: URIs) so it can
 * be copied or mailed as a single document. The regular multi-file dist stays
 * the canonical build. Runs after everything is on disk (writeBundle), so it
 * simply recombines the finished artifacts.
 */
function singleFileBundle(): Plugin {
  const MIME: Record<string, string> = {
    '.woff2': 'font/woff2',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  };
  const dataUri = (buf: Buffer, ext: string): string =>
    `data:${MIME[ext]};base64,${buf.toString('base64')}`;

  return {
    name: 'single-file-bundle',
    apply: 'build',
    enforce: 'post',
    writeBundle() {
      // The build always runs from the repo root (npm script), so cwd-relative.
      const dist = resolve('dist');
      const js = readFileSync(resolve(dist, 'app.js'), 'utf8');
      const favicon = readFileSync(resolve(dist, 'favicon.svg'));

      // Inline every url(...) the stylesheet references: ../assets/… are
      // public files (logos), ./… are emitted assets next to the CSS (fonts).
      const css = readFileSync(resolve(dist, 'assets/style.css'), 'utf8').replace(
        /url\((\.\.?\/[^)]+)\)/g,
        (match: string, rel: string) => {
          const ext = rel.slice(rel.lastIndexOf('.'));
          if (!MIME[ext]) return match;
          const file = rel.startsWith('../')
            ? resolve(dist, rel.slice(3))
            : resolve(dist, 'assets', rel);
          return `url(${dataUri(readFileSync(file), ext)})`;
        },
      );

      const html = readFileSync(resolve(dist, 'index.html'), 'utf8')
        // Drop the external script tag; the code is re-added before </body>
        // so it keeps its "after the DOM is parsed" timing without defer.
        .replace(/<script[^>]*src="\.\/app\.js"[^>]*><\/script>/, '')
        .replace(/<link rel="stylesheet"[^>]*href="\.\/assets\/style\.css"[^>]*>/, () => {
          return `<style>\n${css}\n</style>`;
        })
        .replace(/href="\.\/favicon\.svg"/, () => `href="${dataUri(favicon, '.svg')}"`)
        .replace('</body>', () => `<script>\n${js}\n</script>\n</body>`);

      writeFileSync(resolve(dist, 'mindful-check-in.html'), html);
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
  plugins: [classicScript(), singleFileBundle()],
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
