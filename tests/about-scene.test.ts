import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initAboutScene, computeTiltTarget } from '../src/lib/about-scene';

describe('computeTiltTarget', () => {
  it('tilts toward the pointer when it is active', () => {
    const result = computeTiltTarget(true, 0.5, -0.5, 0);
    expect(result.targetY).toBeCloseTo(0.2);
    expect(result.targetX).toBeCloseTo(0.15);
  });

  it('returns near-zero tilt for a centered pointer while active', () => {
    const result = computeTiltTarget(true, 0, 0, 0);
    expect(result.targetY).toBe(0);
    expect(result.targetX).toBeCloseTo(0);
  });

  it('drifts on a slow idle cycle when the pointer is not active', () => {
    const result = computeTiltTarget(false, 0, 0, 0);
    expect(result.targetY).toBeCloseTo(Math.sin(0) * 0.12);
    expect(result.targetX).toBeCloseTo(Math.cos(0) * 0.06);
  });

  it('idle drift changes over elapsed time', () => {
    const early = computeTiltTarget(false, 0, 0, 1);
    const later = computeTiltTarget(false, 0, 0, 5);
    expect(early).not.toEqual(later);
  });

  it('ignores pointer position entirely while inactive', () => {
    const withPointer = computeTiltTarget(false, 0.9, 0.9, 2);
    const withoutPointer = computeTiltTarget(false, -0.9, -0.9, 2);
    expect(withPointer).toEqual(withoutPointer);
  });
});

describe('initAboutScene', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when the user prefers reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const canvas = document.createElement('canvas');

    expect(await initAboutScene(canvas, '/assets/img/mahmoud-mohamed.jpg')).toBeNull();
  });

  it('returns null when WebGL is unavailable (always true in jsdom)', async () => {
    const canvas = document.createElement('canvas');
    expect(await initAboutScene(canvas, '/assets/img/mahmoud-mohamed.jpg')).toBeNull();
  });
});
