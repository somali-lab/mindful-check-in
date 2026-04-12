// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestEntry,
  createTestSettings,
  getLocalStorageEntries,
  getTodayKey,
} = require('./fixtures/helpers');

// ─── T011: ACT wheel — select emotion and verify highlight ───

test('T011 [US2] ACT wheel — click joy segment highlights and shows display', async ({ page }) => {
  await page.goto('/#checkin');
  await page.locator('.emotion-segment[data-em="joy"]').click();
  await expect(page.locator('.emotion-segment[data-em="joy"]')).toHaveClass(/is-selected/);
  const display = page.locator('#wheel-display');
  await expect(display).not.toHaveClass(/is-empty/);
  await expect(display).toContainText(/joy/i);
});

// ─── T012: Select emotion then reset clears selection ───

test('T012 [US2] reset clears emotion selection and display', async ({ page }) => {
  await page.goto('/#checkin');
  await page.locator('.emotion-segment[data-em="joy"]').click();
  await expect(page.locator('#wheel-display')).not.toHaveClass(/is-empty/);

  await page.locator('#whl-btn-reset').click();
  await expect(page.locator('#wheel-display')).toHaveClass(/is-empty/);
  // No segment should be selected
  const selectedSegments = page.locator('.emotion-segment.is-selected');
  await expect(selectedSegments).toHaveCount(0);
});

// ─── T013: Switch wheel types — verify segment count changes ───

test('T013 [US2] switch from Ekman (6) to Extended (12) redraws wheel', async ({ page }) => {
  await page.goto('/#checkin');

  // Switch to Ekman
  await page.locator('#sel-wheel').selectOption('ekman');
  await expect(page.locator('.emotion-segment')).toHaveCount(6);

  // Select an emotion on Ekman
  await page.locator('.emotion-segment[data-em="joy"]').click();
  await expect(page.locator('.emotion-segment[data-em="joy"]')).toHaveClass(/is-selected/);

  // Switch to Extended
  await page.locator('#sel-wheel').selectOption('extended');
  await expect(page.locator('.emotion-segment')).toHaveCount(12);

  // Selection should not carry over (the wheel redraws)
  const selectedSegments = page.locator('.emotion-segment.is-selected');
  await expect(selectedSegments).toHaveCount(0);
});

// ─── T014: Load saved entry with specific wheel type ───

test('T014 [US2] inject entry with plutchik wheel and trust emotion, verify on load', async ({ page }) => {
  const todayKey = getTodayKey();
  const entry = createTestEntry({
    wheelType: 'plutchik',
    coreFeeling: 'trust',
  });

  await injectEntries(page, { [todayKey]: entry });
  await page.addInitScript(() => {
    localStorage.setItem('moodTrackerWheelType', 'plutchik');
  });
  await page.goto('/#checkin');

  // Verify wheel type switched to Plutchik
  await expect(page.locator('#sel-wheel')).toHaveValue('plutchik');
  // Verify 8 segments (Plutchik has 8)
  await expect(page.locator('.emotion-segment')).toHaveCount(8);
  // Verify trust is highlighted
  await expect(page.locator('.emotion-segment[data-em="trust"]')).toHaveClass(/is-selected/);
});

// ─── T015: Parameterized test for all 5 wheel variants ───

const wheelVariants = [
  { type: 'act', emotions: ['joy', 'serenity', 'love', 'acceptance', 'sadness', 'melancholy', 'anger', 'aggression'], count: 8 },
  { type: 'plutchik', emotions: ['joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation'], count: 8 },
  { type: 'ekman', emotions: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'], count: 6 },
  { type: 'junto', emotions: ['love', 'joy', 'surprise', 'anger', 'sadness', 'fear'], count: 6 },
  { type: 'extended', emotions: ['joy', 'love', 'trust', 'surprise', 'curiosity', 'anticipation', 'anxiety', 'fear', 'sadness', 'disgust', 'anger', 'shame'], count: 12 },
];

for (const variant of wheelVariants) {
  test(`T015 [US2] ${variant.type} wheel — renders ${variant.count} segments and each selects correctly`, async ({ page }) => {
    await page.goto('/#checkin');
    await page.locator('#sel-wheel').selectOption(variant.type);
    await expect(page.locator('.emotion-segment')).toHaveCount(variant.count);

    // Click each segment and verify selection
    for (const emotion of variant.emotions) {
      await page.locator(`.emotion-segment[data-em="${emotion}"]`).click();
      await expect(page.locator(`.emotion-segment[data-em="${emotion}"]`)).toHaveClass(/is-selected/);
      const display = page.locator('#wheel-display');
      await expect(display).not.toHaveClass(/is-empty/);
    }
  });
}
