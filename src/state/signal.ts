// Minimal reactive primitive — the building block of the app's single source of
// truth. No dependencies; ~30 lines. A signal holds a value, notifies subscribers
// on change, and skips notification when the value is unchanged (Object.is).

type Listener<T> = (value: T) => void;

export interface ReadonlySignal<T> {
  get(): T;
  subscribe(listener: Listener<T>): () => void;
}

export interface Signal<T> extends ReadonlySignal<T> {
  set(next: T | ((prev: T) => T)): void;
}

export function signal<T>(initial: T): Signal<T> {
  let value = initial;
  const listeners = new Set<Listener<T>>();

  return {
    get: () => value,
    set(next) {
      const v = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
      if (Object.is(v, value)) return;
      value = v;
      for (const listener of [...listeners]) listener(value);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
