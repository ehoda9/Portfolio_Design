import { describe, it, expect } from 'vitest';
import { shouldShowPortfolioItem } from '../src/lib/portfolio-filter';

describe('shouldShowPortfolioItem', () => {
  it('shows every item when the filter is "all"', () => {
    expect(shouldShowPortfolioItem('all', 'web')).toBe(true);
    expect(shouldShowPortfolioItem('all', 'game')).toBe(true);
    expect(shouldShowPortfolioItem('all', undefined)).toBe(true);
  });

  it('shows only items matching the active filter', () => {
    expect(shouldShowPortfolioItem('game', 'game')).toBe(true);
    expect(shouldShowPortfolioItem('game', 'web')).toBe(false);
  });

  it('hides items with no category when a specific filter is active', () => {
    expect(shouldShowPortfolioItem('automation', undefined)).toBe(false);
  });
});
