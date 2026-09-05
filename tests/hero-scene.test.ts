import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dampRotation, readCssColor, initHeroScene } from '../src/lib/hero-scene';

describe('dampRotation', () => {
  it('moves partway toward the target by the smoothing factor', () => {
    expect(dampRotation(0, 10, 0.1)).toBeCloseTo(1);
  });

  it('returns the current value unchanged when already at the target', () => {
    expect(dampRotation(5, 5, 0.5)).toBe(5);
  });

  it('moves the full distance when smoothing is 1', () => {
    expect(dampRotation(0, 8, 1)).toBe(8);
  });

  it('does not move at all when smoothing is 0', () => {
    expect(dampRotation(3, 9, 0)).toBe(3);
  });

  it('works with negative targets', () => {
    expect(dampRotation(0, -10, 0.1)).toBeCloseTo(-1);
  });
});

describe('readCssColor', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('reads a set custom property from :root', () => {
    document.documentElement.style.setProperty('--test-color', '#123456');
    expect(readCssColor('--test-color', '#fallback')).toBe('#123456');
  });

  it('returns the fallback when the property is unset', () => {
    expect(readCssColor('--does-not-exist', '#fallback')).toBe('#fallback');
  });
});

describe('initHeroScene', () => {
  beforeEach(() => {
    // jsdom doesn't implement matchMedia at all; stub it "not reduced" by
    // default so tests reach the WebGL check being exercised.
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when the user prefers reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const canvas = document.createElement('canvas');

    expect(await initHeroScene(canvas)).toBeNull();
  });

  it('returns null when WebGL is unavailable (always true in jsdom)', async () => {
    const canvas = document.createElement('canvas');
    expect(await initHeroScene(canvas)).toBeNull();
  });
});
