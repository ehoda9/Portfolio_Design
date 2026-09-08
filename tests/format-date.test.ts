import { describe, it, expect } from 'vitest';
import { formatPublishedDate } from '../src/lib/format-date';

describe('formatPublishedDate', () => {
  it('formats an ISO date as a readable long-form date', () => {
    expect(formatPublishedDate('2026-09-04T02:04:32.539Z')).toBe('September 4, 2026');
  });

  it('formats a date-only ISO string', () => {
    expect(formatPublishedDate('2026-01-01T00:00:00.000Z')).toBe('January 1, 2026');
  });

  it('formats a date at year end correctly', () => {
    expect(formatPublishedDate('2025-12-31T23:59:59.000Z')).toBe('December 31, 2025');
  });
});
