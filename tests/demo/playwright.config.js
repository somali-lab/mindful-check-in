// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 180_000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: false,
    viewport: { width: 1280, height: 900 },
    launchOptions: {
      slowMo: 50,
    },
  },
  projects: [
    {
      name: 'demo',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npx serve .. -p 3000 -s --no-clipboard',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 15000,
  },
});
