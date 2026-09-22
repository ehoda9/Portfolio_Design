import { describe, it, expect } from 'vitest';
import { formatPostBreakdown, parseEditorMode } from '../src/lib/admin-dashboard';

describe('parseEditorMode', () => {
  it('returns null for the dashboard (no post param)', () => {
    expect(parseEditorMode('')).toBeNull();
  });

  it('returns new mode for ?post=new', () => {
    expect(parseEditorMode('?post=new')).toEqual({ mode: 'new' });
  });

  it('returns edit mode with the parsed id for ?post=<id>', () => {
    expect(parseEditorMode('?post=42')).toEqual({ mode: 'edit', id: 42 });
  });

  it('returns null for a non-numeric, non-"new" post value', () => {
    expect(parseEditorMode('?post=bogus')).toBeNull();
  });

  it('returns null for a zero or negative id', () => {
    expect(parseEditorMode('?post=0')).toBeNull();
    expect(parseEditorMode('?post=-5')).toBeNull();
  });

  it('returns null for a non-integer id', () => {
    expect(parseEditorMode('?post=4.5')).toBeNull();
  });

  it('ignores unrelated query params', () => {
    expect(parseEditorMode('?foo=bar&post=7')).toEqual({ mode: 'edit', id: 7 });
  });
});

describe('formatPostBreakdown', () => {
  it('formats both counts', () => {
    expect(formatPostBreakdown(3, 2)).toBe('3 published, 2 draft');
  });

  it('formats zero counts', () => {
    expect(formatPostBreakdown(0, 0)).toBe('0 published, 0 draft');
  });
});
