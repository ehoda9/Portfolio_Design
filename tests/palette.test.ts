import { describe, it, expect, beforeEach } from 'vitest';
import { applyPalette, getStoredPalette, isValidPalette } from '../src/lib/palette';

describe('isValidPalette', () => {
  it('accepts known palette ids', () => {
    expect(isValidPalette('1')).toBe(true);
    expect(isValidPalette('2')).toBe(true);
    expect(isValidPalette('3')).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isValidPalette('4')).toBe(false);
    expect(isValidPalette('purple')).toBe(false);
    expect(isValidPalette(null)).toBe(false);
    expect(isValidPalette('')).toBe(false);
  });
});

describe('getStoredPalette / applyPalette', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-palette');
  });

  it('defaults to palette 1 when nothing is stored', () => {
    expect(getStoredPalette()).toBe('1');
  });

  it('defaults to palette 1 when the stored value is invalid', () => {
    window.localStorage.setItem('portfolio-palette', 'not-a-palette');
    expect(getStoredPalette()).toBe('1');
  });

  it('applies a valid palette to the document and persists it', () => {
    applyPalette('2');
    expect(document.documentElement.getAttribute('data-palette')).toBe('2');
    expect(getStoredPalette()).toBe('2');
  });

  it('does nothing for an invalid palette id', () => {
    applyPalette('1');
    applyPalette('bogus');
    expect(document.documentElement.getAttribute('data-palette')).toBe('1');
    expect(getStoredPalette()).toBe('1');
  });
});
