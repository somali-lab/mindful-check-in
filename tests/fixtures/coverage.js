// Coverage collection fixture for Playwright + monocart-reporter
// Automatically collects V8 JS coverage when COVERAGE=1
// Extends base fixture (auto-mocks weather APIs)
// @ts-check
const { test: base, expect } = require('./base');
const { addCoverageReport } = require('monocart-reporter');

const test = base.extend({
  autoCollectCoverage: [async ({ page }, use) => {
    await page.coverage.startJSCoverage({ resetOnNavigation: false });

    await use();

    const jsCoverage = await page.coverage.stopJSCoverage();
    await addCoverageReport(jsCoverage, test.info());
  }, { scope: 'test', auto: true }],
});

module.exports = { test, expect };
