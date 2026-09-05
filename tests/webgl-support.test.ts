import { describe, it, expect, vi, afterEach } from 'vitest';
import { isWebglSupported, prefersReducedMotion } from '../src/lib/webgl-support';

describe('isWebglSupported', () => {
  it('returns false in jsdom (no real WebGL implementation)', () => {
    const canvas = document.createElement('canvas');
    expect(isWebglSupported(canvas)).toBe(false);
  });

  it('returns true when the canvas can produce a webgl2 context', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockImplementation((type: string) =>
      type === 'webgl2' ? ({} as unknown as RenderingContext) : null
    );
    expect(isWebglSupported(canvas)).toBe(true);
  });

  it('falls back to webgl1 when webgl2 is unavailable', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockImplementation((type: string) =>
      type === 'webgl' ? ({} as unknown as RenderingContext) : null
    );
    expect(isWebglSupported(canvas)).toBe(true);
  });

  it('returns false if getContext throws (some locked-down browsers do this)', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockImplementation(() => {
      throw new Error('WebGL disabled');
    });
    expect(isWebglSupported(canvas)).toBe(false);
  });
});

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true when the media query matches', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true })
    );
    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when the media query does not match', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false })
    );
    expect(prefersReducedMotion()).toBe(false);
  });
});
