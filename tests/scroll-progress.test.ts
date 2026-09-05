import { describe, it, expect } from 'vitest';
import { computeScrollProgress } from '../src/lib/scroll-progress';

describe('computeScrollProgress', () => {
  it('returns 0 at the top of the page', () => {
    expect(computeScrollProgress(0, 3000, 800)).toBe(0);
  });

  it('returns 100 at the very bottom of the page', () => {
    expect(computeScrollProgress(2200, 3000, 800)).toBe(100);
  });

  it('returns 50 halfway through the scrollable range', () => {
    expect(computeScrollProgress(1100, 3000, 800)).toBe(50);
  });

  it('returns 0 when the page has no scrollable overflow', () => {
    expect(computeScrollProgress(0, 800, 800)).toBe(0);
  });

  it('clamps to 100 even if scrollTop overshoots (elastic scroll on some browsers)', () => {
    expect(computeScrollProgress(5000, 3000, 800)).toBe(100);
  });

  it('clamps to 0 for a negative scrollTop (elastic overscroll at the top)', () => {
    expect(computeScrollProgress(-50, 3000, 800)).toBe(0);
  });
});
