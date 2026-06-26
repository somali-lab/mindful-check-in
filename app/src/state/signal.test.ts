import { describe, expect, it, vi } from 'vitest';
import { signal } from './signal';

describe('signal', () => {
  it('holds and updates a value', () => {
    const s = signal(1);
    expect(s.get()).toBe(1);
    s.set(2);
    expect(s.get()).toBe(2);
  });

  it('supports functional updates', () => {
    const s = signal(10);
    s.set((prev) => prev + 5);
    expect(s.get()).toBe(15);
  });

  it('notifies subscribers on change and stops after unsubscribe', () => {
    const s = signal('a');
    const fn = vi.fn();
    const off = s.subscribe(fn);
    s.set('b');
    expect(fn).toHaveBeenCalledWith('b');
    off();
    s.set('c');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not notify when the value is unchanged (Object.is)', () => {
    const s = signal(0);
    const fn = vi.fn();
    s.subscribe(fn);
    s.set(0);
    expect(fn).not.toHaveBeenCalled();
  });

  it('is safe when a subscriber unsubscribes another mid-emit', () => {
    const s = signal('a');
    const calls: string[] = [];
    let offB = (): void => {};
    s.subscribe(() => {
      calls.push('A');
      offB(); // remove B while A is being notified
    });
    offB = s.subscribe(() => calls.push('B'));
    const c = vi.fn();
    s.subscribe(() => c());
    s.set('b');
    // The notify loop isn't corrupted: A fires and the later C still fires.
    expect(calls).toContain('A');
    expect(c).toHaveBeenCalledTimes(1);
  });

  it('keeps the final value when a subscriber re-enters set()', () => {
    const s = signal(0);
    s.subscribe((v) => {
      if (v === 1) s.set(2); // re-entrant set during notification
    });
    s.set(1);
    expect(s.get()).toBe(2);
  });
});
