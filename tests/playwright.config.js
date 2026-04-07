// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const collectCoverage = process.env.COVERAGE === '1';

const defaultProjects = [
  {
    name: 'chromium',
    use: { browserName: 'chromium' },
  },
  {
    name: 'mobile-chrome',
    use: { ...devices['Pixel 7'] },
  },
];

const coverageProjects = [
  {
    name: 'chromium-coverage',
    use: { browserName: 'chromium' },
    testMatch: '*.spec.js',
  },
];

module.exports = defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: collectCoverage
    ? [['monocart-reporter', {
        name: 'Mindful Check-in Coverage Report',
        outputFile: 'coverage/report.html',
        coverage: {
          reports: ['v8', 'console-details'],
          entryFilter: (entry) => entry.url.includes('/js/') || entry.url.includes('/translations.js'),
          sourceFilter: (sourcePath) => sourcePath.includes('/js/') || sourcePath.includes('translations.js'),
        },
      }]]
    : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    launchOptions: {
      slowMo: parseInt(process.env.SLOW_MO, 10) || 0,
    },
  },
  projects: collectCoverage ? coverageProjects : defaultProjects,
  webServer: {
    command: 'npx serve .. -p 3000 -s --no-clipboard',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
