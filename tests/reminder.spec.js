// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectSettings,
  createTestSettings,
  getLocalStorageSettings,
  navigateToTab,
} = require('./fixtures/helpers');

// ─── Reminder: section hidden when Notification API unsupported ───

test('Reminder section hidden when Notification API is unavailable', async ({ page }) => {
  // Remove the Notification API before page loads
  await page.addInitScript(() => {
    delete window.Notification;
  });
  await page.goto('/#settings');

  const section = page.locator('#reminder-section');
  // reminder.js sets display:none via inline style when unsupported
  await expect(section).toHaveCSS('display', 'none');
});

// ─── Reminder: settings form loads default values ───

test('Reminder settings form shows defaults (disabled, 120 min, Mon-Fri, 8-18)', async ({ page }) => {
  await page.goto('/#settings');

  const enabled = page.locator('#cfg-reminder-enabled');
  await expect(enabled).not.toBeChecked();

  const interval = page.locator('#cfg-reminder-interval');
  await expect(interval).toHaveValue('120');

  const startHour = page.locator('#cfg-reminder-start');
  await expect(startHour).toHaveValue('8');

  const endHour = page.locator('#cfg-reminder-end');
  await expect(endHour).toHaveValue('18');

  // Mon-Fri checked, Sat-Sun unchecked
  for (const day of [1, 2, 3, 4, 5]) {
    await expect(page.locator(`[data-reminder-day="${day}"]`)).toBeChecked();
  }
  for (const day of [0, 6]) {
    await expect(page.locator(`[data-reminder-day="${day}"]`)).not.toBeChecked();
  }
});

// ─── Reminder: custom settings persist after save ───

test('Reminder settings persist after save and reload', async ({ page }) => {
  const settings = createTestSettings({
    reminderEnabled: true,
    reminderInterval: 60,
    reminderDays: [1, 3, 5],
    reminderStartHour: 9,
    reminderEndHour: 17,
    reminderCustomTitle: 'Break time',
    reminderCustomBody: 'Take a walk',
  });
  await injectSettings(page, settings);
  await page.goto('/#settings');

  // Verify form is populated from injected settings
  await expect(page.locator('#cfg-reminder-enabled')).toBeChecked();
  await expect(page.locator('#cfg-reminder-interval')).toHaveValue('60');
  await expect(page.locator('#cfg-reminder-start')).toHaveValue('9');
  await expect(page.locator('#cfg-reminder-end')).toHaveValue('17');
  await expect(page.locator('#cfg-reminder-title')).toHaveValue('Break time');
  await expect(page.locator('#cfg-reminder-body')).toHaveValue('Take a walk');

  // Mon, Wed, Fri checked; Tue, Thu unchecked
  await expect(page.locator('[data-reminder-day="1"]')).toBeChecked();
  await expect(page.locator('[data-reminder-day="2"]')).not.toBeChecked();
  await expect(page.locator('[data-reminder-day="3"]')).toBeChecked();
  await expect(page.locator('[data-reminder-day="5"]')).toBeChecked();
});

// ─── Reminder: saves enabled state to localStorage ───

test('Saving settings with reminder enabled persists to localStorage', async ({ page }) => {
  await page.goto('/#settings');

  // Enable reminder via the label (checkbox is hidden by toggle switch CSS)
  await page.locator('label[for="cfg-reminder-enabled"]').click();
  await page.locator('#cfg-reminder-interval').fill('30');

  // Save
  await page.locator('#cfg-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  // Verify localStorage
  const saved = await getLocalStorageSettings(page);
  expect(saved.reminderEnabled).toBe(true);
  expect(saved.reminderInterval).toBe(30);
});

// ─── Reminder: test notification button (permission granted) ───

test('Test notification button sends notification when permission granted', async ({ page }) => {
  // Mock Notification API with permission = granted
  await page.addInitScript(() => {
    window.__notificationsSent = [];
    class MockNotification {
      constructor(title, opts) {
        window.__notificationsSent.push({ title, ...opts });
      }
      close() {}
    }
    MockNotification.permission = 'granted';
    MockNotification.requestPermission = function (cb) {
      if (cb) cb('granted');
      return Promise.resolve('granted');
    };
    window.Notification = MockNotification;
  });

  await page.goto('/#settings');

  // Click the test notification button
  await page.locator('#cfg-reminder-test').click();

  // Verify a notification was created
  const notifications = await page.evaluate(() => window.__notificationsSent);
  expect(notifications.length).toBeGreaterThan(0);
  expect(notifications[0].title).toBeTruthy();
});

// ─── Reminder: denied permission shows warning banner ───

test('Test notification button shows warning when permission denied', async ({ page }) => {
  // Mock Notification API with permission = denied
  await page.addInitScript(() => {
    class MockNotification {
      constructor() {}
      close() {}
    }
    MockNotification.permission = 'denied';
    MockNotification.requestPermission = function (cb) {
      if (cb) cb('denied');
      return Promise.resolve('denied');
    };
    window.Notification = MockNotification;
  });

  const settings = createTestSettings({ reminderEnabled: true });
  await injectSettings(page, settings);
  await page.goto('/#settings');

  // Click test button — should show warning toast
  await page.locator('#cfg-reminder-test').click();
  await expect(page.locator('.toast--warning').first()).toBeVisible();
});

// ─── Reminder: interval timer starts when enabled with granted permission ───

test('Reminder interval timer starts when settings enable it with granted permission', async ({ page }) => {
  // Mock Notification API with permission granted + track intervals
  await page.addInitScript(() => {
    window.__intervalsSet = [];
    const origSetInterval = window.setInterval;
    window.setInterval = function (fn, ms) {
      window.__intervalsSet.push({ ms });
      return origSetInterval(fn, ms);
    };

    window.__notificationsSent = [];
    class MockNotification {
      constructor(title, opts) {
        window.__notificationsSent.push({ title, ...opts });
      }
      close() {}
    }
    MockNotification.permission = 'granted';
    MockNotification.requestPermission = function (cb) {
      if (cb) cb('granted');
      return Promise.resolve('granted');
    };
    window.Notification = MockNotification;
  });

  const settings = createTestSettings({
    reminderEnabled: true,
    reminderInterval: 60,
  });
  await injectSettings(page, settings);
  await page.goto('/');

  // Verify that setInterval was called with the correct interval (60 min = 3600000 ms)
  const intervals = await page.evaluate(() => window.__intervalsSet);
  const reminderInterval = intervals.find(i => i.ms === 60 * 60 * 1000);
  expect(reminderInterval).toBeTruthy();
});
