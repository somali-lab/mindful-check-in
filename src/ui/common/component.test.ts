import { describe, expect, it } from 'vitest';
import { signal } from '../../state/signal';
import { Component } from './component';

class Probe extends Component {
  seen: number[] = [];
  constructor(sig: ReturnType<typeof signal<number>>) {
    super();
    this.listen(sig, (v) => this.seen.push(v));
  }
}

describe('Component', () => {
  it('listen() subscribes and destroy() tears every subscription down', () => {
    const sig = signal(0);
    const probe = new Probe(sig);

    sig.set(1);
    sig.set(2);
    expect(probe.seen).toEqual([1, 2]);

    probe.destroy();
    sig.set(3);
    expect(probe.seen).toEqual([1, 2]);
  });

  it('destroy() is idempotent', () => {
    const sig = signal(0);
    const probe = new Probe(sig);
    probe.destroy();
    probe.destroy();
    sig.set(1);
    expect(probe.seen).toEqual([]);
  });
});
