// Base for view components. It standardizes two things that every component
// previously improvised: how signal subscriptions are made (`listen`, tracked
// so a component can be torn down in isolation — e.g. in tests — even though
// the app keeps its components alive for the whole session), and the naming
// convention that a component's full-render entry point is called `render()`
// (narrower repaints keep their own private names). `render` is not abstract:
// orchestrators (e.g. CheckinController) legitimately have no full render.
import type { ReadonlySignal } from '../../state/signal';

export abstract class Component {
  readonly #unsubs: (() => void)[] = [];

  /** Subscribe to a signal, tracked for `destroy()`. */
  protected listen<T>(sig: ReadonlySignal<T>, handler: (value: T) => void): void {
    this.#unsubs.push(sig.subscribe(handler));
  }

  /** Remove all tracked subscriptions. */
  destroy(): void {
    for (const unsub of this.#unsubs.splice(0)) unsub();
  }
}
