// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const { openSettingsTab, injectSettings, createTestSettings, getLocalStorageSettings } = require('./fixtures/helpers');

// The break-reminders settings panel (Web Notifications feature). We exercise
// the settings form persistence/hydration; the actual notification firing
// depends on browser permission/timers and is out of scope for E2E.

test.describe('Break reminders settings', () => {
  test('reminder settings save and persist to localStorage', async ({ page }) => {
    // Grant notifications so enabling reminders doesn't surface a permission banner
    await page.context().grantPermissions(['notifications']);
    await page.goto('/');
    await openSettingsTab(page, 'reminders');

    // The native checkboxes are visually replaced by styled toggles; click the
    // labels (which forward to the control) rather than the hidden inputs.
    await page.locator('label[for="cfg-reminder-enabled"]').click();
    await expect(page.locator('#cfg-reminder-enabled')).toBeChecked();

    await page.locator('#cfg-reminder-interval').fill('90');
    await page.locator('#cfg-reminder-start').fill('9');
    await page.locator('#cfg-reminder-end').fill('17');
    await page.locator('#cfg-reminder-title').fill('Stretch break');
    await page.locator('#cfg-reminder-body').fill('Stand up and stretch.');

    // Default days are Mon-Fri; toggle Monday off via its label.
    await page.locator('label.reminder-day-btn:has([data-reminder-day="1"])').click();

    await page.locator('#cfg-btn-save').click();

    const s = await getLocalStorageSettings(page);
    expect(s.reminderEnabled).toBe(true);
    expect(s.reminderInterval).toBe(90);
    expect(s.reminderStartHour).toBe(9);
    expect(s.reminderEndHour).toBe(17);
    expect(s.reminderCustomTitle).toBe('Stretch break');
    expect(s.reminderCustomBody).toBe('Stand up and stretch.');
    expect(s.reminderDays).not.toContain(1); // Monday was toggled off
  });

  test('saved reminder settings hydrate the form on load', async ({ page }) => {
    await injectSettings(page, createTestSettings({
      reminderEnabled: true,
      reminderInterval: 45,
      reminderDays: [2, 4],
    }));
    await page.goto('/');
    await openSettingsTab(page, 'reminders');

    await expect(page.locator('#cfg-reminder-enabled')).toBeChecked();
    await expect(page.locator('#cfg-reminder-interval')).toHaveValue('45');
    await expect(page.locator('[data-reminder-day="2"]')).toBeChecked();
    await expect(page.locator('[data-reminder-day="4"]')).toBeChecked();
    await expect(page.locator('[data-reminder-day="1"]')).not.toBeChecked();
  });
});
