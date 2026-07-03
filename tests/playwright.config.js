// @ts-check
const path = require('node:path');
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // ubuntu-latest runners have 4 vCPUs; the suite is fully parallel-safe
  // (each test gets its own browser context against the shared Vite server).
  workers: process.env.CI ? 4 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    launchOptions: {
      slowMo: parseInt(process.env.SLOW_MO, 10) || 0,
    },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  // Serve the app (Vite dev) from the repo root on the fixed test port. The
  // double-clickable file:// build is verified separately by the build smoke test.
  webServer: {
    command: 'npx vite --port 3000 --strictPort',
    cwd: path.resolve(__dirname, '..'),
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
