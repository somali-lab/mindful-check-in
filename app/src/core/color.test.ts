import { describe, expect, it } from 'vitest';
import { hasLightBackground } from './color';

describe('hasLightBackground', () => {
  it('applies a luminance threshold and rejects bad input', () => {
    expect(hasLightBackground('#ffffff')).toBe(true);
    expect(hasLightBackground('#000000')).toBe(false);
    expect(hasLightBackground('not-a-hex')).toBe(false);
  });
});
