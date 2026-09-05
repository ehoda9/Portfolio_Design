import { describe, it, expect } from 'vitest';
import { computePointerPercent } from '../src/lib/spotlight';

const rect = { left: 100, top: 50, width: 200, height: 100 };

describe('computePointerPercent', () => {
  it('returns 0,0 at the top-left corner', () => {
    expect(computePointerPercent(rect, 100, 50)).toEqual({ x: 0, y: 0 });
  });

  it('returns 100,100 at the bottom-right corner', () => {
    expect(computePointerPercent(rect, 300, 150)).toEqual({ x: 100, y: 100 });
  });

  it('returns 50,50 at the center', () => {
    expect(computePointerPercent(rect, 200, 100)).toEqual({ x: 50, y: 50 });
  });

  it('falls back to 50 on the x axis for a zero-width rect', () => {
    expect(computePointerPercent({ ...rect, width: 0 }, 200, 100).x).toBe(50);
  });

  it('falls back to 50 on the y axis for a zero-height rect', () => {
    expect(computePointerPercent({ ...rect, height: 0 }, 200, 100).y).toBe(50);
  });
});
