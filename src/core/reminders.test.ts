import { describe, expect, it } from 'vitest';
import { isWithinReminderWindow } from './reminders';

// 2026-06-24 is a Wednesday (day 3).
const wed = (hour: number) => new Date(2026, 5, 24, hour, 0, 0);
const sun = (hour: number) => new Date(2026, 5, 28, hour, 0, 0); // Sunday (day 0)

const weekdays = { days: [1, 2, 3, 4, 5], startHour: 8, endHour: 18 };

describe('isWithinReminderWindow', () => {
  it('is true inside the active day and hour range', () => {
    expect(isWithinReminderWindow(wed(9), weekdays)).toBe(true);
  });

  it('is false before the start hour and at/after the end hour', () => {
    expect(isWithinReminderWindow(wed(7), weekdays)).toBe(false);
    expect(isWithinReminderWindow(wed(18), weekdays)).toBe(false);
  });

  it('is false on an inactive day', () => {
    expect(isWithinReminderWindow(sun(9), weekdays)).toBe(false);
  });
});
